// Browser-side price history. data.gov.in refuses connections from some cloud hosts (such as
// Vercel), but allows browsers, so when the server could not reach it the visitor's own browser
// loads the official history and the forecast is built here.

import type { Crop } from "@/lib/cropData";
import type { PriceSeries } from "@/lib/forecast";
import { tryOfficialSeries } from "@/lib/priceHistory";

const CACHE_PREFIX = "agri_ph_v1_";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
// 60 days is enough to fit and backtest the model, and keeps a phone's download small
const BROWSER_TARGET_DAYS = 60;

function readCache(key: string): PriceSeries | null {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_PREFIX + key) || "null") as { at: number; series: PriceSeries } | null;
    if (raw && Date.now() - raw.at < CACHE_TTL_MS && raw.series?.source === "agmarknet") return raw.series;
  } catch { /* storage blocked or corrupt: just refetch */ }
  return null;
}

function writeCache(key: string, series: PriceSeries) {
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), series })); }
  catch { /* storage full or blocked */ }
}

/** The official series loaded by this browser, or null when it cannot be had. */
export async function loadOfficialSeriesInBrowser(crop: Crop, state: string): Promise<PriceSeries | null> {
  const key = `${crop.id}|${state}`;
  const cached = readCache(key);
  if (cached) return cached;
  const attempt = await tryOfficialSeries(crop, state, BROWSER_TARGET_DAYS);
  if (attempt.series) writeCache(key, attempt.series);
  return attempt.series;
}
