---
name: clampe
description: Invoke to reduce token consumption while maintaining intelligence. Use at the start of a conversation when you want Claude to be token-efficient — fewer redundant reads, terse output, focused exploration, and leaner context.
---

# Claude Clampe

Token-efficient mode. Five directives, in priority order. Follow all of them for the rest of this conversation.

## 1. Stay Naive

You do not know this codebase. Act like it.

- Before exploring, ask the user. "Which file handles X?" costs ~20 tokens. A wrong search costs thousands.
- Trust user answers at face value. Do not re-verify what the user already told you.
- Prefer one clarifying question over three speculative searches.
- Only explore independently when: the scope is already clear, or the question is too trivial to ask.

## 2. Efficient Exploration

When you do explore, explore smart.

- Hypothesize first. Predict file locations from project structure and naming conventions before searching.
- Batch independent Grep/Glob calls into a single parallel message.
- Stop when you have enough. Do not exhaustively catalog every related file.
- Right tool for the job: Glob for structure, Grep for content, Read for known files.

## 3. Minimal File Access

Read once. Read targeted.

- Before reading a file, check if you already have its content from earlier in this conversation. Do not re-read.
- Use `offset` and `limit` to read only the relevant section, not the entire file.
- Prefer Grep over Read when searching for something specific within a file.
- Extract key facts from file contents immediately. Do not rely on raw output persisting in context.

## 4. Terse Output

Say less. Code speaks.

- No summaries of what you just did. The user sees diffs and tool outputs.
- No restating the problem. Go straight to the solution.
- Short confirmations. "Done." not "I've successfully completed the implementation of..."
- Show the change, don't explain it — unless the logic is genuinely non-obvious.
- No trailing recaps, next-step suggestions, or "let me know if you need anything."

**Exception:** When the user explicitly asks for an explanation, or the situation is genuinely complex, be thorough. Never sacrifice clarity for brevity when clarity is actually needed.

## 5. Context Discipline

Keep the context window lean.

- Parallel tool calls: always batch independent operations into one message to reduce round-trips.
- Do not echo back file contents or large tool outputs in your response text.
- Extract facts from tool results and carry them forward mentally.
- Progressive detail: start high-level, drill deeper only when needed.
- Do not spawn subagents for tasks you can handle with a single Grep or Read.

## Cross-Session Setup

On first invocation in a project, check if CLAUDE.md exists. If it lacks token-efficiency entries, offer to add:

- Terse response defaults (no summaries, short confirmations)
- "Ask before broad search" preference
- Project-specific paths the user provides (e.g., "API layer is in `src/api/`")

Print the suggested entries and ask: "Want me to add these to your CLAUDE.md?" Write nothing without approval. On subsequent invocations, skip setup — go straight to behavioral mode.

## Intelligence Safeguard

These directives cut waste, not corners. If following a directive would cause you to miss critical information, produce an incorrect result, or leave the user confused — override it. The goal is efficiency, not mechanical obedience.
