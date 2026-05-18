// Flat data table. Used for tableEx and (degraded) pivotTable.

import { h } from "preact";
import htm from "htm";
const html = htm.bind(h);
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtCell(v, fmt) {
  if (v == null) return { text: "" };
  if (fmt?.format === "percent" && typeof v === "number") {
    const decimals = fmt.decimals ?? 0;
    const text = (v * 100).toFixed(decimals) + "%";
    let bg = null;
    for (const t of (fmt.thresholds || [])) {
      if (v < t.max) { bg = t.color; break; }
    }
    return { text, bg };
  }
  if (typeof v === "number") {
    if (Number.isInteger(v) && Math.abs(v) < 1e6) return { text: v.toLocaleString() };
    return { text: v.toLocaleString(undefined, { maximumFractionDigits: 2 }) };
  }
  return { text: String(v) };
}

function cleanHeader(s) {
  let text = String(s || "");
  const aggMatch = text.match(/^[A-Z][A-Za-z0-9_.]*\((.*)\)$/);
  if (aggMatch) text = aggMatch[1];
  const hierarchyParts = text.split(".").filter(Boolean);
  if (hierarchyParts.length) text = hierarchyParts[hierarchyParts.length - 1];
  return text
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fmtDimensionCell(v, header) {
  const cleaned = String(header || "").toLowerCase();
  if (cleaned === "month" && Number.isInteger(v) && v >= 1 && v <= 12) {
    return { text: MONTH_LABELS[v - 1] };
  }
  return fmtCell(v);
}

function PivotTable({ visual, d }) {
  const rowHeaders = (d.row_fields || []).map(cleanHeader);
  return html`
    <div style=${{
      width: "100%", height: "100%", overflow: "auto",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
      fontSize: "0.78rem",
    }}>
      ${visual.title && html`<div style=${{
        padding: "6px 10px",
        color: "var(--text)", fontWeight: 600,
        borderBottom: "1px solid var(--border)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${visual.title}</div>`}
      <table style=${{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            ${rowHeaders.map(rh => html`<th style=${{
              position: "sticky", top: 0, background: "var(--surface-3)",
              color: "var(--muted)", fontSize: "0.68rem", fontWeight: 700,
              letterSpacing: "0.03em", textTransform: "uppercase",
              padding: "6px 8px", textAlign: "left",
              borderBottom: "1px solid var(--border)",
            }}>${rh}</th>`)}
            ${(d.col_labels || []).map(cl => html`<th style=${{
              position: "sticky", top: 0, background: "var(--surface-3)",
              color: "var(--muted)", fontSize: "0.68rem", fontWeight: 700,
              letterSpacing: "0.03em", textTransform: "uppercase",
              padding: "6px 8px", textAlign: "right",
              borderBottom: "1px solid var(--border)",
            }}>${cl}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${(d.row_labels || []).map((rl, i) => html`<tr>
            ${rl.map((cell, idx) => {
              const rendered = fmtDimensionCell(cell, rowHeaders[idx]);
              return html`<td style=${{
                padding: "4px 8px", borderBottom: "1px solid rgba(43,74,84,0.35)",
                color: "var(--text)", fontWeight: 600,
                whiteSpace: "nowrap",
              }}>${rendered.text}</td>`;
            })}
            ${(d.matrix[i] || []).map(v => {
              const rendered = fmtCell(v);
              const style = {
                padding: "4px 8px", borderBottom: "1px solid rgba(43,74,84,0.35)",
                color: "var(--text)", textAlign: "right",
                whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
              };
              if (rendered.bg) style.backgroundColor = rendered.bg;
              return html`<td style=${style}>${rendered.text}</td>`;
            })}
          </tr>`)}
        </tbody>
      </table>
    </div>
  `;
}

export function DataTable({ visual }) {
  const d = visual.data;
  if (!d) return null;
  if (d.shape === "pivot") return html`<${PivotTable} visual=${visual} d=${d} />`;
  if (d.shape !== "table") return null;
  // visual.column_labels can remap either raw queryref (e.g. "Sum(LIMITS.LIMIT_VALUE)")
  // or the auto-cleaned header (e.g. "LIMIT_VALUE") to a display name.
  const labels = visual.column_labels || {};
  // visual.column_formats keyed the same way — raw queryref OR cleaned name.
  // Values: { format: "percent", decimals?, thresholds: [{max, color}] }
  const formats = visual.column_formats || {};
  const colCleaned = d.columns.map(c =>
    c.replace(/^.*?\./, "").replace(/^[A-Z]\w*\(/, "").replace(/\)$/, ""));
  const colHeaders = d.columns.map((c, i) => labels[c] || labels[colCleaned[i]] || colCleaned[i]);
  const colFmts = d.columns.map((c, i) => formats[c] || formats[colCleaned[i]] || null);
  return html`
    <div style=${{
      width: "100%", height: "100%", overflow: "auto",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
      fontSize: "0.78rem",
    }}>
      ${visual.title && html`<div style=${{
        padding: "6px 10px",
        color: "var(--text)", fontWeight: 600,
        borderBottom: "1px solid var(--border)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${visual.title}</div>`}
      <table style=${{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            ${colHeaders.map(ch => html`<th style=${{
              position: "sticky", top: 0, background: "var(--surface-3)",
              color: "var(--muted)", fontSize: "0.68rem", fontWeight: 700,
              letterSpacing: "0.03em", textTransform: "uppercase",
              padding: "6px 8px", textAlign: "left",
              borderBottom: "1px solid var(--border)",
            }}>${ch}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${d.rows.slice(0, 500).map(row => html`<tr>
            ${row.map((c, i) => {
              const cell = fmtCell(c, colFmts[i]);
              const style = {
                padding: "4px 8px", borderBottom: "1px solid rgba(43,74,84,0.35)",
                color: "var(--text)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200,
              };
              if (cell.bg) { style.backgroundColor = cell.bg; style.fontWeight = 600; }
              if (colFmts[i]?.format === "percent") style.textAlign = "right";
              return html`<td style=${style}>${cell.text}</td>`;
            })}
          </tr>`)}
        </tbody>
      </table>
    </div>
  `;
}
