# @detran/inf-measures

Module path: `backend/domains/inf/measures`.

## Purpose

Administrative measures, terms, retention, removal, inventory, providers, yards, and status history.

## Blueprint

`docs/framework/blueprints/BP-INF-MEASURES-001.json`

## DDL

- `backend/database/ddl/32-inf-measures.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-MEASURES-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-MEASURES-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-measures typecheck`
- `pnpm --filter @detran/inf-measures build`
- `pnpm --filter @detran/inf-measures test`
- `pnpm --filter @detran/inf-measures test:unit`
- `pnpm --filter @detran/inf-measures test:integration`
- `pnpm --filter @detran/inf-measures test:e2e`
- `pnpm --filter @detran/inf-measures test:real`

## Tests

- `tests/`
- 12 × `src/**/*.spec.ts`
