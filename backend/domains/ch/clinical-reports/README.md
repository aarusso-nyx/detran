# @detran/ch-clinical-reports

Module path: `backend/domains/ch/clinical-reports`.

## Purpose

Laudos, adendos imutaveis e documentos clinicos com PAdES+TSA, validacao OCSP/CRL e artefatos sob custodia STYNX.

## Blueprint

`docs/framework/blueprints/BP-CH-REPORTS-001.json`

## DDL

- `backend/database/ddl/44-ch-reports.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-REPORTS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-clinical-reports typecheck`
- `pnpm --filter @detran/ch-clinical-reports build`
- `pnpm --filter @detran/ch-clinical-reports test`
- `pnpm --filter @detran/ch-clinical-reports test:unit`
- `pnpm --filter @detran/ch-clinical-reports test:integration`
- `pnpm --filter @detran/ch-clinical-reports test:e2e`
- `pnpm --filter @detran/ch-clinical-reports test:real`

## Tests

- `tests/`
