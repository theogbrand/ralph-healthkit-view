# Oneshot: Fix Error: Nothing displayed after data is uploaded

**Issue**: FACE-26
**Date**: 2026-02-06
**Status**: Complete

## What Was Done

Fixed the dashboard showing "No data yet" after successful data upload. The root cause was that `computeFitnessScoresForRange()` computed fitness scores in memory but never persisted them to the `fitness_scores` database table. When `getLatestFitnessScore()` queried the empty table, it returned `undefined`, causing `overall_score` to be `null` and triggering the empty state.

The fix adds a loop to save each computed score via the existing (but unused) `saveFitnessScore()` function before querying for the latest score.

## Files Changed

- `src/app/api/analytics/route.ts` - Import `saveFitnessScore` and persist computed scores to DB before querying latest

## Verification

- TypeScript: PASS
- Lint: PASS (pre-existing error in xml-parser.ts unrelated)
- Build: PASS

## Notes

- `saveFitnessScore` uses `INSERT OR REPLACE`, so re-computing scores for the same dates is idempotent
- The `fitness_scores` table schema was already correct; only the write path was missing
