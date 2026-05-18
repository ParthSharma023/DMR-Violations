# State & Filter Wiring

The app has a tiny, deliberate state model. This doc covers everything that changes at runtime.

## What's in state

`src/state.js`:

```js
export const state = {
  manifest: null,        // loaded once on boot: all pages, plants, parameters, bookmarks
  route: { slug },       // parsed from window.location.hash
  currentPage: null,     // loaded on each route change; page JSON with visuals
  currentPageLoading: false,
  currentPageError: null,
  filters: {
    currentPlant: null,  // set when a page has a plant slicer
  },
};
```

## Pub/sub API

- `subscribe(fn)` — returns unsubscribe. `fn(state)` runs on every `update()`.
- `update(mutator)` — mutates `state` then notifies subscribers.
- `setCurrentPlant(value)` — convenience for `update(s => { s.filters.currentPlant = value || null })`.

## How `App` reacts

`src/app.js` defines a `useStore()` hook:

```js
function useStore() {
  const [, tick] = useState(0);
  useEffect(() => subscribe(() => tick(x => x + 1)), []);
  return state;
}
```

Every `update()` triggers a Preact re-render of `<App>`. `currentPage`, `currentPlant`, etc. flow down as props.

## Routing — hash-based

`window.location.hash = "#/<slug>"`:
- On page load and on `hashchange`, `state.route.slug` is set.
- `App` has a `useEffect([s.manifest, s.route.slug])` that fetches `app/data/pages/<slug>.json` and stores it as `state.currentPage`.
- If the page has `plant_slicer`, the first plant in `plant_slicer.options` becomes the default `currentPlant`. Otherwise `currentPlant` is nulled.

Home route: both `` (empty hash) and `#/home` resolve to slug `home`.

## Plant filter — the main filter mechanism

The Power BI plant slicer (typically bound to `VARDESC.UD3` or `VARDESC.WWTP`) is the one filter we've wired end-to-end. Here's the path:

### Build-time

`tools/aggregate.py > aggregate_page()` detects whether a page has a plant slicer:

```python
for v in page_spec["visuals"]:
    if v["type"] != "slicer": continue
    refs = (v.get("projections") or {}).get("Values") or []
    for r in refs:
        if r in ("VARDESC.WWTP", "VARDESC.UD3", "DATATBL.WWTP"):
            plant_slicer_field = r
            plant_slicer_name  = v.get("name")  # GUID
```

If found, writes to the page JSON:
```json
"plant_slicer": {
  "field": "VARDESC.UD3",
  "visual_name": "<slicer's guid>",
  "options": ["69th Street", "Almeda Sims", ...],
  "default": "69th Street"
}
```

Then for every data-bound visual on that page (cards, XY charts, combos, single-entity tables), it calls `Aggregator.build_sliced(...)` which re-runs the aggregation with the slice field added to `GROUP BY`. The result is split by slice value and stored on the visual:

```json
{
  "type": "card",
  "data": { "shape": "card", "value": 419996623 },   // unfiltered — fallback when currentPlant is null
  "data_by_plant": {
    "69th Street": { "shape": "card", "value": 92.6 },
    "Almeda Sims": { "shape": "card", "value": 15.2 },
    ...
  }
}
```

### Runtime

1. App loads the page, sets `state.filters.currentPlant = page.plant_slicer.default` (first plant).
2. `PageCanvas` renders each visual, passing `plantSlicerName` (the slicer's GUID from `page.plant_slicer.visual_name`) and `currentPlant` as props.
3. `VisualRouter` handles two cases:
   - **For the slicer itself**: compares `visual.name === plantSlicerName`; if yes, passes `isPlantSlicer={true}` to `<Slicer>`. The slicer renders with accent styling and dispatches `setCurrentPlant(value)` on change.
   - **For data-bound visuals**: calls `projectForPlant(visual, currentPlant)` which returns a shallow-cloned visual with `data` replaced by `data_by_plant[currentPlant]`. Visual component sees fresh data and re-renders.
4. When user picks a new plant:
   - `Slicer.onChange` → `setCurrentPlant(value)` → `state.filters.currentPlant` updated → `useStore` notifies → `App` re-renders → new props flow down → visuals render the new plant's data.

### Fallback behavior

If `currentPlant` is null (e.g. user selected "All"), visuals render from `visual.data` (unfiltered aggregation — often a sum/max across all plants, which may be meaningful for some visuals but nonsense for others).

If a visual has no `data_by_plant` (e.g. the aggregator couldn't handle slicing for it), it renders from `data` unchanged regardless of plant selection.

## What's NOT yet wired

### Date-range slicers

Many pages have a date slicer bound to `DATATBL.DATESTAMP`. Currently renders as a dropdown of ~500 distinct dates — meaningless. Should be a relative-date picker ("Last 60 months") or a range selector. No wiring to the filter state yet.

**To wire**: similar pattern — detect the slicer at build time, produce date-binned slices per plant (or combined with plant slicing), add `currentDateRange` to state, let Slicer dispatch.

### Cross-filtering via visual click

PBIX supports clicking a bar in one chart to filter all other visuals on the page. Not implemented.

**To wire**: each visual component would emit filter events on click; global state would absorb and propagate.

### Slicers with non-plant fields

Parameter slicers, violation-type slicers, etc. — these exist in the PBIX but aren't connected. We only recognize the plant slicer by name-matching to known WWTP fields.

**To wire**: generalize the filter-slice mechanism to arbitrary fields. `aggregate_page()` could detect any slicer and produce `data_by_<field>` slices, with state tracking a multi-key filter map.

### Bookmark-applied filters

When the user navigates from Home via a button that triggers a bookmark, the bookmark often carries pre-applied filters (e.g. "Mo DMR Ef CBOD" bookmark sets `VARDESC.S. NAME CONTAINS 'Ef CBOD Mo Avg'`). Those filters are extracted in `tools/model_dump/pages_dump.json` but not applied to visuals yet.

**To wire**: when a bookmark is triggered, apply its `filters_applied` list to the page's visuals before rendering. Either re-fetch a filtered page JSON, or filter client-side if we have enough data.

## State debugging

Easy debug — just console the state:

```js
import { state, subscribe } from "/src/state.js";
subscribe(s => console.log("state:", s));
```

Or at any time in the browser console:
```js
// pull the live state
window.dispatchEvent(new Event("hashchange"));  // triggers a state-refresh
```

(Module state isn't globally exposed by default; if you need it regularly, add `window.__state = state` at the bottom of `state.js` during dev.)
