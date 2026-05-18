# DMR Violations PBI — Complete Data Model (Verbatim from AS Instance)

Extracted 2026-05-14 from live msmdsrv.exe (port 57472) via SQLite metadata store.
All DAX expressions, M code, and schema are verbatim from the Power BI data model.

---

## Data Sources

All primary tables load from **PowerBI Dataflows**:
- **Workspace ID**: `597882e1-04dd-4e9b-bf59-bceae3a2043b`
- **Dataflow ID**: `44802b8e-bfe1-45d5-9acb-a23dac5ed9e6`
  - Entities: DATATBL, VARDESC, LIMITS, LOCATION, VAREQ
  - Derived tables: Effluent Flow Limits, Monthly Flow Permit, FlowPermits_AMAX

Secondary dataflow for O&M:
- **Dataflow ID**: `435fdf1d-97a6-4f93-b64c-13c48ea702d3` (PowerPlatform.Dataflows)
  - Entity: WWTP Attributes → WWTP O&M Performance Report

---

## Tables (Non-Date)

| Table | Description |
|-------|-------------|
| DATATBL | Primary fact table: daily measurement readings |
| VARDESC | Variable descriptor lookup (parameter definitions per WWTP) |
| LIMITS | Permit limits per parameter |
| LOCATION | WWTP physical location/permit metadata |
| VAREQ | Variable equations |
| Effluent Flow Limits | LIMITS filtered/enriched for flow, expanded to daily rows |
| Monthly Flow Permit | Permit AAF (Annual Average Flow) per WWTP — key permit reference |
| FlowPermits_AMAX | LIMITS filtered to NAME = AMAX or MMAX, ENDDATE = 2030-12-31 |
| Refresh_DateTime | Single-row table: report refresh timestamp |
| KPI Table | SUMMARIZECOLUMNS calculated table for KPI visuals |
| vt_SelectParams_byWWTP | SUMMARIZECOLUMNS calculated table for selected parameters |
| vt_EfFlow_byWWTP | Effluent flow only, with Year-Month column |
| vt_SCADARainfall_byWWTP | Rainfall data per WWTP |
| vt_RegulatoryParameters_byWWTP | Regulatory parameters subset |
| vt_PlntEFParameters_byWWTP | Effluent parameters (UD1 contains "Plnt ef") |
| vt_PlntIFParameters_byWWTP | Influent parameters (S. Name 2 contains "Plnt if") |
| vt_PlntChemicals_byWWTP | Chemical parameters (UD1 contains "ChemA 01") |
| vt_PlntElectricity_byWWTP | Electricity usage data (UD1 contains "Elec 01") |
| Key Lab Data for WWTP | Wide SUMMARIZECOLUMNS table with ~25 KPIs |
| WWTP O&M Performance Report | O&M data from PowerPlatform dataflow |

---

## Relationships (Verbatim, Key Non-Date Relationships)

Format: `FromTable[Column] → ToTable[Column]` | Cardinality | CrossFilter | Active

```
DATATBL[VARID]               → VARDESC[VARID]          | M:1 | Single  | YES
VARDESC[LOCID]               → LOCATION[LOCID]         | M:1 | Both    | YES
LIMITS[VARID]                → DATATBL[VARID]          | M:M | Single  | YES
LIMITS[VARID]                → FlowPermits_AMAX[VARID] | M:1 | Both    | YES
Effluent Flow Limits[ID]     → LIMITS[ID]              | M:1 | Single  | YES
Effluent Flow Limits[VARID]  → VARDESC[VARID]          | M:1 | Single  | NO (inactive)
VAREQ[VARID]                 → VARDESC[VARID]          | M:1 | Single  | YES
WWTP O&M Report[Location ID] → VARDESC[Location ID]    | M:M | Both    | YES
```

---

## DAX Measures (DATATBL table, all verbatim)

### Percentile Measures
```dax
[100th Percentile] := PERCENTILE.INC(DATATBL[CURVALUE],1)
-- Format: #,0.00

[25th Percentile] := PERCENTILE.INC(DATATBL[CURVALUE],.25)
-- Format: #,0.00

[50th Percentile] := PERCENTILE.INC(DATATBL[CURVALUE],.50)
-- Format: #,0.00

[75th Percentile] := PERCENTILE.INC(DATATBL[CURVALUE],.75)
-- Format: #,0.00

[95th Percentile] := PERCENTILE.INC(DATATBL[CURVALUE],.95)
-- Format: #,0.00

[99th Percentile] := PERCENTILE.INC(DATATBL[CURVALUE],.99)
-- Format: #,0.00
```

### Average Measures
```dax
[AVG_Calc] := AVERAGEX('DATATBL', AVerage(DATATBL[CURVALUE]))

[Average Curval] := AVERAGEA(DATATBL[CURVALUE])

[Average Monthly] := (blank — no expression defined)

[Avg_CurValue] := Average('DATATBL'[CURVALUE])
-- Format: 0.00

[Average of Color Format for Flow minus Max of CURVALUE] :=
AVERAGE('DATATBL'[Color Format for Flow]) - MAX('DATATBL'[CURVALUE])
-- Format: 0.00
```

### Max / Min Measures
```dax
[MAX Curval] := MAXA(DATATBL[CURVALUE])

[Max AAF] := Maxx('DATATBL', max('DATATBL'[CURVALUE]))
-- Format: 0

[Min Curval] := MINA(DATATBL[CURVALUE])
```

### Permit % Measures
```dax
[Measure Max AAF%] :=
DIVIDE(
    'DATATBL'[Max AAF],
    AVERAGE('DATATBL'[Color Format for Flow])
)
-- Format: 0%;-0%;0%

[Rolling 3 Months Minimum max per DATESTAMP divided by Color Format for Flow] :=
DIVIDE(
    [Rolling 3 Months Minimum max per DATESTAMP],
    AVERAGE('DATATBL'[Color Format for Flow])
)
-- Format: 0.00%;-0.00%;0.00%
```

### Compliance / KPI Measures
```dax
[CurValue_Record_Count] :=
CALCULATE(COUNTROWS('DATATBL'), SUMMARIZE('DATATBL', 'DATATBL'[Name]))
-- Format: 0

[Color Format for Flow % difference from Rolling 3 Months Minimum max per DATESTAMP] :=
VAR __BASELINE_VALUE = [Rolling 3 Months Minimum max per DATESTAMP]
VAR __VALUE_TO_COMPARE = SUM('DATATBL'[Color Format for Flow])
RETURN
    IF(
        NOT ISBLANK(__VALUE_TO_COMPARE),
        DIVIDE(__VALUE_TO_COMPARE - __BASELINE_VALUE, __BASELINE_VALUE)
    )
-- Format: 0.00%;-0.00%;0.00%
```

### Rolling / Time Intelligence Measures
```dax
[Rolling 3 Months Minimum] :=
CALCULATE (
    MINX( DATATBL,DATATBL[CURVALUE]),
    DATESINPERIOD (
        DATATBL[DATESTAMP],
        LASTDATE ( DATATBL[DATESTAMP] ),
        -3,
        MONTH
    )
)

[Rolling 3 Months Minimum max per DATESTAMP] :=
MAXX(
    KEEPFILTERS(VALUES('DATATBL'[DATESTAMP])),
    CALCULATE([Rolling 3 Months Minimum])
)

[Rolling 30 day Average] :=
AVERAGEX(DATESINPERIOD(DATATBL[Date].[Date],LASTDATE(DATATBL[Date].[Date]),-30,DAY),
         CALCULATE(SUM(DATATBL[CURVALUE])))
```

### Statistical Measures
```dax
[STDEV.S] := STDEV.S(DATATBL[CURVALUE])

[STDEV.P] := STDEV.P(DATATBL[CURVALUE])
```

### Miscellaneous
```dax
[Measure1] :=
Var Maxvale =
UNION(
    ROW("Value",SELECTEDVALUE(DATATBL[CURVALUE])),
    Row("Value",[Rolling 3 Months Minimum])
)
return
MINX(Maxvale,[Value])
```

---

## DAX Measures (vt_SelectParams_byWWTP table)

```dax
[CURParameterValue_AVG] :=
Calculate(average('vt_SelectParams_byWWTP'[CURVALUE]),
    Filter('vt_SelectParams_byWWTP',
        'vt_SelectParams_byWWTP'[S. Name 2]=SELECTEDVALUE('vt_SelectParams_byWWTP'[S. Name 2])
    )
)

[CURParameterValue_MAX] :=
Calculate(MAX('vt_SelectParams_byWWTP'[CURVALUE]),
    Filter('vt_SelectParams_byWWTP',
        'vt_SelectParams_byWWTP'[S. Name 2]=SELECTEDVALUE('vt_SelectParams_byWWTP'[S. Name 2])
    )
)

[CURParameterValue_MIN] :=
Calculate(MIN('vt_SelectParams_byWWTP'[CURVALUE]),
    Filter('vt_SelectParams_byWWTP',
        'vt_SelectParams_byWWTP'[S. Name 2]=SELECTEDVALUE('vt_SelectParams_byWWTP'[S. Name 2])
    )
)
```

---

## DATATBL Calculated Columns (Verbatim DAX)

```dax
-- Source columns (from Dataflow): AUDITUSER, AUDITTIMESTAMP, DATESTAMP, CURVALUE,
--   TEXTVALUE, VARID, STATUS, FORCED

[Month] = FORMAT(MONTH(DATATBL[DATESTAMP]), "MM")

[Year] = Year(DATATBL[DATESTAMP])

[Short Name] = LOOKUPVALUE(VARDESC[S. NAME], VARDESC[VARID], DATATBL[VARID])

[WWTP] = LOOKUPVALUE(VARDESC[WWTP], VARDESC[VARID], DATATBL[VARID])

[Day] = DAY(DATATBL[DATESTAMP])

[Name] = LOOKUPVALUE(VARDESC[NAME], VARDESC[VARID], DATATBL[VARID])

[Date] = DATATBL[DATESTAMP]

[Week Number] = WEEKNUM(DATATBL[Date])

[Day of Year] =
DATEDIFF(DATE(YEAR(DATATBL[DATESTAMP].[Date]), 1, 1), DATATBL[DATESTAMP].[Date], DAY) + 1

[Year-Month] = FORMAT('DATATBL'[DATESTAMP], "YYYY MMM")

[S Name 2] = LOOKUPVALUE(VARDESC[S. Name 2], VARDESC[VARID], DATATBL[VARID])

[75%] = 0.75 * DATATBL[Color Format for Flow]

[90%] = 0.90 * DATATBL[Color Format for Flow]

[Color Format for Flow] =
CALCULATE(
    SELECTEDVALUE('Monthly Flow Permit'[LIMIT_VALUE]),
    FILTER(
        'Monthly Flow Permit',
        'Monthly Flow Permit'[WWTP] = DATATBL[WWTP]
    )
)
-- *** KEY: This is the permitted Annual Average Flow (AAF) per WWTP ***
-- *** Source: Monthly Flow Permit table, LIMIT_VALUE column ***

[Color Formatting Number] =
IF(DATATBL[CURVALUE] < 0.75 * DATATBL[Color Format for Flow], 1,
IF(DATATBL[CURVALUE] >= 0.75 * DATATBL[Color Format for Flow] && DATATBL[CURVALUE] < 0.9 * DATATBL[Color Format for Flow], 2,
IF(DATATBL[CURVALUE] >= 0.9 * DATATBL[Color Format for Flow] && DATATBL[CURVALUE] <= DATATBL[Color Format for Flow], 3,
IF(DATATBL[CURVALUE] > DATATBL[Color Format for Flow], 4
))))
-- 1=green (<75%), 2=yellow (75-90%), 3=orange (90-100%), 4=red (>100%)

[Compare] =
CALCULATE(
    FIRSTNONBLANK('Effluent Flow Limits'[COMPARE], "N/A"),
    FILTER(
        'Effluent Flow Limits',
        'Effluent Flow Limits'[VARID] = DATATBL[VARID]
        && 'Effluent Flow Limits'[All Dates] = DATATBL[DATESTAMP]
    )
)

[Limit] =
CALCULATE(
    SELECTEDVALUE('Effluent Flow Limits'[LIMIT_VALUE]),
    FILTER(
        'Effluent Flow Limits',
        'Effluent Flow Limits'[GROUPING] = "V" ||
        ('Effluent Flow Limits'[GROUPING] = "M"
            && CONTAINSSTRING('Effluent Flow Limits'[Parameter Name], "Efncy Pr Eff")
            && NOT(CONTAINSSTRING('Effluent Flow Limits'[Parameter Name], "MAvg")))
    ),
    FILTER(
        'Effluent Flow Limits',
        'Effluent Flow Limits'[VARID] = DATATBL[VARID]
        && 'Effluent Flow Limits'[All Dates] = DATATBL[DATESTAMP]
    )
)

[Violation] =
IF(DATATBL[Limit] < DATATBL[CURVALUE]
   && NOT(ISBLANK(DATATBL[Limit]))
   && DATATBL[Compare] = ">", 1, 0)

[Categories One] =
IF(CONTAINSSTRING(DATATBL[Short Name],"Plnt Ef Bod Carb 5 D"),"CBOD Daily",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef CBOD 7-Day Avg"),"CBOD Weekly",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef CBOD MAvg"),"CBOD Monthly",
IF(CONTAINSSTRING(DATATBL[Short Name],"Plnt Ef Nh3 N Ammoni"),"NH3-N Daily",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef NH3-N 7-Day Avg") && NOT(CONTAINSSTRING(DATATBL[Name],"Calc")),"NH3-N Weekly",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef NH3-N MAvg") && NOT(CONTAINSSTRING(DATATBL[Name],"Calc")),"NH3-N Monthly",
IF(CONTAINSSTRING(DATATBL[Short Name],"Plnt Ef Residue Totn"),"TSS Daily",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef TSS 7-Day Avg"),"TSS Weekly",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef TSS MAvg"),"TSS Monthly",
IF(CONTAINSSTRING(DATATBL[Name],"E.coli"),"E.Coli",
IF(CONTAINSSTRING(DATATBL[Name],"Enterococci"),"Enterococci",
IF(CONTAINSSTRING(DATATBL[Name],"Ef Cl2 Residual Prior"),"Cl2 Residual Prior",
IF(CONTAINSSTRING(DATATBL[Name],"Ef Cl2 Residual De-Chl"),"Cl2 Residual De-Chl",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef Diss Oxygen"),"Dissolved Oxygen",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef pH Field"),"pH",
IF(CONTAINSSTRING(DATATBL[Name],"Efncy Pr Eff CBOD Load") && NOT(CONTAINSSTRING(DATATBL[Name],"Efncy Pr Eff CBOD Load MAvg")),"CBOD Daily Load",
IF(CONTAINSSTRING(DATATBL[Name],"Efncy Pr Efncy Eff NH3-N Load") && NOT(CONTAINSSTRING(DATATBL[Name]," Efncy PrEff NH3-N Load MAvg")),"NH3-N Daily Load",
IF(CONTAINSSTRING(DATATBL[Name],"Efncy Pr Efncy Eff TSS Load") && NOT(CONTAINSSTRING(DATATBL[Name],"Efncy Pr Eff TSS Load MAvg")),"TSS Daily Load",
IF(CONTAINSSTRING(DATATBL[Name],"Efncy Pr Eff CBOD Load MAvg"),"CBOD Monthly Load",
IF(CONTAINSSTRING(DATATBL[Name],"Efncy Pr Eff NH3-N Load MAvg"),"NH3-N Monthly Load",
IF(CONTAINSSTRING(DATATBL[Name],"Efncy Pr Eff TSS Load MAvg"),"TSS Monthly Load",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef 2Hr Peak Flow Gpm"),"2 Hour Peak Flow",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef Flow Mgd"),"Daily Flow",
IF(CONTAINSSTRING(DATATBL[Name],"Plnt Ef FLOW Month Avg"),"Monthly Flow"
)))))))))))))))))))))))

[Category Two] =
IF(CONTAINSSTRING(DATATBL[Categories One], "Weekly"),  "Weekly",
IF(CONTAINSSTRING(DATATBL[Categories One], "Monthly"), "Monthly",
IF(NOT(ISBLANK(DATATBL[Categories One])),              "Daily")))

[Primary Parameter] =
IF(CONTAINSSTRING(DATATBL[Categories One],"CBOD") && NOT(CONTAINSSTRING(DATATBL[Categories One],"Load")),"CBOD",
IF(CONTAINSSTRING(DATATBL[Categories One],"CBOD") && CONTAINSSTRING(DATATBL[Categories One],"Load"),"CBOD Load",
IF(CONTAINSSTRING(DATATBL[Categories One],"NH3-N") && NOT(CONTAINSSTRING(DATATBL[Categories One],"Load")),"NH3-N",
IF(CONTAINSSTRING(DATATBL[Categories One],"NH3-N") && CONTAINSSTRING(DATATBL[Categories One],"Load"),"NH3-N Load",
IF(CONTAINSSTRING(DATATBL[Categories One],"TSS") && NOT(CONTAINSSTRING(DATATBL[Categories One],"Load")),"TSS",
IF(CONTAINSSTRING(DATATBL[Categories One],"TSS") && CONTAINSSTRING(DATATBL[Categories One],"Load"),"TSS Load",
IF(CONTAINSSTRING(DATATBL[Categories One],"E.Coli"),"E.Coli",
IF(CONTAINSSTRING(DATATBL[Categories One],"Dissolved Oxygen"),"Dissolved Oxygen",
IF(CONTAINSSTRING(DATATBL[Categories One],"Flow"),"Flow",
IF(CONTAINSSTRING(DATATBL[Categories One],"Cl2 Residual"),"Cl2 Residual"
))))))))))
-- *** NOTE: Flow data uses Primary Parameter = "Flow" (not "Effluent Flow") ***
-- *** Covers: Daily Flow, Monthly Flow, 2 Hour Peak Flow ***

[S Name 2 (groups)] =
SWITCH(
    TRUE,
    ISBLANK('DATATBL'[S Name 2]), "(Blank)",
    'DATATBL'[S Name 2] IN {"Plnt Ef 2Hr Peak Flow Gpm"}, "2-hour Peak Flow (gpm)",
    'DATATBL'[S Name 2] IN {"Plnt Ef 2Hr Peak Field"}, "2-hour Peak Flow (MGD)",
    'DATATBL'[S Name 2] IN {"Plnt Ef FLOW Annual Avg"}, "Annual Average Flow (MGD)",
    'DATATBL'[S Name 2] IN {"Plnt If CBOD"}, "Influent CBOD",
    'DATATBL'[S Name 2] IN {"Plnt If NH3-N"}, "Influent NH3-N",
    'DATATBL'[S Name 2] IN {"Plnt If TSS"}, "Influent TSS",
    'DATATBL'[S Name 2]
)
```

---

## Effluent Flow Limits — Power Query M (verbatim)

```powerquery
let
    Source = PowerBI.Dataflows(null),
    #"597882e1-04dd-4e9b-bf59-bceae3a2043b" = Source{[workspaceId="597882e1-04dd-4e9b-bf59-bceae3a2043b"]}[Data],
    #"44802b8e-bfe1-45d5-9acb-a23dac5ed9e6" = #"597882e1-04dd-4e9b-bf59-bceae3a2043b"{[dataflowId="44802b8e-bfe1-45d5-9acb-a23dac5ed9e6"]}[Data],
    LIMITS1 = #"44802b8e-bfe1-45d5-9acb-a23dac5ed9e6"{[entity="LIMITS"]}[Data],
    #"Merged Queries" = Table.NestedJoin(LIMITS1, {"VARID"}, VARDESC, {"VARID"}, "VARDESC", JoinKind.LeftOuter),
    #"Expanded VARDESC" = Table.ExpandTableColumn(#"Merged Queries", "VARDESC", {"WWTP", "Location ID"}, {"VARDESC.WWTP", "VARDESC.Location ID"}),
    #"Renamed Columns" = Table.RenameColumns(#"Expanded VARDESC",{{"VARDESC.WWTP", "WWTP"}}),
    #"Changed Type" = Table.TransformColumnTypes(#"Renamed Columns",{{"STARTDATE", type date}, {"ENDDATE", type date}}),
    #"Changed Type1" = Table.TransformColumnTypes(#"Changed Type",{{"STARTDATE", Int64.Type}, {"ENDDATE", Int64.Type}}),
    #"Added Custom" = Table.AddColumn(#"Changed Type1", "All Dates", each {[STARTDATE]..[ENDDATE]}),
    #"Expanded All Dates" = Table.ExpandListColumn(#"Added Custom", "All Dates"),
    #"Changed Type2" = Table.TransformColumnTypes(#"Expanded All Dates",{{"All Dates", Int64.Type}}),
    #"Changed Type3" = Table.TransformColumnTypes(#"Changed Type2",{{"All Dates", type datetime}, {"ENDDATE", type datetime}, {"STARTDATE", type datetime}}),
    #"Merged Queries1" = Table.NestedJoin(#"Changed Type3", {"VARID"}, VARDESC, {"VARID"}, "VARDESC", JoinKind.LeftOuter),
    #"Expanded VARDESC1" = Table.ExpandTableColumn(#"Merged Queries1", "VARDESC", {"NAME"}, {"VARDESC.NAME"}),
    #"Added Custom1" = Table.AddColumn(#"Expanded VARDESC1", "LIMIT_VALUE_MGD", each if Text.Contains([DESCRIPTION],"Peak Flow Gpm") then [LIMIT_VALUE] else [LIMIT_VALUE]*1440/1000),
    #"Changed Type4" = Table.TransformColumnTypes(#"Added Custom1",{{"LIMIT_VALUE_MGD", type number}}),
    #"Renamed Columns1" = Table.RenameColumns(#"Changed Type4",{{"VARDESC.NAME", "Parameter Name"}})
in
    #"Renamed Columns1"
```

---

## Monthly Flow Permit — Power Query M (verbatim)

```powerquery
-- KEY TABLE: Provides permitAAF (Annual Average Flow) per WWTP
-- Filtered to: AUDITUSER="E114077", S. NAME = "Eff Flow" or "Plnt Ef Flow Mgd",
--              NAME <> "EPAMMAX", ENDDATE > 2024-06-22
-- Special case: Northbelt LIMIT_VALUE overridden to 6 MGD

let
    Source = PowerBI.Dataflows(null),
    #"597882e1-04dd-4e9b-bf59-bceae3a2043b" = Source{[workspaceId="597882e1-04dd-4e9b-bf59-bceae3a2043b"]}[Data],
    #"44802b8e-bfe1-45d5-9acb-a23dac5ed9e6" = #"597882e1-04dd-4e9b-bf59-bceae3a2043b"{[dataflowId="44802b8e-bfe1-45d5-9acb-a23dac5ed9e6"]}[Data],
    LIMITS1 = #"44802b8e-bfe1-45d5-9acb-a23dac5ed9e6"{[entity="LIMITS"]}[Data],
    #"Merged Queries" = Table.NestedJoin(LIMITS1, {"VARID"}, VARDESC, {"VARID"}, "VARDESC", JoinKind.LeftOuter),
    #"Expanded VARDESC" = Table.ExpandTableColumn(#"Merged Queries", "VARDESC", {"WWTP"}, {"VARDESC.WWTP"}),
    #"Renamed Columns" = Table.RenameColumns(#"Expanded VARDESC",{{"VARDESC.WWTP", "WWTP"}}),
    #"Filtered Rows" = Table.SelectRows(#"Renamed Columns", each ([AUDITUSER] = "E114077")),
    #"Merged Queries1" = Table.NestedJoin(#"Filtered Rows", {"VARID"}, VARDESC, {"VARID"}, "VARDESC", JoinKind.LeftOuter),
    #"Expanded VARDESC1" = Table.ExpandTableColumn(#"Merged Queries1", "VARDESC", {"S. NAME"}, {"VARDESC.S. NAME"}),
    #"Filtered Rows1" = Table.SelectRows(#"Expanded VARDESC1", each ([VARDESC.S. NAME] = "Eff Flow" or [VARDESC.S. NAME] = "Plnt Ef Flow Mgd") and ([NAME] <> "EPAMMAX")),
    #"Filtered Rows2" = Table.SelectRows(#"Filtered Rows1", each [ENDDATE] > #datetime(2024, 6, 22, 0, 0, 0)),
    #"Sorted Rows" = Table.Sort(#"Filtered Rows2",{{"WWTP", Order.Ascending}}),
    #"Removed Duplicates" = Table.Distinct(#"Sorted Rows", {"WWTP"}),
    #"Removed Columns" = Table.RemoveColumns(#"Removed Duplicates",{"AUDITTIMESTAMP", "ID", "VARID", "NAME", "DESCRIPTION", "STARTDATE", "COMPARE", "EVENTTYPEID", "DOCID", "ENDDATE", "VARDESC.S. NAME"}),
    #"Added Conditional Column" = Table.AddColumn(#"Removed Columns", "LIMIT_VALUE_update", each if [WWTP] = "Northbelt" then 6 else [LIMIT_VALUE]),
    #"Changed Type" = Table.TransformColumnTypes(#"Added Conditional Column",{{"LIMIT_VALUE_update", type number}})
in
    #"Changed Type"
```

---

## LIMITS — Power Query M (verbatim)

```powerquery
-- Note: LIMIT_VALUE_MGD conversion: Peak Flow Gpm → same value; all others → value*1440/1000000
let
    Source = PowerBI.Dataflows(null),
    #"597882e1-04dd-4e9b-bf59-bceae3a2043b" = Source{...}[Data],
    #"44802b8e-bfe1-45d5-9acb-a23dac5ed9e6" = ...{[dataflowId="44802b8e..."]}[Data],
    LIMITS1 = ...{[entity="LIMITS"]}[Data],
    -- Joined with VARDESC to add WWTP and Location ID columns
    -- LIMIT_VALUE_MGD = if contains "Peak Flow Gpm" then LIMIT_VALUE else LIMIT_VALUE*1440/1000000
in
    #"Changed Type"
```

---

## FlowPermits_AMAX — Power Query M (verbatim)

```powerquery
-- Filtered from LIMITS where ENDDATE = 2030-12-31 and NAME = "AMAX" or "MMAX"
let
    Source = LIMITS,
    #"Filtered Rows" = Table.SelectRows(Source, each ([ENDDATE] = #datetime(2030, 12, 31, 0, 0, 0)) and ([NAME] = "AMAX" or [NAME] = "MMAX"))
in
    #"Filtered Rows"
```

---

## VARDESC — Power Query M (verbatim)

```powerquery
let
    Source = PowerBI.Dataflows(null),
    ...dataflowId="44802b8e-bfe1-45d5-9acb-a23dac5ed9e6"...
    VARDESC1 = ...{[entity="VARDESC"]}[Data],
    #"Renamed Columns" = Table.RenameColumns(VARDESC1,{{"UD3", "WWTP"}, {"SHORTNAME", "S. NAME"}}),
    -- UD3 → WWTP (WWTP name stored in UD3 field)
    -- SHORTNAME → S. NAME
    #"Inserted Text After Delimiter" = Table.AddColumn(#"Renamed Columns", "S. Name 2", each Text.AfterDelimiter([NAME], " "), type text),
    -- S. Name 2 = text after first space in NAME
    #"Merged Queries" = Table.FuzzyNestedJoin(#"Inserted Text After Delimiter", {"WWTP"}, #"WWTP ID", {"Location"}, "WWTP ID", JoinKind.LeftOuter, [IgnoreCase=true, IgnoreSpace=true, NumberOfMatches=1]),
    #"Expanded WWTP ID" = Table.ExpandTableColumn(#"Merged Queries", "WWTP ID", {"Location ID"}, {"Location ID"})
in
    #"Expanded WWTP ID"
```

---

## DATATBL — Power Query M (verbatim)

```powerquery
let
    Source = PowerBI.Dataflows(null),
    ...dataflowId="44802b8e-bfe1-45d5-9acb-a23dac5ed9e6"...
    DATATBL1 = ...{[entity="DATATBL"]}[Data]
in
    DATATBL1
```

---

## Calculated Tables (SUMMARIZECOLUMNS-based)

### vt_SelectParams_byWWTP
```dax
ADDCOLUMNS(
    SUMMARIZECOLUMNS(
    'DATATBL'[DATESTAMP], 'VARDESC'[WWTP], 'VARDESC'[S. Name 2],
    Filter('VARDESC',
        'VARDESC'[S. Name 2]="Plnt Ef Flow MGD" ||
        'VARDESC'[S. Name 2]="Plnt Ef 2Hr Peak Flow GPM" ||
        'VARDESC'[S. Name 2]="Plnt If Flow Mgd" ||
        'VARDESC'[S. Name 2]="Plnt If CBOD" ||
        'VARDESC'[S. Name 2]="Plnt If NH3-N" ||
        'VARDESC'[S. Name 2]="Plnt If TSS" ||
        'VARDESC'[S. Name 2]="Plnt Ef FLOW Annual Avg" ||
        'VARDESC'[S. Name 2]="Plnt Ef FLOW Month Avg" ||
        'VARDESC'[S. Name 2]="Plnt Rainfall" ||
        'VARDESC'[S. Name 2]="Plnt Ef pH Field" ||
        'VARDESC'[S. Name 2]="Plnt Ef Dissolved Oxygen" ||
        'VARDESC'[S. Name 2]="Plnt Ef CBOD MAvg" ||
        'VARDESC'[S. Name 2]="Plnt Ef NH3-N MAvg" ||
        'VARDESC'[S. Name 2]="Plnt Ef TSS MAvg" ||
        'VARDESC'[S. Name 2]="Plnt Ef CBOD 7-Day Avg" ||
        'VARDESC'[S. Name 2]="Plnt Ef NH3-N 7-Day Avg" ||
        'VARDESC'[S. Name 2]="Plnt Ef TSS 7-Day Avg" ||
        'VARDESC'[S. Name 2]="S Aer 01 TSS" ||
        ... (28 total S. Name 2 values)
        "CURVALUE", Average('DATATBL'[CURVALUE])
    ),
    "YEAR", YEAR('DATATBL'[DATESTAMP]),
    "Month", FORMAT(Month('DATATBL'[DATESTAMP]), "MMM")
)
```

### vt_EfFlow_byWWTP
```dax
ADDCOLUMNS(
    SUMMARIZECOLUMNS(
        'DATATBL'[DATESTAMP], 'VARDESC'[WWTP], 'VARDESC'[S. Name 2],
        Filter('VARDESC',
            'VARDESC'[S. Name 2]="Plnt Ef Flow MGD" ||
            'VARDESC'[S. Name 2]="Plnt Ef 2Hr Peak Flow GPM"),
        "EfFlow_MGD_GPM", Average('DATATBL'[CURVALUE])
    ),
   "Year-Month", FORMAT(('DATATBL'[DATESTAMP]), "YYYY MMM")
)
```

---

## Critical Semantic Notes

### Flow Data Filter
In the real PBI report, flow data is accessed via:
- `DATATBL[Primary Parameter] = "Flow"` (NOT "Effluent Flow")
- Or via S. Name 2 values: `"Plnt Ef Flow MGD"`, `"Plnt Ef FLOW Month Avg"`, `"Plnt Ef FLOW Annual Avg"`, `"Plnt Ef 2Hr Peak Flow GPM"`

### Permit AAF Lookup
`DATATBL[Color Format for Flow]` = the monthly permit limit (AAF) for that row's WWTP.
Source: `Monthly Flow Permit[LIMIT_VALUE]` filtered to matching WWTP.
Used for: 75%/90% threshold calculations, Color Formatting Number

### Violation Logic
`DATATBL[Violation] = 1` when:
- `DATATBL[Limit] < DATATBL[CURVALUE]` (value exceeds limit)
- `DATATBL[Limit]` is not blank
- `DATATBL[Compare] = ">"` (limit direction is "greater than")

### 75/90 Rule KPI
`[Rolling 3 Months Minimum max per DATESTAMP divided by Color Format for Flow]`
= Rolling 3-month minimum (max per date) ÷ Average permitted AAF
= Key compliance measure for 75th/90th percentile rule

### Data Type Codes (Column.ExplicitDataType)
- 1 = String (Text)
- 2 = String
- 6 = Integer
- 8 = Double/Decimal
- 9 = DateTime

### Column Type Codes (Column.Type)
- 1 = Source column (from Power Query)
- 2 = Calculated column (DAX expression)
- 4 = RowNumber / column from calculated table
