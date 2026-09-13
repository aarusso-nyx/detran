---
id: ARCH-PARAMETER-CATALOGUE
title: Catálogo de parâmetros e flags — chaves, defaults, status, fonte e decisão vinculada (seed de ops.parameter, ADR-0019)
status: draft
apps: [rait, teat, portal, boat, dashboard]
updated: 2026-09-13
---

# Catálogo de parâmetros e flags

Uma linha por chave de `ops.parameter` (ADR-0019). `status` segue o vocabulário de
`infraction_timer_ref` (`vigente`, `a_confirmar`, `proposta`); `pend.` = `source_pending`;
`legal` = `legal_readonly`; **F** = flag em `@stynx-nyx/feature-flags` com default aqui.
Erro quando pendente e exigido: família `<SURFACE>.PARAMETER_SOURCE_PENDING`. Editor:
`agency-admin` salvo indicação; `technical-admin` para chaves SRE. Decisão vinculada aponta o
registro em `open-decisions-rait.md`, nos §4 dos build packs ou em `open-issues.md`.

## RAIT (`rait.*`, `collection.*`, `deadline.*`, `session.*`)

| Chave                                      | Tipo       | Default                                        | Status      | pend.   | legal | Decisão                                 | Consumidor                                      |
| ------------------------------------------ | ---------- | ---------------------------------------------- | ----------- | ------- | ----- | --------------------------------------- | ----------------------------------------------- |
| `rait.wip.limit`                           | int        | 45                                             | vigente     | não     | não   | OD-004, H.54                            | `claim-next`, `RAIT.ASSIGNMENT_WIP_LIMIT`       |
| `rait.wip.alert`                           | int        | 60                                             | vigente     | não     | não   | OD-004, H.54                            | alerta ao coordenador                           |
| `rait.timer.T-VOTO`                        | dias       | 20                                             | vigente     | não     | não   | OD-005, OD-104, H.54                    | motor de prazos                                 |
| `rait.timer.T-CONV`                        | dias úteis | 5                                              | vigente     | não     | não   | OD-005, OD-102, H.54                    | fechamento da pauta                             |
| `rait.timer.T-ASS`                         | dias úteis | 5                                              | vigente     | não     | não   | OD-005, H.54                            | assinatura                                      |
| `rait.timer.T-CLAIM`                       | dias úteis | 2                                              | vigente     | não     | não   | OD-005, OD-112, H.54                    | lote de sorteio                                 |
| `rait.timer.T-R2-AUTH`                     | dias       | 30 (da publicação da decisão da JARI)          | vigente     | não     | não   | OD-001, H.47                            | recurso da autoridade                           |
| `rait.timer.T-DIL.default`                 | dias       | 10                                             | vigente     | não     | não   | WF-RAIT-002                             | diligência                                      |
| `rait.ladder.B`                            | json       | 50/75/90 % + crítico 23 m ([WF-RAIT-002] §4.1) | vigente     | não     | não   | OD-006                                  | radar; RN-RAIT-112 a reconciliar                |
| `rait.ladder.D`                            | json       | 50/75/90 % (DT-030)                            | vigente     | não     | não   | DT-030                                  | IND-DASH-105                                    |
| `rait.quality.sample_pct`                  | %          | 5                                              | vigente     | não     | não   | OD-007, H.54                            | amostragem                                      |
| `rait.unit.queue_over_capacity_months`     | int        | 3                                              | vigente     | não     | não   | OD-008, H.54                            | gatilho de nova turma                           |
| `rait.sla.local_days`                      | dias       | 30                                             | vigente     | não     | não   | OD-009, H.54                            | IND-DASH-304/305                                |
| `rait.jeton.value`                         | BRL        | —                                              | proposta    | **sim** | não   | OD-012, OD-207                          | folha de jeton, `RAIT.PARAMETER_SOURCE_PENDING` |
| `rait.jeton.monthly_cap`                   | int        | —                                              | proposta    | **sim** | não   | OD-012                                  | idem                                            |
| `rait.signing.schedule`                    | json       | escala semanal por circunscrição               | proposta    | **sim** | não   | OD-013                                  | `/assinatura`                                   |
| `rait.refund.index`                        | enum       | `IPCA-E`                                       | vigente     | não     | não   | OD-015/DT-013                           | restituição (série IBGE a cachear)              |
| `rait.priority.legal_bases`                | json       | `[{60+:1},{80+:2}]` + PcD                      | vigente     | não     | não   | OD-016, [REF-LEI-10741-2003]            | ordem única                                     |
| `rait.export.dpo_threshold_rows`           | int        | 100                                            | vigente     | não     | não   | OD-017, H.54                            | `RAIT.EXPORT_DPO_APPROVAL_REQUIRED`             |
| `rait.retention.closed_case_years`         | anos       | 5                                              | vigente     | não     | não   | OD-018, DT-049, H.45                    | `/arquivo/retencao` (CSAD)                      |
| `rait.warning.same_machine`                | F          | true                                           | vigente     | não     | não   | OD-019, H.54                            | advertência art. 267                            |
| `session.oral_argument_enabled`            | F          | **false (fixo)**                               | vigente     | não     | não   | OD-002/DT-011                           | T-12                                            |
| `session.view_request.enabled`             | F          | true                                           | vigente     | não     | não   | OD-103, OD-202, H.54                    | pedido de vista                                 |
| `session.view_request.max_per_member`      | int        | 1                                              | vigente     | não     | não   | OD-103, H.54                            | idem                                            |
| `session.modality.virtual_enabled`         | F          | true                                           | vigente     | não     | não   | OD-106, H.54                            | `LiveSessionBoard`                              |
| `session.casting_vote.jari`                | enum       | `tie_only`                                     | vigente     | não     | não   | OD-109, H.54                            | `casting-vote`                                  |
| `session.casting_vote.cetran`              | enum       | `always_plus_tie`                              | vigente     | não     | não   | OD-203, H.54                            | idem                                            |
| `session.quorum.cetran_parity`             | F          | true                                           | vigente     | não     | não   | OD-204, H.54                            | `QuorumIndicator`                               |
| `session.late_opinion.escalation`          | json       | advertido → afastado temporário                | vigente     | no      | não   | OD-104, H.54                            | contadores                                      |
| `session.calendar.ordinary_cadence`        | enum       | `weekly`                                       | vigente     | não     | não   | OD-101, H.54                            | calendário                                      |
| `collection.discount_40_outside_sne`       | F          | false                                          | vigente     | não     | não   | OD-003, DT-012, DT-026, H.54            | faixa `desconto_40_fora_sne`                    |
| `deadline.T-PAR-3A.expiry_kind_override`   | enum       | `alert_only`                                   | a_confirmar | não     | sim   | OD-301, [REF-STJ-TEMAS-1293-1294], H.46 | motor de prazos                                 |
| `deadline.T-PRESC-5A.expiry_kind_override` | enum       | `alert_only`                                   | a_confirmar | não     | sim   | OD-301, H.46                            | idem                                            |
| `deadline.T-NA-IND.expiry_effect`          | enum       | `indication_void`                              | a_confirmar | não     | sim   | OD-304                                  | transição #5/#6                                 |
| `deadline.T-PRESC-5A.interruptions`        | json       | hipóteses do art. 2º da Lei 9.873              | a_confirmar | não     | sim   | OD-305                                  | idem                                            |
| `deadline.sweeper_interval_minutes`        | int        | 15                                             | vigente     | não     | não   | engine §6                               | job (technical-admin)                           |
| `deadline.optional_day_policy`             | enum       | `business_day_for_citizen`                     | vigente     | não     | não   | [REF-CALENDARIO-2026-AM-MANAUS], H.54   | calendário                                      |

## TEAT (`teat.*`, `sync.*`)

| Chave                                  | Tipo | Default                                             | Status   | pend.   | legal | Decisão                                             | Consumidor                     |
| -------------------------------------- | ---- | --------------------------------------------------- | -------- | ------- | ----- | --------------------------------------------------- | ------------------------------ |
| `sync.concurrency_window_minutes`      | int  | —                                                   | proposta | **sim** | não   | OD-T03, DT-016                                      | detecção de sessão concorrente |
| `teat.homologation.expired_behavior`   | enum | `warn` (lavra com flag de risco; autoridade decide) | vigente  | não     | não   | OD-T04, H.55                                        | `HOMOLOGATION_RENEWAL_DUE`     |
| `teat.homologation.tolerance_days`     | int  | 0                                                   | vigente  | não     | não   | OD-T04, H.54                                        | idem                           |
| `teat.numbering.reservation_ttl_hours` | int  | 72                                                  | vigente  | não     | não   | OD-T07, H.54                                        | faixas                         |
| `teat.numbering.range_alert_pct`       | %    | 90                                                  | vigente  | não     | não   | OD-D04, IND-DASH-406, H.54                          | alerta de faixa                |
| `teat.bodycam.retention_days`          | dias | —                                                   | proposta | **sim** | não   | OD-T08, DT-014, DT-049                              | chrome/metadados               |
| `teat.monitored_custody`               | F    | false                                               | vigente  | não     | não   | OD-T09/DT-015                                       | rotas desligadas               |
| `teat.speed_meters`                    | F    | false                                               | vigente  | não     | não   | OD-T09/DT-063                                       | UC-TEAT-013                    |
| `teat.sivec_integration`               | F    | false                                               | vigente  | não     | não   | OD-T10, H.54                                        | adapter                        |
| `teat.agent_legitimacy_declaration`    | F    | true                                                | vigente  | não     | não   | OD-T11, H.54                                        | `open-shift`                   |
| `teat.no_approach_reason.mode`         | enum | `classified`                                        | vigente  | não     | não   | OD-T06, H.54                                        | UC-TEAT-002                    |
| `teat.retention.ait_years`             | anos | 10                                                  | vigente  | não     | não   | DT-049, [REF-DETRANDF-INSTRUCAO-146-2023-TTD], H.45 | arquivo                        |

## PORTAL (`portal.*`, `privacy.*`)

| Chave                           | Tipo | Default                                                                                                                           | Status   | pend.   | legal | Decisão                                                          | Consumidor           |
| ------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------------------------------------------------------------- | -------------------- |
| `portal.act_level_policy`       | json | defesa/recurso/indicação/procuração = `advanced` (gov.br ouro, e-Notariado, qualificada); consulta = `simple`; ouvidoria = `none` | vigente  | não     | não   | OD-P01, OD-P02, [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025], H.50 | gates de serviço     |
| `portal.govbr_seal_mapping`     | json | ouro **e prata** = advanced; bronze = insuficiente (decisão H.50, contra a PN 001/2025 — portaria pedida)                         | vigente  | não     | não   | OD-P02, H.50                                                     | idem                 |
| `portal.cetran_appeal_level`    | enum | `advanced`                                                                                                                        | vigente  | não     | não   | OD-P01 residual, H.54                                            | recurso 2ª instância |
| `portal.ombudsman_level`        | enum | `none` (anônimo) / `simple` para acompanhar                                                                                       | vigente  | não     | não   | OD-P06, DT-051, H.54                                             | ouvidoria            |
| `portal.card_payment`           | F    | false                                                                                                                             | proposta | não     | não   | OD-P05/DT-031, DT-072                                            | pagamento            |
| `portal.installments`           | F    | false                                                                                                                             | proposta | não     | não   | idem                                                             | idem                 |
| `portal.waiver_40_term`         | F    | false                                                                                                                             | proposta | não     | não   | OD-P03/DT-026, OD-003                                            | termo de renúncia    |
| `privacy.public_regime_days`    | dias | —                                                                                                                                 | proposta | **sim** | não   | OD-P08                                                           | resposta ao titular  |
| `portal.read_cache_ttl_minutes` | int  | 15                                                                                                                                | vigente  | não     | não   | OD-P11, H.54                                                     | leituras nacionais   |
| `portal.mobile_shell`           | F    | false                                                                                                                             | vigente  | não     | não   | OD-P12                                                           | `apps/portal/mobile` |
| `portal.ombudsman_taxonomy`     | json | inclui "solicitação"                                                                                                              | vigente  | não     | não   | OD-P10, H.54                                                     | ouvidoria            |

## BOAT (`est.*`)

| Chave                               | Tipo | Default                                                                      | Status   | pend.   | legal | Decisão                                                 | Consumidor                 |
| ----------------------------------- | ---- | ---------------------------------------------------------------------------- | -------- | ------- | ----- | ------------------------------------------------------- | -------------------------- |
| `est.renaest.transmit_period`       | enum | `monthly`                                                                    | vigente  | não     | não   | OD-B04/DT-017                                           | `T-BOAT-TRANSM`            |
| `est.renaest.layout_version`        | str  | mock                                                                         | proposta | **sim** | não   | OD-B08/DT-061                                           | adapter                    |
| `est.severity.derivation`           | enum | `worst_victim`                                                               | vigente  | não     | não   | OD-B06/DT-018, H.54                                     | gate de fechamento         |
| `est.retention.bat_years`           | anos | 5                                                                            | vigente  | não     | não   | OD-B02/DT-049, H.45                                     | `BOAT.RETENTION_UNDEFINED` |
| `est.retention.health_fields_years` | anos | 5 (eliminar ou anonimizar ao fim)                                            | vigente  | não     | não   | idem, H.45                                              | idem                       |
| `est.lgpd.health_hypothesis`        | json | art. 11, II, a (registro/RENAEST); II, b (estatística); art. 13 (publicação) | vigente  | não     | não   | OD-B01/DT-047, [REF-ANPD-GUIA-PODER-PUBLICO-2024], H.54 | transparência              |
| `est.catalog.crash_type`            | json | valores do protótipo                                                         | vigente  | **sim** | não   | OD-B11, H.54, H.42                                      | `crash-start`              |
| `est.catalog.conditions`            | json | via/clima/iluminação/sinalização do protótipo                                | vigente  | **sim** | não   | OD-B11, H.54, H.42                                      | `crash-conditions`         |
| `est.partner_intake`                | F    | false                                                                        | vigente  | não     | não   | OD-B10 (F.31)                                           | rotas reservadas           |
| `est.cancel.draft_only`             | F    | true                                                                         | vigente  | não     | não   | OD-B13, H.54                                            | `cancel`                   |
| `est.hospitalized_owner_days`       | dias | 60 (sem suspensão)                                                           | vigente  | não     | não   | OD-B07/DT-019, H.54                                     | aviso na tela              |

## DASHBOARD (`dashboard.*`)

| Chave                                        | Tipo | Default                                      | Status   | pend.   | legal | Decisão       | Consumidor                             |
| -------------------------------------------- | ---- | -------------------------------------------- | -------- | ------- | ----- | ------------- | -------------------------------------- |
| `dashboard.cell_threshold`                   | int  | 10 (supressão primária + secundária)         | vigente  | não     | não   | OD-D02/DT-029 | P-06, P-09, exportações                |
| `dashboard.ack_sla`                          | json | N1 24h úteis, N2 8h, N3 2h, CRÍTICO imediato | vigente  | não     | não   | DT-030        | escalonamento                          |
| `dashboard.stale_hide_multiplier`            | num  | 3 × latência aceitável                       | vigente  | não     | não   | OD-D06, H.54  | selo de frescor                        |
| `dashboard.heartbeat_divisor`                | num  | 2                                            | vigente  | não     | não   | OD-D07, H.54  | `source_freshness`                     |
| `dashboard.purposes_n2`                      | json | 6 finalidades                                | vigente  | não     | não   | OD-D08, H.54  | `LayerGate`                            |
| `dashboard.export.approval_rows`             | int  | 5000                                         | vigente  | não     | não   | OD-D09, H.54  | `DASH.EXPORT_VOLUME_APPROVAL_REQUIRED` |
| `dashboard.duty.IND-202.deadline`            | rule | último dia do mês                            | proposta | **sim** | não   | OD-D10        | calendário de deveres                  |
| `dashboard.duty.annual_deadline`             | rule | 31/12 + preparação jan–fev                   | vigente  | não     | não   | DT-030        | IND-206/207                            |
| `dashboard.transparency.audit_period`        | enum | monthly                                      | vigente  | não     | não   | DT-030        | IND-209                                |
| `dashboard.pending_age_floor_days`           | int  | 60                                           | vigente  | não     | não   | DT-030        | IND-309/314                            |
| `dashboard.sre.outbox_lag_minutes`           | int  | 15                                           | vigente  | não     | não   | OD-D04, H.54  | IND-401 (technical-admin)              |
| `dashboard.sre.offline_batch_age_hours`      | int  | 24                                           | vigente  | não     | não   | OD-D04, H.54  | IND-402                                |
| `dashboard.sre.adapter_p95_ms`               | int  | 2000                                         | vigente  | não     | não   | OD-D04, H.54  | IND-403                                |
| `dashboard.sre.adapter_error_pct`            | %    | 5                                            | vigente  | não     | não   | OD-D04, H.54  | IND-403                                |
| `dashboard.critical_extinction.notify_legal` | F    | true                                         | vigente  | não     | não   | OD-D11, H.54  | `CRITICO_EXTINCAO`                     |
| `dashboard.origin_resources_enabled`         | F    | true                                         | vigente  | não     | não   | OD-D13, H.54  | D-14/D-16                              |

## Regras do catálogo

1. Nenhuma constante silenciosa: todo valor que aparece numa OD tem linha aqui.
2. `pend.=sim` obriga a interface a exibir "premissa de desenho — pendente de decisão" e bloqueia
   comandos que exigem o valor.
3. Quem fecha uma decisão cria **nova versão** com `reason` e `decision_ref`; a linha aqui muda
   de `proposta` para `vigente`, e o item sai de `decision-closure-plan.md`.
4. Gate `verify:parameter-catalogue` (WP-A): chaves usadas no código ⊆ catálogo; `decision_ref`
   existentes; nenhuma `legal=sim` editável.
