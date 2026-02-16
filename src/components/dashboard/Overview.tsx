'use client';

import { useState } from 'react';
import type { DashboardData, DateRange } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-8">
      {/* Fitness Score */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Overall Fitness Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <FitnessScore score={data.overall_score} trend={data.overall_trend} />
          </CardContent>
        </Card>
      </section>

      {/* Category Cards — click to expand details */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {CATEGORY_CONFIG.map(({ key }) => {
          const cat = data.categories[key];
          return (
            <button
              key={key}
              className="text-left"
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
      </section>

      {/* Expanded Category Detail */}
      {expanded && (
        <section>
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
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart categories={data.categories} />
          </CardContent>
        </Card>
      </section>

      {/* Score Trend */}
      {data.score_history.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={data.score_history} dateRange={dateRange} color="#5a82b4" />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
