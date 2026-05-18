# Live Source

This folder holds the live-data integration boundary for HachWIMS.

Tracked in git:

- `s3_config.example.json` — non-secret example mapping of logical tables to S3 objects

Local-only, gitignored:

- `.cache/` — downloaded parquet files used by `tools/build_data.py --source s3`

Notes:

- A cloned repo can rebuild from live data as long as the machine has AWS CLI access and permission to read the configured bucket/prefix.
- Credentials do not belong in this repo.
