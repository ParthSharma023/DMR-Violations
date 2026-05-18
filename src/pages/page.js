// Generic page renderer — turns a page spec into absolute-positioned visuals
// on the PBIX canvas (1280×720 default). The parent .page-canvas handles scaling.

import { h } from "preact";
import htm from "htm";
import { VisualRouter } from "../components/index.js";

const html = htm.bind(h);

export function PageCanvas({ page, currentPlant, currentDateRange }) {
  const { width = 1280, height = 720 } = page.canvas || {};
  const plantSlicerName = page.plant_slicer?.visual_name || null;
  const plantSlicerField = page.plant_slicer?.field || null;
  const dateSlicerName  = page.date_slicer?.visual_name  || null;
  const dateSlicerField = page.date_slicer?.field || null;
  const dateRangeOptions = page.date_slicer?.options || null;
  const keepSlicerByField = new Map();
  for (const visual of (page.visuals || [])) {
    if (visual.type !== "slicer") continue;
    const field = visual.data?.field || null;
    if (!field) continue;
    if (field !== plantSlicerField && field !== dateSlicerField) continue;
    const prev = keepSlicerByField.get(field);
    const z = visual.position?.z || 0;
    const prevZ = prev?.position?.z || 0;
    if (!prev || z >= prevZ) keepSlicerByField.set(field, visual);
  }

  const visuals = (page.visuals || []).filter((visual) => {
    if (visual.type !== "slicer") return true;
    const field = visual.data?.field || null;
    if (!field) return true;
    const keeper = keepSlicerByField.get(field);
    if (!keeper) return true;
    return keeper.name === visual.name;
  });

  return html`
    <div class="page-canvas" style=${{ width: `${width}px`, height: `${height}px` }}>
      ${visuals.map(v => {
        const { x = 0, y = 0, width: w = 200, height: hh = 50, z = 0 } = v.position || {};
        const style = {
          left:   `${x}px`,
          top:    `${y}px`,
          width:  `${w}px`,
          height: `${hh}px`,
          zIndex: z,
        };
        return html`<div class="visual" style=${style} key=${v.name}>
          <${VisualRouter} visual=${v}
                          plantSlicerName=${plantSlicerName}
                          plantSlicerField=${plantSlicerField}
                          currentPlant=${currentPlant}
                          dateSlicerName=${dateSlicerName}
                          dateSlicerField=${dateSlicerField}
                          currentDateRange=${currentDateRange}
                          dateRangeOptions=${dateRangeOptions} />
        </div>`;
      })}
    </div>
  `;
}
