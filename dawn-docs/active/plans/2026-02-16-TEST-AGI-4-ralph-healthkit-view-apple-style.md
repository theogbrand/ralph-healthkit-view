# Implementation Plan: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-4
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-4-ralph-healthkit-view-apple-style.md
**Specification**: dawn-docs/active/specifications/2026-02-16-TEST-AGI-4-ralph-healthkit-view-apple-style.md
**Status**: Ready for Implementation

## Overview

Transform the Ralph HealthKit dashboard into a polished, Apple Health-inspired experience. This involves a complete visual overhaul: new color palette, Inter font, custom SVG activity ring, Apple-style segmented control, refined card system, smooth animations via framer-motion, and restyled charts — all while preserving existing functionality and data flow.

The work is organized into 4 phases, ordered by dependency. Each phase builds on the previous and is independently verifiable.

## Success Criteria

- [ ] Dashboard visually resembles Apple Health / Apple Fitness+ design language
- [ ] Inter font loaded and applied with correct typographic hierarchy (weights, sizes, letter-spacing per spec)
- [ ] Custom SVG activity ring replaces Recharts RadialBarChart with animated arc draw
- [ ] Apple-style pill segmented control replaces current Tabs for date range selection
- [ ] Cards use 16px radius, no borders (light mode), subtle dual shadows, hover lift
- [ ] Smooth animations: skeleton loading → fade-in, ring draw, category expand/collapse, date range transitions
- [ ] Light and dark mode both functional with specified color tokens
- [ ] All existing functionality preserved (data fetch, preview mode, import, error/empty states)
- [ ] App builds without errors: `npm run build`
- [ ] TypeScript passes: `npm run typecheck`
- [ ] Live preview works: `npm run dev` shows running app with hot reload

## Phases

### Phase 1: Design Foundation — Fonts, Colors, Cards, and Layout

**Goal**: Establish the complete Apple-style visual foundation. After this phase, the app should look fundamentally different — correct fonts, colors, card styles, and page layout — even before individual components are restyled.

**Changes**:

#### 1a. Font Swap: Geist → Inter

- `src/app/layout.tsx`:
  - Replace `Geist` and `Geist_Mono` imports with `Inter` from `next/font/google`
  - Configure Inter with weights `[400, 500, 600, 700]` and `subsets: ["latin"]`
  - Set CSS variable `--font-inter` (replacing `--font-geist-sans`)
  - Keep a monospace font for any code display (can keep Geist_Mono or use system mono)
  - Update body className to use new Inter variable

- `src/app/globals.css`:
  - Update `@theme inline` block: change `--font-sans: var(--font-inter);`
  - Remove `--font-geist-sans` / `--font-geist-mono` references (keep mono as fallback)

#### 1b. Color Palette Overhaul

- `src/app/globals.css` — Replace all `:root` and `.dark` CSS variable values with the specification's color tokens:

  **Light mode** (`:root`):
  ```
  --background: oklch(0.985 0 0)     /* warm off-white */
  --foreground: oklch(0.11 0 0)      /* rich near-black */
  --card: oklch(1 0 0)               /* pure white */
  --card-foreground: oklch(0.11 0 0)
  --muted: oklch(0.965 0 0)          /* segmented control track */
  --muted-foreground: oklch(0.46 0 0) /* secondary text */
  --border: oklch(0.94 0 0)          /* barely visible */
  ```

  **Dark mode** (`.dark`):
  ```
  --background: oklch(0.13 0 0)      /* deep charcoal */
  --foreground: oklch(0.95 0 0)
  --card: oklch(0.18 0 0)            /* elevated surface */
  --card-foreground: oklch(0.95 0 0)
  --muted: oklch(0.22 0 0)
  --muted-foreground: oklch(0.58 0 0)
  --border: oklch(0.25 0 0)
  ```

  **New activity ring + chart color tokens** (add to both `:root` and `@theme inline`):
  ```
  --ring-move: oklch(0.65 0.27 12)      /* Apple red #FF2D55 */
  --ring-exercise: oklch(0.72 0.22 145) /* Apple green #30D158 */
  --ring-stand: oklch(0.60 0.22 250)    /* Apple blue #0A84FF */
  --chart-blue: oklch(0.60 0.18 250)
  --chart-green: oklch(0.72 0.20 150)
  --chart-red: oklch(0.65 0.24 25)
  --chart-amber: oklch(0.80 0.16 85)
  ```

  Update `@theme inline` to expose new tokens as Tailwind colors:
  ```
  --color-ring-move: var(--ring-move);
  --color-ring-exercise: var(--ring-exercise);
  --color-ring-stand: var(--ring-stand);
  --color-chart-blue: var(--chart-blue);
  --color-chart-green: var(--chart-green);
  --color-chart-red: var(--chart-red);
  --color-chart-amber: var(--chart-amber);
  ```

#### 1c. Card Component Restyle

- `src/components/ui/card.tsx`:
  - Update `Card` base classes:
    - Border radius: `rounded-2xl` (16px)
    - Shadow (light): `shadow-[0_1px_3px_oklch(0_0_0/0.04),0_4px_12px_oklch(0_0_0/0.03)]`
    - Remove border in light mode, add `dark:border` for dark mode only
    - Padding: update `CardContent` default padding to `p-5` (20px)
    - Add hover transition: `transition-all duration-200 ease-out`
  - Update `CardHeader`: adjust padding to match 20px system
  - Update `CardTitle`: will be styled per-use in later phases (uppercase for category headers, etc.)

#### 1d. Page Layout and Structure

- `src/app/page.tsx`:
  - Update header: remove `border-b`, use a cleaner Apple-style header
  - Update container: add `max-w-[960px]` for desktop
  - Update page horizontal padding per breakpoints: `px-4 sm:px-6 lg:px-12`
  - Update section spacing: `space-y-8` between major blocks
  - Update Preview badge to frosted pill style per spec
  - Move "Last synced" text into header, remove footer card entirely (per spec simplification)

#### 1e. Button Restyle

- `src/components/ui/button.tsx`:
  - Update default variant for a more Apple-like feel: slightly larger radius (`rounded-xl`), refined padding
  - Ensure transitions are smooth: `transition-all duration-200`

#### 1f. Typography Utility Classes

- `src/app/globals.css`:
  - Add utility classes or update base styles for the typographic scale:
    - `.tabular-nums` → `font-variant-numeric: tabular-nums` (for metric values)
  - Ensure base body font size is 15px (0.9375rem) per spec

**Verification**:
```bash
npm run build
npm run dev
# Visual check: app uses Inter font, warm off-white background, white cards with
# subtle shadows, no heavy borders. Dark mode toggle (if available) shows correct
# dark palette. Header is cleaner, footer card removed.
```

---

### Phase 2: Activity Ring and Segmented Control

**Goal**: Replace the two most visually distinctive components — the fitness score ring and the date range selector — with Apple-style versions. These are the centerpiece interactions.

**Changes**:

#### 2a. Custom SVG Activity Ring

- `src/components/charts/FitnessScore.tsx` — **Complete rewrite**:
  - Remove Recharts dependency (RadialBarChart, RadialBar, ResponsiveContainer)
  - Implement custom SVG ring:
    - SVG viewBox centered, responsive sizing via container
    - Background track: circle with 8% opacity of score color, `stroke-linecap: round`
    - Foreground arc: `<circle>` element with `stroke-dasharray` / `stroke-dashoffset` for fill amount
    - Ring thickness: 16px (large), 10px (small) — implemented via `strokeWidth`
    - Round stroke caps: `stroke-linecap="round"`
    - Color mapping: score 0–49 → `var(--ring-move)`, 50–69 → `var(--chart-amber)`, 70–100 → `var(--ring-exercise)`
  - Center content:
    - Score: 48px bold (`text-5xl font-bold tracking-tight`, tabular-nums)
    - "/ 100" below in muted small text
  - Trend indicator below ring: chevron icon + "Improving"/"Stable"/"Declining" text, color-matched
  - Animation: ring draws from 0 to target value over 1s with CSS transition or `@keyframes`
    - Use CSS `transition: stroke-dashoffset 1s ease-out` triggered by mount
    - Or use `useEffect` + state to animate from 0 → score on mount
  - Null score state: empty gray track ring with "—" in center, trend hidden
  - Responsive sizes per spec: 160px (mobile), 180px (tablet), 200px (desktop) — use container query or media queries

- `src/lib/utils/formatters.ts`:
  - Update `getScoreColor` and `getScoreBgColor` to return CSS variable references instead of Tailwind classes (e.g., `var(--ring-move)` instead of `text-red-500`)
  - Or add a new `getScoreRingColor(score: number): string` function returning CSS custom property values

#### 2b. Apple-Style Segmented Control

- `src/components/ui/tabs.tsx` — **Restyle TabsList and TabsTrigger** (or create new SegmentedControl component):
  - Option A (preferred — restyle existing): Update the Tabs component to look like an Apple segmented control:
    - `TabsList`:
      - `bg-muted rounded-full p-[3px]` (pill container)
      - Height: 36px
      - `inline-flex` with auto-width
    - `TabsTrigger`:
      - Active: `bg-card rounded-full shadow-sm` (white pill on muted track)
      - Inactive: `bg-transparent text-muted-foreground`
      - Text: ALL CAPS, semibold, 13px
      - Transition: `transition-all duration-200 ease`
      - Height: 30px, horizontal padding: 16px

- `src/app/page.tsx`:
  - Update RANGES labels to short all-caps: `"30D"`, `"60D"`, `"90D"`, `"1Y"` per spec
  - Center the segmented control on the page

**Verification**:
```bash
npm run build
npm run dev
# Visual check: Activity ring is a thick SVG circle that draws itself in on load.
# Score color matches spec ranges. Ring has rounded caps and subtle background track.
# Date range picker is a pill-shaped segmented control with sliding active state.
# Score "/ 100" label visible. Trend indicator below ring.
```

---

### Phase 3: Chart and Metric Components Restyle

**Goal**: Restyle all remaining data visualization components to match the Apple aesthetic — MetricCard, TrendChart, ProgressChart, ComparisonCard, and CategoryDetail.

**Changes**:

#### 3a. MetricCard Restyle

- `src/components/charts/MetricCard.tsx`:
  - Title: uppercase, muted, 13px, wider letter-spacing (`text-xs uppercase tracking-wider text-muted-foreground font-medium`)
  - Value: bold, 24px (`text-2xl font-bold`), tabular-nums, with unit in muted smaller text next to it
  - Trend: chevron icon + percentage text, color-coded (green/red/amber)
  - Mini sparkline below: 80px height area chart with gradient fill using `--chart-blue`, no axes/grid
  - Update Recharts LineChart to AreaChart with gradient fill, remove tick/axis/grid rendering
  - Card should have hover lift effect

#### 3b. TrendChart Restyle

- `src/components/charts/TrendChart.tsx`:
  - Smooth monotone curve with `--chart-blue` stroke (2px)
  - Gradient fill: from `--chart-blue` at 20% opacity to transparent (use Recharts `<defs>` + `<linearGradient>`)
  - Remove grid lines (`cartesianGrid` → remove or `strokeDasharray="0"`)
  - X-axis: minimal date labels, muted color, caption-size text
  - Y-axis: hidden
  - Tooltip: floating card style — small shadow, rounded, appears on hover
  - Chart height: 200px (reduced from current ~300px)
  - Remove hard-coded `#3b82f6` color in Overview.tsx call, use CSS variable

#### 3c. ProgressChart Restyle

- `src/components/charts/ProgressChart.tsx`:
  - Replace Recharts horizontal BarChart with custom HTML/CSS bars:
    - Pill-shaped bars (rounded-full), 8px height
    - Background track: 8% opacity of bar color
    - Color: score-based color mapping (same as activity ring)
    - Label left, score value right
    - Clean layout, no chart chrome/axes/grid
  - Or significantly restyle the Recharts version to remove all chrome

#### 3d. ComparisonCard Restyle

- `src/components/charts/ComparisonCard.tsx`:
  - "This Week" value: bold, 24px
  - "Last Week" value: muted, 14px
  - Delta badge: pill-shaped (`rounded-full`), colored background at 10% opacity with matching text
    - Green pill: "+5.2%" with up chevron
    - Red pill: "-3.1%" with down chevron
    - Gray pill: "0%" with dash
  - Clean two-column or stacked layout

#### 3e. CategoryDetail Restyle

- `src/components/dashboard/CategoryDetail.tsx`:
  - Section header: uppercase, muted
  - Metric cards grid: 2 columns desktop, 1 column mobile (`grid grid-cols-1 md:grid-cols-2 gap-4`)
  - Week comparison section: uses restyled ComparisonCards
  - Overall clean spacing matching 8px grid system

#### 3f. Overview Component Updates

- `src/components/dashboard/Overview.tsx`:
  - Remove the `<Card>` wrapper around the FitnessScore section — ring floats on page background per spec
  - Update category cards section: make cards tappable with hover lift, per spec
  - Add highlight state to expanded category card
  - Update section spacing to 32px between major blocks
  - Remove `<Card>` wrapper around ProgressChart and TrendChart section headers — or keep minimal, per Apple aesthetic
  - Update card titles to match spec typography (section heading: 600 weight, 20px)

**Verification**:
```bash
npm run build
npm run dev
# Visual check: All charts restyled. MetricCards have uppercase titles, bold values,
# gradient sparklines. TrendChart is clean with gradient fill, no grid. ProgressChart
# uses thin pill bars. ComparisonCards have delta badges. Category detail expands
# with clean grid layout.
```

---

### Phase 4: Animations, Loading States, and Polish

**Goal**: Add the animation layer and polish that makes the dashboard feel alive — skeleton loading, fade transitions, expand/collapse animations, hover interactions, and the import page restyle.

**Changes**:

#### 4a. Install framer-motion

```bash
npm install framer-motion
```

#### 4b. Loading Skeleton

- `src/app/page.tsx`:
  - Replace text "Loading dashboard..." with skeleton shimmer placeholders:
    - A skeleton ring (gray circle), skeleton cards (gray rectangles with rounded corners), skeleton chart area
    - Use pulsing animation: `animate-pulse` from Tailwind
    - Skeleton fades out (200ms) when data arrives, real content fades in (300ms)
  - Wrap dashboard content in a `motion.div` with `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}` for fade-in on load

#### 4c. Category Expand/Collapse Animation

- `src/components/dashboard/Overview.tsx`:
  - Use framer-motion `AnimatePresence` + `motion.div` for expand/collapse:
    - Expand: height from 0, opacity from 0, with 300ms ease spring
    - Collapse: height to 0, opacity to 0, with 200ms ease
  - Only one category expanded at a time (already implemented in state logic)
  - Expanded card gets subtle background tint

#### 4d. Date Range Transition

- `src/app/page.tsx`:
  - On range change: content dims to 60% opacity (100ms) while fetching
  - On data arrival: content cross-fades back to 100% (200ms)
  - Activity ring re-animates from previous score to new score (600ms)

#### 4e. Card Hover Effects

- `src/components/ui/card.tsx` or individual card usage:
  - Desktop hover: `hover:-translate-y-px` + shadow deepens
  - Active/pressed: `active:translate-y-0 active:scale-[0.99]` for 100ms
  - Already partially set up in Phase 1 with transitions — ensure all interactive cards use these

#### 4f. Error and Empty State Polish

- `src/app/page.tsx`:
  - Error state: card with headline "Couldn't load your data", body "Check your connection and try again.", Retry button
  - Empty state: "Welcome to Ralph" headline, "Import your Apple Health data to get started." body, prominent "Import Data" button
  - Both with fade-in animation

#### 4g. Import Page Restyle

- `src/app/import/page.tsx`:
  - Match Apple aesthetic: clean header, properly styled cards
  - Upload zone: border-dashed styling with proper colors
  - Update typography and spacing to match new design system
  - (Drag-over pulse animation and upload progress are secondary — implement if time allows)

#### 4h. Preview Mode Banner

- `src/app/page.tsx`:
  - Frosted banner at top: "Preview" badge with dismiss/exit
  - Already partially styled — update to match spec's frosted appearance:
    - `backdrop-blur-md bg-white/70 dark:bg-black/50` style

**Verification**:
```bash
npm run build
npm run dev
# Visual check: Page loads with skeleton shimmer → smooth fade to content.
# Activity ring draws itself in on load. Category cards expand/collapse with smooth
# animation. Date range switch shows dimming + refresh. Cards have hover lift on
# desktop. Error/empty states match spec copy. Import page matches new design.
# Preview banner is frosted glass style.
```

---

## Testing Strategy

This is a visual UI makeover — primary validation is through the live preview:

1. **Live preview** (`npm run dev`): The development server with hot reload provides real-time visual feedback. The mock data system (`dashboard-preview.ts`) ensures sample data is always available.

2. **Build verification** (`npm run build`): Ensures no TypeScript errors, no broken imports, and the production build succeeds.

3. **Type checking** (`npm run typecheck`): Catches any type regressions from component API changes.

4. **Visual inspection checklist** (per phase verification commands above):
   - Light mode appearance
   - Dark mode appearance (toggle `.dark` class on `<html>`)
   - Responsive behavior at mobile (< 640px), tablet (640–1024px), desktop (> 1024px)
   - All interactive states: hover, active/pressed, expanded, loading, error, empty

5. **Existing tests** (`npm test`): Run to ensure no functional regressions. Tests are minimal for this project, so they should pass without modification.

## Rollback Plan

Each phase is committed separately. To rollback:

1. **Per-phase**: `git revert <phase-commit-hash>` — each phase commit is self-contained
2. **Full rollback**: `git revert` all phase commits in reverse order, or `git reset` to the pre-implementation commit
3. **Dependencies**: Only `framer-motion` is added (Phase 4). If rolling back Phase 4, also `npm uninstall framer-motion`.
4. **No data model or API changes**: The rollback has zero backend risk. Only UI components and styles are affected.

## Notes

### Key Technical Decisions

1. **framer-motion for animations**: The spec calls for expand/collapse, fade-in, and ring draw animations that go beyond CSS transitions. framer-motion provides `AnimatePresence` for exit animations and `layout` for smooth height transitions. CSS-only would be lighter but insufficient for the expand/collapse pattern (animating `height: auto`).

2. **Custom SVG activity ring** (replacing Recharts RadialBarChart): Recharts' RadialBar doesn't support round stroke caps, thin track backgrounds at 8% opacity, or the exact Apple Watch ring aesthetic. A custom SVG circle with `stroke-dasharray`/`stroke-dashoffset` gives full control.

3. **Restyle existing Tabs vs. new component**: The spec's segmented control can be achieved by restyling the existing Radix UI Tabs component. This preserves accessibility (keyboard nav, ARIA) and avoids reimplementing tab logic.

4. **ProgressChart: custom HTML vs. Recharts**: The spec calls for simple 8px pill bars — this is simpler to implement with plain HTML/CSS than configuring Recharts to hide all its chrome. Recommend replacing with custom HTML bars.

5. **Spec simplifications adopted**:
   - Single activity ring (overall score), not triple ring
   - Footer removed, sync time moved to header
   - Open question on removing 60D range — plan keeps all 4 ranges but uses short labels ("30D", "60D", "90D", "1Y")

### Dependency Changes

- **Add**: `framer-motion` (Phase 4)
- **No removals**: Recharts stays for TrendChart and MetricCard sparklines. Only the RadialBarChart usage in FitnessScore is replaced.

### File Change Summary

| File | Phase | Change Type |
|------|-------|-------------|
| `src/app/layout.tsx` | 1 | Modify (font swap) |
| `src/app/globals.css` | 1 | Modify (colors, tokens, typography) |
| `src/components/ui/card.tsx` | 1 | Modify (restyle) |
| `src/components/ui/button.tsx` | 1 | Modify (restyle) |
| `src/app/page.tsx` | 1, 2, 4 | Modify (layout, labels, loading, animations) |
| `src/components/charts/FitnessScore.tsx` | 2 | Rewrite (custom SVG ring) |
| `src/components/ui/tabs.tsx` | 2 | Modify (segmented control style) |
| `src/components/charts/MetricCard.tsx` | 3 | Modify (restyle) |
| `src/components/charts/TrendChart.tsx` | 3 | Modify (restyle) |
| `src/components/charts/ProgressChart.tsx` | 3 | Rewrite (custom HTML bars) |
| `src/components/charts/ComparisonCard.tsx` | 3 | Modify (restyle) |
| `src/components/dashboard/CategoryDetail.tsx` | 3 | Modify (restyle) |
| `src/components/dashboard/Overview.tsx` | 3, 4 | Modify (layout, animations) |
| `src/app/import/page.tsx` | 4 | Modify (restyle) |
| `src/lib/utils/formatters.ts` | 2 | Modify (score color functions) |
| `package.json` | 4 | Modify (add framer-motion) |

### Estimated Scope

- **Phase 1**: ~250 LOC changes across 5 files (foundation, highest leverage)
- **Phase 2**: ~200 LOC changes across 4 files (ring rewrite + segmented control)
- **Phase 3**: ~250 LOC changes across 6 files (chart/metric restyling)
- **Phase 4**: ~200 LOC changes across 5 files (animations + polish)
- **Total**: ~900 LOC across 16 files
