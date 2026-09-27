# @detran/ops-agency

Module path: `backend/domains/ops/agency`.

## Purpose

Minimum institutional context for TEAT mobile bootstrap and jurisdiction routing (teat-route-contract.md §4.1; steering H.40; OD-T02/OD-013).

## Blueprint

`docs/framework/blueprints/BP-OPS-AGENCY-001.json`

## DDL

- `backend/database/ddl/13-ops-agency.sql`

## Routes and contract

- `docs/framework/contracts/BP-OPS-AGENCY-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ops-agency typecheck`
- `pnpm --filter @detran/ops-agency build`
- `pnpm --filter @detran/ops-agency test`
- `pnpm --filter @detran/ops-agency test:unit`
- `pnpm --filter @detran/ops-agency test:integration`
- `pnpm --filter @detran/ops-agency test:e2e`
- `pnpm --filter @detran/ops-agency test:real`

## Tests

—
