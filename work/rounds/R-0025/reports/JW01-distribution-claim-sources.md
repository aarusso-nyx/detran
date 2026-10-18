# P4-01 source/decision matrix and execution receipt

Architect, Constitution Article 7, 2026-10-18. Contract-only reconciliation;
runtime implementation remains paused. PR #196 approval and merge evidence are
recorded below. This report does not promote readiness, scorecard readings or
historical task statuses, and does not close/seal R-0025 or full JW-01.

## 1. Exact authority and baseline

Direct Owner instruction on 2026-10-18:

> I approve P4-01 as proposed. Check CI on PR #196, fix any failures, and merge once required checks are green. Then execute the contract-only reconciliation, keeping runtime implementation paused and preserving local and scorecard work.

P4-01 authorizes the two named contract/source outputs, additive unresolved domain
questions, and a next packet draft only when sources support it. Existing accepted
sources are read-only. No runtime, tests, DDL, generated schemas/clients, grants,
provider activation, proof/state/task/authorization or scorecard changes are made.

PR #196 head: `23a34cb4aecb572e4425af99cf4e13f4cebd6854`.
Merge/base revision: `1c25041ee222ba6bccf74493fd10d75c5d8ebe0e`. Contract sources were inspected as
committed content at that baseline. Primary scorecard content was not inspected.
The companion [contract baseline](../contracts/JW01-distribution-claim.md) uses
S/O/P/B to separate source, observation, proposal and unresolved blocker.

## 2. Source register

Paths are relative to repository root; source references are immutable at the
baseline above. Draft source status is preserved, not upgraded by transcription.

| ID  | Source path / precise section                                                                                                                                               | Authority or evidence used                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 | docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-002.md, prerequisites/flow/AC                                                                                     | Approved: protocolled case, admissibility before merits                                                                                                   |
| S02 | docs/framework/product/domains/inf/rait/workflows/WF-RAIT-001.md, transitions                                                                                               | Approved lifecycle; ADMITIDO→DISTRIBUIDO for defense/cetran; DISTRIBUIDO→EM_INSTRUCAO on assumption                                                       |
| S03 | docs/meta/adr/ADR-0041-rait-admissibility-context-write-boundary.md and work/rounds/R-0025/contracts/JW01-admissibility.md                                                  | Accepted scoped admissibility command/actor/version boundary; individual case scope explicitly unresolved                                                 |
| S04 | docs/framework/product/domains/inf/rait/workflows/WF-RAIT-004.md, F-DP-2, §§2–4 and signature F-DP-5                                                                        | Pull pool and collective queue, membership/availability, WIP and downstream signing; later steering prevails over historical proposal wording             |
| S05 | docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-003.md, prerequisites/AC1                                                                                         | Approved: DISTRIBUIDO assumption starts instruction; dossier and later ready/inquiry flow                                                                 |
| S06 | docs/framework/product/domains/inf/rait/screens/IU-RAIT-004.md, §§6/7/10                                                                                                    | Claim ADMITIDO→DISTRIBUIDO→EM_INSTRUCAO; If-Match required, triage destination and MEMBER_IMPEDED                                                         |
| S07 | docs/framework/arch/rait-web-journeys/JW-01-analista.md, steps2–5 and sequence; docs/framework/arch/rait-web-frontend.md §§6.1/6.6/7                                        | Conflicting triage ordering, illustrative201/assignment result and generic version requirement; source projection, not a runtime override                 |
| S08 | docs/framework/product/domains/inf/rait/rules/RN-RAIT-141.md and docs/meta/adr/ADR-0037-rait-legal-priority-owner-policy.md                                                 | Binding Owner priority policy: risk first, PCD=80+,60+,none; NULL excluded; final protocol qualification. ADR0024 old priority reference redirects to0037 |
| S09 | docs/framework/product/domains/inf/rait/rules/RN-RAIT-140.md                                                                                                                | Impediment before merits; source rule remains draft with its recorded legal-source limits                                                                 |
| S10 | docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-016.md and rules/RN-RAIT-143.md; WF004 signature lane                                                             | Draft source for authority/signature territorial boundary, not analyst scope; official qualification limits retained                                      |
| S11 | docs/framework/contracts/BP-INF-RAIT-CASE-001.commands.openapi.json, /v1/inf/rait/pools/{id}/claim-next                                                                     | Published operationId raitPoolClaimNext,200 response description; claim schemas/parameters absent                                                         |
| S12 | backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts, claimNext/run; rait-case-command.service.ts, RULES/execute/fingerprint/claim/receive/events | Static runtime evidence; not a test run or legal/business authority                                                                                       |
| S13 | backend/domains/shared/src/policy.ts, RAIT_READ_ROLES/RAIT_SURFACE_RULES/RAIT_COMMAND_RULES                                                                                 | Existing analyst read and claim route grant; not individual row entitlement                                                                               |
| S14 | backend/domains/inf/rait-worklist/src/{controllers,repositories,entities}/rait-pool* and rait-pool-member*                                                                  | Tenant-scoped bounded plain reads; pool unit/instance/strategy and member person_id, no eligible-pools/me contract                                        |
| S15 | work/rounds/R-0025/AUTHORIZATION.md A-C3-01; docs/meta/knowledge-base/open-decisions-rait.md OD016/017 and OD-R12-054                                                       | Existing Owner admissibility-first choice, unresolved whole sequence, pool identity and same-tenant case access                                           |
| S16 | apps/rait/web/src/app/core/session.facade.ts                                                                                                                                | Roles/permissions and active session; no sourced person/pool ID exposed by this facade                                                                    |
| S17 | apps/rait/web/src/app/app.route-manifest.ts, casos/:id/dossie; features/fila/pages/defense-pool-queue.page.ts                                                               | Route exists; empty pool and triage navigation via assignment.case_id remain current frontend observations                                                |
| S18 | apps/rait/web/src/app/data/{api/worklist.client.ts,api/rait-http.ts,facades/queue.facade.ts,models/commands.ts}                                                             | Unavailable claim, wrong WORKLIST TODO/assignment type; local filtered bounded reads, ADMITIDO defense list, optional pool If-Match comment               |
| S19 | docs/framework/arch/rait-error-catalog.md §§3.1/3.4/3.9                                                                                                                     | Error sources and context; generic version rules conflict with current claim exemption                                                                    |
| S20 | COMPLETION-PLAN.md §8; P4-01-packet-review.md; docs/meta/knowledge-base/steering.md H.54/H.57; open-decisions-rait.md OD004                                                 | P1–P3 scope unchanged; this approved packet only; WIP45/alert60 already vigente, no reopening                                                             |

Existing unit test source `rait-case-behavioral-matrix.spec.ts` contains claim
cases, including no If-Match. Inspection of its test text is historical coverage
context, not execution or proof of HTTP/DB concurrency, actor isolation or full JW01.

## 3. Reconciliation results

| Topic                  | Result                                                                               | Disposition                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admissibility first    | Source-backed and specifically Owner-authorized                                      | Preserve #193/#194; do not rerun triage merely to make old screen sequence fit                                                                                 |
| State vocabulary       | Already permits both defense distribution and assumption                             | No new state needed. Command ownership/atomic composition is unresolved; receive cannot be repurposed for defense                                              |
| Claim route/owner      | CASE path and operation already exist                                                | WORKLIST TODO stale; correct only in separately approved wiring/contract generation scope                                                                      |
| HTTP200 envelope       | Published OpenAPI and mounted controller agree                                       | Record200 `{data,events}` + case ETag; old JW201 `{caseId,assignment}` is not current transport. Typed schema completion still pending                         |
| Pool/member data       | Existing pool and person membership records                                          | They do not provide a complete current-user eligible-pool discovery contract; no first-pool/UUID fallback                                                      |
| Individual read scope  | Tenant RLS and route role established                                                | OD017 unresolved; distinguish collective metadata, pre-admission triage and assigned merits before choosing a predicate                                        |
| WIP/calibration        | H54/OD004 already decided45/60                                                       | Keep parameterized schedule behavior; no numerical Owner question reopened                                                                                     |
| Ordering/null priority | ADR0037 already decided                                                              | Inspected claim query lacks explicit risk/NULL exclusion. Treat as implementation nonconformance requiring later real proofs, not an unresolved product policy |
| Payload/result types   | Service empty body and case result versus generic frontend body/assignment           | Contract/client completion required; no cast or manual generated-file fix                                                                                      |
| If-Match/ETag          | Generic source, optional client and exempt runtime disagree                          | Technical contract choice/amendment required; do not send case ETag as pool ETag                                                                               |
| Idempotency            | Tenant+key replay precedes claim guards; claim fingerprint omits actor               | Static cross-actor response-reuse risk. No exploit/test claim; Architect security decision and proof required before new wiring                                |
| Impediment             | Prohibition before merits is retained                                                | Source MEMBER_IMPEDED versus runtime skip/next/QUEUE_EMPTY UX remains unresolved; no analyst impediment route added (OD-C3-007)                                |
| Signing                | Draft/ready, authority signature and return are separate downstream responsibilities | Dependency documented only; full analyst journey and productive trust proof remain open                                                                        |

## 4. Precise decisions returned instead of a falsely executable wiring packet

P4-01 approval did not settle any of these. Recommendations below are proposals,
not grants, transitions, accepted ADRs or instructions to write runtime code.

| ID / authority                                          | Exact question and choices                                                                                                                                                                                           | Recommendation and required next record                                                                                                                                                                                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 / Owner + Architect, OD-R25-016                      | For defense after admissibility, does claim atomically consume ADMITIDO through the existing DISTRIBUIDO stage into EM_INSTRUCAO, or must a separately sourced producer enter DISTRIBUIDO before the existing claim? | Prefer composing the documented defense stages in claim, with an explicit accepted contract/state-event amendment and proofs; no invented separate command. Alternatively identify the actual producer/actor before retaining current eligibility. Keep admissibility first either way |
| D2 / Owner/source custodian, OD016                      | After that claim, should the destination become dossier/instruction, or should a documented non-mutating triage view remain? IU004/JW01 currently require triage                                                     | Prefer dossier/instruction after completed admissibility, with explicit IU/JW amendment. No automatic routing change or second admit/triage transition                                                                                                                                 |
| D3 / Owner/source custodian, OD-R25-017                 | Which collective metadata, pre-admission triage and assigned merits may an analyst read in the same tenant; what unit/pool/assignment/impediment rules and overrides apply?                                          | Obtain an explicit scoped source. An assigned-only blanket GET predicate could break authorized pre-admission triage; tenant RLS alone is not enough. No fabricated predicate                                                                                                          |
| D4 / Owner scope + Architect contract, OD-R25-018       | How is actor→person→eligible pool resolved, and what happens with zero/multiple eligible pools and bounded/incomplete lists?                                                                                         | Prefer server-context eligible-pool discovery with explicit selection where needed, after approving its contract/security boundary. Reuse existing identity substrate; no new endpoint or claim exposure authorized here                                                               |
| D5 / Architect, future contract/ADR where consequential | Is claim a versioned pool mutation or a selector protected by transaction/idempotency; which If-Match/ETag belongs to it?                                                                                            | Reconcile an explicit selector exception or a real pool validator. Never copy the case validator. Publish typed200 CASE envelope/empty body and regenerate only in an approved later packet                                                                                            |
| D6 / Owner/source custodian, OD-R25-019                 | For impeded cases, skip silently to the next eligible case, emit MEMBER_IMPEDED, or expose a separate safe diagnostic? What may be disclosed before merits access?                                                   | Retain absolute no-merits prohibition and automated exclusion; source the user-visible error/disclosure rule. No new analyst route and no grant inferred from the error catalog                                                                                                        |
| D7 / Architect/security, OD-R25-020 visibility question | May actor B obtain actor A's claimed-case replay response by reusing the same tenant key/pool/body, and how must current read scope be enforced on retry?                                                            | Recommend actor-bound attempt identity, reject cross-actor key reuse and reconcile replay/read authorization. Existing ADR0041 precedent covers only four other operations; write the properly scoped security ADR before extending behavior. No security implementation in P4-01      |

D1/D2 are separate from the already approved admissibility-first choice; that
choice is not reopened. D3/D4 define access and selection, not a new broad analyst
grant. D5 is an engineering contract decision, not a request for the Owner to pick
an HTTP library. D7's unsafe observed behavior is not proposed as an acceptable
default. Ordering/null and WIP are already decided, so they are not decision rows.

## 5. Future wiring acceptance and stop conditions

Once the decisions are recorded and an exact implementation packet is approved,
its scope should name CASE handwritten contract/service/controller where required,
canonical blueprint inputs and generated outputs via the generator, the existing
shared policy boundary only if expressly authorized, frontend worklist/queue and
routed destination consumers, and associated Inspector tests. Do not activate a
frontend-only claim on an isolated DISTRIBUIDO fixture as complete JW01.

The eventual RED matrix must cover:

- admission-first handoff, first claim and repeated claim; no fabricated state or
  secretary receive shortcut; exact documented transition/event ownership;
- eligible-pool identity, zero/multiple/unauthorized/incomplete candidates,
  same-tenant other-user selection and cross-tenant denial;
- active/absent/unavailable member, published schedule/day slot, null WIP source
  versus reached WIP limit, impediment outcome as explicitly sourced;
- prescription risk, PCD=80+,60+,none, NULL exclusion and protocol/id ties;
- case selection forbidden in body, wrong extra/server fields, exact error context,
  If-Match missing/stale/valid according to the newly approved contract;
- same-actor exact retry, changed request and cross-actor key reuse; no stale or
  unauthorized case response/redirect; two real concurrent claims with one
  assignment per case and preserved WIP constraints;
- actual HTTP200 CASE body/ETag/events versus generated type, routed success/error,
  current reads/queue refresh and dossier destination as approved;
- collective metadata versus triage/assigned merits access; omitted-role negatives,
  tenant negatives and the actual same-tenant predicate once sourced;
- truthful preview command unavailability/no writes, production build exclusion,
  browser fixture and real HTTP+DB evidence, plus full applicable P1 gates/review.

These are test specifications, not tests run here. Exact transport and routed UI
proofs must precede runtime acceptance. Real IdP/provider/device qualification is
separate. D1–D7 and the existing nonconformances prevent issuing an executable
wiring packet today. Returning these concrete questions fulfills the packet's
explicit fallback; implementation remains paused.

## 6. Validation, review and preservation

PR #196 merged on 2026-10-18 as `1c25041ee222ba6bccf74493fd10d75c5d8ebe0e`
only after required evidence-gate, foundation, senatran-mock,
senatran-mock-tests and verified-local-rc checks passed. Backend-kernel and
boat-documents-real also passed; stack-smoke was skipped by existing policy.
No CI fix was needed. Contract execution uses an isolated branch from that merge.

Affected local checks passed: docs:kb:check, docs:kb:publish-check,
verify:state-index, verify:rounds-index, devai:doctor, docs:check
(sync/typecheck/build/link validation), targeted formatting and git diff --check.
The first docs build warned that new untracked files lacked update dates; its
build/link result passed. Files are committed before submission.
Full runtime/root/backend/app tests were not rerun for this documentation-only
change; PR196 CI is evidence of its own exact candidate, not of later wiring.
No sensor or gate was changed, and no evidence/state verb or chain write ran.

Read-only preservation checks passed: primary machine-config hashes match the
starting snapshot; all pre-existing local ref names remain present; the decision
register's complete previous bytes remain an unchanged prefix. The primary
scorecard checkout continues its separate authorized local work; only branch/HEAD/
status metadata was observed, not its content. It was not checked out, stashed,
reset, cleaned or edited. No recovery patch, receipt or worktree was removed.

The diff is limited to the named contract/source outputs, additive domain questions
and required independent-review captures. Runtime, tests, generated contracts,
policy/grants, product JSON, law/, .devai/ and record/ are unchanged. Independent
cross-family review is captured separately under reviews/P4-01-execution; its
verdict must be checked before submission, not inferred from these local gates.
