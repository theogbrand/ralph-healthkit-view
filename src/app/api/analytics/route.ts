import { NextRequest, NextResponse } from 'next/server';
import type { DashboardData, DateRange } from '@/types/analytics';
import { getDateRangeBounds } from '@/lib/utils/date-helpers';
import { computeFitnessScoresForRange, computeScoreForWindow } from '@/lib/analytics/fitness-score';
import { getRunningMetrics, getGymMetrics } from '@/lib/analytics/metrics';
import { saveFitnessScore, getSyncStatus } from '@/lib/db/queries';

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

    const sync = getSyncStatus();

    // Skip expensive score computation when there are no records
    const scores = (sync.total_records > 0 || sync.total_workouts > 0)
      ? computeFitnessScoresForRange(start, end)
      : [];

    // Only persist scores that have actual data
    for (const score of scores) {
      if (score.overall_score !== null) {
        saveFitnessScore(score);
      }
    }

    // Compute a single score using data from the selected range
    const latest = (sync.total_records > 0 || sync.total_workouts > 0) ? computeScoreForWindow(start, end) : null;

    // Build category data using workout-based metrics
    const runningMetrics = getRunningMetrics(range);
    const gymMetrics = getGymMetrics(range);

    const overallTrend = latest?.trend_direction ?? 'stable';

    const data: DashboardData = {
      overall_score: latest?.overall_score ?? null,
      overall_trend: overallTrend,
      categories: {
        running: {
          name: 'Running',
          score: latest?.running_score ?? null,
          trend: runningMetrics[0]?.trend ?? 'stable',
          metrics: runningMetrics,
        },
        gym: {
          name: 'Gym',
          score: latest?.gym_score ?? null,
          trend: gymMetrics[0]?.trend ?? 'stable',
          metrics: gymMetrics,
        },
      },
      last_sync: sync.last_sync,
    };

    // Include score history for trend chart (exclude days with no data)
    const score_history = scores
      .filter((s) => s.overall_score !== null)
      .map((s) => ({
        date: s.date,
        value: s.overall_score!,
      }));

    return NextResponse.json({ ...data, score_history, total_records: sync.total_records });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
