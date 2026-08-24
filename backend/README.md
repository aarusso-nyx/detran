# backend — the unified DETRAN backend

One NestJS **modular monolith**, one deployable, one PostgreSQL (schema-per-domain,
RLS throughout). See ADR-0002.

- `app/` — composition root: stynx adapter kernel, fail-closed runtime profiles,
  unified policy matrix, tenancy enforcement, persisted audit sink (Phase 2, W2.1).
- `domains/` — real pnpm workspace packages per domain module, explicit deps, no deep
  relative imports: `inf/`, `est/`, `ch/`, `ops/`, plus transversal `portal/`,
  `dashboard/` and `shared/`.
- `database/ddl/` — SQL-first DDL: shared `auth`/`audit`/`storage`/`integration`
  schemas + `inf.*`/`est.*`/`ch.*`/`ops.*` (see its README).

`vam` (RENAVAM) is reserved and not built.
