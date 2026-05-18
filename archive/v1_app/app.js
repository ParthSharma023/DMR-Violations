/* ============================================================
   WWiP Plant-Intelligence-System — app.js
   ============================================================ */

// ── Chart.js global defaults ──────────────────────────────────
Chart.defaults.color = '#9fb6be';
Chart.defaults.borderColor = '#2b4a54';
Chart.defaults.font.family = 'Inter, ui-sans-serif, system-ui, sans-serif';

const ACCENT   = '#3fb7cf';
const ACCENT2  = '#f2c14e';
const DANGER   = '#ee6c5d';
const SUCCESS  = '#78d39b';
const MUTED    = '#9fb6be';
const SURFACE2 = '#13272f';

const CAT_COLORS = [
  '#3fb7cf','#f2c14e','#78d39b','#ee6c5d','#a78bfa',
  '#fb923c','#34d399','#f472b6','#60a5fa','#facc15',
  '#4ade80','#f87171','#c084fc','#38bdf8','#fbbf24',
  '#86efac','#fca5a5','#a5b4fc',
];

// ── State ─────────────────────────────────────────────────────
let DATA = {
  violations: [],
  summary: {},
  permitEval: {},
  omReport: [],
  historicalDmr: [],
  meta: {},
  processData: [],
  kpiData: [],
  flowStats: [],
  annualFlow: [],
  availability: [],
};

let violFiltered = [];
let violCurrentPage = 1;
const VIOL_PAGE_SIZE = 50;

let omFiltered = [];
let omCurrentPage = 1;
const OM_PAGE_SIZE = 30;

const charts = {};

// ── Boot ──────────────────────────────────────────────────────
async function loadData() {
  const files = [
    ['violations',      'data/violations.json'],
    ['summary',         'data/violations_summary.json'],
    ['permitEval',      'data/permit_eval.json'],
    ['omReport',        'data/om_report.json'],
    ['historicalDmr',   'data/historical_dmr.json'],
    ['meta',            'data/metadata.json'],
    ['processData',     'data/process_data.json'],
    ['kpiData',         'data/kpi_data.json'],
    ['flowStats',       'data/flow_stats.json'],
    ['annualFlow',      'data/annual_flow.json'],
    ['availability',    'data/availability.json'],
  ];
  const results = await Promise.all(
    files.map(([_, url]) => fetch(url).then(r => r.json()))
  );
  files.forEach(([key, _], i) => { DATA[key] = results[i]; });
  initApp();
}

function initApp() {
  setupTabNav();
  setupSubNavs();
  populateMeta();
  initHome();
  initViolations();
  initPermit();
  initOM();
  initHistorical();
  setupDynamicPages();     // Phase 3 — generate all 30 new pages
}

// ── Tab navigation ────────────────────────────────────────────
function setupTabNav() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId, sectionId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (btn) btn.classList.add('active');
  const tab = document.getElementById(`tab-${tabId}`);
  if (tab) tab.classList.add('active');
  // Defer sub-section & chart refresh until layout has settled
  requestAnimationFrame(() => {
    if (sectionId) switchSubSection(tabId, sectionId);
    refreshChartsForTab(tabId);
  });
}

// Re-render charts that were created while their tab was display:none
// (Chart.js can't measure hidden canvases, so they come out 0×0)
function refreshChartsForTab(tabId) {
  switch (tabId) {
    case 'violations': applyViolFilters();    break;
    case 'permit':     initPermit();          break;
    case 'om':         applyOmFilters();      break;
    case 'historical': renderAllHistCharts(); break;
    case 'process':
    case 'kpis':
    case 'plants':
    case 'explorer':
      refreshDynamicPages(tabId);
      break;
  }
}

// ── Sub-section navigation ────────────────────────────────────
function setupSubNavs() {
  document.querySelectorAll('.sub-nav').forEach(nav => {
    nav.querySelectorAll('.sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId  = nav.id.replace('-subnav', '');
        switchSubSection(tabId, btn.dataset.section);
      });
    });
  });
}

function switchSubSection(tabId, sectionId) {
  const nav = document.getElementById(`${tabId}-subnav`);
  if (!nav) return;
  nav.querySelectorAll('.sub-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.section === sectionId);
  });
  const tab = document.getElementById(`tab-${tabId}`);
  if (!tab) return;
  tab.querySelectorAll('.sub-section').forEach(s => {
    s.style.display = s.id === sectionId ? '' : 'none';
  });
}

// ── Metadata header ───────────────────────────────────────────
function populateMeta() {
  const m = DATA.meta;
  const refresh = m.last_refresh ? m.last_refresh.split(' ')[0] : '—';
  setText('meta-refresh', `Last Refreshed: ${refresh}`);
  setText('meta-plants', `${m.wwtps?.length ?? '—'} Plants`);
  setText('meta-violations', `${DATA.violations.length.toLocaleString()} Violations`);
}

// ═══════════════════════════════════════════════════════════════
// HOME — PowerBI-style navigation grid
// ═══════════════════════════════════════════════════════════════
function initHome() {
  setText('home-refresh-stamp', DATA.meta.last_refresh || '—');

  document.querySelectorAll('.home-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (!target || target === '_coming') {
        showToast(`"${btn.textContent.trim()}" — pending Phase 2 data audit`);
        return;
      }
      const [tab, section] = target.split(':');
      switchTab(tab, section);
    });
  });
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════════════════════════
// VIOLATIONS
// ═══════════════════════════════════════════════════════════════
function initViolations() {
  // Populate filter dropdowns
  const wwtpSel = document.getElementById('viol-filter-wwtp');
  const catSel  = document.getElementById('viol-filter-cat');
  (DATA.meta.wwtps ?? []).forEach(w => addOption(wwtpSel, w, w));
  (DATA.meta.categories ?? []).forEach(c => addOption(catSel, c, c));

  wwtpSel.addEventListener('change', applyViolFilters);
  catSel.addEventListener('change', applyViolFilters);
  document.getElementById('viol-filter-year-from').addEventListener('input', applyViolFilters);
  document.getElementById('viol-filter-year-to').addEventListener('input', applyViolFilters);

  applyViolFilters();
}

function getViolFilters() {
  const sel = v => Array.from(document.getElementById(v).selectedOptions)
    .map(o => o.value).filter(Boolean);
  return {
    wwtps:    sel('viol-filter-wwtp'),
    cats:     sel('viol-filter-cat'),
    yearFrom: parseInt(document.getElementById('viol-filter-year-from').value) || 0,
    yearTo:   parseInt(document.getElementById('viol-filter-year-to').value)   || 9999,
  };
}

function applyViolFilters() {
  const { wwtps, cats, yearFrom, yearTo } = getViolFilters();
  violFiltered = DATA.violations.filter(v => {
    if (wwtps.length && !wwtps.includes(v.WWTP)) return false;
    if (cats.length  && !cats.includes(v.cat1))  return false;
    if (v.year && v.year < yearFrom) return false;
    if (v.year && v.year > yearTo)   return false;
    return true;
  });
  violCurrentPage = 1;
  renderViolOverview();
  renderViolByPlant();
  renderViolTrend();
  renderViolTable();
}

function resetViolFilters() {
  document.getElementById('viol-filter-wwtp').selectedIndex = -1;
  document.getElementById('viol-filter-cat').selectedIndex  = -1;
  document.getElementById('viol-filter-year-from').value = '';
  document.getElementById('viol-filter-year-to').value   = '';
  applyViolFilters();
}

function renderViolOverview() {
  const vf = violFiltered;
  const total  = vf.length;
  const plants = new Set(vf.map(v => v.WWTP)).size;

  // peak year
  const byYear = groupCount(vf, v => v.year);
  const peakYear = Object.entries(byYear).sort((a,b)=>b[1]-a[1])[0];

  // top cat
  const byCat = groupCount(vf.filter(v=>v.cat1 && v.cat1 !== 'None'), v => v.cat1);
  const topCat = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];

  setText('viol-kpi-total', total.toLocaleString());
  setText('viol-kpi-plants', plants);
  setText('viol-kpi-peak-year',  peakYear?.[0] ?? '—');
  setText('viol-kpi-peak-count', peakYear ? `${peakYear[1].toLocaleString()} violations` : '—');
  setText('viol-kpi-top-cat',    topCat?.[0] ?? '—');
  setText('viol-kpi-top-cat-pct', topCat ? `${pct(topCat[1], total)}% of violations` : '—');
  setText('viol-cat-stat',  `${Object.keys(byCat).length} types`);

  // Category donut
  const catEntries = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  destroyChart('viol-cat-chart');
  charts['viol-cat-chart'] = new Chart(document.getElementById('viol-cat-chart'), {
    type: 'doughnut',
    data: {
      labels: catEntries.map(([k])=>k),
      datasets: [{ data: catEntries.map(([,v])=>v), backgroundColor: CAT_COLORS, borderWidth: 1, borderColor: '#0d1d23' }],
    },
    options: {
      plugins: { legend: { position: 'right', labels: { font:{size:11}, boxWidth:12, padding:10 } } },
      cutout: '60%',
    },
  });

  // Frequency (Daily/Monthly/Weekly) bar
  const byFreq = groupCount(vf.filter(v=>v.cat2 && v.cat2!=='None'), v => v.cat2);
  buildBarChart('viol-freq-chart', {
    labels: Object.keys(byFreq),
    datasets: [{ label: 'Violations', data: Object.values(byFreq), backgroundColor: [ACCENT+'cc', ACCENT2+'cc', SUCCESS+'cc', MUTED+'88'], borderRadius: 4 }],
  }, { plugins: { legend: { display: false } } });
}

function renderViolByPlant() {
  const byPlant = groupCount(violFiltered.filter(v=>v.WWTP && !v.WWTP.startsWith('SUM')), v => v.WWTP);
  const sorted  = Object.entries(byPlant).sort((a,b)=>b[1]-a[1]);
  setText('viol-plant-stat', `${sorted.length} plants`);

  buildBarChart('viol-plant-chart', {
    labels: sorted.map(([k])=>k),
    datasets: [{ label: 'Violations', data: sorted.map(([,v])=>v), backgroundColor: ACCENT + 'bb', borderRadius: 3 }],
  }, {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: {}, y: { ticks: { font: { size: 10 } } } },
  });

  // Heatmap
  renderHeatmap();
}

function renderHeatmap() {
  const plants = [...new Set(violFiltered.filter(v=>v.WWTP && !v.WWTP.startsWith('SUM')).map(v=>v.WWTP))].sort();
  const cats   = [...new Set(violFiltered.filter(v=>v.cat1 && v.cat1!=='None').map(v=>v.cat1))].sort();
  const counts = {};
  violFiltered.forEach(v => {
    if (!v.WWTP || v.WWTP.startsWith('SUM') || !v.cat1 || v.cat1==='None') return;
    const key = `${v.WWTP}||${v.cat1}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  const maxVal = Math.max(1, ...Object.values(counts));

  const el = document.getElementById('viol-heatmap');
  if (!plants.length || !cats.length) { el.innerHTML = '<p style="color:var(--muted);padding:16px;">No data</p>'; return; }

  let html = '<table class="heatmap-table"><thead><tr><th class="row-header">Plant</th>';
  cats.forEach(c => { html += `<th title="${c}">${abbrev(c,8)}</th>`; });
  html += '</tr></thead><tbody>';

  plants.forEach(plant => {
    html += `<tr><th class="row-header" title="${plant}">${abbrev(plant,14)}</th>`;
    cats.forEach(cat => {
      const v = counts[`${plant}||${cat}`] || 0;
      const intensity = v / maxVal;
      const bg = interpolateColor('#0d1d23', '#ee6c5d', intensity);
      const fg = intensity > 0.5 ? '#fff' : intensity > 0 ? DANGER : 'transparent';
      html += `<td style="background:${bg};color:${fg};" title="${plant} — ${cat}: ${v}">${v || ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderViolTrend() {
  const byYear = groupCount(violFiltered.filter(v=>v.year), v => v.year);
  const years  = Object.keys(byYear).map(Number).sort();
  destroyChart('viol-trend-chart');
  charts['viol-trend-chart'] = new Chart(document.getElementById('viol-trend-chart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Violations',
        data: years.map(y => byYear[y]),
        borderColor: ACCENT,
        backgroundColor: ACCENT + '22',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderViolTable() {
  const rows = violFiltered;
  const start = (violCurrentPage - 1) * VIOL_PAGE_SIZE;
  const page  = rows.slice(start, start + VIOL_PAGE_SIZE);
  const tbody = document.getElementById('viol-records-tbody');
  setText('viol-table-count', `${rows.length.toLocaleString()} records`);
  setText('viol-page-info', `Page ${violCurrentPage} of ${Math.max(1, Math.ceil(rows.length/VIOL_PAGE_SIZE))}`);

  tbody.innerHTML = page.map(v => `
    <tr>
      <td>${v.date ?? '—'}</td>
      <td>${v.WWTP ?? '—'}</td>
      <td>${v.param_short ?? v.param_name ?? '—'}</td>
      <td>${v.cat1 ?? '—'}</td>
      <td style="color:var(--danger)">${v.value != null ? fmtNum(v.value) : '—'}</td>
      <td>${v.limit_val != null ? fmtNum(v.limit_val) : '—'}</td>
      <td>${v.compare ?? '—'}</td>
    </tr>`).join('');
}

function violPage(dir) {
  const max = Math.ceil(violFiltered.length / VIOL_PAGE_SIZE);
  violCurrentPage = Math.max(1, Math.min(max, violCurrentPage + dir));
  renderViolTable();
}

// ═══════════════════════════════════════════════════════════════
// PERMIT EVALUATION
// ═══════════════════════════════════════════════════════════════
function initPermit() {
  const pe = DATA.permitEval;
  renderPermitSummary(pe);
  renderPermitNPDES(pe);
  renderPermit7590(pe);
  renderPermitMonthly(pe);
}

function renderPermitSummary(pe) {
  const tbody1 = document.getElementById('permit-npdes-inline-tbody');
  tbody1.innerHTML = (pe.npdes ?? [])
    .slice().sort((a,b)=>a.WWTP.localeCompare(b.WWTP))
    .map(r => `<tr><td>${r.WWTP}</td><td>${fmtNum(r.permit_limit_mgd)}</td></tr>`).join('');

  const tbody2 = document.getElementById('permit-aaf-inline-tbody');
  tbody2.innerHTML = (pe.aaf ?? [])
    .slice().sort((a,b)=>a.WWTP.localeCompare(b.WWTP))
    .map(r => `<tr><td>${r.WWTP}</td><td>${fmtNum(r.evaluated_flow)}</td><td>${complianceBadge(r.pct_75)}</td></tr>`).join('');

  const tbody3 = document.getElementById('permit-75-inline-tbody');
  tbody3.innerHTML = (pe.aaf ?? [])
    .filter(r => r.permit_mgd != null && r.permit_mgd <= 1)
    .slice().sort((a,b)=>a.WWTP.localeCompare(b.WWTP))
    .map(r => `<tr><td>${r.WWTP}</td><td>${fmtNum(r.evaluated_flow)}</td><td>${complianceBadge(r.pct_75)}</td></tr>`).join('');
}

function renderPermitNPDES(pe) {
  const sorted = (pe.npdes ?? []).slice().sort((a,b)=>(b.permit_limit_mgd??0)-(a.permit_limit_mgd??0));
  const tbody = document.getElementById('permit-npdes-tbody');
  tbody.innerHTML = sorted.map(r => `
    <tr>
      <td>${r.WWTP}</td>
      <td>${fmtNum(r.permit_limit_mgd)}</td>
      <td>${r.permit_limit_mgd ? fmtNum(r.permit_limit_mgd * 0.75) : '—'}</td>
      <td>${r.permit_limit_mgd ? fmtNum(r.permit_limit_mgd * 0.90) : '—'}</td>
    </tr>`).join('');

  buildBarChart('permit-limits-chart', {
    labels: sorted.map(r=>r.WWTP),
    datasets: [{
      label: 'Permit Limit (MGD)',
      data: sorted.map(r=>r.permit_limit_mgd),
      backgroundColor: ACCENT + 'aa',
      borderRadius: 3,
    }],
  }, {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { font: { size: 10 } } } },
  });
}

function renderPermit7590(pe) {
  const sorted = (pe.aaf ?? [])
    .filter(r => r.pct_75 != null)
    .slice().sort((a,b)=>(b.pct_75??0)-(a.pct_75??0));

  const tbody = document.getElementById('permit-7590-tbody');
  tbody.innerHTML = sorted.map(r => {
    const badge = complianceBadge(r.pct_75);
    const status = (r.pct_75 ?? 0) >= 90 ? 'At Capacity' : (r.pct_75 ?? 0) >= 75 ? 'Near Limit' : 'Compliant';
    return `
      <tr>
        <td>${r.WWTP}</td>
        <td>${fmtNum(r.permit_mgd)}</td>
        <td>${fmtNum(r.evaluated_flow)}</td>
        <td>${badge}</td>
        <td>${badge.replace(/>.*?</, `>${status}<`)}</td>
      </tr>`;
  }).join('');

  const colors = sorted.map(r =>
    (r.pct_75??0) >= 90 ? DANGER+'cc' : (r.pct_75??0) >= 75 ? ACCENT2+'cc' : SUCCESS+'cc'
  );

  buildBarChart('permit-7590-chart', {
    labels: sorted.map(r=>r.WWTP),
    datasets: [
      { label: '% of Permit Used', data: sorted.map(r=>r.pct_75), backgroundColor: colors, borderRadius: 3 },
      { label: '75% Threshold', data: sorted.map(()=>75), type: 'line', borderColor: ACCENT2, borderDash:[5,5], borderWidth:1.5, pointRadius:0, fill:false },
      { label: '90% Threshold', data: sorted.map(()=>90), type: 'line', borderColor: DANGER,  borderDash:[5,5], borderWidth:1.5, pointRadius:0, fill:false },
    ],
  }, {
    indexAxis: 'y',
    plugins: { legend: { position: 'top', labels: { font:{size:11} } } },
    scales: { x: { max: 105, ticks: { callback: v => v+'%' } }, y: { ticks: { font: { size: 10 } } } },
  });
}

function renderPermitMonthly(pe) {
  const sorted = (pe.monthly ?? []).sort((a,b)=>(b.limit_mgd??0)-(a.limit_mgd??0));
  buildBarChart('permit-monthly-chart', {
    labels: sorted.map(r=>r.WWTP),
    datasets: [
      { label: 'Monthly Permit (MGD)', data: sorted.map(r=>r.limit_mgd), backgroundColor: ACCENT+'99', borderRadius: 3 },
      { label: 'Updated Limit', data: sorted.map(r=>r.limit_updated), backgroundColor: ACCENT2+'88', borderRadius: 3 },
    ],
  }, {
    indexAxis: 'y',
    plugins: { legend: { position:'top', labels:{font:{size:11}} } },
    scales: { y: { ticks: { font: { size: 10 } } } },
  });
}

// ═══════════════════════════════════════════════════════════════
// O&M REPORT
// ═══════════════════════════════════════════════════════════════
function initOM() {
  omFiltered = DATA.omReport;

  const plants  = [...new Set(DATA.omReport.map(r=>r.Location).filter(Boolean))].sort();
  const systems = [...new Set(DATA.omReport.map(r=>r.System).filter(Boolean))].sort();

  const pSel = document.getElementById('om-filter-plant');
  const sSel = document.getElementById('om-filter-system');
  plants.forEach(p  => addOption(pSel, p, p));
  systems.forEach(s => addOption(sSel, s, s));

  pSel.addEventListener('change', applyOmFilters);
  sSel.addEventListener('change', applyOmFilters);

  applyOmFilters();
}

function applyOmFilters() {
  const selPlants  = selValues('om-filter-plant');
  const selSystems = selValues('om-filter-system');
  omFiltered = DATA.omReport.filter(r => {
    if (selPlants.length  && !selPlants.includes(r.Location)) return false;
    if (selSystems.length && !selSystems.includes(r.System))  return false;
    return true;
  });
  omCurrentPage = 1;
  renderOMCapacity();
  renderOMAeration();
  renderOMClarifier();
  renderOMPumps();
}

function resetOmFilters() {
  document.getElementById('om-filter-plant').selectedIndex  = -1;
  document.getElementById('om-filter-system').selectedIndex = -1;
  applyOmFilters();
}

function renderOMCapacity() {
  const plants = [...new Set(omFiltered.map(r=>r.Location).filter(Boolean))].sort();
  setText('om-kpi-plants',   plants.length);
  setText('om-kpi-items',    omFiltered.length.toLocaleString());
  setText('om-kpi-aeration', omFiltered.filter(r=>r.aeration_mgd).length.toLocaleString());
  setText('om-kpi-pumps',    omFiltered.filter(r=>r.pump_mgd).length.toLocaleString());
  setText('om-table-count',  `${omFiltered.length} records`);

  // Aeration capacity by plant
  const aerByPlant = {};
  omFiltered.forEach(r => {
    if (r.Location && r.aeration_mgd) {
      const v = parseFloat(r.aeration_mgd);
      if (!isNaN(v)) aerByPlant[r.Location] = (aerByPlant[r.Location]||0) + v;
    }
  });
  const sorted = Object.entries(aerByPlant).sort((a,b)=>b[1]-a[1]);

  buildBarChart('om-capacity-chart', {
    labels: sorted.map(([k])=>k),
    datasets: [{ label: 'Aeration Basin Cap (MGD)', data: sorted.map(([,v])=>v), backgroundColor: ACCENT+'aa', borderRadius: 3 }],
  }, {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { font: { size: 10 } } } },
  });

  // Main table
  renderOMTable();
}

function renderOMTable() {
  const rows  = omFiltered;
  const start = (omCurrentPage - 1) * OM_PAGE_SIZE;
  const page  = rows.slice(start, start + OM_PAGE_SIZE);
  const tbody = document.getElementById('om-main-tbody');
  setText('om-page-info', `Page ${omCurrentPage} of ${Math.max(1, Math.ceil(rows.length/OM_PAGE_SIZE))}`);
  tbody.innerHTML = page.map(r => `
    <tr>
      <td>${r.Location??'—'}</td>
      <td>${r.System??'—'}</td>
      <td>${r.Position??'—'}</td>
      <td>${r.pump_mgd??'—'}</td>
      <td>${r.aeration_mgd??'—'}</td>
      <td>${r.clarifier_cap_sl??'—'}</td>
      <td>${r.Nitrification==='TRUE'||r.Nitrification==='1'?'<span class="badge badge-green">Yes</span>':'<span class="badge badge-gray">No</span>'}</td>
    </tr>`).join('');
}

function omPage(dir) {
  const max = Math.ceil(omFiltered.length / OM_PAGE_SIZE);
  omCurrentPage = Math.max(1, Math.min(max, omCurrentPage + dir));
  renderOMTable();
}

function renderOMAeration() {
  const rows = omFiltered.filter(r=>r.aeration_mgd);
  const tbody = document.getElementById('om-aeration-tbody');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.Location??'—'}</td><td>${r.Position??'—'}</td>
      <td>${r.aeration_mgd??'—'}</td><td>${r.o2_req??'—'}</td>
      <td>${r.air_flow??'—'}</td><td>${r.wote??'—'}</td>
    </tr>`).join('');
}

function renderOMClarifier() {
  const rows = omFiltered.filter(r=>r.clarifier_cap_sl || r.clarifier_cap_hd);
  const tbody = document.getElementById('om-clarifier-tbody');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.Location??'—'}</td><td>${r.Position??'—'}</td>
      <td>${r.clarifier_cap_sl??'—'}</td><td>${r.clarifier_cap_hd??'—'}</td>
      <td>${r.firm_cap??'—'}</td>
    </tr>`).join('');
}

function renderOMPumps() {
  const rows = omFiltered.filter(r=>r.pump_gpm || r.pump_mgd);
  const tbody = document.getElementById('om-pumps-tbody');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.Location??'—'}</td><td>${r.System??'—'}</td>
      <td>${r.Position??'—'}</td><td>${r.pump_gpm??'—'}</td><td>${r.pump_mgd??'—'}</td>
    </tr>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// HISTORICAL DMR
// ═══════════════════════════════════════════════════════════════
const HIST_PARAM_MAP = {
  'hist-flow':  ['2 Hour Peak Flow', 'Monthly Flow'],
  'hist-cbod':  ['CBOD Monthly','CBOD Daily'],
  'hist-tss':   ['TSS Monthly','TSS Daily'],
  'hist-nh3':   ['NH3-N Monthly','NH3-N Daily'],
  'hist-ecoli': ['E.Coli'],
};

const HIST_CHART_IDS = {
  'hist-flow': 'hist-flow-chart',
  'hist-cbod': 'hist-cbod-chart',
  'hist-tss':  'hist-tss-chart',
  'hist-nh3':  'hist-nh3-chart',
  'hist-ecoli':'hist-ecoli-chart',
};

function initHistorical() {
  const wwtps = [...new Set(DATA.historicalDmr.map(r=>r.WWTP).filter(Boolean))].sort();
  const sel   = document.getElementById('hist-filter-wwtp');
  wwtps.forEach(w => addOption(sel, w, w));

  sel.addEventListener('change', renderAllHistCharts);
  document.getElementById('hist-year-from').addEventListener('input', renderAllHistCharts);
  document.getElementById('hist-year-to').addEventListener('input',   renderAllHistCharts);

  if (wwtps.length) {
    sel.value = wwtps[0];
    renderAllHistCharts();
  }
}

function resetHistFilters() {
  document.getElementById('hist-year-from').value = '2015';
  document.getElementById('hist-year-to').value   = '2025';
  renderAllHistCharts();
}

function renderAllHistCharts() {
  Object.keys(HIST_PARAM_MAP).forEach(sid => renderHistChart(sid));
}

function renderHistChart(sectionId) {
  const wwtp    = document.getElementById('hist-filter-wwtp').value;
  const yearFrom = parseInt(document.getElementById('hist-year-from').value) || 2015;
  const yearTo   = parseInt(document.getElementById('hist-year-to').value)   || 2025;
  const cats     = HIST_PARAM_MAP[sectionId];
  const chartId  = HIST_CHART_IDS[sectionId];

  const rows = DATA.historicalDmr.filter(r =>
    r.WWTP === wwtp &&
    cats.includes(r.cat1) &&
    r.year >= yearFrom && r.year <= yearTo
  );

  if (!rows.length) {
    destroyChart(chartId);
    const el = document.getElementById(chartId);
    if (el) { const ctx = el.getContext('2d'); ctx.clearRect(0,0,el.width,el.height); }
    return;
  }

  // Group by param and build time series
  const byParam = {};
  rows.forEach(r => {
    const key = r.param || r.cat1;
    if (!byParam[key]) byParam[key] = {};
    const label = `${r.year}-${String(r.month).padStart(2,'0')}`;
    byParam[key][label] = r.avg_val;
  });

  const labels = [...new Set(rows.map(r=>`${r.year}-${String(r.month).padStart(2,'0')}`))].sort();

  // Limit line (max limit across rows)
  const limitVals = rows.map(r=>r.limit_val).filter(v=>v!=null&&v>0);
  const limitVal  = limitVals.length ? Math.max(...limitVals) : null;

  const datasets = Object.entries(byParam).map(([param, vals], i) => ({
    label: param,
    data:  labels.map(l => vals[l] ?? null),
    borderColor: CAT_COLORS[i % CAT_COLORS.length],
    backgroundColor: 'transparent',
    tension: 0.3,
    pointRadius: 2,
    spanGaps: true,
  }));

  if (limitVal) {
    datasets.push({
      label: 'Permit Limit',
      data: labels.map(()=>limitVal),
      borderColor: DANGER,
      borderDash: [6,4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    });
  }

  destroyChart(chartId);
  charts[chartId] = new Chart(document.getElementById(chartId), {
    type: 'line',
    data: { labels, datasets },
    options: {
      plugins: { legend: { position: 'top', labels: { font:{size:11}, boxWidth:14 } } },
      scales: {
        x: { ticks: { maxTicksLimit: 24, font:{size:10} } },
        y: { beginAtZero: false },
      },
    },
  });

  if (sectionId === 'hist-flow') {
    setText('hist-flow-stat', `${rows.length} monthly data points`);
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function buildBarChart(id, data, extraOpts = {}) {
  destroyChart(id);
  const el = document.getElementById(id);
  if (!el) return;
  charts[id] = new Chart(el, {
    type: 'bar',
    data,
    options: deepMerge({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, labels: { font:{size:11} } } },
      scales: { x: { grid:{color:'#2b4a5466'} }, y: { grid:{color:'#2b4a5466'}, beginAtZero:true } },
    }, extraOpts),
  });
}

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function complianceBadge(pctVal) {
  if (pctVal == null) return '<span class="badge badge-gray">—</span>';
  const p = parseFloat(pctVal);
  const display = fmtNum(p) + '%';
  if (p >= 90) return `<span class="badge badge-red">${display}</span>`;
  if (p >= 75) return `<span class="badge badge-yellow">${display}</span>`;
  return `<span class="badge badge-green">${display}</span>`;
}

function groupCount(arr, keyFn) {
  const out = {};
  arr.forEach(item => {
    const k = keyFn(item);
    if (k != null) out[k] = (out[k]||0) + 1;
  });
  return out;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function addOption(sel, value, text) {
  const o = document.createElement('option');
  o.value = value; o.textContent = text;
  sel.appendChild(o);
}

function selValues(id) {
  return Array.from(document.getElementById(id).selectedOptions).map(o=>o.value).filter(Boolean);
}

function fmtNum(v) {
  if (v == null || v === '' || isNaN(v)) return '—';
  const n = parseFloat(v);
  return n % 1 === 0 ? n.toLocaleString() : n.toLocaleString(undefined, {maximumFractionDigits:2});
}

function pct(part, total) {
  return total ? Math.round(part/total*100) : 0;
}

function abbrev(str, len) {
  return str && str.length > len ? str.slice(0, len-1) + '…' : str;
}

function interpolateColor(hex1, hex2, t) {
  const r1=parseInt(hex1.slice(1,3),16), g1=parseInt(hex1.slice(3,5),16), b1=parseInt(hex1.slice(5,7),16);
  const r2=parseInt(hex2.slice(1,3),16), g2=parseInt(hex2.slice(3,5),16), b2=parseInt(hex2.slice(5,7),16);
  const r=Math.round(r1+(r2-r1)*t), g=Math.round(g1+(g2-g1)*t), b=Math.round(b1+(b2-b1)*t);
  return `rgb(${r},${g},${b})`;
}

function deepMerge(target, source) {
  const out = Object.assign({}, target);
  Object.keys(source).forEach(k => {
    if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
      out[k] = deepMerge(target[k] || {}, source[k]);
    } else {
      out[k] = source[k];
    }
  });
  return out;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 3 — DYNAMIC PAGES (templates + config-driven)
// ═══════════════════════════════════════════════════════════════

/* PAGES registry: each page has an id, a tab, a label, a template fn,
   and a config object used by the template. The registry drives:
   - sub-nav button generation
   - sub-section DOM generation
   - Home-button navigation resolution */
const PAGES = [

  // ── HISTORICAL DMR (new pages) ─────────────────────────────────
  { id: 'hist-do',        tab: 'historical', label: 'DMR Diss Oxygen (Historical)',  tpl: 'timeSeries',
    cfg: { source: 'historicalDmr', filter: r => r.cat1 === 'Dissolved Oxygen', yLabel: 'mg/L', title: 'DMR Dissolved Oxygen' } },
  { id: 'hist-cl2',       tab: 'historical', label: 'DMR CL2 Residual (Historical)', tpl: 'timeSeries',
    cfg: { source: 'historicalDmr', filter: r => r.cat1 === 'Cl2 Residual Prior' || r.cat1 === 'Cl2 Residual De-Chl', yLabel: 'mg/L', title: 'DMR Chlorine Residual' } },
  { id: 'hist-ph',        tab: 'historical', label: 'DMR PH Field (Historical)',     tpl: 'timeSeries',
    cfg: { source: 'historicalDmr', filter: r => r.cat1 === 'pH', yLabel: 'pH', title: 'DMR pH Field' } },
  { id: 'hist-cbod-load', tab: 'historical', label: 'DMR Ef CBOD Loading (Historical)', tpl: 'timeSeries',
    cfg: { source: 'historicalDmr', filter: r => r.cat1 === 'CBOD Daily Load' || r.cat1 === 'CBOD Monthly Load', yLabel: 'lb/day', title: 'DMR CBOD Loading' } },
  { id: 'hist-tss-load',  tab: 'historical', label: 'DMR Ef TSS Loading (Historical)',  tpl: 'timeSeries',
    cfg: { source: 'historicalDmr', filter: r => r.cat1 === 'TSS Monthly Load', yLabel: 'lb/day', title: 'DMR TSS Loading' } },
  { id: 'hist-nh3-load',  tab: 'historical', label: 'DMR Ef NH3-N Loading (Historical)', tpl: 'timeSeries',
    cfg: { source: 'historicalDmr', filter: r => r.cat1 === 'NH3-N Monthly Load', yLabel: 'lb/day', title: 'DMR NH3-N Loading' } },

  // ── PERMIT EVALUATION (new pages) ─────────────────────────────
  { id: 'permit-at-a-glance', tab: 'permit', label: 'At-a-Glance Citywide WWTP Capacity', tpl: 'capacityMatrix',
    cfg: { title: 'At-a-Glance Citywide WWTP Capacity Status' } },
  { id: 'permit-comparison',  tab: 'permit', label: 'Comparison of AAF & MAF', tpl: 'aafMafCompare',
    cfg: { title: 'Permit Evaluation — AAF vs MAF Comparison' } },
  { id: 'permit-vs-dmr',      tab: 'permit', label: 'Permitted AAF Vs DMR', tpl: 'permitVsDmr',
    cfg: { title: 'Permitted AAF vs DMR (Actual)' } },
  { id: 'permit-flow-stats',  tab: 'permit', label: 'Flow Statistics', tpl: 'flowStatsTable',
    cfg: { title: 'Flow Statistics — 5-Year Summary' } },
  { id: 'permit-benchmarking',tab: 'permit', label: 'Benchmarking Plants', tpl: 'benchmarkTable',
    cfg: { title: 'Benchmarking Plants' } },

  // ── PROCESS CONTROL ───────────────────────────────────────────
  { id: 'proc-s-aeration', tab: 'process', label: 'S. Aeration (TSS, VSS, Setblty 30 min %)', tpl: 'timeSeries',
    cfg: { source: 'processData', filter: r => r.param && (r.param.startsWith('S Aer') && (r.param.includes('Sett Solids') || r.param.includes('Solids Load') || r.param.includes('Waste SS'))), yLabel: 'mg/L or %', title: 'Secondary Aeration — Settle Solids, VSS, TSS' } },
  { id: 'proc-clarifier',  tab: 'process', label: 'Clarifier (Blanket Depth & Wasting)',       tpl: 'timeSeries',
    cfg: { source: 'processData', filter: r => r.param && (r.param.startsWith('S Clr') && (r.param.includes('Depth') || r.param.includes('Wasting'))), yLabel: 'ft / hr', title: 'Clarifier — Blanket Depth & Wasting' } },
  { id: 'proc-svi',        tab: 'process', label: 'SVI (Sludge Volume Index)',                 tpl: 'timeSeries',
    cfg: { source: 'processData', filter: r => r.param && r.param.includes('SVI'), yLabel: 'mL/g', title: 'SVI — Sludge Volume Index' } },
  { id: 'proc-ras',        tab: 'process', label: 'RAS 01 (TSS, VSS, Setblty)',                tpl: 'timeSeries',
    cfg: { source: 'processData', filter: r => r.param && r.param.startsWith('RAS 01'), yLabel: 'mg/L or %', title: 'RAS 01 — Return Activated Sludge' } },
  { id: 'proc-was',        tab: 'process', label: 'WAS 01 (TSS, VSS)',                         tpl: 'timeSeries',
    cfg: { source: 'processData', filter: r => r.param && r.param.startsWith('WAS 01'), yLabel: 'mg/L or %', title: 'WAS 01 — Waste Activated Sludge' } },
  { id: 'proc-digestor',   tab: 'process', label: 'Digestor 01 (TSS, VSS)',                    tpl: 'timeSeries',
    cfg: { source: 'processData', filter: r => r.param && (r.param.startsWith('Dig 01') || r.param === 'Dig %TS'), yLabel: 'mg/L or %', title: 'Digestor 01' } },

  // ── KPIs & UTILITIES ──────────────────────────────────────────
  { id: 'kpi-influent-daily',  tab: 'kpis', label: '(Charts) Influent Daily',          tpl: 'timeSeries',
    cfg: { source: 'kpiData', filter: r => r.param && r.param.startsWith('Plnt If'), yLabel: 'varies', title: 'Influent — Daily Charts' } },
  { id: 'kpi-eff-charts',      tab: 'kpis', label: 'Eff Charts w/ Limits',             tpl: 'timeSeries',
    cfg: { source: 'kpiData', filter: r => r.param && r.param.startsWith('Plnt Ef'), yLabel: 'varies', title: 'Effluent Charts with Limits' } },
  { id: 'kpi-effluent-flow',   tab: 'kpis', label: 'Effluent Flow | ADF & 2-hour Peak', tpl: 'timeSeries',
    cfg: { source: 'historicalDmr', filter: r => r.cat1 === '2 Hour Peak Flow' || r.cat1 === 'Monthly Flow' || r.cat1 === 'Daily Flow', yLabel: 'MGD', title: 'Effluent Flow — ADF & 2-hour Peak' } },
  { id: 'kpi-operational',     tab: 'kpis', label: 'Operational KPI',                  tpl: 'kpiSummary',
    cfg: { source: 'kpiData', title: 'Operational KPI — Plant-level metrics' } },
  { id: 'kpi-influent-eff',    tab: 'kpis', label: 'Influent, % Rem & Effluent KPI',   tpl: 'timeSeries',
    cfg: { source: 'kpiData', filter: r => r.param && r.param.startsWith('Efncy Pr % Rem'), yLabel: '% Removal', title: 'Treatment Efficiency — % Removal by Plant' } },
  { id: 'kpi-process-eff',     tab: 'kpis', label: 'Plant Process Efficiency KPI',     tpl: 'timeSeries',
    cfg: { source: 'kpiData', filter: r => r.param && r.param.startsWith('Efncy Pr Loading'), yLabel: 'lb/day', title: 'Plant Process Efficiency — Loading' } },
  { id: 'kpi-electricity',     tab: 'kpis', label: 'Electricity Used',                 tpl: 'timeSeries',
    cfg: { source: 'processData', filter: r => r.param && (r.param.startsWith('Elec') || r.param.startsWith('KWH')), yLabel: 'kWh', title: 'Electricity Usage' } },
  { id: 'kpi-chemical',        tab: 'kpis', label: 'Chemical Used (Polymer)',          tpl: 'timeSeries',
    cfg: { source: 'processData', filter: r => r.param && r.param.startsWith('Polymer'), yLabel: 'gal/day or %', title: 'Chemical (Polymer) Usage' } },
  { id: 'kpi-annual-flow',     tab: 'kpis', label: 'Annual Average Flow Table',        tpl: 'annualFlowTable',
    cfg: { title: '(Table) Annual Average Flow' } },
  { id: 'kpi-monthly-flow',    tab: 'kpis', label: 'Monthly Average Flow Table',       tpl: 'monthlyFlowTable',
    cfg: { title: '(Table) Monthly Average Flow' } },

  // ── PLANT REPORTS (Daily Report pivot, mirrors PowerBI layout) ────
  { id: 'plant-scott',         tab: 'plants', label: 'Scott WWF',            tpl: 'dailyReport',
    cfg: { prefix: 'SC', plant: 'Scott WWF', title: 'Scott WWF — Daily Report (Effluent)' } },
  { id: 'plant-northside',     tab: 'plants', label: 'Northside WWF',        tpl: 'dailyReport',
    cfg: { prefix: 'NS', plant: 'Northside WWF', title: 'Northside WWF — Daily Report (Effluent)' } },
  { id: 'plant-69-sb',         tab: 'plants', label: '69 & SB incld. WWF',   tpl: 'dailyReport',
    cfg: { prefix: '69', plant: '69th Street', title: '69th Street & Sims Bayou — Daily Report', secondaryPrefix: 'SB' } },
  { id: 'plant-daily-inf-eff', tab: 'plants', label: 'Daily INF/EFF Report (Scott L)', tpl: 'dailyReport',
    cfg: { prefix: 'SC', plant: 'Scott WWF', title: 'Daily INF/EFF Report — Scott' } },
  { id: 'plant-daily-aeration',tab: 'plants', label: 'Daily AERATION Report (Scott L)', tpl: 'dailyReport',
    cfg: { prefix: 'SC', plant: 'Scott WWF', title: 'Daily AERATION Report — Scott' } },

  // ── DATA TOOLS / EXPLORER ─────────────────────────────────────
  { id: 'explorer-avail',     tab: 'explorer', label: 'Explore Data Availability in HachWIMS', tpl: 'dataExplorer',
    cfg: { title: 'Data Availability in HachWIMS' } },
];

function setupDynamicPages() {
  // Group pages by tab
  const pagesByTab = {};
  PAGES.forEach(p => {
    if (!pagesByTab[p.tab]) pagesByTab[p.tab] = [];
    pagesByTab[p.tab].push(p);
  });

  // For each tab with dynamic pages, build sub-nav and sub-sections
  Object.entries(pagesByTab).forEach(([tabId, pages]) => {
    const tab = document.getElementById(`tab-${tabId}`);
    if (!tab) return;

    const isDynamicOnly = ['process','kpis','plants','explorer'].includes(tabId);
    const subNav  = document.getElementById(`${tabId}-subnav`);
    const container = isDynamicOnly
      ? document.getElementById(`${tabId}-pages`)
      : document.getElementById(`${tabId}-dynamic`);

    if (!container) return;

    pages.forEach((page, idx) => {
      // Add sub-nav button (if nav exists)
      if (subNav) {
        const btn = document.createElement('button');
        btn.className = 'sub-btn' + (isDynamicOnly && idx === 0 ? ' active' : '');
        btn.dataset.section = page.id;
        btn.textContent = page.label;
        btn.addEventListener('click', () => switchSubSection(tabId, page.id));
        subNav.appendChild(btn);
      }

      // Add sub-section container
      const section = document.createElement('div');
      section.id = page.id;
      section.className = 'sub-section';
      section.style.display = (isDynamicOnly && idx === 0) ? '' : 'none';
      section.dataset.rendered = 'no';  // lazy render
      section.dataset.template = page.tpl;
      section.dataset.pageId = page.id;
      container.appendChild(section);
    });
  });
}

function refreshDynamicPages(tabId) {
  const tab = document.getElementById(`tab-${tabId}`);
  if (!tab) return;
  // Find visible sub-sections in this tab
  tab.querySelectorAll('.sub-section').forEach(sec => {
    if (sec.style.display === 'none' || sec.offsetParent === null) return;
    renderPage(sec.dataset.pageId);
  });
}

function renderPage(pageId) {
  const page = PAGES.find(p => p.id === pageId);
  if (!page) return;
  const section = document.getElementById(pageId);
  if (!section) return;
  const tpl = TEMPLATES[page.tpl];
  if (!tpl) {
    section.innerHTML = `<div class="panel panel-wide"><p style="color:var(--muted);padding:20px;">Template "${page.tpl}" not implemented yet</p></div>`;
    return;
  }
  tpl(section, page.cfg, page);
}

// Patch switchSubSection to auto-render dynamic pages
const _origSwitchSubSection = switchSubSection;
switchSubSection = function(tabId, sectionId) {
  _origSwitchSubSection(tabId, sectionId);
  // If the target section is dynamic, render it
  const section = document.getElementById(sectionId);
  if (section && section.classList.contains('sub-section') && section.dataset.template) {
    requestAnimationFrame(() => renderPage(sectionId));
  }
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════

const TEMPLATES = {};

// ── Template: timeSeries ──────────────────────────────────────
// Line chart per parameter, filtered by WWTP, with optional limit line
TEMPLATES.timeSeries = function(section, cfg, page) {
  const data = DATA[cfg.source] || [];
  const wwtps = [...new Set(data.filter(cfg.filter).map(r => r.WWTP).filter(Boolean))].sort();

  if (section.dataset.rendered !== 'yes') {
    section.innerHTML = `
      <div class="filters-panel" style="grid-template-columns:2fr 1fr 1fr auto;">
        <div class="filter-field">
          <label>Plant</label>
          <select class="ts-wwtp" style="min-height:42px;"></select>
        </div>
        <div class="filter-field">
          <label>Year From</label>
          <input type="number" class="ts-from" value="2018" min="2015" max="2025" />
        </div>
        <div class="filter-field">
          <label>Year To</label>
          <input type="number" class="ts-to" value="2025" min="2015" max="2025" />
        </div>
        <div class="filter-field" style="align-self:end;">
          <button class="reset-button ts-reset">Reset</button>
        </div>
      </div>
      <div class="panel panel-wide">
        <div class="panel-header">
          <div><h2>${cfg.title}</h2><p>Monthly average ${cfg.yLabel ? `(${cfg.yLabel})` : ''}</p></div>
          <span class="panel-stat ts-stat">—</span>
        </div>
        <div class="chart-box chart-box-large"><canvas class="ts-chart"></canvas></div>
      </div>
      <div class="panel panel-wide" style="margin-top:14px;">
        <div class="panel-header"><div><h2>Parameters In This View</h2><p>Short-name readings aggregated monthly</p></div></div>
        <div style="overflow-x:auto;">
          <table class="data-table compact">
            <thead><tr><th>Parameter</th><th>Months w/ data</th><th>Range</th></tr></thead>
            <tbody class="ts-param-tbody"></tbody>
          </table>
        </div>
      </div>`;

    const sel = section.querySelector('.ts-wwtp');
    wwtps.forEach(w => {
      const o = document.createElement('option'); o.value = w; o.textContent = w;
      sel.appendChild(o);
    });
    if (wwtps.length) sel.value = wwtps[0];

    const rerender = () => renderTimeSeriesChart(section, cfg);
    sel.addEventListener('change', rerender);
    section.querySelector('.ts-from').addEventListener('input', rerender);
    section.querySelector('.ts-to').addEventListener('input',   rerender);
    section.querySelector('.ts-reset').addEventListener('click', () => {
      section.querySelector('.ts-from').value = '2018';
      section.querySelector('.ts-to').value = '2025';
      if (wwtps.length) sel.value = wwtps[0];
      rerender();
    });

    section.dataset.rendered = 'yes';
  }

  renderTimeSeriesChart(section, cfg);
};

function renderTimeSeriesChart(section, cfg) {
  const data = DATA[cfg.source] || [];
  const wwtp = section.querySelector('.ts-wwtp').value;
  const from = parseInt(section.querySelector('.ts-from').value) || 2015;
  const to   = parseInt(section.querySelector('.ts-to').value)   || 2025;

  const rows = data.filter(r =>
    cfg.filter(r) && r.WWTP === wwtp && r.year >= from && r.year <= to
  );

  const canvas = section.querySelector('.ts-chart');
  const chartId = section.dataset.pageId + '__chart';
  destroyChart(chartId);

  section.querySelector('.ts-stat').textContent = `${rows.length} data points`;

  if (!rows.length) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    section.querySelector('.ts-param-tbody').innerHTML = '<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:18px;">No data for this plant / date range</td></tr>';
    return;
  }

  // Group by parameter
  const byParam = {};
  rows.forEach(r => {
    const key = r.param || r.cat1 || 'value';
    if (!byParam[key]) byParam[key] = {};
    const label = `${r.year}-${String(r.month).padStart(2,'0')}`;
    byParam[key][label] = r.avg_val;
  });

  const labels = [...new Set(rows.map(r => `${r.year}-${String(r.month).padStart(2,'0')}`))].sort();

  // Limit line
  const limitVals = rows.map(r => r.limit_val).filter(v => v != null && v > 0);
  const limitVal = limitVals.length ? Math.max(...limitVals) : null;

  const datasets = Object.entries(byParam).map(([param, vals], i) => ({
    label: param,
    data:  labels.map(l => vals[l] ?? null),
    borderColor: CAT_COLORS[i % CAT_COLORS.length],
    backgroundColor: 'transparent',
    tension: 0.3,
    pointRadius: 2,
    spanGaps: true,
  }));

  if (limitVal) {
    datasets.push({
      label: 'Permit Limit',
      data: labels.map(() => limitVal),
      borderColor: DANGER,
      borderDash: [6, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    });
  }

  charts[chartId] = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { font: {size:11}, boxWidth: 14 } } },
      scales: {
        x: { ticks: { maxTicksLimit: 24, font: {size:10} } },
        y: { beginAtZero: false },
      },
    },
  });

  // Parameter summary table
  const tbody = section.querySelector('.ts-param-tbody');
  tbody.innerHTML = Object.entries(byParam).map(([param, vals]) => {
    const nums = Object.values(vals).filter(v => v != null);
    const mn = nums.length ? Math.min(...nums) : null;
    const mx = nums.length ? Math.max(...nums) : null;
    return `<tr><td>${param}</td><td>${Object.keys(vals).length}</td><td>${fmtNum(mn)} – ${fmtNum(mx)}</td></tr>`;
  }).join('');
}

// ── Template: capacityMatrix (At-a-Glance) ───────────────────
TEMPLATES.capacityMatrix = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  const aaf = DATA.permitEval.aaf || [];

  const rows = aaf
    .filter(r => r.pct_75 != null)
    .slice()
    .sort((a, b) => (b.pct_75 ?? 0) - (a.pct_75 ?? 0));

  const tableRows = rows.map(r => {
    const pct = r.pct_75 ?? 0;
    const status = pct >= 90 ? 'At Capacity' : pct >= 75 ? 'Near Limit' : 'Compliant';
    return `<tr>
      <td>${r.WWTP}</td>
      <td>${fmtNum(r.permit_mgd)}</td>
      <td>${fmtNum(r.evaluated_flow)}</td>
      <td>${complianceBadge(pct)}</td>
      <td>${status}</td>
    </tr>`;
  }).join('');

  const atCap = rows.filter(r => (r.pct_75 ?? 0) >= 90).length;
  const near  = rows.filter(r => (r.pct_75 ?? 0) >= 75 && (r.pct_75 ?? 0) < 90).length;
  const ok    = rows.filter(r => (r.pct_75 ?? 0) < 75).length;

  section.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card"><span class="kpi-label">Plants Evaluated</span><strong>${rows.length}</strong></div>
      <div class="kpi-card"><span class="kpi-label">At Capacity (≥90%)</span><strong style="color:var(--danger)">${atCap}</strong></div>
      <div class="kpi-card"><span class="kpi-label">Near Limit (75-90%)</span><strong style="color:var(--accent-2)">${near}</strong></div>
      <div class="kpi-card"><span class="kpi-label">Compliant (&lt;75%)</span><strong style="color:var(--success)">${ok}</strong></div>
    </div>
    <div class="panel panel-wide">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Citywide wastewater treatment capacity at a glance</p></div></div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>WWTP</th><th>Permit (MGD)</th><th>Actual AAF (MGD)</th><th>% of Permit</th><th>Status</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>`;
  section.dataset.rendered = 'yes';
};

// ── Template: aafMafCompare ──────────────────────────────────
TEMPLATES.aafMafCompare = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  const aaf = DATA.permitEval.aaf || [];
  const monthly = DATA.permitEval.monthly || [];
  const monthlyMap = Object.fromEntries(monthly.map(m => [m.WWTP, m]));

  const joined = aaf.map(a => ({
    WWTP: a.WWTP,
    permit_mgd: a.permit_mgd,
    aaf: a.evaluated_flow,
    aaf_pct: a.pct_75,
    maf: monthlyMap[a.WWTP]?.limit_mgd,
  })).filter(r => r.aaf != null || r.maf != null);

  joined.sort((a, b) => a.WWTP.localeCompare(b.WWTP));

  section.innerHTML = `
    <div class="panel panel-wide">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Annual Average Flow vs Monthly Average Flow permit limits</p></div></div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>WWTP</th><th>Permit (MGD)</th><th>AAF (MGD)</th><th>% of AAF Permit</th><th>MAF (MGD)</th></tr></thead>
          <tbody>${joined.map(r => `
            <tr>
              <td>${r.WWTP}</td>
              <td>${fmtNum(r.permit_mgd)}</td>
              <td>${fmtNum(r.aaf)}</td>
              <td>${r.aaf_pct != null ? complianceBadge(r.aaf_pct) : '—'}</td>
              <td>${fmtNum(r.maf)}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  section.dataset.rendered = 'yes';
};

// ── Template: permitVsDmr ────────────────────────────────────
TEMPLATES.permitVsDmr = function(section, cfg) {
  const aaf = DATA.permitEval.aaf || [];
  const flowStats = DATA.flowStats || [];
  const statsMap = Object.fromEntries(flowStats.map(s => [s.WWTP, s]));

  const joined = aaf.map(a => ({
    WWTP: a.WWTP,
    permit: a.permit_mgd,
    dmr_reported: a.evaluated_flow,
    actual_avg: statsMap[a.WWTP]?.avg_daily_mgd,
    actual_max: statsMap[a.WWTP]?.max_daily_mgd,
  })).filter(r => r.dmr_reported != null);

  joined.sort((a, b) => a.WWTP.localeCompare(b.WWTP));

  if (section.dataset.rendered !== 'yes') {
    section.innerHTML = `
      <div class="panel panel-wide">
        <div class="panel-header"><div><h2>${cfg.title}</h2><p>Bar comparison: Permit vs DMR-reported vs recent actual average</p></div></div>
        <div class="chart-box chart-box-large"><canvas class="pvd-chart"></canvas></div>
      </div>
      <div class="panel panel-wide" style="margin-top:14px;">
        <div style="overflow-x:auto;">
          <table class="data-table compact">
            <thead><tr><th>WWTP</th><th>Permit (MGD)</th><th>DMR Reported</th><th>Actual Avg (5y)</th><th>Actual Max</th></tr></thead>
            <tbody>${joined.map(r => `<tr><td>${r.WWTP}</td><td>${fmtNum(r.permit)}</td><td>${fmtNum(r.dmr_reported)}</td><td>${fmtNum(r.actual_avg)}</td><td>${fmtNum(r.actual_max)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
    section.dataset.rendered = 'yes';
  }
  const chartId = section.dataset.pageId + '__chart';
  destroyChart(chartId);
  charts[chartId] = new Chart(section.querySelector('.pvd-chart'), {
    type: 'bar',
    data: {
      labels: joined.map(r => r.WWTP),
      datasets: [
        { label: 'Permit (MGD)',    data: joined.map(r => r.permit),       backgroundColor: ACCENT + 'aa' },
        { label: 'DMR Reported',    data: joined.map(r => r.dmr_reported), backgroundColor: ACCENT2 + 'aa' },
        { label: 'Actual Avg (5y)', data: joined.map(r => r.actual_avg),   backgroundColor: SUCCESS + 'aa' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { position: 'top' } },
      scales: { y: { ticks: { font: { size: 10 } } } },
    },
  });
};

// ── Template: flowStatsTable ─────────────────────────────────
TEMPLATES.flowStatsTable = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  const rows = (DATA.flowStats || []).slice().sort((a, b) => (b.avg_daily_mgd ?? 0) - (a.avg_daily_mgd ?? 0));
  section.innerHTML = `
    <div class="panel panel-wide">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Daily Flow statistics — 2020 to latest (${rows.length} plants)</p></div></div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>WWTP</th><th>Avg (MGD)</th><th>Max (MGD)</th><th>Std Dev</th><th>Readings</th><th>First</th><th>Last</th></tr></thead>
          <tbody>${rows.map(r => `<tr>
            <td>${r.WWTP}</td><td>${fmtNum(r.avg_daily_mgd)}</td>
            <td>${fmtNum(r.max_daily_mgd)}</td><td>${fmtNum(r.stddev_mgd)}</td>
            <td>${(r.reading_count ?? 0).toLocaleString()}</td>
            <td>${r.first_date ?? '—'}</td><td>${r.last_date ?? '—'}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  section.dataset.rendered = 'yes';
};

// ── Template: benchmarkTable ─────────────────────────────────
TEMPLATES.benchmarkTable = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  // Combine permit eval + violations + flow stats
  const aaf = Object.fromEntries((DATA.permitEval.aaf || []).map(r => [r.WWTP, r]));
  const stats = Object.fromEntries((DATA.flowStats || []).map(r => [r.WWTP, r]));
  const viols = Object.fromEntries((DATA.summary.by_wwtp || []).map(r => [r.WWTP, r.count]));

  const plants = [...new Set([...Object.keys(aaf), ...Object.keys(stats), ...Object.keys(viols)])].sort();

  const rows = plants.map(w => ({
    WWTP: w,
    permit_mgd:  aaf[w]?.permit_mgd,
    actual_avg:  stats[w]?.avg_daily_mgd,
    pct_used:    aaf[w]?.pct_75,
    violations:  viols[w] ?? 0,
  }));

  section.innerHTML = `
    <div class="panel panel-wide">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Side-by-side comparison: permit, utilization, and violation count</p></div></div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>WWTP</th><th>Permit (MGD)</th><th>Actual Avg</th><th>% Utilized</th><th>Total Violations</th></tr></thead>
          <tbody>${rows.map(r => `<tr>
            <td>${r.WWTP}</td>
            <td>${fmtNum(r.permit_mgd)}</td>
            <td>${fmtNum(r.actual_avg)}</td>
            <td>${r.pct_used != null ? complianceBadge(r.pct_used) : '—'}</td>
            <td>${r.violations > 0 ? `<span style="color:var(--danger)">${r.violations.toLocaleString()}</span>` : '0'}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  section.dataset.rendered = 'yes';
};

// ── Template: annualFlowTable ────────────────────────────────
TEMPLATES.annualFlowTable = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  const rows = DATA.annualFlow || [];
  const plants = [...new Set(rows.map(r => r.WWTP))].sort();
  const years  = [...new Set(rows.map(r => r.year))].sort();
  const matrix = {};
  rows.forEach(r => { matrix[`${r.WWTP}__${r.year}`] = r.avg_flow_mgd; });

  section.innerHTML = `
    <div class="panel panel-wide">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Annual average daily flow (MGD) per plant</p></div></div>
      <div style="overflow-x:auto;">
        <table class="data-table compact">
          <thead><tr><th>WWTP</th>${years.map(y => `<th>${y}</th>`).join('')}</tr></thead>
          <tbody>${plants.map(p => `<tr>
            <td>${p}</td>
            ${years.map(y => `<td>${fmtNum(matrix[`${p}__${y}`])}</td>`).join('')}
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  section.dataset.rendered = 'yes';
};

// ── Template: monthlyFlowTable ───────────────────────────────
TEMPLATES.monthlyFlowTable = function(section, cfg) {
  const hist = DATA.historicalDmr || [];
  // Filter to Monthly Flow category, build plant × year-month matrix
  const flowRows = hist.filter(r => r.cat1 === 'Monthly Flow' || r.cat1 === 'Daily Flow');
  const plants = [...new Set(flowRows.map(r => r.WWTP))].sort();

  if (section.dataset.rendered !== 'yes') {
    section.innerHTML = `
      <div class="filters-panel" style="grid-template-columns:1fr auto;">
        <div class="filter-field">
          <label>Year</label>
          <select class="mf-year"></select>
        </div>
      </div>
      <div class="panel panel-wide">
        <div class="panel-header"><div><h2>${cfg.title}</h2><p>Monthly average daily flow for selected year</p></div></div>
        <div class="mf-table-container" style="overflow-x:auto;"></div>
      </div>`;
    const years = [...new Set(flowRows.map(r => r.year))].sort((a, b) => b - a);
    const sel = section.querySelector('.mf-year');
    years.forEach(y => {
      const o = document.createElement('option'); o.value = y; o.textContent = y;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => renderMonthlyFlowMatrix(section, flowRows, plants));
    section.dataset.rendered = 'yes';
  }
  renderMonthlyFlowMatrix(section, flowRows, plants);
};

function renderMonthlyFlowMatrix(section, rows, plants) {
  const year = parseInt(section.querySelector('.mf-year').value);
  const matrix = {};
  rows.forEach(r => { if (r.year === year) matrix[`${r.WWTP}__${r.month}`] = r.avg_val; });
  const months = [1,2,3,4,5,6,7,8,9,10,11,12];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  section.querySelector('.mf-table-container').innerHTML = `
    <table class="data-table compact">
      <thead><tr><th>WWTP</th>${monthNames.map(m => `<th>${m}</th>`).join('')}</tr></thead>
      <tbody>${plants.map(p => `<tr>
        <td>${p}</td>
        ${months.map(m => `<td>${fmtNum(matrix[`${p}__${m}`])}</td>`).join('')}
      </tr>`).join('')}</tbody>
    </table>`;
}

// ── Template: kpiSummary (operational KPI dashboard) ─────────
TEMPLATES.kpiSummary = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  const data = DATA.kpiData || [];
  const byPlant = {};
  data.forEach(r => {
    if (!r.WWTP) return;
    if (!byPlant[r.WWTP]) byPlant[r.WWTP] = { plant: r.WWTP, readings: 0, params: new Set() };
    byPlant[r.WWTP].readings += r.readings || 0;
    if (r.param) byPlant[r.WWTP].params.add(r.param);
  });
  const rows = Object.values(byPlant)
    .map(p => ({ plant: p.plant, readings: p.readings, paramCount: p.params.size }))
    .sort((a, b) => b.readings - a.readings);

  section.innerHTML = `
    <div class="panel panel-wide">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Aggregate operational data by plant</p></div></div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>WWTP</th><th>Monthly Aggregates</th><th>Unique Parameters Tracked</th></tr></thead>
          <tbody>${rows.map(r => `<tr><td>${r.plant}</td><td>${r.readings.toLocaleString()}</td><td>${r.paramCount}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  section.dataset.rendered = 'yes';
};

// ── Template: plantDetail ────────────────────────────────────
TEMPLATES.plantDetail = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  const plant = cfg.plant;

  // Gather all data for this plant across sources
  const viols     = DATA.violations.filter(v => v.WWTP === plant).length;
  const histRows  = (DATA.historicalDmr || []).filter(r => r.WWTP === plant);
  const procRows  = (DATA.processData   || []).filter(r => r.WWTP === plant);
  const kpiRows   = (DATA.kpiData       || []).filter(r => r.WWTP === plant);
  const permit    = (DATA.permitEval.aaf || []).find(r => r.WWTP === plant);
  const flowStat  = (DATA.flowStats     || []).find(r => r.WWTP === plant);

  // Short-name inventory
  const shortNames = [...new Set([...procRows.map(r=>r.param), ...kpiRows.map(r=>r.param)].filter(Boolean))].sort();

  section.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card"><span class="kpi-label">Plant</span><strong style="font-size:1.5rem">${plant}</strong></div>
      <div class="kpi-card"><span class="kpi-label">Violations</span><strong style="color:${viols?'var(--danger)':'var(--success)'}">${viols.toLocaleString()}</strong></div>
      <div class="kpi-card"><span class="kpi-label">Permit (MGD)</span><strong>${fmtNum(permit?.permit_mgd)}</strong><span class="kpi-note">AAF evaluated: ${fmtNum(permit?.evaluated_flow)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Avg Flow (5y)</span><strong>${fmtNum(flowStat?.avg_daily_mgd)} MGD</strong><span class="kpi-note">Max: ${fmtNum(flowStat?.max_daily_mgd)}</span></div>
    </div>
    <div class="panel panel-wide">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Data records: ${histRows.length} DMR / ${procRows.length} process / ${kpiRows.length} KPI</p></div></div>
      ${histRows.length === 0 && procRows.length === 0 ? `
        <p style="padding:18px;color:var(--muted);text-align:center;">
          Limited data available for ${plant} (${viols} violations on record${viols ? ' — see Violations tab' : ''}).<br>
          This plant may be a smaller or decommissioned facility.
        </p>` : `
        <div style="padding:12px;">
          <h3 style="margin:8px 0;font-size:1rem;color:var(--muted);">Parameters Tracked (${shortNames.length})</h3>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
            ${shortNames.slice(0, 60).map(s => `<span class="badge badge-gray">${s}</span>`).join('')}
            ${shortNames.length > 60 ? `<span class="badge badge-gray">+${shortNames.length-60} more</span>` : ''}
          </div>
        </div>
      `}
    </div>`;
  section.dataset.rendered = 'yes';
};

// ── Template: multiPlantDetail ───────────────────────────────
TEMPLATES.multiPlantDetail = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  const plants = cfg.plants || [];

  const cards = plants.map(p => {
    const viols = DATA.violations.filter(v => v.WWTP === p).length;
    const permit = (DATA.permitEval.aaf || []).find(r => r.WWTP === p);
    const stats  = (DATA.flowStats     || []).find(r => r.WWTP === p);
    return `
      <div class="panel" style="padding:16px;">
        <div class="panel-header"><h2>${p}</h2></div>
        <div class="kpi-grid" style="grid-template-columns:1fr 1fr;">
          <div class="kpi-card"><span class="kpi-label">Violations</span><strong style="color:${viols?'var(--danger)':'var(--success)'}">${viols}</strong></div>
          <div class="kpi-card"><span class="kpi-label">Permit</span><strong>${fmtNum(permit?.permit_mgd)} MGD</strong></div>
          <div class="kpi-card"><span class="kpi-label">Actual Avg</span><strong>${fmtNum(stats?.avg_daily_mgd)} MGD</strong></div>
          <div class="kpi-card"><span class="kpi-label">% Permit Used</span><strong>${permit?.pct_75 != null ? complianceBadge(permit.pct_75) : '—'}</strong></div>
        </div>
      </div>`;
  }).join('');

  section.innerHTML = `
    <div class="panel panel-wide" style="margin-bottom:14px;">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Combined view for ${plants.length} plants</p></div></div>
    </div>
    <div class="dashboard-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));">${cards}</div>`;
  section.dataset.rendered = 'yes';
};

// ── Template: dailyReport (mirrors PowerBI "Daily Report — Effluent") ──
// Lazy-loads data/daily_reports/{prefix}.json, pivots dates × parameters.
TEMPLATES.dailyReport = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;

  section.innerHTML = `
    <div class="dr-shell">
      <div class="dr-header">
        <button class="dr-home-btn" title="Back to Home">←</button>

        <div class="dr-field">
          <label>WWTP</label>
          <div class="dr-readonly">${cfg.plant}<span class="dr-caret">▾</span></div>
        </div>

        <div class="dr-field">
          <label>NAME</label>
          <button class="dr-param-btn" type="button">
            <span class="dr-param-btn-text">All parameters</span>
            <span class="dr-caret">▾</span>
          </button>
          <div class="dr-param-popover" hidden>
            <div class="dr-param-scroll"></div>
            <div class="dr-param-actions">
              <button class="dr-param-clear" type="button">Clear</button>
              <button class="dr-param-close" type="button">Done</button>
            </div>
          </div>
        </div>

        <div class="dr-title">
          <h1>Daily Report <span>Effluent</span></h1>
          <small class="dr-subtitle">Loading…</small>
        </div>

        <div class="dr-field">
          <label>DATESTAMP</label>
          <select class="dr-last-n">
            <option value="30">Last 30 days</option>
            <option value="90" selected>Last 90 days</option>
            <option value="365">Last 1 year</option>
            <option value="1825">Last 5 years</option>
            <option value="0">All time</option>
          </select>
        </div>
      </div>

      <div class="panel panel-wide" style="overflow:hidden;margin-top:10px;">
        <div class="dr-table-wrapper" style="overflow:auto;max-height:600px;">
          <table class="dr-table data-table compact"></table>
        </div>
      </div>

      <div class="panel panel-wide" style="margin-top:14px;">
        <div class="panel-header"><div><h2>WWF Discharge (MGD) Trends</h2><p>Daily effluent flow by year (max / avg)</p></div></div>
        <div class="chart-box chart-box-large"><canvas class="dr-chart"></canvas></div>
      </div>
    </div>`;

  const paramBtn     = section.querySelector('.dr-param-btn');
  const paramPopover = section.querySelector('.dr-param-popover');
  const paramScroll  = section.querySelector('.dr-param-scroll');
  const paramText    = section.querySelector('.dr-param-btn-text');

  section.querySelector('.dr-home-btn').addEventListener('click', () => switchTab('home'));
  section.querySelector('.dr-last-n').addEventListener('change', () => renderDailyReport(section));

  paramBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    paramPopover.hidden = !paramPopover.hidden;
  });
  paramPopover.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => { paramPopover.hidden = true; });

  section.querySelector('.dr-param-clear').addEventListener('click', () => {
    paramScroll.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
    updateParamBtnLabel(section);
    renderDailyReport(section);
  });
  section.querySelector('.dr-param-close').addEventListener('click', () => {
    paramPopover.hidden = true;
  });

  // Fetch the plant's data file
  fetch(`data/daily_reports/${cfg.prefix}.json`)
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`${cfg.prefix}.json not found`)))
    .then(data => {
      section._dailyReport = { cfg, data };

      // Populate popover checkboxes
      paramScroll.innerHTML = data.columns.map(c => `
        <label class="dr-param-row">
          <input type="checkbox" value="${c.label}" />
          <span>${c.label}</span>
          <small>${c.unit || ''}</small>
        </label>`).join('');
      paramScroll.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', () => {
          updateParamBtnLabel(section);
          renderDailyReport(section);
        });
      });

      section.querySelector('.dr-subtitle').textContent =
        `${data.rows.length.toLocaleString()} daily records · ${data.columns.length} parameters`;
      renderDailyReport(section);
    })
    .catch(err => {
      section.querySelector('.dr-subtitle').textContent = 'No daily report data available for this plant';
      section.querySelector('.dr-table-wrapper').innerHTML = `
        <div style="padding:24px;color:var(--muted);text-align:center;">
          <p>No daily report found for prefix <code>${cfg.prefix}</code>.</p>
          <p style="font-size:0.85rem;">This plant may not have standard effluent reporting in the current dataset.</p>
        </div>`;
    });

  section.dataset.rendered = 'yes';
};

function updateParamBtnLabel(section) {
  const checked = section.querySelectorAll('.dr-param-scroll input[type=checkbox]:checked');
  const text = section.querySelector('.dr-param-btn-text');
  if (checked.length === 0) text.textContent = 'All parameters';
  else if (checked.length === 1) text.textContent = checked[0].value;
  else text.textContent = `Multiple selections (${checked.length})`;
}

function getSelectedParams(section) {
  return Array.from(section.querySelectorAll('.dr-param-scroll input[type=checkbox]:checked')).map(cb => cb.value);
}

function renderDailyReport(section) {
  const ctx = section._dailyReport;
  if (!ctx) return;
  const { cfg, data } = ctx;

  const lastN = parseInt(section.querySelector('.dr-last-n').value);
  const selectedParams = getSelectedParams(section);

  // Filter columns
  const cols = selectedParams.length
    ? data.columns.filter(c => selectedParams.includes(c.label))
    : data.columns;

  // Filter rows by date
  let rows = data.rows;
  if (lastN > 0 && rows.length) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - lastN);
    // Data is sorted desc, so also compare to newest date
    const newestDate = new Date(rows[0].date);
    const cutoffDate = new Date(newestDate);
    cutoffDate.setDate(cutoffDate.getDate() - lastN);
    rows = rows.filter(r => new Date(r.date) >= cutoffDate);
  }

  // Build table — PowerBI-style header: NAME / STORETCODE / UNITS / then dates
  const table = section.querySelector('.dr-table');
  let html = `<thead>
    <tr><th style="background:var(--surface-3);color:var(--accent);">NAME</th>${cols.map(c =>
      `<th style="background:var(--surface-3);color:var(--accent);font-weight:600;">${c.label}</th>`).join('')}</tr>
    <tr><th style="color:var(--muted);font-weight:500;">STORETCODE</th>${cols.map(c =>
      `<th style="color:var(--muted);font-weight:500;">${c.storet || '—'}</th>`).join('')}</tr>
    <tr><th style="color:var(--muted);font-weight:500;">UNITS</th>${cols.map(c =>
      `<th style="color:var(--muted);font-weight:500;">${c.unit || '—'}</th>`).join('')}</tr>
    <tr><th>Date</th>${cols.map(() => '<th></th>').join('')}</tr>
  </thead>`;
  html += '<tbody>';
  rows.forEach(r => {
    html += `<tr><td style="font-weight:600;color:var(--accent);white-space:nowrap;">${r.date}</td>`;
    cols.forEach(c => {
      const v = r[c.label];
      html += `<td style="text-align:right;">${v != null ? fmtNum(v) : ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  // Flow trend chart (bottom) — look for any Flow-MGD column
  const flowCol = cols.find(c => /Flow Mgd|Flow MGD|PLANT FLOW|Eff Flow/i.test(c.label));
  const chartCanvas = section.querySelector('.dr-chart');
  const chartId = section.dataset.pageId + '__flow-chart';
  destroyChart(chartId);

  if (flowCol) {
    // Group by year for the bar chart (like PowerBI)
    const byYear = {};
    rows.forEach(r => {
      const v = r[flowCol.label];
      if (v == null) return;
      const year = r.date.slice(0, 4);
      if (!byYear[year]) byYear[year] = { max: v, sum: v, n: 1 };
      else {
        byYear[year].max = Math.max(byYear[year].max, v);
        byYear[year].sum += v;
        byYear[year].n += 1;
      }
    });
    const years = Object.keys(byYear).sort();
    charts[chartId] = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          { label: `Max ${flowCol.label} (MGD)`, data: years.map(y => byYear[y].max),
            backgroundColor: DANGER + 'cc', borderRadius: 2 },
          { label: `Avg ${flowCol.label} (MGD)`, data: years.map(y => byYear[y].sum / byYear[y].n),
            backgroundColor: ACCENT + 'cc', borderRadius: 2 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } },
      },
    });
  } else {
    const cctx = chartCanvas.getContext('2d');
    cctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
  }
}

// ── Template: dataExplorer ───────────────────────────────────
TEMPLATES.dataExplorer = function(section, cfg) {
  if (section.dataset.rendered === 'yes') return;
  const avail = DATA.availability || [];

  // Build matrix: plant × category
  const plants = [...new Set(avail.map(r => r.WWTP))].sort();
  const cats   = [...new Set(avail.map(r => r.cat))].sort();
  const map = {};
  avail.forEach(r => { map[`${r.WWTP}||${r.cat}`] = r.readings || 0; });
  const maxN = Math.max(1, ...Object.values(map));

  const headerCells = cats.map(c => `<th title="${c}">${abbrev(c, 10)}</th>`).join('');
  const bodyRows = plants.map(p => {
    const cells = cats.map(c => {
      const n = map[`${p}||${c}`] || 0;
      const t = n / maxN;
      const bg = interpolateColor('#0d1d23', '#3fb7cf', t);
      const fg = t > 0.4 ? '#fff' : t > 0 ? ACCENT : 'transparent';
      return `<td style="background:${bg};color:${fg};" title="${p} — ${c}: ${n.toLocaleString()} rows">${n ? (n > 9999 ? Math.round(n/1000)+'k' : n) : ''}</td>`;
    }).join('');
    return `<tr><th class="row-header" title="${p}">${abbrev(p, 18)}</th>${cells}</tr>`;
  }).join('');

  section.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card"><span class="kpi-label">Plants in HachWIMS</span><strong>${plants.length}</strong></div>
      <div class="kpi-card"><span class="kpi-label">Parameter Categories</span><strong>${cats.length}</strong></div>
      <div class="kpi-card"><span class="kpi-label">Total Records</span><strong>${avail.reduce((s,r)=>s+(r.readings||0),0).toLocaleString()}</strong></div>
      <div class="kpi-card"><span class="kpi-label">Coverage Cells</span><strong>${avail.length.toLocaleString()}<span class="kpi-note">/ ${(plants.length*cats.length).toLocaleString()} possible</span></strong></div>
    </div>
    <div class="panel panel-wide">
      <div class="panel-header"><div><h2>${cfg.title}</h2><p>Cell brightness = reading count (darker = no data)</p></div></div>
      <div class="heatmap-container">
        <table class="heatmap-table">
          <thead><tr><th class="row-header">Plant</th>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    </div>`;
  section.dataset.rendered = 'yes';
};

// ── Boot ──────────────────────────────────────────────────────
loadData().catch(err => console.error('Failed to load data:', err));
