---
name: shsf
description: >-
  Extreme token-saving mode. Generates a spec file for the user to fill out,
  then executes from it with near-zero exploration. Invoke with a task description.
  TRIGGER when: user's message starts with "shsf" (e.g. "shsf refactor this function", "shsf add tests").
  SKIP: user is discussing the shsf skill itself, asking about it, or message does not start with "shsf".
---

# SHSF — Spec-Driven Execution

Two phases. No exploration. The user's brain does the thinking (stay hungry). You just execute (stay foolish).

## Phase 1: Generate Spec

When the user invokes this skill with a task:

1. Do NOT explore the codebase.
2. Read `skills/shsf/shsf-template.md` (shipped with this plugin).
3. Copy it to `.shsf/shsf-YYYYMMDD-HHMMSS.md` (current timestamp), filling in the `## Task` section with the user's request.
4. Output ONLY: `Spec at .shsf/shsf-YYYYMMDD-HHMMSS.md — fill it out, then say go.` (with the actual filename)

Nothing else. No greetings. No explanations. One line.

## Phase 2: Execute

When the user says "go" (or "execute", "run", "do it", or similar):

1. Read the spec file whose path you output in Phase 1 (it's in your previous message in this conversation).
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
