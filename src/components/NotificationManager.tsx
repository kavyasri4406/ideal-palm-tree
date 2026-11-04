"use client";

import { useEffect, useState } from "react";
import { sendPushToThisDevice } from "@/lib/pushClient";
import { useApp } from "@/lib/AppContext";
import { tr } from "@/lib/i18n";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Several bell buttons are mounted at once (header, sidebar, home); keep their status in sync
const SUBSCRIPTION_EVENT = "agri-push-subscription";

function announceSubscription(subscribed: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(SUBSCRIPTION_EVENT, { detail: subscribed }));
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export default function NotificationManager() {
  const { language } = useApp();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    let cancelled = false;
    (async () => {
      let subscribed = false;
      try {
        const registration = await navigator.serviceWorker.getRegistration("/sw.js");
        subscribed = !!(await registration?.pushManager.getSubscription());
      } catch (e) {
        console.warn("Error checking subscription:", e);
      }
      if (cancelled) return;
      setIsSupported(true);
      setIsSubscribed(subscribed);
    })();
    const onChange = (e: Event) => setIsSubscribed((e as CustomEvent<boolean>).detail);
    window.addEventListener(SUBSCRIPTION_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(SUBSCRIPTION_EVENT, onChange);
    };
  }, []);

  async function subscribeToPush() {
    if (!isSupported) {
      setStatusMsg(tr(language, { en: "Push notifications not supported on this browser.", ta: "இந்த உலாவியில் புஷ் அறிவிப்புகள் ஆதரிக்கப்படவில்லை.", te: "ఈ బ్రౌజర్‌లో పుష్ నోటిఫికేషన్లు పనిచేయవు.", kn: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.", ml: "ഈ ബ്രൗസറിൽ പുഷ് അറിയിപ്പുകൾ പിന്തുണയ്ക്കുന്നില്ല.", hi: "इस ब्राउज़र में पुश सूचनाएं समर्थित नहीं हैं।" }));
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      // 1. Request user permission
      const userPerm = await Notification.requestPermission();

      if (userPerm !== "granted") {
        setStatusMsg(tr(language, { en: "Notification permission was denied. Please allow in browser settings.", ta: "அறிவிப்பு அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் அனுமதிக்கவும்.", te: "నోటిఫికేషన్ అనుమతి నిరాకరించబడింది. బ్రౌజర్ సెట్టింగ్‌లలో అనుమతించండి.", kn: "ಅಧಿಸೂಚನೆ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿಸಿ.", ml: "അറിയിപ്പ് അനുമതി നിരസിച്ചു. ബ്രൗസർ ക്രമീകരണങ്ങളിൽ അനുവദിക്കുക.", hi: "सूचना की अनुमति नहीं दी गई। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।" }));
        setLoading(false);
        return;
      }

      // 2. Fetch VAPID Public Key from server
      const keyRes = await fetch("/api/notifications/subscribe");
      const keyData = await keyRes.json();
      const vapidPublicKey: string | null = keyData.publicKey;

      if (!keyRes.ok || !vapidPublicKey) {
        throw new Error(keyData.error || "VAPID public key not found");
      }

      // 3. Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 4. Subscribe with PushManager
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      let subscription = await registration.pushManager.getSubscription();

      // A subscription made with an old (rotated) VAPID key can no longer receive pushes
      const existingKey = subscription?.options.applicationServerKey;
      if (subscription && existingKey && !sameBytes(new Uint8Array(existingKey), convertedVapidKey)) {
        await subscription.unsubscribe();
        subscription = null;
      }

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as BufferSource
        });
      }

      // 5. Send subscription to our Next.js backend
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      });

      if (!res.ok) throw new Error("Failed to register subscription on server");

      announceSubscription(true);
      setStatusMsg(tr(language, { en: "✅ Lockscreen alerts enabled! You will now receive real-time mandi updates.", ta: "✅ பூட்டுத் திரை எச்சரிக்கைகள் இயக்கப்பட்டன! இனி நேரடி மண்டி அப்டேட்களைப் பெறுவீர்கள்.", te: "✅ లాక్‌స్క్రీన్ అలర్ట్‌లు ఆన్ అయ్యాయి! ఇకపై మీకు తాజా మండీ అప్‌డేట్‌లు వస్తాయి.", kn: "✅ ಲಾಕ್‌ಸ್ಕ್ರೀನ್ ಎಚ್ಚರಿಕೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ! ಇನ್ನು ಮುಂದೆ ನಿಮಗೆ ನೇರ ಮಂಡಿ ಅಪ್‌ಡೇಟ್‌ಗಳು ಬರುತ್ತವೆ.", ml: "✅ ലോക്ക്സ്ക്രീൻ അലേർട്ടുകൾ ഓണാക്കി! ഇനി തത്സമയ മണ്ടി അപ്ഡേറ്റുകൾ ലഭിക്കും.", hi: "✅ लॉकस्क्रीन अलर्ट चालू हो गए! अब आपको लाइव मंडी अपडेट मिलेंगे।" }));
    } catch (err) {
      console.error("Subscription error:", err);
      setStatusMsg(tr(language, { en: "❌ Failed to enable push: ", ta: "❌ புஷ் இயக்க முடியவில்லை: ", te: "❌ పుష్ ఆన్ చేయడం విఫలమైంది: ", kn: "❌ ಪುಶ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ: ", ml: "❌ പുഷ് ഓണാക്കാനായില്ല: ", hi: "❌ पुश चालू नहीं हो सका: " }) + (err instanceof Error ? err.message : tr(language, { en: "Unknown error", ta: "தெரியாத பிழை", te: "తెలియని లోపం", kn: "ಅಜ್ಞಾತ ದೋಷ", ml: "അജ്ഞാത പിശക്", hi: "अज्ञात त्रुटि" })));
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/notifications/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint })
          });
          await sub.unsubscribe();
        }
      }
      announceSubscription(false);
      setStatusMsg(tr(language, { en: "Notifications disabled.", ta: "அறிவிப்புகள் முடக்கப்பட்டன.", te: "నోటిఫికేషన్లు ఆఫ్ చేయబడ్డాయి.", kn: "ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ.", ml: "അറിയിപ്പുകൾ ഓഫാക്കി.", hi: "सूचनाएं बंद कर दी गईं।" }));
    } catch (e) {
      setStatusMsg(tr(language, { en: "Error disabling: ", ta: "முடக்குவதில் பிழை: ", te: "ఆఫ్ చేయడంలో లోపం: ", kn: "ನಿಲ್ಲಿಸುವಲ್ಲಿ ದೋಷ: ", ml: "ഓഫാക്കുന്നതിൽ പിശക്: ", hi: "बंद करने में त्रुटि: " }) + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  async function sendTestNotification() {
    setLoading(true);
    setStatusMsg("");

    const payload = {
      title: tr(language, { en: "🌾 AgriPredict Alerts Active", ta: "🌾 AgriPredict எச்சரிக்கைகள் செயலில் உள்ளன", te: "🌾 AgriPredict అలర్ట్‌లు పనిచేస్తున్నాయి", kn: "🌾 AgriPredict ಎಚ್ಚರಿಕೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ", ml: "🌾 AgriPredict അലേർട്ടുകൾ സജീവമാണ്", hi: "🌾 AgriPredict अलर्ट चालू हैं" }),
      body: tr(language, { en: "Push notifications are working properly on this device.", ta: "இந்த சாதனத்தில் புஷ் அறிவிப்புகள் சரியாக வேலை செய்கின்றன.", te: "ఈ పరికరంలో పుష్ నోటిఫికేషన్లు సరిగ్గా పనిచేస్తున్నాయి.", kn: "ಈ ಸಾಧನದಲ್ಲಿ ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು ಸರಿಯಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿವೆ.", ml: "ഈ ഉപകരണത്തിൽ പുഷ് അറിയിപ്പുകൾ ശരിയായി പ്രവർത്തിക്കുന്നു.", hi: "इस डिवाइस पर पुश सूचनाएं ठीक से काम कर रही हैं।" }),
      url: "/crops",
      tag: "test-alert"
    };

    try {
      const res = await sendPushToThisDevice(payload);
      if (!res) {
        announceSubscription(false);
        setStatusMsg(tr(language, { en: "This device is not subscribed. Enable lockscreen alerts first.", ta: "இந்த சாதனம் பதிவு செய்யப்படவில்லை. முதலில் பூட்டுத் திரை எச்சரிக்கைகளை இயக்கவும்.", te: "ఈ పరికరం నమోదు కాలేదు. ముందుగా లాక్‌స్క్రీన్ అలర్ట్‌లను ఆన్ చేయండి.", kn: "ಈ ಸಾಧನ ನೋಂದಣಿಯಾಗಿಲ್ಲ. ಮೊದಲು ಲಾಕ್‌ಸ್ಕ್ರೀನ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.", ml: "ഈ ഉപകരണം രജിസ്റ്റർ ചെയ്തിട്ടില്ല. ആദ്യം ലോക്ക്സ്ക്രീൻ അലേർട്ടുകൾ ഓണാക്കുക.", hi: "यह डिवाइस पंजीकृत नहीं है। पहले लॉकस्क्रीन अलर्ट चालू करें।" }));
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg(tr(language, { en: "🚀 Test notification dispatched! Check your phone/desktop notification shade.", ta: "🚀 சோதனை அறிவிப்பு அனுப்பப்பட்டது! உங்கள் போன்/கணினி அறிவிப்புகளைப் பாருங்கள்.", te: "🚀 టెస్ట్ నోటిఫికేషన్ పంపబడింది! మీ ఫోన్/కంప్యూటర్ నోటిఫికేషన్లను చూడండి.", kn: "🚀 ಪರೀಕ್ಷಾ ಅಧಿಸೂಚನೆ ಕಳುಹಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಫೋನ್/ಕಂಪ್ಯೂಟರ್ ಅಧಿಸೂಚನೆಗಳನ್ನು ನೋಡಿ.", ml: "🚀 ടെസ്റ്റ് അറിയിപ്പ് അയച്ചു! നിങ്ങളുടെ ഫോൺ/കമ്പ്യൂട്ടർ അറിയിപ്പുകൾ നോക്കുക.", hi: "🚀 टेस्ट सूचना भेज दी गई! अपने फ़ोन/कंप्यूटर की सूचनाएं देखें।" }));
      } else {
        setStatusMsg(tr(language, { en: "Alert note: ", ta: "எச்சரிக்கை குறிப்பு: ", te: "అలర్ట్ గమనిక: ", kn: "ಎಚ್ಚರಿಕೆ ಸೂಚನೆ: ", ml: "അലേർട്ട് കുറിപ്പ്: ", hi: "अलर्ट नोट: " }) + (data.message || data.error));
      }
    } catch (e) {
      setStatusMsg(tr(language, { en: "Error dispatching: ", ta: "அனுப்புவதில் பிழை: ", te: "పంపడంలో లోపం: ", kn: "ಕಳುಹಿಸುವಲ್ಲಿ ದೋಷ: ", ml: "അയയ്ക്കുന്നതിൽ പിശക്: ", hi: "भेजने में त्रुटि: " }) + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header Notification Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={tr(language, { en: "Real-Time Push Alerts", ta: "நேரடி புஷ் எச்சரிக்கைகள்", te: "తక్షణ పుష్ అలర్ట్‌లు", kn: "ನೈಜ-ಸಮಯದ ಪುಶ್ ಎಚ್ಚರಿಕೆಗಳು", ml: "തത്സമയ പുഷ് അലേർട്ടുകൾ", hi: "रियल-टाइम पुश अलर्ट" })}
        aria-label={tr(language, { en: "Real-Time Push Alerts", ta: "நேரடி புஷ் எச்சரிக்கைகள்", te: "తక్షణ పుష్ అలర్ట్‌లు", kn: "ನೈಜ-ಸಮಯದ ಪುಶ್ ಎಚ್ಚರಿಕೆಗಳು", ml: "തത്സമയ പുഷ് അലേർട്ടുകൾ", hi: "रियल-टाइम पुश अलर्ट" })}
        aria-expanded={isOpen}
        style={{
          position: "relative",
          background: isSubscribed ? "rgba(92,122,62,0.14)" : "var(--accent)",
          border: `1px solid ${isSubscribed ? "var(--primary)" : "var(--border)"}`,
          borderRadius: 12,
          padding: "7px 12px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          color: "var(--text)",
          fontSize: 13,
          fontWeight: 600,
          transition: "all 0.2s ease"
        }}
      >
        <span style={{ fontSize: 16 }}>🔔</span>
        <span className="hidden sm:inline" style={{ fontSize: 12 }}>
          {isSubscribed
            ? tr(language, { en: "Alerts Active", ta: "எச்சரிக்கைகள் இயக்கத்தில்", te: "అలర్ట్‌లు ఆన్‌లో ఉన్నాయి", kn: "ಎಚ್ಚರಿಕೆಗಳು ಸಕ್ರಿಯ", ml: "അലേർട്ടുകൾ സജീവം", hi: "अलर्ट चालू" })
            : tr(language, { en: "Get Alerts", ta: "எச்சரிக்கைகள் பெறு", te: "అలర్ట్‌లు పొందండి", kn: "ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ", ml: "അലേർട്ടുകൾ നേടുക", hi: "अलर्ट पाएं" })}
        </span>
        {isSubscribed && (
          <span
            style={{
              width: 8,
              height: 8,
              background: "#10B981",
              borderRadius: "50%",
              display: "inline-block"
            }}
          />
        )}
      </button>

      {/* Slide-out / Modal Drawer */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 64,
            right: 16,
            width: 360,
            maxWidth: "92vw",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
            padding: 20,
            zIndex: 1000,
            animation: "fadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24 }}>🔔</span>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
                  {tr(language, { en: "Real-Time Farmer Push Alerts", ta: "விவசாயிகளுக்கான நேரடி புஷ் எச்சரிக்கைகள்", te: "రైతుల కోసం తక్షణ పుష్ అలర్ట్‌లు", kn: "ರೈತರಿಗಾಗಿ ನೈಜ-ಸಮಯದ ಪುಶ್ ಎಚ್ಚರಿಕೆಗಳು", ml: "കർഷകർക്കുള്ള തത്സമയ പുഷ് അലേർട്ടുകൾ", hi: "किसानों के लिए रियल-टाइम पुश अलर्ट" })}
                </h4>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>
                  {tr(language, { en: "Native VAPID lockscreen notifications", ta: "சாதன பூட்டுத் திரை அறிவிப்புகள் (VAPID)", te: "పరికర లాక్‌స్క్రీన్ నోటిఫికేషన్లు (VAPID)", kn: "ಸಾಧನದ ಲಾಕ್‌ಸ್ಕ್ರೀನ್ ಅಧಿಸೂಚನೆಗಳು (VAPID)", ml: "ഉപകരണ ലോക്ക്സ്ക്രീൻ അറിയിപ്പുകൾ (VAPID)", hi: "डिवाइस लॉकस्क्रीन सूचनाएं (VAPID)" })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={tr(language, { en: "Close", ta: "மூடு", te: "మూసివేయండి", kn: "ಮುಚ್ಚಿ", ml: "അടയ്ക്കുക", hi: "बंद करें" })}
              style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>

          {/* Status Badge */}
          <div
            style={{
              background: isSubscribed ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              border: `1px solid ${isSubscribed ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 14,
              fontSize: 12.5,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: isSubscribed ? "#047857" : "#B45309"
            }}
          >
            <span>{isSubscribed ? "🟢" : "🟠"}</span>
            <span>
              {isSubscribed
                ? tr(language, { en: "This device is registered for phone lockscreen alerts!", ta: "இந்த சாதனம் பூட்டுத் திரை எச்சரிக்கைகளுக்கு பதிவு செய்யப்பட்டுள்ளது!", te: "ఈ పరికరం లాక్‌స్క్రీన్ అలర్ట్‌ల కోసం నమోదైంది!", kn: "ಈ ಸಾಧನ ಲಾಕ್‌ಸ್ಕ್ರೀನ್ ಎಚ್ಚರಿಕೆಗಳಿಗೆ ನೋಂದಣಿಯಾಗಿದೆ!", ml: "ഈ ഉപകരണം ലോക്ക്സ്ക്രീൻ അലേർട്ടുകൾക്കായി രജിസ്റ്റർ ചെയ്തു!", hi: "यह डिवाइस लॉकस्क्रीन अलर्ट के लिए पंजीकृत है!" })
                : tr(language, { en: "Enable push to get live price jumps even when the app is closed.", ta: "ஆப் மூடியிருந்தாலும் விலை உயர்வுகளை அறிய புஷ் அறிவிப்புகளை இயக்கவும்.", te: "యాప్ మూసి ఉన్నా ధరల మార్పులు తెలుసుకోవడానికి పుష్ ఆన్ చేయండి.", kn: "ಆ್ಯಪ್ ಮುಚ್ಚಿದ್ದರೂ ಬೆಲೆ ಏರಿಕೆಗಳನ್ನು ತಿಳಿಯಲು ಪುಶ್ ಸಕ್ರಿಯಗೊಳಿಸಿ.", ml: "ആപ്പ് അടച്ചിരിക്കുമ്പോഴും വില മാറ്റങ്ങൾ അറിയാൻ പുഷ് ഓണാക്കുക.", hi: "ऐप बंद होने पर भी कीमतों में उछाल जानने के लिए पुश चालू करें।" })}
            </span>
          </div>

          {/* Main Action Button */}
          {!isSubscribed ? (
            <button
              onClick={subscribeToPush}
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "10px 14px",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 14
              }}
            >
              {loading
                ? tr(language, { en: "Registering Device...", ta: "சாதனம் பதிவு செய்யப்படுகிறது...", te: "పరికరం నమోదవుతోంది...", kn: "ಸಾಧನ ನೋಂದಣಿಯಾಗುತ್ತಿದೆ...", ml: "ഉപകരണം രജിസ്റ്റർ ചെയ്യുന്നു...", hi: "डिवाइस पंजीकृत हो रहा है..." })
                : tr(language, { en: "📱 Enable Phone Lockscreen Alerts", ta: "📱 போன் பூட்டுத் திரை எச்சரிக்கைகளை இயக்கு", te: "📱 ఫోన్ లాక్‌స్క్రీన్ అలర్ట్‌లను ఆన్ చేయండి", kn: "📱 ಫೋನ್ ಲಾಕ್‌ಸ್ಕ್ರೀನ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ", ml: "📱 ഫോൺ ലോക്ക്സ്ക്രീൻ അലേർട്ടുകൾ ഓണാക്കുക", hi: "📱 फ़ोन लॉकस्क्रीन अलर्ट चालू करें" })}
            </button>
          ) : (
            <div style={{ marginBottom: 14, display: "flex", gap: 8 }}>
              <button
                onClick={unsubscribeFromPush}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, borderRadius: 10, fontSize: 11 }}
              >
                🔕 {tr(language, { en: "Mute Alerts", ta: "எச்சரிக்கைகளை நிறுத்து", te: "అలర్ట్‌లు ఆపండి", kn: "ಎಚ್ಚರಿಕೆಗಳನ್ನು ನಿಲ್ಲಿಸಿ", ml: "അലേർട്ടുകൾ നിർത്തുക", hi: "अलर्ट बंद करें" })}
              </button>
            </div>
          )}

          {/* Single Test Notification Trigger */}
          {isSubscribed && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
              <button
                onClick={() => sendTestNotification()}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", borderRadius: 10, fontSize: 12, justifyContent: "center" }}
              >
                🧪 {tr(language, { en: "Send Test Lockscreen Alert", ta: "சோதனை எச்சரிக்கை அனுப்பு", te: "టెస్ట్ అలర్ట్ పంపండి", kn: "ಪರೀಕ್ಷಾ ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ", ml: "ടെസ്റ്റ് അലേർട്ട് അയയ്ക്കുക", hi: "टेस्ट अलर्ट भेजें" })}
              </button>
            </div>
          )}

          {/* Status / Feedback Message */}
          {statusMsg && (
            <div
              style={{
                marginTop: 12,
                fontSize: 11.5,
                color: "var(--primary)",
                background: "rgba(92,122,62,0.08)",
                padding: "8px 12px",
                borderRadius: 10,
                lineHeight: 1.4
              }}
            >
              {statusMsg}
            </div>
          )}
        </div>
      )}
    </>
  );
}
