"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CROPS, CATEGORIES, SEASONS, formatPrice, getLivePrice, getCropDesc } from "@/lib/cropData";
import { getCurrentUser, updatePortfolio } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";
import type { Language } from "@/lib/AppContext";
import { tr, cropName, categoryName } from "@/lib/i18n";
import PortfolioPerformanceGraph from "@/components/PortfolioPerformanceGraph";
import { getPriceAlerts, deletePriceAlert, togglePriceAlert, PriceAlert, dispatchPriceNotification } from "@/lib/priceAlerts";
import PriceAlertModal from "@/components/PriceAlertModal";

type AllLangs = { en: string; ta: string; te: string; kn: string; ml: string; hi: string };

/** Localized season name, e.g. "Rabi/Kharif" ("All" uses the shared category label). */
const SEASON_NAMES: Record<string, AllLangs> = {
  Kharif: { en: "Kharif", ta: "காரீஃப்", te: "ఖరీఫ్", kn: "ಮುಂಗಾರು", ml: "ഖരീഫ്", hi: "खरीफ" },
  Rabi: { en: "Rabi", ta: "ராபி", te: "రబీ", kn: "ಹಿಂಗಾರು", ml: "റാബി", hi: "रबी" },
  Zaid: { en: "Zaid", ta: "சைத்", te: "జాయిద్", kn: "ಜಾಯದ್", ml: "സായിദ്", hi: "जायद" },
  Annual: { en: "Annual", ta: "ஆண்டு முழுவதும்", te: "ఏడాది పొడవునా", kn: "ವರ್ಷಪೂರ್ತಿ", ml: "വർഷം മുഴുവൻ", hi: "सालभर" },
  Summer: { en: "Summer", ta: "கோடை", te: "వేసవి", kn: "ಬೇಸಿಗೆ", ml: "വേനൽ", hi: "गर्मी" },
};
const seasonName = (season: string, language: Language) =>
  season === "All"
    ? categoryName("All", language)
    : season.split("/").map(s => (SEASON_NAMES[s] ? tr(language, SEASON_NAMES[s]) : s)).join("/");

/** Localized price unit (all crops are priced per quintal). */
const unitName = (unit: string, language: Language) =>
  unit === "quintal" ? tr(language, { en: "quintal", ta: "குவிண்டால்", te: "క్వింటాల్", kn: "ಕ್ವಿಂಟಾಲ್", ml: "ക്വിന്റൽ", hi: "क्विंटल" }) : unit;

export default function MyCropsPage() {
  const router = useRouter();
  const { language, addNotification } = useApp();
  // Page renders client-only, so lazy initializers reading localStorage are hydration-safe
  const [portfolio, setPortfolio] = useState<string[]>(() => getCurrentUser()?.portfolio || []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [season, setSeason] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => getPriceAlerts());
  const [addSearch, setAddSearch] = useState("");
  const [toAdd, setToAdd] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {};
    CROPS.forEach(c => { p[c.id] = getLivePrice(c); });
    return p;
  });
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const np: Record<string, number> = {};
      CROPS.forEach(c => { np[c.id] = getLivePrice(c); });
      setPrices(np);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const savePortfolio = (newPortfolio: string[]) => {
    setPortfolio(newPortfolio);
    const user = getCurrentUser();
    if (user) updatePortfolio(user.email, newPortfolio);
  };

  const remove = (id: string) => savePortfolio(portfolio.filter(p => p !== id));

  const addSelected = () => {
    const updated = [...new Set([...portfolio, ...toAdd])];
    savePortfolio(updated);
    setToAdd([]);
    setShowAddModal(false);
  };

  const myCrops = CROPS.filter(c => portfolio.includes(c.id));
  const filtered = myCrops.filter(c => {
    const query = search.toLowerCase();
    const matchesSearch = [cropName(c, language), c.name].some(n => n.toLowerCase().includes(query));
    return matchesSearch &&
      (category === "All" || c.category === category) &&
      (season === "All" || c.season.includes(season));
  });

  const addableFiltered = CROPS.filter(c =>
    !portfolio.includes(c.id) &&
    (c.name.toLowerCase().includes(addSearch.toLowerCase()) || c.nameTA.includes(addSearch) || c.nameTE.includes(addSearch) || cropName(c, language).toLowerCase().includes(addSearch.toLowerCase()))
  );

  const getName = (c: typeof CROPS[0]) => cropName(c, language);
  // Crop descriptions only exist in English/Tamil/Telugu; other languages get a short localized summary
  const getDesc = (c: typeof CROPS[0]) =>
    language === "en" || language === "ta" || language === "te"
      ? `${getCropDesc(c, language).slice(0, 55)}...`
      : `${categoryName(c.category, language)} · ${seasonName(c.season, language)}`;

  const L = {
    title: tr(language, { en: "My Crops", ta: "என் பயிர்கள்", te: "నా పంటలు", kn: "ನನ್ನ ಬೆಳೆಗಳು", ml: "എന്റെ വിളകൾ", hi: "मेरी फसलें" }),
    sub: tr(language, { en: "Manage your tracked crops portfolio", ta: "உங்கள் கண்காணிக்கப்படும் பயிர்கள்", te: "మీ ట్రాక్ చేయబడిన పంటలు", kn: "ನೀವು ಗಮನಿಸುತ್ತಿರುವ ಬೆಳೆಗಳು", ml: "നിങ്ങൾ ശ്രദ്ധിക്കുന്ന വിളകൾ", hi: "आपकी ट्रैक की गई फसलें" }),
    addCrop: tr(language, { en: "+ Add Crop", ta: "+ பயிர் சேர்க்க", te: "+ పంటను జోడించు", kn: "+ ಬೆಳೆ ಸೇರಿಸಿ", ml: "+ വിള ചേർക്കുക", hi: "+ फसल जोड़ें" }),
    remove: tr(language, { en: "Remove", ta: "நீக்கு", te: "తొలగించు", kn: "ತೆಗೆದುಹಾಕಿ", ml: "നീക്കം ചെയ്യുക", hi: "हटाएं" }),
    search: tr(language, { en: "Search crops...", ta: "பயிர் தேடு...", te: "పంట కోసం వెతకండి...", kn: "ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...", ml: "വിളകൾ തിരയുക...", hi: "फसलें खोजें..." }),
    viewForecast: tr(language, { en: "View Forecast", ta: "கணிப்பு பார்க்க", te: "అంచనా చూడండి", kn: "ಮುನ್ಸೂಚನೆ ನೋಡಿ", ml: "പ്രവചനം കാണുക", hi: "पूर्वानुमान देखें" }),
    empty: tr(language, { en: "No crops yet! Click + Add Crop to get started", ta: "பயிர்கள் இல்லை! + பயிர் சேர்க்க கிளிக் செய்யுங்கள்", te: "పంటలు లేవు! పంటను జోడించడానికి + బటన్‌ను నొక్కండి", kn: "ಇನ್ನೂ ಬೆಳೆಗಳಿಲ್ಲ! ಆರಂಭಿಸಲು + ಬೆಳೆ ಸೇರಿಸಿ ಒತ್ತಿ", ml: "ഇതുവരെ വിളകളില്ല! തുടങ്ങാൻ + വിള ചേർക്കുക അമർത്തുക", hi: "अभी कोई फसल नहीं! शुरू करने के लिए + फसल जोड़ें दबाएं" }),
    exportPdf: tr(language, { en: "Export PDF Report", ta: "PDF அறிக்கை", te: "PDF నివేదిక", kn: "PDF ವರದಿ", ml: "PDF റിപ്പോർട്ട്", hi: "PDF रिपोर्ट" }),
    showing: tr(language, {
      en: `Showing ${filtered.length} of ${myCrops.length} crops`,
      ta: `${myCrops.length} பயிர்களில் ${filtered.length} காட்டப்படுகிறது`,
      te: `${myCrops.length} పంటల్లో ${filtered.length} చూపిస్తున్నాం`,
      kn: `${myCrops.length} ಬೆಳೆಗಳಲ್ಲಿ ${filtered.length} ತೋರಿಸಲಾಗುತ್ತಿದೆ`,
      ml: `${myCrops.length} വിളകളിൽ ${filtered.length} എണ്ണം കാണിക്കുന്നു`,
      hi: `${myCrops.length} में से ${filtered.length} फसलें दिख रही हैं`,
    }),
    aboveMsp: tr(language, { en: "Above MSP", ta: "MSP-க்கு மேல்", te: "MSP కంటే ఎక్కువ", kn: "MSP ಗಿಂತ ಹೆಚ್ಚು", ml: "MSP-ക്ക് മുകളിൽ", hi: "MSP से ऊपर" }),
    belowMsp: tr(language, { en: "Below MSP", ta: "MSP-க்கு கீழ்", te: "MSP కంటే తక్కువ", kn: "MSP ಗಿಂತ ಕಡಿಮೆ", ml: "MSP-യിൽ താഴെ", hi: "MSP से कम" }),
    alertsTitle: tr(language, { en: "Smart Mandi Price Threshold Alerts", ta: "மண்டி விலை எச்சரிக்கைகள்", te: "మండి ధర హెచ్చరికలు", kn: "ಮಂಡಿ ಬೆಲೆ ಎಚ್ಚರಿಕೆಗಳು", ml: "മണ്ടി വില അറിയിപ്പുകൾ", hi: "मंडी भाव अलर्ट" }),
    pushEnabled: tr(language, { en: "Web Push Enabled", ta: "அறிவிப்புகள் இயக்கத்தில்", te: "నోటిఫికేషన్లు ఆన్", kn: "ಅಧಿಸೂಚನೆ ಆನ್", ml: "അറിയിപ്പുകൾ ഓൺ", hi: "सूचनाएं चालू" }),
    alertsSub: tr(language, {
      en: "Set custom price triggers (e.g. \"Nellore Paddy > ₹2,400/qtl\"). Receive instant alerts on your lockscreen when rates fluctuate.",
      ta: "உங்கள் இலக்கு விலையை அமைக்கவும் (எ.கா. \"Nellore நெல் > ₹2,400/qtl\"). விலை மாறும்போது உடனே அறிவிப்பு கிடைக்கும்.",
      te: "మీ లక్ష్య ధరను సెట్ చేయండి (ఉదా. \"Nellore వరి > ₹2,400/qtl\"). ధరలు మారినప్పుడు వెంటనే హెచ్చరిక వస్తుంది.",
      kn: "ನಿಮ್ಮ ಗುರಿ ಬೆಲೆಯನ್ನು ಹೊಂದಿಸಿ (ಉದಾ. \"Nellore ಭತ್ತ > ₹2,400/qtl\"). ಬೆಲೆ ಬದಲಾದಾಗ ತಕ್ಷಣ ಎಚ್ಚರಿಕೆ ಸಿಗುತ್ತದೆ.",
      ml: "നിങ്ങളുടെ ലക്ഷ്യ വില സജ്ജമാക്കുക (ഉദാ. \"Nellore നെല്ല് > ₹2,400/qtl\"). വില മാറുമ്പോൾ ഉടൻ അറിയിപ്പ് ലഭിക്കും.",
      hi: "अपना लक्ष्य दाम तय करें (जैसे \"Nellore धान > ₹2,400/qtl\")। दाम बदलते ही तुरंत अलर्ट मिलेगा।",
    }),
    setNewAlert: tr(language, { en: "Set New Target Alert", ta: "புதிய விலை எச்சரிக்கை", te: "కొత్త ధర హెచ్చరిక", kn: "ಹೊಸ ಬೆಲೆ ಎಚ್ಚರಿಕೆ", ml: "പുതിയ വില അറിയിപ്പ്", hi: "नया भाव अलर्ट" }),
    noAlerts: tr(language, { en: "No Target Price Alerts Set Yet", ta: "இன்னும் விலை எச்சரிக்கைகள் இல்லை", te: "ఇంకా ధర హెచ్చరికలు లేవు", kn: "ಇನ್ನೂ ಬೆಲೆ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ", ml: "ഇതുവരെ വില അറിയിപ്പുകളില്ല", hi: "अभी कोई भाव अलर्ट नहीं" }),
    noAlertsSub: tr(language, {
      en: "Stay ahead of market fluctuations! Set threshold triggers to get notified the second mandi prices reach your selling goals.",
      ta: "சந்தை மாற்றங்களுக்கு முன்னால் இருங்கள்! மண்டி விலை உங்கள் இலக்கை அடைந்தவுடன் அறிவிப்பு பெற எச்சரிக்கை அமைக்கவும்.",
      te: "మార్కెట్ మార్పులకు ముందే సిద్ధంగా ఉండండి! మండి ధర మీ లక్ష్యానికి చేరగానే తెలియజేయడానికి హెచ్చరిక సెట్ చేయండి.",
      kn: "ಮಾರುಕಟ್ಟೆ ಏರಿಳಿತಕ್ಕೆ ಸಿದ್ಧರಾಗಿರಿ! ಮಂಡಿ ಬೆಲೆ ನಿಮ್ಮ ಗುರಿ ತಲುಪಿದ ತಕ್ಷಣ ತಿಳಿಯಲು ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ.",
      ml: "വിപണിയിലെ മാറ്റങ്ങൾക്ക് മുന്നേ നിൽക്കൂ! മണ്ടി വില നിങ്ങളുടെ ലക്ഷ്യത്തിലെത്തുമ്പോൾ അറിയാൻ അറിയിപ്പ് സജ്ജമാക്കുക.",
      hi: "बाज़ार के उतार-चढ़ाव से आगे रहें! मंडी भाव आपके लक्ष्य पर पहुंचते ही सूचना पाने के लिए अलर्ट लगाएं।",
    }),
    firstAlert: tr(language, { en: "+ Set Your First Price Alert", ta: "+ முதல் விலை எச்சரிக்கையை அமைக்கவும்", te: "+ మీ మొదటి ధర హెచ్చరికను సెట్ చేయండి", kn: "+ ಮೊದಲ ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ", ml: "+ ആദ്യ വില അറിയിപ്പ് സജ്ജമാക്കുക", hi: "+ पहला भाव अलर्ट लगाएं" }),
    inactive: tr(language, { en: "Inactive", ta: "நிறுத்தப்பட்டது", te: "నిలిపివేయబడింది", kn: "ನಿಷ್ಕ್ರಿಯ", ml: "നിർത്തിവച്ചു", hi: "बंद" }),
    reached: tr(language, { en: "🎯 Target Reached!", ta: "🎯 இலக்கை அடைந்தது!", te: "🎯 లక్ష్యం చేరింది!", kn: "🎯 ಗುರಿ ತಲುಪಿದೆ!", ml: "🎯 ലക്ഷ്യത്തിലെത്തി!", hi: "🎯 लक्ष्य पूरा!" }),
    tracking: tr(language, { en: "🟢 Active Tracking", ta: "🟢 கண்காணிப்பில்", te: "🟢 గమనిస్తున్నాం", kn: "🟢 ಗಮನಿಸಲಾಗುತ್ತಿದೆ", ml: "🟢 നിരീക്ഷിക്കുന്നു", hi: "🟢 नज़र रखी जा रही है" }),
    trigger: tr(language, { en: "Trigger Condition", ta: "எச்சரிக்கை நிபந்தனை", te: "హెచ్చరిక షరతు", kn: "ಎಚ್ಚರಿಕೆ ಷರತ್ತು", ml: "അറിയിപ്പ് വ്യവസ്ഥ", hi: "अलर्ट की शर्त" }),
    risesAbove: tr(language, { en: "📈 Rises Above (≥)", ta: "📈 மேல் உயர்ந்தால் (≥)", te: "📈 పైకి పెరిగితే (≥)", kn: "📈 ಮೇಲೆ ಏರಿದರೆ (≥)", ml: "📈 മുകളിൽ ഉയർന്നാൽ (≥)", hi: "📈 ऊपर जाए (≥)" }),
    fallsBelow: tr(language, { en: "📉 Falls Below (≤)", ta: "📉 கீழே குறைந்தால் (≤)", te: "📉 కిందకు తగ్గితే (≤)", kn: "📉 ಕೆಳಗೆ ಇಳಿದರೆ (≤)", ml: "📉 താഴെ കുറഞ്ഞാൽ (≤)", hi: "📉 नीचे आए (≤)" }),
    currentRate: tr(language, { en: "Current Live Market Rate:", ta: "தற்போதைய சந்தை விலை:", te: "ప్రస్తుత మార్కెట్ ధర:", kn: "ಈಗಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ:", ml: "ഇപ്പോഴത്തെ വിപണി വില:", hi: "मौजूदा बाज़ार भाव:" }),
    pause: tr(language, { en: "⏸️ Pause", ta: "⏸️ நிறுத்து", te: "⏸️ ఆపు", kn: "⏸️ ನಿಲ್ಲಿಸಿ", ml: "⏸️ നിർത്തുക", hi: "⏸️ रोकें" }),
    resume: tr(language, { en: "▶️ Resume", ta: "▶️ தொடர்", te: "▶️ కొనసాగించు", kn: "▶️ ಮುಂದುವರಿಸಿ", ml: "▶️ തുടരുക", hi: "▶️ फिर शुरू करें" }),
    testPush: tr(language, { en: "📲 Test Push", ta: "📲 சோதனை அறிவிப்பு", te: "📲 టెస్ట్ నోటిఫికేషన్", kn: "📲 ಪರೀಕ್ಷಾ ಅಧಿಸೂಚನೆ", ml: "📲 ടെസ്റ്റ് അറിയിപ്പ്", hi: "📲 टेस्ट सूचना" }),
    testPushTitle: tr(language, { en: "Simulate push notification test", ta: "சோதனை அறிவிப்பை அனுப்பு", te: "టెస్ట్ నోటిఫికేషన్ పంపండి", kn: "ಪರೀಕ್ಷಾ ಅಧಿಸೂಚನೆ ಕಳುಹಿಸಿ", ml: "ടെസ്റ്റ് അറിയിപ്പ് അയയ്ക്കുക", hi: "टेस्ट सूचना भेजें" }),
    deleteAlert: tr(language, { en: "Delete alert", ta: "எச்சரிக்கையை நீக்கு", te: "హెచ్చరికను తొలగించు", kn: "ಎಚ್ಚರಿಕೆ ಅಳಿಸಿ", ml: "അറിയിപ്പ് ഇല്ലാതാക്കുക", hi: "अलर्ट हटाएं" }),
    addTitle: tr(language, { en: "Add Crops to Portfolio", ta: "பயிர்களைச் சேர்க்கவும்", te: "పంటలను జోడించండి", kn: "ಬೆಳೆಗಳನ್ನು ಸೇರಿಸಿ", ml: "വിളകൾ ചേർക്കുക", hi: "फसलें जोड़ें" }),
    noCropsFound: tr(language, { en: "No crops found", ta: "பயிர்கள் கிடைக்கவில்லை", te: "పంటలు కనుగొనబడలేదు", kn: "ಬೆಳೆಗಳು ಸಿಗಲಿಲ್ಲ", ml: "വിളകളൊന്നും കണ്ടെത്തിയില്ല", hi: "कोई फसल नहीं मिली" }),
    addButton: toAdd.length > 0
      ? tr(language, {
          en: `Add ${toAdd.length} Crop${toAdd.length > 1 ? "s" : ""} →`,
          ta: `${toAdd.length} பயிர்களைச் சேர் →`,
          te: `${toAdd.length} పంటలను జోడించు →`,
          kn: `${toAdd.length} ಬೆಳೆಗಳನ್ನು ಸೇರಿಸಿ →`,
          ml: `${toAdd.length} വിളകൾ ചേർക്കുക →`,
          hi: `${toAdd.length} फसलें जोड़ें →`,
        })
      : tr(language, { en: "Add Crops →", ta: "பயிர்களைச் சேர் →", te: "పంటలను జోడించు →", kn: "ಬೆಳೆಗಳನ್ನು ಸೇರಿಸಿ →", ml: "വിളകൾ ചേർക്കുക →", hi: "फसलें जोड़ें →" }),
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700 }}>{L.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{L.sub}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            📄 {L.exportPdf}
          </button>
          <button id="btn-add-crop" className="btn btn-primary" onClick={() => setShowAddModal(true)}>{L.addCrop}</button>
        </div>
      </div>

      <div className="page-content">
        {/* Portfolio Performance Graph */}
        <PortfolioPerformanceGraph portfolioIds={portfolio} />
        {/* Search & Filters */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
              <span className="input-group-icon">🔍</span>
              <input id="search-crops" className="input" placeholder={L.search} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} id={`filter-cat-${cat.toLowerCase()}`}
                  className={`filter-chip ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}>
                  {categoryName(cat, language)}
                </button>
              ))}
            </div>
            <select id="select-season" className="input" style={{ width: 140 }} value={season} onChange={e => setSeason(e.target.value)}>
              {SEASONS.map(s => <option key={s} value={s}>{seasonName(s, language)}</option>)}
            </select>
          </div>
        </div>

        {/* Crop count */}
        <div style={{ marginBottom: 14, fontSize: 13, color: "var(--text-muted)" }}>
          {L.showing}
        </div>

        {/* Crop grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{L.empty}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map(crop => {
              const livePrice = prices[crop.id] || crop.basePrice;
              const changePercent = ((livePrice - crop.basePrice) / crop.basePrice) * 100;
              const isUp = changePercent >= 0;
              return (
                <div key={crop.id} className="crop-card">
                  {/* Image */}
                  <div style={{ position: "relative", height: 170, background: `${crop.color}20`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {failedImages[crop.id] ? (
                      <span style={{ fontSize: 64 }}>{crop.emoji}</span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- relies on onError to fall back to the crop emoji
                      <img src={crop.image} alt={crop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={() => setFailedImages(prev => ({ ...prev, [crop.id]: true }))} />
                    )}
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: crop.category === "Vegetables" ? "#e05252" : "var(--primary)" }}>
                      {categoryName(crop.category, language)}
                    </div>
                    {crop.season && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.5)", borderRadius: 99, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "#fff" }}>
                        {seasonName(crop.season, language)}
                      </div>
                    )}
                  </div>

                  <div className="crop-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{getName(crop)}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{getDesc(crop)}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary-dark)" }}>{formatPrice(livePrice)}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>/{unitName(crop.unit, language)}{crop.unit === "quintal" ? ` (${formatPrice(livePrice / 100)}/kg)` : ""}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isUp ? "#15803D" : "#B91C1C" }}>
                          {isUp ? "▲" : "▼"} {Math.abs(changePercent).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {crop.msp > 0 && (
                      <div style={{ marginTop: 10, padding: "6px 10px", background: livePrice >= crop.msp ? "#F0FDF4" : "#FFF1F2", borderRadius: 8, fontSize: 12, fontWeight: 600, color: livePrice >= crop.msp ? "#15803D" : "#B91C1C" }}>
                        MSP: {formatPrice(crop.msp)} {livePrice >= crop.msp ? `✓ ${L.aboveMsp}` : `⚠️ ${L.belowMsp}`}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button id={`btn-forecast-${crop.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => router.push(`/crop/${crop.id}`)}>
                        {L.viewForecast} ↗
                      </button>
                      <button id={`btn-remove-${crop.id}`} className="btn btn-danger btn-sm" onClick={() => remove(crop.id)}>
                        {L.remove}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Smart Mandi Price Threshold Alerts ── */}
      <div style={{ marginTop: 36, marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🔔</span>
              <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
                {L.alertsTitle}
              </h2>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(16, 185, 129, 0.15)",
                color: "#047857",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "2px 8px",
                borderRadius: 12
              }}>
                {L.pushEnabled}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              {L.alertsSub}
            </p>
          </div>

          <button
            onClick={() => setShowAlertModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 10, padding: "8px 16px", fontWeight: 700 }}
          >
            <span>+</span>
            <span>{L.setNewAlert}</span>
          </button>
        </div>

        {/* Alerts Grid */}
        {alerts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{L.noAlerts}</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 450, margin: "6px auto 16px auto" }}>
              {L.noAlertsSub}
            </p>
            <button onClick={() => setShowAlertModal(true)} className="btn btn-primary btn-sm">
              {L.firstAlert}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {alerts.map(alert => {
              const crop = CROPS.find(c => c.id === alert.cropId);
              const currentLivePrice = prices[alert.cropId] || alert.lastCheckedPrice || crop?.basePrice || 0;
              const isMet = alert.condition === "above" ? currentLivePrice >= alert.targetPrice : currentLivePrice <= alert.targetPrice;

              return (
                <div
                  key={alert.id}
                  className="card"
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    border: alert.active
                      ? isMet
                        ? "1.5px solid #10B981"
                        : "1px solid var(--border)"
                      : "1px dashed var(--border)",
                    opacity: alert.active ? 1 : 0.65,
                    background: isMet && alert.active ? "rgba(16, 185, 129, 0.04)" : "var(--bg-card)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    {/* Top Row: Crop info + Status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{crop?.emoji || "🌾"}</span>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{cropName({ id: alert.cropId, name: alert.cropName }, language)}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>📍 {alert.mandiName}</div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: !alert.active ? "var(--bg)" : isMet ? "#DCFCE7" : "rgba(245, 158, 11, 0.15)",
                        color: !alert.active ? "var(--text-muted)" : isMet ? "#15803D" : "#B45309",
                        border: "1px solid var(--border)"
                      }}>
                        {!alert.active ? L.inactive : isMet ? L.reached : L.tracking}
                      </span>
                    </div>

                    {/* Condition Box */}
                    <div style={{
                      background: "var(--bg)",
                      borderLeft: `4px solid ${alert.condition === "above" ? "#15803D" : "#B91C1C"}`,
                      padding: "8px 12px",
                      borderRadius: "0 10px 10px 0",
                      marginBottom: 12
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                        {L.trigger}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
                        {alert.condition === "above" ? L.risesAbove : L.fallsBelow} {formatPrice(alert.targetPrice)} {alert.unit}
                      </div>
                    </div>

                    {/* Live Comparison */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 14 }}>
                      <span style={{ color: "var(--text-muted)" }}>{L.currentRate}</span>
                      <span style={{ fontWeight: 800, color: "var(--primary-dark)", fontSize: 14 }}>
                        {formatPrice(currentLivePrice)} {alert.unit}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          togglePriceAlert(alert.id);
                          setAlerts(getPriceAlerts());
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        {alert.active ? L.pause : L.resume}
                      </button>

                      <button
                        onClick={() => {
                          const name = cropName({ id: alert.cropId, name: alert.cropName }, language);
                          const sign = alert.condition === "above" ? ">" : "<";
                          const now = formatPrice(currentLivePrice);
                          const target = formatPrice(alert.targetPrice);
                          const testTitle = tr(language, {
                            en: `🚨 Mandi Target Hit: ${name}!`,
                            ta: `🚨 மண்டி இலக்கு எட்டியது: ${name}!`,
                            te: `🚨 మండి లక్ష్యం చేరింది: ${name}!`,
                            kn: `🚨 ಮಂಡಿ ಗುರಿ ತಲುಪಿದೆ: ${name}!`,
                            ml: `🚨 മണ്ടി ലക്ഷ്യം എത്തി: ${name}!`,
                            hi: `🚨 मंडी लक्ष्य पूरा: ${name}!`,
                          });
                          const testBody = tr(language, {
                            en: `${alert.mandiName} reached ${now}/qtl (Target was ${sign} ${target})`,
                            ta: `${alert.mandiName} விலை ${now}/qtl ஆனது (இலக்கு ${sign} ${target})`,
                            te: `${alert.mandiName} ధర ${now}/qtl కి చేరింది (లక్ష్యం ${sign} ${target})`,
                            kn: `${alert.mandiName} ಬೆಲೆ ${now}/qtl ತಲುಪಿದೆ (ಗುರಿ ${sign} ${target})`,
                            ml: `${alert.mandiName} വില ${now}/qtl എത്തി (ലക്ഷ്യം ${sign} ${target})`,
                            hi: `${alert.mandiName} का भाव ${now}/qtl पहुंचा (लक्ष्य ${sign} ${target})`,
                          });
                          addNotification({ title: testTitle, message: testBody, type: "price" });
                          dispatchPriceNotification(testTitle, testBody);
                        }}
                        title={L.testPushTitle}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        {L.testPush}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        deletePriceAlert(alert.id);
                        setAlerts(getPriceAlerts());
                      }}
                      title={L.deleteAlert}
                      style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 15, padding: "4px" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PriceAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onAlertCreated={() => setAlerts(getPriceAlerts())}
      />

      {/* Add Crop Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "Playfair Display,serif", fontSize: 18, fontWeight: 700 }}>{L.addTitle}</div>
              <button onClick={() => { setShowAddModal(false); setToAdd([]); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <input className="input" placeholder={L.search} value={addSearch} onChange={e => setAddSearch(e.target.value)} style={{ marginBottom: 14 }} />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {addableFiltered.map(crop => (
                <div key={crop.id}
                  id={`add-${crop.id}`}
                  onClick={() => setToAdd(prev => prev.includes(crop.id) ? prev.filter(x => x !== crop.id) : [...prev, crop.id])}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, cursor: "pointer", background: toAdd.includes(crop.id) ? "var(--accent)" : "transparent", border: `1.5px solid ${toAdd.includes(crop.id) ? "var(--primary)" : "transparent"}`, marginBottom: 6, transition: "all 0.15s" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: `${crop.color}30`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- relies on onError to hide a broken remote image and reveal the emoji fallback */}
                    <img src={crop.image} alt={crop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    {crop.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{getName(crop)}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{categoryName(crop.category, language)} · {seasonName(crop.season, language)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{formatPrice(crop.basePrice)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>/{unitName(crop.unit, language)}{crop.unit === "quintal" ? ` (${formatPrice(crop.basePrice / 100)}/kg)` : ""}</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${toAdd.includes(crop.id) ? "var(--primary)" : "var(--border)"}`, background: toAdd.includes(crop.id) ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, flexShrink: 0 }}>
                    {toAdd.includes(crop.id) ? "✓" : ""}
                  </div>
                </div>
              ))}
              {addableFiltered.length === 0 && <div className="empty-state"><div className="empty-state-icon">🔍</div><div>{L.noCropsFound}</div></div>}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 }}>
              <button id="btn-confirm-add" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
                disabled={toAdd.length === 0} onClick={addSelected}>
                {L.addButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
