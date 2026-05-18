# DMR Violations Dashboard — Project Instructions

**If you're a Claude session picking this up, READ THESE FIRST** (in order):

1. **`README.md`** — what this project is, current state, how to run.
2. **`docs/ARCHITECTURE.md`** — high-level: data flow from PBIX → parquet → JSON → browser.
3. **`docs/DATA_PIPELINE.md`** — the Python build step in detail.
4. **`docs/COMPONENTS.md`** — frontend components & how rendering dispatches.
5. **`docs/STATE_AND_FILTERS.md`** — how slicers filter visuals.
6. **`docs/AGGREGATION_RECIPES.md`** — SQL recipes per visual type, the core logic.
7. **`docs/KNOWN_GAPS.md`** — what's approximate or broken, with severity.
8. **`AUDIT.md`** — auto-generated snapshot of per-page coverage (stale the moment you rebuild).

For deeper PBIX source-of-truth docs (DAX measures, calc tables, M queries, page layouts):
→ **`~/Documents/CoH/context/pbix/`** — 14 files, entry point is `00_overview.md`.

## Hard rules for this project

- **Never regenerate `app/data/pages/*.json` without also having current `build/tier2/*.parquet`.** The page build depends on it. If you've changed `source/exported_csv/*.csv` or `tools/build_data.py`, run `build_data.py` first.
- **Leave `archive/v1_app/` alone** — that's the pre-rebuild version. History, not code.
- **Don't touch `source/exported_csv/*.csv`** — those are raw HachWIMS exports, source of truth.
- **User preference: one-off fixes per chart over general systems.** Patch via `VISUAL_OVERRIDES` in `tools/build_pages.py` or targeted recipes in `tools/aggregate.py`. Reserve general-system changes for gaps that block many pages at once.

## Quick commands

```bash
# Start server (leaves terminal running)
cd "/Users/parthsharma/Projects/COH/DMR Violations Dashboard"
(cd app && ../.venv/bin/python -m http.server 8734 --bind 127.0.0.1)

# Restart server
lsof -ti :8734 | xargs kill 2>/dev/null; (cd app && ../.venv/bin/python -m http.server 8734 --bind 127.0.0.1)

# Rebuild page JSON after code changes in aggregate.py / build_pages.py
.venv/bin/python tools/build_pages.py      # fast, ~2 min

# Full rebuild (raw CSVs → parquet → page JSON). Takes ~2 min total.
.venv/bin/python tools/build_data.py
.venv/bin/python tools/build_pages.py

# Audit all pages
.venv/bin/python tools/audit_pages.py
```

## Open the app at `http://127.0.0.1:8734/`
