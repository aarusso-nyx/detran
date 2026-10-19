# P4-02-S2 Architect source checkpoint

Architect, Constitution Articles6–10/24. Owner-approved backend-first S2; external
resource amendment S2-R1. Baseline b1faf78d; parent records S2-R2 separately for the
four-key parameter parser prerequisite. No runtime/tests/state/proof edits, task
completion, production qualification, S3 dispatch or acceptance PASS occurs here.

## Exact canonical changes

CASE blueprint1.3.0 registers RaitClaimContextController, RaitCaseRiskController,
RaitClaimContextService, RaitCaseRiskService and RaitLegacyQualificationService.
Exports include the handwritten risk port and the risk/legacy providers required by
app composition/WORKLIST; CASE still has no WORKLIST dependency. WORKLIST1.5.2
registers RaitRiskProjectionService, consuming public CASE interfaces. No new
WORKLIST HTTP method, event topic or write permission is added.

RaitClaimLegacyQualification is internal operations[]. Its fields transcribe
ADR0048. assignment_status encodes observed assigned/unassigned; classification
encodes qualified_unassigned/preserve_assigned/hold, not new case states. Version
and revision are positive; unique tenant/case/version/revision; composite tenant/
case FK; qualification, assigned-reference and hold-reason checks. Source refs are
not trusted merely because nonempty. Same-tenant reviewer/source references,
append-only enforcement and current-source validation remain required in the
approved supporting19 DDL/service because blueprint checks cannot query those
records or prevent UPDATE/DELETE. No public CRUD, production seed or automatic
backfill. Prior S1 scope and routing invariants remain binding.

Exactly two GET operations are added: raitClaimContext at claim-context with
Resource inf:rait-case / Action claim-next; raitCaseRiskSnapshot at cases/{id}/risk
with Resource inf:rait-case / Action read. The latter applies S1's complete
case-purpose/parent projection predicate. Query names are pool_id, pool_cursor,
queue_cursor and limit1..50. Counts and automatic single selection use the full
eligible set; separate opaque cursors bind selected pool/order/scope. Unknown,
foreign or unauthorized pool does not disclose candidates. The discovery response
has typed pages/nextCursor and safe nullable reason; no selection yields no queue.
Cursor encoding is an engineering detail, never an authority token or lease.

POST raitPoolClaimNext is strict{} with Idempotency-Key and unsupported If-Match400.
HTTP200 data is a typed CASE result with required id/state/version/instance and
non-null assignment_id; events are existing transactional event records; strong
ETag is final case version. New defense succeeds v+2, qualified legacy v+1. Other
instances/known-case commands remain unchanged. Existing actor-bound fingerprint
bytes and S1 replay receipts must not change. Generated clients must preserve the
risk-clock discriminated union and case result identity rather than cast partial
stored entities. No frontend source changed.

## Frozen ladder source representation

Canonical catalogue cells contain JSON objects with exactly schemaVersion=1,
clockCode, unit, tracks, sourceRef. Each track has exactly ceiling and steps;
each step exactly flag and after. No extra field, duplicate track/flag, string
payload pretending to be an object, changed literal or unknown clock is accepted.

| Key | Unit | Ceiling | Ordered stages before ceiling | Source/status |
| --- | --- | --- | --- | --- |
| rait.ladder.A | days |180| N1=90,N2=135,CRITICO=162 | WF-RAIT-002#4.3; proposta |
| rait.ladder.A | days |360| N1=180,N2=270,CRITICO=324 | same approved source; proposta |
| rait.ladder.B | months |24| N1=12,N2=18,N3=21,CRITICO=23 | WF-RAIT-002#4.1 / OD-006; vigente normalization |
| rait.ladder.C | months |36| N2=24,N3=30,CRITICO=33 | WF-RAIT-002#4.2; proposta |
| rait.ladder.D | months |60| N1=30,N2=45,CRITICO=54 | DT-030; vigente normalization |

N1/N2/N3 here abbreviate existing ALERTA_N1/2/3 values; raw cells use full tokens.
PRESCRITO_OPERACIONAL is reached at the verified canonical ceiling for applicable
clocks. No A-N3, C-N1 or D-N3 is invented. Reach dates use existing date/calendar
owners and one tenant operation snapshot, not age arithmetic or browser date.

Existing parser.mjs currently treats generic JSON cells as strings. S2-R2 is
required to parse/validate objects for these four exact keys only. Architect does
not edit tooling. Catalogue source grammar remains existing JSON-in-cell grammar.
Old operational versions are preserved; catalogue normalization is not migration.
A/C remain proposta with attached approved sources and source_pending=false. A
controlled Inspector fixture may insert separately qualified executable vigente
versions plus activation receipts; that does not promote canonical proposed rows
or authorize production activation. A/C proposal-only rows remain503 negatives.

## Mandatory read-only snapshot port and exact input mapping

The public risk API remains the R-0006 additive supplement, without renaming its
exports. Internal CASE rait-risk.port.ts defines the mandatory snapshot factory
bound by app rait-risk.providers.ts. Factory input is the **caller's transaction**,
authenticated tenant/case identity and one RaitOperationClockSnapshot. Its read-only
result supplies RaitRiskInput plus internal source/qualification refs and incident
status qualified/missing/ambiguous. RaitCaseRiskService evaluates it and maps invalid
or missing inputs to RAIT.RISK_SOURCE_UNAVAILABLE503. No alternate database.tx,
owner connection, optional low-risk fallback or missing-DI successful response.

Exactly one applicability record for each A/B/C/D is mandatory. For a live defense
candidate A/C/D are applicable; B is explicitly not_applicable with persisted
instance and source proof. Other-instance/state reads require independently
qualified applicability/timers; absent records are never evidence of NA. Missing
applicable sources or worstFlag=null blocks a live defense selector.

| Clock | Canonical timer/source | Start/reset qualification |
| --- | --- | --- |
| A | infraction T-DEC, through case.ait_id and actual AIT→infraction relation; current canonical timer due_on is ceiling | RN114/WF0024.3: qualified practice/start source plus independently proven180/360 track. Timely-defense verdict/actual extension source must agree with the current timer; default180 or due-start difference cannot establish track. |
| B | case/instance T-JUL-24M | RN110/111: verified JARI/CETRAN received date, not interposition/protocol. Defense instance explicitly NA; missing receipt in a judging instance is unavailable. |
| C | current T-PAR-3A | RN113 and ARCH-RAIT-DEADLINES2: last qualified movement plus its operative movement-policy version. No generic updated_at inference; no implicit reset for an unqualified event. |
| D | current T-PRESC-5A | RN113/DT-030: verified practice/cessation or actual authorized interruption under the qualified closed interruption policy. No automatic reset on NP, admission or ordinary movement. |

Resolve actual existing timer ownership rather than manufacture duplicate timers
when a CASE deadline convenience read differs from the infraction-owned source.
ARCH-RAIT-DEADLINES4 maps A/B/C/D to the above codes, ceiling=timer due_on. Persisted
rait_clock.flag/default/flag_changed_at is not the calculation or track proof.
Source inconsistency or absence is503, not new deadline-engine behavior. Existing
T-DEC default180 does not itself prove an extended360 timer.

Consumed timer fields: id,tenant_id,owner reference (case_id/infraction_id),
timer_code,instance where present,start_basis,started_on,raw_due_on,due_on,
ceiling_on where present,status or satisfied_at,expired_at/cancel_reason where
present,suspended_by_act_id,suspended_days where present,extension_count,legal_basis.
Consumed clock fields: id,tenant_id,case_id,clock_code,started_on,ceiling_on,
last_reset_at,legal_basis. Stored flag is historical metadata only. Consume
parent case id/tenant/ait_id/instance/state/version plus relevant received dates,
trusted timeliness/extension or movement/interruption source identities/content.
Never accept client source fields. Prove unique, compatible current source records;
multiple conflicting current timers or missing actual reset policy fail closed.

All candidate qualification occurs before capped pagination/selection. Claim locks
member/WIP/case and relevant current source rows in stable order, evaluates under
the same transaction and rechecks source content before effects. READ COMMITTED
re-reads must not permit changed supporting parameters/provenance between validation
and update: lock relevant rows or equivalently prove a consistent source snapshot.
GET does not lock as a lease and writes no audit/domain/flags. POST audit records
source versions as part of its own transaction only. No persisted flag publisher.

## Frozen internal public-port and composition names

CASE public handwritten/rait-risk.port.ts exports these exact names. They are
internal workspace interfaces, not new HTTP input or a second deadline engine:

```ts
export const RAIT_RISK_SNAPSHOT_FACTORY: unique symbol;
export type RaitRiskQualificationStatus = 'qualified' | 'missing' | 'ambiguous';
export interface RaitRiskIncidentQualification {
  clockCode: RaitRiskClockCode;
  status: RaitRiskQualificationStatus;
  sourceVersions: readonly string[];
}
export interface RaitRiskSourceSnapshot {
  input: RaitRiskInput;
  incidentQualifications: readonly RaitRiskIncidentQualification[];
  sourceRefs: readonly string[];
}
export interface RaitRiskSnapshotReader {
  read(tenantId: string, caseId: string): Promise<RaitRiskSourceSnapshot>;
}
export interface RaitRiskSnapshotFactory {
  create(tx: Transaction, operation: RaitOperationClockSnapshot): RaitRiskSnapshotReader;
}
export const RAIT_RISK_PROVENANCE_READER: unique symbol;
export interface RaitRiskProvenanceRequest {
  kind: 'timer' | 'track' | 'movement' | 'interruption' | 'parameter' | 'incident';
  tenantId: string;
  caseId: string;
  sourceRefs: readonly string[];
  contentRevision: string;
}
export interface RaitRiskProvenanceResult {
  status: RaitRiskQualificationStatus;
  sourceVersions: readonly string[];
}
export interface RaitRiskProvenanceReader {
  qualify(tx: Transaction, request: RaitRiskProvenanceRequest): Promise<RaitRiskProvenanceResult>;
}
```

RaitRiskInput/RaitRiskClockCode come only from the supplemented public deadlines
API; Transaction is the existing STYNX transaction; operation is the existing
CASE operation-clock type. A unique symbol is instantiated once by the CASE port,
not independently recreated by app. sourceRefs are private audit-qualified inputs,
never the HTTP sourceVersions payload. Incident statuses are one per applicable
clock needing operational-prescription qualification; no duplicates or silently
omitted required clock. Missing/ambiguous required qualification fails503.

The already owned app rait-risk.providers.ts owns @Global RaitRiskSnapshotModule,
SqlRaitRiskSnapshotFactory and the required provenance-reader provider. AppModule
imports that module; it exports RAIT_RISK_SNAPSHOT_FACTORY (and provenance token
when needed for controlled composition), making the provider visible to imported
CASE. Merely adding a provider to AppModule.providers does not satisfy Nest module
visibility. CASE does not import app or WORKLIST. Blueprint exports the CASE risk
service for existing WORKLIST→CASE consumption. No extra runtime file is implied.

The production SQL snapshot factory performs actual caller-Tx source reads and
validation. Controlled Inspector qualification receipts may replace only the
trusted RaitRiskProvenanceReader composition port with explicit tenant-scoped
synthetic verified evidence; keep SqlRaitRiskSnapshotFactory, timer/clock/
parameter/incident SQL, actual linkage and content-revision comparisons exercised.
No test may obtain a positive by stubbing the entire snapshot or returning arbitrary
qualified content. Production reader has no implicit test receipt or fallback.
A provenance status is not a role grant; scope/action remains independently checked.

## Parameter resolution, content revisions and provenance

Read ops.parameter through the caller Tx, with existing service.select precedence:
matching agency>tenant>surface, applicable effective_from/effective_to, then latest
effective_from/version. Do not call OpsParameterService.get, which opens another Tx.
Consume exact id,tenant_id,traffic_agency_id,scope,surface,key,value_json,value_type,
status,source_pending,decision_ref,legal_basis,version,effective_from/effective_to.
Require typed complete source-backed object, operational vigente qualification,
non-pending source and explicit activation/source receipt. Reject conflicting
highest-precedence versions; do not choose arbitrarily or fall back to a lower
scope merely because the selected value is unqualified. A valid source label alone
is not operational activation. Existing expiry override a_confirmar labels do not
permit legal extinction; this packet only evaluates alerts.

A revision reference may be a canonical SHA256 of exactly the consumed current row
fields plus qualified source/parameter/receipt versions. Sort object keys, normalize
civil dates/UUIDs and serialize null distinctly from absent/NA; retain ordered
clock/step arrays. Name it a content revision, never a historical sequence/version
that the table does not store. Re-read/digest in the same Tx; timestamp-only tokens
are invalid. A digest detects changed content, **not authentic provenance**. Public
sourceVersions carry opaque version identifiers without raw evidence references,
actor IDs, incident text or other merits. Internal audit may retain authorized refs.

## Incident qualification without a new producer/store

Only when evaluation reaches PRESCRITO_OPERACIONAL, app reads existing
rait_clock_alert.incident_ref for that tenant/clock and same-tenant unique
rait_incident by incident_ref. Require exactly one authoritative linkage; target
must match case_id or clock_id, with every present link mutually consistent. Resolve
clock→case for clock-only incidents. Conflicting references/targets are ambiguous;
missing link/provenance is missing. Do not guess from nearest timestamps, names or
latest actor. Both return503 for the whole otherwise eligible pool operation and
scoped risk read, without candidate/incident payload. Authorized inventory stays.

Consume alert id/tenant_id/clock_id/level/incident_ref and incident id/tenant_id/
incident_ref/clock_id/case_id/opened_at/opened_by. Bind these current contents to a
verified existing operational receipt or exact immutable audit event proving that
same tenant/incident/target source. Receipt consumes identity, authorized origin,
source references/content digest and its real immutable version/hash. Validate that
receipt's integrity/provenance independently; a matching JSON object, human UUID,
opened_at or nonempty string is insufficient. No arbitrary audit action label is
invented here as a new writer or authority. Existing audit/operational evidence
without exact matching linkage fails closed. Fixture receipt provenance is synthetic
and explicitly tenant-scoped; never production evidence. ORG table changes, new
receipt store/public API/role/writer or production provisioning are outside S2.
The read-only factory may receive qualified operational evidence through its
existing approved composition port; absent trusted evidence returns missing.

## Legacy qualification and acceptance handoff

Qualified synthetic fixtures must create authentic internally consistent admission/
distribution history, exact tenant/pool routing, current observed case version,
assignment status and explicit authorized disposition receipt. Validate actual
refs and reviewer/source provenance. State=DISTRIBUIDO alone never qualifies.
Hold is visible/preserved; unresolved in-scope legacy blocks409 instead of vanishing
from ordering. Already assigned work is not reclaimed. Replays retain historical
qualification refs and reauthorize current read/action without rerunning first-use
version/source selection after success. Every new/legacy stage, ledger, history,
audit and outbox is one rollback boundary. Legal-priority NULL stays excluded.

Inspector RED must cover the exact canonical API/parameter/object/legacy constraints
and real HTTP+DB missing/ambiguous/proposed/source-revocation cases, beyond-page
candidate blockers, true180/360, C reset/D non-reset, risk/priority/NULL/ties,
newv+2/legacyv+1, stage-specific snapshots, concurrent WIP, exact retry and S1
positives/negatives. Missing DI/source/provenance is a503 test result, not a reason
to fabricate a production row. Required runtime source inputs remain separate
release gates. Generation/check diagnostics are in source-freeze.json; missing
handwritten runtime implementations are expected before Inspector RED/Engineer.
