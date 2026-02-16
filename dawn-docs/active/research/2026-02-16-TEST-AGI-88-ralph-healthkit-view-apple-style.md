# Research: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-88
**Date**: 2026-02-16
**Status**: Complete

## Summary

Ralph is a local-first Apple Health fitness dashboard built with Next.js 16, React 19, Tailwind CSS v4, Recharts, and shadcn/ui components. The task is to plan and execute a comprehensive Apple-style UI makeover covering styling, typography, colors, layout, interactions, and visual polish across the entire dashboard. The app currently has a functional but generic design that needs to be transformed into a premium, Apple Health-inspired experience.

## Requirements Analysis

From the ticket description:
1. **Apple-style UI makeover** — The dashboard should look and feel like Apple's Health app / Fitness app design language
2. **Styling** — Update colors, shadows, spacing, borders, and overall visual treatment
3. **Fonts** — Apple uses SF Pro / SF Pro Rounded; the web equivalent is "Inter" or system `-apple-system` stack. Currently using Geist font
4. **Interactions** — Add micro-interactions, hover states, transitions, and animations
5. **Live Preview** — Must have a running dev server for manual visual monitoring

### Apple Health Design Language Characteristics
- **Clean white/light gray backgrounds** with generous whitespace
- **Rounded corners** (16px–20px on cards)
- **Subtle shadows** (no hard borders on cards — uses soft box-shadows instead)
- **SF Pro font family** with precise weight usage (regular 400, medium 500, semibold 600, bold 700)
- **Activity Rings** — iconic circular progress indicators (red = Move, green = Exercise, blue = Stand)
- **Color-coded health metrics** — consistent semantic colors (heart = red, activity = green, sleep = purple)
- **Smooth animations** — spring-like transitions, fade-ins, count-up numbers
- **Minimal chrome** — no heavy borders, subtle separators, lots of negative space
- **Glassmorphism effects** — frosted glass nav bars, translucent backgrounds
- **Large, bold numbers** — hero metrics displayed prominently
- **Subtle gradients** — on cards and progress indicators
- **Haptic-like feedback** — scale transforms on tap/press states

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/layout.tsx` | 1-34 | Root layout, font setup | **Modify**: Change font from Geist to Inter/SF Pro system stack |
| `src/app/page.tsx` | 1-206 | Main dashboard page | **Modify**: Update header, layout spacing, state indicators, animations |
| `src/app/globals.css` | 1-126 | Tailwind theme, CSS vars | **Modify**: Overhaul color palette, add Apple-style colors, shadows, animations |
| `src/components/dashboard/Overview.tsx` | 1-110 | Dashboard layout | **Modify**: Update grid, spacing, visual hierarchy, expand/collapse animation |
| `src/components/dashboard/CategoryDetail.tsx` | 1-89 | Expanded category view | **Modify**: Update card styling, spacing, visual treatment |
| `src/components/dashboard/RunningMetrics.tsx` | 1-14 | Running wrapper | No changes needed (pass-through) |
| `src/components/dashboard/GymMetrics.tsx` | 1-14 | Gym wrapper | No changes needed (pass-through) |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial gauge | **Modify**: Apple Activity Ring style, gradient fills, animation |
| `src/components/charts/MetricCard.tsx` | 1-50 | Metric summary card | **Modify**: Apple-style card with subtle shadow, better typography hierarchy |
| `src/components/charts/TrendChart.tsx` | 1-83 | Area/line chart | **Modify**: Apple-style chart colors, gradient fills, smoother curves |
| `src/components/charts/ProgressChart.tsx` | 1-50 | Horizontal bar chart | **Modify**: Rounded bars with gradient fills, Apple color palette |
| `src/components/charts/ComparisonCard.tsx` | 1-46 | Week comparison | **Modify**: Apple-style delta indicators, subtle card styling |
| `src/components/charts/ChartErrorBoundary.tsx` | 1-42 | Error boundary | Minimal changes (styling only) |
| `src/components/ui/card.tsx` | 1-92 | Card primitives | **Modify**: Remove border, add subtle shadow, increase border-radius |
| `src/components/ui/button.tsx` | 1-65 | Button primitives | **Modify**: Update to Apple-style rounded buttons |
| `src/components/ui/tabs.tsx` | 1-91 | Tabs primitives | **Modify**: Apple-style segmented control |
| `src/components/ui/progress.tsx` | 1-31 | Progress bar | Minor styling updates |
| `src/lib/utils/formatters.ts` | 1-76 | Format helpers | No changes needed |
| `src/types/analytics.ts` | 1-47 | TypeScript types | No changes needed |
| `src/lib/mock/dashboard-preview.ts` | 1-782 | Preview data | No changes needed |
| `src/config/metrics.ts` | — | Health type mappings | No changes needed |
| `components.json` | 1-23 | shadcn/ui config | Reference only |
| `package.json` | 1-46 | Dependencies | May need to add `framer-motion` for animations |

## Code Patterns and Conventions

### Naming Conventions
- Components: PascalCase (`FitnessScore`, `MetricCard`, `CategoryDetail`)
- Files: PascalCase for components (`FitnessScore.tsx`), kebab-case for utilities (`date-helpers.ts`)
- CSS variables: kebab-case with `--` prefix (`--background`, `--card-foreground`)
- TypeScript interfaces: PascalCase with `Props` suffix (`MetricCardProps`, `OverviewProps`)

### Component Structure Pattern
```typescript
// From src/components/charts/MetricCard.tsx:1-50
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

### Card Component Pattern (shadcn/ui)
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

### Button Variant Pattern (CVA)
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
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        // ...
      },
    },
  }
)
```

### Import/Export Pattern
```typescript
// Barrel exports from src/components/dashboard/index.ts
export { Overview } from './Overview';
export { CategoryDetail } from './CategoryDetail';
export { RunningMetrics } from './RunningMetrics';
export { GymMetrics } from './GymMetrics';

// Barrel exports from src/components/charts/index.ts
export { FitnessScore } from './FitnessScore';
export { MetricCard } from './MetricCard';
// etc.
```

### Tailwind CSS Pattern
```css
/* From src/app/globals.css — Theme variables using OKLCH */
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
  --border: oklch(0.922 0 0);
  /* Chart colors */
  --chart-1: oklch(0.646 0.222 41.116);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --radius-lg: var(--radius);
}
```

### Font Setup Pattern
```typescript
// From src/app/layout.tsx:2-13
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Applied in body: className={`${geistSans.variable} ${geistMono.variable} antialiased`}
```

### Page State Management Pattern
```typescript
// From src/app/page.tsx:46-82
export default function Home() {
  const [range, setRange] = useState<DateRange>('90d');
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isManualPreviewMode, setIsManualPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${r}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await parseAnalyticsResponse(res);
      setApiData(json);
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

### API Response Shape
```typescript
// From src/lib/mock/dashboard-preview.ts:8-11
export type DashboardApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
  total_records: number;
};
```

### Utility Functions (Formatters)
```typescript
// From src/lib/utils/formatters.ts:1-76
export function formatMetricValue(value: number, unit: string): string { /* ... */ }
export function formatNumber(value: number, decimals?: number): string { /* ... */ }
export function getScoreColor(score: number): string { /* text-red/yellow/green-500 */ }
export function getScoreBgColor(score: number): string { /* bg-red/yellow/green-500 */ }
export function getTrendIcon(trend): string { /* ↑ → ↓ */ }
export function getTrendColor(trend): string { /* text-green/gray/red-500 */ }
```

### Score Color Logic (Used in Multiple Components)
```typescript
// From src/components/charts/FitnessScore.tsx:12-16
function getScoreHex(score: number): string {
  if (score < 50) return '#ef4444';  // red
  if (score < 70) return '#eab308';  // yellow
  return '#22c55e';                   // green
}
```

### Data Flow
1. `page.tsx` fetches `/api/analytics?range=X` on mount and range change
2. API response or mock data is passed to `<Overview data={data} dateRange={range} />`
3. Overview renders: `FitnessScore` → `MetricCard[]` → expanded `CategoryDetail` → `ProgressChart` → `TrendChart`
4. CategoryDetail renders: `ComparisonCard[]` + per-metric `TrendChart`s
5. All chart components receive data as props (no fetching inside components)

## Testing Infrastructure

### Test Runner & Commands
- Runner: **Vitest** v4.0.18
- Run all: `npm test` (or `npx vitest run`)
- Run specific: `npx vitest run __tests__/specific.test.ts`
- Watch mode: `npm run test:watch`

### Existing Test Files
```
__tests__/
```
Note: Test directory exists but specific test files were not found to be relevant to the UI work. UI changes are primarily visual and should be verified manually via live preview.

### Build Verification
- Build: `npm run build`
- Lint: `npm run lint`
- Dev server: `npm run dev`

## Implementation Considerations

### Approach — Apple-Style UI Transformation

**Phase 1: Foundation (Theme + Typography + Layout)**
- Replace Geist font with Inter (closest web equivalent to SF Pro)
- Overhaul CSS custom properties: Apple-inspired color palette, shadow system, spacing
- Update `globals.css` with Apple Health colors (activity red, exercise green, stand blue, heart red, sleep purple)
- Add CSS animation keyframes for micro-interactions
- Update base card styling: remove borders, add subtle shadows, increase border-radius to 16px+
- Update button styling: pill-shaped or rounded-lg with Apple system blue

**Phase 2: Core Components**
- `FitnessScore.tsx`: Transform into Apple Activity Ring style with gradient fills and animated ring drawing
- `MetricCard.tsx`: Apple Health summary card style (large metric, subtle sparkline, no heavy borders)
- `ComparisonCard.tsx`: Apple-style delta badges with color-coded indicators
- `ProgressChart.tsx`: Rounded progress bars with gradient fills matching Apple palette
- `TrendChart.tsx`: Apple Health-style area charts with subtle gradients

**Phase 3: Dashboard Layout + Header**
- `page.tsx`: Redesign header (frosted glass / blur backdrop), improve empty/loading/error states
- `Overview.tsx`: Better visual hierarchy — hero score section, responsive grid, animated category expansion
- `CategoryDetail.tsx`: Apple Health-style metric detail cards with better spacing
- Tabs → Apple-style segmented control

**Phase 4: Interactions + Polish**
- Add `framer-motion` for smooth enter/exit animations, spring transitions
- Score count-up animation on load
- Card hover effects (subtle lift/scale)
- Smooth range tab transitions
- Category expand/collapse animation
- Loading skeleton placeholders (shimmer effect)

### Risks
1. **Recharts limitations**: Recharts may not support Apple-style gradient ring charts natively — may need custom SVG overlays
2. **framer-motion bundle size**: Adding framer-motion increases JS bundle (~30KB gzipped). Alternative: CSS-only animations for simpler effects
3. **Font licensing**: SF Pro is Apple-proprietary for Apple platforms only. Web must use Inter or system `-apple-system` stack
4. **Dark mode**: Apple Health primarily uses light mode with dark mode support. Must ensure dark mode isn't broken
5. **Responsive design**: Apple Health on iPad vs iPhone has different layouts. Need to maintain mobile responsiveness

### Scope Estimate
- Files to modify: ~12 files (globals.css, layout.tsx, page.tsx, 5 chart components, 4 UI primitives, Overview.tsx, CategoryDetail.tsx)
- Files to create: 0 (or 1 animation utilities file)
- New dependencies: possibly `framer-motion` (optional — can use CSS animations instead)
- Estimated lines of change: 400-600 lines across all files

## Specification Assessment

This feature **needs a UX specification** before planning. Reasons:

1. **Significant UX changes**: Complete visual redesign of the entire dashboard — layout, colors, typography, spacing, and interactions
2. **Multiple interaction patterns**: Hover states, animations, expand/collapse, segmented controls, loading skeletons
3. **Design decisions needed**: Exact color palette, shadow values, font weights, animation timing, spacing scale
4. **Apple design fidelity**: The degree to which we should mimic Apple Health vs. create an Apple-*inspired* design needs UX decision
5. **Component visual hierarchy**: How to prioritize the fitness score, metrics, trends, and comparisons visually

**Needs Specification**: Yes

## Questions for Human Review

1. **Font choice**: Should we use Inter (closest to SF Pro on web) or the system `-apple-system, BlinkMacSystemFont` stack? Inter gives more control; system font is truly native.
2. **Animation library**: Should we add `framer-motion` for rich animations, or keep it CSS-only for a lighter bundle?
3. **Dark mode priority**: Should we focus primarily on light mode (Apple Health default) or ensure both modes are equally polished?
4. **Activity Rings**: Should we implement true Apple-style activity rings (3 concentric colored rings) or keep the current single radial gauge?
5. **Scope boundary**: Is this purely a CSS/visual makeover, or should we also restructure the dashboard layout (e.g., add a sidebar, tabbed sections)?

## Next Steps

Ready for **specification phase** — a UX specification should define the exact visual design system (colors, typography, spacing, shadows, animation timing) and component-level mockup descriptions before implementation planning begins.
