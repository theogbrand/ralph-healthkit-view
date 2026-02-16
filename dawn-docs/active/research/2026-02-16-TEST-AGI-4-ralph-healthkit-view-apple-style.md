# Research: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-4
**Date**: 2026-02-16
**Status**: Complete

## Summary

The task is to plan and implement an Apple-style UI makeover for the Ralph HealthKit dashboard application. This involves redesigning the existing fitness dashboard with Apple's design language — including SF-inspired typography, refined color palettes, smooth animations/transitions, and polished interaction patterns. The task also requires setting up a live preview so changes can be monitored in real-time during development.

## Requirements Analysis

From the issue description:
1. **Apple-style UI makeover** — Redesign the dashboard to match Apple's design aesthetic (think Apple Health app, Apple Fitness+, Apple Watch activity rings)
2. **Styling** — New color palette, card designs, shadows, spacing, and visual hierarchy
3. **Fonts** — Typography changes to match Apple's aesthetic (SF Pro-inspired, clean, modern)
4. **Interactions** — Smooth transitions, hover effects, tap feedback, expand/collapse animations
5. **Live Preview** — Create a running preview of the app so changes can be monitored visually

### Success Criteria
- Dashboard visually resembles Apple Health / Apple Fitness+ design language
- Clean, minimal typography with proper hierarchy
- Smooth animations and micro-interactions
- Charts restyled to match Apple's data visualization aesthetic
- Live preview available for monitoring changes in real-time

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/layout.tsx` | 1-35 | Root layout with font config | **Modify**: Change fonts to SF Pro-inspired (Inter), update body classes |
| `src/app/page.tsx` | 1-205 | Main dashboard page | **Modify**: Restyle header, navigation, layout structure, states |
| `src/app/globals.css` | 1-126 | Global styles, CSS variables, Tailwind config | **Modify**: Complete overhaul of color palette, spacing, typography tokens |
| `src/app/import/page.tsx` | 1-57 | Data import page | **Modify**: Restyle to match new Apple design |
| `src/components/dashboard/Overview.tsx` | 1-110 | Dashboard layout & sections | **Modify**: Restyle card layout, spacing, section structure |
| `src/components/dashboard/CategoryDetail.tsx` | 1-89 | Category detail view | **Modify**: Restyle metric cards, grid layout, empty states |
| `src/components/dashboard/RunningMetrics.tsx` | 1-15 | Running category wrapper | Minor: passes through to CategoryDetail |
| `src/components/dashboard/GymMetrics.tsx` | 1-15 | Gym category wrapper | Minor: passes through to CategoryDetail |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial score gauge | **Modify**: Restyle to Apple-style activity ring |
| `src/components/charts/MetricCard.tsx` | 1-50 | Individual metric display | **Modify**: Restyle card layout, sparkline appearance |
| `src/components/charts/TrendChart.tsx` | 1-83 | Area/line trend chart | **Modify**: Restyle colors, grid, tooltips for Apple aesthetic |
| `src/components/charts/ProgressChart.tsx` | 1-50 | Category bar chart | **Modify**: Restyle horizontal bars to match Apple style |
| `src/components/charts/ComparisonCard.tsx` | 1-46 | Week-over-week comparison | **Modify**: Restyle comparison layout |
| `src/components/charts/ChartErrorBoundary.tsx` | 1-42 | Error boundary for charts | Minor: may need style update |
| `src/components/ui/button.tsx` | 1-64 | Button component (CVA) | **Modify**: Restyle for Apple aesthetic |
| `src/components/ui/card.tsx` | 1-92 | Card component | **Modify**: Update shadow, border, radius for Apple style |
| `src/components/ui/tabs.tsx` | 1-91 | Tabs component (Radix) | **Modify**: Restyle tab pills for Apple-style segmented control |
| `src/components/ui/progress.tsx` | 1-31 | Progress bar component | **Modify**: Restyle for Apple aesthetic |
| `src/lib/utils/formatters.ts` | 1-75 | Value & trend formatters | Read-only: downstream agents need these for rendering logic |
| `src/lib/utils.ts` | 1-6 | `cn()` utility | Read-only: used throughout for class merging |
| `src/types/analytics.ts` | 1-47 | TypeScript type definitions | Read-only: defines data shapes |
| `src/lib/mock/dashboard-preview.ts` | 1-231 | Mock data for preview mode | Read-only: provides sample data for live preview |
| `src/lib/utils/date-helpers.ts` | 1-92 | Date utilities | Read-only: formatting helpers |
| `src/config/metrics.ts` | — | Metric configuration | Read-only reference |
| `components.json` | 1-23 | shadcn/ui configuration | Reference: New York style, neutral base color |
| `package.json` | 1-46 | Dependencies | May need new dependencies (e.g. `framer-motion` for animations) |

## Code Patterns and Conventions

### Naming Conventions
- **Components**: PascalCase, one component per file (e.g., `FitnessScore.tsx`, `MetricCard.tsx`)
- **Files**: PascalCase for components, kebab-case for utilities (e.g., `date-helpers.ts`, `formatters.ts`)
- **CSS Variables**: kebab-case with `--` prefix (e.g., `--background`, `--card-foreground`)
- **Barrel exports**: `index.ts` files in `charts/`, `dashboard/` directories

### Component Structure Pattern
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
        {/* ... */}
      </CardContent>
    </Card>
  );
}
```

### UI Base Component Pattern (shadcn/ui style)
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

### CVA Variant Pattern
```typescript
// Example from src/components/ui/button.tsx:7-38
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
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

### Import/Export Pattern
```typescript
// Barrel exports from src/components/charts/index.ts
export { TrendChart } from './TrendChart';
export { FitnessScore } from './FitnessScore';
export { MetricCard } from './MetricCard';
export { ProgressChart } from './ProgressChart';

// Dashboard barrel from src/components/dashboard/index.ts
export { Overview } from './Overview';
export { RunningMetrics } from './RunningMetrics';
export { GymMetrics } from './GymMetrics';
export { CategoryDetail } from './CategoryDetail';
```

### CSS Variables & Theme Pattern
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
  /* ... chart colors, sidebar, etc. */
}
```

### Font Configuration Pattern
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

### State & Data Fetching Pattern
```typescript
// From src/app/page.tsx:46-82
export default function Home() {
  const [range, setRange] = useState<DateRange>('90d');
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${r}`);
      // ...
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
  // ...
}
```

## Integration Points

### Key Interfaces
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

### API Response Type
```typescript
// From src/lib/mock/dashboard-preview.ts:8-11
export type DashboardApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
  total_records: number;
};
```

### Component Props Interfaces
```typescript
// Overview component props (src/components/dashboard/Overview.tsx:14-21)
type ApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
};

interface OverviewProps {
  data: ApiResponse;
  dateRange: DateRange;
}

// FitnessScore props (src/components/charts/FitnessScore.tsx:6-10)
interface FitnessScoreProps {
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'lg';
}

// MetricCard props (src/components/charts/MetricCard.tsx:7-13)
interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  sparklineData?: number[];
}

// TrendChart props (src/components/charts/TrendChart.tsx:16-21)
interface TrendChartProps {
  data: Array<{ date: string; value: number }>;
  dateRange: DateRange;
  color?: string;
  showArea?: boolean;
}

// ProgressChart props (src/components/charts/ProgressChart.tsx:6-8)
interface ProgressChartProps {
  categories: DashboardData['categories'];
}

// ComparisonCard props (src/components/charts/ComparisonCard.tsx:8-10)
interface ComparisonCardProps {
  metric: WeekComparisonMetric;
}

// CategoryDetail props (src/components/dashboard/CategoryDetail.tsx:9-14)
interface CategoryDetailProps {
  title: string;
  metrics: MetricSummary[];
  dateRange: DateRange;
  weekComparison?: WeekComparisonMetric[];
}
```

### Utility Function Signatures
```typescript
// From src/lib/utils/formatters.ts
export function formatMetricValue(value: number, unit: string): string;
export function formatNumber(value: number, decimals?: number): string;
export function formatPace(minutesPerKm: number): string;
export function getScoreColor(score: number): string;     // returns Tailwind text- class
export function getScoreBgColor(score: number): string;   // returns Tailwind bg- class
export function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string;
export function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string;

// From src/lib/utils.ts
export function cn(...inputs: ClassValue[]): string;

// From src/lib/utils/date-helpers.ts
export function timeAgo(dateStr: string): string;
export function formatDateDisplay(dateStr: string): string;
export function getDateRangeBounds(range: DateRange): { start: string; end: string };
```

### Data Flow
1. `page.tsx` fetches data from `/api/analytics?range={DateRange}` on mount and range change
2. If no real data exists, falls back to mock data via `getMockDashboardData(range)`
3. Preview mode indicator shown when using mock data
4. `Overview` component receives full `DashboardData` + `score_history` and `DateRange`
5. `Overview` renders: FitnessScore gauge → Category MetricCards → Expandable CategoryDetail → ProgressChart → TrendChart
6. Category expansion uses local `useState<string | null>` to toggle

## Testing Infrastructure

### Test Runner & Commands
- Runner: Vitest v4.0.18
- Run all: `npm test` (or `vitest run`)
- Watch mode: `npm run test:watch` (or `vitest`)
- Config: `vitest.config.ts`

### Existing Test Files
- `__tests__/` directory exists (specific test files would need checking)
- Coverage via `@vitest/coverage-v8`

### Test Patterns
Testing is minimal for this UI-focused project. The primary validation method for this UI makeover task will be visual inspection via the live preview, not automated tests.

## Implementation Considerations

### Approach

The Apple-style UI makeover should focus on these design pillars:

1. **Typography**: Replace Geist with Inter (closest web equivalent to SF Pro). Use a clear hierarchy: lightweight large titles, medium body, semibold labels.

2. **Color Palette**: Apple Health uses:
   - Clean white/light gray backgrounds with subtle depth
   - Vibrant activity colors: Red (#FF2D55 / Move), Green (#30D158 / Exercise), Blue (#0A84FF / Stand)
   - Muted secondary text in gray tones
   - Subtle card backgrounds with very light borders or no borders

3. **Cards**: Apple-style cards use:
   - Larger border radius (16-20px)
   - Subtle shadows with no/minimal borders
   - More generous padding
   - Clean, spacious layouts

4. **Activity Rings**: The FitnessScore radial chart should be restyled to look like Apple Watch activity rings — thicker, more vibrant, with rounded ends.

5. **Animations**: Add subtle transitions using CSS transitions or `framer-motion`:
   - Card hover lift effects
   - Smooth expand/collapse for category details
   - Fade-in for data loading
   - Chart entry animations

6. **Interactions**:
   - Tab/segmented control should look like iOS segmented control
   - Buttons should have iOS-style press feedback
   - Cards should have subtle hover states

7. **Live Preview**: The app already has `npm run dev` which runs Next.js dev server with hot reload. The mock data system (`dashboard-preview.ts`) provides sample data. The live preview requirement is already partially met — the dev server plus preview mode provides a running view.

### Key Dependencies
- **Current**: Geist font, Tailwind v4, Recharts, Radix UI, CVA, shadcn/ui
- **Potentially New**:
  - `framer-motion` — for smooth animations (expand/collapse, page transitions)
  - `Inter` font from `next/font/google` — closest web alternative to SF Pro

### Risks
1. **Recharts customization limits**: Apple-style chart aesthetics may be constrained by Recharts' API. Some custom SVG work may be needed for activity ring styling.
2. **Scope creep**: "Apple-style" is broad — need clear specification to bound the work.
3. **Performance**: Adding animations should not degrade performance, especially on chart-heavy pages.
4. **Dark mode**: The current CSS variables support dark mode. Any color changes must maintain dark mode compatibility.
5. **Responsive design**: Apple-style designs often differ between phone/tablet/desktop. Need to decide scope of responsive changes.

### Scope Estimate
- Files to modify: ~15 files (all component files, globals.css, layout.tsx)
- Files to create: 0-2 (possibly a new animation utility or theme constants file)
- Estimated lines of change: 500-800+ lines across the codebase

## Specification Assessment

**Does this feature need a UX specification?** YES.

Reasoning:
- This is a **major visual redesign** touching every component in the dashboard
- "Apple-style" is subjective and needs precise specification — which Apple products/era to reference, exact color values, typography scale, spacing system, animation timings
- Multiple interaction patterns need UX decisions (how category expansion works, how tabs behave, hover states, loading animations)
- The design affects every screen: dashboard, import page, loading/empty/error states
- Without a specification, different implementation phases may create inconsistent designs
- A UX specification ensures the Apple aesthetic is cohesive across all components

**Needs Specification**: Yes

## Questions for Human Review

1. **Which Apple product aesthetic?** Apple Health app (iOS 17+), Apple Fitness+ dashboard, Apple Watch activity rings, or a general Apple design language?
2. **Dark mode priority?** Should the Apple-style redesign support both light and dark modes, or focus on one first?
3. **Animation library**: Should we add `framer-motion` for animations, or stick to CSS transitions only?
4. **Font choice**: Inter (closest to SF Pro on web) or keep Geist (which is already clean and modern)?
5. **Scope of "live preview"**: Is `npm run dev` with hot reload sufficient, or is a dedicated preview deployment needed?

## Next Steps

Ready for specification phase. The specification worker should define:
- Exact color palette (with OKLCH values for the existing CSS variable system)
- Typography scale and font choices
- Card styling details (radius, shadow, padding, border)
- Activity ring visual spec
- Animation/transition specifications
- Interaction patterns for all interactive elements
- Responsive breakpoint behavior
