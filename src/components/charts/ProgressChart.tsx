'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { DashboardData } from '@/types/analytics';

interface ProgressChartProps {
  categories: DashboardData['categories'];
}

function getScoreHex(score: number): string {
  if (score < 50) return '#f87171';
  if (score < 70) return '#fbbf24';
  return '#34d399';
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
      <div className="flex h-[200px] items-center justify-center text-white/60">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.40)' }} stroke="rgba(255,255,255,0.10)" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: 'rgba(255,255,255,0.40)' }} width={70} stroke="rgba(255,255,255,0.10)" />
        <Tooltip
          formatter={(value) => [`${Math.round(Number(value))}/100`, 'Score']}
          contentStyle={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.95)',
          }}
        />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={getScoreHex(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
