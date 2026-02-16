# Specification: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-4
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-4-ralph-healthkit-view-apple-style.md
**Status**: Complete

## Executive Summary

Transform the Ralph HealthKit dashboard from a generic shadcn/Tailwind design into an Apple Health-inspired experience. Users will see a clean, premium interface with activity rings, vibrant health-category colors, smooth animations, and the spatial clarity Apple is known for. A live preview mode (`npm run dev`) with mock data lets the user watch changes as they happen.

## User Experience Goals

### Primary Goal
Give the user a polished, glanceable health dashboard that feels like Apple Health on the web — beautiful, fast, and immediately understandable.

### Experience Principles
- **Simplicity**: Large numbers, minimal labels, generous whitespace. No decoration that doesn't serve comprehension.
- **Delight**: Smooth spring-like expand/collapse, subtle hover lifts on cards, animated activity rings that fill on load.
- **Polish**: Consistent 20px radii, precise typography scale, Apple Health color palette, no visible borders on cards.

---

## Design Tokens

These values define the visual language. Every component references these tokens.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--apple-bg` | `#F2F2F7` | Page background (light gray) |
| `--apple-card` | `#FFFFFF` | Card surfaces |
| `--apple-text-primary` | `#1C1C1E` | Headings, large numbers |
| `--apple-text-secondary` | `#8E8E93` | Labels, captions, timestamps |
| `--apple-text-tertiary` | `#AEAEB2` | Placeholder text, disabled states |
| `--apple-separator` | `#E5E5EA` | Dividers between list items |
| `--apple-ring-red` | `#FA114F` | Overall fitness / Move ring |
| `--apple-ring-green` | `#92E82A` | Running / Exercise ring |
| `--apple-ring-cyan` | `#00D4FF` | Gym / Stand ring |
| `--apple-heart` | `#FF2D55` | Heart-related metrics |
| `--apple-steps` | `#FD9426` | Steps / distance metrics |
| `--apple-improving` | `#34C759` | Positive trends (Apple system green) |
| `--apple-declining` | `#FF3B30` | Negative trends (Apple system red) |
| `--apple-stable` | `#8E8E93` | Neutral trends |

### Typography

| Role | Font | Weight | Size | Letter-spacing |
|------|------|--------|------|----------------|
| Page title | Inter | 700 (Bold) | 34px | -0.02em |
| Section header | Inter | 600 (Semibold) | 22px | -0.01em |
| Card title | Inter | 600 (Semibold) | 17px | -0.01em |
| Large number | Inter | 300 (Light) | 48px | -0.03em |
| Body | Inter | 400 (Regular) | 15px | 0 |
| Caption | Inter | 400 (Regular) | 13px | 0 |

Font stack: `Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif`

This gives Inter on all platforms with SF Pro fallback on Apple devices.

### Spacing & Radii

| Token | Value |
|-------|-------|
| Card radius | 20px |
| Card padding | 20px |
| Card shadow | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` |
| Card shadow (hover) | `0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)` |
| Section gap | 24px |
| Inner card gap | 16px |
| Page horizontal padding | 20px |
| Page max-width | 640px (mobile-first, single-column like Apple Health) |

### Animation Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Card hover lift | 200ms | ease-out |
| Expand/collapse | 350ms | cubic-bezier(0.25, 1, 0.5, 1) (spring-like) |
| Ring fill on load | 800ms | cubic-bezier(0.65, 0, 0.35, 1) |
| Tab switch | 200ms | ease-in-out |
| Fade in (new content) | 250ms | ease-out |

---

## User Flows

### Happy Path: Opening the Dashboard

1. **User opens the app** → Sees the `#F2F2F7` gray background with "Ralph" title in bold 34px Inter, plus "Preview" badge in a soft pill shape
2. **Date range tabs appear** → Styled as an Apple iOS segmented control: solid pill background (`#E5E5EA`), selected segment is white with subtle shadow, smooth 200ms sliding indicator
3. **Activity ring loads** → Large concentric ring (overall score) animates from 0 to current value over 800ms. Score number fades in at center in 48px light weight. Trend label appears below in `--apple-text-secondary`
4. **Category summary cards** → Two full-width cards (Running, Gym) stacked vertically. Each shows: category name (17px semibold), large score number (48px light), colored accent bar on the left edge (green for Running, cyan for Gym), small sparkline on the right, and trend pill
5. **User taps a category card** → Card smoothly expands (350ms spring) to reveal detailed metrics below it. A subtle chevron rotates from `>` to `v`
6. **Inside expanded category** → Week comparison cards appear in a horizontal scroll row (like Apple Health highlights). Below that, individual metric cards show in a vertical list with sparklines
7. **Score trend chart** → Full-width area chart at the bottom with gradient fill matching the activity ring red color, smooth curve interpolation, clean date labels
8. **Category breakdown** → Horizontal progress bars with rounded caps, colored by score quality

### Happy Path: Switching Date Ranges

1. **User taps a different tab** (e.g., "30 Days") → Segmented control indicator slides smoothly to new position (200ms)
2. **Content fades** → Current data fades out slightly (150ms), new data fades in (250ms)
3. **Charts re-animate** → Activity ring re-fills to new value, trend chart redraws with updated date range

### Happy Path: Toggling Preview Mode

1. **User clicks "Preview Mode" toggle** (visible only when real data exists) → Toggle uses Apple-style switch appearance
2. **Data swaps** → Dashboard content cross-fades between real and mock data
3. **Preview badge** appears/disappears in header

### Edge Cases

| Scenario | User Experience |
|----------|-----------------|
| No data and no mock data | Centered empty state: large icon, "No Health Data Yet" heading, "Import your first dataset to get started" caption, prominent "Import Data" button in Apple blue (`#007AFF`) |
| Single category has null score | Category card shows "—" in place of score number, sparkline area is empty with a subtle dashed baseline, card is still tappable but expansion shows "Not enough data to show details" |
| All scores are 0 | Activity ring shows empty track (gray ring outline), score shows "0" with neutral trend, cards still functional |
| Very long metric labels | Text truncates with ellipsis after 1 line; full label visible on expand |
| Slow network / loading | Skeleton placeholders: rounded rectangles with a subtle shimmer animation matching card shapes. Skeleton for ring = circular outline. Skeleton for cards = 3 stacked rounded rects |

### Error States

| Error | User Message | Recovery Path |
|-------|--------------|---------------|
| API fetch fails | Card with: "Something went wrong" heading + "We couldn't load your health data. Check your connection and try again." + "Retry" button | Tap "Retry" refetches data. Button shows spinner during retry |
| Chart rendering error | Clean fallback card (via existing ChartErrorBoundary): "Unable to display this chart" in secondary text, no scary error details | Automatically contained; rest of dashboard remains functional |
| Import fails | Toast-style notification at top: "Import failed — please try again" in `--apple-declining` red | Auto-dismisses after 5 seconds, or tap to dismiss |

---

## Interface Specifications

### 1. Page Shell

- Background: `--apple-bg` (#F2F2F7)
- Content max-width: 640px, centered
- Horizontal padding: 20px
- Top padding: 16px

### 2. Header

- "Ralph" in 34px bold, `--apple-text-primary`
- "Preview" badge: small pill with `--apple-ring-red` background, white text, 13px caption weight, 6px vertical / 10px horizontal padding, full rounded
- Last sync: 13px caption in `--apple-text-secondary`, right-aligned
- No border. Separation comes from the gray background behind cards below

### 3. Date Range Segmented Control

Modeled on iOS `UISegmentedControl`:
- Container: `--apple-separator` background, full-rounded pill shape, 4px padding
- Segments: Equal-width text labels ("30D", "60D", "90D", "1Y")
- Selected segment: White background pill with `0 1px 3px rgba(0,0,0,0.12)` shadow, slides on selection
- Text: 13px semibold, `--apple-text-primary` when selected, `--apple-text-secondary` when not
- Height: 32px

### 4. Activity Ring (Overall Score)

Replace the current radial bar with a proper concentric ring:
- Single ring for overall score (use `--apple-ring-red`)
- Ring stroke width: 14px
- Ring diameter: 180px
- Background track: same color at 20% opacity
- Rounded stroke caps
- Animate from 0 to current value on load (800ms)
- Center: Score number in 48px light weight, colored by score quality
- Below ring: Trend label ("Improving", "Stable", "Declining") in 13px with colored dot prefix

### 5. Category Summary Cards

Full-width white cards:
- Left accent: 4px wide vertical bar in category color (green for Running, cyan for Gym)
- Layout: Left side has category name (17px semibold) + score (34px light) + trend pill. Right side has a small sparkline (60px tall, 100px wide)
- Trend pill: Small rounded badge showing arrow + percentage. Green background at 10% opacity with green text for improving, red for declining
- Tap target: entire card
- Hover: Card lifts slightly (translateY -2px, shadow increases) over 200ms
- Chevron: Right-aligned, subtle `--apple-text-tertiary`, rotates 90deg on expand

### 6. Expanded Category Detail

Appears below the tapped card with a 350ms spring animation (height grows from 0, content fades in):

**Week Comparison Row:**
- Horizontal scroll container (if more than 2 items)
- Each comparison item is a compact card (min-width 160px):
  - Label at top (13px caption, secondary color)
  - This week value: 22px semibold, primary color
  - Last week value: 13px, secondary color, labeled "last week"
  - Delta: Small badge, same style as trend pill

**Metric List:**
- Vertical stack of metric rows separated by `--apple-separator` lines (like a grouped iOS table)
- Each row: Label (left, 15px regular), Value + Unit (right, 15px semibold), small inline sparkline (40px wide) between
- No individual cards — just list rows inside the parent expanded card
- This is cleaner and more Apple-like than individual metric cards

### 7. Score Trend Chart

- Full-width card
- "Score Trend" section header (22px semibold) above the card
- Area chart with:
  - Line color: `--apple-ring-red`
  - Fill: gradient from `--apple-ring-red` at 30% opacity to transparent
  - Smooth curve interpolation (monotone)
  - Line width: 2.5px
  - Rounded line caps
- X-axis: Date labels in 11px, `--apple-text-tertiary`
- Y-axis: Hidden (Apple Health typically hides Y-axis for clean look; values appear in tooltip)
- Tooltip on hover: White card with shadow, shows date + formatted value
- Height: 200px

### 8. Category Breakdown (Progress Bars)

- Section header: "Categories" in 22px semibold
- Each category: Label (15px regular) on its own line above a full-width horizontal bar
- Bar: 8px tall, fully rounded, colored by score (use `--apple-improving` for good, `--apple-steps` for medium, `--apple-declining` for low)
- Background track: `--apple-separator`
- Score number at right end of bar row (15px semibold)
- Spacing: 16px between categories

### 9. Buttons

- Primary (Import Data): `#007AFF` (Apple system blue) background, white text, 15px semibold, 44px height, 20px radius, full-width on mobile
- Secondary (Retry): Transparent background, `#007AFF` text, 15px semibold, 44px height
- Hover: Slight darken (primary) or light blue background (secondary)

### 10. Loading Skeletons

- Match the shape and size of each element they replace
- Use a shimmer gradient animation (left to right sweep, 1.5s loop)
- Base color: `--apple-separator`, shimmer highlight: white at 50% opacity
- Skeleton for ring: Circle outline
- Skeleton for cards: Rounded rect matching card dimensions
- Skeleton for chart: Wavy line placeholder

---

## Copy/Messaging

| Context | Text |
|---------|------|
| Page title | "Ralph" |
| Preview badge | "Preview" |
| Empty state heading | "No Health Data Yet" |
| Empty state body | "Import your first dataset to get started." |
| Error heading | "Something went wrong" |
| Error body | "We couldn't load your health data. Check your connection and try again." |
| Loading | No text — skeleton only |
| Date range labels | "30D", "60D", "90D", "1Y" |
| Trend labels | "Improving", "Stable", "Declining" |
| Comparison label | "vs last week" |
| Section headers | "Score Trend", "Categories" |
| Sync status | "Updated {relative time}" or "Preview dataset" |
| Chart error fallback | "Unable to display this chart" |

---

## Success Metrics

How do we know the UX is successful?

- **Visual fidelity**: Side-by-side comparison with Apple Health shows recognizable design language — someone familiar with Apple Health should say "this looks like Apple Health"
- **Readability**: All key numbers (overall score, category scores) are legible within 1 second of opening the dashboard
- **Smoothness**: All animations run at 60fps — no jank on expand/collapse or tab switching
- **Consistency**: Every card uses the same radius, shadow, and padding — no visual outliers
- **Live preview works**: `npm run dev` serves the app with mock data, and the user can see changes reflected in real time

---

## Out of Scope

- **Dark mode**: Not part of this makeover (existing dark mode CSS vars remain but are not updated to Apple palette)
- **Mobile-native interactions**: No swipe gestures, pull-to-refresh, or haptic feedback (this is a web app)
- **New data sources or metrics**: No changes to data models, API, or mock data structure
- **Authentication or user management**: No login/account features
- **Accessibility overhaul**: Maintain existing keyboard/screen-reader support but don't expand it
- **Custom SVG activity rings**: If Recharts' RadialBarChart can be styled to closely approximate Apple rings (rounded caps, proper colors, background track), use that. Only build custom SVG if the result is clearly inferior

---

## Open Questions

1. **Activity ring complexity**: Should we show a single overall ring or three concentric rings (Overall / Running / Gym)? Single ring is simpler and sufficient given there are only 2 categories. **Recommendation: Single ring** — keeps the hero section clean.
2. **Horizontal scroll for comparison cards**: If there are only 3 comparison metrics per category, they fit without scrolling on most screens. Should we still implement horizontal scroll for future-proofing? **Recommendation: Yes** — it costs little and prevents layout breakage if metrics grow.

---

## Simplification Opportunities

1. **Remove redundant sync footer**: The last sync info currently appears in both the header and a footer card. Keep it only in the header — the footer is redundant clutter.
2. **Flatten metric cards into list rows**: Instead of individual cards for each metric inside an expanded category, use simple list rows separated by hairline dividers. This is more Apple-like and reduces visual noise.
3. **Hide Y-axis on trend chart**: Apple Health charts omit Y-axis labels for a cleaner look. Values are available via tooltip on hover. This removes visual clutter.
4. **Simplify date range labels**: Change "30 Days" / "60 Days" / "90 Days" / "1 Year" to "30D" / "60D" / "90D" / "1Y" — shorter labels make the segmented control more compact and Apple-like.
5. **Single-column layout**: Apple Health uses a single-column layout on phone. Since this dashboard has limited content (2 categories), a single-column 640px max-width layout is cleaner than a multi-column grid. The two category cards should stack vertically, not sit side by side.
