export interface CropVariety {
  id: string;
  name: string;
  nameTA?: string;
  nameTE?: string;
  nameKN?: string;
  nameML?: string;
  nameHI?: string;
  mandiPricePerKg?: number;
  mandiPricePerQuintal?: number;
  pricePerKg: number;
  pricePerQuintal: number;
  originState: string;
  characteristics: string;
  characteristicsTA?: string;
  characteristicsTE?: string;
  characteristicsKN?: string;
  characteristicsML?: string;
  characteristicsHI?: string;
  season: string;
}

export interface Crop {
  id: string;
  name: string;
  nameTA: string; // Tamil
  nameTE: string; // Telugu
  nameKN?: string; // Kannada
  nameML?: string; // Malayalam
  nameHI?: string; // Hindi
  category: string;
  unit: string;
  basePrice: number;
  emoji: string;
  image: string; // Unsplash URL
  description: string;
  descTA: string;
  descTE: string;
  season: string;
  states: string[];
  msp: number;
  color: string; // card accent color
  varieties?: CropVariety[];
}

export const CROPS: Crop[] = [
  {
    id: "rice", name: "Rice (Paddy)", nameTA: "நெல்", nameTE: "వరి",
    varieties: [{"id": "basmati_1121", "mandiPricePerKg": 65, "mandiPricePerQuintal": 6500, "name": "Basmati 1121 (Extra Long Grain)", "nameTA": "பாஸ்மதி 1121 அரிசி", "nameTE": "బాస్మతి 1121 బియ్యం", "nameKN": "ಬಾಸ್ಮತಿ 1121 ಅಕ್ಕಿ", "nameML": "ബസ്മതി 1121 അരി", "nameHI": "बासमती 1121 (एक्स्ट्रा लॉन्ग)", "pricePerKg": 95, "pricePerQuintal": 9500, "originState": "Punjab & Haryana", "characteristics": "Aromatic long grain, expands twice upon cooking, premium export rice", "characteristicsTA": "நறுமணமுள்ள நீண்ட அரிசி, சமைத்தால் இருமடங்கு நீளும், உயர்தர ஏற்றுமதி அரிசி", "characteristicsTE": "సువాసనగల పొడవైన గింజ, వండితే రెట్టింపు పొడవు పెరుగుతుంది, ప్రీమియం ఎగుమతి బియ్యం", "characteristicsKN": "ಸುವಾಸನೆಯುಳ್ಳ ಉದ್ದ ಕಾಳು, ಬೇಯಿಸಿದಾಗ ಎರಡು ಪಟ್ಟು ಉದ್ದವಾಗುತ್ತದೆ, ಉತ್ತಮ ರಫ್ತು ಅಕ್ಕಿ", "characteristicsML": "സുഗന്ധമുള്ള നീളൻ അരി, വേവിക്കുമ്പോൾ ഇരട്ടി നീളം വയ്ക്കും, മികച്ച കയറ്റുമതി അരി", "characteristicsHI": "सुगंधित लंबा दाना, पकाने पर दोगुना बढ़ता है, प्रीमियम निर्यात चावल", "season": "Kharif"}, {"id": "sona_masoori", "mandiPricePerKg": 32, "mandiPricePerQuintal": 3200, "name": "Sona Masoori (BPT 5204)", "nameTA": "சோனா மசூரி அரிசி", "nameTE": "సోనా మసూరి (BPT 5204)", "nameKN": "ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ", "nameML": "സോനാ മസൂരി അരി", "nameHI": "सोना मसूरी चावल", "pricePerKg": 48, "pricePerQuintal": 4800, "originState": "Andhra Pradesh & Karnataka", "characteristics": "Lightweight, low starch, aromatic medium grain, daily South Indian staple", "characteristicsTA": "எடை குறைந்த, குறைந்த மாவுச்சத்து கொண்ட நறுமண நடுத்தர அரிசி, தென்னிந்தியாவின் அன்றாட உணவு", "characteristicsTE": "తేలికైన, తక్కువ పిండి పదార్థం గల సువాసన మధ్యస్థ గింజ, దక్షిణ భారత నిత్య ఆహారం", "characteristicsKN": "ಹಗುರ, ಕಡಿಮೆ ಪಿಷ್ಟದ ಸುವಾಸನೆಯುಳ್ಳ ಮಧ್ಯಮ ಕಾಳು, ದಕ್ಷಿಣ ಭಾರತದ ದೈನಂದಿನ ಆಹಾರ", "characteristicsML": "ഭാരം കുറഞ്ഞ, അന്നജം കുറവുള്ള സുഗന്ധമുള്ള ഇടത്തരം അരി, ദക്ഷിണേന്ത്യയുടെ നിത്യാഹാരം", "characteristicsHI": "हल्का, कम स्टार्च वाला सुगंधित मध्यम दाना, दक्षिण भारत का रोज़ का मुख्य भोजन", "season": "Kharif"}],
    category: "Cereals", unit: "quintal", basePrice: 2441, emoji: "🌾",
    image: "https://images.unsplash.com/photo-1604384041761-71d680147eb7?w=500&h=320&fit=crop&q=80",
    description: "India's most important food crop grown in flooded fields",
    descTA: "நீர்வயல்களில் வளரும் இந்தியாவின் மிக முக்கியமான உணவு தானியம்",
    descTE: "నీటి పొలాల్లో పండించే భారతదేశపు అతి ముఖ్యమైన ఆహార పంట",
    season: "Kharif", states: ["West Bengal", "Punjab", "Andhra Pradesh", "Tamil Nadu"], msp: 2441, color: "#F5C842"
  },
  {
    id: "wheat", name: "Wheat", nameTA: "கோதுமை", nameTE: "గోధుమ",
    category: "Cereals", unit: "quintal", basePrice: 2610, emoji: "🌾",
    image: "https://images.unsplash.com/photo-1595976281013-8024ecc02575?w=500&h=320&fit=crop&q=80",
    description: "Winter crop, the major rabi cereal of north India",
    descTA: "வட இந்தியாவின் முக்கிய ராபி தானியம்",
    descTE: "ఉత్తర భారతదేశపు ప్రధాన రబీ ధాన్యం",
    season: "Rabi", states: ["Punjab", "Haryana", "Uttar Pradesh", "MP"], msp: 2610, color: "#E8B56A"
  },
  {
    id: "corn", name: "Corn (Maize)", nameTA: "மக்காச்சோளம்", nameTE: "మొక్కజొన్న",
    varieties: [{"id": "sweet_corn", "mandiPricePerKg": 14, "mandiPricePerQuintal": 1400, "name": "American Sweet Corn", "nameTA": "இனிப்பு மக்காச்சோளம்", "nameTE": "స్వీట్ కార్న్", "nameKN": "ಸ್ವೀಟ್ ಕಾರ್ನ್", "nameML": "സ്വീറ്റ് കോൺ", "nameHI": "स्वीट कॉर्न", "pricePerKg": 30, "pricePerQuintal": 3000, "originState": "Karnataka & Maharashtra", "characteristics": "High sugar content, tender golden kernels, popular for snacking & boiling", "characteristicsTA": "அதிக இனிப்புச் சத்து, மென்மையான பொன்னிற மணிகள், அவித்து சாப்பிட பிரபலம்", "characteristicsTE": "అధిక చక్కెర శాతం, మెత్తని బంగారు రంగు గింజలు, ఉడకబెట్టి తినడానికి ప్రసిద్ధి", "characteristicsKN": "ಹೆಚ್ಚಿನ ಸಕ್ಕರೆ ಅಂಶ, ಮೃದುವಾದ ಚಿನ್ನದ ಬಣ್ಣದ ಕಾಳುಗಳು, ಬೇಯಿಸಿ ತಿನ್ನಲು ಜನಪ್ರಿಯ", "characteristicsML": "ഉയർന്ന മധുരം, മൃദുവായ സ്വർണ്ണനിറമുള്ള മണികൾ, പുഴുങ്ങി കഴിക്കാൻ പ്രിയം", "characteristicsHI": "अधिक मिठास, मुलायम सुनहरे दाने, नाश्ते और उबालकर खाने के लिए लोकप्रिय", "season": "Kharif / Rabi"}, {"id": "flint_corn", "mandiPricePerKg": 17, "mandiPricePerQuintal": 1700, "name": "Desi Yellow Maize (Feed & Starch)", "nameTA": "நாட்டு மக்காச்சோளம்", "nameTE": "దేశీ పసుపు మొక్కజొన్న", "nameKN": "ನಾಟಿ ಮೆಕ್ಕೆಜೋಳ", "nameML": "നാടൻ ചോളം", "nameHI": "देशी पीली मक्का", "pricePerKg": 22, "pricePerQuintal": 2200, "originState": "Andhra Pradesh & Telangana", "characteristics": "Hard grain, high starch, primary choice for poultry feed & ethanol", "characteristicsTA": "கடினமான மணி, அதிக மாவுச்சத்து, கோழித் தீவனம் மற்றும் எத்தனால் தயாரிப்புக்கு முதன்மைத் தேர்வு", "characteristicsTE": "గట్టి గింజ, అధిక పిండి పదార్థం, కోళ్ల దాణా మరియు ఇథనాల్ తయారీకి ప్రధాన ఎంపిక", "characteristicsKN": "ಗಟ್ಟಿ ಕಾಳು, ಹೆಚ್ಚಿನ ಪಿಷ್ಟ, ಕೋಳಿ ಆಹಾರ ಮತ್ತು ಎಥೆನಾಲ್‌ಗೆ ಪ್ರಮುಖ ಆಯ್ಕೆ", "characteristicsML": "കട്ടിയുള്ള മണി, ഉയർന്ന അന്നജം, കോഴിത്തീറ്റയ്ക്കും എഥനോളിനും പ്രധാന ഇനം", "characteristicsHI": "सख्त दाना, अधिक स्टार्च, मुर्गी दाने और इथेनॉल के लिए पहली पसंद", "season": "Kharif"}],
    category: "Cereals", unit: "quintal", basePrice: 2410, emoji: "🌽",
    image: "https://images.unsplash.com/photo-1599138900450-3d06e89ad309?w=500&h=320&fit=crop&q=80",
    description: "Versatile cereal used as food, feed and in industries",
    descTA: "உணவு, தீவனம் மற்றும் தொழில்துறைகளில் பயன்படும் பயிர்",
    descTE: "ఆహారం, పశుగ్రాసం మరియు పరిశ్రమలలో ఉపయోగించే బహుముఖ పంట",
    season: "Kharif", states: ["Karnataka", "Andhra Pradesh", "Maharashtra", "Bihar"], msp: 2410, color: "#F7C36A"
  },
  {
    id: "mustard", name: "Mustard", nameTA: "கடுகு", nameTE: "ఆవాలు",
    category: "Oilseeds", unit: "quintal", basePrice: 6613, emoji: "🌼",
    image: "https://images.unsplash.com/photo-1570592366025-1e955e47796d?w=500&h=320&fit=crop&q=80",
    description: "Major rabi oilseed crop, used for mustard oil",
    descTA: "கடுகு எண்ணெய்க்காக பயிரிடப்படும் முக்கிய ராபி எண்ணெய் வித்து",
    descTE: "ఆవ నూనె కోసం పండించే ముఖ్యమైన రబీ నూనెగింజ పంట",
    season: "Rabi", states: ["Rajasthan", "Uttar Pradesh", "Haryana", "MP"], msp: 6613, color: "#F0D020"
  },
  {
    id: "soybean", name: "Soybean", nameTA: "சோயாபீன்", nameTE: "సోయాబీన్",
    category: "Oilseeds", unit: "quintal", basePrice: 5708, emoji: "🌱",
    image: "https://images.unsplash.com/photo-1729015224555-50047f2fdb94?w=500&h=320&fit=crop&q=80",
    description: "High-protein kharif oilseed with growing demand",
    descTA: "அதிக புரத அளவு கொண்ட கரீஃப் எண்ணெய் வித்து",
    descTE: "అధిక ప్రోటీన్ కలిగిన ఖరీఫ్ నూనెగింజ పంట",
    season: "Kharif", states: ["Madhya Pradesh", "Maharashtra", "Rajasthan"], msp: 5708, color: "#A8C060"
  },
  {
    id: "groundnut", name: "Groundnut", nameTA: "நிலக்கடலை", nameTE: "వేరుశెనగ",
    category: "Oilseeds", unit: "quintal", basePrice: 7517, emoji: "🥜",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Peanuts_in_shells.jpg/500px-Peanuts_in_shells.jpg",
    description: "Major oilseed crop with high oil content and protein",
    descTA: "அதிக எண்ணெய் மற்றும் புரதம் கொண்ட முக்கிய எண்ணெய் வித்து",
    descTE: "అధిక నూనె మరియు ప్రోటీన్ కలిగిన ముఖ్యమైన నూనెగింజ పంట",
    season: "Kharif", states: ["Gujarat", "Andhra Pradesh", "Tamil Nadu", "Karnataka"], msp: 7517, color: "#C8A86A"
  },
  {
    id: "sugarcane", name: "Sugarcane", nameTA: "கரும்பு", nameTE: "చెరకు",
    varieties: [{"id": "co_0238", "mandiPricePerKg": 3.2, "mandiPricePerQuintal": 320, "name": "Co 0238 High-Yield Cane", "nameTA": "Co 0238 கரும்பு", "nameTE": "Co 0238 చెరకు", "nameKN": "Co 0238 ಕಬ್ಬು", "nameML": "Co 0238 കരിമ്പ്", "nameHI": "Co 0238 गन्ना (उच्च रिकवरी)", "pricePerKg": 3.8, "pricePerQuintal": 380, "originState": "Uttar Pradesh & Maharashtra", "characteristics": "High sugar recovery (>12%), thick canes, high tonnage per acre", "characteristicsTA": "அதிக சர்க்கரை கட்டுமானம் (>12%), தடிமனான கரும்புகள், ஏக்கருக்கு அதிக டன் மகசூல்", "characteristicsTE": "అధిక చక్కెర రికవరీ (>12%), లావైన గడలు, ఎకరానికి అధిక టన్నుల దిగుబడి", "characteristicsKN": "ಹೆಚ್ಚಿನ ಸಕ್ಕರೆ ಇಳುವರಿ (>12%), ದಪ್ಪ ಕಬ್ಬು, ಎಕರೆಗೆ ಹೆಚ್ಚು ಟನ್ ಇಳುವರಿ", "characteristicsML": "ഉയർന്ന പഞ്ചസാര വീണ്ടെടുപ്പ് (>12%), കട്ടിയുള്ള കരിമ്പ്, ഏക്കറിന് ഉയർന്ന ടൺ വിളവ്", "characteristicsHI": "उच्च चीनी रिकवरी (>12%), मोटे गन्ने, प्रति एकड़ अधिक टन उपज", "season": "Annual"}, {"id": "co_8603", "mandiPricePerKg": 3.0, "mandiPricePerQuintal": 300, "name": "Co 8603 (Amritha)", "nameTA": "Co 8603 (அமிர்தா கரும்பு)", "nameTE": "Co 8603 చెరకు", "nameKN": "Co 8603 ಕಬ್ಬು", "nameML": "Co 8603 കരിമ്പ്", "nameHI": "Co 8603 (अमृता)", "pricePerKg": 3.6, "pricePerQuintal": 360, "originState": "Tamil Nadu & Karnataka", "characteristics": "Drought tolerant, excellent jaggery (gur) yield, ratoon friendly", "characteristicsTA": "வறட்சியைத் தாங்கும், சிறந்த வெல்ல மகசூல், மறுதாம்பு பயிருக்கு ஏற்றது", "characteristicsTE": "కరువును తట్టుకుంటుంది, అద్భుతమైన బెల్లం దిగుబడి, కార్శి పంటకు అనుకూలం", "characteristicsKN": "ಬರ ಸಹಿಷ್ಣು, ಉತ್ತಮ ಬೆಲ್ಲದ ಇಳುವರಿ, ಕೂಳೆ ಬೆಳೆಗೆ ಸೂಕ್ತ", "characteristicsML": "വരൾച്ചയെ ചെറുക്കും, മികച്ച ശർക്കര വിളവ്, റാറ്റൂൺ കൃഷിക്ക് അനുയോജ്യം", "characteristicsHI": "सूखा सहनशील, उत्कृष्ट गुड़ उपज, पेड़ी (रैटून) फसल के लिए उपयुक्त", "season": "Annual"}],
    category: "Cash Crops", unit: "quintal", basePrice: 365, emoji: "🎋",
    image: "https://images.unsplash.com/photo-1606707718537-af0e5460849b?w=500&h=320&fit=crop&q=80",
    description: "Commercial crop for sugar production and ethanol",
    descTA: "சர்க்கரை உற்பத்திக்கான வணிகப் பயிர்",
    descTE: "చక్కెర ఉత్పత్తికి మరియు ఇథనాల్ కోసం ఉపయోగించే వాణిజ్య పంట",
    season: "Annual", states: ["Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu"], msp: 365, color: "#70B870"
  },
  {
    id: "cotton", name: "Cotton", nameTA: "பருத்தி", nameTE: "పత్తి",
    varieties: [{"id": "bt_cotton", "mandiPricePerKg": 62, "mandiPricePerQuintal": 6200, "name": "Bt Cotton (Bollgard II)", "nameTA": "பி.டி பருத்தி", "nameTE": "బి.టి పత్తి", "nameKN": "ಬಿ.ಟಿ ಹತ್ತಿ", "nameML": "ബി.ടി പരുത്തി", "nameHI": "बीटी कपास (बोलगार्ड II)", "pricePerKg": 75, "pricePerQuintal": 7500, "originState": "Gujarat & Telangana", "characteristics": "Long staple fiber, bollworm resistant, high ginning percentage", "characteristicsTA": "நீண்ட இழை பருத்தி, காய்ப்புழு எதிர்ப்புத் திறன், அதிக பஞ்சு அரவைத் திறன்", "characteristicsTE": "పొడవైన పింజ, కాయ తొలుచు పురుగు నిరోధకత, అధిక జిన్నింగ్ శాతం", "characteristicsKN": "ಉದ್ದನೆಯ ಎಳೆ ನಾರು, ಕಾಯಿಕೊರಕ ಹುಳು ನಿರೋಧಕ, ಹೆಚ್ಚಿನ ಜಿನ್ನಿಂಗ್ ಶೇಕಡಾವಾರು", "characteristicsML": "നീളമുള്ള നാര്, കായ്‌തുരപ്പൻ പുഴുവിനെ പ്രതിരോധിക്കും, ഉയർന്ന ജിന്നിംഗ് ശതമാനം", "characteristicsHI": "लंबा रेशा, सुंडी (बॉलवर्म) प्रतिरोधी, अधिक जिनिंग प्रतिशत", "season": "Kharif"}],
    category: "Cash Crops", unit: "quintal", basePrice: 8267, emoji: "☁️",
    image: "https://images.unsplash.com/photo-1720723444133-1707028c3e13?w=500&h=320&fit=crop&q=80",
    description: "White gold — the major textile fiber crop of India",
    descTA: "வெள்ளை தங்கம் — இந்தியாவின் முக்கிய நூலிழை பயிர்",
    descTE: "తెల్ల బంగారం — భారతదేశపు ప్రధాన వస్త్ర నార పంట",
    season: "Kharif", states: ["Gujarat", "Maharashtra", "Andhra Pradesh", "Telangana"], msp: 8267, color: "#F0F0E8"
  },
  {
    id: "tomato", name: "Tomato", nameTA: "தக்காளி", nameTE: "టమాటా",
    varieties: [{"id": "desi_hybrid", "name": "Desi / Country Tomato", "nameTA": "நாட்டு தக்காளி", "nameTE": "నాటు టమాటా", "nameKN": "ನಾಟಿ ಟೊಮೆಟೊ", "nameML": "നാടൻ തക്കാളി", "nameHI": "देशी टमाटर", "pricePerKg": 35, "pricePerQuintal": 3500, "originState": "Andhra Pradesh & Karnataka", "characteristics": "Sour-tangy taste, juicy pulp, thin skin, essential for curries & rasam", "characteristicsTA": "புளிப்பு சுவை, அதிக சாறு, ரசம் மற்றும் குழம்புகளுக்கு ஏற்றது", "characteristicsTE": "పుల్లని రుచి, రసం మరియు కర్రీలకు ఉత్తమం", "characteristicsKN": "ಹುಳಿ ರುಚಿ, ಸಾಂಬಾರ್ ಮತ್ತು ರಸಂಗೆ ಸೂಕ್ತ", "characteristicsML": "പുളിരുചിയുള്ള നാടൻ ഇനം", "characteristicsHI": "खट्टा-चटपटा स्वाद, रसीला गूदा, करी और रसम के लिए आवश्यक", "season": "All Year"}, {"id": "roma_hybrid", "name": "Roma / Hybrid Salad Tomato", "nameTA": "ஹைப்ரிட் தக்காளி", "nameTE": "హైబ్రిడ్ టమాటా", "nameKN": "ಹೈಬ್ರಿಡ್ ಟೊಮೆಟೊ", "nameML": "ഹൈബ്രിഡ് തക്കാളി", "nameHI": "हाइब्रिड सलाद टमाटर (रोमा)", "pricePerKg": 28, "pricePerQuintal": 2800, "originState": "Maharashtra & Karnataka", "characteristics": "Thick firm skin, long shelf life, ideal for long-distance transport", "characteristicsTA": "தடிமனான தோல், நீண்ட நாட்கள் கெடாமல் இருக்கும்", "characteristicsTE": "మందపాటి చర్మం, ఎక్కువ నిల్వ కాలం", "characteristicsKN": "ಮಂದವಾದ ಸಿಪ್ಪೆ, ದೀರ್ಘ ಬಾಳಿಕೆ", "characteristicsML": "കൂടുതൽ നാൾ കേടാകാതിരിക്കും", "characteristicsHI": "मोटी सख्त त्वचा, लंबी शेल्फ लाइफ, लंबी दूरी के परिवहन के लिए सही", "season": "All Year"}],
    category: "Vegetables", unit: "quintal", basePrice: 2500, emoji: "🍅",
    image: "https://images.unsplash.com/photo-1582284540020-8acbe03fec75?w=500&h=320&fit=crop&q=80",
    description: "High-value vegetable with very volatile market prices",
    descTA: "மிக அதிக விலை ஏற்ற இறக்கங்கள் உள்ள காய்கறி",
    descTE: "అత్యధిక ధర హెచ్చుతగ్గులు కలిగిన కూరగాయ పంట",
    season: "Annual", states: ["Andhra Pradesh", "Karnataka", "Maharashtra", "Tamil Nadu"], msp: 0, color: "#E85C45"
  },
  {
    id: "onion", name: "Onion", nameTA: "வெங்காயம்", nameTE: "ఉల్లిపాయ",
    varieties: [{"id": "nashik_red", "name": "Nashik Red Onion", "nameTA": "நாசிக் பெரிய வெங்காயம்", "nameTE": "నాశిక్ ఎర్ర ఉల్లిపాయ", "nameKN": "ನಾಸಿಕ್ ಕೆಂಪು ಈರುಳ್ಳಿ", "nameML": "നാസിക് സവാള", "nameHI": "नासिक लाल प्याज", "pricePerKg": 32, "pricePerQuintal": 3200, "originState": "Nashik, Maharashtra", "characteristics": "Pungent spicy flavor, dark red skin, benchmark onion of India", "characteristicsTA": "காரமான சுவை, அடர் சிவப்பு தோல்", "characteristicsTE": "ఘాటైన రుచి, ముదురు ఎరుపు చర్మం", "characteristicsKN": "ಖಾರವಾದ ರುಚಿ, ಗಡಸು ಕೆಂಪು ಸಿಪ್ಪೆ", "characteristicsML": "എരിവുള്ള സവാള", "characteristicsHI": "तीखा तीखा स्वाद, गहरा लाल छिलका, भारत का मुख्य प्याज", "season": "Rabi / Kharif"}, {"id": "shallots_podisu", "name": "Shallots / Sambar Small Onion (Podisu)", "nameTA": "சின்ன வெங்காயம்", "nameTE": "సాంబార్ చిన్న ఉల్లిపాయలు", "nameKN": "ಸಾಂಬಾರ್ ಸಣ್ಣ ಈರುಳ್ಳಿ", "nameML": "ചെറിയ ഉള്ളി (ചുവന്നുള്ളി)", "nameHI": "सांभर छोटा प्याज (शैलॉट्स)", "pricePerKg": 55, "pricePerQuintal": 5500, "originState": "Perambalur, Tamil Nadu", "characteristics": "Small clusters, intense aroma & medicinal taste, South Indian cooking staple", "characteristicsTA": "சிறிய வடிவம், சாம்பாருக்கு சிறந்த நறுமணம் மற்றும் மருத்துவ குணம்", "characteristicsTE": "చిన్న పరిమాణం, సాంబార్ కోసం శ్రేష్ఠమైనది", "characteristicsKN": "ಸಾಂಬಾರ್ ಮಾಡಲು ಅತ್ಯುತ್ತಮ ಸಣ್ಣ ಈರುಳ್ಳಿ", "characteristicsML": "സാമ്പാറിനും ഔഷധ ആവശ്യങ്ങൾക്കും ഉത്തമം", "characteristicsHI": "छोटे गुच्छे, तीव्र सुगंध और औषधीय स्वाद, दक्षिण भारतीय भोजन का मुख्य अंग", "season": "All Year"}],
    category: "Vegetables", unit: "quintal", basePrice: 3000, emoji: "🧅",
    image: "https://images.unsplash.com/photo-1587049352851-d4814349319b?w=500&h=320&fit=crop&q=80",
    description: "Essential vegetable, prices highly seasonal and volatile",
    descTA: "அத்தியாவசிய காய்கறி, மிகவும் பருவகால விலை ஏற்ற இறக்கங்கள்",
    descTE: "చాలా కాల వ్యవధి ధర హెచ్చుతగ్గులు కలిగిన ప్రధాన వంట దినుసు",
    season: "Rabi/Kharif", states: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Gujarat"], msp: 0, color: "#C890A0"
  },
  {
    id: "potato", name: "Potato", nameTA: "உருளைக்கிழங்கு", nameTE: "బంగాళదుంప",
    varieties: [{"id": "kufri_jyoti", "name": "Kufri Jyoti Potato", "nameTA": "குஃப்ரி ஜோதி உருளைக்கிழங்கு", "nameTE": "కుఫ్రీ జ్యోతి బంగాళాదుంప", "nameKN": "ಕುಫ್ರಿ ಜ್ಯೋತಿ ಆಲೂಗಡ್ಡೆ", "nameML": "കുഫ്രി ജ്യോതി ഉരുളക്കിഴങ്ങ്", "nameHI": "कुफरी ज्योति आलू", "pricePerKg": 24, "pricePerQuintal": 2400, "originState": "West Bengal & Punjab", "characteristics": "Oval smooth skin, excellent cooking quality for curry & boiling", "characteristicsTA": "மென்மையான தோல், சமையலுக்கு மிகவும் சிறந்தது", "characteristicsTE": "మృదువైన చర్మం, వంటకు శ్రేష్ఠమైనది", "characteristicsKN": "ನಯವಾದ ಸಿಪ್ಪೆ, ಅಡುಗೆ ಮಾಡಲು ಅತ್ಯುತ್ತಮ", "characteristicsML": "പാചകത്തിന് ഉത്തമം", "characteristicsHI": "अंडाकार चिकनी त्वचा, करी और उबालने के लिए बेहतरीन गुणवत्ता", "season": "November - March"}, {"id": "chipsona", "name": "Kufri Chipsona (Processing Grade)", "nameTA": "சிப்சோனா உருளைக்கிழங்கு", "nameTE": "చిప్సోనా బంగాళాదుంప", "nameKN": "ಚಿಪ್ಸೋನಾ ಆಲೂಗಡ್ಡೆ", "nameML": "ചിപ്സോന ഉരുളക്കിഴങ്ങ്", "nameHI": "कुफरी चिप्सोना (प्रोसेसिंग आलू)", "pricePerKg": 28, "pricePerQuintal": 2800, "originState": "Uttar Pradesh & Gujarat", "characteristics": "High dry matter, low sugar, preferred choice for chips & French fries", "characteristicsTA": "சிப்ஸ் தயாரிக்க உகந்த தரமான உருளைக்கிழங்கு", "characteristicsTE": "చిప్స్ తయారీకి అనుకూలమైనది", "characteristicsKN": "ಚಿಪ್ಸ್ ಮಾಡಲು ಸೂಕ್ತವಾದ ತಳಿ", "characteristicsML": "ചിപ്സ് നിർമ്മാണത്തിന് ഉത്തമം", "characteristicsHI": "उच्च शुष्क पदार्थ, कम शर्करा, चिप्स और वेफर्स के लिए पहली पसंद", "season": "December - April"}],
    category: "Vegetables", unit: "quintal", basePrice: 1844, emoji: "🥔",
    image: "https://images.unsplash.com/photo-1590311824863-1499596e7308?w=500&h=320&fit=crop&q=80",
    description: "Most consumed vegetable, grown widely in north India",
    descTA: "வட இந்தியாவில் பரவலாக பயிரிடப்படும் மிக அதிகமாக உட்கொள்ளப்படும் காய்கறி",
    descTE: "విస్తృతంగా పండించే దుంప పంట",
    season: "Rabi", states: ["Uttar Pradesh", "West Bengal", "Bihar", "Punjab"], msp: 0, color: "#C8A86A"
  },
  {
    id: "gram", name: "Gram (Chana)", nameTA: "கொண்டைக்கடலை", nameTE: "శనగలు",
    category: "Pulses", unit: "quintal", basePrice: 5958, emoji: "🌱",
    image: "https://images.unsplash.com/photo-1677887736557-a461460caaf6?w=500&h=320&fit=crop&q=80",
    description: "Major rabi pulse, high in protein and fiber",
    descTA: "அதிக புரதம் மற்றும் நார்ச்சத்து கொண்ட முக்கிய ராபி பயறு",
    descTE: "ప్రోటీన్ అధికంగా ఉండే అత్యంత ముఖ్యమైన రబీ పప్పు ధాన్యం",
    season: "Rabi", states: ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Andhra Pradesh"], msp: 5958, color: "#C8965A"
  },
  {
    id: "tur", name: "Tur Dal (Arhar)", nameTA: "துவரம் பருப்பு", nameTE: "కందిపప్పు",
    category: "Pulses", unit: "quintal", basePrice: 8450, emoji: "🌱",
    image: "https://images.unsplash.com/photo-1620911799173-a33572836272?w=500&h=320&fit=crop&q=80",
    description: "Most important kharif pulse for daily Indian diet",
    descTA: "இந்தியாவின் அன்றாட உணவில் முக்கிய கரீஃப் பயறு",
    descTE: "ఖరీఫ్ కాలంలో పండించే ప్రధాన పప్పు ధాన్యం",
    season: "Kharif", states: ["Maharashtra", "Karnataka", "Uttar Pradesh", "Telangana"], msp: 8450, color: "#E8A040"
  },
  {
    id: "moong", name: "Moong Dal", nameTA: "பச்சைப்பயறு", nameTE: "పెసరపప్పు",
    category: "Pulses", unit: "quintal", basePrice: 8780, emoji: "🌱",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Mung_beans_%28Vigna_radiata%29.jpg/500px-Mung_beans_%28Vigna_radiata%29.jpg",
    description: "Quick-growing summer pulse, highly nutritious",
    descTA: "விரைவாக வளரும் கோடை பயறு, மிக அதிக சத்துக்கள்",
    descTE: "స్వల్పకాలిక పప్పు ధాన్యం పంట",
    season: "Zaid/Kharif", states: ["Rajasthan", "Maharashtra", "Andhra Pradesh", "Karnataka"], msp: 8780, color: "#78C878"
  },
  {
    id: "banana", name: "Banana", nameTA: "வாழைப்பழம்", nameTE: "అరటి",
    varieties: [{"id": "grand_naine", "mandiPricePerKg": 11, "mandiPricePerQuintal": 1100, "name": "Grand Naine (Robusta Cavendish)", "nameTA": "கிராண்ட் நைன் (ஜி9)", "nameTE": "గ్రాండ్ నైన్", "nameKN": "ಗ್ರಾಂಡ್ ನೈನ್", "nameML": "ഗ്രാൻഡ് നൈൻ", "nameHI": "ग्रैंड नैन (केला)", "pricePerKg": 25, "pricePerQuintal": 2500, "originState": "Maharashtra & Tamil Nadu", "characteristics": "High yield, smooth yellow skin, universal commercial choice", "characteristicsTA": "அதிக விளைச்சல், மென்மையான மஞ்சள் தோல்", "characteristicsTE": "అధిక దిగుబడి, మృదువైన పసుపు చర్మం", "characteristicsKN": "ಹೆಚ್ಚಿನ ಇಳುವರಿ, ನಯವಾದ ಹಳದಿ ಸಿಪ್ಪೆ", "characteristicsML": "ഉയർന്ന വിളവ്, മഞ്ഞ ത്വക്ക്", "characteristicsHI": "उच्च उपज, चिकनी पीली त्वचा, व्यावसायिक विकल्प", "season": "All Year"}, {"id": "yelakki_red", "mandiPricePerKg": 28, "mandiPricePerQuintal": 2800, "name": "Red Banana (Chevvazhai / Yelakki)", "nameTA": "செவ்வாழை", "nameTE": "ఎలక్కి / ఎర్ర అరటి", "nameKN": "ಯಾಲಕ್ಕಿ / ಕೆಂಪು ಬಾಳೆ", "nameML": "ചുവന്ന വാഴ (ചെങ്കദളി)", "nameHI": "लाल केला (एलाक्की)", "pricePerKg": 65, "pricePerQuintal": 6500, "originState": "Tamil Nadu & Kerala", "characteristics": "Purplish-red skin, berry-like sweet taste, rich in beta-carotene & antioxidants", "characteristicsTA": "சிவப்பு தோல், அதிக ஊட்டச்சத்து, சுவையான பழம்", "characteristicsTE": "ఎరుపు చర్మం, రుచికరమైన తీపి, బీటా కెరోటిన్ సమృద్ధి", "characteristicsKN": "ಕೆಂಪು ಸಿಪ್ಪೆ, ಔಷಧೀಯ ಗುಣಗಳು, ಅತ್ಯಂತ ಸಿಹಿ", "characteristicsML": "ചുവന്ന തൊലി, പോഷകഗുണങ്ങൾ ഉള്ളത്", "characteristicsHI": "बैंगनी-लाल त्वचा, जामुनी मीठा स्वाद, बीटा-कैरोटीन से भरपूर", "season": "All Year"}, {"id": "nendran", "mandiPricePerKg": 20, "mandiPricePerQuintal": 2000, "name": "Nendran (Ethapazham)", "nameTA": "நேந்திரன்", "nameTE": "నేంద్రన్", "nameKN": "ನೇಂದ್ರನ್", "nameML": "നേന്ത്രപ്പഴം", "nameHI": "नेन्द्रन", "pricePerKg": 45, "pricePerQuintal": 4500, "originState": "Thrissur, Kerala", "characteristics": "Firm texture, ideal for banana chips and traditional cooking, GI tagged", "characteristicsTA": "நேந்திரன் வாழைக்காய் சிப்ஸ் மற்றும் சமையலுக்கு சிறந்தது", "characteristicsTE": "నేంద్రన్ అరటి చిప్స్ తయారీకి ప్రసిద్ధి", "characteristicsKN": "ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್ ಮಾಡಲು ಅತ್ಯುತ್ತಮ", "characteristicsML": "ചിപ്സ് നിർമ്മാണത്തിനും പാചകത്തിനും ഉത്തമം", "characteristicsHI": "मजबूत बनावट, केला चिप्स और पारंपरिक खाना पकाने के लिए आदर्श", "season": "August - December"}],
    category: "Fruits", unit: "quintal", basePrice: 1300, emoji: "🍌",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&h=320&fit=crop&q=80",
    description: "Major fruit crop grown in tropical and subtropical climate",
    descTA: "வெப்பமண்டல காலநிலையில் வளரும் முக்கிய பழ வகை",
    descTE: "ఏడాది పొడవునా పండించే అత్యంత ముఖ్యమైన పండ్ల పంట",
    season: "Annual", states: ["Tamil Nadu", "Andhra Pradesh", "Karnataka", "Maharashtra"], msp: 0, color: "#F7D840"
  },
  {
    id: "mango", name: "Mango", nameTA: "மாம்பழம்", nameTE: "మామిడి",
    varieties: [{"id": "alphonso", "mandiPricePerKg": 65, "mandiPricePerQuintal": 6500, "name": "Alphonso (Hapus)", "nameTA": "அல்போன்சா", "nameTE": "ఆల్ఫోన్సో", "nameKN": "ಅಲ್ಫೋನ್ಸೋ", "nameML": "അൽഫോൺസോ", "nameHI": "अल्फ़ांसो (हापुस)", "pricePerKg": 180, "pricePerQuintal": 18000, "originState": "Ratnagiri, Maharashtra", "characteristics": "King of Mangoes, rich aroma, saffron-colored flesh, premium export quality", "characteristicsTA": "மாம்பழங்களின் ராஜா, நறுமணம், குங்குமப்பூ நிறம், ஏற்றுமதி தரம்", "characteristicsTE": "మామిడి పండ్ల రాజు, నాణ్యమైన సువాసన, ఎగుమతి నాణ్యత", "characteristicsKN": "ಮಾವಿನ ಹಣ್ಣುಗಳ ರಾಜ, ಕೆಸರಿ ಬಣ್ಣ, ರಫ್ತು ಗುಣಮಟ್ಟ", "characteristicsML": "മാമ്പഴങ്ങളുടെ രാജാവ്, സവിശേഷ സുഗന്ധം, കയറ്റുമതി തരം", "characteristicsHI": "आमों का राजा, समृद्ध सुगंध, केसरिया रंग, प्रीमियम निर्यात गुणवत्ता", "season": "April - June"}, {"id": "kesar", "mandiPricePerKg": 45, "mandiPricePerQuintal": 4500, "name": "Gir Kesar", "nameTA": "கேசர்", "nameTE": "కేసర్", "nameKN": "ಕೇಸರ್", "nameML": "കേസർ", "nameHI": "गिर केसर", "pricePerKg": 130, "pricePerQuintal": 13000, "originState": "Junagadh, Gujarat", "characteristics": "Distinct sweet fragrance, bright yellow-saffron flesh, GI tagged", "characteristicsTA": "இனிய நறுமணம், மஞ்சள் நிறம், புவிசார் குறியீடு பெற்றது", "characteristicsTE": "ప్రత్యేకమైన తీపి సువాసన, GI ట్యాగ్", "characteristicsKN": "ವಿಶಿಷ್ಟ ಸಿಹಿ ಸುವಾಸನೆ, ಜಿಐ ಟ್ಯಾಗ್ ಪಡೆದಿದೆ", "characteristicsML": "പ്രത്യേക മധുര സുഗന്ധം, GI ടാഗ്", "characteristicsHI": "विशिष्ट मीठी खुशबू, पीला-केसरिया गूदा, जीआई टैग प्राप्त", "season": "May - July"}, {"id": "banganapalli", "mandiPricePerKg": 32, "mandiPricePerQuintal": 3200, "name": "Banganapalli (Benishan)", "nameTA": "பங்கனபள்ளி", "nameTE": "బంగనపల్లి (బెనీషన్)", "nameKN": "ಬಂಗನಪಲ್ಲಿ", "nameML": "ബംഗനപള്ളി", "nameHI": "बंगनापल्ली (सफेदा)", "pricePerKg": 95, "pricePerQuintal": 9500, "originState": "Kurnool, Andhra Pradesh", "characteristics": "Large oval shape, fiberless sweet flesh, golden yellow skin", "characteristicsTA": "பெரிய ஓவல் வடிவம், நார் அற்ற இனிப்பு, தங்க மஞ்சள் தோல்", "characteristicsTE": "పెద్ద ఓవల్ ఆకారం, పీచు లేని తీపి సువాసన", "characteristicsKN": "ದೊಡ್ಡ ಓವಲ್ ಆಕಾರ, ನಾರಿಲ್ಲದ ಸಿಹಿ", "characteristicsML": "വലിയ ഓവൽ രൂപം, നാരുമില്ലാത്ത മധുരം", "characteristicsHI": "बड़ा अंडाकार आकार, रेशे रहित मीठा गूदा, सुनहरा पीला", "season": "April - June"}, {"id": "dasheri", "mandiPricePerKg": 28, "mandiPricePerQuintal": 2800, "name": "Dasheri", "nameTA": "தஷேரி", "nameTE": "దశేరి", "nameKN": "ದಶೇರಿ", "nameML": "ദശേരി", "nameHI": "दशहरी", "pricePerKg": 80, "pricePerQuintal": 8000, "originState": "Malihabad, Uttar Pradesh", "characteristics": "Elongated shape, aromatic sweet juice, northern India favorite", "characteristicsTA": "நீளமான வடிவம், வட இந்தியாவின் மிகவும் புகழ்பெற்ற மாம்பழம்", "characteristicsTE": "పొడవాటి ఆకారం, ఉత్తర భారతదేశంలో ప్రసిద్ధం", "characteristicsKN": "ಉದ್ದವಾದ ಆಕಾರ, ಉತ್ತರ ಭಾರತದ ಅಚ್ಚುಮೆಚ್ಚು", "characteristicsML": "നീളമുള്ള ആകൃതി, മധുരമുള്ള നീര്", "characteristicsHI": "लंबा आकार, सुगंधित मीठा रस, उत्तर भारत का पसंदीदा", "season": "June - July"}, {"id": "totapuri", "name": "Totapuri (Ginimoothu)", "nameTA": "தோத்தாபுரி", "nameTE": "తోతాపురి (గినిమూతి)", "nameKN": "ತೋತಾಪುರಿ (ಗಿಣಿಮೂತಿ)", "nameML": "തൊതാപുരി", "nameHI": "तोतापुरी", "mandiPricePerKg": 8, "mandiPricePerQuintal": 800, "pricePerKg": 25, "pricePerQuintal": 2500, "originState": "Chittoor, Andhra Pradesh & Karnataka", "characteristics": "Parrot-beak tip, tangy-sweet flavor, widely used for juice & pulp processing", "characteristicsTA": "கிளி மூக்கு வடிவம், புளிப்பு-இனிப்பு சுவை, சாறு தயாரிக்க உகந்தது", "characteristicsTE": "చిలుక ముక్కు ఆకారం, రసం కోసం విస్తృతంగా ఉపయోగించబడుతుంది", "characteristicsKN": "ಗಿಳಿ ಮೂಗಿನ ಆಕಾರ, ಜ್ಯೂಸ್ ಮಾಡಲು ಸೂಕ್ತ", "characteristicsML": "തത്തച്ചുണ്ട് പോലുള്ള ആകൃതി, ജ്യൂസിന് ഉപയോഗിക്കുന്നു", "characteristicsHI": "तोते की चोंच जैसा सिरा, खट्टा-मीठा स्वाद, जूस और पल्प निर्माण में प्रयुक्त", "season": "May - July"}],
    category: "Fruits", unit: "quintal", basePrice: 4500, emoji: "🥭",
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500&h=320&fit=crop&q=80",
    description: "King of fruits with high festive and export demand",
    descTA: "பண்டிகை மற்றும் ஏற்றுமதி தேவை அதிகமுள்ள பழங்களின் ராஜா",
    descTE: "పండ్ల రారాజు, ప్రధాన వేసవి పంట",
    season: "Summer", states: ["Andhra Pradesh", "Uttar Pradesh", "Kerala", "Karnataka"], msp: 0, color: "#F0A030"
  },
  {
    id: "turmeric", name: "Turmeric", nameTA: "மஞ்சள்", nameTE: "పసుపు",
    varieties: [{"id": "salem_turmeric", "mandiPricePerKg": 110, "mandiPricePerQuintal": 11000, "name": "Salem Erode Turmeric", "nameTA": "சேலம் ஈரோடு மஞ்சள்", "nameTE": "సేలం ఈరోడ్ పసుపు", "nameKN": "ಸೇಲಂ ಅರಿಶಿನ", "nameML": "സേലം മഞ്ഞൾ", "nameHI": "सेलम ईरोड हल्दी", "pricePerKg": 140, "pricePerQuintal": 14000, "originState": "Erode, Tamil Nadu", "characteristics": "Bright golden yellow, high curcumin content (3.5%), GI tagged", "characteristicsTA": "பளிச்சிடும் பொன் மஞ்சள் நிறம், அதிக குர்குமின் (3.5%), புவிசார் குறியீடு பெற்றது", "characteristicsTE": "ప్రకాశవంతమైన బంగారు పసుపు రంగు, అధిక కర్క్యుమిన్ (3.5%), GI ట్యాగ్", "characteristicsKN": "ಹೊಳೆಯುವ ಚಿನ್ನದ ಹಳದಿ ಬಣ್ಣ, ಹೆಚ್ಚಿನ ಕರ್ಕ್ಯುಮಿನ್ (3.5%), ಜಿಐ ಟ್ಯಾಗ್ ಪಡೆದಿದೆ", "characteristicsML": "തിളക്കമുള്ള സ്വർണ്ണ മഞ്ഞ നിറം, ഉയർന്ന കുർക്കുമിൻ (3.5%), GI ടാഗ്", "characteristicsHI": "चमकीला सुनहरा पीला रंग, उच्च करक्यूमिन (3.5%), जीआई टैग प्राप्त", "season": "January - March"}],
    category: "Spices", unit: "quintal", basePrice: 13500, emoji: "🌱",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Turmeric_rhizome.jpg/500px-Turmeric_rhizome.jpg",
    description: "High-value spice with strong medicinal and export demand",
    descTA: "மருத்துவ மற்றும் ஏற்றுமதி தேவை அதிகமுள்ள மதிப்புமிக்க மசாலா",
    descTE: "ఔషధ గుణాలున్న ముఖ్యమైన సుగంధ ద్రవ్య పంట",
    season: "Kharif", states: ["Telangana", "Andhra Pradesh", "Tamil Nadu", "Karnataka"], msp: 0, color: "#F0C030"
  },
  {
    id: "chilli", name: "Red Chilli", nameTA: "மிளகாய்", nameTE: "మిరప",
    varieties: [{"id": "guntur_sannam", "mandiPricePerKg": 145, "mandiPricePerQuintal": 14500, "name": "Guntur Sannam Red Chilli (S4)", "nameTA": "குண்டூர் சன்னம் மிளகாய்", "nameTE": "గుంటూరు సన్నం ఎర్ర మిరప (S4)", "nameKN": "ಗುಂಟೂರು ಸನ್ನಂ ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ", "nameML": "ഗുണ്ടൂർ മുളക്", "nameHI": "गुंटूर सन्नम लाल मिर्च (S4)", "pricePerKg": 190, "pricePerQuintal": 19000, "originState": "Guntur, Andhra Pradesh", "characteristics": "High pungency & capsaicin, deep red color, world-famous hot red chilli", "characteristicsTA": "அதிக காரம், அடர் சிவப்பு நிறம், உலக புகழ்பெற்ற மிளகாய்", "characteristicsTE": "అధిక ఘాటు, ముదురు ఎరుపు రంగు, ప్రపంచ ప్రసిద్ధి", "characteristicsKN": "ಅತ್ಯಂತ ಖಾರ, ಗಡಸು ಕೆಂಪು ಬಣ್ಣ", "characteristicsML": "ഉയർന്ന എരിവ്, കടും ചുവപ്പ് നിറം", "characteristicsHI": "उच्च तीखापन, गहरा लाल रंग, विश्व प्रसिद्ध तीखी लाल मिर्च", "season": "December - May"}, {"id": "byadgi_chilli", "mandiPricePerKg": 185, "mandiPricePerQuintal": 18500, "name": "Byadgi Red Chilli", "nameTA": "பயாட்கி மிளகாய்", "nameTE": "బ్యాడగి మిరప", "nameKN": "ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ", "nameML": "ബായാഡ്ഗി മുളക്", "nameHI": "ब्याडगी लाल मिर्च", "pricePerKg": 240, "pricePerQuintal": 24000, "originState": "Haveri, Karnataka", "characteristics": "Deep red color oil, mild pungency, GI tagged, prized for masala powder & oleoresin", "characteristicsTA": "அடர் சிவப்பு வண்ணம், மிதமான காரம், புவிசார் குறியீடு பெற்றது", "characteristicsTE": "అందమైన ఎరుపు రంగు, మితమైన ఘాటు, GI ట్యాగ్", "characteristicsKN": "ಕಡು ಕೆಂಪು ಬಣ್ಣ, ಮೃದು ಖಾರ, ಮಸಾಲಾ ಪುಡಿಗೆ ಅತ್ಯುತ್ತಮ (ಜಿಐ ಟ್ಯಾಗ್)", "characteristicsML": "മനോഹരമായ കടും ചുവപ്പ് നിറം, ജിഐ ടാഗ്", "characteristicsHI": "गहरा लाल रंग, हल्का तीखापन, जीआई टैग, मसाला और तेल निष्कर्षण हेतु प्रसिद्ध", "season": "January - May"}],
    category: "Spices", unit: "quintal", basePrice: 18000, emoji: "🌶️",
    image: "https://images.unsplash.com/photo-1628543136798-2032a247c7d4?w=500&h=320&fit=crop&q=80",
    description: "High-value spice with strong domestic and export demand",
    descTA: "உள்நாட்டு மற்றும் ஏற்றுமதி தேவை அதிகமுள்ள மதிப்புமிக்க மசாலா",
    descTE: "భారతీయ వంటకాల్లో అత్యంత ముఖ్యమైన సుగంధ ద్రవ్యం",
    season: "Kharif", states: ["Telangana", "Andhra Pradesh", "Tamil Nadu", "Karnataka"], msp: 0, color: "#D03030"
  },
  {
    id: "cabbage", name: "Cabbage", nameTA: "முட்டைக்கோஸ்", nameTE: "క్యాబేజీ",
    category: "Vegetables", unit: "quintal", basePrice: 1500, emoji: "🥬",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cabbage_and_cross_section_on_white.jpg/500px-Cabbage_and_cross_section_on_white.jpg",
    description: "Leafy green, red, or white biennial plant grown as an annual vegetable crop",
    descTA: "காய்கறியாக வளர்க்கப்படும் இலை தாவரம்",
    descTE: "శీతాకాలంలో పండించే ఆకుకూర పంట",
    season: "Rabi", states: ["West Bengal", "Odisha", "Gujarat", "Assam"], msp: 0, color: "#90C050"
  },
  {
    id: "cauliflower", name: "Cauliflower", nameTA: "காலிஃபிளவர்", nameTE: "కాలీఫ్లవర్",
    category: "Vegetables", unit: "quintal", basePrice: 1800, emoji: "🥦",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chou-fleur_02.jpg/500px-Chou-fleur_02.jpg",
    description: "Cool season vegetable crop requiring highly fertile soil",
    descTA: "அதிக வளமான மண் தேவைப்படும் குளிர் கால காய்கறி",
    descTE: "జనాదరణ పొందిన శీతాకాలపు కూరగాయ",
    season: "Rabi", states: ["Bihar", "Uttar Pradesh", "West Bengal", "Gujarat"], msp: 0, color: "#D8D8B8"
  },
  {
    id: "eggplant", name: "Brinjal (Eggplant)", nameTA: "கத்தரிக்காய்", nameTE: "వంకాయ",
    category: "Vegetables", unit: "quintal", basePrice: 2000, emoji: "🍆",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/500px-Solanum_melongena_24_08_2012_%281%29.JPG",
    description: "Widely grown vegetable with deep purple, glossy fruit",
    descTA: "பரவலாக வளர்க்கப்படும் காய்கறி",
    descTE: "సంవత్సరం పొడవునా పండించే సాధారణ కూరగాయ",
    season: "Annual", states: ["West Bengal", "Odisha", "Gujarat", "Bihar"], msp: 0, color: "#603080"
  },
  {
    id: "okra", name: "Okra (Bhindi)", nameTA: "வெண்டைக்காய்", nameTE: "బెండకాయ",
    category: "Vegetables", unit: "quintal", basePrice: 2500, emoji: "🥒",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Hong_Kong_Okra_Aug_25_2012.JPG/500px-Hong_Kong_Okra_Aug_25_2012.JPG",
    description: "Warm season vegetable known for its edible green seed pods",
    descTA: "கோடைகால காய்கறி",
    descTE: "వేసవి మరియు ఖరీఫ్ కాలంలో పండించే కూరగాయ",
    season: "Summer", states: ["Gujarat", "West Bengal", "Bihar", "Andhra Pradesh"], msp: 0, color: "#408030"
  },
  {
    id: "carrot", name: "Carrot", nameTA: "கேரட்", nameTE: "క్యారెట్",
    category: "Vegetables", unit: "quintal", basePrice: 1800, emoji: "🥕",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/500px-Vegetable-Carrot-Bundle-wStalks.jpg",
    description: "Root vegetable, usually orange in color, highly nutritious",
    descTA: "சத்தான வேர் காய்கறி",
    descTE: "శీతాకాలపు వేరు కూరగాయ",
    season: "Rabi", states: ["Haryana", "Punjab", "Uttar Pradesh", "Bihar"], msp: 0, color: "#E07020"
  },
  {
    id: "apple", name: "Apple", nameTA: "ஆப்பிள்", nameTE: "ఆపిల్",
    varieties: [{"id": "royal_delicious", "name": "Shimla Royal Delicious", "nameTA": "சிம்லா ராயல் டெலிசியஸ்", "nameTE": "షిమ్లా రాయల్ డెలీషియస్", "nameKN": "ಶಿಮ್ಲಾ ರಾಯಲ್ ಡೆಲಿಶಿಯಸ್", "nameML": "ഷിംല റോയൽ ഡെലീഷ്യസ്", "nameHI": "शिमला रॉयल डिलीशियस", "pricePerKg": 140, "pricePerQuintal": 14000, "originState": "Shimla, Himachal Pradesh", "characteristics": "Crisp red skin, sweet aromatic juice, India's most popular apple", "characteristicsTA": "சிவப்பு தோல், இனிப்பு சாறு, இந்தியாவின் மிகவும் பிரபல ஆப்பிள்", "characteristicsTE": "ఎరుపు చర్మం, తీపి రసం, ప్రసిద్ధ ఆపిల్", "characteristicsKN": "ಕೆಂಪು ಸಿಪ್ಪೆ, ಸಿಹಿ ರಸ, ಅತ್ಯಂತ ಜನಪ್ರಿಯ ಆಪಲ್", "characteristicsML": "ചുവന്ന തൊലി, മധുരമുള്ള നീര്, ജനപ്രിയ ആപ്പിൾ", "characteristicsHI": "कुरकुरा लाल छिलका, मीठा सुगंधित रस, भारत का सबसे लोकप्रिय सेब", "season": "August - November"}, {"id": "fuji_apple", "mandiPricePerKg": 75, "mandiPricePerQuintal": 7500, "name": "Fuji Apple", "nameTA": "ஃபுஜி ஆப்பிள்", "nameTE": "ఫుజి ఆపిల్", "nameKN": "ಫ್ಯೂಜಿ ಆಪಲ್", "nameML": "ഫ്യൂജി ആപ്പിൾ", "nameHI": "फुजी सेब", "pricePerKg": 180, "pricePerQuintal": 18000, "originState": "Kinnaur, Himachal Pradesh", "characteristics": "Ultra-firm, exceptionally sweet, high juice content and long shelf life", "characteristicsTA": "மிகவும் இனிப்பானது, நீண்ட நாட்கள் கெடாது", "characteristicsTE": "అత్యంత తీపి, సుదీర్ఘ నిల్వ సమయం", "characteristicsKN": "ಅತ್ಯಂತ ಸಿಹಿ, ದೀರ್ಘ ಬಾಳಿಕೆ ಅವಧಿ", "characteristicsML": "വളരെ മധുരമുള്ളത്, ദീർഘകാല സംഭരണം", "characteristicsHI": "अत्यधिक मीठा, भरपूर रस, लंबी शेल्फ लाइफ वाला प्रीमियम सेब", "season": "September - December"}],
    category: "Fruits", unit: "quintal", basePrice: 8000, emoji: "🍎",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pink_lady_and_cross_section.jpg/500px-Pink_lady_and_cross_section.jpg",
    description: "Popular fruit grown in cooler climates",
    descTA: "குளிர்ந்த காலநிலையில் வளரும் பிரபலமான பழம்",
    descTE: "శీతల ప్రాంతాల్లో పండించే పండు",
    season: "Annual", states: ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand"], msp: 0, color: "#D03030"
  },
  {
    id: "papaya", name: "Papaya", nameTA: "பப்பாளி", nameTE: "బొప్పాయి",
    category: "Fruits", unit: "quintal", basePrice: 1500, emoji: "🍈",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Carica_papaya_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-029.jpg/500px-Carica_papaya_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-029.jpg",
    description: "Tropical fruit with sweet orange flesh",
    descTA: "வெப்பமண்டல பழம்",
    descTE: "వేగంగా పెరిగే ఉష్ణమండల పండ్ల పంట",
    season: "Annual", states: ["Andhra Pradesh", "Gujarat", "Karnataka", "Maharashtra"], msp: 0, color: "#E09030"
  },
  {
    id: "orange", name: "Orange", nameTA: "ஆரஞ்சு", nameTE: "నారింజ",
    category: "Fruits", unit: "quintal", basePrice: 3500, emoji: "🍊",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Oranges_-_whole-halved-segment.jpg/500px-Oranges_-_whole-halved-segment.jpg",
    description: "Citrus fruit highly valued for juice and vitamin C",
    descTA: "வைட்டமின் சி நிறைந்த சிட்ரஸ் பழம்",
    descTE: "ప్రసిద్ధ సిట్రస్ పండు",
    season: "Annual", states: ["Maharashtra", "Madhya Pradesh", "Assam", "Rajasthan"], msp: 0, color: "#F08000"
  },
  {
    id: "grape", name: "Grapes", nameTA: "திராட்சை", nameTE: "ద్రాక్ష",
    category: "Fruits", unit: "quintal", basePrice: 4000, emoji: "🍇",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Grapes%2C_Rostov-on-Don%2C_Russia.jpg/500px-Grapes%2C_Rostov-on-Don%2C_Russia.jpg",
    description: "Berry fruit grown on vines, used fresh or for raisins",
    descTA: "கொடிகளில் வளரும் பழம்",
    descTE: "వాణిజ్యపరంగా పండించే పండు",
    season: "Annual", states: ["Maharashtra", "Karnataka", "Tamil Nadu", "Andhra Pradesh"], msp: 0, color: "#8040A0"
  },
  {
    id: "pomegranate", name: "Pomegranate", nameTA: "மாதுளை", nameTE: "దానిమ్మ",
    category: "Fruits", unit: "quintal", basePrice: 6000, emoji: "🍎",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Pomegranate_Juice_%282019%29.jpg/500px-Pomegranate_Juice_%282019%29.jpg",
    description: "Fruit-bearing deciduous shrub with juicy, gem-like seeds",
    descTA: "சாறு நிறைந்த விதைகளைக் கொண்ட பழம்",
    descTE: "అధిక మార్కెట్ విలువ కలిగిన పండ్ల పంట",
    season: "Annual", states: ["Maharashtra", "Gujarat", "Karnataka", "Andhra Pradesh"], msp: 0, color: "#B02030"
  }
];

export const CATEGORIES = ["All", ...Array.from(new Set(CROPS.map(c => c.category)))];
export const SEASONS = ["All", "Kharif", "Rabi", "Annual", "Zaid/Kharif", "Summer"];

export function getCropById(id: string): Crop | undefined {
  return CROPS.find(c => c.id === id);
}

export function getCropsByState(state: string): Crop[] {
  return CROPS.filter(c => c.states.some(s => s.toLowerCase().includes(state.toLowerCase())));
}

// Simulate live price with small random walk
const livePrices: Record<string, number> = {};

export function getLivePrice(crop: Crop): number {
  if (!livePrices[crop.id]) livePrices[crop.id] = crop.basePrice;
  const change = (Math.random() - 0.485) * (crop.basePrice * 0.008);
  livePrices[crop.id] = Math.max(
    crop.basePrice * 0.72,
    Math.min(crop.basePrice * 1.45, livePrices[crop.id] + change)
  );
  return parseFloat(livePrices[crop.id].toFixed(2));
}

export function generatePriceHistory(crop: Crop, days: number = 60): { date: string; price: number; volume: number; weather: string }[] {
  const weatherTypes = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Foggy"];
  const data: { date: string; price: number; volume: number; weather: string }[] = [];
  let price = crop.basePrice;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * (crop.basePrice * 0.028);
    price = Math.max(crop.basePrice * 0.7, Math.min(crop.basePrice * 1.4, price + change));
    data.push({
      date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(7000 + Math.random() * 6000),
      weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
    });
  }
  return data;
}

export function generateForecast(crop: Crop, lastPrice: number, days: number = 30): { date: string; predicted: number; lower: number; upper: number }[] {
  const data: { date: string; predicted: number; lower: number; upper: number }[] = [];
  let price = lastPrice;
  const trend = (Math.random() - 0.44) * 0.004;
  const now = new Date();
  for (let i = 1; i <= days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const noise = (Math.random() - 0.5) * (crop.basePrice * 0.022);
    price = price * (1 + trend) + noise;
    price = Math.max(crop.basePrice * 0.65, Math.min(crop.basePrice * 1.55, price));
    const margin = crop.basePrice * 0.035 * (1 + i * 0.018);
    data.push({
      date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      predicted: parseFloat(price.toFixed(2)),
      lower: parseFloat((price - margin).toFixed(2)),
      upper: parseFloat((price + margin).toFixed(2)),
    });
  }
  return data;
}

export function getRecommendation(crop: Crop, history: { price: number }[], forecast: { predicted: number }[]): {
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reason: string;
  reasonTA: string;
  reasonTE: string;
  priceChange: number;
} {
  const currentPrice = history[history.length - 1].price;
  const forecastedPrice = forecast[forecast.length - 1].predicted;
  const priceChange = ((forecastedPrice - currentPrice) / currentPrice) * 100;
  const avg7 = history.slice(-7).reduce((s, h) => s + h.price, 0) / 7;
  const avg30 = history.slice(-30).reduce((s, h) => s + h.price, 0) / 30;
  const trend = avg7 > avg30 ? "up" : "down";

  let action: "BUY" | "SELL" | "HOLD";
  let confidence: number;
  let reason: string;
  let reasonTA: string;
  let reasonTE: string;

  if (priceChange > 5 && trend === "up") {
    action = "HOLD";
    confidence = Math.min(92, 70 + Math.abs(priceChange) * 1.5);
    reason = `Prices expected to rise ${priceChange.toFixed(1)}% in 30 days. Short-term upward trend confirmed.`;
    reasonTA = `30 நாட்களில் விலை ${priceChange.toFixed(1)}% உயரும் என எதிர்பார்க்கப்படுகிறது. குறுகிய கால ஏற்றம் உறுதிப்படுத்தப்பட்டது.`;
    reasonTE = `30 రోజుల్లో ధరలు ${priceChange.toFixed(1)}% పెరగవచ్చు. స్వల్పకాలిక పెరుగుదల ధోరణి నిర్ధారించబడింది.`;
  } else if (priceChange > 5) {
    // Forecast is up but the 7-day average is still below the 30-day average.
    action = "HOLD";
    confidence = Math.min(80, 60 + Math.abs(priceChange));
    reason = `Prices expected to rise ${priceChange.toFixed(1)}% in 30 days, but the short-term trend is still down. Hold and watch before selling.`;
    reasonTA = `30 நாட்களில் விலை ${priceChange.toFixed(1)}% உயரும் என எதிர்பார்க்கப்படுகிறது, ஆனால் குறுகிய கால போக்கு இன்னும் இறக்கமாக உள்ளது. விற்பதற்கு முன் காத்திருந்து கவனிக்கவும்.`;
    reasonTE = `30 రోజుల్లో ధరలు ${priceChange.toFixed(1)}% పెరగవచ్చు, కానీ స్వల్పకాలిక ధోరణి ఇంకా తగ్గుదలలో ఉంది. అమ్మే ముందు వేచి చూడండి.`;
  } else if (priceChange < -5) {
    action = "SELL";
    confidence = Math.min(88, 65 + Math.abs(priceChange) * 1.5);
    reason = `Prices may drop ${Math.abs(priceChange).toFixed(1)}% in 30 days. Selling now is advisable.`;
    reasonTA = `30 நாட்களில் விலை ${Math.abs(priceChange).toFixed(1)}% குறையலாம். இப்போது விற்பது நல்லது.`;
    reasonTE = `30 రోజుల్లో ధరలు ${Math.abs(priceChange).toFixed(1)}% తగ్గవచ్చు. ఇప్పుడు అమ్మడం మంచిది.`;
  } else if (currentPrice < crop.msp * 0.95 && crop.msp > 0) {
    action = "HOLD";
    confidence = 75;
    reason = `Current price is below MSP of ₹${crop.msp}. Wait for government procurement.`;
    reasonTA = `தற்போதைய விலை MSP ₹${crop.msp} க்கும் குறைவாக உள்ளது. அரசு கொள்முதலுக்காக காத்திருங்கள்.`;
    reasonTE = `ప్రస్తుత ధర MSP ₹${crop.msp} కంటే తక్కువగా ఉంది. ప్రభుత్వ సేకరణ కోసం వేచి ఉండండి.`;
  } else {
    action = "HOLD";
    confidence = Math.floor(60 + Math.random() * 20);
    reason = `Market is stable. Monitor weather and demand signals over the next 2 weeks.`;
    reasonTA = `சந்தை நிலையானது. அடுத்த 2 வாரங்களில் வானிலை மற்றும் தேவை சமிக்ஞைகளை கண்காணிக்கவும்.`;
    reasonTE = `మార్కెట్ స్థిరంగా ఉంది. రాబోయే 2 వారాలలో వాతావరణం మరియు డిమాండ్ సంకేతాలను పర్యవేక్షించండి.`;
  }

  return { action, confidence: Math.round(confidence), reason, reasonTA, reasonTE, priceChange };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}


// ── 1. MANDI COMPARISON DATA ENGINE ──────────────────────────────────────────
export interface MandiInfo {
  id: string;
  mandiName: string;
  district: string;
  state: string;
  distanceKm: number;
  price: number;
  priceDiff: number;
  arrivalsTons: number;
  trend: "up" | "down" | "stable";
  isBestChoice?: boolean;
  // Set only for official Agmarknet prices
  minPrice?: number;
  maxPrice?: number;
  arrivalDate?: string;
}

const REGIONAL_MANDIS: Record<string, { name: string; district: string; state: string; dist: number }[]> = {
  "Andhra Pradesh": [
    { name: "Chittoor APMC Mandi", district: "Chittoor", state: "Andhra Pradesh", dist: 8 },
    { name: "Guntur APMC Yard", district: "Guntur", state: "Andhra Pradesh", dist: 45 },
    { name: "Vijayawada Wholesale Market", district: "Krishna", state: "Andhra Pradesh", dist: 82 },
    { name: "Kurnool Benishan Mandi", district: "Kurnool", state: "Andhra Pradesh", dist: 190 },
    { name: "Koyambedu Wholesale APMC", district: "Chennai", state: "Tamil Nadu", dist: 140 }
  ],
  "Tamil Nadu": [
    { name: "Koyambedu Wholesale APMC", district: "Chennai", state: "Tamil Nadu", dist: 15 },
    { name: "Erode Turmeric & Grain Mandi", district: "Erode", state: "Tamil Nadu", dist: 95 },
    { name: "Madurai Mattuthavani Mandi", district: "Madurai", state: "Tamil Nadu", dist: 120 },
    { name: "Salem APMC Market", district: "Salem", state: "Tamil Nadu", dist: 180 },
    { name: "Coimbatore Integrated Market", district: "Coimbatore", state: "Tamil Nadu", dist: 240 }
  ],
  "Telangana": [
    { name: "Warangal Grain Market", district: "Warangal", state: "Telangana", dist: 25 },
    { name: "Khammam APMC Yard", district: "Khammam", state: "Telangana", dist: 85 },
    { name: "Nizamabad Agricultural Market", district: "Nizamabad", state: "Telangana", dist: 160 },
    { name: "Gaddiannaram Fruit & Grain APMC", district: "Hyderabad", state: "Telangana", dist: 140 },
    { name: "Guntur APMC Mandi", district: "Guntur", state: "Andhra Pradesh", dist: 230 }
  ],
  "Karnataka": [
    { name: "Yeshwantpur APMC Yard", district: "Bengaluru", state: "Karnataka", dist: 18 },
    { name: "Bandipalya Mandi", district: "Mysuru", state: "Karnataka", dist: 135 },
    { name: "Hubballi APMC Market", district: "Dharwad", state: "Karnataka", dist: 240 },
    { name: "Belagavi Grain Yard", district: "Belagavi", state: "Karnataka", dist: 310 },
    { name: "Byadgi Chilli Mandi", district: "Haveri", state: "Karnataka", dist: 290 }
  ],
  "Maharashtra": [
    { name: "Vashi APMC Market", district: "Navi Mumbai", state: "Maharashtra", dist: 22 },
    { name: "Ratnagiri Mango Yard", district: "Ratnagiri", state: "Maharashtra", dist: 180 },
    { name: "Nashik APMC Onion Yard", district: "Nashik", state: "Maharashtra", dist: 160 },
    { name: "Pune Gultekdi Market", district: "Pune", state: "Maharashtra", dist: 145 },
    { name: "Nagpur Grain & Fruit Mandi", district: "Nagpur", state: "Maharashtra", dist: 480 }
  ],
  "Kerala": [
    { name: "Anayara World Market", district: "Thiruvananthapuram", state: "Kerala", dist: 12 },
    { name: "Sakthan Thampuran Mandi", district: "Thrissur", state: "Kerala", dist: 110 },
    { name: "Ernakulam Wholesale Market", district: "Ernakulam", state: "Kerala", dist: 95 },
    { name: "Wayanad Agricultural Yard", district: "Wayanad", state: "Kerala", dist: 210 }
  ],
  "Uttar Pradesh": [
    { name: "Malihabad Mango Mandi", district: "Lucknow", state: "Uttar Pradesh", dist: 25 },
    { name: "Gonda Grain APMC", district: "Gonda", state: "Uttar Pradesh", dist: 18 },
    { name: "Barabanki Mandi Samiti", district: "Barabanki", state: "Uttar Pradesh", dist: 62 },
    { name: "Hapur APMC Market", district: "Hapur", state: "Uttar Pradesh", dist: 210 },
    { name: "Bareilly Grain Yard", district: "Bareilly", state: "Uttar Pradesh", dist: 175 }
  ],
  "Punjab": [
    { name: "Khanna Grain Market", district: "Ludhiana", state: "Punjab", dist: 14 },
    { name: "Rajpura APMC Yard", district: "Patiala", state: "Punjab", dist: 45 },
    { name: "Amritsar Grain Market", district: "Amritsar", state: "Punjab", dist: 130 },
    { name: "Jalandhar APMC", district: "Jalandhar", state: "Punjab", dist: 95 }
  ]
};

const CROP_SPECIFIC_MANDIS: Record<string, { name: string; district: string; state: string; dist: number; basePrice: number }[]> = {
  mango: [
    { name: "Chittoor APMC Fruit Mandi", district: "Chittoor", state: "Andhra Pradesh", dist: 8, basePrice: 800 },
    { name: "Madanapalle APMC Yard", district: "Annamayya", state: "Andhra Pradesh", dist: 48, basePrice: 920 },
    { name: "Kurnool Banganapalli Mandi", district: "Kurnool", state: "Andhra Pradesh", dist: 190, basePrice: 1250 },
    { name: "Koyambedu Wholesale APMC", district: "Chennai", state: "Tamil Nadu", dist: 140, basePrice: 1800 },
    { name: "Gaddiannaram Fruit APMC", district: "Hyderabad", state: "Telangana", dist: 310, basePrice: 2100 }
  ],
  chilli: [
    { name: "Guntur APMC Yard (Chilli Hub)", district: "Guntur", state: "Andhra Pradesh", dist: 12, basePrice: 14500 },
    { name: "Khammam APMC Yard", district: "Khammam", state: "Telangana", dist: 85, basePrice: 13800 },
    { name: "Warangal APMC Yard", district: "Warangal", state: "Telangana", dist: 140, basePrice: 14100 },
    { name: "Byadgi APMC Yard", district: "Haveri", state: "Karnataka", dist: 420, basePrice: 18500 },
    { name: "Koyambedu APMC", district: "Chennai", state: "Tamil Nadu", dist: 340, basePrice: 16200 }
  ],
  onion: [
    { name: "Lasalgaon APMC (Asia's Largest)", district: "Nashik", state: "Maharashtra", dist: 160, basePrice: 1400 },
    { name: "Pimpalgaon APMC", district: "Nashik", state: "Maharashtra", dist: 175, basePrice: 1450 },
    { name: "Kurnool Onion Yard", district: "Kurnool", state: "Andhra Pradesh", dist: 190, basePrice: 1600 },
    { name: "Vashi APMC", district: "Navi Mumbai", state: "Maharashtra", dist: 220, basePrice: 1850 },
    { name: "Koyambedu APMC", district: "Chennai", state: "Tamil Nadu", dist: 340, basePrice: 2100 }
  ],
  banana: [
    { name: "Theni APMC Banana Yard", district: "Theni", state: "Tamil Nadu", dist: 140, basePrice: 1100 },
    { name: "Trichy APMC Market", district: "Tiruchirappalli", state: "Tamil Nadu", dist: 190, basePrice: 1150 },
    { name: "Jalgaon APMC Market", district: "Jalgaon", state: "Maharashtra", dist: 450, basePrice: 1250 },
    { name: "Koyambedu APMC", district: "Chennai", state: "Tamil Nadu", dist: 210, basePrice: 1600 }
  ],
  gram: [
    { name: "Guntur APMC Yard", district: "Guntur", state: "Andhra Pradesh", dist: 45, basePrice: 5875 },
    { name: "Kurnool Grain Market", district: "Kurnool", state: "Andhra Pradesh", dist: 190, basePrice: 5950 },
    { name: "Latur Grain APMC", district: "Latur", state: "Maharashtra", dist: 390, basePrice: 6100 },
    { name: "Indore Choithram Mandi", district: "Indore", state: "Madhya Pradesh", dist: 580, basePrice: 6350 }
  ],
  rice: [
    { name: "Nandyal APMC Paddy Yard", district: "Kurnool", state: "Andhra Pradesh", dist: 180, basePrice: 2441 },
    { name: "Miryalaguda APMC", district: "Nalgonda", state: "Telangana", dist: 210, basePrice: 2520 },
    { name: "Nellore APMC Yard", district: "Nellore", state: "Andhra Pradesh", dist: 145, basePrice: 2580 },
    { name: "Khanna Grain Market", district: "Ludhiana", state: "Punjab", dist: 1100, basePrice: 2750 }
  ],
  wheat: [
    { name: "Khanna Grain Market", district: "Ludhiana", state: "Punjab", dist: 450, basePrice: 2585 },
    { name: "Indore Choithram Mandi", district: "Indore", state: "Madhya Pradesh", dist: 520, basePrice: 2720 },
    { name: "Hapur APMC Market", district: "Hapur", state: "Uttar Pradesh", dist: 610, basePrice: 2640 },
    { name: "Kota Krishi Upaj Mandi", district: "Kota", state: "Rajasthan", dist: 590, basePrice: 2680 }
  ],
  apple: [
    { name: "Shimla APMC Yard (Fruit Hub)", district: "Shimla", state: "Himachal Pradesh", dist: 850, basePrice: 5500 },
    { name: "Sopore Fruit Mandi (Kashmir)", district: "Baramulla", state: "Jammu & Kashmir", dist: 1250, basePrice: 5200 },
    { name: "Azadpur APMC", district: "North Delhi", state: "Delhi", dist: 650, basePrice: 7200 },
    { name: "Koyambedu APMC", district: "Chennai", state: "Tamil Nadu", dist: 140, basePrice: 8500 }
  ],
  turmeric: [
    { name: "Erode Turmeric APMC (Turmeric City)", district: "Erode", state: "Tamil Nadu", dist: 120, basePrice: 11000 },
    { name: "Nizamabad APMC Market", district: "Nizamabad", state: "Telangana", dist: 280, basePrice: 11400 },
    { name: "Sangli Turmeric Yard", district: "Sangli", state: "Maharashtra", dist: 420, basePrice: 12200 }
  ],
  cotton: [
    { name: "Warangal Cotton Yard", district: "Warangal", state: "Telangana", dist: 140, basePrice: 6200 },
    { name: "Rajkot APMC Mandi", district: "Rajkot", state: "Gujarat", dist: 680, basePrice: 6550 },
    { name: "Adoni APMC Market", district: "Kurnool", state: "Andhra Pradesh", dist: 220, basePrice: 6300 }
  ],
  tomato: [
    { name: "Madanapalle APMC (Tomato Hub)", district: "Annamayya", state: "Andhra Pradesh", dist: 45, basePrice: 1200 },
    { name: "Kolar APMC Tomato Yard", district: "Kolar", state: "Karnataka", dist: 85, basePrice: 1350 },
    { name: "Chittoor Local APMC", district: "Chittoor", state: "Andhra Pradesh", dist: 12, basePrice: 1250 },
    { name: "Koyambedu APMC", district: "Chennai", state: "Tamil Nadu", dist: 140, basePrice: 1900 }
  ]
};

export function getMandiComparison(crop: Crop, userState: string = "Andhra Pradesh"): MandiInfo[] {
  const customMandis = CROP_SPECIFIC_MANDIS[crop.id];
  const mandis = customMandis || REGIONAL_MANDIS[userState] || REGIONAL_MANDIS["Andhra Pradesh"];
  const baseline = crop.basePrice;

  const result: MandiInfo[] = mandis.map((m, idx) => {
    const price = m.basePrice ? m.basePrice : Math.round(baseline * (1 + (idx === 0 ? 0 : idx * 0.08)));
    const diff = price - baseline;

    return {
      id: `mandi_${idx}_${crop.id}`,
      mandiName: m.name,
      district: m.district,
      state: m.state,
      distanceKm: m.dist,
      price: price,
      priceDiff: diff,
      arrivalsTons: Math.floor(180 + (5 - idx) * 65 + (idx % 3) * 25),
      trend: diff > 0 ? "up" : diff < 0 ? "down" : "stable"
    };
  });

  // Highlight highest paying mandi dynamically per crop
  let highestIdx = 0;
  for (let i = 1; i < result.length; i++) {
    if (result[i].price > result[highestIdx].price) {
      highestIdx = i;
    }
  }
  result[highestIdx].isBestChoice = true;

  return result;
}


// ── 2. STATE CROP CALENDAR DATA ENGINE ───────────────────────────────────────
export interface CropCalendarItem {
  id: string;
  cropId: string;
  cropName: string;
  cropEmoji: string;
  category: string;
  season: "Kharif" | "Rabi" | "Zaid" | "Annual";
  sowingMonths: number[];
  irrigationMonths: number[];
  harvestMonths: number[];
  waterRequirement: "High" | "Medium" | "Low";
  advisory: string;
}

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getCropCalendarData(userState: string = "Andhra Pradesh"): CropCalendarItem[] {
  return [
    {
      id: "cal_rice",
      cropId: "rice",
      cropName: "Rice (Paddy)",
      cropEmoji: "🌾",
      category: "Cereals",
      season: "Kharif",
      sowingMonths: [6, 7],
      irrigationMonths: [7, 8, 9, 10],
      harvestMonths: [10, 11, 12],
      waterRequirement: "High",
      advisory: `In ${userState}, ensure standing water level of 3-5cm during tillering stage. Harvest when 80% grains turn golden yellow.`
    },
    {
      id: "cal_wheat",
      cropId: "wheat",
      cropName: "Wheat",
      cropEmoji: "🌾",
      category: "Cereals",
      season: "Rabi",
      sowingMonths: [10, 11],
      irrigationMonths: [11, 12, 1, 2],
      harvestMonths: [3, 4],
      waterRequirement: "Medium",
      advisory: "Critical irrigation stages: Crown Root Initiation (21 days post sowing) and Flowering stage."
    },
    {
      id: "cal_cotton",
      cropId: "cotton",
      cropName: "Cotton",
      cropEmoji: "☁️",
      category: "Cash Crops",
      season: "Kharif",
      sowingMonths: [5, 6],
      irrigationMonths: [6, 7, 8, 9],
      harvestMonths: [10, 11, 12, 1],
      waterRequirement: "Medium",
      advisory: "Monitor for Pink Bollworm during square formation. Maintain clean field drainage during monsoon rain spikes."
    },
    {
      id: "cal_mustard",
      cropId: "mustard",
      cropName: "Mustard",
      cropEmoji: "🌼",
      category: "Oilseeds",
      season: "Rabi",
      sowingMonths: [9, 10],
      irrigationMonths: [10, 11, 12, 1],
      harvestMonths: [2, 3],
      waterRequirement: "Low",
      advisory: "Pre-sowing irrigation is critical for uniform germination. Watch out for Aphid attacks in cool foggy conditions."
    },
    {
      id: "cal_tomato",
      cropId: "tomato",
      cropName: "Tomato",
      cropEmoji: "🍅",
      category: "Vegetables",
      season: "Annual",
      sowingMonths: [1, 2, 6, 7],
      irrigationMonths: [2, 3, 4, 7, 8, 9],
      harvestMonths: [4, 5, 9, 10],
      waterRequirement: "Medium",
      advisory: "Use drip irrigation to prevent fungal leaf spot diseases. Stake plants early to keep fruits off moist soil."
    },
    {
      id: "cal_onion",
      cropId: "onion",
      cropName: "Onion",
      cropEmoji: "🧅",
      category: "Vegetables",
      season: "Rabi",
      sowingMonths: [10, 11],
      irrigationMonths: [11, 12, 1, 2, 3],
      harvestMonths: [4, 5],
      waterRequirement: "Medium",
      advisory: "Stop irrigation 10 days before harvesting to improve bulb storage life and prevent neck rot."
    },
    {
      id: "cal_groundnut",
      cropId: "groundnut",
      cropName: "Groundnut",
      cropEmoji: "🥜",
      category: "Oilseeds",
      season: "Kharif",
      sowingMonths: [6, 7],
      irrigationMonths: [7, 8, 9],
      harvestMonths: [10, 11],
      waterRequirement: "Medium",
      advisory: "Apply Gypsum @ 400 kg/ha during pegging stage to promote pod formation and oil content."
    }
  ];
}


// ── 3. MSP ALERT COMPUTATION ENGINE ──────────────────────────────────────────
export interface MspStatusInfo {
  hasMsp: boolean;
  isBelowMsp: boolean;
  gap: number;
  gapPercent: number;
  statusText: string;
  badgeType: "green" | "red" | "gray";
}

export function getMspStatus(crop: Crop, currentPrice: number): MspStatusInfo {
  if (!crop.msp || crop.msp === 0) {
    return {
      hasMsp: false,
      isBelowMsp: false,
      gap: 0,
      gapPercent: 0,
      statusText: "No Govt MSP Fixed",
      badgeType: "gray"
    };
  }

  const gap = currentPrice - crop.msp;
  const gapPercent = parseFloat(((Math.abs(gap) / crop.msp) * 100).toFixed(1));
  const isBelowMsp = currentPrice < crop.msp;

  return {
    hasMsp: true,
    isBelowMsp,
    gap: Math.abs(Math.round(gap)),
    gapPercent,
    statusText: isBelowMsp
      ? `₹${Math.abs(Math.round(gap))}/qntl Below Govt MSP (₹${crop.msp})`
      : `₹${Math.round(gap)}/qntl Above Govt MSP (₹${crop.msp})`,
    badgeType: isBelowMsp ? "red" : "green"
  };
}


// ── 4. MULTI-TIMEFRAME PRICE HISTORY ENGINE ─────────────────────────────────
export function generatePriceHistoryByTimeframe(
  crop: Crop,
  timeframe: "1M" | "3M" | "1Y" = "1M"
): { date: string; price: number; volume: number; weather: string }[] {
  const daysMap: Record<string, number> = { "1M": 30, "3M": 90, "1Y": 365 };
  const days = daysMap[timeframe] || 30;

  const step = timeframe === "1Y" ? 5 : timeframe === "3M" ? 2 : 1;
  const weatherTypes = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Foggy"];
  const data: { date: string; price: number; volume: number; weather: string }[] = [];

  let price = crop.basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i -= step) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const month = date.getMonth();
    const seasonalFactor = Math.sin((month / 12) * Math.PI * 2) * 0.05;
    const noise = (Math.random() - 0.48) * (crop.basePrice * 0.035);

    price = price * (1 + seasonalFactor * 0.05) + noise;
    price = Math.max(crop.basePrice * 0.68, Math.min(crop.basePrice * 1.42, price));

    const dateFormat = timeframe === "1Y"
      ? date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
      : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

    data.push({
      date: dateFormat,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(7000 + Math.random() * 6000),
      weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
    });
  }

  return data;
}


// ── 5. KCC LOAN & EMI CALCULATOR ENGINE ──────────────────────────────────────
export interface KccLoanResult {
  cropLimit: number;
  postHarvestLimit: number; // 10%
  farmAssetLimit: number; // 20%
  totalSanctionLimit: number;
  baseInterestRate: number; // 7%
  govtSubvention: number; // 3% prompt-repayment incentive
  effectiveInterestRate: number; // blended effective rate on the whole limit (4% when limit <= ₹3 lakh)
  subventionEligibleAmount: number; // portion of the limit (max ₹3 lakh) that gets the 4% rate
  amountAboveCap: number; // portion above ₹3 lakh, charged at the assumed bank rate
  interestSavedViaIncentive: number; // 3% of the eligible portion, per year
  annualInterestAmount: number; // with prompt repayment within 12 months
  monthlyEmi: number; // amortized EMI if repaid in 12 monthly installments
}

// Interest subvention / prompt repayment incentive applies only to the first ₹3 lakh.
export const KCC_SUBVENTION_CAP = 300000;
export const KCC_BASE_RATE = 7.0; // % p.a. on the subvention-eligible portion
export const KCC_PROMPT_REPAYMENT_INCENTIVE = 3.0; // % p.a., only if repaid within 12 months
// ASSUMPTION: banks set their own rate above ₹3 lakh; 7% p.a. is used here for illustration only.
export const KCC_ASSUMED_RATE_ABOVE_CAP = 7.0;

export function amortizedEmi(principal: number, annualRatePercent: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export interface KccInterestResult {
  subventionEligibleAmount: number;
  amountAboveCap: number;
  promptRepaymentEligible: boolean; // repayment period within 12 months
  standardInterest: number; // no prompt-repayment incentive
  promptInterest: number; // interest actually payable for the chosen period
  savings: number;
  totalRepay: number;
}

// Simple interest for `months` (KCC crop loans are short-term). The 3% incentive is
// only granted when the loan is repaid within 12 months, and only on the first ₹3 lakh.
export function calculateKccInterest(principal: number, months: number): KccInterestResult {
  const p = Math.max(0, principal || 0);
  const m = Math.max(0, months || 0);
  const years = m / 12;
  const subventionEligibleAmount = Math.min(p, KCC_SUBVENTION_CAP);
  const amountAboveCap = p - subventionEligibleAmount;
  const promptRepaymentEligible = m > 0 && m <= 12;

  const standardInterest =
    (subventionEligibleAmount * KCC_BASE_RATE / 100 + amountAboveCap * KCC_ASSUMED_RATE_ABOVE_CAP / 100) * years;
  const promptInterest = promptRepaymentEligible
    ? (subventionEligibleAmount * (KCC_BASE_RATE - KCC_PROMPT_REPAYMENT_INCENTIVE) / 100 +
        amountAboveCap * KCC_ASSUMED_RATE_ABOVE_CAP / 100) * years
    : standardInterest;

  return {
    subventionEligibleAmount,
    amountAboveCap,
    promptRepaymentEligible,
    standardInterest,
    promptInterest,
    savings: standardInterest - promptInterest,
    totalRepay: p + promptInterest
  };
}

const SCALE_OF_FINANCE: Record<string, number> = {
  rice: 26000,
  wheat: 23500,
  corn: 21000,
  mustard: 18500,
  soybean: 22000,
  groundnut: 24500,
  sugarcane: 45000,
  cotton: 34000,
  tomato: 38000,
  onion: 35000,
  chilli: 42000,
  banana: 50000,
  mango: 48000
};

export function calculateKccLoan(cropId: string, landAcres: number): KccLoanResult {
  const scalePerAcre = SCALE_OF_FINANCE[cropId] || 25000;
  const cropLimit = Math.round(scalePerAcre * landAcres);
  const postHarvestLimit = Math.round(cropLimit * 0.10);
  const farmAssetLimit = Math.round(cropLimit * 0.20);
  const totalSanctionLimit = cropLimit + postHarvestLimit + farmAssetLimit;

  const baseInterestRate = KCC_BASE_RATE;
  const govtSubvention = KCC_PROMPT_REPAYMENT_INCENTIVE;

  const interest = calculateKccInterest(totalSanctionLimit, 12);
  const annualInterestAmount = Math.round(interest.promptInterest);
  const effectiveInterestRate = totalSanctionLimit > 0
    ? parseFloat(((interest.promptInterest / totalSanctionLimit) * 100).toFixed(2))
    : KCC_BASE_RATE - KCC_PROMPT_REPAYMENT_INCENTIVE;
  const monthlyEmi = Math.round(
    amortizedEmi(interest.subventionEligibleAmount, KCC_BASE_RATE - KCC_PROMPT_REPAYMENT_INCENTIVE, 12) +
    amortizedEmi(interest.amountAboveCap, KCC_ASSUMED_RATE_ABOVE_CAP, 12)
  );

  return {
    cropLimit,
    postHarvestLimit,
    farmAssetLimit,
    totalSanctionLimit,
    baseInterestRate,
    govtSubvention,
    effectiveInterestRate,
    subventionEligibleAmount: interest.subventionEligibleAmount,
    amountAboveCap: interest.amountAboveCap,
    interestSavedViaIncentive: Math.round(interest.savings),
    annualInterestAmount,
    monthlyEmi
  };
}


// ── 6. INPUT COST & PROFIT/LOSS ESTIMATOR ENGINE ────────────────────────────
export interface CultivationCostResult {
  acres: number;
  seedCost: number;
  fertilizerCost: number;
  pesticideCost: number;
  laborCost: number;
  machineryCost: number;
  totalCost: number;
  expectedYieldTotalQuintals: number;
  sellingPricePerQuintal: number;
  grossRevenue: number;
  netProfit: number;
  roiPercent: number;
  isProfitable: boolean;
}

const COST_PER_ACRE: Record<string, { seed: number; fert: number; pest: number; labor: number; machine: number; avgYieldQuintals: number }> = {
  rice: { seed: 1500, fert: 3800, pest: 2200, labor: 6500, machine: 4000, avgYieldQuintals: 25 },
  wheat: { seed: 1800, fert: 3400, pest: 1800, labor: 5000, machine: 3500, avgYieldQuintals: 22 },
  corn: { seed: 2200, fert: 3200, pest: 1500, labor: 4500, machine: 3000, avgYieldQuintals: 28 },
  mustard: { seed: 800, fert: 2500, pest: 1200, labor: 3500, machine: 2500, avgYieldQuintals: 9 },
  soybean: { seed: 2500, fert: 2800, pest: 1800, labor: 4000, machine: 3000, avgYieldQuintals: 10 },
  groundnut: { seed: 3500, fert: 3000, pest: 1500, labor: 5000, machine: 3200, avgYieldQuintals: 12 },
  sugarcane: { seed: 6000, fert: 8000, pest: 3500, labor: 12000, machine: 7500, avgYieldQuintals: 350 },
  cotton: { seed: 3000, fert: 5000, pest: 4500, labor: 8500, machine: 4000, avgYieldQuintals: 14 },
  tomato: { seed: 4000, fert: 6500, pest: 5000, labor: 11000, machine: 4500, avgYieldQuintals: 120 },
  onion: { seed: 3500, fert: 5500, pest: 3800, labor: 9500, machine: 4000, avgYieldQuintals: 100 }
};

// Crops for which per-acre cost & yield data exists (all priced per quintal).
export function hasCultivationCostData(cropId: string): boolean {
  return Object.prototype.hasOwnProperty.call(COST_PER_ACRE, cropId);
}

export function getDefaultYieldPerAcre(cropId: string): number {
  return (COST_PER_ACRE[cropId] || COST_PER_ACRE["rice"]).avgYieldQuintals;
}

export function calculateCultivationCostAndProfit(
  cropId: string,
  acres: number,
  yieldPerAcre?: number,
  sellingPrice?: number
): CultivationCostResult {
  const crop = CROPS.find(c => c.id === cropId) || CROPS[0];
  const defaults = COST_PER_ACRE[cropId] || COST_PER_ACRE["rice"];

  const actualYieldPerAcre = yieldPerAcre || defaults.avgYieldQuintals;
  const actualPrice = sellingPrice || crop.basePrice;

  const seedCost = defaults.seed * acres;
  const fertilizerCost = defaults.fert * acres;
  const pesticideCost = defaults.pest * acres;
  const laborCost = defaults.labor * acres;
  const machineryCost = defaults.machine * acres;

  const totalCost = seedCost + fertilizerCost + pesticideCost + laborCost + machineryCost;
  const expectedYieldTotalQuintals = Math.round(actualYieldPerAcre * acres);
  const grossRevenue = Math.round(expectedYieldTotalQuintals * actualPrice);
  const netProfit = grossRevenue - totalCost;
  const roiPercent = totalCost > 0 ? parseFloat(((netProfit / totalCost) * 100).toFixed(1)) : 0;

  return {
    acres,
    seedCost,
    fertilizerCost,
    pesticideCost,
    laborCost,
    machineryCost,
    totalCost,
    expectedYieldTotalQuintals,
    sellingPricePerQuintal: actualPrice,
    grossRevenue,
    netProfit,
    roiPercent,
    isProfitable: netProfit >= 0
  };
}


// ── 7. VOLATILITY INDEX & MARKET HEATMAP ENGINE ─────────────────────────────
export interface CropVolatilityInfo {
  cropId: string;
  cropName: string;
  cropEmoji: string;
  category: string;
  currentPrice: number;
  weeklyChangePercent: number;
  volatilityScore: number; // 0 to 100
  riskLevel: "High" | "Moderate" | "Low";
  recommendedAction: string;
}

export function getCropVolatilityList(): CropVolatilityInfo[] {
  // Pre-calculated volatility indices for all crops
  return CROPS.map((c, idx) => {
    const isPerishable = c.category === "Vegetables" || c.category === "Fruits";
    const baseVol = isPerishable ? 65 + (idx % 4) * 8 : 18 + (idx % 5) * 6;
    
    // Simulate weekly change
    const change = isPerishable
      ? (idx % 2 === 0 ? 8.4 - idx * 1.2 : -7.2 + idx * 0.9)
      : (idx % 2 === 0 ? 2.1 - idx * 0.4 : -1.8 + idx * 0.3);

    const volatilityScore = Math.min(95, Math.max(12, Math.round(baseVol)));
    const riskLevel: "High" | "Moderate" | "Low" = volatilityScore > 60 ? "High" : volatilityScore > 35 ? "Moderate" : "Low";

    let recommendedAction = "Stable market. Normal trading recommended.";
    if (riskLevel === "High") {
      recommendedAction = change < 0
        ? "Sharp price drop detected! Hold stock or sell at highest-paying APMC Mandi."
        : "High demand spike! Capitalize on peak prices now.";
    }

    return {
      cropId: c.id,
      cropName: c.name,
      cropEmoji: c.emoji,
      category: c.category,
      currentPrice: c.basePrice,
      weeklyChangePercent: parseFloat(change.toFixed(1)),
      volatilityScore,
      riskLevel,
      recommendedAction
    };
  }).sort((a, b) => b.volatilityScore - a.volatilityScore);
}


// ── 8. PM-KISAN INSTALLMENT TRACKER ENGINE ───────────────────────────────────
export const PM_KISAN_PORTAL_URL = "https://pmkisan.gov.in";

export interface PmKisanInstallment {
  number: number;
  amount: number;
  releaseDate: string; // nationwide release date of the installment
}

export interface PmKisanRecord {
  beneficiaryName: string;
  registrationNo: string;
  aadhaarSeeded: boolean;
  ekycStatus: boolean;
  landSeedingStatus: boolean;
  state: string;
  district: string;
  installments: PmKisanInstallment[];
}

// DEMO ONLY: this app cannot look up real PM-KISAN beneficiary records.
// Installment numbers/dates below are the official nationwide release dates.
export function getPmKisanSampleRecord(): PmKisanRecord {
  return {
    beneficiaryName: "Sample Farmer (Demo)",
    registrationNo: "DEMO-RECORD",
    aadhaarSeeded: true,
    ekycStatus: true,
    landSeedingStatus: true,
    state: "Andhra Pradesh",
    district: "Guntur",
    installments: [
      { number: 21, amount: 2000, releaseDate: "19 Nov 2025" },
      { number: 20, amount: 2000, releaseDate: "02 Aug 2025" },
      { number: 19, amount: 2000, releaseDate: "24 Feb 2025" },
      { number: 18, amount: 2000, releaseDate: "05 Oct 2024" },
      { number: 17, amount: 2000, releaseDate: "18 Jun 2024" },
      { number: 16, amount: 2000, releaseDate: "28 Feb 2024" },
      { number: 15, amount: 2000, releaseDate: "15 Nov 2023" }
    ]
  };
}


// ── 9. NEARBY FARMER NETWORK ENGINE ──────────────────────────────────────────
export interface DistrictCropShare {
  cropId: string;
  cropName: string;
  cropEmoji: string;
  sharePercent: number;
  totalFarmers: number;
  trendingStatus: "Growing ↑" | "Stable →" | "Declining ↓";
}

export interface NearbyFarmerNetworkInfo {
  district: string;
  state: string;
  totalActiveFarmers: number;
  topCrops: DistrictCropShare[];
}

export function getNearbyFarmerNetwork(district: string = "Guntur", state: string = "Andhra Pradesh"): NearbyFarmerNetworkInfo {
  return {
    district,
    state,
    totalActiveFarmers: 14820,
    topCrops: [
      { cropId: "rice", cropName: "Rice (Paddy)", cropEmoji: "🌾", sharePercent: 42.5, totalFarmers: 6300, trendingStatus: "Growing ↑" },
      { cropId: "chilli", cropName: "Red Chilli", cropEmoji: "🌶️", sharePercent: 28.0, totalFarmers: 4150, trendingStatus: "Growing ↑" },
      { cropId: "cotton", cropName: "Cotton", cropEmoji: "☁️", sharePercent: 16.5, totalFarmers: 2440, trendingStatus: "Stable →" },
      { cropId: "tomato", cropName: "Tomato", cropEmoji: "🍅", sharePercent: 8.0, totalFarmers: 1180, trendingStatus: "Growing ↑" },
      { cropId: "corn", cropName: "Corn (Maize)", cropEmoji: "🌽", sharePercent: 5.0, totalFarmers: 750, trendingStatus: "Declining ↓" }
    ]
  };
}


// ── 10. MULTILINGUAL DOCUMENT OCR SIMULATOR ENGINE ───────────────────────────
export interface OcrResult {
  documentType: string;
  extractedTitle: string;
  extractedDate: string;
  issuerAuthority: string;
  summaryEN: string;
  summaryTA: string;
  summaryTE: string;
  actionItems: string[];
}

export function processDocumentOcr(fileName: string): OcrResult {
  const name = fileName.toLowerCase();

  // PM-KISAN / e-KYC
  if (name.includes("pm-kisan") || name.includes("pmkisan") || name.includes("ekyc") || name.includes("e-kyc") || name.includes("kyc")) {
    return {
      documentType: "Government Welfare Scheme Notice",
      extractedTitle: "PM-KISAN e-KYC Verification & 20th Installment Guidelines 2026",
      extractedDate: "15 July 2026",
      issuerAuthority: "Ministry of Agriculture & Farmers Welfare, Govt of India",
      summaryEN: "Mandatory e-KYC required before 31 August 2026 to receive the PM-KISAN 20th installment of ₹2,000. Farmers must link Aadhaar with their bank account for DBT. KCC loan repayment within 12 months qualifies for an extra 3% interest subvention.",
      summaryTA: "20வது PM-KISAN தவணை (₹2,000) பெற ஆகஸ்ட் 31, 2026க்குள் e-KYC முடிப்பது கட்டாயம். விவசாயிகள் வங்கி கணக்கில் ஆதார் இணைக்க வேண்டும். 12 மாதங்களுக்குள் KCC கடனை திருப்பிச் செலுத்தினால் 3% கூடுதல் வட்டி மானியம் கிடைக்கும்.",
      summaryTE: "20వ PM-KISAN వాయిదా (₹2,000) పొందడానికి 31 ఆగస్టు 2026 లోపు e-KYC పూర్తి చేయడం తప్పనిసరి. రైతులు తమ బ్యాంక్ ఖాతాతో ఆధార్ అనుసంధానించాలి. 12 నెలల్లో KCC రుణం చెల్లిస్తే 3% అదనపు వడ్డీ రాయితీ పొందవచ్చు.",
      actionItems: [
        "Complete e-KYC at nearest CSC or via PM-KISAN app before 31 August 2026.",
        "Link Aadhaar with bank account for Direct Benefit Transfer (DBT).",
        "Repay KCC crop loan within 12 months to claim 3% subvention.",
        "Contact local Patwari or Agriculture Officer if e-KYC fails."
      ]
    };
  }

  // KCC / Kisan Credit Card / Loan
  if (name.includes("kcc") || name.includes("kisan_credit") || name.includes("loan") || name.includes("credit") || name.includes("subsidy_loan")) {
    return {
      documentType: "Agricultural Loan Sanction Letter",
      extractedTitle: "Kisan Credit Card (KCC) Loan Sanction & Interest Subvention Notice 2026",
      extractedDate: "01 June 2026",
      issuerAuthority: "NABARD / State Co-operative Bank",
      summaryEN: "KCC crop loan sanctioned at 4% effective interest rate (7% minus 3% subvention). Loan limit up to ₹3 lakh per season. Mandatory PMFBY crop insurance enrollment required. Repayment deadline is 12 months from disbursement. Late repayment attracts 2% penal interest.",
      summaryTA: "KCC பயிர் கடன் 4% வட்டி விகிதத்தில் (7% கழித்து 3% மானியம்) வழங்கப்படுகிறது. ₹3 லட்சம் வரை கடன். கட்டாய PMFBY பயிர் காப்பீடு பதிவு தேவை. திருப்பிச் செலுத்தும் கடைசி தேதி 12 மாதங்கள். தாமதம் 2% கூடுதல் வட்டி.",
      summaryTE: "KCC పంట రుణం 4% వడ్డీ రేటులో (7% మైనస్ 3% రాయితీ) మంజూరు. ₹3 లక్షల వరకు రుణ పరిమితి. తప్పనిసరి PMFBY పంట బీమా నమోదు అవసరం. చెల్లింపు గడువు 12 నెలలు. ఆలస్యానికి 2% అదనపు వడ్డీ.",
      actionItems: [
        "Collect KCC passbook from bank branch within 7 working days.",
        "Enroll in PMFBY crop insurance before sowing season.",
        "Repay full loan within 12 months to avail 3% interest subvention.",
        "Maintain crop records and submit to bank at harvest time.",
        "Renew KCC before expiry for next season credit."
      ]
    };
  }

  // PMFBY / Crop Insurance
  if (name.includes("pmfby") || name.includes("insurance") || name.includes("crop_insurance") || name.includes("fasal") || name.includes("bima")) {
    return {
      documentType: "Crop Insurance Policy Certificate",
      extractedTitle: "PMFBY Pradhan Mantri Fasal Bima Yojana — Kharif 2026 Enrollment",
      extractedDate: "20 May 2026",
      issuerAuthority: "Agriculture Insurance Company of India (AIC)",
      summaryEN: "PMFBY enrollment for Kharif 2026. Farmer premium capped at 2% of sum insured. Coverage includes yield loss due to drought, flood, pest, and post-harvest damage. Claims settled within 2 months of crop cutting experiment (CCE). Insured amount credited directly to Aadhaar-linked bank account.",
      summaryTA: "கரீஃப் 2026க்கான PMFBY பதிவு. விவசாயி பிரீமியம் காப்பீடு தொகையில் 2% மட்டுமே. வறட்சி, வெள்ளம், பூச்சி தாக்குதல் மற்றும் அறுவடை பிந்தைய நஷ்டங்களுக்கு கவரேஜ். காப்பீடு தொகை ஆதார் இணைந்த வங்கி கணக்கில் நேரடியாக வரவு வைக்கப்படும்.",
      summaryTE: "ఖరీఫ్ 2026కు PMFBY నమోదు. రైతు ప్రీమియం బీమా మొత్తంలో 2% మాత్రమే. కరువు, వరద, తెగులు మరియు పంట కోత నష్టాలకు కవరేజ్. బీమా మొత్తం ఆధార్ అనుసంధానిత బ్యాంక్ ఖాతాలో నేరుగా జమ అవుతుంది.",
      actionItems: [
        "Submit enrollment form with land records before 31 July 2026 deadline.",
        "Pay 2% farmer premium to bank or CSC before sowing.",
        "Inform insurer within 72 hours of any crop damage for assessment.",
        "Keep passbook ready — claim amount credited to Aadhaar-linked account.",
        "Contact block-level agriculture officer for crop cutting experiments."
      ]
    };
  }

  // MSP / Procurement / APMC
  if (name.includes("msp") || name.includes("minimum_support") || name.includes("procurement") || name.includes("price_support") || name.includes("apmc")) {
    return {
      documentType: "MSP Procurement & Price Support Notification",
      extractedTitle: "Minimum Support Price (MSP) & Government Procurement Schedule — Kharif 2026",
      extractedDate: "10 June 2026",
      issuerAuthority: "Food Corporation of India (FCI) / State Procurement Agency",
      summaryEN: "MSP announced for 14 Kharif crops. Paddy: ₹2,441/quintal. Cotton: ₹8,267/quintal. Maize: ₹2,410/quintal. Farmers must register on e-NAM portal before Oct 1. Procurement window: 1 Oct – 30 Nov 2026. Required: Aadhaar, bank passbook, land records (Khasra/Patta).",
      summaryTA: "14 கரீஃப் பயிர்களுக்கு MSP அறிவிக்கப்பட்டது. நெல்: ₹2,441/குவிண்டால். பருத்தி: ₹8,267/குவிண்டால். கொள்முதல் சாளரம்: அக்டோபர் 1 – நவம்பர் 30. e-NAM போர்டலில் முன்பதிவு கட்டாயம்.",
      summaryTE: "14 ఖరీఫ్ పంటలకు MSP ప్రకటించారు. వరి: ₹2,441/క్వింటాల్. పత్తి: ₹8,267/క్వింటాల్. సేకరణ విండో: అక్టోబర్ 1 – నవంబర్ 30. e-NAM పోర్టల్‌లో ముందస్తు నమోదు తప్పనిసరి.",
      actionItems: [
        "Register on e-NAM portal (enam.gov.in) before October 1, 2026.",
        "Bring produce to nearest APMC mandi in procurement window (Oct 1–Nov 30).",
        "Carry Aadhaar, bank passbook, and Khasra/Patta land documents.",
        "Ensure clean and graded produce as per FCI quality norms.",
        "MSP amount credited within 72 hours after quality inspection."
      ]
    };
  }

  // Soil Health / Fertilizer
  if (name.includes("soil") || name.includes("soil_health") || name.includes("fertilizer") || name.includes("urea") || name.includes("nutrient")) {
    return {
      documentType: "Soil Health Card & Fertilizer Advisory",
      extractedTitle: "Soil Health Card — Nutrient Status & Fertilizer Recommendations 2026",
      extractedDate: "March 2026",
      issuerAuthority: "State Agriculture Department / Soil Testing Laboratory",
      summaryEN: "Soil test results: Nitrogen — Medium, Phosphorus — Low, Potassium — Adequate. pH: 6.8 (suitable for most crops). Recommendations: Apply 120 kg Urea + 60 kg DAP + 30 kg MOP per hectare before sowing. Add 10 tonnes farmyard manure. Use neem-coated urea to reduce nitrogen loss. Next test after 2 years.",
      summaryTA: "மண் பரிசோதனை முடிவுகள்: நைட்ரஜன் நடுத்தரம், பாஸ்பரஸ் குறைவு, பொட்டாசியம் போதுமானது. pH: 6.8. பரிந்துரை: ஹெக்டேருக்கு 120 கிலோ யூரியா + 60 கிலோ DAP + 30 கிலோ MOP இடவும். 10 டன் தொழு உரமும் சேர்க்கவும்.",
      summaryTE: "మట్టి పరీక్ష ఫలితాలు: నైట్రోజన్ మధ్యస్థం, ఫాస్పరస్ తక్కువ, పొటాషియం సరిపడా. pH: 6.8. సిఫారసు: హెక్టారుకు 120 కిలో యూరియా + 60 కిలో DAP + 30 కిలో MOP వేయాలి. 10 టన్నుల పశువుల ఎరువు కలపాలి.",
      actionItems: [
        "Apply recommended NPK fertilizer in 3 split doses (basal + top dressing).",
        "Add 10 tonnes farmyard manure/hectare to improve organic carbon.",
        "Use neem-coated urea to reduce nitrogen volatilization losses.",
        "Avoid excess fertilizer — follow soil card recommendations strictly.",
        "Get next soil test after 2 years from nearest Krishi Vigyan Kendra."
      ]
    };
  }

  // Irrigation / Water
  if (name.includes("irrigation") || name.includes("water") || name.includes("drip") || name.includes("micro_irrigation") || name.includes("sinchayee")) {
    return {
      documentType: "Irrigation Scheme Subsidy Notice",
      extractedTitle: "PM Krishi Sinchayee Yojana — Drip & Sprinkler Subsidy 2026",
      extractedDate: "1 April 2026",
      issuerAuthority: "Department of Agriculture, Cooperation & Farmers Welfare",
      summaryEN: "Subsidy up to 55% for small/marginal farmers for drip & sprinkler systems under PMKSY 2026. Maximum subsidy: ₹1.4 lakh/hectare for drip, ₹75,000 for sprinkler. Apply online via state agriculture portal before 31 August. Drip irrigation saves up to 40% water and increases yield by 20–30%.",
      summaryTA: "PMKSY 2026 கீழ் சிறு/குறு விவசாயிகளுக்கு டிரிப் & ஸ்பிரிங்க்லருக்கு 55% வரை மானியம். டிரிப்புக்கு ₹1.4 லட்சம், ஸ்பிரிங்க்லருக்கு ₹75,000 அதிகபட்ச மானியம். ஆகஸ்ட் 31 கடைசி தேதி.",
      summaryTE: "PMKSY 2026 కింద చిన్న/సన్నకారు రైతులకు డ్రిప్ & స్ప్రింక్లర్‌కు 55% వరకు సబ్సిడీ. డ్రిప్‌కు ₹1.4 లక్షలు, స్ప్రింక్లర్‌కు ₹75,000 గరిష్ట సబ్సిడీ. చివరి తేది 31 ఆగస్టు.",
      actionItems: [
        "Apply online via state agriculture portal before 31 August 2026.",
        "Submit land records, Aadhaar, bank passbook, and approved vendor quotation.",
        "Get pre-inspection certificate from agriculture officer before installation.",
        "Purchase equipment only from PMKSY-approved vendor list.",
        "Subsidy credited after post-installation inspection by department."
      ]
    };
  }

  // Default fallback — generic document
  const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return {
    documentType: "General Government Agricultural Document",
    extractedTitle: cleanName || "Government Agricultural Notice",
    extractedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
    issuerAuthority: "State / Central Agriculture Department",
    summaryEN: `This uploaded document appears to be an agricultural government notice or circular. It likely contains scheme details, subsidy information, eligibility criteria, and deadlines for farmer welfare programs. Please visit your nearest Krishi Vigyan Kendra (KVK) or Common Service Centre (CSC) for personalized guidance.`,
    summaryTA: `இந்த ஆவணம் ஒரு விவசாய அரசு அறிவிப்பு அல்லது சுற்றறிக்கை. திட்டங்கள், மானியங்கள் மற்றும் கடைசி தேதிகள் பற்றிய முக்கியமான தகவல்களை இது கொண்டிருக்கலாம். விரிவான வழிகாட்டுதலுக்கு அருகிலுள்ள KVK அல்லது CSC-ஐ தொடர்பு கொள்ளவும்.`,
    summaryTE: `ఈ పత్రం వ్యవసాయ ప్రభుత్వ నోటీసు లేదా సర్క్యులర్‌గా కనిపిస్తోంది. పథకాలు, రాయితీలు మరియు గడువులు గురించి ముఖ్యమైన సమాచారాన్ని కలిగి ఉండవచ్చు. వివరణాత్మక మార్గదర్శకత్వం కోసం సమీపంలోని KVK లేదా CSC సందర్శించండి.`,
    actionItems: [
      "Read document carefully for eligibility criteria and required documents.",
      "Note all deadlines — agricultural scheme windows are time-limited.",
      "Visit nearest Krishi Vigyan Kendra (KVK) for free expert advice.",
      "Check state agriculture department portal for online applications.",
      "Ensure Aadhaar is linked to your bank account for direct benefit transfer."
    ]
  };
}


const CROP_TRANSLATIONS: Record<string, { kn: string; ml: string; hi: string }> = {
  rice: { kn: "ಅಕ್ಕಿ (ಭತ್ತ)", ml: "അരി (നെല്ല്)", hi: "चावल (धान)" },
  wheat: { kn: "ಗೋಧಿ", ml: "ഗോതമ്പ്", hi: "गेहूं" },
  corn: { kn: "ಮೆಕ್ಕೆಜೋಳ", ml: "ചോളം", hi: "मक्का" },
  mustard: { kn: "ಸಾಸಿವೆ", ml: "കടുക്", hi: "सरसों" },
  cotton: { kn: "ಹತ್ತಿ", ml: "പരുത്തി", hi: "कपास" },
  tomato: { kn: "ಟೊಮೆಟೊ", ml: "തക്കാളി", hi: "टमाटर" },
  onion: { kn: "ಈರುಳ್ಳಿ", ml: "സവാള", hi: "प्याज" },
  potato: { kn: "ಆಲೂಗಡ್ಡೆ", ml: "ഉരുളക്കിഴങ്ങ്", hi: "आलू" },
  turmeric: { kn: "ಅರಿಶಿನ", ml: "മഞ്ഞൾ", hi: "हल्दी" },
  chilli: { kn: "ಮೆಣಸಿನಕಾಯಿ", ml: "മുളക്", hi: "मिर्च" },
  soybean: { kn: "ಸೋಯಾಬೀನ್", ml: "സോയാബീൻ", hi: "सोयाबीन" },
  groundnut: { kn: "ಕಡಲೆಕಾಯಿ", ml: "നിലക്കടല", hi: "मूंगफली" },
  sugarcane: { kn: "ಕಬ್ಬು", ml: "കരിമ്പ്", hi: "गन्ना" },
  cabbage: { kn: "ಎಲೆಕೋಸು", ml: "കാബേജ്", hi: "पत्ता गोभी" },
  cauliflower: { kn: "ಹೂಕೋಸು", ml: "കോളിഫ്ലവർ", hi: "फूलगोभी" },
  eggplant: { kn: "ಬದನೆಕಾಯಿ", ml: "വഴുതനങ്ങ", hi: "बैंगन" },
  okra: { kn: "ಬೆಂಡೆಕಾಯಿ", ml: "വെണ്ടയ്ക്ക", hi: "भिंडी" },
  carrot: { kn: "ಕ್ಯಾರೆಟ್", ml: "കാരറ്റ്", hi: "गाजर" },
  mango: { kn: "ಮಾವಿನ ಹಣ್ಣು", ml: "മാമ്പഴം", hi: "आम" },
  banana: { kn: "ಬಾಳೆಹಣ್ಣು", ml: "വാഴപ്പഴം", hi: "केला" },
  apple: { kn: "ಸೇಬು", ml: "ആപ്പിൾ", hi: "सेब" },
  grape: { kn: "ದ್ರಾಕ್ಷಿ", ml: "മുന്തിരി", hi: "अंगूर" },
  papaya: { kn: "ಪರಂಗಿ ಹಣ್ಣು", ml: "പപ്പായ", hi: "पपीता" },
  orange: { kn: "ಕಿತ್ತಳೆ", ml: "ഓറഞ്ച്", hi: "संतरा" },
  pomegranate: { kn: "ದಾಳಿಂಬೆ", ml: "മാതളനാരങ്ങ", hi: "अनार" },
  gram: { kn: "ಕಡಲೆ", ml: "കടല", hi: "चना" },
  tur: { kn: "ತೊಗರಿ ಬೇಳೆ", ml: "തുവരപ്പരിപ്പ്", hi: "अरहर (तूर)" },
  moong: { kn: "ಹೆಸರು ಬೇಳೆ", ml: "ചെറുപയർ", hi: "मूंग" },
  urad: { kn: "ಉದ್ದಿನ ಬೇಳೆ", ml: "ഉഴുന്ന്", hi: "उड़द" },
  ginger: { kn: "ಶುಂಠಿ", ml: "ഇഞ്ചി", hi: "अदरक" },
  garlic: { kn: "ಬೆಳ್ಳುಳ್ಳಿ", ml: "വെളുത്തുള്ളി", hi: "लहसुन" }
};

export function getCropName(crop: Crop, lang: string): string {
  if (lang === "ta") return crop.nameTA || crop.name;
  if (lang === "te") return crop.nameTE || crop.name;
  if (CROP_TRANSLATIONS[crop.id] && CROP_TRANSLATIONS[crop.id][lang as "kn" | "ml" | "hi"]) {
    return CROP_TRANSLATIONS[crop.id][lang as "kn" | "ml" | "hi"];
  }
  return crop.name;
}

export function getCropDesc(crop: Crop, lang: string): string {
  if (lang === "ta") return crop.descTA || crop.description;
  if (lang === "te") return crop.descTE || crop.description;
  return crop.description;
}

export function getVarietyName(v: CropVariety, lang: string): string {
  if (lang === "ta") return v.nameTA || v.name;
  if (lang === "te") return v.nameTE || v.name;
  if (lang === "kn") return v.nameKN || v.name;
  if (lang === "ml") return v.nameML || v.name;
  if (lang === "hi") return v.nameHI || v.name;
  return v.name;
}

export function getVarietyDesc(v: CropVariety, lang: string): string {
  if (lang === "ta") return v.characteristicsTA || v.characteristics;
  if (lang === "te") return v.characteristicsTE || v.characteristics;
  if (lang === "kn") return v.characteristicsKN || v.characteristics;
  if (lang === "ml") return v.characteristicsML || v.characteristics;
  if (lang === "hi") return v.characteristicsHI || v.characteristics;
  return v.characteristics;
}
