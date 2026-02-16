# PR: TEST-AGI-77 - Ralph HealthKit View (Neobrutalist Style)

**Branch**: `dawn/TEST-AGI-77`
**Linear Issue**: TEST-AGI-77
**Date**: 2026-02-16

## Summary

Applies a neobrutalist design system to the Ralph HealthKit dashboard. This transforms the existing clean/minimal UI into a bold, high-contrast design featuring thick black borders, hard box shadows, sharp corners, and heavy typography.

## Problem

The dashboard needed a distinctive visual identity with neobrutalist styling — a design trend characterized by raw, bold aesthetics with thick borders, hard shadows, and heavy typography.

## Solution

Updated the design system at two levels: global CSS variables (colors, border-radius) and individual component styling (borders, shadows, typography, animations). All changes are purely visual with no functional or behavioral modifications.

## Changes

### Global Theme (`globals.css`)
- Replaced oklch color values with warm neobrutalist palette
- Background: warm off-white (#fefaf0) instead of pure white
- Borders: solid black (#1a1a1a) for high contrast
- Accent: vibrant orange (#ff6b35)
- All border-radius set to 0px (sharp corners)

### UI Components
- **Card**: 2px black borders, 4px hard box shadows, bold uppercase titles
- **Button**: 2px borders, 3px hard shadows, hover/press translate animations
- **Tabs**: 2px border container, inverted active state (black bg, white text)
- **Progress**: 2px borders, taller bar, sharp corners

### Dashboard Components
- Bold uppercase headings throughout
- Font-black (900 weight) for all metric values
- Category cards with hover lift animation
- Charts with sharp corners and thick strokes

### Files Changed
- `src/app/globals.css` - Color palette and border-radius overhaul
- `src/components/ui/card.tsx` - Border and shadow styling
- `src/components/ui/button.tsx` - Border, shadow, and animation styling
- `src/components/ui/tabs.tsx` - Border and active state styling
- `src/components/ui/progress.tsx` - Border and height styling
- `src/app/page.tsx` - Header styling and preview badge
- `src/app/import/page.tsx` - Header and heading styling
- `src/components/import/FileUpload.tsx` - Upload zone and stats styling
- `src/components/dashboard/Overview.tsx` - Category button hover animation
- `src/components/dashboard/CategoryDetail.tsx` - Heading and value styling
- `src/components/charts/FitnessScore.tsx` - Score display and radial bar styling
- `src/components/charts/MetricCard.tsx` - Value display and sparkline styling
- `src/components/charts/ComparisonCard.tsx` - Value display styling
- `src/components/charts/ProgressChart.tsx` - Bar and axis styling

## Testing

### Automated
- [x] Tests pass (`npm test`) - 42/42
- [x] TypeScript compiles (`npx tsc --noEmit`)
- [x] Lint passes (`npm run lint`) - 0 errors

### Manual Verification
- Dev server running with neobrutalist styling visible at preview URL

## Breaking Changes

None - purely visual changes with no functional modifications.

## Migration Notes

None

## Live Preview

https://3000-3emtyek72485kpka.proxy.daytona.works

---
🤖 Created by [Dawn](https://github.com/ob1-sg/dawn) with [Claude Code](https://claude.ai/code)
