import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import htm from "htm";

const html = htm.bind(h);

const C = {
  bg: "#071425",
  card: "#10253f",
  line: "rgba(120,170,220,.16)",
  text: "#eef4fb",
  muted: "#9db0c7",
  accent: "#27d7d7",
};

const COL = {
  plant: 0,
  name: 1,
  vartype: 2,
  locid: 3,
  varid: 4,
  limit: 5,
  limitMgd: 6,
  units: 7,
  description: 8,
  limitType: 9,
  grouping: 10,
  statistic: 11,
  enddate: 12,
};

function StatCard({ label, value }) {
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      padding: "12px 14px",
      minWidth: 140,
    }}>
      <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>${label}</div>
      <div style=${{ color: C.accent, fontSize: 22, fontWeight: 800, marginTop: 4 }}>${value}</div>
    </div>
  `;
}

function LimitTable({ rows }) {
  const headers = [
    "Name",
    "Type",
    "Location",
    "VARID",
    "Limit Value",
    "Limit Value MGD",
    "Units",
    "Description",
    "Limit Type",
    "Grouping",
    "Statistic",
    "End Date",
  ];

  return html`
    <div style=${{ overflow: "auto", flex: 1, minHeight: 0 }}>
      <table style=${{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            ${headers.map((header) => html`
              <th key=${header} style=${{
                position: "sticky",
                top: 0,
                background: "#0d2139",
                color: C.muted,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".05em",
                textTransform: "uppercase",
                padding: "8px 10px",
                textAlign: "left",
                borderBottom: `1px solid ${C.line}`,
                whiteSpace: "nowrap",
              }}>${header}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) => html`
            <tr key=${idx} style=${{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <td style=${cellStyle(220)}>${row[COL.name] || "—"}</td>
              <td style=${cellStyle(60)}>${row[COL.vartype] || "—"}</td>
              <td style=${cellStyle(80)}>${row[COL.locid] ?? "—"}</td>
              <td style=${cellStyle(90)}>${row[COL.varid] ?? "—"}</td>
              <td style=${cellStyle(90)}>${fmtNum(row[COL.limit])}</td>
              <td style=${cellStyle(110)}>${fmtNum(row[COL.limitMgd])}</td>
              <td style=${cellStyle(70)}>${row[COL.units] || "—"}</td>
              <td style=${cellStyle(220)}>${row[COL.description] || "—"}</td>
              <td style=${cellStyle(90)}>${row[COL.limitType] || "—"}</td>
              <td style=${cellStyle(70)}>${row[COL.grouping] || "—"}</td>
              <td style=${cellStyle(90)}>${row[COL.statistic] || "—"}</td>
              <td style=${cellStyle(100)}>${row[COL.enddate] || "—"}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function cellStyle(maxWidth) {
  return {
    padding: "7px 10px",
    color: C.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth,
  };
}

function fmtNum(value) {
  if (value == null || value === "") return "—";
  return typeof value === "number"
    ? value.toLocaleString(undefined, { maximumFractionDigits: 3 })
    : String(value);
}

export function PermitLimitsPage({ page, manifest }) {
  const visuals = page.visuals || [];
  const tableVis = visuals.find((v) => v.type === "tableEx");
  const plants = page.plant_slicer?.options || [];
  const allRows = tableVis?.data?.rows || [];

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [plantSearch, setPlantSearch] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [grouping, setGrouping] = useState("");
  const [vartype, setVartype] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredPlants = useMemo(
    () => plants.filter((item) => item.toLowerCase().includes(plantSearch.toLowerCase())),
    [plants, plantSearch],
  );

  const scopedRows = useMemo(
    () => allRows.filter((row) => !plant || row[COL.plant] === plant),
    [allRows, plant],
  );

  const groupingOptions = useMemo(
    () => [...new Set(scopedRows.map((row) => row[COL.grouping]).filter(Boolean))].sort(),
    [scopedRows],
  );
  const vartypeOptions = useMemo(
    () => [...new Set(scopedRows.map((row) => row[COL.vartype]).filter(Boolean))].sort(),
    [scopedRows],
  );
  const endDateOptions = useMemo(
    () => [...new Set(scopedRows.map((row) => row[COL.enddate]).filter(Boolean))].sort(),
    [scopedRows],
  );

  const visibleRows = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return scopedRows.filter((row) => {
      if (grouping && row[COL.grouping] !== grouping) return false;
      if (vartype && row[COL.vartype] !== vartype) return false;
      if (endDate && row[COL.enddate] !== endDate) return false;
      if (!q) return true;
      return String(row[COL.name] || "").toLowerCase().includes(q)
        || String(row[COL.description] || "").toLowerCase().includes(q)
        || String(row[COL.limitType] || "").toLowerCase().includes(q);
    });
  }, [scopedRows, grouping, vartype, endDate, nameQuery]);

  const distinctParams = useMemo(
    () => new Set(visibleRows.map((row) => row[COL.name]).filter(Boolean)).size,
    [visibleRows],
  );

  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height: "100vh",
      color: C.text,
      fontFamily: "Inter,system-ui,sans-serif",
      fontSize: 14,
      padding: 18,
      display: "grid",
      gap: 12,
      gridTemplateRows: "auto auto 1fr auto",
      overflow: "hidden",
    }}>
      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`,
            borderRadius: 14,
            height: 64,
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            color: C.muted,
            cursor: "pointer",
          }}>←</button>
        <div>
          <small style=${{
            display: "block",
            color: C.accent,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".04em",
            fontSize: 11,
            marginBottom: 4,
          }}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· Permit Limits</span>
          </h1>
        </div>
        <div style=${{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: 10 }}>
          <${StatCard} label="Visible rows" value=${visibleRows.length.toLocaleString()} />
          <${StatCard} label="Parameters" value=${distinctParams.toLocaleString()} />
          <${StatCard} label="Last refresh" value=${refresh} />
        </div>
      </header>

      <section style=${{
        background: `linear-gradient(180deg,${C.card},#0d2139)`,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 14,
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1.4fr) repeat(3, minmax(150px, 0.8fr))",
        gap: 10,
      }}>
        <input
          value=${nameQuery}
          onInput=${(e) => setNameQuery(e.target.value)}
          placeholder="Search parameter, description, or limit type"
          style=${inputStyle()}
        />
        <select value=${grouping} onChange=${(e) => setGrouping(e.target.value)} style=${inputStyle()}>
          <option value="">All groupings</option>
          ${groupingOptions.map((option) => html`<option key=${option} value=${option}>${option}</option>`)}
        </select>
        <select value=${vartype} onChange=${(e) => setVartype(e.target.value)} style=${inputStyle()}>
          <option value="">All types</option>
          ${vartypeOptions.map((option) => html`<option key=${option} value=${option}>${option}</option>`)}
        </select>
        <select value=${endDate} onChange=${(e) => setEndDate(e.target.value)} style=${inputStyle()}>
          <option value="">All end dates</option>
          ${endDateOptions.map((option) => html`<option key=${option} value=${option}>${option}</option>`)}
        </select>
      </section>

      <main style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, minHeight: 0 }}>
        <aside style=${{
          background: `linear-gradient(180deg,${C.card},#0d2139)`,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: 12,
          overflow: "auto",
        }}>
          <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
          <input
            value=${plantSearch}
            onInput=${(e) => setPlantSearch(e.target.value)}
            placeholder="Search WWTP"
            style=${{ ...inputStyle(), marginBottom: 8 }}
          />
          <div style=${{ display: "grid", gap: 4 }}>
            ${filteredPlants.map((item) => html`
              <label key=${item} style=${radioRowStyle(item === plant)}>
                <input
                  type="radio"
                  name="permit-limits-plant"
                  checked=${item === plant}
                  onChange=${() => setPlant(item)}
                  style=${{ accentColor: C.accent }}
                />
                ${item}
              </label>
            `)}
          </div>
        </aside>

        <section style=${{
          background: `linear-gradient(180deg,${C.card},#0d2139)`,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}>
          <div style=${{
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 8,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: ".04em",
          }}>
            ${plant || "All WWTP"} permit limits
          </div>
          <${LimitTable} rows=${visibleRows} />
        </section>
      </main>

      <footer style=${{
        display: "flex",
        justifyContent: "space-between",
        color: C.muted,
        fontSize: 11,
        paddingTop: 8,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        <span>Permit limit rows are rebuilt directly from the LIMITS and VARDESC sources.</span>
        <span>${manifest?.totals?.plants || 0} WWTPs in the current source set.</span>
      </footer>
    </div>
  `;
}

function inputStyle() {
  return {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${C.line}`,
    background: "#0a1a2e",
    color: C.text,
    fontFamily: "inherit",
    fontSize: 12,
  };
}

function radioRowStyle(active) {
  return {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "5px 6px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    background: active ? "rgba(39,215,215,0.12)" : "transparent",
    color: active ? C.accent : C.muted,
  };
}
