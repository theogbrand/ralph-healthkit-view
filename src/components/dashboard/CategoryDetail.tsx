'use client';

import type { MetricSummary, DateRange, WeekComparisonMetric } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendChart } from '@/components/charts/TrendChart';
import { ComparisonCard } from '@/components/charts/ComparisonCard';
import { formatMetricValue } from '@/lib/utils/formatters';

interface CategoryDetailProps {
  title: string;
  metrics: MetricSummary[];
  dateRange: DateRange;
  weekComparison?: WeekComparisonMetric[];
}

function getTrendCssColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return 'var(--ring-exercise)';
    case 'stable': return 'var(--muted-foreground)';
    case 'declining': return 'var(--ring-move)';
  }
}

function getTrendChevron(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '▲';
    case 'stable': return '●';
    case 'declining': return '▼';
  }
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
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {EMPTY_MESSAGES[title] ?? `No ${title.toLowerCase()} data available`}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {weekComparison && weekComparison.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            This Week vs Last Week
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {weekComparison.map((m) => (
              <ComparisonCard key={m.label} metric={m} />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title} Metrics
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {metrics.map((metric) => {
            const trendColor = getTrendCssColor(metric.trend);
            return (
              <Card key={metric.label}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                    <div className="flex items-center gap-1" style={{ color: trendColor }}>
                      <span className="text-[10px]">{getTrendChevron(metric.trend)}</span>
                      <span className="text-xs font-medium capitalize">{metric.trend}</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {metric.value !== null ? formatMetricValue(metric.value, metric.unit) : '--'}
                  </p>
                  {metric.change_percent !== null && (
                    <p className="text-xs text-muted-foreground">
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
                      color="var(--chart-blue)"
                    />
                  ) : (
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                      Not enough data for chart
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
