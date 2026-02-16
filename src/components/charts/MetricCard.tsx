'use client';

import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMetricValue } from '@/lib/utils/formatters';

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  sparklineData?: number[];
}

function getTrendChevron(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '▲';
    case 'stable': return '●';
    case 'declining': return '▼';
  }
}

function getTrendCssColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return 'var(--ring-exercise)';
    case 'stable': return 'var(--muted-foreground)';
    case 'declining': return 'var(--ring-move)';
  }
}

export function MetricCard({ title, value, unit, trend, sparklineData }: MetricCardProps) {
  const trendColor = getTrendCssColor(trend);

  return (
    <Card className="hover:-translate-y-px hover:shadow-[0_2px_6px_oklch(0_0_0/0.06),0_8px_20px_oklch(0_0_0/0.04)] active:translate-y-0 active:scale-[0.99]">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {value !== null ? formatMetricValue(value, unit) : '--'}
              {unit && unit !== 'score' && unit !== 'count' && value !== null && (
                <span className="ml-1 text-sm font-normal text-muted-foreground" />
              )}
            </p>
            <div className="mt-1 flex items-center gap-1" style={{ color: trendColor }}>
              <span className="text-[10px]">{getTrendChevron(trend)}</span>
              <span className="text-xs font-medium capitalize">{trend}</span>
            </div>
          </div>
          {sparklineData && sparklineData.length > 1 && (
            <div className="h-[50px] w-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.map((v, i) => ({ i, v }))}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-blue)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--chart-blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--chart-blue)"
                    strokeWidth={1.5}
                    fill="url(#sparkGrad)"
                    dot={false}
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
