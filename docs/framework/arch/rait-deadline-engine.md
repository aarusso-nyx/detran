---
id: ARCH-RAIT-DEADLINES
title: Motor de prazos do RAIT e da infração — contagem, calendário, timers, suspensão e vencimento idempotente
status: draft
apps: [rait, portal, dashboard]
updated: 2026-09-13
---

# Motor de prazos (`DeadlineEngine`)

Especificação de implementação do componente que **calcula, arma, reprograma e vence** todos os
timers de `WF-INF-002` §9 (catálogo persistido em `inf.infraction_timer_ref`) e os relógios de
risco de `WF-RAIT-002` §4. É o único lugar do sistema que sabe contar prazo; frontend e demais
módulos consomem datas prontas (`RN-RAIT-005`, `RN-RAIT-105`).

## 1. Posição e fronteiras

- Pacote: `backend/domains/inf/rait-case/src/handwritten/deadlines/` (compartilhado com o futuro
  módulo `infraction` via `@detran/inf-rait-case`), exportado por `handwrittenExports`.
- Entradas: catálogo (`infraction_timer_ref`), calendário (`rait_holiday`, WP-A), parâmetros
  versionados (`rait_parameter`), eventos de domínio.
- Saídas: linhas em `rait_deadline` (caso) e `infraction_timer` (infração, WP-A); `rait_clock` +
  `rait_clock_alert` (risco); eventos `TIMER_VENCIDO`, `RISCO_PRESCRICAO_ALTERADO`; transições
  disparadas por comando interno (`system` principal).
- Nunca chama sistemas externos; nunca decide mérito; nunca suspende sozinho.

## 2. Regras de contagem (normativas)

| Regra                                                | Implementação                                                                                                                                                                                                                                                                | Base                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Dias corridos                                        | `due = start + n` dias civis, **excluindo** o dia do marco e **incluindo** o do vencimento (`start_on` = marco; `raw_due_on = start_on + n`)                                                                                                                                 | Res. 918/2022 art. 29; `RN-RAIT-005`                   |
| Dias úteis (`T-DIL`, `T-CONV`, `T-ASS`, `T-CLAIM`)   | conta apenas dias seg–sex fora do calendário de feriados (nacional + AM + municipal do órgão, se cadastrado); `business_days=true` em `rait_deadline`                                                                                                                        | Owner A.7; `WF-RAIT-002` §7                            |
| Vencimento em dia não útil                           | `due_on = próximo dia útil ≥ raw_due_on` (nunca antecipa: `ck_inf_rait_deadline_rounding_forward`)                                                                                                                                                                           | Res. 918/2022 art. 29 p.ú.                             |
| Data impressa (`T-DEF`, `T-NP-VENC`)                 | `due_on = data_limite_impressa` da NA/NP; o motor **valida** `data_limite_impressa ≥ expedição + 30` e registra `RAIT.INFRACTION_NOTICE_DEADLINE_SHORT` se menor; nunca substitui a data impressa por cálculo próprio                                                        | CTB arts. 281-A, 282 §4º; `RN-RAIT-101`, `RN-RAIT-102` |
| Marco por canal                                      | `start_on` = expedição (postal), ciência ficta (SNE: disponibilização + 30 dias ou leitura, o que vier antes), publicação (edital), assinatura (AIT≡NA), balcão (protocolo)                                                                                                  | `RN-RAIT-104`; `inf.notification_channel_ref`          |
| Tempestividade de peça                               | comparação `marco_da_peça ≤ due_on` do timer aberto, onde marco = postagem ECT / protocolo no órgão / protocolo eletrônico / balcão; resultado gravado em `rait_admissibility(tempestividade)` como somente leitura                                                          | Res. 900/2022 art. 6º; `RN-RAIT-106`, `RN-RAIT-122`    |
| Meses e anos (`T-JUL-24M`, `T-PAR-3A`, `T-PRESC-5A`) | soma de calendário (`date + interval 'n months'`), com a mesma regra de dia não útil; relógio **por instância** para `T-JUL-24M`, contado do recebimento pelo órgão julgador                                                                                                 | CTB art. 285 §6º, 289-A; `RN-RAIT-110`…`112`           |
| Reinício (`T-PAR-3A`)                                | cada evento de movimentação do caso reinicia `start_on`; a lista de eventos que contam como movimentação é parâmetro (default: qualquer evento com `actor_id` humano)                                                                                                        | Lei 9.873/1999 art. 1º §1º (validade OD-301)           |
| Interrupção (`T-PRESC-5A`)                           | somente eventos das hipóteses do art. 2º (notificação, inclusive edital; ato inequívoco de apuração) — lista fechada em parâmetro; **sem auto-reset na NP** (OD-305)                                                                                                         | Lei 9.873/1999 art. 2º                                 |
| Suspensão                                            | nunca automática; só por `rait_suspension_act` assinado (força maior), que **reprograma** `due_on` somando os dias suspensos e grava `suspended_by_act_id`; vedada sobre timers de extinção (`T-DEC`, `T-JUL-24M`, `T-PAR-3A`, `T-PRESC-5A`) → `RAIT.SUSPENSION_LEGAL_TIMER` | CTB art. 290-A; `RN-RAIT-105`; `UC-RAIT-022`           |
| Prorrogação (`T-DIL`)                                | uma vez, mesmo prazo, `extension_count ≤ 1`                                                                                                                                                                                                                                  | Res. 900/2022 art. 9º; `RN-RAIT-004`                   |

## 3. Ciclo de vida de um timer

```text
armar(codigo, marco, contexto)      → cria linha (started_on, raw_due_on, due_on, legal_basis); idempotente por (owner_id, codigo, started_on)
reprogramar(id, ato)                → só por ato de suspensão; guarda histórico (evento TIMER_REPROGRAMADO)
satisfazer(id, evento)              → satisfied_at = agora; timer sai da varredura; nunca apaga
cancelar(id, motivo)                → idem, com motivo (ex.: NA expedida cancela T-NA)
vencer(id)                          → job: due_on < hoje (fuso do tenant) e satisfied_at nulo → aplica efeito do catálogo
```

Efeito ao vencer, por `expiry_kind` de `infraction_timer_ref`:

| `expiry_kind` | Ação do motor                                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `transicao`   | executa o comando interno da transição (`infraction_transition_ref` com `trigger_kind='timer'`), como principal `system`, na mesma transação; emite `TIMER_VENCIDO` + `INFRACAO_ESTADO_ALTERADO` |
| `alerta`      | cria `rait_clock_alert` / notificação ao papel responsável (`notified_role`); emite `TIMER_VENCIDO`                                                                                              |
| `marco`       | grava a data (ex.: ciência ficta) e rearma os timers dependentes (`T-DEF` a partir da ciência)                                                                                                   |
| `regra`       | aplica a regra declarada (ex.: `T-IND`: responsável = principal condutor/proprietário; PJ → evento para novo AIT)                                                                                |
| `guarda`      | não vence: é verificado no comando (ex.: `T-CONV` no fechamento da pauta)                                                                                                                        |
| `indicador`   | não vence; alimenta KPI                                                                                                                                                                          |

Timers com `status='a_confirmar'` (`T-NA-IND`, `T-PAR-3A`, `T-PRESC-5A`) vencem como **`alerta`**
até a decisão `OD-301`/`OD-304`; o parâmetro `deadline.<codigo>.expiry_kind_override` permite
promover a `transicao` sem código novo.

## 4. Relógios de risco (`rait_clock` A/B/C/D)

- A = `T-DEC` (decadência), B = `T-JUL-24M` (prescrição por instância), C = `T-PAR-3A`
  (paralisação), D = `T-PRESC-5A` (quinquenal). Um relógio por caso ativo, `ceiling_on` = `due_on`
  do timer correspondente.
- Bandeira calculada em toda varredura: `SEM_RISCO → ALERTA_N1 → N2 → N3 → CRITICO →
PRESCRITO_OPERACIONAL`, com a escada de `WF-RAIT-002` §4.1 (B: 12/18/21/23 meses; D:
  30/45/54/60 meses; A e C: parâmetro). Mudança de bandeira emite `RISCO_PRESCRICAO_ALTERADO` e,
  a partir de `ALERTA_N2`, cria `rait_clock_alert` para o papel do nível (`notified_role`);
  `PRESCRITO_OPERACIONAL` exige `incident_ref` (constraint).
- Ordem única das filas (`RN-RAIT-141`) usa a pior bandeira do caso como primeira chave.

## 5. Varredura (job)

- Executa a cada 15 minutos por tenant (parâmetro), sob `SystemContext` do kernel, lote de até 500
  timers vencidos, **uma transação por timer** (falha em um não bloqueia os demais).
- Idempotência: `vencer` só age se `satisfied_at IS NULL` e grava `satisfied_at` na mesma transação;
  reexecuções não repetem transição nem evento (`WF-INF-003` §5.7).
- Fuso: "hoje" = data civil no fuso do tenant (`auth.tenants.timezone`); a comparação é por data,
  não por instante.
- Observabilidade: métricas `deadlines.expired_total{code}`, `deadlines.sweep_duration`,
  `clocks.flag_changes_total{flag}`; log estruturado com `requestId` do job.

## 6. Interfaces (TypeScript)

```ts
export interface Clock {
  today(tenantTz: string): LocalDate;
  now(): Date;
}
export interface Calendar {
  isBusinessDay(d: LocalDate, tenantId: string): Promise<boolean>;
  nextBusinessDay(d: LocalDate, tenantId: string): Promise<LocalDate>;
}
export interface TimerCatalog {
  get(code: TimerCode): TimerDefinition;
} // lido de infraction_timer_ref + parâmetros
export interface DeadlineEngine {
  arm(input: {
    ownerKind: 'case' | 'infraction' | 'session';
    ownerId: string;
    code: TimerCode;
    startOn: LocalDate;
    startBasis: string;
    legalBasis: string;
    tx: Transaction;
  }): Promise<Deadline>;
  satisfy(id: string, reason: string, tx: Transaction): Promise<void>;
  reschedule(
    id: string,
    act: SuspensionAct,
    tx: Transaction,
  ): Promise<Deadline>;
  computeDue(
    code: TimerCode,
    startOn: LocalDate,
    tenantId: string,
    printedDeadline?: LocalDate,
  ): Promise<{ rawDueOn: LocalDate; dueOn: LocalDate }>;
  sweep(tenantId: string, limit?: number): Promise<SweepReport>;
  timeliness(input: {
    code: TimerCode;
    ownerId: string;
    pieceMarkOn: LocalDate;
  }): Promise<{ timely: boolean; dueOn: LocalDate; basis: string }>;
}
```

`LocalDate` é `YYYY-MM-DD` (sem hora). `Clock` e `Calendar` são injetáveis; os testes usam
`FixedClock` e `InMemoryCalendar` com `fixtures/calendar-2026.json`.

## 7. Casos de teste obrigatórios (`rait-test-strategy.md` §2)

| #   | Caso                                                                                       | Esperado                                                                                                  |
| --- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 1   | `T-REM10`, marco 2026-09-14 (seg)                                                          | `raw_due_on=2026-09-24`, `due_on=2026-09-24`                                                              |
| 2   | `T-R2`, marco 2026-09-14, 30 dias → cai em 2026-10-14 (qua)                                | `due_on=2026-10-14`                                                                                       |
| 3   | dias corridos caindo em sábado 2026-10-10 (marco 2026-09-10, 30 dias)                      | `raw_due_on=2026-10-10`, `due_on=2026-10-13` (seg 12/10 feriado)                                          |
| 4   | `T-DIL` 15 dias úteis a partir de 2026-11-13 (sex), com 15/11 (dom) e 20/11 (sex, feriado) | `due_on=2026-12-07`                                                                                       |
| 5   | `T-DEF` com data impressa 2026-10-30 e expedição 2026-09-14                                | `due_on=2026-10-30`; sem erro (≥ 30 dias)                                                                 |
| 6   | `T-DEF` com data impressa 2026-10-01 e expedição 2026-09-14                                | erro `RAIT.INFRACTION_NOTICE_DEADLINE_SHORT` na expedição                                                 |
| 7   | NA por SNE disponibilizada 2026-09-14 sem leitura                                          | ciência ficta 2026-10-14; `T-DEF` conta da ciência                                                        |
| 8   | NA por SNE lida em 2026-09-20                                                              | ciência 2026-09-20                                                                                        |
| 9   | `T-JUL-24M` recebimento 2026-09-14                                                         | `due_on=2028-09-14`; bandeiras em 2027-09-14 (N1), 2028-03-14 (N2), 2028-06-14 (N3), 2028-08-14 (CRÍTICO) |
| 10  | ato de suspensão de 10 dias sobre `T-DIL`                                                  | `due_on` +10 dias úteis; `suspended_by_act_id` preenchido; evento                                         |
| 11  | ato de suspensão sobre `T-DEC`                                                             | `RAIT.SUSPENSION_LEGAL_TIMER`                                                                             |
| 12  | `sweep` executado duas vezes sobre o mesmo timer vencido                                   | uma transição, um `TIMER_VENCIDO`                                                                         |
| 13  | `T-PAR-3A` com movimentação em 2027-01-10                                                  | `started_on` reiniciado; `due_on=2030-01-10`                                                              |
| 14  | `T-PRESC-5A` com NP expedida                                                               | sem reinício (OD-305)                                                                                     |
| 15  | peça postada 2026-10-14 com `T-NP-VENC` `due_on=2026-10-14`                                | tempestiva                                                                                                |
| 16  | peça protocolada 2026-10-15 idem                                                           | intempestiva; triagem grava `tempestividade=false` somente leitura                                        |
| 17  | `T-DEC` 180 dias com defesa tempestiva protocolada                                         | `due_on` recalculado para 360 dias do cometimento                                                         |
| 18  | `T-DEC` 180 dias com defesa **não conhecida por intempestividade**                         | permanece 180 dias                                                                                        |

Datas dos feriados usadas: `docs/framework/arch/fixtures/calendar-2026.json` (nacional + AM + Manaus; a tabela `rait_holiday` é criada em WP-A).
