# @detran/est-crash

Module path: `backend/domains/est/crash`.

## Purpose

BOAT crash records and related entities from WF-BOAT-001 and WF-BOAT-003.

## Blueprint

`docs/framework/blueprints/BP-EST-CRASH-001.json`

## DDL

- `backend/database/ddl/19-est-lifecycle-vocabulary.sql`
- `backend/database/ddl/70-est-crash.sql`

## Routes and contract

- `docs/framework/contracts/BP-EST-CRASH-001.commands.openapi.json`
- `docs/framework/contracts/BP-EST-CRASH-001.openapi.json`

## Scripts

- `pnpm --filter @detran/est-crash typecheck`
- `pnpm --filter @detran/est-crash build`
- `pnpm --filter @detran/est-crash test`
- `pnpm --filter @detran/est-crash test:unit`
- `pnpm --filter @detran/est-crash test:integration`
- `pnpm --filter @detran/est-crash test:e2e`
- `pnpm --filter @detran/est-crash test:real`

## Tests

- `tests/`
