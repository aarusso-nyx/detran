# @detran/ch-exams

Module path: `backend/domains/ch/exams`.

## Purpose

Exames medico e psicologico do PEC com vocabulularios federais separados, validade legal 10/5/3 e instrumentos psicologicos favoraveis no SATEPSI.

## Blueprint

`docs/framework/blueprints/BP-CH-EXAMS-001.json`

## DDL

- `backend/database/ddl/43-ch-exams.sql`

## Routes and contract

- `docs/framework/contracts/BP-CH-EXAMS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/ch-exams typecheck`
- `pnpm --filter @detran/ch-exams build`
- `pnpm --filter @detran/ch-exams test`
- `pnpm --filter @detran/ch-exams test:unit`
- `pnpm --filter @detran/ch-exams test:integration`
- `pnpm --filter @detran/ch-exams test:e2e`
- `pnpm --filter @detran/ch-exams test:real`

## Tests

- `tests/`
