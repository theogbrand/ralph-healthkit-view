'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils/date-helpers';
import type { SyncStatus } from '@/types/health-data';

interface SyncSetupProps {
  onCheckNow?: () => void;
}

export function SyncSetup({ onCheckNow }: SyncSetupProps) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/import');
      if (!res.ok) return;
      const json = await res.json();
      setStatus({
        last_sync: json.stats?.dateRange?.latest ?? null,
        total_records: json.stats?.totalRecords ?? 0,
        total_workouts: json.stats?.totalWorkouts ?? 0,
        date_range: json.stats?.dateRange
          ? { start: json.stats.dateRange.earliest, end: json.stats.dateRange.latest }
          : null,
      });
    } catch {
      // Silently fail — status just won't display
    } finally {
      setLoading(false);
    }
  }

  function handleCheckNow() {
    if (onCheckNow) {
      onCheckNow();
    } else {
      fetchStatus();
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Loading sync status...
        </CardContent>
      </Card>
    );
  }

  const hasData = status && status.total_records > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Data Sync</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Last Sync */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Import</span>
          <span className="text-sm font-medium">
            {status?.last_sync ? timeAgo(status.last_sync) : 'Never'}
          </span>
        </div>

        {/* Data Summary */}
        {hasData && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Records</span>
              <span className="text-sm font-medium">
                {status.total_records.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Workouts</span>
              <span className="text-sm font-medium">
                {status.total_workouts.toLocaleString()}
              </span>
            </div>
            {status.date_range && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date Range</span>
                <span className="text-sm font-medium">
                  {new Date(status.date_range.start).toLocaleDateString()} –{' '}
                  {new Date(status.date_range.end).toLocaleDateString()}
                </span>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={handleCheckNow}>
            Check Now
          </Button>
          <Link href="/import">
            <Button size="sm">Import Data</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
