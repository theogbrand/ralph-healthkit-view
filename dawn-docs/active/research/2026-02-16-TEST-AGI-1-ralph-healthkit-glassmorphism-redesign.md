# Research: Ralph HealthKit View (Glassmorphism Design Style)

**Issue**: TEST-AGI-1
**Date**: 2026-02-16
**Status**: Complete

## Summary

Redesign the Ralph Apple Health Dashboard with a Glassmorphism design style. This involves updating the entire visual layer — CSS variables, base UI components, page layouts, chart styling, fonts, and interactions — to create a frosted-glass aesthetic with translucent cards, backdrop blur, gradient backgrounds, refined typography, and smooth micro-interactions. The app is a Next.js 16 + Tailwind CSS 4 + Recharts dashboard with ~15 UI component files.

## Requirements Analysis

From the issue description:
1. **Glassmorphism Design Style**: Frosted-glass card effects with `backdrop-blur`, semi-transparent backgrounds, subtle borders, and layered depth
2. **Styling**: Complete visual overhaul of color palette, card styles, shadows, and backgrounds
3. **Fonts**: Typography refresh (currently using Geist Sans/Mono — may swap or enhance)
4. **Interactions**: Micro-interactions, hover effects, transitions, and animations
5. **Live Preview**: Dev server running so changes can be monitored in real time

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/globals.css` | 1-126 | Global styles, CSS variables, Tailwind theme | **PRIMARY** — All color variables, theme definition, base layer styles |
| `src/app/layout.tsx` | 1-35 | Root HTML layout, font loading | Modify for background gradient, possible font swap |
| `src/app/page.tsx` | 1-206 | Main dashboard page (client-side) | Update header, loading/error/empty states, footer styling |
| `src/app/import/page.tsx` | 1-57 | Import page | Update header and layout to match new theme |
| `src/components/ui/card.tsx` | 1-93 | Base Card component (used everywhere) | **PRIMARY** — Add glassmorphism classes (backdrop-blur, transparency, border) |
| `src/components/ui/button.tsx` | 1-65 | Button component (CVA variants) | Update variant styles for glass aesthetic |
| `src/components/ui/tabs.tsx` | 1-92 | Tabs component (Radix UI) | Update tab list background and trigger styles |
| `src/components/ui/progress.tsx` | 1-32 | Progress bar | Update for glass style |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial fitness score gauge | Update colors, background ring color |
| `src/components/charts/MetricCard.tsx` | 1-51 | KPI metric card with sparkline | Inherits from Card — may need sparkline color updates |
| `src/components/charts/ComparisonCard.tsx` | 1-47 | Week comparison card | Inherits from Card — check text contrast |
| `src/components/charts/TrendChart.tsx` | 1-84 | Area/line trend chart | Update grid, tooltip styling, area fill |
| `src/components/charts/ProgressChart.tsx` | 1-51 | Horizontal bar chart | Update bar colors, tooltip |
| `src/components/charts/ChartErrorBoundary.tsx` | ~20 | Error boundary | No styling changes needed |
| `src/components/dashboard/Overview.tsx` | 1-111 | Main dashboard layout | Spacing, section styling |
| `src/components/dashboard/CategoryDetail.tsx` | 1-90 | Detailed category metrics | Heading styles, grid layout |
| `src/components/dashboard/RunningMetrics.tsx` | 1-15 | Running category wrapper | Pass-through, no changes |
| `src/components/dashboard/GymMetrics.tsx` | 1-15 | Gym category wrapper | Pass-through, no changes |
| `src/components/import/FileUpload.tsx` | 1-292 | Drag-drop file upload | Update drop zone, progress, results cards |
| `src/lib/utils/formatters.ts` | 1-76 | Score/trend color utilities | Update `getScoreColor`, `getScoreBgColor`, `getTrendColor` if palette changes |
| `src/lib/utils.ts` | ~5 | cn() utility | No changes needed |
| `src/config/metrics.ts` | - | Metrics configuration | No changes needed |

## Code Patterns and Conventions

### Tailwind CSS v4 Pattern
The project uses Tailwind CSS v4 with the new `@theme inline` syntax and OKLch color space CSS custom properties. All theming goes through CSS variables defined in `globals.css`.

```css
/* From src/app/globals.css:6-47 */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  /* ... maps CSS vars to Tailwind tokens */
}
```

### Color Variable Pattern
Colors use `:root` for light mode and `.dark` class for dark mode, using OKLch:

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
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  /* ... */
}
```

### Component Pattern (shadcn/ui style)
Components use `cn()` utility for class merging and data-slot attributes:

```tsx
// From src/components/ui/card.tsx:5-16
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

### CVA Variant Pattern (Buttons)
Buttons use `class-variance-authority` for variant management:

```tsx
// From src/components/ui/button.tsx:7-39
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-background shadow-xs hover:bg-accent ...",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground ...",
        // ...
      },
    },
  }
)
```

### Chart Pattern (Recharts)
Charts use Recharts `ResponsiveContainer` wrapper:

```tsx
// From src/components/charts/TrendChart.tsx:48-82
<ResponsiveContainer width="100%" height={300}>
  <Chart data={data}>
    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
    <XAxis dataKey="date" tickFormatter={formatDateTick} />
    <YAxis tick={{ fontSize: 12 }} width={40} />
    <Tooltip ... />
    <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.15} />
  </Chart>
</ResponsiveContainer>
```

### Font Loading Pattern
Fonts loaded via `next/font/google` in layout:

```tsx
// From src/app/layout.tsx:5-13
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### Import/Export Pattern
- Barrel exports from `index.ts` files in `charts/` and `dashboard/` directories
- Components use named exports
- UI components use function declarations (not arrow functions)

## Integration Points

### Key Interfaces
```typescript
// From src/types/analytics.ts (key types used by dashboard)
type DateRange = '30d' | '60d' | '90d' | '365d';
type TrendDirection = 'improving' | 'stable' | 'declining';

interface DashboardData {
  overall_score: number | null;
  overall_trend: TrendDirection;
  total_records: number;
  categories: Record<string, CategoryData>;
  last_sync: string | null;
}

interface CategoryData {
  name: string;
  score: number;
  trend: TrendDirection;
  metrics: MetricSummary[];
  weekComparison?: WeekComparisonMetric[];
}

interface MetricSummary {
  label: string;
  value: number | null;
  unit: string;
  trend: TrendDirection;
  change_percent: number | null;
  sparkline_data: number[];
}
```

### Formatter Utilities
```typescript
// From src/lib/utils/formatters.ts:49-75
// These return Tailwind class strings — must update if color palette changes
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

### Hardcoded Color Hex Values
Several components use hardcoded hex colors that must be updated for glassmorphism:

| Location | Color | Usage |
|----------|-------|-------|
| `FitnessScore.tsx:13-16` | `#ef4444`, `#eab308`, `#22c55e` | Score gauge colors (red/yellow/green) |
| `FitnessScore.tsx:54` | `#e5e7eb` | Radial bar background ring |
| `MetricCard.tsx:38` | `#6b7280` | Sparkline stroke color |
| `TrendChart.tsx:31` | `#3b82f6` | Default chart line color |
| `ProgressChart.tsx:11-14` | `#ef4444`, `#eab308`, `#22c55e` | Bar chart score colors |
| `CategoryDetail.tsx:76` | `#6366f1` | Metric detail chart color (indigo) |
| `Overview.tsx:103` | `#3b82f6` | Score trend chart color (blue) |

### Data Flow
1. `page.tsx` fetches from `/api/analytics?range=X`
2. Response parsed → state stored → passed to `<Overview data={data} />`
3. Overview renders: FitnessScore, MetricCards, CategoryDetail, ProgressChart, TrendChart
4. All cards built on `<Card>` base component
5. All charts built on Recharts `<ResponsiveContainer>`

## Testing Infrastructure

### Test Runner & Commands
- Runner: Vitest 4.x
- Config: `vitest.config.ts`
- Run all: `npm test` (or `vitest run`)
- Run specific: `npx vitest run <pattern>`

### Existing Test Files
- `__tests__/` directory with tests for analytics, parsers, formatters
- Tests are logic-focused (not visual), so glassmorphism changes shouldn't break them

### Test Patterns
Tests use vitest's `describe/it/expect` pattern. Since this is a purely visual/styling change, existing tests should pass without modification. The only risk is if `formatters.ts` color utility functions are changed — those should be verified.

## Implementation Considerations

### Glassmorphism Design System

#### Core Glass Effect CSS
The fundamental glassmorphism pattern for Tailwind:
```
backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg
```

For dark mode (which is the primary glassmorphism target):
```
backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl
```

#### Recommended Color Palette
- **Background**: Deep gradient (dark blue/purple mesh gradient)
- **Card glass**: `bg-white/5` to `bg-white/10` with `backdrop-blur-xl`
- **Border**: `border-white/10` to `border-white/20`
- **Text primary**: `white` or very light gray
- **Text secondary**: `white/60` to `white/70`
- **Accent colors**: Neon/vibrant tones that pop against glass (cyan, emerald, violet)
- **Score colors**: Keep red/yellow/green but use more saturated/glowing versions

#### Background Gradient Options
Option A: CSS mesh gradient on body:
```css
body {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}
```

Option B: Animated gradient with multiple color stops:
```css
body {
  background: linear-gradient(
    -45deg,
    #0a0a1a, #1a0a2e, #0a1a2e, #0a0a1a
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}
```

Option C: Static gradient with decorative blurred orbs (floating colored circles with blur):
```css
/* Decorative orbs positioned absolutely behind content */
.orb { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
```

#### Font Enhancement
Current: Geist Sans (clean, modern — works well for glassmorphism)
Options:
- Keep Geist Sans (recommended — it's already a premium modern font)
- Add Inter as fallback
- Consider SF Pro-like weight variations for hierarchy

#### Micro-Interactions
- Card hover: subtle scale + glow (`hover:scale-[1.02] hover:shadow-lg/20`)
- Button hover: glass brightening effect
- Tab transitions: smooth background slide
- Chart hover: tooltip with glass effect
- Category expand/collapse: smooth height animation
- Loading state: subtle pulse/shimmer animation

### Approach

**Phase 1: Foundation (globals.css + layout.tsx)**
- Switch to dark-first design (glassmorphism works best on dark backgrounds)
- Define new CSS variables for glass effects
- Add gradient background to body/layout
- Add optional decorative orbs/shapes

**Phase 2: Base Components (ui/ folder)**
- Update `card.tsx` — glass effect as default
- Update `button.tsx` — glass variants
- Update `tabs.tsx` — glass tab list
- Update `progress.tsx` — glass progress bar

**Phase 3: Dashboard Components**
- Update `page.tsx` — header glass effect, overall layout
- Update chart components — colors, tooltips, grid styles
- Update `Overview.tsx` — section spacing for glass cards
- Update `CategoryDetail.tsx` — heading styles
- Update `import/page.tsx` and `FileUpload.tsx`

**Phase 4: Interactions & Polish**
- Add hover/focus transitions to cards and buttons
- Add animation keyframes (gradient shift, shimmer)
- Ensure all text has proper contrast against glass
- Responsive adjustments

### Risks

1. **Text contrast**: Glass backgrounds can make text hard to read — need careful contrast ratios
2. **Chart readability**: Recharts elements (axes, grid, tooltips) need adequate contrast against glass
3. **Backdrop-blur performance**: Heavy use of `backdrop-filter: blur()` can impact performance on low-end devices
4. **Light mode support**: Glassmorphism is primarily a dark-mode aesthetic; light mode may need different treatment
5. **Hardcoded hex colors**: Multiple chart components use hardcoded hex values that need coordinated updates
6. **Browser support**: `backdrop-filter` is well-supported in modern browsers but needs `-webkit-` prefix for some

### Scope Estimate
- Files to modify: ~13-15 files
- Files to create: 0 (all modifications to existing files)
- Estimated lines of change: ~300-500 lines (mostly CSS variable changes and Tailwind class updates)

## Specification Assessment

This feature NEEDS a UX specification. Reasons:
- **Significant UX changes**: Complete visual redesign of the entire dashboard
- **New design language**: Glassmorphism introduces a fundamentally different visual system
- **Multiple interaction patterns**: Hover effects, animations, transitions need design decisions
- **Color palette decisions**: Need to choose specific gradient colors, glass opacity levels, accent colors
- **Font and typography decisions**: Weight hierarchy, sizes, colors against glass backgrounds
- **Chart integration**: How Recharts elements look inside glass containers needs careful design

However, the user has specifically requested "Glassmorphism Design Style" which is a well-known design pattern with established conventions. The specification stage can define:
- Exact color values
- Blur/opacity levels
- Animation timing
- Typography scale
- Component-specific glass treatments

**Needs Specification**: Yes

## Questions for Human Review

1. **Dark mode only or both?** Glassmorphism works best on dark backgrounds. Should we:
   - Make the app dark-mode only (simplest, best glass effect)
   - Support both light and dark (light mode would have a different, lighter glass treatment)

2. **Background style**: Prefer a static gradient, animated gradient, or gradient + floating orbs?

3. **Font**: Keep Geist Sans or switch to a different font family?

4. **Accent color scheme**: Current app uses green/yellow/red for scores. Should we keep this or switch to more vibrant neon tones (cyan/emerald/violet)?

5. **Animation intensity**: Minimal (just hover transitions) or rich (gradient animations, loading shimmers, card entrance animations)?

## Next Steps

Ready for specification phase. The specification should define:
1. Exact glassmorphism parameters (blur, opacity, border opacity)
2. Background gradient colors
3. Color palette for scores and accents
4. Animation/interaction specifications
5. Typography decisions
6. Component-by-component visual treatment
