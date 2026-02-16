'use client';

import {
  ResponsiveContainer,
  AreaChart,
  LineChart,
  Area,
  Line,
  XAxis,
  Tooltip,
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
  color = 'var(--apple-ring-red)',
  showArea = true,
}: TrendChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[200px] items-center justify-center apple-caption">
        No trend data available
      </div>
    );
  }

  // Show fewer ticks for shorter ranges
  const tickInterval = dateRange === '30d' ? 6 : dateRange === '60d' ? 13 : dateRange === '90d' ? 14 : 30;

  const Chart = showArea ? AreaChart : LineChart;
  const gradientId = `gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="bg-[var(--apple-card)] rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] p-5">
      <ResponsiveContainer width="100%" height={200}>
        <Chart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            interval={tickInterval}
            tick={{ fontSize: 11, fill: 'var(--apple-text-tertiary)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--apple-card)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '13px',
            }}
            labelFormatter={(label) => formatDateTick(String(label))}
            formatter={(value) => [Number(value).toFixed(1), 'Score']}
          />
          {showArea ? (
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={false}
              strokeLinecap="round"
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
