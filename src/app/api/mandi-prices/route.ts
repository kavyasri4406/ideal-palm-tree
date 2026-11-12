import { getStrictDistrictMandis } from "@/lib/mandiDatabase";
import { CROPS, type MandiInfo } from "@/lib/cropData";
import { groqChat, hasGroqKey, parseJsonReply } from "@/lib/groq";
import { describeError, getAgmarknetPrices, hasAgmarknetKey } from "@/lib/agmarknet";
import { LIMITS, rateLimited } from "@/lib/apiGuard";
import { NextRequest, NextResponse } from "next/server";

// APMC mandi rates. Official Agmarknet prices (data.gov.in) when DATA_GOV_API_KEY is set and the
// crop was reported today; otherwise estimates (AI-generated when a Groq key is set, else modelled
// from each crop's base price).

const AGMARKNET_SOURCE = "Agmarknet, Govt. of India (data.gov.in)";
const MAX_LIVE_MANDIS = 8;
const AI_SOURCE = "AI-estimated indicative rates (not official Agmarknet data)";
const MODEL_SOURCE = "Indicative estimate from AgriPredict price model (verify at agmarknet.gov.in)";

function uid(): string {
  return Math.random().toString(36).slice(2, 7);
}

function findCrop(crop: string) {
  const q = crop.trim().toLowerCase();
  return CROPS.find(c => c.name.toLowerCase() === q || c.id === q);
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

  // Official prices are ₹/quintal, so only use them for crops priced per quintal
  if (knownCrop && unit === "quintal" && hasAgmarknetKey()) {
    try {
      const records = (await getAgmarknetPrices(knownCrop.id, state, district)).slice(0, MAX_LIVE_MANDIS);
      if (records.length > 0) {
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
          arrivalDate: r.arrivalDate
        }));
        return NextResponse.json({
          crop,
          variety: variety || "All Varieties",
          location: `${district}, ${state}`,
          unit,
          source: AGMARKNET_SOURCE,
          live: true,
          priceDate: records[0].arrivalDate,
          lastUpdated: new Date().toISOString(),
          wholesaleMandiRateKg: Math.round(avg / 10) / 10,
          wholesaleMandiRateQuintal: avg,
          retailRateKg: null,
          retailRateQuintal: null,
          marketTrend: "stable",
          topMandis
        });
      }
    } catch (err) {
      console.warn("Agmarknet prices unavailable, falling back to estimates:", describeError(err));
    }
  }

  if (hasGroqKey()) {
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
      maxTokens: 1500,
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
    lastUpdated: new Date().toISOString(),
    wholesaleMandiRateKg: unit === "quintal" ? round(wholesaleQ / 100) : null,
    wholesaleMandiRateQuintal: unit === "quintal" ? wholesaleQ : null,
    retailRateKg: unit === "quintal" ? round(retailQ / 100) : null,
    retailRateQuintal: unit === "quintal" ? retailQ : null,
    marketTrend: "stable",
    topMandis
  });
}
