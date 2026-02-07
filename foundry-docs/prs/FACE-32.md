# PR: FACE-32 - Fix data synchronization issue

**Branch**: `foundry/FACE-32`
**Linear Issue**: FACE-32
**Date**: 2026-02-07

## Summary

Fixes workout data synchronization by extracting energy (calories) and distance from `<WorkoutStatistics>` child elements in Apple Health XML exports. Previously, only heart rate was extracted from WorkoutStatistics, causing all workouts to have NULL energy and distance values.

## Problem

When importing Apple Health data, workout energy (kcal) and distance (km) were always NULL in the database. This caused:
- Gym intensity metrics (kcal/min) to show no data
- Running distance/pace metrics to rely solely on correlated distance records

The root cause: modern Apple Health exports (iOS 17+) store energy and distance as `<WorkoutStatistics>` child elements with `sum` attributes, but the XML parser only extracted heart rate `average` from these elements.

## Solution

Extended the `WorkoutStatistics` SAX handler to also extract:
- `HKQuantityTypeIdentifierActiveEnergyBurned` → `totalEnergyKcal` (via `sum` attribute)
- `HKQuantityTypeIdentifierDistanceWalkingRunning` → `distanceKm` (via `sum` attribute)

These values supplement or override any top-level `<Workout>` attributes, which may be absent in newer exports.

## Changes

### Files Changed
- `src/lib/parsers/xml-parser.ts` - Extended WorkoutStatistics handler to extract energy and distance `sum` values
- `__tests__/fixtures/sample-export.xml` - Added WorkoutStatistics elements and a second test workout
- `__tests__/integration/import-pipeline.test.ts` - Updated assertions for new fixture data

## Testing

### Automated
- [x] Tests pass (`npm test`) - 31/31
- [x] TypeScript compiles (`npx tsc --noEmit`)
- [x] Lint passes (`npm run lint`) - 0 errors

### Manual Verification
- After deploying, re-import Apple Health data to populate energy/distance values
- Verify gym intensity and running pace metrics show data on the dashboard

## Breaking Changes

None

## Migration Notes

Users need to re-import their Apple Health data for the fix to take effect, since existing workouts with NULL energy/distance won't be updated (due to `INSERT OR IGNORE` deduplication).

---
Created by [Foundry](https://github.com/leixusam/foundry) with [Claude Code](https://claude.ai/claude-code)
