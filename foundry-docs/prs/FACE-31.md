# PR: FACE-31 - Update how Running and Gym fine grained metrics are computed

**Branch**: `foundry/FACE-31`
**Linear Issue**: FACE-31
**Date**: 2026-02-07

## Summary

Fixes two bugs: the Gym category showing no workouts (wrong workout type names in config), and Running's Avg Pace and Weekly Distance being empty (distance data not available in workouts table, duration stored in wrong units).

## Problem

1. The Gym category showed "--" with no data because `GYM_WORKOUT_TYPES` was set to `['Strength Training', 'HIIT']` but the database stores workout types using their full camelCase-split names like `'Functional Strength Training'` and `'High Intensity Interval Training'`.

2. Running's Avg Pace and Weekly Distance were empty because all workouts have `distance_km = NULL` (Apple Health doesn't include distance as a Workout element attribute), and `duration_minutes` was actually stored in hours due to a parser bug.

## Solution

1. Updated `GYM_WORKOUT_TYPES` to match actual database workout type names, including `Cross Training` and `Core Training`.

2. Added SQL queries that correlate running workout time windows with `HKQuantityTypeIdentifierDistanceWalkingRunning` records from the records table to derive per-workout distance.

3. Applied a `DURATION_CORRECTION = 60` multiplier wherever `duration_minutes` is used for computation (pace, intensity, duration display) to convert from the incorrectly-stored hours to actual minutes.

## Changes

### Files Changed
- `src/config/metrics.ts` - Fix `GYM_WORKOUT_TYPES` array values
- `src/lib/db/queries.ts` - Add `getRunningWorkoutsWithDistance()` and `getWeeklyRunningDistance()` queries
- `src/lib/analytics/metrics.ts` - Use correlated distance + duration correction in `getRunningMetrics()` and `getGymMetrics()`
- `src/lib/analytics/fitness-score.ts` - Use correlated distance + duration correction in score calculations (single, window, and batched)
- `__tests__/lib/analytics/fitness-score.test.ts` - Update test fixtures for new workout type names, distance source, and duration units

## Testing

### Automated
- [x] Tests pass (`npm test`) - 31/31
- [x] TypeScript compiles (`npx tsc --noEmit`)
- [x] Lint passes (`npm run lint`) - 0 errors
- [x] Build passes (`npm run build`)

### Manual Verification
- Verified via SQL that the correlated distance query returns reasonable values (e.g., 8 km for a 55-min run)
- Verified Gym workout types match actual DB data (507 Functional Strength Training, 129 Cross Training, etc.)

## Breaking Changes

None - the changes are computation-layer fixes that don't affect APIs or data structures.

## Migration Notes

None - no data re-import required. Distance is derived at query time from existing records table data.

## Screenshots

N/A - backend computation changes only.

---
Created by [Foundry](https://github.com/leixusam/foundry) with [Claude Code](https://claude.ai/claude-code)
