# Research: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-88
**Date**: 2026-02-16
**Status**: Complete

## Summary

Redesign the Ralph Apple Health Dashboard to match Apple's HealthKit/Health app visual style. This involves an end-to-end UI makeover: new typography system (SF Pro family), Apple's color language, card design patterns (frosted glass, generous spacing), smooth animations/transitions, and interaction refinements. The app currently uses a basic shadcn/ui + Tailwind setup with Geist fonts and needs transformation into an Apple Health-inspired experience.

## Requirements Analysis

From the issue description:
1. **Apple-style UI makeover** - The dashboard should look and feel like an Apple Health app
2. **Styling** - Colors, spacing, border radius, shadows, backgrounds matching Apple's design language
3. **Fonts** - Switch to Apple-style typography (SF Pro or equivalent web fonts)
4. **Interactions** - Smooth transitions, hover effects, click feedback matching Apple's HIG
5. **Live Preview** - Maintain a running dev server so changes can be monitored in real-time

### Apple Health Design Characteristics (Reference)
- Clean white/light gray backgrounds with subtle depth
- SF Pro Display for headings, SF Pro Text for body (web fallback: system-ui or Inter)
- Generous padding and spacing (16-24px card padding)
- Large rounded corners (16-20px radius)
- Colored ring/arc charts for fitness scores
- Vibrant accent colors: health red (#FF2D55), activity green (#30D158), exercise yellow-green (#A8D45A), move red (#FA114F)
- Subtle shadows with light card borders
- Smooth 0.3s ease transitions
- Category sections with icon + label headers
- Minimal chrome, content-first approach
- Haptic-like feedback on interactions (scale transforms on press)

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/layout.tsx` | 1-35 | Root layout, font loading | **Modify**: Replace Geist fonts with SF Pro / Inter, update metadata |
| `src/app/globals.css` | 1-126 | Tailwind imports, CSS variables, theme | **Modify**: Complete color palette overhaul, new radius/shadow tokens, Apple typography scale |
| `src/app/page.tsx` | 1-205 | Main dashboard page | **Modify**: Header redesign, tab styling, loading/empty states, layout spacing |
| `src/components/dashboard/Overview.tsx` | 1-110 | Dashboard layout orchestrator | **Modify**: Section spacing, card arrangement, expand/collapse animations |
| `src/components/dashboard/CategoryDetail.tsx` | 1-89 | Expandable category view | **Modify**: Grid layout, card styling, transitions |
| `src/components/dashboard/RunningMetrics.tsx` | 1-15 | Running category wrapper | Minor - delegates to CategoryDetail |
| `src/components/dashboard/GymMetrics.tsx` | 1-15 | Gym category wrapper | Minor - delegates to CategoryDetail |
| `src/components/dashboard/index.ts` | 1-5 | Dashboard exports | No change needed |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial fitness score gauge | **Modify**: Apple-style ring chart colors, typography, layout |
| `src/components/charts/MetricCard.tsx` | 1-50 | Metric summary card with sparkline | **Modify**: Apple card styling, typography hierarchy, sparkline colors |
| `src/components/charts/ProgressChart.tsx` | 1-50 | Horizontal bar chart breakdown | **Modify**: Apple-style bar colors, typography |
| `src/components/charts/TrendChart.tsx` | 1-83 | Area/line trend chart | **Modify**: Chart colors, grid styling, tooltip design |
| `src/components/charts/ComparisonCard.tsx` | 1-46 | Week-over-week comparison | **Modify**: Apple card styling, delta indicators |
| `src/components/charts/index.ts` | 1-5 | Chart exports | No change needed |
| `src/components/ui/card.tsx` | 1-93 | shadcn Card component | **Modify**: Apple-style card with larger radius, refined shadows |
| `src/components/ui/button.tsx` | 1-64 | shadcn Button component | **Modify**: Apple-style button variants |
| `src/components/ui/tabs.tsx` | 1-92 | shadcn Tabs component | **Modify**: Apple-style segmented control look |
| `src/components/ui/progress.tsx` | 1-31 | Radix Progress bar | **Modify**: Apple-style progress indicator |
| `src/lib/utils/formatters.ts` | 1-75 | Number/metric formatting, trend icons/colors | **Modify**: Update trend colors to Apple palette |
| `src/lib/utils.ts` | 1-7 | cn() utility | No change needed |
| `src/lib/utils/date-helpers.ts` | 1-93 | Date utilities | No change needed |
| `src/types/analytics.ts` | 1-47 | TypeScript types | No change needed |
| `src/lib/mock/dashboard-preview.ts` | 1-782 | Preview/demo data generator | No change needed (data layer) |
| `src/config/metrics.ts` | N/A | Health type mappings | No change needed |
| `src/app/import/page.tsx` | N/A | Import page | **Modify**: Match Apple styling for consistency |

## Code Patterns and Conventions

### Naming Conventions
- Components: PascalCase files + PascalCase exports (e.g., `FitnessScore.tsx` exports `FitnessScore`)
- Utilities: camelCase files + camelCase exports (e.g., `formatters.ts` exports `formatMetricValue`)
- CSS: Tailwind utility classes, no CSS modules
- Path alias: `@/` maps to `./src/`

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
        {/* content */}
      </CardContent>
    </Card>
  );
}
```

### UI Component Pattern (shadcn/ui)
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

### Color/Trend Utility Pattern
```typescript
// Example from src/lib/utils/formatters.ts:49-75
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

### Import/Export Pattern
```typescript
// Barrel exports from src/components/dashboard/index.ts
export { Overview } from './Overview';
export { RunningMetrics } from './RunningMetrics';
export { GymMetrics } from './GymMetrics';
export { CategoryDetail } from './CategoryDetail';
```

## Integration Points

### Key Interfaces (No changes needed - data layer stays the same)
```typescript
// From src/types/analytics.ts:1-47
export interface DashboardData {
  overall_score: number | null;
  overall_trend: 'improving' | 'stable' | 'declining';
  categories: {
    running: CategoryScore;
    gym: CategoryScore;
  };
  last_sync: string | null;
}

export interface CategoryScore {
  name: string;
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  metrics: MetricSummary[];
  weekComparison?: WeekComparisonMetric[];
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

export type DateRange = '30d' | '60d' | '90d' | '365d';
```

### Extended API Response Type
```typescript
// From src/lib/mock/dashboard-preview.ts:8-11
export type DashboardApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
  total_records: number;
};
```

### Data Flow
The data layer (API routes, SQLite, mock data) remains unchanged. The redesign is purely presentational:
- `page.tsx` fetches from `/api/analytics?range={range}` or uses mock data
- Data flows into `<Overview>` component
- Overview distributes to chart and category components
- All styling is via Tailwind classes and CSS variables

### Chart Library: Recharts
All charts use Recharts (v3.7.0). The redesign will change chart colors, tooltips, and styling but not the Recharts component structure itself:
- `RadialBarChart` in FitnessScore
- `LineChart` in MetricCard (sparkline)
- `BarChart` in ProgressChart
- `AreaChart/LineChart` in TrendChart

## Testing Infrastructure

### Test Runner & Commands
- Runner: Vitest (v4.0.18)
- Run all: `npm test` or `vitest run`
- Run specific: `vitest run __tests__/lib/analytics/`
- Config: `vitest.config.ts`

### Existing Test Files
- `__tests__/api/analytics-route.test.ts` - API analytics endpoint tests
- `__tests__/integration/import-pipeline.test.ts` - Import pipeline integration tests
- `__tests__/lib/analytics/fitness-score.test.ts` - Fitness score calculation tests
- `__tests__/lib/mock/dashboard-preview.test.ts` - Dashboard preview data tests

### Test Patterns
Tests are focused on business logic (analytics, data processing). UI component tests do not currently exist. The redesign is purely visual and should not break existing tests since no data interfaces change.

## Implementation Considerations

### Approach: Apple Health Design System Transformation

The redesign should be structured into these logical phases:

#### Phase 1: Design Tokens & Typography Foundation
- Replace CSS variables in `globals.css` with Apple-inspired color palette
- Switch fonts from Geist to SF Pro Display/Text (or Inter as web fallback)
- Define new spacing scale, border radius tokens, shadow system
- Update base card, button, and tab components

#### Phase 2: Core Component Restyling
- Redesign `FitnessScore.tsx` - Apple Health ring chart style with vibrant colors
- Redesign `MetricCard.tsx` - Apple-style summary cards with refined typography
- Redesign `ComparisonCard.tsx` - Clean delta indicators
- Update `ProgressChart.tsx` and `TrendChart.tsx` - Apple chart aesthetics

#### Phase 3: Dashboard Layout & Interactions
- Redesign `page.tsx` header - Apple-style navigation bar
- Redesign `Overview.tsx` layout - Section headers, spacing, card grid
- Redesign `CategoryDetail.tsx` - Smooth expand/collapse animations
- Add transitions and hover effects throughout

#### Phase 4: Polish & Consistency
- Import page styling consistency
- Dark mode refinement
- Responsive layout adjustments
- Loading state animations

### Design Decisions That Need Specification

1. **Font Choice**: SF Pro is not freely available as a web font. Options:
   - Use `system-ui` font stack (uses SF Pro on Apple devices natively)
   - Use Inter (closest free alternative to SF Pro)
   - Use a combination: `system-ui` primary with Inter as fallback

2. **Color Palette**: Apple Health uses specific accent colors:
   - Activity rings: Move (red #FA114F), Exercise (green #A8D45A), Stand (blue #5AC8FA)
   - Health categories: Heart (#FF2D55), Fitness (#30D158), Body (#5856D6)
   - Should we use Apple's exact colors or an inspired palette?

3. **Card Design**: Apple uses both:
   - Flat cards with subtle borders (iOS 17+ style)
   - Glassmorphism/frosted cards (less common)
   - Which style to adopt?

4. **Score Visualization**: Apple Health uses:
   - Concentric activity rings (three rings)
   - Single metric circular progress
   - Should the fitness score be a single ring or multi-ring?

5. **Animation Level**:
   - Minimal (transitions only, 0.2-0.3s)
   - Moderate (scale/opacity on interactions, spring animations)
   - Full (parallax, stagger, complex motion)

### Risks
- **Font licensing**: SF Pro has restricted distribution; using system-ui stack is safest
- **Chart customization limits**: Recharts has limited styling flexibility for truly custom Apple-style charts
- **Performance**: Adding many CSS transitions and animations could impact rendering
- **Browser consistency**: Apple-specific visual effects (backdrop blur, etc.) may not work identically across browsers

### Scope Estimate
- Files to modify: ~15 files
- Files to create: 0 (all modifications to existing files)
- Estimated lines of change: ~400-600 lines across all files

## Specification Assessment

This feature **absolutely needs a UX specification** before planning:

1. **Significant UX changes**: Complete visual redesign of every dashboard screen
2. **Multiple valid design directions**: Apple Health style can be interpreted many ways (iOS 16 vs 17 vs 18 style, dark vs light emphasis, animation intensity)
3. **Font and color decisions**: Critical choices about typography, color palette, and card design that affect every component
4. **Interaction patterns**: New hover states, click feedback, expand/collapse animations need definition
5. **The feature IS the UX**: This isn't a backend change with a UI surface - the entire deliverable is a UX transformation

**Needs Specification**: Yes

## Questions for Human Review

1. Should we target iOS 17/18 style (flatter, more colorful) or iOS 16 style (more depth/shadows)?
2. Is dark mode support required in the initial redesign, or light mode only?
3. Should the import page also get the Apple treatment, or just the dashboard?
4. Are there specific Apple Health screens/sections to use as primary reference?
5. Budget for external font licensing (SF Pro) vs free alternatives (Inter)?

## Next Steps

Ready for specification phase. The specification worker should:
1. Define the exact Apple Health visual language to adopt (iOS version reference)
2. Choose font stack and color palette
3. Specify card designs, spacing, and interaction patterns
4. Create component-level design requirements for each UI element
5. Define animation/transition specifications

## Preview

**Dev server running at**: https://3000-kustnqdm6nbvejsv.proxy.daytona.works

The dashboard is live with preview/mock data showing the current (pre-redesign) state. Switching between date range tabs (30d/60d/90d/365d) and clicking Running/Gym category cards demonstrates the current interaction patterns that will be enhanced.
