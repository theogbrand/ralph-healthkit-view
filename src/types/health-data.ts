export interface HealthRecord {
  id?: number;
  type: string;
  readable_type: string;
  value: number;
  unit: string;
  source_name: string | null;
  device: string | null;
  start_date: string;
  end_date: string;
  created_date: string | null;
}

export interface Workout {
  id?: number;
  workout_type: string;
  duration_minutes: number;
  distance_km: number | null;
  total_energy_kcal: number | null;
  avg_heart_rate: number | null;
  source_name: string | null;
  device: string | null;
  start_date: string;
  end_date: string;
}

export interface ImportResult {
  records_imported: number;
  records_skipped: number;
  workouts_imported: number;
  workouts_skipped: number;
  date_range: {
    start: string;
    end: string;
  } | null;
  errors: string[];
}

export interface SyncStatus {
  last_sync: string | null;
  total_records: number;
  total_workouts: number;
  date_range: {
    start: string;
    end: string;
  } | null;
}
