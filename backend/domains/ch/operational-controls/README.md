# @detran/ch-operational-controls

Module path: `backend/domains/ch/operational-controls`.

## Purpose

Registro auditavel de controles operacionais preservados do PEC, inclusive validacao geodesica de local de clinica.

## Blueprint

`docs/framework/blueprints/BP-CH-OPERATIONAL-CONTROLS-001.json`

## DDL

- `backend/database/ddl/54-ch-operational-controls.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-OPERATIONAL-CONTROLS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-operational-controls typecheck`
- `pnpm --filter @detran/ch-operational-controls build`
- `pnpm --filter @detran/ch-operational-controls test`
- `pnpm --filter @detran/ch-operational-controls test:unit`
- `pnpm --filter @detran/ch-operational-controls test:integration`
- `pnpm --filter @detran/ch-operational-controls test:e2e`
- `pnpm --filter @detran/ch-operational-controls test:real`

## Tests

- `tests/`
