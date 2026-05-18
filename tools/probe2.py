"""Phase 1 follow-up: list DAX measures, M query names, relationships."""
from pathlib import Path
from pbixray import PBIXRay
import zipfile, json, io

ROOT = Path(__file__).resolve().parents[1]
PBIX = ROOT / "source" / "Viewer_HachWIMS_DMRReportsPlus_Violations_Dataflow.pbix"
OUT  = ROOT / "tools" / "probe2_output.txt"
_f = open(OUT, "w")
def p(*a):
    line = " ".join(str(x) for x in a)
    print(line); print(line, file=_f)

m = PBIXRay(str(PBIX))

p("=" * 70); p("DAX MEASURES"); p("=" * 70)
if hasattr(m, "dax_measures"):
    dm = m.dax_measures
    p(f"(total: {dm.shape[0]})"); p(f"columns: {list(dm.columns)}")
    for _, r in dm.iterrows():
        tbl = r.get("TableName", "?")
        nm  = r.get("Name", r.get("MeasureName", "?"))
        expr = str(r.get("Expression", ""))[:180].replace("\n", " ")
        p(f"  [{tbl}] {nm}")
        p(f"      {expr}")

p(""); p("=" * 70); p("M QUERIES"); p("=" * 70)
if hasattr(m, "power_query"):
    pq = m.power_query
    p(f"(total: {pq.shape[0]})"); p(f"columns: {list(pq.columns)}")
    for _, r in pq.iterrows():
        nm = r.get("TableName", r.get("Name", "?"))
        expr = str(r.get("Expression", ""))
        p(f"  {nm}  (length {len(expr)} chars)")

p(""); p("=" * 70); p("RELATIONSHIPS"); p("=" * 70)
if hasattr(m, "relationships"):
    rel = m.relationships
    p(f"(total: {rel.shape[0]})"); p(f"columns: {list(rel.columns)}")
    for _, r in rel.iterrows():
        p(f"  {dict(r)}")

p(""); p("=" * 70); p("CALCULATED COLUMNS (first 30 of many)"); p("=" * 70)
if hasattr(m, "dax_columns"):
    dc = m.dax_columns
    p(f"(total: {dc.shape[0]})"); p(f"columns: {list(dc.columns)}")
    for _, r in dc.head(30).iterrows():
        tbl = r.get("TableName", "?")
        nm  = r.get("ColumnName", "?")
        expr = str(r.get("Expression", ""))[:120].replace("\n", " ")
        p(f"  [{tbl}].{nm}")
        p(f"      {expr}")

p(""); p("=" * 70); p("REPORT LAYOUT (pages)"); p("=" * 70)
with zipfile.ZipFile(str(PBIX), "r") as z:
    for n in z.namelist():
        if "Layout" in n:
            p(f"  found: {n} ({z.getinfo(n).file_size} bytes)")
    with z.open("Report/Layout") as lf:
        raw = lf.read()
    try:
        layout = json.loads(raw.decode("utf-16-le"))
    except UnicodeError:
        layout = json.loads(raw.decode("utf-8"))
    sections = layout.get("sections", [])
    p(f"  total pages (sections): {len(sections)}")
    total_visuals = sum(len(s.get("visualContainers", [])) for s in sections)
    p(f"  total visual containers: {total_visuals}")
    p("  first 10 page names:")
    for s in sections[:10]:
        p(f"    order={s.get('ordinal','?'):>3}  name={s.get('displayName') or s.get('name')}  visuals={len(s.get('visualContainers',[]))}")
