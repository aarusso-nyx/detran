# @detran/integration-renaest-mirror

Module path: `backend/domains/integration/renaest-mirror`.

## Purpose

Espelho consumidor integration.renaest\_mirror fisicamente em backend/domains/integration/renaest-mirror e logicamente do adapter (ADR-0001 amendment; ADR-0020 Decision 1, 3 e 4; C-2-14). O projetor manuscrito recebe eventos e recibos BOAT canonicos da integration.outbox, mantendo somente protocolo, situacao nacional, retificacoes e ledger local. Ele nao chama SENATRAN, nao tem FK para est.\*, nao le est.\* exceto pela leitura de evento permitida em arquivo \*.projection.ts, e nunca altera o estado BOAT.

## Blueprint

`docs/framework/blueprints/BP-INTEGRATION-RENAEST-MIRROR-001.json`

## DDL

- `backend/database/ddl/72-integration-renaest-mirror.sql`

## Routes and contract

- `docs/framework/contracts/BP-INTEGRATION-RENAEST-MIRROR-001.openapi.json`

## Scripts

- `pnpm --filter @detran/integration-renaest-mirror typecheck`
- `pnpm --filter @detran/integration-renaest-mirror build`
- `pnpm --filter @detran/integration-renaest-mirror test`
- `pnpm --filter @detran/integration-renaest-mirror test:unit`
- `pnpm --filter @detran/integration-renaest-mirror test:integration`
- `pnpm --filter @detran/integration-renaest-mirror test:e2e`
- `pnpm --filter @detran/integration-renaest-mirror test:real`

## Tests

—
