// Server-side client for Agmarknet's "Current Daily Price of Various Commodities from
// Various Markets (Mandi)" dataset on data.gov.in — the official daily APMC prices.
// Prices are ₹ per quintal. Requires DATA_GOV_API_KEY (server) or NEXT_PUBLIC_DATA_GOV_API_KEY (browser).

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
export const STATE_ALIASES: Record<string, string> = {
  "Kerala": "Keralam",
  "Chhattisgarh": "Chattisgarh",
  "Delhi": "NCT of Delhi",
  "Puducherry": "Pondicherry",
  "Jammu & Kashmir": "Jammu and Kashmir",
};

// App crop id → Agmarknet commodity names, most relevant first
export const COMMODITY_NAMES: Record<string, string[]> = {
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

/**
 * The data.gov.in key. On the server it is DATA_GOV_API_KEY. data.gov.in refuses connections from
 * some cloud hosts (for example Vercel), so the browser can also call it directly with
 * NEXT_PUBLIC_DATA_GOV_API_KEY (a free key; anything in a browser bundle is public).
 */
export function agmarknetKey(): string {
  return process.env.DATA_GOV_API_KEY || process.env.NEXT_PUBLIC_DATA_GOV_API_KEY || "";
}

export function hasAgmarknetKey(): boolean {
  return !!agmarknetKey();
}

// data.gov.in refuses connections from some cloud hosts. Vercel is one of them (ECONNREFUSED), so
// there the server does not try at all and the visitor's browser fetches instead. On any other
// host, a failed connection stops further attempts for a few hours.
const SERVER_RETRY_AFTER_MS = 6 * 60 * 60 * 1000;
let serverUnreachableUntil = 0;

/** True when this server should not call data.gov.in. Never true in a browser. */
export function dataGovBlocked(): boolean {
  if (typeof window !== "undefined") return false;
  return !!process.env.VERCEL || Date.now() < serverUnreachableUntil;
}

/** fetch() for data.gov.in that remembers when the server's connection is refused or dropped. */
export async function dataGovFetch(url: string, timeoutMs: number): Promise<Response> {
  if (dataGovBlocked()) throw new Error("data.gov.in is not reachable from this server");
  try {
    return await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  } catch (err) {
    if (typeof window === "undefined") serverUnreachableUntil = Date.now() + SERVER_RETRY_AFTER_MS;
    throw err;
  }
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
    "api-key": agmarknetKey(),
    format: "json",
    limit: String(MAX_RECORDS),
    "filters[state.keyword]": agState,
  });
  const res = await dataGovFetch(`${RESOURCE_URL}?${params}`, 15000);
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

/** "fetch failed" alone says nothing; Node puts the real reason (ETIMEDOUT, ECONNRESET, …) in `cause`. */
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = (err as Error & { cause?: { code?: string; message?: string } }).cause;
  return cause ? `${err.message} (${cause.code || cause.message || "unknown cause"})` : err.message;
}
