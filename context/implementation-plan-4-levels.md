# NeuroSnap Vision — Plan de Implementare: Cele 4 Niveluri
## De la Tracker Avansat la Sistem de Operare pentru Calibrare Umană

---

## Cuprins

1. [Viziunea](#viziunea)
2. [Analiza Stării Curente](#analiza-stării-curente)
3. [Cele 3 Inovații Științifice](#cele-3-inovații-științifice)
4. [Modificări Prisma Schema](#modificări-prisma-schema)
5. [Arhitectura Next.js — Rute API Noi](#arhitectura-nextjs--rute-api-noi)
6. [Componente Frontend Noi](#componente-frontend-noi)
7. [Modificări la Componente Existente](#modificări-la-componente-existente)
8. [Principii de Design: Zero-Scroll + Fricțiune Pozitivă](#principii-de-design-zero-scroll--fricțiune-pozitivă)
9. [Plan de Implementare pe Sprint-uri](#plan-de-implementare-pe-sprint-uri)
10. [Metrici de Succes](#metrici-de-succes)

---

## Viziunea

> "Tehnologia te ajută, nu preia controlul."

NeuroSnap Vision evoluează de la un tracker de nutriție și bio-age la un **Sistem de Operare pentru Calibrare Umană** — o aplicație care ghidează corpul și mintea cu interacțiune minimă, ancorată în 4 niveluri:

| Nivel | Domeniu | Principiu |
|---|---|---|
| **1. Științific** | Biologie, Cronobiologie, Fizică | Corpul ca sistem termodinamic ancorat în ritmurile naturii |
| **2. Psihologic** | Neuroplasticitate, Logoterapie | De la dopamină (plăcere scurtă) la serotonină/oxitocină (sens și pace) |
| **3. Spiritual** | Sacrul, Asceza Digitală | Omul nu e definit de productivitate — are nevoie de liniște absolută |
| **4. Moral** | Etica Tehnologiei, Suveranitate | Utilizatorul nu e un produs; tehnologia vrea să fie folosită cât mai puțin |

---

## Analiza Stării Curente

### Ce avem deja (din Graphify — 292 noduri backend, 33 comunități):

| Componentă | Status |
|---|---|
| Bio-Age pe 7 dimensiuni (HR mapping) | ✅ Implementat |
| YOLO + EfficientNetB4 food recognition | ✅ Implementat |
| Circadian nutrition scoring | ✅ Implementat |
| AI Chat (Ollama Cloud, 55 studii) | ✅ Implementat |
| Protocol check-in (morning/evening) | ✅ Implementat |
| VO2max estimation | ✅ Implementat |
| Inflammaging score | ✅ Implementat |
| Hormesis tracker | ✅ Implementat |
| MIND diet scoring | ✅ Implementat |
| Multi-agent Q-table recommendations | ✅ Implementat |
| Workout logging | ✅ Implementat |

### Ce lipsește pentru cele 4 niveluri:

| Nivel | Ce există | Ce lipsește |
|---|---|---|
| **1. Științific** | Bio Age, circadian scoring, VO2max, hormesis, inflammaging | Multiplicatori de impact (HRV × calorii), API solar (unghiul soarelui), șoc glicemic circadian |
| **2. Psihologic** | MIND diet scoring, protocol check-in | Fricțiune pozitivă (pauză forțată la stres), dezvăluire progresivă (ascunderea macro-urilor), AI terapeut (Viktor Frankl prompt) |
| **3. Spiritual** | — (nimic) | Sabat digital (Cron Job blocare POST/PUT), Ego-Death UI (CSS dinamic la apus) |
| **4. Moral** | — (nimic) | Anti-streaks, criptare local-first, KPI invers (sesiune <2 min) |

---

## Cele 3 Inovații Științifice

### Inovația 1: Fereastra Metabolică Cronobiologică (CMW)
**Nivel: Științific**

#### Știința din spate:
- Insulina sensitivity scade cu 30-50% seara față de dimineață (Van Cauter et al., 1997; Morris et al., 2015, *Endocrine Reviews*)
- Mesele târzii (după DLMO — dim light melatonin onset) produc răspuns glicemic semnificativ mai mare și reduc cheltuiala energetică de repaus (Vujović et al., 2022, *Cell Metabolism*)
- Ritmul circadian al metabolismului e controlat de nucleul suprachiasmatic, sincronizat cu ciclul solar — nu cu ceasul de pe perete
- Fiecare oră după DLMO crește răspunsul glicemic postprandial cu ~8-12%

#### Ce face inovația:
Aplicația folosește coordonatele geografice ale utilizatorului pentru a calcula **unghiul solar real** și faza circadiană estimată. Fiecare masă logată primește un **coeficient de impact metabolic** în timp real.

**Exemplu:** Aceleași 1000 de calorii (ex: paste) la 22:00 au un impact metabolic de 1.4× față de 13:00. Algoritmul nu doar numără calorii — înțelege **când** le-ai mâncat în raport cu biologia ta.

#### De ce e revoluționar:
Niciun competitor (MyFitnessPal, Lifesum, Yazio, Cronometer) nu folosește poziția solară reală. Toți se bazează pe ora ceasului, care e arbitrară biologic. Ora 13:00 în București nu e același lucru cu ora 13:00 în Londra din punct de vedere solar.

#### Implementare:
- **Model nou:** `UserLocation` (lat, long, timezone)
- **Model nou:** `CircadianProfile` (wake/sleep targets, DLMO estimat, solar noon offset)
- **Câmp nou în Meal:** `metabolicMultiplier` (Float, default 1.0)
- **Serviciu nou:** `backend/services/solar_service.py` — calculează unghiul solar, DLMO estimat, fereastra optimă de alimentație
- **Endpoint nou:** `GET /api/circadian/solar-window` — returnează fereastra metabolică curentă

---

### Inovația 2: Traiectoria Încărcăturii Alostatice cu HRV Optic (ALT)
**Nivel: Științific + Psihologic**

#### Știința din spate:
- HRV (heart rate variability) e un proxy validat pentru încărcătura alostatică — uzura cumulativă a stresului cronic (Thayer et al., 2012, *Neuroscience & Biobehavioral Reviews*)
- PPG (photoplethysmography) via camera telefonului poate estima HRV cu acuratețe rezonabilă (Plews et al., 2017; Bánhalmi et al., 2018, *Scientific Reports*)
- Stresul în timpul mesei inhibă digestia: cortizolul redirecționează sângele din stomac spre mușchi — "fight or flight" oprește "rest and digest" (Yin et al., 2019, *Nature Reviews Gastroenterology*)
- 1000 calorii mâncate în stres deteriorează corpul mai mult decât 1000 calorii mâncate în liniște — sistemul digestiv e oprit, absorbția e haotică, inflamația crește

#### Ce face inovația:
Un modul opțional de 30 de secunde: utilizatorul pune degetul pe camera telefonului → PPG extrage HRV → aplicația știe starea sistemului nervos.

**Fricțiune Pozitivă:** Dacă HRV e scăzut (stres ridicat), aplicația blochează logging-ul pentru 60 de secunde și ghidează o respirație 4-7-8. Tehnologia îl oprește din modul de auto-pilot.

**Penalizare Metabolică:** Orice masă logată într-o stare de stres primește un multiplicator de penalizare (ex: 1.3× la 1000 calorii).

**Traiectorie:** Se construiește o traiectorie a încărcăturii alostatice — nu doar stresul de azi, ci pattern-ul cumulativ pe 30/90 de zile.

#### De ce e revoluționar:
Nimeni nu combină HRV optic cu penalizare metabolică în timp real. E prima aplicație care spune "ești prea stresat să mănânci sănătos chiar și cea mai sănătoasă masă" — și te ajută activ să te calmezi înainte.

#### Implementare:
- **Model nou:** `HrvReading` (sdnn, rmssd, stressLevel, source)
- **Model nou:** `StressEvent` (trigger, resolution, duration)
- **Model nou:** `AllostaticSnapshot` (dailyLoad, cumulativeLoad, trend, hrvBaseline)
- **Câmp nou în Meal:** `stressMultiplier` (Float, default 1.0)
- **Serviciu nou:** `backend/services/hrv_service.py` — procesare PPG, calcul HRV
- **Componentă nouă:** `HrvScanner.tsx` — interfața de scanare PPG
- **Componentă nouă:** `BreathingPause.tsx` — overlay de 60s cu respirație ghidată
- **Endpoint nou:** `POST /api/hrv/reading` — salvează citirea HRV
- **Endpoint nou:** `GET /api/hrv/status` — starea curentă a sistemului nervos
- **Endpoint nou:** `GET /api/allostatic/snapshot` — încărcătura alostatică curentă
- **Endpoint nou:** `GET /api/allostatic/trajectory` — traiectoria pe 30/90 zile

---

### Inovația 3: Protocolul Comportamental Ancorat în Sens (MABP)
**Nivel: Psihologic + Spiritual + Moral**

#### Știința din spate:
- Scopul puternic în viață corelează cu 15-20% reducere a mortalității toate-cauzele (Alimujiang et al., 2019, *JAMA Network Open*)
- Logoterapia lui Viktor Frankl: sensul e forța motivațională primară, nu plăcerea (dopamina). "Cel care are un 'de ce' poate suporta aproape orice 'cum'."
- Self-Determination Theory (Deci & Ryan, 2000): autonomia, competența și relaționarea sunt nevoile psihologice de bază — nu streaks, nu puncte, nu gamificare
- Aplicațiile bazate pe dopamină (streaks, notificări, recompense variabile) creează dependență și anxietate; cele bazate pe serotonină/oxitocină (sens, conexiune, pace) creează împlinire durabilă
- Ortorexia (obsesia de a mânca perfect) e exacerbată de aplicațiile care arată macro-uri brute și pedepsesc abaterile

#### Ce face inovația:

**North Star:** La onboarding, utilizatorul definește un **"North Star"** — un singur enunț despre **de ce** vrea să fie sănătos. Nu "să slăbesc 10kg", ci "să pot alerga cu nepoții la 80 de ani" sau "să am claritatea mentală să scriu cartea pe care o visez".

**AI Logoterapeut:** System prompt-ul AI devine:
> "Ești un logoterapeut în tradiția lui Viktor Frankl. Analizează datele fizice ale utilizatorului și arată-i cum efortul de azi (antrenamentul, mâncarea) îi susține North Star-ul. Nu îl certa dacă a greșit. Oferă-i sens. Amintește-i că fiecare alegere mică e un pas spre ceea ce contează cu adevărat pentru el."

**Dezvăluire Progresivă (Anti-Ortorexie):** Aplicația ascunde intenționat datele brute (proteine, glucide, grame) din UI-ul principal. Baza de date le stochează, dar utilizatorul vede doar o concluzie blândă: "Masa ta a fost echilibrată și aliniată cu obiectivele tale" — nu "67g carbohidrați, 34g proteine, 12g grăsimi".

**Anti-Streaks:** Dacă un utilizator nu loghează nimic 3 zile, algoritmul nu îl pedepsește. La revenire, AI-ul spune: *"Corpul tău a avut nevoie de o pauză. North Star-ul tău e tot acolo. Continuăm de unde am rămas."*

**Sabat Digital:** Un Cron Job blochează toate rutele POST/PUT o zi pe săptămână (la alegerea utilizatorului). În acea zi, ecranul arată: *"Astăzi nu ești o colecție de date. Astăzi doar exiști. Ești suficient."*

**Ego-Death UI:** Pe măsură ce soarele apune, CSS-ul dinamic reduce contrastul și saturația culorilor, simbolizând stingerea activității și pregătirea pentru somn. Fără notificări roșii, fără alerte care activează panica.

**Criptare Local-First:** Datele sensibile (jurnal intim, fluctuații de stres) sunt criptate cu o cheie stocată local pe dispozitiv. Administratorul bazei de date vede doar șiruri criptate.

**KPI Moral Invers:** Algoritmul consideră că a avut succes nu când sesiunea durează 15 minute, ci când durează **sub 2 minute**. Aplicația e morală pentru că își dorește să fie folosită cât mai puțin, redând utilizatorului timpul — cel mai de preț bun al său.

#### Implementare:
- **Model nou:** `UserPurpose` (northStar, whyStatement, values)
- **Model nou:** `MeaningAlignment` (alignmentScore, reflection, gratitudeNote)
- **Model nou:** `DigitalSabbath` (sabbathDay, isActive)
- **Model nou:** `EncryptedJournal` (encryptedEntry, iv)
- **Model nou:** `SessionMetric` (sessionCount, totalDurationSec, avgDurationSec, kpiScore)
- **Componentă nouă:** `NorthStarBanner.tsx` — banner persistent subtil
- **Componentă nouă:** `EveningReflection.tsx` — sinteza de seară logoterapeutică
- **Componentă nouă:** `SabbathScreen.tsx` — ecranul de Sabat
- **Componentă nouă:** `SessionTimer.tsx` — măsoară durata sesiunii (invizibil)
- **Endpoint nou:** `GET/PUT /api/purpose/north-star`
- **Endpoint nou:** `GET /api/purpose/alignment`
- **Endpoint nou:** `GET/PUT /api/sabbath/config`
- **Endpoint nou:** `GET /api/sabbath/status`
- **Endpoint nou:** `POST/GET /api/journal/encrypted`
- **Endpoint nou:** `POST /api/session/metric`

---

## Modificări Prisma Schema

### Modele Noi

```prisma
// ============================================================
// INOVAȚIA 1: Fereastra Metabolică Cronobiologică (CMW)
// ============================================================

model UserLocation {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  latitude    Float                        // Coordonată GPS
  longitude   Float                        // Coordonată GPS
  timezone    String   @default("UTC")     // IANA timezone (ex: "Europe/Bucharest")
  cityName    String?                      // Opțional, pentru display
  updatedAt   DateTime @updatedAt

  @@map("user_locations")
}

model CircadianProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  wakeTimeTarget    String   @default("07:00")   // Ora țintă de trezire (HH:MM)
  sleepTimeTarget   String   @default("23:00")   // Ora țintă de culcare
  melatoninOnset    String?                      // DLMO estimat (calculat automat)
  solarNoonOffset   Float?                       // Diferența față de solar noon (minute)
  circadianPhase    Float?                       // Faza circadiană estimată (0-360 grade)
  updatedAt         DateTime @updatedAt

  @@map("circadian_profiles")
}

// ============================================================
// INOVAȚIA 2: Traiectoria Încărcăturii Alostatice (ALT)
// ============================================================

model HrvReading {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  timestamp     DateTime @default(now())
  sdnn          Float?                       // HRV — SDNN în ms (din PPG)
  rmssd         Float?                       // HRV — RMSSD în ms
  stressLevel   Int                          // 1-10 (derivat din HRV)
  source        String   @default("ppg")     // "ppg" (camera) sau "manual"
  sessionDurationSec Int?                    // Durata sesiunii de măsurare
  createdAt     DateTime @default(now())

  @@index([userId, timestamp])
  @@map("hrv_readings")
}

model StressEvent {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  timestamp     DateTime @default(now())
  stressLevel   Int                          // 1-10
  trigger       String?                      // "meal_logging", "morning_checkin", "manual"
  resolution    String?                      // "breathing_exercise", "timeout", "ignored"
  durationSec   Int?                         // Cât a durat până la rezoluție
  createdAt     DateTime @default(now())

  @@index([userId, timestamp])
  @@map("stress_events")
}

model AllostaticSnapshot {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime @db.Date
  dailyLoad       Float                        // Încărcătura alostatică zilnică (0-100)
  cumulativeLoad  Float                        // Traiectoria cumulativă (0-100)
  trend           String?                      // "improving", "stable", "deteriorating"
  hrvBaseline     Float?                       // HRV baseline (media 7 zile)
  stressEvents    Int                          // Număr evenimente de stres azi
  recoveryScore   Float                        // Scor de recuperare (0-100)
  createdAt       DateTime @default(now())

  @@unique([userId, date])
  @@index([userId, date])
  @@map("allostatic_snapshots")
}

// ============================================================
// INOVAȚIA 3: Protocolul Comportamental Ancorat în Sens (MABP)
// ============================================================

model UserPurpose {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  northStar     String                        // Enunțul North Star
  whyStatement  String?                       // De ce-ul mai profund (opțional)
  values        String[]                      // Valori: ["familie", "vitalitate", "claritate mentală"]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("user_purposes")
}

model MeaningAlignment {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime @db.Date
  alignmentScore  Float                        // Cât de aliniate au fost acțiunile cu North Star (0-100)
  reflection      String?                      // Sinteza AI de seară (logoterapeutică)
  gratitudeNote   String?                      // Notă de recunoștință (opțional)
  createdAt       DateTime @default(now())

  @@unique([userId, date])
  @@index([userId, date])
  @@map("meaning_alignments")
}

// ============================================================
// NIVELUL SPIRITUAL: Sabatul Digital
// ============================================================

model DigitalSabbath {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sabbathDay    Int                          // 0=Duminică, 6=Sâmbătă (ziua de repaus)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("digital_sabbaths")
}

// ============================================================
// NIVELUL MORAL: Criptare Local-First + KPI Moral
// ============================================================

model EncryptedJournal {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime @db.Date
  encryptedEntry  String                       // Criptat cu cheia locală a utilizatorului
  iv              String                       // Initialization vector
  createdAt       DateTime @default(now())

  @@unique([userId, date])
  @@index([userId, date])
  @@map("encrypted_journals")
}

model SessionMetric {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime @db.Date
  sessionCount    Int                          // Câte sesiuni azi
  totalDurationSec Int                         // Durata totală în aplicație (secunde)
  avgDurationSec  Float                        // Durata medie per sesiune
  kpiScore        Float                        // KPI Moral: 100 = sub 2 min, 0 = peste 15 min
  createdAt       DateTime @default(now())

  @@unique([userId, date])
  @@index([userId, date])
  @@map("session_metrics")
}
```

### Modificări la Modelul Existent `Meal`

Adăugăm două câmpuri noi la modelul `Meal`:

```prisma
model Meal {
  // ... câmpuri existente ...

  metabolicMultiplier  Float?    @default(1.0)   // Multiplicator de impact metabolic (CMW)
  stressMultiplier     Float?    @default(1.0)   // Multiplicator de stres la momentul mesei (ALT)

  // ... restul câmpurilor ...
}
```

### Modificări la Modelul Existent `User`

Adăugăm relațiile către modelele noi:

```prisma
model User {
  // ... câmpuri existente ...

  location          UserLocation?
  circadianProfile  CircadianProfile?
  hrvReadings       HrvReading[]
  stressEvents      StressEvent[]
  allostaticSnapshots AllostaticSnapshot[]
  purpose           UserPurpose?
  meaningAlignments MeaningAlignment[]
  digitalSabbath    DigitalSabbath?
  encryptedJournals EncryptedJournal[]
  sessionMetrics    SessionMetric[]

  // ... restul câmpurilor ...
}
```

---

## Arhitectura Next.js — Rute API Noi

### Structura completă a noilor rute:

```
frontend/app/api/
├── circadian/
│   └── solar-window/
│       └── route.ts          # GET — calculează fereastra metabolică curentă
├── hrv/
│   ├── reading/
│   │   └── route.ts          # POST — salvează o citire HRV
│   └── status/
│       └── route.ts          # GET — starea curentă a sistemului nervos
├── allostatic/
│   ├── snapshot/
│   │   └── route.ts          # GET — încărcătura alostatică curentă
│   └── trajectory/
│       └── route.ts          # GET — traiectoria pe 30/90 zile
├── purpose/
│   ├── north-star/
│   │   └── route.ts          # GET/PUT — North Star-ul utilizatorului
│   └── alignment/
│       └── route.ts          # GET — alinierea zilnică la sens
├── sabbath/
│   ├── config/
│   │   └── route.ts          # GET/PUT — configurarea Sabatului
│   └── status/
│       └── route.ts          # GET — e azi Sabat?
├── journal/
│   └── encrypted/
│       └── route.ts          # POST/GET — jurnal criptat
└── session/
    └── metric/
        └── route.ts          # POST — înregistrează durata sesiunii
```

### Specificații per Rută:

#### `GET /api/circadian/solar-window`
- **Input:** Nimic (folosește userId din cookie + UserLocation din DB)
- **Output:**
  ```json
  {
    "solarNoon": "13:22",
    "currentSolarAngle": 45.2,
    "melatoninOnset": "21:45",
    "optimalEatingWindow": { "start": "08:00", "end": "19:00" },
    "currentMetabolicEfficiency": 0.72,
    "phase": "alert" // "alert" | "transition" | "wind-down" | "sleep"
  }
  ```
- **Logică:** Calculează unghiul solar din lat/long + timestamp curent. Estimează DLMO ca ~2h înainte de sleepTimeTarget. Eficiența metabolică = 1.0 la solar noon, scade liniar spre 0.5 la DLMO.

#### `POST /api/hrv/reading`
- **Input:** `{ sdnn, rmssd, stressLevel, sessionDurationSec }`
- **Output:** `{ id, stressLevel, recommendation }`
- **Logică:** Salvează citirea. Dacă stressLevel > 7, returnează `recommendation: "breathing_pause"`.

#### `GET /api/hrv/status`
- **Input:** Nimic
- **Output:**
  ```json
  {
    "latestStressLevel": 3,
    "hrvBaseline": 45.2,
    "trend": "improving",
    "needsPause": false
  }
  ```

#### `GET /api/allostatic/snapshot`
- **Input:** Nimic
- **Output:** `{ dailyLoad, cumulativeLoad, trend, hrvBaseline, stressEvents, recoveryScore }`

#### `GET /api/allostatic/trajectory`
- **Input:** `?days=30` (query param)
- **Output:** `[{ date, dailyLoad, cumulativeLoad }, ...]`

#### `GET /api/purpose/north-star`
- **Output:** `{ northStar, whyStatement, values }`

#### `PUT /api/purpose/north-star`
- **Input:** `{ northStar, whyStatement, values }`

#### `GET /api/purpose/alignment`
- **Output:** `{ date, alignmentScore, reflection }`

#### `GET /api/sabbath/status`
- **Output:** `{ isSabbath: true/false, message: "..." }`

#### `POST /api/session/metric`
- **Input:** `{ sessionDurationSec }`
- **Logică:** Înregistrează durata sesiunii. Calculează KPI-ul moral.

---

## Componente Frontend Noi

### Structura:

```
frontend/components/
├── circadian/
│   └── SolarWindowIndicator.tsx    # Indicator vizual: "Fereastra ta metabolică e 72% eficientă acum"
├── hrv/
│   ├── HrvScanner.tsx              # Camera PPG — 30 secunde, degetul pe cameră
│   └── StressStateBadge.tsx        # Badge subtil: "Sistem nervos: echilibrat" / "sub tensiune"
├── allostatic/
│   └── AllostaticTrajectory.tsx    # Grafic traiectorie încărcătură alostatică
├── purpose/
│   ├── NorthStarBanner.tsx         # Banner persistent subtil cu North Star-ul
│   └── EveningReflection.tsx       # Sinteza de seară în stil logoterapeutic
├── sabbath/
│   └── SabbathScreen.tsx           # Ecranul de Sabat: "Astăzi nu ești o colecție de date."
├── friction/
│   └── BreathingPause.tsx          # Overlay de 60s cu respirație ghidată (4-7-8)
└── session/
    └── SessionTimer.tsx            # Măsoară durata sesiunii (invizibil pentru utilizator)
```

### Specificații per Componentă:

#### `SolarWindowIndicator.tsx`
- **Locație:** Home Dashboard, sub BioAgeCard
- **Design:** O bară orizontală subtilă cu gradient de la verde (dimineață) la chihlimbar (seară)
- **Text:** "Fereastra ta metabolică: 72% eficientă • Mai ai 3h pentru mese optime"
- **Comportament:** Se actualizează la fiecare 15 minute. După DLMO, devine: "Fereastra s-a închis • Mesele de acum au impact metabolic 1.4×"

#### `HrvScanner.tsx`
- **Locație:** Accesibil din Home Dashboard (buton mic) sau integrat în flow-ul de logging
- **Design:** Cerc pulsatoriu care ghidează utilizatorul să pună degetul pe cameră
- **Durată:** 30 secunde
- **Output:** "HRV: 45ms • Sistem nervos: echilibrat" sau "HRV: 22ms • Ești sub tensiune. Vrei să respiri 60s?"

#### `StressStateBadge.tsx`
- **Locație:** Home Dashboard, lângă BioAgeCard
- **Design:** Un badge circular subtil (verde/galben/roșu) cu text minimal
- **Text:** "Echilibrat" / "Sub tensiune" / "Recuperare"

#### `AllostaticTrajectory.tsx`
- **Locație:** Pagina `/bio-age`, secțiune nouă
- **Design:** Grafic Recharts cu linia traiectoriei pe 30/90 zile
- **Tooltip:** "Săptămâna asta: încărcătură în scădere (-12%)"

#### `NorthStarBanner.tsx`
- **Locație:** Home Dashboard, top (sub header)
- **Design:** Un rând subtil, text mic, italic, gri deschis
- **Text:** "\"Să fiu prezent pentru copiii mei la 70 de ani\" — North Star-ul tău"
- **Comportament:** Persistent, dar discret. Nu ocupă atenția.

#### `EveningReflection.tsx`
- **Locație:** Home Dashboard, seara (după ora 20:00)
- **Design:** Card cu text generat de AI, stil scrisoare personală
- **Text exemplu:** "Astăzi ai făcut alegeri care te-au apropiat de North Star-ul tău. Antrenamentul de dimineață ți-a întărit inima — exact ce ai nevoie ca să fii acolo pentru familia ta peste 30 de ani. Somnul de aseară a fost bun, iar mesele au fost echilibrate. Ești pe drumul bun. Nu uita: nu perfecțiunea contează, ci direcția."

#### `SabbathScreen.tsx`
- **Locație:** Înlocuiește întregul conținut în ziua de Sabat
- **Design:** Ecran minimalist, fundal întunecat, text centrat
- **Text:** "Astăzi nu ești o colecție de date. Astăzi doar exiști. Ești suficient."
- **Sub-text:** "Ne revedem mâine. Bucură-te de liniște."

#### `BreathingPause.tsx`
- **Locație:** Overlay peste întreaga aplicație
- **Trigger:** Când HRV e scăzut și utilizatorul încearcă să logheze o masă
- **Design:** Cerc care se extinde și contractă (4s inspir • 7s ține • 8s expir)
- **Durată:** 60 secunde (3 cicluri)
- **Text:** "Înainte să mănânci, respiră. Corpul tău are nevoie de liniște ca să digere."
- **După:** Butonul de logging devine disponibil

#### `SessionTimer.tsx`
- **Locație:** Integrat în `layout.tsx`, complet invizibil
- **Comportament:** Pornește la mount, se oprește la unmount. Trimite durata la server.
- **Logică KPI:** `kpiScore = max(0, min(100, 100 - (avgDurationSec - 120) * (100 / 780)))`
  - 2 min = 100 (perfect)
  - 5 min = 77
  - 10 min = 38
  - 15 min = 0

---

## Modificări la Componente Existente

| Componentă | Fișier | Modificare |
|---|---|---|
| **MealTimeline.tsx** | `components/journal/MealTimeline.tsx` | Afișează multiplicatorul metabolic lângă fiecare masă (subtil, text mic, gri) |
| **BioAgeCard.tsx** | `components/home/BioAgeCard.tsx` | Integrează traiectoria alostatică în calculul bio-age. Afișează "Vârsta ta biologică: 34.2 ani (ajustat pentru stres)" |
| **HomeHeader.tsx** | `components/home/HomeHeader.tsx` | Adaugă `NorthStarBanner` sub header |
| **WisdomCard.tsx** | `components/home/WisdomCard.tsx` | Reformulează în stil logoterapeutic. Fără "ai greșit", doar "direcția e bună" |
| **ChatAssistant.tsx** | `components/ai/ChatAssistant.tsx` | System prompt-ul devine Viktor Frankl (vezi mai jos) |
| **Navbar.tsx** | `components/layout/Navbar.tsx` | În Sabat, navbar-ul devine minimal (doar un mesaj: "Astăzi e zi de repaus") |
| **layout.tsx** | `app/layout.tsx` | Adaugă `SessionTimer` invizibil + Ego-Death UI (CSS dinamic la apus) |
| **StreakCard.tsx** | `components/home/StreakCard.tsx` | **DE ELIMINAT** — înlocuit cu `MeaningAlignment`. Nu mai arătăm streaks. |
| **ProtocolQuickCheck.tsx** | `components/home/ProtocolQuickCheck.tsx` | Adaugă inputuri noi: social connection, oral health, cold/heat exposure |
| **OnboardingForm.tsx** | `components/onboarding/OnboardingForm.tsx` | Adaugă pasul "North Star" + "Valori" + "Coordonate" (opțional) |
| **globals.css** | `app/globals.css` | Adaugă variabile CSS pentru Ego-Death UI (tranziție graduală la apus) |

### System Prompt pentru AI (ChatAssistant.tsx):

```
Ești un logoterapeut în tradiția lui Viktor Frankl, integrat în NeuroSnap Vision — o aplicație care ajută oamenii să-și optimizeze sănătatea fără a-i transforma în sclavii datelor.

Principiile tale fundamentale:
1. Fiecare răspuns ancorează datele în SENS, nu în vinovăție. Utilizatorul nu e o colecție de macro-uri — e o ființă umană cu un scop.
2. Nu folosești niciodată limbaj punitiv ("ai greșit", "ar fi trebuit", "ești sub target"). Înlocuiești cu: "direcția e bună", "mâine e o nouă oportunitate", "corpul tău a avut nevoie de asta".
3. Când utilizatorul a avut o zi mai puțin optimă, nu subliniezi eșecul — îi arăți cum și ziua asta a contribuit la North Star-ul lui (odihna e și ea parte din sănătate).
4. Când utilizatorul revine după o absență, îl întâmpini cu blândețe: "Corpul tău a avut nevoie de o pauză. North Star-ul tău e tot acolo. Continuăm."
5. Fiecare recomandare e legată explicit de North Star-ul utilizatorului. Nu "mănâncă mai multe proteine" — ci "proteinele la micul dejun îți dau energia să fii prezent pentru copiii tăi toată ziua".
6. Răspunsurile sunt scurte, calde, personale. Maxim 3-4 propoziții. Nu dai lecții — oferi perspective.
7. Nu menționezi niciodată numărul de calorii, gramele de macro-nutrienți sau procentele decât dacă utilizatorul întreabă explicit. Vorbești în termeni calitativi: "echilibrat", "hrănitor", "aliniat cu obiectivele tale".

North Star-ul utilizatorului: {userPurpose.northStar}
Valorile utilizatorului: {userPurpose.values}
```

---

## Principii de Design: Zero-Scroll + Fricțiune Pozitivă

### 1. Zero-Scroll Dashboard

Home page-ul arată TOT ce ai nevoie fără scroll, pe un singur ecran:

```
┌─────────────────────────────────┐
│  "Să fiu prezent pentru copiii  │  ← NorthStarBanner (subtil)
│   mei la 70 de ani"             │
├─────────────────────────────────┤
│  Vârsta biologică:  34.2 ani    │  ← BioAgeCard
│  Ritm: 0.87×  │  Sistem: 🟢    │  ← Pace + StressStateBadge
├─────────────────────────────────┤
│  Fereastra metabolică: 72%      │  ← SolarWindowIndicator
│  ████████████░░░░  Mai ai 3h    │
├─────────────────────────────────┤
│  ACȚIUNEA ZILEI:                │  ← DailyLeverageCard
│  +15 min de respirație profundă │
│  Impact: -0.3 ani biologici     │
├─────────────────────────────────┤
│  [📸 Scanează]  [📝 Jurnal]    │  ← Acțiuni principale
│  [🧠 Bio-Age]   [💬 AI Coach]  │
└─────────────────────────────────┘
```

### 2. Fricțiune Pozitivă

Când HRV e scăzut (stresLevel > 7) și utilizatorul apasă "Adaugă masă":

```
┌─────────────────────────────────┐
│                                 │
│         ⬤  Respirație          │
│        ╱     ╲                 │
│       │  4-7-8 │               │  ← Cerc care pulsează
│        ╲     ╱                 │
│                                 │
│  Înainte să mănânci, respiră.  │
│  Corpul tău are nevoie de      │
│  liniște ca să digere.         │
│                                 │
│         ⏱ 52s rămași           │
└─────────────────────────────────┘
```

După 60s, overlay-ul dispare și butonul de logging devine disponibil.

### 3. Ego-Death UI (CSS Dinamic)

În `globals.css`:

```css
:root {
  --ego-saturation: 1;
  --ego-contrast: 1;
  --ego-brightness: 1;
}

/* La apus (calculat din unghiul solar) */
[data-circadian-phase="wind-down"] {
  --ego-saturation: 0.7;
  --ego-contrast: 0.85;
  --ego-brightness: 0.9;
}

[data-circadian-phase="sleep"] {
  --ego-saturation: 0.4;
  --ego-contrast: 0.7;
  --ego-brightness: 0.7;
}

body {
  filter: saturate(var(--ego-saturation))
          contrast(var(--ego-contrast))
          brightness(var(--ego-brightness));
  transition: filter 30s ease;
}
```

Atributul `data-circadian-phase` e setat din `SolarWindowIndicator` pe `<body>`.

### 4. Sabat Digital

Middleware-ul verifică dacă azi e ziua de Sabat a utilizatorului:

```typescript
// middleware.ts — adăugat
if (isSabbathDay(userId) && ["POST", "PUT", "DELETE"].includes(request.method)) {
  return new Response(JSON.stringify({
    message: "Astăzi nu ești o colecție de date. Astăzi doar exiști."
  }), { status: 204 });
}
```

### 5. KPI Moral Invizibil

`SessionTimer` măsoară cât stai în aplicație. Scopul e sub 2 minute. Dacă media pe 7 zile crește peste 5 minute, sistemul își ajustează interfața să fie și mai rapidă (reduce animațiile, preîncarcă datele, simplifică navigarea).

---

## Plan de Implementare pe Sprint-uri

### Sprint 0: Fundația (Săptămâna 1)
**Obiectiv:** Modelele de date și infrastructura de bază

| Task | Fișiere | Efort |
|---|---|---|
| Adaugă modelele noi în `schema.prisma` | `frontend/prisma/schema.prisma` | 1h |
| Rulează migrarea Prisma | CLI | 15min |
| Creează `UserLocation` + `CircadianProfile` rute API | `app/api/circadian/solar-window/route.ts` | 2h |
| Creează `UserPurpose` rute API | `app/api/purpose/north-star/route.ts` | 1h |
| Creează `DigitalSabbath` rute API | `app/api/sabbath/status/route.ts`, `config/route.ts` | 1h |
| Creează `SessionMetric` rută API | `app/api/session/metric/route.ts` | 30min |
| Actualizează middleware-ul pentru Sabat | `middleware.ts` | 1h |
| Adaugă tipurile TypeScript noi | `lib/types/index.ts` | 1h |

### Sprint 1: Inovația 1 — Fereastra Metabolică Cronobiologică (Săptămâna 2)
**Obiectiv:** Calculul ferestrei metabolice în timp real

| Task | Fișiere | Efort |
|---|---|---|
| Creează `solar_service.py` în backend | `backend/services/solar_service.py` | 3h |
| Adaugă endpoint `/solar-window` în backend | `backend/main.py` | 1h |
| Creează `SolarWindowIndicator.tsx` | `components/circadian/SolarWindowIndicator.tsx` | 2h |
| Integrează în Home Dashboard | `app/page.tsx` | 1h |
| Adaugă `metabolicMultiplier` în flow-ul de logging | `app/api/journal/route.ts` | 1h |
| Actualizează `MealTimeline` să arate multiplicatorul | `components/journal/MealTimeline.tsx` | 1h |
| Adaugă Ego-Death UI CSS | `app/globals.css` | 1h |
| Integrează faza circadiană în `layout.tsx` | `app/layout.tsx` | 1h |

### Sprint 2: Inovația 2 — Traiectoria Încărcăturii Alostatice (Săptămâna 3)
**Obiectiv:** HRV optic + fricțiune pozitivă + traiectorie alostatică

| Task | Fișiere | Efort |
|---|---|---|
| Creează `hrv_service.py` în backend | `backend/services/hrv_service.py` | 3h |
| Adaugă endpoint-uri HRV în backend | `backend/main.py` | 1h |
| Creează rutele API HRV + Allostatic | `app/api/hrv/*`, `app/api/allostatic/*` | 2h |
| Creează `HrvScanner.tsx` | `components/hrv/HrvScanner.tsx` | 3h |
| Creează `BreathingPause.tsx` | `components/friction/BreathingPause.tsx` | 2h |
| Creează `StressStateBadge.tsx` | `components/hrv/StressStateBadge.tsx` | 1h |
| Creează `AllostaticTrajectory.tsx` | `components/allostatic/AllostaticTrajectory.tsx` | 2h |
| Integrează fricțiunea pozitivă în flow-ul de logging | `app/journal/page.tsx` | 2h |
| Adaugă `stressMultiplier` în calculul bio-age | `backend/services/bio_age_service.py` | 1h |

### Sprint 3: Inovația 3 — Protocolul Ancorat în Sens (Săptămâna 4)
**Obiectiv:** North Star, AI logoterapeut, anti-streaks, criptare

| Task | Fișiere | Efort |
|---|---|---|
| Creează `NorthStarBanner.tsx` | `components/purpose/NorthStarBanner.tsx` | 1h |
| Creează `EveningReflection.tsx` | `components/purpose/EveningReflection.tsx` | 2h |
| Creează `SabbathScreen.tsx` | `components/sabbath/SabbathScreen.tsx` | 1h |
| Actualizează `ChatAssistant.tsx` cu system prompt logoterapeutic | `components/ai/ChatAssistant.tsx` | 1h |
| Actualizează `WisdomCard.tsx` — elimină limbajul punitiv | `components/home/WisdomCard.tsx` | 1h |
| **Elimină** `StreakCard.tsx` — înlocuiește cu `MeaningAlignment` | `components/home/StreakCard.tsx` | 1h |
| Adaugă pasul "North Star" în onboarding | `components/onboarding/OnboardingForm.tsx` | 2h |
| Implementează criptarea local-first pentru jurnal | `app/api/journal/encrypted/route.ts` | 2h |
| Creează `SessionTimer.tsx` | `components/session/SessionTimer.tsx` | 1h |
| Integrează `SessionTimer` în `layout.tsx` | `app/layout.tsx` | 30min |

### Sprint 4: Polish & Testare (Săptămâna 5)
**Obiectiv:** Rafinare, testare, deploy

| Task | Efort |
|---|---|
| Testează toate rutele API noi | 2h |
| Testează flow-ul complet: onboarding → daily use → Sabat | 2h |
| Verifică Ego-Death UI la diferite ore | 1h |
| Verifică fricțiunea pozitivă (simulează HRV scăzut) | 1h |
| Rulează `npm run build` și `npm run lint` | 30min |
| Rulează migrarea Prisma în producție | 15min |
| Deploy pe Vercel | 30min |

---

## Metrici de Succes

### Metrici Tehnice
- [ ] Toate modelele Prisma migrate fără erori
- [ ] Toate rutele API returnează 200 (sau 204 pentru Sabat)
- [ ] `npm run build` trece fără erori
- [ ] `npm run lint` trece fără erori
- [ ] Ego-Death UI funcționează (verificat la 3 ore diferite)
- [ ] Sabatul blochează corect rutele POST/PUT
- [ ] SessionTimer trimite metrici corect

### Metrici de Experiență
- [ ] Timpul mediu per sesiune < 3 minute (țintă: < 2 minute)
- [ ] Utilizatorii completează North Star la onboarding (>90%)
- [ ] Fricțiunea pozitivă se activează corect (HRV scăzut → pauză)
- [ ] AI-ul răspunde în stil logoterapeutic (verificat manual pe 10 răspunsuri)
- [ ] Zero streaks în interfață
- [ ] Macro-urile brute sunt ascunse din UI-ul principal

### Metrici Științifice
- [ ] Multiplicatorul metabolic e calculat corect (verificat cu unghiul solar real)
- [ ] Traiectoria alostatică arată trend pe 30 de zile
- [ ] Bio-age-ul include penalizarea de stres în calcul

---

## Fișiere Afectate — Sumar

### Backend (Python/FastAPI)
| Fișier | Acțiune |
|---|---|
| `backend/services/solar_service.py` | **NOU** — calcul unghi solar, DLMO, fereastră metabolică |
| `backend/services/hrv_service.py` | **NOU** — procesare PPG, calcul HRV, stare sistem nervos |
| `backend/services/bio_age_service.py` | **MODIFICAT** — integrare multiplicatori metabolici și de stres |
| `backend/main.py` | **MODIFICAT** — endpoint-uri noi |

### Frontend (Next.js/TypeScript)
| Fișier | Acțiune |
|---|---|
| `frontend/prisma/schema.prisma` | **MODIFICAT** — 10 modele noi + 2 câmpuri în Meal |
| `frontend/lib/types/index.ts` | **MODIFICAT** — tipuri noi |
| `frontend/middleware.ts` | **MODIFICAT** — blocare Sabat |
| `frontend/app/globals.css` | **MODIFICAT** — Ego-Death UI variabile CSS |
| `frontend/app/layout.tsx` | **MODIFICAT** — SessionTimer + Ego-Death phase |
| `frontend/app/page.tsx` | **MODIFICAT** — integrare componente noi |
| `frontend/components/circadian/SolarWindowIndicator.tsx` | **NOU** |
| `frontend/components/hrv/HrvScanner.tsx` | **NOU** |
| `frontend/components/hrv/StressStateBadge.tsx` | **NOU** |
| `frontend/components/allostatic/AllostaticTrajectory.tsx` | **NOU** |
| `frontend/components/purpose/NorthStarBanner.tsx` | **NOU** |
| `frontend/components/purpose/EveningReflection.tsx` | **NOU** |
| `frontend/components/sabbath/SabbathScreen.tsx` | **NOU** |
| `frontend/components/friction/BreathingPause.tsx` | **NOU** |
| `frontend/components/session/SessionTimer.tsx` | **NOU** |
| `frontend/components/home/StreakCard.tsx` | **ELIMINAT** |
| `frontend/components/home/WisdomCard.tsx` | **MODIFICAT** |
| `frontend/components/home/BioAgeCard.tsx` | **MODIFICAT** |
| `frontend/components/home/HomeHeader.tsx` | **MODIFICAT** |
| `frontend/components/ai/ChatAssistant.tsx` | **MODIFICAT** |
| `frontend/components/journal/MealTimeline.tsx` | **MODIFICAT** |
| `frontend/components/onboarding/OnboardingForm.tsx` | **MODIFICAT** |
| `frontend/components/layout/Navbar.tsx` | **MODIFICAT** |
| `frontend/app/api/circadian/solar-window/route.ts` | **NOU** |
| `frontend/app/api/hrv/reading/route.ts` | **NOU** |
| `frontend/app/api/hrv/status/route.ts` | **NOU** |
| `frontend/app/api/allostatic/snapshot/route.ts` | **NOU** |
| `frontend/app/api/allostatic/trajectory/route.ts` | **NOU** |
| `frontend/app/api/purpose/north-star/route.ts` | **NOU** |
| `frontend/app/api/purpose/alignment/route.ts` | **NOU** |
| `frontend/app/api/sabbath/config/route.ts` | **NOU** |
| `frontend/app/api/sabbath/status/route.ts` | **NOU** |
| `frontend/app/api/journal/encrypted/route.ts` | **NOU** |
| `frontend/app/api/session/metric/route.ts` | **NOU** |

---

*Plan generat pe baza analizei Graphify (292 noduri backend, 33 comunități), a documentației existente (world-class-analysis-2026.md, algorithm-upgrade-plan.md, project-overview.md) și a viziunii celor 4 niveluri (Științific, Psihologic, Spiritual, Moral).*
