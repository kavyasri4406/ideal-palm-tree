import type { Localized } from "@/lib/i18n";

// Labels shared by the screens that show the price history and forecast

export const PRICE_LABELS = {
  official: { en: "Official", ta: "அதிகாரப்பூர்வ", te: "అధికారిక", kn: "ಅಧಿಕೃತ", ml: "ഔദ്യോഗികം", hi: "सरकारी" },
  forecast: { en: "Forecast", ta: "கணிப்பு", te: "అంచనా", kn: "ಮುನ್ಸೂಚನೆ", ml: "പ്രവചനം", hi: "पूर्वानुमान" },
  agmarknetPrice: { en: "Agmarknet price", ta: "Agmarknet விலை", te: "Agmarknet ధర", kn: "Agmarknet ಬೆಲೆ", ml: "Agmarknet വില", hi: "Agmarknet भाव" },
  stateMedian: { en: "state median", ta: "மாநில இடைநிலை விலை", te: "రాష్ట్ర మధ్యస్థ ధర", kn: "ರಾಜ್ಯ ಮಧ್ಯಮ ಬೆಲೆ", ml: "സംസ്ഥാന മധ്യവില", hi: "राज्य का मध्य भाव" },
  mandis: { en: "Mandis reporting", ta: "விலை அறிவித்த மண்டிகள்", te: "ధర నివేదించిన మండీలు", kn: "ಬೆಲೆ ವರದಿ ಮಾಡಿದ ಮಂಡಿಗಳು", ml: "വില റിപ്പോർട്ട് ചെയ്ത മണ്ടികൾ", hi: "भाव बताने वाली मंडियां" },
  loading: { en: "Loading official prices…", ta: "அதிகாரப்பூர்வ விலைகள் ஏற்றப்படுகின்றன…", te: "అధికారిక ధరలు లోడ్ అవుతున్నాయి…", kn: "ಅಧಿಕೃತ ಬೆಲೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ…", ml: "ഔദ്യോഗിക വിലകൾ ലോഡ് ചെയ്യുന്നു…", hi: "सरकारी भाव लोड हो रहे हैं…" },
  officialHistory: { en: "Official Agmarknet daily prices", ta: "அதிகாரப்பூர்வ Agmarknet தினசரி விலைகள்", te: "అధికారిక Agmarknet రోజువారీ ధరలు", kn: "ಅಧಿಕೃತ Agmarknet ದೈನಂದಿನ ಬೆಲೆಗಳು", ml: "ഔദ്യോഗിക Agmarknet പ്രതിദിന വിലകൾ", hi: "सरकारी Agmarknet दैनिक भाव" },
  simulatedHistory: {
    en: "Simulated prices — official history is not available for this crop here",
    ta: "மாதிரி விலைகள் — இந்தப் பயிருக்கு இங்கு அதிகாரப்பூர்வ வரலாறு இல்லை",
    te: "నమూనా ధరలు — ఈ పంటకు ఇక్కడ అధికారిక చరిత్ర అందుబాటులో లేదు",
    kn: "ಮಾದರಿ ಬೆಲೆಗಳು — ಈ ಬೆಳೆಗೆ ಇಲ್ಲಿ ಅಧಿಕೃತ ಇತಿಹಾಸ ಲಭ್ಯವಿಲ್ಲ",
    ml: "മാതൃകാ വിലകൾ — ഈ വിളയ്ക്ക് ഇവിടെ ഔദ്യോഗിക ചരിത്രം ലഭ്യമല്ല",
    hi: "नमूना भाव — इस फसल का सरकारी इतिहास यहां उपलब्ध नहीं है",
  },
  forecastBand: { en: "30-day forecast with 80% band", ta: "80% வரம்புடன் 30 நாள் கணிப்பு", te: "80% పరిధితో 30 రోజుల అంచనా", kn: "80% ವ್ಯಾಪ್ತಿಯೊಂದಿಗೆ 30 ದಿನಗಳ ಮುನ್ಸೂಚನೆ", ml: "80% പരിധിയോടെ 30 ദിവസത്തെ പ്രവചനം", hi: "80% सीमा के साथ 30 दिन का पूर्वानुमान" },
  history: { en: "history", ta: "வரலாறு", te: "చరిత్ర", kn: "ಇತಿಹಾಸ", ml: "ചരിത്രം", hi: "इतिहास" },
  backtestOfficial: { en: "14-day backtest on Agmarknet prices", ta: "Agmarknet விலைகளில் 14 நாள் பின்சோதனை", te: "Agmarknet ధరలపై 14 రోజుల బ్యాక్‌టెస్ట్", kn: "Agmarknet ಬೆಲೆಗಳ ಮೇಲೆ 14 ದಿನಗಳ ಬ್ಯಾಕ್‌ಟೆಸ್ಟ್", ml: "Agmarknet വിലകളിൽ 14 ദിവസത്തെ ബാക്ക്‌ടെസ്റ്റ്", hi: "Agmarknet भावों पर 14 दिन का बैकटेस्ट" },
  backtestSimulated: { en: "14-day backtest on simulated prices", ta: "மாதிரி விலைகளில் 14 நாள் பின்சோதனை", te: "నమూనా ధరలపై 14 రోజుల బ్యాక్‌టెస్ట్", kn: "ಮಾದರಿ ಬೆಲೆಗಳ ಮೇಲೆ 14 ದಿನಗಳ ಬ್ಯಾಕ್‌ಟೆಸ್ಟ್", ml: "മാതൃകാ വിലകളിൽ 14 ദിവസത്തെ ബാക്ക്‌ടെസ്റ്റ്", hi: "नमूना भावों पर 14 दिन का बैकटेस्ट" },
  rmse: { en: "Root Mean Squared Error", ta: "சராசரி வர்க்கப் பிழையின் வர்க்கமூலம்", te: "సగటు వర్గ దోషం యొక్క వర్గమూలం", kn: "ಸರಾಸರಿ ವರ್ಗ ದೋಷದ ವರ್ಗಮೂಲ", ml: "ശരാശരി വർഗ പിശകിന്റെ വർഗമൂലം", hi: "औसत वर्ग त्रुटि का वर्गमूल" },
  mape: { en: "Average % error", ta: "சராசரி % பிழை", te: "సగటు % దోషం", kn: "ಸರಾಸರಿ % ದೋಷ", ml: "ശരാശരി % പിശക്", hi: "औसत % त्रुटि" },
  naive: { en: "“no change” guess", ta: "“மாற்றமில்லை” யூகம்", te: "“మార్పు లేదు” అంచనా", kn: "“ಬದಲಾವಣೆ ಇಲ್ಲ” ಊಹೆ", ml: "“മാറ്റമില്ല” ഊഹം", hi: "“कोई बदलाव नहीं” अनुमान" },
  mandisOnlyOfficial: {
    en: "Mandi counts are shown only when official Agmarknet history is available.",
    ta: "அதிகாரப்பூர்வ Agmarknet வரலாறு இருக்கும்போது மட்டுமே மண்டி எண்ணிக்கை காட்டப்படும்.",
    te: "అధికారిక Agmarknet చరిత్ర ఉన్నప్పుడే మండీల సంఖ్య చూపబడుతుంది.",
    kn: "ಅಧಿಕೃತ Agmarknet ಇತಿಹಾಸ ಇದ್ದಾಗ ಮಾತ್ರ ಮಂಡಿಗಳ ಸಂಖ್ಯೆ ತೋರಿಸಲಾಗುತ್ತದೆ.",
    ml: "ഔദ്യോഗിക Agmarknet ചരിത്രം ഉള്ളപ്പോൾ മാത്രമേ മണ്ടികളുടെ എണ്ണം കാണിക്കൂ.",
    hi: "मंडियों की संख्या तभी दिखती है जब सरकारी Agmarknet इतिहास उपलब्ध हो।",
  },
} satisfies Record<string, Localized>;
