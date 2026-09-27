# @detran/ch-scheduling

Module path: `backend/domains/ch/scheduling`.

## Purpose

Agenda homologada e distribuicao P2 auditavel: candidato escolhe regiao e janela, nunca clinica ou perito.

## Blueprint

`docs/framework/blueprints/BP-CH-SCHEDULING-001.json`

## DDL

- `backend/database/ddl/46-ch-scheduling.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-SCHEDULING-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-scheduling typecheck`
- `pnpm --filter @detran/ch-scheduling build`
- `pnpm --filter @detran/ch-scheduling test`
- `pnpm --filter @detran/ch-scheduling test:unit`
- `pnpm --filter @detran/ch-scheduling test:integration`
- `pnpm --filter @detran/ch-scheduling test:e2e`
- `pnpm --filter @detran/ch-scheduling test:real`

## Tests

- `tests/`
