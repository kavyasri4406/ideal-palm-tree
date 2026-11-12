// Mandi prices for the screens: ask the server first, and when data.gov.in refused the server's
// connection (it blocks some cloud hosts), fetch today's official prices from this browser instead.

import type { MandiInfo } from "@/lib/cropData";
import { fetchLiveMandi } from "@/lib/liveMandi";

export interface MandiResponse {
  live?: boolean;
  topMandis?: MandiInfo[];
  priceDate?: string;
  wholesaleMandiRateQuintal?: number | null;
  officialUnreachable?: boolean;
}

export async function fetchMandiPrices(crop: string, state: string, district: string, signal?: AbortSignal): Promise<MandiResponse | null> {
  const res = await fetch(`/api/mandi-prices?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`, { signal });
  if (!res.ok) return null;
  const json = (await res.json()) as MandiResponse;
  if (json.officialUnreachable === true && json.live !== true) {
    try {
      const live = await fetchLiveMandi(crop, "", state, district);
      if (live) return live;
    } catch (err) {
      console.warn("Official mandi prices could not be loaded in the browser:", err);
    }
  }
  return json;
}
