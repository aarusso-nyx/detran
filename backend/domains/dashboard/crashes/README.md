# @detran/dashboard-crashes

Module path: `backend/domains/dashboard/crashes`.

## Purpose

Agregacao interna de sinistros para dashboard.crashes (ADR-0020 Decision 1, 3 e 4; C-2-13/14; RN-DASH-161 e RN-BOAT-131). O projetor manuscrito consome somente o envelope canonico BOAT da integration.outbox, guarda event_schema_version separado de aggregate_version e registra efeito e ledger na mesma transacao. Nao ha rota publica, dado individual, escrita em est.* ou habilitacao de P-09; leitura e exportacao aplicam dashboard.cell_threshold=10 com supressao primaria e secundaria antes da entrega.

## Blueprint

`docs/framework/blueprints/BP-DASHBOARD-CRASHES-001.json`

## DDL

- `backend/database/ddl/71-dashboard-crashes.sql`

## Routes and contract

- `docs/framework/contracts/BP-DASHBOARD-CRASHES-001.openapi.json`

## Scripts

- `pnpm --filter @detran/dashboard-crashes typecheck`
- `pnpm --filter @detran/dashboard-crashes build`
- `pnpm --filter @detran/dashboard-crashes test`
- `pnpm --filter @detran/dashboard-crashes test:unit`
- `pnpm --filter @detran/dashboard-crashes test:integration`
- `pnpm --filter @detran/dashboard-crashes test:e2e`
- `pnpm --filter @detran/dashboard-crashes test:real`

## Tests

—
