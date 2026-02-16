'use client';

import type { MetricSummary, DateRange, WeekComparisonMetric } from '@/types/analytics';
import { ComparisonCard } from '@/components/charts/ComparisonCard';
import { formatMetricValue, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface CategoryDetailProps {
  title: string;
  metrics: MetricSummary[];
  dateRange: DateRange;
  weekComparison?: WeekComparisonMetric[];
}

export function CategoryDetail({ title, metrics, weekComparison }: CategoryDetailProps) {
  const EMPTY_MESSAGES: Record<string, string> = {
    Running: 'No runs recorded in this period',
    Gym: 'No gym workouts recorded in this period',
  };

  const allEmpty = metrics.every((m) => m.value === null && m.sparkline_data.length === 0);
  if (!metrics.length || allEmpty) {
    return (
      <div className="py-6 text-center apple-caption">
        {EMPTY_MESSAGES[title] ?? `No ${title.toLowerCase()} data available`}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week Comparison — horizontal scroll */}
      {weekComparison && weekComparison.length > 0 && (
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory -mx-1 px-1">
          {weekComparison.map((m) => (
            <ComparisonCard key={m.label} metric={m} />
          ))}
        </div>
      )}

      {/* Metrics List — iOS-style grouped rows */}
      <div className="bg-[var(--apple-card)] rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        {metrics.map((metric, idx) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between px-5 py-3">
              {/* Label */}
              <span className="apple-body flex-1">{metric.label}</span>
              {/* Inline sparkline */}
              {metric.sparkline_data.length > 1 && (
                <div className="h-5 w-10 mx-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metric.sparkline_data.map((v, i) => ({ i, v }))}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="var(--apple-text-tertiary)"
                        strokeWidth={1}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {/* Value + trend */}
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-[var(--apple-text-primary)]">
                  {metric.value !== null ? formatMetricValue(metric.value, metric.unit) : '--'}
                </span>
                <span className={`text-[13px] ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)}
                </span>
              </div>
            </div>
            {/* Separator */}
            {idx < metrics.length - 1 && (
              <div className="mx-5 h-px bg-[var(--apple-separator)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
