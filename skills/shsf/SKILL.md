---
name: shsf
description: >-
  Prepare an async change spec before a non-trivial change: the agent gathers
  the facts from the codebase and leaves only the decisions that need a human.
  Use when the user wants to review a plan before code is written, wants to
  mull a change over offline, or invokes /shsf. A filled spec can be executed
  directly ("go") or stress-tested first (/grill-me).
---

# SHSF — Async Spec, Then Execute

A bridge between "I have a vague idea" and "code is being written". Two phases,
and the user gets to leave in between.

## The split

- **Facts are yours.** Where the code lives, what it does today, which
  conventions apply, what the nearest tests look like — you find it. Never ask
  the user for something a search can answer.
- **Decisions are theirs.** Scope, tradeoffs, naming, acceptable breakage, what
  "good" means. You propose one recommendation per decision; they confirm or
  overrule.

The spec file is the handoff. It is written for a human to read offline, and it
is the only thing Phase 2 trusts.

## Phase 1 — Prepare

Trigger: the user invokes this skill with a task.

1. **Bounded recon.** Find where this change lands. Budget: at most two searches
   plus the handful of files they point at; stop as soon as you can name (a) the
   modules involved, (b) current behavior, (c) the nearest existing tests. Do not
   survey the repo, and do not read a file end to end when a slice answers it.
2. **Draft the spec.** Copy `shsf-template.md` (next to this file) to
   `.shsf/shsf-YYYYMMDD-NNN-<slug>.md`, incrementing NNN from today's existing
   files. Fill every agent-owned section from step 1.
3. **Decisions.** Write 3–7 of them, ordered by dependency: a decision that
   depends on another goes after it. Each gets exactly one recommendation,
   worded so that "yes" accepts it. Mark the ones that block execution.
4. **Stop there.** Leave `status: draft`. Write the path into `.shsf/latest`.
5. **Output one line**: `Spec: .shsf/<file> — N decisions to confirm, then say go.`

Do not implement, and do not ask questions in chat during Phase 1. If recon
overturns the request itself (wrong assumption, already implemented), put that
in the spec's Context section — one line, in the file, not in chat.

## Phase 2 — Execute

Trigger: "go", "execute", "run", "do it" — with, or right after, a spec on disk.

1. **Read from disk.** `cat .shsf/latest`, then the file it names. Never rely on
   the path from conversation memory — that survives compaction, your memory
   does not.
2. **Seal.** If `status` is `draft` and every `[blocking]` decision already has an
   answer, the user has already made the decision the gate is asking about: set
   `status: ready` yourself and mention it in one line of the report. Never set
   it while a blocking decision is blank — that signature is the one you must not
   forge.
3. **Gate.** Run `node <this dir>/check.mjs <spec>` when the script sits next to
   this file; stop on a non-zero exit and quote it. The script only checks the
   file's internal consistency — it does not decide whether you may start, so
   either way the spec must now be `ready`. If it is still `draft`, stop and list
   at most three unanswered decisions. Do not guess a decision.
4. **Implement the confirmed scope.** Deviate only if the spec is factually wrong
   about the code; when you do, name the line that was wrong and why.
5. **Verify** against the Acceptance section. If it names a command, run it. If it
   names nothing runnable, say so instead of implying success.
6. **Report three lines:**
   ```
   Changed: <files or behavior, one line>
   Verified: <what you ran or checked>
   Risk: <what is untested or assumed, or "none">
   ```

   Not `Done.` A silent completion transfers the review cost to the user.

## Interop

- **Want to think, not to spec?** `/grill-me` — an interview in chat, no file.
- **Spec written, two or more decisions still genuinely contested?** Hand it to
  `/grill-me` rather than asking one question in chat.
- **Project already runs an issue tracker with `to-spec` / `implement-spec`?**
  Keep this file as the local working copy; the tracker holds the published one.

## When not to use

Single-file changes, work under ~20 minutes, or tasks whose decisions are already
settled. Without a handoff, the ceremony costs more than it saves.

## Rules

- **One recommendation per decision, always.** A question without a default is a
  question the user has to go research.
- **Name modules and behavior, not file paths, as requirements.** Paths go stale.
  Today's locations belong under Context as findings, and Phase 2 may re-locate
  them.
- Batch independent reads and searches into one message.
- The short-output budget is for chat only. The spec may be long: it is read once,
  by a human, offline.
- Break any rule above only when following it would produce a wrong result, and
  say which rule you broke and why.
