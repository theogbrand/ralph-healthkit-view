'use client';

import type { MetricSummary, DateRange } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface RecoveryMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
}

export function RecoveryMetrics({ metrics, dateRange }: RecoveryMetricsProps) {
  return <CategoryDetail title="Recovery" metrics={metrics} dateRange={dateRange} />;
}
