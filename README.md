# SHSF

Extreme token-saving skill for Claude Code. Your brain thinks (stay hungry). Claude executes (stay foolish).

## How It Works

```
1. You:    shsf add JWT auth to the /api/login endpoint
2. Claude: generates .shsf/shsf-YYYYMMDD-HHMMSS.md (structured questionnaire)
3. You:    fill out the spec in your IDE (zero tokens)
4. You:    "go"
5. Claude: reads spec, executes directly — no exploration
```

The spec file is the communication channel. You provide the context Claude would otherwise spend thousands of tokens discovering.

## Install

```bash
claude plugins marketplace add github:xujianwen/shsf
claude plugins install shsf
```

Or try for a single session:

```bash
claude --plugin-dir /path/to/shsf
```

## Usage

```
shsf add JWT auth to the /api/login endpoint
```

Fill out the generated `.shsf/shsf-*.md` file, then say `go`.

You can also invoke with `/shsf add JWT auth to the /api/login endpoint`.

## License

MIT
