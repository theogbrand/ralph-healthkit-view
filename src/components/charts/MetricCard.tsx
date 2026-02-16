'use client';

import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMetricValue, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  sparklineData?: number[];
  color?: string;
}

export function MetricCard({ title, value, unit, trend, sparklineData, color }: MetricCardProps) {
  const sparkColor = color ? `${color}80` : '#8E8E93';

  return (
    <Card className="cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      <CardHeader>
        <CardTitle className="text-[17px] font-semibold tracking-[-0.2px]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[28px] font-bold tracking-[-0.3px] tabular-nums">
              {value !== null ? formatMetricValue(value, unit) : '--'}
            </p>
            <p className={`mt-1 text-[13px] font-medium ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)} {trend}
            </p>
          </div>
          {sparklineData && sparklineData.length > 1 && (
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.map((v, i) => ({ i, v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={sparkColor}
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
