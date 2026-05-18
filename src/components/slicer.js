// Slicer — renders a dropdown of the options the aggregator produced.
// If this is the plant slicer on its page, changing it updates the global
// filter state so downstream visuals re-render with the selected plant's data.
// If this is the date slicer, it renders a canonical-windows dropdown
// ("Last 30 days" / "Last 90 days" / …) instead of the raw 500-item date list.

import { h } from "preact";
import htm from "htm";
import { state, setCurrentPlant, setCurrentDateRange } from "../state.js";
const html = htm.bind(h);

export function Slicer({ visual, isPlantSlicer, isDateSlicer, dateRangeOptions }) {
  const d = visual.data;
  if (!d || d.shape !== "slicer") return null;
  const label = visual.title || (d.field || "").split(".").pop();

  // Date slicer — canonical windows override the raw date options.
  if (isDateSlicer && dateRangeOptions && dateRangeOptions.length) {
    const value = state.filters.currentDateRange || "";
    const onChange = (e) => setCurrentDateRange(e.target.value || null);
    return html`
      <div style=${{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        background: "var(--surface-2)",
        border: "1px solid var(--accent)",
        borderRadius: "4px",
        padding: "6px 8px",
        overflow: "hidden",
      }}>
        <div style=${{
          color: "var(--accent)",
          fontSize: "0.66rem", fontWeight: 700,
          letterSpacing: "0.04em", textTransform: "uppercase",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>Date range</div>
        <select
          value=${value}
          onChange=${onChange}
          style=${{
            marginTop: 4, padding: "4px 6px",
            background: "var(--surface)", color: "var(--text)",
            border: "1px solid var(--border)", borderRadius: "3px",
            fontSize: "0.82rem",
          }}
        >
          ${dateRangeOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
        </select>
      </div>
    `;
  }

  const value = isPlantSlicer ? (state.filters.currentPlant || "") : "";
  const onChange = (e) => {
    if (isPlantSlicer) setCurrentPlant(e.target.value || null);
  };

  return html`
    <div style=${{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      background: "var(--surface-2)",
      border: isPlantSlicer ? "1px solid var(--accent)" : "1px solid var(--border)",
      borderRadius: "4px",
      padding: "6px 8px",
      overflow: "hidden",
    }}>
      <div style=${{
        color: isPlantSlicer ? "var(--accent)" : "var(--muted)",
        fontSize: "0.66rem", fontWeight: 700,
        letterSpacing: "0.04em", textTransform: "uppercase",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${isPlantSlicer ? "WWTP" : label}</div>
      <select
        value=${value}
        onChange=${onChange}
        style=${{
          marginTop: 4, padding: "4px 6px",
          background: "var(--surface)", color: "var(--text)",
          border: "1px solid var(--border)", borderRadius: "3px",
          fontSize: "0.82rem",
        }}
      >
        <option value="">All (${d.options.length})</option>
        ${d.options.map(o => html`<option value=${o}>${o}</option>`)}
      </select>
    </div>
  `;
}
