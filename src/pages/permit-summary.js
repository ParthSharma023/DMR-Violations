// Bespoke page for (Tables) Permitted Capacity Evaluation PBI.
// Renders its own header; app.js skips the generic topbar for this slug.

import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import htm from "htm";
import {
  CUSTOM_DATE_RANGE_KEY,
  getActiveBounds,
  getPresetBounds,
  maxNumeric,
  averageNumeric,
  withCustomDateOption,
} from "../date-range.js";
const html = htm.bind(h);

const C = {
  bg:     "#071423",
  panel:  "#0f2440",
  panel2: "#102845",
  line:   "rgba(110,155,205,.18)",
  text:   "#eef4fb",
  muted:  "#9aaec6",
  accent: "#25d7d7",
  green:  "#0d5f59",
  shadow: "0 10px 30px rgba(0,0,0,.28)",
  r:      16,
};

function card(extra) {
  return {
    background: `linear-gradient(180deg,${C.panel2},${C.panel})`,
    border: `1px solid ${C.line}`,
    borderRadius: C.r,
    boxShadow: C.shadow,
    ...extra,
  };
}

function buildCustomTableData(visual, bounds) {
  const source = visual?.custom_range_source;
  if (!source?.plants?.length) return visual?.data;

  const rows = [];
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
    const useFallback = !activeIdx.length
      && bounds?.start
      && bounds?.end
      && source.fallback_mode === "all_time_when_empty";
    if (!activeIdx.length && !useFallback && bounds?.start && bounds?.end) continue;

    const keep = activeIdx.length ? activeIdx : plantRows.x.map((_, i) => i);
    const metricVals = keep.map((i) => plantRows.value?.[i]);
    const permitVals = keep.map((i) => plantRows.permit?.[i]);
    const metric = maxNumeric(metricVals);
    const permit = averageNumeric(permitVals);
    if (metric == null) continue;
    rows.push([plant, metric, (metric != null && permit) ? (metric / permit) : null]);
  }

  return {
    ...(visual?.data || {}),
    rows,
  };
}

// ── PBIX-matched conditional formatting ────────────────────────────
function pbixCellStyle(kind, value) {
  if (value == null || typeof value !== "number") return null;

  if (kind === "permit-pct") {
    if (value >= 0.65 && value < 0.70) return { backgroundColor: "#f7e9b5", color: "#111827" };
    if (value >= 0.70 && value < 0.75) return { backgroundColor: "#ECC846", color: "#111827" };
    if (value >= 0.75 && value < 0.90) return { backgroundColor: "#CD4C46", color: "#111827" };
    if (value >= 0.90 && value < 1.50) return { backgroundColor: "#666666", color: "#eef4fb" };
    return null;
  }

  if (kind === "permit-limit") {
    if (value === 1) return { backgroundColor: "#ECC846", color: "#111827" };
    if (value > 0 && value < 1) return { backgroundColor: "#73B761", color: "#111827" };
  }

  return null;
}

// ── Custom table card ─────────────────────────────────────────────
function TableCard({ title, icon, visual, colCfg, children }) {
  const rows = visual?.data?.rows || [];
  const cols = colCfg.length;
  const gridCols = colCfg.map(c => c.fr || "1fr").join(" ");
  return html`
    <section style=${card({ padding: 14, display: "flex", flexDirection: "column", overflow: "hidden" })}>
      <div style=${{ fontWeight: 800, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
        <span style=${{ color: C.accent }}>${icon}</span>
        <span style=${{ color: C.text }}>${title}</span>
      </div>
      <!-- header row -->
      <div style=${{ display: "grid", gridTemplateColumns: gridCols, gap: 8, color: C.muted, fontSize: 11, fontWeight: 700, borderBottom: `1px solid ${C.line}`, paddingBottom: 7, marginBottom: 3 }}>
        ${colCfg.map(c => html`<div style=${{ textTransform: "uppercase", letterSpacing: "0.04em" }}>${c.label}</div>`)}
      </div>
      <!-- data rows -->
      <div style=${{ flex: 1, overflowY: "auto" }}>
        ${rows.map((row, ri) => html`
          <div key=${ri} style=${{ display: "grid", gridTemplateColumns: gridCols, gap: 8, padding: "4px 0", fontSize: 12.5, borderBottom: `1px solid rgba(255,255,255,.04)` }}>
            ${colCfg.map((c, ci) => {
              const val = row[c.col ?? ci];
              let text = val == null ? "—"
                : typeof val === "number"
                  ? c.pct
                    ? `${(val * 100).toFixed(c.digits ?? 2)}%`
                    : val.toLocaleString(undefined, {
                        minimumFractionDigits: c.minDigits ?? 0,
                        maximumFractionDigits: c.maxDigits ?? 2,
                      })
                  : String(val);
              const cellStyle = pbixCellStyle(c.style, val);
              return html`<div style=${{
                ...(cellStyle ? { ...cellStyle, borderRadius: 0, padding: "2px 5px", fontWeight: 600 } : {}),
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>${text}</div>`;
            })}
          </div>
        `)}
      </div>
      ${children}
    </section>
  `;
}

// ── Stat chip (top-right) ─────────────────────────────────────────
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

// ── Sidebar nav button ────────────────────────────────────────────
function SideNavBtn({ btn, active }) {
  return html`
    <button onClick=${() => { if (btn.action_target_slug) window.location.hash = `#/${btn.action_target_slug}`; }}
      style=${{
        padding: "14px 16px", borderRadius: 13,
        border: `1px solid ${C.line}`,
        background: active
          ? `linear-gradient(180deg,${C.green},#0b4e49)`
          : `linear-gradient(180deg,#102743,#0d2139)`,
        color: active ? C.accent : C.muted,
        fontFamily: "inherit", fontWeight: 700, fontSize: 13,
        textAlign: "left", cursor: "pointer", width: "100%",
        transition: "background 0.12s, color 0.12s",
        display: "flex", alignItems: "center", gap: 10,
      }}>
      <span style=${{ opacity: 0.7, fontSize: "0.95rem" }}>☰</span>
      ${btn.button_text || btn.title || "—"}
    </button>
  `;
}

// ── Main export ────────────────────────────────────────────────────
export function PermitSummaryPage({ page, manifest, currentDateRange }) {
  const visuals = page.visuals || [];
  const dateOpts = page.date_slicer?.options || [];
  const anchor = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const calendarMonthRanges = { last_12_months: 12, last_5_years: 60 };
  const initialBounds = getPresetBounds(initialRange, anchor, { calendarMonthRanges }) || { start: "", end: "" };
  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges,
  }), [range, anchor, customStart, customEnd]);

  // Project for date range
  function proj(v) {
    if (!v) return v;
    if (v.custom_range_source) {
      return {
        ...v,
        data: buildCustomTableData(v, activeBounds),
      };
    }
    if (range && v.data_by_date_range?.[range]) {
      return { ...v, data: v.data_by_date_range[range] };
    }
    return v;
  }

  const npdesVis = proj(visuals.find(v => (v.title || "").includes("NPDES")));
  const aafVis   = proj(visuals.find(v => (v.title || "").includes("Permit Evaluation, AAF")));
  const r7590Vis = proj(visuals.find(v => (v.title || "").includes("75/90")));

  const npdesRows = npdesVis?.data?.rows || [];

  const navBtns = useMemo(() =>
    visuals.filter(v => v.type === "actionButton" && v.action_target_slug && !/^home$/i.test(v.button_text || "")),
  [visuals]);

  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plants     = manifest?.totals?.plants || 0;
  const refresh    = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,rgba(37,79,140,.2),transparent 26%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14, overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 14 }}>

        <!-- TOP ROW -->
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 16, alignItems: "start" }}>
          <button onClick=${() => { window.location.hash = "#/home"; }}
            style=${card({ height: 64, display: "grid", placeItems: "center", fontSize: 28, color: C.muted, cursor: "pointer" })}>←</button>

          <div>
            <small style=${{ display: "block", color: C.accent, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· Permitted Capacity Evaluation PBI</span>
            </h1>
          </div>

          <div style=${{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: 12 }}>
            <${StatChip} icon="💧" label="Violations"   value=${violations} />
            <${StatChip} icon="🏭" label="Plants"       value=${plants} />
            <${StatChip} icon="📅" label="Last refresh" value=${refresh} valueColor=${C.accent} />
          </div>
        </div>

        <!-- MAIN 3-COL LAYOUT -->
        <div style=${{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 14 }}>

          <!-- LEFT SIDEBAR -->
          <aside style=${{ display: "grid", gap: 14, alignContent: "start" }}>
            <div style=${card({ padding: 14 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 12, marginBottom: 10 }}>Date Range</div>
              <select value=${range}
                onChange=${e => setRange(e.target.value || "")}
                style=${{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 14px", border: `1px solid ${C.line}`, borderRadius: 12,
                  background: "#0a1c31", color: C.text, fontFamily: "inherit",
                  fontSize: 13, width: "100%",
                }}>
                ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
              </select>
              ${range === CUSTOM_DATE_RANGE_KEY && html`
                <div style=${{ display: "grid", gap: 8, marginTop: 10 }}>
                  <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                    style=${{
                      width: "100%", padding: "11px 14px", border: `1px solid ${C.line}`, borderRadius: 12,
                      background: "#0a1c31", color: C.text, fontFamily: "inherit", fontSize: 13,
                    }} />
                  <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                    style=${{
                      width: "100%", padding: "11px 14px", border: `1px solid ${C.line}`, borderRadius: 12,
                      background: "#0a1c31", color: C.text, fontFamily: "inherit", fontSize: 13,
                    }} />
                </div>
              `}
            </div>
            <div style=${{ display: "grid", gap: 10 }}>
              ${navBtns.map(btn => html`<${SideNavBtn} btn=${btn} active=${false} />`)}
            </div>
          </aside>

          <!-- CENTER: 3 TABLE CARDS -->
          <div style=${{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.15fr", gap: 14, minWidth: 0 }}>
            <${TableCard} icon="🛡" title="NPDES Permit Limits" visual=${npdesVis}
              colCfg=${[
                { label: "WWTP", fr: "1.3fr" },
                { label: "Permit Limit (mgd)", fr: ".9fr", minDigits: 2, maxDigits: 2, style: "permit-limit" },
              ]}
            />
            <${TableCard} icon="📈" title="Permit Evaluation, AAF" visual=${aafVis}
              colCfg=${[
                { label: "WWTP", fr: "1.05fr" },
                { label: "Max CurVal (mgd)", fr: ".9fr", minDigits: 2, maxDigits: 2 },
                { label: "Max AAF%", fr: ".9fr", pct: true, col: 2, digits: 0, style: "permit-pct" },
              ]}
            />
            <${TableCard} icon="⚖" title="Permit Evaluation, 75/90 (≤1 mgd)" visual=${r7590Vis}
              colCfg=${[
                { label: "WWTP", fr: "1.05fr" },
                { label: "Rolling 3mo Max", fr: ".9fr", minDigits: 2, maxDigits: 2 },
                { label: "% of Permit", fr: ".9fr", pct: true, col: 2, digits: 2, style: "permit-pct" },
              ]}
            />
          </div>
        </div>

        <!-- FOOTER -->
        <div style=${{ display: "flex", justifyContent: "space-between", color: C.muted, paddingTop: 6, borderTop: `1px solid rgba(255,255,255,.08)`, fontSize: 11 }}>
          <div>All flows in mgd (million gallons per day). Data refreshed daily.</div>
          <div>Questions or feedback? Contact <span style=${{ color: C.accent }}>WWIP Support</span></div>
        </div>
      </div>
    </div>
  `;
}
