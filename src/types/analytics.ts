export interface FitnessScore {
  date: string;
  cardio_score: number | null;
  activity_score: number | null;
  body_score: number | null;
  recovery_score: number | null;
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

export interface CategoryScore {
  name: string;
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  metrics: MetricSummary[];
}

export interface DashboardData {
  overall_score: number | null;
  overall_trend: 'improving' | 'stable' | 'declining';
  categories: {
    cardio: CategoryScore;
    activity: CategoryScore;
    body: CategoryScore;
    recovery: CategoryScore;
  };
  last_sync: string | null;
}

export type DateRange = '30d' | '60d' | '90d' | '365d';
