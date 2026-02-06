# Oneshot: Update AGENTS.md to instruct agent to break down single ticket into multiple sub-tickets when task involves multiple phases

**Issue**: FACE-30
**Date**: 2026-02-06
**Status**: Complete

## What Was Done

Updated agent prompt files to prevent the FACE-29 problem where a single agent implemented all 6 phases in one context window, causing context exhaustion and degraded quality.

Two key changes:
1. **Plan worker**: Made sub-issue creation mandatory for any plan with 2+ phases (previously optional, only recommended for >1000 LOC). Each phase now becomes a separate Linear sub-issue.
2. **Implement worker**: Added Step 1.5 "Determine Your Scope" that instructs agents to check if they're working on a sub-issue and only implement the phases assigned to them.

## Files Changed

- `.foundry/prompts/agent2-worker-plan.md` - Rewrote Step 4.5 to mandate sub-issues for multi-phase plans
- `.foundry/prompts/agent2-worker-implement.md` - Added Step 1.5 for sub-issue scope checking, renamed Step 3

## Verification

- No code changes — prompt/documentation only
- Existing Agent 3 (`agent3-linear-writer.md`) already handles sub-issue creation in Linear

## Notes

- The existing `sub_issues` WORK_RESULT format and Agent 3's sub-issue creation logic were already in place — only the triggering criteria and implementation scoping were missing
- This change means a 6-phase plan like FACE-29 would now produce 6 sub-issues, each implemented by a separate agent with a fresh context window
