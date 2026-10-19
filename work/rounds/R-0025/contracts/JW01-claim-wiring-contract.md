# Approved defense claim contract — D1–D7 formalization

Architect, 2026-10-18. Accepted design under the Owner decisions recorded in
open-decisions-rait.md and ADR0045/0046. **No runtime implementation authorized.**
This supersedes P4-01's unresolved design options for D1–D7 without changing its
historical code observations or treating its proofs as executed wiring tests.
The exact proposed implementation packet is reports/P4-02-exact-wiring-packet.md.

## Authority and flows

The Owner approved all recommendations and explicitly allowed coordinators and
auditors to read unassigned merits. Read-only oversight is limited to authorized
tenant/unit/pool scope; it does not add claim/write/signing authority. Named roles
are rait-coordinator and AUDITOR. ADR0046 defines server-only bindings and denial
when binding data is absent. Other-role/source gaps stop preflight; no new grant
is inferred. All actors are excluded from merits when impeded.

Defense sequence: delivered protocol/triage/admission first, then a single claim
transaction composes ADMITIDO→DISTRIBUIDO→EM_INSTRUCAO and assignment/audit/history/
outbox effects. Each state movement advances version once; the result ETag is final v+2.
Two existing case-changed events carry correct successive from/to snapshots;
stable per-stage outbox identities prevent same-topic deduplication collisions,
with one assignment event and total rollback/retry-once effects. No new topic.
The UI opens `/casos/:id/dossie` using returned data.id. No repeat
triage, receive shortcut or new state. JARI/CETRAN behavior is retained. Legacy
DISTRIBUIDO/replay inventory is a mandatory preflight, not an automatic migration.

## Typed operations to publish in a later approved implementation

`GET /v1/inf/rait/claim-context` / raitClaimContext uses the current analyst claim
permission and authenticated server context. Query: optional pool_id, pool cursor,
queue cursor and bounded page limit under UI guide §3.1 (max50). Identity, roles
and purpose are not accepted as authority. Server-derived pool eligibility is
active membership + matching unit/instance/strategy/tenant; dynamic availability
and WIP are revalidated on POST and may be exposed as a safe claimable/reason state.
No sensitive member/case details accompany an unavailable reason.

Response HTTP200 data contains:

- eligiblePoolCount computed over the complete authorized set; selection
  none/single/choice, selectedPoolId or null;
- pools page `{items:[{id,name,instance,unit_id}],nextCursor}` from that set;
- queue page `{items:[{id,protocol_number,instance,state,protocolled_at,unit_id}],nextCursor}`
  filtered and ordered server-side for the chosen authorized pool. No free text,
  persons, merits or global counts. No selection means no queue items.

Zero pools disables claim with a reason; exactly one is selected automatically
using the complete set, not a partial page; multiple require explicit choice.
Cursor and supplied pool_id never bypass reauthorization. Discovery makes no
assignment and does not lease authority or replace POST transaction checks.

`POST /v1/inf/rait/pools/{id}/claim-next` / raitPoolClaimNext remains CASE-owned.
Strict `{}` body; required Idempotency-Key; no If-Match. Supplied If-Match gets400
RAIT.VALIDATION_FAILED. All other versioned commands retain their If-Match rules.
Result HTTP200 `{data,events}` and updated case strong ETag; data is a typed CASE
result with id/state/version and non-null assignment_id on success. Missing
assignment identity is an internal invariant failure and rolls back, never a
successful undefined navigation. Complete generated request/response types from
the existing handwritten OpenAPI; no parallel hand-maintained DTO/cast or duplicate
path/operation. Future writes use the returned CASE validator, not a pool validator.

The typed claim result has no cached actor grant: same-actor replay checks current
action and case-read scope, returning only an authorized result without selecting
again. New confirmation means new key; exact retry means same key. Bind fingerprint
to authenticated actor/tenant boundary, command, pool and canonical body. Other
actor or changed request on that tenant key gets409 with no prior payload.
Unsafe legacy replay records fail closed; no guessed actor or automatic new claim
on an uncertain historic success. Preserve old records and other command schemes.

## Scope, error and regression obligations

Use ADR0046 purpose predicates on every inventoried parent/child/list/get/write/
replay path, with SQL filtering before pagination. Queue projection alone is not
merits access; triage remains possible before assignment with authorized scope.
Oversight requires real role + action permission + explicit active unit/pool
binding + no impediment, including unassigned cases. No wildcard/null-scope grant,
client filtering, role-only fallback, public binding CRUD or production seed.

Impeded cases are skipped, not disclosed; if none eligible remain, QUEUE_EMPTY409.
Keep MEMBER_IMPEDED for other sourced uses. Candidate-before-WIP precedence is
retained. Missing schedule/availability, missing WIP source and reached WIP remain
separate existing errors. Scoped missing/unauthorized by-ID resources use404;
missing route permission uses403; cross-actor/mismatched replay uses409.

Binding priority/risk/NULL and WIP45/alert60 policies remain. No hardcoded priority,
calendar/risk fallback, tenant-system context or fake concurrency. Preserve earlier
admissibility, other-role and other-instance contracts or stop for an amendment.
No attachment, draft, inquiry, signature, provider or productive IdP activation.
Review/approval of P4-02 is still required before Inspector or Engineer dispatch.
