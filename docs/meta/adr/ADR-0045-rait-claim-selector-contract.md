# ADR-0045: RAIT defense claim selector and typed contract

## Status

Accepted by Architect, 2026-10-18, implementing the Owner's approval of D1–D7
and request to formalize contracts/security and prepare a wiring packet for review.
**Design decision only: runtime remains paused until the exact packet is approved.**
ADRs0043/0044 are already present in the concurrent scorecard branch (filename
metadata only inspected); those IDs are reserved, not imported or modified here.
Recheck numbering against main before integration, under ADR0035.

## Context and authority

The P4-01 baseline merged in PR197 (`3e4ee378`). Current claim expects DISTRIBUIDO,
while the defense workflow consumes ADMITIDO; the old journey routes to triage
although admissibility-first was explicitly approved and delivered in #193/#194.
The published CASE claim description lacks typed inputs/results and generic UI
If-Match wording conflicts with a selector whose case is not known in advance.
Sources: UC-RAIT-002/003, WF-RAIT-001/004, IU-RAIT-004, JW-01, ADR0037/0041,
P4-01 source matrix and the appended Owner decision record in open-decisions-rait.

## Decision — D1, D2, D4, D5 and D6

1. Defense claim composes existing ADMITIDO→DISTRIBUIDO→EM_INSTRUCAO stages in
   one transaction, with assignment, state history, audit and outbox effects.
   No committed intermediate unassigned/distributed state; no invented state,
   secretary receive shortcut, repeat admission or independent distribution command.
   Preserve existing JARI/CETRAN command behavior in this packet. An old defense
   DISTRIBUIDO backlog must be inventoried explicitly; do not silently drop or
   auto-convert legacy rows. Its migration/compatibility disposition is a preflight
   gate in the packet, not a new product choice hidden in SQL.
2. Successful defense claim opens `/casos/:id/dossie`, identifying the returned
   case by data.id. Earlier claim→triage instructions are superseded for this
   flow only; pre-admission triage and the delivered admissibility operations remain.
3. CASE owns `POST /v1/inf/rait/pools/{id}/claim-next`, operation raitPoolClaimNext.
   Typed input is an empty object, rejecting server-owned or selected-case fields.
   Result remains HTTP200 `{data,events}` plus a strong ETag of the updated case;
   data is the selected case with explicit assignment identity, not RaitAssignment.
   Complete the canonical handwritten OpenAPI and regenerate its consumers only
   in an approved implementation packet; no OpenAPI/runtime generation here.
4. Claim is a **selector exception** to the generic If-Match rule. It has no
   client-selected case version or invented pool version. Idempotency-Key,
   authenticated scope, locked eligibility/selection, serialized WIP and real
   concurrency proofs are required. If-Match is absent from the claim request
   contract; supplied If-Match is rejected as unsupported (400) rather than
   silently treated as a pool/case validator. Return the case ETag for later writes;
   retain If-Match on all existing versioned commands. This changes no test/gate now.
5. Server-context discovery is a read, proposed at
   `GET /v1/inf/rait/claim-context`, operation raitClaimContext, under the existing
   analyst claim permission. It exposes eligible active defense pull pools and
   selected-pool queue metadata, never browser-supplied actor/tenant identity or
   arbitrary case selection. No new role grant. GET may live in the CASE handwritten
   OpenAPI contract (the route checker supports GET); it causes no assignment.
   Zero pools: empty eligible result, claim unavailable with a reason. One: server
   selects it. Multiple: explicit allowed pool choice. Results/selection must not
   depend on an incomplete generic500-row list. POST rechecks everything in its
   transaction; a discovery read is not an authorization lease or lock.
6. Queue metadata is a typed projection: case id, protocol number, instance, state,
   protocolled_at and unit_id, plus source-backed priority/risk display fields only
   if proved. No free text, parties, documents or merits. Server orders and scopes
   before pagination; no client-filtered authorization. The selected pool can be
   requested by ID only when revalidated against server-derived eligibility.
7. Impeded cases are excluded before merits access and selection continues in the
   approved order. If none remain, return safe QUEUE_EMPTY409 without identifying
   impeded cases. MEMBER_IMPEDED remains valid for other explicitly sourced uses;
   no new analyst impediment route. Existing availability/WIP errors remain distinct;
   count after candidate selection retains empty-queue-before-WIP error precedence.
8. ADR0037 risk/priority/NULL policy and H54 WIP45/alert60 remain binding. Correct
   the inspected claim ordering/NULL nonconformance; do not reopen calibration,
   invent a risk source or use browser ranking. Resolve the current clock/risk
   producer contract during preflight; absence of authoritative risk data blocks
   release instead of treating it as low risk.

## Exact read contract and boundaries

Discovery input is optional pool_id and server-supported bounded pagination;
unknown/foreign/unauthorized pool identifiers fail without disclosing candidates.
The response contains eligible pool summaries `{id,name,instance,unit_id}`, a
selection discriminator none/single/choice, selectedPoolId or null and a typed
queue page. Those discriminator labels are transport choices, not domain states.
No member/person identity, assignment writes or token claims accepted from input.
Typed empty claim body and200 response replace the frontend's generic body and
assignment result. A fresh confirmation creates one attempt key; exact retries
retain it under ADR0046. No successful preview writes, new SSE framework, dossier
upload/signed-URL/minuta/diligence/signing activation or broader round closure.

## Consequences, alternatives and verification

Retaining DISTRIBUIDO-only defense claim without a sourced producer leaves the
approved flow disconnected. Reusing receive or admitting after claim contradicts
sources. A fake pool validator hides a selector/version mismatch. These alternatives
are rejected. Real pool versioning would need a different approved contract.

Inspector must demonstrate admission→claim→dossier with HTTP+DB and routed UI,
transaction rollback, ordered/NULL/impediment cases, current scope, actor-bound
retry, WIP/concurrent claim and omitted-role/tenant negatives. Regression-test
other instances, old admissibility and every retained If-Match command. No test
was authored or run by this design PR; formal adoption does not prove behavior.
