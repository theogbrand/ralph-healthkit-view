# Oneshot: Fix Error: Nothing displayed after data is uploaded (Reopened)

**Issue**: FACE-26
**Date**: 2026-02-06
**Status**: Complete

## What Was Done

Fixed the dashboard showing "No data yet" after uploading an Apple Health export. The previous fix (score persistence) was correct but insufficient — the actual root cause is a **date format incompatibility between Apple Health exports and SQLite**.

### Root Cause

Apple Health exports dates in the format `2025-10-01 08:00:00 +0800` (with a space-separated timezone offset). SQLite's `DATE()` function cannot parse this format and returns `NULL`. This breaks all `GROUP BY DATE(start_date)` queries throughout the analytics pipeline:

- `getDailyAverageByType()` and `getDailySumByType()` in `queries.ts` — metric aggregation fails
- All batch queries in `computeFitnessScoresForRange()` in `fitness-score.ts` — score computation produces NULL
- Dashboard receives `overall_score: null` and shows "No data yet"

### Fix

Added a `normalizeDate()` function in the data mapper that strips the trailing timezone offset from Apple Health date strings before database insertion. This converts dates from `2025-10-01 08:00:00 +0800` to `2025-10-01 08:00:00`, which SQLite handles correctly.

The normalization is applied to `start_date`, `end_date`, and `created_date` for both health records and workouts during the mapping stage.

## Files Changed

- `src/lib/parsers/data-mapper.ts` - Added `normalizeDate()` function; applied to all date fields in `mapRecordToDatabase()` and `mapWorkoutToDatabase()`

## Verification

- TypeScript: PASS
- Lint: PASS (pre-existing error in xml-parser.ts unrelated)
- Build: PASS

## Notes

- Users who previously uploaded data will need to re-upload, as existing records have malformed dates that SQLite's `DATE()` cannot parse
- The previous fix (score persistence in `analytics/route.ts`) remains correct and necessary
- Local time is preserved (timezone offset is stripped, not converted to UTC) — this is correct for daily aggregation since the user's local day boundaries should be used
- The regex `\s+[+-]\d{4}$` safely handles the Apple Health format and is a no-op for dates already in standard format
