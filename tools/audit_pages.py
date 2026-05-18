"""Phase 5E audit — scan every page's aggregation state and identify patterns.

Outputs audit.md with:
  - overall coverage table
  - per-page rundown (built / errored / unhandled by visual type)
  - failure-pattern analysis (recurring error messages, common unhandled projections)
  - prioritized fix list
"""
from pathlib import Path
from collections import Counter, defaultdict
import json, re

ROOT = Path(__file__).resolve().parent.parent
PAGES_DIR = ROOT / "app" / "data" / "pages"
MANIFEST = json.loads((ROOT / "app" / "data" / "manifest.json").read_text())
OUT = ROOT / "AUDIT.md"

pages = []
for f in sorted(PAGES_DIR.glob("*.json")):
    pages.append(json.loads(f.read_text()))

# ── Overall stats ──────────────────────────────────────────────────
total_pages = len(pages)
per_type_stats = defaultdict(lambda: {"built":0, "error":0, "unhandled":0, "decor":0})
per_page_stats = []

error_patterns = Counter()
unhandled_projections = defaultdict(Counter)  # type -> Counter of projection signatures

for p in pages:
    pstats = {"built":0, "error":0, "unhandled":0, "decor":0}
    err_samples = []
    for v in p["visuals"]:
        t = v["type"]
        if t in ("textbox", "shape", "basicShape", "image", "actionButton"):
            pstats["decor"] += 1
            per_type_stats[t]["decor"] += 1
            continue
        if "data" in v:
            pstats["built"] += 1
            per_type_stats[t]["built"] += 1
        elif "data_error" in v:
            pstats["error"] += 1
            per_type_stats[t]["error"] += 1
            err_samples.append((v.get("title") or "", v["data_error"][:120]))
            # Classify error
            msg = v["data_error"]
            if "Binder Error" in msg and "not found in FROM" in msg:
                error_patterns["Binder: alias-or-column not in FROM"] += 1
            elif "Binder Error" in msg and "does not have a column" in msg:
                error_patterns["Binder: missing column"] += 1
            elif "Invalid Input Error" in msg:
                error_patterns["Invalid input"] += 1
            elif "No function matches" in msg:
                error_patterns["Type/function mismatch"] += 1
            elif "Parser Error" in msg:
                error_patterns["Parser error"] += 1
            else:
                error_patterns[msg[:60]] += 1
        else:
            pstats["unhandled"] += 1
            per_type_stats[t]["unhandled"] += 1
            # Record projection signature
            proj = v.get("projections", {}) or {}
            sig = ";".join(
                f"{role}:[{','.join(sorted(refs or []))}]"
                for role, refs in sorted(proj.items()) if refs
            )
            unhandled_projections[t][sig] += 1

    per_page_stats.append({
        "slug": p["slug"],
        "name": p["display_name"],
        "category": p["category"],
        "stats": pstats,
        "errors": err_samples,
    })

# Compute coverage %
def pct(s):
    db = s["built"] + s["error"] + s["unhandled"]
    return (s["built"] / db * 100) if db else 100.0

# ── Write markdown ─────────────────────────────────────────────────
md = ["# v2 App — Audit",
      "",
      f"Scan of all {total_pages} live pages. Breadth-first inventory of what renders, "
      "what errors, and what's still a placeholder.",
      "",
      "## Overall coverage",
      ""]

built     = sum(s["built"]     for _,s in [(p["slug"],p["stats"]) for p in per_page_stats])
errored   = sum(s["error"]     for _,s in [(p["slug"],p["stats"]) for p in per_page_stats])
unhandled = sum(s["unhandled"] for _,s in [(p["slug"],p["stats"]) for p in per_page_stats])
decor     = sum(s["decor"]     for _,s in [(p["slug"],p["stats"]) for p in per_page_stats])
data_bound = built + errored + unhandled
md += [
    f"- **Pages**: {total_pages}",
    f"- **Total visuals**: {built + errored + unhandled + decor}",
    f"- **Data-bound visuals**: {data_bound}",
    f"- **Built (rendering with data)**: {built}  ({built/data_bound*100:.1f}%)",
    f"- **Errored (attempted SQL failed)**: {errored}  ({errored/data_bound*100:.1f}%)",
    f"- **Unhandled (no recipe yet)**: {unhandled}  ({unhandled/data_bound*100:.1f}%)",
    f"- **Decorative (textbox/shape/image/button)**: {decor}",
    "",
    "## Coverage by visual type",
    "",
    "| Type | Built | Errored | Unhandled | Total DB | Coverage |",
    "|---|---:|---:|---:|---:|---:|",
]
for t, s in sorted(per_type_stats.items(),
                    key=lambda kv: -(kv[1]["built"]+kv[1]["error"]+kv[1]["unhandled"])):
    if t in ("textbox", "shape", "basicShape", "image", "actionButton"):
        continue
    db = s["built"] + s["error"] + s["unhandled"]
    if db == 0: continue
    md.append(f"| `{t}` | {s['built']} | {s['error']} | {s['unhandled']} | {db} | {s['built']/db*100:.0f}% |")

# ── Per-page table ─────────────────────────────────────────────────
md += ["",
       "## Per-page rundown",
       "",
       "Sorted by category then by coverage% ascending (lowest-coverage first within each category).",
       "",
       "| Slug | Page | Category | Visuals | Built | Err | Unh | Coverage |",
       "|---|---|---|---:|---:|---:|---:|---:|"]

sorted_pages = sorted(per_page_stats,
                      key=lambda p: (p["category"], pct(p["stats"]), p["name"]))
for p in sorted_pages:
    s = p["stats"]
    db = s["built"] + s["error"] + s["unhandled"]
    cov = f"{pct(s):.0f}%"  if db else "—"
    md.append(f"| [`{p['slug']}`](http://127.0.0.1:8734/#/{p['slug']}) | {p['name']} | {p['category']} | {s['built']+s['error']+s['unhandled']+s['decor']} | {s['built']} | {s['error']} | {s['unhandled']} | {cov} |")

# ── Pattern analysis ───────────────────────────────────────────────
md += ["", "## Error patterns", ""]
if error_patterns:
    md.append("| Pattern | Count |")
    md.append("|---|---:|")
    for pat, n in error_patterns.most_common():
        md.append(f"| {pat} | {n} |")
else:
    md.append("*(no errors)*")

md += ["", "## Unhandled visual patterns", ""]
md.append("Most common projection signatures we don't have recipes for:")
md.append("")
for t in sorted(unhandled_projections, key=lambda k: -sum(unhandled_projections[k].values())):
    total_t = sum(unhandled_projections[t].values())
    md.append(f"\n### `{t}` — {total_t} unhandled")
    md.append("")
    for sig, n in unhandled_projections[t].most_common(5):
        md.append(f"- ×{n}:  `{sig[:200]}`")

# ── Prioritized fix list ───────────────────────────────────────────
md += ["", "## Prioritized fix list", "",
       "Ordered by impact (# of visuals affected × estimated ease).", ""]

fixes = []
# 1. Missing measures
missing_measures = set()
for p in pages:
    for v in p["visuals"]:
        if "data_error" not in v: continue
        err = v["data_error"]
        if "does not have a column named" in err:
            m = re.search(r"does not have a column named \"([^\"]+)\"", err)
            if m: missing_measures.add(m.group(1))
if missing_measures:
    fixes.append((len(missing_measures)*3,
                  f"Add MEASURE_SQL entries for {len(missing_measures)} missing DAX measures/columns: " +
                  ", ".join(f"`{m}`" for m in sorted(missing_measures)[:15])))

# 2. Filter-flow (slicers don't filter)
fixes.append((100, "Wire slicer selection → page-level visual filters (5G). "
                    "Currently selections are local state; PBIX expects them to re-filter charts. "
                    "Affects every page with a slicer — perceived correctness of many numbers depends on this."))

# 3. PBIX visual-config filters (e.g. NAME=AMAX on NPDES Permit Limits)
fixes.append((50, "Parse visual-level `visual_filters` with richer conditions: currently "
                   "we only handle `IN`, `NOT IN`, `CONTAINS`. Some visuals rely on equality, date-range, "
                   "and `Top N` filters — examples include the NPDES Permit Limits table's `NAME = 'AMAX'` filter."))

# 4. Relative-date slicers
date_slicers = 0
for p in pages:
    for v in p["visuals"]:
        if v["type"] != "slicer": continue
        for r in (v.get("projections") or {}).get("Values") or []:
            if "DATESTAMP" in r or "Date" in r:
                date_slicers += 1
fixes.append((date_slicers, f"Detect + render relative-date slicers ({date_slicers} date-field slicers currently show as "
                              "500-option dropdowns; PBIX shows them as relative-date pickers)."))

# 5. Rolling measures (approximate → exact)
fixes.append((10, "Implement true windowed aggregations for rolling measures "
                   "(`Rolling 3 Months Minimum`, `… max per DATESTAMP`, `Rolling 30 day Average`). "
                   "Current approximations match shape but not exact numbers."))

# 6. Conditional formatting
fixes.append((30, "Conditional color formatting on table cells (green/yellow/red) — PBIX defines these "
                   "in the visual config's `dataBars` / `backColor` objects. Need to parse and apply."))

# 7. Pivot table
fixes.append((31, "Proper pivotTable rendering (currently degrades to flat table). "
                   "31 visuals affected."))

# 8. Combo chart remaining errors
fixes.append((12, "Fix 12 `lineClusteredColumnComboChart` SQL errors (likely same family of issues). "
                   "Combo charts appear on most permit-eval and DMR pages."))

# 9. Multi-entity table edge cases
fixes.append((5, "3 remaining unhandled tableEx are multi-entity but across 3+ entities "
                  "(not covered by our 2-way join logic). Worth revisiting after core filter wiring."))

# Sort by estimated impact (loosely)
fixes.sort(key=lambda x: -x[0])

md.append("| # | Fix | Estimated impact (visuals touched) |")
md.append("|---:|---|---|")
for i, (impact, desc) in enumerate(fixes, 1):
    md.append(f"| {i} | {desc} | {impact} |")

md += ["",
       "## What to click through manually",
       "",
       "High-traffic pages worth eyeballing first:",
       "",
       "- [Home](http://127.0.0.1:8734/#/home) — navigation hub",
       "- [Ef Flow Permit Eval](http://127.0.0.1:8734/#/ef-flow-permit-eval) — summary page",
       "- [Permit Evaluation, AAF](http://127.0.0.1:8734/#/permit-evaluation-aaf)",
       "- [Permit Evaluation, 75/90 Rule](http://127.0.0.1:8734/#/permit-evaluation-7590)",
       "- [DT Daily Effluent Flow](http://127.0.0.1:8734/#/dt-daily-effluent-flow) — main chart page",
       "- [Multi-Var 4x4 (Daily 1)](http://127.0.0.1:8734/#/multi-var-4x4-daily-1) — 23-chart grid",
       "- [DT (DMR 5yr) Ef Flow MGD](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-flow-mgd) — historical",
       ""]

OUT.write_text("\n".join(md))
print(f"Wrote {OUT} ({OUT.stat().st_size/1024:.1f} KB)")

# Also print top-line summary to console
print()
print(f"Coverage: {built}/{data_bound}  ({built/data_bound*100:.1f}%)")
print(f"Errored: {errored}, Unhandled: {unhandled}")
print()
print("Top 10 lowest-coverage pages:")
for p in sorted_pages[:10]:
    s = p["stats"]
    db = s["built"] + s["error"] + s["unhandled"]
    if db == 0: continue
    print(f"  {p['slug']:48s} built={s['built']:2d}/{db:2d} ({pct(s):.0f}%)")
