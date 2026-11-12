"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useApp } from "@/lib/AppContext";
import { tr } from "@/lib/i18n";

// Chrome/Edge/Samsung Internet fire this when the app can be installed; it isn't in the TS DOM lib
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "agri_install_dismissed";
const noopSubscribe = () => () => {};

function wasDismissed(): boolean {
  try { return localStorage.getItem(DISMISSED_KEY) === "1"; } catch { return false; }
}

// iOS has no install prompt: Safari users add the app from the Share menu
function isIosBrowserTab(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone && !wasDismissed();
}

/** Bottom banner offering to install the app on the phone's home screen. */
export default function InstallApp() {
  const { language } = useApp();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const showIosHint = useSyncExternalStore(noopSubscribe, isIosBrowserTab, () => false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Keep the browser's own mini-infobar from showing; the banner's button triggers the prompt
      e.preventDefault();
      if (!wasDismissed()) setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || (!installEvent && !showIosHint)) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* private mode: just hide for this visit */ }
    setHidden(true);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    // The event can only be used once
    setInstallEvent(null);
    if (outcome === "dismissed") dismiss();
  };

  return (
    <div role="dialog" aria-label={tr(language, { en: "Install AgriPredict" })} style={{
      position: "fixed", left: 12, right: 12, bottom: 12, margin: "0 auto", maxWidth: 440, zIndex: 9000,
      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
      background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--shadow-lg)",
    }}>
      <span style={{ fontSize: 28 }}>🌾</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--primary)" }}>
          {tr(language, { en: "Install AgriPredict", ta: "AgriPredict-ஐ நிறுவுங்கள்", te: "AgriPredict ఇన్‌స్టాల్ చేయండి", kn: "AgriPredict ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ", ml: "AgriPredict ഇൻസ്റ്റാൾ ചെയ്യുക", hi: "AgriPredict इंस्टॉल करें" })}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>
          {installEvent
            ? tr(language, { en: "Add it to your home screen for one-tap access.", ta: "ஒரே தொடுதலில் திறக்க முகப்புத் திரையில் சேர்க்கவும்.", te: "ఒక్క టచ్‌తో తెరవడానికి హోమ్ స్క్రీన్‌కు జోడించండి.", kn: "ಒಂದೇ ಟ್ಯಾಪ್‌ನಲ್ಲಿ ತೆರೆಯಲು ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ.", ml: "ഒറ്റ ടാപ്പിൽ തുറക്കാൻ ഹോം സ്ക്രീനിൽ ചേർക്കുക.", hi: "एक टैप में खोलने के लिए होम स्क्रीन पर जोड़ें।" })
            : tr(language, { en: "Tap Share, then “Add to Home Screen”.", ta: "பகிர் என்பதைத் தட்டி, “முகப்புத் திரையில் சேர்” என்பதைத் தேர்ந்தெடுக்கவும்.", te: "షేర్ నొక్కి, “హోమ్ స్క్రీన్‌కు జోడించు” ఎంచుకోండి.", kn: "ಶೇರ್ ಒತ್ತಿ, “ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ” ಆಯ್ಕೆಮಾಡಿ.", ml: "ഷെയർ ടാപ്പ് ചെയ്ത് “ഹോം സ്ക്രീനിൽ ചേർക്കുക” തിരഞ്ഞെടുക്കുക.", hi: "शेयर दबाएं, फिर “होम स्क्रीन में जोड़ें” चुनें।" })}
        </div>
      </div>
      {installEvent && (
        <button onClick={install} className="btn btn-primary" style={{ padding: "7px 14px", fontSize: 12.5, borderRadius: 10 }}>
          {tr(language, { en: "Install", ta: "நிறுவு", te: "ఇన్‌స్టాల్", kn: "ಇನ್‌ಸ್ಟಾಲ್", ml: "ഇൻസ്റ്റാൾ", hi: "इंस्टॉल" })}
        </button>
      )}
      <button onClick={dismiss} aria-label={tr(language, { en: "Close" })} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
        ✕
      </button>
    </div>
  );
}
