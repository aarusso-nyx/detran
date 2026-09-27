# @detran/inf-normative

Module path: `backend/domains/inf/normative`.

## Purpose

Infraction catalog, framing rules, agency parameters, templates, and mobile package versioning ported from TEAT.

## Blueprint

`docs/framework/blueprints/BP-INF-NORMATIVE-001.json`

## DDL

- `backend/database/ddl/30-inf-normative.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-NORMATIVE-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-NORMATIVE-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-normative typecheck`
- `pnpm --filter @detran/inf-normative build`
- `pnpm --filter @detran/inf-normative test`
- `pnpm --filter @detran/inf-normative test:unit`
- `pnpm --filter @detran/inf-normative test:integration`
- `pnpm --filter @detran/inf-normative test:e2e`
- `pnpm --filter @detran/inf-normative test:real`

## Tests

- `tests/`
- 7 × `src/**/*.spec.ts`
