# PR: TEST-AGI-77 - Ralph HealthKit View (Neobrutalist Style)

**Branch**: `dawn/TEST-AGI-77`
**Linear Issue**: TEST-AGI-77
**Date**: 2026-02-16

## Summary

Applies a neobrutalist design system across the Ralph HealthKit dashboard. All UI primitives (Card, Button, Tabs, Progress) and page layouts have been updated with bold black borders, hard offset box shadows, bright saturated colors, and heavy typography.

## Problem

The dashboard used default shadcn/ui styling which, while clean, lacked visual personality. The user requested a neobrutalist aesthetic to give the app a distinctive, bold look.

## Solution

Updated the CSS custom properties and Tailwind utility classes across all UI components to implement neobrutalist design patterns:

- **Bold borders**: 2-3px solid black borders on all interactive and container elements
- **Hard shadows**: Offset box shadows with zero blur (e.g., `4px 4px 0px`) for a layered paper effect
- **Interactive feedback**: Buttons translate toward their shadow on hover/press, creating a physical button-press illusion
- **Warm palette**: Off-white (#fffdf7) background, vibrant accent orange (#ff6b35), saturated chart colors
- **Heavy typography**: font-black and font-bold throughout for headings, labels, and values

## Changes

### Core UI Primitives
- `src/app/globals.css` - Neobrutalist color palette (light + dark themes)
- `src/components/ui/card.tsx` - Thick border, hard box shadow
- `src/components/ui/button.tsx` - Thick borders, hard shadows, press/hover effects
- `src/components/ui/tabs.tsx` - Thick borders, hard shadows, bold active state
- `src/components/ui/progress.tsx` - Thick border, increased height

### Page Layouts
- `src/app/page.tsx` - Header styling, preview badge
- `src/app/import/page.tsx` - Header and title styling
- `src/components/import/FileUpload.tsx` - Drag zone, results cards

### Dashboard Components
- `src/components/dashboard/Overview.tsx` - Chart color
- `src/components/dashboard/CategoryDetail.tsx` - Headings, chart color
- `src/components/charts/MetricCard.tsx` - Labels, sparkline styling
- `src/components/charts/ComparisonCard.tsx` - Labels, delta values
- `src/components/charts/FitnessScore.tsx` - Score display, trend text
- `src/components/charts/TrendChart.tsx` - Stroke width

## Testing

### Automated
- [x] Tests pass (`npm test`) - 42/42 passing
- [x] TypeScript compiles (`npm run typecheck`) - no errors
- [x] Lint passes (`npm run lint`) - 0 errors

### Manual Verification
- Dev server running with live preview at the Daytona preview URL
- All pages render correctly with neobrutalist styling

## Breaking Changes

None - all changes are purely visual (CSS/Tailwind classes). No API, logic, or type changes.

## Migration Notes

None

## Live Preview

https://3000-eacwh1mrv8vczezg.proxy.daytona.works

---
🤖 Created by [Dawn](https://github.com/ob1-sg/dawn) with [Claude Code](https://claude.ai/code)
