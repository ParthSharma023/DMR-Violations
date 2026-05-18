"""Phase 1 probe: inventory the PBIX without extracting bulk data yet."""
import sys, json
from pathlib import Path
from pbixray import PBIXRay

ROOT = Path(__file__).resolve().parents[1]
PBIX = ROOT / "source" / "Viewer_HachWIMS_DMRReportsPlus_Violations_Dataflow.pbix"
OUT  = ROOT / "tools" / "probe_output.txt"

_f = open(OUT, "w")
_builtin_print = print
def _p(*a, **k):
    _builtin_print(*a, **k)
    _builtin_print(*a, **k, file=_f)

def banner(t): _p("\n" + "=" * 70 + f"\n {t}\n" + "=" * 70)
print = _p  # redirect everything below to tee

print(f"File: {PBIX.name}")
print(f"Size: {PBIX.stat().st_size / (1024**2):.1f} MB")

m = PBIXRay(str(PBIX))

banner("TOP-LEVEL COUNTS")
print(f"  tables (schema)       : {len(m.tables)}")
print(f"  DAX measures          : {m.dax_measures.shape[0] if hasattr(m, 'dax_measures') else 'n/a'}")
print(f"  calculated columns    : {m.dax_columns.shape[0] if hasattr(m, 'dax_columns') else 'n/a'}")
print(f"  calculated tables     : {m.dax_tables.shape[0] if hasattr(m, 'dax_tables') else 'n/a'}")
print(f"  M queries             : {m.power_query.shape[0] if hasattr(m, 'power_query') else 'n/a'}")
print(f"  relationships         : {m.relationships.shape[0] if hasattr(m, 'relationships') else 'n/a'}")
print(f"  schema rows (col defs): {m.schema.shape[0] if hasattr(m, 'schema') else 'n/a'}")

banner("TABLES")
for t in m.tables:
    try:
        n = m.get_table(t).shape[0]
    except Exception as e:
        n = f"error: {e}"
    print(f"  {t:40s} rows={n}")

banner("METADATA")
try:
    meta = m.metadata
    print(meta.to_string() if hasattr(meta, "to_string") else meta)
except Exception as e:
    print(f"metadata error: {e}")

banner("STATISTICS")
try:
    print(m.statistics.to_string() if hasattr(m.statistics, "to_string") else m.statistics)
except Exception as e:
    print(f"statistics error: {e}")

banner("SIZE / MODEL SIZE")
try:
    print(f"  model size (bytes): {m.size}")
except Exception as e:
    print(f"size error: {e}")
