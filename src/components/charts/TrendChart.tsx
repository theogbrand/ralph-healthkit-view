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
  color = '#007AFF',
  showArea = true,
}: TrendChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-[13px] text-[#8E8E93]">
        Not enough data yet
      </div>
    );
  }

  // Show fewer ticks for shorter ranges
  const tickInterval = dateRange === '30d' ? 6 : dateRange === '60d' ? 13 : dateRange === '90d' ? 14 : 30;

  const gradientId = `gradient-${color.replace('#', '')}`;
  const Chart = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Chart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          interval={tickInterval}
          tick={{ fontSize: 12, fill: '#8E8E93' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#8E8E93' }}
          width={40}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '8px 12px' }}
          labelStyle={{ fontSize: 13, color: '#8E8E93', marginBottom: 4 }}
          itemStyle={{ fontSize: 13 }}
          labelFormatter={(label) => formatDateTick(String(label))}
          formatter={(value) => [Number(value).toFixed(1), 'Value']}
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
