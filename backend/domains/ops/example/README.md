# @detran/ops-example

Module path: `backend/domains/ops/example`.

## Purpose

Tiny Phase 2 generator proof; no real domain behavior.

## Blueprint

`docs/framework/blueprints/BP-OPS-EXAMPLE-001.json`

## DDL

- `backend/database/ddl/30-ops-example.sql`

## Routes and contract

- `docs/framework/contracts/BP-OPS-EXAMPLE-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ops-example typecheck`
- `pnpm --filter @detran/ops-example build`
- `pnpm --filter @detran/ops-example test`
- `pnpm --filter @detran/ops-example test:unit`
- `pnpm --filter @detran/ops-example test:integration`
- `pnpm --filter @detran/ops-example test:e2e`
- `pnpm --filter @detran/ops-example test:real`

## Tests

—
