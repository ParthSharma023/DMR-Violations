# Data Pipeline

Python scripts under `tools/` transform raw HachWIMS exports into the JSON the browser consumes.

## Three stages

```
raw CSVs ──► tier2 parquet ──► per-page JSON + manifest
            [build_data.py]   [build_pages.py + aggregate.py]
```

Each stage is idempotent and fast enough to re-run in full:
- `build_data.py` ≈ 60 s (reads 5.5 GB CSVs, writes 196 MB parquet)
- `build_pages.py` ≈ 90 s (reads parquet, writes ~23 MB of JSON)

## Stage 1 — `tools/build_data.py`

**Input**:

- `source/exported_csv/*.csv` (10 CSV files from HachWIMS export), or
- live S3 parquet via `--source s3`

**Output**: `build/tier2/*.parquet` (20 files, ZSTD-compressed).

### What happens

1. Register the chosen source tables as DuckDB views.
2. Apply **global filters** to DATATBL and VARDESC:
   - `WWTP NOT IN` ('Bretshire', 'Bretshire WWF', 'Eastheven', 'Northside', 'Northside WWF', 'Scott St.', 'Scott WWF', 'Willow Run', 'SUM 23,BR', 'SUM 69, NS', 'SUM SB, SS, SC')
   - `WWTP IS NOT NULL`
   - `DATATBL.DATESTAMP >= 2005-01-01`
3. Write the 10 filtered base tables to parquet.
4. Compute the **10 DAX-defined virtual tables** as SQL and write to parquet:
   - `KPI Table` — last-3-day per-(WWTP, VARID) slice for Home KPI cards
   - `vt_SelectParams_byWWTP` — 28 curated parameters, daily avg per plant
   - `vt_SCADARainfall_byWWTP` — rainfall + 3-bucket rain category
   - `vt_RegulatoryParameters_byWWTP` — variables tagged for DMR reporting
   - `vt_PlntEFParameters_byWWTP` — effluent parameters (UD1 contains "Plnt ef")
   - `vt_PlntIFParameters_byWWTP` — influent parameters (S. Name 2 contains "Plnt if")
   - `vt_PlntChemicals_byWWTP` — chemical addition variables
   - `vt_PlntElectricity_byWWTP` — electricity usage variables
   - `vt_EfFlow_byWWTP` — effluent flow + 2-hour peak, keyed by Year-Month
   - `Key Lab Data for WWTP` — per-(WWTP, Y, M, D) pivot of flow + BOD/TSS/NH3-N in/out + MLSS/MLVSS
5. Validate violation counts per WWTP against the archived v1 summary. On match → done.

### Important details

- **Case sensitivity**: DuckDB `=` is case-sensitive; DAX `=` on text is case-insensitive. `vt_*` filters that compare `S. Name 2` to exact strings use `LOWER(…)` on both sides.
- **Transient working file**: DuckDB creates `build/tier2/.duckdb` (~1.3 GB) during the build. Script deletes it at the end.
- **Why not Python/pandas**: DATATBL.csv is 2.9 GB. Pandas OOMs on smaller machines. DuckDB streams through it in seconds.

### What's NOT reproduced in build_data.py

We don't re-derive `Violation`, `Limit`, `Compare`, `Categories One`, `Category Two`, `Primary Parameter`, `Color Format for Flow`, `Color Formatting Number`, `75%`, `90%`, etc. These are **materialized in the exported CSVs** (Power BI wrote them during export). We pass them through unchanged.

If a future export is missing these columns, we'd need to reproduce the DAX in SQL. The DAX logic is fully documented at `~/Documents/CoH/context/pbix/04_calculated_columns.md` and `~/Documents/CoH/context/pbix/99_violation_rule.md`.

## Stage 2 — `tools/build_pages.py`

**Input**: `build/tier2/*.parquet` + `tools/model_dump/pages_dump.json` (PBIX layout extraction).

**Output**:
- `app/data/manifest.json` — page index, bookmarks, plants, parameters (loaded once on app boot).
- `app/data/pages/<slug>.json` — one per live page, contains visual specs + aggregated data.

### What happens

1. Load `pages_dump.json` (all 104 pages with their visual specs from the PBIX layout).
2. Identify **live pages**: visibility=0 OR reached by a bookmark. Result: 58 pages.
3. Slugify each page's display name for URL routing.
4. For each live page:
   a. Copy the visual specs (position, type, field bindings, filters).
   b. Resolve action-button targets to local slugs.
   c. Call `aggregate_page()` from `aggregate.py` — computes `data` for each data-bound visual.
   d. If the page has a plant slicer, also computes `data_by_plant` (one slice per WWTP).
   e. Apply `VISUAL_OVERRIDES` — one-off cosmetic/filter tweaks for specific charts.
5. Write `manifest.json` and per-page JSONs.
6. Print aggregation summary (`built_XXX: N`, `error_XXX: N`, `unhandled_XXX: N`).

### `VISUAL_OVERRIDES` — one-off patches

One-off cosmetic/filter tweaks per chart. Each entry:

```python
{
    "page": "<slug>",
    "title_contains": "<substring>",  # case-insensitive match on visual.title
    "apply": lambda visual: ...       # mutate the visual spec in place
}
```

The `apply` function can set:
- `visual.series_labels = ["Capacity Utilized", "Capacity Remaining"]` — renames chart series
- `visual.colors = ["#6aaed6", "#bdbdbd"]` — overrides palette for this chart
- `visual.show_data_labels = True` — enables inline bar labels
- Mutate `visual.data` directly to filter, reshape, etc.

**Use this for cosmetic tweaks before generalizing.** See `docs/COMPONENTS.md` for what each override knob controls.

## Stage 3 — `tools/aggregate.py`

The core engine. Turns a PBIX visual spec (projections + filters) into SQL, runs it against parquet, and returns the shaped data.

**Full recipe details**: `docs/AGGREGATION_RECIPES.md`. High-level:

### QueryRef parsing

PBIX stores field references as strings like:
- `DATATBL.WWTP` — plain column
- `Sum(DATATBL.CURVALUE)` — aggregated measure
- `CountNonNull(DATATBL.Violation)` — count-non-null
- `DATATBL.DATESTAMP.Variation.Date Hierarchy.Year` — year extracted from a date hierarchy
- `DATATBL.Measure Max AAF%` — a DAX measure (not a column) that we rewrite to SQL
- `fr_If/Ef by WWTP.CURVALUE` — PBIX-internal `alias_entity.column` form for non-standard entities

`parse_queryref()` turns these into structured `{kind, entity, property, func, inner, part}` dicts.

### Entity → parquet mapping

`ENTITY_MAP` maps PBIX entity names (e.g. `"WWTP O&M Performace Report"`) to parquet filenames (e.g. `"WWTP_OM_Report.parquet"`). Views are created for each on Aggregator init.

### Column-rename awareness

The M query renames `VARDESC.UD3 → WWTP` and `VARDESC.SHORTNAME → "S. NAME"`. The parquet has the renamed names. But the PBIX visual bindings sometimes still use the OLD names. `COLUMN_ALIAS` catches this and rewrites during SQL generation.

### DAX measure rewrites

PBIX stores some DAX measures as if they were columns (e.g. `DATATBL.MAX Curval`, `DATATBL.Measure Max AAF%`, `DATATBL.Rolling 3 Months Minimum`). `MEASURE_SQL` maps these to SQL expressions using `{t}.` as a placeholder for the host-table alias:

```python
("DATATBL", "Measure Max AAF%"):
    'MAX({t}."CURVALUE") / NULLIF(AVG({t}."Color Format for Flow"), 0)',
```

Rolling measures are precomputed onto `DATATBL` during `build_data.py` as helper columns, then read back through `MEASURE_SQL`. For the 75/90-rule pages, `Rolling 3 Months Minimum` uses a trailing 3-row monthly window so the web app matches the PBIX "three consecutive monthly flows" behavior.

### Relationships for auto-join

`RELATIONSHIPS` encodes the PBIX model's join keys:
```python
("DATATBL", "VARDESC"): ("VARID", "VARID"),
("LIMITS",  "VARDESC"): ("VARID", "VARID"),
("LIMITS",  "DATATBL"): ("VARID", "VARID"),
...
```

When a visual's projections span multiple entities, recipes pick a fact table (DATATBL preferred, then LIMITS, etc.) and auto-JOIN the dimensions.

### Recipe dispatch

`Aggregator.build(visual, page_filters)` dispatches on `visual.type`:
- `card`, `kpi` → `_card`
- `clusteredColumnChart`, `columnChart`, `lineChart`, `areaChart`, `hundredPercentStackedColumnChart` → `_xy_series_chart`
- `lineClusteredColumnComboChart`, `lineStackedColumnComboChart` → `_combo_chart`
- `tableEx`, `pivotTable` → `_table`
- `slicer` → `_slicer`

Unhandled types return `None` and the frontend renders a placeholder.

### Plant slicing

When a page has a plant slicer, `aggregate_page()` also calls `build_sliced()` for each aggregable visual. This adds the plant field to GROUP BY and splits the result dict by plant value, producing `visual.data_by_plant = {plant: data}`.

Separate recipes for sliced variants: `_card_sliced`, `_xy_sliced`, `_combo_sliced`, `_table_sliced`.

### Error handling

If SQL fails, the visual gets `visual.data_error = <message>` and the frontend renders the placeholder. The aggregator itself never crashes the build.

## Rebuild scenarios

| You changed… | Run this |
|---|---|
| `source/exported_csv/*.csv` (new data export) | `build_data.py` then `build_pages.py` |
| live S3 source / S3 mapping | `build_data.py --source s3` then `build_pages.py` |
| `tools/build_data.py` | `build_data.py` then `build_pages.py` |
| `tools/aggregate.py` or `tools/build_pages.py` | `build_pages.py` only |
| `tools/model_dump/pages_dump.json` (re-extracted layout) | `build_pages.py` only |
| `src/*` | `build_frontend_bundle.py` then refresh browser |

## Re-running the PBIX extraction

The PBIX extractors (`tools/probe.py`, `extract_model.py`, `extract_layout.py`) were run once to produce `tools/model_dump/*.json`. They're idempotent — rerun if the PBIX file changes upstream.

Downstream docs (`~/Documents/CoH/context/pbix/00_overview.md` through `99_violation_rule.md`) are hand-written from that extraction.

`tools/generate_layout_docs.py` regenerates the `10_pages_index.md`, `11_pages_detail.md`, `12_visual_types.md`, `13_interactivity.md`, and `14_filters.md` from `pages_dump.json`. Rerun if the extraction changes.
