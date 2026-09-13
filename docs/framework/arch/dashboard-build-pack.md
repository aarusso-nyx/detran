---
id: ARCH-DASHBOARD-BUILD-PACK
title: Pacote de construção do DASHBOARD — definições e pacotes de trabalho para a orquestra (projeções, ciclo do alerta, deveres, frescor, console)
status: draft
apps: [dashboard]
updated: 2026-09-13
---

# Pacote de construção do DASHBOARD

Índice das definições para construir `backend/domains/dashboard` e `apps/dashboard/web`. Segue
`rait-build-pack.md` §0 e os manuais de `docs/meta/agents/`. Fontes: [APP-DASHBOARD],
[WF-DASH-001…003], [UC-DASH-001…008], [RN-DASH-101…173], [JRN-DASH-001…007], [IU-DASH-001];
`dashboard-frontends.md`, `dashboard-route-contract.md`, `dashboard-error-catalog.md`; ADR-0018
(projeções, gate `verify:domain-boundaries`), `rait-events-sse-contract.md`, `rait-deadline-engine.md`;
origem: `BP-BI-REPORTING-001`, grupo `bi` da matriz web do TEAT (`UX-WEB-090…093`).

## 1. Estado de partida (verificado em 2026-09-13)

| Item                        | Situação                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `backend/domains/dashboard` | só README (Fase 3 W3.6); nenhuma projeção, DDL ou módulo                                                                                                                 |
| `apps/dashboard/web`        | só README                                                                                                                                                                |
| Política                    | 5 regras da origem (`generated-report` request/complete/fail, `indicator-config` publish, `bi-panel` publish); nada para alertas, deveres, fontes, exportação            |
| Papéis                      | `bi-analyst`, `agency-admin`, `technical-admin`, `integration-operator`, `AUDITOR` existem; operador de monitoramento e dono de dever não                                |
| Eventos de origem           | RAIT contratado (`rait.clock.flag-changed`, `rait.case.changed`, `inf.infraction.changed`); PEC, TEAT, PORTAL sem contrato; BOAT previsto em `boat-route-contract.md` §7 |
| Corpus                      | APP, WF-001…003, UC-001/002/003/004/006/008 `approved`; UC-005/007 `reviewed`; IU `reviewed`; 31 regras e 7 jornadas `draft`; DT-030 fechou 9 calibrações                |
| Bloqueios                   | P-09 (DT-029), parte de P-08 (DT-066); IND-DASH-204 nunca chega a `SUBMETIDO_PUBLICADO` enquanto a lacuna normativa persistir                                            |

## 2. Pacotes de trabalho

### WP-D0 — Papéis, política e catálogo (Engineer; Owner para papéis)

Adicionar `dash-operator` e `dash-duty-owner` ao catálogo de papéis (`roles.ts`,
`05-role-catalog.sql`, `shared/actors.md`) ou decidir mapeamento em papéis existentes (OD-D01);
regras `dashboard:alert:*`, `duty-cycle:*`, `source:read`, `export:*`, `audit-trail:read`,
`comparison:read`, `transparency-audit:audit`, `dataset:read`; `layerGuard` N0…N3 no
`policy.ts` (camada por papel e domínio). Seed do catálogo de 42 indicadores em
`dashboard.indicator` (bloco, fonte, limiar, dono, classificação, latência) a partir de
[APP-DASHBOARD] §Catálogo. Gate: `policy.spec.ts`, `verify:role-catalog`, `docs:kb:check`.

### WP-D1 — Projeções e estado próprio (Architect-blueprint)

| Blueprint `BP-DASH-MONITOR-001` (namespace `dashboard`) | Conteúdo                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estado próprio                                          | `alert` (estados de [WF-DASH-001], `track: extinction\|irregularity`, severidade, indicador, objeto opaco por camada, dono, `governing_clock`, `next_milestone_at`, trilha imutável), `duty` (14 linhas), `duty_cycle` (estados de [WF-DASH-002], evidência), `indicator` (42), `indicator_config`, `bi_panel`, `generated_report`, `export_log`, `source` (frescor), `transparency_audit`, `dataset` |
| Projeções                                               | `prescription_risk`, `production`, `integration_health`, `crashes`, `pec_deadlines`, `teat_measures`, `portal_service_metrics`, `duty_evidence`, `source_freshness` — cada uma em `*.projection.ts` declarando eventos de origem, idempotente em `event.id`, versionada                                                                                                                               |
| Referência                                              | `dashboard.alert_state_ref`, `duty_state_ref`, `freshness_state_ref`, `severity_ref` (N1/N2/N3/CRITICO), `layer_ref` (N0…N3), `classification_ref` (P1/P2/P3), `block_ref` (A/B/C/D)                                                                                                                                                                                                                  |
| Timers                                                  | SLA de ACK por severidade (24h/8h/2h úteis, imediato), marcos 50/75/90%, viradas de período dos 14 deveres, piso de 60 dias para indicadores sem prazo (309, 314) — no motor de prazos com `owner='dashboard'`, calendário `calendar-2026.json`                                                                                                                                                       |

Fixtures: um alerta por estado e trilha, um ciclo por estado de dever, fontes nos quatro estados de
frescor, exportação pendente de aprovação. Gate: `blueprints:check`, `verify:rls-ddl`,
`verify:domain-boundaries` (nenhuma leitura de `inf.*`, `est.*`, `ch.*`, `portal.*` fora de
`*.projection.ts`), seeds em banco limpo; DDL `50-dashboard.sql` em `apply.sh`.

### WP-D2 — Ciclo do alerta, deveres, frescor e exportação (Engineer-backend)

Ler `dashboard-route-contract.md`, `dashboard-error-catalog.md`, `rait-deadline-engine.md`.
Produzir: detector (evento → `DETECTADO`; fallback de leitura periódica com degradação do selo),
classificador determinístico (tipo + nível), notificador pela cadeia de escalonamento do app de
origem, SLA de ACK, verificação por evidência de origem, `CRITICO_EXTINCAO → INCIDENTE_REGISTRADO`
(espelho do protocolo de WF-RAIT-002 §4.1); ciclo de dever com viradas de período e `ATRASADO`;
serviço de frescor (heartbeat, latência aceitável, ocultar × marcar); exportação com as cinco regras
de [RN-DASH-172] e supressão de célula primária e secundária ([RN-DASH-161]); relatórios por job
com marca d'água; SSE. Gate: matriz de transições de WF-DASH-001/002/003, teste "nenhuma rota
altera domínio", teste de camada (N3 sempre 403), teste de supressão secundária, e2e de escalonamento.

### WP-D3 — Payloads e contratos (Transcriber-docs)

`docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json`; schema dos eventos
publicados (§6 do contrato de rotas); **contratos de dado por app** (PEC, TEAT, PORTAL, adapter)
como propostas em `docs/framework/contracts/dashboard-feeds/*.md`, no formato
`{indicador_id, caso_id, estado_anterior, estado_novo, timestamp, base_legal}`; exemplos com
fixtures. Gate: `contracts:check`, clientes gerados.

### WP-D4 — Fichas de tela, formulários e i18n (Transcriber-docs → Engineer-frontend)

Fichas `IU-DASH-D-nn.md` (18) com estados obrigatórios (vazio, carregando, erro, indisponível,
desatualizado, bloqueado por decisão), textos fixos ("ver apuração de incidente"; "sem prazo
definido"; "prazo do candidato, preclusivo"; "registro manual de ciência"); schemas dos 9
formulários (`dashboard-frontends.md` §7); `i18n/dashboard.pt-BR.json` (estados, severidades,
blocos, 42 nomes de indicador, camadas, erros). Gate: `docs:kb:check`, teste tela ↔ ficha ↔ rota.

### WP-D5 — Console (Engineer-frontend)

`apps/dashboard/web`: bootstrap com `@detran/ui`, `layerGuard`, `freshnessInterceptor`, SSE com
fallback, 18 telas (P-09 como placeholder), componentes §5, gráficos com escala única e célula
suprimida visível. Gate: testes de roteamento por papel e camada, TestBed dos compartilhados,
`ng build`, a11y (severidade nunca só por cor).

## 3. Ordem e paralelismo

```text
WP-D0 ──► WP-D1 ──► WP-D2 ──► WP-D3 ──┐
                └──► WP-D4 ───────────┼──► WP-D5 ──► ondas por bloco (A no MVP, B/C/D depois)
```

WP-D1/D2 dependem dos eventos de origem: RAIT já (WP-B/WP-P do RAIT), PEC/TEAT/PORTAL/BOAT
conforme seus pacotes publicarem (`teat-build-pack.md`, `portal-build-pack.md`,
`boat-build-pack.md`). MVP = 100% do bloco `legal-ceiling` (DT-030). Sonnet: WP-D3, WP-D4;
Opus/Terra: WP-D1, WP-D2.

## 4. Questões abertas (OD-D)

| ID     | Questão                                                                                             | Premissa adotada                                                                                                                                                                                                                           | Decisor           |
| ------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| OD-D01 | Papéis RBAC para operador de monitoramento e dono de dever periódico                                | novos `dash-operator`, `dash-duty-owner`; ouvidor e financeiro recebem `dash-duty-owner` — **H.38**: dois papéis novos                                                                                                                     | Owner             |
| OD-D02 | Limiar de célula e supressão para agregados (DT-029)                                                | parâmetro sem valor; P-09 e exportação agregada bloqueados — **DT-029 respondido (2026-08-28)**: limiar conservador (< 10) sem esperar parecer → parâmetro vigente `dashboard.cell_threshold=10`; P-09 destravado com supressão secundária | LEGAL / DPO       |
| OD-D03 | Adesão do AM à Lei 14.129/2021 (DT-066)                                                             | checklist LAI obrigatório; itens 14.129 marcados "condicional" — **DT-066 refinado (2026-08-27)**: Lei AM 6.837/2024 supre; adesão expressa não localizada; itens 14.129 marcados "base estadual"                                          | LEGAL             |
| OD-D04 | Limiares técnicos (outbox lag, idade de lote offline, latência/erro por sistema, ocupação de faixa) | 15 min, 24 h, p95 2 s / erro 5 %, 90 % — parâmetros SRE — **H.54** vigente                                                                                                                                                                 | Owner / SRE       |
| OD-D05 | Evento de ciência (ACK) nos apps de origem                                                          | ACK manual rotulado até existir; contrato proposto em WP-D3 — **H.54** vigente                                                                                                                                                             | Owner / times     |
| OD-D06 | Estratégia de auto-ocultação para `DESATUALIZADO_MARCADO` prolongado (blocos B/C/D)                 | ocultar após 3× a latência aceitável — **H.54** vigente                                                                                                                                                                                    | Owner             |
| OD-D07 | Heartbeat por fonte                                                                                 | evento `source.heartbeat` a cada latência aceitável/2; ausência = `ATRASADO` — **H.54** vigente                                                                                                                                            | Architect         |
| OD-D08 | Catálogo de finalidades para consultas e exportações N2                                             | 6 finalidades (supervisão, auditoria, apuração, resposta ao titular, estatística, suporte) — **H.54** vigente                                                                                                                              | DPO               |
| OD-D09 | Limite de volume de exportação com aprovação nominal                                                | 5.000 linhas — **H.54** vigente                                                                                                                                                                                                            | Owner / DPO       |
| OD-D10 | Data-limite exata do IND-DASH-202 (arts. 26-27 CONTRAN 918 não excertados)                          | último dia do mês                                                                                                                                                                                                                          | institutional-ask |
| OD-D11 | Comunicação a LEGAL/auditoria em `CRITICO_EXTINCAO`                                                 | notificação simultânea a toda a cadeia + AUDITOR — **H.54** vigente                                                                                                                                                                        | Owner             |
| OD-D12 | Parque de medidores (DT-063) para o IND-DASH-173                                                    | indicador catalogado, fonte desconectada — **DT-063 resolvido**: medidores não utilizados hoje; IND-DASH-173 catalogado com fonte desconectada                                                                                             | institutional-ask |
| OD-D13 | Os recursos da origem (`bi-panel`, `generated-report`) permanecem ou são absorvidos pelo catálogo?  | permanecem como telas de apoio D-14/D-16 — **H.54** vigente                                                                                                                                                                                | Owner             |

## 5. Inconsistências do corpus a corrigir

1. `apps/dashboard/web/README.md` fala em "worklist metrics, outbox health, adapter telemetry"; o corpus organiza por blocos A–D e camadas. Atualizar no WP-D0.
2. `policy.ts` mantém vocabulário da origem (`bi-panel`, `generated-report`) sem regra do corpus que o sustente; mantido por decisão OD-D13.
3. [IU-DASH-001] não tem códigos de tela nem rotas (greenfield); os ids D-01…D-18 deste pacote são a proposta a ser promovida ao corpus.
4. [RN-DASH-120] cita 14 deveres e o APP "9 deveres do bloco B": o bloco B do catálogo tem 9 indicadores, a tabela-mestra 14 linhas (inclui SLA e Pnatrans). Nomear os dois conjuntos nas telas D-08/D-14.

## 6. Mapa entregável → definições

| Entregável | Definições                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| A          | WP-D1; ADR-0018; [WF-DASH-001…003]; [APP-DASHBOARD] §Catálogo; origem `BP-BI-REPORTING-001`          |
| B          | `dashboard-route-contract.md`; `policy.ts`; `rait-events-sse-contract.md`                            |
| C          | `dashboard-route-contract.md` §2–§6; `dashboard-error-catalog.md`; contratos de dado por app (WP-D3) |
| D          | [IU-DASH-001]; `dashboard-frontends.md` §4–§6; [JRN-DASH-001…007]                                    |
| E          | `dashboard-frontends.md` §7; [RN-DASH-*]; `dashboard-error-catalog.md`                               |
| F          | `dashboard-frontends.md` §1, §3–§5, §9                                                               |
