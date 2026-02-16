# Research: Ralph HealthKit View (Glassmorphism Design Style)

**Issue**: TEST-AGI-1
**Date**: 2026-02-16
**Status**: Complete

## Summary

The task requires a complete Glassmorphism design style UI makeover of the Ralph Apple Health fitness dashboard. This includes updating all visual styling (backgrounds, cards, borders, shadows), fonts, colors, interactions, and animations across the entire app. The current app uses a standard shadcn/ui + Tailwind CSS design with opaque cards, flat backgrounds, and minimal visual effects. The target is a modern frosted-glass aesthetic with semi-transparent elements, backdrop blur, gradient backgrounds, subtle borders, and smooth interactions.

## Requirements Analysis

From the issue description:
1. **Glassmorphism Design Style** — Apply frosted-glass effects to all UI cards and surfaces
2. **Styling** — Update backgrounds, card styles, borders, shadows, color palette
3. **Fonts** — Update typography choices and hierarchy
4. **Interactions** — Add hover effects, transitions, and micro-interactions
5. **Dashboard app** — The primary target is the main dashboard (`page.tsx`) and all its components
6. **Live Preview** — A running dev server must be available for manual monitoring of changes

### Scope of Visual Changes

The glassmorphism makeover touches virtually every visual surface in the app:
- Global CSS variables and theme colors
- Root layout background
- All Card components (used across the entire app)
- Header and navigation
- Tab selectors
- Chart containers and styling
- Button variants
- Progress bars
- Import page and file upload area
- Loading, error, and empty states

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/globals.css` | 1-126 | Global CSS theme variables, Tailwind config | **Core** — Must redefine all color variables, add glass utility classes, gradient backgrounds |
| `src/app/layout.tsx` | 1-35 | Root HTML layout, font setup | **Core** — May need font changes, body class for gradient background |
| `src/app/page.tsx` | 1-205 | Main dashboard page | **Core** — Header, nav, date tabs, loading/error/empty states, footer card |
| `src/components/ui/card.tsx` | 1-93 | Card component (used everywhere) | **Core** — Must add glass effect: backdrop-blur, semi-transparent bg, border |
| `src/components/ui/button.tsx` | 1-64 | Button variants | **Modify** — Update all variants for glass aesthetic |
| `src/components/ui/tabs.tsx` | 1-92 | Tab navigation | **Modify** — Glass tab list and triggers |
| `src/components/ui/progress.tsx` | 1-32 | Progress bar | **Modify** — Glass-styled progress bar |
| `src/components/dashboard/Overview.tsx` | 1-110 | Dashboard layout orchestrator | **Modify** — Section spacing, card wrapping |
| `src/components/dashboard/CategoryDetail.tsx` | 1-90 | Category detail view | **Modify** — Glass-styled metric cards and layout |
| `src/components/dashboard/RunningMetrics.tsx` | ~20 | Running metrics wrapper | **Review** — May need wrapper styling |
| `src/components/dashboard/GymMetrics.tsx` | ~20 | Gym metrics wrapper | **Review** — May need wrapper styling |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial score gauge | **Modify** — Score container glass styling, colors |
| `src/components/charts/MetricCard.tsx` | 1-50 | Metric display card | **Modify** — Glass card with updated sparkline colors |
| `src/components/charts/TrendChart.tsx` | 1-84 | Area/line trend chart | **Modify** — Chart colors, grid styling, tooltip glass effect |
| `src/components/charts/ProgressChart.tsx` | 1-50 | Horizontal bar chart | **Modify** — Chart colors, tooltip styling |
| `src/components/charts/ComparisonCard.tsx` | 1-47 | Week comparison card | **Modify** — Glass card styling |
| `src/components/charts/ChartErrorBoundary.tsx` | ~30 | Error boundary | **Review** — Error display styling |
| `src/app/import/page.tsx` | 1-56 | Import page | **Modify** — Header, layout, glass cards |
| `src/components/import/FileUpload.tsx` | 1-291 | File upload UI | **Modify** — Drag-drop area glass styling, results display |
| `src/lib/utils/formatters.ts` | 1-75 | Color/formatting utilities | **Modify** — Score/trend color functions may need updated palette |
| `src/lib/utils.ts` | 1-6 | cn() utility | **No change** — Used as-is |
| `src/types/analytics.ts` | 1-47 | TypeScript types | **No change** — No visual impact |
| `src/config/metrics.ts` | ~100 | Metric configuration | **No change** — No visual impact |

## Code Patterns and Conventions

### Component Structure
All UI components follow the shadcn/ui pattern: functional components using `cn()` for class merging, `data-slot` attributes for targeting, and props spreading.

```typescript
// Example from src/components/ui/card.tsx:5-16
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}
```

### CSS Variable Pattern
The app uses CSS custom properties mapped through Tailwind v4's `@theme inline` block. All colors use oklch color space:

```css
/* From src/app/globals.css:49-82 */
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --border: oklch(0.922 0 0);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --card: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  /* ... */
}
```

### Chart Color Pattern
Charts use hardcoded hex colors (not CSS variables):

```typescript
// From src/components/charts/FitnessScore.tsx:12-16
function getScoreHex(score: number): string {
  if (score < 50) return '#ef4444';
  if (score < 70) return '#eab308';
  return '#22c55e';
}
```

### Tailwind Class Pattern
Components use extensive Tailwind utility classes composed with `cn()`:

```typescript
// From src/components/ui/button.tsx:12-13
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
}
```

### Import/Export Pattern
All components use named exports, barrel files for directories:

```typescript
// From src/components/charts/index.ts
export { FitnessScore } from './FitnessScore';
export { MetricCard } from './MetricCard';
// ...

// From src/components/dashboard/index.ts
export { Overview } from './Overview';
// ...
```

### Page Layout Pattern
Pages follow a consistent container + header + main structure:

```tsx
// From src/app/page.tsx:87-203
<div className="min-h-screen bg-background">
  <header className="border-b">
    <div className="container mx-auto flex items-center justify-between px-6 py-4">
      {/* Nav content */}
    </div>
  </header>
  <main className="container mx-auto px-6 py-8">
    {/* Page content */}
  </main>
</div>
```

## Integration Points

### Key Interfaces (no changes needed for visual work)

```typescript
// From src/types/analytics.ts:37-47
export interface DashboardData {
  overall_score: number | null;
  overall_trend: 'improving' | 'stable' | 'declining';
  categories: {
    running: CategoryScore;
    gym: CategoryScore;
  };
  last_sync: string | null;
}

export type DateRange = '30d' | '60d' | '90d' | '365d';
```

### Color/Formatting Functions That May Need Updates

```typescript
// From src/lib/utils/formatters.ts:49-75
export function getScoreColor(score: number): string {
  if (score < 50) return 'text-red-500';
  if (score < 70) return 'text-yellow-500';
  return 'text-green-500';
}

export function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return 'text-green-500';
    case 'stable': return 'text-gray-500';
    case 'declining': return 'text-red-500';
  }
}
```

### Data Flow (no changes needed)
The visual layer consumes data from `/api/analytics` or mock data via `getMockDashboardData()`. The glassmorphism makeover is purely presentational — no API, data, or business logic changes required.

## Testing Infrastructure

### Test Runner & Commands
- Runner: Vitest
- Run all: `npm run test`
- Run specific: `npx vitest run __tests__/path/to/test.test.ts`
- Config: `vitest.config.ts`

### Existing Test Files
- `__tests__/api/analytics-route.test.ts` — API route testing
- `__tests__/integration/import-pipeline.test.ts` — Import pipeline integration tests
- `__tests__/lib/analytics/fitness-score.test.ts` — Fitness scoring algorithm tests
- `__tests__/lib/mock/dashboard-preview.test.ts` — Mock data generation tests

### Test Patterns
```typescript
// Tests use Vitest with describe/it/expect pattern
// Primarily test backend logic, not UI rendering
// No visual regression or component rendering tests exist
```

### Test Impact
Since this is a purely visual/styling change, existing tests should not be affected. No new tests are strictly required, but visual smoke testing via the live preview is essential.

## Implementation Considerations

### Glassmorphism Core CSS Techniques

The following CSS properties form the foundation of glassmorphism:

1. **`backdrop-filter: blur(10px)`** — Frosted glass blur effect on content behind the element
2. **`background: rgba(255, 255, 255, 0.1)`** — Semi-transparent background (light mode)
3. **`background: rgba(17, 25, 40, 0.75)`** — Semi-transparent dark background (dark mode)
4. **`border: 1px solid rgba(255, 255, 255, 0.18)`** — Subtle light border for edge definition
5. **`box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1)`** — Soft depth shadow
6. **`border-radius: 16px`** — Larger rounded corners (typical for glass cards)

### Tailwind CSS Implementation

Tailwind v4 (used in this project) supports these natively:
- `backdrop-blur-md` / `backdrop-blur-lg` — Blur effects
- `bg-white/10` — Semi-transparent backgrounds with opacity
- `border-white/20` — Semi-transparent borders
- `shadow-lg` / `shadow-xl` — Depth shadows
- `rounded-2xl` / `rounded-3xl` — Larger radii

### Required Background Strategy

Glassmorphism requires a **vivid, colorful background** behind the glass elements for the effect to be visible. The current app has a flat `bg-background` (white/dark). Options:

1. **Gradient background** — Multi-color gradient on the body/root
2. **Animated gradient** — Slowly shifting gradient for visual interest
3. **Mesh gradient** — Complex gradient with multiple color stops
4. **Decorative blobs** — Floating colored shapes behind content

**Recommendation**: A dark-themed mesh/multi-stop gradient with accent color blobs provides the best glassmorphism showcase while maintaining readability for a data-heavy fitness dashboard.

### Font Considerations

Current fonts: Geist Sans + Geist Mono (loaded via `next/font/google`). Options:
1. **Keep Geist** — Clean, modern, works well with glass aesthetic
2. **Switch to Inter** — Very popular for dashboards, excellent readability
3. **Use SF Pro Display** — Apple-native feel for health app, but licensing concerns

**Recommendation**: Keep Geist Sans (already loaded, modern, pairs well with glass aesthetic) but adjust font weights and sizes for better hierarchy on glass surfaces.

### Performance Considerations

- `backdrop-filter: blur()` is GPU-intensive
- Limit to card-level elements, not every small component
- Keep blur values at 10-16px (not higher)
- Avoid animating blur properties
- Test on mobile viewport

### Accessibility Considerations

- Ensure text contrast ratio of 4.5:1 minimum on glass surfaces
- Glass backgrounds need sufficient opacity for text readability
- Consider adding slightly higher opacity for text-heavy cards
- Chart colors need to remain distinguishable on glass backgrounds

### Approach

The implementation should follow this order:
1. **Phase 1: Foundation** — globals.css theme overhaul (gradient background, glass CSS variables, glass utility classes)
2. **Phase 2: Core Components** — Card, Button, Tabs, Progress UI components
3. **Phase 3: Dashboard Pages** — page.tsx, layout.tsx, import/page.tsx (headers, footers, layout containers)
4. **Phase 4: Chart Components** — FitnessScore, MetricCard, TrendChart, ProgressChart, ComparisonCard
5. **Phase 5: Detail Components** — CategoryDetail, ComparisonCard, FileUpload, interactions/animations
6. **Phase 6: Polish** — Hover effects, transitions, micro-interactions, responsive testing

### Risks
- **Readability on glass surfaces** — Text on semi-transparent backgrounds can be hard to read; need careful opacity tuning
- **Chart visibility** — Recharts renders SVG elements; chart colors must contrast well against glass backgrounds
- **Dark mode consistency** — Glass effects behave differently in light vs dark; need to test both
- **Performance on mobile** — Multiple backdrop-blur elements can cause jank
- **Tailwind v4 compatibility** — Some glass utilities may need custom CSS rather than pure utility classes

### Scope Estimate
- Files to modify: ~18 files
- Files to create: 0 (all changes are to existing files)
- Estimated lines of change: 400-600 lines across all files

## Specification Assessment

This feature **needs a UX specification** before planning. Reasons:

1. **Significant UX changes** — Complete visual overhaul of every screen and component
2. **Multiple design decisions** — Background gradient colors, glass opacity levels, blur intensities, border treatments, color palette choices, animation timings, hover state designs
3. **New interaction patterns** — Hover glass effects, transition animations, glass depth layering
4. **Dark mode design** — Glass effects need careful dark mode tuning (different from standard dark mode)
5. **Chart styling** — Data visualization colors need to work harmoniously with glass surfaces
6. **Typography hierarchy** — Font weights and sizes need adjustment for readability on glass

**Needs Specification**: Yes

A specification phase should define:
- Exact background gradient colors and pattern
- Card glass opacity and blur values (light and dark modes)
- Color palette for glass surfaces, text, borders, and accents
- Chart color scheme that complements the glass aesthetic
- Interaction states (hover, active, focus) for glass elements
- Animation timing and easing curves
- Typography scale and weight adjustments
- Mobile-specific considerations

## Questions for Human Review

1. Should the app use a **dark-only theme** (common for glassmorphism) or support **both light and dark modes**?
2. What **color palette** is preferred for the gradient background? (e.g., deep purple-blue, teal-indigo, warm sunset tones)
3. Should **animations** be subtle or prominent? (e.g., hover glow effects, floating background elements)
4. Is the **import page** also in scope, or just the main dashboard?
5. Should the Geist font be kept or replaced?

## Next Steps

Ready for **specification phase** (∞ Needs Specification). A PM/designer perspective is needed to define the exact visual treatment — color palette, opacity values, animation intensity, and interaction patterns — before the implementation plan can be created.

## Live Preview

The dev server is running and accessible at the Daytona preview URL for manual monitoring of changes:
- **Preview URL**: https://3000-ajirhjatmzpsrym1.proxy.daytona.works

The app currently shows the standard (non-glassmorphism) design with preview/mock data.
