"use client";
import { useState, useMemo } from "react";
import { CROPS, generatePriceHistory, formatPrice } from "@/lib/cropData";
import { useApp } from "@/lib/AppContext";
import { tr, cropName, categoryName } from "@/lib/i18n";
import MarketHeatmap from "@/components/MarketHeatmap";
import VolatilityAlerts from "@/components/VolatilityAlerts";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#5C7A3E", "#C4964B", "#E85C45", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];

function calcMAE(actual: number[], predicted: number[]): number {
  const n = Math.min(actual.length, predicted.length);
  return actual.slice(0, n).reduce((s, a, i) => s + Math.abs(a - predicted[i]), 0) / n;
}
function calcMSE(actual: number[], predicted: number[]): number {
  const n = Math.min(actual.length, predicted.length);
  return actual.slice(0, n).reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0) / n;
}
function calcR2(actual: number[], predicted: number[]): number {
  const mean = actual.reduce((s, v) => s + v, 0) / actual.length;
  const ssTot = actual.reduce((s, v) => s + (v - mean) ** 2, 0);
  const ssRes = actual.slice(0, predicted.length).reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0);
  return 1 - ssRes / ssTot;
}

// Category distribution (static — depends only on the CROPS catalogue)
const CATEGORY_DATA: { name: string; value: number; avgPrice: number }[] =
  ["Cereals", "Oilseeds", "Vegetables", "Pulses", "Fruits", "Spices", "Cash Crops"].map(cat => {
    const crops = CROPS.filter(c => c.category === cat);
    return { name: cat, value: crops.length, avgPrice: crops.reduce((s, c) => s + c.basePrice, 0) / (crops.length || 1) };
  });

// Simulated model evaluation: compares the history against a noisy "prediction"
function computeHistoryAndMetrics(cropId: string, timeframe: number) {
  const crop = CROPS.find(c => c.id === cropId) || CROPS[0];
  const history = generatePriceHistory(crop, timeframe);
  const actual = history.map(h => h.price);
  const noise = actual.map(p => p + (Math.random() - 0.5) * crop.basePrice * 0.04);
  const mae = calcMAE(actual, noise);
  const mse = calcMSE(actual, noise);
  const r2 = calcR2(actual, noise);
  return { history, metrics: { mae, mse, r2: Math.max(0.7, Math.min(0.99, r2)) } };
}

// Localized names for the simulated weather values in the price history
const WEATHER_NAMES: Record<string, { ta: string; te: string; kn: string; ml: string; hi: string }> = {
  "Sunny": { ta: "வெயில்", te: "ఎండ", kn: "ಬಿಸಿಲು", ml: "വെയിൽ", hi: "धूप" },
  "Cloudy": { ta: "மேகமூட்டம்", te: "మేఘావృతం", kn: "ಮೋಡ ಕವಿದ", ml: "മേഘാവൃതം", hi: "बादल" },
  "Rainy": { ta: "மழை", te: "వర్షం", kn: "ಮಳೆ", ml: "മഴ", hi: "बारिश" },
  "Partly Cloudy": { ta: "ஓரளவு மேகமூட்டம்", te: "కొంత మేఘావృతం", kn: "ಭಾಗಶಃ ಮೋಡ", ml: "ഭാഗികമായി മേഘാവൃതം", hi: "आंशिक बादल" },
  "Foggy": { ta: "பனிமூட்டம்", te: "పొగమంచు", kn: "ಮಂಜು", ml: "മൂടൽമഞ്ഞ്", hi: "कोहरा" },
};

export default function AnalyticsPage() {
  const { language } = useApp();
  const [selectedCropId, setSelectedCropId] = useState("rice");
  const [timeframe, setTimeframe] = useState(60);
  const { history, metrics } = useMemo(
    () => computeHistoryAndMetrics(selectedCropId, timeframe),
    [selectedCropId, timeframe]
  );
  const catData = CATEGORY_DATA;
  // Captured once on mount: calling new Date() during render is impure and changes on every re-render
  const [loadedAt] = useState(() => new Date());

  const exportToCSV = () => {
    if (history.length === 0) return;
    const crop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
    const headers = ["Date", "Estimated Price (INR)", "Volume", "Weather", "MSP (INR)"];
    const rows = history.map(h => [h.date, h.price, h.volume, h.weather, crop.msp]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${crop.name.replace(/\s+/g, '_')}_market_data_${timeframe}d.csv`;
    link.click();
  };

  const getCategoryName = (cat: string) => categoryName(cat, language);
  const weatherName = (w: string) => (language === "en" ? w : WEATHER_NAMES[w]?.[language] || w);

  const selectedCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
  const selectedCropName = cropName(selectedCrop, language);
  const L = {
    title: tr(language, { en: "Data & Analytics", ta: "தரவு & பகுப்பாய்வு", te: "డేటా & విశ్లేషణలు", kn: "ಡೇಟಾ & ವಿಶ್ಲೇಷಣೆ", ml: "ഡാറ്റയും വിശകലനവും", hi: "डेटा और विश्लेषण" }),
    sub: tr(language, { en: "Forecasting model performance and market insights", ta: "கணிப்பு மாதிரி செயல்திறன் மற்றும் சந்தை நிலவரம்", te: "అంచనా మోడల్ పనితీరు మరియు మార్కెట్ సమాచారం", kn: "ಮುನ್ಸೂಚನೆ ಮಾದರಿಯ ಕಾರ್ಯಕ್ಷಮತೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ", ml: "പ്രവചന മോഡലിന്റെ പ്രകടനവും വിപണി വിവരങ്ങളും", hi: "पूर्वानुमान मॉडल का प्रदर्शन और बाज़ार की जानकारी" }),
    modelAcc: tr(language, { en: "Model Accuracy", ta: "மாதிரி துல்லியம்", te: "మోడల్ ఖచ్చితత్వం", kn: "ಮಾದರಿ ನಿಖರತೆ", ml: "മോഡൽ കൃത്യത", hi: "मॉडल की सटीकता" }),
    priceHistory: tr(language, { en: "Price History", ta: "விலை வரலாறு", te: "ధర చరిత్ర", kn: "ಬೆಲೆ ಇತಿಹಾಸ", ml: "വില ചരിത്രം", hi: "भाव का इतिहास" }),
    volumeChart: tr(language, { en: "Volume Analysis", ta: "வர்த்தக அளவு பகுப்பாய்வு", te: "వ్యాపార పరిమాణ విశ్లేషణ", kn: "ವಹಿವಾಟು ಪ್ರಮಾಣ ವಿಶ್ಲೇಷಣೆ", ml: "വ്യാപാര അളവ് വിശകലനം", hi: "कारोबार मात्रा विश्लेषण" }),
    rawData: tr(language, { en: "Raw Market Data", ta: "சந்தை மூல தரவு", te: "మార్కెట్ ముడి డేటా", kn: "ಮಾರುಕಟ್ಟೆ ಮೂಲ ಡೇಟಾ", ml: "വിപണി അടിസ്ഥാന ഡാറ്റ", hi: "बाज़ार का मूल डेटा" }),
    simulated: tr(language, { en: "(simulated demo metrics)", ta: "(மாதிரி டெமோ அளவீடுகள்)", te: "(నమూనా డెమో గణాంకాలు)", kn: "(ಮಾದರಿ ಡೆಮೊ ಅಂಕಿಅಂಶಗಳು)", ml: "(മാതൃകാ ഡെമോ കണക്കുകൾ)", hi: "(नमूना डेमो आंकड़े)" }),
    estimatedPrice: tr(language, { en: "Estimated price", ta: "மதிப்பிட்ட விலை", te: "అంచనా ధర", kn: "ಅಂದಾಜು ಬೆಲೆ", ml: "കണക്കാക്കിയ വില", hi: "अनुमानित भाव" }),
    volumeUnits: tr(language, { en: "Volume (units)", ta: "அளவு (யூனிட்கள்)", te: "పరిమాణం (యూనిట్లు)", kn: "ಪ್ರಮಾಣ (ಯೂನಿಟ್‌ಗಳು)", ml: "അളവ് (യൂണിറ്റുകൾ)", hi: "मात्रा (यूनिट)" }),
    days: tr(language, { en: "D", ta: " நாள்", te: " రోజులు", kn: " ದಿನ", ml: " ദിവസം", hi: " दिन" }),
  };

  // Prepare volume chart
  const volumeChart = history.slice(-14).map(h => ({ date: h.date, volume: h.volume, price: h.price }));

  // Price comparison across crops (selected crop + category peers)
  const categoryPeers = CROPS.filter(c => c.category === selectedCrop.category && c.id !== selectedCrop.id);
  const comparisonList = [selectedCrop, ...categoryPeers].slice(0, 8);
  const cropComparison = comparisonList.map(c => ({ 
    name: c.emoji + " " + cropName(c, language).split(" ")[0], 
    basePrice: c.basePrice, 
    msp: c.msp 
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700 }}>{L.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{L.sub}</div>
        </div>
        <select id="select-analytics-crop" className="input" style={{ width: 200 }}
          value={selectedCropId} onChange={e => setSelectedCropId(e.target.value)}>
          {CROPS.map(c => <option key={c.id} value={c.id}>{c.emoji} {cropName(c, language)}</option>)}
        </select>
      </div>

      <div className="page-content">
        {/* 🗺️ Market Trend Heatmap */}
        <div style={{ marginBottom: 22 }}>
          <MarketHeatmap />
        </div>

        {/* ⚠️ Volatility Alerts Panel */}
        <div style={{ marginBottom: 22 }}>
          <VolatilityAlerts />
        </div>

        {/* Model accuracy cards */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🎯 {L.modelAcc} — {selectedCropName} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>{L.simulated}</span></div>
          <div className="grid-cols-4-responsive" style={{ gap: 14 }}>
            {[
              { label: "MAE", value: metrics.mae.toFixed(2), unit: tr(language, { en: "₹/unit", ta: "₹/யூனிட்", te: "₹/యూనిట్", kn: "₹/ಯೂನಿಟ್", ml: "₹/യൂണിറ്റ്", hi: "₹/यूनिट" }), icon: "🎯", desc: tr(language, { en: "Mean Absolute Error", ta: "சராசரி முழுமையான பிழை", te: "సగటు సంపూర్ణ దోషం", kn: "ಸರಾಸರಿ ಸಂಪೂರ್ಣ ದೋಷ", ml: "ശരാശരി കേവല പിശക്", hi: "औसत निरपेक्ष त्रुटि" }), color: "#5C7A3E" },
              { label: "MSE", value: metrics.mse.toFixed(1), unit: "₹²", icon: "📐", desc: tr(language, { en: "Mean Squared Error", ta: "சராசரி வர்க்கப் பிழை", te: "సగటు వర్గ దోషం", kn: "ಸರಾಸರಿ ವರ್ಗ ದೋಷ", ml: "ശരാശരി വർഗ പിശക്", hi: "औसत वर्ग त्रुटि" }), color: "#C4964B" },
              { label: tr(language, { en: "R² Score", ta: "R² மதிப்பெண்", te: "R² స్కోరు", kn: "R² ಅಂಕ", ml: "R² സ്കോർ", hi: "R² स्कोर" }), value: (metrics.r2 * 100).toFixed(1) + "%", unit: tr(language, { en: "accuracy", ta: "துல்லியம்", te: "ఖచ్చితత్వం", kn: "ನಿಖರತೆ", ml: "കൃത്യത", hi: "सटीकता" }), icon: "✅", desc: tr(language, { en: "Model R² accuracy", ta: "மாதிரியின் R² துல்லியம்", te: "మోడల్ R² ఖచ్చితత్వం", kn: "ಮಾದರಿಯ R² ನಿಖರತೆ", ml: "മോഡലിന്റെ R² കൃത്യത", hi: "मॉडल की R² सटीकता" }), color: "#3B82F6" },
              { label: tr(language, { en: "Last Update", ta: "கடைசி புதுப்பிப்பு", te: "చివరి అప్‌డేట్", kn: "ಕೊನೆಯ ಅಪ್‌ಡೇಟ್", ml: "അവസാന അപ്ഡേറ്റ്", hi: "आखिरी अपडेट" }), value: loadedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), unit: loadedAt.toLocaleDateString(`${language}-IN`, { day: "2-digit", month: "short", year: "numeric" }), icon: "🕐", desc: tr(language, { en: "Data refreshed", ta: "தரவு புதுப்பிக்கப்பட்டது", te: "డేటా తాజాకరించబడింది", kn: "ಡೇಟಾ ನವೀಕರಿಸಲಾಗಿದೆ", ml: "ഡാറ്റ പുതുക്കി", hi: "डेटा ताज़ा किया गया" }), color: "#8B5CF6" },
            ].map(m => (
              <div key={m.label} className="stat-card" style={{ borderLeft: `4px solid ${m.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</div>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{m.unit}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Price history chart */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📈 {L.priceHistory} — {selectedCropName}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{tr(language, {
                en: "Estimated trend (simulated around the reference price) — not official mandi prices",
                ta: "மதிப்பிட்ட போக்கு (குறிப்பு விலையை வைத்து கணக்கிடப்பட்டது) — அதிகாரப்பூர்வ மண்டி விலை அல்ல",
                te: "అంచనా ధోరణి (సూచన ధర ఆధారంగా లెక్కించినది) — అధికారిక మండీ ధరలు కావు",
                kn: "ಅಂದಾಜು ಪ್ರವೃತ್ತಿ (ಉಲ್ಲೇಖ ಬೆಲೆಯ ಆಧಾರದಲ್ಲಿ ಲೆಕ್ಕಿಸಲಾಗಿದೆ) — ಅಧಿಕೃತ ಮಂಡಿ ಬೆಲೆಗಳಲ್ಲ",
                ml: "കണക്കാക്കിയ പ്രവണത (റഫറൻസ് വിലയെ അടിസ്ഥാനമാക്കി) — ഔദ്യോഗിക മണ്ടി വിലയല്ല",
                hi: "अनुमानित रुझान (संदर्भ भाव के आधार पर) — सरकारी मंडी भाव नहीं",
              })}</div>
            </div>
            <div style={{ display: "flex", background: "var(--border)", borderRadius: 8, padding: 2 }}>
              {[7, 14, 30, 60, 90].map(days => (
                <button key={days} onClick={() => setTimeframe(days)} style={{
                  padding: "4px 10px", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
                  background: timeframe === days ? "var(--bg-card)" : "transparent",
                  color: timeframe === days ? "var(--text)" : "var(--text-muted)",
                  borderRadius: 6, transition: "0.2s", boxShadow: timeframe === days ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                }}>
                  {days}{L.days}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5C7A3E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#5C7A3E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} interval={9} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={v => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : ""} width={80} />
              <Tooltip formatter={(v: unknown) => [formatPrice(Number(v)), L.estimatedPrice]} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
              <Area type="monotone" dataKey="price" stroke="#5C7A3E" strokeWidth={2} fill="url(#priceGrad)" dot={false} name={L.estimatedPrice} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Two charts row */}
        <div className="grid-cols-2-responsive" style={{ gap: 16, marginBottom: 18 }}>
          {/* Volume bar chart */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📦 {L.volumeChart}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>{tr(language, { en: "14-day trading volume (units)", ta: "14 நாள் வர்த்தக அளவு (யூனிட்கள்)", te: "14 రోజుల వ్యాపార పరిమాణం (యూనిట్లు)", kn: "14 ದಿನಗಳ ವಹಿವಾಟು ಪ್ರಮಾಣ (ಯೂನಿಟ್‌ಗಳು)", ml: "14 ദിവസത്തെ വ്യാപാര അളവ് (യൂണിറ്റുകൾ)", hi: "14 दिन की कारोबार मात्रा (यूनिट)" })}</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="volume" fill="#C4964B" radius={[4, 4, 0, 0]} name={L.volumeUnits} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie chart */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🥧 {tr(language, { en: "Crop Category Distribution", ta: "பயிர் வகை பகிர்வு", te: "పంట వర్గాల వారీగా పంపిణీ", kn: "ಬೆಳೆ ವರ್ಗಗಳ ಹಂಚಿಕೆ", ml: "വിള വിഭാഗങ്ങളുടെ വിതരണം", hi: "फसल श्रेणी वितरण" })}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>{tr(language, { en: "By number of tracked crops", ta: "பயிர்களின் எண்ணிக்கை அடிப்படையில்", te: "పంటల సంఖ్య ఆధారంగా", kn: "ಬೆಳೆಗಳ ಸಂಖ್ಯೆಯ ಆಧಾರದಲ್ಲಿ", ml: "വിളകളുടെ എണ്ണം അനുസരിച്ച്", hi: "फसलों की संख्या के अनुसार" })}</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${getCategoryName(name as string).slice(0, 8)} (${value})`} labelLine={false} fontSize={10}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: unknown, name: unknown) => [String(v) + " " + tr(language, { en: "crops", ta: "பயிர்கள்", te: "పంటలు", kn: "ಬೆಳೆಗಳು", ml: "വിളകൾ", hi: "फसलें" }), getCategoryName(String(name))]} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crop price comparison bar chart */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⚖️ {tr(language, { en: "Crop Price Comparison", ta: "பயிர் விலை ஒப்பீடு", te: "పంట ధరల పోలిక", kn: "ಬೆಳೆ ಬೆಲೆ ಹೋಲಿಕೆ", ml: "വിള വില താരതമ്യം", hi: "फसल भाव तुलना" })}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>{tr(language, {
            en: "Catalogue reference price vs Govt MSP for up to 8 crops (₹/quintal) — see a crop's page for live Agmarknet prices",
            ta: "8 பயிர்கள் வரை குறிப்பு விலை vs அரசு MSP (₹/குவிண்டால்) — நேரடி Agmarknet விலைக்கு பயிர் பக்கத்தைப் பார்க்கவும்",
            te: "8 పంటల వరకు సూచన ధర vs ప్రభుత్వ MSP (₹/క్వింటాల్) — ప్రత్యక్ష Agmarknet ధరల కోసం పంట పేజీ చూడండి",
            kn: "8 ಬೆಳೆಗಳವರೆಗೆ ಉಲ್ಲೇಖ ಬೆಲೆ vs ಸರ್ಕಾರಿ MSP (₹/ಕ್ವಿಂಟಾಲ್) — ನೇರ Agmarknet ಬೆಲೆಗಾಗಿ ಬೆಳೆಯ ಪುಟ ನೋಡಿ",
            ml: "8 വിളകൾ വരെ റഫറൻസ് വില vs സർക്കാർ MSP (₹/ക്വിന്റൽ) — തത്സമയ Agmarknet വിലയ്ക്ക് വിളയുടെ പേജ് കാണുക",
            hi: "8 फसलों तक संदर्भ भाव बनाम सरकारी MSP (₹/क्विंटल) — लाइव Agmarknet भाव के लिए फसल का पेज देखें",
          })}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cropComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={80} />
              <Tooltip formatter={(v: unknown) => [formatPrice(Number(v))]} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
              <Legend />
              <Bar dataKey="basePrice" name={tr(language, { en: "Reference price", ta: "குறிப்பு விலை", te: "సూచన ధర", kn: "ಉಲ್ಲೇಖ ಬೆಲೆ", ml: "റഫറൻസ് വില", hi: "संदर्भ भाव" })} fill="#5C7A3E" radius={[0, 4, 4, 0]} />
              <Bar dataKey="msp" name={tr(language, { en: "Govt MSP", ta: "அரசு MSP", te: "ప్రభుత్వ MSP", kn: "ಸರ್ಕಾರಿ MSP", ml: "സർക്കാർ MSP", hi: "सरकारी MSP" })} fill="#C4964B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Raw data table */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>🗃️ {L.rawData} — {selectedCropName} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>{tr(language, { en: "(estimated trend)", ta: "(மதிப்பிட்ட போக்கு)", te: "(అంచనా ధోరణి)", kn: "(ಅಂದಾಜು ಪ್ರವೃತ್ತಿ)", ml: "(കണക്കാക്കിയ പ്രവണത)", hi: "(अनुमानित रुझान)" })}</span></div>
            <button onClick={exportToCSV} className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 12, borderRadius: 8 }}>
              📥 {tr(language, { en: "Download CSV", ta: "CSV பதிவிறக்கு", te: "CSV డౌన్‌లోడ్", kn: "CSV ಡೌನ್‌ಲೋಡ್", ml: "CSV ഡൗൺലോഡ്", hi: "CSV डाउनलोड करें" })}
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{tr(language, { en: "Date", ta: "தேதி", te: "తేదీ", kn: "ದಿನಾಂಕ", ml: "തീയതി", hi: "तारीख" })}</th>
                  <th>{tr(language, { en: "Price (₹)", ta: "விலை (₹)", te: "ధర (₹)", kn: "ಬೆಲೆ (₹)", ml: "വില (₹)", hi: "भाव (₹)" })}</th>
                  <th>{L.volumeUnits}</th>
                  <th>{tr(language, { en: "Weather", ta: "வானிலை", te: "వాతావరణం", kn: "ಹವಾಮಾನ", ml: "കാലാവസ്ഥ", hi: "मौसम" })}</th>
                  <th>{tr(language, { en: "vs MSP", ta: "MSP உடன் ஒப்பீடு", te: "MSP తో పోలిక", kn: "MSP ಜೊತೆ ಹೋಲಿಕೆ", ml: "MSP-യുമായി താരതമ്യം", hi: "MSP से तुलना" })}</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-20).reverse().map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{row.date}</td>
                    <td style={{ fontWeight: 700, color: "var(--primary-dark)" }}>
                      {formatPrice(row.price)}
                      {selectedCrop.unit === "quintal" && <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 6 }}>({formatPrice(row.price / 100)}/kg)</span>}
                    </td>
                    <td>{row.volume.toLocaleString("en-IN")}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {row.weather.includes("Rain") ? "🌧️" : row.weather.includes("Cloud") ? "⛅" : row.weather.includes("Fog") ? "🌫️" : "☀️"} {weatherName(row.weather)}
                      </span>
                    </td>
                    <td>
                      {selectedCrop.msp > 0 ? (
                        <span style={{ color: row.price >= selectedCrop.msp ? "#15803D" : "#B91C1C", fontWeight: 600, fontSize: 12 }}>
                          {row.price >= selectedCrop.msp
                            ? `✓ ${tr(language, { en: "Above", ta: "அதிகம்", te: "ఎక్కువ", kn: "ಹೆಚ್ಚು", ml: "കൂടുതൽ", hi: "ऊपर" })}`
                            : `⚠️ ${tr(language, { en: "Below", ta: "குறைவு", te: "తక్కువ", kn: "ಕಡಿಮೆ", ml: "കുറവ്", hi: "नीचे" })}`}
                        </span>
                      ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
