// Minimal reactive state holder. Preact's signals package would also work,
// but we're keeping dependencies minimal; a tiny pub/sub is enough here.

const subs = new Set();

export const state = {
  manifest: null,
  route: parseHash(),
  currentPage: null,        // loaded page spec JSON
  currentPageLoading: false,
  currentPageError: null,
  filters: {
    // Page-scoped filter state: currentPlant is set when the page has a plant
    // slicer; visuals look up `data_by_plant[currentPlant]` for their rendered data.
    currentPlant: null,
    // currentDateRange is set when the page has a date slicer (DATATBL.DATESTAMP).
    // Values: one of the keys from DATE_RANGES in tools/aggregate.py
    // ("last_30_days", "last_90_days", "last_12_months", "last_5_years", "all_time").
    currentDateRange: null,
  },
};

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function update(mutator) {
  mutator(state);
  for (const fn of subs) fn(state);
}

export function setCurrentPlant(plant) {
  update(s => { s.filters.currentPlant = plant || null; });
}

export function setCurrentDateRange(key) {
  update(s => { s.filters.currentDateRange = key || null; });
}

function parseHash() {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  if (!h || h === "home") return { slug: "home" };
  return { slug: h };
}

window.addEventListener("hashchange", () => {
  update(s => { s.route = parseHash(); });
});
