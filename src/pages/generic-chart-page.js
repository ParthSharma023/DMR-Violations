// Generic bespoke chart page — same layout as daily-effluent-flow.js.
// Auto-discovers data-bound charts from page.visuals and renders them
// as bar charts with WWTP sidebar + date range selector.
// Used for: Charts Daily Influent/Effluent, DMR 5yr pages, etc.

import { h } from "preact";
import { useState, useMemo } from "preact/hooks";
import htm from "htm";
import { ChartWrap } from "../components/chart-base.js";
const html = htm.bind(h);

const C = {
  bg:     "#071425",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
};

// Chart colours — cycled across multiple charts per page
const COLORS = ["#8d6be8", "#27d7d7", "#ef9447", "#72c98f", "#d74c45", "#5da8ff", "#f2c14e"];

// ── Client-side date window filter ────────────────────────────────
function applyDateWindow(d, anchorStr, days) {
  if (!d || !days || !anchorStr) return d;
  const cutoff = new Date(anchorStr);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const xs = d.x || [];
  const keep = [];
  for (let i = 0; i < xs.length; i++) if (xs[i] >= cutoffStr) keep.push(i);
  if (keep.length === xs.length) return d;
  return {
    ...d,
    x: keep.map(i => xs[i]),
    series: (d.series || []).map(s => ({ ...s, values: keep.map(i => s.values[i]) })),
    y: d.y ? keep.map(i => d.y[i]) : undefined,
  };
}

const DATE_DAYS = { last_30_days: 30, last_90_days: 90, last_12_months: 365, last_5_years: 1825, all_time: null };

function resolveData(visual, plant, range, anchor) {
  if (!visual) return null;
  const days = DATE_DAYS[range] ?? null;
  const byPlant = visual.data_by_plant;
  const base = (plant && byPlant?.[plant]) ? byPlant[plant] : visual.data;
  return applyDateWindow(base, anchor, days);
}

// Clean up series name for chart title — strip leading plant-code prefix
// e.g. "69 Plnt If CBOD" → "Plnt If CBOD"
function cleanSeriesName(name) {
  if (!name) return "Value";
  return name.replace(/^[A-Z0-9]{2,4}\s+/, "");
}

// ── Bar chart ─────────────────────────────────────────────────────
function BarChart({ data, color, limitColor, height = 160 }) {
  if (!data) return null;
  const xs = data.x || [];
  const series = data.series || [];
  const mainS  = series.find(s => s.role === "y"  || !s.role) || series[0];
  const limitS = series.find(s => s.role === "y2") || null;
  if (!mainS || !xs.length) return html`
    <div style=${{ height, display: "grid", placeItems: "center", color: C.muted, fontSize: 12 }}>
      No data for this selection
    </div>`;

  // Chart label: clean the series name
  const serLabel = cleanSeriesName(mainS.name);

  const datasets = [{
    label: serLabel,
    data: mainS.values || [],
    backgroundColor: color,
    borderColor: color,
    borderWidth: 0,
    borderRadius: 2,
    type: "bar",
  }];

  if (limitS) {
    const limitVal = (limitS.values || []).find(v => v != null);
    if (limitVal != null) {
      datasets.push({
        label: "Limit",
        data: Array(xs.length).fill(limitVal),
        type: "line",
        borderColor: limitColor || "#d74c45",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }
  }

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font: { size: 11 }, boxWidth: 10, padding: 10 } },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 10 },
           grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: C.muted, font: { size: 9 } },
           grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true },
    },
  };

  return html`
    <div style=${{ position: "relative", height }}>
      <${ChartWrap} type="bar" data=${{ labels: xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── Resolved chart card (owns the useMemo) ────────────────────────
function ChartCardResolved({ visual, plant, range, anchor, color, titleFn }) {
  const d = useMemo(() => resolveData(visual, plant, range, anchor), [visual, plant, range, anchor]);
  const title = titleFn(visual, plant);
  return html`<${ChartCard} title=${title} data=${d} color=${color} height=${160} />`;
}

// ── Chart card ────────────────────────────────────────────────────
function ChartCard({ title, data, color, height }) {
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px",
    }}>
      <h2 style=${{ margin: "0 0 6px", fontSize: 15, color: C.accent }}>${title}</h2>
      <${BarChart} data=${data} color=${color} height=${height || 160} />
    </div>
  `;
}

// ── KPI card ──────────────────────────────────────────────────────
function KpiCard({ visual, plant }) {
  const d = plant && visual.data_by_plant?.[plant] ? visual.data_by_plant[plant] : visual.data;
  const val = d?.value;
  const formatted = val == null ? "—"
    : typeof val === "number" ? val.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : String(val);
  const label = (visual.projections?.Values?.[0] || "").replace(/^.*?\./, "").replace(/^[A-Z]\w*\(/, "").replace(/\)$/, "");
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 16px",
      textAlign: "center",
    }}>
      <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>${label}</div>
      <div style=${{ fontSize: "1.5rem", fontWeight: 800, color: C.accent }}>${formatted}</div>
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
export function GenericChartPage({ page, currentDateRange }) {
  const visuals    = page.visuals || [];
  const plants     = page.plant_slicer?.options || [];
  const dateOpts   = page.date_slicer?.options  || [];
  const anchor     = page.date_slicer?.anchor_date || "";

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState(currentDateRange || page.date_slicer?.default || "last_5_years");

  // Find all data-bound chart visuals (area, combo, line, bar)
  const CHART_TYPES = new Set(["areaChart","lineChart","clusteredColumnChart","columnChart",
    "lineClusteredColumnComboChart","lineStackedColumnComboChart",
    "hundredPercentStackedColumnChart"]);
  const charts = visuals.filter(v => CHART_TYPES.has(v.type) && (v.data || v.data_by_plant));

  // Find KPI cards (has data, is a card)
  const cards = visuals.filter(v => v.type === "card" && (v.data || v.data_by_plant));

  // Derive a readable title for each chart from its series data
  function chartTitle(visual) {
    if (visual.title && !visual.title.includes("Recorded Value")) return visual.title;
    const d = visual.data_by_plant?.[plant] || visual.data || {};
    const series = d.series || [];
    if (series[0]?.name) return cleanSeriesName(series[0].name).replace(/Plnt\s+(If|Ef)\s+/, "Influent: ").replace(/Plnt\s+/, "").trim();
    return "Value";
  }

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));

  // Build page title from display name (strip PBIX cruft)
  const pageTitle = (page.display_name || "")
    .replace(/^DT\s*\(?Chart\)?\s*/i, "")
    .replace(/^DT\s*\(DMR\s*5yr\)?\s*/i, "")
    .replace(/^DT\s*/i, "")
    .trim();

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14, overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 12 }}>

        <!-- TOP ROW -->
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
          <button onClick=${() => window.history.back()}
            style=${{
              height: 64, background: `linear-gradient(180deg,${C.card},#0d2139)`,
              border: `1px solid ${C.line}`, borderRadius: 14,
              color: C.muted, fontSize: 28, cursor: "pointer",
              display: "grid", placeItems: "center",
            }}>←</button>
          <div>
            <small style=${{ display: "block", color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System
              <span style=${{ color: C.accent }}> · ${pageTitle}</span>
            </h1>
          </div>
          <div style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`, borderRadius: 14,
            padding: "12px 14px", minWidth: 220,
          }}>
            <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Date Range</div>
            <select value=${range} onChange=${e => setRange(e.target.value)}
              style=${{ marginTop: 8, width: "100%", padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 10, background: "#0b1c31", color: C.text, fontFamily: "inherit", fontSize: 13 }}>
              ${dateOpts.map(o => html`<option value=${o.key}>${o.label}</option>`)}
            </select>
          </div>
        </div>

        <!-- KPI CARDS ROW (if any) -->
        ${cards.length > 0 && html`
          <div style=${{ display: "grid", gridTemplateColumns: `repeat(${Math.min(cards.length,4)}, 1fr)`, gap: 10 }}>
            ${cards.slice(0, 4).map((c, i) => html`<${KpiCard} key=${i} visual=${c} plant=${plant} />`)}
          </div>
        `}

        <!-- MAIN LAYOUT -->
        <div style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>

          <!-- SIDEBAR -->
          <aside style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`, borderRadius: 14, padding: 12,
            maxHeight: "calc(100vh - 240px)", overflow: "auto",
          }}>
            <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
            <input placeholder="Search WWTP" value=${search} onInput=${e => setSearch(e.target.value)}
              style=${{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1a2e", color: C.text, fontFamily: "inherit", fontSize: 12, marginBottom: 8 }}
            />
            <div style=${{ display: "grid", gap: 4 }}>
              ${filteredPlants.map(p => html`
                <label key=${p} style=${{
                  display: "flex", gap: 8, alignItems: "center", padding: "5px 6px",
                  borderRadius: 8, cursor: "pointer", fontSize: 12,
                  background: p === plant ? "rgba(39,215,215,0.12)" : "transparent",
                  color: p === plant ? C.accent : C.muted,
                }}>
                  <input type="radio" name="plant" checked=${p === plant} onChange=${() => setPlant(p)}
                    style=${{ accentColor: C.accent }} />
                  ${p}
                </label>
              `)}
            </div>
          </aside>

          <!-- CHARTS -->
          <main style=${{ display: "grid", gap: 12 }}>
            ${charts.map((vis, i) => html`<${ChartCardResolved}
              key=${i}
              visual=${vis}
              plant=${plant}
              range=${range}
              anchor=${anchor}
              color=${COLORS[i % COLORS.length]}
              titleFn=${chartTitle}
            />`)}
          </main>
        </div>

        <!-- FOOTER -->
        <div style=${{ display: "flex", justifyContent: "space-between", color: C.muted, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,0.08)`, fontSize: 11 }}>
          <span>All flows in mgd (million gallons per day). Data refreshed daily.</span>
          <span>Questions or feedback? Contact <a href="mailto:" style=${{ color: "#5da8ff" }}>WWIP Support</a></span>
        </div>
      </div>
    </div>
  `;
}
