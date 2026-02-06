# Implementation Plan: Refactor the analytics view to provide more fine-grained details

**Issue**: FACE-29
**Date**: 2026-02-06
**Research**: foundry-docs/research/2026-02-06-FACE-29-refactor-analytics-view-fine-grained-details.md
**Specification**: foundry-docs/specifications/2026-02-06-FACE-29-refactor-analytics-view-fine-grained-details.md
**Status**: Implementation Complete

## Overview

Transform the 4-category analytics dashboard (Cardio, Activity, Body, Recovery) into a focused 2-category dashboard (Running, Gym) with workout-specific metrics. The key architectural shift is from records-only analytics to workout-based analytics that query the `workouts` table for per-km pace, gym intensity, workout frequency, and workout-specific heart rates.

**No schema changes needed.** The existing `workouts` table already stores all required data (workout_type, duration_minutes, distance_km, total_energy_kcal, avg_heart_rate).

## Success Criteria

- [x] Dashboard shows 2 category cards: "Running" and "Gym" (no Body/Recovery)
- [x] Running detail view shows 5 metrics: Avg Pace, Avg HR (runs), Resting HR, Runs/Week, Weekly Distance
- [x] Gym detail view shows 4 metrics: Workouts/Week, Avg Duration, Avg Intensity, Avg HR (gym)
- [x] Pace formatted as M:SS min/km (e.g., "5:32 min/km")
- [x] Score weights: Running 55%, Gym 45%
- [x] HIIT workouts classified under Gym
- [x] Graceful empty states when no workout data exists
- [x] Overall Fitness Score gauge unchanged (still shows composite score)
- [x] Category Breakdown bar chart shows only Running and Gym
- [x] All tests pass: `npm run test`
- [x] Type check passes: `npx tsc --noEmit`
- [x] Build passes: `npm run build`

## Implementation Notes

All 6 phases were implemented as specified with no deviations from the plan. Key details:

- **31 tests pass** (22 fitness-score tests + 9 import-pipeline tests)
- **DB column mapping**: `running_score` → `cardio_score` column, `gym_score` → `activity_score` column (no migration needed)
- **Deleted old components**: CardioMetrics.tsx, ActivityMetrics.tsx, VitalsMetrics.tsx, RecoveryMetrics.tsx
- **Created new components**: RunningMetrics.tsx, GymMetrics.tsx
- **No deviations from the plan** — all changes match the specified file change summary

## Phases

### Phase 1: Types, Config & Score Weights

**Goal**: Update the foundational types and configuration to support the new 2-category model.

**Changes**:

- `src/types/analytics.ts`:
  - Change `FitnessScore` interface: rename `cardio_score` → `running_score`, `activity_score` → `gym_score`, remove `body_score` and `recovery_score`
  - Change `DashboardData.categories` from `{ cardio, activity, body, recovery }` to `{ running, gym }`

- `src/config/metrics.ts`:
  - Change `SCORE_WEIGHTS` from `{ cardio: 0.40, activity: 0.30, body: 0.15, recovery: 0.15 }` to `{ running: 0.55, gym: 0.45 }`
  - Add `RUNNING_WORKOUT_TYPES = ['Running']` and `GYM_WORKOUT_TYPES = ['Strength Training', 'HIIT']` constants
  - Add running score sub-weights: `{ resting_hr: 0.25, pace: 0.25, running_hr: 0.20, frequency: 0.15, distance: 0.15 }`
  - Add gym score sub-weights: `{ frequency: 0.30, intensity: 0.25, gym_hr: 0.25, duration: 0.20 }`
  - `HEALTH_TYPE_MAP` — no changes needed (still used by the import pipeline; we just won't query body/recovery categories)

- `src/lib/utils/formatters.ts`:
  - Add `formatPace(minutesPerKm: number): string` function — converts decimal min/km to "M:SS min/km" (e.g., 5.533 → "5:32 min/km")

**Verification**:
```bash
npx tsc --noEmit  # Will have errors until later phases update consumers — that's expected
```

### Phase 2: Database Queries for Workout-Based Metrics

**Goal**: Add query functions to fetch workout data grouped by type and aggregated weekly.

**Changes**:

- `src/lib/db/queries.ts`:
  - Add `getWorkoutsByType(types: string[], startDate: string, endDate: string): Workout[]` — fetches workouts matching any of the given types within a date range
  - Add `getWeeklyWorkoutSummary(types: string[], startDate: string, endDate: string)` — returns weekly aggregates: `{ week: string, count: number, avg_duration: number, total_distance: number, avg_hr: number | null, avg_energy: number, total_energy: number }`
  - Uses ISO week grouping: `strftime('%Y-W%W', start_date)` (Monday-based weeks)

**Verification**:
```bash
npx tsc --noEmit  # New functions should compile cleanly
```

### Phase 3: Running & Gym Score Calculation

**Goal**: Replace the old cardio/activity/body/recovery scoring functions with running and gym scoring functions.

**Changes**:

- `src/lib/analytics/fitness-score.ts`:
  - Replace `calculateCardioScore` / `calculateCardioScoreForWindow` with `calculateRunningScore(start, end)`:
    - Resting HR (25%): from `records` table (lower = better, same formula as old RHR score)
    - Pace (25%): avg `duration_minutes / distance_km` from Running workouts (lower = better; score: baseline 8 min/km = 0, 3.5 min/km = 100)
    - Running HR (20%): avg `avg_heart_rate` from Running workouts (lower at same effort = better; same inversion as RHR but wider range)
    - Run Frequency (15%): runs per week (4+ runs/week = 100)
    - Weekly Distance (15%): avg weekly km (40+ km/week = 100)
  - Replace `calculateActivityScore` / `calculateActivityScoreForWindow` with `calculateGymScore(start, end)`:
    - Frequency (30%): gym sessions per week (4+ = 100)
    - Intensity (25%): avg `total_energy_kcal / duration_minutes` (10+ kcal/min = 100)
    - Gym HR (25%): avg `avg_heart_rate` from gym workouts (higher = working harder; 150+ bpm = 100)
    - Duration (20%): avg session duration (60+ min = 100)
  - Remove `calculateBodyScore`, `calculateBodyScoreForWindow`, `calculateRecoveryScore`, `calculateRecoveryScoreForWindow`, `scoreBody`, `scoreRecovery`
  - Update `calculateOverallScore` to take `(runningScore, gymScore)` instead of 4 categories
  - Update `computeFitnessScore`, `computeScoreForWindow`, `computeFitnessScoresForRange` to use new 2-category model
  - Remove all body/recovery batch-query logic in `computeFitnessScoresForRange`; add batch queries for Running and Gym workouts

- `src/lib/db/schema.ts` — **No changes**. The `fitness_scores` table keeps `body_score` and `recovery_score` columns (unused, not dropped). The `saveFitnessScore` call will write `null` to those columns.

- `src/lib/db/queries.ts`:
  - Update `saveFitnessScore` to map `running_score` → `cardio_score` column and `gym_score` → `activity_score` column for backwards compatibility with the existing table schema (avoids migration). Set `body_score = null, recovery_score = null`.

**Verification**:
```bash
npx tsc --noEmit
npm run test
```

### Phase 4: Workout-Based Metrics Module

**Goal**: Add a metrics module that produces `MetricSummary[]` arrays for Running and Gym detail views, sourced from the `workouts` table.

**Changes**:

- `src/lib/analytics/metrics.ts`:
  - Add `getRunningMetrics(dateRange: DateRange): MetricSummary[]` — returns 5 metrics:
    1. **Avg Pace** (min/km): computed from Running workouts where `distance_km > 0`; sparkline = per-workout pace values over time; trend: lower = improving
    2. **Avg Heart Rate (Runs)** (bpm): from Running workouts `avg_heart_rate`; sparkline = per-workout; trend: lower = improving
    3. **Resting Heart Rate** (bpm): from `records` table (existing `getDailyAverageByType`); trend: lower = improving
    4. **Runs per Week** (count): count of Running workouts grouped by ISO week; sparkline = weekly values; trend: higher = improving
    5. **Weekly Distance** (km): sum `distance_km` per week for Running workouts; sparkline = weekly values; trend: higher = improving
  - Add `getGymMetrics(dateRange: DateRange): MetricSummary[]` — returns 4 metrics:
    1. **Workouts per Week** (count): count of Strength Training + HIIT workouts per week; trend: higher = improving
    2. **Avg Duration** (min): avg `duration_minutes` per gym workout; trend: higher = improving
    3. **Avg Intensity** (kcal/min): avg `total_energy_kcal / duration_minutes` per gym workout; trend: higher = improving
    4. **Avg Heart Rate (Gym)** (bpm): avg `avg_heart_rate` from gym workouts; trend: higher = improving
  - Keep existing `getMetricSummary` and `getCategoryMetrics` (still used if needed), but the API route will call the new functions instead
  - Each function uses the new query functions from Phase 2, computes trends using the existing `computeTrend` helper, and returns data in the existing `MetricSummary` format

**Verification**:
```bash
npx tsc --noEmit
```

### Phase 5: API Route

**Goal**: Update the analytics API to return the new 2-category dashboard data.

**Changes**:

- `src/app/api/analytics/route.ts`:
  - Replace `getCategoryMetrics('cardio', range)` / `getCategoryMetrics('activity', range)` / body / recovery calls with `getRunningMetrics(range)` and `getGymMetrics(range)`
  - Build `DashboardData.categories` as `{ running: { name: 'Running', ... }, gym: { name: 'Gym', ... } }`
  - Use `latest.running_score` and `latest.gym_score` (mapped from the FitnessScore object)
  - Remove references to body/recovery categories
  - `score_history` stays the same (overall score over time)

**Verification**:
```bash
npm run build
# Start dev server and test: curl localhost:3000/api/analytics?range=90d
```

### Phase 6: Dashboard UI Components

**Goal**: Update all UI components to display the 2-category Running + Gym dashboard.

**Changes**:

- `src/components/dashboard/CardioMetrics.tsx` → **Rename to** `RunningMetrics.tsx`:
  - Change component name to `RunningMetrics`, title to "Running"
  - Still wraps `CategoryDetail` with `title="Running"`

- `src/components/dashboard/ActivityMetrics.tsx` → **Rename to** `GymMetrics.tsx`:
  - Change component name to `GymMetrics`, title to "Gym"
  - Still wraps `CategoryDetail` with `title="Gym"`

- **Delete** `src/components/dashboard/VitalsMetrics.tsx`
- **Delete** `src/components/dashboard/RecoveryMetrics.tsx`

- `src/components/dashboard/index.ts`:
  - Remove VitalsMetrics and RecoveryMetrics exports
  - Change CardioMetrics → RunningMetrics, ActivityMetrics → GymMetrics

- `src/components/dashboard/Overview.tsx`:
  - Update `CATEGORY_CONFIG` from 4 entries to 2: `{ key: 'running', label: 'Running', Component: RunningMetrics }` and `{ key: 'gym', label: 'Gym', Component: GymMetrics }`
  - Change grid from `lg:grid-cols-4` to `md:grid-cols-2` (2 wider cards)
  - Update `ApiResponse` type alias to match new `DashboardData`

- `src/components/charts/ProgressChart.tsx`:
  - Change `LABELS` map from `{ cardio, activity, body, recovery }` to `{ running: 'Running', gym: 'Gym' }`
  - The chart auto-derives data from `Object.entries(categories)` so it'll show 2 bars

- `src/components/dashboard/CategoryDetail.tsx`:
  - Add pace formatting support: if a metric has `unit === 'min/km'`, use `formatPace` instead of `formatMetricValue`
  - Handle empty state messages from spec: "No runs recorded in this period" / "No gym workouts recorded in this period"

- `src/app/page.tsx`:
  - Update `ApiResponse` type to match the new `DashboardData` (categories with running/gym instead of the 4 old ones)
  - No other changes needed — the `Overview` component handles the rest

**Verification**:
```bash
npm run build
npm run dev  # Visual check: 2 cards, Running detail view with 5 metrics, Gym detail view with 4 metrics
```

## File Change Summary

| File | Action | LOC Est. |
|------|--------|----------|
| `src/types/analytics.ts` | Modify | ~15 |
| `src/config/metrics.ts` | Modify | ~25 |
| `src/lib/utils/formatters.ts` | Add formatPace | ~10 |
| `src/lib/db/queries.ts` | Add 2 functions, update saveFitnessScore | ~45 |
| `src/lib/analytics/fitness-score.ts` | Major rewrite: remove 4-cat, add 2-cat | ~300 |
| `src/lib/analytics/metrics.ts` | Add getRunningMetrics, getGymMetrics | ~120 |
| `src/app/api/analytics/route.ts` | Update to 2-category API | ~30 |
| `src/components/dashboard/RunningMetrics.tsx` | Rename from CardioMetrics | ~5 |
| `src/components/dashboard/GymMetrics.tsx` | Rename from ActivityMetrics | ~5 |
| `src/components/dashboard/VitalsMetrics.tsx` | Delete | -14 |
| `src/components/dashboard/RecoveryMetrics.tsx` | Delete | -14 |
| `src/components/dashboard/index.ts` | Update exports | ~5 |
| `src/components/dashboard/Overview.tsx` | Update to 2-category layout | ~15 |
| `src/components/dashboard/CategoryDetail.tsx` | Pace formatting + empty state | ~10 |
| `src/components/charts/ProgressChart.tsx` | Update labels | ~5 |
| `src/app/page.tsx` | Update type alias | ~5 |
| **Total** | | **~600 LOC** |

## Testing Strategy

1. **Type checking**: `npx tsc --noEmit` after each phase to catch type errors early
2. **Build verification**: `npm run build` after Phases 5-6 to ensure full compilation
3. **Unit tests**: `npm run test` — existing tests should be updated if they reference old category names
4. **Manual QA**: `npm run dev` and visually verify:
   - Overall Fitness Score gauge renders
   - 2 category cards (Running, Gym) appear side by side
   - Clicking Running shows 5 detail metrics with charts
   - Clicking Gym shows 4 detail metrics with charts
   - Category Breakdown shows 2 bars
   - Score Trend chart renders
   - Empty states appear correctly when no workout data exists
   - Pace displays as "M:SS min/km"

## Rollback Plan

All changes are on branch `foundry/FACE-29`. If rollback is needed:
- `git revert` the implementation commit(s) to restore the 4-category dashboard
- The `fitness_scores` table is backwards compatible (body_score/recovery_score columns are preserved, just written as null)
- No database migration needed for rollback

## Notes

- **fitness_scores table mapping**: Since we don't want to add a DB migration, `running_score` maps to the `cardio_score` column and `gym_score` maps to the `activity_score` column. `body_score` and `recovery_score` are written as `null`. The FitnessScore TypeScript type uses `running_score`/`gym_score` naming, with the query layer handling the column name mapping.
- **Edge cases for pace**: Workouts with `distance_km === 0` or `null` must be excluded from pace calculation to avoid division by zero. If all runs lack distance data, the pace metric shows "--" with "Pace unavailable — no GPS distance recorded."
- **ISO week boundaries**: Weekly aggregations use SQLite's `strftime('%Y-W%W', start_date)` which produces Monday-based weeks (ISO standard).
- **Scoring reference points**: Running pace 3.5-8 min/km range, gym intensity 0-10 kcal/min range, HR ranges match existing code patterns. These produce reasonable 0-100 scores for recreational athletes.
- **HIIT classification**: HIIT workouts are classified as Gym per the specification. The `GYM_WORKOUT_TYPES` constant includes both 'Strength Training' and 'HIIT'.
