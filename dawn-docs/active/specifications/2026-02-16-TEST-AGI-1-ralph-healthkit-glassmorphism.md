# Specification: Ralph HealthKit View (Glassmorphism Design Style)

**Issue**: TEST-AGI-1
**Date**: 2026-02-16
**Research**: dawn-docs/active/research/2026-02-16-TEST-AGI-1-ralph-healthkit-glassmorphism.md
**Status**: Complete

## Executive Summary

Transform the Ralph HealthKit fitness dashboard from its current flat, opaque design into an immersive glassmorphism experience. Users will see their fitness data presented on frosted-glass cards floating over a rich gradient background, with smooth hover animations and a cohesive dark-themed aesthetic that makes the dashboard feel modern, premium, and alive.

## User Experience Goals

### Primary Goal
Make the Ralph dashboard feel like a premium, immersive fitness command center — the kind of interface that makes checking health data feel rewarding.

### Experience Principles
- **Simplicity**: The glass treatment elevates existing layout and hierarchy — no new UI elements, no added complexity. The same cards, charts, and navigation, just more visually refined.
- **Delight**: Subtle hover glows, smooth transitions, and depth layering give the interface a sense of physicality. Cards feel like they exist in space, not flat on a page.
- **Polish**: Every surface, border, and shadow is intentional. Glass opacity is tuned for readability. Colors complement the gradient background. Nothing feels half-done.

## User Flows

### Happy Path: Viewing the Dashboard
1. User opens the dashboard → sees a deep gradient background with floating glass header and content cards
2. Header glass bar shows "Ralph" title with the preview badge, navigation link, and last-sync info — all crisp and readable on the frosted surface
3. Date range tabs (30d, 60d, 90d, 365d) sit in a glass tab bar; the active tab glows subtly brighter
4. Fitness score gauge renders inside a glass card with the score color (green/yellow/red) providing a focal pop of color
5. Category cards (Running, Gym) appear as glass panels with metric values, sparkline charts, and trend indicators clearly readable
6. Scrolling down reveals comparison cards and trend charts, all in matching glass containers
7. Footer card with import link sits at the bottom, styled consistently

### Happy Path: Import Page
1. User navigates to Import → same gradient background, glass header
2. Upload area is a glass card with a dashed inner border for the drop zone
3. User drags a file → drop zone lights up with a glow border and tinted fill
4. Upload progresses → glass progress bar fills smoothly
5. Results display in glass-styled cards matching the dashboard aesthetic

### Edge Cases
| Scenario | User Experience |
|----------|-----------------|
| Loading state | Glass card with pulsing "Loading dashboard..." text — the glass card itself is visible immediately, providing layout stability |
| Empty state (no data) | Glass card with friendly message and a glowing CTA button to import data |
| Error state | Glass card with error message and retry button; red accent but not alarming |
| Mobile viewport | Glass effects simplified (lower blur values) for performance; single-column layout preserved |
| Very long metric values | Text truncates gracefully within glass cards; tooltips on hover for full values |

### Error States
| Error | User Message | Recovery Path |
|-------|--------------|---------------|
| API failure | "Unable to load dashboard data" | Retry button in glass card |
| No data imported | "No health data yet. Import your Apple Health export to get started." | CTA button links to import page |
| File upload failure | "Upload failed. Please try again." | File input resets; user can retry immediately |
| Chart render error | Chart area shows fallback message inside glass card boundary | Automatic — error boundary catches and displays message |

## Interface Specifications

### Visual Foundation: Background

The entire app sits on a **dark gradient background** that provides the colored surface needed for glass effects to work. This is the most critical design decision — without a vivid background, glassmorphism is invisible.

**Background Treatment**:
- Base: Deep navy-to-indigo gradient (`#0a0a1a` → `#1a1040` → `#0d1b2a`)
- Accent blobs: Two or three soft, large radial gradients providing color variation:
  - Top-left: Soft purple/violet radial (`rgba(120, 60, 200, 0.15)`)
  - Bottom-right: Soft teal/cyan radial (`rgba(40, 180, 200, 0.12)`)
  - Center-left: Subtle warm accent (`rgba(200, 100, 60, 0.08)`)
- The blobs are fixed-position and do not scroll, creating a stable backdrop
- Background is applied to the `<body>` or root wrapper, covering the full viewport

**Why dark-only**: A fitness dashboard benefits from a dark, focused aesthetic. Glassmorphism is most visually effective on dark backgrounds where the frosted blur creates depth and the glass borders catch light. Supporting both light and dark modes would double the design effort for diminished impact.

### Visual Foundation: Glass Card System

All cards in the app share a unified glass treatment with three tiers:

**Tier 1 — Primary Glass (main content cards)**
- Background: `rgba(255, 255, 255, 0.06)` (6% white)
- Backdrop blur: `16px`
- Border: `1px solid rgba(255, 255, 255, 0.10)`
- Border-radius: `16px` (rounded-2xl)
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.2)`

**Tier 2 — Elevated Glass (headers, footers, prominent containers)**
- Background: `rgba(255, 255, 255, 0.08)` (8% white)
- Backdrop blur: `20px`
- Border: `1px solid rgba(255, 255, 255, 0.12)`
- Border-radius: `16px`
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.25)`

**Tier 3 — Subtle Glass (nested elements, tab bars, inner containers)**
- Background: `rgba(255, 255, 255, 0.04)` (4% white)
- Backdrop blur: `8px`
- Border: `1px solid rgba(255, 255, 255, 0.06)`
- Border-radius: `12px`
- Shadow: none or very subtle

### Visual Foundation: Color Palette

**Text Colors**:
- Primary text: `rgba(255, 255, 255, 0.95)` — near-white, high contrast on glass
- Secondary text: `rgba(255, 255, 255, 0.60)` — muted labels and descriptions
- Tertiary text: `rgba(255, 255, 255, 0.40)` — subtle hints and timestamps

**Accent Colors** (retained from current design, tuned for dark glass):
- Score good (≥70): `#34d399` (emerald-400, softer green that works on dark glass)
- Score moderate (50-69): `#fbbf24` (amber-400)
- Score poor (<50): `#f87171` (red-400, softened)
- Trend improving: `#34d399`
- Trend stable: `rgba(255, 255, 255, 0.50)`
- Trend declining: `#f87171`

**UI Accent Colors**:
- Primary interactive: `rgba(139, 92, 246, 0.80)` (violet — used for active states, CTA buttons)
- Primary interactive hover: `rgba(139, 92, 246, 1.0)`
- Focus ring: `rgba(139, 92, 246, 0.50)` with `3px` spread

**Chart Colors** (optimized for visibility on glass backgrounds):
- Chart 1: `#8b5cf6` (violet-500)
- Chart 2: `#06b6d4` (cyan-500)
- Chart 3: `#34d399` (emerald-400)
- Chart 4: `#fbbf24` (amber-400)
- Chart 5: `#f87171` (red-400)
- Chart grid lines: `rgba(255, 255, 255, 0.06)`
- Chart axis text: `rgba(255, 255, 255, 0.40)`

### Typography

**Font**: Keep Geist Sans — it's clean, modern, and pairs well with glassmorphism. No font change needed.

**Weight Adjustments for Glass Readability**:
- Page title "Ralph": `font-bold` (700) — no change, already prominent
- Card titles: Bump from `font-semibold` (600) to `font-bold` (700) — glass backgrounds need slightly heavier text
- Metric values: `font-bold` (700) — keep as-is, large size provides readability
- Labels and descriptions: `font-medium` (500) — slightly heavier than current `font-normal` for glass readability
- Small text: Minimum `font-medium` (500) on glass — thin text on transparent backgrounds is hard to read

**No size changes needed** — the current type scale is well-structured.

### Component-by-Component Specifications

#### Header Bar
- **Treatment**: Tier 2 glass, spanning full width
- **Layout**: Same container/flex layout as current
- **Bottom border**: Replace solid border with glass border (subtle white line)
- **"Ralph" title**: White, bold — pops against glass
- **Preview badge**: Keep amber styling but adjust for glass: `rgba(251, 191, 36, 0.15)` bg, `rgba(251, 191, 36, 0.50)` border, `#fbbf24` text
- **Navigation links**: White/60% opacity, hover to white/95%

#### Date Range Tabs
- **Tab list container**: Tier 3 glass (subtle inner container)
- **Inactive tabs**: Transparent bg, white/60% text
- **Active tab**: `rgba(255, 255, 255, 0.10)` bg with subtle inner glow, white/95% text
- **Hover (inactive)**: `rgba(255, 255, 255, 0.05)` bg, white/80% text
- **Transition**: `150ms ease` for background and text color changes

#### Fitness Score Gauge
- **Container**: Tier 1 glass card
- **Radial chart**: Keep current scoring colors (#34d399, #fbbf24, #f87171) — they pop beautifully on glass
- **Score number**: Large, bold, score-colored text
- **Trend indicator**: Below score, using trend colors with arrow icon

#### Metric Cards
- **Container**: Tier 1 glass cards in responsive grid
- **Value display**: Large bold white text
- **Sparkline**: Use chart colors (adjusted palette), stroke width 2
- **Trend badge**: Small rounded glass pill with trend color and arrow
- **Hover**: Card lifts slightly — `translateY(-2px)` with increased shadow spread

#### Category Detail View
- **Container**: Tier 1 glass card
- **Inner metric rows**: Separated by `rgba(255, 255, 255, 0.06)` dividers
- **Bar chart**: Use adjusted chart colors; bar backgrounds at `rgba(255, 255, 255, 0.06)`

#### Trend Charts
- **Container**: Tier 1 glass card
- **Chart area**: Transparent background (the glass card provides the surface)
- **Grid lines**: `rgba(255, 255, 255, 0.06)` — barely visible
- **Axis labels**: `rgba(255, 255, 255, 0.40)`
- **Line/area strokes**: Chart palette colors at full opacity
- **Area fills**: Chart palette colors at 10-15% opacity
- **Tooltip**: Tier 2 glass treatment (small floating glass card)

#### Comparison Cards
- **Container**: Tier 1 glass card
- **Current value**: Large bold white
- **Previous value**: White/50% opacity
- **Delta indicator**: Colored (green up, red down, gray stable) with percentage

#### Progress Bar
- **Track**: `rgba(255, 255, 255, 0.08)` background, `rounded-full`
- **Fill**: Gradient from primary violet to cyan (`#8b5cf6` → `#06b6d4`)
- **Animation**: Smooth width transition, `300ms ease`

#### Buttons
- **Primary (CTA)**: `rgba(139, 92, 246, 0.80)` bg, white text, hover brightens to full opacity
- **Outline**: Tier 3 glass bg, `rgba(255, 255, 255, 0.12)` border, white/80% text
- **Ghost**: Transparent bg, white/60% text, hover adds `rgba(255, 255, 255, 0.06)` bg
- **All buttons**: `border-radius: 10px`, smooth `150ms` transitions

#### Import Page & File Upload
- **Page layout**: Same gradient background, glass header
- **Upload card**: Tier 1 glass card
- **Drop zone**: Inner dashed border using `rgba(255, 255, 255, 0.15)`, `2px dashed`
- **Drag hover**: Border brightens to violet accent, inner fill `rgba(139, 92, 246, 0.08)`
- **Upload icon circle**: `rgba(255, 255, 255, 0.08)` bg, white/60% icon
- **Results display**: Tier 1 glass cards matching dashboard style

#### Loading/Empty/Error States
- **Loading**: Tier 1 glass card, white/50% "Loading dashboard..." text, centered
- **Empty**: Tier 1 glass card, friendly message in white/80%, violet CTA button below
- **Error**: Tier 1 glass card, message in white/80%, red-tinted text for error detail, outline retry button

### Interactions

**Hover Effects (Cards)**:
- Cards lift on hover: `transform: translateY(-2px)`
- Border brightens: opacity increases from 10% to 16%
- Shadow deepens: spread increases slightly
- Transition: `200ms ease` on transform, border, and shadow
- Apply to: All Tier 1 glass cards (content cards, metric cards, comparison cards)

**Hover Effects (Buttons and Links)**:
- Buttons: Background opacity increases, smooth `150ms` transition
- Navigation links: Text opacity transitions from 60% to 95%
- Tab triggers: Background tint appears, text brightens

**Focus States**:
- Focus ring: `3px` violet ring (`rgba(139, 92, 246, 0.50)`) with `2px` offset
- Visible on keyboard navigation only (`:focus-visible`)

**Transitions**:
- All interactive state changes: `150ms ease` minimum
- Card hover lift: `200ms ease`
- Tab content switching: Instantaneous (no fade — content swap should feel snappy)
- Progress bar fill: `300ms ease`

**No Animations On**:
- No backdrop-blur animations (performance cost)
- No background gradient animations (distracting for a data dashboard)
- No loading spinners — simple text states are cleaner

### Copy/Messaging

All existing copy remains unchanged. The glassmorphism makeover is purely visual — no text, labels, or messages need updating. The current copy is already concise and appropriate.

### Feedback

- **Hover feedback**: Immediate visual lift and border brightening on cards (< 200ms)
- **Click feedback**: Buttons darken slightly on `:active` (pressed state)
- **Tab switch**: Active tab visually highlights immediately; content updates on data fetch
- **File drag**: Drop zone border and fill change immediately on dragenter
- **Upload progress**: Progress bar fills smoothly, reflecting actual progress

## Success Metrics

How do we know the UX is successful?
- **Visual coherence**: All cards, buttons, tabs, and containers use the glass system consistently — no element looks like it belongs to the old design
- **Readability**: All text meets minimum 4.5:1 contrast ratio on glass surfaces (verify with the chosen opacity values)
- **Performance**: No perceptible jank when scrolling or hovering, especially on the dashboard with multiple cards and charts
- **Responsiveness**: Glass effects render correctly on mobile viewports; reduced blur on smaller screens if needed for performance
- **Completeness**: Every visible surface (header, cards, tabs, charts, import page, states) has been updated — no flat/opaque holdovers

## Out of Scope

- **Light mode support** — This specification is dark-theme only. Glassmorphism on light backgrounds is visually weak and would require a separate design pass.
- **New features or layout changes** — No new UI elements, pages, or navigation. The makeover applies to existing surfaces only.
- **Data or API changes** — Purely presentational. No backend, API, or data flow changes.
- **Animated background** — The gradient background is static. Animated gradients or floating blobs add complexity and distraction for a data-heavy dashboard.
- **Custom chart components** — Charts use Recharts; only colors and tooltip styling change, not chart structure.
- **Dark mode toggle** — The app will be dark-only after this change. No toggle UI is needed.

## Open Questions

1. **Gradient colors**: The spec proposes navy/indigo/violet tones. If the user prefers a different palette (teal-heavy, warm sunset, etc.), the gradient and accent colors can be adjusted during implementation.
2. **Import page depth**: Should the import page file upload results (success/error per metric) also get full glass treatment, or is a simpler treatment acceptable for this secondary page?

## Simplification Opportunities

1. **Dark-only theme**: By committing to dark-only, we avoid doubling the design work for light mode glass effects (which are visually weaker anyway). This halves the CSS variable surface area.
2. **Three-tier glass system**: Rather than custom-tuning every component, three reusable glass tiers (Primary, Elevated, Subtle) cover all use cases. This keeps the system consistent and easy to maintain.
3. **No animated backgrounds**: Static gradient with fixed accent blobs is visually effective and avoids GPU overhead and distraction. Animations can always be added later.
4. **Keep existing fonts and type scale**: Geist Sans works perfectly for glassmorphism. Only weight adjustments are needed, not a full typography redesign.
5. **Existing layout preserved**: The current grid system, spacing, and component hierarchy are already well-structured. The glass treatment layers on top without restructuring.
