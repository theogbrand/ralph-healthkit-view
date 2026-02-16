'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      {/* Fitness Score — floats on page bg, no card wrapper */}
      <section className="flex flex-col items-center py-4">
        <h2 className="mb-4 text-[1.25rem] font-semibold tracking-tight">
          Overall Fitness Score
        </h2>
        <FitnessScore score={data.overall_score} trend={data.overall_trend} />
      </section>

      {/* Category Cards — click to expand details */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CATEGORY_CONFIG.map(({ key }) => {
          const cat = data.categories[key];
          const isExpanded = expanded === key;
          return (
            <button
              key={key}
              className="text-left"
              onClick={() => toggle(key)}
            >
              <div className={isExpanded ? 'rounded-2xl ring-2 ring-foreground/5' : ''}>
                <MetricCard
                  title={cat.name}
                  value={cat.score}
                  unit="score"
                  trend={cat.trend}
                  sparklineData={cat.metrics[0]?.sparkline_data}
                />
              </div>
            </button>
          );
        })}
      </section>

      {/* Expanded Category Detail with animation */}
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.section
            key={expanded}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              opacity: { duration: 0.2 },
              height: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
            }}
            className="overflow-hidden"
          >
            {CATEGORY_CONFIG.filter(({ key }) => key === expanded).map(({ key, Component }) => (
              <Component
                key={key}
                metrics={data.categories[key].metrics}
                dateRange={dateRange}
                weekComparison={data.categories[key].weekComparison}
              />
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Category Breakdown */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-[1.25rem] font-semibold tracking-tight">
              Category Breakdown
            </CardTitle>
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
              <CardTitle className="text-[1.25rem] font-semibold tracking-tight">
                Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={data.score_history} dateRange={dateRange} color="var(--chart-blue)" />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
