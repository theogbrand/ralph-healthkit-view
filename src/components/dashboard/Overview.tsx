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
    <div className="space-y-10">
      {/* Fitness Score */}
      <section>
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Fitness Score
        </h2>
        <Card variant="elevated">
          <CardContent className="flex items-center justify-center py-4">
            <FitnessScore score={data.overall_score} trend={data.overall_trend} />
          </CardContent>
        </Card>
      </section>

      {/* Category Cards — click to expand details */}
      <section>
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {CATEGORY_CONFIG.map(({ key }) => {
            const cat = data.categories[key];
            const isExpanded = expanded === key;
            return (
              <div key={key} onClick={() => toggle(key)}>
                <MetricCard
                  title={cat.name}
                  value={cat.score}
                  unit="score"
                  trend={cat.trend}
                  sparklineData={cat.metrics[0]?.sparkline_data}
                  interactive
                  active={isExpanded}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Expanded Category Detail */}
      {CATEGORY_CONFIG.map(({ key, Component }) => (
        <div
          key={key}
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: expanded === key ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden min-h-0">
            <div
              className="transition-opacity duration-200"
              style={{
                opacity: expanded === key ? 1 : 0,
                transitionDelay: expanded === key ? '100ms' : '0ms',
              }}
            >
              {expanded === key && (
                <section>
                  <Component
                    metrics={data.categories[key].metrics}
                    dateRange={dateRange}
                    weekComparison={data.categories[key].weekComparison}
                  />
                </section>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Category Breakdown */}
      <section>
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Breakdown
        </h2>
        <Card>
          <CardContent>
            <ProgressChart categories={data.categories} />
          </CardContent>
        </Card>
      </section>

      {/* Score Trend */}
      {data.score_history.length > 0 && (
        <section>
          <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Your Progress
          </h2>
          <Card>
            <CardContent>
              <TrendChart data={data.score_history} dateRange={dateRange} />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
