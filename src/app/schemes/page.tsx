"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useApp, Language } from "@/lib/AppContext";
import { ALL_GOVERNMENT_SCHEMES, SchemeItem } from "@/lib/governmentSchemesData";
import { getCategoryLabel, getStateLabel, getLocalizedScheme } from "@/lib/schemeTranslations";
import { tr, type Localized } from "@/lib/i18n";

// Translations for AgriSaarthi portal
const PORTAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    brandTitle: "AgriSaarthi",
    portalSubtitle: "Government Schemes & Farmer Benefits",
    dashboard: "Dashboard",
    refresh: "Refresh",
    searchPlaceholder: "Search government schemes...",
    allCategories: "All Categories",
    allStates: "All States",
    verifiedBannerTitle: "Showing Verified Government Schemes",
    verifiedBannerSub: "All-India government schemes and verified state-specific schemes are shown.",
    schemesCount: "Schemes Available",
    viewDetails: "View Details",
    addToCompare: "Add to Compare",
    inCompare: "In Compare",
    officialSource: "Official Portal",
    keyBenefit: "Key Benefit",
    documentsReq: "Documents",
    save: "Save",
    saved: "Saved",
    eligibilityTitle: "Eligibility Criteria",
    documentsChecklist: "Documents Checklist",
    howToApply: "How to Apply",
    close: "Close",
    
    // Quick action cards
    cardSchemesTitle: "Government Schemes",
    cardSchemesDesc: "Find government schemes, subsidies and financial support available for farmers.",
    cardAlertsTitle: "Scheme Alerts",
    cardAlertsDesc: "Get notifications about new schemes, updates and important deadlines.",
    cardSavedTitle: "Saved Schemes",
    cardSavedDesc: "Bookmark important government schemes for quick access later.",
    cardCompareTitle: "Compare Schemes",
    cardCompareDesc: "Compare benefits, categories and coverage of different schemes.",
    cardCentersTitle: "Nearby Help Centers",
    cardCentersDesc: "Use your location to find nearby government agriculture services.",
    cardAskTitle: "Ask About This",
    cardAskDesc: "Take a photo of a scheme or government notice",
    cardEligibilityTitle: "Check Eligibility",
    cardEligibilityDesc: "Find schemes you may qualify for",
    cardApplicationsTitle: "My Applications",
    cardApplicationsDesc: "Track your scheme applications",
    cardCalculatorsTitle: "Subsidy Calculators",
    cardCalculatorsDesc: "Calculate PMFBY insurance subsidy and KCC low-interest savings.",

    // Calculators
    tabCalculators: "Subsidy Calculators",
    pmfbyHeader: "PMFBY Insurance Premium & Subsidy Calculator",
    pmfbySelectCrop: "Select Crop Category",
    pmfbyArea: "Cultivated Area (in Hectares)",
    pmfbySumInsured: "Sum Insured (₹ per Hectare)",
    pmfbyResultTotalIns: "Total Sum Insured:",
    pmfbyResultFarmerPrem: "Farmer Premium Share (payable):",
    pmfbyResultGovSub: "Government Subsidy Share (free):",
    pmfbyResultTotalPrem: "Total Actuarial Premium:",
    showing: "Showing",
    of: "of",
    detectedState: "My Detected State",
    resetFilters: "Reset All Filters",
    requiredLabel: "Required",
    searchPrefix: "Search",
    activeView: "Active View",
    backToSchemes: "Back to All Schemes",
    savedCountLabel: "Saved",
    ocrScanBadge: "OCR Scan",
    schemesSelectedCompare: "Schemes Selected for Comparison",
    viewCompareTable: "View Comparison Table",
    clearComparison: "Clear Comparison",
    compareMinTwo: "Select at least 2 schemes to compare",
    returnToList: "Return to Scheme List",
    clearAllSaved: "Clear All Saved",
    noSavedTitle: "No Saved Schemes Yet",
    exploreAllSchemes: "Explore All Government Schemes",
    remove: "Remove",
    visitOfficialPortal: "Visit Official Government Portal",
    noSchemesFound: "No Government Schemes Found",
    noSchemesDesc: "Try adjusting your search terms or resetting the category and state filters.",
    nationalSchemes: "(National Schemes)",
    featureAttribute: "Feature / Attribute",
    categoryCol: "Category",
    coverageCol: "State / Coverage",
    documentsCol: "Documents Needed",
    actionCol: "Action",
    kccHeader: "KCC Loan Interest & Repayment Savings Calculator",
    kccAmount: "Loan Amount (₹)",
    kccPeriod: "Repayment Period (Months)",
    kccInterestStandard: "Standard Interest (7%):",
    kccInterestPrompt: "Prompt Repayment Interest (4%):",
    kccTotalSavings: "Total Interest Savings:",
    kccRepaymentTotal: "Total Repayment (with prompt rebate):"
  },
  ta: {
    brandTitle: "அக்ரி சாரதி",
    portalSubtitle: "அரசு திட்டங்கள் & விவசாயி நலன்கள்",
    dashboard: "முகப்பு பலகை",
    refresh: "புதுப்பி",
    searchPlaceholder: "அரசு திட்டங்களைத் தேடுக...",
    allCategories: "அனைத்து பிரிவுகள்",
    allStates: "அனைத்து மாநிலங்கள்",
    verifiedBannerTitle: "சரிபார்க்கப்பட்ட அரசு திட்டங்கள் காட்டப்படுகின்றன",
    verifiedBannerSub: "அனைத்திந்திய மத்திய திட்டங்கள் மற்றும் மாநில திட்டங்கள் சரிபார்க்கப்பட்டு பட்டியலிடப்பட்டுள்ளன.",
    schemesCount: "திட்டங்கள் உள்ளன",
    viewDetails: "முழு விவரங்கள்",
    addToCompare: "ஒப்பிடுக",
    inCompare: "ஒப்பீட்டில் உள்ளது",
    officialSource: "அதிகாரப்பூர்வ தளம்",
    keyBenefit: "முக்கிய பலன்கள்",
    documentsReq: "ஆவணங்கள்",
    save: "சேமி",
    saved: "சேமிக்கப்பட்டது",
    eligibilityTitle: "தகுதி வரம்புகள்",
    documentsChecklist: "தேவையான ஆவணங்கள் பட்டியல்",
    howToApply: "விண்ணப்பிப்பது எப்படி",
    close: "மூடுக",
    
    cardSchemesTitle: "அரசு திட்டங்கள்",
    cardSchemesDesc: "விவசாயிகளுக்கான மானியங்கள், கடன்கள் மற்றும் நிதியுதவி திட்டங்களை கண்டறியவும்.",
    cardAlertsTitle: "திட்ட அறிவிப்புகள்",
    cardAlertsDesc: "புதிய திட்டங்கள் மற்றும் முக்கிய காலக்கெடு பற்றிய உடனடி அறிவிப்புகளைப் பெறுங்கள்.",
    cardSavedTitle: "சேமித்த திட்டங்கள்",
    cardSavedDesc: "முக்கியமான அரசு திட்டங்களை புக்மார்க் செய்து எளிதாக அணுகவும்.",
    cardCompareTitle: "திட்டங்களை ஒப்பிடுக",
    cardCompareDesc: "வெவ்வேறு திட்டங்களின் பலன்கள், வகைகள் மற்றும் சலுகைகளை ஒப்பிட்டுப் பாருங்கள்.",
    cardCentersTitle: "அருகிலுள்ள உதவி மையங்கள்",
    cardCentersDesc: "உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள வேளாண்மை உதவி மையங்களைக் கண்டறியவும்.",
    cardAskTitle: "புகைப்படம் எடுத்து கேட்க",
    cardAskDesc: "அரசு ஆவணம் அல்லது அறிவிப்பை புகைப்படம் எடுத்து கேளுங்கள்",
    cardEligibilityTitle: "தகுதியைச் சரிபார்க்கவும்",
    cardEligibilityDesc: "நீங்கள் தகுதியுடைய அரசு திட்டங்களைக் கண்டறியவும்",
    cardApplicationsTitle: "எனது விண்ணப்பங்கள்",
    cardApplicationsDesc: "உங்கள் திட்ட விண்ணப்பங்களின் நிலையை கண்காணிக்கவும்",
    cardCalculatorsTitle: "மானிய கால்குலேட்டர்கள்",
    cardCalculatorsDesc: "PMFBY காப்பீட்டு மானியம் மற்றும் KCC கடன் வட்டி தள்ளுபடியை கணக்கிடுங்கள்.",

    tabCalculators: "மானியம் கால்குலேட்டர்",
    pmfbyHeader: "PMFBY பயிர் காப்பீட்டு மானியம் & பிரீமியம் கால்குலேட்டர்",
    pmfbySelectCrop: "பயிர் வகையைத் தேர்ந்தெடுக்கவும்",
    pmfbyArea: "சாகுபடி பரப்பு (ஹெக்டேரில்)",
    pmfbySumInsured: "காப்பீட்டுத் தொகை (ஹெக்டேருக்கு ₹)",
    pmfbyResultTotalIns: "மொத்த காப்பீட்டுத் தொகை:",
    pmfbyResultFarmerPrem: "விவசாயி பிரீமியம் பங்கு:",
    pmfbyResultGovSub: "அரசு மானியப் பங்கு:",
    pmfbyResultTotalPrem: "மொத்த பிரீமியம்:",
    showing: "காட்டப்படுகின்றன",
    of: "இல்",
    detectedState: "கண்டறியப்பட்ட மாநிலம்",
    resetFilters: "வடிப்பான்களை மீட்டமை",
    requiredLabel: "தேவை",
    searchPrefix: "தேடல்",
    activeView: "செயலில் உள்ள பிரிவு",
    backToSchemes: "அனைத்து திட்டங்களுக்கும் திரும்புக",
    savedCountLabel: "சேமிக்கப்பட்டவை",
    ocrScanBadge: "OCR ஸ்கேன்",
    schemesSelectedCompare: "திட்டங்கள் ஒப்பீட்டிற்கு தேர்ந்தெடுக்கப்பட்டுள்ளன",
    viewCompareTable: "ஒப்பீட்டு அட்டவணையைப் பார்க்கவும்",
    clearComparison: "ஒப்பீட்டை அழிக்கவும்",
    compareMinTwo: "ஒப்பிட குறைந்தபட்சம் 2 திட்டங்களைத் தேர்ந்தெடுக்கவும்",
    returnToList: "திட்டப் பட்டியலுக்குத் திரும்புக",
    clearAllSaved: "சேமித்த அனைத்தையும் நீக்குக",
    noSavedTitle: "இதுவரை திட்டங்கள் எதுவும் சேமிக்கப்படவில்லை",
    exploreAllSchemes: "அனைத்து அரசு திட்டங்களையும் ஆராயுங்கள்",
    remove: "நீக்கு",
    visitOfficialPortal: "அதிகாரப்பூர்வ அரசு தளத்திற்குச் செல்லவும்",
    noSchemesFound: "அரசு திட்டங்கள் எதுவும் காணப்படவில்லை",
    noSchemesDesc: "உங்கள் தேடல் சொற்களை மாற்றவும் அல்லது வடிப்பான்களை மீட்டமைக்கவும்.",
    nationalSchemes: "(தேசிய திட்டங்கள்)",
    featureAttribute: "அம்சம் / விவரம்",
    categoryCol: "பிரிவு",
    coverageCol: "மாநிலம் / எல்லை",
    documentsCol: "தேவையான ஆவணங்கள்",
    actionCol: "செயல்",
    kccHeader: "KCC கடன் வட்டி & சேமிப்பு கால்குலேட்டர்",
    kccAmount: "கடன் தொகை (₹)",
    kccPeriod: "கடன் காலம் (மாதங்களில்)",
    kccInterestStandard: "சாதாரண வட்டி (7%):",
    kccInterestPrompt: "நேரத்திற்கு செலுத்தும் வட்டி (4%):",
    kccTotalSavings: "மொத்த வட்டி சேமிப்பு:",
    kccRepaymentTotal: "மொத்த திருப்பி செலுத்தும் தொகை:"
  },
  te: {
    brandTitle: "అగ్రి సారథి",
    portalSubtitle: "ప్రభుత్వ పథకాలు & రైతు ప్రయోజనాలు",
    dashboard: "డాష్‌బోర్డ్",
    refresh: "రిఫ్రెష్",
    searchPlaceholder: "ప్రభుత్వ పథకాలను వెతకండి...",
    allCategories: "అన్ని వర్గాలు",
    allStates: "అన్ని రాష్ట్రాలు",
    verifiedBannerTitle: "ధృవీకరించబడిన ప్రభుత్వ పథకాలు చూపబడుతున్నాయి",
    verifiedBannerSub: "అఖిల భారత మరియు రాష్ట్ర స్థాయి ప్రభుత్వ పథకాలు పొందుపరచబడ్డాయి.",
    schemesCount: "పథకాలు అందుబాటులో ఉన్నాయి",
    viewDetails: "వివరాలు చూడండి",
    addToCompare: "పోల్చండి",
    inCompare: "పోలికలో ఉంది",
    officialSource: "అధికారిక పోర్టల్",
    keyBenefit: "ముఖ్య ప్రయోజనం",
    documentsReq: "పత్రాలు",
    save: "సేవ్ చేయి",
    saved: "సేవ్ అయింది",
    eligibilityTitle: "అర్హత ప్రమాణాలు",
    documentsChecklist: "కావలసిన పత్రాల జాబితా",
    howToApply: "ఎలా దరఖాస్తు చేయాలి",
    close: "మూసివేయి",

    cardSchemesTitle: "ప్రభుత్వ పథకాలు",
    cardSchemesDesc: "రైతులకు అందుబాటులో ఉన్న రాయితీలు, ఆర్థిక సహాయ పథకాలను కనుగొనండి.",
    cardAlertsTitle: "పథకాల హెచ్చరికలు",
    cardAlertsDesc: "కొత్త పథకాలు, నవీకరణలు మరియు చివరి తేదీల గురించి నోటిఫికేషన్‌లు పొందండి.",
    cardSavedTitle: "సేవ్ చేసిన పథకాలు",
    cardSavedDesc: "త్వరిత ప్రాప్యత కోసం ముఖ్యమైన ప్రభుత్వ పథకాలను బుక్‌మార్క్ చేయండి.",
    cardCompareTitle: "పథకాల పోలిక",
    cardCompareDesc: "వివిధ పథకాల ప్రయోజనాలు, వర్గాలు మరియు కవరేజీని సరిపోల్చండి.",
    cardCentersTitle: "సమీప రైతు భరోసా కేంద్రాలు",
    cardCentersDesc: "మీ సమీప ప్రభుత్వ వ్యవసాయ కేంద్రాలు మరియు కార్యాలయాలను కనుగొనండి.",
    cardAskTitle: "ఫోటో తీసి అడగండి",
    cardAskDesc: "పథకం లేదా ప్రభుత్వ నోటీసు ఫోటో తీసి సమాచారం తెలుసుకోండి",
    cardEligibilityTitle: "అర్హత తనిఖీ",
    cardEligibilityDesc: "మీరు ఏయే పథకాలకు అర్హులో తనిఖీ చేసుకోండి",
    cardApplicationsTitle: "నా దరఖాస్తులు",
    cardApplicationsDesc: "మీ పథకం దరఖాస్తుల స్థితిని ట్రాక్ చేయండి",
    cardCalculatorsTitle: "సబ్సిడీ కాలిక్యులేటర్లు",
    cardCalculatorsDesc: "PMFBY బీమా రాయితీ మరియు KCC రుణ వడ్డీ పొదుపును లెక్కించండి.",

    tabCalculators: "సబ్సిడీ కాలిక్యులేటర్లు",
    pmfbyHeader: "PMFBY పంట బీమా ప్రీమియం & సబ్సిడీ కాలిక్యులేటర్",
    pmfbySelectCrop: "పంట రకాన్ని ఎంచుకోండి",
    pmfbyArea: "సాగు వైశాల్యం (హెక్టార్లలో)",
    pmfbySumInsured: "బీమా మొత్తం (హెక్టారుకు ₹)",
    pmfbyResultTotalIns: "మొత్తం బీమా చేయబడిన విలువ:",
    pmfbyResultFarmerPrem: "రైతు ప్రీమియం వాటా:",
    pmfbyResultGovSub: "ప్రభుత్వ సబ్సిడీ వాటా:",
    pmfbyResultTotalPrem: "మొత్తం ప్రీమియం విలువ:",
    showing: "చూపబడుతున్నాయి",
    of: "లో",
    detectedState: "గుర్తించిన రాష్ట్రం",
    resetFilters: "అన్ని ఫిల్టర్లను రీసెట్ చేయండి",
    requiredLabel: "అవసరం",
    searchPrefix: "శోధన",
    activeView: "ప్రస్తుత విభాగం",
    backToSchemes: "అన్ని పథకాలకు తిరిగి వెళ్లండి",
    savedCountLabel: "సేవ్ చేయబడినవి",
    ocrScanBadge: "OCR స్కాన్",
    schemesSelectedCompare: "పథకాలు పోలిక కోసం ఎంపిక చేయబడ్డాయి",
    viewCompareTable: "పోలిక పట్టికను చూడండి",
    clearComparison: "పోలికను క్లియర్ చేయండి",
    compareMinTwo: "పోల్చడానికి కనీసం 2 పథకాలను ఎంచుకోండి",
    returnToList: "పథకాల జాబితాకు తిరిగి వెళ్లండి",
    clearAllSaved: "సేవ్ చేసినవన్నీ తొలగించు",
    noSavedTitle: "ఇంకా ఏ పథకాలు సేవ్ చేయలేదు",
    exploreAllSchemes: "అన్ని ప్రభుత్వ పథకాలను అన్వేషించండి",
    remove: "తొలగించు",
    visitOfficialPortal: "అధికారిక ప్రభుత్వ పోర్టల్‌ను సందర్శించండి",
    noSchemesFound: "ఎటువంటి ప్రభుత్వ పథకాలు కనుగొనబడలేదు",
    noSchemesDesc: "మీ శోధన పదాలను మార్చండి లేదా వర్గం మరియు రాష్ట్ర ఫిల్టర్లను రీసెట్ చేయండి.",
    nationalSchemes: "(జాతీయ పథకాలు)",
    featureAttribute: "లక్షణం / వివరాలు",
    categoryCol: "వర్గం",
    coverageCol: "రాష్ట్రం / పరిధి",
    documentsCol: "కావలసిన పత్రాలు",
    actionCol: "చర్య",
    kccHeader: "KCC రుణ వడ్డీ & ఆదా కాలిక్యులేటర్",
    kccAmount: "రుణ మొత్తం (₹)",
    kccPeriod: "కాలపరిమితి (నెలలు)",
    kccInterestStandard: "సాధారణ వడ్డీ (7%):",
    kccInterestPrompt: "సకాల చెల్లింపు వడ్డీ (4%):",
    kccTotalSavings: "వడ్డీ పొదుపు:",
    kccRepaymentTotal: "తిరిగి చెల్లించాల్సిన మొత్తం:"
  },
  hi: {
    brandTitle: "कृषि सारथी",
    portalSubtitle: "सरकारी योजनाएं और किसान लाभ",
    dashboard: "डैशबोर्ड",
    refresh: "रिफ्रेश",
    searchPlaceholder: "सरकारी योजनाएं खोजें...",
    allCategories: "सभी श्रेणियां",
    allStates: "सभी राज्य",
    verifiedBannerTitle: "सत्यापित सरकारी योजनाएं प्रदर्शित",
    verifiedBannerSub: "अखिल भारतीय और राज्य स्तरीय आधिकारिक योजनाएं उपलब्ध हैं।",
    schemesCount: "योजनाएं उपलब्ध",
    viewDetails: "विवरण देखें",
    addToCompare: "तुलना करें",
    inCompare: "तुलना में शामिल",
    officialSource: "आधिकारिक पोर्टल",
    keyBenefit: "प्रमुख लाभ",
    documentsReq: "दस्तावेज",
    save: "सेव करें",
    saved: "सेव किया",
    eligibilityTitle: "पात्रता मापदंड",
    documentsChecklist: "आवश्यक दस्तावेजों की चेकलिस्ट",
    howToApply: "आवेदन कैसे करें",
    close: "बंद करें",

    cardSchemesTitle: "सरकारी योजनाएं",
    cardSchemesDesc: "किसानों के लिए सब्सिडी, वित्तीय सहायता और कल्याणकारी योजनाएं खोजें।",
    cardAlertsTitle: "योजना अलर्ट",
    cardAlertsDesc: "नई योजनाओं और महत्वपूर्ण समय-सीमा के बारे में सूचनाएं प्राप्त करें।",
    cardSavedTitle: "सहेजी गई योजनाएं",
    cardSavedDesc: "त्वरित पहुंच के लिए महत्वपूर्ण सरकारी योजनाओं को बुकमार्क करें।",
    cardCompareTitle: "योजनाओं की तुलना",
    cardCompareDesc: "विभिन्न योजनाओं के लाभ, श्रेणी और कवरेज की तुलना करें।",
    cardCentersTitle: "निकटतम सहायता केंद्र",
    cardCentersDesc: "अपने क्षेत्र के निकटतम कृषि विज्ञान केंद्र और कार्यालय खोजें।",
    cardAskTitle: "फोटो खींचकर पूछें",
    cardAskDesc: "सरकारी नोटिस या योजना का फोटो खींचकर सहायता लें",
    cardEligibilityTitle: "पात्रता की जांच करें",
    cardEligibilityDesc: "पता करें कि आप किन योजनाओं के लिए पात्र हैं",
    cardApplicationsTitle: "मेरे आवेदन",
    cardApplicationsDesc: "अपने योजना आवेदनों की स्थिति ट्रैक करें",
    cardCalculatorsTitle: "सब्सिडी कैलकुलेटर",
    cardCalculatorsDesc: "PMFBY बीमा सब्सिडी और KCC ऋण ब्याज छूट की गणना करें।",

    tabCalculators: "सब्सिडी कैलकुलेटर",
    pmfbyHeader: "PMFBY फसल बीमा प्रीमियम और सब्सिडी कैलकुलेटर",
    pmfbySelectCrop: "फसल श्रेणी चुनें",
    pmfbyArea: "खेती का क्षेत्रफल (हेक्टेयर में)",
    pmfbySumInsured: "बीमित राशि (₹ प्रति हेक्टेयर)",
    pmfbyResultTotalIns: "कुल बीमित राशि:",
    pmfbyResultFarmerPrem: "किसान प्रीमियम हिस्सा:",
    pmfbyResultGovSub: "सरकारी सब्सिडी हिस्सा:",
    pmfbyResultTotalPrem: "कुल प्रीमियम राशि:",
    showing: "प्रदर्शित",
    of: "में से",
    detectedState: "पहचाना गया राज्य",
    resetFilters: "सभी फ़िल्टर रीसेट करें",
    requiredLabel: "आवश्यक",
    searchPrefix: "खोज",
    activeView: "सक्रिय दृश्य",
    backToSchemes: "सभी योजनाओं पर वापस जाएं",
    savedCountLabel: "सहेजे गए",
    ocrScanBadge: "OCR स्कैन",
    schemesSelectedCompare: "योजनाएं तुलना के लिए चुनी गईं",
    viewCompareTable: "तुलना तालिका देखें",
    clearComparison: "तुलना हटाएं",
    compareMinTwo: "तुलना के लिए कम से कम 2 योजनाएं चुनें",
    returnToList: "योजना सूची पर लौटें",
    clearAllSaved: "सभी सहेजे गए हटाएं",
    noSavedTitle: "अभी तक कोई योजना सहेजी नहीं गई",
    exploreAllSchemes: "सभी सरकारी योजनाओं को देखें",
    remove: "हटाएं",
    visitOfficialPortal: "आधिकारिक सरकारी पोर्टल पर जाएं",
    noSchemesFound: "कोई सरकारी योजना नहीं मिली",
    noSchemesDesc: "कृपया अपनी खोज बदलें या श्रेणी और राज्य फ़िल्टर रीसेट करें।",
    nationalSchemes: "(राष्ट्रीय योजनाएं)",
    featureAttribute: "सुविधा / विवरण",
    categoryCol: "श्रेणी",
    coverageCol: "राज्य / कवरेज",
    documentsCol: "आवश्यक दस्तावेज",
    actionCol: "कार्रवाई",
    kccHeader: "KCC ऋण ब्याज और बचत कैलकुलेटर",
    kccAmount: "ऋण राशि (₹)",
    kccPeriod: "चुकौती अवधि (महीने)",
    kccInterestStandard: "मानक ब्याज (7%):",
    kccInterestPrompt: "समय पर भुगतान ब्याज (4%):",
    kccTotalSavings: "कुल ब्याज बचत:",
    kccRepaymentTotal: "कुल चुकौती राशि:"
  },
  ml: {
    brandTitle: "അഗ്രിസാരഥി",
    portalSubtitle: "സർക്കാർ പദ്ധതികളും കർഷക ആനുകൂല്യങ്ങളും",
    dashboard: "ഡാഷ്‌ബോർഡ്",
    refresh: "റിഫ്രഷ്",
    searchPlaceholder: "സർക്കാർ പദ്ധതികൾ തിരയുക...",
    allCategories: "എല്ലാ വിഭാഗങ്ങളും",
    allStates: "എല്ലാ സംസ്ഥാനങ്ങളും",
    verifiedBannerTitle: "സ്ഥിരീകരിച്ച സർക്കാർ പദ്ധതികൾ കാണിക്കുന്നു",
    verifiedBannerSub: "അഖിലേന്ത്യാ തലത്തിലും സംസ്ഥാന തലത്തിലുമുള്ള അംഗീകൃത പദ്ധതികൾ ലഭ്യമാണ്.",
    schemesCount: "പദ്ധതികൾ ലഭ്യമാണ്",
    viewDetails: "വിശദാംശങ്ങൾ കാണുക",
    addToCompare: "താരതമ്യം ചെയ്യുക",
    inCompare: "താരതമ്യത്തിൽ ചേർത്തു",
    officialSource: "ഔദ്യോഗിക പോർട്ടൽ",
    keyBenefit: "പ്രധാന ആനുകൂല്യം",
    documentsReq: "രേഖകൾ",
    save: "സേവ് ചെയ്യുക",
    saved: "സേവ് ചെയ്തു",
    eligibilityTitle: "അർഹതാ മാനദണ്ഡങ്ങൾ",
    documentsChecklist: "ആവശ്യമായ രേഖകളുടെ പട്ടിക",
    howToApply: "എങ്ങനെ അപേക്ഷിക്കാം",
    close: "അടയ്ക്കുക",

    cardSchemesTitle: "സർക്കാർ പദ്ധതികൾ",
    cardSchemesDesc: "കർഷകർക്കുള്ള സബ്സിഡികളും സാമ്പത്തിക സഹായങ്ങളും കണ്ടെത്തുക.",
    cardAlertsTitle: "പദ്ധതി അറിയിപ്പുകൾ",
    cardAlertsDesc: "പുതിയ പദ്ധതികളെക്കുറിച്ചും പ്രധാന സമയപരിധികളെക്കുറിച്ചും അറിയിപ്പുകൾ നേടുക.",
    cardSavedTitle: "സേവ് ചെയ്ത പദ്ധതികൾ",
    cardSavedDesc: "എളുപ്പത്തിൽ ആക്സസ് ചെയ്യുന്നതിനായി പ്രധാന പദ്ധതികൾ ബുക്ക്മാർക്ക് ചെയ്യുക.",
    cardCompareTitle: "പദ്ധതികൾ താരതമ്യം ചെയ്യുക",
    cardCompareDesc: "വിവിധ പദ്ധതികളുടെ ആനുകൂല്യങ്ങളും വ്യവസ്ഥകളും താരതമ്യം ചെയ്യുക.",
    cardCentersTitle: "സഹായ കേന്ദ്രങ്ങൾ",
    cardCentersDesc: "നിങ്ങളുടെ അടുത്തുള്ള കൃഷി ഭവനുകളും സേവന കേന്ദ്രങ്ങളും കണ്ടെത്തുക.",
    cardAskTitle: "ഫോട്ടോ എടുത്ത് ചോദിക്കുക",
    cardAskDesc: "സർക്കാർ അറിയിപ്പിന്റെയോ രേഖയുടെയോ ഫോട്ടോ എടുത്ത് വിവരങ്ങൾ അറിയുക",
    cardEligibilityTitle: "അർഹത പരിശോധിക്കുക",
    cardEligibilityDesc: "നിങ്ങൾക്ക് അർഹതയുള്ള പദ്ധതികൾ പരിശോധിക്കുക",
    cardApplicationsTitle: "എന്റെ അപേക്ഷകൾ",
    cardApplicationsDesc: "നിങ്ങളുടെ പദ്ധതി അപേക്ഷകളുടെ നില നിരീക്ഷിക്കുക",
    cardCalculatorsTitle: "സബ്സിഡി കാൽക്കുലേറ്ററുകൾ",
    cardCalculatorsDesc: "PMFBY ഇൻഷുറൻസ് സബ്സിഡിയും KCC പലിശ ലാഭവും കണക്കാക്കുക.",

    tabCalculators: "സബ്സിഡി കാൽക്കുലേറ്ററുകൾ",
    pmfbyHeader: "PMFBY വിള ഇൻഷുറൻസ് പ്രീമിയം & സബ്സിഡി കാൽക്കുലേറ്റർ",
    pmfbySelectCrop: "വിള വിഭാഗം തിരഞ്ഞെടുക്കുക",
    pmfbyArea: "കൃഷിസ്ഥലത്തിന്റെ വിസ്തീർണ്ണം (ഹെക്ടറിൽ)",
    pmfbySumInsured: "ഇൻഷുറൻസ് തുക (ഹെക്ടറിന് ₹)",
    pmfbyResultTotalIns: "ആകെ ഇൻഷുറൻസ് തുക:",
    pmfbyResultFarmerPrem: "കർഷകൻ അടയ്ക്കേണ്ട പ്രീമിയം:",
    pmfbyResultGovSub: "സർക്കാർ സബ്സിഡി വിഹിതം:",
    pmfbyResultTotalPrem: "ആകെ പ്രീമിയം തുക:",
    showing: "കാണിക്കുന്നു",
    of: "ൽ",
    detectedState: "കണ്ടെത്തിയ സംസ്ഥാനം",
    resetFilters: "ഫിൽട്ടറുകൾ പുനഃക്രമീകരിക്കുക",
    requiredLabel: "ആവശ്യമാണ്",
    searchPrefix: "തിരയൽ",
    activeView: "സജീവ കാഴ്‌ച",
    backToSchemes: "എല്ലാ പദ്ധതികളിലേക്കും മടങ്ങുക",
    savedCountLabel: "സേവ് ചെയ്തവ",
    ocrScanBadge: "OCR സ്കാൻ",
    schemesSelectedCompare: "പദ്ധതികൾ താരതമ്യത്തിനായി തിരഞ്ഞെടുത്തു",
    viewCompareTable: "താരതമ്യ പട്ടിക കാണുക",
    clearComparison: "താരതമ്യം നീക്കം ചെയ്യുക",
    compareMinTwo: "താരതമ്യം ചെയ്യാൻ കുറഞ്ഞത് 2 പദ്ധതികൾ തിരഞ്ഞെടുക്കുക",
    returnToList: "പദ്ധതി പട്ടികയിലേക്ക് മടങ്ങുക",
    clearAllSaved: "സേവ് ചെയ്തവ എല്ലാം നീക്കുക",
    noSavedTitle: "ഇതുവരെ പദ്ധതികളൊന്നും സേവ് ചെയ്തിട്ടില്ല",
    exploreAllSchemes: "എല്ലാ സർക്കാർ പദ്ധതികളും പര്യവേക്ഷണം ചെയ്യുക",
    remove: "നീക്കം ചെയ്യുക",
    visitOfficialPortal: "ഔദ്യോഗിക സർക്കാർ പോർട്ടൽ സന്ദർശിക്കുക",
    noSchemesFound: "സർക്കാർ പദ്ധതികളൊന്നും കണ്ടെത്തിയില്ല",
    noSchemesDesc: "നിങ്ങളുടെ തിരയൽ മാറ്റുകയോ ഫിൽട്ടറുകൾ പുനഃക്രമീകരിക്കുകയോ ചെയ്യുക.",
    nationalSchemes: "(ദേശീയ പദ്ധതികൾ)",
    featureAttribute: "സവിശേഷത / വിവരണം",
    categoryCol: "വിഭാഗം",
    coverageCol: "സംസ്ഥാനം / പരിധി",
    documentsCol: "ആവശ്യമായ രേഖകൾ",
    actionCol: "നടപടി",
    kccHeader: "KCC വായ്പ പലിശ & ലാഭ കാൽക്കുലേറ്റർ",
    kccAmount: "വായ്പ തുക (₹)",
    kccPeriod: "തിരിച്ചടവ് കാലാവധി (മാസങ്ങളിൽ)",
    kccInterestStandard: "സാധാരണ പലിശ (7%):",
    kccInterestPrompt: "കൃത്യസമയത്തെ തിരിച്ചടവ് പലിശ (4%):",
    kccTotalSavings: "ആകെ പലിശ ലാഭം:",
    kccRepaymentTotal: "ആകെ തിരിച്ചടയ്ക്കേണ്ട തുക:"
  },
  kn: {
    brandTitle: "ಅಗ್ರಿ ಸಾರಥಿ",
    portalSubtitle: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು & ರೈತರ ಸೌಲಭ್ಯಗಳು",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    refresh: "ರಿಫ್ರೆಶ್",
    searchPlaceholder: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ...",
    allCategories: "ಎಲ್ಲಾ ವಿಭಾಗಗಳು",
    allStates: "ಎಲ್ಲಾ ರಾಜ್ಯಗಳು",
    verifiedBannerTitle: "ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    verifiedBannerSub: "ಅಖಿಲ ಭಾರತ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ರಾಜ್ಯ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಲಾಗಿದೆ.",
    schemesCount: "ಯೋಜನೆಗಳು ಲಭ್ಯವಿವೆ",
    viewDetails: "ವಿವರಗಳನ್ನು ನೋಡಿ",
    addToCompare: "ಹೋಲಿಕೆಗೆ ಸೇರಿಸಿ",
    inCompare: "ಹೋಲಿಕೆಯಲ್ಲಿದೆ",
    officialSource: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್",
    keyBenefit: "ಮುಖ್ಯ ಪ್ರಯೋಜನ",
    documentsReq: "ದಾಖಲೆಗಳು",
    save: "ಉಳಿಸಿ",
    saved: "ಉಳಿಸಲಾಗಿದೆ",
    eligibilityTitle: "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು",
    documentsChecklist: "ದಾಖಲೆಗಳ ಪಟ್ಟಿ",
    howToApply: "ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ",
    close: "ಮುಚ್ಚಿ",

    // Quick action cards
    cardSchemesTitle: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    cardSchemesDesc: "ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವನ್ನು ಹುಡುಕಿ.",
    cardAlertsTitle: "ಯೋಜನೆ ಎಚ್ಚರಿಕೆಗಳು",
    cardAlertsDesc: "ಹೊಸ ಯೋಜನೆಗಳು, ನವೀಕರಣಗಳು ಮತ್ತು ಮುಖ್ಯ ಗಡುವುಗಳ ಬಗ್ಗೆ ಸೂಚನೆ ಪಡೆಯಿರಿ.",
    cardSavedTitle: "ಉಳಿಸಿದ ಯೋಜನೆಗಳು",
    cardSavedDesc: "ಮುಖ್ಯ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ನಂತರ ಬೇಗ ನೋಡಲು ಉಳಿಸಿ.",
    cardCompareTitle: "ಯೋಜನೆಗಳನ್ನು ಹೋಲಿಸಿ",
    cardCompareDesc: "ವಿವಿಧ ಯೋಜನೆಗಳ ಪ್ರಯೋಜನಗಳು, ವಿಭಾಗಗಳು ಮತ್ತು ವ್ಯಾಪ್ತಿಯನ್ನು ಹೋಲಿಸಿ.",
    cardCentersTitle: "ಹತ್ತಿರದ ಸಹಾಯ ಕೇಂದ್ರಗಳು",
    cardCentersDesc: "ನಿಮ್ಮ ಸ್ಥಳ ಬಳಸಿ ಹತ್ತಿರದ ಸರ್ಕಾರಿ ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ.",
    cardAskTitle: "ಇದರ ಬಗ್ಗೆ ಕೇಳಿ",
    cardAskDesc: "ಯೋಜನೆ ಅಥವಾ ಸರ್ಕಾರಿ ಸೂಚನೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ",
    cardEligibilityTitle: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
    cardEligibilityDesc: "ನೀವು ಅರ್ಹರಾಗಬಹುದಾದ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
    cardApplicationsTitle: "ನನ್ನ ಅರ್ಜಿಗಳು",
    cardApplicationsDesc: "ನಿಮ್ಮ ಯೋಜನೆ ಅರ್ಜಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    cardCalculatorsTitle: "ಸಬ್ಸಿಡಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು",
    cardCalculatorsDesc: "PMFBY ವಿಮೆ ಸಬ್ಸಿಡಿ ಮತ್ತು KCC ಕಡಿಮೆ ಬಡ್ಡಿ ಉಳಿತಾಯವನ್ನು ಲೆಕ್ಕ ಹಾಕಿ.",

    // Calculators
    tabCalculators: "ಸಬ್ಸಿಡಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು",
    pmfbyHeader: "PMFBY ವಿಮಾ ಪ್ರೀಮಿಯಂ & ಸಬ್ಸಿಡಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    pmfbySelectCrop: "ಬೆಳೆ ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ",
    pmfbyArea: "ಕೃಷಿ ವಿಸ್ತೀರ್ಣ (ಹೆಕ್ಟೇರ್‌ಗಳಲ್ಲಿ)",
    pmfbySumInsured: "ವಿಮಾ ಮೊತ್ತ (₹ ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ)",
    pmfbyResultTotalIns: "ಒಟ್ಟು ವಿಮಾ ಮೊತ್ತ:",
    pmfbyResultFarmerPrem: "ರೈತರ ಪ್ರೀಮಿಯಂ ಪಾಲು (ಪಾವತಿಸಬೇಕು):",
    pmfbyResultGovSub: "ಸರ್ಕಾರದ ಸಬ್ಸಿಡಿ ಪಾಲು (ಉಚಿತ):",
    pmfbyResultTotalPrem: "ಒಟ್ಟು ವಾಸ್ತವಿಕ ಪ್ರೀಮಿಯಂ:",
    showing: "ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    of: "ರಲ್ಲಿ",
    detectedState: "ನನ್ನ ಪತ್ತೆಯಾದ ರಾಜ್ಯ",
    resetFilters: "ಎಲ್ಲಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ",
    requiredLabel: "ಅಗತ್ಯವಿದೆ",
    searchPrefix: "ಹುಡುಕಾಟ",
    activeView: "ಪ್ರಸ್ತುತ ವೀಕ್ಷಣೆ",
    backToSchemes: "ಎಲ್ಲಾ ಯೋಜನೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    savedCountLabel: "ಉಳಿಸಲಾಗಿದೆ",
    ocrScanBadge: "OCR ಸ್ಕ್ಯಾನ್",
    schemesSelectedCompare: "ಯೋಜನೆಗಳನ್ನು ಹೋಲಿಕೆಗೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ",
    viewCompareTable: "ಹೋಲಿಕೆ ಕೋಷ್ಟಕ ನೋಡಿ",
    clearComparison: "ಹೋಲಿಕೆ ಅಳಿಸಿ",
    compareMinTwo: "ಹೋಲಿಸಲು ಕನಿಷ್ಠ 2 ಯೋಜನೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    returnToList: "ಯೋಜನೆ ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ",
    clearAllSaved: "ಉಳಿಸಿದ ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ",
    noSavedTitle: "ಇನ್ನೂ ಯಾವುದೇ ಯೋಜನೆ ಉಳಿಸಿಲ್ಲ",
    exploreAllSchemes: "ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ",
    remove: "ತೆಗೆದುಹಾಕಿ",
    visitOfficialPortal: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಿ",
    noSchemesFound: "ಯಾವುದೇ ಸರ್ಕಾರಿ ಯೋಜನೆ ಸಿಗಲಿಲ್ಲ",
    noSchemesDesc: "ಹುಡುಕಾಟ ಪದಗಳನ್ನು ಬದಲಿಸಿ ಅಥವಾ ವಿಭಾಗ ಮತ್ತು ರಾಜ್ಯ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ.",
    nationalSchemes: "(ರಾಷ್ಟ್ರೀಯ ಯೋಜನೆಗಳು)",
    featureAttribute: "ವೈಶಿಷ್ಟ್ಯ / ವಿವರ",
    categoryCol: "ವಿಭಾಗ",
    coverageCol: "ರಾಜ್ಯ / ವ್ಯಾಪ್ತಿ",
    documentsCol: "ಅಗತ್ಯ ದಾಖಲೆಗಳು",
    actionCol: "ಕ್ರಮ",
    kccHeader: "KCC ಸಾಲದ ಬಡ್ಡಿ & ಮರುಪಾವತಿ ಉಳಿತಾಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    kccAmount: "ಸಾಲದ ಮೊತ್ತ (₹)",
    kccPeriod: "ಮರುಪಾವತಿ ಅವಧಿ (ತಿಂಗಳುಗಳು)",
    kccInterestStandard: "ಸಾಮಾನ್ಯ ಬಡ್ಡಿ (7%):",
    kccInterestPrompt: "ಸಮಯಕ್ಕೆ ಮರುಪಾವತಿ ಬಡ್ಡಿ (4%):",
    kccTotalSavings: "ಒಟ್ಟು ಬಡ್ಡಿ ಉಳಿತಾಯ:",
    kccRepaymentTotal: "ಒಟ್ಟು ಮರುಪಾವತಿ (ಸಮಯಕ್ಕೆ ರಿಯಾಯಿತಿಯೊಂದಿಗೆ):"
  }
};

const CATEGORIES = [
  "All Categories",
  "Financial Assistance",
  "Insurance",
  "Irrigation",
  "Crop & Seeds",
  "Equipment",
  "Horticulture",
  "Credit & Loans",
  "Solar & Energy"
];

const STATES = [
  "All States",
  "All India",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

type ActiveView = "schemes" | "alerts" | "saved" | "compare" | "centers" | "eligibility" | "applications" | "calculators";

interface ApplicationRecord {
  id: string;
  schemeTitle: string;
  refNumber: string;
  date: string;
  status: "Under Review" | "Approved & Disbursed" | "Document Verification Pending";
  benefitExpected: string;
}

const DEFAULT_APPLICATIONS: ApplicationRecord[] = [
  {
    id: "app-1",
    schemeTitle: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    refNumber: "PMK-2026-891244",
    date: "14 Feb 2026",
    status: "Approved & Disbursed",
    benefitExpected: "₹2,000 Next Installment"
  },
  {
    id: "app-2",
    schemeTitle: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    refNumber: "PMFBY-TN-99210",
    date: "02 Mar 2026",
    status: "Under Review",
    benefitExpected: "Paddy Kharif Crop Insurance Policy"
  },
  {
    id: "app-3",
    schemeTitle: "Sub-Mission on Agricultural Mechanization (SMAM)",
    refNumber: "SMAM-EQ-4410",
    date: "10 Mar 2026",
    status: "Document Verification Pending",
    benefitExpected: "50% Power Tiller Subsidy"
  }
];

const STATUS_LABELS: Record<ApplicationRecord["status"], Localized> = {
  "Approved & Disbursed": { en: "✓ Approved & Disbursed", ta: "✓ அனுமதிக்கப்பட்டு வழங்கப்பட்டது", te: "✓ ఆమోదించి చెల్లించబడింది", kn: "✓ ಮಂಜೂರಾಗಿ ಪಾವತಿಯಾಗಿದೆ", ml: "✓ അംഗീകരിച്ച് വിതരണം ചെയ്തു", hi: "✓ स्वीकृत और भुगतान हुआ" },
  "Under Review": { en: "⏳ Under Review", ta: "⏳ பரிசீலனையில்", te: "⏳ పరిశీలనలో ఉంది", kn: "⏳ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ", ml: "⏳ പരിശോധനയിൽ", hi: "⏳ समीक्षा में" },
  "Document Verification Pending": { en: "📄 Verification Pending", ta: "📄 சரிபார்ப்பு நிலுவையில்", te: "📄 ధృవీకరణ పెండింగ్‌లో ఉంది", kn: "📄 ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ", ml: "📄 പരിശോധന ബാക്കി", hi: "📄 सत्यापन लंबित" },
};

// Scheme alert feed shown in the "Scheme Alerts" view
const SCHEME_ALERTS: { icon: string; color: string; tag: Localized; title: Localized; date: Localized; desc: Localized }[] = [
  {
    icon: "💰",
    color: "#15803D",
    tag: { en: "DBT Direct Transfer", ta: "DBT நேரடிப் பரிமாற்றம்", te: "DBT నేరుగా బదిలీ", kn: "DBT ನೇರ ವರ್ಗಾವಣೆ", ml: "DBT നേരിട്ടുള്ള കൈമാറ്റം", hi: "DBT सीधा हस्तांतरण" },
    title: { en: "PM-KISAN: 17th Installment Direct Benefit Transfer Initiated", ta: "PM-KISAN: 17வது தவணை நேரடிப் பரிமாற்றம் தொடங்கியது", te: "PM-KISAN: 17వ వాయిదా నేరుగా బదిలీ ప్రారంభమైంది", kn: "PM-KISAN: 17ನೇ ಕಂತಿನ ನೇರ ವರ್ಗಾವಣೆ ಆರಂಭವಾಗಿದೆ", ml: "PM-KISAN: 17-ാം ഗഡു നേരിട്ടുള്ള കൈമാറ്റം ആരംഭിച്ചു", hi: "PM-KISAN: 17वीं किस्त का सीधा हस्तांतरण शुरू" },
    date: { en: "March 2026", ta: "மார்ச் 2026", te: "మార్చి 2026", kn: "ಮಾರ್ಚ್ 2026", ml: "മാർച്ച് 2026", hi: "मार्च 2026" },
    desc: { en: "All registered beneficiaries with verified e-KYC and active Aadhaar-linked bank accounts will receive ₹2,000 directly. Verify your beneficiary status at pmkisan.gov.in.", ta: "e-KYC சரிபார்க்கப்பட்டு, ஆதார் இணைந்த வங்கிக் கணக்கு உள்ள அனைத்து பதிவு செய்த பயனாளிகளும் ₹2,000 நேரடியாகப் பெறுவர். pmkisan.gov.in இல் உங்கள் நிலையைச் சரிபார்க்கவும்.", te: "e-KYC పూర్తయి, ఆధార్ లింక్ అయిన బ్యాంక్ ఖాతా ఉన్న నమోదైన లబ్ధిదారులందరికీ ₹2,000 నేరుగా వస్తాయి. pmkisan.gov.in లో మీ స్థితిని చూడండి.", kn: "e-KYC ಪರಿಶೀಲನೆಯಾಗಿ, ಆಧಾರ್ ಜೋಡಿತ ಬ್ಯಾಂಕ್ ಖಾತೆ ಇರುವ ಎಲ್ಲಾ ನೋಂದಾಯಿತ ಫಲಾನುಭವಿಗಳಿಗೆ ₹2,000 ನೇರವಾಗಿ ಬರುತ್ತದೆ. pmkisan.gov.in ನಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ.", ml: "e-KYC പൂർത്തിയാക്കി ആധാർ ബന്ധിപ്പിച്ച ബാങ്ക് അക്കൗണ്ടുള്ള എല്ലാ രജിസ്റ്റർ ചെയ്ത ഗുണഭോക്താക്കൾക്കും ₹2,000 നേരിട്ട് ലഭിക്കും. pmkisan.gov.in ൽ നിങ്ങളുടെ നില പരിശോധിക്കുക.", hi: "सत्यापित e-KYC और आधार से जुड़े सक्रिय बैंक खाते वाले सभी पंजीकृत लाभार्थियों को ₹2,000 सीधे मिलेंगे। pmkisan.gov.in पर अपनी स्थिति जांचें।" },
  },
  {
    icon: "🛡️",
    color: "#2563EB",
    tag: { en: "Crop Insurance Deadline", ta: "பயிர் காப்பீடு கடைசி தேதி", te: "పంట బీమా గడువు", kn: "ಬೆಳೆ ವಿಮೆ ಗಡುವು", ml: "വിള ഇൻഷുറൻസ് അവസാന തീയതി", hi: "फसल बीमा की अंतिम तिथि" },
    title: { en: "PMFBY Kharif Season Enrollment Window Open", ta: "PMFBY காரீஃப் பருவப் பதிவு தொடங்கியது", te: "PMFBY ఖరీఫ్ సీజన్ నమోదు ప్రారంభమైంది", kn: "PMFBY ಖಾರಿಫ್ ಹಂಗಾಮಿನ ನೋಂದಣಿ ಆರಂಭವಾಗಿದೆ", ml: "PMFBY ഖാരിഫ് സീസൺ രജിസ്ട്രേഷൻ ആരംഭിച്ചു", hi: "PMFBY खरीफ सीज़न नामांकन शुरू" },
    date: { en: "Upcoming Cutoff", ta: "வரவிருக்கும் கடைசி தேதி", te: "రాబోయే గడువు", kn: "ಮುಂಬರುವ ಗಡುವು", ml: "വരാനിരിക്കുന്ന അവസാന തീയതി", hi: "आने वाली अंतिम तिथि" },
    desc: { en: "Farmers growing notified food grains and commercial crops can submit crop declarations and pay subsidized premiums (1.5% - 2%) via their nearest CSC or bank branch.", ta: "அறிவிக்கப்பட்ட உணவு தானியங்கள் மற்றும் வணிகப் பயிர்களை வளர்க்கும் விவசாயிகள் அருகிலுள்ள CSC அல்லது வங்கிக் கிளையில் பயிர் விவரம் சமர்ப்பித்து மானிய பிரீமியம் (1.5% - 2%) செலுத்தலாம்.", te: "నోటిఫై చేసిన ఆహార ధాన్యాలు, వాణిజ్య పంటలు పండించే రైతులు దగ్గరలోని CSC లేదా బ్యాంక్ శాఖలో పంట వివరాలు ఇచ్చి సబ్సిడీ ప్రీమియం (1.5% - 2%) కట్టవచ్చు.", kn: "ಅಧಿಸೂಚಿತ ಆಹಾರ ಧಾನ್ಯ ಮತ್ತು ವಾಣಿಜ್ಯ ಬೆಳೆ ಬೆಳೆಯುವ ರೈತರು ಹತ್ತಿರದ CSC ಅಥವಾ ಬ್ಯಾಂಕ್ ಶಾಖೆಯಲ್ಲಿ ಬೆಳೆ ವಿವರ ಸಲ್ಲಿಸಿ ಸಬ್ಸಿಡಿ ಪ್ರೀಮಿಯಂ (1.5% - 2%) ಪಾವತಿಸಬಹುದು.", ml: "വിജ്ഞാപനം ചെയ്ത ഭക്ഷ്യധാന്യങ്ങളും നാണ്യവിളകളും കൃഷി ചെയ്യുന്ന കർഷകർക്ക് അടുത്തുള്ള CSC അല്ലെങ്കിൽ ബാങ്ക് ശാഖയിൽ വിള വിവരം നൽകി സബ്സിഡി പ്രീമിയം (1.5% - 2%) അടയ്ക്കാം.", hi: "अधिसूचित खाद्यान्न और नकदी फसलें उगाने वाले किसान नज़दीकी CSC या बैंक शाखा में फसल घोषणा देकर रियायती प्रीमियम (1.5% - 2%) भर सकते हैं।" },
  },
  {
    icon: "🚜",
    color: "#D97706",
    tag: { en: "Farm Mechanization Subsidy", ta: "பண்ணை இயந்திர மானியம்", te: "వ్యవసాయ యంత్రాల సబ్సిడీ", kn: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ಸಬ್ಸಿಡಿ", ml: "കാർഷിക യന്ത്രവൽക്കരണ സബ്സിഡി", hi: "कृषि मशीनीकरण सब्सिडी" },
    title: { en: "Sub-Mission on Agricultural Mechanization (SMAM) Portal Active", ta: "வேளாண் இயந்திரமயமாக்கல் துணை இயக்கம் (SMAM) தளம் செயலில்", te: "వ్యవసాయ యాంత్రీకరణ ఉప మిషన్ (SMAM) పోర్టల్ అందుబాటులో ఉంది", kn: "ಕೃಷಿ ಯಾಂತ್ರೀಕರಣ ಉಪ ಮಿಷನ್ (SMAM) ಪೋರ್ಟಲ್ ಸಕ್ರಿಯವಾಗಿದೆ", ml: "കാർഷിക യന്ത്രവൽക്കരണ ഉപ ദൗത്യം (SMAM) പോർട്ടൽ സജീവം", hi: "कृषि मशीनीकरण उप-मिशन (SMAM) पोर्टल चालू" },
    date: { en: "Active Quota", ta: "ஒதுக்கீடு உள்ளது", te: "కోటా అందుబాటులో ఉంది", kn: "ಕೋಟಾ ಲಭ್ಯವಿದೆ", ml: "ക്വാട്ട ലഭ്യമാണ്", hi: "कोटा उपलब्ध" },
    desc: { en: "Up to 50% capital subsidy available on power tillers, rotavators, and multi-crop threshers for small and marginal farmers on agrimachinery.nic.in.", ta: "சிறு மற்றும் குறு விவசாயிகளுக்கு பவர் டில்லர், ரோட்டவேட்டர், பல்பயிர் கதிரடிக்கும் இயந்திரங்களுக்கு 50% வரை மானியம் agrimachinery.nic.in இல் கிடைக்கிறது.", te: "చిన్న, సన్నకారు రైతులకు పవర్ టిల్లర్లు, రోటవేటర్లు, బహుళ పంట నూర్పిడి యంత్రాలపై 50% వరకు సబ్సిడీ agrimachinery.nic.in లో లభిస్తుంది.", kn: "ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ ಪವರ್ ಟಿಲ್ಲರ್, ರೋಟವೇಟರ್ ಮತ್ತು ಬಹು ಬೆಳೆ ಒಕ್ಕಣೆ ಯಂತ್ರಗಳಿಗೆ 50% ವರೆಗೆ ಸಬ್ಸಿಡಿ agrimachinery.nic.in ನಲ್ಲಿ ಲಭ್ಯ.", ml: "ചെറുകിട, നാമമാത്ര കർഷകർക്ക് പവർ ടില്ലർ, റോട്ടവേറ്റർ, മൾട്ടി-ക്രോപ്പ് മെതിയന്ത്രം എന്നിവയ്ക്ക് 50% വരെ സബ്സിഡി agrimachinery.nic.in ൽ ലഭ്യമാണ്.", hi: "छोटे और सीमांत किसानों के लिए पावर टिलर, रोटावेटर और मल्टी-क्रॉप थ्रेशर पर 50% तक सब्सिडी agrimachinery.nic.in पर उपलब्ध है।" },
  },
  {
    icon: "💧",
    color: "#0891B2",
    tag: { en: "Micro Irrigation Assistance", ta: "நுண்ணீர் பாசன உதவி", te: "సూక్ష్మ నీటిపారుదల సహాయం", kn: "ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ನೆರವು", ml: "സൂക്ഷ്മ ജലസേചന സഹായം", hi: "सूक्ष्म सिंचाई सहायता" },
    title: { en: "PMKSY Per Drop More Crop (Drip & Sprinkler Subsidy Allocation)", ta: "PMKSY ஒவ்வொரு துளிக்கும் அதிக பயிர் (சொட்டு & தெளிப்பு நீர் மானிய ஒதுக்கீடு)", te: "PMKSY ప్రతి చుక్కకు ఎక్కువ పంట (డ్రిప్ & స్ప్రింక్లర్ సబ్సిడీ కేటాయింపు)", kn: "PMKSY ಪ್ರತಿ ಹನಿಗೆ ಹೆಚ್ಚು ಬೆಳೆ (ಹನಿ & ತುಂತುರು ನೀರಾವರಿ ಸಬ್ಸಿಡಿ ಹಂಚಿಕೆ)", ml: "PMKSY ഓരോ തുള്ളിക്കും കൂടുതൽ വിള (ഡ്രിപ്പ് & സ്പ്രിങ്ക്ലർ സബ്സിഡി വിഹിതം)", hi: "PMKSY पर ड्रॉप मोर क्रॉप (ड्रिप और स्प्रिंकलर सब्सिडी आवंटन)" },
    date: { en: "New Financial Cycle", ta: "புதிய நிதியாண்டு", te: "కొత్త ఆర్థిక సంవత్సరం", kn: "ಹೊಸ ಆರ್ಥಿಕ ವರ್ಷ", ml: "പുതിയ സാമ്പത്തിക വർഷം", hi: "नया वित्तीय वर्ष" },
    desc: { en: "State horticulture departments have released fresh subsidy quotas offering up to 90% subsidy for SC/ST and marginal farmers installing modern drip systems.", ta: "நவீன சொட்டு நீர் அமைப்புகளை நிறுவும் SC/ST மற்றும் குறு விவசாயிகளுக்கு 90% வரை மானியத்துடன் மாநில தோட்டக்கலைத் துறைகள் புதிய ஒதுக்கீடுகளை வெளியிட்டுள்ளன.", te: "ఆధునిక డ్రిప్ వ్యవస్థలు అమర్చే SC/ST మరియు సన్నకారు రైతులకు 90% వరకు సబ్సిడీతో రాష్ట్ర ఉద్యాన శాఖలు కొత్త కోటాలు విడుదల చేశాయి.", kn: "ಆಧುನಿಕ ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಸುವ SC/ST ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ 90% ವರೆಗೆ ಸಬ್ಸಿಡಿಯೊಂದಿಗೆ ರಾಜ್ಯ ತೋಟಗಾರಿಕೆ ಇಲಾಖೆಗಳು ಹೊಸ ಕೋಟಾ ಬಿಡುಗಡೆ ಮಾಡಿವೆ.", ml: "ആധുനിക ഡ്രിപ്പ് സംവിധാനം സ്ഥാപിക്കുന്ന SC/ST, നാമമാത്ര കർഷകർക്ക് 90% വരെ സബ്സിഡിയോടെ സംസ്ഥാന ഉദ്യാനകൃഷി വകുപ്പുകൾ പുതിയ ക്വാട്ട പുറത്തിറക്കി.", hi: "आधुनिक ड्रिप सिस्टम लगाने वाले SC/ST और सीमांत किसानों के लिए राज्य बागवानी विभागों ने 90% तक सब्सिडी वाले नए कोटे जारी किए हैं।" },
  },
  {
    icon: "🌱",
    color: "#059669",
    tag: { en: "Free Soil Testing", ta: "இலவச மண் பரிசோதனை", te: "ఉచిత నేల పరీక్ష", kn: "ಉಚಿತ ಮಣ್ಣು ಪರೀಕ್ಷೆ", ml: "സൗജന്യ മണ്ണ് പരിശോധന", hi: "मुफ़्त मिट्टी जांच" },
    title: { en: "Soil Health Card Mobile Van Testing Camps", ta: "மண் வள அட்டை நடமாடும் வாகன பரிசோதனை முகாம்கள்", te: "సాయిల్ హెల్త్ కార్డ్ మొబైల్ వ్యాన్ పరీక్ష శిబిరాలు", kn: "ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಸಂಚಾರಿ ವಾಹನ ಪರೀಕ್ಷಾ ಶಿಬಿರಗಳು", ml: "സോയിൽ ഹെൽത്ത് കാർഡ് മൊബൈൽ വാൻ പരിശോധനാ ക്യാമ്പുകൾ", hi: "मृदा स्वास्थ्य कार्ड मोबाइल वैन जांच शिविर" },
    date: { en: "This Week", ta: "இந்த வாரம்", te: "ఈ వారం", kn: "ಈ ವಾರ", ml: "ഈ ആഴ്ച", hi: "इस सप्ताह" },
    desc: { en: "Free 12-parameter soil testing and micro-nutrient advisory camps are operating across block agriculture offices.", ta: "வட்டார வேளாண் அலுவலகங்களில் இலவச 12-அளவுரு மண் பரிசோதனை மற்றும் நுண்ணூட்ட ஆலோசனை முகாம்கள் நடைபெறுகின்றன.", te: "మండల వ్యవసాయ కార్యాలయాల్లో ఉచిత 12-అంశాల నేల పరీక్ష మరియు సూక్ష్మ పోషకాల సలహా శిబిరాలు జరుగుతున్నాయి.", kn: "ಬ್ಲಾಕ್ ಕೃಷಿ ಕಚೇರಿಗಳಲ್ಲಿ ಉಚಿತ 12-ಅಂಶಗಳ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶ ಸಲಹಾ ಶಿಬಿರಗಳು ನಡೆಯುತ್ತಿವೆ.", ml: "ബ്ലോക്ക് കൃഷി ഓഫീസുകളിൽ സൗജന്യ 12-ഘടക മണ്ണ് പരിശോധനയും സൂക്ഷ്മ പോഷക ഉപദേശ ക്യാമ്പുകളും നടക്കുന്നു.", hi: "ब्लॉक कृषि कार्यालयों में मुफ़्त 12-मानक मिट्टी जांच और सूक्ष्म पोषक सलाह शिविर चल रहे हैं।" },
  },
];

// Office types listed in the "Nearby Help Centers" view (mapQuery stays English for Google Maps search)
const HELP_CENTERS: { title: Localized; category: Localized; icon: string; address: Localized; services: Localized; timings: Localized; phone?: string; mapQuery?: string }[] = [
  {
    title: { en: "Village Agriculture Office / Common Service Centre (CSC)", ta: "கிராம வேளாண் அலுவலகம் / பொது சேவை மையம் (CSC)", te: "గ్రామ వ్యవసాయ కార్యాలయం / కామన్ సర్వీస్ సెంటర్ (CSC)", kn: "ಗ್ರಾಮ ಕೃಷಿ ಕಚೇರಿ / ಸಾಮಾನ್ಯ ಸೇವಾ ಕೇಂದ್ರ (CSC)", ml: "ഗ്രാമ കൃഷി ഓഫീസ് / കോമൺ സർവീസ് സെന്റർ (CSC)", hi: "ग्राम कृषि कार्यालय / कॉमन सर्विस सेंटर (CSC)" },
    category: { en: "Local village service centre (e.g. Rythu Seva Kendra in AP)", ta: "உள்ளூர் கிராம சேவை மையம் (எ.கா. AP இல் ரைத்து சேவா கேந்திரா)", te: "స్థానిక గ్రామ సేవా కేంద్రం (ఉదా. AP లో రైతు సేవా కేంద్రం)", kn: "ಸ್ಥಳೀಯ ಗ್ರಾಮ ಸೇವಾ ಕೇಂದ್ರ (ಉದಾ. AP ಯಲ್ಲಿ ರೈತು ಸೇವಾ ಕೇಂದ್ರ)", ml: "പ്രാദേശിക ഗ്രാമ സേവന കേന്ദ്രം (ഉദാ. AP യിലെ റൈതു സേവാ കേന്ദ്രം)", hi: "स्थानीय ग्राम सेवा केंद्र (जैसे AP में रायतु सेवा केंद्र)" },
    icon: "🏛️",
    address: { en: "Ask at your Gram Panchayat office for the nearest centre", ta: "அருகிலுள்ள மையத்தை உங்கள் கிராம பஞ்சாயத்து அலுவலகத்தில் கேளுங்கள்", te: "దగ్గరలోని కేంద్రం కోసం మీ గ్రామ పంచాయతీ కార్యాలయంలో అడగండి", kn: "ಹತ್ತಿರದ ಕೇಂದ್ರಕ್ಕಾಗಿ ನಿಮ್ಮ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಕಚೇರಿಯಲ್ಲಿ ಕೇಳಿ", ml: "അടുത്തുള്ള കേന്ദ്രം അറിയാൻ നിങ്ങളുടെ ഗ്രാമപഞ്ചായത്ത് ഓഫീസിൽ ചോദിക്കുക", hi: "नज़दीकी केंद्र के लिए अपने ग्राम पंचायत कार्यालय में पूछें" },
    mapQuery: "Common Service Centre",
    services: { en: "PM-KISAN e-KYC, PMFBY crop enrolment, subsidised seed & fertiliser indents", ta: "PM-KISAN e-KYC, PMFBY பயிர் பதிவு, மானிய விதை & உர கோரிக்கைகள்", te: "PM-KISAN e-KYC, PMFBY పంట నమోదు, సబ్సిడీ విత్తనాలు & ఎరువుల దరఖాస్తులు", kn: "PM-KISAN e-KYC, PMFBY ಬೆಳೆ ನೋಂದಣಿ, ಸಬ್ಸಿಡಿ ಬೀಜ & ರಸಗೊಬ್ಬರ ಬೇಡಿಕೆಗಳು", ml: "PM-KISAN e-KYC, PMFBY വിള രജിസ്ട്രേഷൻ, സബ്സിഡി വിത്ത് & വള അപേക്ഷകൾ", hi: "PM-KISAN e-KYC, PMFBY फसल नामांकन, रियायती बीज और खाद की मांग" },
    timings: { en: "Usually 9:00 AM - 5:30 PM (Mon - Sat)", ta: "பொதுவாக காலை 9:00 - மாலை 5:30 (திங்கள் - சனி)", te: "సాధారణంగా ఉ. 9:00 - సా. 5:30 (సోమ - శని)", kn: "ಸಾಮಾನ್ಯವಾಗಿ ಬೆ. 9:00 - ಸಂ. 5:30 (ಸೋಮ - ಶನಿ)", ml: "സാധാരണ രാവിലെ 9:00 - വൈകിട്ട് 5:30 (തിങ്കൾ - ശനി)", hi: "आमतौर पर सुबह 9:00 - शाम 5:30 (सोम - शनि)" },
  },
  {
    title: { en: "Krishi Vigyan Kendra (KVK)" },
    category: { en: "ICAR agricultural research & advisory (one per district)", ta: "ICAR வேளாண் ஆராய்ச்சி & ஆலோசனை (மாவட்டத்திற்கு ஒன்று)", te: "ICAR వ్యవసాయ పరిశోధన & సలహా (జిల్లాకు ఒకటి)", kn: "ICAR ಕೃಷಿ ಸಂಶೋಧನೆ & ಸಲಹೆ (ಜಿಲ್ಲೆಗೆ ಒಂದು)", ml: "ICAR കാർഷിക ഗവേഷണവും ഉപദേശവും (ജില്ലയ്ക്ക് ഒന്ന്)", hi: "ICAR कृषि अनुसंधान और सलाह (हर ज़िले में एक)" },
    icon: "🔬",
    address: { en: "Your district's KVK — directory at kvk.icar.gov.in", ta: "உங்கள் மாவட்ட KVK — பட்டியல் kvk.icar.gov.in இல்", te: "మీ జిల్లా KVK — జాబితా kvk.icar.gov.in లో", kn: "ನಿಮ್ಮ ಜಿಲ್ಲೆಯ KVK — ಪಟ್ಟಿ kvk.icar.gov.in ನಲ್ಲಿ", ml: "നിങ്ങളുടെ ജില്ലയിലെ KVK — പട്ടിക kvk.icar.gov.in ൽ", hi: "आपके ज़िले का KVK — सूची kvk.icar.gov.in पर" },
    mapQuery: "Krishi Vigyan Kendra",
    services: { en: "Soil testing, pest management advisory, high-yielding variety demonstrations", ta: "மண் பரிசோதனை, பூச்சி மேலாண்மை ஆலோசனை, அதிக மகசூல் ரக செயல்விளக்கங்கள்", te: "నేల పరీక్ష, తెగుళ్ల నిర్వహణ సలహా, అధిక దిగుబడి రకాల ప్రదర్శనలు", kn: "ಮಣ್ಣು ಪರೀಕ್ಷೆ, ಕೀಟ ನಿರ್ವಹಣೆ ಸಲಹೆ, ಹೆಚ್ಚು ಇಳುವರಿ ತಳಿಗಳ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ", ml: "മണ്ണ് പരിശോധന, കീട നിയന്ത്രണ ഉപദേശം, അത്യുൽപാദന ഇനങ്ങളുടെ പ്രദർശനം", hi: "मिट्टी जांच, कीट प्रबंधन सलाह, अधिक उपज वाली किस्मों का प्रदर्शन" },
    timings: { en: "Usually 9:30 AM - 5:00 PM (Mon - Fri)", ta: "பொதுவாக காலை 9:30 - மாலை 5:00 (திங்கள் - வெள்ளி)", te: "సాధారణంగా ఉ. 9:30 - సా. 5:00 (సోమ - శుక్ర)", kn: "ಸಾಮಾನ್ಯವಾಗಿ ಬೆ. 9:30 - ಸಂ. 5:00 (ಸೋಮ - ಶುಕ್ರ)", ml: "സാധാരണ രാവിലെ 9:30 - വൈകിട്ട് 5:00 (തിങ്കൾ - വെള്ളി)", hi: "आमतौर पर सुबह 9:30 - शाम 5:00 (सोम - शुक्र)" },
  },
  {
    title: { en: "District Agriculture Office", ta: "மாவட்ட வேளாண் அலுவலகம்", te: "జిల్లా వ్యవసాయ కార్యాలయం", kn: "ಜಿಲ್ಲಾ ಕೃಷಿ ಕಚೇರಿ", ml: "ജില്ലാ കൃഷി ഓഫീസ്", hi: "ज़िला कृषि कार्यालय" },
    category: { en: "District administrative headquarters (Joint/Deputy Director of Agriculture)", ta: "மாவட்ட நிர்வாகத் தலைமையகம் (வேளாண் இணை/துணை இயக்குநர்)", te: "జిల్లా పరిపాలనా ప్రధాన కార్యాలయం (వ్యవసాయ సంయుక్త/ఉప సంచాలకులు)", kn: "ಜಿಲ್ಲಾ ಆಡಳಿತ ಕೇಂದ್ರ (ಕೃಷಿ ಜಂಟಿ/ಉಪ ನಿರ್ದೇಶಕರು)", ml: "ജില്ലാ ഭരണ ആസ്ഥാനം (കൃഷി ജോയിന്റ്/ഡെപ്യൂട്ടി ഡയറക്ടർ)", hi: "ज़िला प्रशासनिक मुख्यालय (संयुक्त/उप कृषि निदेशक)" },
    icon: "🌾",
    address: { en: "Usually in or near the District Collectorate", ta: "பொதுவாக மாவட்ட ஆட்சியர் அலுவலகத்தில் அல்லது அருகில்", te: "సాధారణంగా జిల్లా కలెక్టరేట్‌లో లేదా దగ్గరలో", kn: "ಸಾಮಾನ್ಯವಾಗಿ ಜಿಲ್ಲಾಧಿಕಾರಿ ಕಚೇರಿಯಲ್ಲಿ ಅಥವಾ ಹತ್ತಿರ", ml: "സാധാരണ ജില്ലാ കളക്ടറേറ്റിലോ സമീപത്തോ", hi: "आमतौर पर ज़िला कलेक्ट्रेट में या उसके पास" },
    mapQuery: "District Agriculture Office",
    services: { en: "Farm machinery subsidy (SMAM), solar pump approvals, Kisan Credit Card endorsements", ta: "பண்ணை இயந்திர மானியம் (SMAM), சோலார் பம்ப் அனுமதிகள், கிசான் கிரெடிட் கார்டு பரிந்துரைகள்", te: "వ్యవసాయ యంత్రాల సబ్సిడీ (SMAM), సోలార్ పంపు అనుమతులు, కిసాన్ క్రెడిట్ కార్డ్ సిఫార్సులు", kn: "ಕೃಷಿ ಯಂತ್ರ ಸಬ್ಸಿಡಿ (SMAM), ಸೋಲಾರ್ ಪಂಪ್ ಅನುಮೋದನೆ, ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಶಿಫಾರಸು", ml: "കാർഷിക യന്ത്ര സബ്സിഡി (SMAM), സോളാർ പമ്പ് അനുമതി, കിസാൻ ക്രെഡിറ്റ് കാർഡ് ശുപാർശ", hi: "कृषि मशीनरी सब्सिडी (SMAM), सोलर पंप स्वीकृति, किसान क्रेडिट कार्ड अनुशंसा" },
    timings: { en: "Usually 10:00 AM - 5:45 PM (Mon - Sat)", ta: "பொதுவாக காலை 10:00 - மாலை 5:45 (திங்கள் - சனி)", te: "సాధారణంగా ఉ. 10:00 - సా. 5:45 (సోమ - శని)", kn: "ಸಾಮಾನ್ಯವಾಗಿ ಬೆ. 10:00 - ಸಂ. 5:45 (ಸೋಮ - ಶನಿ)", ml: "സാധാരണ രാവിലെ 10:00 - വൈകിട്ട് 5:45 (തിങ്കൾ - ശനി)", hi: "आमतौर पर सुबह 10:00 - शाम 5:45 (सोम - शनि)" },
  },
  {
    title: { en: "Kisan Call Centre (Toll-Free)", ta: "கிசான் கால் சென்டர் (இலவசம்)", te: "కిసాన్ కాల్ సెంటర్ (టోల్-ఫ్రీ)", kn: "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (ಉಚಿತ)", ml: "കിസാൻ കോൾ സെന്റർ (ടോൾ-ഫ്രീ)", hi: "किसान कॉल सेंटर (टोल-फ्री)" },
    category: { en: "Telephone advisory in your language", ta: "உங்கள் மொழியில் தொலைபேசி ஆலோசனை", te: "మీ భాషలో ఫోన్ సలహా", kn: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ದೂರವಾಣಿ ಸಲಹೆ", ml: "നിങ്ങളുടെ ഭാഷയിൽ ഫോൺ ഉപദേശം", hi: "आपकी भाषा में फ़ोन पर सलाह" },
    icon: "📞",
    address: { en: "Ministry of Agriculture & Farmers Welfare, Govt of India", ta: "வேளாண் & விவசாயிகள் நல அமைச்சகம், இந்திய அரசு", te: "వ్యవసాయ & రైతు సంక్షేమ మంత్రిత్వ శాఖ, భారత ప్రభుత్వం", kn: "ಕೃಷಿ & ರೈತ ಕಲ್ಯಾಣ ಸಚಿವಾಲಯ, ಭಾರತ ಸರ್ಕಾರ", ml: "കൃഷി & കർഷക ക്ഷേമ മന്ത്രാലയം, ഭാരത സർക്കാർ", hi: "कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार" },
    phone: "1800-180-1551",
    services: { en: "Free agronomist advice in Tamil, Telugu, Kannada, Malayalam, Hindi and other languages", ta: "தமிழ், தெலுங்கு, கன்னடம், மலையாளம், இந்தி மற்றும் பிற மொழிகளில் இலவச வேளாண் நிபுணர் ஆலோசனை", te: "తమిళం, తెలుగు, కన్నడ, మలయాళం, హిందీ మరియు ఇతర భాషల్లో ఉచిత వ్యవసాయ నిపుణుల సలహా", kn: "ತಮಿಳು, ತೆಲುಗು, ಕನ್ನಡ, ಮಲಯಾಳಂ, ಹಿಂದಿ ಮತ್ತು ಇತರ ಭಾಷೆಗಳಲ್ಲಿ ಉಚಿತ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ", ml: "തമിഴ്, തെലുങ്ക്, കന്നഡ, മലയാളം, ഹിന്ദി, മറ്റ് ഭാഷകളിൽ സൗജന്യ കാർഷിക വിദഗ്ധ ഉപദേശം", hi: "तमिल, तेलुगु, कन्नड़, मलयालम, हिंदी और अन्य भाषाओं में मुफ़्त कृषि विशेषज्ञ सलाह" },
    timings: { en: "6:00 AM - 10:00 PM (7 days a week)", ta: "காலை 6:00 - இரவு 10:00 (வாரத்தின் 7 நாட்களும்)", te: "ఉ. 6:00 - రా. 10:00 (వారంలో 7 రోజులు)", kn: "ಬೆ. 6:00 - ರಾ. 10:00 (ವಾರದ 7 ದಿನಗಳು)", ml: "രാവിലെ 6:00 - രാത്രി 10:00 (ആഴ്ചയിൽ 7 ദിവസവും)", hi: "सुबह 6:00 - रात 10:00 (सप्ताह के सातों दिन)" },
  },
  {
    title: { en: "PM-KISAN Helpline", ta: "PM-KISAN உதவி எண்", te: "PM-KISAN హెల్ప్‌లైన్", kn: "PM-KISAN ಸಹಾಯವಾಣಿ", ml: "PM-KISAN ഹെൽപ്പ്‌ലൈൻ", hi: "PM-KISAN हेल्पलाइन" },
    category: { en: "National scheme helpline", ta: "தேசிய திட்ட உதவி எண்", te: "జాతీయ పథకం హెల్ప్‌లైన్", kn: "ರಾಷ್ಟ್ರೀಯ ಯೋಜನೆ ಸಹಾಯವಾಣಿ", ml: "ദേശീയ പദ്ധതി ഹെൽപ്പ്‌ലൈൻ", hi: "राष्ट्रीय योजना हेल्पलाइन" },
    icon: "🏦",
    address: { en: "Department of Agriculture & Farmers Welfare, Govt of India", ta: "வேளாண் & விவசாயிகள் நலத் துறை, இந்திய அரசு", te: "వ్యవసాయ & రైతు సంక్షేమ శాఖ, భారత ప్రభుత్వం", kn: "ಕೃಷಿ & ರೈತ ಕಲ್ಯಾಣ ಇಲಾಖೆ, ಭಾರತ ಸರ್ಕಾರ", ml: "കൃഷി & കർഷക ക്ഷേമ വകുപ്പ്, ഭാരത സർക്കാർ", hi: "कृषि एवं किसान कल्याण विभाग, भारत सरकार" },
    phone: "155261",
    services: { en: "PM-KISAN registration, e-KYC and installment payment status queries", ta: "PM-KISAN பதிவு, e-KYC மற்றும் தவணை நிலை தொடர்பான கேள்விகள்", te: "PM-KISAN నమోదు, e-KYC మరియు వాయిదా చెల్లింపు స్థితి ప్రశ్నలు", kn: "PM-KISAN ನೋಂದಣಿ, e-KYC ಮತ್ತು ಕಂತು ಪಾವತಿ ಸ್ಥಿತಿ ಪ್ರಶ್ನೆಗಳು", ml: "PM-KISAN രജിസ്ട്രേഷൻ, e-KYC, ഗഡു പേയ്‌മെന്റ് നില സംബന്ധിച്ച ചോദ്യങ്ങൾ", hi: "PM-KISAN पंजीकरण, e-KYC और किस्त भुगतान की स्थिति से जुड़े सवाल" },
    timings: { en: "Working hours", ta: "அலுவலக நேரம்", te: "పని వేళలు", kn: "ಕೆಲಸದ ಸಮಯ", ml: "പ്രവൃത്തി സമയം", hi: "कार्य समय" },
  },
];

// Reads a JSON array saved in localStorage; null when missing or unreadable.
// Only called from the page body, which renders in the browser (ClientLayout gates it).
function readStoredList<T>(key: string): T[] | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

export default function GovernmentSchemesPage() {
  const { language, setLanguage, location } = useApp();
  const L = PORTAL_TRANSLATIONS[language] || PORTAL_TRANSLATIONS.en;

  // State Management
  const [activeView, setActiveView] = useState<ActiveView>("schemes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedState, setSelectedState] = useState("All States");
  const [activeDetailScheme, setActiveDetailScheme] = useState<SchemeItem | null>(null);
  
  // Saved Schemes (Bookmarking)
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>(() => readStoredList<string>("agri_saved_schemes") ?? []);
  
  // Compare Schemes (up to 4)
  const [compareSchemeIds, setCompareSchemeIds] = useState<string[]>([]);
  
  // Toast / feedback message
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Applications
  const [applications, setApplications] = useState<ApplicationRecord[]>(() => readStoredList<ApplicationRecord>("agri_user_applications") ?? DEFAULT_APPLICATIONS);
  const [newAppScheme, setNewAppScheme] = useState("");
  const [newAppRef, setNewAppRef] = useState("");

  // Eligibility questionnaire state
  const [landSize, setLandSize] = useState("small");
  const [farmerType, setFarmerType] = useState("owner");
  const [isTaxPayer, setIsTaxPayer] = useState("no");
  const [cropType, setCropType] = useState("food");
  const [irrigationFacility, setIrrigationFacility] = useState("borewell");
  const [aadhaarLinked, setAadhaarLinked] = useState("yes");
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  // Calculators State
  const [cropCat, setCropCat] = useState("kharif_food");
  const [area, setArea] = useState<number>(1.5);
  const [sumInsured, setSumInsured] = useState<number>(45000);
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [loanPeriod, setLoanPeriod] = useState<number>(12);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Toggle Bookmark
  const toggleSaveScheme = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (savedSchemeIds.includes(id)) {
      updated = savedSchemeIds.filter(item => item !== id);
      showToast(tr(language, { en: "Removed from Saved Schemes", ta: "சேமித்த திட்டங்களிலிருந்து நீக்கப்பட்டது", te: "సేవ్ చేసిన పథకాల నుండి తొలగించబడింది", kn: "ಉಳಿಸಿದ ಯೋಜನೆಗಳಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ", ml: "സേവ് ചെയ്ത പദ്ധതികളിൽ നിന്ന് നീക്കി", hi: "सहेजी गई योजनाओं से हटाया गया" }));
    } else {
      updated = [...savedSchemeIds, id];
      showToast(tr(language, { en: "⭐ Scheme Bookmarked!", ta: "⭐ திட்டம் சேமிக்கப்பட்டது!", te: "⭐ పథకం సేవ్ అయింది!", kn: "⭐ ಯೋಜನೆ ಉಳಿಸಲಾಗಿದೆ!", ml: "⭐ പദ്ധതി സേവ് ചെയ്തു!", hi: "⭐ योजना सहेजी गई!" }));
    }
    setSavedSchemeIds(updated);
    try {
      localStorage.setItem("agri_saved_schemes", JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  // Toggle Compare
  const toggleCompareScheme = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (compareSchemeIds.includes(id)) {
      setCompareSchemeIds(compareSchemeIds.filter(item => item !== id));
      showToast(tr(language, { en: "Removed from Comparison", ta: "ஒப்பீட்டிலிருந்து நீக்கப்பட்டது", te: "పోలిక నుండి తొలగించబడింది", kn: "ಹೋಲಿಕೆಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ", ml: "താരതമ്യത്തിൽ നിന്ന് നീക്കി", hi: "तुलना से हटाया गया" }));
    } else {
      if (compareSchemeIds.length >= 4) {
        showToast(tr(language, { en: "You can compare up to 4 schemes at a time.", ta: "ஒரே நேரத்தில் 4 திட்டங்கள் வரை ஒப்பிடலாம்.", te: "ఒకేసారి 4 పథకాల వరకు పోల్చవచ్చు.", kn: "ಒಮ್ಮೆಗೆ 4 ಯೋಜನೆಗಳವರೆಗೆ ಹೋಲಿಸಬಹುದು.", ml: "ഒരേ സമയം 4 പദ്ധതികൾ വരെ താരതമ്യം ചെയ്യാം.", hi: "एक बार में 4 योजनाओं तक तुलना कर सकते हैं।" }));
        return;
      }
      setCompareSchemeIds([...compareSchemeIds, id]);
      showToast(tr(language, { en: "Added to Comparison (📊 Compare Schemes)", ta: "ஒப்பீட்டில் சேர்க்கப்பட்டது (📊 திட்டங்களை ஒப்பிடுக)", te: "పోలికకు జోడించబడింది (📊 పథకాలను పోల్చండి)", kn: "ಹೋಲಿಕೆಗೆ ಸೇರಿಸಲಾಗಿದೆ (📊 ಯೋಜನೆಗಳನ್ನು ಹೋಲಿಸಿ)", ml: "താരതമ്യത്തിൽ ചേർത്തു (📊 പദ്ധതികൾ താരതമ്യം ചെയ്യുക)", hi: "तुलना में जोड़ा गया (📊 योजनाओं की तुलना)" }));
    }
  };

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return ALL_GOVERNMENT_SCHEMES.filter(scheme => {
      // Search text match
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery = !query || 
        scheme.title.toLowerCase().includes(query) ||
        scheme.description.toLowerCase().includes(query) ||
        scheme.benefit.toLowerCase().includes(query) ||
        scheme.state.toLowerCase().includes(query) ||
        scheme.category.toLowerCase().includes(query);

      // Category match
      const matchesCategory = selectedCategory === "All Categories" || scheme.category === selectedCategory;

      // State match
      const matchesState = selectedState === "All States" || scheme.state === selectedState || (selectedState !== "All India" && scheme.state === "All India");

      return matchesQuery && matchesCategory && matchesState;
    });
  }, [searchQuery, selectedCategory, selectedState]);

  // Saved schemes list
  const savedSchemesList = useMemo(() => {
    return ALL_GOVERNMENT_SCHEMES.filter(s => savedSchemeIds.includes(s.id));
  }, [savedSchemeIds]);

  // Compare schemes list
  const compareSchemesList = useMemo(() => {
    return ALL_GOVERNMENT_SCHEMES.filter(s => compareSchemeIds.includes(s.id));
  }, [compareSchemeIds]);

  // Eligibility evaluation
  const userState = location?.state?.toLowerCase() ?? "";
  const eligibleSchemes = useMemo(() => {
    if (!eligibilityChecked) return [];
    const ownsLand = farmerType === "owner";
    const isSmallOrMarginal = landSize === "marginal" || landSize === "small";
    return ALL_GOVERNMENT_SCHEMES.filter(scheme => {
      // Only national schemes and schemes of the farmer's own state apply
      if (scheme.state !== "All India" && scheme.state.toLowerCase() !== userState) {
        return false;
      }
      // PM-KISAN: land-owning farmer families only, no income-tax payers, paid to an Aadhaar-seeded account
      if (scheme.id === "pm-kisan" && (!ownsLand || isTaxPayer === "yes" || aadhaarLinked === "no")) {
        return false;
      }
      // PM-KMY pension: small & marginal farmers (up to 2 hectares), no income-tax payers
      if (scheme.id === "pm-kmy" && (!isSmallOrMarginal || isTaxPayer === "yes")) {
        return false;
      }
      // Horticulture schemes are for fruit/vegetable/flower/spice growers
      if (scheme.category === "Horticulture") {
        return cropType === "horticulture";
      }
      // Irrigation subsidies matter most to rainfed farms and those with their own water source
      if (scheme.category === "Irrigation") {
        return irrigationFacility === "borewell" || irrigationFacility === "rainfed";
      }
      return true;
    })
      // Show the farmer's state schemes before the national ones
      .sort((a, b) => Number(a.state === "All India") - Number(b.state === "All India"))
      .slice(0, 8);
  }, [eligibilityChecked, isTaxPayer, farmerType, landSize, aadhaarLinked, cropType, irrigationFacility, userState]);

  // Add new application
  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppScheme.trim() || !newAppRef.trim()) return;
    const newRecord: ApplicationRecord = {
      id: `user-app-${Date.now()}`,
      schemeTitle: newAppScheme.trim(),
      refNumber: newAppRef.trim(),
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Under Review",
      benefitExpected: "Application Logged by Farmer"
    };
    const updated = [newRecord, ...applications];
    setApplications(updated);
    try {
      localStorage.setItem("agri_user_applications", JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setNewAppScheme("");
    setNewAppRef("");
    showToast(tr(language, { en: "Application Reference Added!", ta: "விண்ணப்ப குறிப்பு சேர்க்கப்பட்டது!", te: "దరఖాస్తు రిఫరెన్స్ జోడించబడింది!", kn: "ಅರ್ಜಿ ಉಲ್ಲೇಖ ಸೇರಿಸಲಾಗಿದೆ!", ml: "അപേക്ഷാ റഫറൻസ് ചേർത്തു!", hi: "आवेदन संदर्भ जोड़ा गया!" }));
  };

  // Reset/Refresh
  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedState("All States");
    showToast(tr(language, { en: "Filters reset. Schemes refreshed.", ta: "வடிகட்டிகள் மீட்டமைக்கப்பட்டன. திட்டங்கள் புதுப்பிக்கப்பட்டன.", te: "ఫిల్టర్లు రీసెట్ అయ్యాయి. పథకాలు రిఫ్రెష్ అయ్యాయి.", kn: "ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ಯೋಜನೆಗಳು ರಿಫ್ರೆಶ್ ಆಗಿವೆ.", ml: "ഫിൽട്ടറുകൾ പുനഃസജ്ജമാക്കി. പദ്ധതികൾ പുതുക്കി.", hi: "फ़िल्टर रीसेट हुए। योजनाएं रीफ़्रेश हुईं।" }));
  };

  // Calculators logic
  const pmfbyResults = useMemo(() => {
    let farmerRate = 0.02;
    if (cropCat === "rabi_food") farmerRate = 0.015;
    else if (cropCat === "commercial") farmerRate = 0.05;

    const totalSum = area * sumInsured;
    const totalActuarialPremium = totalSum * 0.12;
    const farmerPremium = totalSum * farmerRate;
    const govSubsidy = Math.max(0, totalActuarialPremium - farmerPremium);

    return { totalSum, farmerPremium, govSubsidy, totalActuarialPremium };
  }, [cropCat, area, sumInsured]);

  const kccResults = useMemo(() => {
    // Banks charge 7% under the interest subvention scheme. Repaying within 12 months earns a further
    // 3% prompt-repayment incentive (effective 4%), but only on the first ₹3 lakh of the loan.
    const standardRate = 0.07;
    const promptIncentive = 0.03;
    const SUBVENTION_CAP = 300000;
    const years = loanPeriod / 12;

    const standardInterest = loanAmount * standardRate * years;
    const incentive = loanPeriod <= 12 ? Math.min(loanAmount, SUBVENTION_CAP) * promptIncentive * years : 0;
    const promptInterest = standardInterest - incentive;
    const savings = incentive;
    const totalRepay = loanAmount + promptInterest;

    return { standardInterest, promptInterest, savings, totalRepay };
  }, [loanAmount, loanPeriod]);

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  return (
    <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "12px 24px 60px 24px", boxSizing: "border-box" }}>
      
      {/* ── Toast Notification ────────────────────────────── */}
      {feedbackToast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "var(--primary-dark)",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          zIndex: 9999,
          fontSize: 13.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 10,
          animation: "fadeIn 0.2s ease"
        }}>
          <span>✨</span>
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ── Top Header Bar ───────────────────────────────── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 20px",
        background: "var(--bg-card)",
        borderRadius: 18,
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        marginBottom: 22
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            color: "#fff",
            boxShadow: "0 4px 12px rgba(92,122,62,0.3)"
          }}>
            🌾
          </div>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "Playfair Display, serif",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--text)"
            }}>
              <span>{L.brandTitle}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
              {L.portalSubtitle}
            </div>
          </div>
        </div>

        {/* Header Right Actions: Language Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            className="input"
            style={{
              padding: "7px 12px",
              fontSize: 13,
              borderRadius: 10,
              fontWeight: 600,
              width: "auto",
              cursor: "pointer"
            }}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="ml">മലയാളം</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>

      {/* ── Top Action Quick-Cards Hub (9 Arranged Frames) ── */}
      {/* ── Search: always visible, so schemes can be found without scrolling past the tiles ── */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <span aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--text-muted)", pointerEvents: "none" }}>🔍</span>
        <input
          type="search"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            // Results live in the schemes list, so searching from any other view jumps back to it
            if (e.target.value.trim()) setActiveView("schemes");
          }}
          placeholder={L.searchPlaceholder}
          aria-label={L.searchPlaceholder}
          className="input"
          style={{ paddingLeft: 42, paddingRight: 42, borderRadius: 14, fontSize: 14, width: "100%", height: 46 }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label={tr(language, { en: "Clear search", ta: "தேடலை அழி", te: "శోధన తొలగించండి", kn: "ಹುಡುಕಾಟ ಅಳಿಸಿ", ml: "തിരയൽ മായ്ക്കുക", hi: "खोज हटाएं" })}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--text-muted)", width: 32, height: 32 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* The tile hub collapses while searching so the results start right below the search box */}
      {!searchQuery.trim() && (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 20
      }}>
        {/* 1. Government Schemes */}
        <div
          onClick={() => setActiveView("schemes")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "schemes" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "schemes" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "schemes" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🏛️</span>
            <span style={{
              fontSize: 10,
              background: activeView === "schemes" ? "var(--primary)" : "var(--accent)",
              color: activeView === "schemes" ? "#fff" : "var(--primary-dark)",
              padding: "2px 7px",
              borderRadius: 99,
              fontWeight: 700
            }}>
              {ALL_GOVERNMENT_SCHEMES.length} {L.schemesCount}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardSchemesTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardSchemesDesc}
          </div>
        </div>

        {/* 2. Check Eligibility */}
        <div
          onClick={() => setActiveView("eligibility")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "eligibility" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "eligibility" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "eligibility" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🎯</span>
            <span style={{ fontSize: 10, background: "rgba(16,185,129,0.15)", color: "#047857", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              {tr(language, { en: "Checker", ta: "சரிபார்ப்பு", te: "తనిఖీ", kn: "ಪರಿಶೀಲನೆ", ml: "പരിശോധന", hi: "जांच" })}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardEligibilityTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardEligibilityDesc}
          </div>
        </div>

        {/* 3. Subsidy Calculators */}
        <div
          onClick={() => setActiveView("calculators")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "calculators" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "calculators" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "calculators" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🧮</span>
            <span style={{ fontSize: 10, background: "rgba(59,130,246,0.15)", color: "#1D4ED8", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              PMFBY & KCC
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardCalculatorsTitle || L.tabCalculators}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardCalculatorsDesc}
          </div>
        </div>

        {/* 4. Saved Schemes */}
        <div
          onClick={() => setActiveView("saved")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "saved" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "saved" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "saved" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>⭐</span>
            <span style={{
              fontSize: 10,
              background: savedSchemeIds.length > 0 ? "var(--secondary-light)" : "var(--bg)",
              color: savedSchemeIds.length > 0 ? "#fff" : "var(--text-muted)",
              padding: "2px 7px",
              borderRadius: 99,
              fontWeight: 700
            }}>
              {savedSchemeIds.length} {L.savedCountLabel || "Saved"}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardSavedTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardSavedDesc}
          </div>
        </div>

        {/* 5. Compare Schemes */}
        <div
          onClick={() => setActiveView("compare")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "compare" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "compare" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "compare" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📊</span>
            <span style={{
              fontSize: 10,
              background: compareSchemeIds.length > 0 ? "var(--primary)" : "var(--bg)",
              color: compareSchemeIds.length > 0 ? "#fff" : "var(--text-muted)",
              padding: "2px 7px",
              borderRadius: 99,
              fontWeight: 700
            }}>
              {compareSchemeIds.length}/4
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardCompareTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardCompareDesc}
          </div>
        </div>

        {/* 6. Scheme Alerts */}
        <div
          onClick={() => setActiveView("alerts")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "alerts" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "alerts" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "alerts" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🔔</span>
            <span style={{ fontSize: 10, background: "#EF4444", color: "#fff", padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>
              {tr(language, { en: "LIVE", ta: "நேரலை", te: "లైవ్", kn: "ಲೈವ್", ml: "തത്സമയം", hi: "लाइव" })}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardAlertsTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardAlertsDesc}
          </div>
        </div>

        {/* 7. Nearby Help Centers */}
        <div
          onClick={() => setActiveView("centers")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "centers" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "centers" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "centers" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📍</span>
            <span style={{ fontSize: 10, background: "rgba(139,92,246,0.15)", color: "#6D28D9", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              {tr(language, { en: "KVK & Govt", ta: "KVK & அரசு", te: "KVK & ప్రభుత్వం", kn: "KVK & ಸರ್ಕಾರ", ml: "KVK & സർക്കാർ", hi: "KVK और सरकार" })}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardCentersTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardCentersDesc}
          </div>
        </div>

        {/* 8. My Applications */}
        <div
          onClick={() => setActiveView("applications")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "applications" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "applications" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "applications" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <span style={{ fontSize: 10, background: "rgba(16,185,129,0.15)", color: "#047857", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              {applications.length} {tr(language, { en: "Tracked", ta: "கண்காணிப்பில்", te: "ట్రాక్‌లో", kn: "ಟ್ರ್ಯಾಕ್‌ನಲ್ಲಿ", ml: "ട്രാക്ക് ചെയ്യുന്നു", hi: "ट्रैक हो रहे" })}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardApplicationsTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardApplicationsDesc}
          </div>
        </div>

        {/* 9. Ask About This (Links to OCR Document Scanner) */}
        <Link
          href="/documents"
          className="card"
          style={{
            textDecoration: "none",
            display: "block",
            padding: "14px 16px",
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📷</span>
            <span style={{ fontSize: 10, background: "rgba(245,158,11,0.15)", color: "#B45309", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              {L.ocrScanBadge || "OCR Scan"}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardAskTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardAskDesc}
          </div>
        </Link>
      </div>
      )}

      {/* ── Active View Indicator Bar ──────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        padding: "10px 16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
          <span style={{ color: "var(--text-muted)" }}>{L.activeView || "Active View"}:</span>
          <span style={{
            padding: "3px 12px",
            background: "var(--accent)",
            color: "var(--primary-dark)",
            borderRadius: 99,
            border: "1px solid var(--border-dark)",
            fontSize: 12.5,
            fontWeight: 800
          }}>
            {activeView === "schemes" && `🏛️ ${L.cardSchemesTitle} (${filteredSchemes.length} ${L.of || "of"} ${ALL_GOVERNMENT_SCHEMES.length})`}
            {activeView === "eligibility" && `🎯 ${L.cardEligibilityTitle}`}
            {activeView === "calculators" && `🧮 ${L.cardCalculatorsTitle}`}
            {activeView === "saved" && `⭐ ${L.cardSavedTitle} (${savedSchemeIds.length})`}
            {activeView === "compare" && `📊 ${L.cardCompareTitle} (${compareSchemeIds.length})`}
            {activeView === "alerts" && `🔔 ${L.cardAlertsTitle}`}
            {activeView === "centers" && `📍 ${L.cardCentersTitle}`}
            {activeView === "applications" && `📋 ${L.cardApplicationsTitle} (${applications.length})`}
          </span>
        </div>

        {activeView !== "schemes" && (
          <button
            onClick={() => setActiveView("schemes")}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 10, fontSize: 12, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>←</span>
            <span>{L.backToSchemes || "Back to All Schemes"}</span>
          </button>
        )}
      </div>

      {/* Floating Compare Drawer */}
      {compareSchemeIds.length > 0 && activeView !== "compare" && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--primary-dark)",
          color: "#fff",
          padding: "10px 22px",
          borderRadius: 99,
          boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: 14,
          animation: "fadeIn 0.2s ease"
        }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            📊 {compareSchemeIds.length} {L.schemesSelectedCompare || "Schemes Selected for Comparison"}
          </span>
          <button
            onClick={() => setActiveView("compare")}
            className="btn btn-sm"
            style={{
              background: "#fff",
              color: "var(--primary-dark)",
              borderRadius: 99,
              fontWeight: 800,
              fontSize: 12,
              padding: "5px 14px"
            }}
          >
            {L.viewCompareTable || "View Comparison Table"} →
          </button>
          <button
            onClick={() => setCompareSchemeIds([])}
            title={tr(language, { en: "Clear comparison", ta: "ஒப்பீட்டை அழி", te: "పోలిక తొలగించండి", kn: "ಹೋಲಿಕೆ ಅಳಿಸಿ", ml: "താരതമ്യം മായ്ക്കുക", hi: "तुलना साफ़ करें" })}
            style={{ background: "none", border: "none", color: "#fff", opacity: 0.8, cursor: "pointer", fontSize: 14 }}
          >
            ✕
          </button>
        </div>
      )}
{/* ── 1. MAIN SCHEMES VIEW ─────────────────────────── */}
      {activeView === "schemes" && (
        <div>
          {/* Search and Filter Controls Frame */}
          <div className="card" style={{
            padding: "18px 20px",
            borderRadius: 18,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-card)",
            marginBottom: 20
          }}>
            {/* Row 1: Search bar, Category Dropdown, State Dropdown */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
              alignItems: "center",
              marginBottom: 14
            }}>
              {/* All Categories Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="input"
                  style={{ borderRadius: 12, fontSize: 13.5, fontWeight: 600, width: "100%" }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c === "All Categories" ? `🏷️ ${getCategoryLabel(c, language)}` : getCategoryLabel(c, language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* All States Filter */}
              <div>
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="input"
                  style={{ borderRadius: 12, fontSize: 13.5, fontWeight: 600, width: "100%" }}
                >
                  {STATES.map(s => (
                    <option key={s} value={s}>
                      {s === "All States"
                        ? `📍 ${getStateLabel(s, language)}`
                        : s === "All India"
                        ? `🇮🇳 ${getStateLabel(s, language)} ${L.nationalSchemes || ""}`
                        : `🏛️ ${getStateLabel(s, language)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Category Quick Chips */}
            <div style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 8,
              marginBottom: 12,
              scrollbarWidth: "none"
            }}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      whiteSpace: "nowrap",
                      padding: "5px 12px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      border: isSelected ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                      background: isSelected ? "var(--primary)" : "var(--bg)",
                      color: isSelected ? "#fff" : "var(--text)",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {getCategoryLabel(cat, language)}
                  </button>
                );
              })}
            </div>

            {/* Row 3: Active Filter Summary & Result Count */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              borderTop: "1px dashed var(--border)",
              paddingTop: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {location?.state && selectedState !== location.state && (
                  <button
                    onClick={() => setSelectedState(location.state)}
                    style={{
                      fontSize: 11.5,
                      padding: "3px 10px",
                      borderRadius: 99,
                      background: "var(--accent)",
                      color: "var(--primary-dark)",
                      border: "1px solid var(--border-dark)",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <span>📍</span>
                    <span>{L.detectedState || "My Detected State"}: <strong>{getStateLabel(location.state, language)}</strong></span>
                  </button>
                )}

                {selectedCategory !== "All Categories" && (
                  <span style={{
                    fontSize: 11.5,
                    background: "var(--bg)",
                    color: "var(--text)",
                    padding: "3px 9px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span>{L.categoryCol || "Category"}: <strong>{getCategoryLabel(selectedCategory, language)}</strong></span>
                    <button onClick={() => setSelectedCategory("All Categories")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: 0 }}>✕</button>
                  </span>
                )}

                {selectedState !== "All States" && (
                  <span style={{
                    fontSize: 11.5,
                    background: "var(--bg)",
                    color: "var(--text)",
                    padding: "3px 9px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span>{L.coverageCol || "State"}: <strong>{getStateLabel(selectedState, language)}</strong></span>
                    <button onClick={() => setSelectedState("All States")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: 0 }}>✕</button>
                  </span>
                )}

                {searchQuery && (
                  <span style={{
                    fontSize: 11.5,
                    background: "var(--bg)",
                    color: "var(--text)",
                    padding: "3px 9px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span>{L.searchPrefix || "Search"}: <strong>&quot;{searchQuery}&quot;</strong></span>
                    <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: 0 }}>✕</button>
                  </span>
                )}

                {(selectedCategory !== "All Categories" || selectedState !== "All States" || searchQuery) && (
                  <button
                    onClick={handleRefresh}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: "2px 6px"
                    }}
                  >
                    {L.resetFilters || "Reset All Filters"}
                  </button>
                )}
              </div>

              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--primary-dark)",
                background: "var(--accent)",
                padding: "4px 12px",
                borderRadius: 99,
                border: "1px solid var(--border-dark)"
              }}>
                {L.showing || "Showing"} {filteredSchemes.length} {L.of || "of"} {ALL_GOVERNMENT_SCHEMES.length} {L.schemesCount}
              </div>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {filteredSchemes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{L.noSchemesFound || "No Government Schemes Found"}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                {L.noSchemesDesc || "Try adjusting your search terms or resetting the category and state filters."}
              </p>
              <button onClick={handleRefresh} className="btn btn-primary btn-sm">
                {L.resetFilters || "Reset All Filters"}
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 16
            }}>
              {filteredSchemes.map(rawScheme => {
                const scheme = getLocalizedScheme(rawScheme, language);
                const isSaved = savedSchemeIds.includes(scheme.id);
                const isComparing = compareSchemeIds.includes(scheme.id);

                return (
                  <div
                    key={scheme.id}
                    className="card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: 20,
                      borderRadius: 16,
                      border: isSaved ? "1.5px solid var(--secondary)" : "1px solid var(--border)",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                      position: "relative"
                    }}
                  >
                    <div>
                      {/* Card Top Pill Row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 26, flexShrink: 0 }}>{scheme.icon}</span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 99,
                            background: "var(--accent)",
                            color: "var(--primary-dark)",
                            border: "1px solid var(--border)",
                            whiteSpace: "nowrap"
                          }}>
                            {getCategoryLabel(scheme.category, language)}
                          </span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 99,
                            background: "var(--bg)",
                            color: "var(--text-muted)",
                            whiteSpace: "nowrap"
                          }}>
                            📍 {getStateLabel(scheme.coverage, language)}
                          </span>
                        </div>

                        {/* Save / Bookmark Button */}
                        <button
                          onClick={(e) => toggleSaveScheme(scheme.id, e)}
                          title={isSaved ? tr(language, { en: "Saved in bookmarks", ta: "சேமிப்பில் உள்ளது", te: "బుక్‌మార్క్‌లో సేవ్ అయింది", kn: "ಬುಕ್‌ಮಾರ್ಕ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ", ml: "ബുക്ക്മാർക്കിൽ സേവ് ചെയ്തു", hi: "बुकमार्क में सहेजा गया" }) : tr(language, { en: "Bookmark this scheme", ta: "இந்தத் திட்டத்தைச் சேமி", te: "ఈ పథకాన్ని బుక్‌మార్క్ చేయండి", kn: "ಈ ಯೋಜನೆಯನ್ನು ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ", ml: "ഈ പദ്ധതി ബുക്ക്മാർക്ക് ചെയ്യുക", hi: "इस योजना को बुकमार्क करें" })}
                          style={{
                            background: isSaved ? "var(--secondary-light)" : "var(--bg)",
                            color: isSaved ? "#fff" : "var(--text-muted)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            transition: "all 0.15s ease"
                          }}
                        >
                          {isSaved ? `⭐ ${L.saved}` : `☆ ${L.save}`}
                        </button>
                      </div>

                      {/* Scheme Title */}
                      <h3 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text)",
                        lineHeight: 1.35,
                        marginBottom: 8
                      }}>
                        {scheme.title}
                      </h3>

                      {/* Scheme Description */}
                      <p style={{
                        fontSize: 12.5,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                        marginBottom: 14
                      }}>
                        {scheme.description}
                      </p>

                      {/* Key Benefit Highlight Box */}
                      <div style={{
                        background: "var(--bg)",
                        borderLeft: "3.5px solid var(--primary)",
                        padding: "8px 12px",
                        borderRadius: "0 8px 8px 0",
                        marginBottom: 14
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 2 }}>
                          💰 {L.keyBenefit}
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>
                          {scheme.benefit}
                        </div>
                      </div>

                      {/* Required Documents Badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                        <span style={{
                          fontSize: 11.5,
                          background: "var(--accent)",
                          color: "var(--primary-dark)",
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontWeight: 600
                        }}>
                          📄 {scheme.documentsList.length} {L.documentsReq} {L.requiredLabel || ""}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderTop: "1px solid var(--border)",
                      paddingTop: 14,
                      flexWrap: "wrap"
                    }}>
                      <button
                        onClick={() => setActiveDetailScheme(scheme)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: "1 1 120px", justifyContent: "center", whiteSpace: "nowrap" }}
                      >
                        👁️ {L.viewDetails}
                      </button>

                      <button
                        onClick={(e) => toggleCompareScheme(scheme.id, e)}
                        className={`btn btn-sm ${isComparing ? "btn-amber" : "btn-secondary"}`}
                        style={{ flex: "0 0 auto", justifyContent: "center", fontSize: 12, whiteSpace: "nowrap" }}
                      >
                        {isComparing ? `✓ ${L.inCompare}` : `+ ${L.addToCompare}`}
                      </button>

                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ padding: "6px 10px", flexShrink: 0 }}
                        title={L.visitOfficialPortal}
                      >
                        🔗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 2. SAVED SCHEMES VIEW ────────────────────────── */}
      {activeView === "saved" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>⭐ {L.cardSavedTitle}</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {tr(language, {
                  en: `You have ${savedSchemesList.length} bookmarked government scheme${savedSchemesList.length === 1 ? "" : "s"} for quick reference.`,
                  ta: `விரைவாகப் பார்க்க ${savedSchemesList.length} அரசு திட்டங்களைச் சேமித்துள்ளீர்கள்.`,
                  te: `త్వరగా చూడటానికి మీరు ${savedSchemesList.length} ప్రభుత్వ పథకాలను సేవ్ చేశారు.`,
                  kn: `ಬೇಗ ನೋಡಲು ನೀವು ${savedSchemesList.length} ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಉಳಿಸಿದ್ದೀರಿ.`,
                  ml: `വേഗത്തിൽ കാണാൻ നിങ്ങൾ ${savedSchemesList.length} സർക്കാർ പദ്ധതികൾ സേവ് ചെയ്തിട്ടുണ്ട്.`,
                  hi: `आपने जल्दी देखने के लिए ${savedSchemesList.length} सरकारी योजनाएं सहेजी हैं।`,
                })}
              </p>
            </div>
            {savedSchemesList.length > 0 && (
              <button
                onClick={() => {
                  setSavedSchemeIds([]);
                  localStorage.removeItem("agri_saved_schemes");
                  showToast(tr(language, { en: "Cleared all bookmarked schemes.", ta: "சேமித்த அனைத்து திட்டங்களும் நீக்கப்பட்டன.", te: "సేవ్ చేసిన అన్ని పథకాలు తొలగించబడ్డాయి.", kn: "ಉಳಿಸಿದ ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ಅಳಿಸಲಾಗಿದೆ.", ml: "സേവ് ചെയ്ത എല്ലാ പദ്ധതികളും മായ്ച്ചു.", hi: "सभी सहेजी गई योजनाएं हटा दी गईं।" }));
                }}
                className="btn btn-danger btn-sm"
              >
                {L.clearAllSaved || "Clear All Saved"}
              </button>
            )}
          </div>

          {savedSchemesList.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>⭐</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{L.noSavedTitle || "No Saved Schemes Yet"}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 460, margin: "0 auto 20px auto" }}>
                {L.verifiedBannerSub}
              </p>
              <button onClick={() => setActiveView("schemes")} className="btn btn-primary btn-sm">
                {L.exploreAllSchemes || "Explore All Government Schemes"}
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 16
            }}>
              {savedSchemesList.map(rawScheme => {
                const scheme = getLocalizedScheme(rawScheme, language);
                return (
                  <div key={scheme.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 20 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 26 }}>{scheme.icon}</span>
                        <button
                          onClick={() => toggleSaveScheme(scheme.id)}
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                        >
                          ✕ {L.remove || "Remove"}
                        </button>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{scheme.title}</h3>
                      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 12 }}>{scheme.description}</p>
                      <div style={{ background: "var(--bg)", padding: 10, borderRadius: 8, borderLeft: "3.5px solid var(--primary)", marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-dark)" }}>{L.keyBenefit}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{scheme.benefit}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 12, flexWrap: "wrap" }}>
                      <button onClick={() => setActiveDetailScheme(scheme)} className="btn btn-primary btn-sm" style={{ flex: "1 1 120px", justifyContent: "center", whiteSpace: "nowrap" }}>
                        👁️ {L.viewDetails}
                      </button>
                      <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                        🔗 {L.officialSource}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. COMPARE SCHEMES VIEW ──────────────────────── */}
      {activeView === "compare" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>📊 {L.cardCompareTitle}</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {tr(language, { en: "Compare subsidy percentages, required documents, eligibility, and official portals side-by-side.", ta: "சப்ஸிடி சதவீதம், தேவையான ஆவணங்கள், தகுதி மற்றும் அதிகாரப்பூர்வ தளங்களை அருகருகே ஒப்பிடுங்கள்.", te: "సబ్సిడీ శాతం, అవసరమైన పత్రాలు, అర్హత మరియు అధికారిక పోర్టల్‌లను పక్కపక్కనే పోల్చండి.", kn: "ಸಬ್ಸಿಡಿ ಶೇಕಡಾ, ಅಗತ್ಯ ದಾಖಲೆಗಳು, ಅರ್ಹತೆ ಮತ್ತು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳನ್ನು ಅಕ್ಕಪಕ್ಕದಲ್ಲಿ ಹೋಲಿಸಿ.", ml: "സബ്സിഡി ശതമാനം, ആവശ്യമായ രേഖകൾ, യോഗ്യത, ഔദ്യോഗിക പോർട്ടലുകൾ എന്നിവ അടുത്തടുത്ത് താരതമ്യം ചെയ്യുക.", hi: "सब्सिडी प्रतिशत, ज़रूरी दस्तावेज़, पात्रता और आधिकारिक पोर्टल एक साथ तुलना करें।" })}
              </p>
            </div>
            {compareSchemesList.length > 0 && (
              <button
                onClick={() => {
                  setCompareSchemeIds([]);
                  showToast(tr(language, { en: "Cleared comparison list.", ta: "ஒப்பீட்டுப் பட்டியல் அழிக்கப்பட்டது.", te: "పోలిక జాబితా తొలగించబడింది.", kn: "ಹೋಲಿಕೆ ಪಟ್ಟಿ ಅಳಿಸಲಾಗಿದೆ.", ml: "താരതമ്യ പട്ടിക മായ്ച്ചു.", hi: "तुलना सूची साफ़ की गई।" }));
                }}
                className="btn btn-secondary btn-sm"
              >
                {L.clearComparison || "Clear Comparison"}
              </button>
            )}
          </div>

          {compareSchemesList.length < 2 ? (
            <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>📊</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{L.compareMinTwo || "Select at least 2 schemes to compare"}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 20px auto" }}>
                {L.cardCompareDesc}
              </p>
              <button onClick={() => setActiveView("schemes")} className="btn btn-primary btn-sm">
                {L.returnToList || "Return to Scheme List"}
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "var(--bg-card)",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)"
              }}>
                <thead>
                  <tr style={{ background: "var(--accent)", borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: "16px 14px", textAlign: "left", fontSize: 13, fontWeight: 800, width: 180 }}>
                      {L.featureAttribute || "Feature / Attribute"}
                    </th>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <th key={s.id} style={{ padding: "16px 14px", textAlign: "left", fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                            <div>
                              <span style={{ fontSize: 20 }}>{s.icon}</span> {s.title}
                            </div>
                            <button
                              onClick={() => toggleCompareScheme(s.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#EF4444" }}
                              title={tr(language, { en: "Remove from comparison", ta: "ஒப்பீட்டிலிருந்து நீக்கு", te: "పోలిక నుండి తొలగించండి", kn: "ಹೋಲಿಕೆಯಿಂದ ತೆಗೆದುಹಾಕಿ", ml: "താരതമ്യത്തിൽ നിന്ന് നീക്കുക", hi: "तुलना से हटाएं" })}
                            >
                              ✕
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Category */}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.categoryCol || "Category"}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>
                          {getCategoryLabel(s.category, language)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Coverage */}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.coverageCol || "State / Coverage"}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 13 }}>
                          📍 {getStateLabel(s.coverage, language)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Key Financial Benefit */}
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--primary-dark)" }}>{L.keyBenefit}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "var(--primary-dark)" }}>
                          {s.benefit}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Required Documents Count */}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.documentsCol || "Documents Needed"}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 12.5 }}>
                          <span style={{ fontWeight: 700 }}>{s.documentsList.length} {L.documentsReq} {L.requiredLabel || ""}</span>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                            {s.documentsList.slice(0, 3).join(", ")}...
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Eligibility Highlights */}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.eligibilityTitle}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 12, lineHeight: 1.4 }}>
                          <ul style={{ paddingLeft: 16 }}>
                            {s.eligibility.slice(0, 2).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Official Link */}
                  <tr>
                    <td style={{ padding: "14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.actionCol || "Action"}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setActiveDetailScheme(s)} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
                              {L.viewDetails}
                            </button>
                            <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ fontSize: 12 }}>
                              {L.officialSource} ↗
                            </a>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 4. SCHEME ALERTS & UPDATES VIEW ──────────────── */}
      {activeView === "alerts" && (
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>🔔 {L.cardAlertsTitle}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {tr(language, { en: "Official government notices, DBT installment release dates, and subsidy enrollment deadlines.", ta: "அதிகாரப்பூர்வ அரசு அறிவிப்புகள், DBT தவணை வெளியீட்டு தேதிகள் மற்றும் மானியப் பதிவு கடைசி தேதிகள்.", te: "అధికారిక ప్రభుత్వ నోటీసులు, DBT వాయిదా విడుదల తేదీలు మరియు సబ్సిడీ నమోదు గడువులు.", kn: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸೂಚನೆಗಳು, DBT ಕಂತು ಬಿಡುಗಡೆ ದಿನಾಂಕಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿ ನೋಂದಣಿ ಗಡುವುಗಳು.", ml: "ഔദ്യോഗിക സർക്കാർ അറിയിപ്പുകൾ, DBT ഗഡു വിതരണ തീയതികൾ, സബ്സിഡി രജിസ്ട്രേഷൻ അവസാന തീയതികൾ.", hi: "आधिकारिक सरकारी सूचनाएं, DBT किस्त जारी होने की तारीखें और सब्सिडी नामांकन की अंतिम तिथियां।" })}
            </p>
          </div>

          {/* Web Push Notification Box */}
          <div style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--bg-card) 100%)",
            border: "1.5px solid var(--primary-light)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>📲</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--primary-dark)" }}>
                  {tr(language, { en: "Get Real-Time Scheme Alerts on Phone Lockscreen", ta: "போன் பூட்டுத் திரையில் நேரடி திட்ட எச்சரிக்கைகளைப் பெறுங்கள்", te: "ఫోన్ లాక్‌స్క్రీన్‌పై తక్షణ పథకం అలర్ట్‌లు పొందండి", kn: "ಫೋನ್ ಲಾಕ್‌ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ನೇರ ಯೋಜನೆ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ", ml: "ഫോൺ ലോക്ക്സ്ക്രീനിൽ തത്സമയ പദ്ധതി അലേർട്ടുകൾ നേടുക", hi: "फ़ोन लॉकस्क्रीन पर योजना अलर्ट तुरंत पाएं" })}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {tr(language, { en: "Receive notifications even when the browser is closed. Never miss an installment release or subsidy cutoff.", ta: "உலாவி மூடியிருந்தாலும் அறிவிப்புகளைப் பெறுங்கள். தவணை வெளியீடு அல்லது மானிய கடைசி தேதியைத் தவறவிடாதீர்கள்.", te: "బ్రౌజర్ మూసి ఉన్నా నోటిఫికేషన్లు పొందండి. వాయిదా విడుదల లేదా సబ్సిడీ గడువును ఎప్పుడూ మిస్ అవ్వకండి.", kn: "ಬ್ರೌಸರ್ ಮುಚ್ಚಿದ್ದರೂ ಅಧಿಸೂಚನೆಗಳನ್ನು ಪಡೆಯಿರಿ. ಕಂತು ಬಿಡುಗಡೆ ಅಥವಾ ಸಬ್ಸಿಡಿ ಗಡುವನ್ನು ತಪ್ಪಿಸಿಕೊಳ್ಳಬೇಡಿ.", ml: "ബ്രൗസർ അടച്ചിരിക്കുമ്പോഴും അറിയിപ്പുകൾ ലഭിക്കും. ഗഡു വിതരണമോ സബ്സിഡി അവസാന തീയതിയോ നഷ്ടപ്പെടുത്തരുത്.", hi: "ब्राउज़र बंद होने पर भी सूचनाएं पाएं। किस्त जारी होने या सब्सिडी की अंतिम तिथि कभी न चूकें।" })}
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  if ("Notification" in window) {
                    const perm = await Notification.requestPermission();
                    if (perm === "granted") {
                      showToast(tr(language, { en: "🔔 Push Notifications Activated!", ta: "🔔 புஷ் அறிவிப்புகள் இயக்கப்பட்டன!", te: "🔔 పుష్ నోటిఫికేషన్లు ఆన్ అయ్యాయి!", kn: "🔔 ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ!", ml: "🔔 പുഷ് അറിയിപ്പുകൾ ഓണാക്കി!", hi: "🔔 पुश सूचनाएं चालू हो गईं!" }));
                    } else {
                      showToast(tr(language, { en: "Please allow notifications in your browser settings.", ta: "உலாவி அமைப்புகளில் அறிவிப்புகளை அனுமதிக்கவும்.", te: "బ్రౌజర్ సెట్టింగ్‌లలో నోటిఫికేషన్లను అనుమతించండి.", kn: "ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅಧಿಸೂಚನೆಗಳನ್ನು ಅನುಮತಿಸಿ.", ml: "ബ്രൗസർ ക്രമീകരണങ്ങളിൽ അറിയിപ്പുകൾ അനുവദിക്കുക.", hi: "कृपया ब्राउज़र सेटिंग्स में सूचनाओं की अनुमति दें।" }));
                    }
                  } else {
                    showToast(tr(language, { en: "Web push is ready on this device.", ta: "இந்த சாதனத்தில் வெப் புஷ் தயாராக உள்ளது.", te: "ఈ పరికరంలో వెబ్ పుష్ సిద్ధంగా ఉంది.", kn: "ಈ ಸಾಧನದಲ್ಲಿ ವೆಬ್ ಪುಶ್ ಸಿದ್ಧವಾಗಿದೆ.", ml: "ഈ ഉപകരണത്തിൽ വെബ് പുഷ് തയ്യാറാണ്.", hi: "इस डिवाइस पर वेब पुश तैयार है।" }));
                  }
                } catch {
                  showToast(tr(language, { en: "Notification settings updated.", ta: "அறிவிப்பு அமைப்புகள் புதுப்பிக்கப்பட்டன.", te: "నోటిఫికేషన్ సెట్టింగ్‌లు నవీకరించబడ్డాయి.", kn: "ಅಧಿಸೂಚನೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.", ml: "അറിയിപ്പ് ക്രമീകരണങ്ങൾ പുതുക്കി.", hi: "सूचना सेटिंग्स अपडेट हुईं।" }));
                }
              }}
              className="btn btn-primary"
            >
              🔔 {tr(language, { en: "Enable Lockscreen Alerts", ta: "பூட்டுத் திரை எச்சரிக்கைகளை இயக்கு", te: "లాక్‌స్క్రీన్ అలర్ట్‌లు ఆన్ చేయండి", kn: "ಲಾಕ್‌ಸ್ಕ್ರೀನ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ", ml: "ലോക്ക്സ്ക്രീൻ അലേർട്ടുകൾ ഓണാക്കുക", hi: "लॉकस्क्रीन अलर्ट चालू करें" })}
            </button>
          </div>

          {/* Real-Time Scheme Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SCHEME_ALERTS.map((alert, i) => (
              <div key={i} className="card" style={{ padding: 18, borderRadius: 14, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{alert.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: alert.color,
                      background: "var(--accent)",
                      padding: "2px 8px",
                      borderRadius: 99
                    }}>
                      {tr(language, alert.tag)}
                    </span>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>{tr(language, alert.date)}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                    {tr(language, alert.title)}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {tr(language, alert.desc)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. NEARBY HELP CENTERS VIEW ──────────────────── */}
      {activeView === "centers" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>📍 {L.cardCentersTitle}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {(() => {
                const place = location?.district ? `${location.district}, ${location.state}` : null;
                return tr(language, {
                  en: `Types of offices that help farmers with schemes. Use “Find near me” to locate the one serving ${place ?? "your district"}. Phone numbers are national toll-free helplines.`,
                  ta: `திட்டங்களில் விவசாயிகளுக்கு உதவும் அலுவலகங்கள். ${place ?? "உங்கள் மாவட்டம்"} பகுதிக்கான அலுவலகத்தைக் கண்டறிய “அருகில் கண்டுபிடி” பயன்படுத்தவும். தொலைபேசி எண்கள் தேசிய இலவச உதவி எண்கள்.`,
                  te: `పథకాల్లో రైతులకు సహాయం చేసే కార్యాలయాలు. ${place ?? "మీ జిల్లా"} కు చెందిన కార్యాలయాన్ని కనుగొనడానికి “దగ్గరలో కనుగొనండి” ఉపయోగించండి. ఫోన్ నంబర్లు జాతీయ టోల్-ఫ్రీ హెల్ప్‌లైన్‌లు.`,
                  kn: `ಯೋಜನೆಗಳಲ್ಲಿ ರೈತರಿಗೆ ಸಹಾಯ ಮಾಡುವ ಕಚೇರಿಗಳು. ${place ?? "ನಿಮ್ಮ ಜಿಲ್ಲೆ"} ಗೆ ಸೇರಿದ ಕಚೇರಿ ಹುಡುಕಲು “ಹತ್ತಿರದಲ್ಲಿ ಹುಡುಕಿ” ಬಳಸಿ. ಫೋನ್ ಸಂಖ್ಯೆಗಳು ರಾಷ್ಟ್ರೀಯ ಉಚಿತ ಸಹಾಯವಾಣಿಗಳು.`,
                  ml: `പദ്ധതികളിൽ കർഷകരെ സഹായിക്കുന്ന ഓഫീസുകൾ. ${place ?? "നിങ്ങളുടെ ജില്ല"} യിലെ ഓഫീസ് കണ്ടെത്താൻ “അടുത്തുള്ളത് കണ്ടെത്തുക” ഉപയോഗിക്കുക. ഫോൺ നമ്പറുകൾ ദേശീയ ടോൾ-ഫ്രീ ഹെൽപ്പ്‌ലൈനുകളാണ്.`,
                  hi: `योजनाओं में किसानों की मदद करने वाले कार्यालय। ${place ?? "आपके ज़िले"} का कार्यालय खोजने के लिए “पास में खोजें” का उपयोग करें। फ़ोन नंबर राष्ट्रीय टोल-फ्री हेल्पलाइन हैं।`,
                });
              })()}
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16
          }}>
            {HELP_CENTERS.map((center, idx) => (
              <div key={idx} className="card" style={{ padding: 20, borderRadius: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{center.icon}</span>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-dark)" }}>{tr(language, center.title)}</h3>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>{tr(language, center.category)}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{tr(language, { en: "Address:", ta: "முகவரி:", te: "చిరునామా:", kn: "ವಿಳಾಸ:", ml: "വിലാസം:", hi: "पता:" })}</div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>{tr(language, center.address)}</div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{tr(language, { en: "Services Provided:", ta: "வழங்கப்படும் சேவைகள்:", te: "అందించే సేవలు:", kn: "ಒದಗಿಸುವ ಸೇವೆಗಳು:", ml: "നൽകുന്ന സേവനങ്ങൾ:", hi: "उपलब्ध सेवाएं:" })}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text)" }}>{tr(language, center.services)}</div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{tr(language, { en: "Working Hours:", ta: "வேலை நேரம்:", te: "పని వేళలు:", kn: "ಕೆಲಸದ ಸಮಯ:", ml: "പ്രവൃത്തി സമയം:", hi: "कार्य समय:" })}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{tr(language, center.timings)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  {"phone" in center && center.phone && (
                    <a
                      href={`tel:${center.phone.replace(/[^0-9]/g, "")}`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      📞 {tr(language, { en: "Call", ta: "அழை", te: "కాల్", kn: "ಕರೆ", ml: "വിളിക്കുക", hi: "कॉल करें" })} {center.phone}
                    </a>
                  )}
                  {"mapQuery" in center && center.mapQuery && (
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(`${center.mapQuery} near ${location?.district || ""} ${location?.state || "India"}`.replace(/\s+/g, " "))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      🗺️ {tr(language, { en: "Find near me", ta: "அருகில் கண்டுபிடி", te: "దగ్గరలో కనుగొనండి", kn: "ಹತ್ತಿರದಲ್ಲಿ ಹುಡುಕಿ", ml: "അടുത്തുള്ളത് കണ്ടെത്തുക", hi: "पास में खोजें" })}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. CHECK ELIGIBILITY INTERACTIVE TOOL ────────── */}
      {activeView === "eligibility" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>🎯 {L.cardEligibilityTitle}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {tr(language, { en: "Answer 6 basic questions to instantly find government schemes and subsidies matching your profile.", ta: "உங்களுக்கு ஏற்ற அரசு திட்டங்கள் மற்றும் மானியங்களை உடனே கண்டறிய 6 எளிய கேள்விகளுக்குப் பதிலளிக்கவும்.", te: "మీకు సరిపోయే ప్రభుత్వ పథకాలు మరియు సబ్సిడీలను వెంటనే తెలుసుకోవడానికి 6 సులభమైన ప్రశ్నలకు జవాబు ఇవ్వండి.", kn: "ನಿಮಗೆ ಹೊಂದುವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳನ್ನು ತಕ್ಷಣ ತಿಳಿಯಲು 6 ಸರಳ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.", ml: "നിങ്ങൾക്ക് യോജിച്ച സർക്കാർ പദ്ധതികളും സബ്സിഡികളും ഉടൻ കണ്ടെത്താൻ 6 ലളിതമായ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക.", hi: "अपने लिए सही सरकारी योजनाएं और सब्सिडी तुरंत जानने के लिए 6 आसान सवालों के जवाब दें।" })}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {/* Form Card */}
            <div className="card" style={{ padding: 22, borderRadius: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                📋 {tr(language, { en: "Farmer Profile Questionnaire", ta: "விவசாயி விவரக் கேள்வித்தாள்", te: "రైతు వివరాల ప్రశ్నావళి", kn: "ರೈತರ ವಿವರ ಪ್ರಶ್ನಾವಳಿ", ml: "കർഷക വിവര ചോദ്യാവലി", hi: "किसान प्रोफ़ाइल प्रश्नावली" })}
              </div>

              {/* Q1 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {tr(language, { en: "1. Total Cultivable Land Size:", ta: "1. மொத்த சாகுபடி நிலப் பரப்பு:", te: "1. మొత్తం సాగు భూమి విస్తీర్ణం:", kn: "1. ಒಟ್ಟು ಕೃಷಿ ಭೂಮಿ ವಿಸ್ತೀರ್ಣ:", ml: "1. ആകെ കൃഷിയോഗ്യമായ ഭൂമി:", hi: "1. कुल खेती योग्य ज़मीन:" })}
                </label>
                <select value={landSize} onChange={e => setLandSize(e.target.value)} className="input">
                  <option value="marginal">{tr(language, { en: "Marginal Farmer (Under 1 Hectare / 2.5 Acres)", ta: "குறு விவசாயி (1 ஹெக்டேர் / 2.5 ஏக்கருக்குக் கீழ்)", te: "సన్నకారు రైతు (1 హెక్టారు / 2.5 ఎకరాల లోపు)", kn: "ಅತಿ ಸಣ್ಣ ರೈತ (1 ಹೆಕ್ಟೇರ್ / 2.5 ಎಕರೆಗಿಂತ ಕಡಿಮೆ)", ml: "നാമമാത്ര കർഷകൻ (1 ഹെക്ടർ / 2.5 ഏക്കറിൽ താഴെ)", hi: "सीमांत किसान (1 हेक्टेयर / 2.5 एकड़ से कम)" })}</option>
                  <option value="small">{tr(language, { en: "Small Farmer (1 to 2 Hectares / 2.5 to 5 Acres)", ta: "சிறு விவசாயி (1 முதல் 2 ஹெக்டேர் / 2.5 முதல் 5 ஏக்கர்)", te: "చిన్న రైతు (1 నుండి 2 హెక్టార్లు / 2.5 నుండి 5 ఎకరాలు)", kn: "ಸಣ್ಣ ರೈತ (1 ರಿಂದ 2 ಹೆಕ್ಟೇರ್ / 2.5 ರಿಂದ 5 ಎಕರೆ)", ml: "ചെറുകിട കർഷകൻ (1 മുതൽ 2 ഹെക്ടർ / 2.5 മുതൽ 5 ഏക്കർ)", hi: "लघु किसान (1 से 2 हेक्टेयर / 2.5 से 5 एकड़)" })}</option>
                  <option value="medium">{tr(language, { en: "Medium Farmer (2 to 5 Hectares)", ta: "நடுத்தர விவசாயி (2 முதல் 5 ஹெக்டேர்)", te: "మధ్యస్థ రైతు (2 నుండి 5 హెక్టార్లు)", kn: "ಮಧ್ಯಮ ರೈತ (2 ರಿಂದ 5 ಹೆಕ್ಟೇರ್)", ml: "ഇടത്തരം കർഷകൻ (2 മുതൽ 5 ഹെക്ടർ)", hi: "मध्यम किसान (2 से 5 हेक्टेयर)" })}</option>
                  <option value="large">{tr(language, { en: "Large Farmer (Above 5 Hectares)", ta: "பெரிய விவசாயி (5 ஹெக்டேருக்கு மேல்)", te: "పెద్ద రైతు (5 హెక్టార్లకు పైగా)", kn: "ದೊಡ್ಡ ರೈತ (5 ಹೆಕ್ಟೇರ್‌ಗಿಂತ ಹೆಚ್ಚು)", ml: "വലിയ കർഷകൻ (5 ഹെക്ടറിന് മുകളിൽ)", hi: "बड़े किसान (5 हेक्टेयर से अधिक)" })}</option>
                </select>
              </div>

              {/* Q2 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {tr(language, { en: "2. Land Ownership / Cultivation Status:", ta: "2. நில உரிமை / சாகுபடி நிலை:", te: "2. భూమి యాజమాన్యం / సాగు స్థితి:", kn: "2. ಭೂ ಮಾಲೀಕತ್ವ / ಕೃಷಿ ಸ್ಥಿತಿ:", ml: "2. ഭൂവുടമസ്ഥത / കൃഷി സ്ഥിതി:", hi: "2. ज़मीन का मालिकाना / खेती की स्थिति:" })}
                </label>
                <select value={farmerType} onChange={e => setFarmerType(e.target.value)} className="input">
                  <option value="owner">{tr(language, { en: "Landowner (Have Patta / Title Deed)", ta: "நில உரிமையாளர் (பட்டா / உரிமைப் பத்திரம் உள்ளது)", te: "భూ యజమాని (పట్టా / హక్కు పత్రం ఉంది)", kn: "ಭೂ ಮಾಲೀಕ (ಪಟ್ಟಾ / ಹಕ್ಕು ಪತ್ರ ಇದೆ)", ml: "ഭൂവുടമ (പട്ടയം / ആധാരം ഉണ്ട്)", hi: "भूमि मालिक (पट्टा / स्वामित्व दस्तावेज़ है)" })}</option>
                  <option value="tenant">{tr(language, { en: "Tenant Farmer / Lessee (Lease Deed available)", ta: "குத்தகை விவசாயி (குத்தகை ஒப்பந்தம் உள்ளது)", te: "కౌలు రైతు (కౌలు ఒప్పందం ఉంది)", kn: "ಗುತ್ತಿಗೆ ರೈತ (ಗುತ್ತಿಗೆ ಪತ್ರ ಇದೆ)", ml: "പാട്ടക്കർഷകൻ (പാട്ടക്കരാർ ഉണ്ട്)", hi: "किरायेदार किसान (पट्टा अनुबंध है)" })}</option>
                  <option value="sharecropper">{tr(language, { en: "Sharecropper / Informal Cultivator", ta: "பங்கு விவசாயி / முறைசாரா சாகுபடியாளர்", te: "వాటా రైతు / అనధికారిక సాగుదారు", kn: "ಪಾಲು ಬೆಳೆಗಾರ / ಅನೌಪಚಾರಿಕ ಕೃಷಿಕ", ml: "പങ്കുകൃഷിക്കാരൻ / അനൗപചാരിക കർഷകൻ", hi: "बटाईदार / अनौपचारिक किसान" })}</option>
                  <option value="shg">{tr(language, { en: "Member of SHG / FPO (Farmer Producer Org)", ta: "SHG / FPO (விவசாயி உற்பத்தியாளர் அமைப்பு) உறுப்பினர்", te: "SHG / FPO (రైతు ఉత్పత్తిదారుల సంస్థ) సభ్యుడు", kn: "SHG / FPO (ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆ) ಸದಸ್ಯ", ml: "SHG / FPO (കർഷക ഉത്പാദക സംഘടന) അംഗം", hi: "SHG / FPO (किसान उत्पादक संगठन) सदस्य" })}</option>
                </select>
              </div>

              {/* Q3 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {tr(language, { en: "3. Household Income Tax Status:", ta: "3. குடும்ப வருமான வரி நிலை:", te: "3. కుటుంబ ఆదాయపు పన్ను స్థితి:", kn: "3. ಕುಟುಂಬದ ಆದಾಯ ತೆರಿಗೆ ಸ್ಥಿತಿ:", ml: "3. കുടുംബ ആദായനികുതി സ്ഥിതി:", hi: "3. परिवार की आयकर स्थिति:" })}
                </label>
                <select value={isTaxPayer} onChange={e => setIsTaxPayer(e.target.value)} className="input">
                  <option value="no">{tr(language, { en: "No, we do not pay income tax", ta: "இல்லை, நாங்கள் வருமான வரி செலுத்துவதில்லை", te: "లేదు, మేము ఆదాయపు పన్ను కట్టము", kn: "ಇಲ್ಲ, ನಾವು ಆದಾಯ ತೆರಿಗೆ ಕಟ್ಟುವುದಿಲ್ಲ", ml: "ഇല്ല, ഞങ്ങൾ ആദായനികുതി അടയ്ക്കുന്നില്ല", hi: "नहीं, हम आयकर नहीं भरते" })}</option>
                  <option value="yes">{tr(language, { en: "Yes, a family member pays income tax", ta: "ஆம், குடும்ப உறுப்பினர் ஒருவர் வருமான வரி செலுத்துகிறார்", te: "అవును, కుటుంబ సభ్యుడు ఆదాయపు పన్ను కడతారు", kn: "ಹೌದು, ಕುಟುಂಬದ ಸದಸ್ಯರೊಬ್ಬರು ಆದಾಯ ತೆರಿಗೆ ಕಟ್ಟುತ್ತಾರೆ", ml: "അതെ, ഒരു കുടുംബാംഗം ആദായനികുതി അടയ്ക്കുന്നു", hi: "हां, परिवार का एक सदस्य आयकर भरता है" })}</option>
                </select>
              </div>

              {/* Q4 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {tr(language, { en: "4. Primary Cultivation Crop:", ta: "4. முதன்மை சாகுபடி பயிர்:", te: "4. ప్రధాన సాగు పంట:", kn: "4. ಮುಖ್ಯ ಬೆಳೆ:", ml: "4. പ്രധാന കൃഷി വിള:", hi: "4. मुख्य फसल:" })}
                </label>
                <select value={cropType} onChange={e => setCropType(e.target.value)} className="input">
                  <option value="food">{tr(language, { en: "Food Grains & Pulses (Paddy, Wheat, Millets, etc.)", ta: "உணவு தானியங்கள் & பருப்பு வகைகள் (நெல், கோதுமை, சிறுதானியங்கள் போன்றவை)", te: "ఆహార ధాన్యాలు & పప్పుధాన్యాలు (వరి, గోధుమ, చిరుధాన్యాలు మొదలైనవి)", kn: "ಆಹಾರ ಧಾನ್ಯಗಳು & ಬೇಳೆಕಾಳುಗಳು (ಭತ್ತ, ಗೋಧಿ, ಸಿರಿಧಾನ್ಯ ಇತ್ಯಾದಿ)", ml: "ഭക്ഷ്യധാന്യങ്ങളും പയർവർഗങ്ങളും (നെല്ല്, ഗോതമ്പ്, ചെറുധാന്യങ്ങൾ മുതലായവ)", hi: "अनाज और दालें (धान, गेहूं, मोटे अनाज आदि)" })}</option>
                  <option value="horticulture">{tr(language, { en: "Horticulture (Fruits, Vegetables, Flowers, Spices)", ta: "தோட்டக்கலை (பழங்கள், காய்கறிகள், பூக்கள், மசாலா)", te: "ఉద్యాన పంటలు (పండ్లు, కూరగాయలు, పూలు, సుగంధ ద్రవ్యాలు)", kn: "ತೋಟಗಾರಿಕೆ (ಹಣ್ಣುಗಳು, ತರಕಾರಿಗಳು, ಹೂವುಗಳು, ಮಸಾಲೆಗಳು)", ml: "ഉദ്യാനകൃഷി (പഴങ്ങൾ, പച്ചക്കറികൾ, പൂക്കൾ, സുഗന്ധവ്യഞ്ജനങ്ങൾ)", hi: "बागवानी (फल, सब्जियां, फूल, मसाले)" })}</option>
                  <option value="commercial">{tr(language, { en: "Commercial Crops (Sugarcane, Cotton, Oilseeds)", ta: "வணிகப் பயிர்கள் (கரும்பு, பருத்தி, எண்ணெய் வித்துக்கள்)", te: "వాణిజ్య పంటలు (చెరకు, పత్తి, నూనె గింజలు)", kn: "ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು (ಕಬ್ಬು, ಹತ್ತಿ, ಎಣ್ಣೆಕಾಳುಗಳು)", ml: "നാണ്യവിളകൾ (കരിമ്പ്, പരുത്തി, എണ്ണക്കുരുക്കൾ)", hi: "नकदी फसलें (गन्ना, कपास, तिलहन)" })}</option>
                </select>
              </div>

              {/* Q5 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {tr(language, { en: "5. Irrigation Source:", ta: "5. பாசன ஆதாரம்:", te: "5. నీటిపారుదల వనరు:", kn: "5. ನೀರಾವರಿ ಮೂಲ:", ml: "5. ജലസേചന സ്രോതസ്സ്:", hi: "5. सिंचाई का स्रोत:" })}
                </label>
                <select value={irrigationFacility} onChange={e => setIrrigationFacility(e.target.value)} className="input">
                  <option value="borewell">{tr(language, { en: "Borewell / Open Well / Canal Available", ta: "ஆழ்துளைக் கிணறு / திறந்த கிணறு / கால்வாய் உள்ளது", te: "బోరుబావి / బావి / కాలువ అందుబాటులో ఉంది", kn: "ಕೊಳವೆಬಾವಿ / ಬಾವಿ / ಕಾಲುವೆ ಲಭ್ಯವಿದೆ", ml: "കുഴൽക്കിണർ / കിണർ / കനാൽ ലഭ്യമാണ്", hi: "बोरवेल / कुआं / नहर उपलब्ध है" })}</option>
                  <option value="rainfed">{tr(language, { en: "Rainfed (Dryland / Dependent on Monsoons)", ta: "மானாவாரி (வறண்ட நிலம் / பருவமழையைச் சார்ந்தது)", te: "వర్షాధారం (మెట్ట భూమి / రుతుపవనాలపై ఆధారం)", kn: "ಮಳೆಯಾಶ್ರಿತ (ಒಣಭೂಮಿ / ಮುಂಗಾರು ಅವಲಂಬಿತ)", ml: "മഴയെ ആശ്രയിച്ച് (വരണ്ട ഭൂമി / മൺസൂണിനെ ആശ്രയിക്കുന്നു)", hi: "वर्षा आधारित (सूखी ज़मीन / मानसून पर निर्भर)" })}</option>
                </select>
              </div>

              {/* Q6 */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {tr(language, { en: "6. Aadhaar Linked to Bank Account:", ta: "6. வங்கிக் கணக்குடன் ஆதார் இணைப்பு:", te: "6. బ్యాంక్ ఖాతాకు ఆధార్ లింక్:", kn: "6. ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಜೋಡಣೆ:", ml: "6. ബാങ്ക് അക്കൗണ്ടുമായി ആധാർ ബന്ധിപ്പിച്ചത്:", hi: "6. बैंक खाते से आधार लिंक:" })}
                </label>
                <select value={aadhaarLinked} onChange={e => setAadhaarLinked(e.target.value)} className="input">
                  <option value="yes">{tr(language, { en: "Yes, Aadhaar is linked to Bank Account (DBT active)", ta: "ஆம், ஆதார் வங்கிக் கணக்குடன் இணைக்கப்பட்டுள்ளது (DBT செயலில்)", te: "అవును, ఆధార్ బ్యాంక్ ఖాతాకు లింక్ అయింది (DBT యాక్టివ్)", kn: "ಹೌದು, ಆಧಾರ್ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜೋಡಣೆಯಾಗಿದೆ (DBT ಸಕ್ರಿಯ)", ml: "അതെ, ആധാർ ബാങ്ക് അക്കൗണ്ടുമായി ബന്ധിപ്പിച്ചിട്ടുണ്ട് (DBT സജീവം)", hi: "हां, आधार बैंक खाते से जुड़ा है (DBT चालू)" })}</option>
                  <option value="no">{tr(language, { en: "Not yet linked / Need e-KYC assistance", ta: "இன்னும் இணைக்கப்படவில்லை / e-KYC உதவி தேவை", te: "ఇంకా లింక్ కాలేదు / e-KYC సహాయం కావాలి", kn: "ಇನ್ನೂ ಜೋಡಣೆಯಾಗಿಲ್ಲ / e-KYC ಸಹಾಯ ಬೇಕು", ml: "ഇതുവരെ ബന്ധിപ്പിച്ചിട്ടില്ല / e-KYC സഹായം വേണം", hi: "अभी लिंक नहीं / e-KYC सहायता चाहिए" })}</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setEligibilityChecked(true);
                  showToast(tr(language, { en: "Eligibility calculated!", ta: "தகுதி கணக்கிடப்பட்டது!", te: "అర్హత లెక్కించబడింది!", kn: "ಅರ್ಹತೆ ಲೆಕ್ಕ ಹಾಕಲಾಗಿದೆ!", ml: "യോഗ്യത കണക്കാക്കി!", hi: "पात्रता की गणना हो गई!" }));
                }}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                🔍 {tr(language, { en: "Verify My Eligibility Now", ta: "என் தகுதியை இப்போது சரிபார்", te: "నా అర్హతను ఇప్పుడే తనిఖీ చేయండి", kn: "ನನ್ನ ಅರ್ಹತೆಯನ್ನು ಈಗ ಪರಿಶೀಲಿಸಿ", ml: "എന്റെ യോഗ്യത ഇപ്പോൾ പരിശോധിക്കുക", hi: "मेरी पात्रता अभी जांचें" })}
              </button>
            </div>

            {/* Results Card */}
            <div className="card" style={{ padding: 22, borderRadius: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  🎯 {tr(language, { en: "Matching Schemes & Grants", ta: "பொருந்தும் திட்டங்கள் & மானியங்கள்", te: "సరిపోయే పథకాలు & గ్రాంట్లు", kn: "ಹೊಂದುವ ಯೋಜನೆಗಳು & ಅನುದಾನಗಳು", ml: "യോജിക്കുന്ന പദ്ധതികളും ഗ്രാന്റുകളും", hi: "मेल खाने वाली योजनाएं और अनुदान" })}
                </div>

                {!eligibilityChecked ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 10px" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🌾</div>
                    <p style={{ fontSize: 13.5 }}>
                      {tr(language, { en: "Complete the questionnaire and click “Verify My Eligibility Now” to view the schemes you qualify for.", ta: "கேள்வித்தாளை நிரப்பி “என் தகுதியை இப்போது சரிபார்” என்பதைக் கிளிக் செய்து, நீங்கள் தகுதிபெறும் திட்டங்களைப் பாருங்கள்.", te: "ప్రశ్నావళి పూర్తి చేసి “నా అర్హతను ఇప్పుడే తనిఖీ చేయండి” క్లిక్ చేయండి, మీకు అర్హత ఉన్న పథకాలు చూడండి.", kn: "ಪ್ರಶ್ನಾವಳಿ ಪೂರ್ಣಗೊಳಿಸಿ “ನನ್ನ ಅರ್ಹತೆಯನ್ನು ಈಗ ಪರಿಶೀಲಿಸಿ” ಕ್ಲಿಕ್ ಮಾಡಿ, ನೀವು ಅರ್ಹರಾದ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ.", ml: "ചോദ്യാവലി പൂർത്തിയാക്കി “എന്റെ യോഗ്യത ഇപ്പോൾ പരിശോധിക്കുക” ക്ലിക്ക് ചെയ്ത് നിങ്ങൾക്ക് യോഗ്യതയുള്ള പദ്ധതികൾ കാണുക.", hi: "प्रश्नावली पूरी करें और “मेरी पात्रता अभी जांचें” पर क्लिक करके अपनी योग्य योजनाएं देखें।" })}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      background: "var(--accent)",
                      padding: "10px 14px",
                      borderRadius: 10,
                      marginBottom: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--primary-dark)"
                    }}>
                      ✅ {tr(language, {
                        en: `You qualify for ${eligibleSchemes.length} Recommended Schemes!`,
                        ta: `நீங்கள் ${eligibleSchemes.length} பரிந்துரைக்கப்பட்ட திட்டங்களுக்குத் தகுதியானவர்!`,
                        te: `మీరు ${eligibleSchemes.length} సిఫార్సు చేసిన పథకాలకు అర్హులు!`,
                        kn: `ನೀವು ${eligibleSchemes.length} ಶಿಫಾರಸು ಮಾಡಿದ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಹರು!`,
                        ml: `നിങ്ങൾ ${eligibleSchemes.length} ശുപാർശ ചെയ്ത പദ്ധതികൾക്ക് യോഗ്യരാണ്!`,
                        hi: `आप ${eligibleSchemes.length} सुझाई गई योजनाओं के लिए पात्र हैं!`,
                      })}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {eligibleSchemes.map(s => (
                        <div
                          key={s.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--bg)",
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid var(--border)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 20 }}>{s.icon}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{getLocalizedScheme(s, language).title}</div>
                              <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{getCategoryLabel(s.category, language)} • {getStateLabel(s.coverage, language)}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveDetailScheme(s)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11.5, padding: "4px 10px" }}
                          >
                            {tr(language, { en: "Details", ta: "விவரங்கள்", te: "వివరాలు", kn: "ವಿವರಗಳು", ml: "വിശദാംശങ്ങൾ", hi: "विवरण" })}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 11.5, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 16 }}>
                *{tr(language, { en: "Official verification is subject to document scrutiny by your local block agriculture or revenue officer.", ta: "அதிகாரப்பூர்வ சரிபார்ப்பு உங்கள் வட்டார வேளாண் அல்லது வருவாய் அலுவலரின் ஆவணப் பரிசீலனைக்கு உட்பட்டது.", te: "అధికారిక ధృవీకరణ మీ మండల వ్యవసాయ లేదా రెవెన్యూ అధికారి పత్రాల పరిశీలనపై ఆధారపడి ఉంటుంది.", kn: "ಅಧಿಕೃತ ಪರಿಶೀಲನೆ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಬ್ಲಾಕ್ ಕೃಷಿ ಅಥವಾ ಕಂದಾಯ ಅಧಿಕಾರಿಯ ದಾಖಲೆ ಪರಿಶೀಲನೆಗೆ ಒಳಪಟ್ಟಿದೆ.", ml: "ഔദ്യോഗിക സ്ഥിരീകരണം നിങ്ങളുടെ ബ്ലോക്ക് കൃഷി അല്ലെങ്കിൽ റവന്യൂ ഉദ്യോഗസ്ഥന്റെ രേഖാ പരിശോധനയ്ക്ക് വിധേയമാണ്.", hi: "आधिकारिक सत्यापन आपके स्थानीय ब्लॉक कृषि या राजस्व अधिकारी द्वारा दस्तावेज़ जांच पर निर्भर है।" })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MY APPLICATIONS TRACKER VIEW ──────────────── */}
      {activeView === "applications" && (
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>📋 {L.cardApplicationsTitle}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {tr(language, { en: "Keep track of your submitted subsidy, loan, and insurance applications in one secure place.", ta: "நீங்கள் சமர்ப்பித்த மானியம், கடன் மற்றும் காப்பீட்டு விண்ணப்பங்களை ஒரே பாதுகாப்பான இடத்தில் கண்காணியுங்கள்.", te: "మీరు సమర్పించిన సబ్సిడీ, రుణ మరియు బీమా దరఖాస్తులను ఒకే సురక్షిత చోట ట్రాక్ చేయండి.", kn: "ನೀವು ಸಲ್ಲಿಸಿದ ಸಬ್ಸಿಡಿ, ಸಾಲ ಮತ್ತು ವಿಮೆ ಅರ್ಜಿಗಳನ್ನು ಒಂದೇ ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.", ml: "നിങ്ങൾ സമർപ്പിച്ച സബ്സിഡി, വായ്പ, ഇൻഷുറൻസ് അപേക്ഷകൾ ഒരു സുരക്ഷിത സ്ഥലത്ത് ട്രാക്ക് ചെയ്യുക.", hi: "अपने जमा किए गए सब्सिडी, ऋण और बीमा आवेदनों को एक सुरक्षित जगह ट्रैक करें।" })}
            </p>
          </div>

          {/* Add New Application Box */}
          <form
            onSubmit={handleAddApplication}
            className="card"
            style={{ padding: 18, borderRadius: 16, marginBottom: 22 }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--primary-dark)" }}>
              + {tr(language, { en: "Add an Application to Track", ta: "கண்காணிக்க ஒரு விண்ணப்பத்தைச் சேர்", te: "ట్రాక్ చేయడానికి దరఖాస్తు జోడించండి", kn: "ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಅರ್ಜಿ ಸೇರಿಸಿ", ml: "ട്രാക്ക് ചെയ്യാൻ ഒരു അപേക്ഷ ചേർക്കുക", hi: "ट्रैक करने के लिए आवेदन जोड़ें" })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 12 }}>
              <input
                type="text"
                placeholder={tr(language, { en: "Scheme Name (e.g. PM-KISAN, SMAM)", ta: "திட்டத்தின் பெயர் (எ.கா. PM-KISAN, SMAM)", te: "పథకం పేరు (ఉదా. PM-KISAN, SMAM)", kn: "ಯೋಜನೆಯ ಹೆಸರು (ಉದಾ. PM-KISAN, SMAM)", ml: "പദ്ധതിയുടെ പേര് (ഉദാ. PM-KISAN, SMAM)", hi: "योजना का नाम (जैसे PM-KISAN, SMAM)" })}
                value={newAppScheme}
                onChange={e => setNewAppScheme(e.target.value)}
                className="input"
                required
              />
              <input
                type="text"
                placeholder={tr(language, { en: "Acknowledgement / Ref No (e.g. PMK-98124)", ta: "ஒப்புகை / குறிப்பு எண் (எ.கா. PMK-98124)", te: "రసీదు / రిఫరెన్స్ నం. (ఉదా. PMK-98124)", kn: "ಸ್ವೀಕೃತಿ / ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ (ಉದಾ. PMK-98124)", ml: "രസീത് / റഫറൻസ് നമ്പർ (ഉദാ. PMK-98124)", hi: "पावती / संदर्भ संख्या (जैसे PMK-98124)" })}
                value={newAppRef}
                onChange={e => setNewAppRef(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              {tr(language, { en: "Save Application Tracking", ta: "விண்ணப்பக் கண்காணிப்பைச் சேமி", te: "దరఖాస్తు ట్రాకింగ్ సేవ్ చేయండి", kn: "ಅರ್ಜಿ ಟ್ರ್ಯಾಕಿಂಗ್ ಉಳಿಸಿ", ml: "അപേക്ഷ ട്രാക്കിംഗ് സേവ് ചെയ്യുക", hi: "आवेदन ट्रैकिंग सहेजें" })}
            </button>
          </form>

          {/* Application Records List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applications.map((app) => (
              <div
                key={app.id}
                className="card"
                style={{
                  padding: 18,
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                    {app.schemeTitle}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span>{tr(language, { en: "Ref", ta: "குறிப்பு", te: "రిఫ.", kn: "ಉಲ್ಲೇಖ", ml: "റഫ.", hi: "संदर्भ" })}: <strong>{app.refNumber}</strong></span>
                    <span>{tr(language, { en: "Applied", ta: "விண்ணப்பித்தது", te: "దరఖాస్తు తేదీ", kn: "ಅರ್ಜಿ ದಿನಾಂಕ", ml: "അപേക്ഷിച്ചത്", hi: "आवेदन तिथि" })}: {app.date}</span>
                    <span>{tr(language, { en: "Note", ta: "குறிப்பு", te: "గమనిక", kn: "ಸೂಚನೆ", ml: "കുറിപ്പ്", hi: "नोट" })}: {app.benefitExpected}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: app.status === "Approved & Disbursed" ? "#DCFCE7" : app.status === "Under Review" ? "#DBEAFE" : "#FEF3C7",
                    color: app.status === "Approved & Disbursed" ? "#15803D" : app.status === "Under Review" ? "#1E40AF" : "#B45309"
                  }}>
                    {tr(language, STATUS_LABELS[app.status] ?? STATUS_LABELS["Document Verification Pending"])}
                  </span>

                  <button
                    onClick={() => {
                      const filtered = applications.filter(a => a.id !== app.id);
                      setApplications(filtered);
                      localStorage.setItem("agri_user_applications", JSON.stringify(filtered));
                      showToast(tr(language, { en: "Removed application entry.", ta: "விண்ணப்பப் பதிவு நீக்கப்பட்டது.", te: "దరఖాస్తు నమోదు తొలగించబడింది.", kn: "ಅರ್ಜಿ ನಮೂದನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.", ml: "അപേക്ഷാ എൻട്രി നീക്കി.", hi: "आवेदन प्रविष्टि हटाई गई।" }));
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14 }}
                    title={tr(language, { en: "Delete entry", ta: "பதிவை நீக்கு", te: "నమోదు తొలగించండి", kn: "ನಮೂದು ಅಳಿಸಿ", ml: "എൻട്രി ഇല്ലാതാക്കുക", hi: "प्रविष्टि हटाएं" })}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 8. CALCULATORS VIEW ──────────────────────────── */}
      {activeView === "calculators" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          {/* PMFBY Calculator */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22, borderRadius: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                🛡️ {L.pmfbyHeader}
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.pmfbySelectCrop}
                </label>
                <select value={cropCat} onChange={e => setCropCat(e.target.value)} className="input">
                  <option value="kharif_food">{tr(language, { en: "Kharif Crops (Food & Oilseeds) - 2% Premium", ta: "காரீஃப் பயிர்கள் (உணவு & எண்ணெய் வித்துக்கள்) - 2% பிரீமியம்", te: "ఖరీఫ్ పంటలు (ఆహార & నూనె గింజలు) - 2% ప్రీమియం", kn: "ಖಾರಿಫ್ ಬೆಳೆಗಳು (ಆಹಾರ & ಎಣ್ಣೆಕಾಳು) - 2% ಪ್ರೀಮಿಯಂ", ml: "ഖാരിഫ് വിളകൾ (ഭക്ഷ്യ & എണ്ണക്കുരു) - 2% പ്രീമിയം", hi: "खरीफ फसलें (खाद्य और तिलहन) - 2% प्रीमियम" })}</option>
                  <option value="rabi_food">{tr(language, { en: "Rabi Crops (Food & Oilseeds) - 1.5% Premium", ta: "ரபி பயிர்கள் (உணவு & எண்ணெய் வித்துக்கள்) - 1.5% பிரீமியம்", te: "రబీ పంటలు (ఆహార & నూనె గింజలు) - 1.5% ప్రీమియం", kn: "ರಬಿ ಬೆಳೆಗಳು (ಆಹಾರ & ಎಣ್ಣೆಕಾಳು) - 1.5% ಪ್ರೀಮಿಯಂ", ml: "റാബി വിളകൾ (ഭക്ഷ്യ & എണ്ണക്കുരു) - 1.5% പ്രീമിയം", hi: "रबी फसलें (खाद्य और तिलहन) - 1.5% प्रीमियम" })}</option>
                  <option value="commercial">{tr(language, { en: "Commercial / Horticulture - 5% Premium", ta: "வணிக / தோட்டக்கலை - 5% பிரீமியம்", te: "వాణిజ్య / ఉద్యాన - 5% ప్రీమియం", kn: "ವಾಣಿಜ್ಯ / ತೋಟಗಾರಿಕೆ - 5% ಪ್ರೀಮಿಯಂ", ml: "വാണിജ്യ / ഉദ്യാനകൃഷി - 5% പ്രീമിയം", hi: "व्यावसायिक / बागवानी - 5% प्रीमियम" })}</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.pmfbyArea}
                </label>
                <input type="number" step="0.1" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)} className="input" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.pmfbySumInsured}
                </label>
                <input type="number" step="5000" value={sumInsured} onChange={e => setSumInsured(parseFloat(e.target.value) || 0)} className="input" />
              </div>
            </div>

            {pmfbyResults && (
              <div style={{ background: "var(--bg)", padding: 14, borderRadius: 12, border: "1px solid var(--border)", marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span>{L.pmfbyResultTotalIns}</span>
                  <span style={{ fontWeight: 700 }}>{currencyFormatter.format(pmfbyResults.totalSum)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "#15803D" }}>
                  <span>{L.pmfbyResultFarmerPrem}</span>
                  <span style={{ fontWeight: 700 }}>{currencyFormatter.format(pmfbyResults.farmerPremium)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "var(--primary-dark)" }}>
                  <span>{L.pmfbyResultGovSub}</span>
                  <span style={{ fontWeight: 700 }}>{currencyFormatter.format(pmfbyResults.govSubsidy)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", paddingTop: 6, fontSize: 13, color: "var(--text-muted)" }}>
                  <span>{L.pmfbyResultTotalPrem}</span>
                  <span>{currencyFormatter.format(pmfbyResults.totalActuarialPremium)}</span>
                </div>
              </div>
            )}
          </div>

          {/* KCC Calculator */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22, borderRadius: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                💳 {L.kccHeader}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.kccAmount}
                </label>
                <input type="number" step="10000" value={loanAmount} onChange={e => setLoanAmount(parseFloat(e.target.value) || 0)} className="input" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.kccPeriod}
                </label>
                <input type="number" value={loanPeriod} onChange={e => setLoanPeriod(parseInt(e.target.value) || 0)} className="input" />
              </div>
            </div>

            {kccResults && (
              <div style={{ background: "var(--bg)", padding: 14, borderRadius: 12, border: "1px solid var(--border)", marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span>{L.kccInterestStandard}</span>
                  <span style={{ color: "#B91C1C", fontWeight: 600 }}>{currencyFormatter.format(kccResults.standardInterest)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span>{L.kccInterestPrompt}</span>
                  <span style={{ color: "#15803D", fontWeight: 700 }}>{currencyFormatter.format(kccResults.promptInterest)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", paddingTop: 6, marginBottom: 6, fontSize: 13, color: "#15803D", fontWeight: 700 }}>
                  <span>{L.kccTotalSavings}</span>
                  <span>{currencyFormatter.format(kccResults.savings)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 6, fontSize: 13.5, fontWeight: 800, color: "var(--primary-dark)" }}>
                  <span>{L.kccRepaymentTotal}</span>
                  <span>{currencyFormatter.format(kccResults.totalRepay)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 9. SCHEME DETAIL MODAL ───────────────────────── */}
      {activeDetailScheme && (() => {
        const detailScheme = getLocalizedScheme(activeDetailScheme, language);
        return (
          <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16
        }}>
          <div
            className="card"
            style={{
              maxWidth: 680,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 20,
              boxShadow: "0 25px 40px -10px rgba(0,0,0,0.3)"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 32 }}>{detailScheme.icon}</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--primary-dark)", lineHeight: 1.3 }}>
                    {detailScheme.title}
                  </h3>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, background: "var(--accent)", color: "var(--primary-dark)", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                      {getCategoryLabel(detailScheme.category, language)}
                    </span>
                    <span style={{ fontSize: 11, background: "var(--bg)", color: "var(--text-muted)", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                      📍 {getStateLabel(detailScheme.coverage, language)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveDetailScheme(null)}
                aria-label={L.close}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            {/* Modal Description */}
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
              {detailScheme.description}
            </p>

            {/* Key Benefit Highlight */}
            <div style={{
              background: "var(--bg)",
              borderLeft: "4px solid var(--primary)",
              padding: "12px 14px",
              borderRadius: "0 10px 10px 0",
              marginBottom: 18
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 4 }}>
                💰 {L.keyBenefit}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                {detailScheme.benefit}
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 8 }}>
                🎯 {L.eligibilityTitle}
              </div>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {detailScheme.eligibility.map((crit, idx) => (
                  <li key={idx} style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.45 }}>
                    {crit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents Checklist with interactive checkboxes */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 8 }}>
                📋 {L.documentsChecklist} ({detailScheme.documentsList.length} {L.requiredLabel})
              </div>
              <div style={{
                background: "var(--bg)",
                padding: 12,
                borderRadius: 12,
                border: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 8
              }}>
                {detailScheme.documentsList.map((doc, idx) => (
                  <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text)", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary)" }} />
                    <span>{doc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* How to Apply Guide */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 6 }}>
                📝 {L.howToApply}
              </div>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, background: "var(--accent)", padding: 12, borderRadius: 10 }}>
                {detailScheme.howToApply}
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={detailScheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                🔗 {L.visitOfficialPortal || "Visit Official Government Portal"} ↗
              </a>
              <button
                onClick={() => toggleSaveScheme(activeDetailScheme.id)}
                className="btn btn-secondary"
              >
                {savedSchemeIds.includes(activeDetailScheme.id) ? `⭐ ${L.saved}` : `☆ ${L.save}`}
              </button>
              <button
                onClick={() => setActiveDetailScheme(null)}
                className="btn btn-secondary"
              >
                {L.close}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}
