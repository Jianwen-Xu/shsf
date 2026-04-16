# Claude Clampe

Extreme token-saving skill for Claude Code. Hard rules, not suggestions.

## What It Does

Puts Claude into maximum power-saving mode. Four hard rules:

1. **Ask First** — NEVER explore unknown files without asking. Multiple-choice questions only.
2. **Output Budget** — 1-2 lines max. "Done." not paragraphs.
3. **Minimal Tools** — Max 1 exploration call before confirming direction. No subagents. Always use offset+limit.
4. **Context Discipline** — Never echo file contents. Never repeat known info. Extract one fact, discard the rest.

An intelligence safeguard overrides rules only when they'd produce a wrong result.

## Install

```bash
claude plugins marketplace add github:xujianwen/claude-clampe
claude plugins install claude-clampe
```

Or try it for a single session:

```bash
claude --plugin-dir /path/to/claude-clampe
```

## Usage

```
/clampe
```

## License

MIT
