# Implementation Plan: Ralph HealthKit View (Glassmorphism Design Style)

**Issue**: TEST-AGI-1
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-1-ralph-healthkit-glassmorphism.md
**Specification**: dawn-docs/active/specifications/2026-02-16-TEST-AGI-1-ralph-healthkit-glassmorphism.md
**Status**: Implementation Complete

## Overview

Transform the Ralph HealthKit fitness dashboard from its current flat, opaque shadcn/ui design into an immersive glassmorphism experience. The makeover applies a dark-only theme with a rich navy-to-indigo gradient background, three-tier frosted glass card system, updated chart colors, hover interactions with card lift effects, and consistent glass treatment across all pages (dashboard, import). This is a purely visual change — no data, API, or business logic modifications.

**Key design decisions** (from specification):
- Dark-only theme (no light mode support)
- Static gradient background with fixed colored accent blobs
- Three-tier glass card system (Primary, Elevated, Subtle)
- Violet accent color for interactive elements
- Keep Geist Sans font, adjust weights for glass readability
- Existing layout structure preserved

## Success Criteria

- [x] All cards, headers, tabs, buttons, and containers use the glass card system — no flat/opaque holdovers
- [x] Dark gradient background with accent blobs visible behind glass elements
- [x] Text meets minimum 4.5:1 contrast ratio on glass surfaces
- [x] Charts render with updated color palette, visible against glass backgrounds
- [x] Hover effects on cards (lift + border brighten) and buttons (opacity change) work smoothly
- [x] Import page and file upload match dashboard glass aesthetic
- [x] Loading, empty, and error states styled with glass cards
- [x] No perceptible jank on scroll or hover
- [x] Dev server runs and displays the glassmorphism design: `npm run dev`
- [x] All existing tests pass: `npm run test`
- [x] Type check passes: `npm run typecheck`

## Phases

### Phase 1: Foundation — Global CSS Theme & Layout

**Goal**: Establish the dark glassmorphism foundation: gradient background, CSS custom properties for glass surfaces, and glass utility classes. After this phase, the app should show the dark gradient background with the existing (unstyled) content on top.

**Changes**:

- `src/app/globals.css` (~80 lines changed):
  - Remove the existing `:root` light theme block entirely (dark-only design)
  - Rewrite the `.dark` block as the new `:root` block with glassmorphism CSS variables:
    - `--background`: dark navy base (`#0a0a1a`)
    - `--foreground`: near-white (`rgba(255, 255, 255, 0.95)`)
    - `--card`: glass card background (`rgba(255, 255, 255, 0.06)`)
    - `--card-foreground`: near-white text
    - `--primary`: violet accent (`rgba(139, 92, 246, 0.80)`)
    - `--primary-foreground`: white
    - `--secondary`: subtle glass (`rgba(255, 255, 255, 0.04)`)
    - `--muted`: dim white (`rgba(255, 255, 255, 0.04)`)
    - `--muted-foreground`: `rgba(255, 255, 255, 0.60)`
    - `--accent`: glass highlight (`rgba(255, 255, 255, 0.08)`)
    - `--border`: glass border (`rgba(255, 255, 255, 0.10)`)
    - `--input`: glass input border (`rgba(255, 255, 255, 0.12)`)
    - `--ring`: violet focus ring (`rgba(139, 92, 246, 0.50)`)
    - `--destructive`: softened red (`#f87171`)
    - Update chart color variables: `--chart-1` through `--chart-5` to the spec palette (violet, cyan, emerald, amber, red)
  - Add gradient background on `body` using `@layer base`:
    ```css
    body {
      background: linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0d1b2a 100%);
      background-attachment: fixed;
      min-height: 100vh;
    }
    ```
  - Add fixed-position accent blobs using `body::before` and `body::after` pseudo-elements:
    - `::before`: top-left purple radial gradient (`rgba(120, 60, 200, 0.15)`)
    - `::after`: bottom-right teal radial gradient (`rgba(40, 180, 200, 0.12)`)
    - Both `position: fixed`, `pointer-events: none`, `z-index: 0`
  - Remove the `.dark` class block (no longer needed, dark-only)
  - Delete the old `:root` block (light theme)

- `src/app/layout.tsx` (~10 lines changed):
  - Remove `dark:` conditional class usage if any
  - Ensure body has `dark` class applied (or remove dark class dependency since we're rewriting :root to be the dark theme)
  - Keep Geist Sans and Geist Mono font loading as-is
  - Set `<html>` className to include dark theme or ensure the new CSS variables apply globally without needing a `.dark` class

**Verification**:
```bash
npm run dev &
# Visual: App should show dark gradient background with accent blobs
# Content may look broken (unstyled) until Phase 2
npm run typecheck
```

---

### Phase 2: Core UI Components — Glass Card System

**Goal**: Transform the four base UI components (Card, Button, Tabs, Progress) into glass-styled components using the three-tier system from the specification. After this phase, all existing card/button/tab/progress usages should automatically get the glass treatment.

**Changes**:

- `src/components/ui/card.tsx` (~30 lines changed):
  - `Card`: Replace `bg-card text-card-foreground ... rounded-xl border py-6 shadow-sm` with Tier 1 glass:
    ```
    bg-white/[0.06] text-white/95 backdrop-blur-[16px] border border-white/10
    rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] py-6
    ```
  - Add hover transition class: `transition-all duration-200`
  - `CardTitle`: Ensure `font-bold` (bump from `font-semibold` per spec for glass readability)
  - `CardDescription`: Use `text-white/60` instead of `text-muted-foreground`
  - Remove `@container` queries that reference old bg colors if any conflict

- `src/components/ui/button.tsx` (~25 lines changed):
  - Update CVA variant definitions:
    - `default` (Primary CTA): `bg-violet-500/80 text-white hover:bg-violet-500 border-0`
    - `destructive`: `bg-red-400/80 text-white hover:bg-red-400`
    - `outline`: `bg-white/[0.04] border border-white/12 text-white/80 hover:bg-white/[0.08] hover:text-white/95 backdrop-blur-sm`
    - `secondary`: `bg-white/[0.06] text-white/80 hover:bg-white/10 backdrop-blur-sm`
    - `ghost`: `text-white/60 hover:bg-white/[0.06] hover:text-white/95`
    - `link`: `text-violet-400 hover:text-violet-300 underline-offset-4`
  - Add `transition-all duration-150` to base classes
  - Update focus-visible ring to violet: `focus-visible:ring-violet-500/50`
  - Button border-radius: `rounded-[10px]`

- `src/components/ui/tabs.tsx` (~25 lines changed):
  - `TabsList` (default variant): Replace `bg-muted` with Tier 3 glass:
    ```
    bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-xl
    ```
  - `TabsTrigger`:
    - Base: `text-white/60 transition-all duration-150`
    - Active state (`data-[state=active]`): `bg-white/10 text-white/95` (remove old `bg-background`)
    - Hover: `hover:bg-white/[0.05] hover:text-white/80`
  - Remove dark-mode-specific overrides (`.dark` variants in data attributes)

- `src/components/ui/progress.tsx` (~10 lines changed):
  - Track: `bg-white/[0.08] rounded-full`
  - Indicator: `bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-300`
  - Remove old `bg-primary/20` and `bg-primary`

**Verification**:
```bash
npm run dev &
# Visual: All cards across the app should now be frosted glass
# Buttons should have glass/violet styling
# Tabs should be glass-styled
npm run typecheck
```

---

### Phase 3: Dashboard Pages — Headers, Layout, States

**Goal**: Update the main dashboard page and import page structural elements: headers, navigation, date tabs area, loading/error/empty states, and footer card. After this phase, the page layouts should be fully glassmorphic.

**Changes**:

- `src/app/page.tsx` (~50 lines changed):
  - Root wrapper: Replace `min-h-screen bg-background` with `min-h-screen relative z-10` (background comes from body gradient now)
  - Header: Apply Tier 2 glass treatment:
    ```
    bg-white/[0.08] backdrop-blur-[20px] border-b border-white/12
    shadow-[0_8px_32px_rgba(0,0,0,0.25)]
    ```
  - "Ralph" title: `text-white font-bold`
  - Preview badge: Update from `border-amber-300 bg-amber-50` to glass badge:
    ```
    border-amber-400/50 bg-amber-400/15 text-amber-400
    ```
  - Navigation link ("Import Data"): `text-white/60 hover:text-white/95 transition-colors duration-150`
  - Last-sync info: `text-white/40`
  - Date tabs section: Already styled by the Tabs component from Phase 2
  - Loading state card: Already glass from Card component; update text to `text-white/50`
  - Empty state: Glass card with `text-white/80` message and violet CTA button
  - Error state: Glass card with `text-white/80` message and red-tinted error detail
  - Footer card ("Want to update your data?"): Already glass from Card; ensure link uses violet accent

- `src/app/import/page.tsx` (~20 lines changed):
  - Root wrapper: `min-h-screen relative z-10` (same as dashboard)
  - Header: Same Tier 2 glass treatment as main dashboard header
  - "Import Health Data" title: `text-white font-bold`
  - Back link: `text-white/60 hover:text-white/95 transition-colors duration-150`
  - Instructions text: `text-white/60`
  - Container: Remove old `bg-background` references

- `src/components/import/SyncSetup.tsx` (~10 lines changed):
  - Card already gets glass from Phase 2
  - Update text colors: `text-muted-foreground` → `text-white/60`
  - Label text: `text-white/60`
  - Value text: `text-white/95 font-medium`

**Verification**:
```bash
npm run dev &
# Visual: Headers should be elevated glass, pages should have proper text contrast
# Loading/empty/error states should display as glass cards
# Badge, nav links, and footer should match spec
npm run typecheck
```

---

### Phase 4: Chart Components & Data Visualization

**Goal**: Update all chart components to use the glassmorphism color palette, glass-styled tooltips, and appropriate contrast for glass backgrounds. After this phase, all data visualizations should be visually cohesive with the glass theme.

**Changes**:

- `src/components/charts/FitnessScore.tsx` (~15 lines changed):
  - Update `getScoreHex()` function to use spec colors:
    - `score < 50`: `#f87171` (red-400, softened)
    - `score < 70`: `#fbbf24` (amber-400)
    - `score >= 70`: `#34d399` (emerald-400)
  - Radial bar background: Change `#e5e7eb` to `rgba(255, 255, 255, 0.06)`
  - Score text and trend text: Ensure white text works on glass card container
  - Trend indicator text: Use updated trend colors

- `src/components/charts/MetricCard.tsx` (~15 lines changed):
  - Card styling already handled by Phase 2
  - Update sparkline stroke from `#6b7280` to chart palette color (e.g., `#8b5cf6` violet)
  - Metric value: `text-white font-bold`
  - Metric label: `text-white/60 font-medium`
  - Add hover effect to card: `hover:-translate-y-0.5 hover:border-white/[0.16] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-200`

- `src/components/charts/TrendChart.tsx` (~20 lines changed):
  - CartesianGrid: `stroke="rgba(255,255,255,0.06)"` (barely visible grid)
  - XAxis/YAxis tick styling: `fill="rgba(255,255,255,0.40)"` fontSize 12
  - Area/line stroke colors: Use chart palette (`#8b5cf6`, `#06b6d4`, `#34d399`)
  - Area fill: Chart color at 10-15% opacity
  - Tooltip: Glass-styled with `backdrop-blur` background:
    ```
    contentStyle={{
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      color: 'rgba(255,255,255,0.95)'
    }}
    ```

- `src/components/charts/ProgressChart.tsx` (~15 lines changed):
  - Bar colors: Use spec score colors (`#34d399`, `#fbbf24`, `#f87171`)
  - Bar background: `rgba(255, 255, 255, 0.06)`
  - CartesianGrid/axes: Same glass treatment as TrendChart
  - Tooltip: Same glass tooltip styling

- `src/components/charts/ComparisonCard.tsx` (~15 lines changed):
  - Replace `bg-gray-50` stat boxes with Tier 3 glass: `bg-white/[0.04] rounded-xl`
  - Current value: `text-white font-bold text-lg`
  - Previous value: `text-white/50`
  - Replace `text-gray-600` / `text-gray-900` with glass text colors
  - Delta indicator: Use spec trend colors (`#34d399`, `#f87171`, `rgba(255,255,255,0.50)`)

- `src/components/charts/ChartErrorBoundary.tsx` (~5 lines changed):
  - Card already glass from Phase 2
  - Error text: `text-white/60` (replace `text-muted-foreground`)

- `src/lib/utils/formatters.ts` (~15 lines changed):
  - `getScoreColor()`: Update return values:
    - `score < 50`: `'text-red-400'`
    - `score < 70`: `'text-amber-400'`
    - `score >= 70`: `'text-emerald-400'`
  - `getScoreBgColor()`: Update to match:
    - `score < 50`: `'bg-red-400'`
    - `score < 70`: `'bg-amber-400'`
    - `score >= 70`: `'bg-emerald-400'`
  - `getTrendColor()`: Update:
    - `improving`: `'text-emerald-400'`
    - `stable`: `'text-white/50'`
    - `declining`: `'text-red-400'`

**Verification**:
```bash
npm run dev &
# Visual: All charts should use new color palette
# Tooltips should be glass-styled
# Score colors and trend indicators should match spec
# Sparklines, radial gauges, bar charts, area charts all updated
npm run typecheck
npm run test
```

---

### Phase 5: Dashboard Detail Components & Interactions

**Goal**: Update the dashboard detail views (Overview, CategoryDetail), the file upload component, and add hover interactions to all glass cards. After this phase, the entire app should be fully glassmorphic with all interaction states working.

**Changes**:

- `src/components/dashboard/Overview.tsx` (~15 lines changed):
  - Section spacing: Keep `space-y-8` (works well with glass cards)
  - Category card buttons: Style as glass interactive surfaces with hover lift:
    ```
    text-left w-full transition-all duration-200 hover:-translate-y-0.5
    ```
  - Section titles (if any): `text-white/95 font-bold`
  - Ensure grid gap works well visually with glass cards

- `src/components/dashboard/CategoryDetail.tsx` (~20 lines changed):
  - Grid layout: Keep `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`
  - Inner metric rows: Add dividers with `border-white/[0.06]`
  - Text colors: Replace `text-muted-foreground` → `text-white/60`, other text → `text-white/95`
  - Metric labels: `font-medium` for glass readability
  - Trend colors: Already updated via formatters.ts in Phase 4

- `src/components/import/FileUpload.tsx` (~40 lines changed):
  - Drop zone container: Glass card (Tier 1) with inner dashed border:
    - Default: `border-2 border-dashed border-white/15`
    - Dragging: `border-violet-500/60 bg-violet-500/[0.08]`
    - Replace `border-gray-300 hover:border-gray-400` → `border-white/15 hover:border-white/25`
  - Upload icon circle: `bg-white/[0.08]` with `text-white/60` icon
  - Upload text: `text-white/80` for primary, `text-white/40` for secondary
  - Progress section: Already styled by Progress component
  - Results display:
    - Replace `bg-gray-50` stat boxes with `bg-white/[0.04] rounded-xl`
    - Replace `text-gray-600` → `text-white/60`
    - Replace `text-gray-900` → `text-white/95`
  - Error/success icons: Keep lucide icons, ensure colors match spec palette
  - Success indicator colors: `text-emerald-400`
  - Error indicator colors: `text-red-400`

- Add hover interactions to card components (back in `src/components/ui/card.tsx`, ~3 lines):
  - Add to Card base classes: `transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]`
  - Note: This makes ALL cards interactive on hover. If some cards shouldn't lift (e.g., error boundary), they can override with `hover:translate-y-0`

**Verification**:
```bash
npm run dev &
# Visual: Full glassmorphism across entire app
# Hover over cards — should lift slightly with brighter borders
# Import page drag-drop zone should glow on drag
# All text readable, all charts colored correctly
# Navigate between dashboard and import — consistent glass treatment
npm run typecheck
npm run test
```

---

### Phase 6: Polish — Final Tweaks, Focus States, Responsive Check

**Goal**: Final pass to ensure consistency, add focus-visible states, verify responsive behavior, and clean up any remaining flat/opaque elements. Run all verification commands.

**Changes**:

- Global focus-visible styling in `src/app/globals.css` (~5 lines):
  - Add a global `:focus-visible` style or verify components use violet focus ring:
    ```css
    *:focus-visible {
      outline: 3px solid rgba(139, 92, 246, 0.50);
      outline-offset: 2px;
    }
    ```

- Button `:active` pressed state in `src/components/ui/button.tsx` (~3 lines):
  - Add `active:opacity-80` or `active:scale-[0.98]` for click feedback

- Review and fix any remaining hardcoded colors:
  - Search for `gray-50`, `gray-100`, `gray-200`, `gray-300`, `gray-400`, `gray-500`, `gray-600`, `gray-900` across all components and replace with glass equivalents
  - Search for `bg-background` usages that shouldn't be opaque anymore
  - Search for `text-muted-foreground` and replace with explicit `text-white/60`
  - Search for `border-b` without glass border color and add `border-white/10`

- Responsive verification (no code changes expected, just verification):
  - Verify glass effects at mobile viewport widths
  - Verify text readability at all sizes
  - Verify chart rendering on narrow screens

- Live preview URL confirmation:
  - Start dev server and confirm the preview URL works
  - Verify all pages render correctly

**Verification**:
```bash
# Run all checks
npm run typecheck
npm run test

# Start dev server for live preview
npm run dev &

# Search for any remaining non-glass colors (should return 0 results in component/page files)
grep -rn "bg-gray-" src/components/ src/app/ || echo "No remaining gray backgrounds"
grep -rn "text-gray-" src/components/ src/app/ || echo "No remaining gray text colors"
grep -rn "border-gray-" src/components/ src/app/ || echo "No remaining gray borders"

# Verify the app builds cleanly
npm run build
```

## Testing Strategy

### Automated Testing
- **Existing tests**: Run `npm run test` — all existing tests should pass unchanged since this is a purely visual change (tests cover API routes, analytics logic, and mock data, not UI rendering)
- **Type checking**: Run `npm run typecheck` — all TypeScript types should still be valid
- **Build check**: Run `npm run build` — Next.js build should succeed without errors

### Manual Visual Testing (via Live Preview)
The dev server must be running for manual monitoring. Key checkpoints:

1. **Dashboard page**: Gradient background visible, all cards are glass, header is elevated glass, tabs work
2. **Fitness score gauge**: Colors correct (green/amber/red), radial bar visible on glass
3. **Metric cards**: Sparklines visible, hover lift works, trend badges colored correctly
4. **Charts**: Area/line charts have correct colors, grid lines subtle, tooltips are glass
5. **Category detail**: Metric rows readable, comparison cards glass-styled
6. **Import page**: Header matches dashboard, drop zone styled correctly
7. **File upload interaction**: Drag state shows glow border, progress bar is gradient
8. **States**: Test loading, empty, and error states visually
9. **Responsive**: Check mobile viewport (cards stack, glass still looks good)
10. **Keyboard navigation**: Focus rings visible (violet) on tab navigation

### Contrast Verification
- Primary text (`rgba(255,255,255,0.95)`) on glass card (`rgba(255,255,255,0.06)` over dark gradient): should exceed 4.5:1
- Secondary text (`rgba(255,255,255,0.60)`) on glass: should meet 4.5:1 for large text
- Chart colors on glass: all spec palette colors were chosen for visibility on dark backgrounds

## Rollback Plan

All changes are purely CSS/className based. To rollback:

1. `git revert <commit-hash>` — Revert the implementation commit(s)
2. No database migrations, API changes, or dependency changes to unwind
3. The app returns to its original flat design immediately

Alternatively, since this is a branch-based workflow:
1. Simply discard the `dawn/TEST-AGI-1` branch
2. The `main` branch remains untouched

## Notes

### For the Implementer

1. **Start the dev server first**: Run `npm run dev` before making changes so you can verify each phase visually. The preview URL is available at the configured Daytona proxy URL on port 3000.

2. **Dark-only design**: We are removing the light theme entirely. The `:root` CSS variables become the dark glass theme. Remove the `.dark` class block. This simplifies everything — no need to maintain two sets of variables.

3. **Tailwind v4 arbitrary values**: This project uses Tailwind v4. Use arbitrary value syntax for precise glass values:
   - `bg-white/[0.06]` for 6% white background
   - `backdrop-blur-[16px]` for specific blur radius
   - `shadow-[0_8px_32px_rgba(0,0,0,0.2)]` for custom shadows
   - `border-white/10` for 10% white border

4. **Chart tooltips**: Recharts tooltips accept `contentStyle` and `wrapperStyle` props for custom styling. Use inline styles for the glass tooltip effect since Recharts doesn't use Tailwind classes.

5. **Pseudo-element accent blobs**: The `body::before` and `body::after` for gradient accent blobs need `position: fixed`, `pointer-events: none`, and appropriate `z-index` so they sit behind all content but create the colored background variation that makes glass effects visible.

6. **Content z-index**: The main page content (root `<div>`) needs `relative z-10` to sit above the accent blob pseudo-elements.

7. **Card hover specificity**: Adding hover effects to the base Card component means ALL cards lift on hover. For cards that should NOT lift (e.g., the error boundary fallback card), override with `className="hover:translate-y-0"`.

8. **Test suite safety**: No existing tests reference visual/styling classes, so changing classNames won't break tests. Run `npm run test` after each phase to confirm.

### File Change Summary

| File | Phase | Est. Lines Changed |
|------|-------|--------------------|
| `src/app/globals.css` | 1, 6 | ~85 |
| `src/app/layout.tsx` | 1 | ~10 |
| `src/components/ui/card.tsx` | 2, 5 | ~33 |
| `src/components/ui/button.tsx` | 2, 6 | ~28 |
| `src/components/ui/tabs.tsx` | 2 | ~25 |
| `src/components/ui/progress.tsx` | 2 | ~10 |
| `src/app/page.tsx` | 3 | ~50 |
| `src/app/import/page.tsx` | 3 | ~20 |
| `src/components/import/SyncSetup.tsx` | 3 | ~10 |
| `src/components/charts/FitnessScore.tsx` | 4 | ~15 |
| `src/components/charts/MetricCard.tsx` | 4 | ~15 |
| `src/components/charts/TrendChart.tsx` | 4 | ~20 |
| `src/components/charts/ProgressChart.tsx` | 4 | ~15 |
| `src/components/charts/ComparisonCard.tsx` | 4 | ~15 |
| `src/components/charts/ChartErrorBoundary.tsx` | 4 | ~5 |
| `src/lib/utils/formatters.ts` | 4 | ~15 |
| `src/components/dashboard/Overview.tsx` | 5 | ~15 |
| `src/components/dashboard/CategoryDetail.tsx` | 5 | ~20 |
| `src/components/import/FileUpload.tsx` | 5 | ~40 |
| **Total** | | **~461** |

### Estimated Scope
~461 lines of changes across 19 files. No new files created. All changes are CSS class modifications and inline style updates. Well within single-session implementation capacity.
