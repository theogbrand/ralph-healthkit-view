import { getDb } from './client';
import type { HealthRecord, Workout, SyncStatus } from '@/types/health-data';
import type { FitnessScore } from '@/types/analytics';

export function insertRecord(record: Omit<HealthRecord, 'id'>): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO records (type, readable_type, value, unit, source_name, device, start_date, end_date, created_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    record.type, record.readable_type, record.value, record.unit,
    record.source_name, record.device, record.start_date, record.end_date, record.created_date
  );
  return result.changes > 0;
}

export function insertRecordsBatch(records: Omit<HealthRecord, 'id'>[]): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO records (type, readable_type, value, unit, source_name, device, start_date, end_date, created_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  const batchInsert = db.transaction((batch: Omit<HealthRecord, 'id'>[]) => {
    for (const r of batch) {
      const result = stmt.run(
        r.type, r.readable_type, r.value, r.unit,
        r.source_name, r.device, r.start_date, r.end_date, r.created_date
      );
      if (result.changes > 0) inserted++;
    }
  });

  batchInsert(records);
  return inserted;
}

export function insertWorkout(workout: Omit<Workout, 'id'>): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO workouts (workout_type, duration_minutes, distance_km, total_energy_kcal, avg_heart_rate, source_name, device, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    workout.workout_type, workout.duration_minutes, workout.distance_km,
    workout.total_energy_kcal, workout.avg_heart_rate, workout.source_name,
    workout.device, workout.start_date, workout.end_date
  );
  return result.changes > 0;
}

export function insertWorkoutsBatch(workouts: Omit<Workout, 'id'>[]): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO workouts (workout_type, duration_minutes, distance_km, total_energy_kcal, avg_heart_rate, source_name, device, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  const batchInsert = db.transaction((batch: Omit<Workout, 'id'>[]) => {
    for (const w of batch) {
      const result = stmt.run(
        w.workout_type, w.duration_minutes, w.distance_km,
        w.total_energy_kcal, w.avg_heart_rate, w.source_name,
        w.device, w.start_date, w.end_date
      );
      if (result.changes > 0) inserted++;
    }
  });

  batchInsert(workouts);
  return inserted;
}

export function getRecordsByType(type: string, startDate: string, endDate: string): HealthRecord[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM records
    WHERE type = ? AND start_date >= ? AND start_date <= ?
    ORDER BY start_date ASC
  `).all(type, startDate, endDate) as HealthRecord[];
}

export function getDailyAverageByType(type: string, startDate: string, endDate: string): { date: string; avg_value: number }[] {
  const db = getDb();
  return db.prepare(`
    SELECT DATE(start_date) as date, AVG(value) as avg_value
    FROM records
    WHERE type = ? AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
    ORDER BY date ASC
  `).all(type, startDate, endDate) as { date: string; avg_value: number }[];
}

export function getDailySumByType(type: string, startDate: string, endDate: string): { date: string; total_value: number }[] {
  const db = getDb();
  return db.prepare(`
    SELECT DATE(start_date) as date, SUM(value) as total_value
    FROM records
    WHERE type = ? AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
    ORDER BY date ASC
  `).all(type, startDate, endDate) as { date: string; total_value: number }[];
}

export function getLatestRecordByType(type: string): HealthRecord | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM records WHERE type = ? ORDER BY start_date DESC LIMIT 1
  `).get(type) as HealthRecord | undefined;
}

export function getWorkouts(startDate: string, endDate: string): Workout[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM workouts
    WHERE start_date >= ? AND start_date <= ?
    ORDER BY start_date ASC
  `).all(startDate, endDate) as Workout[];
}

export function getWorkoutsByType(types: string[], startDate: string, endDate: string): Workout[] {
  const db = getDb();
  const placeholders = types.map(() => '?').join(',');
  return db.prepare(`
    SELECT * FROM workouts
    WHERE workout_type IN (${placeholders})
      AND start_date >= ? AND start_date <= ?
    ORDER BY start_date ASC
  `).all(...types, startDate, endDate) as Workout[];
}

export interface WeeklyWorkoutSummary {
  week: string;
  count: number;
  avg_duration: number;
  total_distance: number;
  avg_hr: number | null;
  avg_energy: number;
  total_energy: number;
}

export function getWeeklyWorkoutSummary(types: string[], startDate: string, endDate: string): WeeklyWorkoutSummary[] {
  const db = getDb();
  const placeholders = types.map(() => '?').join(',');
  return db.prepare(`
    SELECT
      strftime('%Y-W%W', start_date) as week,
      COUNT(*) as count,
      AVG(duration_minutes) as avg_duration,
      COALESCE(SUM(distance_km), 0) as total_distance,
      AVG(avg_heart_rate) as avg_hr,
      AVG(COALESCE(total_energy_kcal, 0)) as avg_energy,
      COALESCE(SUM(total_energy_kcal), 0) as total_energy
    FROM workouts
    WHERE workout_type IN (${placeholders})
      AND start_date >= ? AND start_date <= ?
    GROUP BY strftime('%Y-W%W', start_date)
    ORDER BY week ASC
  `).all(...types, startDate, endDate) as WeeklyWorkoutSummary[];
}

export function saveFitnessScore(score: FitnessScore): void {
  const db = getDb();
  // Map running_score → cardio_score column, gym_score → activity_score column
  // body_score and recovery_score set to null (no longer computed)
  db.prepare(`
    INSERT OR REPLACE INTO fitness_scores (date, cardio_score, activity_score, body_score, recovery_score, overall_score, trend_direction, computed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    score.date, score.running_score, score.gym_score,
    null, null, score.overall_score,
    score.trend_direction, score.computed_at
  );
}

export function getFitnessScores(startDate: string, endDate: string): FitnessScore[] {
  const db = getDb();
  return db.prepare(`
    SELECT date, cardio_score as running_score, activity_score as gym_score,
           overall_score, trend_direction, computed_at
    FROM fitness_scores
    WHERE date >= ? AND date <= ?
    ORDER BY date ASC
  `).all(startDate, endDate) as FitnessScore[];
}

export function getLatestFitnessScore(): FitnessScore | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT date, cardio_score as running_score, activity_score as gym_score,
           overall_score, trend_direction, computed_at
    FROM fitness_scores WHERE overall_score IS NOT NULL ORDER BY date DESC LIMIT 1
  `).get() as FitnessScore | undefined;
}

export function getSyncStatus(): SyncStatus {
  const db = getDb();

  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM records) as total_records,
      (SELECT COUNT(*) FROM workouts) as total_workouts,
      (SELECT MIN(start_date) FROM records) as min_date,
      (SELECT MAX(start_date) FROM records) as max_date,
      (SELECT MAX(created_date) FROM records) as last_sync
  `).get() as {
    total_records: number;
    total_workouts: number;
    min_date: string | null;
    max_date: string | null;
    last_sync: string | null;
  };

  return {
    last_sync: counts.last_sync,
    total_records: counts.total_records,
    total_workouts: counts.total_workouts,
    date_range: counts.min_date && counts.max_date
      ? { start: counts.min_date, end: counts.max_date }
      : null,
  };
}
