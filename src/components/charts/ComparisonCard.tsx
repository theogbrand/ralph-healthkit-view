'use client';

import type { WeekComparisonMetric } from '@/types/analytics';
import { formatMetricValue } from '@/lib/utils/formatters';

interface ComparisonCardProps {
  metric: WeekComparisonMetric;
}

export function ComparisonCard({ metric }: ComparisonCardProps) {
  const { label, unit, thisWeek, lastWeek, deltaPercent, higherIsBetter } = metric;

  const isImproving = deltaPercent != null
    ? higherIsBetter ? deltaPercent > 0 : deltaPercent < 0
    : null;

  const deltaTextColor = isImproving === null
    ? 'text-[var(--apple-text-secondary)]'
    : isImproving ? 'text-[var(--apple-improving)]' : 'text-[var(--apple-declining)]';

  const deltaBgColor = isImproving === null
    ? 'bg-[var(--apple-stable)]/10'
    : isImproving ? 'bg-[var(--apple-improving)]/10' : 'bg-[var(--apple-declining)]/10';

  const arrow = deltaPercent != null
    ? (deltaPercent > 0 ? '↑' : deltaPercent < 0 ? '↓' : '→')
    : '';

  return (
    <div className="min-w-[160px] snap-start bg-[var(--apple-card)] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="apple-caption mb-1">{label}</p>
      <p className="text-[22px] font-semibold text-[var(--apple-text-primary)]">
        {thisWeek != null ? formatMetricValue(thisWeek, unit) : '--'}
      </p>
      <p className="apple-caption mt-1">
        last week: {lastWeek != null ? formatMetricValue(lastWeek, unit) : '--'}
      </p>
      {deltaPercent != null && (
        <span className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${deltaTextColor} ${deltaBgColor}`}>
          {arrow} {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
        </span>
      )}
    </div>
  );
}
