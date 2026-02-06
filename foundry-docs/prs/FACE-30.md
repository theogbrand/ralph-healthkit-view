# PR: FACE-30 - Update agent prompts to mandate sub-ticket breakdown for multi-phase plans

**Branch**: `foundry/FACE-30`
**Linear Issue**: FACE-30
**Date**: 2026-02-06

## Summary

Updates Foundry agent prompts to prevent a single agent from implementing all phases of a multi-phase plan in one context window. After FACE-29 demonstrated that this causes context exhaustion and degraded quality, this change makes sub-issue creation mandatory for any plan with 2+ phases.

## Problem

In FACE-29, a 6-phase implementation plan was executed by a single agent in one session. This exhausted the context window, triggered context compaction, and produced lower-quality results. The root cause: the plan worker treated sub-issues as optional (only for >1000 LOC), and the implement worker had no concept of scoping to a specific phase.

## Solution

Two prompt changes ensure each phase gets its own agent session:

1. **Plan worker** (`agent2-worker-plan.md`): Rewrote Step 4.5 to mandate sub-issue creation for any plan with 2+ phases. Each phase becomes a separate Linear sub-issue.

2. **Implement worker** (`agent2-worker-implement.md`): Added Step 1.5 "Determine Your Scope" that checks whether the current issue is a sub-issue and restricts implementation to only the assigned phase(s).

## Changes

### Files Changed
- `.foundry/prompts/agent2-worker-plan.md` - Mandatory sub-issues for multi-phase plans
- `.foundry/prompts/agent2-worker-implement.md` - Phase scoping for sub-issues
- `foundry-docs/oneshot/2026-02-06-FACE-30-update-agents-sub-ticket-breakdown.md` - Oneshot documentation

## Testing

- No code changes — documentation/prompt only
- The existing Agent 3 sub-issue creation logic in `agent3-linear-writer.md` already handles the downstream processing

## Breaking Changes

None — this is additive behavior change to agent prompts.

## Migration Notes

None

## Screenshots

N/A — no UI changes

---
Created by [Foundry](https://github.com/leixusam/foundry) with [Claude Code](https://claude.ai/claude-code)
