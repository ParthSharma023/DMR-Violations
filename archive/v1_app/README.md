# v1 App — Archived 2026-04-21

Pre-rebuild version of the DMR Violations Dashboard web app. Built by earlier Claude Code sessions **before** the full PBIX model + layout had been extracted.

## What's here

- `app.js` (79 KB) — vanilla-JS app with 9 curated tabs (Home, Violations, Permit Eval, Historical DMR, Process, KPIs, O&M, Plant Reports, Data Tools)
- `index.html` (31 KB)
- `data/` — 11 precomputed JSON files + 37 per-plant daily reports

## Why archived

The v2 direction is a **deep-fidelity rebuild** matching the PBIX's page structure (56 live pages of 104 total), not the 9-tab simplification that was in v1.

Specific reasons the v1 data pipeline couldn't be reused as-is:

- Violation rule likely missed the `GROUPING = "M" AND Parameter Name CONTAINS "Efncy Pr Eff" AND NOT "MAvg"` carve-out — would have under-counted Daily Load violations for CBOD/NH3-N/TSS.
- The 9 `vt_*` calc tables (pre-aggregated views the report actually queries) were not reproduced; v1 queried DATATBL directly.
- `Color Format for Flow` traffic-light chain uses specific thresholds from `Monthly Flow Permit` — not wired into v1.
- Global filters (WWTP exclusion list of 13 values, date floor 2005-01-01) were approximated, not matched.

Full v2 spec: `~/Documents/CoH/context/pbix/` (14 docs covering data model, DAX, M queries, pages, bookmarks, filters, violation rule).

## What stayed at the project root

- `styles.css` — CoH dark-theme CSS, shared with SSO Risk and Flow Projection dashboards
- `exported_csv/` — raw HachWIMS CSVs
- `tools/` — PBIX extraction pipeline
- `Viewer_HachWIMS_…pbix` — source artifact
- `PBIX_RESEARCH.md` — with corrections
