'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { DashboardData } from '@/types/analytics';

interface ProgressChartProps {
  categories: DashboardData['categories'];
}

function getScoreHex(score: number): string {
  if (score < 50) return '#ef4444';
  if (score < 70) return '#eab308';
  return '#22c55e';
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
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fontWeight: 700 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 700 }} width={70} />
        <Tooltip formatter={(value) => [`${Math.round(Number(value))}/100`, 'Score']} />
        <Bar dataKey="score" radius={0} barSize={28} stroke="#1a1a1a" strokeWidth={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={getScoreHex(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
