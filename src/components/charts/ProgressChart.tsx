'use client';

import type { DashboardData } from '@/types/analytics';

interface ProgressChartProps {
  categories: DashboardData['categories'];
}

function getScoreCssColor(score: number): string {
  if (score < 50) return 'var(--ring-move)';
  if (score < 70) return 'var(--chart-amber)';
  return 'var(--ring-exercise)';
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
      <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
        No category data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((entry) => {
        const color = getScoreCssColor(entry.score);
        return (
          <div key={entry.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{entry.name}</span>
              <span className="font-semibold" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(entry.score)}
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: color, opacity: 0.08 }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(entry.score, 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
