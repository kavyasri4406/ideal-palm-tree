export type Language = "en" | "ta" | "te" | "kn" | "ml" | "hi";

export interface Translations {
  navSection: string;
  alertCenter: string;
  signOut: string;
  signIn: string;
  cropsTitle: string;
  allCropsTab: string;
  mandiCompTab: string;
  liveTicker: string;
  totalCrops: string;
  trackedNationwide: string;
  currentPrice: string;
  mspPrice: string;
  govtMinimum: string;
  aiRecTitle: string;
  confidence: string;
  forecast30Day: string;
  cropImpact: string;
  viewForecastBtn: string;
  lowRisk: string;
  mediumRisk: string;
  highRisk: string;
  buyAction: string;
  holdAction: string;
  sellAction: string;
  humidity: string;
  weatherRisk: string;
  exportPdf: string;
  exportCsv: string;
  searchPlaceholder: string;
  all: string;
}

export const APP_TRANSLATIONS: Record<Language, Translations> = {
  en: {
    navSection: "NAVIGATION",
    alertCenter: "Alert Center",
    signOut: "Sign Out",
    signIn: "Sign In",
    cropsTitle: "Crops Market",
    allCropsTab: "All Crops",
    mandiCompTab: "Mandi Comparison",
    liveTicker: "LIVE TICKER",
    totalCrops: "TOTAL CROPS",
    trackedNationwide: "Tracked nationwide",
    currentPrice: "CURRENT PRICE",
    mspPrice: "MSP PRICE",
    govtMinimum: "Govt minimum",
    aiRecTitle: "AI Recommendation",
    confidence: "Confidence",
    forecast30Day: "30-Day Forecast",
    cropImpact: "Crop Impact",
    viewForecastBtn: "View Forecast →",
    lowRisk: "Low Risk",
    mediumRisk: "Medium Risk",
    highRisk: "High Risk",
    buyAction: "BUY",
    holdAction: "HOLD",
    sellAction: "SELL",
    humidity: "Humidity",
    weatherRisk: "Crop Risk",
    exportPdf: "Export PDF Report",
    exportCsv: "Export CSV Data",
    searchPlaceholder: "Search crops...",
    all: "All"
  },
  ta: {
    navSection: "வழிசெலுத்தல்",
    alertCenter: "எச்சரிக்கை மையம்",
    signOut: "வெளியேறு",
    signIn: "உள்நுழை",
    cropsTitle: "பயிர் சந்தை",
    allCropsTab: "அனைத்து பயிர்கள்",
    mandiCompTab: "மண்டி ஒப்பீடு",
    liveTicker: "நேரடி விலை",
    totalCrops: "மொத்த பயிர்கள்",
    trackedNationwide: "நாடு முழுவதும்",
    currentPrice: "தற்போதைய விலை",
    mspPrice: "MSP விலை",
    govtMinimum: "அரசு குறைந்தபட்சம்",
    aiRecTitle: "AI பரிந்துரை",
    confidence: "நம்பகத்தன்மை",
    forecast30Day: "30 நாள் கணிப்பு",
    cropImpact: "பயிர் தாக்கம்",
    viewForecastBtn: "கணிப்பு பார்க்க →",
    lowRisk: "குறைந்த அபாயம்",
    mediumRisk: "மிதமான அபாயம்",
    highRisk: "அதிக அபாயம்",
    buyAction: "வாங்க",
    holdAction: "தொடர்க",
    sellAction: "விற்க",
    humidity: "ஈரப்பதம்",
    weatherRisk: "பயிர் அபாயம்",
    exportPdf: "PDF அறிக்கை பெறுக",
    exportCsv: "CSV தரவு பெறுக",
    searchPlaceholder: "பயிர்களைத் தேடு...",
    all: "அனைத்தும்"
  },
  te: {
    navSection: "నెవిగేషన్",
    alertCenter: "అలర్ట్ సెంటర్",
    signOut: "లాగ్ అవుట్",
    signIn: "లాగిన్",
    cropsTitle: "పంటల మార్కెట్",
    allCropsTab: "అన్ని పంటలు",
    mandiCompTab: "మండి పోలిక",
    liveTicker: "లైవ్ ధరలు",
    totalCrops: "మొత్తం పంటలు",
    trackedNationwide: "దేశవ్యాప్తంగా",
    currentPrice: "ప్రస్తుత ధర",
    mspPrice: "MSP ధర",
    govtMinimum: "ప్రభుత్వ కనీస ధర",
    aiRecTitle: "AI సిఫారసు",
    confidence: "నమ్మకం",
    forecast30Day: "30 రోజుల అంచనా",
    cropImpact: "పంట ప్రభావం",
    viewForecastBtn: "అంచనా చూడండి →",
    lowRisk: "తక్కువ ప్రమాదం",
    mediumRisk: "మధ్యస్థ ప్రమాదం",
    highRisk: "ఎక్కువ ప్రమాదం",
    buyAction: "కొనండి",
    holdAction: "ఉంచండి",
    sellAction: "అమ్మండి",
    humidity: "తేమ",
    weatherRisk: "పంట ప్రమాదం",
    exportPdf: "PDF నివేదిక",
    exportCsv: "CSV డేటా",
    searchPlaceholder: "పంటల కోసం వెతకండి...",
    all: "అన్నీ"
  },
  kn: {
    navSection: "ನ್ಯಾವಿಗೇಷನ್",
    alertCenter: "ಎಚ್ಚರಿಕೆ ಕೇಂದ್ರ",
    signOut: "ಸೈನ್ ಔಟ್",
    signIn: "ಸೈನ್ ಇನ್",
    cropsTitle: "ಬೆಳೆ ಮಾರುಕಟ್ಟೆ",
    allCropsTab: "ಎಲ್ಲಾ ಬೆಳೆಗಳು",
    mandiCompTab: "ಮಂಡಿ ಹೋಲಿಕೆ",
    liveTicker: "ಲೈವ್ ದರಗಳು",
    totalCrops: "ಒಟ್ಟು ಬೆಳೆಗಳು",
    trackedNationwide: "ದೇಶಾದ್ಯಂತ",
    currentPrice: "ಪ್ರಸ್ತುತ ಬೆಲೆ",
    mspPrice: "MSP ಬೆಲೆ",
    govtMinimum: "ಸರ್ಕಾರಿ ಕನಿಷ್ಠ ಬೆಲೆ",
    aiRecTitle: "AI ಸಲಹೆ",
    confidence: "ವಿಶ್ವಾಸಾರ್ಹತೆ",
    forecast30Day: "30 ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
    cropImpact: "ಬೆಳೆ ಮೇಲಿನ ಪರಿಣಾಮ",
    viewForecastBtn: "ಮುನ್ಸೂಚನೆ ವೀಕ್ಷಿಸಿ →",
    lowRisk: "ಕಡಿಮೆ ಅಪಾಯ",
    mediumRisk: "ಮಧ್ಯಮ ಅಪಾಯ",
    highRisk: "ಹೆಚ್ಚಿನ ಅಪಾಯ",
    buyAction: "ಖರೀದಿಸಿ",
    holdAction: "ಇರಿಸಿಕೊಳ್ಳಿ",
    sellAction: "ಮಾರಿ",
    humidity: "ತೇವಾಂಶ",
    weatherRisk: "ಬೆಳೆ ಅಪಾಯ",
    exportPdf: "PDF ವರದಿ",
    exportCsv: "CSV ಡೇಟಾ",
    searchPlaceholder: "ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...",
    all: "ಎಲ್ಲವೂ"
  },
  ml: {
    navSection: "നാവിഗേഷൻ",
    alertCenter: "അലേർട്ട് സെന്റർ",
    signOut: "സൈൻ ഔട്ട്",
    signIn: "സൈൻ ഇൻ",
    cropsTitle: "വിള വിപണി",
    allCropsTab: "എല്ലാ വിളകളും",
    mandiCompTab: "വിപണി താരതമ്യം",
    liveTicker: "തത്സമയ നിരക്കുകൾ",
    totalCrops: "ആകെ വിളകൾ",
    trackedNationwide: "രാജ്യവ്യാപകമായി",
    currentPrice: "നിലവിലെ വില",
    mspPrice: "MSP വില",
    govtMinimum: "സർക്കാർ കുറഞ്ഞ വില",
    aiRecTitle: "AI ഉപദേശം",
    confidence: "വിശ്വാസ്യത",
    forecast30Day: "30 ദിവസത്തെ പ്രവചനം",
    cropImpact: "വിള പ്രഭാവം",
    viewForecastBtn: "പ്രവചനം കാണുക →",
    lowRisk: "കുറഞ്ഞ അപകടസാധ്യത",
    mediumRisk: "ഇടത്തരം അപകടസാധ്യത",
    highRisk: "ഉയർന്ന അപകടസാധ്യത",
    buyAction: "വാങ്ങുക",
    holdAction: "സൂക്ഷിക്കുക",
    sellAction: "വിൽക്കുക",
    humidity: "ആർദ്രത",
    weatherRisk: "വിള അപകടസാധ്യത",
    exportPdf: "PDF റിപ്പോർട്ട്",
    exportCsv: "CSV ഡാറ്റ",
    searchPlaceholder: "തിരയുക...",
    all: "എല്ലാം"
  },
  hi: {
    navSection: "नेविगेशन",
    alertCenter: "अलर्ट सेंटर",
    signOut: "साइन आउट",
    signIn: "साइन इन",
    cropsTitle: "फसल बाज़ार",
    allCropsTab: "सभी फसलें",
    mandiCompTab: "मंडी तुलना",
    liveTicker: "लाइव दरें",
    totalCrops: "कुल फसलें",
    trackedNationwide: "देशभर में ट्रैक्ड",
    currentPrice: "वर्तमान मूल्य",
    mspPrice: "एमएसपी मूल्य",
    govtMinimum: "सरकारी न्यूनतम दर",
    aiRecTitle: "एआई सिफारिश",
    confidence: "विश्वसनीयता",
    forecast30Day: "30-दिवसीय पूर्वानुमान",
    cropImpact: "फसल प्रभाव",
    viewForecastBtn: "पूर्वानुमान देखें →",
    lowRisk: "कम जोखिम",
    mediumRisk: "मध्यम जोखिम",
    highRisk: "उच्च जोखिम",
    buyAction: "खरीदें",
    holdAction: "होल्ड करें",
    sellAction: "बेचें",
    humidity: "नमी",
    weatherRisk: "फसल जोखिम",
    exportPdf: "पीडीएफ रिपोर्ट",
    exportCsv: "सीएसवी डेटा",
    searchPlaceholder: "फसल खोजें...",
    all: "सभी"
  }
};
