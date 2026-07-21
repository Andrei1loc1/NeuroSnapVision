# AI Workflow Rules: NeuroSnap Vision

## Approach

**Spec-driven, incremental, context-first development**

1. Read all 6 context files before any work
2. Check `progress-tracker.md` for current phase
3. Identify governing feature spec
4. If no spec exists → write one in `context/feature-specs/`
5. Plan → Build → Verify → Update docs

## Scoping Rules

- **One feature unit at a time** — Complete end-to-end before next
- **Feature unit** = Single user-facing capability with clear boundaries
- **Max scope per session**: One feature spec implementation

## When To Split Work

Split implementation step if it combines:

1. **UI changes + background task changes** (e.g., new page + cron job)
2. **Database changes + API route changes in unrelated areas** (e.g., protocol + workout models)
3. **Multiple unrelated features** (e.g., bio-age + experiment framework)
4. **Behavior not clearly defined in context files** (ambiguity = stop, document, resolve)
5. **Cannot verify end-to-end quickly** (scope too broad)

### Split Examples

| Combined Task | Split Into |
|---------------|------------|
| "Add protocol page + bio-age computation" | 1. Protocol page UI + API, 2. Bio-age service + computation |
| "Add workout logging + HealthKit sync" | 1. WorkoutCard + manual log, 2. HealthKit integration |
| "Bio-age dashboard + neuro graph" | 1. Dashboard data + bars, 2. Neuro graph visualization |

## Handling Missing Requirements

**Do not invent product behavior** not defined in context files.

If ambiguous:
1. Add open question to `progress-tracker.md` → `Blockers`
2. Resolve in relevant context file before implementing
3. If urgent, propose 2-3 options with trade-offs, ask user

## Protected Foundation Components

**Do not modify** unless explicitly instructed:

- `components/ui/*` — All shadcn/ui base components (Button, Card, Badge, Toast, Progress, etc.)
- Third-party library internals
- `app/globals.css` — Only add, don't remove existing tokens
- `tailwind.config.*` — Not used (Tailwind v4 @theme inline)

**Project-specific logic belongs in:**
- `components/home/`, `components/bio-age/`, `components/protocol/`, etc.
- `hooks/`, `lib/services/`, `lib/api/`

## Keeping Docs In Sync

Update relevant context file **immediately** when implementation changes:

| Change Type | Update File |
|-------------|-------------|
| System architecture, boundaries, invariants | `architecture-context.md` |
| Storage model, Prisma schema changes | `architecture-context.md` |
| Code conventions, standards | `code-standards.md` |
| Design tokens, component patterns, layout | `ui-context.md` |
| Feature scope, goals, user flows | `project-overview.md` |
| Workflow rules, scoping | `ai-workflow-rules.md` |
| Phase, completed features, blockers | `progress-tracker.md` |

## Before Moving To Next Unit

**Completion Checklist:**

- [ ] Feature spec success criteria met (verified end-to-end)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] Context files updated for any architectural changes
- [ ] `progress-tracker.md` updated with completion summary
- [ ] No `any` types introduced
- [ ] No raw color values or hardcoded Tailwind colors in new components
- [ ] All new components follow glassmorphism patterns from `ui-context.md`

## Feature Spec Workflow

```
1. Read context files
2. Check progress-tracker.md
3. If no spec for task → Create feature-specs/feature-XX-name.md
4. PLAN: Analyze against context, identify files to create/modify
5. BUILD: Implement per spec
6. VERIFY: Build + lint + typecheck + manual test
7. SYNC: Update progress-tracker.md + relevant context files
8. COMMIT: (User handles git)
```

## AI-Specific Rules for This Project

### Bio-Age Computation
- Deterministic: same inputs → same output
- Pure functions in `services/bio_age_service.py`
- No randomness, no external API calls in core computation
- SHAP/explainability for every dimension contribution

### Intervention Engine
- Returns exactly ONE leverage point per day
- Marginal gain analysis: simulate +10% each dimension → pick max bio-age reduction
- Action text must be specific, actionable, time-bound

### Protocol System
- Always 4 taps morning + 4 taps evening (fixed)
- Smart defaults from previous day + nutrition data
- Skip allowed for any field
- Streak = consecutive days with BOTH morning AND evening complete

### WorkoutCard
- Exactly 3 inputs: Type (enum), Intensity (RPE 1-10), Duration (presets)
- No sets/reps/weight — user logs what they feel, not what they did
- Source tracking: manual | voice

### Neuro Graph (UI Only)
- 6 nodes (dimensions), edges = known physiological influences
- No ML in visualization — pure D3/React Flow
- Interactive hover → tooltip with mechanism explanation
- Pulses on daily recalculation

### Data Integrity
- Every Prisma write includes `userId` filter
- Compound unique indexes for daily models (`userId, date`)
- Backfill scripts for historical bio-age computation
- Soft deletes via `status` field

## Communication Patterns

- **Frontend → Backend**: REST, JSON, thin route handlers
- **Backend → ML**: In-process Python (TensorFlow, XGBoost, joblib)
- **Async work**: FastAPI `BackgroundTasks` for bio-age computation
- **Real-time**: Not in V1 (poll on navigation)

## Prohibited Patterns

- ❌ Business logic in route handlers (`app/api/*/route.ts`)
- ❌ Direct Prisma calls in frontend (always via backend API)
- ❌ `any` types in new code
- ❌ Raw color values in components
- ❌ Modifying `components/ui/*` 
- ❌ Adding fields to DailyProtocol beyond 4+4 taps
- ❌ Multiple leverage points from Intervention Engine
- ❌ Long-running work in request handlers