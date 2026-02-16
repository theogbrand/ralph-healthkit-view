'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { DashboardData } from '@/types/analytics';

interface ProgressChartProps {
  categories: DashboardData['categories'];
}

const CATEGORY_COLORS: Record<string, string> = {
  running: '#FA114F',
  gym: '#92E82A',
};

const LABELS: Record<string, string> = {
  running: 'Running',
  gym: 'Gym',
};

export function ProgressChart({ categories }: ProgressChartProps) {
  const data = Object.entries(categories).map(([key, cat]) => ({
    key,
    name: LABELS[key] ?? key,
    score: cat.score ?? 0,
    fill: CATEGORY_COLORS[key] ?? '#007AFF',
  }));

  const hasData = data.some((d) => d.score > 0);
  if (!hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center text-[var(--text-secondary)]">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 13, fill: 'var(--text-secondary)' }}
          width={70}
        />
        <Tooltip
          formatter={(value) => [`${Math.round(Number(value))}/100`, 'Score']}
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
        <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
