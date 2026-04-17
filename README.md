# Claude Clampe

Extreme token-saving skill for Claude Code. Your brain thinks (free). Claude executes (cheap).

## How It Works

```
1. You:    clp add auth to my app
2. Claude: generates .clampe/clp-YYYYMMDD-HHMM.md (structured questionnaire)
3. You:    fill out the spec in your IDE (zero tokens)
4. You:    "go"
5. Claude: reads spec, executes directly — no exploration
```

The spec file is the communication channel. You provide the context Claude would otherwise spend thousands of tokens discovering.

## Install

```bash
claude plugins marketplace add github:xujianwen/claude-clampe
claude plugins install claude-clampe
```

Or try for a single session:

```bash
claude --plugin-dir /path/to/claude-clampe
```

## Usage

```
clp add authentication to the API
```

Fill out the generated `.clampe/clp-*.md` file, then say `go`.

You can also invoke with `/clampe add authentication to the API`.

## License

MIT
