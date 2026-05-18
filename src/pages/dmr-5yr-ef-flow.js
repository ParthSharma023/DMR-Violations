import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import htm from "htm";
import { ChartWrap } from "../components/chart-base.js";
import {
  CUSTOM_DATE_RANGE_KEY,
  filterMonthMatrixByBounds,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  inferMonthMatrixBounds,
  inferSeriesBounds,
  averageNumeric,
  getRoleSeries,
  maxNumeric,
  withCustomDateOption,
} from "../date-range.js";

const html = htm.bind(h);

const C = {
  bg: "#071425",
  card: "#10253f",
  line: "rgba(120,170,220,.16)",
  text: "#eef4fb",
  muted: "#9db0c7",
  accent: "#27d7d7",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LIMIT_COLORS = ["#d74c45", "#ef9447", "#5da8ff", "#f2c14e"];

function resolveMatrix(visual, plant, bounds) {
  const base = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  return filterMonthMatrixByBounds(base, bounds);
}

function resolveSeries(visual, plant, bounds) {
  const base = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  return filterSeriesByBounds(base, bounds);
}

function formatMetric(value, units) {
  return value == null ? "—" : `${value.toFixed(2)} ${units}`;
}

function StatCard({ label, value, accent }) {
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${accent ? "rgba(39,215,215,.35)" : C.line}`,
      borderRadius: 14,
      padding: "12px 16px",
    }}>
      <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>${label}</div>
      <div style=${{ color: accent ? C.accent : C.text, fontSize: 22, fontWeight: 800, marginTop: 4 }}>${value}</div>
    </div>
  `;
}

function MonthlyMatrix({ data }) {
  if (!data?.months?.length) {
    return html`<div style=${{ color: C.muted, fontSize: 12 }}>No monthly values for this selection.</div>`;
  }

  const byYear = [];
  let current = null;
  for (const { yr, mo } of data.months) {
    if (!current || current.yr !== yr) {
      current = { yr, months: [] };
      byYear.push(current);
    }
    current.months.push(mo);
  }

  const cell = {
    padding: "6px 8px",
    whiteSpace: "nowrap",
    fontSize: 12,
    textAlign: "right",
    borderRight: "1px solid rgba(255,255,255,.04)",
  };

  return html`
    <div style=${{ overflow: "auto", flex: 1, minHeight: 0, maxWidth: "100%" }}>
      <table style=${{ width: "max-content", minWidth: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            ${byYear.map(({ yr, months }) => html`
              <th key=${yr} colSpan=${months.length + 1} style=${{
                ...cell,
                color: C.accent,
                fontWeight: 700,
                textAlign: "center",
                borderBottom: `1px solid ${C.line}`,
              }}>${yr}</th>
            `)}
          </tr>
          <tr>
            ${byYear.map(({ yr, months }) => html`
              ${months.map((mo) => html`
                <th key=${`${yr}-${mo}`} style=${{
                  ...cell,
                  color: C.muted,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  borderBottom: `1px solid ${C.line}`,
                }}>${MONTH_LABELS[mo - 1]}</th>
              `)}
              <th key=${`${yr}-total`} style=${{
                ...cell,
                color: C.text,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: ".04em",
                borderBottom: `1px solid ${C.line}`,
                background: "rgba(255,255,255,.03)",
              }}>Avg</th>
            `)}
          </tr>
        </thead>
        <tbody>
          <tr>
            ${byYear.map(({ yr, months }) => html`
              ${months.map((mo) => {
                const value = data.values?.[`${yr}-${mo}`];
                return html`
                  <td key=${`${yr}-${mo}`} style=${{ ...cell, color: C.text }}>
                    ${value == null ? "—" : value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                `;
              })}
              <td key=${`${yr}-total`} style=${{
                ...cell,
                color: C.text,
                background: "rgba(255,255,255,.03)",
                fontWeight: 700,
              }}>
                ${data.values?.[`${yr}-total`] == null ? "—" : data.values[`${yr}-total`].toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
            `)}
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function PermitTable({ visual, plant }) {
  const data = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  const rows = data?.rows || [];
  return html`
    <div style=${{ overflowX: "auto", maxWidth: "100%" }}>
      <table style=${{ width: "max-content", minWidth: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            ${["S. Name", "Description", "Limit Value", "Units", "Type", "Limit Type", "End Date"].map((header) => html`
              <th key=${header} style=${thStyle()}>${header}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) => html`
            <tr key=${idx} style=${{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              ${row.map((cell, i) => html`
                <td key=${i} style=${tdStyle()}>
                  ${typeof cell === "number" ? cell.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (cell || "—")}
                </td>
              `)}
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function ComboChart({ data, units }) {
  if (!data?.x?.length) {
    return html`<div style=${{ color: C.muted, fontSize: 12 }}>No chart data for this selection.</div>`;
  }
  const ySeries = (data.series || []).filter((series) => series.role === "y" || !series.role);
  const y2Series = (data.series || []).filter((series) => series.role === "y2");
  const datasets = [
    ...ySeries.map((series) => ({
      label: series.name,
      data: series.values || [],
      type: "bar",
      backgroundColor: "rgba(39,215,215,0.65)",
      borderColor: C.accent,
      borderWidth: 0,
      borderRadius: 2,
      order: 2,
    })),
    ...y2Series.map((series, idx) => ({
      label: series.name,
      data: series.values || [],
      type: "line",
      borderColor: LIMIT_COLORS[idx % LIMIT_COLORS.length],
      borderWidth: idx === 0 ? 2.5 : 1.5,
      borderDash: idx === 0 ? [] : [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 1,
    })),
  ];

  const allValues = [...ySeries, ...y2Series].flatMap((series) => series.values || []).filter((value) => value != null);
  const sharedMax = allValues.length ? Math.max(...allValues) * 1.1 : undefined;

  return html`
    <div style=${{ position: "relative", flex: 1, minHeight: 0 }}>
      <${ChartWrap}
        type="bar"
        data=${{ labels: data.x, datasets }}
        options=${{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              align: "start",
              labels: { color: C.muted, font: { size: 11 }, boxWidth: 10, padding: 10 },
            },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 12 },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: C.muted, font: { size: 9 } },
              grid: { color: "rgba(255,255,255,0.05)" },
              beginAtZero: true,
              max: sharedMax,
              title: { display: true, text: units, color: C.muted, font: { size: 10 } },
            },
          },
        }}
      />
    </div>
  `;
}

export function Dmr5yrHistoricalMetricPage({ page, manifest, currentDateRange }) {
  const visuals = page.visuals || [];
  const meta = page.custom_metric_meta || {};
  const plants = page.plant_slicer?.options || [];
  const dateOptions = useMemo(() => withCustomDateOption(page.date_slicer?.options || []), [page.date_slicer?.options]);
  const anchor = page.date_slicer?.anchor_date || "";
  const pivotVis = visuals.find((visual) => visual.type === "pivotTable");
  const tableVis = visuals.find((visual) => visual.type === "tableEx");
  const chartVis = visuals.find((visual) => visual.type === "lineClusteredColumnComboChart");
  const units = meta.units || "MGD";
  const pageHeading = meta.page_heading || page.display_name || "DMR 5-Year Historical Metric";
  const footerCopy = meta.footer_copy || "Historical DMR values are rebuilt from monthly averages over the latest five years.";
  const calendarMonthRanges = useMemo(() => ({ last_12_months: 12, last_5_years: 60 }), []);
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBaseMatrix = (page.plant_slicer?.default && pivotVis?.data_by_plant?.[page.plant_slicer.default]) || pivotVis?.data;
  const initialBaseSeries = (page.plant_slicer?.default && chartVis?.data_by_plant?.[page.plant_slicer.default]) || chartVis?.data;
  const initialBounds = getPresetBounds(initialRange, anchor, { calendarMonthRanges })
    || inferMonthMatrixBounds(initialBaseMatrix)
    || inferSeriesBounds(initialBaseSeries)
    || { start: "", end: "" };

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [plantSearch, setPlantSearch] = useState("");
  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges,
  }), [range, anchor, customStart, customEnd, calendarMonthRanges]);

  const filteredPlants = useMemo(
    () => plants.filter((item) => item.toLowerCase().includes(plantSearch.toLowerCase())),
    [plants, plantSearch],
  );

  const matrixData = useMemo(() => resolveMatrix(pivotVis, plant, activeBounds), [pivotVis, plant, activeBounds]);
  const chartData = useMemo(() => resolveSeries(chartVis, plant, activeBounds), [chartVis, plant, activeBounds]);

  const peakValue = maxNumeric(getRoleSeries(chartData, "y")?.values);
  const avgValue = averageNumeric(getRoleSeries(chartData, "y")?.values);
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height: "100vh",
      color: C.text,
      fontFamily: "Inter,system-ui,sans-serif",
      fontSize: 14,
      padding: 18,
      display: "grid",
      gap: 12,
      gridTemplateRows: "auto auto 1fr auto",
      overflow: "hidden",
    }}>
      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`,
            borderRadius: 14,
            height: 64,
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            color: C.muted,
            cursor: "pointer",
          }}>←</button>
        <div>
          <small style=${topLabelStyle()}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· ${pageHeading}</span>
          </h1>
        </div>
        <div style=${{
          background: `linear-gradient(180deg,${C.card},#0d2139)`,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: "12px 14px",
          minWidth: 220,
        }}>
          <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em" }}>Date Range</div>
          <select value=${range} onChange=${(e) => setRange(e.target.value)} style=${inputStyle()}>
            ${dateOptions.map((option) => html`<option key=${option.key} value=${option.key}>${option.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display: "grid", gap: 8, marginTop: 10 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${(e) => setCustomStart(e.target.value)} style=${inputStyle()} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${(e) => setCustomEnd(e.target.value)} style=${inputStyle()} />
            </div>
          `}
        </div>
      </header>

      <section style=${{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
        <${StatCard} label="Peak monthly avg" value=${formatMetric(peakValue, units)} accent=${true} />
        <${StatCard} label="Avg monthly value" value=${formatMetric(avgValue, units)} />
        <${StatCard} label="Last refresh" value=${refresh} />
      </section>

      <main style=${{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: 12, minHeight: 0 }}>
        <aside style=${{
          background: `linear-gradient(180deg,${C.card},#0d2139)`,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: 12,
          overflow: "auto",
        }}>
          <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
          <input value=${plantSearch} onInput=${(e) => setPlantSearch(e.target.value)} placeholder="Search WWTP" style=${{ ...inputStyle(), marginBottom: 8 }} />
          <div style=${{ display: "grid", gap: 4 }}>
            ${filteredPlants.map((item) => html`
              <label key=${item} style=${radioRowStyle(item === plant)}>
                <input type="radio" name=${`dmr-historical-plant-${page.slug}`} checked=${item === plant} onChange=${() => setPlant(item)} style=${{ accentColor: C.accent }} />
                ${item}
              </label>
            `)}
          </div>
        </aside>

        <div style=${{ display: "grid", gap: 10, minHeight: 0, minWidth: 0, gridTemplateRows: "auto auto 1fr" }}>
          <section style=${panelStyle({ minWidth: 0 })}>
            <div style=${sectionTitleStyle()}>Permit Limits</div>
            <${PermitTable} visual=${tableVis} plant=${plant} />
          </section>
          <section style=${panelStyle({ minHeight: 0, minWidth: 0 })}>
            <div style=${sectionTitleStyle()}>${pivotVis?.title || "Monthly values (same as DMR Report)"}</div>
            <${MonthlyMatrix} data=${matrixData} />
          </section>
          <section style=${panelStyle({ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 })}>
            <div style=${sectionTitleStyle()}>Monthly trend and permit reference lines</div>
            <${ComboChart} data=${chartData} units=${units} />
          </section>
        </div>
      </main>

      <footer style=${footerStyle()}>
        <span>${footerCopy}</span>
        <span>${manifest?.totals?.plants || 0} plants in the current WWTP list.</span>
      </footer>
    </div>
  `;
}

function panelStyle(extra = {}) {
  return {
    background: `linear-gradient(180deg,${C.card},#0d2139)`,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: "10px 14px",
    ...extra,
  };
}

function sectionTitleStyle() {
  return {
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 8,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: ".04em",
  };
}

function thStyle() {
  return {
    padding: "5px 8px",
    textAlign: "left",
    color: C.muted,
    borderBottom: `1px solid ${C.line}`,
    fontWeight: 600,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    whiteSpace: "nowrap",
  };
}

function tdStyle() {
  return {
    padding: "4px 8px",
    color: C.text,
    whiteSpace: "nowrap",
  };
}

function inputStyle() {
  return {
    marginTop: 8,
    width: "100%",
    padding: "8px 10px",
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    background: "#0b1c31",
    color: C.text,
    fontFamily: "inherit",
    fontSize: 13,
  };
}

function radioRowStyle(active) {
  return {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "5px 6px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    background: active ? "rgba(39,215,215,0.12)" : "transparent",
    color: active ? C.accent : C.muted,
  };
}

function footerStyle() {
  return {
    display: "flex",
    justifyContent: "space-between",
    color: C.muted,
    fontSize: 11,
    paddingTop: 8,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  };
}

function topLabelStyle() {
  return {
    display: "block",
    color: C.accent,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    fontSize: 11,
    marginBottom: 4,
  };
}
