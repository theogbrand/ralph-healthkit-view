'use client';

import type { MetricSummary, DateRange } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendChart } from '@/components/charts/TrendChart';
import { formatMetricValue, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';

interface CategoryDetailProps {
  title: string;
  metrics: MetricSummary[];
  dateRange: DateRange;
}

export function CategoryDetail({ title, metrics, dateRange }: CategoryDetailProps) {
  if (!metrics.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No {title.toLowerCase()} data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title} Metrics</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)} {metric.trend}
                </span>
              </div>
              <p className="text-xl font-bold">
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
                  color="#6366f1"
                  showArea
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
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
