// Bespoke page for DT Daily Effluent Flow (dt-daily-effluent-flow).
// Renders as: back btn + title | WWTP sidebar | meta row + 3 bar charts.

import { h, Fragment } from "preact";
import { useState, useMemo } from "preact/hooks";
import htm from "htm";
import { ChartWrap } from "../components/chart-base.js";
import {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  inferSeriesBounds,
  withCustomDateOption,
} from "../date-range.js";
const html = htm.bind(h);

const C = {
  bg:     "#071425",
  bg2:    "#0c1d34",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
  purple: "#8d6be8",
  orange: "#ef9447",
  green:  "#72c98f",
  red:    "#d74c45",
};

// ── Find a visual by title substring ──────────────────────────────
function findVis(visuals, substr) {
  return visuals.find(v => (v.title || "").toLowerCase().includes(substr.toLowerCase()));
}

// ── Get best data for a visual given plant + date range ───────────
function resolve(visual, plant, bounds) {
  if (!visual) return null;
  const byPlant = visual.data_by_plant;
  if (plant && byPlant?.[plant]) {
    return filterSeriesByBounds(byPlant[plant], bounds);
  }
  return filterSeriesByBounds(visual.data, bounds);
}

// ── Bar chart component ────────────────────────────────────────────
function BarChart({ title, icon, data, color, limitColor, height = 160 }) {
  if (!data) return null;
  const xs    = data.x || [];
  const series = data.series || [];
  const mainS  = series.find(s => s.role === "y"  || !s.role) || series[0];
  const limitS = series.find(s => s.role === "y2") || null;
  if (!mainS) return null;

  const datasets = [{
    label: mainS.name,
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
        label: limitS.name,
        data: Array(xs.length).fill(limitVal),
        type: "line",
        borderColor: limitColor || C.red,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }
  }

  const chartData = { labels: xs, datasets };
  const opts = {
    responsive: true, maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font: { size: 11 }, boxWidth: 10, padding: 10 } },
      tooltip: { mode: "index", intersect: false,
        callbacks: { title: ctx => ctx[0]?.label || "" } },
    },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 8 },
           grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: C.muted, font: { size: 9 } },
           grid: { color: "rgba(255,255,255,0.05)" },
           beginAtZero: true },
    },
  };

  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`, borderRadius: 14,
      padding: "14px 16px",
    }}>
      <h2 style=${{ margin: "0 0 4px", fontSize: 16, color: C.accent, display: "flex", alignItems: "center", gap: 8 }}>
        <span>${icon}</span>${title}
      </h2>
      <div style=${{ position: "relative", height }}>
        <${ChartWrap} type="bar" data=${chartData} options=${opts} />
      </div>
    </div>
  `;
}

// ── Meta row (top table) ───────────────────────────────────────────
function MetaRow({ tableVis, plant }) {
  if (!tableVis?.data) return html`
    <div style=${{ background: `linear-gradient(180deg,${C.card},#0d2139)`, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 16px", color: C.muted, fontSize: 12 }}>
      Permit table loading…
    </div>
  `;
  const { columns, rows } = tableVis.data;
  const row = plant ? rows.find(r => r[0] === plant) || rows[0] : rows[0];
  if (!row) return null;
  const headers = columns.map(c => c.replace(/^.*?\./, "").replace(/^[A-Z]\w*\(/, "").replace(/\)$/, ""));
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`, borderRadius: 14,
      display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
      overflow: "hidden",
    }}>
      ${headers.map((h, i) => html`
        <div key=${i} style=${{
          padding: "10px 14px",
          borderRight: i < headers.length - 1 ? `1px solid ${C.line}` : "none",
        }}>
          <div style=${{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>${h}</div>
          <div style=${{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            ${typeof row[i] === "number" ? row[i].toLocaleString(undefined, { maximumFractionDigits: 2 }) : (row[i] ?? "—")}
          </div>
        </div>
      `)}
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
export function DailyEffluentFlowPage({ page, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || "last_12_months";
  const initialFlow = findVis(visuals, "Average Daily Flow");
  const initialBase = (page.plant_slicer?.default && initialFlow?.data_by_plant?.[page.plant_slicer.default]) || initialFlow?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant, setPlant]   = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const tableVis  = findVis(visuals, "");                    // tableEx (no title — first one)
  const flowVis   = findVis(visuals, "Average Daily Flow");
  const peakVis   = findVis(visuals, "2-hr Peak");
  const rainVis   = findVis(visuals, "Rainfall");

  // tableEx specifically — find by type
  const tableExVis = visuals.find(v => v.type === "tableEx");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const flowData  = useMemo(() => resolve(flowVis,  plant, activeBounds), [flowVis,  plant, activeBounds]);
  const peakData  = useMemo(() => resolve(peakVis,  plant, activeBounds), [peakVis,  plant, activeBounds]);
  const rainData  = useMemo(() => resolve(rainVis,  plant, activeBounds), [rainVis,  plant, activeBounds]);

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const rangeLabel = dateOpts.find(o => o.key === range)?.label || range;

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh", color: C.text,
      fontFamily: "Inter, system-ui, sans-serif", fontSize: 14,
      overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 12 }}>

        <!-- TOP ROW -->
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
          <!-- Back button -->
          <button onClick=${() => { window.location.hash = "#/home"; }}
            style=${{
              height: 64, background: `linear-gradient(180deg,${C.card},#0d2139)`,
              border: `1px solid ${C.line}`, borderRadius: 14,
              color: C.muted, fontSize: 28, cursor: "pointer", display: "grid", placeItems: "center",
            }}>←</button>

          <!-- Title -->
          <div>
            <small style=${{ display: "block", color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· Effluent Flow | ADF and 2-hour Peak</span>
            </h1>
          </div>

          <!-- Date selector -->
          <div style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`, borderRadius: 14,
            padding: "12px 14px", minWidth: 220,
          }}>
            <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Datestamp</div>
            <select value=${range} onChange=${e => setRange(e.target.value)}
              style=${{
                marginTop: 8, width: "100%", padding: "8px 10px",
                border: `1px solid ${C.line}`, borderRadius: 10,
                background: "#0b1c31", color: C.text, fontFamily: "inherit", fontSize: 13,
              }}>
              ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
            </select>
            ${range === CUSTOM_DATE_RANGE_KEY && html`
              <div style=${{ display:"grid", gap:8, marginTop:10 }}>
                <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                  style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
                <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                  style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              </div>
            `}
          </div>
        </div>

        <!-- PERMIT META ROW -->
        <${MetaRow} tableVis=${tableExVis} plant=${plant} />

        <!-- MAIN LAYOUT -->
        <div style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>

          <!-- SIDEBAR -->
          <aside style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`, borderRadius: 14, padding: 12,
            maxHeight: "calc(100vh - 280px)", overflow: "auto",
          }}>
            <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
            <input
              placeholder="Search WWTP"
              value=${search}
              onInput=${e => setSearch(e.target.value)}
              style=${{
                width: "100%", padding: "8px 10px",
                borderRadius: 10, border: `1px solid ${C.line}`,
                background: "#0a1a2e", color: C.text,
                fontFamily: "inherit", fontSize: 12, marginBottom: 8,
              }}
            />
            <div style=${{ display: "grid", gap: 5 }}>
              ${filteredPlants.map(p => html`
                <label key=${p} style=${{
                  display: "flex", gap: 8, alignItems: "center",
                  padding: "5px 6px", borderRadius: 8, cursor: "pointer",
                  background: p === plant ? "rgba(39,215,215,0.12)" : "transparent",
                  color: p === plant ? C.accent : C.muted,
                  fontSize: 12,
                }}>
                  <input type="radio" name="plant" value=${p} checked=${p === plant}
                    onChange=${() => setPlant(p)}
                    style=${{ accentColor: C.accent }} />
                  ${p}
                </label>
              `)}
            </div>
          </aside>

          <!-- CHARTS -->
          <main style=${{ display: "grid", gap: 12 }}>
            <${BarChart}
              title="Average Daily Flow, MGD"
              icon="📈" data=${flowData}
              color=${C.purple} height=${160}
            />
            <${BarChart}
              title="Rainfall Depth, Inch"
              icon="🌧" data=${rainData}
              color=${C.orange} height=${130}
            />
            <${BarChart}
              title="2-hr Peak Flow, GPM"
              icon="⚡" data=${peakData}
              color=${C.green} limitColor=${C.red} height=${170}
            />
          </main>
        </div>

      </div>
    </div>
  `;
}
