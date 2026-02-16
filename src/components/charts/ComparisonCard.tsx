'use client';

import type { WeekComparisonMetric } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMetricValue } from '@/lib/utils/formatters';

interface ComparisonCardProps {
  metric: WeekComparisonMetric;
}

export function ComparisonCard({ metric }: ComparisonCardProps) {
  const { label, unit, thisWeek, lastWeek, deltaPercent, higherIsBetter } = metric;

  const isImproving = deltaPercent != null
    ? higherIsBetter ? deltaPercent > 0 : deltaPercent < 0
    : null;

  const deltaColor = isImproving === null
    ? 'text-white/50'
    : isImproving ? 'text-emerald-400' : 'text-red-400';

  const arrow = deltaPercent != null
    ? (deltaPercent > 0 ? '↑' : deltaPercent < 0 ? '↓' : '→')
    : '';

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-white/60">{label}</CardTitle>
        <p className="text-2xl font-bold text-white">
          {thisWeek != null ? formatMetricValue(thisWeek, unit) : '--'}
        </p>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm text-white/50">
          Last week: {lastWeek != null ? formatMetricValue(lastWeek, unit) : '--'}
        </span>
        {deltaPercent != null && (
          <span className={`text-sm font-semibold ${deltaColor}`}>
            {arrow} {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
          </span>
        )}
      </CardContent>
    </Card>
  );
}
