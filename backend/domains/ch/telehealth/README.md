# @detran/ch-telehealth

Module path: `backend/domains/ch/telehealth`.

## Purpose

Sessoes de telessaude com LFD obrigatorio por etapa. Persiste referencia externa opaca, nunca URL tokenizada ou credencial de acesso.

## Blueprint

`docs/framework/blueprints/BP-CH-TELEHEALTH-001.json`

## DDL

- `backend/database/ddl/50-ch-telehealth.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-TELEHEALTH-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-telehealth typecheck`
- `pnpm --filter @detran/ch-telehealth build`
- `pnpm --filter @detran/ch-telehealth test`
- `pnpm --filter @detran/ch-telehealth test:unit`
- `pnpm --filter @detran/ch-telehealth test:integration`
- `pnpm --filter @detran/ch-telehealth test:e2e`
- `pnpm --filter @detran/ch-telehealth test:real`

## Tests

- `tests/`
