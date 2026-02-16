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

  const arrow = deltaPercent != null
    ? (deltaPercent > 0 ? '↑' : deltaPercent < 0 ? '↓' : '→')
    : '';

  const getDeltaBadgeColors = () => {
    if (isImproving === null) return { bg: 'rgba(134, 134, 139, 0.1)', text: '#86868B' };
    if (isImproving) return { bg: 'rgba(52, 199, 89, 0.1)', text: '#34C759' };
    return { bg: 'rgba(255, 59, 48, 0.1)', text: '#FF3B30' };
  };

  const badgeColors = getDeltaBadgeColors();

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle>{label}</CardTitle>
        <p className="text-[28px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
          {thisWeek != null ? formatMetricValue(thisWeek, unit) : '—'}
        </p>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--text-secondary)]">
          vs last week: {lastWeek != null ? formatMetricValue(lastWeek, unit) : '—'}
        </span>
        {deltaPercent != null && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-medium"
            style={{ backgroundColor: badgeColors.bg, color: badgeColors.text }}
          >
            {arrow} {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
          </span>
        )}
      </CardContent>
    </Card>
  );
}
