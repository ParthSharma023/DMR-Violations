import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import htm from "htm";
import { ChartWrap } from "../components/chart-base.js";
import {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  withCustomDateOption,
} from "../date-range.js";

const html = htm.bind(h);

const C = {
  bg: "#071423",
  panel: "#0f2440",
  panel2: "#102845",
  line: "rgba(110,155,205,.18)",
  text: "#eef4fb",
  muted: "#9aaec6",
  accent: "#25d7d7",
  shadow: "0 10px 30px rgba(0,0,0,.28)",
  radius: 16,
};

const SERIES_COLORS = ["#25d7d7", "#5da8ff", "#9fd356", "#f2c14e", "#ef9447", "#d74c45"];

const PAGE_CONFIG = {
  thck: {
    heading: "Thickener",
    note: "Process trend views for thickener-related signals. Use the asset and metric filters to narrow the active traces.",
    assetDefault: "Thck 01",
    defaultRange: "all_time",
    chartCards: [
      {
        title: "Thickener Trends",
        selector: (visual) => visual.type === "areaChart" && Boolean(visual.data_by_plant),
        mode: "xy_series",
      },
    ],
    showSeriesPanel: true,
  },
  elec: {
    heading: "Electricity Used",
    note: "Daily and long-term electricity usage trends for the selected WWTP.",
    assetDefault: "Elec 01",
    chartCards: [
      {
        title: "Daily Electricity Usage",
        selector: (visual) => visual.type === "clusteredColumnChart" && String(visual.title || "").toUpperCase() === "DAILY",
        mode: "xy_line",
      },
      {
        title: "Yearly Electricity Usage",
        selector: (visual) => visual.type === "clusteredColumnChart" && String(visual.title || "").toUpperCase() === "MONTHLY",
        mode: "xy",
      },
    ],
    showSeriesPanel: false,
  },
};

function card(extra) {
  return {
    background: `linear-gradient(180deg,${C.panel2},${C.panel})`,
    border: `1px solid ${C.line}`,
    borderRadius: C.radius,
    boxShadow: C.shadow,
    ...extra,
  };
}

function StatChip({ icon, label, value, valueColor }) {
  return html`
    <div style=${card({ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 140 })}>
      <span style=${{ fontSize: "1.4rem", opacity: 0.8 }}>${icon}</span>
      <div>
        <div style=${{ color: C.muted, fontSize: 11 }}>${label}</div>
        <div style=${{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.1, color: valueColor || C.text }}>${value}</div>
      </div>
    </div>
  `;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchToken(name, token) {
  if (!token) return true;
  const a = normalizeText(name);
  const b = normalizeText(token);
  return !b || a.includes(b);
}

function filterYearSeriesByBounds(data, bounds) {
  if (!data || !bounds?.start || !bounds?.end) return data;
  const years = data.x || [];
  const startYear = Number(String(bounds.start).slice(0, 4));
  const endYear = Number(String(bounds.end).slice(0, 4));
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) return data;
  const keep = [];
  for (let i = 0; i < years.length; i += 1) {
    const year = Number(String(years[i]).slice(0, 4));
    if (Number.isFinite(year) && year >= startYear && year <= endYear) keep.push(i);
  }
  if (keep.length === years.length) return data;
  return {
    ...data,
    x: keep.map((i) => years[i]),
    y: (data.y || []).filter((_, i) => keep.includes(i)),
    series: (data.series || []).map((series) => ({
      ...series,
      values: keep.map((i) => series.values?.[i]),
    })),
  };
}

function filterDataByBounds(data, bounds) {
  if (!data) return data;
  if (!bounds?.start || !bounds?.end) return data;
  const xs = data.x || [];
  if (xs.length && /^\d{4}$/.test(String(xs[0]))) {
    return filterYearSeriesByBounds(data, bounds);
  }
  return filterSeriesByBounds(data, bounds);
}

function filterSeriesLocally(data, asset, metric) {
  if (!data?.series?.length) return data;
  const series = data.series.filter((item) => matchToken(item.name, asset) && matchToken(item.name, metric));
  return { ...data, series };
}

function resolveVisualData(visual, plant, bounds, asset, metric, mode) {
  if (!visual) return null;
  const base = (plant && visual.data_by_plant?.[plant]) || visual.data || null;
  if (!base) return null;
  const bounded = filterDataByBounds(base, bounds);
  if (mode === "xy_series") return filterSeriesLocally(bounded, asset, metric);
  return bounded;
}

function buildDatasets(data, mode) {
  if (!data) return [];
  if (mode === "xy_series") {
    return (data.series || []).slice(0, 8).map((series, idx) => ({
      label: series.name,
      data: series.values || [],
      type: "line",
      borderColor: SERIES_COLORS[idx % SERIES_COLORS.length],
      backgroundColor: `${SERIES_COLORS[idx % SERIES_COLORS.length]}22`,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
    }));
  }
  if (mode === "xy_line") {
    return [{
      label: "Value",
      data: data.y || [],
      type: "line",
      borderColor: "#25d7d7",
      backgroundColor: "rgba(37,215,215,0.16)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
    }];
  }
  return [{
    label: "Value",
    data: data.y || [],
    type: "bar",
    backgroundColor: "rgba(37,215,215,0.65)",
    borderColor: "#25d7d7",
    borderWidth: 1,
    borderRadius: 4,
  }];
}

function chartOptions(mode) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: mode === "xy_series",
        position: "top",
        align: "start",
        labels: { color: C.muted, font: { size: 10 }, boxWidth: 10, padding: 8 },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 8 },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: C.muted, font: { size: 9 } },
        grid: { color: "rgba(255,255,255,0.05)" },
        beginAtZero: true,
      },
    },
  };
}

function ChartCard({ title, data, mode }) {
  const datasets = buildDatasets(data, mode);
  const xs = data?.x || [];
  if (!xs.length || !datasets.length) {
    return html`
      <section style=${card({ padding: 14, display: "flex", flexDirection: "column", minHeight: 260 })}>
        <div style=${{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 8 }}>${title}</div>
        <div style=${{ color: C.muted, fontSize: 13 }}>No values in the active selection.</div>
      </section>
    `;
  }

  return html`
    <section style=${card({ padding: 14, display: "flex", flexDirection: "column", minHeight: 260 })}>
      <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style=${{ fontWeight: 800, fontSize: 15, color: C.text }}>${title}</div>
        <div style=${{ color: C.muted, fontSize: 12 }}>
          ${xs.length.toLocaleString()} points
        </div>
      </div>
      <div style=${{ position: "relative", flex: 1, minHeight: 220 }}>
        <${ChartWrap}
          type=${mode === "xy" ? "bar" : "line"}
          data=${{ labels: xs, datasets }}
          options=${chartOptions(mode)}
        />
      </div>
    </section>
  `;
}

function SeriesPanel({ data }) {
  const names = (data?.series || []).map((series) => series.name);
  return html`
    <section style=${card({ padding: 14 })}>
      <div style=${{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 10 }}>Visible Signals</div>
      <div style=${{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        ${names.length
          ? names.map((name) => html`<span key=${name} style=${{
              padding: "6px 9px",
              borderRadius: 999,
              background: "rgba(37,215,215,0.12)",
              border: `1px solid ${C.line}`,
              color: C.text,
              fontSize: 12,
            }}>${name}</span>`)
          : html`<span style=${{ color: C.muted, fontSize: 13 }}>No series match the active asset/metric filters.</span>`}
      </div>
    </section>
  `;
}

function inferDefault(options, preferred) {
  if (preferred && options.includes(preferred)) return preferred;
  return "";
}

function getSlicerOptions(page, field) {
  const visual = (page.visuals || []).find((item) => item.type === "slicer" && item.data?.field === field);
  return visual?.data?.options || [];
}

export function OperationsMetricPage({ page, manifest, currentDateRange }) {
  const cfg = PAGE_CONFIG[page.slug];
  const visuals = page.visuals || [];
  const plants = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options || [];
  const assetOptions = getSlicerOptions(page, "VARDESC.UD1").filter(Boolean);
  const metricOptions = getSlicerOptions(page, "VARDESC.SHORTNAME").filter(Boolean);
  const anchor = page.date_slicer?.anchor_date || "";
  const initialPlant = page.plant_slicer?.default || plants[0] || "";
  const initialRange = cfg?.defaultRange || currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBounds = getPresetBounds(initialRange, anchor, {
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }) || { start: "", end: "" };

  const [plant, setPlant] = useState(initialPlant);
  const [range, setRange] = useState(initialRange);
  const [asset, setAsset] = useState(inferDefault(assetOptions, cfg?.assetDefault));
  const [metric, setMetric] = useState("");
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const bounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }), [range, anchor, customStart, customEnd]);

  const resolvedCards = useMemo(() => (cfg?.chartCards || []).map((item) => {
    const visual = visuals.find(item.selector);
    return {
      ...item,
      data: resolveVisualData(visual, plant, bounds, asset, metric, item.mode),
    };
  }), [cfg, visuals, plant, bounds, asset, metric]);

  const primarySeriesData = resolvedCards.find((item) => item.mode === "xy_series")?.data || null;
  const visibleSignalCount = primarySeriesData?.series?.length || 0;
  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plantCount = manifest?.totals?.plants || 0;
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,rgba(37,79,140,.2),transparent 26%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh",
      color: C.text,
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14,
      overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 14 }}>
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 16, alignItems: "start" }}>
          <button onClick=${() => { window.location.hash = "#/home"; }}
            style=${card({ height: 64, display: "grid", placeItems: "center", fontSize: 28, color: C.muted, cursor: "pointer" })}>←</button>

          <div>
            <small style=${{ display: "block", color: C.accent, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· ${cfg?.heading || page.display_name}</span>
            </h1>
          </div>

          <div style=${{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: 12 }}>
            <${StatChip} icon="💧" label="Violations" value=${violations} />
            <${StatChip} icon="🏭" label="Plants" value=${plantCount} />
            <${StatChip} icon="📅" label="Last refresh" value=${refresh} valueColor=${C.accent} />
          </div>
        </div>

        <div style=${{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 14 }}>
          <aside style=${{ display: "grid", gap: 14, alignContent: "start" }}>
            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>WWTP</div>
              <select value=${plant} onChange=${(e) => setPlant(e.target.value || "")}
                style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}>
                ${plants.map((option) => html`<option value=${option}>${option}</option>`)}
              </select>
            </section>

            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>Date range</div>
              <select value=${range} onChange=${(e) => setRange(e.target.value)}
                style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14, marginBottom: range === CUSTOM_DATE_RANGE_KEY ? 10 : 0 }}>
                ${dateOptions.map((option) => html`<option value=${option.key}>${option.label}</option>`)}
              </select>
              ${range === CUSTOM_DATE_RANGE_KEY && html`
                <div style=${{ display: "grid", gap: 8 }}>
                  <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${(e) => setCustomStart(e.target.value)}
                    style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }} />
                  <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${(e) => setCustomEnd(e.target.value)}
                    style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }} />
                </div>
              `}
            </section>

            ${assetOptions.length ? html`
              <section style=${card({ padding: 16 })}>
                <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>Asset</div>
                <select value=${asset} onChange=${(e) => setAsset(e.target.value)}
                  style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}>
                  <option value="">All assets</option>
                  ${assetOptions.map((option) => html`<option value=${option}>${option}</option>`)}
                </select>
              </section>
            ` : null}

            ${metricOptions.length ? html`
              <section style=${card({ padding: 16 })}>
                <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>Metric</div>
                <select value=${metric} onChange=${(e) => setMetric(e.target.value)}
                  style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}>
                  <option value="">All metrics</option>
                  ${metricOptions.map((option) => html`<option value=${option}>${option}</option>`)}
                </select>
              </section>
            ` : null}

            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.text, fontWeight: 800, fontSize: 15, marginBottom: 6 }}>${cfg?.heading || page.display_name}</div>
              <div style=${{ color: C.muted, fontSize: 13, lineHeight: 1.55 }}>${cfg?.note || "Process metrics for the active plant and time range."}</div>
              ${cfg?.showSeriesPanel ? html`
              <div style=${{ color: C.muted, fontSize: 12, marginTop: 10 }}>
                  Visible signals: <span style=${{ color: C.text, fontWeight: 700 }}>${visibleSignalCount}</span>
                </div>
              ` : null}
            </section>
          </aside>

          <main style=${{ display: "grid", gap: 14, minHeight: 0 }}>
            <section style=${card({ padding: "12px 14px", display: "grid", gridTemplateColumns: cfg?.showSeriesPanel ? "repeat(3,minmax(0,1fr))" : "repeat(2,minmax(0,1fr))", gap: 12 })}>
              <div style=${{ color: C.muted, fontSize: 13 }}>
                Selected plant: <span style=${{ color: C.text, fontWeight: 700 }}>${plant || "—"}</span>
              </div>
              <div style=${{ color: C.muted, fontSize: 13 }}>
                Asset filter: <span style=${{ color: C.text, fontWeight: 700 }}>${asset || "All assets"}</span>
              </div>
              <div style=${{ color: C.muted, fontSize: 13 }}>
                Metric filter: <span style=${{ color: C.text, fontWeight: 700 }}>${metric || "All metrics"}</span>
              </div>
            </section>

            <div style=${{ display: "grid", gridTemplateColumns: resolvedCards.length > 1 ? "repeat(2,minmax(0,1fr))" : "1fr", gap: 14 }}>
              ${resolvedCards.map((item) => html`<${ChartCard} key=${item.title} title=${item.title} data=${item.data} mode=${item.mode} />`)}
            </div>

            ${cfg?.showSeriesPanel ? html`<${SeriesPanel} data=${primarySeriesData} />` : null}
          </main>
        </div>
      </div>
    </div>
  `;
}
