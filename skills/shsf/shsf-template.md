---
status: draft            # draft -> ready -> done. Phase 2 seals it to ready once
                         # every [blocking] decision has an answer; you may set it
                         # yourself instead, which is the same statement.
task: <one line, imperative>
created: <YYYY-MM-DD>
risk: low                # low | high. Phase 2 uses this as follows: low seals itself
                         # done, high stops at "awaiting approval" and never
                         # approves itself. Auth, money, stored data, deletion,
                         # migrations, irreversible acts => high.
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

<!-- human owns what "good" means; agent fills the evidence and test plan from
     existing prior art. Phase 2 quotes this section when it reports. -->

- **Behavior:** <observable outcome, not an implementation detail>
- **Evidence:** <the exact command(s) to run, and what output counts as a pass>
- **Test changes:** <none, or which tests must change and why that is not
  weakening them>
- **Not covered:** <what this change deliberately does not verify>
