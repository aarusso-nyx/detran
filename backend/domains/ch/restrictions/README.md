# @detran/ch-restrictions

Module path: `backend/domains/ch/restrictions`.

## Purpose

Catalogo versionado do Anexo XV e restricoes aplicadas ao encounter. Nenhum codigo e inventado enquanto o anexo autoritativo estiver ausente.

## Blueprint

`docs/framework/blueprints/BP-CH-RESTRICTIONS-001.json`

## DDL

- `backend/database/ddl/47-ch-restrictions.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-RESTRICTIONS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-restrictions typecheck`
- `pnpm --filter @detran/ch-restrictions build`
- `pnpm --filter @detran/ch-restrictions test`
- `pnpm --filter @detran/ch-restrictions test:unit`
- `pnpm --filter @detran/ch-restrictions test:integration`
- `pnpm --filter @detran/ch-restrictions test:e2e`
- `pnpm --filter @detran/ch-restrictions test:real`

## Tests

- `tests/`
