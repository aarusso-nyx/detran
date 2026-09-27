# @detran/dashboard-monitor

Module path: `backend/domains/dashboard/monitor`.

## Purpose

Estado proprio e projecoes do DASHBOARD (dashboard-build-pack secao WP-D1; ADR-0020 Decisoes 1, 3 e 4; WF-DASH-001 ciclo do alerta, WF-DASH-002 calendario de deveres periodicos, WF-DASH-003 frescor; plan R-0011 M1..M5). O DASHBOARD nao tem base de negocio: le projecoes alimentadas por eventos e mantem so o seu proprio estado (alert, alert\_trail, duty, duty\_cycle, indicator, indicator\_config, bi\_panel, generated\_report, export\_log, source, transparency\_audit, dataset). As oito projecoes deste pacote (prescription\_risk, production, integration\_health, pec\_deadlines, teat\_measures, portal\_service\_metrics, duty\_evidence, source\_freshness -> source) sao projetores manuscritos em src/handwritten/projections/\*.projection.ts, idempotentes em event.id via o ledger unico monitor\_projection\_applied\_event, replayaveis da integration.outbox e versionados (event\_schema\_version, aggregate\_version). A projecao dashboard.crashes NAO e redefinida aqui: e BP-DASHBOARD-CRASHES-001 (plan M2), citada por indicator.projection dos IND-DASH-203/204/310. Vocabulario global (alert\_state\_ref, alert\_transition\_ref, duty\_state\_ref, duty\_transition\_ref, freshness\_state\_ref, severity\_ref, layer\_ref, classification\_ref, block\_ref, timer\_ref) em 19-dashboard-lifecycle-vocabulary.sql; os checks deste blueprint repetem os mesmos conjuntos. Nenhum dado pessoal, placa, numero de processo ou atributo de saude em coluna alguma (RN-DASH-170 N3): identificacao de objeto so como object\_ref opaco com object\_layer. CTG-0002 (module.version 1.1.0, plan M15..M25, contrato work/rounds/R-0011/contracts/CTG-0002.md): entidades timer (relogio proprio, M15) e access\_log (RN-DASH-171, append-only); sete controllers manuscritos em src/handwritten/surface/\*.controller.ts com as rotas de dashboard-route-contract secao 2..secao 4 literalmente (todo api.resources[].operations continua [] - nada gerado tem rota; politica dashboard:\* de policy.ts, camada por dashboardLayerFor, @Audit DASH\_<VERBO>); servicos do ciclo em src/handwritten/cycle (relogio, sweeper, alerta, deveres, frescor, notificador) e da superficie em src/handwritten/surface (layer gate, exportacao, relatorios, catalogo, auditoria, dados abertos); tres indices handwritten (index, cycle/index, surface/index) com reexport nomeado (A13). @detran/inf-deadlines entra so como dependencia de leitura (Calendar, Clock, InMemoryCalendar, FixedClock; backend/domains/inf/deadlines nunca e editado, OD-D28); @detran/dashboard-crashes e lido pela API publica do pacote de R-0010 (DashboardCrashesProjection.readInternal) para IND-DASH-203/204/310, nunca por dashboard.crash\_\* direto; zod para os DTOs dos comandos. SSE GET /v1/dashboard/stream vive em backend/app/src/dashboard-stream.{service,controller}.ts (M23). A cadeia de escalonamento e vocabulario global dashboard.escalation\_chain\_ref (DDL 19, M18).

## Blueprint

`docs/framework/blueprints/BP-DASH-MONITOR-001.json`

## DDL

- `backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql`
- `backend/database/ddl/80-dashboard.sql`

## Routes and contract

- `docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json`
- `docs/framework/contracts/BP-DASH-MONITOR-001.openapi.json`

## Scripts

- `pnpm --filter @detran/dashboard-monitor typecheck`
- `pnpm --filter @detran/dashboard-monitor build`
- `pnpm --filter @detran/dashboard-monitor test`
- `pnpm --filter @detran/dashboard-monitor test:unit`
- `pnpm --filter @detran/dashboard-monitor test:integration`
- `pnpm --filter @detran/dashboard-monitor test:e2e`
- `pnpm --filter @detran/dashboard-monitor test:real`

## Tests

- `tests/`
