'use client';

import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChevronRight } from 'lucide-react';
import type { DashboardData, DateRange } from '@/types/analytics';
import { FitnessScore } from '@/components/charts/FitnessScore';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { getTrendIcon, getTrendColor } from '@/lib/utils/formatters';

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
  { key: 'running' as const, label: 'Running', accentColor: 'var(--apple-ring-green)', Component: RunningMetrics },
  { key: 'gym' as const, label: 'Gym', accentColor: 'var(--apple-ring-cyan)', Component: GymMetrics },
];

export function Overview({ data, dateRange }: OverviewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-6">
      {/* Fitness Score — standalone ring */}
      <section className="flex flex-col items-center py-4">
        <FitnessScore score={data.overall_score} trend={data.overall_trend} />
      </section>

      {/* Category Cards — stacked with expand/collapse */}
      <section className="space-y-4">
        {CATEGORY_CONFIG.map(({ key, label, accentColor, Component }) => {
          const cat = data.categories[key];
          const isExpanded = expanded === key;
          const sparkData = cat.metrics[0]?.sparkline_data;

          return (
            <div key={key}>
              {/* Category Card */}
              <button
                className="w-full text-left bg-[var(--apple-card)] rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.06)]"
                onClick={() => toggle(key)}
              >
                <div className="flex items-center">
                  {/* Left accent bar */}
                  <div
                    className="w-1 self-stretch rounded-l-[20px]"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div className="flex-1 flex items-center justify-between p-4 pl-4">
                    {/* Left side: name + score + trend */}
                    <div className="flex-1">
                      <p className="apple-card-title">{label}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-[34px] font-light tracking-[-0.02em]" style={{ color: 'var(--apple-text-primary)' }}>
                          {cat.score !== null ? Math.round(cat.score) : '--'}
                        </span>
                        <span className={`apple-caption ${getTrendColor(cat.trend)}`}>
                          {getTrendIcon(cat.trend)} {cat.trend}
                        </span>
                      </div>
                    </div>
                    {/* Sparkline */}
                    {sparkData && sparkData.length > 1 && (
                      <div className="h-10 w-[60px] mr-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparkData.map((v, i) => ({ i, v }))}>
                            <Line
                              type="monotone"
                              dataKey="v"
                              stroke={accentColor}
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {/* Chevron */}
                    <ChevronRight
                      className="h-5 w-5 text-[var(--apple-text-tertiary)] transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div
                  className="overflow-hidden mt-2"
                  style={{ animation: 'expand 350ms cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
                >
                  <Component
                    metrics={cat.metrics}
                    dateRange={dateRange}
                    weekComparison={cat.weekComparison}
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Score Trend */}
      {data.score_history.length > 0 && (
        <section>
          <h2 className="apple-section-header mb-4">Score Trend</h2>
          <TrendChart data={data.score_history} dateRange={dateRange} color="var(--apple-ring-red)" />
        </section>
      )}

      {/* Category Breakdown */}
      <section>
        <h2 className="apple-section-header mb-4">Categories</h2>
        <ProgressChart categories={data.categories} />
      </section>
    </div>
  );
}
