# ADR-0046: RAIT scoped case reads and actor-bound claim replay

## Status

Accepted by Architect, 2026-10-18, under Owner approval of D1–D7 and explicit
clarification: “yes, coordinators and auditors can read unassigned case merits.”
**Security design only; no runtime or grant is changed in this PR.** ADR0043/0044
are held by the concurrent scorecard branch; numbering follows ADR0035 and must
be rechecked before merge. Supplements ADR0041 for claim; does not rewrite that
accepted ADR or extend its four-command implementation by inference.

## Context

Route grants plus tenant RLS do not supply the individual scope in OD-R25-017.
Current claim replay is tenant+key and its fingerprint omits actor; replay runs
before claim eligibility. Existing generic list/get surfaces and parent-ID writes
must not bypass the proposed scope. Sources: ADR0001/0002, RN140, P4-01 matrix,
current CASE/WORKLIST/policy code and approved D3/D4/D7. No signing-territory rule
is substituted for analyst scope; real IdP qualification remains separate.

## Decision — D3 and D7

Tenant context, actual authenticated roles and existing action permission are
necessary on every request. All scope is derived server-side; query/body actor,
role, purpose, unit/pool or tenant fields never grant access. A resource ID and a
frontend route guard do not establish permission to read its parent case.

| Purpose / actor                                        | Accepted boundary                                                                                                                                                                                                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collective queue metadata / analyst                    | Active eligible defense-pool membership and matching unit scope; strict metadata projection under ADR0045. No case merits                                                                                                                             |
| Pre-admission triage / authorized analyst or secretary | Existing triage permission, active matching unit/pool membership and PROTOCOLADO/TRIAGEM_ADMISSIBILIDADE purpose. Preserve approved admissibility-first access before assignment, with only necessary triage data; no generic merits fallback         |
| Assigned merits / analyst                              | Active assignment to that authenticated analyst, matching authorized pool/unit and tenant, no case impediment. Existing route action still required                                                                                                   |
| Read-only oversight / rait-coordinator or AUDITOR      | Explicit active actor/role-to-unit OR actor/role-to-pool binding. May read unassigned merits inside that binding; never another tenant or a wildcard tenant scope. No claim, assignment/write, signing or new triage authority follows from oversight |
| Missing/ambiguous scope or impeded actor               | Deny merits; no role-only, global-admin, first-pool, unknown-unit or client-filtering fallback. Other role journeys require their own sourced predicates, not an inferred grant from this ADR                                                         |

Impediment exclusion applies before merits for all these actors, including
oversight. Unit/pool access is containment, not a global privilege. Multi-role
principals must satisfy one complete authorized purpose, not combine the role of
one rule with the scope of another. Server-bound purpose selects a fixed allowed
projection/state; a user-selectable purpose string cannot turn merits into triage.

## Explicit oversight bindings

Do not add auditor to `rait_pool_member.member_role`; its current domain constraint
does not include that role. Reuse canonical authenticated actor identity and
unit/pool identifiers, without assuming a raw IdP subject equals a person record.

The approved implementation packet may add an internal CASE-owned
`inf.rait_case_read_scope` binding through its canonical blueprint and generated
DDL: id, tenant_id, actor_id, role, unit_id nullable, pool_id nullable, active,
authorization_ref, created_at. Roles are only rait-coordinator and AUDITOR;
exactly one unit_id/pool_id must be present and tenant-consistent. No wildcard,
no empty authorization_ref, no default active grant or public CRUD route. Explicit
Owner-authorized provisioning supplies bindings; missing rows deny access. No
new administrative role/write API is commissioned. Tests use explicit tenant
fixtures, never seed blanket production grants. Reuse an equivalent already
accepted scope source only through an explicit packet amendment, not assumption.

This is a security/data-model choice recorded here; no schema is created now.
Bindings constrain reads only and require the actual matching role and read action
at request time. Deactivation or role removal revokes future reads and replay
access. Scope provisioning/production identities need separate operational inputs;
no provider, personnel or unit value is invented for production.

## Complete server-side enforcement

Before enabling claim UI, inventory all mounted CASE and related WORKLIST
list/get/child/write surfaces that can expose or forge case ownership/scope.
Filter in tenant SQL before pagination/counts; check every by-ID parent chain.
Guard only the dossier page or add a scoped endpoint alongside an unrestricted
legacy endpoint is insufficient. Generic state/assignment changes and child
reparenting must not bypass commands. Replace relevant generated endpoints via
blueprint operation controls and handwritten scoped handlers, regenerating rather
than hand-editing generated files. Preserve source-equivalent unrelated role
flows; if an affected role lacks a sourced predicate, stop and amend the packet
rather than silently broaden or revoke accepted business access.

Scoped lookup failures must not expose the case or why another actor owns it;
use a consistent not-found response for unauthorized/missing by-ID reads. Lists
contain only allowed rows/projections. Request roles, purpose, binding/assignment
and approval references are auditable without logging merits or credentials.
No new signed-document download/upload surface is authorized by this design.

## Actor-bound attempt and replay

- Each newly confirmed claim action has a fresh attempt key. Client retries of that
  same attempt retain the key; empty body + pool ID alone is not a new-action key.
- Persist tenant+key uniqueness and a fingerprint bound to authenticated actor,
  command, target pool and canonical empty body. Different actor or request under
  that key returns IDEMPOTENCY_REPLAY409 without the prior response. Do not change
  fingerprints of other commands or old proof/idempotency records in place.
- Exact same-actor replay validates current action/read scope before returning its
  stored case/projection. Do not run selection/assignment again or apply first-use
  WIP/state checks that would reject the successful attempt merely because it
  changed state. Revoked membership/role/scope denies replay, without deleting
  historical effects. Transactionally serialize replay and first execution.
- Persisted legacy claim records without a trustworthy actor binding must not be
  attributed by guess or disclosed to a new caller. Preflight classifies existing
  records and either safely establishes provenance or rejects replay with409 and
  a safe recovery instruction; never rewrite history or claim a new assignment
  succeeded. Do not auto-delete records or assume time-based expiry proves safety.

## Alternatives and verification

Role-only tenant access and browser filtering are rejected. Assignment-only GET
for all states breaks approved triage. Auditor pool-member fabrication changes
an unrelated membership model. Returning stored responses before authorization
confuses idempotence with permission. Re-executing a retry can claim extra work.

Inspector must prove scoped metadata/triage/merits and coordinator/AUDITOR
unassigned positives with real tenant bindings; no-binding, wrong-unit/pool,
other tenant, omitted role, revoked/multi-role/impeded and legacy-route/write
bypass negatives; same-actor retry/new action/cross-actor reuse; revocation on
replay and concurrent claims. Real HTTP+DB tests supplement UI guards. This ADR
and its fixtures are design requirements, not executed security evidence.
