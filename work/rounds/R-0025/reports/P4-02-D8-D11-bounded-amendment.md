# P4-02 amendment A1 — approved D8–D11, closed T0 and bounded prerequisites

Architect, Constitution Article7. Base main ad20e168 (PR199). This is the exact
supplemental contract packet for review; **no runtime or Inspector dispatch in
this PR**. Owner approved D8–D11 and requested decisions/ADRs, this amendment,
finished T0 mapping and a review PR while preserving local and scorecard work.
The base P4-02 approval is retained; D1–D7 are not reopened. This amendment
supersedes only the named design gaps and path exclusions below. Runtime resumes
through reviewed integration/explicit dispatch, not by reading a historical banner.
No new round, lifecycle closure, whole-JW01 or scorecard PASS is declared.

## 1. Effective sources and T0 completion

- ADR0047: approved D8 role-purpose boundaries, D9 canonical staff identity and
  explicit scope/parent records; supplements ADR0046 without editing history.
- ADR0048: D10 legacy compatibility; new ADMITIDO v+2, qualified unassigned
  DISTRIBUIDO v+1, existing assignment preserved, ambiguous legacy recovery hold.
- ADR0049: D11 authoritative current-risk calculation/producer composition;
  existing worst-clock-first and approved thresholds, no new legal choice.
- [Access/parent map](../contracts/P4-02-T0-access-map.md): every one of107
  current methods (56+17 CASE,26+8 WORKLIST), complete role-purpose predicates,
  parent chains, read projections, raw-write/reparenting/replay dispositions.
- [Triage field/class map](../contracts/P4-02-T0-triage-fields.md): exact needed
  fields, four criteria, existing party/representation tokens, verified document
  classes, explicit exclusions and missing-source behavior. Open document.kind
  is never treated as a semantic enum or proof of class/signature.

These close T0 design/source classification. Original inventory's missing role
policy and internal field-map work are resolved by D8 and these contracts. It
remains true that controls and production evidence are unimplemented/unqualified.
Operational identity, role/routing bindings, document verification, risk parameters
and deployed legacy disposition remain release inputs. Missing production rows
correctly deny affected requests and do not prohibit controlled tenant-fixture
RED tests. A fully scoped binding is not proof of a live institutional appointment.

## 2. Exact supplemental ownership for later implementation

Base P4-02 §3 ownership remains, with only these explicit additions. No file in
this table is changed as runtime by this documentation PR.

| Discipline | Additional owned paths | Exact purpose / prohibition |
| --- | --- | --- |
| Architect | New supplemental ADRs, their two indexes, Owner-decision addenda and these R-0025 contracts/reports/reviews | Record approved design and bounded sources; never rewrite accepted ADRs, task/state/proof or scorecard records |
| Engineer — public pure calculation | backend/domains/inf/deadlines/src/rait-risk.ts and src/index.ts | Typed current-risk evaluation/export; reuse public clock/calendar/date/catalogue interfaces; no DB/job/external calls or change to existing deadline engine semantics |
| Engineer — CASE risk/scopes | backend/domains/inf/rait-case/src/handwritten/rait-case-risk.service.ts and rait-risk.port.ts, plus already owned scope/claim files | Server snapshot and transaction port, canonical identity, internal read/routing binding guards; no WORKLIST dependency or duplicated mutation rules |
| Engineer — WORKLIST | src/handwritten/rait-risk-producer.service.ts, existing rait-worklist-command.service.ts and rait-worklist-commands.controller.ts under backend/domains/inf/rait-worklist | Persist qualified risk changes through transaction port; source/target parent checks on existing commands; no new role command grant, notification/escalation or full scheduled sweeper |
| Engineer — composition | backend/app/src/rait-risk.providers.ts and app.module.ts | Register the required factory/port using existing public modules; explicit no-cycle DI and fail-before-write if absent; no global auth pipeline or owner/system request context |
| Engineer — inputs and generated outputs | CASE/WORKLIST blueprints and handwritten commands OpenAPI already owned; docs/framework/arch/parameter-catalogue.md for typed A/B/C/D ladder source representation; attributable generated parameter-catalogue/seed/flags and blueprint/client outputs | Normalize existing approved values to typed snapshots, retain old operational versions/provenance; generator only; no production seed/reset or unrelated parameters/flags |
| Engineer — read policy only | backend/domains/shared/src/policy.ts, RAIT CASE/WORKLIST read-surface rows only | Reconcile exact read action labels needed for D8 functional projections, coupled to server scope; no new role, wildcard/admin merits, unrelated domain policy or new command activation |
| Inspector | backend/domains/inf/deadlines/tests/rait-risk.spec.ts; CASE/WORKLIST tests; backend/domains/shared/src/policy.spec.ts and policy.guard.spec.ts; backend/app/tests and existing affected frontend specs/harnesses | Pure source assertions plus real HTTP+DB role/legacy/risk/parent/concurrency and routed UI evidence; no fixture deletion, optional-DB PASS or weakened baseline |

Internal binding entities/constraints use the canonical CASE blueprint with
operations[] and attributable generation: ADR0047 extended read-scope roles and
case_pool_scope relation; exactly-one unit/pool, provenance, consistent tenant
references and uniqueness. A supporting handwritten DDL constraint is allowed
only where the generator cannot express the specified invariant, named and
explained in the implementation review, under the base packet's DDL exception.
No public binding/routing CRUD, production personnel or automatic migration.

CASE/WORKLIST domain exports/modules/indexes attributable to the blueprints are
generated. The new pure deadlines index is handwritten and changed directly.
WORKLIST→CASE and CASE→deadlines stay acyclic; app composition connects the
transaction port without CASE importing WORKLIST. No deep imports or sibling writes.
Existing handwritten commands OpenAPI may express typed role-purpose read
projections and new errors; generate consumers, never cast partial reads as full DTOs.
No separate permissive legacy endpoint survives to bypass the scoped operation.

## 3. Exact implementation sequence after this review stage

1. Freeze the integrated amended baseline and confirm all source hashes, ADR IDs
   and blueprint/resource operation lists. Instantiate the closed T0 map; do not
   redo the resolved D1–D11 decisions or require production provisioning for RED.
2. Inspector T1 adds decisive RED before Engineer work: expanded107-method bypass
   cases; source-backed triage/role projections and pool-only unassigned containment;
   canonical internal user versus raw external subject; version-bound legacy
   classification; risk missing/unknown versus assessed-low; actual concurrency.
3. Engineer T2 implements scope prerequisite. Remove raw workflow/ownership/audit
   mutation bypasses; preserve accepted source-equivalent functional reads/writes,
   source+target checks and earlier admissibility. Reconcile D8 read labels only.
   Known pre-existing command-label mismatches remain explicit regression findings;
   they are not silently granted or called proven working. Claim UI stays off
   until direct HTTP triage/oversight positives and bypass negatives pass.
4. Engineer T3 implements current-risk source/calculation/port and qualified legacy
   selector compatibility together with existing atomic claim/retry. GET computes
   a current read-only snapshot; POST re-evaluates under its locked transaction,
   commits required qualified risk/assignment/history/outbox atomically. Same
   selector order for new and legacy cases, WIP/schedule/impediments unchanged.
5. T4–T6 remain the original typed UI, read-only dossier, real HTTP+DB/browser,
   full affected/root checks, cross-family review and implementation PR. That PR's
   merge and post-merge evidence remain separately authorized. No round close/seal.

New safe errors are RAIT.CLAIM_LEGACY_UNVERIFIED409 and
RAIT.RISK_SOURCE_UNAVAILABLE503, specified in ADR0048/49 and the error-catalogue
addendum. Neither discloses a candidate. No supplied If-Match, result-envelope,
new-attempt/retry or other command contract is relaxed. Qualified legacy success
returns the same typed CASE shape with final v+1; new path returns v+2.

## 4. Added acceptance and exact remaining gates

| Area | Decisive positive and negative |
| --- | --- |
| D8 | Each complete role-purpose projection; secretary archive suppression; rapporteur assignment/session/vista; chair presidency; signer jurisdiction/duty; central review; manager operational projection without merits; other roles functional-only; mixed-role/admin/wildcard denies |
| Pool containment | Unassigned merits via explicit exact pool source; same-unit different pool, missing/foreign/ambiguous link and revoked binding deny; unit binding must be independently authorized |
| D9 | Authenticated internal user matches qualified membership; external subject, orphan/foreign user, stale membership or unverified legacy namespace denies without rewriting personnel |
| D10 | New v+2 and qualified legacy v+1 share order; exactly one assignment; assigned legacy exclusion; stale/wrong/missing proof safely409; recorded held case preserved; no silent QUEUE_EMPTY or hidden dropped backlog |
| D11 | Canonical clock/date/typed ladder snapshot, worst applicable flag first, approved priority/NULL order; same-unit/other-tenant source negatives, default strings/flags rejected, read has no writes, missing port rollback, changed flag event idempotency and concurrent claim proof |
| T0 fields | Exact typed subsets; unclassified document.kind does not grant a class; forged reference, wrong parent, missing signature/procuration evidence and third-party narratives cannot become generic merits or automatic positive verdict |

Before T2: reviewed role/parent/field contracts and explicit legacy policy must be
integrated, with Inspector RED recorded. Those design gaps are resolved here;
unsafe actual inputs still deny. Before release: trusted deployed legacy inventory,
production identity/binding/routing qualification, approved executable ladder
versions and source/clock/document evidence, required full checks and real
acceptance. A test fixture cannot satisfy those operational gates. Missing source
or required DI fails closed; a new domain rule or path outside this amendment
still requires a concrete bounded resolution. No new production value is invented.

## 5. Preservation and review boundary

Main ad20e168 is frozen; original PR198/199 artifacts and accepted ADRs remain
historical. Concurrent scorecard ADR0043/44 and a separate local ADR0045 filename
are observed as metadata only; ADR0035 first-parent main precedence governs any
later collision. This lane uses new IDs0047–49 and does not renumber scorecard work.
No checkout, reset, stash, clean, recovery/worktree deletion or primary file write.
Machine-config hashes and starting local ref names are rechecked before PR.
This amendment is a reviewable contract, not completed implementation or proof.

The accompanying P4-02-A1-source-freeze.json records baseline source hashes and
the107-method count independently enumerated from mounted controller decorators.
It is a source receipt, not a proof-chain or runtime acceptance record.

The T0 field map preserves authorized human checklist assessment and existing
admissibility guards. Missing machine proof does not add a new certificate, trust
provider or save/admit prerequisite; no automatic positive is fabricated.
