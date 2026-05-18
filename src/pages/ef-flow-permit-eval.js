import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import htm from "htm";
import {
  CUSTOM_DATE_RANGE_KEY,
  getActiveBounds,
  getPresetBounds,
  averageNumeric,
  maxNumeric,
  withCustomDateOption,
} from "../date-range.js";
const html = htm.bind(h);

const TEAL  = "#1fa3a8";
const SLATE = "#5c6f84";
const PANEL = "linear-gradient(180deg,#102844,#0d223b)";
const LINE  = "rgba(120,170,220,.16)";
const ACCENT = "#23d6d6";
const MUTED  = "#9db0c7";
const TEXT   = "#eef4fb";

const card = (extra = {}) => ({
  background: PANEL, border: `1px solid ${LINE}`, borderRadius: 16, ...extra,
});

function buildCustomChartData(chartVis, bounds) {
  const source = chartVis?.custom_range_source;
  if (!source?.plants?.length) return chartVis?.data;

  const xs = [];
  const utilized = [];
  const remaining = [];

  for (const plant of source.plants) {
    const plantRows = source.rows_by_plant?.[plant];
    if (!plantRows?.x?.length) continue;

    const activeIdx = [];
    for (let i = 0; i < plantRows.x.length; i += 1) {
      const x = String(plantRows.x[i]).slice(0, 10);
      if (!bounds?.start || !bounds?.end || (x >= bounds.start && x <= bounds.end)) {
        activeIdx.push(i);
      }
    }
    const keep = activeIdx.length ? activeIdx : plantRows.x.map((_, i) => i);
    const utilVals = keep.map((i) => plantRows.utilized?.[i]);
    const permitVals = keep.map((i) => plantRows.permit?.[i]);
    const maxUtil = maxNumeric(utilVals);
    const permit = averageNumeric(permitVals);
    const rem = (maxUtil != null && permit != null) ? (permit - maxUtil) : null;

    xs.push(plant);
    utilized.push(maxUtil);
    remaining.push(rem);
  }

  return {
    shape: "xy_series",
    x: xs,
    series: [
      { name: "Capacity Utilized", values: utilized },
      { name: "Capacity Remaining", values: remaining },
    ],
  };
}

export function EfFlowPermitEvalPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const chartVis = visuals.find(v => v.type === "hundredPercentStackedColumnChart");
  const dateOpts = page.date_slicer?.options || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBounds = getPresetBounds(initialRange, anchor, {
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }) || { start: "", end: "" };

  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }), [range, anchor, customStart, customEnd]);

  const chartData = useMemo(() => {
    if (range === CUSTOM_DATE_RANGE_KEY) {
      return buildCustomChartData(chartVis, activeBounds);
    }
    return chartVis?.data_by_date_range?.[range] || chartVis?.data;
  }, [chartVis, range, activeBounds]);

  const xs     = chartData?.x || [];
  const series = chartData?.series || [];
  const bars = useMemo(() => xs.map((plant, i) => {
    const utilized = Math.max(0, series[0]?.values?.[i] ?? 0);
    const rem = Math.max(0, series[1]?.values?.[i] ?? 0);
    const total = utilized + rem || 1;
    const pct = Math.round((utilized / total) * 100);
    const remPct = Math.round((rem / total) * 100);
    return { plant, pct, rem: remPct };
  }), [xs, series]);

  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plants     = manifest?.totals?.plants || 0;
  const refresh    = (manifest?.last_refresh || "—").slice(0, 10);
  const rangeLabel = range === CUSTOM_DATE_RANGE_KEY
    ? `${customStart || "Start"} to ${customEnd || "End"}`
    : (dateOpts.find(o => o.key === range)?.label || range);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,rgba(40,90,160,.18),transparent 26%),linear-gradient(180deg,#04101c,#061321)`,
      minHeight: "100vh",
      color: TEXT, fontFamily: "Inter,system-ui,sans-serif", fontSize: 14,
      padding: 18, display: "grid", gap: 14, gridTemplateRows: "auto 1fr auto",
    }}>

      <header style=${{ display:"grid", gridTemplateColumns:"72px 1fr 520px", gap:16, alignItems:"start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${card({ height:72, width:72, display:"grid", placeItems:"center", fontSize:28, color:MUTED, cursor:"pointer" })}>←</button>

        <div>
          <div style=${{ color:ACCENT, textTransform:"uppercase", fontWeight:700, letterSpacing:".08em", fontSize:11, marginBottom:4 }}>
            City of Houston — Public Works &amp; Engineering
          </div>
          <h1 style=${{ margin:"0 0 4px", fontSize:32, fontWeight:800, lineHeight:1.05 }}>Citywide WWTP Capacity Status</h1>
          <div style=${{ fontSize:20, fontWeight:700, color:ACCENT }}>Effluent Flow</div>
        </div>

        <div style=${{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          ${[
            { val: plants,     label: "Total WWTPs",       color: TEXT   },
            { val: violations, label: "Total Violations",  color: TEXT   },
            { val: refresh,    label: "Last refresh",      color: ACCENT },
          ].map(s => html`
            <div style=${card({ padding:"12px 16px" })}>
              <div style=${{ fontSize:"1.35rem", fontWeight:800, color:s.color }}>${s.val}</div>
              <div style=${{ color:MUTED, fontSize:12, marginTop:2 }}>${s.label}</div>
            </div>`
          )}
        </div>
      </header>

      <section style=${card({ padding:"16px 18px 14px", display:"flex", flexDirection:"column", minHeight:0 })}>
        <div style=${{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 380px 300px",
          gap: 16,
          alignItems: "start",
          marginBottom: 16,
          flexShrink: 0,
        }}>
          <div>
            <div style=${{ fontWeight:800, fontSize:15, marginBottom:10 }}>
              Effluent Flow, MGD
              <span style=${{ color:MUTED, fontWeight:500, fontSize:13 }}> | Based on Maximum of Twelve Consecutive Months of Average Flow for Selected Time Period</span>
            </div>
            <div style=${{ display:"flex", gap:24, fontSize:14, fontWeight:700 }}>
              <span><span style=${{ display:"inline-block", width:13, height:13, borderRadius:"50%", background:TEAL, marginRight:7, verticalAlign:-2 }}></span>Capacity Utilized</span>
              <span><span style=${{ display:"inline-block", width:13, height:13, borderRadius:"50%", background:SLATE, marginRight:7, verticalAlign:-2 }}></span>Capacity Remaining</span>
            </div>
          </div>

          <div style=${{ color:ACCENT, fontSize:12, lineHeight:1.55, paddingLeft:14, borderLeft:`1px solid ${LINE}` }}>
            5 WWTPs, Forest Cove, Tidwell Timbers, WCID 76, West Lake Houston and Westway are not included in this chart. These are evaluated based on 75/90 Rule.
          </div>

          <div style=${card({ padding:"14px 16px" })}>
            <div style=${{ color:ACCENT, fontWeight:800, textTransform:"uppercase", fontSize:11, letterSpacing:".08em", marginBottom:10 }}>Datestamp</div>
            <select value=${range} onChange=${e => setRange(e.target.value)}
              style=${{ width:"100%", padding:"9px 11px", border:`1px solid ${LINE}`, borderRadius:9, background:"#0a1d32", color:TEXT, fontFamily:"inherit", fontSize:13, marginBottom:10 }}>
              ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
            </select>
            ${range === CUSTOM_DATE_RANGE_KEY && html`
              <div style=${{ display:"grid", gap:8, marginBottom:10 }}>
                <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                  style=${{ width:"100%", padding:"9px 11px", border:`1px solid ${LINE}`, borderRadius:9, background:"#0a1d32", color:TEXT, fontFamily:"inherit", fontSize:13 }} />
                <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                  style=${{ width:"100%", padding:"9px 11px", border:`1px solid ${LINE}`, borderRadius:9, background:"#0a1d32", color:TEXT, fontFamily:"inherit", fontSize:13 }} />
              </div>
            `}
            <div style=${{ color:MUTED, fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
              <span>📅</span><span>${rangeLabel}</span>
            </div>
          </div>
        </div>

        <div style=${{
          flex:1, display:"grid", minHeight:0, overflow:"hidden",
          gridTemplateColumns:`repeat(${bars.length},minmax(0,1fr))`,
          gap:6, alignItems:"end",
        }}>
          ${bars.map(({ plant, pct, rem }) => html`
            <div key=${plant} style=${{ display:"flex", flexDirection:"column", height:"100%", minWidth:0 }}>
              <div style=${{ flex:1, display:"flex", flexDirection:"column", borderRadius:"3px 3px 0 0", overflow:"hidden", minHeight:0 }}>
                <div style=${{ flex:rem, background:SLATE, display:"flex", alignItems:"center", justifyContent:"center", color:"#f3f6fb", fontWeight:800, fontSize:rem<14?9:11, minHeight:0 }}>
                  ${rem > 8 ? `${rem}%` : ""}
                </div>
                <div style=${{ flex:pct, background:TEAL, display:"flex", alignItems:"center", justifyContent:"center", color:"#eafcff", fontWeight:800, fontSize:pct<14?9:11, minHeight:0 }}>
                  ${pct > 8 ? `${pct}%` : ""}
                </div>
              </div>
              <div style=${{ height:90, flexShrink:0, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:6, overflow:"hidden" }}>
                <span style=${{ writingMode:"vertical-lr", transform:"rotate(180deg)", fontSize:10, color:"#d3dceb", whiteSpace:"nowrap", lineHeight:1 }}>${plant}</span>
              </div>
            </div>
          `)}
        </div>
      </section>

      <footer style=${{ display:"flex", justifyContent:"space-between", color:MUTED, fontSize:12, paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <div>All flows in mgd (million gallons per day). Data refreshed daily.</div>
        <div>Questions or feedback? Contact <span style=${{ color:ACCENT }}>WWIP Support</span></div>
      </footer>
    </div>
  `;
}
