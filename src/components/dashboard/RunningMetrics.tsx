'use client';

import type { MetricSummary, DateRange, WeekComparisonMetric } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface RunningMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
  weekComparison?: WeekComparisonMetric[];
}

export function RunningMetrics({ metrics, dateRange, weekComparison }: RunningMetricsProps) {
  return <CategoryDetail title="Running" metrics={metrics} dateRange={dateRange} weekComparison={weekComparison} />;
}
