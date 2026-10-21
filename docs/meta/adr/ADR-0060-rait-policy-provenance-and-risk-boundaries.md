# ADR-0060: RAIT policy provenance and current-risk read boundaries

> **Proveniência.** Renumerada de `docs/meta/adr/ADR-0057-rait-policy-provenance-and-risk-boundaries.md` during PR211 reconciliation with
> main `1115f589`, under [ADR-0035](ADR-0035-adr-numbering-policy.md).
> ADR-0057 remains with `ADR-0057-partial-security-governance-delivery.md`, integrated first on main.
> The original accepted text follows the separator byte-for-byte, including its
> historical title and references. No normative decision changes.

---

# ADR-0057: RAIT policy provenance and current-risk read boundaries

## Status

Accepted by Architect, 2026-10-19, under Owner delegation recorded in S2-R12.
Supplements ADR0049/0055 and R9 only as explicitly stated below. No accepted
historical ADR or frozen format is edited. Source preparation only; runtime and
independent RED/GREEN follow separately under TASK-0043's coupled sequence.

## Decision

Adopt the exact additive internal C-only policy reader contract in
[source-provenance-policy-port.md](../../../work/rounds/R-0025/reports/S2-execution/source-provenance-policy-port.md)
and its JSON companion. Optional qualifyPolicy accepts only the closed C useful-
movement purpose and complete actual current case/owner/clock/timer/reset-event
bindings plus existing fixed canonical policy source/decision references.
It returns the independently retrieved/admitted canonical receiptDigest separately
from opaque sourceVersions. The subsequent full movement qualification verifies
that full dependency receipt independently. No empty movement request, opaque-ID
decoding, request echo, invented authority, new kind/key/writer/store or legal rule.
Absent/missing/ambiguous/malformed policy fails existing safe503; production stays
missing without accepted real provenance. Historical encoding remains immutable.

Raw threshold dates use existing public calendar-day/month arithmetic without
business-day shifts. Due/ceiling comparison alone uses the existing public Calendar
owner and shared existing tenant SQL adapter in owned CASE/app paths. A static
factory calendar helper avoids a new Nest cycle; no new runtime file or holiday-
scope rule. Globally sort the deduplicated opaque source-version output.

Perform nonlocking S1 assertCase preauthorization before global source locks,
then ordered relation/parent locks followed by locked S1 reauthorization in the
same Tx before source disclosure. Do not pass the CASE-locking true option in
the preauthorization call: it would invert R7. Revocation during waits denies. New
approved scoped risk GET and WORKLIST current-risk projection cover their sourced
applicable instances; retain ADR0055 locks after authorization. This supersedes
R9's overnarrow defense-only phrase for those NEW reads only. Existing JARI/CETRAN
claim commands and unrelated reads retain their established validators/locking.
No new grant/purpose. The relation SHARE locks still block parameter/holiday DML
across all tenants; no production throughput or topology approval follows.

## Consequences and verification

Independent fixture receipts deliberately use opaque IDs unlike their digest;
prove full receipt/row/policy binding and missing/forged/stale/ambiguous negatives,
raw weekend/holiday steps, due-only rounding, authorization-before-locks and
retained other-instance claim behavior. Inspector RED precedes Engineer changes;
unchanged decisive acceptance and required checks remain mandatory.

Process-local cursors remain an OPEN restart/multireplica availability limitation;
no new secret surface is authorized. D RESET and production provenance stay
source-blocked, other concurrency limitations retain their exact disposition.
No full S2/P4/JW01 completion, production release, S3 dispatch, implementation
merge or round closure is authorized by this ADR.
