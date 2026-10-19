# ADR-0047: RAIT complete role-purpose scope and canonical staff identity

## Status

Accepted by Architect, 2026-10-18, formalizing Owner-approved D8/D9 and the
request to prepare D11's bounded amendment for review. Supplements ADR0046 and
the scope boundary of ADR0041; accepted historical text is not edited (ADR0035).
**Design only. Runtime, provisioning and implementation dispatch remain paused
for this review PR.** Main baseline is PR199, ad20e168.

## Authority and decision

Owner: “I approve your recommendations for D8–D11. Record the decisions,
formalize the supplemental ADRs and bounded P4-02 amendment, finish the T0 mapping,
and open a PR for review. Preserve local and scorecard work.”

The exact approved role matrix is materialized in
[the T0 access map](../../../work/rounds/R-0025/contracts/P4-02-T0-access-map.md).
Every decision requires authenticated tenant context, actual role, action
permission, one complete purpose, its authorized scope and no case impediment.
Explicit permissions and administrative/wildcard status do not replace scope.
Multi-role actors satisfy one complete rule; never mix one role's action with
another's scope. SQL filters precede sorting/counting/pagination; unauthorized
and missing by-ID resources return the same404. Raw state/version/assignment and
audit-history mutation remain command-owned. All old entry points are covered,
including source and target parents during reparenting; no parallel bypass route.

- Analyst queue/triage/own-assignment purposes and coordinator/AUDITOR explicit
  oversight remain ADR0045/0046. No new claim or signing grant follows from reads.
- Secretary: explicit authorized unit/pool, applicable protocol/collegial/archive
  duty and its necessary procedural projection. Sealed archive suppresses third
  parties; no unrelated merits. Analyst-only admission conclusion stays restricted.
- Rapporteur: own active assignment OR verified relevant bench/agenda/vista
  participation; membership in a pool alone is insufficient.
- Chair: explicit scope plus active presidency of that board/pool; only necessary
  distribution/agenda/session/decision records.
- Signing authority: ready-for-decision case, verified jurisdiction, appointment
  and applicable duty. This does not grant claim or reuse signing territory for analysts.
- Central authority: explicit designated unit/pool and favorable JARI appeal-review
  purpose; necessary decision/supporting records. No additional appeal deadline
  or institutional actor is invented.
- Manager: explicit operational unit/pool, radar/delay/incident projection; no
  petition or general merits. Another complete authorized role is required for merits.
- HR/finance/BI/integration/administrative roles: existing contracted functional
  projections only. No blanket case merits from role/status/permission alone.

The [closed triage field map](../../../work/rounds/R-0025/contracts/P4-02-T0-triage-fields.md)
limits the projection even when the parent case is authorized. No attachment,
binary/signed URL, new trust provider or unrelated command is activated.

## Internal binding and parent model

ADR0046's CASE-owned internal read-scope binding retains tenant, actor, role,
exactly one unit OR pool, active status and nonempty authorization_ref. Extend its
role set to rait-secretary, rait-chair, rait-central-authority and rait-manager;
coordinator/AUDITOR semantics stay intact. These rows only constrain the named
purpose; they never supply duty, presidency, action permission or new write authority.
Multiple independently authorized bindings may satisfy a purpose by union;
multiple units/pools are not by themselves an ambiguity. A conflicting or
unverified source is not a grant. All are blueprint-owned operations[] with tenant-consistent references, RLS,
revocation and verified provisioning provenance. No public CRUD, default grant,
production seed or automatic coordinator-membership conversion.

A pool binding must not become unit-wide access. Resolve a case's exact pool
through a trusted current assignment, qualified batch relation or an explicit
internal CASE-owned rait_case_pool_scope record: tenant_id, case_id, pool_id,
active, authorization_ref, source_ref (plus generated id/timestamps). Unique
(tenant_id,case_id,pool_id); validate same tenant and authoritative unit/instance
compatibility. No first-pool, all-pools-in-unit or browser-supplied association.
Missing/ambiguous association denies pool-scoped access; a separately authorized
unit binding may still satisfy the unit rule. Internal routing/provenance records
are operational inputs; no new public routing API or automatic historic migration.
Same containment applies to selector candidate routing. Partition is explicit
whenever more than one active defense pull pool matches the case unit/instance;
unit/instance equality alone never chooses between those pools.

The named writer is CASE-owned rait-case-pool-scope.service.ts. Existing protocol
and admit commands call its server resolver in their transaction: exactly one
compatible active pool in canonical operational configuration may generate the
case link with that command/pool provenance. With multiple pools, only a verified
explicit case routing disposition may choose one; no first-pool fallback. The same
internal writer applies an Owner-authorized operational routing receipt, with
current actor/source provenance, parent/version validation and append-only audit.
It exposes no HTTP/CRUD route and performs no production provisioning in this PR.
Existing assignment or batch sources can establish exact pool links only where
actually present; they cannot qualify a new unassigned case circularly.

Missing routing does not invalidate legal admissibility or add a fifth criterion.
Protocol/triage/admit retain their existing legal/If-Match guards; if no qualified
route can be written, retain the unlinked case for authorized operational inventory.
For any potentially in-scope ADMITIDO/legacy-unassigned candidate in the selected
pool's unit/instance whose exact pool association is unresolved, claim-context and
claim stop with RAIT.CASE_POOL_UNRESOLVED409 and no candidate disclosure or writes,
rather than silently omit it/return QUEUE_EMPTY. Scope resolves ordinary reads
fail-closed meanwhile. The internal writer and new error are bounded by A1;
release requires the routing inventory to be qualified.

## Canonical authenticated staff identifier — D9

Use the authenticated internal auth.users.id as the canonical RAIT staff identifier
for membership.person_id checks, formalizing the current runtime convention.
Tenant membership and role are still checked separately. External OIDC subjects
must resolve through authentication; they are not person UUIDs and never arrive
as browser-granted scope. Missing users, inactive/revoked memberships or ambiguous
identity deny. Do not delete or rewrite old personnel records to make equality pass.

Inventory any different legacy namespace. Such records require an explicit,
verified tenant-bound mapping with provenance before qualification; do not create
a guessed mapping/table or choose identity from a name/document match. Operational
identity qualification is a release gate, distinct from provisioned test identities.
Audit attribution of the existing admissibility commands stays intact after the
complete scope decision: explicit action permission can authorize an action but
cannot bypass the supplemental individual-scope predicate. This is the bounded
scope supplement to ADR0041, not a change to historical audit records/fingerprints.

## Verification and boundaries

Prove every complete-purpose positive and no/foreign/revoked/ambiguous scope,
impediment, mixed-role, wildcard/admin, parentless/inconsistent-parent and raw-write
negative on real HTTP+DB. Preserve existing accepted role journeys through their
specified projections, not silent global denial. Missing production bindings do
not prohibit explicit tenant fixtures. No source fixture is production proof.
The supplement records design authority only, not runtime acceptance, round
closure, readiness promotion or scorecard evaluation.
