// Price forecasting: damped-trend Holt exponential smoothing fitted to a daily price series,
// with prediction intervals from the one-step residuals and a rolling-origin backtest.
// Pure functions with no imports, so they run unchanged on the server, in the browser and in tests.

export interface DailyPrice {
  date: string; // ISO yyyy-mm-dd
  price: number;
  markets?: number; // mandis that reported on this day (official data only)
}

export interface ForecastPoint {
  date: string; // ISO yyyy-mm-dd
  predicted: number;
  lower: number;
  upper: number;
}

export interface HoltParams {
  alpha: number; // level smoothing
  beta: number; // trend smoothing
  phi: number; // trend damping
}

export interface BacktestMetrics {
  mae: number;
  rmse: number;
  mape: number; // percent
  naiveMape: number; // percent, for "tomorrow = today" over the same days
  r2: number;
  horizon: number; // days ahead predicted in each fold
  folds: number;
  samples: number;
}

export interface PriceSeries {
  source: "agmarknet" | "simulated";
  scope: string; // state name, "All India", or "" for simulated
  commodity: string;
  history: DailyPrice[];
  forecast: ForecastPoint[];
  params: HoltParams | null;
  metrics: BacktestMetrics | null;
  // Why the official series could not be used (set only on simulated fallbacks)
  unavailableReason?: string;
}

export const FORECAST_DAYS = 30;
const MIN_TRAIN_DAYS = 30;
// 80% prediction interval
const Z_80 = 1.2816;

const ALPHAS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const BETAS = [0, 0.05, 0.1, 0.2, 0.3];
const PHIS = [0.8, 0.9, 0.95];

const DAY_MS = 24 * 60 * 60 * 1000;

function toTime(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function addDays(iso: string, days: number): string {
  return new Date(toTime(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Sorts by date, keeps one point per day, and linearly interpolates the days nobody reported. */
export function fillDailyGaps(points: DailyPrice[]): DailyPrice[] {
  const byDate = new Map<string, DailyPrice>();
  for (const p of points) {
    if (Number.isFinite(p.price) && p.price > 0 && Number.isFinite(toTime(p.date))) byDate.set(p.date, p);
  }
  const sorted = [...byDate.values()].sort((a, b) => toTime(a.date) - toTime(b.date));
  const out: DailyPrice[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    if (i > 0) {
      const prev = sorted[i - 1];
      const gap = Math.round((toTime(cur.date) - toTime(prev.date)) / DAY_MS);
      for (let d = 1; d < gap; d++) {
        out.push({ date: addDays(prev.date, d), price: prev.price + ((cur.price - prev.price) * d) / gap, markets: 0 });
      }
    }
    out.push(cur);
  }
  return out;
}

function toIso(ddmmyyyy: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmyyyy.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Agmarknet records (Arrival_Date dd/mm/yyyy, Modal_Price, Market) → one point per day: the median
 * modal price across the mandis that reported, for the last `maxDays` days.
 */
export function aggregateDaily(records: Record<string, unknown>[], maxDays: number = 365, today: string = todayIso()): DailyPrice[] {
  const byDate = new Map<string, { prices: number[]; markets: Set<string> }>();
  for (const r of records) {
    const date = toIso(String(r.Arrival_Date ?? ""));
    const price = Number(r.Modal_Price);
    if (!date || !Number.isFinite(price) || price <= 0 || date > today) continue;
    const day = byDate.get(date) ?? { prices: [], markets: new Set<string>() };
    day.prices.push(price);
    day.markets.add(String(r.Market ?? ""));
    byDate.set(date, day);
  }
  const oldest = addDays(today, -maxDays);
  return [...byDate.entries()]
    .filter(([date]) => date >= oldest)
    .map(([date, day]) => ({ date, price: median(day.prices), markets: day.markets.size }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

interface HoltFit {
  level: number;
  trend: number;
  sse: number;
  residuals: number;
}

function fitHolt(values: number[], { alpha, beta, phi }: HoltParams): HoltFit {
  let level = values[0];
  // Average early slope, so one noisy first step doesn't set the trend
  const lead = Math.min(5, values.length - 1);
  let trend = lead > 0 ? (values[lead] - values[0]) / lead : 0;
  let sse = 0;
  for (let t = 1; t < values.length; t++) {
    const predicted = level + phi * trend;
    const error = values[t] - predicted;
    sse += error * error;
    const nextLevel = alpha * values[t] + (1 - alpha) * predicted;
    trend = beta * (nextLevel - level) + (1 - beta) * phi * trend;
    level = nextLevel;
  }
  return { level, trend, sse, residuals: values.length - 1 };
}

/** Grid-searches the smoothing parameters that minimise one-step-ahead squared error. */
export function optimizeHolt(values: number[]): HoltParams {
  let best: HoltParams = { alpha: 0.3, beta: 0.1, phi: 0.9 };
  let bestSse = Infinity;
  for (const alpha of ALPHAS) {
    for (const beta of BETAS) {
      for (const phi of PHIS) {
        const { sse } = fitHolt(values, { alpha, beta, phi });
        if (sse < bestSse) {
          bestSse = sse;
          best = { alpha, beta, phi };
        }
      }
    }
  }
  return best;
}

export interface HoltForecast {
  predicted: number[];
  // 80% prediction interval at each step
  lower: number[];
  upper: number[];
  params: HoltParams;
}

/**
 * Forecasts `horizon` steps past the end of `values` (positive prices; needs at least 2).
 * The model is fitted to log prices, so errors are proportional and the band can't go below zero.
 */
export function forecastValues(values: number[], horizon: number, params?: HoltParams): HoltForecast {
  if (values.length < 2) throw new Error("forecastValues needs at least 2 values");
  const logs = values.map(v => Math.log(Math.max(v, 1e-6)));
  const p = params ?? optimizeHolt(logs);
  const fit = fitHolt(logs, p);
  const sigma1 = Math.sqrt(fit.sse / Math.max(1, fit.residuals));
  const predicted: number[] = [];
  const lower: number[] = [];
  const upper: number[] = [];
  let phiSum = 0;
  let variance = 1;
  for (let h = 1; h <= horizon; h++) {
    if (h > 1) {
      // Error accumulates with the horizon: var_h = sigma² · (1 + Σ c_j²), c_j = α(1 + β·(φ + … + φ^j))
      const c = p.alpha * (1 + p.beta * phiSum);
      variance += c * c;
    }
    phiSum += Math.pow(p.phi, h);
    const mean = fit.level + phiSum * fit.trend;
    const spread = Z_80 * sigma1 * Math.sqrt(variance);
    predicted.push(Math.exp(mean));
    lower.push(Math.exp(mean - spread));
    upper.push(Math.exp(mean + spread));
  }
  return { predicted, lower, upper, params: p };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Forecast with an 80% prediction band, dated from the day after the last history point. */
export function forecastSeries(history: DailyPrice[], horizon: number = FORECAST_DAYS): { points: ForecastPoint[]; params: HoltParams } | null {
  const daily = fillDailyGaps(history);
  if (daily.length < 2) return null;
  const { predicted, lower, upper, params } = forecastValues(daily.map(d => d.price), horizon);
  const last = daily[daily.length - 1].date;
  const points = predicted.map((value, i) => ({
    date: addDays(last, i + 1),
    predicted: round2(value),
    lower: round2(lower[i]),
    upper: round2(upper[i]),
  }));
  return { points, params };
}

/**
 * Rolling-origin backtest: hides the last `horizon` days (then the `horizon` before that, …),
 * forecasts them from the earlier data only, and scores the forecast against what really happened.
 * Returns null when there is too little history to hold any days out.
 */
export function backtest(history: DailyPrice[], horizon: number = 14, maxFolds: number = 4): BacktestMetrics | null {
  const values = fillDailyGaps(history).map(d => d.price);
  let absErr = 0;
  let sqErr = 0;
  let pctErr = 0;
  let naivePctErr = 0;
  let samples = 0;
  let folds = 0;
  const actuals: number[] = [];

  for (let k = 1; k <= maxFolds; k++) {
    const cut = values.length - k * horizon;
    if (cut < MIN_TRAIN_DAYS) break;
    const train = values.slice(0, cut);
    const test = values.slice(cut, cut + horizon);
    const { predicted } = forecastValues(train, horizon);
    const naive = train[train.length - 1];
    test.forEach((actual, i) => {
      const err = actual - predicted[i];
      absErr += Math.abs(err);
      sqErr += err * err;
      pctErr += Math.abs(err) / actual;
      naivePctErr += Math.abs(actual - naive) / actual;
      actuals.push(actual);
      samples++;
    });
    folds++;
  }
  if (samples === 0) return null;

  const mean = actuals.reduce((s, v) => s + v, 0) / samples;
  const ssTot = actuals.reduce((s, v) => s + (v - mean) ** 2, 0);
  return {
    mae: round2(absErr / samples),
    rmse: round2(Math.sqrt(sqErr / samples)),
    mape: round2((pctErr / samples) * 100),
    naiveMape: round2((naivePctErr / samples) * 100),
    r2: ssTot > 0 ? round2(1 - sqErr / ssTot) : 0,
    horizon,
    folds,
    samples,
  };
}

/** Deterministic pseudo-random numbers in [0, 1) from a text seed (mulberry32). */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stand-in history for when official prices are unavailable: a mean-reverting walk around
 * `basePrice`. The same seed always gives the same series, so charts don't change between renders.
 */
export function simulateHistory(seed: string, basePrice: number, days: number, endIso: string = todayIso()): DailyPrice[] {
  const random = seededRandom(seed);
  const out: DailyPrice[] = [];
  let price = basePrice * (0.92 + random() * 0.16);
  for (let i = days; i >= 0; i--) {
    const shock = (random() - 0.5) * basePrice * 0.03;
    const pull = (basePrice - price) * 0.03;
    price = Math.max(basePrice * 0.7, Math.min(basePrice * 1.4, price + shock + pull));
    out.push({ date: addDays(endIso, -i), price: round2(price) });
  }
  return out;
}

/** History + forecast + backtest for one series; used for both official and simulated history. */
export function buildPriceSeries(
  history: DailyPrice[],
  meta: { source: PriceSeries["source"]; scope: string; commodity: string }
): PriceSeries {
  const daily = fillDailyGaps(history);
  const fc = forecastSeries(daily);
  return {
    ...meta,
    history: daily.map(d => ({ date: d.date, price: round2(d.price), markets: d.markets ?? 0 })),
    forecast: fc?.points ?? [],
    params: fc?.params ?? null,
    metrics: backtest(daily),
  };
}

export function simulatedPriceSeries(cropId: string, basePrice: number, days: number = 365, endIso?: string): PriceSeries {
  return buildPriceSeries(simulateHistory(cropId, basePrice, days, endIso), { source: "simulated", scope: "", commodity: "" });
}
