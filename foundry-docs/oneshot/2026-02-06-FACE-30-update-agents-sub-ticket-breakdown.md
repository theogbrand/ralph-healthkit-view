# Oneshot: Add CLAUDE.md to instruct Claude Code agent to break down single ticket into multiple sub-tickets when task involves multiple phases

**Issue**: FACE-30
**Date**: 2026-02-06
**Status**: Complete

## What Was Done

Created project-specific instructions in `CLAUDE.md` to guide Claude Code agents on handling multi-phase implementation plans. This prevents the FACE-29 problem where a single agent implemented all 6 phases in one context window, causing context exhaustion and degraded quality.

Key guidance provided:
1. **Planning Phase**: Mandate sub-issue creation for any plan with 2+ phases (each phase becomes a separate Linear sub-issue)
2. **Implementation Phase**: Instruct agents to check if they're working on a sub-issue and only implement the assigned phase(s)

## Files Changed

- `CLAUDE.md` - Created project-specific instructions for Claude Code agents on multi-phase plan handling

## Approach

Instead of modifying Foundry's internal agent prompts (which would require changes to the Foundry system itself), this solution uses Claude Code's built-in support for project-specific instructions via `CLAUDE.md`. This file is automatically read by Claude Code when working in this repository, providing context-aware guidance without modifying the underlying agent infrastructure.

## Verification

- No code changes — documentation/configuration only
- Claude Code will automatically read and apply these instructions when working in this repository
- Future multi-phase plans will be split into sub-issues per the guidance

## Notes

- `CLAUDE.md` is a standard Claude Code feature for project-specific instructions
- This approach is more maintainable than modifying Foundry agent prompts
- The guidance specifically addresses the workflow of splitting multi-phase plans into multiple Linear tickets
- A 6-phase plan like FACE-29 would now produce 6 sub-issues, each implemented by a separate agent with a fresh context window
