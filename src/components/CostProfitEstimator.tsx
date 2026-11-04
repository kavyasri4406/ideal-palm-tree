"use client";

import { useState } from "react";
import {
  CROPS,
  calculateCultivationCostAndProfit,
  formatPrice,
  hasCultivationCostData,
  getDefaultYieldPerAcre
} from "@/lib/cropData";
import { useApp } from "@/lib/AppContext";
import { tr, cropName } from "@/lib/i18n";

// Only crops with per-acre cost data (all priced per quintal) — avoids silently using
// rice costs or mixing per-dozen prices with quintal yields.
const COST_CROPS = CROPS.filter(c => hasCultivationCostData(c.id));

function parseClamped(raw: string, min: number, max: number = Number.POSITIVE_INFINITY): number {
  const v = parseFloat(raw);
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

export default function CostProfitEstimator() {
  const { language } = useApp();
  const acresWord = tr(language, { en: "Acres", ta: "ஏக்கர்", te: "ఎకరాలు", kn: "ಎಕರೆ", ml: "ഏക്കർ", hi: "एकड़" });
  const quintalsWord = tr(language, { en: "Quintals", ta: "குவிண்டால்", te: "క్వింటాళ్లు", kn: "ಕ್ವಿಂಟಾಲ್", ml: "ക്വിന്റൽ", hi: "क्विंटल" });
  const qntlWord = tr(language, { en: "qntl", ta: "குவி.", te: "క్విం.", kn: "ಕ್ವಿಂ.", ml: "ക്വി.", hi: "क्विं." });
  const [cropId, setCropId] = useState<string>("rice");
  // Raw text inputs so the user can clear a field and retype; values are clamped for calculation and on blur.
  const [acresInput, setAcresInput] = useState<string>("3");
  const [yieldInput, setYieldInput] = useState<string>(String(getDefaultYieldPerAcre("rice")));
  const [priceInput, setPriceInput] = useState<string>(String((COST_CROPS.find(c => c.id === "rice") || COST_CROPS[0]).basePrice));

  const acres = parseClamped(acresInput, 0.5, 50);
  const customYield = parseClamped(yieldInput, 1);
  const customPrice = parseClamped(priceInput, 100);

  const handleCropChange = (id: string) => {
    const c = COST_CROPS.find(cr => cr.id === id) || COST_CROPS[0];
    setCropId(c.id);
    setPriceInput(String(c.basePrice));
    setYieldInput(String(getDefaultYieldPerAcre(c.id)));
  };

  const res = calculateCultivationCostAndProfit(cropId, acres, customYield, customPrice);

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🧮</span>
          <div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              {tr(language, { en: "Cultivation Input Cost & Net Profit Estimator", ta: "சாகுபடி செலவு & நிகர லாபக் கணக்கீடு", te: "సాగు ఖర్చు & నికర లాభం అంచనా", kn: "ಸಾಗುವಳಿ ಖರ್ಚು & ನಿವ್ವಳ ಲಾಭ ಅಂದಾಜು", ml: "കൃഷിച്ചെലവും അറ്റാദായവും കണക്കാക്കൽ", hi: "खेती की लागत और शुद्ध मुनाफा अनुमान" })}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {tr(language, { en: "Calculate per-acre cost breakdown (seeds, fertilizer, labor) & net profit / ROI %", ta: "ஏக்கருக்கான செலவு விவரம் (விதை, உரம், கூலி) & நிகர லாபம் / முதலீட்டு வருமானம் (ROI) % கணக்கிடுங்கள்", te: "ఎకరానికి ఖర్చుల వివరాలు (విత్తనాలు, ఎరువులు, కూలీ) & నికర లాభం / పెట్టుబడిపై రాబడి (ROI) % లెక్కించండి", kn: "ಎಕರೆಗೆ ಖರ್ಚಿನ ವಿವರ (ಬೀಜ, ಗೊಬ್ಬರ, ಕೂಲಿ) & ನಿವ್ವಳ ಲಾಭ / ಹೂಡಿಕೆ ಮೇಲಿನ ಆದಾಯ (ROI) % ಲೆಕ್ಕ ಹಾಕಿ", ml: "ഏക്കറിനുള്ള ചെലവ് വിശദാംശം (വിത്ത്, വളം, കൂലി), അറ്റാദായം / നിക്ഷേപ വരുമാനം (ROI) % കണക്കാക്കുക", hi: "प्रति एकड़ खर्च का ब्योरा (बीज, खाद, मज़दूरी) और शुद्ध मुनाफा / निवेश पर रिटर्न (ROI) % निकालें" })}
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid-cols-4-responsive" style={{ gap: 14, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
            🌾 {tr(language, { en: "Select Crop", ta: "பயிரைத் தேர்ந்தெடுக்கவும்", te: "పంటను ఎంచుకోండి", kn: "ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", ml: "വിള തിരഞ്ഞെടുക്കുക", hi: "फसल चुनें" })}
          </label>
          <select
            value={cropId}
            onChange={e => handleCropChange(e.target.value)}
            className="input"
            style={{ fontWeight: 600, borderRadius: 10 }}
          >
            {COST_CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {cropName(c, language)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
            📐 {tr(language, { en: "Area (Acres)", ta: "பரப்பளவு (ஏக்கர்)", te: "విస్తీర్ణం (ఎకరాలు)", kn: "ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)", ml: "വിസ്തീർണ്ണം (ഏക്കർ)", hi: "रकबा (एकड़)" })}
          </label>
          <input
            type="number"
            min={0.5}
            max={50}
            step={0.5}
            value={acresInput}
            onChange={e => setAcresInput(e.target.value)}
            onBlur={() => setAcresInput(String(acres))}
            className="input"
            style={{ fontWeight: 700, borderRadius: 10 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
            📦 {tr(language, { en: "Yield / Acre (qntl)", ta: "ஏக்கருக்கு மகசூல் (குவிண்டால்)", te: "ఎకరానికి దిగుబడి (క్వింటాళ్లు)", kn: "ಎಕರೆಗೆ ಇಳುವರಿ (ಕ್ವಿಂಟಾಲ್)", ml: "ഏക്കറിന് വിളവ് (ക്വിന്റൽ)", hi: "प्रति एकड़ पैदावार (क्विंटल)" })}
          </label>
          <input
            type="number"
            min={1}
            value={yieldInput}
            onChange={e => setYieldInput(e.target.value)}
            onBlur={() => setYieldInput(String(customYield))}
            className="input"
            style={{ fontWeight: 700, borderRadius: 10 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
            💰 {tr(language, { en: "Market Price (₹/qntl)", ta: "சந்தை விலை (₹/குவிண்டால்)", te: "మార్కెట్ ధర (₹/క్వింటాల్)", kn: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ (₹/ಕ್ವಿಂಟಾಲ್)", ml: "വിപണി വില (₹/ക്വിന്റൽ)", hi: "बाज़ार भाव (₹/क्विंटल)" })}
          </label>
          <input
            type="number"
            min={100}
            value={priceInput}
            onChange={e => setPriceInput(e.target.value)}
            onBlur={() => setPriceInput(String(customPrice))}
            className="input"
            style={{ fontWeight: 700, borderRadius: 10 }}
          />
        </div>
      </div>

      {/* Net Profit & ROI Highlight Banner */}
      <div style={{
        background: res.isProfitable
          ? "linear-gradient(135deg, #15803D 0%, #3A5227 100%)"
          : "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)",
        color: "#fff",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 22,
        boxShadow: "var(--shadow)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {tr(language, { en: "Estimated Net Return", ta: "கணிக்கப்பட்ட நிகர வருமானம்", te: "అంచనా నికర రాబడి", kn: "ಅಂದಾಜು ನಿವ್ವಳ ಆದಾಯ", ml: "കണക്കാക്കിയ അറ്റാദായം", hi: "अनुमानित शुद्ध कमाई" })} ({acres} {acresWord})
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>
            {res.isProfitable ? `+${formatPrice(res.netProfit)}` : formatPrice(res.netProfit)}
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>
            {tr(language, { en: "Gross Revenue:", ta: "மொத்த வருவாய்:", te: "మొత్తం ఆదాయం:", kn: "ಒಟ್ಟು ಆದಾಯ:", ml: "ആകെ വരുമാനം:", hi: "कुल आमदनी:" })} {formatPrice(res.grossRevenue)} ({res.expectedYieldTotalQuintals} {tr(language, { en: "Total Quintals", ta: "மொத்த குவிண்டால்", te: "మొత్తం క్వింటాళ్లు", kn: "ಒಟ್ಟು ಕ್ವಿಂಟಾಲ್", ml: "ആകെ ക്വിന്റൽ", hi: "कुल क्विंटल" })})
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          padding: "12px 18px",
          borderRadius: 12,
          textAlign: "right"
        }}>
          <div style={{ fontSize: 11, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {tr(language, { en: "Return on Investment (ROI)", ta: "முதலீட்டு வருமானம் (ROI)", te: "పెట్టుబడిపై రాబడి (ROI)", kn: "ಹೂಡಿಕೆ ಮೇಲಿನ ಆದಾಯ (ROI)", ml: "നിക്ഷേപ വരുമാനം (ROI)", hi: "निवेश पर रिटर्न (ROI)" })}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: res.isProfitable ? "#FEF9C3" : "#FEE2E2" }}>
            {res.roiPercent}%
          </div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>
            {res.isProfitable
              ? `✓ ${tr(language, { en: "Highly Profitable Crop Cycle", ta: "அதிக லாபம் தரும் பயிர் சுழற்சி", te: "మంచి లాభం ఇచ్చే పంట కాలం", kn: "ಹೆಚ್ಚು ಲಾಭದಾಯಕ ಬೆಳೆ ಅವಧಿ", ml: "നല്ല ലാഭം തരുന്ന വിളക്കാലം", hi: "अच्छा मुनाफा देने वाली फसल" })}`
              : `⚠️ ${tr(language, { en: "High Input Cost Warning", ta: "அதிக செலவு எச்சரிக்கை", te: "అధిక ఖర్చు హెచ్చరిక", kn: "ಹೆಚ್ಚಿನ ಖರ್ಚಿನ ಎಚ್ಚರಿಕೆ", ml: "ഉയർന്ന ചെലവ് മുന്നറിയിപ്പ്", hi: "ज़्यादा लागत की चेतावनी" })}`}
          </div>
        </div>
      </div>

      {/* Cost Breakdown Table & Chart */}
      <div className="grid-cols-2-responsive" style={{ gap: 16 }}>
        {/* Cost Breakdown */}
        <div className="card-sm" style={{ background: "var(--bg)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 12 }}>
            📋 {tr(language, { en: "Cultivation Expense Breakdown", ta: "சாகுபடி செலவு விவரம்", te: "సాగు ఖర్చుల వివరాలు", kn: "ಸಾಗುವಳಿ ಖರ್ಚಿನ ವಿವರ", ml: "കൃഷിച്ചെലവ് വിശദാംശം", hi: "खेती खर्च का ब्योरा" })} ({acres} {acresWord})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>🌱 {tr(language, { en: "Seeds & Nursery:", ta: "விதை & நாற்றங்கால்:", te: "విత్తనాలు & నారుమడి:", kn: "ಬೀಜ & ನರ್ಸರಿ:", ml: "വിത്തും നഴ്സറിയും:", hi: "बीज और नर्सरी:" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.seedCost)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>🧪 {tr(language, { en: "NPK Fertilizer & Manure:", ta: "NPK உரம் & எரு:", te: "NPK ఎరువులు & పశువుల ఎరువు:", kn: "NPK ರಸಗೊಬ್ಬರ & ಗೊಬ್ಬರ:", ml: "NPK വളവും ചാണകവും:", hi: "NPK खाद और गोबर खाद:" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.fertilizerCost)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>🛡️ {tr(language, { en: "Pesticides & Fungicides:", ta: "பூச்சி & பூஞ்சைக் கொல்லிகள்:", te: "పురుగు & తెగుళ్ల మందులు:", kn: "ಕೀಟನಾಶಕ & ಶಿಲೀಂಧ್ರನಾಶಕ:", ml: "കീടനാശിനിയും കുമിൾനാശിനിയും:", hi: "कीटनाशक और फफूंदनाशक:" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.pesticideCost)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>👨‍🌾 {tr(language, { en: "Labor & Harvesting Wages:", ta: "வேலை & அறுவடைக் கூலி:", te: "కూలీ & కోత ఖర్చు:", kn: "ಕೂಲಿ & ಕೊಯ್ಲು ಖರ್ಚು:", ml: "പണിക്കൂലിയും കൊയ്ത്തുകൂലിയും:", hi: "मज़दूरी और कटाई खर्च:" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.laborCost)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>🚜 {tr(language, { en: "Tractor & Machinery Rental:", ta: "டிராக்டர் & இயந்திர வாடகை:", te: "ట్రాక్టర్ & యంత్రాల అద్దె:", kn: "ಟ್ರ್ಯಾಕ್ಟರ್ & ಯಂತ್ರ ಬಾಡಿಗೆ:", ml: "ട്രാക്ടർ, യന്ത്ര വാടക:", hi: "ट्रैक्टर और मशीन किराया:" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.machineryCost)}</strong>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800 }}>
              <span>{tr(language, { en: "Total Expenditure:", ta: "மொத்த செலவு:", te: "మొత్తం ఖర్చు:", kn: "ಒಟ್ಟು ಖರ್ಚು:", ml: "ആകെ ചെലവ്:", hi: "कुल खर्च:" })}</span>
              <span style={{ color: "#B91C1C" }}>{formatPrice(res.totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card-sm" style={{ background: "var(--bg)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 12 }}>
            📊 {tr(language, { en: "Net Income Projection", ta: "நிகர வருமான கணிப்பு", te: "నికర ఆదాయ అంచనా", kn: "ನಿವ್ವಳ ಆದಾಯ ಅಂದಾಜು", ml: "അറ്റ വരുമാന പ്രവചനം", hi: "शुद्ध आमदनी अनुमान" })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Total Harvest Volume:", ta: "மொத்த மகசூல்:", te: "మొత్తం దిగుబడి:", kn: "ಒಟ್ಟು ಇಳುವರಿ:", ml: "ആകെ വിളവ്:", hi: "कुल पैदावार:" })}</span>
              <strong style={{ color: "var(--text)" }}>{res.expectedYieldTotalQuintals} {quintalsWord}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Selling Price:", ta: "விற்பனை விலை:", te: "అమ్మకం ధర:", kn: "ಮಾರಾಟ ಬೆಲೆ:", ml: "വിൽപ്പന വില:", hi: "बिक्री भाव:" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.sellingPricePerQuintal)} / {qntlWord}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Gross Market Value:", ta: "மொத்த சந்தை மதிப்பு:", te: "మొత్తం మార్కెట్ విలువ:", kn: "ಒಟ್ಟು ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ:", ml: "ആകെ വിപണി മൂല്യം:", hi: "कुल बाज़ार मूल्य:" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.grossRevenue)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Total Cost Deducted:", ta: "கழிக்கப்பட்ட மொத்த செலவு:", te: "తీసివేసిన మొత్తం ఖర్చు:", kn: "ಕಳೆದ ಒಟ್ಟು ಖರ್ಚು:", ml: "കുറച്ച ആകെ ചെലവ്:", hi: "घटाया गया कुल खर्च:" })}</span>
              <strong style={{ color: "#B91C1C" }}>-{formatPrice(res.totalCost)}</strong>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800 }}>
              <span>{tr(language, { en: "Estimated Net Profit:", ta: "கணிக்கப்பட்ட நிகர லாபம்:", te: "అంచనా నికర లాభం:", kn: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ:", ml: "കണക്കാക്കിയ അറ്റാദായം:", hi: "अनुमानित शुद्ध मुनाफा:" })}</span>
              <span style={{ color: res.isProfitable ? "#15803D" : "#B91C1C" }}>
                {formatPrice(res.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
