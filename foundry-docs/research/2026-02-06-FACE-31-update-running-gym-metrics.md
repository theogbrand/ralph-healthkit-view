# Research: Update how Running and Gym fine grained metrics are computed

**Issue**: FACE-31
**Date**: 2026-02-06
**Status**: Complete

## Summary

The dashboard shows "Running" and "Gym" as workout category cards, but Gym shows 0 workouts and Running's Avg Pace and Weekly Distance metrics are empty. Two root causes: (1) the workout type mapper doesn't use `WORKOUT_TYPE_MAP`, so "Functional Strength Training" is stored as-is instead of mapping to a "Gym" grouping, and (2) running distance data is not extracted from Apple Health XML `WorkoutStatistics` elements, leaving `distance_km` NULL for all workouts.

## Requirements Analysis

### Problem 1: Gym category shows no workouts
- The "Gym" category card shows "--" with 0 workouts
- User tags gym workouts mainly as "Functional Strength Training" in Apple Health
- Database has 507 "Functional Strength Training" + 49 "Traditional Strength Training" + 129 "Cross Training" + 54 "HIIT" workouts that could logically belong to "Gym"

### Problem 2: Running metrics (Avg Pace and Weekly Distance) are empty
- "Avg Pace" and "Weekly Distance" show "--" for Running
- 163 running workouts exist in the database but ALL have `distance_km = NULL`
- Duration is stored in hours (not minutes) due to a division bug in the XML parser, but this is a separate concern

## Codebase Analysis

### Relevant Files
- `src/lib/parsers/data-mapper.ts:81-89` - `getReadableWorkoutType()` strips prefix and splits camelCase but does NOT use `WORKOUT_TYPE_MAP`, resulting in "Functional Strength Training" instead of "Strength Training"
- `src/lib/parsers/xml-parser.ts:185-208` - Workout XML parsing; `totalDistance` read from attrs (line 188) but Apple Health stores distance in `WorkoutStatistics` child elements. Only heart rate is extracted from `WorkoutStatistics` (lines 199-207)
- `src/config/metrics.ts:31-53` - `WORKOUT_TYPE_MAP` maps HK identifiers to readable names but is unused by the workout mapper
- `src/lib/analytics/fitness-score.ts` - Scoring algorithm; no workout-specific category scores (Running/Gym) exist
- `src/lib/analytics/metrics.ts` - Only produces metrics for health record categories (cardio/activity/body/recovery), not workout categories
- `src/app/api/analytics/route.ts` - API returns 4 category scores; no Running/Gym workout scores
- `src/components/dashboard/Overview.tsx` - Dashboard renders 4 category cards (Cardio, Activity, Body, Recovery); no Running/Gym cards
- `src/types/analytics.ts` - `DashboardData.categories` only has cardio/activity/body/recovery
- `src/lib/db/schema.ts` - Workouts table schema (workout_type, duration_minutes, distance_km, etc.)

### Database State

**Workout types in database (total: 1,055 workouts):**

| Workout Type | Count | Has Distance | Has Energy | Has Heart Rate |
|---|---|---|---|---|
| Functional Strength Training | 507 | 0 | 0 | via separate query |
| Running | 163 | 0 | 0 | 577 total across all types |
| Cross Training | 129 | 0 | 0 | |
| High Intensity Interval Training | 54 | 0 | 0 | |
| Walking | 52 | 0 | 0 | |
| Traditional Strength Training | 49 | 0 | 0 | |
| Yoga | 36 | 0 | 0 | |
| Swimming | 21 | 0 | 0 | |
| Cycling | 17 | 0 | 0 | |
| Basketball | 14 | 0 | 0 | |
| Jump Rope | 10 | 0 | 0 | |
| Pickleball | 2 | 0 | 0 | |
| Cooldown | 1 | 0 | 0 | |

- `distance_km` is NULL for ALL 1,055 workouts
- `total_energy_kcal` is NULL for ALL workouts
- 577 workouts have `avg_heart_rate` data (extracted from WorkoutStatistics)
- `duration_minutes` is actually stored in **hours** (e.g., 0.91 = ~55 min) due to parser dividing seconds by 60 instead of storing minutes

**Distance data exists in records table:**
- 263,229 records of type `HKQuantityTypeIdentifierDistanceWalkingRunning` (unit: km)
- These are granular increments (~0.09 km avg per record), not per-workout totals

### Existing Patterns
- Category scoring follows a weighted sub-score pattern in `fitness-score.ts`
- Metrics are computed in `metrics.ts` using `getCategoryMetrics()` which maps health type categories
- Dashboard uses `CategoryDetail` component for expandable metric views

### Dependencies
- `better-sqlite3` for all database queries
- `sax` library for XML parsing
- Recharts for visualization
- shadcn/ui for UI components

## Implementation Considerations

### Approach

**Fix 1: Gym category mapping**

The "Gym" category needs to be a logical grouping of workout types. Suggested mapping:
- **Gym** = "Functional Strength Training" + "Traditional Strength Training" + "Cross Training" + "Core Training" + "HIIT"

Two sub-tasks:
1. Fix `getReadableWorkoutType()` in `data-mapper.ts` to use `WORKOUT_TYPE_MAP` (so future imports store correct names)
2. Define a `WORKOUT_CATEGORY_MAP` that groups individual workout types into categories like "Gym" and "Running"
3. Add a gym workout score and count to the dashboard

**Fix 2: Running distance extraction**

Two options:
- **Option A (Recommended)**: Enhance `WorkoutStatistics` handler in `xml-parser.ts` to also extract distance (`HKQuantityTypeIdentifierDistanceWalkingRunning`) and energy (`HKQuantityTypeIdentifierActiveEnergyBurned`) from workout child elements. Requires re-import of data.
- **Option B**: Correlate running workout time windows with `records` table distance data. Query: sum distance records where `start_date` falls within the workout's start/end time. No re-import needed but more complex and possibly inaccurate.

**Fix 3: Compute Running metrics**

Once distance data is available:
- **Avg Pace** = average of (duration / distance) per run across the time range, displayed as min/km
- **Weekly Distance** = total distance of running workouts per week, averaged over the time range

**Fix 4: Duration bug**

The parser stores `duration / 60` (line 187 of xml-parser.ts) where `attrs.duration` appears to be in seconds, so dividing by 60 gives minutes, but the column is named `duration_minutes` and the actual stored value is in hours (~0.91 for a 55-min workout). This suggests `attrs.duration` might actually be in minutes (from Apple Health) and dividing by 60 gives hours. Needs verification against Apple Health XML spec. This is adjacent but should be fixed.

### Risks
- **Re-import required**: Fixing the XML parser to extract distance means existing data lacks distance. Users need to re-import their Apple Health data for distance values to populate.
- **Duration unit confusion**: Need to verify whether Apple Health's `duration` attribute is in seconds or minutes to fix the `durationMinutes` calculation.
- **Workout type name inconsistency**: Existing DB has "Functional Strength Training" (from camelCase split). Fixing the mapper would cause new imports to store "Strength Training" (from WORKOUT_TYPE_MAP). Need migration or flexible matching.

### Testing Strategy
- Query database to verify gym workouts are correctly categorized after re-import
- Verify running workouts have non-null distance_km after parser fix and re-import
- Verify Avg Pace computation: manual calculation on a few workouts vs. displayed value
- Verify Weekly Distance: manual sum of distances per week vs. displayed value
- Test with different date ranges (30d, 60d, 90d, 365d)

## Specification Assessment

This feature involves:
- New workout-specific category cards (Running, Gym) on the dashboard — UI additions
- New metrics (Avg Pace, Weekly Distance) — new data flow
- Changes to how data is parsed and categorized — backend changes

The UX impact is moderate: adding 2 new score cards and a "Running Metrics" detail section to an existing dashboard pattern. The patterns already exist (category cards, metric detail views) so this follows established UX. However, the grouping of workout types into "Gym" involves a UX decision about which workout types belong there.

**Needs Specification**: No — the changes follow existing dashboard patterns closely. The main UX decisions (which types = Gym, what metrics for Running) are clearly defined in the ticket.

## Questions for Human Review

1. **Gym grouping**: Should "Gym" include all of these: Functional Strength Training, Traditional Strength Training, Cross Training, Core Training, HIIT? Or a subset?
2. **Re-import requirement**: Fixing the parser to extract workout distance means existing data lacks it. Is a re-import acceptable, or should we use Option B (correlate from records table)?
3. **Duration bug**: `duration_minutes` is actually in hours. Should this be fixed as part of this ticket? It affects pace calculation.
4. **Workout type naming**: Fix `getReadableWorkoutType()` to use `WORKOUT_TYPE_MAP`? This changes stored values for new imports. Need migration for existing data?

## Next Steps

Ready for planning phase. Key implementation decisions need to be made around:
- Gym workout type grouping
- Distance data source (re-import vs. records table correlation)
- Whether to fix the duration bug and data mapper as part of this ticket
