import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import htm from "htm";
import {
  CUSTOM_DATE_RANGE_KEY,
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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

function getPageConfig(slug, pivotTitle) {
  if (slug === "dmr-monthlyadf-for-7590-rules") {
    return {
      accentTitle: "Monthly Average Daily Effluent Flow",
      sectionTitle: "Monthly ADF History",
      sectionNote: "Monthly average daily effluent flow used for 75/90 rule evaluation.",
      tableTitle: pivotTitle || "Monthly Average Daily Effluent Flow, MGD",
    };
  }
  return {
    accentTitle: "Monthly Annual Average Flow",
    sectionTitle: "Monthly AAF History",
    sectionNote: "Annual average flow reported monthly, estimated from the previous 12 months.",
    tableTitle: pivotTitle || "Annual Average Flow, MGD Reported Monthly",
  };
}

function filterPivotByBounds(data, bounds) {
  if (!data || !bounds?.start || !bounds?.end) return data;
  const rowLabels = data.row_labels || [];
  const matrix = data.matrix || [];
  const keep = [];
  for (let i = 0; i < rowLabels.length; i += 1) {
    const row = rowLabels[i] || [];
    const year = row[0];
    const month = row[1];
    if (!Number.isInteger(year) || !Number.isInteger(month)) continue;
    const key = `${year}-${String(month).padStart(2, "0")}-01`;
    if (key >= bounds.start && key <= bounds.end) keep.push(i);
  }
  if (keep.length === rowLabels.length) return data;
  return {
    ...data,
    row_labels: keep.map((i) => rowLabels[i]),
    matrix: keep.map((i) => matrix[i]),
  };
}

function TableCard({ title, data }) {
  const rowLabels = data?.row_labels || [];
  const matrix = data?.matrix || [];
  const colLabels = data?.col_labels || [];
  const valueHeader = colLabels[0] || "Value";

  return html`
    <section style=${card({ padding: 14, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" })}>
      <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <div style=${{ fontWeight: 800, fontSize: 15, color: C.text }}>${title}</div>
          <div style=${{ color: C.muted, fontSize: 12, marginTop: 3 }}>Monthly pivot view for the selected WWTP and date window</div>
        </div>
        <div style=${{ color: C.muted, fontSize: 12, whiteSpace: "nowrap" }}>
          ${rowLabels.length.toLocaleString()} rows
        </div>
      </div>

      <div style=${{ overflow: "auto", flex: 1, borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(4,15,27,.35)" }}>
        <table style=${{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              ${["Year", "Month", valueHeader].map((label, idx) => html`
                <th key=${label} style=${{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  background: "#24395d",
                  color: idx < 2 ? C.muted : "#dbe6f4",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textAlign: idx < 2 ? "left" : "right",
                  padding: "10px 12px",
                  borderBottom: `1px solid ${C.line}`,
                }}>${label}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${rowLabels.map((row, idx) => {
              const year = row?.[0];
              const month = row?.[1];
              const value = matrix?.[idx]?.[0];
              const valueText = typeof value === "number"
                ? value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                : "—";
              return html`
                <tr key=${`${year}-${month}-${idx}`}>
                  <td style=${{
                    padding: "6px 12px",
                    borderBottom: `1px solid rgba(255,255,255,.04)`,
                    color: C.text,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}>${Number.isInteger(year) ? year.toLocaleString() : "—"}</td>
                  <td style=${{
                    padding: "6px 12px",
                    borderBottom: `1px solid rgba(255,255,255,.04)`,
                    color: C.text,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}>${Number.isInteger(month) && month >= 1 && month <= 12 ? MONTH_LABELS[month - 1] : "—"}</td>
                  <td style=${{
                    padding: "6px 12px",
                    borderBottom: `1px solid rgba(255,255,255,.04)`,
                    color: C.text,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}>${valueText}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function MonthlyFlowTablePage({ page, manifest, currentDateRange }) {
  const pivotVisual = (page.visuals || []).find((visual) => visual.type === "pivotTable");
  const plants = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options || [];
  const anchor = page.date_slicer?.anchor_date || "";
  const initialPlant = page.plant_slicer?.default || plants[0] || "";
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBounds = getPresetBounds(initialRange, anchor, {
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }) || { start: "", end: "" };

  const [plant, setPlant] = useState(initialPlant);
  const [range, setRange] = useState(initialRange);
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

  const baseData = (plant && pivotVisual?.data_by_plant?.[plant]) || pivotVisual?.data;
  const tableData = useMemo(() => {
    if (!baseData) return null;
    if (range === "all_time") return baseData;
    return filterPivotByBounds(baseData, bounds);
  }, [baseData, bounds, range]);

  const cfg = getPageConfig(page.slug, pivotVisual?.title);
  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plantCount = manifest?.totals?.plants || 0;
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);
  const selectedLabel = plants.includes(plant) ? plant : "All Plants";

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
              WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· ${cfg.accentTitle}</span>
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
              <select
                value=${plant}
                onChange=${(e) => setPlant(e.target.value || "")}
                style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}
              >
                ${plants.map((option) => html`<option value=${option}>${option}</option>`)}
              </select>
              <div style=${{ color: C.muted, fontSize: 12, marginTop: 10 }}>Current selection: ${selectedLabel}</div>
            </section>

            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>Date range</div>
              <select
                value=${range}
                onChange=${(e) => setRange(e.target.value)}
                style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14, marginBottom: range === CUSTOM_DATE_RANGE_KEY ? 10 : 0 }}
              >
                ${dateOptions.map((option) => html`<option value=${option.key}>${option.label}</option>`)}
              </select>
              ${range === CUSTOM_DATE_RANGE_KEY && html`
                <div style=${{ display: "grid", gap: 8 }}>
                  <input
                    type="date"
                    value=${customStart}
                    max=${customEnd || undefined}
                    onInput=${(e) => setCustomStart(e.target.value)}
                    style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}
                  />
                  <input
                    type="date"
                    value=${customEnd}
                    min=${customStart || undefined}
                    onInput=${(e) => setCustomEnd(e.target.value)}
                    style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}
                  />
                </div>
              `}
            </section>

            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.text, fontWeight: 800, fontSize: 15, marginBottom: 6 }}>${cfg.sectionTitle}</div>
              <div style=${{ color: C.muted, fontSize: 13, lineHeight: 1.55 }}>${cfg.sectionNote}</div>
            </section>
          </aside>

          <main style=${{ display: "grid", minHeight: 0 }}>
            <${TableCard} title=${cfg.tableTitle} data=${tableData} />
          </main>
        </div>
      </div>
    </div>
  `;
}
