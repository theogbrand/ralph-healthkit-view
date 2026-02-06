'use client';

import type { MetricSummary, DateRange } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface ActivityMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
}

export function ActivityMetrics({ metrics, dateRange }: ActivityMetricsProps) {
  return <CategoryDetail title="Activity" metrics={metrics} dateRange={dateRange} />;
}
