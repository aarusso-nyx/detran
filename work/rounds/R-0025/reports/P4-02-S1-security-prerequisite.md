# P4-02-S1 — security prerequisite, approval packet

Architect, Constitution Article7. Status: PROPOSED, awaiting explicit Owner
approval. Baseline: main0e6589d8a18f55a0a3e4407f0e61f1475849e7eb, PR200.
This document does not authorize runtime/test dispatch. It narrows execution of
P4-02/A1 T1–T2 without changing approved D1–D11 or reopening T0.

S1 is an explicit bounded sequencing amendment to A1: its pre-T2 Inspector gate
covers the107-method security bypasses, D8 projections/pool containment, D9
identity, T0 fields and scope/revocation concurrency. D10 legacy classification,
D11 missing/unknown risk and atomic claim-concurrency RED move to an S2 Inspector
commit that MUST precede T3. Those assertions are not a prerequisite to T2 scoped
protection; they remain mandatory before their later implementation. Approval
of S1 knowingly authorizes this gate split, not removal of any acceptance.

## Outcome and bounded scope

Deliver one implementation PR that makes the closed access/parent and triage
contracts effective across current CASE/WORKLIST surfaces. Authorized triage,
assigned-case and oversight reads continue with purpose-specific typed fields;
unscoped list/count/by-ID, cross-parent writes, raw state/ownership/history
mutations and replay bypasses cannot expose or alter a case. No claim UI is enabled.

Canonical sources: ADR0045–47, ADR0048/49 boundaries, the A1 amendment,
P4-02-T0-access-map.md and P4-02-T0-triage-fields.md in ../contracts/ and
JW01-claim-wiring-contract.md. The107-method baseline is a coverage denominator,
not a requirement to preserve unsafe routes: record retained/replaced/removed
methods and any replacement. Include routing to new internal tables with no
public CRUD. Never claim missing production bindings are provisioned.

## Role sequence and exact ownership

1. Architect freezes integrated source hashes and method manifest, supplies the
   already-decided blueprint and OpenAPI changes. Under Article6, docs/blueprints
   and contracts remain Architect-owned even where the older packet table labels
   their execution Engineer. No new permission, threshold or state transition.
2. Inspector adds decisive RED in CASE/WORKLIST tests, shared policy tests and real
   app HTTP+DB tests. Record separate RED commit and expected failing assertions
   against the baseline; infrastructure absence/skips are not RED or PASS.
3. Engineer implements only the approved scope protection and attributable
   generation. Inspector reruns unchanged decisive tests to GREEN; each discipline
   owns its files and may not weaken another discipline's artifacts.
4. Coupled task group P4-02-S1 has Architect→Inspector→Engineer branch lineage
   under Article24: Architect branch from integration HEAD; Inspector branch from
   Architect checkpoint; Engineer branch from Inspector RED checkpoint. Ordered
   local merges to the S1 integration branch retain Architect→Inspector→Engineer
   ancestry and downstream rebases at checkpoints. Inspector GREEN rerun follows
   Engineer changes. Final integration branch goes through one main-targeting PR;
   local integration is not permission to merge to main. Runtime-owned task records
   and locks are created through supported verbs only after approval; no task is
   registered or dispatched by this proposal. Cross-family review and full checks
   are required. Owner approval of
   S1 authorizes preparation of that PR, not merge, deployment or S2 dispatch.

| Owner | Allowed paths and limits |
| --- | --- |
| Architect | docs/framework/blueprints/BP-INF-RAIT-CASE-001.json and BP-INF-RAIT-WORKLIST-001.json; their handwritten commands OpenAPI under docs/framework/contracts; R-0025 scoped contracts/reports/reviews. Changes only transcribe integrated T0/D8/D9 scope and projection decisions. Accepted ADR text stays immutable. |
| Inspector | backend/domains/inf/rait-case/tests/ and inf/rait-worklist/tests/; backend/domains/shared/src/policy.spec.ts and policy.guard.spec.ts; backend/app/tests/e2e/rait-p402-scope.e2e.spec.ts plus existing backend/app/tests/e2e/{rait-case-commands,rait-jw01-admissibility,rait-worklist-corrective,rait-worklist-production,policy-routes}.e2e.spec.ts; backend/app/tests/shared/{rait-case-command,rait-jw01-admissibility}.fixture.ts, edit/extend without deleting or weakening existing fixture coverage. New-table RLS tests belong in the Inspector-owned rait-p402-scope.e2e.spec.ts, using real role_app_backend request tenant context; run pnpm verify:rls-ddl as an additional existing gate. Own colocated *.spec.ts and *.wiring.spec.ts of the compatibility files listed below, only if those adapters change. No unrelated test deletion or thresholds/config edits. |
| Engineer — CASE | New src/handwritten/rait-case-scope.service.ts, rait-case-scoped-reads.controller.ts and rait-case-pool-scope.service.ts; existing CASE handwritten command/admissibility/inquiry services/controllers for parent/actor/field/replay checks; src/handwritten/index.ts; registrations/exports via the generated domain module and index. No backend/app/src/app.module.ts change is owned by S1. One canonical scope predicate; no WORKLIST dependency. |
| Engineer — WORKLIST | New src/handwritten/rait-worklist-scoped-reads.controller.ts under backend/domains/inf/rait-worklist and existing handwritten worklist commands service/controller; src/handwritten/index.ts and generated domain module registration; consume CASE through existing public workspace dependency. No new claim transaction or broad command activation. Existing command/replay scope checks remain in S1; no selector/atomic legacy behavior is enabled. |
| Engineer — policy/data/generation | backend/domains/shared/src/policy.ts RAIT read rows only, preserving effective strict-command precedence. Generated outputs attributable to the two approved blueprints: CASE/WORKLIST modules/entities/controllers/DTOs/services, DDL34/35 and packages/api-clients; tools/blueprints/generated-files.json only as attributable generator manifest. Generated CRUD OpenAPI under docs/ remains Architect-owned; no script logic change. Supporting handwritten scoped-binding constraints only if generator cannot express the approved invariant, with explicit rationale and RLS verification. No generator tooling changes. |
| Engineer — compatibility only | apps/rait/web/src/app/data/api/case.client.ts and worklist.client.ts, data/facades/{case,queue,archive,audit}.facade.ts; core/guards/case-access.guard.ts; features/caso/pages/triage.page.ts, features/arquivo/pages/archive-search.page.ts and features/auditoria/pages/audit-trail.page.ts; preview/adapters/preview-{case,worklist}.client.ts. Colocated specs are Inspector-owned only; Engineer does not edit tests. Only adapt existing behavior to explicit typed subsets; no new screens, enabled claim, risk header, navigation feature or cast of partial data as full stored DTO. If required compatibility exceeds these existing consumers, stop with a bounded amendment. |

The four archive/audit compatibility additions beyond base §3+A1 are explicit:
data/facades/archive.facade.ts, data/facades/audit.facade.ts,
features/arquivo/pages/archive-search.page.ts and
features/auditoria/pages/audit-trail.page.ts, with their colocated specs owned only by Inspector under
apps/rait/web/src/app/. T0 requires scoped events and sealed-archive projections;
these existing consumers must adapt safely to those typed subsets. S1 approval
includes exactly this bounded ownership extension; no new workflow or screen.

Generation sessions respect Article6: Architect authors CASE/WORKLIST
*.commands.openapi.json and runs contracts:openapi for the two generated CRUD
*.openapi.json files under docs/framework/contracts. Engineer runs
blueprints:generate for code/DDL/manifest and contracts:clients for generated
packages/api-clients. No generated output is hand-edited. Review all generated
deltas; unrelated outputs must remain byte-identical or require a new packet.

CASE role-bound read-scope and exact case-pool relation are internal operations[]
entities with tenant-consistent references, exactly-one unit/pool where applicable,
provenance, active/revocation semantics and uniqueness. Canonical staff identity is
auth.users.id; do not migrate/guess external subjects. Protocol/admit routing uses
ADR0047's internal service and explicit unambiguous source; missing routing never
becomes a new legal admission guard. Protocol/admit invoke the resolver in their existing transaction; if zero or
multiple qualified routes exist, write no link and retain legal success unchanged.
S1 commands do not emit CASE_POOL_UNRESOLVED409. Pool-scoped reads fail closed for
unlinked cases while independently authorized unit inventory retains visibility.
The pool-wide claim/context409 belongs to S2. No selector implementation or
silent backlog omission is authorized here. No public binding/routing API, historic backfill or seed.

## Decisive acceptance

- Unimplemented501 or generic500 is not proof of protection. Each security
  negative must exercise an implemented guard/validation or explicit removed404;
  retained positive paths must succeed rather than disappear behind errors.
- Every107 baseline method has a tested disposition and source/target parent
  policy; removed routes return404, not noop200. Lists filter in SQL before
  pagination/totals; by-ID missing and unauthorized both404. Allowed-role/action
  checks and source-equivalent functional writes retain their actual semantics.
- Complete role-purpose positives and negatives from the closed map, including
  unassigned exact-pool oversight, other-pool same-unit exclusion, revoked/foreign
  scope, real duty/session/presidency requirements, manager metadata-only and
  sealed archive suppression. No mixed-role scope, admin or wildcard bypass.
- Canonical internal identity positive; raw OIDC subject, orphan/foreign identity
  and stale membership negatives. All case-bearing child chains and wrong-parent
  reads/writes/reparenting tested, including clock-alert→clock→case.
- Exact triage/document allowlists; free petition/third-party/attachment data not
  leaked. Human checklist and existing protocol→triage→admit/reject remain GREEN;
  unclassified document.kind never becomes positive verification or a new human
  save/admit prerequisite. No own-agency missing AIT/NA/NP rejection rule added. Protocol/admit status,
  body, case version and domain events match existing legal behavior with and
  without resolvable routing; internal link persistence never adds a criterion.
- Removed case PATCH404; restricted generic create/update validation400 as closed
  map requires, with no writes/events/audit/version effects. Legitimate command
  transitions remain command-owned; actor-bound replay cannot disclose a prior
  result after scope loss or cross-actor/tenant key reuse. Preserve accepted exact
  retry semantics; stale first-use versions and malformed writes remain distinct.
- Real request tenant/RLS context, two-tenant persisted fixtures and concurrent
  source/revocation checks where relevant. No owner-role request context, mocked
  HTTP substitute or optional DB PASS. Existing command success/rollback/replay
  sentinels remain; fixture provisioning never satisfies production release gates.

## Checks and stop conditions

Run existing blueprint/OpenAPI/client generators and checks on attributable files;
verify no unrelated output delta. Run focused CASE/WORKLIST unit/integration and
real app HTTP tests, shared policy suites and prior JW01 admissibility regression.
If compatibility files change, run RAIT lint/tests/build and routed triage/archive/
audit/preview regression. Always run pnpm verify:rls-ddl plus the real Inspector-owned HTTP+DB RLS tests, affected decorators, role catalogue,
public boundary/type checks, root pnpm check, devai:doctor and evidence chain
verification when recording evidence. Capture exact command/results; expected RED
is not final delivery PASS. Independent review must close material findings before
implementation PR. Preserve unrelated baseline failures as such; never lower gates.

Stop for an unsourced business permission/state/legal rule, unowned required path,
changed canonical contract or inability to preserve an accepted functional
journey. Do not fabricate a production appointment/source or silently deny an
accepted role to complete S1. Qualified tenant fixtures are allowed after approval.

## Explicitly later — S2 and beyond

Not in S1: new claim-context or case-risk endpoint activation; pure risk evaluator,
parameter catalogue A/C/B/D work, incident adapter/DI, legacy qualification entity/
service or v+1/v+2 selector changes; atomic claim/concurrency/worst-clock ordering
implementation; typed claim UI/dossier wiring. Those form the next bounded S2
packet after this security prerequisite. No risk persistence/publication, sweeper,
notification, incident creation, production provisioning, scorecard remediation,
sibling/pin/law changes or R-0025/JW01 closure.

Requested approval: “Approve P4-02-S1 as written” authorizes the role-separated
RED→scope implementation→GREEN→review PR sequence above. Until then runtime stays
paused. Merge/release and later slices require separate authorization.
