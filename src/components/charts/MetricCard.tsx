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
}

export function MetricCard({ title, value, unit, trend, sparklineData }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">
              {value !== null ? formatMetricValue(value, unit) : '--'}
            </p>
            <p className={`mt-1 text-sm font-medium ${getTrendColor(trend)}`}>
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
                    stroke="#6b7280"
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
