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
threshold absent from that ladder. A/C new catalogue rows start proposta (source_pending=false where the approved
source is attached), not automatically vigente. WF §4.3 retains its historical
“proposta/proporcionalmente” labels; the workflow header records Owner approval
of §§4.1–4.3. Source approval does not automatically activate an operational
parameter version. Explicit qualification/promotion is a release input.
Missing/conflicting operational versions block
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

The CASE-owned snapshot adapter and scoped raitCaseRiskSnapshot read resolve
trusted current source records in the
same tenant transaction for claim-context and claim. Evaluate every in-scope
candidate before ordered pagination/selection; a missing candidate's risk cannot
be hidden by a capped fetch or silently omitted to make another case first.
Claim re-evaluates in its locked transaction; discovery is not a lease. Never
reuse an asynchronous cached flag unless its input versions/instant are proved
current under this same contract. GET remains read-only.

WORKLIST's scoped clock-risk reads consume the same CASE snapshot provider via
the existing WORKLIST→CASE dependency. CASE consumes only the public deadlines
library, not WORKLIST. backend/app binds the mandatory read-only snapshot factory;
no transaction commit/persistence port is introduced for risk in this packet.
Claim audit records the evaluated source/version references as part of its own
transaction; that does not change stored clock flags or publish a flag event.

**Defer risk flag persistence and publication.** Existing consumers of
rait.clock.flag-changed include SSE, DASHBOARD and infraction; publishing only
claim-evaluated cases would create partial radar coverage. No such partial feed
is activated. No clock/alert writes, flag-change outbox event, notification,
scheduler/sweeper, automatic legal extinction or incident creation is commissioned.
OD-D17's full publisher remains open; current request-time calculation is the
bounded producer required for selector correctness, not a claim of radar freshness.
A future full-coverage producer/publisher requires its own reviewed operational
packet and consumer acceptance. Existing case/assignment events remain unchanged.

If any otherwise eligible candidate reaches PRESCRITO_OPERACIONAL without
qualified incident/provenance input, both selected-pool claim-context GET and claim
POST fail the whole pool operation with RISK_SOURCE_UNAVAILABLE503, no candidate
payload or effects. Do not skip that candidate and claim lower-ranked work. Scoped
GET cases/:id/risk also returns503 under that condition for that case; other
properly scoped case/operational inventory reads remain available. The blocking
case/reference is visible only in authorized unit/pool operational inventory,
never disclosed to an analyst through the error. No incident is fabricated and
no flag downgraded. Such records remain operational release inputs.

Incident qualification is an adapter concern, separate from the pure calculation:
read the existing inf.rait_clock_alert.incident_ref and same-tenant
inf.rait_incident source through the named app read-only snapshot adapter in the
caller's transaction. Require one authoritative incident reference with matching
case_id or clock_id (and consistent other link if present), valid provenance and
source revision; ambiguous/missing/inconsistent target is unqualified. A verified
operational receipt may supply the source reference; it is never a browser value.
The internal port carries qualified | missing | ambiguous status and source-version
refs, not incident cause/outcome text. Its public HTTP result exposes no incident
payload. No ORG writes, new dependency/cycle or new incident API is authorized;
existing legal expiry commands remain under their own contracts.

The additive public API is frozen in
[the CTG-0001 §5 supplement](../../../work/rounds/R-0025/contracts/P4-02-deadlines-risk-api.md).
It extends R-0006's fixed library API by exact new names without editing its
historical contract. No existing export/engine/date behavior changes.

## Failure and delivery boundary

Use RAIT.RISK_SOURCE_UNAVAILABLE503 for missing/conflicting/unverified risk sources
or mandatory snapshot composition; return no case/person details and make no claim effect.
This is an explicit transport/invariant error, not a new legal outcome. Fully
qualified data that proves SEM_RISCO is different from an absent/default value.
Parameter-source diagnostics remain internal/authorized; do not overload the
jeton-specific parameter error or QUEUE_EMPTY.

New calculation/adapter/snapshot-port paths and parameter-source normalization are
bounded in the amendment. Generated artifacts come only from their canonical
inputs. No change to legal timers, expiry effects, priority/WIP values, provider
identity, package pins or operational production data. Real HTTP+DB ordering,
missing-input, rollback and concurrency proofs remain required; pure function
unit tests alone cannot qualify runtime freshness or release.
