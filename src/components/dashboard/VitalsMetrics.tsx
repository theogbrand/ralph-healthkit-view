'use client';

import type { MetricSummary, DateRange } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface VitalsMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
}

export function VitalsMetrics({ metrics, dateRange }: VitalsMetricsProps) {
  return <CategoryDetail title="Body" metrics={metrics} dateRange={dateRange} />;
}
