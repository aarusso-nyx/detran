# @detran/ch-patients

Module path: `backend/domains/ch/patients`.

## Purpose

Cadastro do candidato/condutor no PEC, sob o regime de dado pessoal sensivel e retencao minima de 20 anos a partir do ultimo registro.

## Blueprint

`docs/framework/blueprints/BP-CH-PATIENTS-001.json`

## DDL

- `backend/database/ddl/41-ch-patients.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-PATIENTS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-patients typecheck`
- `pnpm --filter @detran/ch-patients build`
- `pnpm --filter @detran/ch-patients test`
- `pnpm --filter @detran/ch-patients test:unit`
- `pnpm --filter @detran/ch-patients test:integration`
- `pnpm --filter @detran/ch-patients test:e2e`
- `pnpm --filter @detran/ch-patients test:real`

## Tests

—
