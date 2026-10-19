# P4-02-S1-A3 — preserve fingerprints and bind unbound replay to its actor

Status: PROPOSED; Owner approval required before this amendment is implemented.
Architect, Constitution Article 7. Other approved S1 work may continue.

## Source conflict and bounded recommendation

ADR0046 explicitly preserves other commands' fingerprints. Current main already
binds triage/save-admissibility/admit/non-admission fingerprints to actor/If-Match;
claim actor binding is separately approved. Protocol, other CASE commands, inquiry
and WORKLIST command fingerprints do not universally identify their actor. The
existing integration.idempotency_keys table has no actor column, and historic
audit rows do not universally bind an exact ledger record to an actor. Guessing
from target, time, latest event or current assignment is not trustworthy provenance.
The initial S1 implementation changed additional fingerprints; that change must
be removed rather than silently overriding ADR0046.

Approve an internal, append-only actor-binding receipt through existing
audit.write, without a new table/column or public field. After inserting an
actor-unbound command's idempotency ledger row, obtain its real id using RETURNING
id, then append exactly one INF_RAIT_COMMAND_REPLAY_BIND audit event in the same
transaction. Its tenant, actor_id and actual actor_role come from authenticated
request context; entity is integration.idempotency_keys and entity_id is that
ledger id. Details contain schema_version=1, command, target_id and the unchanged
request_fingerprint. Do not store the raw idempotency key, request body, merits
or token. Protocol's newly created case is its target_id.

On replay, lock the existing ledger row and validate current action/read scope.
For actor-unbound fingerprints, require exactly one matching receipt for that
ledger id, tenant, command, target and fingerprint, with the current actor.
Missing, ambiguous or other-actor provenance returns the existing
IDEMPOTENCY_REPLAY409 without stored response or new business effects. Do not
infer provenance or rewrite/delete historic ledger/audit rows. Existing actor-bound
admissibility and approved claim fingerprints/retry behavior remain unchanged.

Legacy actor-unbound receipts without trustworthy binding consequently fail409
while their existing 24-hour retention applies; no automatic expiry/deletion,
new deadline or claim success is inferred. A response may safely explain that the
prior attempt cannot be replayed and requires checking current state before a
new attempt; never automatically resend a business command with a new key.

Preserve original domain audit/outbox/events/ETag/status/body. The new internal
receipt is an additional audit event, not a replacement for domain audit. No
new endpoint, permission, data grant, selector/risk activation or S2 implementation.

## Exact ownership

Architect documentation: this report, AUTHORIZATION.md and plan.md under
work/rounds/R-0025; new docs/meta/adr/ADR-0050-rait-command-replay-provenance.md,
docs/meta/adr/README.md and DESIGN-DECISIONS.md. Accepted ADR0046 remains immutable;
the supplement preserves its fingerprint rule and formalizes safe legacy denial.

Engineer: only the already-owned handwritten CASE command service, inquiry
command service, WORKLIST command service and shared CASE scope service if a
reusable internal receipt helper is necessary. No kernel DDL/app/pin changes.

Inspector: existing S1 scope HTTP spec, retained CASE/JW01 HTTP regressions and
already-owned CASE/WORKLIST command unit/integration specs, solely for receipt
qualification and exact retry/cross-actor/missing-or-ambiguous provenance controls.
No test weakening; original domain audit assertions remain separately verified.

## Acceptance and stop conditions

Compare unchanged non-claim fingerprint bytes with main for identical requests.
Prove same-actor exact replay, cross-actor409, legacy-unbound409, ambiguous409,
revoked current scope denial, atomic rollback/no orphan receipt, no public-body
metadata leak and no replay re-execution. Run affected unit/integration/HTTP,
root checks, independent cross-family review and governed evidence verification.
Stop for any additional schema, permission, public contract, production migration
or unowned path. No implementation PR merge or round closure is authorized.
