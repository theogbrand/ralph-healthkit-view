'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { DashboardData, DateRange } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FitnessScore } from '@/components/charts/FitnessScore';
import { MetricCard } from '@/components/charts/MetricCard';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { timeAgo } from '@/lib/utils/date-helpers';

type ApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
};

const RANGES: { value: DateRange; label: string }[] = [
  { value: '30d', label: '30 Days' },
  { value: '60d', label: '60 Days' },
  { value: '90d', label: '90 Days' },
  { value: '365d', label: '1 Year' },
];

export default function Home() {
  const [range, setRange] = useState<DateRange>('90d');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${r}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  const hasData = data && data.overall_score !== null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Ralph</h1>
          <nav className="flex items-center gap-4">
            {data?.last_sync && (
              <span className="text-sm text-muted-foreground">
                Last sync: {timeAgo(data.last_sync)}
              </span>
            )}
            <Link href="/import">
              <Button variant="outline">Import Data</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Date Range Selector */}
        <div className="mb-6">
          <Tabs value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <TabsList>
              {RANGES.map((r) => (
                <TabsTrigger key={r.value} value={r.value}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-muted-foreground">Loading dashboard...</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-muted-foreground">{error}</p>
                <Button className="mt-4" variant="outline" onClick={() => fetchData(range)}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && !hasData && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
              <p className="text-lg text-muted-foreground">
                No data yet. Import your Apple Health data to get started.
              </p>
              <Link href="/import">
                <Button>Import Data</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {!loading && !error && hasData && data && (
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

            {/* Category Metric Cards */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {(Object.entries(data.categories) as [string, typeof data.categories.cardio][]).map(
                ([key, cat]) => (
                  <MetricCard
                    key={key}
                    title={cat.name}
                    value={cat.score}
                    unit="score"
                    trend={cat.trend}
                    sparklineData={cat.metrics[0]?.sparkline_data}
                  />
                )
              )}
            </section>

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
                    <TrendChart data={data.score_history} dateRange={range} color="#3b82f6" />
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Sync Status Footer */}
            <section>
              <Card>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="text-sm text-muted-foreground">
                    Last sync: {data.last_sync ? timeAgo(data.last_sync) : 'Never'}
                  </div>
                  <Link href="/import">
                    <Button size="sm">Import Data</Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
