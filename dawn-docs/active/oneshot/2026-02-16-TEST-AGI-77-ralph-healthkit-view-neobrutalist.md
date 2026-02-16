# Oneshot: Ralph HealthKit View (Neobrutalist Style)

**Issue**: TEST-AGI-77
**Date**: 2026-02-16
**Status**: Complete

## What Was Done

Applied neobrutalist design system across the entire Ralph HealthKit dashboard application. The neobrutalist style is characterized by bold black borders (2-3px), hard box shadows with no blur (offset shadows), bright saturated accent colors, flat backgrounds (warm off-white), and heavy/black font weights.

### Design System Changes

**Color Palette**:
- Background: warm off-white (#fffdf7) instead of pure white
- Borders: solid black (#1a1a1a) instead of light gray
- Accent: vibrant orange (#ff6b35)
- Chart colors: punchy saturated palette (#ff6b35, #4361ee, #2ec4b6, #f72585, #7209b7)

**Visual Elements**:
- Cards: 2px black borders with 4px hard offset box shadows
- Buttons: 2px black borders with 3px hard shadows, interactive press/hover effects (translate + shadow reduction)
- Tabs: 2px black borders with 3px hard shadows, bold active state borders
- Progress bars: 2px borders, slightly thicker height
- Typography: font-black/font-bold throughout for headings and labels
- Headers: 3px bottom border, font-black tracking-tight titles

## Files Changed

- `src/app/globals.css` - Updated CSS custom properties with neobrutalist color palette (both light and dark themes)
- `src/components/ui/card.tsx` - Added thick border, hard box shadow, bolder title text
- `src/components/ui/button.tsx` - Added thick borders, hard shadows, interactive press/hover translate effects
- `src/components/ui/tabs.tsx` - Added thick borders, hard shadows, bolder font weight
- `src/components/ui/progress.tsx` - Added thick border, slightly larger height
- `src/app/page.tsx` - Updated header with 3px border, font-black title, neobrutalist preview badge
- `src/app/import/page.tsx` - Updated header and title styles to match neobrutalist theme
- `src/components/import/FileUpload.tsx` - Updated drag zone, icon container, and results cards with neobrutalist borders and theme colors
- `src/components/dashboard/Overview.tsx` - Updated chart color to neobrutalist palette blue
- `src/components/dashboard/CategoryDetail.tsx` - Bolder headings and labels, chart color updated to accent orange
- `src/components/charts/MetricCard.tsx` - Bolder labels, thicker sparkline stroke with dark color
- `src/components/charts/ComparisonCard.tsx` - Bolder labels and delta values
- `src/components/charts/FitnessScore.tsx` - Font-black score, bolder trend text, warmer background track
- `src/components/charts/TrendChart.tsx` - Thicker chart stroke width (3px)

## Verification

- Tests: PASS (42/42)
- TypeScript: PASS (no errors)
- Lint: PASS (0 errors, 5 pre-existing warnings)

## Notes

- The neobrutalist style uses warm off-white (#fffdf7) as the base background color rather than pure white, giving it an analog/paper feel
- Interactive elements (buttons) have press effects that shift the element toward the shadow offset when hovered/clicked, creating a physical "button press" illusion
- Dark mode theme has also been updated with matching neobrutalist values
- All changes are purely visual (CSS/Tailwind classes) with no logic modifications
