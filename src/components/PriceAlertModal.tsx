"use client";

import { useState, useEffect, useId, useRef } from "react";
import { CROPS, formatPrice } from "@/lib/cropData";
import { savePriceAlert, dispatchPriceNotification, PriceAlert } from "@/lib/priceAlerts";
import { useApp } from "@/lib/AppContext";
import { tr, cropName } from "@/lib/i18n";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCropId?: string;
  initialMandiName?: string;
  initialPrice?: number;
  initialState?: string;
  initialDistrict?: string;
  onAlertCreated?: (alert: PriceAlert) => void;
}

const COMMON_MANDIS = [
  { name: "Nellore Mandi", district: "Nellore", state: "Andhra Pradesh" },
  { name: "Guntur Mandi", district: "Guntur", state: "Andhra Pradesh" },
  { name: "Madurai Central Market", district: "Madurai", state: "Tamil Nadu" },
  { name: "Chennai Koyambedu", district: "Chennai", state: "Tamil Nadu" },
  { name: "Kurnool APMC Market", district: "Kurnool", state: "Andhra Pradesh" },
  { name: "Coimbatore APMC Market", district: "Coimbatore", state: "Tamil Nadu" },
  { name: "Hubli APMC Yard", district: "Dharwad", state: "Karnataka" },
  { name: "Indore Mandi", district: "Indore", state: "Madhya Pradesh" }
];

/** Short price-unit label for a crop unit, e.g. "quintal" → "qtl", "dozen" → "dozen". */
const unitShort = (unit: string) => (unit === "quintal" ? "qtl" : unit);

export default function PriceAlertModal({ isOpen, ...props }: PriceAlertModalProps) {
  if (!isOpen) return null;
  // The dialog mounts fresh on every open and is re-keyed when the prefill props change, so its
  // form state is initialised from the props instead of being reset by an effect.
  const formKey = [props.initialCropId, props.initialMandiName, props.initialPrice, props.initialState, props.initialDistrict].join("|");
  return <PriceAlertDialog key={formKey} {...props} />;
}

function PriceAlertDialog({
  onClose,
  initialCropId,
  initialMandiName,
  initialPrice,
  initialState,
  initialDistrict,
  onAlertCreated
}: Omit<PriceAlertModalProps, "isOpen">) {
  const { addNotification, language } = useApp();
  const idPrefix = useId();
  const titleId = `${idPrefix}-title`;

  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId || "rice");
  const [mandiName, setMandiName] = useState<string>(initialMandiName || "Nellore Mandi");
  const [district, setDistrict] = useState<string>(initialDistrict || "Nellore");
  const [state, setState] = useState<string>(initialState || "Andhra Pradesh");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState<number>(initialPrice ? Math.round(initialPrice * 1.08) : 2400);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const selectedCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
  const unitLabel = unitShort(selectedCrop.unit);
  const unitName = selectedCrop.unit === "quintal"
    ? tr(language, { en: "Quintal", ta: "குவிண்டால்", te: "క్వింటాల్", kn: "ಕ್ವಿಂಟಾಲ್", ml: "ക്വിന്റൽ", hi: "क्विंटल" })
    : selectedCrop.unit.charAt(0).toUpperCase() + selectedCrop.unit.slice(1);
  const selectedCropName = cropName(selectedCrop, language);
  const targetText = `₹${targetPrice.toLocaleString("en-IN")}/${unitLabel}`;

  const L = {
    invalid: tr(language, { en: "Please enter a valid target price greater than 0", ta: "0-க்கு மேல் சரியான இலக்கு விலையை உள்ளிடவும்", te: "దయచేసి 0 కంటే ఎక్కువ సరైన లక్ష్య ధరను నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು 0 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಸರಿಯಾದ ಗುರಿ ಬೆಲೆ ನಮೂದಿಸಿ", ml: "ദയവായി 0-ൽ കൂടുതലുള്ള ശരിയായ ലക്ഷ്യ വില നൽകുക", hi: "कृपया 0 से ज़्यादा सही लक्ष्य भाव डालें" }),
    alertSet: tr(language, { en: "🔔 Target Price Alert Set!", ta: "🔔 இலக்கு விலை எச்சரிக்கை அமைக்கப்பட்டது!", te: "🔔 లక్ష్య ధర హెచ్చరిక సెట్ అయింది!", kn: "🔔 ಗುರಿ ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಲಾಗಿದೆ!", ml: "🔔 ലക്ഷ്യ വില അറിയിപ്പ് സജ്ജമാക്കി!", hi: "🔔 लक्ष्य भाव अलर्ट लग गया!" }),
    title: tr(language, { en: "Set Smart Price Alert", ta: "விலை எச்சரிக்கை அமை", te: "ధర హెచ్చరిక సెట్ చేయండి", kn: "ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ", ml: "വില അറിയിപ്പ് സജ്ജമാക്കുക", hi: "भाव अलर्ट लगाएं" }),
    subtitle: tr(language, { en: "Instant browser & lockscreen notification when rates hit your target", ta: "விலை உங்கள் இலக்கை அடைந்ததும் உடனடி அறிவிப்பு", te: "ధర మీ లక్ష్యానికి చేరగానే వెంటనే నోటిఫికేషన్", kn: "ಬೆಲೆ ನಿಮ್ಮ ಗುರಿ ತಲುಪಿದ ತಕ್ಷಣ ಅಧಿಸೂಚನೆ", ml: "വില നിങ്ങളുടെ ലക്ഷ്യത്തിലെത്തുമ്പോൾ ഉടൻ അറിയിപ്പ്", hi: "भाव आपके लक्ष्य पर पहुंचते ही तुरंत सूचना" }),
    close: tr(language, { en: "Close", ta: "மூடு", te: "మూసివేయి", kn: "ಮುಚ್ಚಿ", ml: "അടയ്ക്കുക", hi: "बंद करें" }),
    activated: tr(language, { en: "Price Alert Activated!", ta: "விலை எச்சரிக்கை இயக்கப்பட்டது!", te: "ధర హెచ్చరిక ప్రారంభమైంది!", kn: "ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯವಾಗಿದೆ!", ml: "വില അറിയിപ്പ് സജീവമാക്കി!", hi: "भाव अलर्ट चालू हो गया!" }),
    selectCrop: tr(language, { en: "Select Crop", ta: "பயிரைத் தேர்ந்தெடுக்கவும்", te: "పంటను ఎంచుకోండి", kn: "ಬೆಳೆ ಆರಿಸಿ", ml: "വിള തിരഞ്ഞെടുക്കുക", hi: "फसल चुनें" }),
    current: tr(language, { en: "Current", ta: "தற்போது", te: "ప్రస్తుతం", kn: "ಈಗ", ml: "ഇപ്പോൾ", hi: "अभी" }),
    selectMandi: tr(language, { en: "Select Mandi / APMC Yard", ta: "மண்டி / APMC சந்தையைத் தேர்ந்தெடுக்கவும்", te: "మండి / APMC యార్డ్ ఎంచుకోండి", kn: "ಮಂಡಿ / APMC ಯಾರ್ಡ್ ಆರಿಸಿ", ml: "മണ്ടി / APMC യാർഡ് തിരഞ്ഞെടുക്കുക", hi: "मंडी / APMC यार्ड चुनें" }),
    allMandis: tr(language, { en: "All Regional Mandis", ta: "அனைத்து பகுதி மண்டிகள்", te: "అన్ని ప్రాంతీయ మండీలు", kn: "ಎಲ್ಲಾ ಪ್ರಾದೇಶಿಕ ಮಂಡಿಗಳು", ml: "എല്ലാ പ്രാദേശിക മണ്ടികളും", hi: "सभी क्षेत्रीय मंडियां" }),
    trigger: tr(language, { en: "Trigger Condition", ta: "எச்சரிக்கை நிபந்தனை", te: "హెచ్చరిక షరతు", kn: "ಎಚ್ಚರಿಕೆ ಷರತ್ತು", ml: "അറിയിപ്പ് വ്യവസ്ഥ", hi: "अलर्ट की शर्त" }),
    risesAbove: tr(language, { en: "Rises Above (≥)", ta: "மேல் உயர்ந்தால் (≥)", te: "పైకి పెరిగితే (≥)", kn: "ಮೇಲೆ ಏರಿದರೆ (≥)", ml: "മുകളിൽ ഉയർന്നാൽ (≥)", hi: "ऊपर जाए (≥)" }),
    fallsBelow: tr(language, { en: "Falls Below (≤)", ta: "கீழே குறைந்தால் (≤)", te: "కిందకు తగ్గితే (≤)", kn: "ಕೆಳಗೆ ಇಳಿದರೆ (≤)", ml: "താഴെ കുറഞ്ഞാൽ (≤)", hi: "नीचे आए (≤)" }),
    targetPrice: tr(language, { en: `Target Price (₹ per ${unitName})`, ta: `இலக்கு விலை (ஒரு ${unitName}க்கு ₹)`, te: `లక్ష్య ధర (ఒక ${unitName}కు ₹)`, kn: `ಗುರಿ ಬೆಲೆ (ಪ್ರತಿ ${unitName}ಗೆ ₹)`, ml: `ലക്ഷ്യ വില (ഓരോ ${unitName}നും ₹)`, hi: `लक्ष्य भाव (₹ प्रति ${unitName})` }),
    baseline: tr(language, { en: "Baseline", ta: "அடிப்படை விலை", te: "బేస్ ధర", kn: "ಮೂಲ ಬೆಲೆ", ml: "അടിസ്ഥാന വില", hi: "आधार भाव" }),
    placeholder: tr(language, { en: "e.g. 2400", ta: "எ.கா. 2400", te: "ఉదా. 2400", kn: "ಉದಾ. 2400", ml: "ഉദാ. 2400", hi: "जैसे 2400" }),
    previewLabel: tr(language, { en: "Notification Preview:", ta: "அறிவிப்பு முன்னோட்டம்:", te: "నోటిఫికేషన్ ముందుచూపు:", kn: "ಅಧಿಸೂಚನೆ ಮುನ್ನೋಟ:", ml: "അറിയിപ്പ് പ്രിവ്യൂ:", hi: "सूचना की झलक:" }),
    preview: tr(language, {
      en: `You'll get an instant lockscreen alert when ${mandiName} reaches ${targetText}.`,
      ta: `${mandiName} விலை ${targetText} ஐ அடைந்ததும் உங்களுக்கு உடனடி அறிவிப்பு வரும்.`,
      te: `${mandiName} ధర ${targetText} కి చేరగానే మీకు వెంటనే హెచ్చరిక వస్తుంది.`,
      kn: `${mandiName} ಬೆಲೆ ${targetText} ತಲುಪಿದ ತಕ್ಷಣ ನಿಮಗೆ ಎಚ್ಚರಿಕೆ ಬರುತ್ತದೆ.`,
      ml: `${mandiName} വില ${targetText} എത്തുമ്പോൾ നിങ്ങൾക്ക് ഉടൻ അറിയിപ്പ് ലഭിക്കും.`,
      hi: `${mandiName} का भाव ${targetText} पहुंचते ही आपको तुरंत अलर्ट मिलेगा।`,
    }),
    cancel: tr(language, { en: "Cancel", ta: "ரத்து செய்", te: "రద్దు చేయి", kn: "ರದ್ದುಮಾಡಿ", ml: "റദ്ദാക്കുക", hi: "रद्द करें" }),
    activating: tr(language, { en: "Activating Alert...", ta: "எச்சரிக்கை இயக்கப்படுகிறது...", te: "హెచ్చరిక ప్రారంభిస్తున్నాం...", kn: "ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ...", ml: "അറിയിപ്പ് സജീവമാക്കുന്നു...", hi: "अलर्ट चालू हो रहा है..." }),
    save: tr(language, { en: "🔔 Set Price Alert", ta: "🔔 விலை எச்சரிக்கை அமை", te: "🔔 ధర హెచ్చరిక సెట్ చేయండి", kn: "🔔 ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ", ml: "🔔 വില അറിയിപ്പ് സജ്ജമാക്കുക", hi: "🔔 भाव अलर्ट लगाएं" }),
  };

  // Close on Escape.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Don't let the post-save auto-close fire after the dialog was already closed (it could close a re-opened one).
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const handleSave = async () => {
    if (targetPrice <= 0) {
      alert(L.invalid);
      return;
    }

    setIsSaving(true);
    const newAlert = savePriceAlert({
      cropId: selectedCrop.id,
      cropName: selectedCrop.name,
      mandiName,
      district,
      state,
      condition,
      targetPrice,
      unit: `₹/${unitLabel}`,
      lastCheckedPrice: initialPrice || selectedCrop.basePrice
    });

    const alertTitle = L.alertSet;
    const alertBody = condition === "above"
      ? tr(language, {
          en: `We'll notify you when ${mandiName} ${selectedCropName} crosses ${targetText}`,
          ta: `${mandiName} ${selectedCropName} விலை ${targetText} ஐ தாண்டும்போது உங்களுக்கு தெரிவிப்போம்`,
          te: `${mandiName} ${selectedCropName} ధర ${targetText} దాటినప్పుడు మీకు తెలియజేస్తాం`,
          kn: `${mandiName} ${selectedCropName} ಬೆಲೆ ${targetText} ದಾಟಿದಾಗ ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ`,
          ml: `${mandiName} ${selectedCropName} വില ${targetText} കടക്കുമ്പോൾ ഞങ്ങൾ അറിയിക്കും`,
          hi: `${mandiName} में ${selectedCropName} का भाव ${targetText} से ऊपर जाने पर हम आपको बताएंगे`,
        })
      : tr(language, {
          en: `We'll notify you when ${mandiName} ${selectedCropName} drops below ${targetText}`,
          ta: `${mandiName} ${selectedCropName} விலை ${targetText} க்குக் கீழே குறையும்போது உங்களுக்கு தெரிவிப்போம்`,
          te: `${mandiName} ${selectedCropName} ధర ${targetText} కంటే తగ్గినప్పుడు మీకు తెలియజేస్తాం`,
          kn: `${mandiName} ${selectedCropName} ಬೆಲೆ ${targetText} ಗಿಂತ ಇಳಿದಾಗ ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ`,
          ml: `${mandiName} ${selectedCropName} വില ${targetText}-ൽ താഴെ പോകുമ്പോൾ ഞങ്ങൾ അറിയിക്കും`,
          hi: `${mandiName} में ${selectedCropName} का भाव ${targetText} से नीचे आने पर हम आपको बताएंगे`,
        });

    // 1. In-app notification
    addNotification({
      title: alertTitle,
      message: alertBody,
      type: "price"
    });

    // 2. Dispatch native lockscreen push verification
    dispatchPriceNotification(alertTitle, alertBody);

    setSuccessMsg(alertBody);
    if (onAlertCreated) onAlertCreated(newAlert);

    closeTimerRef.current = setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(3px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }}>
      <div className="card" role="dialog" aria-modal="true" aria-labelledby={titleId} style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        width: "100%",
        maxWidth: 500,
        padding: 24,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        animation: "fadeIn 0.2s ease"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(245, 158, 11, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22
            }}>
              🔔
            </div>
            <div>
              <h3 id={titleId} style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                {L.title}
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {L.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={L.close}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}
          >
            ✕
          </button>
        </div>

        {successMsg ? (
          <div style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid #10B981",
            borderRadius: 14,
            padding: 20,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#047857" }}>{L.activated}</div>
            <p style={{ fontSize: 13, color: "var(--text)", marginTop: 6 }}>{successMsg}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Crop Selector */}
            <div>
              <label htmlFor={`${idPrefix}-crop`} style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                🌾 {L.selectCrop}
              </label>
              <select
                id={`${idPrefix}-crop`}
                value={selectedCropId}
                onChange={e => {
                  setSelectedCropId(e.target.value);
                  const c = CROPS.find(crop => crop.id === e.target.value);
                  if (c) {
                    setTargetPrice(condition === "above" ? Math.round(c.basePrice * 1.1) : Math.round(c.basePrice * 0.9));
                  }
                }}
                className="input"
                style={{ width: "100%", borderRadius: 10, fontSize: 13.5 }}
              >
                {CROPS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {cropName(c, language)} ({L.current}: {formatPrice(c.basePrice)}/{unitShort(c.unit)})
                  </option>
                ))}
              </select>
            </div>

            {/* Mandi Selector */}
            <div>
              <label htmlFor={`${idPrefix}-mandi`} style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                🏢 {L.selectMandi}
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  id={`${idPrefix}-mandi`}
                  value={mandiName}
                  onChange={e => {
                    const match = COMMON_MANDIS.find(m => m.name === e.target.value);
                    setMandiName(e.target.value);
                    if (match) {
                      setDistrict(match.district);
                      setState(match.state);
                    }
                  }}
                  className="input"
                  style={{ flex: 1, borderRadius: 10, fontSize: 13.5 }}
                >
                  {COMMON_MANDIS.map(m => (
                    <option key={m.name} value={m.name}>
                      📍 {m.name} ({m.district}, {m.state})
                    </option>
                  ))}
                  <option value="All Mandis">📍 {L.allMandis}</option>
                </select>
              </div>
            </div>

            {/* Condition: Above vs Below */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                ⚡ {L.trigger}
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCondition("above")}
                  aria-pressed={condition === "above"}
                  style={{
                    padding: "10px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: condition === "above" ? "2px solid #15803D" : "1px solid var(--border)",
                    background: condition === "above" ? "rgba(22,163,74,0.1)" : "var(--bg)",
                    color: condition === "above" ? "#15803D" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>📈</span>
                  <span>{L.risesAbove}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition("below")}
                  aria-pressed={condition === "below"}
                  style={{
                    padding: "10px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: condition === "below" ? "2px solid #B91C1C" : "1px solid var(--border)",
                    background: condition === "below" ? "rgba(185,28,28,0.1)" : "var(--bg)",
                    color: condition === "below" ? "#B91C1C" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>📉</span>
                  <span>{L.fallsBelow}</span>
                </button>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label htmlFor={`${idPrefix}-target`} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                  🎯 {L.targetPrice}
                </label>
                <span style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 600 }}>
                  {L.baseline}:{formatPrice(selectedCrop.basePrice)}/{unitLabel}
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: 11, fontSize: 16, fontWeight: 700, color: "var(--text-muted)" }}>
                  ₹
                </span>
                <input
                  id={`${idPrefix}-target`}
                  type="number"
                  value={targetPrice}
                  onChange={e => setTargetPrice(Number(e.target.value) || 0)}
                  className="input"
                  style={{ width: "100%", paddingLeft: 34, borderRadius: 10, fontSize: 16, fontWeight: 700 }}
                  placeholder={L.placeholder}
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div style={{
              background: "var(--bg)",
              border: "1px dashed var(--border)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <div>
                <strong>{L.previewLabel}</strong> {L.preview}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1, borderRadius: 12 }}
              >
                {L.cancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ flex: 2, borderRadius: 12, fontWeight: 700 }}
              >
                {isSaving ? L.activating : L.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
