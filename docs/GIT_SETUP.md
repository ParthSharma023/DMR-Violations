# Git Setup

This repo is organized so a clone can support both:

1. viewing the current static app immediately, and
2. rebuilding the app from the live S3 source.

## What belongs in git

Keep these tracked:

- `app/` — final static app payload
- `src/` — frontend source
- `tools/` — build pipeline
- `docs/`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `AUDIT.md`
- `live/s3_config.example.json`
- `build/README.md`
- `source/README.md`

## What stays local

These are intentionally gitignored:

- `live/.cache/` — downloaded parquet cache
- `build/tier2/` — generated intermediate parquet
- `source/exported_csv/` — large raw CSV snapshot
- `source/*.pbix` — original PBIX file
- `.venv/`

Why: these files are large, machine-specific, or easy to regenerate.

## After a fresh clone

### View the static app

Open:

- `app/index.html`

### Rebuild from live S3

Requires:

- Python environment with project dependencies
- AWS CLI installed
- AWS credentials/profile with read access to the HachWIMS bucket

Run:

```bash
.venv/bin/python tools/build_data.py --source s3
.venv/bin/python tools/build_pages.py
.venv/bin/python tools/build_frontend_bundle.py
```

### Rebuild from local CSV snapshot

Only if you separately have the raw export in `source/exported_csv/`:

```bash
.venv/bin/python tools/build_data.py
.venv/bin/python tools/build_pages.py
.venv/bin/python tools/build_frontend_bundle.py
```

## Before the first push

Check these things:

- `app/index.html` opens and renders
- `app/dist/app.bundle.js` exists
- `app/data/manifest.json` exists
- no secrets are stored in `live/`
- no local cache or raw source files were accidentally staged

## Notes

- The repo is still large because `app/data/pages/` is intentionally tracked for the static deliverable.
- If GitHub usage becomes painful later, the first thing to reconsider is whether `app/data/` should move to release artifacts or Git LFS. The current structure keeps it in-repo so a clone can run immediately.
