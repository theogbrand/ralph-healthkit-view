# Implementation Plan: Ralph HealthKit View — UI Makeover

**Issue**: TEST-AGI-4
**Date**: 2026-02-15
**Research**: dawn-docs/research/2026-02-15-TEST-AGI-4-ralph-healthkit-view-ui-makeover.md
**Specification**: dawn-docs/specifications/2026-02-15-TEST-AGI-4-ralph-healthkit-ui-makeover.md
**Status**: Ready for Implementation

## Overview

This plan implements the "Warm Precision" UI makeover for the Ralph Apple Health dashboard. The makeover covers five areas: (1) a new warm coral-orange color palette with proper dark mode, (2) typography refinements using the existing Geist font stack, (3) card design upgrades with hover/active states, (4) motion and interaction design (score ring animation, skeleton loading, expand/collapse transitions, tab slide animations), and (5) chart visual refresh including larger sparklines and themed colors.

The work is organized into 5 phases, ordered by dependency: design tokens first, then core UI components, then dashboard page interactions, then chart restyling, and finally import page polish.

## Success Criteria

- [ ] All hardcoded hex colors in components replaced with CSS custom property references or semantic Tailwind classes
- [ ] Warm coral-orange accent color (`oklch(0.72 0.19 40)`) applied consistently across accent surfaces
- [ ] Dark mode toggle in header, respecting `prefers-color-scheme` on first load, storing preference in localStorage
- [ ] All interactive elements (buttons, cards, tabs, upload zone) have visible hover, active, and focus states
- [ ] Fitness score ring animates on page load (arc draws over 1s, number counts up)
- [ ] Category cards have hover lift effect and click expand/collapse with height animation
- [ ] Tab switching has sliding underline indicator and content cross-fade
- [ ] Loading states use skeleton shimmer screens (no plain text "Loading...")
- [ ] Sparklines enlarged from 20x10px to 80x32px with accent color stroke and gradient fill
- [ ] Sync status footer removed (redundant with header)
- [ ] Copy updates applied per specification (shorter labels, friendlier empty states)
- [ ] Import page uses theme tokens instead of hardcoded grays
- [ ] Build passes: `npm run build`
- [ ] Type check passes: `npm run typecheck`
- [ ] No animation jank — all animations use GPU-composited properties (transform, opacity)

## Phases

### Phase 1: Design System Foundation — Color Palette, Typography Tokens, and Dark Mode Toggle

**Goal**: Replace the default neutral shadcn/ui theme with the "Warm Precision" color system. Add a dark mode toggle. Establish typography conventions. This phase touches only foundational files — no component behavior changes.

**Changes**:

1. **`src/app/globals.css`**: Replace all CSS custom property values with the specification's color palette.

   Light mode token updates:
   ```
   --background: oklch(0.985 0.005 80)    /* warm off-white */
   --foreground: oklch(0.17 0.01 60)       /* near-black with warmth */
   --card: oklch(1 0 0)                    /* pure white cards */
   --card-foreground: oklch(0.17 0.01 60)
   --primary: oklch(0.72 0.19 40)          /* coral-orange accent */
   --primary-foreground: oklch(0.985 0 0)  /* white on accent */
   --secondary: oklch(0.96 0.005 80)
   --secondary-foreground: oklch(0.17 0.01 60)
   --muted: oklch(0.96 0.005 80)
   --muted-foreground: oklch(0.55 0.01 60) /* warm gray */
   --accent: oklch(0.96 0.005 80)
   --accent-foreground: oklch(0.17 0.01 60)
   --destructive: oklch(0.63 0.22 25)      /* spec red */
   --border: oklch(0.92 0.005 80)          /* subtle warm gray */
   --input: oklch(0.92 0.005 80)
   --ring: oklch(0.72 0.19 40)             /* accent for focus rings */
   ```

   Dark mode token updates:
   ```
   --background: oklch(0.16 0.01 60)       /* deep warm charcoal */
   --foreground: oklch(0.985 0 0)
   --card: oklch(0.22 0.01 60)             /* slightly lighter charcoal */
   --card-foreground: oklch(0.985 0 0)
   --primary: oklch(0.72 0.19 40)          /* same coral-orange */
   --primary-foreground: oklch(0.985 0 0)
   --muted-foreground: oklch(0.65 0.01 60) /* lighter warm gray for dark */
   --border: oklch(0.30 0.01 60)
   --input: oklch(0.30 0.01 60)
   --ring: oklch(0.72 0.19 40)
   ```

   Add new semantic color tokens:
   ```
   --color-positive: oklch(0.72 0.19 155)   /* green for improving */
   --color-warning: oklch(0.80 0.16 85)     /* amber for fair */
   --color-negative: oklch(0.63 0.22 25)    /* red for declining */
   --color-stable: oklch(0.60 0.01 60)      /* warm gray for flat */
   ```

   Add chart palette tokens:
   ```
   --chart-1: oklch(0.72 0.19 40)   /* coral-orange (accent) */
   --chart-2: oklch(0.70 0.14 185)  /* teal */
   --chart-3: oklch(0.55 0.20 270)  /* indigo */
   --chart-4: oklch(0.80 0.16 85)   /* amber */
   --chart-5: oklch(0.65 0.20 10)   /* rose */
   ```

   Add skeleton shimmer animation keyframe:
   ```css
   @keyframes shimmer {
     0% { background-position: -200% 0; }
     100% { background-position: 200% 0; }
   }
   ```

   Register the new tokens with Tailwind's `@theme` block so they are available as utility classes (e.g., `text-positive`, `bg-chart-1`).

2. **`src/app/layout.tsx`**: Add dark mode support.
   - Import a new `ThemeProvider` component (created below).
   - Wrap `{children}` in `<ThemeProvider>`.
   - No font changes (keep Geist Sans + Geist Mono per spec).

3. **New file: `src/components/ui/theme-toggle.tsx`**: Dark mode toggle button.
   - Sun/Moon icon toggle using lucide-react (`Sun`, `Moon` icons).
   - On click: toggle `dark` class on `<html>` element.
   - On mount: read `localStorage.getItem('ralph-theme')`. If null, check `prefers-color-scheme`. Apply accordingly.
   - On toggle: save preference to `localStorage.setItem('ralph-theme', 'dark' | 'light')`.
   - Icon transition: 180-degree rotation over 300ms with cross-fade.
   - Component size: small button (icon-only, `variant="ghost"`, `size="icon-sm"`).

4. **New file: `src/components/providers/theme-provider.tsx`**: Theme context provider.
   - Simple provider that initializes theme from localStorage / system preference.
   - Applies `dark` class to `<html>` on mount and on theme changes.
   - Provides `theme` and `setTheme` via React context.

5. **`src/lib/utils/formatters.ts`**: Replace hardcoded Tailwind color classes with semantic token classes.
   ```typescript
   // Before:
   getScoreColor: 'text-red-500' / 'text-yellow-500' / 'text-green-500'
   // After:
   getScoreColor: 'text-negative' / 'text-warning' / 'text-positive'

   // Before:
   getScoreBgColor: 'bg-red-500' / 'bg-yellow-500' / 'bg-green-500'
   // After:
   getScoreBgColor: 'bg-negative' / 'bg-warning' / 'bg-positive'

   // Before:
   getTrendColor: 'text-green-500' / 'text-gray-500' / 'text-red-500'
   // After:
   getTrendColor: 'text-positive' / 'text-stable' / 'text-negative'
   ```

**Verification**:
```bash
npm run typecheck
npm run build
# Manual: Open app in browser, verify warm off-white background, coral-orange accents
# Manual: Click dark mode toggle, verify dark theme applies with smooth transition
# Manual: Refresh page, verify theme preference is persisted
```

---

### Phase 2: Core Component Restyling — Cards, Buttons, Tabs, and Base Interactions

**Goal**: Update the shadcn/ui primitive components to match the specification's card design, button press feedback, and tab sliding indicator. Add global transition defaults.

**Changes**:

1. **`src/components/ui/card.tsx`**: Update card styling.
   - Default card: Change `rounded-xl` to `rounded-2xl`. Change `border` to `border border-border/50`. Keep `shadow-sm`.
   - Add a new `elevated` variant for fitness score and metric cards: `rounded-2xl shadow-md border-0` (no border, shadow-only depth).
   - Add a new `interactive` variant for category cards: includes `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer` plus `active:scale-[0.98] active:transition-transform active:duration-100`.
   - Active/expanded state support: when `data-state="active"` is set, apply `ring-2 ring-primary/20 shadow-lg`.
   - Use CVA (class-variance-authority) to add a `variant` prop: `default`, `elevated`, `interactive`.

2. **`src/components/ui/button.tsx`**: Add press feedback.
   - Add `active:scale-[0.97]` to all button variants for press-down effect.
   - Update focus ring: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
   - Ensure `transition-all duration-200` is on all variants.

3. **`src/components/ui/tabs.tsx`**: Add sliding underline indicator.
   - For the `line` variant, the active indicator should animate its horizontal position when the active tab changes. This requires a small amount of JS to measure tab positions and translate the indicator.
   - Add a `motion` div that acts as the sliding underline: absolute positioned, `h-0.5 bg-primary rounded-full`, animated with `transition-all duration-200 ease-out`.
   - The sliding underline position and width are computed via `useRef` on each `TabsTrigger` and updated via `useEffect` when the active value changes.
   - Content cross-fade: Add `transition-opacity duration-150` to `TabsContent`. Outgoing content fades out, incoming fades in. This can be achieved with a simple opacity transition on mount/unmount or via CSS `data-[state=active]:animate-in data-[state=inactive]:animate-out` from tw-animate-css.

4. **`src/components/ui/progress.tsx`**: Update accent color.
   - The indicator already uses `bg-primary`, which will now be the coral-orange accent.
   - Add a shimmer effect to the filled portion: overlay a gradient that sweeps left-to-right. Use a pseudo-element with the `shimmer` animation keyframe (defined in Phase 1).

**Verification**:
```bash
npm run typecheck
npm run build
# Manual: Hover over cards — verify shadow deepens and card lifts
# Manual: Click buttons — verify brief scale-down press effect
# Manual: Switch tabs — verify underline slides to new tab position
# Manual: Check that progress bar shimmer animates
```

---

### Phase 3: Dashboard Page — Header, Layout, Loading States, and Category Interactions

**Goal**: Redesign the dashboard page header, add skeleton loading states, implement category card expand/collapse animations, update copy/messaging per specification, and remove the redundant sync footer.

**Changes**:

1. **`src/app/page.tsx`**: Major updates.

   **Header redesign**:
   - Brand "Ralph": Change from `text-2xl font-bold` to `text-xl font-semibold tracking-tight`.
   - Add the dark mode `<ThemeToggle />` between sync time and Import button.
   - Shorten sync text: `Last sync: {time}` → `Synced {relativeTime}`.

   **Tab labels**:
   - Change tab trigger text: "30 Days" → "30d", "60 Days" → "60d", "90 Days" → "90d", "1 Year" → "1y".

   **Loading state** — replace plain "Loading dashboard..." text with skeleton components:
   - Create a `DashboardSkeleton` component (inline or separate file) that renders:
     - A circular skeleton pulse (fitness score placeholder): `w-[200px] h-[200px] rounded-full bg-muted animate-pulse mx-auto`
     - Two card-shaped skeleton rectangles (category cards): `h-32 rounded-2xl bg-muted animate-pulse` in a 2-column grid
     - A rectangular skeleton (chart placeholder): `h-[200px] rounded-2xl bg-muted animate-pulse`
     - A rectangular skeleton (trend chart placeholder): `h-[300px] rounded-2xl bg-muted animate-pulse`
   - Add shimmer gradient overlay on each skeleton element using the `shimmer` keyframe animation.

   **Empty state** update:
   - Change copy to: "Welcome to Ralph. Import your Apple Health export to see your fitness story."
   - Add an upload icon (lucide `Upload`) styled as a large muted icon above the text.

   **Error state** update:
   - Change copy to: "Couldn't load your dashboard. Check your connection and try again."
   - Add a "Retry" button.

   **Remove sync footer**:
   - Delete the footer `<Card>` at the bottom of the page that shows "Last synced" and "Import" button. The header already shows this information.

   **Section spacing**:
   - Change `space-y-8` to `space-y-10` in the main content area for more breathing room.

2. **`src/components/dashboard/Overview.tsx`**: Category card interactions and layout updates.

   **Section headings**:
   - Change heading text per spec: "Overall Fitness Score" → "Fitness Score", "Category Breakdown" → "Breakdown", "Score Trend" → "Your Progress".
   - Style section headings: `text-base font-semibold uppercase tracking-wide text-muted-foreground`.

   **Category cards**:
   - Wrap each category card in `<Card variant="interactive">` (from Phase 2).
   - When expanded, add `data-state="active"` to the card for the ring indicator.

   **Expand/collapse animation**:
   - Wrap the category detail section in an animated container that transitions `max-height` (or `grid-template-rows: 0fr → 1fr`) over 300ms ease-out.
   - Content inside has `opacity` transition with 100ms delay to avoid layout-shift flash.
   - Use a `<div>` with `overflow-hidden` and CSS transition on `grid-template-rows` for smooth height animation.

3. **New file: `src/components/dashboard/DashboardSkeleton.tsx`**: Skeleton loading component.
   - Renders placeholder shapes matching the dashboard layout.
   - Uses `animate-pulse` and the shimmer gradient.
   - Exported for use in `page.tsx`.

**Verification**:
```bash
npm run typecheck
npm run build
# Manual: Load page — verify skeleton screens appear during loading, then content fades in
# Manual: Verify header shows "Ralph" (smaller), dark mode toggle, sync time, Import button
# Manual: Verify tab labels are "30d", "60d", "90d", "1y"
# Manual: Hover category card — verify lift effect
# Manual: Click category card — verify smooth expand/collapse with height animation
# Manual: Verify footer sync card is removed
# Manual: Verify updated section headings
```

---

### Phase 4: Chart Visual Refresh — Colors, Sparklines, Score Ring Animation

**Goal**: Update all chart components to use theme-derived colors instead of hardcoded hex values. Enlarge sparklines. Add the fitness score ring animation. Update the comparison card styling.

**Changes**:

1. **`src/components/charts/FitnessScore.tsx`**: Score ring animation and color theming.

   **Replace hardcoded hex colors**:
   - `getScoreHex()`: Return CSS variable references instead of hex literals. Since Recharts requires hex/rgb values (not CSS variables), create a helper that reads computed CSS variable values at runtime using `getComputedStyle(document.documentElement).getPropertyValue('--color-positive')` etc., or define the score colors as explicit hex constants that match the oklch palette defined in globals.css:
     - Red (score < 50): Convert `oklch(0.63 0.22 25)` → approximate hex `#dc3545`
     - Amber (score 50-70): Convert `oklch(0.80 0.16 85)` → approximate hex `#e5a30d`
     - Green (score >= 70): Convert `oklch(0.72 0.19 155)` → approximate hex `#2daa57`
   - Background ring: Use a muted version of the theme (convert `--border` oklch to hex for the track).

   **Score ring animation**:
   - Use Recharts' `isAnimationActive={true}`, `animationDuration={1000}`, `animationEasing="ease-out"` on the `RadialBar` component.
   - For the score number count-up: Add a `useCountUp` custom hook or inline `useEffect` with `requestAnimationFrame` that animates from 0 to the target score over 1000ms with ease-out. Display the interpolated value.
   - The `trend` label text below the number should fade in after the count-up completes.

   **Typography**:
   - Score number: `text-5xl font-bold font-mono tabular-nums` (was `text-4xl font-bold`).
   - Trend label: `text-xs font-semibold uppercase tracking-wide` (badge-like).

2. **`src/components/charts/MetricCard.tsx`**: Sparkline enlargement and color update.

   **Sparkline size**:
   - Change from `width={80} height={20}` (the ResponsiveContainer or fixed dimensions) to `width={80} height={32}` on desktop, `width={64} height={24}` on mobile.
   - Use a responsive approach or fixed size increase.

   **Sparkline color**:
   - Replace `stroke="#6b7280"` with the accent color. Since Recharts needs a color value, use a hex equivalent of `--primary` (coral-orange) or read the CSS variable value.
   - Add a gradient fill below the line: Define a `<defs><linearGradient>` in the SVG with accent color at 10% opacity at the top fading to transparent at the bottom. Apply via `<Area>` instead of `<Line>`.

   **Typography**:
   - Metric value: Add `font-mono tabular-nums` class for data values.
   - Trend label: `text-xs font-semibold uppercase tracking-wide`.

3. **`src/components/charts/ProgressChart.tsx`**: Color theming.

   **Replace hardcoded hex colors**:
   - Same approach as FitnessScore: map oklch semantic colors to hex equivalents for Recharts consumption.
   - Use the same `getScoreHex()` function (centralize it in a shared chart utility or update in place).

4. **`src/components/charts/TrendChart.tsx`**: Color and gradient update.

   **Default color**:
   - Change default `color` prop from `#3b82f6` (blue) to the accent color hex equivalent.

   **Area gradient**:
   - Update the gradient fill opacity and ensure it uses the accent color.

5. **`src/components/charts/ComparisonCard.tsx`**: Styling update.

   **Replace hardcoded Tailwind colors**:
   - Change `text-green-500` to `text-positive`.
   - Change `text-red-500` to `text-negative`.
   - Change `text-muted-foreground` for neutral delta (already correct).

   **Typography**:
   - Metric values: Add `font-mono tabular-nums`.
   - Delta percentage: `text-xs font-semibold uppercase tracking-wide`.

6. **New file or update `src/lib/utils/chart-colors.ts`**: Centralized chart color utility.
   - Export hex constants that match the oklch theme palette, for use in Recharts components.
   - Export `getScoreHex(score)` function that returns themed hex colors.
   - This avoids duplicating the hex-to-oklch mapping across multiple chart files.

**Verification**:
```bash
npm run typecheck
npm run build
# Manual: Load dashboard — verify fitness score ring animates (arc draws, number counts up)
# Manual: Verify sparklines are larger (80x32px) with coral-orange color and gradient fill
# Manual: Verify progress chart bars use themed colors (green/amber/red matching palette)
# Manual: Verify trend chart uses coral-orange accent
# Manual: Verify comparison cards use semantic colors (text-positive, text-negative)
# Manual: Toggle dark mode — verify chart colors remain legible
```

---

### Phase 5: Import Page Polish — Theme Tokens, Drag States, Upload Animation

**Goal**: Update the import page to use theme tokens exclusively, enhance drag-and-drop feedback, add upload progress shimmer, and style the result display.

**Changes**:

1. **`src/components/import/FileUpload.tsx`**: Complete restyling.

   **Replace all hardcoded colors**:
   ```
   border-gray-300 → border-border
   border-gray-400 → border-border (drag state uses border-primary)
   text-gray-600  → text-muted-foreground
   text-gray-900  → text-foreground
   text-gray-500  → text-muted-foreground
   bg-gray-50     → bg-muted
   text-green-600 → text-positive
   text-red-600   → text-negative
   ```

   **Drag-over enhancement**:
   - On drag-over: border changes from `border-dashed border-border` to `border-solid border-primary`.
   - Background pulses: `bg-primary/5` with a subtle pulse animation.
   - Upload icon scales up: `scale-105` transition.

   **Drop feedback**:
   - Brief scale-down: `scale-[0.97]` for 100ms on drop.

   **Progress bar**:
   - The progress bar already uses `<Progress>`, which was updated in Phase 2 with shimmer.
   - Ensure the progress component is properly imported and used.

   **Success result card**:
   - Replace `bg-gray-50` stats grid background with `bg-muted`.
   - Add slide-in-from-bottom animation: `animate-in slide-in-from-bottom-4 duration-200` (tw-animate-css).
   - Green check icon: Add a scale-pop animation (0 → 1.1 → 1.0 over 300ms). Use CSS keyframe or tw-animate-css `animate-in zoom-in`.

2. **`src/app/import/page.tsx`**: Minor copy updates.

   **Header/title**:
   - Change "Import Apple Health Data" to "Import Health Data" per spec.

   **Instructions text**:
   - Update instruction copy if it differs from spec recommendations.

**Verification**:
```bash
npm run typecheck
npm run build
# Manual: Navigate to /import — verify no gray hardcoded colors remain
# Manual: Drag a file over upload zone — verify border turns coral-orange, background pulses
# Manual: Drop file — verify brief press effect, progress bar fills with shimmer
# Manual: On success — verify result card slides in from bottom, green check pops
# Manual: Toggle dark mode on import page — verify all elements render correctly
```

## Testing Strategy

### Automated
- **Type checking**: `npm run typecheck` — must pass with zero errors after each phase.
- **Build**: `npm run build` — must produce a successful production build after each phase.
- **Unit tests** (if any exist): `npm run test` — must not regress.

### Manual Visual Testing
After each phase, verify in browser at three breakpoints:
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1280px width

Check both light and dark modes at each breakpoint.

### Specific Visual Checks
1. **Color consistency**: No hardcoded hex/gray colors visible in component source (search for `#[0-9a-f]`, `gray-`, `red-500`, `green-500`, `yellow-500`).
2. **Animation performance**: Open Chrome DevTools Performance tab, record page load and interactions. Verify 60fps with no layout thrashing.
3. **Contrast ratios**: Use browser accessibility tools to verify WCAG AA contrast on text elements in both themes.
4. **Focus indicators**: Tab through all interactive elements — verify visible focus rings using the accent color.

### Regression Checks
- Dashboard data still loads and displays correctly after restyling
- Tab switching still fetches correct date range data
- Category expand/collapse still works
- File upload still processes files correctly
- All chart types still render with data

## Rollback Plan

Each phase is committed separately. To rollback any phase:

```bash
# Find the commit before the phase
git log --oneline

# Revert the specific phase commit
git revert <commit-hash>

# Or reset to before the phase (if no subsequent phases committed)
git reset --hard <commit-before-phase>
```

The design tokens (Phase 1) are the foundation — reverting Phase 1 effectively reverts the entire makeover since all subsequent phases depend on the token values. Phases 2-5 can be reverted independently without breaking each other, though the visual result will be inconsistent.

## Notes

### Recharts Color Limitation
Recharts does not support CSS custom properties (`var(--color-x)`) directly in component props like `fill` and `stroke`. The plan addresses this by:
1. Defining hex constants in a shared `chart-colors.ts` utility that are the hex equivalents of the oklch theme colors.
2. For dark mode chart color adaptation, using `getComputedStyle()` to read resolved CSS variable values at runtime, or accepting that chart colors remain fixed across themes (the specification's chart colors have sufficient lightness to work on both light and dark backgrounds).

### tw-animate-css Usage
The project already imports `tw-animate-css` in globals.css. This provides utility classes like `animate-in`, `fade-in`, `slide-in-from-bottom-4`, `zoom-in` which should be leveraged for:
- Content fade transitions on tab switch
- Result card slide-in on import success
- Check icon zoom-in on upload complete

### No New Font Downloads
Per specification, no new fonts are added. The makeover uses Geist Sans and Geist Mono differently (more `font-mono` for data values, adjusted sizes/weights) but does not introduce new font files.

### Score Ring Animation Scope
Per specification, the score ring animates on initial page load only. Tab switches (date range changes) update the score value instantly without re-animating. This is implemented by tracking whether the initial animation has played via a `useRef` flag.

### Expandable Category Detail Pattern
The expand/collapse animation uses CSS `grid-template-rows: 0fr / 1fr` transition rather than JS-measured `max-height`. This is the modern CSS approach and avoids hardcoding pixel heights. The inner content uses `overflow: hidden` on the wrapper and `min-height: 0` on the content to enable the collapse.
