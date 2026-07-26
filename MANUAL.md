# MANUAL TECNIC — NeuroSnap Vision

> Documentație tehnică completă a arhitecturii, rutele API, modele ML, logica de calcul, schema bazei de date și flow-urile funcționale.

---

## CUPRINS

1. [Arhitectură generală](#1-arhitectură-generală)
2. [Frontend — Next.js 16 PWA](#2-frontend--nextjs-16-pwa)
3. [Backend — FastAPI Python](#3-backend--fastapi-python)
4. [Baza de date — Schema Prisma](#4-baza-de-date--schema-prisma)
5. [Rute API Frontend (BFF Proxy)](#5-rute-api-frontend-bff-proxy)
6. [Rute API Backend (FastAPI)](#6-rute-api-backend-fastapi)
7. [Modele ML — Pipeline complet](#7-modele-ml--pipeline-complet)
8. [Calcul vârstă biologică](#8-calcul-vârstă-biologică)
9. [Algoritmi de scoring](#9-algoritmi-de-scoring)
10. [Sistemul multi-agent RL](#10-sistemul-multi-agent-rl)
11. [Securitate & Auth](#11-securitate--auth)
12. [PWA & Service Worker](#12-pwa--service-worker)
13. [Variabile de mediu](#13-variabile-de-mediu)
14. [Deploy](#14-deploy)

---

## 1. Arhitectură generală

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Browser (PWA)                            │
│              Installabilă pe iOS / Android                        │
│         localStorage (profile, targets, session)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│              Vercel — Next.js 16 (PWA + BFF)                     │
│                                                                  │
│  App Router (SSR + Client Components)                           │
│  ├── app/page.tsx              (Home dashboard)                 │
│  ├── app/journal/              (Jurnal mese + workouts)         │
│  ├── app/bio-age/              (Vârstă biologică)                │
│  ├── app/reports/              (Rapoarte săptămânale)            │
│  ├── app/protocol/             (Ritual zilnic check-in)          │
│  ├── app/vision-ai/            (Scanare cameră AI)               │
│  ├── app/experiments/          (Experimente n=1)                  │
│  ├── app/profile/              (Profil + editare)                │
│  ├── app/settings/             (Sabbath config)                  │
│  ├── app/onboarding/          (Onboarding 8 pași)               │
│  ├── app/api/                  (38 rute API proxy BFF)           │
│  ├── middleware.ts             (Auth + X-User-ID injection)      │
│  └── lib/server/              (env, session, auth, Prisma)       │
│                                                                  │
│  Storage:                                                        │
│  ├── Prisma Accelerate (PostgreSQL) — toate datele persistente   │
│  ├── Vercel Blob — imaginile scanărilor                          │
│  └── localStorage — profile, targets, cache local                │
└───────┬───────────────────────────────┬────────────────────────┘
        │                               │
        │ POST + X-Internal-Token       │ SSE (Server-Sent Events)
        ▼                               ▼
┌───────────────────────┐    ┌───────────────────────────┐
│  Hugging Face Space    │    │  Ollama Cloud              │
│  FastAPI Python 3.11   │    │  LLM: nemotron-3-ultra     │
│                        │    │  (AI Chat cu context real) │
│  ├── prediction_service│    └───────────────────────────┘
│  │   (YOLO + EfficientNet)│
│  ├── bio_age_service     │
│  │   (7 dimensiuni + HR) │
│  ├── protocol_service    │
│  ├── nutrition_service   │
│  ├── mind_score_service  │
│  ├── circadian_service   │
│  ├── workout_service     │
│  ├── intervention_service│
│  ├── vo2max_service      │
│  ├── hormesis_service    │
│  ├── inflammaging_service│
│  └── multi_agent RL      │
│                          │
│  Middleware:              │
│  ├── X-Internal-Token auth│
│  ├── Rate limiting (slowapi)│
│  ├── CORS restrictiv     │
│  ├── request_id per req  │
│  └── Exception handler    │
│     global (JSON 5xx)    │
│                          │
│  Modele ML (~310 MB):    │
│  ├── yolo_foodseg_best.pt│
│  ├── nutritrack_B4_SUPREM│
│  │   .keras              │
│  └── mind_pattern_model  │
│      .pkl                │
└─────────────────────────┘
```

### Flux de date principal

1. **User deschide aplicația** → middleware verifică cookie `neurosnap_session` (HMAC-signed) → injectează `X-User-ID` header pentru toate rutele `/api/*`
2. **Dacă nu e autentificat** → redirect la `/onboarding` (8 pași wizard) → la final: POST `/api/auth/login` (creează user în Prisma + set cookie session + salvează profile în localStorage)
3. **Home dashboard** → fetch paralel: bio-age snapshot (din Prisma cache 24h sau backend), protocol today, totals, AI context
4. **Scan masă** → cameră → POST `/api/predict` (proxy către backend YOLO+EfficientNet) → selectare porție + mealType → POST `/api/journal` (salvează în Prisma)
5. **AI Chat** → POST `/api/ai-chat` (SSE streaming) cu context complet (bio-age, scoruri, obiective) → Ollama Cloud răspunde token cu token

---

## 2. Frontend — Next.js 16 PWA

### Stack

| Tehnologie | Versiune | Scop |
|-----------|----------|------|
| Next.js | 16 | App Router, SSR, API routes (BFF) |
| React | 19 | UI components |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling utility-first |
| Prisma | 7 | ORM + PostgreSQL via Accelerate |
| Recharts | — | Grafice (bar, pie, line) |
| lucide-react | — | Iconuri |
| @vercel/blob | — | Upload imagini |

### Structura directoarelor

```
frontend/
├── app/
│   ├── (pagini)/              # Page components (App Router)
│   ├── api/                    # 38 rute API (BFF proxy)
│   ├── layout.tsx              # Root layout (providers, metadata, fonts)
│   ├── globals.css            # Stiluri globale (glass-card, focus-visible)
│   ├── not-found.tsx          # 404 branded
│   ├── robots.ts              # robots.txt generator
│   └── sitemap.ts             # sitemap.xml generator
├── components/
│   ├── home/                   # Home dashboard (header, cards, grid)
│   ├── journal/               # Jurnal (timeline, summary, FAB)
│   ├── bio-age/                # Bio-age page (cards, charts, organ ages)
│   ├── reports/               # Rapoarte (calorii, macro, recommendations)
│   ├── protocol/              # Ritual (forms, calendar, streak)
│   ├── camera/                 # Scanare (CameraScanner, PredictionPanel)
│   ├── ai/                     # ChatAssistant (portal, messages, SSE)
│   ├── onboarding/            # 8 step components
│   ├── profile/               # Profile, edit, goals, menu
│   ├── sabbath/                # SabbathGate
│   ├── circadian/             # SolarWindowIndicator
│   ├── hrv/                    # HrvScanner, StressStateBadge
│   ├── purpose/               # NorthStarBanner, EveningReflection
│   ├── ui/                     # Card, Toast, Skeleton, Portal, ErrorBoundary
│   └── layout/                # Navbar, ConditionalNavbar, ClientWrapper
├── hooks/                      # Custom hooks (useBioAge, useReports, useProtocol, etc.)
├── lib/
│   ├── api/                    # API clients (bio-age, home, predict, journal)
│   ├── auth/                   # profile, user, context, userStorage, session
│   ├── server/                 # env, auth (requireUserId), session (HMAC)
│   ├── cache/                  # DataCacheContext (TTL cache client-side)
│   ├── types/                  # TypeScript types
│   ├── constants/              # app, nutrition, goals
│   ├── services/               # nutrition targets calculator
│   └── db/prisma.ts            # Prisma client singleton
├── prisma/
│   └── schema.prisma           # Schema completă (18 modele)
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   └── images/                  # Icon-uri, logo
├── middleware.ts               # Auth middleware (cookie → X-User-ID)
├── next.config.ts              # Next config (+ Sentry wrapper comentat)
├── sentry.{client,server,edge}.config.ts  # Sentry init (no-op fără DSN)
└── package.json
```

### Middlewares

**`middleware.ts`** rulează pe toate rutele:
1. Citește cookie `neurosnap_session` → `verifySession(token)` → obține `userId`
2. Dacă `userId` valid + ruta e `/api/*` → injectează header `X-User-ID: userId`
3. Dacă `userId` lipsește + ruta nu e publică (`/onboarding`, `/api/auth`) → redirect `/onboarding`

### Hooks principale

| Hook | Scop |
|------|------|
| `useUser()` | User curent din AuthContext (server-side via cookie) |
| `useBioAge(userId, age)` | Snapshot bio-age (cache 24h în Prisma, fallback backend POST) |
| `useReports()` | Date rapoarte (fetch paralel: report, weekly calories, backend inputs, meals) |
| `useProtocol(userId)` | Protocol zilnic + streak (fetch + submit morning/evening) |
| `useHrv()` | Status HRV (poll 5min) + submit reading |
| `usePurpose()` | North Star + alignment |
| `useSabbath()` | Status Sabbath (verifică zi curentă) |
| `useSolarWindow()` | Fereastră solară (poll 15min) |
| `useWisdomCard(dimension, score)` | Recomandare zilnică bazată pe leverage point |
| `useIntervention(userId, age, northStar)` | Intervenția zilnică (POST cu istoric) |
| `useAIChat()` | Mesaje chat + streaming SSE + persistență localStorage |
| `useStreak()` | Streak din Prisma + localStorage |
| `useNotificationSettings()` | Notificări Web Push |
| `useToast()` | Sistem toast global (provider în layout) |

---

## 3. Backend — FastAPI Python

### Stack

| Tehnologie | Versiune | Scop |
|-----------|----------|------|
| FastAPI | >=0.110,<0.115 | Framework API |
| Uvicorn | >=0.27,<0.32 | ASGI server |
| TensorFlow | >=2.15,<2.17 | EfficientNet inference |
| Ultralytics | >=8.1,<8.3 | YOLO segmentation |
| scikit-learn | >=1.3,<2.0 | MIND classifier (joblib) |
| Pillow | >=12.3.0,<13.0 | Procesare imagini |
| NumPy | >=1.26,<2.0 | Operații numerice |
| slowapi | >=0.1.9,<0.2 | Rate limiting |
| sentry-sdk | opțional | Error monitoring |

### Entry point: `hf-space/app.py`

- **Lazy loading** via `_load_services()` + `@app.on_event("startup")` — modelele ML se încarcă o singură dată la startup (15-40s pe HF free tier)
- **Middleware stack** (în ordine): `request_id_middleware` → `internal_token_middleware` → CORS → rute
- **Exception handlers** globali: `Exception` (500), `HTTPException` (status code), `RequestValidationError` (422) — toate returnează JSON consistent cu `request_id`
- **Rate limiter** (`slowapi`): `/predict` 10/min, `/protocol/*` 120/min, altele 60/min
- **Health check** (`GET /health`): status modele + uptime, fără auth

### Servicii (`hf-space/services/`)

| Serviciu | Funcție principală | Apelat de |
|----------|-------------------|-----------|
| `prediction_service.py` | `predict_food(image_bytes, portion)` — pipeline YOLO→EfficientNet | `/predict`, `/scan` |
| `bio_age_service.py` | `compute_bio_age(age, metrics)` — 7 dimensiuni + hazard ratios + organ ages + leverage | `/bio-age/snapshot`, `/bio-age/current`, `/intervention/today` |
| `protocol_service.py` | `submit_morning_checkin()`, `submit_evening_checkin()` — check-in + streak | `/protocol/morning`, `/protocol/evening`, `/protocol/today` |
| `nutrition_service.py` | `calculate_healthy_score()`, `calculate_protein_timing_score()` | `bio_age_service`, `prediction_service`, `/healthy-score` |
| `mind_score_service.py` | `calculate_mind_score()` — scor MIND + clasificare pattern | `/mind-score`, `bio_age_service` |
| `circadian_service.py` | `score_circadian_nutrition()`, `score_circadian_extended()` | `/circadian/score`, `bio_age_service` |
| `workout_service.py` | `log_workout()`, `get_weekly_movement_score()` | `/workout/log`, `/workout/weekly` |
| `intervention_service.py` | `get_todays_intervention()` — cu trend bonuses din istoric | `/intervention/today` |
| `vo2max_service.py` | `estimate_vo2max()` — pe sex+age+workout frequency+intensity | `bio_age_service` (dimensiunea cardio) |
| `hormesis_service.py` | `compute_hormesis()` — cold/sauna/fasting/breathwork | `bio_age_service` (dimensiunea hormesis) |
| `inflammaging_service.py` | `compute_inflammaging()` — din protocol+meals+workouts+oral_health | `bio_age_service` (inflammaging) |
| `agents/multi_agent_service.py` | `get_multi_agent_recommendation()` — 5 agenți Q-learning | `/recommendation` |
| `agents/coordinator.py` | `coordinate_recommendation()` — selecție agent după priority | `/recommendation` |

---

## 4. Baza de date — Schema Prisma

Baza de date: **PostgreSQL** via **Prisma Accelerate** (PDA).

### Modele (18 totale)

#### User
```prisma
model User {
  id              String    @id @default(cuid())
  displayName      String    @unique          // Login se face pe displayName
  age             Int?                       // Vârstă cronologică
  sex             String?                    // male/female/other
  bodyType        String?                    // ectomorph/mesomorph/endomorph
  activityLevel   String?                    // sedentary/light/moderate/active/very_active
  goal            String?                    // lose_weight/maintain/gain_muscle/etc
  sleepHours      Float?
  weight          Float?                      // kg
  height          Float?                      // cm
  sleepTime       String?                     // "23:00"
  targetCalories  Int?                        // Calculat la onboarding
  targetProtein   Int?
  targetFats      Int?
  lateMealThreshold Int?                     // Ora după care mesele sunt "târzii"
  focusArea       String?                     // general/nutrition/sleep/etc
  createdAt       DateTime  @default(now())
  // Relații: scans, meals, reports, dailyProtocols, bioAgeSnapshots,
  //          workoutLogs, experiments, location, circadianProfile,
  //          hrvReadings, stressEvents, allostaticSnapshots, purpose,
  //          meaningAlignments, digitalSabbath, encryptedJournals,
  //          sessionMetrics, dailyCoachCache
}
```

#### Meal + MealItem
```prisma
model Meal {
  id            String     @id @default(cuid())
  userId        String?
  sourceScanId  String?                      // Legătură cu scanarea AI
  mealType      MealType   @default(OTHER)   // BREAKFAST/LUNCH/DINNER/SNACK/OTHER
  loggedAt      DateTime   @default(now())
  title         String
  notes         String?
  metabolicMultiplier  Float?  @default(1.0) // Din fereastră circadiană
  stressMultiplier     Float?  @default(1.0)
  items         MealItem[]                   // Alimentele individuale din masă
}

model MealItem {
  mealId           String
  foodId           String?                    // Legătură cu Food (dacă e cunoscut)
  name             String
  quantity         Decimal   @default(1)
  portionSize      PortionSize @default(MEDIUM) // SMALL/MEDIUM/LARGE/FULL/CUSTOM
  calories         Decimal
  proteinGrams     Decimal
  carbsGrams       Decimal
  fatGrams         Decimal
}
```

#### Scan + ScanImage
```prisma
model Scan {
  userId          String?
  foodId          String?
  imageId         String?    @unique           // Imaginea în Vercel Blob
  predictedLabel  String                       // Ex: "pizza_margherita"
  displayName     String                       // Ex: "Pizza Margherita"
  confidence      Decimal    @db.Decimal(5, 2) // 0-100
  portionSize     PortionSize @default(MEDIUM)
  calories        Decimal
  proteinGrams    Decimal
  carbsGrams      Decimal
  fatGrams        Decimal
  status          ScanStatus @default(DRAFT)   // DRAFT/ADDED_TO_JOURNAL/DISCARDED
  rawPrediction   Json?                        // Răspunsul complet de la backend
}
```

#### DailyProtocol
```prisma
model DailyProtocol {
  userId           String
  date             DateTime  @db.Date
  // Morning check-in (1-5 scale)
  morningRecovery  Int?
  morningEnergy    Int?
  morningMood       Int?
  morningFocus      Int?
  // Evening check-in (1-5 scale)
  eveningStress    Int?
  eveningDigestion Int?
  eveningMood       Int?
  eveningEnergy    Int?
  eveningLibido    Int?
  // Boolean flags
  morningLight     Boolean?
  coldExposure     Boolean?
  heatExposure     Boolean?
  oralHealth       Boolean?
  caffeineCutoff   Boolean?
  screenCutoff     Boolean?
  supplements      String[]
  socialConnection Int?
  lastMealTime     String?
  isComplete       Boolean   @default(false)   // true când morning + evening completate
  @@unique([userId, date])
}
```

#### BioAgeSnapshot
```prisma
model BioAgeSnapshot {
  userId              String
  date                DateTime  @db.Date
  biologicalAge       Float                       // Ex: 32.5
  chronologicalAge    Int                         // Ex: 35
  paceOfAging         Float                       // <0.95 decelerating, >1.05 accelerating
  nutritionScore      Float
  sleepScore          Float
  ansScore            Float                       // Autonomic Nervous System
  movementScore       Float
  lightScore          Float
  subjectiveScore     Float
  brainAge            Float?                      // Organ ages
  cardiovascularAge   Float?
  metabolicAge        Float?
  immuneAge           Float?
  topLeverageDimension String?                   // Ex: "sleep"
  leverageAction      String?
  projectedImpact     Float?
  inputData           Json                        // Snapshot complet pentru re-procesare
  @@unique([userId, date])                        // Un singur snapshot/zi/user
}
```

#### Alte modele

| Model | Scop |
|-------|------|
| `WorkoutLog` | Antrenamente (type, intensity 1-10, durationMin) |
| `HrvReading` | Citiri HRV (sdnn, rmssd, stressLevel 1-10) |
| `StressEvent` | Evenimente de stres (trigger, duration, resolution) |
| `AllostaticSnapshot` | Sarcină alostatică zilnică (dailyLoad, cumulativeLoad, trend) |
| `Experiment` | Experimente n=1 (name, hypothesis, protocol JSON, status, startDate, endDate) |
| `UserLocation` | Lat/lng/timezone pentru calcul solar |
| `CircadianProfile` | Wake/sleep time target, melatonin onset, solar noon offset |
| `UserPurpose` | North Star (ex: "Să fiu prezent pentru copiii mei") + values |
| `MeaningAlignment` | Scor alignare zilnică cu North Star |
| `DigitalSabbath` | Zi de repaus (sabbathDay 0-6, isActive) |
| `EncryptedJournal` | Jurnal E2E (encryptedEntry + iv, AES-GCM client-side) |
| `SessionMetric` | KPI sesiuni (sessionCount, totalDuration, avgDuration, kpiScore) |
| `DailyCoachCache` | Cache mesaj coach zilnic (coach, dimension, leverageBridge) |
| `ReportSnapshot` | Rapoarte salvate (type, rangeStart/End, totals, recommendations) |
| `Food` | Alimente cunoscute (slug, name, calories, macros per serving) |

---

## 5. Rute API Frontend (BFF Proxy)

Frontend-ul expune **38 rute API** în `app/api/` care acționează ca proxy între client și backend/servicii. Toate folosesc `requireUserId(request)` pentru a citi `X-User-ID` (injectat de middleware din cookie session).

### Autentificare & User

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/auth/login` | POST | Login (creează user + set cookie session) | Prisma |
| `/api/auth/logout` | POST | Logout (șterge cookie) | — |
| `/api/user/profile` | GET | Profil user | Prisma |
| `/api/user/profile` | PUT | Actualizează profil (displayName, age, weight, etc.) | Prisma + localStorage |

### Journal & Scanări

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/journal` | GET | Listează mese (query: days, mealType) | Prisma |
| `/api/journal` | POST | Salvează masă (cu items) | Prisma |
| `/api/journal/[id]` | DELETE | Șterge masă | Prisma |
| `/api/journal/bulk` | POST | Salvare bulk (multiple mese) | Prisma |
| `/api/journal/encrypted` | GET | Listează jurnal criptat | Prisma |
| `/api/journal/encrypted` | POST | Salvează intrare criptată (E2E) | Prisma |
| `/api/scans` | GET | Listează scanări | Prisma |
| `/api/scans` | POST | Salvează scanare | Prisma |
| `/api/scans/[id]/journal` | POST | Convertește scan în masă jurnal | Prisma |
| `/api/uploads/scans` | POST | Upload imagine către Vercel Blob | Vercel Blob |
| `/api/uploads/scans/[...pathname]` | GET | Servește imagine din Blob | Vercel Blob |

### Predict (AI food detection)

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/predict` | POST | Proxy către backend YOLO+EfficientNet + fallback Gradio | Backend HF Space |

**Pipeline**:
1. Primește imagine de la client
2. POST către `${BACKEND_URL}/predict` cu header `X-Internal-Token`
3. Dacă backend-ul eșuează → fallback la Gradio Spaces (YOLO_SPACE_URL + CLASSIFIER_SPACE_URL)
4. Returnează: `{ food_class, display_name, confidence, nutrition, bbox, all_regions }`

### Bio-age

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/bio-age/snapshot` | POST | Snapshot bio-age din date complete (meals, protocols, workouts, HRV) | Prisma (cache 24h) + Backend |
| `/api/bio-age/history` | GET | Istoric snapshots (query: days, default 90) | Prisma |
| `/api/bio-age/intervention` | GET/POST | Intervenție zilnică recomandată (cu istoric trend) | Prisma + Backend |
| `/api/bio-age/circadian` | POST | Scor circadian | Backend |
| `/api/bio-age/movement-quality` | GET | Scor mișcare | Backend |
| `/api/bio-age/workout` | POST | Log antrenament | Backend + Prisma |
| `/api/bio-age/workout/list` | GET | Listează antrenamente | Backend |
| `/api/bio-age/protocol/today` | GET | Protocol zilei | Backend + Prisma |
| `/api/bio-age/protocol/morning` | POST | Check-in dimineața | Backend + Prisma |
| `/api/bio-age/protocol/evening` | POST | Check-in seara | Backend + Prisma |
| `/api/bio-age/protocol/streak` | GET | Streak calculat din Prisma | Prisma |

### Scoring

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/healthy-score` | POST | Scor sănătate compozit | Backend |
| `/api/mind-score` | POST | Scor MIND (sănătate cerebrală) | Backend |
| `/api/recommendation` | POST | Recomandare multi-agent RL | Backend |

### Purpose & Sabbath

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/purpose/north-star` | GET/PUT | North Star user | Prisma |
| `/api/purpose/daily-coach` | GET/POST | Mesaj coach zilnic (LLM) | Prisma + Ollama |
| `/api/purpose/alignment` | GET/POST | Scor alignare cu North Star | Prisma + Backend |
| `/api/sabbath/status` | GET | Status Sabbath (azi e zi de repaus?) | Prisma |
| `/api/sabbath/config` | GET/PUT | Configurare Sabbath (zi, activ) | Prisma |

### HRV & Allostatic & Circadian

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/hrv/reading` | POST | Salvează citire HRV | Prisma |
| `/api/hrv/status` | GET | Status HRV (ultima citire) | Prisma |
| `/api/allostatic/snapshot` | GET | Sarcină alostatică zilnică | Prisma |
| `/api/allostatic/trajectory` | GET | Traiectorie 30/90 zile | Prisma |
| `/api/circadian/solar-window` | GET | Fereastră solară (calcul astronomic) | TS propriu |

### AI Chat

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/ai-chat` | POST | Chat cu Ollama (SSE streaming) | Ollama Cloud |
| `/api/ai-chat/context` | GET | Context pentru chat (workoutCount, avgStress, sleepHours) | Prisma |

**Context trimis către LLM** (la deschiderea chat-ului):
```
userId, displayName, chronologicalAge, biologicalAge, paceOfAging, paceLabel,
nutritionScore, sleepScore, movementScore, ansScore, lightScore, subjectiveScore,
hormesisScore, vo2max, vo2maxPercentile, inflammagingScore, complianceScore,
streak, leverageDimension, leverageAction, projectedImpact, upfCount,
uniqueFoods, workoutCount, avgStress, sleepHours, proteinTimingScore
```

### Altele

| Rută | Metoda | Scop | Sursă date |
|------|--------|------|-----------|
| `/api/experiments` | GET/POST/PATCH/DELETE | CRUD experimente n=1 | Prisma |
| `/api/reports` | GET/POST | Rapoarte salvate | Prisma |
| `/api/session/metric` | GET/POST | KPI sesiuni | Prisma |

---

## 6. Rute API Backend (FastAPI)

Backend-ul expune **20 rute** pe HF Space. Toate (mai puțin `/` și `/health`) necesită header `X-Internal-Token`.

| Endpoint | Metoda | Rate limit | Scop |
|----------|--------|------------|------|
| `/` | GET | — | Health check simplu |
| `/health` | GET | — | Status modele + uptime + versiune |
| `/predict` | POST | 10/min | Clasificare imagine (UploadFile + portion query) |
| `/scan` | POST | 10/min | Alias pentru `/predict` |
| `/predict-raw` | POST | 10/min | Test — body raw fără UploadFile |
| `/debug/error` | GET | — | Test error handling (protejat cu DEBUG=true) |
| `/recommendation` | POST | 60/min | Recomandare multi-agent Q-learning |
| `/healthy-score` | POST | 60/min | Scor sănătate compozit |
| `/mind-score` | POST | 60/min | Scor MIND + pattern |
| `/protocol/morning` | POST | 120/min | Check-in dimineața |
| `/protocol/evening` | POST | 120/min | Check-in seara |
| `/protocol/today` | GET | 120/min | Protocol zilei + streak |
| `/bio-age/snapshot` | POST | 120/min | Snapshot bio-age din date complete (raw metrics) |
| `/bio-age/current` | GET | 120/min | Bio-age curent (legacy, folosit de purpose/*) |
| `/bio-age/history` | GET | 120/min | Istoric bio-age (stub — frontend folosește Prisma) |
| `/workout/log` | POST | 120/min | Log antrenament |
| `/workout/weekly` | GET | 120/min | Movement score săptămânal |
| `/intervention/today` | POST | 120/min | Intervenție zilnică (cu istoric + trend bonuses) |
| `/circadian/score` | POST | 60/min | Scor nutriție circadiană |

---

## 7. Modele ML — Pipeline complet

### Pipeline de predicție a alimentelor (`/predict`)

```
Imagine (bytes)
    │
    ▼
┌──────────────────────────────────┐
│  1. YOLO Segmentation             │
│  Model: yolo_foodseg_best.pt       │
│  Input: PIL Image (RGB)            │
│  Output: bounding boxes + conf     │
│  Sort descrescător după arie       │
│  Top-3 regiuni (crop)              │
└──────────┬───────────────────────┘
           │ pentru fiecare regiune (w,h ≥ 10px)
           ▼
┌──────────────────────────────────┐
│  2. EfficientNet B4 Classifier    │
│  Model: nutritrack_B4_SUPREM.keras │
│  Input: 380×380 RGB                │
│  Preprocess: EfficientNet specific │
│  Output: 270 clase (top-3)         │
│  Confianță per clasă               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  3. Nutrition Lookup              │
│  Source: nutrition_data.json       │
│  Per clasă: calories, protein,     │
│  carbs, fats per serving           │
│  Scale: ×0.7 (small), ×1.0 (med), │
│  ×1.3 (large)                      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  4. Response                      │
│  { food_class, display_name,       │
│    confidence, nutrition,          │
│    bbox, yolo_confidence,          │
│    top_predictions,                │
│    all_regions (dacă >1) }         │
└──────────────────────────────────┘
```

### Modele

| Model | Fișier | Dimensiune | Input | Output |
|-------|--------|-----------|-------|--------|
| YOLO segmentation | `yolo_foodseg_best.pt` | 52 MB | Imagine PIL | Boxes + confidence per regiune |
| EfficientNet B4 | `nutritrack_B4_SUPREM.keras` | 240 MB | 380×380 RGB | 270 clase (softmax) |
| MIND classifier | `mind_pattern_model.pkl` | 3.4 MB | Feature vector (MIND categories) | Pattern class |
| Q-Tables | `multi_agent_q_tables.json` | — | State per agent | Q-values per action |

---

## 8. Calcul vârstă biologică

### Formula de bază

```
biological_age = chronological_age × ∏(hazard_ratios)
```

Clampat între 0.5× și 2.0× vârsta cronologică.

### Cele 7 dimensiuni

| Dimensiune | Weight | Sursă date | Scoring |
|-----------|--------|-----------|---------|
| **Nutrition** | 0.20 | healthy_score + mind_score + circadian_score + protein_timing | Medie ponderată 0-100 |
| **Sleep** | 0.20 | Protocol morning (recovery, energy) + sleep hours | 0-100 pe praguri |
| **ANS** | 0.10 | HRV readings (rmssd) → stress_level → scor | 0-100 invers proporțional cu stress |
| **Movement** | 0.25 | Workout logs (frequency, intensity, type) → VO2max estimat | 0-100 pe VO2max percentile |
| **Light** | 0.10 | Circadian (eating window, first/last meal, morning light) | 0-100 pe timing + consistency |
| **Subjective** | 0.15 | Protocol (mood, energy, focus, libido) + gratitude | Medie 1-5 scalat la 0-100 |
| **Hormesis** | 0.00 | Cold exposure, sauna, fasting, breathwork | 0-100 (doar pentru HR, nu composite) |

### Hazard Ratios

Fiecare dimensiune are propriul hazard ratio (HR) derivat din tabele de prag:

| Scor dimensiune | HR | Efect asupra bio-age |
|----------------|-----|---------------------|
| ≥80 | 0.90 | -10% (mai tânăr) |
| 60-79 | 0.95 | -5% |
| 40-59 | 1.00 | neutru |
| 20-39 | 1.08 | +8% (mai bătrân) |
| <20 | 1.15 | +15% |

HR-uri adiționale pentru: VO2max (pe percentile), inflammaging, hormesis.

**Bio-age final** = `chrono_age × HR_nutrition × HR_sleep × HR_ans × HR_movement × HR_light × HR_subjective × HR_vo2max × HR_inflammaging`

### Pace of Aging

Calculat din istoric (minim 3 snapshot-uri):
```
pace = 1 + (annual_change / chrono_age)
```
- `< 0.95` → "decelerating" (îmbătrânești mai încet)
- `0.95 - 1.05` → "normal"
- `> 1.05` → "accelerating"

Dacă istoric < 3 → folosește `hr_product` ca fallback.

### Organ Ages

| Organ | Weight-uri dimensiuni |
|-------|----------------------|
| **Brain** | subjective 0.40 + sleep 0.35 + inflammaging 0.25 |
| **Cardiovascular** | movement 0.50 + ans 0.30 + inflammaging 0.20 |
| **Metabolic** | nutrition 0.45 + sleep 0.25 + inflammaging 0.30 |
| **Immune** | sleep 0.35 + subjective 0.25 + inflammaging 0.40 |

Penalty per organ = `avg_gap × 0.06` (gap = chrono_age - biological_age).

### Leverage Point

Alege dimensiunea cu `effective_gain` maxim:
```
effective_gain = DOSE_GAINS[dim] × room_to_improve
room_to_improve = 100 - current_score
```

`DOSE_GAINS`: sleep 1.8, ans 1.4, movement 1.2, subjective 1.1, nutrition 1.0, light 0.8, hormesis 0.6.

**Trend bonuses** (din istoric): dacă o dimensiune a scăzut >10% în ultimele 3 zile vs zilele 4-7, primește bonus proporțional (max 0.9).

---

## 9. Algoritmi de scoring

### Healthy Score (nutrition_service.py)

```
healthy_score = 0.25×calorie_score + 0.25×protein_score + 0.20×fat_score
              + 0.15×meal_timing_score + 0.15×consistency_score
```
- `calorie_score = 100 - abs(1 - calories/target) × 100`
- `protein_score = 100 - abs(1 - protein/target) × 100`
- `fat_score = 100 - abs(1 - fats/target) × 100`
- `meal_timing_score`: 100 dacă `late_meals_count < 3`, altfel 60
- `consistency_score`: 100 dacă `days_on_target ≥ 5`, altfel scalat

### MIND Score (mind_score_service.py)

Scor 0-100 pe dieta MIND (Mediterranean-DASH Intervention for Neurodegenerative Delay):
- **Positive categories** (mai mult = mai bine): green leafy, berries, nuts, olive oil, fish, whole grains, beans, poultry, vegetables
- **Negative categories** (mai puțin = mai bine): red meat, butter, cheese, pastries, fried food, fast food
- Pattern classification via sklearn model (`mind_pattern_model.pkl`)

### Protein Timing Score (nutrition_service.py)

- Masă considerată "cu proteină" dacă are ≥ 20g protein
- Bonus 1-5 după fereastră orară (mic dejun > prânz > cină)
- Coverage: 60 (câte mese cu proteină din total)
- Timing: 40 (distribuția pe parcursul zilei)
- Total: `coverage + timing`, max 100

### Circadian Score (circadian_service.py)

- **Distribution**: morning 30% / midday 40% / evening 30% (ideal)
- **Timing**: praguri 8am / 7pm / 9pm
- **Consistency**: 90 (≥3 mese), 70 (2 mese), 40 (1 masă), 0 (0 mese)
- **Eating window**: 10-12h optim, >16h suboptimal

### Circadian Extended (protocol_service.py)

Sub-scoruri pentru:
- `morning_light` (expunere lumină matinală)
- `evening_screens` (evitarea ecranelor seara)
- `sleep_consistency` (ora culcare consistentă)
- `caffeine_cutoff` (fără cofeină după 14:00)

---

## 10. Sistemul multi-agent RL

### Arhitectură

5 agenți Q-learning independenți, fiecare specializat pe o dimensiune:

| Agent | State | Actions | Scop |
|-------|-------|---------|------|
| **Protein Agent** | protein intake vs target | increase/maintain/decrease | Recomandare proteină |
| **Calorie Agent** | calorie balance | increase/maintain/decrease | Recomandare calorii |
| **Timing Agent** | meal timing pattern | earlier/spread/consolidate | Recomandare timing |
| **Fat Agent** | fat intake vs target | increase/maintain/decrease | Recomandare grăsimi |
| **Consistency Agent** | days_on_target | maintain/improve/streak | Recomandare consistență |

### Coordinator (`agents/coordinator.py`)

1. Fiecare agent generează recomandare individuală
2. Coordinator selectează agent-ul cu **cea mai mare prioritate** (pe baza deviației față de target)
3. Returnează: `selected_agent + state + action + recommendation + all_agents`

### Q-Tables

Stocate în `models/multi_agent_q_tables.json` — pre-antrenate offline.

---

## 11. Securitate & Auth

### Flow de autentificare

```
1. Onboarding (8 pași)
   ├── User completează: nume, vârstă, sex, greutate, înălțime, tip, activitate, goal, somn
   └── La final: POST /api/auth/login { displayName }
        ├── Backend Prisma: prisma.user.upsert({ where: { displayName }, ... })
        ├── Session: signSession(userId) → cookie neurosnap_session (HMAC, 30 zile)
        ├── localStorage: neurosnap_user { id, displayName }
        ├── localStorage: neuronap_profile_{userId} { displayName, age, sex, ... }
        └── localStorage: neurosnap_targets_{userId} { calories, protein, fats, ... }

2. Request-uri ulterioare
   ├── Browser trimite cookie neurosnap_session automat
   ├── Middleware: verifySession(token) → userId
   ├── Middleware: injectează X-User-ID header pe /api/*
   └── API route: requireUserId(request) → userId → Prisma query filter
```

### Sesiuni

- **Semnare**: HMAC-SHA256 cu `SESSION_SECRET` (min 32 bytes, obligatoriu în Vercel)
- **Format token**: `userId.issuedAt.sig` (3 segments)
- **Expirare**: 30 zile de la emitere
- **Verificare**: `verifySession(token)` → verifică semnătură + expirare
- **Fallback legacy**: acceptă token-uri vechi (2 segments) cu `isValidUserId()` (migrare)

### Backend protection

- **`X-Internal-Token`** middleware: verifică header contra `INTERNAL_API_TOKEN` (shared secret cu frontend). Dacă lipsește/nu matchează → 401 JSON. Dacă env var nu e setat → dev mode (permite tot + warning).
- **CORS**: `allow_origins` din `ALLOWED_ORIGINS` env (CSV). `allow_credentials=False`. `allow_methods` explicite.
- **Rate limiting**: slowapi pe IP client (preferă `X-Forwarded-For`).

### Validare input

- **Pydantic models** pe toate rutele POST (vezi `schemas.py`): câmpuri cu tipuri, defaults, constrângeri (`ge=1, le=5` pentru scale, etc.)
- **RequestValidationError** handler → 422 JSON cu `details: exc.errors()`
- **Niciun `data["..."]` direct** în rute — toate accesările prin model

### Error handling

- **Global exception handler**: prinde orice `Exception` → 500 JSON `{error, code, request_id}` (fără traceback în producție; cu `DEBUG=true` adaugă `detail: str(exc)`)
- **HTTPException handler**: JSON cu status code correct
- **Logging server-side**: `logging.basicConfig` + `request_id` per request (header `X-Request-ID` sau generat `uuid.uuid4().hex[:8]`)

### Criptare E2E (jurnal)

- **AES-GCM** client-side cu `crypto.subtle`
- Cheia generată per-user în localStorage (`neurosnap_journal_key_{userId}`)
- Server-ul stochează doar `encryptedEntry + iv` — nu poate decripta
- **Atenție**: schimbarea device-ului = pierdere acces la jurnal (cheia e locală)

---

## 12. PWA & Service Worker

### Manifest (`public/manifest.json`)

```json
{
  "name": "NeuroSnap Vision",
  "short_name": "NeuroSnap",
  "display": "standalone",
  "scope": "/",
  "lang": "ro",
  "orientation": "portrait",
  "categories": ["health", "lifestyle"],
  "icons": [
    { "src": "/images/icon-192.png", "sizes": "192x192", "purpose": "any maskable" },
    { "src": "/images/icon-512.png", "sizes": "512x512", "purpose": "any maskable" }
  ],
  "shortcuts": [
    { "name": "Scan masă", "url": "/vision-ai" },
    { "name": "Jurnal", "url": "/journal" }
  ]
}
```

### Service Worker (`public/sw.js`)

- **Cache navigare**: fetch → cache match → fallback Response 503
- **Cache static**: `_next/`, `/images/` (stale-while-revalidate)
- **notificationclick**: focus client existent / openWindow

### Metadata (`app/layout.tsx`)

- `manifest: "/manifest.json"`
- `appleWebApp: { capable: true, title: "NeuroSnap Vision", statusBarStyle: "default" }`
- `formatDetection: { telephone: false }`
- `themeColor: "#22c55e"`
- `openGraph: { title, description, url, siteName, images, locale: "ro_RO", type: "website" }`
- `twitter: { card: "summary_large_image", ... }`
- `lang: "ro"`

---

## 13. Variabile de mediu

### Frontend (Vercel env vars)

| Variabilă | Scope | Secret | Default | Descriere |
|-----------|-------|--------|---------|-----------|
| `DATABASE_URL` | server | da | — | Prisma Accelerate URL |
| `SESSION_SECRET` | server | da | "dev-..." | HMAC session secret (min 32 bytes) |
| `BACKEND_URL` | server | nu | `http://127.0.0.1:8000` | URL backend Python |
| `YOLO_SPACE_URL` | server | nu | — | URL HF Space YOLO (fallback predict) |
| `CLASSIFIER_SPACE_URL` | server | nu | — | URL HF Space EfficientNet (fallback) |
| `INTERNAL_API_TOKEN` | server | da | "" | Shared secret cu backend |
| `OLLAMA_CLOUD_URL` | server | nu | `http://localhost:11434` | URL Ollama LLM |
| `OLLAMA_MODEL` | server | nu | `nemotron-3-ultra:cloud` | Model LLM |
| `OLLAMA_CLOUD_API_KEY` | server | da | "" | Cheie API Ollama |
| `BLOB_READ_WRITE_TOKEN` | server | da | — | Token Vercel Blob |
| `NEXT_PUBLIC_SITE_URL` | public | nu | — | URL pentru sitemap/robots |
| `NEXT_PUBLIC_SENTRY_DSN` | public | nu | "" | DSN Sentry client |
| `SENTRY_DSN` | server | nu | "" | DSN Sentry server |

### Backend (HF Space secrets)

| Variabilă | Secret | Default | Descriere |
|-----------|--------|---------|-----------|
| `INTERNAL_API_TOKEN` | da | "" | Shared secret cu frontend (identic) |
| `ALLOWED_ORIGINS` | nu | `http://localhost:3000` | CSV origini frontend permise |
| `DEBUG` | nu | "" | `"true"` pentru traceback în responses (doar dev) |
| `PORT` | nu | `7860` | Port HF Space (auto-setat) |
| `SENTRY_DSN` | nu | "" | DSN Sentry backend (opțional) |

---

## 14. Deploy

### Frontend → Vercel

1. Conectează repo `github.com/Andrei1loc1/NeuroSnapVision` în Vercel
2. **Root Directory**: `frontend`
3. Build command: `npm run build` (include `prisma generate`)
4. Setează toate env vars (vezi tabel de mai sus)
5. Auto-deploy pe push la `main`

### Backend → Hugging Face Space

1. Creează Docker Space (SDK: Docker)
2. Conținutul din `backend/hf-space/` e gata (Dockerfile + app.py + models/ + services/)
3. Setează în Space → Settings → Variables and secrets:
   - `INTERNAL_API_TOKEN` (identic cu Vercel)
   - `ALLOWED_ORIGINS` (URL producție + `http://localhost:3000`)
   - (opțional) `SENTRY_DSN`
4. Push: `git push hf main` (sau Factory Reboot din UI)
5. Verifică: `https://[space-name].hf.space/health` → JSON cu `models_loaded: true`

### Fallback Spaces (Gradio standalone)

- `yolo-space/` → Space Gradio pentru detecție YOLO (folosit când backend-ul principal eșuează)
- `gradio-space/` → Space Gradio pentru clasificare EfficientNet

URL-urile lor sunt configurate în `YOLO_SPACE_URL` + `CLASSIFIER_SPACE_URL` pe Vercel.

---

## Flow-uri funcționale complete

### Onboarding (8 pași)

1. **NameStep** → utilizator introduce nume
2. **AgeStep** → vârstă (numeric)
3. **SexStep** → male/female/other
4. **WeightHeightStep** → greutate (kg) + înălțime (cm)
5. **BodyTypeStep** → ectomorph/mesomorph/endomorph
6. **ActivityStep** → sedentary/light/moderate/active/very_active
7. **GoalStep** → lose_weight/maintain/gain_muscle/gain_weight/longevity/energy/performance
8. **SleepStep** → ore somn (slider)

La final:
- `login(displayName)` → POST `/api/auth/login` → cookie session + localStorage user
- `calculateSmartTargets(data)` → calculează BMR/TDEE + target calorii/proteină/grăsimi → localStorage targets
- `setStoredProfile(data)` → localStorage profile
- PUT `/api/user/profile` → sincronizează cu Prisma
- Redirect `/` (home)

### Scan masă (end-to-end)

1. User apasă "Loghează o masă" (Home) sau FAB "+" (Journal) → `/vision-ai`
2. `CameraScanner` deschide camera → capture foto
3. POST `/api/predict` (proxy) → backend YOLO+EfficientNet → returnează predicții
4. `PredictionPanel` afișează regiuni detectate + selector porție + selector mealType (auto-detectat pe baza oreii)
5. User confirmă → `saveMultiItemMeal(items, portion, mealType)` → POST `/api/journal`
6. Masa se salvează în Prisma + apare în Journal timeline

### Ritual zilnic (protocol)

1. User deschide `/protocol`
2. Alege tab: morning / evening (auto-sugestat pe baza completării)
3. Completează scale 1-5 (mood, energy, recovery, stress, etc.) + boolean flags (cold exposure, caffeine cutoff, etc.)
4. Submit → POST `/api/bio-age/protocol/morning` (sau evening) → backend calculează streak + Prisma salvează
5. Dacă ambele completate → `isComplete: true` → celebration animation + streak crește
6. `StreakCalendar` se actualizează (primește `streakData` ca prop de la părinte)

### AI Chat

1. User apasă buton AI → `ChatAssistant` portal se deschide
2. La deschidere: `setChatContext(null)` → useEffect se re-rulează → fetch context complet (bio-age, scoruri, obiective)
3. User scrie mesaj → POST `/api/ai-chat` cu `{ message, history, context, northStar }`
4. Backend construește prompt cu system message (instrucțiuni: ancorare în North Star, fără calorii decât dacă întreabă, blândețe la absență) + user message
5. Ollama Cloud răspunde via SSE (Server-Sent Events) → token cu token
6. Frontul randează token-urile live + parse markdown + score badges + citations
7. La închidere: mesajele se persistă în localStorage per-user

### Bio-age (end-to-end)

1. User deschide `/bio-age`
2. `useBioAge(userId, age)` → POST `/api/bio-age/snapshot` (proxy)
3. Proxy:
   - Verifică cache în Prisma (`BioAgeSnapshot` din ultimele 24h) → dacă există, returnează-l
   - Dacă nu: adună date din Prisma (meals 7z, protocols 30z, workouts 7z, hrv 7z) + localStorage (targets, sleep_time) → POST către backend `/bio-age/snapshot`
   - Backend: `compute_bio_age_from_raw_data(age, raw_data, history)` → calculează 7 dimensiuni + hazard ratios + composite → bio-age + organ ages + leverage point
   - Proxy salvează snapshot în Prisma (`BioAgeSnapshot` upsert)
4. Frontend afișează: BioAgeCard (cu mini-chart trend) + 6 DimensionScoreBars + BioAgeTrendCard (7/30/90/365) + AllostaticTrajectory + 4 OrganAgeCards + DailyLeverageCard

### Reports

1. User deschide `/reports`
2. `useReports()` → fetch paralel:
   - `fetchReport()` → GET `/api/reports` (Prisma)
   - `fetchWeeklyCalories()` → GET `/api/journal?days=7` (Prisma) → aggregare client-side
   - `fetchBackendInputs()` → POST `/api/healthy-score` + `/api/mind-score` (backend)
   - `fetchMealsInRange()` → GET `/api/journal?days=7` (Prisma)
   - `fetchRecommendation()` → POST `/api/recommendation` (backend multi-agent)
3. Calculează: week-over-week (compară cu `LAST_WEEK_KEY` per-user în localStorage), compliance (din `COMPLIANCE_KEY` acumulat per-user), macro balance, UPF%, diversity, P:E ratio, fiber
4. Afișează: WeeklyCaloriesCard (bar chart) + MacroBalanceCard (pie + sub-scoruri) + BrainHealthCard (MIND) + AIRecommendationsCard + WeeklyReportDownloadCard (CSV export)

---

## Notă finală

Acest manual reflectă starea aplicației la data de 26 iulie 2026. Pentru setup și troubleshooting vezi `frontend/README.md` și `backend/README.md`.