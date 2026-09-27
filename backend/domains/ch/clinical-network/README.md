# @detran/ch-clinical-network

Module path: `backend/domains/ch/clinical-network`.

## Purpose

Clinicas credenciadas, profissionais e estacoes biometricas do PEC, relocados do schema auth para o dominio ch conforme ADR-0012.

## Blueprint

`docs/framework/blueprints/BP-CH-CLINICAL-NETWORK-001.json`

## DDL

- `backend/database/ddl/40-ch-clinical-network.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-CLINICAL-NETWORK-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-clinical-network typecheck`
- `pnpm --filter @detran/ch-clinical-network build`
- `pnpm --filter @detran/ch-clinical-network test`
- `pnpm --filter @detran/ch-clinical-network test:unit`
- `pnpm --filter @detran/ch-clinical-network test:integration`
- `pnpm --filter @detran/ch-clinical-network test:e2e`
- `pnpm --filter @detran/ch-clinical-network test:real`

## Tests

- `tests/`
