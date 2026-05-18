// WWiP Plant-Intelligence-System — v2 entry
// Phase 5B/5C: shell, router, Home page, generic page renderer.

import { h, render } from "preact";
import { useEffect, useState } from "preact/hooks";
import htm from "htm";

import { state, subscribe, update, setCurrentPlant } from "./state.js";
import { loadManifest, loadPage } from "./data.js";
import { PageCanvas } from "./pages/page.js";
import { PermitSummaryPage }       from "./pages/permit-summary.js";
import { HomeNavPage }              from "./pages/home-nav.js";
import { DailyEffluentFlowPage }    from "./pages/daily-effluent-flow.js";
import { GenericChartPage }         from "./pages/generic-chart-page.js";
import { EfFlowPermitEvalPage }       from "./pages/ef-flow-permit-eval.js";
import { PermitEvaluationAAFPage }    from "./pages/permit-evaluation-aaf.js";
import { PermitEvaluation7590Page }   from "./pages/permit-evaluation-7590.js";
import { EfFlowAAFMAFPage }           from "./pages/ef-flow-aaf-maf.js";
import { EfFlowADF2hrPeakPage }       from "./pages/ef-flow-adf-2hrpeak.js";
import { StatisticalFlowsPage }        from "./pages/statistical-flows.js";
import { PermittedAAFVsDMRPage }        from "./pages/permitted-aaf-vs-dmr.js";
import { PermitLimitsPage }            from "./pages/permit-limits.js";
import { Dmr5yrHistoricalMetricPage }  from "./pages/dmr-5yr-ef-flow.js";
import { PlantEffluentDailyPage }      from "./pages/plant-ef-daily.js";
import { KpiGridPage }                 from "./pages/kpi-grid-page.js";
import { MonthlyFlowTablePage }        from "./pages/monthly-flow-table.js";
import { OperationsMetricPage }        from "./pages/operations-metric-page.js";

const html = htm.bind(h);

// ── useStore — rerenders on any state.* change ─────────────────
function useStore() {
  const [, tick] = useState(0);
  useEffect(() => subscribe(() => tick(x => x + 1)), []);
  return state;
}

// ── useScaleToFit — scales a fixed canvas to the viewport ──────
function useScaleToFit(width, height) {
  const [t, setT] = useState({ scale: 1, wrapH: height });
  useEffect(() => {
    const recompute = () => {
      const availW = window.innerWidth - 40;       // leave 20px padding each side
      const availH = window.innerHeight - 60 - 40; // topbar + padding
      const scale = Math.min(availW / width, availH / height);
      setT({ scale, wrapH: height * scale, wrapW: width * scale });
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [width, height]);
  return t;
}

// ── Topbar ─────────────────────────────────────────────────────
function Topbar({ manifest, pageName, isHome }) {
  return html`
    <header class="app-topbar">
      <div>
        <p class="eyebrow">City of Houston — Public Works & Engineering</p>
        <h1>
          WWiP Plant-Intelligence-System
          ${isHome
            ? html` <span style=${{ color: "var(--accent)" }}> · Home</span>`
            : pageName
              ? html` <span style=${{ color: "var(--muted)", fontWeight: 400 }}> · ${pageName}</span>`
              : null}
        </h1>
      </div>
      <div class="topbar-right">
        <a class="home-link" href="#/home">Home</a>
        ${manifest && html`
          <span>${manifest.totals.violations.toLocaleString()} violations</span>
          <span>${manifest.totals.plants} plants</span>
          <span>Last refresh: ${manifest.last_refresh?.slice(0,10) || "—"}</span>
        `}
      </div>
    </header>
  `;
}

// ── Page viewport — scales the 1280×720 canvas to fit ──────────
function PageViewport({ page, currentPlant, currentDateRange }) {
  const { width = 1280, height = 720 } = page.canvas || {};
  const { scale, wrapH, wrapW } = useScaleToFit(width, height);
  return html`
    <div class="page-viewport">
      <div class="page-canvas-wrap" style=${{ width: `${wrapW}px`, height: `${wrapH}px` }}>
        <div style=${{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <${PageCanvas} page=${page} currentPlant=${currentPlant}
                                      currentDateRange=${currentDateRange} />
        </div>
      </div>
    </div>
  `;
}

// ── App root ───────────────────────────────────────────────────
function App() {
  const s = useStore();

  // Load the manifest once
  useEffect(() => {
    loadManifest()
      .then(m => update(st => { st.manifest = m; }))
      .catch(err => update(st => { st.currentPageError = err.message; }));
  }, []);

  // Whenever the route slug changes, load that page spec
  useEffect(() => {
    if (!s.manifest) return;
    const slug = s.route.slug || "home";
    update(st => { st.currentPageLoading = true; st.currentPageError = null; });
    loadPage(slug)
      .then(p => update(st => {
        st.currentPage = p;
        st.currentPageLoading = false;
        // If this page has a plant slicer, set the default selection
        if (p.plant_slicer?.default) {
          st.filters.currentPlant = p.plant_slicer.default;
        } else {
          st.filters.currentPlant = null;
        }
        // If this page has a date slicer, set the default window
        if (p.date_slicer?.default) {
          st.filters.currentDateRange = p.date_slicer.default;
        } else {
          st.filters.currentDateRange = null;
        }
      }))
      .catch(err => update(st => { st.currentPageError = err.message; st.currentPageLoading = false; }));
  }, [s.manifest, s.route.slug]);

  if (!s.manifest) return html`<div class="app-loading">Loading manifest…</div>`;
  if (s.currentPageError) return html`
    <div class="app-frame">
      <${Topbar} manifest=${s.manifest} pageName=${null} />
      <div class="app-error">Error: ${s.currentPageError}</div>
    </div>
  `;
  if (!s.currentPage) return html`
    <div class="app-frame">
      <${Topbar} manifest=${s.manifest} pageName=${null} />
      <div class="app-loading">Loading page…</div>
    </div>
  `;

  const slug = s.currentPage.slug;

  return html`
    <div class="app-frame">
      ${!["home","tables-permitted-capacity-evaluation-pbi","dt-daily-effluent-flow","ef-flow-permit-eval","permit-evaluation-aaf","permit-evaluation-7590","ef-flow-aaf-maf","adf-2hrpeak-to-download","statistical-flows","permitted-aaf-vs-dmr",
           "permit-limits","dt-chart-plant-if-daily","dt-chart-plant-ef-daily",
           "dt-dmr-5yr-ef-flow-mgd","dt-dmr-5yr-ef-cbod",
           "dt-dmr-5yr-ef-tss","dt-dmr-5yr-ef-nh3-n",
           "dmr-5yr-ef-cbod-loading","dmr-5yr-ef-tss-loading","dmr-5yr-ef-nh3-n-loading",
           "dmr-5yr-ef-do-loading","dmr-5yr-ecoli","dmr-5yr-ph-field",
           "if-rem-ef-cbod-tss-nh3-n","plant-efficiency-process-evaluation","multi-var-operational-parameters",
           "regulatory-parameters-1-3x3","regulatory-parameters-2-3x3","regulatory-kpi-33",
           "dmr-monthlyaaf-for-permit-evaluation","dmr-monthlyadf-for-7590-rules",
           "thck","elec",
           "s-aeration","clarifier","svi","ras-01","was-01","dig-01"].includes(slug)
        && html`<${Topbar} manifest=${s.manifest} pageName=${s.currentPage.display_name} isHome=${false} />`}
      ${slug === "home"
        ? html`<${HomeNavPage} manifest=${s.manifest} />`
        : slug === "permit-evaluation-7590"
          ? html`<${PermitEvaluation7590Page} page=${s.currentPage} manifest=${s.manifest} currentDateRange=${s.filters.currentDateRange} />`
        : slug === "permit-evaluation-aaf"
          ? html`<${PermitEvaluationAAFPage} page=${s.currentPage} manifest=${s.manifest} currentDateRange=${s.filters.currentDateRange} />`
        : slug === "permitted-aaf-vs-dmr"
          ? html`<${PermittedAAFVsDMRPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "statistical-flows"
          ? html`<${StatisticalFlowsPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "adf-2hrpeak-to-download"
          ? html`<${EfFlowADF2hrPeakPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "ef-flow-aaf-maf"
          ? html`<${EfFlowAAFMAFPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "ef-flow-permit-eval"
          ? html`<${EfFlowPermitEvalPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "dt-daily-effluent-flow"
          ? html`<${DailyEffluentFlowPage}
                    page=${s.currentPage}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "permit-limits"
          ? html`<${PermitLimitsPage}
                    page=${s.currentPage}
                    manifest=${s.manifest} />`
        : slug === "dt-chart-plant-ef-daily"
          ? html`<${PlantEffluentDailyPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["dt-dmr-5yr-ef-flow-mgd","dt-dmr-5yr-ef-cbod",
           "dt-dmr-5yr-ef-tss","dt-dmr-5yr-ef-nh3-n",
           "dmr-5yr-ef-cbod-loading","dmr-5yr-ef-tss-loading","dmr-5yr-ef-nh3-n-loading",
           "dmr-5yr-ef-do-loading","dmr-5yr-ecoli","dmr-5yr-ph-field"].includes(slug)
          ? html`<${Dmr5yrHistoricalMetricPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["if-rem-ef-cbod-tss-nh3-n","plant-efficiency-process-evaluation","multi-var-operational-parameters",
           "regulatory-parameters-1-3x3","regulatory-parameters-2-3x3","regulatory-kpi-33",
           "s-aeration","clarifier","svi","ras-01","was-01","dig-01"].includes(slug)
          ? html`<${KpiGridPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["dmr-monthlyaaf-for-permit-evaluation","dmr-monthlyadf-for-7590-rules"].includes(slug)
          ? html`<${MonthlyFlowTablePage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["thck","elec"].includes(slug)
          ? html`<${OperationsMetricPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["dt-chart-plant-if-daily","dt-chart-plant-ef-daily"].includes(slug)
          ? html`<${GenericChartPage} page=${s.currentPage} currentDateRange=${s.filters.currentDateRange} />`
        : slug === "tables-permitted-capacity-evaluation-pbi"
          ? html`<${PermitSummaryPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
          : html`<${PageViewport} page=${s.currentPage}
                         currentPlant=${s.filters.currentPlant}
                         currentDateRange=${s.filters.currentDateRange} />`
      }
    </div>
  `;
}

render(html`<${App} />`, document.getElementById("app"));
