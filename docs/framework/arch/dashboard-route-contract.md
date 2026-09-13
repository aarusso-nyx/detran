---
id: ARCH-DASHBOARD-ROUTES
title: Contrato de rotas do DASHBOARD — /v1/dashboard/*, alertas, deveres, indicadores, frescor, exportação, projeções e SSE
status: draft
apps: [dashboard, rait, pec, boat, teat, portal]
updated: 2026-09-13
---

# Contrato de rotas do DASHBOARD

Rotas do módulo `dashboard` no backend unificado. O DASHBOARD não tem base de negócio: lê
projeções alimentadas por eventos (ADR-0018) e mantém apenas o **seu próprio estado** (ciclo do
alerta, ciclos de dever, catálogo de indicadores, frescor, registro de exportação, relatórios). Da
origem (`BP-BI-REPORTING-001`) porta os três recursos `generated-report`, `indicator-config`,
`bi-panel` e as cinco ações já presentes em `policy.ts`. Convenções: `rait-build-pack.md` §0;
erros em `dashboard-error-catalog.md`.

## 1. Regras

1. Prefixo `/v1/dashboard`; política `dashboard:<recurso>:<ação>`; recursos `alert`, `duty`,
   `duty-cycle`, `indicator-config`, `bi-panel`, `generated-report`, `source`, `export`,
   `audit-trail`, `comparison`, `transparency-audit`, `dataset`.
2. **Nenhuma rota pratica ato de negócio** ([RN-DASH-101]). Não existe `POST` que altere caso,
   AIT, sinistro, exame ou pedido; o que muda é o estado do alerta, do ciclo de dever ou da
   configuração do painel.
3. Toda resposta de leitura carrega `meta.freshness { state, asOf, acceptableLatency, source }`
   ([WF-DASH-003]); em bloco `legal-ceiling` com `INDISPONIVEL` o valor vem `null`.
4. Toda leitura em camada N2 exige `X-Purpose` (catálogo) e gera auditoria com finalidade
   ([RN-DASH-170], [RN-DASH-171]); N3 é recusado sempre.
5. Exportação e API de dados abertos seguem as cinco regras de [RN-DASH-172]; a API pública serve
   só conjuntos pré-agregados com supressão aplicada ([RN-DASH-151]).
6. Auditoria: `@Audit({ action: 'DASH_<VERBO>', entity: 'dashboard.<tabela>' })`.

## 2. Alertas (`@Resource('dashboard:alert')`)

| Rota                          | Ação       | Papéis                                                          | Pré-estado             | Payload                                                                           | Pós-estado / efeito                                       | Auditoria              |
| ----------------------------- | ---------- | --------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------- |
| `GET alerts`                  | `read`     | dash-operator, gestores, agency-admin, technical-admin, AUDITOR | —                      | filtros `state`, `severity`, `block`, `indicator`, `app`, `owner`, `unit`, `pool` | lista ordenada por severidade combinada; camada por papel | —                      |
| `GET alerts/{id}`             | `read`     | idem                                                            | —                      | —                                                                                 | anatomia mínima + ciclo + trilha                          | `DASH_ALERT_READ` (N2) |
| `POST alerts/{id}/ack`        | `ack`      | dono, dash-operator (em nome do dono)                           | `NOTIFICADO`           | `{ channel: origin\|manual, note?, onBehalfOf? }`                                 | `RECONHECIDO`; `manual` marcado                           | `DASH_ALERT_ACK`       |
| `POST alerts/{id}/treating`   | `treat`    | dono                                                            | `RECONHECIDO`          | `{ originRef? }`                                                                  | `EM_TRATAMENTO`                                           | `DASH_ALERT_TREAT`     |
| `POST alerts/{id}/close`      | `close`    | dash-operator (trilha de irregularidade)                        | `VERIFICADO`           | `{ note? }`                                                                       | `ENCERRADO`; extinção encerra pelo sistema                | `DASH_ALERT_CLOSE`     |
| `POST alerts/{id}/root-cause` | `annotate` | technical-admin, integration-operator                           | qualquer               | `{ category: transport\|acceptance\|payload, description }`                       | nota na trilha                                            | `DASH_ALERT_ANNOTATE`  |
| `GET alerts/{id}/incident`    | `read`     | gestores, AUDITOR                                               | `INCIDENTE_REGISTRADO` | —                                                                                 | apuração herdada de WF-RAIT-002 §4.1                      | —                      |

Transições de sistema (sem rota): `DETECTADO`, `CLASSIFICADO`, `NOTIFICADO`, `ESCALONADO` (SLA
de ACK vencido: N1 24h úteis, N2 8h, N3 2h, CRÍTICO imediato, DT-030), `VERIFICADO` (evidência da
origem), `CRITICO_EXTINCAO` → `INCIDENTE_REGISTRADO`. Indicador em `INDISPONIVEL` ou
`DESATUALIZADO_MARCADO` não gera `DETECTADO`.

## 3. Deveres periódicos (`@Resource('dashboard:duty-cycle')`)

| Rota                                     | Ação      | Papéis                        | Pré-estado              | Payload                                          | Pós-estado                                    | Auditoria           |
| ---------------------------------------- | --------- | ----------------------------- | ----------------------- | ------------------------------------------------ | --------------------------------------------- | ------------------- |
| `GET duties`                             | `read`    | todos autenticados (N0)       | —                       | —                                                | 14 linhas de [RN-DASH-120] com ciclo corrente | —                   |
| `GET duties/{id}/cycles`, `…/{period}`   | `read`    | idem                          | —                       | —                                                | histórico                                     | —                   |
| `POST duties/{id}/cycles/{period}/start` | `start`   | dash-duty-owner, agency-admin | `JANELA_ABERTA`         | —                                                | `EM_APURACAO`                                 | `DASH_DUTY_START`   |
| `POST …/prepare`                         | `prepare` | idem                          | `EM_APURACAO`           | `{ draftRef? }`                                  | `PREPARADO`                                   | `DASH_DUTY_PREPARE` |
| `POST …/submit`                          | `submit`  | idem                          | `PREPARADO`, `ATRASADO` | `{ submittedAt, protocol? }`                     | `SUBMETIDO_PUBLICADO`                         | `DASH_DUTY_SUBMIT`  |
| `POST …/prove`                           | `prove`   | idem                          | `SUBMETIDO_PUBLICADO`   | `{ evidence: { protocol?, captureUri?, hash } }` | `COMPROVADO`                                  | `DASH_DUTY_PROVE`   |
| `POST …/archive`                         | `archive` | dash-operator, agency-admin   | `COMPROVADO`            | —                                                | `ARQUIVADO`                                   | `DASH_DUTY_ARCHIVE` |

Sistema: virada de período abre `JANELA_ABERTA`; data-limite sem avanço marca `ATRASADO`; novo
período sem cumprimento marca `NAO_CUMPRIDO`. Datas-limite: dia 20 (IND-DASH-201), mensal
(202), 30 de abril (Pnatrans), 31/12 + preparação (206/207, DT-030), mensal (209); "sem prazo
definido" para 204/205/208 ([RN-DASH-113]).

## 4. Catálogo, painéis, relatórios, fontes e exportação

| Rota                                                     | Ação                | Papéis                                               | Efeito                                                                                                                 |
| -------------------------------------------------------- | ------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `GET indicators`, `GET indicators/{code}`                | `read`              | N0                                                   | 42 indicadores com bloco, fonte, limiar, dono, classificação, latência, `connected`                                    |
| `PATCH indicator-configs/{id}`                           | `update`            | bi-analyst, agency-admin, technical-admin            | rascunho de configuração                                                                                               |
| `POST indicator-configs/{id}/publish`                    | `publish`           | bi-analyst, agency-admin, technical-admin            | configuração vigente; evento `IndicatorConfigChanged`                                                                  |
| `GET/POST/PATCH bi-panels`, `POST …/{id}/publish`        | `publish`           | idem                                                 | layout de painel por `visibility_profile`                                                                              |
| `POST generated-reports`                                 | `request`           | bi-analyst, agency-admin, technical-admin            | `processing`; job `@stynx-nyx/jobs`; evento `ReportRequested`                                                          |
| `POST generated-reports/{id}/complete` \| `fail`         | `complete` / `fail` | sistema (bi-analyst, technical-admin)                | `completed` (`file_uri`, `file_hash`, marca d'água) / `failed`; evento `ReportGenerated`                               |
| `GET sources`, `GET sources/{id}`                        | `read`              | technical-admin, integration-operator, dash-operator | frescor por fonte/painel, heartbeat, latência aceitável                                                                |
| `POST exports`                                           | `create`            | N1/N2 conforme recorte                               | `{ scope, filters, format, purpose?, rows }` → registro, marca d'água, supressão; acima do limite → `pending-approval` |
| `POST exports/{id}/approve`                              | `approve`           | agency-admin (aprovação nominal)                     | libera exportação volumosa                                                                                             |
| `GET audit-trail`                                        | `read`              | AUDITOR, agency-admin, gestores (próprio domínio)    | linha do tempo por caso/indicador/período/app; fato do acesso, sem conteúdo sensível                                   |
| `GET comparisons`                                        | `read`              | agency-admin, gestores, bi-analyst                   | `dimension: pool\|circuit\|unit\|clinic`; agregados com supressão de célula                                            |
| `GET transparency/checklist`, `POST transparency/audits` | `audit`             | technical-admin, agency-admin                        | ciclo mensal do IND-DASH-209                                                                                           |
| `GET datasets`, `GET /open-data/{dataset}`               | `read`              | público (pré-agregado, supressão aplicada)           | sete requisitos de [RN-DASH-151]; changelog; metadados                                                                 |
| `GET kpis`                                               | `read`              | agency-admin, dash-operator                          | cobertura, MTTA, MTTR, % deveres no prazo, frescor médio                                                               |

## 5. Fluxo SSE `GET /v1/dashboard/stream`

Eventos `alert.changed`, `alert.escalated`, `duty.changed`, `source.freshness`,
`integration.health`; mesmo protocolo de `rait-events-sse-contract.md` §3 (`Last-Event-ID`,
retomada, fallback de polling em 30 s). O stream é visão viva das projeções, não segunda fonte.

## 6. Projeções (ADR-0018) e eventos consumidos

| Projeção                                      | Eventos de origem                                                                         | Indicadores                   |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------- |
| `dashboard.prescription_risk`                 | `rait.clock.flag-changed` (`RISCO_PRESCRICAO_ALTERADO`), `rait.case.changed`              | 101…105, 304, 305             |
| `dashboard.production`                        | `rait.case.changed`, `rait.decision.published`, `rait.session.changed`                    | 304, 305, comparativo         |
| `dashboard.integration_health`                | status da outbox, `UPSTREAM_*`, recibos da sincronização, telemetria do adapter           | 401…403, 408                  |
| `dashboard.crashes`                           | `SINISTRO_*` (BOAT) com limiar de célula                                                  | 203, 204, 310; P-09 bloqueado |
| `dashboard.pec_deadlines` (**novo**)          | eventos de [WF-PEC-002] (junta, recurso, `UNDER_REVIEW`)                                  | 106, 107, 306…309             |
| `dashboard.teat_measures` (**novo**)          | `MEDIDA_*`, `AIT_LOTE_*`, homologação, pacote normativo, faixas, custódia                 | 108…111, 311…314, 404…407     |
| `dashboard.portal_service_metrics` (**novo**) | pedidos LAI, manifestações, avaliações (`POST evaluations` do Portal), notificação de CNH | 206…209, 301…303              |
| `dashboard.duty_evidence` (**novo**)          | `DEVER_COMPROVADO` (próprio) e eventos de publicação                                      | 201…209                       |
| `dashboard.source_freshness` (**novo**)       | heartbeat por fonte; ausência de evento além da latência aceitável                        | 408                           |

Eventos publicados pelo DASHBOARD: `ALERTA_DETECTADO`, `ALERTA_ESCALONADO`,
`ALERTA_RECONHECIDO`, `ALERTA_ENCERRADO`, `INCIDENTE_REGISTRADO` (espelho), `DEVER_JANELA_ABERTA`,
`DEVER_ATRASADO`, `DEVER_COMPROVADO`, `EXPORTACAO_REGISTRADA`, `IndicatorConfigChanged`,
`ReportRequested`, `ReportGenerated`.

## 7. Contratos de dado pendentes por app

| App      | O que precisa publicar (hoje inexistente, exceto RAIT)                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `pec`    | eventos do ciclo de junta/recurso, prazos por instância, pendências da Junta Especial                                      |
| `boat`   | `SINISTRO_FECHADO`, cascata de validação, situação RENAEST, bloqueados pós-terminal (`boat-route-contract.md` §7 já prevê) |
| `teat`   | idade do lote offline, homologação, pacote normativo, faixas, medidas em curso, `SUSPEITO_CONCORRENCIA`                    |
| `portal` | volume/tempo médio/satisfação por serviço, LAI e ouvidoria em curso, cobertura do aviso de CNH                             |
| adapter  | latência e erro por sistema nacional                                                                                       |
| todos    | evento de ciência (ACK) — até existir, ACK manual                                                                          |

## 8. Divergências a corrigir

1. `policy.ts` só conhece `generated-report`, `indicator-config`, `bi-panel` (origem); alertas, deveres, fontes, exportação e trilha não têm política nem papéis `dash-*`.
2. Origem expõe CRUD completo (inclusive `DELETE`) para os três recursos; aqui `DELETE` só `technical-admin` e `generated-report` não é editável após `completed`.
3. `bi-panel.visibility_profile` da origem vira camada N0/N1/N2 ([RN-DASH-170]); `config_json` nunca referencia N3.
