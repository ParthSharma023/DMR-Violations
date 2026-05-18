# Frontend Components

The v2 app is Preact + htm + Chart.js. The deployable static shell lives in `app/`, with local libraries in `app/lib/`. HTML entry point is `app/index.html` which:

1. Loads Chart.js as a global via `<script src="lib/chart.umd.min.js">`.
2. Declares an `<script type="importmap">` so bare specifiers like `"preact"` resolve to local files.
3. Loads `src/app.js` as a module.

## Module graph

```
index.html
  └── src/app.js  (Preact root, router, App component)
        ├── src/state.js    (pub/sub store: route, manifest, currentPage, filters.currentPlant)
        ├── src/data.js     (fetch data/manifest.js + page payloads, cache-busted per session)
        └── src/pages/page.js  (PageCanvas — absolute-positioned visuals on 1280×720 canvas)
              └── src/components/index.js  (VisualRouter — dispatches on visual.type)
                    ├── card.js              card / kpi
                    ├── slicer.js            slicer (plant slicer wires to state)
                    ├── xy-chart.js          bar / column / line / area / 100%-stacked
                    ├── combo-chart.js       line+column on dual Y
                    ├── table.js             tableEx / pivotTable
                    ├── nav-button.js        actionButton → hash-route
                    ├── chart-base.js        <ChartWrap>, PALETTE, inline-labels plugin
                    └── visual-placeholder.js  fallback for unrecognized/missing-data types
```

## Visual-type → component registry

`src/components/index.js`:

| PBIX `visual.type` | Component | Notes |
|---|---|---|
| `card`, `kpi` | `Card` | Single numeric value with label; formats decimals/thousands |
| `slicer` | `Slicer` | Dropdown; if bound to plant field, updates `state.filters.currentPlant` |
| `areaChart` | `XYChart` | Chart.js `line` with fill |
| `lineChart` | `XYChart` | Chart.js `line` |
| `clusteredColumnChart` | `XYChart` | Chart.js `bar` |
| `columnChart` | `XYChart` | Chart.js `bar`, single series |
| `hundredPercentStackedColumnChart` | `XYChart` | Chart.js `bar` stacked + normalized to 100% |
| `lineClusteredColumnComboChart` | `ComboChart` | Mixed `bar`+`line` with dual Y axes |
| `lineStackedColumnComboChart` | `ComboChart` | Same, stacked |
| `tableEx` | `DataTable` | Scrollable HTML table |
| `pivotTable` | `DataTable` | Degrades to flat table (no drill) |
| `actionButton` | `NavButton` | `<button>` that does `window.location.hash = '#/<target>'` |
| `textbox` | inline | Plain text block |
| `shape`, `basicShape`, `image` | inline | Empty visual-shape div (decorative) |
| unknown | `VisualPlaceholder` | Shows `TYPE`, title, and field binding |
| known type but `visual.data` missing | `VisualPlaceholder` | Same fallback |

## How a page renders

1. App loads manifest on boot, route on hash change.
2. Route change → fetch `app/data/pages/<slug>.json` → store as `state.currentPage`.
3. If page has `plant_slicer`, set `state.filters.currentPlant = plant_slicer.default`.
4. `App` re-renders → `PageViewport` → `PageCanvas`.
5. `PageCanvas` iterates `page.visuals`, wraps each in an absolute-positioned `<div>` at the PBIX-recorded `(x, y, width, height)`.
6. For each visual, `VisualRouter` looks up the component by `visual.type`.
7. If the page has a plant slicer AND the visual has `data_by_plant`, the router **projects for plant**: clones the visual and replaces `data` with `data_by_plant[currentPlant]`.
8. Component renders.

## Per-component notes

### `card.js`

Props: `{ visual }`. Reads `visual.data.value`. Formats:
- Integers < 1M → `12,208`
- ≥ 1000 non-integer → `1.5K`-style with max 1 decimal
- `abs ≥ 1` → 2 decimals
- `abs < 1` → 4 decimals
- `null` → em dash

Label priority: `visual.title` → last segment of `visual.data.binding`.

### `slicer.js`

Props: `{ visual, isPlantSlicer }`.
- Reads `visual.data.options` (distinct values).
- If `isPlantSlicer`, value is bound to `state.filters.currentPlant` and changes call `setCurrentPlant(value)`.
- Otherwise it's a local-only dropdown (selection doesn't propagate yet — future work).
- Visual styling: if plant slicer, border + label use accent color to signal "this drives the page."

### `xy-chart.js`

Props: `{ visual }`. Data shapes supported:
- `xy` — `{ x: [], y: [] }`, single-series bar/line/area.
- `xy_series` — `{ x: [], series: [{name, values}] }`, multi-series (grouped bars, multi-line, stacked).

Reads optional per-visual overrides:
- `visual.series_labels: string[]` — replaces auto-derived series names.
- `visual.colors: string[]` — replaces PALETTE for this chart.
- `visual.show_data_labels: bool` — enables the inline-labels Chart.js plugin.

For `hundredPercentStackedColumnChart`:
- Clamps negative values to 0 (over-permit plants show 100/0 instead of blowing up).
- Renormalizes so each column sums to 100.
- Y-axis caps at 100% with `%` tick labels.
- Tooltip shows `%` formatted values.

### `combo-chart.js`

Props: `{ visual }`. Data shape: `combo` — `{ x, series: [{name, role, values}] }` where `role ∈ {"y", "y2"}`.

Series with `role="y"` render as bars on the left Y axis, `role="y2"` as lines on a right Y axis. Chart.js `type: "bar"` with `type: "line"` overrides per dataset.

### `table.js`

Props: `{ visual }`. Data shape: `table` — `{ columns: [], rows: [[...]] }`.

- Caps at first 500 rows for performance.
- Column headers strip the entity prefix (`DATATBL.WWTP` → `WWTP`) and unwrap aggregation functions (`Sum(LIMITS.LIMIT_VALUE)` → `LIMIT_VALUE`).
- Cells format numbers with `.toLocaleString()`, truncate long strings, ellipsize.
- Sticky header, scrollable body.

### `nav-button.js`

Props: `{ visual }`. Reads `visual.button_text` and `visual.action_target_slug`. Click does `window.location.hash = '#/<slug>'`. If no target, button is disabled.

### `chart-base.js`

Shared Chart.js wrapper `<ChartWrap type data options />`:
- Creates a canvas, instantiates `new Chart(…)` in a `useEffect`.
- On prop changes, updates `chart.data` / `chart.options` and calls `chart.update("none")` (no animation).
- Destroys chart on unmount.

Exports:
- `PALETTE` — CoH-themed colors in order.
- `inlineLabelsPlugin` — Chart.js plugin that draws `NN%` labels inside bar segments when `options.plugins.inlineLabels.enabled === true`.
- Sets Chart.js defaults (muted text, dark grid lines, Inter font).

### `visual-placeholder.js`

Fallback. Shows:
- PBIX visual type (uppercase, accent color)
- Title (if any)
- Field bindings (e.g. `Category: DATATBL.WWTP • Y: Sum(DATATBL.CURVALUE)`)

Useful for debugging — if you see a placeholder where you expect a chart, the binding tells you what the aggregator would need.

## State management — `src/state.js`

Tiny pub/sub:

```js
state = {
  manifest: null,
  route: { slug: "home" },
  currentPage: null,
  currentPageLoading: false,
  currentPageError: null,
  filters: { currentPlant: null },
}
```

API:
- `subscribe(fn)` → returns unsubscribe; `fn(state)` called on every change.
- `update(mutator)` → mutates state + notifies subscribers.
- `setCurrentPlant(value)` → convenience wrapper.

Hash is parsed on module load and on `hashchange` event. URL `#/permit-evaluation-aaf` → `state.route = { slug: "permit-evaluation-aaf" }`.

`app.js`'s `useStore` hook subscribes and forces a Preact re-render on every state change.

## Data fetching — `src/data.js`

Two exports:
- `loadManifest()` — loads `data/manifest.js` once relative to `app/index.html`, caches in-memory for the session.
- `loadPage(slug)` — loads `data/pages/<slug>.js` once per slug, caches in-memory.

Both append `?v=<session_timestamp>` to defeat browser HTTP cache. This matters: after a build, a hard-reload is no longer required to pick up new JSON — a normal reload works because the URL changes.

## Styling

- `src/styles-base.css` — CoH palette + shared base styles used to generate `app/styles.css`.
- `src/app.css` — v2-specific: topbar, canvas, placeholder styles.

No CSS-in-JS at component level; components inline small style objects for positioning and layout-specific overrides. Intentional: avoids a styling build step.

## How to add a new visual type

When a PBIX visual type appears that we don't support yet (e.g. `gauge`, some custom visual):

1. Add a component at `src/components/<name>.js`. Props: `{ visual }`. Read `visual.data` (shape depends on what your aggregator recipe returns).
2. Register in `src/components/index.js`: add to the `REGISTRY` map and to the `!visual.data` fallback check.
3. Add a recipe in `tools/aggregate.py` — implement `_<name>()` and dispatch in `Aggregator.build()` for that type. Also implement `_<name>_sliced()` if the visual needs plant filtering.
4. Rebuild: `python tools/build_pages.py`.
5. Hard-reload browser.

## How to add a one-off cosmetic override

For a specific chart that needs custom labels, colors, data-label toggling, or filtered data:

1. In `tools/build_pages.py`, add an entry to `VISUAL_OVERRIDES`:
   ```python
   {"page": "permit-evaluation-7590",
    "title_contains": "...",
    "apply": lambda v: _some_override(v)},
   ```
2. Define `_some_override(v)` to mutate `v["data"]`, `v["series_labels"]`, `v["colors"]`, `v["show_data_labels"]`, etc.
3. Rebuild + reload.

This is the preferred way to polish individual visuals without touching component logic. Components stay generic.
