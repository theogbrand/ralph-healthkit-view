'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { DateRange } from '@/types/analytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <div className="mx-auto flex max-w-[860px] items-center justify-between px-6 py-5 md:px-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[34px] font-bold tracking-[-0.4px] leading-tight">Ralph</h1>
              {isPreviewMode && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#007AFF]/20 bg-[#007AFF]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#007AFF]">
                  <span aria-hidden>●</span>
                  Preview
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-[#8E8E93]">
              {isPreviewMode
                ? 'Preview dataset'
                : data?.last_sync
                  ? `Last sync: ${timeAgo(data.last_sync)}`
                  : 'No data synced yet'}
            </p>
          </div>
          <nav className="flex items-center gap-4">
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
              <Button variant="outline" className="rounded-full">Import Data</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[860px] px-6 py-8 md:px-8">
        {/* Date Range Selector — Apple Segmented Control */}
        <div className="mb-8">
          <div className="relative inline-flex h-[36px] items-center rounded-[10px] bg-[rgba(118,118,128,0.12)] p-[2px]">
            {/* Sliding white pill indicator */}
            <div
              className="absolute top-[2px] bottom-[2px] rounded-[8px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              style={{
                width: `${100 / RANGES.length}%`,
                transform: `translateX(${RANGES.findIndex(r => r.value === range) * 100}%)`,
              }}
            />
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`relative z-10 min-w-[56px] px-4 py-1 text-[13px] font-medium transition-colors duration-200 ${
                  range === r.value ? 'text-black' : 'text-[#8E8E93]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State — Skeleton */}
        {loading && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="skeleton h-[200px] w-[200px] rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="skeleton h-[120px] rounded-2xl" />
              <div className="skeleton h-[120px] rounded-2xl" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="border-l-4 border-l-[#FF3B30]">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="text-[17px] text-[#000000]">Couldn&apos;t load your data. Let&apos;s try again.</p>
              <Button
                variant="outline"
                onClick={() => fetchData(range)}
                className="rounded-full px-6"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && !hasData && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
              <h2 className="text-[22px] font-semibold tracking-[-0.3px]">Ready to get started?</h2>
              <p className="text-[17px] text-[#8E8E93]">
                Import your Apple Health data to see your fitness dashboard.
              </p>
              <Link href="/import">
                <Button className="mt-2 rounded-full px-6">Import Health Data</Button>
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
