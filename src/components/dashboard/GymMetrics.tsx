'use client';

import type { MetricSummary, DateRange, WeekComparisonMetric } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface GymMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
  weekComparison?: WeekComparisonMetric[];
  color?: string;
}

export function GymMetrics({ metrics, dateRange, weekComparison, color }: GymMetricsProps) {
  return <CategoryDetail title="Gym" metrics={metrics} dateRange={dateRange} weekComparison={weekComparison} color={color} />;
}
