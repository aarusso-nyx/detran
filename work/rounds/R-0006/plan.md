# R-0006 — frente `rait-model` (WP-A restante do RAIT: agregado da infração, organização, financeiro, integração)

**Status:** aberta em 2026-09-14 pelo maestro Fable 5.1 (Architect no planejamento, Engineer no
git); prompt em `prompts/00-maestro.md`. Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`.
**Concorrência:** abre com `origin/main` ≥ 80d705a; merge por grupo acoplado — CTG-0001 (infração, `inf/notification`, `@detran/inf-deadlines`): nenhum upstream — lock em `14-inf-lifecycle-vocabulary.sql` com R-0005 `ops-agency`, rebase. CTG-0002 (worklist/sessão/caso, org, financeiro, integração): `param-store` R-0004 (`orchestra/param-store`) em `main`.
**Janelas previstas:** 2.

## Metas

1. **Agregado da infração** (ADR-0014, ADR-0016): blueprint `BP-INF-INFRACTION-001` (módulo
   `inf/infraction`): `infraction` (state FK `infraction_state_ref`, substate, subject_kind,
   `suspensive_effect`, `paid`, `payment_tier`, `points_registered`, `closure_motive`,
   `risk_flag`, `ait_id`), `infraction_timer` (code FK `infraction_timer_ref`, `started_on`,
   `due_on`, `ceiling_on`, `status`, `suspended_by_act_id`), `infraction_event` (append-only).
   Tabelas de referência (`infraction_state_ref`, `infraction_transition_ref` com as 46
   transições de [WF-INF-003] §2, `infraction_timer_ref` com `owner`, `infraction_payment_tier_ref`,
   `notification_channel_ref`) **já existem** em `14-inf-lifecycle-vocabulary.sql`; esta rodada
   só as referencia. Módulo `inf/notification` (`BP-INF-NOTIFICATION-001`, ADR-0016 §1: `notice`,
   `notice_acknowledgement`, `notice_delivery_attempt`) e pacote `@detran/inf-deadlines`
   (motor de prazos como biblioteca em `backend/domains/inf/deadlines`, ADR-0016 §2: calendário
   `docs/framework/arch/fixtures/calendar-2026.json`, regras de `rait-deadline-engine.md` §2–§3,
   §6–§7, portas em memória; sem rotas nem job — rotas e varredura são de R-0007).
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
4. **Financeiro** `BP-INF-COLLECTION-001` (ADR-0017 §1, módulo `inf/collection` + port bancário
   mock): `collection_document`, `payment`, `refund_order`, `debt_handoff` (UC-RAIT-032…035;
   faixas FK `infraction_payment_tier_ref`).
5. **Integração** `BP-INF-RAIT-INTEGRATION-001`: `rait_reconciliation` (UC-RAIT-029/031, fato próprio do
   RAIT). A projeção da `integration.outbox` por sistema (`renainf`, `renach`, `sne`) é projeção por
   consumidor (ADR-0020) e fica para WP-P (M10) — o build pack é corrigido em TASK-0008.
6. **Documentos** (ADR-0018): facade `@detran/shared/documents` em `backend/domains/shared/src/documents/`
   (tipos `DocumentKind`, `SignaturePolicy`, interface da facade) — especificada pelo Architect no contrato
   (TASK-0005), testada pelo Inspector (TASK-0006) e escrita pelo Engineer (TASK-0007, Art. 10); só a fachada e os tipos; a
   tabela `signature_policy` e a generalização de `normative_document_template` ficam para a
   frente dona de `inf/normative` (R-0008).
7. **DDL, `apply.sh`, fixtures**: números livres em ordem de dependência —
   `38-inf-infraction.sql`, `39-inf-rait-org.sql`, `57-inf-collection.sql`,
   `58-inf-rait-integration.sql`, `59-inf-notification.sql` (40–56 e 60 ocupados por `ch`/`portal`;
   corrigir a frase "34…37 já incluídos" do build pack); `apply.sh` lê `ddl/*.sql` por ordem
   lexicográfica, nada a listar. Fixtures por estado em `backend/database/seed/` (`rait-fixtures.md`).
8. Documentação: `rait-build-pack.md` §WP-A executado (com a numeração real dos DDL); ADR-0016/0017/0018
   ganham "Implementação: PR #n" (maestro, Architect); `docs/framework/blueprints/README.md`;
   `rait-fixtures.md` §8; `rait-deadline-engine.md` §1 (pacote); backlog.

## Decisões do maestro (Architect, 2026-09-14) — reconciliação build pack × ADRs aceitas

| #   | Decisão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Fonte                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| M1  | Avisos (NA/NP/decisão) **não** são entidade do agregado (`infraction_notice` do build pack): vivem em `inf.notice*` do módulo `inf/notification`. O agregado guarda apenas `infraction_timer` e `infraction_event`.                                                                                                                                                                                                                                                                                                    | ADR-0016 §1 (aceita 2026-09-13, posterior ao build pack)     |
| M2  | Pagamentos **não** são entidade do agregado (`infraction_payment`): `inf.payment` pertence a `inf/collection`; o agregado só carrega `paid`/`payment_tier`. Blueprint financeiro chama-se `BP-INF-COLLECTION-001` com tabelas `collection_document`, `payment`, `refund_order`, `debt_handoff` (sem prefixo `rait_`).                                                                                                                                                                                                  | ADR-0017 §1                                                  |
| M3  | `@detran/inf-deadlines` é pacote **manuscrito** em `backend/domains/inf/deadlines` (glob `backend/domains/*/*` do workspace), consumido por `infraction`, `notification` e `rait-case`. `rait-deadline-engine.md` §1 (que o punha em `rait-case`) é corrigido em TASK-0008.                                                                                                                                                                                                                                            | ADR-0016 §2                                                  |
| M4  | Sem edição de `14-inf-lifecycle-vocabulary.sql`: todos os `*_ref` exigidos já estão seedados (15 estados, 12 sub-estados, 46 transições, 18 timers, 6 faixas, 6 canais). O lock com `ops-agency` fica virtual; se um worker achar lacuna, reporta em vez de editar.                                                                                                                                                                                                                                                    | `verify:lifecycle-vocabulary` OK na base d8fe83a             |
| M5  | `suspended_by_act_id` em `infraction_timer` (DDL 38) referencia `rait_suspension_act` (DDL 39) **sem FK** (ordem lexicográfica impede), como já faz `rait_deadline.suspended_by_act_id`.                                                                                                                                                                                                                                                                                                                               | `apply.sh`; BP-INF-RAIT-CASE-001                             |
| M6  | Fixtures SQL são escritas pelo **Inspector** (manual `inspector-tests.md` §Pode tocar), no mesmo grupo do blueprint (`rait-fixtures.md` §8): `30-fixtures-infraction.sql` em TASK-0002; org/finance/integration e ajustes do `20-fixtures-rait.sql` em TASK-0006.                                                                                                                                                                                                                                                      | manual do Inspector; `rait-fixtures.md` §8                   |
| M7  | Pacotes novos (gerados ou manuscritos) exigem `pnpm install` (lockfile). Workers não instalam; o **maestro** roda `pnpm install` no checkpoint de cada tarefa que cria pacote e commita `chore(deps)`. Antes de TASK-0002/0003 o maestro cria o esqueleto de `@detran/inf-deadlines` (package.json, tsconfig, vitest) já linkado.                                                                                                                                                                                      | `AGENTS.md` regra 6; template do worker                      |
| M8  | Guarda de transição da infração nasce nesta rodada como **código puro** (`src/handwritten/guards/`, espelho de `infraction_transition_ref`) sem rotas; o teste de matriz lê o bloco `INSERT` do DDL 14 e exige cobertura de 100 % das linhas `vigente`.                                                                                                                                                                                                                                                                | `rait-test-strategy.md` §3; ADR-0016 §1                      |
| M9  | Sem paralelismo entre tarefas que regeneram blueprints ou aplicam DDL: `pnpm blueprints:generate` reescreve a árvore gerada inteira e `apply.sh` lê todos os DDL. A frente roda em pipeline estrito (TASK-0001 → 0002 → 0003 → PR CTG-0001 → 0004 → 0005 → 0006 → 0007 → 0008).                                                                                                                                                                                                                                        | `tools/blueprints/generate.mjs`; `apply.sh`                  |
| M10 | Migração de `rait_communication` para projeção de `inf.notice` (ADR-0016 §4) e **toda** projeção por consumidor (ADR-0020), inclusive a projeção da `integration.outbox` por sistema que o build pack punha em `BP-INF-RAIT-INTEGRATION-001`, ficam **fora** desta rodada: projeções nascem em WP-P (após WP-B). `BP-INF-RAIT-INTEGRATION-001` nasce só com `rait_reconciliation`. Registrado em §Fora de escopo do PR.                                                                                                | ADR-0020 §Consequências; build pack §5                       |
| M11 | Esquemas JSON dos cinco eventos publicados do agregado (`rait-events-sse-contract.md` §2.4) nascem em `docs/framework/schemas/events/` (WP-A cria a partir da tabela). Eventos consumidos não ganham esquema aqui (donos são outros módulos).                                                                                                                                                                                                                                                                          | `rait-events-sse-contract.md` §2.4                           |
| M13 | Nesta rodada os módulos `inf/infraction` e `inf/notification` **não** são montados no `AppModule`: a superfície HTTP (leituras geradas + comandos) entra em R-0007 junto com a política `inf:infraction:*`/`inf:notice:*`. Entidades append-only (`infraction_event`, `notice_acknowledgement`, `notice_delivery_attempt`) não geram `update`/`delete` (`api.resources[].operations`). A exposição de `PATCH` sobre `infraction.state` pela rota gerada é OD para R-0007 (política deve negar até existirem comandos). | delivery-review-CTG-0001; ADR-0016 §1                        |
| M14 | Envelope reduzido da biblioteca de prazos usa `aggregate.kind: 'clock'` (§1 do contrato de eventos). `data.reason` de `inf.timer.rescheduled` tem os tokens **`suspensao`** \| **`prorrogacao`** (decisão do Owner, 2026-09-14, em resposta ao prompt-review-5); `suspensionActId` é obrigatório e anulável (nulo na prorrogação) no contrato, na tabela §2.4 e no JSON Schema.                                                                                                                                        | Owner 2026-09-14; `rait-events-sse-contract.md` §1           |
| M15 | O motivo do chamador em `extend(id, reason)` é retido em `Deadline.extensionReason` (string, nulo até a prorrogação), persistido pela porta `TimerStore`; o envelope de `inf.timer.rescheduled` não muda (`data.reason` = token `prorrogacao`). Proposta do maestro após delivery-review-3; vigora com a decisão do humano.                                                                                                                                                                                            | delivery-review-CTG-0001-3; contrato §5.2                    |
| M12 | Vocabulários que nenhum workflow fixa (status do timer, status do aviso, tipo de evidência de ciência) são decisões de modelagem do Architect derivadas de `rait-deadline-engine.md` §3 e ADR-0016 §1, em minúsculas (padrão dos enums não canônicos, ex.: `rait_pool.strategy`), documentadas no contrato; não são tokens canônicos.                                                                                                                                                                                  | `CODESTYLE.md` §Naming; padrão de `BP-INF-RAIT-WORKLIST-001` |

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                                                                                                                   | Depende de           | Entrega                                                                                                                                                                                                                                        |
| --------- | ------------ | ------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-inf-infraction`, `MOD-bp-inf-notification`, `MOD-ddl-38`, `MOD-ddl-59`, `MOD-schemas-events`, `MOD-generated-tree`                                             | —                    | `BP-INF-INFRACTION-001`, `BP-INF-NOTIFICATION-001`, gerados (módulos, DDL 38/59, contratos OpenAPI), esquemas dos eventos, `contracts/CTG-0001.md` (entidades, guardas por linha de `infraction_transition_ref`, API do motor, ids de fixture) |
| TASK-0002 | Inspector    | inspector-tests     | Opus / médio   | `MOD-inf-infraction-tests`, `MOD-inf-notification-tests`, `MOD-inf-deadlines-tests`, `MOD-seed-30`, `MOD-inf-ait-rls-count`                                            | TASK-0001            | testes: matriz de transição (todas as linhas de `infraction_transition_ref`), motor de prazos (§7 casos 1–18), esquemas de evento, RLS/checks/unicidade; fixtures `30-fixtures-infraction.sql`                                                 |
| TASK-0003 | Engineer     | engineer-backend    | Opus / médio   | `MOD-inf-deadlines`, `MOD-inf-infraction-handwritten`, `MOD-inf-notification-handwritten`, `MOD-app-module`, `MOD-root-scripts`                                        | TASK-0002            | `@detran/inf-deadlines` implementado, guardas e eventos da infração, regras de ciência da notificação, `AppModule`, scripts raiz; testes de TASK-0002 verdes                                                                                   |
| TASK-0004 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-rait-worklist`, `MOD-bp-rait-session`, `MOD-bp-rait-case`, `MOD-ddl-34`, `MOD-ddl-35`, `MOD-ddl-36`, `MOD-generated-tree`                                      | PR CTG-0001 mesclado | deltas v1.1.0 (três blueprints), gerados, `contracts/CTG-0002-deltas.md` (máquinas TURMA/LOTE/BANCA/disponibilidade, unicidade, notas de migração, ajustes de seed exigidos)                                                                   |
| TASK-0005 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-rait-org`, `MOD-bp-collection`, `MOD-bp-rait-integration`, `MOD-ddl-39`, `MOD-ddl-57`, `MOD-ddl-58`, `MOD-generated-tree`                                      | TASK-0004            | três blueprints novos, gerados, `contracts/CTG-0002-modules.md` (entidades, port bancário, especificação da fachada de documentos, ids de fixture)                                                                                             |
| TASK-0006 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-rait-tests`, `MOD-seed-20`, `MOD-seed-40-60`, `MOD-fixtures-json`, `MOD-inf-ait-rls-count`, `MOD-shared-documents-tests`                                          | TASK-0005            | testes de integração (RLS, checks, FKs, unicidade de lote/escala), fixtures novas e ajustadas, teste de tipos da fachada                                                                                                                       |
| TASK-0007 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-collection-handwritten`, `MOD-inf-rait-org-handwritten`, `MOD-inf-rait-integration-handwritten`, `MOD-shared-documents`, `MOD-app-module`, `MOD-root-scripts` | TASK-0006            | wiring dos módulos novos, port bancário + mock, fachada de documentos (tipos) em `@detran/shared`, scripts raiz; testes de TASK-0006 verdes                                                                                                    |
| TASK-0009 | Architect    | architect-blueprint | Opus / alto    | `MOD-contract-ctg-0001`, `MOD-schemas-events`, `MOD-arch-events-contract`                                                                                              | TASK-0003            | contrato §5.2 (porta `DeadlineEvents`, `extend`, casos 19–22, emenda do caso 12), esquema `inf.timer.rescheduled`                                                                                                                              |
| TASK-0010 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-deadlines-tests`                                                                                                                                              | TASK-0009            | testes dos casos 19–22 e da emenda do 12 (vermelhos)                                                                                                                                                                                           |
| TASK-0011 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-deadlines`                                                                                                                                                    | TASK-0010            | porta de eventos, emissão idempotente, `extend`; testes verdes                                                                                                                                                                                 |
| TASK-0012 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-deadlines-tests`                                                                                                                                              | TASK-0011            | caso 23 (retenção do motivo de `extend`, M15)                                                                                                                                                                                                  |
| TASK-0013 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-deadlines`                                                                                                                                                    | TASK-0012            | `Deadline.extensionReason` persistido; 23 casos verdes                                                                                                                                                                                         |
| TASK-0008 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                                                                                                                             | TASK-0007            | build pack §WP-A, `blueprints/README.md`, `rait-fixtures.md`, `rait-deadline-engine.md` §1, backlog                                                                                                                                            |

CTG-0001 = TASK-0001…0003 (infração, notificação, prazos) + mini-tríade TASK-0009…0011 (janela 2: porta de eventos e
prorrogação de `T-DIL`, decisão do humano após delivery-review-2); CTG-0002 = TASK-0004…0008 (RAIT). Um PR por CTG.
Paralelismo: nenhum (M9); TASK-0008 só depois do relatório de TASK-0007. O número do PR de CTG-0001 é
anotado pelo maestro em §Concorrência após o merge; o PR de CTG-0002 é referido como "pendente" pela
documentação e atualizado pelo maestro no fechamento.

## Critérios de aceitação (comandos → resultado)

- `pnpm format:check` → sem diferenças. `pnpm blueprints:check` → "committed generated tree matches
  every blueprint". `pnpm contracts:check` → sincronizado.
- `pnpm verify:rls-ddl` → OK com o novo total de tabelas de tenant (134 na base); `pnpm verify:lifecycle-vocabulary` →
  OK (15 estados, 12 sub-estados, 18 timers — inalterado); `pnpm verify:decorators` → OK.
- `DB_NAME=detran_r6 DB_PASSWORD=postgres bash backend/database/apply.sh --full` → `apply.sh: done`;
  `DB_NAME=detran_r6 DB_PASSWORD=postgres bash backend/database/seed.sh` duas vezes → `seed.sh: done`, sem erro;
  `DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r6 pnpm backend:rls-smoke` → OK.
- `pnpm --filter @detran/inf-deadlines test` → verde (pacote criado nesta rodada, script `test` obrigatório);
  `pnpm --filter @detran/inf-infraction test:unit` e `test:integration` → verdes; idem `@detran/inf-notification`;
  `pnpm --filter @detran/inf-ait test:integration` → verde com a contagem de tabelas atualizada.
- `pnpm backend:test:ci` → verde; `pnpm check` → verde; `node tools/docs/kb/check.mjs` → sem erro (baseline
  atual: 521 artefatos / 446 publicáveis; mudança só com explicação no PR).

## Mapa entregável → definições

| Entregável           | Definição                                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| infração             | ADR-0014 §Consequências; ADR-0016; [WF-INF-003] §1–§6 (`docs/framework/product/shared/workflows/WF-INF-003.md`); [WF-INF-002] §9 (`…/WF-INF-002.md` linhas 654–721); `14-inf-lifecycle-vocabulary.sql`; `rait-events-sse-contract.md` §2.4 |
| notificação          | ADR-0016 §1 e §Ownership; [WF-INF-002] §2 (P2 Notificar, linhas 220–273); `notification_channel_ref` (RN-RAIT-104); `rait-error-catalog.md` §3.12                                                                                          |
| prazos               | `rait-deadline-engine.md`; `docs/framework/arch/fixtures/calendar-2026.json`; steering H.46/H.47; `parameter-catalogue.md` (`deadline.*`, `rait.timer.*`); `rait-error-catalog.md` §3.9                                                    |
| worklist/sessão/caso | [WF-RAIT-004] §3, §5–§8, §9, §10; [WF-RAIT-003]; [WF-RAIT-001]; UC-RAIT-027/028; steering H.54, H.57 (OD-101…112 vigentes)                                                                                                                 |
| organização          | UC-RAIT-022/025/036/038/042/043; [WF-RAIT-002] §7 (calendário) e §4 (alertas → incidente); [WF-RAIT-004] §7–§8; jeton pendente de fonte (H.54/H.57) → colunas existem, valores nulos com `source_pending`                                  |
| financeiro           | ADR-0017; UC-RAIT-032…035; steering H.53 (`collection.discount_40_outside_sne=false`); `infraction_payment_tier_ref`; `rait-error-catalog.md` §3.11                                                                                        |
| integração           | ADR-0003; ADR-0020 §2–§3; UC-RAIT-029/030/031; `04-integration-storage.sql` (`integration.outbox`); `rait-error-catalog.md` §3.11                                                                                                          |
| documentos           | ADR-0018 §Decision 1–3                                                                                                                                                                                                                     |
| fixtures             | `rait-fixtures.md`; `docs/framework/arch/fixtures/rait-fixtures.json`; `backend/database/seed/{00,10,20}-*.sql`                                                                                                                            |

## Riscos

- `14-inf-lifecycle-vocabulary.sql` é lock compartilhado com `ops-agency` (R-0005): esta rodada não o edita (M4).
- `BP-INF-AIT-001` recebe v1.1.0 em R-0005; esta frente **não** o edita (`ait_id` FK apenas referencia `inf.ait_ait(id)`).
- `backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts` fixa `toHaveLength(52)` tabelas de tenant no
  schema `inf`: cada DDL novo obriga o Inspector a atualizar a contagem (sensor, não defeito).
- Nenhum valor de prazo inventado: só os de [WF-INF-002] §9.2 (já em DDL 14) e do catálogo; o que faltar vira `source_pending`.
- Orçamento: planejamento (~280 k) + CTG-0001 (3 tarefas Opus + 2 revisões) tende a atingir 80 % da janela; CTG-0002 é da janela 2.

## Concorrência

- `origin/main` = d8fe83a (PR #36 mesclado, ≥ 80d705a). Branch `orchestra/rait-model` criado a partir dele em 2026-09-14
  (worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-model`); nunca publicado até o primeiro push desta janela.
- Upstreams em `main`: `dash-roles` (R-0003, PRs #32/#35) e método (#30, #31, #34, #36). **`param-store` (R-0004) não está
  em `main`** e o branch local `orchestra/param-store` está em d8fe83a (sem commits próprios); **`ops-agency`** (R-0005) idem
  (bafae6d, sem commits próprios). Não há PRs abertos de outras frentes.
- CTG-0001: **liberado para merge** (nenhum upstream; DDL 14 intocado).
- CTG-0002: desenvolvido sobre o mesmo branch depois do merge de CTG-0001. **`param-store` (R-0004) entrou em `main` em
  2026-09-14 (PR #37, fechamento #38)**: o PR de CTG-0002 fica liberado quando o grupo concluir. Sem base empilhada por ora (upstream sem commits); se `param-store` publicar antes do PR de CTG-0002,
  integrar com `git merge --no-edit origin/main` (branch já publicado).
- `pnpm exec devai round plan --scaffold --round R-0006` → `ROUND_ALREADY_EXISTS` (rodada instanciada pelo PR #31); nada a criar.

## Triagem

- 2026-09-14 (janela 2) mini-tríade concluída: TASK-0009 (Opus, ~160 k), TASK-0010 (Sonnet, ~195 k), TASK-0011 (Sonnet,
  ~182 k), todos os critérios PASS; motor com porta de eventos, `extend` e 22 casos verdes; espelho zod da infração
  sincronizado (88 testes). Gates do grupo: `apply`+`seed` OK, `rls-smoke` OK, `backend:test:ci` exit 0 (`pnpm check` em
  curso). delivery-review-CTG-0001-3: **FAIL**, 1 achado novo (`policy-issue`): `extend(id, _reason)` descarta o motivo
  que o contrato §5.2 diz "registrado para auditoria". Correção proposta (M15): `Deadline.extensionReason: string | null`
  persistido pela porta `TimerStore` em `extend`; teste do Inspector prova a retenção; sem mudança no envelope/esquema
  (`data.reason` segue `'prorrogacao'`). **Decisão do humano (2026-09-14): mini-iteração + delivery-review ciclo 4** — contrato §5.2.9 (maestro, Architect),
  TASK-0012 (Inspector, Sonnet, caso 23) → TASK-0013 (Engineer, Sonnet); sem prompt-review (exceção já autorizada).
  TASK-0012 e TASK-0013 entregues (23/23 verdes); triagem `sensor-error`: TS2352 no cast da linha 768 do teste do caso 23
  (`extended as Record<string, unknown>`) quebra o typecheck — 1 nova tentativa do Inspector com o achado (§7) — corrigida (leitura direta do campo), typecheck e 23/23 verdes.
  delivery-review-CTG-0001-4: **PASS** (sem achados). Gates pós-M15: `apply`+`seed` OK, `rls-smoke` OK, `backend:test:ci`
  exit 0, `pnpm check` exit 0. `origin/main` avançou (PR #37 `param-store`, PR #38 fechamento R-0004): rebase antes do
  push (branch não publicado) e gates de novo.
- 2026-09-14 rebase sobre `origin/main` (34062b5): conflito só em `package.json` (listas de scripts unidas). `backend:test:ci`
  **vermelho** após o rebase: `05-parameters.sql` (R-0004) insere em `ops.parameter` sem `app.tenant_id`, `enforce_tenant_id`
  levanta "Tenant context is required", `seed.sh` (`set -e`) aborta antes de `10/20/30` e as fixtures não carregam.
  Triagem: `plant-bug` upstream (a rodada R-0004 declarou "seed.sh já autodetecta o novo arquivo" sem testar sob `seed.sh`;
  o CI nunca executa `seed.sh`, por isso `main` está verde). Correção do maestro (Engineer): o gerador
  `tools/parameters/generate-seed.mjs` passa a emitir os dois `set_config` no topo do seed (regenerado, `parameters:test`
  17/17, `verify:parameter-catalogue` OK, 87 parâmetros carregados) e o job `backend-kernel` do CI ganha o passo
  `bash backend/database/seed.sh` após `backend:db:reset` (`rait-test-strategy.md` §7, entregável de WP-A). Mudança
  infra fora do diff revisado; registrada no PR sem novo ciclo de delivery-review (julgamento do maestro).
- 2026-09-14 (janela 2) prompt-review-3 (mini-tríade): **REVIEW**, 4 achados corrigidos pelo maestro: data do caso 20
  (2026-12-29 → **2026-12-30**, conta explícita), calendário na leitura de TASK-0009, total de casos de TASK-0010 (23 → 22),
  TASK-0009 Opus/alto. prompt-review-4: **REVIEW**, 1 achado — TASK-0009 passa a atualizar a linha de
  `inf.timer.rescheduled` em `rait-events-sse-contract.md` §2.4 (lock `MOD-arch-events-contract`) em vez de deixar nota
  para R-0007. prompt-review-6 (ciclo 4, autorizado pelo humano): **FAIL**, 2 achados: resíduo `suspensionActId?` na
  fronteira de TASK-0009 (corrigido) e — achado real — o espelho zod `events.ts` e `events.schema.spec.ts` de
  `@detran/inf-infraction` precisam acompanhar o esquema alterado: TASK-0010 ganha `MOD-inf-infraction-tests` (só os `it`
  de `inf.timer.rescheduled`), TASK-0011 ganha `MOD-inf-infraction-handwritten` (só o esquema zod). Correções aplicadas;
  **5º ciclo autorizado pelo humano (2026-09-14)** — `prompt-review-7`; segunda exceção ao máximo do §5, registrada.
  prompt-review-7 (ciclo 5, autorizado): **REVIEW**, 3 achados novos (build pack na leitura dos três prompts; `it` de
  rejeição sem `suspensionActId`; regra 2 de TASK-0011 contradizia a fronteira) — corrigidos. Sete ciclos de prompt-review
  na rodada; cada ciclo levanta itens novos sobre texto inalterado. **Decisão do humano (2026-09-14): disparar sem novo ciclo** — exceção ao §5 (prompts com PASS) registrada; a
  delivery-review (ciclo 3) continua obrigatória antes do PR. `prompt-review-8.md` fica preparado e não executado.
  prompt-review-5 (ciclo 3, último admitido pelo §5): **FAIL**, 3 achados novos sobre trechos não alterados nos
  ciclos anteriores: `aggregate.kind: 'timer'` × token canônico `clock` (§1 do contrato de eventos); `reason:
'suspension'|'extension'` sem fonte canônica (M12 não cobre payload de evento); `suspensionActId?` (opcional) × casos
  19/20 (obrigatório e nulo). **Parada por §5 do prompt do maestro** (FAIL/terceiro ciclo) — ver §Bloqueios.
- 2026-09-14 TASK-0001 concluída (Opus, ~318 k tokens, 84 ferramentas): 11/11 critérios PASS; maestro fez o
  wiring M7 (blueprints v1.0.1 com `@detran/inf-deadlines` e `zod ^4.6.5`, regeneração, `pnpm install`); gates
  verdes (140 tabelas de tenant). Commit do grupo aguarda a delivery-review (§8).
- 2026-09-14 TASK-0002 concluída (Opus, ~363 k tokens): 10/10 critérios PASS; sensor `inf-rls` 52 → 58; gates do
  maestro reproduzidos (apply/seed/integration verdes, 18 unit vermelhos por implementação ausente). Propostas do
  Inspector (7) registradas no relatório; a (4) — qualifiers por linha, ambiguidade 22 × 25 — fica resolvida
  pelos tokens usados nos testes (`prazo_aberto`/`prazo_vencido`/`provido`…), que vinculam TASK-0003; o contrato
  §6.1 é corrigido na janela 2 (Architect).
- 2026-09-14 TASK-0003 concluída (Opus, ~305 k tokens): 11/11 PASS; maestro: `pnpm install` (deps do app), bump dos
  blueprints a v1.1.0. Gates do grupo: `apply`+`seed`, `rls-smoke` OK (102 tabelas), `backend:test:ci` verde, `pnpm check`
  verde (`verify-pec-superset` PASS).
- 2026-09-14 delivery-review-CTG-0001 (GPT-5.6 Terra): **FAIL**, 2 achados `high`, ambos `policy-issue`: (1) módulos
  montados no `AppModule` expõem rotas geradas antes de R-0007 → `AppModule` e `backend/app/package.json` restaurados a
  `main` (montagem fica para R-0007 com os comandos; scripts de teste da raiz mantidos); (2) `infraction_event` (e
  `notice_acknowledgement`, `notice_delivery_attempt`) append-only com PATCH/DELETE gerados → `api.resources[].operations =
list,get,create` nos blueprints (v1.1.1), regenerados; `verify:decorators` 526 handlers. Correções pelo maestro
  (Architect no blueprint, Engineer no wiring) sem novo worker; ciclo 2 solicitado. Um segundo FAIL escala ao humano.
- 2026-09-14 delivery-review-CTG-0001-2 (GPT-5.6 Terra): **FAIL**, 3 achados `high` novos sobre código idêntico ao do
  ciclo 1 (o ciclo 1 não os levantou): (a) contrato §3.3 "42 linhas vigentes" × 43 no DDL → `reference-gap`, corrigido
  pelo maestro (Architect) no contrato; (b) `reschedule` não emite `TIMER_REPROGRAMADO` → `reference-gap` do contrato
  (API §5 sem porta de eventos; lacuna 1 apontada por TASK-0001, TASK-0002 e TASK-0003); (c) sem operação de
  prorrogação com `extension_count ≤ 1` → `reference-gap` (API §5 sem verbo; adiado a R-0007 por TASK-0003). (b) e (c)
  exigem emenda do contrato (Architect), testes novos (Inspector) e implementação (Engineer) — nova tríade que o
  orçamento da janela não cobre. **Segundo FAIL → `escalated`** (§8, README §6); gates verdes registrados abaixo.
- 2026-09-14 prompt-review-1 (GPT-5.6 Terra): **FAIL** com 4 achados `high` — todos defeitos de consistência do
  plano (`policy-issue`): fachada de documentos escrita por Architect (Art. 10) → movida para TASK-0007;
  projeção do outbox em TASK-0005 contradizia M10 → `BP-INF-RAIT-INTEGRATION-001` reduzido a
  `rait_reconciliation`; paralelismo de TASK-0008 → removido; números de PR em TASK-0008 → só estado
  verificável / "pendente". Nota: TASK-0005 → Opus/alto. Ciclo 2 solicitado (precedente R-0003:
  delivery-review-1 FAIL corrigido e re-revisado). Se o ciclo 2 não for PASS, a frente para e escala.

## Bloqueios

**BLOQUEIO 2 — resolvido (2026-09-14): o humano autorizou a opção (a)** — correções aplicadas em TASK-0009…0011 (M14) e um
4º ciclo de prompt-review (`prompt-review-6`) **autorizado expressamente** além do máximo do §5.

Registro do bloqueio:
Os três achados são mecânicos e o maestro propõe estas correções em TASK-0009: (1) envelope reduzido com
`aggregate.kind: 'clock'` (token da §1); (2) `reason` marcado `source_pending` com OD nova ("tokens de motivo de
reprogramação: suspensão × prorrogação") **ou** decisão do Architect/Owner fixando `suspensao` | `prorrogacao`
(vocabulário em português, CODESTYLE); (3) `suspensionActId` obrigatório e anulável no contrato, na tabela §2.4 e no
JSON Schema (sem `?`). Opções: (a) autorizar as três correções e o disparo da tríade com um 4º ciclo de prompt-review
(excede o máximo do §5 — exige sua autorização expressa); (b) autorizar as correções e o disparo **sem** novo
prompt-review, registrando a exceção; (c) encerrar CTG-0001 sem a mini-tríade e reemitir a delivery-review com a
premissa de que emissão de eventos e prorrogação são comandos de R-0007. Recomendação: (a).

**Decisão do humano (2026-09-14): opção (ii) — mini-tríade na janela 2** (TASK-0009 Architect → TASK-0010 Inspector →
TASK-0011 Engineer), depois delivery-review ciclo 3. Registro da escalada: delivery-review de CTG-0001 com FAIL em dois ciclos (achados distintos). Decisão
pedida ao Architect/Owner: (i) aceitar que a emissão de `TIMER_REPROGRAMADO` e a prorrogação única de `T-DIL` são
comandos de R-0007 (o motor devolve o `Deadline` reprogramado; a publicação no outbox e o verbo de prorrogação nascem
com as rotas) e reemitir a delivery-review com essa premissa registrada como M14; ou (ii) abrir uma mini-tríade na
janela 2 (emenda do contrato §5 com porta `EventSink` e verbo `extend`, testes do Inspector para o envelope e para a
segunda prorrogação negada, implementação do Engineer) antes do PR. Recomendação do maestro: (ii) — custo de uma
tríade pequena (~150 k) e fecha as duas lacunas que os três workers apontaram; até lá o grupo fica commitado como
checkpoint em branch não publicado. Demais lacunas (não bloqueantes) — lacunas achadas por TASK-0001 (contrato `CTG-0001.md` §9), carregadas como premissa e a
decidir fora desta rodada: (1) `TIMER_REPROGRAMADO` não existe em `inf.infraction_event_ref` → nesta rodada o
evento vive só na `integration.outbox`; a linha nova no DDL 14 é da rodada dona do lock (`ops-agency`) ou de
R-0007 (OD proposta). (2) Entrada em `INSTANCIA_ENCERRADA` com `paid=true` cai em `PENDENTE_PAGAMENTO` pela
tabela §2; a passagem a `QUITADA` pela linha 39 é composição de comando (R-0007), a guarda pura segue a tabela
(OD proposta). (3) Assimetria da admissão em 2ª instância (linha 32) registrada como intencional. (4) Fixture
0014 (`EXTINTO_PRESCRICAO`) usa `committed_on` em 2024 sobre `AM-2026-000014`: aceito como dado de teste (o
Inspector segue a especificação §7).

## Retomada

**Checkpoint 2026-09-14 (janela 2, ~190 k; parada por §5 — ver BLOQUEIO 2 em §Bloqueios).** Prompts TASK-0009…0011
escritos e revisados três vezes (REVIEW, REVIEW, FAIL); tarefas `blocked`; nenhum worker disparado; árvore = checkpoint
`2fe9337` + bookkeeping da janela 2. Ao retomar com a decisão: aplicar as correções de §Bloqueios em `prompts/TASK-0009.md`
(recalcular `compositions.json`), disparar TASK-0009 → 0010 → 0011, gates, delivery-review ciclo 3, commit definitivo.

**Checkpoint anterior (fim da janela 1, ~101 % do orçamento).** Branch `orchestra/rait-model` **não publicado**;
commits: `f27f6e5` (planejamento + esqueleto), `chore(infraction): checkpoint CTG-0001` (entrega completa de
TASK-0001…0003 com as correções do ciclo 1 da delivery-review; histórico pode ser reescrito antes do primeiro push).
Concluídas: TASK-0001, TASK-0002, TASK-0003 (esta `escalated` pela delivery-review). Pendentes: decisão do humano em
§Bloqueios; depois delivery-review ciclo 3 (ou mini-tríade + review), commit definitivo por CODESTYLE (`feat(infraction): …`,
squash do checkpoint), evidência `evidence-CTG-0001.json` + `devai evidence record`, push, PR (corpo pronto em
`work/rounds/R-0006/pr-ctg-0001.md`), CI, merge, `audit observe`. CTG-0002 (TASK-0004…0008) na janela 2; PR só com
`param-store` em `main`. Estado dos gates no checkpoint: `apply`+`seed`×2 OK, `rls-smoke` OK, `backend:test:ci` exit 0,
`pnpm check` exit 0 (árvore corrigida, 2026-09-14). Últimos vereditos: prompt-review-2 PASS; delivery-review-CTG-0001 FAIL; -2 FAIL.
Ao retomar: ler §Bloqueios, `reviews/delivery-review-CTG-0001-2.json`, `reports/TASK-000{1,2,3}.md`; não replanejar.

## Leitura

Hash de base: `d8fe83a96b0301d27015de5958507cdad4a06d75` (`origin/main`, 2026-09-14). Lido uma vez pelo maestro:

1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`
3. `docs/framework/arch/rait-build-pack.md` (inteiro); ADR-0014 §Consequências, ADR-0016, ADR-0017, ADR-0018, ADR-0020, ADR-0021;
   [WF-INF-003] §4–§6 e cabeçalhos; [WF-INF-002] cabeçalhos §9; [WF-RAIT-004] §10; `14-inf-lifecycle-vocabulary.sql` (inteiro);
   `rait-deadline-engine.md`; `rait-fixtures.md`; `rait-test-strategy.md`; `rait-error-catalog.md` §3.9–§3.12;
   `rait-events-sse-contract.md` §2.4; `open-decisions-rait.md` (ids); `docs/framework/blueprints/README.md` + schema +
   `BP-INF-RAIT-{CASE,SESSION,WORKLIST}-001` (entidades) + `BP-INF-AIT-001` (bloco `module`); `tools/blueprints/generate.mjs`
   (regras de campos, checks, FKs, RLS, `ddlFile`); `tools/check-lifecycle-vocabulary.ts`; `tools/check-rls-ddl.ts`;
   `backend/database/{apply,seed}.sh`; `seed/20-fixtures-rait.sql` (cabeçalho); `04-integration-storage.sql` (outbox);
   `backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts` (cabeçalho); `backend/app/src/app.module.ts` (imports)
4. `docs/framework/arch/parameter-catalogue.md`, `docs/meta/knowledge-base/decision-closure-plan.md`, `steering.md` §H
5. `docs/meta/agents/{architect-blueprint,engineer-backend,inspector-tests,transcriber-docs}.md`; `orchestra/{task.template.json,worker-prompt.template.md,reviewer-prompt.template.md}`; `tools/orchestra/bridge.sh`
6. `work/rounds/R-0006/plan.md` (versão planejada); `work/rounds/R-0003/{tasks/TASK-0001.json,prompts/TASK-0001.md,budget.json,closure.json}` (referência de formato)
