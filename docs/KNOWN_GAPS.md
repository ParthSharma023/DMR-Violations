# Known Gaps

Things the v2 app doesn't do (or does approximately) compared to the PBIX, with severity and fix effort. Run `python tools/audit_pages.py` to regenerate `AUDIT.md` for a live snapshot.

## Functional gaps

### 🟡 Rolling-window DAX measures — PARTIALLY VERIFIED

**What**: `Rolling 30 day Average`, `Rolling 12mo Avg`, and other time-windowed compositions that depend on exact PBIX date semantics.

**PBIX behavior**: Computes rolling windows per row using DAX time-intelligence.

**Our behavior**: We now precompute helper columns onto `DATATBL` in `build_data.py`, and the 75/90-rule pages use an exact trailing 3-month-row window that matches PBIX parity checks. The remaining risk is in other rolling measures where DuckDB window-frame semantics may still differ from DAX on period boundaries.

**Fix effort**: Medium. Any remaining drift needs targeted validation against PBIX on a measure-by-measure basis.

**Workaround**: For pages with screenshot-backed parity targets, validate the helper-column output directly before changing aggregator-wide behavior.

---

### 🔴 Date-range slicer — NOT WIRED

**What**: Slicers bound to `DATATBL.DATESTAMP`.

**PBIX behavior**: Relative date picker (e.g. "Last 60 Months"). Filters every visual on the page.

**Our behavior**: Renders as a dropdown of ~500 distinct dates. Selection is local only — doesn't filter anything.

**Affected visuals**: Most pages with a date slicer. Cards/charts always show "all time" aggregates.

**Fix effort**: Medium. Need to:
1. Detect date slicers in `aggregate_page()` similar to plant slicers.
2. Precompute per-date-bucket data OR live-filter in the browser (would need DuckDB-WASM or JSON filtering).
3. Add UI component for relative-date picker.
4. Wire to state alongside `currentPlant`.

**Workaround**: None — just accept the "all time" aggregate for now.

---

### 🔴 Conditional formatting — NOT IMPLEMENTED

**What**: PBIX tables color individual cells based on thresholds (green/yellow/red on % columns like "% of Permit Limit").

**Our behavior**: All cells same color.

**Fix effort**: Medium.
- Extract the `objects.dataBars` / `objects.backColor` config from `pages_dump.json` into the page spec.
- In `DataTable` component, apply `backgroundColor` per cell based on value + threshold map.

---

### 🟡 Multi-entity tables with 3+ entities — UNHANDLED

**What**: Tables whose columns span VARDESC + LIMITS + Effluent Flow Limits + VARDESC.UNITS (or similar 3-way+ joins).

**Our behavior**: Recipe returns `None`, placeholder renders.

**Affected visuals**: 3 unhandled tableEx visuals.

**Fix effort**: Medium. Generalize `_table` recipe to chain JOINs across arbitrary entity graphs.

---

### 🟡 Non-plant slicers — LOCAL STATE ONLY

**What**: Parameter slicers, violation-type slicers, etc.

**Our behavior**: Dropdown works, selection is local, doesn't filter other visuals.

**Fix effort**: Medium. Generalize the `currentPlant` pattern to a `filters: {field → value}` map, add per-field slicing in the aggregator.

---

### 🟡 Bookmark-applied filters — NOT APPLIED

**What**: Home-page buttons trigger bookmarks that often carry pre-applied filters (e.g. the DMR Ef CBOD button applies `VARDESC.S. NAME CONTAINS 'Ef CBOD Mo Avg'`).

**Our behavior**: Button navigates to the target page, but the bookmark's filters are ignored.

**Affected visuals**: Most DMR historical pages show data unfiltered, so e.g. the "DMR Ef CBOD" page shows all parameters instead of just CBOD.

**Fix effort**: Medium-high. Either:
- Precompute filtered slices per bookmark (similar to plant slicing). Large JSON bloat.
- Apply filters client-side via a filtered dataset — needs a query engine in the browser.
- Accept unfiltered display on historical pages as a known limitation.

---

### 🟡 Click-through cross-filtering — NOT IMPLEMENTED

**What**: Clicking a bar/row in one visual filters other visuals on the same page.

**Our behavior**: No interactivity beyond slicers.

**Fix effort**: Medium. Components would emit click events; global state would absorb and propagate. Combinatorial: filter set grows with interactions.

---

### 🟢 Drill-through popup mini-charts — NOT IMPLEMENTED

**What**: PBIX hover/right-click on a visual opens a drill-through page with detailed context (e.g. the "Citywide WWTP Capacity Status" chart's hover shows a plant's monthly flow history).

**Our behavior**: Hover shows a tooltip; no popup.

**Fix effort**: High. New navigation mode, overlay UI, per-hover data fetches.

**Priority**: Low — not heavily used, data is reachable via main navigation.

---

## Visual-type gaps

### 🟡 Combo chart errors (12)

**What**: `lineClusteredColumnComboChart` errors — mostly SQL failures on obscure projections.

**Fix effort**: Low. Spot-fix per error class. `python tools/audit_pages.py` lists the patterns.

### 🟡 Unhandled `clusteredColumnChart` (16)

**What**: All 16 reference the mystery `fr_If/Ef by WWTP` entity that `pbixray` didn't expose.

**Affected pages**: `regulatory-kpi-33`, `explore-data-availability-in-hachwims` (2 of 58).

**Fix effort**: Medium. Need to re-extract the PBIX DataModel with a different tool OR derive the `If/Ef by WWTP` table from DATATBL+VARDESC and add it to `build_data.py`.

---

## Per-page gaps (from VISUAL_OVERRIDES)

Cosmetic polish applied to specific charts. The list in `tools/build_pages.py > VISUAL_OVERRIDES` is the source of truth.

Currently applied:
- **Citywide WWTP Capacity Status** (`ef-flow-permit-eval`, 100%-stacked) — blue/gray colors, data labels, "Capacity Utilized/Remaining" series names, 5 small plants excluded.

Pending — pages I've looked at but haven't polished:
- **Permit Evaluation, AAF** (`permit-evaluation-aaf`) — cards work after filter-wiring; permit-limit table still unrendered (4-entity join); chart series names are raw measure refs.

---

## Data-quality gaps (not app bugs, but visible)

### Data-entry outliers in DATATBL

Some raw data has typos: CURVALUE=710 where it should be 7.10, etc. Visible on plants like Northeast, Sagemont.

**Not fixable in our app** — these are in the source CSVs.

**Impact**: Our approximate rolling-max measures clamp them to 100%. PBIX's true rolling-min-max smooths them.

---

## Severity legend

- 🔴 **Common / material**: affects many pages, visibly wrong numbers
- 🟡 **Moderate**: affects specific pages or makes some visuals incomplete
- 🟢 **Minor**: edge cases, rarely-used features, or low-visibility issues
