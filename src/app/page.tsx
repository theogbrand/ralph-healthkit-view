'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { DateRange } from '@/types/analytics';
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
      <header className="px-5 pt-6 pb-4 max-w-[640px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="apple-title">Ralph</h1>
            {isPreviewMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--apple-ring-red)] px-2.5 py-0.5 text-[13px] font-semibold text-white">
                Preview
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
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
            {isPreviewMode && (
              <span className="apple-caption">Preview dataset</span>
            )}
            {!isPreviewMode && data?.last_sync && (
              <span className="apple-caption">
                {timeAgo(data.last_sync)}
              </span>
            )}
            <Link href="/import">
              <Button variant="outline" size="sm">Import</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-5 pb-8">
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
          <div className="space-y-4">
            {/* Ring skeleton */}
            <div className="flex justify-center py-8">
              <div
                className="rounded-full bg-[var(--apple-separator)]"
                style={{
                  width: 180,
                  height: 180,
                  background: 'linear-gradient(90deg, var(--apple-separator) 25%, #ECECF1 50%, var(--apple-separator) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                }}
              />
            </div>
            {/* Card skeletons */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 rounded-[20px]"
                style={{
                  background: 'linear-gradient(90deg, var(--apple-separator) 25%, #ECECF1 50%, var(--apple-separator) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                }}
              />
            ))}
            {/* Chart skeleton */}
            <div
              className="h-48 rounded-[20px]"
              style={{
                background: 'linear-gradient(90deg, var(--apple-separator) 25%, #ECECF1 50%, var(--apple-separator) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <h2 className="apple-section-header">Something went wrong</h2>
            <p className="apple-body text-[var(--apple-text-secondary)]">
              We couldn&apos;t load your health data. Please try again.
            </p>
            <Button variant="secondary" onClick={() => fetchData(range)}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !hasData && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <h2 className="apple-section-header">No Health Data Yet</h2>
            <p className="apple-body text-[var(--apple-text-secondary)]">
              Import your first dataset to get started.
            </p>
            <Link href="/import">
              <Button>Import Data</Button>
            </Link>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && hasData && data && (
          <div style={{ animation: 'fade-in 250ms ease-out' }}>
            <Overview data={data} dateRange={range} />
          </div>
        )}
      </main>
    </div>
  );
}
