# Research: Ralph HealthKit View (Glassmorphism Design Style)

**Issue**: TEST-AGI-1
**Date**: 2026-02-16
**Status**: Complete

## Summary

This task requires a complete UI makeover of the Ralph HealthKit dashboard, applying a Glassmorphism design style. The existing app uses standard shadcn/ui components with a plain white/dark theme. The redesign involves replacing the current flat card styles with frosted-glass effects (translucent backgrounds with backdrop-blur), introducing a rich gradient background, updating typography/fonts, adding smooth interaction animations and hover effects across all pages (dashboard home, import page).

## Requirements Analysis

From the issue description:
1. **Glassmorphism Design Style**: Translucent/frosted glass card backgrounds with `backdrop-blur`, subtle semi-transparent borders, layered depth via shadows and opacity
2. **Styling**: New color palette, gradient backgrounds, glass-effect cards, updated color tokens for the entire design system
3. **Fonts**: Replace current Geist Sans/Mono with fonts that complement the glassmorphism aesthetic (e.g., Inter, SF Pro-style, or a premium geometric sans-serif)
4. **Interactions**: Smooth hover effects, transitions, micro-animations on cards, buttons, and tabs; subtle glow/shine effects on interactive elements
5. **Live Preview**: A running dev server so the user can manually monitor changes — fulfilled via Daytona proxy URL

### Success Criteria
- Dashboard looks distinctly "glassmorphism" — frosted glass cards on a gradient background
- Consistent design language across all pages (home dashboard + import page)
- Smooth, polished interaction animations (hover states, transitions)
- Typography feels modern and premium
- Recharts visualizations integrate cleanly with the glass aesthetic
- No regressions — all existing functionality continues to work

## File Map

| File | Lines | Role | Relevance |
|------|-------|------|-----------|
| `src/app/globals.css` | 1-126 | Global styles, CSS variables, Tailwind theme | **Primary** — Must redefine all CSS custom properties for glassmorphism palette, add gradient background, glass utility classes |
| `src/app/layout.tsx` | 1-34 | Root HTML layout, font loading | **Must modify** — Change fonts from Geist to glassmorphism-appropriate font, potentially add background gradient wrapper |
| `src/app/page.tsx` | 1-205 | Main dashboard page | **Must modify** — Update header styles, card wrappers, loading/error/empty states with glass effects |
| `src/app/import/page.tsx` | 1-56 | Import page | **Must modify** — Apply glass styling to header, cards, instructions section |
| `src/components/ui/card.tsx` | 1-93 | Card component (used everywhere) | **Critical** — Add glassmorphism base styles: `backdrop-blur`, translucent `bg`, border opacity, shadow |
| `src/components/ui/button.tsx` | 1-64 | Button variants | **Must modify** — Add glass-style button variants, hover glow effects, transition animations |
| `src/components/ui/tabs.tsx` | 1-91 | Tabs component | **Must modify** — Glass-style tab list background, active state glow |
| `src/components/ui/progress.tsx` | 1-31 | Progress bar | **Must modify** — Glass-style track and indicator |
| `src/components/charts/FitnessScore.tsx` | 1-69 | Radial score gauge | **Must modify** — Update colors/backgrounds to complement glass theme, update background fill |
| `src/components/charts/MetricCard.tsx` | 1-50 | Summary metric cards | **Must modify** — Glass-effect card styling, sparkline color adjustments |
| `src/components/charts/ProgressChart.tsx` | 1-50 | Category bar chart | **Must modify** — Update bar colors and tooltip styling for glass theme |
| `src/components/charts/TrendChart.tsx` | 1-83 | Line/area trend charts | **Must modify** — Update chart colors, grid opacity, tooltip styling |
| `src/components/charts/ComparisonCard.tsx` | 1-46 | Week comparison cards | **Must modify** — Glass card styling |
| `src/components/charts/ChartErrorBoundary.tsx` | 1-42 | Error boundary | Minor — Glass card fallback |
| `src/components/dashboard/Overview.tsx` | 1-110 | Main dashboard layout | **Must modify** — Section spacing, card wrapper animations, expand/collapse transitions |
| `src/components/dashboard/CategoryDetail.tsx` | 1-89 | Expanded category view | **Must modify** — Glass cards, grid styling |
| `src/components/dashboard/GymMetrics.tsx` | 1-14 | Gym metrics wrapper | Minor — passes through to CategoryDetail |
| `src/components/dashboard/RunningMetrics.tsx` | 1-14 | Running metrics wrapper | Minor — passes through to CategoryDetail |
| `src/components/import/FileUpload.tsx` | 1-291 | File upload drag-drop | **Must modify** — Glass drop zone, progress bar, results card styling |
| `src/components/import/SyncSetup.tsx` | 1-116 | Sync status display | **Must modify** — Glass card styling |
| `src/lib/utils/formatters.ts` | 1-75 | Formatting + color helpers | **Must modify** — Update `getScoreColor`, `getScoreBgColor`, `getTrendColor` for glass-compatible palette |
| `src/types/analytics.ts` | 1-47 | TypeScript types | No changes needed |
| `src/lib/utils.ts` | 1-6 | cn() utility | No changes needed |
| `src/lib/mock/dashboard-preview.ts` | 1-781 | Mock data generator | No changes needed (data layer) |

## Code Patterns and Conventions

### CSS Custom Properties System
The app uses Tailwind CSS v4 with CSS custom properties defined in `globals.css`. All colors are specified in `oklch()` format:

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
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  /* ...chart colors, sidebar colors... */
}
```

Dark mode uses `.dark` class selector:
```css
/* From src/app/globals.css:84-116 */
.dark {
  --background: oklch(0.145 0 0);
  --card: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  /* ... */
}
```

### Font Loading (Next.js)
```typescript
// From src/app/layout.tsx:5-12
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

Applied via body class:
```tsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
```

Theme variables map fonts:
```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

### Component Pattern (shadcn/ui style)
Components use `cn()` merge utility and Tailwind classes:

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

### Chart Color Pattern
Charts use hardcoded hex colors:
```typescript
// From src/components/charts/FitnessScore.tsx:12-16
function getScoreHex(score: number): string {
  if (score < 50) return '#ef4444';   // red
  if (score < 70) return '#eab308';   // yellow
  return '#22c55e';                    // green
}
```

Trend charts use inline color props:
```tsx
// From src/components/dashboard/Overview.tsx:103
<TrendChart data={data.score_history} dateRange={dateRange} color="#3b82f6" />

// From src/components/dashboard/CategoryDetail.tsx:75
color="#6366f1"
```

### Interaction Pattern
Currently minimal — simple CSS transitions via Tailwind's `transition-all` on buttons. No explicit hover animations on cards or sections. Category expand/collapse is a simple conditional render with no animation.

### Import/Export Pattern
```typescript
// From src/components/charts/index.ts
export { TrendChart } from './TrendChart';
export { FitnessScore } from './FitnessScore';
export { MetricCard } from './MetricCard';
export { ProgressChart } from './ProgressChart';
```

### Layout Pattern
Dashboard uses a `container mx-auto px-6` wrapper with `space-y-8` vertical spacing between sections. Cards are placed in CSS Grid layouts:
```tsx
// From src/components/dashboard/Overview.tsx:48
<section className="grid grid-cols-1 gap-6 md:grid-cols-2">
```

## Integration Points

### Key Interfaces (No changes needed — purely visual redesign)
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

### Recharts Integration
All chart components use Recharts `ResponsiveContainer` wrapper. The glassmorphism redesign must ensure:
- Recharts tooltips are styled to match the glass theme (custom tooltip components or CSS overrides)
- Chart background colors work on translucent card backgrounds
- SVG chart fills/strokes use theme-compatible colors

### Data Flow
`page.tsx` fetches `/api/analytics?range=X` → receives `DashboardApiResponse` → passes to `<Overview>` → which renders `<FitnessScore>`, `<MetricCard>`, `<ProgressChart>`, `<TrendChart>`, and expandable `<RunningMetrics>`/`<GymMetrics>`. This data flow is purely visual; no API changes needed.

## Testing Infrastructure

### Test Runner & Commands
- Runner: Vitest
- Run all: `npm run test`
- Run specific: `npx vitest run __tests__/lib/mock/dashboard-preview.test.ts`

### Existing Test Files
- `__tests__/api/analytics-route.test.ts` — API route tests
- `__tests__/integration/import-pipeline.test.ts` — Import pipeline tests
- `__tests__/lib/analytics/fitness-score.test.ts` — Fitness scoring algorithm tests
- `__tests__/lib/mock/dashboard-preview.test.ts` — Mock data generation tests

### Test Pattern
```typescript
// Tests are standard Vitest with describe/it/expect
// This is a visual redesign — existing tests should pass unchanged since no business logic changes
```

### Build Verification
- `npm run build` — Next.js production build
- `npm run typecheck` — TypeScript type checking
- Both must pass after all changes

## Implementation Considerations

### Glassmorphism Technical Requirements
1. **Background**: Rich gradient (e.g., purple-blue-teal or similar) applied to `body` or a wrapper div
2. **Glass cards**: `background: rgba(255, 255, 255, 0.1)` + `backdrop-filter: blur(16px)` + `border: 1px solid rgba(255, 255, 255, 0.2)` + `box-shadow` for depth
3. **Dark-first design**: Glassmorphism works best on dark/rich backgrounds. The current light theme should be replaced with a dark gradient base
4. **Browser support**: `backdrop-filter` is well-supported (97%+ as of 2025). Safari requires `-webkit-backdrop-filter` prefix (Tailwind handles this automatically with `backdrop-blur-*`)

### Recommended Approach
1. **Phase 1: Foundation** — globals.css overhaul (gradient background, glass utility classes, CSS variable redesign), layout.tsx font change
2. **Phase 2: Core Components** — Card, Button, Tabs, Progress glass redesign
3. **Phase 3: Dashboard Components** — Overview, MetricCard, FitnessScore, chart components with glass styling + interactions
4. **Phase 4: Secondary Pages & Polish** — Import page, FileUpload, SyncSetup, hover animations, transition effects

### Font Recommendation
Replace Geist with **Inter** (widely available via `next/font/google`, clean geometric sans-serif that pairs well with glassmorphism). Alternatively, use **Plus Jakarta Sans** for a more premium feel.

### Risks
- **Recharts tooltip styling**: Recharts renders tooltips as DOM elements; custom styling may require custom tooltip components
- **Readability**: Text on translucent backgrounds needs sufficient contrast — may need text-shadow or increased background opacity
- **Performance**: Multiple `backdrop-blur` elements can impact rendering performance on low-end devices — use sparingly on nested elements
- **Chart SVG backgrounds**: RadialBarChart background fill (`#e5e7eb`) needs to change to a translucent value

### Scope Estimate
- Files to modify: ~18 files
- Files to create: 0 new files needed
- Estimated lines of change: ~400-600 lines (mostly CSS/className changes)

## Specification Assessment

This feature **needs a UX specification** because:
- It is a significant UX overhaul affecting all screens and components
- Multiple design decisions need to be made (color palette, gradient choices, blur intensities, animation styles, font pairing)
- The glassmorphism aesthetic requires careful balance between visual impact and readability/usability
- Interactive behaviors (hover effects, transitions, expand/collapse animations) need explicit definition
- A spec ensures the implementation is cohesive across all components rather than ad-hoc

**Needs Specification**: Yes

## Questions for Human Review

1. **Color palette preference**: Should the gradient background be purple-blue (modern tech), dark blue-teal (health/wellness), or something else?
2. **Dark mode only or both modes?**: Glassmorphism is most effective on dark/rich backgrounds. Should we keep the light mode or go dark-only?
3. **Font preference**: Inter (clean, universal) vs Plus Jakarta Sans (more premium/distinctive) vs keep Geist?
4. **Animation intensity**: Subtle (professional) or expressive (playful) hover effects and transitions?

## Next Steps

Ready for specification phase. The specification should define:
- Exact color palette and gradient values
- Glass card opacity/blur levels
- Font selection and scale
- Interaction animations and their timing
- How chart components integrate with the glass aesthetic
- Mobile responsiveness considerations for glass effects
