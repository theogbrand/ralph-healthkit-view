# PR: TEST-AGI-67 - Ralph HealthKit View (Apple-style)

**Branch**: `dawn/TEST-AGI-67`
**Linear Issue**: TEST-AGI-67
**Date**: 2026-02-16

## Summary

Transform the Ralph HealthKit dashboard from its current shadcn/ui appearance into a premium Apple Health-inspired experience. This is a pure visual/UI redesign across 14 files — no data model, API, or business logic changes.

## Problem

The existing dashboard uses default shadcn/ui styling which, while functional, doesn't match the premium Apple Health aesthetic that users expect from a health data visualization tool. The UI lacked visual hierarchy, micro-interactions, and the refined polish of Apple's design system.

## Solution

Implemented a comprehensive 4-phase Apple-style UI overhaul:

1. **Foundation** — Apple color palette (#F2F2F7 background, #007AFF primary), system font stack, borderless cards with soft shadows, consolidated color utilities
2. **Header & Layout** — Apple segmented control with sliding pill indicator, large bold title typography, skeleton shimmer loading, removed footer card
3. **Components** — Score ring with Apple colors and fill animation, hover-lift category cards, pill-shaped delta badges, category-specific color threading
4. **Charts** — SVG gradient fills, rounded progress bars with background tracks, subtle dashed grids, Apple-style tooltips

## Changes

### Files Changed
- `src/app/globals.css` — Apple color palette, 16px radius, animation keyframes, skeleton/ring-fill utilities
- `src/app/layout.tsx` — Removed Geist fonts, applied Apple system font stack via inline style
- `src/app/page.tsx` — Header restyle, segmented control, skeleton loading, spec copy for states, footer removal
- `src/components/ui/card.tsx` — Borderless cards, soft shadow, rounded-2xl, transition-all
- `src/lib/utils/formatters.ts` — Apple colors for scores/trends, added getScoreHex() and getTrendHex()
- `src/components/charts/FitnessScore.tsx` — Apple ring colors, fill animation, shared getScoreHex import
- `src/components/charts/MetricCard.tsx` — Apple typography, hover lift, color prop for sparkline
- `src/components/charts/ComparisonCard.tsx` — Pill delta badges with tinted backgrounds
- `src/components/charts/TrendChart.tsx` — SVG gradient fill, Apple axis/grid/tooltip styling
- `src/components/charts/ProgressChart.tsx` — Rounded bars, background tracks, shared getScoreHex import
- `src/components/dashboard/Overview.tsx` — Section headings, category colors, expand/collapse animation
- `src/components/dashboard/CategoryDetail.tsx` — Apple typography, category color prop, spec copy
- `src/components/dashboard/RunningMetrics.tsx` — Forward color prop (#30D158)
- `src/components/dashboard/GymMetrics.tsx` — Forward color prop (#007AFF)

## Testing

### Automated
- [x] TypeScript compiles (`npx tsc --noEmit`)
- [x] Lint passes (`npm run lint`) — only pre-existing warnings
- [x] Tests pass (`npm test`) — all 42 tests pass

### Manual Verification
- Dev server runs successfully on port 3000
- Preview mode provides mock data for visual inspection
- Segmented control slides smoothly between date ranges
- Category cards lift on hover
- Score ring animates on mount
- Charts display gradient fills with Apple-style tooltips

## Breaking Changes

None — this is a purely visual redesign with no API, data model, or behavior changes.

## Migration Notes

None — backward compatible.

## Live Preview

https://3000-xq3uhobqcakkowxp.proxy.daytona.works

## Screenshots

N/A — use live preview URL above for visual inspection.

---
