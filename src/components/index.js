// Visual-type dispatcher. Maps PBIX visualType → component.
// Any type with aggregable data (visual.data) routes to the right renderer;
// otherwise we fall back to the placeholder showing the field binding.

import { h } from "preact";
import htm from "htm";
import { NavButton } from "./nav-button.js";
import { VisualPlaceholder } from "./visual-placeholder.js";
import { Card }       from "./card.js";
import { Slicer }     from "./slicer.js";
import { XYChart }    from "./xy-chart.js";
import { ComboChart } from "./combo-chart.js";
import { DataTable }  from "./table.js";

const html = htm.bind(h);

const REGISTRY = {
  // layout / nav
  actionButton: NavButton,
  textbox:      ({ visual }) => html`<div class="visual-textbox">${visual.textbox_text || visual.title || ""}</div>`,
  shape:        () => html`<div class="visual-shape"></div>`,
  basicShape:   () => html`<div class="visual-shape"></div>`,
  image:        () => html`<div class="visual-shape"></div>`,

  // data-bound
  card:                             Card,
  kpi:                              Card,
  slicer:                           Slicer,
  areaChart:                        XYChart,
  lineChart:                        XYChart,
  clusteredColumnChart:             XYChart,
  columnChart:                      XYChart,
  hundredPercentStackedColumnChart: XYChart,
  lineClusteredColumnComboChart:    ComboChart,
  lineStackedColumnComboChart:      ComboChart,
  tableEx:                          DataTable,
  pivotTable:                       DataTable,   // degrades to flat table for now
};

// For a visual with `data_by_plant` and a current plant selection, project
// that plant's data onto `data`. Returns a shallow-cloned visual so we don't
// mutate the cached page spec.
function projectForPlant(visual, currentPlant) {
  if (!currentPlant) return visual;
  if (!visual.data_by_plant) return visual;
  const sliced = visual.data_by_plant[currentPlant];
  if (!sliced) return visual;  // plant has no data for this visual
  return { ...visual, data: sliced };
}

// Same idea for date-range. Precedence is evaluated in VisualRouter: if both
// a plant and a date-range are active, the date-range projection wins because
// the precomputed date-range dicts aren't per-plant in this pass.
function projectForDateRange(visual, currentDateRange) {
  if (!currentDateRange) return visual;
  if (!visual.data_by_date_range) return visual;
  const sliced = visual.data_by_date_range[currentDateRange];
  if (!sliced) return visual;
  return { ...visual, data: sliced };
}

export function VisualRouter({ visual, plantSlicerName, plantSlicerField, currentPlant,
                               dateSlicerName, dateSlicerField, currentDateRange, dateRangeOptions }) {
  const Comp = REGISTRY[visual.type];
  if (!Comp) return html`<${VisualPlaceholder} visual=${visual} />`;
  if (Comp === NavButton) return html`<${Comp} visual=${visual} />`;
  if (Comp === Slicer) {
    const field = visual.data?.field || null;
    const isPlantSlicer = Boolean(
      (plantSlicerName && visual.name === plantSlicerName) ||
      (plantSlicerField && field === plantSlicerField)
    );
    const isDateSlicer = Boolean(
      (dateSlicerName && visual.name === dateSlicerName) ||
      (dateSlicerField && field === dateSlicerField)
    );
    return html`<${Slicer} visual=${visual}
                          isPlantSlicer=${isPlantSlicer}
                          isDateSlicer=${isDateSlicer}
                          dateRangeOptions=${dateRangeOptions} />`;
  }
  // Other data-bound components.
  // Priority: plant > date-range. Plant-sliced data is per-WWTP and specific;
  // date-range data is an all-plants aggregate. Only fall through to date-range
  // when the visual has no per-plant data (e.g. pages with only a date slicer).
  let effective = visual;
  if (currentPlant && visual.data_by_plant?.[currentPlant]) {
    effective = projectForPlant(effective, currentPlant);
  } else if (currentDateRange && visual.data_by_date_range?.[currentDateRange]) {
    effective = projectForDateRange(effective, currentDateRange);
  }
  if (Comp === Card || Comp === XYChart || Comp === ComboChart || Comp === DataTable) {
    if (!effective.data) return html`<${VisualPlaceholder} visual=${visual} />`;
  }
  return html`<${Comp} visual=${effective} />`;
}
