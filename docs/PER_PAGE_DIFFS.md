# Per-Page Diffs — v2 app vs. PBIX

Auto-generated gap list. Each page lists what PBIX expects but our app doesn't yet produce. Severity:
- 🔴 **HIGH** — visual doesn't render / shows wrong numbers
- 🟡 **MED** — renders but missing significant feature (cond. fmt, reference lines, advanced filters)
- 🟢 **LOW** — cosmetic (sort order, label precision, axis title)

Rebuild with: `python tools/per_page_diff.py`

## Summary

- **Pages**: 58
- **Total gaps**: 355
  - 🔴 HIGH:  39
  - 🟡 MED:   124
  - 🟢 LOW:   192

## Page list — sorted by gap severity (worst first)

| Slug | Display Name | 🔴 | 🟡 | 🟢 | Jump |
|---|---|---:|---:|---:|---|
| `regulatory-kpi-33` | Regulatory KPI (3/3) | 21 | 1 | 16 | [→](#regulatory-kpi-33) [open](http://127.0.0.1:8734/#/regulatory-kpi-33) |
| `dt-chart-plant-if-daily` | DT Chart) Plant If Daily | 5 | 1 | 8 | [→](#dt-chart-plant-if-daily) [open](http://127.0.0.1:8734/#/dt-chart-plant-if-daily) |
| `explore-data-availability-in-hachwims` | Explore Data Availability in HachWIMS | 2 | 1 | 2 | [→](#explore-data-availability-in-hachwims) [open](http://127.0.0.1:8734/#/explore-data-availability-in-hachwims) |
| `dt-daily-effluent-flow` | DT Daily Effluent Flow | 1 | 3 | 4 | [→](#dt-daily-effluent-flow) [open](http://127.0.0.1:8734/#/dt-daily-effluent-flow) |
| `adf-2hrpeak-to-download` | ADF_2HrPeak_to_Download | 1 | 3 | 4 | [→](#adf-2hrpeak-to-download) [open](http://127.0.0.1:8734/#/adf-2hrpeak-to-download) |
| `permit-evaluation-aaf` | Permit Evaluation AAF | 1 | 2 | 1 | [→](#permit-evaluation-aaf) [open](http://127.0.0.1:8734/#/permit-evaluation-aaf) |
| `om-report` | O&M Report | 1 | 2 | 1 | [→](#om-report) [open](http://127.0.0.1:8734/#/om-report) |
| `infeff-daily-report` | INF/EFF Daily Report | 1 | 2 | 1 | [→](#infeff-daily-report) [open](http://127.0.0.1:8734/#/infeff-daily-report) |
| `charts-plant-ef-daily-wolimits` | (Charts) Plant Ef Daily woLIMITS | 1 | 2 | 1 | [→](#charts-plant-ef-daily-wolimits) [open](http://127.0.0.1:8734/#/charts-plant-ef-daily-wolimits) |
| `aeration-daily-report` | AERATION Daily Report | 1 | 2 | 1 | [→](#aeration-daily-report) [open](http://127.0.0.1:8734/#/aeration-daily-report) |
| `statistical-flows` | Statistical Flows | 1 | 1 | 7 | [→](#statistical-flows) [open](http://127.0.0.1:8734/#/statistical-flows) |
| `dt-chart-plant-ef-daily` | DT (Chart) Plant Ef Daily | 1 | 1 | 1 | [→](#dt-chart-plant-ef-daily) [open](http://127.0.0.1:8734/#/dt-chart-plant-ef-daily) |
| `chart-plant-other-daily` | (Chart) Plant Other Daily | 1 | 1 | 1 | [→](#chart-plant-other-daily) [open](http://127.0.0.1:8734/#/chart-plant-other-daily) |
| `permit-limits` | Permit Limits | 1 | 0 | 0 | [→](#permit-limits) [open](http://127.0.0.1:8734/#/permit-limits) |
| `dt-dmr-5yr-ef-tss` | DT (DMR 5yr) Ef TSS | 0 | 5 | 2 | [→](#dt-dmr-5yr-ef-tss) [open](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-tss) |
| `dt-dmr-5yr-ef-nh3-n` | DT (DMR 5yr) Ef NH3-N | 0 | 5 | 2 | [→](#dt-dmr-5yr-ef-nh3-n) [open](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-nh3-n) |
| `dt-dmr-5yr-ef-flow-mgd` | DT (DMR 5yr) Ef Flow MGD | 0 | 5 | 2 | [→](#dt-dmr-5yr-ef-flow-mgd) [open](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-flow-mgd) |
| `dt-dmr-5yr-ef-cbod` | DT (DMR 5yr) Ef CBOD | 0 | 5 | 2 | [→](#dt-dmr-5yr-ef-cbod) [open](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-cbod) |
| `dmr-5yr-ph-field` | (DMR 5yr) Ph Field | 0 | 5 | 2 | [→](#dmr-5yr-ph-field) [open](http://127.0.0.1:8734/#/dmr-5yr-ph-field) |
| `dmr-5yr-ef-tss-loading` | (DMR 5yr) Ef TSS Loading | 0 | 5 | 2 | [→](#dmr-5yr-ef-tss-loading) [open](http://127.0.0.1:8734/#/dmr-5yr-ef-tss-loading) |
| `dmr-5yr-ef-nh3-n-loading` | (DMR 5yr) Ef NH3-N Loading | 0 | 5 | 2 | [→](#dmr-5yr-ef-nh3-n-loading) [open](http://127.0.0.1:8734/#/dmr-5yr-ef-nh3-n-loading) |
| `dmr-5yr-ef-do-loading` | (DMR 5yr) Ef D.O. Loading | 0 | 5 | 2 | [→](#dmr-5yr-ef-do-loading) [open](http://127.0.0.1:8734/#/dmr-5yr-ef-do-loading) |
| `dmr-5yr-ef-cl2-residual-loading` | (DMR 5yr) Ef CL2 Residual Loading | 0 | 5 | 2 | [→](#dmr-5yr-ef-cl2-residual-loading) [open](http://127.0.0.1:8734/#/dmr-5yr-ef-cl2-residual-loading) |
| `dmr-5yr-ef-cbod-loading` | (DMR 5yr) Ef CBOD Loading | 0 | 5 | 2 | [→](#dmr-5yr-ef-cbod-loading) [open](http://127.0.0.1:8734/#/dmr-5yr-ef-cbod-loading) |
| `dmr-5yr-ecoli` | (DMR 5yr) E.Coli | 0 | 5 | 2 | [→](#dmr-5yr-ecoli) [open](http://127.0.0.1:8734/#/dmr-5yr-ecoli) |
| `dmr-monthlyaaf-for-permit-evaluation` | (DMR) MonthlyAAF (For Permit Evaluation) | 0 | 5 | 0 | [→](#dmr-monthlyaaf-for-permit-evaluation) [open](http://127.0.0.1:8734/#/dmr-monthlyaaf-for-permit-evaluation) |
| `tables-permitted-capacity-evaluation-pbi` | (Tables) Permitted Capacity Evaluation PBI | 0 | 4 | 0 | [→](#tables-permitted-capacity-evaluation-pbi) [open](http://127.0.0.1:8734/#/tables-permitted-capacity-evaluation-pbi) |
| `hist-mo-ef-flow-mgd` | Hist Mo Ef Flow MGD | 0 | 3 | 2 | [→](#hist-mo-ef-flow-mgd) [open](http://127.0.0.1:8734/#/hist-mo-ef-flow-mgd) |
| `elec` | ELEC | 0 | 3 | 2 | [→](#elec) [open](http://127.0.0.1:8734/#/elec) |
| `ef-flow-aaf-maf` | Ef Flow (AAF & MAF) | 0 | 3 | 1 | [→](#ef-flow-aaf-maf) [open](http://127.0.0.1:8734/#/ef-flow-aaf-maf) |
| `dmr-monthlyadf-for-7590-rules` | (DMR) MonthlyADF (For 75/90 Rules) | 0 | 3 | 0 | [→](#dmr-monthlyadf-for-7590-rules) [open](http://127.0.0.1:8734/#/dmr-monthlyadf-for-7590-rules) |
| `plant-efficiency-process-evaluation` | Plant Efficiency Process Evaluation | 0 | 1 | 16 | [→](#plant-efficiency-process-evaluation) [open](http://127.0.0.1:8734/#/plant-efficiency-process-evaluation) |
| `multi-var-operational-parameters` | Multi-Var Operational Parameters | 0 | 1 | 16 | [→](#multi-var-operational-parameters) [open](http://127.0.0.1:8734/#/multi-var-operational-parameters) |
| `multi-var-4x4-daily-1` | Multi-Var 4x4 (Daily 1) | 0 | 1 | 16 | [→](#multi-var-4x4-daily-1) [open](http://127.0.0.1:8734/#/multi-var-4x4-daily-1) |
| `scott-wwf` | Scott WWF | 0 | 2 | 2 | [→](#scott-wwf) [open](http://127.0.0.1:8734/#/scott-wwf) |
| `northside-wwf` | Northside WWF | 0 | 2 | 2 | [→](#northside-wwf) [open](http://127.0.0.1:8734/#/northside-wwf) |
| `svi` | SVI | 0 | 2 | 1 | [→](#svi) [open](http://127.0.0.1:8734/#/svi) |
| `regulatory-parameters-2-3x3` | Regulatory Parameters (2)  3x3 | 0 | 1 | 9 | [→](#regulatory-parameters-2-3x3) [open](http://127.0.0.1:8734/#/regulatory-parameters-2-3x3) |
| `regulatory-parameters-1-3x3` | Regulatory Parameters (1)  3x3 | 0 | 1 | 9 | [→](#regulatory-parameters-1-3x3) [open](http://127.0.0.1:8734/#/regulatory-parameters-1-3x3) |
| `if-rem-ef-cbod-tss-nh3-n` | If, %Rem, ef CBOD, TSS & NH3-N | 0 | 1 | 9 | [→](#if-rem-ef-cbod-tss-nh3-n) [open](http://127.0.0.1:8734/#/if-rem-ef-cbod-tss-nh3-n) |
| `permitted-aaf-vs-dmr` | Permitted AAF Vs DMR | 0 | 1 | 4 | [→](#permitted-aaf-vs-dmr) [open](http://127.0.0.1:8734/#/permitted-aaf-vs-dmr) |
| `s-aeration` | S Aeration | 0 | 1 | 3 | [→](#s-aeration) [open](http://127.0.0.1:8734/#/s-aeration) |
| `ras-01` | RAS 01 | 0 | 1 | 3 | [→](#ras-01) [open](http://127.0.0.1:8734/#/ras-01) |
| `permit-evaluation-7590` | Permit Evaluation 75/90 | 0 | 1 | 3 | [→](#permit-evaluation-7590) [open](http://127.0.0.1:8734/#/permit-evaluation-7590) |
| `mo-eff-load-cbod-tss-nh3-n` | Mo Eff Load CBOD, TSS & NH3-N | 0 | 1 | 3 | [→](#mo-eff-load-cbod-tss-nh3-n) [open](http://127.0.0.1:8734/#/mo-eff-load-cbod-tss-nh3-n) |
| `daily-rem-cbod-tss-nh3-n` | Daily %Rem CBOD, TSS & NH3-N | 0 | 1 | 3 | [→](#daily-rem-cbod-tss-nh3-n) [open](http://127.0.0.1:8734/#/daily-rem-cbod-tss-nh3-n) |
| `was-01` | WAS 01 | 0 | 1 | 2 | [→](#was-01) [open](http://127.0.0.1:8734/#/was-01) |
| `tss-if-vs-ef` | TSS (If Vs Ef) | 0 | 1 | 2 | [→](#tss-if-vs-ef) [open](http://127.0.0.1:8734/#/tss-if-vs-ef) |
| `thck` | Thck | 0 | 1 | 2 | [→](#thck) [open](http://127.0.0.1:8734/#/thck) |
| `nh3-n-if-vs-ef` | NH3-N (If Vs Ef) | 0 | 1 | 2 | [→](#nh3-n-if-vs-ef) [open](http://127.0.0.1:8734/#/nh3-n-if-vs-ef) |
| `dig-01` | DIG 01 | 0 | 1 | 2 | [→](#dig-01) [open](http://127.0.0.1:8734/#/dig-01) |
| `clarifier` | Clarifier | 0 | 1 | 2 | [→](#clarifier) [open](http://127.0.0.1:8734/#/clarifier) |
| `cbod-if-vs-ef` | CBOD (If Vs Ef) | 0 | 1 | 2 | [→](#cbod-if-vs-ef) [open](http://127.0.0.1:8734/#/cbod-if-vs-ef) |
| `ef-flow-permit-eval` | Ef Flow Permit Eval | 0 | 1 | 1 | [→](#ef-flow-permit-eval) [open](http://127.0.0.1:8734/#/ef-flow-permit-eval) |
| `violations` | Violations | 0 | 0 | 2 | [→](#violations) [open](http://127.0.0.1:8734/#/violations) |
| `chemical-used` | Chemical Used | 0 | 0 | 1 | [→](#chemical-used) [open](http://127.0.0.1:8734/#/chemical-used) |

---

## Per-page details

### <a id="regulatory-kpi-33"></a>`regulatory-kpi-33` — Regulatory KPI (3/3)

[Open in app](http://127.0.0.1:8734/#/regulatory-kpi-33) · 21 high · 1 med · 16 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🔴 HIGH | `clusteredColumnChart` clusteredColumnChart | Unhandled visual type: `clusteredColumnChart` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |

### <a id="dt-chart-plant-if-daily"></a>`dt-chart-plant-if-daily` — DT Chart) Plant If Daily

[Open in app](http://127.0.0.1:8734/#/dt-chart-plant-if-daily) · 5 high · 1 med · 8 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🔴 HIGH | `card` card | Unhandled visual type: `card` (no aggregation recipe) |
| 🔴 HIGH | `card` card | Unhandled visual type: `card` (no aggregation recipe) |
| 🔴 HIGH | `card` card | Unhandled visual type: `card` (no aggregation recipe) |
| 🔴 HIGH | `card` card | Unhandled visual type: `card` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `card` card | Sort: d.AVG_Calc DESC. We use alphabetical. |
| 🟢 LOW | `card` card | Sort: d.AVG_Calc DESC. We use alphabetical. |
| 🟢 LOW | `card` card | Sort: d.AVG_Calc DESC. We use alphabetical. |
| 🟢 LOW | `card` card | Sort: d.AVG_Calc DESC. We use alphabetical. |

### <a id="explore-data-availability-in-hachwims"></a>`explore-data-availability-in-hachwims` — Explore Data Availability in HachWIMS

[Open in app](http://127.0.0.1:8734/#/explore-data-availability-in-hachwims) · 2 high · 1 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Value-axis config: start at 0D |

### <a id="dt-daily-effluent-flow"></a>`dt-daily-effluent-flow` — DT Daily Effluent Flow

[Open in app](http://127.0.0.1:8734/#/dt-daily-effluent-flow) · 1 high · 3 med · 4 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `tableEx` tableEx | SQL error: Binder Error: Values list "f" does not have a column named "GPM2MGD"

LINE 2: ... col2, SUM(f."LIMIT_VALUE") AS col3, d0 |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟢 LOW | `tableEx` tableEx | Sort: Sum(l.LIMIT_VALUE_MGD) DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` Average Daily Flow, MGD | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` 2-hr Peak Flow, GPM | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` Rainfall Depth, Inch | Data labels ON in PBIX (we don't render them) |

### <a id="adf-2hrpeak-to-download"></a>`adf-2hrpeak-to-download` — ADF_2HrPeak_to_Download

[Open in app](http://127.0.0.1:8734/#/adf-2hrpeak-to-download) · 1 high · 3 med · 4 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `tableEx` tableEx | SQL error: Binder Error: Values list "f" does not have a column named "GPM2MGD"

LINE 2: ... col1, SUM(f."LIMIT_VALUE") AS col2, d0 |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟢 LOW | `tableEx` tableEx | Sort: Sum(l.LIMIT_VALUE_MGD) DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` Average Daily Flow, MGD | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` 2-hr Peak Flow, GPM | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` Rainfall Depth, Inch | Data labels ON in PBIX (we don't render them) |

### <a id="permit-evaluation-aaf"></a>`permit-evaluation-aaf` — Permit Evaluation AAF

[Open in app](http://127.0.0.1:8734/#/permit-evaluation-aaf) · 1 high · 2 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `tableEx` tableEx | Unhandled visual type: `tableEx` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟢 LOW | `lineStackedColumnComboChart` Effluent Flow, MGD  \|  Annual Average (Permit Eval | Data labels ON in PBIX (we don't render them) |

### <a id="om-report"></a>`om-report` — O&M Report

[Open in app](http://127.0.0.1:8734/#/om-report) · 1 high · 2 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `tableEx` WWTP Effluent Permit Limitations | Unhandled visual type: `tableEx` (no aggregation recipe) |
| 🟡 MED | `tableEx` WWTP Effluent Permit Limitations | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` WWTP Flow Data and Influent Characteristics Analys | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟢 LOW | `tableEx` WWTP Flow Data and Influent Characteristics Analys | Sort: Avg(d.CURVALUE) DESC. We use alphabetical. |

### <a id="infeff-daily-report"></a>`infeff-daily-report` — INF/EFF Daily Report

[Open in app](http://127.0.0.1:8734/#/infeff-daily-report) · 1 high · 2 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `pivotTable` pivotTable | Unhandled visual type: `pivotTable` (no aggregation recipe) |
| 🟡 MED | `pivotTable` pivotTable | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `pivotTable` pivotTable | Sort: d.Date DESC. We use alphabetical. |

### <a id="charts-plant-ef-daily-wolimits"></a>`charts-plant-ef-daily-wolimits` — (Charts) Plant Ef Daily woLIMITS

[Open in app](http://127.0.0.1:8734/#/charts-plant-ef-daily-wolimits) · 1 high · 2 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="aeration-daily-report"></a>`aeration-daily-report` — AERATION Daily Report

[Open in app](http://127.0.0.1:8734/#/aeration-daily-report) · 1 high · 2 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `pivotTable` pivotTable | Unhandled visual type: `pivotTable` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `pivotTable` pivotTable | Pivot with Rows+Columns projections — we render as flat table |
| 🟢 LOW | `pivotTable` pivotTable | Sort: d.Date DESC. We use alphabetical. |

### <a id="statistical-flows"></a>`statistical-flows` — Statistical Flows

[Open in app](http://127.0.0.1:8734/#/statistical-flows) · 1 high · 1 med · 7 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `card` card | Unhandled visual type: `card` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `card` card | Sort: d.STDEV.S DESC. We use alphabetical. |
| 🟢 LOW | `card` card | Sort: d.MAX Curval DESC. We use alphabetical. |
| 🟢 LOW | `card` card | Sort: d.AVG_Calc DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` Average Daily Flow, MGD | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `card` card | Sort: Sum(l.LIMIT_VALUE) DESC. We use alphabetical. |
| 🟢 LOW | `card` card | Sort: Avg(d.90%) DESC. We use alphabetical. |
| 🟢 LOW | `card` card | Sort: Avg(d.75%) DESC. We use alphabetical. |

### <a id="dt-chart-plant-ef-daily"></a>`dt-chart-plant-ef-daily` — DT (Chart) Plant Ef Daily

[Open in app](http://127.0.0.1:8734/#/dt-chart-plant-ef-daily) · 1 high · 1 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="chart-plant-other-daily"></a>`chart-plant-other-daily` — (Chart) Plant Other Daily

[Open in app](http://127.0.0.1:8734/#/chart-plant-other-daily) · 1 high · 1 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `slicer` slicer | Unhandled visual type: `slicer` (no aggregation recipe) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="permit-limits"></a>`permit-limits` — Permit Limits

[Open in app](http://127.0.0.1:8734/#/permit-limits) · 1 high · 0 med · 0 low

| Severity | Visual | Gap |
|---|---|---|
| 🔴 HIGH | `tableEx` tableEx | Unhandled visual type: `tableEx` (no aggregation recipe) |

### <a id="dt-dmr-5yr-ef-tss"></a>`dt-dmr-5yr-ef-tss` — DT (DMR 5yr) Ef TSS

[Open in app](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-tss) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent TSS Monthly Average, MG/L (Same as DMR Re | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent TSS Monthly Average, MG/L (Same as DMR Re | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dt-dmr-5yr-ef-nh3-n"></a>`dt-dmr-5yr-ef-nh3-n` — DT (DMR 5yr) Ef NH3-N

[Open in app](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-nh3-n) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent NH3-N Monthly Average, MG/L (Same as DMR  | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent NH3-N Monthly Average, MG/L (Same as DMR  | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dt-dmr-5yr-ef-flow-mgd"></a>`dt-dmr-5yr-ef-flow-mgd` — DT (DMR 5yr) Ef Flow MGD

[Open in app](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-flow-mgd) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Monthly Average Daily Effluent Flow, MGD (same as  | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Monthly Average Daily Effluent Flow, MGD (same as  | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dt-dmr-5yr-ef-cbod"></a>`dt-dmr-5yr-ef-cbod` — DT (DMR 5yr) Ef CBOD

[Open in app](http://127.0.0.1:8734/#/dt-dmr-5yr-ef-cbod) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent CBOD Monthly Average, MG/L (Same as DMR R | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent CBOD Monthly Average, MG/L (Same as DMR R | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-5yr-ph-field"></a>`dmr-5yr-ph-field` — (DMR 5yr) Ph Field

[Open in app](http://127.0.0.1:8734/#/dmr-5yr-ph-field) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent Ph Field Monthly Average (Same as DMR Rep | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent Ph Field Monthly Average (Same as DMR Rep | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-5yr-ef-tss-loading"></a>`dmr-5yr-ef-tss-loading` — (DMR 5yr) Ef TSS Loading

[Open in app](http://127.0.0.1:8734/#/dmr-5yr-ef-tss-loading) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent TSS Loading Monthly Average, LB/DAY (Same | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent TSS Loading Monthly Average, LB/DAY (Same | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-5yr-ef-nh3-n-loading"></a>`dmr-5yr-ef-nh3-n-loading` — (DMR 5yr) Ef NH3-N Loading

[Open in app](http://127.0.0.1:8734/#/dmr-5yr-ef-nh3-n-loading) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent NH3-N Loading Monthly Average, LB/DAY (Sa | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent NH3-N Loading Monthly Average, LB/DAY (Sa | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-5yr-ef-do-loading"></a>`dmr-5yr-ef-do-loading` — (DMR 5yr) Ef D.O. Loading

[Open in app](http://127.0.0.1:8734/#/dmr-5yr-ef-do-loading) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent Diss Oxygen Monthly Daily Minimum, MG/L ( | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent Diss Oxygen Monthly Daily Minimum, MG/L ( | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-5yr-ef-cl2-residual-loading"></a>`dmr-5yr-ef-cl2-residual-loading` — (DMR 5yr) Ef CL2 Residual Loading

[Open in app](http://127.0.0.1:8734/#/dmr-5yr-ef-cl2-residual-loading) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent CL2 Residual Monthly Average, MG/L (Same  | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent CL2 Residual Monthly Average, MG/L (Same  | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-5yr-ef-cbod-loading"></a>`dmr-5yr-ef-cbod-loading` — (DMR 5yr) Ef CBOD Loading

[Open in app](http://127.0.0.1:8734/#/dmr-5yr-ef-cbod-loading) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent CBOD Loading Monthly Average, LB/DAY (Sam | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent CBOD Loading Monthly Average, LB/DAY (Sam | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-5yr-ecoli"></a>`dmr-5yr-ecoli` — (DMR 5yr) E.Coli

[Open in app](http://127.0.0.1:8734/#/dmr-5yr-ecoli) · 0 high · 5 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Effluent E.coli Monthly Average, MPN/100ML (Same a | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Effluent E.coli Monthly Average, MPN/100ML (Same a | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-monthlyaaf-for-permit-evaluation"></a>`dmr-monthlyaaf-for-permit-evaluation` — (DMR) MonthlyAAF (For Permit Evaluation)

[Open in app](http://127.0.0.1:8734/#/dmr-monthlyaaf-for-permit-evaluation) · 0 high · 5 med · 0 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `pivotTable` Annual Average Flow, MGD Reported Monthly (Estimat | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Annual Average Flow, MGD Reported Monthly (Estimat | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |

### <a id="tables-permitted-capacity-evaluation-pbi"></a>`tables-permitted-capacity-evaluation-pbi` — (Tables) Permitted Capacity Evaluation PBI

[Open in app](http://127.0.0.1:8734/#/tables-permitted-capacity-evaluation-pbi) · 0 high · 4 med · 0 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `tableEx` Permit Evaluation, AAF | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` NPDES Permit Limits | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` Permit Evaluation, 75/90 (<= 1 mgd Plant) | Conditional formatting missing (2 rule(s) in PBIX — cell colors by threshold) |

### <a id="hist-mo-ef-flow-mgd"></a>`hist-mo-ef-flow-mgd` — Hist Mo Ef Flow MGD

[Open in app](http://127.0.0.1:8734/#/hist-mo-ef-flow-mgd) · 0 high · 3 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `tableEx` tableEx | Sort: l.LIMIT_VALUE DESC. We use alphabetical. |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="elec"></a>`elec` — ELEC

[Open in app](http://127.0.0.1:8734/#/elec) · 0 high · 3 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `clusteredColumnChart` DAILY | Reference lines missing: AVG |
| 🟡 MED | `clusteredColumnChart` MONTHLY | Reference lines missing: AVG |
| 🟢 LOW | `clusteredColumnChart` DAILY | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` MONTHLY | Data labels ON in PBIX (we don't render them) |

### <a id="ef-flow-aaf-maf"></a>`ef-flow-aaf-maf` — Ef Flow (AAF & MAF)

[Open in app](http://127.0.0.1:8734/#/ef-flow-aaf-maf) · 0 high · 3 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `tableEx` tableEx | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `tableEx` tableEx | Advanced filter(s) dropped: >= |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` Effluent Flow, MGD  \|  Annual Average (Permit Eval | Data labels ON in PBIX (we don't render them) |

### <a id="dmr-monthlyadf-for-7590-rules"></a>`dmr-monthlyadf-for-7590-rules` — (DMR) MonthlyADF (For 75/90 Rules)

[Open in app](http://127.0.0.1:8734/#/dmr-monthlyadf-for-7590-rules) · 0 high · 3 med · 0 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` Monthly Average Daily Effluent Flow, MGD (same as  | Conditional formatting missing (1 rule(s) in PBIX — cell colors by threshold) |
| 🟡 MED | `pivotTable` Monthly Average Daily Effluent Flow, MGD (same as  | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |

### <a id="plant-efficiency-process-evaluation"></a>`plant-efficiency-process-evaluation` — Plant Efficiency Process Evaluation

[Open in app](http://127.0.0.1:8734/#/plant-efficiency-process-evaluation) · 0 high · 1 med · 16 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="multi-var-operational-parameters"></a>`multi-var-operational-parameters` — Multi-Var Operational Parameters

[Open in app](http://127.0.0.1:8734/#/multi-var-operational-parameters) · 0 high · 1 med · 16 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="multi-var-4x4-daily-1"></a>`multi-var-4x4-daily-1` — Multi-Var 4x4 (Daily 1)

[Open in app](http://127.0.0.1:8734/#/multi-var-4x4-daily-1) · 0 high · 1 med · 16 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `clusteredColumnChart` clusteredColumnChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` areaChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="scott-wwf"></a>`scott-wwf` — Scott WWF

[Open in app](http://127.0.0.1:8734/#/scott-wwf) · 0 high · 2 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` pivotTable | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `pivotTable` pivotTable | Sort: d.Date DESC. We use alphabetical. |
| 🟢 LOW | `columnChart` WWF Discharge (MGD) Trends | Data labels ON in PBIX (we don't render them) |

### <a id="northside-wwf"></a>`northside-wwf` — Northside WWF

[Open in app](http://127.0.0.1:8734/#/northside-wwf) · 0 high · 2 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `pivotTable` pivotTable | Pivot with Rows+Columns projections — we render as flat table |
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `pivotTable` pivotTable | Sort: d.Date DESC. We use alphabetical. |
| 🟢 LOW | `columnChart` WWF Discharge (MGD) Trends | Data labels ON in PBIX (we don't render them) |

### <a id="svi"></a>`svi` — SVI

[Open in app](http://127.0.0.1:8734/#/svi) · 0 high · 2 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟡 MED | `areaChart` Recorded Value by Date and Plant | Reference lines missing: Threshold |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="regulatory-parameters-2-3x3"></a>`regulatory-parameters-2-3x3` — Regulatory Parameters (2)  3x3

[Open in app](http://127.0.0.1:8734/#/regulatory-parameters-2-3x3) · 0 high · 1 med · 9 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="regulatory-parameters-1-3x3"></a>`regulatory-parameters-1-3x3` — Regulatory Parameters (1)  3x3

[Open in app](http://127.0.0.1:8734/#/regulatory-parameters-1-3x3) · 0 high · 1 med · 9 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="if-rem-ef-cbod-tss-nh3-n"></a>`if-rem-ef-cbod-tss-nh3-n` — If, %Rem, ef CBOD, TSS & NH3-N

[Open in app](http://127.0.0.1:8734/#/if-rem-ef-cbod-tss-nh3-n) · 0 high · 1 med · 9 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` CBOD - Average Daily Influent Vs. Effluent | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` TSS - Average Daily Influent Vs. Effluent | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` NH3-N - Average Daily Influent Vs. Effluent | Data labels ON in PBIX (we don't render them) |

### <a id="permitted-aaf-vs-dmr"></a>`permitted-aaf-vs-dmr` — Permitted AAF Vs DMR

[Open in app](http://127.0.0.1:8734/#/permitted-aaf-vs-dmr) · 0 high · 1 med · 4 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineStackedColumnComboChart` Annual Average Flow, MGD (Permit Evaluation), Repo | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineStackedColumnComboChart` Average Daily Flow, MGD (Monthly DMR) | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `card` Permit Evaluated Flow | Sort: d.MAX Curval DESC. We use alphabetical. |
| 🟢 LOW | `card` Permitted Flow | Sort: Sum(l.LIMIT_VALUE) DESC. We use alphabetical. |

### <a id="s-aeration"></a>`s-aeration` — S Aeration

[Open in app](http://127.0.0.1:8734/#/s-aeration) · 0 high · 1 med · 3 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="ras-01"></a>`ras-01` — RAS 01

[Open in app](http://127.0.0.1:8734/#/ras-01) · 0 high · 1 med · 3 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="permit-evaluation-7590"></a>`permit-evaluation-7590` — Permit Evaluation 75/90

[Open in app](http://127.0.0.1:8734/#/permit-evaluation-7590) · 0 high · 1 med · 3 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` Effluent Flow, MGD  \|  75/90 Rule Evaulation - Min | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `card` 75/90 Minimum Flow | Sort: d.Rolling 3 Months Minimum max per DATESTAMP DESC. We use alphabetical. |
| 🟢 LOW | `card` 75/90 Minimum Flow | Sort: d.Rolling 3 Months Minimum max per DATESTAMP DESC. We use alphabetical. |

### <a id="mo-eff-load-cbod-tss-nh3-n"></a>`mo-eff-load-cbod-tss-nh3-n` — Mo Eff Load CBOD, TSS & NH3-N

[Open in app](http://127.0.0.1:8734/#/mo-eff-load-cbod-tss-nh3-n) · 0 high · 1 med · 3 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` lineClusteredColumnComboChart | Data labels ON in PBIX (we don't render them) |

### <a id="daily-rem-cbod-tss-nh3-n"></a>`daily-rem-cbod-tss-nh3-n` — Daily %Rem CBOD, TSS & NH3-N

[Open in app](http://127.0.0.1:8734/#/daily-rem-cbod-tss-nh3-n) · 0 high · 1 med · 3 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="was-01"></a>`was-01` — WAS 01

[Open in app](http://127.0.0.1:8734/#/was-01) · 0 high · 1 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="tss-if-vs-ef"></a>`tss-if-vs-ef` — TSS (If Vs Ef)

[Open in app](http://127.0.0.1:8734/#/tss-if-vs-ef) · 0 high · 1 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` TSS - Average Daily Influent Vs. Effluent | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `lineClusteredColumnComboChart` TSS - Average Daily Effluent and Permitted Dischar | Data labels ON in PBIX (we don't render them) |

### <a id="thck"></a>`thck` — Thck

[Open in app](http://127.0.0.1:8734/#/thck) · 0 high · 1 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="nh3-n-if-vs-ef"></a>`nh3-n-if-vs-ef` — NH3-N (If Vs Ef)

[Open in app](http://127.0.0.1:8734/#/nh3-n-if-vs-ef) · 0 high · 1 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` NH3-N - Average Daily Effluent and Permitted Disch | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` NH3-N - Average Daily Influent Vs. Effluent | Data labels ON in PBIX (we don't render them) |

### <a id="dig-01"></a>`dig-01` — DIG 01

[Open in app](http://127.0.0.1:8734/#/dig-01) · 0 high · 1 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="clarifier"></a>`clarifier` — Clarifier

[Open in app](http://127.0.0.1:8734/#/clarifier) · 0 high · 1 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

### <a id="cbod-if-vs-ef"></a>`cbod-if-vs-ef` — CBOD (If Vs Ef)

[Open in app](http://127.0.0.1:8734/#/cbod-if-vs-ef) · 0 high · 1 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `lineClusteredColumnComboChart` CBOD - Average Daily Effluent and Permitted Discha | Data labels ON in PBIX (we don't render them) |
| 🟢 LOW | `areaChart` CBOD - Average Daily Influent Vs. Effluent | Data labels ON in PBIX (we don't render them) |

### <a id="ef-flow-permit-eval"></a>`ef-flow-permit-eval` — Ef Flow Permit Eval

[Open in app](http://127.0.0.1:8734/#/ef-flow-permit-eval) · 0 high · 1 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🟡 MED | `slicer` slicer | Date slicer renders as dropdown of ~500 dates (no filtering) |
| 🟢 LOW | `hundredPercentStackedColumnChart` Effluent Flow, MGD  \| Based on Maximum of Twelve C | Value-axis config: start at 0.01D |

### <a id="violations"></a>`violations` — Violations

[Open in app](http://127.0.0.1:8734/#/violations) · 0 high · 0 med · 2 low

| Severity | Visual | Gap |
|---|---|---|
| 🟢 LOW | `card` card | Sort: Sum(d.Violation) DESC. We use alphabetical. |
| 🟢 LOW | `columnChart` columnChart | Data labels ON in PBIX (we don't render them) |

### <a id="chemical-used"></a>`chemical-used` — Chemical Used

[Open in app](http://127.0.0.1:8734/#/chemical-used) · 0 high · 0 med · 1 low

| Severity | Visual | Gap |
|---|---|---|
| 🟢 LOW | `areaChart` Recorded Value by Date and Plant | Data labels ON in PBIX (we don't render them) |

## Pages with no detected gaps (2)

- `wwtp-optimization` — WWTP Optimization
- `home` — Home