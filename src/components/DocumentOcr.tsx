"use client";

import { useState, useRef } from "react";
import { useApp, type Language } from "@/lib/AppContext";
import { tr, type Localized } from "@/lib/i18n";
import { authHeaders } from "@/lib/apiClient";

export interface OcrResult {
  documentType: string;
  extractedTitle: string;
  extractedDate: string;
  issuerAuthority: string;
  whatIsThisEN?: string;
  whatIsThisTA?: string;
  whatIsThisTE?: string;
  whatIsThisKN?: string;
  whatIsThisML?: string;
  whatIsThisHI?: string;
  howToUseEN?: string;
  howToUseTA?: string;
  howToUseTE?: string;
  howToUseKN?: string;
  howToUseML?: string;
  howToUseHI?: string;
  summaryEN: string;
  summaryTA: string;
  summaryTE: string;
  summaryKN?: string;
  summaryML?: string;
  summaryHI?: string;
  actionItemsEN?: string[];
  actionItemsTA?: string[];
  actionItemsTE?: string[];
  actionItemsKN?: string[];
  actionItemsML?: string[];
  actionItemsHI?: string[];
  actionItems?: string[];
  // Languages the AI wrote; others show English until translated on demand. Absent on older saved scans.
  languages?: string[];
}

export interface HistoryItem {
  id: string;
  fileName: string;
  timestamp: string;
  result: OcrResult;
  mode?: string;
}

type ScanLang = "en" | "ta" | "te" | "kn" | "ml" | "hi";

const DEMO_DOCS: { label: Localized; key: string; file: string }[] = [
  { label: { en: "🏛️ PM-KISAN / e-KYC" }, key: "pm-kisan", file: "PM-KISAN_eKYC_Notice.pdf" },
  { label: { en: "💳 KCC Loan Sanction", ta: "💳 KCC கடன் அனுமதி", te: "💳 KCC రుణ మంజూరు", kn: "💳 KCC ಸಾಲ ಮಂಜೂರಾತಿ", ml: "💳 KCC വായ്പ അനുമതി", hi: "💳 KCC ऋण स्वीकृति" }, key: "kcc_loan", file: "KCC_Loan_Sanction.pdf" },
  { label: { en: "🌾 PMFBY Crop Insurance", ta: "🌾 PMFBY பயிர் காப்பீடு", te: "🌾 PMFBY పంట బీమా", kn: "🌾 PMFBY ಬೆಳೆ ವಿಮೆ", ml: "🌾 PMFBY വിള ഇൻഷുറൻസ്", hi: "🌾 PMFBY फसल बीमा" }, key: "pmfby", file: "PMFBY_Insurance.pdf" },
  { label: { en: "💰 MSP Procurement", ta: "💰 MSP கொள்முதல்", te: "💰 MSP కొనుగోలు", kn: "💰 MSP ಖರೀದಿ", ml: "💰 MSP സംഭരണം", hi: "💰 MSP खरीद" }, key: "msp", file: "MSP_Procurement.pdf" },
  { label: { en: "🌱 Soil Health Card", ta: "🌱 மண் வள அட்டை", te: "🌱 సాయిల్ హెల్త్ కార్డ్", kn: "🌱 ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್", ml: "🌱 സോയിൽ ഹെൽത്ത് കാർഡ്", hi: "🌱 मृदा स्वास्थ्य कार्ड" }, key: "soil", file: "Soil_Health_Card.pdf" },
  { label: { en: "💧 Drip Subsidy Notice", ta: "💧 சொட்டு நீர் மானிய அறிவிப்பு", te: "💧 డ్రిప్ సబ్సిడీ నోటీసు", kn: "💧 ಹನಿ ನೀರಾವರಿ ಸಬ್ಸಿಡಿ ಸೂಚನೆ", ml: "💧 ഡ്രിപ്പ് സബ്സിഡി അറിയിപ്പ്", hi: "💧 ड्रिप सब्सिडी सूचना" }, key: "irrigation", file: "PMKSY_Drip_Irrigation.pdf" },
  { label: { en: "📜 Land Chitta / Patta", ta: "📜 நில சிட்டா / பட்டா", te: "📜 భూమి చిట్టా / పట్టా", kn: "📜 ಭೂ ಚಿಟ್ಟಾ / ಪಟ್ಟಾ", ml: "📜 ഭൂമി ചിട്ട / പട്ടയം", hi: "📜 भूमि चिट्टा / पट्टा" }, key: "patta", file: "Land_Patta_Adangal.pdf" },
  { label: { en: "🏦 Agricultural Passbook", ta: "🏦 விவசாய பாஸ்புக்", te: "🏦 వ్యవసాయ పాస్‌బుక్", kn: "🏦 ಕೃಷಿ ಪಾಸ್‌ಬುಕ್", ml: "🏦 കാർഷിക പാസ്ബുക്ക്", hi: "🏦 कृषि पासबुक" }, key: "bank", file: "Bank_Cooperative_Passbook.pdf" },
];

async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// Shown when the server could not reach the AI model and returned only a generic summary
const BASIC_MODE_LABEL = "Basic summary only — AI unavailable, the document's text was not read";

function describeMode(mode?: string): string {
  if (!mode || mode === "dynamic-smart-ocr") return BASIC_MODE_LABEL;
  return mode;
}

const BASIC_MODE_TEXT: Localized = {
  en: BASIC_MODE_LABEL,
  ta: "அடிப்படை சுருக்கம் மட்டும் — AI கிடைக்கவில்லை, ஆவணத்தின் உரை படிக்கப்படவில்லை",
  te: "ప్రాథమిక సారాంశం మాత్రమే — AI అందుబాటులో లేదు, పత్రంలోని వచనం చదవలేదు",
  kn: "ಮೂಲ ಸಾರಾಂಶ ಮಾತ್ರ — AI ಲಭ್ಯವಿಲ್ಲ, ದಾಖಲೆಯ ಪಠ್ಯವನ್ನು ಓದಲಾಗಿಲ್ಲ",
  ml: "അടിസ്ഥാന സംഗ്രഹം മാത്രം — AI ലഭ്യമല്ല, രേഖയിലെ എഴുത്ത് വായിച്ചിട്ടില്ല",
  hi: "केवल मूल सारांश — AI उपलब्ध नहीं, दस्तावेज़ का टेक्स्ट नहीं पढ़ा गया",
};

function scanErrorMessage(err: unknown, language: Language): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return tr(language, {
      en: "The scan took too long. Please check your connection and try again.",
      ta: "ஸ்கேன் செய்ய அதிக நேரம் ஆனது. இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      te: "స్కాన్‌కు చాలా సమయం పట్టింది. కనెక్షన్ చూసి మళ్లీ ప్రయత్నించండి.",
      kn: "ಸ್ಕ್ಯಾನ್‌ಗೆ ಹೆಚ್ಚು ಸಮಯ ತಗುಲಿತು. ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      ml: "സ്കാൻ ചെയ്യാൻ കൂടുതൽ സമയമെടുത്തു. കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
      hi: "स्कैन में बहुत समय लगा। कृपया कनेक्शन जांचें और फिर से प्रयास करें।",
    });
  }
  return tr(language, {
    en: "Could not reach the scanner. Please check your internet connection and try again.",
    ta: "ஸ்கேனருடன் இணைக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    te: "స్కానర్‌ను చేరుకోలేకపోయాం. ఇంటర్నెట్ కనెక్షన్ చూసి మళ్లీ ప్రయత్నించండి.",
    kn: "ಸ್ಕ್ಯಾನರ್ ತಲುಪಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    ml: "സ്കാനറിലേക്ക് എത്താനായില്ല. ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
    hi: "स्कैनर से संपर्क नहीं हो सका। कृपया इंटरनेट कनेक्शन जांचें और फिर से प्रयास करें।",
  });
}

export default function DocumentOcr() {
  const { language } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [summaryLang, setSummaryLang] = useState<ScanLang>(language);
  const [error, setError] = useState<string | null>(null);
  const [scannedFileName, setScannedFileName] = useState<string>("");
  const [scanMode, setScanMode] = useState<string>("");
  // This component only renders in the browser (ClientLayout gates pages), so localStorage is safe here
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("agri_ocr_history") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [translating, setTranslating] = useState<ScanLang | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveToHistory = (fileName: string, res: OcrResult, mode?: string) => {
    const now = new Date();
    const newItem: HistoryItem = {
      id: String(now.getTime()),
      fileName,
      timestamp: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
      result: res,
      mode: describeMode(mode)
    };
    setHistory(prev => {
      const updated = [newItem, ...prev.filter(h => h.fileName !== fileName)].slice(0, 20);
      try {
        localStorage.setItem("agri_ocr_history", JSON.stringify(updated));
      } catch {
        // storage full or blocked; history stays in memory
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("agri_ocr_history");
    } catch {
      // storage blocked; nothing to clear
    }
  };

  const analyzeFile = async (file: File) => {
    setIsScanning(true);
    setOcrResult(null);
    setError(null);
    setScannedFileName(file.name);
    setScanMode("");

    const compressed = await compressImageIfNeeded(file);

    try {
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("language", language);

      // The AI writes the result in 6 languages, which can take a while
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: await authHeaders(),
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok || data.error || !data.result) {
        setError(data.error || tr(language, { en: "The scan failed. Please try again with a clearer photo or a smaller file.", ta: "ஸ்கேன் தோல்வியடைந்தது. தெளிவான புகைப்படம் அல்லது சிறிய கோப்புடன் மீண்டும் முயற்சிக்கவும்.", te: "స్కాన్ విఫలమైంది. స్పష్టమైన ఫోటో లేదా చిన్న ఫైల్‌తో మళ్లీ ప్రయత్నించండి.", kn: "ಸ್ಕ್ಯಾನ್ ವಿಫಲವಾಗಿದೆ. ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಥವಾ ಚಿಕ್ಕ ಫೈಲ್‌ನೊಂದಿಗೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", ml: "സ്കാൻ പരാജയപ്പെട്ടു. വ്യക്തമായ ഫോട്ടോ അല്ലെങ്കിൽ ചെറിയ ഫയൽ ഉപയോഗിച്ച് വീണ്ടും ശ്രമിക്കുക.", hi: "स्कैन विफल रहा। साफ़ फ़ोटो या छोटी फ़ाइल के साथ फिर से प्रयास करें।" }));
        return;
      }

      setOcrResult(data.result);
      setSummaryLang(language);
      setTranslateError(null);
      setScanMode(describeMode(data.mode));
      saveToHistory(file.name, data.result, data.mode);
    } catch (err) {
      setError(scanErrorMessage(err, language));
    } finally {
      setIsScanning(false);
    }
  };

  const analyzeDemoDoc = async (demoKey: string, fileName: string, label: string) => {
    setIsScanning(true);
    setOcrResult(null);
    setError(null);
    setScannedFileName(label);
    setScanMode("");

    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ demoKey, fileName, language }),
      });

      const data = await res.json();

      if (!res.ok || data.error || !data.result) {
        setError(data.error || tr(language, { en: "The scan failed. Please try again.", ta: "ஸ்கேன் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.", te: "స్కాన్ విఫలమైంది. మళ్లీ ప్రయత్నించండి.", kn: "ಸ್ಕ್ಯಾನ್ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", ml: "സ്കാൻ പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.", hi: "स्कैन विफल रहा। फिर से प्रयास करें।" }));
        return;
      }

      setOcrResult(data.result);
      setSummaryLang(language);
      setTranslateError(null);
      setScanMode(describeMode(data.mode));
      saveToHistory(label, data.result, data.mode);
    } catch (err) {
      setError(scanErrorMessage(err, language));
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      analyzeFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      analyzeFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Languages other than the scan language are written by a cheap text model when first opened
  const selectSummaryLang = async (lang: ScanLang) => {
    setSummaryLang(lang);
    setTranslateError(null);
    const current = ocrResult;
    if (!current || lang === "en" || !current.languages || current.languages.includes(lang)) return;

    setTranslating(lang);
    const S = lang.toUpperCase();
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({
          action: "translate",
          to: lang,
          fields: { whatIsThis: current.whatIsThisEN, howToUse: current.howToUseEN, summary: current.summaryEN, actionItems: current.actionItemsEN },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.translated) {
        setTranslateError(data.error || tr(language, { en: "Could not translate right now. Showing English.", ta: "இப்போது மொழிபெயர்க்க முடியவில்லை. ஆங்கிலத்தில் காட்டப்படுகிறது.", te: "ఇప్పుడు అనువదించలేకపోయాం. ఇంగ్లీష్ చూపబడుతోంది.", kn: "ಈಗ ಅನುವಾದಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಇಂಗ್ಲಿಷ್ ತೋರಿಸಲಾಗುತ್ತಿದೆ.", ml: "ഇപ്പോൾ വിവർത്തനം ചെയ്യാനായില്ല. ഇംഗ്ലീഷ് കാണിക്കുന്നു.", hi: "अभी अनुवाद नहीं हो सका। अंग्रेज़ी दिखाई जा रही है।" }));
        return;
      }
      const t = data.translated as { whatIsThis: string; howToUse: string; summary: string; actionItems: string[] };
      const merged: OcrResult = {
        ...current,
        [`whatIsThis${S}`]: t.whatIsThis,
        [`howToUse${S}`]: t.howToUse,
        [`summary${S}`]: t.summary,
        [`actionItems${S}`]: t.actionItems,
        languages: [...(current.languages || []), lang],
      };
      setOcrResult(prev => (prev === current ? merged : prev));
      saveToHistory(scannedFileName || "document", merged, scanMode);
    } catch {
      setTranslateError(tr(language, { en: "Could not reach the translator. Showing English.", ta: "மொழிபெயர்ப்பாளருடன் இணைக்க முடியவில்லை. ஆங்கிலத்தில் காட்டப்படுகிறது.", te: "అనువాదకుడిని చేరుకోలేకపోయాం. ఇంగ్లీష్ చూపబడుతోంది.", kn: "ಅನುವಾದಕವನ್ನು ತಲುಪಲಾಗಲಿಲ್ಲ. ಇಂಗ್ಲಿಷ್ ತೋರಿಸಲಾಗುತ್ತಿದೆ.", ml: "വിവർത്തകനിലേക്ക് എത്താനായില്ല. ഇംഗ്ലീഷ് കാണിക്കുന്നു.", hi: "अनुवादक से संपर्क नहीं हो सका। अंग्रेज़ी दिखाई जा रही है।" }));
    } finally {
      setTranslating(null);
    }
  };

  const reset = () => {
    setOcrResult(null);
    setError(null);
    setScannedFileName("");
    setScanMode("");
  };

  const getWhatIsThis = (): string => {
    if (!ocrResult) return "";
    if (summaryLang === "ta") return ocrResult.whatIsThisTA || ocrResult.whatIsThisEN || "";
    if (summaryLang === "te") return ocrResult.whatIsThisTE || ocrResult.whatIsThisEN || "";
    if (summaryLang === "kn") return ocrResult.whatIsThisKN || ocrResult.whatIsThisEN || "";
    if (summaryLang === "ml") return ocrResult.whatIsThisML || ocrResult.whatIsThisEN || "";
    if (summaryLang === "hi") return ocrResult.whatIsThisHI || ocrResult.whatIsThisEN || "";
    return ocrResult.whatIsThisEN || "";
  };

  const getHowToUse = (): string => {
    if (!ocrResult) return "";
    if (summaryLang === "ta") return ocrResult.howToUseTA || ocrResult.howToUseEN || "";
    if (summaryLang === "te") return ocrResult.howToUseTE || ocrResult.howToUseEN || "";
    if (summaryLang === "kn") return ocrResult.howToUseKN || ocrResult.howToUseEN || "";
    if (summaryLang === "ml") return ocrResult.howToUseML || ocrResult.howToUseEN || "";
    if (summaryLang === "hi") return ocrResult.howToUseHI || ocrResult.howToUseEN || "";
    return ocrResult.howToUseEN || "";
  };

  const getSummaryText = (): string => {
    if (!ocrResult) return "";
    if (summaryLang === "ta") return ocrResult.summaryTA || ocrResult.summaryEN;
    if (summaryLang === "te") return ocrResult.summaryTE || ocrResult.summaryEN;
    if (summaryLang === "kn") return ocrResult.summaryKN || ocrResult.summaryEN;
    if (summaryLang === "ml") return ocrResult.summaryML || ocrResult.summaryEN;
    if (summaryLang === "hi") return ocrResult.summaryHI || ocrResult.summaryEN;
    return ocrResult.summaryEN;
  };

  const getActionItems = (): string[] => {
    if (!ocrResult) return [];
    if (summaryLang === "ta") return (ocrResult.actionItemsTA && ocrResult.actionItemsTA.length > 0) ? ocrResult.actionItemsTA : ocrResult.actionItemsEN || [];
    if (summaryLang === "te") return (ocrResult.actionItemsTE && ocrResult.actionItemsTE.length > 0) ? ocrResult.actionItemsTE : ocrResult.actionItemsEN || [];
    if (summaryLang === "kn") return (ocrResult.actionItemsKN && ocrResult.actionItemsKN.length > 0) ? ocrResult.actionItemsKN : ocrResult.actionItemsEN || [];
    if (summaryLang === "ml") return (ocrResult.actionItemsML && ocrResult.actionItemsML.length > 0) ? ocrResult.actionItemsML : ocrResult.actionItemsEN || [];
    if (summaryLang === "hi") return (ocrResult.actionItemsHI && ocrResult.actionItemsHI.length > 0) ? ocrResult.actionItemsHI : ocrResult.actionItemsEN || [];
    return ocrResult.actionItemsEN || [];
  };

  const getWhatIsThisHeader = (): string => {
    if (summaryLang === "ta") return "🔍 இந்த ஆவணம்/படம் என்ன?";
    if (summaryLang === "te") return "🔍 ఈ ఫైల్/చిత్రం ఏమిటి?";
    if (summaryLang === "kn") return "🔍 ಈ ಫೈಲ್/ಚಿತ್ರ ಎಂದರೇನು?";
    if (summaryLang === "ml") return "🔍 ഈ ഫയൽ/ചിത്രം എന്താണ്?";
    if (summaryLang === "hi") return "🔍 यह फ़ाइल/छवि क्या है?";
    return "🔍 WHAT IS THIS FILE?";
  };

  const getHowToUseHeader = (): string => {
    if (summaryLang === "ta") return "💡 இதை உங்கள் பண்ணைக்கு எவ்வாறு பயன்படுத்துவது:";
    if (summaryLang === "te") return "💡 దీనిని మీ వ్యవసాయానికి ఎలా ఉపయోగించాలి:";
    if (summaryLang === "kn") return "💡 ಇದನ್ನು ನಿಮ್ಮ ಜಮೀನಿಗೆ ಹೇಗೆ ಬಳಸುವುದು:";
    if (summaryLang === "ml") return "💡 ഇത് നിങ്ങളുടെ ഫാമിൽ എങ്ങനെ ഉപയോഗിക്കാം:";
    if (summaryLang === "hi") return "💡 इसे अपने खेत के लिए कैसे उपयोग करें:";
    return "💡 HOW TO USE THIS FOR YOUR FARM:";
  };

  const getActionHeader = (): string => {
    if (summaryLang === "ta") return "✅ விவசாயிக்கான முக்கிய நடவடிக்கைகள் (தமிழ்)";
    if (summaryLang === "te") return "✅ రైతు కొరకు చర్యలు (తెలుగు)";
    if (summaryLang === "kn") return "✅ ರೈತರಿಗಾಗಿ ಪ್ರಮುಖ ಕ್ರಮಗಳು (ಕನ್ನಡ)";
    if (summaryLang === "ml") return "✅ കർഷകർക്കുള്ള പ്രധാന നടപടികൾ (മലയാളം)";
    if (summaryLang === "hi") return "✅ किसान के लिए मुख्य कार्य (हिंदी)";
    return "✅ Action Items for Farmer (English)";
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header Bar */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>📄</span>
          <div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>
              {tr(language, { en: "AI Document Scanner & Legal Decoder", ta: "AI ஆவண ஸ்கேனர் & சட்ட விளக்கி", te: "AI డాక్యుమెంట్ స్కానర్ & చట్ట వివరణ", kn: "AI ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್ & ಕಾನೂನು ವಿವರಣೆ", ml: "AI രേഖ സ്കാനർ & നിയമ വിശദീകരണം", hi: "AI दस्तावेज़ स्कैनर और कानूनी व्याख्या" })}
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
              {tr(language, {
                en: "Upload any file or image — AI identifies what it is, extracts exact text, and explains how to use it in 6 languages",
                ta: "எந்த கோப்பு அல்லது படத்தையும் பதிவேற்றுங்கள் — AI அது என்ன என்பதைக் கண்டறிந்து, உரையைப் பிரித்தெடுத்து, 6 மொழிகளில் பயன்படுத்தும் முறையை விளக்கும்",
                te: "ఏదైనా ఫైల్ లేదా చిత్రాన్ని అప్‌లోడ్ చేయండి — AI అది ఏమిటో గుర్తించి, వచనాన్ని తీసి, 6 భాషల్లో ఎలా ఉపయోగించాలో వివరిస్తుంది",
                kn: "ಯಾವುದೇ ಫೈಲ್ ಅಥವಾ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — AI ಅದು ಏನೆಂದು ಗುರುತಿಸಿ, ಪಠ್ಯವನ್ನು ತೆಗೆದು, 6 ಭಾಷೆಗಳಲ್ಲಿ ಹೇಗೆ ಬಳಸಬೇಕೆಂದು ವಿವರಿಸುತ್ತದೆ",
                ml: "ഏതെങ്കിലും ഫയലോ ചിത്രമോ അപ്‌ലോഡ് ചെയ്യുക — AI അത് എന്താണെന്ന് തിരിച്ചറിഞ്ഞ്, എഴുത്ത് എടുത്ത്, 6 ഭാഷകളിൽ എങ്ങനെ ഉപയോഗിക്കാമെന്ന് വിശദീകരിക്കും",
                hi: "कोई भी फ़ाइल या फ़ोटो अपलोड करें — AI पहचानता है कि यह क्या है, सटीक टेक्स्ट निकालता है और 6 भाषाओं में इसका उपयोग समझाता है",
              })}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {history.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowHistory(!showHistory)}>
              📜 {tr(language, { en: "History", ta: "வரலாறு", te: "చరిత్ర", kn: "ಇತಿಹಾಸ", ml: "ചരിത്രം", hi: "इतिहास" })} ({history.length})
            </button>
          )}
          {ocrResult && (
            <button className="btn btn-secondary btn-sm" onClick={reset}>
              🔄 {tr(language, { en: "Scan Another File", ta: "மற்றொரு கோப்பை ஸ்கேன் செய்", te: "మరో ఫైల్ స్కాన్ చేయండి", kn: "ಇನ್ನೊಂದು ಫೈಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ", ml: "മറ്റൊരു ഫയൽ സ്കാൻ ചെയ്യുക", hi: "दूसरी फ़ाइल स्कैन करें" })}
            </button>
          )}
        </div>
      </div>

      {/* History Drawer Panel */}
      {showHistory && history.length > 0 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>📜 {tr(language, { en: "Recent Document History", ta: "சமீபத்திய ஆவண வரலாறு", te: "ఇటీవలి పత్రాల చరిత్ర", kn: "ಇತ್ತೀಚಿನ ದಾಖಲೆ ಇತಿಹಾಸ", ml: "സമീപകാല രേഖ ചരിത്രം", hi: "हाल के दस्तावेज़" })}</span>
            <button style={{ fontSize: 11, color: "#E53E3E", background: "none", border: "none", cursor: "pointer" }} onClick={clearHistory}>
              🗑️ {tr(language, { en: "Clear History", ta: "வரலாற்றை அழி", te: "చరిత్ర తొలగించండి", kn: "ಇತಿಹಾಸ ಅಳಿಸಿ", ml: "ചരിത്രം മായ്ക്കുക", hi: "इतिहास हटाएं" })}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {history.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setOcrResult(item.result);
                  setScannedFileName(item.fileName);
                  setScanMode(item.mode || "⚡ Groq Vision AI (qwen/qwen3.8-27b)");
                  setShowHistory(false);
                }}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--accent)",
                  cursor: "pointer",
                  transition: "transform 0.15s"
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  📄 {item.fileName}
                </div>
                <div style={{ fontSize: 11, color: "var(--text)", marginTop: 2, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {item.result.extractedTitle}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                  🕒 {item.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan error */}
      {error && !isScanning && (
        <div role="alert" style={{
          background: "#FEE2E2",
          border: "1px solid #FCA5A5",
          color: "#991B1B",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 14
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Upload Zone */}
      {!ocrResult && !isScanning && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed var(--primary-light)",
              borderRadius: 16,
              padding: 28,
              textAlign: "center",
              background: "rgba(92,122,62,0.04)",
              marginBottom: 18,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(92,122,62,0.10)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(92,122,62,0.04)")}
          >
            <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>📸</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary)" }}>
              {tr(language, { en: "Click to Upload Any Document or Image File", ta: "எந்த ஆவணம் அல்லது படக் கோப்பையும் பதிவேற்ற கிளிக் செய்யவும்", te: "ఏదైనా పత్రం లేదా చిత్రాన్ని అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి", kn: "ಯಾವುದೇ ದಾಖಲೆ ಅಥವಾ ಚಿತ್ರ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ", ml: "ഏതെങ്കിലും രേഖയോ ചിത്രമോ അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക", hi: "कोई भी दस्तावेज़ या फ़ोटो अपलोड करने के लिए क्लिक करें" })}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {tr(language, {
                en: "Supports Images (JPG, PNG, WEBP), PDF Reports, Passbooks, Soil Cards & Receipts",
                ta: "படங்கள் (JPG, PNG, WEBP), PDF அறிக்கைகள், பாஸ்புக்குகள், மண் அட்டைகள் & ரசீதுகளை ஆதரிக்கிறது",
                te: "చిత్రాలు (JPG, PNG, WEBP), PDF నివేదికలు, పాస్‌బుక్‌లు, సాయిల్ కార్డులు & రసీదులు సపోర్ట్ చేస్తుంది",
                kn: "ಚಿತ್ರಗಳು (JPG, PNG, WEBP), PDF ವರದಿಗಳು, ಪಾಸ್‌ಬುಕ್‌ಗಳು, ಮಣ್ಣು ಕಾರ್ಡ್‌ಗಳು & ರಸೀದಿಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ",
                ml: "ചിത്രങ്ങൾ (JPG, PNG, WEBP), PDF റിപ്പോർട്ടുകൾ, പാസ്ബുക്കുകൾ, സോയിൽ കാർഡുകൾ & രസീതുകൾ എന്നിവ പിന്തുണയ്ക്കുന്നു",
                hi: "फ़ोटो (JPG, PNG, WEBP), PDF रिपोर्ट, पासबुक, मृदा कार्ड और रसीदें समर्थित हैं",
              })}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleFileUpload} />

          {/* Quick Demo Preset Documents */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
              ⚡ {tr(language, { en: "Or Select Sample Government Document:", ta: "அல்லது மாதிரி அரசு ஆவணத்தைத் தேர்ந்தெடுக்கவும்:", te: "లేదా నమూనా ప్రభుత్వ పత్రాన్ని ఎంచుకోండి:", kn: "ಅಥವಾ ಮಾದರಿ ಸರ್ಕಾರಿ ದಾಖಲೆ ಆಯ್ಕೆಮಾಡಿ:", ml: "അല്ലെങ്കിൽ ഒരു മാതൃക സർക്കാർ രേഖ തിരഞ്ഞെടുക്കുക:", hi: "या कोई नमूना सरकारी दस्तावेज़ चुनें:" })}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DEMO_DOCS.map(doc => (
                <button
                  key={doc.key}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 10, fontSize: 12 }}
                  onClick={() => analyzeDemoDoc(doc.key, doc.file, tr(language, doc.label))}
                >
                  {tr(language, doc.label)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Loading Scanning State */}
      {isScanning && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div className="pulse" style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>
            {tr(language, { en: "Analyzing File with Groq Vision AI...", ta: "Groq Vision AI மூலம் கோப்பு பகுப்பாய்வு செய்யப்படுகிறது...", te: "Groq Vision AI తో ఫైల్ విశ్లేషిస్తోంది...", kn: "Groq Vision AI ಮೂಲಕ ಫೈಲ್ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...", ml: "Groq Vision AI ഉപയോഗിച്ച് ഫയൽ വിശകലനം ചെയ്യുന്നു...", hi: "Groq Vision AI से फ़ाइल का विश्लेषण हो रहा है..." })}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
            {tr(language, {
              en: `Identifying document type, reading text, amounts & generating multilingual guidance for ${scannedFileName}`,
              ta: `${scannedFileName} — ஆவண வகையைக் கண்டறிந்து, உரை மற்றும் தொகைகளைப் படித்து, பன்மொழி வழிகாட்டுதல் தயாரிக்கப்படுகிறது`,
              te: `${scannedFileName} — పత్రం రకం గుర్తించి, వచనం & మొత్తాలు చదివి, బహుభాషా మార్గదర్శనం తయారవుతోంది`,
              kn: `${scannedFileName} — ದಾಖಲೆ ಪ್ರಕಾರ ಗುರುತಿಸಿ, ಪಠ್ಯ & ಮೊತ್ತಗಳನ್ನು ಓದಿ, ಬಹುಭಾಷಾ ಮಾರ್ಗದರ್ಶನ ತಯಾರಿಸಲಾಗುತ್ತಿದೆ`,
              ml: `${scannedFileName} — രേഖയുടെ തരം തിരിച്ചറിഞ്ഞ്, എഴുത്തും തുകകളും വായിച്ച്, ബഹുഭാഷാ മാർഗ്ഗനിർദ്ദേശം തയ്യാറാക്കുന്നു`,
              hi: `${scannedFileName} — दस्तावेज़ का प्रकार पहचाना जा रहा है, टेक्स्ट और राशि पढ़ी जा रही है, बहुभाषी मार्गदर्शन तैयार हो रहा है`,
            })}
          </div>
        </div>
      )}

      {/* Result Display */}
      {ocrResult && !isScanning && (
        <div>
          {/* Header Info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {ocrResult.documentType}
                </span>
                {scanMode && (
                  <span style={{ fontSize: 10, background: "rgba(92,122,62,0.12)", color: "var(--primary)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                    {scanMode === BASIC_MODE_LABEL ? tr(language, BASIC_MODE_TEXT) : scanMode}
                  </span>
                )}
              </div>
              <h4 style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "4px 0 0 0" }}>
                {ocrResult.extractedTitle}
              </h4>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                🏛️ {ocrResult.issuerAuthority} · 📅 {tr(language, { en: "Date", ta: "தேதி", te: "తేదీ", kn: "ದಿನಾಂಕ", ml: "തീയതി", hi: "तारीख" })}: {ocrResult.extractedDate}
              </div>
            </div>

            {/* Language Selector */}
            <div style={{ display: "flex", gap: 4, background: "var(--accent)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
              {(["en", "ta", "te", "kn", "ml", "hi"] as ScanLang[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => selectSummaryLang(lang)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: summaryLang === lang ? "var(--primary)" : "transparent",
                    color: summaryLang === lang ? "#fff" : "var(--text-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {lang === "en" ? "EN" : lang === "ta" ? "தமிழ்" : lang === "te" ? "తెలుగు" : lang === "kn" ? "ಕನ್ನಡ" : lang === "ml" ? "മലയാളം" : "हिंदी"}
                </button>
              ))}
            </div>
          </div>

          {(translating || translateError) && (
            <div role="status" style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: translateError ? "#991B1B" : "var(--text-muted)" }}>
              {translateError
                ? `⚠️ ${translateError}`
                : `⏳ ${tr(language, { en: "Translating…", ta: "மொழிபெயர்க்கிறது…", te: "అనువదిస్తోంది…", kn: "ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ…", ml: "വിവർത്തനം ചെയ്യുന്നു…", hi: "अनुवाद हो रहा है…" })}`}
            </div>
          )}

          {/* Section 1: WHAT IS THIS FILE / DOCUMENT */}
          {getWhatIsThis() && (
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1D4ED8", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                {getWhatIsThisHeader()}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.6 }}>
                {getWhatIsThis()}
              </div>
            </div>
          )}

          {/* Section 2: HOW TO USE THIS INFORMATION */}
          {getHowToUse() && (
            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#047857", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                {getHowToUseHeader()}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.6 }}>
                {getHowToUse()}
              </div>
            </div>
          )}

          {/* Multilingual Plain Summary Box */}
          <div style={{ background: "rgba(92,122,62,0.06)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
              📌 {tr(summaryLang, { en: "DETAILED SUMMARY", ta: "விரிவான சுருக்கம்", te: "వివరమైన సారాంశం", kn: "ವಿವರವಾದ ಸಾರಾಂಶ", ml: "വിശദമായ സംഗ്രഹം", hi: "विस्तृत सारांश" })} ({summaryLang.toUpperCase()})
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.6 }}>
              {getSummaryText()}
            </div>
          </div>

          {/* Action Items List */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
              {getActionHeader()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {getActionItems().map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--primary)", fontWeight: 700 }}>{idx + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
