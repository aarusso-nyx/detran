# P4-02 — route, scope and source preflight

Architect, Article7. Owner authorization received 2026-10-18:

> I approve P4-02. Check CI on PR #198, fix any failures, and merge once required checks are green. Then execute the approved wiring packet, preserving local and scorecard work.

This authorizes P4-02 after PR198 merges, subject to its T0 stop conditions.
The earlier “prepared for review / runtime paused” wording is historical; it does
not cancel this approval. The approved scope, security boundaries and acceptance
matrix remain binding. Implementation PR merge, broader runtime and round closure
remain separate. R-0025 stays open; scorecard evaluation stays independent.

## Baseline and disposition

Main `b41d8c15ddd92b587f965fc1494ca9df3f51b717` includes PR198 head
`12baf6ad09737e10a6a130eb40ca78b8c175fd6a`. All five required checks passed before merge, including
foundation and verified-local-rc; backend-kernel and BOAT real-document checks
also passed. No CI correction was needed. Merge verified at 2026-10-19T01:23:30Z.
Source hashes from the reviewed head were reverified against merged main.

T0 was executed as a read-only source and disposable-fixture inventory. It found
blocking shared-role predicates and legacy compatibility gaps. T1–T6 have not been
executed; no runtime, tests, blueprints, generated outputs, schema, proof chain or
round state were modified. A reviewable preflight is delivered without asserting
wiring or acceptance completion. The actual production database was not accessed.
Missing production inventory is recorded as unknown, never inferred from fixtures.

## Mounted HTTP inventory

Application imports CASE and WORKLIST at backend/app/src/app.module.ts:896.
Generated controller registration is in the respective module files; handwritten
controllers are mounted alongside them. All paths below use /v1/inf/rait.

| CASE resource | Mounted generated methods | Case parent / boundary |
| --- | --- | --- |
| cases | GET collection, GET id, PATCH id, DELETE id | The case; origin_case_id also references another case |
| admissibility | GET collection, GET id | case_id; POST is a handwritten command |
| parties, documents, pending-contents, deadlines, inquiries, drafts, decisions, communications, events | GET collection, GET id, POST collection, PATCH id, DELETE id | case_id; reparenting must check old and target case |
| redirects | Same five CRUD methods | Nullable case_id; receipt_document_id → document → case; parentless disposition requires explicit classification |
| inquiry-documents, pending-documents, withdrawal-attestations, priority-assessments, priority-bases | None: operations[] | Internal; controller registration does not create an HTTP method |

This is 56 generated CASE methods plus17 handwritten POST methods (73 total).
Handwritten routes are protocol at cases; cases/:id/commands/{triage,admit,
non-admission,remit,receive,ready,decide,return-draft,withdraw,redirect,resolve-pending};
pools/:id/claim-next; admissibility; and inquiries/:id/commands/{answer,extend,expire}.
Sources: CASE handwritten rait-case-commands.controller.ts:36–246,
rait-admissibility-commands.controller.ts:21 and rait-inquiry-commands.controller.ts:39–69.

WORKLIST mounts GET collection/id for13 resources (26 methods): units, pools,
pool-members, schedules, schedule-slots, batches, batch-items, assignments,
impediments, substitute-duties, benches, clocks and clock-alerts. Internal snapshot
and manifest operations are empty. Handwritten POST routes are schedules,
schedules/:id/publish, batches, batches/:id/approve,
batches/:id/items/:caseId/{accept,impediment}, batches/:id/commands/draw,
assignments/:id/commands/reassign (rait-worklist-commands.controller.ts:21–152).

| WORKLIST case-bearing resource | Parent chain | Required disposition |
| --- | --- | --- |
| assignments | case_id; pool/member references | Scope reads and command-owned reassignment |
| clocks | case_id | Scope before list pagination/by-ID |
| clock-alerts | clock_id → clock → case_id | Resolve complete parent chain |
| batch-items | case_id; batch/member | Include in scope proof; cannot omit because UI does not use it |
| impediments | case_id; member | Include in scope proof; protect other-case identities |
| batches | pool; items/assignments reference cases | Preserve existing batch-role contract; classify children and batch projection |

The approved named WORKLIST paths cover assignments/clocks/alerts, but the no-bypass
requirement also reaches batch-items/impediments and their command parents. Those
reads fit the approved case-derived WORKLIST scoped-handler paths. Changes to
existing WORKLIST command service/controller need explicit path clarification or
amendment because those files are not named in the packet.
No new count route is mounted. Client totals are derived from fetched arrays;
absence of a count route does not make those arrays safe.

## Effective-role / purpose / projection / SQL classification

Shared policy source: backend/domains/shared/src/policy.ts:1378–1454.
Its15 read roles are ten RAIT staff roles plus agency-admin, AUDITOR, bi-analyst,
integration-operator and traffic-authority. Mapped surfaces include case, party,
document, admissibility, deadline, inquiry, decision, communication, event and
WORKLIST assignment/clock/alert. Pending-content, redirect, draft and batch-item
lack ordinary surface rules, but explicit permissions/wildcards and global admins
still reach mounted routes (policy.ts:1755–1760,1929–1943). A missing surface rule
is not proof that a route is unreachable. Shared policy is outside this packet.

| Effective actor/purpose | Approved projection / predicate | Current route status |
| --- | --- | --- |
| Eligible analyst collective queue | Minimal ADR0045 metadata; active analyst membership + matching unit/defense pool; tenant and impediment exclusion | New claim-context absent; generic case list is not an eligibility source |
| Analyst/secretary pre-admission triage | PROTOCOLADO/TRIAGEM_ADMISSIBILIDADE, matching active unit/pool membership, existing triage permission; only necessary triage fields | Existing reads tenant-only; must preserve this positive before assignment |
| Assigned analyst merits | Active own assignment + authorized pool/unit + tenant + no impediment | Generic reads do not apply this predicate |
| Coordinator/AUDITOR oversight | Explicit active actor-role unit OR pool binding + read permission + no impediment | Accepted ADR0046; internal binding not implemented; absent binding denies |
| Rapporteur assigned case | JW-07:11,53 names assigned-case purpose | Requires full source-equivalent predicate/classification before shared handler replacement |
| Secretary sealed archive/retention | JW-04:18 names purpose; archive uses case/documents/decisions/communications/events | No sourced exact actor→unit/pool scope for closed-case merits; cannot silently deny or grant triage-based access |
| Signing/central authorities, chair, manager and remaining shared readers/admins | Existing journey/action grants do not by themselves define individual case scope | Incomplete matrix; no role-only fallback and no silent accepted-journey revocation |

Generated CASE repository rait-case.repository.ts:54–80 fetches tenant rows with
select* / created_at / limit500 and by-ID lookup. WORKLIST clock-alert repository
uses the same pattern. Actor/purpose/assignment/impediment/parent SQL predicates
are absent; filtering arrays in the browser occurs after disclosure. CASE PATCH
accepts state/version/unit_id/origin_case_id and other ownership-relevant fields
(repository:16–44). Child PATCH accepts case_id. DELETE and privileged calls also
need an explicit compatible disposition. The intended replacement is server SQL
before pagination and source+target parent checks, never a parallel scoped route
beside an unrestricted legacy route. Until each effective role has a complete
sourced predicate, T0 cannot certify the required per-route/per-role matrix.

/auditoria loads generic events (audit.facade.ts:30–32). /arquivo search/retention
loads generic cases and sealed dossier loads cases/documents/decisions/
communications/events (archive.facade.ts:26–37,60–74,86–94). Route manifest:843–920
admits secretary/AUDITOR archive and AUDITOR audit. JW-12:10–12 requires audit by
case/period and sealed dossiers with third-party suppression. The dated D3
amendment narrows AUDITOR's historical “read everything”; it does not supply the
secretary's post-admission archive scope.

## Triage field boundary

UC-RAIT-002 and IU-RAIT-008 §§4/8 establish case state, server-calculated
admissibility deadline/verdict, legitimate-party/procuration verification,
signature and compatible-request verdicts/reasons. Current form triagem.schema.ts
has three editable criteria and readonly timeliness; rejection carries the existing
reason/foundation. CaseFacade.loadCaseBundle also loads parties/clocks/deadlines;
loadAdmissibility loads checklist rows. That existing broad fetch is not a field
allowlist. IU008 excludes free petition text outside instruction and suppresses
third parties. NA/NP/AIT absence cannot reject admission; no generic document
merits or all-document download permission follows. Exact projected identity/
procuration evidence fields and document classes still need a closed source map
before T2; unknown fields must remain unexposed, without inventing a product rule.

## Identity, priority, risk and coordinator-source classification

- Authenticated actor exists: runtime detran-runtime.ts:785–795 checks
  auth.memberships.user_id and:928 supplies actorId from userId; CASE service:984–991
  and1031 checks authenticated principal.id against context.actorId for existing
  admissibility/protocol audit checks; this is not yet a universal claim guard. OIDC subjects
  are separate auth.users columns (02-auth.sql:38–39). Existing RAIT queries compare
  pool-member.person_id directly to actorId (CASE service:632–639,1973). The plain
  UUID person_id has no explicit authoritative user/person bridge. Fixtures and
  code equality are not production identity qualification. Never compare a raw
  external subject to a person UUID by assumption.
- Priority has an authoritative source: 19-rait-priority-enforce.sql:136–221,
  inf.rait_record_initial_priority and assessment/proof projection, called by CASE
  service:715. ADR0037's risk-first / PCD=80+ /60+/none /NULL-excluded order remains
  binding. Current claim:2026 lacks risk ordering and NULL exclusion; these are
  implementation defects to repair once prerequisites are available, not policy
  questions to reopen.
- Prescription risk lacks a current authoritative producer/freshness contract.
  WORKLIST clock flag fields/defaults are not a calculation. Dashboard's
  prescription-risk.projection.ts:1 explicitly records missing producer OD-D17,
  and no RAIT publisher was found. Dashboard consumes events; it is not the owner
  of deadline/risk calculation. Do not treat default/seeded SEM_RISCO as assessed
  risk, derive new thresholds or invent cross-clock aggregation. Deadline source
  reuse and any additional owned producer paths require a bounded amendment.
- Active coordinator membership supplies pool containment and status revocation,
  but mandate/appointment provenance is nullable (WORKLIST blueprint:214–274,
  350–351). Seed20 coordinator has no mandatory authorization reference.
  requirePoolBinding(:1232–1247) does not require coordinator role/provenance.
  Therefore ordinary memberships are not equivalent to ADR0046 bindings as-is.
  Use the approved explicit internal binding model, without a duplicate qualified
  source or automatic migration; an equivalent-source reuse proposal needs a
  supplemental ADR. No membership becomes unit-wide permission. No new production
  binding/personnel seed is authorized.

## Legacy and environment inventory — bounded observation

Only the already running detran-r0025-jw01 disposable PostgreSQL container was
queried, using BEGIN READ ONLY / ROLLBACK. No stack reset, application request-path
owner context, data update, record deletion or production access occurred.
Database detran_r7_ctg1_a2 contains one defense DISTRIBUIDO case with one joined
assignment;11 idempotency rows;6 clocks. The11-row replay aggregate counted zero
root-level actor/assignment keys; this does not classify all records as claim or
prove no nested provenance. CASE seed20:33 deliberately creates a DISTRIBUIDO
fixture. This is test data, not deployed inventory or approved compatibility.

Current claim fingerprint omits actor (CASE service:220–234,780–805), while old
idempotency storage has fingerprint/response and no actor column. Claim replay
precedes selection. The approved409 fail-closed policy for untrustworthy actorless
records remains; no old record is rewritten, expired/deleted or attributed by guess.
A separate trusted inventory is still required to establish deployed DISTRIBUIDO
provenance and its explicit compatibility/migration decision. Do not quietly drop
those rows from selection or convert them to make a new test pass. Production
inventory access/provisioning is not inferred from access to local fixtures.

## Smallest recommended unblock sequence — proposals, not approvals

1. Complete one route/role security amendment: classify WORKLIST batch-items/
   impediments within the owned scoped-read paths, clarify any extra parent command
   service/controller paths, and source/approve the missing
   secretary/archive and other shared-role predicates, raw writes and parentless
   redirects. Preserve assigned rapporteur and accepted other-role journeys.
   Retain ADR0046 explicit oversight bindings; no automatic coordinator conversion.
2. Establish the canonical authenticated-user/person mapping contract and identify
   its authoritative operational input. Source the deadline-owned risk producer,
   freshness and case ordering interpretation without changing approved priority,
   legal deadlines or thresholds. Name any extra owned paths in that amendment.
3. Obtain a trusted deployed legacy inventory and approve a bounded compatibility/
   recovery disposition. Preserve all rows and receipts meanwhile; use the already
   approved safe409 for untrustworthy replay, never automatic re-claim.
4. After those T0 conditions pass, run T1 RED before T2, then T3–T6 exactly as
   approved. No claim UI activation, full-JW01 PASS or round closure in this report.

These are implementation prerequisites exposed by the approved preflight, not a
request to repeat approval of P4-02 or D1–D7. Unknown production facts require
operational evidence; a new role grant or legacy behavior requires explicit
approval, rather than an agent filling the gap implicitly.

## Preservation and verification

The primary checkout remains in its concurrent scorecard lane. Starting local
ref names are retained, and SHA256 matches for .mcp.json, .codex/config.toml and
.claude/settings.local.json were checked against the task-start snapshot. No
checkout/stash/reset/clean, recovery removal or primary file write was performed.
Committed filename metadata now also includes a separate scorecard ADR0045
(whole-source-local-coverage); its content was not read/imported/modified. Only
PR198 was open at this observation. ADR0035 first-parent-main precedence governs
that pending integration collision; no scorecard renumbering is performed here.
The T0 source-freeze receipt records91 inspected file hashes; the fixture receipt
contains aggregate counts only. Neither is a DEVAI proof-chain entry.

The accompanying validation receipt distinguishes documentation checks from
unexecuted runtime acceptance. Historical packets and accepted ADRs remain intact;
no task/state/proof records are hand-edited. No scorecard evidence/readiness claim
is made by this preflight.
