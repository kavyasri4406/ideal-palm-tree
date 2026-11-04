# AgriPredict – Complete Project Guide

_Everything about the project — what each part does, **why** it exists and **how** it works — written for project reviews and the viva. Generated from the actual source code on 3 Nov 2026._

## Contents

1. [Overview, tech stack, folders, setup & deployment](#1-overview-tech-stack-folders-setup--deployment)
2. [Crop data, prices, forecast & recommendation logic](#2-crop-data-prices-forecast--recommendation-logic)
3. [Live Agmarknet mandi prices](#3-live-agmarknet-mandi-prices)
4. [Login, database & security](#4-login-database--security)
5. [AgriBot chatbot, Groq LLM & document scanner](#5-agribot-chatbot-groq-llm--document-scanner)
6. [Price alerts, push notifications & app state](#6-price-alerts-push-notifications--app-state)
7. [Every page and screen, feature by feature](#7-every-page-and-screen-feature-by-feature)
8. [Languages, design system, quality & honest status](#8-languages-design-system-quality--honest-status)
9. [Other files and details](#9-other-files-and-details)


---

## 1. Overview, tech stack, folders, setup & deployment

### Project overview & engineering setup

> Note: `AGENTS.md` (included by `CLAUDE.md`) warns that this Next.js version is different from older ones: "APIs, conventions, and file structure may all differ". It tells developers to read the guides in `node_modules/next/dist/docs/` before writing code. The project uses **Next.js 16.2.10**, which is newer than most tutorials. Some patterns differ from older Next.js, for example the flat ESLint config and `@tailwindcss/postcss`.

---

### 1. What AgriPredict is

**WHAT:** AgriPredict is a web app (it can also be installed like a phone app) that gives Indian farmers market and farming information in one place. `README.md` describes it as "AI-assisted agricultural market intelligence for Indian farmers".

**WHY (the farmer's problems it targets):**

| Farmer problem | What AgriPredict offers |
|---|---|
| Farmers don't know today's price at nearby APMC mandis, so middlemen can underpay them | A mandi price comparison using official Agmarknet (data.gov.in) prices when a key is set. Otherwise it shows estimates that are clearly labelled |
| Hard to decide when to sell | Price history, a 30-day forecast and volatility views. **These are simulated estimates** and the README labels them that way |
| Weather risk | Live weather from Open-Meteo (`src/lib/weather.ts`), with a random fallback if the call fails |
| Many farmers are not comfortable in English | The whole UI comes in 6 languages (English, Tamil, Telugu, Kannada, Malayalam, Hindi), plus a voice chatbot (AgriBot) |
| Government schemes are hard to discover | A schemes portal (`src/app/schemes/page.tsx`) built on a hard-coded scheme dataset (`src/lib/governmentSchemesData.ts`) |
| Farm papers (receipts, soil cards and so on) are hard to read | A document scanner that uses a Groq vision AI model (`/api/ocr`) |
| Missing a good price | Price-threshold alerts with lock-screen Web Push notifications |

**HOW the home page works (`src/app/page.tsx`):**
- It is a client component (`"use client"`) called `DashboardIntroPage`.
- It greets the signed-in user by name ("Namaste, <name>! 🙏"). The name comes from `getCurrentUser()` in `src/lib/auth.ts`, which reads a profile cached in localStorage.
- All text comes from a `LABELS` object with 6 language blocks (`en, ta, te, kn, ml, hi`). The language is chosen by `useApp().language` from `src/lib/AppContext.tsx`. If a language is missing, it falls back to `LABELS.en`.
- It shows 4 feature cards: **Live Crop Prices** → `/crops`, **AgriBot** → `/chatbot`, **Market Analytics** → `/analytics`, **My Tracked Crops** → `/my-crops`.
- In a `useEffect`, it calls `router.prefetch()` on 8 routes (`/crops, /my-crops, /analytics, /schemes, /tools, /chatbot, /documents, /settings`). This preloads those pages so moving to them feels instant on slow rural networks.

**App shell (`src/app/layout.tsx` + `src/components/ClientLayout.tsx`):**
- `layout.tsx` sets the SEO metadata, links `/manifest.json`, sets the icons (`/icon.png`), the Apple web-app settings and the theme colour `#5C7A3E`. It then wraps every page in `<AppProvider>` (shared global state) and `<ClientLayout>`.
- `ClientLayout` is the **login guard**. `/login` is the only public route (`PUBLIC = ["/login"]`). On any other route with no cached user, it calls `router.replace("/login")`. Until it knows, it shows a "Loading AgriPredict..." screen.
- It uses `useSyncExternalStore` to know when the page is running in the browser. This avoids a "hydration mismatch", which is when the HTML from the server differs from the first browser render.
- `syncSession()` from `auth.ts` re-renders the app when the Supabase session changes, for example when it expires or the user logs out in another tab.
- It also renders the mobile top header (hamburger menu, logo, notification bell), the `Sidebar`, a dark backdrop for the mobile menu, and a global toast popup. The toast icon depends on its type: 💰 price, 🌦️ weather, 🔔 other.

---

### 2. Tech stack (versions and why each was chosen)

From `package.json` (`"engines": { "node": ">=20.9.0" }`):

**Runtime dependencies**

| Package | Version | What it does here | Why chosen |
|---|---|---|---|
| `next` | 16.2.10 | Framework: page routing (App Router) plus server API routes in `src/app/api/*` | Frontend and backend in one project. API keys (Groq, data.gov.in, VAPID private key) stay on the server. Deploys easily to Vercel |
| `react` / `react-dom` | 19.2.4 | UI library | Required by Next 16. Provides hooks such as `useSyncExternalStore` |
| `@supabase/supabase-js` | ^2.118.0 | Login (Supabase Auth) and the `profiles` / `push_subscriptions` tables | Free hosted Postgres with built-in auth and Row Level Security. Passwords are never stored in the browser |
| `recharts` | ^3.9.2 | Charts on `analytics/page.tsx`, `crop/[name]/page.tsx` and `PortfolioPerformanceGraph.tsx` | Simple React chart components (line and area charts) |
| `web-push` | ^3.6.7 | Server-side sending of push notifications signed with VAPID keys (`src/lib/pushSubscriptionStore.ts`) | Standard Node library for the Web Push protocol. It works without Firebase |
| `date-fns` | ^4.4.0 | **Listed but not imported anywhere in `src/`** | Unused dependency. It could be removed |
| `lucide-react` | ^1.24.0 | **Listed but not imported anywhere in `src/`** | Unused. The UI uses emoji for icons instead |

**Dev dependencies**

| Package | Version | Why |
|---|---|---|
| `typescript` | ^5 | Catches type errors before runtime |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/web-push` | ^20 / ^19 / ^19 / ^3.6.4 | Type definitions for these libraries |
| `tailwindcss` + `@tailwindcss/postcss` | ^4 | Tailwind v4 is loaded through PostCSS |
| `eslint` + `eslint-config-next` | ^9 / 16.2.10 | Code-quality rules that match this Next version |

**Config files**
- **`postcss.config.mjs`**: loads only the `@tailwindcss/postcss` plugin (the Tailwind v4 way; there is no `tailwind.config.js`).
- **`src/app/globals.css`**: starts with `@import "tailwindcss";` and a Google Fonts import (Inter and Playfair Display). In practice, most styling is **inline `style={{}}` objects plus custom CSS variables** such as `--primary: #5C7A3E` and `--bg: #FAF7F2` (a "warm earthy palette"). It also uses custom classes like `card`, `crop-card`, `btn` and `grid-cols-4-responsive`. Tailwind utility classes are rarely used.
- **`tsconfig.json`**: `strict: true` (strictest type checking), `noEmit` (Next compiles the code, not `tsc`), `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `allowJs`, `resolveJsonModule`. Path alias `@/*` → `./src/*`, so imports look like `@/lib/auth` instead of `../../lib/auth`.
- **`eslint.config.mjs`**: the new "flat config" format (ESLint 9). It combines `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. It ignores `.next/`, `out/`, `build/`, `next-env.d.ts` and `scratch/`. It turns off `no-require-imports` for CommonJS scripts (`*.cjs`, `scripts/**/*.js`). It tells ESLint that `public/sw.js` runs in a service-worker scope, where `self` and `clients` exist.
- **`.vscode/launch.json`**: two VS Code debug setups. "debug server-side" runs `npm run dev`; "debug client-side" opens Chrome at `http://localhost:3000`.
- **`.claude/launch.json`**: dev-server preview setups (`agripredict-dev` = `npm run dev`, `agripredict-prod` = `npm start`, both on port 3000).

---

### 3. Folder structure

```
agripredict/
├─ src/app/                 Pages and API routes (App Router: folder = URL)
├─ src/components/          Reusable UI widgets
├─ src/lib/                 Data, business logic and API clients
├─ public/                  Static files served as-is (icons, manifest, service worker, PDFs)
├─ supabase/schema.sql      Database tables and security rules
├─ scripts/                 Helper scripts (VAPID key generator, one-off scripts)
├─ data/                    Local push-subscription file (git-ignored)
└─ config files             package.json, next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs, .env.example
```

**`src/app` (pages)**

| Path | What it is |
|---|---|
| `layout.tsx` | Root HTML, metadata, PWA links, `AppProvider` + `ClientLayout` |
| `page.tsx` | Home / welcome dashboard with 4 feature cards |
| `globals.css` | Theme colours, fonts, shared CSS classes, Tailwind import |
| `login/page.tsx` | Register / login through Supabase Auth, translated messages |
| `crops/page.tsx` | Crop price list with category and season filters |
| `crop/[name]/page.tsx` | Detail page for one crop (dynamic route): charts, factors, mandi comparison |
| `my-crops/page.tsx` | The user's tracked crop portfolio |
| `analytics/page.tsx` | Forecast and volatility charts. **Its own code comments say the model evaluation is "Simulated"** |
| `chatbot/page.tsx` | AgriBot chat with voice input through the browser Web Speech API |
| `schemes/page.tsx` | Government schemes portal (2,826 lines: schemes, alerts, nearby help centres) |
| `tools/page.tsx` | Farmer tools (transport/arbitrage calculator, crop calendar, a **"Leaf scanner simulation"** for pests, weather risk) |
| `documents/page.tsx` | Wraps the `DocumentOcr` component |
| `settings/page.tsx` | Profile, avatar, language and location settings |
| `favicon.ico` | Browser tab icon |

**`src/app/api` (server endpoints)**

| Route | What it does |
|---|---|
| `chat/route.ts` | `POST`: AgriBot answers through Groq. Tries `GROQ_TEXT_MODEL` (default `qwen/qwen3.8-27b`), then `openai/gpt-oss-20b`; uses an offline fallback otherwise. `maxDuration = 60` |
| `mandi-prices/route.ts` | `GET`: mandi prices. Agmarknet first, then a Groq AI estimate, then a model estimate based on each crop's base price |
| `ocr/route.ts` | Document scanner: an image goes to the vision model, a PDF's extracted text goes to the text models. `maxDuration = 60` |
| `notifications/subscribe/route.ts` | `GET` VAPID public key, `POST` save a subscription, `DELETE` remove one |
| `notifications/send/route.ts` | `POST` send a push, either to this device or broadcast to everyone with the admin token |

**`src/components`**

| File | Purpose |
|---|---|
| `ClientLayout.tsx` | Login guard, mobile header, sidebar, toast |
| `Sidebar.tsx` | Navigation menu (slides in on mobile) |
| `NotificationManager.tsx` | Bell button: registers `/sw.js`, subscribes to push |
| `PriceAlertModal.tsx` | Create price-threshold alerts |
| `MandiComparison.tsx` | Compare prices across mandis in a district |
| `MarketHeatmap.tsx` | Price heatmap view |
| `VolatilityAlerts.tsx` | Fixed advisory messages about volatile crops |
| `PortfolioPerformanceGraph.tsx` | Recharts graph of the tracked crops |
| `CostProfitEstimator.tsx` | Per-acre cost / profit calculator (only crops that have cost data) |
| `CropCalendar.tsx` | Sowing / harvest calendar with localized advisories |
| `KccCalculator.tsx` | Kisan Credit Card loan calculator |
| `PmKisanTracker.tsx` | PM-KISAN info. **Marked "DEMO ONLY"**: it never asks for Aadhaar and sends users to the official portal |
| `DocumentOcr.tsx` | Upload UI. Shrinks images in the browser to at most 1200 px before upload |
| `NearbyFarmerNetwork.tsx` | Small (84-line) nearby-farmers widget |

**`src/lib`**

| File | Purpose |
|---|---|
| `AppContext.tsx` | Global state: language, location, toast. Reverse-geocodes GPS coordinates through `api.bigdatacloud.net` |
| `auth.ts` | Supabase login/register. Caches the profile in localStorage and writes changes to `profiles` |
| `supabase.ts` | Browser Supabase client (publishable key only). Returns `null` if not configured |
| `groq.ts` | Minimal Groq client (`https://api.groq.com/openai/v1/chat/completions`), 30 s default timeout, `parseJsonReply()` |
| `agmarknet.ts` | data.gov.in client for official daily APMC prices (₹/quintal). 15 s timeout, in-memory cache of 1 hour per state |
| `priceDate.ts` | Formats Agmarknet's `dd/mm/yyyy` dates, and labels morning data as the previous day's |
| `cropData.ts` | Hard-coded crop catalogue (prices, MSP, images, seasons). Comment: "Simulate live price with small random walk" |
| `mandiDatabase.ts` | Hard-coded list of APMC mandis per district |
| `locationData.ts` | States and districts with latitude/longitude |
| `weather.ts` | Open-Meteo 7-day forecast. Falls back to random values on failure. The soil-moisture index is partly random |
| `chatbot.ts` | Language detection and keyword-matching offline answers |
| `priceAlerts.ts` | Stores and checks price-threshold alerts |
| `pushClient.ts` | Browser helpers: this device's push endpoint, notify-self |
| `pushSubscriptionStore.ts` | Server storage of push subscriptions (Supabase, or file/memory fallback) and sending with `web-push` |
| `i18n.ts` | `tr()` translation helper and localized crop names (falls back to English) |
| `appTranslations.ts`, `schemeTranslations.ts` | UI and scheme translation tables |
| `governmentSchemesData.ts` | Hard-coded scheme dataset (1,584 lines) |

**Other folders**

| Path | What it is |
|---|---|
| `public/manifest.json`, `icon.png` (512), `icon-192.png` | PWA install files |
| `public/sw.js` | Service worker for push notifications |
| `public/*.pdf` | 3 architecture / feature guide PDFs (poster, overview, detailed guide) |
| `public/*.svg` | Default Next.js template SVGs (`next.svg`, `vercel.svg` and so on), not part of the app |
| `supabase/schema.sql` | Creates `profiles` and `push_subscriptions` with Row Level Security. Safe to re-run |
| `scripts/gen_vapid.cjs` | Prints a new VAPID key pair using `webpush.generateVAPIDKeys()` |
| `scripts/one-off/` | Old helper scripts (filling translations, fixing Telugu text, two Python scrapers / link checkers). Not used by the app |
| `data/` | Local `push_subscriptions.json` fallback. Git-ignored because it holds device endpoints |

**Database (`supabase/schema.sql`):**
- **`profiles` table:** `id` (linked to `auth.users`, deleted with the user), `email`, `name`, `state`, `district`, `role` (default `'Farmer'`), `avatar` (default 🌾), `portfolio` (default `rice, wheat, tomato, mustard`), `farm_profile` (jsonb), `created_at`.
  - Row Level Security policies `auth.uid() = id` mean each user can read, insert and update only their own row.
- **`push_subscriptions` table:** RLS is enabled with **no policies**, so only the server's secret key can access it.

---

### 4. Environment variables (`.env.example`)

Copy `.env.example` to `.env.local` and fill in the values. `.gitignore` ignores `.env*` except `.env.example`, so secrets are never committed.

| Variable | Enables | Without it |
|---|---|---|
| `GROQ_API_KEY` | AI answers in AgriBot, the document OCR and AI mandi estimates (`hasGroqKey()` in `groq.ts`) | Offline fallbacks: keyword answers in the chatbot, a generic OCR summary, model-based mandi estimates |
| `GROQ_TEXT_MODEL` (optional) | Overrides the text model (default `qwen/qwen3.8-27b`) | Default is used. `openai/gpt-oss-20b` is always the second choice |
| `GROQ_VISION_MODEL` (optional) | Overrides the image OCR model (must accept images) | Default `qwen/qwen3.8-27b` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` | Web Push lock-screen alerts (`webpush.setVapidDetails`) | Push is disabled. `/api/notifications/send` returns 503. No hard-coded fallback key on purpose, because anyone holding the private key could push to every subscriber |
| `VAPID_SUBJECT` | Contact email sent to push services | Defaults to `mailto:support@agripredict.in` |
| `PUSH_ADMIN_TOKEN` (optional) | Broadcast to **all** subscribers using `Authorization: Bearer <token>` | Broadcast returns 401. Devices can still notify themselves |
| `DATA_GOV_API_KEY` | Official Agmarknet daily mandi prices | Prices fall back to AI / model estimates, labelled "Estimated" |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Required.** Login and user profiles | `getSupabase()` returns `null` and login shows "Login service is not configured. Please try again later." Since every page except `/login` needs a user, the app is effectively unusable |
| `SUPABASE_SECRET_KEY` | Server-only. Stores push subscriptions durably in Supabase | Subscriptions go to `data/push_subscriptions.json`, or to the temp folder on Vercel, plus memory. They are lost on serverless cold starts |

What the `NEXT_PUBLIC_` prefix means: Next.js copies these values into the browser JavaScript. That is safe only for public values. Notes:
- The VAPID public key is in fact served to the browser by `GET /api/notifications/subscribe`; `NotificationManager.tsx` fetches it there.
- The secret / private keys have no prefix, so they never reach the browser.

---

### 5. Running locally

```bash
npm install                    # install dependencies (Node >= 20.9.0)
cp .env.example .env.local     # then fill in values; at least the Supabase pair
npm run dev                    # dev server at http://localhost:3000
npm run build                  # production build
npm start                      # serve the production build
npm run lint                   # ESLint
```

One-time setup:
- Run `supabase/schema.sql` in the Supabase SQL Editor.
- Generate push keys with `node scripts/gen_vapid.cjs`. It prints `PUBLIC_KEY=` and `PRIVATE_KEY=`.
- Then open `/login` and register. Supabase uses email confirmation.

---

### 6. Deployment on Vercel and serverless considerations

There is no `vercel.json`; Vercel detects Next.js automatically. On Vercel, each API route runs as a **serverless function**: a short-lived server that starts on demand. The code handles that in these ways:

- **Time limits (`maxDuration`):**
  - `api/chat/route.ts` and `api/ocr/route.ts` export `maxDuration = 60` (seconds), because Groq retries and vision OCR are slow.
  - Each route sets its own deadline a little earlier: chat `(maxDuration - 8) * 1000` ms, OCR `(maxDuration - 5) * 1000` ms. This leaves time to return the **offline fallback** instead of being killed by the platform.
  - Each Groq call is capped at `Math.min(30000, remainingMs)`.
- **Request body size limit:**
  - Vercel caps request bodies at about 4.5 MB. `ocr/route.ts` sets `MAX_UPLOAD_BYTES = 4 MB` for PDFs and `MAX_IMAGE_BYTES = 3,000,000` for images. Groq accepts base64 images up to 4 MB, and base64 makes data about 33% larger.
  - Uploads that are too big get HTTP **413**.
  - The browser also shrinks images to at most 1200 px (`DocumentOcr.tsx`), and PDFs are sent as extracted text.
- **Read-only filesystem:**
  - On Vercel, only the OS temp folder is writable, and it is wiped on cold starts. `pushSubscriptionStore.ts` uses `os.tmpdir()/agripredict` when `process.env.VERCEL` is set, and `./data` otherwise.
  - If writing fails, it switches to the temp folder. If even that fails, it keeps the subscriptions **in memory only**, so the request still succeeds.
  - This is why `SUPABASE_SECRET_KEY` is recommended in production.
- **In-memory caches are per instance:** the 1-hour Agmarknet cache in `agmarknet.ts` lives in one function instance. A cold start or another instance has to fetch again. A failed fetch is removed from the cache so it isn't reused.
- **Secrets:** set the same variables in Vercel → Project Settings → Environment Variables.

---

### 7. `next.config.ts`: security headers and image domains

**Security headers** apply to every route (`source: "/(.*)"`):

| Header | Value | Why |
|---|---|---|
| `X-Frame-Options` | `DENY` | No other site can embed AgriPredict in an iframe (stops "clickjacking") |
| `X-Content-Type-Options` | `nosniff` | The browser must trust the declared file type and not guess (stops some script-injection tricks) |
| `Referrer-Policy` | `origin-when-cross-origin` | Other sites see only the domain, not full URLs that may contain data |

**Image domains:** `images.remotePatterns` allows `https://images.unsplash.com` and `https://upload.wikimedia.org`, which are the hosts of the crop photos in `cropData.ts`. To be precise, this setting only affects the `next/image` component, and **no file in `src/` imports `next/image`**. The crop images are shown with plain `<img>` tags, so this config is currently unused.

---

### 8. PWA basics

A PWA (Progressive Web App) is a website that can be "installed" to the home screen and receive notifications.

**`public/manifest.json`**
- `name`: "AgriPredict — AI Agricultural Market Intelligence", `short_name`: "AgriPredict".
- `start_url: "/"`, `display: "standalone"` (opens without the browser bar), `orientation: "portrait-primary"`.
- Colours: `background_color #FAF7F2` and `theme_color #5C7A3E`, the same palette as `globals.css`.
- Icons: `/icon-192.png` (192×192) and `/icon.png` (512×512), both with `purpose: "any"`. Categories: agriculture, business, productivity, utilities.
- Honesty note: the description mentions "live weather radar" and "30-day AI price forecasts". In the code, weather is an Open-Meteo forecast (not radar), and the forecasts are simulated.

**`layout.tsx`** links the manifest and sets `appleWebApp.capable = true` for iOS home-screen install.

**`public/sw.js` (service worker = a background script the browser runs even when the page is closed)**
- **`install`** calls `skipWaiting()` and **`activate`** calls `clients.claim()`. Together they make a new version take over immediately.
- **`push`** reads the JSON payload. If it is not JSON, it uses the payload as plain text. It then shows a notification with:
  - default title "🌾 AgriPredict Alert", `icon` / `badge` `/icon.png`, vibration `[100, 50, 100]`;
  - `tag` default `"agripredict-alert"` with `renotify: true`, and two action buttons, "📊 View Details" and "✖ Close";
  - default target URL `/crops`.
- **`notificationclick`**: does nothing for "Close". Otherwise it opens the target URL only if it is **same-origin** (otherwise it opens the home page), which blocks phishing links. It focuses an already-open app window and navigates it, or opens a new window if navigation fails.
- **Registration**: `src/components/NotificationManager.tsx` calls `navigator.serviceWorker.register("/sw.js")` only when the user turns on notifications from the bell.
- On the server side, `api/notifications/send/route.ts` repeats the protection:
  - `safeAppPath()` accepts only paths starting with `/` and not `//`;
  - it trims title, body and tag to 120, 500 and 64 characters;
  - a device can notify only itself, by proving its endpoint is registered; broadcasting needs `PUSH_ADMIN_TOKEN`.
- **Limitation:** `sw.js` has no `fetch` handler and no caching. The app installs and receives push, but it **does not work offline**.


---

## 2. Crop data, prices, forecast & recommendation logic

### Crop data and price intelligence (`src/lib/cropData.ts`, `src/lib/locationData.ts`, `src/lib/priceDate.ts`)

`src/lib/cropData.ts` (1,365 lines) is the app's built-in crop database and its price "engine". It holds the static crop list and the functions that make simulated prices, history, forecasts, recommendations, mandi comparisons, risk scores and other tool data. It does not call any server or API. The only real market data in the app comes from the `/api/mandi-prices` route (Agmarknet). Some pages pull that real price in and use it to adjust the simulated numbers, as explained below.

> **Be honest about this in the viva:** almost every number this file produces is **simulated with `Math.random()` or hard-coded**. The "forecast" and the "AI Recommendation" (the label used on the Crops page) are **not trained machine-learning models**. The forecast is a random walk (each day's price = yesterday's price + a small random step) with a small upward tilt. The recommendation is a short list of if/else rules. This is a working prototype of the user experience. It is not a real prediction system.

---

### 1. The data model: `Crop` and `CropVariety`

**What:** two TypeScript interfaces that describe one crop and one named variety of a crop.

**Why:** one typed structure that every page shares (crop cards, crop detail page, calculators, chatbot) keeps names, prices and MSP the same everywhere.

**`Crop` fields**

| Field | Meaning |
|---|---|
| `id` | Short key used in URLs and lookups (`"rice"`, `"tur"` …) |
| `name` | English name (`"Rice (Paddy)"`) |
| `nameTA`, `nameTE` | Tamil and Telugu names (required) |
| `nameKN`, `nameML`, `nameHI` | Kannada, Malayalam, Hindi names (optional, not actually filled in the crop objects; see `CROP_TRANSLATIONS` below) |
| `category` | One of 7 categories (see below) |
| `unit` | Always `"quintal"` (1 quintal = 100 kg) |
| `basePrice` | ₹ per quintal. All simulations start from this "reference price" |
| `emoji`, `image`, `color` | Card emoji, image URL (Unsplash/Wikimedia) and accent colour |
| `description`, `descTA`, `descTE` | Short description in English, Tamil and Telugu |
| `season` | `"Kharif"`, `"Rabi"`, `"Annual"`, `"Summer"`, `"Zaid/Kharif"`, `"Rabi/Kharif"` |
| `states` | Main producing states (3–4 names) |
| `msp` | Government Minimum Support Price in ₹/quintal. **0 means no MSP** |
| `varieties?` | Optional list of `CropVariety` |

**`CropVariety` fields:** `id`, `name` (+ optional TA/TE/KN/ML/HI names), `mandiPricePerKg?` / `mandiPricePerQuintal?` (wholesale mandi price), `pricePerKg` / `pricePerQuintal` (retail market price), `originState`, `characteristics` (+ 5 translated versions), `season`.

- **Mandi price vs retail price:** the mandi price is what a farmer gets at the wholesale yard. The retail price is what a shop customer pays. On the Crops page (`src/app/crops/page.tsx`) a variety card shows both a "Mandi Wholesale" price and a "Retail Market" price when `mandiPricePerKg` is present. Otherwise it shows only the retail ₹/kg and ₹/quintal.
- The gap between the two shows the farmer how much value is lost to middlemen.

---

### 2. The 28 crops, 7 categories and MSP values

`CROPS` is a hard-coded array of **28 crops**. `CATEGORIES` is built from it as `["All", ...unique categories]`. `SEASONS` is a fixed list: `["All","Kharif","Rabi","Annual","Zaid/Kharif","Summer"]` (used as a filter in `src/app/my-crops/page.tsx`).

| Category | Count | Crops |
|---|---|---|
| Cereals | 3 | Rice, Wheat, Corn |
| Oilseeds | 3 | Mustard, Soybean, Groundnut |
| Cash Crops | 2 | Sugarcane, Cotton |
| Pulses | 3 | Gram, Tur, Moong |
| Vegetables | 8 | Tomato, Onion, Potato, Cabbage, Cauliflower, Brinjal, Okra, Carrot |
| Fruits | 7 | Banana, Mango, Apple, Papaya, Orange, Grapes, Pomegranate |
| Spices | 2 | Turmeric, Red Chilli |

**MSP / FRP:** the file itself does not say which year its MSP values are for. That year label appears in `src/app/api/chat/route.ts` ("Kharif 2026-27, Rabi 2027-28, sugarcane FRP 2026-27") and in `src/lib/chatbot.ts`. The chat route builds the AI's system prompt directly from `CROPS.filter(c => c.msp > 0)`, so the chatbot always quotes the same numbers as the rest of the app. For every MSP crop, `basePrice` is set equal to `msp`.

KMS means Kharif Marketing Season and RMS means Rabi Marketing Season. FRP is the Fair and Remunerative Price, sugarcane's version of MSP.

| # | Crop (`id`) | Category | Season | MSP ₹/q | basePrice ₹/q | Notes |
|---|---|---|---|---|---|---|
| 1 | Rice (Paddy) `rice` | Cereals | Kharif | **2,441** (KMS 2026-27) | 2,441 | 2 varieties |
| 2 | Wheat `wheat` | Cereals | Rabi | **2,610** (RMS 2027-28) | 2,610 | |
| 3 | Corn (Maize) `corn` | Cereals | Kharif | **2,410** (KMS) | 2,410 | 2 varieties |
| 4 | Mustard `mustard` | Oilseeds | Rabi | **6,613** (RMS) | 6,613 | |
| 5 | Soybean `soybean` | Oilseeds | Kharif | **5,708** (KMS) | 5,708 | |
| 6 | Groundnut `groundnut` | Oilseeds | Kharif | **7,517** (KMS) | 7,517 | |
| 7 | Sugarcane `sugarcane` | Cash Crops | Annual | **365** (FRP 2026-27) | 365 | stored in the `msp` field; 2 varieties |
| 8 | Cotton `cotton` | Cash Crops | Kharif | **8,267** (KMS) | 8,267 | 1 variety |
| 9 | Tomato `tomato` | Vegetables | Annual | 0 | 2,500 | 2 varieties |
| 10 | Onion `onion` | Vegetables | Rabi/Kharif | 0 | 3,000 | 2 varieties |
| 11 | Potato `potato` | Vegetables | Rabi | 0 | 1,844 | 2 varieties |
| 12 | Gram (Chana) `gram` | Pulses | Rabi | **5,958** (RMS) | 5,958 | |
| 13 | Tur Dal (Arhar) `tur` | Pulses | Kharif | **8,450** (KMS) | 8,450 | |
| 14 | Moong Dal `moong` | Pulses | Zaid/Kharif | **8,780** (KMS) | 8,780 | |
| 15 | Banana `banana` | Fruits | Annual | 0 | 1,300 | 3 varieties |
| 16 | Mango `mango` | Fruits | Summer | 0 | 4,500 | 5 varieties |
| 17 | Turmeric `turmeric` | Spices | Kharif | 0 | 13,500 | 1 variety |
| 18 | Red Chilli `chilli` | Spices | Kharif | 0 | 18,000 | 2 varieties |
| 19 | Cabbage `cabbage` | Vegetables | Rabi | 0 | 1,500 | |
| 20 | Cauliflower `cauliflower` | Vegetables | Rabi | 0 | 1,800 | |
| 21 | Brinjal `eggplant` | Vegetables | Annual | 0 | 2,000 | |
| 22 | Okra `okra` | Vegetables | Summer | 0 | 2,500 | |
| 23 | Carrot `carrot` | Vegetables | Rabi | 0 | 1,800 | |
| 24 | Apple `apple` | Fruits | Annual | 0 | 8,000 | 2 varieties |
| 25 | Papaya `papaya` | Fruits | Annual | 0 | 1,500 | |
| 26 | Orange `orange` | Fruits | Annual | 0 | 3,500 | |
| 27 | Grapes `grape` | Fruits | Annual | 0 | 4,000 | |
| 28 | Pomegranate `pomegranate` | Fruits | Annual | 0 | 6,000 | |

So **11 crops** have a support price (10 MSP plus the sugarcane FRP). The other 17 have `msp: 0` because the government does not fix MSP for vegetables, fruits or spices.

**Varieties (₹ per quintal, mandi → retail)**

| Crop | Variety | Mandi | Retail | Origin |
|---|---|---|---|---|
| Rice | Basmati 1121 | 6,500 | 9,500 | Punjab & Haryana |
| Rice | Sona Masoori (BPT 5204) | 3,200 | 4,800 | AP & Karnataka |
| Corn | American Sweet Corn | 1,400 | 3,000 | Karnataka & Maharashtra |
| Corn | Desi Yellow Maize | 1,700 | 2,200 | AP & Telangana |
| Sugarcane | Co 0238 | 320 | 380 | UP & Maharashtra |
| Sugarcane | Co 8603 (Amritha) | 300 | 360 | TN & Karnataka |
| Cotton | Bt Cotton (Bollgard II) | 6,200 | 7,500 | Gujarat & Telangana |
| Tomato | Desi / Country; Roma / Hybrid | – | 3,500; 2,800 | |
| Onion | Nashik Red; Shallots (Podisu) | – | 3,200; 5,500 | |
| Potato | Kufri Jyoti; Kufri Chipsona | – | 2,400; 2,800 | |
| Banana | Grand Naine; Red (Yelakki); Nendran | 1,100; 2,800; 2,000 | 2,500; 6,500; 4,500 | |
| Mango | Alphonso; Gir Kesar; Banganapalli; Dasheri; Totapuri | 6,500; 4,500; 3,200; 2,800; 800 | 18,000; 13,000; 9,500; 8,000; 2,500 | |
| Turmeric | Salem Erode | 11,000 | 14,000 | Erode, TN |
| Chilli | Guntur Sannam S4; Byadgi | 14,500; 18,500 | 19,000; 24,000 | |
| Apple | Shimla Royal Delicious; Fuji | –; 7,500 | 14,000; 18,000 | |

"–" means no mandi price is stored, so only the retail price is shown for that variety.

**Small lookup and translation helpers**
- `getCropById(id)` finds a crop by `id`. The crop detail page `src/app/crop/[name]/page.tsx` uses it.
- `getCropsByState(state)` filters crops whose `states` contain the text (case-insensitive substring match). **It is exported but not used anywhere in the app.**
- `formatPrice(n)` formats a number as Indian rupees with no decimals (`Intl.NumberFormat("en-IN", { currency: "INR" })`), for example `₹2,441`.
- `getCropName(crop, lang)`: Tamil and Telugu come from the crop object. Kannada, Malayalam and Hindi come from a separate `CROP_TRANSLATIONS` table. If no translation exists, it falls back to English. The table also has entries for `urad`, `ginger` and `garlic`, which are not in `CROPS` (leftover entries).
- `getCropDesc` only translates the description to TA and TE. Every other language gets English.
- `getVarietyName` and `getVarietyDesc` cover all 6 languages, each falling back to English.

---

### 3. `getLivePrice(crop)`: the "live" ticker (simulated)

**What:** returns a price that changes a little on every call, so the price cards look like a live market.

**Why:** to show a live-ticker experience without a paid real-time price feed.

**How:**
- A module-level object `livePrices` keeps the last value for each crop. It lives only in that browser tab's memory and starts at `basePrice`.
- Each call takes one random step:
  ```ts
  change = (Math.random() - 0.485) * (basePrice * 0.008)
  price  = clamp(price + change, 0.72 * basePrice, 1.45 * basePrice)
  ```
  Each step is about ±0.4% of the base price. Using 0.485 instead of 0.5 gives a very small upward drift. The price can never go below 72% or above 145% of `basePrice`. The result is rounded to 2 decimals.
- Callers:
  - `src/app/crops/page.tsx` ticks every **12 s** and flashes the card green or red for 700 ms.
  - `src/app/my-crops/page.tsx` ticks every **15 s**.
  - `src/lib/AppContext.tsx` checks the user's **price alerts every 60 s against this simulated price**.
- **Limitation:** price alerts can fire because of random movement, not real market prices. Students should say this openly.

---

### 4. Price history generators (simulated)

#### `generatePriceHistory(crop, days = 60)`
Used by the Crops page (default 60 days) and the Analytics page (`src/app/analytics/page.tsx`, where `days` is the timeframe chosen by the user).
- It loops `i = days … 0`, which gives **days + 1 points**, one per calendar day ending today.
- It starts at `basePrice` and adds a step each day:
  ```ts
  change = (Math.random() - 0.48) * (basePrice * 0.028)   // about ±1.4% per day, slight upward bias
  price  = clamp(price + change, 0.70 * basePrice, 1.40 * basePrice)
  ```
- `volume` is a random number from 7,000 to 12,999. `weather` is a random pick from Sunny, Cloudy, Rainy, Partly Cloudy and Foggy. **Both are for display only and are not real data.**
- The date label is `"dd Mon"` in the en-IN format.

#### `generatePriceHistoryByTimeframe(crop, "1M" | "3M" | "1Y")`
Used by the crop detail page and `src/components/PortfolioPerformanceGraph.tsx` (1M).

| Timeframe | Days back | Step (days) | Points |
|---|---|---|---|
| 1M | 30 | 1 | 31 |
| 3M | 90 | 2 | 46 |
| 1Y | 365 | 5 | 74 |

Each point is calculated like this:
```ts
seasonalFactor = Math.sin((month / 12) * 2π) * 0.05
noise          = (Math.random() - 0.48) * (basePrice * 0.035)      // about ±1.75%
price          = price * (1 + seasonalFactor * 0.05) + noise
price          = clamp(price, 0.68 * basePrice, 1.42 * basePrice)
```
- The "seasonal" term is very small: at most ±0.25% per step (0.05 × 0.05). It does not represent a real harvest cycle. It only adds a slight wave.
- 1Y labels use `"Mon YY"`. The others use `"dd Mon"`.
- Each call gives different random numbers. The crop page wraps it in `useMemo`, so the chart only regenerates when the crop or the timeframe changes.

---

### 5. `generateForecast(crop, lastPrice, days = 30)`: random-walk "forecast"

**What:** produces 30 future daily points, each with a `predicted` value and a `lower`/`upper` band.

**Why:** to show farmers what a price-outlook chart with an uncertainty band would look like.

**How (exact formula):**
```ts
trend = (Math.random() - 0.44) * 0.004            // chosen ONCE per forecast: −0.176%…+0.224% per day
for i = 1..30:
  noise     = (Math.random() - 0.5) * (basePrice * 0.022)   // about ±1.1% of base
  price     = price * (1 + trend) + noise
  price     = clamp(price, 0.65 * basePrice, 1.55 * basePrice)
  margin    = basePrice * 0.035 * (1 + i * 0.018)
  lower     = price − margin,  upper = price + margin
```
- It starts from `lastPrice`, which is the last point of the simulated history.
- The trend is chosen once and stays the same for all 30 days, so the forecast leans either up or down overall. Over 30 days it adds about −5% to +7%. Because 0.44 is less than 0.5, upward forecasts are slightly more likely.
- The band widens with time: about ±3.6% of `basePrice` on day 1 and ±5.4% on day 30 (`0.035 × 1.54`). The band edges are not clamped.
- **This is not a trained model.** It learns nothing from past data, weather or arrivals. It is a random walk built from fixed constants.

#### How the crop page anchors it to the real price (`src/app/crop/[name]/page.tsx`)
1. The page calls `/api/mandi-prices?crop=…&state=…&district=…` for the user's saved location. It accepts the answer only if `live === true` and `wholesaleMandiRateQuintal` is a positive number. The answer is stored together with a `crop|state|district` key, so an old answer for a different crop or place is ignored.
2. It builds the simulated history and forecast (`useMemo` on crop and timeframe).
3. If a live price exists, it computes the scale factor `k = livePrice / lastSimulatedPrice`. Every history point and every forecast `predicted`/`lower`/`upper` value is multiplied by `k`, and the last history point is set exactly to the live price. The chart keeps its simulated shape but now sits at the real price level.
4. `getRecommendation` runs on these rescaled numbers.
5. The chart caption says plainly: "Estimated trend (simulated) — … history + 30d projection with band", plus ", anchored to today's Agmarknet price" when the live price was used. If no live price arrives, the chart stays purely simulated around `basePrice`.

The Crops list page (`src/app/crops/page.tsx`) does **not** do this anchoring. It uses plain `generatePriceHistory` and `generateForecast`.

---

### 6. `getRecommendation(crop, history, forecast)`: rule-based advice

**What:** returns `{ action, confidence, reason, reasonTA, reasonTE, priceChange }`.

**Why:** gives the farmer one simple instruction (hold or sell) with a reason in their language.

**How:**
- `currentPrice` = last history price. `forecastedPrice` = last forecast `predicted` value.
- `priceChange = (forecastedPrice − currentPrice) / currentPrice × 100`.
- `avg7` = sum of the last 7 points ÷ 7. `avg30` = sum of the last 30 points ÷ 30. `trend = avg7 > avg30 ? "up" : "down"`.
  - These are counted in **points, not days**. On the 3M view (2-day steps) "7" really covers 14 days. On the 1Y view (5-day steps) it covers 35 days.
- Rules are checked in order and the first match wins:

| # | Condition | Action | Confidence (rounded) |
|---|---|---|---|
| 1 | `priceChange > 5` **and** trend up | HOLD (prices rising, wait) | `min(92, 70 + 1.5·|Δ|)`, range 77.5–92 |
| 2 | `priceChange > 5` (trend down) | HOLD ("hold and watch") | `min(80, 60 + |Δ|)`, range 65–80 |
| 3 | `priceChange < −5` | **SELL** | `min(88, 65 + 1.5·|Δ|)`, range 72.5–88 |
| 4 | `msp > 0` and `currentPrice < 0.95 × msp` | HOLD ("below MSP, wait for govt procurement") | fixed 75 |
| 5 | otherwise | HOLD ("market stable, monitor 2 weeks") | **random** 60–79 |

- **BUY is never returned.** It exists in the TypeScript type, and the Crops page has a label for it, but no rule produces it. This makes sense because farmers are sellers.
- The MSP rule (rule 4) is only reached when the forecast change is within ±5%.
- The "confidence" value is a formula on the forecast change (and in rule 5 it is random). It is **not a statistical probability**.
- Reasons are written in EN, TA and TE inside this function. `recReason()` in `src/app/crops/page.tsx` adds KN, ML and HI text by checking which rule fired.
- The Crops page labels this result "AI Recommendation". In reality it is rule-based logic.

---

### 7. `getMspStatus(crop, currentPrice)`
- Returns `hasMsp`, `isBelowMsp`, `gap` (absolute, rounded), `gapPercent` (`|gap| / msp × 100`, 1 decimal), a status text like "₹X/qntl Below Govt MSP (₹msp)", and a badge colour: red below MSP, green above, grey "No Govt MSP Fixed" when `msp` is 0.
- **It is exported but not imported anywhere in the app** (unused code).

---

### 8. `getMandiComparison(crop, userState = "Andhra Pradesh")`: fallback mandi table

**What:** a list of 3–5 mandis with price, difference, distance, arrivals and a "best choice" flag (`MandiInfo`).

**Why:** a farmer can earn more by travelling to a better-paying mandi. This function supplies **local fallback data** that `src/components/MandiComparison.tsx` shows until (or unless) live Agmarknet data arrives from `/api/mandi-prices`. When live data is shown, the component labels it "Live Agmarknet" plus the date. `MandiInfo` also has the optional fields `minPrice`, `maxPrice` and `arrivalDate`, which only the live API fills.

**How it chooses which mandi list to use:**
1. **Crop-specific list** (`CROP_SPECIFIC_MANDIS`) for 11 crops: mango, chilli, onion, banana, gram, rice, wheat, apple, turmeric, cotton, tomato. Each mandi has a hard-coded price, for example Guntur Chilli Hub ₹14,500, Lasalgaon onion ₹1,400, Madanapalle tomato ₹1,200. This list is used **whatever the user's state is**, and its distances are fixed numbers, not measured from the user.
2. Otherwise the **regional list** (`REGIONAL_MANDIS`) for the user's state. Only 8 states have one: AP, TN, Telangana, Karnataka, Maharashtra, Kerala, UP, Punjab.
3. Otherwise the **Andhra Pradesh** list.

**Formulas:**
- Regional price: `round(basePrice × (1 + idx × 0.08))`, which gives 0%, +8%, +16%, +24%, +32% for list positions 0–4. In the regional fallback the **last mandi in the list is always the highest paying**.
- `priceDiff = price − basePrice`. `trend` is "up", "down" or "stable" from the sign of that difference. It is **not a trend over time**.
- `arrivalsTons = floor(180 + (5 − idx)·65 + (idx % 3)·25)`, which gives 505, 465, 425, 310, 270. These are made-up numbers.
- `isBestChoice` is set on the mandi with the highest price. Distance and transport cost are not considered.
- Some crop-specific prices are far below `basePrice` (mango 800–2,100 vs 4,500; tomato 1,200–1,900 vs 2,500), so those rows show "down".

---

### 9. Crop risk / volatility list and market heatmap: `getCropVolatilityList()`

**What:** gives each of the 28 crops a "volatility score" (0–100), a risk level, a weekly % change and an advice line. The list is sorted from highest score to lowest.

**Why:** vegetables and fruits spoil quickly, so their prices swing a lot. The screen warns farmers which crops are risky.

**How (fully deterministic, from the crop's position `idx` in `CROPS`):**
```ts
isPerishable = category is "Vegetables" or "Fruits"
baseVol = isPerishable ? 65 + (idx % 4) * 8      // 65, 73, 81, 89
                       : 18 + (idx % 5) * 6      // 18, 24, 30, 36, 42
change  = isPerishable ? (idx even ? 8.4 − 1.2·idx : −7.2 + 0.9·idx)
                       : (idx even ? 2.1 − 0.4·idx : −1.8 + 0.3·idx)
score   = clamp(round(baseVol), 12, 95)
risk    = score > 60 ? "High" : score > 35 ? "Moderate" : "Low"
```
- As a result, **every vegetable and fruit is "High" risk**. Mustard (36), Soybean (42) and Moong (36) are "Moderate". All other crops are "Low", including the Spices, because spices count as non-perishable here.
- Advice: for High risk, "Sharp price drop detected! …" if `change < 0`, otherwise "High demand spike! …". Every other crop gets "Stable market. Normal trading recommended."
- `currentPrice` is just `basePrice`.
- The "weekly change" is an arithmetic pattern based on list position, **not real market data**.
- Used by `src/components/MarketHeatmap.tsx` (colour grid, with category filter tabs) and `src/components/VolatilityAlerts.tsx` (High/Moderate/Low counts and filter, with the advice lines translated into the other languages).

---

### 10. Crop calendar data: `getCropCalendarData(userState)`
- Hard-coded rows for **7 crops**: rice, wheat, cotton, mustard, tomato, onion, groundnut. Each row has `sowingMonths`, `irrigationMonths` and `harvestMonths` as month numbers (1 = Jan), a water need (High/Medium/Low) and an advisory sentence.
  - Example: rice sows in Jun–Jul, is irrigated Jul–Oct, harvests Oct–Dec, needs High water, with the advice "3-5 cm standing water…".
  - Example: groundnut: "Gypsum @ 400 kg/ha at pegging".
- `MONTH_NAMES` gives `"Jan"…"Dec"` labels.
- **The month data does not change by state.** `userState` only appears inside the rice advisory text. The same calendar is shown for every state.
- Used by `src/components/CropCalendar.tsx`.

---

### 11. Pest and disease diagnosis data (in `src/app/tools/page.tsx`, not in cropData)
- `getBaseSymptomsForCrop()` holds a symptom database for **12 crops** (rice, wheat, cotton, tomato, onion, mango, banana, potato, corn, soybean, gram, turmeric), usually 3 symptoms each (corn has 2). Each symptom names a plant part (leaf, fruit, stem or root) and a disease with an organic treatment and a chemical treatment.
- Crops not in the database get a generic list based on their category: fruit, veg/spice, or a default list.
- `PEST_EXTRA` adds the KN, ML and HI text, matched one-to-one by list position.
- The "scan" is **simulated**. `handlePestScan` shows "Scanning Leaf Tissue…" for 2 seconds, then returns the diagnosis for the symptom the user **picked from a dropdown**. No image is analysed. The page calls it "Pest & Disease Diagnosis Simulator".

---

### 12. `processDocumentOcr(fileName)`: keyword-based OCR simulator
- It does not read the file contents. It only looks at the **file name** and returns a pre-written result with title, date, issuer, EN/TA/TE summary and action items:
  - `pm-kisan`, `ekyc`, `kyc` → PM-KISAN e-KYC notice
  - `kcc`, `loan`, `credit` → KCC loan letter (4% = 7% − 3%)
  - `pmfby`, `insurance`, `fasal`, `bima` → PMFBY policy
  - `msp`, `procurement`, `apmc` → MSP notification
  - `soil`, `fertilizer`, `urea` → Soil Health Card
  - `irrigation`, `water`, `drip` → PMKSY subsidy
  - anything else → a generic notice whose title is the cleaned-up file name and whose date is today.
- **It is not used anywhere now.** The Documents feature (`src/components/DocumentOcr.tsx`) calls the real `/api/ocr` route instead. This function is leftover code from an earlier prototype.

---

### 13. Other exported helpers in cropData.ts

**KCC (Kisan Credit Card) loan engine**, used by `src/components/KccCalculator.tsx`
- Constants:
  - `KCC_SUBVENTION_CAP = 300000`: the interest discount applies only to the first ₹3 lakh.
  - `KCC_BASE_RATE = 7`: the base interest rate in % per year.
  - `KCC_PROMPT_REPAYMENT_INCENTIVE = 3`: the extra discount in % per year for repaying within 12 months.
  - `KCC_ASSUMED_RATE_ABOVE_CAP = 7`: the rate used for the amount above ₹3 lakh. The code comments say this is an assumption for illustration only.
- `calculateKccLoan(cropId, acres)`:
  - `cropLimit = scale per acre × acres`, using `SCALE_OF_FINANCE` (for example rice ₹26,000, banana ₹50,000). Crops not in the table use ₹25,000.
  - Adds 10% post-harvest and 20% farm-asset amounts, so the total is 1.3 × cropLimit.
  - Interest is computed for 12 months. `effectiveInterestRate` = interest ÷ limit, which is 4% when the limit is ₹3 lakh or less.
- `calculateKccInterest(p, months)`: simple interest. The 3% discount applies only if `0 < months ≤ 12` and only on the first ₹3 lakh.
- `amortizedEmi(P, rate, n)`: the standard EMI formula `P·r·(1+r)^n / ((1+r)^n − 1)`, with `r = rate/12/100`. If r is 0, it returns P ÷ n.

**Cost and profit estimator**, used by `src/components/CostProfitEstimator.tsx`
- `COST_PER_ACRE` stores per-acre seed, fertiliser, pesticide, labour and machinery costs plus an average yield for **10 crops** (rice, wheat, corn, mustard, soybean, groundnut, sugarcane, cotton, tomato, onion).
- `calculateCultivationCostAndProfit` works out:
  - total cost = sum of the cost items × acres
  - revenue = round(yield × acres) × price (the user's selling price, or `basePrice` if none is given)
  - profit = revenue − cost
  - ROI = profit ÷ cost × 100
- `hasCultivationCostData` limits the dropdown to those 10 crops. `getDefaultYieldPerAcre` fills in the default yield.

**PM-KISAN**
- `getPmKisanSampleRecord()` returns a **demo** beneficiary ("Sample Farmer (Demo)") with 7 installments of ₹2,000 (No. 15–21, dated 15 Nov 2023 to 19 Nov 2025).
- `PM_KISAN_PORTAL_URL = https://pmkisan.gov.in`. The code says plainly that it cannot look up real records.

**Nearby farmer network**
- `getNearbyFarmerNetwork(district, state)` returns the **same hard-coded numbers for every district**: 14,820 farmers; rice 42.5%, chilli 28%, cotton 16.5%, tomato 8%, corn 5%. Only the district and state names you pass in are shown back.

---

### 14. `src/lib/locationData.ts`: states, districts and coordinates

**What:** `STATE_DISTRICTS` maps each state or union territory to a list of `{ name, lat, lon }` districts. `INDIAN_STATES` is `Object.keys(STATE_DISTRICTS)`. `getDistrictByStateAndName(state, name)` finds one district.

**Why:** the user picks a state and district once, at login or in settings. Its latitude and longitude drive the weather lookup (`fetchWeather(location.lat, location.lon, …)` on the Crops page), and its names are sent to `/api/mandi-prices` to fetch local Agmarknet prices.

**Coverage:** **26 entries with 676 districts**:
- 20 states: AP 26, Arunachal 25, Assam 35, Bihar 38, Chhattisgarh 33, Goa 2, Gujarat 33, Haryana 22, HP 12, Jharkhand 24, Karnataka 31, Kerala 14, MP 52, Maharashtra 36, Odisha 30, Punjab 23, Rajasthan 33, TN 38, Telangana 33, UP 75, WB 23
- 5 union territories: Delhi 11, J&K 20, Puducherry 4, Chandigarh 1, Ladakh 2

**Gaps and caveats:**
- Uttarakhand, Sikkim, Manipur, Meghalaya, Mizoram, Nagaland, Tripura and some UTs are **missing**.
- Some coordinates are reused. For example, Eluru has the same lat/lon as West Godavari.
- In `src/app/settings/page.tsx`, if a district is not found, the location falls back to lat 9.9252 / lon 78.1198 (Madurai).
- `getDistrictByStateAndName` is exported, but the pages do the same `.find()` lookup themselves.
- `src/components/CropCalendar.tsx` keeps its own separate `INDIAN_STATES` list.

---

### 15. `src/lib/priceDate.ts`: `formatPriceDate(ddmmyyyy)`

**What:** turns an Agmarknet arrival date like `"02/11/2026"` into a friendly label.

**Why:** Agmarknet publishes late in the day, so a morning check shows yesterday's prices. The code comment says the label makes this clear so the farmer is not misled into thinking an old price is from today.

**How:**
- It splits the date on `/` and builds a local `Date`.
- It finds whole days between that date and today at midnight (`86,400,000 ms` = 1 day).
- It returns:
  - `"Today"` if 0 days
  - `"Yesterday (dd/mm/yyyy)"` if 1 day
  - `"dd/mm/yyyy (N days ago)"` otherwise
- An empty input returns `""`. An input that does not parse is returned unchanged.
- Used next to live prices in `src/components/MandiComparison.tsx` and `src/app/crop/[name]/page.tsx`.


---

## 3. Live Agmarknet mandi prices

### Official live mandi prices (Agmarknet / data.gov.in)

#### What this feature is

On the mandi comparison table and on each crop's detail page, the app tries to show **real government prices for today** from APMC markets ("mandis") in the farmer's state, with markets in their own district listed first. When real prices are not available, it falls back to estimates and labels them **"Estimated"**.

- **Agmarknet** is the Government of India's agricultural marketing portal. APMC market yards report the prices each commodity traded at every day.
- **data.gov.in** is the government's Open Government Data platform. It publishes Agmarknet's dataset *"Current Daily Price of Various Commodities from Various Markets (Mandi)"* through a free REST API (a web address that returns data as JSON).

**Why it exists:** a farmer choosing where to sell needs real, recent prices. Made-up numbers could lead to a bad selling decision. That is why the code always keeps official data and estimates separate, and labels each one clearly.

Files involved:

| File | Role |
|---|---|
| `src/lib/agmarknet.ts` | Server-side client: fetches, caches, filters and sorts Agmarknet records |
| `src/app/api/mandi-prices/route.ts` | API route `GET /api/mandi-prices`, with three fallback levels |
| `src/components/MandiComparison.tsx` | Table UI with the "Live Agmarknet" / "Estimated prices" badge |
| `src/app/crop/[name]/page.tsx` | Crop detail page: shows the live average price as "current price" |
| `src/lib/priceDate.ts` | Turns `dd/mm/yyyy` into "Today" / "Yesterday (…)" / "… (N days ago)" |
| `src/lib/mandiDatabase.ts` | Mandi names used by the last-resort price model |

---

### 1. The data source (`src/lib/agmarknet.ts`)

#### Resource id and URL

```ts
const RESOURCE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
```

`9ef84268-d588-465a-a308-a864a43d0070` is the id of the "current daily mandi price" dataset on data.gov.in.

#### Request parameters (`fetchStateRecords`)

| Parameter | Value | Why |
|---|---|---|
| `api-key` | `process.env.DATA_GOV_API_KEY` | data.gov.in requires a key |
| `format` | `json` | Easy to parse |
| `limit` | `5000` (`MAX_RECORDS`) | Get a whole state's rows in one call |
| `filters[state.keyword]` | The Agmarknet state name | Download only one state, not all of India |

- `state.keyword` matches the **exact** state name. That is why the state names must match Agmarknet's spelling exactly (see aliases below).
- The request has a **15-second timeout** (`AbortSignal.timeout(15000)`) and `cache: "no-store"`, which turns off Next.js's own fetch caching. The app uses its own cache instead.
- A non-OK HTTP status, or a reply with no `records` array, throws an error. The route catches it and falls back to estimates.

#### Record fields

Each raw row is mapped to an `AgmarknetRecord`:

| Raw field from API | App field | Meaning |
|---|---|---|
| `state` | `state` | State name |
| `district` | `district` | District name |
| `market` | `market` | Mandi / APMC yard name |
| `commodity` | `commodity` | Crop name in Agmarknet spelling |
| `variety` | `variety` | Variety (e.g. "Hybrid", "Local") |
| `arrival_date` | `arrivalDate` | Date as `dd/mm/yyyy` |
| `min_price` | `minPrice` | Lowest price that day (₹/quintal) |
| `max_price` | `maxPrice` | Highest price that day (₹/quintal) |
| `modal_price` | `modalPrice` | Most common trading price that day (₹/quintal) |

- Prices come as strings. `toNumber()` parses them, and anything that is not a valid number becomes `0`.
- Rows with `modalPrice <= 0` are **dropped**, because a zero price is useless and would pull averages down.
- "Modal price" means the price at which most of the produce actually traded. It is the main number Agmarknet publishes, and the app uses it as "the price".

#### API key requirement

- `hasAgmarknetKey()` returns `true` only when the `DATA_GOV_API_KEY` environment variable is set.
- `.env.example` documents it: a free key from data.gov.in → "Generate API Key". Without the key, the app skips Agmarknet completely and uses estimates labelled "Estimated".
- The key is only read on the server (inside the API route), so it never reaches the browser.

#### State-name aliases (`STATE_ALIASES`)

The app's state list and Agmarknet spell some states differently. Because the filter needs an exact match, these are translated first:

| App name | Agmarknet name |
|---|---|
| Kerala | Keralam |
| Chhattisgarh | Chattisgarh |
| Delhi | NCT of Delhi |
| Puducherry | Pondicherry |
| Jammu & Kashmir | Jammu and Kashmir |

All other states are sent unchanged.

#### Commodity-name mapping (`COMMODITY_NAMES`)

The app's crop ids are mapped to one or more Agmarknet commodity names, with the most relevant name first:

| App crop id | Agmarknet names (tried in order) |
|---|---|
| rice | Paddy(Common), Paddy(Basmati), Rice |
| wheat | Wheat |
| corn | Maize |
| mustard | Mustard |
| soybean | Soyabean |
| groundnut | Groundnut, Groundnut pods(raw), Ground Nut Seed |
| sugarcane | Sugarcane |
| cotton | Cotton |
| tomato | Tomato |
| onion | Onion |
| potato | Potato |
| gram | Bengal Gram(Gram)(Whole) |
| tur | Red gram/Arhar/Tur(whole), Arhar (Tur/Red Gram)(Whole) |
| moong | Green Gram(Moong)(Whole) |
| banana | Banana, Banana - Green |
| mango | Mango, Mango(Raw-Ripe) |
| turmeric | Turmeric |
| chilli | Dry Chillies, Chili Red |
| cabbage | Cabbage |
| cauliflower | Cauliflower |
| eggplant | Brinjal |
| okra | `Bhindi(Ladies Finger)\|Ladies Finger` (one entry, two synonyms) |
| carrot | Carrot |
| apple | Apple |
| papaya | Papaya |
| orange | Orange |
| grape | Grapes |
| pomegranate | Pomegranate |

How the matching works:

- **Loose comparison:** `normalize()` lowercases the text and removes everything that is not a letter a–z. So "Green Gram (Moong)" and "Green Gram(Moong)" both become `greengrammoong`. After normalising, the names must match exactly (no partial matching).
- **First name that has data wins:** the loop tries each name in order and uses the **first** one that has any rows in that state. For example, rice uses Paddy(Common) if any market reported it, and looks at "Rice" only if none did. The results are **not** merged across names.
- **Synonyms with `|`:** for okra, markets in the same state report it under both names, so `"A|B"` is split and both are matched **together**.
- A crop id that is not in this table makes the function return `[]`, so the route falls back to estimates.

---

### 2. One-hour per-state cache

```ts
const CACHE_TTL_MS = 60 * 60 * 1000;   // 1 hour
const cache = new Map<string, { at: number; records: Promise<AgmarknetRecord[]> }>();
```

`getStateRecords(state)` works like this:
1. Converts the state name with `STATE_ALIASES`.
2. If the cache has an entry for that state that is less than 1 hour old, it returns it.
3. Otherwise it starts a new fetch and stores the **Promise** (the pending request) in the cache right away, with the current time.

**Why one hour, and why per state:**
- One call downloads every commodity for the state, so all 28 crops and every district in that state share one upstream request. The comment says it plainly: "one upstream call per state per hour".
- Agmarknet updates only once a day, so refreshing more often than hourly gains almost nothing. Fewer calls also keep the app well within data.gov.in's rate limits and make later page loads fast.
- Because the cache stores the *Promise* and not the finished result, two users who ask for the same state at the same moment share **one** network request. This is called request de-duplication.

**Failed-request cache eviction:**
```ts
records.catch(() => cache.delete(agState));
```
If the fetch fails (timeout, HTTP error, bad JSON), the entry is deleted straight away. Without this, one network glitch would block live prices for that state for a whole hour. With it, the next request simply tries again.

**Honest limits of the cache:**
- It is an in-memory `Map` inside the server process. It is lost on restart, and on serverless hosting each instance has its own separate cache.
- A successful but **empty** result (for example, nothing published yet that day) is still cached for the full hour.

---

### 3. Picking and ordering markets (`getAgmarknetPrices`)

`getAgmarknetPrices(cropId, state, district)` returns the official rows for one crop, one row per market.

#### Median-variety-per-market rule

One market often reports several varieties of the same crop (for example a cheap local tomato and a premium hybrid). The code groups rows by `market`, sorts each group by `modalPrice`, and keeps the **middle** row:

```ts
const sorted = rs.sort((a, b) => a.modalPrice - b.modalPrice);
return sorted[Math.floor((sorted.length - 1) / 2)];
```

- With an odd count it takes the true middle row. With an even count it takes the **lower** of the two middle rows.
- **Why:** taking the highest variety would overstate what an ordinary farmer can get, and averaging would mix very different products. The median keeps one real, reported row (with its own min, max and date) that is typical for that market. The code comment says: "so premium varieties don't skew prices".

#### District matching (`districtMatches`)

Both district names are normalised (lowercase, letters only). They count as a match if:
1. either name contains the other (e.g. "chittoor" inside "chittoordistrict"), **or**
2. they share the **same first 5 or more letters**. This handles spelling differences between the app and Agmarknet, such as "Chittoor" and "Chittor".

An empty name never matches.

**Honest note:** the 5-letter rule can occasionally match two different districts that happen to start the same way. It only changes the *ordering*, never which data is shown.

#### Ordering

```ts
return da - db || b.modalPrice - a.modalPrice;
```
1. Markets in the user's district come first.
2. Within each group, the highest modal price comes first.

So a farmer first sees nearby mandis, best price first, and then the rest of the state.

#### `MAX_LIVE_MANDIS = 8` (in the route)

The route keeps only the **first 8** markets after sorting (`.slice(0, MAX_LIVE_MANDIS)`). This keeps the table short and readable on a phone. If the district itself has more than 8 reporting markets, only its 8 highest-priced ones are shown.

---

### 4. The API route and its three-level fallback (`src/app/api/mandi-prices/route.ts`)

**Request:** `GET /api/mandi-prices?crop=…&variety=…&state=…&district=…`

- Each parameter is cut to 80 characters (basic input safety).
- Defaults: crop `Rice`, state `Andhra Pradesh`, district `Chittoor`.
- `findCrop()` looks up the crop in `CROPS` by name or id (case-insensitive). `unit` comes from the crop, defaulting to `"quintal"`.

The route tries three sources in order:

| Level | When it is used | `source` label (exact text) | `live` |
|---|---|---|---|
| 1. Agmarknet | Crop is known **and** its unit is `quintal` **and** `DATA_GOV_API_KEY` is set **and** at least one market reported it | `"Agmarknet, Govt. of India (data.gov.in)"` | `true` |
| 2. Groq AI estimate | Level 1 gave nothing **and** a Groq key is set **and** the AI reply is valid | `"AI-estimated indicative rates (not official Agmarknet data)"` | `false` |
| 3. In-app price model | Everything else | `"Indicative estimate from AgriPredict price model (verify at agmarknet.gov.in)"` | `false` |

**The `live` flag is the single source of truth:** it is `true` only for real Agmarknet data. The UI checks `live === true` and never guesses from other fields.

#### Level 1: Agmarknet response

- `avg` = rounded average of the modal prices of the (up to 8) markets.
- `best` = the highest modal price. Every market whose price equals it gets `isBestChoice: true` (so ties can mark more than one).
- For each market: `price = modalPrice`, `priceDiff = modalPrice − avg`, and `minPrice`/`maxPrice` **only if > 0** (some markets leave them out, and showing "₹0" would be wrong). `arrivalDate` is also included.
- Fields this dataset does not supply are filled with neutral values: `distanceKm: 0`, `arrivalsTons: 0`, `trend: "stable"`, `marketTrend: "stable"`, and `retailRate*: null`. These are **not** real data.
- `priceDate = records[0].arrivalDate`, the date of the first (district-first, highest-priced) market. Other markets may have reported on a different day; each row carries its own date.
- `wholesaleMandiRateQuintal = avg` and `wholesaleMandiRateKg = Math.round(avg / 10) / 10`, which is avg ÷ 100 rounded to 1 decimal (1 quintal = 100 kg).
- Any error is caught and logged as `"Agmarknet prices unavailable, falling back to estimates"`, and the route moves on to level 2.

#### Level 2: Groq AI estimate

- It sends a prompt with the crop, variety, state, district and unit, plus an example JSON structure, asking for mandi prices "in ₹ per {unit}".
- Model: `GROQ_TEXT_MODEL` env var or the default `"qwen/qwen3.8-27b"`, with temperature 0.2, 1500 max tokens, JSON mode and a 20-second timeout.
- `normalizeAiMandis()` checks every row: `mandiName` must be a string and `price` must be a positive number. Bad rows are dropped, missing numbers default to 0, and `trend` is forced to up/down/stable. If no row survives, level 2 is treated as failed.
- **Honest note:** these numbers are produced by an AI model. They are not official data, and the label says so.

#### Level 3: In-app price model (rule-based)

- **Mandi names:** `getStrictDistrictMandis(state, district)` from `src/lib/mandiDatabase.ts`. Hand-written lists exist only for Andhra Pradesh → Chittoor (10 real yard names, e.g. "Madanapalle APMC Yard (Tomato Hub)") and a partial Guntur list. A list is used only if it has at least 10 names. Otherwise (Guntur, and every other district) **10 names are generated from a template**, such as `"<District> Main APMC Yard"` and `"<District> Central Grain Market"`. These generated names are placeholders, not real verified markets. The file's comment calling them "authentic" overstates this.
- **Base price:** special cases come first: mango + Totapuri → ₹800 wholesale / ₹2,500 retail, and mango + Alphonso → ₹6,500 / ₹18,000. Otherwise, a known crop uses `basePrice` and retail is `basePrice × 1.6`. Unknown crops use keyword rules (pomegranate 6000, chilli 14500, onion 1400, tomato 1200, apple 5500, rice 3600, wheat 2400), and the final default is 2500 / 4500.
- **Per-mandi numbers** (for mandi index `idx` = 0, 1, 2, …):
  ```
  priceBoost  = wholesale × 0.035 × idx      // +3.5% per step
  price       = wholesale + priceBoost
  distanceKm  = idx == 0 ? 6 : idx × 22
  arrivalsTons= max(80, 520 − 60 × idx)
  trend       = priceBoost > 0 ? "up" : "stable"
  isBestChoice= last mandi (its district shown as "State Hub")
  ```
  Rounding is to whole rupees, or to 1 decimal if the price is under ₹100 (meant for small units). Per-kg and per-quintal fields are filled only when the unit is quintal; otherwise they are `null`.
- **Honest note:** this is fully simulated. The price steadily rises with each row, so the "best" mandi is always the last row.

---

### 5. How the UI shows it

#### Mandi table (`src/components/MandiComparison.tsx`)

- It calls `/api/mandi-prices` with the selected crop name, state and district whenever any of them changes.
- **No wrong data shown:** each result is saved with a `requestKey` (`cropId|state|district`). A result whose key does not match the current selection is ignored. That stops a slow old reply from overwriting newer data.
- **While loading, or if the API fails,** it shows local fallback data from `getMandiComparison()` in `src/lib/cropData.ts`. This is another rule-based model, built from fixed regional mandi lists with prices rising by 8% per row.
- `isOfficial` is `true` only when loading is finished, data exists, and `json.live === true`.

What changes when `isOfficial` is true:

| Element | Official (live) | Estimated |
|---|---|---|
| Badge | Green: **"Live Agmarknet · {date}"** with a pulsing dot | Amber: **"Fetching mandi prices..."** while loading, then **"Estimated prices"** |
| Subtitle | "Official daily APMC prices from Agmarknet (Govt. of India) for {state}" | While loading: "Checking official Agmarknet prices for {state}..."; after: "Indicative prices — official Agmarknet data not available for this crop in {state}" |
| Price column header | "Modal Price" | "Est. Price" |
| 5th column | **"Min – Max Price"**: `₹min – ₹max`, or "—" if the market left them out | "Arrival Volume": `📦 {tons} Tons/day` |
| 6th column | **"Reported"**: the row's raw `dd/mm/yyyy` date | "Trend": ↑ Rising / ↓ Dropping / → Stable |

All of these labels are translated into English, Tamil, Telugu, Kannada, Malayalam and Hindi.

**Note:** the table does not show the API's `source` text. AI estimates and model estimates both just appear as "Estimated prices".

#### Today/Yesterday labels (`src/lib/priceDate.ts`)

`formatPriceDate("dd/mm/yyyy")` counts whole days between the reported date and today (in the browser's local time):

| Days old | Text shown |
|---|---|
| 0 | `Today` |
| 1 | `Yesterday (03/11/2026)` |
| N > 1 | `01/11/2026 (N days ago)` |
| empty | `""` |
| unparsable | the raw string, unchanged |

**Why:** Agmarknet publishes late in the day, so in the morning the "latest" prices are usually yesterday's. Saying that plainly stops a farmer from treating old prices as today's.

#### ₹/quintal vs ₹/kg

- Agmarknet prices are **₹ per quintal** (1 quintal = 100 kg).
- In the table, for quintal crops, each price also shows a per-kg hint: `(₹{Math.round(price / 100)}/kg)`.
- The best-mandi banner shows `₹X / quintal`. Its "+₹… higher than baseline" line compares the best price with the crop's fixed `basePrice` from `cropData.ts`, not with an official average.

#### Crop detail page (`src/app/crop/[name]/page.tsx`)

- It fetches the same API for the user's saved state and district, and accepts the result **only if `live === true`** and `wholesaleMandiRateQuintal` is a positive number. The quote is also checked against a key (`crop|state|district`), and the fetch is cancelled (`AbortController`) when the page changes.
- With a live quote:
  - "Current price" = the official average of up to 8 mandis. The label reads **"Agmarknet · Today · avg mandi"** (with the date text from `formatPriceDate`).
  - The **simulated** price history and forecast are **scaled** by `k = livePrice / lastSimulatedPrice`, so the chart ends exactly at the real price. **Honest note:** only the last history point is real. The shape of the past history and the forecast is still simulated, just shifted to the real level.
- Without a live quote, the label is **"Estimated"** and the price is the last point of the simulated series.

---

### 6. Crops priced in other units

- The route only uses Agmarknet when the crop's `unit === "quintal"`, because official prices are per quintal. Comparing them with a per-dozen or per-piece price would be wrong.
- Other units would skip straight to the AI or model estimate. The AI is told to price "in ₹ per {unit}", and the model nulls the per-kg/per-quintal fields and uses 1-decimal rounding for small prices.
- **Current state of the data:** all 28 crops in `src/lib/cropData.ts` are set to `unit: "quintal"`, and the crop page's comment confirms "all crops are priced per quintal". So this guard exists for future crops but is not triggered today.

---

### 7. Known limits (be ready to say these in the viva)

| Limit | What happens |
|---|---|
| **Data is published late in the day** | Mornings usually show yesterday's prices, labelled "Yesterday (dd/mm/yyyy)". Until a market reports, its prices are simply absent. |
| **Off-season crops are missing** | If no market in the state traded the crop that day (e.g. mango out of season), level 1 returns nothing and the UI shows "Estimated prices". |
| **First request per state is slower** | The first visitor per state per hour waits for a call that can download up to 5000 rows (timeout 15 s). Later requests within the hour are served from memory. |
| **One state only** | Only markets in the selected state are searched. A better-paying mandi just across the state border is not shown. |
| **5000-row cap** | Each state request is limited to 5000 records. A very large state could in theory have more rows, and the extra rows would be cut off. |
| **No distance / arrivals / trend in live mode** | Set to 0 / 0 / "stable". The live table hides these columns and shows Min–Max and the reported date instead. |
| **Cache is per server process** | It resets on restart and is not shared between serverless instances. Empty results are cached for an hour. |
| **Fallbacks are not real data** | The AI estimate and price model are labelled "Estimated". Mandi names in the model are template-generated for every district except Chittoor (AP). |
| **Needs an API key** | Without `DATA_GOV_API_KEY`, live prices never appear. |


---

## 4. Login, database & security

### User accounts, database and security

This section covers how farmers sign up and log in, where their data is kept, and how the app keeps that data private.

#### Why Supabase? (and what it replaced)

**What:** Supabase is a hosted backend. It gives us a PostgreSQL database and a ready-made login system called "Supabase Auth". AgriPredict uses it for accounts and for the user's profile.

**Why:** The older version of `src/lib/auth.ts` (the last committed version in git) did everything inside the browser:

- All accounts were kept as one array in `localStorage` under the key `agri_users`.
- Each account object had a `password` field, stored as **plain text**.
- Login just compared `user.password !== password` in JavaScript.

That had three problems:

- Anyone with access to the browser (or any script on the page) could read every password.
- Accounts only existed on that one device and browser.
- There was no real server checking who you are.

Supabase fixes all three. Passwords are sent to Supabase and hashed on its server, so they never sit in the browser. Accounts work on any device. Data is protected in the database by row-level security.

**How the old data is cleaned up:**

- `syncSession()` in `src/lib/auth.ts` runs `localStorage.removeItem("agri_users")` on every app load.
- `getCurrentUser()` rejects any cached user that has no `id` field. Old browser-only sessions never had a Supabase id, so they are treated as logged out.

#### The Supabase client: `src/lib/supabase.ts`

- It reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from environment variables.
- `isSupabaseConfigured()` returns true only when both values are set.
- `getSupabase()` creates **one shared client** (a singleton) and returns it.
- `getSupabase()` returns `null` if the variables are missing or if the code is running on the server (`typeof window === "undefined"`). This client is meant for the browser only.
- Every auth function checks for `null` first. If there is no client, it returns the message "Login service is not configured. Please try again later." instead of crashing.

#### Publishable key vs secret key

| Key | Env variable | Where it is used | What it can do |
|---|---|---|---|
| Publishable (public) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser (`src/lib/supabase.ts`) | Only what the RLS policies allow, acting as the logged-in user |
| Secret | `SUPABASE_SECRET_KEY` | Server only (`src/lib/pushSubscriptionStore.ts`) | Bypasses RLS, so it has full database access |

**Why the secret key must stay on the server:**

- In Next.js, any variable whose name starts with `NEXT_PUBLIC_` is copied into the JavaScript sent to the browser. The secret key deliberately does **not** have that prefix, so it never reaches the browser.
- Anyone who had the secret key could read or delete every row in the database.
- `.env.example` warns about this: "NEVER expose to the browser".
- A comment in `pushSubscriptionStore.ts` says "never import this module client-side".
- The server client is created with `persistSession: false, autoRefreshToken: false`, because a server process has no user session to save.

#### Database schema: `supabase/schema.sql`

You run this file once in the Supabase SQL Editor. It is safe to run again because it uses `create table if not exists` and `drop policy if exists`.

**Table 1: `public.profiles`** (one row per user)

| Column | Type | Default / notes |
|---|---|---|
| `id` | uuid, primary key | References `auth.users(id)` with `on delete cascade`, so deleting the login account also deletes the profile |
| `email` | text, not null | Stored in lowercase by the app |
| `name` | text | `''` |
| `state` | text | `''` |
| `district` | text | `''` |
| `role` | text | `'Farmer'` |
| `avatar` | text | `'🌾'` (the app actually picks a random emoji from 8 options) |
| `portfolio` | text[] | `['rice','wheat','tomato','mustard']` (the crops the user tracks) |
| `farm_profile` | jsonb | Nullable; holds `{landSize, soilType, irrigationType, primaryCrops}` |
| `created_at` | timestamptz | `now()` |

**What is RLS?** Row-level security is a database rule that checks every query and only lets a user touch the rows a policy allows. Even if someone sends a request directly with the public key, they cannot read other people's rows.

**The three policies on `profiles`:** each one compares `auth.uid()` (the id of the logged-in user, which Supabase takes from their login token) with the row's `id`.

| Policy | Operation | Rule |
|---|---|---|
| `profiles_select_own` | SELECT (read) | `using (auth.uid() = id)` |
| `profiles_insert_own` | INSERT | `with check (auth.uid() = id)` |
| `profiles_update_own` | UPDATE | `using (auth.uid() = id) with check (auth.uid() = id)` |

There is **no DELETE policy**, so users cannot delete their profile row through the API. The row only goes away through the cascade when the auth user is deleted, which is done in the Supabase dashboard.

**Table 2: `public.push_subscriptions`** (browser push-notification addresses)

| Column | Type |
|---|---|
| `endpoint` | text, primary key (the push service URL for one device) |
| `keys` | jsonb (`p256dh` and `auth` encryption keys) |
| `expiration_time` | bigint, nullable |
| `user_agent` | text |
| `created_at` | timestamptz, `now()` |

- RLS is **enabled but no policies are defined**. In Postgres, RLS with no policies means nothing is allowed. Browser users with the publishable key get nothing.
- Only the server, using the secret key (which bypasses RLS), can read and write this table.
- This is intentional. Push endpoints are private to each device, and only the server needs them to send alerts.
- **Fallback:** if `SUPABASE_SECRET_KEY` is not set, subscriptions are saved to `data/push_subscriptions.json`. On Vercel they go to the OS temp folder instead, and they are also kept in memory. This fallback is not durable on serverless hosts: the temp folder is wiped on cold starts.

#### Sign-up flow: `register()` in `src/lib/auth.ts`

1. **Checks on the login page** (`src/app/login/page.tsx`): name, email and password must all be filled ("Please fill all fields"), and the password must be at least 6 characters. The browser's `type="email"` and `required` attributes also help.
2. The app calls `supabase.auth.signUp()`. The email is trimmed and lowercased. Name, state and district go into `options.data`, which Supabase saves as `user_metadata` on the auth user.
   - **Why metadata?** When email confirmation is on, there is no logged-in session yet, so RLS would block inserting a profile row. Keeping the details on the auth user lets the profile be created later, at first login.
3. **Duplicate email detection:** when the email is already registered, Supabase does not return an error. It does this on purpose so attackers cannot discover which emails have accounts. Instead it returns a user with an **empty `identities` array**. The code checks `data.user.identities?.length === 0` and shows "Email already registered. Please sign in."
4. **Email confirmation:** if `data.session` is null, the user has to click the link Supabase emailed them. The function returns `{ success: true, needsConfirmation: true }`. The login page then:
   - switches to the Sign In tab,
   - clears the password field,
   - shows a green message: "Account created! We sent a confirmation link to <email>. Click it, then sign in." (translated).
5. If confirmation is turned off in Supabase and a session comes back straight away, the code calls `loadProfile()`, saves the profile to the cache and sends the user to `/`.

#### Login: `login()`

1. Calls `supabase.auth.signInWithPassword()` with the lowercased email.
2. On success, calls `loadProfile()`:
   - It gets the user with `supabase.auth.getUser()`.
   - It reads their row from `profiles` (`.eq("id", user.id).maybeSingle()`).
   - **If no row exists** (the first login after confirming email), it inserts one using the sign-up metadata, a random avatar from `["🌾","🌱","🚜","🌻","🥕","🌿","🍃","🫘"]` and the default portfolio. The insert policy allows this because `id = auth.uid()`.
3. The profile is saved to the localStorage cache.
4. The login page copies the user's state and district into the app's global location (`setLocation` from `AppContext`), so weather and prices match their home district. Then it goes to `/`.
   - **Why this step:** the `AppProvider` component sits in the root layout and is not remounted on navigation, so it would not pick up the new user's location by itself.

#### Logout

- In `src/components/Sidebar.tsx`, the "Sign Out" button (`#btn-logout`) calls `void logout()`, then `router.push("/login")`, then closes the mobile menu.
- `logout()` **first** clears the cache (`saveSession(null)`) and **then** calls `supabase.auth.signOut()`.
- **Why this order:** the UI becomes logged-out immediately, even if the network call is slow or fails.

#### Friendly error messages and translation

`friendlyError()` in `auth.ts` turns raw Supabase errors into plain messages:

| Supabase message contains | Shown to user |
|---|---|
| "invalid login credentials" | Incorrect email or password. Please try again. |
| "already registered" / "already exists" | Email already registered. Please sign in. |
| "email not confirmed" | Please confirm your email first — check your inbox for the link. |
| "password" | Supabase's own message, passed through unchanged |
| "rate limit" | Too many attempts. Please wait a minute and try again. |
| anything else | The original message, or "Something went wrong. Please try again." |

- The login page has a `MESSAGES` dictionary with each known English message in **6 languages**: English, Tamil, Telugu, Kannada, Malayalam and Hindi. It shows them with `tr(language, MESSAGES[error] ?? { en: error })`.
- **Limitation:** a message the dictionary does not know (for example, Supabase's own password-rule text) is shown in English only.

#### The localStorage profile cache (and why pages read it synchronously)

- After login, the full profile (`SessionUser` = `User` plus `id`) is stored as JSON under the key **`agri_current_user`**.
- `getCurrentUser()` reads and parses it synchronously (no waiting). It returns `null` if:
  - the code is running on the server,
  - the JSON is broken,
  - `email` or `id` is not a string.

**Why synchronous?** Many pages (settings, my-crops, sidebar and others) need the user's name, location and portfolio on their very first render. For example, settings does `useState(getCurrentUser)`. Waiting for a database call on every page would cause flicker and extra network requests. The cache makes reads instant, and `syncSession` keeps it accurate in the background.

**Important honesty point:** this cache only holds profile data for display. It is not proof of identity. The real proof is the Supabase session token that the Supabase library manages. The database still enforces RLS using that token, whatever the cache says.

#### `syncSession()`: keeping the cache honest

`ClientLayout` calls this once when the app mounts:

```ts
useEffect(() => syncSession(() => setSessionVersion(v => v + 1)), []);
```

What it does:

1. Removes the legacy `agri_users` key.
2. **If Supabase is not configured:** clears any cached user, since an old session cannot be valid.
3. **Stale session cleanup:** calls `supabase.auth.getSession()`. If there is no real session (it expired, or the user signed out on another tab) but a cached user exists, it clears the cache and calls `onChange`.
4. **Refresh:** if a session exists, it reloads the profile from the database with `loadProfile()` and overwrites the cache. Changes made on another device then show up here.
5. **Live listener:** `supabase.auth.onAuthStateChange` watches for `SIGNED_OUT` events and clears the cache when one arrives.
6. It returns the listener's `unsubscribe` function, which React calls when the layout unmounts.

The `onChange` callback increases a counter called `sessionVersion`. This forces `ClientLayout` to re-render and check the user again.

#### Updating the profile (settings page)

In `src/app/settings/page.tsx`, `handleSave()` calls three functions:

- `updateUserProfile(email, name, role, avatar)`
- `updateFarmProfile(email, {...})`. If the land size is not a positive number, it becomes 1 acre. `primaryCrops` is set to the user's portfolio.
- `updateUserLocation(email, state, district)`

`updatePortfolio()` (used from the crops pages) works the same way.

All of them go through one private helper, `updateProfile(email, patch, row)`:

1. **Optimistic cache update:** it immediately merges the change into `agri_current_user`, so the UI updates instantly. "Optimistic" means we assume the save will succeed.
2. **Background database write:** it calls `supabase.from("profiles").update(row).eq("id", current.id)` without waiting for the result. RLS's `profiles_update_own` policy makes sure it can only update the user's own row.
3. **Guard:** if the given email does not match the cached user, nothing happens.
4. **Mapping:** the camel-case app field `farmProfile` is written to the database column `farm_profile`.

**Limitation:** if the background write fails, the error is only logged to the console (`console.error("Could not save profile: ...")`). The user is not told, and the cache can briefly differ from the database. The next `syncSession` on page load overwrites the cache with the database version.

#### Route protection: `src/components/ClientLayout.tsx`

**What:** stops logged-out users from seeing app pages. Only `/login` is public (`const PUBLIC = ["/login"]`).

**How:**

- **Hydration-safe loading screen:**
  - `useSyncExternalStore(noopSubscribe, () => true, () => false)` gives `isClient = false` during server rendering and hydration, and `true` afterwards.
  - The server cannot read `localStorage`. If the server HTML and the first browser render disagreed, React would show a hydration error.
  - So both first render the same "🌾 Loading AgriPredict..." screen, and only then does the browser check the user.
- `hasUser = isClient && !!getCurrentUser()` is **recalculated on every render**. If a user logs out and presses the Back button, they still cannot see protected content.
- If the page is not public and there is no user, a `useEffect` calls `router.replace("/login")`. Using `replace` instead of `push` keeps the protected page out of the browser history.
- While not ready, the loading screen is shown instead of the page content.

**Honest limitation:** this is client-side protection. It decides based on the local cache. It hides pages, but it is not a server security wall. The real data protection comes from Supabase RLS. The app's own API routes (chat, OCR, mandi prices) **do not require login**.

#### Other security measures in the app

**1. Input validation and limits in API routes**

| Route | Measures |
|---|---|
| `src/app/api/chat/route.ts` | Message trimmed and capped at `MAX_MESSAGE_CHARS = 2000`. Only the last 6 history items are sent, each capped at 2000 characters. History items must have string `role` and `content`, and any role other than "assistant" becomes "user", so a client cannot inject a fake "system" message. Language must be one of the 6 known codes. Time-limited by `maxDuration = 60` seconds, with an offline fallback if Groq fails. |
| `src/app/api/ocr/route.ts` | Upload size limit: PDF 4 MB (`MAX_UPLOAD_BYTES`), images 3 MB (`MAX_IMAGE_BYTES`). Larger files are rejected with HTTP 413. `demoKey` is capped at 120 characters and file names at 200. |
| `src/app/api/mandi-prices/route.ts` | `crop`, `variety`, `state` and `district` query parameters are each capped at 80 characters. Live results are limited to `MAX_LIVE_MANDIS = 8`. |
| `src/app/api/notifications/subscribe/route.ts` | The subscription must have an `endpoint` starting with `https://` and string `p256dh` and `auth` keys, otherwise HTTP 400. Only known fields are copied. The user agent is capped at 300 characters. |
| `src/app/api/notifications/send/route.ts` | `title` and `body` are required. Title is capped at 120 characters, body at 500, tag at 64. `safeAppPath()` only allows click URLs that start with `/` but not `//`, so a notification cannot send users to an outside phishing site. |

**2. Push broadcast admin token** (`send/route.ts`)

- **Notify one device:** the request includes an `endpoint`, and that endpoint must already be registered (otherwise 404). This is how a device sends its own price alerts.
- **Notify everyone:** this needs the header `Authorization: Bearer <PUSH_ADMIN_TOKEN>`. If the token is not set or does not match, the server returns 401 "Unauthorized broadcast". Leaving the variable empty turns broadcasts off completely.
- **VAPID keys** (the key pair that proves push messages come from our server) must come from environment variables. The code deliberately has no hard-coded fallback, because anyone holding the private key could push to every subscriber. Without the keys, push returns 503.
- **Pruning:** endpoints that come back with HTTP 404 or 410 (expired or unsubscribed) are removed automatically.
- **Honest limitation:** the unsubscribe `DELETE` route removes any endpoint it is given, without checking ownership. In practice an endpoint URL is long and random, so only the device that owns it knows it.

**3. Security headers** in `next.config.ts` (applied to every path `/(.*)`)

| Header | Value | What it prevents |
|---|---|---|
| `X-Frame-Options` | `DENY` | Other sites putting the app inside an iframe (clickjacking) |
| `X-Content-Type-Options` | `nosniff` | The browser guessing file types and running files as scripts |
| `Referrer-Policy` | `origin-when-cross-origin` | Full page URLs leaking to other sites |

There is no Content-Security-Policy header.

**4. No secrets in the client**

- These keys are read only in server code:
  - `GROQ_API_KEY` (`src/lib/groq.ts`)
  - `DATA_GOV_API_KEY` (`src/lib/agmarknet.ts`)
  - `VAPID_PRIVATE_KEY` and `SUPABASE_SECRET_KEY` (`src/lib/pushSubscriptionStore.ts`)
  - `PUSH_ADMIN_TOKEN` (`send/route.ts`)
- None of them has the `NEXT_PUBLIC_` prefix.
- Only the Supabase URL, the publishable key and the VAPID public key reach the browser, and all three are meant to be public.
- `.gitignore` has `.env*` with an exception for `.env.example`. Real keys are never committed. Only the template file with blank placeholders is.


---

## 5. AgriBot chatbot, Groq LLM & document scanner

### AI features: AgriBot and the Document Scanner

The app has two AI features:

1. **AgriBot** is a chat assistant that farmers can type or speak to in 6 languages: English, Tamil, Telugu, Kannada, Malayalam and Hindi.
2. **The Document Scanner** lets a farmer upload a photo or PDF of a government letter, receipt or card. It explains what the document is in all 6 languages.

Both features use **Groq**, a cloud AI service, and both have a fallback for when the AI cannot be reached. AgriBot's fallback is a rule-based offline bot. The scanner's fallback is a generic "AI unavailable" answer.

---

### 1. Groq: the AI provider (`src/lib/groq.ts`)

**What:** A small server-side helper that sends a chat request to Groq and returns the reply.

**Why:** Groq runs open-source large language models (LLMs) on very fast hardware and has a free tier. Its API is "OpenAI-compatible", which means it accepts the same request format as OpenAI's API. So the project calls it with plain `fetch` and needs no SDK (software development kit) library. The API key is never sent to the browser, because only server routes call this file.

**How:**

| Item | Value in code |
|---|---|
| Endpoint | `https://api.groq.com/openai/v1/chat/completions` |
| Auth | `Authorization: Bearer ${GROQ_API_KEY}` (environment variable) |
| Default temperature | `0.3` (lower means less random answers) |
| Default `max_tokens` | `1024` (callers override it) |
| Default timeout | `30000` ms, using `AbortSignal.timeout` |
| JSON mode | if `json: true`, it sends `response_format: { type: "json_object" }` |

- **Return type:** the function never throws. It returns either `{ ok: true, content, finishReason }` or `{ ok: false, status, retryable, error }`.
- **`retryable` flag:** `true` for HTTP 408 (timeout), 429 (rate limit), any 5xx server error, network failures, timeouts and empty replies. `false` for errors that would fail the same way again, such as a missing or bad key (401) or a bad request (400). If `GROQ_API_KEY` is missing, it returns `status: 0, retryable: false` straight away.
- **Removing `<think>` blocks:** some "reasoning" models, such as Qwen3, write their private thinking inside `<think>…</think>` before the real answer. The code removes this in two steps:
  ```ts
  .replace(/<think>[\s\S]*?<\/think>/g, "")   // remove complete think blocks
  .replace(/^\s*<think>[\s\S]*$/, "")         // remove an unclosed block only if it starts the reply
  ```
  The second rule exists because a reply cut off mid-thinking has no closing tag. It only applies at the start of the reply, so a real answer that happens to contain the word "<think>" is not deleted.
- **`parseJsonReply(text)`:** removes ```` ```json ```` code fences and takes the text from the first `{` to the last `}`. It then runs `JSON.parse` and accepts only a plain object (not an array). It returns `null` if parsing fails.
- **`hasGroqKey()`:** checks whether the key is set. It is used by the mandi-prices route, not by the chat or OCR routes.

**Models used:**

| Use | Primary model | Fallback model | Env override |
|---|---|---|---|
| Chat (AgriBot) | `qwen/qwen3.8-27b` | `openai/gpt-oss-20b` | `GROQ_TEXT_MODEL` replaces the primary |
| OCR of an image | `qwen/qwen3.8-27b` | none (one model only) | `GROQ_VISION_MODEL` |
| OCR of a PDF or sample document | `qwen/qwen3.8-27b` | `openai/gpt-oss-20b` | `GROQ_TEXT_MODEL` replaces the primary |

---

### 2. AgriBot server route (`src/app/api/chat/route.ts`)

**What:** A `POST /api/chat` endpoint. It receives `{ message, history, language }` and returns `{ response, mode }`.

**Why:** Farmers need quick, practical advice in their own language. The route keeps the API key on the server, controls how much text is sent to the AI, and always returns some answer even when the AI fails.

**How:**

#### 2.1 System prompt
The "system prompt" is the hidden instruction sent before the chat. It tells the model:
- it is "AgriBot", an expert agriculture assistant for Indian farmers;
- to reply in the user's language (one of the 6), and to understand transliterated text such as Tanglish, Teluglish, Kanglish and Hinglish. The prompt's examples are *"paddy rate eshtu ide?"* and *"vana kalam lo e panta vesukovali?"*;
- which topics to cover: crop choice, schedules, organic and chemical pest control, weather risk, prices, MSP and schemes;
- to use bullet points and bold text, and to stay short and practical.

**Injected MSP table:** MSP (Minimum Support Price) is the price the government guarantees for some crops. The prompt is built from `CROPS` in `src/lib/cropData.ts`, using every crop with `msp > 0` (11 crops, for example Paddy ₹2,441, Wheat ₹2,610, Cotton ₹8,267, Gram ₹5,958, Sugarcane FRP ₹365). It is labelled "Kharif 2026-27, Rabi 2027-28, sugarcane FRP 2026-27" and tells the model to *always use these exact figures instead of older ones you may remember*.
- **Why:** an LLM's memory of prices can be out of date, so the app's own data is placed directly in the prompt.
- For live market prices, the prompt sends farmers to the in-app Mandi Price Comparison (Agmarknet data).

**Language instruction:** each request adds the line *"The user's selected language is: X. Please respond in X unless they specifically ask in another language."* Here X comes from `LANGUAGE_NAMES`. Any `language` value that is not one of the 6 codes is ignored, and `en` is used.

#### 2.2 Input limits and history
- `MAX_MESSAGE_CHARS = 2000`. The new message is trimmed and cut to 2000 characters. If it is empty, it becomes `"hello"`.
- **History:** only the **last 6 messages** are sent (`history.slice(-6)`). This means 6 single messages, user and bot together, not 6 question-and-answer pairs. Each message is cut to 2000 characters. Any role other than `assistant` is treated as `user`. Items with the wrong shape are filtered out.
- **Why:** this keeps the request small, fast and cheap, and stays within the model's context limit.
- **Note:** the browser sends every earlier message, including the welcome message. The server is the one that keeps only the last 6.

#### 2.3 Retry, timeout and deadline logic
- `export const maxDuration = 60` tells Next.js / the hosting platform that this serverless function may run for up to 60 seconds.
- `deadline = now + (60 − 8) × 1000` ms, which is 52 seconds. The 8 seconds kept spare make sure the offline fallback can still reply before the platform stops the function.
- **Order of attempts:** for each model in `[primary, gpt-oss-20b]`, it makes up to **2 attempts**:
  - if less than 3000 ms remain, it gives up and returns `null` (the offline bot then answers);
  - each call uses `timeoutMs = min(30000, remaining)`, `temperature 0.3`, `maxTokens 2048`;
  - on success it returns the text and the model name;
  - if the error is **not retryable**, it skips the second attempt and moves to the next model.
- **Result:** there can be at most 4 Groq calls in total, and all of them must fit inside 52 seconds.

#### 2.4 Response
- **Success:** `{ response, mode: "⚡ Groq AI (<model>)" }`.
- **Any failure** (bad JSON body, all models failed, missing key): `{ response: getChatbotResponse(message, lang), mode: "AgriBot AI Engine" }` with **HTTP 200**. The user always gets an answer.
- **Honest note:** the chat page never shows the `mode` value, so the user cannot see whether a reply came from Groq or from the offline bot.

---

### 3. Offline keyword chatbot (`src/lib/chatbot.ts`)

**What:** A rule-based "bot" that picks a pre-written answer by matching keywords. It uses no AI or machine learning.

**Why:** It works with no API key, no internet connection to Groq, and when Groq has an outage. It also runs **in the browser** if the `/api/chat` request itself fails.

**How:**

**Language detection (`detectLanguage`)** looks at the Unicode range of the characters. Unicode ranges are the blocks of character codes used by each script:

| Script | Range | Code |
|---|---|---|
| Tamil | U+0B80–0BFF | `ta` |
| Telugu | U+0C00–0C7F | `te` |
| Kannada | U+0C80–0CFF | `kn` |
| Malayalam | U+0D00–0D7F | `ml` |
| Devanagari (Hindi) | U+0900–097F | `hi` |
| anything else | – | `en` |

Transliterated text such as "paddy rate eshtu ide" is written in English letters, so it is detected as English.

**Keyword matching (`hasAny`):**
- English keywords must match **whole words**. An optional plural `s`/`es` is allowed. This stops "hi" from matching inside "which", and "rice" from matching inside "price".
- A keyword ending in `*` matches as a prefix, so `gov*` matches "government".
- Keywords in Indian languages use **substring** matching, because words take suffixes (for example நெல் → நெல்லுக்கு).

**Order of rules (the first match wins):**

| # | Topic | Trigger words (examples) | Languages with their own text |
|---|---|---|---|
| 1 | Paddy pests (BPH, blast) | paddy/rice/நெல்/వరి/धान… **and** a pest word | EN, TA, TE |
| 2 | Cotton pests (pink bollworm, sucking pests) | cotton/பருத்தி/పత్తి/कपास… | EN, TA, TE |
| 3 | Tomato/vegetable diseases | tomato/vegetable/தக்காளி/టమాటా/टमाटर… | EN, TA, TE |
| 4 | General pest advice | pest, disease, spray, insect*, fung*, worm, aphid… | EN, TA, TE |
| 5 | MSP / prices | price, rate, msp, mandi, sell, விலை, ధర, भाव… | EN, TA, TE |
| 6 | Government schemes (PM-KISAN, PMFBY, KCC, PMKSY) | scheme, gov*, kisan, kcc, subsid*, loan, insurance, योजना… | EN, TA, TE |
| 7 | Any crop in `CROPS` (name, id or local name) | e.g. "onion", "வெங்காயம்" | all 6 |
| 8 | Greetings | hi, hello, namaste, வணக்கம், నమస్కారం… | all 6 |
| 9 | Generic help message | anything else | all 6 |

- **Honest gaps:**
  - For topics 1–6, Kannada, Malayalam and Hindi users get the **English** text, because only Tamil and Telugu translations were written.
  - The MSP numbers in rule 5 are **hard-coded text**. They currently match `cropData.ts` (₹2,441, ₹2,610, ₹6,613, ₹8,267, ₹5,958), but they would not update by themselves.
  - Rule 7 shows the crop's `basePrice` from the static crop data, not a live price.
- Greetings are checked *after* topics on purpose, so "hi, paddy pest?" gets the pest answer.
- Spray doses (for example Imidacloprid 17.8 SL @ 0.5 ml/L, Tricyclazole 75% WP @ 0.6 g/L, Neem oil 3% @ 30 ml/L, 10 pheromone traps per acre) are fixed text written by the developer. They are not checked by an agronomist inside the app.
- The file also exports `QUICK_PROMPTS` (5 English prompts, 4 for each other language), `LANG_LABELS` and `createMessage()`, which builds an id from a timestamp plus a random suffix.

---

### 4. AgriBot page UI (`src/app/chatbot/page.tsx`)

**What:** The full chat screen.

**Why:** Many farmers find typing hard, so the page supports voice in and voice out, one-tap prompts and all 6 languages.

**How:**

| Feature | How it works |
|---|---|
| **Welcome message** | Taken from `WELCOME[language]`. If the app language changes, it is replaced only while the chat has no other messages yet, so an ongoing conversation is never erased. |
| **Language buttons** | Six chips. `changeLang` sets the page language **and** the global app language (`setLanguage` from `AppContext`). |
| **Auto language switch** | When sending, `detectLanguage(text)` runs. If the message is in an Indian script, that language is used for this reply and becomes the selected language. English-letter text keeps the selected language. |
| **Quick prompts** | A scrollable row of buttons from `QUICK_PROMPTS[lang]`. Tapping one sends it immediately. |
| **Sending** | `POST /api/chat` with `{message, history, language}`. If the HTTP request fails or returns no `response`, it calls `getChatbotResponse` locally in the browser. A "AgriBot is typing..." indicator shows while waiting. New messages scroll into view automatically. |
| **Voice input (Web Speech API)** | Uses `SpeechRecognition` / `webkitSpeechRecognition`, which is built into Chrome and Edge. Settings: `continuous = true`, `interimResults = true`, locale `en-IN`/`ta-IN`/`te-IN`/`kn-IN`/`ml-IN`/`hi-IN`. Finished phrases are added up in a ref, and live partial words are shown in the input box. |
| **Keeping the mic alive** | Browsers stop recognition after silence. If the user has not pressed stop, `onend` restarts it after **30 ms** (after **150 ms** if starting it threw an error). A red bar shows "Mic Active", lets the user switch the recognition language while speaking, and has "Stop Mic" and "Send Voice ✓" buttons. Permission errors (`not-allowed`) stop the mic and show an alert. The mic is also stopped when leaving the page. |
| **Listen (text-to-speech)** | `speechSynthesis` with `rate 0.95`. The locale comes from `detectLanguage(message)`. It picks a voice whose language matches exactly, or at least the base language. Otherwise it lets the browser choose, rather than forcing a wrong voice. `cleanTextForSpeech` removes markdown symbols and emojis, turns `₹` into "rupees", and turns line breaks into pauses. Pressing the button again stops speech. |
| **Auto-speak toggle** | "🔊 Voice: ON/OFF". When on, each new bot reply is read aloud after 150 ms. The setting is saved in `localStorage` key `agri_auto_speak`. |
| **Copy** | Uses `navigator.clipboard.writeText`. On non-secure (http) pages it falls back to a hidden `<textarea>` with `execCommand("copy")`. Shows "✓ Copied" for 2 seconds. |
| **Save chats** | Saves the whole message list to `localStorage` key `agri_saved_chats`. The title is the first user message cut to 30 characters plus "...". It keeps at most **10** sessions and replaces an older one with the same title. The 💾 button opens a list where a session can be loaded or deleted. Nothing is saved to a server. |
| **Clear** | Resets the chat to the welcome message. |

**Honest notes:**
- Replies are shown as plain text with `white-space: pre-line`. Markdown is **not rendered**, so `**bold**` appears with the asterisks.
- Voice input only works in browsers that support the Web Speech API (mainly Chrome and Edge). How well it recognises Indian languages depends on the browser and its speech service.
- Text-to-speech quality depends on which voices are installed on the device.

---

### 5. Document Scanner server route (`src/app/api/ocr/route.ts`)

**What:** `POST /api/ocr` takes an image or PDF, or a sample-document name, and returns a structured explanation in 6 languages. `GET /api/ocr` is a health check that returns `{status: "ok", service, sample}` with a fallback example.

OCR stands for "optical character recognition", which means reading text from an image.

**Why:** Farmers receive letters and forms (KCC loan sanction letters, PMFBY insurance documents, soil health cards, land records) written in formal English or another language they may not read well. The scanner explains *what the document is, how to use it, a summary, and action steps* in their own language.

**How:**

#### 5.1 Accepted inputs
1. **`multipart/form-data` with a `file`** (a real upload):
   - The type is worked out from the file extension or MIME type: `.pdf` → `application/pdf`, `.jpg/.jpeg` → `image/jpeg`, `.webp`, `.png`. Anything else keeps its own `file.type`, or `image/png` if it has none.
   - The file name is cut to 200 characters.
2. **`application/json` with `{ demoKey, fileName }`** (the sample buttons):
   - **Honest note:** no real document is sent here. The model receives only a sentence such as *"Analyze document: kcc_loan…"*. So the "result" is the AI **writing a plausible description from the name alone**. It is a demonstration, not a real scan.

#### 5.2 Size limits and why

| Kind | Limit | Constant | Reason in code |
|---|---|---|---|
| Image | 3,000,000 bytes (about 3 MB) | `MAX_IMAGE_BYTES` | Groq accepts base64 images up to 4 MB. Base64 (a way of writing binary data as text) is about 33% larger than the raw file, so 3 MB raw becomes about 4 MB. |
| PDF | 4 × 1024 × 1024 bytes (4 MiB) | `MAX_UPLOAD_BYTES` | Serverless hosts limit request bodies (about 4.5 MB on Vercel). A PDF is reduced to text, so the Groq image limit does not apply. |

A file that is too large gets **HTTP 413** with a message such as "File is too large (5.2 MB). Please upload an image under 3 MB."

#### 5.3 PDF text handling (simple, and weak)
`extractTextFromFileBuffer` does **not** use a real PDF parser:
- it reads the raw bytes as UTF-8 text;
- it uses a regular expression to find runs of 3–100 ordinary characters (letters, digits, `, . - : /` and spaces);
- it drops pieces that contain `stream`, `endstream`, `obj` or `PDF-`;
- it keeps the first **80** pieces.

If the result is longer than 10 characters, it is added to the prompt.
- **Honest limitation:** most real PDFs store their text compressed, so this often recovers internal PDF codes rather than the visible words. Scanned PDFs, which are just images, contain no text at all. PDFs are **not** sent to the vision model, so PDF results may be based on very little real content.
- The same extraction also runs on **image** files. Random readable fragments from the image bytes can end up in the prompt as well.

#### 5.4 Vision vs text models
- **Images:** sent as a `data:<mime>;base64,…` `image_url` content part to **one** vision model (`GROQ_VISION_MODEL`, default `qwen/qwen3.8-27b`). There is no second model to try.
- **PDFs and samples:** text only, sent to `GROQ_TEXT_MODELS` in order (primary, then `openai/gpt-oss-20b`).
- **Call settings:** `temperature 0.1` (very low, for consistent output), `maxTokens 6000` (the comment says the 6-language reply needs about 4,000 tokens and a lower limit cuts the JSON off), and JSON mode on.
- **Timing:** `maxDuration = 60`, `deadline = now + 55 s`. A model is skipped if less than 5 s remain. A model that is not the last one gets at most 35 s, so the next model still has time.
- If a reply cannot be parsed as JSON, the code logs it and tries the next model.

#### 5.5 JSON output shape
The prompt asks for one JSON object containing:
- 4 header fields: `documentType`, `extractedTitle`, `extractedDate`, `issuerAuthority`;
- 4 content groups, each in 6 languages (suffix `EN/TA/TE/KN/ML/HI`):
  - `whatIsThis…`: 2-sentence explanation
  - `howToUse…`: how to use the information
  - `summary…`: full plain summary
  - `actionItems…`: an array of 4 steps

`normalizeOcrResult` then cleans up the model's answer:
- It accepts other key names the model might use (`document_type`, `title`, `issuing_authority.name`, `summary.text`, `action_items`, …).
- It fills in defaults for anything missing: today's date, "Document Issuing Entity", the file name as the title, and generic English action items.
- Missing regional-language text is filled from `generateLanguageFallbacks`. These are fixed **generic** sentences that include the file name. They are not real translations of the document.
- A regional summary is **rejected** if it contains the English summary (a sign that the model copied English instead of translating). The generic fallback is used instead.
- One special case exists: when "AI" appears together with "partner" or "infographic" in the name, type or title, it uses special text describing an "AI Agriculture Partner" infographic. This looks like it was written for a specific demo image.

The response is `{ result, mode: "⚡ Groq Vision AI (<model>)" }`. **Note:** this label says "Vision" even when a text model handled a PDF or sample.

#### 5.6 "AI unavailable" fallback (returns HTTP 200)
If Groq fails, returns no usable JSON, the body is not a file, or any error is thrown, the route calls `generateSmartDynamicResult(fileName)`:
- `documentType`: "Agricultural Document / File";
- the title is made from the file name ("kcc_loan.pdf" becomes "Kcc Loan");
- the English text says plainly that *AI analysis is unavailable … could not be read* and suggests trying again or visiting a Krishi Vigyan Kendra (government farm science centre);
- `mode: "dynamic-smart-ocr"`.

This is returned with **status 200**, not an error code. The browser can then show a readable card, and the UI marks it clearly as "basic only". Only the size check (413) returns an error status.

---

### 6. Document Scanner UI (`src/components/DocumentOcr.tsx`, `src/app/documents/page.tsx`)

**What:** `documents/page.tsx` is a simple page with a translated heading ("Document Scanner") and one line of explanation. It displays the `<DocumentOcr />` component, which contains the whole scanner.

**How:**

| Feature | Details |
|---|---|
| **Upload** | Click the dashed box or drag and drop a file. The input accepts `image/*,.pdf`. |
| **Image compression in the browser** | `compressImageIfNeeded` draws the image on a `<canvas>`, scales the longer side down to **1200 px**, and re-saves it as **JPEG at quality 0.85**. **Why:** it makes uploads smaller and faster on slow rural networks and keeps images under the 3 MB server limit. PDFs are sent unchanged. |
| **Timeout** | Uploads are cancelled after **90 s** (`AbortController`). The user sees "The scan took too long…". Sample-document requests have no client timeout. |
| **Sample documents** | 8 buttons: PM-KISAN e-KYC, KCC Loan Sanction, PMFBY Crop Insurance, MSP Procurement, Soil Health Card, Drip Subsidy (PMKSY), Land Chitta/Patta, Agricultural Passbook. They send `{demoKey, fileName}` as JSON, so the result is generated from the name only (see 5.1). |
| **Loading state** | "Analyzing File with Groq Vision AI…" with the file name. |
| **Result card** | Shows the document type, a mode badge, title, issuer and date, then 4 boxes: *What is this file?*, *How to use this for your farm*, *Detailed summary*, and a numbered list of *Action items*. |
| **Summary language tabs** | EN / தமிழ் / తెలుగు / ಕನ್ನಡ / മലയാളം / हिंदी. The default is the app language. Each box shows that language's field, or the English version if that field is empty. |
| **Mode badge** | If `mode` is `dynamic-smart-ocr` or missing, it shows *"Basic summary only — AI unavailable, the document's text was not read"* (translated into all 6 languages). This is an honest warning to the user. |
| **History** | Saved in `localStorage` key `agri_ocr_history`. It keeps up to **20** items, newest first, and replaces an older item with the same file name. Each item stores the full result, so clicking it reopens the result without calling the server again. There is a "Clear History" button. If storage is full or blocked, history stays in memory only. Old items with no saved mode are labelled "⚡ Groq Vision AI (qwen/qwen3.8-27b)". |
| **Errors** | Shows a red alert box for 413 (file too large) messages, failed scans and network errors. |

**Honest notes on the scanner:**
- The header says the AI "extracts exact text". In fact, the raw extracted text is **never shown**. The user only sees AI-written summaries and explanations.
- The heading calls it a "Legal Decoder", but no legal checking is done.
- Everything depends on one cloud AI. If the key is missing or Groq is down, the user only gets the generic fallback card.

---

### 7. Accuracy and limitations

- **Accuracy has not been evaluated.** The project has no test set, no accuracy or WER (word error rate, a measure of speech-recognition mistakes) numbers, and no measurement of OCR correctness or translation quality. No agronomist has reviewed the answers. All quality claims depend on the Groq models used.
- LLMs can **hallucinate**, meaning they can produce confident but wrong facts. This includes doses, scheme rules and amounts read from a document. The app adds no warning text to AI answers.
- MSP figures are reliable only as far as `cropData.ts` is correct and up to date, since the values are typed in by hand.
- The offline bot is a fixed set of answers, not a model. Its answers are fully predictable, but it only covers a few topics.
- Saved chats and scan history are stored only on one device (`localStorage`). They are not synced to an account.
- An image is shared with Groq, a third-party cloud service, when it is uploaded for scanning. PDF text and chat messages are shared with Groq in the same way.


---

## 6. Price alerts, push notifications & app state

### Price alerts, push notifications and global app state

This part of AgriPredict does three jobs:

1. It lets a farmer say "tell me when the price of my crop goes above or below ₹X". This is a **price-threshold alert**.
2. It shows that message in two ways: inside the app (a popup card called a **toast** plus a notification list), and as a phone or desktop **lockscreen notification** using Web Push.
3. It keeps app-wide settings (language, dark mode, location, notifications) in one shared place called **AppContext**, so every page can use them.

**Honest summary for the viva:**
- Alerts are checked **inside the browser**, every 60 seconds, and only while the app is open. No server checks them on a schedule.
- The price being compared is a **simulated** price. It is not a real mandi feed.
- There is **no SMS** and no email. The only channels are the in-app toast/list and Web Push.

---

### 1. Price-threshold alerts (`src/lib/priceAlerts.ts`)

**What:** Functions to create, list, switch on/off, delete and mark price alerts.

**Why:** A farmer can't keep watching prices all day. They want a nudge when the price reaches a level worth selling at (or a level that is worryingly low).

**How it is stored:** Everything lives in the browser's `localStorage` under the key `agri_price_alerts`, as a JSON array. There is no database table for alerts. So alerts belong to one browser on one device. They are lost if site data is cleared, and they do not sync to the user's other devices.

Each alert (`PriceAlert` interface) has these fields:

| Field | Meaning |
|---|---|
| `id` | `"alert_" + Date.now() + "_" + 4 random base-36 characters` |
| `cropId`, `cropName` | Which crop to watch |
| `mandiName`, `district`, `state` | Which market the farmer chose (used for display text only, see the limitations below) |
| `condition` | `"above"` or `"below"` |
| `targetPrice` | Number in rupees |
| `unit` | Text such as `"₹/qtl"` |
| `active` | On/off switch |
| `createdAt` | ISO timestamp |
| `lastTriggeredAt`, `lastCheckedPrice` | Filled in when the alert fires |

**Functions:**
- `getPriceAlerts()`
  - Returns `[]` on the server (there is no `window` there), when nothing is stored, when the JSON is broken, or when the stored value is not an array.
  - It also silently deletes two old sample alerts (`alert_default_1`, `alert_default_2`) that earlier versions created automatically. One of them used to fire on first load, which confused users.
- `savePriceAlert(data)`: adds `id`, `createdAt` and `active: true`, and puts the new alert at the **front** of the list.
- `deletePriceAlert(id)` and `togglePriceAlert(id)`: delete an alert, or flip `active`. Toggle returns the new on/off state.
- `updateAlertTriggered(id, price)`: saves `lastTriggeredAt = now` and `lastCheckedPrice = price`.
- `dispatchPriceNotification(title, body)`: sends a lockscreen push to **this device only**, by calling `sendPushToThisDevice(...)` with `url: "/my-crops"` and `tag: "mandi-price-alert"`. Any error is only logged (`console.warn`), so a push failure never breaks the app.

---

### 2. The alert creation dialog (`src/components/PriceAlertModal.tsx`)

**What:** A popup form for creating an alert. It is opened from the My Crops page (`src/app/my-crops/page.tsx`) and from the mandi comparison component (`src/components/MandiComparison.tsx`).

**How it works:**
- **Fresh form every time:** The dialog is created new each time it opens. It is also given a `key` made from the prefill values (crop, mandi, price, state, district), so if those change the form starts over cleanly. No "reset the form" effect is needed.
- **Default values:**
  - Crop is `rice`.
  - Mandi is "Nellore Mandi" (Nellore, Andhra Pradesh).
  - Condition is "above".
  - Target price is `round(initialPrice × 1.08)` (8% above the price passed in) when a price is given, otherwise ₹2400.
- **Changing the crop** resets the target price automatically: `basePrice × 1.1` if the condition is "above", or `basePrice × 0.9` if it is "below".
- **Mandi list:** `COMMON_MANDIS` is a **hard-coded list of 8 mandis** (Nellore, Guntur, Madurai, Chennai Koyambedu, Kurnool, Coimbatore, Hubli, Indore), plus an "All Regional Mandis" option. Picking a listed mandi also fills in its district and state. Picking "All Mandis" leaves the previous district and state unchanged.
- **Validation:** If the target price is 0 or less, the user gets a browser `alert()` and nothing is saved.
- **When the user saves**, four things happen:
  1. `savePriceAlert(...)` stores the alert. `lastCheckedPrice` is set to the passed-in price or the crop's `basePrice`.
  2. `addNotification(...)` adds a confirmation to the in-app list and shows a toast.
  3. `dispatchPriceNotification(...)` sends a confirmation lockscreen push. Nothing is sent if this device has not enabled push.
  4. A success message appears, and the dialog closes itself after **1200 ms**. The timer is cleared if the dialog closes earlier, so it can never close a dialog that was opened again.
- **Other details:**
  - Pressing **Escape** closes the dialog.
  - It is accessible: it uses `role="dialog"` and `aria-modal`.
  - All its text is translated into 6 languages (English, Tamil, Telugu, Kannada, Malayalam, Hindi) using `tr(language, {...})`.

---

### 3. The 60-second alert check (in `src/lib/AppContext.tsx`)

**What:** A timer inside `AppProvider` that checks every active alert.

**Why:** Something has to compare the current price against each alert's target. Because there is no server-side job, this check runs in the browser.

**How:**
- It only starts after saved preferences have been loaded (`hasLoaded` is true).
- It runs once **4 seconds** after the app loads (`setTimeout(..., 4000)`), then every **60 seconds** (`setInterval(..., 60000)`). Both timers are cleared when the provider unmounts.
- For each alert where `active` is true:
  1. **Find the crop** in `CROPS`, matching by `cropId` or by crop name (ignoring upper/lower case). If no crop matches, the alert is skipped.
  2. **Get the "current" price** with `getLivePrice(crop)` from `src/lib/cropData.ts`. **This is simulated.** It is a small random walk that starts at `basePrice`, kept in memory only:
     ```ts
     change = (Math.random() - 0.485) * (basePrice * 0.008)
     price  = clamp(price + change, basePrice * 0.72, basePrice * 1.45)
     ```
     Each step moves the price by at most about ±0.4% of the base price. Because of the 0.485 (instead of 0.5) there is a slight upward drift. The price can never go below 72% or above 145% of the base price.
  3. **Trigger rule:**
     - "above" fires when `currentPrice >= targetPrice`.
     - "below" fires when `currentPrice <= targetPrice`.
  4. **Cooldown:** An alert only fires if more than **10 minutes** have passed since its `lastTriggeredAt`. The cooldown is saved in localStorage, so it still applies after a page reload.
  5. **When it fires**, it calls `updateAlertTriggered(...)`, builds a message such as "🚨 Mandi Price Alert: Rice — Rice at Nellore Mandi reached ₹2,450/qtl (≥ target ₹2,400)!", then calls `addNotification(...)` (toast and list) and `dispatchPriceNotification(...)` (lockscreen push).
- Any error during the check is caught and logged, so one bad alert cannot crash the app.

**Limitations to state plainly:**
- **The chosen mandi does not change which price is checked.** Only the crop is used. The mandi name appears only in the message text.
- The price is simulated, not real Agmarknet data.
- **If the app/tab is closed, no alerts are checked**, and no lockscreen push fires either. The push only helps when the tab is open but the user is looking at another app, or the phone screen is locked.
- Alerts that stay true repeat at most once every 10 minutes for as long as the price stays past the target.

---

### 4. In-app toast vs lockscreen Web Push

| | In-app toast / notification list | Lockscreen Web Push |
|---|---|---|
| Code | `addNotification` in `AppContext.tsx`; drawn by `src/components/ClientLayout.tsx` | `pushClient.ts` → `/api/notifications/send` → `web-push` library → browser push service → `public/sw.js` |
| Needs permission? | No | Yes: the browser's notification permission, plus a push subscription |
| Visible when | The app is open on screen | The phone/desktop shows a system notification, even when locked |
| Duration | Toast disappears after **4 s**; the list keeps the newest **25** items | Stays until the user dismisses it |
| Spam protection | **1-minute** cooldown per unique type + title + message | The `tag` replaces an older notification that has the same tag |

**Toast details:**
- `showToast` shows one toast at a time and clears it after 4000 ms. It only clears it if that same toast is still showing, so a newer toast is not cut short.
- `ClientLayout` draws the toast at the bottom-right with `role="status"` and `aria-live="polite"`, so screen readers announce it. The icon depends on the type: 💰 for price, 🌦️ for weather, 🔔 for system messages.

---

### 5. VAPID keys

**What:** VAPID ("Voluntary Application Server Identification") is a pair of keys: one public, one private. Our server uses them to prove to browser push services (Google FCM, Mozilla, Apple) that a push really comes from AgriPredict.
- The **public** key is given to the browser when the user subscribes.
- The **private** key signs every push. It must stay secret, because anyone who has it can push to every subscriber.

**Generating them:** `node scripts/gen_vapid.cjs`. The script calls `webpush.generateVAPIDKeys()` and prints `PUBLIC_KEY=...` and `PRIVATE_KEY=...`.

**Environment variables read by `src/lib/pushSubscriptionStore.ts`:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are both required. If either is missing, push is turned off. There is deliberately **no hard-coded fallback key**.
- `VAPID_SUBJECT` is a contact address. It defaults to `mailto:support@agripredict.in`.
- `webpush.setVapidDetails(...)` is called once when the module loads. If it succeeds, `vapidReady = true`.
- `getVapidPublicKey()` returns the public key, or `null` if push is not set up. `isPushConfigured()` returns `vapidReady`.

---

### 6. Subscribing a device (`src/components/NotificationManager.tsx`)

**What:** The bell button ("Get Alerts" / "Alerts Active") with a small drop-down panel. It appears in the mobile header (`ClientLayout.tsx`), the sidebar (`Sidebar.tsx`) and the home page (`src/app/page.tsx`).

**Checking support when it loads:**
- If the browser does not have both `serviceWorker` and `PushManager`, the panel stays in "not supported" mode.
- Otherwise it looks for an existing registration of `/sw.js` and checks whether that registration already has a subscription.

**Subscribe flow (`subscribeToPush`):**
1. Call `Notification.requestPermission()`. If the user does not grant it, show a "permission denied" message and stop.
2. `GET /api/notifications/subscribe` to fetch the VAPID public key. If there is no key, throw an error.
3. Register the service worker `/sw.js` and wait until `navigator.serviceWorker.ready`.
4. Convert the public key from base64url text to bytes (`urlBase64ToUint8Array`).
5. If an old subscription exists but was made with a **different** key (for example after the keys were changed), unsubscribe it. A subscription tied to an old key cannot receive pushes any more.
6. `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`. `userVisibleOnly: true` is a promise to the browser that every push will show a visible notification.
7. `POST` the subscription (`subscription.toJSON()`) together with `navigator.userAgent` to `/api/notifications/subscribe`.
8. Fire a window event `agri-push-subscription`, so the other bell buttons on the page update their status too.

**Unsubscribe ("Mute Alerts"):** sends a `DELETE` with `{ endpoint }` to the server, then calls `sub.unsubscribe()` in the browser.

**Test button:** "Send Test Lockscreen Alert" calls `sendPushToThisDevice(...)` with `url: "/crops"` and `tag: "test-alert"`. If that returns `null`, the device is not subscribed, and the UI switches back to "not subscribed".

---

### 7. `src/lib/pushClient.ts`: send to this device, with re-subscribe and retry on 404

- `getDeviceSubscription()` returns the current device's subscription, or `null` if there is no service worker, no registration or an error.
- `getDevicePushEndpoint()` returns just the endpoint URL. An **endpoint** is the unique URL at the push service that identifies this browser.
- `sendPushToThisDevice(payload)`:
  1. If the device has no subscription, return `null`.
  2. `POST /api/notifications/send` with `{ title, body, url?, tag?, endpoint }`.
  3. If the response is **404**, the server has forgotten this device. That can happen because the fallback storage is not permanent (see section 9). In that case it registers the device again with `POST /api/notifications/subscribe` and **retries once**. If the re-registration fails, it returns the original 404 response.

---

### 8. API contract

**`/api/notifications/subscribe`** (`src/app/api/notifications/subscribe/route.ts`)

| Method | Request | Success | Errors |
|---|---|---|---|
| `GET` | none | `{ publicKey, activeSubscribers, status: "online" }` | `503` `{ publicKey: null, status: "unconfigured", error }` if VAPID keys are missing |
| `POST` | `{ subscription: { endpoint, keys: { p256dh, auth }, expirationTime? }, userAgent? }` | `{ success: true, message }` | `400` if the endpoint is not a string starting with `https://` or a key is missing; `500` if saving fails |
| `DELETE` | `{ endpoint }` | `{ success: true, message }` | `400` if no endpoint; `500` if removal fails |

Notes:
- The user agent is shortened to 300 characters. If the body has no `userAgent`, the request's `User-Agent` header is used.
- `DELETE` does not check who is asking. Anyone who knows an endpoint URL can remove it. In practice the endpoint is a long secret URL that only the device itself knows.

**`/api/notifications/send`** (`src/app/api/notifications/send/route.ts`, `POST`)
- **Body:** `{ title, body, url?, tag?, endpoint? }`.
  - `title` and `body` are required; without them the route returns `400`.
  - If push is not configured, it returns `503`.
- **Two modes:**
  - **Send to one device** (`endpoint` given): the server checks that this endpoint is already registered. This is an **ownership check by endpoint**: knowing the secret endpoint URL proves you are that device. If it is not registered, the route returns `404`. Only that one subscription receives the push.
  - **Broadcast to everyone** (no `endpoint`): the request must include the header `Authorization: Bearer <PUSH_ADMIN_TOKEN>`. If the env var is missing or the header does not match, the route returns `401 "Unauthorized broadcast"`. This stops a random visitor from spamming every farmer.
- **Cleaning the input:**
  - `title` is cut to 120 characters, `body` to 500, `tag` to 64 (default tag `agripredict-push`).
  - `url` must be a path inside the app (starts with `/` but not `//`), otherwise it becomes `/crops`. This stops a push from linking to a phishing site.
  - The icon and badge are fixed to `/icon.png`.
- **Response:** `{ success, deliveredTo, totalSubscribers, failed, message }`.

---

### 9. Subscription storage (`src/lib/pushSubscriptionStore.ts`)

**Option 1: Supabase (preferred, permanent).** This is used when both `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SECRET_KEY` are set.
- The data is in table `public.push_subscriptions` (defined in `supabase/schema.sql`), with columns `endpoint` (primary key), `keys` (jsonb), `expiration_time`, `user_agent` and `created_at`.
- Row Level Security is switched on **with no policies**. That means browsers cannot read the table at all; only the server's secret key can.
- Saving uses `upsert` on `endpoint`, so the same device subscribing twice updates one row instead of creating two.

**Option 2: file / temp-folder fallback (no Supabase).**
- **Where the file goes:** locally the file is `data/push_subscriptions.json`. On Vercel (when the `VERCEL` env var is set) it is the OS temp folder `…/tmp/agripredict/push_subscriptions.json`.
- **Memory copy:** subscriptions are also kept in memory (`memorySubs`), so a failed file write never breaks a request.
- **If the project folder is read-only:** the code switches to the temp folder. If even the temp folder fails, subscriptions stay in memory only.
- **The problem:** on serverless hosting the temp folder belongs to one server instance and is wiped on a cold start. So subscriptions can be "forgotten". That is exactly why `pushClient.ts` re-subscribes and retries on a 404.

**Sending (`sendPushNotification(payload, targetEndpoint?)`):**
- **Who receives it:** one subscriber if `targetEndpoint` is given, otherwise all subscribers. Nothing is sent if there are no subscribers or VAPID is not ready.
- **Default content:** title "🌾 AgriPredict Alert", URL `/crops`, tag `agripredict-update`, plus a `timestamp`.
- **Delivery:** all deliveries run in parallel and the code waits for every one to finish (`Promise.allSettled`).
- **Pruning dead subscriptions:** if the push service answers **404 or 410**, the subscription has expired or the user unsubscribed in the browser. Those endpoints are collected and removed from storage in one call (`removeSubscription([...])`). Other errors are only logged.
- **Return value:** `{ success, totalSubscribers, sent, failed }`.

---

### 10. Service worker (`public/sw.js`)

A **service worker** is a small script the browser keeps running in the background, even when the app tab is closed. It is what makes lockscreen notifications possible.
- **`install` / `activate`:** `skipWaiting()` and `clients.claim()` make a new version of the worker take control straight away.
- **`push` event** (a push arrives):
  - It reads the payload as JSON. If that fails, it uses the plain text as the body.
  - It shows a notification with:
    - title and body (with defaults)
    - icon and badge `/icon.png`
    - vibration pattern `[100, 50, 100]`
    - `data.url` (default `/crops`)
    - a `tag`, with `renotify: true` so a replacement notification with the same tag still alerts the user
    - two buttons: "📊 View Details" and "✖ Close"
- **`notificationclick` event** (the user taps the notification):
  - The notification is closed. If the user tapped "Close", nothing else happens.
  - The target URL is only accepted if it belongs to the app's own origin; otherwise the home page `/` is used.
  - If an AgriPredict window is already open, it is focused and moved to that URL. If moving fails, a new window is opened. If no window is open, a new one is opened.

---

### 11. AppContext responsibilities (`src/lib/AppContext.tsx`)

`AppProvider` wraps the whole app. Any component can reach the shared state with `useApp()`, which throws an error if it is used outside the provider.

| Responsibility | How it works |
|---|---|
| **Language** | Six options: `en, ta, te, kn, ml, hi`. A saved value is only accepted if it is in this list. When the language changes, `<html lang>` is updated too, so screen readers and the speech engine pick the right voice. |
| **Dark mode** | `toggleDark()` flips the `dark-mode` class on `<body>` and saves `agri_dark`. |
| **Location** | Default is Madurai, Tamil Nadu (9.9252, 78.1198). `setLocation()` saves the state and district. When the app loads, the saved district is looked up in `STATE_DISTRICTS` (from `src/lib/locationData.ts`) to get its latitude and longitude back. |
| **Live geolocation** | `detectLiveLocation()`, explained just below the table. |
| **Notifications list** | `addNotification` (with the 1-minute duplicate cooldown, newest 25 kept), `markAllRead`, `markAsRead`, `clearNotifications`, and `unreadCount`. |
| **Toast** | `showToast`, auto-cleared after 4 s. |
| **Price-alert monitor** | The 60-second check from section 3. |

**How `detectLiveLocation()` works:**
1. It uses `navigator.geolocation.getCurrentPosition` with a 10-second timeout.
2. It sends the coordinates to the free **BigDataCloud** reverse-geocoding service (`api.bigdatacloud.net/data/reverse-geocode-client`), which turns them into place names.
3. **State:** it takes `principalSubdivision` and looks for a state in `STATE_DISTRICTS` whose name contains it, or is contained in it (ignoring case). If none matches, it uses the state of the nearest known district anywhere. If that also fails, it uses Tamil Nadu.
4. **District:** it compares `city`, then `locality`, then `localityInfo.administrative[2].name` with that state's districts by name. If none matches, it picks the **nearest district** by squared distance `(Δlat)² + (Δlon)²`. This is a simple flat approximation, not true map distance.
5. **Saving:** the real GPS coordinates are kept as `lat`/`lon`, the state and district are saved to localStorage, and a toast says "Live Location Detected".
6. **If something fails:**
   - If geocoding fails, a toast shows the raw coordinates instead. The location is *not* changed in that case.
   - If the browser has no geolocation, or the user refuses permission, a browser `alert()` explains the problem.

**Weather (being precise):** AppContext itself does **not** fetch weather. It only provides `location`. The weather fetch is in `src/lib/weather.ts` (`fetchWeather`), and it is called by `src/app/crops/page.tsx` whenever the location changes. That page also ignores late answers for a location that is no longer current.
- **Data source:** the **Open-Meteo** forecast API. It asks for current temperature, humidity, wind and WMO weather code, plus a 7-day daily forecast (max/min temperature, rain amount, weather code), in the Asia/Kolkata time zone.
- **Weather codes:** WMO weather codes are converted to a condition name and an icon using a lookup table. Unknown codes become "Partly Cloudy".
- **Crop impact** (`getCropImpact`) is **rule-based**:
  - Heavy rain, violent showers or thunderstorm → **High**
  - Any rain or drizzle, or humidity above 80% → **Medium**
  - Temperature above 40 °C → **High**
  - Temperature below 10 °C → **Medium**
  - Otherwise → **Low**
- **Soil moisture index is not measured.** It is calculated as `min(100, round(humidity/100 × 60 + random × 30))`, so part of it is random.
- **Fallback:** if the API fails, `getMockWeather` returns **made-up data**: one of 4 preset conditions picked at random, a fixed 4-day repeating forecast pattern, and random temperatures and rain. The error is only logged to the console, and the user is not told that the weather is mock data.

---

### 12. localStorage keys used here

| Key | What it holds | Written by |
|---|---|---|
| `agri_price_alerts` | JSON array of price alerts | `src/lib/priceAlerts.ts` |
| `agri_dark` | `"true"` / `"false"` | `toggleDark` |
| `agri_lang` | Language code | `setLanguage` |
| `agri_state`, `agri_district` | Chosen or detected location | `setLocation`, `detectLiveLocation` |
| `agri_notifications` | JSON array of in-app notifications (newest 25) | AppContext, saved again whenever the list changes |
| `agri_notif_cleaned_v2` | One-time flag. When it is first set, the old notifications list is wiped once, to clear junk left by earlier versions. | AppContext |

The saved settings are restored inside a `useEffect` after the page first shows, not while it is being drawn. The page is first drawn on the server, which has no `localStorage`. Reading it during that first draw would make the server version and the browser version different (a "hydration mismatch" error). The `hasLoaded` flag stops the notifications list from being saved, and the alert monitor from starting, until this restore has finished.


---

## 7. Every page and screen, feature by feature

### Screens and features, page by page

This section goes through every screen in the app (`src/app/**/page.tsx`) and the components each one uses. For each feature it says **what** it does, **why** a farmer needs it, and **how** it works. Each feature is also marked as one of these:

- **Live**: real outside data, such as Open‑Meteo weather, Agmarknet prices or Groq AI.
- **Simulated**: numbers made up by a formula with random noise.
- **Hard-coded**: fixed values typed into the code.

#### How every page is wrapped (shared layout)

| Piece | File | What it does |
|---|---|---|
| Login guard | `src/components/ClientLayout.tsx` | Only `/login` is public. On every other page, if `getCurrentUser()` (a cached profile in `localStorage` key `agri_current_user`) is missing, it redirects to `/login`. While checking, it shows "Loading AgriPredict...". |
| Mobile header | same file | Below a certain width it shows a ☰ button that opens the sidebar as a drawer with a dark backdrop, plus a push‑notification button. |
| Toast | same file | A pop‑up card at the bottom‑right for in‑app notifications (💰 price, 🌦️ weather, 🔔 system). |
| Sidebar | `src/components/Sidebar.tsx` | 9 links: Dashboard, Crops, My Crops, Analytics, Govt Schemes, Agri‑Tools, AgriBot, Doc Scanner, Settings. Also has a notification bell (unread count, mark read, "Clear All", enable‑push button), a **live location** button, a language dropdown (6 languages) and Logout. All routes are prefetched so pages open faster. |

**Live location** (`detectLiveLocation` in `src/lib/AppContext.tsx`):
1. The browser GPS (`navigator.geolocation`) gives latitude and longitude.
2. The free BigDataCloud reverse‑geocode API turns these into a state name.
3. The app matches that state and district to its own list (`src/lib/locationData.ts`, 26 states). If a name does not match, it picks the **geographically nearest district**.

**Languages:** every page uses `tr(language, {...})` from `src/lib/i18n.ts` and supports English, Tamil, Telugu, Kannada, Malayalam and Hindi.

---

#### 1. Login / Register (`/login`, `src/app/login/page.tsx`)

**Why:** each farmer needs their own saved crops, location and profile.

**Sign In tab:**
- Takes email and password and calls `login()` in `src/lib/auth.ts`, which uses Supabase Auth (`signInWithPassword`).
- On success it copies the user's saved state and district into the app's location (`syncLocation`) and goes to `/`.

**Register tab:**
- Fields: Name, Email, Password, State and District. The district list refills when the state changes, and the first district is chosen by default.
- Checks: all fields must be filled, and the password must be at least **6 characters**.
- If Supabase needs email confirmation, it switches back to Sign In and shows "We sent a confirmation link to …".

**Errors:** known messages ("Incorrect email or password", "Too many attempts", "Login service is not configured" and others) are translated into all 6 languages.

**Be honest about:** "Join 10,000+ smart farmers" is marketing text, not a real count.

---

#### 2. Dashboard / Home (`/`, `src/app/page.tsx`)

**Why:** one simple starting point for a farmer who may not be comfortable with technology.

- **Welcome card:** "Namaste, <name>! 🙏", a short introduction and an "Explore Live Prices →" button that goes to `/crops`.
- **Notification button:** `NotificationManager` asks for browser notification permission and subscribes to Web Push (it fetches a VAPID public key from `/api/notifications/subscribe`).
- **Four shortcut cards:** Live Crop Prices, AgriBot, Market Analytics, My Tracked Crops.
- Prefetches the 8 main routes in the background.
- Everything here is static text. No calculations happen on this page.

---

#### 3. Crops Market (`/crops`, `src/app/crops/page.tsx`)

**Why:** a farmer wants today's price, whether it is above MSP, the weather, and a simple "sell or hold" hint, all on one screen.

The header has three view tabs (**All Crops**, **Mandi Comparison**, **Crop Varieties**), a crop dropdown grouped by category, and a variety dropdown when the crop has varieties.

**A. All Crops view**

| Feature | How it works | Live or simulated |
|---|---|---|
| Stat cards | Total crops (28), current price (the ticker price, or the variety's ₹/kg wholesale–retail range), MSP (or "—"), and temperature | Price is simulated, MSP is hard-coded, weather is live |
| **12‑second price ticker** | `setInterval(…, 12000)` calls `getLivePrice(crop)` for every crop | **Simulated** |
| Ticker formula | `change = (random − 0.485) × basePrice × 0.008`, then clamped between `0.72 × basePrice` and `1.45 × basePrice` (`src/lib/cropData.ts`) | Small random walk, slightly biased upward |
| Flash effect | A card flashes green or red for 700 ms when its price goes up or down. The % shown is the change since the previous tick. | UX detail |
| Search and category chips | Filter by translated crop name and by category: Cereals 3, Oilseeds 3, Vegetables 8, Pulses 3, Fruits 7, Spices 2, Cash Crops 2 | Client-side |
| MSP badge | "MSP ₹x ✓" if price ≥ MSP, otherwise "⚠️ Below MSP". 11 of the 28 crops have an MSP. | Hard-coded MSP |
| ₹/kg helper | Price per quintal ÷ 100 | Simple conversion |
| AI Recommendation card | See the explanation below the table | **Rule-based on simulated data** |
| Weather card | `fetchWeather()` in `src/lib/weather.ts` calls the **Open‑Meteo** API (no key needed): temperature, humidity, wind, and a 7‑day max/min/rain forecast | **Live** (mock fallback) |
| Crop impact rule | Heavy rain or thunderstorm → High. Any rain, drizzle or humidity > 80% → Medium. Temperature > 40 °C → High. Temperature < 10 °C → Medium. Otherwise Low. | Rule-based |
| Soil moisture | `humidity × 0.6 + random(0–30)` | **Simulated** (not a sensor) |

**How the AI Recommendation card works** (`getRecommendation` in `src/lib/cropData.ts`):

1. It builds 60 days of simulated price history (`generatePriceHistory`) and a 30‑day forecast (`generateForecast`).
2. It computes `priceChange% = (last forecast − current) / current × 100` and checks whether the 7‑day average is above the 30‑day average (that means the trend is "up").
3. It applies these rules:
   - If the change is above +5% and the trend is up → **HOLD**, with confidence `min(92, 70 + |Δ| × 1.5)`.
   - If the change is above +5% but the trend is down → **HOLD**, with confidence `min(80, 60 + |Δ|)`.
   - If the change is below −5% → **SELL**, with confidence `min(88, 65 + |Δ| × 1.5)`.
   - If the price is below 95% of MSP → **HOLD** ("wait for government procurement"), with confidence 75.
   - Otherwise → **HOLD** ("stable"), with a random confidence between 60 and 80.
4. Two things to be honest about:
   - The code never returns **BUY**. Only HOLD or SELL can appear.
   - Because the history is random, the advice can change when you pick the same crop again.

**Weather fallback:** if Open‑Meteo fails, `getMockWeather()` picks one of 4 fake conditions at random.

**B. Mandi Comparison view:** this shows the `MandiComparison` component (see section 13).

**C. Crop Varieties view:**
- 12 crops have variety data, for example Basmati 1121, Sona Masoori, Alphonso and Banganapalli.
- Each card shows origin state, characteristics, **mandi wholesale ₹/kg vs retail ₹/kg**, and season.
- Clicking a card selects that variety and jumps back to the grid, where the stat card then shows the variety's price.
- All of this data is **hard-coded** in `CROPS[].varieties`.

---

#### 4. Crop Detail (`/crop/[name]`, `src/app/crop/[name]/page.tsx`)

**Why:** a deeper look at one crop before deciding when to sell.

- **Unknown crop id:** shows "Crop not found" with a link back to `/crops`.
- **Live anchor:**
  - The page calls `/api/mandi-prices?crop=…&state=…&district=…` for the user's location.
  - If the response has `live: true` (official Agmarknet data), the current price becomes that average modal price, labelled "✓ Agmarknet · date · avg mandi".
  - It then **rescales the whole simulated series** so the last point equals the real price: `k = livePrice / lastSimulatedPrice`, and every history and forecast point is multiplied by `k`.
  - If there is no live price, the price is labelled "Estimated".
- **Four stat cards:** current price, MSP (above or below), AI recommendation (same `getRecommendation` rules as above) and a confidence bar.
- **30‑Day Forecast chart** (Recharts `ComposedChart`):
  - Shows the last 14 points of history (green line), 30 forecast points (dashed gold line) and a shaded confidence band.
  - Timeframe buttons **1M / 3M / 1Y** call `generatePriceHistoryByTimeframe`:
    - 1M: 30 days, one point per day.
    - 3M: 90 days, one point every 2 days.
    - 1Y: 365 days, one point every 5 days.
    - Each point adds a small seasonal sine factor plus noise, clamped between 0.68× and 1.42× the base price.
  - Forecast formula: daily trend `(random − 0.44) × 0.004`, noise ±1.1% of base, clamped between 0.65× and 1.55× base. Band half‑width = `base × 0.035 × (1 + 0.018 × day)`, so the band gets wider further into the future.
  - The chart is clearly labelled "Estimated trend (simulated)".
- **Chart / Table toggle:** the table shows the last 20 rows with date, price, band and an "Est. history" or "Est. forecast" badge.
- **Influencing Factors:** Weather (Moderate), Demand & Supply (High), Logistics (Low), Govt Policy (Medium). These are **hard-coded text**, not calculated.
- **Mandi Comparison:** a compact version of the component in section 13.
- **Price History table:** the last 20 simulated days with volume, weather word and day‑to‑day % change.
- **"Generate Report" button:** `window.print()`. The browser's print dialog lets the user save it as a PDF.

---

#### 5. My Crops (`/my-crops`, `src/app/my-crops/page.tsx`)

**Why:** a farmer only cares about the few crops they grow. This page is their personal watch‑list plus price alerts.

| Feature | How it works |
|---|---|
| Portfolio | A list of crop ids from `getCurrentUser().portfolio`, saved through `updatePortfolio(email, ids)` in `src/lib/auth.ts` (Supabase `profiles` table). |
| **+ Add Crop** modal | Multi-select with search in English, Tamil, Telugu or the current language. Duplicates are removed with `new Set`. |
| Remove | Takes the crop out of the portfolio and saves again. |
| Filters | Search box, category chips, and a season dropdown (All, Kharif, Rabi, Annual, Zaid/Kharif, Summer). Shows "Showing X of Y crops". |
| Crop cards | Image (falls back to an emoji), the **simulated** price refreshed every **15 s**, % change vs the base price, MSP status, a "View Forecast" link and a Remove button. |
| **Export PDF Report** | `window.print()` (print to PDF). |

**Portfolio Performance Graph** (`src/components/PortfolioPerformanceGraph.tsx`):
- For each tracked crop it generates a simulated 30‑day history (`"1M"`). For each day it **adds up the per‑quintal prices** of all tracked crops.
- It shows the latest total, the change in ₹ and in % (`(last − first) / first × 100`), and the line turns green or red.
- **Honest note:** this is **1 quintal of each crop**, not the farmer's real quantity, and the data is simulated.

**Smart Mandi Price Threshold Alerts:**
- Alerts are saved in `localStorage` under `agri_price_alerts` (`src/lib/priceAlerts.ts`). Old sample alerts that earlier versions seeded automatically are removed when alerts are read.
- Each alert card shows the crop, mandi, the condition ("Rises Above ≥" or "Falls Below ≤" plus target), the current price, and a status: 🎯 Target Reached, 🟢 Active Tracking, or Inactive.
- Buttons:
  - **Pause / Resume** → `togglePriceAlert`.
  - **📲 Test Push** → sends a fake "Mandi Target Hit" in‑app notification and a Web Push to this device.
  - **🗑️** → `deletePriceAlert`.
- **How alerts are checked:**
  - `src/lib/AppContext.tsx` runs a background check 4 s after load and then **every 60 s**.
  - It compares each active alert with `getLivePrice(crop)`, the **simulated** price, not Agmarknet. The mandi name is not used in the check.
  - It fires at most **once every 10 minutes** per alert.
  - When it fires, it adds an in‑app notification and calls `dispatchPriceNotification` → `sendPushToThisDevice` (Web Push).
- **The "Web Push Enabled" badge is always shown.** It does not check whether push is really on.

---

#### 6. Data & Analytics (`/analytics`, `src/app/analytics/page.tsx`)

**Why:** to show which crops are rising, falling or risky, and to show how a forecasting model would be evaluated.

**A. Market Price Trend Heatmap** (`src/components/MarketHeatmap.tsx`)
- A grid of colour‑coded cards with a category filter.
- Colours:

| Weekly change | Colour | Badge |
|---|---|---|
| ≥ +5% | dark green | Peak Gainer 🚀 |
| > 0% | green | Gaining 📈 |
| 0% | neutral | Stable ⚖️ |
| > −5% | red | Dropping 📉 |
| ≤ −5% | dark red | Sharp Drop ⚠️ |

- The cards look clickable (pointer cursor) but have **no click action**.

**B. Price Volatility & Risk Alerts** (`src/components/VolatilityAlerts.tsx`, data from `getCropVolatilityList()`)
- **Hard-coded / deterministic formula, not market data.** The numbers come from each crop's position in the list:
  - Perishables (vegetables and fruits): `baseVol = 65 + (idx % 4) × 8`.
  - Other crops: `baseVol = 18 + (idx % 5) × 6`.
  - The score is clamped between 12 and 95.
  - Risk: score > 60 → High, > 35 → Moderate, otherwise Low.
  - Weekly change is also a formula of the index. The "current price" is just the base price.
- Advisory text: High risk with a falling price → "Sharp price drop… sell at highest‑paying APMC Mandi". High risk with a rising price → "High demand spike… capitalize now". Otherwise → "Stable market".
- Shows count cards (High, Moderate, Stable), an average index, filter chips and a table with a volatility meter bar.

**C. Model Accuracy cards (MAE, MSE, R², Last Update)**
- `computeHistoryAndMetrics` makes simulated history, adds ±2% random noise to create a fake "prediction", and then calculates:
  - MAE = mean |actual − predicted|
  - MSE = mean (actual − predicted)²
  - R² = 1 − SS_res / SS_tot, clamped between **0.70 and 0.99**
- The page labels these "(simulated demo metrics)". **No real ML model is trained or tested.**

**D. Charts**
- Price history area chart with **7 / 14 / 30 / 60 / 90‑day** buttons (simulated).
- 14‑day volume bar chart (random 7,000–13,000 units).
- Category pie chart (counts from the crop catalogue).
- "Crop Price Comparison": up to 8 crops of the same category, catalogue reference price vs MSP.

**E. Raw data table and CSV download**
- Last 20 rows with a vs‑MSP column.
- **📥 Download CSV** builds a CSV in the browser: columns Date, Estimated Price, Volume, Weather, MSP. It saves through a `Blob` as `<Crop>_market_data_<N>d.csv`.

---

#### 7. Government Schemes, "AgriSaarthi" portal (`/schemes`, `src/app/schemes/page.tsx`)

**Why:** farmers often miss schemes they qualify for. This page puts **103 schemes** in one place with simple eligibility help.

**Data:**
- `ALL_GOVERNMENT_SCHEMES` in `src/lib/governmentSchemesData.ts` has 103 entries in **8 categories**:

| Category | Count |
|---|---|
| Crop & Seeds | 37 |
| Financial Assistance | 22 |
| Equipment | 13 |
| Irrigation | 10 |
| Horticulture | 8 |
| Insurance | 8 |
| Credit & Loans | 3 |
| Solar & Energy | 2 |

- 14 schemes are "All India" and the rest are state schemes. The largest groups are Tamil Nadu 15, and Kerala, Bihar and Assam with 10 each.
- Each scheme has an icon, title, state, category, coverage, benefit, description, official URL, eligibility list, documents list and how‑to‑apply steps.
- Title, description and benefit are translated for all 103 schemes (`getLocalizedScheme` in `src/lib/schemeTranslations.ts`). **Eligibility, documents and how‑to‑apply stay in English.**
- This is **hard-coded** data. It is not fetched from a government API.

**Header:** AgriSaarthi branding, a language selector (6 languages) and a Refresh button that resets the filters.

The page has 8 views, chosen with tile buttons:

| View | What it does |
|---|---|
| 🏛️ **Schemes** | Search across title, description, benefit, state and category. Category dropdown and chips, and a **state filter with 37 options** (All States, All India, and 35 states and UTs). Picking a state shows **that state's schemes plus all "All India" schemes**. Cards have Details (opens a modal), ⭐ Save, 📊 Compare and a link to the official portal. Shows "Showing X of 103". |
| Detail modal | Benefit, description, coverage, eligibility list, required documents checklist, how to apply, Save button and official portal link. |
| ⭐ **Saved** | Bookmarks stored in `localStorage` key `agri_saved_schemes`, with a clear‑all option. |
| 📊 **Compare** | Up to **4 schemes** side by side (a toast warns if you try a 5th). Rows: category, coverage, key benefit, first 3 documents, first 2 eligibility points, official link. |
| 🎯 **Eligibility checker** | A 6‑question form. Rules are explained below this table. |
| 🧮 **Calculators** | PMFBY premium and KCC interest. Formulas are explained below this table. |
| 🔔 **Alerts** | 5 **hard-coded** news items (PM‑KISAN DBT, PMFBY Kharif window, SMAM, PMKSY drip, Soil Health Card camps). Note: the PM‑KISAN item says "17th installment", which does not match the PM‑KISAN tracker (section 8C), which lists up to the 21st. |
| 📍 **Help Centers** | 5 office types (CSC, KVK, District Agriculture Office, Kisan Call Centre 1800‑180‑1551, PM‑KISAN Helpline 155261). Phone numbers are `tel:` links. "Map" opens a Google Maps search for "<office> near <user district, state>". |
| 📋 **Applications** | A simple tracker the farmer fills in. They type a scheme name and reference number, it is saved as "Under Review" in `localStorage` key `agri_user_applications`, and it can be deleted. **Three demo records** are pre‑filled the first time. Statuses are **not** fetched from any government system. |

**Eligibility checker rules** (`eligibleSchemes`):
- The 6 questions: land size (marginal, small, medium, large), ownership (owner, tenant, sharecropper, SHG/FPO), income‑tax payer, main crop type, irrigation source, Aadhaar linked to bank.
- Only schemes for "All India" or the **user's own state** are considered.
- PM‑KISAN is hidden if the farmer is not a landowner, pays income tax, or has no Aadhaar link.
- PM‑KMY is hidden unless the farmer is small or marginal and not a tax payer.
- Horticulture schemes appear only if the crop type is horticulture.
- Irrigation schemes appear only for borewell or rainfed farms.
- Results show state schemes first and are **limited to 8**.
- A disclaimer says real verification is done by officials.

**Calculator formulas:**
- **PMFBY premium:**
  - Farmer rate: Kharif food 2%, Rabi food 1.5%, commercial or horticulture 5%.
  - `totalSum = area × sumInsuredPerUnit`
  - `actuarialPremium = totalSum × 12%` (12% is an assumed figure)
  - `farmerPremium = totalSum × rate`
  - `govtSubsidy = max(0, actuarial − farmer)`
  - Example: Kharif, area 1.5, sum insured ₹45,000 → total ₹67,500, farmer pays ₹1,350, government pays ₹6,750.
- **KCC interest** (simple interest):
  - `standard = amount × 7% × months/12`
  - If the loan period is 12 months or less: `incentive = min(amount, ₹3 lakh) × 3% × months/12`
  - `prompt interest = standard − incentive`
  - Also shows total repayment and savings.

---

#### 8. Agri‑Tools (`/tools`, `src/app/tools/page.tsx`)

**Why:** practical calculators and planners a farmer would otherwise do on paper. The page has 7 tabs.

**A. 🚛 Mandi Arbitrage (net profit after transport)**
- Inputs: crop, quantity in **quintals** (default 30), vehicle, and fuel price in ₹/litre (default 98).
- Vehicles (hard-coded):

| Vehicle | km per litre | Labour cost |
|---|---|---|
| Tata Ace | 16 | ₹500 |
| Bolero Pickup | 12 | ₹700 |
| Tractor Trolley | 8 | ₹400 |

- Mandis (hard-coded):

| Mandi | Distance | Price factor |
|---|---|---|
| Nellore | 15 km | 0.95 × base price |
| Guntur | 110 km | 1.05 × base price |
| Chennai Koyambedu | 180 km | 1.15 × base price |

- Formula (`arbitrageResults`):
  ```
  gross     = basePrice × priceFactor × qty
  fuelCost  = (distance × 2 / km_per_litre) × fuelPrice   // round trip
  toll      = distance > 50 ? ₹250 : 0
  netProfit = gross − (fuelCost + toll + labour)
  ```
- Results are sorted by net profit and the top one gets a "🏆 Best Market Option" badge.
- Example: rice (₹2,441/q), 30 q, Tata Ace, ₹98/L. Chennai net ≈ ₹81,260, Guntur ≈ ₹74,794, Nellore ≈ ₹68,885. Chennai wins.
- Prices here are the catalogue base price, not live.

**B. 💳 KCC Loan** (`src/components/KccCalculator.tsx`, logic in `calculateKccLoan`)
- Inputs: crop, and land area in acres (clamped between 0.5 and 50 when the field loses focus).
- **Scale of finance per acre** (hard-coded for 13 crops, for example rice ₹26,000, cotton ₹34,000, banana ₹50,000; ₹25,000 for any other crop).
- Credit limit:
  - Crop limit = scale × acres
  - \+ 10% post‑harvest/household
  - \+ 20% farm‑asset maintenance
  - = total sanctioned limit
- Interest (`calculateKccInterest`): 7% base rate. A 3% prompt‑repayment incentive applies **only to the first ₹3 lakh** and only if repaid within 12 months, which gives an effective 4%. Any amount above ₹3 lakh uses an *assumed* 7%, and the UI says this.
- EMI uses the standard amortization formula:
  `EMI = P·r·(1+r)^n / ((1+r)^n − 1)` with `r = annual rate / 12` and `n = 12`.
- Example: rice, 3 acres → crop limit ₹78,000 + ₹7,800 + ₹15,600 = **₹1,01,400**. Annual interest at 4% = ₹4,056, interest saved = ₹3,042, EMI ≈ ₹8,634 per month.
- The note mentions collateral‑free loans up to ₹2 lakh (RBI, from 1 Jan 2025).

**C. 🏛️ PM‑KISAN** (`src/components/PmKisanTracker.tsx`)
- A banner clearly says **"Demo data — this app cannot look up real beneficiary records"**, with a link to pmkisan.gov.in (Farmers Corner → Know Your Status).
- Explains the scheme: ₹6,000 per year as 3 × ₹2,000 DBT payments, and the checklist (e‑KYC, Aadhaar seeded to bank, land records seeded).
- Table of past nationwide release dates, instalments **15th to 21st** (for example 21st on 19 Nov 2025), from `getPmKisanSampleRecord()`.
- The sample beneficiary is "Sample Farmer (Demo)".

**D. 🧮 Cost & Profit** (`src/components/CostProfitEstimator.tsx`, logic in `calculateCultivationCostAndProfit`)
- Works for 10 crops that have cost data: rice, wheat, corn, mustard, soybean, groundnut, sugarcane, cotton, tomato, onion.
- Inputs: acres (0.5–50), yield per acre (defaults to the crop's average, minimum 1) and selling price (defaults to the base price, minimum ₹100).
- Per‑acre costs (hard-coded): seed, fertilizer, pesticide, labour, machinery. For example rice = 1,500 + 3,800 + 2,200 + 6,500 + 4,000 = ₹18,000 per acre.
- Formula:
  ```
  totalCost = (seed + fert + pest + labour + machine) × acres
  yieldQ    = round(yieldPerAcre × acres)
  revenue   = yieldQ × price
  netProfit = revenue − totalCost
  ROI %     = netProfit / totalCost × 100
  ```
- Example: rice, 3 acres, 25 q per acre, ₹2,441 → cost ₹54,000, revenue ₹1,83,075, net ₹1,29,075, ROI 239%.
- Shows "Highly Profitable" if net ≥ 0, otherwise "High Input Cost Warning".

**E. 📅 Crop Calendar** (two parts)

1. **State crop calendar** (`src/components/CropCalendar.tsx`, data from `getCropCalendarData`)
   - A 12‑month grid for 7 crops (rice, wheat, cotton, mustard, tomato, onion, groundnut), coloured by stage: 🌱 sowing, 💧 irrigation/flowering, 🌾 harvest.
   - Has a water‑need tag, a state dropdown (8 states), a season filter, and a row you can expand to read the advisory.
   - **Honest note:** the months are the same for every state. Only the rice advisory text inserts the state name.

2. **Schedule planner**
   - Pick a crop (your tracked crops are listed first) and a sowing date.
   - Tasks are calculated as days after sowing:
     - Vegetables: sow 0, transplant 22, staking 40, fertilizer 55, harvest 75.
     - Oilseeds: sow 0, thinning 20, irrigation 45, harvest 100.
     - Other crops: sow 0, irrigation 15, fertilizer 35, irrigation 60, fertilizer 80, harvest 115.
   - **Smart reminders:**
     - A task within ±3 days of today → "Upcoming in N days", or "Completed" if ticked.
     - More than 3 days past and not ticked → "Overdue".
   - The ticks are kept **in memory only** and are lost on reload.
   - **Export (.ics):** builds an iCalendar file with one all‑day event per task, downloaded as `crop_schedule_<crop>.ics`. It can be imported into Google Calendar or a phone calendar.

**F. 🔍 Pest Diagnosis**
- The farmer picks a crop, a plant part (leaf, fruit, stem, root, or all) and a symptom from a list.
- "Scan & Diagnose Leaf" waits **2 seconds** (a fake scanning animation) and then shows the disease name with **organic** and **chemical** treatment.
- **Simulated:** there is no camera and no image AI. Answers come from a hard-coded table for 12 crops (rice, wheat, cotton, tomato, onion, mango, banana, potato, corn, soybean, gram, turmeric). Other crops get generic answers by category (fruit, vegetable/spice, or default).

**G. 🌦️ Weather Risk Advisor**
- The farmer picks a crop, a harvest month (October to December) and a weather alert type.
- Output by alert type:

| Alert | Risk | Price impact | Advice |
|---|---|---|---|
| Heavy rain | High | −15% to −25% (grain moisture penalty) | Harvest now, cover with tarpaulin, sell quickly |
| Heatwave | Medium | −10% yield | Light early‑morning irrigation, mulching |
| Cyclone | Critical | −40% | Clear drainage, postpone harvest |
| Normal | Low | 0% | No action needed |

- **Honest note:** only the weather alert changes the result. The crop and month dropdowns are shown but **not used** in the calculation, and the result is hard-coded.

---

#### 9. AgriBot chatbot (`/chatbot`, `src/app/chatbot/page.tsx`)

**Why:** farmers can ask questions in their own language by typing or speaking.

| Feature | How it works |
|---|---|
| Ask a question | `POST /api/chat` with the message, earlier turns and language. The server (`src/app/api/chat/route.ts`) calls **Groq** with a system prompt that includes the app's current MSP list. Models are tried in order: `GROQ_TEXT_MODEL` (default `qwen/qwen3.8-27b`), then `openai/gpt-oss-20b`. Each gets up to 2 attempts, only the last 6 history messages are sent, messages are capped at 2,000 characters, and the total time limit is 60 s. |
| Offline fallback | If Groq fails, `getChatbotResponse()` in `src/lib/chatbot.ts` gives a **rule-based keyword answer**. Topics are checked in this order: paddy pests, cotton, tomato/vegetables, general pests, prices/MSP, schemes, a specific crop from the catalogue, greetings, and then a general help message. English keywords must match whole words; Indian‑language keywords match anywhere in the text. The MSP figures in these offline answers are typed into the code. |
| Language auto‑detect | `detectLanguage()` checks the Unicode script of the text (Tamil 0B80–0BFF, Telugu 0C00–0C7F, Kannada 0C80–0CFF, Malayalam 0D00–0D7F, Devanagari 0900–097F). If you type in Telugu, the reply language switches to Telugu automatically. |
| Language buttons | 6 buttons. They also change the language of the whole app. |
| 🎤 Voice input | Uses the browser Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`) with locale `en-IN`, `ta-IN`, `te-IN`, `kn-IN`, `ml-IN` or `hi-IN`. It runs continuously with interim results and restarts itself automatically until the user stops it. It shows a message if the browser is not supported or microphone permission is denied. Works best in Chrome or Edge. |
| 🔊 Read aloud | `speechSynthesis` reads the answer after removing markdown and emojis. It picks a voice that matches the language. "Auto‑speak" is saved in `localStorage` key `agri_auto_speak`. |
| Other buttons | Quick‑prompt chips, copy message (with a fallback for older browsers), **Save** chat and Saved‑chats list (`localStorage` key `agri_saved_chats`), and Clear. |

---

#### 10. Document Scanner (`/documents`, `src/components/DocumentOcr.tsx`)

**Why:** government letters and passbooks are hard to read. This explains them in plain words in the farmer's language.

**Upload:**
- Click or drag‑and‑drop an image or PDF.
- Images are first **compressed in the browser**: longest side 1,200 px, JPEG quality 0.85.
- The file is posted to `/api/ocr` and the browser waits up to **90 seconds**.
- Server size limits: images 3 MB, PDFs 4 MB.

**Server side** (`src/app/api/ocr/route.ts):
- Uses a Groq vision model for images. For PDFs it also extracts the raw text and adds it to the prompt.
- The AI returns JSON with document type, title, date, issuing authority, plus "what is this", "how to use it", a summary and action items in **6 languages**.

**8 sample documents** (PM‑KISAN e‑KYC, KCC sanction, PMFBY, MSP procurement, Soil Health Card, drip subsidy, land patta, passbook):
- Only the **name** of the sample is sent. The AI writes typical content for that kind of document; it does not read a real file.

**Result view:**
- A summary‑language switch (falls back to English if a translation is missing).
- A label showing which mode was used. If AI is not available, it shows "**Basic summary only — AI unavailable, the document's text was not read**".

**History:** the last 20 scans are saved in `localStorage` key `agri_ocr_history` and can be cleared.

---

#### 11. Settings (`/settings`, `src/app/settings/page.tsx`)

**Why:** keep the location, profile and preferences correct so that weather, mandi and scheme results fit the farmer.

- **Not logged in:** shows a 🔒 card with a Login button.
- **Profile:** name, role (Farmer, Trader, Agronomist, Student, Guest) and avatar (8 emoji choices).
- **Location:** state and district. Changing them updates the app location right away and saves it in `localStorage`.
- **Farm profile:** land size in acres, soil type (5 choices) and irrigation type (5 choices).
- **Preferences:** dark mode toggle (`toggleDark`) and language.
- **Save:**
  - Calls `updateUserProfile`, `updateFarmProfile` and `updateUserLocation` in `src/lib/auth.ts`, which write to Supabase.
  - Updates the location using the district's latitude and longitude. If the district is not found, it falls back to coordinates 9.9252, 78.1198.
  - Shows a success message, then **reloads the page after 1.5 s** so the sidebar picks up the changes.

---

#### 12. Price Alert Modal (`src/components/PriceAlertModal.tsx`)

Opened from My Crops and from every row of the Mandi Comparison table.

- **Fields:**
  - Crop (shows its base price).
  - Mandi: 8 common mandis plus "All Regional Mandis". Picking a mandi fills in its district and state.
  - Condition: Rises Above ≥ or Falls Below ≤.
  - Target ₹ per unit.
- **Default target:**
  - Clicked price × 1.08, or ₹2,400 if no price was passed.
  - After changing the crop: base × 1.1 for "above", or base × 0.9 for "below".
- **Preview line:** "You'll get an instant lockscreen alert when … reaches …".
- **On save:**
  1. Rejects a target of 0 or less.
  2. `savePriceAlert` → `localStorage`.
  3. Adds an in‑app notification.
  4. Sends a confirmation Web Push to this device.
  5. Closes itself after 1.2 s. Pressing Esc also closes it.

---

#### 13. Mandi Comparison (`src/components/MandiComparison.tsx`)

**Why:** the same crop sells at different prices in different APMC yards (government‑regulated wholesale markets). This shows the best‑paying one.

- **Inputs:** state, district and crop. They start from the user's location and change when the location changes.
- **Where the prices come from**, in priority order, via `src/app/api/mandi-prices/route.ts`:
  1. **Official Agmarknet** (data.gov.in). This needs the `DATA_GOV_API_KEY` setting and works only for crops priced per quintal.
     - Up to 8 markets, with markets in the user's district listed first.
     - If a market reports the crop more than once, the median modal price is used.
     - Results are cached for 1 hour per state.
     - Shows a "Live Agmarknet · <date>" badge and Min–Max price columns.
  2. **Groq AI estimate:** labelled "AI‑estimated, not official"; the UI shows "Estimated prices".
  3. **Price model:** mandi names for the district come from `src/lib/mandiDatabase.ts`, with `price = base × (1 + 0.035 × index)`.
  4. While loading, or if the API fails, the browser uses `getMandiComparison()`: a hard-coded list of yards for 11 crops (for example Guntur for chilli, Lasalgaon for onion, Erode for turmeric), or a list per state, with `price = base × (1 + 0.08 × index)`.
- **Best mandi banner:** the highest‑priced mandi, with "+₹X higher than baseline".
- **Table:**
  - Mandi, place, price (with ₹/kg), difference, and either the min–max range (official data) or arrival volume (estimates).
  - Date (official) or trend (estimates).
  - Badge: 🏆 Highest, Good Return (price ≥ average), or Baseline.
  - 🔔 Alert button that opens the Price Alert Modal.
- **Search:** filters by mandi name or district.
- The subtitle always says whether prices are **official** or **indicative**.

---

#### 14. Built but not used

- `src/components/NearbyFarmerNetwork.tsx` ("Nearby Farmer Network Insights") is **not imported by any page**, so users never see it.
- Its data (`getNearbyFarmerNetwork`) is **hard-coded**: 14,820 farmers, rice 42.5%, chilli 28% and so on, the same for every district.
- Its text is English only.

---

#### Quick summary: live vs simulated

| Live or real | Simulated, rule-based or hard-coded |
|---|---|
| Open‑Meteo weather and 7‑day forecast | 12 s / 15 s price ticker (random walk) |
| Agmarknet mandi prices (only with an API key) | Price history, 30‑day forecast and confidence band |
| Groq AI chat, OCR and AI mandi estimates | BUY/SELL/HOLD advice (only HOLD or SELL can appear), volatility, heatmap |
| Supabase login and profile | MAE / MSE / R² "model accuracy" |
| Web Push notifications | Pest scanner, weather risk advisor, factors panel |
| GPS + reverse geocode location | PM‑KISAN record (marked as demo), scheme alerts, demo applications |
| 103 schemes (curated, static data) | Price alerts checked against simulated prices |


---

## 8. Languages, design system, quality & honest status

### Multilingual support, design system, code quality and honest project status

This section explains how AgriPredict speaks six languages, how the look and feel is built, how good the code is, and what is fully working, partly working or simulated.

---

### 1. Multilingual support (i18n)

"i18n" is short for "internationalisation", which means making an app work in more than one language.

#### 1.1 The six languages

| Code | Language | Script | Speech locale |
|---|---|---|---|
| `en` | English | Latin | `en-IN` |
| `ta` | Tamil | Tamil | `ta-IN` |
| `te` | Telugu | Telugu | `te-IN` |
| `kn` | Kannada | Kannada | `kn-IN` |
| `ml` | Malayalam | Malayalam | `ml-IN` |
| `hi` | Hindi | Devanagari | `hi-IN` |

**Why:** Most Indian farmers are more comfortable reading their own language than English. The six were chosen because they cover the four South Indian states plus the Hindi belt.

The `Language` type is a union of these six codes: `"en" | "ta" | "te" | "kn" | "ml" | "hi"`. It is declared in `src/lib/AppContext.tsx`, and the same declaration is copied into `src/lib/appTranslations.ts` and `src/lib/chatbot.ts`. This is a small duplication and could be merged into one shared type.

#### 1.2 How the language is chosen and stored (`agri_lang`)

**What:** One global `language` value, held in React Context by `AppProvider` in `src/lib/AppContext.tsx`.

**How:**
1. **Default.** On the server and on the first browser render, `language` is `"en"`.
2. **Restore after load.** A `useEffect` reads `localStorage.getItem("agri_lang")`. If the saved value is in `SUPPORTED_LANGUAGES`, it is applied. Anything else, such as a corrupted or old value, is ignored and English stays.
3. **Change.** `setLanguage(lang)` updates the state and writes `localStorage.setItem("agri_lang", lang)`, so the choice survives a page reload.
4. **`<html lang>`.** Another effect runs `document.documentElement.lang = language`. Screen readers and the browser's speech engine use this attribute to pick a voice. `src/app/layout.tsx` renders `lang="en"`, and the effect corrects it in the browser.

**Where the user can change it** (all call `setLanguage`):
- the language dropdown in the sidebar (`src/components/Sidebar.tsx`)
- the Settings page (`src/app/settings/page.tsx`, `#settings-language`)
- the Schemes page dropdown (`src/app/schemes/page.tsx`)
- the chatbot language chips (`src/app/chatbot/page.tsx`)

**Why localStorage and not the database?** It is instant, works before login, and needs no network. The downside: the choice is per browser and is not synced across devices.

#### 1.3 The translation helpers (`src/lib/i18n.ts`)

**`tr(language, text)`** is the main helper.
```ts
export type Localized = { en: string } & Partial<Record<"ta"|"te"|"kn"|"ml"|"hi", string>>;
export function tr(language, text: Localized) { return text[language] || text.en; }
```
- The type requires English. Every other language is optional.
- **Fallback:** if a translation is missing or is an empty string, English is shown. The screen never shows a blank or a raw key.
- Translations are written inline next to the UI, for example `tr(language, { en: "Today", ta: "இன்று", te: "ఈరోజు", ... })`. This keeps each text and its translations in one place, but a page with many strings gets long.
- About 20 pages and components import it (analytics, chatbot, crop detail, crops, documents, login, my-crops, schemes, settings, tools, Sidebar, NotificationManager, PriceAlertModal, KccCalculator, CropCalendar, and others).

**`cropName(crop, language)`** returns the local name of a crop.
- `src/lib/cropData.ts` stores only Tamil and Telugu names on each crop (`nameTA`, `nameTE`). `i18n.ts` therefore has its own `CROP_NAMES` table covering all five non-English languages for 28 crop ids (rice, wheat, corn, ..., pomegranate).
- Rules: for English, return `crop.name`. Otherwise return `CROP_NAMES[crop.id][language]`, and fall back to the English `crop.name` if that is missing.
- Example: `cropName({id:"rice", name:"Rice (Paddy)"}, "hi")` gives "धान".

**`categoryName(category, language)`** works the same way for crop categories: "All", "Cereals", "Oilseeds", "Cash Crops", "Vegetables", "Pulses", "Fruits" and "Spices". It falls back to the English category.

`src/lib/cropData.ts` still has older helpers: `getCropName` and `getCropDesc` (Tamil and Telugu only), and `getVarietyName` and `getVarietyDesc` (all five languages, through `nameKN`, `nameML`, `nameHI` and similar fields). Crop descriptions are therefore translated only to Tamil and Telugu. Kannada, Malayalam and Hindi users see the English description.

#### 1.4 Fixed UI labels (`src/lib/appTranslations.ts`)

**What:** `APP_TRANSLATIONS`, a typed table of **30 keys** per language: navigation, Sign In/Out, "Crops Market", "LIVE TICKER", "MSP PRICE", BUY/HOLD/SELL, risk levels, "Export PDF/CSV", the search placeholder and so on.

**How:** `src/components/Sidebar.tsx` and `src/app/crops/page.tsx` use it like this: `const T = APP_TRANSLATIONS[language] || APP_TRANSLATIONS.en; ... T.signOut`.

**Why a separate table:** The TypeScript interface `Translations` forces every language to define every key, so a missing key is a compile error. `tr()` cannot check this, because only `en` is required there.

#### 1.5 Government scheme translations (`src/lib/schemeTranslations.ts`)

This is the largest data file in the project: about 2,435 lines and roughly 287 KB.
- `CATEGORY_TRANSLATIONS` holds scheme categories ("Financial Assistance", "Insurance", "Irrigation", ...) in all six languages. `getCategoryLabel()` uses it.
- `STATE_TRANSLATIONS` holds state names, and `getStateLabel()` uses it.
- `SCHEME_LOCALIZATIONS` holds the title, description and benefit for each scheme id. There are **103 schemes** in `governmentSchemesData.ts` and **103 localized entries**, each with **Telugu, Tamil, Malayalam and Hindi**.
- **Honest gap:** there are **no Kannada scheme texts** (0 `kn` entries). A Kannada user sees the scheme title, description and benefit in English. Only the category and state labels are translated. The file's header comment also lists only en/te/ta/ml/hi.
- `getLocalizedScheme(scheme, lang)` returns the scheme unchanged for English. Otherwise it swaps in the localized title, description (`description` or `desc`) and benefit when they exist, and it always translates the category and coverage. Each field falls back to English separately.

#### 1.6 What is translated and what is left in English on purpose

| Translated | Kept in English (on purpose or as a known gap) |
|---|---|
| Navigation, buttons, page headings, tool labels | **Brand and product names:** "AgriPredict", "AgriBot", "Groq", "Supabase" |
| Crop names (28 crops) and crop categories | **Official acronyms:** MSP, APMC, KCC, PM-KISAN, PMFBY, DBT, e-KYC. Farmers know these terms as they are, and official forms use them. |
| Scheme title, description and benefit (4 languages) | **Pesticide and chemical names:** Imidacloprid, Tricyclazole, Copper Oxychloride. Even inside Tamil text in `src/lib/chatbot.ts` they stay in Latin script so a farmer can show them at a shop. |
| Buy/Hold/Sell recommendation reasons (all 6 languages, built in pages) | **CSV export headers** (`Date, Estimated Price (INR), Volume, Weather, MSP (INR)` in `src/app/analytics/page.tsx`), so Excel and other tools read the file reliably |
| Alert messages in the chatbot, such as mic denied or speech unsupported | **Numbers and dates** use the `en-IN` format everywhere (₹1,23,456, "03 Nov") |
| OCR results (the API asks for EN/TA/TE/KN/ML/HI summaries) | **Known gaps:** price-alert toast text and location toasts/alerts in `AppContext.tsx` are English only. The loading screen ("Loading AgriPredict...") is English. Crop descriptions are only in EN/TA/TE. Weather condition words in the generated history ("Sunny", "Rainy") are English. |

The recommendation reasons work like this. `getRecommendation()` in `src/lib/cropData.ts` returns only `reason`, `reasonTA` and `reasonTE`. `src/app/crops/page.tsx` and `src/app/crop/[name]/page.tsx` rebuild the same message in Kannada, Malayalam and Hindi using the percentage and the MSP value (code comment: "cropData only carries English/Tamil/Telugu reasons").

#### 1.7 Voice and locale handling (chatbot)

All of this is in `src/app/chatbot/page.tsx` and uses the browser's built-in Web Speech API. No paid speech service is involved.

- **Locale map:** `LOCALES = { en:"en-IN", ta:"ta-IN", te:"te-IN", kn:"kn-IN", ml:"ml-IN", hi:"hi-IN" }`.
- **Speech-to-text (mic input):**
  - Uses `window.SpeechRecognition || window.webkitSpeechRecognition` with `continuous = true`, `interimResults = true` and `lang = LOCALES[selectedLang]`.
  - Final pieces build up in a ref. Interim text is shown live in the input box.
  - If the browser stops recognition on its own, the code restarts it after 30 ms, as long as the user has not switched the mic off.
  - If the mic permission is denied (`not-allowed` or `service-not-allowed`), recording stops and a translated alert appears.
  - If the API is missing (Firefox, for example), a translated alert suggests Chrome or Edge.
- **Text-to-speech (read aloud):**
  - `cleanTextForSpeech()` removes markdown symbols, links and emoji, turns "₹" into "rupees ", and turns line breaks into ". ".
  - The utterance gets `lang = targetLocale` and `rate = 0.95`.
  - **Voice matching:** it first looks for an exact locale match (e.g. `ta-IN`), then for the same base language (`ta`). If neither exists, it **does not force another voice**. The browser then chooses from `utterance.lang`. The code comment explains that forcing a Hindi voice on Tamil text would mispronounce it.
  - "Auto-speak" is a toggle saved in `localStorage` as `agri_auto_speak`.
- **Chatbot language detection:** `detectLanguage()` in `src/lib/chatbot.ts` checks Unicode ranges:

  | Unicode range | Language |
  |---|---|
  | `\u0B80-\u0BFF` | Tamil |
  | `\u0C00-\u0C7F` | Telugu |
  | `\u0C80-\u0CFF` | Kannada |
  | `\u0D00-\u0D7F` | Malayalam |
  | `\u0900-\u097F` | Hindi |
  | anything else | English |

- **Limitation:** voice quality depends on which voices the user's OS or browser has installed. Kannada and Malayalam voices are often missing on desktop machines.

---

### 2. Design system (`src/app/globals.css`)

#### 2.1 Approach

**What:** One global stylesheet with **CSS custom properties** (variables such as `--primary`) and reusable class names (`.card`, `.btn`, `.badge`, ...). Many components also use inline `style={{...}}` that points at these variables.

Tailwind CSS v4 is installed and imported (`@import "tailwindcss"`), but most of the styling is the custom classes and inline styles, not Tailwind utility classes.

**Why variables:** To change the theme, you only redefine the variables. Every component follows automatically.

#### 2.2 Palette: "warm earthy" light theme (`:root`)

| Token | Value | Use |
|---|---|---|
| `--primary` | `#5C7A3E` (leaf green) | buttons, active links, `themeColor` in `layout.tsx` |
| `--primary-light` / `--primary-dark` | `#7A9E52` / `#3A5227` | hovers, gradients, prices |
| `--secondary` | `#C4964B` (wheat/amber) | amber buttons, logo gradient |
| `--bg` / `--bg-card` | `#FAF7F2` / `#FFFDF8` | page background and card background (cream) |
| `--text` / `--text-muted` | `#2C3024` / `#7A8A6A` | text |
| `--success`, `--warning`, `--danger`, `--info` | green, amber, red, blue | status colours |
| `--radius`, `--radius-sm`, `--radius-xs` | 18px, 12px, 8px | rounded corners |
| `--sidebar-width` | 260px | layout |

There are also shadow tokens (`--shadow`, `--shadow-lg`, `--shadow-card`) and `--transition: all 0.22s ease`.

#### 2.3 Dark mode

- **How it is switched:** `toggleDark()` in `AppContext.tsx` flips `isDark`, toggles the class `dark-mode` on `<body>`, and saves `agri_dark` (`"true"` or `"false"`) in localStorage. The saved value is restored after the page loads.
- **How it looks:** `body.dark-mode { ... }` redefines the variables: `--bg: #1C1F17`, `--bg-card: #252920`, `--text: #E8F0DC`, darker borders and shadows, and white-based sidebar text.
- **Colour-scheme fix:** `body.dark-mode { color-scheme: dark; }` together with `.dark-mode select option { background: var(--bg-card); color: var(--text); }`.
  - **Why:** without it, native dropdown lists in dark mode rendered light text on the operating system's white list background, which made them unreadable.
  - `color-scheme: dark` tells the browser to draw its own controls dark: dropdowns, scrollbars and date pickers.
- Extra dark fixes cover Recharts axis tick and legend colours, `.input`, and `.login-card`.
- **Limitation:** dark mode is applied only after the first render, because it is read from localStorage in an effect. A user with dark mode saved may see a short light "flash" on page load.

#### 2.4 Fonts

- Loaded with `@import url('https://fonts.googleapis.com/css2?family=Inter...&family=Playfair+Display...')`.
- **Inter** (weights 300 to 800) is the body and UI font.
- **Playfair Display** (600, 700) is a serif used for `.section-title` headings, to give a slightly "editorial" feel.
- There is no special font for Indian scripts. Tamil, Telugu and the others fall back to the system font for those scripts.

#### 2.5 Layout and responsive design

- **Desktop:**
  - `.sidebar` is fixed on the left, 260px wide, with `z-index: 200`.
  - `.main-layout` has `margin-left: var(--sidebar-width)`, its own scroll area (`height: 100vh; overflow-y: auto`), and `overflow-x: hidden`.
  - `.page-header` is sticky at the top.
- **Mobile (≤ 768px):**
  - `--sidebar-width` becomes `0px`, and the sidebar slides out of view (`transform: translateX(-260px)`).
  - `.sidebar.mobile-open` slides it back in.
  - `.mobile-header` is hidden on desktop (`display:none !important`) and shown as a flex row on mobile.
  - In `src/components/ClientLayout.tsx` this header contains the hamburger button ☰ (`aria-label="Open menu"`, `aria-expanded`), the 🌾 AgriPredict logo, and the `NotificationManager` bell. It is sticky with `z-index: 180`.
  - Opening the menu shows a dark blurred backdrop (`rgba(0,0,0,0.4)`, `z-index: 190`). Tapping the backdrop closes the menu.
  - Main height is `calc(100dvh - 52px)`. `dvh` is the height of the visible screen, which handles mobile browser address bars correctly.
- **Chatbot page:**
  - `.is-chatbot-layout` (set when `pathname === "/chatbot"`) and `:has(.chatbot-wrapper)` give it a full-height area that does not scroll, so the input box stays at the bottom.
- **Grid helpers:**

  | Class | Desktop | Medium screens | Small screens |
  |---|---|---|---|
  | `.grid-cols-4-responsive` | 4 columns | 2 columns (≤1024px) | 1 column (≤640px) |
  | `.grid-cols-3-responsive` | 3 columns | 2 columns (≤992px) | 1 column (≤640px) |
  | `.grid-cols-2-responsive` | 2 columns | — | 1 column (≤768px) |
  | `.split-layout-2col` | `1fr 340px` | 1 column (≤992px) | 1 column |

- **Overflow safety:** images, videos and SVGs get `max-width: 100%`. Cards use `overflow-wrap: break-word`. `.scrollable-chips-bar` gives filter chips a horizontal scroll with the scrollbar hidden.
- **Small touches:** price flash animations (`.flash-green` and `.flash-red`, 0.7s) when a ticker price changes, skeleton loaders, a typing indicator in chat, and toast slide-up.
- **Global toast** (in `ClientLayout.tsx`): fixed at the bottom right, 320px wide, `role="status" aria-live="polite"` so screen readers announce it. The icon depends on type (💰 price, 🌦️ weather, 🔔 other). `AppContext` hides it after 4 seconds.
- **Honest note:** `globals.css` has some repeated rules. `.main-layout` and `.page-header` are defined twice (the "Perfect Frame & Layout Rules" block near the end overrides the earlier one). It works, but it could be cleaned up.

#### 2.6 PWA bits in `src/app/layout.tsx`

PWA means "Progressive Web App": a website that can be installed like a phone app.

- `metadata` sets the title, description, keywords, `manifest: "/manifest.json"`, icons (`/icon.png`) and `appleWebApp.capable: true`, so it can be added to the home screen.
- `viewport` sets `themeColor: "#5C7A3E"`, `width: device-width` and `initialScale: 1`.
- The root layout wraps everything in `<AppProvider>` (global state) and `<ClientLayout>` (shell and auth gate).
- `public/sw.js` is a service worker used **only for Web Push notifications** (install, activate, push). It does **not** cache pages, so the app does **not** work offline.

---

### 3. Hydration safety

**What is hydration?** Next.js first renders the page as HTML on the server. React then "hydrates" it in the browser, which means attaching interactivity to that HTML. If the browser's first render differs from the server HTML, React shows a "hydration mismatch" error.

**The problem:** The server has no `localStorage`, no logged-in user, and no saved language or theme.

**How the project avoids mismatches:**
1. **`AppProvider` starts with the same defaults on the server and in the browser:** English, light theme, Madurai, Tamil Nadu. It then reads `agri_dark`, `agri_lang`, `agri_state`, `agri_district` and `agri_notifications` in a `useEffect`, which only runs in the browser after hydration. The code comment states this reason directly. The `react-hooks/set-state-in-effect` lint rule is turned off only for that block, on purpose.
2. **`ClientLayout` uses `useSyncExternalStore(noopSubscribe, () => true, () => false)`** to produce `isClient`. It is `false` during server render and hydration, and `true` afterwards. Until then, protected pages show the same "Loading AgriPredict..." screen on the server and in the browser.
3. **Auth gate:** `hasUser = isClient && !!getCurrentUser()` is re-checked on every render.
   - If the page is not public and there is no user, it calls `router.replace("/login")`.
   - This also means pressing Back after logout does not show protected content.
   - Only `/login` is public.
4. **`syncSession()`** (from `src/lib/auth.ts`) listens for Supabase session changes and bumps a counter to force a re-render when a session expires or is signed out elsewhere.
5. **Pages under the gate** can safely read localStorage in a `useState` initializer. For example, the chatbot reads `agri_saved_chats`, and the comment says "This page only renders in the browser (ClientLayout gates it)".
6. **No `Date` in render:** `analytics/page.tsx` captures `new Date()` once with `useState(() => new Date())`, because calling it during render is "impure" (it gives a different value each time).

**Trade-off:** Protected pages are effectively rendered only in the browser, so the server render is only a loading screen. This is simpler and avoids mismatches, but you lose the speed and SEO benefits of server rendering for those pages.

---

### 4. Code quality, build and test status

| Item | Status | Details |
|---|---|---|
| Language | TypeScript | `tsconfig.json`: `"strict": true`, `noEmit`, `isolatedModules`, `moduleResolution: "bundler"`, path alias `@/*` → `./src/*`, `allowJs: true` |
| Framework | Next.js **16.2.10** App Router, React **19.2.4** | `package.json`. Node `>=20.9.0` required. |
| Production build | Reported as passing | `next build`. Not re-run while preparing this document, because the laptop is low on RAM. |
| Lint | ESLint 9 flat config | `eslint.config.mjs` (details below) |
| Automated tests | **None** | No unit, integration or end-to-end tests, and no test script in `package.json`. Testing was manual, in the browser. |
| CI | None | No `.github` workflows |
| Secrets | `.env.example` documents every key | Server-only keys (`GROQ_API_KEY`, `SUPABASE_SECRET_KEY`, `VAPID_PRIVATE_KEY`, `DATA_GOV_API_KEY`, `PUSH_ADMIN_TOKEN`) have no `NEXT_PUBLIC_` prefix, so they never reach the browser. |
| Dependencies | Small | supabase-js, date-fns, lucide-react, recharts, web-push |

**ESLint config (`eslint.config.mjs`):**
- Uses `eslint-config-next/core-web-vitals` (React, hooks and Next.js performance rules) and `eslint-config-next/typescript`.
- Ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts` and `scratch/**`.
- Allows `require()` in CommonJS scripts (`**/*.cjs`, root `*.js`, `scripts/**/*.js`), because those run in plain Node, outside the Next.js bundle.
- Declares `self` and `clients` as globals for `public/sw.js`, because a service worker runs in a different global scope than a web page.

**Known code-quality weaknesses:**
- `Language` is declared in three places.
- `processDocumentOcr()` in `src/lib/cropData.ts` appears to be unused. The OCR route has its own fallback, `generateSmartDynamicResult`.
- Several CSS rules are duplicated.
- `src/lib/cropData.ts` is a large mixed file of about 1,360 lines: data, simulators, calculators and helpers.
- Inline `tr({...})` objects make some pages long.

---

### 5. Current status of each module

"Simulated" means the numbers are generated by code (often random) and are **not** real market data.

| Module | Status | Honest notes |
|---|---|---|
| Login / registration | **Done** | Supabase Auth (passwords hashed by Supabase). Profile cached in localStorage and written to the `profiles` table. RLS policies let each user read, insert and update only their own row. |
| Multilingual UI (6 languages) | **Mostly done** | Kannada has no scheme texts. Crop descriptions are EN/TA/TE only. Toasts are English only. |
| Dark mode and responsive layout | **Done** | Possible short light flash on load |
| Live price ticker (`getLivePrice`) | **Simulated** | Random walk: each call adds `(Math.random() - 0.485) × basePrice × 0.008`, clamped between 72% and 145% of `basePrice`. Not real-time market data. |
| Price history charts | **Simulated** | `generatePriceHistory` and `generatePriceHistoryByTimeframe` use random noise (plus a small seasonal sine term in the timeframe version) around a fixed `basePrice`. Volume and weather labels are random too. |
| 30-day "AI" forecast | **Simulated, rule-based** | `generateForecast` uses a random trend plus random noise. The confidence band is `basePrice × 0.035 × (1 + day × 0.018)`. **There is no trained ML model.** |
| Buy/Hold/Sell recommendation | **Rule-based** | `getRecommendation`: compares the forecast change (above 5% or below −5%), the 7-day vs 30-day average, and the price against MSP × 0.95. Confidence is a formula, and in the "stable" case it is random between 60 and 80. Note that the rules never actually output BUY. |
| Mandi prices (`/api/mandi-prices`) | **Partial (real when a key is set)** | Uses real Agmarknet / data.gov.in prices when `DATA_GOV_API_KEY` is set and the crop is priced per quintal (cached for 1 hour). Otherwise it uses a Groq AI estimate labelled "not official", and finally a local price model labelled "Indicative estimate". |
| Weather | **Done (live)** | Open-Meteo API (free, no key needed), 7-day forecast. Mock weather if the call fails. |
| AgriBot chatbot | **Done, with fallback** | Groq LLM (`qwen/qwen3.8-27b`, then `openai/gpt-oss-20b`), with a 2,000-character message limit. Offline keyword engine when there is no key or Groq fails. The offline pest, price and scheme answers exist only in EN/TA/TE. Crop info and greetings cover all 6 languages. |
| Voice input and output | **Done** | Browser Web Speech API. Depends on the browser and installed voices. |
| Document OCR (`/api/ocr`) | **Partial** | Groq vision model when a key is set (upload limit 4 MB, images 3 MB). Otherwise a templated "smart" fallback result based on the file name, which is **not** real OCR. |
| Price threshold alerts | **Done (client-side)** | Alerts are stored in localStorage (`agri_price_alerts`). Checked 4 s after load, then every 60 s, against the **simulated** live price. Each alert triggers at most once per 10 minutes. Toasts are throttled to once per minute per alert. Only runs while the app is open. |
| Web Push notifications | **Done (needs VAPID keys)** | `web-push` library. Subscriptions are saved in Supabase `push_subscriptions` (RLS on with no policies, so only the server's secret key can access it), or in a local file or memory. Broadcasts need `PUSH_ADMIN_TOKEN`. |
| Government schemes | **Done (static data)** | 103 hand-written schemes in `governmentSchemesData.ts`. Not fetched live, so they can go out of date. |
| KCC loan calculator | **Done (formula)** | Fixed constants: subvention cap ₹3,00,000, 7% base rate, 3% prompt-repayment incentive, amortised EMI. |
| Cost/profit estimator, crop calendar, volatility alerts, heatmap | **Done (static/derived data)** | Based on hard-coded crop data, not live feeds |
| PM-KISAN tracker | **Simulated** | `getPmKisanSampleRecord()` is a sample record, not linked to the real portal (it only links out to pmkisan.gov.in) |
| Nearby farmer network | **Simulated** | `getNearbyFarmerNetwork()` returns generated numbers |
| CSV / PDF export | **Done** | The CSV contains simulated history |
| Offline mode | **Not done** | The service worker does not cache pages |
| Automated tests | **Not done** | — |

---

### 6. Known limitations

- Prices in the ticker, history charts and forecast are **simulated with random numbers**, so they change on every reload and are not real market data.
- The "AI forecast" is **not machine learning**. It is a random-trend generator, and the recommendation is a set of fixed rules.
- Real mandi prices appear only when `DATA_GOV_API_KEY` is set. Otherwise the numbers are estimates (the screen labels them as such).
- Price alerts and saved chats live in **localStorage**: one browser only, lost if browser data is cleared, and checked only while the app is open.
- Kannada lacks scheme texts. Crop descriptions and some offline chatbot answers lack Kannada, Malayalam and Hindi. Some toasts are English only.
- The voice features depend on the browser (best in Chrome and Edge) and on which OS voices are installed.
- OCR without a Groq key gives a template answer, not a real reading of the document.
- Possible short light-theme flash when dark mode is restored.
- Protected pages render only in the browser, so the server render is a loading screen only.
- There is no offline caching, no automated tests, no CI and no rate limiting on API routes.
- The scheme data is static and can go out of date.
- AI answers (chat, OCR, AI mandi estimates) can be wrong and are not checked by an expert.

### 7. Future work

1. Train a real forecasting model (for example ARIMA, Prophet or LSTM) on historical Agmarknet data, and report the error (MAE or MAPE) honestly.
2. Store daily Agmarknet prices in Supabase, so charts show real history instead of random data.
3. Move price alerts to the server (Supabase table plus a scheduled job), so push alerts work when the app is closed.
4. Complete the translations: Kannada scheme texts, crop descriptions in all languages, translated toasts, and one shared `Language` type.
5. Add tests (unit tests for `tr`, the KCC calculator and `getRecommendation`, plus end-to-end tests for login and alerts) and a GitHub Actions CI pipeline.
6. Add offline caching in the service worker for rural areas with poor network.
7. Add rate limiting and input validation on `/api/chat`, `/api/ocr` and `/api/mandi-prices`.
8. Fetch scheme data from official sources, or add a "last verified" date.
9. Apply the dark-mode class before first paint (a small inline script) to remove the flash.
10. Split `cropData.ts` into smaller modules and remove dead code.

---

### 8. Likely viva questions and model answers

**Q1. Why did you choose Next.js?**
It gives the frontend (React pages) and backend (API routes like `/api/chat`) in one project and one deployment. API keys stay safe on the server inside route handlers. It has file-based routing, built-in metadata and PWA support, and deploys easily to Vercel. We use Next.js 16 with the App Router and React 19.

**Q2. Why Supabase instead of building your own backend or using Firebase?**
Supabase gives a hosted PostgreSQL database plus ready-made authentication, with hashed passwords and session tokens, on a free tier. It is SQL, so the schema in `supabase/schema.sql` is easy to read. It also supports Row Level Security, which lets us protect data inside the database itself.

**Q3. What is RLS?**
Row Level Security is a PostgreSQL feature: the database itself decides which rows a user may see or change. On `profiles` we enabled RLS with policies such as "select/insert/update own row", so a user can only touch the row matching their own auth user id, even if someone calls the API directly. On `push_subscriptions`, RLS is on with **no** policies, so the public key cannot access it at all. Only the server, with the secret key, can.

**Q4. How do live prices work?**
There are two parts.
- The **ticker** uses `getLivePrice()`, which is a **simulated** random walk around each crop's base price, limited to 72% to 145% of the base price.
- **Mandi comparison** calls `/api/mandi-prices`. If `DATA_GOV_API_KEY` is set, it fetches official Agmarknet daily prices from data.gov.in in ₹/quintal, cached for one hour. If not, it falls back to a Groq AI estimate and then to a local model. Both fallbacks are clearly labelled as estimates.

**Q5. Is your price forecast machine learning?**
Honestly, no. `generateForecast()` uses a random trend plus random noise, with a confidence band that widens each day. The Buy/Hold/Sell advice is rule-based: forecast change of ±5%, 7-day vs 30-day average, and price vs MSP. The pipeline and UI are ready, and replacing the generator with a trained model on real Agmarknet history is our main future work.

**Q6. How do price alerts work?**
The user sets a crop, a mandi, a condition ("above" or "below") and a target price. This is saved in localStorage under `agri_price_alerts`. `AppProvider` checks all active alerts 4 seconds after load and then every 60 seconds. When the condition is met, and the alert has not fired in the last 10 minutes, it shows an in-app toast and notification and sends a Web Push notification through the service worker. Limitation: it compares against the simulated price and runs only while the app is open.

**Q7. How do push notifications work?**
The browser registers `public/sw.js` and subscribes with our VAPID public key. The subscription (endpoint and keys) is sent to `/api/notifications/subscribe` and stored in Supabase, or in a local file or memory as a fallback. The server uses the `web-push` library, signed with the private VAPID key, to send messages. The service worker's `push` event shows the notification even on the lock screen.

**Q8. How does multilingual support work?**
The selected language is kept in React Context and saved in localStorage as `agri_lang`. Text is translated with `tr(language, {en, ta, te, kn, ml, hi})`, which falls back to English if a translation is missing. `cropName()` and `categoryName()` translate crops and categories, `APP_TRANSLATIONS` holds fixed labels, and `getLocalizedScheme()` translates schemes. We also set `<html lang>` so screen readers and voices use the right language.

**Q9. Why are some words like MSP, PM-KISAN or pesticide names not translated?**
Farmers and officials use these exact terms on forms, at banks and in shops. Translating "Imidacloprid" would make it harder to buy the right product. Brand names and CSV headers stay in English for consistency and so Excel reads them correctly.

**Q10. How does the voice assistant work?**
It uses the browser's free Web Speech API. Speech recognition uses the locale of the chosen language (e.g. `te-IN`) and restarts itself if the browser stops it. Read-aloud removes markdown and emoji, says "rupees" for ₹, and picks a voice matching the language. If no matching voice is installed, it lets the browser decide rather than forcing a wrong-language voice.

**Q11. How does the chatbot answer if the AI service is down?**
`/api/chat` tries the Groq models in order (`qwen/qwen3.8-27b`, then `openai/gpt-oss-20b`) with a time budget. If all fail or there is no key, it uses `getChatbotResponse()`, an offline keyword engine with prepared answers for pests, prices/MSP, schemes, crop info and greetings. Language is detected from the Unicode script of the message.

**Q12. What is hydration and how did you handle it?**
Hydration is React attaching to server-rendered HTML. If the first browser render differs from the server HTML, React reports an error. We render the same defaults on both sides and read localStorage only in `useEffect`. `ClientLayout` uses `useSyncExternalStore` to show the same loading screen until the browser takes over.

**Q13. How is the app secured?**
- Passwords are handled by Supabase Auth, never stored by us.
- Database tables use RLS.
- Secret keys (Groq, Supabase secret, VAPID private, data.gov.in) are server-only environment variables without the `NEXT_PUBLIC_` prefix.
- The broadcast push route needs a Bearer admin token.
- Inputs are trimmed or limited (chat message 2,000 characters, query parameters 80 characters, upload 4 MB).
- Protected pages redirect to `/login` when there is no session.

Missing pieces: rate limiting and automated security tests.

**Q14. Is it scalable?**
- The frontend and API routes are stateless serverless functions, so they scale horizontally on Vercel.
- Supabase (Postgres) scales well beyond our needs.
- Agmarknet responses are cached for 1 hour to reduce external calls.

Bottlenecks:
- Alerts are checked in the client, not on the server.
- The in-memory or file fallback for push subscriptions does not scale; Supabase does.
- External AI calls have rate limits.

**Q15. Do you have tests?**
No automated tests yet. We tested manually in Chrome, Edge and mobile view. TypeScript strict mode and ESLint (Next.js core-web-vitals and TypeScript rules) catch many mistakes at build time, and the production build was reported as passing. Adding unit and end-to-end tests with CI is planned.

**Q16. How is the design made responsive and themeable?**
All colours are CSS variables in `globals.css`. Dark mode adds the `dark-mode` class on `<body>`, which redefines those variables, and sets `color-scheme: dark` so native dropdowns and scrollbars also turn dark. Below 768px the sidebar becomes a slide-in drawer with a hamburger header and backdrop. Grids collapse from 4 or 3 columns down to 1.

**Q17. Where does the weather data come from?**
From the free Open-Meteo API, using the user's latitude and longitude (from a manual state/district choice, or GPS plus BigDataCloud reverse geocoding). It gives current conditions and a 7-day forecast. If the API fails, mock weather is shown.

**Q18. How does document scanning (OCR) work?**
The user uploads an image or PDF (images under 3 MB, PDFs under 4 MB). `/api/ocr` sends it to a Groq vision model, which returns JSON with the document type, a summary and action items in all six languages. Missing translations are filled with templates. Without a Groq key, it returns a templated result based on the file name, which is not real OCR.

**Q19. What are the biggest weaknesses of your project?**
- Simulated prices and forecast, with no real ML model.
- Alerts work only while the app is open, and are stored per browser.
- Incomplete Kannada scheme translations.
- No tests and no offline caching.

We are honest about these in the UI too: estimated prices are labelled as estimates.

**Q20. What would you improve first if you had three more months?**
1. Store real daily Agmarknet prices and train a forecasting model, measuring its accuracy.
2. Move alerts to a server-side scheduled job, so farmers get notified even when the app is closed.
3. Complete the translations and add automated tests with CI.


---

## 9. Other files and details

### Other files and details

Most of the code is covered by the eight sections above. These files and behaviours are not clearly covered by any of their titles. Several of them are **dead code**, meaning they exist in the code but no screen ever uses them. That is worth knowing before a viva.

#### 1. `src/components/NearbyFarmerNetwork.tsx` (unused)

- **What:** A card titled "Nearby Farmer Network Insights". It shows how many farmers are registered in your district and what share of them grow each crop, with progress bars and trend badges (Growing, Stable, Declining).
- **Why:** The idea is peer insight. A farmer can see what neighbours are planting and avoid over-supplying one crop.
- **How:** It reads `location.district` and `location.state` from `useApp()` and calls `getNearbyFarmerNetwork()` in `src/lib/cropData.ts`.
- **Honest status:** It is **fully hard-coded**. The function only puts the district and state names into the text. Everything else is the same for every district:
  - 14,820 farmers in total
  - Rice 42.5%, Red Chilli 28%, Cotton 16.5%, Tomato 8%, Corn 5%
- The advice line always mentions "Red Chilli & Paddy".
- **No page imports this component**, so users never see it.

#### 2. Other unused functions in `src/lib/cropData.ts`

| Function | What it would do | Status |
|---|---|---|
| `processDocumentOcr(fileName)` | A fake "OCR". It picks a ready-made summary (in English, Tamil and Telugu) by looking for words in the file name, such as `pm-kisan`, `ekyc` or `kyc`. | Not used anywhere. The real scanner goes through `/api/ocr`. This is left over from an older version. |
| `getMspStatus(crop, price)` | Compares the price with the government MSP (Minimum Support Price). Formula: `gap = price − msp` and `gapPercent = abs(gap)/msp × 100`. Returns a red badge if the price is below MSP and green if above. If a crop has no MSP, it returns "No Govt MSP Fixed". | Not used outside this file. |
| `getCropsByState(state)` | Filters `CROPS` to crops whose `states` list contains the state name (ignores upper/lower case). | Not used. |

#### 3. `src/lib/weather.ts`: live weather

- **What:** Gets current weather and a 7-day forecast for the user's district. Only `src/app/crops/page.tsx` uses it. It calls `fetchWeather(location.lat, location.lon, location.district)`.
- **Why:** Rain, heat and humidity affect harvest timing and crop disease, so farmers need weather next to prices.
- **How it works:**
  - It calls the free **Open-Meteo** API (`api.open-meteo.com/v1/forecast`), which needs no API key. It asks for temperature, humidity, wind and the weather code for now, plus daily max/min temperature and rainfall for 7 days, in the `Asia/Kolkata` time zone. It uses `cache: "no-store"` so the result is always fresh.
  - **WMO codes** are the standard numeric weather codes. A table called `WMO_CODES` turns each code into a name and an emoji. For example, 61 means "Light Rain" and 95 means "Thunderstorm".
  - **Crop impact** comes from fixed rules in `getCropImpact()`, checked in this order:
    1. Heavy rain, violent showers or thunderstorm → **High**
    2. Any rain or drizzle, or humidity above 80% → **Medium** (fungal disease warning)
    3. Temperature above 40 °C → **High** (heat stress)
    4. Temperature below 10 °C → **Medium**
    5. Anything else → **Low**
- **Honest notes:**
  - `soilMoistureIndex` is **not measured**. The formula is `min(100, humidity/100 × 60 + random × 30)`, so the number changes a little on every load.
  - **Fallback:** if the API call fails, `getMockWeather()` returns random fake weather. It picks one of four conditions and builds a 7-day forecast in a fixed pattern with random temperature and rain values. The only sign of this is a message in the console.
  - The `INDIAN_CITIES` list in the same file is not used by any other file.

#### 4. `src/lib/locationData.ts`: list of states and districts

- **What:** `STATE_DISTRICTS` maps each state to its districts. Each district has a name, latitude and longitude, about 677 districts in all. `INDIAN_STATES` is just the list of state names (`Object.keys` of that map).
- **Why:** The dropdowns need it, and so does weather, which needs latitude and longitude.
- **Used by:**
  - The location dropdowns on the login and settings pages
  - `MandiComparison.tsx`
  - `AppContext.tsx`, which looks up the coordinates for the chosen district
- `getDistrictByStateAndName()` is exported but no other file uses it.

#### 5. `src/lib/mandiDatabase.ts`: mandi names per district

- **What:** `STRICT_DISTRICT_MANDIS` holds 10 hand-written mandi (APMC market) names for each of 27 districts. The states covered are Andhra Pradesh, Tamil Nadu, Karnataka, Maharashtra, Punjab and Haryana. One example is "Guntur Mirchi Yard".
- **Why:** When live Agmarknet data is not available, the estimate rows still show market names that sound local.
- **How:** `getStrictDistrictMandis(state, district)` returns the stored list if it has at least 10 names. For any other district it **makes up** 10 generic names, such as "`<District>` Main APMC Yard" or "`<District>` Central Grain Market". Only `src/app/api/mandi-prices/route.ts` uses it.
- **Honest:** For districts not in the list, these names are made up and are not real markets.

#### 6. `src/lib/priceDate.ts`

- **What:** `formatPriceDate("dd/mm/yyyy")` turns an Agmarknet date into a friendly label: "Today", "Yesterday (date)", or "date (N days ago)". The day count is `round((today − reported) / 86,400,000 ms)`. If the date is empty, it returns an empty string. If the date can't be read, it returns it unchanged.
- **Why:** Agmarknet publishes late in the day, so in the morning the latest price is from yesterday. The label makes this clear to the farmer.
- **Used in:** `src/app/crop/[name]/page.tsx` and `src/components/MandiComparison.tsx`.

#### 7. Files in `public/` not covered elsewhere

- `icon.png` (512×512) and `icon-192.png` are the app icons. `manifest.json` lists both. `layout.tsx` uses `icon.png` as the favicon and the Apple icon. `sw.js` uses it as the notification icon and badge.
- `manifest.json` is the PWA (installable web app) file. It sets `display: standalone`, portrait orientation, theme colour `#5C7A3E` and background `#FAF7F2`.
- `AgriPredict_A4_Architecture_Poster.pdf`, `AgriPredict_Architecture_and_Features.pdf` and `AgriPredict_Exhaustive_Architecture_and_Feature_Guide.pdf` are small documentation PDFs (4–10 KB). They are publicly reachable at `/<filename>.pdf`, but **no page links to them**.
- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg` and `window.svg` are **leftovers from the Next.js starter template** and are not used. `src/app/favicon.ico` is also from the template.

#### 8. Helper files and folders outside `src/`

- `scripts/gen_vapid.cjs` creates VAPID keys, the public/private key pair that Web Push needs to send notifications. It prints `PUBLIC_KEY=` and `PRIVATE_KEY=` lines, which you then copy into `.env`.
- `scripts/one-off/` holds four scripts that were moved out of the project root and are kept only for history. They were used to fill translations, fix Telugu text, scrape Vercel chunks and test Pixabay image links. The app does not use them.
- `supabase/schema.sql` creates the database tables. You run it once in the Supabase SQL editor, and the file says it is safe to run again.
- `data/push_subscriptions.json` is the local file where push subscriptions were stored. It is now ignored by git (`/data/` is in `.gitignore` because it holds device addresses) and has been removed from the repository.
- `.vscode/launch.json` and `.claude/launch.json` are editor and tool settings for running the app with `npm run dev` or `npm start` on port 3000. They are not part of the app.
