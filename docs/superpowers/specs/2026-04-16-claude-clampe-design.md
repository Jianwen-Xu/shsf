# Claude Clampe — Design Spec

## Context

Claude Code is powerful but token-expensive. Common usage patterns — redundant file reads, verbose responses, broad exploratory searches, and growing context windows — burn tokens without proportional value. Claude Clampe is a Claude Code skill plugin that reduces token consumption within and across conversations while preserving output intelligence. It works by injecting behavioral directives that teach Claude to be efficient, not dumb.

## Overview

- **Type:** Claude Code skill plugin (behavioral prompt)
- **Activation:** Explicit invocation via `/clampe`
- **Scope:** Active for the entire conversation once invoked
- **License:** MIT
- **Audience:** Claude Code users (personal + public)

## Plugin Structure

```
claude-clampe/
├── .claude-plugin/
│   └── plugin.json            # Plugin metadata
├── skills/
│   └── clampe/
│       └── skill.md           # Core behavioral skill
├── LICENSE
└── README.md
```

## Core Design: Five Behavioral Directives

The skill prompt consists of five directives, applied in priority order. Directive 5 (Stay Naive) acts as a gatekeeper — ask the user before resorting to exploration.

### Priority Order

```
User gives task
    │
    ▼
5. Stay Naive ──► Can the user narrow scope? ──yes──► Ask them
    │                                                    │
    no / scope already clear                             ▼
    │                                          User answers, scope narrows
    ▼                                                    │
3. Efficient Exploration ◄───────────────────────────────┘
    │
    ▼
1. Minimal File Access ──► Read targeted, read once
    │
    ▼
2. Terse Output ──► Respond concisely
    │
    ▼
4. Context Discipline ──► Keep context lean
```

### Directive 1: Minimal File Access

**Targets:** Redundant file reads

- Read a file once per conversation. Before reading, check if you already have the content.
- Use `offset` and `limit` to read only relevant sections, not entire files.
- Prefer Grep over Read when searching for something specific.
- Extract key facts from file contents; don't rely on raw output persisting in context.

### Directive 2: Terse Output

**Targets:** Verbose responses

- No summaries of what you just did. The user sees diffs and tool outputs.
- No restating the problem. Go straight to the solution.
- Short confirmations: "Done." not "I've successfully completed..."
- Code speaks. Show the change; don't explain unless logic is non-obvious.
- **Exception:** When the user asks for an explanation or the situation is genuinely complex, be thorough. Never sacrifice clarity for brevity when clarity is needed.

### Directive 3: Efficient Exploration

**Targets:** Over-exploration

- Hypothesize first. Use project structure and naming conventions to predict file locations before searching.
- Batch independent Grep/Glob calls into a single parallel message.
- Stop when you have enough. Don't exhaustively catalog every related file.
- Use the right tool: Glob for structure, Grep for content, Read for known files.

### Directive 4: Context Discipline

**Targets:** Context bloat

- Parallel tool calls: always batch independent operations into one message.
- Don't echo back file contents or large outputs in response text.
- Extract facts from tool results; carry them forward mentally.
- Progressive detail: start high-level, drill down only when needed.

### Directive 5: Stay Naive

**Targets:** All four pain points

- Before exploring, ask. If the user can narrow the scope, let them. A question costs ~20 tokens; a wrong exploration costs thousands.
- Trust user input. Accept what the user says about their codebase at face value.
- Prefer questions over assumptions. Don't verify things the user already stated.
- Increase engagement. Frame questions naturally — the collaboration becomes more interactive and more efficient simultaneously.
- Only explore independently when: the question is too trivial to bother the user, or the user has already provided clear scope.

## Cross-Session Strategy

For token savings that persist across conversations, the skill supports a **setup mode** on first invocation per project. It suggests CLAUDE.md entries for:

- Terse response defaults (no summaries, short confirmations)
- "Ask before broad search" as a project-level preference
- Project-specific context the user provides (e.g., "API layer is in `src/api/`")

No database or state files — just CLAUDE.md. The skill suggests entries; the user decides what to add.

**Setup flow:** When invoked, the skill checks if CLAUDE.md exists. If not (or if the user asks), it prints suggested entries and asks: "Want me to add these to your CLAUDE.md?" The user approves or edits before anything is written. This runs once; subsequent `/clampe` invocations skip setup and go straight to behavioral mode.

## Skill Prompt Design Principles

The skill practices what it preaches:

- `skill.md` stays under ~800 words — dense, imperative-style writing
- No examples or verbose explanations (Claude already knows how; it needs the reminder)
- Imperative voice throughout: "Do X" not "You should consider X"
- The prompt itself is a model of the behavior it teaches

## Intelligence Preservation Guarantees

Token savings must never degrade output quality. Three safeguards:

1. **Context preservation:** Key information is extracted and retained even when raw outputs are discarded.
2. **Quality exceptions:** Terse mode explicitly defers to thoroughness when the user asks for explanations or the situation demands it.
3. **Adaptive judgment:** Stay Naive teaches Claude to ask *when it doesn't know*, rather than blanket-reducing all exploration. When the scope is clear, full intelligence applies.

## Verification Plan

1. **Install the plugin** in a test Claude Code environment.
2. **Invoke `/clampe`** and run a realistic coding task.
3. **Compare token usage** (visible in Claude Code session stats) with and without the skill active on the same task.
4. **Verify intelligence:** Output should be equally correct and complete — just less verbose and with fewer redundant operations.
5. **Test edge cases:** Complex tasks that genuinely need thorough exploration should still work well (the exception clauses should fire).
6. **Cross-session:** Run setup mode, restart conversation, verify CLAUDE.md entries persist the behaviors.

---

## v0.3 — Spec-Driven Mode (2026-04-16)

### Motivation

v0.1 (behavioral suggestions) and v0.2 (hard rules) both reduced token usage, but not dramatically. The fundamental issue: even with strict rules, Claude still spends tokens *thinking* — exploring, reasoning, composing. The biggest savings come from not thinking at all, but executing from a pre-built spec.

### Core Concept

Shift cognitive work from Claude (expensive tokens) to the user (free brainpower). The user fills out a structured spec file offline; Claude reads it and executes with near-zero exploration.

### Two-Phase Flow

1. **Generate Spec:** Claude creates `.clampe/spec.md` — a structured questionnaire tailored to the task. No tool calls, no exploration. Fields: Task, Files to Modify, Current Behavior, Desired Behavior, Constraints, Dependencies, Test Plan.
2. **Execute from Spec:** User says "go." Claude reads the spec and executes using only the information provided. No exploration beyond what the spec specifies.

### Why This Works

- A spec file replaces dozens of back-and-forth messages and tool calls
- The user's domain knowledge is captured once, precisely, in a structured format
- Claude's execution phase is almost pure action — reads spec, makes edits, done
- The spec is reusable (similar future tasks can reuse the same file as a template)
