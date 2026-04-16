# Claude Clampe

A Claude Code skill plugin that reduces token consumption while maintaining intelligence.

## What It Does

Claude Clampe injects behavioral directives that teach Claude to be token-efficient — not token-stupid. It targets the four biggest token sinks: redundant file reads, verbose responses, over-exploration, and context bloat.

## Five Directives

1. **Stay Naive** — Ask the user before exploring. They know their codebase best.
2. **Efficient Exploration** — Hypothesize first, batch searches, stop when you have enough.
3. **Minimal File Access** — Read once, read targeted, extract facts immediately.
4. **Terse Output** — No summaries, no restating. Code speaks.
5. **Context Discipline** — Parallel calls, no echoing, progressive detail.

An intelligence safeguard ensures thoroughness when it's genuinely needed.

## Install

```bash
claude plugins add <path-to-claude-clampe>
```

Or clone this repo and add it as a local plugin:

```bash
git clone https://github.com/xujianwen/claude-clampe.git
claude plugins add ./claude-clampe
```

## Usage

Invoke at the start of a conversation:

```
/clampe
```

The directives apply for the rest of the conversation. On first use in a project, it offers to add persistent token-saving entries to your CLAUDE.md.

## License

MIT
