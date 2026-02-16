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

type TrendDirection = 'improving' | 'stable' | 'declining';

interface SeriesConfig {
  baseline: number;
  slope: number;
  noise: number;
  length: number;
  frequency?: number;
  phase?: number;
  min?: number;
  max?: number;
  decimals?: number;
}

interface MetricTemplate {
  label: string;
  value: number;
  unit: string;
  trend: TrendDirection;
  changePercent: number;
  series: SeriesConfig;
}

interface RangeScenario {
  overallScore: number;
  overallTrend: TrendDirection;
  scoreHistory: Omit<SeriesConfig, 'length'>;
  running: {
    score: number;
    trend: TrendDirection;
    metrics: MetricTemplate[];
    weekComparison: WeekComparisonMetric[];
  };
  gym: {
    score: number;
    trend: TrendDirection;
    metrics: MetricTemplate[];
    weekComparison: WeekComparisonMetric[];
  };
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildSeries({
  baseline,
  slope,
  noise,
  length,
  frequency = 0.47,
  phase = 0,
  min,
  max,
  decimals = 2,
}: SeriesConfig): number[] {
  return Array.from({ length }, (_, i) => {
    const wave = Math.sin(i * frequency + phase) * noise;
    const secondaryWave = Math.cos(i * frequency * 0.37 + phase) * noise * 0.3;
    const raw = baseline + slope * i + wave + secondaryWave;
    const clamped = min != null || max != null
      ? Math.max(min ?? -Infinity, Math.min(max ?? Infinity, raw))
      : raw;
    return round(clamped, decimals);
  });
}

function buildMetricSummaries(templates: MetricTemplate[]): MetricSummary[] {
  return templates.map((metric) => ({
    label: metric.label,
    value: metric.value,
    unit: metric.unit,
    trend: metric.trend,
    change_percent: metric.changePercent,
    sparkline_data: buildSeries(metric.series),
  }));
}

const PREVIEW_SCENARIOS: Record<DateRange, RangeScenario> = {
  '30d': {
    overallScore: 86,
    overallTrend: 'improving',
    scoreHistory: {
      baseline: 73,
      slope: 0.45,
      noise: 1.4,
      frequency: 0.64,
      min: 62,
      max: 92,
      decimals: 1,
    },
    running: {
      score: 90,
      trend: 'improving',
      metrics: [
        {
          label: 'Avg Pace',
          value: 5.01,
          unit: 'min/km',
          trend: 'improving',
          changePercent: -9,
          series: { length: 14, baseline: 5.55, slope: -0.04, noise: 0.06, min: 4.8, max: 6.2, decimals: 2 },
        },
        {
          label: 'Avg Heart Rate (Runs)',
          value: 143,
          unit: 'bpm',
          trend: 'improving',
          changePercent: -6,
          series: { length: 14, baseline: 151, slope: -0.55, noise: 1.1, min: 135, max: 166, decimals: 0 },
        },
        {
          label: 'Resting Heart Rate',
          value: 52,
          unit: 'bpm',
          trend: 'improving',
          changePercent: -5,
          series: { length: 14, baseline: 56, slope: -0.3, noise: 0.7, min: 48, max: 62, decimals: 0 },
        },
        {
          label: 'Runs per Week',
          value: 4.4,
          unit: 'count',
          trend: 'improving',
          changePercent: 22,
          series: { length: 12, baseline: 3.2, slope: 0.12, noise: 0.2, min: 1, max: 6, decimals: 1 },
        },
        {
          label: 'Weekly Distance',
          value: 42.8,
          unit: 'km',
          trend: 'improving',
          changePercent: 28,
          series: { length: 12, baseline: 29, slope: 1.15, noise: 1.8, min: 10, max: 60, decimals: 1 },
        },
      ],
      weekComparison: [
        {
          label: 'Avg Pace',
          unit: 'min/km',
          thisWeek: 4.98,
          lastWeek: 5.32,
          delta: -0.34,
          deltaPercent: -6,
          higherIsBetter: false,
        },
        {
          label: 'Avg Heart Rate',
          unit: 'bpm',
          thisWeek: 142,
          lastWeek: 149,
          delta: -7,
          deltaPercent: -5,
          higherIsBetter: false,
        },
        {
          label: 'Weekly Distance',
          unit: 'km',
          thisWeek: 44.3,
          lastWeek: 36,
          delta: 8.3,
          deltaPercent: 23,
          higherIsBetter: true,
        },
      ],
    },
    gym: {
      score: 82,
      trend: 'improving',
      metrics: [
        {
          label: 'Workouts per Week',
          value: 3.6,
          unit: 'count',
          trend: 'improving',
          changePercent: 20,
          series: { length: 12, baseline: 2.8, slope: 0.08, noise: 0.16, min: 1, max: 6, decimals: 1 },
        },
        {
          label: 'Avg Duration',
          value: 67,
          unit: 'min',
          trend: 'improving',
          changePercent: 12,
          series: { length: 14, baseline: 59, slope: 0.55, noise: 1.9, min: 40, max: 90, decimals: 0 },
        },
        {
          label: 'Avg Intensity',
          value: 8.5,
          unit: 'kcal/min',
          trend: 'improving',
          changePercent: 14,
          series: { length: 14, baseline: 7.1, slope: 0.08, noise: 0.2, min: 4.5, max: 10, decimals: 1 },
        },
        {
          label: 'Avg Heart Rate (Gym)',
          value: 141,
          unit: 'bpm',
          trend: 'improving',
          changePercent: 5,
          series: { length: 14, baseline: 136, slope: 0.28, noise: 1.3, min: 110, max: 160, decimals: 0 },
        },
      ],
      weekComparison: [
        {
          label: 'Workouts',
          unit: 'count',
          thisWeek: 4,
          lastWeek: 3,
          delta: 1,
          deltaPercent: 33,
          higherIsBetter: true,
        },
        {
          label: 'Avg Duration',
          unit: 'min',
          thisWeek: 68,
          lastWeek: 61,
          delta: 7,
          deltaPercent: 11,
          higherIsBetter: true,
        },
        {
          label: 'Avg Intensity',
          unit: 'kcal/min',
          thisWeek: 8.6,
          lastWeek: 7.6,
          delta: 1.0,
          deltaPercent: 13,
          higherIsBetter: true,
        },
      ],
    },
  },
  '60d': {
    overallScore: 74,
    overallTrend: 'stable',
    scoreHistory: {
      baseline: 74,
      slope: 0.02,
      noise: 1.8,
      frequency: 0.31,
      min: 68,
      max: 79,
      decimals: 1,
    },
    running: {
      score: 76,
      trend: 'stable',
      metrics: [
        {
          label: 'Avg Pace',
          value: 5.38,
          unit: 'min/km',
          trend: 'stable',
          changePercent: 1,
          series: { length: 14, baseline: 5.33, slope: 0.002, noise: 0.09, min: 5.1, max: 5.6, decimals: 2 },
        },
        {
          label: 'Avg Heart Rate (Runs)',
          value: 149,
          unit: 'bpm',
          trend: 'stable',
          changePercent: 0,
          series: { length: 14, baseline: 149, slope: 0, noise: 1.4, min: 143, max: 155, decimals: 0 },
        },
        {
          label: 'Resting Heart Rate',
          value: 55,
          unit: 'bpm',
          trend: 'stable',
          changePercent: 1,
          series: { length: 14, baseline: 55, slope: 0.01, noise: 0.8, min: 52, max: 58, decimals: 0 },
        },
        {
          label: 'Runs per Week',
          value: 3.1,
          unit: 'count',
          trend: 'stable',
          changePercent: 2,
          series: { length: 12, baseline: 3.0, slope: 0.01, noise: 0.25, min: 2.3, max: 3.8, decimals: 1 },
        },
        {
          label: 'Weekly Distance',
          value: 31.2,
          unit: 'km',
          trend: 'stable',
          changePercent: 3,
          series: { length: 12, baseline: 30, slope: 0.08, noise: 1.9, min: 24, max: 36, decimals: 1 },
        },
      ],
      weekComparison: [
        {
          label: 'Avg Pace',
          unit: 'min/km',
          thisWeek: 5.36,
          lastWeek: 5.34,
          delta: 0.02,
          deltaPercent: 0,
          higherIsBetter: false,
        },
        {
          label: 'Avg Heart Rate',
          unit: 'bpm',
          thisWeek: 149,
          lastWeek: 148,
          delta: 1,
          deltaPercent: 1,
          higherIsBetter: false,
        },
        {
          label: 'Weekly Distance',
          unit: 'km',
          thisWeek: 31.8,
          lastWeek: 31.1,
          delta: 0.7,
          deltaPercent: 2,
          higherIsBetter: true,
        },
      ],
    },
    gym: {
      score: 71,
      trend: 'stable',
      metrics: [
        {
          label: 'Workouts per Week',
          value: 2.9,
          unit: 'count',
          trend: 'stable',
          changePercent: 0,
          series: { length: 12, baseline: 2.9, slope: 0, noise: 0.15, min: 2.4, max: 3.4, decimals: 1 },
        },
        {
          label: 'Avg Duration',
          value: 60,
          unit: 'min',
          trend: 'stable',
          changePercent: -1,
          series: { length: 14, baseline: 61, slope: -0.03, noise: 1.7, min: 54, max: 67, decimals: 0 },
        },
        {
          label: 'Avg Intensity',
          value: 7.2,
          unit: 'kcal/min',
          trend: 'stable',
          changePercent: 1,
          series: { length: 14, baseline: 7.1, slope: 0.01, noise: 0.18, min: 6.6, max: 7.8, decimals: 1 },
        },
        {
          label: 'Avg Heart Rate (Gym)',
          value: 136,
          unit: 'bpm',
          trend: 'stable',
          changePercent: 0,
          series: { length: 14, baseline: 136, slope: 0, noise: 1.0, min: 132, max: 140, decimals: 0 },
        },
      ],
      weekComparison: [
        {
          label: 'Workouts',
          unit: 'count',
          thisWeek: 3,
          lastWeek: 3,
          delta: 0,
          deltaPercent: 0,
          higherIsBetter: true,
        },
        {
          label: 'Avg Duration',
          unit: 'min',
          thisWeek: 59,
          lastWeek: 61,
          delta: -2,
          deltaPercent: -3,
          higherIsBetter: true,
        },
        {
          label: 'Avg Intensity',
          unit: 'kcal/min',
          thisWeek: 7.2,
          lastWeek: 7.1,
          delta: 0.1,
          deltaPercent: 1,
          higherIsBetter: true,
        },
      ],
    },
  },
  '90d': {
    overallScore: 63,
    overallTrend: 'declining',
    scoreHistory: {
      baseline: 76,
      slope: -0.15,
      noise: 2.1,
      frequency: 0.22,
      min: 56,
      max: 80,
      decimals: 1,
    },
    running: {
      score: 58,
      trend: 'declining',
      metrics: [
        {
          label: 'Avg Pace',
          value: 6.04,
          unit: 'min/km',
          trend: 'declining',
          changePercent: 10,
          series: { length: 14, baseline: 5.45, slope: 0.05, noise: 0.08, min: 5.2, max: 6.4, decimals: 2 },
        },
        {
          label: 'Avg Heart Rate (Runs)',
          value: 156,
          unit: 'bpm',
          trend: 'declining',
          changePercent: 7,
          series: { length: 14, baseline: 149, slope: 0.45, noise: 1.5, min: 145, max: 165, decimals: 0 },
        },
        {
          label: 'Resting Heart Rate',
          value: 61,
          unit: 'bpm',
          trend: 'declining',
          changePercent: 9,
          series: { length: 14, baseline: 55, slope: 0.35, noise: 0.9, min: 53, max: 64, decimals: 0 },
        },
        {
          label: 'Runs per Week',
          value: 2.0,
          unit: 'count',
          trend: 'declining',
          changePercent: -26,
          series: { length: 12, baseline: 3.1, slope: -0.11, noise: 0.22, min: 0.6, max: 3.5, decimals: 1 },
        },
        {
          label: 'Weekly Distance',
          value: 18.4,
          unit: 'km',
          trend: 'declining',
          changePercent: -34,
          series: { length: 12, baseline: 30, slope: -0.95, noise: 1.7, min: 5, max: 32, decimals: 1 },
        },
      ],
      weekComparison: [
        {
          label: 'Avg Pace',
          unit: 'min/km',
          thisWeek: 6.12,
          lastWeek: 5.68,
          delta: 0.44,
          deltaPercent: 8,
          higherIsBetter: false,
        },
        {
          label: 'Avg Heart Rate',
          unit: 'bpm',
          thisWeek: 157,
          lastWeek: 149,
          delta: 8,
          deltaPercent: 5,
          higherIsBetter: false,
        },
        {
          label: 'Weekly Distance',
          unit: 'km',
          thisWeek: 17.1,
          lastWeek: 24.8,
          delta: -7.7,
          deltaPercent: -31,
          higherIsBetter: true,
        },
      ],
    },
    gym: {
      score: 68,
      trend: 'declining',
      metrics: [
        {
          label: 'Workouts per Week',
          value: 2.1,
          unit: 'count',
          trend: 'declining',
          changePercent: -19,
          series: { length: 12, baseline: 2.9, slope: -0.08, noise: 0.2, min: 1.2, max: 3.2, decimals: 1 },
        },
        {
          label: 'Avg Duration',
          value: 52,
          unit: 'min',
          trend: 'declining',
          changePercent: -13,
          series: { length: 14, baseline: 59, slope: -0.45, noise: 1.6, min: 45, max: 62, decimals: 0 },
        },
        {
          label: 'Avg Intensity',
          value: 6.1,
          unit: 'kcal/min',
          trend: 'declining',
          changePercent: -15,
          series: { length: 14, baseline: 7.2, slope: -0.08, noise: 0.18, min: 5.6, max: 7.4, decimals: 1 },
        },
        {
          label: 'Avg Heart Rate (Gym)',
          value: 131,
          unit: 'bpm',
          trend: 'declining',
          changePercent: -6,
          series: { length: 14, baseline: 137, slope: -0.3, noise: 1.2, min: 124, max: 140, decimals: 0 },
        },
      ],
      weekComparison: [
        {
          label: 'Workouts',
          unit: 'count',
          thisWeek: 2,
          lastWeek: 3,
          delta: -1,
          deltaPercent: -33,
          higherIsBetter: true,
        },
        {
          label: 'Avg Duration',
          unit: 'min',
          thisWeek: 51,
          lastWeek: 58,
          delta: -7,
          deltaPercent: -12,
          higherIsBetter: true,
        },
        {
          label: 'Avg Intensity',
          unit: 'kcal/min',
          thisWeek: 6.0,
          lastWeek: 7.0,
          delta: -1.0,
          deltaPercent: -14,
          higherIsBetter: true,
        },
      ],
    },
  },
  '365d': {
    overallScore: 77,
    overallTrend: 'improving',
    scoreHistory: {
      baseline: 66,
      slope: 0.03,
      noise: 3.6,
      frequency: 0.06,
      min: 54,
      max: 86,
      decimals: 1,
    },
    running: {
      score: 80,
      trend: 'improving',
      metrics: [
        {
          label: 'Avg Pace',
          value: 5.47,
          unit: 'min/km',
          trend: 'improving',
          changePercent: -3,
          series: { length: 14, baseline: 5.62, slope: -0.01, noise: 0.11, frequency: 0.25, min: 5.2, max: 5.9, decimals: 2 },
        },
        {
          label: 'Avg Heart Rate (Runs)',
          value: 150,
          unit: 'bpm',
          trend: 'improving',
          changePercent: -2,
          series: { length: 14, baseline: 152, slope: -0.1, noise: 1.7, min: 145, max: 157, decimals: 0 },
        },
        {
          label: 'Resting Heart Rate',
          value: 56,
          unit: 'bpm',
          trend: 'improving',
          changePercent: -3,
          series: { length: 14, baseline: 58, slope: -0.07, noise: 0.8, min: 53, max: 60, decimals: 0 },
        },
        {
          label: 'Runs per Week',
          value: 3.4,
          unit: 'count',
          trend: 'improving',
          changePercent: 8,
          series: { length: 12, baseline: 2.9, slope: 0.04, noise: 0.28, min: 2.2, max: 4.1, decimals: 1 },
        },
        {
          label: 'Weekly Distance',
          value: 35.6,
          unit: 'km',
          trend: 'improving',
          changePercent: 12,
          series: { length: 12, baseline: 27, slope: 0.55, noise: 2.3, min: 20, max: 42, decimals: 1 },
        },
      ],
      weekComparison: [
        {
          label: 'Avg Pace',
          unit: 'min/km',
          thisWeek: 5.44,
          lastWeek: 5.56,
          delta: -0.12,
          deltaPercent: -2,
          higherIsBetter: false,
        },
        {
          label: 'Avg Heart Rate',
          unit: 'bpm',
          thisWeek: 149,
          lastWeek: 152,
          delta: -3,
          deltaPercent: -2,
          higherIsBetter: false,
        },
        {
          label: 'Weekly Distance',
          unit: 'km',
          thisWeek: 36.4,
          lastWeek: 32.1,
          delta: 4.3,
          deltaPercent: 13,
          higherIsBetter: true,
        },
      ],
    },
    gym: {
      score: 74,
      trend: 'improving',
      metrics: [
        {
          label: 'Workouts per Week',
          value: 3.1,
          unit: 'count',
          trend: 'improving',
          changePercent: 6,
          series: { length: 12, baseline: 2.7, slope: 0.03, noise: 0.2, min: 2.2, max: 3.8, decimals: 1 },
        },
        {
          label: 'Avg Duration',
          value: 63,
          unit: 'min',
          trend: 'improving',
          changePercent: 5,
          series: { length: 14, baseline: 58, slope: 0.24, noise: 1.8, min: 53, max: 68, decimals: 0 },
        },
        {
          label: 'Avg Intensity',
          value: 7.7,
          unit: 'kcal/min',
          trend: 'improving',
          changePercent: 7,
          series: { length: 14, baseline: 7.0, slope: 0.05, noise: 0.22, min: 6.4, max: 8.2, decimals: 1 },
        },
        {
          label: 'Avg Heart Rate (Gym)',
          value: 138,
          unit: 'bpm',
          trend: 'stable',
          changePercent: 1,
          series: { length: 14, baseline: 137, slope: 0.03, noise: 1.1, min: 133, max: 142, decimals: 0 },
        },
      ],
      weekComparison: [
        {
          label: 'Workouts',
          unit: 'count',
          thisWeek: 3,
          lastWeek: 3,
          delta: 0,
          deltaPercent: 0,
          higherIsBetter: true,
        },
        {
          label: 'Avg Duration',
          unit: 'min',
          thisWeek: 64,
          lastWeek: 61,
          delta: 3,
          deltaPercent: 5,
          higherIsBetter: true,
        },
        {
          label: 'Avg Intensity',
          unit: 'kcal/min',
          thisWeek: 7.8,
          lastWeek: 7.3,
          delta: 0.5,
          deltaPercent: 7,
          higherIsBetter: true,
        },
      ],
    },
  },
};

function buildScoreHistory(range: DateRange): Array<{ date: string; value: number }> {
  const length = HISTORY_LENGTH_BY_RANGE[range];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startTime = today.getTime() - (length - 1) * MS_PER_DAY;
  const scenario = PREVIEW_SCENARIOS[range];

  const values = buildSeries({
    ...scenario.scoreHistory,
    length,
  });

  return values.map((value, index) => ({
    date: formatDateISO(new Date(startTime + index * MS_PER_DAY)),
    value,
  }));
}

export function hasRealDashboardData(
  data: Pick<DashboardApiResponse, 'overall_score' | 'total_records'>,
): boolean {
  return data.overall_score !== null || data.total_records > 0;
}

export function getMockDashboardData(range: DateRange): DashboardApiResponse {
  const scenario = PREVIEW_SCENARIOS[range];

  return {
    overall_score: scenario.overallScore,
    overall_trend: scenario.overallTrend,
    categories: {
      running: {
        name: 'Running',
        score: scenario.running.score,
        trend: scenario.running.trend,
        metrics: buildMetricSummaries(scenario.running.metrics),
        weekComparison: scenario.running.weekComparison,
      },
      gym: {
        name: 'Gym',
        score: scenario.gym.score,
        trend: scenario.gym.trend,
        metrics: buildMetricSummaries(scenario.gym.metrics),
        weekComparison: scenario.gym.weekComparison,
      },
    },
    last_sync: null,
    score_history: buildScoreHistory(range),
    total_records: 0,
  };
}
