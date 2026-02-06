# Oneshot: Update how Running and Gym fine grained metrics are computed

**Issue**: FACE-31
**Date**: 2026-02-07
**Status**: Complete

## What Was Done

Fixed two problems with workout category metrics:

1. **Gym category now shows workouts**: Updated `GYM_WORKOUT_TYPES` to match actual workout type names stored in the database (`Functional Strength Training`, `Traditional Strength Training`, `High Intensity Interval Training`, `Cross Training`, `Core Training`) instead of the incorrect mapped names (`Strength Training`, `HIIT`).

2. **Running Avg Pace and Weekly Distance now compute correctly**: Since `distance_km` is NULL for all workouts in the database (Apple Health doesn't put distance on the Workout XML element), added queries that correlate running workout time windows with `HKQuantityTypeIdentifierDistanceWalkingRunning` records from the records table. Also fixed the `duration_minutes` interpretation — the stored values are actually in hours due to a parser bug, so a ×60 correction factor is applied when computing pace (min/km) and gym duration metrics.

## Files Changed

- `src/config/metrics.ts` - Updated `GYM_WORKOUT_TYPES` to use actual DB workout type names
- `src/lib/db/queries.ts` - Added `getRunningWorkoutsWithDistance()` and `getWeeklyRunningDistance()` queries that correlate workout windows with distance records
- `src/lib/analytics/metrics.ts` - Updated `getRunningMetrics()` to use correlated distance data and duration correction; updated `getGymMetrics()` with duration correction
- `src/lib/analytics/fitness-score.ts` - Updated `calculateRunningScore()`, `calculateGymScore()`, and batched `computeFitnessScoresForRange()` with correlated distance queries and duration correction
- `__tests__/lib/analytics/fitness-score.test.ts` - Updated test seeds to use correct gym workout type names, distance records, and duration-in-hours values

## Verification

- Tests: PASS (31/31)
- TypeScript: PASS
- Lint: PASS (0 errors, 4 pre-existing warnings)
- Build: PASS

## Notes

- The `duration_minutes` column in the workouts table is actually stored in hours due to a bug in `xml-parser.ts` line 187 (`duration / 60` where duration is already in minutes from Apple Health). This is corrected at the computation layer with a `DURATION_CORRECTION = 60` multiplier rather than fixing the parser/re-importing data.
- Running distance is derived by summing `HKQuantityTypeIdentifierDistanceWalkingRunning` records that fall within each workout's start/end time window. This is slightly more expensive per query but avoids requiring a data re-import.
- A future improvement would be to fix the XML parser's duration handling and extract distance/energy from `WorkoutStatistics` elements, then re-import data. This would make the distance correlation unnecessary and fix the duration at the source.
