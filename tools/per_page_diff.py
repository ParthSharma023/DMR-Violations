"""Per-page diff — for each live page, compare PBIX expectations against
what our app currently renders. Writes docs/PER_PAGE_DIFFS.md.

Inputs:
  - tools/model_dump/pages_dump.json   (basic layout: type, projections, filters)
  - tools/model_dump/page_rich.json    (deep config: cond. fmt, sort, labels, etc.)
  - app/data/pages/<slug>.json         (what our app actually has for each visual)
  - app/data/manifest.json             (live-page list + slugs)

Output:
  - docs/PER_PAGE_DIFFS.md — one section per page with gap list, severity-scored.

Each gap gets a severity:
  🔴 HIGH   — visual doesn't render at all, or shows wrong numbers
  🟡 MED    — renders but missing significant feature (cond. fmt, reference lines)
  🟢 LOW    — cosmetic (sort order, label precision, axis title)
"""
from pathlib import Path
from collections import defaultdict
import json, re

ROOT = Path(__file__).resolve().parent.parent
DUMP = ROOT / "tools/model_dump/pages_dump.json"
RICH = ROOT / "tools/model_dump/page_rich.json"
MANIFEST = ROOT / "app" / "data" / "manifest.json"
PAGES_DIR = ROOT / "app" / "data" / "pages"
OUT = ROOT / "docs" / "PER_PAGE_DIFFS.md"

# ── What our app can render today ────────────────────────────────
# Update when we add capabilities so the diff reflects reality.
APP_CAPABILITIES = {
    "renders_conditional_formatting": False,
    "renders_reference_lines":        False,
    "renders_data_labels":            False,   # only for the one overridden chart
    "respects_sort_order":            False,   # we ORDER BY 1 by default
    "honors_advanced_filters":        False,   # only IN / NOT IN / CONTAINS
    "renders_dynamic_titles":         False,
    "renders_data_point_colors":      False,   # uses default PALETTE
    "custom_axis_config":             False,   # no axis titles/formats/start/log
    "renders_top_n":                  False,
    "handles_date_slicer":            False,
    "handles_multi_entity_table_3plus": False,
    "handles_pivot_rows_columns":     False,   # pivotTable degrades to flat table
}

# Known one-off overrides applied via VISUAL_OVERRIDES in build_pages.py.
# If a visual matches one of these, we say "overridden" not "missing".
KNOWN_OVERRIDES = [
    ("ef-flow-permit-eval", "Effluent Flow, MGD"),  # Citywide capacity bar
]
def has_override(slug, title):
    t = (title or "").lower()
    for ov_slug, ov_sub in KNOWN_OVERRIDES:
        if slug == ov_slug and ov_sub.lower() in t:
            return True
    return False


# ── Load everything ──────────────────────────────────────────────
dump = json.loads(DUMP.read_text())
rich = json.loads(RICH.read_text())
manifest = json.loads(MANIFEST.read_text())

# GUID → rich visual info
rich_visual = {}
for guid, page in rich.items():
    for vname, info in page.get("visuals", {}).items():
        rich_visual[vname] = info

# page slug → page spec (from app/data/pages/*.json)
page_by_slug = {}
for pm in manifest["pages"]:
    slug = pm["slug"]
    f = PAGES_DIR / f"{slug}.json"
    if f.exists():
        page_by_slug[slug] = json.loads(f.read_text())


# ── Diff a single visual ─────────────────────────────────────────
def diff_visual(slug, visual):
    """Return list of {severity, note} gaps for one visual."""
    gaps = []
    vtype = visual["type"]
    title = visual.get("title") or visual.get("button_text") or ""

    # Purely decorative visuals — no diff needed
    if vtype in ("textbox", "shape", "basicShape", "image", "actionButton"):
        return gaps

    # Rendering failures
    has_data = "data" in visual
    has_error = "data_error" in visual
    if has_error:
        gaps.append({
            "severity": "🔴 HIGH",
            "note": f"SQL error: {visual['data_error'][:120]}",
        })
    elif not has_data:
        gaps.append({
            "severity": "🔴 HIGH",
            "note": f"Unhandled visual type: `{vtype}` (no aggregation recipe)",
        })

    # Rich-config expectations from PBIX layout
    rich_info = rich_visual.get(visual.get("name"))
    if not rich_info:
        return gaps

    # Conditional formatting (tables, KPIs)
    if rich_info.get("conditional_formatting") and not APP_CAPABILITIES["renders_conditional_formatting"]:
        n = len(rich_info["conditional_formatting"])
        gaps.append({
            "severity": "🟡 MED",
            "note": f"Conditional formatting missing ({n} rule(s) in PBIX — cell colors by threshold)",
        })

    # Reference lines (the 100%/90%/75% horizontal lines)
    if rich_info.get("reference_lines") and not APP_CAPABILITIES["renders_reference_lines"]:
        refs = rich_info["reference_lines"]
        labels = [r.get("displayName") or r.get("axis","?") for r in refs]
        gaps.append({
            "severity": "🟡 MED",
            "note": f"Reference lines missing: {', '.join(labels)}",
        })

    # Data labels (in-bar "45%" style)
    dl = rich_info.get("data_labels") or []
    dl_on = any((item.get("show") in (True, "true", 1) or
                 item.get("enableValueDataLabel") in (True, "true", 1)) for item in dl)
    if dl_on and not APP_CAPABILITIES["renders_data_labels"] and not has_override(slug, title):
        gaps.append({
            "severity": "🟢 LOW",
            "note": "Data labels ON in PBIX (we don't render them)",
        })

    # Custom data-point colors (brand/theme overrides)
    if rich_info.get("data_point_colors") and not APP_CAPABILITIES["renders_data_point_colors"] \
            and not has_override(slug, title):
        colors = rich_info["data_point_colors"]
        gaps.append({
            "severity": "🟢 LOW",
            "note": f"Custom series/category colors: {len(colors)} override(s). We use default palette.",
        })

    # Sort order — we honor it only incidentally (ORDER BY 1). If PBIX sorts
    # by a different field or direction, we may differ.
    so = rich_info.get("sort_order")
    if so and not APP_CAPABILITIES["respects_sort_order"]:
        # Only note as a gap if the sort isn't trivial (field at position 0)
        first = so[0]
        if first.get("direction") != "ASC" or "Sum(" in first.get("field","") or "Avg(" in first.get("field",""):
            gaps.append({
                "severity": "🟢 LOW",
                "note": f"Sort: {first['field']} {first['direction']}. We use alphabetical.",
            })

    # Advanced filters (>, <, BETWEEN) — we silently drop
    if rich_info.get("advanced_filters") and not APP_CAPABILITIES["honors_advanced_filters"]:
        af = rich_info["advanced_filters"]
        ops = set(a.get("op") for a in af)
        gaps.append({
            "severity": "🟡 MED",
            "note": f"Advanced filter(s) dropped: {', '.join(sorted(ops))}",
        })

    # Top N filter
    if rich_info.get("top_n") and not APP_CAPABILITIES["renders_top_n"]:
        gaps.append({
            "severity": "🟡 MED",
            "note": f"Top N filter dropped — we show all categories",
        })

    # Dynamic title (not a literal — computed from a measure)
    if rich_info.get("dynamic_title") and not APP_CAPABILITIES["renders_dynamic_titles"]:
        gaps.append({
            "severity": "🟢 LOW",
            "note": f"Dynamic title bound to `{rich_info['dynamic_title']}`. We show literal/blank.",
        })

    # Axis customizations
    va = rich_info.get("value_axis") or []
    if va and not APP_CAPABILITIES["custom_axis_config"]:
        notable = []
        for ax in va:
            if ax.get("showAxisTitle") == "true":
                notable.append(f"axis title ({ax.get('axisTitle','?')})")
            if ax.get("logAxisScale") == "true":
                notable.append("log scale")
            if ax.get("start") is not None:
                notable.append(f"start at {ax['start']}")
            if ax.get("labelDisplayUnits"):
                notable.append(f"display units {ax['labelDisplayUnits']}")
        if notable:
            gaps.append({
                "severity": "🟢 LOW",
                "note": f"Value-axis config: {', '.join(notable)}",
            })

    # pivotTable-specific: we degrade to flat
    if vtype == "pivotTable" and not APP_CAPABILITIES["handles_pivot_rows_columns"]:
        proj = visual.get("projections") or {}
        has_rows_cols = (proj.get("Rows") or proj.get("Columns"))
        if has_rows_cols:
            gaps.append({
                "severity": "🟡 MED",
                "note": "Pivot with Rows+Columns projections — we render as flat table",
            })

    # Slicer on DATESTAMP
    if vtype == "slicer":
        proj = visual.get("projections") or {}
        refs = proj.get("Values") or []
        if any("DATESTAMP" in r or ".Date." in r for r in refs):
            if not APP_CAPABILITIES["handles_date_slicer"]:
                gaps.append({
                    "severity": "🟡 MED",
                    "note": "Date slicer renders as dropdown of ~500 dates (no filtering)",
                })

    return gaps


# ── Build the report ─────────────────────────────────────────────
def severity_weight(s):
    return {"🔴 HIGH": 3, "🟡 MED": 2, "🟢 LOW": 1}.get(s, 0)

lines = ["# Per-Page Diffs — v2 app vs. PBIX", "",
         "Auto-generated gap list. Each page lists what PBIX expects but our app doesn't yet produce. "
         "Severity:",
         "- 🔴 **HIGH** — visual doesn't render / shows wrong numbers",
         "- 🟡 **MED** — renders but missing significant feature (cond. fmt, reference lines, advanced filters)",
         "- 🟢 **LOW** — cosmetic (sort order, label precision, axis title)",
         "",
         "Rebuild with: `python tools/per_page_diff.py`",
         ""]

# Overall tally
tally = {"🔴 HIGH": 0, "🟡 MED": 0, "🟢 LOW": 0}
page_rows = []  # (slug, display, [gaps])

for pm in manifest["pages"]:
    slug = pm["slug"]
    page_spec = page_by_slug.get(slug)
    if not page_spec: continue
    page_gaps = []
    for v in page_spec.get("visuals", []):
        gaps = diff_visual(slug, v)
        for g in gaps:
            g["visual"] = v.get("title") or v.get("button_text") or v.get("type")
            g["visual_type"] = v["type"]
            g["visual_name"] = v.get("name")
        page_gaps.extend(gaps)
    # Score + store
    for g in page_gaps:
        tally[g["severity"]] += 1
    # Sort gaps by severity
    page_gaps.sort(key=lambda g: -severity_weight(g["severity"]))
    page_rows.append((slug, pm["display_name"], page_gaps))

# Summary section
lines += [
    "## Summary",
    "",
    f"- **Pages**: {len(page_rows)}",
    f"- **Total gaps**: {sum(tally.values())}",
    f"  - 🔴 HIGH:  {tally['🔴 HIGH']}",
    f"  - 🟡 MED:   {tally['🟡 MED']}",
    f"  - 🟢 LOW:   {tally['🟢 LOW']}",
    "",
    "## Page list — sorted by gap severity (worst first)",
    "",
    "| Slug | Display Name | 🔴 | 🟡 | 🟢 | Jump |",
    "|---|---|---:|---:|---:|---|",
]

# Rank pages
ranked = []
for slug, name, gaps in page_rows:
    hi = sum(1 for g in gaps if g["severity"] == "🔴 HIGH")
    md = sum(1 for g in gaps if g["severity"] == "🟡 MED")
    lo = sum(1 for g in gaps if g["severity"] == "🟢 LOW")
    score = hi*100 + md*10 + lo
    ranked.append((score, slug, name, gaps, hi, md, lo))
ranked.sort(reverse=True)

for score, slug, name, gaps, hi, md, lo in ranked:
    if score == 0: continue
    anchor = re.sub(r"[^\w-]", "", slug.lower())
    lines.append(f"| `{slug}` | {name} | {hi} | {md} | {lo} | [→](#{anchor}) [open](http://127.0.0.1:8734/#/{slug}) |")

lines += ["", "---", "", "## Per-page details", ""]

for score, slug, name, gaps, hi, md, lo in ranked:
    if not gaps: continue
    anchor = re.sub(r"[^\w-]", "", slug.lower())
    lines.append(f"### <a id=\"{anchor}\"></a>`{slug}` — {name}")
    lines.append("")
    lines.append(f"[Open in app](http://127.0.0.1:8734/#/{slug}) · {hi} high · {md} med · {lo} low")
    lines.append("")
    lines.append("| Severity | Visual | Gap |")
    lines.append("|---|---|---|")
    for g in gaps:
        vt = (g["visual"] or "?")[:50].replace("|","\\|")
        note = g["note"].replace("|","\\|")
        lines.append(f"| {g['severity']} | `{g['visual_type']}` {vt} | {note} |")
    lines.append("")

# Pages with zero gaps
clean = [p for p in ranked if p[0] == 0]
if clean:
    lines += [f"## Pages with no detected gaps ({len(clean)})", ""]
    for score, slug, name, gaps, *_ in clean:
        lines.append(f"- `{slug}` — {name}")

OUT.write_text("\n".join(lines))
print(f"Wrote {OUT}  ({OUT.stat().st_size/1024:.1f} KB)")
print(f"Pages analyzed:     {len(page_rows)}")
print(f"Total gaps:         {sum(tally.values())}")
print(f"  🔴 HIGH:  {tally['🔴 HIGH']}")
print(f"  🟡 MED:   {tally['🟡 MED']}")
print(f"  🟢 LOW:   {tally['🟢 LOW']}")
print()
print("Top 10 pages by gap score:")
for score, slug, name, gaps, hi, md, lo in ranked[:10]:
    print(f"  score={score:4d}  {slug:42s}  🔴{hi} 🟡{md} 🟢{lo}")
