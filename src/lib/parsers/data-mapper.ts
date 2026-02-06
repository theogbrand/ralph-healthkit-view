/**
 * Data Mapper
 *
 * Maps parsed Apple Health data to database schema and provides
 * readable type names for Apple Health identifiers
 */

import type { ParsedHealthRecord, ParsedWorkout } from './xml-parser';
import { HEALTH_TYPE_MAP } from '@/config/metrics';

/**
 * Normalize Apple Health date strings to a format SQLite can parse.
 *
 * Apple Health exports dates like "2025-10-01 08:00:00 +0800".
 * SQLite's DATE() function cannot handle this format (returns NULL).
 * We strip the trailing timezone offset so dates become "2025-10-01 08:00:00",
 * which SQLite handles correctly.
 */
function normalizeDate(dateStr: string): string {
  // Strip trailing timezone offset like " +0800" or " -0530"
  return dateStr.replace(/\s+[+-]\d{4}$/, '');
}

export interface DatabaseRecord {
  type: string;
  readable_type: string;
  value: number;
  unit: string;
  source_name: string;
  device: string | null;
  start_date: string;
  end_date: string;
  created_date: string | null;
}

export interface DatabaseWorkout {
  workout_type: string;
  duration_minutes: number;
  distance_km: number | null;
  total_energy_kcal: number | null;
  avg_heart_rate: number | null;
  source_name: string;
  device: string | null;
  start_date: string;
  end_date: string;
}

/**
 * Get human-readable name for Apple Health type identifier
 *
 * @param type - Apple Health type identifier (e.g., 'HKQuantityTypeIdentifierStepCount')
 * @returns Human-readable name (e.g., 'Steps')
 */
export function getReadableTypeName(type: string): string {
  // Find in metrics config
  const metric = HEALTH_TYPE_MAP[type];
  if (metric) {
    return metric.readable;
  }

  // Fallback: Convert identifier to readable format
  // HKQuantityTypeIdentifierStepCount -> Step Count
  // HKCategoryTypeIdentifierSleepAnalysis -> Sleep Analysis
  let readable = type
    .replace('HKQuantityTypeIdentifier', '')
    .replace('HKCategoryTypeIdentifier', '')
    .replace('HKCharacteristicTypeIdentifier', '');

  // Split camelCase into words
  readable = readable.replace(/([A-Z])/g, ' $1').trim();

  return readable;
}

/**
 * Get readable workout type name
 *
 * @param workoutType - Apple Health workout type (e.g., 'HKWorkoutActivityTypeRunning')
 * @returns Human-readable name (e.g., 'Running')
 */
export function getReadableWorkoutType(workoutType: string): string {
  // Remove prefix
  let readable = workoutType.replace('HKWorkoutActivityType', '');

  // Split camelCase into words
  readable = readable.replace(/([A-Z])/g, ' $1').trim();

  return readable;
}

/**
 * Map health record to database schema
 *
 * @param record - Parsed health record
 * @returns Database record ready for insertion
 */
export function mapRecordToDatabase(record: ParsedHealthRecord): DatabaseRecord {
  return {
    type: record.type,
    readable_type: getReadableTypeName(record.type),
    value: record.value,
    unit: record.unit,
    source_name: record.sourceName || 'Unknown',
    device: record.device,
    start_date: normalizeDate(record.startDate),
    end_date: normalizeDate(record.endDate),
    created_date: record.creationDate ? normalizeDate(record.creationDate) : null,
  };
}

/**
 * Map workout to database schema
 *
 * @param workout - Parsed workout
 * @returns Database workout ready for insertion
 */
export function mapWorkoutToDatabase(workout: ParsedWorkout): DatabaseWorkout {
  return {
    workout_type: getReadableWorkoutType(workout.workoutType),
    duration_minutes: workout.durationMinutes,
    distance_km: workout.distanceKm,
    total_energy_kcal: workout.totalEnergyKcal,
    avg_heart_rate: workout.avgHeartRate,
    source_name: workout.sourceName || 'Unknown',
    device: workout.device,
    start_date: normalizeDate(workout.startDate),
    end_date: normalizeDate(workout.endDate),
  };
}

/**
 * Batch map health records to database schema
 *
 * @param records - Array of parsed health records
 * @returns Array of database records ready for insertion
 */
export function mapRecordsToDatabase(records: ParsedHealthRecord[]): DatabaseRecord[] {
  return records.map(mapRecordToDatabase);
}

/**
 * Batch map workouts to database schema
 *
 * @param workouts - Array of parsed workouts
 * @returns Array of database workouts ready for insertion
 */
export function mapWorkoutsToDatabase(workouts: ParsedWorkout[]): DatabaseWorkout[] {
  return workouts.map(mapWorkoutToDatabase);
}

/**
 * Filter records by type category
 *
 * @param records - Array of health records
 * @param category - Category to filter by ('cardio', 'activity', 'body', 'recovery')
 * @returns Filtered records matching the category
 */
export function filterRecordsByCategory(
  records: ParsedHealthRecord[],
  category: 'cardio' | 'activity' | 'body' | 'recovery'
): ParsedHealthRecord[] {
  const allowedTypes = Object.entries(HEALTH_TYPE_MAP)
    .filter(([_, config]) => config.category === category)
    .map(([type, _]) => type);

  return records.filter((record) => allowedTypes.includes(record.type));
}

/**
 * Deduplicate records based on unique constraints
 * Keeps the most recently created version of duplicate records
 *
 * @param records - Array of database records
 * @returns Deduplicated array
 */
export function deduplicateRecords(records: DatabaseRecord[]): DatabaseRecord[] {
  const uniqueMap = new Map<string, DatabaseRecord>();

  for (const record of records) {
    // Create unique key based on database UNIQUE constraint
    const key = `${record.type}|${record.start_date}|${record.end_date}|${record.source_name}`;

    const existing = uniqueMap.get(key);

    // Keep the most recently created record
    if (!existing) {
      uniqueMap.set(key, record);
    } else if (record.created_date && existing.created_date) {
      if (record.created_date > existing.created_date) {
        uniqueMap.set(key, record);
      }
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Deduplicate workouts based on start/end date and type
 * Keeps the most recent workout if duplicates exist
 *
 * @param workouts - Array of database workouts
 * @returns Deduplicated array
 */
export function deduplicateWorkouts(workouts: DatabaseWorkout[]): DatabaseWorkout[] {
  const uniqueMap = new Map<string, DatabaseWorkout>();

  for (const workout of workouts) {
    // Create unique key based on type and dates
    const key = `${workout.workout_type}|${workout.start_date}|${workout.end_date}`;

    // Keep first occurrence (workouts don't have created_date)
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, workout);
    }
  }

  return Array.from(uniqueMap.values());
}
