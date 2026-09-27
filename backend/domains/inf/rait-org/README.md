# @detran/inf-rait-org

Module path: `backend/domains/inf/rait-org`.

## Purpose

Organizacao do orgao julgador: calendario de feriados ([WF-RAIT-002] secao 7; UC-RAIT-043 fluxo 1), atos de suspensao de prazo por forca maior (UC-RAIT-022), folha de jeton por periodo (UC-RAIT-036), incidente de prescricao operacional ([WF-RAIT-002] secao 4.1 e 4.2), amostra de qualidade (UC-RAIT-025), plano de capacidade ([WF-RAIT-004] secao 8; UC-RAIT-038) e exportacoes com controle LGPD (UC-RAIT-042). Parametros vivem em ops.parameter (ADR-0021 Decision 6): este blueprint nao define rait_parameter e nenhuma coluna guarda valor de parametro.

## Blueprint

`docs/framework/blueprints/BP-INF-RAIT-ORG-001.json`

## DDL

- `backend/database/ddl/39-inf-rait-org.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-RAIT-ORG-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-RAIT-ORG-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-rait-org typecheck`
- `pnpm --filter @detran/inf-rait-org build`
- `pnpm --filter @detran/inf-rait-org test`
- `pnpm --filter @detran/inf-rait-org test:unit`
- `pnpm --filter @detran/inf-rait-org test:integration`
- `pnpm --filter @detran/inf-rait-org test:e2e`
- `pnpm --filter @detran/inf-rait-org test:real`

## Tests

- `tests/`
