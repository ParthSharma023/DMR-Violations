// Placeholder component used for every visual type that doesn't have
// a real renderer yet (phase 5E/5F will add them).

import { h } from "preact";
import htm from "htm";
const html = htm.bind(h);

export function VisualPlaceholder({ visual }) {
  const proj = visual.projections || {};
  const projSummary = Object.entries(proj)
    .filter(([, v]) => v && v.length)
    .map(([k, v]) => `${k}: ${v.join(", ")}`)
    .join(" • ");
  return html`
    <div class="visual-placeholder">
      <div class="vp-type">${visual.type}</div>
      ${visual.title && html`<div class="vp-title">${visual.title}</div>`}
      ${projSummary && html`<div class="vp-binding">${projSummary}</div>`}
    </div>
  `;
}
