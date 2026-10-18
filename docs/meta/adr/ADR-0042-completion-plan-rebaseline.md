# ADR-0042: Reconcile one DETRAN completion baseline

## Status

**Accepted — Owner approved P1–P3 on 2026-10-18; integration pending PR review.**
Architect records the direct Owner approval quoted in COMPLETION-PLAN.md §8 and
the appended C-0002/C-0003 amendments. P4 exact-packet approval remains pending.
No implementation is authorized by this PR. Recheck ADR numbering against main
before integration if concurrent work publishes another0042.

## Context

C-0002/C-0003 retain binding decisions and acceptance but now mix historical
platform dependencies, later product-first amendments, preserved branch assets
and authorizations for smaller merged slices in an open R-0025. Main e536e545
contains R-0033 and PR193/194 while several planning snapshots predate them.
JW-01 also has a documented sequence conflict with backend state transitions.
A fresh schedule must preserve source decisions, tests, proof and unmerged work.

## Decision

Use [COMPLETION-PLAN.md](../../../COMPLETION-PLAN.md) as the single approved
remaining-work schedule, with exact-head branch/task and source-scope inventories.
Upon integration, it supersedes scheduling/dependency projections in
older plans; their decisions, acceptance, exclusions and histories remain binding.

Owner-approved decisions P1/P2 in that plan permit (1) independently verified bounded
PRs within an open round, while retaining final aggregate acceptance/close/seal,
and (2) outcome-based or expressly authorized narrow platform prerequisites.
These amend OD-C2-005/C-0003 through the appended Owner amendments. P3 approves
separate D/Q/O milestones without changing commissioned scope. The Owner directed
implementation to remain paused pending approval of the exact P4 packet; this ADR
does not authorize a packet, R-0034 opening or any round closure. P5–P7 remain
unresolved where applicable.

The plan separates software development, external qualification and operational
release without changing product scope or silently commissioning excluded native,
external or field work. It retains the agreed product priority and PEC placement.
Scope changes require the proper Owner amendment, never a planning label.

## Preserved constraints

DEVAI remains governance; STYNX remains platform. No changed pin, grant, tenant/RLS
boundary, SENATRAN boundary, blueprint, test, workflow, evidence chain or runtime
state is introduced. No historical round/task/PC is renumbered or rewritten.
R-0022 stays stopped, R-0025 stays open, R-0033 stays closed/sealed. Scorecard work
is external to this PR. No preservation ref or primary local work is removed.

## Validation and consequences

Require a complete scope/task/branch disposition, source precedence, explicit
unresolved decisions, documentation/index/KB checks, independent review and a PR.
The benefit is a single current execution view with no-loss traceability. The
cost is a one-time reconciliation plus per-delivery updates to that view.
This is not a certification of any unexecuted requirement or provider integration.

## Alternatives

- Continue adding amendments only: preserves history but leaves the operating
  dependency graph scattered and completion boundaries ambiguous.
- Restart implementation/replace specifications wholesale: discards useful work
  and risks reopening binding decisions. Rejected as a planning approach.
- Add another campaign that implicitly inherits every old task: retains overlapping
  queues without reconciling obligations. This plan instead maps them once.
