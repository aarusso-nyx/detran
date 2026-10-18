# JW-01 distribution and claim — reconciled contract baseline

Architect, Constitution Article 7, 2026-10-18. **Contract-only P4-01 execution;
runtime implementation remains paused.** Owner approval and exact source anchors
are in the [source/decision matrix](../reports/JW01-distribution-claim-sources.md).
This document records supported obligations, observed implementation and proposed
reconciliation separately. It is not an executable API amendment or a new grant.
R-0025 and full JW-01 remain open. No state, proof, task or authorization is edited.

## 1. Source hierarchy and status

Constitution, accepted Owner decisions and ADRs take precedence. Preserve
UC-RAIT-002 and the explicitly approved admissibility-first slice (#193/#194).
WF-RAIT-001 supplies the approved lifecycle vocabulary; UC-RAIT-003 describes
assuming a DISTRIBUIDO case to enter instruction. WF-RAIT-004, IU-RAIT-004 and JW-01
also describe claim from an ADMITIDO collective queue and a subsequent triage page.
The latter journey ordering is incompatible with the approved admissibility-first
slice. Neither current code nor P4-01 approval resolves OD-R25-016 by itself.
Draft RN/UC status remains draft even when a later Owner decision supplies a
binding specific policy (for example ADR-0037 priority and H.54 WIP calibration).

Notation: **S** source-backed retained obligation; **O** static observation at the
execution baseline, not a test result; **P** recommendation requiring stated
approval/amendment; **B** unresolved blocker. Source IDs S01–S20 are in the matrix.

## 2. Producer → consumer, actor and state

| Handoff                    | Producer/actor → consumer                                   | Source-backed obligation                                                                                                           | Observed implementation / disposition                                                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intake → admissibility     | Secretary/protocol → analyst or authorized secretary triage | PROTOCOLADO → TRIAGEM_ADMISSIBILIDADE; all four criteria, server timeliness; admit/reject before merits (S01/S03/S15)              | O: #193/#194 slice retained. Not repeated or replaced here                                                                                                                                                 |
| Admission → distribution   | Admissibility outcome → defense pull pool                   | S: ADMITIDO → DISTRIBUIDO for defesa_previa in WF-RAIT-001; WF-RAIT-004 F-DP-2 calls claim-next the consuming action (S02/S04)     | O: admit ends ADMITIDO; claim requires DISTRIBUIDO. B: who owns this existing transition in the command contract? Do not invent a separate distribution command                                            |
| Distribution → instruction | Eligible active analyst → assigned case                     | S: UC-RAIT-003 AC1 assumes DISTRIBUIDO and enters EM_INSTRUCAO; impersonal selection, WIP and impediment constraints (S05/S08/S09) | O: claim chooses/locks a case, inserts assignment, updates case and emits events. B: ADMITIDO queue cannot be represented as working merely by pre-seeding DISTRIBUIDO                                     |
| Claim → UI read            | Claim response → routed case consumer                       | S: IU-RAIT-004/JW-01 specify triage destination; existing manifest also provides dossier (S06/S07/S17)                             | O: current page expects assignment.case_id and redirects to triage. P: after admissibility-first claim, route to dossier; Owner/source custodian must ratify the affected screen/journey amendment (OD016) |
| Instruction → signing      | Analyst draft/ready → scheduled signing authority           | S: UC-RAIT-003/016 and RN143 separate drafting from signature; PRONTO_P_DECISAO before authority decision (S05/S10)                | Later dependency only. No ready/sign/return wiring or provider activation in this packet                                                                                                                   |
| Authority return → analyst | Authority guidance → draft/history/panel read               | S: draft return stays PRONTO_P_DECISAO, traced and limited under UC016/JW01                                                        | Later dependency. No implicit return to triage or new state introduced                                                                                                                                     |

`receive` is not a defense workaround: payload validation accepts jari/cetran,
its domain guard requires payload.body === current.instance, and the recorded
command actor is secretary. It cannot admit a defesa_previa body under the
inspected code (S12). Do not expose it to the analyst or impersonate a secretary.

## 3. Claim command: observed wire baseline versus reconciliation

| Field               | S / O at baseline                                                                                                                                                  | Contract disposition                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner and route     | S: CASE commands operation raitPoolClaimNext, POST /v1/inf/rait/pools/{id}/claim-next (S11); O: mounted CASE handwritten controller (S12)                          | Retain CASE ownership; WorklistClient's old WORKLIST TODO is stale. No new endpoint is proposed                                                                                                                   |
| Actor/authority     | S/O: inf:rait-case:claim-next granted to rait-analyst in policy; service context supplies tenant/actor; pool membership checks person_id against actorId (S12/S13) | Browser supplies no tenantId/actorId/roles/policy or selected case. This does not settle individual case-read scope                                                                                               |
| Target              | Pool ID in path; server selects case                                                                                                                               | B: canonical eligible-pool discovery and actor/person mapping not exposed by current RaitSessionFacade; no empty UUID, first record or name-based selection                                                       |
| Body                | O: service accepts an object with zero allowed command fields; caseId is explicitly forbidden                                                                      | P: versioned contract should type an empty command body, not generic CommandBody or a generated CRUD DTO. No schema/client generation here                                                                        |
| Idempotency-Key     | O: required, tenant+key transaction lock and replay lookup; fingerprint command + targetId + canonical payload                                                     | B/security: claim fingerprint omits actor and If-Match; unlike ADR0041's four admissibility commands, cross-actor reuse is not rejected by fingerprint. Do not adopt this visibility behavior as policy           |
| If-Match            | S: IU004 §6/general web §7 require it; O: client comment says optional pool-target, server skips both presence/version check for claim                             | B/Architect: choose and document the resource/version/absence policy before wiring. A case ETag cannot be copied as a pool ETag. Pool entity has no version field; no usable pool validator has been demonstrated |
| HTTP result         | S: published command OpenAPI declares 200; O: controller @HttpCode(200), `{data,events}` and ETag                                                                  | Retain 200 as the published/observed transport baseline. JW01's illustrative 201 `{caseId,assignment}` sequence is a conflicting projection to reconcile, not the currently mounted result                        |
| Response data       | O: updated case row, with assignment_id appended when available; ETag is updated case.version                                                                      | P: eventual typed CASE result must identify the case via data.id and assignment identity explicitly. It is not RaitAssignment. Do not cast the current generic result to enable navigation                        |
| Events/read refresh | O: rait.assignment.changed and rait.case.changed plus transactional audit/outbox (S12)                                                                             | Verify persisted effects and refresh through actual reads in a later packet. Existing SSE semantics stay; no new SSE/platform work or simulated write success                                                     |
| Retry identity      | O: same key+same fingerprint replays stored result; changed target/body conflicts                                                                                  | Later acceptance must cover same actor, changed request, different actor and stale replay routing. A replay is not proof that the actor can read the returned case now                                            |

Observed response shape, for explanation only (not a generated schema):

```text
HTTP 200
ETag: "<updated-case-version>"
{ data: { id: <case-id>, state: "EM_INSTRUCAO", version: <version>,
          ...case fields, assignment_id?: <assignment-id> },
  events: [ ...domain events ] }
```

The public command OpenAPI has an operationId and 200 description but no typed
claim path/header/body/response schemas. Completing that versioned contract and
regenerating its consumers belongs to a separately approved implementation packet.

## 4. Eligibility, scope and priority

S: defense pool strategy is pull; active analyst membership, published schedule,
daily DISPONIVEL/EM_PLANTAO availability, WIP and absence/impediment rules apply.
H.54 already approves WIP45 and coordinator alert60 as versioned calibration;
this packet does not reopen those values or substitute literals for schedule data.

O: claim locks the requested active pull pool; finds actor membership; checks
active member, published weekly schedule, today's slot and non-null WIP; chooses
a DISTRIBUIDO case matching pool.instance/unit, without active assignment or a
recorded impediment for the member; uses FOR UPDATE SKIP LOCKED; locks/counts work
and inserts an assignment before updating case/events in one transaction.
Static inspection is not a concurrency, authorization or ordering proof.

S: ADR0037/RN141 require prescription risk first, then PCD=80+, then60+, then
confirmed none; protocolled_at and id break ties. NULL is unassessed, not none,
and is excluded from automatic claim. These decisions are already settled.
O: inspected claim SQL orders legal_priority then protocolled_at/id, with ELSE0,
and contains no explicit risk ordering or legal_priority IS NOT NULL predicate.
Record this as a source/runtime nonconformance to prove and correct in a later
packet, not a request to relax ADR0037 or approve a new ranking.

S/O: route grants and tenant RLS exist. They do not define which _other_ case in
the same tenant an analyst may read. RN143 is territorial signing authority,
not an analyst read predicate. OD-R25-017 remains unresolved. No client filtering,
fixture or pool-membership check on claim substitutes for server case-read scope.

O: list pools and pool-members are existing tenant-scoped read surfaces and
policy includes analyst read. Generated list controllers expose plain bounded
lists, not a server-side eligible-pools/me query. Frontend filtering is local;
RaitSessionFacade exposes roles/permissions, not a sourced person ID or pool ID.
A bounded list can also be incomplete. No/multiple candidates, actor mapping and
complete selection must be resolved before a chosen ID can be called canonical.

## 5. Error reconciliation

All rows describe sources or inspected code, not tests run by this packet.
“Both” means code/catalog overlap; it does not certify the full condition/context.

| Code / status                                           | Classification                                          | Observation and required disposition                                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RAIT.QUEUE_EMPTY /409                                   | Both                                                    | No eligible candidate; runtime can also reach it after skipping impeded cases. Do not equate it with a proven globally empty queue                         |
| RAIT.ASSIGNMENT_WIP_LIMIT /422                          | Both                                                    | Current active work count >= schedule limit; retain source-backed parameter behavior                                                                       |
| RAIT.MEMBER_NOT_AVAILABLE /422                          | Both                                                    | Inactive member, absent published schedule or unavailable/missing day slot; catalog contexts differ by cause                                               |
| RAIT.ASSIGNMENT_ALREADY_ACTIVE /409                     | Both                                                    | Duplicate active assignment guard; still requires real concurrent-claim proof                                                                              |
| RAIT.ORDER_OVERRIDE_FORBIDDEN /403                      | Both                                                    | Request includes caseId; source forbids choosing case outside impersonal order                                                                             |
| RAIT.MEMBER_IMPEDED /422                                | Source; behavior unresolved                             | IU004/catalog expect this; runtime filters impeded candidates and may choose next or report QUEUE_EMPTY. No advance choice of UX/error or merit disclosure |
| RAIT.FORBIDDEN_CASE_SCOPE /403                          | Runtime use                                             | Missing/inactive/non-pull pool or missing analyst membership. Public mapping/context and disclosure must be reconciled                                     |
| RAIT.PARAMETER_SOURCE_PENDING /422                      | Runtime use outside catalog's stated jeton example      | Null/undefined WIP. Already approved values do not justify silently filling an absent schedule                                                             |
| RAIT.IDEMPOTENCY_REPLAY /409                            | Runtime plus ADR0041 precedent scoped to other commands | Different fingerprint under reused tenant key; claim cross-actor same-fingerprint behavior remains a security blocker                                      |
| RAIT.VALIDATION_FAILED /400                             | Runtime generic validation                              | Missing key, non-object body or forbidden extra fields; not a license to accept server-owned fields                                                        |
| RAIT.IF_MATCH_REQUIRED /428; RAIT.VERSION_CONFLICT /412 | Source generic; not claim precondition behavior         | Server explicitly exempts claim. Specify the chosen resource/version contract before expecting these claim outcomes                                        |
| RAIT.FORBIDDEN_ACTION /403; role denial                 | Existing authority boundary                             | Context and route policy must be real; no widened grant to make a test pass                                                                                |

## 6. Signing dependency and implementation hold

Ready requires the appropriate instruction/draft prerequisites; authority decides
and may return a draft with guidance under the existing source constraints. The
analyst never signs. Actual signing/trust/provider/territorial proof is outside
P4-01. No calendar, authority, normative value or production trust is fabricated.

This baseline does not make the full journey executable. See the source matrix's
precise decisions and recommendations. It deliberately returns those questions
instead of a falsely ready wiring packet. No runtime, tests, DDL, grants, generated
contracts/clients, provider integrations or scorecard work is changed. The next
implementation packet requires explicit approval after its blockers are resolved.
