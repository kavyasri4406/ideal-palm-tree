"use client";

import { useState } from "react";
import { getCropVolatilityList, formatPrice } from "@/lib/cropData";
import { useApp } from "@/lib/AppContext";
import { tr, cropName, categoryName } from "@/lib/i18n";

// Localized versions of the fixed advisory messages from getCropVolatilityList()
const ADVISORY: Record<string, { ta: string; te: string; kn: string; ml: string; hi: string }> = {
  "Stable market. Normal trading recommended.": {
    ta: "சந்தை நிலையாக உள்ளது. வழக்கம் போல் விற்கலாம்.",
    te: "మార్కెట్ స్థిరంగా ఉంది. మామూలుగా అమ్మవచ్చు.",
    kn: "ಮಾರುಕಟ್ಟೆ ಸ್ಥಿರವಾಗಿದೆ. ಎಂದಿನಂತೆ ಮಾರಾಟ ಮಾಡಬಹುದು.",
    ml: "വിപണി സ്ഥിരമാണ്. പതിവുപോലെ വിൽക്കാം.",
    hi: "बाज़ार स्थिर है। सामान्य रूप से बिक्री करें।",
  },
  "Sharp price drop detected! Hold stock or sell at highest-paying APMC Mandi.": {
    ta: "விலை கடுமையாக சரிந்துள்ளது! சரக்கை வைத்திருங்கள் அல்லது அதிக விலை தரும் APMC மண்டியில் விற்கவும்.",
    te: "ధర బాగా పడిపోయింది! సరుకు నిల్వ ఉంచండి లేదా ఎక్కువ ధర ఇచ్చే APMC మండీలో అమ్మండి.",
    kn: "ಬೆಲೆ ತೀವ್ರವಾಗಿ ಕುಸಿದಿದೆ! ದಾಸ್ತಾನು ಇಟ್ಟುಕೊಳ್ಳಿ ಅಥವಾ ಹೆಚ್ಚು ಬೆಲೆ ಕೊಡುವ APMC ಮಂಡಿಯಲ್ಲಿ ಮಾರಿ.",
    ml: "വില കുത്തനെ ഇടിഞ്ഞു! സ്റ്റോക്ക് സൂക്ഷിക്കുക അല്ലെങ്കിൽ കൂടുതൽ വില കിട്ടുന്ന APMC മണ്ടിയിൽ വിൽക്കുക.",
    hi: "भाव में भारी गिरावट! माल रोककर रखें या सबसे ज़्यादा भाव देने वाली APMC मंडी में बेचें।",
  },
  "High demand spike! Capitalize on peak prices now.": {
    ta: "தேவை திடீரென அதிகரித்துள்ளது! உச்ச விலையில் இப்போதே விற்கவும்.",
    te: "డిమాండ్ బాగా పెరిగింది! ఇప్పుడే అధిక ధరకు అమ్మండి.",
    kn: "ಬೇಡಿಕೆ ಹೆಚ್ಚಾಗಿದೆ! ಈಗಲೇ ಗರಿಷ್ಠ ಬೆಲೆಗೆ ಮಾರಿ.",
    ml: "ആവശ്യം കുത്തനെ കൂടി! ഇപ്പോൾ തന്നെ ഉയർന്ന വിലയ്ക്ക് വിൽക്കുക.",
    hi: "मांग अचानक बढ़ी है! अभी ऊंचे भाव पर बेचें।",
  },
};

export default function VolatilityAlerts() {
  const { language } = useApp();
  const [filterRisk, setFilterRisk] = useState<string>("All");
  const volatilityList = getCropVolatilityList();

  const highCount = volatilityList.filter(c => c.riskLevel === "High").length;
  const modCount = volatilityList.filter(c => c.riskLevel === "Moderate").length;
  const lowCount = volatilityList.filter(c => c.riskLevel === "Low").length;

  const filteredList = volatilityList.filter(c =>
    filterRisk === "All" || c.riskLevel === filterRisk
  );

  const highRiskLabel = tr(language, { en: "High Risk", ta: "அதிக அபாயம்", te: "అధిక ప్రమాదం", kn: "ಹೆಚ್ಚು ಅಪಾಯ", ml: "ഉയർന്ന അപകടസാധ്യത", hi: "ज़्यादा जोखिम" });
  const moderateLabel = tr(language, { en: "Moderate", ta: "மிதமானது", te: "మధ్యస్థం", kn: "ಮಧ್ಯಮ", ml: "മിതമായത്", hi: "मध्यम" });
  const stableLabel = tr(language, { en: "Stable", ta: "நிலையானது", te: "స్థిరంగా ఉంది", kn: "ಸ್ಥಿರ", ml: "സ്ഥിരം", hi: "स्थिर" });

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              {tr(language, { en: "Price Volatility & Risk Alerts Engine", ta: "விலை ஏற்ற இறக்கம் & அபாய எச்சரிக்கைகள்", te: "ధరల ఒడిదుడుకులు & ప్రమాద హెచ్చరికలు", kn: "ಬೆಲೆ ಏರಿಳಿತ & ಅಪಾಯ ಎಚ್ಚರಿಕೆಗಳು", ml: "വില ചാഞ്ചാട്ടവും അപകട മുന്നറിയിപ്പുകളും", hi: "भाव उतार-चढ़ाव और जोखिम चेतावनी" })}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {tr(language, {
              en: "Identifies crops experiencing rapid price fluctuations and provides mitigation strategies",
              ta: "விலை வேகமாக மாறும் பயிர்களைக் கண்டறிந்து, இழப்பைத் தவிர்க்கும் வழிகளைச் சொல்கிறது",
              te: "ధరలు వేగంగా మారుతున్న పంటలను గుర్తించి, నష్టం తగ్గించే మార్గాలు చెబుతుంది",
              kn: "ಬೆಲೆ ವೇಗವಾಗಿ ಬದಲಾಗುತ್ತಿರುವ ಬೆಳೆಗಳನ್ನು ಗುರುತಿಸಿ, ನಷ್ಟ ತಪ್ಪಿಸುವ ದಾರಿಗಳನ್ನು ಹೇಳುತ್ತದೆ",
              ml: "വില വേഗത്തിൽ മാറുന്ന വിളകളെ കണ്ടെത്തി നഷ്ടം കുറയ്ക്കാനുള്ള വഴികൾ പറയുന്നു",
              hi: "जिन फसलों के भाव तेज़ी से बदल रहे हैं उन्हें पहचानकर नुकसान से बचने के उपाय बताता है",
            })}
          </p>
        </div>

        {/* Filter Badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "All", label: `${categoryName("All", language)} (${volatilityList.length})` },
            { id: "High", label: `⚠️ ${highRiskLabel} (${highCount})` },
            { id: "Moderate", label: `⚖️ ${moderateLabel} (${modCount})` },
            { id: "Low", label: `🛡️ ${stableLabel} (${lowCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRisk(tab.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                fontSize: 12.5,
                border: "1.5px solid var(--border)",
                background: filterRisk === tab.id ? "var(--primary)" : "var(--bg-card)",
                color: filterRisk === tab.id ? "#fff" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volatility Overview Cards */}
      <div className="grid-cols-4-responsive" style={{ gap: 14, marginBottom: 22 }}>
        <div className="stat-card" style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.25)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#B91C1C", textTransform: "uppercase" }}>{tr(language, { en: "High Risk Crops", ta: "அதிக அபாய பயிர்கள்", te: "అధిక ప్రమాద పంటలు", kn: "ಹೆಚ್ಚು ಅಪಾಯದ ಬೆಳೆಗಳು", ml: "ഉയർന്ന അപകടസാധ്യതയുള്ള വിളകൾ", hi: "ज़्यादा जोखिम वाली फसलें" })}</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: "#B91C1C" }}>{highCount}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{tr(language, { en: "Rapid price swings", ta: "விலை வேகமாக மாறுகிறது", te: "ధరలు వేగంగా మారుతున్నాయి", kn: "ಬೆಲೆ ವೇಗವಾಗಿ ಬದಲಾಗುತ್ತಿದೆ", ml: "വില വേഗത്തിൽ മാറുന്നു", hi: "भाव तेज़ी से बदल रहे हैं" })}</div>
        </div>

        <div className="stat-card" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase" }}>{tr(language, { en: "Moderate Volatility", ta: "மிதமான ஏற்ற இறக்கம்", te: "మధ్యస్థ ఒడిదుడుకులు", kn: "ಮಧ್ಯಮ ಏರಿಳಿತ", ml: "മിതമായ ചാഞ്ചാട്ടം", hi: "मध्यम उतार-चढ़ाव" })}</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: "#92400E" }}>{modCount}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{tr(language, { en: "Normal weekly shift", ta: "சாதாரண வாராந்திர மாற்றம்", te: "సాధారణ వారపు మార్పు", kn: "ಸಾಮಾನ್ಯ ವಾರದ ಬದಲಾವಣೆ", ml: "സാധാരണ ആഴ്ചതോറുമുള്ള മാറ്റം", hi: "सामान्य साप्ताहिक बदलाव" })}</div>
        </div>

        <div className="stat-card" style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.25)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#15803D", textTransform: "uppercase" }}>{tr(language, { en: "Stable Commodities", ta: "நிலையான பொருட்கள்", te: "స్థిరమైన సరుకులు", kn: "ಸ್ಥಿರ ಸರಕುಗಳು", ml: "സ്ഥിരമായ ഉൽപ്പന്നങ്ങൾ", hi: "स्थिर उपज" })}</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: "#15803D" }}>{lowCount}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{tr(language, { en: "Low price risk", ta: "குறைந்த விலை அபாயம்", te: "తక్కువ ధర ప్రమాదం", kn: "ಕಡಿಮೆ ಬೆಲೆ ಅಪಾಯ", ml: "കുറഞ്ഞ വില അപകടസാധ്യത", hi: "भाव का कम जोखिम" })}</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>{tr(language, { en: "Avg Index", ta: "சராசரி குறியீடு", te: "సగటు సూచిక", kn: "ಸರಾಸರಿ ಸೂಚ್ಯಂಕ", ml: "ശരാശരി സൂചിക", hi: "औसत सूचकांक" })}</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: "var(--primary-dark)" }}>
            {Math.round(volatilityList.reduce((acc, c) => acc + c.volatilityScore, 0) / volatilityList.length)}%
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{tr(language, { en: "Market risk index", ta: "சந்தை அபாயக் குறியீடு", te: "మార్కెట్ ప్రమాద సూచిక", kn: "ಮಾರುಕಟ್ಟೆ ಅಪಾಯ ಸೂಚ್ಯಂಕ", ml: "വിപണി അപകട സൂചിക", hi: "बाज़ार जोखिम सूचकांक" })}</div>
        </div>
      </div>

      {/* Volatility Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{tr(language, { en: "Crop Name", ta: "பயிர் பெயர்", te: "పంట పేరు", kn: "ಬೆಳೆ ಹೆಸರು", ml: "വിളയുടെ പേര്", hi: "फसल का नाम" })}</th>
              <th>{tr(language, { en: "Category", ta: "வகை", te: "వర్గం", kn: "ವರ್ಗ", ml: "വിഭാഗം", hi: "श्रेणी" })}</th>
              <th>{tr(language, { en: "Live Price", ta: "இன்றைய விலை", te: "ప్రస్తుత ధర", kn: "ಇಂದಿನ ಬೆಲೆ", ml: "ഇന്നത്തെ വില", hi: "आज का भाव" })}</th>
              <th>{tr(language, { en: "Weekly Change", ta: "வார மாற்றம்", te: "వారపు మార్పు", kn: "ವಾರದ ಬದಲಾವಣೆ", ml: "ആഴ്ചയിലെ മാറ്റം", hi: "साप्ताहिक बदलाव" })}</th>
              <th>{tr(language, { en: "Volatility Meter", ta: "ஏற்ற இறக்க அளவு", te: "ఒడిదుడుకుల మీటర్", kn: "ಏರಿಳಿತ ಮೀಟರ್", ml: "ചാഞ്ചാട്ട മീറ്റർ", hi: "उतार-चढ़ाव मीटर" })}</th>
              <th>{tr(language, { en: "Risk Level", ta: "அபாய நிலை", te: "ప్రమాద స్థాయి", kn: "ಅಪಾಯದ ಮಟ್ಟ", ml: "അപകട നില", hi: "जोखिम स्तर" })}</th>
              <th>{tr(language, { en: "Actionable Advisory", ta: "என்ன செய்யலாம்", te: "ఏం చేయాలి", kn: "ಏನು ಮಾಡಬೇಕು", ml: "എന്ത് ചെയ്യണം", hi: "क्या करें" })}</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(crop => (
              <tr key={crop.cropId}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{crop.cropEmoji}</span>
                    <strong style={{ fontSize: 14, color: "var(--text)" }}>{cropName({ id: crop.cropId, name: crop.cropName }, language)}</strong>
                  </div>
                </td>
                <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{categoryName(crop.category, language)}</td>
                <td>
                  <strong style={{ fontSize: 14 }}>{formatPrice(crop.currentPrice)}</strong>
                </td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: crop.weeklyChangePercent > 0 ? "#15803D" : crop.weeklyChangePercent < 0 ? "#B91C1C" : "var(--text-muted)"
                  }}>
                    {crop.weeklyChangePercent > 0 ? `▲ +${crop.weeklyChangePercent}%` : crop.weeklyChangePercent < 0 ? `▼ ${crop.weeklyChangePercent}%` : "0%"}
                  </span>
                </td>
                <td style={{ width: 140 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${crop.volatilityScore}%`,
                          background: crop.riskLevel === "High" ? "#B91C1C" : crop.riskLevel === "Moderate" ? "#F59E0B" : "#15803D"
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{crop.volatilityScore}%</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${crop.riskLevel === "High" ? "badge-red" : crop.riskLevel === "Moderate" ? "badge-yellow" : "badge-green"}`}>
                    {crop.riskLevel === "High" ? `⚠️ ${highRiskLabel}` : crop.riskLevel === "Moderate" ? `⚖️ ${moderateLabel}` : `🛡️ ${stableLabel}`}
                  </span>
                </td>
                <td style={{ fontSize: 12.5, color: "var(--text-muted)", maxWidth: 280 }}>
                  {language === "en" ? crop.recommendedAction : (ADVISORY[crop.recommendedAction]?.[language] || crop.recommendedAction)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
