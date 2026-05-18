"""Phase 4 data pipeline — source tables -> filtered parquet + calc tables.

Supports two build-time source modes while keeping the same static app output:

- csv: existing PBIX-exported CSV snapshot under source/exported_csv/
- s3:  live HachWIMS parquet from S3, enriched back into the PBIX-style shape

Output: build/tier2/*.parquet

Run:
  python tools/build_data.py
  python tools/build_data.py --source s3
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parent.parent
CSV = ROOT / "source" / "exported_csv"
OUT = ROOT / "build" / "tier2"
OUT.mkdir(parents=True, exist_ok=True)

CACHE_ROOT = ROOT / "live" / ".cache" / "hachwims_s3"

WWTP_EXCLUDED = [
    "Bretshire", "Bretshire WWF",
    "Eastheven",
    "Northside", "Northside WWF",
    "Scott St.", "Scott WWF",
    "Willow Run",
    "SUM 23,BR", "SUM 69, NS", "SUM SB, SS, SC",
]
DATE_FLOOR = "2005-01-01"

CSV_OPTS = "header=true, quote='\"', escape='\"', sample_size=-1"

CSV_SOURCES = {
    "LIMITS": "LIMITS.csv",
    "LOCATION": "LOCATION.csv",
    "VARDESC": "VARDESC.csv",
    "VAREQ": "VAREQ.csv",
    "FlowPermits_AMAX": "FlowPermits_AMAX.csv",
    "Monthly_Flow_Permit": "Monthly_Flow_Permit.csv",
    "Refresh_DateTime": "Refresh_DateTime.csv",
    "DATATBL": "DATATBL.csv",
    "Effluent_Flow_Limits": "Effluent_Flow_Limits.csv",
    "WWTP_OM_Report": "WWTP_O&M_Performace_Report.csv",
}

S3_OBJECTS = {
    "LIMITS": "rs10013btb_hachwims_limits/rs10013btb_hachwims_limits_000.parquet",
    "LOCATION": "rs10013ftb_hachwims_location/rs10013ftb_hachwims_location_000.parquet",
    "VARDESC": "rs10013gtb_hachwims_vardesc/rs10013gtb_hachwims_vardesc_000.parquet",
    "VAREQ": "rs10013etb_hachwims_vareq/rs10013etb_hachwims_vareq_000.parquet",
    "DATATBL": "rs10013tb_hachwims_data/rs10013tb_hachwims_data_000.parquet",
}

TABLES_OUT = [
    ("datatbl", "DATATBL.parquet"),
    ("vardesc", "VARDESC.parquet"),
    ("limits", "LIMITS.parquet"),
    ("location", "LOCATION.parquet"),
    ("vareq", "VAREQ.parquet"),
    ("flowpermits_amax", "FlowPermits_AMAX.parquet"),
    ("monthly_flow_permit", "Monthly_Flow_Permit.parquet"),
    ("refresh_datetime", "Refresh_DateTime.parquet"),
    ("effluent_flow_limits", "Effluent_Flow_Limits.parquet"),
    ("wwtp_om_report", "WWTP_OM_Report.parquet"),
    ("vt_selectparams_bywwtp", "vt_SelectParams_byWWTP.parquet"),
    ("vt_scadarainfall_bywwtp", "vt_SCADARainfall_byWWTP.parquet"),
    ("vt_regulatoryparameters_bywwtp", "vt_RegulatoryParameters_byWWTP.parquet"),
    ("vt_plntifparameters_bywwtp", "vt_PlntIFParameters_byWWTP.parquet"),
    ("vt_plntefparameters_bywwtp", "vt_PlntEFParameters_byWWTP.parquet"),
    ("vt_plntchemicals_bywwtp", "vt_PlntChemicals_byWWTP.parquet"),
    ("vt_plntelectricity_bywwtp", "vt_PlntElectricity_byWWTP.parquet"),
    ("vt_efflow_bywwtp", "vt_EfFlow_byWWTP.parquet"),
    ("kpi_table", "KPI_Table.parquet"),
    ("key_lab_data", "Key_Lab_Data.parquet"),
]

VT_SELECTPARAMS_LIST = [
    "Plnt Ef Flow MGD", "Plnt Ef 2Hr Peak Flow GPM", "Plnt If Flow Mgd",
    "Plnt If CBOD", "Plnt If NH3-N", "Plnt If TSS",
    "Plnt Ef FLOW Annual Avg", "Plnt Ef FLOW Month Avg", "Plnt Rainfall",
    "Plnt Ef pH Field", "Plnt Ef Dissolved Oxygen",
    "Plnt Ef CBOD MAvg", "Plnt Ef NH3-N MAvg", "Plnt Ef TSS MAvg",
    "Plnt Ef CBOD 7-Day Avg", "Plnt Ef NH3-N 7-Day Avg", "Plnt Ef TSS 7-Day Avg",
    "S Aer 01 TSS", "S Aer 01 VSS", "S Aer 01 VSS/TSS %",
    "S Aer 01 Setblty, 30 Min %", "S Aer 01 SVI",
    "RAS 01 TSS", "RAS 01 VSS", "RAS 01 VSS/TSS %", "RAS 01 Setblty, 30 Min %",
    "S Clr 01 Wasting Hr/Day", "S Clr 01 Depth of Blanket",
]

t0 = time.time()


def log(msg: str) -> None:
    print(f"[{time.time() - t0:6.1f}s] {msg}", flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        choices=("csv", "s3"),
        default="csv",
        help="Build from the existing PBIX-export CSVs or the live S3 parquet feed.",
    )
    parser.add_argument(
        "--s3-bucket",
        default="aventdtlkps3stg01",
        help="S3 bucket containing the live HachWIMS parquet feed.",
    )
    parser.add_argument(
        "--s3-prefix",
        default="processed/mdm/hachwims",
        help="Prefix inside the S3 bucket for the live HachWIMS parquet feed.",
    )
    parser.add_argument(
        "--cache-dir",
        default=str(CACHE_ROOT),
        help="Local cache directory for downloaded live-source parquet files.",
    )
    return parser.parse_args()


def sql_string(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def qident(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def run_aws_cp(src: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["aws", "s3", "cp", "--no-progress", src, str(dest)]
    log(f"Downloading {src} -> {dest}")
    try:
        subprocess.run(cmd, check=True)
    except FileNotFoundError as exc:
        raise RuntimeError("AWS CLI is required for --source s3 builds.") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"Failed to download {src}") from exc


def download_s3_sources(bucket: str, prefix: str, cache_dir: Path) -> dict[str, Path]:
    cache_dir.mkdir(parents=True, exist_ok=True)
    local_paths: dict[str, Path] = {}
    for table, rel_key in S3_OBJECTS.items():
        local_path = cache_dir / rel_key
        if not local_path.exists():
            s3_uri = f"s3://{bucket}/{prefix.rstrip('/')}/{rel_key}"
            run_aws_cp(s3_uri, local_path)
        else:
            log(f"Using cached {table} parquet: {local_path}")
        local_paths[table] = local_path
    return local_paths


def register_csv_source_views(con: duckdb.DuckDBPyConnection) -> None:
    log("Registering source CSVs as DuckDB views…")
    for tname, fname in CSV_SOURCES.items():
        path = str(CSV / fname)
        con.execute(f"""
            CREATE OR REPLACE VIEW src_{tname} AS
            SELECT * FROM read_csv('{path}', {CSV_OPTS})
        """)
    log("  done")


def register_s3_source_views(con: duckdb.DuckDBPyConnection, local_paths: dict[str, Path]) -> None:
    log("Registering downloaded live parquet files as DuckDB views…")
    con.execute(f"""
        CREATE OR REPLACE VIEW src_LIMITS AS
        SELECT * FROM read_parquet('{local_paths["LIMITS"]}')
    """)
    con.execute(f"""
        CREATE OR REPLACE VIEW src_LOCATION AS
        SELECT * FROM read_parquet('{local_paths["LOCATION"]}')
    """)
    con.execute(f"""
        CREATE OR REPLACE VIEW src_VARDESC AS
        SELECT * FROM read_parquet('{local_paths["VARDESC"]}')
    """)
    con.execute(f"""
        CREATE OR REPLACE VIEW src_VAREQ AS
        SELECT * FROM read_parquet('{local_paths["VAREQ"]}')
    """)
    # The live feed stores DATATBL in lowercase/raw telemetry form.
    con.execute(f"""
        CREATE OR REPLACE VIEW src_DATATBL AS
        SELECT
            audituser      AS AUDITUSER,
            audittimestamp AS AUDITTIMESTAMP,
            datestamp      AS DATESTAMP,
            curvalue       AS CURVALUE,
            textvalue      AS TEXTVALUE,
            varid          AS VARID,
            status         AS STATUS,
            forced         AS FORCED
        FROM read_parquet('{local_paths["DATATBL"]}')
    """)
    log("  done")


def build_base_tables_from_csv(con: duckdb.DuckDBPyConnection) -> None:
    log("Applying report-level filters to DATATBL…")
    excl_sql = ", ".join(sql_string(w) for w in WWTP_EXCLUDED)
    con.execute(f"""
        CREATE OR REPLACE TABLE datatbl AS
        SELECT * FROM src_DATATBL
        WHERE WWTP IS NOT NULL
          AND WWTP NOT IN ({excl_sql})
          AND DATESTAMP >= DATE '{DATE_FLOOR}'
    """)
    n = con.execute("SELECT COUNT(*) FROM datatbl").fetchone()[0]
    log(f"  DATATBL filtered: {n:,} rows")

    log("Applying report-level filters to VARDESC…")
    con.execute(f"""
        CREATE OR REPLACE TABLE vardesc AS
        SELECT * FROM src_VARDESC
        WHERE WWTP IS NOT NULL AND WWTP NOT IN ({excl_sql})
    """)
    n = con.execute("SELECT COUNT(*) FROM vardesc").fetchone()[0]
    log(f"  VARDESC filtered: {n:,} rows")

    for tname in (
        "LIMITS", "LOCATION", "VAREQ", "FlowPermits_AMAX",
        "Monthly_Flow_Permit", "Refresh_DateTime",
        "Effluent_Flow_Limits", "WWTP_OM_Report",
    ):
        con.execute(f"CREATE OR REPLACE TABLE {tname.lower()} AS SELECT * FROM src_{tname}")
    log("  11 base tables materialized")


def build_s_name_2_expr(source_expr: str) -> str:
    return f"""
        CASE
            WHEN {source_expr} IS NULL THEN NULL
            WHEN POSITION(' ' IN {source_expr}) > 0 THEN SUBSTR({source_expr}, POSITION(' ' IN {source_expr}) + 1)
            ELSE {source_expr}
        END
    """


def build_s_name_2_groups_expr(source_expr: str) -> str:
    return f"""
        CASE
            WHEN {source_expr} IS NULL OR TRIM({source_expr}) = '' THEN '(Blank)'
            WHEN {source_expr} IN ('Plnt Ef 2Hr Peak Flow Gpm') THEN '2-hour Peak Flow (gpm)'
            WHEN {source_expr} IN ('Plnt Ef 2Hr Peak Field') THEN '2-hour Peak Flow (MGD)'
            WHEN {source_expr} IN ('Plnt Ef FLOW Annual Avg') THEN 'Annual Average Flow (MGD)'
            WHEN {source_expr} IN ('Plnt If CBOD') THEN 'Influent CBOD'
            WHEN {source_expr} IN ('Plnt If NH3-N') THEN 'Influent NH3-N'
            WHEN {source_expr} IN ('Plnt If TSS') THEN 'Influent TSS'
            ELSE {source_expr}
        END
    """


def register_static_om_view(con: duckdb.DuckDBPyConnection) -> None:
    existing_parquet = OUT / "WWTP_OM_Report.parquet"
    existing_csv = CSV / "WWTP_O&M_Performace_Report.csv"
    if existing_parquet.exists():
        con.execute(f"""
            CREATE OR REPLACE VIEW src_WWTP_OM_Report AS
            SELECT * FROM read_parquet('{existing_parquet}')
        """)
        log(f"Using existing static O&M parquet: {existing_parquet}")
        return
    if existing_csv.exists():
        con.execute(f"""
            CREATE OR REPLACE VIEW src_WWTP_OM_Report AS
            SELECT * FROM read_csv('{existing_csv}', {CSV_OPTS})
        """)
        log(f"Using existing static O&M CSV: {existing_csv}")
        return
    raise RuntimeError(
        "WWTP O&M Performace Report is not present in the live HachWIMS feed and "
        "no local static copy was found."
    )


def build_base_tables_from_s3(con: duckdb.DuckDBPyConnection) -> None:
    log("Normalizing live S3 source tables into the PBIX-style shape…")
    excl_sql = ", ".join(sql_string(w) for w in WWTP_EXCLUDED)
    s_name_2_expr = build_s_name_2_expr("NAME")
    s_name_2_groups_expr = build_s_name_2_groups_expr('"S. Name 2"')

    con.execute("CREATE OR REPLACE TABLE location AS SELECT * FROM src_LOCATION")
    con.execute("CREATE OR REPLACE TABLE vareq AS SELECT * FROM src_VAREQ")
    register_static_om_view(con)

    con.execute(f"""
        CREATE OR REPLACE TABLE vardesc_full AS
        SELECT
            *,
            "UD2,UD1" AS UD1,
            ud2 AS UD2,
            UD3 AS WWTP,
            SHORTNAME AS "S. NAME",
            {s_name_2_expr} AS "S. Name 2",
            CAST(NULL AS VARCHAR) AS "Location ID",
            {build_s_name_2_groups_expr(s_name_2_expr)} AS "S. Name 2 (groups)"
        FROM src_VARDESC
    """)

    log("Applying report-level filters to VARDESC…")
    con.execute(f"""
        CREATE OR REPLACE TABLE vardesc AS
        SELECT * FROM vardesc_full
        WHERE WWTP IS NOT NULL
          AND WWTP NOT IN ({excl_sql})
    """)
    n = con.execute("SELECT COUNT(*) FROM vardesc").fetchone()[0]
    log(f"  VARDESC filtered: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE limits AS
        SELECT
            l.*,
            v.WWTP AS WWTP,
            CASE
                WHEN COALESCE(l.DESCRIPTION, '') ILIKE '%Peak Flow Gpm%' THEN l.LIMIT_VALUE
                ELSE l.LIMIT_VALUE * 1440 / 1000000
            END AS LIMIT_VALUE_MGD,
            v."Location ID" AS "Location ID"
        FROM src_LIMITS l
        LEFT JOIN vardesc_full v ON v.VARID = l.VARID
    """)

    con.execute("""
        CREATE OR REPLACE TABLE flowpermits_amax AS
        SELECT
            *,
            LIMIT_VALUE * 0.90 AS "90%",
            LIMIT_VALUE * 0.75 AS "75%"
        FROM limits
        WHERE ENDDATE = TIMESTAMP '2030-12-31 00:00:00'
          AND NAME IN ('AMAX', 'MMAX')
    """)

    con.execute("""
        CREATE OR REPLACE TABLE monthly_flow_permit AS
        WITH joined AS (
            SELECT
                l.AUDITUSER,
                l.LIMIT_VALUE,
                l.GROUPING,
                l.STATISTIC,
                l.WWTP,
                l.ENDDATE,
                l.NAME,
                l.VARID,
                v."S. NAME" AS vardesc_s_name
            FROM limits l
            LEFT JOIN vardesc_full v ON v.VARID = l.VARID
        ),
        ranked AS (
            SELECT *,
                   ROW_NUMBER() OVER (
                       PARTITION BY WWTP
                       ORDER BY ENDDATE DESC, LIMIT_VALUE DESC, VARID DESC
                   ) AS rn
            FROM joined
            WHERE AUDITUSER = 'E114077'
              AND vardesc_s_name IN ('Eff Flow', 'Plnt Ef Flow Mgd')
              AND NAME <> 'EPAMMAX'
              AND ENDDATE > TIMESTAMP '2024-06-22 00:00:00'
              AND WWTP IS NOT NULL
        )
        SELECT
            AUDITUSER,
            LIMIT_VALUE,
            GROUPING,
            STATISTIC,
            WWTP,
            CASE WHEN WWTP = 'Northbelt' THEN 6 ELSE LIMIT_VALUE END AS LIMIT_VALUE_update
        FROM ranked
        WHERE rn = 1
        ORDER BY WWTP
    """)

    con.execute("""
        CREATE OR REPLACE TABLE effluent_flow_limits AS
        WITH expanded AS (
            SELECT
                l.AUDITUSER,
                l.AUDITTIMESTAMP,
                l.ID,
                l.VARID,
                l.NAME,
                l.DESCRIPTION,
                l.STARTDATE,
                l.ENDDATE,
                l.COMPARE,
                l.LIMIT_VALUE,
                l.GROUPING,
                l.STATISTIC,
                l.EVENTTYPEID,
                l.DOCID,
                v.WWTP,
                d.all_date AS "All Dates",
                v.NAME AS "Parameter Name",
                CASE
                    WHEN COALESCE(l.DESCRIPTION, '') ILIKE '%Peak Flow Gpm%' THEN l.LIMIT_VALUE
                    ELSE l.LIMIT_VALUE * 1440 / 1000
                END AS LIMIT_VALUE_MGD,
                v."Location ID" AS "VARDESC.Location ID"
            FROM src_LIMITS l
            LEFT JOIN vardesc_full v ON v.VARID = l.VARID
            CROSS JOIN UNNEST(
                GENERATE_SERIES(
                    CAST(l.STARTDATE AS DATE),
                    CAST(l.ENDDATE AS DATE),
                    INTERVAL 1 DAY
                )
            ) AS d(all_date)
        )
        SELECT * FROM expanded
    """)

    con.execute("""
        CREATE OR REPLACE TABLE effluent_limit_lookup AS
        SELECT
            VARID,
            CAST("All Dates" AS DATE) AS date_key,
            ANY_VALUE(COMPARE) FILTER (WHERE COMPARE IS NOT NULL) AS COMPARE,
            ANY_VALUE(LIMIT_VALUE) FILTER (
                WHERE GROUPING = 'V'
                   OR (
                       GROUPING = 'M'
                       AND COALESCE("Parameter Name", '') LIKE '%Efncy Pr Eff%'
                       AND COALESCE("Parameter Name", '') NOT LIKE '%MAvg%'
                   )
            ) AS LIMIT_VALUE
        FROM effluent_flow_limits
        GROUP BY VARID, CAST("All Dates" AS DATE)
    """)

    con.execute("""
        CREATE OR REPLACE TABLE refresh_datetime AS
        WITH mx AS (SELECT MAX(AUDITTIMESTAMP) AS max_ts FROM src_DATATBL)
        SELECT
            max_ts AS DateTime,
            CAST(max_ts AS DATE) AS Date,
            TIMESTAMP '1899-12-30 00:00:00'
                + (max_ts - DATE_TRUNC('day', max_ts)) AS Time,
            'Last Refreshed:' AS Update,
            EXTRACT(EPOCH FROM (max_ts - TIMESTAMP '1899-12-30 00:00:00')) / 86400.0 AS DateTime2
        FROM mx
    """)

    log("Applying report-level filters to DATATBL and recreating PBIX calc columns…")
    con.execute(f"""
        CREATE OR REPLACE TABLE datatbl AS
        WITH base AS (
            SELECT
                d.AUDITUSER,
                d.AUDITTIMESTAMP,
                d.DATESTAMP,
                d.CURVALUE,
                d.TEXTVALUE,
                d.VARID,
                d.STATUS,
                d.FORCED,
                STRFTIME(d.DATESTAMP, '%m') AS Month,
                YEAR(d.DATESTAMP) AS Year,
                v."S. NAME" AS "Short Name",
                v.WWTP AS WWTP,
                DAY(d.DATESTAMP) AS Day,
                lookup.LIMIT_VALUE AS "Limit",
                v.NAME AS Name,
                COALESCE(lookup.COMPARE, 'N/A') AS Compare,
                CASE
                    WHEN COALESCE(v."S. NAME", '') LIKE '%Plnt Ef Bod Carb 5 D%' THEN 'CBOD Daily'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef CBOD 7-Day Avg%' THEN 'CBOD Weekly'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef CBOD MAvg%' THEN 'CBOD Monthly'
                    WHEN COALESCE(v."S. NAME", '') LIKE '%Plnt Ef Nh3 N Ammoni%' THEN 'NH3-N Daily'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef NH3-N 7-Day Avg%' AND COALESCE(v.NAME, '') NOT LIKE '%Calc%' THEN 'NH3-N Weekly'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef NH3-N MAvg%' AND COALESCE(v.NAME, '') NOT LIKE '%Calc%' THEN 'NH3-N Monthly'
                    WHEN COALESCE(v."S. NAME", '') LIKE '%Plnt Ef Residue Totn%' THEN 'TSS Daily'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef TSS 7-Day Avg%' THEN 'TSS Weekly'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef TSS MAvg%' THEN 'TSS Monthly'
                    WHEN COALESCE(v.NAME, '') LIKE '%E.coli%' THEN 'E.Coli'
                    WHEN COALESCE(v.NAME, '') LIKE '%Enterococci%' THEN 'Enterococci'
                    WHEN COALESCE(v.NAME, '') LIKE '%Ef Cl2 Residual Prior%' THEN 'Cl2 Residual Prior'
                    WHEN COALESCE(v.NAME, '') LIKE '%Ef Cl2 Residual De-Chl%' THEN 'Cl2 Residual De-Chl'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef Diss Oxygen%' THEN 'Dissolved Oxygen'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef pH Field%' THEN 'pH'
                    WHEN COALESCE(v.NAME, '') LIKE '%Efncy Pr Eff CBOD Load%' AND COALESCE(v.NAME, '') NOT LIKE '%Efncy Pr Eff CBOD Load MAvg%' THEN 'CBOD Daily Load'
                    WHEN COALESCE(v.NAME, '') LIKE '%Efncy Pr Efncy Eff NH3-N Load%' AND COALESCE(v.NAME, '') NOT LIKE '% Efncy PrEff NH3-N Load MAvg%' THEN 'NH3-N Daily Load'
                    WHEN COALESCE(v.NAME, '') LIKE '%Efncy Pr Efncy Eff TSS Load%' AND COALESCE(v.NAME, '') NOT LIKE '%Efncy Pr Eff TSS Load MAvg%' THEN 'TSS Daily Load'
                    WHEN COALESCE(v.NAME, '') LIKE '%Efncy Pr Eff CBOD Load MAvg%' THEN 'CBOD Monthly Load'
                    WHEN COALESCE(v.NAME, '') LIKE '%Efncy Pr Eff NH3-N Load MAvg%' THEN 'NH3-N Monthly Load'
                    WHEN COALESCE(v.NAME, '') LIKE '%Efncy Pr Eff TSS Load MAvg%' THEN 'TSS Monthly Load'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef 2Hr Peak Flow Gpm%' THEN '2 Hour Peak Flow'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef Flow Mgd%' THEN 'Daily Flow'
                    WHEN COALESCE(v.NAME, '') LIKE '%Plnt Ef FLOW Month Avg%' THEN 'Monthly Flow'
                    ELSE NULL
                END AS "Categories One",
                d.DATESTAMP AS "Date",
                CAST(STRFTIME(d.DATESTAMP, '%U') AS INT) + 1 AS "Week Number",
                CASE
                    WHEN COALESCE(v."S. NAME", '') LIKE '%Plnt Ef Bod Carb 5 D%' THEN 'CBOD'
                    ELSE NULL
                END AS _scratch_only,
                CASE
                    WHEN COALESCE(mfp.LIMIT_VALUE_update, mfp.LIMIT_VALUE) IS NOT NULL
                        THEN CASE WHEN mfp.WWTP = 'Northbelt' THEN 6 ELSE COALESCE(mfp.LIMIT_VALUE_update, mfp.LIMIT_VALUE) END
                    ELSE NULL
                END AS "Color Format for Flow",
                v."S. Name 2" AS "S Name 2",
                STRFTIME(d.DATESTAMP, '%Y %b') AS "Year-Month"
            FROM src_DATATBL d
            LEFT JOIN vardesc v ON v.VARID = d.VARID
            LEFT JOIN effluent_limit_lookup lookup
                ON lookup.VARID = d.VARID
               AND lookup.date_key = CAST(d.DATESTAMP AS DATE)
            LEFT JOIN monthly_flow_permit mfp
                ON mfp.WWTP = v.WWTP
            WHERE v.WWTP IS NOT NULL
              AND v.WWTP NOT IN ({excl_sql})
              AND d.DATESTAMP >= DATE '{DATE_FLOOR}'
        )
        SELECT
            AUDITUSER,
            AUDITTIMESTAMP,
            DATESTAMP,
            CURVALUE,
            TEXTVALUE,
            VARID,
            STATUS,
            FORCED,
            Month,
            Year,
            "Short Name",
            WWTP,
            Day,
            "Limit",
            CASE
                WHEN "Limit" < CURVALUE AND "Limit" IS NOT NULL AND Compare = '>' THEN 1
                ELSE 0
            END AS Violation,
            Name,
            Compare,
            "Categories One",
            "Date",
            "Week Number",
            CASE
                WHEN "Categories One" LIKE '%Weekly%' THEN 'Weekly'
                WHEN "Categories One" LIKE '%Monthly%' THEN 'Monthly'
                WHEN "Categories One" IS NOT NULL THEN 'Daily'
                ELSE NULL
            END AS "Category Two",
            CASE
                WHEN COALESCE("Categories One", '') LIKE '%CBOD%' AND COALESCE("Categories One", '') NOT LIKE '%Load%' THEN 'CBOD'
                WHEN COALESCE("Categories One", '') LIKE '%CBOD%' AND COALESCE("Categories One", '') LIKE '%Load%' THEN 'CBOD Load'
                WHEN COALESCE("Categories One", '') LIKE '%NH3-N%' AND COALESCE("Categories One", '') NOT LIKE '%Load%' THEN 'NH3-N'
                WHEN COALESCE("Categories One", '') LIKE '%NH3-N%' AND COALESCE("Categories One", '') LIKE '%Load%' THEN 'NH3-N Load'
                WHEN COALESCE("Categories One", '') LIKE '%TSS%' AND COALESCE("Categories One", '') NOT LIKE '%Load%' THEN 'TSS'
                WHEN COALESCE("Categories One", '') LIKE '%TSS%' AND COALESCE("Categories One", '') LIKE '%Load%' THEN 'TSS Load'
                WHEN COALESCE("Categories One", '') LIKE '%E.Coli%' THEN 'E.Coli'
                WHEN COALESCE("Categories One", '') LIKE '%Dissolved Oxygen%' THEN 'Dissolved Oxygen'
                WHEN COALESCE("Categories One", '') LIKE '%Flow%' THEN 'Flow'
                WHEN COALESCE("Categories One", '') LIKE '%Cl2 Residual%' THEN 'Cl2 Residual'
                ELSE NULL
            END AS "Primary Parameter",
            CAST(STRFTIME(DATESTAMP, '%j') AS INT) AS "Day of Year",
            CASE
                WHEN "Color Format for Flow" IS NULL THEN NULL
                WHEN CURVALUE < 0.75 * "Color Format for Flow" THEN 1
                WHEN CURVALUE >= 0.75 * "Color Format for Flow" AND CURVALUE < 0.9 * "Color Format for Flow" THEN 2
                WHEN CURVALUE >= 0.9 * "Color Format for Flow" AND CURVALUE <= "Color Format for Flow" THEN 3
                WHEN CURVALUE > "Color Format for Flow" THEN 4
                ELSE NULL
            END AS "Color Formatting Number",
            "Color Format for Flow",
            0.75 * "Color Format for Flow" AS "75%",
            0.90 * "Color Format for Flow" AS "90%",
            "S Name 2",
            "Year-Month",
            {build_s_name_2_groups_expr('"S Name 2"')} AS "S Name 2 (groups)"
        FROM base
    """)
    n = con.execute("SELECT COUNT(*) FROM datatbl").fetchone()[0]
    log(f"  DATATBL filtered/enriched: {n:,} rows")

    con.execute("CREATE OR REPLACE TABLE wwtp_om_report AS SELECT * FROM src_WWTP_OM_Report")
    log("  live base tables materialized")


def precompute_rolling_measures(con: duckdb.DuckDBPyConnection) -> None:
    log("Pre-computing rolling-window measures on DATATBL…")
    con.execute("""
        CREATE OR REPLACE TABLE datatbl AS
        SELECT *,
            MIN(CURVALUE) OVER (
                PARTITION BY WWTP, VARID
                ORDER BY DATESTAMP
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ) AS "Rolling 3 Months Minimum_row",
            AVG(CURVALUE) OVER (
                PARTITION BY WWTP, VARID
                ORDER BY DATESTAMP
                RANGE BETWEEN INTERVAL 30 DAY PRECEDING AND CURRENT ROW
            ) AS "Rolling 30 day Average_row",
            AVG(CURVALUE) OVER (
                PARTITION BY WWTP, VARID
                ORDER BY DATESTAMP
                RANGE BETWEEN INTERVAL 12 MONTH PRECEDING AND CURRENT ROW
            ) AS "Rolling 12mo Avg_row"
        FROM datatbl
    """)
    log("  added Rolling 3 Months Minimum_row, Rolling 30 day Average_row, Rolling 12mo Avg_row")


def build_calc_tables(con: duckdb.DuckDBPyConnection) -> None:
    log("Computing vt_* calc tables from DAX definitions…")
    select_list_sql = ", ".join(
        f"LOWER('{s.replace(chr(39), chr(39) + chr(39))}')" for s in VT_SELECTPARAMS_LIST
    )
    con.execute(f"""
        CREATE OR REPLACE TABLE vt_selectparams_bywwtp AS
        SELECT d.DATESTAMP, v.WWTP, v."S. Name 2",
               AVG(d.CURVALUE) AS CURVALUE,
               YEAR(d.DATESTAMP) AS "YEAR",
               STRFTIME(d.DATESTAMP, '%b') AS "Month"
        FROM datatbl d
        JOIN vardesc v ON v.VARID = d.VARID
        WHERE LOWER(v."S. Name 2") IN ({select_list_sql})
        GROUP BY d.DATESTAMP, v.WWTP, v."S. Name 2"
    """)
    n = con.execute("SELECT COUNT(*) FROM vt_selectparams_bywwtp").fetchone()[0]
    log(f"  vt_SelectParams_byWWTP: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE vt_scadarainfall_bywwtp AS
        SELECT DATESTAMP, WWTP, "S. Name 2",
               "Plnt Rainfall",
               YEAR(DATESTAMP) AS "YEAR",
               CASE
                 WHEN "Plnt Rainfall" > 0   AND "Plnt Rainfall" < 0.1 THEN 'No Rain'
                 WHEN "Plnt Rainfall" > 0.5 AND "Plnt Rainfall" < 1.0 THEN '0.5-1.0'
                 ELSE 'GTE 1'
               END AS RainCat
        FROM (
            SELECT d.DATESTAMP, v.WWTP, v."S. Name 2",
                   AVG(d.CURVALUE) AS "Plnt Rainfall"
            FROM datatbl d
            JOIN vardesc v ON v.VARID = d.VARID
            WHERE LOWER(v."S. Name 2") = LOWER('Plnt Rainfall')
            GROUP BY d.DATESTAMP, v.WWTP, v."S. Name 2"
        )
    """)
    n = con.execute("SELECT COUNT(*) FROM vt_scadarainfall_bywwtp").fetchone()[0]
    log(f"  vt_SCADARainfall_byWWTP: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE vt_regulatoryparameters_bywwtp AS
        SELECT d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION,
               AVG(d.CURVALUE) AS CURVALUE,
               YEAR(d.DATESTAMP) AS "YEAR"
        FROM datatbl d
        JOIN vardesc v ON v.VARID = d.VARID
        JOIN location l ON l.LOCID = v.LOCID
        WHERE l.DESCRIPTION = 'Round Variables for Reporting of Regulations'
        GROUP BY d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION
    """)
    n = con.execute("SELECT COUNT(*) FROM vt_regulatoryparameters_bywwtp").fetchone()[0]
    log(f"  vt_RegulatoryParameters_byWWTP: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE vt_plntifparameters_bywwtp AS
        SELECT d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION, v.UD1,
               AVG(d.CURVALUE) AS CURVALUE,
               YEAR(d.DATESTAMP) AS "YEAR",
               STRFTIME(d.DATESTAMP, '%b') AS "MONTH"
        FROM datatbl d
        JOIN vardesc v ON v.VARID = d.VARID
        LEFT JOIN location l ON l.LOCID = v.LOCID
        WHERE v."S. Name 2" ILIKE '%Plnt if%'
        GROUP BY d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION, v.UD1
    """)
    n = con.execute("SELECT COUNT(*) FROM vt_plntifparameters_bywwtp").fetchone()[0]
    log(f"  vt_PlntIFParameters_byWWTP: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE vt_plntefparameters_bywwtp AS
        SELECT d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION, v.UD1,
               AVG(d.CURVALUE) AS CURVALUE,
               YEAR(d.DATESTAMP) AS "YEAR",
               STRFTIME(d.DATESTAMP, '%b') AS "MONTH"
        FROM datatbl d
        JOIN vardesc v ON v.VARID = d.VARID
        LEFT JOIN location l ON l.LOCID = v.LOCID
        WHERE v.UD1 ILIKE '%Plnt ef%'
        GROUP BY d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION, v.UD1
    """)
    n = con.execute("SELECT COUNT(*) FROM vt_plntefparameters_bywwtp").fetchone()[0]
    log(f"  vt_PlntEFParameters_byWWTP: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE vt_plntchemicals_bywwtp AS
        SELECT d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION, v.UD1,
               AVG(d.CURVALUE) AS CURVALUE,
               YEAR(d.DATESTAMP) AS "YEAR",
               STRFTIME(d.DATESTAMP, '%b') AS "MONTH"
        FROM datatbl d
        JOIN vardesc v ON v.VARID = d.VARID
        LEFT JOIN location l ON l.LOCID = v.LOCID
        WHERE v.UD1 LIKE '%ChemA 01%'
        GROUP BY d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION, v.UD1
    """)
    n = con.execute("SELECT COUNT(*) FROM vt_plntchemicals_bywwtp").fetchone()[0]
    log(f"  vt_PlntChemicals_byWWTP: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE vt_plntelectricity_bywwtp AS
        SELECT d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION, v.UD1,
               AVG(d.CURVALUE) AS CURVALUE,
               YEAR(d.DATESTAMP) AS "YEAR",
               STRFTIME(d.DATESTAMP, '%b') AS "MONTH"
        FROM datatbl d
        JOIN vardesc v ON v.VARID = d.VARID
        LEFT JOIN location l ON l.LOCID = v.LOCID
        WHERE v.UD1 LIKE '%Elec 01%'
        GROUP BY d.DATESTAMP, v.WWTP, v."S. Name 2", l.DESCRIPTION, v.UD1
    """)
    n = con.execute("SELECT COUNT(*) FROM vt_plntelectricity_bywwtp").fetchone()[0]
    log(f"  vt_PlntElectricity_byWWTP: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE vt_efflow_bywwtp AS
        SELECT d.DATESTAMP, v.WWTP, v."S. Name 2",
               AVG(d.CURVALUE) AS "EfFlow_MGD_GPM",
               STRFTIME(d.DATESTAMP, '%Y %b') AS "Year-Month"
        FROM datatbl d
        JOIN vardesc v ON v.VARID = d.VARID
        WHERE LOWER(v."S. Name 2") IN (LOWER('Plnt Ef Flow MGD'), LOWER('Plnt Ef 2Hr Peak Flow GPM'))
        GROUP BY d.DATESTAMP, v.WWTP, v."S. Name 2"
    """)
    n = con.execute("SELECT COUNT(*) FROM vt_efflow_bywwtp").fetchone()[0]
    log(f"  vt_EfFlow_byWWTP: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE kpi_table AS
        WITH mx AS (SELECT MAX(DATESTAMP) AS maxdt FROM datatbl),
             recent AS (
                 SELECT d.*
                 FROM datatbl d, mx
                 WHERE d.DATESTAMP >= mx.maxdt - INTERVAL 3 DAY
             )
        SELECT DISTINCT r.VARID, r.Name, r.WWTP, r.CURVALUE,
               v.STORETCODE, v.LOCID, r.DATESTAMP
        FROM recent r
        JOIN vardesc v ON v.VARID = r.VARID
    """)
    n = con.execute("SELECT COUNT(*) FROM kpi_table").fetchone()[0]
    log(f"  KPI Table: {n:,} rows")

    con.execute("""
        CREATE OR REPLACE TABLE key_lab_data AS
        SELECT
            v.WWTP, YEAR(d.DATESTAMP) AS Year,
            MONTH(d.DATESTAMP) AS Month, DAY(d.DATESTAMP) AS Day,
            AVG(CASE WHEN v."S. Name 2" ILIKE '%Plnt Ef Flow Mgd%' THEN d.CURVALUE END) AS "Flow, MGD",
            AVG(CASE WHEN v."S. Name 2" ILIKE '%Plnt If CBOD%'     THEN d.CURVALUE END) AS "Influent BOD",
            AVG(CASE WHEN v."S. Name 2" ILIKE '%Plnt Ef CBOD%'     THEN d.CURVALUE END) AS "Effluent BOD",
            AVG(CASE WHEN v."S. Name 2" ILIKE '%Plnt If NH3-N%'    THEN d.CURVALUE END) AS "Influent NH3-N",
            AVG(CASE WHEN v."S. Name 2" ILIKE '%Plnt Ef NH3-N%'    THEN d.CURVALUE END) AS "Effluent NH3-N",
            AVG(CASE WHEN v."S. Name 2" ILIKE '%Plnt If TSS%'      THEN d.CURVALUE END) AS "Influent TSS",
            AVG(CASE WHEN v."S. Name 2" ILIKE '%Plnt Ef TSS%'      THEN d.CURVALUE END) AS "Effluent TSS",
            AVG(CASE WHEN v."S. Name 2" LIKE '%RAS%' AND v."S. Name 2" LIKE '%TSS%' AND v."S. Name 2" NOT LIKE '%\\%%' ESCAPE '\\' THEN d.CURVALUE END) AS "RAS MLSS",
            AVG(CASE WHEN v."S. Name 2" LIKE '%Aer%' AND v."S. Name 2" LIKE '%TSS%' AND v."S. Name 2" NOT LIKE '%\\%%' ESCAPE '\\' AND v."S. Name 2" NOT LIKE '%Pr%' THEN d.CURVALUE END) AS "Aeration Basin MLSS",
            AVG(CASE WHEN v."S. Name 2" LIKE '%RAS%' AND v."S. Name 2" LIKE '%TSS%' AND v."S. Name 2" LIKE '%VSS%' THEN d.CURVALUE END) AS "RAS MLVSS/MLSS",
            AVG(CASE WHEN v."S. Name 2" LIKE '%Aer%' AND v."S. Name 2" LIKE '%TSS%' AND v."S. Name 2" LIKE '%VSS%' THEN d.CURVALUE END) AS "Aer MLVSS/MLSS"
        FROM datatbl d
        JOIN vardesc v ON v.VARID = d.VARID
        GROUP BY v.WWTP, YEAR(d.DATESTAMP), MONTH(d.DATESTAMP), DAY(d.DATESTAMP)
    """)
    n = con.execute("SELECT COUNT(*) FROM key_lab_data").fetchone()[0]
    log(f"  Key Lab Data: {n:,} rows")


def export_tables(con: duckdb.DuckDBPyConnection) -> None:
    log("Writing parquet outputs…")
    for tbl, out_name in TABLES_OUT:
        path = OUT / out_name
        con.execute(f"COPY {tbl} TO '{path}' (FORMAT PARQUET, COMPRESSION ZSTD)")
        sz = path.stat().st_size
        log(f"  {out_name:48s} {sz / 1024 / 1024:7.2f} MB")


def validate(con: duckdb.DuckDBPyConnection) -> None:
    log("Validating violation counts vs archived v1 summary…")
    rows = con.execute("""
        SELECT WWTP, CAST(SUM(Violation) AS INT) AS vio
        FROM datatbl
        WHERE Violation = 1
        GROUP BY WWTP ORDER BY vio DESC
    """).fetchall()
    new_by = dict(rows)
    old = json.load(open(ROOT / "archive/v1_app/data/violations_summary.json"))
    old_by = {r["WWTP"]: r["count"] for r in old["by_wwtp"]}
    all_plants = set(old_by) | set(new_by)
    mismatches = [
        (p, new_by.get(p, 0), old_by.get(p, 0))
        for p in all_plants
        if new_by.get(p, 0) != old_by.get(p, 0)
    ]
    total_new = sum(new_by.values())
    total_old = sum(old_by.values())
    log(f"  Totals: new={total_new}  old={total_old}  diff={total_new - total_old}")
    if mismatches:
        log(f"  {len(mismatches)} per-WWTP mismatches:")
        for plant, new_v, old_v in mismatches:
            log(f"    {plant!r:30s} new={new_v}  old={old_v}")
    else:
        log("  all plants match")


def cleanup(con: duckdb.DuckDBPyConnection) -> None:
    con.close()
    db_file = OUT / ".duckdb"
    if db_file.exists():
        db_file.unlink()
        print(f"Cleaned up {db_file} (working cache)")


def main() -> int:
    args = parse_args()
    con = duckdb.connect(str(OUT / ".duckdb"))
    try:
        if args.source == "csv":
            register_csv_source_views(con)
            build_base_tables_from_csv(con)
        else:
            local_paths = download_s3_sources(
                bucket=args.s3_bucket,
                prefix=args.s3_prefix,
                cache_dir=Path(args.cache_dir),
            )
            register_s3_source_views(con, local_paths)
            build_base_tables_from_s3(con)

        precompute_rolling_measures(con)
        build_calc_tables(con)
        export_tables(con)
        validate(con)
        log("Done.")
        return 0
    finally:
        cleanup(con)


if __name__ == "__main__":
    sys.exit(main())
