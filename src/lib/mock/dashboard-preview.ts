import type {
  DashboardData,
  DateRange,
  MetricSummary,
  WeekComparisonMetric,
} from '@/types/analytics';

export type DashboardApiResponse = DashboardData & {
  score_history: Array<{ date: string; value: number }>;
  total_records: number;
};

const HISTORY_LENGTH_BY_RANGE: Record<DateRange, number> = {
  '30d': 30,
  '60d': 60,
  '90d': 90,
  '365d': 365,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildSeries(length: number, baseline: number, slope: number, noise: number): number[] {
  return Array.from({ length }, (_, i) => {
    const periodic = Math.sin(i * 0.47) * noise;
    return round(baseline + slope * i + periodic);
  });
}

function buildScoreHistory(range: DateRange): Array<{ date: string; value: number }> {
  const length = HISTORY_LENGTH_BY_RANGE[range];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startTime = today.getTime() - (length - 1) * MS_PER_DAY;

  const values = buildSeries(length, 70, 0.03, 1.4).map((v) => Math.max(58, Math.min(92, v)));

  return values.map((value, index) => ({
    date: formatDateISO(new Date(startTime + index * MS_PER_DAY)),
    value,
  }));
}

function runningMetrics(): MetricSummary[] {
  return [
    {
      label: 'Avg Pace',
      value: 5.32,
      unit: 'min/km',
      trend: 'improving',
      change_percent: -4,
      sparkline_data: buildSeries(14, 5.55, -0.015, 0.05),
    },
    {
      label: 'Avg Heart Rate (Runs)',
      value: 147,
      unit: 'bpm',
      trend: 'improving',
      change_percent: -3,
      sparkline_data: buildSeries(14, 152, -0.3, 1.2),
    },
    {
      label: 'Resting Heart Rate',
      value: 54,
      unit: 'bpm',
      trend: 'improving',
      change_percent: -2,
      sparkline_data: buildSeries(14, 57, -0.18, 0.8),
    },
    {
      label: 'Runs per Week',
      value: 3.7,
      unit: 'count',
      trend: 'improving',
      change_percent: 9,
      sparkline_data: buildSeries(12, 3.0, 0.08, 0.22).map((v) => Math.max(1, round(v, 1))),
    },
    {
      label: 'Weekly Distance',
      value: 33.4,
      unit: 'km',
      trend: 'improving',
      change_percent: 11,
      sparkline_data: buildSeries(12, 26, 0.65, 1.6).map((v) => Math.max(10, round(v, 1))),
    },
  ];
}

function gymMetrics(): MetricSummary[] {
  return [
    {
      label: 'Workouts per Week',
      value: 2.9,
      unit: 'count',
      trend: 'stable',
      change_percent: 3,
      sparkline_data: buildSeries(12, 2.7, 0.03, 0.18).map((v) => Math.max(1, round(v, 1))),
    },
    {
      label: 'Avg Duration',
      value: 61,
      unit: 'min',
      trend: 'improving',
      change_percent: 6,
      sparkline_data: buildSeries(14, 56, 0.45, 1.8).map((v) => Math.max(35, Math.round(v))),
    },
    {
      label: 'Avg Intensity',
      value: 7.8,
      unit: 'kcal/min',
      trend: 'improving',
      change_percent: 8,
      sparkline_data: buildSeries(14, 7.0, 0.05, 0.25).map((v) => Math.max(4.5, round(v, 1))),
    },
    {
      label: 'Avg Heart Rate (Gym)',
      value: 136,
      unit: 'bpm',
      trend: 'stable',
      change_percent: 1,
      sparkline_data: buildSeries(14, 134, 0.1, 1.2).map((v) => Math.max(110, Math.round(v))),
    },
  ];
}

function runningWeekComparison(): WeekComparisonMetric[] {
  return [
    {
      label: 'Avg Pace',
      unit: 'min/km',
      thisWeek: 5.24,
      lastWeek: 5.42,
      delta: -0.18,
      deltaPercent: -3,
      higherIsBetter: false,
    },
    {
      label: 'Avg Heart Rate',
      unit: 'bpm',
      thisWeek: 146,
      lastWeek: 150,
      delta: -4,
      deltaPercent: -3,
      higherIsBetter: false,
    },
    {
      label: 'Weekly Distance',
      unit: 'km',
      thisWeek: 36.2,
      lastWeek: 31.5,
      delta: 4.7,
      deltaPercent: 15,
      higherIsBetter: true,
    },
  ];
}

function gymWeekComparison(): WeekComparisonMetric[] {
  return [
    {
      label: 'Workouts',
      unit: 'count',
      thisWeek: 3,
      lastWeek: 2,
      delta: 1,
      deltaPercent: 50,
      higherIsBetter: true,
    },
    {
      label: 'Avg Duration',
      unit: 'min',
      thisWeek: 63,
      lastWeek: 59,
      delta: 4,
      deltaPercent: 7,
      higherIsBetter: true,
    },
    {
      label: 'Avg Intensity',
      unit: 'kcal/min',
      thisWeek: 8.0,
      lastWeek: 7.4,
      delta: 0.6,
      deltaPercent: 8,
      higherIsBetter: true,
    },
  ];
}

export function hasRealDashboardData(
  data: Pick<DashboardApiResponse, 'overall_score' | 'total_records'>,
): boolean {
  return data.overall_score !== null || data.total_records > 0;
}

export function getMockDashboardData(range: DateRange): DashboardApiResponse {
  return {
    overall_score: 78,
    overall_trend: 'improving',
    categories: {
      running: {
        name: 'Running',
        score: 82,
        trend: 'improving',
        metrics: runningMetrics(),
        weekComparison: runningWeekComparison(),
      },
      gym: {
        name: 'Gym',
        score: 74,
        trend: 'stable',
        metrics: gymMetrics(),
        weekComparison: gymWeekComparison(),
      },
    },
    last_sync: null,
    score_history: buildScoreHistory(range),
    total_records: 0,
  };
}
