# Implementation Plan: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-67
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-67-ralph-healthkit-view-apple-style.md
**Specification**: dawn-docs/active/specifications/2026-02-16-TEST-AGI-67-ralph-healthkit-view-apple-style.md
**Status**: Ready for Implementation

## Overview

Transform the Ralph HealthKit dashboard from its current shadcn/ui appearance into a premium Apple Health-inspired experience. This is a pure visual/UI redesign — no data model, API, or business logic changes. All changes target CSS variables, Tailwind classes, font configuration, chart styling, and formatter utilities.

The specification defines: Apple system colors (`#F2F2F7` background, borderless white cards with soft shadows), system font stack (`-apple-system`), 16px card radius, segmented control for date selection, refined score ring, gradient-filled area charts, pill-shaped delta badges, skeleton loading states, and smooth micro-interactions.

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
- [ ] All text passes: `npm run typecheck`
- [ ] Lint passes: `npm run lint`
- [ ] Dev server runs successfully: `npm run dev`
- [ ] Visual inspection via live preview confirms Apple-like appearance

## Phases

### Phase 1: Foundation — Theme, Colors, Typography, and Card Base

**Goal**: Establish the Apple design system foundation by updating CSS variables, font configuration, and base card component. After this phase, the page background, font, and card surfaces will look Apple-like even before individual components are refined.

**Changes**:

1. **`src/app/globals.css`** (major overhaul):
   - Update `:root` CSS variables for Apple color palette:
     - `--background`: `#F2F2F7` (Apple systemGroupedBackground)
     - `--card`: `#FFFFFF`
     - `--card-foreground`: `#000000`
     - `--foreground`: `#000000`
     - `--muted-foreground`: `#8E8E93` (Apple systemGray)
     - `--border`: transparent (borderless cards)
     - `--primary`: `#007AFF` (Apple systemBlue)
     - `--primary-foreground`: `#FFFFFF`
     - `--secondary`: `rgba(118, 118, 128, 0.12)` (tertiarySystemFill)
     - `--radius`: `1rem` (16px)
   - Add Apple-specific custom properties:
     - `--apple-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`
     - `--apple-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1)`
     - `--apple-transition: 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
   - Add utility classes:
     - `.tabular-nums { font-variant-numeric: tabular-nums }`
     - Skeleton shimmer `@keyframes` animation
     - `.skeleton` class for loading placeholders
   - Remove dark mode overrides (spec is light-mode only; keep `.dark` block but no need to update it now)

2. **`src/app/layout.tsx`**:
   - Remove Geist font imports
   - Update font stack to use system `-apple-system` stack via CSS (no font loading needed)
   - Remove `--font-geist-sans` and `--font-geist-mono` CSS variables from body class
   - Add `antialiased` class (already present)

3. **`src/components/ui/card.tsx`**:
   - Update `Card` base classes:
     - Remove `border` class
     - Change `rounded-xl` to `rounded-2xl` (for 16px)
     - Change `shadow-sm` to use Apple shadow: `shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]`
     - Add `transition-all duration-200` for hover animations
   - Update `CardHeader` padding to `px-5` (20px)
   - Update `CardContent` padding to `px-5` (20px)

4. **`src/lib/utils/formatters.ts`**:
   - Update `getScoreColor()` to use Apple colors:
     - `< 50`: `text-[#FF3B30]`
     - `50-69`: `text-[#FF9F0A]`
     - `>= 70`: `text-[#30D158]`
   - Update `getScoreBgColor()` to match
   - Update `getTrendColor()`:
     - `improving`: `text-[#34C759]`
     - `stable`: `text-[#8E8E93]`
     - `declining`: `text-[#FF3B30]`

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev &
# Visual: page background should be light gray, cards white/borderless with soft shadows
```

### Phase 2: Header, Segmented Control, and Page Layout

**Goal**: Transform the header to Apple-style typography and convert the Tabs date selector into an Apple segmented control with sliding indicator. Restructure page layout with spec-compliant spacing and max-width.

**Changes**:

1. **`src/app/page.tsx`** (restyle):
   - Update page container: max-width `860px` centered, horizontal padding `24px` (mobile) / `32px` (tablet+)
   - **Header**:
     - Remove `border-b` from header
     - Title "Ralph": `text-[34px] font-bold tracking-[-0.4px]`
     - Preview badge: change from amber to blue tint (`bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20`) per Apple language
     - Move sync status text to smaller caption below title: `text-[13px] text-[#8E8E93]`
     - Remove footer sync status card entirely (lines ~186-199)
     - Remove redundant footer Import Data button
   - **Date Range Selector** (convert to segmented control):
     - Replace `<Tabs>/<TabsList>/<TabsTrigger>` with a custom segmented control
     - Container: `rounded-[10px] bg-[rgba(118,118,128,0.12)] p-[2px] h-[36px]` inline-flex
     - Each segment button: `text-[13px] font-medium`, inactive `text-[#8E8E93]`, active `text-black`
     - Active indicator: white pill with `rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.12)]`
     - Sliding animation: `transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]`
     - Use relative/absolute positioning: container is relative, white pill is absolute and translates based on active index
     - Update labels: `"30D"`, `"60D"`, `"90D"`, `"1Y"` (shortened per spec)
   - **Loading State**: Replace text loading with skeleton shimmer placeholders that match final layout shape (score ring placeholder + 2 card placeholders)
   - **Error State**: Card with red-tinted left border accent, spec copy: "Couldn't load your data. Let's try again." + Retry button
   - **Empty State**: Centered card with spec copy: "Ready to get started?" heading + "Import your Apple Health data to see your fitness dashboard." body + "Import Health Data" CTA

2. **`src/components/ui/tabs.tsx`**: No changes needed — the segmented control will be built inline in `page.tsx` since it's a one-off design-specific component, not a reusable generic tab. The existing Tabs component remains available for other uses.

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev &
# Visual: header is borderless, title is large bold, segmented control slides, no footer card
```

### Phase 3: Score Ring, Category Cards, and Category Detail

**Goal**: Redesign the FitnessScore ring component to Apple style, restyle MetricCard for category summaries, and refine CategoryDetail with Apple-style comparison badges and chart treatments.

**Changes**:

1. **`src/components/charts/FitnessScore.tsx`**:
   - Update `getScoreHex()` to Apple palette:
     - `< 50`: `#FF3B30`
     - `50-69`: `#FF9F0A`
     - `>= 70`: `#30D158`
   - Background track: change `#e5e7eb` to `rgba(0, 0, 0, 0.05)` (very subtle)
   - Bar size: 16px (large), 10px (small) — increase from current 14/10
   - Corner radius: increase to 10 for fully rounded caps
   - Center text: `text-[34px]` bold (large), `text-[22px]` bold (small), add `tabular-nums`
   - Add mount animation: use CSS animation on the wrapper `div` that transitions opacity and scale from 0.95 to 1 over 800ms
   - Null state: display `"--"` in same font weight/size to keep layout stable
   - Trend text: use Apple semantic colors from updated `getTrendColor()`

2. **`src/components/charts/MetricCard.tsx`** (category summary cards):
   - Redesign for Apple-style category card:
     - Add hover lift: `hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]` with `transition-all duration-200`
     - Title: `text-[17px] font-semibold tracking-[-0.2px]`
     - Value: `text-[28px] font-bold tracking-[-0.3px] tabular-nums`
     - Trend text: `text-[13px] font-medium` with Apple semantic color
     - Sparkline: stroke at category color with 50% opacity, 1.5px width, no fill/dots/axes
     - Null value: display `"--"` in same size/weight
   - Add small score ring (FitnessScore size="sm") to left of content if the card represents a score

3. **`src/components/dashboard/Overview.tsx`**:
   - Section headings: `text-[22px] font-semibold tracking-[-0.3px]`
   - "Fitness Score" heading above score ring
   - Category cards section: `gap-4` (16px per spec)
   - Wrap category `<button>` with proper cursor-pointer and focus styles
   - Add section heading "Categories" above the ProgressChart section
   - Score Trend section heading: use spec text "Score Trend"
   - Vertical spacing between sections: `space-y-8` (32px)

4. **`src/components/dashboard/CategoryDetail.tsx`**:
   - Section heading "This Week vs Last Week": `text-[22px] font-semibold tracking-[-0.3px]`
   - Metric card titles: `text-[17px] font-semibold`
   - Metric values: `text-[28px] font-bold tabular-nums`
   - Change percent badge: `text-[13px]` caption style
   - TrendChart color: use category-appropriate color (`#30D158` for Running, `#007AFF` for Gym) instead of hardcoded `#6366f1`
   - Pass category identity through props or config to drive color selection
   - Empty state text styling: `text-[13px] text-[#8E8E93]`
   - "Not enough data yet" for empty chart areas (per spec copy)

5. **`src/components/charts/ComparisonCard.tsx`**:
   - "This Week" value: `text-[22px] font-semibold`
   - "Last Week" value: `text-[13px] text-[#8E8E93]`
   - Delta badge: pill-shaped (`rounded-xl px-2 py-0.5`), background tinted with semantic color at 12% opacity, text in semantic color
     - Improving: `bg-[#34C759]/12 text-[#34C759]`
     - Declining: `bg-[#FF3B30]/12 text-[#FF3B30]`
     - Stable: `bg-[#8E8E93]/12 text-[#8E8E93]`
   - Label: `text-[13px] text-[#8E8E93]`
   - Use Apple trend colors: `#34C759` (improving), `#FF3B30` (declining), `#8E8E93` (stable) instead of Tailwind green/red

6. **`src/components/dashboard/RunningMetrics.tsx`** and **`src/components/dashboard/GymMetrics.tsx`**:
   - Pass a `color` prop to CategoryDetail:
     - Running: `#30D158`
     - Gym: `#007AFF`
   - CategoryDetail will use this color for chart strokes

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev &
# Visual: score ring has Apple colors, category cards lift on hover, comparison deltas are pill badges
```

### Phase 4: Charts, Progress Bars, and Final Polish

**Goal**: Restyle all Recharts components to match Apple chart aesthetics (gradient fills, rounded bars, dashed grids, subtle axes), and apply final interaction polish (card expand/collapse animation, staggered card fade-in, segmented control refinement).

**Changes**:

1. **`src/components/charts/TrendChart.tsx`**:
   - Area fill: linear gradient from `color` at 30% opacity (top) to 0% (bottom) using SVG `<defs><linearGradient>` — Recharts supports this via a custom gradient `id`
   - Stroke: 2px
   - Curve type: `monotoneX` (already set)
   - CartesianGrid: `strokeDasharray="4 4"` with `stroke="rgba(0,0,0,0.06)"` (not `opacity-30` class)
   - XAxis: `tick={{ fontSize: 12, fill: '#8E8E93' }}`, no axis line (`axisLine={false}`), no tick line (`tickLine={false}`)
   - YAxis: same treatment — `tick={{ fontSize: 12, fill: '#8E8E93' }}`, `axisLine={false}`, `tickLine={false}`
   - Tooltip: styled as white card with shadow — use `contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}`, `labelStyle={{ fontSize: 13, color: '#8E8E93' }}`, `itemStyle={{ fontSize: 13 }}`
   - Empty state text: "Not enough data yet" per spec

2. **`src/components/charts/ProgressChart.tsx`**:
   - Update `getScoreHex()` to Apple palette: `#FF3B30`, `#FF9F0A`, `#30D158`
   - Bar height: `barSize={28}`
   - Corner radius: `radius={[8, 8, 8, 8]}` (both ends rounded for filled portion)
   - Add background bars: use a second `<Bar>` with `fill="rgba(0,0,0,0.04)"` at value=100 behind the score bars (or use Recharts `background` prop on `<Bar>`)
   - XAxis/YAxis: `fill: '#8E8E93'`, `axisLine={false}`, `tickLine={false}`
   - Labels: `13px`, secondary color
   - Empty state: use spec messaging

3. **`src/components/dashboard/Overview.tsx`** (animation additions):
   - Category detail expand/collapse: wrap the expanded section in a `div` with CSS `transition-all duration-400` for height + opacity animation. Use CSS `grid-rows` trick: `grid-template-rows: 0fr` (collapsed) → `grid-template-rows: 1fr` (expanded) with `overflow: hidden` on inner content
   - Staggered card fade-in: Add CSS animation class to each category card with `animation-delay` based on index (`50ms * i`)

4. **Final polish across all components**:
   - Ensure all numeric displays use `tabular-nums` class or inline style
   - Verify all colors are from the Apple palette (no leftover Tailwind red-500, green-500, etc.)
   - Verify card padding is consistently `20px` (via `px-5 py-5` or the updated Card component)
   - Verify section spacing is `32px` throughout

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev &
# Visual: charts have gradient fills, bars are rounded, grids are subtle, animations are smooth
# Full visual review against specification
```

## File Change Summary

| File | Change Type | Scope |
|------|-------------|-------|
| `src/app/globals.css` | Major overhaul | Colors, shadows, animations, utilities |
| `src/app/layout.tsx` | Moderate | Font stack, remove Geist |
| `src/app/page.tsx` | Major | Header, segmented control, loading/error/empty states, remove footer |
| `src/components/ui/card.tsx` | Moderate | Borderless, shadow, radius, padding |
| `src/components/charts/FitnessScore.tsx` | Moderate | Apple colors, ring sizing, animation |
| `src/components/charts/MetricCard.tsx` | Moderate | Apple typography, hover lift, sparkline styling |
| `src/components/charts/TrendChart.tsx` | Moderate | Gradient fill, axis styling, tooltip |
| `src/components/charts/ProgressChart.tsx` | Moderate | Apple colors, bar sizing, rounded bars |
| `src/components/charts/ComparisonCard.tsx` | Moderate | Pill delta badges, Apple colors, typography |
| `src/components/dashboard/Overview.tsx` | Moderate | Section headings, spacing, expand animation |
| `src/components/dashboard/CategoryDetail.tsx` | Moderate | Typography, colors, category-aware chart colors |
| `src/components/dashboard/RunningMetrics.tsx` | Minor | Pass color prop |
| `src/components/dashboard/GymMetrics.tsx` | Minor | Pass color prop |
| `src/lib/utils/formatters.ts` | Minor | Apple color palette for scores and trends |

**Total files**: 14
**Estimated lines of change**: ~500–650

## Testing Strategy

This is a purely visual redesign. There are no unit-testable behavior changes.

1. **Type checking**: `npm run typecheck` — ensures no TypeScript errors from class/prop changes
2. **Linting**: `npm run lint` — ensures code quality
3. **Visual verification**: Run `npm run dev` and inspect in browser:
   - Preview mode provides mock data for all states
   - Switch date ranges to verify segmented control animation
   - Click category cards to verify expand/collapse animation
   - Verify hover states on interactive cards
   - Check responsive layout (narrow viewport for mobile column stacking)
4. **Existing tests**: `npm test` — run to confirm no regressions in utility functions

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
- **Recharts gradient fills**: Recharts supports SVG `<defs>` for gradient definitions. Each TrendChart instance will define a unique gradient ID to avoid conflicts.
- **Segmented control**: Built as a custom component inline in `page.tsx` rather than modifying the generic `tabs.tsx`, since the segmented control is a design-specific one-off for this page.
- **Category colors**: Running = `#30D158` (Apple green), Gym = `#007AFF` (Apple blue). These are passed through the component tree to TrendCharts and sparklines.
