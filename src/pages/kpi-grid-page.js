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
  bg: "#071425",
  card: "#10253f",
  line: "rgba(120,170,220,.16)",
  text: "#eef4fb",
  muted: "#9db0c7",
  accent: "#27d7d7",
};

const SERIES_COLORS = ["#27d7d7", "#5da8ff", "#9fd356", "#f2c14e", "#ef9447", "#d74c45"];
const LIMIT_COLORS = ["#f2c14e", "#ef9447", "#d74c45", "#b984ff"];

function resolveSeries(visual, plant, bounds) {
  const base = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  return filterSeriesByBounds(base, bounds);
}

function tileDatasets(data) {
  const series = data?.series || [];
  const ySeries = series.filter((item) => item.role === "y" || !item.role);
  const y2Series = series.filter((item) => item.role === "y2");
  return [
    ...ySeries.map((item, idx) => ({
      label: item.name,
      data: item.values || [],
      type: "line",
      borderColor: SERIES_COLORS[idx % SERIES_COLORS.length],
      backgroundColor: `${SERIES_COLORS[idx % SERIES_COLORS.length]}22`,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 2,
    })),
    ...y2Series.map((item, idx) => ({
      label: item.name,
      data: item.values || [],
      type: "line",
      borderColor: LIMIT_COLORS[idx % LIMIT_COLORS.length],
      borderWidth: idx === 0 ? 2.25 : 1.5,
      borderDash: idx === 0 ? [] : [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 1,
    })),
  ];
}

function TileChart({ visual, plant, bounds }) {
  const data = useMemo(() => resolveSeries(visual, plant, bounds), [visual, plant, bounds]);
  const datasets = tileDatasets(data);
  if (!data?.x?.length || !datasets.length) {
    return html`<div style=${emptyStateStyle()}>No values in the active date window.</div>`;
  }

  const allValues = datasets.flatMap((item) => item.data || []).filter((value) => typeof value === "number" && Number.isFinite(value));
  const maxValue = allValues.length ? Math.max(...allValues) * 1.1 : undefined;
  const showLegend = datasets.length > 1 && datasets.length <= 4;

  return html`
    <div style=${{ position: "relative", flex: 1, minHeight: 0 }}>
      <${ChartWrap}
        type="line"
        data=${{ labels: data.x, datasets }}
        options=${{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: showLegend,
              position: "top",
              align: "start",
              labels: { color: C.muted, font: { size: 10 }, boxWidth: 10, padding: 8 },
            },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 6 },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: C.muted, font: { size: 9 } },
              grid: { color: "rgba(255,255,255,0.05)" },
              suggestedMin: 0,
              max: maxValue,
              title: {
                display: !!visual?.custom_units,
                text: visual?.custom_units || "",
                color: C.muted,
                font: { size: 10 },
              },
            },
          },
        }}
      />
    </div>
  `;
}

export function KpiGridPage({ page, manifest, currentDateRange }) {
  const meta = page.custom_kpi_meta || {};
  const visuals = page.visuals || [];
  const plants = page.plant_slicer?.options || [];
  const dateOptions = useMemo(() => withCustomDateOption(page.date_slicer?.options || []), [page.date_slicer?.options]);
  const anchor = page.date_slicer?.anchor_date || "";
  const calendarMonthRanges = useMemo(() => ({ last_12_months: 12, last_5_years: 60 }), []);

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [plantSearch, setPlantSearch] = useState("");
  const [range, setRange] = useState(currentDateRange || page.date_slicer?.default || "last_5_years");
  const initialBounds = getPresetBounds(range, anchor, { calendarMonthRanges }) || { start: "", end: "" };
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

  const tiles = useMemo(
    () => (meta.tile_order || []).map((idx) => visuals[idx]).filter(Boolean),
    [meta.tile_order, visuals],
  );

  return html`
    <div style=${shellStyle()}>
      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }} style=${buttonStyle()}>←</button>
        <div>
          <small style=${topLabelStyle()}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· ${meta.page_heading || page.display_name}</span>
          </h1>
          ${meta.page_subtitle && html`<div style=${{ marginTop: 6, color: C.muted, fontSize: 13 }}>${meta.page_subtitle}</div>`}
        </div>
        <div style=${panelStyle({ minWidth: 220 })}>
          <div style=${sectionTitleStyle()}>Date Range</div>
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

      <section style=${panelStyle({
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
        gap: 12,
      })}>
        <div style=${{ color: C.muted, fontSize: 13 }}>
          Selected plant: <span style=${{ color: C.text, fontWeight: 700 }}>{plant || "—"}</span>
        </div>
        <div style=${{ color: C.muted, fontSize: 12 }}>
          ${tiles.length} curated tiles
        </div>
        <div style=${{ color: C.muted, fontSize: 12 }}>
          Last refresh: <span style=${{ color: C.text }}>{(manifest?.last_refresh || "—").slice(0, 10)}</span>
        </div>
      </section>

      <main style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, minHeight: 0 }}>
        <aside style=${panelStyle({ padding: 12, overflow: "auto" })}>
          <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
          <input value=${plantSearch} onInput=${(e) => setPlantSearch(e.target.value)} placeholder="Search WWTP" style=${{ ...inputStyle(), marginBottom: 8 }} />
          <div style=${{ display: "grid", gap: 4 }}>
            ${filteredPlants.map((item) => html`
              <label key=${item} style=${radioRowStyle(item === plant)}>
                <input type="radio" name=${`kpi-grid-plant-${page.slug}`} checked=${item === plant} onChange=${() => setPlant(item)} style=${{ accentColor: C.accent }} />
                ${item}
              </label>
            `)}
          </div>
        </aside>

        <div style=${panelStyle({ padding: 12, overflow: "auto", minHeight: 0 })}>
          <div style=${{
            display: "grid",
            gridTemplateColumns: `repeat(${meta.columns || 3}, minmax(0, 1fr))`,
            gap: 12,
          }}>
            ${tiles.map((visual, idx) => html`
              <section key=${idx} style=${tilePanelStyle()}>
                <div style=${tileTitleStyle()}>${visual.title || `Tile ${idx + 1}`}</div>
                <${TileChart} visual=${visual} plant=${plant} bounds=${activeBounds} />
              </section>
            `)}
          </div>
        </div>
      </main>

      <footer style=${footerStyle()}>
        <span>${meta.footer_copy || "Curated KPI tiles are rebuilt for the active plant and date range."}</span>
        <span>${plants.length} plants in the current WWTP list.</span>
      </footer>
    </div>
  `;
}

function shellStyle() {
  return {
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
  };
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

function tilePanelStyle() {
  return {
    background: "rgba(6, 17, 29, 0.5)",
    border: `1px solid ${C.line}`,
    borderRadius: 12,
    padding: "10px 12px",
    minHeight: 228,
    display: "flex",
    flexDirection: "column",
    gap: 8,
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
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: ".04em",
  };
}

function tileTitleStyle() {
  return {
    fontWeight: 700,
    fontSize: 12,
    color: C.text,
    letterSpacing: ".01em",
    minHeight: 30,
  };
}

function emptyStateStyle() {
  return {
    color: C.muted,
    fontSize: 12,
    display: "grid",
    placeItems: "center",
    minHeight: 140,
    flex: 1,
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
