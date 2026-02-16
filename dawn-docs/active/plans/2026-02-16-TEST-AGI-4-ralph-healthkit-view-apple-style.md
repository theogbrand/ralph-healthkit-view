# Implementation Plan: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-4
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-4-ralph-healthkit-view-apple-style.md
**Specification**: dawn-docs/active/specifications/2026-02-16-TEST-AGI-4-ralph-healthkit-view-apple-style.md
**Status**: Implementation Complete

## Overview

Transform the Ralph HealthKit dashboard from its current generic shadcn/Tailwind design into an Apple Health-inspired experience. The work covers 6 layers: fonts, color system, card primitives, chart restyling, layout restructuring, and interaction animations. The app must remain functional with `npm run dev` at every phase so the user can live-preview changes with mock data.

## Success Criteria

- [x] Dashboard visually resembles Apple Health app (clean whites, #F2F2F7 gray background, vibrant ring colors, generous whitespace)
- [x] Inter font family loaded and applied with correct weight/size scale per spec typography table
- [x] Cards use 20px radius, no visible borders, refined box-shadows, 20px padding
- [x] Activity ring uses Apple Health red (#FA114F) with animated fill on load (800ms)
- [x] Segmented control replaces tab bar with Apple iOS-style pill design
- [x] Category cards have left accent bars, hover lift animations, expand/collapse with spring animation
- [x] Trend chart uses Apple-style gradient area fill, hidden Y-axis, monotone interpolation
- [x] Progress bars have rounded caps, Apple color coding
- [x] All text sizes, weights, and colors match specification typography table
- [x] Mock preview mode works correctly — `npm run dev` serves the app for live monitoring
- [x] Type check passes: `npx tsc --noEmit`
- [x] Lint passes: `npm run lint`
- [x] Existing tests pass: `npm run test`

## Phases

### Phase 1: Foundation — Fonts, Color System, and Global Styles

**Goal**: Replace the font system and establish the Apple Health design token layer in CSS. After this phase, the page background changes to Apple gray, text uses Inter, and all CSS custom properties are available for subsequent phases.

**Changes**:

- `src/app/layout.tsx`:
  - Replace `Geist` and `Geist_Mono` imports with `Inter` from `next/font/google`
  - Configure Inter with subsets `['latin']`, weights `['300', '400', '500', '600', '700']`
  - Set CSS variable `--font-inter` and apply it to `<body>`
  - Remove `--font-geist-sans` and `--font-geist-mono` variable references

- `src/app/globals.css`:
  - Add Apple Health CSS custom properties to `:root`:
    ```
    --apple-bg: #F2F2F7
    --apple-card: #FFFFFF
    --apple-text-primary: #1C1C1E
    --apple-text-secondary: #8E8E93
    --apple-text-tertiary: #AEAEB2
    --apple-separator: #E5E5EA
    --apple-ring-red: #FA114F
    --apple-ring-green: #92E82A
    --apple-ring-cyan: #00D4FF
    --apple-heart: #FF2D55
    --apple-steps: #FD9426
    --apple-improving: #34C759
    --apple-declining: #FF3B30
    --apple-stable: #8E8E93
    --apple-blue: #007AFF
    ```
  - Update `--font-sans` in `@theme inline` to reference `var(--font-inter)`
  - Remove `--font-mono` from theme (not used in Apple design)
  - Update `:root` background to `--apple-bg` (#F2F2F7)
  - Update `:root` foreground to `--apple-text-primary` (#1C1C1E)
  - Update `--card` to `--apple-card` (#FFFFFF)
  - Update `--card-foreground` to `--apple-text-primary`
  - Update `--muted-foreground` to `--apple-text-secondary`
  - Update `--border` to `--apple-separator`
  - Add animation keyframes:
    ```css
    @keyframes ring-fill { from { stroke-dashoffset: <full>; } to { stroke-dashoffset: <target>; } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes expand { from { max-height: 0; opacity: 0; } to { max-height: 2000px; opacity: 1; } }
    ```
  - Add utility classes for Apple typography:
    ```css
    .apple-title { font-size: 34px; font-weight: 700; letter-spacing: -0.02em; color: var(--apple-text-primary); }
    .apple-section-header { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; color: var(--apple-text-primary); }
    .apple-card-title { font-size: 17px; font-weight: 600; letter-spacing: -0.01em; color: var(--apple-text-primary); }
    .apple-large-number { font-size: 48px; font-weight: 300; letter-spacing: -0.03em; }
    .apple-body { font-size: 15px; font-weight: 400; color: var(--apple-text-primary); }
    .apple-caption { font-size: 13px; font-weight: 400; color: var(--apple-text-secondary); }
    ```

- `src/lib/utils/formatters.ts`:
  - Update `getTrendColor()` to use Apple palette classes:
    - `improving` → a class referencing `--apple-improving` (#34C759)
    - `stable` → a class referencing `--apple-stable` (#8E8E93)
    - `declining` → a class referencing `--apple-declining` (#FF3B30)
  - Update `getScoreColor()` and `getScoreBgColor()` similarly

**Verification**:
```bash
npm run typecheck
npm run lint
npm run test
npm run dev  # Visual check: gray background, Inter font, new text colors
```

---

### Phase 2: Card and UI Primitives — Apple-style Components

**Goal**: Update all shadcn UI primitives (Card, Tabs, Button) to match the Apple Health design language. After this phase, all existing cards automatically get the new look (rounded, borderless, soft shadow).

**Changes**:

- `src/components/ui/card.tsx`:
  - `Card`: Change class to remove `border`, increase radius to `rounded-[20px]`, add Apple shadow (`shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]`), set padding to `p-5`, remove `gap-6` (use inner spacing instead)
  - `CardHeader`: Update padding from `px-6` to `px-5`, adjust gap
  - `CardContent`: Update padding from `px-6` to `px-5`
  - `CardTitle`: Keep `font-semibold`, ensure it uses 17px Apple card title size
  - `CardFooter`: Update padding to match

- `src/components/ui/tabs.tsx`:
  - Restyle `TabsList` as Apple iOS segmented control:
    - Background: `--apple-separator` (#E5E5EA), fully rounded pill, 4px padding
    - Height: 32px
  - Restyle `TabsTrigger`:
    - Selected state: white background pill with shadow, `--apple-text-primary` text, 13px semibold
    - Unselected state: transparent, `--apple-text-secondary` text
    - Remove all existing dark mode and line variant styles (simplify)
    - Transition: 200ms ease-in-out

- `src/components/ui/button.tsx`:
  - Update `default` variant: `--apple-blue` (#007AFF) background, white text, 15px semibold, 44px height, 20px radius
  - Update `outline` variant: transparent bg, `--apple-blue` text, 44px height
  - Update `secondary` variant: light gray bg, `--apple-text-primary` text
  - Ensure 20px border-radius on all variants

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev  # Visual check: cards are borderless with rounded corners and soft shadows, tabs look like iOS segmented control
```

---

### Phase 3: Page Layout and Header — Apple Health Structure

**Goal**: Restructure the main page layout to match Apple Health: single-column 640px max-width, Apple-style header, updated date range labels, removed redundant sync footer, loading skeletons, and updated empty/error states.

**Changes**:

- `src/app/page.tsx`:
  - **Layout**: Change container to `max-w-[640px] mx-auto`, horizontal padding 20px, remove `container` class
  - **Header**: Remove `border-b`. Set "Ralph" to `apple-title` class (34px bold). Restyle preview badge: `--apple-ring-red` background, white text, 13px, pill shape. Move last sync info to 13px caption right-aligned
  - **Date range labels**: Change `RANGES` array to `['30D', '60D', '90D', '1Y']` (shorter labels per spec)
  - **Remove sync status footer**: Delete the entire `<section className="mt-8">` sync status card at the bottom
  - **Loading state**: Replace text with skeleton placeholders:
    - Circular skeleton for ring (180px)
    - Two card-shaped skeletons with shimmer animation
    - Chart-shaped skeleton
  - **Empty state**: Update to spec copy — "No Health Data Yet" heading (22px semibold), "Import your first dataset to get started." body (15px), Apple blue import button
  - **Error state**: Update to spec copy — "Something went wrong" heading, "We couldn't load your health data..." body, "Retry" button in Apple secondary style
  - **Content fade**: Wrap dashboard content in a div with `animate-[fade-in_250ms_ease-out]` for smooth appearance

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev  # Visual check: single-column layout, Apple-style header, skeleton loading, no sync footer
```

---

### Phase 4: Activity Ring and Fitness Score — Apple-style Ring

**Goal**: Transform the FitnessScore component from a Recharts RadialBarChart into an Apple Health-style activity ring using custom SVG. Center score in 48px light weight, add trend label below with colored dot prefix, animate ring fill on load.

**Changes**:

- `src/components/charts/FitnessScore.tsx`:
  - Replace the entire Recharts RadialBarChart implementation with custom SVG:
    - Single `<svg>` with viewBox, 180px diameter
    - Background track circle: `--apple-ring-red` at 20% opacity, 14px stroke width
    - Foreground arc: `--apple-ring-red` (#FA114F), 14px stroke, rounded caps (`stroke-linecap="round"`)
    - Use `stroke-dasharray` and `stroke-dashoffset` for arc length control
    - CSS animation: `ring-fill` keyframe, 800ms, `cubic-bezier(0.65, 0, 0.35, 1)`
  - Center content: Score in `apple-large-number` class (48px light), colored by score quality
  - Below ring: Trend label in `apple-caption` (13px) with small colored dot (●) prefix using Apple trend colors
  - Remove `getScoreHex` local function — use colors from formatters
  - Update the color logic:
    - Score < 50: `--apple-declining` (#FF3B30)
    - Score 50-69: `--apple-steps` (#FD9426)
    - Score >= 70: `--apple-improving` (#34C759)

- `src/components/dashboard/Overview.tsx`:
  - Remove the Card wrapper around FitnessScore (the ring should stand alone, not in a card)
  - Remove the "Overall Fitness Score" CardTitle — the ring speaks for itself
  - Add the score label directly below the ring component

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev  # Visual check: Apple-style ring with animation, centered score, trend label below
```

---

### Phase 5: Category Cards, Expand/Collapse, and Detail Layout

**Goal**: Redesign category summary cards with left accent bars, hover lift, and chevron. Implement spring-like expand/collapse animation. Restructure expanded detail to use metric list rows instead of individual cards, and horizontal-scroll comparison row.

**Changes**:

- `src/components/dashboard/Overview.tsx`:
  - **Category cards section**: Change from `grid grid-cols-1 gap-6 md:grid-cols-2` to `space-y-4` (single-column stacked per spec)
  - Wrap each category in a new custom card layout (not using `<MetricCard>`):
    - White card with 4px left accent bar (green `--apple-ring-green` for Running, cyan `--apple-ring-cyan` for Gym)
    - Left side: category name (17px semibold) + score (34px light weight) + trend pill
    - Right side: small sparkline (60px × 100px)
    - Right-aligned chevron (`›` character or Lucide `ChevronRight`) that rotates 90° on expand
    - Hover effect: `translateY(-2px)` + enhanced shadow, 200ms ease-out transition
    - Click expands/collapses detail section
  - **Expand/collapse animation**: Wrap expanded detail in a `div` with CSS:
    ```css
    overflow: hidden;
    animation: expand 350ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
    ```
    On collapse: reverse or unmount (use conditional render with animation)
  - **Section reordering**: Activity ring → Category cards → Score Trend → Category Breakdown (move trend chart before progress bars)
  - Add section headers as `apple-section-header` (22px semibold) for "Score Trend" and "Categories"

- `src/components/charts/MetricCard.tsx`:
  - This component is no longer used as a standalone clickable card in Overview
  - Keep the component but it may be simplified or repurposed for the sparkline-in-card layout
  - If not needed after refactor, leave it in place (don't delete, other pages might use it)

- `src/components/dashboard/CategoryDetail.tsx`:
  - **Remove individual Card wrapping per metric** — replace with iOS-style grouped list rows:
    - Each metric is a row with: Label (15px regular, left) | inline sparkline (40px wide, middle) | Value+Unit (15px semibold, right)
    - Rows separated by 1px `--apple-separator` dividers
    - All rows contained inside the parent expanded card area (no nested cards)
  - **Week comparison section**: Change from grid to horizontal scroll container:
    - `flex overflow-x-auto gap-3 pb-2` with `snap-x snap-mandatory`
    - Each comparison item: `min-w-[160px]` compact card
    - Label at top (13px caption), this week value (22px semibold), last week (13px secondary), delta badge

- `src/components/charts/ComparisonCard.tsx`:
  - Restyle to match the compact comparison item spec:
    - Remove Card wrapper, use a simple div with Apple card styling
    - Label: 13px caption at top
    - This week: 22px semibold, `--apple-text-primary`
    - Last week: 13px, `--apple-text-secondary`, prefixed with "last week"
    - Delta: small rounded badge, same trend pill style (green bg 10% + green text for improving, etc.)

**Verification**:
```bash
npm run typecheck
npm run lint
npm run dev  # Visual check: category cards with accent bars, smooth expand/collapse, list-style metrics, horizontal comparison scroll
```

---

### Phase 6: Charts, Progress Bars, and Final Polish

**Goal**: Restyle TrendChart and ProgressChart to match Apple Health aesthetic. Apply final polish: loading skeletons with shimmer, error boundary styling, and overall consistency pass.

**Changes**:

- `src/components/charts/TrendChart.tsx`:
  - Update default `color` prop to `--apple-ring-red` (#FA114F)
  - Area chart:
    - Gradient fill from `--apple-ring-red` at 30% opacity → transparent (use `<defs><linearGradient>`)
    - Smooth curve: `type="monotone"` (already exists)
    - Line width: 2.5px, rounded line caps
  - **Hide Y-axis**: Remove `<YAxis>` component entirely (per spec: Apple Health hides Y-axis)
  - **Hide CartesianGrid**: Remove `<CartesianGrid>` for cleaner look
  - X-axis: 11px font size, `--apple-text-tertiary` color
  - Tooltip: white card with Apple shadow, show date + formatted value
  - Chart height: 200px (reduced from 300px)
  - Add `<defs>` for gradient definition in SVG

- `src/components/charts/ProgressChart.tsx`:
  - Replace Recharts BarChart with custom HTML/CSS progress bars:
    - Each category: Label (15px regular) on its own line
    - Full-width horizontal bar: 8px tall, fully rounded (`rounded-full`)
    - Background track: `--apple-separator`
    - Fill: colored by score (`--apple-improving` for >=70, `--apple-steps` for 50-69, `--apple-declining` for <50)
    - Score number at right end (15px semibold)
    - 16px spacing between categories
  - This is simpler and more Apple-like than a Recharts bar chart

- `src/components/charts/ChartErrorBoundary.tsx`:
  - Update fallback text to "Unable to display this chart" (per spec)
  - Style fallback card with Apple design tokens

- `src/components/dashboard/Overview.tsx`:
  - Remove Card wrapper from Score Trend section — use standalone section with `apple-section-header`
  - Remove Card wrapper from Category Breakdown — use standalone section with `apple-section-header` "Categories"

**Verification**:
```bash
npm run typecheck
npm run lint
npm run test
npm run dev  # Full visual review: all components match Apple Health aesthetic, animations smooth, mock data displays correctly
```

---

## Testing Strategy

### Automated Tests
- **Existing tests** (`npm run test`): Must continue to pass. The mock data generation tests and fitness score calculation tests should be unaffected since we're only changing UI, not data logic.
- **TypeScript checks** (`npm run typecheck`): Must pass after every phase.
- **Lint** (`npm run lint`): Must pass after every phase.

### Manual Visual Testing
- Run `npm run dev` after each phase
- Verify mock preview mode activates correctly (no real data → auto-preview)
- Check each section against the specification:
  - Header: "Ralph" in 34px bold, preview badge in red pill, sync info as caption
  - Segmented control: iOS-style with sliding white pill
  - Activity ring: Animated fill, centered score, trend label below
  - Category cards: Left accent bars, hover lift, expand/collapse animation
  - Expanded detail: Horizontal comparison scroll, list-style metrics
  - Score trend: Gradient area chart, no Y-axis, clean date labels
  - Progress bars: Rounded, color-coded, with score numbers
  - Loading state: Skeleton placeholders with shimmer
  - Empty/error states: Updated copy per spec

### Browser Testing
- Chrome (primary — `npm run dev` opens here)
- Verify Inter font loads correctly (check Network tab for font files)
- Verify animations run at 60fps (check Performance tab)

## Rollback Plan

Every phase is committed separately. To rollback:
```bash
# Rollback to before any phase
git log --oneline  # Find the commit before the phase
git revert <commit-hash>
```

Since this is purely a UI/styling change with no data model or API modifications, rollback is low-risk. The mock data system, API routes, and type definitions remain unchanged.

## Notes

### Key Implementation Decisions

1. **Custom SVG for activity ring** (Phase 4): The specification says to use Recharts RadialBarChart if it can be styled to approximate Apple rings. However, after reviewing the current implementation, custom SVG with `stroke-dasharray`/`stroke-dashoffset` gives much better control over ring appearance, animation, and rounded caps. The current RadialBarChart uses `startAngle={225} endAngle={-45}` which creates a gauge, not a ring. Custom SVG is the right choice.

2. **Custom HTML/CSS for progress bars** (Phase 6): Similar reasoning — Recharts BarChart is overkill for 2 simple horizontal bars. Simple `<div>` elements with CSS widths, rounded corners, and color classes are more Apple-like, lighter, and easier to maintain.

3. **No new npm packages**: The plan uses only existing dependencies (Inter via `next/font/google`, Recharts for trend chart, Lucide for chevron icon). No additional packages needed.

4. **Single-column 640px layout**: This is a significant change from the current responsive grid. Per spec, Apple Health uses single-column on phone. Since the dashboard has only 2 categories, this is cleaner and more focused.

5. **Tab labels shortened**: "30 Days" → "30D", etc. per specification's simplification #4.

6. **Sync footer removed**: Per specification's simplification #1 — last sync info in header only.

### Dependencies Between Phases

```
Phase 1 (Foundation) ← Phase 2 (UI Primitives) ← Phase 3 (Page Layout)
                                                 ← Phase 4 (Activity Ring)
                                                 ← Phase 5 (Category Cards)
                                                 ← Phase 6 (Charts & Polish)
```

Phase 1 must be done first (fonts + colors). Phase 2 should follow (card/tabs/button primitives). Phases 3-6 can be done in any order after Phases 1-2, but the listed order minimizes rework.

### Files Modified Per Phase

| Phase | Files Modified | Est. Lines Changed |
|-------|---------------|-------------------|
| 1 | layout.tsx, globals.css, formatters.ts | ~150 |
| 2 | card.tsx, tabs.tsx, button.tsx | ~100 |
| 3 | page.tsx | ~120 |
| 4 | FitnessScore.tsx, Overview.tsx | ~100 |
| 5 | Overview.tsx, CategoryDetail.tsx, ComparisonCard.tsx | ~200 |
| 6 | TrendChart.tsx, ProgressChart.tsx, ChartErrorBoundary.tsx, Overview.tsx | ~130 |
| **Total** | **~15 files** | **~800 lines** |
