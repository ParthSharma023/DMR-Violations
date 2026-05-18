"""Phase 2 extractor: dump the full data-model artifacts to JSON so the
markdown docs can be generated from a stable snapshot."""
from pathlib import Path
from pbixray import PBIXRay
import json, pandas as pd

ROOT = Path(__file__).resolve().parents[1]
PBIX = ROOT / "source" / "Viewer_HachWIMS_DMRReportsPlus_Violations_Dataflow.pbix"
OUTDIR = ROOT / "tools" / "model_dump"
OUTDIR.mkdir(exist_ok=True)

m = PBIXRay(str(PBIX))

def dump(df, name):
    path = OUTDIR / f"{name}.json"
    if df is None:
        path.write_text("null")
        return 0
    # Normalize NaN → None for JSON
    records = json.loads(df.to_json(orient="records", date_format="iso"))
    path.write_text(json.dumps(records, indent=2))
    return len(records)

print("dax_measures        :", dump(m.dax_measures,  "dax_measures"))
print("dax_columns         :", dump(m.dax_columns,   "dax_columns"))
print("dax_tables          :", dump(m.dax_tables,    "dax_tables"))
print("power_query         :", dump(m.power_query,   "power_query"))
print("relationships       :", dump(m.relationships, "relationships"))
print("schema              :", dump(m.schema,        "schema"))
print("metadata            :", dump(m.metadata,      "metadata"))
print("statistics          :", dump(m.statistics,    "statistics"))
print("tables list         :", len(m.tables))
(OUTDIR / "tables.json").write_text(json.dumps(list(m.tables), indent=2))
print("Wrote to", OUTDIR)
