# Spec: Romanian Terminology Overhaul for NeuroSnap Vision

**Date:** 2026-06-27
**Status:** Approved
**Scope:** Rename all user-facing concepts from English to Romanian with lifestyle-scientific tone

---

## 1. Core Metric

| Old (EN) | New (RO) | Notes |
|---|---|---|
| Biological Age | **Vârsta Stilului de Viață** | Honest — reflects that this is a lifestyle composite, not a lab test |
| Chronological Age | **Vârsta Reală** | Simple, clear contrast to "Vârsta Stilului de Viață" |
| Pace of Aging | **Trendul Vârstei** | Secondary indicator showing direction |
| decelerating | **Îmbunătățire** | Green badge |
| normal | **Stabil** | Amber badge |
| accelerating | **Declin** | Red badge |

## 2. Seven Dimensions

| Old (EN) | New (RO) | Rationale |
|---|---|---|
| Movement | **Mișcare** | Direct, clear |
| Nutrition | **Alimentație** | Warmer than "Nutriție", more lifestyle |
| Sleep | **Odihnă** | Broader than "Somn", includes recovery |
| ANS | **Echilibru** | Wellness tone, avoids technical jargon |
| Light | **Ritm Circadian** | More descriptive than just "Lumină" |
| Subjective | **Stare de Bine** | Perfect Romanian equivalent for mood+energy+focus |
| Hormesis | **Reziliență** | Accessible, means "capacity to handle stress" |

## 3. UI Concepts

| Old (EN) | New (RO) |
|---|---|
| Daily Leverage / Top Leverage | **Impactul Zilei** / **Cel mai mare impact** |
| Protocol (morning/evening) | **Ritual Zilnic** (dimineață / seară) |
| Wisdom Cards | **Insight-uri** |
| Streak | **Zile Consecutive** |
| Compliance | **Consecvență** |
| Bio-Age Snapshot | **Evaluarea Vârstei** |
| Intervention | **Recomandare Personalizată** |
| Protocol Quick Check | **Verificare Rapidă** |
| Daily Summary | **Rezumatul Zilei** |
| Reports | **Rapoarte** |
| Journal | **Jurnal** |
| Scan Meal | **Scanează Masa** |
| AI Assistant | **Asistent AI** |
| Onboarding | **Bun venit** |

## 4. Implementation Notes

- All changes are **text-only** — no logic changes, no API changes
- Backend API field names remain in English (they're internal)
- Only user-facing Romanian text changes
- Lucide icons remain unchanged
- Emerald color scheme remains unchanged
- Glassmorphism design remains unchanged

## 5. Files to Modify

- `components/home/BioAgeCard.tsx` — Vârsta Stilului de Viață, Trendul Vârstei, badge-uri
- `components/home/DailyLeverageCard.tsx` — Impactul Zilei
- `components/home/HomeHeader.tsx` — titlu, subtitlu
- `components/home/SleepScoreCard.tsx` — Odihnă
- `components/home/NutritionCard.tsx` — Alimentație
- `components/home/StreakCard.tsx` — Zile Consecutive
- `components/home/WisdomCard.tsx` — Insight-uri
- `components/home/ProtocolQuickCheck.tsx` — Verificare Rapidă, Ritual Zilnic
- `components/bio-age/BioAgeTrendCard.tsx` — Vârsta Stilului de Viață, Trendul Vârstei
- `components/bio-age/DimensionScoreBar.tsx` — nume dimensiuni
- `components/bio-age/NeuroGraph.tsx` — nume dimensiuni
- `components/bio-age/OrganAgeCard.tsx` — Evaluarea Vârstei
- `components/camera/CameraPreview.tsx` — Scanează Masa
- `components/camera/PredictionPanel.tsx` — text română
- `components/journal/JournalHeader.tsx` — Jurnal
- `components/journal/DailySummaryCard.tsx` — Rezumatul Zilei
- `components/journal/MealTimeline.tsx` — text română
- `components/onboarding/*.tsx` — Bun venit
- `components/reports/ReportsHeader.tsx` — Rapoarte
- `components/ai/ChatAssistant.tsx` — Asistent AI
- `components/layout/Navbar.tsx` — etichete navigare
- `app/page.tsx` — titluri secțiuni
- `app/bio-age/page.tsx` — titlu pagină
- `app/protocol/page.tsx` — Ritual Zilnic
- `app/journal/page.tsx` — Jurnal
- `app/reports/page.tsx` — Rapoarte
- `lib/constants/app.ts` — constante text (dacă există)
