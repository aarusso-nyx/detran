# Unified backend DDL

Applied in numeric order by `../apply.sh`:

1. `00-extensions.sql` — pgcrypto, uuid-ossp, citext and PostGIS.
2. `01-schemas.sql` — shared plus empty `inf`/`est`/`ch`/`ops` domain schemas.
3. `02-auth.sql` — DETRAN tenants, identities, roles, memberships and sessions.
4. `03-audit.sql` — partitioned append-only `audit.events`.
5. `04-integration-storage.sql` — shared outbox and storage metadata foundations.
6. `10-postgis-functions.sql` — SRID-4674 JSON/GeoJSON conversion helpers.
7. `11-auth-functions.sql` — request tenant setting, RLS helper and automatic
   `enforce_tenant_id` trigger installer.
8. `12-audit-functions.sql` — serialized per-tenant hash-chain persistence and
   verification.
9. `13-ops-field-operations.sql` — Phase 2 field operations, frozen external
   lookup snapshots and evidence custody, all owned by `ops.*`.
10. `20-rls-policies.sql` — forced RLS, trigger installation and least-privilege
    grants.

`auth.tenants` is the canonical DETRAN tenant table. `tenancy.tenants` is a
simple, automatically updatable compatibility view exposing the columns used by
`@stynx-nyx/tenancy`; this prevents a second tenant source of truth.
