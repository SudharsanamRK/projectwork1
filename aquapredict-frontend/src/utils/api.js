// src/utils/api.js
// Base URL of your Flask backend (update if you run Flask on a different port)
export const FLASK = "http://127.0.0.1:5001";

/**
 * Simple GET helper with optional timeout and better error messages.
 * Usage: const data = await getJSON(`${FLASK}/trends7d?species=Tuna`);
 */
export async function getJSON(url, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET ${url} failed: ${res.status} ${res.statusText} ${text}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`GET ${url} timed out after ${timeout}ms`);
    throw err;
  }
}

/**
 * POST JSON helper with helpful error output.
 * Usage: const out = await postJSON(`${FLASK}/advanced_predict`, payload);
 */
export async function postJSON(url, body, { timeout = 10000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      // try to include backend error text if available
      const text = await res.text().catch(() => "");
      throw new Error(`POST ${url} failed: ${res.status} ${res.statusText} ${text}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`POST ${url} timed out after ${timeout}ms`);
    throw err;
  }
}

/**
 * Try to fetch a list of regions from backend if you add a /regions endpoint.
 * If that fails, return a sensible fallback list to avoid label-encoder issues.
 */
export async function fetchRegions() {
  const FALLBACK = [
    "Chennai Coast",
    "Kochi Backwaters",
    "Goa Bay",
    "Mumbai Harbor",
    "Andaman Sea",
  ];

  try {
    const data = await getJSON(`${FLASK}/regions`, { timeout: 3000 });
    if (data && Array.isArray(data.regions) && data.regions.length) return data.regions;
    if (Array.isArray(data)) return data;
    return FALLBACK;
  } catch (err) {
  console.warn("fetchRegions failed — using fallback:", err);
  return FALLBACK;
  }
}
