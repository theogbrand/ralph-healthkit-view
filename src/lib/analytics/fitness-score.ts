import { getDb } from '@/lib/db/client';
import { SCORE_WEIGHTS } from '@/config/metrics';
import type { FitnessScore } from '@/types/analytics';

/**
 * Calculate cardio fitness score (0-100) based on:
 * - VO2 Max trend
 * - Resting Heart Rate trend (lower is better)
 * - Heart Rate Variability trend (higher is better)
 * - Walking/running pace improvement
 */
export function calculateCardioScore(date: string): number | null {
  const db = getDb();
  const endDate = date;
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - 90);
  const startDateStr = startDate.toISOString().split('T')[0];

  let totalScore = 0;
  let componentCount = 0;

  // VO2 Max Score (0-40 points)
  const vo2MaxData = db.prepare(`
    SELECT AVG(value) as avg_value
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierVO2Max'
      AND start_date >= ? AND start_date <= ?
  `).get(startDateStr, endDate) as { avg_value: number | null };

  if (vo2MaxData.avg_value) {
    // VO2 Max reference: 35-45 is average, 45+ is excellent
    const vo2Score = Math.min(100, Math.max(0, ((vo2MaxData.avg_value - 25) / 30) * 100));
    totalScore += vo2Score * 0.4;
    componentCount += 0.4;
  }

  // Resting Heart Rate Score (0-30 points)
  const rhrData = db.prepare(`
    SELECT AVG(value) as avg_value
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierRestingHeartRate'
      AND start_date >= ? AND start_date <= ?
  `).get(startDateStr, endDate) as { avg_value: number | null };

  if (rhrData.avg_value) {
    // RHR reference: 60-100 is normal, <60 is excellent, >100 is poor
    // Invert the score (lower is better)
    const rhrScore = Math.min(100, Math.max(0, ((100 - rhrData.avg_value) / 40) * 100));
    totalScore += rhrScore * 0.3;
    componentCount += 0.3;
  }

  // Heart Rate Variability Score (0-30 points)
  const hrvData = db.prepare(`
    SELECT AVG(value) as avg_value
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN'
      AND start_date >= ? AND start_date <= ?
  `).get(startDateStr, endDate) as { avg_value: number | null };

  if (hrvData.avg_value) {
    // HRV reference: 20ms is low, 50ms is average, 100ms+ is excellent
    const hrvScore = Math.min(100, Math.max(0, ((hrvData.avg_value - 20) / 80) * 100));
    totalScore += hrvScore * 0.3;
    componentCount += 0.3;
  }

  if (componentCount === 0) return null;

  // Normalize to 0-100
  return Math.round((totalScore / componentCount) * 100) / 100;
}

/**
 * Calculate activity score (0-100) based on:
 * - Average daily steps (10K+ = max points)
 * - Weekly exercise minutes (150+ = max points)
 * - Active energy burned trend
 * - Workout consistency and frequency
 */
export function calculateActivityScore(date: string): number | null {
  const db = getDb();
  const endDate = date;
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - 90);
  const startDateStr = startDate.toISOString().split('T')[0];

  let totalScore = 0;
  let componentCount = 0;

  // Daily Steps Score (0-30 points)
  const stepsData = db.prepare(`
    SELECT AVG(daily_total) as avg_steps
    FROM (
      SELECT DATE(start_date) as date, SUM(value) as daily_total
      FROM records
      WHERE type = 'HKQuantityTypeIdentifierStepCount'
        AND start_date >= ? AND start_date <= ?
      GROUP BY DATE(start_date)
    )
  `).get(startDateStr, endDate) as { avg_steps: number | null };

  if (stepsData.avg_steps) {
    // 10,000 steps = 100 points
    const stepsScore = Math.min(100, (stepsData.avg_steps / 10000) * 100);
    totalScore += stepsScore * 0.3;
    componentCount += 0.3;
  }

  // Weekly Exercise Minutes Score (0-30 points)
  const exerciseData = db.prepare(`
    SELECT AVG(weekly_total) as avg_minutes
    FROM (
      SELECT strftime('%Y-%W', start_date) as week, SUM(value) as weekly_total
      FROM records
      WHERE type = 'HKQuantityTypeIdentifierAppleExerciseTime'
        AND start_date >= ? AND start_date <= ?
      GROUP BY strftime('%Y-%W', start_date)
    )
  `).get(startDateStr, endDate) as { avg_minutes: number | null };

  if (exerciseData.avg_minutes) {
    // 150 minutes per week = 100 points (WHO recommendation)
    const exerciseScore = Math.min(100, (exerciseData.avg_minutes / 150) * 100);
    totalScore += exerciseScore * 0.3;
    componentCount += 0.3;
  }

  // Active Energy Score (0-20 points)
  const energyData = db.prepare(`
    SELECT AVG(daily_total) as avg_energy
    FROM (
      SELECT DATE(start_date) as date, SUM(value) as daily_total
      FROM records
      WHERE type = 'HKQuantityTypeIdentifierActiveEnergyBurned'
        AND start_date >= ? AND start_date <= ?
      GROUP BY DATE(start_date)
    )
  `).get(startDateStr, endDate) as { avg_energy: number | null };

  if (energyData.avg_energy) {
    // 500 kcal/day = 100 points (active lifestyle)
    const energyScore = Math.min(100, (energyData.avg_energy / 500) * 100);
    totalScore += energyScore * 0.2;
    componentCount += 0.2;
  }

  // Workout Consistency Score (0-20 points)
  const workoutData = db.prepare(`
    SELECT COUNT(*) as workout_count,
           COUNT(DISTINCT DATE(start_date)) as workout_days
    FROM workouts
    WHERE start_date >= ? AND start_date <= ?
  `).get(startDateStr, endDate) as { workout_count: number; workout_days: number };

  if (workoutData.workout_count > 0) {
    const daysInPeriod = 90;
    const workoutFrequency = workoutData.workout_days / daysInPeriod;
    // 4+ workouts per week = 100 points
    const consistencyScore = Math.min(100, (workoutFrequency / (4/7)) * 100);
    totalScore += consistencyScore * 0.2;
    componentCount += 0.2;
  }

  if (componentCount === 0) return null;

  // Normalize to 0-100
  return Math.round((totalScore / componentCount) * 100) / 100;
}

/**
 * Calculate body composition score (0-100) based on:
 * - Weight trend relative to healthy BMI
 * - Body fat percentage trend
 * - Consistency of measurements
 */
export function calculateBodyScore(date: string): number | null {
  const db = getDb();
  const endDate = date;
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - 90);
  const startDateStr = startDate.toISOString().split('T')[0];

  let totalScore = 0;
  let componentCount = 0;

  // BMI Score (0-50 points)
  const bmiData = db.prepare(`
    SELECT AVG(value) as avg_bmi
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierBodyMassIndex'
      AND start_date >= ? AND start_date <= ?
  `).get(startDateStr, endDate) as { avg_bmi: number | null };

  if (bmiData.avg_bmi) {
    // Healthy BMI range: 18.5-24.9
    let bmiScore: number;
    if (bmiData.avg_bmi >= 18.5 && bmiData.avg_bmi <= 24.9) {
      bmiScore = 100;
    } else if (bmiData.avg_bmi < 18.5) {
      // Underweight
      bmiScore = Math.max(0, 100 - ((18.5 - bmiData.avg_bmi) / 3) * 100);
    } else {
      // Overweight/Obese
      bmiScore = Math.max(0, 100 - ((bmiData.avg_bmi - 24.9) / 10) * 100);
    }
    totalScore += bmiScore * 0.5;
    componentCount += 0.5;
  }

  // Body Fat Percentage Score (0-30 points)
  const bodyFatData = db.prepare(`
    SELECT AVG(value) as avg_fat
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierBodyFatPercentage'
      AND start_date >= ? AND start_date <= ?
  `).get(startDateStr, endDate) as { avg_fat: number | null };

  if (bodyFatData.avg_fat) {
    // Healthy body fat: Men 10-20%, Women 18-28% (using middle ground)
    let fatScore: number;
    if (bodyFatData.avg_fat >= 14 && bodyFatData.avg_fat <= 24) {
      fatScore = 100;
    } else if (bodyFatData.avg_fat < 14) {
      fatScore = Math.max(0, 100 - ((14 - bodyFatData.avg_fat) / 8) * 100);
    } else {
      fatScore = Math.max(0, 100 - ((bodyFatData.avg_fat - 24) / 16) * 100);
    }
    totalScore += fatScore * 0.3;
    componentCount += 0.3;
  }

  // Weight Measurement Consistency (0-20 points)
  const weightConsistency = db.prepare(`
    SELECT COUNT(DISTINCT DATE(start_date)) as measurement_days
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierBodyMass'
      AND start_date >= ? AND start_date <= ?
  `).get(startDateStr, endDate) as { measurement_days: number };

  if (weightConsistency.measurement_days > 0) {
    const daysInPeriod = 90;
    const consistencyRatio = weightConsistency.measurement_days / daysInPeriod;
    // Weekly measurements (13+ days in 90 days) = 100 points
    const consistencyScore = Math.min(100, (consistencyRatio / (1/7)) * 100);
    totalScore += consistencyScore * 0.2;
    componentCount += 0.2;
  }

  if (componentCount === 0) return null;

  // Normalize to 0-100
  return Math.round((totalScore / componentCount) * 100) / 100;
}

/**
 * Calculate recovery score (0-100) based on:
 * - Sleep duration (7-9 hours target)
 * - Sleep consistency (regular schedule)
 * - Heart rate variability (HRV indicator)
 */
export function calculateRecoveryScore(date: string): number | null {
  const db = getDb();
  const endDate = date;
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - 90);
  const startDateStr = startDate.toISOString().split('T')[0];

  let totalScore = 0;
  let componentCount = 0;

  // Sleep Duration Score (0-50 points)
  // SQLite doesn't have STDEV, so fetch daily values and compute in TypeScript
  const dailySleepRows = db.prepare(`
    SELECT SUM(value) as daily_sleep
    FROM records
    WHERE type = 'HKCategoryTypeIdentifierSleepAnalysis'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(startDateStr, endDate) as { daily_sleep: number }[];

  const sleepValues = dailySleepRows.map(r => r.daily_sleep);
  const avgHours = sleepValues.length > 0
    ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length
    : null;
  const stdDev = sleepValues.length > 1
    ? Math.sqrt(sleepValues.reduce((sum, v) => sum + (v - avgHours!) ** 2, 0) / sleepValues.length)
    : null;
  const sleepData = { avg_hours: avgHours, std_dev: stdDev };

  if (sleepData.avg_hours) {
    // Optimal sleep: 7-9 hours
    let sleepScore: number;
    if (sleepData.avg_hours >= 7 && sleepData.avg_hours <= 9) {
      sleepScore = 100;
    } else if (sleepData.avg_hours < 7) {
      sleepScore = Math.max(0, 100 - ((7 - sleepData.avg_hours) / 3) * 100);
    } else {
      sleepScore = Math.max(0, 100 - ((sleepData.avg_hours - 9) / 3) * 100);
    }
    totalScore += sleepScore * 0.5;
    componentCount += 0.5;
  }

  // Sleep Consistency Score (0-30 points)
  if (sleepData.std_dev !== null) {
    // Lower standard deviation = better consistency
    // Target: <1 hour std dev = 100 points
    const consistencyScore = Math.max(0, 100 - (sleepData.std_dev / 2) * 100);
    totalScore += consistencyScore * 0.3;
    componentCount += 0.3;
  }

  // HRV Recovery Score (0-20 points)
  const hrvData = db.prepare(`
    SELECT AVG(value) as avg_hrv
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN'
      AND start_date >= ? AND start_date <= ?
  `).get(startDateStr, endDate) as { avg_hrv: number | null };

  if (hrvData.avg_hrv) {
    // HRV as recovery indicator: 50ms+ = good recovery
    const hrvScore = Math.min(100, (hrvData.avg_hrv / 80) * 100);
    totalScore += hrvScore * 0.2;
    componentCount += 0.2;
  }

  if (componentCount === 0) return null;

  // Normalize to 0-100
  return Math.round((totalScore / componentCount) * 100) / 100;
}

/**
 * Calculate overall fitness score as weighted average of category scores
 */
export function calculateOverallScore(
  cardioScore: number | null,
  activityScore: number | null,
  bodyScore: number | null,
  recoveryScore: number | null
): number | null {
  let totalScore = 0;
  let totalWeight = 0;

  if (cardioScore !== null) {
    totalScore += cardioScore * SCORE_WEIGHTS.cardio;
    totalWeight += SCORE_WEIGHTS.cardio;
  }

  if (activityScore !== null) {
    totalScore += activityScore * SCORE_WEIGHTS.activity;
    totalWeight += SCORE_WEIGHTS.activity;
  }

  if (bodyScore !== null) {
    totalScore += bodyScore * SCORE_WEIGHTS.body;
    totalWeight += SCORE_WEIGHTS.body;
  }

  if (recoveryScore !== null) {
    totalScore += recoveryScore * SCORE_WEIGHTS.recovery;
    totalWeight += SCORE_WEIGHTS.recovery;
  }

  if (totalWeight === 0) return null;

  // Normalize to 0-100
  return Math.round((totalScore / totalWeight) * 100) / 100;
}

/**
 * Detect trend direction by comparing first and second half of the period
 */
export function detectTrend(scores: (number | null)[]): 'improving' | 'stable' | 'declining' {
  const validScores = scores.filter(s => s !== null) as number[];

  if (validScores.length < 4) return 'stable';

  const midpoint = Math.floor(validScores.length / 2);
  const firstHalf = validScores.slice(0, midpoint);
  const secondHalf = validScores.slice(midpoint);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const change = secondAvg - firstAvg;
  const stdDev = Math.sqrt(
    validScores.reduce((sum, val) => sum + Math.pow(val - ((firstAvg + secondAvg) / 2), 2), 0) / validScores.length
  );

  // If change > 0.5 standard deviations, it's significant
  if (Math.abs(change) < 0.5 * stdDev) return 'stable';

  return change > 0 ? 'improving' : 'declining';
}

/**
 * Compute fitness score for a specific date
 */
export function computeFitnessScore(date: string): FitnessScore {
  const cardioScore = calculateCardioScore(date);
  const activityScore = calculateActivityScore(date);
  const bodyScore = calculateBodyScore(date);
  const recoveryScore = calculateRecoveryScore(date);
  const overallScore = calculateOverallScore(cardioScore, activityScore, bodyScore, recoveryScore);

  // Get historical scores to detect trend
  const db = getDb();
  const historicalScores = db.prepare(`
    SELECT overall_score
    FROM fitness_scores
    WHERE date <= ?
    ORDER BY date DESC
    LIMIT 30
  `).all(date) as { overall_score: number | null }[];

  const trendDirection = detectTrend([...historicalScores.map(s => s.overall_score), overallScore]);

  return {
    date,
    cardio_score: cardioScore,
    activity_score: activityScore,
    body_score: bodyScore,
    recovery_score: recoveryScore,
    overall_score: overallScore,
    trend_direction: trendDirection,
    computed_at: new Date().toISOString(),
  };
}

/**
 * Compute fitness scores for a date range using batched queries.
 * Pre-fetches all needed data, then computes scores in memory.
 */
export function computeFitnessScoresForRange(startDate: string, endDate: string): FitnessScore[] {
  const db = getDb();
  const LOOKBACK = 90;

  // Extend start date by lookback period to cover all rolling windows
  const extStart = new Date(startDate);
  extStart.setDate(extStart.getDate() - LOOKBACK);
  const extStartStr = extStart.toISOString().split('T')[0];

  // --- Batch fetch all daily aggregated data ---

  // Cardio: daily averages for VO2Max, RHR, HRV
  const dailyAvgs = db.prepare(`
    SELECT DATE(start_date) as date, type, AVG(value) as avg_value
    FROM records
    WHERE type IN (
      'HKQuantityTypeIdentifierVO2Max',
      'HKQuantityTypeIdentifierRestingHeartRate',
      'HKQuantityTypeIdentifierHeartRateVariabilitySDNN'
    )
    AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date), type
    ORDER BY date
  `).all(extStartStr, endDate) as { date: string; type: string; avg_value: number }[];

  // Activity: daily steps, exercise (weekly), energy
  const dailySteps = db.prepare(`
    SELECT DATE(start_date) as date, SUM(value) as total
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierStepCount'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; total: number }[];

  const dailyExercise = db.prepare(`
    SELECT DATE(start_date) as date, SUM(value) as total
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierAppleExerciseTime'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; total: number }[];

  const dailyEnergy = db.prepare(`
    SELECT DATE(start_date) as date, SUM(value) as total
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierActiveEnergyBurned'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; total: number }[];

  const dailyWorkouts = db.prepare(`
    SELECT DATE(start_date) as date, COUNT(*) as count
    FROM workouts
    WHERE start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; count: number }[];

  // Body: daily averages for BMI, body fat; measurement count for weight
  const dailyBmi = db.prepare(`
    SELECT DATE(start_date) as date, AVG(value) as avg_value
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierBodyMassIndex'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; avg_value: number }[];

  const dailyBodyFat = db.prepare(`
    SELECT DATE(start_date) as date, AVG(value) as avg_value
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierBodyFatPercentage'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; avg_value: number }[];

  const dailyWeight = db.prepare(`
    SELECT DATE(start_date) as date, 1 as has_measurement
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierBodyMass'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; has_measurement: number }[];

  // Recovery: daily sleep, HRV (already fetched above)
  const dailySleep = db.prepare(`
    SELECT DATE(start_date) as date, SUM(value) as total
    FROM records
    WHERE type = 'HKCategoryTypeIdentifierSleepAnalysis'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; total: number }[];

  // Historical scores for trend detection
  const historicalScores = db.prepare(`
    SELECT date, overall_score
    FROM fitness_scores
    WHERE date <= ?
    ORDER BY date DESC
    LIMIT 30
  `).all(endDate) as { date: string; overall_score: number | null }[];

  // --- Index data into maps for O(1) lookups ---
  type DailyMap = Map<string, number>;

  function toMap(rows: { date: string; total?: number; avg_value?: number; count?: number; has_measurement?: number }[], field: 'total' | 'avg_value' | 'count' | 'has_measurement'): DailyMap {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.date, r[field] as number);
    return m;
  }

  // Multi-type map: type -> date -> value
  const avgByTypeDate = new Map<string, DailyMap>();
  for (const r of dailyAvgs) {
    if (!avgByTypeDate.has(r.type)) avgByTypeDate.set(r.type, new Map());
    avgByTypeDate.get(r.type)!.set(r.date, r.avg_value);
  }

  const stepsMap = toMap(dailySteps, 'total');
  const exerciseMap = toMap(dailyExercise, 'total');
  const energyMap = toMap(dailyEnergy, 'total');
  const workoutMap = toMap(dailyWorkouts, 'count');
  const bmiMap = toMap(dailyBmi, 'avg_value');
  const bodyFatMap = toMap(dailyBodyFat, 'avg_value');
  const weightMap = toMap(dailyWeight, 'has_measurement');
  const sleepMap = toMap(dailySleep, 'total');

  // --- Helper: get values from a map within a date window ---
  function getWindowValues(map: DailyMap, windowStart: string, windowEnd: string): number[] {
    const values: number[] = [];
    for (const [date, val] of map) {
      if (date >= windowStart && date <= windowEnd) values.push(val);
    }
    return values;
  }

  function getWindowAvg(map: DailyMap | undefined, windowStart: string, windowEnd: string): number | null {
    if (!map) return null;
    const vals = getWindowValues(map, windowStart, windowEnd);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  // --- Score computation helpers (same logic as individual functions) ---
  function scoreCardio(windowStart: string, windowEnd: string): number | null {
    let total = 0, weight = 0;

    const vo2Avg = getWindowAvg(avgByTypeDate.get('HKQuantityTypeIdentifierVO2Max'), windowStart, windowEnd);
    if (vo2Avg) {
      total += Math.min(100, Math.max(0, ((vo2Avg - 25) / 30) * 100)) * 0.4;
      weight += 0.4;
    }

    const rhrAvg = getWindowAvg(avgByTypeDate.get('HKQuantityTypeIdentifierRestingHeartRate'), windowStart, windowEnd);
    if (rhrAvg) {
      total += Math.min(100, Math.max(0, ((100 - rhrAvg) / 40) * 100)) * 0.3;
      weight += 0.3;
    }

    const hrvAvg = getWindowAvg(avgByTypeDate.get('HKQuantityTypeIdentifierHeartRateVariabilitySDNN'), windowStart, windowEnd);
    if (hrvAvg) {
      total += Math.min(100, Math.max(0, ((hrvAvg - 20) / 80) * 100)) * 0.3;
      weight += 0.3;
    }

    return weight === 0 ? null : Math.round((total / weight) * 100) / 100;
  }

  function scoreActivity(windowStart: string, windowEnd: string): number | null {
    let total = 0, weight = 0;

    const stepsVals = getWindowValues(stepsMap, windowStart, windowEnd);
    if (stepsVals.length > 0) {
      const avgSteps = stepsVals.reduce((a, b) => a + b, 0) / stepsVals.length;
      total += Math.min(100, (avgSteps / 10000) * 100) * 0.3;
      weight += 0.3;
    }

    // Weekly exercise: sum all exercise in window, divide by weeks
    const exerciseVals = getWindowValues(exerciseMap, windowStart, windowEnd);
    if (exerciseVals.length > 0) {
      const totalMinutes = exerciseVals.reduce((a, b) => a + b, 0);
      const weeks = Math.max(1, (new Date(windowEnd).getTime() - new Date(windowStart).getTime()) / (7 * 86400000));
      const avgWeekly = totalMinutes / weeks;
      total += Math.min(100, (avgWeekly / 150) * 100) * 0.3;
      weight += 0.3;
    }

    const energyVals = getWindowValues(energyMap, windowStart, windowEnd);
    if (energyVals.length > 0) {
      const avgEnergy = energyVals.reduce((a, b) => a + b, 0) / energyVals.length;
      total += Math.min(100, (avgEnergy / 500) * 100) * 0.2;
      weight += 0.2;
    }

    const workoutVals = getWindowValues(workoutMap, windowStart, windowEnd);
    const workoutDays = workoutVals.length;
    if (workoutDays > 0) {
      const freq = workoutDays / 90;
      total += Math.min(100, (freq / (4 / 7)) * 100) * 0.2;
      weight += 0.2;
    }

    return weight === 0 ? null : Math.round((total / weight) * 100) / 100;
  }

  function scoreBody(windowStart: string, windowEnd: string): number | null {
    let total = 0, weight = 0;

    const bmiAvg = getWindowAvg(bmiMap, windowStart, windowEnd);
    if (bmiAvg) {
      let s: number;
      if (bmiAvg >= 18.5 && bmiAvg <= 24.9) s = 100;
      else if (bmiAvg < 18.5) s = Math.max(0, 100 - ((18.5 - bmiAvg) / 3) * 100);
      else s = Math.max(0, 100 - ((bmiAvg - 24.9) / 10) * 100);
      total += s * 0.5;
      weight += 0.5;
    }

    const fatAvg = getWindowAvg(bodyFatMap, windowStart, windowEnd);
    if (fatAvg) {
      let s: number;
      if (fatAvg >= 14 && fatAvg <= 24) s = 100;
      else if (fatAvg < 14) s = Math.max(0, 100 - ((14 - fatAvg) / 8) * 100);
      else s = Math.max(0, 100 - ((fatAvg - 24) / 16) * 100);
      total += s * 0.3;
      weight += 0.3;
    }

    const measureDays = getWindowValues(weightMap, windowStart, windowEnd).length;
    if (measureDays > 0) {
      total += Math.min(100, ((measureDays / 90) / (1 / 7)) * 100) * 0.2;
      weight += 0.2;
    }

    return weight === 0 ? null : Math.round((total / weight) * 100) / 100;
  }

  function scoreRecovery(windowStart: string, windowEnd: string): number | null {
    let total = 0, weight = 0;

    const sleepVals = getWindowValues(sleepMap, windowStart, windowEnd);
    const avgHours = sleepVals.length > 0
      ? sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length
      : null;

    if (avgHours) {
      let s: number;
      if (avgHours >= 7 && avgHours <= 9) s = 100;
      else if (avgHours < 7) s = Math.max(0, 100 - ((7 - avgHours) / 3) * 100);
      else s = Math.max(0, 100 - ((avgHours - 9) / 3) * 100);
      total += s * 0.5;
      weight += 0.5;
    }

    if (sleepVals.length > 1 && avgHours !== null) {
      const sd = Math.sqrt(sleepVals.reduce((sum, v) => sum + (v - avgHours) ** 2, 0) / sleepVals.length);
      total += Math.max(0, 100 - (sd / 2) * 100) * 0.3;
      weight += 0.3;
    }

    const hrvAvg = getWindowAvg(avgByTypeDate.get('HKQuantityTypeIdentifierHeartRateVariabilitySDNN'), windowStart, windowEnd);
    if (hrvAvg) {
      total += Math.min(100, (hrvAvg / 80) * 100) * 0.2;
      weight += 0.2;
    }

    return weight === 0 ? null : Math.round((total / weight) * 100) / 100;
  }

  // --- Compute scores for each day in the range ---
  const scores: FitnessScore[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const recentOverall = historicalScores.map(s => s.overall_score);

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    const ws = new Date(date);
    ws.setDate(ws.getDate() - LOOKBACK);
    const windowStart = ws.toISOString().split('T')[0];

    const cardio = scoreCardio(windowStart, dateStr);
    const activity = scoreActivity(windowStart, dateStr);
    const body = scoreBody(windowStart, dateStr);
    const recovery = scoreRecovery(windowStart, dateStr);
    const overall = calculateOverallScore(cardio, activity, body, recovery);

    const trendInput = [...recentOverall, overall];
    const trend = detectTrend(trendInput);

    scores.push({
      date: dateStr,
      cardio_score: cardio,
      activity_score: activity,
      body_score: body,
      recovery_score: recovery,
      overall_score: overall,
      trend_direction: trend,
      computed_at: new Date().toISOString(),
    });

    // Add this score to the running trend window
    recentOverall.unshift(overall);
    if (recentOverall.length > 30) recentOverall.pop();
  }

  return scores;
}
