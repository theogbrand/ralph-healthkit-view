# Apple Health Fitness Dashboard - Implementation Plan

## Project Overview
Build a local-first Next.js web app that imports Apple Health data and provides an at-a-glance fitness assessment with comprehensive trend analysis across cardio, activity, body, and recovery metrics.

**Deployment:** Local web app (npm run dev)
**Data Import:** Automatic sync from iPhone
**Metrics:** Comprehensive (all fitness and vitals)

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 + TypeScript | React, built-in API routes, SSR support |
| **Data Storage** | SQLite (better-sqlite3) | Persistent local storage, perfect for single-user app |
| **Parsing** | fast-xml-parser | Handles large Apple Health XML exports efficiently |
| **Visualization** | Recharts | React-native charts, responsive, low overhead |
| **UI Components** | shadcn/ui + Tailwind | Modern, accessible, rapid development |
| **Data Processing** | Node.js (TypeScript) | Built into Next.js API routes, no separate backend |

---

## Project Structure

```
ralph-0/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard home
│   │   ├── import/
│   │   │   └── page.tsx                # Manual import & sync config
│   │   └── api/
│   │       ├── import/route.ts         # XML upload & parsing
│   │       ├── sync/route.ts           # Auto-sync endpoint
│   │       └── analytics/route.ts      # Fitness calculations
│   ├── components/
│   │   ├── charts/
│   │   │   ├── TrendChart.tsx          # Line/area charts
│   │   │   ├── MetricCard.tsx          # Summary cards
│   │   │   ├── FitnessScore.tsx        # Overall fitness indicator
│   │   │   └── ProgressChart.tsx       # Category breakdowns
│   │   ├── dashboard/
│   │   │   ├── Overview.tsx            # Main dashboard layout
│   │   │   ├── CardioMetrics.tsx       # HR, VO2max, HRV
│   │   │   ├── ActivityMetrics.tsx     # Steps, exercise, energy
│   │   │   ├── VitalsMetrics.tsx       # Weight, BP, sleep
│   │   │   └── RecoveryMetrics.tsx     # Sleep, HRV, readiness
│   │   └── import/
│   │       ├── FileUpload.tsx          # Drag-drop upload UI
│   │       └── SyncSetup.tsx           # Auto-sync configuration
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts               # SQLite table definitions
│   │   │   ├── client.ts               # DB initialization & connection
│   │   │   └── queries.ts              # Reusable data queries
│   │   ├── parsers/
│   │   │   ├── xml-parser.ts           # Apple Health XML parsing
│   │   │   └── data-mapper.ts          # Map to database schema
│   │   ├── analytics/
│   │   │   ├── fitness-score.ts        # Scoring algorithm
│   │   │   ├── trend-analysis.ts       # Statistical trend detection
│   │   │   └── metrics.ts              # Metric aggregations
│   │   ├── sync/
│   │   │   ├── sync-daemon.ts          # Background sync handler
│   │   │   └── device-integration.ts   # iPhone communication
│   │   └── utils/
│   │       ├── date-helpers.ts
│   │       └── formatters.ts
│   ├── types/
│   │   ├── health-data.ts
│   │   └── analytics.ts
│   └── config/
│       └── metrics.ts                  # Apple Health type mappings
├── data/
│   └── health.db                       # SQLite database (gitignored)
├── scripts/
│   └── init-db.ts                      # Initialize database on startup
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .gitignore
```

---

## Data Import Strategy: Automatic Sync

### Challenge
Web apps cannot directly access iPhone data. Solution uses hybrid approach:

### Approach 1: iPhone File Sharing (Recommended MVP)
1. User exports health data from iPhone's Health app → ZIP file
2. Optional: Save to iCloud Drive or Dropbox
3. User initiates sync via web UI → App checks for latest export
4. Manual trigger keeps it simple while feeling "automatic"

**Pros:** Works immediately, no complex setup
**Cons:** Not fully automatic, user must export periodically

### Approach 2: HTTPS Sync Server (Post-MVP)
1. Small Node.js sync daemon runs on user's machine (port 3001)
2. iPhone shortcuts app periodically calls daemon to receive fresh data
3. Daemon extracts Apple Health data and sends to main app
4. Fully automatic but requires shortcuts automation setup

**Implementation Timeline:** Core feature first (Approach 1), add Approach 2 later if desired.

### Recommended Initial Implementation
- Start with **Approach 1 (manual export trigger)**
- UI prominently shows "Last Sync: X days ago"
- Clear instructions on exporting Apple Health data
- One-click "Check for new data" button
- Can evolve to true automation later

---

## Core Features

### 1. Dashboard Overview
- **Fitness Score Display** (0-100 gauge)
  - Weighted average of cardio, activity, body, and recovery scores
  - Color coding: Red (<50), Yellow (50-70), Green (70+)
  - Trend indicator showing direction (improving/stable/declining)

- **Four Metric Cards**
  - Cardio Fitness: VO2 max, resting heart rate, HRV
  - Activity Level: Daily steps, exercise minutes, active energy
  - Body: Weight trend, body fat %, BMI
  - Recovery: Sleep duration/quality, HRV recovery

- **Interactive Charts**
  - 30/60/90/365 day views
  - Trend lines showing direction
  - Color-coded improvement/decline
  - Click to expand for detailed view

### 2. Data Import
- Drag-and-drop ZIP/XML file upload
- Progress indicator for large imports (100MB+)
- Results summary: "Imported 50,000 records from 6/2022 to 1/2025"
- Deduplication: Skip records already in database
- Background processing to not block UI

### 3. Sync Management
- Display last sync timestamp
- Manual "Check Now" button
- Estimated data freshness
- Auto-sync status indicator when Approach 2 is added

### 4. Detailed Metric Views
- Individual metric charts with full analytics
- Workout frequency and type breakdown
- Best and worst days/weeks/months
- Correlation insights (e.g., "Sleep and VO2 max correlate")

---

## Database Schema

### records (All health metrics)
```sql
CREATE TABLE records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,           -- e.g., 'HKQuantityTypeIdentifierStepCount'
  readable_type TEXT NOT NULL,  -- e.g., 'Steps'
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  source_name TEXT,             -- App that recorded it
  device TEXT,                  -- Device type (iPhone, Apple Watch)
  start_date TEXT NOT NULL,     -- ISO 8601
  end_date TEXT NOT NULL,
  created_date TEXT,
  UNIQUE(type, start_date, end_date, source_name),
  CHECK(start_date <= end_date)
);

CREATE INDEX idx_records_type_date ON records(type, start_date DESC);
```

### workouts
```sql
CREATE TABLE workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_type TEXT NOT NULL,   -- 'Running', 'Cycling', 'Strength', etc.
  duration_minutes REAL NOT NULL,
  distance_km REAL,
  total_energy_kcal REAL,
  avg_heart_rate INTEGER,
  source_name TEXT,
  device TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL
);

CREATE INDEX idx_workouts_type_date ON workouts(workout_type, start_date DESC);
```

### fitness_scores (Computed daily)
```sql
CREATE TABLE fitness_scores (
  date TEXT PRIMARY KEY,        -- YYYY-MM-DD
  cardio_score REAL,            -- 0-100
  activity_score REAL,          -- 0-100
  body_score REAL,              -- 0-100
  recovery_score REAL,          -- 0-100
  overall_score REAL,           -- 0-100
  trend_direction TEXT,         -- 'improving', 'stable', 'declining'
  computed_at TEXT
);

CREATE INDEX idx_scores_date ON fitness_scores(date DESC);
```

---

## Fitness Scoring Algorithm

### Overall Score: Weighted Composite (0-100)

**Cardio Fitness (40% weight)**
- VO2 Max trend (if available): Points based on change over 90 days
- Resting Heart Rate trend: Lower is better
- Heart Rate Variability trend: Higher is better
- Walking/running pace improvement

**Activity Level (30% weight)**
- Average daily steps: 10K+ = max points
- Weekly exercise minutes: 150+ = max points
- Active energy burned trend
- Workout consistency and frequency

**Body Composition (15% weight)**
- Weight trend relative to healthy BMI
- Body fat percentage trend
- Consistency of measurements

**Recovery (15% weight)**
- Sleep duration (target: 7-9 hours)
- Sleep consistency (regular schedule)
- Heart rate variability (HRV indicator)

### Trend Detection (90-day windows)
1. Divide last 90 days into two 45-day periods
2. Calculate mean for each metric in each period
3. Compare: If change > 0.5 SD → "Improving/Declining", else "Stable"
4. Aggregate trends: If 3+ metrics improving → Overall "Improving"

### Insight Generation
Examples:
- "Your cardio fitness is improving! VO2 max up 3.2% and resting HR down 2 bpm"
- "Consistent daily activity - averaging 12,500 steps"
- "Recovery score declining - check sleep consistency (was 7.2 hrs, now 6.5)"

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
1. Initialize Next.js project with TypeScript + Tailwind
2. Set up SQLite database and schema
3. Create data type definitions
4. Install and configure all dependencies (recharts, fast-xml-parser, etc.)

**Deliverable:** Empty dashboard with layout structure

### Phase 2: Data Import (Days 3-4)
1. Build XML parser for Apple Health exports
2. Create import API route with file upload
3. Build FileUpload UI component
4. Test with real Apple Health export data

**Deliverable:** Ability to upload and parse health data

### Phase 3: Analytics Engine (Days 5-6)
1. Implement fitness scoring algorithm
2. Build trend analysis and statistical calculations
3. Create analytics API route
4. Compute daily fitness scores for historical data

**Deliverable:** Scoring system working on imported data

### Phase 4: Visualization (Days 7-9)
1. Build metric cards and trend charts with Recharts
2. Create dashboard overview with fitness score gauge
3. Build category-specific metric views
4. Add date range selector and filtering

**Deliverable:** Full dashboard with interactive charts

### Phase 5: Sync & Polish (Days 10-11)
1. Implement sync management UI
2. Add auto-sync detection for new data
3. Error handling and edge cases
4. Performance optimization (caching, indexing)
5. UX polish (loading states, empty states, tooltips)

**Deliverable:** Fully functional dashboard with sync

### Phase 6: Testing & Docs (Day 12)
1. Test with various Apple Health exports
2. Performance testing (large datasets)
3. Write setup instructions in README
4. Document Apple Health export process
5. Create troubleshooting guide

**Deliverable:** Production-ready app

---

## Critical Implementation Files

**File** | **Responsibility** | **Key Focus**
---------|------------------|---------------
`src/lib/parsers/xml-parser.ts` | Parse Apple Health XML exports | Streaming parser for 100MB+ files, handle all metric types, date normalization
`src/lib/analytics/fitness-score.ts` | Calculate fitness metrics | Scoring algorithm, trend detection, insight generation
`src/app/api/import/route.ts` | Handle data upload and import | ZIP extraction, batch DB insert, deduplication, progress feedback
`src/components/dashboard/Overview.tsx` | Main dashboard UI | Fitness score display, metric cards, trend indicators, date filtering
`src/lib/db/client.ts` | Database initialization | Auto-create tables on first run, ensure schema consistency
`src/components/charts/TrendChart.tsx` | Reusable chart component | Recharts integration, hover tooltips, date range support

---

## Success Criteria

### Functional
- Import 100K+ health records in <30 seconds
- Calculate fitness score in <1 second
- Dashboard loads and renders in <3 seconds
- Support iOS 14+ data (all recent versions)
- Handle all four metric categories (cardio, activity, body, recovery)

### User Experience
- Zero-configuration startup (runs immediately with `npm run dev`)
- Intuitive import process (drag-and-drop works)
- Clear visual indicators of fitness trends
- Helpful tooltips explaining each metric
- Mobile-responsive dashboard

### Robustness
- Graceful error handling (bad XML, missing data)
- Data validation on import
- Deduplication of records
- Database integrity checks
- Clear error messages to user

---

## Important Notes

### Apple Health Data Access
- Apple Health data cannot be automatically fetched from web app
- Initial approach: Manual export + triggered sync check
- Future: Can add iPhone Shortcuts automation for true real-time sync
- No API key or authentication required (fully local)

### Privacy & Security
- All data stored locally in SQLite database
- No external API calls with health data
- No cloud sync by default
- User has full control over data

### Performance Considerations
- Use database indexes heavily for date-range queries
- Lazy-load charts (Recharts renders efficiently)
- Pagination for large datasets (show last 90 days by default)
- Cache daily fitness scores to avoid recalculation

---

## Verification Plan

### Testing the Implementation
1. **Export Test Data**
   - Export real Apple Health data from iPhone
   - Should contain: steps, workouts, HR, vitals, sleep

2. **Import Test**
   - Upload export ZIP via drag-drop
   - Verify all records imported without errors
   - Check database contains correct record count

3. **Dashboard Test**
   - View fitness score (should calculate correctly)
   - Check metric cards show recent data
   - Filter by different date ranges
   - Verify trend indicators match actual data direction

4. **Analytics Test**
   - Compare calculated scores with manual calculations
   - Verify trend detection is accurate
   - Test edge cases (no data, single data point, all same value)

5. **Performance Test**
   - Time import of 100K+ records
   - Measure dashboard load time
   - Check for memory issues with large datasets

6. **Error Handling Test**
   - Upload invalid XML file
   - Upload missing export
   - Interrupt mid-upload
   - Test database corruption scenarios

---

## Next Steps (After Plan Approval)

1. Initialize Next.js project
2. Set up database schema
3. Begin Phase 1 setup
4. Build out XML parser
5. Create initial import/dashboard flow
6. Iterate based on real Apple Health data testing
