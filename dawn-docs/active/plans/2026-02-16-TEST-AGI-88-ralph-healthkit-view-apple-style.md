# Implementation Plan: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-88
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-88-ralph-healthkit-view-apple-style.md
**Specification**: dawn-docs/active/specifications/2026-02-16-TEST-AGI-88-ralph-healthkit-view-apple-style.md
**Status**: Ready for Implementation

## Overview

Transform the Ralph HealthKit dashboard from its current generic shadcn/ui + Geist font design into a premium Apple Health-inspired experience. This is a purely presentational makeover — no data interfaces, API routes, or business logic changes. The work spans ~15 files across the design system foundation (CSS variables, fonts), base UI components (card, button, tabs), chart components (FitnessScore, MetricCard, ComparisonCard, ProgressChart, TrendChart), dashboard layout (page.tsx, Overview, CategoryDetail), and polish (animations, loading states, import page).

## Success Criteria

- [ ] Typography uses Inter / system-ui font stack (replacing Geist)
- [ ] Color palette matches Apple Health design language (Activity ring colors, system labels, semantic colors)
- [ ] Cards use 16px radius, shadow-based elevation (no borders), hover lift effect
- [ ] Segmented control replaces tab component for date range selection
- [ ] FitnessScore displays Apple-style Activity Ring with animated draw-in
- [ ] Metric cards follow Apple typography hierarchy (caption title, semibold value, trend pill badge)
- [ ] Frosted glass sticky header with "Ralph" wordmark
- [ ] Loading state uses shimmer skeleton placeholders
- [ ] Error and empty states match specification copy and styling
- [ ] Smooth CSS transitions throughout (fade-in, card hover, category expand/collapse)
- [ ] Dark mode variables updated for Apple dark palette
- [ ] Import page styled consistently
- [ ] All existing tests pass: `npm run test`
- [ ] Type check passes: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs without errors: `npm run dev`

## Phases

### Phase 1: Design Tokens, Typography & Font Foundation

**Goal**: Replace the entire design system foundation — CSS custom properties, font stack, spacing scale, border radius, and shadow tokens — to establish the Apple Health visual language that all subsequent phases build on.

**Changes**:

#### `src/app/layout.tsx` (lines 1-35)
- Remove `Geist` and `Geist_Mono` imports from `next/font/google`
- Import `Inter` from `next/font/google` instead:
  ```typescript
  import { Inter } from "next/font/google";
  const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
  });
  ```
- Update `<body>` className to use `inter.variable` instead of `geistSans.variable` and `geistMono.variable`

#### `src/app/globals.css` (lines 1-126)
- Update `@theme inline` block:
  - Change `--font-sans` to `var(--font-inter)` and add fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Add new Apple-specific color tokens:
    ```
    --color-ring-move: var(--ring-move);
    --color-ring-exercise: var(--ring-exercise);
    --color-ring-stand: var(--ring-stand);
    --color-apple-blue: var(--apple-blue);
    --color-success: var(--success);
    --color-warning: var(--warning);
    --color-text-primary: var(--text-primary);
    --color-text-secondary: var(--text-secondary);
    --color-text-tertiary: var(--text-tertiary);
    --color-separator: var(--separator);
    --color-surface: var(--surface);
    ```
- Update `:root` block with Apple-inspired light mode values:
  ```
  --radius: 1rem;              /* 16px base for cards */
  --background: #ffffff;
  --foreground: #1D1D1F;       /* Apple system label */
  --card: #ffffff;
  --card-foreground: #1D1D1F;
  --primary: #007AFF;          /* Apple Blue */
  --primary-foreground: #ffffff;
  --secondary: #F2F2F7;        /* Apple system grouped bg */
  --secondary-foreground: #1D1D1F;
  --muted: #F2F2F7;
  --muted-foreground: #86868B; /* Apple secondary label */
  --accent: #F2F2F7;
  --accent-foreground: #1D1D1F;
  --destructive: #FF3B30;      /* Apple system red */
  --border: rgba(60,60,67,0.12); /* Apple separator */
  --input: rgba(60,60,67,0.12);
  --ring: #007AFF;
  /* Apple Activity Ring colors */
  --ring-move: #FA114F;
  --ring-exercise: #92E82A;
  --ring-stand: #00D4FF;
  /* Apple semantic colors */
  --apple-blue: #007AFF;
  --success: #34C759;
  --warning: #FF9500;
  --text-primary: #1D1D1F;
  --text-secondary: #86868B;
  --text-tertiary: #AEAEB2;
  --separator: rgba(60,60,67,0.12);
  --surface: #F9F9F9;
  /* Chart colors - Apple palette */
  --chart-1: #FA114F;
  --chart-2: #92E82A;
  --chart-3: #00D4FF;
  --chart-4: #FF9500;
  --chart-5: #AF52DE;
  ```
- Update `.dark` block with Apple dark mode values:
  ```
  --background: #000000;
  --foreground: #F5F5F7;
  --card: #1C1C1E;
  --card-foreground: #F5F5F7;
  --primary: #0A84FF;
  --primary-foreground: #ffffff;
  --secondary: #2C2C2E;
  --secondary-foreground: #F5F5F7;
  --muted: #2C2C2E;
  --muted-foreground: #98989D;
  --accent: #2C2C2E;
  --accent-foreground: #F5F5F7;
  --destructive: #FF453A;
  --border: rgba(255,255,255,0.1);
  --input: rgba(255,255,255,0.15);
  --ring: #0A84FF;
  --ring-move: #FA114F;
  --ring-exercise: #92E82A;
  --ring-stand: #00D4FF;
  --apple-blue: #0A84FF;
  --success: #30D158;
  --warning: #FF9F0A;
  --text-primary: #F5F5F7;
  --text-secondary: #98989D;
  --text-tertiary: #636366;
  --separator: rgba(255,255,255,0.1);
  --surface: #1C1C1E;
  --chart-1: #FA114F;
  --chart-2: #92E82A;
  --chart-3: #00D4FF;
  --chart-4: #FF9F0A;
  --chart-5: #BF5AF2;
  ```
- Add CSS animation keyframes at the bottom of globals.css for reuse across phases:
  ```css
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes ringDraw {
    from { stroke-dashoffset: var(--ring-circumference); }
    to { stroke-dashoffset: var(--ring-target); }
  }
  ```

**Verification**:
```bash
npm run typecheck
npm run dev  # Verify font changes visible, colors applied
```

### Phase 2: Base UI Component Restyling (Card, Button, Tabs/Segmented Control, Progress)

**Goal**: Update the four base UI components to match the Apple design language established in Phase 1, so all chart and dashboard components that consume them automatically pick up the new styling.

**Changes**:

#### `src/components/ui/card.tsx` (lines 1-93)
- Update `Card` className:
  - Remove `border` class
  - Change `rounded-xl` to `rounded-2xl` (16px)
  - Change `shadow-sm` to custom Apple shadow: `shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]`
  - Add hover transition: `transition-shadow duration-200`
- Update `CardHeader` gap to `gap-1` (tighter Apple spacing)
- Update `CardTitle` to use Apple section title styling: `text-[13px] font-medium text-[var(--text-secondary)]` as the base (individual components will override)
- Update `CardContent` padding to match Apple spacing

#### `src/components/ui/button.tsx` (lines 1-64)
- Update `buttonVariants` base styles:
  - Change `rounded-md` to `rounded-full` (capsule/pill shape for Apple style)
  - Add `active:scale-[0.97]` for press feedback
  - Add `transition-all duration-150` for smooth interactions
- Update `default` variant to use `bg-[var(--apple-blue)] text-white hover:bg-[var(--apple-blue)]/90`
- Update `outline` variant: remove heavy border, use lighter styling
- Keep `sm`, `lg`, etc. sizes, ensure they all use `rounded-full`

#### `src/components/ui/tabs.tsx` (lines 1-92)
- Restyle as an Apple-style segmented control:
- Update `TabsList`:
  - Background: `bg-[#F2F2F7]` (Apple grouped background)
  - Radius: `rounded-lg` (8px outer)
  - Padding: `p-0.5` (2px padding)
  - Height: auto-size based on content
- Update `TabsTrigger`:
  - Active state: `data-[state=active]:bg-white data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08)]`
  - Active text: `data-[state=active]:text-[var(--text-primary)]`
  - Inactive: transparent background, `text-[var(--text-secondary)]`
  - Radius: `rounded-md` (6px inner segments)
  - Transition: `transition-all duration-200`
  - Font: `text-[13px] font-medium`

#### `src/components/ui/progress.tsx` (lines 1-31)
- Update radius to `rounded-md` (6px)
- Update indicator to use Apple Blue by default

**Verification**:
```bash
npm run typecheck
npm run dev  # Verify card, button, tab styling changes
```

### Phase 3: Chart Component Restyling

**Goal**: Transform all chart components to use Apple Health visual language — Activity Ring colors, Apple typography hierarchy, trend pill badges, gradient area fills, and refined tooltips.

**Changes**:

#### `src/components/charts/FitnessScore.tsx` (lines 1-69)
- **Replace Recharts RadialBarChart with custom SVG Activity Ring**:
  - Remove `recharts` import for RadialBarChart/RadialBar
  - Create SVG-based circular progress ring:
    - Single ring (enhanced gauge), starting at 12 o'clock, filling clockwise
    - Stroke color: use `--ring-stand` (#00D4FF) as default ring color (or score-based gradient)
    - Background track: 10% opacity of ring color
    - Stroke-linecap: round (rounded end caps)
    - Stroke width: 14px for `lg`, 10px for `sm`
  - Add CSS animation for ring draw-in on mount (using `ringDraw` keyframe from Phase 1)
  - Center content: score number in 56px/3.5rem bold, "Fitness Score" label below in `--text-secondary`
  - Trend indicator below the ring: small colored pill badge instead of plain text
- Update `getScoreHex` to use Apple colors:
  - `< 50`: `#FF3B30` (Apple system red)
  - `< 70`: `#FF9500` (Apple system orange)
  - `>= 70`: `#34C759` (Apple system green)
- Null state: show "—" styled with muted text

#### `src/components/charts/MetricCard.tsx` (lines 1-50)
- Restructure card content to match Apple metric card spec:
  - Card title: `text-[13px] font-medium text-[var(--text-secondary)]` (caption style)
  - Value number: `text-[28px] font-semibold text-[var(--text-primary)]` with tracking `-0.01em`
  - Unit label: inline with value, `text-[var(--text-secondary)]`
  - Trend indicator: small colored pill badge (green/red/gray background at 10% opacity, colored text)
    - Improving: `↑ {percent}%` in green
    - Declining: `↓ {percent}%` in red
    - Stable: `→ Steady` in gray
  - Sparkline: increase height to 24px, use metric's semantic color at 30% opacity
- Add hover effect: `hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.08)] hover:-translate-y-px`

#### `src/components/charts/ComparisonCard.tsx` (lines 1-46)
- Update styling to match Apple comparison card spec:
  - Title: caption style (`text-[13px] text-[var(--text-secondary)]`)
  - This-week value: `text-[28px] font-semibold`
  - "vs last week" label with last-week value in secondary text
  - Delta badge: inline pill with colored text (green `↑ 12%`, red `↓ 5%`, gray `→ 0%`)
- Update delta colors to Apple semantic colors:
  - Improving: `#34C759` (Apple green)
  - Declining: `#FF3B30` (Apple red)
  - Neutral: `#86868B` (Apple secondary label)

#### `src/components/charts/ProgressChart.tsx` (lines 1-50)
- Update bar colors to Apple category colors:
  - Running: `#FA114F` (Activity Move red)
  - Gym: `#92E82A` (Activity Exercise green)
- Remove score-based color function; use fixed category colors
- Update bar radius to `[0, 8, 8, 0]` (more rounded)
- Update tooltip styling
- Update axis text to use `--text-secondary` color

#### `src/components/charts/TrendChart.tsx` (lines 1-83)
- Update chart styling:
  - Area fill: gradient from color at 20% opacity at top to transparent at bottom (use `<defs>` with `<linearGradient>`)
  - Smooth curved lines: already using `monotone` type ✓
  - No dots on line by default: already `dot={false}` ✓
  - Grid lines: very faint dashed lines using `#F2F2F7` color at low opacity
  - X-axis: `text-[var(--text-secondary)]` color, "Jan 5" format (already close)
  - Y-axis: same secondary color
  - Tooltip: clean styling with white background, subtle shadow, no border

#### `src/lib/utils/formatters.ts` (lines 49-75)
- Update `getScoreColor` to Apple colors:
  - `< 50`: `text-[#FF3B30]`
  - `< 70`: `text-[#FF9500]`
  - `>= 70`: `text-[#34C759]`
- Update `getScoreBgColor` similarly
- Update `getTrendColor`:
  - improving: `text-[#34C759]`
  - stable: `text-[#86868B]`
  - declining: `text-[#FF3B30]`

**Verification**:
```bash
npm run typecheck
npm run dev  # Verify all chart components render correctly with new styling
```

### Phase 4: Dashboard Layout, Header & Interactions

**Goal**: Redesign the dashboard page layout, header, category expand/collapse behavior, and overall spacing to match the Apple Health app's spatial design and interaction patterns.

**Changes**:

#### `src/app/page.tsx` (lines 1-205)
- **Header redesign** (lines 88-125):
  - Make header sticky: `sticky top-0 z-50`
  - Add frosted glass effect: `backdrop-blur-[20px] bg-white/72` (dark: `bg-black/72`)
  - Replace `border-b` with subtle separator: `shadow-[0_0.5px_0_rgba(0,0,0,0.12)]`
  - "Ralph" wordmark: `text-[34px] font-bold tracking-[-0.01em]` in `--text-primary`
  - Move date range segmented control INTO the header (right side, before Import button)
  - Preview badge: keep existing pill style but update colors to Apple style
  - Height: ~56px (`py-3`)
- **Loading state** (lines 142-150):
  - Replace text loading with shimmer skeleton placeholders:
    - Ring skeleton: circular placeholder
    - Card skeletons: rectangular placeholders matching card dimensions
    - Use `animate-[shimmer_1.5s_infinite]` with linear gradient background
- **Error state** (lines 153-164):
  - Update to match spec copy: heading "Something Went Wrong", subtitle "We couldn't load your health data."
  - Pill-shaped retry button in Apple Blue
  - Centered, gentle card styling
- **Empty state** (lines 167-178):
  - Update to match spec copy: "No Health Data Yet" heading, "Import your Apple Health data to see your fitness dashboard." body
  - "Import Data" as pill button in Apple Blue
- **Main content area** (lines 127-201):
  - Remove the separate date range Tabs from main (move to header)
  - Add `fadeIn` animation to content on mount
  - Remove footer sync status card (redundant with header info)

#### `src/components/dashboard/Overview.tsx` (lines 1-110)
- **Section spacing**: Change `space-y-8` to `space-y-6` (32px → 24px, tighter Apple spacing)
- **Fitness Score section** (lines 36-45):
  - Remove wrapping Card — let the Activity Ring stand alone as hero element
  - Add "Fitness Score" label in `text-[22px] font-semibold` section header style
- **Category Cards section** (lines 48-67):
  - Add section header: "Categories" in `text-[22px] font-semibold`
  - Update button wrapper: add `cursor-pointer group` for hover interactions
  - Add hover effect class to MetricCard wrappers: `transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-px`
  - Add active press feedback: `active:scale-[0.98]`
- **Expanded Category Detail** (lines 70-81):
  - Add smooth expand animation: CSS transition on height/opacity
  - Wrap in animated container with `fadeIn` animation
- **Category Breakdown section** (lines 83-93):
  - Update section header to Apple style: `text-[22px] font-semibold`
  - Remove Card wrapper — use cleaner section layout with separator
- **Score Trend section** (lines 96-107):
  - Same Apple section header treatment
  - Use `--ring-stand` (#00D4FF) color instead of hardcoded `#3b82f6`

#### `src/components/dashboard/CategoryDetail.tsx` (lines 1-89)
- Update section headers: `text-[22px] font-semibold tracking-[-0.01em]` (Apple section title)
- Update metric chart color from `#6366f1` to Apple palette color
- Add subtle separator between comparison section and metrics section
- Add `fadeIn` animation class to the container

**Verification**:
```bash
npm run typecheck
npm run dev  # Verify header, layout, expand/collapse, loading/error/empty states
```

### Phase 5: Import Page Consistency & Final Polish

**Goal**: Style the import page to match the new Apple design language, and add final polish touches across the app (animation refinements, responsive adjustments, edge cases).

**Changes**:

#### `src/app/import/page.tsx` (lines 1-56)
- Apply same frosted glass sticky header as dashboard
- "Ralph" wordmark: same 34px bold styling
- "Dashboard" link: pill button style
- "Import Apple Health Data" heading: `text-[22px] font-semibold` section title
- Instructions Card: updated with Apple card styling (16px radius, shadow)
- Steps list: better spacing and typography

#### Responsive polish (across all modified files)
- Verify single-column layout on narrow viewports
- Ensure Activity Ring scales down gracefully on mobile
- Verify segmented control fits on mobile (use shorter labels if needed: "30D", "60D", "90D", "1Y")
- Test card hover effects don't interfere on touch devices (use `@media (hover: hover)`)

#### Animation polish
- Verify all CSS transitions feel smooth at 60fps
- Ensure no layout shift during loading → content transitions
- Confirm ring draw-in animation fires on mount and on date range change

#### Edge cases from specification
- Very low score (< 30): warm, encouraging styling — no alarming visuals
- Perfect score (100): full ring closure
- Missing data: "—" with muted styling
- Long metric labels: truncate with ellipsis (`truncate` Tailwind class)

**Verification**:
```bash
npm run typecheck
npm run build
npm run test
npm run dev  # Full visual walkthrough of all states and pages
```

## File Change Summary

| File | Change Type | Estimated LOC |
|------|------------|---------------|
| `src/app/globals.css` | Major rewrite | ~100 |
| `src/app/layout.tsx` | Moderate | ~15 |
| `src/app/page.tsx` | Major rewrite | ~120 |
| `src/components/ui/card.tsx` | Moderate | ~20 |
| `src/components/ui/button.tsx` | Moderate | ~15 |
| `src/components/ui/tabs.tsx` | Moderate | ~30 |
| `src/components/ui/progress.tsx` | Minor | ~5 |
| `src/components/charts/FitnessScore.tsx` | Major rewrite | ~80 |
| `src/components/charts/MetricCard.tsx` | Moderate | ~30 |
| `src/components/charts/ComparisonCard.tsx` | Moderate | ~20 |
| `src/components/charts/ProgressChart.tsx` | Minor | ~15 |
| `src/components/charts/TrendChart.tsx` | Moderate | ~30 |
| `src/components/dashboard/Overview.tsx` | Moderate | ~40 |
| `src/components/dashboard/CategoryDetail.tsx` | Moderate | ~25 |
| `src/lib/utils/formatters.ts` | Minor | ~15 |
| `src/app/import/page.tsx` | Moderate | ~25 |
| **Total** | | **~585** |

## Testing Strategy

### Automated Tests
All existing tests are on the data/business logic layer and should remain passing since this is a purely presentational change:
- `npm run test` — Vitest suite (analytics, mock data, API route tests)
- `npm run typecheck` — TypeScript compilation
- `npm run build` — Next.js production build

### Manual Visual Testing
Since no component tests exist and this is entirely a visual change, verification requires manual inspection:
1. Start dev server: `npm run dev`
2. Open dashboard with preview data — verify hero score ring, metric cards, category expansion
3. Switch between all four date ranges — verify smooth transitions
4. Expand and collapse Running and Gym categories
5. Verify loading state (shimmer skeletons)
6. Verify error state (by temporarily breaking the API)
7. Verify empty state
8. Navigate to Import page — verify consistent styling
9. Test responsive: resize browser to mobile width
10. Test dark mode toggle (if applicable)

## Rollback Plan

Since all changes are in tracked files on a feature branch:
```bash
git revert HEAD  # If the last commit is the implementation
# OR
git checkout main -- src/  # Reset all source files to main branch state
```

No database migrations, no API changes, no dependency additions (using CSS-only animations), so rollback is straightforward file reversion.

## Notes

### Key Design Decisions
1. **CSS-only animations** — No framer-motion dependency. All animations (shimmer, fadeIn, ring draw) use CSS `@keyframes` and `transition`. This keeps the bundle lean and avoids a new dependency.
2. **Custom SVG ring instead of Recharts** — The FitnessScore component will use hand-crafted SVG instead of Recharts RadialBarChart, enabling precise Apple-style Activity Ring appearance (12 o'clock start, rounded caps, exact stroke widths, draw-in animation).
3. **Inter font via next/font** — System font stack (`-apple-system`) is the fallback. Inter loaded from Google Fonts via Next.js optimized font loading for consistent cross-platform appearance.
4. **Hex colors over oklch** — The specification defines colors in hex (Apple's published values). We convert the existing oklch() tokens to hex to match the spec exactly. The Tailwind `@theme inline` block maps CSS variables to Tailwind colors.
5. **Segmented control in header** — The date range selector moves from main content to the sticky header, matching Apple Health's top-level navigation pattern and freeing up main content space.
6. **Single enhanced ring** — Per the spec's simplification opportunity #2, we implement a single enhanced Activity Ring gauge rather than triple concentric rings. This captures the Apple aesthetic with manageable complexity.

### Implementation Order Rationale
Phases are ordered so each builds on the previous:
- Phase 1 (tokens) must come first as all other phases reference the new CSS variables
- Phase 2 (base components) must precede Phase 3 (charts) since charts consume Card, Button, etc.
- Phase 3 (charts) must precede Phase 4 (layout) since layout references chart components
- Phase 5 (polish) comes last as it requires all other phases complete to test holistically

### Dev Server for Live Preview
The specification requires maintaining a live preview during development. The implementer should:
1. Run `npm run dev` before starting
2. Keep the dev server running throughout implementation
3. Verify changes visually after each phase
4. The preview URL will be available at the local dev server (or the Daytona proxy URL from research)
