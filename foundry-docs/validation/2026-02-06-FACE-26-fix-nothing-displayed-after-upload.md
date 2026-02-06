# Validation Report: Fix Error: Nothing displayed after data is uploaded

**Issue**: FACE-26
**Date**: 2026-02-06
**Oneshot Doc**: `foundry-docs/oneshot/2026-02-06-FACE-26-fix-nothing-displayed-after-upload.md`
**Status**: PASSED

## Summary

The fix correctly addresses the root cause: computed fitness scores were not being persisted to the database, causing the dashboard to always show "No data yet". The minimal 3-line change (plus import update) saves scores before querying, resolving the issue. All automated checks pass.

## Automated Checks

### TypeScript
- Status: PASS
- `npx tsc --noEmit` completed with zero errors

### Lint
- Status: PASS (no new issues)
- 1 pre-existing error in `xml-parser.ts:188` (`no-explicit-any`) — unrelated
- 5 pre-existing warnings in other files — unrelated

### Build
- Status: PASS
- `npm run build` compiled successfully (Next.js 16.1.6 Turbopack)

## Success Criteria Verification

| Criterion | Status | Notes |
|-----------|--------|-------|
| `saveFitnessScore()` called before `getLatestFitnessScore()` | PASS | Lines 24-27 of `route.ts`: save loop executes before query |
| Computed scores persisted to `fitness_scores` table | PASS | `saveFitnessScore` uses `INSERT OR REPLACE INTO fitness_scores` |
| `getLatestFitnessScore()` can retrieve saved scores | PASS | Called on line 27 after scores are persisted |
| Fix is idempotent (safe to re-compute) | PASS | `INSERT OR REPLACE` ensures no duplicate row errors |
| Only necessary files changed | PASS | Diff shows 2 files: `route.ts` (fix) + oneshot doc |
| No new lint/type errors introduced | PASS | All new code type-checks and lints cleanly |

## Code Review

### Diff Analysis (commit `1518dd3`)

**Change 1 — Import** (`route.ts:6`):
```diff
-import { getLatestFitnessScore, getSyncStatus } from '@/lib/db/queries';
+import { saveFitnessScore, getLatestFitnessScore, getSyncStatus } from '@/lib/db/queries';
```

**Change 2 — Persist loop** (`route.ts:24-26`):
```diff
-    // Compute scores for the range
+    // Compute scores for the range and persist them
     const scores = computeFitnessScoresForRange(start, end);
+    for (const score of scores) {
+      saveFitnessScore(score);
+    }
     const latest = getLatestFitnessScore();
```

The fix is minimal, focused, and correct. The `saveFitnessScore` function was already implemented in `queries.ts:124` but was never called.

## Issues Found

None. The fix is clean and well-scoped.

## Recommendation

APPROVE: Ready for production. The fix is minimal, correct, idempotent, and all checks pass.
