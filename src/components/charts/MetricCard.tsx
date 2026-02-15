'use client';

import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMetricValue, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';
import { ACCENT } from '@/lib/utils/chart-colors';

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  sparklineData?: number[];
  interactive?: boolean;
  active?: boolean;
}

export function MetricCard({ title, value, unit, trend, sparklineData, interactive, active }: MetricCardProps) {
  return (
    <Card
      variant={interactive ? 'interactive' : undefined}
      data-state={active ? 'active' : undefined}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold font-mono tabular-nums">
              {value !== null ? formatMetricValue(value, unit) : '--'}
            </p>
            <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)} {trend}
            </p>
          </div>
          {sparklineData && sparklineData.length > 1 && (
            <div className="h-[32px] w-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.map((v, i) => ({ i, v }))}>
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={ACCENT}
                    strokeWidth={1.5}
                    fill="url(#sparklineGrad)"
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
