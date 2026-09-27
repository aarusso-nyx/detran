# @detran/ch-biometrics

Module path: `backend/domains/ch/biometrics`.

## Purpose

Referencias e validacoes biometricas, condicoes estruturadas por dedo e excecoes com aprovacao independente, prazo e escopo.

## Blueprint

`docs/framework/blueprints/BP-CH-BIOMETRICS-001.json`

## DDL

- `backend/database/ddl/45-ch-biometrics.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-BIOMETRICS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-biometrics typecheck`
- `pnpm --filter @detran/ch-biometrics build`
- `pnpm --filter @detran/ch-biometrics test`
- `pnpm --filter @detran/ch-biometrics test:unit`
- `pnpm --filter @detran/ch-biometrics test:integration`
- `pnpm --filter @detran/ch-biometrics test:e2e`
- `pnpm --filter @detran/ch-biometrics test:real`

## Tests

- `tests/`
