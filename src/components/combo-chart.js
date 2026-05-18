// Line + column combo (dual Y axis)

import { h } from "preact";
import htm from "htm";
import { ChartWrap, PALETTE } from "./chart-base.js";
const html = htm.bind(h);

export function ComboChart({ visual }) {
  const d = visual.data;
  if (!d || d.shape !== "combo") return null;
  const colorOverride = visual.colors || null;

  const datasets = d.series.map((s, i) => {
    const isLine = s.role === "y2";
    const c = colorOverride ? colorOverride[i % colorOverride.length] : PALETTE[i % PALETTE.length];
    return {
      label: s.name,
      data: s.values,
      type: isLine ? "line" : "bar",
      yAxisID: isLine ? "y1" : "y",
      backgroundColor: c,
      borderColor:     c,
      borderWidth: isLine ? 2 : 1,
      pointRadius: 0,
      pointHoverRadius: 3,
      tension: 0,
      fill: false,
    };
  });

  const data = { labels: d.x, datasets };
  const hasRightAxis = d.series.some(s => s.role === "y2");
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { position: "top", align: "end" },
      title:  visual.title ? { display: true, text: visual.title, color: "#f4fbfd" } : { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x:  { ticks: { maxTicksLimit: 10, autoSkip: true }, grid: { color: "rgba(43,74,84,0.3)" } },
      y:  { beginAtZero: true, grid: { color: "rgba(43,74,84,0.3)" } },
      ...(hasRightAxis ? { y1: { position: "right", beginAtZero: true, grid: { display: false } } } : {}),
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    animation: false,
  };
  return html`<${ChartWrap} type="bar" data=${data} options=${options} />`;
}
