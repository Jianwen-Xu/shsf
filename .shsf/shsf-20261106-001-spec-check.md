---
status: ready
task: Add a spec check that refuses `go` when the spec on disk is incomplete
created: 2026-11-06
---

# Spec check

## Task

Ship a small checker that validates a `.shsf/*.md` spec before `go` executes it,
so the Phase 2 gate stops depending on the model's good behavior. Today the gate
lives only in SKILL.md prose (Phase 2, step 2) and is unenforced.

## Context

- **Spec shape.** YAML frontmatter (`status`, `task`, `created`) plus five `##`
  sections: Task, Context, Decisions, Scope, Acceptance
  (`skills/shsf/shsf-template.md`).
- **Decision shape.** Headings look like `### D1 [blocking] — <title>`, followed
  by a `➡️ **Recommended:**` line and an `Answer:` line that may hold the answer
  inline or on the following line. A parser must accept both; the template
  leaves it blank.
- **Status vocabulary.** `draft` → `ready` → `done`; only `ready` is executable
  (SKILL.md Phase 2, step 2).
- **No runtime here.** The repo has no `package.json`, no scripts, no tests, no
  CI — the only JSON is `.claude-plugin/*.json`. Adding this check introduces the
  repo's first executable artifact, so "how is it distributed" is not a detail.
- **Naming.** `.shsf/shsf-YYYYMMDD-NNN-<slug>.md`, newest path duplicated into
  `.shsf/latest` (gitignored; specs themselves are committed).
- **Prior art:** none in-repo. The closest convention available is "zero
  dependencies, plain files", which every other part of this repo follows.

## Decisions

### D1 [blocking] — What counts as invalid

Three levels are on the table: frontmatter only; frontmatter plus unanswered
blocking decisions; all of that plus required sections present.

➡️ **Recommended:** validate `status` is one of `draft|ready|done`; when
`status: ready`, every `### D… [blocking]` heading must have a non-empty
`Answer:`. Missing `##` sections are a warning, not an error — a short spec is
often a correct spec.

Answer: yes

### D2 [blocking] — Runtime and location

No package.json exists. Options: (a) `node skills/shsf/check.mjs`, zero deps;
(b) bash + grep/awk; (c) add a package.json with a `bin` entry and make this a
tool repo.

➡️ **Recommended:** (a). One dependency-free ESM file inside the skill directory,
invoked by path. It travels with the plugin, no install step, and no package.json
in this change.

Answer: yes

### D3 — Failure semantics

➡️ **Recommended:** exit `1` for an invalid spec that claims `ready` and for an
unknown `status`; exit `0` for warnings; print one line per problem as
`<file>:<line>: <message>`. No `--json` until someone asks for it.

Answer: yes

### D4 — Integration point

Options: manual invocation; a git pre-commit hook; the model calling it in
Phase 2; CI on every spec-changing PR.

➡️ **Recommended:** manual, plus one line in SKILL.md Phase 2 telling the model
to run it when the script exists, and to report the failure instead of guessing.
No hooks and no CI in this change.

Answer: yes

## Scope

- **In:** `skills/shsf/check.mjs`; one Phase 2 line in `skills/shsf/SKILL.md`;
  a "Checking a spec" section in `README.md`.
- **Out:** git hooks, CI workflow, `--json` output, checking non-`.shsf` markdown,
  rewriting or fixing specs.
- **Breakage we accept:** malformed YAML edge cases (anchors, block scalars) are
  reported as a parse error rather than parsed; a spec with a hand-edited
  frontmatter shape may need a manual fix.

## Acceptance

- **Behavior:** `node skills/shsf/check.mjs .shsf/*.md` prints nothing and exits
  `0` on this draft spec; on a copy with `status: ready` and an empty `Answer:`
  under a `[blocking]` decision it exits `1` and names that decision's line;
  on an unknown status it exits `1`; on a spec with a missing `## Acceptance`
  section it warns and still exits `0`.
- **Tests:** no harness exists and D2 keeps it that way — acceptance is the four
  runs above, run by hand and pasted into the completion report. If D2 changes to
  (c), add a `node --test` file instead.
- **Not covered:** frontmatter values with multi-line block scalars, Windows
  paths, and any spec outside `.shsf/`.
