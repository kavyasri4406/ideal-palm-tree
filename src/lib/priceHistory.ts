// Daily price history from Agmarknet's "Variety-wise Daily Market Prices Data of
// Commodity" dataset on data.gov.in, plus the forecast built on it. Prices are ₹ per quintal.
// Runs on the server; the browser reuses `tryOfficialSeries` when data.gov.in refuses the server.
// Without a key (or recent data) a labelled simulation is returned.

import { COMMODITY_NAMES, STATE_ALIASES, agmarknetKey, dataGovBlocked, dataGovFetch, describeError, hasAgmarknetKey } from "@/lib/agmarknet";
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
    "api-key": agmarknetKey(),
    format: "json",
    // Only the columns the model needs (a response is about a third of the size)
    fields: "Arrival_Date,Modal_Price,Market",
    limit: String(PAGE_SIZE),
    offset: String(offset),
    "filters[State]": state,
    "filters[Commodity]": commodity,
    "sort[Arrival_Date]": "desc",
  });
  const res = await dataGovFetch(`${HISTORY_URL}?${params}`, 30000);
  if (!res.ok) throw new Error(`Agmarknet history HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.records) ? json.records : [];
}

async function fetchDaily(commodity: string, state: string, targetDays: number): Promise<DailyPrice[]> {
  const records = await fetchPage(commodity, state, 0);
  const days = aggregateDaily(records, HISTORY_DAYS).length;
  // States with many mandis fill a page in a few weeks; fetch the older pages needed for targetDays
  if (records.length === PAGE_SIZE && days > 0 && days < targetDays) {
    const pagesNeeded = Math.min(MAX_PAGES, Math.ceil(targetDays / days));
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

export interface OfficialAttempt {
  series: PriceSeries | null;
  reason: string;
  // data.gov.in could not be reached (as opposed to having no data)
  unreachable: boolean;
}

/** Tries the official daily history for a crop in a state. Never throws. */
export async function tryOfficialSeries(crop: Crop, state: string, targetDays: number = TARGET_DAYS): Promise<OfficialAttempt> {
  const names = COMMODITY_NAMES[crop.id];
  // Official prices are ₹/quintal, so only use them for crops priced per quintal
  if (!names || crop.unit !== "quintal") return { series: null, reason: "no official price history for this crop", unreachable: false };
  if (!hasAgmarknetKey()) return { series: null, reason: "no data.gov.in key is set", unreachable: false };

  const refused = { series: null, reason: "data.gov.in refuses this server; the browser loads the data instead", unreachable: true };
  if (dataGovBlocked()) return refused;

  let reason = `no recent official data for ${crop.name} in ${state}`;
  let unreachable = false;
  const states = [...new Set([STATE_ALIASES[state] || state, state])];
  for (const name of names.flatMap(n => n.split("|"))) {
    for (const agState of states) {
      try {
        const daily = await fetchDaily(name, agState, targetDays);
        if (isUsable(daily)) return { series: buildPriceSeries(daily, { source: "agmarknet", scope: state, commodity: name }), reason: "", unreachable: false };
      } catch (err) {
        unreachable = true;
        reason = `could not reach data.gov.in: ${describeError(err)}`;
        console.info(`Price history fetch failed for ${name} in ${agState}: ${reason}`);
        // The connection itself failed, so the other names and spellings would fail the same way
        if (dataGovBlocked()) return { ...refused, reason };
      }
    }
  }
  return { series: null, reason, unreachable };
}

async function loadSeries(crop: Crop, state: string): Promise<PriceSeries> {
  const attempt = await tryOfficialSeries(crop, state);
  if (attempt.series) return attempt.series;
  return {
    ...simulatedPriceSeries(crop.id, crop.basePrice, HISTORY_DAYS),
    unavailableReason: attempt.reason,
    ...(attempt.unreachable ? { officialUnreachable: true } : {}),
  };
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
