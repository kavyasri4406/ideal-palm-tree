"use client";
import { useState, useMemo } from "react";
import { CROPS, formatPrice } from "@/lib/cropData";
import { usePriceSeries, dayLabel } from "@/lib/usePriceSeries";
import { PRICE_LABELS } from "@/lib/priceSeriesLabels";
import { useApp } from "@/lib/AppContext";
import { tr, cropName, categoryName } from "@/lib/i18n";
import MarketHeatmap from "@/components/MarketHeatmap";
import VolatilityAlerts from "@/components/VolatilityAlerts";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#5C7A3E", "#C4964B", "#E85C45", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];

// Category distribution (static — depends only on the CROPS catalogue)
const CATEGORY_DATA: { name: string; value: number; avgPrice: number }[] =
  ["Cereals", "Oilseeds", "Vegetables", "Pulses", "Fruits", "Spices", "Cash Crops"].map(cat => {
    const crops = CROPS.filter(c => c.category === cat);
    return { name: cat, value: crops.length, avgPrice: crops.reduce((s, c) => s + c.basePrice, 0) / (crops.length || 1) };
  });

export default function AnalyticsPage() {
  const { language, location } = useApp();
  const [selectedCropId, setSelectedCropId] = useState("rice");
  const [timeframe, setTimeframe] = useState(60);
  const selectedCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
  // Official Agmarknet history when available, otherwise a labelled simulation; the metrics are a
  // backtest of the forecasting model on whichever series is shown
  const { series, loading: seriesLoading } = usePriceSeries(selectedCrop, location.state);
  const official = series?.source === "agmarknet";
  const metrics = series?.metrics ?? null;
  const history = useMemo(
    () => (series?.history ?? []).slice(-(timeframe + 1)).map(h => ({ iso: h.date, date: dayLabel(h.date), price: h.price, markets: h.markets ?? 0 })),
    [series, timeframe]
  );
  const catData = CATEGORY_DATA;
  // Captured once on mount: calling new Date() during render is impure and changes on every re-render
  const [loadedAt] = useState(() => new Date());

  const exportToCSV = () => {
    if (history.length === 0) return;
    const crop = selectedCrop;
    const headers = ["Date", official ? "Agmarknet state median price (INR/quintal)" : "Simulated price (INR)", "Mandis reporting", "MSP (INR)"];
    const rows = history.map(h => [h.iso, h.price, h.markets, crop.msp]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${crop.name.replace(/\s+/g, '_')}_market_data_${timeframe}d.csv`;
    link.click();
  };

  const getCategoryName = (cat: string) => categoryName(cat, language);

  const selectedCropName = cropName(selectedCrop, language);
  const L = {
    title: tr(language, { en: "Data & Analytics", ta: "தரவு & பகுப்பாய்வு", te: "డేటా & విశ్లేషణలు", kn: "ಡೇಟಾ & ವಿಶ್ಲೇಷಣೆ", ml: "ഡാറ്റയും വിശകലനവും", hi: "डेटा और विश्लेषण" }),
    sub: tr(language, { en: "Forecasting model performance and market insights", ta: "கணிப்பு மாதிரி செயல்திறன் மற்றும் சந்தை நிலவரம்", te: "అంచనా మోడల్ పనితీరు మరియు మార్కెట్ సమాచారం", kn: "ಮುನ್ಸೂಚನೆ ಮಾದರಿಯ ಕಾರ್ಯಕ್ಷಮತೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ", ml: "പ്രവചന മോഡലിന്റെ പ്രകടനവും വിപണി വിവരങ്ങളും", hi: "पूर्वानुमान मॉडल का प्रदर्शन और बाज़ार की जानकारी" }),
    modelAcc: tr(language, { en: "Model Accuracy", ta: "மாதிரி துல்லியம்", te: "మోడల్ ఖచ్చితత్వం", kn: "ಮಾದರಿ ನಿಖರತೆ", ml: "മോഡൽ കൃത്യത", hi: "मॉडल की सटीकता" }),
    priceHistory: tr(language, { en: "Price History", ta: "விலை வரலாறு", te: "ధర చరిత్ర", kn: "ಬೆಲೆ ಇತಿಹಾಸ", ml: "വില ചരിത്രം", hi: "भाव का इतिहास" }),
    rawData: tr(language, { en: "Raw Market Data", ta: "சந்தை மூல தரவு", te: "మార్కెట్ ముడి డేటా", kn: "ಮಾರುಕಟ್ಟೆ ಮೂಲ ಡೇಟಾ", ml: "വിപണി അടിസ്ഥാന ഡാറ്റ", hi: "बाज़ार का मूल डेटा" }),
    estimatedPrice: tr(language, { en: "Estimated price", ta: "மதிப்பிட்ட விலை", te: "అంచనా ధర", kn: "ಅಂದಾಜು ಬೆಲೆ", ml: "കണക്കാക്കിയ വില", hi: "अनुमानित भाव" }),
    days: tr(language, { en: "D", ta: " நாள்", te: " రోజులు", kn: " ದಿನ", ml: " ദിവസം", hi: " दिन" }),
  };

  // Mandis that reported a price on each of the last 14 days (official data only)
  const marketsChart = history.slice(-14).map(h => ({ date: h.date, markets: h.markets }));
  const sourceNote = seriesLoading
    ? tr(language, PRICE_LABELS.loading)
    : official
      ? `${tr(language, PRICE_LABELS.officialHistory)} (${series?.scope} · ${tr(language, PRICE_LABELS.stateMedian)})`
      : tr(language, PRICE_LABELS.simulatedHistory);
  const priceName = official ? tr(language, PRICE_LABELS.agmarknetPrice) : L.estimatedPrice;
  const fmt = (v: number | undefined, digits: number) => (v === undefined ? "—" : v.toLocaleString("en-IN", { maximumFractionDigits: digits }));

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
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🎯 {L.modelAcc} — {selectedCropName} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>({tr(language, official ? PRICE_LABELS.backtestOfficial : PRICE_LABELS.backtestSimulated)})</span></div>
          <div className="grid-cols-4-responsive" style={{ gap: 14 }}>
            {[
              { label: "MAE", value: fmt(metrics?.mae, 0), unit: `₹/${selectedCrop.unit}`, icon: "🎯", desc: tr(language, { en: "Mean Absolute Error", ta: "சராசரி முழுமையான பிழை", te: "సగటు సంపూర్ణ దోషం", kn: "ಸರಾಸರಿ ಸಂಪೂರ್ಣ ದೋಷ", ml: "ശരാശരി കേവല പിശക്", hi: "औसत निरपेक्ष त्रुटि" }), color: "#5C7A3E" },
              { label: "RMSE", value: fmt(metrics?.rmse, 0), unit: `₹/${selectedCrop.unit}`, icon: "📐", desc: tr(language, PRICE_LABELS.rmse), color: "#C4964B" },
              { label: "MAPE", value: metrics ? `${fmt(metrics.mape, 1)}%` : "—", unit: metrics ? `${tr(language, PRICE_LABELS.naive)}: ${fmt(metrics.naiveMape, 1)}%` : "", icon: "✅", desc: tr(language, PRICE_LABELS.mape), color: "#3B82F6" },
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
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sourceNote}</div>
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
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} interval={Math.max(1, Math.floor(history.length / 8))} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={v => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : ""} width={80} />
              <Tooltip formatter={(v: unknown) => [formatPrice(Number(v)), priceName]} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
              <Area type="monotone" dataKey="price" stroke="#5C7A3E" strokeWidth={2} fill="url(#priceGrad)" dot={false} name={priceName} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Two charts row */}
        <div className="grid-cols-2-responsive" style={{ gap: 16, marginBottom: 18 }}>
          {/* Volume bar chart */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📦 {tr(language, PRICE_LABELS.mandis)}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>{official ? `${selectedCropName} · ${series?.scope}` : tr(language, PRICE_LABELS.mandisOnlyOfficial)}</div>
            {official && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
                  <Bar dataKey="markets" fill="#C4964B" radius={[4, 4, 0, 0]} name={tr(language, PRICE_LABELS.mandis)} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
            <div style={{ fontWeight: 700, fontSize: 15 }}>🗃️ {L.rawData} — {selectedCropName} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>({official ? `Agmarknet · ${series?.scope}` : tr(language, { en: "estimated trend", ta: "(மதிப்பிட்ட போக்கு)", te: "(అంచనా ధోరణి)", kn: "(ಅಂದಾಜು ಪ್ರವೃತ್ತಿ)", ml: "(കണക്കാക്കിയ പ്രവണത)", hi: "(अनुमानित रुझान)" })})</span></div>
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
                  {official && <th>{tr(language, PRICE_LABELS.mandis)}</th>}
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
                    {official && <td>{row.markets > 0 ? row.markets : "—"}</td>}
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
