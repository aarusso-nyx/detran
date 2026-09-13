# Unified backend DDL

Applied in numeric order by `../apply.sh`:

1. `00-extensions.sql` — pgcrypto, uuid-ossp, citext and PostGIS.
2. `01-schemas.sql` — shared plus empty `inf`/`est`/`ch`/`ops` domain schemas.
3. `02-auth.sql` — DETRAN tenants, identities, roles, memberships and sessions.
4. `03-audit.sql` — partitioned append-only `audit.events`.
5. `04-integration-storage.sql` — shared outbox and storage metadata foundations.
6. `05-role-catalog.sql` — canonical DETRAN role catalogue (`auth.role_catalog`), seeded
   one-to-one with `backend/domains/shared/src/roles.ts` and enforced on `auth.roles.key`
   (`pnpm verify:role-catalog`).
7. `10-postgis-functions.sql` — SRID-4674 JSON/GeoJSON conversion helpers.
8. `11-auth-functions.sql` — request tenant setting, RLS helper and automatic
   `enforce_tenant_id` trigger installer.
9. `12-audit-functions.sql` — serialized per-tenant hash-chain persistence and
   verification.
10. `13-ops-field-operations.sql` — Phase 2 field operations, frozen external
    lookup snapshots and evidence custody, all owned by `ops.*`.
11. `14-inf-lifecycle-vocabulary.sql` — reference tables of the infraction lifecycle
    (`inf.infraction_*_ref`, `inf.notification_channel_ref`): states, sub-states,
    closure motives, timers, transitions and events of `WF-INF-003`/`WF-INF-002 §9`
    (`pnpm verify:lifecycle-vocabulary`).
12. `20-rls-policies.sql` — forced RLS, trigger installation and least-privilege
    grants.

`auth.tenants` is the canonical DETRAN tenant table. `tenancy.tenants` is a
simple, automatically updatable compatibility view exposing the columns used by
`@stynx-nyx/tenancy`; this prevents a second tenant source of truth.
