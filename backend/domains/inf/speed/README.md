# @detran/inf-speed

Module path: `backend/domains/inf/speed`.

## Purpose

Medicao de velocidade por equipamento ACOPLADO ao talao eletronico (UC-TEAT-013). Escopo: inciso II do art. 3o §1o da Res. 918/2022. Fiscalizacao eletronica por equipamento fixo (inciso III, com referendo) esta FORA — ver inf/teat/APP.md secao Fronteira.

## Blueprint

`docs/framework/blueprints/BP-INF-SPEED-001.json`

## DDL

- `backend/database/ddl/37-inf-speed.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-SPEED-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-speed typecheck`
- `pnpm --filter @detran/inf-speed build`
- `pnpm --filter @detran/inf-speed test`
- `pnpm --filter @detran/inf-speed test:unit`
- `pnpm --filter @detran/inf-speed test:integration`
- `pnpm --filter @detran/inf-speed test:e2e`
- `pnpm --filter @detran/inf-speed test:real`

## Tests

- 1 × `src/**/*.spec.ts`
