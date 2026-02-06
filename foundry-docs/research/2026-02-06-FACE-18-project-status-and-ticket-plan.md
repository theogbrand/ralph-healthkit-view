# Research: Project Status and Ticket Plan

**Issue**: FACE-18
**Date**: 2026-02-06
**Status**: Complete

## Summary

Ralph is an Apple Health fitness dashboard (Next.js + SQLite) currently at roughly Phase 2.5 of a 6-phase plan. Phase 1 (Foundation) and Phase 2 (Data Import) are complete. Phase 3 (Analytics Engine) has the core scoring algorithm implemented but lacks an API route, trend-analysis module, and metrics-aggregation module. Phases 4-6 (Visualization, Sync & Polish, Testing & Docs) have not been started. The dashboard and metric cards are placeholder-only with no live data integration.

## Requirements Analysis

The PRD defines a local-first Next.js web app that:
1. Imports Apple Health XML/ZIP exports
2. Stores data in SQLite (records, workouts, fitness_scores)
3. Computes fitness scores across 4 categories (cardio 40%, activity 30%, body 15%, recovery 15%)
4. Displays an interactive dashboard with trend charts, metric cards, and fitness score gauge
5. Provides sync management for data freshness
6. Is fully local, privacy-first, zero-config

## Codebase Analysis

### What's Built (Complete)

| Component | Files | Status |
|-----------|-------|--------|
| **Next.js project scaffold** | `package.json`, `layout.tsx`, `globals.css` | Done |
| **SQLite database layer** | `lib/db/client.ts`, `lib/db/schema.ts`, `lib/db/queries.ts` | Done - 3 tables (records, workouts, fitness_scores), WAL mode, batch inserts, query helpers |
| **TypeScript types** | `types/health-data.ts`, `types/analytics.ts` | Done - HealthRecord, Workout, FitnessScore, DashboardData, etc. |
| **Metric config** | `config/metrics.ts` | Done - 22 health types mapped, workout types, score weights/thresholds |
| **XML parser** | `lib/parsers/xml-parser.ts` | Done - Parses Apple Health XML, extracts records + workouts, ZIP support via adm-zip |
| **Data mapper** | `lib/parsers/data-mapper.ts` | Done - Maps parsed data to DB schema, deduplication, category filtering |
| **Import API** | `app/api/import/route.ts` | Done - POST (upload + parse + insert), GET (stats) |
| **FileUpload UI** | `components/import/FileUpload.tsx` | Done - Drag-drop, progress, results display |
| **Import page** | `app/import/page.tsx` | Done - Uses FileUpload, export instructions |
| **Fitness scoring** | `lib/analytics/fitness-score.ts` | Done - All 4 category scores + overall + trend detection |
| **Utilities** | `lib/utils/date-helpers.ts`, `lib/utils/formatters.ts` | Done - Date range helpers, metric formatting, score colors |
| **UI components** | `components/ui/` (card, button, tabs, progress) | Done via shadcn/ui |
| **DB init script** | `scripts/init-db.ts` | Done |

### What's NOT Built (Missing)

| Component | PRD Location | Status |
|-----------|-------------|--------|
| **Analytics API route** | `app/api/analytics/route.ts` | Missing - No endpoint to serve computed fitness scores to frontend |
| **Trend analysis module** | `lib/analytics/trend-analysis.ts` | Missing - Statistical trend detection module (basic version exists in fitness-score.ts `detectTrend`) |
| **Metrics aggregation module** | `lib/analytics/metrics.ts` | Missing - Metric aggregations for dashboard display |
| **TrendChart** | `components/charts/TrendChart.tsx` | Missing - Line/area charts with Recharts |
| **MetricCard** | `components/charts/MetricCard.tsx` | Missing - Summary cards with live data |
| **FitnessScore gauge** | `components/charts/FitnessScore.tsx` | Missing - 0-100 score gauge |
| **ProgressChart** | `components/charts/ProgressChart.tsx` | Missing - Category breakdowns |
| **Overview** | `components/dashboard/Overview.tsx` | Missing - Main dashboard layout (currently inline in page.tsx) |
| **CardioMetrics** | `components/dashboard/CardioMetrics.tsx` | Missing |
| **ActivityMetrics** | `components/dashboard/ActivityMetrics.tsx` | Missing |
| **VitalsMetrics** | `components/dashboard/VitalsMetrics.tsx` | Missing |
| **RecoveryMetrics** | `components/dashboard/RecoveryMetrics.tsx` | Missing |
| **SyncSetup** | `components/import/SyncSetup.tsx` | Missing |
| **Sync API** | `app/api/sync/route.ts` | Missing |
| **Sync daemon** | `lib/sync/sync-daemon.ts` | Missing |
| **Device integration** | `lib/sync/device-integration.ts` | Missing |
| **Dashboard page (live)** | `app/page.tsx` | Exists but placeholder-only, no data fetching |

### Existing Patterns

- **Server-side data access**: DB queries use `better-sqlite3` synchronously, called from API routes
- **Client components**: Marked with `'use client'` when needed (FileUpload, import page)
- **UI**: shadcn/ui components + Tailwind CSS
- **API routes**: Next.js App Router pattern with `route.ts` files
- **Charting**: Recharts is installed but unused

### Dependencies

All key dependencies are installed:
- `next@16.1.6`, `react@19.2.3`, `typescript@^5`
- `better-sqlite3@^12.6.2` (SQLite)
- `fast-xml-parser@^5.3.4` (XML parsing)
- `adm-zip@^0.5.16` (ZIP extraction)
- `recharts@^3.7.0` (Charts - installed but unused)
- `radix-ui@^1.4.3`, `tailwindcss@^4` (UI)

## Implementation Considerations

### Approach

Development should proceed in this order:
1. **Analytics API** (connect scoring engine to frontend)
2. **Chart components** (TrendChart, FitnessScore gauge, MetricCard)
3. **Dashboard integration** (wire live data into dashboard page)
4. **Category detail views** (CardioMetrics, ActivityMetrics, etc.)
5. **Sync management** (sync UI, status display)
6. **Polish & testing** (error states, empty states, performance)

### Risks

- **No test data**: The app has never been tested with real Apple Health exports. The XML parser may have edge cases with real data.
- **Performance**: `computeFitnessScoresForRange` loops day-by-day with individual DB queries per category per day - could be slow for large date ranges.
- **SQLite STDEV**: The recovery score uses `STDEV()` in a SQLite query (`fitness-score.ts:274`) - SQLite doesn't have a built-in `STDEV` function. This will throw a runtime error.
- **Sleep data parsing**: Sleep analysis is categorical data (`HKCategoryTypeIdentifierSleepAnalysis`) but treated as numeric sum. May need special handling.
- **No analytics API**: The fitness scoring functions exist but there's no API route to expose them to the frontend.

### Testing Strategy

- Unit tests for scoring algorithm with mock data
- Integration tests for import pipeline (XML parse -> DB insert -> query)
- E2E test with sample Apple Health export
- Performance test with 100K+ records

## Specification Assessment

This project involves significant UX work (dashboard layout, interactive charts, fitness score gauge, metric cards, date range filtering, trend visualization). However, the PRD already provides detailed UX specifications - specific component layouts, scoring thresholds, color coding rules, chart types, and interaction patterns are all defined. The remaining work is implementation of those specs, not UX design.

**Needs Specification**: No - The PRD serves as a comprehensive specification. Implementation can proceed directly to planning.

## Recommended Tickets

### Ticket 1: Analytics API Route
**Priority**: High (blocks dashboard)
**Scope**: Create `src/app/api/analytics/route.ts`
- GET endpoint returning current fitness scores and dashboard data
- Accept `range` query param (30d/60d/90d/365d)
- Compute or retrieve cached fitness scores
- Return data in `DashboardData` shape from `types/analytics.ts`
- Fix SQLite STDEV bug in recovery score calculation
**Estimate**: Small-Medium (~100-150 LOC)

### Ticket 2: Chart Components (TrendChart, FitnessScore, MetricCard)
**Priority**: High (blocks dashboard)
**Scope**: Build reusable chart components using Recharts
- `TrendChart.tsx`: Line/area chart with date range, hover tooltips
- `FitnessScore.tsx`: 0-100 gauge with color coding (red/yellow/green)
- `MetricCard.tsx`: Summary card with value, trend indicator, sparkline
- `ProgressChart.tsx`: Category score breakdown bars
**Estimate**: Medium (~200-300 LOC total)

### Ticket 3: Live Dashboard Integration
**Priority**: High
**Scope**: Replace placeholder dashboard with live data
- Fetch from analytics API on page load
- Display fitness score gauge with real score
- Populate metric cards with live category scores
- Add date range selector (30/60/90/365 day views)
- Show trend charts for key metrics
- Handle empty state (no data imported yet) and loading state
**Estimate**: Medium (~200-250 LOC)

### Ticket 4: Category Detail Views
**Priority**: Medium
**Scope**: Build detailed metric views per category
- `CardioMetrics.tsx`: HR, VO2 max, HRV detail charts
- `ActivityMetrics.tsx`: Steps, exercise, energy detail charts
- `VitalsMetrics.tsx`: Weight, BP, sleep detail charts
- `RecoveryMetrics.tsx`: Sleep, HRV, readiness detail charts
- Each shows individual metric charts with full analytics
**Estimate**: Medium-Large (~300-400 LOC total)

### Ticket 5: Sync Management UI
**Priority**: Low (nice-to-have for MVP)
**Scope**: Build sync status display and management
- Show last sync timestamp prominently
- "Check Now" / re-import button
- Data freshness estimate
- Import history/stats
**Estimate**: Small (~50-100 LOC)

### Ticket 6: Fix SQLite STDEV Bug & Performance
**Priority**: High (bug)
**Scope**: Fix runtime errors and performance issues
- Replace `STDEV()` call in `fitness-score.ts` with manual calculation (SQLite has no STDEV)
- Optimize `computeFitnessScoresForRange` to batch queries instead of per-day loops
- Add caching for daily fitness scores (store in `fitness_scores` table, only recompute if new data)
**Estimate**: Small-Medium (~50-100 LOC)

### Ticket 7: Testing & Error Handling
**Priority**: Medium
**Scope**: Add tests and improve robustness
- Create sample Apple Health XML test fixture
- Unit tests for scoring algorithm
- Integration tests for import pipeline
- Graceful handling of missing data types
- Empty state UX improvements
- Error boundary for chart rendering failures
**Estimate**: Medium (~200-300 LOC)

## Suggested Ticket Order

```
Ticket 6 (Bug fix)  ─┐
                      ├─> Ticket 1 (Analytics API) ─> Ticket 3 (Dashboard) ─> Ticket 4 (Detail Views)
Ticket 2 (Charts)   ─┘
                                                        Ticket 5 (Sync UI)
                                                        Ticket 7 (Testing)
```

Tickets 6, 2 can be done in parallel. Ticket 1 depends on ticket 6. Ticket 3 depends on tickets 1 and 2. Tickets 4, 5, 7 can follow after.

## Questions for Human Review

1. **Sleep data handling**: The PRD mentions sleep as a recovery metric, but Apple Health sleep data (`HKCategoryTypeIdentifierSleepAnalysis`) is categorical (asleep/inBed/awake), not a simple numeric value. Should the parser be updated to compute sleep hours from the time intervals, or is the current approach acceptable?
2. **Test data**: Is there a real Apple Health export available for testing, or should we generate synthetic test data?
3. **Sync approach**: The PRD describes two sync approaches (manual export vs. HTTPS daemon). For MVP, should we only implement the manual approach (already partially built via import), or also start on the daemon?
4. **Detailed metric pages**: Should each category (Cardio, Activity, Body, Recovery) have its own page route (e.g., `/cardio`), or should they be expandable sections within the main dashboard?

## Next Steps

Ready for planning phase. The PRD is comprehensive enough to serve as specification - no additional UX specification is needed.
