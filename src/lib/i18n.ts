import type { Language } from "@/lib/AppContext";

// Shared helpers for the six UI languages. Missing translations fall back to English.

export type Localized = { en: string } & Partial<Record<Exclude<Language, "en">, string>>;

/** Pick the string for the current language, falling back to English. */
export function tr(language: Language, text: Localized): string {
  return text[language] || text.en;
}

// Crop names for every language (crops in cropData only carry Tamil/Telugu names)
const CROP_NAMES: Record<string, Omit<Localized, "en">> = {
  rice: { ta: "நெல்", te: "వరి", kn: "ಭತ್ತ", ml: "നെല്ല്", hi: "धान" },
  wheat: { ta: "கோதுமை", te: "గోధుమ", kn: "ಗೋಧಿ", ml: "ഗോതമ്പ്", hi: "गेहूं" },
  corn: { ta: "மக்காச்சோளம்", te: "మొక్కజొన్న", kn: "ಮೆಕ್ಕೆಜೋಳ", ml: "ചോളം", hi: "मक्का" },
  mustard: { ta: "கடுகு", te: "ఆవాలు", kn: "ಸಾಸಿವೆ", ml: "കടുക്", hi: "सरसों" },
  soybean: { ta: "சோயாபீன்", te: "సోయాబీన్", kn: "ಸೋಯಾಬೀನ್", ml: "സോയാബീൻ", hi: "सोयाबीन" },
  groundnut: { ta: "நிலக்கடலை", te: "వేరుశెనగ", kn: "ಕಡಲೆಕಾಯಿ", ml: "നിലക്കടല", hi: "मूंगफली" },
  sugarcane: { ta: "கரும்பு", te: "చెరకు", kn: "ಕಬ್ಬು", ml: "കരിമ്പ്", hi: "गन्ना" },
  cotton: { ta: "பருத்தி", te: "పత్తి", kn: "ಹತ್ತಿ", ml: "പരുത്തി", hi: "कपास" },
  tomato: { ta: "தக்காளி", te: "టమాటా", kn: "ಟೊಮೆಟೊ", ml: "തക്കാളി", hi: "टमाटर" },
  onion: { ta: "வெங்காயம்", te: "ఉల్లిపాయ", kn: "ಈರುಳ್ಳಿ", ml: "ഉള്ളി", hi: "प्याज" },
  potato: { ta: "உருளைக்கிழங்கு", te: "బంగాళదుంప", kn: "ಆಲೂಗಡ್ಡೆ", ml: "ഉരുളക്കിഴങ്ങ്", hi: "आलू" },
  gram: { ta: "கொண்டைக்கடலை", te: "శనగలు", kn: "ಕಡಲೆ", ml: "കടല", hi: "चना" },
  tur: { ta: "துவரம் பருப்பு", te: "కందిపప్పు", kn: "ತೊಗರಿ ಬೇಳೆ", ml: "തുവര പരിപ്പ്", hi: "अरहर दाल" },
  moong: { ta: "பச்சைப்பயறு", te: "పెసరపప్పు", kn: "ಹೆಸರು ಬೇಳೆ", ml: "ചെറുപയർ", hi: "मूंग दाल" },
  banana: { ta: "வாழைப்பழம்", te: "అరటి", kn: "ಬಾಳೆಹಣ್ಣು", ml: "വാഴപ്പഴം", hi: "केला" },
  mango: { ta: "மாம்பழம்", te: "మామిడి", kn: "ಮಾವು", ml: "മാങ്ങ", hi: "आम" },
  turmeric: { ta: "மஞ்சள்", te: "పసుపు", kn: "ಅರಿಶಿನ", ml: "മഞ്ഞൾ", hi: "हल्दी" },
  chilli: { ta: "மிளகாய்", te: "మిరప", kn: "ಮೆಣಸಿನಕಾಯಿ", ml: "മുളക്", hi: "लाल मिर्च" },
  cabbage: { ta: "முட்டைக்கோஸ்", te: "క్యాబేజీ", kn: "ಎಲೆಕೋಸು", ml: "കാബേജ്", hi: "पत्तागोभी" },
  cauliflower: { ta: "காலிஃபிளவர்", te: "కాలీఫ్లవర్", kn: "ಹೂಕೋಸು", ml: "കോളിഫ്ലവർ", hi: "फूलगोभी" },
  eggplant: { ta: "கத்தரிக்காய்", te: "వంకాయ", kn: "ಬದನೆಕಾಯಿ", ml: "വഴുതനങ്ങ", hi: "बैंगन" },
  okra: { ta: "வெண்டைக்காய்", te: "బెండకాయ", kn: "ಬೆಂಡೆಕಾಯಿ", ml: "വെണ്ടയ്ക്ക", hi: "भिंडी" },
  carrot: { ta: "கேரட்", te: "క్యారెట్", kn: "ಗಜ್ಜರಿ", ml: "കാരറ്റ്", hi: "गाजर" },
  apple: { ta: "ஆப்பிள்", te: "ఆపిల్", kn: "ಸೇಬು", ml: "ആപ്പിൾ", hi: "सेब" },
  papaya: { ta: "பப்பாளி", te: "బొప్పాయి", kn: "ಪಪ್ಪಾಯಿ", ml: "പപ്പായ", hi: "पपीता" },
  orange: { ta: "ஆரஞ்சு", te: "నారింజ", kn: "ಕಿತ್ತಳೆ", ml: "ഓറഞ്ച്", hi: "संतरा" },
  grape: { ta: "திராட்சை", te: "ద్రాక్ష", kn: "ದ್ರಾಕ್ಷಿ", ml: "മുന്തിരി", hi: "अंगूर" },
  pomegranate: { ta: "மாதுளை", te: "దానిమ్మ", kn: "ದಾಳಿಂಬೆ", ml: "മാതളനാരങ്ങ", hi: "अनार" },
};

/** Localized crop name, e.g. cropName({ id: "rice", name: "Rice (Paddy)" }, "hi") → "धान". */
export function cropName(crop: { id: string; name: string }, language: Language): string {
  if (language === "en") return crop.name;
  return CROP_NAMES[crop.id]?.[language] || crop.name;
}

const CATEGORY_NAMES: Record<string, Omit<Localized, "en">> = {
  "All": { ta: "அனைத்தும்", te: "అన్నీ", kn: "ಎಲ್ಲಾ", ml: "എല്ലാം", hi: "सभी" },
  "Cereals": { ta: "தானியங்கள்", te: "ధాన్యాలు", kn: "ಧಾನ್ಯಗಳು", ml: "ധാന്യങ്ങൾ", hi: "अनाज" },
  "Oilseeds": { ta: "எண்ணெய் வித்துக்கள்", te: "నూనె గింజలు", kn: "ಎಣ್ಣೆಕಾಳುಗಳು", ml: "എണ്ണക്കുരുക്കൾ", hi: "तिलहन" },
  "Cash Crops": { ta: "பணப் பயிர்கள்", te: "వాణిజ్య పంటలు", kn: "ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು", ml: "നാണ്യവിളകൾ", hi: "नकदी फसलें" },
  "Vegetables": { ta: "காய்கறிகள்", te: "కూరగాయలు", kn: "ತರಕಾರಿಗಳು", ml: "പച്ചക്കറികൾ", hi: "सब्जियां" },
  "Pulses": { ta: "பருப்பு வகைகள்", te: "పప్పుధాన్యాలు", kn: "ದ್ವಿದಳ ಧಾನ್ಯಗಳು", ml: "പയർവർഗങ്ങൾ", hi: "दालें" },
  "Fruits": { ta: "பழங்கள்", te: "పండ్లు", kn: "ಹಣ್ಣುಗಳು", ml: "പഴങ്ങൾ", hi: "फल" },
  "Spices": { ta: "மசாலா பொருட்கள்", te: "సుగంధ ద్రవ్యాలు", kn: "ಮಸಾಲೆಗಳು", ml: "സുഗന്ധവ്യഞ്ജനങ്ങൾ", hi: "मसाले" },
};

/** Localized crop category ("Cereals", "Fruits", …, and "All"). */
export function categoryName(category: string, language: Language): string {
  if (language === "en") return category;
  return CATEGORY_NAMES[category]?.[language] || category;
}
