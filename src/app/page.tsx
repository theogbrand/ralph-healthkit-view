'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import type { DashboardData, DateRange } from '@/types/analytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Overview } from '@/components/dashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { timeAgo } from '@/lib/utils/date-helpers';

type ApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
  total_records: number;
};

const RANGES: { value: DateRange; label: string }[] = [
  { value: '30d', label: '30d' },
  { value: '60d', label: '60d' },
  { value: '90d', label: '90d' },
  { value: '365d', label: '1y' },
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

  const hasData = data && (data.overall_score !== null || data.total_records > 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Ralph</h1>
          <nav className="flex items-center gap-4">
            {data?.last_sync && (
              <span className="text-sm text-muted-foreground">
                Synced {timeAgo(data.last_sync)}
              </span>
            )}
            <ThemeToggle />
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
        {loading && <DashboardSkeleton />}

        {/* Error State */}
        {!loading && error && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Couldn&apos;t load your dashboard. Check your connection and try again.
                </p>
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
              <Upload className="size-12 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                Welcome to Ralph. Import your Apple Health export to see your fitness story.
              </p>
              <Link href="/import">
                <Button>Import Data</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {!loading && !error && hasData && data && (
          <Overview data={data} dateRange={range} />
        )}
      </main>
    </div>
  );
}
