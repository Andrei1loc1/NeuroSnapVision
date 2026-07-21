# NeuroSnap Vision — Feature Roadmap

## Design System Reminder
- **Mobile-first** — max-width 430px, touch targets 44px+
- **Emerald-only palette** — primary #22c55e, shades from #10b981 to #6ee7b7
- **Glassmorphism** — `border border-white bg-white/20 backdrop-blur-xl rounded-[28-32px]`
- **Lucide icons** — no emojis ever
- **Romanian text** — all user-facing strings in Romanian
- **Card pattern** — `rounded-[22px] border border-white/70 bg-white/20 shadow-sm` for inner items
- **Typography** — `text-sm font-semibold text-zinc-600` for headers, `text-xs font-medium text-zinc-400` for subtitles
- **No wearables, no RAG/LLM for V1** — manual input only, static knowledge cards

---

## Feature 02: Smart Onboarding (PRIORITY 1)

### Why
Without baseline data (age, sex, body type, habits, goals), every user gets the same bio-age score. The 6 questions personalize the algorithm.

### 6 Baseline Questions
1. **Vârstă** — number input (18-100)
2. **Sex** — Male / Female / Other (buttons)
3. **Tip corporal** — Slab / Mediu / Robust (visual cards)
4. **Nivel activitate** — Sedentar / Moderat / Activ (visual cards)
5. **Obiectiv principal** — Longevitate / Energie / Performanță (visual cards)
6. **Somn mediu** — slider 4-10 ore

### Files to Create/Modify
- `app/onboarding/page.tsx` — Rewrite with 6-step wizard
- `components/onboarding/OnboardingStep.tsx` — Reusable step component
- `components/onboarding/AgeStep.tsx` — Step 1
- `components/onboarding/SexStep.tsx` — Step 2
- `components/onboarding/BodyTypeStep.tsx` — Step 3
- `components/onboarding/ActivityStep.tsx` — Step 4
- `components/onboarding/GoalStep.tsx` — Step 5
- `components/onboarding/SleepStep.tsx` — Step 6
- `components/onboarding/OnboardingProgress.tsx` — Progress bar
- `lib/auth/profile.ts` — Update with new fields
- `lib/auth/targets.ts` — Smart defaults based on answers

### UX Flow
- Each step: 1 question, large touch targets, emerald accent
- Progress bar at top (6 dots, emerald fill)
- Next button at bottom, disabled until selection
- After step 6: redirect to Home with personalized defaults
- Store in localStorage (V1), ready for NextAuth migration

---

## Feature 03: Streak Calendar & Grace Period (PRIORITY 2)

### Why
Current streak is just a number. Users need visual consistency feedback without guilt.

### Components
- **StreakCalendar** — GitHub-style grid, 7 columns (Mon-Sun), 4+ rows (weeks), emerald intensity per day
- **Grace period logic** — Miss 1 day = streak pauses, not resets. Miss 2+ = reset.
- **StreakCard** — on Home: current streak, longest streak, motivational message

### Files to Create/Modify
- `components/home/StreakCard.tsx` — Streak number + fire icon + message
- `components/protocol/StreakCalendar.tsx` — GitHub-style grid
- `hooks/useStreak.ts` — Grace period logic, streak calculation
- `app/protocol/page.tsx` — Add StreakCalendar below check-in

### Streak Messages (Romanian)
- 0 days: "Începe azi! Un singur check-in contează."
- 1-2 days: "Bun început! Continuă mâine."
- 3-6 days: "Aproape o săptămână completă!"
- 7+ days: "O săptămână completă! Ești în formă."
- 30+ days: "30 de zile consecutive! Impresionant."

---

## Feature 04: Wisdom Cards (PRIORITY 3)

### Why
The leverage point tells WHAT to do, but not WHY. Static knowledge cards give context without LLM/RAG.

### How It Works
- Each card linked to a dimension + score range
- Shown after check-in or on bio-age page
- ~50 cards total, 8-10 per dimension
- Simple rotation: show different card each day

### Card Structure
```
{
  id: string,
  dimension: "nutrition" | "sleep" | "ans" | "movement" | "light" | "subjective",
  scoreRange: [min, max],
  title: string,        // Romanian
  insight: string,      // 1-2 sentences, WHY it matters
  action: string,      // What to do about it
  source: string       // e.g. "Walker, 2017" or "MIND Diet Study"
}
```

### Files to Create/Modify
- `lib/data/wisdom-cards.ts` — Static card data, ~50 cards
- `components/home/WisdomCard.tsx` — Card UI (glassmorphism, emerald)
- `hooks/useWisdomCard.ts` — Select card based on dimension + score + day rotation
- `app/page.tsx` — Add WisdomCard to Home

### Design
- Same pattern as DailyLeverageCard but with insight + source
- `rounded-[32px]` outer card, `rounded-[22px]` inner item
- Icon: lightbulb or Brain from lucide
- Source shown as small text: "Sursa: Walker, Why We Sleep, 2017"

---

## Feature 05: Sleep Priority Card (PRIORITY 4)

### Why
Sleep is the #1 dimension but buried inside bio-age. Needs visibility on Home.

### Components
- **SleepScoreCard** — Hero card on Home: sleep score, trend sparkline, one insight
- Uses same pattern as BioAgeCard (number + sparkline + insight text)

### Files to Create/Modify
- `components/home/SleepScoreCard.tsx` — Sleep hero card
- `app/page.tsx` — Add SleepScoreCard after BioAgeCard
- Data comes from existing `useBioAge` hook (`sleepScore`)

### Design
- Moon icon from lucide in header
- Score large, /100
- Sparkline (same as BioAgeCard)
- One insight: "Dacă ai dormi 30 min mai mult, vârsta biologică ar putea scădea cu 0.8 ani"

---

## Feature 06: Bio-Age Trend Chart (PRIORITY 5)

### Why
We have the history endpoint but no UI. Users need to see progress over time.

### Components
- **BioAgeTrendCard** — Area chart with 7d/30d/90d/1y selector
- Uses recharts (already in project)
- Shows biological age vs chronological age over time

### Files to Create/Modify
- `components/bio-age/BioAgeTrendCard.tsx` — Chart + time selector
- `app/bio-age/page.tsx` — Add below dimension scores

### Design
- Time selector: pill buttons (7d / 30d / 90d / 1y) — same style as WorkoutCard type selector
- Emerald gradient area chart
- Dashed line for chronological age reference
- Mobile: full width, 200px height

---

## Implementation Order (Parallel Agents)

### Agent A: Feature 02 — Smart Onboarding
- 6-step wizard with emerald glassmorphism
- Progress dots at top
- Large touch targets, mobile-first
- Store answers in localStorage
- Redirect to Home after completion

### Agent B: Feature 03 — Streak Calendar & Grace Period
- GitHub-style calendar grid
- Grace period logic in hook
- StreakCard on Home
- Romanian messages

### Agent C: Feature 04 — Wisdom Cards
- Create ~50 static cards in lib/data/wisdom-cards.ts
- WisdomCard component (same style as DailyLeverageCard)
- useWisdomCard hook for selection
- Add to Home page

### Agent D: Feature 05 — Sleep Priority Card
- SleepScoreCard component
- Add to Home page
- Uses existing bio-age data

### Agent E: Feature 06 — Bio-Age Trend Chart
- BioAgeTrendCard with recharts
- Time period selector
- Add to bio-age page

---

## File Structure (New Files Only)

```
components/
  onboarding/
    AgeStep.tsx
    SexStep.tsx
    BodyTypeStep.tsx
    ActivityStep.tsx
    GoalStep.tsx
    SleepStep.tsx
    OnboardingProgress.tsx
  home/
    StreakCard.tsx
    WisdomCard.tsx
    SleepScoreCard.tsx
  protocol/
    StreakCalendar.tsx
  bio-age/
    BioAgeTrendCard.tsx
lib/
  data/
    wisdom-cards.ts
  hooks/
    useStreak.ts
    useWisdomCard.ts
```