export const CUSTOM_DATE_RANGE_KEY = "custom";

export const DATE_DAY_RANGES = {
  last_30_days: 30,
  last_90_days: 90,
  last_12_months: 365,
  last_5_years: 1825,
  all_time: null,
};

function parseIsoDate(value) {
  if (!value) return null;
  const parts = String(value).slice(0, 10).split("-").map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function formatIsoDate(dt) {
  return dt ? dt.toISOString().slice(0, 10) : "";
}

function addUtcDays(value, days) {
  const dt = parseIsoDate(value);
  if (!dt) return "";
  dt.setUTCDate(dt.getUTCDate() + days);
  return formatIsoDate(dt);
}

function startOfUtcMonth(value) {
  const dt = parseIsoDate(value);
  if (!dt) return "";
  dt.setUTCDate(1);
  return formatIsoDate(dt);
}

function addUtcMonths(value, months) {
  const dt = parseIsoDate(value);
  if (!dt) return "";
  const yearMonth = (dt.getUTCFullYear() * 12 + dt.getUTCMonth()) + months;
  const year = Math.floor(yearMonth / 12);
  const month = yearMonth % 12;
  return formatIsoDate(new Date(Date.UTC(year, month, 1)));
}

function normalizeBounds(start, end) {
  const a = start ? String(start).slice(0, 10) : "";
  const b = end ? String(end).slice(0, 10) : "";
  if (!a && !b) return null;
  if (!a) return { start: b, end: b };
  if (!b) return { start: a, end: a };
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

export function withCustomDateOption(options = []) {
  if (options.some((opt) => opt?.key === CUSTOM_DATE_RANGE_KEY)) return options;
  return [...options, { key: CUSTOM_DATE_RANGE_KEY, label: "Custom range" }];
}

export function getPresetBounds(range, anchorDate, config = {}) {
  if (!range || range === "all_time" || range === CUSTOM_DATE_RANGE_KEY || !anchorDate) return null;

  const calendarMonthRanges = config.calendarMonthRanges || {};
  const calendarMonths = calendarMonthRanges[range];
  if (calendarMonths) {
    const monthStart = startOfUtcMonth(anchorDate);
    if (!monthStart) return null;
    return normalizeBounds(
      addUtcMonths(monthStart, -calendarMonths),
      addUtcDays(monthStart, -1),
    );
  }

  const days = DATE_DAY_RANGES[range];
  if (!days) return null;
  return normalizeBounds(addUtcDays(anchorDate, -days), formatIsoDate(parseIsoDate(anchorDate)));
}

export function getActiveBounds({ range, anchorDate, customStart, customEnd, calendarMonthRanges }) {
  if (range === CUSTOM_DATE_RANGE_KEY) {
    return normalizeBounds(customStart, customEnd);
  }
  return getPresetBounds(range, anchorDate, { calendarMonthRanges });
}

export function inferSeriesBounds(data) {
  const xs = data?.x || [];
  if (!xs.length) return null;
  const dates = xs.map((x) => String(x).slice(0, 10)).filter(Boolean);
  if (!dates.length) return null;
  return normalizeBounds(dates[0], dates[dates.length - 1]);
}

export function inferMonthMatrixBounds(data) {
  const months = data?.months || [];
  if (!months.length) return null;
  const first = months[0];
  const last = months[months.length - 1];
  return normalizeBounds(
    `${first.yr}-${String(first.mo).padStart(2, "0")}-01`,
    `${last.yr}-${String(last.mo).padStart(2, "0")}-01`,
  );
}

export function filterSeriesByBounds(data, bounds) {
  if (!data || !bounds?.start || !bounds?.end) return data;
  const xs = data.x || [];
  const keep = [];
  for (let i = 0; i < xs.length; i += 1) {
    const x = String(xs[i]).slice(0, 10);
    if (x >= bounds.start && x <= bounds.end) keep.push(i);
  }
  if (keep.length === xs.length) return data;
  return {
    ...data,
    x: keep.map((i) => xs[i]),
    series: (data.series || []).map((series) => ({
      ...series,
      values: keep.map((i) => series.values?.[i]),
    })),
    y: data.y ? keep.map((i) => data.y[i]) : undefined,
  };
}

export function filterMonthMatrixByBounds(data, bounds) {
  if (!data || !bounds?.start || !bounds?.end) return data;
  const months = (data.months || []).filter(({ yr, mo }) => {
    const key = `${yr}-${String(mo).padStart(2, "0")}-01`;
    return key >= bounds.start && key <= bounds.end;
  });
  if (months.length === (data.months || []).length) return data;

  const grouped = new Map();
  const values = {};
  for (const { yr, mo } of months) {
    const key = `${yr}-${mo}`;
    const value = data.values?.[key];
    values[key] = value;
    if (!grouped.has(yr)) grouped.set(yr, []);
    if (value != null) grouped.get(yr).push(value);
  }
  for (const [yr, yrValues] of grouped.entries()) {
    if (!yrValues.length) {
      values[`${yr}-total`] = null;
    } else if (data.agg === "sum") {
      values[`${yr}-total`] = yrValues.reduce((sum, value) => sum + value, 0);
    } else {
      values[`${yr}-total`] = yrValues.reduce((sum, value) => sum + value, 0) / yrValues.length;
    }
  }
  return { ...data, months, values };
}

export function getRoleSeries(data, role) {
  const series = data?.series || [];
  if (!series.length) return null;
  if (role == null) return series[0] || null;
  return series.find((item) => item.role === role) || null;
}

export function numericValues(values = []) {
  return values.filter((value) => typeof value === "number" && Number.isFinite(value));
}

export function maxNumeric(values = []) {
  const nums = numericValues(values);
  return nums.length ? Math.max(...nums) : null;
}

export function averageNumeric(values = []) {
  const nums = numericValues(values);
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

export function sampleStdDevNumeric(values = []) {
  const nums = numericValues(values);
  if (nums.length < 2) return nums.length === 1 ? 0 : null;
  const avg = averageNumeric(nums);
  const variance = nums.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

export function monthMatrixValues(data) {
  return (data?.months || []).map(({ yr, mo }) => data?.values?.[`${yr}-${mo}`]);
}
