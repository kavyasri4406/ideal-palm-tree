"use client";
import DocumentOcr from "@/components/DocumentOcr";
import { useApp } from "@/lib/AppContext";
import { tr } from "@/lib/i18n";

export default function DocumentsPage() {
  const { language } = useApp();
  return (
    <div className="page-content">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 26,
            fontWeight: 800,
            color: "var(--text)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            📄 {tr(language, { en: "Document Scanner", ta: "ஆவண ஸ்கேனர்", te: "డాక్యుమెంట్ స్కానర్", kn: "ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್", ml: "രേഖ സ്കാനർ", hi: "दस्तावेज़ स्कैनर" })}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            {tr(language, {
              en: "Upload government letters, scheme documents, or notices — get a plain-language summary in your language.",
              ta: "அரசு கடிதங்கள், திட்ட ஆவணங்கள் அல்லது அறிவிப்புகளைப் பதிவேற்றுங்கள் — உங்கள் மொழியில் எளிய சுருக்கத்தைப் பெறுங்கள்.",
              te: "ప్రభుత్వ లేఖలు, పథకం పత్రాలు లేదా నోటీసులను అప్‌లోడ్ చేయండి — మీ భాషలో సులభమైన సారాంశం పొందండి.",
              kn: "ಸರ್ಕಾರಿ ಪತ್ರಗಳು, ಯೋಜನೆ ದಾಖಲೆಗಳು ಅಥವಾ ಸೂಚನೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸರಳ ಸಾರಾಂಶ ಪಡೆಯಿರಿ.",
              ml: "സർക്കാർ കത്തുകൾ, പദ്ധതി രേഖകൾ അല്ലെങ്കിൽ അറിയിപ്പുകൾ അപ്‌ലോഡ് ചെയ്യുക — നിങ്ങളുടെ ഭാഷയിൽ ലളിതമായ സംഗ്രഹം നേടുക.",
              hi: "सरकारी पत्र, योजना दस्तावेज़ या नोटिस अपलोड करें — अपनी भाषा में आसान सारांश पाएं।",
            })}
          </p>
        </div>
        <DocumentOcr />
      </div>
    </div>
  );
}
