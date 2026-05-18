# PBI vs. Web App — Visual Comparison Audit

Conducted 2026-05-18 by comparing Power BI Desktop screenshots against the running v2 app.
**Do not auto-regenerate** — this is a manual audit, not a tool output.

---

## Issue list (priority order)

### 🔴 1 — Date slicers not wired → all aggregate numbers are wrong
**Affected**: Every page with a date slicer (majority of pages)

PBI defaults to **"Last 60 Months"** relative date on most pages, and **"Last 1"** (most recent month) on detail pages (Permit Evaluation AAF, 75/90). The web app renders date slicers as a ~500-item raw date dropdown that filters nothing. Every KPI card and chart is showing **all-time unfiltered aggregates** — fundamentally wrong vs. PBI.

Examples from screenshots:
- Permit Evaluation AAF → Beltway → PBI: **9.58 MGD, 72% of permit**
- 75/90 Rule → Almeda Sims → PBI: **15.79 MGD, 79%**

**Fix**: Detect date slicers in `aggregate.py`, precompute per-date-bucket data or wire a relative-date UI picker that filters via `state.js`.

---

### 🔴 2 — Default WWTP per page doesn't match PBI bookmarks
**Affected**: All per-plant detail pages

PBI bookmarks pre-select a specific WWTP per page. Web app defaults to first alphabetical plant. Confirmed from screenshots:

| Page | PBI Default WWTP |
|---|---|
| Permitted AAF vs DMR | Northbelt |
| Permit Evaluation AAF | Beltway |
| Permit Evaluation 75/90 | Almeda Sims |
| Flow Statistics | Chocolate Bayou |
| Citywide Capacity Status | (all — no WWTP filter) |

**Fix**: Add a `defaultPlant` field to each page spec in `build_pages.py`/page JS files and initialize state from it.

---

### 🔴 3 — Conditional formatting missing on all tables
**Affected**: All `tableEx` and `pivotTable` pages

PBI colors cells based on % of permit:
- Green: < 75% of permit
- Amber: 75–90%
- Orange: 90–100%
- Red: > 100% (violation)

Web app tables are entirely monochrome. Highly visible gap — the Permit Evaluation Summary Tables screenshot shows every row colored.

**Fix**: Parse `objects.dataBars`/`backColor` from PBIX visual config. Apply `backgroundColor` per cell in `DataTable` component based on value vs. threshold map.

---

### 🟡 4 — Bar color doesn't reflect severity (always teal, should be green/red)
**Affected**: `permit-evaluation-aaf.js`, `permit-evaluation-7590.js`, related pages

PBI uses **green bars** for normal flow and transitions to **red** when flow is near/over permit. The web app uses teal (`#27d7d7`) for all bars regardless of severity level. The 75/90 page shows entirely red bars in PBI for Almeda Sims (near-capacity plant).

**Fix**: Compute a per-bar color using `severityPill()` / color formatting number logic (1=teal, 2=amber, 3=orange, 4=red) and apply as `backgroundColor` array in Chart.js dataset.

---

### 🟡 5 — % of Permit KPI shows 1 decimal; PBI shows 0 decimals
**Affected**: KPI cards on Permit Evaluation pages

Web app: `(value*100).toFixed(1)%` → shows `72.0%`
PBI shows: `72%` (whole number)

**Fix**: Change `.toFixed(1)` to `.toFixed(0)` on percentage KPI cards.

---

### 🟡 6 — Reference lines should be constant horizontal rules, not data series
**Affected**: All combo charts (permit-evaluation-aaf, permit-evaluation-7590, permitted-aaf-vs-dmr, etc.)

PBI renders 100%/90%/75% permit thresholds as **constant horizontal lines** spanning the full x-axis — thin colored rules that don't vary with data. The web app implements these as `y2` line series with data points, which is correct in shape but can wobble if permit values change over time, and doesn't extend edge-to-edge the way PBI does.

**Fix**: Use Chart.js `annotations` plugin (or draw as `borderDash` constant annotation) rather than a data series. Or ensure the permit-limit series always has the same value at every x position.

---

### 🟡 7 — Data labels missing on bar charts
**Affected**: All combo/column/bar charts

Every bar in PBI has a value label printed on it (e.g., "9.58", "8.72"). Currently tracked as LOW in AUDIT.md, but looking at actual screenshots these labels are prominent — essential for reading exact values on the Citywide Capacity Status 100%-stacked chart where each segment shows its %.

**Fix**: Enable Chart.js `datalabels` plugin. Apply selectively — bars only, not line series. Format to 2 decimal places for MGD, 0 for %.

---

### 🟡 8 — Pivot tables degraded to flat tables (31 visuals)
**Affected**: Flow Statistics monthly table, INF/EFF Daily Report, (DMR) MonthlyAAF, (DMR) MonthlyADF, AERATION Daily Report, Scott WWF, Northside WWF, and more

PBI pivot tables use year as columns and month as rows. Web app renders as flat lists, losing the year×month cross-tab structure that makes them readable and comparable.

**Fix**: Generalize the `pivotTable` recipe to produce proper row/column pivots. The existing `renderPivotTable` component in `components.js` supports this — the recipe just needs to emit the right shape.

---

### 🟡 9 — Permit Evaluation AAF — permit limits tableEx unrendered
**Affected**: `permit-evaluation-aaf` page only

Top-right table (WWTP / Description / Permit Limit / Units) has no recipe — it's a 4-entity join across LIMITS + VARDESC that the current 2-way join logic doesn't cover.

**Fix**: Add a targeted `VISUAL_OVERRIDES` entry in `build_pages.py` with a hand-written SQL for this specific visual.

---

### 🟡 10 — Bookmark filters ignored on DMR historical pages
**Affected**: All DMR 5yr pages navigated from Home page buttons

PBI applies bookmark filters on navigation (e.g., Home → "DMR: Effluent CBOD" applies `VARDESC.S. NAME CONTAINS 'Ef CBOD Mo Avg'`). Web app ignores these, so DMR pages show all parameters unfiltered rather than the intended parameter.

**Fix**: Encode bookmark filter payloads in the page routes (URL params or `state.js`) and apply as initial `currentParam` filter on page load.

---

### 🟢 11 — Sort order on KPI cards is alphabetical, PBI is by value descending
**Affected**: Pages with multiple KPI cards (Statistical Flows, DT Chart Plant If Daily, etc.)

PBI sorts cards by measure value descending (highest flow first). Web app sorts alphabetically. The plant that appears in the "hero" card position differs.

**Fix**: Sort card data by value descending in the recipe before emitting.

---

### 🟢 12 — Citywide Capacity Status: explanatory note about excluded plants is missing
**Affected**: `ef-flow-permit-eval` page

PBI shows a text block: *"5 WWTPs (Forest Cove, Tidwell Timbers, MUD 75, West Lake Houston and Westway) are not included in this chart. They are evaluated based on 75/90 Rule."* Web app applies the exclusion via `VISUAL_OVERRIDES` but doesn't show this note.

**Fix**: Add a static text element below or above the chart on this page.

---

## Pages confirmed to match PBI well

- Overall dark theme palette — correct
- Layout structure (top bar with WWTP selector + KPI cards + date slicer) — correct
- Combo chart type for permit evaluation pages — correct
- 100%-stacked bar for Citywide Capacity Status — correct
- Navigation Home page buttons — correct targets

---

## Source screenshots

All reference screenshots in `docs/Screenshots/`:
- `Permitted AAF Vs DMR.png`
- `Permit Evaluation, Annual Average Flow.png`
- `At-a-Glance Citywide WWTP Capacity Status.png`
- `Permit Evaluation, 75-90 Rule.png`
- `Permit Evaluation Summary Tables.png`
- `Flow Statistics.png`
- `Effluent Flow - ADF and 2-hour Peak.png`
- `Comparison of Permit Evaluation, AAF & MAF.png`
