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
  { key: 'running' as const, label: 'Running', Component: RunningMetrics, color: '#30D158' },
  { key: 'gym' as const, label: 'Gym', Component: GymMetrics, color: '#007AFF' },
];

export function Overview({ data, dateRange }: OverviewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-8">
      {/* Fitness Score */}
      <section>
        <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.3px]">Fitness Score</h2>
        <Card>
          <CardContent className="flex items-center justify-center py-6">
            <FitnessScore score={data.overall_score} trend={data.overall_trend} />
          </CardContent>
        </Card>
      </section>

      {/* Category Cards — click to expand details */}
      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CATEGORY_CONFIG.map(({ key, color }) => {
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
                  color={color}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Expanded Category Detail */}
      {CATEGORY_CONFIG.map(({ key, Component, color }) => (
        <div
          key={key}
          className={`grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            expanded === key ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            {expanded === key && (
              <Component
                metrics={data.categories[key].metrics}
                dateRange={dateRange}
                weekComparison={data.categories[key].weekComparison}
                color={color}
              />
            )}
          </div>
        </div>
      ))}

      {/* Category Breakdown */}
      <section>
        <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.3px]">Categories</h2>
        <Card>
          <CardContent>
            <ProgressChart categories={data.categories} />
          </CardContent>
        </Card>
      </section>

      {/* Score Trend */}
      {data.score_history.length > 0 && (
        <section>
          <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.3px]">Score Trend</h2>
          <Card>
            <CardContent>
              <TrendChart data={data.score_history} dateRange={dateRange} color="#007AFF" />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
