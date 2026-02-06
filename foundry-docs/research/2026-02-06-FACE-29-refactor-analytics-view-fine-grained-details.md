# Research: Refactor the analytics view to provide more fine-grained details

**Issue**: FACE-29
**Date**: 2026-02-06
**Status**: Complete

## Summary

The user wants to refactor the analytics dashboard to focus on the two activities they actually do — **running (cardio)** and **gym (strength training)** — instead of the current 4-category generic fitness scoring view. The current Body and Recovery categories should be removed. Cardio and Activity should show detailed, actionable week-on-week metrics (heart rate trends, per-km pace, gym intensity, workout counts/durations).

## Requirements Analysis

### 1. Remove Body and Recovery categories
- Delete Body card, Recovery card, and their detail views
- Remove from the Category Breakdown bar chart
- Update scoring weights (currently Body=15%, Recovery=15%)

### 2. Keep Overall Fitness Score as-is
- The radial gauge (currently showing 74, declining) stays
- Recalculate weights: now only Cardio + Activity contribute to overall score

### 3. Cardio — Fine-grained details
The user wants to understand *why* the cardio score is declining. Current cardio only shows VO2 Max, Resting Heart Rate, and HRV as aggregate scores.

**Requested new metrics:**
- **Heart rate trends** — weekly average heart rate during runs, resting HR trend
- **Speed/pace (per-km time)** — derived from distance and duration of running workouts

**Data availability:**
- `workouts` table: has `workout_type='Running'`, `duration_minutes`, `distance_km`, `avg_heart_rate` — **all available**
- `records` table: has `HKQuantityTypeIdentifierHeartRate`, `RestingHeartRate`, `HRV`, `VO2Max` — **all available**
- `records` table: has `HKQuantityTypeIdentifierDistanceWalkingRunning` — **available** for total distance tracking
- **Per-km pace** can be derived: `duration_minutes / distance_km` from the `workouts` table for Running workouts

### 4. Activity — Fine-grained details + Gym category
The user wants Activity broken into two sub-categories:

**Running sub-view:**
- Number of running workouts per week
- Duration of running workouts
- (Overlaps with Cardio — could be a shared or linked view)

**Gym sub-view (NEW):**
- Number of gym workouts per week
- Duration of gym workouts
- Gym intensity (energy burned per minute or total energy)
- Heart rate during gym workouts

**Data availability:**
- `workouts` table with `workout_type` can distinguish:
  - `'Running'` → cardio/running
  - `'Strength Training'` → gym (from `HKWorkoutActivityTypeFunctionalStrengthTraining` and `HKWorkoutActivityTypeTraditionalStrengthTraining` — both map to `'Strength Training'`)
  - `'HIIT'` → could be gym or cardio (user may want this under gym)
- Each workout has: `duration_minutes`, `distance_km`, `total_energy_kcal`, `avg_heart_rate`
- **All requested gym metrics are available** in the workouts table

### 5. Ideal end state: Week-on-week dashboard
- Cardio: heart rate trends, per-km pace improvement over weeks
- Gym: intensity trends, heart rate during gym over weeks
- Week-on-week comparisons (current week vs previous weeks)

## Codebase Analysis

### Relevant Files

| File | Purpose | Impact |
|------|---------|--------|
| `src/components/dashboard/Overview.tsx` | Main dashboard layout with 4 category cards | **Major change** — reduce to 2 categories, restructure layout |
| `src/components/dashboard/CardioMetrics.tsx` | Cardio detail view (thin wrapper) | **Major change** — replace with detailed running metrics |
| `src/components/dashboard/ActivityMetrics.tsx` | Activity detail view (thin wrapper) | **Major change** — replace with Running + Gym sub-views |
| `src/components/dashboard/VitalsMetrics.tsx` | Body detail view | **Delete** |
| `src/components/dashboard/RecoveryMetrics.tsx` | Recovery detail view | **Delete** |
| `src/components/dashboard/CategoryDetail.tsx` | Shared category detail implementation | **Modify** — may need new detail layouts |
| `src/components/charts/ProgressChart.tsx` | Category Breakdown bar chart | **Modify** — show only Cardio + Activity |
| `src/components/charts/MetricCard.tsx` | Summary card with sparkline | **Keep** — reusable for new metrics |
| `src/components/charts/TrendChart.tsx` | Line/area chart for time series | **Keep** — reusable |
| `src/app/api/analytics/route.ts` | Dashboard data API | **Major change** — new response shape, new workout-based queries |
| `src/lib/analytics/fitness-score.ts` | Scoring engine (896 lines) | **Major change** — remove Body/Recovery scoring, add workout-based metrics |
| `src/lib/analytics/metrics.ts` | Metric aggregation | **Modify** — add workout-specific metrics |
| `src/lib/db/queries.ts` | Database query layer | **Add** — new queries for workout-specific data |
| `src/types/analytics.ts` | TypeScript types | **Modify** — update DashboardData, add new metric types |
| `src/config/metrics.ts` | Health type config + weights | **Modify** — update weights, may add workout-related config |
| `src/lib/db/schema.ts` | Database schema | **No change** — existing schema supports all needed data |

### Existing Patterns
- Category detail views are thin wrappers around `CategoryDetail.tsx`
- Metrics use `getMetricSummary()` which queries `records` table by HK type
- Workouts are stored separately in `workouts` table with type, duration, distance, energy, avg HR
- Charts use Recharts (RadialBarChart, LineChart, BarChart)
- API returns a single `DashboardData` object with all categories

### Dependencies
- No database schema changes needed — workouts table already has all required fields
- No new npm packages needed — Recharts handles all visualization
- No import pipeline changes needed — running and strength training workouts are already parsed

## Implementation Considerations

### Approach: Workout-Centric Analytics

The key architectural shift is from **records-only metrics** to **workout-based metrics**. Currently, the analytics engine only queries the `records` table for individual health measurements. The new design needs to also query the `workouts` table to derive:

1. **Per-km pace**: `duration_minutes / distance_km` from Running workouts
2. **Workout counts/frequency**: `COUNT(*)` grouped by week + workout_type
3. **Gym intensity**: `total_energy_kcal / duration_minutes` from Strength Training workouts
4. **Workout-specific heart rates**: `avg_heart_rate` from workouts filtered by type

**New query functions needed in `queries.ts`:**
- `getWorkoutsByType(type, startDate, endDate)` — filter workouts by type
- `getWeeklyWorkoutSummary(type, startDate, endDate)` — weekly aggregates per workout type

**New metric computation in `metrics.ts` or a new `workout-metrics.ts`:**
- `getRunningMetrics(dateRange)` → pace trend, HR during runs, distance per run, run count
- `getGymMetrics(dateRange)` → intensity trend, HR during gym, duration, workout count

### Dashboard Layout Proposal

**Current layout:**
```
[Overall Fitness Score gauge]
[Cardio] [Activity] [Body] [Recovery]   ← 4 cards
[Category Breakdown bar chart]
[Score Trend line chart]
```

**Proposed layout:**
```
[Overall Fitness Score gauge]
[Cardio] [Activity]                      ← 2 cards (wider, more detail)
  └─ Click to expand detailed view
[Category Breakdown bar chart]           ← only Cardio + Activity
[Score Trend line chart]
```

**Expanded Cardio view:**
```
Cardio Metrics
├── Running Pace (min/km) — trend chart showing per-km pace week-on-week
├── Heart Rate (during runs) — avg HR per run, trend over weeks
├── Resting Heart Rate — daily trend (from records table)
├── Runs per Week — bar chart showing weekly run count
└── Running Distance — total km per week
```

**Expanded Activity view:**
```
Activity Metrics
├── Running section:
│   ├── Workouts per week (count)
│   └── Total duration per week
├── Gym section:
│   ├── Workouts per week (count)
│   ├── Total duration per week
│   ├── Avg intensity (kcal/min)
│   └── Avg heart rate during gym
└── Weekly summary (combined workout count + duration)
```

### Score Weight Changes

**Current:**
- Cardio: 40%, Activity: 30%, Body: 15%, Recovery: 15%

**Proposed (remove Body + Recovery, redistribute):**
- Cardio: 55%, Activity: 45%
- Cardio sub-components: VO2 Max (25%), Resting HR (20%), HRV (15%), Running Pace improvement (20%), Running HR improvement (20%)
- Activity sub-components: Workout frequency (30%), Total exercise time (25%), Running volume (20%), Gym consistency (25%)

### Risks

1. **Empty gym data**: If the user hasn't logged strength training workouts, the Gym section will show empty. Need graceful empty states.
2. **Pace calculation edge cases**: Workouts with distance=0 or null (treadmill without GPS?) — need to handle division by zero.
3. **Week boundary calculation**: Need consistent week start (Monday vs Sunday) for week-on-week comparisons.
4. **Score migration**: Existing `fitness_scores` table has `body_score` and `recovery_score` columns. These become unused but don't need to be dropped (just ignored).
5. **Workout type mapping**: "HIIT" could be either gym or cardio — need to decide where it goes. Recommendation: classify HIIT as gym since user said "2 main exercises: running and gym."

### Testing Strategy

1. **Unit tests**: New query functions (`getWorkoutsByType`, weekly aggregations)
2. **Integration tests**: API response shape with new category structure
3. **Visual QA**: Verify charts render correctly with real data, empty states work
4. **Edge cases**: No workouts in period, only running (no gym), pace=0

## Specification Assessment

This feature needs a UX specification because:
- **Significant UX changes**: The dashboard is being fundamentally restructured — going from 4 generic categories to 2 workout-focused categories with completely new detail views
- **New user flows**: Expanded Cardio and Activity views with workout-specific sub-sections (Running vs Gym)
- **New visualization patterns**: Week-on-week comparison charts, per-workout metrics (pace, intensity) that don't exist in the current UI
- **Multiple UX decisions needed**: How to present week-on-week data, how to lay out Running vs Gym sub-sections, whether to use tabs/accordion/side-by-side

**Needs Specification**: Yes

## Questions for Human Review

1. **HIIT classification**: Should HIIT workouts be grouped under "Gym" or treated as a separate category? (Recommendation: Gym)
2. **Other workout types**: What about Walking, Cycling, Yoga, etc.? Should they appear anywhere or be completely excluded? (Recommendation: exclude for now, only Running and Gym/Strength)
3. **Week definition**: Should weeks start on Monday or Sunday for the week-on-week view?
4. **Historical data**: Should existing `fitness_scores` with body/recovery data be cleared, or just ignored going forward?
5. **Score weights**: Is the proposed 55% Cardio / 45% Activity split appropriate, or does the user want a different weighting?

## Next Steps

Ready for specification phase. The specification should define:
- Exact dashboard layout with the new 2-category structure
- Cardio detail view wireframe (which metrics, chart types, layout)
- Activity detail view wireframe with Running/Gym sub-sections
- Week-on-week comparison presentation style
- Empty state designs for missing data
