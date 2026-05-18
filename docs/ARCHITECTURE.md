# Architecture

High-level: take a 175 MB Power BI file, extract its structure, turn its data into web-friendly JSON, and render it with a tiny Preact app.

## Three-layer flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 1 — Python build (runs locally, produces static files)            │
│                                                                          │
│   raw CSVs ──► build/tier2 parquet ──► per-page JSON + manifest.json    │
│   (5.5 GB)     (196 MB)          (~23 MB)                                │
│                                                                          │
│   [build_data.py]  [build_pages.py + aggregate.py]                       │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼   (served as static files via http.server)
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 2 — Browser (no build step, no backend)                            │
│                                                                          │
│   app/index.html ──► classic bundle ──► src/app.js (Preact root)         │
│                                                                          │
│   src/app.js:                                                            │
│     • fetches app/data/manifest.json on boot                             │
│     • on route change, fetches app/data/pages/<slug>.json                │
│     • renders via <PageCanvas> → <VisualRouter> → per-type components    │
│     • maintains global state: route + currentPlant filter                │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 3 — Visual components (one file per PBIX visual type)              │
│                                                                          │
│   card.js        slicer.js     xy-chart.js      combo-chart.js           │
│   table.js       nav-button.js  visual-placeholder.js (fallback)         │
│                                                                          │
│   Each component reads visual.data (or visual.data_by_plant[plant]) and  │
│   renders HTML + Chart.js canvases.                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

## Why this shape

- **No build step** — you can open `src/app.js` in any editor and changes show up on browser reload. Matches the operator-IT environment at CoH (no Node toolchain required to deploy).
- **Static files only** — deploys anywhere. IIS, nginx, S3, `python -m http.server`. No backend to maintain.
- **Precomputed data** — the aggregations are baked into JSON at build time, not queried live. Means the browser never needs DuckDB or parquet access. Trade-off: changing data requires rebuild.
- **Parquet, not JSON, as canonical** — compressed columnar format handles DATATBL's 12.5M rows in 123 MB. If we ever need live queries (drill-through, custom ranges), we can add DuckDB-WASM to the browser and point it at these parquet files.

## The PBIX source of truth

Claude extracted the PBIX's internals once (Phases 1–3) using `pbixray` and raw layout parsing. That produced:

- **Data-model docs** at `~/Documents/CoH/context/pbix/` (14 files): tables, relationships, 27 DAX measures, 10 real calc tables, 50 real calc columns, 10 M queries, 58-page layout with visuals, bookmarks, filters.
- **JSON dumps** at `tools/model_dump/`: machine-readable versions of the above, consumed by `build_pages.py`.

The PBIX file itself is kept in the project for re-extraction if anything changes upstream.

## Key data-layer insight

**The exported CSVs in `source/exported_csv/` are post-DAX.** `DATATBL.csv` already contains materialized calc columns (`Violation`, `Limit`, `Compare`, `Categories One`, `Color Format for Flow`, etc.), produced at the time of export by Power BI.

Result: `build_data.py` does very little "DAX reproduction" — it just applies the global filters (WWTP exclusion list + date floor) and computes the 10 DAX-only virtual tables (`vt_*`, `KPI Table`, `Key Lab Data`). Everything else passes through.

We verified this by comparing violation counts per WWTP to the archived v1 pipeline's output (`archive/v1_app/data/violations_summary.json`): identical numbers on every plant except Willow Run, which the global filter correctly excludes.

## Frontend page rendering

The PBIX stores each page as a 1280×720 canvas with absolute-positioned visual containers. We preserve that exactly:

1. `app/index.html` renders a container scaled to fit the viewport.
2. `app.js` parses `#/<slug>` URL, fetches `app/data/pages/<slug>.json`.
3. `PageCanvas` iterates `page.visuals`, each visual wrapped in an absolute-positioned `<div>` at its PBIX coords.
4. `VisualRouter` dispatches each visual to the right component based on `visual.type`.
5. The visual component reads `visual.data` (or `visual.data_by_plant[currentPlant]` if plant-filter active) and renders.

This gives us a **single generic renderer** for all 58 pages. We don't hand-code any page layout. Pages differ only by their JSON specs.

## Plant filter wiring (Phase 5G)

Pages with a WWTP slicer (`VARDESC.UD3` / `VARDESC.WWTP`) get auto-detected during build. For every data-bound visual on such a page, `aggregate.py` produces **`data_by_plant`**: `{plant_name → aggregated data for that plant}`.

At runtime:
- App initializes `state.filters.currentPlant = page.plant_slicer.default` (first plant alphabetically).
- `Slicer` component dispatches `setCurrentPlant(value)` on dropdown change.
- `VisualRouter` reads `currentPlant` and looks up `visual.data_by_plant[currentPlant]`. Falls back to unfiltered `visual.data` if no plant selected.
- State change propagates via a pub/sub hook (`useStore`) that re-renders the App root.

See `docs/STATE_AND_FILTERS.md` for details.

## One-off cosmetic overrides

Some charts need specific polish the generic renderer can't infer — series renames, color overrides, filter exceptions, data-label toggles. These live in `VISUAL_OVERRIDES` at the top of `tools/build_pages.py`, keyed by `(page_slug, title_contains)`.

Example: the Citywide WWTP Capacity Status 100%-stacked chart gets blue/gray colors, "Capacity Utilized"/"Capacity Remaining" series labels, data labels enabled, and 5 small plants filtered out.

Add overrides here rather than modifying components. Keeps cosmetic tweaks separate from core rendering logic.

## What's not in the architecture yet

- **Drill-through** — PBIX supports hover-popup mini-charts; we don't.
- **Conditional formatting** — green/yellow/red cell backgrounds on tables.
- **Cross-visual filtering** — clicking a plant's bar in one chart filters others on the same page. Slicer-based filtering works, but click-through doesn't.
- **Relative-date slicers** — currently render as a 500-item dropdown.
- **Multi-entity tables (3+ entities)** — the aggregator handles 2-way joins; 3-way joins fall through to placeholders.
- **True rolling-window DAX measures** — we approximate with MIN/MAX; exact math needs `OVER (ORDER BY date RANGE BETWEEN …)`.

See `docs/KNOWN_GAPS.md` for the full inventory and severity.
