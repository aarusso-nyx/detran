# ADR-0048: Provenance-qualified legacy defense claim compatibility

## Status

Accepted by Architect, 2026-10-18, under Owner approval of D10 and D11's bounded
preparation. Supplements ADR0045's legacy preflight and ADR0046 replay boundary;
never rewrites either accepted ADR. **Contract only; no data migration, assignment,
state transition, recovery action or runtime dispatch occurs in this PR.**

## Decision

The new-case path stays ADMITIDO→DISTRIBUIDO→EM_INSTRUCAO atomically, v→v+1→v+2,
one assignment effect and two ordered case-change effects under ADR0045.

| Persisted category                                                                    | Approved disposition                                                                                                                                                                      |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New ADMITIDO, qualified scope/risk/priority                                           | Existing approved two-stage selector path                                                                                                                                                 |
| Legacy defense DISTRIBUIDO, unassigned, trustworthy admission/distribution provenance | Same selector may select in the same authoritative order, assign exactly once and perform only DISTRIBUIDO→EM_INSTRUCAO, final version v+1                                                |
| Already assigned legacy case                                                          | Preserve assignment, state and history; exclude from fresh claim selection and reassignment by claim-next. Existing authorized reads remain; no new resume/transition command is invented |
| Missing, contradictory or inconsistent legacy provenance                              | Stop automatic processing of that unresolved legacy work and require a recorded recovery disposition; no silent conversion, deletion, guessed assignment or automatic re-claim            |

Compatibility is not chosen by body fields or a caller-selected case. Pool/context,
role/schedule/WIP/impediment/risk/priority checks are identical to the new selector.
Lock the candidate and member/WIP boundary, recheck no active assignment, and bind
any qualification to the current persisted case version and source records. New
and qualified legacy work share one order; compatibility never moves a case ahead
of risk/priority/time/id. Roll back every effect on failure.

Legacy success emits one accurate DISTRIBUIDO→EM_INSTRUCAO history/case-change
stage, one assignment effect, final strong v+1 ETag and non-null assignment_id.
Do not repeat admission/distribution, manufacture a second case event/version,
or reuse an outbox identity that conflates distinct effects. Typed response retains
the same CASE shape and HTTP200 envelope. If-Match is still rejected on this
selector, and actor-bound retry/reauthorization/new-attempt semantics stay ADR0046.
Other instances and known-case versioned commands remain unchanged.

## Trusted classification and recovery input

A fixture's state is not admission proof. Qualification requires an authenticated,
auditable source chain linking this tenant/case to actual admission and distribution,
the current pool relation, current assignment status and observed version. Use
existing verified case history/audit/assignment records plus an explicit recorded
compatibility/recovery disposition. A mere state string, filename, opaque old
fingerprint or convenient seed is insufficient.

Keep a server-owned inventory/disposition receipt containing tenant/case reference,
observed version/state, assignment status, admission/distribution/pool source refs,
classification, reviewer/authorization ref and observation time. Validate references
at execution; stale/contradictory evidence denies. Store no invented production
identities or blanket grants. No public classification CRUD, production provisioning,
automatic expiry, old-row rewrite or new recovery workflow is commissioned.

An unresolved in-scope legacy record must be visible to the authorized operational
inventory rather than silently disappearing as QUEUE_EMPTY or a lower priority.
A selector unable to establish its safe ordered candidate set returns the bounded
contract error RAIT.CLAIM_LEGACY_UNVERIFIED409, without case details to the analyst.
A trusted explicit hold/recovery disposition may exclude the held row from automatic
selection, preserving it and its reason in the authorized inventory. It is never
treated as admitted/claimed. Release requires the deployed inventory and approved
disposition for every affected category; fixture coverage is not a substitute.

Old actorless replay remains safe409 under ADR0046; do not infer its actor from
case ownership or alter other commands' fingerprints/historical responses. No
recovery action happens automatically after an uncertain response.

## Required proof

Real HTTP+DB tests cover new v+2 versus qualified legacy v+1, mixed ordered queues,
legacy assigned exclusion, missing/stale/wrong-tenant/contradictory provenance,
all-stage rollback, one assignment, exact retry/new action/cross-actor reuse and
concurrent claims/WIP. Preserve historical fixtures and receipts. This ADR approves
a compatibility contract, not actual production data or release.
