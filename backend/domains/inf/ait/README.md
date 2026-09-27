# @detran/inf-ait

Module path: `backend/domains/inf/ait`.

## Purpose

AIT issuance and lifecycle with immutable content hash, normative references, and operational satellites.

## Blueprint

`docs/framework/blueprints/BP-INF-AIT-001.json`

## DDL

- `backend/database/ddl/31-inf-ait.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-AIT-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-AIT-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-ait typecheck`
- `pnpm --filter @detran/inf-ait build`
- `pnpm --filter @detran/inf-ait test`
- `pnpm --filter @detran/inf-ait test:unit`
- `pnpm --filter @detran/inf-ait test:integration`
- `pnpm --filter @detran/inf-ait test:e2e`
- `pnpm --filter @detran/inf-ait test:real`

## Tests

- `tests/`
- 8 × `src/**/*.spec.ts`
