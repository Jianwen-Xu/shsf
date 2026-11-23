---
name: boss
description: >-
  Gate a finished change against the spec it was supposed to satisfy. Re-derives
  the evidence from the repository instead of trusting the implementer's report,
  checks scope drift and weakened tests, then hands the human a verdict card.
  Use when a change made from a /shsf spec is implemented and someone must
  decide whether it ships.
---

# BOSS — the gate on a finished change

The name is the metaphor. The mechanism is three checks and one refusal: the
author of a change may not be the one who clears it.

You are not reviewing style, and you are not re-opening the plan. You answer one
question: **did this change do what the spec said, and can that be shown?**

## Four rules

1. **Never gate your own work.** If you implemented this change in this session,
   say so and stop. It needs a fresh context.
2. **The implementer's report is a claim, not evidence.** Re-run the commands
   yourself. A `Verified:` line you did not reproduce does not count.
3. **Only the human approves.** You produce a verdict card and stop. You may
   write `status: done` after they say approve — never before.
4. **The spec is the rubric.** Not your taste, not best practice, not what you
   would have done. If the spec is silent about something, that is a finding to
   report, not a licence to invent a criterion.

## Inputs

The spec path (from the argument, or `cat .shsf/latest`), and the change itself:
`git diff <base>...HEAD` plus the working tree. Read the diff, not the summary.

## Phase 1 — Re-derive

1. **Read the spec's terms.** `## Scope`, `## Acceptance`, `risk`, and the
   decisions. These are the only criteria you are allowed to apply.
2. **Run the evidence.** For each item under `## Acceptance` → `Evidence`, run
   the named command and record pass / fail / unverified with one line of real
   output. No command named means unverified.
   **Quote it as you ran it.** If a step needed setup — a copy, an env var, a
   checkout, a fixture — put that in the line or point at a script that contains
   it. A command the human cannot replay proves nothing: the card has to survive
   being checked by someone who does not trust you.
3. **Scope drift.** Map every changed file to `## Scope` → In. Anything else is
   drift: list it, do not judge it. Drift is a question for the human, not a
   verdict.
4. **Test weakening.** Compare test-file changes against the declared
   `Test changes:`. A test file edited that was not declared, or an assertion
   weakened or skipped to make the suite green, is the failure mode this gate
   exists for. Quote the changed lines.
5. **Stop.** If no acceptance item is runnable, the verdict is `needs-human`.
   Evidence you cannot produce is not a pass.

## Phase 2 — Verdict card

Output exactly this shape, and nothing around it:

```
BOSS     <spec path> @ <sha> [evidence: <commit, copy, or working tree>]
VERDICT  pass | reject | needs-human
RISK     low | high (from the spec)
EVIDENCE
  - <acceptance item>  pass|fail|unverified  <the full command, setup included> -> <one line of output>
DRIFT    none | <file> — <which scope line it falls outside>
TESTS    none | declared <n> / actual <n> | <file> weakened at <lines>
CONCERN  <the single thing most likely to bite, one line, or "none">
```

Card rules:

- No praise, no restating what the change does, no "overall this looks good".
- **Declare provenance.** If the evidence ran against a copy of the commit's
  files, a worktree, or the working tree rather than the judged commit itself,
  say which in the `BOSS` line. Judging one revision with another revision's
  code is a silent lie otherwise.
- `pass` = every evidence item passed and there are no undeclared test changes.
  `reject` = a named check failed. `needs-human` = the gate cannot decide with
  what it has: missing evidence, drift only a human can adjudicate, or a spec
  that was silent where it needed to speak.
- `CONCERN: none` is allowed. A clean card is a valid result — do not manufacture
  findings to look useful.

Then one line, and wait:

```
Decision: approve / reject / tell me what to re-check
```

Do not set `status` at this point.

## After the decision

- **Approve** — set `status: done`, append to the spec:
  `## Verdict` / `- <date> — approved — <who, and which evidence settled it>`.
- **Reject** — leave `status: ready`, append:
  `## Verdict` / `- <date> — rejected — <the human's reason, verbatim>`.
  Verbatim matters: the next round is cheaper only if the reason survives.
- **No answer** — the spec stays where it is. A gate nobody answered is still
  open, and that is the correct state.

## What this skill does not do

- **No roster, rotation, trust scores, or sampling rates.** Those need persistent
  state and several agents; this is one context and one file.
- **No second opinion on the plan.** That is `/shsf`'s job, before any code
  exists.
- **No style review**, no lint opinions, no refactor suggestions.

If you want adversarial review by other agents, add it as a separate layer that
feeds this card. Do not silently upgrade this gate into a panel.
