# @detran/ops-provisioning

Module path: `backend/domains/ops/provisioning`.

## Purpose

Operational offline provisioning from offline-operational-provisioning.md §§1–12 and INV-OFFLINE-001; cryptographic algorithms and wire format remain source_pending until the cross-platform security decision.

## Blueprint

`docs/framework/blueprints/BP-OPS-PROVISIONING-001.json`

## DDL

- `backend/database/ddl/21-ops-provisioning.sql`

## Routes and contract

- `docs/framework/contracts/BP-OPS-PROVISIONING-001.commands.openapi.json`
- `docs/framework/contracts/BP-OPS-PROVISIONING-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ops-provisioning typecheck`
- `pnpm --filter @detran/ops-provisioning build`
- `pnpm --filter @detran/ops-provisioning test`
- `pnpm --filter @detran/ops-provisioning test:unit`
- `pnpm --filter @detran/ops-provisioning test:integration`
- `pnpm --filter @detran/ops-provisioning test:e2e`
- `pnpm --filter @detran/ops-provisioning test:real`

## Tests

- `tests/`
- 1 × `src/**/*.spec.ts`
