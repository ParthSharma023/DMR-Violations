# Power BI Report Reconstruction Context

## Project Goal
Rebuild the attached Power BI report as a standalone static HTML web dashboard.
No build step — file:// compatible, Chart.js 4.4.0 via CDN, dark theme.

## Source Files Available
- `pbi-data-model-complete.md` — **PRIMARY REFERENCE**: all verbatim DAX, M code, schema, relationships from live AS instance
- `schema.csv` — All table names and column data types (inferred; see pbi-data-model-complete.md for verbatim)
- `measures.csv` — All DAX measures with verbatim expressions (updated 2026-05-14)
- `relationships.csv` — Entity relationships (see also pbi-data-model-complete.md for verbatim)
- `layout.json` — Full visual layout: pages, visual types, positions, field bindings
- `visual_inventory.json` — All 104 pages, 1,073 visuals with px coords and fields; 13 priority pages flagged
- `data_model.md` — Mermaid ERD and table descriptions
- `styles.css` — Official dark theme style guide (canonical, use exactly)
- `mockData.js` — `window.MOCK` and `window.MEASURES` globals for all pages
- `components.js` — `window.Components` reusable chart/KPI/table/slicer renderers
- `lib/measures.ts` — TypeScript translations of all DAX measures (updated)

## Completed Pages (in pages/)
- `permitted-aaf-vs-dmr.html` — Permitted AAF vs. DMR Reported Flow
- `statistical-flows.html` — Flow Statistics (percentiles, averages, std dev)
- `adf-2hr-peak.html` — Effluent Flow — ADF & 2-Hour Peak
- `ef-flow-aaf-maf.html` — Comparison of Permit Evaluation — AAF & MAF

## Priority Pages Still Needed
From visual_inventory.json priority pages:
1. Permit Evaluation Summary Tables (At-a-Glance)
2. Citywide WWTP Capacity Status
3. Permit Evaluation, Annual Average Flow
4. Permit Evaluation, 75/90 Rule

---

## CRITICAL DATA MODEL CORRECTIONS (2026-05-14, verbatim from AS)

### Primary Parameter Values (REAL)
`DATATBL[Primary Parameter]` = **"Flow"** (NOT "Effluent Flow")
- All flow measurements → `Primary Parameter = "Flow"`
- mockData.js uses "Effluent Flow" — this is mock-only, acceptable for demo

### Color Format for Flow = Permitted AAF
`DATATBL[Color Format for Flow]` is a calculated column:
```dax
= CALCULATE(
    SELECTEDVALUE('Monthly Flow Permit'[LIMIT_VALUE]),
    FILTER('Monthly Flow Permit', 'Monthly Flow Permit'[WWTP] = DATATBL[WWTP])
)
```
= The **permitted Annual Average Flow (MGD)** for the row's WWTP.

### Color Formatting Number (1-4 severity)
```dax
1 = green  (CURVALUE < 0.75 × Color Format for Flow)
2 = yellow (0.75 ≤ CURVALUE < 0.90 × Color Format for Flow)
3 = orange (0.90 ≤ CURVALUE ≤ Color Format for Flow)
4 = red    (CURVALUE > Color Format for Flow — VIOLATION)
```

### Violation Logic
```dax
DATATBL[Violation] = 1 when:
  DATATBL[Limit] < DATATBL[CURVALUE]
  AND NOT ISBLANK(DATATBL[Limit])
  AND DATATBL[Compare] = ">"
```

### 75/90 Rule KPI
`[Rolling 3 Months Minimum max per DATESTAMP divided by Color Format for Flow]`
= The key compliance KPI. See verbatim DAX in measures.csv and pbi-data-model-complete.md.

### VARDESC Field Mappings
- `VARDESC[WWTP]` = `UD3` (WWTP name)
- `VARDESC[S. NAME]` = `SHORTNAME`
- `VARDESC[S. Name 2]` = text after first space in `VARDESC[NAME]`

### S. Name 2 Values for Flow
| S. Name 2 | Category |
|-----------|----------|
| `Plnt Ef Flow MGD` | Daily effluent flow (MGD) |
| `Plnt Ef FLOW Month Avg` | Monthly average flow (MGD) |
| `Plnt Ef FLOW Annual Avg` | Annual average flow (MGD) |
| `Plnt Ef 2Hr Peak Flow GPM` | 2-hour peak flow (GPM) |
| `Plnt Ef 2Hr Peak Field` | 2-hour peak flow field measurement (MGD) |

### Monthly Flow Permit Table
One row per WWTP. `LIMIT_VALUE` = permitted AAF (MGD). Special case: Northbelt = 6 MGD (override).

---

## Data Model Summary

### Core Tables
| Table | Role |
|-------|------|
| DATATBL | Fact: daily/monthly HachWIMS readings (DATESTAMP, CURVALUE, VARID, STATUS) |
| VARDESC | Dim: parameter definitions per location (NAME, S. NAME, S. Name 2, WWTP=UD3, VARID, LOCID) |
| LIMITS | Permit limits (VARID, NAME, DESCRIPTION, STARTDATE, ENDDATE, COMPARE, LIMIT_VALUE, GROUPING) |
| LOCATION | WWTP physical info (LOCID, LOCATION, DESCRIPTION, PERMITNUMBER, etc.) |
| Monthly Flow Permit | One row per WWTP: WWTP, LIMIT_VALUE (permitted AAF MGD) |
| Effluent Flow Limits | LIMITS expanded to daily rows (All Dates col), merged with parameter names |
| FlowPermits_AMAX | LIMITS where NAME=AMAX or MMAX, ENDDATE=2030-12-31 |

### Key Relationships
```
DATATBL[VARID]              → VARDESC[VARID]     M:1  Single  Active
VARDESC[LOCID]              → LOCATION[LOCID]    M:1  Both    Active
LIMITS[VARID]               → DATATBL[VARID]     M:M  Single  Active
Effluent Flow Limits[VARID] → VARDESC[VARID]     M:1  Single  Inactive
```

---

## mockData.js API
```javascript
// Globals: window.MOCK, window.MEASURES
MOCK.WWTPS        // Array of {name, permitAAF} for 6 WWTPs
MOCK.DATATBL      // Array of DataTblRow (3+ years × 6 WWTPs × 4 params)
MEASURES.filter(data, {wwtp, startDate, endDate})
MEASURES.maxCurval(filteredData)       // Max AAF equivalent
MEASURES.avgCalc(filteredData)         // AVERAGEX
MEASURES.maxAAFPercent(filteredData)   // Measure Max AAF%
MEASURES.stdevS(filteredData)          // STDEV.S
MEASURES.percentile(filteredData, p)   // PERCENTILE.INC
MEASURES.rolling3MonthMin(data, asOf)  // Rolling 3 Months Minimum
MEASURES.monthlyFlow(filteredData)     // [{label, avg, p75, p90}]
MEASURES.byWWTP(data, {startDate, endDate})
```

## components.js API
```javascript
Components.renderKPICard(el, {label, value, unit, accentClass, subtext})
Components.renderComboChart(canvas, {labels, barDatasets, lineDatasets, yLabel, title})
Components.renderLineChart(canvas, {labels, datasets, yLabel, title})
Components.renderDataTable(el, {columns, rows, maxHeight})
Components.renderPivotTable(el, {data, rowField, colField, valueField, colValues})
Components.renderSlicer(el, {label, options, value, onChange})
Components.renderDateSlicer(el, {label, startDate, endDate, onChange})
Components.makeTopBar(el, {title, subtitle})
Components.applyChartDefaults()        // Call once at page top
Components.initPageScale()             // Call at page bottom
Components.COLORS                      // {blue, teal, amber, orange, red, gold, purple}
Components.WWTP_COLORS                 // Array of 6 colors for per-WWTP charts
Components.severityPill(pctOfPermit)   // {label, color, className} for permit % cards
```

## Chart Library
Chart.js 4.4.0 via CDN (`https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`)

## Visual Type Mapping
| Power BI visualType | Use This Web Component |
|---|---|
| lineStackedColumnComboChart | Components.renderComboChart |
| lineClusteredColumnComboChart | Components.renderComboChart |
| lineChart | Components.renderLineChart |
| hundredPercentStackedColumnChart | Components.renderLineChart (stacked) |
| areaChart | Components.renderLineChart (fill:true) |
| tableEx | Components.renderDataTable |
| pivotTable | Components.renderPivotTable |
| card | Components.renderKPICard |
| slicer | Components.renderSlicer / renderDateSlicer |
| actionButton | `<a href>` nav button |

## Layout System
- PBI canvas: 1280×720px, absolute x/y/width/height positioning
- `.pbi-canvas { position:absolute; width:1280px; height:720px; }`
- `Components.initPageScale()` scales to viewport via `transform: scale()`
- body: `min-width: 1280px; overflow-x: auto`

## DAX Translation Rules
- `PERCENTILE.INC(col, p)` → `percentileInc(values, p)` linear interpolation
- `AVERAGEX('DATATBL', Average(DATATBL[CURVALUE]))` → `mean(data.map(r => r.CURVALUE))`
- `DIVIDE(a, b)` → `b !== 0 ? a / b : 0`
- `MAXX(table, expr)` → `Math.max(...table.map(expr))`
- `DATESINPERIOD(col, LASTDATE(col), -3, MONTH)` → filter last 3 calendar months
- `KEEPFILTERS(VALUES(col))` → unique dates, one calculation per date
- All measures: pure functions `(data: DataTblRow[], filters?: Filters) => number`

## Style Guide

The canonical stylesheet is `styles.css`. Match its aesthetic exactly.

### Color Tokens (CSS custom properties)
| Variable | Value | Use |
|---|---|---|
| `--bg` | `#0c1522` | Page background |
| `--bg-soft` | `#152235` | Slightly lighter bg |
| `--panel` | `#162436` | Card/panel surface |
| `--panel-2` | `#1b2a3d` | Nested panel surface |
| `--border` | `rgba(139,175,214,0.22)` | Subtle borders |
| `--text` | `#f1f5fb` | Primary text |
| `--muted` | `#b4c0d0` | Secondary/label text |
| `--low` | `#41b9a8` | Good / within limits (teal) |
| `--medium` | `#e6a52e` | Warning (amber) |
| `--high` | `#d46b2d` | High risk (orange) |
| `--critical` | `#cf4336` | Violation / critical (red) |
| `--shadow` | `0 18px 44px rgba(5,12,22,0.38)` | Card elevation |

### Typography
- Font family: `"Segoe UI", Arial, sans-serif`
- Page title: `34px`, weight `700`, `letter-spacing: -0.02em`
- Panel title: `18px`, weight `700`
- KPI label: `16px`, weight `700`
- KPI value: `36px`, weight `700`, `letter-spacing: -0.03em`
- Body/table: `14px`
- Small/caption: `13px`

### Background
```css
background:
  radial-gradient(circle at top right, rgba(56,92,138,0.28), transparent 30%),
  linear-gradient(180deg, #0c1522 0%, #122033 100%);
```

### Key Component Patterns
- **Panels / cards**: `border-radius: 16px`, `border: 1px solid var(--border)`, gradient background, `box-shadow: var(--shadow)`
- **KPI cards**: Left accent bar (6px wide) using `.accent-teal` / `.accent-orange` / `.accent-red` / `.accent-blue` / `.accent-gold`
- **Severity pills** (`.tier-pill`): Rounded `999px`, bold white text — teal gradient for low, amber for medium, orange for high, red for critical
- **Buttons**: `border-radius: 12px`, semi-transparent blue glass
- **Tables**: Alternating rows `rgba(21,35,52,0.88)` / `rgba(18,29,43,0.88)`; header `rgba(31,48,70,0.94)`
- **PBI canvas panels**: `border-bottom: 1px solid rgba(139,175,214,.15); border-right: 1px solid rgba(139,175,214,.1)`

### Severity Color Usage (Color Formatting Number)
- 1 / `--low` / `.tier-low` — < 75% of permit (green/teal)
- 2 / `--medium` / `.tier-medium` — 75–90% of permit (amber)
- 3 / `--high` / `.tier-high` — 90–100% of permit (orange)
- 4 / `--critical` / `.tier-critical` — > 100% permit violation (red)
