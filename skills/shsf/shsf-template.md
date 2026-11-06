---
status: draft            # draft -> ready -> done. Phase 2 seals it to ready once
                         # every [blocking] decision has an answer; you may set it
                         # yourself instead, which is the same statement.
task: <one line, imperative>
created: <YYYY-MM-DD>
---

# <Task title>

## Task

<!-- agent: restate the request in one or two sentences, then the shape of the
     change. If recon shows the request itself is wrong, say so here. -->

## Context

<!-- agent: facts from recon. Where the code lives today, what it does now,
     conventions or ADRs that apply, the nearest existing tests.
     These are findings, not a contract: Phase 2 may re-locate them. -->

## Decisions

<!-- agent: order by dependency; a decision that depends on another goes after
     it. Mark blockers with [blocking]. One recommendation each, worded so that
     "yes" accepts it.
     human: confirm or overrule. "yes" per item is enough. -->

### D1 [blocking] — <short title>

<What is being decided, and the options that actually matter.>

➡️ **Recommended:** <the answer, specific enough to act on>

Answer:

### D2 — <short title>

<...>

➡️ **Recommended:** <...>

Answer:

## Scope

<!-- agent proposes, human edits. The "Out" line is what keeps Phase 2 honest. -->

- **In:**
- **Out:**
- **Breakage we accept:**

## Acceptance

<!-- human owns what "good" means; agent fills the test plan from existing prior art -->

- **Behavior:** <observable outcome, not an implementation detail>
- **Tests:** <which existing test file or command to extend, and why that one>
- **Not covered:** <what this change deliberately does not verify>
