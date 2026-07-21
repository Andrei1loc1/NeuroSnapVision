# Architecture Context: NeuroSnap Vision

## Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | Next.js 14+ (App Router) + TypeScript | Full-stack React framework |
| UI | Tailwind CSS + shadcn/ui | Design system & components |
| Database | Prisma + PostgreSQL | Primary data persistence |
| Backend API | FastAPI (Python) | ML inference, bio-age computation, heavy computation |
| ML Models | TensorFlow/Keras + scikit-learn + joblib | Food recognition, MIND scoring, bio-age ensemble |
| Auth | localStorage (current) → NextAuth (planned) | Session management |
| File Storage | Local filesystem (backend/models) | Model weights, nutrition data |
| Deployment | Vercel (frontend) + Railway/Render (backend) | Hosting |

## System Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │ Components  │  │    Hooks    │             │
│  │ (app/*)     │  │(components/*)│ │  (hooks/*)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────┐               │
│  │          API Client (lib/api/*)             │               │
│  │  - fetchTodayTotals, fetchProtocol, etc.   │               │
│  └─────────────────────────────────────────────┘               │
└──────────────────────────────┬────────────────────────────────┘
                               │ HTTPS/REST
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Routes    │  │  Services   │  │   Models    │             │
│  │ (main.py)   │  │(services/*) │  │ (models/*)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────┐               │
│  │         ML Inference & Computation          │               │
│  │  - Food prediction (EfficientNet)           │               │
│  │  - Bio-Age Ensemble (XGBoost)               │               │
│  │  - Circadian Phase (GP)                     │               │
│  │  - Intervention Engine (Marginal Gain)      │               │
│  └─────────────────────────────────────────────┘               │
└──────────────────────────────┬────────────────────────────────┘
                               │ Prisma Client
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Core: User, Food, Scan, Meal, MealItem, ReportSnapshot │   │
│  │  New: DailyProtocol, BioAgeSnapshot, WorkoutLog, Experiment │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Responsibilities

**Frontend (`frontend/`)**
- `app/*` — Route pages (Server Components by default)
- `components/*` — Reusable UI components (Client Components where needed)
- `hooks/*` — React hooks for data fetching & state
- `lib/api/*` — API client functions
- `lib/services/*` — Client-side business logic
- `lib/db/*` — Prisma client & serializers
- `prisma/schema.prisma` — Database schema

**Backend (`backend/`)**
- `main.py` — FastAPI routes (thin, validation only)
- `services/*` — Business logic & ML inference
- `agents/*` — Multi-agent Q-learning system
- `models/*` — Model weights (.keras, .pkl, .json)

## Storage Model

| Data Type | Storage | Examples |
|-----------|---------|----------|
| **Relational Data** | PostgreSQL (Prisma) | Users, meals, scans, protocols, workouts, bio-age snapshots, experiments |
| **ML Model Weights** | Filesystem (`backend/models/`) | `model_final.keras`, `mind_pattern_model.pkl`, `multi_agent_q_tables.json` |
| **Nutrition Reference** | Filesystem (`backend/models/nutrition_data.json`) | 101 food classes → macros mapping |
| **Image Uploads** | Local filesystem → URL in DB | ScanImage.url (local path or future S3) |
| **User Session** | localStorage (current) | `neurosnap-user`, `neurosnap-targets`, `neurosnap-profile` |

## Auth & Collaboration Model

**Current (V1):**
- Single-user per browser via localStorage
- No server-side auth, no multi-device sync
- User identified by `displayName` (unique)

**Planned (V1.1):**
- NextAuth with email magic links
- User table in PostgreSQL (already exists)
- JWT tokens for API auth
- Multi-device sync via PostgreSQL

**Wearable Integration:** None — fully manual input only. All movement/sleep data from DailyProtocol taps + WorkoutCard.

**Roles:** Single role `USER` — owns all their data
**Access Control:** Row-level via `userId` foreign keys on all models

## Invariants (Never Violate)

1. **Request handlers do not run long-lived work** — ML inference, bio-age computation, report generation must be in background tasks or async services
2. **Metadata and large generated artifacts are stored in separate layers** — Model weights in filesystem, images in filesystem/blob, relational data in PostgreSQL
3. **Auth and ownership are enforced at every mutation boundary** — Every Prisma write includes `userId` filter; API routes verify ownership
4. **Client Components (`"use client"`) only where browser interactivity or real-time state requires them** — Default to Server Components
5. **Strict TypeScript throughout** — No `any`, prefer interfaces over types for public APIs
6. **Bio-Age computation is deterministic given same inputs** — Same 6 dimension inputs → same bio-age output (reproducibility)
7. **Intervention Engine returns ONE leverage point** — Never multiple competing actions; marginal gain analysis selects single max-impact dimension
8. **Daily Protocol is always 4 taps morning + 4 taps evening** — No feature creep adding fields; optional fields only in weekly deep check
9. **WorkoutCard has exactly 3 inputs** — Type, RPE intensity (1-10), Duration; no sets/reps/weight logging
10. **API routes stay thin** — Push complexity to `services/*` modules; route handlers only validate, call service, return response

## Communication Patterns

- **Frontend → Backend**: REST over HTTP (FastAPI), JSON request/response
- **Frontend → Database**: Never direct — always via backend API
- **Backend → ML Models**: In-process Python calls (TensorFlow, joblib, XGBoost)
- **Background Jobs**: FastAPI `BackgroundTasks` for async bio-age computation, report generation
- **Real-time**: Not used in V1 (polling/refresh on navigation)