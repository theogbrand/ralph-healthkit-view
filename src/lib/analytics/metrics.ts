import type { DateRange, MetricSummary } from '@/types/analytics';
import { HEALTH_TYPE_MAP } from '@/config/metrics';
import { getDateRangeBounds, formatDateISO } from '@/lib/utils/date-helpers';
import { getDailyAverageByType, getDailySumByType, getLatestRecordByType } from '@/lib/db/queries';

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
