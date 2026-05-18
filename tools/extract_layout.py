"""Phase 3 extractor: parse Report/Layout into a clean per-page structured dump.

The PBIX Layout format nests stringified JSON inside JSON multiple levels deep.
This flattens it into a walkable form and writes it as pages_dump.json.
"""
from pathlib import Path
import json, zipfile, re
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
PBIX = ROOT / "source" / "Viewer_HachWIMS_DMRReportsPlus_Violations_Dataflow.pbix"
OUT  = ROOT / "tools" / "model_dump" / "pages_dump.json"

def j(s):
    if s is None or s == "": return None
    if isinstance(s, (dict, list)): return s
    try: return json.loads(s)
    except Exception: return None

# ── 1. Load raw Layout ──────────────────────────────────────────────
with zipfile.ZipFile(str(PBIX), "r") as z:
    raw = z.read("Report/Layout")
try:
    layout = json.loads(raw.decode("utf-16-le"))
except UnicodeError:
    layout = json.loads(raw.decode("utf-8"))

# ── 2. Helpers to render DAX-like query fragments ───────────────────
def _dget(x, key, default=None):
    """Safe .get() that returns default if x isn't a dict."""
    if isinstance(x, dict): return x.get(key, default)
    return default

def render_source_ref(expr):
    """Flatten a PBI Expression node into a readable field reference like
    'DATATBL.WWTP' or 'Sum(DATATBL.CURVALUE)' or 'DATATBL.Violation=1'."""
    if expr is None: return None
    if isinstance(expr, str): return expr
    if not isinstance(expr, dict): return str(expr)[:80]
    try:
        if "Column" in expr:
            c = expr["Column"]
            src = _dget(_dget(c, "Expression", {}), "SourceRef", {}) or {}
            entity = _dget(src, "Entity") or _dget(src, "Source") or "?"
            return f"{entity}.{_dget(c, 'Property','?')}"
        if "Measure" in expr:
            m = expr["Measure"]
            src = _dget(_dget(m, "Expression", {}), "SourceRef", {}) or {}
            entity = _dget(src, "Entity") or _dget(src, "Source") or "?"
            return f"{entity}.{_dget(m, 'Property','?')}"
        if "Aggregation" in expr:
            a = expr["Aggregation"]
            inner = render_source_ref(_dget(a, "Expression", {}))
            func_map = {0:"Sum",1:"Avg",2:"CountNonNull",3:"Min",4:"Max",
                        5:"DistinctCount",6:"Median",7:"StdDev",8:"Var"}
            fn = func_map.get(_dget(a, "Function"), f"Agg{_dget(a,'Function')}")
            return f"{fn}({inner})"
        if "Literal" in expr:
            return str(_dget(expr["Literal"], "Value", "?")).strip("'\"")
        if "HierarchyLevel" in expr:
            h = expr["HierarchyLevel"]
            inner = render_source_ref(_dget(_dget(h, "Expression", {}), "Hierarchy", {}))
            return f"{inner}.{_dget(h, 'Level','?')}"
        if "Hierarchy" in expr:
            h = expr["Hierarchy"]
            src = _dget(_dget(h, "Expression", {}), "SourceRef", {}) or {}
            entity = _dget(src, "Entity") or _dget(src, "Source") or "?"
            return f"{entity}.{_dget(h, 'Hierarchy','?')}"
        if "SourceRef" in expr:
            src = expr["SourceRef"] or {}
            return _dget(src, "Entity") or _dget(src, "Source") or "?"
        if "In" in expr:
            ins = expr["In"] or {}
            exprs = ", ".join(render_source_ref(e) for e in (_dget(ins,"Expressions",[]) or []))
            vals  = ", ".join(
                ", ".join(render_source_ref(v) for v in (row or []))
                for row in (_dget(ins,"Values",[]) or [])
            )
            return f"{exprs} IN ({vals})"
        if "Comparison" in expr:
            c = expr["Comparison"] or {}
            lhs = render_source_ref(_dget(c,"Left"))
            rhs = render_source_ref(_dget(c,"Right"))
            op  = {0:"=",1:">",2:">=",3:"<",4:"<="}.get(_dget(c,"ComparisonKind"), "?")
            return f"{lhs}{op}{rhs}"
        if "And" in expr:
            a = expr["And"] or {}
            return f"({render_source_ref(_dget(a,'Left'))}) AND ({render_source_ref(_dget(a,'Right'))})"
        if "Or" in expr:
            o = expr["Or"] or {}
            return f"({render_source_ref(_dget(o,'Left'))}) OR ({render_source_ref(_dget(o,'Right'))})"
        if "Not" in expr:
            return f"NOT({render_source_ref(_dget(expr['Not'],'Expression'))})"
        if "Contains" in expr:
            c = expr["Contains"] or {}
            return f"CONTAINS({render_source_ref(_dget(c,'Left'))}, {render_source_ref(_dget(c,'Right'))})"
    except Exception as e:
        return f"<render-err:{type(e).__name__}>"
    return str(expr)[:80]

def render_filter(f):
    """Take a filter dict (as appears in layout) and render it briefly."""
    if not f: return None
    conds = []
    where = _dget(_dget(f, "filter", {}) or {}, "Where") or []
    for w in where:
        c = _dget(w, "Condition") or _dget(w, "expression") or w
        conds.append(render_source_ref(c))
    # The "expression" key in a filter is usually already the Column body
    # (has "Expression"+"Property"). Wrap it so render_source_ref matches.
    raw_expr = f.get("expression")
    if isinstance(raw_expr, dict) and "Property" in raw_expr and "Expression" in raw_expr:
        field = render_source_ref({"Column": raw_expr})
    else:
        field = render_source_ref(raw_expr)
    return {
        "name": f.get("name"),
        "displayName": f.get("displayName"),
        "type": f.get("type"),
        "how": f.get("howCreated"),
        "field": field,
        "conditions": [c for c in conds if c],
    }

def extract_literal_text(obj_list, prop="text"):
    """Pull a literal string from an objects[...] entry; tolerates missing keys."""
    try:
        for item in obj_list or []:
            props = item.get("properties") or {}
            v = props.get(prop)
            if not v: continue
            if isinstance(v, dict):
                lit = _dget(_dget(v, "expr", {}) or {}, "Literal", {}) or {}
                if "Value" in lit:
                    return str(lit["Value"]).strip("'\"")
            elif isinstance(v, str):
                return v
    except Exception:
        pass
    return None

def extract_button_action(sv):
    """For actionButton visuals, figure out what clicking does."""
    vco = sv.get("vcObjects") or {}
    # Newer PBI puts actions under "visualLink" array
    links = vco.get("visualLink") or []
    for lnk in links:
        props = lnk.get("properties") or {}
        atype_expr = (props.get("type") or {}).get("expr") or {}
        atype_lit  = (atype_expr.get("Literal") or {}).get("Value")
        atype = str(atype_lit).strip("'\"") if atype_lit else None

        nav_section = (props.get("navigationSection") or {}).get("expr") or {}
        nav_page = (nav_section.get("Literal") or {}).get("Value")

        bm = (props.get("bookmark") or {}).get("expr") or {}
        bm_id = (bm.get("Literal") or {}).get("Value")

        url = (props.get("webUrl") or {}).get("expr") or {}
        url_val = (url.get("Literal") or {}).get("Value")

        return {
            "type": atype,
            "navigationSection": str(nav_page).strip("'\"") if nav_page else None,
            "bookmark": str(bm_id).strip("'\"") if bm_id else None,
            "webUrl": str(url_val).strip("'\"") if url_val else None,
        }
    return None

# ── 3. Walk sections ────────────────────────────────────────────────
pages = []
for s in layout.get("sections", []):
    page_cfg = j(s.get("config"))
    page_filters_raw = j(s.get("filters")) or []
    page_filters = [render_filter(f) for f in page_filters_raw]

    visuals = []
    for vc in s.get("visualContainers", []):
        vcfg = j(vc.get("config")) or {}
        sv   = (vcfg.get("singleVisual") or {})
        vtype = sv.get("visualType")

        # Flatten projections (role -> list of field refs)
        projections = {}
        for role, items in (sv.get("projections") or {}).items():
            projections[role] = [it.get("queryRef") for it in (items or [])]

        # Pull from prototypeQuery for extra context (filters at query level)
        pq = sv.get("prototypeQuery") or {}
        from_entities = {f.get("Name"): f.get("Entity") for f in pq.get("From", [])}
        query_selects = []
        for sel in pq.get("Select", []):
            name = sel.get("Name")
            # Replace source-letter with entity for readability
            pretty = name
            m = re.match(r"^([A-Z]\w*)\(([^)]+)\)$", name or "")
            if m: pretty = f"{m.group(1)}({m.group(2)})"
            query_selects.append(pretty)
        query_where = []
        for w in pq.get("Where", []):
            cond = w.get("Condition") or w
            query_where.append(render_source_ref(cond))

        # Visual-level filters
        vfilters_raw = j(vc.get("filters")) or []
        vfilters = [render_filter(f) for f in vfilters_raw]

        # Title (if set)
        vco = sv.get("vcObjects") or {}
        title = extract_literal_text(vco.get("title"), "text")

        # Button text (for actionButton — can live in vcObjects.text or
        # singleVisual.objects.text)
        svo = sv.get("objects") or {}
        button_text = (extract_literal_text(vco.get("text"), "text")
                       or extract_literal_text(svo.get("text"), "text")
                       or extract_literal_text(vco.get("button"), "text")
                       or extract_literal_text(svo.get("button"), "text"))
        # Visual action target (page nav / bookmark / URL)
        action = extract_button_action(sv)

        # Shape type (for "shape" visuals — rectangle/ellipse/etc.)
        shape_kind = None
        try:
            shape_obj = (sv.get("objects") or {}).get("shape")
            if shape_obj:
                shape_kind = shape_obj[0].get("properties", {}).get("shapeType", {}).get("expr", {}).get("Literal", {}).get("Value")
        except Exception:
            pass

        # Text for textboxes
        textbox_text = None
        try:
            if vtype is None:
                # textbox: general.paragraphs
                paragraphs = (vcfg.get("objects") or {}).get("general") or []
                # Sometimes text lives in singleVisual too; try both
                general_objs = (sv.get("objects") or {}).get("general") or paragraphs
                texts = []
                for g in general_objs:
                    props = g.get("properties", {})
                    paras = props.get("paragraphs", [])
                    for p in paras:
                        for tr in (p.get("textRuns") or []):
                            v = tr.get("value")
                            if v: texts.append(v)
                if texts:
                    textbox_text = " ".join(texts)[:200]
        except Exception:
            pass

        layouts = vcfg.get("layouts") or []
        pos = (layouts[0].get("position") if layouts else None) or {
            "x": vc.get("x"), "y": vc.get("y"),
            "width": vc.get("width"), "height": vc.get("height"),
            "z": vc.get("z"),
        }

        # Infer a human-friendly visual type when None (text box / shape)
        if not vtype:
            if textbox_text: vtype = "textbox"
            elif shape_kind: vtype = f"shape:{shape_kind}"
            else: vtype = "unknown"

        visuals.append({
            "name": vcfg.get("name"),
            "type": vtype,
            "title": title,
            "button_text": button_text,
            "action": action,
            "textbox_text": textbox_text,
            "shape_kind": shape_kind,
            "position": {k: pos.get(k) for k in ("x","y","width","height","z")},
            "tab_order": vcfg.get("layouts",[{}])[0].get("position",{}).get("tabOrder"),
            "projections": projections,
            "prototypeQuery_from": from_entities,
            "prototypeQuery_select": query_selects,
            "prototypeQuery_where": query_where,
            "visual_filters": vfilters,
        })

    pages.append({
        "ordinal": s.get("ordinal"),
        "name": s.get("name"),
        "displayName": s.get("displayName"),
        "width": s.get("width"),
        "height": s.get("height"),
        "displayOption": s.get("displayOption"),
        "visibility": (page_cfg or {}).get("visibility"),
        "page_filters": page_filters,
        "visuals": visuals,
    })

# ── 4. Report-level filters & config ────────────────────────────────
report_filters = [render_filter(f) for f in (j(layout.get("filters")) or [])]
report_cfg     = j(layout.get("config")) or {}
raw_bookmarks  = (report_cfg.get("bookmarks") or [])

# Build a simplified bookmark list: GUID, displayName, target page (ReportSection GUID)
section_name_to_display = {s["name"]: s.get("displayName") for s in layout.get("sections", [])}
bookmarks = []
for bm in raw_bookmarks:
    st = bm.get("explorationState") or {}
    active = st.get("activeSection")
    filters_applied = []
    for fx in ((st.get("filters") or {}).get("byExpr") or []):
        # Recurse into the filter's Where conditions
        where = (fx.get("filter") or {}).get("Where") or []
        for w in where:
            c = (w.get("Condition") or w)
            filters_applied.append(render_source_ref(c))
    # Section-level pin (a bookmark scoped to one section)
    sections_in_state = list((st.get("sections") or {}).keys())
    bookmarks.append({
        "name": bm.get("name"),
        "displayName": bm.get("displayName"),
        "target_page_guid": active,
        "target_page_name": section_name_to_display.get(active),
        "filters_applied": filters_applied,
        "sections_in_state": sections_in_state,
        "options": bm.get("options"),
        "children": bm.get("children"),
    })

# ── 5. Dump ─────────────────────────────────────────────────────────
out = {
    "pbix_version": layout.get("resourcePackages", None) and "…",
    "page_count": len(pages),
    "visual_count": sum(len(p["visuals"]) for p in pages),
    "pages": sorted(pages, key=lambda p: (p["ordinal"] if p["ordinal"] is not None else 9999)),
    "report_filters": report_filters,
    "bookmarks_count": len(bookmarks),
    "bookmarks": bookmarks,
}
OUT.write_text(json.dumps(out, indent=2))
print(f"Wrote {OUT} ({OUT.stat().st_size/1024:.1f} KB)")
print(f"Pages: {out['page_count']}, visuals: {out['visual_count']}, bookmarks: {out['bookmarks_count']}")

# ── 6. Quick histograms ─────────────────────────────────────────────
types = Counter(v["type"] for p in out["pages"] for v in p["visuals"])
print("\nVisual types:")
for t, n in types.most_common():
    print(f"  {n:5d}  {t}")
