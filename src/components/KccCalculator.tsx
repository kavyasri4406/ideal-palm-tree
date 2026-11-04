"use client";

import { useState } from "react";
import { CROPS, calculateKccLoan, formatPrice, KCC_ASSUMED_RATE_ABOVE_CAP } from "@/lib/cropData";
import { useApp, Language } from "@/lib/AppContext";
import { tr, cropName, Localized } from "@/lib/i18n";

const MIN_ACRES = 0.5;
const MAX_ACRES = 50;

function parseAcres(raw: string): number {
  const v = parseFloat(raw);
  if (!Number.isFinite(v)) return MIN_ACRES;
  return Math.min(MAX_ACRES, Math.max(MIN_ACRES, v));
}

const SEASONS: Record<string, Localized> = {
  Kharif: { en: "Kharif", ta: "கரீஃப்", te: "ఖరీఫ్", kn: "ಮುಂಗಾರು", ml: "ഖരീഫ്", hi: "खरीफ" },
  Rabi: { en: "Rabi", ta: "ரபி", te: "రబీ", kn: "ಹಿಂಗಾರು", ml: "റാബി", hi: "रबी" },
  Zaid: { en: "Zaid", ta: "ஜைத்", te: "జాయిద్", kn: "ಜಾಯಿದ್", ml: "സായിദ്", hi: "जायद" },
  Annual: { en: "Annual", ta: "ஆண்டு முழுவதும்", te: "వార్షిక", kn: "ವಾರ್ಷಿಕ", ml: "വാർഷികം", hi: "वार्षिक" },
  Summer: { en: "Summer", ta: "கோடை", te: "వేసవి", kn: "ಬೇಸಿಗೆ", ml: "വേനൽ", hi: "गर्मी" }
};

const seasonName = (season: string, language: Language) =>
  season.split("/").map(s => (SEASONS[s] ? tr(language, SEASONS[s]) : s)).join("/");

export default function KccCalculator() {
  const { language } = useApp();
  const [cropId, setCropId] = useState<string>("rice");
  // Keep the raw text so users can clear the field / type "0.5"; clamp only for calculation and on blur.
  const [acresInput, setAcresInput] = useState<string>("3");
  const acres = parseAcres(acresInput);

  const loan = calculateKccLoan(cropId, acres);
  const exceedsCap = loan.amountAboveCap > 0;

  const acresWord = tr(language, { en: "Acres", ta: "ஏக்கர்", te: "ఎకరాలు", kn: "ಎಕರೆ", ml: "ഏക്കർ", hi: "एकड़" });
  const perYear = tr(language, { en: "/ year", ta: "/ ஆண்டு", te: "/ సంవత్సరం", kn: "/ ವರ್ಷ", ml: "/ വർഷം", hi: "/ साल" });

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>💳</span>
          <div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              {tr(language, {
                en: "Kisan Credit Card (KCC) Loan & EMI Calculator",
                ta: "கிசான் கிரெடிட் கார்டு (KCC) கடன் & EMI கணக்கீடு",
                te: "కిసాన్ క్రెడిట్ కార్డ్ (KCC) రుణం & EMI లెక్కింపు",
                kn: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಸಾಲ & EMI ಲೆಕ್ಕಾಚಾರ",
                ml: "കിസാൻ ക്രെഡിറ്റ് കാർഡ് (KCC) വായ്പ & EMI കണക്കുകൂട്ടൽ",
                hi: "किसान क्रेडिट कार्ड (KCC) लोन और EMI कैलकुलेटर"
              })}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {tr(language, {
                en: "Estimate your crop credit limit & interest: 4% effective p.a. on the first ₹3 lakh when repaid within 12 months",
                ta: "உங்கள் பயிர்க் கடன் வரம்பு & வட்டியைக் கணக்கிடுங்கள்: 12 மாதங்களுக்குள் திருப்பிச் செலுத்தினால் முதல் ₹3 லட்சத்திற்கு ஆண்டுக்கு 4% மட்டுமே",
                te: "మీ పంట రుణ పరిమితి & వడ్డీ లెక్కించండి: 12 నెలల్లో తిరిగి చెల్లిస్తే మొదటి ₹3 లక్షలపై సంవత్సరానికి 4% మాత్రమే",
                kn: "ನಿಮ್ಮ ಬೆಳೆ ಸಾಲ ಮಿತಿ & ಬಡ್ಡಿ ಲೆಕ್ಕ ಹಾಕಿ: 12 ತಿಂಗಳೊಳಗೆ ಮರುಪಾವತಿಸಿದರೆ ಮೊದಲ ₹3 ಲಕ್ಷಕ್ಕೆ ವರ್ಷಕ್ಕೆ 4% ಮಾತ್ರ",
                ml: "നിങ്ങളുടെ വിള വായ്പാ പരിധിയും പലിശയും കണക്കാക്കുക: 12 മാസത്തിനുള്ളിൽ തിരിച്ചടച്ചാൽ ആദ്യ ₹3 ലക്ഷത്തിന് വർഷം 4% മാത്രം",
                hi: "अपनी फसल ऋण सीमा और ब्याज जानें: 12 महीने में चुकाने पर पहले ₹3 लाख पर सालाना सिर्फ 4%"
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid-cols-2-responsive" style={{ gap: 16, marginBottom: 22 }}>
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
            🌾 {tr(language, { en: "Select Primary Crop", ta: "முக்கிய பயிரைத் தேர்ந்தெடுக்கவும்", te: "ప్రధాన పంటను ఎంచుకోండి", kn: "ಮುಖ್ಯ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", ml: "പ്രധാന വിള തിരഞ്ഞെടുക്കുക", hi: "मुख्य फसल चुनें" })}
          </label>
          <select
            value={cropId}
            onChange={e => setCropId(e.target.value)}
            className="input"
            style={{ fontWeight: 600, borderRadius: 10 }}
          >
            {CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {cropName(c, language)} ({tr(language, {
                  en: `${seasonName(c.season, language)} Season`,
                  ta: `${seasonName(c.season, language)} பருவம்`,
                  te: `${seasonName(c.season, language)} సీజన్`,
                  kn: `${seasonName(c.season, language)} ಹಂಗಾಮು`,
                  ml: `${seasonName(c.season, language)} സീസൺ`,
                  hi: `${seasonName(c.season, language)} मौसम`
                })})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
            📐 {tr(language, { en: "Cultivated Land Area (Acres)", ta: "சாகுபடி நிலப் பரப்பு (ஏக்கர்)", te: "సాగు భూమి విస్తీర్ణం (ఎకరాలు)", kn: "ಸಾಗುವಳಿ ಭೂಮಿ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)", ml: "കൃഷി ഭൂമിയുടെ വിസ്തീർണ്ണം (ഏക്കർ)", hi: "खेती की ज़मीन (एकड़)" })}
          </label>
          <input
            type="number"
            min={MIN_ACRES}
            max={MAX_ACRES}
            step={0.5}
            value={acresInput}
            onChange={e => setAcresInput(e.target.value)}
            onBlur={() => setAcresInput(String(acres))}
            className="input"
            style={{ fontWeight: 700, fontSize: 16, borderRadius: 10 }}
          />
        </div>
      </div>

      {/* Sanctioned Limit Card */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
        color: "#fff",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 22,
        boxShadow: "var(--shadow)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {tr(language, {
              en: "Total Sanctioned KCC Credit Limit",
              ta: "மொத்த அனுமதிக்கப்பட்ட KCC கடன் வரம்பு",
              te: "మొత్తం మంజూరైన KCC రుణ పరిమితి",
              kn: "ಒಟ್ಟು ಮಂಜೂರಾದ KCC ಸಾಲ ಮಿತಿ",
              ml: "ആകെ അനുവദിച്ച KCC വായ്പാ പരിധി",
              hi: "कुल स्वीकृत KCC ऋण सीमा"
            })}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>
            {formatPrice(loan.totalSanctionLimit)}
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>
            {tr(language, {
              en: "Scale of Finance:",
              ta: "ஏக்கருக்கான கடன் அளவு:",
              te: "ఎకరానికి రుణ పరిమాణం:",
              kn: "ಎಕರೆಗೆ ಸಾಲದ ಪ್ರಮಾಣ:",
              ml: "ഏക്കറിന് വായ്പാ തോത്:",
              hi: "प्रति एकड़ ऋण मान:"
            })} {formatPrice(loan.cropLimit / acres)} / {tr(language, { en: "acre", ta: "ஏக்கர்", te: "ఎకరం", kn: "ಎಕರೆ", ml: "ഏക്കർ", hi: "एकड़" })} ({acres} {acresWord})
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          padding: "12px 18px",
          borderRadius: 12,
          textAlign: "right"
        }}>
          <div style={{ fontSize: 11, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {tr(language, {
              en: "Effective Interest Rate (Prompt Repayment)",
              ta: "உண்மையான வட்டி விகிதம் (சரியான நேரத்தில் திருப்பிச் செலுத்தினால்)",
              te: "అసలు వడ్డీ రేటు (సకాలంలో తిరిగి చెల్లిస్తే)",
              kn: "ನಿಜವಾದ ಬಡ್ಡಿ ದರ (ಸಮಯಕ್ಕೆ ಮರುಪಾವತಿಸಿದರೆ)",
              ml: "യഥാർത്ഥ പലിശ നിരക്ക് (സമയത്ത് തിരിച്ചടച്ചാൽ)",
              hi: "असल ब्याज दर (समय पर चुकाने पर)"
            })}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FEF9C3" }}>
            {loan.effectiveInterestRate.toFixed(2)}% <span style={{ fontSize: 12, fontWeight: 500 }}>{tr(language, { en: "p.a.", ta: "ஆண்டுக்கு", te: "సంవత్సరానికి", kn: "ವಾರ್ಷಿಕ", ml: "പ്രതിവർഷം", hi: "सालाना" })}</span>
          </div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>
            {tr(language, {
              en: "7% − 3% incentive = 4% on first ₹3 lakh",
              ta: "7% − 3% ஊக்கத்தொகை = முதல் ₹3 லட்சத்திற்கு 4%",
              te: "7% − 3% ప్రోత్సాహకం = మొదటి ₹3 లక్షలపై 4%",
              kn: "7% − 3% ಪ್ರೋತ್ಸಾಹ = ಮೊದಲ ₹3 ಲಕ್ಷಕ್ಕೆ 4%",
              ml: "7% − 3% ഇളവ് = ആദ്യ ₹3 ലക്ഷത്തിന് 4%",
              hi: "7% − 3% प्रोत्साहन = पहले ₹3 लाख पर 4%"
            })}
            {exceedsCap && <><br />{tr(language, {
              en: `Above ₹3 lakh: ${KCC_ASSUMED_RATE_ABOVE_CAP}% (assumed bank rate)`,
              ta: `₹3 லட்சத்திற்கு மேல்: ${KCC_ASSUMED_RATE_ABOVE_CAP}% (வங்கி விகிதம் என அனுமானம்)`,
              te: `₹3 లక్షలకు పైన: ${KCC_ASSUMED_RATE_ABOVE_CAP}% (అంచనా బ్యాంకు రేటు)`,
              kn: `₹3 ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು: ${KCC_ASSUMED_RATE_ABOVE_CAP}% (ಅಂದಾಜು ಬ್ಯಾಂಕ್ ದರ)`,
              ml: `₹3 ലക്ഷത്തിന് മുകളിൽ: ${KCC_ASSUMED_RATE_ABOVE_CAP}% (കണക്കാക്കിയ ബാങ്ക് നിരക്ക്)`,
              hi: `₹3 लाख से ऊपर: ${KCC_ASSUMED_RATE_ABOVE_CAP}% (अनुमानित बैंक दर)`
            })}</>}
          </div>
        </div>
      </div>

      {/* Detailed Limit & Interest Breakdown Table */}
      <div className="grid-cols-2-responsive" style={{ gap: 16, marginBottom: 20 }}>
        {/* Loan Components */}
        <div className="card-sm" style={{ background: "var(--bg)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 12 }}>
            📋 {tr(language, { en: "Credit Limit Breakdown", ta: "கடன் வரம்பு விவரம்", te: "రుణ పరిమితి వివరాలు", kn: "ಸಾಲ ಮಿತಿ ವಿವರ", ml: "വായ്പാ പരിധി വിശദാംശം", hi: "ऋण सीमा का ब्योरा" })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Crop Cultivation Limit:", ta: "பயிர் சாகுபடி வரம்பு:", te: "పంట సాగు పరిమితి:", kn: "ಬೆಳೆ ಸಾಗುವಳಿ ಮಿತಿ:", ml: "വിള കൃഷി പരിധി:", hi: "फसल खेती सीमा:" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(loan.cropLimit)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Post-Harvest Household (10%):", ta: "அறுவடைக்குப் பின் குடும்பச் செலவு (10%):", te: "కోత తర్వాత ఇంటి ఖర్చులు (10%):", kn: "ಕೊಯ್ಲಿನ ನಂತರದ ಮನೆ ಖರ್ಚು (10%):", ml: "വിളവെടുപ്പിന് ശേഷമുള്ള വീട്ടുചെലവ് (10%):", hi: "कटाई के बाद घरेलू खर्च (10%):" })}</span>
              <strong style={{ color: "var(--text)" }}>+{formatPrice(loan.postHarvestLimit)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Farm Asset Maintenance (20%):", ta: "பண்ணைக் கருவி பராமரிப்பு (20%):", te: "వ్యవసాయ పరికరాల నిర్వహణ (20%):", kn: "ಕೃಷಿ ಸಾಧನ ನಿರ್ವಹಣೆ (20%):", ml: "കൃഷി ഉപകരണ പരിപാലനം (20%):", hi: "खेती के उपकरणों का रखरखाव (20%):" })}</span>
              <strong style={{ color: "var(--text)" }}>+{formatPrice(loan.farmAssetLimit)}</strong>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800 }}>
              <span>{tr(language, { en: "Total Sanctioned Limit:", ta: "மொத்த அனுமதிக்கப்பட்ட வரம்பு:", te: "మొత్తం మంజూరైన పరిమితి:", kn: "ಒಟ್ಟು ಮಂಜೂರಾದ ಮಿತಿ:", ml: "ആകെ അനുവദിച്ച പരിധി:", hi: "कुल स्वीकृत सीमा:" })}</span>
              <span style={{ color: "var(--primary-dark)" }}>{formatPrice(loan.totalSanctionLimit)}</span>
            </div>
          </div>
        </div>

        {/* Repayment & Interest */}
        <div className="card-sm" style={{ background: "var(--bg)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 12 }}>
            🏦 {tr(language, { en: "Repayment & EMI Schedule", ta: "திருப்பிச் செலுத்துதல் & EMI அட்டவணை", te: "తిరిగి చెల్లింపు & EMI వివరాలు", kn: "ಮರುಪಾವತಿ & EMI ವೇಳಾಪಟ್ಟಿ", ml: "തിരിച്ചടവും EMI പട്ടികയും", hi: "भुगतान और EMI विवरण" })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Annual Interest (repaid within 12 months):", ta: "ஆண்டு வட்டி (12 மாதங்களுக்குள் செலுத்தினால்):", te: "వార్షిక వడ్డీ (12 నెలల్లో చెల్లిస్తే):", kn: "ವಾರ್ಷಿಕ ಬಡ್ಡಿ (12 ತಿಂಗಳೊಳಗೆ ಪಾವತಿಸಿದರೆ):", ml: "വാർഷിക പലിശ (12 മാസത്തിനുള്ളിൽ അടച്ചാൽ):", hi: "सालाना ब्याज (12 महीने में चुकाने पर):" })}</span>
              <strong style={{ color: "#15803D" }}>{formatPrice(loan.annualInterestAmount)} {perYear}</strong>
            </div>
            {exceedsCap && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>{tr(language, {
                  en: `Amount above ₹3 lakh (at assumed ${KCC_ASSUMED_RATE_ABOVE_CAP}%):`,
                  ta: `₹3 லட்சத்திற்கு மேலான தொகை (அனுமான ${KCC_ASSUMED_RATE_ABOVE_CAP}%):`,
                  te: `₹3 లక్షలకు పైబడిన మొత్తం (అంచనా ${KCC_ASSUMED_RATE_ABOVE_CAP}%):`,
                  kn: `₹3 ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಮೊತ್ತ (ಅಂದಾಜು ${KCC_ASSUMED_RATE_ABOVE_CAP}%):`,
                  ml: `₹3 ലക്ഷത്തിന് മുകളിലുള്ള തുക (കണക്കാക്കിയ ${KCC_ASSUMED_RATE_ABOVE_CAP}%):`,
                  hi: `₹3 लाख से ऊपर की राशि (अनुमानित ${KCC_ASSUMED_RATE_ABOVE_CAP}%):`
                })}</span>
                <strong style={{ color: "var(--text)" }}>{formatPrice(loan.amountAboveCap)}</strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Saved via 3% Prompt Repayment Incentive:", ta: "சரியான நேரத்தில் செலுத்தியதால் 3% சேமிப்பு:", te: "సకాల చెల్లింపు 3% ప్రోత్సాహకంతో ఆదా:", kn: "ಸಮಯಕ್ಕೆ ಪಾವತಿಯ 3% ಪ್ರೋತ್ಸಾಹದಿಂದ ಉಳಿತಾಯ:", ml: "സമയത്ത് തിരിച്ചടച്ചതിന്റെ 3% ഇളവിലൂടെ ലാഭം:", hi: "समय पर भुगतान पर 3% छूट से बचत:" })}</span>
              <strong style={{ color: "var(--secondary)" }}>-{formatPrice(loan.interestSavedViaIncentive)} {perYear}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{tr(language, { en: "Monthly Installment (if repaid in 12 EMIs):", ta: "மாதத் தவணை (12 EMI-களில் செலுத்தினால்):", te: "నెలవారీ వాయిదా (12 EMIలలో చెల్లిస్తే):", kn: "ಮಾಸಿಕ ಕಂತು (12 EMI ಗಳಲ್ಲಿ ಪಾವತಿಸಿದರೆ):", ml: "പ്രതിമാസ ഗഡു (12 EMI-കളായി അടച്ചാൽ):", hi: "मासिक किस्त (12 EMI में चुकाने पर):" })}</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(loan.monthlyEmi)} {tr(language, { en: "/ month", ta: "/ மாதம்", te: "/ నెల", kn: "/ ತಿಂಗಳು", ml: "/ മാസം", hi: "/ महीना" })}</strong>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
              💡 {tr(language, {
                en: "No collateral required for agricultural loans up to ₹2 lakh (RBI, effective 1 Jan 2025). The 4% rate applies only to the first ₹3 lakh and only if repaid within 12 months.",
                ta: "₹2 லட்சம் வரையிலான விவசாயக் கடனுக்கு அடமானம் தேவையில்லை (RBI, 1 ஜன 2025 முதல்). 4% வட்டி முதல் ₹3 லட்சத்திற்கு மட்டுமே, அதுவும் 12 மாதங்களுக்குள் திருப்பிச் செலுத்தினால் மட்டுமே.",
                te: "₹2 లక్షల వరకు వ్యవసాయ రుణాలకు ఎలాంటి తాకట్టు అవసరం లేదు (RBI, 1 జనవరి 2025 నుండి). 4% వడ్డీ మొదటి ₹3 లక్షలకు మాత్రమే, అదీ 12 నెలల్లో తిరిగి చెల్లిస్తేనే.",
                kn: "₹2 ಲಕ್ಷದವರೆಗಿನ ಕೃಷಿ ಸಾಲಕ್ಕೆ ಯಾವುದೇ ಅಡಮಾನ ಬೇಕಿಲ್ಲ (RBI, 1 ಜನವರಿ 2025 ರಿಂದ). 4% ದರ ಮೊದಲ ₹3 ಲಕ್ಷಕ್ಕೆ ಮಾತ್ರ, ಅದೂ 12 ತಿಂಗಳೊಳಗೆ ಮರುಪಾವತಿಸಿದರೆ ಮಾತ್ರ.",
                ml: "₹2 ലക്ഷം വരെയുള്ള കാർഷിക വായ്പകൾക്ക് ഈട് ആവശ്യമില്ല (RBI, 2025 ജനുവരി 1 മുതൽ). 4% നിരക്ക് ആദ്യ ₹3 ലക്ഷത്തിന് മാത്രം, അതും 12 മാസത്തിനുള്ളിൽ തിരിച്ചടച്ചാൽ മാത്രം.",
                hi: "₹2 लाख तक के कृषि ऋण के लिए कोई गिरवी नहीं चाहिए (RBI, 1 जनवरी 2025 से)। 4% दर केवल पहले ₹3 लाख पर है और तभी जब 12 महीने में चुकाया जाए।"
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
