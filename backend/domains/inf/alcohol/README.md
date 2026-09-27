# @detran/inf-alcohol

Module path: `backend/domains/inf/alcohol`.

## Purpose

Breathalyzer and alcohol-testing procedure flows ported from TEAT.

## Blueprint

`docs/framework/blueprints/BP-INF-ALCOHOL-001.json`

## DDL

- `backend/database/ddl/33-inf-alcohol.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-ALCOHOL-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-ALCOHOL-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-alcohol typecheck`
- `pnpm --filter @detran/inf-alcohol build`
- `pnpm --filter @detran/inf-alcohol test`
- `pnpm --filter @detran/inf-alcohol test:unit`
- `pnpm --filter @detran/inf-alcohol test:integration`
- `pnpm --filter @detran/inf-alcohol test:e2e`
- `pnpm --filter @detran/inf-alcohol test:real`

## Tests

- `tests/`
- 9 × `src/**/*.spec.ts`
