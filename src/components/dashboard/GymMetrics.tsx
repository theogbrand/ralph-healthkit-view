'use client';

import type { MetricSummary, DateRange } from '@/types/analytics';
import { CategoryDetail } from './CategoryDetail';

interface GymMetricsProps {
  metrics: MetricSummary[];
  dateRange: DateRange;
}

export function GymMetrics({ metrics, dateRange }: GymMetricsProps) {
  return <CategoryDetail title="Gym" metrics={metrics} dateRange={dateRange} />;
}
