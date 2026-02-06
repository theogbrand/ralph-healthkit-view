import { NextRequest, NextResponse } from 'next/server';
import type { DashboardData, DateRange } from '@/types/analytics';
import { getDateRangeBounds } from '@/lib/utils/date-helpers';
import { computeFitnessScoresForRange } from '@/lib/analytics/fitness-score';
import { getCategoryMetrics } from '@/lib/analytics/metrics';
import { getLatestFitnessScore, getSyncStatus } from '@/lib/db/queries';

export const runtime = 'nodejs';

const VALID_RANGES = new Set<DateRange>(['30d', '60d', '90d', '365d']);

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') ?? '90d';
    const range: DateRange = VALID_RANGES.has(rangeParam as DateRange)
      ? (rangeParam as DateRange)
      : '90d';

    const { start, end } = getDateRangeBounds(range);

    // Compute scores for the range
    const scores = computeFitnessScoresForRange(start, end);
    const latest = getLatestFitnessScore();
    const sync = getSyncStatus();

    // Build category data using the metrics module
    const cardioMetrics = getCategoryMetrics('cardio', range);
    const activityMetrics = getCategoryMetrics('activity', range);
    const bodyMetrics = getCategoryMetrics('body', range);
    const recoveryMetrics = getCategoryMetrics('recovery', range);

    // Determine overall trend from recent scores
    const overallTrend = latest?.trend_direction ?? 'stable';

    const data: DashboardData = {
      overall_score: latest?.overall_score ?? null,
      overall_trend: overallTrend,
      categories: {
        cardio: {
          name: 'Cardio',
          score: latest?.cardio_score ?? null,
          trend: cardioMetrics[0]?.trend ?? 'stable',
          metrics: cardioMetrics,
        },
        activity: {
          name: 'Activity',
          score: latest?.activity_score ?? null,
          trend: activityMetrics[0]?.trend ?? 'stable',
          metrics: activityMetrics,
        },
        body: {
          name: 'Body',
          score: latest?.body_score ?? null,
          trend: bodyMetrics[0]?.trend ?? 'stable',
          metrics: bodyMetrics,
        },
        recovery: {
          name: 'Recovery',
          score: latest?.recovery_score ?? null,
          trend: recoveryMetrics[0]?.trend ?? 'stable',
          metrics: recoveryMetrics,
        },
      },
      last_sync: sync.last_sync,
    };

    // Include score history for trend chart
    const score_history = scores.map((s) => ({
      date: s.date,
      value: s.overall_score ?? 0,
    }));

    return NextResponse.json({ ...data, score_history });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
