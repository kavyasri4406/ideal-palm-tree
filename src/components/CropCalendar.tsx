"use client";

import { useState, Fragment } from "react";
import { getCropCalendarData, MONTH_NAMES } from "@/lib/cropData";
import { useApp, Language } from "@/lib/AppContext";
import { tr, cropName, Localized } from "@/lib/i18n";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Punjab",
  "Maharashtra",
  "Karnataka",
  "Rajasthan"
];

const STATE_NAMES: Record<string, Localized> = {
  "Andhra Pradesh": { en: "Andhra Pradesh", ta: "ஆந்திரப் பிரதேசம்", te: "ఆంధ్రప్రదేశ్", kn: "ಆಂಧ್ರ ಪ್ರದೇಶ", ml: "ആന്ധ്രാപ്രദേശ്", hi: "आंध्र प्रदेश" },
  "Tamil Nadu": { en: "Tamil Nadu", ta: "தமிழ்நாடு", te: "తమిళనాడు", kn: "ತಮಿಳುನಾಡು", ml: "തമിഴ്നാട്", hi: "तमिलनाडु" },
  "Telangana": { en: "Telangana", ta: "தெலங்கானா", te: "తెలంగాణ", kn: "ತೆಲಂಗಾಣ", ml: "തെലങ്കാന", hi: "तेलंगाना" },
  "Uttar Pradesh": { en: "Uttar Pradesh", ta: "உத்தரப் பிரதேசம்", te: "ఉత్తరప్రదేశ్", kn: "ಉತ್ತರ ಪ್ರದೇಶ", ml: "ഉത്തർപ്രദേശ്", hi: "उत्तर प्रदेश" },
  "Punjab": { en: "Punjab", ta: "பஞ்சாப்", te: "పంజాబ్", kn: "ಪಂಜಾಬ್", ml: "പഞ്ചാബ്", hi: "पंजाब" },
  "Maharashtra": { en: "Maharashtra", ta: "மகாராஷ்டிரா", te: "మహారాష్ట్ర", kn: "ಮಹಾರಾಷ್ಟ್ರ", ml: "മഹാരാഷ്ട്ര", hi: "महाराष्ट्र" },
  "Karnataka": { en: "Karnataka", ta: "கர்நாடகா", te: "కర్ణాటక", kn: "ಕರ್ನಾಟಕ", ml: "കർണാടക", hi: "कर्नाटक" },
  "Rajasthan": { en: "Rajasthan", ta: "ராஜஸ்தான்", te: "రాజస్థాన్", kn: "ರಾಜಸ್ಥಾನ", ml: "രാജസ്ഥാൻ", hi: "राजस्थान" }
};

const stateName = (s: string, language: Language) => (STATE_NAMES[s] ? tr(language, STATE_NAMES[s]) : s);

const SEASON_NAMES: Record<string, Localized> = {
  Kharif: { en: "Kharif", ta: "கரீஃப் (காரிப்)", te: "ఖరీఫ్", kn: "ಮುಂಗಾರು (ಖಾರಿಫ್)", ml: "ഖരീഫ്", hi: "खरीफ" },
  Rabi: { en: "Rabi", ta: "ரபி", te: "రబీ", kn: "ಹಿಂಗಾರು (ರಬಿ)", ml: "റാബി", hi: "रबी" },
  Zaid: { en: "Zaid", ta: "ஜைத் (கோடை)", te: "జాయిద్ (వేసవి)", kn: "ಜಾಯಿದ್ (ಬೇಸಿಗೆ)", ml: "സായിദ് (വേനൽ)", hi: "जायद" },
  Annual: { en: "Annual", ta: "ஆண்டு முழுவதும்", te: "సంవత్సరం పొడవునా", kn: "ವರ್ಷಪೂರ್ತಿ", ml: "വർഷം മുഴുവൻ", hi: "वार्षिक" }
};

const WATER_LABELS: Record<string, Localized> = {
  High: { en: "High Water", ta: "அதிக நீர்", te: "ఎక్కువ నీరు", kn: "ಹೆಚ್ಚು ನೀರು", ml: "കൂടുതൽ വെള്ളം", hi: "अधिक पानी" },
  Medium: { en: "Medium Water", ta: "மிதமான நீர்", te: "మధ్యస్థ నీరు", kn: "ಮಧ್ಯಮ ನೀರು", ml: "ഇടത്തരം വെള്ളം", hi: "मध्यम पानी" },
  Low: { en: "Low Water", ta: "குறைந்த நீர்", te: "తక్కువ నీరు", kn: "ಕಡಿಮೆ ನೀರು", ml: "കുറഞ്ഞ വെള്ളം", hi: "कम पानी" }
};

// Localized versions of the advisories in getCropCalendarData (keyed by cropId; {state} is replaced with the state name)
const ADVISORIES: Record<string, Localized> = {
  rice: {
    en: "In {state}, ensure standing water level of 3-5cm during tillering stage. Harvest when 80% grains turn golden yellow.",
    ta: "{state}-இல், தூர் கட்டும் பருவத்தில் வயலில் 3-5 செ.மீ நீர் தேங்கி இருக்கட்டும். 80% நெல்மணிகள் பொன்னிறமானதும் அறுவடை செய்யுங்கள்.",
    te: "{state}లో, పిలకలు వచ్చే దశలో పొలంలో 3-5 సెం.మీ నీరు నిలిచి ఉండేలా చూడండి. 80% గింజలు బంగారు రంగుకు మారినప్పుడు కోయండి.",
    kn: "{state}ದಲ್ಲಿ, ತೆಂಡೆ ಒಡೆಯುವ ಹಂತದಲ್ಲಿ ಗದ್ದೆಯಲ್ಲಿ 3-5 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸಿ. 80% ಕಾಳುಗಳು ಚಿನ್ನದ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.",
    ml: "{state}-ൽ, ചിനപ്പ് പൊട്ടുന്ന ഘട്ടത്തിൽ വയലിൽ 3-5 സെ.മീ വെള്ളം കെട്ടിനിർത്തുക. 80% നെൽമണികൾ സ്വർണ്ണനിറമാകുമ്പോൾ കൊയ്യുക.",
    hi: "{state} में, कल्ले निकलने के समय खेत में 3-5 सेमी पानी भरा रखें। जब 80% दाने सुनहरे पीले हो जाएं तब कटाई करें।"
  },
  wheat: {
    en: "Critical irrigation stages: Crown Root Initiation (21 days post sowing) and Flowering stage.",
    ta: "முக்கிய நீர் பாசன நேரங்கள்: முடி வேர் தோன்றும் பருவம் (விதைத்து 21 நாட்கள்) மற்றும் பூக்கும் பருவம்.",
    te: "ముఖ్యమైన నీటి తడులు: కిరీట వేర్లు వచ్చే దశ (విత్తిన 21 రోజులకు) మరియు పూత దశ.",
    kn: "ಮುಖ್ಯ ನೀರಾವರಿ ಹಂತಗಳು: ಕಿರೀಟ ಬೇರು ಬರುವ ಹಂತ (ಬಿತ್ತನೆಯ 21 ದಿನಗಳ ನಂತರ) ಮತ್ತು ಹೂ ಬಿಡುವ ಹಂತ.",
    ml: "പ്രധാന നനയ്ക്കൽ ഘട്ടങ്ങൾ: കിരീടവേര് വരുന്ന ഘട്ടം (വിതച്ച് 21 ദിവസം), പൂവിടുന്ന ഘട്ടം.",
    hi: "सिंचाई के ज़रूरी समय: शीर्ष जड़ बनने की अवस्था (बुवाई के 21 दिन बाद) और फूल आने की अवस्था।"
  },
  cotton: {
    en: "Monitor for Pink Bollworm during square formation. Maintain clean field drainage during monsoon rain spikes.",
    ta: "மொட்டு உருவாகும் பருவத்தில் இளஞ்சிவப்பு காய்ப்புழுவை கண்காணிக்கவும். மழைக்காலத்தில் வயல் வடிகால் சுத்தமாக இருக்கட்டும்.",
    te: "మొగ్గలు ఏర్పడే దశలో గులాబీ రంగు కాయతొలుచు పురుగును గమనించండి. వర్షాకాలంలో పొలంలో నీరు బయటకు పోయే కాలువలు శుభ్రంగా ఉంచండి.",
    kn: "ಮೊಗ್ಗು ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಗುಲಾಬಿ ಕಾಯಿಕೊರಕ ಹುಳುವನ್ನು ಗಮನಿಸಿ. ಮಳೆಗಾಲದಲ್ಲಿ ಹೊಲದ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ.",
    ml: "മൊട്ട് രൂപപ്പെടുന്ന സമയത്ത് പിങ്ക് കായ്പ്പുഴുവിനെ ശ്രദ്ധിക്കുക. മഴക്കാലത്ത് വയലിലെ നീർച്ചാലുകൾ വൃത്തിയായി സൂക്ഷിക്കുക.",
    hi: "कलियां बनते समय गुलाबी सुंडी पर नज़र रखें। बारिश के मौसम में खेत की नालियां साफ रखें ताकि पानी निकल सके।"
  },
  mustard: {
    en: "Pre-sowing irrigation is critical for uniform germination. Watch out for Aphid attacks in cool foggy conditions.",
    ta: "சீரான முளைப்புக்கு விதைப்புக்கு முன் நீர் பாய்ச்சுவது அவசியம். குளிர்ந்த பனிமூட்ட நாட்களில் அசுவினி தாக்குதலை கவனிக்கவும்.",
    te: "అన్ని విత్తనాలు సమానంగా మొలకెత్తాలంటే విత్తే ముందు నీటి తడి తప్పనిసరి. చల్లని పొగమంచు వాతావరణంలో పేనుబంక దాడిని గమనించండి.",
    kn: "ಸಮಾನವಾಗಿ ಮೊಳಕೆ ಬರಲು ಬಿತ್ತನೆಗೆ ಮುನ್ನ ನೀರು ಹಾಯಿಸುವುದು ಅಗತ್ಯ. ತಂಪಾದ ಮಂಜಿನ ವಾತಾವರಣದಲ್ಲಿ ಹೇನು ದಾಳಿಯ ಬಗ್ಗೆ ಎಚ್ಚರವಿರಲಿ.",
    ml: "ഒരേപോലെ മുളയ്ക്കാൻ വിതയ്ക്കുന്നതിന് മുമ്പ് നനയ്ക്കുന്നത് അത്യാവശ്യമാണ്. തണുത്ത മഞ്ഞുള്ള കാലാവസ്ഥയിൽ മുഞ്ഞ ആക്രമണം ശ്രദ്ധിക്കുക.",
    hi: "एक समान अंकुरण के लिए बुवाई से पहले सिंचाई ज़रूरी है। ठंडे और कोहरे वाले मौसम में माहू (एफिड) के हमले से सावधान रहें।"
  },
  tomato: {
    en: "Use drip irrigation to prevent fungal leaf spot diseases. Stake plants early to keep fruits off moist soil.",
    ta: "பூஞ்சை இலைப்புள்ளி நோயைத் தடுக்க சொட்டு நீர் பாசனம் பயன்படுத்துங்கள். பழங்கள் ஈர மண்ணில் படாமல் இருக்க செடிகளுக்கு முன்கூட்டியே குச்சி ஊன்றுங்கள்.",
    te: "ఆకు మచ్చ తెగుళ్లు రాకుండా బిందు సేద్యం వాడండి. కాయలు తడి మట్టికి తగలకుండా మొక్కలకు ముందుగానే కర్రలు కట్టండి.",
    kn: "ಎಲೆ ಚುಕ್ಕೆ ರೋಗ ತಡೆಯಲು ಹನಿ ನೀರಾವರಿ ಬಳಸಿ. ಹಣ್ಣುಗಳು ತೇವ ಮಣ್ಣಿಗೆ ತಾಗದಂತೆ ಗಿಡಗಳಿಗೆ ಬೇಗನೆ ಕೋಲು ಆಧಾರ ಕೊಡಿ.",
    ml: "ഇലപ്പുള്ളി രോഗം തടയാൻ തുള്ളിനന ഉപയോഗിക്കുക. കായ്കൾ നനഞ്ഞ മണ്ണിൽ തൊടാതിരിക്കാൻ ചെടികൾക്ക് നേരത്തെ താങ്ങ് കൊടുക്കുക.",
    hi: "पत्ती धब्बा रोग से बचाने के लिए ड्रिप सिंचाई करें। फल गीली मिट्टी से न छुएं, इसके लिए पौधों को जल्दी सहारा (डंडी) दें।"
  },
  onion: {
    en: "Stop irrigation 10 days before harvesting to improve bulb storage life and prevent neck rot.",
    ta: "வெங்காயம் நீண்ட நாள் கெடாமல் இருக்கவும் கழுத்து அழுகலைத் தடுக்கவும் அறுவடைக்கு 10 நாட்கள் முன் நீர் பாய்ச்சுவதை நிறுத்துங்கள்.",
    te: "ఉల్లి ఎక్కువ కాలం నిల్వ ఉండటానికి, మెడ కుళ్ళు రాకుండా ఉండటానికి కోతకు 10 రోజుల ముందు నీటి తడులు ఆపండి.",
    kn: "ಈರುಳ್ಳಿ ಹೆಚ್ಚು ಕಾಲ ಸಂಗ್ರಹಿಸಲು ಮತ್ತು ಕುತ್ತಿಗೆ ಕೊಳೆ ತಡೆಯಲು ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ.",
    ml: "ഉള്ളി കൂടുതൽ കാലം സൂക്ഷിക്കാനും കഴുത്തഴുകൽ തടയാനും വിളവെടുപ്പിന് 10 ദിവസം മുമ്പ് നനയ്ക്കൽ നിർത്തുക.",
    hi: "प्याज़ को ज़्यादा दिन सुरक्षित रखने और गर्दन सड़न से बचाने के लिए खुदाई से 10 दिन पहले सिंचाई बंद कर दें।"
  },
  groundnut: {
    en: "Apply Gypsum @ 400 kg/ha during pegging stage to promote pod formation and oil content.",
    ta: "காய் பிடிப்பும் எண்ணெய் சத்தும் அதிகரிக்க, விழுது இறங்கும் பருவத்தில் ஜிப்சம் @ 400 கிலோ/ஹெக்டேர் இடுங்கள்.",
    te: "కాయలు బాగా పట్టడానికి, నూనె శాతం పెరగడానికి ఊడలు దిగే దశలో జిప్సం @ 400 కిలో/హెక్టారు వేయండి.",
    kn: "ಕಾಯಿ ಕಟ್ಟುವಿಕೆ ಮತ್ತು ಎಣ್ಣೆ ಅಂಶ ಹೆಚ್ಚಿಸಲು ಬಿಳಲು ಇಳಿಯುವ ಹಂತದಲ್ಲಿ ಜಿಪ್ಸಮ್ @ 400 ಕೆಜಿ/ಹೆಕ್ಟೇರ್ ಹಾಕಿ.",
    ml: "കായ്പിടുത്തവും എണ്ണയുടെ അളവും കൂട്ടാൻ സൂചി ഇറങ്ങുന്ന ഘട്ടത്തിൽ ജിപ്സം @ 400 കി.ഗ്രാം/ഹെക്ടർ ഇടുക.",
    hi: "फलियां अच्छी बनने और तेल की मात्रा बढ़ाने के लिए खूंटी (पेगिंग) बनने के समय जिप्सम @ 400 किग्रा/हेक्टेयर डालें।"
  }
};

export default function CropCalendar() {
  const { location, language } = useApp();
  const [selectedState, setSelectedState] = useState<string>(location.state || "Andhra Pradesh");
  const [selectedSeason, setSelectedSeason] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const calendarItems = getCropCalendarData(selectedState);

  const filteredItems = calendarItems.filter(item =>
    selectedSeason === "All" || item.season === selectedSeason
  );

  const stateLabel = stateName(selectedState, language);
  const monthLabel = (idx: number) => {
    if (language === "en") return MONTH_NAMES[idx];
    try {
      return new Date(2024, idx, 1).toLocaleDateString(`${language}-IN`, { month: "short" });
    } catch {
      return MONTH_NAMES[idx];
    }
  };
  const advisoryText = (item: { cropId: string; advisory: string }) =>
    ADVISORIES[item.cropId] ? tr(language, ADVISORIES[item.cropId]).replace("{state}", stateLabel) : item.advisory;

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header & State Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>📅</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              {tr(language, {
                en: "State Agricultural Crop Calendar",
                ta: "மாநில பயிர் நாட்காட்டி",
                te: "రాష్ట్ర పంటల క్యాలెండర్",
                kn: "ರಾಜ್ಯ ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್",
                ml: "സംസ്ഥാന വിള കലണ്ടർ",
                hi: "राज्य फसल कैलेंडर"
              })}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {tr(language, {
              en: `Month-by-month sowing, irrigation, and harvesting timelines tailored for ${stateLabel}`,
              ta: `${stateLabel}-க்கான மாதவாரி விதைப்பு, நீர் பாசனம் மற்றும் அறுவடை கால அட்டவணை`,
              te: `${stateLabel} కోసం నెలవారీ విత్తనం, నీటి తడులు మరియు కోత సమయాలు`,
              kn: `${stateLabel}ಕ್ಕಾಗಿ ತಿಂಗಳುವಾರು ಬಿತ್ತನೆ, ನೀರಾವರಿ ಮತ್ತು ಕೊಯ್ಲು ಸಮಯ`,
              ml: `${stateLabel}-നുള്ള മാസം തോറുമുള്ള വിതയ്ക്കൽ, നനയ്ക്കൽ, വിളവെടുപ്പ് സമയക്രമം`,
              hi: `${stateLabel} के लिए महीने-वार बुवाई, सिंचाई और कटाई का समय`
            })}
          </p>
        </div>

        {/* State & Season Filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>📍 {stateName(s, language)}</option>
            ))}
          </select>

          <select
            value={selectedSeason}
            onChange={e => setSelectedSeason(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            <option value="All">🌱 {tr(language, { en: "All Seasons", ta: "அனைத்து பருவங்கள்", te: "అన్ని సీజన్లు", kn: "ಎಲ್ಲಾ ಹಂಗಾಮುಗಳು", ml: "എല്ലാ സീസണുകളും", hi: "सभी मौसम" })}</option>
            <option value="Kharif">🌧️ {tr(language, { en: "Kharif (Monsoon)", ta: "கரீஃப் (மழைக்காலம்)", te: "ఖరీఫ్ (వర్షాకాలం)", kn: "ಮುಂಗಾರು (ಮಳೆಗಾಲ)", ml: "ഖരീഫ് (മഴക്കാലം)", hi: "खरीफ (बरसात)" })}</option>
            <option value="Rabi">❄️ {tr(language, { en: "Rabi (Winter)", ta: "ரபி (குளிர்காலம்)", te: "రబీ (చలికాలం)", kn: "ಹಿಂಗಾರು (ಚಳಿಗಾಲ)", ml: "റാബി (ശൈത്യകാലം)", hi: "रबी (सर्दी)" })}</option>
            <option value="Annual">☀️ {tr(language, { en: "Annual / Perennial", ta: "ஆண்டு முழுவதும் / பல்லாண்டு", te: "వార్షిక / బహువార్షిక", kn: "ವಾರ್ಷಿಕ / ಬಹುವಾರ್ಷಿಕ", ml: "വാർഷികം / ദീർഘകാലം", hi: "वार्षिक / बारहमासी" })}</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
        background: "var(--accent)",
        padding: "10px 16px",
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 12.5,
        fontWeight: 600
      }}>
        <span style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>
          {tr(language, { en: "Stage Legend:", ta: "நிலை விளக்கம்:", te: "దశల వివరణ:", kn: "ಹಂತಗಳ ವಿವರಣೆ:", ml: "ഘട്ട സൂചിക:", hi: "चरण संकेत:" })}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#4CAF50" }} />
          <span>🌱 {tr(language, { en: "Sowing Period", ta: "விதைப்பு காலம்", te: "విత్తే సమయం", kn: "ಬಿತ್ತನೆ ಸಮಯ", ml: "വിതയ്ക്കൽ കാലം", hi: "बुवाई का समय" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#3B82F6" }} />
          <span>💧 {tr(language, { en: "Irrigation & Flowering", ta: "நீர் பாசனம் & பூக்கும் பருவம்", te: "నీటి తడులు & పూత", kn: "ನೀರಾವರಿ & ಹೂಬಿಡುವಿಕೆ", ml: "നനയ്ക്കലും പൂവിടലും", hi: "सिंचाई और फूल आना" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#E8B96A" }} />
          <span>🌾 {tr(language, { en: "Harvest & Threshing", ta: "அறுவடை & கதிரடித்தல்", te: "కోత & నూర్పిడి", kn: "ಕೊಯ್ಲು & ಒಕ್ಕಣೆ", ml: "വിളവെടുപ്പും മെതിക്കലും", hi: "कटाई और गहाई" })}</span>
        </div>
      </div>

      {/* 12-Month Gantt Chart Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 180 }}>{tr(language, { en: "Crop & Season", ta: "பயிர் & பருவம்", te: "పంట & సీజన్", kn: "ಬೆಳೆ & ಹಂಗಾಮು", ml: "വിളയും സീസണും", hi: "फसल और मौसम" })}</th>
              {MONTH_NAMES.map((m, idx) => (
                <th key={m} style={{ textAlign: "center", padding: "10px 4px", fontSize: 11 }}>
                  {monthLabel(idx)}
                </th>
              ))}
              <th style={{ textAlign: "center" }}>{tr(language, { en: "Advisory", ta: "ஆலோசனை", te: "సలహా", kn: "ಸಲಹೆ", ml: "നിർദ്ദേശം", hi: "सलाह" })}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <Fragment key={item.id}>
                <tr>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{item.cropEmoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{cropName({ id: item.cropId, name: item.cropName }, language)}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {SEASON_NAMES[item.season] ? tr(language, SEASON_NAMES[item.season]) : item.season} • {WATER_LABELS[item.waterRequirement] ? tr(language, WATER_LABELS[item.waterRequirement]) : `${item.waterRequirement} Water`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 12 Month Grid cells */}
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => {
                    const isSowing = item.sowingMonths.includes(monthNum);
                    const isIrrigation = item.irrigationMonths.includes(monthNum);
                    const isHarvest = item.harvestMonths.includes(monthNum);

                    return (
                      <td key={monthNum} style={{ padding: 4, textAlign: "center", verticalAlign: "middle" }}>
                        <div style={{
                          height: 24,
                          borderRadius: 6,
                          background: isSowing
                            ? "#4CAF50"
                            : isHarvest
                            ? "#E8B96A"
                            : isIrrigation
                            ? "#3B82F6"
                            : "rgba(0,0,0,0.03)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700
                        }}>
                          {isSowing ? "🌱" : isHarvest ? "🌾" : isIrrigation ? "💧" : ""}
                        </div>
                      </td>
                    );
                  })}

                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      {expandedId === item.id
                        ? tr(language, { en: "Hide Tip", ta: "குறிப்பை மறை", te: "సలహా దాచు", kn: "ಸಲಹೆ ಮರೆಮಾಡಿ", ml: "നിർദ്ദേശം മറയ്ക്കുക", hi: "सलाह छिपाएं" })
                        : tr(language, { en: "View Tip", ta: "குறிப்பைப் பார்", te: "సలహా చూడండి", kn: "ಸಲಹೆ ನೋಡಿ", ml: "നിർദ്ദേശം കാണുക", hi: "सलाह देखें" })}
                    </button>
                  </td>
                </tr>

                {/* Expanded Advisory Row */}
                {expandedId === item.id && (
                  <tr key={`${item.id}_tip`}>
                    <td colSpan={14} style={{ background: "var(--accent)", padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: 13, color: "var(--primary-dark)", lineHeight: 1.5 }}>
                        <strong>
                          💡 {tr(language, {
                            en: "Farming Advisory",
                            ta: "விவசாய ஆலோசனை",
                            te: "వ్యవసాయ సలహా",
                            kn: "ಕೃಷಿ ಸಲಹೆ",
                            ml: "കൃഷി നിർദ്ദേശം",
                            hi: "खेती सलाह"
                          })} ({cropName({ id: item.cropId, name: item.cropName }, language)} — {stateLabel}):
                        </strong>{" "}
                        {advisoryText(item)}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
