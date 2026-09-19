---
id: ARCH-PARAMETER-CATALOGUE
title: Catálogo de parâmetros e flags — chaves, defaults, status, fonte e decisão vinculada (seed de ops.parameter, ADR-0021)
status: draft
apps: [rait, teat, portal, boat, dashboard]
updated: 2026-09-17
---

# Catálogo de parâmetros e flags

Uma linha por chave de `ops.parameter` (ADR-0021). `status` segue o vocabulário de
`infraction_timer_ref` (`vigente`, `a_confirmar`, `proposta`); `pend.` = `source_pending`;
`legal` = `legal_readonly`; **F** = flag em `@stynx-nyx/feature-flags` com default aqui.
Erro quando pendente e exigido: família `<SURFACE>.PARAMETER_SOURCE_PENDING`. Editor:
`agency-admin` salvo indicação; `technical-admin` para chaves SRE. Decisão vinculada aponta o
registro em `open-decisions-rait.md`, nos §4 dos build packs ou em `open-issues.md`.

## RAIT (`rait.*`, `collection.*`, `deadline.*`, `session.*`)

| Chave                                      | Tipo       | Default                                        | Status      | pend.   | legal | Decisão                               | Consumidor                                      |
| ------------------------------------------ | ---------- | ---------------------------------------------- | ----------- | ------- | ----- | ------------------------------------- | ----------------------------------------------- |
| `rait.wip.limit`                           | int        | 45                                             | vigente     | não     | não   | OD-004, H.54                          | `claim-next`, `RAIT.ASSIGNMENT_WIP_LIMIT`       |
| `rait.wip.alert`                           | int        | 60                                             | vigente     | não     | não   | OD-004, H.54                          | alerta ao coordenador                           |
| `rait.timer.T-VOTO`                        | dias       | 20                                             | vigente     | não     | não   | OD-005, OD-104, H.54                  | motor de prazos                                 |
| `rait.timer.T-CONV`                        | dias úteis | 5                                              | vigente     | não     | não   | OD-005, OD-102, H.54                  | fechamento da pauta                             |
| `rait.timer.T-ASS`                         | dias úteis | 5                                              | vigente     | não     | não   | OD-005, H.54                          | assinatura                                      |
| `rait.timer.T-CLAIM`                       | dias úteis | 2                                              | vigente     | não     | não   | OD-005, OD-112, H.54                  | lote de sorteio                                 |
| `rait.timer.T-R2-AUTH`                     | dias       | 30 (da publicação da decisão da JARI)          | vigente     | não     | não   | OD-001, H.47                          | recurso da autoridade                           |
| `rait.timer.T-DIL.default`                 | dias úteis | 15                                             | vigente     | não     | não   | OD-005, DT-132                        | diligência                                      |
| `rait.ladder.B`                            | json       | 50/75/90 % + crítico 23 m ([WF-RAIT-002] §4.1) | vigente     | não     | não   | OD-006                                | radar; RN-RAIT-112 a reconciliar                |
| `rait.ladder.D`                            | json       | 50/75/90 % (DT-030)                            | vigente     | não     | não   | DT-030                                | IND-DASH-105                                    |
| `rait.quality.sample_pct`                  | %          | 5                                              | vigente     | não     | não   | OD-007, H.54                          | amostragem                                      |
| `rait.unit.queue_over_capacity_months`     | int        | 3                                              | vigente     | não     | não   | OD-008, H.54                          | gatilho de nova turma                           |
| `rait.sla.local_days`                      | dias       | 30                                             | vigente     | não     | não   | OD-009, H.54                          | IND-DASH-304/305                                |
| `rait.jeton.value`                         | BRL        | —                                              | proposta    | **sim** | não   | OD-012, OD-207                        | folha de jeton, `RAIT.PARAMETER_SOURCE_PENDING` |
| `rait.jeton.monthly_cap`                   | int        | —                                              | proposta    | **sim** | não   | OD-012                                | idem                                            |
| `rait.signing.schedule`                    | json       | escala semanal por circunscrição               | proposta    | **sim** | não   | OD-013                                | `/assinatura`                                   |
| `rait.refund.index`                        | enum       | `IPCA-E`                                       | vigente     | não     | não   | OD-015/DT-013                         | restituição (série IBGE a cachear)              |
| `rait.priority.legal_bases`                | json       | `[{60+:1},{80+:2}]` + PcD                      | vigente     | não     | não   | OD-016, [REF-LEI-10741-2003]          | ordem única                                     |
| `rait.export.dpo_threshold_rows`           | int        | 100                                            | vigente     | não     | não   | OD-017, H.54                          | `RAIT.EXPORT_DPO_APPROVAL_REQUIRED`             |
| `rait.retention.closed_case_years`         | anos       | 5                                              | vigente     | não     | não   | OD-018, DT-049, H.45                  | `/arquivo/retencao` (CSAD)                      |
| `rait.warning.same_machine`                | F          | true                                           | vigente     | não     | não   | OD-019, H.54                          | advertência art. 267                            |
| `session.oral_argument_enabled`            | F          | false                                          | vigente     | não     | não   | OD-002/DT-011                         | T-12                                            |
| `session.view_request.enabled`             | F          | true                                           | vigente     | não     | não   | OD-103, OD-202, H.54                  | pedido de vista                                 |
| `session.view_request.max_per_member`      | int        | 1                                              | vigente     | não     | não   | OD-103, H.54                          | idem                                            |
| `session.modality.virtual_enabled`         | F          | true                                           | vigente     | não     | não   | OD-106, H.54                          | `LiveSessionBoard`                              |
| `session.casting_vote.jari`                | enum       | `tie_only`                                     | vigente     | não     | não   | OD-109, H.54                          | `casting-vote`                                  |
| `session.casting_vote.cetran`              | enum       | `always_plus_tie`                              | vigente     | não     | não   | OD-203, H.54                          | idem                                            |
| `session.quorum.cetran_parity`             | F          | true                                           | vigente     | não     | não   | OD-204, H.54                          | `QuorumIndicator`                               |
| `session.late_opinion.escalation`          | json       | advertido → afastado temporário                | vigente     | não     | não   | OD-104, H.54                          | contadores                                      |
| `session.calendar.ordinary_cadence`        | enum       | `weekly`                                       | vigente     | não     | não   | OD-101, H.54                          | calendário                                      |
| `collection.discount_40_outside_sne`       | F          | false                                          | vigente     | não     | não   | OD-003, DT-012, DT-026, H.54          | faixa `desconto_40_fora_sne`                    |
| `deadline.T-PAR-3A.expiry_kind_override`   | enum       | `alert_only`                                   | a_confirmar | não     | sim   | OD-301, [REF-STJ-1293-1294], H.46     | motor de prazos                                 |
| `deadline.T-PRESC-5A.expiry_kind_override` | enum       | `alert_only`                                   | a_confirmar | não     | sim   | OD-301, H.46                          | idem                                            |
| `deadline.T-NA-IND.expiry_effect`          | enum       | `indication_void`                              | a_confirmar | não     | sim   | OD-304                                | transição #5/#6                                 |
| `deadline.T-PRESC-5A.interruptions`        | json       | hipóteses do art. 2º da Lei 9.873              | a_confirmar | não     | sim   | OD-305                                | idem                                            |
| `deadline.sweeper_interval_minutes`        | int        | 15                                             | vigente     | não     | não   | DT-133                                | job (technical-admin)                           |
| `deadline.optional_day_policy`             | enum       | `business_day_for_citizen`                     | vigente     | não     | não   | [REF-CALENDARIO-2026-AM-MANAUS], H.54 | calendário                                      |

## TEAT (`teat.*`, `sync.*`)

| Chave                                  | Tipo | Default                                             | Status   | pend.   | legal | Decisão                                             | Consumidor                                                                                                                   |
| -------------------------------------- | ---- | --------------------------------------------------- | -------- | ------- | ----- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `sync.concurrency_window_minutes`      | int  | —                                                   | proposta | **sim** | não   | OD-T03, DT-016                                      | `ops/offline-sync/src/handwritten/concurrency-detector.ts` (`CONCURRENCY_WINDOW_KEY`)                                        |
| `teat.homologation.expired_behavior`   | enum | `warn` (lavra com flag de risco; autoridade decide) | vigente  | não     | não   | OD-T04, DT-110                                      | `ops/field/src/handwritten/mobile-bootstrap.service.ts` (`HOMOLOGATION_BEHAVIOR_KEY`), bloqueador `HOMOLOGATION_RENEWAL_DUE` |
| `teat.homologation.tolerance_days`     | int  | 0                                                   | vigente  | não     | não   | OD-T04, H.54                                        | idem                                                                                                                         |
| `teat.numbering.reservation_ttl_hours` | int  | 72                                                  | vigente  | não     | não   | OD-T07, H.54                                        | `ops/offline-sync/src/handwritten/reserve-numbering.command.ts` (`RESERVATION_TTL_KEY`)                                      |
| `teat.numbering.range_alert_pct`       | %    | 90                                                  | vigente  | não     | não   | OD-D04, IND-DASH-406, H.54                          | alerta de faixa                                                                                                              |
| `teat.bodycam.retention_days`          | dias | —                                                   | proposta | **sim** | não   | OD-T08, DT-014, DT-049                              | chrome/metadados                                                                                                             |
| `teat.monitored_custody`               | F    | false                                               | vigente  | não     | não   | OD-T09/DT-015                                       | `inf/measures/src/handwritten/record-removal.command.ts` (`MONITORED_CUSTODY_FLAG`, porta `MEASURE_FEATURE_FLAGS`)           |
| `teat.speed_meters`                    | F    | false                                               | vigente  | não     | não   | OD-T09/DT-063                                       | `backend/app/src/app.module.ts` (montagem condicional do `SpeedModule`), UC-TEAT-013                                         |
| `teat.sivec_integration`               | F    | false                                               | vigente  | não     | não   | OD-T10, H.54                                        | adapter                                                                                                                      |
| `teat.agent_legitimacy_declaration`    | F    | true                                                | vigente  | não     | não   | OD-T11, H.54                                        | `open-shift`                                                                                                                 |
| `teat.no_approach_reason.mode`         | enum | `classified`                                        | vigente  | não     | não   | OD-T06, H.54                                        | UC-TEAT-002                                                                                                                  |
| `teat.retention.ait_years`             | anos | 10                                                  | vigente  | não     | não   | DT-049, [REF-DETRANDF-INSTRUCAO-146-2023-TTD], H.45 | arquivo                                                                                                                      |

## PORTAL (`portal.*`, `privacy.*`)

| Chave                              | Tipo | Default                                                                                                                           | Status   | pend.   | legal | Decisão                                                          | Consumidor                                                                                  |
| ---------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `portal.act_level_policy`          | json | defesa/recurso/indicação/procuração = `advanced` (gov.br ouro, e-Notariado, qualificada); consulta = `simple`; ouvidoria = `none` | vigente  | não     | não   | OD-P01, OD-P02, [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025], H.50 | gates de serviço                                                                            |
| `portal.govbr_seal_mapping`        | json | ouro **e prata** = advanced; bronze = insuficiente (decisão H.50, contra a PN 001/2025 — portaria pedida)                         | vigente  | não     | não   | OD-P02, H.50                                                     | idem                                                                                        |
| `portal.cetran_appeal_level`       | enum | `advanced`                                                                                                                        | vigente  | não     | não   | OD-P01 residual, H.54                                            | recurso 2ª instância                                                                        |
| `portal.ombudsman_level`           | enum | `none` (anônimo) / `simple` para acompanhar                                                                                       | vigente  | não     | não   | OD-P06, DT-051, H.54                                             | ouvidoria                                                                                   |
| `portal.card_payment`              | F    | false                                                                                                                             | proposta | não     | não   | OD-P05/DT-031, DT-072                                            | pagamento                                                                                   |
| `portal.installments`              | F    | false                                                                                                                             | proposta | não     | não   | OD-P05/DT-031, DT-072                                            | idem                                                                                        |
| `portal.waiver_40_term`            | F    | false                                                                                                                             | proposta | não     | não   | OD-P03/DT-026, OD-003                                            | termo de renúncia                                                                           |
| `privacy.public_regime_days`       | dias | —                                                                                                                                 | proposta | **sim** | não   | OD-P08                                                           | resposta ao titular                                                                         |
| `portal.read_cache_ttl_minutes`    | int  | 15                                                                                                                                | vigente  | não     | não   | OD-P11, H.54                                                     | leituras nacionais                                                                          |
| `portal.mobile_shell`              | F    | false                                                                                                                             | vigente  | não     | não   | OD-P12                                                           | `apps/portal/mobile`                                                                        |
| `portal.ombudsman_taxonomy`        | json | inclui "solicitação"                                                                                                              | vigente  | não     | não   | OD-P10, H.54                                                     | ouvidoria                                                                                   |
| `portal.attachment.max_size_mb`    | int  | 10                                                                                                                                | proposta | não     | não   | OD-P66, spec §7, A6(e)                                           | upload de anexos (o app usa `ATTACHMENT_MAX_BYTES`/`accept` fixos até o parâmetro ser lido) |
| `portal.attachment.accepted_types` | json | `["application/pdf","image/jpeg","image/png"]`                                                                                    | proposta | não     | não   | OD-P66, spec §7, A6(e)                                           | upload de anexos (o app usa `ATTACHMENT_MAX_BYTES`/`accept` fixos até o parâmetro ser lido) |

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

## Namespaces i18n (allowlist do verificador)

Uma chave i18n não é um parâmetro: ela não entra nas cinco tabelas acima. Um namespace de
i18n entra nesta tabela somente para que `verify:parameter-catalogue --check-usage`
(`tools/parameters/verify.mjs`) deixe de tratar seus literais como candidato a parâmetro
desconhecido — nunca por exclusão de diretório. Origem: `OD-P46`
(`docs/framework/arch/portal-build-pack.md` §4) e método §4.17
(`docs/meta/agents/orchestra/README.md`).

| Namespace              | App               | Catálogo                         | Decisão |
| ---------------------- | ----------------- | -------------------------------- | ------- |
| `portal.shell`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.common`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.states`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.errors`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.situation`     | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.screens`       | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.forms`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.legal`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.requests`      | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.evaluations`   | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.notifications` | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.documents`     | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.services`      | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
| `portal.a11y`          | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |

## Regras do catálogo

1. Nenhuma constante silenciosa: todo valor que aparece numa OD tem linha aqui.
2. `pend.=sim` obriga a interface a exibir "premissa de desenho — pendente de decisão" e bloqueia
   comandos que exigem o valor.
3. Quem fecha uma decisão cria **nova versão** com `reason` e `decision_ref`; a linha aqui muda
   de `proposta` para `vigente`, e o item sai de `decision-closure-plan.md`.
4. Gate `verify:parameter-catalogue` (WP-A): chaves usadas no código ⊆ catálogo; `decision_ref`
   existentes; nenhuma `legal=sim` editável.

## Contrato de geração e verificação

Esta seção é normativa para `tools/parameters/generate-seed.mjs` e para
`verify:parameter-catalogue`. Ela transforma somente as linhas das cinco tabelas
de parâmetros deste documento em artefatos de fixture. Não é uma autorização para
alterar defaults, status, decisões ou o catálogo normativo.

### Gramática de entrada

O parser reconhece exclusivamente a primeira tabela Markdown imediatamente sob
cada heading `RAIT`, `TEAT`, `PORTAL`, `BOAT` e `DASHBOARD`. O texto explicativo
entre parênteses no heading não altera seu nome. Nenhuma tabela sob outro heading
é entrada do catálogo.

Cada tabela reconhecida deve ter, nesta ordem, exatamente as oito colunas:

```text
Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor
```

A linha de separação Markdown deve ter oito células de separação. Cada linha de
dados deve ter exatamente oito células após o parser Markdown tratar delimitadores
escapados. Células obrigatórias vazias, cabeçalho divergente, tabela ausente,
linha malformada ou chave duplicada falham a execução com diagnóstico que inclua
arquivo e linha. A unicidade da chave é global entre as cinco tabelas.

Antes de validar a célula, a normalização remove somente markup de apresentação:

1. um link Markdown vira seu rótulo, preservando o texto do rótulo;
2. backticks e pares de `**` são removidos;
3. o restante do conteúdo, inclusive pontuação, acentos, palavras e espaços
   internos, é preservado.

Não há correção ortográfica, substituição de sinônimos, inferência de valor,
normalização de conteúdo humano ou reparo silencioso de célula. A validação usa o
texto resultante dessa remoção de markup.

### Superfície, chave e valores de linha

O heading determina a superfície e os únicos prefixos aceitos para suas chaves:

| Heading   | `surface`   | Prefixos literais permitidos                    | Exceções |
| --------- | ----------- | ----------------------------------------------- | -------- |
| RAIT      | `rait`      | `rait.`, `collection.`, `deadline.`, `session.` | nenhuma  |
| TEAT      | `teat`      | `teat.`, `sync.`                                | nenhuma  |
| PORTAL    | `portal`    | `portal.`, `privacy.`                           | nenhuma  |
| BOAT      | `est`       | `est.`                                          | nenhuma  |
| DASHBOARD | `dashboard` | `dashboard.`                                    | nenhuma  |

A chave é literal, não é reescrita e deve começar por um dos prefixos da sua
linha. `shared` permanece superfície válida do store, mas não tem heading, tabela
ou linha neste catálogo. Uma exceção futura exige ser acrescentada explicitamente
à coluna **Exceções** desta tabela antes de o parser poder aceitá-la.

`Status` aceita somente `vigente`, `a_confirmar` ou `proposta`. `pend.` e `legal`
aceitam somente `sim` ou `não`; eles geram respectivamente `source_pending` e
`legal_readonly`. O valor de `Tipo` é preservado como `value_type`: não há enum ou
coerção adicional para ele.

O `Default` gera `value_json` sob as seguintes regras fechadas:

- para `Tipo=F`, o default tem de ser exatamente `true` ou `false` e gera JSON
  boolean; qualquer outro texto, inclusive `—`, falha;
- um número que seja um literal JSON numérico completo gera JSON number;
- `—` gera JSON null somente quando `source_pending=true`; em qualquer outra
  linha, falha;
- todo outro default gera JSON string, sem tentar interpretar listas, unidades,
  percentuais, expressões, texto humano ou estrutura JSON implícita.

### Referências de decisão

A célula `Decisão` é preservada como proveniência e seus tokens são extraídos em
ordem de ocorrência. São decisões elegíveis somente `H.<n>`, `OD-*` e `DT-*`.
`IND-*`, `WF-*`, `RN-*`, `REF-*` e citações documentais nunca suprem uma decisão.

`decision_ref` é singular: seleciona a última ocorrência de `H.<n>`; se não
houver `H.<n>`, seleciona o primeiro `OD-*` ou `DT-*`. A ausência de uma decisão
elegível falha. A decisão selecionada tem de existir em ao menos uma das fontes
lidas: `decision-closure-plan.md`, `steering.md` §H,
`open-decisions-rait.md`, `open-issues.md` ou as cédulas do Owner. Todo token
adicional é preservado nos metadados gerados; cada token adicional que também seja
`H.<n>`, `OD-*` ou `DT-*` precisa resolver nessas fontes. Não se escolhe um token
por semelhança nem se inventa uma referência ausente.

### Namespaces i18n

O parser reconhece exclusivamente a primeira tabela Markdown sob o heading
`Namespaces i18n`, com exatamente as quatro colunas `Namespace | App | Catálogo |
Decisão`, na mesma disciplina de gramática das cinco tabelas de parâmetros.

`Namespace` é um literal `<prefixo>.<segmento>` em que `<prefixo>` é um dos
prefixos literais permitidos de uma das cinco superfícies (§Superfície, chave e
valores de linha) e `<segmento>` casa `[a-z][a-z0-9_]*`. A unicidade do
`Namespace` é obrigatória na tabela. A célula `Decisão` segue a mesma regra de
resolução da célula `Decisão` das tabelas de parâmetros: só `H.<n>`, `OD-*` ou
`DT-*` são elegíveis e a decisão selecionada precisa existir em ao menos uma das
mesmas fontes (`decision-closure-plan.md`, `steering.md`, `open-decisions-rait.md`,
`open-issues.md`, cédulas do Owner).

Fail-closed: um namespace que seja prefixo (`<ns>.`) de qualquer chave das cinco
tabelas de parâmetros falha a execução; um namespace cujo `<prefixo>` seja
estranho aos prefixos das superfícies falha; a tabela ausente, malformada ou com
célula vazia falha.

A allowlist de namespaces i18n não gera artefato e não entra no seed — mas, como o
gerador coloca o SHA-256 desta fonte no cabeçalho dos artefatos gerados, toda
edição deste arquivo, inclusive desta tabela, exige rodar `pnpm
parameters:generate` para os artefatos deixarem de ficar `stale`.

### Saídas determinísticas

O gerador lê esta fonte como bytes UTF-8, calcula seu SHA-256 e coloca a identidade
da fonte e esse SHA-256 no cabeçalho de todos os artefatos. Com a mesma fonte, a
ordem das linhas é a ordem do catálogo e os bytes de saída são idênticos.

Ele produz somente:

- `backend/database/seed/05-parameters.sql`;
- `backend/domains/ops/parameter/src/generated/parameter-catalogue.ts`;
- `backend/app/src/generated/parameter-flags.ts`.

O artefato do domínio exporta todas as entradas, cada uma com a chave literal,
`surface`, `value_type`, `value_json`, `status`, `source_pending`,
`legal_readonly`, `decision_ref` e os metadados de proveniência da célula
`Decisão`. O artefato local do app exporta somente o mapa de defaults booleanos
das linhas `Tipo=F`; o runtime o importa relativamente. Nenhum artefato gerado é
editado à mão.

O seed é fixture local, não provisionamento de tenant de produção. Ele insere uma
linha por chave para o tenant canônico
`00000000-0000-7000-8000-00000000a001`, com `scope='tenant'`,
`traffic_agency_id=NULL`, `effective_from='2026-09-13'`, `version=1`,
`changed_by='00000000-0000-4000-8000-0000b0000016'` (o `agency-admin` canônico)
e `reason='ARCH-PARAMETER-CATALOGUE'`. A agência não é consumida por essa fixture
porque seu escopo é tenant. A idempotência usa o índice natural de
`ops.parameter`; repetir o seed não cria outra versão nem outra linha.

### Flags e ambiente

Os defaults de flags vêm exclusivamente do mapa gerado. `detranFeatureFlagSet()`
preserva os overrides de ambiente existentes: para uma chave de flag, o nome
canônico é `DETRAN_FEATURE_` mais a chave em maiúsculas, com cada sequência de
caracteres não alfanuméricos convertida em `_`. Assim,
`teat.speed_meters` usa `DETRAN_FEATURE_TEAT_SPEED_METERS`.

O alias legado `DETRAN_FEATURE_SPEED_METERS` continua controlando
`teat.speed_meters`. Quando ambos estiverem definidos, o nome canônico prevalece;
quando somente o legado estiver definido, ele prevalece sobre o default gerado. A
interpretação do override mantém a semântica atual: `on`, `true` e `1` ativam; um
valor definido diferente deles desativa. A ausência ou string vazia usa o default
gerado.

### Verificador fail-closed

`verify:parameter-catalogue` deve falhar para fonte fora da gramática, referência
não resolvida, artefato gerado ausente ou divergente, flag sem default booleano,
chave duplicada, prefixo incompatível, célula obrigatória vazia ou valor que exija
inferência. Ele também verifica que nenhuma linha `legal_readonly=true` seja
tratada como editável pelo contrato de geração.

Para detectar uso em código, o verificador examina literais de string estáticos em
código. A varredura cobre **todo** diretório do repositório; só `tests`, `dist` e
`node_modules` são ignorados — não há exclusão por diretório para nenhum outro
caso, inclusive código gerado. Qualquer literal exatamente igual a uma chave do
catálogo conta como uso, inclusive uma chave de um ponto como
`teat.speed_meters`. Um literal que não esteja no catálogo é candidato desconhecido
somente se tiver dois ou mais pontos e começar por um destes prefixos: `rait`,
`collection`, `deadline`, `session`, `teat`, `sync`, `portal`, `privacy`, `est` ou
`dashboard` — **exceto** quando os dois primeiros segmentos do literal formam um
namespace declarado em §Namespaces i18n (allowlist do verificador); nesse caso o
literal não é candidato, porque é uma chave i18n, não um parâmetro. Literais
desconhecidos de um ponto são ambíguos com entidades de auditoria, como
`portal.complaint`, e não são candidatos. A allowlist de namespaces i18n é a
única isenção da heurística: nunca por diretório. Assim, com a varredura cobrindo
todo diretório, os rótulos `portal.requests.nextAction.<STATE>` e
`portal.evaluations.publicIndicator` — transcritos como tipos `const` nos
clientes de comando gerados (`BP-PORTAL-*.commands.ts`,
`packages/api-clients/src/generated`) — deixam de ser candidatos porque seus dois
primeiros segmentos formam, respectivamente, os namespaces `portal.requests` e
`portal.evaluations` da allowlist. Não existe allowlist silenciosa: a única
allowlist é a declarada em §Namespaces i18n e lida pelo verificador; todo outro
candidato desconhecido falha com arquivo, linha e literal.

A conversão de `inf.normative_agency_parameter` em view está fora deste contrato.
