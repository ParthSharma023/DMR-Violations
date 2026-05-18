// Bespoke page for Permit Evaluation AAF (dt-permit-evaluation-aaf).
// Same layout family as daily-effluent-flow.js.

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
  averageNumeric,
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
  const base = (plant && visual?.data_by_plant?.[plant]) ? visual.data_by_plant[plant] : visual?.data;
  return filterSeriesByBounds(base, bounds);
}

// ── Combo chart: bars (Y) + lines (Y2) ───────────────────────────
function AAFChart({ data }) {
  if (!data) return html`<div style=${{ flex:1, display:"grid", placeItems:"center", color:C.muted }}>No data</div>`;

  const xs = data.x || [];
  const series = data.series || [];
  const ySeries  = series.filter(s => s.role === "y"  || !s.role);
  const y2Series = series.filter(s => s.role === "y2");

  // Friendly names for known series
  const NAMES = {
    "Avg(DATATBL.CURVALUE)":    "Monthly Avg Flow, MGD",
    "Sum(LIMITS.LIMIT_VALUE)":  "Permit Limit",
    "Sum(DATATBL.90%)":         "90% Threshold",
    "Sum(DATATBL.75%)":         "75% Threshold",
  };
  const COLORS_Y2 = ["#d74c45", "#ef9447", "#72c98f"];

  const datasets = [
    ...ySeries.map(s => ({
      label: NAMES[s.name] || s.name,
      data: s.values || [],
      type: "bar",
      backgroundColor: "rgba(39,215,215,0.65)",
      borderColor: C.accent,
      borderWidth: 0,
      borderRadius: 2,
      order: 2,
    })),
    ...y2Series.map((s, i) => ({
      label: NAMES[s.name] || s.name,
      data: s.values || [],
      type: "line",
      borderColor: COLORS_Y2[i] || "#fff",
      borderWidth: i === 0 ? 2.5 : 1.5,
      borderDash: i === 0 ? [] : [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 1,
    })),
  ];

  // All series (bars + lines) share one y-axis in MGD — compute a shared max
  const allVals = [...ySeries, ...y2Series]
    .flatMap(s => s.values || [])
    .filter(v => v != null);
  const sharedMax = allVals.length ? Math.max(...allVals) * 1.1 : undefined;

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font:{ size:11 }, boxWidth:10, padding:10 } },
      tooltip: { mode:"index", intersect:false },
    },
    scales: {
      x: { ticks:{ color:C.muted, font:{size:9}, maxTicksLimit:12 }, grid:{ color:"rgba(255,255,255,0.05)" } },
      y: {
        ticks:{ color:C.muted, font:{size:9} },
        grid:{ color:"rgba(255,255,255,0.05)" },
        beginAtZero:true,
        max: sharedMax,
        title:{ display:true, text:"MGD", color:C.muted, font:{size:10} },
      },
    },
  };

  return html`
    <div style=${{ position:"relative", flex:1, minHeight:0 }}>
      <${ChartWrap} type="bar" data=${{ labels:xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── KPI card ──────────────────────────────────────────────────────
function KpiCard({ label, value, format }) {
  let display = "—";
  if (value != null) {
    if (format === "pct") display = `${(value * 100).toFixed(1)}%`;
    else if (format === "mgd") display = `${value.toLocaleString(undefined, { maximumFractionDigits:2 })} MGD`;
    else display = value.toLocaleString(undefined, { maximumFractionDigits:3 });
  }
  return html`
    <div style=${{
      background:`linear-gradient(180deg,${C.card},#0d2139)`,
      border:`1px solid ${C.line}`, borderRadius:14,
      padding:"14px 18px",
    }}>
      <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>${label}</div>
      <div style=${{ fontSize:"1.6rem", fontWeight:800, color:C.accent }}>${display}</div>
    </div>
  `;
}

function PermitTable({ visual, plant }) {
  const d = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  if (!d) return null;

  const columns = d.columns || [];
  const rows    = d.rows || [];
  const labels  = visual.column_labels || {};
  const headers = columns.map(c => labels[c] || c);

  return html`
    <div style=${{ overflowX:"auto" }}>
      <table style=${{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
        <thead>
          <tr>
            ${headers.map(h => html`
              <th key=${h} style=${{
                padding:"5px 8px",
                textAlign:"left",
                color:C.muted,
                borderBottom:`1px solid ${C.line}`,
                fontWeight:600,
                fontSize:10,
                textTransform:"uppercase",
                letterSpacing:".04em",
                whiteSpace:"nowrap",
              }}>${h}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, ri) => html`
            <tr key=${ri} style=${{ borderBottom:"1px solid rgba(255,255,255,.03)" }}>
              ${row.map((cell, ci) => html`
                <td key=${ci} style=${{ padding:"4px 8px", color:C.text, whiteSpace:"nowrap" }}>
                  ${cell ?? "—"}
                </td>
              `)}
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
export function PermitEvaluationAAFPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const CHART_TYPES = new Set(["lineStackedColumnComboChart","lineClusteredColumnComboChart"]);
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialChart = visuals.find(v => CHART_TYPES.has(v.type));
  const initialBase = (page.plant_slicer?.default && initialChart?.data_by_plant?.[page.plant_slicer.default]) || initialChart?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const comboVis = initialChart;
  const cards    = visuals.filter(v => v.type === "card" && (v.data || v.data_by_plant));
  const tableVis = visuals.find(v => v.type === "tableEx" && (v.data || v.data_by_plant));
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const chartData = useMemo(() => resolve(comboVis, plant, activeBounds), [comboVis, plant, activeBounds]);
  const fallbackCard0 = useMemo(() => { const d = (plant && cards[0]?.data_by_plant?.[plant]) || cards[0]?.data; return d?.value ?? null; }, [cards, plant]);
  const fallbackCard1 = useMemo(() => { const d = (plant && cards[1]?.data_by_plant?.[plant]) || cards[1]?.data; return d?.value ?? null; }, [cards, plant]);
  const card0val = useMemo(() => {
    const series = getRoleSeries(chartData, "y") || getRoleSeries(chartData, null);
    return maxNumeric(series?.values) ?? fallbackCard0;
  }, [chartData, fallbackCard0]);
  const card1val = useMemo(() => {
    const permit = averageNumeric(getRoleSeries(chartData, "y2")?.values);
    return (card0val != null && permit) ? (card0val / permit) : fallbackCard1;
  }, [chartData, card0val, fallbackCard1]);

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plants_n   = manifest?.totals?.plants || 0;
  const refresh    = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background:`radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height:"100vh", color:C.text, fontFamily:"Inter,system-ui,sans-serif",
      fontSize:14, padding:18, display:"grid", gap:12,
      gridTemplateRows:"auto 1fr auto", overflow:"hidden",
    }}>

      <!-- TOP ROW -->
      <header style=${{ display:"grid", gridTemplateColumns:"64px 1fr auto", gap:14, alignItems:"start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, height:64, display:"grid", placeItems:"center", fontSize:28, color:C.muted, cursor:"pointer" }}>←</button>
        <div>
          <small style=${{ display:"block", color:C.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:".04em", fontSize:11, marginBottom:4 }}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin:0, fontSize:26, fontWeight:800, lineHeight:1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color:C.accent }}>· Permit Evaluation, Annual Average Flow</span>
          </h1>
        </div>
        <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:"12px 14px", minWidth:210 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:".04em" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ marginTop:8, width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }}>
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

      <!-- MAIN LAYOUT -->
      <main style=${{ display:"grid", gridTemplateColumns:"220px 1fr", gap:12, minHeight:0 }}>

        <!-- WWTP SIDEBAR -->
        <aside style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:12, overflow:"auto" }}>
          <h3 style=${{ margin:"0 0 8px", color:C.accent, fontSize:13 }}>WWTP</h3>
          <input placeholder="Search WWTP" value=${search} onInput=${e => setSearch(e.target.value)}
            style=${{ width:"100%", padding:"8px 10px", borderRadius:10, border:`1px solid ${C.line}`, background:"#0a1a2e", color:C.text, fontFamily:"inherit", fontSize:12, marginBottom:8 }} />
          <div style=${{ display:"grid", gap:4 }}>
            ${filteredPlants.map(p => html`
              <label key=${p} style=${{ display:"flex", gap:8, alignItems:"center", padding:"5px 6px", borderRadius:8, cursor:"pointer", fontSize:12, background:p===plant?"rgba(39,215,215,0.12)":"transparent", color:p===plant?C.accent:C.muted }}>
                <input type="radio" name="plant" checked=${p===plant} onChange=${()=>setPlant(p)} style=${{ accentColor:C.accent }} />
                ${p}
              </label>
            `)}
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <div style=${{ display:"flex", flexDirection:"column", gap:12, minHeight:0 }}>

          <!-- KPI + chart-label row -->
          <div style=${{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gap:12, flexShrink:0 }}>
            <${KpiCard} label="Max AAF (MGD)"    value=${card0val} format="mgd" />
            <${KpiCard} label="Max AAF % of Permit" value=${card1val} format="pct" />
            <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:"12px 16px" }}>
              <div style=${{ fontWeight:700, fontSize:12, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".04em" }}>Permit Limits</div>
              <${PermitTable} visual=${tableVis} plant=${plant} />
            </div>
          </div>

          <!-- COMBO CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:13, marginBottom:8 }}>Effluent Flow, MGD</div>
            <div style=${{ color:C.muted, fontSize:12, marginBottom:10, lineHeight:1.4 }}>
              Annual Average (Permit Evaluation) — monthly data points with permit limit and 75/90 planning thresholds
            </div>
            <${AAFChart} data=${chartData} />
          </div>
        </div>
      </main>

      <!-- FOOTER -->
      <footer style=${{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:11, paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <span>All flows in mgd (million gallons per day). Data refreshed daily.</span>
        <span>Questions or feedback? Contact <a href="mailto:" style=${{ color:"#5da8ff" }}>WWIP Support</a></span>
      </footer>
    </div>
  `;
}
