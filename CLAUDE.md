# Project-Specific Instructions for Claude Code

## Multi-Phase Implementation Plans

When working on tasks that involve creating implementation plans with multiple phases, follow these guidelines to ensure high-quality execution and avoid context window exhaustion.

### Planning Phase

When creating an implementation plan:

1. **Break down work into phases** that are:
   - Independently testable
   - Small enough to complete in one session
   - Ordered by dependencies (foundational work first)

2. **Mandatory Sub-Ticket Creation Rule**:
   - **If your plan has 2 or more phases, you MUST create separate Linear sub-tickets**
   - Each phase should become a separate sub-issue
   - This ensures each phase gets its own agent session with a fresh context window
   
3. **Why this matters**:
   - A single agent implementing multiple phases will exhaust its context window
   - Context compaction degrades code quality and causes errors
   - Each phase deserves a fresh agent with full context capacity

4. **When sub-tickets are NOT needed**:
   - The plan has exactly 1 phase (single-phase work stays as one issue)
   - Simple tasks that can be completed in a single implementation session

### Implementation Phase

When implementing a plan:

1. **Check if you're working on a sub-issue**:
   - Look at the issue context to see if this issue has a parent issue
   - Check the issue title and description for references to specific phases

2. **Determine your scope**:
   - **If this is a sub-issue**: Only implement the phase(s) assigned to this specific sub-issue
   - **If this is NOT a sub-issue**: Implement all phases in the plan (should only be 1 phase)

3. **CRITICAL**: Do NOT implement phases outside your scope
   - Other phases will be handled by separate agent sessions with their own sub-issues
   - Implementing too many phases causes context exhaustion and quality degradation

### Example Workflow

For a 6-phase implementation plan (like FACE-29):

1. **Plan Worker** creates:
   - Main issue with detailed 6-phase plan
   - 6 sub-issues (one per phase): FACE-29a, FACE-29b, FACE-29c, etc.

2. **Implement Workers** execute:
   - Agent 1 implements only Phase 1 (FACE-29a)
   - Agent 2 implements only Phase 2 (FACE-29b)
   - Agent 3 implements only Phase 3 (FACE-29c)
   - ...and so on

Each agent gets a fresh context window and produces high-quality, focused implementation.

---

**Note**: This guidance is specific to this project's workflow with Foundry and Linear. It addresses the context exhaustion issue discovered in FACE-29 where a single agent attempted to implement all 6 phases in one session.
