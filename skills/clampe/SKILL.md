---
name: clampe
description: >-
  Extreme token-saving mode. Generates a spec file for the user to fill out,
  then executes from it with near-zero exploration. Invoke with a task description.
  TRIGGER when: user's message starts with "clp" (e.g. "clp refactor this function", "clp add tests").
  SKIP: user is discussing the clampe skill itself, asking about it, or message does not start with "clp".
---

# Clampe — Spec-Driven Execution

Two phases. No exploration. The user's brain does the thinking (free). You just execute (cheap).

## Phase 1: Generate Spec

When the user invokes this skill with a task:

1. Do NOT explore the codebase.
2. Read `skills/clampe/clp-template.md` (shipped with this plugin).
3. Copy it to `.clampe/clp-YYYYMMDD-HHMM.md` (current timestamp, e.g. `.clampe/clp-20260417-1423.md`), filling in the `## Task` section with the user's request.
4. Output ONLY: `Spec at .clampe/clp-YYYYMMDD-HHMM.md — fill it out, then say go.` (with the actual filename)

Nothing else. No greetings. No explanations. One line.

## Phase 2: Execute

When the user says "go" (or "execute", "run", "do it", or similar):

1. Read the most recent `.clampe/clp-*.md` file (latest by filename).
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
