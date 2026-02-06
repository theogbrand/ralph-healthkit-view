import { getDb } from '@/lib/db/client';
import {
  SCORE_WEIGHTS,
  RUNNING_SCORE_WEIGHTS,
  GYM_SCORE_WEIGHTS,
  RUNNING_WORKOUT_TYPES,
  GYM_WORKOUT_TYPES,
} from '@/config/metrics';
import type { FitnessScore } from '@/types/analytics';

/**
 * Calculate running score (0-100) based on:
 * - Resting HR (25%): lower = better
 * - Pace (25%): avg min/km from Running workouts (lower = better)
 * - Running HR (20%): avg HR during runs (lower = better)
 * - Frequency (15%): runs per week (4+ = 100)
 * - Distance (15%): avg weekly km (40+ = 100)
 */
export function calculateRunningScore(start: string, end: string): number | null {
  const db = getDb();
  let total = 0, weight = 0;

  const W = RUNNING_SCORE_WEIGHTS;

  // Resting Heart Rate (from records table)
  const rhr = db.prepare(`
    SELECT AVG(value) as v FROM records
    WHERE type = 'HKQuantityTypeIdentifierRestingHeartRate'
      AND start_date >= ? AND start_date <= ?
  `).get(start, end) as { v: number | null };
  if (rhr.v) {
    // RHR: 60=100pts, 100=0pts (lower is better)
    total += Math.min(100, Math.max(0, ((100 - rhr.v) / 40) * 100)) * W.resting_hr;
    weight += W.resting_hr;
  }

  // Running workouts
  const placeholders = RUNNING_WORKOUT_TYPES.map(() => '?').join(',');
  const runWorkouts = db.prepare(`
    SELECT duration_minutes, distance_km, avg_heart_rate
    FROM workouts
    WHERE workout_type IN (${placeholders})
      AND start_date >= ? AND start_date <= ?
  `).all(...RUNNING_WORKOUT_TYPES, start, end) as {
    duration_minutes: number;
    distance_km: number | null;
    avg_heart_rate: number | null;
  }[];

  if (runWorkouts.length > 0) {
    // Pace: avg duration/distance for runs with valid distance
    const runsWithDistance = runWorkouts.filter(w => w.distance_km && w.distance_km > 0);
    if (runsWithDistance.length > 0) {
      const avgPace = runsWithDistance.reduce((s, w) => s + w.duration_minutes / w.distance_km!, 0) / runsWithDistance.length;
      // Pace scoring: 3.5 min/km = 100, 8 min/km = 0
      total += Math.min(100, Math.max(0, ((8 - avgPace) / 4.5) * 100)) * W.pace;
      weight += W.pace;
    }

    // Running HR
    const runsWithHR = runWorkouts.filter(w => w.avg_heart_rate);
    if (runsWithHR.length > 0) {
      const avgHR = runsWithHR.reduce((s, w) => s + w.avg_heart_rate!, 0) / runsWithHR.length;
      // Lower HR at same effort = better. 120 bpm = 100, 190 bpm = 0
      total += Math.min(100, Math.max(0, ((190 - avgHR) / 70) * 100)) * W.running_hr;
      weight += W.running_hr;
    }

    // Frequency: runs per week
    const days = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
    const weeks = Math.max(1, days / 7);
    const runsPerWeek = runWorkouts.length / weeks;
    // 4+ runs/week = 100
    total += Math.min(100, (runsPerWeek / 4) * 100) * W.frequency;
    weight += W.frequency;

    // Weekly Distance
    const totalDist = runWorkouts.reduce((s, w) => s + (w.distance_km ?? 0), 0);
    const weeklyDist = totalDist / weeks;
    // 40+ km/week = 100
    total += Math.min(100, (weeklyDist / 40) * 100) * W.distance;
    weight += W.distance;
  }

  if (weight === 0) return null;
  return Math.round((total / weight) * 100) / 100;
}

/**
 * Calculate gym score (0-100) based on:
 * - Frequency (30%): gym sessions per week (4+ = 100)
 * - Intensity (25%): avg kcal/min (10+ = 100)
 * - Gym HR (25%): avg HR during gym (higher = harder; 150+ bpm = 100)
 * - Duration (20%): avg session length (60+ min = 100)
 */
export function calculateGymScore(start: string, end: string): number | null {
  const db = getDb();
  let total = 0, weight = 0;

  const W = GYM_SCORE_WEIGHTS;
  const placeholders = GYM_WORKOUT_TYPES.map(() => '?').join(',');

  const gymWorkouts = db.prepare(`
    SELECT duration_minutes, total_energy_kcal, avg_heart_rate
    FROM workouts
    WHERE workout_type IN (${placeholders})
      AND start_date >= ? AND start_date <= ?
  `).all(...GYM_WORKOUT_TYPES, start, end) as {
    duration_minutes: number;
    total_energy_kcal: number | null;
    avg_heart_rate: number | null;
  }[];

  if (gymWorkouts.length === 0) return null;

  const days = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
  const weeks = Math.max(1, days / 7);

  // Frequency
  const sessionsPerWeek = gymWorkouts.length / weeks;
  total += Math.min(100, (sessionsPerWeek / 4) * 100) * W.frequency;
  weight += W.frequency;

  // Intensity (kcal/min)
  const withEnergy = gymWorkouts.filter(w => w.total_energy_kcal && w.duration_minutes > 0);
  if (withEnergy.length > 0) {
    const avgIntensity = withEnergy.reduce((s, w) => s + w.total_energy_kcal! / w.duration_minutes, 0) / withEnergy.length;
    // 10+ kcal/min = 100
    total += Math.min(100, (avgIntensity / 10) * 100) * W.intensity;
    weight += W.intensity;
  }

  // Gym HR (higher = working harder)
  const withHR = gymWorkouts.filter(w => w.avg_heart_rate);
  if (withHR.length > 0) {
    const avgHR = withHR.reduce((s, w) => s + w.avg_heart_rate!, 0) / withHR.length;
    // 150+ bpm = 100, 80 bpm = 0
    total += Math.min(100, Math.max(0, ((avgHR - 80) / 70) * 100)) * W.gym_hr;
    weight += W.gym_hr;
  }

  // Duration
  const avgDuration = gymWorkouts.reduce((s, w) => s + w.duration_minutes, 0) / gymWorkouts.length;
  // 60+ min = 100
  total += Math.min(100, (avgDuration / 60) * 100) * W.duration;
  weight += W.duration;

  if (weight === 0) return null;
  return Math.round((total / weight) * 100) / 100;
}

/**
 * Calculate overall fitness score as weighted average of running and gym scores
 */
export function calculateOverallScore(
  runningScore: number | null,
  gymScore: number | null,
): number | null {
  let totalScore = 0;
  let totalWeight = 0;

  if (runningScore !== null) {
    totalScore += runningScore * SCORE_WEIGHTS.running;
    totalWeight += SCORE_WEIGHTS.running;
  }

  if (gymScore !== null) {
    totalScore += gymScore * SCORE_WEIGHTS.gym;
    totalWeight += SCORE_WEIGHTS.gym;
  }

  if (totalWeight === 0) return null;
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

  if (Math.abs(change) < 0.5 * stdDev) return 'stable';

  return change > 0 ? 'improving' : 'declining';
}

/**
 * Compute a single fitness score for the entire given window (start to end).
 */
export function computeScoreForWindow(startDate: string, endDate: string): FitnessScore {
  const running = calculateRunningScore(startDate, endDate);
  const gym = calculateGymScore(startDate, endDate);
  const overall = calculateOverallScore(running, gym);

  const db = getDb();
  const historicalScores = db.prepare(`
    SELECT overall_score
    FROM fitness_scores
    WHERE date <= ?
    ORDER BY date DESC
    LIMIT 30
  `).all(endDate) as { overall_score: number | null }[];
  const trend = detectTrend([...historicalScores.map(s => s.overall_score), overall]);

  return {
    date: endDate,
    running_score: running,
    gym_score: gym,
    overall_score: overall,
    trend_direction: trend,
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

  const extStart = new Date(startDate);
  extStart.setDate(extStart.getDate() - LOOKBACK);
  const extStartStr = extStart.toISOString().split('T')[0];

  // Batch fetch: RHR daily averages
  const dailyRHR = db.prepare(`
    SELECT DATE(start_date) as date, AVG(value) as avg_value
    FROM records
    WHERE type = 'HKQuantityTypeIdentifierRestingHeartRate'
      AND start_date >= ? AND start_date <= ?
    GROUP BY DATE(start_date)
  `).all(extStartStr, endDate) as { date: string; avg_value: number }[];

  // Batch fetch: Running workouts
  const runPlaceholders = RUNNING_WORKOUT_TYPES.map(() => '?').join(',');
  const runningWorkouts = db.prepare(`
    SELECT DATE(start_date) as date, duration_minutes, distance_km, avg_heart_rate
    FROM workouts
    WHERE workout_type IN (${runPlaceholders})
      AND start_date >= ? AND start_date <= ?
    ORDER BY start_date ASC
  `).all(...RUNNING_WORKOUT_TYPES, extStartStr, endDate) as {
    date: string;
    duration_minutes: number;
    distance_km: number | null;
    avg_heart_rate: number | null;
  }[];

  // Batch fetch: Gym workouts
  const gymPlaceholders = GYM_WORKOUT_TYPES.map(() => '?').join(',');
  const gymWorkouts = db.prepare(`
    SELECT DATE(start_date) as date, duration_minutes, total_energy_kcal, avg_heart_rate
    FROM workouts
    WHERE workout_type IN (${gymPlaceholders})
      AND start_date >= ? AND start_date <= ?
    ORDER BY start_date ASC
  `).all(...GYM_WORKOUT_TYPES, extStartStr, endDate) as {
    date: string;
    duration_minutes: number;
    total_energy_kcal: number | null;
    avg_heart_rate: number | null;
  }[];

  // Historical scores for trend detection
  const historicalScores = db.prepare(`
    SELECT overall_score FROM fitness_scores
    WHERE date <= ? ORDER BY date DESC LIMIT 30
  `).all(endDate) as { overall_score: number | null }[];

  // Index data into maps
  const rhrMap = new Map<string, number>();
  for (const r of dailyRHR) rhrMap.set(r.date, r.avg_value);

  function getWindowValues(map: Map<string, number>, ws: string, we: string): number[] {
    const vals: number[] = [];
    for (const [date, val] of map) {
      if (date >= ws && date <= we) vals.push(val);
    }
    return vals;
  }

  function scoreRunning(ws: string, we: string): number | null {
    let total = 0, weight = 0;
    const W = RUNNING_SCORE_WEIGHTS;

    // RHR
    const rhrVals = getWindowValues(rhrMap, ws, we);
    if (rhrVals.length > 0) {
      const avgRHR = rhrVals.reduce((a, b) => a + b, 0) / rhrVals.length;
      total += Math.min(100, Math.max(0, ((100 - avgRHR) / 40) * 100)) * W.resting_hr;
      weight += W.resting_hr;
    }

    // Running workouts in window
    const runs = runningWorkouts.filter(w => w.date >= ws && w.date <= we);
    if (runs.length > 0) {
      const runsWithDist = runs.filter(w => w.distance_km && w.distance_km > 0);
      if (runsWithDist.length > 0) {
        const avgPace = runsWithDist.reduce((s, w) => s + w.duration_minutes / w.distance_km!, 0) / runsWithDist.length;
        total += Math.min(100, Math.max(0, ((8 - avgPace) / 4.5) * 100)) * W.pace;
        weight += W.pace;
      }

      const runsWithHR = runs.filter(w => w.avg_heart_rate);
      if (runsWithHR.length > 0) {
        const avgHR = runsWithHR.reduce((s, w) => s + w.avg_heart_rate!, 0) / runsWithHR.length;
        total += Math.min(100, Math.max(0, ((190 - avgHR) / 70) * 100)) * W.running_hr;
        weight += W.running_hr;
      }

      const days = Math.max(1, Math.round((new Date(we).getTime() - new Date(ws).getTime()) / 86400000));
      const weeks = Math.max(1, days / 7);
      total += Math.min(100, (runs.length / weeks / 4) * 100) * W.frequency;
      weight += W.frequency;

      const totalDist = runs.reduce((s, w) => s + (w.distance_km ?? 0), 0);
      total += Math.min(100, (totalDist / weeks / 40) * 100) * W.distance;
      weight += W.distance;
    }

    return weight === 0 ? null : Math.round((total / weight) * 100) / 100;
  }

  function scoreGym(ws: string, we: string): number | null {
    let total = 0, weight = 0;
    const W = GYM_SCORE_WEIGHTS;

    const gyms = gymWorkouts.filter(w => w.date >= ws && w.date <= we);
    if (gyms.length === 0) return null;

    const days = Math.max(1, Math.round((new Date(we).getTime() - new Date(ws).getTime()) / 86400000));
    const weeks = Math.max(1, days / 7);

    total += Math.min(100, (gyms.length / weeks / 4) * 100) * W.frequency;
    weight += W.frequency;

    const withEnergy = gyms.filter(w => w.total_energy_kcal && w.duration_minutes > 0);
    if (withEnergy.length > 0) {
      const avgIntensity = withEnergy.reduce((s, w) => s + w.total_energy_kcal! / w.duration_minutes, 0) / withEnergy.length;
      total += Math.min(100, (avgIntensity / 10) * 100) * W.intensity;
      weight += W.intensity;
    }

    const withHR = gyms.filter(w => w.avg_heart_rate);
    if (withHR.length > 0) {
      const avgHR = withHR.reduce((s, w) => s + w.avg_heart_rate!, 0) / withHR.length;
      total += Math.min(100, Math.max(0, ((avgHR - 80) / 70) * 100)) * W.gym_hr;
      weight += W.gym_hr;
    }

    const avgDuration = gyms.reduce((s, w) => s + w.duration_minutes, 0) / gyms.length;
    total += Math.min(100, (avgDuration / 60) * 100) * W.duration;
    weight += W.duration;

    return weight === 0 ? null : Math.round((total / weight) * 100) / 100;
  }

  // Compute scores for each day in the range
  const scores: FitnessScore[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const recentOverall = historicalScores.map(s => s.overall_score);

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    const ws = new Date(date);
    ws.setDate(ws.getDate() - LOOKBACK);
    const windowStart = ws.toISOString().split('T')[0];

    const running = scoreRunning(windowStart, dateStr);
    const gym = scoreGym(windowStart, dateStr);
    const overall = calculateOverallScore(running, gym);

    const trendInput = [...recentOverall, overall];
    const trend = detectTrend(trendInput);

    scores.push({
      date: dateStr,
      running_score: running,
      gym_score: gym,
      overall_score: overall,
      trend_direction: trend,
      computed_at: new Date().toISOString(),
    });

    recentOverall.unshift(overall);
    if (recentOverall.length > 30) recentOverall.pop();
  }

  return scores;
}
