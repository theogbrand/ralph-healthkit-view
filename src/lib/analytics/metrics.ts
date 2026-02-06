import type { DateRange, MetricSummary } from '@/types/analytics';
import { HEALTH_TYPE_MAP, RUNNING_WORKOUT_TYPES, GYM_WORKOUT_TYPES } from '@/config/metrics';
import { getDateRangeBounds, formatDateISO } from '@/lib/utils/date-helpers';
import { getDailyAverageByType, getDailySumByType, getLatestRecordByType, getWorkoutsByType, getWeeklyWorkoutSummary, getRunningWorkoutsWithDistance, getWeeklyRunningDistance } from '@/lib/db/queries';

// Types that should use SUM aggregation (cumulative daily metrics)
const SUM_TYPES = new Set([
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierBasalEnergyBurned',
  'HKQuantityTypeIdentifierAppleExerciseTime',
  'HKQuantityTypeIdentifierAppleStandTime',
  'HKQuantityTypeIdentifierAppleMoveTime',
  'HKQuantityTypeIdentifierFlightsClimbed',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
]);

function getDailyValues(type: string, start: string, end: string): { date: string; value: number }[] {
  if (SUM_TYPES.has(type)) {
    return getDailySumByType(type, start, end).map(r => ({ date: r.date, value: r.total_value }));
  }
  return getDailyAverageByType(type, start, end).map(r => ({ date: r.date, value: r.avg_value }));
}

function computeTrend(values: number[]): 'improving' | 'stable' | 'declining' {
  if (values.length < 2) return 'stable';
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const changePct = avgFirst === 0 ? 0 : ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100;
  if (changePct > 5) return 'improving';
  if (changePct < -5) return 'declining';
  return 'stable';
}

export function getMetricSummary(type: string, dateRange: DateRange): MetricSummary {
  const meta = HEALTH_TYPE_MAP[type];
  const label = meta?.readable ?? type;
  const unit = meta?.unit ?? '';
  const { start, end } = getDateRangeBounds(dateRange);

  const dailyValues = getDailyValues(type, start, end);
  const values = dailyValues.map(d => d.value);

  if (values.length === 0) {
    const latest = getLatestRecordByType(type);
    return {
      label,
      value: latest?.value ?? null,
      unit,
      trend: 'stable',
      change_percent: null,
      sparkline_data: [],
    };
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const trend = computeTrend(values);

  // Change percent: compare last 25% vs first 25% of the period
  const q = Math.max(1, Math.floor(values.length / 4));
  const earlyAvg = values.slice(0, q).reduce((a, b) => a + b, 0) / q;
  const lateAvg = values.slice(-q).reduce((a, b) => a + b, 0) / q;
  const change_percent = earlyAvg === 0 ? null : Math.round(((lateAvg - earlyAvg) / Math.abs(earlyAvg)) * 100);

  return {
    label,
    value: Math.round(avg * 100) / 100,
    unit,
    trend,
    change_percent,
    sparkline_data: values,
  };
}

export function getCategoryMetrics(category: string, dateRange: DateRange): MetricSummary[] {
  const types = Object.entries(HEALTH_TYPE_MAP)
    .filter(([, meta]) => meta.category === category)
    .map(([type]) => type);

  return types.map(type => getMetricSummary(type, dateRange));
}

export function getSparklineData(type: string, days: number): number[] {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const dailyValues = getDailyValues(type, formatDateISO(start), formatDateISO(end));
  return dailyValues.map(d => d.value);
}

function computeChangePercent(values: number[]): number | null {
  if (values.length < 2) return null;
  const q = Math.max(1, Math.floor(values.length / 4));
  const earlyAvg = values.slice(0, q).reduce((a, b) => a + b, 0) / q;
  const lateAvg = values.slice(-q).reduce((a, b) => a + b, 0) / q;
  return earlyAvg === 0 ? null : Math.round(((lateAvg - earlyAvg) / Math.abs(earlyAvg)) * 100);
}

/**
 * For metrics where lower = improving (pace, HR), invert the trend logic
 */
function computeTrendInverted(values: number[]): 'improving' | 'stable' | 'declining' {
  const raw = computeTrend(values);
  if (raw === 'improving') return 'declining';
  if (raw === 'declining') return 'improving';
  return 'stable';
}

export function getRunningMetrics(dateRange: DateRange): MetricSummary[] {
  const { start, end } = getDateRangeBounds(dateRange);
  const workoutsWithDist = getRunningWorkoutsWithDistance(start, end);
  const weeklySummary = getWeeklyWorkoutSummary(RUNNING_WORKOUT_TYPES, start, end);

  // duration_minutes is stored in hours due to a parser bug (duration_seconds / 60 / 60).
  // Multiply by 60 to get actual minutes.
  const DURATION_CORRECTION = 60;

  // 1. Avg Pace (min/km) — lower = improving
  const runsWithDistance = workoutsWithDist.filter(w => w.computed_distance_km && w.computed_distance_km > 0);
  const paceValues = runsWithDistance.map(w => (w.duration_minutes * DURATION_CORRECTION) / w.computed_distance_km!);
  const avgPace = paceValues.length > 0 ? paceValues.reduce((a, b) => a + b, 0) / paceValues.length : null;
  const paceSummary: MetricSummary = {
    label: 'Avg Pace',
    value: avgPace ? Math.round(avgPace * 100) / 100 : null,
    unit: 'min/km',
    trend: paceValues.length > 0 ? computeTrendInverted(paceValues) : 'stable',
    change_percent: paceValues.length > 0 ? computeChangePercent(paceValues) : null,
    sparkline_data: paceValues,
  };

  // 2. Avg Heart Rate during runs — lower = improving
  const runsWithHR = workoutsWithDist.filter(w => w.avg_heart_rate);
  const hrValues = runsWithHR.map(w => w.avg_heart_rate!);
  const avgHR = hrValues.length > 0 ? hrValues.reduce((a, b) => a + b, 0) / hrValues.length : null;
  const hrSummary: MetricSummary = {
    label: 'Avg Heart Rate (Runs)',
    value: avgHR ? Math.round(avgHR) : null,
    unit: 'bpm',
    trend: hrValues.length > 0 ? computeTrendInverted(hrValues) : 'stable',
    change_percent: hrValues.length > 0 ? computeChangePercent(hrValues) : null,
    sparkline_data: hrValues,
  };

  // 3. Resting Heart Rate — from records table
  const rhrData = getDailyAverageByType('HKQuantityTypeIdentifierRestingHeartRate', start, end);
  const rhrValues = rhrData.map(d => d.avg_value);
  const avgRHR = rhrValues.length > 0 ? rhrValues.reduce((a, b) => a + b, 0) / rhrValues.length : null;
  const rhrSummary: MetricSummary = {
    label: 'Resting Heart Rate',
    value: avgRHR ? Math.round(avgRHR) : null,
    unit: 'bpm',
    trend: rhrValues.length > 0 ? computeTrendInverted(rhrValues) : 'stable',
    change_percent: rhrValues.length > 0 ? computeChangePercent(rhrValues) : null,
    sparkline_data: rhrValues,
  };

  // 4. Runs per Week — higher = improving
  const weeklyRunCounts = weeklySummary.map(w => w.count);
  const avgRunsPerWeek = weeklyRunCounts.length > 0 ? weeklyRunCounts.reduce((a, b) => a + b, 0) / weeklyRunCounts.length : null;
  const runsPerWeekSummary: MetricSummary = {
    label: 'Runs per Week',
    value: avgRunsPerWeek ? Math.round(avgRunsPerWeek * 10) / 10 : null,
    unit: 'count',
    trend: weeklyRunCounts.length > 0 ? computeTrend(weeklyRunCounts) : 'stable',
    change_percent: weeklyRunCounts.length > 0 ? computeChangePercent(weeklyRunCounts) : null,
    sparkline_data: weeklyRunCounts,
  };

  // 5. Weekly Distance — computed from records table correlated with workout windows
  const weeklyRunDist = getWeeklyRunningDistance(start, end);
  const weeklyDistances = weeklyRunDist.map(w => w.total_distance);
  const avgWeeklyDist = weeklyDistances.length > 0 ? weeklyDistances.reduce((a, b) => a + b, 0) / weeklyDistances.length : null;
  const distanceSummary: MetricSummary = {
    label: 'Weekly Distance',
    value: avgWeeklyDist ? Math.round(avgWeeklyDist * 10) / 10 : null,
    unit: 'km',
    trend: weeklyDistances.length > 0 ? computeTrend(weeklyDistances) : 'stable',
    change_percent: weeklyDistances.length > 0 ? computeChangePercent(weeklyDistances) : null,
    sparkline_data: weeklyDistances,
  };

  return [paceSummary, hrSummary, rhrSummary, runsPerWeekSummary, distanceSummary];
}

export function getGymMetrics(dateRange: DateRange): MetricSummary[] {
  const { start, end } = getDateRangeBounds(dateRange);
  const workouts = getWorkoutsByType(GYM_WORKOUT_TYPES, start, end);
  const weeklySummary = getWeeklyWorkoutSummary(GYM_WORKOUT_TYPES, start, end);

  // duration_minutes is stored in hours due to parser bug; multiply by 60 for actual minutes
  const DURATION_CORRECTION = 60;

  // 1. Workouts per Week — higher = improving
  const weeklyCounts = weeklySummary.map(w => w.count);
  const avgPerWeek = weeklyCounts.length > 0 ? weeklyCounts.reduce((a, b) => a + b, 0) / weeklyCounts.length : null;
  const freqSummary: MetricSummary = {
    label: 'Workouts per Week',
    value: avgPerWeek ? Math.round(avgPerWeek * 10) / 10 : null,
    unit: 'count',
    trend: weeklyCounts.length > 0 ? computeTrend(weeklyCounts) : 'stable',
    change_percent: weeklyCounts.length > 0 ? computeChangePercent(weeklyCounts) : null,
    sparkline_data: weeklyCounts,
  };

  // 2. Avg Duration — higher = improving (corrected to actual minutes)
  const durations = workouts.map(w => w.duration_minutes * DURATION_CORRECTION);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
  const durationSummary: MetricSummary = {
    label: 'Avg Duration',
    value: avgDuration ? Math.round(avgDuration) : null,
    unit: 'min',
    trend: durations.length > 0 ? computeTrend(durations) : 'stable',
    change_percent: durations.length > 0 ? computeChangePercent(durations) : null,
    sparkline_data: durations,
  };

  // 3. Avg Intensity (kcal/min) — higher = improving (corrected duration)
  const withEnergy = workouts.filter(w => w.total_energy_kcal && w.duration_minutes > 0);
  const intensityValues = withEnergy.map(w => w.total_energy_kcal! / (w.duration_minutes * DURATION_CORRECTION));
  const avgIntensity = intensityValues.length > 0 ? intensityValues.reduce((a, b) => a + b, 0) / intensityValues.length : null;
  const intensitySummary: MetricSummary = {
    label: 'Avg Intensity',
    value: avgIntensity ? Math.round(avgIntensity * 10) / 10 : null,
    unit: 'kcal/min',
    trend: intensityValues.length > 0 ? computeTrend(intensityValues) : 'stable',
    change_percent: intensityValues.length > 0 ? computeChangePercent(intensityValues) : null,
    sparkline_data: intensityValues,
  };

  // 4. Avg Heart Rate during gym — higher = improving (working harder)
  const withHR = workouts.filter(w => w.avg_heart_rate);
  const gymHRValues = withHR.map(w => w.avg_heart_rate!);
  const avgGymHR = gymHRValues.length > 0 ? gymHRValues.reduce((a, b) => a + b, 0) / gymHRValues.length : null;
  const gymHRSummary: MetricSummary = {
    label: 'Avg Heart Rate (Gym)',
    value: avgGymHR ? Math.round(avgGymHR) : null,
    unit: 'bpm',
    trend: gymHRValues.length > 0 ? computeTrend(gymHRValues) : 'stable',
    change_percent: gymHRValues.length > 0 ? computeChangePercent(gymHRValues) : null,
    sparkline_data: gymHRValues,
  };

  return [freqSummary, durationSummary, intensitySummary, gymHRSummary];
}
