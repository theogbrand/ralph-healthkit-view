# Implementation Plan: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-67
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-67-ralph-healthkit-view-apple-style.md
**Specification**: dawn-docs/active/specifications/2026-02-16-TEST-AGI-67-ralph-healthkit-view-apple-style.md
**Status**: Ready for Implementation

## Overview

Transform the Ralph HealthKit dashboard from its current shadcn/ui appearance into a premium Apple Health-inspired experience. This is a pure visual/UI redesign — no data model, API, or business logic changes. All changes target CSS variables, Tailwind classes, font configuration, chart styling, and formatter utilities.

The specification defines: Apple system colors (`#F2F2F7` background, borderless white cards with soft shadows), system font stack (`-apple-system`), 16px card radius, segmented control for date selection, refined score ring, gradient-filled area charts, pill-shaped delta badges, skeleton loading states, and smooth micro-interactions.

### Codebase Context (Verified)

- **Framework**: Next.js 16.1.6, React 19.2.3, Tailwind CSS v4
- **Tailwind v4**: Uses inline `@theme` block in `globals.css` (no `tailwind.config.js`). The `@theme inline` block maps CSS custom properties to Tailwind utility classes. All `:root` variables use OKLCH color space.
- **Fonts**: Currently uses Geist Sans / Geist Mono loaded via `next/font/google` in `layout.tsx`, with CSS variables `--font-geist-sans` / `--font-geist-mono`. The `@theme inline` block maps `--font-sans: var(--font-geist-sans)`.
- **Charts**: Recharts 3.7.0 — RadialBarChart, BarChart, AreaChart, LineChart
- **Components**: shadcn/ui with Radix UI primitives, CVA variants, `cn()` utility
- **Duplicate code**: `getScoreHex()` is duplicated in `FitnessScore.tsx:12-16` and `ProgressChart.tsx:10-14`
- **Card defaults**: `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm`
- **Radius system**: `--radius: 0.625rem` (10px base). `rounded-xl` = `calc(var(--radius) + 4px)` = 14px. `rounded-2xl` = `calc(var(--radius) + 8px)` = 18px.

## Success Criteria

- [ ] Page background is `#F2F2F7` (Apple systemGroupedBackground)
- [ ] Cards are borderless with soft elevation shadows and 16px radius
- [ ] Font stack is `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif`
- [ ] Date selector is an Apple-style segmented control with sliding white pill indicator
- [ ] Score ring uses Apple color palette (red `#FF3B30`, orange `#FF9F0A`, green `#30D158`)
- [ ] Trend/comparison colors use Apple semantic colors (`#34C759`, `#FF3B30`, `#8E8E93`)
- [ ] Category cards have hover lift animation (translateY -2px, shadow deepens)
- [ ] Charts use gradient fills, rounded curves, and Apple-style grid/axis styling
- [ ] Comparison cards have pill-shaped delta badges with tinted backgrounds
- [ ] Loading state uses skeleton shimmer placeholders
- [ ] Typography follows spec: 34px bold title, 22px semibold headings, 17px body, 13px captions
- [ ] Numeric values use `font-variant-numeric: tabular-nums`
- [ ] Footer sync card is removed; sync info moved to header caption
- [ ] Footer Import Data button is removed (header CTA is sufficient)
- [ ] Duplicate `getScoreHex()` consolidated into `formatters.ts`
- [ ] Type check passes: `npm run typecheck`
- [ ] Lint passes: `npm run lint`
- [ ] Existing tests pass: `npm test`
- [ ] Dev server runs successfully: `npm run dev`
- [ ] Visual inspection via live preview confirms Apple-like appearance

## Phases

### Phase 1: Foundation — Theme, Colors, Typography, and Card Base

**Goal**: Establish the Apple design system foundation by updating CSS variables, font configuration, base card component, and color utilities. After this phase, the page background, font, and card surfaces will look Apple-like even before individual components are refined.

**Changes**:

1. **`src/app/globals.css`** — Major overhaul of theme tokens:

   **`@theme inline` block updates** (lines 6-47):
   - Change `--font-sans: var(--font-geist-sans)` → remove (will use CSS font-family directly on body)
   - Remove `--font-mono: var(--font-geist-mono)` (not needed for Apple style)

   **`:root` variable updates** (lines 49-82) — Switch from OKLCH to hex for Apple-precise colors:
   ```css
   :root {
     --radius: 1rem;                    /* was 0.625rem → 16px base */
     --background: #F2F2F7;             /* Apple systemGroupedBackground */
     --foreground: #000000;             /* Apple primary text */
     --card: #FFFFFF;                   /* White card surfaces */
     --card-foreground: #000000;        /* Black card text */
     --popover: #FFFFFF;
     --popover-foreground: #000000;
     --primary: #007AFF;               /* Apple systemBlue */
     --primary-foreground: #FFFFFF;
     --secondary: rgba(118, 118, 128, 0.12); /* Apple tertiarySystemFill */
     --secondary-foreground: #000000;
     --muted: #F2F2F7;                 /* Match background */
     --muted-foreground: #8E8E93;      /* Apple systemGray */
     --accent: rgba(118, 118, 128, 0.12);
     --accent-foreground: #000000;
     --destructive: #FF3B30;           /* Apple systemRed */
     --border: transparent;            /* Borderless cards */
     --input: #E5E5EA;                 /* Apple systemGray5 */
     --ring: #007AFF;                  /* Apple systemBlue */
   }
   ```

   **Add Apple utility classes** after the `@layer base` block:
   ```css
   /* Apple-style utilities */
   .tabular-nums {
     font-variant-numeric: tabular-nums;
   }

   @keyframes shimmer {
     0% { background-position: -200% 0; }
     100% { background-position: 200% 0; }
   }

   .skeleton {
     background: linear-gradient(90deg, #F2F2F7 25%, #E5E5EA 50%, #F2F2F7 75%);
     background-size: 200% 100%;
     animation: shimmer 1.5s ease-in-out infinite;
     border-radius: 8px;
   }

   @keyframes ring-fill {
     from { opacity: 0; transform: scale(0.95); }
     to { opacity: 1; transform: scale(1); }
   }

   .animate-ring-fill {
     animation: ring-fill 800ms cubic-bezier(0.25, 0.1, 0.25, 1) both;
   }
   ```

   **Keep `.dark` block** (lines 84-116) unchanged — dark mode is out of scope per spec.

2. **`src/app/layout.tsx`** (lines 1-35):
   - Remove `import { Geist, Geist_Mono } from "next/font/google"` (line 2)
   - Remove `const geistSans = Geist({...})` (lines 5-8)
   - Remove `const geistMono = Geist_Mono({...})` (lines 10-13)
   - Change body className from `${geistSans.variable} ${geistMono.variable} antialiased` to just `antialiased`
   - Add inline style on body: `style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif" }}`

3. **`src/components/ui/card.tsx`** (line 100 in Card function):
   - Current Card classes: `"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"`
   - New Card classes: `"bg-card text-card-foreground flex flex-col gap-5 rounded-2xl py-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200"`
   - Changes: remove `border`, change `rounded-xl` → `rounded-2xl`, change `py-6` → `py-5`, change `gap-6` → `gap-5`, replace `shadow-sm` with Apple shadow, add `transition-all duration-200`
   - Update `CardContent` (currently `px-6`): change to `px-5`
   - Update `CardFooter` (currently `px-6`): change to `px-5`

4. **`src/lib/utils/formatters.ts`** — Update color utilities and consolidate duplicates:
   - Update `getScoreColor()` (lines 49-53):
     ```typescript
     export function getScoreColor(score: number): string {
       if (score < 50) return 'text-[#FF3B30]';
       if (score < 70) return 'text-[#FF9F0A]';
       return 'text-[#30D158]';
     }
     ```
   - Update `getScoreBgColor()` (lines 55-59):
     ```typescript
     export function getScoreBgColor(score: number): string {
       if (score < 50) return 'bg-red-50';
       if (score < 70) return 'bg-orange-50';
       return 'bg-green-50';
     }
     ```
   - Update `getTrendColor()` (lines 67-75):
     ```typescript
     export function getTrendColor(trend: string): string {
       switch (trend) {
         case 'improving': return 'text-[#34C759]';
         case 'stable': return 'text-[#8E8E93]';
         case 'declining': return 'text-[#FF3B30]';
         default: return 'text-[#8E8E93]';
       }
     }
     ```
   - **Add new `getScoreHex()` function** (consolidation from FitnessScore.tsx + ProgressChart.tsx):
     ```typescript
     export function getScoreHex(score: number): string {
       if (score < 50) return '#FF3B30';
       if (score < 70) return '#FF9F0A';
       return '#30D158';
     }
     ```
   - **Add new `getTrendHex()` function** for chart/badge use:
     ```typescript
     export function getTrendHex(trend: string): string {
       switch (trend) {
         case 'improving': return '#34C759';
         case 'declining': return '#FF3B30';
         default: return '#8E8E93';
       }
     }
     ```

**Verification**:
```bash
npm run typecheck
npm run lint
npm test
npm run dev &
# Visual: page background should be light gray #F2F2F7, cards white/borderless with soft shadows, system font applied
```

---

### Phase 2: Header, Segmented Control, and Page Layout

**Goal**: Transform the header to Apple-style typography and convert the Tabs date selector into an Apple segmented control with sliding indicator. Restructure page layout with spec-compliant spacing and max-width. Update loading/error/empty states.

**Changes**:

1. **`src/app/page.tsx`** (205 lines — major restyle):

   **Layout container** (line 87):
   - Change `<div className="min-h-screen bg-background">` — keep as-is (background now comes from CSS variables)
   - Change `<main className="container mx-auto px-6 py-8">` → `<main className="mx-auto max-w-[860px] px-6 py-8 md:px-8">`

   **Header** (lines 88-125):
   - Remove `border-b` from `<header>` (line 88): change `<header className="border-b">` → `<header>`
   - Update container: `<div className="mx-auto flex max-w-[860px] items-center justify-between px-6 py-5 md:px-8">`
   - Title: change `text-2xl font-bold` → `text-[34px] font-bold tracking-[-0.4px] leading-tight`
   - Preview badge (lines 93-97): change amber colors to Apple blue: `border-[#007AFF]/20 bg-[#007AFF]/10 text-[#007AFF]`
   - Add sync status as caption under title (a new `<p>` tag below `<h1>`): `text-[13px] text-[#8E8E93]` showing "Last sync: {timeAgo}" or "Preview dataset"
   - Remove the sync/preview text from the `<nav>` section (lines 110-119)

   **Footer removal** (lines 185-199):
   - Remove the entire `{/* Sync Status Footer */}` section (the `<section className="mt-8">` block)
   - Keep just `<Overview data={data} dateRange={range} />` without the wrapping `<>...</>`

   **Date range selector** (lines 128-139) — Replace Tabs with segmented control:
   - Remove `import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'` (line 8)
   - Update `RANGES` labels (line 19-24): `'30 Days'` → `'30D'`, `'60 Days'` → `'60D'`, `'90 Days'` → `'90D'`, `'1 Year'` → `'1Y'`
   - Replace `<Tabs>` block with custom segmented control:
     ```tsx
     <div className="mb-8">
       <div className="relative inline-flex h-[36px] items-center rounded-[10px] bg-[rgba(118,118,128,0.12)] p-[2px]">
         {/* Sliding white pill indicator */}
         <div
           className="absolute top-[2px] bottom-[2px] rounded-[8px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
           style={{
             width: `${100 / RANGES.length}%`,
             transform: `translateX(${RANGES.findIndex(r => r.value === range) * 100}%)`,
           }}
         />
         {RANGES.map((r) => (
           <button
             key={r.value}
             onClick={() => setRange(r.value)}
             className={`relative z-10 min-w-[56px] px-4 py-1 text-[13px] font-medium transition-colors duration-200 ${
               range === r.value ? 'text-black' : 'text-[#8E8E93]'
             }`}
           >
             {r.label}
           </button>
         ))}
       </div>
     </div>
     ```

   **Loading state** (lines 142-150) — Replace with skeleton shimmer:
   ```tsx
   {loading && (
     <div className="space-y-8">
       {/* Score ring skeleton */}
       <div className="flex justify-center">
         <div className="skeleton h-[200px] w-[200px] rounded-full" />
       </div>
       {/* Category cards skeleton */}
       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
         <div className="skeleton h-[120px] rounded-2xl" />
         <div className="skeleton h-[120px] rounded-2xl" />
       </div>
     </div>
   )}
   ```

   **Error state** (lines 153-164) — Update to spec copy with red accent:
   ```tsx
   {!loading && error && (
     <Card className="border-l-4 border-l-[#FF3B30]">
       <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
         <p className="text-[17px] text-[#000000]">Couldn't load your data. Let's try again.</p>
         <Button
           variant="outline"
           onClick={() => fetchData(range)}
           className="rounded-full px-6"
         >
           Retry
         </Button>
       </CardContent>
     </Card>
   )}
   ```

   **Empty state** (lines 167-178) — Update to spec copy:
   ```tsx
   {!loading && !error && !hasData && (
     <Card>
       <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
         <h2 className="text-[22px] font-semibold tracking-[-0.3px]">Ready to get started?</h2>
         <p className="text-[17px] text-[#8E8E93]">
           Import your Apple Health data to see your fitness dashboard.
         </p>
         <Link href="/import">
           <Button className="mt-2 rounded-full px-6">Import Health Data</Button>
         </Link>
       </CardContent>
     </Card>
   )}
   ```

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev &
# Visual: header is borderless with large bold title, blue preview badge, segmented control slides,
# skeleton loading state, spec-compliant error/empty states, no footer card
```

---

### Phase 3: Score Ring, Category Cards, and Category Detail

**Goal**: Redesign the FitnessScore ring component to Apple style, restyle MetricCard for category summaries, refine CategoryDetail with Apple-style comparison badges, and thread category colors through the component tree.

**Changes**:

1. **`src/components/charts/FitnessScore.tsx`** (70 lines):
   - **Remove local `getScoreHex()`** (lines 12-16) — import from formatters instead:
     ```typescript
     import { getScoreHex, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';
     ```
   - Background track: change `fill: '#e5e7eb'` (line 56) → `fill: 'rgba(0, 0, 0, 0.05)'`
   - Bar size: change `barSize={size === 'lg' ? 14 : 10}` (line 54) → `barSize={size === 'lg' ? 16 : 10}`
   - Corner radius: change `cornerRadius={8}` (line 55) → `cornerRadius={10}`
   - Center score text: change `text-4xl font-bold` (lg) → `text-[34px] font-bold tracking-[-0.3px] tabular-nums` and `text-2xl` (sm) → `text-[22px] font-bold tracking-[-0.3px] tabular-nums`
   - Wrapper div: add `className="animate-ring-fill"` to the outer container `<div className="relative" ...>`
   - Handle null score: display `"--"` in same font weight/size instead of `Math.round(score)` when score is 0 or not meaningful
   - Trend text section: uses `getTrendIcon`/`getTrendColor` — already correct since we updated those in Phase 1

2. **`src/components/charts/MetricCard.tsx`** (51 lines):
   - Add hover lift to the outer Card: pass `className="cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"`
   - Title: change `text-sm font-medium` → `text-[17px] font-semibold tracking-[-0.2px]`
   - Value: change `text-2xl font-bold` → `text-[28px] font-bold tracking-[-0.3px] tabular-nums`
   - Trend text: change to `text-[13px] font-medium` with `getTrendColor()` (already used)
   - Sparkline stroke: change `stroke="#6b7280"` → accept a `color` prop and use it at 50% opacity, or default to `#8E8E93`
   - Add `color` prop to `MetricCardProps` interface
   - Null value: display `"--"` in same size/weight keeping layout stable

3. **`src/components/dashboard/Overview.tsx`** (111 lines):
   - Section headings: add `"Fitness Score"` heading above the FitnessScore component with `text-[22px] font-semibold tracking-[-0.3px]`
   - Category cards grid: change `gap-6` → `gap-4` (16px per spec)
   - Add `"Categories"` section heading above the ProgressChart
   - Add `"Score Trend"` section heading above the TrendChart
   - Overall vertical spacing: already `space-y-8` (32px) — keep as-is
   - Pass `color` prop to MetricCard from `CATEGORY_CONFIG`:
     ```typescript
     const CATEGORY_CONFIG = [
       { key: 'running' as const, label: 'Running', Component: RunningMetrics, color: '#30D158' },
       { key: 'gym' as const, label: 'Gym', Component: GymMetrics, color: '#007AFF' },
     ];
     ```
   - Pass `color` to each category's `Component` (RunningMetrics/GymMetrics) which forwards to CategoryDetail

4. **`src/components/dashboard/RunningMetrics.tsx`** (15 lines):
   - Add `color` prop to interface (or accept and forward `...rest` props)
   - Pass `color="#30D158"` to `<CategoryDetail>` (or forward the prop from parent)

5. **`src/components/dashboard/GymMetrics.tsx`** (14 lines):
   - Same as RunningMetrics: add `color` prop, pass `color="#007AFF"` to `<CategoryDetail>`

6. **`src/components/dashboard/CategoryDetail.tsx`** (90 lines):
   - Add `color` prop to `CategoryDetailProps` interface
   - Section heading "This Week vs Last Week": `text-[22px] font-semibold tracking-[-0.3px]`
   - Metric card titles: `text-[17px] font-semibold tracking-[-0.2px]`
   - Metric values: `text-[28px] font-bold tracking-[-0.3px] tabular-nums`
   - Change percent badge: `text-[13px] text-[#8E8E93]`
   - TrendChart `color` prop: pass the `color` prop from parent instead of hardcoded color (currently using the chart theme color)
   - Empty state: change text to `"Not enough data yet"` per spec, styled `text-[13px] text-[#8E8E93]`

7. **`src/components/charts/ComparisonCard.tsx`** (47 lines):
   - "This Week" value: change `text-2xl font-bold` → `text-[22px] font-semibold tabular-nums`
   - "Last Week" value: `text-[13px] text-[#8E8E93]`
   - Label: `text-[13px] text-[#8E8E93]` (was `text-sm font-medium text-muted-foreground`)
   - Delta badge — replace current plain text with pill badge:
     - Determine delta direction from `higherIsBetter` and delta sign
     - Improving: `rounded-xl px-2 py-0.5 bg-[#34C759]/[0.12] text-[#34C759] text-[12px] font-medium`
     - Declining: `rounded-xl px-2 py-0.5 bg-[#FF3B30]/[0.12] text-[#FF3B30] text-[12px] font-medium`
     - Stable/zero: `rounded-xl px-2 py-0.5 bg-[#8E8E93]/[0.12] text-[#8E8E93] text-[12px] font-medium`
     - Include arrow: `↑ 12%`, `↓ 5%`, `→ 0%`

**Verification**:
```bash
npm run typecheck
npm run lint
npm test
npm run dev &
# Visual: score ring has Apple colors with fill animation, category cards lift on hover,
# comparison deltas are pill badges, category-specific colors thread through charts
```

---

### Phase 4: Charts, Progress Bars, and Final Polish

**Goal**: Restyle all Recharts components to match Apple chart aesthetics (gradient fills, rounded bars, dashed grids, subtle axes), add expand/collapse animation for category details, and do a final consistency pass.

**Changes**:

1. **`src/components/charts/TrendChart.tsx`** (84 lines):
   - **SVG gradient definition**: Add a `<defs>` inside the chart with a `<linearGradient>` for the area fill. Use a unique ID derived from chart key/index to avoid conflicts:
     ```tsx
     <defs>
       <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stopColor={color} stopOpacity={0.3} />
         <stop offset="100%" stopColor={color} stopOpacity={0} />
       </linearGradient>
     </defs>
     ```
   - Area fill: use `fill={`url(#gradient-${color})`}` instead of flat color
   - Stroke: 2px width (already set)
   - Curve type: `monotoneX` (already set)
   - CartesianGrid: change `strokeDasharray="3 3"` → `strokeDasharray="4 4"`, set `stroke="rgba(0,0,0,0.06)"`
   - XAxis: add `tick={{ fontSize: 12, fill: '#8E8E93' }}`, `axisLine={false}`, `tickLine={false}`
   - YAxis: add `tick={{ fontSize: 12, fill: '#8E8E93' }}`, `axisLine={false}`, `tickLine={false}`
   - Tooltip: update to Apple card style:
     ```tsx
     <Tooltip
       contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '8px 12px' }}
       labelStyle={{ fontSize: 13, color: '#8E8E93', marginBottom: 4 }}
       itemStyle={{ fontSize: 13 }}
     />
     ```
   - Empty state: update text to `"Not enough data yet"` styled as `text-[13px] text-[#8E8E93]`

2. **`src/components/charts/ProgressChart.tsx`** (51 lines):
   - **Remove local `getScoreHex()`** (lines 10-14) — import from formatters:
     ```typescript
     import { getScoreHex } from '@/lib/utils/formatters';
     ```
   - Bar height: change `barSize={24}` → `barSize={28}`
   - Corner radius: change `radius={[0, 6, 6, 0]}` → `radius={[8, 8, 8, 8]}` (rounded both ends)
   - Add background track: use Recharts `background` prop on `<Bar>`: `background={{ fill: 'rgba(0,0,0,0.04)', radius: 8 }}`
   - XAxis: add `tick={{ fontSize: 13, fill: '#8E8E93' }}`, `axisLine={false}`, `tickLine={false}`
   - YAxis: add `tick={{ fontSize: 13, fill: '#8E8E93' }}`, `axisLine={false}`, `tickLine={false}`
   - Tooltip: same Apple card style as TrendChart

3. **`src/components/dashboard/Overview.tsx`** — Expand/collapse animation:
   - Wrap the expanded category detail section in an animated container using CSS grid-rows trick:
     ```tsx
     <div className={`grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
       expanded === cat.key ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
     }`}>
       <div className="overflow-hidden">
         <cat.Component ... />
       </div>
     </div>
     ```
   - This provides smooth height animation without JavaScript

4. **Final polish across all files**:
   - Ensure all numeric displays use `tabular-nums` class
   - Verify no leftover Tailwind color utilities (e.g., `text-red-500`, `text-green-500`, `text-yellow-500`) — all should use Apple hex colors
   - Verify card padding is consistently `20px` (via `px-5 py-5` on Card or inner components)
   - Verify section spacing is `32px` throughout (via `space-y-8`)
   - Verify all interactive elements have min 44px tap targets for accessibility

**Verification**:
```bash
npm run typecheck
npm run lint
npm test
npm run dev &
# Visual: charts have gradient fills, bars are rounded, grids are subtle dashed lines,
# category expand/collapse animates smoothly, all colors are Apple palette
# Full visual review against specification document
```

## File Change Summary

| File | Phase | Change Type | Scope |
|------|-------|-------------|-------|
| `src/app/globals.css` | 1 | Major overhaul | Apple color palette, radius, shadows, animation keyframes, skeleton utility |
| `src/app/layout.tsx` | 1 | Moderate | Remove Geist fonts, apply Apple system font stack |
| `src/components/ui/card.tsx` | 1 | Moderate | Remove border, update shadow/radius/padding/gap, add transition |
| `src/lib/utils/formatters.ts` | 1 | Moderate | Apple colors for scores/trends, add `getScoreHex()` + `getTrendHex()` |
| `src/app/page.tsx` | 2 | Major | Header restyle, segmented control, skeleton loading, spec copy for states, remove footer |
| `src/components/charts/FitnessScore.tsx` | 3 | Moderate | Apple colors, ring sizing, mount animation, import shared `getScoreHex` |
| `src/components/charts/MetricCard.tsx` | 3 | Moderate | Apple typography, hover lift, color prop for sparkline |
| `src/components/dashboard/Overview.tsx` | 3+4 | Moderate | Section headings, spacing, category colors, expand/collapse animation |
| `src/components/dashboard/CategoryDetail.tsx` | 3 | Moderate | Typography, category color prop, spec copy |
| `src/components/dashboard/RunningMetrics.tsx` | 3 | Minor | Forward color prop (`#30D158`) |
| `src/components/dashboard/GymMetrics.tsx` | 3 | Minor | Forward color prop (`#007AFF`) |
| `src/components/charts/ComparisonCard.tsx` | 3 | Moderate | Pill delta badges, Apple colors, typography |
| `src/components/charts/TrendChart.tsx` | 4 | Moderate | SVG gradient fill, Apple axis/grid/tooltip styling |
| `src/components/charts/ProgressChart.tsx` | 4 | Moderate | Apple colors, rounded bars, background track, import shared `getScoreHex` |

**Total files**: 14
**Estimated lines of change**: ~500–650

## Testing Strategy

This is a purely visual redesign. There are no unit-testable behavior changes.

1. **Type checking**: `npm run typecheck` — ensures no TypeScript errors from class/prop changes
2. **Linting**: `npm run lint` — ensures code quality
3. **Existing tests**: `npm test` — run to confirm no regressions in utility functions (especially `formatters.ts` changes)
4. **Visual verification**: Run `npm run dev` and inspect in browser:
   - Preview mode provides mock data for all states
   - Switch date ranges to verify segmented control animation
   - Click category cards to verify expand/collapse animation
   - Verify hover states on interactive cards
   - Check responsive layout (narrow viewport for mobile column stacking)
   - Verify loading skeleton, error state, and empty state appearance

## Rollback Plan

All changes are in UI layer only (CSS, className attributes, component templates). To rollback:

```bash
git revert <commit-hash>
```

No data migrations, API changes, or configuration changes are involved, so rollback is clean and instant.

## Notes

- **Live Preview requirement**: The dev server (`npm run dev`) must be running throughout implementation. Preview mode with mock data enables visual monitoring of every change.
- **Dark mode is out of scope**: The `.dark` CSS block in `globals.css` is not updated. It remains functional but won't match the Apple aesthetic. This is a follow-up ticket per spec.
- **Import page (`/import`) is out of scope**: Only the dashboard route (`/`) is redesigned per spec.
- **No third-party font loading**: Using system font stack only. On Apple devices this renders as SF Pro; on others it falls back to the system sans-serif.
- **Tailwind v4 `@theme inline`**: When removing font variables from the `@theme inline` block, ensure no Tailwind utility classes depend on them (only `font-sans` and `font-mono` reference them — body now uses inline style instead).
- **OKLCH → Hex migration**: The `:root` variables switch from OKLCH to hex for Apple-precise color matching. This is safe because the `@theme inline` block maps these via `var()` references.
- **Recharts gradient fills**: Recharts supports SVG `<defs>` for gradient definitions. Each TrendChart instance should use a unique gradient ID (e.g., based on the color hex) to avoid conflicts when multiple charts render on the same page.
- **Segmented control**: Built as a custom inline component in `page.tsx` rather than modifying the generic `tabs.tsx`, since the segmented control is a design-specific one-off for this page.
- **Category colors**: Running = `#30D158` (Apple green), Gym = `#007AFF` (Apple blue). These are threaded through Overview → RunningMetrics/GymMetrics → CategoryDetail → TrendChart.
- **Duplicate code consolidation**: `getScoreHex()` currently exists in both `FitnessScore.tsx` and `ProgressChart.tsx`. Phase 1 adds it to `formatters.ts`; Phases 3 and 4 remove the local copies and import from the shared utility.
