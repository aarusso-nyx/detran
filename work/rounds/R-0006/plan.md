# R-0006 — frente `rait-model` (WP-A restante do RAIT: agregado da infração, organização, financeiro, integração)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro Fable 5.1
(prompt em `prompts/00-maestro.md`). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`.
**Depende de:** `param-store` (R-0004) em `main` (parâmetros vivem em `ops.parameter`, ADR-0021).
**Janelas previstas:** 2.

## Metas

1. **Agregado da infração** (ADR-0014, ADR-0016): blueprint `BP-INF-INFRACTION-001` (módulo
   `inf/infraction`): `infraction` (state FK `infraction_state_ref`, substate, subject_kind,
   `efeito_suspensivo`, `pago`, `faixa`, `pontuacao_registrada`, `motivo_encerramento`,
   `bandeira_risco`, `ait_id`), `infraction_notice` (NA/NP/decisão: canal FK, expedição, ciência,
   data-limite impressa), `infraction_timer` (code FK `infraction_timer_ref`, `started_on`,
   `due_on`, `ceiling_on`, `status`, `suspended_by_act`), `infraction_event` (append-only),
   `infraction_payment`; tabelas de referência `infraction_state_ref`, `infraction_transition_ref`,
   `infraction_timer_ref` (com `owner`), `infraction_payment_tier_ref` em
   `14-inf-lifecycle-vocabulary.sql` ([WF-INF-003] §1–§6, [WF-INF-002] §9.2). Módulo
   `inf/notification` (ADR-0016) e pacote `@detran/inf-deadlines` (motor de prazos como biblioteca:
   calendário `docs/framework/arch/fixtures/calendar-2026.json`, regras de `rait-deadline-engine.md`,
   sem rotas ainda — as rotas são de R-0007).
2. **Deltas v1.1.0**: `BP-INF-RAIT-WORKLIST-001` (`rait_unit`, `rait_schedule`/`rait_schedule_slot`,
   `rait_batch`/`rait_batch_item`, `rait_substitute_duty`, `rait_impediment.kind` + `decided_by`,
   `rait_bench` — [WF-RAIT-004] §10), `BP-INF-RAIT-SESSION-001` (`rait_session.modality`,
   `short_notice_ack`; `rait_agenda_item.view_requested_by/view_due_on`; `rait_minutes.published_at`
   — OD-102/103/106, vigentes por H.57), `BP-INF-RAIT-CASE-001` (`rait_case.legal_priority`,
   `unit_id`, `version`; `rait_pending_content`; `rait_redirect`; `rait_draft` — UC-RAIT-027/028).
3. **Organização** `BP-INF-RAIT-ORG-001`: `rait_holiday`, `rait_suspension_act`,
   `rait_jeton_sheet`/`rait_jeton_line`, `rait_incident`, `rait_quality_sample`,
   `rait_capacity_plan`, `rait_export` (UC-RAIT-022/025/036/038/042/043). **Sem** `rait_parameter`:
   parâmetros em `ops.parameter` (R-0004).
4. **Financeiro** `BP-INF-RAIT-FINANCE-001` (ADR-0017, módulo `inf/collection` + port bancário
   mock): `rait_collection_document`, `rait_payment`, `rait_refund_order`, `rait_debt_handoff`
   (UC-RAIT-032…035; faixas FK `infraction_payment_tier_ref`).
5. **Integração** `BP-INF-RAIT-INTEGRATION-001` (leitura): projeções da `integration.outbox` por
   sistema (`renainf`, `renach`, `sne`), `rait_reconciliation` (ADR-0003, ADR-0020).
6. **Documentos** (ADR-0018): facade `@detran/shared/documents` em `backend/domains/shared/src/documents/`
   (tipos `document_kind`, `signature_policy`, templates) — só a fachada e os tipos; geração real de
   PDF/A fica para quem a consome.
7. **DDL, `apply.sh`, fixtures**: números livres em ordem de dependência —
   `38-inf-infraction.sql`, `39-inf-rait-org.sql`, `57-inf-rait-finance.sql`,
   `58-inf-rait-integration.sql` (40–56 e 60 estão ocupados por `ch`/`portal`; corrigir a frase
   "34…37 já incluídos" do build pack); `apply.sh` lê `ddl/*.sql` por ordem lexicográfica, nada a
   listar. Fixtures por estado em `backend/database/seed/` (`rait-fixtures.md`).
8. Documentação: `rait-build-pack.md` §WP-A executado (com a numeração real dos DDL); ADR-0014/0016/0017/0018
   ganham "Implementação: PR #n"; `docs/framework/blueprints/README.md`; backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                                        | Depende de           | Entrega                                                                                                                                      |
| --------- | ------------ | ------------------- | -------------- | ------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-inf-infraction`, `MOD-ddl-14`                                                       | —                    | `BP-INF-INFRACTION-001`, refs no DDL 14, tabela de transições `infraction_transition_ref` transcrita de [WF-INF-003] §2, critérios           |
| TASK-0002 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-infraction-tests`, `MOD-inf-deadlines-tests`                                       | TASK-0001            | testes: matriz de transição da infração (todas as linhas de `infraction_transition_ref`), timers (início/teto/suspensão com calendário), RLS |
| TASK-0003 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-infraction`, `MOD-inf-notification`, `MOD-inf-deadlines`, `MOD-app-module`         | TASK-0002            | módulos gerados + `@detran/inf-deadlines` + `inf/notification`; `AppModule`; testes verdes                                                   |
| TASK-0004 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-rait-worklist`, `MOD-bp-rait-session`, `MOD-bp-rait-case`                           | —                    | deltas v1.1.0 (três blueprints), critérios, notas de migração de DDL 34–36                                                                   |
| TASK-0005 | Architect    | architect-blueprint | Opus / médio   | `MOD-bp-rait-org`, `MOD-bp-rait-finance`, `MOD-bp-rait-integration`, `MOD-shared-documents` | TASK-0001            | três blueprints novos + fachada de documentos (tipos), critérios                                                                             |
| TASK-0006 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-rait-tests`                                                                            | TASK-0004, TASK-0005 | testes de integração: checks/FKs, RLS, unicidade (lote, escala), fixtures carregam                                                           |
| TASK-0007 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-rait-modules`, `MOD-seed`                                                              | TASK-0006            | regeneração dos módulos `rait-*`, novos módulos org/finance/integration, fixtures; testes verdes                                             |
| TASK-0008 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                                                  | TASK-0003, TASK-0007 | build pack, ADRs (implementação), READMEs, backlog                                                                                           |

CTG-0001 = TASK-0001…0003 (infração); CTG-0002 = TASK-0004…0007 (RAIT). Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check`, `pnpm contracts:check` → sincronizados (formatar blueprint antes de gerar).
- `pnpm verify:rls-ddl`, `pnpm verify:lifecycle-vocabulary` → OK (novas `*_ref` seedadas e
  verificadas; `infraction_transition_ref` cobre 100 % das transições de [WF-INF-003] §2).
- `DB_NAME=detran_r6 DB_PASSWORD=postgres bash backend/database/apply.sh --full` → `apply.sh: done`;
  `bash backend/database/seed.sh` duas vezes → sem erro; `pnpm backend:rls-smoke` → OK.
- `pnpm --filter @detran/inf-deadlines test` → verde (pacote criado nesta rodada, script `test`
  obrigatório); `pnpm --filter @detran/inf-infraction test:unit|test:integration` → verdes.
- `pnpm backend:test:ci` → verde; `pnpm check` → verde; `node tools/docs/kb/check.mjs` → 521/446.

## Mapa entregável → definições

| Entregável           | Definição                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| infração             | ADR-0014 §Consequências; ADR-0016; [WF-INF-003] §1–§6; [WF-INF-002] §9.2; `14-inf-lifecycle-vocabulary.sql`                                               |
| prazos               | `rait-deadline-engine.md`; `docs/framework/arch/fixtures/calendar-2026.json`; steering H.46/H.47; `parameter-catalogue.md` (`deadline.*`, `rait.timer.*`) |
| worklist/sessão/caso | [WF-RAIT-004] §10; [WF-RAIT-003]; [WF-RAIT-001]; UC-RAIT-027/028; steering H.57 (OD-101…112 vigentes)                                                     |
| organização          | UC-RAIT-022/025/036/038/042/043; jeton pendente de fonte (H.54/H.57) → colunas existem, valores `source_pending`                                          |
| financeiro           | ADR-0017; UC-RAIT-032…035; steering H.53 (`collection.discount_40_outside_sne=false`)                                                                     |
| integração           | ADR-0003; ADR-0020; `rait-events-sse-contract.md`                                                                                                         |
| documentos           | ADR-0018                                                                                                                                                  |
| fixtures             | `rait-fixtures.md`; `docs/framework/arch/fixtures/rait-fixtures.json`                                                                                     |

## Riscos

- `14-inf-lifecycle-vocabulary.sql` é lock compartilhado com `ops-agency` (R-0005, `inf.ait_state_ref`):
  a segunda frente a mesclar rebaseia; conflito esperado só por blocos adjacentes.
- `BP-INF-AIT-001` recebe v1.1.0 em R-0005; esta frente **não** o edita (`ait_id` FK apenas referencia).
- Timers `owner='medida'` (TEAT) podem chegar como seed pendente de R-0005: aplicar aqui.
- Nenhum valor de prazo inventado: só os de [WF-INF-002] §9.2 e do catálogo; o que faltar vira
  `source_pending`.

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
