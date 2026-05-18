// Renders bar/line/area charts from the `xy` / `xy_series` data shape
// produced by the aggregator.

import { h } from "preact";
import htm from "htm";
import { ChartWrap, PALETTE } from "./chart-base.js";
const html = htm.bind(h);

// Inline data-labels plugin: draws a short string inside each bar segment.
// Enabled via options.plugins.inlineLabels = true; label produced from ctx.
const inlineLabelsPlugin = {
  id: "inlineLabels",
  afterDatasetsDraw(chart, _args, opts) {
    if (!opts || !opts.enabled) return;
    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = "#f4fbfd";
    ctx.font = "600 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    chart.data.datasets.forEach((ds, dsIdx) => {
      const meta = chart.getDatasetMeta(dsIdx);
      if (meta.hidden) return;
      meta.data.forEach((bar, i) => {
        const v = ds.data[i];
        if (v == null || v < 6) return;  // skip tiny slivers
        const { x, y, base } = bar.getProps(["x", "y", "base"], true);
        const cx = x, cy = (y + base) / 2;
        ctx.fillText(`${Math.round(v)}%`, cx, cy);
      });
    });
    ctx.restore();
  },
};
Chart.register(inlineLabelsPlugin);

// Mapping: visual.type -> Chart.js type + default dataset extras
const TYPE_MAP = {
  clusteredColumnChart:            { chartType: "bar",  extra: {} },
  columnChart:                     { chartType: "bar",  extra: {} },
  hundredPercentStackedColumnChart:{ chartType: "bar",  extra: { stack: "s" } },
  lineChart:                       { chartType: "line", extra: { tension: 0.2 } },
  areaChart:                       { chartType: "line", extra: { tension: 0.2, fill: "origin" } },
};

// Normalize series so each column sums to 100 (for 100%-stacked).
// Negative values are clamped to 0 first (over-limit plants just show 100%/0%).
function normalize100(series) {
  if (!series || !series.length) return series;
  const n = series[0].values.length;
  // Clamp negatives to 0
  const cleaned = series.map(s => ({
    ...s,
    values: s.values.map(v => Math.max(0, v || 0)),
  }));
  // Compute per-column totals
  const totals = Array(n).fill(0);
  for (const s of cleaned) {
    for (let i = 0; i < n; i++) totals[i] += s.values[i];
  }
  // Renormalize
  return cleaned.map(s => ({
    ...s,
    values: s.values.map((v, i) => totals[i] ? v / totals[i] * 100 : 0),
  }));
}

export function XYChart({ visual }) {
  const d = visual.data;
  if (!d) return null;
  const { chartType, extra } = TYPE_MAP[visual.type] || { chartType: "bar", extra: {} };
  const is100Stacked = visual.type === "hundredPercentStackedColumnChart";

  // Optional per-visual overrides (set in build_pages.py for specific charts)
  const seriesLabels = visual.series_labels || null;     // e.g. ["Capacity Utilized", "Capacity Remaining"]
  const colorOverride = visual.colors || null;           // e.g. ["#6aaed6", "#bdbdbd"]
  const showDataLabels = !!visual.show_data_labels;

  let datasets;
  if (d.shape === "xy_series") {
    const series = is100Stacked ? normalize100(d.series) : d.series;
    datasets = series.map((s, i) => {
      const c = colorOverride ? colorOverride[i % colorOverride.length] : PALETTE[i % PALETTE.length];
      return {
        label: seriesLabels ? seriesLabels[i] : s.name,
        data: s.values,
        backgroundColor: c,
        borderColor:     c,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        ...extra,
      };
    });
  } else if (d.shape === "xy") {
    datasets = [{
      label: visual.title || "",
      data: d.y,
      backgroundColor: PALETTE[0],
      borderColor: PALETTE[0],
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3,
      ...extra,
    }];
  } else {
    return null;
  }

  const hasMultipleSeries = d.shape === "xy_series" && d.series.length > 1;

  const chartData = { labels: d.x, datasets };
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: hasMultipleSeries, position: "top", align: "end" },
      title:  visual.title ? { display: true, text: visual.title, color: "#f4fbfd" } : { display: false },
      tooltip: {
        mode: "index", intersect: false,
        callbacks: is100Stacked ? {
          label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1)}%`,
        } : undefined,
      },
      inlineLabels: { enabled: showDataLabels },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 40, autoSkip: true }, grid: { color: "rgba(43,74,84,0.3)" } },
      y: { beginAtZero: true, grid: { color: "rgba(43,74,84,0.3)" } },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    animation: false,
  };
  if (is100Stacked) {
    options.scales.x.stacked = true;
    options.scales.y.stacked = true;
    options.scales.y.max = 100;
    options.scales.y.ticks = { callback: v => `${v}%` };
  }

  return html`<${ChartWrap} type=${chartType} data=${chartData} options=${options} />`;
}
