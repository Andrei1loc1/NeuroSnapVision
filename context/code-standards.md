# Code Standards: NeuroSnap Vision

## General

- **Module size**: Max 300 lines per file; split by responsibility
- **Root cause**: Prefer fixing upstream over patching downstream
- **Concern separation**: UI, API, business logic, ML in separate layers
- **No `any`**: Strict TypeScript; use `unknown` if type truly unknown
- **Interfaces over types** for public APIs and component props
- **File naming**: `kebab-case` for files, `PascalCase` for components, `camelCase` for functions/variables

## TypeScript

```ts
// ✅ Good
interface UserProfile {
  displayName: string;
  age: number;
  targets: NutritionTargets;
}

// ❌ Avoid
type UserProfile = { ... }  // Use interface for public shapes

// ✅ Strict: no implicit any
function calculateScore(value: number, target: number): number { ... }

// ✅ Generics for reusable hooks
function useApi<T>(endpoint: string): { data: T | null; loading: boolean } { ... }
```

## Next.js (App Router)

### Server Components by Default
```tsx
// ✅ Default: Server Component (no "use client")
export default async function BioAgePage() {
  const data = await getBioAgeData(); // Direct DB/API call
  return <BioAgeDashboard data={data} />;
}
```

### Client Components Only When Needed
```tsx
// ✅ "use client" only for:
// - Browser APIs (camera, localStorage, geolocation)
// - Real-time state (WebSockets, SSE)
// - Interactivity (onClick, onChange, animations)
// - React hooks (useState, useEffect, useRef)

"use client";
import { useState } from "react";

export default function ProtocolCheckIn() {
  const [step, setStep] = useState<"morning" | "evening">("morning");
  // ...
}
```

### Route Handlers (API Routes)
```ts
// ✅ Thin handlers — delegate to services
// app/api/protocol/morning/route.ts
import { ProtocolService } from "@/lib/services/protocol";

export async function POST(req: Request) {
  const body = await req.json();
  const userId = getUserId(req); // Auth check
  const result = await ProtocolService.submitMorningCheckin(userId, body);
  return Response.json(result);
}
```

**Rules:**
- Route handlers: validation → auth → service call → response
- No business logic in route handlers
- No long-running work (use `BackgroundTasks` in FastAPI backend)
- Consistent response shape: `{ data?: T; error?: string }`

## Styling

### Token Usage (Mandatory)
```tsx
// ✅ Use CSS custom properties / Tailwind tokens
<div className="rounded-[var(--radius-xl)] bg-white/20 backdrop-blur-xl border border-white" />

// ✅ Tailwind mapped to CSS variables
<button className="bg-primary-600 text-primary-foreground hover:bg-primary-700" />

// ❌ NEVER: raw hex, raw Tailwind colors
<div className="bg-[#16a34a] text-white" />
<div className="bg-emerald-600 text-white" />
<div className="rounded-xl border-slate-200" />
```

### Glassmorphism Pattern (Standard)
```tsx
const glassCard = "rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl";
const heavyGlass = "rounded-[32px] border border-white/60 bg-white/30 backdrop-blur-2xl p-6 shadow-[0_32px_80px_rgba(20,83,45,0.12)]";
const inputStyle = "rounded-2xl border border-white/40 bg-white/40 px-4 py-3.5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50";
```

## API Routes

### Request/Response Shapes
```ts
// Request
interface MorningCheckinRequest {
  recovery: number;      // 1-5
  energy: number;        // 1-5
  mood?: number;         // 1-5 optional
  focus?: number;        // 1-5 optional
}

// Response
interface MorningCheckinResponse {
  protocol: DailyProtocol;
  streak: number;
}
```

### Validation
- Use Zod schemas in `lib/validators.ts`
- Validate at route handler entry
- Return 400 with `{ error: "field: message" }` on failure

## Data & Storage

### Prisma Conventions
```prisma
// ✅ Naming
model DailyProtocol {
  id            String   @id @default(cuid())
  userId        String
  date          DateTime @db.Date
  morningRecovery Int?
  // ...
  @@unique([userId, date])
  @@index([userId, date])
}

// ✅ Relations explicit
model WorkoutLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ...
}
```

### Database Rules
- All user-owned models have `userId` + `@@index([userId])`
- Compound unique indexes for one-per-day: `@@unique([userId, date])`
- Soft deletes via `status` field, not hard delete
- JSON fields for flexible/structured data (inputData, protocol, results)

## File Organization

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes (thin)
│   ├── bio-age/           # Feature pages
│   ├── protocol/          # Feature pages
│   └── globals.css        # Global styles + tokens
├── components/
│   ├── ui/                # shadcn/ui base components (PROTECTED)
│   ├── home/              # Home-specific components
│   ├── bio-age/           # Bio-age feature components
│   ├── protocol/          # Protocol feature components
│   ├── workout/           # Workout feature components
│   ├── camera/            # Camera feature components
│   ├── journal/           # Journal feature components
│   ├── reports/           # Reports feature components
│   ├── profile/           # Profile feature components
│   └── layout/            # Navbar, ClientWrapper
├── hooks/                 # React hooks (data fetching, state)
├── lib/
│   ├── api/               # API client functions
│   ├── services/          # Client-side business logic
│   ├── db/                # Prisma client, serializers
│   ├── types/             # Shared TypeScript types
│   ├── constants/         # App constants
│   └── utils/             # Pure utilities (cn, formatting)
└── prisma/
    └── schema.prisma      # Database schema

backend/
├── main.py                # FastAPI routes (thin)
├── services/              # Business logic, ML inference
├── agents/                # Multi-agent Q-learning
└── models/                # Model weights, reference data
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | `kebab-case` | `bio-age-card.tsx`, `use-protocol.ts` |
| Components | `PascalCase` | `BioAgeCard`, `WorkoutCard` |
| Hooks | `use` + `PascalCase` | `useHomeData`, `useProtocol` |
| Functions | `camelCase` | `calculateBioAge`, `formatMealTime` |
| Types/Interfaces | `PascalCase` | `DailyProtocol`, `BioAgeSnapshot` |
| Constants | `SCREAMING_SNAKE` | `NUTRITION_GOALS`, `DEFAULT_TREND_DAYS` |
| CSS Variables | `--kebab-case` | `--color-primary-600`, `--radius-xl` |
| Database Columns | `camelCase` | `morningRecovery`, `biologicalAge` |

## Imports

```ts
// ✅ Path aliases
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { useHomeData } from "@/hooks/useHomeData";
import type { DailyTotals } from "@/lib/types";

// ✅ Relative for co-located
import { WorkoutCard } from "./workout-card";
```

## Error Handling

```ts
// Client hooks: return error state
const { loading, error, data } = useHomeData();

// Server: throw typed errors
if (!user) throw new UnauthorizedError("User not found");

// API: consistent shape
return Response.json({ error: "Invalid input" }, { status: 400 });
```

## Testing & Verification

- `npm run build` must pass
- `npm run lint` must pass (ESLint + TypeScript)
- Type-check: `npx tsc --noEmit`
- Manual verification checklist per feature spec