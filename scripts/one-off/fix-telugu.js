const fs = require('fs');

let cropData = fs.readFileSync('src/lib/cropData.ts', 'utf-8');

// Fix cropData.ts
cropData = cropData
  .replace('nameTE: "கோந்துமை"', 'nameTE: "గోధుమ"')
  .replace('nameTE: "సోயாబీన్"', 'nameTE: "సోయాబీన్"') // Wait, let's just do regex
  .replace(/nameTE:\s*"[^"]*"/g, (match) => {
    // We will just map the English id to the correct Telugu translation
    return match;
  });

// Instead of regex, let's just replace all nameTE and descTE based on id.
const teluguTranslations = {
  rice: { name: "వరి", desc: "నీటి పొలాల్లో పండించే భారతదేశపు అతి ముఖ్యమైన ఆహార పంట" },
  wheat: { name: "గోధుమ", desc: "ఉత్తర భారతదేశపు ప్రధాన రబీ ధాన్యం" },
  corn: { name: "మొక్కజొన్న", desc: "ఆహారం, పశుగ్రాసం మరియు పరిశ్రమలలో ఉపయోగించే బహుముఖ పంట" },
  mustard: { name: "ఆవాలు", desc: "ఆవ నూనె కోసం పండించే ముఖ్యమైన రబీ నూనెగింజ పంట" },
  soybean: { name: "సోయాబీన్", desc: "అధిక ప్రోటీన్ కలిగిన ఖరీఫ్ నూనెగింజ పంట" },
  groundnut: { name: "వేరుశెనగ", desc: "అధిక నూనె మరియు ప్రోటీన్ కలిగిన ముఖ్యమైన నూనెగింజ పంట" },
  sugarcane: { name: "చెరకు", desc: "చక్కెర ఉత్పత్తికి మరియు ఇథనాల్ కోసం ఉపయోగించే వాణిజ్య పంట" },
  cotton: { name: "పత్తి", desc: "తెల్ల బంగారం — భారతదేశపు ప్రధాన వస్త్ర నార పంట" },
  tomato: { name: "టమాటా", desc: "అత్యధిక ధర హెచ్చుతగ్గులు కలిగిన కూరగాయ పంట" },
  onion: { name: "ఉల్లిపాయ", desc: "చాలా కాల వ్యవధి ధర హెచ్చుతగ్గులు కలిగిన ప్రధాన వంట దినుసు" },
  potato: { name: "బంగాళదుంప", desc: "విస్తృతంగా పండించే దుంప పంట" },
  gram: { name: "శనగలు", desc: "ప్రోటీన్ అధికంగా ఉండే అత్యంత ముఖ్యమైన రబీ పప్పు ధాన్యం" },
  tur: { name: "కందిపప్పు", desc: "ఖరీఫ్ కాలంలో పండించే ప్రధాన పప్పు ధాన్యం" },
  moong: { name: "పెసరపప్పు", desc: "స్వల్పకాలిక పప్పు ధాన్యం పంట" },
  banana: { name: "అరటి", desc: "ఏడాది పొడవునా పండించే అత్యంత ముఖ్యమైన పండ్ల పంట" },
  mango: { name: "మామిడి", desc: "పండ్ల రారాజు, ప్రధాన వేసవి పంట" },
  turmeric: { name: "పసుపు", desc: "ఔషధ గుణాలున్న ముఖ్యమైన సుగంధ ద్రవ్య పంట" },
  chilli: { name: "మిరప", desc: "భారతీయ వంటకాల్లో అత్యంత ముఖ్యమైన సుగంధ ద్రవ్యం" },
  cabbage: { name: "క్యాబేజీ", desc: "శీతాకాలంలో పండించే ఆకుకూర పంట" },
  cauliflower: { name: "కాలీఫ్లవర్", desc: "జనాదరణ పొందిన శీతాకాలపు కూరగాయ" },
  eggplant: { name: "వంకాయ", desc: "సంవత్సరం పొడవునా పండించే సాధారణ కూరగాయ" },
  okra: { name: "బెండకాయ", desc: "వేసవి మరియు ఖరీఫ్ కాలంలో పండించే కూరగాయ" },
  carrot: { name: "క్యారెట్", desc: "శీతాకాలపు వేరు కూరగాయ" },
  apple: { name: "ఆపిల్", desc: "శీతల ప్రాంతాల్లో పండించే పండు" },
  papaya: { name: "బొప్పాయి", desc: "వేగంగా పెరిగే ఉష్ణమండల పండ్ల పంట" },
  orange: { name: "నారింజ", desc: "ప్రసిద్ధ సిట్రస్ పండు" },
  grape: { name: "ద్రాక్ష", desc: "వాణిజ్యపరంగా పండించే పండు" },
  pomegranate: { name: "దానిమ్మ", desc: "అధిక మార్కెట్ విలువ కలిగిన పండ్ల పంట" }
};

for (const [id, t] of Object.entries(teluguTranslations)) {
  const nameRegex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?nameTE:\\s*)"[^"]*"`, 'g');
  const descRegex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?descTE:\\s*)"[^"]*"`, 'g');
  cropData = cropData.replace(nameRegex, `$1"${t.name}"`);
  cropData = cropData.replace(descRegex, `$1"${t.desc}"`);
}
fs.writeFileSync('src/lib/cropData.ts', cropData, 'utf-8');

// Fix chatbot.ts
let chatbotData = fs.readFileSync('src/lib/chatbot.ts', 'utf-8');
chatbotData = chatbotData.replace(/"இயற్கை"/g, '"ప్రకృతి"');
chatbotData = chatbotData.replace(/"కణిప்பு"/g, '"అంచనా"');
fs.writeFileSync('src/lib/chatbot.ts', chatbotData, 'utf-8');

console.log("Done fixing telugu");
