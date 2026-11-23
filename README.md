# SHSF

English · [简体中文](README.zh-CN.md)

Async spec, then execute. The agent gathers the facts; you make the decisions.
Finished work goes through a gate that cannot clear its own output.

Two skills: `/shsf` writes the spec, `/boss` decides whether the result matches
it.

## How it works

```
1. You:    shsf add JWT auth to the /api/login endpoint
2. Claude: does a bounded recon of the relevant code, then writes
           .shsf/shsf-20261106-001-add-jwt-auth.md
           — facts filled in, 3-7 decisions each with a recommended answer
3. You:    confirm or overrule offline — "yes" per decision is enough
4. You:    go — status seals to ready once every blocking decision is answered
5. Claude: implements only the confirmed scope, runs the evidence commands,
           reports Changed / Verified / Test changes / Risk
6. Claude: risk: low seals the spec done. risk: high stops at "awaiting your
           approval" — it reports on its own work, it does not approve it.
```

Two phases, and you can leave in between. The spec is also a reviewable record
of why the change looks the way it does, which survives context compaction and
session boundaries.

## The gate

Two skills, one artifact:

```
/shsf         spec             ─┐
                                 ├─ .shsf/<task>.md ─ (Scope, Acceptance, risk)
implement     code             ─┘
                                 │
/boss         verdict card  ◀────┘   pass | reject | needs-human
                                 │
you           approve / reject ──┘
```

`/boss` re-derives the evidence from the repository instead of reading the
implementer's summary, checks the diff against `## Scope`, compares test edits to
the declared `Test changes`, and stops. It cannot approve its own work, and it
never marks a spec done on its own. Its whole job is to make the human's decision
cheap without making it hollow.

## Why the last step has an approval in it

An agent that implements, tests and grades its own work is not evidence. So the
report has to quote the command and its real output rather than assert success,
test edits have to be declared up front (`Test changes` in the spec) and again
in the report, and high-risk changes cannot mark themselves done. The point is
not ceremony — it is that "verified" should mean something a second person can
re-check.

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

When the work is done, in a fresh session:

```
/boss
```

It reads `.shsf/latest`, re-runs the acceptance evidence, and returns a verdict
card. Approve or reject in one word; the spec records which.

## Checking a spec

Phase 2 refuses to run on a `ready` spec that still has an unanswered blocking
decision. You can run the same check yourself:

```bash
node skills/shsf/check.mjs              # every .shsf/*.md
node skills/shsf/check.mjs .shsf/x.md   # one file
```

Exit `1` on an unknown `status` or an unanswered `[blocking]` decision while
`status: ready`; missing sections and an unknown `risk` value are warnings and
still exit `0`.

## Gating a change

`/boss` starts with the part that should not be a judgement call:

```bash
node skills/boss/gate.mjs --spec .shsf/x.md            # working tree
node skills/boss/gate.mjs --spec .shsf/x.md --base main --head HEAD
node skills/boss/gate.mjs --spec .shsf/x.md --strict   # exit 1 on undeclared test edits
```

It prints what changed, which files are tests, whether `Test changes` declared
them, and which changed files the spec never mentions. It does not produce a
verdict — it removes the bookkeeping so the verdict is about judgement, not
eyesight.

## Files

```
skills/shsf/SKILL.md           the two-phase protocol
skills/shsf/shsf-template.md   the spec template Phase 1 copies
skills/shsf/check.mjs          the spec validator Phase 2 runs
skills/boss/SKILL.md           the gate that clears a finished change
skills/boss/gate.mjs           mechanical half: diff, test files, unmentioned paths
.shsf/                         generated specs, one per task (commit these)
.shsf/latest                   pointer to the newest spec (gitignored)
```

Specs are worth committing: they record the decisions behind a change, not just
the diff.

## License

MIT
