/**
 * /lib/measures.ts
 *
 * TypeScript translations of all 18 DAX measures extracted from
 * Viewer_HachWIMS_DMRReportsPlus_Violations_Dataflow.pbix (DATATBL table).
 *
 * DAX expressions are inferred from:
 *   - measure names
 *   - visual types and pages they appear on (visual_inventory.json)
 *   - standard Power BI permit-evaluation patterns
 *
 * All exported functions satisfy:
 *   (data: DataTblRow[], filters?: Filters) => number
 *
 * Rolling-window measures accept an optional `filters.asOf` date that mirrors
 * DAX's LASTDATE() / current row context. When omitted, asOf defaults to the
 * latest DATESTAMP present in the (already-filtered) data.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single row from the DATATBL fact table (HachWIMS daily/monthly readings). */
export interface DataTblRow {
  /** ISO date string 'YYYY-MM-DD' */
  DATESTAMP: string;
  /** ISO date string 'YYYY-MM-DD' (duplicate of DATESTAMP, used as chart axis) */
  Date: string;
  Month: number;
  'Week Number': number;
  'Day of Year': number;
  WWTP: string;
  'Primary Parameter': string;
  'Categories One': string;
  'Category Two': string;
  /** Actual measured/reported value (flow in MGD, or concentration in mg/L) */
  CURVALUE: number;
  /** Permit limit for this parameter at this WWTP */
  Limit: number;
  /**
   * Permitted Annual Average Flow for this WWTP.
   * Named "Color Format for Flow" in Power BI — drives the conditional
   * formatting colour (green / amber / red) on flow visuals.
   */
  'Color Format for Flow': number;
  /** 75th-percentile max daily flow (monthly stat, populated for Flow rows only) */
  '75%': number | null;
  /** 90th-percentile max daily flow (monthly stat, populated for Flow rows only) */
  '90%': number | null;
  Violation: 'Y' | 'N';
}

/**
 * Optional filter context applied before aggregation.
 * Mirrors DAX's implicit filter context propagation.
 */
export interface Filters {
  /** Filter to a single WWTP; omit / undefined = all plants */
  wwtp?: string;
  /** Filter to a single parameter (e.g. 'Effluent Flow'); omit = all */
  parameter?: string;
  /** Inclusive start date 'YYYY-MM-DD' */
  startDate?: string;
  /** Inclusive end date 'YYYY-MM-DD' */
  endDate?: string;
  /**
   * Reference "current" date for rolling-window measures.
   * Mirrors DAX LASTDATE() / current row context in time-intelligence functions.
   * Defaults to the latest DATESTAMP in the filtered dataset when omitted.
   */
  asOf?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Apply filter context to data rows.
 * Mirrors DAX's implicit CALCULATE filter propagation.
 */
function applyFilters(data: DataTblRow[], filters?: Filters): DataTblRow[] {
  if (!filters) return data;
  return data.filter((row) => {
    if (filters.wwtp && row.WWTP !== filters.wwtp) return false;
    if (filters.parameter && row['Primary Parameter'] !== filters.parameter) return false;
    if (filters.startDate && row.DATESTAMP < filters.startDate) return false;
    if (filters.endDate && row.DATESTAMP > filters.endDate) return false;
    return true;
  });
}

/**
 * Inclusive linear-interpolation percentile (equivalent to DAX PERCENTILX.INC
 * and numpy/Excel PERCENTILE.INC).
 *
 * Formula: index = p × (n − 1); result = values[⌊i⌋] + frac × (values[⌈i⌉] − values[⌊i⌋])
 */
function percentileInc(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  const sorted = [...values].sort((a, b) => a - b);
  const idx = p * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Resolve the asOf date: explicit value, or latest DATESTAMP in data. */
function resolveAsOf(data: DataTblRow[], asOf?: string): string {
  if (asOf) return asOf;
  return data.reduce((max, r) => (r.DATESTAMP > max ? r.DATESTAMP : max), '');
}

/** Subtract n calendar months from an ISO date string, returning 'YYYY-MM-DD'. */
function subtractMonths(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

/** Subtract n days from an ISO date string, returning 'YYYY-MM-DD'. */
function subtractDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ─── Percentile measures ──────────────────────────────────────────────────────

/**
 * 100th percentile of CURVALUE (= maximum value).
 *
 * @dax
 * `100th Percentile = PERCENTILX.INC(DATATBL, DATATBL[CURVALUE], 1)`
 *
 * Used in: ZC_Effluent flow/quality area charts; Stats_InfluentParams clustered column.
 */
export function pct100(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  return percentileInc(rows.map((r) => r.CURVALUE), 1);
}

/**
 * 25th percentile of CURVALUE.
 *
 * @dax
 * `25th Percentile = PERCENTILX.INC(DATATBL, DATATBL[CURVALUE], 0.25)`
 *
 * Used in: ZC_ area charts; Stats_InfluentParams clustered column.
 */
export function pct25(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  return percentileInc(rows.map((r) => r.CURVALUE), 0.25);
}

/**
 * 50th percentile (median) of CURVALUE.
 *
 * @dax
 * `50th Percentile = PERCENTILX.INC(DATATBL, DATATBL[CURVALUE], 0.5)`
 *
 * Used in: ZC_ area charts; Stats_InfluentParams clustered column.
 */
export function pct50(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  return percentileInc(rows.map((r) => r.CURVALUE), 0.5);
}

/**
 * 75th percentile of CURVALUE.
 *
 * @dax
 * `75th Percentile = PERCENTILX.INC(DATATBL, DATATBL[CURVALUE], 0.75)`
 *
 * Used in: ZC_ area charts; Stats_InfluentParams clustered column.
 */
export function pct75(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  return percentileInc(rows.map((r) => r.CURVALUE), 0.75);
}

/**
 * 95th percentile of CURVALUE.
 *
 * @dax
 * `95th Percentile = PERCENTILX.INC(DATATBL, DATATBL[CURVALUE], 0.95)`
 *
 * Used in: Stats_InfluentParams clustered column.
 */
export function pct95(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  return percentileInc(rows.map((r) => r.CURVALUE), 0.95);
}

/**
 * 99th percentile of CURVALUE.
 *
 * @dax
 * `99th Percentile = PERCENTILX.INC(DATATBL, DATATBL[CURVALUE], 0.99)`
 *
 * Used in: Stats_InfluentParams clustered column.
 */
export function pct99(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  return percentileInc(rows.map((r) => r.CURVALUE), 0.99);
}

// ─── Basic aggregation measures ───────────────────────────────────────────────

/**
 * Average of [Color Format for Flow] (= permitted AAF) minus MAX of CURVALUE.
 * Represents remaining capacity headroom: how far the peak observed flow is
 * below the permitted annual average.
 *
 * @dax
 * ```
 * Average of Color Format for Flow minus Max of CURVALUE =
 *   AVERAGE(DATATBL[Color Format for Flow]) - MAX(DATATBL[CURVALUE])
 * ```
 *
 * Used in: Ef Flow Permit Eval — hundredPercentStackedColumnChart.
 * A positive value means compliant (headroom); negative means over-permit.
 */
export function avgColorFormatMinusMaxCurValue(
  data: DataTblRow[],
  filters?: Filters,
): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  const avgLimit =
    rows.reduce((sum, r) => sum + r['Color Format for Flow'], 0) / rows.length;
  const maxVal = rows.reduce((m, r) => Math.max(m, r.CURVALUE), -Infinity);
  return avgLimit - maxVal;
}

/**
 * Average of CURVALUE within filter context.
 * Used as the primary "average flow" measure on charts and KPI cards.
 *
 * @dax
 * `AVG_Calc = CALCULATE(AVERAGE(DATATBL[CURVALUE]))`
 *
 * The CALCULATE wrapper ensures proper filter-context propagation when used in
 * pivot tables broken down by WWTP or date.
 *
 * Used in: DT Chart Plant If Daily [card]; Statistical Flows [card, pivotTable];
 *          Permitted AAF Vs DMR [lineStackedColumnComboChart].
 */
export function avgCalc(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  return rows.reduce((sum, r) => sum + r.CURVALUE, 0) / rows.length;
}

/**
 * Average of CURVALUE (row-by-row iteration via AVERAGEX).
 * Functionally equivalent to avgCalc in most contexts; used specifically
 * on the Combined WWTP Flow pivot table.
 *
 * @dax
 * `Avg_CurValue = AVERAGEX(DATATBL, DATATBL[CURVALUE])`
 *
 * AVERAGEX iterates the table explicitly and handles blank rows differently
 * from AVERAGE: AVERAGE ignores blanks; AVERAGEX treats them as 0 when the
 * expression evaluates to BLANK(). Functionally identical here since CURVALUE
 * is always numeric.
 *
 * Used in: Combined WWTP Flow [pivotTable].
 */
export function avgCurValue(data: DataTblRow[], filters?: Filters): number {
  // AVERAGEX(DATATBL, DATATBL[CURVALUE]) — equivalent to AVERAGE for numeric columns
  return avgCalc(data, filters);
}

/**
 * Count of rows in DATATBL within filter context.
 *
 * @dax
 * `CurValue_Record_Count = COUNTROWS(DATATBL)`
 *
 * Used in: Understanding_HachWIMS [tableEx] to show data availability per variable.
 */
export function curValueRecordCount(data: DataTblRow[], filters?: Filters): number {
  return applyFilters(data, filters).length;
}

/**
 * Maximum CURVALUE within filter context.
 *
 * @dax
 * `MAX Curval = MAX(DATATBL[CURVALUE])`
 *
 * Used in: Permit Evaluation AAF [card] — shows peak monthly avg daily flow;
 *          Summary tables [tableEx]; Statistical Flows [card];
 *          Permitted AAF Vs DMR [card].
 */
export function maxCurval(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  return rows.reduce((m, r) => Math.max(m, r.CURVALUE), -Infinity);
}

/**
 * Maximum observed flow as a fraction of the permitted Annual Average Flow.
 *
 * @dax
 * ```
 * Measure Max AAF% =
 *   DIVIDE(
 *     MAX(DATATBL[CURVALUE]),
 *     AVERAGE(DATATBL[Color Format for Flow]),
 *     0
 *   )
 * ```
 *
 * Returns a decimal ratio (e.g. 0.87 = 87 % of permitted capacity).
 * Power BI formats this as a percentage; multiply by 100 for display.
 *
 * Used in: Permit Evaluation AAF [card]; Summary tables [tableEx].
 */
export function measureMaxAAFPct(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  const maxVal = maxCurval(rows);                              // reuse composed measure
  const avgLimit =
    rows.reduce((sum, r) => sum + r['Color Format for Flow'], 0) / rows.length;
  if (avgLimit === 0) return 0;
  return maxVal / avgLimit;
}

/**
 * Minimum CURVALUE within filter context.
 *
 * @dax
 * `Min Curval = MIN(DATATBL[CURVALUE])`
 *
 * Used in: ZC_ area charts — lower bound of the shaded distribution band.
 */
export function minCurval(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  return rows.reduce((m, r) => Math.min(m, r.CURVALUE), Infinity);
}

/**
 * Sample standard deviation of CURVALUE.
 *
 * @dax
 * `STDEV.S = STDEV.S(DATATBL[CURVALUE])`
 *
 * Uses Bessel's correction (divides by n − 1), matching Excel/DAX STDEV.S.
 *
 * Used in: DT Chart Plant If Daily [card]; Statistical Flows [card].
 */
export function stdevS(data: DataTblRow[], filters?: Filters): number {
  const rows = applyFilters(data, filters);
  if (rows.length < 2) return 0;
  const mean = rows.reduce((sum, r) => sum + r.CURVALUE, 0) / rows.length;
  const variance =
    rows.reduce((sum, r) => sum + Math.pow(r.CURVALUE - mean, 2), 0) /
    (rows.length - 1);
  return Math.sqrt(variance);
}

// ─── Rolling-window / time-intelligence measures ──────────────────────────────

/**
 * Rolling 3-month minimum of CURVALUE ending on `filters.asOf`.
 *
 * In Power BI this is evaluated per row in the chart's date axis — each point
 * on the line shows the minimum value across the 3 months ending on that date.
 * Supply `filters.asOf` to reproduce a specific point; omit to get the value
 * at the latest date in the dataset.
 *
 * @dax
 * ```
 * Rolling 3 Months Minimum =
 *   CALCULATE(
 *     MIN(DATATBL[CURVALUE]),
 *     DATESINPERIOD(
 *       DATATBL[DATESTAMP],
 *       LASTDATE(DATATBL[DATESTAMP]),
 *       -3,
 *       MONTH
 *     )
 *   )
 * ```
 *
 * Used in: Permit Evaluation 75/90 [lineClusteredColumnComboChart] — the
 * rolling-minimum line plotted against the 75th/90th-percentile limit lines.
 *
 * @param asOf  `filters.asOf` — reference date (= LASTDATE in current context).
 *              Defaults to max DATESTAMP in filtered data.
 */
export function rolling3MonthsMinimum(
  data: DataTblRow[],
  filters?: Filters,
): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  const asOf = resolveAsOf(rows, filters?.asOf);
  const windowStart = subtractMonths(asOf, 3);
  const window = rows.filter(
    (r) => r.DATESTAMP >= windowStart && r.DATESTAMP <= asOf,
  );
  if (window.length === 0) return 0;
  return window.reduce((m, r) => Math.min(m, r.CURVALUE), Infinity);
}

/**
 * Maximum, across every DATESTAMP in the dataset, of the rolling 3-month
 * minimum ending on that date.
 *
 * This is the key 75/90-rule KPI card value: it answers "what was the highest
 * 3-month rolling minimum observed?" — a higher value means the plant was
 * consistently running at higher flow levels.
 *
 * @dax
 * ```
 * Rolling 3 Months Minimum max per DATESTAMP =
 *   CALCULATE(
 *     MAXX(
 *       ALLSELECTED(DATATBL[DATESTAMP]),
 *       CALCULATE(
 *         MIN(DATATBL[CURVALUE]),
 *         DATESINPERIOD(DATATBL[DATESTAMP], DATATBL[DATESTAMP], -3, MONTH)
 *       )
 *     )
 *   )
 * ```
 *
 * Implementation: iterate every unique DATESTAMP in the (pre-filtered) data,
 * compute rolling3MonthsMinimum as of that date, return the maximum.
 *
 * Used in: Summary tables [tableEx]; Permit Evaluation 75/90 [card].
 */
export function rolling3MonthsMinimumMaxPerDatestamp(
  data: DataTblRow[],
  filters?: Filters,
): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  const uniqueDates = [...new Set(rows.map((r) => r.DATESTAMP))].sort();
  let max = -Infinity;
  for (const date of uniqueDates) {
    const windowStart = subtractMonths(date, 3);
    const window = rows.filter(
      (r) => r.DATESTAMP >= windowStart && r.DATESTAMP <= date,
    );
    if (window.length === 0) continue;
    const rollingMin = window.reduce((m, r) => Math.min(m, r.CURVALUE), Infinity);
    if (rollingMin > max) max = rollingMin;
  }
  return max === -Infinity ? 0 : max;
}

/**
 * Rolling 3-month minimum max per DATESTAMP divided by the permitted AAF
 * ([Color Format for Flow]).
 *
 * The primary compliance ratio for the 75/90 rule:
 *   - ratio > 1.00 → flow exceeded the permitted AAF in some 3-month window
 *   - ratio 0.90–1.00 → approaching limit
 *   - ratio < 0.75 → well within compliance
 *
 * Returns a decimal ratio (e.g. 0.91 = 91 % of permitted AAF).
 *
 * @dax
 * ```
 * Rolling 3 Months Minimum max per DATESTAMP divided by Color Format for Flow =
 *   DIVIDE(
 *     [Rolling 3 Months Minimum max per DATESTAMP],
 *     CALCULATE(AVERAGE(DATATBL[Color Format for Flow])),
 *     0
 *   )
 * ```
 *
 * Composed from: rolling3MonthsMinimumMaxPerDatestamp ÷ avg(Color Format for Flow).
 *
 * Used in: Summary tables [tableEx]; Permit Evaluation 75/90 [card].
 */
export function rolling3MonthsMinMaxPerDatestampDivByColorFormatForFlow(
  data: DataTblRow[],
  filters?: Filters,
): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  const numerator = rolling3MonthsMinimumMaxPerDatestamp(rows);    // composed
  const avgLimit =
    rows.reduce((sum, r) => sum + r['Color Format for Flow'], 0) / rows.length;
  if (avgLimit === 0) return 0;
  return numerator / avgLimit;
}

/**
 * Rolling 30-day average of CURVALUE ending on `filters.asOf`.
 *
 * Used on process-equipment KPI tiles (aeration basins, clarifiers, etc.) where
 * the operational context is daily data and a 30-day smoothing window is
 * appropriate.
 *
 * @dax
 * ```
 * Rolling 30 day Average =
 *   CALCULATE(
 *     AVERAGE(DATATBL[CURVALUE]),
 *     DATESINPERIOD(
 *       DATATBL[DATESTAMP],
 *       LASTDATE(DATATBL[DATESTAMP]),
 *       -30,
 *       DAY
 *     )
 *   )
 * ```
 *
 * Used in: DT_Areation Basin/RAS/WAS [kpi]; DT_Clarifier/Thickner/Digester [kpi].
 *
 * @param asOf  `filters.asOf` — reference date. Defaults to max DATESTAMP in data.
 */
export function rolling30DayAverage(
  data: DataTblRow[],
  filters?: Filters,
): number {
  const rows = applyFilters(data, filters);
  if (rows.length === 0) return 0;
  const asOf = resolveAsOf(rows, filters?.asOf);
  const windowStart = subtractDays(asOf, 30);
  const window = rows.filter(
    (r) => r.DATESTAMP >= windowStart && r.DATESTAMP <= asOf,
  );
  if (window.length === 0) return 0;
  return window.reduce((sum, r) => sum + r.CURVALUE, 0) / window.length;
}

// ─── Convenience: build a time-series of rolling values ───────────────────────

/**
 * Utility (not a DAX measure) — produces a time series suitable for chart
 * rendering by evaluating a rolling measure at every unique DATESTAMP.
 *
 * Mirrors the way Power BI evaluates a measure once per axis value in a chart.
 *
 * @example
 * const series = rollingTimeSeries(data, filters, rolling3MonthsMinimum);
 * // → [{ date: '2022-03-01', value: 4.21 }, ...]
 */
export function rollingTimeSeries(
  data: DataTblRow[],
  filters: Filters | undefined,
  measureFn: (data: DataTblRow[], filters?: Filters) => number,
): Array<{ date: string; value: number }> {
  const rows = applyFilters(data, filters);
  const uniqueDates = [...new Set(rows.map((r) => r.DATESTAMP))].sort();
  return uniqueDates.map((date) => ({
    date,
    value: measureFn(rows, { ...filters, asOf: date }),
  }));
}

// ─── Re-export all measures as a namespace for convenience ────────────────────

export const Measures = {
  pct100,
  pct25,
  pct50,
  pct75,
  pct95,
  pct99,
  avgColorFormatMinusMaxCurValue,
  avgCalc,
  avgCurValue,
  curValueRecordCount,
  maxCurval,
  measureMaxAAFPct,
  minCurval,
  stdevS,
  rolling3MonthsMinimum,
  rolling3MonthsMinimumMaxPerDatestamp,
  rolling3MonthsMinMaxPerDatestampDivByColorFormatForFlow,
  rolling30DayAverage,
  /** Utility for generating chart time-series from any rolling measure. */
  rollingTimeSeries,
} as const;
