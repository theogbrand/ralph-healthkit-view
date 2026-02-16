'use client';

import type { MetricSummary, DateRange, WeekComparisonMetric } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendChart } from '@/components/charts/TrendChart';
import { ComparisonCard } from '@/components/charts/ComparisonCard';
import { formatMetricValue, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';

interface CategoryDetailProps {
  title: string;
  metrics: MetricSummary[];
  dateRange: DateRange;
  weekComparison?: WeekComparisonMetric[];
}

export function CategoryDetail({ title, metrics, dateRange, weekComparison }: CategoryDetailProps) {
  const EMPTY_MESSAGES: Record<string, string> = {
    Running: 'No runs recorded in this period',
    Gym: 'No gym workouts recorded in this period',
  };

  const allEmpty = metrics.every((m) => m.value === null && m.sparkline_data.length === 0);
  if (!metrics.length || allEmpty) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-[var(--text-secondary)]">
          {EMPTY_MESSAGES[title] ?? `No ${title.toLowerCase()} data available`}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      {weekComparison && weekComparison.length > 0 && (
        <>
          <h3 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
            This Week vs Last Week
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weekComparison.map((m) => (
              <ComparisonCard key={m.label} metric={m} />
            ))}
          </div>
          <div className="border-t border-[var(--separator)]" />
        </>
      )}
      <h3 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
        {title} Metrics
      </h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{metric.label}</CardTitle>
                <span className={`text-[13px] font-medium ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)} {metric.trend}
                </span>
              </div>
              <p className="text-[28px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                {metric.value !== null ? formatMetricValue(metric.value, metric.unit) : '—'}
              </p>
              {metric.change_percent !== null && (
                <p className="text-[13px] text-[var(--text-secondary)]">
                  {metric.change_percent > 0 ? '+' : ''}{metric.change_percent}% over period
                </p>
              )}
            </CardHeader>
            <CardContent>
              {metric.sparkline_data.length > 1 ? (
                <TrendChart
                  data={metric.sparkline_data.map((value, i) => ({
                    date: new Date(Date.now() - (metric.sparkline_data.length - 1 - i) * 86400000)
                      .toISOString()
                      .slice(0, 10),
                    value,
                  }))}
                  dateRange={dateRange}
                  color="#007AFF"
                  showArea
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-[var(--text-secondary)]">
                  Not enough data for chart
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
