# SHSF

Async spec, then execute. The agent gathers the facts; you make the decisions.

## How it works

```
1. You:    shsf add JWT auth to the /api/login endpoint
2. Claude: does a bounded recon of the relevant code, then writes
           .shsf/shsf-20261106-001-add-jwt-auth.md
           — facts filled in, 3-7 decisions each with a recommended answer
3. You:    confirm or overrule offline — "yes" per decision is enough
4. You:    go — status seals to ready once every blocking decision is answered
5. Claude: implements only the confirmed scope, verifies, reports
           Changed / Verified / Risk
```

Two phases, and you can leave in between. The spec is also a reviewable record
of why the change looks the way it does, which survives context compaction and
session boundaries.

## The split

- **Facts are the agent's job.** Where the code lives, what it does today, which
  conventions apply, what the nearest tests look like.
- **Decisions are yours.** Scope, tradeoffs, naming, acceptable breakage, what
  "good" means. You get one recommendation per decision, so saying "yes" is
  usually enough.

## Not a token-saving mode

The old version of this plugin withheld context from the model to save tokens,
which meant you had to do the context gathering yourself. That trade stopped
paying once agents got good at reading code. The spec now exists so a human can
review a plan before code is written.

If you want to think out loud instead of writing a file, use an interview skill
such as `/grill-me`. If decisions remain genuinely contested after the spec is
drafted, hand the spec to that interview skill rather than resolving it in chat.

## When not to use it

Single-file changes, work under ~20 minutes, or tasks whose decisions are
already settled. Without a handoff, the ceremony costs more than it saves.

## Install

```bash
claude plugins marketplace add Jianwen-Xu/shsf
claude plugins install shsf
```

Or try it for a single session:

```bash
claude --plugin-dir /path/to/shsf
```

## Usage

```
shsf add JWT auth to the /api/login endpoint
```

Fill in the generated `.shsf/*.md` file, then say `go`. `status` flips to `ready`
once every blocking decision has an answer; setting it by hand says the same
thing.

You can also invoke it as `/shsf add JWT auth to the /api/login endpoint`.

## Checking a spec

Phase 2 refuses to run on a `ready` spec that still has an unanswered blocking
decision. You can run the same check yourself:

```bash
node skills/shsf/check.mjs              # every .shsf/*.md
node skills/shsf/check.mjs .shsf/x.md   # one file
```

Exit `1` on an unknown `status` or an unanswered `[blocking]` decision while
`status: ready`; missing sections are warnings and still exit `0`.

## Files

```
skills/shsf/SKILL.md           the two-phase protocol
skills/shsf/shsf-template.md   the spec template Phase 1 copies
skills/shsf/check.mjs          the spec validator Phase 2 runs
.shsf/                         generated specs, one per task (commit these)
.shsf/latest                   pointer to the newest spec (gitignored)
```

Specs are worth committing: they record the decisions behind a change, not just
the diff.

## License

MIT
