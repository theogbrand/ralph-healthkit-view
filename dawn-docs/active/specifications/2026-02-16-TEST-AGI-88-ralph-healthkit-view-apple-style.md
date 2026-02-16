# Specification: Ralph HealthKit View (Apple-style)

**Issue**: TEST-AGI-88
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-88-ralph-healthkit-view-apple-style.md
**Status**: Complete

## Executive Summary

Transform the Ralph HealthKit dashboard from a functional but generic design into a premium, Apple Health-inspired experience. Users will see a polished, elegant fitness dashboard with Apple's signature visual language — soft shadows, generous whitespace, activity rings, smooth animations, and precise typography — making health data feel personal, calm, and delightful to review.

## User Experience Goals

### Primary Goal
Give users an effortless, visually calming way to review their fitness data in a dashboard that feels as polished and premium as Apple's own Health app.

### Experience Principles
- **Simplicity**: Reduce visual noise — remove hard borders, minimize chrome, let data breathe with generous whitespace. Every visual element should serve a purpose.
- **Delight**: Smooth spring animations on load, satisfying count-up numbers, subtle card lift on hover, and the iconic Activity Ring visualization create moments of polish that feel intentional.
- **Polish**: Precise typography hierarchy, pixel-perfect spacing, consistent color semantics, and graceful handling of every state (loading, empty, error) signal quality throughout.

## User Flows

### Happy Path
1. User opens the dashboard. A frosted-glass header with the "Ralph" wordmark appears immediately. Below, content fades in with a staggered animation — the Activity Ring draws itself, metric numbers count up from zero, and cards gently slide into place.
2. User sees the **Hero Score Section** front and center — three concentric Activity Rings (Move/Exercise/Stand style mapped to Running, Gym, and Overall) with the overall fitness score displayed as a large, bold number in the center.
3. Below the rings, **Summary Metric Cards** show key health numbers (steps, calories, distance, etc.) in a horizontal scrollable row on mobile or a 2-column grid on desktop. Each card has a large number, unit label, trend arrow, and a subtle sparkline.
4. User taps a **date range tab** (30d, 60d, 90d, 1yr) styled as an Apple segmented control. The content transitions smoothly — old data fades out, new data fades in, charts animate to their new values.
5. User taps a **category card** (Running or Gym) to expand its detail view. The card smoothly expands to reveal detailed metrics, week-over-week comparisons, and trend charts. Other content repositions with a spring animation.
6. Within the expanded view, user sees **Comparison Cards** showing this-week vs. last-week deltas with color-coded badges (green for improvement, red for decline) and **Trend Charts** with smooth gradient fills.
7. User taps the category again to collapse it. The detail view smoothly contracts and the overview layout restores.

### Edge Cases
| Scenario | User Experience |
|----------|-----------------|
| Very low score (< 30) | Score ring is red with a warm, encouraging tone — no alarming visuals. Text reads supportively, e.g., "Getting started" |
| Perfect score (100) | All rings fully closed with a subtle glow effect. Score number shown in vibrant green. |
| Missing data for a metric | Card shows "—" in the value area with muted styling. No broken layout. |
| Narrow mobile viewport | Cards stack to single column. Metric cards become horizontally scrollable. Activity Ring scales down gracefully. |
| Very long metric labels | Text truncates with ellipsis. Full label shown in tooltip on hover/tap. |

### Error States
| Error | User Message | Recovery Path |
|-------|--------------|---------------|
| API fetch failure | "Unable to load your data. Tap to retry." shown in a gentle card with a retry button. | Single retry button, styled as a pill. No technical jargon. |
| Empty dataset | "No health data yet. Import your data to get started." with a friendly illustration area and a CTA button. | Primary "Import Data" pill button. |
| Partial data (some metrics null) | Affected metric cards show "—" while others render normally. No global error. | No action needed — the dashboard degrades gracefully per-metric. |

## Interface Specifications

### Visual Design System

#### Color Palette
All colors specified in OKLCH for perceptual uniformity.

| Token | Light Mode | Usage |
|-------|-----------|-------|
| `--background` | Pure white | Page background |
| `--surface` | Off-white (gray-50 equivalent) | Section backgrounds, grouping areas |
| `--card` | Pure white | Card backgrounds |
| `--card-shadow` | 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06) | Default card elevation |
| `--card-shadow-hover` | 0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.08) | Hovered card elevation |
| `--ring-move` | #FA114F (Apple Activity red) | First ring / Running category accent |
| `--ring-exercise` | #92E82A (Apple Activity green) | Second ring / Gym category accent |
| `--ring-stand` | #00D4FF (Apple Activity cyan-blue) | Third ring / Overall score accent |
| `--text-primary` | #1D1D1F (Apple system label) | Headings, primary content |
| `--text-secondary` | #86868B (Apple secondary label) | Descriptions, subtitles |
| `--text-tertiary` | #AEAEB2 (Apple tertiary label) | Timestamps, minor labels |
| `--apple-blue` | #007AFF | Interactive elements, links, CTA |
| `--success` | #34C759 (Apple system green) | Positive trends, improvements |
| `--warning` | #FF9500 (Apple system orange) | Caution states |
| `--destructive` | #FF3B30 (Apple system red) | Negative trends, errors |
| `--separator` | rgba(60,60,67,0.12) | Divider lines |

**Dark mode**: Invert surfaces (backgrounds become near-black #1C1C1E, cards become #2C2C2E). Activity ring colors stay vibrant. Text inverts to white hierarchy. Shadows become more subtle.

#### Typography

**Font Stack**: Inter (primary), with fallback to `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

| Element | Weight | Size | Tracking | Usage |
|---------|--------|------|----------|-------|
| Hero Score | 700 (Bold) | 56px / 3.5rem | -0.02em | Central fitness score number |
| Page Title | 700 (Bold) | 34px / 2.125rem | -0.01em | "Ralph" header |
| Section Title | 600 (Semibold) | 22px / 1.375rem | -0.01em | "Running", "Gym" category headers |
| Card Title | 500 (Medium) | 13px / 0.8125rem | 0 | Metric labels on cards |
| Card Value | 600 (Semibold) | 28px / 1.75rem | -0.01em | Metric numbers on cards |
| Body | 400 (Regular) | 17px / 1.0625rem | 0 | General text |
| Caption | 400 (Regular) | 13px / 0.8125rem | 0 | Timestamps, secondary info |
| Tab Label | 500 (Medium) | 13px / 0.8125rem | 0 | Segmented control labels |

#### Spacing Scale
Use a 4px base grid. Key values:
- `4px` — tight internal padding
- `8px` — between related elements (icon + label)
- `12px` — card internal horizontal padding
- `16px` — card internal vertical padding, gap between cards
- `20px` — section padding
- `24px` — container horizontal padding
- `32px` — between sections
- `48px` — major section separators

#### Border Radius
- Cards: `16px` (large, Apple-style)
- Buttons/Pills: `980px` (fully rounded / capsule)
- Segmented Control: `8px` outer, `6px` inner segments
- Progress bars: `6px`
- Small badges: `6px`

#### Shadows
Cards rely on shadows instead of borders for definition:
- **Resting**: `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`
- **Hover/Active**: `0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.08)`
- **Header (frosted glass)**: `0 0.5px 0 rgba(0,0,0,0.12)` bottom edge + `backdrop-blur: 20px` + `background: rgba(255,255,255,0.72)`

### Visual Elements

#### Activity Rings (Hero Section)
The centerpiece visualization. Three concentric rings representing fitness categories:
- **Outer ring** (Running): Apple Activity red (#FA114F), thickest stroke (~14px)
- **Middle ring** (Gym): Apple Activity green (#92E82A), medium stroke (~12px)
- **Inner ring** (Overall): Apple Activity cyan (#00D4FF), thinnest stroke (~10px)

Each ring:
- Starts from 12 o'clock position, fills clockwise proportional to score (0-100%)
- Has rounded end caps (stroke-linecap: round)
- Background track: 10% opacity of its ring color
- Animated on load: ring draws itself from 0 to target value over 1 second with an ease-out curve
- If score > 100%, ring overlaps itself with a subtle glow at the overlap point

Center of rings: Large bold score number with the label "Fitness Score" below in secondary text.

#### Metric Cards
Each metric card:
- White background, 16px radius, shadow (no border)
- Card title (caption style, secondary color) at top
- Large value number (semibold, 28px) in primary color
- Unit label inline with value in secondary color
- Trend indicator: small colored pill badge — green "↑ 5%" or red "↓ 3%" or gray "→ 0%"
- Optional sparkline: subtle 24px-tall line chart in the bottom area, using the metric's semantic color at 30% opacity

#### Segmented Control (Date Range)
Replaces the current tab component for date range selection:
- Outer container: light gray background (#F2F2F7), 8px radius, 2px padding
- Each segment: 6px radius, transitions background and text color
- Active segment: white background, subtle shadow, primary text color
- Inactive: transparent background, secondary text color
- Transition: 200ms ease background and shadow

#### Category Expansion
When a user taps Running or Gym:
- The category card smoothly expands downward
- Detail content fades in with a slight upward slide (8px travel)
- A subtle separator line appears between the summary and detail areas
- The "collapse" action is tapping the same card header again

#### Comparison Delta Badges
Week-over-week deltas shown as:
- Positive: Green text with "↑" prefix, e.g., "↑ 12%"
- Negative: Red text with "↓" prefix, e.g., "↓ 5%"
- Neutral: Gray text with "→" prefix, e.g., "→ 0%"
- Displayed as small inline badges next to the "vs last week" value

#### Trend Charts
- Smooth curved lines (monotone interpolation)
- Area fill: gradient from metric color at 20% opacity at top to transparent at bottom
- No visible dots on the line by default
- Horizontal grid lines: very faint dashed lines (#F2F2F7)
- X-axis labels: secondary text color, date format "Jan 5"
- Y-axis labels: secondary text color, abbreviated numbers

#### Header
- Sticky position at top
- Frosted glass effect: `backdrop-filter: blur(20px)`, semi-transparent white background (72% opacity)
- Bottom separator: 0.5px line at 12% opacity
- "Ralph" wordmark: bold, 34px, primary text color
- Right side: preview mode badge (if active), date range segmented control
- Height: ~56px

#### Loading State
- Skeleton placeholders that shimmer with a subtle left-to-right gradient animation
- Skeleton shapes match the actual content layout (ring placeholder, card placeholders, chart placeholders)
- Shimmer: linear gradient moving at 1.5s infinite

#### Error State
- Centered card with gentle styling
- Friendly message: "Something went wrong"
- Subtitle: "We couldn't load your health data"
- Pill-shaped retry button in Apple Blue
- No error codes or technical details shown to user

### Copy/Messaging

| Context | Text |
|---------|------|
| Page title | "Ralph" |
| Empty state heading | "No Health Data Yet" |
| Empty state body | "Import your Apple Health data to see your fitness dashboard." |
| Empty state CTA | "Import Data" |
| Error heading | "Something Went Wrong" |
| Error body | "We couldn't load your health data." |
| Error CTA | "Try Again" |
| Loading | (no text — skeleton placeholders only) |
| Score label | "Fitness Score" |
| Last sync | "Updated {relative time}" (e.g., "Updated 2 hours ago") |
| Trend improving | "↑ {percent}%" |
| Trend declining | "↓ {percent}%" |
| Trend stable | "→ Steady" |
| Week comparison label | "vs last week" |

### Interactions

| Interaction | Behavior |
|-------------|----------|
| Page load | Content fades in with staggered timing. Activity rings animate from 0 to value. Score counts up numerically. |
| Date range tap | Segmented control slides active indicator. Content cross-fades (old out 150ms, new in 200ms). |
| Category card tap | Card expands with spring animation (300ms). Detail content fades in after expansion starts (150ms delay). |
| Category collapse | Detail content fades out (100ms). Card contracts with spring animation (250ms). |
| Card hover (desktop) | Card lifts slightly — shadow increases, subtle 1px upward translate. Transition: 200ms ease. |
| Card press (mobile) | Brief scale to 0.98 on touch-start, back to 1.0 on release. 100ms duration. |
| Retry button tap | Button shows brief press state (scale 0.96), then triggers reload. |
| Chart hover | Tooltip appears at cursor position showing exact value and date. Vertical reference line appears. |

### Feedback
| Trigger | Feedback |
|---------|----------|
| Data loading | Skeleton shimmer placeholders appear instantly, replaced by real content once loaded |
| Data loaded | Content appears with fade-in. No flash or layout shift. |
| Date range changed | Smooth cross-fade transition. Loading skeleton if fetch is needed. |
| Error occurred | Error card slides in gently. Retry button clearly visible. |
| Retry tapped | Skeleton placeholders replace error card. Loading begins. |
| Category expanded | Spring animation provides spatial feedback. Content slides into view. |

## Success Metrics

How do we know the UX is successful?
- **Visual fidelity**: Side-by-side comparison with Apple Health shows recognizable design language — a user familiar with Apple Health should feel immediate familiarity.
- **Perceived performance**: Content appears within 200ms of navigation, skeleton placeholders prevent layout shift, animations feel smooth at 60fps.
- **Simplicity audit**: Every visible element serves a clear purpose. No decorative-only elements that add visual noise without information.
- **Interaction polish**: All interactive elements have visible feedback (hover, press, active states). No "dead" taps or unresponsive-feeling UI.
- **Consistency**: All cards use the same shadow, radius, and spacing. All text follows the typography scale. Colors are semantically consistent throughout.

## Out of Scope

- **Sidebar navigation** — the current single-page layout is sufficient. No structural layout changes beyond visual styling.
- **New features or data types** — this is a visual makeover of existing data and components only.
- **Custom chart library** — continue using Recharts. Style within its capabilities rather than replacing it.
- **Native iOS features** — no haptic feedback, no iOS-specific APIs. This is a web app inspired by Apple's design language.
- **Onboarding flow** — no walkthrough or tutorial for the dashboard.
- **Data import UX** — the empty state CTA button is styled but its target flow is not part of this spec.
- **Accessibility overhaul** — maintain existing accessibility; don't regress. But a comprehensive a11y audit is separate work.

## Open Questions

1. **Animation library decision**: Should we add `framer-motion` (~30KB gzipped) for rich spring animations, or keep it CSS-only? CSS-only is lighter but less expressive for spring physics and staggered animations. Recommendation: CSS-only for v1 — use `@keyframes` and CSS `transition` with `cubic-bezier` easing to approximate spring physics. Add framer-motion later if needed.

2. **True Activity Rings vs. enhanced radial gauge**: The specification describes three concentric rings. The current implementation is a single Recharts RadialBarChart. True concentric rings may require custom SVG rather than Recharts. Recommendation: Start with enhancing the existing single ring with Apple colors and animation, and if time permits, implement the triple-ring as custom SVG.

## Simplification Opportunities

1. **CSS-only animations instead of framer-motion**: For v1, all specified animations (fade-in, slide-up, ring draw, shimmer) can be achieved with CSS `@keyframes`, `transition`, and `animation`. This avoids adding a new dependency and keeps the bundle lean.

2. **Single enhanced ring instead of triple rings**: The iconic triple Activity Ring is visually striking but complex to implement with Recharts. Enhancing the existing single radial gauge with Apple colors, gradient fills, and draw-in animation captures 80% of the visual impact with 20% of the effort.

3. **System font stack as primary**: Instead of loading Inter from Google Fonts, use `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif`. On Apple devices this renders as SF Pro (the ideal). On others it falls back to the platform's native font, then Inter. This is lighter and more "native feeling."

4. **Consolidate shadow tokens**: Instead of multiple shadow levels, use just two: resting and hover. This simplifies the design system and is consistent with Apple's approach (cards either sit flat or lift on interaction).
