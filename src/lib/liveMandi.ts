// Today's official mandi prices for a crop in a state, built from Agmarknet records. Runs on the
// server (the /api/mandi-prices route) and, when data.gov.in refuses the server, in the browser.

import { getAgmarknetPrices, hasAgmarknetKey } from "@/lib/agmarknet";
import { CROPS, type Crop, type MandiInfo } from "@/lib/cropData";

export const AGMARKNET_SOURCE = "Agmarknet, Govt. of India (data.gov.in)";
const MAX_LIVE_MANDIS = 8;

export function findCrop(query: string): Crop | undefined {
  const q = query.trim().toLowerCase();
  return CROPS.find(c => c.name.toLowerCase() === q || c.id === q);
}

export interface LiveMandiResult {
  crop: string;
  variety: string;
  location: string;
  unit: string;
  source: string;
  live: true;
  priceDate: string;
  lastUpdated: string;
  wholesaleMandiRateKg: number;
  wholesaleMandiRateQuintal: number;
  retailRateKg: null;
  retailRateQuintal: null;
  marketTrend: "stable";
  topMandis: MandiInfo[];
}

const uid = () => Math.random().toString(36).slice(2, 7);

/**
 * Official prices, or null when there is nothing to show (unknown crop, not priced per quintal, no
 * key, or no market reported the crop today). Throws when data.gov.in cannot be reached.
 */
export async function fetchLiveMandi(crop: string, variety: string, state: string, district: string): Promise<LiveMandiResult | null> {
  const knownCrop = findCrop(crop);
  // Official prices are ₹/quintal, so only use them for crops priced per quintal
  if (!knownCrop || knownCrop.unit !== "quintal" || !hasAgmarknetKey()) return null;

  const records = (await getAgmarknetPrices(knownCrop.id, state, district)).slice(0, MAX_LIVE_MANDIS);
  if (records.length === 0) return null;

  const avg = Math.round(records.reduce((acc, r) => acc + r.modalPrice, 0) / records.length);
  const best = Math.max(...records.map(r => r.modalPrice));
  const topMandis: MandiInfo[] = records.map((r, i) => ({
    id: `agmark_${knownCrop.id}_${i}_${uid()}`,
    mandiName: r.market,
    district: r.district,
    state: r.state,
    distanceKm: 0,
    price: r.modalPrice,
    priceDiff: r.modalPrice - avg,
    arrivalsTons: 0,
    trend: "stable",
    isBestChoice: r.modalPrice === best,
    // Some markets omit min/max; leave them unset rather than showing ₹0
    minPrice: r.minPrice > 0 ? r.minPrice : undefined,
    maxPrice: r.maxPrice > 0 ? r.maxPrice : undefined,
    arrivalDate: r.arrivalDate,
  }));
  return {
    crop,
    variety: variety || "All Varieties",
    location: `${district}, ${state}`,
    unit: knownCrop.unit,
    source: AGMARKNET_SOURCE,
    live: true,
    priceDate: records[0].arrivalDate,
    lastUpdated: new Date().toISOString(),
    wholesaleMandiRateKg: Math.round(avg / 10) / 10,
    wholesaleMandiRateQuintal: avg,
    retailRateKg: null,
    retailRateQuintal: null,
    marketTrend: "stable",
    topMandis,
  };
}
