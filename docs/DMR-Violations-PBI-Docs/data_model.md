# Data Model — HachWIMS DMR Reports Plus Violations

Schema extracted from `layout.json` visual query metadata (DataModel is XPress9-compressed and not directly readable).
Relationships are inferred from shared column names and domain context.

```mermaid
erDiagram

    DATATBL {
        datetime DATESTAMP
        string   WWTP
        decimal  CURVALUE
        decimal  Limit
        string   "Primary Parameter"
        string   "Categories One"
        string   "Category Two"
        string   "Color Format for Flow"
        decimal  "75%"
        decimal  "90%"
        string   Violation
        date     Date
        int      Month
        int      "Week Number"
        int      "Day of Year"
    }

    VARDESC {
        int    VARID
        int    LOCID
        string WWTP
        string NAME
        string "S. NAME"
        string "S. Name 2"
        string UNITS
        string VARTYPE
        int    VARNUM
        string STORETCODE
        string UD1
        string UD2
    }

    LIMITS {
        int      ID
        int      VARID
        string   NAME
        string   DESCRIPTION
        string   STATISTIC
        decimal  LIMIT_VALUE
        decimal  LIMIT_VALUE_MGD
        string   COMPARE
        string   GROUPING
        date     STARTDATE
        date     ENDDATE
        int      EVENTTYPEID
        string   DOCID
        datetime AUDITTIMESTAMP
        string   AUDITUSER
    }

    LOCATION {
        int    LOCID
        int    PARENTID
        string LOCATION
        string DESCRIPTION
    }

    "Key Lab Data for WWTP" {
        string  WWTP
        int     Year
        int     Month
        int     Day
        decimal "Flow,MGD"
        decimal "Influent BOD"
        decimal "Influent TSS"
        decimal "Influent NH3-N"
        decimal "Effluent BOD"
        decimal "Effluent TSS"
        decimal "Effluent NH3-N"
        decimal "Aeration Basin MLSS"
        decimal "Aer MLVSS/MLSS"
        decimal "Total MLVSS"
        decimal "RAS MLSS"
        decimal "RAS MLVSS/MLSS"
        decimal SVI
        decimal "F/M"
        decimal Waste
    }

    "Effluent Flow Limits" {
        decimal LIMIT_VALUE
    }

    Refresh_DateTime {
        date     Date
        datetime DateTime2
        string   Update
    }

    vt_SelectParams_byWWTP {
        datetime DATESTAMP
        string   WWTP
        string   "S. Name 2"
        decimal  CURVALUE
    }

    vt_PlntIFParameters_byWWTP {
        datetime DATESTAMP
        string   WWTP
        string   "S. Name 2"
        decimal  CURVALUE
    }

    vt_PlntChemicals_byWWTP {
        datetime DATESTAMP
        string   "S. Name 2"
        decimal  CURVALUE
    }

    vt_PlntElectricity_byWWTP {
        datetime DATESTAMP
        string   "S. Name 2"
        decimal  CURVALUE
    }

    "WWTP O&M Performace Report" {
        string  Location
        string  Position
        string  SubPosition
        decimal "Firm capacity"
        decimal "Aeration Basin Capacity (MGD)"
        decimal "Clarifier Capacity (MGD_Hydraulic Detention time)"
        decimal "Clarifier Capacity (MGD_surface loading rate)"
        decimal "Clarifier Capacity (MGD_Weir Loading Rate)"
        decimal "CCB Capacity (MGD)"
        decimal "Bar Screen Capacity (MGD)"
        decimal "Pump Capacity (MGD)"
    }

    DATATBL                    }o--||  VARDESC               : "WWTP"
    VARDESC                    }o--||  LOCATION              : "LOCID"
    VARDESC                    ||--o{  LIMITS                : "VARID"
    DATATBL                    }o--||  "Key Lab Data for WWTP" : "WWTP"
    DATATBL                    ||--o{  vt_SelectParams_byWWTP  : "DATESTAMP"
    DATATBL                    ||--o{  vt_PlntIFParameters_byWWTP : "DATESTAMP"
    DATATBL                    ||--o{  vt_PlntChemicals_byWWTP   : "DATESTAMP"
    DATATBL                    ||--o{  vt_PlntElectricity_byWWTP  : "DATESTAMP"
```

## Table Descriptions

| Table | Role |
|---|---|
| `DATATBL` | Main fact table — daily HachWIMS readings (flow, quality parameters) per WWTP and timestamp |
| `VARDESC` | Variable/parameter descriptor — maps VARID to human-readable names, units, and WWTP |
| `LIMITS` | Permit limits per variable (VARID), with effective date ranges and limit values in native units and MGD |
| `LOCATION` | Location hierarchy — WWTP sites with parent-child relationships |
| `Key Lab Data for WWTP` | Monthly lab sample data for influent/effluent quality and biological process parameters |
| `Effluent Flow Limits` | Standalone limit reference for effluent flow visuals |
| `Refresh_DateTime` | Single-row table tracking last data refresh timestamp |
| `vt_SelectParams_byWWTP` | View — DATATBL filtered to selected operational parameters, pivoted by WWTP |
| `vt_PlntIFParameters_byWWTP` | View — influent flow parameters by WWTP |
| `vt_PlntChemicals_byWWTP` | View — chemical usage data by WWTP |
| `vt_PlntElectricity_byWWTP` | View — electricity consumption data by WWTP |
| `WWTP O&M Performace Report` | Static engineering capacity reference — design specs per unit process |

## Priority Dashboard → Table Mapping

| Dashboard | Key Tables |
|---|---|
| Permit Evaluation Summary Tables | `DATATBL`, `LIMITS`, `VARDESC` |
| At-a-Glance Citywide WWTP Capacity | `DATATBL`, `LIMITS`, `VARDESC`, `LOCATION` |
| Permit Evaluation, Annual Average Flow | `DATATBL`, `LIMITS` |
| Permit Evaluation, 75/90 Rule | `DATATBL`, `LIMITS` |
| Comparison AAF & MAF | `DATATBL`, `LIMITS` |
| Effluent Flow \| ADF and 2-hour Peak | `DATATBL`, `Effluent Flow Limits` |
| Flow Statistics | `DATATBL`, `VARDESC` |
| Permitted AAF Vs DMR | `DATATBL`, `LIMITS`, `VARDESC` |
