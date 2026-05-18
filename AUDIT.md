# v2 App — Audit

Scan of all 58 live pages. Breadth-first inventory of what renders, what errors, and what's still a placeholder.

## Overall coverage

- **Pages**: 58
- **Total visuals**: 562
- **Data-bound visuals**: 409
- **Built (rendering with data)**: 397  (97.1%)
- **Errored (attempted SQL failed)**: 0  (0.0%)
- **Unhandled (no recipe yet)**: 12  (2.9%)
- **Decorative (textbox/shape/image/button)**: 153

## Coverage by visual type

| Type | Built | Errored | Unhandled | Total DB | Coverage |
|---|---:|---:|---:|---:|---:|
| `slicer` | 166 | 0 | 5 | 171 | 97% |
| `areaChart` | 75 | 0 | 0 | 75 | 100% |
| `lineClusteredColumnComboChart` | 50 | 0 | 0 | 50 | 100% |
| `pivotTable` | 29 | 0 | 2 | 31 | 94% |
| `tableEx` | 25 | 0 | 1 | 26 | 96% |
| `clusteredColumnChart` | 25 | 0 | 0 | 25 | 100% |
| `card` | 20 | 0 | 4 | 24 | 83% |
| `columnChart` | 3 | 0 | 0 | 3 | 100% |
| `lineStackedColumnComboChart` | 3 | 0 | 0 | 3 | 100% |
| `hundredPercentStackedColumnChart` | 1 | 0 | 0 | 1 | 100% |

## Per-page rundown

Sorted by category then by coverage% ascending (lowest-coverage first within each category).

| Slug | Page | Category | Visuals | Built | Err | Unh | Coverage |
|---|---|---|---:|---:|---:|---:|---:|
| [`aeration-daily-report`](http://127.0.0.1:8734/#/aeration-daily-report) | AERATION Daily Report | daily-reports | 6 | 3 | 0 | 1 | 75% |
| [`infeff-daily-report`](http://127.0.0.1:8734/#/infeff-daily-report) | INF/EFF Daily Report | daily-reports | 7 | 4 | 0 | 1 | 80% |
| [`explore-data-availability-in-hachwims`](http://127.0.0.1:8734/#/explore-data-availability-in-hachwims) | Explore Data Availability in HachWIMS | data-tools | 7 | 3 | 0 | 2 | 60% |
| [`dt-chart-plant-if-daily`](http://127.0.0.1:8734/#/dt-chart-plant-if-daily) | DT Chart) Plant If Daily | data-tools | 19 | 12 | 0 | 5 | 71% |
| [`om-report`](http://127.0.0.1:8734/#/om-report) | O&M Report | data-tools | 12 | 3 | 0 | 1 | 75% |
| [`dt-chart-plant-ef-daily`](http://127.0.0.1:8734/#/dt-chart-plant-ef-daily) | DT (Chart) Plant Ef Daily | data-tools | 6 | 5 | 0 | 0 | 100% |
| [`dt-daily-effluent-flow`](http://127.0.0.1:8734/#/dt-daily-effluent-flow) | DT Daily Effluent Flow | data-tools | 7 | 6 | 0 | 0 | 100% |
| [`plant-efficiency-process-evaluation`](http://127.0.0.1:8734/#/plant-efficiency-process-evaluation) | Plant Efficiency Process Evaluation | data-tools | 23 | 21 | 0 | 0 | 100% |
| [`dmr-5yr-ecoli`](http://127.0.0.1:8734/#/dmr-5yr-ecoli) | (DMR 5yr) E.Coli | historical | 6 | 5 | 0 | 0 | 100% |
| [`dmr-5yr-ef-cbod-loading`](http://127.0.0.1:8734/#/dmr-5yr-ef-cbod-loading) | (DMR 5yr) Ef CBOD Loading | historical | 6 | 5 | 0 | 0 | 100% |
| [`dmr-5yr-ef-cl2-residual-loading`](http://127.0.0.1:8734/#/dmr-5yr-ef-cl2-residual-loading) | (DMR 5yr) Ef CL2 Residual Loading | historical | 6 | 5 | 0 | 0 | 100% |
| [`dmr-5yr-ef-do-loading`](http://127.0.0.1:8734/#/dmr-5yr-ef-do-loading) | (DMR 5yr) Ef D.O. Loading | historical | 6 | 5 | 0 | 0 | 100% |
| [`dmr-5yr-ef-nh3-n-loading`](http://127.0.0.1:8734/#/dmr-5yr-ef-nh3-n-loading) | (DMR 5yr) Ef NH3-N Loading | historical | 6 | 5 | 0 | 0 | 100% |
| [`dmr-5yr-ef-tss-loading`](http://127.0.0.1:8734/#/dmr-5yr-ef-tss-loading) | (DMR 5yr) Ef TSS Loading | historical | 6 | 5 | 0 | 0 | 100% |
| [`dmr-5yr-ph-field`](http://127.0.0.1:8734/#/dmr-5yr-ph-field) | (DMR 5yr) Ph Field | historical | 6 | 5 | 0 | 0 | 100% |
| [`dt-dmr-5yr-ef-cbod`](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-cbod) | DT (DMR 5yr) Ef CBOD | historical | 6 | 5 | 0 | 0 | 100% |
| [`dt-dmr-5yr-ef-flow-mgd`](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-flow-mgd) | DT (DMR 5yr) Ef Flow MGD | historical | 6 | 5 | 0 | 0 | 100% |
| [`dt-dmr-5yr-ef-nh3-n`](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-nh3-n) | DT (DMR 5yr) Ef NH3-N | historical | 6 | 5 | 0 | 0 | 100% |
| [`dt-dmr-5yr-ef-tss`](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-tss) | DT (DMR 5yr) Ef TSS | historical | 6 | 5 | 0 | 0 | 100% |
| [`home`](http://127.0.0.1:8734/#/home) | Home | home | 49 | 2 | 0 | 0 | 100% |
| [`cbod-if-vs-ef`](http://127.0.0.1:8734/#/cbod-if-vs-ef) | CBOD (If Vs Ef) | influent-effluent | 7 | 6 | 0 | 0 | 100% |
| [`if-rem-ef-cbod-tss-nh3-n`](http://127.0.0.1:8734/#/if-rem-ef-cbod-tss-nh3-n) | If, %Rem, ef CBOD, TSS & NH3-N | influent-effluent | 16 | 14 | 0 | 0 | 100% |
| [`nh3-n-if-vs-ef`](http://127.0.0.1:8734/#/nh3-n-if-vs-ef) | NH3-N (If Vs Ef) | influent-effluent | 7 | 6 | 0 | 0 | 100% |
| [`tss-if-vs-ef`](http://127.0.0.1:8734/#/tss-if-vs-ef) | TSS (If Vs Ef) | influent-effluent | 7 | 6 | 0 | 0 | 100% |
| [`chart-plant-other-daily`](http://127.0.0.1:8734/#/chart-plant-other-daily) | (Chart) Plant Other Daily | other | 7 | 4 | 0 | 1 | 80% |
| [`charts-plant-ef-daily-wolimits`](http://127.0.0.1:8734/#/charts-plant-ef-daily-wolimits) | (Charts) Plant Ef Daily woLIMITS | other | 7 | 4 | 0 | 1 | 80% |
| [`adf-2hrpeak-to-download`](http://127.0.0.1:8734/#/adf-2hrpeak-to-download) | ADF_2HrPeak_to_Download | other | 7 | 6 | 0 | 0 | 100% |
| [`dig-01`](http://127.0.0.1:8734/#/dig-01) | DIG 01 | other | 9 | 7 | 0 | 0 | 100% |
| [`daily-rem-cbod-tss-nh3-n`](http://127.0.0.1:8734/#/daily-rem-cbod-tss-nh3-n) | Daily %Rem CBOD, TSS & NH3-N | other | 7 | 5 | 0 | 0 | 100% |
| [`hist-mo-ef-flow-mgd`](http://127.0.0.1:8734/#/hist-mo-ef-flow-mgd) | Hist Mo Ef Flow MGD | other | 5 | 4 | 0 | 0 | 100% |
| [`mo-eff-load-cbod-tss-nh3-n`](http://127.0.0.1:8734/#/mo-eff-load-cbod-tss-nh3-n) | Mo Eff Load CBOD, TSS & NH3-N | other | 7 | 5 | 0 | 0 | 100% |
| [`statistical-flows`](http://127.0.0.1:8734/#/statistical-flows) | Statistical Flows | other | 14 | 12 | 0 | 0 | 100% |
| [`violations`](http://127.0.0.1:8734/#/violations) | Violations | other | 7 | 6 | 0 | 0 | 100% |
| [`dmr-monthlyaaf-for-permit-evaluation`](http://127.0.0.1:8734/#/dmr-monthlyaaf-for-permit-evaluation) | (DMR) MonthlyAAF (For Permit Evaluation) | permit | 7 | 5 | 0 | 0 | 100% |
| [`dmr-monthlyadf-for-7590-rules`](http://127.0.0.1:8734/#/dmr-monthlyadf-for-7590-rules) | (DMR) MonthlyADF (For 75/90 Rules) | permit | 5 | 3 | 0 | 0 | 100% |
| [`tables-permitted-capacity-evaluation-pbi`](http://127.0.0.1:8734/#/tables-permitted-capacity-evaluation-pbi) | (Tables) Permitted Capacity Evaluation PBI | permit | 14 | 5 | 0 | 0 | 100% |
| [`ef-flow-aaf-maf`](http://127.0.0.1:8734/#/ef-flow-aaf-maf) | Ef Flow (AAF & MAF) | permit | 5 | 4 | 0 | 0 | 100% |
| [`ef-flow-permit-eval`](http://127.0.0.1:8734/#/ef-flow-permit-eval) | Ef Flow Permit Eval | permit | 6 | 2 | 0 | 0 | 100% |
| [`permit-evaluation-7590`](http://127.0.0.1:8734/#/permit-evaluation-7590) | Permit Evaluation 75/90 | permit | 7 | 5 | 0 | 0 | 100% |
| [`permit-evaluation-aaf`](http://127.0.0.1:8734/#/permit-evaluation-aaf) | Permit Evaluation AAF | permit | 7 | 6 | 0 | 0 | 100% |
| [`permit-limits`](http://127.0.0.1:8734/#/permit-limits) | Permit Limits | permit | 7 | 6 | 0 | 0 | 100% |
| [`permitted-aaf-vs-dmr`](http://127.0.0.1:8734/#/permitted-aaf-vs-dmr) | Permitted AAF Vs DMR | permit | 8 | 6 | 0 | 0 | 100% |
| [`chemical-used`](http://127.0.0.1:8734/#/chemical-used) | Chemical Used | process | 8 | 6 | 0 | 0 | 100% |
| [`clarifier`](http://127.0.0.1:8734/#/clarifier) | Clarifier | process | 9 | 7 | 0 | 0 | 100% |
| [`elec`](http://127.0.0.1:8734/#/elec) | ELEC | process | 9 | 7 | 0 | 0 | 100% |
| [`ras-01`](http://127.0.0.1:8734/#/ras-01) | RAS 01 | process | 10 | 8 | 0 | 0 | 100% |
| [`s-aeration`](http://127.0.0.1:8734/#/s-aeration) | S Aeration | process | 10 | 8 | 0 | 0 | 100% |
| [`svi`](http://127.0.0.1:8734/#/svi) | SVI | process | 8 | 6 | 0 | 0 | 100% |
| [`thck`](http://127.0.0.1:8734/#/thck) | Thck | process | 8 | 6 | 0 | 0 | 100% |
| [`was-01`](http://127.0.0.1:8734/#/was-01) | WAS 01 | process | 9 | 7 | 0 | 0 | 100% |
| [`multi-var-4x4-daily-1`](http://127.0.0.1:8734/#/multi-var-4x4-daily-1) | Multi-Var 4x4 (Daily 1) | regulatory-kpi | 23 | 21 | 0 | 0 | 100% |
| [`multi-var-operational-parameters`](http://127.0.0.1:8734/#/multi-var-operational-parameters) | Multi-Var Operational Parameters | regulatory-kpi | 23 | 21 | 0 | 0 | 100% |
| [`regulatory-kpi-33`](http://127.0.0.1:8734/#/regulatory-kpi-33) | Regulatory KPI (3/3) | regulatory-kpi | 23 | 21 | 0 | 0 | 100% |
| [`regulatory-parameters-1-3x3`](http://127.0.0.1:8734/#/regulatory-parameters-1-3x3) | Regulatory Parameters (1)  3x3 | regulatory-kpi | 16 | 14 | 0 | 0 | 100% |
| [`regulatory-parameters-2-3x3`](http://127.0.0.1:8734/#/regulatory-parameters-2-3x3) | Regulatory Parameters (2)  3x3 | regulatory-kpi | 16 | 14 | 0 | 0 | 100% |
| [`northside-wwf`](http://127.0.0.1:8734/#/northside-wwf) | Northside WWF | wwtp-specific | 7 | 5 | 0 | 0 | 100% |
| [`scott-wwf`](http://127.0.0.1:8734/#/scott-wwf) | Scott WWF | wwtp-specific | 7 | 5 | 0 | 0 | 100% |
| [`wwtp-optimization`](http://127.0.0.1:8734/#/wwtp-optimization) | WWTP Optimization | wwtp-specific | 1 | 0 | 0 | 0 | — |

## Error patterns

*(no errors)*

## Unhandled visual patterns

Most common projection signatures we don't have recipes for:


### `slicer` — 5 unhandled

- ×3:  `Values:[VARDESC.S. Name 2]`
- ×1:  `Values:[VARDESC.S. NAME]`
- ×1:  `Values:[fr_If/Ef by WWTP.DATESTAMP]`

### `card` — 4 unhandled

- ×4:  `Values:[DATATBL.STDEV.S]`

### `pivotTable` — 2 unhandled

- ×2:  `Columns:[VARDESC.S. Name 2,VARDESC.STORETCODE,VARDESC.UNITS,VARDESC.VARNUM];Rows:[DATATBL.Date];Values:[CountNonNull(DATATBL.CURVALUE)]`

### `tableEx` — 1 unhandled

- ×1:  `Values:[LIMITS.DESCRIPTION,LIMITS.ENDDATE,LIMITS.NAME,Sum(LIMITS.LIMIT_VALUE),VARDESC.S. Name 2,VARDESC.S. Name 2 (groups)]`

## Prioritized fix list

Ordered by impact (# of visuals affected × estimated ease).

| # | Fix | Estimated impact (visuals touched) |
|---:|---|---|
| 1 | Wire slicer selection → page-level visual filters (5G). Currently selections are local state; PBIX expects them to re-filter charts. Affects every page with a slicer — perceived correctness of many numbers depends on this. | 100 |
| 2 | Detect + render relative-date slicers (80 date-field slicers currently show as 500-option dropdowns; PBIX shows them as relative-date pickers). | 80 |
| 3 | Parse visual-level `visual_filters` with richer conditions: currently we only handle `IN`, `NOT IN`, `CONTAINS`. Some visuals rely on equality, date-range, and `Top N` filters — examples include the NPDES Permit Limits table's `NAME = 'AMAX'` filter. | 50 |
| 4 | Proper pivotTable rendering (currently degrades to flat table). 31 visuals affected. | 31 |
| 5 | Conditional color formatting on table cells (green/yellow/red) — PBIX defines these in the visual config's `dataBars` / `backColor` objects. Need to parse and apply. | 30 |
| 6 | Fix 12 `lineClusteredColumnComboChart` SQL errors (likely same family of issues). Combo charts appear on most permit-eval and DMR pages. | 12 |
| 7 | Implement true windowed aggregations for rolling measures (`Rolling 3 Months Minimum`, `… max per DATESTAMP`, `Rolling 30 day Average`). Current approximations match shape but not exact numbers. | 10 |
| 8 | 3 remaining unhandled tableEx are multi-entity but across 3+ entities (not covered by our 2-way join logic). Worth revisiting after core filter wiring. | 5 |

## What to click through manually

High-traffic pages worth eyeballing first:

- [Home](http://127.0.0.1:8734/#/home) — navigation hub
- [Ef Flow Permit Eval](http://127.0.0.1:8734/#/ef-flow-permit-eval) — summary page
- [Permit Evaluation, AAF](http://127.0.0.1:8734/#/permit-evaluation-aaf)
- [Permit Evaluation, 75/90 Rule](http://127.0.0.1:8734/#/permit-evaluation-7590)
- [DT Daily Effluent Flow](http://127.0.0.1:8734/#/dt-daily-effluent-flow) — main chart page
- [Multi-Var 4x4 (Daily 1)](http://127.0.0.1:8734/#/multi-var-4x4-daily-1) — 23-chart grid
- [DT (DMR 5yr) Ef Flow MGD](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-flow-mgd) — historical
