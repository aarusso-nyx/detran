# @detran/ops-parameter

Module path: `backend/domains/ops/parameter`.

## Purpose

Shared versioned parameter store from ADR-0021 Decision 1; command discipline follows UC-RAIT-043 §Fluxo principal.

## Blueprint

`docs/framework/blueprints/BP-OPS-PARAMETER-001.json`

## DDL

- `backend/database/ddl/15-ops-parameter.sql`

## Routes and contract

- `docs/framework/contracts/BP-OPS-PARAMETER-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ops-parameter typecheck`
- `pnpm --filter @detran/ops-parameter build`
- `pnpm --filter @detran/ops-parameter test`
- `pnpm --filter @detran/ops-parameter test:unit`
- `pnpm --filter @detran/ops-parameter test:integration`
- `pnpm --filter @detran/ops-parameter test:e2e`
- `pnpm --filter @detran/ops-parameter test:real`

## Tests

- `tests/`
