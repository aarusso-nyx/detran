# ADR-0049: Authoritative current-risk production for RAIT claim ordering

## Status

Accepted by Architect, 2026-10-18, implementing Owner-approved D11 prerequisite
composition. Supplements ADR0025/0037/0045; does not change approved deadlines,
thresholds or priority policy. **Preparation only; no provider, job, event publisher,
parameter version or runtime is activated by this PR.**

## Existing sources and gaps

ADR0037 puts risk first. ARCH-RAIT-DEADLINES §4 already defines the worst applicable
current clock flag as the case key; it is not a new Owner question. WF-RAIT-002 §4,
OD-006/H54/H57 and DT-030 define the accepted ladders. Clock A/B/C/D use the existing
deadline engine, calendar, timer/catalogue and approved versioned parameter owners.
Default SEM_RISCO fields or a DASHBOARD consumer are not authoritative evaluations.
The absent rait.clock.flag-changed publisher in OD-D17 is an implementation gap,
not evidence that every case has low risk.

The parameter catalogue/seed includes descriptive JSON strings, not executable
ladder objects. In particular its B summary says90% while OD-006 explicitly
selects WF-RAIT-002 §4.1 (21-month N3,23-month critical); do not parse the summary
into a different threshold. Normalize typed parameter representation from the
binding decision, retaining version/source provenance and old versions. D's
30/45/54/60-month stages are in docs/meta/decisions/rait.md; do not invent an N3
threshold absent from that ladder. Missing/conflicting operational versions block
use and release until sourced; do not reinterpret them silently.

## Decision: one calculation, explicit composition

Extend the existing public @detran/inf-deadlines library with pure typed risk
calculation, not database access, a second deadline engine or an internal import.
Inputs are a single ADR0025 operation instant/day in the tenant timezone,
applicable clock/timer identifiers, verified start/reset/ceiling dates, instance,
calendar and complete approved typed ladder snapshots with version/source refs.
Output includes each evaluated flag, worst-case key, asOf and source versions.
The clock applicability set must be explicit: missing is not not-applicable.
No default assessment, client date, raw age heuristic, NULL→none or unknown→low.

The CASE-owned snapshot adapter resolves trusted current source records in the
same tenant transaction for claim-context and claim. Evaluate every in-scope
candidate before ordered pagination/selection; a missing candidate's risk cannot
be hidden by a capped fetch or silently omitted to make another case first.
Claim re-evaluates in its locked transaction; discovery is not a lease. Never
reuse an asynchronous cached flag unless its input versions/instant are proved
current under this same contract. GET remains read-only.

WORKLIST owns persistence of its clock/alert records and the existing flag-change
outbox event. Its producer consumes the same public calculation/snapshot contract;
CASE never imports WORKLIST back and never copies its mutation policy. Compose
an explicit transaction-bound risk-commit port in backend/app so CASE claim can
commit required qualified flag changes together with assignment/state/history,
without a circular package dependency. Required port/source absent means failure
before writes, not an optional fallback. WORKLIST already depends on CASE; CASE
continues to depend only on the public deadlines library/its existing packages.

Use the existing event topic/envelope, actor/tenant/audit and idempotent outbox
infrastructure for actual changed flags. Distinct risk effects use attempt+clock
identity+source-version/flag keys, never collide with claim case-stage keys, and
retries emit no duplicate effects. No new public SSE topic, browser provider,
DASHBOARD logic, notification escalation, scheduler activation or automatic legal
extinction/incident creation is commissioned. An overdue flag's existing required
incident/provenance constraints must be satisfied, never fabricated to persist it.
The request snapshot provides current ordering; enabling a periodic full sweeper
is outside this bounded packet and is not claimed complete under OD-D17.

## Failure and delivery boundary

Use RAIT.RISK_SOURCE_UNAVAILABLE503 for missing/conflicting/unverified risk sources
or mandatory composition; return no case/person details and make no claim effect.
This is an explicit transport/invariant error, not a new legal outcome. Fully
qualified data that proves SEM_RISCO is different from an absent/default value.
Parameter-source diagnostics remain internal/authorized; do not overload the
jeton-specific parameter error or QUEUE_EMPTY.

New calculation/adapter/commit-port paths and parameter-source normalization are
bounded in the amendment. Generated artifacts come only from their canonical
inputs. No change to legal timers, expiry effects, priority/WIP values, provider
identity, package pins or operational production data. Real HTTP+DB ordering,
missing-input, rollback and concurrency proofs remain required; pure function
unit tests alone cannot qualify runtime freshness or release.
