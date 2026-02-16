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

  const chevron = deltaPercent != null
    ? (deltaPercent > 0 ? '▲' : deltaPercent < 0 ? '▼' : '●')
    : '';

  // Color and badge styles
  const badgeStyle = isImproving === null
    ? { color: 'var(--muted-foreground)', bg: 'var(--muted)' }
    : isImproving
      ? { color: 'var(--ring-exercise)', bg: 'oklch(0.72 0.22 145 / 0.1)' }
      : { color: 'var(--ring-move)', bg: 'oklch(0.65 0.27 12 / 0.1)' };

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <p className="text-2xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {thisWeek != null ? formatMetricValue(thisWeek, unit) : '--'}
        </p>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Last week: {lastWeek != null ? formatMetricValue(lastWeek, unit) : '--'}
        </span>
        {deltaPercent != null && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
              color: badgeStyle.color,
              backgroundColor: badgeStyle.bg,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span className="text-[9px]">{chevron}</span>
            {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
          </span>
        )}
      </CardContent>
    </Card>
  );
}
