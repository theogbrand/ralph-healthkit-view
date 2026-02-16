# Research: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-67
**Date**: 2026-02-16
**Status**: Complete

## Summary

The task is to plan and implement a comprehensive Apple-style UI makeover of the Ralph HealthKit dashboard. This involves redesigning the visual layer across all dashboard components — styling, fonts, colors, spacing, animations, and interactions — to match Apple's HealthKit / Health app design language. The app currently uses a neutral shadcn/ui + Tailwind setup. The goal is a polished, premium Apple-like experience with smooth transitions, refined typography, and HealthKit-inspired color semantics.

## Requirements Analysis

From the issue description:
1. **Apple-style UI makeover** — The entire dashboard needs to adopt Apple's design language (HealthKit-inspired)
2. **Styling** — New color system, card styles, shadows, glassmorphism, gradients
3. **Fonts** — Apple-like typography (SF Pro equivalents, weight hierarchy, letter-spacing)
4. **Interactions** — Smooth animations, hover states, micro-interactions, transitions
5. **Live Preview** — A running dev server for manual monitoring of changes

### Apple Health Design Language Key Traits:
- Clean white/light backgrounds with generous whitespace
- Rounded, elevated cards with subtle shadows (no hard borders)
- Bold SF Pro Display headings, regular SF Pro Text body
- Colored category accents (red for Heart, green for Activity, blue for Fitness)
- Circular progress rings for scores (Activity rings style)
- Smooth spring animations and transitions
- Minimal chrome, content-focused layouts
- Subtle gradients and depth cues
- Segmented controls (not tab bars) for date selectors

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/globals.css` | 1-126 | Global styles & CSS variables | **Primary** — Rewrite color system, add Apple-style tokens, animation keyframes |
| `src/app/layout.tsx` | 1-35 | Root layout, font loading | **Modify** — Change to SF Pro-equivalent fonts (Inter or system -apple-system) |
| `src/app/page.tsx` | 1-205 | Dashboard home page | **Modify** — Header redesign, date selector as segmented control, layout spacing |
| `src/components/dashboard/Overview.tsx` | 1-110 | Dashboard layout coordinator | **Modify** — Grid layout, section spacing, card arrangement |
| `src/components/dashboard/CategoryDetail.tsx` | 1-89 | Expanded metric detail view | **Modify** — Card styling, metric list layout, chart integration |
| `src/components/dashboard/RunningMetrics.tsx` | 1-14 | Running category wrapper | Minor — passes through to CategoryDetail |
| `src/components/dashboard/GymMetrics.tsx` | 1-14 | Gym category wrapper | Minor — passes through to CategoryDetail |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial fitness score circle | **Major** — Redesign as Apple Activity rings style |
| `src/components/charts/MetricCard.tsx` | 1-50 | Summary card with sparkline | **Major** — Apple-style metric card with colored accents |
| `src/components/charts/ProgressChart.tsx` | 1-50 | Horizontal bar chart | **Modify** — Apple-style progress bars with rounded ends, colored fills |
| `src/components/charts/TrendChart.tsx` | 1-83 | Area/line trend chart | **Modify** — Apple-style chart with gradient fills, rounded curves |
| `src/components/charts/ComparisonCard.tsx` | 1-46 | Week-over-week comparison | **Modify** — Apple-style comparison with colored deltas |
| `src/components/ui/card.tsx` | 1-93 | Card container primitives | **Modify** — Apple-style cards (no border, elevated shadow, more padding) |
| `src/components/ui/button.tsx` | 1-64 | Button with CVA variants | **Modify** — Apple-style buttons (pill shape, system blue) |
| `src/components/ui/tabs.tsx` | 1-91 | Tabs / segmented control | **Major** — Convert to Apple segmented control appearance |
| `src/components/ui/progress.tsx` | 1-31 | Progress bar | **Modify** — Rounded, colored progress |
| `src/lib/utils/formatters.ts` | 1-75 | Trend icons, colors, formatting | **Modify** — Update trend colors to Apple palette, possibly SF Symbols |
| `src/lib/utils.ts` | ~10 | cn() utility | No change needed |
| `src/types/analytics.ts` | 1-47 | TypeScript interfaces | No change needed |
| `src/config/metrics.ts` | 1-88 | Health type maps, score weights | No change needed |
| `src/lib/mock/dashboard-preview.ts` | 1-781 | Mock data for preview mode | No change needed |

## Code Patterns and Conventions

### Component Structure
```typescript
// Example from src/components/charts/MetricCard.tsx:1-50
'use client';

import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMetricValue, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  sparklineData?: number[];
}

export function MetricCard({ title, value, unit, trend, sparklineData }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* content */}
      </CardContent>
    </Card>
  );
}
```

### Styling Pattern — Tailwind Utility Classes
All components use Tailwind utility classes directly in `className`. No CSS modules, no styled-components. The `cn()` utility from `@/lib/utils` merges classes with `clsx` + `tailwind-merge`.

```typescript
// From src/components/ui/card.tsx:5-15
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

### CVA Variant Pattern
```typescript
// From src/components/ui/button.tsx:7-38
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-background shadow-xs hover:bg-accent ...",
        // ...
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        // ...
      },
    },
  }
)
```

### Import/Export Pattern
- Named exports (no default exports for components)
- Barrel re-exports via `index.ts` files
- Path alias `@/` maps to `src/`
- `'use client'` directive on all interactive components

### CSS Variables & Theme System
```css
/* From src/app/globals.css:49-82 */
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  /* ... more variables */
}
```

### Font Loading
```typescript
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

### Chart Pattern (Recharts)
```typescript
// From src/components/charts/FitnessScore.tsx:37-67
<div className="relative" style={{ width: dimension, height: dimension }}>
  <ResponsiveContainer width="100%" height="100%">
    <RadialBarChart
      cx="50%" cy="50%"
      innerRadius="70%" outerRadius="100%"
      startAngle={225} endAngle={-45}
      data={data} barSize={size === 'lg' ? 14 : 10}
    >
      <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#e5e7eb' }} />
    </RadialBarChart>
  </ResponsiveContainer>
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <span className={`${fontSize} font-bold`} style={{ color }}>
      {Math.round(score)}
    </span>
  </div>
</div>
```

### Score Color Pattern
```typescript
// From src/lib/utils/formatters.ts:49-53
export function getScoreColor(score: number): string {
  if (score < 50) return 'text-red-500';
  if (score < 70) return 'text-yellow-500';
  return 'text-green-500';
}
```

### Trend System
```typescript
// From src/lib/utils/formatters.ts:61-75
export function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '↑';
    case 'stable': return '→';
    case 'declining': return '↓';
  }
}

export function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return 'text-green-500';
    case 'stable': return 'text-gray-500';
    case 'declining': return 'text-red-500';
  }
}
```

## Integration Points

### Key Interfaces (no changes needed — UI-only redesign)

```typescript
// From src/types/analytics.ts:1-47
export interface FitnessScore {
  date: string;
  running_score: number | null;
  gym_score: number | null;
  overall_score: number | null;
  trend_direction: 'improving' | 'stable' | 'declining';
  computed_at: string;
}

export interface MetricSummary {
  label: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  change_percent: number | null;
  sparkline_data: number[];
}

export interface WeekComparisonMetric {
  label: string;
  unit: string;
  thisWeek: number | null;
  lastWeek: number | null;
  delta: number | null;
  deltaPercent: number | null;
  higherIsBetter: boolean;
}

export interface CategoryScore {
  name: string;
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  metrics: MetricSummary[];
  weekComparison?: WeekComparisonMetric[];
}

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

### Dashboard API Response
```typescript
// From src/lib/mock/dashboard-preview.ts:8-11
export type DashboardApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
  total_records: number;
};
```

### Data Flow
1. `page.tsx` fetches `/api/analytics?range={range}` on mount and range change
2. Response parsed into `DashboardApiResponse`
3. If no real data, falls back to mock preview data from `dashboard-preview.ts`
4. Data passed to `<Overview data={data} dateRange={range} />`
5. Overview renders: FitnessScore, MetricCards (clickable), expanded CategoryDetail, ProgressChart, TrendChart
6. CategoryDetail renders: ComparisonCards (week comparison) + metric cards with individual TrendCharts

## Testing Infrastructure

### Test Runner & Commands
- Runner: Vitest 4.0.18
- Run all: `npm test` (or `vitest run`)
- Run specific: `vitest run <pattern>`

### Existing Test Files
- `__tests__/` directory (minimal tests for utility functions)

### Test Patterns
The project has minimal test coverage. UI changes are validated visually via the dev server preview mode (mock data).

## Implementation Considerations

### Approach

This is a **pure visual/UI redesign** — no data model, API, or business logic changes. All changes are in:
1. CSS variables and global styles (`globals.css`)
2. Component className attributes (Tailwind utilities)
3. Font configuration (`layout.tsx`)
4. Chart component styling (colors, sizes, strokes)
5. Formatter utilities (trend colors/icons)

### Apple Design Language — Key Elements to Implement

#### Color System
- **Background**: Pure white `#FFFFFF` or very light gray `#F2F2F7` (Apple's system grouped background)
- **Cards**: White with no borders, soft shadows
- **Primary accent**: Apple system blue `#007AFF`
- **Health category colors**:
  - Activity/Running: Green `#30D158` / Red `#FF3B30` (Activity rings)
  - Heart/Cardio: Red `#FF2D55`
  - Fitness Score: Multi-color gradient ring
- **Text**: Black `#000000` / Gray `#8E8E93` (Apple system gray)
- **Improving**: Green `#34C759`
- **Declining**: Red `#FF3B30`
- **Stable**: Gray `#8E8E93`

#### Typography
- **Font**: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui` (native Apple font stack) or Inter as a close web-safe alternative
- **Large titles**: 34px bold (Apple Large Title)
- **Headlines**: 22px semibold
- **Body**: 17px regular
- **Caption**: 13px regular, gray
- **Tabular numbers** for metrics (`font-variant-numeric: tabular-nums`)

#### Card & Surface Treatment
- No borders on cards (remove `border` from Card component)
- Elevated shadow: `0 2px 10px rgba(0, 0, 0, 0.08)` (subtle)
- Larger border-radius: `16px` (Apple standard)
- More internal padding: `20px-24px`
- Card background: white

#### Interactions & Animations
- **Transitions**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (Apple ease-out)
- **Hover states**: Slight scale-up (`transform: scale(1.02)`) with shadow increase
- **Category expand**: Smooth height animation
- **Tab/segment switching**: Sliding indicator animation
- **Score ring**: Animated fill on mount

#### Segmented Control (replacing Tabs)
- Rounded pill container with gray background
- Active segment: white background with shadow
- Smooth sliding transition between segments

#### Layout
- Max-width container: `860px` (narrower, more focused)
- Generous vertical spacing between sections: `32px-40px`
- Full-width cards within container

### Risks
- **Font licensing**: SF Pro is Apple-proprietary; use `-apple-system` font stack for Apple devices, fallback to Inter/system-ui elsewhere
- **Recharts customization limits**: Some Apple-style chart aesthetics (gradient fills, rounded area charts) may require custom SVG or wrapper adjustments
- **Dark mode**: Apple Health is primarily light-mode; dark mode styling needs separate consideration
- **Animation performance**: CSS transitions are performant; avoid JS-driven animations for layout changes
- **Browser compatibility**: OKLch colors are modern; fallbacks may be needed for older browsers (but Next.js 16 targets modern browsers)

### Scope Estimate
- Files to modify: ~15
- Files to create: 0 (pure modifications)
- Estimated lines of change: ~400-600 (mostly className attribute changes and CSS variable updates)

## Specification Assessment

This feature **needs a UX specification** because:
1. **Significant UX changes**: Complete visual redesign of every dashboard component
2. **Multiple design decisions**: Color palette, typography scale, card styles, animation timing, chart aesthetics
3. **Apple design language translation**: Requires careful decisions about how to adapt Apple's native design patterns for web
4. **Interaction patterns**: New hover states, transitions, segmented control behavior
5. **The feature would benefit from UX simplification review**: The current layout could be refined for better Apple-like hierarchy

**Needs Specification**: Yes

## Questions for Human Review

1. **Dark mode**: Should the Apple-style redesign include dark mode, or focus on light mode only (Apple Health is primarily light)?
2. **Font preference**: Use native `-apple-system` stack (free, best on Apple devices) or load Inter via Google Fonts (consistent cross-platform)?
3. **Activity rings**: Should the FitnessScore component be redesigned as Apple-style Activity rings (concentric circles) or keep the current radial gauge with refined styling?
4. **Scope of import page**: Does the `/import` page also need the Apple-style treatment, or only the dashboard?
5. **Animation intensity**: Minimal (just transitions) or rich (animated rings, staggered card entries, parallax-like scroll effects)?

## Next Steps

Ready for specification phase. The specification should define:
- Exact color tokens for the Apple-style theme
- Typography scale and font decisions
- Card component styling specification
- Chart visual treatment details
- Animation and transition specifications
- Segmented control behavior
- Mobile responsive considerations
