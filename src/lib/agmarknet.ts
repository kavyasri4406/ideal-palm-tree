// Server-side client for Agmarknet's "Current Daily Price of Various Commodities from
// Various Markets (Mandi)" dataset on data.gov.in — the official daily APMC prices.
// Prices are ₹ per quintal. Requires DATA_GOV_API_KEY.

const RESOURCE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_RECORDS = 5000;

export interface AgmarknetRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string; // dd/mm/yyyy
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

// App state name → Agmarknet state name, where they differ
const STATE_ALIASES: Record<string, string> = {
  "Kerala": "Keralam",
  "Chhattisgarh": "Chattisgarh",
  "Delhi": "NCT of Delhi",
  "Puducherry": "Pondicherry",
  "Jammu & Kashmir": "Jammu and Kashmir",
};

// App crop id → Agmarknet commodity names, most relevant first
const COMMODITY_NAMES: Record<string, string[]> = {
  rice: ["Paddy(Common)", "Paddy(Basmati)", "Rice"],
  wheat: ["Wheat"],
  corn: ["Maize"],
  mustard: ["Mustard"],
  soybean: ["Soyabean"],
  groundnut: ["Groundnut", "Groundnut pods(raw)", "Ground Nut Seed"],
  sugarcane: ["Sugarcane"],
  cotton: ["Cotton"],
  tomato: ["Tomato"],
  onion: ["Onion"],
  potato: ["Potato"],
  gram: ["Bengal Gram(Gram)(Whole)"],
  tur: ["Red gram/Arhar/Tur(whole)", "Arhar (Tur/Red Gram)(Whole)"],
  moong: ["Green Gram(Moong)(Whole)"],
  banana: ["Banana", "Banana - Green"],
  mango: ["Mango", "Mango(Raw-Ripe)"],
  turmeric: ["Turmeric"],
  chilli: ["Dry Chillies", "Chili Red"],
  cabbage: ["Cabbage"],
  cauliflower: ["Cauliflower"],
  eggplant: ["Brinjal"],
  // Markets report okra under both names in the same state, so match them together
  okra: ["Bhindi(Ladies Finger)|Ladies Finger"],
  carrot: ["Carrot"],
  apple: ["Apple"],
  papaya: ["Papaya"],
  orange: ["Orange"],
  grape: ["Grapes"],
  pomegranate: ["Pomegranate"],
};

const cache = new Map<string, { at: number; records: Promise<AgmarknetRecord[]> }>();

export function hasAgmarknetKey(): boolean {
  return !!process.env.DATA_GOV_API_KEY;
}

// Agmarknet spellings vary ("Green Gram (Moong)" vs "Green Gram(Moong)"), so compare loosely
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

export function districtMatches(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return false;
  if (x.includes(y) || y.includes(x)) return true;
  // Transliteration differences such as "Chittoor" / "Chittor"
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i++;
  return i >= 5;
}

function toNumber(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

async function fetchStateRecords(agState: string): Promise<AgmarknetRecord[]> {
  const params = new URLSearchParams({
    "api-key": process.env.DATA_GOV_API_KEY || "",
    format: "json",
    limit: String(MAX_RECORDS),
    "filters[state.keyword]": agState,
  });
  const res = await fetch(`${RESOURCE_URL}?${params}`, { signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!res.ok) throw new Error(`Agmarknet HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json?.records)) throw new Error("Agmarknet returned no records");
  return json.records
    .map((r: Record<string, unknown>) => ({
      state: String(r.state ?? ""),
      district: String(r.district ?? ""),
      market: String(r.market ?? ""),
      commodity: String(r.commodity ?? ""),
      variety: String(r.variety ?? ""),
      arrivalDate: String(r.arrival_date ?? ""),
      minPrice: toNumber(r.min_price),
      maxPrice: toNumber(r.max_price),
      modalPrice: toNumber(r.modal_price),
    }))
    .filter((r: AgmarknetRecord) => r.modalPrice > 0);
}

// All of today's records for a state, cached for an hour (one upstream call per state per hour)
function getStateRecords(state: string): Promise<AgmarknetRecord[]> {
  const agState = STATE_ALIASES[state] || state;
  const hit = cache.get(agState);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.records;
  const records = fetchStateRecords(agState);
  cache.set(agState, { at: Date.now(), records });
  // Don't keep a failed request cached
  records.catch(() => cache.delete(agState));
  return records;
}

/**
 * Today's official mandi prices for a crop in a state, markets in `district` first.
 * Returns [] when the crop isn't mapped or no market reported it today.
 */
export async function getAgmarknetPrices(cropId: string, state: string, district: string): Promise<AgmarknetRecord[]> {
  const names = COMMODITY_NAMES[cropId];
  if (!names) return [];
  const records = await getStateRecords(state);

  for (const name of names) {
    // "A|B" = synonyms for the same product, matched together
    const wanted = name.split("|").map(normalize);
    const matches = records.filter(r => wanted.includes(normalize(r.commodity)));
    if (matches.length === 0) continue;

    // One row per market: keep its median-priced variety so premium varieties don't skew prices
    const byMarket = new Map<string, AgmarknetRecord[]>();
    for (const r of matches) byMarket.set(r.market, [...(byMarket.get(r.market) || []), r]);
    const perMarket = [...byMarket.values()].map(rs => {
      const sorted = rs.sort((a, b) => a.modalPrice - b.modalPrice);
      return sorted[Math.floor((sorted.length - 1) / 2)];
    });
    return perMarket.sort((a, b) => {
      const da = districtMatches(a.district, district) ? 0 : 1;
      const db = districtMatches(b.district, district) ? 0 : 1;
      return da - db || b.modalPrice - a.modalPrice;
    });
  }
  return [];
}
