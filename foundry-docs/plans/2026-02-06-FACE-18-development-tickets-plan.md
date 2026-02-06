# Implementation Plan: Research & Plan Development Tickets

**Issue**: FACE-18
**Date**: 2026-02-06
**Research**: `foundry-docs/research/2026-02-06-FACE-18-project-status-and-ticket-plan.md`
**Specification**: N/A
**Status**: Ready for Implementation

## Overview

This plan defines 7 development tickets to take the Ralph Apple Health fitness dashboard from Phase 2.5 to completion. The project has a working foundation (Next.js scaffold, SQLite DB, data import pipeline, fitness scoring algorithm) but needs the analytics API, chart components, live dashboard integration, category detail views, sync UI, bug fixes, and testing to reach a functional MVP.

## Success Criteria

- [ ] All 7 tickets filed in Linear under the FACE team
- [ ] Tickets have correct priorities, descriptions, and dependency relationships
- [ ] Tickets reference specific files, types, and patterns from the existing codebase
- [ ] Ticket ordering reflects the dependency graph

## Ticket Definitions

### Ticket 1: Fix SQLite STDEV Bug & Performance Optimization

**Title**: `Fix SQLite STDEV bug in recovery score and optimize scoring performance`
**Priority**: 1 (Urgent)
**Labels**: Bug
**Description**:

The recovery score calculation in `src/lib/analytics/fitness-score.ts` (line ~274) uses `STDEV()` which doesn't exist in SQLite. This causes a runtime error whenever recovery scores are computed.

**Changes needed:**
- `src/lib/analytics/fitness-score.ts`: Replace the `STDEV(daily_sleep)` SQL call with a manual standard deviation calculation in TypeScript (fetch all values, compute mean, compute variance, take sqrt)
- `src/lib/analytics/fitness-score.ts`: Optimize `computeFitnessScoresForRange()` to batch date queries instead of looping day-by-day with individual DB calls per category per day
- `src/lib/db/queries.ts`: Add a batch query helper for fetching records across a date range grouped by day (to support the batched scoring)

**Verification:**
```bash
npm run build
npm run typecheck
# Manually test: import data, then hit analytics endpoint — recovery score should return a number, not an error
```

**Estimate**: ~50-100 LOC changed
**Blocks**: Ticket 3 (Analytics API)

---

### Ticket 2: Chart Components (TrendChart, FitnessScore Gauge, MetricCard, ProgressChart)

**Title**: `Build reusable chart components with Recharts`
**Priority**: 2 (High)
**Labels**: Feature
**Description**:

Build the 4 chart components defined in the PRD using the already-installed Recharts library. These are reusable building blocks for the dashboard and detail views.

**Components to create:**

1. **`src/components/charts/TrendChart.tsx`** — Line/area chart
   - Props: `data: Array<{date: string, value: number}>`, `dateRange: DateRange`, `color?: string`, `showArea?: boolean`
   - Features: responsive container, date-formatted X axis, hover tooltips, trend line
   - Use Recharts `ResponsiveContainer`, `LineChart`/`AreaChart`, `Tooltip`, `XAxis`, `YAxis`

2. **`src/components/charts/FitnessScore.tsx`** — 0-100 gauge/ring
   - Props: `score: number | null`, `trend: 'improving' | 'stable' | 'declining'`, `size?: 'sm' | 'lg'`
   - Color coding per `config/metrics.ts` thresholds: red (<50), yellow (50-70), green (70+)
   - Show trend arrow indicator
   - Use Recharts `RadialBarChart` or SVG-based ring

3. **`src/components/charts/MetricCard.tsx`** — Summary card with value + sparkline
   - Props: `title: string`, `value: number | null`, `unit: string`, `trend: 'improving' | 'stable' | 'declining'`, `sparklineData?: number[]`
   - Uses existing `components/ui/card.tsx` as base
   - Shows formatted value (use `lib/utils/formatters.ts`), trend arrow, optional mini sparkline via Recharts `Sparkline`

4. **`src/components/charts/ProgressChart.tsx`** — Category score breakdown bars
   - Props: `categories: DashboardData['categories']`
   - Horizontal bar per category (cardio, activity, body, recovery) with score 0-100
   - Color coded per threshold

**Patterns to follow:**
- All components should be `'use client'` (Recharts requires client-side rendering)
- Use types from `src/types/analytics.ts` (`DateRange`, `CategoryScore`, `DashboardData`)
- Use color helpers from `src/lib/utils/formatters.ts` (`getScoreColor`)

**Verification:**
```bash
npm run build
npm run typecheck
```

**Estimate**: ~200-300 LOC total
**Blocks**: Ticket 5 (Live Dashboard)

---

### Ticket 3: Analytics API Route

**Title**: `Create analytics API route to serve fitness scores to frontend`
**Priority**: 2 (High)
**Labels**: Feature
**Description**:

Create the missing `src/app/api/analytics/route.ts` endpoint that computes and serves fitness scores and dashboard data to the frontend.

**Changes needed:**
- Create `src/app/api/analytics/route.ts`:
  - **GET handler** accepting `?range=30d|60d|90d|365d` query parameter (default: `90d`)
  - Compute date range using `lib/utils/date-helpers.ts` (`getDateRange`)
  - Call `computeFitnessScoresForRange()` from `lib/analytics/fitness-score.ts` for the requested range
  - Get latest score via `getLatestFitnessScore()` from `lib/db/queries.ts`
  - Get sync status via `getSyncStatus()` from `lib/db/queries.ts`
  - Assemble response matching `DashboardData` type from `types/analytics.ts`
  - Return JSON response with scores, category breakdowns, trend data, and sync info

**Follow the pattern from** `src/app/api/import/route.ts` for error handling, response format, and Next.js App Router conventions.

**Verification:**
```bash
npm run build
npm run typecheck
# After importing test data:
# curl http://localhost:3000/api/analytics?range=90d
```

**Estimate**: ~100-150 LOC
**Depends on**: Ticket 1 (STDEV bug fix)
**Blocks**: Ticket 5 (Live Dashboard)

---

### Ticket 4: Metrics Aggregation Module

**Title**: `Create metrics aggregation module for dashboard display`
**Priority**: 3 (Normal)
**Labels**: Feature
**Description**:

Create `src/lib/analytics/metrics.ts` — the missing aggregation module that provides higher-level metric summaries for dashboard cards and detail views.

**Functions to implement:**
- `getMetricSummary(type: string, dateRange: DateRange)` — Returns latest value, average, min, max, and trend for a single metric type
- `getCategoryMetrics(category: string, dateRange: DateRange)` — Returns summaries for all metric types in a category (e.g., cardio → HR, VO2 Max, HRV)
- `getSparklineData(type: string, days: number)` — Returns array of daily values for sparkline rendering

**Use existing functions from:**
- `src/lib/db/queries.ts`: `getDailyAverageByType`, `getDailySumByType`, `getLatestRecordByType`, `getRecordsByType`
- `src/config/metrics.ts`: `HEALTH_TYPE_MAP` for type lookups
- `src/lib/utils/date-helpers.ts`: date range calculations

**Verification:**
```bash
npm run build
npm run typecheck
```

**Estimate**: ~80-120 LOC

---

### Ticket 5: Live Dashboard Integration

**Title**: `Replace placeholder dashboard with live data from analytics API`
**Priority**: 2 (High)
**Labels**: Feature
**Description**:

Replace the static placeholder content in `src/app/page.tsx` with a fully functional dashboard that fetches live data from the analytics API and renders it with the chart components.

**Changes needed:**
- `src/app/page.tsx`: Rewrite as a client component that:
  - Fetches `DashboardData` from `/api/analytics?range={selectedRange}` on mount and range change
  - Renders `FitnessScore` gauge with `overall_score` and `overall_trend`
  - Renders 4 `MetricCard` components for each category (cardio, activity, body, recovery)
  - Renders `ProgressChart` with category breakdown
  - Renders `TrendChart` with score history
  - Adds date range selector (30d/60d/90d/365d) using existing `tabs` component
  - Shows loading skeleton while fetching
  - Shows empty state with link to `/import` when no data exists
  - Shows "Last Sync" from `DashboardData.last_sync`

**Types to use:** `DashboardData`, `DateRange` from `types/analytics.ts`
**Components to use:** `FitnessScore`, `MetricCard`, `TrendChart`, `ProgressChart` from Ticket 2

**Verification:**
```bash
npm run build
npm run typecheck
# Visual verification: npm run dev → http://localhost:3000
# Should show empty state if no data, or live dashboard if data imported
```

**Estimate**: ~200-250 LOC
**Depends on**: Ticket 2 (Charts), Ticket 3 (Analytics API)

---

### Ticket 6: Category Detail Views

**Title**: `Build category detail view components for cardio, activity, body, and recovery`
**Priority**: 4 (Low)
**Labels**: Feature
**Description**:

Build the 4 category detail components as expandable sections within the dashboard (per PRD's "Click to expand for detailed view" pattern).

**Components to create:**
1. **`src/components/dashboard/CardioMetrics.tsx`** — HR, VO2 Max, HRV individual charts
2. **`src/components/dashboard/ActivityMetrics.tsx`** — Steps, exercise minutes, active energy charts
3. **`src/components/dashboard/VitalsMetrics.tsx`** — Weight, body fat, BMI charts
4. **`src/components/dashboard/RecoveryMetrics.tsx`** — Sleep duration, sleep consistency, HRV recovery charts

Each component should:
- Accept `dateRange: DateRange` prop
- Fetch detailed metrics from analytics API (or a new `/api/analytics/category?type=cardio&range=90d` endpoint)
- Render a `TrendChart` for each individual metric in the category
- Show best/worst values and summary stats
- Use `getCategoryMetrics()` from Ticket 4

**Also create:**
- **`src/components/dashboard/Overview.tsx`** — Main dashboard layout that composes the dashboard page and category detail sections
- Wire category expand/collapse into `page.tsx`

**Verification:**
```bash
npm run build
npm run typecheck
```

**Estimate**: ~300-400 LOC total
**Depends on**: Ticket 5 (Live Dashboard), Ticket 4 (Metrics Aggregation)

---

### Ticket 7: Sync Management UI & Testing

**Title**: `Add sync management UI and core test suite`
**Priority**: 4 (Low)
**Labels**: Feature
**Description**:

**Sync UI:**
- Create `src/components/import/SyncSetup.tsx`: Show last sync timestamp, "Check Now" re-import button, data freshness estimate, import history summary
- Integrate sync status display into dashboard header (already has placeholder "Last Sync: Never")

**Testing:**
- Create sample Apple Health XML test fixture (`__tests__/fixtures/sample-export.xml`)
- Unit tests for scoring algorithm (`__tests__/lib/analytics/fitness-score.test.ts`)
- Integration test for import pipeline: XML parse → DB insert → query
- Test empty states, single data point edge case, all-same-value edge case
- Add error boundary wrapper for chart rendering failures

**Verification:**
```bash
npm run test
npm run build
npm run typecheck
```

**Estimate**: ~250-350 LOC total
**Depends on**: Ticket 5 (Live Dashboard)

## Dependency Graph

```
Ticket 1 (STDEV Bug Fix)  ──┐
                              ├──> Ticket 3 (Analytics API) ──┐
Ticket 4 (Metrics Module)   │                                 ├──> Ticket 5 (Live Dashboard) ──> Ticket 6 (Detail Views)
                              │                                 │
Ticket 2 (Chart Components) ─┘─────────────────────────────────┘
                                                                      Ticket 7 (Sync UI + Testing)
```

**Recommended execution order:**
1. Ticket 1 + Ticket 2 + Ticket 4 (parallel — no dependencies between them)
2. Ticket 3 (depends on Ticket 1)
3. Ticket 5 (depends on Tickets 2, 3)
4. Ticket 6 + Ticket 7 (parallel, both depend on Ticket 5)

## Testing Strategy

- Each ticket has its own verification commands (`npm run build`, `npm run typecheck`)
- Ticket 7 adds the formal test suite
- Manual testing with real Apple Health exports should happen after Ticket 5
- Performance testing (100K+ records) should happen as part of Ticket 7

## Rollback Plan

Each ticket is a separate branch/PR. If any ticket introduces regressions:
1. Revert the specific PR
2. Fix and re-submit

Since all changes are additive (new files/endpoints, replacing placeholder UI), rollback risk is minimal.

## Notes

- All tickets should be filed under the **FACE** team in Linear
- The PRD (`PRD.md`) serves as the specification — no separate UX spec needed
- Existing patterns to follow: API routes use Next.js App Router, components use `'use client'` when needed, DB access via `better-sqlite3` synchronous calls from server-side only
- Recharts is already installed but unused — Ticket 2 will be its first real use
- The research identified 3 open questions (sleep data handling, test data availability, sync approach, detail page routing). These can be resolved during implementation of each respective ticket. Default answers: compute sleep hours from intervals, generate synthetic test data, MVP = manual import only, detail views = expandable sections on dashboard
