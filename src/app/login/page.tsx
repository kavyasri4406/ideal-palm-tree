"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, login, register } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";
import { INDIAN_STATES, STATE_DISTRICTS } from "@/lib/locationData";
import { tr, type Localized } from "@/lib/i18n";

// Translations for the English messages shown on this page (including the known ones from lib/auth).
const MESSAGES: Record<string, Localized> = {
  "Login failed": { en: "Login failed", ta: "உள்நுழைவு தோல்வியடைந்தது", te: "లాగిన్ విఫలమైంది", kn: "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ", ml: "ലോഗിൻ പരാജയപ്പെട്ടു", hi: "लॉगिन विफल रहा" },
  "Registration failed": { en: "Registration failed", ta: "பதிவு தோல்வியடைந்தது", te: "నమోదు విఫలమైంది", kn: "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ", ml: "രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു", hi: "पंजीकरण विफल रहा" },
  "Please fill all fields": { en: "Please fill all fields", ta: "அனைத்து புலங்களையும் நிரப்பவும்", te: "దయచేసి అన్ని వివరాలు నింపండి", kn: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ತುಂಬಿರಿ", ml: "ദയവായി എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക", hi: "कृपया सभी जानकारी भरें" },
  "Password must be at least 6 characters": { en: "Password must be at least 6 characters", ta: "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்", te: "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి", kn: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು", ml: "പാസ്‌വേഡിൽ കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ വേണം", hi: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए" },
  "Login service is not configured. Please try again later.": { en: "Login service is not configured. Please try again later.", ta: "உள்நுழைவு சேவை அமைக்கப்படவில்லை. பின்னர் முயற்சிக்கவும்.", te: "లాగిన్ సేవ సిద్ధంగా లేదు. దయచేసి తర్వాత ప్రయత్నించండి.", kn: "ಲಾಗಿನ್ ಸೇವೆ ಸಿದ್ಧವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.", ml: "ലോഗിൻ സേവനം സജ്ജമല്ല. ദയവായി പിന്നീട് ശ്രമിക്കുക.", hi: "लॉगिन सेवा उपलब्ध नहीं है। कृपया बाद में प्रयास करें।" },
  "Incorrect email or password. Please try again.": { en: "Incorrect email or password. Please try again.", ta: "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறு. மீண்டும் முயற்சிக்கவும்.", te: "ఈమెయిల్ లేదా పాస్‌వర్డ్ తప్పు. మళ్లీ ప్రయత్నించండి.", kn: "ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", ml: "ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ് തെറ്റാണ്. വീണ്ടും ശ്രമിക്കുക.", hi: "ईमेल या पासवर्ड गलत है। कृपया फिर से प्रयास करें।" },
  "Email already registered. Please sign in.": { en: "Email already registered. Please sign in.", ta: "இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. உள்நுழையவும்.", te: "ఈ ఈమెయిల్ ఇప్పటికే నమోదైంది. దయచేసి సైన్ ఇన్ చేయండి.", kn: "ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಣಿಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.", ml: "ഈ ഇമെയിൽ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. ദയവായി സൈൻ ഇൻ ചെയ്യുക.", hi: "यह ईमेल पहले से पंजीकृत है। कृपया साइन इन करें।" },
  "Please confirm your email first — check your inbox for the link.": { en: "Please confirm your email first — check your inbox for the link.", ta: "முதலில் உங்கள் மின்னஞ்சலை உறுதிப்படுத்தவும் — இணைப்புக்கு இன்பாக்ஸைப் பார்க்கவும்.", te: "ముందుగా మీ ఈమెయిల్‌ను నిర్ధారించండి — లింక్ కోసం ఇన్‌బాక్స్ చూడండి.", kn: "ಮೊದಲು ನಿಮ್ಮ ಇಮೇಲ್ ದೃಢೀಕರಿಸಿ — ಲಿಂಕ್‌ಗಾಗಿ ಇನ್‌ಬಾಕ್ಸ್ ನೋಡಿ.", ml: "ആദ്യം നിങ്ങളുടെ ഇമെയിൽ സ്ഥിരീകരിക്കുക — ലിങ്കിനായി ഇൻബോക്സ് നോക്കുക.", hi: "कृपया पहले अपना ईमेल पुष्टि करें — लिंक के लिए इनबॉक्स देखें।" },
  "Too many attempts. Please wait a minute and try again.": { en: "Too many attempts. Please wait a minute and try again.", ta: "பல முயற்சிகள். ஒரு நிமிடம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.", te: "చాలా ప్రయత్నాలు చేశారు. ఒక నిమిషం ఆగి మళ్లీ ప్రయత్నించండి.", kn: "ಹಲವು ಪ್ರಯತ್ನಗಳು. ಒಂದು ನಿಮಿಷ ಕಾಯ್ದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", ml: "നിരവധി ശ്രമങ്ങൾ. ഒരു മിനിറ്റ് കാത്തിരുന്ന് വീണ്ടും ശ്രമിക്കുക.", hi: "बहुत अधिक प्रयास। एक मिनट रुककर फिर से प्रयास करें।" },
  "Something went wrong. Please try again.": { en: "Something went wrong. Please try again.", ta: "ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.", te: "ఏదో పొరపాటు జరిగింది. మళ్లీ ప్రయత్నించండి.", kn: "ಏನೋ ತಪ್ಪಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", ml: "എന്തോ പിശക് സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.", hi: "कुछ गलत हो गया। कृपया फिर से प्रयास करें।" },
  "Account created, but your profile could not be saved. Please sign in.": { en: "Account created, but your profile could not be saved. Please sign in.", ta: "கணக்கு உருவாக்கப்பட்டது, ஆனால் சுயவிவரத்தைச் சேமிக்க முடியவில்லை. உள்நுழையவும்.", te: "ఖాతా సృష్టించబడింది, కానీ ప్రొఫైల్ సేవ్ కాలేదు. దయచేసి సైన్ ఇన్ చేయండి.", kn: "ಖಾತೆ ರಚಿಸಲಾಗಿದೆ, ಆದರೆ ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.", ml: "അക്കൗണ്ട് സൃഷ്ടിച്ചു, പക്ഷേ പ്രൊഫൈൽ സേവ് ചെയ്യാനായില്ല. ദയവായി സൈൻ ഇൻ ചെയ്യുക.", hi: "खाता बन गया, लेकिन प्रोफ़ाइल सहेजी नहीं जा सकी। कृपया साइन इन करें।" },
  "Could not load your profile. Please try again.": { en: "Could not load your profile. Please try again.", ta: "உங்கள் சுயவிவரத்தை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.", te: "మీ ప్రొఫైల్ లోడ్ కాలేదు. మళ్లీ ప్రయత్నించండి.", kn: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", ml: "നിങ്ങളുടെ പ്രൊഫൈൽ ലോഡ് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.", hi: "आपकी प्रोफ़ाइल लोड नहीं हो सकी। कृपया फिर से प्रयास करें।" },
};

const FIELD_LABEL = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 } as const;

export default function LoginPage() {
  const router = useRouter();
  const { setLocation, language } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    state: "Tamil Nadu",
    district: "Chennai",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // email the confirmation link was sent to
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Update district when state changes
  const handleStateChange = (stateName: string) => {
    const districts = STATE_DISTRICTS[stateName] || [];
    const firstDistrict = districts[0]?.name || "";
    setForm(f => ({ ...f, state: stateName, district: firstDistrict }));
  };

  // AppProvider lives in the root layout and is not remounted on navigation, so push the
  // signed-in user's location into context directly (it also persists to localStorage).
  const syncLocation = (state: string, district: string) => {
    const match = STATE_DISTRICTS[state]?.find(d => d.name === district);
    if (match) setLocation({ state, district, lat: match.lat, lon: match.lon });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (mode === "login") {
      const res = await login(form.email, form.password);
      if (res.success) {
        const currentUser = getCurrentUser();
        if (currentUser?.state && currentUser.district) {
          syncLocation(currentUser.state, currentUser.district);
        }
        router.push("/");
      }
      else setError(res.error || "Login failed");
    } else {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError("Please fill all fields");
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const res = await register(form.name, form.email, form.password, form.state, form.district);
      if (res.success && res.needsConfirmation) {
        // Supabase sends a confirmation link; the user signs in after clicking it
        setMode("login");
        setForm(f => ({ ...f, password: "" }));
        setInfo(form.email.trim());
      } else if (res.success) {
        syncLocation(form.state, form.district);
        router.push("/");
      } else {
        setError(res.error || "Registration failed");
      }
    }
    setLoading(false);
  };

  const districts = STATE_DISTRICTS[form.state] || [];

  return (
    <div className="login-page">
      {/* Decorative crop emojis */}
      <div style={{ position: "absolute", fontSize: 80, opacity: 0.06, top: 40, left: 60, userSelect: "none" }}>🌾</div>
      <div style={{ position: "absolute", fontSize: 60, opacity: 0.05, bottom: 80, right: 80, userSelect: "none" }}>🌱</div>
      <div style={{ position: "absolute", fontSize: 50, opacity: 0.04, top: "50%", right: "20%", userSelect: "none" }}>🍅</div>

      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🌾</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 26, fontWeight: 700, color: "var(--text)" }}>AgriPredict</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 4 }}>
            {mode === "login"
              ? tr(language, { en: "Welcome back, Farmer 🙏", ta: "மீண்டும் வருக, விவசாயி 🙏", te: "తిరిగి స్వాగతం, రైతు గారు 🙏", kn: "ಮರಳಿ ಸ್ವಾಗತ, ರೈತರೇ 🙏", ml: "വീണ്ടും സ്വാഗതം, കർഷകരേ 🙏", hi: "फिर से स्वागत है, किसान भाई 🙏" })
              : tr(language, { en: "Join 10,000+ smart farmers", ta: "10,000+ புத்திசாலி விவசாயிகளுடன் இணையுங்கள்", te: "10,000+ తెలివైన రైతులతో చేరండి", kn: "10,000+ ಜಾಣ ರೈತರೊಂದಿಗೆ ಸೇರಿ", ml: "10,000+ സ്മാർട്ട് കർഷകർക്കൊപ്പം ചേരൂ", hi: "10,000+ स्मार्ट किसानों से जुड़ें" })}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--bg)", borderRadius: 10, padding: 4, marginBottom: 22 }}>
          {(["login", "register"] as const).map(m => (
            <button key={m} id={`tab-${m}`}
              onClick={() => { setMode(m); setError(""); setInfo(""); }}
              style={{ flex: 1, padding: "8px 0", background: mode === m ? "var(--bg-card)" : "transparent", color: mode === m ? "var(--primary)" : "var(--text-muted)", border: "none", borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: "pointer", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily: "Inter,sans-serif", transition: "all 0.2s" }}>
              {m === "login" ? tr(language, { en: "Sign In", ta: "உள்நுழை", te: "సైన్ ఇన్", kn: "ಸೈನ್ ಇನ್", ml: "സൈൻ ഇൻ", hi: "साइन इन" }) : tr(language, { en: "Register", ta: "பதிவு செய்", te: "నమోదు", kn: "ನೋಂದಣಿ", ml: "രജിസ്റ്റർ", hi: "रजिस्टर" })}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="input-name" style={FIELD_LABEL}>{tr(language, { en: "Your Name", ta: "உங்கள் பெயர்", te: "మీ పేరు", kn: "ನಿಮ್ಮ ಹೆಸರು", ml: "നിങ്ങളുടെ പേര്", hi: "आपका नाम" })}</label>
              <input id="input-name" className="input" type="text" placeholder={tr(language, { en: "e.g. Rajesh Kumar", ta: "எ.கா. ராஜேஷ் குமார்", te: "ఉదా. రాజేష్ కుమార్", kn: "ಉದಾ. ರಾಜೇಶ್ ಕುಮಾರ್", ml: "ഉദാ. രാജേഷ് കുമാർ", hi: "जैसे राजेश कुमार" })} value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="input-email" style={FIELD_LABEL}>{tr(language, { en: "Email Address", ta: "மின்னஞ்சல் முகவரி", te: "ఈమెయిల్ చిరునామా", kn: "ಇಮೇಲ್ ವಿಳಾಸ", ml: "ഇമെയിൽ വിലാസം", hi: "ईमेल पता" })}</label>
            <input id="input-email" className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} required />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="input-password" style={FIELD_LABEL}>{tr(language, { en: "Password", ta: "கடவுச்சொல்", te: "పాస్‌వర్డ్", kn: "ಪಾಸ್‌ವರ್ಡ್", ml: "പാസ്‌വേഡ്", hi: "पासवर्ड" })}</label>
            <input id="input-password" className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} required />
          </div>

          {mode === "register" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="input-state" style={FIELD_LABEL}>📍 {tr(language, { en: "State", ta: "மாநிலம்", te: "రాష్ట్రం", kn: "ರಾಜ್ಯ", ml: "സംസ്ഥാനം", hi: "राज्य" })}</label>
                <select id="input-state" className="input" value={form.state} onChange={e => handleStateChange(e.target.value)}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label htmlFor="input-district" style={FIELD_LABEL}>🏙️ {tr(language, { en: "District", ta: "மாவட்டம்", te: "జిల్లా", kn: "ಜಿಲ್ಲೆ", ml: "ജില്ല", hi: "ज़िला" })}</label>
                <select id="input-district" className="input" value={form.district} onChange={e => set("district", e.target.value)}>
                  {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </>
          )}

          {info && (
            <div className="alert alert-success" style={{ marginBottom: 14 }}>
              <span>✅</span><span>{tr(language, {
                en: `Account created! We sent a confirmation link to ${info}. Click it, then sign in.`,
                ta: `கணக்கு உருவாக்கப்பட்டது! ${info} க்கு உறுதிப்படுத்தல் இணைப்பை அனுப்பியுள்ளோம். அதைக் கிளிக் செய்து, பின்னர் உள்நுழையவும்.`,
                te: `ఖాతా సృష్టించబడింది! ${info} కు నిర్ధారణ లింక్ పంపాము. దానిపై క్లిక్ చేసి, ఆపై సైన్ ఇన్ చేయండి.`,
                kn: `ಖಾತೆ ರಚಿಸಲಾಗಿದೆ! ${info} ಗೆ ದೃಢೀಕರಣ ಲಿಂಕ್ ಕಳುಹಿಸಿದ್ದೇವೆ. ಅದನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ, ನಂತರ ಸೈನ್ ಇನ್ ಮಾಡಿ.`,
                ml: `അക്കൗണ്ട് സൃഷ്ടിച്ചു! ${info} എന്ന വിലാസത്തിലേക്ക് സ്ഥിരീകരണ ലിങ്ക് അയച്ചിട്ടുണ്ട്. അതിൽ ക്ലിക്ക് ചെയ്ത ശേഷം സൈൻ ഇൻ ചെയ്യുക.`,
                hi: `खाता बन गया! हमने ${info} पर पुष्टि लिंक भेजा है। उस पर क्लिक करें, फिर साइन इन करें।`,
              })}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 14 }}>
              <span>⚠️</span><span>{tr(language, MESSAGES[error] ?? { en: error })}</span>
            </div>
          )}

          <button id="btn-submit" className="btn btn-primary btn-lg" type="submit" disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: 6, background: "var(--primary)" }}>
            {loading
              ? <><span className="animate-pulse">⏳</span> {tr(language, { en: "Please wait...", ta: "காத்திருக்கவும்...", te: "దయచేసి వేచి ఉండండి...", kn: "ದಯವಿಟ್ಟು ಕಾಯಿರಿ...", ml: "ദയവായി കാത്തിരിക്കുക...", hi: "कृपया प्रतीक्षा करें..." })}</>
              : mode === "login"
                ? `${tr(language, { en: "Sign In", ta: "உள்நுழை", te: "సైన్ ఇన్", kn: "ಸೈನ್ ಇನ್", ml: "സൈൻ ഇൻ", hi: "साइन इन" })} →`
                : tr(language, { en: "Create Account →", ta: "கணக்கை உருவாக்கு →", te: "ఖాతా సృష్టించండి →", kn: "ಖಾತೆ ರಚಿಸಿ →", ml: "അക്കൗണ്ട് സൃഷ്ടിക്കുക →", hi: "खाता बनाएं →" })
            }
          </button>
        </form>

        {/* Demo hint */}
        {mode === "login" && (
          <div style={{ marginTop: 18, padding: 13, background: "var(--accent)", borderRadius: 10, fontSize: 12.5, color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            <strong style={{ color: "var(--primary)" }}>💡 {tr(language, { en: "New here?", ta: "புதியவரா?", te: "కొత్తవారా?", kn: "ಹೊಸಬರೇ?", ml: "പുതിയ ആളാണോ?", hi: "नए हैं?" })}</strong>{" "}
            {tr(language, {
              en: "Click \"Register\" to create a free account with your state and district.",
              ta: "உங்கள் மாநிலம் மற்றும் மாவட்டத்துடன் இலவச கணக்கை உருவாக்க \"பதிவு செய்\" என்பதைக் கிளிக் செய்யவும்.",
              te: "మీ రాష్ట్రం మరియు జిల్లాతో ఉచిత ఖాతా సృష్టించడానికి \"నమోదు\" పై క్లిక్ చేయండి.",
              kn: "ನಿಮ್ಮ ರಾಜ್ಯ ಮತ್ತು ಜಿಲ್ಲೆಯೊಂದಿಗೆ ಉಚಿತ ಖಾತೆ ರಚಿಸಲು \"ನೋಂದಣಿ\" ಕ್ಲಿಕ್ ಮಾಡಿ.",
              ml: "നിങ്ങളുടെ സംസ്ഥാനവും ജില്ലയും ചേർത്ത് സൗജന്യ അക്കൗണ്ട് ഉണ്ടാക്കാൻ \"രജിസ്റ്റർ\" ക്ലിക്ക് ചെയ്യുക.",
              hi: "अपने राज्य और ज़िले के साथ मुफ़्त खाता बनाने के लिए \"रजिस्टर\" पर क्लिक करें।",
            })}
          </div>
        )}

        {/* Features reminder */}
        {mode === "register" && (
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              tr(language, { en: "🌾 Live Prices", ta: "🌾 நேரடி விலைகள்", te: "🌾 ప్రత్యక్ష ధరలు", kn: "🌾 ಲೈವ್ ಬೆಲೆಗಳು", ml: "🌾 തത്സമയ വിലകൾ", hi: "🌾 लाइव कीमतें" }),
              tr(language, { en: "🌦️ Weather", ta: "🌦️ வானிலை", te: "🌦️ వాతావరణం", kn: "🌦️ ಹವಾಮಾನ", ml: "🌦️ കാലാവസ്ഥ", hi: "🌦️ मौसम" }),
              tr(language, { en: "🤖 AI Chatbot", ta: "🤖 AI சாட்பாட்", te: "🤖 AI చాట్‌బాట్", kn: "🤖 AI ಚಾಟ್‌ಬಾಟ್", ml: "🤖 AI ചാറ്റ്ബോട്ട്", hi: "🤖 AI चैटबॉट" }),
              tr(language, { en: "📊 Analytics", ta: "📊 பகுப்பாய்வு", te: "📊 విశ్లేషణలు", kn: "📊 ವಿಶ್ಲೇಷಣೆ", ml: "📊 വിശകലനം", hi: "📊 विश्लेषण" }),
            ].map(f => (
              <div key={f} style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>{f}</div>
            ))}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
          {mode === "login"
            ? tr(language, { en: "No account? ", ta: "கணக்கு இல்லையா? ", te: "ఖాతా లేదా? ", kn: "ಖಾತೆ ಇಲ್ಲವೇ? ", ml: "അക്കൗണ്ട് ഇല്ലേ? ", hi: "खाता नहीं है? " })
            : tr(language, { en: "Already a member? ", ta: "ஏற்கனவே உறுப்பினரா? ", te: "ఇప్పటికే సభ్యులా? ", kn: "ಈಗಾಗಲೇ ಸದಸ್ಯರೇ? ", ml: "ഇതിനകം അംഗമാണോ? ", hi: "पहले से सदस्य हैं? " })}
          <button style={{ color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login"
              ? tr(language, { en: "Create one free", ta: "இலவசமாக உருவாக்கு", te: "ఉచితంగా సృష్టించండి", kn: "ಉಚಿತವಾಗಿ ರಚಿಸಿ", ml: "സൗജന്യമായി ഉണ്ടാക്കുക", hi: "मुफ़्त में बनाएं" })
              : tr(language, { en: "Sign in", ta: "உள்நுழை", te: "సైన్ ఇన్", kn: "ಸೈನ್ ಇನ್", ml: "സൈൻ ഇൻ", hi: "साइन इन" })}
          </button>
        </p>
      </div>
    </div>
  );
}
