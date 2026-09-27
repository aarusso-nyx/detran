# @detran/ops-evidence

Module path: `backend/domains/ops/evidence`.

## Purpose

Evidence metadata, custody and formal access from TEAT evidence workflow and INV-EVIDENCE-001; binary storage remains a STYNX seam.

## Blueprint

`docs/framework/blueprints/BP-OPS-EVIDENCE-001.json`

## DDL

- `backend/database/ddl/17-ops-evidence.sql`

## Routes and contract

- `docs/framework/contracts/BP-OPS-EVIDENCE-001.commands.openapi.json`
- `docs/framework/contracts/BP-OPS-EVIDENCE-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ops-evidence typecheck`
- `pnpm --filter @detran/ops-evidence build`
- `pnpm --filter @detran/ops-evidence test`
- `pnpm --filter @detran/ops-evidence test:unit`
- `pnpm --filter @detran/ops-evidence test:integration`
- `pnpm --filter @detran/ops-evidence test:e2e`
- `pnpm --filter @detran/ops-evidence test:real`

## Tests

- `tests/`
- 8 × `src/**/*.spec.ts`
