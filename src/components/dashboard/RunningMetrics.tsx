'use client';

import type { MetricSummary, DateRange } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface RunningMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
}

export function RunningMetrics({ metrics, dateRange }: RunningMetricsProps) {
  return <CategoryDetail title="Running" metrics={metrics} dateRange={dateRange} />;
}
