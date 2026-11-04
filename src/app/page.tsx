"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";
import NotificationManager from "@/components/NotificationManager";

const LABELS = {
  en: {
    namaste: "Namaste",
    welcome: "Welcome to AgriPredict",
    intro: "Your AI-powered agricultural companion. AgriPredict helps you track live market prices, analyze historical price trends, receive local weather forecasts, and consult our multilingual AI farming expert.",
    cropsTitle: "Live Crop Prices",
    cropsDesc: "Browse real-time prices for cereals, vegetables, pulses, and fruits with category-specific filters.",
    chatbotTitle: "AgriBot",
    chatbotDesc: "Chat with AgriBot in English, Tamil, Telugu, Kannada, Malayalam, or Hindi for farming advice, crop choices & market guidelines.",
    analyticsTitle: "Market Analytics",
    analyticsDesc: "Check 30-day forecast curves and price volatility indexes to make informed harvesting decisions.",
    portfolioTitle: "My Tracked Crops",
    portfolioDesc: "Access and manage your personalized portfolio of tracked crops to monitor their value change.",
    getStarted: "Explore Live Prices →",
    exploreTag: "EXPLORE →",
    consultTag: "CONSULT →",
    analyzeTag: "ANALYZE →",
    manageTag: "MANAGE →"
  },
  ta: {
    namaste: "நமஸ்தே",
    welcome: "அக்ரிபிரடிக்ட்-இற்க்கு வரவேற்கிறோம்",
    intro: "உங்கள் AI-இயங்கும் விவசாய துணை. அக்ரிபிரடிக்ட் உங்களுக்கு நேரடி சந்தை விலைகளை கண்காணிக்கவும், வரலாற்று விலை போக்குகளை பகுப்பாய்வு செய்யவும், உள்ளூர் வானிலை முன்னறிவிப்புகளை பெறவும் மற்றும் எங்கள் பன்மொழி AI விவசாய நிபுணரிடம் ஆலோசனை பெறவும் உதவுகிறது.",
    cropsTitle: "நேரடி பயிர் விலைகள்",
    cropsDesc: "வகை சார்ந்த வடிகட்டிகளுடன் தானியங்கள், காய்கறிகள், பருப்புகள் மற்றும் பழங்களின் நிகழ்நேர விலைகளை உலாவுக.",
    chatbotTitle: "AgriBot",
    chatbotDesc: "பூச்சிக் கட்டுப்பாடு, விவசாய ஆலோசனை மற்றும் சந்தை வழிகாட்டுதல்கள் பற்றி ஆங்கிலம், தமிழ், தெலுங்கு, கன்னடம், மலையாளம் அல்லது இந்தியில் கேளுங்கள்.",
    analyticsTitle: "சந்தை பகுப்பாய்வு",
    analyticsDesc: "விவேகமான அறுவடை முடிவுகளை எடுக்க 30 நாள் கணிப்பு வளைவுகள் மற்றும் விலை ஏற்ற இறக்க குறியீடுகளை சரிபார்க்கவும்.",
    portfolioTitle: "என் பயிர்கள்",
    portfolioDesc: "உங்கள் கண்காணிக்கப்படும் பயிர்களின் மதிப்பு மாற்றத்தை கண்காணிக்க உங்கள் தனிப்பயனாக்கப்பட்ட போர்ட்ஃபோலியோவை நிர்வகிக்கவும்.",
    getStarted: "நேரடி விலைகளை ஆராய்க →",
    exploreTag: "ஆராய்க →",
    consultTag: "ஆலோசிக்க →",
    analyzeTag: "பகுப்பாய்வு →",
    manageTag: "நிர்வகிக்க →"
  },
  te: {
    namaste: "నమస్తే",
    welcome: "అగ్రిప్రెడిక్ట్ కు స్వాగతం",
    intro: "మీ AI-ఆధారిత వ్యవసాయ సహాయకారి. అగ్రిప్రెడిక్ట్ మీకు ప్రత్యక్ష మార్కెట్ ధరలను ట్రాక్ చేయడంలో, చారిత్రక ధరల పోకడలను విశ్లేషించడంలో, స్థానిక వాతావరణ అంచనాలను పొందడంలో మరియు మా బహుభాషా AI వ్యవసాయ నిపుణుడిని సంప్రదించడంలో సహాయపడుతుంది.",
    cropsTitle: "ప్రత్యక్ష పంట ధరలు",
    cropsDesc: "వర్గాల వారీగా ఫిల్టర్లతో తృణధాన్యాలు, కూరగాయలు, పప్పుధాన్యాలు మరియు పండ్ల నిజ సమయ ధరలను బ్రౌజ్ చేయండి.",
    chatbotTitle: "AgriBot",
    chatbotDesc: "తెగుళ్ల నివారణ, వ్యవసాయ సలహాలు మరియు మార్కెట్ మార్గదర్శకాల గురించి ఇంగ్లీష్, తమిళం, తెలుగు, కన్నడ, మలయాళం లేదా హిందీలో చాట్ చేయండి.",
    analyticsTitle: "మార్కెట్ విశ్లేషణలు",
    analyticsDesc: "సమర్థవంతమైన పంట కోత నిర్ణయాలు తీసుకోవడానికి 30 రోజుల ధరల అంచనా వక్రతలను మరియు ధరల హెచ్చుతగ్గుల సూచికలను తనిఖీ చేయండి.",
    portfolioTitle: "నా పంటలు",
    portfolioDesc: "మీరు ట్రాక్ చేసిన పంటల విలువ మార్పులను పర్యవేక్షించడానికి మీ వ్యక్తిగతీకరించిన పోర్ట్‌ఫోలియోను నిర్వహించండి.",
    getStarted: "ధరలను వీక్షించండి →",
    exploreTag: "చూడండి →",
    consultTag: "సంప్రదించండి →",
    analyzeTag: "విశ్లేషించండి →",
    manageTag: "నిర్వహించండి →"
  },
  kn: {
    namaste: "ನಮಸ್ಕಾರ",
    welcome: "ಅಗ್ರಿಪ್ರೆಡಿಕ್ಟ್‌ಗೆ ಸ್ವಾಗತ",
    intro: "ನಿಮ್ಮ AI-ಚಾಲಿತ ಕೃಷಿ ಸಂಗಾತಿ. ಅಗ್ರಿಪ್ರೆಡಿಕ್ಟ್ ನಿಮಗೆ ಲೈವ್ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ಬೆಲೆ ಟ್ರೆಂಡ್‌ಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲು, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಗಳನ್ನು ಪಡೆಯಲು ಮತ್ತು AI ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    cropsTitle: "ಲೈವ್ ಬೆಳೆ ಬೆಲೆಗಳು",
    cropsDesc: "ಧಾನ್ಯಗಳು, ತರಕಾರಿಗಳು, ಬೇಳೆಕಾಳುಗಳು ಮತ್ತು ಹಣ್ಣುಗಳ ನೈಜ-ಸಮಯದ ಬೆಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.",
    chatbotTitle: "AI ಕೃಷಿ ಬಾಟ್",
    chatbotDesc: "ಕೀಟ ನಿಯಂತ್ರಣ, ಕೃಷಿ ಸಲಹೆಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾರ್ಗಸೂಚಿಗಳ ಕುರಿತು ಎಲ್ಲಾ ಭಾಷೆಗಳಲ್ಲಿ ಚಾಟ್ ಮಾಡಿ.",
    analyticsTitle: "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ",
    analyticsDesc: "ಸುಲಭವಾಗಿ ಕಟಾವು ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು 30 ದಿನಗಳ ಬೆಲೆ ಮುನ್ಸೂಚನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.",
    portfolioTitle: "ನನ್ನ ಬೆಳೆಗಳು",
    portfolioDesc: "ನಿಮ್ಮ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾದ ಬೆಳೆಗಳ ಮೌಲ್ಯ ಬದಲಾವಣೆಯನ್ನು ವೀಕ್ಷಿಸಿ.",
    getStarted: "ಲೈವ್ ಬೆಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ →",
    exploreTag: "ನೋಡಿ →",
    consultTag: "ಸಲಹೆ ಪಡೆಯಿರಿ →",
    analyzeTag: "ವಿಶ್ಲೇಷಿಸಿ →",
    manageTag: "ನಿರ್ವಹಿಸಿ →"
  },
  ml: {
    namaste: "നമസ്കാരം",
    welcome: "അഗ്രിപ്രെഡിക്റ്റിലേക്ക് സ്വാഗതം",
    intro: "നിങ്ങളുടെ AI-അധിഷ്ഠിത കാർഷിക സഹായി. തത്സമയ വിപണി വിലകൾ, കാലാവസ്ഥ മുന്നറിയിപ്പുകൾ, കാർഷിക ഉപദേശങ്ങൾ എന്നിവ ലഭ്യമാക്കുന്നു.",
    cropsTitle: "തത്സമയ വിള വിലകൾ",
    cropsDesc: "ധാന്യങ്ങൾ, പച്ചക്കറികൾ, പഴങ്ങൾ എന്നിവയുടെ തത്സമയ വിലകൾ പരിശോധിക്കുക.",
    chatbotTitle: "AI കാർഷിക ബോട്ട്",
    chatbotDesc: "കീട നിയന്ത്രണം, കാർഷിക ഉപദേശങ്ങൾ എന്നിവയ്ക്കായി ചോദിക്കൂ.",
    analyticsTitle: "വിപണി വിശകലനം",
    analyticsDesc: "30 ദിവസത്തെ വില പ്രവചനങ്ങൾ പരിശോധിക്കുക.",
    portfolioTitle: "എന്റെ വിളകൾ",
    portfolioDesc: "നിങ്ങളുടെ വിളകളുടെ വിവരങ്ങൾ കൈകാര്യം ചെയ്യുക.",
    getStarted: "വിലകൾ പരിശോധിക്കുക →",
    exploreTag: "കാണുക →",
    consultTag: "ചോദിക്കുക →",
    analyzeTag: "വിശകലനം →",
    manageTag: "നിയന്ത്രിക്കുക →"
  },
  hi: {
    namaste: "नमस्ते",
    welcome: "AgriPredict में आपका स्वागत है",
    intro: "आपका एआई-संचालित कृषि साथी। AgriPredict आपको लाइव बाज़ार मूल्य ट्रैक करने, मूल्य रुझानों का विश्लेषण करने, स्थानीय मौसम पूर्वानुमान प्राप्त करने और हमारे बहुभाषी एआई कृषि विशेषज्ञ से परामर्श करने में मदद करता है।",
    cropsTitle: "लाइव फसल कीमतें",
    cropsDesc: "अनाज, सब्जियों, दालों और फलों की वास्तविक समय की कीमतें देखें।",
    chatbotTitle: "एआई कृषि बॉट",
    chatbotDesc: "कीट नियंत्रण, कृषि सलाह और बाज़ार दिशानिर्देशों के बारे में अपनी भाषा में पूछें।",
    analyticsTitle: "बाज़ार विश्लेषण",
    analyticsDesc: "कटाई के सटीक निर्णय लेने के लिए 30-दिवसीय मूल्य पूर्वानुमान देखें।",
    portfolioTitle: "मेरी ट्रैक की गई फसलें",
    portfolioDesc: "अपनी चुनी हुई फसलों के मूल्य परिवर्तन की निगरानी करें।",
    getStarted: "लाइव कीमतें देखें →",
    exploreTag: "देखें →",
    consultTag: "सलाह लें →",
    analyzeTag: "विश्लेषण करें →",
    manageTag: "प्रबंधित करें →"
  }
};

export default function DashboardIntroPage() {
  const router = useRouter();
  const { language } = useApp();
  // Client-only page (ClientLayout mounts children after hydration), so reading localStorage here is safe.
  const [user] = useState(getCurrentUser);
  const L = LABELS[language as keyof typeof LABELS] || LABELS.en;

  useEffect(() => {
    ["/crops", "/my-crops", "/analytics", "/schemes", "/tools", "/chatbot", "/documents", "/settings"].forEach(path => {
      try { router.prefetch(path); } catch {}
    });
  }, [router]);

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "10px 0" }}>
      {/* Welcome Hero Panel */}
      <div className="card" style={{
        background: "linear-gradient(135deg, var(--bg-card) 0%, var(--accent) 100%)",
        border: "1px solid var(--border)",
        padding: "40px 32px",
        borderRadius: "24px",
        marginBottom: "28px",
        boxShadow: "var(--shadow)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🌾</div>
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "32px",
            fontWeight: 800,
            color: "var(--primary-dark)",
            marginBottom: "12px",
            lineHeight: 1.25
          }}>
            {L.namaste}{user ? `, ${user.name}` : ""}! 🙏
          </h1>
          <h2 style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: "16px"
          }}>
            {L.welcome}
          </h2>
          <p style={{
            fontSize: "14.5px",
            color: "var(--text-muted)",
            lineHeight: 1.8,
            maxWidth: 680,
            marginBottom: "24px"
          }}>
            {L.intro}
          </p>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button id="btn-explore-crops" className="btn btn-primary btn-lg" onClick={() => router.push("/crops")}>
              {L.getStarted}
            </button>
            <NotificationManager />
          </div>
        </div>
        
        {/* Subtle decorative background wheat graphics */}
        <div style={{
          position: "absolute",
          right: "-30px",
          bottom: "-40px",
          fontSize: "150px",
          opacity: 0.08,
          transform: "rotate(-15deg)",
          userSelect: "none",
          pointerEvents: "none"
        }}>
          🌾
        </div>
      </div>

      {/* Grid of Navigation Quick-Start Cards */}
      <div className="grid-cols-2-responsive" style={{ gap: "18px" }}>
        
        {/* Prices card */}
        <div className="crop-card" style={{ cursor: "pointer" }} onClick={() => router.push("/crops")}>
          <div className="crop-card-body" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ fontSize: "28px", background: "var(--accent)", width: "50px", height: "50px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                💰
              </div>
              <span style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 700 }}>{L.exploreTag}</span>
            </div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
              {L.cropsTitle}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {L.cropsDesc}
            </p>
          </div>
        </div>

        {/* AI Chatbot card */}
        <div className="crop-card" style={{ cursor: "pointer" }} onClick={() => router.push("/chatbot")}>
          <div className="crop-card-body" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ fontSize: "28px", background: "var(--accent)", width: "50px", height: "50px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                🤖
              </div>
              <span style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 700 }}>{L.consultTag}</span>
            </div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
              {L.chatbotTitle}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {L.chatbotDesc}
            </p>
          </div>
        </div>

        {/* Analytics card */}
        <div className="crop-card" style={{ cursor: "pointer" }} onClick={() => router.push("/analytics")}>
          <div className="crop-card-body" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ fontSize: "28px", background: "var(--accent)", width: "50px", height: "50px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                📊
              </div>
              <span style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 700 }}>{L.analyzeTag}</span>
            </div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
              {L.analyticsTitle}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {L.analyticsDesc}
            </p>
          </div>
        </div>

        {/* Portfolio card */}
        <div className="crop-card" style={{ cursor: "pointer" }} onClick={() => router.push("/my-crops")}>
          <div className="crop-card-body" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ fontSize: "28px", background: "var(--accent)", width: "50px", height: "50px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ⭐
              </div>
              <span style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 700 }}>{L.manageTag}</span>
            </div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
              {L.portfolioTitle}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {L.portfolioDesc}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
