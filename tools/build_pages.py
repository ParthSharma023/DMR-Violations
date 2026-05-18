"""Phase 5A — page metadata pipeline.

Reads the PBIX layout dump + the tier2 parquet files and produces:

  app/data/manifest.json        - master index: pages, bookmarks, plants, parameters
  app/data/pages/<slug>.json    - per-page render spec: visuals with positions & field bindings

This pass does NOT compute visual-level data yet. That happens in 5E/5F
as each visual-type component is built. Output here is the page-layout skeleton
that the shell's generic page renderer will consume.

Live pages (the 56 we're actually rebuilding) are those that are either:
  - visible in the tab bar (visibility=0), OR
  - reached by a bookmark from another page (transitively via Home)

Orphaned hidden pages (48) are skipped.

Run:  python tools/build_pages.py
"""
from pathlib import Path
from datetime import date, datetime, timedelta
import json, re, duckdb, sys, time
from collections import defaultdict

sys.path.insert(0, str(Path(__file__).resolve().parent))
from aggregate import aggregate_page  # noqa: E402

# ── Per-visual overrides ─────────────────────────────────────────
# One-off cosmetic + filter tweaks applied after aggregation. Keyed by
# (page_slug, title-substring). Matched case-insensitive with `substring in title`.


def _write_json_and_script(path, payload, target_expr):
    text = json.dumps(payload, indent=2, default=str)
    path.write_text(text)
    script = (
        "window.__WWIP_DATA__ = window.__WWIP_DATA__ || { pages: {}, custom: {} };\n"
        "window.__WWIP_DATA__.pages = window.__WWIP_DATA__.pages || {};\n"
        "window.__WWIP_DATA__.custom = window.__WWIP_DATA__.custom || {};\n"
        f"{target_expr} = {text};\n"
    )
    path.with_suffix(".js").write_text(script)

# ── ADF / 2-hr Peak page helpers ─────────────────────────────────

def _set_daily_plant_data(visual, rows, series_name, limit_by_plant=None):
    """Pivot (wwtp, datestamp, val) rows into data_by_plant combo shape."""
    by_plant   = defaultdict(dict)
    plants_ord = []
    seen_plt   = set()
    xs_ord     = defaultdict(list)
    seen_xs    = defaultdict(set)

    for wwtp, datestamp, val in rows:
        x = str(datestamp)[:10]
        if wwtp not in seen_plt:
            seen_plt.add(wwtp)
            plants_ord.append(wwtp)
        if x not in seen_xs[wwtp]:
            seen_xs[wwtp].add(x)
            xs_ord[wwtp].append(x)
        by_plant[wwtp][x] = val

    def _make(wwtp):
        xs   = sorted(xs_ord[wwtp])
        vals = [by_plant[wwtp].get(x) for x in xs]
        series = [{"name": series_name, "role": "y", "values": vals}]
        if limit_by_plant and wwtp in limit_by_plant:
            lv = limit_by_plant[wwtp]
            series.append({"name": "Permit Limit", "role": "y2",
                           "values": [lv] * len(xs)})
        return {"shape": "combo", "x": xs, "series": series}

    visual["data_by_plant"] = {w: _make(w) for w in plants_ord}
    if plants_ord:
        visual["data"] = _make(plants_ord[0])


_ADF_CUTOFF = "(CURRENT_DATE - INTERVAL '5 years')"  # keep last 5yr; trims 49 MB → ~10 MB

def _rebuild_adf_chart(visual, con):
    """Average Daily Flow, MGD — per-plant daily avg of 'Plnt Ef Flow Mgd'."""
    try:
        rows = con.execute(f"""
            SELECT v.WWTP, d.DATESTAMP, AVG(d.CURVALUE) AS val
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE v."S. NAME" = 'Plnt Ef Flow Mgd' AND v.WWTP IS NOT NULL
              AND d.DATESTAMP >= {_ADF_CUTOFF}
            GROUP BY v.WWTP, d.DATESTAMP
            ORDER BY v.WWTP, d.DATESTAMP
        """).fetchall()
    except Exception as e:
        visual["data_error"] = f"_rebuild_adf_chart: {e}"; return
    _set_daily_plant_data(visual, rows, "Daily Avg Flow, MGD")


def _rebuild_rainfall_chart(visual, con):
    """Rainfall Depth, Inch — per-plant daily from variables containing 'Rainfall'."""
    try:
        rows = con.execute(f"""
            SELECT v.WWTP, d.DATESTAMP, AVG(d.CURVALUE) AS val
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%rainfall%' AND v.WWTP IS NOT NULL
              AND d.DATESTAMP >= {_ADF_CUTOFF}
            GROUP BY v.WWTP, d.DATESTAMP
            ORDER BY v.WWTP, d.DATESTAMP
        """).fetchall()
    except Exception as e:
        visual["data_error"] = f"_rebuild_rainfall_chart: {e}"; return
    _set_daily_plant_data(visual, rows, "Rainfall, Inch")


def _rebuild_2hrpeak_chart(visual, con):
    """2-hr Peak Flow, GPM — per-plant daily from 'Plnt Ef Flow Gpm' + DMAX limit line."""
    try:
        rows = con.execute(f"""
            SELECT v.WWTP, d.DATESTAMP, AVG(d.CURVALUE) AS val
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE v."S. NAME" = 'Plnt Ef Flow Gpm' AND v.WWTP IS NOT NULL
              AND d.DATESTAMP >= {_ADF_CUTOFF}
            GROUP BY v.WWTP, d.DATESTAMP
            ORDER BY v.WWTP, d.DATESTAMP
        """).fetchall()
        limit_rows = con.execute(f"""
            SELECT v.WWTP, l.LIMIT_VALUE AS limit_val
            FROM read_parquet('{TIER2}/LIMITS.parquet') l
            JOIN vardesc v ON l.VARID = v.VARID
            WHERE v."S. NAME" = 'Plnt Ef Flow Gpm' AND l.NAME = 'DMAX'
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY v.WWTP
                ORDER BY l.ENDDATE DESC, l.STARTDATE DESC, l.LIMIT_VALUE DESC
            ) = 1
        """).fetchall()
    except Exception as e:
        visual["data_error"] = f"_rebuild_2hrpeak_chart: {e}"; return
    limit_by_plant = {r[0]: r[1] for r in limit_rows}
    _set_daily_plant_data(visual, rows, "2-hr Peak Flow, GPM", limit_by_plant)


def _fix_permit_aaf_plant_list(page_spec):
    """Swap Metro Central / MUD-203 order and drop Northgate from plant slicer."""
    slicer = page_spec.get("plant_slicer")
    if not slicer:
        return
    opts = [p for p in slicer.get("options", []) if p != "Northgate"]
    if "MUD-203" in opts and "Metro Central" in opts:
        i, j = opts.index("MUD-203"), opts.index("Metro Central")
        opts[i], opts[j] = opts[j], opts[i]
    slicer["options"] = opts
    if slicer.get("default") == "Northgate":
        slicer["default"] = opts[0] if opts else None


def _rebuild_permit_evaluation_aaf_table(visual, con):
    """Compact permit table for the Permit Evaluation AAF page.

    The PBIX visual is a small top-row permit table keyed by WWTP. Our generic
    table aggregator doesn't currently hydrate this 3-entity visual reliably.
    Use the canonical helper table so the displayed permit matches the page's
    cards/charts and retains PBIX overrides like Northbelt = 6 MGD.
    """
    permit_by_plant = _monthly_flow_permit_by_plant(con)
    by_plant = {
        wwtp: [[wwtp, "Annual Average Maximum Limit", permit_value, "MGD"]]
        for wwtp, permit_value in permit_by_plant.items()
    }

    def _shape(wwtp):
        return {
            "shape": "table",
            "columns": [
                "VARDESC.WWTP",
                "LIMITS.DESCRIPTION",
                "Sum(Effluent Flow Limits.LIMIT_VALUE)",
                "VARDESC.UNITS",
            ],
            "rows": by_plant.get(wwtp, []),
        }

    plants_ord = sorted(by_plant)
    visual["data_by_plant"] = {wwtp: _shape(wwtp) for wwtp in plants_ord}
    if plants_ord:
        visual["data"] = _shape(plants_ord[0])


def _rebuild_permit_evaluation_aaf_chart(visual, page_spec, con):
    """Rebuild the Permit Evaluation AAF combo chart with stable permit lines.

    The generic combo aggregator duplicates the permit-related Y2 series on the
    live source because the LIMITS join fans out monthly records. This page only
    needs one monthly plant-flow series plus constant permit/threshold lines, so
    we rebuild it directly from DATATBL + Monthly_Flow_Permit.
    """
    try:
        flow_rows = con.execute("""
            SELECT
                v.WWTP,
                CAST(d.DATESTAMP AS DATE) AS datestamp,
                AVG(d.CURVALUE) AS flow_value
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. Name 2") = LOWER('Plnt Ef FLOW Annual Avg')
              AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP, CAST(d.DATESTAMP AS DATE)
            ORDER BY v.WWTP, datestamp
        """).fetchall()
        permit_rows = con.execute(f"""
            SELECT
                WWTP,
                COALESCE(LIMIT_VALUE_update, LIMIT_VALUE) AS permit_value
            FROM read_parquet('{TIER2}/Monthly_Flow_Permit.parquet')
            WHERE WWTP IS NOT NULL
        """).fetchall()
    except Exception as e:
        visual["data_error"] = f"_rebuild_permit_evaluation_aaf_chart: {e}"
        return

    permit_by_plant = {wwtp: permit for wwtp, permit in permit_rows}
    by_plant = defaultdict(lambda: {"x": [], "flow": []})
    for wwtp, datestamp, flow_value in flow_rows:
        by_plant[wwtp]["x"].append(str(datestamp))
        by_plant[wwtp]["flow"].append(flow_value)

    def _shape(wwtp):
        xs = by_plant[wwtp]["x"]
        vals = by_plant[wwtp]["flow"]
        permit = permit_by_plant.get(wwtp)
        permit_line = [permit] * len(xs) if permit is not None else [None] * len(xs)
        p90 = [permit * 0.90] * len(xs) if permit is not None else [None] * len(xs)
        p75 = [permit * 0.75] * len(xs) if permit is not None else [None] * len(xs)
        return {
            "shape": "combo",
            "x": xs,
            "series": [
                {"name": "Annual Avg Flow", "role": "y", "values": vals},
                {"name": "100% Permit", "role": "y2", "values": permit_line},
                {"name": "90% Permit", "role": "y2", "values": p90},
                {"name": "75% Permit", "role": "y2", "values": p75},
            ],
        }

    plants_ord = page_spec.get("plant_slicer", {}).get("options") or sorted(by_plant)
    visual["data_by_plant"] = {wwtp: _shape(wwtp) for wwtp in plants_ord if wwtp in by_plant}
    if visual["data_by_plant"]:
        first = next(iter(visual["data_by_plant"]))
        visual["data"] = visual["data_by_plant"][first]


def _rebuild_permit_evaluation_7590_chart(visual, page_spec, con):
    """Rebuild the Permit Evaluation 75/90 combo chart with non-duplicated lines."""
    try:
        flow_rows = con.execute("""
            SELECT
                v.WWTP,
                CAST(d.DATESTAMP AS DATE) AS datestamp,
                AVG(d."Rolling 3 Months Minimum_row") AS flow_value
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. Name 2") = LOWER('Plnt Ef FLOW Month Avg')
              AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP, CAST(d.DATESTAMP AS DATE)
            ORDER BY v.WWTP, datestamp
        """).fetchall()
        permit_rows = con.execute(f"""
            SELECT
                WWTP,
                COALESCE(LIMIT_VALUE_update, LIMIT_VALUE) AS permit_value
            FROM read_parquet('{TIER2}/Monthly_Flow_Permit.parquet')
            WHERE WWTP IS NOT NULL
        """).fetchall()
    except Exception as e:
        visual["data_error"] = f"_rebuild_permit_evaluation_7590_chart: {e}"
        return

    permit_by_plant = {wwtp: permit for wwtp, permit in permit_rows}
    by_plant = defaultdict(lambda: {"x": [], "flow": []})
    for wwtp, datestamp, flow_value in flow_rows:
        by_plant[wwtp]["x"].append(str(datestamp))
        by_plant[wwtp]["flow"].append(flow_value)

    def _shape(wwtp):
        xs = by_plant[wwtp]["x"]
        vals = by_plant[wwtp]["flow"]
        permit = permit_by_plant.get(wwtp)
        permit_line = [permit] * len(xs) if permit is not None else [None] * len(xs)
        p90 = [permit * 0.90] * len(xs) if permit is not None else [None] * len(xs)
        p75 = [permit * 0.75] * len(xs) if permit is not None else [None] * len(xs)
        return {
            "shape": "combo",
            "x": xs,
            "series": [
                {"name": "75/90 Minimum Flow", "role": "y", "values": vals},
                {"name": "100% Permit", "role": "y2", "values": permit_line},
                {"name": "90% Permit", "role": "y2", "values": p90},
                {"name": "75% Permit", "role": "y2", "values": p75},
            ],
        }

    plants_ord = page_spec.get("plant_slicer", {}).get("options") or sorted(by_plant)
    visual["data_by_plant"] = {wwtp: _shape(wwtp) for wwtp in plants_ord if wwtp in by_plant}
    if visual["data_by_plant"]:
        first = next(iter(visual["data_by_plant"]))
        visual["data"] = visual["data_by_plant"][first]


def _rebuild_permit_evaluation_aaf_page(page_spec, con):
    _fix_permit_aaf_plant_list(page_spec)
    chart = next((
        v for v in page_spec.get("visuals", [])
        if v.get("type") == "lineStackedColumnComboChart"
        and "annual average (permit evaluation)" in (v.get("title") or "").lower()
    ), None)
    if chart:
        _rebuild_permit_evaluation_aaf_chart(chart, page_spec, con)


def _rebuild_permit_evaluation_7590_page(page_spec, con):
    chart = next((
        v for v in page_spec.get("visuals", [])
        if v.get("type") == "lineClusteredColumnComboChart"
        and "75/90 rule evaulation" in (v.get("title") or "").lower()
    ), None)
    if chart:
        _rebuild_permit_evaluation_7590_chart(chart, page_spec, con)


def _monthly_flow_permit_by_plant(con):
    rows = con.execute(f"""
        SELECT
            WWTP,
            COALESCE(LIMIT_VALUE_update, LIMIT_VALUE) AS permit_value
        FROM read_parquet('{TIER2}/Monthly_Flow_Permit.parquet')
        WHERE WWTP IS NOT NULL
    """).fetchall()
    return {wwtp: permit_value for wwtp, permit_value in rows}


def _is_flow_permit_context(values):
    haystack = " | ".join(str(v).lower() for v in (values or []))
    tokens = [
        "plnt ef flow mgd",
        "plnt ef flow annual avg",
        "ef flow annual",
    ]
    return any(token in haystack for token in tokens)


def _rebuild_npdes_permit_limits_table(visual, con):
    """Rebuild the one-row-per-plant permit summary from Monthly_Flow_Permit.

    The summary page should use the same canonical helper table as the permit
    cards/charts, not raw LIMITS lookups that miss some plants and keep the
    pre-override Northbelt value.
    """
    permit_by_plant = _monthly_flow_permit_by_plant(con)
    columns = ["VARDESC.WWTP", "Sum(LIMITS.LIMIT_VALUE)"]
    rows = [[wwtp, permit_by_plant[wwtp]] for wwtp in sorted(permit_by_plant)]
    visual["data"] = {"shape": "table", "columns": columns, "rows": rows}
    visual["data_by_plant"] = {
        wwtp: {"shape": "table", "columns": columns, "rows": [[wwtp, permit_by_plant[wwtp]]]}
        for wwtp in sorted(permit_by_plant)
    }


def _set_custom_table_source(visual, rows, value_key, fallback_mode=None):
    """Attach raw per-plant date/value rows so the browser can recompute tables."""
    by_plant = defaultdict(lambda: {"x": [], value_key: [], "permit": []})
    plants_ord = []
    seen = set()

    for wwtp, datestamp, value, permit in rows:
        if wwtp not in seen:
            seen.add(wwtp)
            plants_ord.append(wwtp)
        bucket = by_plant[wwtp]
        bucket["x"].append(str(datestamp)[:10])
        bucket[value_key].append(value)
        bucket["permit"].append(permit)

    visual["custom_range_source"] = {
        "plants": plants_ord,
        "value_key": value_key,
        "rows_by_plant": dict(by_plant),
        "fallback_mode": fallback_mode,
    }


def _latest_datestamp(con):
    """Return the latest available DATATBL date, not the machine build date."""
    try:
        value = con.execute("SELECT MAX(DATESTAMP)::VARCHAR FROM datatbl").fetchone()[0]
    except Exception:
        return None
    if not value:
        return None
    return date.fromisoformat(str(value)[:10])


def _rebuild_permit_summary_custom_sources(page_spec, con):
    """Emit raw source rows for the summary tables page's custom date range support."""
    visuals = page_spec.get("visuals", [])
    aaf_visual = next((v for v in visuals if (v.get("title") or "").startswith("Permit Evaluation, AAF")), None)
    rule_visual = next((v for v in visuals if "75/90" in (v.get("title") or "")), None)
    anchor = _latest_datestamp(con)

    if page_spec.get("date_slicer"):
        page_spec["date_slicer"]["anchor_date"] = str(anchor) if anchor else None
        for opt in page_spec["date_slicer"].get("options", []):
            if opt.get("key") == "last_12_months":
                opt["label"] = "Last 12 months (calendar)"
            elif opt.get("key") == "last_5_years":
                opt["label"] = "Last 60 months (calendar)"

    if aaf_visual:
        try:
            aaf_rows = con.execute("""
                SELECT
                    v.WWTP,
                    d.DATESTAMP,
                    AVG(d.CURVALUE) AS metric_value,
                    AVG(d."Color Format for Flow") AS permit_value
                FROM datatbl d
                JOIN vardesc v ON d.VARID = v.VARID
                WHERE LOWER(v."S. Name 2") = LOWER('Plnt Ef Flow Annual Avg')
                  AND v.WWTP IS NOT NULL
                  AND v.WWTP NOT IN ('Forest Cove', 'Tidwell Timbers', 'WCID-76', 'West Lake Hou.', 'Westway')
                GROUP BY v.WWTP, d.DATESTAMP
                ORDER BY v.WWTP, d.DATESTAMP
            """).fetchall()
            _set_custom_table_source(aaf_visual, aaf_rows, "value")
        except Exception as e:
            aaf_visual["custom_range_source_error"] = f"_rebuild_permit_summary_custom_sources[aaf]: {e}"

    if rule_visual:
        try:
            rule_rows = con.execute("""
                SELECT
                    v.WWTP,
                    d.DATESTAMP,
                    AVG(d."Rolling 3 Months Minimum_row") AS metric_value,
                    AVG(d."Color Format for Flow") AS permit_value
                FROM datatbl d
                JOIN vardesc v ON d.VARID = v.VARID
                WHERE LOWER(v."S. Name 2") = LOWER('Plnt Ef FLOW Month Avg')
                  AND v.WWTP IN ('Forest Cove', 'Tidwell Timbers', 'WCID-76', 'West Lake Hou.', 'Westway')
                GROUP BY v.WWTP, d.DATESTAMP
                ORDER BY v.WWTP, d.DATESTAMP
            """).fetchall()
            _set_custom_table_source(rule_visual, rule_rows, "value", fallback_mode="all_time_when_empty")
        except Exception as e:
            rule_visual["custom_range_source_error"] = f"_rebuild_permit_summary_custom_sources[75_90]: {e}"


def _rebuild_permitted_aaf_vs_dmr(page_spec, con):
    """Rebuild charts and cards on the Permitted AAF Vs DMR page.

    Chart 1: Annual Average Flow per plant per month-end date (calc variable, one record/month).
    Chart 2: Monthly avg of daily flow per plant (year-month grouping).
    Cards:   permit AMAX limit + max annual avg.
    Both charts share the same 75% permit threshold reference line on the primary axis.
    Monthly data — no 5-yr cutoff needed (manageable size).
    """
    visuals = page_spec.get("visuals", [])
    try:
        # Chart 1 — Annual Avg calc variable, one record per month-end per plant
        aaf_rows = con.execute("""
            SELECT v.WWTP, d.DATESTAMP, AVG(d.CURVALUE) AS val, AVG(d."75%") AS pct75
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE v."S. NAME" = 'Plnt Ef FLOW ANNUAL' AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP, d.DATESTAMP
            ORDER BY v.WWTP, d.DATESTAMP
        """).fetchall()

        # Chart 2 — Daily variable averaged by month
        dmr_rows = con.execute("""
            SELECT v.WWTP, YEAR(d.DATESTAMP) AS yr, MONTH(d.DATESTAMP) AS mo,
                   AVG(d.CURVALUE) AS val, AVG(d."75%") AS pct75
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow mgd%' AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP, yr, mo
            ORDER BY v.WWTP, yr, mo
        """).fetchall()

        # Cards — max annual avg flow (Permit Evaluated Flow)
        maxaaf_rows = con.execute("""
            SELECT v.WWTP, MAX(d.CURVALUE) AS val
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE v."S. NAME" = 'Plnt Ef FLOW ANNUAL' AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP
        """).fetchall()

    except Exception as e:
        page_spec["_aaf_vs_dmr_error"] = str(e); return

    by_limit  = _monthly_flow_permit_by_plant(con)
    by_maxaaf = {r[0]: r[1] for r in maxaaf_rows}

    def _make_combo_dbp(tuples, val_name):
        """Build data_by_plant combo dict from [(wwtp, x_str, val, pct75)] tuples."""
        by_plant  = defaultdict(dict)
        pct_plant = defaultdict(dict)
        xs_ord    = defaultdict(list)
        seen_xs   = defaultdict(set)
        for wwtp, x, val, pct75 in tuples:
            if x not in seen_xs[wwtp]:
                seen_xs[wwtp].add(x); xs_ord[wwtp].append(x)
            by_plant[wwtp][x] = val
            if pct75 is not None: pct_plant[wwtp][x] = pct75
        dbp = {}
        for wwtp in by_plant:
            xs   = sorted(xs_ord[wwtp])
            vals = [by_plant[wwtp].get(x) for x in xs]
            p75  = [pct_plant[wwtp].get(x) for x in xs]
            dbp[wwtp] = {
                "shape": "combo", "x": xs,
                "series": [{"name": val_name,        "role": "y",  "values": vals},
                           {"name": "75% of Permit", "role": "y2", "values": p75}],
            }
        return dbp

    aaf_dbp = _make_combo_dbp(
        [(r[0], str(r[1])[:10],          r[2], r[3]) for r in aaf_rows],
        "Annual Avg Flow")
    dmr_dbp = _make_combo_dbp(
        [(r[0], f"{r[1]}-{r[2]:02d}",   r[3], r[4]) for r in dmr_rows],
        "Avg Daily Flow")
    first   = sorted(aaf_dbp.keys())[0] if aaf_dbp else None

    for v in visuals:
        t     = v.get("type"); title = (v.get("title") or "").lower()
        proj  = v.get("projections", {})
        binding = (proj.get("Values") or [""])[0]

        if t == "lineStackedColumnComboChart":
            if "annual average" in title:
                v["data_by_plant"] = aaf_dbp
                if first: v["data"] = aaf_dbp.get(first, {})
            elif "average daily" in title:
                v["data_by_plant"] = dmr_dbp
                if first: v["data"] = dmr_dbp.get(first, {})

        elif t == "card":
            if "LIMIT_VALUE" in binding:
                v["data_by_plant"] = {w: {"shape":"card","value":by_limit.get(w)}  for w in by_limit}
                if first: v["data"] = {"shape":"card","value":by_limit.get(first)}
            elif "MAX Curval" in binding or "AVG_Calc" in binding:
                v["data_by_plant"] = {w: {"shape":"card","value":by_maxaaf.get(w)} for w in by_maxaaf}
                if first: v["data"] = {"shape":"card","value":by_maxaaf.get(first)}


def _rebuild_statistical_flows(page_spec, con):
    """Rebuild all data on the Statistical Flows page in one pass.

    Cards: correct per-plant aggregations with S.NAME variable filter.
    Pivots: month-matrix shape (WWTP × Year/Month).
    Chart: 5-year daily flow with plant filter.
    """
    CUTOFF = _ADF_CUTOFF
    visuals = page_spec.get("visuals", [])

    # ── SQL queries (all use v.WWTP to avoid denorm errors) ──────────
    try:
        # 90% and 75% thresholds (constant per plant)
        thresh_rows = con.execute(f"""
            SELECT v.WWTP, AVG(d."90%") AS pct90, AVG(d."75%") AS pct75
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow mgd%'
              AND v.WWTP IS NOT NULL AND d.DATESTAMP >= {CUTOFF}
            GROUP BY v.WWTP
        """).fetchall()

        # Max annual avg (Permit Evaluated Flow)
        maxaaf_rows = con.execute(f"""
            SELECT v.WWTP, MAX(d.CURVALUE) AS val
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow annual%'
              AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP
        """).fetchall()

        # AVG and StdDev over 5-year window
        stats_rows = con.execute(f"""
            SELECT v.WWTP, AVG(d.CURVALUE) AS avg_val,
                   STDDEV_SAMP(d.CURVALUE) AS std_val
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow mgd%'
              AND v.WWTP IS NOT NULL AND d.DATESTAMP >= {CUTOFF}
            GROUP BY v.WWTP
        """).fetchall()

        # Annual Average Flow pivot (monthly calc variable, 1 record/month/plant)
        aaf_rows = con.execute(f"""
            SELECT v.WWTP, YEAR(d.DATESTAMP) AS yr,
                   MONTH(d.DATESTAMP) AS mo, AVG(d.CURVALUE) AS val
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow annual%'
              AND v.WWTP IS NOT NULL AND d.DATESTAMP >= {CUTOFF}
            GROUP BY v.WWTP, yr, mo ORDER BY v.WWTP, yr, mo
        """).fetchall()

        # ADF Monthly DMR pivot (daily variable, avg per month)
        adf_rows = con.execute(f"""
            SELECT v.WWTP, YEAR(d.DATESTAMP) AS yr,
                   MONTH(d.DATESTAMP) AS mo, AVG(d.CURVALUE) AS val
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow mgd%'
              AND v.WWTP IS NOT NULL AND d.DATESTAMP >= {CUTOFF}
            GROUP BY v.WWTP, yr, mo ORDER BY v.WWTP, yr, mo
        """).fetchall()

        # Monthly Rainfall pivot (sum per month)
        rain_rows = con.execute(f"""
            SELECT v.WWTP, YEAR(d.DATESTAMP) AS yr,
                   MONTH(d.DATESTAMP) AS mo, SUM(d.CURVALUE) AS val
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%rainfall%'
              AND v.WWTP IS NOT NULL AND d.DATESTAMP >= {CUTOFF}
            GROUP BY v.WWTP, yr, mo ORDER BY v.WWTP, yr, mo
        """).fetchall()

        # Daily ADF chart
        chart_rows = con.execute(f"""
            SELECT v.WWTP, d.DATESTAMP, AVG(d.CURVALUE) AS val
            FROM datatbl d JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow mgd%'
              AND v.WWTP IS NOT NULL AND d.DATESTAMP >= {CUTOFF}
            GROUP BY v.WWTP, d.DATESTAMP ORDER BY v.WWTP, d.DATESTAMP
        """).fetchall()

    except Exception as e:
        page_spec["_stat_flows_error"] = str(e)
        return

    # ── Build per-plant lookups ───────────────────────────────────────
    by_permit  = _monthly_flow_permit_by_plant(con)
    by_thresh  = {r[0]: (r[1], r[2]) for r in thresh_rows}
    by_maxaaf  = {r[0]: r[1] for r in maxaaf_rows}
    by_stats   = {r[0]: (r[1], r[2]) for r in stats_rows}

    def _card_dbp(get_val):
        return {wwtp: {"shape": "card", "value": get_val(wwtp)}
                for wwtp in by_stats}

    def _pivot_dbp(rows, agg):
        """Build data_by_plant for a month-matrix pivot. agg='avg'|'sum'."""
        by_plant = defaultdict(lambda: defaultdict(dict))
        for wwtp, yr, mo, val in rows:
            by_plant[wwtp][yr][mo] = val
        out = {}
        for wwtp, yr_data in by_plant.items():
            months = []
            vals   = {}
            for yr in sorted(yr_data):
                mo_data = yr_data[yr]
                mo_vals = [mo_data[mo] for mo in sorted(mo_data)]
                total   = sum(mo_vals) if agg == "sum" else (sum(mo_vals)/len(mo_vals) if mo_vals else None)
                for mo in sorted(mo_data):
                    months.append({"yr": yr, "mo": mo})
                    vals[f"{yr}-{mo}"] = round(mo_data[mo], 3) if mo_data[mo] is not None else None
                vals[f"{yr}-total"] = round(total, 3) if total is not None else None
            out[wwtp] = {"shape": "month_matrix", "agg": agg, "months": months, "values": vals}
        return out

    aaf_dbp  = _pivot_dbp(aaf_rows,  "avg")
    adf_dbp  = _pivot_dbp(adf_rows,  "avg")
    rain_dbp = _pivot_dbp(rain_rows, "sum")

    # Daily chart per plant
    chart_by_plant = defaultdict(dict)
    chart_xs_ord   = defaultdict(list)
    chart_seen_xs  = defaultdict(set)
    for wwtp, datestamp, val in chart_rows:
        x = str(datestamp)[:10]
        if x not in chart_seen_xs[wwtp]:
            chart_seen_xs[wwtp].add(x)
            chart_xs_ord[wwtp].append(x)
        chart_by_plant[wwtp][x] = val

    chart_dbp = {}
    for wwtp in chart_by_plant:
        xs   = sorted(chart_xs_ord[wwtp])
        vals = [chart_by_plant[wwtp].get(x) for x in xs]
        chart_dbp[wwtp] = {"shape": "combo", "x": xs,
                           "series": [{"name": "Daily Avg Flow, MGD", "role": "y", "values": vals}]}

    # ── Populate visuals ──────────────────────────────────────────────
    CARD_MAP = {
        "Sum(LIMITS.LIMIT_VALUE)": lambda w: by_permit.get(w),
        "Sum(DATATBL.90%)":        lambda w: by_thresh.get(w, (None,None))[0],
        "Sum(DATATBL.75%)":        lambda w: by_thresh.get(w, (None,None))[1],
        "DATATBL.MAX Curval":      lambda w: by_maxaaf.get(w),
        "DATATBL.AVG_Calc":        lambda w: by_stats.get(w, (None,None))[0],
        "DATATBL.STDEV.S":         lambda w: by_stats.get(w, (None,None))[1],
    }

    first_plant = sorted(by_stats.keys())[0] if by_stats else None

    for v in visuals:
        t     = v.get("type")
        title = (v.get("title") or "").lower()
        proj  = v.get("projections", {})

        if t == "card":
            binding = (proj.get("Values") or [""])[0]
            fn = CARD_MAP.get(binding)
            if fn:
                dbp = {w: {"shape": "card", "value": fn(w)} for w in by_stats}
                v["data_by_plant"] = dbp
                if first_plant:
                    v["data"] = {"shape": "card", "value": fn(first_plant)}

        elif t == "pivotTable":
            if "permitted annual" in title:
                v["data_by_plant"] = aaf_dbp
                if first_plant: v["data"] = aaf_dbp.get(first_plant, {})
            elif "average daily flow" in title:
                v["data_by_plant"] = adf_dbp
                if first_plant: v["data"] = adf_dbp.get(first_plant, {})
            elif "rainfall" in title:
                v["data_by_plant"] = rain_dbp
                if first_plant: v["data"] = rain_dbp.get(first_plant, {})

        elif t == "lineClusteredColumnComboChart" and "average daily flow" in title:
            v["data_by_plant"] = chart_dbp
            if first_plant: v["data"] = chart_dbp.get(first_plant, {})


def _rebuild_ef_flow_aaf_maf(visual, con):
    """Replace the AAF vs MAF combo chart data with correctly-aggregated series.

    The PBIX uses Series=VARDESC.NAME to split bars by variable, but our general
    combo recipe treats Y as CountNonNull (wrong). This override queries the two
    relevant S.NAME values directly and produces the correct 5-series combo shape:
      bars: Annual Avg Flow, Monthly Flow
      lines: 100% Permit, 90% Permit, 75% Permit
    """
    try:
        rows = con.execute("""
            SELECT
                v.WWTP,
                YEAR(d.DATESTAMP)              AS yr,
                MONTH(d.DATESTAMP)             AS mo,
                v."S. NAME"                    AS sname,
                AVG(d.CURVALUE)                AS val,
                AVG(d."Color Format for Flow") AS permit,
                AVG(d."90%")                   AS pct90,
                AVG(d."75%")                   AS pct75
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE v."S. NAME" IN ('Plnt Ef FLOW ANNUAL', 'Plnt Ef Flow Mgd')
              AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP, YEAR(d.DATESTAMP), MONTH(d.DATESTAMP), v."S. NAME"
            ORDER BY v.WWTP, yr, mo, v."S. NAME"
        """).fetchall()
    except Exception as e:
        visual["data_error"] = f"_rebuild_ef_flow_aaf_maf: {e}"
        return

    by_plant  = defaultdict(lambda: defaultdict(dict))
    plants_ordered = []
    seen_plants    = set()
    xs_per_plant   = defaultdict(list)
    seen_xs        = defaultdict(set)

    for wwtp, yr, mo, sname, val, permit, pct90, pct75 in rows:
        x = f"{yr}-{mo:02d}"
        if wwtp not in seen_plants:
            seen_plants.add(wwtp)
            plants_ordered.append(wwtp)
        if x not in seen_xs[wwtp]:
            seen_xs[wwtp].add(x)
            xs_per_plant[wwtp].append(x)
        by_plant[wwtp][x][sname] = val
        if permit is not None:
            by_plant[wwtp][x]["_permit"] = permit
        if pct90 is not None:
            by_plant[wwtp][x]["_90"] = pct90
        if pct75 is not None:
            by_plant[wwtp][x]["_75"] = pct75

    def _make_combo(wwtp):
        xs   = sorted(xs_per_plant[wwtp])
        data = by_plant[wwtp]
        return {
            "shape": "combo",
            "x": xs,
            "series": [
                {"name": "Annual Avg Flow", "role": "y",
                 "values": [data.get(x, {}).get("Plnt Ef FLOW ANNUAL") for x in xs]},
                {"name": "Monthly Flow",    "role": "y",
                 "values": [data.get(x, {}).get("Plnt Ef Flow Mgd")    for x in xs]},
                {"name": "100% Permit",     "role": "y2",
                 "values": [data.get(x, {}).get("_permit") for x in xs]},
                {"name": "90% Permit",      "role": "y2",
                 "values": [data.get(x, {}).get("_90")     for x in xs]},
                {"name": "75% Permit",      "role": "y2",
                 "values": [data.get(x, {}).get("_75")     for x in xs]},
            ],
        }

    visual["data_by_plant"] = {wwtp: _make_combo(wwtp) for wwtp in plants_ordered}
    if plants_ordered:
        visual["data"] = _make_combo(plants_ordered[0])


def _rebuild_ef_flow_aaf_maf_table(visual, con):
    """Rebuild the permit metadata table from the canonical permit helper values."""
    permit_by_plant = _monthly_flow_permit_by_plant(con)
    try:
        meta_rows = con.execute(f"""
            SELECT
                v.WWTP,
                v."S. NAME" AS shortname,
                l.DESCRIPTION,
                l.LIMIT_VALUE AS raw_limit_value,
                v.UNITS,
                v.VARTYPE,
                l.NAME AS limit_name
            FROM read_parquet('{TIER2}/LIMITS.parquet') l
            JOIN vardesc v ON l.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow mgd%'
              AND v.WWTP IS NOT NULL
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY v.WWTP
                ORDER BY
                    CASE
                        WHEN l.NAME = 'AMAX' THEN 0
                        WHEN l.NAME = 'MMAX' THEN 1
                        ELSE 2
                    END,
                    l.ENDDATE DESC,
                    l.STARTDATE DESC,
                    l.LIMIT_VALUE DESC
            ) = 1
            ORDER BY v.WWTP
        """).fetchall()
    except Exception as e:
        visual["data_error"] = f"_rebuild_ef_flow_aaf_maf_table: {e}"
        return

    meta_by_plant = {
        wwtp: {
            "shortname": shortname,
            "description": description,
            "raw_limit_value": raw_limit_value,
            "units": units,
            "vartype": vartype,
            "limit_name": limit_name,
        }
        for wwtp, shortname, description, raw_limit_value, units, vartype, limit_name in meta_rows
    }

    columns = [
        "VARDESC.SHORTNAME",
        "LIMITS.DESCRIPTION",
        "Sum(LIMITS.LIMIT_VALUE)",
        "VARDESC.UNITS",
        "VARDESC.VARTYPE",
        "LIMITS.NAME",
    ]
    all_rows = []
    rows_by_plant = {}
    for wwtp in sorted(set(permit_by_plant) | set(meta_by_plant)):
        meta = meta_by_plant.get(wwtp, {})
        limit_value = permit_by_plant.get(wwtp, meta.get("raw_limit_value"))
        if limit_value is None:
            continue
        row = [
            meta.get("shortname", "Plnt Ef Flow Mgd"),
            meta.get("description", "Permit Limit"),
            limit_value,
            meta.get("units", "MGD"),
            meta.get("vartype", "P"),
            meta.get("limit_name", "AMAX"),
        ]
        all_rows.append(row)
        rows_by_plant[wwtp] = {"shape": "table", "columns": columns, "rows": [row]}

    visual["data_by_plant"] = rows_by_plant
    visual["data"] = {"shape": "table", "columns": columns, "rows": all_rows}


def _rebuild_hist_mo_ef_flow_mgd(page_spec, con):
    """Rebuild all-time monthly effluent-flow history with a single permit line."""
    visuals = page_spec.get("visuals", [])
    table = next((v for v in visuals if v.get("type") == "tableEx"), None)
    chart = next((v for v in visuals if v.get("type") == "lineClusteredColumnComboChart"), None)
    if not table or not chart:
        return

    permit_by_plant = _monthly_flow_permit_by_plant(con)
    try:
        monthly_rows = con.execute("""
            SELECT
                v.WWTP,
                YEAR(d.DATESTAMP) AS yr,
                MONTH(d.DATESTAMP) AS mo,
                AVG(d.CURVALUE) AS val
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow mgd%'
              AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP, yr, mo
            ORDER BY v.WWTP, yr, mo
        """).fetchall()
        meta_rows = con.execute(f"""
            SELECT
                v.WWTP,
                v."S. NAME" AS shortname,
                l.DESCRIPTION,
                l.LIMIT_VALUE AS raw_limit_value,
                v.UNITS,
                v.VARTYPE,
                l.NAME,
                CAST(l.ENDDATE AS VARCHAR) AS enddate
            FROM read_parquet('{TIER2}/LIMITS.parquet') l
            JOIN vardesc v ON l.VARID = v.VARID
            WHERE LOWER(v."S. NAME") LIKE '%plnt ef flow mgd%'
              AND v.WWTP IS NOT NULL
              AND l.ENDDATE >= DATE '2020-01-01'
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY v.WWTP
                ORDER BY
                    CASE
                        WHEN l.NAME = 'AMAX' THEN 0
                        WHEN l.NAME = 'MMAX' THEN 1
                        ELSE 2
                    END,
                    l.ENDDATE DESC,
                    l.STARTDATE DESC,
                    l.LIMIT_VALUE DESC
            ) = 1
            ORDER BY v.WWTP
        """).fetchall()
    except Exception as e:
        page_spec["_hist_mo_ef_flow_mgd_error"] = str(e)
        return

    meta_by_plant = {
        wwtp: {
            "shortname": shortname,
            "description": description,
            "raw_limit_value": raw_limit_value,
            "units": units,
            "vartype": vartype,
            "limit_name": limit_name,
            "enddate": enddate,
        }
        for wwtp, shortname, description, raw_limit_value, units, vartype, limit_name, enddate in meta_rows
    }

    by_plant = defaultdict(list)
    for wwtp, yr, mo, val in monthly_rows:
        by_plant[wwtp].append((f"{yr}-{mo:02d}", round(val, 3) if val is not None else None))

    chart["data_by_plant"] = {}
    for wwtp, entries in by_plant.items():
        xs = [x for x, _ in entries]
        vals = [val for _, val in entries]
        permit = permit_by_plant.get(wwtp, meta_by_plant.get(wwtp, {}).get("raw_limit_value"))
        chart["data_by_plant"][wwtp] = {
            "shape": "combo",
            "x": xs,
            "series": [
                {"name": "Monthly Avg Daily Flow", "role": "y", "values": vals},
                {"name": "100% Permit", "role": "y2", "values": [permit] * len(xs)},
            ],
        }
    if chart["data_by_plant"]:
        chart["data"] = chart["data_by_plant"][sorted(chart["data_by_plant"])[0]]

    table_columns = [
        "VARDESC.SHORTNAME",
        "LIMITS.DESCRIPTION",
        "Sum(LIMITS.LIMIT_VALUE)",
        "VARDESC.UNITS",
        "VARDESC.VARTYPE",
        "LIMITS.NAME",
        "LIMITS.ENDDATE",
    ]
    table["column_labels"] = {
        "VARDESC.SHORTNAME": "S. NAME",
        "LIMITS.DESCRIPTION": "Description",
        "Sum(LIMITS.LIMIT_VALUE)": "Limit Value",
        "VARDESC.UNITS": "Units",
        "VARDESC.VARTYPE": "Type",
        "LIMITS.NAME": "Name",
        "LIMITS.ENDDATE": "End Date",
    }
    table["data_by_plant"] = {}
    all_rows = []
    for wwtp in sorted(set(by_plant) | set(permit_by_plant) | set(meta_by_plant)):
        meta = meta_by_plant.get(wwtp, {})
        permit = permit_by_plant.get(wwtp, meta.get("raw_limit_value"))
        if permit is None:
            continue
        row = [[
            meta.get("shortname", "Plnt Ef Flow Mgd"),
            meta.get("description", "Yearly Average Maximum Limit"),
            permit,
            meta.get("units", "MGD"),
            meta.get("vartype", "P"),
            meta.get("limit_name", "AMAX"),
            meta.get("enddate", "2030-12-31 00:00:00"),
        ]]
        table["data_by_plant"][wwtp] = {"shape": "table", "columns": table_columns, "rows": row}
        all_rows.extend(row)
    table["data"] = {"shape": "table", "columns": table_columns, "rows": all_rows}


def _rebuild_permit_limits(page_spec, con):
    """Hydrate the Permit Limits page table directly from LIMITS + VARDESC."""
    table = next((v for v in page_spec.get("visuals", []) if v.get("type") == "tableEx"), None)
    if not table:
        return

    try:
        rows = con.execute(f"""
            SELECT
                v.WWTP,
                v.NAME,
                v.VARTYPE,
                CAST(v.LOCID AS BIGINT) AS locid,
                CAST(v.VARID AS BIGINT) AS varid,
                l.LIMIT_VALUE,
                COALESCE(l.LIMIT_VALUE_MGD, l.LIMIT_VALUE) AS limit_value_mgd,
                v.UNITS,
                l.DESCRIPTION,
                l.NAME,
                l.GROUPING,
                COALESCE(l.STATISTIC, v.STATISTIC) AS statistic,
                CAST(l.ENDDATE AS VARCHAR) AS enddate
            FROM read_parquet('{TIER2}/LIMITS.parquet') l
            JOIN vardesc v ON l.VARID = v.VARID
            WHERE v.NAME IS NOT NULL
              AND v.VARTYPE IN ('C', 'P')
              AND l.ENDDATE <= DATE '2030-12-31'
              AND v.WWTP IS NOT NULL
            ORDER BY v.WWTP, v.NAME, l.NAME, l.ENDDATE
        """).fetchall()
    except Exception as e:
        table["data_error"] = f"_rebuild_permit_limits: {e}"
        return

    permit_by_plant = _monthly_flow_permit_by_plant(con)

    def _is_flow_permit_row(name, units, description, limit_name):
        name_text = str(name or "").lower()
        desc_text = str(description or "").lower()
        limit_text = str(limit_name or "").upper()
        is_flow_name = ("eff flow" in name_text) or ("plnt ef flow" in name_text)
        is_flow_units = str(units or "").upper() == "MGD"
        is_annual_limit = (
            limit_text == "AMAX"
            or "annual average" in desc_text
            or "yearly average" in desc_text
        )
        return is_flow_name and is_flow_units and is_annual_limit

    columns = [
        "VARDESC.UD3",
        "VARDESC.NAME",
        "VARDESC.VARTYPE",
        "VARDESC.LOCID",
        "VARDESC.VARID",
        "Sum(LIMITS.LIMIT_VALUE)",
        "Sum(LIMITS.LIMIT_VALUE)1",
        "VARDESC.UNITS",
        "LIMITS.DESCRIPTION",
        "LIMITS.NAME",
        "LIMITS.GROUPING",
        "LIMITS.STATISTIC",
        "LIMITS.ENDDATE",
    ]

    shaped_rows = [
        [
            wwtp,
            name,
            vartype,
            locid,
            varid,
            permit_by_plant.get(wwtp, limit_value)
                if _is_flow_permit_row(name, units, desc, limit_name)
                else limit_value,
            limit_value_mgd,
            units,
            desc,
            limit_name,
            grouping,
            statistic,
            enddate,
        ]
        for wwtp, name, vartype, locid, varid, limit_value, limit_value_mgd, units, desc, limit_name, grouping, statistic, enddate in rows
    ]

    table["data"] = {
        "shape": "table",
        "columns": columns,
        "rows": shaped_rows,
    }
    table["data_by_plant"] = {}
    for plant in sorted({row[0] for row in shaped_rows}):
        table["data_by_plant"][plant] = {
            "shape": "table",
            "columns": columns,
            "rows": [row for row in shaped_rows if row[0] == plant],
        }


DMR_5YR_METRICS = {
    "dt-dmr-5yr-ef-flow-mgd": {
        "source_field": "s_name_2",
        "source_values": ["Plnt Ef Flow Mgd"],
        "page_heading": "DMR 5-Year Effluent Flow",
        "primary_series": "Monthly Avg Daily Flow",
        "units": "MGD",
        "footer_copy": "Historical effluent flow is rebuilt from monthly averages over the latest five years.",
        "limit_mode": "all_latest_by_name",
    },
    "dt-dmr-5yr-ef-cbod": {
        "source_field": "s_name_2",
        "source_values": ["Plnt Ef CBOD MAvg"],
        "page_heading": "DMR 5-Year Effluent CBOD",
        "primary_series": "Monthly Avg CBOD",
        "units": "mg/L",
        "footer_copy": "Historical effluent CBOD is rebuilt from monthly averages over the latest five years.",
        "limit_mode": "preferred_single_limit",
    },
    "dt-dmr-5yr-ef-tss": {
        "source_field": "s_name_2",
        "source_values": ["Plnt Ef TSS MAvg"],
        "page_heading": "DMR 5-Year Effluent TSS",
        "primary_series": "Monthly Avg TSS",
        "units": "mg/L",
        "footer_copy": "Historical effluent TSS is rebuilt from monthly averages over the latest five years.",
        "limit_mode": "preferred_single_limit",
    },
    "dt-dmr-5yr-ef-nh3-n": {
        "source_field": "s_name_2",
        "source_values": ["Plnt Ef NH3-N MAvg"],
        "page_heading": "DMR 5-Year Effluent NH3-N",
        "primary_series": "Monthly Avg NH3-N",
        "units": "mg/L",
        "footer_copy": "Historical effluent NH3-N is rebuilt from monthly averages over the latest five years.",
        "limit_mode": "preferred_single_limit",
    },
    "dmr-5yr-ef-cbod-loading": {
        "source_field": "s_name_2",
        "source_values": ["Efncy Pr Eff CBOD Load MAvg"],
        "page_heading": "DMR 5-Year Effluent CBOD Loading",
        "primary_series": "Monthly Avg CBOD Loading",
        "units": "LB/DAY",
        "footer_copy": "Historical effluent CBOD loading is rebuilt from monthly averages over the latest five years.",
        "limit_mode": "preferred_single_limit",
    },
    "dmr-5yr-ef-tss-loading": {
        "source_field": "s_name_2",
        "source_values": ["Efncy Pr Eff TSS Load MAvg"],
        "page_heading": "DMR 5-Year Effluent TSS Loading",
        "primary_series": "Monthly Avg TSS Loading",
        "units": "LB/DAY",
        "footer_copy": "Historical effluent TSS loading is rebuilt from monthly averages over the latest five years.",
        "limit_mode": "preferred_single_limit",
    },
    "dmr-5yr-ef-nh3-n-loading": {
        "source_field": "s_name_2",
        "source_values": ["Efncy Pr Eff NH3-N Load MAvg"],
        "page_heading": "DMR 5-Year Effluent NH3-N Loading",
        "primary_series": "Monthly Avg NH3-N Loading",
        "units": "LB/DAY",
        "footer_copy": "Historical effluent NH3-N loading is rebuilt from monthly averages over the latest five years.",
        "limit_mode": "preferred_single_limit",
    },
    "dmr-5yr-ef-do-loading": {
        "source_field": "s_name",
        "source_values": ["Plnt Ef Diss Oxygen"],
        "monthly_agg": "MIN",
        "page_heading": "DMR 5-Year Effluent Dissolved Oxygen",
        "primary_series": "Monthly Min Dissolved Oxygen",
        "units": "mg/L",
        "footer_copy": "Historical effluent dissolved oxygen is rebuilt from monthly daily minima over the latest five years.",
        "limit_mode": "preferred_single_limit",
        "limit_priority_substrings": ["daily minimum"],
    },
    "dmr-5yr-ecoli": {
        "source_field": "s_name_2",
        "source_values": ["Plnt Ef E.coli"],
        "page_heading": "DMR 5-Year Effluent E.Coli",
        "primary_series": "Monthly Avg E.Coli",
        "units": "MPN/100ML",
        "footer_copy": "Historical effluent E.Coli is rebuilt from monthly averages over the latest five years.",
        "limit_mode": "preferred_single_limit",
        "limit_priority_substrings": ["monthly mean", "monthly average"],
    },
    "dmr-5yr-ph-field": {
        "source_field": "s_name_2",
        "source_values": ["Plnt Ef pH Field", "Plnt Ef  pH Field"],
        "page_heading": "DMR 5-Year Effluent pH Field",
        "primary_series": "Monthly Avg pH Field",
        "units": "S.U.",
        "footer_copy": "Historical effluent pH field values are rebuilt from monthly averages over the latest five years.",
        "limit_mode": "all_latest_by_name",
    },
}


def _field_expr(field_key):
    return {
        "name": "v.NAME",
        "s_name": 'v."S. NAME"',
        "s_name_2": 'v."S. Name 2"',
    }[field_key]


def _like_filter_sql(field_key, patterns, exclude_patterns=None):
    include = " OR ".join([f"LOWER(COALESCE({_field_expr(field_key)}, '')) LIKE ?" for _ in patterns]) or "FALSE"
    clauses = [f"({include})"]
    params = [f"%{pattern.lower()}%" for pattern in patterns]
    if exclude_patterns:
        exclude = " AND ".join([f"LOWER(COALESCE({_field_expr(field_key)}, '')) NOT LIKE ?" for _ in exclude_patterns])
        clauses.append(f"({exclude})")
        params.extend([f"%{pattern.lower()}%" for pattern in exclude_patterns])
    return " AND ".join(clauses), params


def _like_filter_sql_expr(field_expr, patterns, exclude_patterns=None):
    include = " OR ".join([f"LOWER(COALESCE({field_expr}, '')) LIKE ?" for _ in patterns]) or "FALSE"
    clauses = [f"({include})"]
    params = [f"%{pattern.lower()}%" for pattern in patterns]
    if exclude_patterns:
        exclude = " AND ".join([f"LOWER(COALESCE({field_expr}, '')) NOT LIKE ?" for _ in exclude_patterns])
        clauses.append(f"({exclude})")
        params.extend([f"%{pattern.lower()}%" for pattern in exclude_patterns])
    return " AND ".join(clauses), params


KPI_GRID_PAGES = {
    "if-rem-ef-cbod-tss-nh3-n": {
        "heading": "Influent, % Rem & Effluent KPI",
        "subtitle": "CBOD, TSS, and NH3-N performance views for the selected plant.",
        "columns": 3,
        "footer_copy": "Curated KPI tiles are rebuilt from plant-level daily measurements and current permit rows.",
        "tiles": [
            {
                "visual_index": 9,
                "title": "CBOD Influent vs Effluent",
                "kind": "xy",
                "units": "mg/L",
                "series_groups": [
                    {"label": "Influent", "field": "s_name_2", "patterns": ["Plnt If CBOD"]},
                    {"label": "Effluent", "field": "s_name", "patterns": ["Eff CBOD5 Rnd", "Eff CBOD Rnd"]},
                ],
            },
            {
                "visual_index": 0,
                "title": "CBOD % Removal",
                "kind": "xy",
                "field": "name",
                "patterns": ["Efncy Pr CBOD % Rem"],
                "agg": "MIN",
                "units": "%",
            },
            {
                "visual_index": 6,
                "title": "Effluent CBOD vs Permit",
                "kind": "combo",
                "field": "s_name",
                "patterns": ["Eff CBOD5 Rnd", "Eff CBOD Rnd"],
                "limit_mode": "preferred_single_limit",
                "limit_priority_substrings": ["daily maximum", "daily mean", "monthly average"],
                "units": "mg/L",
            },
            {
                "visual_index": 10,
                "title": "TSS Influent vs Effluent",
                "kind": "xy",
                "units": "mg/L",
                "series_groups": [
                    {"label": "Influent", "field": "s_name_2", "patterns": ["Plnt If TSS"]},
                    {"label": "Effluent", "field": "s_name", "patterns": ["Eff TSS Rnd"]},
                ],
            },
            {
                "visual_index": 3,
                "title": "TSS % Removal",
                "kind": "xy",
                "field": "name",
                "patterns": ["Efncy Pr TSS % Rem"],
                "units": "%",
            },
            {
                "visual_index": 7,
                "title": "Effluent TSS vs Permit",
                "kind": "combo",
                "field": "s_name",
                "patterns": ["Eff TSS Rnd"],
                "limit_mode": "preferred_single_limit",
                "limit_priority_substrings": ["daily maximum", "daily mean", "monthly average"],
                "units": "mg/L",
            },
            {
                "visual_index": 11,
                "title": "NH3-N Influent vs Effluent",
                "kind": "xy",
                "units": "mg/L",
                "series_groups": [
                    {"label": "Influent", "field": "s_name_2", "patterns": ["Plnt If NH3-N"]},
                    {"label": "Effluent", "field": "s_name", "patterns": ["Eff NH3N Rnd", "Eff NH3-N Rnd"], "exclude_patterns": ["Calc"]},
                ],
            },
            {
                "visual_index": 4,
                "title": "NH3-N % Removal",
                "kind": "xy",
                "field": "name",
                "patterns": ["Efncy Pr NH3-N % Rem"],
                "units": "%",
            },
            {
                "visual_index": 8,
                "title": "Effluent NH3-N vs Permit",
                "kind": "combo",
                "field": "s_name",
                "patterns": ["Eff NH3N Rnd", "Eff NH3-N Rnd"],
                "exclude_patterns": ["Calc"],
                "limit_mode": "all_latest_by_name",
                "units": "mg/L",
            },
        ],
    },
    "plant-efficiency-process-evaluation": {
        "heading": "Plant Process Efficiency KPI",
        "subtitle": "Process efficiency metrics grouped by pollutant family for the selected plant.",
        "columns": 4,
        "footer_copy": "Each tile is rebuilt from the PBIX visual-level parameter filters for process efficiency.",
        "tiles": [
            {"visual_index": 4, "title": "Influent CBOD Load", "kind": "xy", "field": "name", "patterns": ["Efncy Pr Inf CBOD Load"], "units": "LB/DAY"},
            {"visual_index": 5, "title": "Effluent CBOD Load", "kind": "xy", "field": "name", "patterns": ["Efncy Pr Eff CBOD Load"], "exclude_patterns": ["MAvg"], "units": "LB/DAY"},
            {"visual_index": 6, "title": "CBOD Removal", "kind": "xy", "field": "name", "patterns": ["Efncy Pr CBOD Removal"], "units": "%"},
            {"visual_index": 7, "title": "CBOD % Removal", "kind": "xy", "field": "name", "patterns": ["Efncy Pr CBOD % Rem"], "agg": "MIN", "units": "%"},
            {"visual_index": 8, "title": "Influent TSS Load", "kind": "xy", "field": "name", "patterns": ["Efncy Pr Inf TSS Load"], "units": "LB/DAY"},
            {"visual_index": 9, "title": "Effluent TSS Load", "kind": "xy", "field": "name", "patterns": ["Efncy Pr Eff TSS Load"], "exclude_patterns": ["MAvg"], "units": "LB/DAY"},
            {"visual_index": 18, "title": "TSS Removal", "kind": "xy", "field": "name", "patterns": ["Efncy Pr TSS Removal"], "units": "%"},
            {"visual_index": 19, "title": "TSS % Removal", "kind": "xy", "field": "name", "patterns": ["Efncy Pr TSS % Rem"], "units": "%"},
            {"visual_index": 12, "title": "Influent NH3-N Load", "kind": "xy", "field": "name", "patterns": ["Efncy Pr Inf NH3-N Load"], "units": "LB/DAY"},
            {"visual_index": 13, "title": "Effluent NH3-N Load", "kind": "xy", "field": "name", "patterns": ["Efncy Pr Eff NH3-N Load"], "exclude_patterns": ["MAvg"], "units": "LB/DAY"},
            {"visual_index": 14, "title": "NH3-N Removal", "kind": "xy", "field": "name", "patterns": ["Efncy Pr NH3-N Removal"], "units": "%"},
            {"visual_index": 15, "title": "NH3-N % Removal", "kind": "xy", "field": "name", "patterns": ["Efncy Pr NH3-N % Rem"], "units": "%"},
            {"visual_index": 16, "title": "Effluent CBOD Round", "kind": "xy", "field": "name", "patterns": ["Plnt Ef CBOD Rnd"], "units": "mg/L"},
            {"visual_index": 17, "title": "Effluent TSS Round", "kind": "xy", "field": "name", "patterns": ["Plnt Ef TSS Rnd"], "units": "mg/L"},
            {"visual_index": 10, "title": "Effluent NH3-N Round", "kind": "xy", "field": "name", "patterns": ["Plnt Ef NH3-N Rnd", "Plnt Ef NH3N Rnd"], "exclude_patterns": ["Calc"], "units": "mg/L"},
            {"visual_index": 11, "title": "Effluent Flow", "kind": "xy", "field": "name", "patterns": ["Eff Flow"], "units": "MGD"},
        ],
    },
    "multi-var-operational-parameters": {
        "heading": "Operational KPI",
        "subtitle": "Daily operational parameters and clarifier/aeration indicators for the selected plant.",
        "columns": 4,
        "footer_copy": "Operational KPI tiles are rebuilt from the PBIX chart filters so each plant shows the intended parameter family.",
        "tiles": [
            {"visual_index": 5, "title": "Influent Flow, MGD", "kind": "xy", "field": "s_name", "patterns": ["If FLOW MGD"], "units": "MGD"},
            {"visual_index": 6, "title": "S Aer 01 Residue Total", "kind": "xy", "field": "s_name", "patterns": ["S Aer 01 Residue Tot"], "units": "mg/L"},
            {"visual_index": 7, "title": "S Aer 01 Residue Volatile", "kind": "xy", "field": "s_name", "patterns": ["S Aer 01 Residuevoln"], "units": "ml/L"},
            {"visual_index": 8, "title": "S Aer 01 Settleability, 30 Min", "kind": "xy", "field": "s_name", "patterns": ["S Aer 01 Setblty, 30"], "agg": "MIN", "units": "%"},
            {"visual_index": 9, "title": "Influent CBOD", "kind": "xy", "field": "name", "patterns": ["if cbod"], "exclude_patterns": ["if cbod 7-Day"], "units": "mg/L"},
            {"visual_index": 10, "title": "S Aer 01 VSS/TSS %", "kind": "xy", "field": "s_name", "patterns": ["S Aer 01 VSS/TSS %"], "units": "%"},
            {"visual_index": 19, "title": "SVI", "kind": "xy", "field": "s_name", "patterns": ["SVI"], "units": "mL/g"},
            {"visual_index": 20, "title": "RAS 01 Settleability", "kind": "xy", "field": "s_name_2", "patterns": ["RAS 01 Setblty"], "units": "%"},
            {"visual_index": 13, "title": "Influent NH3-N", "kind": "xy", "field": "name", "patterns": ["Plnt if nh3-n"], "units": "mg/L"},
            {"visual_index": 14, "title": "RAS 01 Residue Total", "kind": "xy", "field": "s_name", "patterns": ["RAS 01 Residue Totnf"], "units": "mg/L"},
            {"visual_index": 15, "title": "RAS 01 Residue Volatile", "kind": "xy", "field": "s_name", "patterns": ["RAS 01 Residuevolnfl"], "units": "ml/L"},
            {"visual_index": 16, "title": "RAS 01 VSS/TSS %", "kind": "xy", "field": "s_name_2", "patterns": ["RAS 01 VSS/TSS %"], "units": "%"},
            {"visual_index": 17, "title": "Influent TSS", "kind": "xy", "field": "name", "patterns": ["Plnt If TSS"], "units": "mg/L"},
            {"visual_index": 18, "title": "2-Hour Peak Flow, GPM", "kind": "xy", "field": "s_name", "patterns": ["2Hr Peak Flow Gpm", "Gpm"], "units": "GPM"},
            {"visual_index": 11, "title": "S Clr 01 Wasting Hr/Day", "kind": "xy", "field": "s_name", "patterns": ["S Clr 01 Wasting Hr"], "units": "hr/day"},
            {"visual_index": 12, "title": "S Clr 01 Depth Of Blanket", "kind": "xy", "field": "s_name_2", "patterns": ["S Clr 01 Depth Of"], "units": "ft"},
        ],
    },
    "regulatory-parameters-1-3x3": {
        "heading": "Regulatory KPI (1/3)",
        "subtitle": "Permit-comparison tiles for rounded effluent parameters and permit-sensitive flow metrics.",
        "columns": 3,
        "footer_copy": "Regulatory KPI (1/3) is rebuilt from PBIX chart-level parameter filters and current permit rows.",
        "tiles": [
            {"visual_index": 3, "title": "Effluent Flow Annual Avg", "kind": "combo", "field": "name", "patterns": ["Ef FLOW Annual"], "label": "Effluent Flow Annual Avg", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["annual average", "annual", "monthly average"], "units": "MGD"},
            {"visual_index": 4, "title": "2-Hour Peak Flow", "kind": "combo", "field": "s_name_2", "patterns": ["Plnt Ef 2Hr Peak Flow Gpm"], "label": "2-Hour Peak Flow", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["dmax", "daily maximum", "maximum"], "units": "GPM"},
            {"visual_index": 5, "title": "Dissolved Oxygen", "kind": "combo", "field": "name", "patterns": ["Dissolved"], "label": "Dissolved Oxygen", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["daily minimum", "minimum", "monthly mean"], "units": "mg/L"},
            {"visual_index": 15, "title": "pH Field", "kind": "combo", "field": "name", "patterns": ["Ph Field"], "label": "pH Field", "limit_mode": "all_latest_by_name", "limit_priority_substrings": ["minimum", "maximum"], "units": "s.u."},
            {"visual_index": 7, "title": "E.Coli", "kind": "combo", "field": "name", "patterns": ["E.Coli"], "label": "E.Coli", "limit_mode": "all_latest_by_name", "limit_priority_substrings": ["daily maximum", "geometric", "monthly mean"], "units": "MPN/100mL"},
            {"visual_index": 6, "title": "pH Field", "kind": "combo", "field": "name", "patterns": ["Ph Field"], "label": "pH Field", "limit_mode": "all_latest_by_name", "limit_priority_substrings": ["minimum", "maximum"], "units": "s.u."},
            {"visual_index": 0, "title": "Effluent CBOD Round", "kind": "combo", "field": "name", "patterns": ["Plnt Ef CBOD Rnd", "Plnt Ef CBOD5 Rnd"], "label": "Effluent CBOD Round", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["daily maximum", "daily mean", "monthly average"], "units": "mg/L"},
            {"visual_index": 1, "title": "Effluent NH3-N Round", "kind": "combo", "field": "name", "patterns": ["Plnt Ef NH3-N Rnd", "Plnt Ef NH3N Rnd"], "exclude_patterns": ["Calc"], "label": "Effluent NH3-N Round", "limit_mode": "all_latest_by_name", "units": "mg/L"},
            {"visual_index": 2, "title": "Effluent TSS Round", "kind": "combo", "field": "name", "patterns": ["Plnt Ef TSS Rnd"], "label": "Effluent TSS Round", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["daily maximum", "daily mean", "monthly average"], "units": "mg/L"},
        ],
    },
    "regulatory-parameters-2-3x3": {
        "heading": "Regulatory KPI (2/3)",
        "subtitle": "Weekly, monthly, and loading metrics for effluent regulatory tracking.",
        "columns": 3,
        "footer_copy": "Regulatory KPI (2/3) is rebuilt from the PBIX weekly/monthly/load parameter filters and active permit rows.",
        "tiles": [
            {"visual_index": 3, "title": "Effluent CBOD Weekly Avg", "kind": "combo", "field": "s_name", "patterns": ["Ef CBOD Wk AVG", "CBOD Wk AVG"], "label": "Effluent CBOD Weekly Avg", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["weekly", "7-day", "daily maximum"], "units": "mg/L"},
            {"visual_index": 4, "title": "Effluent NH3-N Weekly Avg", "kind": "combo", "field": "s_name", "patterns": ["Ef NH3-N Wk AVG"], "label": "Effluent NH3-N Weekly Avg", "limit_mode": "all_latest_by_name", "units": "mg/L"},
            {"visual_index": 5, "title": "Effluent TSS Weekly Avg", "kind": "combo", "field": "s_name", "patterns": ["Ef TSS Wk AVG"], "label": "Effluent TSS Weekly Avg", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["weekly", "7-day", "daily maximum"], "units": "mg/L"},
            {"visual_index": 6, "title": "Effluent CBOD Load Avg", "kind": "combo", "field": "s_name", "patterns": ["CBOD Load Avg", "Eff CBOD Load Av"], "label": "Effluent CBOD Load Avg", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["monthly average", "average"], "units": "LB/DAY"},
            {"visual_index": 8, "title": "Effluent NH3-N Load Avg", "kind": "combo", "field": "s_name", "patterns": ["NH3N Load Avg", "Eff NH3N Load Av"], "label": "Effluent NH3-N Load Avg", "limit_mode": "all_latest_by_name", "units": "LB/DAY"},
            {"visual_index": 7, "title": "Effluent TSS Load Avg", "kind": "combo", "field": "s_name", "patterns": ["Eff TSS Load Avg"], "label": "Effluent TSS Load Avg", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["monthly average", "average"], "units": "LB/DAY"},
            {"visual_index": 0, "title": "Effluent CBOD Monthly Avg", "kind": "combo", "field": "name", "patterns": ["Plnt Ef CBOD MAvg"], "label": "Effluent CBOD Monthly Avg", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["monthly average", "monthly"], "units": "mg/L"},
            {"visual_index": 1, "title": "Effluent NH3-N Monthly Avg", "kind": "combo", "field": "name", "patterns": ["Plnt Ef NH3-N MAvg", "Plnt Ef NH3N MAvg"], "exclude_patterns": ["Calc"], "label": "Effluent NH3-N Monthly Avg", "limit_mode": "all_latest_by_name", "units": "mg/L"},
            {"visual_index": 2, "title": "Effluent TSS Monthly Avg", "kind": "combo", "field": "name", "patterns": ["Plnt Ef TSS MAvg"], "label": "Effluent TSS Monthly Avg", "limit_mode": "preferred_single_limit", "limit_priority_substrings": ["monthly average", "monthly"], "units": "mg/L"},
        ],
    },
    "regulatory-kpi-33": {
        "heading": "Regulatory KPI (3/3)",
        "subtitle": "Daily regulatory spot-check tiles rebuilt from the curated plant parameter selection table.",
        "columns": 4,
        "footer_copy": "Regulatory KPI (3/3) is rebuilt from vt_SelectParams_byWWTP so the page behaves like the PBIX bookmark view.",
        "tiles": [
            {"visual_index": 5, "title": "Effluent Flow Annual Avg", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef FLOW Annual Avg"], "label": "Effluent Flow Annual Avg", "units": "MGD"},
            {"visual_index": 7, "title": "Effluent Flow Monthly Avg", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef FLOW Month Avg"], "label": "Effluent Flow Monthly Avg", "units": "MGD"},
            {"visual_index": 8, "title": "Effluent Flow MGD", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef Flow Mgd"], "label": "Effluent Flow MGD", "units": "MGD"},
            {"visual_index": 9, "title": "2-Hour Peak Flow", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef 2Hr Peak Flow Gpm"], "label": "2-Hour Peak Flow", "units": "GPM"},
            {"visual_index": 10, "title": "Influent CBOD", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt If CBOD"], "label": "Influent CBOD", "units": "mg/L"},
            {"visual_index": 13, "title": "Influent NH3-N", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt If NH3-N"], "label": "Influent NH3-N", "units": "mg/L"},
            {"visual_index": 16, "title": "Influent TSS", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt If TSS"], "label": "Influent TSS", "units": "mg/L"},
            {"visual_index": 19, "title": "Dissolved Oxygen", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef Dissolved Oxygen"], "label": "Dissolved Oxygen", "units": "mg/L"},
            {"visual_index": 11, "title": "Effluent CBOD 7-Day Avg", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef CBOD 7-Day Avg"], "label": "Effluent CBOD 7-Day Avg", "units": "mg/L"},
            {"visual_index": 14, "title": "Effluent NH3-N 7-Day Avg", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef NH3-N 7-Day Avg"], "label": "Effluent NH3-N 7-Day Avg", "units": "mg/L"},
            {"visual_index": 17, "title": "Effluent TSS 7-Day Avg", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef TSS 7-Day Avg"], "label": "Effluent TSS 7-Day Avg", "units": "mg/L"},
            {"visual_index": 20, "title": "pH Field", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef pH Field"], "label": "pH Field", "units": "s.u."},
            {"visual_index": 12, "title": "Effluent CBOD Monthly Avg", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef CBOD MAvg"], "label": "Effluent CBOD Monthly Avg", "units": "mg/L"},
            {"visual_index": 15, "title": "Effluent NH3-N Monthly Avg", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef NH3-N MAvg"], "label": "Effluent NH3-N Monthly Avg", "units": "mg/L"},
            {"visual_index": 18, "title": "Effluent TSS Monthly Avg", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["Plnt Ef TSS MAvg"], "label": "Effluent TSS Monthly Avg", "units": "mg/L"},
            {"visual_index": 21, "title": "Settleability, 30 Min", "kind": "xy", "source": "select_params", "field": "s_name_2", "patterns": ["S Aer 01 Setblty, 30 Min %"], "label": "Settleability, 30 Min", "units": "%"},
        ],
    },
    "s-aeration": {
        "heading": "S. Aeration (TSS, VSS, Setblty 30 min %)",
        "subtitle": "Aeration-basin solids, volatile solids, and settleability trends for the selected plant.",
        "columns": 1,
        "footer_copy": "S. Aeration is rebuilt from the aeration-family parameter filters so the series stay inside the intended process group.",
        "tiles": [
            {"visual_index": 7, "title": "Residue Total & Volatile", "kind": "xy", "field": "s_name", "patterns": ["Residue Tot", "Residuevoln"], "exclude_patterns": ["RAS", "WAS", "Dig", "Plnt If", "Plnt Ef", "Thck"], "series_name_include_patterns": ["s aer"], "series_name_exclude_patterns": ["was", "ras", "dig", "thck", "plnt if", "plnt ef"], "agg": "AVG"},
            {"visual_index": 8, "title": "VSS/TSS %", "kind": "xy", "field": "name", "patterns": ["VSS/TSS %"], "exclude_patterns": ["RAS", "WAS", "Dig"], "series_name_include_patterns": ["s aer"], "series_name_exclude_patterns": ["thck", "was", "ras", "dig"], "agg": "AVG", "units": "%"},
            {"visual_index": 9, "title": "Settleability, 30 Min %", "kind": "xy", "field": "name", "patterns": ["Setblty, 30 Min %"], "exclude_patterns": ["RAS", "WAS"], "series_name_include_patterns": ["s aer"], "series_name_exclude_patterns": ["ras", "was"], "agg": "AVG", "units": "%"},
        ],
    },
    "clarifier": {
        "heading": "Clarifier (Blanket Depth & Wasting)",
        "subtitle": "Depth-of-blanket and wasting trends for the selected plant.",
        "columns": 1,
        "footer_copy": "Clarifier charts are rebuilt from clarifier-specific depth and wasting parameter families.",
        "tiles": [
            {"visual_index": 7, "title": "Depth of Blanket", "kind": "xy", "field": "s_name", "patterns": ["S Clr", "Depth Of Bl"], "agg": "AVG", "units": "ft"},
            {"visual_index": 8, "title": "Wasting Hr/Day", "kind": "xy", "field": "s_name", "patterns": ["Wasting Hr"], "exclude_patterns": ["Min/Day"], "agg": "AVG", "units": "hr/day"},
        ],
    },
    "svi": {
        "heading": "SVI (Sludge Volume Index)",
        "subtitle": "Sludge volume index trends for the selected plant.",
        "columns": 1,
        "footer_copy": "SVI is rebuilt from the aeration-basin SVI parameter family for a clean single-metric view.",
        "tiles": [
            {"visual_index": 1, "title": "Sludge Volume Index", "kind": "xy", "field": "s_name", "patterns": ["SVI"], "agg": "AVG", "units": "mL/g"},
        ],
    },
    "ras-01": {
        "heading": "RAS 01 (TSS, VSS, Setblty 30 min %)",
        "subtitle": "Return activated sludge solids, volatile solids, and settleability trends for the selected plant.",
        "columns": 1,
        "footer_copy": "RAS 01 is rebuilt from RAS-specific residue, ratio, and settleability parameter families.",
        "tiles": [
            {"visual_index": 6, "title": "Residue Total & Volatile", "kind": "xy", "field": "s_name", "patterns": ["Residue Totnf", "Residuevolnfl"], "series_name_include_patterns": ["ras"], "series_name_exclude_patterns": ["was", "dig", "s aer", "thck", "plnt if", "plnt ef"], "agg": "AVG"},
            {"visual_index": 8, "title": "VSS/TSS %", "kind": "xy", "field": "name", "patterns": ["VSS/TSS %"], "series_name_include_patterns": ["ras"], "series_name_exclude_patterns": ["was", "dig", "s aer", "thck"], "agg": "AVG", "units": "%"},
            {"visual_index": 9, "title": "Settleability, 30 Min %", "kind": "xy", "field": "name", "patterns": ["Setblty, 30 Min %"], "series_name_include_patterns": ["ras"], "series_name_exclude_patterns": ["was", "dig", "s aer"], "agg": "AVG", "units": "%"},
        ],
    },
    "was-01": {
        "heading": "WAS 01 (TSS, VSS)",
        "subtitle": "Waste activated sludge solids, volatile solids, and ratio trends for the selected plant.",
        "columns": 1,
        "footer_copy": "WAS 01 is rebuilt from WAS-specific residue and ratio parameter families.",
        "tiles": [
            {"visual_index": 7, "title": "Residue Total & Volatile", "kind": "xy", "field": "s_name", "patterns": ["Residue Totnf", "Residuevolnfl"], "series_name_include_patterns": ["was"], "series_name_exclude_patterns": ["ras", "dig", "s aer", "thck", "plnt if", "plnt ef"], "agg": "AVG"},
            {"visual_index": 8, "title": "VSS/TSS %", "kind": "xy", "field": "name", "patterns": ["VSS/TSS %"], "series_name_include_patterns": ["was"], "series_name_exclude_patterns": ["ras", "dig", "s aer", "thck"], "agg": "AVG", "units": "%"},
        ],
    },
    "dig-01": {
        "heading": "Digestor 01 (TSS, VSS)",
        "subtitle": "Digestor solids, volatile solids, and ratio trends for the selected plant.",
        "columns": 1,
        "footer_copy": "Digestor 01 is rebuilt from digester-specific residue and ratio parameter families.",
        "tiles": [
            {"visual_index": 0, "title": "Residue Total & Volatile", "kind": "xy", "field": "s_name", "patterns": ["Dig 01 Residue Totnf", "Dig 01 Residuevolnfl"], "agg": "AVG"},
            {"visual_index": 7, "title": "VSS/TSS %", "kind": "xy", "field": "s_name", "patterns": ["Dig 01 VSS/TSS %"], "agg": "AVG", "units": "%"},
        ],
    },
}


def _rows_to_series_shape(rows, roles_by_name=None, shape="xy_series"):
    by_plant = defaultdict(lambda: defaultdict(dict))
    xs_per_plant = defaultdict(list)
    seen_x = defaultdict(set)

    for wwtp, x, series_name, value in rows:
        if x not in seen_x[wwtp]:
            seen_x[wwtp].add(x)
            xs_per_plant[wwtp].append(x)
        by_plant[wwtp][series_name][x] = value

    out = {}
    for wwtp, series_map in by_plant.items():
        xs = sorted(xs_per_plant[wwtp])
        series = []
        for series_name in sorted(series_map):
            payload = {
                "name": series_name,
                "values": [series_map[series_name].get(x) for x in xs],
            }
            role = (roles_by_name or {}).get(series_name)
            if role:
                payload["role"] = role
            series.append(payload)
        out[wwtp] = {"shape": shape, "x": xs, "series": series}
    return out


def _non_null_count(values):
    return sum(1 for value in values if value is not None)


def _normalize_kpi_series_name(name):
    if not name:
        return name
    return re.sub(r"^[A-Z0-9-]{2,4}\s+", "", str(name)).strip()


def _select_params_field_expr(field_key):
    return {
        "s_name_2": 'sp."S. Name 2"',
    }[field_key]


def _prune_sparse_series(payload):
    series = payload.get("series", [])
    y_series = [item for item in series if item.get("role") != "y2"]
    deduped = {}
    for item in y_series:
        normalized = _normalize_kpi_series_name(item.get("name"))
        candidate = {**item, "name": normalized}
        current = deduped.get(normalized)
        if current is None or _non_null_count(candidate.get("values", [])) > _non_null_count(current.get("values", [])):
            deduped[normalized] = candidate
    y_series = list(deduped.values())
    if len(y_series) <= 1:
        payload["series"] = y_series + [item for item in series if item.get("role") == "y2"]
        return payload
    max_count = max((_non_null_count(item.get("values", [])) for item in y_series), default=0)
    if max_count <= 0:
        return payload
    min_keep = max(10, int(max_count * 0.1))
    kept = [item for item in y_series if _non_null_count(item.get("values", [])) >= min_keep]
    if not kept:
        kept = y_series
    payload["series"] = kept + [item for item in series if item.get("role") == "y2"]
    return payload


def _filter_kpi_rows_by_series_name(rows, include_patterns=None, exclude_patterns=None):
    if not include_patterns and not exclude_patterns:
        return rows
    include_patterns = [p.lower() for p in (include_patterns or [])]
    exclude_patterns = [p.lower() for p in (exclude_patterns or [])]
    filtered = []
    for wwtp, x, series_name, value in rows:
        text = str(series_name or "").lower()
        if include_patterns and not any(p in text for p in include_patterns):
            continue
        if exclude_patterns and any(p in text for p in exclude_patterns):
            continue
        filtered.append((wwtp, x, series_name, value))
    return filtered


def _query_kpi_rows(con, *, cutoff, field, patterns, exclude_patterns=None, agg="AVG", label=None):
    where_sql, params = _like_filter_sql(field, patterns, exclude_patterns)
    plant_expr = "COALESCE(d.WWTP, v.WWTP)"
    if label:
        rows = con.execute(f"""
            SELECT
                {plant_expr} AS wwtp,
                CAST(d.DATESTAMP AS VARCHAR) AS x,
                {agg}(d.CURVALUE) AS val
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE d.DATESTAMP >= DATE '{cutoff.isoformat()}'
              AND {plant_expr} IS NOT NULL
              AND {where_sql}
            GROUP BY {plant_expr}, x
            ORDER BY {plant_expr}, x
        """, params).fetchall()
        return [(wwtp, x[:10], label, val) for wwtp, x, val in rows]

    rows = con.execute(f"""
        SELECT
            {plant_expr} AS wwtp,
            CAST(d.DATESTAMP AS VARCHAR) AS x,
            COALESCE(v.NAME, v."S. NAME", v."S. Name 2") AS series_name,
            {agg}(d.CURVALUE) AS val
        FROM datatbl d
        JOIN vardesc v ON d.VARID = v.VARID
        WHERE d.DATESTAMP >= DATE '{cutoff.isoformat()}'
          AND {plant_expr} IS NOT NULL
          AND {where_sql}
        GROUP BY {plant_expr}, x, series_name
        ORDER BY {plant_expr}, x, series_name
    """, params).fetchall()
    return [(wwtp, x[:10], series_name, val) for wwtp, x, series_name, val in rows]


def _query_kpi_rows_from_select_params(con, *, cutoff, field, patterns, exclude_patterns=None, agg="AVG", label=None):
    field_expr = _select_params_field_expr(field)
    where_sql, params = _like_filter_sql_expr(field_expr, patterns, exclude_patterns)
    if label:
        rows = con.execute(f"""
            SELECT
                sp.WWTP AS wwtp,
                CAST(sp.DATESTAMP AS VARCHAR) AS x,
                {agg}(sp.CURVALUE) AS val
            FROM read_parquet('{TIER2}/vt_SelectParams_byWWTP.parquet') sp
            WHERE sp.DATESTAMP >= DATE '{cutoff.isoformat()}'
              AND sp.WWTP IS NOT NULL
              AND {where_sql}
            GROUP BY sp.WWTP, x
            ORDER BY sp.WWTP, x
        """, params).fetchall()
        return [(wwtp, x[:10], label, val) for wwtp, x, val in rows]

    rows = con.execute(f"""
        SELECT
            sp.WWTP AS wwtp,
            CAST(sp.DATESTAMP AS VARCHAR) AS x,
            {field_expr} AS series_name,
            {agg}(sp.CURVALUE) AS val
        FROM read_parquet('{TIER2}/vt_SelectParams_byWWTP.parquet') sp
        WHERE sp.DATESTAMP >= DATE '{cutoff.isoformat()}'
          AND sp.WWTP IS NOT NULL
          AND {where_sql}
        GROUP BY sp.WWTP, x, series_name
        ORDER BY sp.WWTP, x, series_name
    """, params).fetchall()
    return [(wwtp, x[:10], series_name, val) for wwtp, x, series_name, val in rows]


def _query_kpi_limits(con, *, field, patterns, exclude_patterns=None, mode="preferred_single_limit", priority_substrings=None):
    where_sql, params = _like_filter_sql(field, patterns, exclude_patterns)
    priority_substrings = priority_substrings or ["monthly average", "daily maximum", "daily minimum", "monthly mean"]
    priority_case = "\n".join([
        f"WHEN LOWER(COALESCE(l.DESCRIPTION, l.NAME, '')) LIKE '%{token.lower()}%' THEN {idx}"
        for idx, token in enumerate(priority_substrings)
    ]) or "WHEN 1=1 THEN 0"

    if mode == "all_latest_by_name":
        rows = con.execute(f"""
            SELECT
                v.WWTP,
                COALESCE(l.DESCRIPTION, l.NAME, 'Permit Limit') AS label,
                l.LIMIT_VALUE
            FROM read_parquet('{TIER2}/LIMITS.parquet') l
            JOIN vardesc v ON l.VARID = v.VARID
            WHERE v.WWTP IS NOT NULL
              AND l.ENDDATE >= DATE '2020-01-01'
              AND {where_sql}
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY v.WWTP, l.NAME, v.VARTYPE
                ORDER BY l.ENDDATE DESC, l.STARTDATE DESC
            ) = 1
            ORDER BY v.WWTP, label
        """, params).fetchall()
    else:
        rows = con.execute(f"""
            SELECT
                v.WWTP,
                COALESCE(l.DESCRIPTION, l.NAME, 'Permit Limit') AS label,
                l.LIMIT_VALUE
            FROM read_parquet('{TIER2}/LIMITS.parquet') l
            JOIN vardesc v ON l.VARID = v.VARID
            WHERE v.WWTP IS NOT NULL
              AND l.ENDDATE >= DATE '2020-01-01'
              AND {where_sql}
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY v.WWTP
                ORDER BY
                    CASE
                        {priority_case}
                        ELSE {len(priority_substrings)}
                    END,
                    l.ENDDATE DESC,
                    l.STARTDATE DESC,
                    l.LIMIT_VALUE DESC
            ) = 1
            ORDER BY v.WWTP, label
        """, params).fetchall()

    if _is_flow_permit_context(patterns):
        permit_by_plant = _monthly_flow_permit_by_plant(con)
        rows = [
            (wwtp, label, permit_by_plant.get(wwtp, limit_value))
            for wwtp, label, limit_value in rows
        ]

    return rows


def _apply_kpi_tile_data(visual, tile, con, cutoff):
    agg = tile.get("agg", "AVG")
    rows = []
    if tile.get("series_groups"):
        for group in tile["series_groups"]:
            rows.extend(_query_kpi_rows(
                con,
                cutoff=cutoff,
                field=group["field"],
                patterns=group["patterns"],
                exclude_patterns=group.get("exclude_patterns"),
                agg=group.get("agg", agg),
                label=group["label"],
            ))
    else:
        query_fn = _query_kpi_rows_from_select_params if tile.get("source") == "select_params" else _query_kpi_rows
        rows = query_fn(
            con,
            cutoff=cutoff,
            field=tile["field"],
            patterns=tile["patterns"],
            exclude_patterns=tile.get("exclude_patterns"),
            agg=agg,
            label=tile.get("label"),
        )

    rows = _filter_kpi_rows_by_series_name(
        rows,
        include_patterns=tile.get("series_name_include_patterns"),
        exclude_patterns=tile.get("series_name_exclude_patterns"),
    )

    visual["title"] = tile["title"]
    visual["custom_units"] = tile.get("units")

    if tile["kind"] == "combo":
        limit_rows = _query_kpi_limits(
            con,
            field=tile.get("limit_field", tile["field"]),
            patterns=tile.get("limit_patterns", tile.get("patterns", [])),
            exclude_patterns=tile.get("limit_exclude_patterns", tile.get("exclude_patterns")),
            mode=tile.get("limit_mode", "preferred_single_limit"),
            priority_substrings=tile.get("limit_priority_substrings"),
        )
        dbp = _rows_to_series_shape(rows, shape="combo")
        for wwtp, label, limit_value in limit_rows:
            payload = dbp.get(wwtp)
            if not payload or not payload.get("x"):
                continue
            payload["series"].append({
                "name": label,
                "role": "y2",
                "values": [limit_value] * len(payload["x"]),
            })
        for payload in dbp.values():
            for series in payload["series"]:
                if "role" not in series:
                    series["role"] = "y"
        visual["data_by_plant"] = {plant: _prune_sparse_series(payload) for plant, payload in dbp.items()}
    else:
        visual["data_by_plant"] = {
            plant: _prune_sparse_series(payload)
            for plant, payload in _rows_to_series_shape(rows, shape="xy_series").items()
        }

    plants_ord = sorted(visual.get("data_by_plant", {}))
    if plants_ord:
        visual["data"] = visual["data_by_plant"][plants_ord[0]]
    else:
        visual["data"] = {"shape": "combo" if tile["kind"] == "combo" else "xy_series", "x": [], "series": []}


def _hydrate_kpi_page_slicer_visuals(page_spec, tile_order):
    visuals = page_spec.get("visuals", [])
    plants = page_spec.get("plant_slicer", {}).get("options", []) or []
    all_dates = sorted({
        x
        for idx in tile_order
        for payload in (visuals[idx].get("data_by_plant") or {}).values()
        for x in (payload.get("x") or [])
    })
    year_options = sorted({x[:4] for x in all_dates if len(x) >= 4})
    month_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    month_options = sorted({
        month_labels[int(x[5:7]) - 1]
        for x in all_dates
        if len(x) >= 7 and x[5:7].isdigit() and 1 <= int(x[5:7]) <= 12
    }, key=month_labels.index)
    quarter_options = sorted({
        f"Q{((int(x[5:7]) - 1) // 3) + 1}"
        for x in all_dates
        if len(x) >= 7 and x[5:7].isdigit() and 1 <= int(x[5:7]) <= 12
    })

    for visual in visuals:
        if visual.get("type") != "slicer" or "data" in visual:
            continue
        refs = (visual.get("projections") or {}).get("Values") or []
        ref = refs[0] if refs else ""
        if "WWTP" in ref:
            options = plants
        elif "Quarter" in ref:
            options = quarter_options
        elif "Month" in ref:
            options = month_options
        elif "Year" in ref:
            options = year_options
        elif "DATESTAMP" in ref or ".Date" in ref:
            options = all_dates
        else:
            options = []
        visual["data"] = {"shape": "slicer", "field": ref, "options": options}


def _rebuild_kpi_grid_page(page_spec, con):
    cfg = KPI_GRID_PAGES.get(page_spec.get("slug"))
    if not cfg:
        return

    anchor = _latest_datestamp(con)
    if anchor is None:
        page_spec["_kpi_grid_error"] = "Missing DATATBL max DATESTAMP"
        return
    cutoff = anchor - timedelta(days=1825)
    visuals = page_spec.get("visuals", [])
    tile_order = []

    for tile in cfg["tiles"]:
        visual = visuals[tile["visual_index"]]
        _apply_kpi_tile_data(visual, tile, con, cutoff)
        tile_order.append(tile["visual_index"])

    plant_union = sorted({
        plant
        for idx in tile_order
        for plant in (visuals[idx].get("data_by_plant") or {}).keys()
    })
    if not page_spec.get("plant_slicer"):
        page_spec["plant_slicer"] = {
            "field": "VARDESC.WWTP",
            "visual_name": None,
            "options": plant_union,
            "default": plant_union[0] if plant_union else None,
        }
    elif plant_union and not page_spec["plant_slicer"].get("options"):
        page_spec["plant_slicer"]["options"] = plant_union
        if not page_spec["plant_slicer"].get("default"):
            page_spec["plant_slicer"]["default"] = plant_union[0]

    plants = page_spec.get("plant_slicer", {}).get("options", [])
    if plants:
        coverage = {}
        for plant in plants:
            coverage[plant] = sum(
                1
                for idx in tile_order
                if (visuals[idx].get("data_by_plant") or {}).get(plant, {}).get("x")
            )
        best_plant = max(coverage, key=lambda plant: (coverage[plant], plant)) if coverage else None
        current_default = page_spec.get("plant_slicer", {}).get("default")
        if best_plant and coverage.get(best_plant, 0) > coverage.get(current_default, -1):
            page_spec["plant_slicer"]["default"] = best_plant

    page_spec["custom_kpi_meta"] = {
        "page_heading": cfg["heading"],
        "page_subtitle": cfg["subtitle"],
        "columns": cfg["columns"],
        "footer_copy": cfg["footer_copy"],
        "tile_order": tile_order,
    }
    if not page_spec.get("date_slicer"):
        page_spec["date_slicer"] = {
            "field": "DATATBL.DATESTAMP",
            "visual_name": None,
            "anchor_date": anchor.isoformat(),
            "options": [
                {"key": "last_30_days", "label": "Last 30 days"},
                {"key": "last_90_days", "label": "Last 90 days"},
                {"key": "last_12_months", "label": "Last 12 months (calendar)"},
                {"key": "last_5_years", "label": "Last 60 months (calendar)"},
                {"key": "all_time", "label": "All time"},
            ],
            "default": "last_5_years",
        }
    else:
        page_spec["date_slicer"]["anchor_date"] = anchor.isoformat()
        for opt in page_spec["date_slicer"].get("options", []):
            if opt.get("key") == "last_12_months":
                opt["label"] = "Last 12 months (calendar)"
            elif opt.get("key") == "last_5_years":
                opt["label"] = "Last 60 months (calendar)"

    _hydrate_kpi_page_slicer_visuals(page_spec, tile_order)


def _apply_dmr_5yr_metric_meta(page_spec, cfg, anchor):
    page_spec["custom_metric_meta"] = {
        "page_heading": cfg["page_heading"],
        "primary_series": cfg["primary_series"],
        "units": cfg["units"],
        "footer_copy": cfg["footer_copy"],
    }
    if page_spec.get("date_slicer"):
        page_spec["date_slicer"]["anchor_date"] = anchor.isoformat()
        for opt in page_spec["date_slicer"].get("options", []):
            if opt.get("key") == "last_12_months":
                opt["label"] = "Last 12 months (calendar)"
            elif opt.get("key") == "last_5_years":
                opt["label"] = "Last 60 months (calendar)"


def _rebuild_dmr_5yr_metric(page_spec, con):
    """Rebuild the 5-year DMR historical metric pages from monthly averages + current limits."""
    cfg = DMR_5YR_METRICS.get(page_spec.get("slug"))
    if not cfg:
        return

    visuals = page_spec.get("visuals", [])
    pivot = next((v for v in visuals if v.get("type") == "pivotTable"), None)
    table = next((v for v in visuals if v.get("type") == "tableEx"), None)
    chart = next((v for v in visuals if v.get("type") == "lineClusteredColumnComboChart"), None)
    if not pivot or not table or not chart:
        return

    anchor = _latest_datestamp(con)
    if anchor is None:
        page_spec["_dmr_5yr_metric_error"] = "Missing DATATBL max DATESTAMP"
        return
    cutoff = anchor - timedelta(days=1825)
    source_field_map = {
        "s_name_2": 'v."S. Name 2"',
        "s_name": 'v."S. NAME"',
        "name": 'v.NAME',
    }
    source_field = source_field_map.get(cfg.get("source_field", "s_name_2"))
    source_values = cfg.get("source_values") or []
    if not source_field or not source_values:
        page_spec["_dmr_5yr_metric_error"] = "Missing historical metric source config"
        return
    source_placeholders = ",".join(["?"] * len(source_values))
    source_filter = f"{source_field} IN ({source_placeholders})"
    monthly_agg = cfg.get("monthly_agg", "AVG")
    if monthly_agg not in {"AVG", "MIN", "MAX", "SUM"}:
        monthly_agg = "AVG"
    limit_priority = cfg.get("limit_priority_substrings") or ["monthly average", "monthly"]
    limit_priority_case = "\n".join([
        f"WHEN LOWER(COALESCE(l.DESCRIPTION, '')) LIKE '%{token.lower()}%' THEN {idx}"
        for idx, token in enumerate(limit_priority)
    ]) or "WHEN 1=1 THEN 0"

    try:
        monthly_rows = con.execute(f"""
            SELECT
                v.WWTP,
                YEAR(d.DATESTAMP) AS yr,
                MONTH(d.DATESTAMP) AS mo,
                {monthly_agg}(d.CURVALUE) AS val
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE {source_filter}
              AND v.WWTP IS NOT NULL
              AND d.DATESTAMP >= DATE '{cutoff.isoformat()}'
            GROUP BY v.WWTP, yr, mo
            ORDER BY v.WWTP, yr, mo
        """, source_values).fetchall()

        if cfg["limit_mode"] == "all_latest_by_name":
            limit_rows = con.execute(f"""
                SELECT
                    v.WWTP,
                    v."S. NAME" AS shortname,
                    l.DESCRIPTION,
                    l.LIMIT_VALUE,
                    v.UNITS,
                    v.VARTYPE,
                    l.NAME,
                    CAST(l.ENDDATE AS VARCHAR) AS enddate
                FROM read_parquet('{TIER2}/LIMITS.parquet') l
                JOIN vardesc v ON l.VARID = v.VARID
                WHERE {source_filter}
                  AND v.WWTP IS NOT NULL
                  AND l.ENDDATE >= DATE '2020-01-01'
                QUALIFY ROW_NUMBER() OVER (
                    PARTITION BY v.WWTP, l.NAME, v.VARTYPE
                    ORDER BY l.ENDDATE DESC, l.STARTDATE DESC
                ) = 1
                ORDER BY v.WWTP, l.LIMIT_VALUE, l.NAME
            """, source_values).fetchall()
        else:
            limit_rows = con.execute(f"""
                SELECT
                    v.WWTP,
                    v."S. NAME" AS shortname,
                    l.DESCRIPTION,
                    l.LIMIT_VALUE,
                    v.UNITS,
                    v.VARTYPE,
                    l.NAME,
                    CAST(l.ENDDATE AS VARCHAR) AS enddate
                FROM read_parquet('{TIER2}/LIMITS.parquet') l
                JOIN vardesc v ON l.VARID = v.VARID
                WHERE {source_filter}
                  AND v.WWTP IS NOT NULL
                  AND l.ENDDATE >= DATE '2020-01-01'
                QUALIFY ROW_NUMBER() OVER (
                    PARTITION BY v.WWTP
                    ORDER BY
                        CASE
                            {limit_priority_case}
                            ELSE {len(limit_priority)}
                        END,
                        l.ENDDATE DESC,
                        l.STARTDATE DESC,
                        l.LIMIT_VALUE DESC
                ) = 1
                ORDER BY v.WWTP
            """, source_values).fetchall()
    except Exception as e:
        page_spec["_dmr_5yr_metric_error"] = str(e)
        return

    if _is_flow_permit_context(source_values):
        permit_by_plant = _monthly_flow_permit_by_plant(con)
        limit_rows = [
            (
                wwtp,
                shortname,
                desc,
                permit_by_plant.get(wwtp, limit_value),
                units,
                vartype,
                limit_name,
                enddate,
            )
            for wwtp, shortname, desc, limit_value, units, vartype, limit_name, enddate in limit_rows
        ]

    def _build_month_matrix(rows):
        by_plant = defaultdict(lambda: defaultdict(dict))
        for wwtp, yr, mo, val in rows:
            by_plant[wwtp][yr][mo] = val
        out = {}
        for wwtp, yr_data in by_plant.items():
            months = []
            values = {}
            for yr in sorted(yr_data):
                mo_data = yr_data[yr]
                year_vals = []
                for mo in sorted(mo_data):
                    value = mo_data[mo]
                    months.append({"yr": yr, "mo": mo})
                    values[f"{yr}-{mo}"] = round(value, 3) if value is not None else None
                    if value is not None:
                        year_vals.append(value)
                values[f"{yr}-total"] = round(sum(year_vals) / len(year_vals), 3) if year_vals else None
            out[wwtp] = {"shape": "month_matrix", "agg": "avg", "months": months, "values": values}
        return out

    pivot_dbp = _build_month_matrix(monthly_rows)
    first_plant = sorted(pivot_dbp)[0] if pivot_dbp else None
    limits_by_plant = defaultdict(list)
    for row in limit_rows:
        limits_by_plant[row[0]].append(row[1:])

    def _chart_shape(wwtp):
        entries = [(yr, mo, val) for plant, yr, mo, val in monthly_rows if plant == wwtp]
        xs = [f"{yr}-{mo:02d}-01" for yr, mo, _ in entries]
        vals = [round(val, 3) if val is not None else None for _, _, val in entries]
        series = [{"name": cfg["primary_series"], "role": "y", "values": vals}]
        for _shortname, desc, limit_value, _units, _vartype, limit_name, _enddate in limits_by_plant.get(wwtp, []):
            label = desc or limit_name or "Permit Limit"
            series.append({
                "name": label,
                "role": "y2",
                "values": [limit_value] * len(xs),
            })
        return {"shape": "combo", "x": xs, "series": series}

    table_columns = [
        "VARDESC.SHORTNAME",
        "LIMITS.DESCRIPTION",
        "Sum(LIMITS.LIMIT_VALUE)",
        "VARDESC.UNITS",
        "VARDESC.VARTYPE",
        "LIMITS.NAME",
        "LIMITS.ENDDATE",
    ]

    pivot["data_by_plant"] = pivot_dbp
    table["data_by_plant"] = {
        plant: {
            "shape": "table",
            "columns": table_columns,
            "rows": [list(row) for row in rows_for_plant],
        }
        for plant, rows_for_plant in limits_by_plant.items()
    }
    chart["data_by_plant"] = {wwtp: _chart_shape(wwtp) for wwtp in pivot_dbp}

    if first_plant:
        pivot["data"] = pivot_dbp[first_plant]
        chart["data"] = chart["data_by_plant"][first_plant]
        table["data"] = table["data_by_plant"].get(first_plant, {
            "shape": "table",
            "columns": table_columns,
            "rows": [],
        })

    _apply_dmr_5yr_metric_meta(page_spec, cfg, anchor)


PLANT_EF_DAILY_PARAMETERS = [
    "Plnt Ef Flow Mgd",
    "Plnt Ef 2Hr Peak Flow Gpm",
    "Plnt Ef Dissolved Oxygen",
    "Plnt Ef NH3-N",
    "Plnt Ef TSS",
    "Plnt Ef CBOD",
    "Plnt Ef pH Field",
    "Plnt Ef E.coli",
]


def _rebuild_dt_chart_plant_ef_daily(page_spec, con):
    """Generate a compact page-specific source for the daily effluent chart page."""
    table = next((v for v in page_spec.get("visuals", []) if v.get("type") == "tableEx"), None)
    parameter_slicer = next((
        v for v in page_spec.get("visuals", [])
        if v.get("type") == "slicer" and (v.get("projections", {}).get("Values") or [None])[0] == "VARDESC.S. Name 2"
    ), None)
    if table:
        _set_column_labels(table, {
            "VARDESC.SHORTNAME": "S. NAME",
            "LIMITS.DESCRIPTION": "Description",
            "Sum(LIMITS.LIMIT_VALUE)": "Limit Value",
            "VARDESC.UNITS": "Units",
            "LIMITS.NAME": "Limit Type",
        })

    anchor = _latest_datestamp(con)
    if anchor is None:
        page_spec["_dt_chart_plant_ef_daily_error"] = "Missing DATATBL max DATESTAMP"
        return

    cutoff = anchor - timedelta(days=1825)
    try:
        value_rows = con.execute(f"""
            SELECT
                DATE_DIFF('day', DATE '{cutoff.isoformat()}', DATESTAMP) AS day_offset,
                WWTP,
                "S. Name 2" AS s2,
                ROUND(AVG(CURVALUE), 3) AS val
            FROM read_parquet('{TIER2}/vt_PlntEFParameters_byWWTP.parquet')
            WHERE "S. Name 2" IN ({",".join(["?"] * len(PLANT_EF_DAILY_PARAMETERS))})
              AND DATESTAMP >= DATE '{cutoff.isoformat()}'
            GROUP BY day_offset, WWTP, s2
            ORDER BY WWTP, s2, day_offset
        """, PLANT_EF_DAILY_PARAMETERS).fetchall()

        limit_rows = con.execute(f"""
            SELECT
                v.WWTP,
                v."S. Name 2" AS s2,
                l.NAME AS limit_name,
                l.DESCRIPTION,
                l.COMPARE,
                l.LIMIT_VALUE,
                v.UNITS,
                CAST(l.ENDDATE AS VARCHAR) AS enddate
            FROM read_parquet('{TIER2}/LIMITS.parquet') l
            JOIN vardesc v ON l.VARID = v.VARID
            WHERE v."S. Name 2" IN ({",".join(["?"] * len(PLANT_EF_DAILY_PARAMETERS))})
              AND v.WWTP IS NOT NULL
              AND l.ENDDATE >= DATE '2020-01-01'
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY v.WWTP, v."S. Name 2", l.NAME
                ORDER BY l.ENDDATE DESC, l.STARTDATE DESC
            ) = 1
            ORDER BY v.WWTP, v."S. Name 2", l.NAME
        """, PLANT_EF_DAILY_PARAMETERS).fetchall()

        param_meta_rows = con.execute(f"""
            SELECT
                "S. Name 2" AS s2,
                MAX(UNITS) AS units,
                COUNT(DISTINCT WWTP) AS plant_count
            FROM read_parquet('{TIER2}/VARDESC.parquet')
            WHERE "S. Name 2" IN ({",".join(["?"] * len(PLANT_EF_DAILY_PARAMETERS))})
            GROUP BY s2
            ORDER BY s2
        """, PLANT_EF_DAILY_PARAMETERS).fetchall()
    except Exception as e:
        page_spec["_dt_chart_plant_ef_daily_error"] = str(e)
        return

    permit_by_plant = _monthly_flow_permit_by_plant(con)
    limit_rows = [
        (
            plant,
            s2,
            limit_name,
            description,
            compare,
            permit_by_plant.get(plant, limit_value)
                if s2 == "Plnt Ef Flow Mgd" and limit_name == "AMAX"
                else limit_value,
            units,
            enddate,
        )
        for plant, s2, limit_name, description, compare, limit_value, units, enddate in limit_rows
    ]

    param_meta = {
        s2: {"key": s2, "label": s2.replace("Plnt ", "").replace("Ef ", ""), "units": units, "plant_count": plant_count}
        for s2, units, plant_count in param_meta_rows
    }
    by_plant = defaultdict(lambda: defaultdict(lambda: {"x": [], "v": []}))
    for day_offset, plant, s2, val in value_rows:
        bucket = by_plant[plant][s2]
        bucket["x"].append(int(day_offset))
        bucket["v"].append(val)

    for plant in by_plant:
        for s2 in by_plant[plant]:
            by_plant[plant][s2]["l"] = []
    for plant, s2, limit_name, description, compare, limit_value, units, enddate in limit_rows:
        by_plant[plant][s2]["l"].append({
            "n": limit_name,
            "d": description,
            "c": compare,
            "v": limit_value,
            "u": units,
            "e": enddate,
        })

    payload = {
        "origin_date": cutoff.isoformat(),
        "anchor_date": anchor.isoformat(),
        "parameters": [param_meta[p] for p in PLANT_EF_DAILY_PARAMETERS if p in param_meta],
        "plants": sorted(by_plant),
        "default_parameter": "Plnt Ef Flow Mgd",
        "by_plant": {plant: dict(params) for plant, params in by_plant.items()},
    }

    if table and table.get("data_by_plant"):
        flow_limit_names = {"Plnt Ef Flow Mgd", "Eff Flow", "Plnt Ef FLOW ANNUAL"}
        for plant, shaped in table["data_by_plant"].items():
            permit = permit_by_plant.get(plant)
            if permit is None:
                continue
            patched_rows = []
            for row in shaped.get("rows", []):
                row_copy = list(row)
                shortname = str(row_copy[0]) if row_copy else ""
                description = str(row_copy[1]) if len(row_copy) > 1 else ""
                units = str(row_copy[3]) if len(row_copy) > 3 else ""
                limit_name = str(row_copy[4]) if len(row_copy) > 4 else ""
                is_flow_permit_row = (
                    shortname in flow_limit_names
                    and units == "MGD"
                    and (
                        limit_name == "AMAX"
                        or "annual average" in description.lower()
                        or "yearly average" in description.lower()
                    )
                )
                if is_flow_permit_row and len(row_copy) > 2:
                    row_copy[2] = permit
                patched_rows.append(row_copy)
            shaped["rows"] = patched_rows
        first_plant = sorted(table["data_by_plant"])[0] if table["data_by_plant"] else None
        if first_plant:
            table["data"] = table["data_by_plant"][first_plant]

    if parameter_slicer:
        parameter_slicer["data"] = {
            "shape": "slicer",
            "field": "VARDESC.S. Name 2",
            "options": [item["key"] for item in payload["parameters"]],
        }

    source_name = f"{page_spec['slug']}-source.json"
    custom_key = source_name[:-5]
    _write_json_and_script(
        CUSTOM_OUT / source_name,
        payload,
        f'window.__WWIP_DATA__.custom["{custom_key}"]',
    )
    page_spec["custom_data_key"] = custom_key
    page_spec["custom_data_href"] = f"data/custom/{custom_key}.js"
    if page_spec.get("date_slicer"):
        page_spec["date_slicer"]["anchor_date"] = anchor.isoformat()


def _add_months_first_of_month(dt, months):
    """Shift a first-of-month date by N months, preserving day=1."""
    month_index = (dt.year * 12 + (dt.month - 1)) + months
    year = month_index // 12
    month = (month_index % 12) + 1
    return date(year, month, 1)


def _rebuild_citywide_capacity_status(page_spec, con):
    """Rebuild the citywide capacity chart using PBIX-style calendar windows."""
    visuals = page_spec.get("visuals", [])
    chart = next((v for v in visuals if v.get("type") == "hundredPercentStackedColumnChart"), None)
    if not chart:
        return

    try:
        rows = con.execute("""
            SELECT v.WWTP, d.DATESTAMP,
                   AVG(d.CURVALUE) AS util,
                   AVG(d."Color Format for Flow") AS permit
            FROM datatbl d
            JOIN vardesc v ON d.VARID = v.VARID
            WHERE v."S. NAME" = 'Plnt Ef FLOW ANNUAL'
              AND v.WWTP IS NOT NULL
            GROUP BY v.WWTP, d.DATESTAMP
            ORDER BY v.WWTP, d.DATESTAMP
        """).fetchall()
    except Exception as e:
        chart["data_error"] = f"_rebuild_citywide_capacity_status: {e}"
        return

    by_plant = defaultdict(list)
    for wwtp, datestamp, util, permit in rows:
        by_plant[wwtp].append((datestamp, util, permit))

    small_plants = {"Forest Cove", "Tidwell Timbers", "WCID-76", "West Lake Hou.", "Westway"}
    plants_ordered = [p for p in sorted(by_plant) if p not in small_plants]

    anchor = _latest_datestamp(con)
    if anchor is None:
        chart["data_error"] = "_rebuild_citywide_capacity_status: missing DATATBL max DATESTAMP"
        return

    current_month_start = date(anchor.year, anchor.month, 1)
    calendar_12_start = _add_months_first_of_month(current_month_start, -12)
    calendar_60_start = _add_months_first_of_month(current_month_start, -60)
    previous_month_end = current_month_start - timedelta(days=1)

    def _select_rows(plant_rows, start=None, end=None):
        selected = []
        for ds, util, permit in plant_rows:
            ds_date = ds.date() if isinstance(ds, datetime) else ds
            if start and ds_date < start:
                continue
            if end and ds_date > end:
                continue
            selected.append((ds_date, util, permit))
        return selected or plant_rows

    def _shape(start=None, end=None):
        xs, utilized, remaining = [], [], []
        for wwtp in plants_ordered:
            plant_rows = _select_rows(by_plant.get(wwtp, []), start, end)
            if not plant_rows:
                continue
            max_util = max((r[1] for r in plant_rows if r[1] is not None), default=None)
            permits = [r[2] for r in plant_rows if r[2] is not None]
            permit = (sum(permits) / len(permits)) if permits else None
            rem = (permit - max_util) if (permit is not None and max_util is not None) else None
            xs.append(wwtp)
            utilized.append(max_util)
            remaining.append(rem)
        return {
            "shape": "xy_series",
            "x": xs,
            "series": [
                {"name": "Capacity Utilized", "values": utilized},
                {"name": "Capacity Remaining", "values": remaining},
            ],
        }

    chart["data_by_date_range"] = {
        "last_30_days": _shape(anchor - timedelta(days=30), anchor),
        "last_90_days": _shape(anchor - timedelta(days=90), anchor),
        "last_12_months": _shape(calendar_12_start, previous_month_end),
        "last_5_years": _shape(calendar_60_start, previous_month_end),
        "all_time": _shape(),
    }
    chart["custom_range_source"] = {
        "plants": plants_ordered,
        "rows_by_plant": {
            wwtp: {
                "x": [str(ds.date() if isinstance(ds, datetime) else ds) for ds, _, _ in by_plant.get(wwtp, [])],
                "utilized": [util for _, util, _ in by_plant.get(wwtp, [])],
                "permit": [permit for _, _, permit in by_plant.get(wwtp, [])],
            }
            for wwtp in plants_ordered
        },
    }
    chart["data"] = chart["data_by_date_range"]["last_5_years"]

    page_spec["date_slicer"] = {
        "field": "DATATBL.DATESTAMP",
        "visual_name": page_spec.get("date_slicer", {}).get("visual_name"),
        "anchor_date": str(anchor),
        "options": [
            {"key": "last_30_days", "label": "Last 30 days"},
            {"key": "last_90_days", "label": "Last 90 days"},
            {"key": "last_12_months", "label": "Last 12 months (calendar)"},
            {"key": "last_5_years", "label": "Last 60 months (calendar)"},
            {"key": "all_time", "label": "All time"},
        ],
        "default": "last_5_years",
    }


VISUAL_OVERRIDES = [
    {
        "page": "permit-limits",
        "apply_page": lambda page_spec, con: _rebuild_permit_limits(page_spec, con),
    },
    {
        "page": "dt-dmr-5yr-ef-flow-mgd",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "hist-mo-ef-flow-mgd",
        "apply_page": lambda page_spec, con: _rebuild_hist_mo_ef_flow_mgd(page_spec, con),
    },
    {
        "page": "dt-dmr-5yr-ef-cbod",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "dt-dmr-5yr-ef-tss",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "dt-dmr-5yr-ef-nh3-n",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "dmr-5yr-ef-cbod-loading",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "dmr-5yr-ef-tss-loading",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "dmr-5yr-ef-nh3-n-loading",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "dmr-5yr-ef-do-loading",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "dmr-5yr-ecoli",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "dmr-5yr-ph-field",
        "apply_page": lambda page_spec, con: _rebuild_dmr_5yr_metric(page_spec, con),
    },
    {
        "page": "if-rem-ef-cbod-tss-nh3-n",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "plant-efficiency-process-evaluation",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "multi-var-operational-parameters",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "regulatory-parameters-1-3x3",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "regulatory-parameters-2-3x3",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "regulatory-kpi-33",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "s-aeration",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "clarifier",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "svi",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "ras-01",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "was-01",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "dig-01",
        "apply_page": lambda page_spec, con: _rebuild_kpi_grid_page(page_spec, con),
    },
    {
        "page": "dt-chart-plant-ef-daily",
        "apply_page": lambda page_spec, con: _rebuild_dt_chart_plant_ef_daily(page_spec, con),
    },
    # Citywide WWTP Capacity Status — rebuild chart with PBIX-style calendar windows.
    {
        "page": "ef-flow-permit-eval",
        "apply_page": lambda page_spec, con: _rebuild_citywide_capacity_status(page_spec, con),
    },
    # Permit Evaluation Summary Tables — attach raw rows for custom date-range recompute.
    {
        "page": "tables-permitted-capacity-evaluation-pbi",
        "apply_page": lambda page_spec, con: _rebuild_permit_summary_custom_sources(page_spec, con),
    },
    # Citywide WWTP Capacity Status — stacked bar
    {
        "page": "ef-flow-permit-eval",
        "title_contains": "Effluent Flow, MGD",
        "apply": lambda v: _apply_capacity_bar_overrides(v),
    },
    # Permit Evaluation Summary Tables — rename LIMIT_VALUE to match the PBIX display.
    {
        "page": "tables-permitted-capacity-evaluation-pbi",
        "title_contains": "NPDES Permit Limits",
        "apply": lambda v: _set_column_labels(v, {"LIMIT_VALUE": "Permit Limit"}),
        "apply_data": lambda v, con: _rebuild_npdes_permit_limits_table(v, con),
    },
    # Permit Evaluation AAF — % column with 75/90 traffic-light coloring.
    {
        "page": "tables-permitted-capacity-evaluation-pbi",
        "title_contains": "Permit Evaluation, AAF",
        "apply": lambda v: (
            _set_column_labels(v, {
                "MAX Curval": "Max AAF",
                "Measure Max AAF%": "% of Permit",
            }),
            _set_percent_col(v, "Measure Max AAF%"),
        ),
    },
    # Permit Evaluation 75/90 (small plants) — same formatting on % column.
    {
        "page": "tables-permitted-capacity-evaluation-pbi",
        "title_contains": "Permit Evaluation, 75/90",
        "apply": lambda v: (
            _set_column_labels(v, {
                "Rolling 3 Months Minimum max per DATESTAMP": "Rolling 3mo Max",
                "Rolling 3 Months Minimum max per DATESTAMP divided by Color Format for Flow": "% of Permit",
            }),
            _set_percent_col(v, "Rolling 3 Months Minimum max per DATESTAMP divided by Color Format for Flow"),
        ),
    },
    # ── Permitted AAF Vs DMR page ────────────────────────────────────
    {
        "page": "permitted-aaf-vs-dmr",
        "apply_page": lambda page_spec, con: _rebuild_permitted_aaf_vs_dmr(page_spec, con),
    },
    # ── Statistical Flows page ───────────────────────────────────────
    {
        "page": "statistical-flows",
        "apply_page": lambda page_spec, con: _rebuild_statistical_flows(page_spec, con),
    },
    # ── ADF / 2-hr Peak page ─────────────────────────────────────────
    {
        "page": "adf-2hrpeak-to-download",
        "title_contains": "average daily flow",
        "apply_data": lambda v, con: _rebuild_adf_chart(v, con),
    },
    {
        "page": "dt-daily-effluent-flow",
        "title_contains": "average daily flow",
        "apply_data": lambda v, con: _rebuild_adf_chart(v, con),
    },
    {
        "page": "adf-2hrpeak-to-download",
        "title_contains": "rainfall depth",
        "apply_data": lambda v, con: _rebuild_rainfall_chart(v, con),
    },
    {
        "page": "dt-daily-effluent-flow",
        "title_contains": "rainfall depth",
        "apply_data": lambda v, con: _rebuild_rainfall_chart(v, con),
    },
    {
        "page": "adf-2hrpeak-to-download",
        "title_contains": "2-hr peak flow",
        "apply_data": lambda v, con: _rebuild_2hrpeak_chart(v, con),
    },
    {
        "page": "dt-daily-effluent-flow",
        "title_contains": "2-hr peak flow",
        "apply_data": lambda v, con: _rebuild_2hrpeak_chart(v, con),
    },
    {
        "page": "adf-2hrpeak-to-download",
        "title_contains": "",
        "type_filter": "tableEx",
        "apply": lambda v: _set_column_labels(v, {
            "VARDESC.NAME":           "Name",
            "LIMITS.DESCRIPTION":     "Description",
            "Sum(LIMITS.LIMIT_VALUE)":"Limit Value",
            "VARDESC.UNITS":          "Units",
            "Sum(LIMITS.GPM2MGD)":    "Limit (MGD)",
            "VARDESC.VARTYPE":        "Type",
            "LIMITS.NAME":            "Limit Type",
            "LIMITS.STARTDATE":       "Start Date",
            "LIMITS.ENDDATE":         "End Date",
        }),
    },
    {
        "page": "dt-daily-effluent-flow",
        "title_contains": "",
        "type_filter": "tableEx",
        "apply": lambda v: _set_column_labels(v, {
            "VARDESC.WWTP":           "WWTP",
            "VARDESC.NAME":           "Name",
            "LIMITS.DESCRIPTION":     "Description",
            "Sum(LIMITS.LIMIT_VALUE)":"Limit Value",
            "VARDESC.UNITS":          "Units",
            "Sum(LIMITS.GPM2MGD)":    "Limit (MGD)",
            "VARDESC.VARTYPE":        "Type",
            "LIMITS.NAME":            "Limit Type",
            "LIMITS.STARTDATE":       "Start Date",
            "LIMITS.ENDDATE":         "End Date",
        }),
    },
    {
        "page": "permit-evaluation-aaf",
        "apply_page": lambda page_spec, con: _rebuild_permit_evaluation_aaf_page(page_spec, con),
    },
    {
        "page": "permit-evaluation-aaf",
        "title_contains": "",
        "type_filter": "tableEx",
        "apply": lambda v: _set_column_labels(v, {
            "VARDESC.WWTP":                         "WWTP",
            "LIMITS.DESCRIPTION":                   "Description",
            "Sum(Effluent Flow Limits.LIMIT_VALUE)":"Permit Limit",
            "VARDESC.UNITS":                        "Units",
        }),
        "apply_data": lambda v, con: _rebuild_permit_evaluation_aaf_table(v, con),
    },
    {
        "page": "permit-evaluation-7590",
        "apply_page": lambda page_spec, con: _rebuild_permit_evaluation_7590_page(page_spec, con),
    },
    # AAF & MAF combo chart — rebuild data from correct series pivot + set colors.
    {
        "page": "ef-flow-aaf-maf",
        "title_contains": "annual average",
        "apply": lambda v: v.update({"colors": [
            "#3d5a8a",  # Annual Avg bars — navy
            "#d4a820",  # Monthly Flow bars — gold
            "#1f1f1f",  # 100% Permit line — near-black
            "#c0392b",  # 90% Permit line — dark red
            "#b8860b",  # 75% Permit line — dark gold
        ]}),
        "apply_data": lambda v, con: _rebuild_ef_flow_aaf_maf(v, con),
    },
    # AAF & MAF permit limits table — rename raw queryref headers.
    {
        "page": "ef-flow-aaf-maf",
        "title_contains": "",
        "type_filter": "tableEx",
        "apply": lambda v: _set_column_labels(v, {
            "VARDESC.SHORTNAME":     "S. NAME",
            "LIMITS.DESCRIPTION":    "Description",
            "Sum(LIMITS.LIMIT_VALUE)": "Limit Value",
            "VARDESC.UNITS":         "Units",
            "VARDESC.VARTYPE":       "Type",
            "LIMITS.NAME":           "Name",
        }),
        "apply_data": lambda v, con: _rebuild_ef_flow_aaf_maf_table(v, con),
    },
]

# Traffic-light bands for permit-utilization %. Matches the PBIX
# "Color Formatting Number" calc column: <75% green, 75–90% yellow,
# 90–100% orange, >100% red. Background alphas tuned for the dark theme.
PERCENT_THRESHOLDS = [
    {"max": 0.75, "color": "rgba(106, 174, 120, 0.35)"},  # green
    {"max": 0.90, "color": "rgba(220, 180,  80, 0.35)"},  # yellow
    {"max": 1.00, "color": "rgba(230, 150,  80, 0.45)"},  # orange
    {"max": 9999, "color": "rgba(220, 100, 100, 0.50)"},  # red
]

def _set_percent_col(visual, col_key):
    """Format one column as a percentage with traffic-light color thresholds."""
    fmt = visual.get("column_formats") or {}
    fmt[col_key] = {
        "format": "percent",
        "decimals": 0,
        "thresholds": PERCENT_THRESHOLDS,
    }
    visual["column_formats"] = fmt

def _set_column_labels(visual, mapping):
    """Attach a column-label mapping. Table component uses it to rename headers
    without editing the underlying aggregation. Keys can be raw queryrefs or
    cleaned header names."""
    existing = visual.get("column_labels") or {}
    existing.update(mapping)
    visual["column_labels"] = existing

def _apply_capacity_bar_overrides(visual):
    """Rename series to Capacity Utilized / Capacity Remaining, apply CoH blue/gray
    palette, enable data labels, and filter out the 5 small plants (permit < 1 MGD)
    which PBIX displays on a separate 75/90-rule chart."""
    SMALL_PLANTS = {"Forest Cove", "Tidwell Timbers", "WCID-76", "West Lake Hou.", "Westway"}
    d = visual.get("data") or {}
    if d.get("shape") == "xy_series" and d.get("x"):
        keep = [i for i, x in enumerate(d["x"]) if x not in SMALL_PLANTS]
        d["x"] = [d["x"][i] for i in keep]
        for s in d.get("series", []):
            s["values"] = [s["values"][i] for i in keep]
    visual["series_labels"] = ["Capacity Utilized", "Capacity Remaining"]
    visual["colors"]        = ["#6aaed6", "#bdbdbd"]  # soft blue + neutral gray
    visual["show_data_labels"] = True

def apply_overrides(page_spec, con=None):
    """Match each visual against VISUAL_OVERRIDES and apply."""
    for ov in VISUAL_OVERRIDES:
        if page_spec.get("slug") != ov["page"]: continue
        # Page-level override — receives the whole page_spec
        if "apply_page" in ov:
            if con is not None:
                ov["apply_page"](page_spec, con)
            continue
        for v in page_spec.get("visuals", []):
            title = (v.get("title") or "").lower()
            if ov["title_contains"].lower() not in title: continue
            if ov.get("type_filter") and v.get("type") != ov["type_filter"]: continue
            if "apply" in ov:
                ov["apply"](v)
            if "apply_data" in ov and con is not None:
                ov["apply_data"](v, con)

ROOT = Path(__file__).resolve().parent.parent
LAYOUT_DUMP = ROOT / "tools/model_dump/pages_dump.json"
TIER2 = ROOT / "build" / "tier2"
OUT = ROOT / "app" / "data"
PAGES_OUT = OUT / "pages"
CUSTOM_OUT = OUT / "custom"
PAGES_OUT.mkdir(parents=True, exist_ok=True)
CUSTOM_OUT.mkdir(parents=True, exist_ok=True)

def slugify(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s).strip("-")
    return s or "page"

# ── Load layout ────────────────────────────────────────────────
dump = json.loads(LAYOUT_DUMP.read_text())
pages_raw = dump["pages"]
bookmarks = dump["bookmarks"]
bm_by_guid = {b["name"]: b for b in bookmarks}
section_name_by_guid = {p["name"]: p["displayName"] for p in pages_raw}

# ── Identify live pages ────────────────────────────────────────
visible_guids = {p["name"] for p in pages_raw if (p.get("visibility") or 0) == 0}
bm_target_guids = {b["target_page_guid"] for b in bookmarks if b.get("target_page_guid")}
live_guids = visible_guids | bm_target_guids
live_pages = [p for p in pages_raw if p["name"] in live_guids]
live_pages.sort(key=lambda p: (p["ordinal"] if p["ordinal"] is not None else 9999))

print(f"Pages in PBIX:           {len(pages_raw)}")
print(f"Visible (tab-bar):       {len(visible_guids)}")
print(f"Reached by bookmark:     {len(bm_target_guids)}")
print(f"Live pages (target set): {len(live_pages)}")

# ── Category heuristic (shared with generate_layout_docs) ──────
def page_category(name: str) -> str:
    n = (name or "").lower()
    if n == "home": return "home"
    if "permit" in n or "aaf" in n or "75/90" in n or "75 90" in n: return "permit"
    if "daily report" in n or "(scottl)" in n or "inf/eff" in n or "aeration daily" in n: return "daily-reports"
    if "dmr 5yr" in n or "(dmr)" in n or "mo dmr" in n or "historical" in n: return "historical"
    if any(p in n for p in ["ras", "was", "svi", "clarifier", "s aeration", "digestor", "thck", "thicken", "chemical", "chemica", "elec"]):
        return "process"
    if "regulatory" in n or "multi-var" in n or "key lab" in n: return "regulatory-kpi"
    if "wwtp optimiz" in n or "scott wwf" in n or "northside wwf" in n: return "wwtp-specific"
    if n.startswith("dt ") or "explore data" in n or "o&m report" in n or "benchmarking" in n or "plant efficiency" in n:
        return "data-tools"
    if "if, " in n or "% rem" in n or "(if vs ef)" in n: return "influent-effluent"
    return "other"

# ── Build slug registry ────────────────────────────────────────
slugs_seen = set()
def make_slug(display_name: str) -> str:
    base = slugify(display_name)
    slug = base
    i = 2
    while slug in slugs_seen:
        slug = f"{base}-{i}"
        i += 1
    slugs_seen.add(slug)
    return slug

slug_by_guid = {}
for p in live_pages:
    slug_by_guid[p["name"]] = make_slug(p["displayName"])

# ── Resolve Home navigation ────────────────────────────────────
home = next((p for p in live_pages if (p["displayName"] or "").lower() == "home"), None)
home_nav = []
if home:
    for v in home["visuals"]:
        if v["type"] != "actionButton": continue
        a = v.get("action") or {}
        target_guid = None
        applied_filters = []
        if a.get("bookmark"):
            bm = bm_by_guid.get(a["bookmark"])
            if bm:
                target_guid = bm.get("target_page_guid")
                applied_filters = bm.get("filters_applied") or []
        elif a.get("navigationSection"):
            target_guid = a["navigationSection"]
        if not target_guid:
            continue
        target_slug = slug_by_guid.get(target_guid)
        if not target_slug:
            # Target isn't in the live set (shouldn't happen often since we included all bm targets)
            continue
        home_nav.append({
            "caption": v.get("button_text") or v.get("title") or "—",
            "target_slug": target_slug,
            "target_page_name": section_name_by_guid.get(target_guid),
            "bookmark": a.get("bookmark"),
            "applied_filters": applied_filters,
            "position": v["position"],
        })

# ── Read reference data from parquet ───────────────────────────
print("Reading reference data from parquet…")
con = duckdb.connect()
con.execute(f"CREATE VIEW datatbl   AS SELECT * FROM '{TIER2}/DATATBL.parquet'")
con.execute(f"CREATE VIEW vardesc   AS SELECT * FROM '{TIER2}/VARDESC.parquet'")
con.execute(f"CREATE VIEW location  AS SELECT * FROM '{TIER2}/LOCATION.parquet'")

plants = [r[0] for r in con.execute(
    "SELECT DISTINCT WWTP FROM datatbl WHERE WWTP IS NOT NULL ORDER BY WWTP"
).fetchall()]

parameters = [r[0] for r in con.execute(
    "SELECT DISTINCT \"S. Name 2\" FROM vardesc WHERE \"S. Name 2\" IS NOT NULL ORDER BY 1"
).fetchall()]

categories_one = [r[0] for r in con.execute(
    "SELECT DISTINCT \"Categories One\" FROM datatbl WHERE \"Categories One\" IS NOT NULL ORDER BY 1"
).fetchall()]

primary_params = [r[0] for r in con.execute(
    "SELECT DISTINCT \"Primary Parameter\" FROM datatbl WHERE \"Primary Parameter\" IS NOT NULL ORDER BY 1"
).fetchall()]

date_range = con.execute(
    "SELECT MIN(DATESTAMP)::VARCHAR, MAX(DATESTAMP)::VARCHAR FROM datatbl"
).fetchone()

total_violations = con.execute(
    "SELECT COUNT(*) FROM datatbl WHERE Violation = 1"
).fetchone()[0]

last_refresh = con.execute(
    f"SELECT MAX(DateTime)::VARCHAR FROM '{TIER2}/Refresh_DateTime.parquet'"
).fetchone()[0]

print(f"  plants:             {len(plants)}")
print(f"  parameters:         {len(parameters)}")
print(f"  violation cats:     {len(categories_one)}")
print(f"  primary params:     {len(primary_params)}")
print(f"  date range:         {date_range[0]} → {date_range[1]}")
print(f"  total violations:   {total_violations:,}")
print(f"  last refresh:       {last_refresh}")

# ── Emit manifest.json ─────────────────────────────────────────
manifest = {
    "version": "v2",
    "generated_at": None,  # leave for the shell to stamp at runtime if it wants
    "last_refresh": last_refresh,
    "date_range": {"min": date_range[0], "max": date_range[1]},
    "totals": {
        "violations": total_violations,
        "plants": len(plants),
        "parameters": len(parameters),
    },
    "plants": plants,
    "parameters": parameters,
    "violation_categories": categories_one,
    "primary_parameters": primary_params,
    "home_nav": home_nav,
    "pages": [
        {
            "slug": slug_by_guid[p["name"]],
            "guid": p["name"],
            "display_name": p["displayName"],
            "category": page_category(p["displayName"]),
            "ordinal": p["ordinal"],
            "width": p["width"],
            "height": p["height"],
            "visible": (p.get("visibility") or 0) == 0,
            "visual_count": len(p["visuals"]),
            "data_visual_count": sum(1 for v in p["visuals"] if v["type"] not in ("textbox","shape","basicShape","image")),
        }
        for p in live_pages
    ],
    "bookmarks": [
        {
            "guid": b["name"],
            "display_name": b["displayName"],
            "target_slug": slug_by_guid.get(b.get("target_page_guid")),
            "target_page_name": b.get("target_page_name"),
            "filters_applied": b.get("filters_applied") or [],
        }
        for b in bookmarks
    ],
    "visual_type_counts": {},  # filled below
}

from collections import Counter
vt_counter = Counter()
for p in live_pages:
    for v in p["visuals"]:
        vt_counter[v["type"]] += 1
manifest["visual_type_counts"] = dict(vt_counter.most_common())

(OUT / "manifest.json").parent.mkdir(parents=True, exist_ok=True)
_write_json_and_script(OUT / "manifest.json", manifest, "window.__WWIP_DATA__.manifest")
print(f"Wrote manifest.json ({(OUT/'manifest.json').stat().st_size/1024:.1f} KB)")

# ── Build + aggregate per-page spec JSONs ──────────────────────
print("Building page specs and aggregating visual data…")
agg_totals = defaultdict(int)
build_start = time.time()
for i, p in enumerate(live_pages, 1):
    page_start = time.time()
    slug = slug_by_guid[p["name"]]
    page_spec = {
        "slug": slug,
        "guid": p["name"],
        "display_name": p["displayName"],
        "category": page_category(p["displayName"]),
        "ordinal": p["ordinal"],
        "canvas": {"width": p["width"], "height": p["height"]},
        "page_filters": p.get("page_filters") or [],
        "visuals": [],
    }
    for v in p["visuals"]:
        # Resolve button targets to local slugs for actionButtons
        target_slug = None
        if v["type"] == "actionButton":
            a = v.get("action") or {}
            tgt_guid = None
            if a.get("bookmark"):
                bm = bm_by_guid.get(a["bookmark"])
                if bm: tgt_guid = bm.get("target_page_guid")
            elif a.get("navigationSection"):
                tgt_guid = a["navigationSection"]
            if tgt_guid:
                target_slug = slug_by_guid.get(tgt_guid)
        page_spec["visuals"].append({
            "name": v["name"],
            "type": v["type"],
            "title": v.get("title"),
            "button_text": v.get("button_text"),
            "textbox_text": v.get("textbox_text"),
            "shape_kind": v.get("shape_kind"),
            "position": v["position"],
            "projections": v.get("projections") or {},
            "proto_from": v.get("prototypeQuery_from") or {},
            "proto_select": v.get("prototypeQuery_select") or [],
            "proto_where": v.get("prototypeQuery_where") or [],
            "visual_filters": v.get("visual_filters") or [],
            "action_target_slug": target_slug,
            "action_raw": v.get("action"),
        })
    # Aggregate: compute `data` for each aggregable visual
    stats = aggregate_page(page_spec, con)
    for k, val in stats.items(): agg_totals[k] += val
    # Apply per-visual cosmetic/filter overrides
    apply_overrides(page_spec, con)
    _write_json_and_script(
        PAGES_OUT / f"{slug}.json",
        page_spec,
        f'window.__WWIP_DATA__.pages["{slug}"]',
    )
    elapsed = time.time() - page_start
    total_elapsed = time.time() - build_start
    print(f"  [{i:2d}/{len(live_pages)}] {slug:55s} {elapsed:5.1f}s  (cum {total_elapsed:5.0f}s)", flush=True)

total_size = sum((PAGES_OUT / f).stat().st_size for f in [f"{s}.json" for s in slug_by_guid.values()])
print(f"Wrote {len(live_pages)} per-page spec JSONs ({total_size/1024:.1f} KB total)")

# Aggregation summary
print("\nAggregation summary:")
built = sum(v for k, v in agg_totals.items() if k.startswith("built_"))
unhandled = sum(v for k, v in agg_totals.items() if k.startswith("unhandled_"))
errored = sum(v for k, v in agg_totals.items() if k.startswith("error_"))
skipped = agg_totals.get("skip_decorative", 0)
total = built + unhandled + errored + skipped
pct = 100 * built / max(1, built + unhandled + errored)
print(f"  Total visuals: {total}")
print(f"  Built:         {built:4d}  ({pct:.1f}% of data-bound)")
print(f"  Unhandled:     {unhandled:4d}")
print(f"  Errored:       {errored:4d}")
print(f"  Skipped (decorative): {skipped}")
print()
print("By visual type:")
for k in sorted(agg_totals):
    if k == "skip_decorative": continue
    print(f"  {k:40s} {agg_totals[k]}")
print(f"\nOutput: {OUT}/manifest.json and {PAGES_OUT}/*.json")
