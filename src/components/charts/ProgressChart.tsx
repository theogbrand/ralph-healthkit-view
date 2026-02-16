'use client';

import type { DashboardData } from '@/types/analytics';

interface ProgressChartProps {
  categories: DashboardData['categories'];
}

function getScoreBarColor(score: number): string {
  if (score < 50) return 'var(--apple-declining)';
  if (score < 70) return 'var(--apple-steps)';
  return 'var(--apple-improving)';
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
      <div className="flex h-[100px] items-center justify-center apple-caption">
        No category data available
      </div>
    );
  }

  return (
    <div className="bg-[var(--apple-card)] rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] p-5 space-y-4">
      {data.map((entry) => (
        <div key={entry.name}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="apple-body">{entry.name}</span>
            <span className="text-[15px] font-semibold text-[var(--apple-text-primary)]">
              {Math.round(entry.score)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--apple-separator)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, entry.score))}%`,
                backgroundColor: getScoreBarColor(entry.score),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
