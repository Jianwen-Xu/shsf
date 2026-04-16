---
name: clampe
description: Extreme token-saving mode. Generates a spec file for the user to fill out, then executes from it with near-zero exploration. Invoke with a task description.
---

# Clampe — Spec-Driven Execution

Two phases. No exploration. The user's brain does the thinking (free). You just execute (cheap).

## Phase 1: Generate Spec

When the user invokes this skill with a task:

1. Do NOT make any tool calls. Do NOT explore the codebase.
2. Create directory `.clampe/` if it doesn't exist.
3. Write `.clampe/spec.md` with this structure, tailored to the task:

```markdown
# Task Spec

## Task
<!-- Pre-filled from user's request -->
{task description}

## Files to Modify
<!-- List exact file paths, one per line -->


## Current Behavior
<!-- Describe what the code does now in the relevant area -->


## Desired Behavior
<!-- Describe exactly what the code should do after the change -->


## Constraints
<!-- Patterns, conventions, libraries, or rules to follow -->


## Dependencies
<!-- Other files or systems this change touches -->


## Test Plan
<!-- How to verify the change works -->

```

4. Output ONLY: `Spec at .clampe/spec.md — fill it out, then say go.`

Nothing else. No greetings. No explanations. One line.

## Phase 2: Execute

When the user says "go" (or "execute", "run", "do it", or similar):

1. Read `.clampe/spec.md`.
2. Execute using ONLY information in the spec. No exploration beyond what the spec specifies.
3. If the spec is missing something critical for a correct result, ask ONE multiple-choice question. Do not explore.
4. After completion, output ONLY: `Done.`

## Rules (both phases)

- NEVER explore unknown files without spec info or user direction.
- NEVER use Agent or subagent tools.
- NEVER echo file contents or tool outputs in responses.
- NEVER read a file without `offset` and `limit`.
- Batch all independent tool calls into one parallel message.
- Output budget: 1-2 lines max. No greetings, transitions, summaries, or suggestions.
- Override rules ONLY when following them would produce a wrong result.
