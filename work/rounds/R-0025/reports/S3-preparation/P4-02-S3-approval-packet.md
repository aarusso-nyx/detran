# P4-02-S3 — exact analyst claim-to-dossier packet

Architect, Constitution Articles6–10/24. **PROPOSED — RUNTIME NOT AUTHORIZED.**
Owner approved parallel packet preparation on2026-10-23, not S3 implementation.
Main inspection `a97e6def6cc4b80d65c5ab0ee9579241f0b33446`; S2 transport
`cd2b6740d41676d000fd0f30ba6049ff3d8073cc` in unmerged draft PR211.

## Outcome, entry gate and sequencing

Deliver the existing analyst defense queue's authorized pool selection and
claim-next→dossier handoff, with server-owned current-risk presentation. No new
screen, role, permission, state transition, command or data grant. This is a
bounded JW-01 slice; it does not complete JW-01 or R-0025.

Before any runtime dispatch: S2 must integrate with required checks green and
separate merge authorization, its separately authorized scoped audit must finish,
and this packet must be refreshed against those exact merged contracts and
approved explicitly. Contract/permission/error/path changes stop for an amendment;
no provisional implementation against the preserved branch. Architect→Inspector
RED→Engineer→Inspector GREEN and independent review remain mandatory. The S2
proof recovery and CI diagnosis are separate from this packet.

## Source-backed transport and gaps

Use existing generated CASE commands/types; do not regenerate contracts here.
Pinned S2 `packages/api-clients/src/generated/BP-INF-RAIT-CASE-001.commands.ts`
lines2207–2305 define context, queue, risk and claim result schemas; operations
`raitClaimContext`, `raitPoolClaimNext`, `raitCaseRiskSnapshot` begin3023,6595,6780.
The handwritten `docs/framework/contracts/BP-INF-RAIT-CASE-001.commands.openapi.json`
contains their normative paths. D1–D11,
ADR0045–49/0052 and S2 amendments remain binding.

| Operation | Request / response obligation |
| --- | --- |
| `raitClaimContext` | GET `/v1/inf/rait/claim-context`; optional `pool_id`, independent `pool_cursor`/`queue_cursor`, limit1–50. Envelope `{data:{eligiblePoolCount,selection,selectedPoolId,reason,pools:{items,nextCursor},queue:{items,nextCursor}}}`. Selection none/single/choice; nullable selectedPoolId/reason/cursors. Pool items only id/name/instance/unit_id; queue items only id/protocol_number/instance/state/protocolled_at/unit_id. No merits/document preview feed. |
| `raitPoolClaimNext` | POST `/v1/inf/rait/pools/{id}/claim-next`; strict `{}`, required Idempotency-Key, **no If-Match**. HTTP200 `{data,events}` with strong final CASE ETag. Data includes id/state EM_INSTRUCAO/version/instance/assignment_id, not an assignment entity. Scope this UI to the existing defense flow; result enum breadth grants no new journey. |
| `raitCaseRiskSnapshot` | GET `/v1/inf/rait/cases/{id}/risk`; scoped CASE read. `{data:{asOf,today,clocks,worstFlag,sourceVersions}}`; four discriminated A–D clocks, applicability applicable with flag/ceilingOn or not_applicable without them. worstFlag may be null. No client-side threshold/date/order computation or persisted-clock fallback. |

Observed UI gaps: `worklist.client.ts:243` leaves claim unavailable with an
assignment return type; `queue.facade.ts:198` derives a pool ETag; the defense
queue page:191 uses a placeholder pool and routes body.case_id to triage.
`rait-http.ts:67` requires caller-known case identity before POST; S3 must cache
the response ETag under **returned data.id**, never pool ID. `case.facade.ts:176`
and case layout:66 currently feed persisted clocks to the header. Source line
references are the inspected baseline and must be refreshed after integration.

## Behavior and failure semantics

- Use authoritative eligiblePoolCount and selection, never infer complete pool
  count from a page. Zero pools truthfully unavailable; one uses the returned
  selection; multiple requires an explicit authorized selection. Keep independent
  cursors and discard late responses after pool/actor/scope changes. No arbitrary
  case ID, risk-based client sorting or user-picked claim candidate.
- Confirmation creates one fresh claim-only attempt key with platform randomness,
  scoped in memory to authenticated actor and selected pool. Disable duplicate
  clicks. An ambiguous timeout/disconnect retains the same attempt/key and body
  for an explicit same-attempt retry. A new confirmed attempt receives a fresh
  key. Actor/pool changes cannot repurpose an unresolved attempt or silently
  resubmit it. Do not alter deterministic keys used by other commands.
- No new TTL, localStorage/sessionStorage or cross-session recovery mechanism.
  Reload loses in-memory retry capability: never simulate success or automatically
  submit a fresh claim; show truthful uncertainty and require authoritative
  context/WIP reconciliation. If product requires durable retry/recovery, stop for
  an exact persistence/identity amendment before adding it.
- Validate required result identity/state/version and strong CASE ETag before
  treating success as routable. Navigate `data.id` to `/casos/:id/dossie`.
  Missing/malformed success retains the uncertain attempt for same-key retry; it
  cannot fabricate an ID, assignment or ETag. Do not
  derive a case ETag from pool metadata. Existing commands retain their If-Match
  and idempotency behavior; the helper extension is selector-only.
- Consume typed risk only for the active authorized dossier; distinguish
  applicable/not-applicable, null/no applicable flag, loading and source failure.
  Never display SEM_RISCO for absent/failed source. Keep stale data from a prior
  dossier/actor out of the header. Rendering a flag is not recalculating risk.
- Preserve exact server error codes and safe fields through existing error/i18n
  conventions. Context400/401/403/404/409/503; claim additionally422 for member,
  parameter and WIP rejection plus409 queue/replay/active-attempt conditions;
  risk400/401/403/404/503. Exact code literals come from the integrated contract,
  not newly invented client strings. No success-shaped fallback for409/503.
- Preview remains asset-only, fixed fictitious-data banner and explicitly
  unavailable claim command. No `/v1`, network write, simulated success or broad
  fixture disclosure. Source-pending fields stay source-pending.

## Closed ownership inventory

The companion `path-inventory.json` is the closed inventory: **34 paths =28
existing +6 new**, validated for uniqueness/existence. Unowned compatibility paths remain excluded;
if required later, stop for a bounded amendment. This packet creates no files
from that inventory; it names proposed ownership only.

### Engineer —13 existing +2 new

- `apps/rait/web/src/app/data/api/case.client.ts`
- `apps/rait/web/src/app/data/api/worklist.client.ts`
- `apps/rait/web/src/app/data/api/rait-http.ts`
- `apps/rait/web/src/app/data/facades/queue.facade.ts`
- `apps/rait/web/src/app/data/facades/case.facade.ts`
- `apps/rait/web/src/app/features/fila/pages/defense-pool-queue.page.ts`
- `apps/rait/web/src/app/features/caso/pages/case-layout.page.ts`
- `apps/rait/web/src/app/shared/case-header.component.ts`
- `apps/rait/web/src/app/preview/adapters/preview-case.client.ts`
- `apps/rait/web/src/app/preview/adapters/preview-worklist.client.ts`
- `apps/rait/web/src/app/i18n/rait.pt-BR.json`
- `apps/rait/web/src/app/data/models/index.ts`
- `apps/rait/web/src/app/core/error-codes.ts`
- **New:** `apps/rait/web/src/app/data/models/claim.models.ts`
- **New:** `apps/rait/web/src/app/data/facades/claim-attempt.ts`

The claim models are aliases/projections of existing generated CASE types only.
The claim-attempt helper owns only actor/pool/key/uncertainty state. The HTTP helper
extension must preserve all existing callers; no generic request-SDK rewrite.

### Inspector —12 existing +4 new

- `apps/rait/web/src/app/data/api/case.client.spec.ts`
- `apps/rait/web/src/app/data/api/worklist.client.spec.ts`
- `apps/rait/web/src/app/data/api/rait-http.spec.ts`
- `apps/rait/web/src/app/data/facades/queue.facade.spec.ts`
- `apps/rait/web/src/app/data/facades/case.facade.spec.ts`
- `apps/rait/web/src/app/features/fila/pages/defense-pool-queue.page.spec.ts`
- `apps/rait/web/src/app/features/caso/pages/case-layout.page.spec.ts`
- `apps/rait/web/src/app/shared/case-header.component.spec.ts`
- `apps/rait/web/src/app/preview/adapters/preview-case.client.spec.ts`
- `apps/rait/web/src/app/preview/adapters/preview-worklist.client.spec.ts`
- `apps/rait/web/src/app/i18n/i18n.spec.ts`
- `apps/rait/web/src/app/core/error-boundary.spec.ts`
- **New:** `apps/rait/web/src/app/data/facades/claim-attempt.spec.ts`
- **New:** `apps/rait/web/src/app/data/api/case-claim.wiring.spec.ts`
- **New:** `apps/rait/web/src/app/features/fila/pages/defense-pool-queue.wiring.spec.ts`
- **New:** `work/rounds/R-0025/checks/p4-02-s3-browser.mjs`

The new browser harness uses the app's already pinned playwright-core1.63.0 and
an explicitly supplied controlled browser/backend/DB environment. No dependency
or package-script change, fixed developer-machine browser path or committed
credential. Absent browser/DB/auth resources mean pending validation, not PASS.

### Architect —3 existing reference paths

- `docs/framework/arch/i18n/rait.pt-BR.json`
- `docs/framework/arch/rait-i18n-glossary.md`
- `docs/framework/arch/rait-error-catalog.md`

Transcribe the already accepted S2 codes into parsed §3 of the canonical error
catalogue; retain its dated supplements and all existing semantics. The fixture
reader `src/testing/kb.ts:224–231` extracts only “3. Códigos”; extending only the
appendix would leave the exact catalogue/order assertion unsatisfied. Add
RAIT.CLAIM_LEGACY_UNVERIFIED and RAIT.CASE_POOL_UNRESOLVED under §3.4 after
ASSIGNMENT_ALREADY_ACTIVE, in that order; add RAIT.RISK_SOURCE_UNAVAILABLE under
§3.9 after PARAMETER_SOURCE_PENDING. Engineer mirrors that exact canonical order
in core/error-codes.ts and adds no other code. Status409/409/503, safe disclosure
and source semantics remain those already accepted in ADR0047/48/49.

Only source-backed presentation keys/explanations may be added under Architect
ownership before runtime implementation. No new behavioral error or rule. This is reference synchronization for accepted
codes, not a new backend/public contract. Record
approved exact strings before Inspector writes against them; maintain app/canonical
i18n synchronization through their separate roles.

## Exact error-catalogue compatibility

Only the three operation codes absent from the existing runtime catalogue need
registration: RAIT.CLAIM_LEGACY_UNVERIFIED, RAIT.CASE_POOL_UNRESOLVED and
RAIT.RISK_SOURCE_UNAVAILABLE. Existing `messageKeyOf`/`classifyError` behavior
already maps registered409/503 codes to their code-specific i18n keys; keep that
runtime unchanged. Inspector owns only the added boundary spec for direct HTTP
and SDK classifications, catalogue membership/order, localized-key presence and
retained unknown-code/403/status-kind/Retry-After behavior. Existing i18n coverage
is already owned: update any exact seed-key census only to the count of the
source-backed canonical additions, preserving all old values and subset/order
assertions. Do not add a generic-prefix allowance or weaken unknown fallback.
The canonical §3 edit, runtime registration and localized strings occur only in
the future role sequence after S3 runtime entry/approval gates are satisfied.

## Inspector RED and decisive acceptance

Preserve unchanged tests; demonstrate baseline failures attributable to each new
behavior before Engineer implementation, not missing infrastructure.

1. Zero/single/multiple pools, complete eligible count beyond a page, explicit
   authorized pool, independent cursors, revoked scope, late-response isolation.
2. Strict empty POST, no pool If-Match; uncertain response→same key retry; new
   confirmation→new key; duplicate-click suppression; actor/pool-change isolation.
3. Result data.id→dossier; strong response ETag stored under case only. Missing or
   malformed identity/ETag does not navigate or fabricate success. Other command
   If-Match/replay semantics stay unchanged.
4. Applicable/not-applicable/null flag/current risk source failure. Persisted clocks
   cannot substitute for the current snapshot; stale case responses cannot leak.
5. Real routed guards/interceptors/HTTP tests, then actual browser→backend→DB proof:
   authorized selection, atomic claim, final state/assignment/version/audit/outbox
   and dossier/header; inject lost response and prove same-attempt retry creates
   no extra assignment or business effects. Use real disposable role-scoped DB,
   not a browser transport mock as sole acceptance. Respect S2 source prerequisites.
6. Preview banner, asset-only/no-v1 interception and explicitly unavailable claim;
   unchanged admissibility/triage/archive and scoped-read positive/negative paths.
7. The three accepted codes classify as conflict409/conflict409/unavailable503
   with their exact message keys for HTTP and SDK errors. Existing catalogue/order,
   unknown fallback, forbidden403 and retry metadata assertions remain intact.
8. Keyboard-accessible selector/confirmation, loading/error/empty/uncertain states,
   Portuguese source-backed labels and disabled action explanation.

Run generated-client sync checks without regeneration, affected unit/routed tests,
RAIT typecheck/lint/tests/production build, preview build + bundle separation,
actual browser proof and affected contracts/security gates; full root pnpm check,
devai:doctor, chain verification, independent review and required exact-head CI
before any separately authorized implementation merge. Existing backend kernel
requirements remain; this UI packet changes no population, timeout or30s reference.
No skipped assertions, optional-DB or fabricated preview success count as GREEN.

## No-touch and stop conditions

No backend/database/policy/role/pool/permission changes, new endpoint, generated
client or generator edit, STYNX/shared UI/pin/lockfile/workflow edit, alternate claim
runtime, private-field grant, signing/inquiry/draft activation, sibling write,
scorecard input/output or proof-chain hand edit. Existing RLS and parent/replay
boundaries remain. Preserve generic idempotency-key.ts, etag-store.ts,
commands.ts, error-boundary runtime, error-boundary-interceptors.spec.ts and
risk-flag runtime/tests byte-identically. Only error-boundary.spec.ts is added
for the bounded three-code coverage above.
Any need to edit them requires an exact amendment; regressions still run.

A2 batch position/deadline/acceptance and pending missing-item restoration is
separately required before its owning journeys complete; do not obtain these
fields from excluded CRUD, command responses or fixtures. R-0025's original
64 commands and approved additions, other JW journeys, provider qualification
and whole-round closure remain outside this bounded acceptance claim.

Stop for contract drift, unsourced permission/constant, an unowned required path,
missing strong result ETag, unavailable real-DB/browser proof, changed S1/S2
semantics or a persistence/recovery requirement beyond in-memory attempt handling.
Report exact missing authority rather than expand this inventory implicitly.

Requested later approval: **P4-02-S3 as written, after S2 integration/audit and
contract/path refresh.** Current Owner approval covers packet preparation only.
