# Research: Ralph HealthKit View (Glassmorphism Design Style)

**Issue**: TEST-AGI-1
**Date**: 2026-02-16
**Status**: Complete

## Summary

Redesign the Ralph Apple Health Dashboard with a Glassmorphism Design Style, transforming the current flat/solid shadcn/ui aesthetic into a frosted-glass, translucent, depth-layered UI. This involves updating the CSS theme system (globals.css), all UI primitives (Card, Button, Tabs, Progress), chart containers, page layouts, background gradient mesh, typography enhancements, and adding micro-interaction animations. The app uses mock/preview data by default so no Apple Health import is required for visual development.

## Requirements Analysis

From the issue description:

1. **Glassmorphism Design Style UI Makeover** - Apply glassmorphism principles:
   - Frosted glass effect (translucent backgrounds with backdrop-blur)
   - Layered depth with subtle borders (semi-transparent white borders)
   - Colorful gradient backgrounds behind glass panels
   - Soft shadows for floating appearance
   - Clean, modern typography with varied weights

2. **Styling** - Complete color system overhaul:
   - Replace solid OKLch backgrounds with semi-transparent RGBA/HSLA values
   - Add mesh gradient or animated gradient background
   - Glass-effect cards with `backdrop-filter: blur()` and translucent fills
   - Subtle inner glow borders (1px white/10-20% opacity)

3. **Fonts** - Typography upgrade:
   - Current: Geist Sans + Geist Mono (already modern, clean)
   - Consider: Keep Geist (it's excellent for glassmorphism) OR swap to Inter/Plus Jakarta Sans
   - Add font weight variation (light headings, medium body) for glass aesthetic

4. **Interactions** - Micro-interactions and transitions:
   - Hover effects on glass cards (slight scale, brightness shift, border glow)
   - Smooth transitions on tab switches
   - Animated gradient background (subtle movement)
   - Card entrance animations (fade-in, slide-up)
   - Sparkle/shimmer effects on key metrics

5. **Live Preview** - Dev server must be running for visual monitoring

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/globals.css` | 1-126 | Theme variables, Tailwind imports, base styles | **PRIMARY TARGET** - Must add glassmorphism CSS variables, backdrop-blur utilities, gradient bg, glass card styles |
| `src/app/layout.tsx` | 1-35 | Root layout with fonts | Add gradient background wrapper, possibly change font imports |
| `src/app/page.tsx` | 1-206 | Dashboard home page | Update header, footer, card containers, loading/error states for glass style |
| `src/app/import/page.tsx` | ~1-80 | Import page | Apply glass styling to import page layout |
| `src/components/ui/card.tsx` | 1-93 | Card primitive (shadcn) | **PRIMARY TARGET** - Add glassmorphism: `bg-white/10 backdrop-blur-xl border-white/20 shadow-xl` |
| `src/components/ui/button.tsx` | 1-65 | Button primitive (shadcn) | Update variants with glass styling, frosted hover states |
| `src/components/ui/tabs.tsx` | 1-92 | Tabs primitive (radix + shadcn) | Glass-style tab list, active indicator glow |
| `src/components/ui/progress.tsx` | ~1-30 | Progress bar (radix) | Glass track, gradient fill |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial bar gauge (0-100) | Glass container, score text glow effect |
| `src/components/charts/MetricCard.tsx` | 1-51 | Metric summary card + sparkline | Glass card styling, trend color adjustments |
| `src/components/charts/TrendChart.tsx` | 1-84 | Area/line trend chart | Glass container, chart color palette for glass bg |
| `src/components/charts/ProgressChart.tsx` | 1-51 | Horizontal bar chart | Glass container, bar styling |
| `src/components/charts/ComparisonCard.tsx` | 1-47 | Week-over-week comparison | Glass card, delta color adjustments |
| `src/components/dashboard/Overview.tsx` | 1-111 | Main dashboard layout | Section spacing, glass section headers |
| `src/components/dashboard/CategoryDetail.tsx` | 1-90 | Expanded category view | Glass cards in grid, comparison cards |
| `src/components/dashboard/RunningMetrics.tsx` | ~1-20 | Running wrapper | Minimal changes (passes props) |
| `src/components/dashboard/GymMetrics.tsx` | ~1-20 | Gym wrapper | Minimal changes (passes props) |
| `src/components/import/FileUpload.tsx` | 1-292 | Drag-drop upload | Glass upload area, progress card |
| `src/components/import/SyncSetup.tsx` | ~1-60 | Sync status display | Glass card styling |
| `src/lib/utils/formatters.ts` | ~1-80 | Score/trend colors | May need to adjust color values for glass bg contrast |

## Code Patterns and Conventions

### Current CSS Variable Pattern (globals.css:49-82)
```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  /* ... more variables */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  /* ... */
}
```

### Card Component Pattern (src/components/ui/card.tsx:5-16)
```typescript
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

### Button CVA Pattern (src/components/ui/button.tsx:7-39)
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-background shadow-xs hover:bg-accent ...",
        ghost: "hover:bg-accent hover:text-accent-foreground ...",
      },
      size: { default: "h-9 px-4 py-2 ...", sm: "h-8 ...", lg: "h-10 ..." },
    },
  }
)
```

### Tabs CVA Pattern (src/components/ui/tabs.tsx:28-41)
```typescript
const tabsListVariants = cva(
  "rounded-lg p-[3px] ... text-muted-foreground inline-flex w-fit items-center justify-center ...",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
  }
)
```

### Component File Naming
- PascalCase for component files: `FitnessScore.tsx`, `MetricCard.tsx`
- Index barrel exports: `src/components/charts/index.ts`, `src/components/dashboard/index.ts`
- kebab-case for utility files: `date-helpers.ts`, `formatters.ts`

### Import Pattern
```typescript
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMetricValue, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';
```

### Chart Container Pattern
```typescript
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
    {/* ... */}
  </AreaChart>
</ResponsiveContainer>
```

## Integration Points

### Key Interfaces (src/types/analytics.ts)
```typescript
interface MetricSummary {
  label: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  change_percent: number | null;
  sparkline_data: number[];
}

interface WeekComparisonMetric {
  label: string;
  unit: string;
  thisWeek: number | null;
  lastWeek: number | null;
  delta: number | null;
  deltaPercent: number | null;
  higherIsBetter: boolean;
}

interface CategoryScore {
  name: string;
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  metrics: MetricSummary[];
  weekComparison: WeekComparisonMetric[];
}

interface DashboardData {
  overall_score: number | null;
  overall_trend: 'improving' | 'stable' | 'declining';
  categories: {
    running: CategoryScore;
    gym: CategoryScore;
  };
  last_sync: string | null;
}

type DateRange = '30d' | '60d' | '90d' | '365d';
```

### Formatter Functions (src/lib/utils/formatters.ts)
```typescript
function getScoreColor(score: number): string      // → 'text-red-500' | 'text-yellow-500' | 'text-green-500'
function getScoreBgColor(score: number): string     // → 'bg-red-500' | 'bg-yellow-500' | 'bg-green-500'
function getTrendIcon(trend: string): string        // → '↑' | '→' | '↓'
function getTrendColor(trend: string): string       // → 'text-green-500' | 'text-gray-500' | 'text-red-500'
function formatMetricValue(value: number, unit: string): string  // Localized formatting
```

### Data Flow
```
Mock Data (dashboard-preview.ts) → Dashboard page.tsx → Overview component
  ↓                                                         ↓
Preview mode auto-detected         FitnessScore, MetricCard, ProgressChart, TrendChart
(hasRealDashboardData returns false when no SQLite data)
```

## Testing Infrastructure

### Test Runner & Commands
- Runner: Vitest (v4.x)
- Run all: `npm run test` or `vitest run`
- Run specific: `vitest run __tests__/lib/mock/dashboard-preview.test.ts`
- Watch: `npm run test:watch`

### Existing Test Files
- `__tests__/api/analytics-route.test.ts` — API route responses
- `__tests__/lib/analytics/fitness-score.test.ts` — Scoring algorithm
- `__tests__/lib/mock/dashboard-preview.test.ts` — Preview mock data generation
- `__tests__/integration/import-pipeline.test.ts` — Full import pipeline

### Test Patterns
```typescript
import { describe, it, expect } from 'vitest';

describe('Module Name', () => {
  it('should do something', () => {
    const result = someFunction(input);
    expect(result).toBe(expectedValue);
  });
});
```

### Note on Testing for UI Changes
This task is purely visual/CSS-focused. Existing tests should continue to pass since we are not modifying logic, data flow, or component interfaces. After implementation, run `npm run test` to verify no regressions, and `npm run build` to verify no type errors.

## Implementation Considerations

### Glassmorphism Design Principles
The glassmorphism style requires these CSS properties working together:

1. **Background**: Semi-transparent fill (`background: rgba(255,255,255,0.1)` or `bg-white/10`)
2. **Backdrop blur**: Frosted effect (`backdrop-filter: blur(16px)` or `backdrop-blur-xl`)
3. **Border**: Subtle semi-transparent border (`border: 1px solid rgba(255,255,255,0.18)`)
4. **Shadow**: Soft, elevated shadow (`box-shadow: 0 8px 32px rgba(0,0,0,0.12)`)
5. **Background gradient**: Colorful gradient behind the glass elements (mesh gradient or radial gradients)

### Approach: Phased Implementation

**Phase 1: Foundation - CSS Theme & Background** (~50 lines CSS, 1 file)
- Update `globals.css` with new glass-aware CSS variables
- Add gradient mesh background utility class
- Add glass card utility classes
- Update dark mode variables for glass compatibility

**Phase 2: UI Primitives - Card, Button, Tabs, Progress** (~4 files, ~80 lines changes)
- Update Card to use glass styling (backdrop-blur, translucent bg, glass border)
- Update Button variants for glass compatibility
- Update Tabs with glass pill/active states
- Update Progress with glass track

**Phase 3: Page Layout - Header, Background, Footer** (~3 files, ~60 lines changes)
- Add animated gradient background to layout.tsx
- Update page.tsx header with glass header bar
- Update footer sync card

**Phase 4: Chart Components - Glass Containers** (~5 files, ~40 lines changes)
- Update chart wrapper styling for glass context
- Adjust chart colors for readability on glass bg
- Update MetricCard, ComparisonCard glass styling

**Phase 5: Animations & Interactions** (~30 lines CSS + ~20 lines component changes)
- Card hover effects (scale, glow)
- Tab transition animations
- Gradient background animation (subtle float)
- Card entrance animations (intersection observer or CSS)

### Risks

1. **Backdrop-filter performance**: `backdrop-filter: blur()` can be GPU-intensive with many stacked elements. Mitigate by limiting blur layers and using `will-change: transform` sparingly.

2. **Chart readability**: Recharts renders SVG on potentially translucent backgrounds. Chart colors and grid lines need sufficient contrast. May need to add a subtle solid inner background for chart areas specifically.

3. **Dark mode complexity**: Glassmorphism looks different in light vs dark. Dark mode typically uses `bg-white/5` to `bg-white/10` while light mode uses `bg-white/40` to `bg-white/70`. Both modes need separate tuning.

4. **Existing hardcoded colors**: Some components use hardcoded Tailwind colors (e.g., `text-gray-600`, `bg-gray-50` in FileUpload.tsx) that bypass the theme system. These need to be migrated to theme-aware equivalents.

5. **Accessibility contrast**: Semi-transparent backgrounds can reduce text contrast. Must verify WCAG AA contrast ratios are maintained, especially for muted-foreground text on glass surfaces.

### Scope Estimate
- Files to modify: ~15 files
- Files to create: 0 (all changes to existing files)
- Estimated lines of change: ~300-400 lines across all files
- New CSS: ~80-100 lines in globals.css
- Component updates: ~200-250 lines of className changes

### Dependencies
- No new npm packages needed
- Tailwind CSS 4 already supports `backdrop-blur-*` utilities natively
- `tw-animate-css` already imported for animation utilities
- May want to add `@keyframes` for custom gradient animation in globals.css

## Specification Assessment

**Does this feature need a UX specification?** Yes.

**Reasoning:**
- This is a significant visual redesign of the entire dashboard
- Multiple UX decisions needed: exact color palette, gradient directions, blur intensities, animation timings, hover behaviors
- Affects every user-facing component
- The glassmorphism style has specific design constraints (contrast, readability, depth hierarchy) that benefit from UX specification review
- Multiple interaction patterns (card hover, tab switch, entrance animations) need design decisions
- Light mode vs dark mode glass treatment needs specification

**Needs Specification**: Yes

## Questions for Human Review

1. **Dark mode preference**: Should the glassmorphism be optimized primarily for dark mode (where it looks most dramatic) or should it work equally well in both light and dark modes?
2. **Font change**: The current Geist Sans font works well with glassmorphism. Should we keep it, or swap to another glass-friendly font like Inter or Plus Jakarta Sans?
3. **Background gradient**: What color palette for the background gradient? Options:
   - Purple/blue/teal (common glassmorphism palette)
   - Health-themed (greens, blues)
   - Neutral with accent pops
4. **Animation intensity**: Subtle (barely noticeable, professional) or expressive (noticeable hover effects, gradient movement)?
5. **Import page**: Should the import page also get the full glassmorphism treatment, or keep it simpler?

## Next Steps

Ready for **specification phase** - needs UX specification to define exact glassmorphism parameters (colors, blur values, animations, interaction behaviors) before implementation planning.
