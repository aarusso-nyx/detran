# @detran/ch-clinical-controls

Module path: `backend/domains/ch/clinical-controls`.

## Purpose

Eventos complementares do atendimento clinico, sempre vinculados ao encounter e com autoria auditavel. A participacao de estagiario nao transfere autoria pericial ou autoridade de assinatura.

## Blueprint

`docs/framework/blueprints/BP-CH-CLINICAL-CONTROLS-001.json`

## DDL

- `backend/database/ddl/52-ch-clinical-controls.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-CLINICAL-CONTROLS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-clinical-controls typecheck`
- `pnpm --filter @detran/ch-clinical-controls build`
- `pnpm --filter @detran/ch-clinical-controls test`
- `pnpm --filter @detran/ch-clinical-controls test:unit`
- `pnpm --filter @detran/ch-clinical-controls test:integration`
- `pnpm --filter @detran/ch-clinical-controls test:e2e`
- `pnpm --filter @detran/ch-clinical-controls test:real`

## Tests

- `tests/`
