# @detran/portal-complaints

Module path: `backend/domains/portal/complaints`.

## Purpose

Ouvidoria protocol intake and auditable triage owned by Portal. This is the reviewed UC-PORTAL-016 realization and the durable successor to PEC complaints; it does not create a competing CH aggregate.

## Blueprint

`docs/framework/blueprints/BP-PORTAL-COMPLAINTS-001.json`

## DDL

- `backend/database/ddl/60-portal-complaints.sql`

## Routes and contract

- `docs/framework/contracts/BP-PORTAL-COMPLAINTS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/portal-complaints typecheck`
- `pnpm --filter @detran/portal-complaints build`
- `pnpm --filter @detran/portal-complaints test`
- `pnpm --filter @detran/portal-complaints test:unit`
- `pnpm --filter @detran/portal-complaints test:integration`
- `pnpm --filter @detran/portal-complaints test:e2e`
- `pnpm --filter @detran/portal-complaints test:real`

## Tests

- `tests/`
