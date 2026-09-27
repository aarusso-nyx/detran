# @detran/ops-offline-sync

Module path: `backend/domains/ops/offline-sync`.

## Purpose

Offline numbering and durable synchronization from WF-TEAT-002 and INV-OFFLINE-001; no WP-T2 controller is mounted in this round.

## Blueprint

`docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json`

## DDL

- `backend/database/ddl/18-ops-offline-sync.sql`

## Routes and contract

- `docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`
- `docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ops-offline-sync typecheck`
- `pnpm --filter @detran/ops-offline-sync build`
- `pnpm --filter @detran/ops-offline-sync test`
- `pnpm --filter @detran/ops-offline-sync test:unit`
- `pnpm --filter @detran/ops-offline-sync test:integration`
- `pnpm --filter @detran/ops-offline-sync test:e2e`
- `pnpm --filter @detran/ops-offline-sync test:real`

## Tests

- `tests/`
- 2 × `src/**/*.spec.ts`
