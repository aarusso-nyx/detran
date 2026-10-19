# P4-02-S1 Architect checkpoint

Architect, Constitution Article7; Article6 authority by path. Owner approved
P4-02-S1 as written. This checkpoint transcribes ADR0046/0047 and the closed T0
maps; it does not dispatch Engineer, establish RED/GREEN or qualify production.
PR201 is merged at a006b039; S1 authorization checkpoint is1a12d1a3.

## Frozen source and method dispositions

The sibling P4-02-S1-method-dispositions.json freezes source blueprint/contract
hashes and all107 baseline methods: CASE56 generated+17 handwritten, WORKLIST26
generated+8 handwritten. Dispositions:71 replaced by scoped handlers,25 retained
handwritten with supplemental checks,11 removed. Removed: CASE PATCH/DELETE,
and every child DELETE except the narrowly qualified unreferenced ordinary-party
metadata operation. T0 requires an independently sourced ordinary metadata
contract before retaining DELETE; document/lifecycle/audit/evidence resources have
none in this packet. Removed HTTP methods return404, not501/no-op. Retained
restricted generic POST/PATCH validate400 with no side effects; a permission is
not a usable workflow payload. Positive party writes and filename-only document
PATCH remain under their existing action roles and complete scope.

All generated HTTP operations become operations[]; generated DTOs, entity/repository
services and internal module exports remain available. Handwritten replacements
use identical paths, verbs and operationIds where retained. Existing command
paths remain unchanged. No claim-context/risk endpoint, legacy qualification,
selector change or new clinical/legal threshold is introduced.

## Exact runtime handoff names

CASE module registers RaitCaseScopedReadsController from
handwritten/rait-case-scoped-reads.controller.ts, RaitCaseScopeService from
handwritten/rait-case-scope.service.ts and RaitCasePoolScopeService from
handwritten/rait-case-pool-scope.service.ts. Its public index exports those
files and the module exports RaitCaseScopeService for existing WORKLIST→CASE
consumption. WORKLIST imports RaitCaseModule through @detran/inf-rait-case and
registers RaitWorklistScopedReadsController from
handwritten/rait-worklist-scoped-reads.controller.ts. No CASE→WORKLIST dependency.

The scoped controller names include retained compatible generic writes: no
parallel permissive CRUD handler. One scope service supplies purpose, parent and
field decisions. Current policy effective strict-command precedence is unchanged.
HTTP arrays/by-ID retain their previous transport shape, with explicit typed
purpose subsets in handwritten commands OpenAPI; no partial-as-whole DTO cast.
Schemas are maxima conditional on the complete purpose and reference qualification,
not a grant to every role. Triage documents require verified class/linkage; sealed
archive suppresses unqualified/third-party material. Internal use of a field does
not permit its disclosure. Stored clock metadata is chronology, not a new current
risk producer or accepted default-low assessment.

## Internal data and generated expectations

CASE adds RaitCaseReadScope / inf.rait_case_read_scope and RaitCasePoolScope /
inf.rait_case_pool_scope as operations[] entities. They have generated tenant RLS,
UUID identity, active=false default (no implicit grant), nonempty provenance,
exactly-one unit/pool binding, and role-specific tuple uniqueness. Actual role,
action, active auth.memberships row, impediment and applicable duty/presidency
remain runtime checks; a binding alone grants none. The generated composite
membership FK anchors actor_id to canonical auth.users.id through tenant-specific
membership; no OIDC-subject mapping or personnel migration. New pool records have
unique tenant/case/pool and a generated tenant/case FK. Unit/pool tenant references
and cross-parent semantic checks require the supporting DDL below.

Architect runs contracts:openapi only. Engineer must run blueprints:generate and
contracts:clients, then confirm that only the two blueprints' attributable module,
entity/DTO/controller/repository/service, DDL34/35, client types and generator
manifest changed. Blueprint provenance changes can rewrite otherwise unchanged
files within those two modules. Unrelated outputs remain byte-identical. Inspector
must exercise actual HTTP handlers; missing imports/controllers/generation or
infrastructure failures are not security RED. No tests or runtime files are
written by this Architect checkpoint.

## Concrete supporting DDL dependency — pending bounded path extension

The generator expresses same-DDL FKs, composite unique indexes, checks and tenant
RLS. Its deferredForeignKeys run at the end of each blueprint DDL, not after all
blueprints. CASE DDL34 precedes WORKLIST DDL35, so it cannot install scope links to
rait_unit/rait_pool there. Cross-table unit/instance equality cannot be a SQL CHECK.
Existing priority post-pass files are specific to priority history/roles and must
not absorb unrelated scope semantics.

Proposed exact supporting file: backend/database/ddl/19-rait-case-scope-enforce.sql.
Install after all generated tables and DDL20 in the same loader transaction:

- Composite FK read_scope(tenant_id,unit_id)→rait_unit(tenant_id,id).
- Composite FK read_scope(tenant_id,pool_id)→rait_pool(tenant_id,id).
- Composite FK case_pool_scope(tenant_id,pool_id)→rait_pool(tenant_id,id).
- Unique tenant/id target indexes are blueprint-owned on rait_case, rait_unit,
  rait_pool. No generated code or generator logic change.
- Transactional triggers validate active case-pool records against same-tenant
  case.unit_id=pool.unit_id and case.instance=pool.instance, reject inconsistent
  links, and guard parent case/pool unit/instance changes that invalidate an active
  link. Lock relevant parent rows consistently to serialize scope revocation and
  parent mutation. Pool activity does not authorize selection or add a legal guard.
- No production seed/backfill or guessed authorization. Preserve existing legal
  protocol/admit effects if routing is zero/ambiguous: write no link, retain success.
- Verify constraints/triggers exist on reapplication; new tables retain forced RLS
  and request-path role_app_backend tenant context. No SECURITY DEFINER/owner-role
  request provider, new grant, cleanup, history rewrite or auto-qualification.

Exact loader insertion needed (currently outside the S1 path ownership table):
add the literal filename to the existing const manual inventory alongside the three
priority files; add it to the existing while-loop case exclusion alongside those
manual post-pass files; append its -f argument after20-rls-policies.sql and before
the final19-rait-priority-verify.sql argument, retaining all existing inventory,
lexical preflight, transaction and priority verification protections. It must run
only after DDL35 and never during the lexically sorted19 pass. No shell/auth/DB
reset authorization changes. Parent must obtain a bounded ownership extension for
backend/database/apply.sh (and its directly affected Inspector loader tests if any)
before that edit. No such edit or supporting SQL was made here.

S1 stops at this unowned required loader path; this checkpoint remains consumable
for scoped Inspector work and a concrete review, never readiness by omission.

## Verification status at checkpoint

Targeted JSON/Prettier: PASS. Baseline denominator and projected field references:
PASS. contracts:openapi: PASS (48 contracts). docs:kb:check: PASS (773 artifacts,446
canonical tokens). devai:doctor: PASS (2.2.0; CLI-only boundary, arbitrary host
tools not enforced). Duplicate index names were checked and the redundant
existing CASE tenant/id index declaration removed before the final checkpoint.
Full code/client generation,
blueprints:check, complete contracts:check, runtime typecheck and HTTP/DB tests:
not run by Architect; downstream responsibilities after authorized checkpoints.
Missing not-yet-authored controllers are an expected intermediate source state,
not a decisive runtime RED. Accepted ADRs, product/law, runtime/tests, scorecard,
primary checkout and recovery material were not edited.

## Supplemental checkpoint — defense pool partition and approved loader path

The Owner explicitly approved the bounded apply.sh loader ownership extension
(the three insertion sites above), as relayed by the orchestrator. The supporting
constraint SQL was already authorized by S1. This Architect makes no loader/runtime
edit; the pending-path stop above records the earlier checkpoint, not a renewed
approval requirement.

The original WORKLIST pool description and ux_inf_rait_pool_instance_unit index
reflect historical steering A.2's three base pools without additional segmentation.
Later accepted ADR0047 explicitly permits more than one active defense pull pool
matching a case's unit/instance and requires qualified explicit routing. That
approved decision supersedes the old uniqueness for defesa_previa only; it does
not authorize weakening JARI/CETRAN uniqueness or provisioning another pool.
WORKLIST1.5.1 retires the old partial index and generates the replacement
ux_inf_rait_pool_non_defense_instance_unit on(tenant_id,instance,unit_id) WHERE
unit_id IS NOT NULL AND instance <> 'defesa_previa'. The existing unit-null base
index and unique(tenant_id,id) FK target indexes remain unchanged. No row, identity,
assignment or operational routing receipt is created by this change.

The generator creates indexes idempotently but cannot drop retired indexes.
Therefore the already authorized supporting post-pass file
19-rait-case-scope-enforce.sql must explicitly retire only the old standalone
partial index inf.ux_inf_rait_pool_instance_unit with DROP INDEX IF EXISTS,
without CASCADE, after generated DDL35 installs the narrower non-defense index.
Before dropping, inspect pg_index/pg_class/pg_constraint: require that any existing
index has the expected inf.rait_pool target, unique tenant_id/instance/unit_id
columns and unit_id IS NOT NULL predicate, and is not owned by another constraint;
a conflicting shape fails closed instead of dropping an unrelated object.
Verify the replacement non-defense and unit-null uniqueness indexes and the
rait_pool(tenant_id,id), rait_unit(tenant_id,id), rait_case(tenant_id,id) FK targets
remain present/valid. Reapplication must preserve the same state. This narrow
retirement restores an already approved defense-partition possibility; it does
not fabricate routing or change case legal success. Inspector must demonstrate
same-unit defense pool exclusion and preservation of other-instance constraints.

Supplemental checks: targeted WORKLIST blueprint formatting and JSON/index
assertions PASS; runtime generation and real DB assertions remain Engineer/Inspector
work at their separate checkpoints.

## Internal generated-symbol correction

Architect checkpoint: internal entity name RaitCasePoolScopeRecord replaces
RaitCasePoolScope to avoid collision between the generated service class and the
approved handwritten RaitCasePoolScopeService provider. Table, fields, constraints
and operations[] are unchanged. This is an internal symbol correction; no role,
HTTP operation or business rule changes. Attributable OpenAPI is regenerated.
