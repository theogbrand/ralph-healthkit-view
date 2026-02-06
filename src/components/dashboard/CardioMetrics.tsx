'use client';

import type { MetricSummary, DateRange } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface CardioMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
}

export function CardioMetrics({ metrics, dateRange }: CardioMetricsProps) {
  return <CategoryDetail title="Cardio" metrics={metrics} dateRange={dateRange} />;
}
