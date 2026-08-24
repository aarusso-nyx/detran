# backend/database/ddl — one PostgreSQL, schema-per-domain

The unified backend uses **one PostgreSQL database** (with PostGIS, SRID 4674) organised as
**one schema per domain**, plus shared cross-cutting schemas. RLS is enforced throughout
(Decisions Ledger #6; ADR-0002).

## Schema convention

Shared (cross-domain) schemas:

- `auth` — identities, roles, tenant (UF DETRAN) entitlements, RLS helper functions and
  `enforce_tenant_id` auto-triggers (kit ported from `pec/database/ddl/11-auth-functions.sql`).
- `audit` — append-only, hash-chained `audit.events`
  (from `pec/database/ddl/14-audit-functions.sql`).
- `storage` — object/file custody metadata.
- `integration` — outbox, transmission state, adapter bookkeeping.

Domain schemas, prefixed by domain:

- `inf.*` — infrações (RENAINF): AIT lifecycle, defesas, penalidades, recursos, julgamento.
- `est.*` — sinistros (RENAEST): crash records (seeded from teat's `crash.*` DDL in Phase 5).
- `ch.*` — condutor/habilitação (RENACH): the former pec schemas (Phase 6).
- `ops.*` — field operations: agents, devices, shifts, evidence custody, offline sync, snapshots.

`vam.*` (RENAVAM) is reserved and not built. Transversal `portal`/`dashboard` domains use
read-models over the domain schemas rather than schemas of their own unless an ADR says
otherwise.

DDL lands here in Phase 2 (W2.1: shared schemas + RLS kit + PostGIS 4674 kit) and grows
per-domain with each port. SQL-first, no ORM.
