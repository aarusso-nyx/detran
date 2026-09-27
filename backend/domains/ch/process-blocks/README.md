# @detran/ch-process-blocks

Module path: `backend/domains/ch/process-blocks`.

## Purpose

Bloqueios ativos e resolvidos do processo clinico. Cada dominio de origem define seu efeito; este modulo preserva apenas o registro auditable e idempotente sem inventar regras de negocio ausentes.

## Blueprint

`docs/framework/blueprints/BP-CH-PROCESS-BLOCKS-001.json`

## DDL

- `backend/database/ddl/49-ch-process-blocks.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-PROCESS-BLOCKS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-process-blocks typecheck`
- `pnpm --filter @detran/ch-process-blocks build`
- `pnpm --filter @detran/ch-process-blocks test`
- `pnpm --filter @detran/ch-process-blocks test:unit`
- `pnpm --filter @detran/ch-process-blocks test:integration`
- `pnpm --filter @detran/ch-process-blocks test:e2e`
- `pnpm --filter @detran/ch-process-blocks test:real`

## Tests

- `tests/`
