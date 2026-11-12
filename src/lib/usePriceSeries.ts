"use client";
import { useEffect, useMemo, useState } from "react";
import type { Crop } from "@/lib/cropData";
import { simulatedPriceSeries, type PriceSeries } from "@/lib/forecast";
import { loadOfficialSeriesInBrowser } from "@/lib/priceHistoryClient";

/** "2026-11-10" → "10 Nov" */
export function dayLabel(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function isPriceSeries(v: unknown): v is PriceSeries {
  const s = v as PriceSeries | null;
  return !!s && (s.source === "agmarknet" || s.source === "simulated") && Array.isArray(s.history) && s.history.length > 1 && Array.isArray(s.forecast);
}

/**
 * Price history, 30-day forecast and backtest for a crop in a state, from /api/price-history.
 * Until the official series arrives (or if it can't be loaded) a simulated series is returned,
 * marked source: "simulated"; `loading` is true while the request is in flight.
 */
export function usePriceSeries(crop: Crop | undefined, state: string): { series: PriceSeries | null; loading: boolean } {
  const key = crop ? `${crop.id}|${state}` : "";
  const [loaded, setLoaded] = useState<{ key: string; series: PriceSeries | null } | null>(null);
  const fallback = useMemo(() => (crop ? simulatedPriceSeries(crop.id, crop.basePrice) : null), [crop]);

  useEffect(() => {
    if (!crop) return;
    const controller = new AbortController();
    const requestKey = `${crop.id}|${state}`;
    fetch(`/api/price-history?crop=${encodeURIComponent(crop.id)}&state=${encodeURIComponent(state)}`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then(async json => {
        let series: PriceSeries | null = isPriceSeries(json) ? json : null;
        // The server could not reach data.gov.in (it refuses some cloud hosts), so try from here
        if (series && series.source === "simulated" && series.officialUnreachable) {
          series = (await loadOfficialSeriesInBrowser(crop, state).catch(() => null)) ?? series;
        }
        if (!controller.signal.aborted) setLoaded({ key: requestKey, series });
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        console.error("Price history fetch failed:", err);
        setLoaded({ key: requestKey, series: null });
      });
    return () => controller.abort();
  }, [crop, state]);

  const current = loaded && loaded.key === key ? loaded : null;
  return { series: current?.series ?? fallback, loading: !!crop && !current };
}
