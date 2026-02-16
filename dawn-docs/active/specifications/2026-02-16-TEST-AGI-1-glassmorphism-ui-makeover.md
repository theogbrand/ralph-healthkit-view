# Specification: Ralph HealthKit View (Glassmorphism Design Style)

**Issue**: TEST-AGI-1
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-1-ralph-healthkit-glassmorphism-ui.md
**Status**: Complete

## Executive Summary

Transform the Ralph HealthKit dashboard from its current flat, light-themed design into an immersive glassmorphism experience. Users will see their health data presented on frosted-glass cards floating over a rich dark gradient background, with smooth hover animations and modern typography that makes the dashboard feel like a premium health analytics product.

## User Experience Goals

### Primary Goal
Make the dashboard feel visually premium and immersive so users enjoy checking their health data daily.

### Experience Principles
- **Simplicity**: The visual upgrade adds atmosphere without adding complexity. Navigation, interactions, and data hierarchy remain identical. Glass effects enhance the existing layout rather than restructuring it.
- **Delight**: Frosted cards catch the light on hover. Subtle glow effects reward interaction. The gradient background creates depth that makes data feel alive rather than flat.
- **Polish**: Every element — from progress bars to chart tooltips — is consistent with the glass aesthetic. No component feels like it was forgotten.

## User Flows

All existing user flows remain unchanged. The glassmorphism redesign is purely visual — no new screens, no new interactions, no changes to navigation or data flow.

### Happy Path (Unchanged)
1. User opens dashboard → sees health data on glass cards over a gradient background
2. User switches date ranges via tabs → data updates, glass styling is consistent across all views
3. User clicks a category card (Running/Gym) → card expands to show detailed metrics, all in glass style
4. User navigates to Import → sees the same glass aesthetic on the upload area and instructions
5. User drags a file to upload → glass-styled progress and results

### Edge Cases
| Scenario | User Experience |
|----------|-----------------|
| Loading state | Skeleton-style shimmer on a glass card, maintaining the aesthetic while data loads |
| Empty dashboard (no data) | Glass card with the "No data yet" message; the gradient background still looks beautiful even without content |
| Single category only | The expanded detail view still looks polished with glass cards, even if only one category has data |
| Long metric labels | Text truncates gracefully on glass cards; frosted background ensures readability at any width |
| Low-end device | Glass effects degrade gracefully — cards remain styled even if backdrop-blur is not rendered by the browser |

### Error States
| Error | User Message | Recovery Path |
|-------|--------------|---------------|
| API fetch failure | Error displayed on a glass card with a "Retry" button that glows on hover | Click Retry to re-fetch |
| File upload failure | Red-tinted glass card with error message | User can drag a new file or click Browse again |
| Import timeout | "Processing is taking longer than expected" on glass card | Automatic retry or manual retry button |

## Interface Specifications

### Visual Foundation

#### Background
- **Gradient**: A deep, rich gradient that serves as the canvas for all glass elements
- **Color direction**: Diagonal (top-left to bottom-right)
- **Palette**: Deep navy/indigo transitioning through purple to dark teal
  - Suggested: `from-[#0f0c29] via-[#302b63] to-[#24243e]` or similar deep jewel tones
- **Coverage**: Full viewport, fixed position so it doesn't scroll — cards float above it
- **Subtle texture**: Optional very faint noise or mesh-gradient overlay for depth

#### Glass Cards
All cards across the app share a consistent frosted-glass treatment:
- **Background**: `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.10)` (subtle translucency)
- **Backdrop blur**: `blur(16px)` — enough to create the frosted effect without heavy performance cost
- **Border**: `1px solid rgba(255, 255, 255, 0.12)` — subtle edge that catches the light
- **Border radius**: `1rem` (16px) — slightly more rounded than current for a softer glass feel
- **Shadow**: `0 8px 32px rgba(0, 0, 0, 0.25)` — deeper shadow for floating depth
- **Hover state**: Border brightens to `rgba(255, 255, 255, 0.25)`, shadow intensifies slightly, and a subtle scale transform (`scale(1.01)`) on interactive cards only
- **Transition**: `all 300ms cubic-bezier(0.4, 0, 0.2, 1)` — smooth, not snappy

#### Color Tokens (Dark-First)
The entire app shifts to a dark-first palette. CSS custom properties update:

| Token | Value | Purpose |
|-------|-------|---------|
| `--background` | Deep gradient (see above) | Page background |
| `--foreground` | `rgba(255, 255, 255, 0.95)` | Primary text |
| `--card` | `rgba(255, 255, 255, 0.07)` | Glass card fill |
| `--card-foreground` | `rgba(255, 255, 255, 0.90)` | Card text |
| `--muted` | `rgba(255, 255, 255, 0.05)` | Subtle backgrounds |
| `--muted-foreground` | `rgba(255, 255, 255, 0.55)` | Secondary text, labels |
| `--border` | `rgba(255, 255, 255, 0.12)` | Card and divider borders |
| `--primary` | `#7c3aed` (violet-600) | Primary accent — buttons, active tabs |
| `--primary-foreground` | `#ffffff` | Text on primary backgrounds |
| `--accent` | `rgba(124, 58, 237, 0.15)` | Hover backgrounds, subtle highlights |
| `--destructive` | `#ef4444` | Error states |

#### Score Colors (Glass-Adapted)
Health score colors become more vibrant to pop on dark backgrounds:

| Score Range | Color | Usage |
|-------------|-------|-------|
| < 50 (Low) | `#f87171` (red-400, brighter) | Score ring, bars, trend indicators |
| 50-69 (Medium) | `#fbbf24` (amber-400, warmer) | Score ring, bars, trend indicators |
| ≥ 70 (Good) | `#34d399` (emerald-400, brighter) | Score ring, bars, trend indicators |

Chart accent colors also shift brighter:
- Trend line: `#818cf8` (indigo-400)
- Category detail: `#a78bfa` (violet-400)
- Sparklines: `rgba(255, 255, 255, 0.4)`

### Typography

#### Font
Replace Geist Sans/Mono with **Inter** via `next/font/google`:
- **Why Inter**: Clean geometric sans-serif, excellent readability at all sizes, wide weight range, and the slight roundness complements glass aesthetics
- **Weights to load**: 400 (body), 500 (labels), 600 (subheadings), 700 (headings)
- **Monospace**: Replace Geist Mono with **JetBrains Mono** for any code/numeric displays

#### Type Scale (Unchanged)
The existing size scale stays the same. The font swap alone modernizes the feel.

#### Text Rendering on Glass
- Primary text: `rgba(255, 255, 255, 0.95)` — near-white for maximum readability
- Secondary text: `rgba(255, 255, 255, 0.55)` — distinct but legible
- No text-shadow needed — the backdrop-blur provides enough contrast separation

### Interactions

#### Card Hover (Interactive Cards Only — Category Cards)
- Border brightens: `rgba(255, 255, 255, 0.12)` → `rgba(255, 255, 255, 0.25)`
- Slight lift: `translateY(-2px)`
- Shadow deepens slightly
- Transition: `300ms ease-out`
- Cursor: pointer (already exists)

#### Button Interactions
- **Primary button**: Solid violet background with subtle glow shadow (`0 0 20px rgba(124, 58, 237, 0.4)`)
  - Hover: Glow intensifies, background lightens slightly
- **Ghost/outline button**: Transparent with white border
  - Hover: Glass fill appears (`rgba(255, 255, 255, 0.08)`)
- **All buttons**: `transition: all 200ms ease`

#### Tab Interactions
- **Tab container**: Glass-style background (`rgba(255, 255, 255, 0.05)`)
- **Active tab**: Brighter glass fill (`rgba(255, 255, 255, 0.15)`) with a subtle bottom glow or inner highlight
- **Hover on inactive tab**: Gentle fill appears (`rgba(255, 255, 255, 0.08)`)
- **Transition**: Smooth 200ms background transition

#### Expand/Collapse (Category Detail)
- Current: Instant show/hide (conditional render)
- Enhanced: No complex animation needed. The content appearing/disappearing is acceptable. Focus the animation budget on hover effects which give more frequent delight.

#### File Upload Drop Zone
- **Default**: Glass card with dashed border (`rgba(255, 255, 255, 0.20)`)
- **Drag hover**: Border brightens to violet (`rgba(124, 58, 237, 0.6)`), background fills with violet tint (`rgba(124, 58, 237, 0.08)`)
- **Transition**: 200ms smooth

#### Progress Bar
- **Track**: `rgba(255, 255, 255, 0.08)`
- **Indicator**: Violet gradient with a subtle shimmer/pulse animation during active upload
- **Completed**: Solid emerald fill

### Chart Integration

#### Recharts on Glass
- **Chart backgrounds**: Transparent (no fill, let the glass card show through)
- **Grid lines**: `rgba(255, 255, 255, 0.06)` — barely visible, just enough for reference
- **Axis text**: `rgba(255, 255, 255, 0.45)` — subtle
- **Tooltips**: Glass-styled — translucent dark background with backdrop-blur, white text, rounded corners, subtle border. Custom tooltip components where needed.
- **Area fills**: Use chart color at 15% opacity (existing pattern works well)
- **FitnessScore background ring**: `rgba(255, 255, 255, 0.08)` instead of current `#e5e7eb`

#### Sparklines (MetricCard)
- Line color: `rgba(255, 255, 255, 0.35)` — subtle on the glass card
- No fill, just the line

### Page-Specific Details

#### Dashboard Header
- "Ralph" title: White, bold, larger weight
- "Preview Mode" badge: Glass pill with amber text
- Navigation buttons: Ghost style with glass hover
- Date range tabs: Glass container as described above

#### Import Page
- Same gradient background (consistent experience)
- Upload area: Large glass card with dashed border
- Instructions card: Glass card with numbered steps
- All text in white/light tones

### Responsive Behavior
- Glass effects apply at all breakpoints
- On mobile: Single-column layout already exists; glass cards stack naturally
- Backdrop-blur is supported on all modern mobile browsers
- Touch targets remain the same size (no reduction for aesthetics)

### Copy/Messaging

No copy changes. The glassmorphism redesign is purely visual. All existing text, labels, error messages, and instructions remain identical.

### Feedback

All existing feedback patterns remain:
- Loading states show on glass cards (same text, glass styling)
- Success/error import results display on glass cards with appropriate color accents
- Chart tooltips appear on hover with glass styling
- Progress bar fills during upload with violet indicator

## Success Metrics

How do we know the UX is successful?
- **Visual cohesion**: Every card, button, and chart element feels part of the same glass design system — no component looks "unstyled" or inconsistent
- **Readability**: All text is easily readable on glass backgrounds (sufficient contrast ratios)
- **Interaction smoothness**: Hover effects and transitions feel smooth at 60fps, no jank
- **No regressions**: All existing functionality works identically — date switching, category expand, import flow, preview toggle
- **Performance**: No noticeable lag from backdrop-blur effects on standard devices

## Out of Scope

- **New features or screens**: This is a visual reskin only. No new pages, components, or functionality.
- **Light mode**: The glassmorphism design is dark-first. The existing light theme will be replaced, not maintained alongside.
- **Complex animations**: No page transitions, no parallax scrolling, no animated background particles. Interactions are limited to hover/active state transitions.
- **Mobile-specific gestures**: No swipe gestures or mobile-specific interaction patterns.
- **Accessibility overhaul**: Color contrast will be maintained, but a full WCAG audit is not in scope.
- **Theming/customization**: No user-selectable themes or color pickers.

## Open Questions

1. **Gradient palette preference**: The spec suggests deep navy → purple → dark teal. If the user prefers a different color story (e.g., darker, more blue, more green for "health"), this can be adjusted during implementation.
2. **Dark-only confirmation**: This spec removes the light theme. If both themes are required, the scope increases significantly.

## Simplification Opportunities

1. **Skip expand/collapse animation**: The category detail expand is an instant show/hide. Adding smooth height animation would require layout measurement and is complex for minimal gain. The hover effects on cards provide sufficient interaction delight.
2. **Reuse glass card base style**: Rather than styling each component individually, define a single `.glass` utility class in globals.css and apply it to all cards. This reduces implementation complexity and ensures consistency.
3. **CSS custom properties over hardcoded values**: Update the existing CSS variable system rather than adding new class names everywhere. Components that already use `bg-card`, `text-card-foreground`, `border` will inherit the glass look automatically with minimal per-component changes.
4. **Chart colors via CSS variables**: Define chart colors as CSS custom properties so they can be updated in one place rather than in each chart component file.
