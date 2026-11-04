"use client";

import { useState, useEffect, useMemo } from "react";
import { CROPS, getMandiComparison, formatPrice, MandiInfo } from "@/lib/cropData";
import { useApp } from "@/lib/AppContext";
import { INDIAN_STATES, STATE_DISTRICTS } from "@/lib/locationData";
import PriceAlertModal from "@/components/PriceAlertModal";
import { formatPriceDate } from "@/lib/priceDate";
import { tr, cropName } from "@/lib/i18n";

interface MandiComparisonProps {
  initialCropId?: string;
  compact?: boolean;
}

export default function MandiComparison({ initialCropId, compact = false }: MandiComparisonProps) {
  const { location, language } = useApp();
  const [selectedState, setSelectedState] = useState<string>(location.state || "Andhra Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(location.district || "Chittoor");
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId || "rice");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMandiName, setAlertMandiName] = useState<string>("");
  const [alertPrice, setAlertPrice] = useState<number | undefined>(undefined);

  // Sync from props/context when they change (adjust state during render instead of in an effect)
  const [prevInitialCropId, setPrevInitialCropId] = useState(initialCropId);
  if (initialCropId !== prevInitialCropId) {
    setPrevInitialCropId(initialCropId);
    if (initialCropId) setSelectedCropId(initialCropId);
  }
  const [prevLocation, setPrevLocation] = useState({ state: location.state, district: location.district });
  if (location.state !== prevLocation.state || location.district !== prevLocation.district) {
    setPrevLocation({ state: location.state, district: location.district });
    if (location.state) setSelectedState(location.state);
    if (location.district) setSelectedDistrict(location.district);
  }
  const [search, setSearch] = useState<string>("");

  const selectedCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
  const isQuintal = selectedCrop.unit === "quintal";
  // Local fallback data for the current crop/state, shown until (or unless) live data arrives
  const localMandiData = useMemo(() => getMandiComparison(selectedCrop, selectedState), [selectedCrop, selectedState]);
  // Live API result, tagged with the request it answers so stale results are never shown
  const requestKey = `${selectedCrop.id}|${selectedState}|${selectedDistrict}`;
  const [liveResult, setLiveResult] = useState<{ key: string; data: MandiInfo[] | null; official: boolean; priceDate: string | null } | null>(null);
  const loading = liveResult?.key !== requestKey;
  const mandiData = liveResult?.key === requestKey && liveResult.data ? liveResult.data : localMandiData;
  // True only for official Agmarknet prices; anything else is an estimate
  const isOfficial = !loading && !!liveResult?.data && liveResult.official;

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveMandis() {
      let data: MandiInfo[] | null = null;
      let official = false;
      let priceDate: string | null = null;
      try {
        const res = await fetch(`/api/mandi-prices?crop=${encodeURIComponent(selectedCrop.name)}&state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.topMandis && json.topMandis.length > 0) {
            data = json.topMandis;
            official = json.live === true;
            priceDate = typeof json.priceDate === "string" ? json.priceDate : null;
          }
        }
      } catch (err) {
        console.error("Live Mandi API error:", err);
      }
      if (isMounted) setLiveResult({ key: requestKey, data, official, priceDate });
    }
    fetchLiveMandis();
    return () => { isMounted = false; };
  }, [requestKey, selectedCrop.name, selectedState, selectedDistrict]);

  const filteredMandis = mandiData.filter(m =>
    m.mandiName.toLowerCase().includes(search.toLowerCase()) ||
    m.district.toLowerCase().includes(search.toLowerCase())
  );

  const bestMandi = mandiData.find(m => m.isBestChoice) || mandiData[0];
  const baselineDiff = bestMandi.price - selectedCrop.basePrice;
  const avgPrice = Math.round(mandiData.reduce((acc, m) => acc + m.price, 0) / mandiData.length);

  const L = {
    title: tr(language, { en: "APMC Mandi Price Comparison", ta: "APMC மண்டி விலை ஒப்பீடு", te: "APMC మండి ధరల పోలిక", kn: "APMC ಮಂಡಿ ಬೆಲೆ ಹೋಲಿಕೆ", ml: "APMC മണ്ടി വില താരതമ്യം", hi: "APMC मंडी भाव तुलना" }),
    live: tr(language, { en: "Live Agmarknet", ta: "நேரடி Agmarknet", te: "లైవ్ Agmarknet", kn: "ಲೈವ್ Agmarknet", ml: "തത്സമയ Agmarknet", hi: "लाइव Agmarknet" }),
    fetching: tr(language, { en: "Fetching mandi prices...", ta: "மண்டி விலைகள் பெறப்படுகிறது...", te: "మండి ధరలు తెస్తున్నాం...", kn: "ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ತರಲಾಗುತ್ತಿದೆ...", ml: "മണ്ടി വിലകൾ ലഭ്യമാക്കുന്നു...", hi: "मंडी भाव लाए जा रहे हैं..." }),
    estimated: tr(language, { en: "Estimated prices", ta: "மதிப்பீட்டு விலைகள்", te: "అంచనా ధరలు", kn: "ಅಂದಾಜು ಬೆಲೆಗಳು", ml: "ഏകദേശ വിലകൾ", hi: "अनुमानित भाव" }),
    subtitle: isOfficial
      ? tr(language, {
          en: `Official daily APMC prices from Agmarknet (Govt. of India) for ${selectedState}`,
          ta: `${selectedState} க்கான Agmarknet (இந்திய அரசு) அதிகாரப்பூர்வ தினசரி APMC விலைகள்`,
          te: `${selectedState} కోసం Agmarknet (భారత ప్రభుత్వం) అధికారిక రోజువారీ APMC ధరలు`,
          kn: `${selectedState} ಗಾಗಿ Agmarknet (ಭಾರತ ಸರ್ಕಾರ) ಅಧಿಕೃತ ದೈನಂದಿನ APMC ಬೆಲೆಗಳು`,
          ml: `${selectedState} ലെ Agmarknet (ഇന്ത്യാ ഗവൺമെന്റ്) ഔദ്യോഗിക ദിവസേനയുള്ള APMC വിലകൾ`,
          hi: `${selectedState} के लिए Agmarknet (भारत सरकार) के आधिकारिक दैनिक APMC भाव`,
        })
      : loading
        ? tr(language, {
            en: `Checking official Agmarknet prices for ${selectedState}...`,
            ta: `${selectedState} க்கான Agmarknet விலைகள் சரிபார்க்கப்படுகிறது...`,
            te: `${selectedState} కోసం Agmarknet ధరలు తనిఖీ చేస్తున్నాం...`,
            kn: `${selectedState} ಗಾಗಿ Agmarknet ಬೆಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...`,
            ml: `${selectedState} ലെ Agmarknet വിലകൾ പരിശോധിക്കുന്നു...`,
            hi: `${selectedState} के लिए Agmarknet भाव जांचे जा रहे हैं...`,
          })
        : tr(language, {
            en: `Indicative prices — official Agmarknet data not available for this crop in ${selectedState}`,
            ta: `தோராயமான விலைகள் — ${selectedState} இல் இந்த பயிருக்கு Agmarknet தரவு இல்லை`,
            te: `సుమారు ధరలు — ${selectedState} లో ఈ పంటకు Agmarknet సమాచారం అందుబాటులో లేదు`,
            kn: `ಅಂದಾಜು ಬೆಲೆಗಳು — ${selectedState} ನಲ್ಲಿ ಈ ಬೆಳೆಗೆ Agmarknet ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ`,
            ml: `ഏകദേശ വിലകൾ — ${selectedState} ൽ ഈ വിളയ്ക്ക് Agmarknet വിവരം ലഭ്യമല്ല`,
            hi: `अनुमानित भाव — ${selectedState} में इस फसल का Agmarknet डेटा उपलब्ध नहीं है`,
          }),
    recommended: tr(language, { en: "Recommended Mandi for Best Profit", ta: "அதிக லாபத்திற்கு சிறந்த மண்டி", te: "ఎక్కువ లాభానికి సూచించిన మండి", kn: "ಹೆಚ್ಚು ಲಾಭಕ್ಕೆ ಸೂಚಿಸಿದ ಮಂಡಿ", ml: "കൂടുതൽ ലാഭത്തിന് നിർദ്ദേശിക്കുന്ന മണ്ടി", hi: "ज़्यादा मुनाफे के लिए सुझाई गई मंडी" }),
    unit: selectedCrop.unit === "quintal" ? tr(language, { en: "quintal", ta: "குவிண்டால்", te: "క్వింటాల్", kn: "ಕ್ವಿಂಟಾಲ್", ml: "ക്വിന്റൽ", hi: "क्विंटल" }) : selectedCrop.unit,
    higher: (amt: string) => tr(language, { en: `+${amt} higher than baseline`, ta: `அடிப்படை விலையை விட +${amt} அதிகம்`, te: `బేస్ ధర కంటే +${amt} ఎక్కువ`, kn: `ಮೂಲ ಬೆಲೆಗಿಂತ +${amt} ಹೆಚ್ಚು`, ml: `അടിസ്ഥാന വിലയേക്കാൾ +${amt} കൂടുതൽ`, hi: `आधार भाव से +${amt} ज़्यादा` }),
    lower: (amt: string) => tr(language, { en: `${amt} lower than baseline`, ta: `அடிப்படை விலையை விட ${amt} குறைவு`, te: `బేస్ ధర కంటే ${amt} తక్కువ`, kn: `ಮೂಲ ಬೆಲೆಗಿಂತ ${amt} ಕಡಿಮೆ`, ml: `അടിസ്ഥാന വിലയേക്കാൾ ${amt} കുറവ്`, hi: `आधार भाव से ${amt} कम` }),
    search: tr(language, { en: "🔍 Search Mandi or District...", ta: "🔍 மண்டி அல்லது மாவட்டம் தேடு...", te: "🔍 మండి లేదా జిల్లా వెతకండి...", kn: "🔍 ಮಂಡಿ ಅಥವಾ ಜಿಲ್ಲೆ ಹುಡುಕಿ...", ml: "🔍 മണ്ടി അല്ലെങ്കിൽ ജില്ല തിരയുക...", hi: "🔍 मंडी या ज़िला खोजें..." }),
    setAlert: tr(language, { en: "Set Target Price Alert", ta: "இலக்கு விலை எச்சரிக்கை அமை", te: "లక్ష్య ధర హెచ్చరిక సెట్ చేయండి", kn: "ಗುರಿ ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ", ml: "ലക്ഷ്യ വില അറിയിപ്പ് സജ്ജമാക്കുക", hi: "लक्ष्य भाव अलर्ट लगाएं" }),
    colMandi: tr(language, { en: "APMC Mandi", ta: "APMC மண்டி", te: "APMC మండి", kn: "APMC ಮಂಡಿ", ml: "APMC മണ്ടി", hi: "APMC मंडी" }),
    colPlace: tr(language, { en: "District & State", ta: "மாவட்டம் & மாநிலம்", te: "జిల్లా & రాష్ట్రం", kn: "ಜಿಲ್ಲೆ & ರಾಜ್ಯ", ml: "ജില്ലയും സംസ്ഥാനവും", hi: "ज़िला और राज्य" }),
    colPrice: isOfficial
      ? tr(language, { en: "Modal Price", ta: "சராசரி விலை", te: "సగటు ధర", kn: "ಸರಾಸರಿ ಬೆಲೆ", ml: "ശരാശരി വില", hi: "औसत भाव" })
      : tr(language, { en: "Est. Price", ta: "மதிப்பீட்டு விலை", te: "అంచనా ధర", kn: "ಅಂದಾಜು ಬೆಲೆ", ml: "ഏകദേശ വില", hi: "अनुमानित भाव" }),
    colVariance: tr(language, { en: "Variance vs Avg", ta: "சராசரியுடன் வேறுபாடு", te: "సగటుతో తేడా", kn: "ಸರಾಸರಿಗಿಂತ ವ್ಯತ್ಯಾಸ", ml: "ശരാശരിയുമായുള്ള വ്യത്യാസം", hi: "औसत से अंतर" }),
    colRange: isOfficial
      ? tr(language, { en: "Min – Max Price", ta: "குறைந்த – அதிக விலை", te: "కనిష్ఠ – గరిష్ఠ ధర", kn: "ಕನಿಷ್ಠ – ಗರಿಷ್ಠ ಬೆಲೆ", ml: "കുറഞ്ഞ – കൂടിയ വില", hi: "न्यूनतम – अधिकतम भाव" })
      : tr(language, { en: "Arrival Volume", ta: "வரத்து அளவு", te: "రాక పరిమాణం", kn: "ಆವಕ ಪ್ರಮಾಣ", ml: "വരവ് അളവ്", hi: "आवक मात्रा" }),
    colTrend: isOfficial
      ? tr(language, { en: "Reported", ta: "பதிவு தேதி", te: "నమోదు తేదీ", kn: "ವರದಿ ದಿನಾಂಕ", ml: "റിപ്പോർട്ട് ചെയ്തത്", hi: "दर्ज तारीख" })
      : tr(language, { en: "Trend", ta: "போக்கு", te: "ధోరణి", kn: "ಪ್ರವೃತ್ತಿ", ml: "പ്രവണത", hi: "रुझान" }),
    colRec: tr(language, { en: "Recommendation", ta: "பரிந்துரை", te: "సిఫారసు", kn: "ಸಲಹೆ", ml: "ശുപാർശ", hi: "सलाह" }),
    colAlert: tr(language, { en: "Alert", ta: "எச்சரிக்கை", te: "హెచ్చరిక", kn: "ಎಚ್ಚರಿಕೆ", ml: "അറിയിപ്പ്", hi: "अलर्ट" }),
    tonsPerDay: tr(language, { en: "Tons/day", ta: "டன்/நாள்", te: "టన్నులు/రోజు", kn: "ಟನ್/ದಿನ", ml: "ടൺ/ദിവസം", hi: "टन/दिन" }),
    rising: tr(language, { en: "↑ Rising", ta: "↑ உயர்கிறது", te: "↑ పెరుగుతోంది", kn: "↑ ಏರುತ್ತಿದೆ", ml: "↑ ഉയരുന്നു", hi: "↑ बढ़ रहा" }),
    dropping: tr(language, { en: "↓ Dropping", ta: "↓ குறைகிறது", te: "↓ తగ్గుతోంది", kn: "↓ ಇಳಿಯುತ್ತಿದೆ", ml: "↓ കുറയുന്നു", hi: "↓ गिर रहा" }),
    stable: tr(language, { en: "→ Stable", ta: "→ நிலையானது", te: "→ స్థిరంగా", kn: "→ ಸ್ಥಿರ", ml: "→ സ്ഥിരം", hi: "→ स्थिर" }),
    highest: tr(language, { en: "🏆 Highest Price", ta: "🏆 அதிக விலை", te: "🏆 అత్యధిక ధర", kn: "🏆 ಅತಿ ಹೆಚ್ಚು ಬೆಲೆ", ml: "🏆 ഏറ്റവും ഉയർന്ന വില", hi: "🏆 सबसे ऊंचा भाव" }),
    goodReturn: tr(language, { en: "Good Return", ta: "நல்ல வருமானம்", te: "మంచి రాబడి", kn: "ಉತ್ತಮ ಆದಾಯ", ml: "നല്ല വരുമാനം", hi: "अच्छा मुनाफा" }),
    baseline: tr(language, { en: "Baseline Market", ta: "சாதாரண சந்தை", te: "సాధారణ మార్కెట్", kn: "ಸಾಮಾನ್ಯ ಮಾರುಕಟ್ಟೆ", ml: "സാധാരണ വിപണി", hi: "सामान्य बाज़ार" }),
    alertFor: (mandi: string) => tr(language, { en: `Set price target alert for ${mandi}`, ta: `${mandi} க்கு விலை எச்சரிக்கை அமை`, te: `${mandi} కోసం ధర హెచ్చరిక సెట్ చేయండి`, kn: `${mandi} ಗೆ ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ`, ml: `${mandi} നായി വില അറിയിപ്പ് സജ്ജമാക്കുക`, hi: `${mandi} के लिए भाव अलर्ट लगाएं` }),
  };

  return (
    <div className="card" style={{ padding: compact ? 16 : 24, borderRadius: 20 }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>🏢</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: compact ? 18 : 22, fontWeight: 700, color: "var(--text)" }}>
                {L.title}
              </h3>
              {isOfficial ? (
                <span style={{ fontSize: 11, background: "rgba(16, 185, 129, 0.12)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "2px 9px", borderRadius: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="live-dot" /> {L.live}{liveResult?.priceDate ? ` · ${formatPriceDate(liveResult.priceDate)}` : ""}
                </span>
              ) : (
                <span style={{ fontSize: 11, background: "rgba(196, 150, 75, 0.12)", color: "#B7791F", border: "1px solid rgba(196, 150, 75, 0.3)", padding: "2px 9px", borderRadius: 12, fontWeight: 700 }}>
                  {loading ? L.fetching : L.estimated}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {L.subtitle}
          </p>
        </div>

        {/* State, District & Crop Selectors */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={selectedState}
            onChange={e => {
              const ns = e.target.value;
              setSelectedState(ns);
              const dists = STATE_DISTRICTS[ns];
              if (dists && dists.length > 0) setSelectedDistrict(dists[0].name);
            }}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            {(STATE_DISTRICTS[selectedState] || []).map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedCropId}
            onChange={e => setSelectedCropId(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10, borderColor: "var(--primary)" }}
          >
            {CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {cropName(c, language)} ({formatPrice(c.basePrice)}/{c.unit === "quintal" ? "qntl" : c.unit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Best Choice Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(92,122,62,0.12) 0%, rgba(196,150,75,0.12) 100%)",
        border: "1px solid var(--primary-light)",
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontSize: 26,
            background: "var(--primary)",
            color: "#fff",
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            🏆
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {L.recommended}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>
              {bestMandi.mandiName} ({bestMandi.district})
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-dark)" }}>
            {formatPrice(bestMandi.price)} <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>/ {L.unit}</span>
          </div>
          <div style={{ fontSize: 12, color: baselineDiff >= 0 ? "var(--success)" : "#B91C1C", fontWeight: 700 }}>
            {baselineDiff >= 0
              ? L.higher(formatPrice(baselineDiff))
              : L.lower(formatPrice(Math.abs(baselineDiff)))}
          </div>
        </div>
      </div>

      {/* Search Bar & Alert CTA */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder={L.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: 320, padding: "8px 14px", borderRadius: 10, fontSize: 13 }}
        />
        <button
          onClick={() => {
            setAlertMandiName(bestMandi.mandiName);
            setAlertPrice(bestMandi.price);
            setIsAlertModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 10, padding: "8px 14px", fontWeight: 700 }}
        >
          <span>🔔</span>
          <span>{L.setAlert}</span>
        </button>
      </div>

      {/* Mandi Price Comparison Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{L.colMandi}</th>
              <th>{L.colPlace}</th>
              <th>{L.colPrice}</th>
              <th>{L.colVariance}</th>
              <th>{L.colRange}</th>
              <th>{L.colTrend}</th>
              <th>{L.colRec}</th>
              <th>{L.colAlert}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMandis.map((mandi, idx) => {
              const isHigher = mandi.price >= avgPrice;
              return (
                <tr key={`mandi_row_${selectedCropId}_${mandi.mandiName}_${idx}`} style={{ background: mandi.isBestChoice ? "rgba(92,122,62,0.06)" : undefined }}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text)" }}>{mandi.mandiName}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{mandi.district}, {mandi.state}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
                      {formatPrice(mandi.price)}
                      {isQuintal && (
                        <span style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700, marginLeft: 6 }}>
                          (₹{Math.round(mandi.price / 100)}/kg)
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: mandi.priceDiff > 0 ? "#15803D" : mandi.priceDiff < 0 ? "#B91C1C" : "var(--text-muted)"
                    }}>
                      {mandi.priceDiff > 0 ? `+${formatPrice(mandi.priceDiff)}` : formatPrice(mandi.priceDiff)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>
                      {mandi.minPrice != null && mandi.maxPrice != null
                        ? `${formatPrice(mandi.minPrice)} – ${formatPrice(mandi.maxPrice)}`
                        : mandi.arrivalDate ? "—" : `📦 ${mandi.arrivalsTons} ${L.tonsPerDay}`}
                    </span>
                  </td>
                  <td>
                    {mandi.arrivalDate ? (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{mandi.arrivalDate}</span>
                    ) : (
                      <span className={`badge ${mandi.trend === "up" ? "badge-green" : mandi.trend === "down" ? "badge-red" : "badge-gray"}`}>
                        {mandi.trend === "up" ? L.rising : mandi.trend === "down" ? L.dropping : L.stable}
                      </span>
                    )}
                  </td>
                  <td>
                    {mandi.isBestChoice ? (
                      <span className="badge badge-green" style={{ padding: "4px 10px", fontSize: 11 }}>
                        {L.highest}
                      </span>
                    ) : isHigher ? (
                      <span className="badge badge-yellow" style={{ padding: "4px 10px", fontSize: 11 }}>
                        {L.goodReturn}
                      </span>
                    ) : (
                      <span className="badge badge-gray" style={{ padding: "4px 10px", fontSize: 11 }}>
                        {L.baseline}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setAlertMandiName(mandi.mandiName);
                        setAlertPrice(mandi.price);
                        setIsAlertModalOpen(true);
                      }}
                      title={L.alertFor(mandi.mandiName)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "4px 10px", fontSize: 11.5, borderRadius: 8, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <span>🔔</span>
                      <span>{L.colAlert}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialCropId={selectedCropId}
        initialMandiName={alertMandiName}
        initialPrice={alertPrice}
        initialState={selectedState}
        initialDistrict={selectedDistrict}
      />
    </div>
  );
}
