'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { DashboardData } from '@/types/analytics';
import { getScoreHex } from '@/lib/utils/formatters';

interface ProgressChartProps {
  categories: DashboardData['categories'];
}

const LABELS: Record<string, string> = {
  running: 'Running',
  gym: 'Gym',
};

export function ProgressChart({ categories }: ProgressChartProps) {
  const data = Object.entries(categories).map(([key, cat]) => ({
    name: LABELS[key] ?? key,
    score: cat.score ?? 0,
  }));

  const hasData = data.some((d) => d.score > 0);
  if (!hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center text-[13px] text-[#8E8E93]">
        Not enough data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 13, fill: '#8E8E93' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 13, fill: '#8E8E93' }}
          width={70}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '8px 12px' }}
          labelStyle={{ fontSize: 13, color: '#8E8E93', marginBottom: 4 }}
          itemStyle={{ fontSize: 13 }}
          formatter={(value) => [`${Math.round(Number(value))}/100`, 'Score']}
        />
        <Bar
          dataKey="score"
          radius={[8, 8, 8, 8]}
          barSize={28}
          background={{ fill: 'rgba(0,0,0,0.04)', radius: 8 }}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={getScoreHex(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
