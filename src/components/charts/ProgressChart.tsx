'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { DashboardData } from '@/types/analytics';

interface ProgressChartProps {
  categories: DashboardData['categories'];
}

/* Monet-palette score colors: rose madder → golden ochre → Giverny green */
function getScoreHex(score: number): string {
  if (score < 50) return '#c06070';
  if (score < 70) return '#c49a40';
  return '#6a9e6a';
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
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 13 }} width={70} />
        <Tooltip formatter={(value) => [`${Math.round(Number(value))}/100`, 'Score']} />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={getScoreHex(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
