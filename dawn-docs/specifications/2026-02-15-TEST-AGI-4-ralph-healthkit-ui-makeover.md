# Specification: Ralph HealthKit View — UI Makeover

**Issue**: TEST-AGI-4
**Date**: 2026-02-15
**Research**: dawn-docs/research/2026-02-15-TEST-AGI-4-ralph-healthkit-view-ui-makeover.md
**Status**: Complete

## Executive Summary

Ralph is a personal Apple Health dashboard that currently uses a default shadcn/ui neutral theme — functional but without personality. This specification defines a visual makeover that gives Ralph a warm, confident identity inspired by premium fitness apps (Strava, Oura, Apple Fitness+), adds purposeful motion to make the experience feel alive, and improves information density so users can read their fitness story at a glance.

## User Experience Goals

### Primary Goal
The user opens Ralph and immediately understands how their fitness is trending — the dashboard should feel like a personal coach summarizing your week, not a spreadsheet.

### Experience Principles
- **Simplicity**: Reduce visual noise. Fewer borders, less gray, more whitespace. Let data breathe. Remove redundant sync status footer (header already shows it).
- **Delight**: The fitness score ring animates on load. Cards respond to hover with subtle lift. Trend arrows carry color meaning. The experience feels responsive and alive.
- **Polish**: Consistent color tokens everywhere — no hardcoded hex values. Smooth 200ms transitions on all interactive elements. Loading states use skeleton shimmer instead of plain text. Dark mode is accessible via a toggle.

## User Flows

### Happy Path — Dashboard
1. User opens Ralph. Header shows the brand name with a subtle gradient accent, last sync time, and an "Import Data" button.
2. Date range tabs (30d / 60d / 90d / 1 Year) sit below the header. The active tab has a colored underline that slides on switch. Content cross-fades when the range changes.
3. The fitness score ring draws itself with a 1-second arc animation, landing on the score number. The score is large, centered, and colored by status (red/amber/green). The trend label sits beneath.
4. Below the score, two category cards (Running, Gym) display in a 2-column grid. Each shows the category score, trend indicator, and a sparkline that is now large enough (80x32px) to be legible. Cards have a subtle hover lift effect (+2px translateY, shadow increase).
5. Clicking a category card expands an inline detail panel with a smooth height animation. The panel shows week-over-week comparison cards and metric trend charts. Clicking the card again collapses it.
6. Category breakdown shows as a horizontal bar chart with themed colors.
7. Score trend shows as an area chart with a gradient fill that uses the brand accent color.

### Happy Path — Import
1. User navigates to /import via the header button.
2. A large drag-drop zone with a dashed border and upload icon invites file drop. On drag-over, the border and background shift to the accent color with a gentle pulse.
3. User drops or browses for a .zip or .xml file. A progress bar fills with the brand accent color while a shimmer animation runs across it. Status text updates below.
4. On success, a result card appears with a green check icon, import stats in a 2x2 grid (records, workouts, date range, processing time), and a "Go to Dashboard" button.

### Edge Cases
| Scenario | User Experience |
|----------|-----------------|
| No data imported yet | Friendly empty state with illustration-style upload icon, warm copy: "Welcome to Ralph. Import your Apple Health data to see your fitness story." and a prominent "Import Data" button. |
| Score is null (insufficient data) | Score ring shows a gray dashed outline with "—" in the center and label: "Not enough data yet." |
| Single category only (e.g., no gym data) | Category grid collapses to single column. No empty card placeholder shown — keeps layout clean. |
| Sparkline has <2 data points | Sparkline area hidden. Card still shows value and trend text. |
| Very long date range (1 Year) | Charts use weekly aggregation. Axis labels auto-thin to prevent overlap. |

### Error States
| Error | User Message | Recovery Path |
|-------|--------------|---------------|
| API fetch failure | "Couldn't load your dashboard. Check your connection and try again." displayed in a card with a "Retry" button. | Retry button re-fetches data. |
| Invalid file type on import | "That file type isn't supported. Please upload a .zip or .xml file from Apple Health." | User selects a different file. Upload zone remains active. |
| Import processing failure | "Something went wrong processing your export. Try re-exporting from Apple Health." with a red accent indicator. | User can retry with a different file. |
| Chart rendering failure | Error boundary shows: "This chart couldn't load." with a small retry link. The rest of the dashboard remains functional. | Retry link re-mounts the chart component. |

## Interface Specifications

### Visual Direction: "Warm Precision"

A design direction that combines the warmth and approachability of consumer fitness apps with the precision and data-clarity of clinical dashboards. Light mode primary, dark mode secondary.

### Color Palette

**Brand Colors**
- **Accent**: A warm coral-orange (`oklch(0.72 0.19 40)`) — energetic, fitness-forward, distinguishes Ralph from the sea of blue SaaS dashboards. Used for active tab indicators, primary buttons, score ring background track, and chart accents.
- **Accent Foreground**: White (`oklch(0.985 0 0)`) — text on accent-colored surfaces.

**Neutral Foundation**
- **Background**: Warm off-white (`oklch(0.985 0.005 80)`) — not pure white, adds subtle warmth.
- **Card Background**: Pure white (`oklch(1 0 0)`) — cards "float" above the warm background.
- **Foreground**: Near-black with slight warmth (`oklch(0.17 0.01 60)`) — softer than pure black.
- **Muted Foreground**: Warm gray (`oklch(0.55 0.01 60)`) — for secondary text, labels.
- **Border**: Subtle warm gray (`oklch(0.92 0.005 80)`) — barely visible, structural only.

**Semantic Colors**
- **Positive/Improving**: Green (`oklch(0.72 0.19 155)`) — for upward trends, good scores, success states.
- **Warning/Fair**: Amber (`oklch(0.80 0.16 85)`) — for mid-range scores (50-70).
- **Negative/Declining**: Red (`oklch(0.63 0.22 25)`) — for downward trends, poor scores, errors.
- **Stable/Neutral**: Warm gray (`oklch(0.60 0.01 60)`) — for flat trends.

**Chart Palette** (5 colors, visually distinct at all sizes)
- Chart 1: Coral-orange (accent)
- Chart 2: Teal (`oklch(0.70 0.14 185)`)
- Chart 3: Indigo (`oklch(0.55 0.20 270)`)
- Chart 4: Amber (warning color)
- Chart 5: Rose (`oklch(0.65 0.20 10)`)

**Dark Mode**
- Background: Deep warm charcoal (`oklch(0.16 0.01 60)`)
- Card: Slightly lighter charcoal (`oklch(0.22 0.01 60)`)
- Accent remains the same coral-orange (high enough lightness to work on dark)
- All semantic colors shift to slightly higher lightness for dark-on-dark legibility

### Typography

**Keep Geist Sans and Geist Mono** — they are modern, highly legible, and already loaded. The makeover is about how we use them, not replacing them.

**Type Scale Adjustments**
| Element | Current | Proposed |
|---------|---------|----------|
| Page title ("Ralph") | text-2xl font-bold | text-xl font-semibold tracking-tight (less shouty, more refined) |
| Section titles | text-lg font-semibold | text-base font-semibold uppercase tracking-wide text-muted-foreground (quieter section labels) |
| Fitness score number | text-4xl font-bold | text-5xl font-bold tabular-nums (larger, monospace digits for alignment) |
| Metric values | text-2xl font-bold | text-2xl font-bold font-mono tabular-nums (monospace for data values) |
| Trend labels | text-sm font-medium | text-xs font-semibold uppercase tracking-wide (badge-like treatment) |
| Body text | default | text-sm (slightly smaller for denser information) |
| Small labels | text-xs | text-xs text-muted-foreground (consistent muted treatment) |

**Key Typography Decisions**
- Use `font-mono` (Geist Mono) for all numeric data values — scores, percentages, metric values. This creates a visual distinction between "data" and "labels" and ensures tabular alignment.
- Use `tabular-nums` on all numbers for consistent width across digits.
- Reduce overall heading sizes. The data is the star; headings should organize, not dominate.

### Card Design

**Current**: `rounded-xl border shadow-sm` — flat, uniform.

**Proposed**:
- Default cards: `rounded-2xl border border-border/50 shadow-sm` — larger radius, softer border (50% opacity), same subtle shadow.
- Elevated cards (fitness score, metric cards): `rounded-2xl shadow-md border-0` — drop the border entirely, use shadow for depth. Creates a layered, floating feel.
- Interactive cards (category cards): Add `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer` — lift on hover to signal clickability.
- Active/expanded cards: `ring-2 ring-accent/20 shadow-lg` — subtle accent ring to show selection state.

### Interactions

**Transitions (Global)**
- All interactive elements: `transition-all duration-200 ease-out` — consistent 200ms ease-out for all state changes.
- Color transitions: `transition-colors duration-150` — faster for color-only changes (hover backgrounds).

**Fitness Score Ring**
- On page load (or data change): The ring arc animates from 0 to the target score over 1000ms with an ease-out curve. The score number counts up in sync.
- This is the hero moment of the dashboard — it should feel satisfying to watch.
- Implementation note: Use CSS `stroke-dasharray` and `stroke-dashoffset` animation on an SVG, or Recharts' `isAnimationActive` prop.

**Category Cards**
- Hover: Card lifts 2px (`-translate-y-0.5`), shadow deepens (`shadow-md` to `shadow-lg`). Sparkline color shifts from gray to the accent color.
- Click: Card presses down briefly (`scale-[0.98]` for 100ms), then the detail panel expands below.
- Expand/Collapse: Detail panel animates height from 0 to auto over 300ms with ease-out. Content fades in with a 100ms delay to avoid layout-shift flash.

**Tab Switching**
- Active tab indicator (underline) slides horizontally to the new tab position over 200ms.
- Dashboard content cross-fades: outgoing content fades to 0 opacity over 150ms, incoming content fades in over 150ms.

**Sparklines**
- Increase size from 20x10px to 80x32px — current size is too small to convey meaningful trends.
- Use the accent color for the line stroke (instead of gray-500).
- Add a subtle gradient fill below the line (accent color at 10% opacity).

**Buttons**
- Hover: Background color shift (already exists).
- Active/Press: `scale-[0.97]` for 100ms — subtle press-down feedback.
- Focus: `ring-2 ring-accent ring-offset-2` — clear focus indicator for accessibility.

**Loading States**
- Replace "Loading dashboard..." text with skeleton screens:
  - Fitness score: Circular skeleton pulse where the ring would be.
  - Category cards: Card-shaped skeleton rectangles with shimmer animation.
  - Charts: Rectangular skeleton with shimmer.
- Skeleton shimmer: A gradient that sweeps left-to-right over 1.5s on repeat. Uses the `animate-pulse` from Tailwind combined with a subtle gradient overlay.

**Dark Mode Toggle**
- Small toggle in the header nav area (between sync time and Import button).
- Uses a sun/moon icon that rotates and cross-fades on toggle (180-degree rotation over 300ms).
- Respects `prefers-color-scheme` on first load, then stores preference in localStorage.
- Theme transition: All colors transition over 200ms when toggling — no harsh flash.

**File Upload (Import Page)**
- Drag-over: Border animates from dashed gray to solid accent color. Background pulses gently with accent/5 opacity. Upload icon scales up slightly (1.05x).
- Drop: Brief scale-down (0.97x for 100ms) as feedback, then upload begins.
- Progress bar: Uses accent color fill. A shimmer/shine animation sweeps across the filled portion.
- Success: Result card slides in from below with a fade-in (200ms). Green check icon does a brief scale-pop (0 to 1.1 to 1.0 over 300ms).

### Copy/Messaging

| Context | Current | Proposed |
|---------|---------|----------|
| Page title | "Ralph" | "Ralph" (keep it simple) |
| Loading | "Loading dashboard..." | (No text — skeleton screens instead) |
| Empty state | "No data yet. Import your Apple Health data to get started." | "Welcome to Ralph. Import your Apple Health export to see your fitness story." |
| Error state | Raw error message | "Couldn't load your dashboard. Check your connection and try again." |
| Sync status | "Last sync: {time}" | "Synced {time}" (shorter) |
| Import header | "Upload Apple Health Export" | "Import Health Data" (shorter) |
| Import instruction | "Drag and drop your export.zip file here, or click to browse" | "Drop your Apple Health export here, or browse to select" (shorter, friendlier) |
| File type hint | "Supports .zip and .xml files" | ".zip or .xml" (minimal) |
| Score trend section | "Score Trend" | "Your Progress" (more personal) |
| Category breakdown | "Category Breakdown" | "Breakdown" (shorter) |

### Feedback

| Action | Feedback |
|--------|----------|
| Page load | Skeleton screens shimmer → content fades in → score ring animates |
| Tab switch | Tab underline slides, content cross-fades |
| Category card hover | Card lifts, shadow deepens |
| Category card click | Brief press effect, detail panel slides open |
| File drag over upload zone | Border and background highlight |
| File upload in progress | Progress bar fills with shimmer, status text updates |
| Upload complete | Success card slides in, check icon pops |
| Upload error | Error card appears with red accent, clear message |
| Dark mode toggle | Colors transition smoothly, icon rotates |
| Button click | Scale-down press effect (97%) |

### Layout Adjustments

**Header Simplification**
- Remove the sync status footer card at the bottom of the page — it duplicates information already in the header. Saves vertical space.
- Add dark mode toggle to header nav.

**Spacing**
- Increase section spacing from `space-y-8` to `space-y-10` — more breathing room between dashboard sections.
- Category card grid gap stays at `gap-6`.

**Responsive Behavior**
- All existing breakpoints (1-col mobile, 2-col md:) remain unchanged.
- Fitness score ring: 160px on mobile, 200px on desktop (current behavior is fine).
- Sparklines: 64x24px on mobile, 80x32px on desktop.

## Success Metrics

How do we know the UX is successful?
- **Visual coherence**: Zero hardcoded hex colors in component files — all colors reference theme tokens.
- **Interaction coverage**: Every interactive element (buttons, cards, tabs, upload zone) has visible hover, active, and focus states.
- **Loading polish**: No plain-text loading states — all use skeleton screens.
- **Motion consistency**: All transitions use the same duration curve (200ms ease-out) unless intentionally different (score ring animation).
- **Dark mode parity**: All screens render correctly in both light and dark modes with no contrast issues.
- **Performance**: No animation jank — all animations use GPU-composited properties (transform, opacity) and run at 60fps.

## Out of Scope

- **Layout restructuring**: No new navigation patterns (sidebar, bottom nav), no grid reorganization. This is a visual restyling of the existing layout.
- **New features**: No new data displays, metrics, or pages.
- **Backend changes**: No API modifications.
- **Third-party font loading**: Keep Geist Sans/Mono. No new font downloads.
- **Advanced chart customization**: Custom Recharts tooltips, legends, or axis components are out of scope. Only color/sizing changes to existing chart configurations.
- **@ob1-sg/horizon integration**: The unused dependency is ignored.
- **Accessibility audit**: Beyond ensuring focus indicators and contrast ratios meet WCAG AA, a full accessibility audit is not in scope.

## Open Questions

1. **Accent color confirmation**: The proposed coral-orange (`oklch(0.72 0.19 40)`) is energetic and fitness-forward, but the user may prefer a different brand color (teal, blue, green). This is the single highest-impact design decision — everything flows from it.
2. **Dark mode default**: Should the app default to the system preference (`prefers-color-scheme`), or always start in light mode? The specification assumes system preference detection.
3. **Score ring animation on every tab switch?**: The spec proposes animating the score ring only on initial page load. If the user switches tabs (date ranges), the ring could either animate again or update instantly. Animating on every switch could feel fun or annoying depending on preference.

## Simplification Opportunities

1. **Remove sync status footer**: The header already shows "Synced {time}" and the "Import Data" button. The footer card is redundant — removing it saves a full-width card of vertical space.
2. **Reduce heading verbosity**: "Overall Fitness Score" → the score ring is self-explanatory when it's the hero element. A small "Fitness Score" label above the ring is sufficient. "Category Breakdown" → "Breakdown". "Score Trend" → "Your Progress".
3. **Simplify tab labels**: "30 Days" / "60 Days" / "90 Days" / "1 Year" → "30d" / "60d" / "90d" / "1y" (more compact, already used internally as enum values).
4. **Remove CardHeader from simple cards**: Some cards (like the sync footer) use CardHeader + CardTitle for what could be a simpler layout. Flatten where possible.
5. **Unify trend display**: Currently trend is shown as "↑ improving" text. Simplify to just the colored arrow icon with a tooltip for the word — less visual clutter on metric cards.
