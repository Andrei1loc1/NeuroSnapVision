# UI Context: NeuroSnap Vision

## Theme

**Mode**: Light-only (current) with dark mode support in CSS variables
**Primary Brand**: Emerald/Green spectrum (`#16a34a` / `#22c55e` / `#10b981`)
**Background**: Subtle gradient `--gradient-start: #F7FBF9` → `--gradient-via: #EAF7F1` → `--gradient-end: #DFF3EA`

### Color Tokens (CSS Custom Properties → Tailwind)

```css
/* Primary - Emerald */
--color-primary-400: #4ade80;  /* tailwind: primary-400 */
--color-primary-500: #22c55e;  /* tailwind: primary-500 */
--color-primary-600: #16a34a;  /* tailwind: primary-600 */

/* Accent - Lighter Emerald */
--color-accent-300: #6ee7b7;
--color-accent-400: #34d399;
--color-accent-500: #10b981;

/* Neutral / Gray */
--color-gray-400: #9ca3af;

/* Gradients */
--gradient-start: #F7FBF9;
--gradient-via: #EAF7F1;
--gradient-end: #DFF3EA;
```

### Shadcn/UI Theme Mapping (oklch)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}
```

**Rule**: All colors in components MUST use CSS custom properties or Tailwind tokens mapped to them. No raw hex values or `zinc-*`, `slate-*`, `emerald-*` classes in components.

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Heading (H1) | Geist Sans | `text-4xl` / `text-3xl` | `font-bold` |
| Heading (H2) | Geist Sans | `text-2xl` | `font-bold` |
| Heading (H3) | Geist Sans | `text-xl` | `font-semibold` |
| Body Large | Geist Sans | `text-base` / `text-lg` | `font-normal` |
| Body | Geist Sans | `text-sm` | `font-normal` |
| Caption/Label | Geist Sans | `text-xs` / `text-sm` | `font-medium` / `font-semibold` |
| Numbers/Metrics | Geist Mono | `text-[36px]` / `text-2xl` | `font-semibold` / `font-bold` |
| Mono/Code | Geist Mono | `text-sm` | `font-normal` |

**Fonts**: `Geist Sans` (variable) + `Geist Mono` (variable) — loaded via `next/font`

## Border Radius Scale

Based on surface depth — deeper surfaces = rounder corners:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` / `rounded-sm` | `0.5rem` (8px) | Chips, badges, small inputs |
| `--radius-md` / `rounded-md` | `1rem` (16px) | Buttons, standard cards |
| `--radius-lg` / `rounded-lg` | `1.5rem` (24px) | Section cards, modals |
| `--radius-xl` / `rounded-xl` | `2rem` (32px) | Major cards, floating panels |
| `--radius-2xl` / `rounded-2xl` | `2.2rem` (35px) | Hero cards, onboarding containers |
| `--radius-full` / `rounded-full` | `9999px` | Pills, avatars, progress rings |

**Custom radius scale in Tailwind config** (via `@theme inline`):
- `radius-3xl`: 2.6x base
- `radius-4xl`: 3.2x base

## Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.08)` | Subtle elevation |
| `--shadow-md` | `0 8px 32px rgba(0,0,0,0.12)` | Standard cards |
| `--shadow-lg` | `0 18px 45px rgba(34,197,94,0.35)` | Primary actions, floating |
| `--shadow-xl` | `0 22px 70px rgba(0,0,0,0.3)` | Modals, drawers |
| `--shadow-2xl` | `0 30px 90px rgba(0,0,0,0.35)` | Full-screen overlays |
| `--shadow-glow` | `0 0 20px rgba(34,197,94,0.5)` | Primary focus/active |
| `--shadow-glow-emerald` | `0 0 16px rgba(34,197,94,0.9)` | Scan button, CTAs |
| `--shadow-inner` | `inset 0 0 0 3px rgba(255,255,255,0.9)` | Glassmorphism borders |

## Glassmorphism / Backdrop Blur Pattern

**Standard card treatment** (used across Home, Journal, Reports):
```css
rounded-[28px] border border-white bg-white/20 p-5 
shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl
```

**Heavy glass** (onboarding, modals):
```css
rounded-[32px] border border-white/60 bg-white/30 backdrop-blur-2xl p-6
shadow-[0_32px_80px_rgba(20,83,45,0.12)]
```

**Input fields**:
```css
rounded-2xl border border-white/40 bg-white/40 px-4 py-3.5
backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50
```

## Component Library

**Base**: shadcn/ui (installed via `shadcn/tailwind.css`)

### Existing Components (in `components/ui/`)
- `Button` — 4 variants (primary, secondary, outline, ghost), 3 sizes
- `Card` / `CardHeader` / `CardContent` / `CardFooter` — Base glass card
- `Badge` — Status indicators
- `Toast` — Notifications
- `Progress` — Radial/linear progress

### Project-Specific Components (in `components/*`)

| Component | Location | Pattern |
|-----------|----------|---------|
| `HomeHeader` | `components/home/` | Gradient title + subtitle |
| `CaloriesCard` | `components/home/` | Ring progress + kcal number |
| `MacroSummary` | `components/home/` | 3 horizontal macro bars |
| `NutritionScoreCard` | `components/home/` | Score + trend sparkline |
| `BrainHealthCard` | `components/home/` | Purple area chart + score |
| `RecentMealCard` | `components/home/` | Meal preview with image |
| `JournalHeader` | `components/journal/` | Date navigator + summary |
| `DailySummaryCard` | `components/journal/` | Macro rings + meal count |
| `MealTimeline` | `components/journal/` | Vertical timeline cards |
| `CameraScanner` | `components/camera/` | Full-screen camera + prediction |
| `PredictionPanel` | `components/camera/` | Top 3 predictions + portion |
| `PortionSelectorModal` | `components/camera/` | Portion size picker |
| `ReportsHeader` | `components/reports/` | Date range + navigation |
| `WeeklyCaloriesCard` | `components/reports/` | Bar chart + totals |
| `MacroBalanceCard` | `components/reports/` | Donut chart |
| `AIRecommendationsCard` | `components/reports/` | Agent recommendation list |
| `WeeklyReportDownloadCard` | `components/reports/` | PDF export trigger |
| `ProfileHeader` | `components/profile/` | Avatar + name + streak |
| `ProfileStatsCard` | `components/profile/` | Lifetime stats grid |
| `GoalSettingsCard` | `components/profile/` | Macro targets editor |
| `ProfileMenu` | `components/profile/` | Settings/actions list |
| `OnboardingForm` | `components/onboarding/` | Multi-step animated form |

### New Components Needed (V1)

| Component | Location | Description |
|-----------|----------|-------------|
| `BioAgeCard` | `components/home/` | Hero: bio-age, pace, sparkline, CTA |
| `DailyLeverageCard` | `components/home/` | Single leverage action with impact |
| `ProtocolQuickCheck` | `components/home/` | Inline 4-tap check-in |
| `WorkoutCard` | `components/workout/` | Type + RPE slider + duration presets |
| `DimensionScoreBar` | `components/bio-age/` | Horizontal 0-100 bar with tooltip |
| `OrganAgeCard` | `components/bio-age/` | Organ-specific age card |
| `NeuroGraph` | `components/bio-age/` | D3/React Flow graph: 6 nodes + edges |
| `ProtocolPage` | `components/protocol/` | Morning/Evening tabs, streak, smart defaults |

## Layout Patterns

### Page Container (Standard)
```tsx
<div className="space-y-4 pb-14">
  {/* Header / Hero */}
  {/* Content cards */}
</div>
```

### Full-Screen Modal (Camera, Onboarding)
```tsx
<div className="fixed inset-0 z-50 h-dvh w-full overflow-hidden bg-black text-white">
  {/* Content */}
</div>
```

### Floating Bottom Nav
```tsx
<div className="fixed bottom-4 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4">
  <div className="relative flex w-full items-center justify-between border border-white bg-white/60 px-5 py-3 backdrop-blur-xl rounded-[var(--radius-xl)] shadow-[var(--shadow-md)]">
    {/* Nav items + center FAB */}
  </div>
</div>
```

### Glass Section Card
```tsx
<section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
  {/* Content */}
</section>
```

### Onboarding/Modal Container
```tsx
<div className="rounded-[32px] border border-white/60 bg-white/30 backdrop-blur-2xl p-6 shadow-[0_32px_80px_rgba(20,83,45,0.12)]">
  {/* Form content */}
</div>
```

## Icons

**Library**: `lucide-react`
**Sizing Convention**:
- Nav icons: `size={20}`
- Inline/icon buttons: `size={16}` / `size={18}`
- Feature icons: `size={24}` / `size={28}`
- Hero/large: `size={32}` / `size={44}`

**Color**: Always via CSS variable — `style={{ color: 'var(--color-primary-600)' }}` or `className="text-primary-600"`

## Animations

| Animation | Keyframes | Usage |
|-----------|-----------|-------|
| `emerald-pulse` | 2s ease-in-out infinite | Loading spinners, active states |
| `blob-float` | 8s ease-in-out infinite | Background decorative blobs |
| `field-enter` | 0.5s ease-out forwards | Staggered form field entrance |
| `scale-105` hover | 200ms | Buttons, nav items, cards |

**Stagger Delay Pattern** (onboarding):
```tsx
const fieldDelay = (index: number) => `${100 + index * 100}ms`;
style={{ animationDelay: fieldDelay(index) }}
```

## Responsive Breakpoints

| Breakpoint | Target | Usage |
|------------|--------|-------|
| `< 430px` | Mobile (primary) | All pages designed for 390-430px width |
| `max-w-[430px]` | Container max | All content centered in mobile frame |
| `> 768px` | Tablet/Desktop | Not actively supported V1 (PWA frame) |

## Visual Language Principles

1. **Depth through glassmorphism** — Layered transparency, backdrop blur, subtle borders
2. **Emerald as action color** — Only primary actions use emerald; everything else neutral
3. **Generous radius** — 28px+ on cards creates organic, approachable feel
4. **Staggered entrance** — Sequential animations guide attention
5. **Metric-forward** — Large numbers (36px+) for key metrics; labels secondary
6. **Sparkline trends** — Mini charts (Recharts) for 7-90 day trends inline
7. **Single-column mobile** — All layouts stack vertically; no horizontal scrolling