# PR: FACE-28 - Fix analytics static data and data loss on restart

**Branch**: `foundry/FACE-28`
**Linear Issue**: FACE-28
**Date**: 2026-02-06

## Summary

Fixes two bugs in the analytics dashboard: category scores showing identical values regardless of the selected time range, and data disappearing after server restart.

## Problem

1. The dashboard displayed the same fitness scores (e.g., Cardio 62.5, Activity 94.4) for all time periods (30d/60d/90d/1yr) because the API always fetched the global latest score using `getLatestFitnessScore()` which ignored the selected range.

2. After stopping and restarting the dev server, the dashboard showed "No data yet" despite data existing in the SQLite database. This was caused by `better-sqlite3` (a native Node.js module) not being properly excluded from Next.js's bundler.

## Solution

1. **Range-specific scores**: Added `computeScoreForWindow(start, end)` that computes fitness scores using exactly the selected date range as the data window. A 30-day selection now scores from 30 days of data; 365-day from a full year. The daily trend chart still uses 90-day rolling windows per the PRD.

2. **Native module fix**: Added `serverExternalPackages: ['better-sqlite3']` to `next.config.ts` so Next.js properly handles the native module.

## Changes

### Files Changed
- `next.config.ts` - Added `serverExternalPackages` for `better-sqlite3`
- `src/app/api/analytics/route.ts` - Use `computeScoreForWindow` for card scores, skip computation when no records, include `total_records` in response
- `src/lib/analytics/fitness-score.ts` - Added `computeScoreForWindow()` and supporting helper functions

### Previously staged changes (from earlier agent work on this branch)
- `package.json` / `package-lock.json` - Dependency updates
- `src/app/page.tsx` - Dashboard page improvements
- `src/lib/db/queries.ts` - Query improvements
- `src/lib/parsers/xml-parser.ts` - XML parser improvements

## Testing

### Automated
- [x] TypeScript compiles (`npx tsc --noEmit`)
- [x] Lint passes (`npm run lint`) - 0 errors, 4 pre-existing warnings

### Manual Verification
- Verify that selecting different time ranges (30d/60d/90d/1yr) produces different scores on the metric cards
- Verify that stopping and restarting the dev server still shows data on the dashboard
- Verify the score trend chart shows appropriate number of data points per range

## Breaking Changes

None

## Migration Notes

None

---
🤖 Created by [Foundry](https://github.com/leixusam/foundry) with [Claude Code](https://claude.ai/claude-code)
