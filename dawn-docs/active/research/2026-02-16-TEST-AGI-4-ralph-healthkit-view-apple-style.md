# Research: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-4
**Date**: 2026-02-16
**Status**: Complete

## Summary

Plan a detailed Apple-style UI makeover for the Ralph HealthKit dashboard app. The current dashboard uses a generic shadcn/Tailwind design with basic Recharts charts. The task requires transforming it into an Apple Health-inspired design with proper styling, fonts, interactions, and animations. A live preview must run via `npm run dev` so the user can monitor changes in real time.

## Requirements Analysis

From the ticket description:

1. **Apple-style UI makeover**: Redesign the dashboard to match Apple's Health app aesthetic — clean whites, subtle grays, rounded cards, SF Pro-like typography, colored activity rings, smooth transitions
2. **Styling**: Apple's design language — generous whitespace, card-based layouts with soft shadows, muted backgrounds, vibrant accent colors for health metrics (green/red/blue/orange rings)
3. **Fonts**: Switch from Geist to SF Pro-like fonts (Inter is the closest web-available alternative to SF Pro; or use SF Pro directly if available)
4. **Interactions**: Smooth animations, hover effects, expandable sections, subtle transitions, tab switching animations
5. **Live Preview**: The app must be running (`npm run dev`) with mock/preview data visible so the user can manually see changes as they're made

### Success Criteria
- Dashboard visually resembles Apple Health app aesthetic
- Fonts feel premium and Apple-like
- Cards have Apple-style rounded corners, shadows, and spacing
- Charts use Apple Health color palette (activity rings: red/green/blue)
- Interactions include smooth animations and transitions
- Preview mode works with mock data and looks polished
- `npm run dev` serves the app for live monitoring

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/layout.tsx` | 1-35 | Root layout, font setup | **Must modify** — Change fonts from Geist to Inter/SF Pro |
| `src/app/globals.css` | 1-126 | Global CSS, theme variables | **Must modify** — Overhaul color palette, add Apple-style CSS variables, add animations |
| `src/app/page.tsx` | 1-185 | Main dashboard page | **Must modify** — Redesign header, layout structure, loading/empty states |
| `src/components/dashboard/Overview.tsx` | 1-110 | Main dashboard layout | **Must modify** — Restructure layout sections, add Apple-style spacing and card design |
| `src/components/dashboard/CategoryDetail.tsx` | 1-89 | Category detail with metrics grid | **Must modify** — Apple-style metric cards with colored accents |
| `src/components/dashboard/RunningMetrics.tsx` | 1-14 | Running metrics wrapper | Minor — May pass additional props for styling |
| `src/components/dashboard/GymMetrics.tsx` | 1-14 | Gym metrics wrapper | Minor — May pass additional props for styling |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial bar chart for fitness score | **Must modify** — Replace with Apple-style activity ring |
| `src/components/charts/MetricCard.tsx` | 1-50 | Card with sparkline | **Must modify** — Apple Health-style card design |
| `src/components/charts/TrendChart.tsx` | 1-83 | Area/line chart | **Must modify** — Apple-style chart colors, gradients, typography |
| `src/components/charts/ProgressChart.tsx` | 1-50 | Horizontal bar chart | **Must modify** — Apple-style progress bars with rounded caps |
| `src/components/charts/ComparisonCard.tsx` | 1-46 | Week comparison card | **Must modify** — Apple-style comparison layout |
| `src/components/charts/ChartErrorBoundary.tsx` | 1-42 | Error boundary | Minor — Style the error fallback |
| `src/components/ui/card.tsx` | 1-93 | Card primitives | **Must modify** — Update default card styles (radius, shadow, padding) |
| `src/components/ui/tabs.tsx` | 1-91 | Tabs primitives | **Must modify** — Apple-style segmented control look |
| `src/components/ui/button.tsx` | 1-64 | Button primitives | **Must modify** — Apple-style button design |
| `src/components/ui/progress.tsx` | ~30 | Progress bar | May modify for Apple-style appearance |
| `src/lib/utils/formatters.ts` | 1-75 | Value formatting, trend icons/colors | **Must modify** — Update trend colors to Apple palette, use SF Symbols-style icons |
| `src/lib/mock/dashboard-preview.ts` | 1-231 | Mock data generator | Likely no changes needed — data structure is fine |
| `src/types/analytics.ts` | 1-47 | Type definitions | Likely no changes — types support current needs |
| `src/config/metrics.ts` | 1-88 | Metric configs, score weights | No changes needed |
| `src/lib/utils.ts` | 1-6 | cn() utility | No changes needed |

## Code Patterns and Conventions

### Naming Conventions
- **Components**: PascalCase function components, exported individually (`export function Overview`)
- **Files**: PascalCase for components (`Overview.tsx`), kebab-case for utilities (`date-helpers.ts`)
- **CSS**: Tailwind utility classes, no CSS modules
- **Types**: Defined in `src/types/`, imported via `@/types/`

### Component Structure
```typescript
// Example from src/components/dashboard/Overview.tsx:28-33
export function Overview({ data, dateRange }: OverviewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));
  return (
    <div className="space-y-8">
      {/* sections */}
    </div>
  );
}
```

### Card Pattern
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

### Chart Pattern (Recharts)
```typescript
// Example from src/components/charts/FitnessScore.tsx:37-67
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

### Import/Export Pattern
```typescript
// Barrel exports from src/components/charts/index.ts
export { TrendChart } from './TrendChart';
export { FitnessScore } from './FitnessScore';
export { MetricCard } from './MetricCard';
export { ProgressChart } from './ProgressChart';

// Barrel exports from src/components/dashboard/index.ts
export { Overview } from './Overview';
export { RunningMetrics } from './RunningMetrics';
export { GymMetrics } from './GymMetrics';
export { CategoryDetail } from './CategoryDetail';
```

### Formatter Pattern
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

### Error Handling Pattern
```typescript
// From src/components/charts/ChartErrorBoundary.tsx:15-42
export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <Card><CardContent>Unable to render chart...</CardContent></Card>
      );
    }
    return this.props.children;
  }
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

### Mock Data API
```typescript
// From src/lib/mock/dashboard-preview.ts:8-11
export type DashboardApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
  total_records: number;
};
```

### Function Signatures
```typescript
// Dashboard page fetches data from:
// GET /api/analytics?range={30d|60d|90d|365d}
// Returns: DashboardApiResponse

// Mock data functions:
export function hasRealDashboardData(data: Pick<DashboardApiResponse, 'overall_score' | 'total_records'>): boolean;
export function getMockDashboardData(range: DateRange): DashboardApiResponse;

// Formatting utilities:
export function formatMetricValue(value: number, unit: string): string;
export function formatNumber(value: number, decimals?: number): string;
export function formatPace(minutesPerKm: number): string;
export function getScoreColor(score: number): string;
export function getScoreBgColor(score: number): string;
export function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string;
export function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string;
```

### Data Flow
```
User opens dashboard (/)
  → page.tsx fetches /api/analytics?range=90d
  → If no real data → uses getMockDashboardData(range) for preview mode
  → DashboardApiResponse flows to:
    → <Overview data={data} dateRange={range} />
      → <FitnessScore score={data.overall_score} trend={data.overall_trend} />
      → <MetricCard> for each category (Running, Gym)
      → <CategoryDetail> when expanded (with <ComparisonCard> and <TrendChart>)
      → <ProgressChart categories={data.categories} />
      → <TrendChart data={data.score_history} />
```

## Current Design Analysis

### What exists now (generic shadcn default):
- **Colors**: Neutral gray scale (oklch-based), no health-specific accent colors
- **Fonts**: Geist Sans / Geist Mono — modern but not Apple-like
- **Cards**: Standard shadcn cards — rounded-xl, thin border, shadow-sm, py-6 padding
- **Charts**: Basic Recharts with hardcoded hex colors (#ef4444 red, #eab308 yellow, #22c55e green, #3b82f6 blue, #6366f1 indigo)
- **Layout**: Simple stacked sections with `space-y-8`, container max-width
- **Interactions**: Click to expand category details (no animations), tab switching (instant, no transitions)
- **Header**: Basic text header with buttons, no visual polish

### What Apple Health looks like:
- **Colors**: Clean white background, vibrant colored rings (Activity: red #FA114F, Exercise: green #92E82A, Stand: cyan #00D4FF), soft card backgrounds
- **Fonts**: SF Pro Display/Text — tight letter-spacing, specific font weights (semibold for headers, regular for body, light for large numbers)
- **Cards**: Large rounded rectangles (20-24px radius), no visible borders, subtle drop shadows, generous padding
- **Charts**: Smooth gradients, thick rounded line caps, area fills with transparency, animated ring charts
- **Layout**: Full-width cards, generous spacing between sections, grouped sections with subtle headers
- **Interactions**: Spring animations on tap, smooth expand/collapse, parallax scroll effects, haptic-style visual feedback
- **Specific patterns**:
  - Activity rings (concentric circles, not radial bars)
  - Summary cards with large numbers and small labels
  - "Highlights" section with important changes
  - Date navigation with week/month/year views
  - Color-coded metric categories

## Testing Infrastructure

### Test Runner & Commands
- Runner: vitest v4.0.18
- Run all: `npm run test`
- Run specific: `npx vitest run __tests__/lib/mock/dashboard-preview.test.ts`
- Watch: `npm run test:watch`

### Existing Test Files
- `__tests__/integration/import-pipeline.test.ts` — Import pipeline integration tests
- `__tests__/lib/analytics/fitness-score.test.ts` — Fitness score calculation tests
- `__tests__/lib/mock/dashboard-preview.test.ts` — Mock data generation tests

### Test Patterns
```typescript
// Tests use vitest globals (describe, it, expect)
// Path aliases work via vitest.config.ts with @/ → ./src/
```

## Implementation Considerations

### Approach

The Apple-style makeover requires a systematic transformation across multiple layers:

1. **Font Layer**: Replace Geist with Inter (closest web font to SF Pro) — configure in layout.tsx, update globals.css font variables
2. **Color System**: Define Apple Health color palette as CSS custom properties — activity ring colors, card backgrounds, text hierarchy colors
3. **Card Styling**: Update shadcn Card component — larger radius (20px+), remove borders, add refined box-shadows, increase padding
4. **Chart Overhaul**: Transform recharts components to match Apple's aesthetic — activity rings instead of radial bars, gradient area fills, Apple color palette
5. **Animation Layer**: Add CSS transitions and spring-like animations via Tailwind's `transition-*` classes and the existing `tw-animate-css` library
6. **Layout Restructuring**: Reorganize the dashboard into Apple Health-like sections — summary at top, expandable detail cards, better spacing
7. **Tab/Segmented Control**: Restyle tabs to look like Apple's iOS segmented controls
8. **Interaction Polish**: Smooth expand/collapse transitions, hover states, active states, loading skeletons

### Recommended Font Strategy
- **Primary**: Inter (from Google Fonts via next/font) — closest free web alternative to SF Pro
- **Alternative**: If SF Pro is available (macOS users), can use system font stack `system-ui, -apple-system, BlinkMacSystemFont` which resolves to SF Pro on Apple devices
- **Recommendation**: Use Inter as primary with `-apple-system` fallback so it looks best on both Apple and non-Apple devices

### Apple Health Color Palette
- **Activity Ring Red**: #FA114F
- **Exercise Ring Green**: #92E82A
- **Stand Ring Cyan**: #00D4FF
- **Heart**: #FF2D55
- **Steps**: #FD9426
- **Sleep**: #8E8AFF
- **Background**: #F2F2F7 (light gray)
- **Card Background**: #FFFFFF
- **Primary Text**: #1C1C1E
- **Secondary Text**: #8E8E93

### Risks
- **Recharts limitations**: May not support true Apple-style concentric activity rings natively — may need custom SVG
- **Font licensing**: SF Pro is Apple's proprietary font; using Inter is legally safer for web
- **Performance**: Adding CSS animations to many cards could impact scroll performance on lower-end devices
- **Scope creep**: "Apple-style" is subjective — need clear boundaries on what constitutes "done"

### Scope Estimate
- Files to modify: ~15 (listed in File Map)
- Files to create: 0-2 (possible new animation utility or Apple ring component)
- Estimated lines of change: 500-800

### Dependencies (no new npm packages likely needed)
- `Inter` font is available via `next/font/google` (already the pattern used for Geist)
- `tw-animate-css` already installed for animations
- `recharts` already installed for charts
- No additional packages required

## Specification Assessment

This feature **needs a UX specification** before planning. Reasons:

1. **Significant UX changes**: Complete visual redesign of the dashboard
2. **Major UI modifications**: Every component needs visual rework
3. **Multiple interaction patterns**: Animations, transitions, expand/collapse behaviors, hover states
4. **UX decisions needed**: Exact Apple patterns to adopt vs adapt, specific color mapping, animation timing, responsive breakpoints
5. **Design ambiguity**: "Apple-style" could mean many things — spec phase should pin down exact reference screenshots and design tokens

**Needs Specification**: Yes

## Questions for Human Review

1. Should we use Inter font (free, web-safe) or attempt to use SF Pro (Apple-proprietary, only works on macOS)?
2. Should we implement actual Apple Health activity rings (concentric SVG circles) or keep the radial bar chart but restyle it?
3. Should dark mode be part of this makeover (the CSS already has dark mode variables)?
4. Are there specific Apple Health app screens to reference (e.g., Summary tab, specific metric detail views)?
5. Should the live preview use `npm run dev` with the existing mock data (mock preview mode), or does additional mock data setup needed?

## Next Steps

Ready for specification phase. The specification should:
- Define exact Apple Health design patterns to replicate
- Create a design token system (colors, spacing, radii, shadows, fonts)
- Specify animation behaviors and timing
- Define responsive breakpoints and mobile behavior
- Create mockup descriptions for each dashboard section
