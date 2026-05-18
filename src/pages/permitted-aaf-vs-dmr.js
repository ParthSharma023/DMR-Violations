// Bespoke page for "Permitted AAF Vs DMR" — Historical Trends.
// Two monthly combo charts (bars + 75% dotted reference line) + two KPI cards.

import { h } from "preact";
import { useState, useMemo } from "preact/hooks";
import htm from "htm";
import { ChartWrap } from "../components/chart-base.js";
import {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  getRoleSeries,
  inferSeriesBounds,
  maxNumeric,
  withCustomDateOption,
} from "../date-range.js";
const html = htm.bind(h);

const C = {
  bg:     "#071425",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
};

function resolve(visual, plant, bounds) {
  if (!visual) return null;
  const base = (plant && visual.data_by_plant?.[plant]) ? visual.data_by_plant[plant] : visual.data;
  return filterSeriesByBounds(base, bounds);
}

// ── Combo chart: bars + 75% dotted reference line (same y-axis) ───
function TrendChart({ data, barLabel, barColor, height }) {
  if (!data) return html`<div style=${{ height: height||200, display:"grid", placeItems:"center", color:C.muted, fontSize:12 }}>No data</div>`;

  const xs      = data.x || [];
  const series  = data.series || [];
  const barS    = series.find(s => s.role === "y"  || !s.role);
  const lineS   = series.find(s => s.role === "y2");

  const datasets = [
    barS && {
      label: barS.name,
      data: barS.values || [],
      type: "bar",
      backgroundColor: barColor || "rgba(114,188,128,0.75)",
      borderColor:     barColor || "rgba(114,188,128,0.75)",
      borderWidth: 0,
      borderRadius: 2,
      order: 2,
      yAxisID: "y",
    },
    lineS && {
      label: lineS.name,
      data: lineS.values || [],
      type: "line",
      borderColor: "#c0392b",
      backgroundColor: "transparent",
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      spanGaps: true,
      order: 1,
      yAxisID: "y",
    },
  ].filter(Boolean);

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font: { size: 10 }, boxWidth: 8, padding: 8 } },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 8 }, maxTicksLimit: 14, autoSkip: true },
           grid: { color: "rgba(255,255,255,0.04)" } },
      y: { ticks: { color: C.muted, font: { size: 9 } },
           grid: { color: "rgba(255,255,255,0.04)" },
           beginAtZero: false,
           title: { display: true, text: "MGD", color: C.muted, font: { size: 9 } } },
    },
  };

  return html`
    <div style=${{ position:"relative", flex:1, minHeight:0 }}>
      <${ChartWrap} type="bar" data=${{ labels:xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── KPI card ──────────────────────────────────────────────────────
function KpiCard({ label, value }) {
  return html`
    <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`,
      border:`1px solid ${C.line}`, borderRadius:12, padding:"10px 16px", minWidth:150 }}>
      <div style=${{ fontSize:"1.8rem", fontWeight:800, color:C.text, lineHeight:1.1 }}>
        ${value != null ? value.toFixed(2) : "—"}
      </div>
      <div style=${{ color:C.muted, fontSize:11, marginTop:4, textTransform:"uppercase", letterSpacing:".04em" }}>
        ${label}
      </div>
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
export function PermittedAAFVsDMRPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const COMBO = new Set(["lineStackedColumnComboChart","lineClusteredColumnComboChart"]);
  const combos = visuals.filter(v => COMBO.has(v.type));
  const aafChart = combos.find(v => (v.title||"").toLowerCase().includes("annual average"));
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBase = (page.plant_slicer?.default && aafChart?.data_by_plant?.[page.plant_slicer.default]) || aafChart?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const aafVis = aafChart;
  const dmrVis = combos.find(v => (v.title||"").toLowerCase().includes("average daily"));
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const aafData = useMemo(() => resolve(aafVis, plant, activeBounds), [aafVis, plant, activeBounds]);
  const dmrData = useMemo(() => resolve(dmrVis, plant, activeBounds), [dmrVis, plant, activeBounds]);

  const cards = visuals.filter(v => v.type === "card");
  const evalCard    = cards.find(v => (v.title||"").toLowerCase().includes("evaluated"));
  const permitCard  = cards.find(v => (v.title||"").toLowerCase().includes("permitted flow") || (v.title||"").toLowerCase().includes("permitted flow"));

  const evalFallback   = (plant && evalCard?.data_by_plant?.[plant]?.value)   ?? evalCard?.data?.value   ?? null;
  const permitFallback = (plant && permitCard?.data_by_plant?.[plant]?.value) ?? permitCard?.data?.value ?? null;
  const evalVal = useMemo(() => {
    const series = getRoleSeries(aafData, "y") || getRoleSeries(aafData, null);
    return maxNumeric(series?.values) ?? evalFallback;
  }, [aafData, evalFallback]);
  const permitVal = permitFallback;

  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background:`radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height:"100vh", color:C.text, fontFamily:"Inter,system-ui,sans-serif",
      fontSize:14, padding:18, display:"grid", gap:10,
      gridTemplateRows:"auto auto 1fr 1fr auto", overflow:"hidden",
    }}>

      <!-- HEADER -->
      <header style=${{ display:"grid", gridTemplateColumns:"64px 1fr auto auto", gap:12, alignItems:"center" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, height:56, display:"grid", placeItems:"center",
            fontSize:24, color:C.muted, cursor:"pointer" }}>←</button>
        <div>
          <div style=${{ color:C.text, fontWeight:800, fontSize:22 }}>Historical Trends</div>
          <div style=${{ color:C.accent, fontSize:13, fontWeight:600 }}>
            Annual Average Flow (Permit Equivalent) Vs. Average Daily Flow (DMR) in MGD
          </div>
        </div>
        <div style=${{ display:"flex", flexDirection:"column", gap:4 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase" }}>WWTP</div>
          <select value=${plant} onChange=${e => setPlant(e.target.value)}
            style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10,
              background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13, minWidth:180 }}>
            ${plants.map(p => html`<option value=${p}>${p}</option>`)}
          </select>
        </div>
        <div style=${{ display:"flex", flexDirection:"column", gap:4 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10,
              background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13, minWidth:160 }}>
            ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display:"grid", gap:8, marginTop:8 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
            </div>
          `}
        </div>
      </header>

      <!-- KPI CARDS -->
      <div style=${{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <${KpiCard} label="Permit Evaluated Flow" value=${evalVal} />
        <${KpiCard} label="Permitted Flow"         value=${permitVal} />
      </div>

      <!-- ANNUAL AVERAGE FLOW CHART -->
      <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
        borderRadius:14, padding:"10px 16px", display:"flex", flexDirection:"column", minHeight:0 }}>
        <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>
          Annual Average Flow, MGD (Permit Evaluation), Reported Monthly
        </div>
        <${TrendChart} key=${"aaf-"+plant} data=${aafData} barColor="rgba(114,188,128,0.8)" />
      </div>

      <!-- MONTHLY DMR CHART -->
      <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
        borderRadius:14, padding:"10px 16px", display:"flex", flexDirection:"column", minHeight:0 }}>
        <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>
          Average Daily Flow, MGD (Monthly DMR)
        </div>
        <${TrendChart} key=${"dmr-"+plant} data=${dmrData} barColor="rgba(114,188,128,0.8)" />
      </div>

      <!-- FOOTER -->
      <footer style=${{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:11,
        paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <span>All flows in MGD. Annual avg = rolling 12-month average reported monthly. Data refreshed daily.</span>
        <span>Last refresh: ${refresh}</span>
      </footer>
    </div>
  `;
}
