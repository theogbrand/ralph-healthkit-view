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
  color = '#00D4FF',
  showArea = true,
}: TrendChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-[var(--text-secondary)]">
        No trend data available
      </div>
    );
  }

  const tickInterval = dateRange === '30d' ? 6 : dateRange === '60d' ? 13 : dateRange === '90d' ? 14 : 30;
  const gradientId = `gradient-${color.replace('#', '')}`;

  const Chart = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Chart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="4 4"
          stroke="var(--separator)"
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          interval={tickInterval}
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          width={40}
        />
        <Tooltip
          labelFormatter={(label) => formatDateTick(String(label))}
          formatter={(value) => [Number(value).toFixed(1), 'Value']}
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
        {showArea ? (
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
          />
        ) : (
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
