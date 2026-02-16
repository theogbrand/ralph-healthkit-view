'use client';

import { useState } from 'react';
import type { DashboardData, DateRange } from '@/types/analytics';
import { Card, CardContent } from '@/components/ui/card';
import { FitnessScore } from '@/components/charts/FitnessScore';
import { MetricCard } from '@/components/charts/MetricCard';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { TrendChart } from '@/components/charts/TrendChart';

import { RunningMetrics } from './RunningMetrics';
import { GymMetrics } from './GymMetrics';

type ApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
};

interface OverviewProps {
  data: ApiResponse;
  dateRange: DateRange;
}

const CATEGORY_CONFIG = [
  { key: 'running' as const, label: 'Running', Component: RunningMetrics },
  { key: 'gym' as const, label: 'Gym', Component: GymMetrics },
];

export function Overview({ data, dateRange }: OverviewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-6">
      {/* Fitness Score - hero element without wrapping card */}
      <section>
        <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text-primary)] mb-4">
          Fitness Score
        </h2>
        <div className="flex items-center justify-center py-4">
          <FitnessScore score={data.overall_score} trend={data.overall_trend} />
        </div>
      </section>

      {/* Category Cards — click to expand details */}
      <section>
        <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text-primary)] mb-4">
          Categories
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {CATEGORY_CONFIG.map(({ key }) => {
            const cat = data.categories[key];
            return (
              <button
                key={key}
                className="text-left cursor-pointer group active:scale-[0.98] transition-transform duration-150"
                onClick={() => toggle(key)}
              >
                <MetricCard
                  title={cat.name}
                  value={cat.score}
                  unit="score"
                  trend={cat.trend}
                  sparklineData={cat.metrics[0]?.sparkline_data}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Expanded Category Detail */}
      {expanded && (
        <section className="animate-[fadeIn_0.3s_ease-out]">
          {CATEGORY_CONFIG.filter(({ key }) => key === expanded).map(({ key, Component }) => (
            <Component
              key={key}
              metrics={data.categories[key].metrics}
              dateRange={dateRange}
              weekComparison={data.categories[key].weekComparison}
            />
          ))}
        </section>
      )}

      {/* Category Breakdown */}
      <section>
        <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text-primary)] mb-4">
          Category Breakdown
        </h2>
        <Card>
          <CardContent className="py-4">
            <ProgressChart categories={data.categories} />
          </CardContent>
        </Card>
      </section>

      {/* Score Trend */}
      {data.score_history.length > 0 && (
        <section>
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text-primary)] mb-4">
            Score Trend
          </h2>
          <Card>
            <CardContent className="py-4">
              <TrendChart data={data.score_history} dateRange={dateRange} color="#00D4FF" />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
