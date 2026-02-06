import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { ALL_MIGRATIONS } from '@/lib/db/schema';
import { SCORE_WEIGHTS } from '@/config/metrics';

// Mock the DB client to use an in-memory database
let testDb: Database.Database;

vi.mock('@/lib/db/client', () => ({
  getDb: () => testDb,
}));

// Import after mock is set up
import {
  calculateRunningScore,
  calculateGymScore,
  calculateOverallScore,
  detectTrend,
  computeScoreForWindow,
} from '@/lib/analytics/fitness-score';

function seedRecords(
  db: Database.Database,
  type: string,
  values: { date: string; value: number }[],
) {
  const stmt = db.prepare(`
    INSERT INTO records (type, readable_type, value, unit, source_name, device, start_date, end_date, created_date)
    VALUES (?, 'test', ?, 'unit', 'test', null, ?, ?, ?)
  `);
  for (const { date, value } of values) {
    stmt.run(type, value, date, date, date);
  }
}

function seedRunningWorkouts(db: Database.Database, workouts: { date: string; duration: number; distance: number; hr: number }[]) {
  const stmt = db.prepare(`
    INSERT INTO workouts (workout_type, duration_minutes, distance_km, total_energy_kcal, avg_heart_rate, source_name, device, start_date, end_date)
    VALUES ('Running', ?, ?, 300, ?, 'test', null, ?, ?)
  `);
  for (const w of workouts) {
    stmt.run(w.duration, w.distance, w.hr, w.date, w.date);
  }
}

function seedGymWorkouts(db: Database.Database, workouts: { date: string; duration: number; energy: number; hr: number }[]) {
  const stmt = db.prepare(`
    INSERT INTO workouts (workout_type, duration_minutes, distance_km, total_energy_kcal, avg_heart_rate, source_name, device, start_date, end_date)
    VALUES ('Strength Training', ?, null, ?, ?, 'test', null, ?, ?)
  `);
  for (const w of workouts) {
    stmt.run(w.duration, w.energy, w.hr, w.date, w.date);
  }
}

describe('fitness-score', () => {
  beforeEach(() => {
    testDb = new Database(':memory:');
    for (const migration of ALL_MIGRATIONS) {
      testDb.exec(migration);
    }
  });

  afterEach(() => {
    testDb.close();
  });

  describe('calculateRunningScore', () => {
    it('returns null when no data exists', () => {
      expect(calculateRunningScore('2024-10-01', '2025-01-15')).toBeNull();
    });

    it('returns a score when running workouts and RHR exist', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierRestingHeartRate', [
        { date: '2025-01-10', value: 55 },
      ]);
      seedRunningWorkouts(testDb, [
        { date: '2025-01-10', duration: 30, distance: 5, hr: 150 },
      ]);
      const score = calculateRunningScore('2024-10-01', '2025-01-15');
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThan(0);
      expect(score!).toBeLessThanOrEqual(100);
    });

    it('scores lower resting HR better', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierRestingHeartRate', [
        { date: '2025-01-10', value: 55 },
      ]);
      const lowHR = calculateRunningScore('2024-10-01', '2025-01-15')!;

      testDb.exec('DELETE FROM records');
      seedRecords(testDb, 'HKQuantityTypeIdentifierRestingHeartRate', [
        { date: '2025-01-10', value: 85 },
      ]);
      const highHR = calculateRunningScore('2024-10-01', '2025-01-15')!;

      expect(lowHR).toBeGreaterThan(highHR);
    });

    it('scores faster pace better', () => {
      seedRunningWorkouts(testDb, [
        { date: '2025-01-10', duration: 25, distance: 5, hr: 150 }, // 5 min/km
      ]);
      const fastScore = calculateRunningScore('2024-10-01', '2025-01-15')!;

      testDb.exec('DELETE FROM workouts');
      seedRunningWorkouts(testDb, [
        { date: '2025-01-10', duration: 35, distance: 5, hr: 150 }, // 7 min/km
      ]);
      const slowScore = calculateRunningScore('2024-10-01', '2025-01-15')!;

      expect(fastScore).toBeGreaterThan(slowScore);
    });
  });

  describe('calculateGymScore', () => {
    it('returns null when no gym workouts exist', () => {
      expect(calculateGymScore('2024-10-01', '2025-01-15')).toBeNull();
    });

    it('returns a score when gym workouts exist', () => {
      seedGymWorkouts(testDb, [
        { date: '2025-01-10', duration: 60, energy: 400, hr: 130 },
      ]);
      const score = calculateGymScore('2024-10-01', '2025-01-15');
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThan(0);
    });

    it('scores higher intensity better', () => {
      seedGymWorkouts(testDb, [
        { date: '2025-01-10', duration: 60, energy: 600, hr: 140 }, // 10 kcal/min
      ]);
      const highIntensity = calculateGymScore('2024-10-01', '2025-01-15')!;

      testDb.exec('DELETE FROM workouts');
      seedGymWorkouts(testDb, [
        { date: '2025-01-10', duration: 60, energy: 180, hr: 140 }, // 3 kcal/min
      ]);
      const lowIntensity = calculateGymScore('2024-10-01', '2025-01-15')!;

      expect(highIntensity).toBeGreaterThan(lowIntensity);
    });
  });

  describe('calculateOverallScore', () => {
    it('returns null when all inputs are null', () => {
      expect(calculateOverallScore(null, null)).toBeNull();
    });

    it('returns weighted average when both scores present', () => {
      const result = calculateOverallScore(80, 70);
      // Expected: (80*0.55 + 70*0.45) = 44 + 31.5 = 75.5
      expect(result).toBeCloseTo(75.5, 1);
    });

    it('normalizes weights when one score is null', () => {
      // Only running
      const result = calculateOverallScore(80, null);
      // 80 * 0.55 / 0.55 = 80
      expect(result).toBeCloseTo(80, 1);
    });

    it('uses SCORE_WEIGHTS correctly', () => {
      expect(SCORE_WEIGHTS.running + SCORE_WEIGHTS.gym).toBeCloseTo(1.0);
    });
  });

  describe('detectTrend', () => {
    it('returns stable for less than 4 scores', () => {
      expect(detectTrend([70, 72, 71])).toBe('stable');
    });

    it('returns stable for empty array', () => {
      expect(detectTrend([])).toBe('stable');
    });

    it('detects improving trend', () => {
      const scores = [50, 52, 55, 58, 62, 65, 70, 75];
      expect(detectTrend(scores)).toBe('improving');
    });

    it('detects declining trend', () => {
      const scores = [80, 75, 70, 65, 60, 55, 50, 45];
      expect(detectTrend(scores)).toBe('declining');
    });

    it('returns stable for flat scores', () => {
      const scores = [70, 71, 70, 69, 70, 71, 70, 70];
      expect(detectTrend(scores)).toBe('stable');
    });

    it('filters null values', () => {
      const scores: (number | null)[] = [50, null, 55, null, 60, null, 65, 70];
      expect(detectTrend(scores)).toBe('improving');
    });
  });

  describe('computeScoreForWindow', () => {
    it('returns a complete FitnessScore object', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierRestingHeartRate', [
        { date: '2025-01-10', value: 55 },
      ]);
      seedRunningWorkouts(testDb, [
        { date: '2025-01-10', duration: 30, distance: 5, hr: 150 },
      ]);

      const score = computeScoreForWindow('2024-10-01', '2025-01-15');
      expect(score).toHaveProperty('date', '2025-01-15');
      expect(score).toHaveProperty('running_score');
      expect(score).toHaveProperty('gym_score');
      expect(score).toHaveProperty('overall_score');
      expect(score).toHaveProperty('trend_direction');
      expect(score).toHaveProperty('computed_at');
      expect(['improving', 'stable', 'declining']).toContain(score.trend_direction);
    });

    it('returns all null scores when no data', () => {
      const score = computeScoreForWindow('2024-10-01', '2025-01-15');
      expect(score.running_score).toBeNull();
      expect(score.gym_score).toBeNull();
      expect(score.overall_score).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles single running workout', () => {
      seedRunningWorkouts(testDb, [
        { date: '2025-01-15', duration: 30, distance: 5, hr: 150 },
      ]);
      const score = calculateRunningScore('2024-10-01', '2025-01-15');
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThan(0);
    });

    it('handles runs without distance (treadmill)', () => {
      const stmt = testDb.prepare(`
        INSERT INTO workouts (workout_type, duration_minutes, distance_km, total_energy_kcal, avg_heart_rate, source_name, device, start_date, end_date)
        VALUES ('Running', 30, 0, 300, 150, 'test', null, '2025-01-10', '2025-01-10')
      `);
      stmt.run();
      const score = calculateRunningScore('2024-10-01', '2025-01-15');
      // Should still get a score from frequency, distance=0 excluded from pace
      expect(score).not.toBeNull();
    });

    it('ignores data outside date range', () => {
      seedRunningWorkouts(testDb, [
        { date: '2024-01-01', duration: 30, distance: 5, hr: 150 },
      ]);
      const score = calculateRunningScore('2025-01-01', '2025-01-15');
      expect(score).toBeNull();
    });
  });
});
