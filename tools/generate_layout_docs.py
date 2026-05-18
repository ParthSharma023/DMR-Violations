"""Generate Phase 3 markdown docs from pages_dump.json.

Produces 5 files in ~/Documents/CoH/context/pbix/:
  10_pages_index.md          - 104-page table of contents
  11_pages_detail.md         - every visual on every page, searchable
  12_visual_types.md         - visual-type inventory + rebuild notes
  13_interactivity.md        - bookmarks + navigation graph
  14_filters.md              - report/page/visual filter patterns
"""
from pathlib import Path
from collections import Counter, defaultdict
import json

ROOT = Path(__file__).resolve().parents[1]
DUMP = ROOT / "tools" / "model_dump" / "pages_dump.json"
OUT  = Path("/Users/parthsharma/Documents/CoH/context/pbix")
OUT.mkdir(parents=True, exist_ok=True)

d = json.loads(DUMP.read_text())
pages = d["pages"]
bookmarks = d["bookmarks"]
bm_by_guid = {b["name"]: b for b in bookmarks}
section_name_by_guid = {p["name"]: p["displayName"] for p in pages}

# ── Helpers ────────────────────────────────────────────────────────
def page_category(name: str) -> str:
    n = (name or "").lower()
    if n == "home": return "01 Home"
    if "permit" in n or "aaf" in n or "75/90" in n or "75 90" in n: return "02 Permit & Flow Evaluation"
    if "daily report" in n or "(scottl)" in n or "inf/eff" in n or "aeration daily" in n: return "03 Operator Daily Reports"
    if "dmr 5yr" in n or "(dmr)" in n or "mo dmr" in n or "historical" in n: return "04 DMR 5-Year Historical"
    if any(p in n for p in ["ras", "was", "svi", "clarifier", "s aeration", "digestor", "thck", "thicken", "chemical", "chemica", "elec"]):
        return "05 Process Equipment"
    if "regulatory" in n or "multi-var" in n or "key lab" in n: return "06 Regulatory & KPI"
    if "wwtp optimiz" in n or "scott wwf" in n or "northside wwf" in n or "bretshire" in n or "easthaven" in n or "willow" in n:
        return "07 WWTP-Specific"
    if n.startswith("dt ") or "explore data" in n or "o&m report" in n or "benchmarking" in n or "plant efficiency" in n:
        return "08 Data Tools / Explorer"
    if "if, " in n or "% rem" in n or "eff) cbod" in n or "eff) tss" in n or "eff) nh3" in n or "(if vs ef)" in n:
        return "09 Influent vs Effluent"
    return "99 Uncategorized"

def fmt_field(q):
    if not q: return "—"
    return str(q)

def short_filter(f):
    if not f: return ""
    fld = f.get("field") or "?"
    cond = "; ".join(f.get("conditions") or [])
    return f"{fld}" + (f" — {cond}" if cond else "")

# ── 10_pages_index.md ──────────────────────────────────────────────
idx_lines = ["# PBIX Pages Index",
             "",
             f"**{len(pages)} pages, {sum(len(p['visuals']) for p in pages)} visuals.** "
             "Pages are listed in their ordinal (navigation) order. "
             "Hidden pages have visibility=1.",
             "",
             "| # | Page | Visuals | Category | Hidden | Notes |",
             "|---:|------|---:|---|:---:|---|"]

cats = defaultdict(list)
for i, p in enumerate(pages):
    cat = page_category(p["displayName"] or "")
    cats[cat].append(p)
    vct = len(p["visuals"])
    hidden = "✓" if p.get("visibility") == 1 else ""
    # Brief notes: datasets used
    ents = Counter()
    for v in p["visuals"]:
        ents.update(v.get("prototypeQuery_from", {}).values() or [])
    top_ents = ", ".join(f"{e}:{n}" for e, n in ents.most_common(3))
    idx_lines.append(f"| {p['ordinal']} | **{p['displayName']}** | {vct} | {cat} | {hidden} | {top_ents or '—'} |")

idx_lines += ["", "## Category rollup", "", "| Category | Pages | Visuals |", "|---|---:|---:|"]
for c in sorted(cats):
    pgs = cats[c]
    vct = sum(len(p["visuals"]) for p in pgs)
    idx_lines.append(f"| {c} | {len(pgs)} | {vct} |")

(OUT / "10_pages_index.md").write_text("\n".join(idx_lines) + "\n")

# ── 11_pages_detail.md ─────────────────────────────────────────────
det = ["# PBIX Pages — Full Visual Inventory",
       "",
       "Every visual on every page with its type, title, data bindings, "
       "query source, and visual-level filters. Ordered by page ordinal. "
       "Use Cmd-F/Ctrl-F to jump to a page by name.",
       "",
       "Decorative visuals (`textbox`, `shape`, `basicShape`, `image`) are "
       "listed only as counts at the top of each page — they don't bind data.",
       "",
       "---"]

for p in pages:
    data_visuals = [v for v in p["visuals"] if v["type"] not in ("textbox", "shape", "basicShape", "image")]
    decor = Counter(v["type"] for v in p["visuals"] if v["type"] in ("textbox", "shape", "basicShape", "image"))
    decor_str = ", ".join(f"{k}={n}" for k, n in decor.items()) or "—"

    det.append(f"\n## Page {p['ordinal']}: {p['displayName']}")
    det.append(f"- **GUID**: `{p['name']}`")
    det.append(f"- **Canvas**: {p['width']}×{p['height']}  |  displayOption={p['displayOption']}  |  visibility={p.get('visibility') or 0}")
    det.append(f"- **Visuals**: {len(p['visuals'])} ({len(data_visuals)} data-bound, decorative: {decor_str})")
    pfs = [short_filter(f) for f in (p.get("page_filters") or []) if f]
    if pfs:
        det.append(f"- **Page-level filters**:")
        for pf in pfs: det.append(f"  - {pf}")

    if not data_visuals:
        det.append("\n*(no data-bound visuals — navigation / background page)*")
        continue

    det.append("")
    det.append("| # | Type | Title | Position (x,y / w×h) | Data binding | Visual filters |")
    det.append("|---:|---|---|---|---|---|")

    for i, v in enumerate(data_visuals, 1):
        pos = v["position"] or {}
        px = int(pos.get("x") or 0); py = int(pos.get("y") or 0)
        pw = int(pos.get("width") or 0); ph = int(pos.get("height") or 0)
        title = v.get("title") or v.get("button_text") or "—"
        if v["type"] == "actionButton":
            a = v.get("action") or {}
            bm = bm_by_guid.get(a.get("bookmark") or "")
            if bm:
                tgt = f"→ bookmark `{bm['displayName']}` (page `{bm.get('target_page_name') or '?'}`)"
            elif a.get("navigationSection"):
                tgt = f"→ page `{section_name_by_guid.get(a['navigationSection']) or a['navigationSection']}`"
            elif a.get("webUrl"):
                tgt = f"→ url `{a['webUrl']}`"
            else:
                tgt = "(no action)"
            binding = tgt
        else:
            proj_parts = []
            for role, refs in (v.get("projections") or {}).items():
                if refs: proj_parts.append(f"**{role}**: {', '.join(fmt_field(r) for r in refs)}")
            if not proj_parts and v.get("prototypeQuery_select"):
                proj_parts.append("select: " + ", ".join(v["prototypeQuery_select"]))
            binding = "<br>".join(proj_parts) or "—"
        vf = "<br>".join(short_filter(f) for f in (v.get("visual_filters") or []) if f) or "—"
        title_clean = (title or "—").replace("|","\\|").replace("\n"," ")[:80]
        binding_clean = binding.replace("|","\\|")
        vf_clean = vf.replace("|","\\|")
        det.append(f"| {i} | `{v['type']}` | {title_clean} | ({px},{py} / {pw}×{ph}) | {binding_clean} | {vf_clean} |")

(OUT / "11_pages_detail.md").write_text("\n".join(det) + "\n")

# ── 12_visual_types.md ─────────────────────────────────────────────
vt_counter = Counter(v["type"] for p in pages for v in p["visuals"])
vt_notes = {
    "slicer": "Filter control. Can be list, dropdown, date range, numeric slider. Bind to a single column. **Web equiv**: `<select>`, checkbox list, date-range picker, or `noUiSlider`.",
    "actionButton": "Navigation or bookmark trigger. **Web equiv**: `<a>`/`<button>` with route handler. Each button's action captured in the 'action' field — type ∈ {Bookmark, Navigation, Back, URL}.",
    "areaChart": "Time-series area. **Web equiv**: Chart.js `line` with `fill: 'origin'`.",
    "textbox": "Static text label. **Web equiv**: `<div>` / `<h3>`.",
    "kpi": "Single value card with sparkline trend + indicator color. **Web equiv**: custom card HTML + mini-spark (Chart.js `line` without grid).",
    "lineClusteredColumnComboChart": "Line + clustered column on dual Y axes. **Web equiv**: Chart.js mixed chart (`line` + `bar` datasets).",
    "shape": "Rectangle/ellipse/etc. for visual grouping. Not data-bound.",
    "tableEx": "Scrollable data table. **Web equiv**: `<table>` + custom sort/pagination.",
    "clusteredColumnChart": "Grouped/clustered columns. **Web equiv**: Chart.js `bar` with multiple datasets.",
    "pivotTable": "Matrix with row/column hierarchies and subtotals. **Web equiv**: pivot-library (e.g., `pivottable.js`) or hand-rolled rollup renderer.",
    "card": "Single-metric display. **Web equiv**: trivial HTML card.",
    "basicShape": "Decoration.",
    "image": "Static image (logos, diagrams). **Web equiv**: `<img>`.",
    "lineChart": "Plain line. **Web equiv**: Chart.js `line`.",
    "columnChart": "Plain column. **Web equiv**: Chart.js `bar`.",
    "textFilter25A4896A83E0487089E2B90C9AE57C8A": "**Custom visual — AppSource 'Text Filter'.** Free-text search that filters a column. **Web equiv**: `<input type=search>` + debounced filter dispatch.",
    "lineStackedColumnComboChart": "Line + stacked-column. **Web equiv**: Chart.js mixed (`line` + stacked `bar`).",
    "PowerApps_PBI_CV_C29F1DCC_81F5_4973_94AD_0517D44CC06A": "**Custom visual — PowerApps embed.** Embeds a Canvas-app tile. **Web equiv**: depends on what the PowerApp does — likely replace with custom form/logic.",
    "hundredPercentStackedColumnChart": "100% stacked columns (normalized). **Web equiv**: Chart.js `bar` stacked, then normalize datasets.",
    "gauge": "Circular/bullet gauge. **Web equiv**: Chart.js `doughnut` half-circle, or `svelte-gauge` / custom SVG.",
}
vt = ["# Visual Types Inventory",
      "",
      f"**{sum(vt_counter.values())}** visuals across {len(pages)} pages, distributed over "
      f"**{len(vt_counter)}** distinct visual types.",
      "",
      "| Count | Type | Data-bound | Rebuild note |",
      "|---:|---|---|---|"]
data_bound = {"slicer","areaChart","kpi","lineClusteredColumnComboChart","tableEx",
              "clusteredColumnChart","pivotTable","card","lineChart","columnChart",
              "textFilter25A4896A83E0487089E2B90C9AE57C8A","lineStackedColumnComboChart",
              "PowerApps_PBI_CV_C29F1DCC_81F5_4973_94AD_0517D44CC06A",
              "hundredPercentStackedColumnChart","gauge"}
for t, n in vt_counter.most_common():
    db = "yes" if t in data_bound else ("nav" if t == "actionButton" else "no")
    vt.append(f"| {n} | `{t}` | {db} | {vt_notes.get(t, '—')} |")

vt += ["",
       "## Custom visuals",
       "",
       "Two AppSource custom visuals are used:",
       "",
       "- **`textFilter25A4896A83E0487089E2B90C9AE57C8A`** — Text Filter. Free-text slicer.",
       "- **`PowerApps_PBI_CV_C29F1DCC_81F5_4973_94AD_0517D44CC06A`** — PowerApps embedded canvas app. "
       "Used on 2 visuals. If we're replacing these, we need to know what the PowerApp did — worth a "
       "clarifying question to the original author.",
       "",
       "## Earlier-docs reference",
       "",
       "Earlier notes (`dmr_violations_dashboard.md`) listed ZoomCharts TimeChart/FacetChart, Bullet Chart, "
       "and Multiple Axes Chart as custom visuals. **Those are NOT in this PBIX** — only Text Filter and "
       "PowerApps CV appear. Correction should propagate back to that doc.",
       ""]
(OUT / "12_visual_types.md").write_text("\n".join(vt))

# ── 13_interactivity.md ────────────────────────────────────────────
it = ["# Interactivity — Bookmarks, Navigation, Actions",
      "",
      f"**{len(bookmarks)} bookmarks** defined. Most are triggered by actionButtons on the Home page (46 buttons).",
      ""]

# Home page nav graph
home = next((p for p in pages if p["displayName"] == "Home"), None)
if home:
    it += ["## Home page navigation graph",
           "",
           f"Home has {sum(1 for v in home['visuals'] if v['type'] == 'actionButton')} clickable action buttons.",
           "",
           "| Button caption | Action | Target |",
           "|---|---|---|"]
    for v in home["visuals"]:
        if v["type"] != "actionButton": continue
        a = v.get("action") or {}
        if a.get("bookmark"):
            bm = bm_by_guid.get(a["bookmark"])
            if bm:
                tgt = f"bookmark `{bm['displayName']}` → page **{bm.get('target_page_name') or '?'}**"
                act = "Bookmark"
            else:
                tgt = f"bookmark `{a['bookmark']}` (unresolved)"
                act = "Bookmark"
        elif a.get("navigationSection"):
            tgt = f"page **{section_name_by_guid.get(a['navigationSection']) or '?'}**"
            act = "Page nav"
        elif a.get("webUrl"):
            tgt = f"URL `{a['webUrl']}`"
            act = "External"
        else:
            tgt = "*(none)*"
            act = "—"
        caption = (v.get("button_text") or v.get("title") or "—").replace("|","\\|")
        it.append(f"| {caption} | {act} | {tgt} |")

# Bookmarks list
it += ["",
       "## Full bookmark list",
       "",
       "| Bookmark name | Target page | Filters applied |",
       "|---|---|---|"]
for bm in bookmarks:
    filt = "; ".join(bm.get("filters_applied") or []) or "—"
    it.append(f"| {bm['displayName']} | {bm.get('target_page_name') or bm.get('target_page_guid') or '—'} | {filt[:200].replace('|','\\|')} |")

# Drill-through targets: sections whose config has a drillFilterOtherVisuals / drillthrough
# Not extracted separately above, but many pages might have drillthrough filters; leave as note.
it += ["",
       "## Drill-through",
       "",
       "The layout parser did not identify explicit drill-through target pages "
       "(pages that can only be reached via right-click drillthrough from another visual). "
       "Evidence of drillthrough would be a page with a `filters` section containing "
       "`howCreated: 1` (DrillThrough). This pass treats all filters uniformly; see "
       "`11_pages_detail.md` for the raw page-level filters on each page.",
       ""]

(OUT / "13_interactivity.md").write_text("\n".join(it))

# ── 14_filters.md ──────────────────────────────────────────────────
fp = ["# Filters — Report, Page, and Visual Level",
      "",
      "Power BI filters cascade from report level down to page level down to visual level. "
      "This doc catalogs what each scope holds in this PBIX.",
      ""]

fp += ["## Report-level filters (apply to every page)", ""]
rfs = d.get("report_filters") or []
if not rfs:
    fp.append("*(none)*")
else:
    fp.append("| Field | Conditions | Type |")
    fp.append("|---|---|---|")
    for f in rfs:
        fld = (f or {}).get("field") or "?"
        cond = "; ".join((f or {}).get("conditions") or []) or "—"
        ftype = (f or {}).get("type") or "—"
        fp.append(f"| `{fld}` | {cond[:200]} | {ftype} |")

# Page-filter summary
fp += ["",
       "## Page-level filters",
       "",
       "Pages that apply additional page-scoped filters above the report-level:",
       "",
       "| Page | Filter field | Conditions |",
       "|---|---|---|"]
for p in pages:
    for f in (p.get("page_filters") or []):
        if not f: continue
        fld = f.get("field") or "?"
        cond = "; ".join(f.get("conditions") or [])
        if not cond: continue  # skip empty filters (typically just pass-through scopes)
        fp.append(f"| **{p['displayName']}** | `{fld}` | {cond[:200].replace('|','\\|')} |")

# Visual-filter most common patterns (across all pages, which fields are filtered most)
vf_fields = Counter()
for p in pages:
    for v in p["visuals"]:
        for f in (v.get("visual_filters") or []):
            if f and f.get("field"):
                vf_fields[f["field"]] += 1
fp += ["",
       "## Most-filtered fields (visual level)",
       "",
       "Across all 1,073 visuals, these fields appear in visual-level filters most often:",
       "",
       "| Field | Visuals filtering on it |",
       "|---|---:|"]
for fld, n in vf_fields.most_common(30):
    fp.append(f"| `{fld}` | {n} |")

fp += ["", "## Global filters from Phase 2 notes", "",
       "`dmr_violations_dashboard.md` previously identified these as implicit report-level filters:",
       "- WWTP excludes: Bretshire, Eastheven, Northside, Scott St., Willow Run, and SUM facility codes",
       "- Date ≥ 2005-01-01",
       "",
       "These are likely expressed as an `In` exclusion on `VARDESC[WWTP]` at report or page scope. "
       "Check the table above for the exact values.",
       ""]
(OUT / "14_filters.md").write_text("\n".join(fp))

print("Generated:")
for f in sorted(OUT.glob("1?_*.md")):
    print(f"  {f.name:30s}  {f.stat().st_size/1024:6.1f} KB")
