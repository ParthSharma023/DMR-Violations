// Data loaders for manifest + per-page specs.
// Uses generated classic scripts so the dashboard can run from file://
// by double-clicking index.html in browsers that block ES modules on disk.

const CACHE = new Map();
const SCRIPT_CACHE = new Map();
const SESSION = Date.now().toString(36);

function registry() {
  if (!window.__WWIP_DATA__) {
    window.__WWIP_DATA__ = { pages: {}, custom: {} };
  }
  window.__WWIP_DATA__.pages ||= {};
  window.__WWIP_DATA__.custom ||= {};
  return window.__WWIP_DATA__;
}

function scriptHref(relPath) {
  const href = new URL(relPath, document.baseURI);
  if (window.location.protocol !== "file:") {
    href.searchParams.set("v", SESSION);
  }
  return href.href;
}

function loadScript(relPath) {
  if (SCRIPT_CACHE.has(relPath)) return SCRIPT_CACHE.get(relPath);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptHref(relPath);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${relPath}`));
    document.head.appendChild(script);
  });
  SCRIPT_CACHE.set(relPath, promise);
  return promise;
}

export async function loadManifest() {
  if (CACHE.has("__manifest__")) return CACHE.get("__manifest__");
  const data = registry();
  if (!data.manifest) {
    await loadScript("data/manifest.js");
  }
  if (!data.manifest) {
    throw new Error("Manifest data did not register correctly.");
  }
  CACHE.set("__manifest__", data.manifest);
  return data.manifest;
}

export async function loadPage(slug) {
  const key = `page:${slug}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const data = registry();
  if (!data.pages[slug]) {
    await loadScript(`data/pages/${slug}.js`);
  }
  if (!data.pages[slug]) {
    throw new Error(`Page data did not register for slug: ${slug}`);
  }
  CACHE.set(key, data.pages[slug]);
  return data.pages[slug];
}

export async function loadCustomData(key, relPath) {
  const cacheKey = `custom:${key}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);
  const data = registry();
  if (!data.custom[key]) {
    await loadScript(relPath);
  }
  if (!data.custom[key]) {
    throw new Error(`Custom data did not register for key: ${key}`);
  }
  CACHE.set(cacheKey, data.custom[key]);
  return data.custom[key];
}
