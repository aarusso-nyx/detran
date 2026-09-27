# @detran/ch-inconsistencies

Module path: `backend/domains/ch/inconsistencies`.

## Purpose

Ciclo auditavel de inconsistencias de dados, com evidencias de deteccao e correcao separadas e transicoes estritamente progressivas.

## Blueprint

`docs/framework/blueprints/BP-CH-INCONSISTENCIES-001.json`

## DDL

- `backend/database/ddl/53-ch-inconsistencies.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-INCONSISTENCIES-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-inconsistencies typecheck`
- `pnpm --filter @detran/ch-inconsistencies build`
- `pnpm --filter @detran/ch-inconsistencies test`
- `pnpm --filter @detran/ch-inconsistencies test:unit`
- `pnpm --filter @detran/ch-inconsistencies test:integration`
- `pnpm --filter @detran/ch-inconsistencies test:e2e`
- `pnpm --filter @detran/ch-inconsistencies test:real`

## Tests

- `tests/`
