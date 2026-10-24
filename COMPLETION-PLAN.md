# DETRAN completion plan — approved consolidated roadmap, 2026-10-23

> **Current authority — 2026-10-23:** The Owner approved the consolidated eight-milestone
> roadmap and directed its recording in a PR, followed by beginning milestone 1.
> [Section 11](#11-approved-consolidated-roadmap--2026-10-23) is the current remaining-work
> schedule. Sections 1–10 retain the original scope, acceptance, decisions and dated
> planning provenance; older scheduling/session-owner statements yield only to §11.
> PR #211 remains unmerged; C6 remains blocked. Recording this approval does not
> approve any later exact packet, new authority exception, upstream write or release.
> [ADR-0060](docs/meta/adr/ADR-0060-consolidated-completion-roadmap.md) records this cutover.

## Historical completion baseline — 2026-10-18 and subsequent amendments

**Authority:** Architect, Constitution Articles 6–10. **Status: P1–P3 integrated by #195; P4 contract packets and S1 integrated through #203; S2 approved in #205 and implemented in unmerged draft #211; parallel S3 packet preparation approved and scheduling integrated #217.**
This is the single completion baseline approved under P1–P3, not a new governance framework or an
implementation authorization. Planning labels CP-00…CP-11 are document references,
not reserved DEVAI rounds, task IDs, queues or new lifecycle states.

Owner instruction:

> Proceed with the replanning exercise. Reconcile current main, specs and preserved branches into one completion plan. Preserve decisions and local work, keep scorecard work separate, and open a PR for review before resuming implementation.

No implementation resumes from this PR. No round is closed, sealed, cancelled or
renumbered. No branch, recovery patch, receipt, test or acceptance criterion is
removed. No scorecard configuration, reading, policy or result is changed here.

Current execution schedule: [RAIT progress plan, 2026-10-23](docs/meta/knowledge-base/rait-progress-plan-2026-10-23.md). It separates S2 integration blockers from Owner-approved parallel S3 packet preparation; it authorizes no runtime or merge.

## 1. Baseline and how this plan becomes authoritative

The original inspected integration baseline was main
`e536e545091d9828aef2f3c5ec0c2be6f5afb56e`, including PRs #189–#194. DEVAI2.2.0,
Constitution1.0.2, STYNX1.5.3, Angular22, Node24 and pnpm9 are the installed/pinned
baseline at that inspection; current main2df548e0 uses DEVAI2.6.3 with the same Constitution1.0.2/STYNX1.5.3. Historical version targets do not authorize an upgrade.

Owner approval of P1–P3 on 2026-10-18 authorizes replacing the **remaining-work schedule and dependency projections**
of C-0002/C-0003 with this plan upon integration of this PR. Their decisions,
requirements, acceptance, evidence, exclusions and historical records remain sources.
The [planning ADR](docs/meta/adr/ADR-0042-completion-plan-rebaseline.md)
records the approved cutover and bounded P1/P2 amendments. The approval is transcribed
in §8 and the campaign addenda; implementation remains paused until the exact P4
packet is approved. P4-01/P4-02/S1 approvals have since been recorded; S2 is approved but not integrated; S3 runtime remains paused. P5–P7 remain unresolved where applicable.

Read in this order:

1. Constitution and binding Owner decisions, including later steering/amendments.
2. Accepted ADRs and canonical product/legal/workflow sources.
3. This completion plan, once approved, for remaining outcomes and sequencing.
4. Each outcome's reconciled contract, authorized round/task packet and acceptance.
5. Historical campaigns/branches for provenance and reusable assets.

Code and tests show what exists and what has been observed; they do not override a
business rule or resolve a conflicting specification by themselves. Draft product
transcriptions remain draft. Contradictions require a source-backed reconciliation
or a decision from the proper authority before the affected code changes.

Supporting inventories, not competing plans:

- [Scope crosswalk](work/planning/2026-10-18-completion/scope-crosswalk.md): all40
  imported JNY records,110 UCs,12 overlapping RAIT JW views,38 unstruck DT entries
  and26 open issues mapped to outcomes. No item disappears because its branch is old.
- [Branch/task snapshot](work/planning/2026-10-18-completion/branch-inventory.json):
  exact fetched heads, ancestry, original task IDs/statuses and no-loss dispositions.
- [Reconciliation findings](work/planning/2026-10-18-completion/reconciliation.md):
  evidence limits, contradictions, existing decisions and historical round crosswalk.
- [Open-item snapshot](work/planning/2026-10-18-completion/open-items-snapshot.json):
  original DT rows and GitHub issue metadata. Issue counts are not feature counts.

Inventory scope is committed repository content and preserved refs. Runtime receipts
are historical at their exact SHAs, not rerun acceptance of every branch today.
No deployed environment, real provider, field device or untracked scorecard work
was inspected. The separate evaluation session owns its outputs and scheduling.

## 2. What is already delivered

| Capability                                    | Evidence baseline                                        | Limit retained                                                                                            |
| --------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Monorepo, modular backend and domain ports    | Founding ADRs; BUILD-PLAN WP history; closed R-0003…0016 | Closed ports/WPs do not establish every user journey or production integration                            |
| Local stack, corpus and indexes               | Closed R-0017/18/19                                      | Reproduce the candidate and retain source/seed constraints; old PASS is not a new deployment proof        |
| Platform pin/adoption                         | R-0021; PR #179; ADR-0039                                | Does not finish R-0022, unified authorization or deduplication                                            |
| RAIT/Portal preview                           | #191/#192, R-0033, PC-0021                               | Fixture-based review, unavailable writes; Dashboard/TEAT preview follow-ups remain                        |
| RAIT admissibility                            | #193/#194, merge e68266a0, R-0025 TASK-0024…0027         | PROTOCOLADO→triage→human checklist plus server timeliness→admit/reject only; R-0025 and JW-01 remain open |
| Selected accessibility/RLS/dependency repairs | #187/#188/#179 and scoped receipts                       | Specific fixes, not general certification                                                                 |

DEVAI proof chains, historical task records, PCs and audit observations remain
unchanged. A successful CI gate, preview or non-promoting observation is not an
assertion of whole-product or institutional readiness. Scorecard conclusions are
supplied only by the dedicated evaluation session, not reconstructed here.

## 3. Completion boundaries

### D — Development completion of the commissioned product

All software outcomes CP-01…CP-09 below meet their original retained criteria,
including contracts, backend/frontend behavior, role/tenant negatives, recovery,
route availability and user documentation. All40 imported journey records and110
UCs have an explicit disposition against their governing sources: implemented and
proved, already delivered, or expressly excluded/transferred by the Owner.
A group-level crosswalk is not proof that each requirement has passed.

No required command remains an unimplemented unavailable stub; no required page
remains L0 without a valid recorded exception. A deliberately unavailable external
provider must be distinguished from missing application behavior: implemented,
tested fail-closed integration logic can be development-complete while actual
provider qualification remains blocked. The existing campaign acceptance is not
relaxed by this distinction; any necessary exception requires an explicit decision.

### Q — Institutional/provider qualification

CP-10 establishes real identity, trust, contracts, normative sources, environment
and provider acceptance for the exact candidate. Mocks and homologation adapters
never substitute for that evidence. Q remains a separate authorized workstream;
C-0002 §6/C-0003 §12 exclusions of real external execution are preserved.

### O — Operational release and field use

CP-11 requires approved environments, distribution, signed artifacts where
applicable, real device/offline qualification, runbooks, rollback, support and
explicit release authorization. Merge or D-completion does not grant O.

Existing exclusions remain: PEC mobile; native `apps/portal/mobile` remains deferred by the phase4 decision (C-0003 §1), distinct from Portal web/PWA; bodycam and guarda monitorada
(including its modeling); UC-TEAT-013 speed-meter flow remains outside MVP (`teat.speed_meters=false`); unrelated reserved vehicle-domain development; upstream
STYNX repository writes; and k6/mutation execution under B17/OD-C3-004. TEAT mobile
production and native Android/Capacitor work remain separately commissioned tracks
(#108–#112), not silently added to the local development campaign. This plan exposes
them in the overall completion path without authorizing their implementation.

## 4. Remaining outcomes and acceptance

Every outcome carries its source requirements, authority, scope, integration owner,
inputs, proof obligations and unresolved dependencies into its execution packet.
Documents/availability travel with each slice; the final coverage audit remains CP-06.

| Outcome                                               | Existing scope owner / sources                                         | Remaining delivery and exit evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CP-00 — Review and baseline approval**              | This PR; C-0002/C-0003; binding ledgers                                | Approve §8; review crosswalk and branch dispositions; freeze accepted baseline and next authorized packet. No implementation in this package                                                                                                                                                                                                                                                                                                                                                                            |
| **CP-01 — One complete RAIT analyst journey**         | R-0025; JW-01; JNY-013; UC-RAIT-002/003/016; ADR-0041                  | Preserve delivered admissibility; reconcile distribution/pool/claim; dossier and official documents; inquiry/resumption; versioned draft→ready/signing handoff and authority return. Prove the whole connected workflow, not isolated screen/endpoint success                                                                                                                                                                                                                                                           |
| **CP-02 — Remaining RAIT operations**                 | R-0025; JW02–12; JNY-014–016; remaining RAIT UCs; WF/RN/command gaps   | Coordinator/secretariat protocol and boards, signing/central authority, rapporteur/chair, organization/RH/finance, integration, audit/admin. Reconcile all original64 command obligations plus approved additions, R-01…R-36/F-01…F-16 matrix and schema changes; each required role/journey gets positive and omitted-role negatives                                                                                                                                                                                   |
| **CP-03 — Citizen Portal workflows**                  | R-0027; Portal JNY030–040/UCs except JNY-037/UC-PORTAL-014; build pack | Replace unavailable delegation targets with source-backed defense/appeals/driver nomination/payment/medical-board/inquiry workflows; correct actor/target IDs, state, idempotency, privacy and errors; query/document behavior and end-to-end request tracking. Generic Portal medical delegation must be reconciled against the CH/PEC producer contract; this does not deliver CP-08 citizen PEC views. Keep institutional activation constraints explicit                                                            |
| **CP-04 — Operational Dashboard**                     | R-0026; Dashboard UCs/JNY023–029; #96–100/#123/#124/#173               | Build real L2 console, reconcile GET/error/event contracts, implement RAIT producers and reporting job/exports, role-scoped drilldown and public suppression. Prove producer→read model/job→UI and access negatives, not only static panels                                                                                                                                                                                                                                                                             |
| **CP-05 — BOAT and TEAT web workflows**               | R-0028/29; BOAT/TEAT UCs/JNY008–012,017–022                            | Reconcile BOAT gateway and six native-port boundaries; connect reporting/capture/review/sync flows and TEAT's web operational console. R-0013/ADR-0033 already delivered TEAT-mobile UI/workflow homologation; general TEAT-mobile wiring remains outside C-0003. Its remaining productive session/offline/sync obligations belong to CP-11, not new CP-05 work. Reuse source-backed text/route work. Prove local/homologation behavior; separate actual camera/GPS/hardware/field and RENAEST acceptance from adapters |
| **CP-06 — Availability, preview and user help**       | R-0030; R-0033 residuals; #186                                         | Integrate availability schema/checker after reconciling consumers; truthful manifest and pt-BR help/manual per role/route as functionality ships; finish remaining previews, accessibility follow-ups, FAQ/glossary/contextual help and full route coverage. Remove unused audit exception through its existing security gate; no gate relaxation                                                                                                                                                                       |
| **CP-07 — Necessary platform convergence**            | Stopped R-0022 salvage→R-0034; R-0023/24; ADR-0039; C-0003 §9          | Selectively recover useful tenancy/SSE/outbox/offline/signing/installer assets; reconcile public STYNX capability rather than old pin targets; preserve payload/ACK/provenance/deadline contracts; migrate authorization only with regenerated exact role×route parity; absorb v0 into shared kit and remove actual duplicates. No wholesale checkpoint merge                                                                                                                                                           |
| **CP-08 — PEC staff and citizen journeys**            | R-0031/32; ADR-0034; PEC UCs/JNY001–007; JNY-037/UC-PORTAL-014 (P7)    | Reconcile contracts/clients, CH RLS seed/tests and corrective checkpoints; implement clinical/regulatory19 screens and Portal7 views, projections, holder dossier, delegations and event flows. Preserve RENACH uniqueness, P2, signing/retention boundaries. Demonstrate clinical→regulatory→citizen workflows, manuals and availability; no assumption that backend parity delivered the frontend                                                                                                                     |
| **CP-09 — Consolidated candidate acceptance**         | R-0035 and retained C-0002/C-0003 final criteria                       | Exact-candidate full CI/root/backend/app gates; role/tenant matrix, outbox/offline failure/replay, lifecycle/recovery, secrets/paths, generated drift, accessibility and applicable performance/robustness proofs. Consolidation parity/origin-freeze/infra-retirement obligations reviewed against ADR0004/0012/0013; no origin archive or destructive action without separate authority. Full evidence/closure only for genuinely satisfied scope                                                                     |
| **CP-10 — External decisions and qualification**      | #125/#126/#120; letters tracker; trust/provider sources                | Named custodians and formal responses for normative/institutional gaps; approved identity/signing/TSA/roots, gov.br/SNE/RENAEST/banking/VAPID/biometry contracts where required; real samples/environment and acceptance results. Draft letters are not sent requests or responses; no contact or credential collection authorized by this plan                                                                                                                                                                         |
| **CP-11 — Separately authorized operational release** | TEAT #108–112; release/runbook scopes; applicable product decisions    | Trust/enrollment/offline, Android/GMS820, AIT validation/numbering/lifecycle/sync, production-vs-homologation separation and exact-device evidence; deployment/distribution, telemetry/support/training/rollback and explicit field/go-live decision. Plan and budget these separately before claiming DETRAN operational completion                                                                                                                                                                                    |

### CP-01: first executable package proposed for review

Admissibility #193/#194 and the S1 scope/projection/parent/replay prerequisite
#203 are integrated. D1–D11 and ADR0045–49/0052 resolve the earlier pool, handoff,
access, legacy and risk design choices; do not reopen them as unsolved discovery.
See [PR203 exact-merge evidence/audit](work/rounds/R-0025/reports/PR203-post-merge/README.md).

The [exact approved S2 packet](work/rounds/R-0025/reports/P4-02-S2-approval-packet.md)
authorizes backend risk + legacy qualification + atomic claim/context as one PR,
then separately approved S3 typed claim→dossier/header/browser activation. This is
an explicit delivery split, not removal of original UI/journey acceptance. S2 is
approved via #205 and implemented in unmerged draft #211; no new task dispatch
follows from this planning update.
Production source qualification remains separate from synthetic fixture proof.

After those slices: documents/inquiry/draft/signing with their provider gates.
CP-01/JW-01/R-0025 stay open; A2 unavailable batch/pending-item detail restoration
and the original command/journey acceptance remain required. The main trusted-RC
workflow's missing protected-tag/summary handling is a separate CI follow-up;
full DETRAN CI passed, but no signed-local-attestation success is claimed.

### TEAT-mobile and Portal-mobile boundaries

TEAT-mobile's local UI/workflow homologation is already delivered under R-0013 /
ADR-0033. C-0003 explicitly excludes general TEAT-mobile wiring; this plan does
not add session/offline/sync implementation to CP-05. BOAT-specific host integration
required by R-0028 remains its own source-backed scope, not permission to implement
the rest of TEAT-mobile. Required productive mobile behavior is CP-11 (#108–112)
under separate authorization. Crosswalk rows identify retained homologation assets
and productive residuals, rather than scheduling the same UI again.

Portal web/PWA document consultation is CP-03; native Portal-mobile is deferred.
JNY035/UC-PORTAL011/012 must distinguish web/PWA behavior, actual document/provider
qualification and any deferred native/offline presentation. A web download or fixture
is not proof of a productive offline document or native app.

### Medical-delegation boundary

CP-03's generic medical-board request/delegation and CP-08's seven citizen PEC
views are different obligations. Reconcile the actual CH producer/command contract
before accepting the CP-03 service; neither a mock target nor PEC screen preparation
proves it. Shared contract preparation may be assessed before PEC UI implementation,
within the existing authorized preparation limits. Do not introduce an unconditional
CP-03↔CP-08 whole-outcome dependency. If source reconciliation demonstrates such a
cycle under the current PEC-last rule, P7 must resolve the schedule explicitly;
that service remains pending rather than being counted complete or moved silently.

## 5. Historical sequencing and dependency policy

The current schedule is §11. The dependency, source and acceptance safeguards below
remain binding wherever §11 has not explicitly changed scheduling.

1. **Review CP-00**, settle only decisions that block the next packet, then authorize
   CP-01's reconciled first package. Preserve the agreed RAIT→Portal→Dashboard→TEAT
   product priority; BOAT's shared TEAT-web lock/dependency is retained.
2. **Complete the connected analyst journey**, including distribution and signing
   dependencies. Start CP-03/04 contracts or work only under the established app and
   shared-policy locks and explicit authorizations; no more than existing concurrency.
3. **Attach CP-07 work to demonstrated prerequisites.** A named journey may need a
   signing/outbox/public-API slice before its final acceptance. Do not wait for a
   speculative wholesale platform rewrite or declare the journey done without it.
   Owner-approved P2 amends the merged-J-round opening rule: an accepted complete
   vertical outcome or an expressly approved narrow prerequisite may qualify. This
   does not open R-0034 or authorize any packet; admissibility alone does not qualify.
4. **Finish CP-02/03/04/05 and their CP-06 deliverables.** Each outcome records a
   real prerequisite graph, not the old branch stacking order. Platform changes
   revalidate affected journeys. Two consumers of shared policy are serialized.
5. **Retain PEC's approved final placement** under ADR-0034/R-0030 prerequisites.
   Candidate contract reconciliation is useful preparation, not permission to move
   its implementation earlier. CP-08 reuses incremental R-0031/R-0032 assets.
6. **CP-09 certifies the assembled candidate**, with input from the separate
   evaluation session when available. Governance/scorecard work does not absorb or
   replace missing product behavior. CP-10 dependency gathering can be planned in
   parallel; actual external execution and CP-11 require their own authorization.

Documentation and availability accompany deliveries using R-0030's existing
advance-to-phase-D convention; final manuals/coverage are not waived. Security,
tenant negatives and generated consistency are per-change obligations, not postponed
to CP-09. No dependency is removed merely because a plan is old: retain, prove met,
replace with an equivalent source-backed contract, or obtain an explicit transfer.

## 6. Disposition of historical campaigns and preserved work

No archive/delete/rebase/force-push or wholesale branch integration is authorized.
The [snapshot](work/planning/2026-10-18-completion/branch-inventory.json) retains
all fetched origin refs and local-ref metadata. Ahead counts include stacked/shared
history and are not estimates of remaining work.

| Historical scope                                | Planning disposition                                                                               | Remaining accountability                                                                                                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-0001 / R-0001…0016                            | Keep merged/closed proof and port history                                                          | CP-09 checks residual parity/freeze/retirement; no reopening closed PCs by document edit                                                                                            |
| R-0017/18/19/21                                 | Delivered baseline, retained history                                                               | Reproduce relevant gates on new candidates; no duplicate migration/index/corpus program                                                                                             |
| R-0020 and RGR TASK-0013                        | Preserve both divergent refs; hand off to separate evaluation session                              | No sensor work here; that session reconciles old incomplete obligations and reports disposition                                                                                     |
| R-0022 stop checkpoint and earlier/handoff refs | Remains stopped; C-0003 §9 selective-salvage policy retained                                       | CP-07/10; old1.6.x manifest bumps rejected as integration inputs, bytes/history retained; generated files regenerated from sources; one-window custody investigation limit retained |
| R-0023 / R-0024                                 | Authorization candidate assets / dedup proposal                                                    | CP-07; current matrix and public capability baseline before changes, no inherited PASS                                                                                              |
| R-0025                                          | Original checkpoint already ancestral to main; do not remerge. #193/#194 integrated slice retained | CP-01/02; original64-command acceptance and approved additions remain; no close/seal                                                                                                |
| R-0026 / R-0027                                 | Mostly contracts/tests; no broad runtime delivered                                                 | CP-04/03; retain intentional REDs and rejected BANK_PORT history, not a resurrected candidate                                                                                       |
| R-0028 / R-0029                                 | BOAT homologation assets and TEAT screens/i18n preparations                                        | CP-05; real device proof remains CP-11; no production claim from adapters                                                                                                           |
| R-0030                                          | Availability/docs gate and fixture assets, not finished manuals                                    | CP-06; premature checker failure from missing manifests is not permission to weaken it                                                                                              |
| R-0031 / R-0032                                 | CH tests/contracts and stacked PEC/Portal preparation                                              | CP-08; reconcile corrective checkpoints and incremental changes; never count common ancestry twice                                                                                  |
| R-0033                                          | Closed/sealed PC-0021; preview and v0 integrated                                                   | Preserve closure/errata; follow-ups CP-06/09, no reopening or rewriting proofs                                                                                                      |
| R-0034 / R-0035                                 | Planned identifiers, not instantiated execution                                                    | CP-07/09 after review/opening conditions; do not claim implementation from a plan                                                                                                   |
| R-0036 / active scorecard session               | Outside this plan's execution                                                                      | Receive published baseline/results only; do not inspect/change its local work or reserve its identifiers                                                                            |
| Already merged maintenance/recovery refs        | Retain as history; no duplicate feature queue                                                      | Registry/pin decision #185 is stale against #179; residual RC claims remain separate; no issue closure from this document                                                           |

Every task in a preserved branch retains its ID, status and evidence in the snapshot.
No queued/checkpoint item is implicitly cancelled. Before each outcome starts, its
execution packet maps every relevant old criterion/task to: already satisfied with
exact evidence; resumed; replaced with equivalent obligations; or explicitly
transferred/excluded by the Owner with destination. Historical files are not rewritten
for bookkeeping. A replacement does not turn an unsatisfied criterion into PASS.

## 7. Binding decisions carried forward and conflicts to reconcile

[Steering §H](docs/meta/knowledge-base/steering.md) and later accepted decisions
prevail over stale projection text. This plan does not request new values for:

| Area      | Existing decision retained                                                                                                                                                                               | Source                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| RAIT      | Centralized/vinculado appeal, no counter-argument stage;30 days from publication for the decided authority flow; IPCA-E; T-PAR-3A/T-PRESC-5A alert-only; art.289-A retains its decided ex-officio effect | steering H46/H47; decisions/rait.md; applicable WF/RN        |
| Portal    | Digital waiver; suspended fine does not itself block CRLV-e; WCAG2.1AA/eMAG3.1; silver acceptance and ombudsman distinction as decided;40-percent discount outside SNE remains disabled (H53)            | DT-026/027/028; decisions/portal.md; steering H50/H51/H53    |
| BOAT      | Monthly configurable transmission/alert behavior; approved worst_victim derivation; provisional catalogs stay source_pending; national records terminal without retraction                               | steering H43; decisions/boat.md                              |
| TEAT      | Bodycam/guarda exclusions, recording indicator retained; expired homologation warns/records as decided                                                                                                   | steering H55; decisions/teat.md; ADR0033                     |
| PEC       | P2 distribution, distinct Special Board, periodic toxicology through adapter, tenant RENACH uniqueness, clinical retention/signing constraints                                                           | decisions/pec.md; accepted PEC amendments; ADR0012/0013/0034 |
| Dashboard | Conservative cell suppression below10 with preproduction validation; approved calibration proposals; delegated technical calibration remains engineering/SRE work                                        | decisions/dashboard.md; steering                             |

Steering H54's approved operational calibrations and H57's collegiado premises
remain in force. Missing institutional regiments do not reopen or suspend those
already approved defaults; jeton, the unassigned sync window and genuinely
unsourced items retain their specific gates. Owner product choices and subsequent
formal legal/institutional validation must remain distinguishable.

The crosswalk assigns **source reconciliation**, not new lawmaking: draft JNY/UC
text that conflicts with later decisions must be annotated through the existing
proper-role process. Do not modify Owner product JSONs simply to match today's code.
In particular, keep OD-HF-B9-001's PEC uniqueness conflict visible; legacy phrases
requiring patient+RENACH must be reconciled to the accepted tenant-scoped rule.

Actual remaining questions include OD-R25-016/017 and OD-C3-009, member role/grant,
session creation/cadence, additional substitute ordering, unsourced deadlines and
sync.concurrency_window_minutes where still unassigned. Do not generalize a value
from another workflow. Exact source/owner and activation gate are required.

## 8. Review decisions and implementation hold

**Owner approval, 2026-10-18:** “Fix the remaining review findings, record my approval of P1–P3, run the required checks, and open the completion plan PR. Keep implementation paused until we approve the exact P4 packet, and preserve local and scorecard work.”

P1–P3 below are approved; campaign addenda amend the prior scheduling restrictions
without rewriting their history. P4 approvals extend through S2; S3 needs its exact packet. P5–P7 remain
unresolved where applicable. This approval does not prefill acceptance or PASS.

| ID                                | Decision / recommendation                                                                                                                                                                                                                                                      | Authority and current restriction                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1 — Delivery model**           | Allow bounded, independently reviewable PRs inside an existing open round; retain final whole-round acceptance, evidence and close/seal. Require contract→RED→implementation→affected/full PR gates→cross-family review→CI→authorized merge→scoped evidence/audit per delivery | Approved by Owner 2026-10-18; amended in C-0002/C-0003 addenda. Aggregate acceptance/close/seal retained; S1 integrated #203; S2 approved #205; implementation #211 not integrated |
| **P2 — Platform prerequisite**    | Permit R-0034 only after an accepted complete vertical outcome or an explicitly approved narrowly bounded prerequisite needed to complete that outcome; avoid waiting for every RAIT command solely because of round grouping                                                  | Approved by Owner 2026-10-18; C-0003 scheduling amendment. No R-0034 opening or R-0022 restart authorized; shared locks/no-touch boundaries retained                               |
| **P3 — Meaning of completion**    | Approve D/Q/O milestones separately; retain full commissioned software scope, original external/native exclusions and explicit operational obligations. No production label until Q/O pass                                                                                     | Approved by Owner 2026-10-18; no external execution commissioned, no D acceptance reduction, no Q/O readiness claim                                                                |
| **P4 — Next CP-01 packet**        | Reconcile pool, distribution, claim destination and signing handoff with canonical sources; then authorize only the selected bounded packet                                                                                                                                    | D1–D11/ADR0045–49 approved and integrated; S1 merged #203; backend-first S2 approved #205; later S3 UI activation requires its exact approval                                      |
| **P5 — Journey/access conflicts** | Resolve OD-C3-009 before the affected JW02/05/08 journeys and identify authority for any individual case-access rule                                                                                                                                                           | Owner/source custodian; no inferred grant or permission widening                                                                                                                   |
| **P6 — External ownership**       | Name custodians, exact requests, expected public/formal evidence, target response dates and fallback/deactivation conditions for CP-10/11                                                                                                                                      | Owner/institution/LEGAL; no invented normative values, credentials or institution promises; no sending messages from this PR                                                       |

After review: keep the first commitment to one small CP-01 packet, with contract,
source conflicts, proofs and completion boundary visible. Re-estimate from its
actual effort and the accepted dependency graph. Do not quote historical token
budgets, stacked commit counts or the former25-window estimate as a finish date.

**P7 — Shared medical dependency:** Architect must identify the real Portal→CH
producer boundary and whether its source-backed delivery can precede PEC frontend
implementation under existing authorizations. If it requires changing the approved
PEC/R-0030 ordering, obtain an explicit Owner amendment. No invented medical
command or automatic order change; track the unsatisfied service until resolved.

## 9. Acceptance and handoff checklist

For each executable packet, preserve existing gates and record:

- User outcome/persona; canonical UC/WF/RN/JNY/JW sources; exact baseline/pin.
- Existing task/round lineage and every carried-forward acceptance obligation.
- Concrete UI→typed client→authorization→domain→DB/events→refresh behavior, with
  available/unavailable states and operational prerequisites honestly represented.
- Positive cases and omitted-role, cross-tenant, state/version, idempotency,
  concurrency, failure/rollback/retry/recovery negatives applicable to that outcome.
- Generated source/client consistency; component/routed, HTTP/DB and browser proof;
  preview remains fixture-only and non-writing. Real IdP/provider/device proof is
  separately named; no synthetic evidence substituted.
- Per-route availability/help/manual updated; known a11y and error limitations
  tracked; existing root check/backend tiers and required CI checks green before merge.
- Cross-family review, actual limitations, exact candidate and scoped post-merge
  evidence/audit. No whole-round completion until all retained criteria or explicit
  Owner dispositions are verified by the existing close/seal verbs.

CP-09 additionally verifies cross-product handoffs (Portal→RAIT, RAIT→Dashboard,
BOAT/TEAT shared capture, PEC→Portal), consolidated setup/restore/rollback,
origin parity/freeze disposition and user/support acceptance. Integration with
national services stays through senatran-adapter. No unrelated framework is added.

## 10. What this planning PR verifies

Read-only evidence/spec/branch reconciliation; full population coverage checks for
crosswalks; ref/hash/task-status accuracy; published-document links/KB/index gates;
formatting and DEVAI doctor. No runtime or sensor source changed, no branch tests
rerun or claimed current, no proof/round state written. Validation receipts and local
preservation metadata live under work/planning/2026-10-18-completion/.

The primary checkout belongs to the active scorecard session. This work uses the
isolated existing managed worktree and its own codex branch, without checkout,
stash, reset, cleanup, migration or writes in the primary checkout. Other-session
commits may advance concurrently; preservation means no interference, not freezing
another authorized session's work.

## 11. Approved consolidated roadmap — 2026-10-23

### Approval, authority and retained acceptance

Direct Owner instruction in the consolidated DETRAN chat:

> I approve the consolidated roadmap. Record it as the new completion plan in a PR, preserving original acceptance criteria, histories and local work. Then begin milestone 1, keeping #211 unmerged and C6 blocked.

This approves the eight-milestone schedule below and beginning M1. The plan PR is
for review; it is not authorized for automatic merge. The same chat coordinates
product delivery and scorecard work with separate role sessions, packets, receipts
and conclusions. Archival of the Scorecard and Backlog chats changes coordination,
not the authority or standing of any artifact. Their dated conclusions remain
historical observations. Neither those chats nor a prior five-hour delegation
provides a continuing blanket Owner decision mandate.

The unchanged CP-00…CP-11 outcomes in §4, D/Q/O boundaries in §3, binding decisions,
source precedence, exclusions and §9 acceptance checklist remain mandatory. Keep
the crosswalk of 40 JNY records, 110 UCs and 12 overlapping RAIT JW views, all original
64-command obligations plus approved additions, and the per-round acceptance. A
workflow may require several reviewable PRs; no incomplete criterion becomes PASS
from rescheduling. Round IDs below express existing accountability, not new rounds,
new task IDs or permission to reopen a closed round.

### Milestones and exit evidence

| Milestone                                               | Delivery and source accountability                                                                                                                                                                                                     | Exit evidence and retained limits                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1 — Trustworthy execution baseline**                 | Current-main trusted-local-RC attestation; governed scorecard provider adoption and fresh assessment; reconcile stale status projections and already-integrated repairs. R-0020 and R-0041…R-0045 retain their individual obligations. | Exact clean candidate, reproducible required checks, 43 applicable-cell register plus two unchanged N/A cells, native scorecard, evidence manifest/comparison and separate remediation backlog. Report measured/blocked and PASS/REVIEW/FAIL independently. Close only eligible scopes through official verbs; C6 and genuine residuals stay open. |
| **M2 — Integrate RAIT S2**                              | R-0025 / CP-01: supported U1/B1 contracts/capabilities, release-bound DETRAN adoption/recovery, catalogue generation, bounded smoke/provisioning repairs and full candidate validation.                                                | #211 integration requires supported proof recovery, exact-candidate required-green checks, review and a separate explicit removal of its merge hold. M1 adoption alone does not supply recovery authority.                                                                                                                                         |
| **M3 — Complete the RAIT analyst journey**              | R-0025 / CP-01: exact S3 claim→dossier/header/browser packet, official documents, inquiry/resumption, versioned draft and signing handoff/return; restore required A2 omissions.                                                       | Connected JW-01 with role/tenant negatives, state/version/idempotency/concurrency controls, failure and recovery. Preserve S2 integration/audit before S3 runtime and its exact approval requirement.                                                                                                                                              |
| **M4 — Complete the cross-application appeals service** | R-0025/26/27 / CP-02/03/04: remaining RAIT roles, citizen requests/tracking, decisions/notifications, Dashboard producers/read models, reports and exports.                                                                            | Citizen request→staff processing→decision→publication/notification→operational visibility; each remaining role/journey and original command has acceptance evidence. Resolve affected OD-C3-009 access conflicts before implementation; no implied grant.                                                                                          |
| **M5 — Complete field-office workflows**                | R-0028/29 / CP-05: BOAT reporting/capture/review/sync and TEAT operational web console, retaining shared-shell locks and dependencies.                                                                                                 | Complete local/homologation workflows, truthful route availability and existing adapter acceptance. Native camera/GPS/hardware, field release and productive RENAEST qualification remain M8.                                                                                                                                                      |
| **M6 — Complete clinical staff and citizen services**   | R-0031/32 / CP-08: PEC staff screens, Portal PEC views, projections, dossier and delegations.                                                                                                                                          | Clinical→regulatory→citizen acceptance, CH RLS, approved P2/RENACH/signing/retention constraints, manuals and availability. Retain PEC/R-0030 prerequisites and final placement; earlier contract preparation is not earlier UI implementation.                                                                                                    |
| **M7 — Certify the assembled software**                 | R-0023/24/34/35 / CP-07/09: residual platform convergence and original hardening, parity/freeze/retirement review, full regression, accessibility, security, recovery and applicable performance.                                      | Every commissioned software requirement has an evidence-backed disposition on the assembled exact candidate. No whole R-0022 merge or restart, origin archival, test weakening or inferred production readiness.                                                                                                                                   |
| **M8 — Qualify and release operationally**              | CP-10/11, including separately commissioned TEAT #108–112: real providers/institutions, identity/trust, native device/offline evidence, distribution, support and rollout.                                                             | Separate Q and O gates, real accepted samples/devices/environments, signed artifacts where required, restore/rollback/training/runbooks and explicit operational-release authority. Mocks, adapters and green CI do not supply these proofs.                                                                                                       |

### Dependency and integration rules

The immediate sequence is M1, supported M2 recovery/integration, then M3. M1 is a
set of bounded workstreams, not permission to wait for every scorecard FAIL to turn
PASS before unrelated authorized product work proceeds. C6 remains an explicit
residual; an evaluation may report it without claiming full C6/campaign completion.

After M3, schedule M4 deliveries by real cross-application producer/consumer
dependencies. Portal and Dashboard can accompany the business events they consume;
this replaces rigid whole-application completion barriers, not shared locks or
required producers. M5 respects BOAT→TEAT web dependencies. M6 retains the original
PEC prerequisites. CP-07 platform slices enter earlier only for a demonstrated
journey dependency under approved P2 and an exact bounded packet. M7 assembles and
revalidates all previously delivered slices.

CP-06 documentation, pt-BR help, availability, previews, accessibility, security,
source traceability and negative tests accompany every milestone; R-0030 retains
its final coverage audit. CP-10 dependency preparation can start early, but sending
requests, collecting credentials, real-target execution, device/field operations
and deployment retain their separate authority gates. Preserve the complete
original suite-level E2E, including signing, adapter publication, notification and
audit-chain verification; do not replace it with a mock-only readiness claim.

Use the existing concurrency limits and explicit app/backend/policy locks. Serialize
changes to shared evidence/catalogue/policy surfaces and refresh source bindings
when main changes. Preserve primary local files, staged merges, protected worktrees,
recovery bundles, stopped checkpoints, old readings and complete proof histories.
Generated/state/proof outputs are written only by registered official actions.

### M1 execution contract

1. Freeze and verify live main, its CI/attestation status, installed provider and
   published release identity. Preserve baseline hashes and existing local state.
2. Inspector diagnoses and executes trusted local RC only through the existing
   prepare/publish/verification flow, using its exact published candidate, required
   Node/pnpm versions, trust policy and disposable services. Retain original failures.
3. In a separate governed adoption packet/role session, verify the released provider
   containing #424, actual package integrity and supported migration. Use the existing
   R-0042 adoption/execution plan, revising only newly observed release-specific facts.
   Review constitution 1.0.2→1.1.0 and the distinct RC/native runtime requirements; do
   not change a guard, hash binding or runtime graph to make adoption appear valid.
4. Engineer owns dependency/lock changes; Architect owns canonical policy/reference
   amendments; Inspector owns execution/assertion populations and persistence; Auditor
   assesses without ratifying sources. Registered init plan/bind/apply actions alone
   materialize pin/config/state outputs. Stop dependent effects on undeclared migration
   effects, incompatible runtime/policy, lost custody or changed protected populations.
5. After approved configuration, freeze an exact clean source candidate. Reconcile the
   installed sensor registry and execute prerequisites and all applicable cells; schema
   validate and officially record each emission immediately before another of that
   kind. Run required second passes. Never invoke an old wrapper hardcoded to closed
   R-0036 or combine readings across SHAs.
6. Publish the scorecard, 43-row register/two N/A, complete manifest, comparison and
   separate remediation dispositions. Reconcile BL-0016/#218 and other integrated
   scopes against their exact acceptance before official backlog/round transitions.
   R-0020's divergent maestro/RGR obligations require their own no-loss disposition.

M1 does not reopen R-0036…R-0039, relax thresholds, change N/A declarations, activate
any of the nine C6 producers, retry/rephrase the withheld C6 review, or authorize
upstream repository writes/releases. DEVAI 2.7.0's measurement adoption is distinct
from U1/B1 recovery: the reviewed release lacks #211's required capabilities. Keep
#211 unmerged and S3 runtime held. A future recovery contract/implementation/release
and D1-L package must still satisfy their exact approval boundaries.

### Verified starting status and reporting

Observed main: `80505ac00690a3210913f09904004898b78860c3`. DETRAN CI run
39985646190 passed; trusted RC run 39985646229 failed. Installed DEVAI is 2.6.3 with
constitution 1.0.2 and STYNX 1.5.3; DEVAI v2.7.0 is published but not adopted. #211 is
open, non-draft and conflicting at 9b2a190aa1276f4b15469b7079ed0d7c4c8c4c99. Its
local staged reconciliation is preserved, not a committed or integrated result.

Latest complete assessment at 0e26c795: 36/43 measured, seven observation gaps, overall
FAIL. R-0042 has two later cell dispositions on another SHA; these are not added
to 36. C1/C2 and C3/C4 closed in R-0037…0039; R-0041…0045 remain formally open despite
merged partial deliveries. Residual dependency/lint/security/PII/coverage/traceability/
governance/performance findings keep their original evidence and specific backlog
identities. Completing measurement does not certify product behavior.

Report separately: implemented, integrated, verified on the exact candidate, awaiting
integration, blocked by evidence/authority, stale bookkeeping, and external Q/O. No
calendar finish date is inferred from checkbox totals, branch commits or old budgets.

### M1 execution update — 2026-10-24 UTC

This dated observation supplements the starting snapshot above; original acceptance
boundaries in §§3, 4 and 9 remain unchanged. The approved roadmap PR #223 merged
with all five required checks green at `d8def62fefb0df0fa0480909a9082b8812cd3721`.
The original source `80505ac00690a3210913f09904004898b78860c3` now has a genuine
signed local RC and independent exact-commit verification (run 40034673414).
That attestation belongs to its own tree and does not attest later adoption work.

PR #224 carries governed DEVAI 2.7.0 / constitution 1.1.0 adoption, the finite
history-compatibility transition under ADR-0062, preserved baseline attestation
and both reassessment attempts. Published candidate
`21427c25fe2e1c7977ca0311156d4c59d8cfea35` passed all five required checks
(CI 40052489971); its verified-local-rc used the supported remote backend fallback.
The report publication commit still requires final-head review and CI before
protected integration. The latest direct Owner instruction authorizes that
integration once its required checks are green.

The earlier complete 55-kind capture at `74b9eec8` remains a partial measurement:
36 measured cells and seven observation gaps; native overall FAIL, 24 PASS,
11 REVIEW, 6 FAIL, 2 UNKNOWN and the original two N/A. Its failures, 57 official
reading records, preceding 335-record chain prefix and all 211 previously tracked
canonical readings remain in `work/rounds/R-0042/reports/evaluation-74b9eec8/`.
No later result is substituted for that source's observations.

The corrected capture completed at the exact published clean source
`21427c25fe2e1c7977ca0311156d4c59d8cfea35`, tree
`8a3329a7189b960a915e560daf0971ec0ea68e97`, on 2026-10-24 at 03:12:34 UTC.
Supported inventory regeneration ran first, before proof append; all eight
genuine bodies passed installed strict schemas and their public hash/source/tree
bindings. All 55 original kinds were then genuinely emitted, validated and
immediately recorded at that fixed source. Historical inventory-performance
inputs retain their original native population and method.

Independent Auditor reconciliation confirms **43/43 applicable cells measured,
zero cell observation gaps**, plus the two unchanged N/A cells. The native quality
result remains **26 PASS, 12 REVIEW, 5 FAIL; overall FAIL**. All seven original
BL-0024 gaps now have supported dispositions: F3:T1/T6/T7/T8 PASS and F3:T2/T3/T5
REVIEW. Complete measurement does not accept those remaining findings.
Unit 13,641, integration 1,518 and complete E2E 2,260 tests passed under the original
descriptors; no same-source E2E retry was needed. Genuine whole-source coverage
executed all 592 declared files and measured 56.53% line coverage, retaining REVIEW.

The complete report, 43-row register, source comparison, separate remediation
dispositions, independent audit and lossless raw evidence are retained in
`work/rounds/R-0042/reports/evaluation-21427c25/`. All 55 new canonical artifacts
match their records in both directions; the chain is an exact 393-to-448 append,
and all 268 baseline canonical reading files are unchanged. Thirteen pre-existing
historical artifact-availability limitations remain disclosed separately from
native verification of 128 proof anchors and 53 acknowledged proof gaps.
There is no global historical-availability PASS. The two non-cell UNKNOWN
diagnostics and all six nonblocking runner-review limitations remain explicit.

R-0043/BL-0016 closeout is limited to the mock fixture repair actually integrated
in #218 and verified afterward. Registered verbs emitted PC-0026, declared the
closed R-0043 record, sealed it and resolved BL-0016 on 2026-10-24 UTC; protected
integration of this reconciliation remains pending. BL-0025 stays open: the fresh
source's E2E PASS does not diagnose the earlier socket failure.
R-0042/BL-0024 are eligible for later official bounded closeout after #224's actual
protected integration and post-integration gates. No future merge identity or PC
is asserted. R-0020/0041/0044/0045 and genuine residual quality/legal findings keep
their own obligations. A final clean closeout candidate still requires a fresh
signed RC and independent exact-commit verification. Heavy reassessment and cleanup
have exited; the final RC must respect the next available shared-workstation slot.

#211 remains unmerged, S3 runtime held and all nine C6 producers blocked with
empty effective bindings. This update does not accept product quality, resolve
other rounds or findings, or authorize Q/O activity.

### Measurement closeout recorded — 2026-10-24 UTC

PR #224 integrated at `f50b9ce7dd32dff66646fd01e99b0556e4d76bdb` after
all five required checks and independent review passed on delivery head
`522e61d39d4a5fb063d29b9d5c58d6543e2a197c`. The actual merge tree equals
the reviewed delivery tree. Post-integration DETRAN CI 40060467337 passed its
backend, foundation, mock, evidence, invariant and BOAT jobs; the original
optional stack-smoke stayed skipped. Its verified-local-rc fallback check
120777117653 is a remote backend result. Separate trusted-RC run 40060467323,
job 120772645725 and check 120772707099 remain failed for the missing exact-tree
attestation tag and secondary missing-summary output. Those failures are retained;
this intermediate merge is not described as signed or attested.

The R-0043/BL-0016 reconciliation and PC-0026 are now integrated through #224.
After the actual post-integration gates and conditional independent closeout
review, Architect D-6 accepted only the original R-0042 measurement scope.
Registered verbs appended genuine acceptance evidence, emitted **PC-0027**,
declared and sealed R-0042, and resolved **BL-0024**, preserving its original
body and origin. The human and machine indexes reflect those actual outcomes.
Original D-1…D-5, including the withheld D-3 proposal, remain intact.

The chain is now an exact 448-to-449 acceptance append; all 323 existing canonical
reading files and 1,846 protected source hashes remained unchanged through the
transitions. Current native verification reports 129 proof anchors, 53 acknowledged
historical proof gaps and zero undeclared or invalid references. The separate
13 historical sensor-artifact availability limitations remain explicit.
Acceptance, refusal/failure history, reviews, source equivalence, exclusive
execution receipts and postchecks are retained in
`work/rounds/R-0042/reports/m1-closeout-20261024/`.

The assessment remains bound to `21427c25`: **43 measured applicable cells,
zero cell observation gaps, native 26 PASS / 12 REVIEW / 5 FAIL + two N/A,
overall FAIL**. No later closure or integration commit is relabeled as that
measurement source. BL-0025 remains open; its earlier socket failure is not
diagnosed by the later passing E2E. R-0020/0041/0044/0045, BL-0020 and all genuine
quality/legal/operational residuals retain their own obligations.

This observation precedes certification of the final clean closeout candidate.
That candidate must be published, independently reviewed, receive a fresh signed
RC and independent exact-commit verification, and pass all five required checks
before its own protected merge; main must then verify by exact tree. The actual
signature and verification outcomes belong to the immutable evidence tag, native
receipts and PR checks/body, so recording them does not alter the attested source.
No future RC outcome or integration identity is asserted here.

#211 remains unmerged, S3 runtime held and all nine C6 producers inactive with
empty effective bindings. Closed rounds, original acceptance, local/recovery work
and both proof histories remain preserved. This bounded measurement closeout
does not declare product or whole-campaign completion.

### Milestone 2 begun — 2026-10-24

The Owner directed checking post-merge main CI and then beginning M2 under this
approved roadmap, retaining #211 unmerged, C6 blocked, acceptance, histories and
local work. Main `b796e2e0` post-merge CI and trusted exact-tree verification passed;
no CI repair was required. M1 adoption/measurement closures remain bounded and its
26 PASS / 12 REVIEW / 5 FAIL plus two NAs remain an overall FAIL.

The [M2 start packet](work/rounds/R-0025/reports/M2-start-20261024/README.md)
records source/capability discovery, preserved recovery approvals and later
proposed annexes, archived reconciliation/index custody, current-main drift and
the independent already approved smoke-diagnostic insertion. It supplies no new
upstream, recovery or merge authority. Newer release discovery is separate from
exact capability qualification and D1-L approval. Keep #211 unmerged and C6 blocked;
S3 runtime remains held. No original acceptance or historical packet is rewritten.
