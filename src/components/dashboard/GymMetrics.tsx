'use client';

import type { MetricSummary, DateRange, WeekComparisonMetric } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface GymMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
  weekComparison?: WeekComparisonMetric[];
}

export function GymMetrics({ metrics, dateRange, weekComparison }: GymMetricsProps) {
  return <CategoryDetail title="Gym" metrics={metrics} dateRange={dateRange} weekComparison={weekComparison} />;
}
