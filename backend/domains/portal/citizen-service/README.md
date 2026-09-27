# @detran/portal-citizen-service

Module path: `backend/domains/portal/citizen-service`.

## Purpose

Atendimento ao cidadao (ADR-0019 Decision 4; [WF-PORTAL-004] secao Estados, secao Prazos e secao Carta de Servicos; plan R-0009 M12-M14): manifestacao de ouvidoria da Lei 13.460/2017 (entidade distinta de portal.complaint do PEC, M2 — nunca duas tabelas para a mesma manifestacao; unificacao futura e OD-P14), prorrogacao justificada dos prazos do art. 16 e Carta de Servicos como dados (portal.service_catalog, 11 campos de RN-PORTAL-108). Prazos calculados com addCalendarDays de @detran/inf-deadlines; timers T-OUV-RESPOSTA, T-OUV-INFO, T-LGPD-ACESSO e T-AVAL-CONVITE (owner = portal) em inf.infraction_timer_ref, espelhados em portal-timers.ts (M14). brand_profile e public_hostname NAO sao entidades deste blueprint: DDL manuscrito 19-portal-platform.sql (M11). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica MANIFESTACAO_REGISTRADA e MANIFESTACAO_ENCERRADA (M21).

## Blueprint

`docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json`

## DDL

- `backend/database/ddl/64-portal-citizen-service.sql`

## Routes and contract

- `docs/framework/contracts/BP-PORTAL-CITIZEN-SERVICE-001.commands.openapi.json`
- `docs/framework/contracts/BP-PORTAL-CITIZEN-SERVICE-001.openapi.json`

## Scripts

- `pnpm --filter @detran/portal-citizen-service typecheck`
- `pnpm --filter @detran/portal-citizen-service build`
- `pnpm --filter @detran/portal-citizen-service test`
- `pnpm --filter @detran/portal-citizen-service test:unit`
- `pnpm --filter @detran/portal-citizen-service test:integration`
- `pnpm --filter @detran/portal-citizen-service test:e2e`
- `pnpm --filter @detran/portal-citizen-service test:real`

## Tests

- `tests/`
- 2 × `src/**/*.spec.ts`
