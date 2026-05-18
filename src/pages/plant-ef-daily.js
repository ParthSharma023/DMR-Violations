import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import htm from "htm";
import { ChartWrap } from "../components/chart-base.js";
import { loadCustomData } from "../data.js";
import {
  CUSTOM_DATE_RANGE_KEY,
  averageNumeric,
  getActiveBounds,
  getPresetBounds,
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

const LIMIT_COLORS = ["#d74c45", "#ef9447", "#5da8ff", "#f2c14e"];

function offsetToIso(originDate, offset) {
  const dt = new Date(`${originDate}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + Number(offset || 0));
  return dt.toISOString().slice(0, 10);
}

function resolveSeries(originDate, seriesData, bounds) {
  if (!seriesData?.x?.length) return { x: [], values: [] };
  const x = [];
  const values = [];
  for (let i = 0; i < seriesData.x.length; i += 1) {
    const iso = offsetToIso(originDate, seriesData.x[i]);
    if (bounds?.start && bounds?.end && (iso < bounds.start || iso > bounds.end)) continue;
    x.push(iso);
    values.push(seriesData.v?.[i] ?? null);
  }
  return { x, values };
}

function chartDatasets(series, limits) {
  return [
    {
      label: "Recorded Value",
      data: series.values,
      type: "line",
      borderColor: C.accent,
      backgroundColor: "rgba(39,215,215,0.12)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 2,
    },
    ...limits.map((limit, idx) => ({
      label: limit.d || limit.n || `Limit ${idx + 1}`,
      data: Array(series.x.length).fill(limit.v),
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

function LimitsTable({ limits }) {
  if (!limits?.length) {
    return html`<div style=${{ color: C.muted, fontSize: 12 }}>No current limit rows for this parameter.</div>`;
  }
  return html`
    <div style=${{ overflowX: "auto" }}>
      <table style=${{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            ${["Limit Type", "Description", "Compare", "Limit Value", "Units", "End Date"].map((header) => html`
              <th key=${header} style=${thStyle()}>${header}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${limits.map((limit, idx) => html`
            <tr key=${idx} style=${{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <td style=${tdStyle()}><span style=${limitBadgeStyle(idx)}>${limit.n || "—"}</span></td>
              <td style=${tdStyle()}>${limit.d || "—"}</td>
              <td style=${tdStyle()}>${limit.c || "—"}</td>
              <td style=${tdStyle()}>${limit.v == null ? "—" : limit.v.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
              <td style=${tdStyle()}>${limit.u || "—"}</td>
              <td style=${tdStyle()}>${limit.e || "—"}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function DailyChart({ series, limits, units }) {
  if (!series.x.length) {
    return html`<div style=${{ color: C.muted, fontSize: 12 }}>No daily values in the active date window.</div>`;
  }
  const values = [...series.values, ...limits.map((limit) => limit.v)].filter((value) => typeof value === "number" && Number.isFinite(value));
  const maxValue = values.length ? Math.max(...values) * 1.1 : undefined;
  return html`
    <div style=${{ position: "relative", flex: 1, minHeight: 0 }}>
      <${ChartWrap}
        type="line"
        data=${{ labels: series.x, datasets: chartDatasets(series, limits) }}
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
              beginAtZero: false,
              suggestedMin: 0,
              max: maxValue,
              title: { display: !!units, text: units || "", color: C.muted, font: { size: 10 } },
            },
          },
        }}
      />
    </div>
  `;
}

export function PlantEffluentDailyPage({ page, manifest, currentDateRange }) {
  const plants = page.plant_slicer?.options || [];
  const dateOptions = useMemo(
    () => withCustomDateOption((page.date_slicer?.options || []).filter((option) => option.key !== "all_time")),
    [page.date_slicer?.options],
  );

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [plantSearch, setPlantSearch] = useState("");
  const [source, setSource] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [parameter, setParameter] = useState("");
  const [range, setRange] = useState(currentDateRange || page.date_slicer?.default || "last_5_years");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    let active = true;
    loadCustomData(page.custom_data_key, page.custom_data_href)
      .then((payload) => {
        if (!active) return;
        setSource(payload);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err.message);
      });
    return () => { active = false; };
  }, [page.custom_data_href, page.custom_data_key]);

  const anchor = source?.anchor_date || page.date_slicer?.anchor_date || "";
  const initialBounds = getPresetBounds(range, anchor) || { start: "", end: "" };

  useEffect(() => {
    if (!customStart && initialBounds.start) setCustomStart(initialBounds.start);
    if (!customEnd && initialBounds.end) setCustomEnd(initialBounds.end);
  }, [initialBounds.start, initialBounds.end, customStart, customEnd]);

  const availableParameters = useMemo(() => {
    const plantData = source?.by_plant?.[plant] || {};
    const allowed = new Set(Object.keys(plantData));
    return (source?.parameters || []).filter((item) => allowed.has(item.key));
  }, [source, plant]);

  useEffect(() => {
    if (!availableParameters.length) {
      if (parameter) setParameter("");
      return;
    }
    if (!parameter || !availableParameters.some((item) => item.key === parameter)) {
      const preferred = availableParameters.find((item) => item.key === source?.default_parameter) || availableParameters[0];
      setParameter(preferred?.key || "");
    }
  }, [availableParameters, parameter, source?.default_parameter]);

  const selectedMeta = useMemo(
    () => availableParameters.find((item) => item.key === parameter) || null,
    [availableParameters, parameter],
  );

  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const selectedSeriesRaw = source?.by_plant?.[plant]?.[parameter] || null;
  const series = useMemo(
    () => resolveSeries(source?.origin_date, selectedSeriesRaw, activeBounds),
    [source?.origin_date, selectedSeriesRaw, activeBounds],
  );
  const limits = selectedSeriesRaw?.l || [];
  const latestValue = series.values.length ? series.values[series.values.length - 1] : null;
  const latestDate = series.x.length ? series.x[series.x.length - 1] : "—";
  const avgValue = averageNumeric(series.values);
  const peakValue = maxNumeric(series.values);
  const filteredPlants = useMemo(
    () => plants.filter((item) => item.toLowerCase().includes(plantSearch.toLowerCase())),
    [plants, plantSearch],
  );
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  if (loadError) {
    return html`<div style=${errorShell()}><div>Unable to load daily effluent source: ${loadError}</div></div>`;
  }

  if (!source) {
    return html`<div style=${errorShell()}><div>Loading daily effluent source…</div></div>`;
  }

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
          style=${buttonStyle()}>←</button>
        <div>
          <small style=${topLabelStyle()}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· Plant Effluent Daily</span>
          </h1>
        </div>
        <div style=${panelStyle({ minWidth: 220 })}>
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

      <section style=${{
        background: `linear-gradient(180deg,${C.card},#0d2139)`,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 14,
        display: "grid",
        gridTemplateColumns: "minmax(260px, 1.5fr) repeat(4, minmax(0, 1fr))",
        gap: 10,
      }}>
        <select value=${parameter} onChange=${(e) => setParameter(e.target.value)} style=${inputStyle()}>
          ${availableParameters.map((item) => html`
            <option key=${item.key} value=${item.key}>${item.label}${item.units ? ` (${item.units})` : ""}</option>
          `)}
        </select>
        <${StatCard} label="Latest value" value=${latestValue == null ? "—" : latestValue.toFixed(2)} accent=${true} />
        <${StatCard} label="Avg value" value=${avgValue == null ? "—" : avgValue.toFixed(2)} />
        <${StatCard} label="Peak value" value=${peakValue == null ? "—" : peakValue.toFixed(2)} />
        <${StatCard} label="Last refresh" value=${refresh} />
      </section>

      <main style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, minHeight: 0 }}>
        <aside style=${panelStyle({ padding: 12, overflow: "auto" })}>
          <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
          <input value=${plantSearch} onInput=${(e) => setPlantSearch(e.target.value)} placeholder="Search WWTP" style=${{ ...inputStyle(), marginBottom: 8 }} />
          <div style=${{ display: "grid", gap: 4 }}>
            ${filteredPlants.map((item) => html`
              <label key=${item} style=${radioRowStyle(item === plant)}>
                <input type="radio" name="plant-ef-daily-plant" checked=${item === plant} onChange=${() => setPlant(item)} style=${{ accentColor: C.accent }} />
                ${item}
              </label>
            `)}
          </div>
        </aside>

        <div style=${{ display: "grid", gap: 10, minHeight: 0, gridTemplateRows: "auto 1fr auto" }}>
          <section style=${panelStyle()}>
            <div style=${sectionTitleStyle()}>
              ${selectedMeta?.label || parameter || "Parameter"} · ${plant || "WWTP"}
            </div>
            <div style=${{ color: C.muted, fontSize: 12 }}>
              Latest sampled date: <span style=${{ color: C.text }}>{latestDate}</span>
              ${selectedMeta?.units ? html` · Units: <span style=${{ color: C.text }}>{selectedMeta.units}</span>` : null}
            </div>
          </section>

          <section style=${panelStyle({ display: "flex", flexDirection: "column", minHeight: 0 })}>
            <div style=${sectionTitleStyle()}>Recorded value by date</div>
            <${DailyChart} series=${series} limits=${limits} units=${selectedMeta?.units} />
          </section>

          <section style=${panelStyle()}>
            <div style=${sectionTitleStyle()}>Current permit limits</div>
            <${LimitsTable} limits=${limits} />
          </section>
        </div>
      </main>

      <footer style=${footerStyle()}>
        <span>Daily effluent source retains the latest five years for interactive filtering on this page.</span>
        <span>${source.plants?.length || 0} plants · ${source.parameters?.length || 0} curated effluent parameters.</span>
      </footer>
    </div>
  `;
}

function panelStyle(extra = {}) {
  return {
    background: `linear-gradient(180deg,${C.card},#0d2139)`,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: "12px 14px",
    ...extra,
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

function buttonStyle() {
  return {
    background: `linear-gradient(180deg,${C.card},#0d2139)`,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    height: 64,
    display: "grid",
    placeItems: "center",
    fontSize: 28,
    color: C.muted,
    cursor: "pointer",
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

function limitBadgeStyle(idx) {
  return {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 999,
    background: `${LIMIT_COLORS[idx % LIMIT_COLORS.length]}22`,
    color: LIMIT_COLORS[idx % LIMIT_COLORS.length],
    fontWeight: 700,
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

function errorShell() {
  return {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: `linear-gradient(180deg,#05101d,${C.bg})`,
    color: C.text,
    fontFamily: "Inter,system-ui,sans-serif",
  };
}
