'use client';

import {
  ResponsiveContainer,
  AreaChart,
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { DateRange } from '@/types/analytics';

interface TrendChartProps {
  data: Array<{ date: string; value: number }>;
  dateRange: DateRange;
  color?: string;
  showArea?: boolean;
}

function formatDateTick(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TrendChart({
  data,
  dateRange,
  color = '#3b82f6',
  showArea = true,
}: TrendChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  // Show fewer ticks for shorter ranges
  const tickInterval = dateRange === '30d' ? 6 : dateRange === '60d' ? 13 : dateRange === '90d' ? 14 : 30;

  const Chart = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          interval={tickInterval}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} width={40} />
        <Tooltip
          labelFormatter={(label) => formatDateTick(String(label))}
          formatter={(value) => [Number(value).toFixed(1), 'Value']}
        />
        {showArea ? (
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={3}
          />
        ) : (
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={false}
          />
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
