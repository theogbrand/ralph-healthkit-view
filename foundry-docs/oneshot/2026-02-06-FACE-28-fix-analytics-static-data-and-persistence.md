# Oneshot: Fix analytics showing static data and data loss on restart

**Issue**: FACE-28
**Date**: 2026-02-06
**Status**: Complete

## What Was Done

Fixed two bugs in the analytics dashboard:

1. **Static scores across date ranges**: Category scores (Cardio, Activity, Body, Recovery) and the overall fitness score showed identical values regardless of which time period (30d/60d/90d/365d) was selected. Root cause: the API used `getLatestFitnessScore()` which always returned the most recent score from the database, ignoring the selected range. Each score also used a hardcoded 90-day lookback window. Fix: Added `computeScoreForWindow(start, end)` that computes scores using exactly the selected date range, so 30-day scores use 30 days of data and 365-day scores use 365 days.

2. **Data loss after server restart**: The dashboard showed "No data yet" after restarting the dev server despite data existing in SQLite. Root cause: `better-sqlite3` is a native Node.js module that Next.js's bundler can't handle properly without explicit configuration. Fix: Added `serverExternalPackages: ['better-sqlite3']` to `next.config.ts`.

## Files Changed

- `next.config.ts` - Added `serverExternalPackages: ['better-sqlite3']` for native module compatibility
- `src/app/api/analytics/route.ts` - Use `computeScoreForWindow(start, end)` for range-specific scores instead of `getLatestFitnessScore()`
- `src/lib/analytics/fitness-score.ts` - Added `computeScoreForWindow()` and supporting functions that compute scores for an arbitrary date window

## Verification

- TypeScript: PASS
- Lint: PASS (0 errors, 4 pre-existing warnings)

## Notes

- The `computeFitnessScoresForRange` function (used for the trend chart) still uses 90-day rolling windows per day, which is by design per the PRD. The new `computeScoreForWindow` is only used for the summary scores on the metric cards.
- The `getLatestFitnessScore` function in queries.ts is no longer imported but kept in case other code needs it.
