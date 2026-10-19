# ADR-0052: Immutable actor provenance for RAIT command replay

> **Proveniência.** Renumerada de `docs/meta/adr/ADR-0050-rait-command-replay-provenance.md` em R-0025 (P4-02-S1-A3), pela política da
> [ADR-0035](ADR-0035-adr-numbering-policy.md).
> ADR-0050 belongs to the whole-source coverage decision merged first through PR202 at 6f07295b. This renumbering belongs to R-0025 S1 reconciliation and preserves Owner-approved A3 semantics.
> O texto abaixo da linha horizontal é o original, byte a byte, inclusive o título com o número
> antigo.

---

# ADR-0050: Immutable actor provenance for RAIT command replay

## Status

Accepted by Architect, 2026-10-19, formalizing Owner-approved P4-02-S1-A3.
Supplements ADR0046 without editing accepted text. Owner explicitly answered
“Approve A3 as written (recommended)” to the bounded packet in
[the R-0025 report](../../../work/rounds/R-0025/reports/P4-02-S1-A3-replay-provenance.md).
This is S1-only authority, not S2, release or round completion.

## Context

ADR0046 requires actor-bound claim replay and preserves other commands'
fingerprints. Main already binds triage/save-admissibility/admit/non-admission
fingerprints to actor and If-Match. Protocol and other CASE, inquiry and WORKLIST
commands lack universal trustworthy actor binding in their existing ledger rows.
The integration.idempotency_keys schema has no actor column; historical audit
rows do not universally identify their exact ledger record. Latest-case actor,
current assignment or nearby timestamps cannot establish original caller identity.

## Decision

Preserve canonical non-claim fingerprint bytes. Existing admissibility and
approved claim fingerprints remain unchanged. For actor-unbound command families,
a first successful execution inserts its ordinary ledger record and obtains its
actual UUID with RETURNING id. In that same transaction, append exactly one
INF_RAIT_COMMAND_REPLAY_BIND audit event using existing audit.write. The event
uses authenticated tenant, actor_id and actual qualified actor_role; entity is
integration.idempotency_keys and entity_id is that exact ledger UUID. Details
contain schema_version=1, command, target_id and the unchanged request_fingerprint.
Protocol uses the newly created case as target. No raw idempotency key, token,
request body or merits enter this receipt.

On replay, lock the ledger and validate current action/read scope before any
stored result is disclosed. Actor-unbound fingerprints require exactly one receipt
matching ledger UUID, tenant, command, target and fingerprint, whose actor is the
current caller. Other-actor, absent or ambiguous provenance returns the existing
IDEMPOTENCY_REPLAY409 without response disclosure or new business effects. Do not
repeat first-use state/WIP checks merely because the successful attempt advanced
state; this never bypasses current action, membership, scope or impediment checks.

No historical record is rewritten, guessed, deleted or backfilled automatically.
Legacy actor-unbound records without trustworthy receipts fail409. Existing
24-hour retention metadata is unchanged; no automatic expiry or cleanup is
invented by this decision. Recovery requires checking current state before any
new attempt; clients must not automatically issue a new business command/key.

The receipt supplements existing domain audit. Original domain events, audit,
outbox, ETag, response body/status and business guards remain independently
verified. Receipt and business effects are atomic; no orphan receipt may survive
rollback. Existing tenant request context/RLS applies; no owner-role request or
public ledger/audit write endpoint is introduced.

## Boundaries and verification

No new table, column, public field, endpoint, permission, production migration,
selector, risk producer or S2 implementation. Owned paths and stop conditions are
exactly the approved A3 packet.

Inspector compares canonical fingerprint bytes with main, proves same-actor
exact replay, cross-actor409, absent/ambiguous provenance409, revoked-scope denial,
rollback atomicity, no public metadata leak and no repeated business effects.
Affected unit/integration/HTTP, root checks and independent review must pass before
the implementation PR. Evidence is partial and non-promoting until observed; no
round seal or readiness claim follows from accepting this ADR.
