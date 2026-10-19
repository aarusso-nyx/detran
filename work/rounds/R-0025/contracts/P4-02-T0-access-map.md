# P4-02 — closed route, purpose and parent map

Architect, Constitution Article 7; authority by Article 6. This is the T0 design
map after Owner approval of D8–D11. It specifies future controls, not observed
runtime enforcement, production qualification or delivery acceptance. Historical
[preflight](../reports/P4-02-route-scope-inventory.md) and
[packet](../reports/P4-02-exact-wiring-packet.md) remain evidence of their baselines.
The supplemental amendment and ADR0047 (role-purpose/identity), ADR0048
(legacy compatibility) and ADR0049 (risk composition) govern subsequent work; no
runtime change is made here.

## Interpretation and complete role decision

All route paths below have prefix `/v1/inf/rait`. Each expanded method is one
matrix entry. Every entry applies the following role table independently: the
server selects a complete authenticated role, permitted action, purpose,
projection and predicate. Multiple roles are a union of complete valid decisions;
the permission of one role cannot be combined with another role's scope. Explicit
permissions, global administrators and wildcards do not bypass these conditions.
Unknown roles and unmatched purposes deny. Collection filtering, sorting, counts
and pagination occur in SQL after the predicate; by-ID denial is consistently404.
No caller-supplied purpose, tenant, actor or role establishes authority.

`B` means authenticated internal auth.users.id, request tenant RLS, current
role/action permission, no case impediment, and matching tenant on every join.
`U` means active explicit actor-role unit OR pool binding with authorization
provenance; a pool binding matches only that pool, never every case in its unit.
ADR0047 extends the internal CASE binding role set to secretary, chair, central
authority and manager, retaining exactly-one unit-or-pool and nonempty
authorization reference. The binding bounds scope; the complete duty/purpose is
still required. Signing and rapporteur authority use their existing qualified
jurisdiction/appointment/duty and assignment/session relations, not new blanket
bindings. Operational bindings require verified provenance, current validity and revocation;
no public CRUD, production seed, nullable provenance or role-only fallback is
introduced. ADR0046 oversight bindings remain separate from ordinary coordinator
membership, whose provenance is insufficient. Missing production rows deny;
qualified disposable fixtures can establish positives without production access.

| Effective role and purpose                                               | Additional server predicate                                                                                                        | Maximum case projection                                                                                                                                    |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Analyst collective defense queue                                         | Active own analyst membership, matching active defense pull pool/unit, eligible candidate and authoritative ordering under ADR0045 | Only claim-context queue metadata; never generic merits                                                                                                    |
| Analyst/secretary admissibility                                          | Active matching unit/pool membership, existing triage permission; PROTOCOLADO or TRIAGEM_ADMISSIBILIDADE                           | Closed triage field/document map; no free petition or generic dossier                                                                                      |
| Analyst instruction                                                      | Own active assignment, matching authorized pool/unit                                                                               | Assigned-case merits needed for instruction; dossier read-only in this packet                                                                              |
| AUDITOR sealed archive                                                   | U AND archived=true; sealed classification and third-party suppression                                                             | S archive projection only, no oversight-to-archive mixing                                                                                                  |
| Coordinator/AUDITOR oversight                                            | U matching the case's unit/pool                                                                                                    | Scoped merits, including unassigned cases; no write/claim/sign grant                                                                                       |
| Secretary procedural/archive duties                                      | U and recorded protocol, collegial-support or archive duty applicable to that case                                                 | Protocol/administrative and archive records necessary for the duty; sealed archive suppresses third-party material; no unrelated merits                    |
| Rapporteur assigned work                                                 | Own active assignment                                                                                                              | Assigned merits                                                                                                                                            |
| Rapporteur relevant session/vista                                        | Verified participation in the case's bench/agenda or recorded vista, within that session/vista scope                               | Relevant case merits; pool membership alone is insufficient                                                                                                |
| Chair                                                                    | U AND active presidency of the matching case board/pool                                                                            | Distribution, agenda, session and decision records necessary for those functions                                                                           |
| Signing authority                                                        | Case ready for decision, verified jurisdiction and applicable appointment/duty                                                     | Decision and necessary supporting merits; no claim grant                                                                                                   |
| Central authority                                                        | U for designated review scope and favorable JARI decision eligible for that journey                                                | Appeal-review decision and necessary supporting records                                                                                                    |
| Manager                                                                  | U within operational remit                                                                                                         | Operational radar, delay cause and incident projection only; no petition/free merits                                                                       |
| HR/finance/BI/integration/agency-admin/traffic-authority/technical-admin | Existing contracted functional scope and action                                                                                    | Functional projection only; no case merits from status or wildcard. Absent a contracted case-bearing functional projection, these generic CASE routes deny |
| Any other actor                                                          | No complete purpose established                                                                                                    | Deny                                                                                                                                                       |

Sources: D1–D11 Owner approvals; ADR0045/0046; shared policy
`backend/domains/shared/src/policy.ts` RAIT_STAFF_ROLES, RAIT_READ_ROLES,
RAIT_SURFACE_WRITE_ROLES and RAIT_COMMAND_RULES; role journeys under
`docs/framework/arch/rait-web-journeys/`; original AUDITOR broad read wording is
superseded by approved containment. D8 establishes read boundaries, not new actions.
Session/vista/presidency/jurisdiction qualification must use their existing
canonical owners and public interfaces; the CASE service consumes verified
relations, never infers them from role, browser data or pool membership.

### Exact pool containment

A pool-bound U requires SQL EXISTS for a trusted current assignment or batch-item
relation linking that case to that exact pool, with consistent tenant/unit/instance.
Without such a relation, use the internal CASE-owned rait_case_pool_scope relation
specified by ADR0047: tenant_id, case_id, pool_id, active, authorization_ref,
source_ref; unique tenant+case+pool, valid same-unit/instance parents and nonempty
provenance. Blueprint operations[]; no public CRUD/default migration/browser grant.
Controlled routing provisioning is separate. An unassigned case with no trusted
pool link is unreadable through a pool-only binding; a valid unit binding may
read its unit. Neither same unit/instance nor selecting the first pool proves pool
containment. Claim selection uses this server-validated routing association where
pool partition is required. Tenant fixtures supply explicit links, never invented
production assignments. Source and target pool links are checked on every
permitted association change.

### Closed read field projections

These are explicit contract-design allowlists implementing approved D8 read
purposes. They are not assertions that existing DTOs already filter fields. Every
set below excludes tenant_id (server context), arbitrary JSON, storage keys,
binaries, download URLs and unlisted fields. Related IDs require their own parent
qualification; otherwise suppress that reference rather than disclose another
case. `id,case_id` are common child identifiers only after case authorization.
For clock-alerts the common identifiers are id,clock_id instead: the entity has
no case_id, and the protected case is resolved through its clock.
For case rows, common C is id, protocol_number, instance, circuit, state, unit_id,
protocolled_at, version. Purpose S is secretary procedural/sealed archive; O is
manager operational; M is assigned or explicitly bound coordinator/AUDITOR merits;
J is qualified board/session/central/signing supporting read. J is available only
when the complete applicable purpose in the role table establishes that this
resource belongs to that case's distribution/session/decision/appeal duty.
Unmatched resource/purpose combinations deny, not full-DTO fallback. Claim metadata
and preadmission triage use their separately frozen field sets and override this
table. AUDITOR archive uses S redaction when serving sealed archive; its separately
qualified oversight operation can use M, never silently mixed with S.

| Resource         | S fields beyond common identifiers                                                                                                                                                                                              | O fields beyond common identifiers                                                          | M / J fields beyond common identifiers                                                                                                                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cases            | C plus intake_channel, admitted_at, judge_body_received_at, judge_body_received_on, cetran_received_at, cetran_received_on, remitted_at, decided_at, communicated_at, closed_at, archived, pending_completion, last_movement_at | C plus last_movement_at, pending_completion, archived                                       | C plus ait_id, origin_case_id, intake_channel, admitted_at, judge_body_received_at, judge_body_received_on, cetran_received_at, cetran_received_on, remitted_at, decided_at, communicated_at, closed_at, suspensive_effect, archived, non_admission_reason, withdrawal_document_id, last_movement_at, pending_completion, legal_priority, agency_jurisdiction_id |
| parties          | role, representation_kind, representation_verified; sealed archive suppresses third-party rows and identifying data                                                                                                             | Deny                                                                                        | role, legitimacy_basis, person_name, document_number, representation_kind, representation_verified, representation_document_id; no contact_email                                                                                                                                                                                                                 |
| documents        | kind, origin, attached_at; sealed archive suppresses third-party rows; opaque id only, no identifying filename                                                                                                                  | Deny                                                                                        | kind, origin, filename, content_hash, digitised_from_paper, attached_at; document content/URL remains unavailable                                                                                                                                                                                                                                                |
| admissibility    | criterion, verdict, evaluated_at; free reason excluded from sealed archive metadata                                                                                                                                             | Deny                                                                                        | criterion, verdict, reason, evaluated_at, evaluated_by                                                                                                                                                                                                                                                                                                           |
| pending-contents | due_on, opened_at, closed_at, outcome                                                                                                                                                                                           | due_on, opened_at, closed_at, outcome                                                       | due_on, opened_at, opened_by, closed_at, outcome; missing_items JSON excluded until separately typed                                                                                                                                                                                                                                                             |
| deadlines        | timer_code, start_basis, started_on, raw_due_on, due_on, business_days, extension_count, satisfied_at, legal_basis                                                                                                              | Same S timer/deadline set                                                                   | Same S set plus suspended_by_act_id only if referenced act is authorized                                                                                                                                                                                                                                                                                         |
| inquiries        | requested_at, due_on, extension_count, answered_at, answered_on, outcome                                                                                                                                                        | requested_at, due_on, extension_count, answered_at, answered_on, outcome                    | addressee, subject, requested_at, requested_by, due_on, extension_count, answered_at, answered_on, outcome                                                                                                                                                                                                                                                       |
| drafts           | version, status, submitted_at, returned_at, return_count                                                                                                                                                                        | version, status, submitted_at, returned_at, return_count                                    | version, author_id, document_id, content_hash, status, submitted_at, returned_at, return_guidance, return_count                                                                                                                                                                                                                                                  |
| decisions        | circuit, decision_kind, decided_at, published_at; no grounds in sealed archive metadata                                                                                                                                         | circuit, decision_kind, decided_at, published_at                                            | circuit, decision_kind, grounds, decided_by, decided_at, session_id, signature_kind, signature_ref, published_at; signature_ref is opaque metadata, not a signing capability                                                                                                                                                                                     |
| communications   | decision_id, channel, sent_at, effective_on, next_deadline_on, authority_appeal_notice                                                                                                                                          | channel, sent_at, effective_on, next_deadline_on                                            | decision_id, channel, sent_at, effective_on, next_deadline_on, authority_appeal_notice; content_ref and enclosed_document_ids JSON excluded                                                                                                                                                                                                                      |
| events           | event_type, from_state, to_state, occurred_at                                                                                                                                                                                   | event_type, from_state, to_state, occurred_at                                               | event_type, from_state, to_state, occurred_at, actor_id; payload always excluded                                                                                                                                                                                                                                                                                 |
| redirects        | direction, protocol_number, counterpart_agency, origin_protocolled_on, deadline_restored, redirected_at                                                                                                                         | direction, protocol_number, deadline_restored, redirected_at                                | direction, reason, protocol_number, ait_number, counterpart_agency, counterpart_renainf_code, origin_protocolled_on, deadline_restored, receipt_document_id, redirected_at, redirected_by                                                                                                                                                                        |
| assignments      | pool_id, member_id, assigned_at, released_at, active, claim_due_at, batch_id                                                                                                                                                    | pool_id, member_id, assigned_at, released_at, active, claim_due_at, batch_id                | Same S set plus assigned_by, release_reason                                                                                                                                                                                                                                                                                                                      |
| clocks           | clock_code, started_on, ceiling_on, flag, flag_changed_at, last_reset_at, legal_basis                                                                                                                                           | Same S set                                                                                  | Same S set                                                                                                                                                                                                                                                                                                                                                       |
| clock-alerts     | clock_id, level, raised_at, acknowledged_at, incident_ref                                                                                                                                                                       | Same S set                                                                                  | Same S set plus notified_role, acknowledged_by                                                                                                                                                                                                                                                                                                                   |
| batch-items      | batch_id, case_id, member_id only after batch/case qualification                                                                                                                                                                | Same S set                                                                                  | Same S set; any further existing functional fields require their typed distribution contract, not a merits DTO                                                                                                                                                                                                                                                   |
| impediments      | Deny generic procedural access; existing explicitly permitted functional impediment operation retains its own contract                                                                                                          | Deny generic details; operational assignment unavailability only from contracted projection | Existing authorized impediment functional operation only, no generic merits expansion                                                                                                                                                                                                                                                                            |

All listed fields were checked against generated CASE/WORKLIST entity interfaces
under their src/entities directories. Non-case organizational resources preserve
existing contracted functional DTOs; this table introduces no unrelated personnel
or organization data-minimization policy. Raw event payload and communication
content references are not needed to show lifecycle metadata. A future typed
projection requiring them needs its own closed contract; no arbitrary JSON escapes
this allowlist. A third-party classification absent from a source cannot be guessed:
sealed output suppresses that unqualified record until authoritative classification.

## CASE generated methods:56

`R` means GET collection and GET `/:id` (two entries), applying B plus the complete
role/purpose above and the resource projection below. `CUD` means POST collection,
PATCH `/:id`, DELETE `/:id` (three entries). Every current generated write is
classified explicitly; no legacy tenant-only path survives alongside a new handler.
The named blueprint operation controls remove dangerous generated bypasses; any
retained compatible write is implemented once with the existing action contract,
not a newly granted action. No unknown write field is accepted.

| Resource         | Expanded methods         | Parent and permitted read projection                                                                                               | CUD disposition                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cases            | R, PATCH id, DELETE id:4 | Self; purpose-specific metadata, triage, merits or operational projection. origin_case_id is another protected case                | Remove raw PATCH state/version/unit/ownership and lifecycle DELETE bypasses; lifecycle and creation remain commands. No current ordinary CASE PATCH field is independently qualified by this packet; remove raw PATCH/DELETE bypasses. origin_case_id remains immutable; lifecycle changes stay commands |
| admissibility    | R:2                      | case_id; only the four checklist criteria and permitted reasons/time                                                               | No generated writes; existing handwritten POST only                                                                                                                                                                                                                                                      |
| parties          | R+CUD:5                  | case_id; identity/legitimacy fields only for triage, otherwise purpose-projected party data                                        | Retain existing secretary/analyst action only with scoped source/target parent, strict permitted fields and existing rules; no generic authority-bearing ownership mutation                                                                                                                              |
| documents        | R+CUD:5                  | case_id; triage allowlisted evidence metadata, or purpose-projected document metadata; no generic storage key/download URL         | Preserve existing permitted document metadata contract with scoped parents; do not activate dossier upload/attachment/download or create a new action                                                                                                                                                    |
| pending-contents | R+CUD:5                  | case_id; required pending-content/procedural projection                                                                            | Scope any existing explicitly authorized compatible action; state/resolve effects remain resolve-pending command; no wildcard-created action                                                                                                                                                             |
| deadlines        | R+CUD:5                  | case_id; timer/deadline projection needed for the selected purpose                                                                 | Deadline-owner calculations remain authoritative; reject generic computed/legal-value mutation; existing administrative permission alone cannot override owner invariants                                                                                                                                |
| inquiries        | R+CUD:5                  | case_id; inquiry projection only for an authorized purpose                                                                         | Preserve existing inquiry contract only; no activation of inquiry UI. Lifecycle effects remain commands and source/target scope is mandatory                                                                                                                                                             |
| drafts           | R+CUD:5                  | case_id; Merits fields only for a complete merits purpose; S/O status-only projections follow the closed field table; never triage | No generic mutation of ready/signature/lifecycle effects; any existing explicitly permitted compatible draft operation retains its contract, no wildcard grant                                                                                                                                           |
| decisions        | R+CUD:5                  | case_id; authorized decision/supporting projection; secretary archive redaction applies                                            | No raw signed-decision creation, replacement or deletion bypass; signing stays decide command; no new signing activation                                                                                                                                                                                 |
| communications   | R+CUD:5                  | case_id; necessary procedural/archive projection                                                                                   | Existing secretary action only with duty and scoped source/target parents; no implied merits authority                                                                                                                                                                                                   |
| events           | R+CUD:5                  | case_id; projected case history/audit within purpose                                                                               | No generic append/rewrite/delete of command/audit evidence; command-owned append and historical immutability retained                                                                                                                                                                                    |
| redirects        | R+CUD:5                  | case_id AND receipt_document_id→document→case when both exist; require both accessible and consistent                              | Existing redirect command owns effect; no raw reparent/bypass. If no resolvable parent, deny generic read/write; preserve row for explicit recovery, do not delete                                                                                                                                       |

Total:4+2+(10×5)=56. Internal inquiry-documents, pending-documents,
withdrawal-attestations, priority-assessments and priority-bases have operations[]:
zero mounted methods; registration alone does not expose them. Their references
are still checked inside the parent command. Exact triage allowlists are specified
in the sibling T0 field map, not inferred from broad existing DTOs.

For every retained child POST, authorize the target case before insertion; for
PATCH, load/lock source, resolve all existing parent links and authorize both source
and target after proposed changes. Changing a foreign key cannot make an unreadable
case readable. An absent source row returns the same404 as unauthorized. Immutable
ownership, state, computed fields and audit history are rejected even for a reader
with an independent write permission. Referential tenant checks are transactional.

### Closed raw-write field disposition

Existing action permission remains necessary and does not make every DTO field
writable. The following is the candidate non-workflow field boundary for the
scoped compatible handler; all other fields are rejected. It never activates a
previously unavailable UI action. Public generated lifecycle DELETE routes are
removed where they bypass command history; retained ordinary child metadata delete
requires its existing explicit permission, scoped source and no referenced
immutable command/audit artifact. State transitions remain command-owned.

| Resource         | Ordinary writable existing fields, subject to existing business validation                                                              | Protected fields / disposition                                                                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cases            | No ordinary field in the current DTO is independently qualified for raw update by the approved packet                                   | id, tenant, AIT/origin/protocol/intake provenance, unit/jurisdiction, state/version, priority, timestamps, archive/suspensive/pending/rejection/withdrawal fields remain command/owner controlled. A future sourced non-workflow field can retain an ordinary update contract; do not invent one now |
| parties          | role, legitimacy_basis, person_name, document_number, contact_email, representation_kind; case_id only with source+target authorization | representation_verified and representation_document_id must satisfy existing verified-representation rule; no generic assertion of verified authority                                                                                                                                                |
| documents        | filename; case_id only if existing metadata operation permits reparent and source+target checks pass                                    | storage_key, content_hash, kind/origin provenance, attached_by/at and digitisation evidence are not rewritten as ordinary metadata; no attachment activation                                                                                                                                         |
| pending-contents | None                                                                                                                                    | missing_items/due/outcome and lifecycle timestamps remain pending-content owner/resolve command                                                                                                                                                                                                      |
| deadlines        | None                                                                                                                                    | All calculated deadline/legal/counting values remain deadline-owner controlled                                                                                                                                                                                                                       |
| inquiries        | None in this packet                                                                                                                     | Preserve existing inquiry operation contract through its authorized owner; no generic lifecycle substitute or inquiry activation                                                                                                                                                                     |
| drafts           | None in this packet                                                                                                                     | Existing draft owner contract remains; ready/return/signature/workflow fields not raw writable                                                                                                                                                                                                       |
| decisions        | None                                                                                                                                    | Signed decision and publication history command-owned                                                                                                                                                                                                                                                |
| communications   | None in this packet                                                                                                                     | Existing communication owner contract remains; sent/effective/deadline/proof fields not generic mutable metadata                                                                                                                                                                                     |
| events           | None                                                                                                                                    | Append-only command/audit evidence                                                                                                                                                                                                                                                                   |
| redirects        | None                                                                                                                                    | Redirect command and trusted receipt parent own effect/provenance                                                                                                                                                                                                                                    |
| admissibility    | No generated write                                                                                                                      | Existing typed checklist command only                                                                                                                                                                                                                                                                |

This table records no blanket new prohibition on other accepted owner commands.
If an existing public ordinary operation needs additional sourced non-workflow
fields for its accepted contract, record that exact compatibility correction before
replacing it; neither an unrestricted DTO fallback nor a falsely passing positive
is acceptable. Every accepted source+target child association still requires the
full parent predicates and cannot mutate case ownership.

## CASE handwritten methods:17

All entries below are POST. B, exact existing action permission and command guards
apply in addition to the stated parent. Scope reads do not grant these actions.
Replay reauthorizes that same action and full case scope before returning stored
response; legacy actorless replay with untrustworthy provenance returns safe409.

| Path                               | Existing action / actor boundary           | Scope and parent resolution                                                                                                                                                 |
| ---------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cases                              | protocol / secretary                       | Authorized intake unit/pool and legitimacy/protocol contract; validate every referenced existing record before new case exists                                              |
| cases/:id/commands/triage          | triage / analyst or secretary              | Self, admissibility purpose, PROTOCOLADO                                                                                                                                    |
| admissibility                      | create / analyst or secretary              | payload.case_id, admissibility purpose, TRIAGEM_ADMISSIBILIDADE; preserve existing If-Match contract                                                                        |
| cases/:id/commands/admit           | admit / analyst                            | Self, admissibility purpose and existing complete checklist guards                                                                                                          |
| cases/:id/commands/non-admission   | reject / analyst                           | Self, admissibility purpose and existing rejection foundation guards                                                                                                        |
| cases/:id/commands/remit           | remit-jari / secretary                     | Self plus authorized procedural duty; existing admissible instance/state guards                                                                                             |
| cases/:id/commands/receive         | receive-judging-body / secretary           | Self plus authorized receiving-body duty; existing JARI/CETRAN body and state guards; never defense shortcut                                                                |
| cases/:id/commands/ready           | submit-draft / analyst                     | Self own active assignment; draftId→draft→same case                                                                                                                         |
| cases/:id/commands/decide          | sign / signing authority                   | Self, ready decision and verified jurisdiction/appointment/duty; existing signature guards                                                                                  |
| cases/:id/commands/return-draft    | return-draft / signing authority           | Self same decision scope, draftId→draft→same case                                                                                                                           |
| cases/:id/commands/withdraw        | withdraw / secretary                       | Self procedural duty; withdrawalDocumentId→document→same case and verified withdrawal contract                                                                              |
| cases/:id/commands/redirect        | redirect / secretary                       | Self procedural/triage duty; receiptDocumentId→document→authorized consistent case; unresolved parent denies                                                                |
| cases/:id/commands/resolve-pending | resolve-pending-content / secretary        | Self triage/procedural duty; pendingId and every documentId resolve to same authorized case                                                                                 |
| pools/:id/claim-next               | claim-next / analyst                       | Server-resolved eligible pool/member/unit, no caller-selected case; atomic new-case path or approved trusted legacy compatibility; returned case becomes own assignment     |
| inquiries/:id/commands/answer      | answer-inquiry / analyst or rapporteur     | inquiry→case, complete assigned/session purpose and existing command actor rules                                                                                            |
| inquiries/:id/commands/extend      | extend-inquiry / analyst or rapporteur     | Same parent and existing extension/calendar guards                                                                                                                          |
| inquiries/:id/commands/expire      | expire / public execution always forbidden | Public service execute rejects expire403; retain that rejection. Internal executeTimer requires its existing qualified timer effect and parent, not a new public role grant |

Controllers are the authoritative transport names; action/decorator differences
must remain visible to tests rather than be normalized into a new permission.
The new GET claim-context adds one future method, excluded from the107-current
count; its metadata/projection and predicates are exactly ADR0045. Existing
versioned commands retain If-Match; only claim rejects supplied If-Match400.

## WORKLIST generated methods:26

Each row expands to GET collection and GET `/:id`. B and the complete applicable
role/purpose are applied before pagination. Non-case resources do not grant access
to cases by association. Existing non-case functional contracts stay intact;
responses exclude embedded case identifiers/details not authorized independently.

| Resource          | Parent chain / server boundary                                                            | Projection and complete-purpose rule                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| units             | Self tenant unit                                                                          | Existing scoped organizational metadata; no case expansion                                                                                         |
| pools             | pool→unit                                                                                 | Authorized organizational/pool metadata; never eligible-pool inference; claim-context owns eligibility                                             |
| pool-members      | member→pool→unit; person_id canonical user                                                | Existing personnel/duty projection under its functional permission; membership alone grants no merits                                              |
| schedules         | schedule→member AND pool→unit                                                             | Existing scoped schedule projection; no cross-pool member join                                                                                     |
| schedule-slots    | slot→schedule→member/pool/unit                                                            | Same schedule boundary                                                                                                                             |
| substitute-duties | duty→member→pool→unit                                                                     | Existing scoped duty projection and provenance; no scope inferred from expired substitution                                                        |
| benches           | bench.session_id→session; verified chair_member_id/participants and case agenda relations | Existing bench metadata; no unfiltered case/session expansion or inferred presidency                                                               |
| batches           | batch→pool→unit; children→cases                                                           | Existing scoped distribution metadata; redact/filter unauthorized child IDs and totals; parent access does not grant every child case              |
| batch-items       | item→batch→pool AND case; member→same pool if present                                     | Require authorized batch purpose plus complete case predicate; no other-case identity leakage                                                      |
| assignments       | assignment→case AND pool/member                                                           | Complete case predicate and purpose-projected assignment; active-own assignment proves analyst/rapporteur purpose, not arbitrary other assignments |
| impediments       | impediment→case AND member→pool                                                           | Own/existing authorized functional impediment purpose; do not expose other-case identities or impediment details through mere pool access          |
| clocks            | clock→case                                                                                | Complete case predicate; only timer/deadline fields allowed for that purpose                                                                       |
| clock-alerts      | alert→clock→case                                                                          | Complete case predicate; manager gets operational alert projection, not petition/merits                                                            |

Snapshot and minutes-manifest resources have operations[] and add zero methods.
No count endpoint exists; any count later exposed must use the identical SQL
predicate, not tenant totals. Empty authorized child set is not a license to return
all children or to disclose aggregate hidden-case counts.

## WORKLIST handwritten methods:8

All entries are POST, with existing action/decorator and body/state rules retained.
D11 authorizes adding scope checks to these files; it does not enable a new action.

| Path                                 | Complete parent and action boundary                                                                                                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schedules                            | Existing create permission and scoped pool/member; no case expansion                                                                                                                         |
| schedules/:id/publish                | Existing publish permission, schedule→pool/member authorized and matching; retain If-Match                                                                                                   |
| batches                              | Existing create permission; authorized distribution pool; proposed cases individually qualified before association                                                                           |
| batches/:id/approve                  | Existing approve permission, active relevant chair, batch→pool plus each affected case; no blanket child grant                                                                               |
| batches/:id/items/:caseId/accept     | Existing accept permission, batch/item consistency, target case and authorized assigned rapporteur; validate member/pool relation                                                            |
| batches/:id/items/:caseId/impediment | Existing impediment permission, same batch/item/case and actor relationship; no new impediment command from analyst UI                                                                       |
| batches/:id/commands/draw            | Existing draw permission, authorized procedural distribution duty; every selected case and target member/pool qualified inside transaction                                                   |
| assignments/:id/commands/reassign    | Existing reassign permission and operational remit; assignment→source case/pool/member and proposed target member/pool authorized; a manager's operational action is not a full-merits grant |

Total current surface:56+17+26+8=107 methods. Source anchors:
CASE/WORKLIST `src/controllers/*.controller.ts`, generated modules,
`src/handwritten/*commands.controller.ts`, blueprint `api` operations and entity
foreign keys. Mounted-method counting excludes decoratorless internal classes.
Effective command grants are determined by isDetranActionAllowed, not just the
legacy command matrix; see the corrected register below. Existing grants are
preserved and no command permission change is authorized by this read amendment.

## Verification obligations and remaining evidence boundary

The Inspector expands every grouped row into method-specific positive/negative
HTTP evidence. Required cases include complete-role positives; mixed-role,
revoked/absent binding and impediment negatives; pagination/total non-disclosure;
source/target reparent and inconsistent dual-parent negatives; raw state/version/
assignment/audit mutation denial; by-ID/list parity; parentless redirects;
unauthorized replay; /arquivo third-party suppression; /auditoria event scope;
manager operational success without merits; session/vista and signer qualification;
legacy assigned exclusion and untrusted legacy recovery409. Actual HTTP+DB is
required; metadata inspection or fake repositories cannot prove enforcement.

This closes the route/purpose/parent design classification. Production qualification
of identity, bindings, sessions/mandates, risk inputs and legacy provenance remains
a release gate with receipts; absence does not prohibit controlled tenant-fixture
RED/implementation testing. A missing or ambiguous relationship denies the affected
request and is reported, never guessed. Exact triage field/class closure is the
separate T0 field map. No production provisioning, role expansion, protocol change,
new deadlines or thresholds, runtime implementation or scorecard result is asserted.

## Effective mounted action register

Baseline policy.ts:1899–1943 order is: principal/resource/action present; special
DPO retention constraint; protocol secretary-only special case; disabled keys;
RAIT_STRICT_COMMAND_RULES; OPS strict; explicit permission/resource wildcard or
star; OPS parameter special case; global admin; ordinary matrix. For the RAIT
commands below, strict rules precede wildcard/admin and ordinary command rows.

| Actual mounted path / resource:action                                  | Effective exact canonical roles            | Controlling source                              |
| ---------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| POST batches / rait-batch:create                                       | rait-secretary                             | RAIT strict                                     |
| POST batches/:id/approve / rait-batch:approve                          | rait-chair                                 | RAIT strict                                     |
| POST batches/:id/items/:caseId/accept / rait-batch-item:accept         | rait-rapporteur                            | RAIT strict                                     |
| POST batches/:id/items/:caseId/impediment / rait-batch-item:impediment | rait-rapporteur                            | RAIT strict                                     |
| POST batches/:id/commands/draw / rait-batch:draw                       | rait-secretary                             | RAIT strict                                     |
| POST schedules / rait-schedule:create                                  | rait-coordinator                           | RAIT strict                                     |
| POST schedules/:id/publish / rait-schedule:publish                     | rait-coordinator ONLY                      | RAIT strict overrides legacy matrix chair entry |
| POST assignments/:id/commands/reassign / rait-assignment:reassign      | rait-coordinator, rait-manager, rait-chair | RAIT strict                                     |

These mounted pairs are already granted to their exact strict roles; there is no
create/open or item accept/impediment obstruction. A chair-only principal cannot
publish a schedule. The command scope/parent checks still apply after the grant.
Do not add command grants to normalize an obsolete matrix observation.

## Exact new read rows and retained-write role matrix

Each new read row uses the actual controller resource with action read and only
the role set below. Each is intersected with the complete purpose/scope/projection
above, never a standalone broad read. A role absent here gets no new ordinary
grant; existing explicit/admin reach still cannot bypass case scope. The existing
RAIT surface rows remain subject to the same purpose predicates.

| New ordinary resource:read pair | Exact role set / purpose                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rait-pending-content:read       | rait-analyst (triage/assigned), rait-secretary (triage/procedural), rait-coordinator and AUDITOR (bound oversight; AUDITOR sealed archive separately), rait-manager (operational), rait-rapporteur (assigned/session), rait-chair (bound presidency), rait-signing-authority (qualified decision), rait-central-authority (designated appeal review) |
| rait-draft:read                 | rait-analyst (assigned), rait-coordinator and AUDITOR (bound oversight), rait-manager (status only), rait-rapporteur (assigned/session), rait-chair (bound presidency), rait-signing-authority (qualified decision), rait-central-authority (designated appeal review), rait-secretary (S status only)                                               |
| rait-redirect:read              | rait-analyst (triage/assigned), rait-secretary (procedural), rait-coordinator and AUDITOR (bound oversight/archive), rait-manager (operational), rait-rapporteur (assigned/session), rait-chair (bound presidency), rait-signing-authority (qualified decision), rait-central-authority (designated appeal review)                                   |
| rait-batch:read                 | rait-secretary (distribution), rait-chair (bound presidency), rait-rapporteur (own relevant batch), rait-coordinator and AUDITOR (bound oversight), rait-manager (operational)                                                                                                                                                                       |
| rait-batch-item:read            | Same six exact roles as batch, requiring both batch purpose AND the complete case predicate; hidden child identifiers/counts suppressed                                                                                                                                                                                                              |
| rait-unit:read                  | No new ordinary row; preserve existing effective explicit/admin-only access and current functional contract; no new merits or organization grant                                                                                                                                                                                                     |
| rait-schedule:read              | No new ordinary row in this amendment; preserve existing effective explicit/admin-only access. Claim-context resolves schedule server-side, not generic schedule listing                                                                                                                                                                             |
| rait-schedule-slot:read         | No new ordinary row; same existing access, no new personnel grant                                                                                                                                                                                                                                                                                    |
| rait-substitute-duty:read       | No new ordinary row; same existing access, no new duty grant                                                                                                                                                                                                                                                                                         |
| rait-bench:read                 | No new ordinary row; same existing access. Qualified session/bench relation is consumed by trusted server provider, not an inferred generic read grant                                                                                                                                                                                               |

Non-case organizational read grants are outside D8's case-projection repair.
If an accepted UI journey later needs one of these uncommissioned ordinary rows,
source and approve that exact functional grant separately; this packet neither
claims that uncommissioned journey working nor invents its roles.

| Retained generic method/resource                        | Exact existing ordinary roles / complete purpose and field boundary                                                                                                                                                                            |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST/PATCH parties                                      | rait-secretary, rait-analyst; procedural/triage or assigned purpose; closed ordinary party fields; source+target parents                                                                                                                       |
| POST/PATCH documents                                    | rait-analyst, rait-secretary, rait-coordinator, rait-rapporteur, rait-chair; complete case purpose plus actual create/update action; filename-only ordinary update, existing owner attachment contract not activated; source+target parents    |
| POST/PATCH inquiries                                    | rait-analyst, rait-rapporteur; complete assigned/session purpose; owner-command lifecycle only, no generic workflow bypass                                                                                                                     |
| POST/PATCH deadlines                                    | agency-admin ordinary matrix grant remains; calculated/legal fields owner-controlled, so no generic calculated-value mutation accepted; no case-merits admin fallback                                                                          |
| POST/PATCH events                                       | agency-admin ordinary matrix grant remains; append/rewrite is blocked as command/audit-owner effect; no mutable historical evidence                                                                                                            |
| POST/PATCH communications                               | rait-secretary; procedural duty and existing communication owner contract, not unrestricted DTO mutation                                                                                                                                       |
| POST/PATCH decisions                                    | rait-signing-authority, rait-chair; qualified decision/presidency purpose; signed lifecycle remains commands, no raw signing grant                                                                                                             |
| PATCH cases                                             | rait-analyst, rait-secretary, rait-coordinator, rait-rapporteur, rait-chair; complete case purpose and action; current workflow/provenance fields blocked as classified above                                                                  |
| POST/PATCH pending-contents, drafts, redirects          | No ordinary RAIT surface write row; existing explicit/admin reach never supplies a missing owner command or bypasses scope; command-owned effects only                                                                                         |
| DELETE every generated CASE resource that mounts DELETE | technical-admin ordinary matrix grant remains; scope and owner immutability still required; lifecycle/audit/referenced immutable deletion bypasses removed, ordinary child metadata delete only if existing independent owner contract permits |
| clocks and clock-alerts                                 | Generated GET only: no POST/PATCH/DELETE is mounted. agency-admin clock create/update policy entries do not create routes; calculated clock mutations remain owner-controlled                                                                  |

This matrix distinguishes preservation of the effective permission rule from
removal of an unsafe generated effect. It does not silently revoke existing
command behavior, change RAIT strict grants, or treat a raw mutation denial as
proof that the accepted owner command works. Inspector positives must prove those
commands separately; bypass negatives prove the raw route cannot replace them.

The supplemental routing/legacy lifecycle is ADR0047/48: CASE's named internal
writers and blueprint-only records provide exact links and versioned dispositions.
Protocol/admit attempt only qualified unambiguous routing, never add a legal
admissibility condition; unresolved candidate sets fail CASE_POOL_UNRESOLVED409,
not hidden omission. Scoped raw clock reads retain stored chronology; current
risk is separately read through the typed scoped cases/:id/risk operation under
the same case predicate. No stored flag/flag_changed_at is presented as a fresh
evaluation, and no flag publication is commissioned by this packet.

### Exact outcomes for restricted generic writes

Permission success is not a successful mutation. Missing action/purpose denies403
or scoped parent404 before body validation. For an authorized role/parent:

| Generic request                                 | Defined outcome in this packet                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST documents                                  | No viable allowed generic create body: only filename is ordinary metadata, while protected kind/origin/storage/hash are required by storage. Reject protected/unknown keys400 VALIDATION_FAILED; filename-only incomplete create400, no row/effect. Protocol remains the existing document-creation owner; upload stays unavailable |
| PATCH documents                                 | filename-only metadata edit may succeed for the qualified existing writer; changing any other/protected field400, no effects                                                                                                                                                                                                        |
| POST/PATCH decisions, communications, inquiries | Closed generic writable set is empty; reject any supplied mutation field400 VALIDATION_FAILED, and reject an empty no-op body400. Preserve existing owner commands/contracts and their actual roles; this raw endpoint is not an alternate command                                                                                  |
| PATCH cases                                     | Remove the generic operation through blueprint controls: expected404 for PATCH, no handler/effect for any role. No current ordinary writable field is qualified; actual versioned commands remain the positive path                                                                                                                 |

No silent200/no-op success. Inspector asserts these exact negatives and separately
proves the authorized owner-command positives; protected fields are not admitted
just to satisfy the old full create DTO. These are explicit bypass removals under
P4-02 T2, not revocation of the underlying permission rule or a new business action.
