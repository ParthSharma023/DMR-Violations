// Bespoke page for "Statistical Flows" — HachWIMS Flow Statistics.
// Layout: 6 KPI cards + 3 horizontal pivot tables + daily ADF bar chart.

import { h } from "preact";
import { useState, useMemo } from "preact/hooks";
import htm from "htm";
import { ChartWrap } from "../components/chart-base.js";
import {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  filterMonthMatrixByBounds,
  getActiveBounds,
  getPresetBounds,
  getRoleSeries,
  inferSeriesBounds,
  inferMonthMatrixBounds,
  maxNumeric,
  averageNumeric,
  sampleStdDevNumeric,
  withCustomDateOption,
  monthMatrixValues,
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

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function KpiCard({ label, value, accent }) {
  const display = value != null ? value.toFixed(2) : "—";
  return html`
    <div style=${{
      background: accent
        ? `linear-gradient(180deg,rgba(39,215,215,.12),rgba(39,215,215,.05))`
        : `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${accent ? "rgba(39,215,215,.3)" : C.line}`,
      borderRadius: 12, padding: "12px 16px", flex: 1, minWidth: 0,
    }}>
      <div style=${{ fontSize: "1.7rem", fontWeight: 800,
        color: accent ? C.accent : C.text, lineHeight: 1.1 }}>${display}</div>
      <div style=${{ color: C.muted, fontSize: 11, marginTop: 4,
        textTransform: "uppercase", letterSpacing: ".04em" }}>${label}</div>
    </div>
  `;
}

function PivotTable({ title, data, plant }) {
  if (!data || !data.months?.length) return html`
    <div style=${{ color: C.muted, fontSize: 12, padding: "8px 0" }}>No data for this selection</div>
  `;

  const months  = data.months;
  const values  = data.values || {};

  const byYear = [];
  let cur = null;
  for (const { yr, mo } of months) {
    if (!cur || cur.yr !== yr) {
      cur = { yr, months: [] };
      byYear.push(cur);
    }
    cur.months.push(mo);
  }

  const tdBase = { padding: "4px 8px", whiteSpace: "nowrap", fontSize: 12, textAlign: "right", borderRight: `1px solid rgba(255,255,255,.04)` };

  return html`
    <div style=${{ marginBottom: 12 }}>
      <div style=${{ fontWeight: 700, fontSize: 12, color: C.muted, marginBottom: 6,
        textTransform: "uppercase", letterSpacing: ".04em" }}>${title}</div>
      <div style=${{ overflowX: "auto" }}>
        <table style=${{ borderCollapse: "collapse", fontSize: 12, minWidth: "100%" }}>
          <thead>
            <tr>
              <th style=${{ ...tdBase, textAlign: "left", color: C.muted, minWidth: 130,
                position: "sticky", left: 0, background: C.card, zIndex: 1 }}>WWTP</th>
              ${byYear.map(({ yr, months: mos }) => html`
                <th key=${yr} colSpan=${mos.length + 1}
                  style=${{ ...tdBase, textAlign: "center", color: C.accent, fontWeight: 700,
                    borderLeft: "2px solid rgba(39,215,215,.2)" }}>${yr}</th>
              `)}
            </tr>
            <tr>
              <th style=${{ ...tdBase, textAlign: "left", color: C.muted,
                position: "sticky", left: 0, background: C.card, zIndex: 1 }}> </th>
              ${byYear.map(({ yr, months: mos }) => html`
                ${mos.map(mo => html`
                  <th key=${yr+"-"+mo} style=${{ ...tdBase, color: C.muted, fontWeight: 400 }}>
                    ${MONTH_LABELS[mo - 1]}
                  </th>
                `)}
                <th key=${yr+"-T"} style=${{ ...tdBase, color: C.text, fontWeight: 700,
                  background: "rgba(255,255,255,.03)", borderLeft: "2px solid rgba(255,255,255,.08)" }}>
                  Total
                </th>
              `)}
            </tr>
          </thead>
          <tbody>
            <tr style=${{ borderTop: `1px solid ${C.line}` }}>
              <td style=${{ ...tdBase, textAlign: "left", color: C.text, fontWeight: 600,
                position: "sticky", left: 0, background: "#0d1f35", zIndex: 1 }}>${plant || "—"}</td>
              ${byYear.map(({ yr, months: mos }) => html`
                ${mos.map(mo => {
                  const v = values[yr + "-" + mo];
                  return html`
                    <td key=${yr+"-"+mo} style=${{ ...tdBase, color: C.text }}>
                      ${v != null ? v.toFixed(2) : "—"}
                    </td>
                  `;
                })}
                <td key=${yr+"-T"} style=${{ ...tdBase, color: C.text, fontWeight: 700,
                  background: "rgba(255,255,255,.03)", borderLeft: "2px solid rgba(255,255,255,.08)" }}>
                  ${values[yr + "-total"] != null ? values[yr + "-total"].toFixed(2) : "—"}
                </td>
              `)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function ADFChart({ data, plant }) {
  if (!data) return null;
  const xs     = data.x || [];
  const vals   = data.series?.[0]?.values || [];
  const datasets = [{
    label: "Daily Avg Flow, MGD",
    data: vals,
    type: "bar",
    backgroundColor: "rgba(114,201,143,0.75)",
    borderColor: "rgba(114,201,143,0.75)",
    borderWidth: 0,
    borderRadius: 1,
  }];
  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 8 }, maxTicksLimit: 12, autoSkip: true },
           grid: { color: "rgba(255,255,255,0.03)" } },
      y: { ticks: { color: C.muted, font: { size: 9 } },
           grid: { color: "rgba(255,255,255,0.03)" },
           beginAtZero: true,
           title: { display: true, text: "MGD", color: C.muted, font: { size: 9 } } },
    },
  };
  return html`
    <div style=${{ position: "relative", flex: 1, minHeight: 0 }}>
      <${ChartWrap} key=${"adf-"+plant} type="bar" data=${{ labels: xs, datasets }} options=${opts} />
    </div>
  `;
}

export function StatisticalFlowsPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [range, setRange] = useState(initialRange);

  const CARD_CFG = [
    { binding: "Sum(LIMITS.LIMIT_VALUE)", label: "Permitted Annual Avg Flow", accent: false },
    { binding: "Sum(DATATBL.90%)",        label: "90% of Permit",             accent: false },
    { binding: "Sum(DATATBL.75%)",        label: "75% of Permit",             accent: false },
    { binding: "DATATBL.MAX Curval",      label: "Permit Evaluated Flow",     accent: true  },
    { binding: "DATATBL.AVG_Calc",        label: "AVG (Selected Period)",     accent: false },
    { binding: "DATATBL.STDEV.S",         label: "Standard Deviation",        accent: false },
  ];

  const cardVis = Object.fromEntries(
    visuals.filter(v => v.type === "card").map(v => {
      const binding = v.projections?.Values?.[0] || "";
      return [binding, v];
    })
  );

  const pivots = visuals.filter(v => v.type === "pivotTable");
  const aafPivot  = pivots.find(v => (v.title||"").toLowerCase().includes("permitted annual"));
  const adfPivot  = pivots.find(v => (v.title||"").toLowerCase().includes("average daily flow"));
  const rainPivot = pivots.find(v => (v.title||"").toLowerCase().includes("rainfall"));
  const chartVis  = visuals.find(v => v.type === "lineClusteredColumnComboChart");

  const initialPivotBase = (page.plant_slicer?.default && aafPivot?.data_by_plant?.[page.plant_slicer.default]) || aafPivot?.data;
  const initialChartBase = (page.plant_slicer?.default && chartVis?.data_by_plant?.[page.plant_slicer.default]) || chartVis?.data;
  const initialBounds = getPresetBounds(initialRange, anchor)
    || inferMonthMatrixBounds(initialPivotBase)
    || inferSeriesBounds(initialChartBase)
    || { start: "", end: "" };

  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const getCardVal = (binding) => {
    const vis = cardVis[binding];
    const d = (plant && vis?.data_by_plant?.[plant]) || vis?.data;
    return d?.value ?? null;
  };

  const aafPivotData = useMemo(() => {
    const base = (plant && aafPivot?.data_by_plant?.[plant]) || aafPivot?.data;
    return filterMonthMatrixByBounds(base, activeBounds);
  }, [aafPivot, plant, activeBounds]);
  const adfPivotData = useMemo(() => {
    const base = (plant && adfPivot?.data_by_plant?.[plant]) || adfPivot?.data;
    return filterMonthMatrixByBounds(base, activeBounds);
  }, [adfPivot, plant, activeBounds]);
  const rainPivotData = useMemo(() => {
    const base = (plant && rainPivot?.data_by_plant?.[plant]) || rainPivot?.data;
    return filterMonthMatrixByBounds(base, activeBounds);
  }, [rainPivot, plant, activeBounds]);
  const chartData = useMemo(() => {
    const base = (plant && chartVis?.data_by_plant?.[plant]) || chartVis?.data;
    return filterSeriesByBounds(base, activeBounds);
  }, [chartVis, plant, activeBounds]);

  const permitEvalVal = useMemo(
    () => maxNumeric(monthMatrixValues(aafPivotData)) ?? getCardVal("DATATBL.MAX Curval"),
    [aafPivotData, plant],
  );
  const avgSelectedVal = useMemo(
    () => averageNumeric(getRoleSeries(chartData, "y")?.values) ?? getCardVal("DATATBL.AVG_Calc"),
    [chartData, plant],
  );
  const stdSelectedVal = useMemo(
    () => sampleStdDevNumeric(getRoleSeries(chartData, "y")?.values) ?? getCardVal("DATATBL.STDEV.S"),
    [chartData, plant],
  );

  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height: "100vh", color: C.text, fontFamily: "Inter,system-ui,sans-serif",
      fontSize: 14, padding: 18, display: "grid", gap: 10,
      gridTemplateRows: "auto auto auto 1fr auto", overflow: "hidden",
    }}>

      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto auto", gap: 12, alignItems: "center" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background: `linear-gradient(180deg,${C.card},#0d2139)`, border: `1px solid ${C.line}`,
            borderRadius: 14, height: 56, display: "grid", placeItems: "center",
            fontSize: 24, color: C.muted, cursor: "pointer" }}>←</button>
        <div>
          <div style=${{ color: C.accent, fontWeight: 700, fontSize: 20 }}>HachWIMS Flow Statistics</div>
          <div style=${{ color: C.muted, fontSize: 13 }}>WWTP Effluent Flow, MGD</div>
        </div>
        <div style=${{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase" }}>WWTP</div>
          <select value=${plant} onChange=${e => setPlant(e.target.value)}
            style=${{ padding: "7px 10px", border: `1px solid ${C.line}`, borderRadius: 10,
              background: "#0b1c31", color: C.text, fontFamily: "inherit", fontSize: 13, minWidth: 180 }}>
            ${plants.map(p => html`<option value=${p}>${p}</option>`)}
          </select>
        </div>
        <div style=${{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ padding: "7px 10px", border: `1px solid ${C.line}`, borderRadius: 10,
              background: "#0b1c31", color: C.text, fontFamily: "inherit", fontSize: 13, minWidth: 160 }}>
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

      <div style=${{ display: "flex", gap: 10 }}>
        ${CARD_CFG.map(({ binding, label, accent }) => {
          const value = binding === "DATATBL.MAX Curval"
            ? permitEvalVal
            : binding === "DATATBL.AVG_Calc"
              ? avgSelectedVal
              : binding === "DATATBL.STDEV.S"
                ? stdSelectedVal
                : getCardVal(binding);
          return html`<${KpiCard} key=${binding} label=${label} value=${value} accent=${accent} />`;
        })}
      </div>

      <div style=${{ background: `linear-gradient(180deg,${C.card},#0d2139)`,
        border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 16px", overflow: "hidden" }}>
        <${PivotTable} title="Permitted Annual Average Flow (Previous 12-month Avg, Reported Monthly)"
          data=${aafPivotData} plant=${plant} />
        <${PivotTable} title="Average Daily Flow (Reported in Monthly DMR)"
          data=${adfPivotData} plant=${plant} />
        <${PivotTable} title="Monthly Rainfall Recorded at the Plants"
          data=${rainPivotData} plant=${plant} />
      </div>

      <div style=${{ background: `linear-gradient(180deg,${C.card},#0d2139)`,
        border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 16px",
        display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style=${{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Average Daily Flow, MGD</div>
        <${ADFChart} data=${chartData} plant=${plant} />
      </div>

      <footer style=${{ display: "flex", justifyContent: "space-between", color: C.muted, fontSize: 11,
        paddingTop: 6, borderTop: `1px solid rgba(255,255,255,.08)` }}>
        <span>All flows in MGD (million gallons per day). Data refreshed daily.</span>
        <span>Last refresh: ${refresh}</span>
      </footer>
    </div>
  `;
}
