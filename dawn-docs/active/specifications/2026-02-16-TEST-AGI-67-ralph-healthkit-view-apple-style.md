# Specification: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-67
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-67-ralph-healthkit-view-apple-style.md
**Status**: Complete

## Executive Summary

Transform the Ralph HealthKit dashboard from its current neutral shadcn/ui appearance into a premium, Apple Health-inspired experience. Users will see a polished, calm, and authoritative interface that feels native to Apple's design language — clean whitespace, borderless cards with soft depth, bold typography hierarchy, HealthKit-category color accents, and smooth micro-interactions. The dashboard will feel like a first-party Apple health app running in the browser.

## User Experience Goals

### Primary Goal
Give the user a health dashboard that feels as refined and trustworthy as Apple's own Health app — where the data presentation itself inspires confidence in the metrics.

### Experience Principles
- **Simplicity**: Strip away visual noise. Remove borders, reduce color clutter, and let generous whitespace and clear typography do the heavy lifting. Every pixel earns its place.
- **Delight**: Smooth spring animations on score rings, subtle hover lift on cards, and a silky segmented control for date switching create a sense of craft without being distracting.
- **Polish**: Tabular numbers for metrics so digits don't jump, consistent 8px grid spacing, and precise color semantics (red = heart/declining, green = activity/improving) deliver a premium feel in the details.

## User Flows

### Happy Path

1. **User opens the dashboard** — A clean white page loads with the "Ralph" wordmark at top-left. The overall Fitness Score ring animates in from 0 to the current value over 800ms, immediately drawing the eye.

2. **User scans the layout** — Below the header and date selector, two category summary cards (Running, Gym) sit in a 2-column grid. Each shows a small score ring, the category name, trend arrow, and a muted sparkline. The cards have no borders — just soft elevation shadows and generous padding.

3. **User switches date range** — The segmented control (30D / 60D / 90D / 1Y) sits below the header. Tapping a segment causes a white pill indicator to slide smoothly to the selected segment. Data refreshes and charts update with a subtle fade transition.

4. **User taps a category card** — The card lifts slightly on press, then the detail section expands below with a smooth height animation. Week-over-week comparison cards and individual metric trend charts appear, all styled with Apple's color language and rounded area fills.

5. **User reviews metrics** — Each metric card shows the value in large bold text with the unit, a color-coded trend arrow, and a gradient-filled area chart. Comparison cards show this-week vs last-week with green/red delta badges.

6. **User scrolls to category breakdown** — A horizontal bar chart with rounded-end bars shows all category scores out of 100, color-coded by score quality.

7. **User scrolls to score history** — A gradient-filled area chart shows the overall fitness score trend over the selected date range.

### Edge Cases

| Scenario | User Experience |
|----------|-----------------|
| No data imported yet | Centered card with friendly message: "Ready to get started?" with a clear "Import Health Data" button. No empty charts or confusing blanks. |
| Only one category has data | The category with data displays normally. The empty category card shows a muted "--" score with text: "No data yet". |
| Preview/mock mode active | A subtle blue "Preview" badge appears next to the title. All interactions work identically — the user can explore the full UI with sample data. |
| Metric value is null | Display "--" in the same font size/weight as a real value, keeping layout stable. Sparkline area is empty but maintains its reserved space. |
| Very low score (< 20) | The ring still renders with a tiny visible arc (minimum visual fill of ~5%) so the user can see the ring is active, not broken. |
| Screen is narrow (mobile) | Grid collapses to single column. Score ring stays centered. Cards stack vertically. Segmented control remains full-width. |

### Error States

| Error | User Message | Recovery Path |
|-------|--------------|---------------|
| API fetch fails | "Couldn't load your data. Let's try again." with Retry button | Tap Retry to re-fetch. Button shows subtle loading spinner during fetch. |
| Network timeout | Same as above — no distinction exposed to user | Same Retry flow |
| Import data fails | "Something went wrong during import. Your existing data is safe." | Return to dashboard; existing data still visible |

## Interface Specifications

### Visual Elements

#### Color System

**Backgrounds & Surfaces**
- Page background: `#F2F2F7` (Apple's systemGroupedBackground)
- Card background: `#FFFFFF`
- Segmented control track: `rgba(118, 118, 128, 0.12)` (Apple's tertiarySystemFill)

**Text**
- Primary text: `#000000`
- Secondary text: `#8E8E93` (Apple's systemGray)
- Tertiary text: `#AEAEB2` (Apple's systemGray3)

**Accents — Health Categories**
- Running / Activity: `#30D158` (Apple's systemGreen)
- Gym / Strength: `#007AFF` (Apple's systemBlue)
- Overall Score ring: gradient from `#FF2D55` (systemPink) through `#FFD60A` (systemYellow) to `#30D158` (systemGreen) — reminiscent of Apple Activity rings

**Semantic Colors**
- Improving: `#34C759` (Apple's green)
- Declining: `#FF3B30` (Apple's red)
- Stable: `#8E8E93` (Apple's gray)

**Score Thresholds**
- Score < 50: `#FF3B30` (red)
- Score 50–69: `#FF9F0A` (Apple's orange)
- Score >= 70: `#30D158` (green)

#### Typography

**Font Stack**: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif`

| Element | Size | Weight | Letter Spacing | Color |
|---------|------|--------|---------------|-------|
| Page title ("Ralph") | 34px | Bold (700) | -0.4px | Primary |
| Section headings | 22px | Semibold (600) | -0.3px | Primary |
| Card titles | 17px | Semibold (600) | -0.2px | Primary |
| Metric values | 28px | Bold (700) | -0.3px | Primary |
| Body text | 17px | Regular (400) | -0.1px | Primary |
| Caption / labels | 13px | Regular (400) | 0px | Secondary |
| Trend text | 13px | Medium (500) | 0px | Semantic color |

All numeric values use `font-variant-numeric: tabular-nums` for stable alignment.

#### Card Treatment

- **Border**: None (remove all borders from cards)
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`
- **Border radius**: `16px`
- **Padding**: `20px` (internal)
- **Background**: White `#FFFFFF`
- **Hover state** (clickable cards only): Shadow deepens to `0 4px 12px rgba(0, 0, 0, 0.1)`, card lifts with `translateY(-2px)` over 200ms

#### Segmented Control (replacing Tabs)

- **Container**: Rounded pill with `border-radius: 10px`, background `rgba(118, 118, 128, 0.12)`, padding `2px`, height `36px`
- **Segment labels**: 13px medium weight, `#8E8E93` when inactive, `#000000` when active
- **Active indicator**: White pill with `border-radius: 8px`, shadow `0 1px 3px rgba(0, 0, 0, 0.12)`, slides between segments with `300ms cubic-bezier(0.25, 0.1, 0.25, 1)` transition
- **Tap target**: Full segment width, minimum 44px height for accessibility

#### Fitness Score Ring

- **Style**: Single arc ring (current radial bar approach, refined)
- **Background track**: `rgba(0, 0, 0, 0.05)` (very subtle)
- **Active arc color**: Score-based (red / orange / green)
- **Arc thickness**: 16px (large), 10px (small)
- **Corner radius**: Fully rounded (pill ends)
- **Mount animation**: Arc fills from 0 to target value over `800ms` with `cubic-bezier(0.25, 0.1, 0.25, 1)` easing
- **Center text**: Score number in 34px bold (large) or 22px bold (small), color matches arc

#### Charts

**Area/Trend Charts**
- Stroke: 2px, score/category color
- Fill: Linear gradient from color at 30% opacity (top) to 0% opacity (bottom)
- Curve: `monotoneX` (smooth, no sharp angles)
- Grid lines: Dashed, `rgba(0, 0, 0, 0.06)`
- Axis labels: 12px, `#8E8E93`, no axis lines
- Tooltip: White card with shadow, 13px text, rounded corners

**Horizontal Bar Chart (Category Breakdown)**
- Bar height: 28px
- Corner radius: 8px (both ends for filled portion, left straight for background)
- Background track: `rgba(0, 0, 0, 0.04)`
- Fill color: Score-based (red / orange / green)
- Labels: 13px, secondary color

**Sparklines (in metric summary cards)**
- Stroke: 1.5px, category color at 50% opacity
- No fill, no dots, no axes
- Height: 40px

#### Comparison Cards (Week-over-Week)

- Same borderless card treatment as above
- "This Week" value: 22px semibold
- "Last Week" value: 13px caption, secondary color
- Delta badge: Pill-shaped (`border-radius: 12px`), background tinted with semantic color at 12% opacity, text in semantic color, 12px medium weight
  - Example: Green background tint + green text "↑ 12%" for improvement
  - Example: Red background tint + red text "↓ 5%" for decline

### Copy/Messaging

| Context | Text |
|---------|------|
| Page title | "Ralph" |
| Empty state heading | "Ready to get started?" |
| Empty state body | "Import your Apple Health data to see your fitness dashboard." |
| Empty state CTA | "Import Health Data" |
| Error state body | "Couldn't load your data. Let's try again." |
| Error state CTA | "Retry" |
| Preview badge | "Preview" |
| Date segments | "30D" / "60D" / "90D" / "1Y" |
| Overall score heading | "Fitness Score" |
| Category breakdown heading | "Categories" |
| Score trend heading | "Score Trend" |
| Week comparison heading | "This Week vs Last Week" |
| Null metric value | "--" |
| No chart data | "Not enough data yet" |

### Interactions

| Interaction | Behavior |
|-------------|----------|
| Tap date segment | White pill indicator slides to tapped segment (300ms spring). Data refreshes. |
| Tap category card | Card hover shadow persists briefly. Detail section expands below with smooth height + opacity animation (400ms). Tapping again collapses with reverse animation. |
| Hover on clickable card | Card lifts 2px, shadow deepens (200ms ease-out). |
| Hover off clickable card | Card settles back (200ms ease-out). |
| Chart hover/touch | Tooltip appears near cursor showing data point value and date. |
| Page load | Score ring animates fill (800ms). Cards fade in with staggered 50ms delay each. |
| Date range change | Charts cross-fade old data out, new data in (300ms). |

### Feedback

| Event | Feedback |
|-------|----------|
| Data loading | Subtle skeleton pulse animation on card areas (Apple-style shimmer) |
| Data loaded | Content fades in (200ms) |
| Fetch error | Error message card appears with red accent left border and Retry button |
| Category expand | Smooth height expansion with opacity fade-in of content |
| Category collapse | Reverse: opacity fade-out, then height collapse |

## Layout Specifications

### Container
- Max-width: `860px`
- Centered horizontally with `auto` margins
- Horizontal padding: `24px` (mobile), `32px` (tablet+)

### Vertical Rhythm
- Header to segmented control: `24px`
- Segmented control to score section: `32px`
- Between major sections: `32px`
- Between cards in a grid: `16px`
- Internal card padding: `20px`

### Grid
- Category summary cards: 2 columns (1 on mobile < 640px)
- Comparison cards: 3 columns (2 on tablet, 1 on mobile)
- Metric detail cards: 2 columns (1 on mobile)
- Gap: `16px`

## Success Metrics

How do we know the UX is successful?
- **Visual fidelity**: Dashboard passes a "squint test" — at a glance it reads as Apple-like, not generic
- **Performance**: All animations run at 60fps — no jank on transitions or ring animations
- **Consistency**: Every card, chart, and text element follows the specification — no mismatched shadows, colors, or spacing
- **Accessibility**: All interactive elements have minimum 44px tap targets, focus states visible, sufficient color contrast (WCAG AA)
- **User feedback**: The dashboard owner (Ralph) confirms the look matches Apple Health's feel and the live preview is satisfactory

## Out of Scope

- **Dark mode**: This specification covers light mode only, consistent with Apple Health's primary light-mode experience. Dark mode can be a follow-up ticket.
- **Import page redesign**: Only the main dashboard (`/`) is redesigned. The `/import` page retains current styling.
- **New features or data changes**: No changes to data models, APIs, or business logic. This is purely visual.
- **Custom icon set**: Using existing text arrows (↑ ↓ →) rather than SF Symbols or custom icons.
- **Complex animation choreography**: No parallax scroll effects or physics-based spring animations beyond the specified transitions. Keep it performant and maintainable.
- **Third-party font loading**: Using the system font stack (`-apple-system`) rather than loading SF Pro or Inter via CDN/Google Fonts, to keep the bundle lean and render fast.

## Open Questions

1. **Preview badge styling**: Should the preview badge match Apple's blue tint or keep the current amber color to stand out as a "non-production" indicator? (Specification assumes blue to match the overall Apple language, but amber could be a deliberate choice.)
2. **Score ring animation on re-render**: When the date range changes and the score updates, should the ring re-animate from 0 or smoothly transition from the old value to the new? (Specification assumes re-animate from 0 for stronger visual feedback.)

## Simplification Opportunities

1. **Remove the footer sync status card**: The "last synced" information can move to a subtle caption under the header, eliminating an entire card and reducing visual clutter at the bottom.
2. **Combine category breakdown and score trend into one section**: Rather than two separate chart sections at the bottom, consider a single "Overview" section that shows both. This reduces scrolling.
3. **Simplify date range labels**: Shorten "30 Days / 60 Days / 90 Days / 1 Year" to "30D / 60D / 90D / 1Y" for a tighter segmented control.
4. **Remove redundant Import Data button from footer**: One clear Import CTA in the header is enough. The footer button adds clutter.
5. **Simplify error/loading states**: Instead of separate loading text in a card, use skeleton shimmer placeholders that match the final layout shape — feels faster and more polished.
