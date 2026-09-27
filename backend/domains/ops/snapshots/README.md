# @detran/ops-snapshots

Module path: `backend/domains/ops/snapshots`.

## Purpose

Frozen external lookup snapshots preserved for legal acts, migrated from TEAT BP-EXTERNAL-SNAPSHOTS-001.

## Blueprint

`docs/framework/blueprints/BP-OPS-SNAPSHOTS-001.json`

## DDL

- `backend/database/ddl/16-ops-snapshots.sql`

## Routes and contract

- `docs/framework/contracts/BP-OPS-SNAPSHOTS-001.commands.openapi.json`
- `docs/framework/contracts/BP-OPS-SNAPSHOTS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ops-snapshots typecheck`
- `pnpm --filter @detran/ops-snapshots build`
- `pnpm --filter @detran/ops-snapshots test`
- `pnpm --filter @detran/ops-snapshots test:unit`
- `pnpm --filter @detran/ops-snapshots test:integration`
- `pnpm --filter @detran/ops-snapshots test:e2e`
- `pnpm --filter @detran/ops-snapshots test:real`

## Tests

- `tests/`
- 2 × `src/**/*.spec.ts`
