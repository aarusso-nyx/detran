# @detran/ops-field

Module path: `backend/domains/ops/field`.

## Purpose

Field-operation context from TEAT BP-MOBILE-OPERATIONS-001 and RN-TEAT-003; handwritten operations routes remain mounted through the generated module.

## Blueprint

`docs/framework/blueprints/BP-OPS-FIELD-001.json`

## DDL

- `backend/database/ddl/13-ops-field-operations.sql`

## Routes and contract

- `docs/framework/contracts/BP-OPS-FIELD-001.commands.openapi.json`
- `docs/framework/contracts/BP-OPS-FIELD-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ops-field typecheck`
- `pnpm --filter @detran/ops-field build`
- `pnpm --filter @detran/ops-field test`
- `pnpm --filter @detran/ops-field test:unit`
- `pnpm --filter @detran/ops-field test:integration`
- `pnpm --filter @detran/ops-field test:e2e`
- `pnpm --filter @detran/ops-field test:real`

## Tests

- `tests/`
- 2 × `src/**/*.spec.ts`
