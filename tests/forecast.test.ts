import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addDays, aggregateDaily, backtest, buildPriceSeries, fillDailyGaps, forecastSeries, forecastValues,
  optimizeHolt, seededRandom, simulateHistory, simulatedPriceSeries, type DailyPrice,
} from "../src/lib/forecast.ts";

function series(values: number[], start = "2026-01-01"): DailyPrice[] {
  return values.map((price, i) => ({ date: addDays(start, i), price }));
}

test("addDays crosses month and year boundaries", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
});

test("fillDailyGaps sorts, dedupes and interpolates missing days", () => {
  const filled = fillDailyGaps([
    { date: "2026-03-05", price: 500 },
    { date: "2026-03-01", price: 100 },
    { date: "2026-03-01", price: 100 },
    { date: "2026-03-02", price: -5 },
  ]);
  assert.deepEqual(filled.map(p => p.date), ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04", "2026-03-05"]);
  assert.deepEqual(filled.map(p => p.price), [100, 200, 300, 400, 500]);
});

test("a flat series forecasts flat with a zero-width band", () => {
  const fc = forecastSeries(series(Array(60).fill(2000)), 30);
  assert.ok(fc);
  assert.equal(fc.points.length, 30);
  for (const p of fc.points) {
    assert.equal(p.predicted, 2000);
    assert.equal(p.lower, 2000);
    assert.equal(p.upper, 2000);
  }
  assert.equal(fc.points[0].date, addDays("2026-01-01", 60));
});

test("a rising series forecasts higher, and damping keeps it below the straight line", () => {
  const values = Array.from({ length: 90 }, (_, i) => 1000 + 10 * i);
  const { predicted } = forecastValues(values, 30);
  const last = values[values.length - 1];
  assert.ok(predicted[0] > last);
  assert.ok(predicted[29] > predicted[0]);
  assert.ok(predicted[29] < last + 10 * 30);
});

test("the prediction band widens with the horizon and contains the forecast", () => {
  const fc = forecastSeries(simulateHistory("tomato", 2000, 200, "2026-06-30"), 30);
  assert.ok(fc);
  const width = (i: number) => fc.points[i].upper - fc.points[i].lower;
  assert.ok(width(29) > width(0));
  for (const p of fc.points) {
    assert.ok(p.lower <= p.predicted && p.predicted <= p.upper);
    assert.ok(p.lower >= 0);
  }
});

test("optimizeHolt picks parameters from the grid", () => {
  const p = optimizeHolt(simulateHistory("onion", 1800, 120, "2026-06-30").map(d => d.price));
  assert.ok(p.alpha >= 0.1 && p.alpha <= 0.9);
  assert.ok(p.beta >= 0 && p.beta <= 0.3);
  assert.ok(p.phi >= 0.8 && p.phi <= 0.95);
});

test("forecastValues rejects a series that is too short", () => {
  assert.throws(() => forecastValues([100], 5));
  assert.equal(forecastSeries(series([100])), null);
});

test("backtest scores a predictable series as accurate", () => {
  const m = backtest(series(Array.from({ length: 150 }, (_, i) => 1000 + 5 * i)));
  assert.ok(m);
  assert.equal(m.folds, 4);
  assert.equal(m.samples, 56);
  assert.ok(m.mape < 3, `mape ${m.mape}`);
  // A trend model must beat "tomorrow = today" on a steady trend
  assert.ok(m.mape < m.naiveMape);
});

test("backtest returns null without enough history to hold days out", () => {
  assert.equal(backtest(series(Array(40).fill(100))), null);
});

test("backtest never trains on the days it is scored on", () => {
  const base = Array.from({ length: 100 }, (_, i) => 1000 + 2 * i);
  const spiked = [...base.slice(0, 86), ...base.slice(86).map(v => v * 3)];
  const m1 = backtest(series(base), 14, 1);
  const m2 = backtest(series(spiked), 14, 1);
  assert.ok(m1 && m2);
  // Only the held-out days changed, so the error must grow: the model could not have seen them
  assert.ok(m2.mae > m1.mae * 10);
});

test("seededRandom is repeatable and stays in [0, 1)", () => {
  const a = seededRandom("rice");
  const b = seededRandom("rice");
  const c = seededRandom("wheat");
  const xs = Array.from({ length: 50 }, () => a());
  assert.deepEqual(xs, Array.from({ length: 50 }, () => b()));
  assert.notDeepEqual(xs.slice(0, 5), Array.from({ length: 5 }, () => c()));
  assert.ok(xs.every(x => x >= 0 && x < 1));
});

test("simulateHistory is deterministic, daily and bounded", () => {
  const a = simulateHistory("rice", 2200, 90, "2026-06-30");
  assert.deepEqual(a, simulateHistory("rice", 2200, 90, "2026-06-30"));
  assert.equal(a.length, 91);
  assert.equal(a[a.length - 1].date, "2026-06-30");
  assert.ok(a.every(p => p.price >= 2200 * 0.7 && p.price <= 2200 * 1.4));
});

test("buildPriceSeries returns history, a 30-day forecast and metrics", () => {
  const s = buildPriceSeries(simulateHistory("wheat", 2400, 200, "2026-06-30"), { source: "agmarknet", scope: "Punjab", commodity: "Wheat" });
  assert.equal(s.source, "agmarknet");
  assert.equal(s.history.length, 201);
  assert.equal(s.forecast.length, 30);
  assert.equal(s.forecast[0].date, "2026-07-01");
  assert.ok(s.params && s.metrics);
  assert.equal(simulatedPriceSeries("wheat", 2400, 200, "2026-06-30").source, "simulated");
});

test("aggregateDaily takes the daily median across mandis and skips bad rows", () => {
  const daily = aggregateDaily([
    { Arrival_Date: "10/11/2026", Modal_Price: 1500, Market: "A" },
    { Arrival_Date: "10/11/2026", Modal_Price: "1700", Market: "B" },
    { Arrival_Date: "10/11/2026", Modal_Price: 9000, Market: "B" },
    { Arrival_Date: "09/11/2026", Modal_Price: 1400, Market: "A" },
    { Arrival_Date: "09/11/2026", Modal_Price: 1600, Market: "C" },
    { Arrival_Date: "08/11/2026", Modal_Price: 0, Market: "A" },
    { Arrival_Date: "not a date", Modal_Price: 1500, Market: "A" },
    { Arrival_Date: "12/11/2026", Modal_Price: 1500, Market: "A" },
    { Arrival_Date: "01/01/2020", Modal_Price: 1500, Market: "A" },
  ], 365, "2026-11-11");
  assert.deepEqual(daily, [
    { date: "2026-11-09", price: 1500, markets: 2 },
    { date: "2026-11-10", price: 1700, markets: 2 },
  ]);
});
