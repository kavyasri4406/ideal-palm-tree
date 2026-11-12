import { getStrictDistrictMandis } from "@/lib/mandiDatabase";
import { type MandiInfo } from "@/lib/cropData";
import { groqChat, hasGroqKey, parseJsonReply } from "@/lib/groq";
import { dataGovBlocked, describeError, hasAgmarknetKey } from "@/lib/agmarknet";
import { fetchLiveMandi, findCrop } from "@/lib/liveMandi";
import { LIMITS, rateLimited } from "@/lib/apiGuard";
import { NextRequest, NextResponse } from "next/server";

// APMC mandi rates. Official Agmarknet prices (data.gov.in) when DATA_GOV_API_KEY is set and the
// crop was reported today; otherwise estimates (AI-generated when a Groq key is set, else modelled
// from each crop's base price).

const AI_SOURCE = "AI-estimated indicative rates (not official Agmarknet data)";
const MODEL_SOURCE = "Indicative estimate from AgriPredict price model (verify at agmarknet.gov.in)";

function uid(): string {
  return Math.random().toString(36).slice(2, 7);
}

function toNumber(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function normalizeAiMandis(raw: unknown, crop: string, district: string, state: string): MandiInfo[] | null {
  if (!Array.isArray(raw)) return null;
  const mandis: MandiInfo[] = [];
  raw.forEach((m, i) => {
    const price = toNumber(m?.price);
    if (typeof m?.mandiName !== "string" || price === null || price <= 0) return;
    mandis.push({
      id: `api_mandi_${crop}_${district}_${i}_${uid()}`,
      mandiName: m.mandiName,
      district: typeof m.district === "string" ? m.district : district,
      state: typeof m.state === "string" ? m.state : state,
      distanceKm: toNumber(m.distanceKm) ?? 0,
      price,
      priceDiff: toNumber(m.priceDiff) ?? 0,
      arrivalsTons: toNumber(m.arrivalsTons) ?? 0,
      trend: m.trend === "up" || m.trend === "down" ? m.trend : "stable",
      isBestChoice: m.isBestChoice === true
    });
  });
  return mandis.length > 0 ? mandis : null;
}

export async function GET(req: NextRequest) {
  const limited = rateLimited(req, LIMITS.mandiPrices);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const crop = (searchParams.get("crop") || "Rice").slice(0, 80);
  const variety = (searchParams.get("variety") || "").slice(0, 80);
  const state = (searchParams.get("state") || "Andhra Pradesh").slice(0, 80);
  const district = (searchParams.get("district") || "Chittoor").slice(0, 80);
  const knownCrop = findCrop(crop);
  const unit = knownCrop?.unit || "quintal";

  // True when data.gov.in refused this server's connection; the browser may still be able to reach it
  let officialUnreachable = false;
  if (knownCrop && unit === "quintal" && hasAgmarknetKey()) {
    if (dataGovBlocked()) {
      officialUnreachable = true;
    } else {
      try {
        const live = await fetchLiveMandi(crop, variety, state, district);
        if (live) return NextResponse.json(live);
      } catch (err) {
        officialUnreachable = true;
        console.info("Agmarknet prices unavailable, falling back to estimates:", describeError(err));
      }
    }
  }
  // The browser fetches the official prices itself in this case, so an AI estimate would only
  // spend Groq allowance that the chatbot and scanner need
  const browserWillFetch = officialUnreachable && !!process.env.NEXT_PUBLIC_DATA_GOV_API_KEY;

  if (hasGroqKey() && !browserWillFetch) {
    const prompt = `You estimate Indian APMC mandi wholesale and retail prices for:
Crop: ${crop}
Variety: ${variety || "All Varieties"}
State: ${state}
District: ${district}, India.
All "price" values must be in ₹ per ${unit}.

Return ONLY a JSON object matching this structure:
{
  "wholesaleMandiRateKg": 15,
  "wholesaleMandiRateQuintal": 1500,
  "retailRateKg": 35,
  "retailRateQuintal": 3500,
  "marketTrend": "up",
  "topMandis": [
    { "mandiName": "${district} APMC Primary Yard", "district": "${district}", "state": "${state}", "distanceKm": 8, "price": 1500, "priceDiff": 0, "arrivalsTons": 450, "trend": "stable", "isBestChoice": false },
    { "mandiName": "Regional Central APMC", "district": "Regional", "state": "${state}", "distanceKm": 45, "price": 1650, "priceDiff": 150, "arrivalsTons": 380, "trend": "up", "isBestChoice": false },
    { "mandiName": "Metropolitan APMC Market", "district": "Metro Hub", "state": "${state}", "distanceKm": 140, "price": 2200, "priceDiff": 700, "arrivalsTons": 290, "trend": "up", "isBestChoice": true }
  ]
}`;

    const result = await groqChat({
      model: process.env.GROQ_TEXT_MODEL || "qwen/qwen3.8-27b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      // Groq rejects a request that asks for more output than the per-minute allowance (~1,000)
      maxTokens: 900,
      json: true,
      timeoutMs: 20000
    });

    if (result.ok) {
      const parsed = parseJsonReply(result.content);
      const topMandis = normalizeAiMandis(parsed?.topMandis, crop, district, state);
      if (parsed && topMandis) {
        return NextResponse.json({
          ...parsed,
          crop,
          variety: variety || "All Varieties",
          location: `${district}, ${state}`,
          unit,
          source: AI_SOURCE,
          live: false,
          officialUnreachable,
          lastUpdated: new Date().toISOString(),
          topMandis
        });
      }
    }
    console.warn("Groq mandi estimate unavailable, using price model:", result.ok ? "unparseable reply" : result.error);
  }

  // Modelled mandi rates built from the selected State & District's real APMC yards
  const mandiNames = getStrictDistrictMandis(state, district);

  const cropLower = crop.toLowerCase();
  const varietyLower = variety.toLowerCase();
  let wholesaleQ = 2500;
  let retailQ = 4500;

  if (cropLower.includes("mango") && varietyLower.includes("totapuri")) { wholesaleQ = 800; retailQ = 2500; }
  else if (cropLower.includes("mango") && varietyLower.includes("alphonso")) { wholesaleQ = 6500; retailQ = 18000; }
  else if (knownCrop) { wholesaleQ = knownCrop.basePrice; retailQ = Math.round(knownCrop.basePrice * 1.6); }
  else if (cropLower.includes("pomegranate")) { wholesaleQ = 6000; retailQ = 12000; }
  else if (cropLower.includes("chilli")) { wholesaleQ = 14500; retailQ = 19000; }
  else if (cropLower.includes("onion")) { wholesaleQ = 1400; retailQ = 3500; }
  else if (cropLower.includes("tomato")) { wholesaleQ = 1200; retailQ = 3000; }
  else if (cropLower.includes("apple")) { wholesaleQ = 5500; retailQ = 14000; }
  else if (cropLower.includes("rice")) { wholesaleQ = 3600; retailQ = 5500; }
  else if (cropLower.includes("wheat")) { wholesaleQ = 2400; retailQ = 3800; }

  // Price steps scale with the crop's price so low-priced units (e.g. ₹/dozen) stay sensible
  const round = (n: number) => (wholesaleQ >= 100 ? Math.round(n) : Math.round(n * 10) / 10);
  const topMandis: MandiInfo[] = mandiNames.map((name, idx) => {
    const isLast = idx === mandiNames.length - 1;
    const priceBoost = round(wholesaleQ * 0.035 * idx);
    return {
      id: `mandi_${district}_${idx}_${uid()}`,
      mandiName: name,
      district: isLast && idx > 0 ? "State Hub" : district,
      state,
      distanceKm: idx === 0 ? 6 : idx * 22,
      price: round(wholesaleQ + priceBoost),
      priceDiff: priceBoost,
      arrivalsTons: Math.max(80, 520 - idx * 60),
      trend: priceBoost > 0 ? "up" : "stable",
      isBestChoice: isLast
    };
  });

  return NextResponse.json({
    crop,
    variety: variety || "All Varieties",
    location: `${district}, ${state}`,
    unit,
    source: MODEL_SOURCE,
    live: false,
    officialUnreachable,
    lastUpdated: new Date().toISOString(),
    wholesaleMandiRateKg: unit === "quintal" ? round(wholesaleQ / 100) : null,
    wholesaleMandiRateQuintal: unit === "quintal" ? wholesaleQ : null,
    retailRateKg: unit === "quintal" ? round(retailQ / 100) : null,
    retailRateQuintal: unit === "quintal" ? retailQ : null,
    marketTrend: "stable",
    topMandis
  });
}
