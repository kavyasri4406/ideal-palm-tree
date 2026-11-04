"use client";

import { getPmKisanSampleRecord, formatPrice, PM_KISAN_PORTAL_URL } from "@/lib/cropData";
import { useApp, Language } from "@/lib/AppContext";
import { tr } from "@/lib/i18n";

// DEMO ONLY: this app has no access to PM-KISAN beneficiary records, so it never asks for
// Aadhaar / mobile numbers and never shows a "status" for them. Users are sent to the official portal.
const SAMPLE_RECORD = getPmKisanSampleRecord();

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function installmentLabel(n: number, language: Language): string {
  return tr(language, {
    en: `${ordinal(n)} Installment`,
    ta: `${n}-வது தவணை`,
    te: `${n}వ విడత`,
    kn: `${n}ನೇ ಕಂತು`,
    ml: `${n}-ാം ഗഡു`,
    hi: `${n}वीं किस्त`
  });
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Release dates are stored as "19 Nov 2025"; show them in the user's language when possible
function localizeDate(raw: string, language: Language): string {
  if (language === "en") return raw;
  const [d, m, y] = raw.split(" ");
  const monthIdx = SHORT_MONTHS.indexOf(m);
  if (monthIdx < 0 || !d || !y) return raw;
  try {
    return new Date(Number(y), monthIdx, Number(d)).toLocaleDateString(`${language}-IN`, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return raw;
  }
}

const PLACE_NAMES: Record<string, { en: string; ta: string; te: string; kn: string; ml: string; hi: string }> = {
  "Guntur": { en: "Guntur", ta: "குண்டூர்", te: "గుంటూరు", kn: "ಗುಂಟೂರು", ml: "ഗുണ്ടൂർ", hi: "गुंटूर" },
  "Andhra Pradesh": { en: "Andhra Pradesh", ta: "ஆந்திரப் பிரதேசம்", te: "ఆంధ్రప్రదేశ్", kn: "ಆಂಧ್ರ ಪ್ರದೇಶ", ml: "ആന്ധ്രാപ്രദേശ്", hi: "आंध्र प्रदेश" }
};
const placeName = (p: string, language: Language) => (PLACE_NAMES[p] ? tr(language, PLACE_NAMES[p]) : p);

export default function PmKisanTracker() {
  const { language } = useApp();
  const record = SAMPLE_RECORD;

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>🏛️</span>
          <div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              {tr(language, {
                en: "PM-KISAN Samman Nidhi Installment Tracker",
                ta: "PM-KISAN சம்மான் நிதி தவணை விவரம்",
                te: "PM-KISAN సమ్మాన్ నిధి విడతల వివరాలు",
                kn: "PM-KISAN ಸಮ್ಮಾನ್ ನಿಧಿ ಕಂತುಗಳ ಮಾಹಿತಿ",
                ml: "PM-KISAN സമ്മാൻ നിധി ഗഡു വിവരങ്ങൾ",
                hi: "PM-KISAN सम्मान निधि किस्त ट्रैकर"
              })}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {tr(language, {
                en: "₹6,000 per year paid as three ₹2,000 direct benefit transfers — see how it works & check your real status on the official portal",
                ta: "ஆண்டுக்கு ₹6,000 — மூன்று தவணைகளாக ₹2,000 நேரடியாக வங்கிக் கணக்கில் வரும். இது எப்படி செயல்படுகிறது என்று பாருங்கள், உங்கள் உண்மையான நிலையை அதிகாரப்பூர்வ இணையதளத்தில் சரிபாருங்கள்",
                te: "సంవత్సరానికి ₹6,000 — మూడు విడతలుగా ₹2,000 నేరుగా బ్యాంకు ఖాతాలో జమ అవుతుంది. ఇది ఎలా పనిచేస్తుందో చూడండి, మీ అసలు స్థితిని అధికారిక పోర్టల్‌లో తనిఖీ చేయండి",
                kn: "ವರ್ಷಕ್ಕೆ ₹6,000 — ಮೂರು ಕಂತುಗಳಲ್ಲಿ ₹2,000 ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಬರುತ್ತದೆ. ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ನೋಡಿ, ನಿಮ್ಮ ನಿಜವಾದ ಸ್ಥಿತಿಯನ್ನು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ",
                ml: "വർഷം ₹6,000 — മൂന്ന് ഗഡുക്കളായി ₹2,000 വീതം നേരിട്ട് ബാങ്ക് അക്കൗണ്ടിലേക്ക്. ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് കാണുക, നിങ്ങളുടെ യഥാർത്ഥ നില ഔദ്യോഗിക പോർട്ടലിൽ പരിശോധിക്കുക",
                hi: "हर साल ₹6,000 — ₹2,000 की तीन किस्तों में सीधे बैंक खाते में। देखें यह कैसे काम करता है और अपनी असली स्थिति आधिकारिक पोर्टल पर जांचें"
              })}
            </p>
          </div>
        </div>

        {/* Demo data disclaimer */}
        <div
          role="note"
          style={{
            background: "#FEF3C7",
            border: "1px solid #F59E0B",
            color: "#78350F",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 13,
            lineHeight: 1.5,
            marginBottom: 14
          }}
        >
          <strong>⚠️ {tr(language, { en: "Demo data", ta: "மாதிரி தரவு", te: "నమూనా సమాచారం", kn: "ಮಾದರಿ ಮಾಹಿತಿ", ml: "മാതൃകാ വിവരങ്ങൾ", hi: "डेमो डेटा" })}</strong>{" "}
          — {tr(language, {
            en: "this app cannot look up real beneficiary records. Check your real status at",
            ta: "இந்த செயலியால் உண்மையான பயனாளி விவரங்களைப் பார்க்க முடியாது. உங்கள் உண்மையான நிலையை இங்கே சரிபாருங்கள்:",
            te: "ఈ యాప్ అసలు లబ్ధిదారుల వివరాలను చూడలేదు. మీ అసలు స్థితిని ఇక్కడ తనిఖీ చేయండి:",
            kn: "ಈ ಆ್ಯಪ್ ನಿಜವಾದ ಫಲಾನುಭವಿ ದಾಖಲೆಗಳನ್ನು ನೋಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ನಿಜವಾದ ಸ್ಥಿತಿಯನ್ನು ಇಲ್ಲಿ ಪರಿಶೀಲಿಸಿ:",
            ml: "ഈ ആപ്പിന് യഥാർത്ഥ ഗുണഭോക്തൃ രേഖകൾ നോക്കാൻ കഴിയില്ല. നിങ്ങളുടെ യഥാർത്ഥ നില ഇവിടെ പരിശോധിക്കുക:",
            hi: "यह ऐप असली लाभार्थी रिकॉर्ड नहीं देख सकता। अपनी असली स्थिति यहां जांचें:"
          })}{" "}
          <a
            href={PM_KISAN_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#92400E", fontWeight: 700, textDecoration: "underline" }}
          >
            pmkisan.gov.in
          </a>
          {" "}({tr(language, {
            en: "Farmers Corner → Know Your Status",
            ta: "Farmers Corner (விவசாயிகள் பகுதி) → Know Your Status (உங்கள் நிலையை அறிக)",
            te: "Farmers Corner (రైతుల విభాగం) → Know Your Status (మీ స్థితి తెలుసుకోండి)",
            kn: "Farmers Corner (ರೈತರ ವಿಭಾಗ) → Know Your Status (ನಿಮ್ಮ ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ)",
            ml: "Farmers Corner (കർഷക വിഭാഗം) → Know Your Status (നിങ്ങളുടെ നില അറിയുക)",
            hi: "Farmers Corner (किसान कॉर्नर) → Know Your Status (अपनी स्थिति जानें)"
          })}).
        </div>

        <a
          href={PM_KISAN_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          🔍 {tr(language, {
            en: "Check My Status on pmkisan.gov.in",
            ta: "pmkisan.gov.in-இல் என் நிலையைச் சரிபார்",
            te: "pmkisan.gov.inలో నా స్థితి చూడండి",
            kn: "pmkisan.gov.in ನಲ್ಲಿ ನನ್ನ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
            ml: "pmkisan.gov.in-ൽ എന്റെ നില പരിശോധിക്കുക",
            hi: "pmkisan.gov.in पर मेरी स्थिति देखें"
          })} ↗
        </a>
      </div>

      {/* Sample record & requirements checklist */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        boxShadow: "var(--shadow-card)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
              👤 {record.beneficiaryName === "Sample Farmer (Demo)"
                ? tr(language, { en: record.beneficiaryName, ta: "மாதிரி விவசாயி (டெமோ)", te: "నమూనా రైతు (డెమో)", kn: "ಮಾದರಿ ರೈತ (ಡೆಮೊ)", ml: "മാതൃകാ കർഷകൻ (ഡെമോ)", hi: "नमूना किसान (डेमो)" })
                : record.beneficiaryName}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
              {tr(language, { en: "Example only", ta: "உதாரணம் மட்டும்", te: "ఉదాహరణ మాత్రమే", kn: "ಉದಾಹರಣೆ ಮಾತ್ರ", ml: "ഉദാഹരണം മാത്രം", hi: "केवल उदाहरण" })} · {placeName(record.district, language)}, {placeName(record.state, language)}
            </div>
          </div>

          <div className="badge badge-yellow" style={{ padding: "6px 14px", fontSize: 13 }}>
            {tr(language, { en: "Sample record", ta: "மாதிரி பதிவு", te: "నమూనా రికార్డు", kn: "ಮಾದರಿ ದಾಖಲೆ", ml: "മാതൃകാ രേഖ", hi: "नमूना रिकॉर्ड" })}
          </div>
        </div>

        {/* Requirements checklist (what must be complete to receive installments) */}
        <div style={{ paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
            {tr(language, {
              en: "To receive installments, all of these must be complete (verify each on the portal):",
              ta: "தவணைகளைப் பெற இவை அனைத்தும் முடிந்திருக்க வேண்டும் (ஒவ்வொன்றையும் இணையதளத்தில் சரிபாருங்கள்):",
              te: "విడతలు అందాలంటే ఇవన్నీ పూర్తై ఉండాలి (ప్రతి దాన్ని పోర్టల్‌లో తనిఖీ చేయండి):",
              kn: "ಕಂತುಗಳನ್ನು ಪಡೆಯಲು ಇವೆಲ್ಲವೂ ಪೂರ್ಣಗೊಂಡಿರಬೇಕು (ಪ್ರತಿಯೊಂದನ್ನೂ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ):",
              ml: "ഗഡുക്കൾ ലഭിക്കാൻ ഇവയെല്ലാം പൂർത്തിയായിരിക്കണം (ഓരോന്നും പോർട്ടലിൽ പരിശോധിക്കുക):",
              hi: "किस्त पाने के लिए ये सभी पूरे होने चाहिए (हर एक को पोर्टल पर जांचें):"
            })}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>
              <span>☑️</span>
              <span>{tr(language, { en: "e-KYC completed", ta: "e-KYC முடிந்தது", te: "e-KYC పూర్తయింది", kn: "e-KYC ಪೂರ್ಣಗೊಂಡಿದೆ", ml: "e-KYC പൂർത്തിയായി", hi: "e-KYC पूरा हुआ" })}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>
              <span>☑️</span>
              <span>{tr(language, {
                en: "Aadhaar seeded with bank account (DBT enabled)",
                ta: "வங்கிக் கணக்குடன் ஆதார் இணைப்பு (DBT இயக்கப்பட்டது)",
                te: "బ్యాంకు ఖాతాకు ఆధార్ అనుసంధానం (DBT ప్రారంభించబడింది)",
                kn: "ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಜೋಡಣೆ (DBT ಸಕ್ರಿಯ)",
                ml: "ബാങ്ക് അക്കൗണ്ടുമായി ആധാർ ബന്ധിപ്പിച്ചു (DBT സജീവം)",
                hi: "बैंक खाते से आधार जुड़ा हुआ (DBT चालू)"
              })}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>
              <span>☑️</span>
              <span>{tr(language, { en: "Land records seeded", ta: "நிலப் பதிவுகள் இணைக்கப்பட்டன", te: "భూమి రికార్డులు అనుసంధానమయ్యాయి", kn: "ಭೂ ದಾಖಲೆಗಳು ಜೋಡಣೆಯಾಗಿವೆ", ml: "ഭൂരേഖകൾ ബന്ധിപ്പിച്ചു", hi: "भूमि रिकॉर्ड जुड़े हुए" })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Installment Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(196,150,75,0.12) 0%, rgba(92,122,62,0.12) 100%)",
        border: "1px solid var(--secondary)",
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>
              {tr(language, { en: "Next Installment", ta: "அடுத்த தவணை", te: "తదుపరి విడత", kn: "ಮುಂದಿನ ಕಂತು", ml: "അടുത്ത ഗഡു", hi: "अगली किस्त" })}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>
              {tr(language, {
                en: "Release dates are announced by the Government — check",
                ta: "வெளியீட்டு தேதிகளை அரசு அறிவிக்கும் — சரிபாருங்கள்:",
                te: "విడుదల తేదీలను ప్రభుత్వం ప్రకటిస్తుంది — చూడండి:",
                kn: "ಬಿಡುಗಡೆ ದಿನಾಂಕಗಳನ್ನು ಸರ್ಕಾರ ಪ್ರಕಟಿಸುತ್ತದೆ — ಪರಿಶೀಲಿಸಿ:",
                ml: "റിലീസ് തീയതികൾ സർക്കാർ പ്രഖ്യാപിക്കും — പരിശോധിക്കുക:",
                hi: "किस्त की तारीख सरकार घोषित करती है — देखें:"
              })}{" "}
              <a href={PM_KISAN_PORTAL_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-dark)", textDecoration: "underline" }}>
                pmkisan.gov.in
              </a>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary-dark)" }}>
          ₹2,000 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
            {tr(language, {
              en: "per installment (3 per year)",
              ta: "ஒரு தவணைக்கு (ஆண்டுக்கு 3)",
              te: "ఒక్కో విడతకు (సంవత్సరానికి 3)",
              kn: "ಪ್ರತಿ ಕಂತಿಗೆ (ವರ್ಷಕ್ಕೆ 3)",
              ml: "ഓരോ ഗഡുവിനും (വർഷം 3)",
              hi: "प्रति किस्त (साल में 3)"
            })}
          </span>
        </div>
      </div>

      {/* Past nationwide releases (reference) */}
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text)" }}>
        📜 {tr(language, {
          en: "Past Installment Release Dates (nationwide, for reference)",
          ta: "முந்தைய தவணை வெளியீட்டு தேதிகள் (நாடு முழுவதும், குறிப்புக்கு)",
          te: "గత విడతల విడుదల తేదీలు (దేశవ్యాప్తంగా, సమాచారం కోసం)",
          kn: "ಹಿಂದಿನ ಕಂತುಗಳ ಬಿಡುಗಡೆ ದಿನಾಂಕಗಳು (ದೇಶಾದ್ಯಂತ, ಮಾಹಿತಿಗಾಗಿ)",
          ml: "മുൻ ഗഡുക്കളുടെ റിലീസ് തീയതികൾ (രാജ്യവ്യാപകം, അറിവിനായി)",
          hi: "पिछली किस्तों की जारी तिथियां (देशभर, जानकारी के लिए)"
        })}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        {tr(language, {
          en: "Newer installments may have been released since. Whether and when money reached your account is shown only on the official portal.",
          ta: "இதற்குப் பிறகு புதிய தவணைகள் வெளியாகியிருக்கலாம். பணம் உங்கள் கணக்கில் வந்ததா, எப்போது வந்தது என்பது அதிகாரப்பூர்வ இணையதளத்தில் மட்டுமே தெரியும்.",
          te: "ఆ తర్వాత కొత్త విడతలు విడుదలై ఉండవచ్చు. డబ్బు మీ ఖాతాలో జమ అయిందా, ఎప్పుడు అయిందో అధికారిక పోర్టల్‌లో మాత్రమే తెలుస్తుంది.",
          kn: "ಇದರ ನಂತರ ಹೊಸ ಕಂತುಗಳು ಬಿಡುಗಡೆಯಾಗಿರಬಹುದು. ಹಣ ನಿಮ್ಮ ಖಾತೆಗೆ ಬಂದಿದೆಯೇ, ಯಾವಾಗ ಬಂತು ಎಂಬುದು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಮಾತ್ರ ಕಾಣುತ್ತದೆ.",
          ml: "ഇതിനുശേഷം പുതിയ ഗഡുക്കൾ വന്നിട്ടുണ്ടാകാം. പണം നിങ്ങളുടെ അക്കൗണ്ടിൽ എത്തിയോ, എപ്പോൾ എത്തി എന്നത് ഔദ്യോഗിക പോർട്ടലിൽ മാത്രമേ കാണൂ.",
          hi: "इसके बाद नई किस्तें जारी हो चुकी हो सकती हैं। पैसा आपके खाते में आया या नहीं और कब आया, यह केवल आधिकारिक पोर्टल पर दिखता है।"
        })}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{tr(language, { en: "Installment No.", ta: "தவணை எண்", te: "విడత సంఖ్య", kn: "ಕಂತು ಸಂಖ್ಯೆ", ml: "ഗഡു നമ്പർ", hi: "किस्त संख्या" })}</th>
              <th>{tr(language, { en: "Amount", ta: "தொகை", te: "మొత్తం", kn: "ಮೊತ್ತ", ml: "തുക", hi: "राशि" })}</th>
              <th>{tr(language, { en: "Nationwide Release Date", ta: "நாடு முழுவதும் வெளியான தேதி", te: "దేశవ్యాప్త విడుదల తేదీ", kn: "ದೇಶಾದ್ಯಂತ ಬಿಡುಗಡೆ ದಿನಾಂಕ", ml: "രാജ്യവ്യാപക റിലീസ് തീയതി", hi: "देशभर में जारी तिथि" })}</th>
            </tr>
          </thead>
          <tbody>
            {record.installments.map(ins => (
              <tr key={ins.number}>
                <td>
                  <strong style={{ color: "var(--primary-dark)" }}>{installmentLabel(ins.number, language)}</strong>
                </td>
                <td>
                  <strong style={{ color: "#15803D", fontSize: 14 }}>{formatPrice(ins.amount)}</strong>
                </td>
                <td style={{ fontSize: 13, color: "var(--text)" }}>{localizeDate(ins.releaseDate, language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
