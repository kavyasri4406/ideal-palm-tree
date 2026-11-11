import { LIMITS, rateLimited } from "@/lib/apiGuard";
import { findCrop, getPriceSeries } from "@/lib/priceHistory";
import { NextRequest, NextResponse } from "next/server";

// Daily price history, 30-day forecast and backtest for a crop in a state.
// Official Agmarknet history when DATA_GOV_API_KEY is set and the crop traded recently in that
// state; otherwise a simulation, marked source: "simulated".

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const limited = rateLimited(req, LIMITS.priceHistory);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const crop = findCrop((searchParams.get("crop") || "").slice(0, 80));
  const state = (searchParams.get("state") || "").slice(0, 80);
  if (!crop) return NextResponse.json({ error: "Unknown crop" }, { status: 400 });

  try {
    return NextResponse.json(await getPriceSeries(crop, state));
  } catch (err) {
    console.warn("Price history request failed:", err);
    return NextResponse.json({ error: "Price history is unavailable right now." }, { status: 502 });
  }
}
