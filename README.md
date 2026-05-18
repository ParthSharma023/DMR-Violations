# DMR Violations Dashboard — v2

Web rebuild of the City of Houston wastewater-compliance Power BI report (`Viewer_HachWIMS_DMRReportsPlus_Violations_Dataflow.pbix`). The PBIX has 104 pages and ~1,073 visuals; the v2 app targets the **58 "live" pages** (5 visible + 53 reached via bookmark navigation).

Open either by:
- double-clicking `app/index.html`, or
- visiting **`http://127.0.0.1:8734/`** once a local static server is running from `app/`.

## Current state (as of this writing)

- **Pages rendered**: 58 / 58 live pages load with layout
- **Visuals with real data**: 397 of 409 data-bound (**97.1% coverage** in the latest audit)
- **Plant filter wiring**: live — slicer on a page updates all plant-aware visuals on that page
- **Known gaps**: see `docs/KNOWN_GAPS.md`

## Stack

- **Frontend**: plain HTML + bundled local JS. Source lives in `src/`; `tools/build_frontend_bundle.py` emits `app/dist/app.bundle.js` and `app/styles.css` for disk-safe runtime. Preact + htm + Chart.js are loaded locally from `app/lib/`.
- **Data layer**: DuckDB + Parquet. Raw CSVs (5.5 GB) → compressed parquet (196 MB) → per-page JSON + JS data scripts.
- **Runtime**: fully static. The generated app can run from `file://` by opening `app/index.html`, or from any static file server.

## Directory map

```
DMR Violations Dashboard/
├── README.md                    ← you are here
├── CLAUDE.md                    ← instructions for Claude sessions
├── AUDIT.md                     ← auto-generated per-page coverage snapshot
├── docs/                        ← architecture documentation (start with ARCHITECTURE.md)
│
├── app/                         ← self-contained static payload (safe to copy to E-drive)
│   ├── index.html               ← app shell (loads dist/app.bundle.js)
│   ├── styles.css               ← generated combined CSS for file:// runtime
│   ├── dist/
│   │   └── app.bundle.js        ← generated classic-script bundle
│   ├── lib/                     ← local library copies (no CDN)
│   │   ├── preact.module.js
│   │   ├── preact-hooks.module.js
│   │   ├── htm.module.js
│   │   └── chart.umd.min.js
│   └── data/
│       ├── manifest.json / manifest.js
│       ├── pages/*.json / pages/*.js
│       └── custom/*.json / custom/*.js
│
├── src/                         ← frontend source modules
│   ├── app.js                   ← entry — router, App component
│   ├── app.css                  ← v2-specific layout styles
│   ├── styles-base.css          ← CoH palette + shared base styles
│   ├── state.js                 ← global state (current page, currentPlant filter)
│   ├── data.js                  ← manifest + page data-script loader (cached)
│   ├── pages/
│   │   └── page.js              ← generic page renderer (absolute-positioned visuals)
│   └── components/
│       ├── index.js             ← visual-type dispatcher
│       ├── chart-base.js        ← Chart.js wrapper + inline-labels plugin
│       ├── nav-button.js        ← actionButton → hash-route nav
│       ├── visual-placeholder.js ← fallback for unimplemented types
│       ├── card.js              ← single-value card/KPI
│       ├── slicer.js            ← dropdown slicer (plant slicer filters page)
│       ├── xy-chart.js          ← bar/line/area/100%-stacked
│       ├── combo-chart.js       ← dual-axis line+column
│       └── table.js             ← tableEx / pivotTable
│
├── tools/                       ← Python build pipeline
│   ├── build_data.py            ← CSV/live S3 → build/tier2 parquet
│   ├── build_pages.py           ← build/tier2 → app/data manifest/pages/custom
│   ├── build_frontend_bundle.py ← src/app modules + CSS → app/dist/app.bundle.js + app/styles.css
│   ├── aggregate.py             ← visual-type recipes (SQL generators, plant slicing)
│   ├── audit_pages.py           ← scans every page, writes AUDIT.md
│   ├── probe.py, extract_model.py, extract_layout.py  ← one-time PBIX extractors (Phases 1–3)
│   └── model_dump/              ← JSON dumps of the extracted PBIX model (input to build_pages.py)
│
├── build/                       ← generated intermediate data
│   ├── README.md                ← tier2 pipeline notes
│   └── tier2/*.parquet          ← canonical parquet tables (20 files)
│
├── source/                      ← optional local-only raw source artifacts
│   ├── exported_csv/            ← raw HachWIMS exports — SOURCE OF TRUTH, never mutate
│   │   ├── DATATBL.csv
│   │   ├── Effluent_Flow_Limits.csv
│   │   └── ... (8 smaller dimension tables)
│   └── Viewer_HachWIMS_…pbix    ← original PBIX (keep for re-extraction if needed)
│
├── live/
│   ├── s3_config.example.json   ← non-secret live-source config template
│   └── .cache/                  ← downloaded live-source parquet cache (gitignored)
│
└── archive/v1_app/              ← pre-rebuild 9-tab app — do not edit
```

## GitHub-ready split

This repo is intentionally organized so a clone can support both:

- **run now**: open `app/index.html` and use the already-built static app
- **rebuild later**: use `src/` + `tools/` to regenerate the app, preferably from live S3

For GitHub, the heavy local-only artifacts are kept out of version control:

- `source/exported_csv/`
- `source/*.pbix`
- `build/tier2/`
- `live/.cache/`

That means a fresh clone can still rebuild, but the normal rebuild path is:

```bash
.venv/bin/python tools/build_data.py --source s3
.venv/bin/python tools/build_pages.py
.venv/bin/python tools/build_frontend_bundle.py
```

See `docs/GIT_SETUP.md` for the practical push/pull workflow.

## External docs

**PBIX source-of-truth documentation** lives outside the project at `~/Documents/CoH/context/pbix/` (14 files covering data model, DAX measures, calc tables, M queries, page layouts, relationships, filters, violation-rule deep dive). Entry point: `00_overview.md`.

These were produced by the Phase 1–3 extraction in this project's `tools/` folder; they're stable reference material.

## Quick reference — how things flow

```
raw HachWIMS CSVs ──► build/tier2 parquet ──► app/data JSON/JS ─┐
      (5.5 GB)          (196 MB)           static payloads │
                                                          ├─► browser
                                                          │
                 src modules + CSS ─► app bundle ─► Preact ┘
                                         renders
```

The critical insight: **the exported CSVs are already post-DAX**. `DATATBL.csv` has `Violation`, `Limit`, `Compare`, `Categories One`, `Color Format for Flow`, and every other calc column materialized. We don't reproduce the DAX — we trust the CSVs and add the 10 DAX-defined `vt_*` / `KPI Table` / `Key Lab Data` virtual tables as SQL during `build_data.py`.

## What's different from the PBIX

The v2 app targets **functional parity**, not pixel-perfect replication.
- Matches PBIX page layout (1280×720 canvas, absolute-positioned visuals)
- Matches the 46-button Home navigation with bookmark-driven targets
- Matches plant-slicer filter flow (per-page plant selection updates all visuals)
- **Does not** match: drill-through popups, conditional-formatted table cell colors, exact rolling-window math (we approximate with MIN/MAX instead of true time-windowed DAX)

See `docs/KNOWN_GAPS.md` for the full list with impact and severity.

## Starting / stopping / rebuilding

All commands in `CLAUDE.md`. Quick version:

```bash
# Optional local server
cd "/Users/parthsharma/Projects/COH/DMR Violations Dashboard"
(cd app && ../.venv/bin/python -m http.server 8734 --bind 127.0.0.1)

# Rebuild page data after code changes
.venv/bin/python tools/build_pages.py

# Rebuild the disk-safe frontend bundle after frontend source changes
.venv/bin/python tools/build_frontend_bundle.py
```

After rebuilding, you can also open `app/index.html` directly from Finder/Explorer without starting a server.
