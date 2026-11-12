// Server-side daily price history from Agmarknet's "Variety-wise Daily Market Prices Data of
// Commodity" dataset on data.gov.in, plus the forecast built on it. Prices are ₹ per quintal.
// Requires DATA_GOV_API_KEY; without it (or without recent data) a labelled simulation is returned.

import { COMMODITY_NAMES, STATE_ALIASES, describeError, hasAgmarknetKey } from "@/lib/agmarknet";
import { CROPS, type Crop } from "@/lib/cropData";
import { aggregateDaily, buildPriceSeries, simulatedPriceSeries, todayIso, addDays, type DailyPrice, type PriceSeries } from "@/lib/forecast";

const HISTORY_URL = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24";
// Records come newest first. One page covers a year in most states, but only a few weeks where
// hundreds of mandis report daily, so up to MAX_PAGES are fetched to reach TARGET_DAYS of history.
const PAGE_SIZE = 5000;
const MAX_PAGES = 5;
const TARGET_DAYS = 120;
const HISTORY_DAYS = 365;
// A forecast needs enough days to fit and backtest, and a recent last price to start from
const MIN_DAYS = 45;
const MAX_STALE_DAYS = 14;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const SIMULATED_TTL_MS = 30 * 60 * 1000;

const cache = new Map<string, { at: number; ttl: number; series: Promise<PriceSeries> }>();

async function fetchPage(commodity: string, state: string, offset: number): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams({
    "api-key": process.env.DATA_GOV_API_KEY || "",
    format: "json",
    limit: String(PAGE_SIZE),
    offset: String(offset),
    "filters[State]": state,
    "filters[Commodity]": commodity,
    "sort[Arrival_Date]": "desc",
  });
  const res = await fetch(`${HISTORY_URL}?${params}`, { signal: AbortSignal.timeout(30000), cache: "no-store" });
  if (!res.ok) throw new Error(`Agmarknet history HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.records) ? json.records : [];
}

async function fetchDaily(commodity: string, state: string): Promise<DailyPrice[]> {
  const records = await fetchPage(commodity, state, 0);
  const days = aggregateDaily(records, HISTORY_DAYS).length;
  // States with many mandis fill a page in a few weeks; fetch the older pages needed for TARGET_DAYS
  if (records.length === PAGE_SIZE && days > 0 && days < TARGET_DAYS) {
    const pagesNeeded = Math.min(MAX_PAGES, Math.ceil(TARGET_DAYS / days));
    const offsets = Array.from({ length: pagesNeeded - 1 }, (_, i) => (i + 1) * PAGE_SIZE);
    const older = await Promise.allSettled(offsets.map(offset => fetchPage(commodity, state, offset)));
    for (const page of older) {
      // A failed older page only shortens the history; aggregateDaily copes with the gap
      if (page.status === "fulfilled") records.push(...page.value);
    }
  }
  return aggregateDaily(records, HISTORY_DAYS);
}

function isUsable(daily: DailyPrice[]): boolean {
  if (daily.length < MIN_DAYS) return false;
  return daily[daily.length - 1].date >= addDays(todayIso(), -MAX_STALE_DAYS);
}

async function loadSeries(crop: Crop, state: string): Promise<PriceSeries> {
  const names = COMMODITY_NAMES[crop.id];
  let reason = "no official price history for this crop";
  // Official prices are ₹/quintal, so only use them for crops priced per quintal
  if (names && crop.unit === "quintal") {
    if (!hasAgmarknetKey()) {
      reason = "DATA_GOV_API_KEY is not set on the server";
    } else {
      reason = `no recent official data for ${crop.name} in ${state}`;
      const states = [...new Set([STATE_ALIASES[state] || state, state])];
      for (const name of names.flatMap(n => n.split("|"))) {
        for (const agState of states) {
          try {
            const daily = await fetchDaily(name, agState);
            if (isUsable(daily)) return buildPriceSeries(daily, { source: "agmarknet", scope: state, commodity: name });
          } catch (err) {
            reason = `could not reach data.gov.in: ${describeError(err)}`;
            console.warn(`Price history fetch failed for ${name} in ${agState}: ${reason}`);
          }
        }
      }
    }
  }
  return { ...simulatedPriceSeries(crop.id, crop.basePrice, HISTORY_DAYS), unavailableReason: reason };
}

export function findCrop(query: string): Crop | undefined {
  const q = query.trim().toLowerCase();
  return CROPS.find(c => c.id === q || c.name.toLowerCase() === q);
}

/** History, 30-day forecast and backtest for a crop in a state. Cached per crop and state. */
export function getPriceSeries(crop: Crop, state: string): Promise<PriceSeries> {
  const key = `${crop.id}|${state}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.series;
  const series = loadSeries(crop, state);
  const entry = { at: Date.now(), ttl: CACHE_TTL_MS, series };
  cache.set(key, entry);
  // Retry sooner when only the simulation was available; don't keep a failed request at all
  series.then(s => { if (s.source === "simulated") entry.ttl = SIMULATED_TTL_MS; }, () => cache.delete(key));
  return series;
}
