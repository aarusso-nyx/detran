# @detran/ch-retention

Module path: `backend/domains/ch/retention`.

## Purpose

Inventario de custodia do prontuario pela plataforma, piso de vinte anos, retencoes juridicas e propostas de destino. Nao existe operacao de eliminacao enquanto preservacao PAdES-LTA estiver ausente.

## Blueprint

`docs/framework/blueprints/BP-CH-RETENTION-001.json`

## DDL

- `backend/database/ddl/48-ch-retention.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-RETENTION-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-retention typecheck`
- `pnpm --filter @detran/ch-retention build`
- `pnpm --filter @detran/ch-retention test`
- `pnpm --filter @detran/ch-retention test:unit`
- `pnpm --filter @detran/ch-retention test:integration`
- `pnpm --filter @detran/ch-retention test:e2e`
- `pnpm --filter @detran/ch-retention test:real`

## Tests

- `tests/`
