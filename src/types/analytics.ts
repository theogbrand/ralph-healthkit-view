export interface FitnessScore {
  date: string;
  running_score: number | null;
  gym_score: number | null;
  overall_score: number | null;
  trend_direction: 'improving' | 'stable' | 'declining';
  computed_at: string;
}

export interface MetricSummary {
  label: string;
  value: number | null;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  change_percent: number | null;
  sparkline_data: number[];
}

export interface WeekComparisonMetric {
  label: string;
  unit: string;
  thisWeek: number | null;
  lastWeek: number | null;
  delta: number | null;
  deltaPercent: number | null;
  higherIsBetter: boolean;
}

export interface CategoryScore {
  name: string;
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  metrics: MetricSummary[];
  weekComparison?: WeekComparisonMetric[];
}

export interface DashboardData {
  overall_score: number | null;
  overall_trend: 'improving' | 'stable' | 'declining';
  categories: {
    running: CategoryScore;
    gym: CategoryScore;
  };
  last_sync: string | null;
}

export type DateRange = '30d' | '60d' | '90d' | '365d';
