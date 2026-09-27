# @detran/ch-billing

Module path: `backend/domains/ch/billing`.

## Purpose

Faturamento vinculado ao preco publico federal versionado por especie de exame, vigencia e referencia anual IPCA. Clinicas nao informam nem substituem o valor de exame.

## Blueprint

`docs/framework/blueprints/BP-CH-BILLING-001.json`

## DDL

- `backend/database/ddl/51-ch-billing.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-BILLING-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-billing typecheck`
- `pnpm --filter @detran/ch-billing build`
- `pnpm --filter @detran/ch-billing test`
- `pnpm --filter @detran/ch-billing test:unit`
- `pnpm --filter @detran/ch-billing test:integration`
- `pnpm --filter @detran/ch-billing test:e2e`
- `pnpm --filter @detran/ch-billing test:real`

## Tests

- `tests/`
