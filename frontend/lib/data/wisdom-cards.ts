import type { WisdomCard } from "@/lib/types";

export const wisdomCards: WisdomCard[] = [
  // ─── Nutrition (9 cards) ──────────────────────────────────────
  {
    id: "nut-01",
    dimension: "nutrition",
    scoreRange: [0, 40],
    title: "Proteină insuficientă, mușchi în pericol",
    insight:
      "Când proteina e sub 1.2g/kg, corpul intră în catabolism muscular — și mușchii sunt organul care arde calorii.",
    action: "Adaugă 30g proteine la fiecare masă principală — ouă, brânză, pui sau pește.",
    source: "Phillips & Van Loon, J. Sports Sci., 2011",
  },
  {
    id: "nut-02",
    dimension: "nutrition",
    scoreRange: [0, 40],
    title: "MIND diet protejează creierul",
    insight:
      "MIND diet reduce riscul de declin cognitiv cu 53% — doar prin ceea ce adaugi în farfurie.",
    action: "Include 5 porții de legume cu frunze verzi și 2 porții de fructe de pădure pe săptămână.",
    source: "Morris et al., Alzheimer's & Dementia, 2015",
  },
  {
    id: "nut-03",
    dimension: "nutrition",
    scoreRange: [0, 50],
    title: "Zahărul accelerează îmbătrânirea celulară",
    insight:
      "Fiecare 250ml de băutură îndulcită scurtează telomerele cu echivalentul a 1.9 ani de îmbătrânire.",
    action: "Înlocuiește băuturile îndulcite cu apă cu lămâie sau ceai verde.",
    source: "Leung et al., AJPH, 2014",
  },
  {
    id: "nut-04",
    dimension: "nutrition",
    scoreRange: [0, 55],
    title: "Omega-3 reduce inflamația sistemică",
    insight:
      "Nivelurile adequate de EPA+DHA scad markerul inflamației CRP cu 29% și protejează vasculatura cerebrală.",
    action: "Consumă somon, sardine sau suplimente de omega-3 de cel puțin 3 ori pe săptămână.",
    source: "Ferrara et al., Am. J. Clin. Nutr., 2008",
  },
  {
    id: "nut-05",
    dimension: "nutrition",
    scoreRange: [20, 60],
    title: "Fibra hrănește microbiomul",
    insight:
      "Persoanele cu aport de fibre peste 25g/zi au cu 22% mai puține evenimente cardiovasculare.",
    action: "Adaugă semințe de in, linte sau năut în mesele tale zilnice.",
    source: "Threapleton et al., BMJ, 2013",
  },
  {
    id: "nut-06",
    dimension: "nutrition",
    scoreRange: [0, 45],
    title: "Micul dejun bogat în proteine stabilizează glicemia",
    insight:
      "Un mic dejun cu 30g+ proteine reduce fluctuațiile glicemice cu 40% pe restul zilei.",
    action: "Începe ziua cu ouă, iaurt grecesc sau brânză cottage — nu cu cereale dulci.",
    source: "Leidy et al., Obesity, 2015",
  },
  {
    id: "nut-07",
    dimension: "nutrition",
    scoreRange: [10, 55],
    title: "Polifenolii din fructe de pădure protejează memoria",
    insight:
      "Antocianii din afine și mure îmbunătățesc fluxul sanguin cerebral și memoria de lucru cu până la 15%.",
    action: "Adaugă o mână de fructe de pădure la micul dejun sau ca gustare.",
    source: "Miller & Shukitt-Hale, J. Nutr., 2012",
  },
  {
    id: "nut-08",
    dimension: "nutrition",
    scoreRange: [0, 35],
    title: "Deshidratarea scade performanța cognitivă",
    insight:
      "O pierdere de doar 2% din greutatea corporală în apă reduce atenția cu 25% și memoria pe termen scurt cu 13%.",
    action: "Bea minimum 2L de apă pe zi — mai mult dacă faci exerciții fizice.",
    source: "Wittbrodt et al., Med. Sci. Sports Exerc., 2018",
  },
  {
    id: "nut-09",
    dimension: "nutrition",
    scoreRange: [30, 70],
    title: "Postul intermitent protejează neuronii",
    insight:
      "16 ore de post activează autofagia cerebrală — procesul prin care neurții elimină deșeurile toxice.",
    action: "Încearcă o fereastră de alimentare de 8 ore, de ex. 10:00–18:00, de 2–3 ori pe săptămână.",
    source: "Mattson et al., NEJM, 2019",
  },

  // ─── Sleep (9 cards) ──────────────────────────────────────────
  {
    id: "slp-01",
    dimension: "sleep",
    scoreRange: [0, 40],
    title: "Somnul scurt crește cortizolul și grăsimea",
    insight:
      "Când dormi sub 6 ore, cortizolul crește cu 37% și corpul depozitează grăsime abdominală.",
    action: "Setează o alarmă pentru ora de culcare — țintește 7.5–8 ore de somn.",
    source: "Spiegel et al., JAMA, 1999",
  },
  {
    id: "slp-02",
    dimension: "sleep",
    scoreRange: [0, 45],
    title: "Fiecare oră de somn pierdută = risc vascular",
    insight:
      "O oră de somn pierdută = 14% mai mult risc de accident vascular cerebral.",
    action: "Nu negocia orele de somn — ele sunt fundația sănătății tale metabolice.",
    source: "Cappuccio et al., Eur. Heart J., 2011",
  },
  {
    id: "slp-03",
    dimension: "sleep",
    scoreRange: [10, 50],
    title: "Consistența orarului contează mai mult decât durata",
    insight:
      "O variație de doar 60 minute în ora de culcare crește riscul de boli cardiovasculare cu 24%.",
    action: "Culcă-te la aceeași oră ±30 minute în fiecare zi, inclusiv weekend.",
    source: "Huang et al., Sci. Rep., 2020",
  },
  {
    id: "slp-04",
    dimension: "sleep",
    scoreRange: [0, 40],
    title: "Somnul profund curăță creierul de toxine",
    insight:
      "În somnul profund, sistemul glimfatic elimină amiloid-beta de 10x mai rapid decât în starea de veghe.",
    action: "Evită alcoolul seara — blochează somnul profund cu până la 40%.",
    source: "Xie et al., Science, 2013",
  },
  {
    id: "slp-05",
    dimension: "sleep",
    scoreRange: [0, 35],
    title: "Temperatura camerei afectează calitatea somnului",
    insight:
      "Temperatura ideală pentru somn este 18–19°C. Peste 21°C, somnul profund scade cu 20%.",
    action: "Scade temperatura camerei sub 20°C sau folosește o plapumă mai subțire.",
    source: "Okamoto-Mizuno & Mizuno, Physiol. Behav., 2012",
  },
  {
    id: "slp-06",
    dimension: "sleep",
    scoreRange: [20, 60],
    title: "Lumina albastră seara distruge melatonina",
    insight:
      "2 ore de ecran seara suprimă melatonina cu 22% și întârzie adormirea cu 30 minute.",
    action: "Activează filtrele de lumină albastră la ora 20:00 sau folosește ochelari cu lentile blocate.",
    source: "Chang et al., PNAS, 2015",
  },
  {
    id: "slp-07",
    dimension: "sleep",
    scoreRange: [15, 55],
    title: "Datoria de somn se acumulează",
    insight:
      "6 zile de 6 ore somn produc un deficit cognitiv echivalent cu 24 ore fără somn.",
    action: "Recuperează datoria de somn cu seări de 9+ ore, nu cu dormituri lungi la prânz.",
    source: "Van Dongen et al., Sleep, 2003",
  },
  {
    id: "slp-08",
    dimension: "sleep",
    scoreRange: [30, 70],
    title: "Pauzele de 20 minute refac atenția",
    insight:
      "Un pui de somn de 20 minute crește vigilența cu 54% și performanța cognitivă cu 34%.",
    action: "Dacă ești obosit după-amiaza, ia un power nap de 15–20 minute înainte de 15:00.",
    source: "Hayashi et al., Sleep, 2005",
  },
  {
    id: "slp-09",
    dimension: "sleep",
    scoreRange: [0, 40],
    title: "Somnul REM consolidează învățarea emoțională",
    insight:
      "Privarea de REM crește reactivitatea emoțională cu 60% și scade capacitatea de a recunoaște expresii faciale.",
    action: "Nu te trezi cu alarmă în mijlocul ciclului REM — folosește un tracker de somn pentru timing.",
    source: "Walker & van der Helm, Curr. Biol., 2009",
  },

  // ─── ANS (8 cards) ────────────────────────────────────────────
  {
    id: "ans-01",
    dimension: "ans",
    scoreRange: [0, 40],
    title: "Ritmul cardiac în repaus arată stresul netratat",
    insight:
      "Ritmul cardiac în repaus crește cu 5 bpm pentru fiecare punct de stres netratat.",
    action: "Măsoară-ți pulsul dimineața — dacă e peste 70, adaugă 10 minute de respirație 4-7-8.",
    source: "Thayer et al., Am. J. Cardiol., 2010",
  },
  {
    id: "ans-02",
    dimension: "ans",
    scoreRange: [0, 45],
    title: "Meditația scade cortizolul semnificativ",
    insight:
      "Meditația de 10 minute scade cortizolul cu 23% — echivalent cu 1 oră de somn profund.",
    action: "Începe ziua cu 10 minute de meditație ghidată — aplicații ca Insight Timer sunt gratuite.",
    source: "Turakitwan et al., J. Med. Assoc. Thai, 2013",
  },
  {
    id: "ans-03",
    dimension: "ans",
    scoreRange: [10, 55],
    title: "Variabilitatea ritmului cardiac = reziliență",
    insight:
      "HRV crescută corelează cu flexibilitatea emoțională și capacitatea de recuperare după stres.",
    action: "Măsoară-ți HRV dimineața — respirația diafragmatică 5 minute o crește cu 15%.",
    source: "Laborde et al., Front. Physiol., 2017",
  },
  {
    id: "ans-04",
    dimension: "ans",
    scoreRange: [0, 40],
    title: "Stresul cronic accelerează îmbătrânirea telomerelor",
    insight:
      "Femeile cu stres cronic au telomere scurte cu echivalentul a 10 ani de îmbătrânire suplimentară.",
    action: "Identifică cel mai mare factor de stres și redu-l cu 20% această săptămână.",
    source: "Epel et al., PNAS, 2004",
  },
  {
    id: "ans-05",
    dimension: "ans",
    scoreRange: [20, 60],
    title: "Expoziția la frig antrenează sistemul nervos",
    insight:
      "Dușurile reci de 30 secunde cresc noradrenalina cu 200–300% și îmbunătățesc tonusul vagal.",
    action: "Încheie dușul cu 30 secunde de apă rece — crește progresiv la 2 minute.",
    source: "Shevchuk, Med. Hypotheses, 2008",
  },
  {
    id: "ans-06",
    dimension: "ans",
    scoreRange: [15, 55],
    title: "Respirația 4-7-8 resetează sistemul nervos",
    insight:
      "Expirația prelungită activează nervul vag, reduzând pulsul cu 10–15 bpm în 2 minute.",
    action: "Inspiră 4 sec, ține 7 sec, expiră 8 sec — repetă de 4 ori înainte de culcare.",
    source: "Zaccaro et al., Front. Hum. Neurosci., 2018",
  },
  {
    id: "ans-07",
    dimension: "ans",
    scoreRange: [0, 35],
    title: "Socializarea reduce markerii inflamației",
    insight:
      "Izolarea socială crește IL-6 și CRP la fel ca fumatul — factori de risc independenți pentru boli cardiovasculare.",
    action: "Planifică minim o întâlnire socială pe săptămână — față în față, nu doar online.",
    source: "Steptoe et al., PNAS, 2013",
  },
  {
    id: "ans-08",
    dimension: "ans",
    scoreRange: [25, 65],
    title: "Gratitudinea reconfigurează creierul",
    insight:
      "3 săptămâni de jurnal de gratitudine cresc activitatea cortexului prefrontal medial cu 25%.",
    action: "Scrie 3 lucruri pentru care ești recunoscător înainte de culcare.",
    source: "Kini et al., J. Positive Psychol., 2016",
  },

  // ─── Movement (8 cards) ───────────────────────────────────────
  {
    id: "mov-01",
    dimension: "movement",
    scoreRange: [0, 40],
    title: "Rezistența întineresc biologic",
    insight:
      "Mișcarea de rezistență 2x/săptămână scade vârsta biologică cu 3.5 ani în medie.",
    action: "Adaugă 2 ședințe de forță pe săptămână — 30 minute sunt suficiente pentru efect.",
    source: "Liu et al., Preventive Med., 2019",
  },
  {
    id: "mov-02",
    dimension: "movement",
    scoreRange: [0, 40],
    title: "Sedentarismul = fumatul ca risc cardiovascular",
    insight:
      "Sedentarismul de 8+ ore crește riscul cardiovascular la fel ca fumatul.",
    action: "Ridică-te la fiecare 50 minute — 5 minute de mișcare scade riscul cu 30%.",
    source: "Biswas et al., Ann. Intern. Med., 2015",
  },
  {
    id: "mov-03",
    dimension: "movement",
    scoreRange: [15, 55],
    title: "Plimbările rapide protejează creierul",
    insight:
      "40 minute de mers rapid de 3 ori/săptămână măresc hipocampul cu 2% — zona memoriei.",
    action: "Înlocuiește o ședință de transport auto cu 30 minute de mers pe jos.",
    source: "Erickson et al., PNAS, 2011",
  },
  {
    id: "mov-04",
    dimension: "movement",
    scoreRange: [0, 45],
    title: "Mișcarea dimineața stabilizează ritmul circadian",
    insight:
      "Exercițiul matinal avansează ceasul circadian cu 30 minute și îmbunătățește calitatea somnului cu 65%.",
    action: "Fă exerciții moderate în prima oră după trezire — chiar și o plimbare contează.",
    source: "Youngstedt et al., Physiol. Rep., 2019",
  },
  {
    id: "mov-05",
    dimension: "movement",
    scoreRange: [20, 60],
    title: "NEAT-ul contează mai mult decât crezi",
    insight:
      "NEAT (mișcare non-exercițiu) poate varia cu 2000 kcal/zi între persoane — diferența dintre a fi sedentar și activ.",
    action: "Folosește scări în loc de lift, mergi la telefon, fă curățenie — orice mișcare contează.",
    source: "Levine, Science, 2004",
  },
  {
    id: "mov-06",
    dimension: "movement",
    scoreRange: [10, 50],
    title: "Exercițiul de rezistență protejează mușchii și oasele",
    insight:
      "După 30 ani, pierzi 3–8% din masa musculară pe decadă. Rezistența inversează complet acest declin.",
    action: "Include exerciții compound — squats, deadlifts, presă — de 2 ori pe săptămână.",
    source: "Volpi et al., J. Am. Geriatr. Soc., 2004",
  },
  {
    id: "mov-07",
    dimension: "movement",
    scoreRange: [25, 65],
    title: "Stretchingul reduce cortizolul",
    insight:
      "10 minute de stretching zilnic reduc cortizolul cu 15% și îmbunătățesc flexibilitatea arterială.",
    action: "Adaugă 10 minute de stretching seara — foc pe șolduri, umeri și coloană.",
    source: "Kojima et al., J. Phys. Ther. Sci., 2012",
  },
  {
    id: "mov-08",
    dimension: "movement",
    scoreRange: [30, 70],
    title: "Cardio moderat este ideal — nu extremes",
    insight:
      "Zonele de ritm cardiac 2–3 (60–75% max HR) optimizează funcția mitocondrială fără a crește inflamația.",
    action: "Țintește 150 minute/săptămână de cardio moderat — unde poți conversa în timp ce mergi.",
    source: "Joyner & Coyle, J. Physiol., 2008",
  },

  // ─── Light (8 cards) ──────────────────────────────────────────
  {
    id: "lit-01",
    dimension: "light",
    scoreRange: [0, 40],
    title: "Lumina dimineții resetează ceasul circadian",
    insight:
      "Lumina dimineții (10,000 lux) resetează ceasul circadian în 3 zile.",
    action: "Ieși afară 15 minute în prima oră după trezire — chiar pe cer noros lumina e suficientă.",
    source: "Rooney et al., Sleep Med. Rev., 2022",
  },
  {
    id: "lit-02",
    dimension: "light",
    scoreRange: [0, 45],
    title: "Ecranele seara întârzie melatonina",
    insight:
      "Expunerea la ecrane seara întârzie melatonina cu 1.5 ore și reduce somnul profund cu 20%.",
    action: "Oprește ecranele cu 90 minute înainte de culcare sau folosește filtre roșii intense.",
    source: "Chang et al., PNAS, 2015",
  },
  {
    id: "lit-03",
    dimension: "light",
    scoreRange: [10, 50],
    title: "Lumina roșie seara pregătește somnul",
    insight:
      "Lumina roșie/ambră seara crește melatonina cu 58% comparativ cu lumina albă.",
    action: "Folosește becuri calde (sub 2700K) în dormitor și baie după ora 20:00.",
    source: "Wahl et al., Chronobiol. Int., 2019",
  },
  {
    id: "lit-04",
    dimension: "light",
    scoreRange: [0, 40],
    title: "Lipsa luminii naturale = scădere vitamina D",
    insight:
      "Mai puțin de 30 minute de lumină naturală pe zi crește riscul de deficiență de vitamina D cu 50%.",
    action: "Ieși afară la prânz pentru 15 minute — soarele de amiază sintetizează vitamina D eficient.",
    source: "Holick, N. Engl. J. Med., 2007",
  },
  {
    id: "lit-05",
    dimension: "light",
    scoreRange: [15, 55],
    title: "Lumina artificială noaptea perturbă metabolismul",
    insight:
      "Somnul cu lumină ambientală crește rezistența la insulină cu 22% și ritmul cardiac dimineața.",
    action: "Folosește o mască de somn sau faceți complet întuneric în dormitor — zero lumini standby.",
    source: "Mason et al., Sleep, 2022",
  },
  {
    id: "lit-06",
    dimension: "light",
    scoreRange: [20, 60],
    title: "Vitamina D modulează imunitatea",
    insight:
      "Nivelurile optime de vitamina D (40–60 ng/ml) reduc infecțiile respiratorii cu 42%.",
    action: "Verifică-ți nivelul de 25(OH)D — dacă e sub 30 ng/ml, suplimentează cu 2000–4000 UI/zi.",
    source: "Martineau et al., BMJ, 2017",
  },
  {
    id: "lit-07",
    dimension: "light",
    scoreRange: [30, 70],
    title: "Lumina regulată = energie constantă",
    insight:
      "Când primești lumină puternică dimineața și întuneric seara, cortizolul urmează un curba naturală — energic zi, calm noapte.",
    action: "Creează un ritual de lumină: 10 min soare dimineața, lumini calde seara, întuneric total la culcare.",
    source: "Duffy & Wright, Sleep Med. Clin., 2005",
  },
  {
    id: "lit-08",
    dimension: "light",
    scoreRange: [0, 40],
    title: "Lumina albastră dimineața sporește vigilența",
    insight:
      "30 minute de lumină albastră intensă dimineața cresc vigilența cu 45% și reduc somnolența diurnă.",
    action: "Folosește o lampă de lumină albă (10,000 lux) în primele 30 minute după trezire iarna.",
    source: "Viola et al., Chronobiol. Int., 2008",
  },

  // ─── Subjective (8 cards) ──────────────────────────────────────
  {
    id: "sub-01",
    dimension: "subjective",
    scoreRange: [0, 40],
    title: "Percepția propriei sănătăți e predictor puternic",
    insight:
      "Percepția propriei sănătăți e predictor mai bun decât colesterolul pentru mortalitate.",
    action: "Fii sincer în check-in-uri — raportarea corectă e primul pas spre îmbunătățire.",
    source: "Idler & Benyamini, J. Gerontol., 1997",
  },
  {
    id: "sub-02",
    dimension: "subjective",
    scoreRange: [10, 50],
    title: "Scopul în viață protejează inima",
    insight:
      "Persoanele cu scop în viață au cu 15% mai puține evenimente cardiovasculare.",
    action: "Defineste-ți un scop clar pentru această săptămână — oricât de mic, contează.",
    source: "Cohen et al., Psychosom. Med., 2016",
  },
  {
    id: "sub-03",
    dimension: "subjective",
    scoreRange: [0, 45],
    title: "Optimismul reduce inflamația sistemică",
    insight:
      "Optimiștii au niveluri de CRP cu 28% mai mici și IL-6 cu 23% mai mici decât pesimiștii.",
    action: "Scrie o predicție pozitivă despre săptămâna ce urmează — antrenează creierul să caute oportunități.",
    source: "Roy et al., Brain Behav. Immun., 2019",
  },
  {
    id: "sub-04",
    dimension: "subjective",
    scoreRange: [15, 55],
    title: "Conexiunea socială e factor de supraviețuire",
    insight:
      "Izolarea socială crește riscul de mortalitate cu 26% — echivalent cu fumatul 15 țigări/zi.",
    action: "Planifică o conversație de 15 minute cu cineva drag — față în față sau telefon.",
    source: "Holt-Lunstad et al., Perspect. Psychol. Sci., 2015",
  },
  {
    id: "sub-05",
    dimension: "subjective",
    scoreRange: [20, 60],
    title: "Jurnalul de stări refac reziliența",
    insight:
      "Scrierea emoțiilor negative timp 15 minute/zi reduce vizitele medicale cu 50% în 3 luni.",
    action: "Înainte de culcare, scrie ce te-a frustrat azi și ce ai învățat din asta.",
    source: "Pennebaker & Beall, J. Consult. Clin. Psychol., 1986",
  },
  {
    id: "sub-06",
    dimension: "subjective",
    scoreRange: [0, 40],
    title: "Stresul perceptual contează mai mult decât cel real",
    insight:
      "Persoanele care percep stresul ca dăunător au cu 43% mai mult risc de mortalitate — cele care nu percep stresul ca rău, nu.",
    action: "Reîncadrează stresul: 'Acest lucru mă provoacă să cresc' în loc de 'Acest lucru mă distruge'.",
    source: "Keller et al., Health Psychol., 2012",
  },
  {
    id: "sub-07",
    dimension: "subjective",
    scoreRange: [25, 65],
    title: "Autocompasiunea accelerează recuperarea",
    insight:
      "Persoanele cu autocompasiune ridicată se recuperează mai repede după eșecuri și au imunitate mai bună.",
    action: "Când greșești, spune-ți ce ai spune unui bun prieten — nu critica dure.",
    source: "Neff & Germer, J. Clin. Psychol., 2018",
  },
  {
    id: "sub-08",
    dimension: "subjective",
    scoreRange: [30, 70],
    title: "Flow-ul protejează against burnout",
    insight:
      "Stările de flow frecvente reduc burnout-ul cu 30% și cresc satisfacția profesională cu 40%.",
    action: "Identifică o activitate care te absorbe complet — rezervă 45 minute zilnice pentru ea.",
    source: "Fuller et al., J. Occup. Health Psychol., 2003",
  },
];