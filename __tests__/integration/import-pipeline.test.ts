import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';
import { ALL_MIGRATIONS } from '@/lib/db/schema';

// Mock DB client with in-memory database
let testDb: Database.Database;

vi.mock('@/lib/db/client', () => ({
  getDb: () => testDb,
}));

import { parseAppleHealthXML, validateAppleHealthXML } from '@/lib/parsers/xml-parser';
import {
  mapRecordsToDatabase,
  mapWorkoutsToDatabase,
  deduplicateRecords,
  deduplicateWorkouts,
} from '@/lib/parsers/data-mapper';
import { insertRecordsBatch, insertWorkoutsBatch, getSyncStatus } from '@/lib/db/queries';

const FIXTURE_PATH = join(__dirname, '..', 'fixtures', 'sample-export.xml');

describe('import pipeline integration', () => {
  let xmlContent: string;

  beforeEach(() => {
    testDb = new Database(':memory:');
    for (const migration of ALL_MIGRATIONS) {
      testDb.exec(migration);
    }
    xmlContent = readFileSync(FIXTURE_PATH, 'utf-8');
  });

  afterEach(() => {
    testDb.close();
  });

  it('validates sample XML fixture', () => {
    expect(validateAppleHealthXML(xmlContent)).toBe(true);
  });

  it('rejects invalid XML', () => {
    expect(() => validateAppleHealthXML('')).toThrow();
    expect(() => validateAppleHealthXML('<html></html>')).toThrow();
  });

  it('parses sample XML fixture correctly', async () => {
    const result = await parseAppleHealthXML(xmlContent);

    expect(result.records.length).toBeGreaterThan(0);
    expect(result.workouts.length).toBe(1);
    expect(result.stats.totalRecords).toBe(result.records.length);
    expect(result.stats.totalWorkouts).toBe(1);
    expect(result.stats.dateRange.earliest).toBeTruthy();
    expect(result.stats.dateRange.latest).toBeTruthy();
  });

  it('parses records with correct types', async () => {
    const result = await parseAppleHealthXML(xmlContent);
    const types = new Set(result.records.map((r) => r.type));

    expect(types.has('HKQuantityTypeIdentifierStepCount')).toBe(true);
    expect(types.has('HKQuantityTypeIdentifierHeartRate')).toBe(true);
    expect(types.has('HKQuantityTypeIdentifierVO2Max')).toBe(true);
    expect(types.has('HKCategoryTypeIdentifierSleepAnalysis')).toBe(true);
  });

  it('maps and deduplicates records', async () => {
    const result = await parseAppleHealthXML(xmlContent);
    const dbRecords = mapRecordsToDatabase(result.records);
    const unique = deduplicateRecords(dbRecords);

    expect(dbRecords.length).toBe(result.records.length);
    expect(unique.length).toBeLessThanOrEqual(dbRecords.length);

    // Each record should have required fields
    for (const r of unique) {
      expect(r.type).toBeTruthy();
      expect(r.readable_type).toBeTruthy();
      expect(typeof r.value).toBe('number');
      expect(r.start_date).toBeTruthy();
      expect(r.end_date).toBeTruthy();
    }
  });

  it('maps workouts correctly', async () => {
    const result = await parseAppleHealthXML(xmlContent);
    const dbWorkouts = mapWorkoutsToDatabase(result.workouts);
    const unique = deduplicateWorkouts(dbWorkouts);

    expect(unique.length).toBe(1);
    const workout = unique[0];
    expect(workout.workout_type).toBeTruthy();
    expect(workout.duration_minutes).toBeGreaterThan(0);
    expect(workout.start_date).toBeTruthy();
  });

  it('completes full pipeline: parse -> map -> insert -> query', async () => {
    // 1. Parse
    const parseResult = await parseAppleHealthXML(xmlContent);

    // 2. Map
    const dbRecords = mapRecordsToDatabase(parseResult.records);
    const dbWorkouts = mapWorkoutsToDatabase(parseResult.workouts);

    // 3. Deduplicate
    const uniqueRecords = deduplicateRecords(dbRecords);
    const uniqueWorkouts = deduplicateWorkouts(dbWorkouts);

    // 4. Insert
    const recordsInserted = insertRecordsBatch(uniqueRecords);
    const workoutsInserted = insertWorkoutsBatch(uniqueWorkouts);

    expect(recordsInserted).toBeGreaterThan(0);
    expect(workoutsInserted).toBe(1);

    // 5. Query & verify
    const status = getSyncStatus();
    expect(status.total_records).toBe(recordsInserted);
    expect(status.total_workouts).toBe(workoutsInserted);
    expect(status.date_range).not.toBeNull();
  });

  it('handles duplicate imports (re-import is idempotent)', async () => {
    const parseResult = await parseAppleHealthXML(xmlContent);
    const dbRecords = deduplicateRecords(mapRecordsToDatabase(parseResult.records));
    const dbWorkouts = deduplicateWorkouts(mapWorkoutsToDatabase(parseResult.workouts));

    // First import
    const firstRecords = insertRecordsBatch(dbRecords);
    const firstWorkouts = insertWorkoutsBatch(dbWorkouts);

    // Second import of same data
    const secondRecords = insertRecordsBatch(dbRecords);
    const secondWorkouts = insertWorkoutsBatch(dbWorkouts);

    // Second import should add 0 (INSERT OR IGNORE)
    expect(secondRecords).toBe(0);
    expect(secondWorkouts).toBe(0);

    // Total should still be from first import
    const status = getSyncStatus();
    expect(status.total_records).toBe(firstRecords);
    expect(status.total_workouts).toBe(firstWorkouts);
  });

  it('handles empty database sync status', () => {
    const status = getSyncStatus();
    expect(status.total_records).toBe(0);
    expect(status.total_workouts).toBe(0);
    expect(status.last_sync).toBeNull();
    expect(status.date_range).toBeNull();
  });
});
