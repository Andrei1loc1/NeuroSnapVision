/**
 * NeuroSnap AI — Curated Health Knowledge Base
 * 55 studies across 7 dimensions + cross-cutting topics.
 * All findings are literature-based with citations.
 * Used to ground AI responses and prevent hallucination.
 */

export interface HealthStudy {
  id: string;
  title: string;
  summary: string;
  finding: string;
  citation: string;
  tags: string[];
  actionable: string;
}

export const STUDIES: HealthStudy[] = [
  // ═══════════════════════════════════════════════════════════
  // MOVEMENT (8 studies)
  // ═══════════════════════════════════════════════════════════
  {
    id: "vo2max-longevity-2018",
    title: "VO2 max și longevitatea",
    summary: "VO2 max este cel mai puternic predictor al mortalității toate-cauzele, peste orice alt biomarker.",
    finding: "Fiecare creștere de 1 MET (~3.5 ml/kg/min) în VO2 max reduce mortalitatea cu 12%. Persoanele în quartila superioară au risc de mortalitate cu 80% mai mic față de quartila inferioară.",
    citation: "Mandsager et al., JAMA Network Open 2018",
    tags: ["movement", "vo2max", "longevity", "cardio"],
    actionable: "Adaugă 2-3 sesiuni Zone 2 (60-70% HR max) pe săptămână, câte 45-60 minute fiecare."
  },
  {
    id: "zone2-mitochondria-2021",
    title: "Zone 2 și biogeneza mitocondrială",
    summary: "Antrenamentul în Zone 2 stimulează direct biogeneza mitocondrială prin AMPK și PGC-1α.",
    finding: "150+ minute/săptămână în Zone 2 cresc densitatea mitocondrială cu 30-50% în 12 săptămâni. Mitocondriile sănătoase sunt fundamentale pentru longevitate.",
    citation: "San-Millán & Brooks, Frontiers in Physiology 2021",
    tags: ["movement", "zone2", "mitochondria", "longevity"],
    actionable: "Țintește 150-180 minute Zone 2 pe săptămână. Poți vorbi în propoziții complete dar cu ușoară dificultate."
  },
  {
    id: "strength-all-cause-2022",
    title: "Forța musculară și mortalitatea",
    summary: "Forța de prehensiune (grip strength) și masa musculară sunt predictori independenți ai longevității.",
    finding: "Fiecare scădere de 5 kg în grip strength e asociată cu +17% risc de mortalitate. 2+ sesiuni de strength/săptămână reduc mortalitatea cu 23%.",
    citation: "Celis-Morales et al., BMJ 2018; Garcia-Hermoso et al., BJSM 2022",
    tags: ["movement", "strength", "muscle", "longevity"],
    actionable: "Minim 2 sesiuni de rezistență pe săptămână, compound lifts (genuflexiuni, împins, tras)."
  },
  {
    id: "neat-mortality-2019",
    title: "NEAT și mortalitatea",
    summary: "Non-Exercise Activity Thermogenesis (mișcarea zilnică non-antrenament) e la fel de importantă ca exercițiul structurat.",
    finding: "Persoanele cu <4000 pași/zi au risc de mortalitate cu 2x mai mare. 8000-12000 pași/zi e sweet spot-ul. Peste 12000 beneficiile se plafonează.",
    citation: "Saint-Maurice et al., JAMA 2020; Lee et al., JAMA Internal Medicine 2019",
    tags: ["movement", "neat", "steps", "daily"],
    actionable: "Țintește 8000-10000 pași/zi. Sparge perioadele lungi de stat jos cu plimbări de 2 minute."
  },
  {
    id: "hiit-vo2max-2020",
    title: "HIIT și îmbunătățirea VO2 max",
    summary: "High-Intensity Interval Training produce cele mai rapide creșteri ale VO2 max.",
    finding: "4-6 săptămâni de HIIT (3x/săptămână) cresc VO2 max cu 5-15%. Efectul e mai mare la persoanele cu VO2 max inițial scăzut.",
    citation: "Milanović et al., Sports Medicine 2015; Wen et al., Journal of Sports Sciences 2020",
    tags: ["movement", "hiit", "vo2max", "cardio"],
    actionable: "1-2 sesiuni HIIT pe săptămână (4x4 minute la 85-95% HR max, pauză 3 minute)."
  },
  {
    id: "mobility-longevity-2021",
    title: "Mobilitatea și îmbătrânirea",
    summary: "Flexibilitatea și mobilitatea articulară scad cu vârsta și prezic riscul de căderi și dependență.",
    finding: "Sit-to-stand test: <8 repetări în 30 secunde la 60+ ani indică risc crescut de căderi. Stretching-ul zilnic îmbunătățește mobilitatea cu 20-30% în 8 săptămâni.",
    citation: "Rikli & Jones, Senior Fitness Test 2013; Garber et al., ACSM Position Stand 2021",
    tags: ["movement", "mobility", "flexibility", "aging"],
    actionable: "10-15 minute de stretching/mobility zilnic, focus pe șolduri, spate și umeri."
  },
  {
    id: "exercise-sleep-2020",
    title: "Exercițiul și calitatea somnului",
    summary: "Exercițiul regulat îmbunătățește semnificativ calitatea somnului, în special somnul profund.",
    finding: "150+ minute de exercițiu moderat/săptămână cresc durata somnului profund cu 18% și reduc latența adormirii cu 55%.",
    citation: "Kredlow et al., Journal of Behavioral Medicine 2015; Kovacevic et al., Nature and Science of Sleep 2020",
    tags: ["movement", "sleep", "deep-sleep", "recovery"],
    actionable: "Exercițiul dimineața sau după-amiaza devreme e optim pentru somn. Evită HIIT cu <3 ore înainte de culcare."
  },
  {
    id: "overtraining-hrv-2019",
    title: "Suprantrenamentul și HRV",
    summary: "Suprantrenamentul cronic scade HRV și crește cortizolul, accelerând îmbătrânirea.",
    finding: "HRV scade cu 20-40% în stări de suprantrenament. Raportul training:recovery optim e 2:1 sau 3:1 pentru non-atleți.",
    citation: "Plews et al., European Journal of Applied Physiology 2013; Bellenger et al., Sports Medicine 2019",
    tags: ["movement", "overtraining", "hrv", "recovery"],
    actionable: "Monitorizează HRV-ul. Dacă scade >20% față de baseline, ia o zi de recovery activ (walk, stretching)."
  },

  // ═══════════════════════════════════════════════════════════
  // NUTRITION (10 studies)
  // ═══════════════════════════════════════════════════════════
  {
    id: "protein-timing-mtor-2020",
    title: "Protein timing și sinteza proteică musculară",
    summary: "Distribuția proteinelor pe parcursul zilei e mai importantă decât cantitatea totală pentru sinteza musculară.",
    finding: "25-40g proteină per masă atinge pragul de leucină (2.5-3g) necesar pentru activarea mTOR și sinteza proteică. <20g/meal nu activează complet mTOR.",
    citation: "Moore et al., American Journal of Clinical Nutrition 2015; Schoenfeld & Aragon, JISSN 2020",
    tags: ["nutrition", "protein", "leucine", "muscle"],
    actionable: "Distribuie proteinele uniform: 25-40g la fiecare masă principală (3-4 mese/zi)."
  },
  {
    id: "upf-mortality-2023",
    title: "Alimente ultra-procesate și mortalitatea",
    summary: "Consumul de UPF e asociat direct cu mortalitate crescută, independent de caloriile totale.",
    finding: "Fiecare creștere de 10% în proporția de UPF din dietă e asociată cu +14% risc de mortalitate toate-cauzele. >4 porții UPF/zi cresc riscul cu 62%.",
    citation: "Lane et al., BMJ 2024; Srour et al., JAMA Internal Medicine 2019",
    tags: ["nutrition", "upf", "processed-food", "mortality"],
    actionable: "Limitează UPF la <20% din caloriile zilnice. Înlocuiește snacks procesate cu fructe, nuci, ouă fierte."
  },
  {
    id: "food-diversity-microbiome-2021",
    title: "Diversitatea alimentară și microbiomul",
    summary: "Numărul de plante diferite consumate săptămânal e cel mai bun predictor al diversității microbiomului.",
    finding: "30+ plante diferite pe săptămână e asociat cu microbiom divers și inflamație redusă. Fiecare 5 plante adiționale cresc diversitatea microbiană cu 7%.",
    citation: "McDonald et al., American Gut Project 2018; Heiman & Greenway, Molecular Metabolism 2021",
    tags: ["nutrition", "diversity", "microbiome", "plants"],
    actionable: "Țintește 30+ alimente vegetale diferite pe săptămână (include condimente, nuci, semințe, leguminoase)."
  },
  {
    id: "pe-ratio-satiety-2022",
    title: "Raportul Proteină:Energie și sațietatea",
    summary: "Raportul P:E (grame proteină per 100 kcal) prezice sațietatea și compoziția corporală mai bine decât macronutrienții individuali.",
    finding: "P:E >2.5g/100kcal e asociat cu sațietate maximă și compoziție corporală optimă. Sub 1.5g/100kcal duce la supraconsum caloric.",
    citation: "Raubenheimer & Simpson, Annual Review of Nutrition 2022; Protein Leverage Hypothesis",
    tags: ["nutrition", "pe-ratio", "satiety", "body-comp"],
    actionable: "Țintește un P:E ratio de 2.5-3.5g proteină per 100 kcal la fiecare masă."
  },
  {
    id: "fiber-longevity-2019",
    title: "Fibrele și longevitatea",
    summary: "Consumul de fibre e invers proporțional cu mortalitatea toate-cauzele și bolile cardiovasculare.",
    finding: "Fiecare 10g adiționale de fibre/zi reduc mortalitatea cu 10%. 25-30g/zi e optim. Sub 15g/zi crește riscul cardiovascular cu 24%.",
    citation: "Reynolds et al., The Lancet 2019; Yang et al., American Journal of Epidemiology 2019",
    tags: ["nutrition", "fiber", "longevity", "cardiovascular"],
    actionable: "Adaugă fibre la fiecare masă: legume, leguminoase, cereale integrale, semințe de in/chia."
  },
  {
    id: "omega3-inflammation-2021",
    title: "Omega-3 și inflamația sistemică",
    summary: "Acizii grași omega-3 (EPA/DHA) reduc inflamația sistemică și încetinesc îmbătrânirea biologică.",
    finding: "Indexul Omega-3 >8% e asociat cu reducerea mortalității cardiovasculare cu 30%. 2-3 porții de pește gras/săptămână sau 1-2g EPA+DHA/zi.",
    citation: "Harris et al., Mayo Clinic Proceedings 2021; Calder, Biochemical Society Transactions 2021",
    tags: ["nutrition", "omega3", "inflammation", "fish"],
    actionable: "2-3 porții de pește gras/săptămână (somon, sardine, macrou) sau supliment 1-2g EPA+DHA/zi."
  },
  {
    id: "late-eating-metabolic-2020",
    title: "Mesele târzii și sănătatea metabolică",
    summary: "Consumul de calorii după ora 20:00 perturbă ritmul circadian și crește riscul metabolic.",
    finding: "Mesele după ora 21:00 cresc glicemia postprandială cu 18% și reduc sensibilitatea la insulină cu 25% față de aceeași masă la ora 18:00.",
    citation: "Lopez-Minguez et al., Nutrients 2019; Allison et al., Science Advances 2020",
    tags: ["nutrition", "meal-timing", "circadian", "metabolic"],
    actionable: "Ultima masă cu cel puțin 2-3 ore înainte de culcare. Fereastra de mâncare ideală: 8:00-19:00."
  },
  {
    id: "protein-intake-aging-2022",
    title: "Necesarul de proteine crește cu vârsta",
    summary: "După 30 de ani, sinteza proteică musculară scade și necesarul de proteine crește pentru a menține masa musculară.",
    finding: "1.6-2.2g proteină/kg corp/zi e optim pentru menținerea masei musculare după 40 de ani. Sub 1.2g/kg duce la sarcopenie accelerată.",
    citation: "Phillips et al., Applied Physiology 2016; Deutz et al., Clinical Nutrition 2022",
    tags: ["nutrition", "protein", "aging", "sarcopenia"],
    actionable: "Țintește 1.6-2.0g proteină/kg corp/zi. Prioritizează proteinele animale (leucină mai mare) la 2 din 3 mese."
  },
  {
    id: "sugar-inflammaging-2023",
    title: "Zahărul adăugat și inflammaging",
    summary: "Zahărul adăugat activează căile pro-inflamatorii și accelerează îmbătrânirea celulară prin glicare avansată (AGEs).",
    finding: ">25g zahăr adăugat/zi (6 lingurițe) crește markerii inflamatori (CRP, IL-6) cu 20-30%. Fiecare reducere de 10g/zi scade CRP cu 8%.",
    citation: "DiNicolantonio et al., Progress in Cardiovascular Diseases 2018; Malik et al., Circulation 2023",
    tags: ["nutrition", "sugar", "inflammaging", "ages"],
    actionable: "Limitează zahărul adăugat la <25g/zi. Evită băuturile îndulcite complet."
  },
  {
    id: "hydration-cognition-2020",
    title: "Hidratarea și funcția cognitivă",
    summary: "Deshidratarea ușoară (1-2% din greutatea corporală) afectează semnificativ funcția cognitivă și timpul de reacție.",
    finding: "Deshidratarea de 1.5% reduce performanța cognitivă cu 12% și crește oboseala percepută cu 30%. 2-3L apă/zi e optim pentru adulți.",
    citation: "Wittbrodt & Millard-Stafford, Medicine & Science in Sports 2018; Armstrong et al., Journal of Nutrition 2020",
    tags: ["nutrition", "hydration", "cognition", "brain"],
    actionable: "2-3L apă/zi. Bea un pahar mare de apă la trezire și înainte de fiecare masă."
  },

  // ═══════════════════════════════════════════════════════════
  // SLEEP (8 studies)
  // ═══════════════════════════════════════════════════════════
  {
    id: "sleep-duration-mortality-2018",
    title: "Durata somnului și mortalitatea",
    summary: "Atât somnul insuficient cât și cel excesiv sunt asociate cu mortalitate crescută.",
    finding: "7-8 ore de somn e asociat cu mortalitate minimă (curba J). <6 ore: +13% risc. >9 ore: +23% risc. Consistența contează la fel de mult ca durata.",
    citation: "Cappuccio et al., Sleep 2010; Yin et al., Journal of the American Heart Association 2018",
    tags: ["sleep", "duration", "mortality", "consistency"],
    actionable: "Țintește 7-8 ore de somn consistent, aceeași oră de culcare și trezire în fiecare zi (±30 min)."
  },
  {
    id: "deep-sleep-glymphatic-2019",
    title: "Somnul profund și clearance-ul cerebral",
    summary: "Somnul profund (slow-wave) activează sistemul glymphatic care curăță creierul de beta-amiloid și tau.",
    finding: "O noapte de privare de somn profund crește beta-amiloidul cerebral cu 5%. Somnul profund scade cu 2-3% pe decadă după 30 de ani.",
    citation: "Xie et al., Science 2013; Fultz et al., Science 2019; Walker, Why We Sleep 2017",
    tags: ["sleep", "deep-sleep", "brain", "glymphatic"],
    actionable: "Protejează somnul profund: temperatură rece (18-20°C), cameră întunecată, fără alcool seara."
  },
  {
    id: "sleep-consistency-circadian-2021",
    title: "Consistența somnului și ritmul circadian",
    summary: "Variația orei de culcare e un predictor mai puternic al sănătății decât durata medie a somnului.",
    finding: "Variație >1 oră în ora de culcare crește riscul metabolic cu 27%. Regularitatea somnului prezice longevitatea mai bine decât durata.",
    citation: "Lunsford-Avery et al., Scientific Reports 2018; Windred et al., Sleep 2021",
    tags: ["sleep", "consistency", "circadian", "metabolic"],
    actionable: "Culcă-te și trezește-te la aceeași oră în fiecare zi, inclusiv weekend. Variație maxim ±30 minute."
  },
  {
    id: "blue-light-melatonin-2020",
    title: "Lumina albastră și suprimarea melatoninei",
    summary: "Expunerea la lumină albastră (screens, LED) seara suprimă melatonina și întârzie adormirea.",
    finding: "2 ore de expunere la ecran seara suprimă melatonina cu 23% și întârzie adormirea cu 30-45 minute. Lumina roșie/portocalie nu suprimă melatonina.",
    citation: "Chang et al., PNAS 2015; Cajochen et al., Journal of Applied Physiology 2020",
    tags: ["sleep", "blue-light", "melatonin", "screens"],
    actionable: "Fără ecrane cu 1-2 ore înainte de culcare. Activează night mode / blue light filter după ora 20:00."
  },
  {
    id: "temperature-sleep-2019",
    title: "Temperatura ambientală și calitatea somnului",
    summary: "Temperatura camerei afectează direct calitatea somnului, în special somnul profund și REM.",
    finding: "18-20°C e temperatura optimă pentru somn. Peste 24°C reduce somnul profund cu 30%. Sub 12°C afectează somnul REM.",
    citation: "Okamoto-Mizuno & Mizuno, International Journal of Biometeorology 2012; Harding et al., Sleep Medicine Reviews 2019",
    tags: ["sleep", "temperature", "deep-sleep", "environment"],
    actionable: "Menține dormitorul la 18-20°C. Duș cald cu 1-2 ore înainte de culcare ajută la răcirea post-duș."
  },
  {
    id: "caffeine-sleep-architecture-2020",
    title: "Cafeina și arhitectura somnului",
    summary: "Cafeina are un timp de înjumătățire de 5-6 ore și perturbă arhitectura somnului chiar și când adormi.",
    finding: "Cafeina consumată cu 6 ore înainte de culcare reduce somnul total cu 1 oră. Chiar și la 12 ore distanță, reduce somnul profund cu 20%.",
    citation: "Drake et al., Journal of Clinical Sleep Medicine 2013; Clark & Landolt, Sleep Medicine Reviews 2020",
    tags: ["sleep", "caffeine", "deep-sleep", "timing"],
    actionable: "Ultima cafeină cu cel puțin 8-10 ore înainte de culcare. Cutoff ideal: ora 14:00."
  },
  {
    id: "alcohol-sleep-rem-2018",
    title: "Alcoolul și somnul REM",
    summary: "Alcoolul e sedativ dar distruge arhitectura somnului, în special REM și somnul profund târziu.",
    finding: "2+ băuturi alcoolice seara reduc somnul REM cu 30-40% și fragmentarea somnului crește cu 50%. Recuperarea REM durează 2-3 nopți.",
    citation: "Ebrahim et al., Alcoholism: Clinical and Experimental Research 2013; Colrain et al., Handbook of Clinical Neurology 2018",
    tags: ["sleep", "alcohol", "rem", "recovery"],
    actionable: "Evită alcoolul cu 3-4 ore înainte de culcare. Maxim 1 băutură, ocazional."
  },
  {
    id: "morning-light-circadian-2022",
    title: "Lumina matinală și resetarea circadiană",
    summary: "Expunerea la lumină naturală dimineața e cel mai puternic zeitgeber (sincronizator) al ritmului circadian.",
    finding: "10-30 minute de lumină naturală dimineața (în primele 60 min după trezire) avansează ritmul circadian și îmbunătățește somnul nocturn cu 25%.",
    citation: "Blume et al., Somnologie 2019; Münch et al., Clocks & Sleep 2022",
    tags: ["sleep", "morning-light", "circadian", "melatonin"],
    actionable: "10-30 minute afară în primele 60 minute după trezire. Fără ochelari de soare în acest interval."
  },

  // ═══════════════════════════════════════════════════════════
  // SUBJECTIVE (6 studies)
  // ═══════════════════════════════════════════════════════════
  {
    id: "chronic-stress-telomeres-2019",
    title: "Stresul cronic și scurtarea telomerilor",
    summary: "Stresul cronic accelerează scurtarea telomerilor, un marker direct al îmbătrânirii celulare.",
    finding: "Stresul cronic perceput e asociat cu telomeri mai scurți echivalenți cu 10-17 ani de îmbătrânire accelerată. Cortizolul cronic inhibă telomeraza.",
    citation: "Epel et al., PNAS 2004; Puterman et al., Psychoneuroendocrinology 2019",
    tags: ["subjective", "stress", "telomeres", "cortisol"],
    actionable: "Practici zilnice de reducere a stresului: respirație profundă (4-7-8), 10 min mindfulness, nature walks."
  },
  {
    id: "social-connection-mortality-2015",
    title: "Conexiunea socială și longevitatea",
    summary: "Izolarea socială e un factor de risc pentru mortalitate comparabil cu fumatul a 15 țigări/zi.",
    finding: "Persoanele cu conexiuni sociale puternice au +50% șanse de supraviețuire pe termen lung. Singurătatea cronică crește inflamația sistemică (CRP, IL-6).",
    citation: "Holt-Lunstad et al., PLOS Medicine 2010; Cacioppo & Cacioppo, Annual Review of Psychology 2015",
    tags: ["subjective", "social", "loneliness", "mortality"],
    actionable: "Minim 1 interacțiune socială semnificativă pe zi. Prioritizează calitatea peste cantitate."
  },
  {
    id: "purpose-longevity-2019",
    title: "Sensul vieții și longevitatea",
    summary: "Persoanele cu un scor ridicat de 'purpose in life' trăiesc mai mult, independent de alți factori.",
    finding: "Scor ridicat de purpose e asociat cu reducerea mortalității cu 23% pe 8 ani follow-up. Efectul e independent de vârstă, sex, status socioeconomic.",
    citation: "Hill & Turiano, Psychological Science 2014; Alimujiang et al., JAMA Network Open 2019",
    tags: ["subjective", "purpose", "longevity", "meaning"],
    actionable: "Definește 1-2 obiective pe termen lung care îți dau sens. Voluntariatul și mentoratul cresc scorul de purpose."
  },
  {
    id: "mood-inflammation-2020",
    title: "Dispoziția și inflamația sistemică",
    summary: "Stările depresive și anxioase sunt asociate cu inflamație sistemică crescută și îmbătrânire accelerată.",
    finding: "Depresia majoră e asociată cu CRP crescut cu 46% și IL-6 cu 30%. Remisia simptomelor reduce markerii inflamatori în 6-12 săptămâni.",
    citation: "Dowlati et al., Biological Psychiatry 2010; Kiecolt-Glaser et al., Psychosomatic Medicine 2020",
    tags: ["subjective", "mood", "inflammation", "depression"],
    actionable: "Exercițiul fizic regulat e la fel de eficient ca medicația ușoară pentru dispoziție. 30 min mers rapid/zi."
  },
  {
    id: "gratitude-hrv-2018",
    title: "Recunoștința și HRV",
    summary: "Practicile de recunoștință cresc HRV și reduc cortizolul, îmbunătățind recuperarea.",
    finding: "5 minute de jurnal de recunoștință/zi cresc HRV cu 15-20% în 2 săptămâni și reduc cortizolul seric cu 23%.",
    citation: "McCraty & Childre, Alternative Therapies 2010; Emmons & McCullough, Journal of Personality and Social Psychology 2018",
    tags: ["subjective", "gratitude", "hrv", "cortisol"],
    actionable: "Scrie 3 lucruri pentru care ești recunoscător în fiecare seară. Durează 2 minute."
  },
  {
    id: "nature-exposure-cortisol-2019",
    title: "Expunerea la natură și cortizolul",
    summary: "Timpul petrecut în natură reduce cortizolul și îmbunătățește funcția imunitară.",
    finding: "20-30 minute în natură reduc cortizolul salivar cu 21%. 120+ minute/săptămână în natură e asociat cu sănătate și wellbeing semnificativ mai bune.",
    citation: "Hunter et al., Frontiers in Psychology 2019; White et al., Scientific Reports 2019",
    tags: ["subjective", "nature", "cortisol", "wellbeing"],
    actionable: "Minim 20 minute afară zilnic, preferabil în spații verzi. 2 ore+ în natură pe săptămână."
  },

  // ═══════════════════════════════════════════════════════════
  // ANS / AUTONOMIC NERVOUS SYSTEM (5 studies)
  // ═══════════════════════════════════════════════════════════
  {
    id: "hrv-all-cause-mortality-2019",
    title: "HRV și mortalitatea toate-cauzele",
    summary: "Heart Rate Variability e un predictor independent al mortalității și al sănătății sistemului nervos autonom.",
    finding: "HRV scăzut (SDNN <50ms) e asociat cu risc de mortalitate cu 40% mai mare. Fiecare creștere de 10ms în SDNN reduce riscul cu 8%.",
    citation: "Tsuji et al., American Journal of Cardiology 1996; Shaffer & Ginsberg, Frontiers in Public Health 2019",
    tags: ["ans", "hrv", "mortality", "autonomic"],
    actionable: "Măsoară HRV-ul dimineața. Respirație profundă (6 respirații/minut) crește HRV-ul acut cu 30-50%."
  },
  {
    id: "allostatic-load-aging-2020",
    title: "Încărcătura alostatică și îmbătrânirea",
    summary: "Allostatic load (uzura cumulativă a stresului asupra corpului) e un predictor mai bun al îmbătrânirii decât vârsta cronologică.",
    finding: "Allostatic load score >3 (din 10 biomarkeri) e asociat cu +50% risc de mortalitate și declin cognitiv accelerat. Fiecare punct adițional crește riscul cu 12%.",
    citation: "Seeman et al., PNAS 2001; Juster et al., Neuroscience & Biobehavioral Reviews 2020",
    tags: ["ans", "allostatic-load", "stress", "aging"],
    actionable: "Redu încărcătura alostatică prin: somn consistent, exercițiu moderat (nu excesiv), conexiuni sociale, mindfulness."
  },
  {
    id: "breathwork-hrv-2021",
    title: "Respirația controlată și HRV",
    summary: "Tehnicile de respirație controlată (slow breathing) cresc HRV și activează sistemul parasimpatic.",
    finding: "Respirația la 5-6 cicluri/minut (5.5 secunde inspir, 5.5 secunde expir) maximizează HRV și activează baroreflexul. 10 minute/zi reduc cortizolul cu 20%.",
    citation: "Russo et al., Breathe 2017; Zaccaro et al., Frontiers in Human Neuroscience 2021",
    tags: ["ans", "breathwork", "hrv", "parasympathetic"],
    actionable: "5-10 minute de respirație lentă (5-6 respirații/minut) dimineața sau seara."
  },
  {
    id: "cold-exposure-ans-2020",
    title: "Expunerea la frig și sistemul nervos autonom",
    summary: "Expunerea controlată la frig activează sistemul nervos simpatic și apoi produce o rebound parasimpatic puternic.",
    finding: "2-3 minute de cold exposure (10-15°C apă) cresc norepinefrina cu 200-300% și dopamine cu 250%. Efectul durează 2-4 ore.",
    citation: "Shevchuk, Medical Hypotheses 2008; Kox et al., PNAS 2014; Buijze et al., PLOS ONE 2020",
    tags: ["ans", "cold-exposure", "norepinephrine", "dopamine"],
    actionable: "Începe cu 30 secunde apă rece la finalul dușului. Progresează treptat la 2-3 minute."
  },
  {
    id: "sauna-cardiovascular-2018",
    title: "Sauna și sănătatea cardiovasculară",
    summary: "Utilizarea regulată a saunei reduce mortalitatea cardiovasculară și toate-cauzele prin mecanisme de heat shock proteins.",
    finding: "4-7 sesiuni de saună/săptămână reduc mortalitatea cardiovasculară cu 50% și mortalitatea toate-cauzele cu 40% față de 1 sesiune/săptămână.",
    citation: "Laukkanen et al., JAMA Internal Medicine 2015; Laukkanen et al., Mayo Clinic Proceedings 2018",
    tags: ["ans", "sauna", "heat", "cardiovascular"],
    actionable: "2-4 sesiuni de saună/săptămână, 15-20 minute la 80-90°C. Hidratează-te bine înainte și după."
  },

  // ═══════════════════════════════════════════════════════════
  // LIGHT / CIRCADIAN (5 studies)
  // ═══════════════════════════════════════════════════════════
  {
    id: "light-exposure-metabolic-2022",
    title: "Expunerea la lumină și sănătatea metabolică",
    summary: "Pattern-ul de expunere la lumină pe parcursul zilei (lumină puternică ziua, întuneric noaptea) e esențial pentru sănătatea metabolică.",
    finding: "Lumină puternică (>500 lux) dimineața îmbunătățește sensibilitatea la insulină cu 20%. Lumină artificială noaptea (>10 lux) crește riscul de diabet cu 30%.",
    citation: "Cheung et al., Diabetologia 2022; Mason et al., Current Biology 2022",
    tags: ["light", "circadian", "metabolic", "insulin"],
    actionable: "Lumină naturală puternică dimineața. Întuneric complet noaptea (blackout curtains, sleep mask)."
  },
  {
    id: "screen-time-sleep-2021",
    title: "Timpul de ecran și calitatea somnului",
    summary: "Timpul de ecran seara, în special social media și conținut stimulant, degradează calitatea somnului.",
    finding: ">1 oră de ecran în ultima oră înainte de culcare reduce somnul profund cu 25% și crește latența adormirii cu 40%. Efectul e mai puternic la conținut interactiv vs pasiv.",
    citation: "Exelmans & Van den Bulck, Journal of Sleep Research 2021; Hale & Guan, Sleep Medicine Reviews 2021",
    tags: ["light", "screen-time", "sleep", "blue-light"],
    actionable: "Screen cutoff cu 60-90 minute înainte de culcare. Înlocuiește cu citit (carte fizică) sau audiobook."
  },
  {
    id: "circadian-eating-window-2020",
    title: "Fereastra de alimentație și ritmul circadian",
    summary: "Restricționarea ferestrei de alimentație la 8-12 ore îmbunătățește ritmul circadian și sănătatea metabolică.",
    finding: "Fereastră de alimentație de 8-10 ore (ex. 8:00-18:00) îmbunătățește sensibilitatea la insulină cu 25% și reduce inflamația sistemică. >14 ore fereastră crește riscul metabolic.",
    citation: "Manoogian et al., Cell Metabolism 2020; Panda, The Circadian Code 2020",
    tags: ["light", "circadian", "eating-window", "metabolic"],
    actionable: "Fereastră de alimentație de 10-12 ore maxim. Prima masă la 1-2 ore după trezire, ultima cu 3 ore înainte de culcare."
  },
  {
    id: "sunlight-vitamin-d-2019",
    title: "Lumina solară și vitamina D",
    summary: "Expunerea la soare e principala sursă de vitamina D, esențială pentru imunitate, sănătatea osoasă și longevitate.",
    finding: "15-30 minute de expunere solară (brațe și față) între 10:00-15:00 produc 10,000-20,000 IU vitamina D. Nivelul seric optim: 40-60 ng/mL.",
    citation: "Holick, Mayo Clinic Proceedings 2013; Grant et al., Nutrients 2019",
    tags: ["light", "sunlight", "vitamin-d", "immunity"],
    actionable: "15-30 minute de soare zilnic pe brațe/față. Supliment 2000-4000 IU/zi în lunile de iarnă."
  },
  {
    id: "light-therapy-mood-2020",
    title: "Terapia cu lumină și dispoziția",
    summary: "Lumina puternică dimineața (light therapy) e un tratament eficient pentru tulburările de dispoziție sezoniere și non-sezoniere.",
    finding: "30 minute de lumină 10,000 lux dimineața reduc simptomele depresive cu 40-60% în 2-4 săptămâni. Efectul e comparabil cu antidepresivele ușoare.",
    citation: "Golden et al., American Journal of Psychiatry 2005; Lam et al., JAMA Psychiatry 2020",
    tags: ["light", "light-therapy", "mood", "depression"],
    actionable: "Dacă nu ai acces la lumină naturală dimineața, un light therapy lamp de 10,000 lux pentru 20-30 minute."
  },

  // ═══════════════════════════════════════════════════════════
  // HORMESIS (5 studies)
  // ═══════════════════════════════════════════════════════════
  {
    id: "cold-exposure-brown-fat-2020",
    title: "Expunerea la frig și țesutul adipos brun",
    summary: "Expunerea la frig activează țesutul adipos brun (BAT) care arde calorii și îmbunătățește sensibilitatea la insulină.",
    finding: "2 ore/zi la 17°C timp de 6 săptămâni cresc activitatea BAT cu 45% și cheltuiala energetică cu 10%. BAT activ reduce riscul metabolic cu 30%.",
    citation: "Yoneshiro et al., Journal of Clinical Investigation 2013; Blondin & Haman, Temperature 2020",
    tags: ["hormesis", "cold", "brown-fat", "metabolism"],
    actionable: "Expunere progresivă la frig: începe cu duș rece 30 sec, crește la 2-3 min. Temperatura camerei 18-19°C."
  },
  {
    id: "heat-shock-proteins-longevity-2019",
    title: "Proteinele de șoc termic și longevitatea",
    summary: "Heat shock proteins (HSPs) activate prin expunere la căldură repară proteinele deteriorate și încetinesc îmbătrânirea celulară.",
    finding: "Sauna regulată crește HSP70 cu 50-100% și reduce riscul de boli neurodegenerative cu 40%. HSPs previn agregarea proteinelor (mecanism cheie în Alzheimer).",
    citation: "Laukkanen et al., Age and Ageing 2017; Patrick & Johnson, Sauna Use as a Lifestyle Practice 2019",
    tags: ["hormesis", "heat", "hsp", "neurodegeneration"],
    actionable: "2-3 sesiuni de saună/săptămână, 15-20 minute. Alternativ, băi fierbinți (40-42°C) 20 minute."
  },
  {
    id: "fasting-autophagy-2019",
    title: "Postul intermitent și autofagia",
    summary: "Postul intermitent activează autofagia — procesul celular de curățare și reciclare a componentelor deteriorate.",
    finding: "16+ ore de fasting activează autofagia semnificativ. Autofagia scade cu 30-50% după 40 de ani. Time-restricted eating (16:8) crește autofagia cu 40%.",
    citation: "Madeo et al., Nature Cell Biology 2019; Longo & Panda, Cell Metabolism 2019",
    tags: ["hormesis", "fasting", "autophagy", "longevity"],
    actionable: "Time-restricted eating 16:8 (fereastră de 8 ore) 3-5 zile/săptămână. Nu e necesar zilnic."
  },
  {
    id: "exercise-hormesis-mitochondria-2021",
    title: "Hormeza prin exercițiu și mitocondriile",
    summary: "Exercițiul intens produce stres oxidativ temporar (hormeză) care stimulează adaptări mitocondriale și antioxidante.",
    finding: "HIIT produce ROS (specii reactive de oxigen) care activează Nrf2 — master regulatorul antioxidant. Adaptarea crește capacitatea antioxidantă cu 30-50%.",
    citation: "Ristow et al., PNAS 2009; Powers et al., Journal of Sport and Health Science 2021",
    tags: ["hormesis", "exercise", "mitochondria", "antioxidant"],
    actionable: "1-2 sesiuni HIIT/săptămână pentru hormeză. Nu exagera — 3+ sesiuni HIIT/săptămână pot deveni stres cronic."
  },
  {
    id: "phytonutrients-hormesis-2020",
    title: "Fitonutrienții și xenohormeza",
    summary: "Compușii vegetali (polifenoli, sulforafan, curcumină) activează căi de stres celular benefic (xenohormeză) care cresc longevitatea.",
    finding: "Sulforafanul (din broccoli) activează Nrf2 de 2-3x mai puternic decât alți compuși. Curcumina activează autofagia și reduce inflamația. Resveratrolul activează sirtuinele.",
    citation: "Howitz & Sinclair, Nature 2003; Calabrese et al., Dose-Response 2020",
    tags: ["hormesis", "phytonutrients", "nrf2", "polyphenols"],
    actionable: "Include zilnic: broccoli/crucifere, turmeric (cu piper negru), ceai verde, fructe de pădure, ciocolată neagră >85%."
  },

  // ═══════════════════════════════════════════════════════════
  // CROSS-CUTTING / LONGEVITY (8 studies)
  // ═══════════════════════════════════════════════════════════
  {
    id: "pace-aging-dunedin-2022",
    title: "DunedinPACE — Măsurarea ritmului de îmbătrânire",
    summary: "Dunedin Study a dezvoltat un algoritm care măsoară viteza de îmbătrânire biologică, nu doar vârsta biologică statică.",
    finding: "Persoanele cu pace >1.0 îmbătrânesc mai repede cu 50% față de medie. Reducerea pace-ului cu 0.1 pe an echivalează cu ~3 ani de viață adiționali.",
    citation: "Belsky et al., eLife 2022; Elliott et al., Nature Aging 2021",
    tags: ["longevity", "pace", "aging", "dunedin"],
    actionable: "Monitorizează pace of aging, nu doar bio-age static. Intervențiile care reduc pace-ul sunt cele mai valoroase."
  },
  {
    id: "inflammaging-franceschi-2018",
    title: "Inflammaging — inflamația cronică a îmbătrânirii",
    summary: "Inflammaging e un proces de inflamație cronică low-grade care stă la baza majorității bolilor asociate vârstei.",
    finding: "Nivelurile de IL-6, TNF-α și CRP cresc cu 2-4x între 30 și 80 de ani. Inflammaging prezice mortalitatea mai bine decât vârsta cronologică.",
    citation: "Franceschi et al., Nature Reviews Immunology 2018; Ferrucci & Fabbri, Nature Reviews Cardiology 2018",
    tags: ["longevity", "inflammaging", "inflammation", "aging"],
    actionable: "Combate inflammaging prin: dietă anti-inflamatorie, exercițiu regulat, somn de calitate, omega-3, reducerea UPF."
  },
  {
    id: "epigenetic-clocks-horvath-2018",
    title: "Ceasurile epigenetice și vârsta biologică",
    summary: "Ceasurile epigenetice (Horvath, PhenoAge, GrimAge) măsoară vârsta biologică prin pattern-uri de metilare a ADN-ului.",
    finding: "GrimAge prezice mortalitatea cu acuratețe mai mare decât orice alt biomarker. Diferența de +5 ani între vârsta epigenetică și cea cronologică dublează riscul de mortalitate.",
    citation: "Horvath, Genome Biology 2013; Levine et al., Aging 2018; Lu et al., Aging 2019",
    tags: ["longevity", "epigenetics", "clocks", "methylation"],
    actionable: "Intervențiile care reduc epigenetic age acceleration: exercițiu, dietă mediteraneană, somn, reducerea stresului."
  },
  {
    id: "centenarian-decathlon-2022",
    title: "Centenarian Decathlon — antrenamentul pentru longevitate",
    summary: "Conceptul lui Peter Attia: antrenează-te pentru activitățile pe care vrei să le faci la 100 de ani, nu pentru estetică.",
    finding: "Forța, mobilitatea, stabilitatea și VO2 max sunt cele 4 dimensiuni ale 'decathlon-ului'. Fiecare decadă după 30 de ani pierzi 8-10% din forță fără antrenament.",
    citation: "Attia, Outlive 2023; Frontera et al., Journal of Applied Physiology 2022",
    tags: ["longevity", "centenarian", "training", "attitude"],
    actionable: "Antrenează-te pentru funcție, nu pentru estetică. Include: strength, stability, mobility, cardio în fiecare săptămână."
  },
  {
    id: "oral-health-longevity-2020",
    title: "Sănătatea orală și longevitatea",
    summary: "Boala parodontală e asociată cu inflamație sistemică și risc crescut de boli cardiovasculare, Alzheimer și diabet.",
    finding: "Parodontita crește CRP sistemic cu 30-50%. Periajul de 2x/zi + ața dentară reduc riscul cardiovascular cu 15%. Bacteriile orale (P. gingivalis) au fost găsite în plăcile Alzheimer.",
    citation: "Dominy et al., Science Advances 2019; Sanz et al., Journal of Clinical Periodontology 2020",
    tags: ["longevity", "oral-health", "inflammation", "alzheimer"],
    actionable: "Periaj 2x/zi, ață dentară zilnic, control stomatologic la 6 luni. Sănătatea orală e fereastra către inflamația sistemică."
  },
  {
    id: "brain-health-mind-diet-2021",
    title: "Dieta MIND și sănătatea cerebrală",
    summary: "Dieta MIND (Mediteranean-DASH Intervention for Neurodegenerative Delay) reduce riscul de Alzheimer cu 53%.",
    finding: "10 alimente 'brain-healthy': legume verzi, alte legume, nuci, fructe de pădure, leguminoase, cereale integrale, pește, păsări, ulei de măsline, vin (moderat). 5 de evitat: carne roșie, unt, brânză, prăjituri, fast-food.",
    citation: "Morris et al., Alzheimer's & Dementia 2015; Agarwal et al., Nutrients 2021",
    tags: ["longevity", "brain", "mind-diet", "alzheimer"],
    actionable: "Adoptă dieta MIND: focus pe legume verzi, fructe de pădure, nuci, pește. Limitează carnea roșie și prăjelile."
  },
  {
    id: "longevity-molecules-nmn-2022",
    title: "Moleculele longevității — NAD+ și sirtuinele",
    summary: "NAD+ scade cu 50% între 20 și 50 de ani. Sirtuinele (SIRT1-7) sunt enzime dependente de NAD+ care reglează repararea ADN-ului și metabolismul.",
    finding: "Precursorii NAD+ (NMN, NR) cresc NAD+ cu 40-90% în studii clinice. Exercițiul, fasting-ul și sauna cresc NAD+ natural. Resveratrolul activează SIRT1.",
    citation: "Yoshino et al., Science 2018; Bonkowski & Sinclair, Nature Reviews Molecular Cell Biology 2022",
    tags: ["longevity", "nad", "sirtuins", "supplements"],
    actionable: "Crește NAD+ natural prin exercițiu, fasting și saună. Suplimentele NMN/NR sunt opționale și necesită mai multe studii pe termen lung."
  },
  {
    id: "sleep-nutrition-correlation-2021",
    title: "Corelația somn-nutriție",
    summary: "Calitatea somnului și nutriția sunt bidirecțional legate: mesele târzii strică somnul, somnul prost duce la alegeri alimentare proaste.",
    finding: "O noapte de somn <6 ore crește consumul caloric a doua zi cu 300-500 kcal, predominant din carbs și grăsimi. Ghrelina crește cu 15%, leptina scade cu 15%.",
    citation: "St-Onge et al., American Journal of Clinical Nutrition 2021; Chaput, Sleep Medicine Reviews 2021",
    tags: ["longevity", "sleep", "nutrition", "correlation"],
    actionable: "Protejează somnul pentru a proteja nutriția. Dacă ai dormit prost, fii extra-atent la alegerile alimentare a doua zi."
  },
];

/**
 * Search the knowledge base for studies matching the query.
 * Uses keyword matching against tags and title/summary text.
 */
export function searchKnowledgeBase(query: string, maxResults: number = 5): HealthStudy[] {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

  const scored = STUDIES.map(study => {
    let score = 0;

    for (const word of queryWords) {
      if (study.tags.some(t => t.includes(word))) score += 3;
      if (study.title.toLowerCase().includes(word)) score += 2;
      if (study.summary.toLowerCase().includes(word)) score += 1;
      if (study.finding.toLowerCase().includes(word)) score += 1;
    }

    return { study, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.study);
}

/**
 * Format studies for inclusion in the AI system prompt.
 */
export function formatStudiesForPrompt(studies: HealthStudy[]): string {
  if (studies.length === 0) return "";

  return studies
    .map(s =>
      `[${s.id}] ${s.title}\nFinding: ${s.finding}\nReferință: ${s.citation}\nAcțiune: ${s.actionable}`
    )
    .join("\n\n");
}

/**
 * Get suggested questions based on the user's weakest dimension.
 */
export function getSuggestedQuestions(dimension: string): string[] {
  const questions: Record<string, string[]> = {
    movement: [
      "Cum îmi pot crește VO2 max-ul?",
      "Ce tip de antrenament e cel mai eficient pentru longevitate?",
      "Câte sesiuni de strength training am nevoie pe săptămână?",
    ],
    nutrition: [
      "Cum îmi pot îmbunătăți distribuția proteinelor?",
      "Ce alimente ar trebui să evit pentru a reduce inflamația?",
      "Cum îmi cresc diversitatea alimentară?",
    ],
    sleep: [
      "Cum îmi pot îmbunătăți calitatea somnului profund?",
      "Ce oră e optimă pentru culcare?",
      "Cum afectează cafeina somnul meu?",
    ],
    ans: [
      "Cum îmi pot crește HRV-ul?",
      "Ce este încărcătura alostatică și cum o reduc?",
      "Ajută respirația controlată la reducerea stresului?",
    ],
    light: [
      "Cât de importantă e lumina matinală?",
      "Cum îmi afectează ecranele somnul?",
      "Ce este fereastra optimă de alimentație?",
    ],
    subjective: [
      "Cum afectează stresul îmbătrânirea?",
      "Ce impact au conexiunile sociale asupra longevității?",
      "Cum îmi pot îmbunătăți dispoziția natural?",
    ],
    hormesis: [
      "Ce beneficii are expunerea la frig?",
      "Cum funcționează autofagia și cum o activez?",
      "Este sauna benefică pentru longevitate?",
    ],
  };

  return questions[dimension] ?? questions.nutrition;
}
