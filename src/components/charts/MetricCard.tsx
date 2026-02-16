'use client';

import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMetricValue, getTrendIcon } from '@/lib/utils/formatters';

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  sparklineData?: number[];
}

function getTrendBadgeColors(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return { bg: 'rgba(52, 199, 89, 0.1)', text: '#34C759' };
    case 'declining':
      return { bg: 'rgba(255, 59, 48, 0.1)', text: '#FF3B30' };
    case 'stable':
      return { bg: 'rgba(134, 134, 139, 0.1)', text: '#86868B' };
  }
}

export function MetricCard({ title, value, unit, trend, sparklineData }: MetricCardProps) {
  const trendColors = getTrendBadgeColors(trend);

  return (
    <Card className="transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.08)] hover:-translate-y-px">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[28px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
              {value !== null ? formatMetricValue(value, unit) : '—'}
            </p>
            <span
              className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium"
              style={{ backgroundColor: trendColors.bg, color: trendColors.text }}
            >
              {getTrendIcon(trend)} {trend}
            </span>
          </div>
          {sparklineData && sparklineData.length > 1 && (
            <div className="h-6 w-20 opacity-30">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.map((v, i) => ({ i, v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="var(--text-secondary)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
