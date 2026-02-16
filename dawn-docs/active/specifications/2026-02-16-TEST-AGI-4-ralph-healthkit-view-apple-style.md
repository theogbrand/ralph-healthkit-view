# Specification: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-4
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-4-ralph-healthkit-view-apple-style.md
**Status**: Complete

## Executive Summary

Transform the Ralph HealthKit dashboard from a functional-but-generic data display into a polished, Apple Health-inspired experience. Users will see a clean, spacious dashboard with vibrant activity rings, smooth animations, and the unmistakable feel of an Apple-designed product — making their fitness data feel personal and motivating.

## User Experience Goals

### Primary Goal
Give users a fitness dashboard that feels as refined and motivating as Apple Health — where every number, chart, and card feels intentional, clear, and beautiful.

### Experience Principles
- **Simplicity**: Generous whitespace, clear visual hierarchy, and zero visual clutter. Every element earns its space. No heavy borders — depth comes from subtle shadows and layered backgrounds.
- **Delight**: Vibrant activity rings that feel alive, smooth fade-in animations on load, and satisfying hover interactions that respond instantly. The dashboard should feel like it's crafted, not assembled.
- **Polish**: Consistent 8px spacing grid, precise typography scale, matching color temperatures across light and dark modes, and graceful handling of every edge case (empty data, loading, errors).

## User Flows

### Happy Path
1. User lands on `/` — sees a brief skeleton shimmer (0.3s) then the dashboard fades in smoothly
2. The overall Fitness Score ring draws itself in with an animated arc, landing on their current score — vibrant green, amber, or red
3. Below the ring, two category cards (Running, Gym) sit side by side with clean typography showing score, trend arrow, and a subtle sparkline
4. A horizontal category breakdown bar and a trend line chart sit below, both in soft, muted Apple colors
5. User taps a category card — it gently expands downward revealing week-over-week comparisons and detailed metric cards, each with its own mini trend chart
6. User switches date range via a pill-shaped segmented control at the top — content cross-fades to the new data range
7. Footer shows last sync time and an Import button

### Edge Cases
| Scenario | User Experience |
|----------|-----------------|
| First visit, no data | Clean empty state with a friendly illustration-style prompt: "Welcome to Ralph. Import your Apple Health data to get started." and a prominent Import button |
| Single category has no data | Category card shows a soft dash (—) for score with muted "No workouts recorded" text. Card is not clickable. |
| Score is null | Activity ring shows empty gray track with "—" in the center. Trend indicator hidden. |
| Sparkline has < 2 points | Sparkline area is blank (no "not enough data" text — keep it clean) |
| Very long sync timestamp | Truncate with ellipsis; full date available on hover/tap tooltip |
| Preview mode active | Subtle frosted banner at top: "Preview Mode" with a dismiss/exit button |

### Error States
| Error | User Message | Recovery Path |
|-------|--------------|---------------|
| Network error on load | Card with: "Couldn't load your data. Check your connection and try again." + Retry button | Tap Retry to re-fetch |
| API returns malformed data | Same card: "Something went wrong. Try again." + Retry button | Tap Retry; if persistent, suggest Import |
| File upload fails | Red-tinted card: "Upload failed. {reason}" | User can try again immediately; upload area remains active |
| File type invalid | Inline message below drop zone: "Only .zip and .xml files are supported." | Drop zone remains active for correct file |

## Interface Specifications

### Visual Design System

#### Color Palette

**Light Mode**
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.985 0 0)` | Page background — warm off-white, not stark white |
| `--foreground` | `oklch(0.11 0 0)` | Primary text — rich near-black |
| `--card` | `oklch(1 0 0)` | Card surfaces — pure white to float above background |
| `--card-foreground` | `oklch(0.11 0 0)` | Card text |
| `--muted` | `oklch(0.965 0 0)` | Secondary surfaces (segmented control track) |
| `--muted-foreground` | `oklch(0.46 0 0)` | Secondary text — readable but clearly secondary |
| `--border` | `oklch(0.94 0 0)` | Subtle dividers — barely visible |
| `--ring-move` | `oklch(0.65 0.27 12)` | Activity ring: Move/Red — `#FF2D55` equivalent |
| `--ring-exercise` | `oklch(0.72 0.22 145)` | Activity ring: Exercise/Green — `#30D158` equivalent |
| `--ring-stand` | `oklch(0.60 0.22 250)` | Activity ring: Stand/Blue — `#0A84FF` equivalent |
| `--chart-blue` | `oklch(0.60 0.18 250)` | Trend charts, sparklines |
| `--chart-green` | `oklch(0.72 0.20 150)` | Positive deltas, improving trends |
| `--chart-red` | `oklch(0.65 0.24 25)` | Negative deltas, declining trends |
| `--chart-amber` | `oklch(0.80 0.16 85)` | Caution/moderate scores |

**Dark Mode**
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.13 0 0)` | Deep charcoal |
| `--foreground` | `oklch(0.95 0 0)` | Near-white text |
| `--card` | `oklch(0.18 0 0)` | Elevated card surfaces |
| `--card-foreground` | `oklch(0.95 0 0)` | Card text |
| `--muted` | `oklch(0.22 0 0)` | Secondary surfaces |
| `--muted-foreground` | `oklch(0.58 0 0)` | Secondary text |
| `--border` | `oklch(0.25 0 0)` | Subtle dividers |

Activity ring and chart colors remain the same in dark mode — vibrant colors on dark backgrounds look naturally Apple-like.

#### Typography

**Font**: Inter (via `next/font/google`) — closest web equivalent to Apple's SF Pro. Clean, humanist, excellent for data-heavy UIs.

| Role | Weight | Size | Letter Spacing | Line Height |
|------|--------|------|-----------------|-------------|
| Page title ("Ralph") | 700 (Bold) | 28px / 1.75rem | -0.02em | 1.2 |
| Section heading | 600 (Semibold) | 20px / 1.25rem | -0.01em | 1.3 |
| Card title | 500 (Medium) | 13px / 0.8125rem | 0.02em | 1.4 |
| Large metric value | 700 (Bold) | 34px / 2.125rem | -0.02em | 1.1 |
| Score in ring center | 700 (Bold) | 48px / 3rem | -0.03em | 1.0 |
| Body text | 400 (Regular) | 15px / 0.9375rem | 0em | 1.5 |
| Caption / secondary | 400 (Regular) | 13px / 0.8125rem | 0em | 1.4 |
| Trend label | 500 (Medium) | 13px / 0.8125rem | 0em | 1.4 |

**Key type details**:
- Card titles should be ALL CAPS with wider letter-spacing (0.02em) — matches Apple Health section headers
- Metric values should use tabular (monospaced) numerals via `font-variant-numeric: tabular-nums` so numbers don't shift as values change
- Negative letter-spacing on large numbers for visual density

#### Cards

| Property | Value |
|----------|-------|
| Border radius | 16px (1rem) |
| Shadow (light) | `0 1px 3px oklch(0 0 0 / 0.04), 0 4px 12px oklch(0 0 0 / 0.03)` |
| Shadow (dark) | `0 1px 3px oklch(0 0 0 / 0.2), 0 4px 12px oklch(0 0 0 / 0.15)` |
| Border | None in light mode (shadow provides separation). 1px `--border` in dark mode. |
| Padding | 20px (1.25rem) |
| Background | `--card` token |
| Hover | Translate Y -1px, shadow intensifies slightly. Transition: 200ms ease |

#### Spacing System
All spacing follows an 8px base grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Section gap (between major dashboard blocks): 32px
- Card internal gap (header to content): 16px
- Grid gap between cards: 16px
- Page horizontal padding: 24px (mobile), 48px (desktop)

### Visual Elements

#### Activity Ring (FitnessScore)
The centerpiece of the dashboard. Replace the current Recharts radial bar with a custom SVG activity ring:
- **Ring thickness**: 16px (large), 10px (small)
- **Ring cap**: Round (`stroke-linecap: round`)
- **Background track**: 8% opacity of the ring color
- **Animation**: Ring draws from 0 to target value over 1s with an ease-out curve on initial load
- **Score in center**: Large bold number (48px), "/ 100" in muted small text below
- **Trend below ring**: Chevron icon (↑↓→) + text label ("Improving"), color-matched
- **Color mapping**:
  - Score 0–49: `--ring-move` (red)
  - Score 50–69: `--chart-amber`
  - Score 70–100: `--ring-exercise` (green)

#### Category Cards (Running & Gym)
- Tappable card with subtle hover lift
- Left-aligned content:
  - Category name (card title style, uppercase, muted)
  - Score value (large metric, 34px bold)
  - Trend indicator (chevron + label, color-coded, 13px)
- Right side: Small sparkline (60×24px), using `--chart-blue` color, no axes
- When expanded: card stays highlighted, content expands below with a smooth 300ms slide-down

#### Segmented Control (Date Range)
Replace current tabs with an Apple-style segmented control:
- Pill-shaped container with `--muted` background, rounded-full (999px radius)
- Active segment: white (light) or lighter surface (dark) background, subtle shadow, rounded-full
- Inactive segments: transparent, `--muted-foreground` text
- Transition: Active indicator slides between positions (200ms ease)
- Segments: "30D", "60D", "90D", "1Y" — short labels, all caps
- Height: 36px, padding: 3px around segments

#### Trend Chart
- Smooth monotone curve, `--chart-blue` stroke (2px)
- Gradient fill below line: from `--chart-blue` at 20% opacity to transparent
- No grid lines — clean, Apple-style
- X-axis: Minimal date labels in caption style, muted color
- Y-axis: Hidden (values shown in tooltip only)
- Tooltip: Floating card with date + value, small shadow, rounded-lg, appears on hover/touch
- Chart area height: 200px (reduced from 300px — more Apple-compact)

#### Progress Bars (Category Breakdown)
- Horizontal bars with rounded-full ends (pill shape)
- Bar height: 8px (thinner, more refined than current 24px)
- Background track: 8% opacity of bar color
- Color: Same score-based color mapping as activity ring
- Label to the left, score value to the right
- Clean horizontal layout, no chart chrome

#### Metric Cards (Detail View)
- Compact card layout:
  - Title: Uppercase, muted, 13px
  - Value: Bold, 24px, with unit in muted smaller text
  - Trend: Chevron + percentage, color-coded
  - Mini chart below: 80px height area chart, gradient fill, no axes
- Grid: 2 columns on desktop, 1 on mobile

#### Comparison Cards (Week-over-Week)
- Clean two-line layout:
  - Top: "This Week" value (bold, 24px)
  - Bottom: "Last Week" value (muted, 14px) + delta badge
- Delta badge: Pill-shaped, colored background at 10% opacity with matching text
  - Green pill: "+5.2%" with up chevron
  - Red pill: "-3.1%" with down chevron
  - Gray pill: "0%" with dash

### Copy/Messaging

| Context | Text |
|---------|------|
| Page title | "Ralph" |
| Empty state headline | "Welcome to Ralph" |
| Empty state body | "Import your Apple Health data to get started." |
| Empty state CTA | "Import Data" |
| Loading | Skeleton shimmer (no text) |
| Error headline | "Couldn't load your data" |
| Error body | "Check your connection and try again." |
| Error CTA | "Retry" |
| No category data | "No workouts recorded" |
| Preview badge | "Preview" |
| Date range labels | "30D", "60D", "90D", "1Y" |
| Category headers | "RUNNING", "GYM" (uppercase) |
| Trend labels | "Improving", "Stable", "Declining" |
| Comparison header | "This Week vs Last Week" |
| Sync footer | "Last synced {timeAgo}" |
| Import CTA (footer) | "Import" |
| Upload title | "Import Health Data" |
| Upload instruction | "Drop your export.zip here, or browse" |
| Upload hint | "Supports .zip and .xml" |

### Interactions

#### Page Load
1. Page background renders immediately
2. Content area shows skeleton placeholders (pulsing light gray shapes matching card layout) for 0–2s
3. Once data arrives, skeleton fades out (200ms) and real content fades in (300ms)
4. Activity ring animates its arc from 0 to value (1s ease-out, 200ms delay after fade-in)

#### Date Range Switch
1. User taps segment — active pill slides to new position (200ms)
2. Current content fades to 60% opacity (100ms)
3. New data fetches
4. Content cross-fades to new data (200ms)
5. Activity ring re-animates from previous value to new value (600ms)

#### Category Expand/Collapse
1. User taps category card — card gets a subtle highlight (background tint)
2. Detail section expands below: height animates from 0, content fades in (300ms ease)
3. Scroll adjusts to keep expanded content in view
4. Tapping again: content fades out (150ms), height collapses (200ms)
5. Only one category can be expanded at a time — expanding one auto-collapses the other

#### Card Hover (Desktop)
- Card translates Y -1px, shadow deepens slightly
- Transition: 200ms ease
- Active/pressed: Card translates Y 0px (returns to resting), slight scale(0.99) for 100ms

#### Import Page
- Drag zone border pulses subtly on drag-over (border color transitions to `--chart-blue`)
- Upload progress: Thin progress bar (4px) at top of upload card, `--chart-blue` fill
- Success: Green checkmark fades in with a small scale bounce (1.0 → 1.1 → 1.0, 400ms)

### Feedback

| Action | Feedback |
|--------|----------|
| Page load | Skeleton shimmer → smooth fade-in |
| Data fetch in progress | Content dims to 60% opacity |
| Date range changed | Segmented control pill slides; content refreshes |
| Category card tapped | Card highlights; detail panel slides open |
| Category collapsed | Smooth collapse animation |
| Card hover (desktop) | Subtle lift + shadow |
| Import drag-over | Border color change |
| Upload in progress | Progress bar fills |
| Upload success | Checkmark bounce + auto-redirect |
| Upload error | Red-tinted error message |
| Retry tapped | Content area shows loading state again |

### Responsive Behavior

| Breakpoint | Layout Changes |
|-----------|----------------|
| Mobile (< 640px) | Single column. Category cards stack. Segmented control full-width. Page padding 16px. Activity ring: 160×160px. |
| Tablet (640–1024px) | Two-column category cards. Segmented control centered, auto-width. Page padding 24px. Activity ring: 180×180px. |
| Desktop (> 1024px) | Max-width 960px container, centered. Two-column metrics grid. Page padding 48px. Activity ring: 200×200px. |

## Success Metrics

How do we know the UX is successful?
- **Visual consistency**: Every component follows the same color, spacing, and typography tokens — no one-off styles
- **Animation smoothness**: All transitions run at 60fps — no jank, no layout shifts
- **Load perception**: Skeleton + fade-in makes the dashboard feel fast even on slower connections
- **Scannability**: A user can glance at the dashboard and immediately understand their fitness score, trend, and category breakdown within 3 seconds
- **Delight factor**: The activity ring animation and card interactions should make the dashboard feel alive and motivating, not static

## Out of Scope

- **New features or data points**: This is a visual makeover only. No new metrics, no new API endpoints, no data model changes.
- **Full responsive redesign**: Mobile layout adjustments are included, but no dedicated mobile-first redesign or PWA shell.
- **Onboarding flow**: No guided tutorial or first-run experience beyond the empty state.
- **Accessibility overhaul**: Maintain existing accessibility (ARIA labels, focus states, keyboard nav). No new accessibility features added.
- **Dark mode parity testing**: Dark mode tokens are specified, but extensive dark mode QA is out of scope.
- **Chart library migration**: Stay with Recharts. Custom SVG only for the activity ring.
- **Backend changes**: No API modifications.

## Open Questions

1. **Activity ring: single or triple?** Apple uses three concentric rings (Move, Exercise, Stand). Should we show one ring (overall score) or three (overall + running + gym)? This spec assumes one ring for simplicity — three rings would be a meaningful scope increase.
2. **Animation library**: Should we add `framer-motion` for the expand/collapse and page transitions, or achieve everything with CSS transitions + the Web Animations API? CSS-only is lighter but less capable for complex sequences.

## Simplification Opportunities

1. **Remove the progress bar chart entirely** — The category breakdown horizontal bars duplicate information already shown in the category cards. Removing them reduces visual noise and shortens the page.
2. **Merge footer into header** — The sync timestamp and Import button in the footer duplicate the header's Import button. Move "Last synced" into the header as subtle secondary text and remove the footer card entirely.
3. **Simplify trend indicators** — Instead of icon + text ("↑ Improving"), use just a colored dot + percentage change. Faster to scan, less visual weight.
4. **Reduce date range options** — Consider dropping "60D" and offering just "30D", "90D", "1Y" — three options are faster to choose from than four and the 60-day range adds little insight over 90-day.
