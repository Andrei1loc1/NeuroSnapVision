# Feature 01: Bio-Age Foundation

## Description
Core infrastructure for Biological Age computation: Prisma models for daily protocol, bio-age snapshots, workout logs; backend services for bio-age computation, protocol management, workout logging, circadian nutrition scoring, and intervention engine; API endpoints for all new data flows.

## User Flow
1. User completes onboarding → baseline data stored
2. Daily: User opens app → sees BioAgeCard on Home with current bio-age, pace, leverage action
3. Morning: User taps 4 inputs (recovery, energy, mood, focus) → stored as DailyProtocol
4. Throughout day: User logs meals (existing) + optional workouts (WorkoutCard)
5. Evening: User taps 4 taps (stress, digestion, mood, energy) → completes DailyProtocol
6. Nightly: BioAgeComputationService runs → computes bio-age from 6 dimensions → stores BioAgeSnapshot
7. Next morning: Home shows updated bio-age, new leverage point

## UI Changes

### New Components
- `components/home/BioAgeCard.tsx` — Hero card: bio-age, pace, trend sparkline, CTA to `/bio-age`
- `components/home/DailyLeverageCard.tsx` — Single leverage action with impact quantification
- `components/home/ProtocolQuickCheck.tsx` — Inline 4-tap check-in (if protocol not complete)
- `components/bio-age/DimensionScoreBar.tsx` — Horizontal 0-100 bar with tooltip
- `components/bio-age/OrganAgeCard.tsx` — Organ-specific age card (brain, cardio, metabolic, immune)
- `components/bio-age/NeuroGraph.tsx` — D3/React Flow: 6 nodes + edges, interactive hover

### Modified Pages
- `app/page.tsx` — Add BioAgeCard, DailyLeverageCard, ProtocolQuickCheck
- `app/bio-age/page.tsx` — NEW: Full dashboard with all components above

## API Changes

### New Endpoints (FastAPI Backend)

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/protocol/morning` | POST | Submit morning check-in | `{recovery, energy, mood?, focus?}` | `{protocol, streak}` |
| `/protocol/evening` | POST | Submit evening check-in | `{stress, digestion, mood?, energy?, libido?}` | `{protocol, streak, isComplete}` |
| `/protocol/today` | GET | Get today's protocol (pre-filled) | — | `DailyProtocol` |
| `/bio-age/current` | GET | Current bio-age + leverage point | — | `BioAgeSnapshot + LeveragePoint` |
| `/bio-age/history` | GET | Time series (30/90/365 days) | `?days=90` | `BioAgeSnapshot[]` |
| `/workout/log` | POST | Log workout | `{type, intensity, durationMin, notes?, source?}` | `WorkoutLog` |
| `/workout/weekly` | GET | Weekly movement quality index | `?weekStart=2026-06-15` | `{movementScore, breakdown}` |
| `/intervention/today` | GET | Today's leverage action | — | `LeveragePoint` |

### New Types (Frontend `lib/types/index.ts`)
```typescript
interface DailyProtocol {
  id: string;
  userId: string;
  date: string;
  morningRecovery: number | null;
  morningEnergy: number | null;
  morningMood: number | null;
  morningFocus: number | null;
  eveningStress: number | null;
  eveningDigestion: number | null;
  eveningMood: number | null;
  eveningEnergy: number | null;
  eveningLibido: number | null;
  supplements: string[];
  completedAt: string | null;
  isComplete: boolean;
}

interface BioAgeSnapshot {
  id: string;
  userId: string;
  date: string;
  biologicalAge: number;
  chronologicalAge: number;
  paceOfAging: number;
  nutritionScore: number;
  sleepScore: number;
  ansScore: number;
  movementScore: number;
  lightScore: number;
  subjectiveScore: number;
  brainAge: number | null;
  cardiovascularAge: number | null;
  metabolicAge: number | null;
  immuneAge: number | null;
  topLeverageDimension: string | null;
  leverageAction: string | null;
  projectedImpact: number | null;
  inputData: Record<string, unknown>;
  createdAt: string;
}

interface LeveragePoint {
  dimension: string;
  action: string;
  projectedImpact: number; // years/year reduction
  currentScore: number;
  targetScore: number;
}

interface WorkoutLog {
  id: string;
  userId: string;
  date: string;
  type: 'strength' | 'cardio' | 'mobility' | 'sport' | 'walk' | 'other';
  intensity: number; // 1-10 RPE
  durationMin: number;
  notes: string | null;
  source: 'manual' | 'voice';
  createdAt: string;
}
```

## Database Changes

### Prisma Schema Additions (`prisma/schema.prisma`)

```prisma
model DailyProtocol {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime @db.Date
  morningRecovery Int?
  morningEnergy   Int?
  morningMood     Int?
  morningFocus    Int?
  eveningStress   Int?
  eveningDigestion Int?
  eveningMood     Int?
  eveningEnergy   Int?
  eveningLibido   Int?
  supplements     String[]
  completedAt     DateTime?
  isComplete      Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, date])
  @@index([userId, date])
}

model BioAgeSnapshot {
  id                 String   @id @default(cuid())
  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date               DateTime @db.Date
  biologicalAge      Float
  chronologicalAge   Int
  paceOfAging        Float
  nutritionScore     Float
  sleepScore         Float
  ansScore           Float
  movementScore      Float
  lightScore         Float
  subjectiveScore    Float
  brainAge           Float?
  cardiovascularAge  Float?
  metabolicAge       Float?
  immuneAge          Float?
  topLeverageDimension String?
  leverageAction     String?
  projectedImpact    Float?
  inputData          Json
  createdAt          DateTime @default(now())

  @@unique([userId, date])
  @@index([userId, date])
}

model WorkoutLog {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date         DateTime @db.Date
  type         String
  intensity    Int
  durationMin  Int
  notes        String?
  source       String   @default("manual") // manual | voice
  createdAt    DateTime @default(now())

  @@index([userId, date])
}

model Experiment {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  hypothesis  String
  protocol    Json
  status      String   @default("PLANNING")
  startDate   DateTime
  endDate     DateTime?
  results     Json?
  templateId  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, status])
}
```

## Integration Points

- **Depends on**: Existing nutrition data (meals, scans, healthy score, MIND score)
- **Feeds**: `/bio-age` dashboard, Home leverage card, Reports refactor (V2)
- **Triggers**: Nightly bio-age computation (background task)
- **Consumes**: DailyProtocol → BioAgeComputationService → BioAgeSnapshot

## Success Criteria

1. **Prisma migration** applies cleanly; all 4 new models queryable
2. **BioAgeComputationService** computes bio-age for user with 30+ days data
3. **Protocol API** accepts morning/evening check-ins; returns streak
4. **Workout API** logs workout; returns created record
5. **Intervention Engine** returns single leverage point with quantified impact
6. **Home page** displays BioAgeCard + DailyLeverageCard with real data
7. **`/bio-age` page** renders all components with real data
8. **Nightly job** computes bio-age for all active users
9. **Build + lint + typecheck** pass

## Notes / Open Questions

- **Algorithm V1**: Use literature-based formulas (PhenoAge/DunedinPACE proxies) — no ML training yet
- **Circadian Phase**: Proxy = sleep time - 2 hours; refine with light data later
- **ANS Proxy**: Morning recovery × sleep quality / (stress + 1) — validate later
- **Backfill**: Need script to compute bio-age for historical data (last 90 days)
- **Chronological Age**: From onboarding `age` field in User profile
- **Nightly Job**: FastAPI `BackgroundTasks` or separate cron (APScheduler)