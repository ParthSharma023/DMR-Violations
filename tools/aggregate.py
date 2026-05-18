"""Phase 5D — visual-level data aggregation.

Takes a visual spec (projections + filters) and produces the data payload
the frontend needs to render it. Uses DuckDB against the tier2 parquet files.

Strategy:
  - A small SQL generator handles the most common visual patterns (bar, line,
    area, table, card, KPI, slicer options).
  - Each pattern function returns a `{"data": ..., "shape": ...}` dict or None
    if the visual can't be aggregated yet.
  - Visuals we can't handle return `None` and keep rendering as placeholders.

This is intentionally small and pragmatic. We iterate — cover 80% first,
handle edge cases in later passes.
"""
from pathlib import Path
from datetime import datetime, timedelta
import duckdb, json, re
from collections import defaultdict

ROOT  = Path(__file__).resolve().parent.parent
TIER2 = ROOT / "build" / "tier2"

# Entity name → parquet file. Covers all the model's real tables.
ENTITY_MAP = {
    "DATATBL":                      "DATATBL.parquet",
    "VARDESC":                      "VARDESC.parquet",
    "LIMITS":                       "LIMITS.parquet",
    "LOCATION":                     "LOCATION.parquet",
    "VAREQ":                        "VAREQ.parquet",
    "FlowPermits_AMAX":             "FlowPermits_AMAX.parquet",
    "Monthly Flow Permit":          "Monthly_Flow_Permit.parquet",
    "Refresh_DateTime":             "Refresh_DateTime.parquet",
    "Effluent Flow Limits":         "Effluent_Flow_Limits.parquet",
    "WWTP O&M Performace Report":   "WWTP_OM_Report.parquet",
    "WWTP Attributes":              "WWTP_OM_Report.parquet",  # alias sometimes used
    "KPI Table":                    "KPI_Table.parquet",
    "Key Lab Data for WWTP":        "Key_Lab_Data.parquet",
    "vt_SelectParams_byWWTP":       "vt_SelectParams_byWWTP.parquet",
    "vt_SCADARainfall_byWWTP":      "vt_SCADARainfall_byWWTP.parquet",
    "vt_RegulatoryParameters_byWWTP": "vt_RegulatoryParameters_byWWTP.parquet",
    "vt_PlntIFParameters_byWWTP":   "vt_PlntIFParameters_byWWTP.parquet",
    "vt_PlntEFParameters_byWWTP":   "vt_PlntEFParameters_byWWTP.parquet",
    "vt_PlntChemicals_byWWTP":      "vt_PlntChemicals_byWWTP.parquet",
    "vt_PlntElectricity_byWWTP":    "vt_PlntElectricity_byWWTP.parquet",
    "vt_EfFlow_byWWTP":             "vt_EfFlow_byWWTP.parquet",
}

# Aggregation function names the PBIX uses, mapped to SQL.
AGG_SQL = {
    "Sum":           "SUM",
    "Avg":           "AVG",
    "CountNonNull":  "COUNT",
    "Count":         "COUNT",
    "Min":           "MIN",
    "Max":           "MAX",
    "DistinctCount": "COUNT(DISTINCT",
    "Median":        "MEDIAN",
    "StdDev":        "STDDEV",
    "Var":           "VAR_POP",
}

# Column renames done in M queries — projections use old names, parquet has new
COLUMN_ALIAS = {
    ("VARDESC", "UD3"):         "WWTP",            # renamed in M
    ("VARDESC", "SHORTNAME"):   "S. NAME",         # renamed in M
    ("LIMITS",  "GPM2MGD"):     "LIMIT_VALUE_MGD", # renamed in parquet
    # DATATBL.Date is the same column as DATESTAMP but exported as DOUBLE
    # (Excel serial number). Redirect to the proper DATE-typed DATESTAMP column.
    ("DATATBL", "Date"):        "DATESTAMP",
}

# When a filter targets an entity that's NOT in the query's FROM/JOINs, but the
# denormalized equivalent column EXISTS on an available entity, rewrite.
# Saves us from having to add a JOIN just for filtering. DATATBL has VARDESC's
# WWTP, Name, Short Name, S Name 2 columns denormalized via LOOKUPVALUE in DAX.
#
# Map: (filter_entity, filter_property) -> (available_entity, target_property)
FILTER_REWRITE = {
    ("VARDESC", "NAME"):       ("DATATBL", "Name"),
    ("VARDESC", "S. NAME"):    ("DATATBL", "Short Name"),
    ("VARDESC", "S. Name 2"):  ("DATATBL", "S Name 2"),
    ("VARDESC", "WWTP"):       ("DATATBL", "WWTP"),
    ("VARDESC", "UD3"):        ("DATATBL", "WWTP"),
}

# DAX measures on DATATBL (and other tables) — rewritten as SQL expressions.
# Use {t}. as a placeholder for the host-table alias; qref_to_sql_expr substitutes it.
MEASURE_SQL = {
    # basic aggregations
    ("DATATBL", "MAX Curval"):      'MAX({t}."CURVALUE")',
    ("DATATBL", "Min Curval"):      'MIN({t}."CURVALUE")',
    ("DATATBL", "Average Curval"):  'AVG({t}."CURVALUE")',
    ("DATATBL", "Avg_CurValue"):    'AVG({t}."CURVALUE")',
    ("DATATBL", "AVG_Calc"):        'AVG({t}."CURVALUE")',
    ("DATATBL", "Max AAF"):         'MAX({t}."CURVALUE")',
    # percentiles
    ("DATATBL", "25th Percentile"):  'QUANTILE_CONT({t}."CURVALUE", 0.25)',
    ("DATATBL", "50th Percentile"):  'QUANTILE_CONT({t}."CURVALUE", 0.50)',
    ("DATATBL", "75th Percentile"):  'QUANTILE_CONT({t}."CURVALUE", 0.75)',
    ("DATATBL", "95th Percentile"):  'QUANTILE_CONT({t}."CURVALUE", 0.95)',
    ("DATATBL", "99th Percentile"):  'QUANTILE_CONT({t}."CURVALUE", 0.99)',
    ("DATATBL", "100th Percentile"): 'MAX({t}."CURVALUE")',
    ("DATATBL", "STDEV.P"):          'STDDEV_POP({t}."CURVALUE")',
    ("DATATBL", "STDEV.S"):          'STDDEV_SAMP({t}."CURVALUE")',
    ("DATATBL", "CurValue_Record_Count"): 'COUNT(DISTINCT {t}."Name")',
    # "Measure Max AAF%" = MAX(CURVALUE) / AVG("Color Format for Flow") — permit-saturation ratio
    ("DATATBL", "Measure Max AAF%"):
        'MAX({t}."CURVALUE") / NULLIF(AVG({t}."Color Format for Flow"), 0)',
    # Rolling measures — use PRE-COMPUTED columns from build_data.py.
    # Each DATATBL row has Rolling*_row already materialized via SQL window functions.
    # DAX semantics: "Rolling 3 Months Minimum" returns a scalar for the current filter
    # context (trailing 3mo min at the latest date). The per-row column gives us exact
    # per-date rolling mins. The aggregate over those follows the PBIX's outer context.
    ("DATATBL", "Rolling 3 Months Minimum"):
        'MIN({t}."Rolling 3 Months Minimum_row")',
    ("DATATBL", "Rolling 3 Months Minimum max per DATESTAMP"):
        'MAX({t}."Rolling 3 Months Minimum_row")',
    ("DATATBL", "Rolling 30 day Average"):
        'MAX({t}."Rolling 30 day Average_row")',
    ("DATATBL", "Rolling 3 Months Minimum max per DATESTAMP divided by Color Format for Flow"):
        'MAX({t}."Rolling 3 Months Minimum_row") / NULLIF(AVG({t}."Color Format for Flow"), 0)',
    ("DATATBL", "Color Format for Flow % difference from Rolling 3 Months Minimum max per DATESTAMP"):
        '(AVG({t}."Color Format for Flow") - MAX({t}."Rolling 3 Months Minimum_row")) / NULLIF(MAX({t}."Rolling 3 Months Minimum_row"), 0)',
    ("DATATBL", "Average of Color Format for Flow minus Max of CURVALUE"):
        'AVG({t}."Color Format for Flow") - MAX({t}."CURVALUE")',
}

# Canonical date-range windows for the date-slicer wiring. Each tuple is
# (key, human label, days-back from anchor). "all_time" is the no-filter
# baseline — reuses the unfiltered data instead of re-running a query.
# Days rather than INTERVAL literals so we can compute a literal cut-off
# in Python: literal comparisons get parquet row-group pruning,
# INTERVAL-expression comparisons don't.
DATE_RANGES = [
    ("last_30_days",   "Last 30 days",   30),
    ("last_90_days",   "Last 90 days",   90),
    ("last_12_months", "Last 12 months", 365),
    ("last_5_years",   "Last 5 years",   365 * 5),
    ("all_time",       "All time",       None),
]

# Pages that get data_by_date_range precompute. Scoped to stakeholder priority
# pages for now — other date-slicer pages stay un-wired. Extend as needed.
DATE_RANGE_PAGES = {
    "tables-permitted-capacity-evaluation-pbi",
    "ef-flow-permit-eval",
    "permit-evaluation-aaf",
    "permit-evaluation-7590",
    "ef-flow-aaf-maf",
    "dt-daily-effluent-flow",
    "statistical-flows",
    "permitted-aaf-vs-dmr",
}

# Known relationships for auto-joining when projections span multiple entities
RELATIONSHIPS = {
    # (from_entity, to_entity): (from_col, to_col)
    ("LIMITS",  "VARDESC"):  ("VARID",  "VARID"),
    ("DATATBL", "VARDESC"):  ("VARID",  "VARID"),
    ("LIMITS",  "DATATBL"):  ("VARID",  "VARID"),   # PBIX M:M on VARID
    ("VARDESC", "LOCATION"): ("LOCID",  "LOCID"),
    ("Effluent Flow Limits", "VARDESC"): ("VARID", "VARID"),
    ("FlowPermits_AMAX",     "VARDESC"): ("VARID", "VARID"),
    ("Monthly Flow Permit",  "VARDESC"): ("WWTP",  "WWTP"),
}

# ── QueryRef parser ────────────────────────────────────────────────

def parse_queryref(qr):
    """Parse a PBIX queryRef into a structured description.

    Examples:
      DATATBL.WWTP                                    -> column
      Sum(DATATBL.CURVALUE)                           -> agg
      CountNonNull(DATATBL.Violation)                 -> agg
      DATATBL.DATESTAMP.Variation.Date Hierarchy.Year -> datepart
      VARDESC.S. Name 2 (groups)                      -> column (name has parens + dots)
    """
    if qr is None: return None
    qr = qr.strip()

    # Aggregation: FuncName( ... )
    m = re.match(r"^([A-Za-z]+)\((.+)\)$", qr)
    if m and m.group(1) in AGG_SQL:
        return {"kind": "agg", "func": m.group(1), "inner": parse_queryref(m.group(2))}

    # Date hierarchy
    if ".Variation.Date Hierarchy." in qr:
        base, part = qr.rsplit(".Variation.Date Hierarchy.", 1)
        return {"kind": "datepart", "part": part, "inner": parse_queryref(base)}

    # Plain column — split on LAST dot (handles entities with dots/spaces)
    if "." in qr:
        entity, prop = qr.rsplit(".", 1)
        # PBIX sometimes prefixes queryRefs with an alias like "fr_" — strip it
        # when the remaining entity matches a known table.
        if entity not in ENTITY_MAP:
            stripped = re.sub(r"^[a-z]+_", "", entity)
            if stripped in ENTITY_MAP:
                entity = stripped
        return {"kind": "column", "entity": entity, "property": prop}

    return {"kind": "literal", "value": qr}

def qref_entity(qr_node):
    """Extract the root entity from a parsed queryRef node."""
    if qr_node is None: return None
    if qr_node["kind"] == "column": return qr_node["entity"]
    if qr_node["kind"] == "agg":    return qref_entity(qr_node["inner"])
    if qr_node["kind"] == "datepart": return qref_entity(qr_node["inner"])
    return None

def qref_to_sql_expr(qr_node, alias_map):
    """Convert a parsed queryRef into a SQL expression (using the table alias).

    alias_map: { entity_name: table_alias }  (alias used in the FROM clause)
    Handles column renames and DAX-measure rewrites.
    """
    if qr_node is None: return None
    k = qr_node["kind"]
    if k == "column":
        entity = qr_node["entity"]
        prop = qr_node["property"]
        a = alias_map.get(entity)
        if a is None: return None
        # DAX measure rewrites — substitute {t}. with the real alias.
        # Measures use {t}."ColumnName" as their placeholder for the host table.
        if (entity, prop) in MEASURE_SQL:
            expr = MEASURE_SQL[(entity, prop)]
            # {t}. → alias.   (all column references go through this placeholder)
            return expr.replace("{t}.", f"{a}.")
        # Column aliasing (M-renamed cols)
        if (entity, prop) in COLUMN_ALIAS:
            prop = COLUMN_ALIAS[(entity, prop)]
        return f'{a}."{prop}"'
    if k == "agg":
        inner = qref_to_sql_expr(qr_node["inner"], alias_map)
        if inner is None: return None
        fn = AGG_SQL[qr_node["func"]]
        if fn.endswith("("):  # DistinctCount
            return f"{fn} {inner})"
        return f"{fn}({inner})"
    if k == "datepart":
        # Redirect DATATBL.Date → DATATBL.DATESTAMP. They hold the same value
        # (calc column Date = DATATBL[DATESTAMP]) but parquet stores Date as
        # DOUBLE because the CSV had serial-number dates, while DATESTAMP is
        # proper DATE type. Prevents "Unimplemented cast DOUBLE → TIMESTAMP".
        inner_node = qr_node["inner"]
        if (isinstance(inner_node, dict) and inner_node.get("kind") == "column"
                and inner_node.get("entity") == "DATATBL"
                and inner_node.get("property") == "Date"):
            inner_node = {**inner_node, "property": "DATESTAMP"}
        inner = qref_to_sql_expr(inner_node, alias_map)
        if inner is None: return None
        part = qr_node["part"].lower()
        if part == "year":    return f"YEAR({inner})"
        if part == "quarter": return f"QUARTER({inner})"
        if part == "month":   return f"MONTH({inner})"
        if part == "day":     return f"DAY({inner})"
        if part == "date":    return f"CAST({inner} AS DATE)"
    return None


# ── Filter parser ──────────────────────────────────────────────────

def parse_condition(cond_str):
    """Parse a rendered filter-condition string into (entity_alias_hint, fragment_tmpl).

    fragment_tmpl contains `{a}.` placeholders where the table alias should go.
    The caller substitutes `{a}` with the real alias before use.

    Handles IN, NOT-IN, and CONTAINS patterns (the most common in this PBIX).
    Unknown patterns return None, so the filter is safely dropped.
    """
    if not cond_str: return None

    m = re.match(r"^([a-z]+)\.(.+?)\s+IN\s+\((.+)\)$", cond_str)
    if m:
        alias, prop, vals_s = m.group(1), m.group(2), m.group(3)
        vals = [v.strip().rstrip("L") for v in vals_s.split(", ")]
        vals_sql = ", ".join(f"'{v}'" for v in vals if v)
        return alias, prop, f'{{a}}."{prop}" IN ({vals_sql})'

    m = re.match(r"^NOT\(([a-z]+)\.(.+?)\s+IN\s+\((.+)\)\)$", cond_str)
    if m:
        alias, prop, vals_s = m.group(1), m.group(2), m.group(3)
        vals = [v.strip().rstrip("L") for v in vals_s.split(", ")]
        vals_sql = ", ".join(f"'{v}'" for v in vals if v)
        return alias, prop, f'{{a}}."{prop}" NOT IN ({vals_sql})'

    # CONTAINS(v.S. NAME, CBOD) — case-insensitive substring
    m = re.match(r"^CONTAINS\(([a-z]+)\.(.+?),\s*(.+)\)$", cond_str)
    if m:
        alias, prop, needle = m.group(1), m.group(2), m.group(3)
        needle_esc = needle.replace("'", "''")
        return alias, prop, f'LOWER({{a}}."{prop}") LIKE LOWER(\'%{needle_esc}%\')'

    # NOT(CONTAINS(v.prop, needle)) — negative substring
    m = re.match(r"^NOT\(CONTAINS\(([a-z]+)\.(.+?),\s*(.+)\)\)$", cond_str)
    if m:
        alias, prop, needle = m.group(1), m.group(2), m.group(3)
        needle_esc = needle.replace("'", "''")
        return alias, prop, f'LOWER({{a}}."{prop}") NOT LIKE LOWER(\'%{needle_esc}%\')'

    # Compound: (condA) OR (condB) [ OR (condC) ... ] — same alias.prop.
    # PBIX "Advanced filter, Match OR" with multiple CONTAINS on one field.
    if cond_str.startswith("(") and cond_str.endswith(")"):
        inner = cond_str[1:-1]
        # Split on top-level `) OR (` — no nesting expected in practice here.
        parts = re.split(r"\)\s+OR\s+\(", inner)
        if len(parts) >= 2:
            sub = [parse_condition(p) for p in parts]
            if all(sub) and len({(a, p) for a, p, _ in sub}) == 1:
                a, p, _ = sub[0]
                joined = " OR ".join(f"({frag})" for _, _, frag in sub)
                return a, p, f"({joined})"

    # DateSpan comparison: l.ENDDATE>{'DateSpan': {'Expression': {'Literal':
    # {'Value': "datetime'2020-03-01T00:00:00'"}}}  (ugly PBIX serialization).
    # Extract the operator and the ISO date, emit a clean DATE literal comparison.
    m = re.match(r"^([a-z]+)\.(.+?)\s*([<>]=?)\s*\{.*?datetime'(\d{4}-\d{2}-\d{2})", cond_str)
    if m:
        alias, prop, op, date = m.group(1), m.group(2), m.group(3), m.group(4)
        return alias, prop, f'{{a}}."{prop}" {op} DATE \'{date}\''

    return None


# ── Recipes ────────────────────────────────────────────────────────

class Aggregator:
    def __init__(self, con):
        self.con = con
        # Register all tier2 parquet files as DuckDB views with readable names
        for entity, fname in ENTITY_MAP.items():
            safe = re.sub(r"\W+", "_", entity).strip("_").lower()
            self.con.execute(f"""
                CREATE OR REPLACE VIEW v_{safe} AS
                SELECT * FROM '{TIER2 / fname}'
            """)
        self.view_of = {
            entity: f"v_{re.sub(r'W+', '_', entity).strip('_').lower()}"
            for entity in ENTITY_MAP
        }
        # Simpler mapping built from the loop
        self.view_of = {}
        for entity in ENTITY_MAP:
            safe = re.sub(r"\W+", "_", entity).strip("_").lower()
            self.view_of[entity] = f"v_{safe}"
        # Set by aggregate_page when producing date-range slices. Tuple of
        # (target_entity, fragment_template) where fragment uses {a} for alias.
        self._extra_filter = None

    def build(self, visual, page_filters):
        """Dispatch to the appropriate recipe based on visual type."""
        t = visual["type"]
        if t in ("clusteredColumnChart", "columnChart", "lineChart", "areaChart",
                 "hundredPercentStackedColumnChart"):
            return self._xy_series_chart(visual, page_filters)
        if t in ("lineClusteredColumnComboChart", "lineStackedColumnComboChart"):
            return self._combo_chart(visual, page_filters)
        if t == "tableEx":
            return self._table(visual, page_filters)
        if t == "pivotTable":
            # Pivot with Rows + Columns projections → proper matrix.
            proj = visual.get("projections") or {}
            if (proj.get("Rows") or proj.get("Columns")) and proj.get("Values"):
                return self._pivot(visual, page_filters)
            return self._table(visual, page_filters)  # fall back to flat
        if t == "card":
            return self._card(visual, page_filters)
        if t == "kpi":
            return self._card(visual, page_filters)  # same shape for now
        if t == "slicer":
            return self._slicer(visual, page_filters)
        return None  # unhandled → placeholder

    # ── Sliced aggregation ────────────────────────────────────────
    # For pages with a plant slicer, produce { plant -> data } so the
    # frontend can filter without a round-trip.
    def build_sliced(self, visual, page_filters, slice_field, slice_values):
        t = visual["type"]
        # We only handle card / XY / combo / single-entity table in slice mode.
        if t in ("card", "kpi"):
            return self._card_sliced(visual, page_filters, slice_field)
        if t in ("clusteredColumnChart", "columnChart", "lineChart", "areaChart",
                 "hundredPercentStackedColumnChart"):
            return self._xy_sliced(visual, page_filters, slice_field)
        if t in ("lineClusteredColumnComboChart", "lineStackedColumnComboChart"):
            return self._combo_sliced(visual, page_filters, slice_field)
        if t == "tableEx":
            return self._table_sliced(visual, page_filters, slice_field)
        if t == "pivotTable":
            return self._pivot_sliced(visual, page_filters, slice_field)
        return None

    def _pivot_sliced(self, visual, page_filters, slice_field):
        """Run the pivot recipe with the slice field added as an extra grouping
        dimension, then split by slice value."""
        proj = visual.get("projections") or {}
        row_refs = proj.get("Rows") or []
        col_refs = proj.get("Columns") or []
        val_refs = proj.get("Values") or []
        if not (row_refs or col_refs) or not val_refs: return None

        rows = [parse_queryref(r) for r in row_refs]
        cols = [parse_queryref(r) for r in col_refs]
        val  = parse_queryref(val_refs[0])

        slice_entity = slice_field.rsplit(".", 1)[0]
        ents = {qref_entity(p) for p in rows + cols + [val] if p}
        ents.add(slice_entity)
        ents.discard(None)
        if any(e not in ENTITY_MAP for e in ents): return None

        FACT_ORDER = ["DATATBL", "LIMITS", "FlowPermits_AMAX", "Monthly Flow Permit"]
        fact = next((e for e in FACT_ORDER if e in ents), None) or next(iter(ents))
        dims = ents - {fact}
        for d in dims:
            if (fact, d) not in RELATIONSHIPS and (d, fact) not in RELATIONSHIPS:
                return None

        alias_map = {fact: "f"}
        joins = []
        for i, d in enumerate(dims):
            a = f"d{i}"
            alias_map[d] = a
            if (fact, d) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(fact, d)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON f."{fc}" = {a}."{dc}"')
            else:
                dc, fc = RELATIONSHIPS[(d, fact)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON {a}."{dc}" = f."{fc}"')

        row_sqls = [qref_to_sql_expr(r, alias_map) for r in rows]
        col_sqls = [qref_to_sql_expr(c, alias_map) for c in cols]
        val_sql  = qref_to_sql_expr(val, alias_map)
        _, slice_sql = self._slice_sql(slice_field, alias_map)
        if not slice_sql or not val_sql or any(s is None for s in row_sqls + col_sqls):
            return None

        select = [f"{slice_sql} AS slice"]
        group_by = [slice_sql]
        for i, s in enumerate(row_sqls):
            select.append(f"{s} AS r{i}"); group_by.append(s)
        for i, s in enumerate(col_sqls):
            select.append(f"{s} AS c{i}"); group_by.append(s)
        select.append(f"{val_sql} AS v")

        where_parts = self._build_where_multi(visual, page_filters, alias_map)
        sql = f"""
            SELECT {", ".join(select)}
            FROM {self.view_of[fact]} f
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            GROUP BY {", ".join(group_by)}
            ORDER BY 1, {", ".join(group_by[1:])}
            LIMIT 20000
        """
        try:
            db_rows = self.con.execute(sql).fetchall()
        except Exception:
            return None

        from collections import defaultdict as dd
        by_slice = dd(list)
        n_rows = len(row_sqls); n_cols = len(col_sqls)
        for rec in db_rows:
            by_slice[rec[0]].append(rec[1:])

        def _sortkey(t):
            out = []
            for x in t:
                if isinstance(x, (int, float)): out.append((0, x))
                elif x is None:                 out.append((1, ""))
                else:
                    try: out.append((0, float(x)))
                    except (TypeError, ValueError): out.append((2, str(x)))
            return tuple(out)

        out = {}
        for slice_val, recs in by_slice.items():
            if slice_val is None: continue
            row_seen = set()
            col_seen = set()
            cell = {}
            for rec in recs:
                rk = tuple(rec[:n_rows])
                ck = tuple(rec[n_rows:n_rows + n_cols])
                v  = rec[n_rows + n_cols]
                row_seen.add(rk); col_seen.add(ck)
                cell[(rk, ck)] = v
            row_keys = sorted(row_seen, key=_sortkey)
            col_keys = sorted(col_seen, key=_sortkey)
            col_headers = [" / ".join(str(x) if x is not None else "" for x in ck) for ck in col_keys]
            matrix = [[cell.get((rk, ck)) for ck in col_keys] for rk in row_keys]
            out[str(slice_val)] = {
                "shape": "pivot",
                "row_fields": row_refs,
                "col_fields": col_refs,
                "value_field": val_refs[0],
                "row_labels": [list(rk) for rk in row_keys],
                "col_labels": col_headers,
                "matrix": matrix,
            }
        return out

    # Helper: translate a slice_field like "VARDESC.WWTP" or "VARDESC.UD3" into
    # a SQL expression against the given alias map. Applies COLUMN_ALIAS.
    def _slice_sql(self, slice_field, alias_map):
        entity, prop = slice_field.rsplit(".", 1)
        if (entity, prop) in COLUMN_ALIAS:
            prop = COLUMN_ALIAS[(entity, prop)]
        a = alias_map.get(entity)
        if a is None:
            # Try to add the entity via join: only VARDESC/DATATBL supported
            return None, None
        return a, f'{a}."{prop}"'

    def _card_sliced(self, visual, page_filters, slice_field):
        proj = visual.get("projections") or {}
        val_refs = proj.get("Values") or []
        if not val_refs: return None
        p = parse_queryref(val_refs[0])
        entity = qref_entity(p)
        if entity not in ENTITY_MAP: return None

        # Ensure slice field's entity is in alias map (join if needed)
        alias = "t"
        alias_map = {entity: alias}
        slice_entity = slice_field.rsplit(".", 1)[0]
        joins = []
        if slice_entity != entity:
            if (entity, slice_entity) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(entity, slice_entity)]
                alias_map[slice_entity] = "s"
                joins.append(f'LEFT JOIN {self.view_of[slice_entity]} s ON {alias}."{fc}" = s."{dc}"')
            elif (slice_entity, entity) in RELATIONSHIPS:
                dc, fc = RELATIONSHIPS[(slice_entity, entity)]
                alias_map[slice_entity] = "s"
                joins.append(f'LEFT JOIN {self.view_of[slice_entity]} s ON s."{dc}" = {alias}."{fc}"')
            else:
                return None

        _, slice_sql = self._slice_sql(slice_field, alias_map)
        val_sql = qref_to_sql_expr(p, alias_map)
        if not slice_sql or not val_sql: return None
        where_parts = self._build_where_multi(visual, page_filters, alias_map)
        sql = f"""
            SELECT {slice_sql} AS slice, {val_sql} AS v
            FROM {self.view_of[entity]} {alias}
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            GROUP BY {slice_sql}
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception:
            return None
        out = {}
        for slice_val, v in rows:
            if slice_val is None: continue
            out[str(slice_val)] = {"shape": "card", "value": v,
                                   "binding": val_refs[0]}
        return out

    def _xy_sliced(self, visual, page_filters, slice_field):
        proj = visual.get("projections") or {}
        cat_refs = proj.get("Category") or proj.get("X") or []
        y_refs   = proj.get("Y") or proj.get("Values") or []
        ser_refs = proj.get("Series") or proj.get("Legend") or []
        if not cat_refs or not y_refs: return None

        cat = parse_queryref(cat_refs[0])
        ys  = [parse_queryref(r) for r in y_refs]
        ser = parse_queryref(ser_refs[0]) if ser_refs else None

        ents = {qref_entity(cat)}
        ents.update(qref_entity(y) for y in ys)
        if ser: ents.add(qref_entity(ser))
        ents.discard(None)
        slice_entity = slice_field.rsplit(".", 1)[0]
        ents.add(slice_entity)
        if any(e not in ENTITY_MAP for e in ents): return None

        FACT_ORDER = ["DATATBL", "LIMITS", "FlowPermits_AMAX", "Monthly Flow Permit",
                      "Effluent Flow Limits"]
        fact = next((e for e in FACT_ORDER if e in ents), None) or next(iter(ents))
        dims = ents - {fact}
        for d in dims:
            if (fact, d) not in RELATIONSHIPS and (d, fact) not in RELATIONSHIPS:
                return None

        alias_map = {fact: "f"}
        joins = []
        for i, d in enumerate(dims):
            a = f"d{i}"
            alias_map[d] = a
            if (fact, d) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(fact, d)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON f."{fc}" = {a}."{dc}"')
            else:
                dc, fc = RELATIONSHIPS[(d, fact)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON {a}."{dc}" = f."{fc}"')

        cat_sql = qref_to_sql_expr(cat, alias_map)
        y_sqls  = [qref_to_sql_expr(y, alias_map) for y in ys]
        ser_sql = qref_to_sql_expr(ser, alias_map) if ser else None
        _, slice_sql = self._slice_sql(slice_field, alias_map)
        if not cat_sql or any(s is None for s in y_sqls) or not slice_sql: return None

        where_parts = self._build_where_multi(visual, page_filters, alias_map)
        select_cols = [f"{slice_sql} AS slice", f"{cat_sql} AS category"]
        if ser_sql: select_cols.append(f"{ser_sql} AS series")
        for i, yssql in enumerate(y_sqls):
            select_cols.append(f"{yssql} AS y{i}")
        group_by = [slice_sql, cat_sql]
        if ser_sql: group_by.append(ser_sql)
        sql = f"""
            SELECT {", ".join(select_cols)}
            FROM {self.view_of[fact]} f
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            GROUP BY {", ".join(group_by)}
            ORDER BY 1, 2
            LIMIT 20000
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception:
            return None

        # Split rows by slice
        from collections import defaultdict as dd
        by_slice = dd(list)
        for row in rows:
            by_slice[row[0]].append(row[1:])

        out = {}
        for slice_val, subrows in by_slice.items():
            if slice_val is None: continue
            if ser_sql:
                # cols: [category, series, y0]
                by_ser = dd(list)
                xs_seen, xs_set = [], set()
                for c, s, v in subrows:
                    if c not in xs_set: xs_set.add(c); xs_seen.append(c)
                    by_ser[s].append((c, v))
                xs = [str(x) for x in xs_seen]
                series = []
                for s_name, pairs in by_ser.items():
                    lu = {str(c): v for c, v in pairs}
                    series.append({"name": str(s_name),
                                   "values": [lu.get(x) for x in xs]})
                out[str(slice_val)] = {"shape": "xy_series", "x": xs, "series": series}
            elif len(y_sqls) > 1:
                xs = [str(r[0]) for r in subrows]
                series = []
                for i, ref in enumerate(y_refs):
                    series.append({"name": ref,
                                   "values": [r[i+1] for r in subrows]})
                out[str(slice_val)] = {"shape": "xy_series", "x": xs, "series": series}
            else:
                xs = [str(r[0]) for r in subrows]
                y_vals = [r[1] for r in subrows]
                out[str(slice_val)] = {"shape": "xy", "x": xs, "y": y_vals}
        return out

    def _combo_sliced(self, visual, page_filters, slice_field):
        proj = visual.get("projections") or {}
        cat_refs = proj.get("Category") or []
        y_refs   = proj.get("Y") or proj.get("Values") or []
        y2_refs  = proj.get("Y2") or proj.get("LineValues") or proj.get("ColumnValues") or []
        if not cat_refs or not (y_refs or y2_refs): return None
        cats = [parse_queryref(r) for r in cat_refs]
        measures = []
        for refs, role in [(y_refs, "y"), (y2_refs, "y2")]:
            for r in refs:
                measures.append((role, r, parse_queryref(r)))
        if not measures: return None

        ents = set()
        for c in cats: ents.add(qref_entity(c))
        for _, _, p in measures: ents.add(qref_entity(p))
        slice_entity = slice_field.rsplit(".", 1)[0]
        ents.add(slice_entity)
        ents.discard(None)
        if any(e not in ENTITY_MAP for e in ents): return None

        FACT_ORDER = ["DATATBL", "LIMITS", "FlowPermits_AMAX", "Monthly Flow Permit"]
        fact = next((e for e in FACT_ORDER if e in ents), None) or next(iter(ents))
        dims = ents - {fact}
        for d in dims:
            if (fact, d) not in RELATIONSHIPS and (d, fact) not in RELATIONSHIPS:
                return None

        alias_map = {fact: "f"}
        joins = []
        for i, d in enumerate(dims):
            a = f"d{i}"
            alias_map[d] = a
            if (fact, d) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(fact, d)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON f."{fc}" = {a}."{dc}"')
            else:
                dc, fc = RELATIONSHIPS[(d, fact)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON {a}."{dc}" = f."{fc}"')

        cat_sqls = [qref_to_sql_expr(c, alias_map) for c in cats]
        _, slice_sql = self._slice_sql(slice_field, alias_map)
        if not slice_sql or any(s is None for s in cat_sqls): return None

        m_exprs = []
        for role, ref, p in measures:
            e = qref_to_sql_expr(p, alias_map)
            if not e: return None
            m_exprs.append((role, ref, e))

        select_cols = [f"{slice_sql} AS slice"]
        for i, s in enumerate(cat_sqls):
            select_cols.append(f"{s} AS cat{i}")
        for i, (_role, _ref, e) in enumerate(m_exprs):
            select_cols.append(f"{e} AS m{i}")

        where_parts = self._build_where_multi(visual, page_filters, alias_map)
        sql = f"""
            SELECT {", ".join(select_cols)}
            FROM {self.view_of[fact]} f
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            GROUP BY {slice_sql}, {", ".join(cat_sqls)}
            ORDER BY 1, {", ".join(cat_sqls)}
            LIMIT 20000
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception:
            return None

        def _cat_label(parts):
            def fmt(x):
                if isinstance(x, (int, float)) and float(x).is_integer():
                    return f"{int(x):02d}"
                return str(x)
            if len(parts) == 1: return str(parts[0])
            return "-".join(fmt(p) for p in parts)

        from collections import defaultdict as dd
        by_slice = dd(list)
        n_cats = len(cat_sqls)
        for r in rows: by_slice[r[0]].append(r[1:])
        out = {}
        for slice_val, subrows in by_slice.items():
            if slice_val is None: continue
            xs = [_cat_label(r[:n_cats]) for r in subrows]
            series = []
            for i, (role, ref, _) in enumerate(m_exprs):
                series.append({"name": ref, "role": role,
                               "values": [r[n_cats + i] for r in subrows]})
            out[str(slice_val)] = {"shape": "combo", "x": xs, "series": series}
        return out

    def _table_sliced(self, visual, page_filters, slice_field):
        """Simplified: only single-entity tables get sliced."""
        proj = visual.get("projections") or {}
        col_refs = proj.get("Values") or []
        if not col_refs: return None
        parsed = [parse_queryref(r) for r in col_refs]
        ents = {qref_entity(p) for p in parsed if p}
        ents.discard(None)
        slice_entity = slice_field.rsplit(".", 1)[0]
        if slice_entity not in ents:
            ents.add(slice_entity)
        if any(e not in ENTITY_MAP for e in ents): return None

        FACT_ORDER = ["DATATBL", "LIMITS", "FlowPermits_AMAX", "Monthly Flow Permit",
                      "Effluent Flow Limits"]
        fact = next((e for e in FACT_ORDER if e in ents), None) or next(iter(ents))
        dims = ents - {fact}
        for d in dims:
            if (fact, d) not in RELATIONSHIPS and (d, fact) not in RELATIONSHIPS:
                return None

        alias_map = {fact: "f"}
        joins = []
        for i, d in enumerate(dims):
            a = f"d{i}"
            alias_map[d] = a
            if (fact, d) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(fact, d)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON f."{fc}" = {a}."{dc}"')
            else:
                dc, fc = RELATIONSHIPS[(d, fact)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON {a}."{dc}" = f."{fc}"')

        col_sqls = []
        group_by = []
        has_agg = False
        for i, (ref, p) in enumerate(zip(col_refs, parsed)):
            s = qref_to_sql_expr(p, alias_map)
            if s is None: return None
            col_sqls.append(f"{s} AS col{i}")
            if p["kind"] == "agg" or (p["kind"] == "column" and
                                       (p["entity"], p["property"]) in MEASURE_SQL):
                has_agg = True
            else:
                group_by.append(s)

        _, slice_sql = self._slice_sql(slice_field, alias_map)
        if not slice_sql: return None
        where_parts = self._build_where_multi(visual, page_filters, alias_map)
        sql = f"""
            SELECT {slice_sql} AS slice, {", ".join(col_sqls)}
            FROM {self.view_of[fact]} f
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            {'GROUP BY ' + ', '.join([slice_sql] + group_by) if has_agg else ''}
            ORDER BY 1
            LIMIT 20000
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception:
            return None
        from collections import defaultdict as dd
        by_slice = dd(list)
        for r in rows: by_slice[r[0]].append(list(r[1:]))
        out = {}
        for slice_val, subrows in by_slice.items():
            if slice_val is None: continue
            out[str(slice_val)] = {"shape": "table", "columns": col_refs, "rows": subrows}
        return out

    # ── recipe: XY chart (bar/line/area) — supports multi-entity + multi-Y ──
    def _xy_series_chart(self, visual, page_filters):
        proj = visual.get("projections") or {}
        cat_refs = proj.get("Category") or proj.get("X") or []
        y_refs   = proj.get("Y") or proj.get("Values") or []
        ser_refs = proj.get("Series") or proj.get("Legend") or []

        if not cat_refs or not y_refs: return None
        cat = parse_queryref(cat_refs[0])
        ser = parse_queryref(ser_refs[0]) if ser_refs else None
        ys  = [parse_queryref(r) for r in y_refs]  # support multiple Y measures

        # Collect all entities referenced
        ents = {qref_entity(cat)}
        ents.update(qref_entity(y) for y in ys)
        if ser: ents.add(qref_entity(ser))
        ents.discard(None)
        if any(e not in ENTITY_MAP for e in ents): return None

        # Pick fact table and build JOINs (same as _table)
        FACT_ORDER = ["DATATBL", "LIMITS", "FlowPermits_AMAX", "Monthly Flow Permit",
                      "Effluent Flow Limits"]
        fact = next((e for e in FACT_ORDER if e in ents), None) or next(iter(ents))
        dims = ents - {fact}
        for d in dims:
            if (fact, d) not in RELATIONSHIPS and (d, fact) not in RELATIONSHIPS:
                return None

        alias_map = {fact: "f"}
        joins = []
        for i, d in enumerate(dims):
            a = f"d{i}"
            alias_map[d] = a
            if (fact, d) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(fact, d)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON f."{fc}" = {a}."{dc}"')
            else:
                dc, fc = RELATIONSHIPS[(d, fact)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON {a}."{dc}" = f."{fc}"')

        cat_sql = qref_to_sql_expr(cat, alias_map)
        y_sqls  = [qref_to_sql_expr(y, alias_map) for y in ys]
        ser_sql = qref_to_sql_expr(ser, alias_map) if ser else None
        if not cat_sql or any(s is None for s in y_sqls): return None

        where_parts = self._build_where_multi(visual, page_filters, alias_map)

        select_cols = [f"{cat_sql} AS category"]
        if ser_sql: select_cols.append(f"{ser_sql} AS series")
        for i, ys_sql in enumerate(y_sqls):
            select_cols.append(f"{ys_sql} AS y{i}")

        group_by = [cat_sql]
        if ser_sql: group_by.append(ser_sql)

        sql = f"""
            SELECT {", ".join(select_cols)}
            FROM {self.view_of[fact]} f
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            GROUP BY {", ".join(group_by)}
            ORDER BY 1
            LIMIT 5000
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception as e:
            return {"error": str(e), "sql_attempted": sql[:500]}

        # Shape the data
        if ser_sql:
            # Category × series × (single Y value)
            by_series = defaultdict(list)
            xs_seen, xs_set = [], set()
            for row in rows:
                c, s, v = row[0], row[1], row[2]
                if c not in xs_set: xs_set.add(c); xs_seen.append(c)
                by_series[s].append((c, v))
            xs = [str(x) for x in xs_seen]
            series = []
            for s_name, pairs in by_series.items():
                lookup = {str(c): v for c, v in pairs}
                series.append({"name": str(s_name), "values": [lookup.get(x) for x in xs]})
            return {"shape": "xy_series", "x": xs, "series": series}

        if len(y_sqls) > 1:
            # Category × multiple Y measures (one "series" per measure)
            xs = [str(r[0]) for r in rows]
            series = []
            for i, ref in enumerate(y_refs):
                series.append({
                    "name": ref,
                    "values": [r[i+1] for r in rows],
                })
            return {"shape": "xy_series", "x": xs, "series": series}

        # Single Y, no series
        xs = [str(r[0]) for r in rows]
        y_vals = [r[1] for r in rows]
        return {"shape": "xy", "x": xs, "y": y_vals}

    # ── recipe: combo chart (line + column on dual axes) ──
    # Supports compound Category (e.g. Year + Month), multi-entity joins,
    # and measures on multiple Y roles.
    def _combo_chart(self, visual, page_filters):
        proj = visual.get("projections") or {}
        cat_refs = proj.get("Category") or []
        y_refs   = proj.get("Y") or proj.get("Values") or []
        y2_refs  = proj.get("Y2") or proj.get("LineValues") or proj.get("ColumnValues") or []
        if not cat_refs or not (y_refs or y2_refs): return None

        cats = [parse_queryref(r) for r in cat_refs]
        measures = []
        for refs, role in [(y_refs, "y"), (y2_refs, "y2")]:
            for r in refs:
                measures.append((role, r, parse_queryref(r)))
        if not measures: return None

        # All entities involved (category parts + measures)
        ents = set()
        for c in cats: ents.add(qref_entity(c))
        for _, _, p in measures: ents.add(qref_entity(p))
        ents.discard(None)
        if any(e not in ENTITY_MAP for e in ents): return None

        FACT_ORDER = ["DATATBL", "LIMITS", "FlowPermits_AMAX", "Monthly Flow Permit"]
        fact = next((e for e in FACT_ORDER if e in ents), None) or next(iter(ents))
        dims = ents - {fact}
        for d in dims:
            if (fact, d) not in RELATIONSHIPS and (d, fact) not in RELATIONSHIPS:
                return None

        alias_map = {fact: "f"}
        joins = []
        for i, d in enumerate(dims):
            a = f"d{i}"
            alias_map[d] = a
            if (fact, d) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(fact, d)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON f."{fc}" = {a}."{dc}"')
            else:
                dc, fc = RELATIONSHIPS[(d, fact)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON {a}."{dc}" = f."{fc}"')

        cat_sqls = [qref_to_sql_expr(c, alias_map) for c in cats]
        if any(s is None for s in cat_sqls): return None
        m_exprs = []
        for role, ref, p in measures:
            e = qref_to_sql_expr(p, alias_map)
            if not e: return None
            m_exprs.append((role, ref, e))

        where_parts = self._build_where_multi(visual, page_filters, alias_map)
        select_cols = [f"{s} AS cat{i}" for i, s in enumerate(cat_sqls)]
        for i, (_r, _n, e) in enumerate(m_exprs):
            select_cols.append(f"{e} AS m{i}")

        sql = f"""
            SELECT {", ".join(select_cols)}
            FROM {self.view_of[fact]} f
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            GROUP BY {", ".join(cat_sqls)}
            ORDER BY {", ".join(cat_sqls)}
            LIMIT 10000
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception as e:
            return {"error": str(e), "sql_attempted": sql[:500]}

        # Compose category label from the parts; e.g. Year=2024, Month=3 → "2024-03"
        def _cat_label(parts):
            def fmt(x):
                if isinstance(x, (int, float)) and float(x).is_integer():
                    return f"{int(x):02d}"
                return str(x)
            if len(parts) == 1: return str(parts[0])
            return "-".join(fmt(p) for p in parts)

        n_cats = len(cat_sqls)
        xs = [_cat_label(r[:n_cats]) for r in rows]
        series = []
        for i, (role, name, _) in enumerate(m_exprs):
            series.append({
                "name": name,
                "role": role,
                "values": [r[n_cats + i] for r in rows],
            })
        return {"shape": "combo", "x": xs, "series": series}

    # ── recipe: pivot table (Rows × Columns matrix with Value aggregate) ──
    def _pivot(self, visual, page_filters):
        proj = visual.get("projections") or {}
        row_refs = proj.get("Rows") or []
        col_refs = proj.get("Columns") or []
        val_refs = proj.get("Values") or []
        if not (row_refs or col_refs) or not val_refs: return None

        rows = [parse_queryref(r) for r in row_refs]
        cols = [parse_queryref(r) for r in col_refs]
        val  = parse_queryref(val_refs[0])

        ents = set()
        for p in rows + cols + [val]:
            if p: ents.add(qref_entity(p))
        ents.discard(None)
        if any(e not in ENTITY_MAP for e in ents): return None

        FACT_ORDER = ["DATATBL", "LIMITS", "FlowPermits_AMAX", "Monthly Flow Permit"]
        fact = next((e for e in FACT_ORDER if e in ents), None) or next(iter(ents))
        dims = ents - {fact}
        for d in dims:
            if (fact, d) not in RELATIONSHIPS and (d, fact) not in RELATIONSHIPS:
                return None

        alias_map = {fact: "f"}
        joins = []
        for i, d in enumerate(dims):
            a = f"d{i}"
            alias_map[d] = a
            if (fact, d) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(fact, d)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON f."{fc}" = {a}."{dc}"')
            else:
                dc, fc = RELATIONSHIPS[(d, fact)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {a} ON {a}."{dc}" = f."{fc}"')

        row_sqls = [qref_to_sql_expr(r, alias_map) for r in rows]
        col_sqls = [qref_to_sql_expr(c, alias_map) for c in cols]
        val_sql  = qref_to_sql_expr(val, alias_map)
        if not val_sql or any(s is None for s in row_sqls + col_sqls): return None

        where_parts = self._build_where_multi(visual, page_filters, alias_map)
        # Compose SELECT
        select = []
        group_by = []
        for i, s in enumerate(row_sqls):
            select.append(f"{s} AS r{i}"); group_by.append(s)
        for i, s in enumerate(col_sqls):
            select.append(f"{s} AS c{i}"); group_by.append(s)
        select.append(f"{val_sql} AS v")

        sql = f"""
            SELECT {", ".join(select)}
            FROM {self.view_of[fact]} f
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            GROUP BY {", ".join(group_by)}
            ORDER BY {", ".join(group_by)}
            LIMIT 20000
        """
        try:
            db_rows = self.con.execute(sql).fetchall()
        except Exception as e:
            return {"error": str(e), "sql_attempted": sql[:500]}

        n_rows = len(row_sqls); n_cols = len(col_sqls)
        # Collect distinct row-keys and column-keys. Keys are tuples; sort
        # numerically when every component is numeric, else by string.
        row_seen = set()
        col_seen = set()
        cell = {}
        for rec in db_rows:
            rk = tuple(rec[:n_rows])
            ck = tuple(rec[n_rows:n_rows + n_cols])
            v  = rec[n_rows + n_cols]
            row_seen.add(rk); col_seen.add(ck)
            cell[(rk, ck)] = v
        def _sortkey(t):
            out = []
            for x in t:
                if isinstance(x, (int, float)): out.append((0, x))
                elif x is None:                 out.append((1, ""))
                else:
                    try: out.append((0, float(x)))
                    except (TypeError, ValueError): out.append((2, str(x)))
            return tuple(out)
        row_keys = sorted(row_seen, key=_sortkey)
        col_keys = sorted(col_seen, key=_sortkey)

        # Shape: header row is column keys; each row is row-key(s) + values across cols
        col_headers = [" / ".join(str(x) if x is not None else "" for x in ck) for ck in col_keys]
        row_labels  = row_keys  # tuples; frontend can flatten
        matrix = []
        for rk in row_keys:
            matrix.append([cell.get((rk, ck)) for ck in col_keys])

        return {
            "shape": "pivot",
            "row_fields":    row_refs,
            "col_fields":    col_refs,
            "value_field":   val_refs[0],
            "row_labels":    [list(rk) for rk in row_keys],
            "col_labels":    col_headers,
            "matrix":        matrix,
        }

    # ── recipe: table (single or joined entities) ──
    def _table(self, visual, page_filters):
        proj = visual.get("projections") or {}
        col_refs = proj.get("Values") or []
        if not col_refs: return None

        parsed = [parse_queryref(r) for r in col_refs]
        ents = [qref_entity(p) for p in parsed]
        distinct_ents = {e for e in ents if e}
        if not distinct_ents: return None
        if any(e not in ENTITY_MAP for e in distinct_ents): return None

        # Single-entity fast path
        if len(distinct_ents) == 1:
            return self._table_single(parsed, col_refs, distinct_ents.pop(),
                                       visual, page_filters)

        # Multi-entity: try to build a join using known relationships.
        # Pick a "fact" table (DATATBL > LIMITS > FlowPermits_AMAX > Monthly Flow Permit > Effluent Flow Limits)
        # and join in the dimension entities (VARDESC, LOCATION).
        FACT_ORDER = ["DATATBL", "LIMITS", "FlowPermits_AMAX", "Monthly Flow Permit",
                      "Effluent Flow Limits"]
        fact = next((e for e in FACT_ORDER if e in distinct_ents), None)
        if fact is None:
            # Only dimension tables? Fall back to the first one as fact.
            fact = list(distinct_ents)[0]

        dims = distinct_ents - {fact}
        # Verify relationships exist for every dim
        for d in dims:
            if (fact, d) not in RELATIONSHIPS and (d, fact) not in RELATIONSHIPS:
                return None  # no known relationship — can't join

        alias_map = {fact: "f"}
        for i, d in enumerate(dims):
            alias_map[d] = f"d{i}"

        # Build JOIN clauses
        joins = []
        for d in dims:
            d_alias = alias_map[d]
            if (fact, d) in RELATIONSHIPS:
                fc, dc = RELATIONSHIPS[(fact, d)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {d_alias} ON f."{fc}" = {d_alias}."{dc}"')
            else:
                dc, fc = RELATIONSHIPS[(d, fact)]
                joins.append(f'LEFT JOIN {self.view_of[d]} {d_alias} ON {d_alias}."{dc}" = f."{fc}"')

        # Build SELECT / GROUP BY
        col_sqls = []
        col_names = list(col_refs)
        group_by = []
        has_agg = False
        for i, (ref, p) in enumerate(zip(col_refs, parsed)):
            sql = qref_to_sql_expr(p, alias_map)
            if sql is None: return None
            col_sqls.append(f"{sql} AS col{i}")
            if p["kind"] == "agg" or (p["kind"] == "column" and
                                       (p["entity"], p["property"]) in MEASURE_SQL):
                has_agg = True
            else:
                group_by.append(sql)

        where_parts = self._build_where_multi(visual, page_filters, alias_map)

        sql = f"""
            SELECT {", ".join(col_sqls)}
            FROM {self.view_of[fact]} f
            {chr(10).join(joins)}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            {'GROUP BY ' + ', '.join(group_by) if has_agg and group_by else ''}
            ORDER BY 1
            LIMIT 2000
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception as e:
            return {"error": str(e), "sql_attempted": sql[:500]}
        return {
            "shape": "table",
            "columns": col_names,
            "rows": [list(r) for r in rows],
        }

    def _table_single(self, parsed, col_refs, entity, visual, page_filters):
        """Original single-entity table path."""
        alias = "t"
        alias_map = {entity: alias}
        col_sqls = []
        col_names = list(col_refs)
        group_by = []
        has_agg = False
        for i, (ref, p) in enumerate(zip(col_refs, parsed)):
            sql = qref_to_sql_expr(p, alias_map)
            if sql is None: return None
            col_sqls.append(f"{sql} AS col{i}")
            if p["kind"] == "agg" or (p["kind"] == "column" and
                                       (p["entity"], p["property"]) in MEASURE_SQL):
                has_agg = True
            else:
                group_by.append(sql)
        where_parts = self._build_where(visual, page_filters, entity, alias)
        sql = f"""
            SELECT {", ".join(col_sqls)}
            FROM {self.view_of[entity]} {alias}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
            {'GROUP BY ' + ', '.join(group_by) if has_agg and group_by else ''}
            ORDER BY 1
            LIMIT 2000
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception as e:
            return {"error": str(e), "sql_attempted": sql[:500]}
        return {"shape": "table", "columns": col_names,
                "rows": [list(r) for r in rows]}

    def _build_where_multi(self, visual, page_filters, alias_map):
        """WHERE builder that works across multiple aliased entities, with
        denormalization rewrites when the filter's target entity isn't joined."""
        parts = []
        alias_from_hint = {"d":"DATATBL", "v":"VARDESC", "l":"LIMITS",
                            "lo":"LOCATION", "f":"DATATBL"}
        for f in (visual.get("visual_filters") or []) + (page_filters or []):
            if not f: continue
            for cond_str in (f.get("conditions") or []):
                parsed = parse_condition(cond_str)
                if not parsed: continue
                a, prop, frag = parsed
                target_entity = alias_from_hint.get(a)
                if target_entity and target_entity in alias_map:
                    parts.append(frag.format(a=alias_map[target_entity]))
                elif target_entity and (target_entity, prop) in FILTER_REWRITE:
                    rw_entity, rw_prop = FILTER_REWRITE[(target_entity, prop)]
                    if rw_entity in alias_map:
                        frag_rw = frag.replace(f'"{prop}"', f'"{rw_prop}"')
                        parts.append(frag_rw.format(a=alias_map[rw_entity]))
        if self._extra_filter:
            fe_entity, fe_frag = self._extra_filter
            if fe_entity in alias_map:
                parts.append(fe_frag.format(a=alias_map[fe_entity]))
        return parts

    # ── recipe: card (single number) ──
    def _card(self, visual, page_filters):
        proj = visual.get("projections") or {}
        val_refs = proj.get("Values") or []
        if not val_refs: return None
        p = parse_queryref(val_refs[0])
        entity = qref_entity(p)
        if entity not in ENTITY_MAP: return None
        alias = "t"
        alias_map = {entity: alias}
        sql_expr = qref_to_sql_expr(p, alias_map)
        if not sql_expr: return None
        where_parts = self._build_where(visual, page_filters, entity, alias)
        sql = f"""
            SELECT {sql_expr} AS v
            FROM {self.view_of[entity]} {alias}
            {('WHERE ' + ' AND '.join(where_parts)) if where_parts else ''}
        """
        try:
            row = self.con.execute(sql).fetchone()
        except Exception as e:
            return {"error": str(e), "sql_attempted": sql[:500]}
        return {"shape": "card", "value": row[0] if row else None,
                "binding": val_refs[0]}

    # ── recipe: slicer (distinct values for a column) ──
    def _slicer(self, visual, page_filters):
        proj = visual.get("projections") or {}
        val_refs = proj.get("Values") or proj.get("Field") or []
        if not val_refs: return None
        p = parse_queryref(val_refs[0])
        entity = qref_entity(p)
        if entity not in ENTITY_MAP: return None
        alias = "t"
        alias_map = {entity: alias}
        sql_expr = qref_to_sql_expr(p, alias_map)
        if not sql_expr: return None
        where_parts = self._build_where(visual, page_filters, entity, alias)
        sql = f"""
            SELECT DISTINCT {sql_expr} AS v
            FROM {self.view_of[entity]} {alias}
            {('WHERE ' + ' AND '.join(where_parts + [f'{sql_expr} IS NOT NULL'])) if True else ''}
            ORDER BY 1
            LIMIT 500
        """
        try:
            rows = self.con.execute(sql).fetchall()
        except Exception as e:
            return {"error": str(e), "sql_attempted": sql[:500]}
        return {"shape": "slicer", "field": val_refs[0],
                "options": [r[0] for r in rows if r[0] is not None]}

    # ── shared: where clause builder ──
    def _build_where(self, visual, page_filters, entity, alias):
        parts = []
        for f in (visual.get("visual_filters") or []) + (page_filters or []):
            if not f: continue
            for cond_str in (f.get("conditions") or []):
                parsed = parse_condition(cond_str)
                if not parsed: continue
                a, prop, frag = parsed
                alias_hint = {"d":"DATATBL","v":"VARDESC","l":"LIMITS"}.get(a)
                if alias_hint == entity:
                    parts.append(frag.format(a=alias))
                elif alias_hint and (alias_hint, prop) in FILTER_REWRITE:
                    rw_entity, rw_prop = FILTER_REWRITE[(alias_hint, prop)]
                    if rw_entity == entity:
                        # Rewrite the fragment to use the denormalized column
                        frag_rw = frag.replace(f'"{prop}"', f'"{rw_prop}"')
                        parts.append(frag_rw.format(a=alias))
        if self._extra_filter:
            fe_entity, fe_frag = self._extra_filter
            if fe_entity == entity:
                parts.append(fe_frag.format(a=alias))
        return parts


# ── Public API ──────────────────────────────────────────────────────

def _visual_touches_datatbl(visual):
    """Check whether any projection on this visual references DATATBL.
    Used to skip date-range precompute for visuals where the filter can't
    apply (and would just duplicate `data` across every range)."""
    proj = visual.get("projections") or {}
    for refs in proj.values():
        if not isinstance(refs, list): continue
        for r in refs:
            parsed = parse_queryref(r)
            if parsed and qref_entity(parsed) == "DATATBL":
                return True
    return False


def aggregate_page(page_spec, con):
    """Mutate a page spec in place, attaching `data` to each visual we can
    aggregate. Returns a counter of handled vs unhandled visuals.

    If the page has a plant slicer (VARDESC.WWTP / UD3 / DATATBL.WWTP), also
    attaches `data_by_plant` so the frontend can filter to a selected WWTP
    without a round-trip.
    """
    agg = Aggregator(con)
    stats = defaultdict(int)

    # Detect a plant-level slicer on this page
    plant_slicer_field = None
    plant_slicer_name = None
    for v in page_spec["visuals"]:
        if v["type"] != "slicer": continue
        refs = (v.get("projections") or {}).get("Values") or []
        for r in refs:
            if r in ("VARDESC.WWTP", "VARDESC.UD3", "DATATBL.WWTP"):
                plant_slicer_field = r
                plant_slicer_name  = v.get("name")
                break
        if plant_slicer_field: break

    # Detect a date-level slicer on this page (bound to DATATBL.DATESTAMP)
    date_slicer_field = None
    date_slicer_name = None
    for v in page_spec["visuals"]:
        if v["type"] != "slicer": continue
        refs = (v.get("projections") or {}).get("Values") or []
        for r in refs:
            if r == "DATATBL.DATESTAMP":
                date_slicer_field = r
                date_slicer_name  = v.get("name")
                break
        if date_slicer_field: break

    # Anchor date for relative windows — always MAX(DATESTAMP) in DATATBL, so
    # "Last 30 days" means the 30 days up to the most recent data point, not
    # today's date (data may lag reality by weeks).
    anchor_date = None
    anchor_dt = None
    if date_slicer_field:
        try:
            anchor_date = con.execute(
                "SELECT MAX(DATESTAMP)::VARCHAR FROM read_parquet('" +
                str(TIER2 / "DATATBL.parquet") + "')"
            ).fetchone()[0]
            if anchor_date:
                # DuckDB emits "YYYY-MM-DD HH:MM:SS" — tolerate either form.
                anchor_dt = datetime.fromisoformat(anchor_date.split(".")[0])
        except Exception:
            anchor_date = None
            anchor_dt = None

    page_spec["date_slicer"] = {
        "field": date_slicer_field,
        "visual_name": date_slicer_name,
        "anchor_date": anchor_date,
        "options": [{"key": k, "label": lbl} for k, lbl, _ in DATE_RANGES],
        # PBIX relative-date slicers default to ~60 months on these pages;
        # 5 years matches behavior and keeps sparse-reporting plants visible.
        "default": "last_5_years",
    } if date_slicer_field else None

    # Fetch available plants for this page's slicer (used as default filter domain)
    all_plants = None
    if plant_slicer_field:
        try:
            rows = con.execute(
                "SELECT DISTINCT WWTP FROM read_parquet('" +
                str(TIER2 / "DATATBL.parquet") + "') WHERE WWTP IS NOT NULL ORDER BY WWTP"
            ).fetchall()
            all_plants = [r[0] for r in rows]
        except Exception:
            all_plants = []
    page_spec["plant_slicer"] = {
        "field": plant_slicer_field,
        "visual_name": plant_slicer_name,
        "options": all_plants,
        "default": (all_plants[0] if all_plants else None),
    } if plant_slicer_field else None

    for v in page_spec["visuals"]:
        if v["type"] in ("textbox", "shape", "basicShape", "image", "actionButton"):
            stats["skip_decorative"] += 1
            continue
        try:
            result = agg.build(v, page_spec.get("page_filters") or [])
        except Exception as e:
            result = {"error": f"{type(e).__name__}: {e}"}

        if result is None:
            stats[f"unhandled_{v['type']}"] += 1
            continue
        if "error" in result:
            stats[f"error_{v['type']}"] += 1
            v["data_error"] = result["error"]
            continue

        stats[f"built_{v['type']}"] += 1
        v["data"] = result

        # Per-plant slicing (if this page has a plant slicer and the visual
        # is aggregable — skip the slicer visuals themselves)
        if plant_slicer_field and v["type"] != "slicer" and all_plants:
            try:
                sliced = agg.build_sliced(v, page_spec.get("page_filters") or [],
                                           slice_field=plant_slicer_field,
                                           slice_values=all_plants)
                if sliced:
                    v["data_by_plant"] = sliced
            except Exception as e:
                v["data_by_plant_error"] = f"{type(e).__name__}: {e}"

        # Per-date-range precompute (if this page has a date slicer and the
        # visual is aggregable). "all_time" aliases the unfiltered data; the
        # other ranges inject a DATESTAMP >= anchor - INTERVAL WHERE clause.
        # Skip visuals whose projections don't touch DATATBL — the filter has
        # no effect on them and the result would duplicate `data` across
        # every range (pure wasted work + JSON bloat).
        if (date_slicer_field and v["type"] != "slicer" and anchor_dt
                and _visual_touches_datatbl(v)
                and page_spec.get("slug") in DATE_RANGE_PAGES):
            ranges_data = {}
            for key, _label, days in DATE_RANGES:
                if days is None:
                    ranges_data[key] = v.get("data")
                    continue
                cutoff = (anchor_dt - timedelta(days=days)).strftime("%Y-%m-%d")
                fragment = f'{{a}}."DATESTAMP" >= DATE \'{cutoff}\''
                agg._extra_filter = ("DATATBL", fragment)
                try:
                    sliced = agg.build(v, page_spec.get("page_filters") or [])
                except Exception:
                    sliced = None
                finally:
                    agg._extra_filter = None
                if sliced and "error" not in sliced:
                    ranges_data[key] = sliced
            if ranges_data:
                v["data_by_date_range"] = ranges_data

    return stats
