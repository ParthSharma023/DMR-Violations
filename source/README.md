# Source Artifacts

This folder is for optional local-only raw inputs that are useful for deep PBIX research and CSV-snapshot rebuilds, but are not required for the normal GitHub workflow.

Typical contents on a developer machine:

- `exported_csv/` — raw PBIX-exported HachWIMS CSV snapshot
- `Viewer_HachWIMS_DMRReportsPlus_Violations_Dataflow.pbix` — original PBIX

These files are intentionally gitignored because they are large and machine-specific.

For a fresh clone, the recommended rebuild path is the live S3 flow:

```bash
.venv/bin/python tools/build_data.py --source s3
.venv/bin/python tools/build_pages.py
.venv/bin/python tools/build_frontend_bundle.py
```

If you do have the raw CSV export locally, you can also rebuild from it:

```bash
.venv/bin/python tools/build_data.py
.venv/bin/python tools/build_pages.py
```
