# Aggregation Recipes

`tools/aggregate.py` is the engine that turns PBIX visual specs into SQL, runs against parquet, and returns data shaped for the frontend.

Each visual type has a **recipe**: a method on the `Aggregator` class that parses the visual's projections, builds SQL, runs it, and shapes the rows.

## The data flow for one visual

```
visual spec (JSON from PBIX layout)
  │
  │ projections: {Category: [...], Y: [...], Series: [...]}
  │ visual_filters: [{field, conditions}]
  │
  ▼
Aggregator.build(visual, page_filters)
  │
  ▼ dispatch on visual.type
  │
  ├─► _card()          ┐
  ├─► _xy_series_chart() │   each recipe:
  ├─► _combo_chart()    ├── parses queryrefs
  ├─► _table()          ├── picks fact/dim entities
  ├─► _slicer()         ├── builds JOINs
  └─► _card/xy/combo/table_sliced()  ┘   └── runs SQL, shapes result
  │
  ▼
{shape: "card"|"xy"|"xy_series"|"combo"|"table"|"slicer", ...}
  │
  │ (attached to visual.data)
  ▼
frontend component reads it
```

## Core data shapes

Every recipe returns a dict with a `shape` key that the frontend understands:

### `"card"` — single value
```js
{ shape: "card", value: 92.6, binding: "DATATBL.MAX Curval" }
```

### `"xy"` — single-series bar/line
```js
{ shape: "xy", x: ["A","B","C"], y: [1, 2, 3] }
```

### `"xy_series"` — multi-series bar/line
```js
{
  shape: "xy_series",
  x: ["2024-01", "2024-02", ...],
  series: [
    { name: "CBOD", values: [1.2, 1.3, ...] },
    { name: "TSS",  values: [5.4, 5.6, ...] }
  ]
}
```

### `"combo"` — bar + line on dual axis
```js
{
  shape: "combo",
  x: ["2024-01", ...],
  series: [
    { name: "...", role: "y",  values: [...] },  // bar, left axis
    { name: "...", role: "y2", values: [...] }   // line, right axis
  ]
}
```

### `"table"` — rows and columns
```js
{
  shape: "table",
  columns: ["VARDESC.WWTP", "Sum(LIMITS.LIMIT_VALUE)"],
  rows: [["69th Street", 1209879], ["Almeda Sims", 177298], ...]
}
```

### `"slicer"` — distinct values
```js
{ shape: "slicer", field: "VARDESC.UD3",
  options: ["69th Street", "Almeda Sims", ...] }
```

## Parsing queryRefs

PBIX field references come as strings. `parse_queryref(qr)` returns:

| QueryRef | Parsed |
|---|---|
| `DATATBL.WWTP` | `{kind:"column", entity:"DATATBL", property:"WWTP"}` |
| `Sum(DATATBL.CURVALUE)` | `{kind:"agg", func:"Sum", inner:{kind:"column",entity:"DATATBL",property:"CURVALUE"}}` |
| `DATATBL.DATESTAMP.Variation.Date Hierarchy.Year` | `{kind:"datepart", part:"Year", inner:{...column...}}` |
| `DATATBL.Measure Max AAF%` | `{kind:"column", entity:"DATATBL", property:"Measure Max AAF%"}` ← measure treated as column, handled in SQL generation |
| `fr_If/Ef by WWTP.CURVALUE` | parses as column with `entity="fr_If/Ef by WWTP"`; fallback strips `fr_` prefix if matching a known entity |

## Generating SQL from a queryRef

`qref_to_sql_expr(node, alias_map)`:

| Input | Output |
|---|---|
| `{column, entity=DATATBL, property=WWTP}` with `alias_map["DATATBL"]="t"` | `t."WWTP"` |
| Same but `property=UD3` and entity `VARDESC` | `t."WWTP"` (COLUMN_ALIAS rewrite) |
| `{agg, func=Sum, inner=column}` | `SUM(t."CURVALUE")` |
| Measure column (`property="MAX Curval"`) | `MAX(t."CURVALUE")` (from MEASURE_SQL, with `{t}.` placeholder replaced) |
| Date hierarchy Year | `YEAR(CAST(t."DATESTAMP" AS TIMESTAMP))` |

## COLUMN_ALIAS — M-rename rewrites

M queries renamed some columns. PBIX visuals sometimes bind to the old names. Map:

```python
COLUMN_ALIAS = {
    ("VARDESC", "UD3"):       "WWTP",      # UD3 renamed in M
    ("VARDESC", "SHORTNAME"): "S. NAME",   # SHORTNAME renamed in M
}
```

## MEASURE_SQL — DAX rewrites

DAX measures can't be looked up as columns. We rewrite them to SQL. Placeholder `{t}.` is substituted with the host-table alias at SQL generation time.

Basic aggregations:
```python
("DATATBL", "MAX Curval"):     'MAX({t}."CURVALUE")',
("DATATBL", "Avg_CurValue"):   'AVG({t}."CURVALUE")',
("DATATBL", "25th Percentile"): 'QUANTILE_CONT({t}."CURVALUE", 0.25)',
```

Composite measure:
```python
("DATATBL", "Measure Max AAF%"):
    'MAX({t}."CURVALUE") / NULLIF(AVG({t}."Color Format for Flow"), 0)',
```

**Rolling windows read from precomputed helper columns:**
```python
("DATATBL", "Rolling 3 Months Minimum"):
    'MIN({t}."Rolling 3 Months Minimum_row")',
("DATATBL", "Rolling 3 Months Minimum max per DATESTAMP"):
    'MAX({t}."Rolling 3 Months Minimum_row")',
```
For the 75/90 pages, `Rolling 3 Months Minimum_row` is materialized in `build_data.py`
using a trailing 3-row monthly window, which matches the PBIX "minimum of three
consecutive monthly flows" behavior.

## RELATIONSHIPS — join keys

```python
RELATIONSHIPS = {
    ("LIMITS",  "VARDESC"): ("VARID", "VARID"),
    ("DATATBL", "VARDESC"): ("VARID", "VARID"),
    ("LIMITS",  "DATATBL"): ("VARID", "VARID"),    # PBIX M:M
    ("VARDESC", "LOCATION"): ("LOCID", "LOCID"),
    ("Effluent Flow Limits", "VARDESC"): ("VARID", "VARID"),
    ("FlowPermits_AMAX",     "VARDESC"): ("VARID", "VARID"),
    ("Monthly Flow Permit",  "VARDESC"): ("WWTP",  "WWTP"),
}
```

Recipes check both `(A, B)` and `(B, A)` so direction doesn't matter for lookup.

## Recipe summary

### `_card(visual, page_filters)`

Inputs: `projections.Values = [one measure ref]`.

Builds: `SELECT <agg_expr> AS v FROM <entity> t WHERE <filters>`. Returns `{shape: "card", value: <scalar>}`.

### `_xy_series_chart(visual, page_filters)`

Inputs:
- `projections.Category = [one field]` (X axis)
- `projections.Y = [one or more measures]`
- `projections.Series = [optional field]` (for grouping)

Supports multi-entity: gathers all entities from projections, picks a fact table (`DATATBL` preferred), LEFT JOINs the dimensions via RELATIONSHIPS.

Builds: `SELECT category, [series,] y0 [, y1, ...] FROM fact LEFT JOIN dim ... GROUP BY category [, series]`.

Shapes:
- Single Y, no series → `xy`
- With Series projection → `xy_series` (one series per distinct Series value)
- Multiple Y projections, no Series → `xy_series` (one series per Y measure)

### `_combo_chart(visual, page_filters)`

Like `_xy_series_chart` but reads:
- `projections.Y` (or `ColumnValues`) → `role: "y"` measures (bars)
- `projections.Y2` (or `LineValues`) → `role: "y2"` measures (lines)

Returns `{shape: "combo", x, series: [{name, role, values}]}`.

### `_table(visual, page_filters)`

Inputs: `projections.Values = [N columns/measures]`.

Two paths:
- **Single-entity** → straightforward `SELECT col0, col1, ... FROM entity GROUP BY non-agg-cols`.
- **Multi-entity (2-way)** → picks fact, LEFT JOINs dims, same shape.
- **3+ entities** → returns `None` (unhandled, falls back to placeholder).

### `_slicer(visual, page_filters)`

Inputs: `projections.Values = [one field]`.

Returns `{shape: "slicer", field, options: [distinct values]}`.

## Per-plant slicing

When `aggregate_page()` detects a plant slicer, it calls the `_*_sliced()` variants to produce `data_by_plant`.

Each sliced recipe:
1. Adds the slice field (`VARDESC.WWTP` etc.) to the SELECT and GROUP BY.
2. Runs the single SQL query that returns rows for every plant × combination.
3. Splits the result dict by slice value.

Result: `{ plant_name: <standard-shape data> }` dict, attached as `visual.data_by_plant`.

Frontend picks the current plant's slice via `VisualRouter`'s `projectForPlant()`.

## WHERE clause building

`_build_where(...)` and `_build_where_multi(...)` consolidate visual-level + page-level filters.

Each filter condition comes as a string (e.g. `"v.S. Name 2 IN (Plnt Ef CBOD MAvg, Plnt Ef NH3-N MAvg)"`). `parse_condition()` turns those into:

| Condition string | SQL fragment (with `{a}` placeholder) |
|---|---|
| `v.X IN (a, b, c)` | `{a}."X" IN ('a', 'b', 'c')` |
| `NOT(v.X IN (...))` | `{a}."X" NOT IN (...)` |
| `CONTAINS(v.X, substr)` | `LOWER({a}."X") LIKE LOWER('%substr%')` |

The `{a}` is substituted with the real alias when the WHERE is assembled. Entity-alias hints are hardcoded: `{"d": "DATATBL", "v": "VARDESC", "l": "LIMITS", ...}`.

**Only matches IN / NOT IN / CONTAINS** — more complex filter types (Advanced numeric, Top N, date ranges) silently drop. Logged in `AUDIT.md`.

## Error handling

SQL failures → `{error: "<msg>", sql_attempted: "<truncated>"}` on the visual. Never crashes the build. The frontend falls back to the placeholder.

`aggregate_page()` also catches exceptions from recipe dispatch so one bad visual never kills a page.

## Current coverage (as of last build)

| Visual type | Built | Error | Unhandled |
|---|---:|---:|---:|
| `areaChart` | 75 | 0 | 0 |
| `slicer` | 160 | 0 | 11 |
| `lineClusteredColumnComboChart` | 38 | 12 | 0 |
| `pivotTable` | 31 | 0 | 0 |
| `tableEx` | 21 | 2 | 3 |
| `card` | 19 | 0 | 5 |
| `clusteredColumnChart` | 9 | 0 | 16 |
| `columnChart` | 2 | 1 | 0 |
| `lineStackedColumnComboChart` | 2 | 1 | 0 |
| `hundredPercentStackedColumnChart` | 1 | 0 | 0 |

Run `python tools/audit_pages.py` for the current snapshot + failure patterns.
