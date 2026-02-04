export const CREATE_RECORDS_TABLE = `
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  readable_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  source_name TEXT,
  device TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_date TEXT,
  UNIQUE(type, start_date, end_date, source_name)
);
`;

export const CREATE_RECORDS_INDEX = `
CREATE INDEX IF NOT EXISTS idx_records_type_date ON records(type, start_date DESC);
`;

export const CREATE_WORKOUTS_TABLE = `
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_type TEXT NOT NULL,
  duration_minutes REAL NOT NULL,
  distance_km REAL,
  total_energy_kcal REAL,
  avg_heart_rate INTEGER,
  source_name TEXT,
  device TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  UNIQUE(workout_type, start_date, end_date, source_name)
);
`;

export const CREATE_WORKOUTS_INDEX = `
CREATE INDEX IF NOT EXISTS idx_workouts_type_date ON workouts(workout_type, start_date DESC);
`;

export const CREATE_FITNESS_SCORES_TABLE = `
CREATE TABLE IF NOT EXISTS fitness_scores (
  date TEXT PRIMARY KEY,
  cardio_score REAL,
  activity_score REAL,
  body_score REAL,
  recovery_score REAL,
  overall_score REAL,
  trend_direction TEXT,
  computed_at TEXT
);
`;

export const CREATE_FITNESS_SCORES_INDEX = `
CREATE INDEX IF NOT EXISTS idx_scores_date ON fitness_scores(date DESC);
`;

export const ALL_MIGRATIONS = [
  CREATE_RECORDS_TABLE,
  CREATE_RECORDS_INDEX,
  CREATE_WORKOUTS_TABLE,
  CREATE_WORKOUTS_INDEX,
  CREATE_FITNESS_SCORES_TABLE,
  CREATE_FITNESS_SCORES_INDEX,
];
