"use client";

import { useState } from "react";
import { CROPS, getCropVolatilityList, formatPrice } from "@/lib/cropData";
import { useApp } from "@/lib/AppContext";
import { tr, cropName, categoryName } from "@/lib/i18n";

export default function MarketHeatmap() {
  const { language } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const volatilityList = getCropVolatilityList();

  const categories = ["All", ...Array.from(new Set(CROPS.map(c => c.category)))];

  const filteredCrops = volatilityList.filter(c =>
    activeCategory === "All" || c.category === activeCategory
  );

  const getHeatmapColor = (change: number) => {
    if (change >= 5) return { bg: "linear-gradient(135deg, #15803D, #166534)", text: "#fff", badge: tr(language, { en: "Peak Gainer", ta: "உச்ச உயர்வு", te: "అత్యధిక పెరుగుదల", kn: "ಅತಿ ಹೆಚ್ಚು ಏರಿಕೆ", ml: "ഏറ്റവും കൂടിയ ഉയർച്ച", hi: "सबसे ज़्यादा बढ़त" }) + " 🚀" };
    if (change > 0) return { bg: "linear-gradient(135deg, #4CAF50, #2E7D32)", text: "#fff", badge: tr(language, { en: "Gaining", ta: "உயர்கிறது", te: "పెరుగుతోంది", kn: "ಏರುತ್ತಿದೆ", ml: "ഉയരുന്നു", hi: "बढ़ रहा है" }) + " 📈" };
    if (change === 0) return { bg: "var(--accent)", text: "var(--text)", badge: tr(language, { en: "Stable", ta: "நிலையானது", te: "స్థిరంగా ఉంది", kn: "ಸ್ಥಿರ", ml: "സ്ഥിരം", hi: "स्थिर" }) + " ⚖️" };
    if (change > -5) return { bg: "linear-gradient(135deg, #F87171, #DC2626)", text: "#fff", badge: tr(language, { en: "Dropping", ta: "குறைகிறது", te: "తగ్గుతోంది", kn: "ಇಳಿಯುತ್ತಿದೆ", ml: "കുറയുന്നു", hi: "गिर रहा है" }) + " 📉" };
    return { bg: "linear-gradient(135deg, #B91C1C, #991B1B)", text: "#fff", badge: tr(language, { en: "Sharp Drop", ta: "கடும் சரிவு", te: "భారీ పతనం", kn: "ತೀವ್ರ ಕುಸಿತ", ml: "കുത്തനെ ഇടിവ്", hi: "भारी गिरावट" }) + " ⚠️" };
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>🗺️</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              {tr(language, { en: "Market Price Trend Heatmap", ta: "சந்தை விலை போக்கு வரைபடம்", te: "మార్కెట్ ధరల ధోరణి హీట్‌మ్యాప్", kn: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಪ್ರವೃತ್ತಿ ಹೀಟ್‌ಮ್ಯಾಪ್", ml: "വിപണി വില പ്രവണത ഹീറ്റ്‌മാപ്പ്", hi: "बाज़ार भाव रुझान हीटमैप" })}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {tr(language, {
              en: "Color-coded weekly price movement matrix across national wholesale markets",
              ta: "நாடு முழுவதும் உள்ள மொத்த சந்தைகளில் வாராந்திர விலை மாற்றம் — நிறங்களில்",
              te: "దేశవ్యాప్త హోల్‌సేల్ మార్కెట్లలో వారపు ధరల మార్పు — రంగుల్లో",
              kn: "ದೇಶದ ಸಗಟು ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ವಾರದ ಬೆಲೆ ಬದಲಾವಣೆ — ಬಣ್ಣಗಳಲ್ಲಿ",
              ml: "രാജ്യത്തെ മൊത്തവിപണികളിലെ ആഴ്ചതോറുമുള്ള വില മാറ്റം — നിറങ്ങളിൽ",
              hi: "देश भर की थोक मंडियों में साप्ताहिक भाव बदलाव — रंगों में",
            })}
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                fontSize: 12.5,
                border: "1.5px solid var(--border)",
                background: activeCategory === cat ? "var(--primary)" : "var(--bg-card)",
                color: activeCategory === cat ? "#fff" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {categoryName(cat, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
        background: "var(--accent)",
        padding: "10px 16px",
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 12,
        fontWeight: 600
      }}>
        <span style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>{tr(language, { en: "Heat Legend:", ta: "நிற விளக்கம்:", te: "రంగుల సూచిక:", kn: "ಬಣ್ಣದ ಸೂಚಿ:", ml: "നിറ സൂചിക:", hi: "रंग संकेत:" })}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#15803D" }} />
          <span>+5%+ {tr(language, { en: "High Gain", ta: "அதிக உயர்வு", te: "ఎక్కువ పెరుగుదల", kn: "ಹೆಚ್ಚು ಏರಿಕೆ", ml: "കൂടിയ ഉയർച്ച", hi: "ज़्यादा बढ़त" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#4CAF50" }} />
          <span>{tr(language, { en: "+1% to +5% Gain", ta: "+1% முதல் +5% உயர்வு", te: "+1% నుండి +5% పెరుగుదల", kn: "+1% ರಿಂದ +5% ಏರಿಕೆ", ml: "+1% മുതൽ +5% വരെ ഉയർച്ച", hi: "+1% से +5% बढ़त" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--border)" }} />
          <span>{tr(language, { en: "Stable", ta: "நிலையானது", te: "స్థిరంగా ఉంది", kn: "ಸ್ಥಿರ", ml: "സ്ഥിരം", hi: "स्थिर" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#B91C1C" }} />
          <span>-5%+ {tr(language, { en: "Sharp Drop", ta: "கடும் சரிவு", te: "భారీ పతనం", kn: "ತೀವ್ರ ಕುಸಿತ", ml: "കുത്തനെ ഇടിവ്", hi: "भारी गिरावट" })}</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {filteredCrops.map(item => {
          const style = getHeatmapColor(item.weeklyChangePercent);
          return (
            <div
              key={item.cropId}
              style={{
                background: style.bg,
                color: style.text,
                borderRadius: 16,
                padding: 16,
                boxShadow: "var(--shadow-card)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 125,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 24 }}>{item.cropEmoji}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.25)",
                    backdropFilter: "blur(4px)"
                  }}>
                    {style.badge}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>
                  {cropName({ id: item.cropId, name: item.cropName }, language)}
                </div>
                <div style={{ fontSize: 11.5, opacity: 0.85 }}>
                  {categoryName(item.category, language)}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 900 }}>
                  {formatPrice(item.currentPrice)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>
                  {item.weeklyChangePercent > 0 ? `+${item.weeklyChangePercent}%` : `${item.weeklyChangePercent}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
