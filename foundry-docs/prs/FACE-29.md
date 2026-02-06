# PR: FACE-29 - Refactor the analytics view to provide more fine-grained details

**Branch**: `foundry/FACE-29`
**Linear Issue**: FACE-29
**Date**: 2026-02-06

## Summary

Replaces the 4-category analytics dashboard (Cardio, Activity, Body, Recovery) with a focused 2-category dashboard (Running, Gym) that surfaces workout-specific metrics. Users can now see exactly why their fitness score is changing — is it slower pace, fewer runs, or lower gym intensity?

## Problem

The original dashboard showed abstract scores for Cardio, Activity, Body, and Recovery that didn't map to actionable insights. A user couldn't tell if their cardio score dropped because of slower running, less mileage, or higher resting heart rate. Body and Recovery categories weren't relevant to the user's two main activities (running and gym).

## Solution

Rebuilt the analytics pipeline around workout-based metrics from the `workouts` table:

- **Running category (55% of overall score)**: Avg Pace (min/km), Avg HR during runs, Resting HR, Runs/Week, Weekly Distance
- **Gym category (45% of overall score)**: Workouts/Week, Avg Duration, Avg Intensity (kcal/min), Avg HR during gym
- Click-to-expand detail views with per-metric trend charts
- HIIT workouts classified under Gym
- Pace formatted as M:SS min/km
- No database migration — running_score maps to existing cardio_score column, gym_score maps to activity_score column

## Changes

### Core Analytics
- `src/lib/analytics/fitness-score.ts` — Replaced 4-category scoring (calculateCardioScore, calculateActivityScore, calculateBodyScore, calculateRecoveryScore) with 2-category scoring (calculateRunningScore, calculateGymScore). Batch query optimization for range computation.
- `src/lib/analytics/metrics.ts` — Added `getRunningMetrics()` (5 metrics) and `getGymMetrics()` (4 metrics) using workout-based queries
- `src/lib/db/queries.ts` — Added `getWorkoutsByType()` and `getWeeklyWorkoutSummary()`. Updated `saveFitnessScore()` column mapping.

### Types & Config
- `src/types/analytics.ts` — FitnessScore uses running_score/gym_score. DashboardData.categories has running/gym.
- `src/config/metrics.ts` — New SCORE_WEIGHTS (running 0.55, gym 0.45), workout type constants, sub-weight configs
- `src/lib/utils/formatters.ts` — Added `formatPace()` for M:SS min/km display

### UI Components
- Created `RunningMetrics.tsx` and `GymMetrics.tsx`
- Deleted `CardioMetrics.tsx`, `ActivityMetrics.tsx`, `VitalsMetrics.tsx`, `RecoveryMetrics.tsx`
- Updated `Overview.tsx` — 2-card layout with click-to-expand
- Updated `CategoryDetail.tsx` — Empty state messages, pace formatting support
- Updated `ProgressChart.tsx` — Running/Gym labels only

### API
- `src/app/api/analytics/route.ts` — Returns 2-category response with workout-based metrics

### Files Changed
- `src/types/analytics.ts` — Updated FitnessScore and DashboardData types
- `src/config/metrics.ts` — Score weights, workout type constants, sub-weights
- `src/lib/utils/formatters.ts` — Added formatPace function
- `src/lib/db/queries.ts` — Added workout queries, updated score save mapping
- `src/lib/analytics/fitness-score.ts` — Complete rewrite for 2-category model
- `src/lib/analytics/metrics.ts` — Added getRunningMetrics, getGymMetrics
- `src/app/api/analytics/route.ts` — Updated to 2-category API response
- `src/components/dashboard/RunningMetrics.tsx` — New component
- `src/components/dashboard/GymMetrics.tsx` — New component
- `src/components/dashboard/index.ts` — Updated exports
- `src/components/dashboard/Overview.tsx` — 2-card layout
- `src/components/dashboard/CategoryDetail.tsx` — Empty states, pace formatting
- `src/components/charts/ProgressChart.tsx` — Updated labels
- `__tests__/lib/analytics/fitness-score.test.ts` — Updated for new scoring model

## Testing

### Automated
- [x] Tests pass (`npm test`) — 31/31
- [x] TypeScript compiles (`npx tsc --noEmit`) — 0 errors
- [x] Build succeeds (`npm run build`) — clean
- [x] Lint passes (`npm run lint`) — 0 errors, 4 pre-existing warnings

### Manual Verification
- Verify 2 category cards render (Running, Gym)
- Verify click-to-expand shows correct metrics per category
- Verify pace displays as M:SS min/km format
- Verify Category Breakdown shows 2 bars
- Verify empty states render when no workout data exists

## Breaking Changes

- API response structure changed: `categories` now has `running` and `gym` instead of `cardio`, `activity`, `body`, `recovery`
- `FitnessScore` type uses `running_score`/`gym_score` instead of `cardio_score`/`activity_score`/`body_score`/`recovery_score`

## Migration Notes

- No database migration needed — scores are mapped to existing columns (running_score → cardio_score, gym_score → activity_score)
- Old body_score and recovery_score columns preserved (written as null)

## Screenshots

N/A — requires HealthKit data import to visualize

---
🤖 Created by [Foundry](https://github.com/leixusam/foundry) with [Claude Code](https://claude.ai/claude-code)
