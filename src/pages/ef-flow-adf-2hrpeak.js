// Bespoke page for "ADF_2HrPeak_to_Download" — Effluent Flow | ADF and 2-hour Peak.
// Three stacked daily charts: Average Daily Flow, Rainfall, and 2-hr Peak with permit line.

import { h } from "preact";
import { useState } from "preact/hooks";
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

// ── Single daily bar chart ─────────────────────────────────────────
function DailyChart({ data, barColor, limitColor, yLabel }) {
  if (!data) return html`<div style=${{ flex:1, display:"grid", placeItems:"center", color:C.muted, fontSize:12 }}>No data</div>`;

  const xs      = data.x || [];
  const series  = data.series || [];
  const barS    = series.find(s => s.role === "y"  || !s.role);
  const limitS  = series.find(s => s.role === "y2");

  const datasets = [
    barS && {
      label: barS.name,
      data: barS.values || [],
      type: "bar",
      backgroundColor: barColor,
      borderColor: barColor,
      borderWidth: 0,
      borderRadius: 1,
      order: 2,
    },
    limitS && {
      label: limitS.name,
      data: limitS.values || [],
      type: "line",
      borderColor: limitColor || "#c0392b",
      backgroundColor: "transparent",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
      spanGaps: true,
      order: 1,
    },
  ].filter(Boolean);

  const allVals = [barS, limitS].filter(Boolean).flatMap(s => s.values || []).filter(v => v != null);
  const sharedMax = allVals.length ? Math.max(...allVals) * 1.1 : undefined;

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font:{size:10}, boxWidth:8, padding:8 } },
      tooltip: { mode:"index", intersect:false },
    },
    scales: {
      x: { ticks:{ color:C.muted, font:{size:8}, maxTicksLimit:10, autoSkip:true },
           grid:{ color:"rgba(255,255,255,0.04)" } },
      y: {
        ticks:{ color:C.muted, font:{size:9} },
        grid:{ color:"rgba(255,255,255,0.04)" },
        beginAtZero: true,
        max: sharedMax,
        title:{ display: !!yLabel, text: yLabel || "", color:C.muted, font:{size:9} },
      },
    },
  };

  return html`
    <div style=${{ position:"relative", flex:1, minHeight:0 }}>
      <${ChartWrap} type="bar" data=${{ labels:xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── Permit table ───────────────────────────────────────────────────
function PermitTable({ visual, plant }) {
  const d = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  if (!d) return null;
  const columns = d.columns || [];
  const rows    = d.rows    || [];
  const labels  = visual.column_labels || {};
  const headers = columns.map(c => labels[c] || c);
  return html`
    <div style=${{ overflowX:"auto" }}>
      <table style=${{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
        <thead><tr>${headers.map(h => html`
          <th key=${h} style=${{ padding:"5px 8px", textAlign:"left", color:C.muted,
            borderBottom:`1px solid ${C.line}`, fontWeight:600, fontSize:10,
            textTransform:"uppercase", letterSpacing:".04em", whiteSpace:"nowrap" }}>${h}</th>
        `)}</tr></thead>
        <tbody>${rows.map((row, ri) => html`
          <tr key=${ri} style=${{ borderBottom:"1px solid rgba(255,255,255,.03)" }}>
            ${row.map((cell, ci) => html`
              <td key=${ci} style=${{ padding:"4px 8px", color:C.text, whiteSpace:"nowrap" }}>${cell ?? "—"}</td>
            `)}
          </tr>
        `)}</tbody>
      </table>
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
export function EfFlowADF2hrPeakPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || "last_12_months";
  const COMBO = new Set(["lineClusteredColumnComboChart","lineStackedColumnComboChart"]);
  const combos = visuals.filter(v => COMBO.has(v.type));
  const initialAdf = combos.find(v => (v.title||"").toLowerCase().includes("average daily"));
  const initialBase = (page.plant_slicer?.default && initialAdf?.data_by_plant?.[page.plant_slicer.default]) || initialAdf?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant,  setPlant]  = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  // PBIX default is 12 months for this daily-data page
  const [range,  setRange]  = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const tableVis = visuals.find(v => v.type === "tableEx");
  const dateOptions = withCustomDateOption(dateOpts);
  const activeBounds = getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  });

  const adfVis    = combos.find(v => (v.title||"").toLowerCase().includes("average daily"));
  const peakVis   = combos.find(v => (v.title||"").toLowerCase().includes("2-hr"));
  const rainVis   = combos.find(v => (v.title||"").toLowerCase().includes("rainfall"));

  const adfData  = resolve(adfVis,  plant, activeBounds);
  const rainData = resolve(rainVis, plant, activeBounds);
  const peakData = resolve(peakVis, plant, activeBounds);

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background:`radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height:"100vh", color:C.text, fontFamily:"Inter,system-ui,sans-serif",
      fontSize:14, padding:18, display:"grid", gap:12,
      gridTemplateRows:"auto 1fr auto", overflow:"hidden",
    }}>

      <!-- HEADER -->
      <header style=${{ display:"grid", gridTemplateColumns:"64px 1fr auto", gap:14, alignItems:"start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, height:64, display:"grid", placeItems:"center",
            fontSize:28, color:C.muted, cursor:"pointer" }}>←</button>
        <div>
          <small style=${{ display:"block", color:C.accent, fontWeight:700, textTransform:"uppercase",
            letterSpacing:".04em", fontSize:11, marginBottom:4 }}>
            City of Houston — Public Works &amp; Engineering
          </small>
          <h1 style=${{ margin:0, fontSize:26, fontWeight:800, lineHeight:1.05 }}>
            WWiP Plant-Intelligence-System
            <span style=${{ color:C.accent }}> · Effluent Flow | ADF and 2-hour Peak</span>
          </h1>
        </div>
        <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
          borderRadius:14, padding:"12px 14px", minWidth:210 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:".04em" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ marginTop:8, width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`,
              borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }}>
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
      </header>

      <!-- MAIN -->
      <main style=${{ display:"grid", gridTemplateColumns:"220px 1fr", gap:12, minHeight:0 }}>

        <!-- WWTP SIDEBAR -->
        <aside style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
          borderRadius:14, padding:12, overflow:"auto" }}>
          <h3 style=${{ margin:"0 0 8px", color:C.accent, fontSize:13 }}>WWTP</h3>
          <input placeholder="Search WWTP" value=${search} onInput=${e => setSearch(e.target.value)}
            style=${{ width:"100%", padding:"8px 10px", borderRadius:10, border:`1px solid ${C.line}`,
              background:"#0a1a2e", color:C.text, fontFamily:"inherit", fontSize:12, marginBottom:8 }} />
          <div style=${{ display:"grid", gap:4 }}>
            ${filteredPlants.map(p => html`
              <label key=${p} style=${{ display:"flex", gap:8, alignItems:"center", padding:"5px 6px",
                borderRadius:8, cursor:"pointer", fontSize:12,
                background:p===plant?"rgba(39,215,215,0.12)":"transparent",
                color:p===plant?C.accent:C.muted }}>
                <input type="radio" name="plant" checked=${p===plant}
                  onChange=${()=>setPlant(p)} style=${{ accentColor:C.accent }} />${p}
              </label>
            `)}
          </div>
        </aside>

        <!-- CONTENT -->
        <div style=${{ display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>

          <!-- PERMIT TABLE -->
          ${tableVis && html`
            <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
              borderRadius:14, padding:"10px 14px", flexShrink:0 }}>
              <div style=${{ fontWeight:700, fontSize:11, color:C.muted, marginBottom:6,
                textTransform:"uppercase", letterSpacing:".04em" }}>Permit Limits</div>
              <${PermitTable} visual=${tableVis} plant=${plant} />
            </div>
          `}

          <!-- ADF CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, padding:"10px 14px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>Average Daily Flow, MGD</div>
            <${DailyChart} data=${adfData} barColor="rgba(114,201,143,0.8)" yLabel="MGD" />
          </div>

          <!-- RAINFALL CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, padding:"10px 14px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>Rainfall Depth, Inch</div>
            <${DailyChart} data=${rainData} barColor="rgba(167,139,250,0.8)" yLabel="Inches" />
          </div>

          <!-- 2-HR PEAK CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, padding:"10px 14px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>2-hr Peak Flow, GPM</div>
            <${DailyChart} data=${peakData} barColor="rgba(251,146,60,0.8)" limitColor="#c0392b" yLabel="GPM" />
          </div>

        </div>
      </main>

      <!-- FOOTER -->
      <footer style=${{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:11,
        paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <span>ADF in MGD · 2-hr Peak in GPM · Rainfall in inches. Data refreshed daily.</span>
        <span>Last refresh: ${refresh}</span>
      </footer>
    </div>
  `;
}
