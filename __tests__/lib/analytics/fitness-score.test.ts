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
  calculateCardioScore,
  calculateActivityScore,
  calculateBodyScore,
  calculateRecoveryScore,
  calculateOverallScore,
  detectTrend,
  computeFitnessScore,
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

function seedWorkouts(db: Database.Database, dates: string[]) {
  const stmt = db.prepare(`
    INSERT INTO workouts (workout_type, duration_minutes, distance_km, total_energy_kcal, avg_heart_rate, source_name, device, start_date, end_date)
    VALUES ('HKWorkoutActivityTypeRunning', 30, 5, 300, 140, 'test', null, ?, ?)
  `);
  for (const date of dates) {
    stmt.run(date, date);
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

  describe('calculateCardioScore', () => {
    it('returns null when no data exists', () => {
      expect(calculateCardioScore('2025-01-15')).toBeNull();
    });

    it('returns a score when VO2 Max data exists', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierVO2Max', [
        { date: '2025-01-10', value: 42.5 },
      ]);
      const score = calculateCardioScore('2025-01-15');
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThan(0);
      expect(score!).toBeLessThanOrEqual(100);
    });

    it('scores higher VO2 Max better', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierVO2Max', [
        { date: '2025-01-10', value: 50 },
      ]);
      const highScore = calculateCardioScore('2025-01-15')!;

      // Reset and seed low VO2
      testDb.exec('DELETE FROM records');
      seedRecords(testDb, 'HKQuantityTypeIdentifierVO2Max', [
        { date: '2025-01-10', value: 30 },
      ]);
      const lowScore = calculateCardioScore('2025-01-15')!;

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('scores lower resting HR better', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierRestingHeartRate', [
        { date: '2025-01-10', value: 55 },
      ]);
      const lowHR = calculateCardioScore('2025-01-15')!;

      testDb.exec('DELETE FROM records');
      seedRecords(testDb, 'HKQuantityTypeIdentifierRestingHeartRate', [
        { date: '2025-01-10', value: 85 },
      ]);
      const highHR = calculateCardioScore('2025-01-15')!;

      expect(lowHR).toBeGreaterThan(highHR);
    });
  });

  describe('calculateActivityScore', () => {
    it('returns null when no data exists', () => {
      expect(calculateActivityScore('2025-01-15')).toBeNull();
    });

    it('scores higher step counts better', () => {
      // High steps
      seedRecords(testDb, 'HKQuantityTypeIdentifierStepCount', [
        { date: '2025-01-10', value: 12000 },
        { date: '2025-01-11', value: 11000 },
      ]);
      const highSteps = calculateActivityScore('2025-01-15')!;

      testDb.exec('DELETE FROM records');
      seedRecords(testDb, 'HKQuantityTypeIdentifierStepCount', [
        { date: '2025-01-10', value: 2000 },
        { date: '2025-01-11', value: 1500 },
      ]);
      const lowSteps = calculateActivityScore('2025-01-15')!;

      expect(highSteps).toBeGreaterThan(lowSteps);
    });

    it('includes workout data in score when present', () => {
      // With workouts only (no steps), should get a score from workout component
      seedWorkouts(testDb, [
        '2025-01-08', '2025-01-09', '2025-01-10', '2025-01-11',
        '2025-01-12', '2025-01-13', '2025-01-14',
      ]);
      const score = calculateActivityScore('2025-01-15');
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThan(0);
    });
  });

  describe('calculateBodyScore', () => {
    it('returns null when no data exists', () => {
      expect(calculateBodyScore('2025-01-15')).toBeNull();
    });

    it('gives max score for healthy BMI', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierBodyMassIndex', [
        { date: '2025-01-10', value: 22 },
      ]);
      const score = calculateBodyScore('2025-01-15')!;
      expect(score).toBe(100);
    });

    it('scores obese BMI lower', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierBodyMassIndex', [
        { date: '2025-01-10', value: 32 },
      ]);
      const score = calculateBodyScore('2025-01-15')!;
      expect(score).toBeLessThan(100);
    });
  });

  describe('calculateRecoveryScore', () => {
    it('returns null when no data exists', () => {
      expect(calculateRecoveryScore('2025-01-15')).toBeNull();
    });

    it('gives high score for optimal sleep (7-9 hours)', () => {
      seedRecords(testDb, 'HKCategoryTypeIdentifierSleepAnalysis', [
        { date: '2025-01-10', value: 8 },
        { date: '2025-01-11', value: 7.5 },
        { date: '2025-01-12', value: 8 },
      ]);
      const score = calculateRecoveryScore('2025-01-15')!;
      expect(score).toBeGreaterThan(80);
    });

    it('gives lower score for insufficient sleep', () => {
      seedRecords(testDb, 'HKCategoryTypeIdentifierSleepAnalysis', [
        { date: '2025-01-10', value: 4 },
        { date: '2025-01-11', value: 4.5 },
        { date: '2025-01-12', value: 5 },
      ]);
      const score = calculateRecoveryScore('2025-01-15')!;
      expect(score).toBeLessThan(70);
    });
  });

  describe('calculateOverallScore', () => {
    it('returns null when all inputs are null', () => {
      expect(calculateOverallScore(null, null, null, null)).toBeNull();
    });

    it('returns weighted average when all scores present', () => {
      const result = calculateOverallScore(80, 70, 90, 60);
      // Expected: (80*0.40 + 70*0.30 + 90*0.15 + 60*0.15) = 32+21+13.5+9 = 75.5
      expect(result).toBeCloseTo(75.5, 1);
    });

    it('normalizes weights when some scores are null', () => {
      // Only cardio and activity
      const result = calculateOverallScore(80, 70, null, null);
      // (80*0.40 + 70*0.30) / (0.40 + 0.30) = (32 + 21) / 0.70 = 75.71...
      expect(result).toBeCloseTo(53 / 0.7, 1);
    });

    it('uses SCORE_WEIGHTS correctly', () => {
      expect(SCORE_WEIGHTS.cardio + SCORE_WEIGHTS.activity + SCORE_WEIGHTS.body + SCORE_WEIGHTS.recovery).toBeCloseTo(1.0);
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

  describe('computeFitnessScore', () => {
    it('returns a complete FitnessScore object', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierVO2Max', [
        { date: '2025-01-10', value: 42 },
      ]);

      const score = computeFitnessScore('2025-01-15');
      expect(score).toHaveProperty('date', '2025-01-15');
      expect(score).toHaveProperty('cardio_score');
      expect(score).toHaveProperty('activity_score');
      expect(score).toHaveProperty('body_score');
      expect(score).toHaveProperty('recovery_score');
      expect(score).toHaveProperty('overall_score');
      expect(score).toHaveProperty('trend_direction');
      expect(score).toHaveProperty('computed_at');
      expect(['improving', 'stable', 'declining']).toContain(score.trend_direction);
    });

    it('returns all null scores when no data', () => {
      const score = computeFitnessScore('2025-01-15');
      expect(score.cardio_score).toBeNull();
      expect(score.activity_score).toBeNull();
      expect(score.body_score).toBeNull();
      expect(score.recovery_score).toBeNull();
      expect(score.overall_score).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles single data point', () => {
      seedRecords(testDb, 'HKQuantityTypeIdentifierVO2Max', [
        { date: '2025-01-15', value: 40 },
      ]);
      const score = calculateCardioScore('2025-01-15');
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThan(0);
    });

    it('handles all-same-value data', () => {
      const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date('2025-01-15');
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      });
      for (const date of dates) {
        seedRecords(testDb, 'HKQuantityTypeIdentifierVO2Max', [{ date, value: 42 }]);
      }
      const score = calculateCardioScore('2025-01-15');
      expect(score).not.toBeNull();
    });

    it('ignores data outside 90-day window', () => {
      // Data from 200 days ago should not affect score for today
      seedRecords(testDb, 'HKQuantityTypeIdentifierVO2Max', [
        { date: '2024-06-01', value: 50 },
      ]);
      const score = calculateCardioScore('2025-01-15');
      expect(score).toBeNull();
    });
  });
});
