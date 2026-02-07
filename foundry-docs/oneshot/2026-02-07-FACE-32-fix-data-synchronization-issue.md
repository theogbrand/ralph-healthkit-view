# Oneshot: Fix data synchronization issue

**Issue**: FACE-32
**Date**: 2026-02-07
**Status**: Complete

## What Was Done

Fixed the XML parser to extract workout energy (calories) and distance data from `<WorkoutStatistics>` child elements, not just from `<Workout>` top-level attributes. Modern Apple Health exports store energy and distance as `<WorkoutStatistics>` elements with `sum` attributes (e.g., `type="HKQuantityTypeIdentifierActiveEnergyBurned" sum="383"`), but the parser only extracted heart rate `average`. This caused all workouts to have NULL energy and NULL distance in the database, breaking gym intensity metrics and running distance/pace calculations.

### Root Cause

The XML parser's `WorkoutStatistics` handler only looked for `HKQuantityTypeIdentifierHeartRate` with an `average` attribute. It did not extract:
- `HKQuantityTypeIdentifierActiveEnergyBurned` with `sum` attribute (total calories)
- `HKQuantityTypeIdentifierDistanceWalkingRunning` with `sum` attribute (total distance)

In newer Apple Health exports (iOS 17+), these values are provided as `WorkoutStatistics` child elements rather than (or in addition to) top-level `Workout` attributes.

## Files Changed

- `src/lib/parsers/xml-parser.ts` - Extended WorkoutStatistics handler to also extract energy (`sum`) and distance (`sum`) from ActiveEnergyBurned and DistanceWalkingRunning statistics types
- `__tests__/fixtures/sample-export.xml` - Added WorkoutStatistics energy/distance elements to existing workout, added second workout (Functional Strength Training) with energy only from WorkoutStatistics
- `__tests__/integration/import-pipeline.test.ts` - Updated workout count expectations (1 -> 2), added assertions for energy/distance extraction from WorkoutStatistics

## Verification

- Tests: PASS (31/31)
- TypeScript: PASS
- Lint: PASS (0 errors, 4 pre-existing warnings)

## Notes

- The user will need to re-import their Apple Health data after this fix for the new energy/distance values to be populated
- Existing workouts in the DB still have NULL energy/distance due to `INSERT OR IGNORE` — re-import with fresh data is the simplest path
- The `duration_minutes` stored-in-hours bug (from FACE-31) remains as a known tech debt item
