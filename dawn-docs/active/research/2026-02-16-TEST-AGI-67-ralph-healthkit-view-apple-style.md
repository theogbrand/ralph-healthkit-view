# Research: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-67
**Date**: 2026-02-16
**Status**: Complete

## Summary

The task is to plan and execute a comprehensive Apple-style UI makeover of the Ralph HealthKit dashboard. This involves redesigning the entire visual language to match Apple's Health/Fitness app aesthetic — including typography (SF Pro-like), color system, card styling, gauge/chart design, animations, and interactions. A live preview must be maintained throughout so the user can manually monitor changes.

## Requirements Analysis

From the issue description:
1. **Apple-style UI makeover** — Redesign the dashboard to match Apple's Health/HealthKit visual language
2. **Styling** — New color palette, card designs, gradients, shadows matching Apple HIG
3. **Fonts** — Apple-like typography (SF Pro family or equivalent web-safe alternative)
4. **Interactions** — Smooth transitions, hover states, expand/collapse animations
5. **Live Preview** — Dev server must be running for manual monitoring of changes

### Apple Health/Fitness Design Reference

Apple Health app characteristics:
- Clean white/light backgrounds with generous whitespace
- SF Pro Display for headings, SF Pro Text for body
- Colored ring/arc gauges (Activity Rings style)
- Cards with subtle rounded corners (16-20px radius), slight shadows, no hard borders
- Category color coding: green (Move/Activity), cyan/blue (Exercise), yellow (Stand), red (Heart)
- Metric values displayed large and bold with small units
- Smooth spring animations for transitions
- Trend arrows and sparklines
- Section headers are large, left-aligned, bold
- Segmented controls (not tab bars) for date selectors
- Minimal chrome, content-focused layouts

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/layout.tsx` | 1-35 | Root layout with fonts | **Change fonts** to Inter or system -apple-system stack |
| `src/app/globals.css` | 1-126 | Tailwind theme, CSS variables, color tokens | **Major overhaul** — new Apple-style color palette, radius, shadows, animations |
| `src/app/page.tsx` | 1-206 | Main dashboard page, header, date tabs, states | **Restyle** header, tabs, layout spacing, loading/empty states |
| `src/components/dashboard/Overview.tsx` | 1-111 | Dashboard layout orchestrator | **Restyle** section layout, card grid, expand animation |
| `src/components/dashboard/CategoryDetail.tsx` | 1-90 | Expandable category metrics view | **Restyle** metric grid, section headers |
| `src/components/dashboard/RunningMetrics.tsx` | 1-14 | Running category wrapper | Thin wrapper — minimal changes |
| `src/components/dashboard/GymMetrics.tsx` | 1-14 | Gym category wrapper | Thin wrapper — minimal changes |
| `src/components/charts/FitnessScore.tsx` | 1-70 | Radial gauge visualization | **Redesign** to Apple-style ring gauge with gradient |
| `src/components/charts/MetricCard.tsx` | 1-51 | Summary card with sparkline | **Redesign** to Apple Health metric card style |
| `src/components/charts/TrendChart.tsx` | 1-84 | Line/Area time series chart | **Restyle** with Apple-like chart aesthetics |
| `src/components/charts/ProgressChart.tsx` | 1-51 | Horizontal bar chart for scores | **Redesign** to Apple-style progress bars |
| `src/components/charts/ComparisonCard.tsx` | 1-47 | Week-over-week comparison | **Restyle** with Apple comparison UI pattern |
| `src/components/ui/card.tsx` | 1-93 | shadcn Card compound component | **Update** default styling (no border, elevated shadow, larger radius) |
| `src/components/ui/button.tsx` | 1-65 | shadcn Button with CVA variants | May need Apple-style button updates (pill shape, system blue) |
| `src/components/ui/tabs.tsx` | 1-92 | shadcn Tabs with Radix | **Major** — Convert to Apple segmented control appearance |
| `src/components/ui/progress.tsx` | 1-32 | Radix progress bar | May need rounded, colored progress updates |
| `src/lib/utils/formatters.ts` | 1-76 | Format values, colors, trends | **Update** score colors and trend colors to Apple palette |
| `src/lib/utils.ts` | ~10 | cn() utility | No change needed |
| `src/types/analytics.ts` | all | TypeScript types | Reference only — no changes |
| `src/config/metrics.ts` | all | Metric weights and mappings | Reference only — no changes |
| `src/lib/mock/dashboard-preview.ts` | all | Mock data for preview mode | Reference only — no changes |

## Code Patterns and Conventions

### Component Structure Pattern
All components use functional components with TypeScript interfaces:

```typescript
// Example from src/components/charts/MetricCard.tsx:7-13
interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  sparklineData?: number[];
}

export function MetricCard({ title, value, unit, trend, sparklineData }: MetricCardProps) {
```

### Tailwind Class Merging Pattern
Uses `cn()` utility from shadcn for conditional classes:

```typescript
// From src/lib/utils.ts
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Card Component Pattern (shadcn compound)
```typescript
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
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
      },
    },
  }
)
```

### Chart Pattern (Recharts)
All charts use Recharts with ResponsiveContainer:

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

### Color/Score Pattern
Three-tier color coding used across multiple files:

```typescript
// From src/lib/utils/formatters.ts:49-53
export function getScoreColor(score: number): string {
  if (score < 50) return 'text-red-500';
  if (score < 70) return 'text-yellow-500';
  return 'text-green-500';
}
```

Also duplicated in FitnessScore.tsx:12-16 and ProgressChart.tsx:10-14 as `getScoreHex()`:
```typescript
function getScoreHex(score: number): string {
  if (score < 50) return '#ef4444';
  if (score < 70) return '#eab308';
  return '#22c55e';
}
```

### Trend System
```typescript
// From src/lib/utils/formatters.ts:61-75
export function getTrendIcon(trend): string {
  case 'improving': return '↑';
  case 'stable': return '→';
  case 'declining': return '↓';
}

export function getTrendColor(trend): string {
  case 'improving': return 'text-green-500';
  case 'stable': return 'text-gray-500';
  case 'declining': return 'text-red-500';
}
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

## Integration Points

### Key Interfaces (from src/types/analytics.ts — no changes needed)

```typescript
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

### Component Dependency Tree
```
page.tsx
├── Overview
│   ├── FitnessScore (RadialBarChart)
│   ├── MetricCard × 2 (Running, Gym category scores)
│   ├── RunningMetrics → CategoryDetail
│   │   ├── ComparisonCard × N
│   │   ├── Card + TrendChart × N
│   ├── GymMetrics → CategoryDetail
│   │   ├── ComparisonCard × N
│   │   ├── Card + TrendChart × N
│   ├── ProgressChart (BarChart)
│   └── TrendChart (AreaChart / LineChart)
```

## Testing Infrastructure

### Test Runner & Commands
- Runner: Vitest 4.0.18
- Run all: `npm test` (vitest run)
- Run specific: `npx vitest run __tests__/<pattern>`
- Watch mode: `npm run test:watch`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

### Existing Test Files
- `__tests__/` directory with utility/integration tests
- UI components do NOT currently have tests
- Changes are validated visually via dev server preview mode (mock data)

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
- **Background**: `#F2F2F7` (Apple system grouped background) or pure white
- **Cards**: White `#FFFFFF` with no borders, soft elevated shadows
- **Primary accent**: Apple system blue `#007AFF`
- **Health category colors**:
  - Running: Green `#30D158`
  - Gym/Strength: Orange `#FF9F0A`
  - Heart/Cardio: Red/Pink `#FF2D55`
  - Overall Score: Multi-color gradient or category-weighted
- **Text**: Black `#000000` / Secondary gray `#8E8E93`
- **Score tiers**: Red `#FF3B30` (<50), Orange `#FF9F0A` (50-70), Green `#30D158` (70+)
- **Trends**: Green `#34C759` (improving), Red `#FF3B30` (declining), Gray `#8E8E93` (stable)

#### Typography
- **Font**: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui` or Inter as cross-platform fallback
- **Large titles**: 34px bold
- **Headlines**: 22px semibold
- **Body**: 17px regular
- **Caption**: 13px regular, gray
- **Tabular numbers** for metrics (`font-variant-numeric: tabular-nums`)

#### Card & Surface Treatment
- No visible borders on cards (remove `border` from Card component)
- Elevated shadow: `0 2px 10px rgba(0, 0, 0, 0.08)`
- Border-radius: `16px` (Apple standard)
- Internal padding: `20px-24px`

#### Gauge/Ring Design
- Thick stroke width (12-16px)
- Rounded caps (linecap: round)
- Background track: `#E5E5EA`
- Score inside: large bold number
- Consider gradient fill along arc

#### Interactions & Animations
- Transitions: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (Apple ease-out), 200-300ms
- Card hover: subtle scale-up (`scale(1.02)`) with shadow increase
- Category expand: smooth height animation
- Segmented control: sliding indicator animation
- Score ring: animated fill on mount

#### Segmented Control (replacing Tabs)
- Rounded pill container with gray background
- Active segment: white background with shadow
- Smooth sliding transition between segments

#### Layout
- Max-width container: ~860px (narrower, focused)
- Vertical spacing between sections: 32-40px
- Full-width cards within container

### Risks
1. **Font licensing**: SF Pro is Apple-proprietary; use `-apple-system` stack for Apple devices, fallback to Inter/system-ui elsewhere
2. **Recharts customization limits**: Some Apple-style aesthetics (gradient fills, rounded area charts) may need custom SVG
3. **Dark mode**: Apple Health is primarily light mode; dark mode styling needs separate consideration
4. **Animation performance**: CSS transitions are performant; avoid JS-driven animations for layout changes
5. **Browser compatibility**: OKLCH colors are modern but Next.js 16 targets modern browsers

### Scope Estimate
- Files to modify: ~15
- Files to create: 0 (pure modifications)
- Estimated lines of change: ~400-600

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
5. **Animation intensity**: Minimal (just transitions) or rich (animated rings, staggered card entries)?

## Next Steps

Ready for specification phase. The specification should define:
- Exact color tokens for the Apple-style theme
- Typography scale and font decisions
- Card component styling specification
- Chart/gauge visual treatment details
- Animation and transition specifications
- Segmented control behavior
- Mobile responsive considerations
