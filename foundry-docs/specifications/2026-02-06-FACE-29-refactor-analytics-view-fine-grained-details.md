# Specification: Refactor the analytics view to provide more fine-grained details

**Issue**: FACE-29
**Date**: 2026-02-06
**Research**: foundry-docs/research/2026-02-06-FACE-29-refactor-analytics-view-fine-grained-details.md
**Status**: Complete

## Executive Summary

Transform the analytics dashboard from a generic 4-category fitness overview into a focused, workout-centric dashboard for the user's two main activities: **Running** and **Gym**. Users will be able to see week-on-week trends in running pace, heart rate, gym intensity, and workout frequency — giving them clear, actionable insight into whether their fitness is actually improving.

## User Experience Goals

### Primary Goal
Understand at a glance whether running fitness and gym performance are improving week-on-week, with the ability to drill into specific metrics.

### Experience Principles
- **Simplicity**: Two categories instead of four. Every metric shown is directly actionable — no abstract "body" or "recovery" scores the user doesn't care about.
- **Delight**: Week-on-week comparisons with clear trend arrows make progress feel tangible. Seeing pace drop or heart rate improve is intrinsically motivating.
- **Polish**: Graceful empty states for missing gym data, sensible defaults for edge cases (treadmill runs without GPS), consistent visual language throughout.

## User Flows

### Happy Path
1. User opens the dashboard and sees the **Overall Fitness Score** gauge (unchanged)
2. Below the gauge, user sees **two category cards**: "Running" and "Gym" — each showing a summary score, trend indicator, and sparkline
3. User taps **Running** card → expands to show detailed running metrics in a grid: Avg Pace, Avg Heart Rate, Resting Heart Rate, Weekly Run Count, Weekly Distance
4. Each metric card shows: current value, trend direction, % change over period, and a time-series chart
5. User taps **Gym** card → expands to show detailed gym metrics: Workouts/Week, Avg Duration, Avg Intensity, Avg Heart Rate
6. Below the cards, the **Category Breakdown** bar chart shows only Running and Gym scores
7. Below that, the **Score Trend** line chart shows the overall score history

### Edge Cases
| Scenario | User Experience |
|----------|-----------------|
| No gym workouts in selected period | Gym card shows "--" score with "→ stable" trend. Detail view shows: "No gym workouts recorded in this period. Start logging strength training to see your progress here." |
| No running workouts in selected period | Running card shows "--" score. Detail view shows: "No runs recorded in this period." |
| Treadmill run (distance = 0 or null) | Pace metric excluded from that workout's average. If all runs lack distance, pace card shows "--" with note "Pace unavailable — no GPS distance recorded." |
| Only 1 data point for a metric | Sparkline hidden on card. Detail chart shows single dot with message "More data needed for trend." |
| Very short date range (e.g. 30d) with few workouts | Show available data points. No fake interpolation. Weekly bars may show only 1-4 bars — that's fine. |
| HIIT workouts | Classified as Gym. No separate HIIT category. |
| Walking, Cycling, Yoga, etc. | Not shown. Only Running and Strength Training workouts appear in the dashboard. |

### Error States
| Error | User Message | Recovery Path |
|-------|--------------|---------------|
| API fails to load dashboard | "Unable to load fitness data. Please try again." | Retry button |
| Database has no workouts at all | Overall score shows "--". Both cards show "--". Category breakdown is empty. | Normal state — user needs to import/sync HealthKit data |
| Date range returns zero records | "No data available for this period." shown in place of charts | User switches to a longer date range |

## Interface Specifications

### Dashboard Layout (Top to Bottom)

```
┌──────────────────────────────────────────┐
│         Overall Fitness Score            │
│              ┌─────┐                     │
│              │  74 │  ↓ declining         │
│              └─────┘                     │
└──────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│    Running       │  │      Gym         │
│  67.8 score      │  │   72.1 score     │
│  ↓ declining  ~~ │  │  → stable    ~~  │
└──────────────────┘  └──────────────────┘

   (expanded detail area — one at a time)

┌──────────────────────────────────────────┐
│         Category Breakdown               │
│  Running  ████████████████░░░░  67.8     │
│  Gym      ██████████████████░░  72.1     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│            Score Trend                   │
│         (line chart over time)           │
└──────────────────────────────────────────┘
```

**Key layout change**: Category cards go from a 4-column grid to a **2-column grid** (side by side on desktop, stacked on mobile). Cards are wider, giving more room for the sparkline.

### Running Detail View (Expanded)

When the user taps the Running card, this section appears below the cards grid:

```
Running Metrics
┌─────────────────────┐  ┌─────────────────────┐
│ Avg Pace             │  │ Avg Heart Rate       │
│ 5:32 min/km         │  │ 156 bpm              │
│ ↑ improving  -3.2%  │  │ ↓ declining  +2.1%   │
│ ┌─────────────────┐ │  │ ┌─────────────────┐  │
│ │  area chart     │ │  │ │  area chart     │  │
│ └─────────────────┘ │  │ └─────────────────┘  │
└─────────────────────┘  └─────────────────────┘
┌─────────────────────┐  ┌─────────────────────┐
│ Resting Heart Rate   │  │ Runs per Week        │
│ 52 bpm              │  │ 3.5 avg              │
│ ↑ improving  -1.8%  │  │ → stable   0%        │
│ ┌─────────────────┐ │  │ ┌─────────────────┐  │
│ │  area chart     │ │  │ │  area chart     │  │
│ └─────────────────┘ │  │ └─────────────────┘  │
└─────────────────────┘  └─────────────────────┘
┌─────────────────────┐
│ Weekly Distance      │
│ 21.3 km             │
│ ↓ declining  -8.4%  │
│ ┌─────────────────┐ │
│ │  area chart     │ │
│ └─────────────────┘ │
└─────────────────────┘
```

**Running metrics (5 total):**

| Metric | Source | Unit | What it shows | Trend interpretation |
|--------|--------|------|---------------|---------------------|
| Avg Pace | `workouts` (Running): `duration_minutes / distance_km` | min/km (formatted as M:SS) | Average pace across runs in the period | Lower = improving (faster) |
| Avg Heart Rate (Runs) | `workouts` (Running): `avg_heart_rate` | bpm | Average heart rate during runs | Lower at same pace = improving; shown as raw trend |
| Resting Heart Rate | `records` (RestingHeartRate) | bpm | Daily resting HR trend | Lower = improving |
| Runs per Week | `workouts` (Running): count per week | count | How many runs per week on average | Higher = improving |
| Weekly Distance | `workouts` (Running): sum `distance_km` per week | km | Total running distance per week | Higher = improving |

### Gym Detail View (Expanded)

When the user taps the Gym card:

```
Gym Metrics
┌─────────────────────┐  ┌─────────────────────┐
│ Workouts per Week    │  │ Avg Duration         │
│ 2.3 avg             │  │ 48 min               │
│ → stable   0%       │  │ ↑ improving  +5.2%   │
│ ┌─────────────────┐ │  │ ┌─────────────────┐  │
│ │  area chart     │ │  │ │  area chart     │  │
│ └─────────────────┘ │  │ └─────────────────┘  │
└─────────────────────┘  └─────────────────────┘
┌─────────────────────┐  ┌─────────────────────┐
│ Avg Intensity        │  │ Avg Heart Rate       │
│ 8.2 kcal/min        │  │ 132 bpm              │
│ ↑ improving  +3.1%  │  │ ↑ improving  +1.4%   │
│ ┌─────────────────┐ │  │ ┌─────────────────┐  │
│ │  area chart     │ │  │ │  area chart     │  │
│ └─────────────────┘ │  │ └─────────────────┘  │
└─────────────────────┘  └─────────────────────┘
```

**Gym metrics (4 total):**

| Metric | Source | Unit | What it shows | Trend interpretation |
|--------|--------|------|---------------|---------------------|
| Workouts per Week | `workouts` (Strength Training + HIIT): count per week | count | Gym session frequency | Higher = improving |
| Avg Duration | `workouts` (Strength Training + HIIT): avg `duration_minutes` | min | How long gym sessions are | Higher = improving |
| Avg Intensity | `workouts` (Strength Training + HIIT): `total_energy_kcal / duration_minutes` | kcal/min | Energy output per minute | Higher = improving |
| Avg Heart Rate (Gym) | `workouts` (Strength Training + HIIT): avg `avg_heart_rate` | bpm | Cardiovascular effort during gym | Higher = improving (working harder) |

### Category Renaming

| Current Name | New Name | Reason |
|-------------|----------|--------|
| Cardio | **Running** | More specific — this category now tracks running workouts specifically, not generic "cardio" |
| Activity | **Gym** | The user's second activity type. Previous "Activity" was too vague. |

The Overall Fitness Score label stays as "Overall Fitness Score" — it remains the high-level composite.

### Visual Elements

- **Cards**: Same card component (`MetricCard`) used today. 2-column grid on desktop (md breakpoint), 1-column on mobile.
- **Detail view**: Same `CategoryDetail` pattern — 2-column grid of metric cards, each with a header (label, trend, value, % change) and a 300px TrendChart.
- **Charts**: All existing chart components (TrendChart, ProgressChart, FitnessScore) are reused. No new chart types needed.
- **Colors**: Score-based color coding stays (red < 50, yellow 50-69, green >= 70). Chart colors stay (#6366f1 indigo for detail charts, #3b82f6 blue for score trend).
- **Pace formatting**: Pace displayed as "M:SS min/km" (e.g., "5:32 min/km") rather than a decimal. This is a new format the formatter needs to support.

### Copy/Messaging

| Element | Text |
|---------|------|
| Running card title | "Running" |
| Gym card title | "Gym" |
| Running detail header | "Running Metrics" |
| Gym detail header | "Gym Metrics" |
| Empty gym state | "No gym workouts recorded in this period" |
| Empty running state | "No runs recorded in this period" |
| Pace unavailable | "Pace unavailable — no GPS distance recorded" |
| No data for chart | "Not enough data for chart" (existing) |

### Interactions

- **Click-to-expand**: Same as today. Click a category card to expand its detail view below the grid. Click again to collapse. Only one expanded at a time.
- **Date range selector**: Unchanged — controls the entire dashboard (30d, 60d, 90d, 365d).
- **No new interactions added**: No tabs, no toggles, no filters within detail views. Keeping it simple.

### Feedback

- **Loading state**: Existing loading pattern (skeleton/spinner while API loads).
- **Trend indicators**: Same visual language — green ↑ improving, gray → stable, red ↓ declining.
- **Sparklines**: One sparkline per card, showing the first metric's data (Running: pace trend; Gym: workout count trend).

## Score Weights

### Overall Score Composition (2 categories)
- **Running**: 55% of overall score
- **Gym**: 45% of overall score

### Running Score Components
| Component | Weight | Source | Improving means |
|-----------|--------|--------|-----------------|
| Resting Heart Rate | 25% | `records` table | Lower value |
| Running Pace | 25% | `workouts` (Running) | Lower min/km |
| Running Heart Rate | 20% | `workouts` (Running) | Lower at same effort |
| Run Frequency | 15% | `workouts` (Running) count | More runs/week |
| Weekly Distance | 15% | `workouts` (Running) distance sum | More km/week |

### Gym Score Components
| Component | Weight | Source | Improving means |
|-----------|--------|--------|-----------------|
| Workout Frequency | 30% | `workouts` (Strength + HIIT) count | More sessions/week |
| Avg Intensity | 25% | `workouts` energy/duration | Higher kcal/min |
| Gym Heart Rate | 25% | `workouts` (Strength + HIIT) avg HR | Higher = working harder |
| Session Duration | 20% | `workouts` (Strength + HIIT) avg duration | Longer sessions |

## Success Metrics

- **Clarity**: User can answer "Is my running improving?" within 3 seconds of looking at the Running card
- **Actionability**: Each metric in the detail view maps to something the user can change (run more, run faster, go to gym more often)
- **Simplicity**: Dashboard has fewer elements than before (2 cards vs 4), yet more useful information in the detail views

## Out of Scope

- **VO2 Max and HRV in the dashboard**: These are removed from the visible UI. They were part of the old Cardio score. The user didn't ask for them and they're not directly actionable. (They could be added back later as an "Advanced" section.)
- **Walking, Cycling, Yoga, or other workout types**: Not shown. Dashboard is focused on Running + Gym only.
- **Goal setting**: No target pace, target workouts/week, or similar. Just trend visualization.
- **Notifications or alerts**: No "your running is declining" push notifications.
- **Database schema changes**: Existing `workouts` and `records` tables have everything needed.
- **Historical score migration**: Old `body_score` and `recovery_score` columns in `fitness_scores` table are left as-is (unused, not dropped).

## Open Questions

1. **Week boundary**: Should weeks run Monday-Sunday or Sunday-Saturday for the "per week" metrics? **Recommendation**: Monday-Sunday (ISO standard, common in fitness apps).
2. **VO2 Max removal confirmation**: The research noted VO2 Max was a Cardio sub-metric. Removing it from the dashboard simplifies things but loses a long-term fitness indicator. Should it be kept as an optional/secondary metric in the Running detail view? **Recommendation**: Remove for now, can add later.

## Simplification Opportunities

1. **Merged Running+Activity into one "Running" category**: The original request had "Cardio" (running metrics) and "Activity" (workout counts including running). These overlapped significantly. Merging them into a single "Running" category avoids showing run count in two places and gives a cleaner mental model: Running = everything about your runs, Gym = everything about your gym sessions.
2. **No tabs or sub-navigation in detail views**: The research proposed Running and Gym as sub-sections within Activity. Instead, making them top-level peer categories (two cards) is simpler — one tap to see running, one tap to see gym. No nested navigation.
3. **Reuse all existing components**: No new chart types, no new card styles. The existing `CategoryDetail` grid of metric cards with `TrendChart` works perfectly for the new metrics. Implementation only needs new data queries, not new UI components.
4. **Removed VO2 Max and HRV from default view**: These records-based metrics are abstract and hard to act on. The workout-based metrics (pace, heart rate during exercise, intensity) are more concrete and useful.
