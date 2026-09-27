# @detran/ch-encounters

Module path: `backend/domains/ch/encounters`.

## Purpose

Agendamentos e atendimentos clinicos do PEC. O ciclo de vida implementa WF-PEC-001 e torna CANCELLED alcancavel com motivo auditavel.

## Blueprint

`docs/framework/blueprints/BP-CH-ENCOUNTERS-001.json`

## DDL

- `backend/database/ddl/42-ch-encounters.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-ENCOUNTERS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-encounters typecheck`
- `pnpm --filter @detran/ch-encounters build`
- `pnpm --filter @detran/ch-encounters test`
- `pnpm --filter @detran/ch-encounters test:unit`
- `pnpm --filter @detran/ch-encounters test:integration`
- `pnpm --filter @detran/ch-encounters test:e2e`
- `pnpm --filter @detran/ch-encounters test:real`

## Tests

- `tests/`
