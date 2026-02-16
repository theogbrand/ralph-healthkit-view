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

  let badgeBg = 'bg-[#8E8E93]/[0.12]';
  let badgeText = 'text-[#8E8E93]';
  if (isImproving === true) {
    badgeBg = 'bg-[#34C759]/[0.12]';
    badgeText = 'text-[#34C759]';
  } else if (isImproving === false) {
    badgeBg = 'bg-[#FF3B30]/[0.12]';
    badgeText = 'text-[#FF3B30]';
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-[13px] text-[#8E8E93]">{label}</CardTitle>
        <p className="text-[22px] font-semibold tabular-nums">
          {thisWeek != null ? formatMetricValue(thisWeek, unit) : '--'}
        </p>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-[13px] text-[#8E8E93]">
          Last week: {lastWeek != null ? formatMetricValue(lastWeek, unit) : '--'}
        </span>
        {deltaPercent != null && (
          <span className={`rounded-xl px-2 py-0.5 text-[12px] font-medium ${badgeBg} ${badgeText}`}>
            {arrow} {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
          </span>
        )}
      </CardContent>
    </Card>
  );
}
