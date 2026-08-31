# ADR-0011: PEC Auth, Audit and Integration Mapping

## Status

Accepted for the Phase 6 PEC port (mapping step, 2026-08-31).

## Context

The PEC origin mixes driver-health domain records with application infrastructure
across four PostgreSQL schemas. At the inspected origin commit
`cfa8af2ff5349708e686305c7eb0a60d6276f753`, its active DDL declares 50 tables:
30 in `pec`, ten in `auth`, seven in `integration` and three in `audit`. The Phase 6
port starts from DETRAN commit `4b02785f672b70171d3660433c13a86663fa3275`.

ADRs 0002, 0003, 0005 and 0008 already establish one shared authentication,
tenancy, authorization and audit kernel, plus `@detran/senatran-adapter` as the
only RENACH boundary. Copying PEC's `auth`, `audit` or RENACH infrastructure would
create a second identity model, a second audit chain and a bypass around the
adapter. Some tables placed in PEC's `auth` and `integration` schemas are,
however, driver-health domain records. Their behavior must survive under `ch`
ownership rather than disappear with the old infrastructure.

This ADR assigns every origin infrastructure table a target or an explicit
replacement obligation. It does not authorize a handwritten domain table: all
new `ch` tables remain blueprint-generated under ADR-0007, and all generated API
contracts remain governed by ADR-0009.

## Decision

### Mapping rules

1. Identity, tenant membership, authorization and sessions remain kernel-owned.
   A PEC module may reference kernel identities, but may not create an alternate
   user, role, permission, membership or session store.
2. A clinic, accredited professional or biometric station is not authentication
   infrastructure. These concepts move to `ch` and keep separate optional links
   to authenticated users where a human operator also needs login authority.
   A professional's clinical function is not inferred from an authorization
   role, and assigning a role never creates or accredits a professional.
3. Every request-path repository uses `withTenantContext` and the `app` database
   principal. Every new tenant table has forced RLS and an
   `enforce_tenant_id` trigger. There is no system-context or in-memory fallback.
4. Every RENACH operation crosses `@detran/senatran-adapter`. Durable workflow
   delivery belongs to the shared kernel outbox; provider transport, wire DTOs,
   authentication, resilience and idempotency headers belong to the adapter.
5. Domain facts are not hidden in infrastructure logs or caches. A clinical
   result needed to decide a workflow is a `ch` record; the immutable record of
   who performed the action is an `audit.events` entry.

### Auth schema

No origin `auth` table is copied under its original definition.

| PEC origin              | DETRAN target                                       | Disposition                                                                                                                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auth.tenants`          | `auth.tenants` and `tenancy.tenant_settings`        | Use the kernel tenant and settings records. Map PEC identity and contact fields during migration; do not create a PEC tenant catalog.                                                                                                                                                |
| `auth.users`            | `auth.users` plus `auth.memberships`                | Use the kernel OIDC subject and user profile. Tenant access is a membership, not a PEC-local user copy. The legacy single-tenant row and `role_legacy` field are not retained.                                                                                                       |
| `auth.clinics`          | future blueprint-owned `ch.clinics`                 | Re-model as the accredited clinical-provider organization used by scheduling, encounters and billing. This is a domain relocation, not a second auth table. Track the origin `admin-clinics` surface as specification debt until its behavior is bound to PEC acceptance criteria.   |
| `auth.professionals`    | future blueprint-owned `ch.professionals`           | Re-model accreditation, clinic affiliation, professional kind and council identity under `ch`. An optional kernel user reference may bind login identity; clinical authority and professional status remain explicit domain data. Track `admin-professionals` as specification debt. |
| `auth.stations`         | future blueprint-owned `ch.biometric_stations`      | Re-model as a clinic-bound biometric capture station in the biometrics step. It must not become an authentication factor store or be conflated with an `ops` field device.                                                                                                           |
| `auth.roles`            | `auth.roles` and the canonical DETRAN policy matrix | Preserve PEC's 15 role codes already declared in `@detran/shared`; policy keys remain `ch:resource:action`.                                                                                                                                                                          |
| `auth.permissions`      | `auth.perms` and the canonical DETRAN policy matrix | Translate origin permissions to namespaced policy keys. Do not import free-standing permission codes without a target action.                                                                                                                                                        |
| `auth.user_roles`       | `auth.memberships` plus `auth.membership_roles`     | Resolve the user's tenant membership, then assign canonical kernel roles. Preserve grant provenance through audit events rather than a PEC join-table extension.                                                                                                                     |
| `auth.role_permissions` | `auth.role_perms`                                   | Use the kernel role-permission relation and the checked-in policy matrix as engineering authority.                                                                                                                                                                                   |
| `auth.user_sessions`    | `auth.sessions` plus the STYNX session runtime      | Do not copy the PEC session table. Before session parity is claimed, wire the published session runtime and prove single-active-session, revocation, expiry, refresh-token reuse detection and strong-factor requirements. The current base DDL alone is not parity evidence.        |

User administration belongs to the kernel's identity/membership administration
surface. The origin `admin-users` package is therefore deferred as a PEC domain
package: its required behaviors must be exercised against the shared kernel, not
ported as `ch/admin-users`. Clinic and professional administration are retained
as `ch` domain behavior with the specification-debt notes above.

### Audit schema

No origin `audit` table is copied.

| PEC origin              | DETRAN target                                                       | Disposition                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audit.events`          | `audit.events` through `audit.write` and `DetranPersistedAuditSink` | Use the kernel's per-tenant, advisory-lock-serialized hash chain. Domain code never inserts directly and an unavailable sink fails the mutating request.                                                                                                                                                              |
| `audit.events_default`  | `audit.events_default`                                              | Use the kernel default partition and its forced RLS. Partition creation remains kernel operations work.                                                                                                                                                                                                               |
| `audit.biometry_events` | `ch` biometric records plus `audit.events`                          | Put biometric outcome, liveness/quality evidence reference and encounter linkage in the relevant `ch` biometric record; emit a namespaced audit event for capture, verification, fallback and exception actions. Do not create a second mutable audit table. Raw biometric material is never placed in audit details. |

The origin audit query views become read models over `audit.events`; a candidate-
or regulator-facing audit query must retain the kernel's tenant isolation and
least-privilege reader path. Origin append-only and chain-verification tests are
re-expressed against the kernel, including concurrent writes and mutation denial.

### Integration schema

| PEC origin                       | DETRAN target                                                               | Disposition                                                                                                                                                                                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `integration.renach_outbox`      | kernel `integration.outbox` plus `RenachPort`                               | Enqueue a domain event atomically with the `ch` mutation. A worker invokes the adapter outside the originating transaction with the persisted idempotency key. Do not copy the report trigger or a RENACH-specific outbox.                                                                                                |
| `integration.renach_inbox`       | adapter-validated inbound receipt in the shared integration runtime         | Preserve duplicate detection, processing outcome and error evidence in a generic durable receipt contract. If the published kernel lacks that contract, extend the shared kernel before Step 6; do not add a direct RENACH controller inside a `ch` package.                                                              |
| `integration.renach_acks`        | shared outbox delivery-attempt/receipt history                              | Preserve provider code, message, timestamp and relation to the delivery attempt in the kernel delivery ledger. ACK data is transport evidence, not a `ch` aggregate.                                                                                                                                                      |
| `integration.crm_crp_cache`      | future `ch.professional_council_verifications` plus a council outbound port | Retain the last verified status and provenance as tenant-scoped professional-accreditation data. The external council adapter is distinct from SENATRAN. Global nullable-tenant cache rows are prohibited.                                                                                                                |
| `integration.toxicology_cache`   | future `ch.toxicology_results` plus a toxicology outbound port              | Retain the result, laboratory, collection/expiry dates, source receipt and workflow linkage as a versioned domain record, not a generic cache. The owner register records the periodic flow as in scope, while `UC-PEC-012` still calls that decision open; implementation waits for those F1 artifacts to be reconciled. |
| `integration.idempotency_keys`   | STYNX idempotency runtime with a kernel-owned durable store                 | Do not copy the PEC table. Before any PEC write surface is accepted, prove cross-instance replay, fingerprint mismatch rejection, expiry and fail-closed persistence. Process-local memory is not acceptable.                                                                                                             |
| `integration.rate_limit_windows` | STYNX rate-limit runtime with a kernel-owned durable store                  | Do not copy the PEC table. Before parity is claimed, prove tenant-scoped cross-instance windows and expiry against persistent storage.                                                                                                                                                                                    |

`integration.v_transmission_status` becomes a shared delivery read model backed by
the outbox delivery ledger. The current DETRAN base has `integration.outbox` and
adapter-side deterministic idempotency, but it does not yet demonstrate the
origin's durable retry, explicit ACK and inbox behavior. Step 6 cannot pass on
the existing table alone: it must wire or extend the shared outbox runtime and
test retries, duplicate receipts, terminal ACKs and provider failures end to end.

The RENACH adapter contract is extended only inside
`packages/senatran-adapter` when a required operation is missing. Domain packages
consume English ports and never import Portuguese wire DTOs, provider URLs,
certificate handling or mock-specific headers.

### PEC configuration table

`pec.process_parameters` is absorbed by the kernel-owned
`tenancy.tenant_settings.settings` document under the reserved
`ch.processParameters` namespace. A second tenant-configuration table under `ch`
would create competing sources for the same setting and is therefore prohibited.
The origin administration surface (list, normalized-key upsert, delete and feature
evaluation) remains a kernel configuration obligation: writes must be schema
validated, actor-attributed and audited, and feature evaluation must use the
published persistent provider. The origin's `InMemoryFeatureFlagProvider` fallback
is not ported. Until that kernel surface is wired and tested, process-parameter
administration is explicitly deferred and cannot count as runtime parity.

### Port gates created by this mapping

The following are blocking acceptance conditions for downstream PEC steps:

- clinic, professional and station blueprints must precede any `ch` blueprint
  that references them; no generated DDL may reference the removed origin
  `auth.clinics`, `auth.professionals` or `auth.stations` tables;
- session behavior must be demonstrated through the shared runtime before the
  origin `admin-users` and authentication/session tests can count toward parity;
- process-parameter administration must be demonstrated against
  `tenancy.tenant_settings.settings -> 'ch' -> 'processParameters'`; a
  `ch.process_parameter` table or process-local feature provider fails this gate;
- persistent idempotency, rate limiting, outbox attempts, inbound receipts and
  ACK history must be demonstrated before RENACH transmission parity is claimed;
- audit tests must verify one kernel chain rather than preserving PEC's parallel
  audit infrastructure; and
- every superseded origin test must be listed in the parity report with its
  target kernel or adapter test. Removing an infrastructure-specific assertion
  without replacement behavior evidence is not parity.

## Consequences

The Phase 6 port has one identity model, one policy matrix, one session boundary,
one audit chain and one national-system adapter. Three domain concepts formerly
misplaced under `auth` and two formerly described as integration caches become
explicit `ch` records, so replacing infrastructure does not erase clinical
behavior.

This decision also makes current gaps visible. Existing DDL or package presence
is not sufficient evidence for session, idempotency, rate-limit or delivery
parity; those capabilities must be wired to durable stores and tested before the
related origin suites can be retired. No origin module is frozen by this mapping
ADR alone.
