# P4-02-S2 — exact backend claim prerequisite packet

Architect, Constitution Articles6–10/24. **PROPOSED — NOT AUTHORIZED. S2 PAUSED.**
Baseline: main `2df548e0ac5227abb64b66994f675dea7ba36a5a`, PR203 merged.
No runtime, test, generated code, schema or task dispatch is performed by this
proposal. D1–D11 and accepted ADR0045–49/0052 remain binding.

## Requested approval and sequencing amendment

Approve one backend-only S2 implementation PR: T3 current risk + trusted legacy
qualification + complete-pool selector/context + atomic claim and typed HTTP
contracts, with Inspector RED before Engineer and unchanged decisive GREEN after.
This explicitly splits the original P4-02 T3–T6 delivery: frontend activation,
dossier navigation/header and browser acceptance move to a separately approved
S3 packet. All original T4–T6 UI and whole-journey acceptance remain outstanding.
No successful analyst browser journey is claimed by S2 alone.

Approval phrase: **“Approve P4-02-S2 as written, including backend-first sequencing.”**
It authorizes source preflight, role-separated tests/implementation/validation,
independent review and opening one implementation PR. It does not authorize its
merge, S3, deployment, production provisioning, scorecard remediation or close/seal.
Merging this planning PR alone is not that approval. Until explicit approval,
no S2 managed task creation, test RED authoring or Engineer dispatch.

## Outcome and canonical contracts

An authenticated qualified analyst can discover eligible defense pull pools and
receive a correctly scoped/ordered metadata page; POST selects one safe candidate
under the same canonical policy and returns its CASE identity/assignment/validator.
The backend connects earlier admission to instruction atomically without changing
admission success, grants, existing JARI/CETRAN contracts or S1 security protections.

Sources: ADR0037/0045/0046/0047/0048/0049/0052; approved D1–D11;
contracts/JW01-claim-wiring-contract.md, P4-02-T0-access-map.md,
P4-02-deadlines-risk-api.md; P4-02-D8-D11-bounded-amendment.md; original
UC-RAIT-002/003, WF-RAIT-001/002/004 and R-0006 CTG-0001 public deadline API.
No accepted ADR text is rewritten. Recheck these sources and main at dispatch;
semantic drift or a new policy decision stops for a bounded amendment.

## Exact transport

- GET `/v1/inf/rait/claim-context` / raitClaimContext under existing analyst claim
  permission: `@Resource('inf:rait-case') @Action('claim-next')`, preserving the
  current analyst-only action. A read-only role must receive403, even if it can
  read scoped merits. Optional pool_id, separate pool/queue cursors and bounded limit(max50
  from the accepted contract). Complete-set eligiblePoolCount; selection
  none/single/choice; selectedPoolId or null; paged pools `{id,name,instance,unit_id}`
  and queue metadata `{id,protocol_number,instance,state,protocolled_at,unit_id}`.
  Zero pools disables claim; one selects automatically; multiple require explicit
  authorized choice. Server scope/order precedes pagination; no merits, identities,
  client purpose/tenant/actor authority or incomplete500-row eligibility inference.
- GET `/v1/inf/rait/cases/{id}/risk` / raitCaseRiskSnapshot, the typed current-risk operation
  already specified by A1 §6, using `@Resource('inf:rait-case') @Action('read')`
  plus the existing S1 parent/purpose predicate. RaitRiskSnapshot contains asOf/today, applicability,
  applicable clocks' flags/ceilings, worstFlag and sourceVersions. No raw input source references, persisted clock falsely represented as fresh,
  or partial full-entity cast.
- Existing POST `/v1/inf/rait/pools/{id}/claim-next` / raitPoolClaimNext: strict `{}`,
  required Idempotency-Key, no If-Match; a supplied If-Match returns400 before
  effects. HTTP200 `{data,events}`, typed CASE `data.id`, state EM_INSTRUCAO,
  non-null assignment_id and strong final CASE ETag. All other commands retain
  versioned validators. No caller-selected case/actor/role/tenant.

## Fixed domain and transaction behavior

1. Reuse S1 canonical internal staff identity and complete role-purpose predicates,
   exact pool/unit/tenant binding, real active membership and impediment checks.
   Validate the complete potential in-scope candidate set before ordering; do not
   choose by unit then reject another pool's first case. Unresolved routing blocks
   the pool operation with safe CASE_POOL_UNRESOLVED409; authorized inventory keeps
   visibility. Scope loss/revocation rechecks apply to reads, claims and replay.
2. Pure `evaluateRaitRisk` uses exactly one A/B/C/D applicability record and one
   validated tenant operation instant/timezone, existing deadline/calendar owners
   and qualified executable ladder snapshots. Worst applicable flag sorts before
   approved legal priority/time/id; unqualified or unknown is never low risk.
   No applicable clock yields explicit null; live defense candidates cannot use
   that as assessed SEM_RISCO. A/C proposed catalogue rows and B/D normalization
   follow A1/ADR0049; preserve source labels/status and old operational versions.
   Do not promote proposed rows to vigente or invent any threshold/calendar/date.
3. Required missing/stale/malformed risk source, missing provider/parameter or
   missing/ambiguous required incident qualification yields RISK_SOURCE_UNAVAILABLE503
   for the whole selected pool operation, even beyond the first page. The scoped
   risk read fails for its case. Existing inventory remains available to qualified
   operators. App composition's incident port only verifies existing same-tenant
   alert/ORG-target provenance in the caller transaction; no ORG mutation/API.
4. New ADMITIDO cases perform ADMITIDO→DISTRIBUIDO→EM_INSTRUCAO, v+2, ordered
   accurate per-stage history/case events, distinct attempt+kind+stage outbox
   identities and one assignment. Qualified unassigned legacy DISTRIBUIDO shares
   the same order and performs only the final stage,v+1. Already assigned cases
   are preserved. Cases with legal_priority=NULL remain excluded under ADR0037;
   protocolled_at/id retain the approved deterministic tie-break ordering.
5. Internal RaitClaimLegacyQualification is append-only/versioned, operations[],
   tenant/case/version-bound with verified admission/distribution/pool/assignment
   refs and reviewer/authorization provenance per ADR0048. Missing, stale or
   contradictory classification blocks CLAIM_LEGACY_UNVERIFIED409 without merits.
   Selected-pool claim-context GET uses the same complete qualified ordering and
   also returns CLAIM_LEGACY_UNVERIFIED409 for an unresolved in-scope legacy row;
   never a successful degraded page. This transcribes ADR0048's identical pool/
   context qualification and safe ordered-set boundary, not a new grant.
   An explicit trusted hold may exclude only its row and preserves operational
   visibility. No automatic backfill/recovery, guessed reviewer or public CRUD.
6. POST re-evaluates risk/eligibility inside its locked transaction. Serialize
   member/WIP as well as candidate selection; skip impeded work and retain
   QUEUE_EMPTY-before-WIP precedence. Roll back case, assignment, histories,
   audit, idempotency and outbox on any failure. Same-actor exact retry reauthorizes
   current scope without rerunning first-use state/WIP or assigning twice; fresh
   attempts use new keys. Preserve claim fingerprint semantics and S1's unrelated
   command replay receipts under ADR0052. GETs make no domain/audit/flag writes.

## Closed ownership and generation

[P4-02-S2-owned-paths.json](P4-02-S2-owned-paths.json) is the exact path inventory,
including baseline hashes, proposed new files and the generated upper envelope.
A listed generated file may change only when attributable to the approved inputs.
Unrelated regeneration must remain byte-identical. No directory-wide handwritten
runtime grant or implicit permission to edit colocated tests.

- Architect: the two CASE/WORKLIST blueprints, their handwritten command OpenAPI,
  parameter-catalogue source and R-0025 scoped packet/review/report documents.
  Architect owns generated CRUD OpenAPI under docs and runs contracts:openapi.
- Engineer: named CASE risk/port/context/legacy services/controllers, existing claim
  command/scope/pool-scope services and handwritten exports; public deadlines
  rait-risk.ts/index.ts; WORKLIST risk projection/export; app rait-risk.providers.ts
  and app.module.ts registration only. No auth pipeline or owner/system request
  context. CASE→deadlines and WORKLIST→CASE remain acyclic; app binds the read-only
  incident port through public interfaces, never deep imports.
- Supporting `19-rait-case-scope-enforce.sql` is owned only for ADR0048 qualification
  constraints/immutability that the existing generator cannot express, with a
  recorded rationale. S1 binding guards remain. New SQL loader files, apply.sh,
  seed/reset scripts, generator logic and package dependency changes are unowned:
  stop for an amendment if required. The existing loader already owns this file.
- Engineer runs existing blueprint/client/parameter generators. Exact generated
  parameter outputs:05-parameters.sql, parameter-catalogue.ts and parameter-flags.ts;
  changes derive only from A/C additions and B/D typed normalization. No production
  seed/reset or unrelated parameter changes. New qualification entity's generated
  entity/repository/service/controller/create DTO plus existing module/barrels are
  named in the inventory; operations[] must not mount public CRUD.
- Inspector exclusively owns the named pure/unit/transaction/HTTP tests and fixtures.
  Normalize A1's proposed pure-risk test path to
  `backend/domains/inf/deadlines/tests/unit/rait-risk.spec.ts`, which is discovered
  by the existing unit configuration; no test-runner/configuration change.
  Existing behavioral-matrix claim If-Match success becomes the source-backed400
  counterexample; the generic HTTP helper omits If-Match only for claim. S1 legacy
  replay fixtures gain verified source qualification while retaining replay/revocation
  assertions. Upgrade inventory assertions remain exact if the new entity changes
  DDL. The contract-operation test may update its exact census329→331 solely for the
  two named GET operations, with existing route/error assertions preserved; a
  different generated count stops for reconciliation. The exact INF RLS census
  test is explicitly owned for98→99 plus the new qualification table's tenant/RLS/
  FORCE/policy/trigger assertions; preserve all10 reference tables and existing
  cross-tenant protections. No other table-count relaxation is authorized. Parameter tests may add
  exact A/C and normalized B/D assertions without changing other inputs. No skipped
  tests, removed sentinels, timeout increase or gate relaxation. The existing
  CTG2 structural E2E spec is explicitly Inspector-owned only to qualify its
  transaction-scoped pool/legacy fixture if needed; retain manifest/draw/assignment/
  timer/ETag assertions and rollback. No new production grant or changed draw rule.

No frontend runtime/test/preview edit, shared policy grant, WORKLIST command
activation, workflow/CI runner change, sibling, pin, law reference-signal or
scorecard policy/tool/input edit is authorized. Read-only regression execution is
allowed. A required extra path stops for explicit bounded approval before editing.

## Preserved lifecycle and legacy harness disposition

S1's untracked TASK-0028…0031 records, backlog entries, six expired module locks
and registered task worktrees remain in custody. They describe external execution
checkpoints, not fabricated managed-provider finish evidence. Before any approved
S2 registration, inspect/reconcile that state through supported DEVAI verbs, avoid
ID/lock reuse, and preserve recovery lineage. If supported release/disposition
cannot be completed truthfully, stop before dispatch; never hand-delete or mark
S1 tasks completed just because PR203 merged. This proposal performs no lifecycle
mutation and does not authorize destructive worktree cleanup.

`createWorklistCommandRuntime` and its fixture-only claim branch are read-only
legacy harness material: current references occur only in WORKLIST unit/integration
tests, not the mounted CASE HTTP claim path. Their DISTRIBUIDO-only/WIP-first model
is not the canonical S2 contract and cannot prove new selector acceptance. Preserve
those sentinels byte-identically; decisive S2 HTTP+DB tests own the real contract.
If that harness or its tests must change, stop for a bounded amendment rather than
silently creating a second live claim implementation or weakening old assertions.

## Role sequence and decisive acceptance

Architect freezes source/path/operation/parameter manifests and validates no new
product decision. Inspector branch descends from that checkpoint and commits
intentional RED against baseline; Engineer descends from accepted RED. Preserve
ordered Architect→Inspector→Engineer lineage and separate roles/worktrees. Then
Inspector reruns unchanged decisive tests to GREEN, followed by cross-family review.
Material findings must close before the implementation PR. Fixture/test corrections
require source-backed Inspector disposition; do not weaken a failed assertion.

Required real HTTP+PostgreSQL proof includes:

- Earlier protocol→triage→human checklist→admit succeeds, then new claimv+2;
  qualified legacyv+1; exact assignment, two-versus-one stages, ETag, audit/outbox.
- Zero/one/multiple pools; complete counts beyond a page; unauthorized/inactive/
  revoked pools; read-only-role claim-context403; same-unit other-pool isolation; cursor/pool input cannot grant scope.
- Every risk ladder boundary/applicability/timezone/source-version case; missing
  source beyond first page blocks whole selection; NULL and deterministic ties;
  priority and worst-clock order; impeded cases skipped without disclosure.
- Missing/stale/contradictory legacy proof409 on both selected-pool GET and POST,
  preserve-assigned and explicit hold;
  wrong tenant/parent/version; required incident provider/provenance503; no guessed
  classifications, successful partial queues or unsafe fallback.
- Competing analysts on one case, same-member competing claims/WIP, scope/revocation
  races, exact retry, changed pool/body, new attempt and cross-actor key reuse.
  Inject failure after every business stage and prove complete transactional rollback.
- GET no-side-effect snapshots; missing DI fails before writes; actual request
  role_app_backend tenant RLS; S1 read/parent/replay positives and negatives,
  retained JARI/CETRAN/admissibility semantics and non-claim If-Match behavior.

Execute affected deadlines/CASE/WORKLIST unit and integration suites, full app
HTTP+DB E2E, mandatory upgrade, existing backend kernel full chain, public-export/
no-cycle/type checks, decorators/RLS/roles, generators/contracts/parameter gates,
root pnpm check, devai:doctor and proof-chain verification. No optional-DB or
zero-assertion PASS. Record RED separately from final GREEN and inherited TODOs.
Independent review and all required exact-head CI checks precede any separately
authorized merge. Production source qualification remains a separate release gate.

## Stop conditions, exclusions and next approval

Stop for unsourced permission/state/legal constant, changed public API semantics,
missing complete candidate qualification, unowned necessary path, dependency cycle,
changed S1 guarantees, destructive fixture needs, or absent real-DB acceptance.
Operational inventory/dispositions, staff/pool bindings, executable live ladders,
clock/calendar/incident sources and provider/IdP qualification are release inputs,
not fabricated production fixtures. No new domain decision is currently identified.

After S2 integration and its separately authorized audit, prepare exact S3 ownership
for typed clients/facades, pool selection, uncertain-attempt handling, data.id→dossier,
current-risk header, routed/browser proof and truthful preview. A2 batch-position,
deadline/acceptance and pending missing-item restoration remains separately required;
no private-field grant or journey completion follows from either backend transport.
R-0025/JW-01 and all original64-command/approved-addition acceptance remain open.
