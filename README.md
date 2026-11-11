# AgriPredict

AI-assisted agricultural market intelligence for Indian farmers: official mandi prices, a 30-day
price forecast, weather, government schemes, a document scanner and a voice chatbot, in six
languages (English, Tamil, Telugu, Kannada, Malayalam, Hindi).

Built with Next.js 16, React 19 and TypeScript. `PROJECT_DETAILS.md` describes every screen and
module in depth.

## Features

- **Mandi prices** — today's official APMC prices from Agmarknet (data.gov.in), compared across
  nearby mandis.
- **Price history and forecast** — official daily prices for a crop in the user's state, a 30-day
  forecast with an 80% band, and the forecast's measured accuracy. See [Forecasting](#forecasting).
- **AgriBot** — a chatbot with voice input and output, powered by Groq, with an offline fallback.
- **Document scanner** — explains farm documents (soil cards, receipts, loan letters) using a Groq
  vision model.
- **Price alerts** — push notifications when a crop crosses a price you set.
- **Schemes and tools** — government schemes, a KCC loan calculator, a PM-Kisan tracker, a crop
  calendar and a cost/profit estimator.
- **Installable** — works as a Progressive Web App on a phone's home screen.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the keys you have
npm run dev
```

Open http://localhost:3000.

Every key is optional except Supabase, which the login needs. Without a key the feature that uses
it falls back to an offline or simulated mode that is labelled as such in the UI.

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Login and per-user data. Run `supabase/schema.sql` in the project once. |
| `DATA_GOV_API_KEY` | Official Agmarknet prices and price history (free key from data.gov.in). |
| `GROQ_API_KEY` | AgriBot answers and the document scanner. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Push notifications. Generate keys with `node scripts/gen_vapid.cjs`. |
| `SUPABASE_SECRET_KEY`, `PUSH_ADMIN_TOKEN` | Optional: durable push subscriptions and broadcast pushes. |

## Install on a phone

AgriPredict is a Progressive Web App, so it installs from the browser without an app store. The
site must be served over HTTPS (any deployment; `localhost` also works for testing).

- **Android (Chrome, Edge, Samsung Internet):** open the site and tap **Install** on the banner
  at the bottom, or use the browser menu → *Add to Home screen* / *Install app*.
- **iPhone and iPad (Safari):** tap **Share**, then *Add to Home Screen*.

The app then opens full-screen from its own icon and can receive price-alert notifications. It
needs an internet connection; there is no offline mode.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Node's built-in test runner, no extra dependencies) |

GitHub Actions runs lint, the type check, the tests and a build on every push and pull request.

## Forecasting

`/api/price-history?crop=<id>&state=<state>` returns the history, forecast and accuracy for a crop.

1. **Data.** Daily records come from Agmarknet's "Variety-wise Daily Market Prices" dataset on
   data.gov.in. Each day is reduced to the median modal price across the state's mandis that
   reported, and days nobody reported are interpolated (`src/lib/priceHistory.ts`).
2. **Model.** Damped-trend Holt exponential smoothing fitted to log prices; the smoothing
   parameters are chosen by grid search on one-step-ahead error. The 80% band comes from the
   model's own residuals and widens with the horizon (`src/lib/forecast.ts`).
3. **Accuracy.** A rolling-origin backtest hides the last 14 days (four times, moving back),
   forecasts them from the earlier data only, and reports MAE, RMSE and MAPE next to the error of
   a "no change" guess. The Analytics page shows these numbers.

Limits worth knowing:

- Commodity prices are close to a random walk, so the model is usually about as accurate as the
  "no change" guess; the backtest shows this honestly per crop. The forecast is a guide, not
  advice to buy or sell.
- Official history is used only when the crop is priced per quintal, has at least 45 days of data
  in the state, and traded within the last 14 days. Otherwise the screens show a simulated series
  marked "simulated" (for example, wheat outside its marketing season).
- The small price ticker on the crop lists is a simulated walk around a reference price, not an
  official quote.

## API protection

- `/api/chat` and `/api/ocr` spend Groq quota, so they require a signed-in Supabase user
  (`Authorization: Bearer <access token>`), checked in `src/lib/apiGuard.ts`.
- All data routes are rate limited per IP address (`src/lib/rateLimit.ts`). The limiter is kept in
  memory, so on serverless hosting it caps abuse per instance rather than enforcing an exact quota.

## Project layout

```
src/app/          pages and API routes
src/components/   UI components
src/lib/          data, services and helpers (forecast, Agmarknet, Groq, Supabase, i18n)
supabase/         database schema with row level security
tests/            unit tests
public/           PWA manifest, service worker, icons
```
