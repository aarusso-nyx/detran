# @detran/inf-rait-integration

Module path: `backend/domains/inf/rait-integration`.

## Purpose

Conciliacao do RAIT com os registros nacionais (UC-RAIT-029 fluxo 3 e UC-RAIT-031 fluxo 3 e 3a): fato proprio do RAIT, nao projecao (ADR-0020 Decision 1 e 2). Nenhuma chamada nacional sai daqui — so o packages/senatran-adapter fala com RENAINF, RENACH e SNE (ADR-0003; AC-RAIT-029-1) — e nenhuma escrita na integration.outbox: a projecao da outbox por sistema pertence ao consumidor (dashboard.integration_health, ADR-0020 Decision 2) e nasce em WP-P (decisao M10). Nenhuma FK entre schemas.

## Blueprint

`docs/framework/blueprints/BP-INF-RAIT-INTEGRATION-001.json`

## DDL

- `backend/database/ddl/58-inf-rait-integration.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-RAIT-INTEGRATION-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-RAIT-INTEGRATION-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-rait-integration typecheck`
- `pnpm --filter @detran/inf-rait-integration build`
- `pnpm --filter @detran/inf-rait-integration test`
- `pnpm --filter @detran/inf-rait-integration test:unit`
- `pnpm --filter @detran/inf-rait-integration test:integration`
- `pnpm --filter @detran/inf-rait-integration test:e2e`
- `pnpm --filter @detran/inf-rait-integration test:real`

## Tests

- `tests/`
