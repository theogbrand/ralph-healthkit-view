'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { DateRange } from '@/types/analytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/dashboard';
import { timeAgo } from '@/lib/utils/date-helpers';
import {
  getMockDashboardData,
  hasRealDashboardData,
  type DashboardApiResponse,
} from '@/lib/mock/dashboard-preview';

type ApiResponse = DashboardApiResponse;

const RANGES: { value: DateRange; label: string }[] = [
  { value: '30d', label: '30D' },
  { value: '60d', label: '60D' },
  { value: '90d', label: '90D' },
  { value: '365d', label: '1Y' },
];

async function parseAnalyticsResponse(res: Response): Promise<ApiResponse> {
  const text = await res.text();

  try {
    return JSON.parse(text) as ApiResponse;
  } catch (error) {
    const originalError = error;
    // Some hosting proxies can append a chunk terminator (`0`) after JSON.
    const match = text.match(/^([\s\S]*[}\]])\r?\n0\r?\n?\s*$/);
    if (match) {
      try {
        return JSON.parse(match[1]) as ApiResponse;
      } catch {
        throw originalError;
      }
    }
    throw originalError;
  }
}

export default function Home() {
  const [range, setRange] = useState<DateRange>('90d');
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isManualPreviewMode, setIsManualPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${r}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await parseAnalyticsResponse(res);
      setApiData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  const hasRealData = useMemo(() => (apiData ? hasRealDashboardData(apiData) : false), [apiData]);

  const isPreviewMode = useMemo(
    () => Boolean(apiData) && (!hasRealData || isManualPreviewMode),
    [apiData, hasRealData, isManualPreviewMode],
  );

  const data = useMemo(() => {
    if (!apiData) return null;
    return isPreviewMode ? getMockDashboardData(range) : apiData;
  }, [apiData, isPreviewMode, range]);

  const hasData = data && (data.overall_score !== null || data.total_records > 0);

  return (
    <div className="min-h-screen bg-background">
      <header>
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-5 sm:px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Ralph</h1>
            {isPreviewMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 backdrop-blur-sm dark:text-amber-400">
                <span aria-hidden>●</span>
                Preview
              </span>
            )}
          </div>
          <nav className="flex items-center gap-3">
            {hasRealData && !loading && !error && (
              <Button
                size="sm"
                variant={isManualPreviewMode ? 'secondary' : 'outline'}
                aria-pressed={isManualPreviewMode}
                onClick={() => setIsManualPreviewMode((prev) => !prev)}
              >
                {isManualPreviewMode ? 'Exit Preview' : 'Preview Mode'}
              </Button>
            )}
            {!isPreviewMode && data?.last_sync && (
              <span className="text-xs text-muted-foreground">
                {timeAgo(data.last_sync)}
              </span>
            )}
            {isPreviewMode && (
              <span className="text-xs text-muted-foreground">
                Demo data
              </span>
            )}
            <Link href="/import">
              <Button variant="outline" size="sm">Import</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-4 py-6 sm:px-6 lg:px-12">
        {/* Date Range Selector */}
        <div className="mb-8 flex justify-center">
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
                <h2 className="text-lg font-semibold">Couldn&apos;t load your data</h2>
                <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
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
              <h2 className="text-lg font-semibold">Welcome to Ralph</h2>
              <p className="text-sm text-muted-foreground">
                Import your Apple Health data to get started.
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
