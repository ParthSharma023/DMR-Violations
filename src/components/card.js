// Card / KPI — single metric with a title.

import { h } from "preact";
import htm from "htm";
const html = htm.bind(h);

function fmtValue(v) {
  if (v == null) return "—";
  if (typeof v === "number") {
    const abs = Math.abs(v);
    if (Number.isInteger(v) && abs < 1e6) return v.toLocaleString();
    if (abs >= 1000)   return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (abs >= 1)      return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (abs > 0)       return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return "0";
  }
  return String(v);
}

export function Card({ visual }) {
  const d = visual.data;
  const val = d?.value;
  const label = visual.title || (d?.binding || "").replace(/.*\./, "");
  return html`
    <div style=${{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "8px 12px",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
    }}>
      <div style=${{
        color: "var(--muted)", fontSize: "0.7rem",
        fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${label}</div>
      <div style=${{
        color: "var(--accent)", fontSize: "1.35rem",
        fontWeight: 700, marginTop: 2,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${fmtValue(val)}</div>
    </div>
  `;
}
