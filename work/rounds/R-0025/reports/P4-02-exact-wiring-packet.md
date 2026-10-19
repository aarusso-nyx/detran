# P4-02 — exact defense claim → dossier wiring packet

Architect, Article7, 2026-10-18. **Prepared for review; NOT authorized to execute.**
The Owner approved D1–D7 and requested this packet/ADRs in a PR, while keeping
runtime paused. Approval of those decisions is not approval to run these tasks.
No task JSON, AUTHORIZATION, round state, evidence chain or runtime file is changed.

Base: main `3e4ee3781fa4f9a9e20328527b24724cde8c4457` (PR197).
Governing design: ADR0045 (contract), ADR0046 (scope/replay), approved D1–D7
addendum in open-decisions-rait.md and the existing admissibility contract/ADR0041.
Scope is one connected defense admissibility→claim→dossier-read slice in open
R-0025, with its necessary security prerequisites. It is not full instruction,
full JW01, a new round, a platform adoption or permission to close/seal.

## 1. Observable delivery and fixed boundaries

An authorized analyst chooses from server-derived eligible pools, sees only the
ordered metadata they may consume, confirms a fresh claim, receives HTTP200 CASE
result and opens the assigned case's dossier. The command composes the already
documented ADMITIDO→DISTRIBUIDO→EM_INSTRUCAO stages atomically, after admissibility.
The assignment and both logical state movements are traced in the same transaction;
versions advance v→v+1→v+2, final ETag v+2, with correct from/to snapshots and
distinct per-stage outbox identities for the two existing case-changed events.
Do not reuse attempt+topic for both events or emit duplicate assignment effects.
Exact retries do not assign again. New claims have new attempt identities.

The same packet proves pre-assignment triage still works and no unrestricted
legacy list/get/child/write/replay path bypasses the accepted case scope.
Coordinators and AUDITOR may read unassigned merits only with matching explicit
unit/pool binding, actual read permission and no impediment; this grants no write,
claim or signing action. Missing identity, scope, risk/priority or required
parameter source is fail-closed, never a browser/UUID/global-admin fallback.

No dossier upload/attachment/signed URL, inquiry, draft, ready/signing, new SSE,
provider or IdP activation. Other RAIT role journeys retain their accepted
contracts; no role-only fallback substitutes for an unsourced case predicate.

## 2. Exact transport to implement after authorization

- `GET /v1/inf/rait/claim-context`, operation raitClaimContext, existing analyst
  claim permission: server resolves actor→active analyst memberships→active defense
  pull pools and matching unit. Optional pool_id is validated against that set.
  Response: eligible pool summaries, none/single/choice selection, selectedPoolId
  or null and a typed paginated queue of minimal metadata. Zero pools disables
  claim, one is selected automatically, multiple require a choice. Pagination
  occurs after scope and authoritative ordering; no generic capped-list inference.
- Existing `POST /v1/inf/rait/pools/{id}/claim-next`, raitPoolClaimNext: strict empty
  body, required Idempotency-Key, no If-Match; reject a supplied If-Match400 rather
  than pretend it validates a pool. No body caseId/actor/tenant/role accepted.
  HTTP200 `{data,events}`, data.id is the selected case, explicit assignment_id,
  state EM_INSTRUCAO, strong updated case ETag for subsequent versioned writes.
- Keep existing typed admissibility input and its If-Match behavior. Any new
  purpose-specific read projection must be an explicit typed contract operation;
  a caller-supplied purpose is never authority. Legacy successful read shapes
  stay compatible where allowed, but their server filtering/parent checks cannot
  remain tenant-only bypasses. Complete the same public operation once, without
  duplicate generated/handwritten paths or untyped casts.
- QUEUE_EMPTY409 also covers no non-impeded eligible work; no disclosure of skipped
  cases. Availability/WIP/parameter-source errors remain distinct. Candidate-before-
  WIP precedence is explicit. Cross-actor or mismatched/unsafe-legacy key reuse409
  returns no previous case. Unauthorized/missing scoped by-ID reads use consistent404.

## 3. Ownership / allowed implementation paths — future packet only

| Owner                              | Owned paths and responsibility                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architect                          | contracts/JW01-claim-wiring-contract.md and reports/P4-02-route-scope-inventory.md under R-0025; verify source/field/route/role map before RED/Engineer work; no new product choice                                                                                                                                                                                                                                                                                                                                                                     |
| Inspector                          | New/affected tests under backend/domains/inf/rait-case/tests, inf/rait-worklist/tests, backend/app/tests; adjacent frontend specs and preview/browser harnesses for named consumers. Prove source expectations before Engineer changes; preserve unrelated sentinels                                                                                                                                                                                                                                                                                    |
| Engineer — contracts/data/security | docs/framework/blueprints/BP-INF-RAIT-CASE-001.json and BP-INF-RAIT-WORKLIST-001.json; corresponding handwritten commands OpenAPI. New CASE-owned read-scope/claim-context/scoped-read handlers and service under backend/domains/inf/rait-case/src/handwritten; existing rait-case-command.service/controller; WORKLIST scoped read handlers for case-derived resources. Export/inject the scope service through public package boundaries and existing WORKLIST→CASE workspace dependency; no deep imports/circular dependency/shared SQL policy copy |
| Engineer — generated outputs       | Only outputs attributable to those blueprints/contracts: CASE/WORKLIST generated DDL, modules/entities/controllers/DTOs/services, CRUD/command OpenAPI and packages/api-clients generated files. Run the existing generators; never hand-edit generated code. Supporting hand-written DDL for scoped bindings only if generator cannot express required constraints, with a recorded reason and affected RLS checks                                                                                                                                     |
| Engineer — frontend                | WorklistClient, CaseClient, QueueFacade, CaseFacade, case-access.guard and defense-pool-queue/dossier/triage consumers under apps/rait/web/src/app; typed models, existing idempotency helper/command runner, i18n and preview adapters/specs needed for these paths. No activation of unrelated M8 commands                                                                                                                                                                                                                                            |
| Architect/Auditor                  | Existing R-0025 reports/reviews and scoped post-merge evidence/audit only after separately authorized implementation/merge. No lifecycle close/seal or scorecard write                                                                                                                                                                                                                                                                                                                                                                                  |

No changes to siblings, STYNX/DEVAI pins, law/, scorecard tools/policy, arbitrary
root scripts, unrelated domains/apps, or provisioned production personnel/scopes.
The packet does not enable executing its role tasks now. If a dependency requires
additional owned paths or a new business rule, stop for a concrete packet amendment.

## 4. Ordered tasks and release gates

**T0 — Architect preflight, no runtime mutation.** Freeze current main and source
hashes; verify no concurrent ADR collision. Inventory mounted reads/writes for all
public CASE resources plus WORKLIST assignments/clocks/clock-alerts and every
parent chain they can reveal. Map each route+method+effective role to metadata,
triage, merits or oversight, parent resolution, projection and SQL predicate.
Include lists/counts/by-ID, reparenting/state/assignment writes, protocol/triage/
admit and claims/replays. No unclassified fallback. Do not silently revoke another
accepted role journey: unsourced shared-route predicates block T2 pending amendment.
Inventory existing defense DISTRIBUIDO rows and claim replay records by trusted
state/provenance, without rewriting them. Approved legacy compatibility/migration
must be explicit before T2; no converting or discarding rows from a test fixture.
Identify authoritative prescription-risk/priority sources and identity mapping;
absence blocks release, never defaults risk to low or NULL to none.
Deliver the exact route inventory and classify necessary changes inside the owned
paths. Freeze allowed triage fields/document classes from UC002/current forms;
unknown data is not silently exposed as generic merits. Explicit oversight records
may be absent in production; that correctly denies access, not a blocker to testing
with provisioned tenant fixtures. Actual production provisioning remains separate.

**T1 — Inspector RED before Engineer.** Add typed transport/source assertions,
server scope and bypass cases, transaction/ordering/replay/concurrency tests and
routed page/preview tests in §5. Show meaningful RED for real missing behavior,
not only unavailable-method sentinel replacement. No weakening, expected-green
fake DB, ignored Docker absence or globally permissive principal. Commit/report
RED separately and do not call it a product failure or completion proof.

**T2 — Engineer contract and scope prerequisite.** Publish strict GET/POST types;
blueprint the internal operations[] oversight binding from ADR0046, tenant RLS,
tenant-consistent unit/pool references and exactly-one-scope constraint. No public
binding CRUD or production seed. Implement one CASE-owned scope decision path;
apply scoped SQL before pagination and parent checks to every inventoried route.
Replace relevant generated endpoints through blueprint controls and handwritten
handlers. Remove raw CASE state/version/ownership mutation bypasses; authorized
state transitions stay command-owned. Check source and target parent on child
reparenting; no write makes an unreadable case readable. Preserve unrelated
business contracts or stop. T2 must prove direct HTTP bypass negatives and approved
triage/oversight positives before claim UI is enabled. Other command fingerprints
and historical replay rows remain untouched.

**T3 — Engineer claim transaction and retry.** Implement defense atomic stages,
assignment/history/audit/outbox rollback boundary, authoritative risk and priority/
NULL ordering, locked member/WIP/selection and impediment exclusion. Reuse existing
parameter/calendar/context owners. Implement fresh-action key versus exact retry,
actor-bound fingerprint and reauthorized replay under ADR0046 without selecting
again. Old actorless replay records deny safely unless provenance is established;
no delete/history rewrite or automatic new-key re-claim after an uncertain result.
Regress JARI/CETRAN and earlier versioned admissibility behavior.

**T4 — Engineer frontend wiring.** Generated inputs/results only; read actual
claim context, select only returned eligible pools, metadata queue and UI reasons.
Fresh confirmation creates a persisted-in-memory attempt key until its retry is
resolved; another confirmed action creates a new key. Navigate using data.id to
dossier on success; retain errors/refresh actual reads. Guard and purpose reads
use real server scope; no preview path enables production bypass. Dossier is
read-only in this packet; existing unavailable actions stay unavailable.

**T5 — Inspector acceptance.** Run all §5 proofs, affected backend/app tiers and
browser/preview artifact on the assembled candidate, not a DISTRIBUIDO-only fixture.
Source→generated→mounted route→SDK→routed UI types must agree. Capture real persisted
assignment/events/replay/denial results. Scope and concurrency claims require real
HTTP+DB evidence; a local synthetic IdP is not productive identity qualification.

**T6 — Cross-family review and delivery.** Run full applicable P1 gates and required
CI for the exact candidate; independent review and bounded corrections; PR review,
authorized merge only with green checks; scoped evidence/audit after merge under
existing verbs. No round closure, whole-JW01 PASS or readiness promotion. This
packet's implementation PR and merge still need separate authorization.

## 5. Required acceptance matrix

| Proof                | Positive and decisive negative                                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Connected state flow | PROTOCOLADO→triage→ADMITIDO→claim→dossier/EM_INSTRUCAO on real HTTP+DB; reject repeat triage/admit, caller-selected case, receive shortcut; rollback leaves no partial stage/assignment/event                                                                                                           |
| Scope                | Eligible analyst queue; authorized triage before assignment; assigned merits; coordinator and AUDITOR unassigned merits inside explicit binding. Deny wrong/no/ambiguous scope, other tenant, omitted role, revoked binding/role/membership, impediment, forged actor/purpose and mixed-role escalation |
| Bypasses             | Every T0 legacy list/get/count/child/write and replay entry point; no all-tenant fetch+filter, leaked totals, reparented ownership or direct state/assignment mutation                                                                                                                                  |
| Selection            | Zero/one/multiple eligible pools and full pagination; unknown/foreign pool; server identity mapping, missing source, no hardcoded/first-pool fallback                                                                                                                                                   |
| Ordering             | Risk first, PCD=80+,60+,confirmed none, NULL excluded, chronological/id ties and impediment skipping; WIP reached and empty-before-WIP precedence; missing schedule/day slot/source fails distinctly                                                                                                    |
| Retry                | Same actor/same attempt exactly once; new action gets next work; changed pool/body key reuse; cross-actor same key no disclosure; revocation on replay denies without creating assignment; legacy record recovery fails closed                                                                          |
| Concurrency          | Two real concurrent claims, no duplicate case assignment, WIP not exceeded; same-key concurrent retry one effect; no fake transaction stub as sole proof                                                                                                                                                |
| Transport/UI         | Strict empty body/no If-Match,200 typed CASE/assignment identity and case ETag; malformed/forged fields; omitted-role negatives; dossier navigation and error/refetch states; retained If-Match commands unaffected                                                                                     |
| Preview/regression   | Preview no network/write/simulated success; production excludes preview; prior admissibility and other instances/role contracts retained; attachment/minuta/signature stay unavailable                                                                                                                  |

Run `pnpm blueprints:generate`, `pnpm contracts:openapi`, `pnpm contracts:clients`
when their inputs change, then `pnpm blueprints:check`, `pnpm contracts:check`,
`pnpm contracts:test`, affected CASE/WORKLIST unit/integration/app HTTP tests,
`pnpm backend:test:ci`, `pnpm --filter @detran/rait-web typecheck`, lint/test/build,
preview build/browser QA and `pnpm check` / `pnpm devai:doctor`. Run affected RLS,
SQL-param, role/decorator, generated-drift and chain checks from root scripts;
no check removal/path exclusion. `devai evidence verify` when proof records change.
Exact app/DB setup comes from the existing scripts and receipt, never optional-DB
PASS or a destructive reset of someone else's local stack.

## 6. Approval and stop conditions

This is the exact proposed packet for review, with tasks, write boundaries and
acceptance, not task dispatch. Runtime remains paused. Stop on missing scope/
identity/risk source, unclassified shared route/role, unsafe legacy data, failed
same-tenant/bypass/concurrency proof, needed unowned path or new business choice.
Resolve those through the named preflight gate or an approved amendment; never
label them implementation complete. No scorecard work or local cleanup is bundled.
