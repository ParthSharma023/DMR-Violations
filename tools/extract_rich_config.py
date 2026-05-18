"""Deep extraction of PBIX visual config — the fields the basic extractor skipped.

Produces `tools/model_dump/page_rich.json` with per-visual:
  - conditional formatting rules (dataBars, backColor, fontColor)
  - sort order (OrderBy)
  - Top N filters
  - display-name overrides on measures/projections
  - axis titles, formats, visibility, starts, log scale
  - data-label settings (show, position, format, precision)
  - reference lines (value, display name, color)
  - per-category/series color overrides
  - advanced filter patterns beyond IN/NOT IN/CONTAINS
  - dynamic title expressions (non-Literal)

Rich data is keyed by (page_guid, visual_name) so it can be joined to the
layout dump in build_pages.py.
"""
from pathlib import Path
import json, zipfile

ROOT = Path(__file__).resolve().parent.parent
PBIX = ROOT / "source" / "Viewer_HachWIMS_DMRReportsPlus_Violations_Dataflow.pbix"
OUT  = ROOT / "tools/model_dump/page_rich.json"

def _dget(x, *path, default=None):
    for k in path:
        if not isinstance(x, dict): return default
        x = x.get(k)
        if x is None: return default
    return x

def _literal(expr):
    """Extract a literal scalar from an expression like {Literal: {Value: "'abc'"}}."""
    if not isinstance(expr, dict): return None
    lit = _dget(expr, "Literal", "Value")
    if lit is None: return None
    s = str(lit)
    if s.startswith("'") and s.endswith("'"): s = s[1:-1]
    elif s.startswith("\"") and s.endswith("\""): s = s[1:-1]
    return s

def _literal_in_property(prop):
    """Walk common wrappings: {expr: {Literal: {...}}} or {solid: {color: {expr: Literal}}}."""
    if not isinstance(prop, dict): return None
    if "expr" in prop:
        return _literal(prop["expr"])
    if "solid" in prop:
        return _dget(prop, "solid", "color", "expr", "Literal", "Value")
    return None

def _render_source_ref(expr):
    """Flatten an expression to 'Entity.Property' or similar. Stripped-down."""
    if not isinstance(expr, dict): return None
    if "Column" in expr:
        c = expr["Column"]
        src = _dget(c, "Expression", "SourceRef", default={}) or {}
        ent = src.get("Entity") or src.get("Source") or "?"
        return f"{ent}.{c.get('Property','?')}"
    if "Measure" in expr:
        m = expr["Measure"]
        src = _dget(m, "Expression", "SourceRef", default={}) or {}
        ent = src.get("Entity") or src.get("Source") or "?"
        return f"{ent}.{m.get('Property','?')}"
    if "Aggregation" in expr:
        a = expr["Aggregation"]
        inner = _render_source_ref(a.get("Expression") or {})
        func_map = {0:"Sum",1:"Avg",2:"CountNonNull",3:"Min",4:"Max",
                    5:"DistinctCount",6:"Median",7:"StdDev",8:"Var"}
        fn = func_map.get(a.get("Function"), f"Agg{a.get('Function')}")
        return f"{fn}({inner})" if inner else None
    return None

# ── Extract per-visual rich config ──────────────────────────────────

def extract_visual_rich(vc):
    """Return a dict of rich config features for a single visualContainer."""
    cfg = json.loads(vc.get("config") or "{}")
    sv  = cfg.get("singleVisual") or {}
    objs = sv.get("objects") or {}
    vco  = sv.get("vcObjects") or {}
    out = {
        "name": cfg.get("name"),
        "visualType": sv.get("visualType"),
    }

    # ── Dynamic title expression (if it's not a Literal) ──
    title_arr = vco.get("title") or []
    for t in title_arr:
        props = t.get("properties") or {}
        text_expr = _dget(props, "text", "expr")
        if not text_expr: continue
        if "Literal" in text_expr: continue  # already captured as plain title
        # Non-literal: could be Aggregation, Measure, Column
        ref = _render_source_ref(text_expr)
        if ref:
            out["dynamic_title"] = ref
            break

    # ── Sort order (from prototypeQuery.OrderBy) ──
    pq = sv.get("prototypeQuery") or {}
    sort_spec = []
    for ob in pq.get("OrderBy") or []:
        ref = _render_source_ref(ob.get("Expression") or {})
        direction = "DESC" if ob.get("Direction") == 2 else "ASC"
        if ref: sort_spec.append({"field": ref, "direction": direction})
    if sort_spec: out["sort_order"] = sort_spec

    # ── Top N filter (inline in filters, not visual_filters alone) ──
    for f in json.loads(vc.get("filters") or "[]") or []:
        if f.get("type") == "TopN":
            out.setdefault("top_n", []).append({
                "field": f.get("name") or "?",
                "count": _dget(f, "filter", "TopN", "Count"),
            })

    # ── Axis configs ──
    for ax_key, ax_objs in (("value_axis", objs.get("valueAxis")),
                             ("category_axis", objs.get("categoryAxis")),
                             ("value_axis2", objs.get("y1AxisReferenceLine"))):
        if not ax_objs: continue
        for item in ax_objs:
            props = item.get("properties") or {}
            axis_info = {}
            for k in ("show", "showAxisTitle", "axisTitle", "start", "end",
                      "logAxisScale", "labelDisplayUnits", "labelPrecision",
                      "gridlineShow"):
                v = _literal_in_property(props.get(k))
                if v is not None: axis_info[k] = v
            if axis_info: out.setdefault(ax_key, []).append(axis_info)

    # ── Data labels config ──
    labels = objs.get("labels") or []
    for item in labels:
        props = item.get("properties") or {}
        info = {}
        for k in ("show", "labelPosition", "labelOrientation", "enableValueDataLabel",
                  "enableDetailDataLabel", "labelDisplayUnits", "labelPrecision",
                  "detailContentType"):
            v = _literal_in_property(props.get(k))
            if v is not None: info[k] = v
        if info: out.setdefault("data_labels", []).append(info)

    # ── Per-category / per-series color overrides ──
    dp = objs.get("dataPoint") or []
    colors = []
    for item in dp:
        props = item.get("properties") or {}
        fill = _dget(props, "fill", "solid", "color", "expr", "Literal", "Value")
        selector = item.get("selector")
        if fill:
            colors.append({"selector": selector, "color": fill.strip("'\"")})
    if colors:
        out["data_point_colors"] = colors

    # ── Conditional formatting on tables (dataBars / backColor / fontColor) ──
    for cf_key in ("dataBars", "backColor", "fontColor", "values"):
        arr = objs.get(cf_key) or []
        for item in arr:
            props = item.get("properties") or {}
            info = {"key": cf_key}
            for k, v in props.items():
                # Values with conditional expressions have Conditional / Rule
                cond = _dget(v, "solid", "color", "expr", "Conditional")
                if cond:
                    info[k] = {
                        "rules": cond.get("Cases") or cond.get("Rules"),
                        "default": _dget(v, "solid", "color", "expr", "Conditional", "Default"),
                    }
                else:
                    lit = _literal_in_property(v)
                    if lit is not None: info[k] = lit
            if len(info) > 1:
                out.setdefault("conditional_formatting", []).append(info)

    # ── Reference lines ──
    for rl_key in ("y1AxisReferenceLine", "xAxisReferenceLine",
                   "referenceLine", "lineAxis"):
        arr = objs.get(rl_key) or []
        for item in arr:
            props = item.get("properties") or {}
            info = {"axis": rl_key}
            for k in ("show", "value", "displayName", "lineColor", "style",
                      "dataLabelShow", "dataLabelText"):
                v = _literal_in_property(props.get(k))
                if v is not None: info[k] = v
            if len(info) > 1: out.setdefault("reference_lines", []).append(info)

    # ── Display-name overrides on measures/columns ──
    # Projections store explicit DisplayName only when the user renamed; check
    # singleVisual.displayNameSources or projection's `queryMetadata.options`.
    # Not always present; best-effort.
    # Also check rename hints in prototypeQuery.Select entries via `Name`.
    renames = {}
    for sel in pq.get("Select") or []:
        # Name of this select; some PBIX uses this as display when set explicitly
        name = sel.get("Name")
        if not name: continue
        # Look for a display-name override in vcObjects or objects
        pass  # (usually coincides with name; non-trivial to distinguish)
    # No clean extraction for renames in the layout blob — leave empty.

    # ── Visual filter details beyond IN/NOT IN/CONTAINS ──
    # Flag filters that are "Advanced" with Greater/Less/Between operators.
    adv_filters = []
    for f in json.loads(vc.get("filters") or "[]") or []:
        if f.get("type") != "Advanced": continue
        where = _dget(f, "filter", "Where") or []
        for w in where:
            cond = w.get("Condition") or {}
            # Recognize operator patterns
            if "Comparison" in cond:
                c = cond["Comparison"]
                op = {0:"=",1:">",2:">=",3:"<",4:"<="}.get(c.get("ComparisonKind"), "?")
                lhs = _render_source_ref(c.get("Left") or {})
                rhs = _literal(c.get("Right") or {})
                adv_filters.append({"op": op, "left": lhs, "right": rhs})
            elif "Between" in cond:
                adv_filters.append({"op": "BETWEEN", "raw": True})
    if adv_filters: out["advanced_filters"] = adv_filters

    return out


def main():
    with zipfile.ZipFile(str(PBIX), "r") as z:
        raw = z.read("Report/Layout")
    try:
        layout = json.loads(raw.decode("utf-16-le"))
    except UnicodeError:
        layout = json.loads(raw.decode("utf-8"))

    rich_by_page = {}
    total_visuals = 0
    total_rich_fields = 0
    feature_counts = {}
    for s in layout["sections"]:
        guid = s["name"]
        rich_by_page[guid] = {"displayName": s.get("displayName"), "visuals": {}}
        for vc in s.get("visualContainers", []):
            info = extract_visual_rich(vc)
            total_visuals += 1
            # Count non-basic fields
            extras = [k for k in info.keys() if k not in ("name","visualType")]
            if extras:
                rich_by_page[guid]["visuals"][info["name"]] = info
                for k in extras:
                    feature_counts[k] = feature_counts.get(k, 0) + 1
                total_rich_fields += len(extras)

    OUT.write_text(json.dumps(rich_by_page, indent=2))
    print(f"Wrote {OUT}  ({OUT.stat().st_size/1024:.1f} KB)")
    print(f"Visuals scanned:        {total_visuals}")
    print(f"Visuals with rich config: {sum(len(p['visuals']) for p in rich_by_page.values())}")
    print()
    print("Feature coverage (# of visuals that have each):")
    for k, n in sorted(feature_counts.items(), key=lambda x: -x[1]):
        print(f"  {k:30s} {n}")

if __name__ == "__main__":
    main()
