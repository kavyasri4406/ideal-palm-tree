"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getRecommendation, formatPrice, getCropById } from "@/lib/cropData";
import { usePriceSeries, dayLabel } from "@/lib/usePriceSeries";
import { fetchMandiPrices } from "@/lib/mandiClient";
import { PRICE_LABELS } from "@/lib/priceSeriesLabels";
import MandiComparison from "@/components/MandiComparison";
import { useApp } from "@/lib/AppContext";
import type { Language } from "@/lib/AppContext";
import { formatPriceDate } from "@/lib/priceDate";
import { tr, cropName, categoryName } from "@/lib/i18n";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

type AllLangs = { en: string; ta: string; te: string; kn: string; ml: string; hi: string };

/** Localized factor status level ("High", "Medium", "Low", "Moderate"). */
const STATUS_LEVELS: Record<string, AllLangs> = {
  High: { en: "High", ta: "அதிகம்", te: "ఎక్కువ", kn: "ಹೆಚ್ಚು", ml: "ഉയർന്നത്", hi: "उच्च" },
  Medium: { en: "Medium", ta: "நடுத்தரம்", te: "మధ్యస్థం", kn: "ಮಧ್ಯಮ", ml: "ഇടത്തരം", hi: "मध्यम" },
  Moderate: { en: "Moderate", ta: "மிதமானது", te: "మోస్తరు", kn: "ಸಾಧಾರಣ", ml: "മിതമായ", hi: "सामान्य" },
  Low: { en: "Low", ta: "குறைவு", te: "తక్కువ", kn: "ಕಡಿಮೆ", ml: "കുറവ്", hi: "कम" },
};

/** Localized season name, e.g. "Rabi/Kharif". */
const SEASON_NAMES: Record<string, AllLangs> = {
  Kharif: { en: "Kharif", ta: "காரீஃப்", te: "ఖరీఫ్", kn: "ಮುಂಗಾರು", ml: "ഖരീഫ്", hi: "खरीफ" },
  Rabi: { en: "Rabi", ta: "ராபி", te: "రబీ", kn: "ಹಿಂಗಾರು", ml: "റാബി", hi: "रबी" },
  Zaid: { en: "Zaid", ta: "சைத்", te: "జాయిద్", kn: "ಜಾಯದ್", ml: "സായിദ്", hi: "जायद" },
  Annual: { en: "Annual", ta: "ஆண்டு முழுவதும்", te: "ఏడాది పొడవునా", kn: "ವರ್ಷಪೂರ್ತಿ", ml: "വർഷം മുഴുവൻ", hi: "सालभर" },
  Summer: { en: "Summer", ta: "கோடை", te: "వేసవి", kn: "ಬೇಸಿಗೆ", ml: "വേനൽ", hi: "गर्मी" },
};
const seasonName = (season: string, language: Language) =>
  season.split("/").map(s => (SEASON_NAMES[s] ? tr(language, SEASON_NAMES[s]) : s)).join("/");

/** Localized price unit (all crops are priced per quintal). */
const unitName = (unit: string, language: Language) =>
  unit === "quintal" ? tr(language, { en: "quintal", ta: "குவிண்டால்", te: "క్వింటాల్", kn: "ಕ್ವಿಂಟಾಲ್", ml: "ക്വിന്റൽ", hi: "क्विंटल" }) : unit;

export default function CropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, location } = useApp();
  const cropId = params.name as string;
  const foundCrop = getCropById(cropId);

  const [imgError, setImgError] = useState(false);
  const [tab, setTab] = useState<"chart" | "table">("chart");
  const [timeframe, setTimeframe] = useState<"1M" | "3M" | "1Y">("1M");

  // Official average mandi price (Agmarknet) for this crop at the user's location
  const quoteKey = foundCrop ? `${foundCrop.name}|${location.state}|${location.district}` : "";
  const [liveQuote, setLiveQuote] = useState<{ key: string; price: number; priceDate: string | null } | null>(null);

  useEffect(() => {
    if (!foundCrop) return;
    const controller = new AbortController();
    const key = `${foundCrop.name}|${location.state}|${location.district}`;
    fetchMandiPrices(foundCrop.name, location.state, location.district, controller.signal)
      .then(json => {
        if (controller.signal.aborted) return;
        const price = Number(json?.wholesaleMandiRateQuintal);
        if (json?.live === true && Number.isFinite(price) && price > 0) {
          setLiveQuote({ key, price, priceDate: typeof json.priceDate === "string" ? json.priceDate : null });
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) console.error("Mandi price fetch failed:", err);
      });
    return () => controller.abort();
  }, [foundCrop, location.state, location.district]);

  // Only trust a quote that matches the current crop/location
  const live = liveQuote && liveQuote.key === quoteKey ? liveQuote : null;

  // Official Agmarknet history + forecast when available, otherwise a labelled simulation
  const { series, loading: seriesLoading } = usePriceSeries(foundCrop, location.state);
  const official = series?.source === "agmarknet";

  const livePrice = live?.price ?? null;
  const marketData = useMemo(() => {
    if (!foundCrop || !series) return null;
    // A simulated series has no real price level, so rescale it to end at today's official price
    const last = series.history[series.history.length - 1].price;
    const k = !official && livePrice && last > 0 ? livePrice / last : 1;
    const r = (v: number) => parseFloat((v * k).toFixed(2));
    const full = series.history.map(h => ({ date: dayLabel(h.date), price: r(h.price), markets: h.markets ?? 0 }));
    const fc = series.forecast.map(f => ({ date: dayLabel(f.date), predicted: r(f.predicted), lower: r(f.lower), upper: r(f.upper) }));
    const rec = fc.length > 0 ? getRecommendation(foundCrop, full, fc) : null;
    const days = { "1M": 30, "3M": 90, "1Y": 365 }[timeframe];
    return { history: full.slice(-days), forecast: fc, recommendation: rec };
  }, [foundCrop, series, official, livePrice, timeframe]);

  if (!foundCrop || !marketData) {
    return (
      <div className="page-content">
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", maxWidth: 480, margin: "40px auto" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌾</div>
          <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {tr(language, { en: "Crop not found", ta: "பயிர் கிடைக்கவில்லை", te: "పంట కనుగొనబడలేదు", kn: "ಬೆಳೆ ಸಿಗಲಿಲ್ಲ", ml: "വിള കണ്ടെത്തിയില്ല", hi: "फसल नहीं मिली" })}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
            {tr(language, { en: `We couldn't find a crop called "${cropId}".`, ta: "இந்த பயிர் எங்கள் பட்டியலில் இல்லை.", te: "ఈ పంట మా జాబితాలో లేదు.", kn: "ಈ ಬೆಳೆ ನಮ್ಮ ಪಟ್ಟಿಯಲ್ಲಿ ಇಲ್ಲ.", ml: "ഈ വിള ഞങ്ങളുടെ പട്ടികയിൽ ഇല്ല.", hi: "यह फसल हमारी सूची में नहीं है।" })}
          </div>
          <Link href="/crops" className="btn btn-primary">
            {tr(language, { en: "← Browse all crops", ta: "← அனைத்து பயிர்களும்", te: "← అన్ని పంటలు", kn: "← ಎಲ್ಲಾ ಬೆಳೆಗಳು", ml: "← എല്ലാ വിളകളും", hi: "← सभी फसलें देखें" })}
          </Link>
        </div>
      </div>
    );
  }

  const crop = foundCrop;
  const { history, forecast, recommendation } = marketData;

  const getName = () => cropName(crop, language);
  const getReason = () => {
    if (!recommendation) return "";
    if (language === "ta") return recommendation.reasonTA;
    if (language === "te") return recommendation.reasonTE;
    // cropData only carries English/Tamil/Telugu reasons; build the same message for kn/ml/hi
    const pct = Math.abs(recommendation.priceChange).toFixed(1);
    if (recommendation.priceChange > 5) return tr(language, { en: recommendation.reason, kn: `30 ದಿನಗಳಲ್ಲಿ ಬೆಲೆ ${pct}% ಏರಬಹುದು. ಮಾರುವ ಮೊದಲು ಕಾದು ನೋಡಿ.`, ml: `30 ദിവസത്തിനുള്ളിൽ വില ${pct}% ഉയരാൻ സാധ്യതയുണ്ട്. വിൽക്കുന്നതിന് മുമ്പ് കാത്തിരുന്ന് നോക്കുക.`, hi: `30 दिनों में दाम ${pct}% बढ़ सकते हैं। बेचने से पहले रुककर देखें।` });
    if (recommendation.priceChange < -5) return tr(language, { en: recommendation.reason, kn: `30 ದಿನಗಳಲ್ಲಿ ಬೆಲೆ ${pct}% ಇಳಿಯಬಹುದು. ಈಗ ಮಾರುವುದು ಒಳ್ಳೆಯದು.`, ml: `30 ദിവസത്തിനുള്ളിൽ വില ${pct}% കുറയാം. ഇപ്പോൾ വിൽക്കുന്നതാണ് നല്ലത്.`, hi: `30 दिनों में दाम ${pct}% गिर सकते हैं। अभी बेचना बेहतर है।` });
    if (recommendation.reason.includes("MSP")) return tr(language, { en: recommendation.reason, kn: `ಈಗಿನ ಬೆಲೆ MSP ₹${crop.msp} ಗಿಂತ ಕಡಿಮೆ ಇದೆ. ಸರ್ಕಾರಿ ಖರೀದಿಗಾಗಿ ಕಾಯಿರಿ.`, ml: `ഇപ്പോഴത്തെ വില MSP ₹${crop.msp}-നേക്കാൾ കുറവാണ്. സർക്കാർ സംഭരണത്തിനായി കാത്തിരിക്കുക.`, hi: `मौजूदा दाम MSP ₹${crop.msp} से कम है। सरकारी खरीद का इंतज़ार करें।` });
    return tr(language, { en: recommendation.reason, kn: "ಮಾರುಕಟ್ಟೆ ಸ್ಥಿರವಾಗಿದೆ. ಮುಂದಿನ 2 ವಾರ ಹವಾಮಾನ ಮತ್ತು ಬೇಡಿಕೆಯನ್ನು ಗಮನಿಸಿ.", ml: "വിപണി സ്ഥിരമാണ്. അടുത്ത 2 ആഴ്ച കാലാവസ്ഥയും ആവശ്യകതയും ശ്രദ്ധിക്കുക.", hi: "बाज़ार स्थिर है। अगले 2 हफ्ते मौसम और मांग पर नज़र रखें।" });
  };

  // Today's official price when live; otherwise the last point of the history series
  const currentPrice = live ? live.price : history.length > 0 ? history[history.length - 1].price : crop.basePrice;
  const priceSourceLabel = live
    ? `Agmarknet${live.priceDate ? ` · ${formatPriceDate(live.priceDate)}` : ""} · ${tr(language, { en: "avg mandi", ta: "சராசரி மண்டி விலை", te: "సగటు మండి ధర", kn: "ಸರಾಸರಿ ಮಂಡಿ ಬೆಲೆ", ml: "ശരാശരി മണ്ടി വില", hi: "औसत मंडी भाव" })}`
    : official
      ? `Agmarknet · ${tr(language, PRICE_LABELS.stateMedian)}`
      : tr(language, { en: "Estimated", ta: "மதிப்பீடு", te: "అంచనా", kn: "ಅಂದಾಜು", ml: "ഏകദേശം", hi: "अनुमानित" });

  // History for the chosen timeframe + 30 day forecast for the chart
  const chartData = [
    ...history.map(h => ({ date: h.date, actual: h.price, predicted: undefined, lower: undefined, upper: undefined })),
    ...forecast.map(f => ({ date: f.date, actual: undefined, predicted: f.predicted, lower: f.lower, upper: f.upper })),
  ];

  const actionColor = { BUY: "#15803D", SELL: "#B91C1C", HOLD: "#92400E" };
  const actionBg = { BUY: "#DCFCE7", SELL: "#FEE2E2", HOLD: "#FEF9C3" };
  const action = recommendation?.action || "HOLD";

  const L = {
    back: tr(language, { en: "← Back", ta: "← திரும்பு", te: "← వెనక్కి", kn: "← ಹಿಂದೆ", ml: "← തിരികെ", hi: "← वापस" }),
    forecast: tr(language, { en: "30-Day Price Forecast", ta: "30 நாள் கணிப்பு", te: "30 రోజుల అంచనా", kn: "30 ದಿನಗಳ ಬೆಲೆ ಮುನ್ಸೂಚನೆ", ml: "30 ദിവസത്തെ വില പ്രവചനം", hi: "30 दिन का दाम पूर्वानुमान" }),
    currentPrice: tr(language, { en: "Current Price", ta: "தற்போதைய விலை", te: "ప్రస్తుత ధర", kn: "ಈಗಿನ ಬೆಲೆ", ml: "ഇപ്പോഴത്തെ വില", hi: "मौजूदा दाम" }),
    msp: tr(language, { en: "MSP Price", ta: "MSP விலை", te: "MSP ధర", kn: "MSP ಬೆಲೆ", ml: "MSP വില", hi: "MSP दाम" }),
    aiRec: tr(language, { en: "AI Recommendation", ta: "AI பரிந்துரை", te: "AI సిఫారసు", kn: "AI ಸಲಹೆ", ml: "AI ഉപദേശം", hi: "एआई सलाह" }),
    confidence: tr(language, { en: "Confidence", ta: "நம்பகத்தன்மை", te: "నమ్మకం", kn: "ವಿಶ್ವಾಸಾರ್ಹತೆ", ml: "വിശ്വാസ്യത", hi: "विश्वसनीयता" }),
    factors: tr(language, { en: "Influencing Factors", ta: "பாதிக்கும் காரணிகள்", te: "ప్రభావితం చేసే అంశాలు", kn: "ಪ್ರಭಾವ ಬೀರುವ ಅಂಶಗಳು", ml: "സ്വാധീനിക്കുന്ന ഘടകങ്ങൾ", hi: "असर डालने वाले कारण" }),
    history: tr(language, { en: "Price History", ta: "விலை வரலாறு", te: "ధర చరిత్ర", kn: "ಬೆಲೆ ಇತಿಹಾಸ", ml: "വില ചരിത്രം", hi: "दाम का इतिहास" }),
    report: tr(language, { en: "Generate Report", ta: "அறிக்கை உருவாக்கு", te: "నివేదిక రూపొందించు", kn: "ವರದಿ ತಯಾರಿಸಿ", ml: "റിപ്പോർട്ട് തയ്യാറാക്കുക", hi: "रिपोर्ट बनाएं" }),
    chart: tr(language, { en: "Chart", ta: "வரைபடம்", te: "చార్ట్", kn: "ಚಾರ್ಟ್", ml: "ചാർട്ട്", hi: "चार्ट" }),
    table: tr(language, { en: "Table", ta: "அட்டவணை", te: "పట్టిక", kn: "ಪಟ್ಟಿ", ml: "പട്ടിക", hi: "तालिका" }),
    season: tr(language, { en: "Season", ta: "பருவம்", te: "సీజన్", kn: "ಹಂಗಾಮು", ml: "സീസൺ", hi: "मौसम" }),
    per: tr(language, { en: "per", ta: "ஒரு", te: "ఒక", kn: "ಪ್ರತಿ", ml: "ഓരോ", hi: "प्रति" }),
    aboveMsp: tr(language, { en: "Above MSP", ta: "MSP-க்கு மேல்", te: "MSP కంటే ఎక్కువ", kn: "MSP ಗಿಂತ ಹೆಚ್ಚು", ml: "MSP-ക്ക് മുകളിൽ", hi: "MSP से ऊपर" }),
    belowMsp: tr(language, { en: "Below MSP", ta: "MSP-க்கு கீழ்", te: "MSP కంటే తక్కువ", kn: "MSP ಗಿಂತ ಕಡಿಮೆ", ml: "MSP-യിൽ താഴെ", hi: "MSP से कम" }),
    noMsp: tr(language, { en: "No MSP set", ta: "MSP நிர்ணயிக்கப்படவில்லை", te: "MSP నిర్ణయించలేదు", kn: "MSP ನಿಗದಿಯಾಗಿಲ್ಲ", ml: "MSP നിശ്ചയിച്ചിട്ടില്ല", hi: "MSP तय नहीं" }),
    date: tr(language, { en: "Date", ta: "தேதி", te: "తేదీ", kn: "ದಿನಾಂಕ", ml: "തീയതി", hi: "तारीख" }),
    price: tr(language, { en: "Price", ta: "விலை", te: "ధర", kn: "ಬೆಲೆ", ml: "വില", hi: "दाम" }),
    band: tr(language, { en: "Confidence Band", ta: "நம்பக வரம்பு", te: "అంచనా పరిధి", kn: "ಅಂದಾಜು ವ್ಯಾಪ್ತಿ", ml: "പ്രതീക്ഷിത പരിധി", hi: "अनुमान सीमा" }),
    type: tr(language, { en: "Type", ta: "வகை", te: "రకం", kn: "ಪ್ರಕಾರ", ml: "തരം", hi: "प्रकार" }),
    change: tr(language, { en: "Change", ta: "மாற்றம்", te: "మార్పు", kn: "ಬದಲಾವಣೆ", ml: "മാറ്റം", hi: "बदलाव" }),
    estHistory: tr(language, { en: "Est. history", ta: "மதிப்பீடு வரலாறு", te: "అంచనా చరిత్ర", kn: "ಅಂದಾಜು ಇತಿಹಾಸ", ml: "ഏകദേശ ചരിത്രം", hi: "अनुमानित इतिहास" }),
    estForecast: tr(language, { en: "Est. forecast", ta: "மதிப்பீடு கணிப்பு", te: "అంచనా భవిష్యత్తు", kn: "ಅಂದಾಜು ಮುನ್ಸೂಚನೆ", ml: "ഏകദേശ പ്രവചനം", hi: "अनुमानित पूर्वानुमान" }),
    upperBand: tr(language, { en: "Upper Band", ta: "மேல் வரம்பு", te: "ఎగువ పరిధి", kn: "ಮೇಲಿನ ಮಿತಿ", ml: "മുകളിലെ പരിധി", hi: "ऊपरी सीमा" }),
    lowerBand: tr(language, { en: "Lower Band", ta: "கீழ் வரம்பு", te: "దిగువ పరిధి", kn: "ಕೆಳಗಿನ ಮಿತಿ", ml: "താഴത്തെ പരിധി", hi: "निचली सीमा" }),
    estHistorySeries: tr(language, { en: "Estimated History", ta: "மதிப்பீடு வரலாறு", te: "అంచనా చరిత్ర", kn: "ಅಂದಾಜು ಇತಿಹಾಸ", ml: "ഏകദേശ ചരിത്രം", hi: "अनुमानित इतिहास" }),
    estProjection: tr(language, { en: "Estimated Projection", ta: "மதிப்பீடு கணிப்பு", te: "అంచనా ధోరణి", kn: "ಅಂದಾಜು ಮುನ್ನೋಟ", ml: "ഏകദേശ പ്രവചനം", hi: "अनुमानित आगे का रुझान" }),
    recent: tr(language, { en: "Recent", ta: "சமீபத்தியது", te: "ఇటీవలి", kn: "ಇತ್ತೀಚಿನ", ml: "സമീപകാല", hi: "हाल का" }),
  };

  const actionText = {
    BUY: tr(language, { en: "BUY", ta: "வாங்க", te: "కొనండి", kn: "ಖರೀದಿಸಿ", ml: "വാങ്ങുക", hi: "खरीदें" }),
    SELL: tr(language, { en: "SELL", ta: "விற்க", te: "అమ్మండి", kn: "ಮಾರಿ", ml: "വിൽക്കുക", hi: "बेचें" }),
    HOLD: tr(language, { en: "HOLD", ta: "காத்திருங்கள்", te: "ఉంచండి", kn: "ಇರಿಸಿಕೊಳ್ಳಿ", ml: "സൂക്ഷിക്കുക", hi: "रुकें" }),
  };
  const actionHint = action === "BUY"
    ? tr(language, { en: "Good time to buy", ta: "வாங்க நல்ல நேரம்", te: "కొనడానికి మంచి సమయం", kn: "ಖರೀದಿಸಲು ಒಳ್ಳೆಯ ಸಮಯ", ml: "വാങ്ങാൻ നല്ല സമയം", hi: "खरीदने का अच्छा समय" })
    : action === "SELL"
      ? tr(language, { en: "Consider selling", ta: "விற்பதைப் பரிசீலிக்கவும்", te: "అమ్మడం గురించి ఆలోచించండి", kn: "ಮಾರಾಟದ ಬಗ್ಗೆ ಯೋಚಿಸಿ", ml: "വിൽക്കുന്നത് പരിഗണിക്കുക", hi: "बेचने पर विचार करें" })
      : tr(language, { en: "Hold & watch", ta: "காத்திருந்து கவனிக்கவும்", te: "ఆగి గమనించండి", kn: "ಕಾದು ನೋಡಿ", ml: "കാത്തിരുന്ന് നോക്കുക", hi: "रुकें और नज़र रखें" });

  const FACTORS = [
    { icon: "🌦️", title: tr(language, { en: "Weather", ta: "வானிலை", te: "వాతావరణం", kn: "ಹವಾಮಾನ", ml: "കാലാവസ്ഥ", hi: "मौसम" }), desc: tr(language, { en: "Weather conditions being monitored across key growing regions", ta: "முக்கிய பகுதிகளில் வானிலை நிலைமைகள் கண்காணிக்கப்படுகின்றன", te: "ముఖ్య ప్రాంతాల్లో వాతావరణ పరిస్థితులు పర్యవేక్షించబడుతున్నాయి", kn: "ಮುಖ್ಯ ಬೆಳೆ ಪ್ರದೇಶಗಳಲ್ಲಿ ಹವಾಮಾನವನ್ನು ಗಮನಿಸಲಾಗುತ್ತಿದೆ", ml: "പ്രധാന കൃഷി മേഖലകളിലെ കാലാവസ്ഥ നിരീക്ഷിക്കുന്നു", hi: "मुख्य उत्पादन क्षेत्रों में मौसम पर नज़र रखी जा रही है" }), status: "Moderate" },
    { icon: "📦", title: tr(language, { en: "Demand & Supply", ta: "தேவை & வழங்கல்", te: "డిమాండ్ & సరఫరా", kn: "ಬೇಡಿಕೆ & ಪೂರೈಕೆ", ml: "ആവശ്യവും ലഭ്യതയും", hi: "मांग और आपूर्ति" }), desc: tr(language, { en: "Festive season demand and export policies are key factors", ta: "பண்டிகை காலத்தின் தேவை மற்றும் ஏற்றுமதி கொள்கைகள் முக்கிய காரணிகள்", te: "పండుగ కాల డిమాండ్ మరియు ఎగుమతి విధానాలు ముఖ్య అంశాలు", kn: "ಹಬ್ಬದ ಕಾಲದ ಬೇಡಿಕೆ ಮತ್ತು ರಫ್ತು ನೀತಿಗಳು ಮುಖ್ಯ ಅಂಶಗಳು", ml: "ഉത്സവകാല ആവശ്യവും കയറ്റുമതി നയങ്ങളുമാണ് പ്രധാന ഘടകങ്ങൾ", hi: "त्योहारों की मांग और निर्यात नीतियां मुख्य कारण हैं" }), status: "High" },
    { icon: "🚛", title: tr(language, { en: "Logistics", ta: "தளவாடங்கள்", te: "లాజిస్టిక్స్", kn: "ಸಾಗಣೆ", ml: "ഗതാഗതം", hi: "ढुलाई" }), desc: tr(language, { en: "Fuel prices and transport availability are impacting logistics costs", ta: "எரிபொருள் விலைகள் மற்றும் போக்குவரத்து கிடைக்கும் தன்மை செலவுகளை பாதிக்கிறது", te: "ఇంధన ధరలు మరియు రవాణా అందుబాటు ఖర్చులను ప్రభావితం చేస్తున్నాయి", kn: "ಇಂಧನ ಬೆಲೆ ಮತ್ತು ವಾಹನ ಲಭ್ಯತೆ ಸಾಗಣೆ ವೆಚ್ಚದ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುತ್ತಿವೆ", ml: "ഇന്ധന വിലയും വാഹന ലഭ്യതയും ഗതാഗത ചെലവിനെ ബാധിക്കുന്നു", hi: "ईंधन के दाम और गाड़ियों की उपलब्धता ढुलाई खर्च पर असर डाल रहे हैं" }), status: "Low" },
    { icon: "🏛️", title: tr(language, { en: "Govt Policy", ta: "அரசு கொள்கை", te: "ప్రభుత్వ విధానం", kn: "ಸರ್ಕಾರಿ ನೀತಿ", ml: "സർക്കാർ നയം", hi: "सरकारी नीति" }), desc: tr(language, { en: "MSP notifications, FCI procurement and export restrictions affect price", ta: "MSP, FCI கொள்முதல் மற்றும் ஏற்றுமதி தடைகள் விலையை பாதிக்கின்றன", te: "MSP, FCI సేకరణ మరియు ఎగుమతి నిషేధాలు ధరను ప్రభావితం చేస్తాయి", kn: "MSP, FCI ಖರೀದಿ ಮತ್ತು ರಫ್ತು ನಿರ್ಬಂಧಗಳು ಬೆಲೆಯ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುತ್ತವೆ", ml: "MSP, FCI സംഭരണം, കയറ്റുമതി നിയന്ത്രണങ്ങൾ എന്നിവ വിലയെ ബാധിക്കുന്നു", hi: "MSP, FCI खरीद और निर्यात पाबंदियां दाम पर असर डालती हैं" }), status: "Medium" },
  ];

  const statusColor: Record<string, string> = { High: "#B91C1C", Medium: "#92400E", Low: "#15803D", Moderate: "#1D4ED8" };
  const statusBg: Record<string, string> = { High: "#FEE2E2", Medium: "#FEF9C3", Low: "#DCFCE7", Moderate: "#DBEAFE" };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>{L.back}</button>
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element -- relies on onError to fall back to the crop emoji; loaded directly so remote failures hit the fallback
            <img src={crop.image} alt={crop.name} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }}
              onError={() => setImgError(true)} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${crop.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{crop.emoji}</div>
          )}
          <div>
            <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700 }}>{getName()}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{categoryName(crop.category, language)} · {seasonName(crop.season, language)} {L.season} · {crop.states.slice(0, 3).join(", ")}</div>
          </div>
        </div>
        <button id="btn-generate-report" className="btn btn-amber" onClick={() => window.print()}>🖨️ {L.report}</button>
      </div>

      <div className="page-content">
        {/* Price + action row */}
        <div className="grid-cols-4-responsive" style={{ gap: 14, marginBottom: 18 }}>
          <div className="stat-card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{L.currentPrice}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--primary-dark)" }}>{formatPrice(currentPrice)}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{L.per} {unitName(crop.unit, language)}</div>
            <div style={{ fontSize: 11, marginTop: 4, color: live ? "#15803D" : "var(--text-muted)", fontWeight: 600 }}>
              {live ? "✓ " : ""}{priceSourceLabel}
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{L.msp}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: crop.msp > 0 ? "var(--secondary)" : "var(--text-muted)" }}>{crop.msp > 0 ? formatPrice(crop.msp) : "—"}</div>
            <div style={{ fontSize: 12, color: currentPrice >= crop.msp && crop.msp > 0 ? "#15803D" : crop.msp === 0 ? "var(--text-muted)" : "#B91C1C" }}>
              {crop.msp > 0 ? (currentPrice >= crop.msp ? `✓ ${L.aboveMsp}` : `⚠️ ${L.belowMsp}`) : L.noMsp}
            </div>
          </div>
          <div className="stat-card" style={{ background: recommendation ? actionBg[action] : undefined }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{L.aiRec}</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 6, color: recommendation ? actionColor[action] : "var(--text)" }}>{actionText[action]}</div>
            <div style={{ fontSize: 12, color: recommendation ? actionColor[action] : "var(--text-muted)" }}>
              {actionHint}
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{L.confidence}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--primary)" }}>{recommendation?.confidence || 75}%</div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${recommendation?.confidence || 75}%` }} />
            </div>
          </div>
        </div>

        {/* Chart + Factors */}
        <div className="split-layout-2col" style={{ gap: 16, marginBottom: 18 }}>
          {/* Chart card */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>📈 {L.forecast}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {seriesLoading
                    ? tr(language, PRICE_LABELS.loading)
                    : official
                      ? `${tr(language, PRICE_LABELS.officialHistory)} (${series?.scope} · ${tr(language, PRICE_LABELS.stateMedian)}) — ${timeframe} ${tr(language, PRICE_LABELS.history)} + ${tr(language, PRICE_LABELS.forecastBand)}`
                      : tr(language, {
                    en: `Estimated trend (simulated) — ${timeframe} history + 30d projection with band`,
                    ta: `மதிப்பீடு போக்கு — ${timeframe} வரலாறு + 30 நாள் கணிப்பு வரம்புடன்`,
                    te: `అంచనా ధోరణి — ${timeframe} చరిత్ర + 30 రోజుల అంచనా పరిధితో`,
                    kn: `ಅಂದಾಜು ಪ್ರವೃತ್ತಿ — ${timeframe} ಇತಿಹಾಸ + 30 ದಿನಗಳ ಮುನ್ಸೂಚನೆ ವ್ಯಾಪ್ತಿಯೊಂದಿಗೆ`,
                    ml: `ഏകദേശ പ്രവണത — ${timeframe} ചരിത്രം + പരിധിയോടെ 30 ദിവസത്തെ പ്രവചനം`,
                    hi: `अनुमानित रुझान — ${timeframe} इतिहास + सीमा के साथ 30 दिन का अनुमान`,
                  })}
                  {live && !official && !seriesLoading ? tr(language, { en: `, anchored to today's Agmarknet price`, ta: ", இன்றைய Agmarknet விலையுடன் இணைக்கப்பட்டது", te: ", నేటి Agmarknet ధర ఆధారంగా", kn: ", ಇಂದಿನ Agmarknet ಬೆಲೆಯ ಆಧಾರದಲ್ಲಿ", ml: ", ഇന്നത്തെ Agmarknet വിലയെ അടിസ്ഥാനമാക്കി", hi: ", आज के Agmarknet दाम के आधार पर" }) : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {/* Timeframe selector */}
                <div style={{ display: "flex", gap: 4, background: "var(--accent)", padding: 3, borderRadius: 8 }}>
                  {(["1M", "3M", "1Y"] as const).map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: timeframe === tf ? "var(--primary)" : "transparent",
                        color: timeframe === tf ? "#fff" : "var(--text-muted)",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}>
                      {tf}
                    </button>
                  ))}
                </div>

                {(["chart", "table"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: "5px 14px", borderRadius: 8, border: `1.5px solid ${tab === t ? "var(--primary)" : "var(--border)"}`, background: tab === t ? "var(--primary)" : "transparent", color: tab === t ? "#fff" : "var(--text-muted)", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
                    {t === "chart" ? L.chart : L.table}
                  </button>
                ))}
              </div>
            </div>

            {tab === "chart" ? (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4964B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#C4964B" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} interval={Math.max(4, Math.floor(chartData.length / 9))} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickFormatter={v => v ? `₹${(v / 1000).toFixed(1)}K` : ""} width={70} />
                  <Tooltip formatter={(v: unknown, n: unknown) => [Number(v) ? formatPrice(Number(v)) : "—", String(n)]} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12.5 }} />
                  <Legend />
                  <Area type="monotone" dataKey="upper" fill="url(#bandGrad)" stroke="transparent" name={L.upperBand} legendType="none" />
                  <Area type="monotone" dataKey="lower" fill="var(--bg)" stroke="transparent" name={L.lowerBand} legendType="none" />
                  <Line type="monotone" dataKey="actual" stroke="#5C7A3E" strokeWidth={2.5} dot={false} name={official ? tr(language, PRICE_LABELS.agmarknetPrice) : L.estHistorySeries} connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#C4964B" strokeWidth={2} strokeDasharray="5 3" dot={false} name={official ? tr(language, PRICE_LABELS.forecast) : L.estProjection} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="table-wrap" style={{ maxHeight: 280, overflowY: "auto" }}>
                <table>
                  <thead><tr><th>{L.date}</th><th>{L.price}</th><th>{L.band}</th><th>{L.type}</th></tr></thead>
                  <tbody>
                    {chartData.slice(-20).map((row, i) => (
                      <tr key={i}>
                        <td>{row.date}</td>
                        <td style={{ fontWeight: 700 }}>{row.actual ? formatPrice(row.actual) : row.predicted ? formatPrice(row.predicted) : "—"}</td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {row.lower && row.upper ? `${formatPrice(row.lower)} – ${formatPrice(row.upper)}` : "—"}
                        </td>
                        <td>
                          <span className={`badge ${row.actual ? "badge-green" : "badge-amber"}`}>{official ? tr(language, row.actual ? PRICE_LABELS.official : PRICE_LABELS.forecast) : row.actual ? L.estHistory : L.estForecast}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Factors sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>⚖️ {L.factors}</div>
            {FACTORS.map((f, i) => (
              <div key={i} className="card-sm" style={{ transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{f.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{f.title}</span>
                  </div>
                  <span style={{ background: statusBg[f.status], color: statusColor[f.status], fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{tr(language, STATUS_LEVELS[f.status])}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}

            {recommendation && (
              <div className="card-sm" style={{ background: actionBg[action], border: `1px solid ${actionColor[action]}30` }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: actionColor[action], marginBottom: 6 }}>🤖 {L.aiRec}</div>
                <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{getReason()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Price history table */}
        {/* Mandi Price Comparison Widget */}
        <div style={{ marginBottom: 20 }}>
          <MandiComparison initialCropId={crop.id} compact={true} />
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🗃️ {L.history} — {L.recent} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>({official ? `Agmarknet · ${series?.scope}` : tr(language, { en: "estimated trend", ta: "மதிப்பீடு போக்கு", te: "అంచనా ధోరణి", kn: "ಅಂದಾಜು ಪ್ರವೃತ್ತಿ", ml: "ഏകദേശ പ്രവണത", hi: "अनुमानित रुझान" })}{live && !official ? tr(language, { en: ", latest = Agmarknet", ta: ", சமீபத்தியது = Agmarknet", te: ", తాజా = Agmarknet", kn: ", ಇತ್ತೀಚಿನದು = Agmarknet", ml: ", ഏറ്റവും പുതിയത് = Agmarknet", hi: ", ताज़ा = Agmarknet" }) : ""})</span></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>{L.date}</th><th>{L.price}</th>{official && <th>{tr(language, PRICE_LABELS.mandis)}</th>}<th>{L.change}</th></tr>
              </thead>
              <tbody>
                {history.slice(-20).reverse().map((row, i, arr) => {
                  const prev = arr[i + 1];
                  const change = prev ? ((row.price - prev.price) / prev.price) * 100 : 0;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{row.date}</td>
                      <td style={{ fontWeight: 700, color: "var(--primary-dark)" }}>{formatPrice(row.price)}</td>
                      {official && <td>{row.markets > 0 ? row.markets : "—"}</td>}
                      <td style={{ fontWeight: 700, color: change >= 0 ? "#15803D" : "#B91C1C", fontSize: 13 }}>
                        {change !== 0 ? `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
