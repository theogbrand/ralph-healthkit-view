'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { DateRange } from '@/types/analytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/dashboard';
import {
  getMockDashboardData,
  hasRealDashboardData,
  type DashboardApiResponse,
} from '@/lib/mock/dashboard-preview';

type ApiResponse = DashboardApiResponse;

const RANGES: { value: DateRange; label: string }[] = [
  { value: '30d', label: '30 Days' },
  { value: '60d', label: '60 Days' },
  { value: '90d', label: '90 Days' },
  { value: '365d', label: '1 Year' },
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

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-r from-[var(--surface)] via-[var(--muted)] to-[var(--surface)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear] ${className ?? ''}`}
    />
  );
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
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Frosted glass sticky header */}
      <header className="sticky top-0 z-50 backdrop-blur-[20px] bg-white/72 dark:bg-black/72 shadow-[0_0.5px_0_rgba(0,0,0,0.12)]">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[34px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Ralph</h1>
            {isPreviewMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF9500]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF9500]">
                <span aria-hidden>●</span>
                Preview
              </span>
            )}
          </div>
          <nav className="flex items-center gap-3">
            {/* Date Range Segmented Control */}
            <Tabs value={range} onValueChange={(v) => setRange(v as DateRange)}>
              <TabsList>
                {RANGES.map((r) => (
                  <TabsTrigger key={r.value} value={r.value}>
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
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
            <Link href="/import">
              <Button variant="outline">Import Data</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Loading State - Shimmer Skeletons */}
        {loading && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Ring skeleton */}
            <div className="flex justify-center">
              <ShimmerBlock className="h-[200px] w-[200px] rounded-full" />
            </div>
            {/* Card skeletons */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ShimmerBlock className="h-[140px]" />
              <ShimmerBlock className="h-[140px]" />
            </div>
            <ShimmerBlock className="h-[240px]" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex items-center justify-center py-16 animate-[fadeIn_0.3s_ease-out]">
            <Card className="max-w-md text-center">
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <h2 className="text-[22px] font-semibold text-[var(--text-primary)]">Something Went Wrong</h2>
                <p className="text-[15px] text-[var(--text-secondary)]">
                  We couldn&apos;t load your health data.
                </p>
                <Button onClick={() => fetchData(range)}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !hasData && (
          <div className="flex items-center justify-center py-16 animate-[fadeIn_0.3s_ease-out]">
            <Card className="max-w-md text-center">
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <h2 className="text-[22px] font-semibold text-[var(--text-primary)]">No Health Data Yet</h2>
                <p className="text-[15px] text-[var(--text-secondary)]">
                  Import your Apple Health data to see your fitness dashboard.
                </p>
                <Link href="/import">
                  <Button>Import Data</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && hasData && data && (
          <div className="animate-[fadeIn_0.4s_ease-out]">
            <Overview data={data} dateRange={range} />
          </div>
        )}
      </main>
    </div>
  );
}
