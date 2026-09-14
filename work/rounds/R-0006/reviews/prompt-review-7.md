# Prompt do reviewer — modo `prompt-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `rait-model` (rodada `R-0006`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-model`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md` — apenas a seção do WP `WP-A` e o "mapa entregável → definições"
4. `work/rounds/R-0006/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0006/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0006/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0006",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0006/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

### Ciclo 5 (prompt-review-7) — respostas ao prompt-review-6

| Achado                          | Correção                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `suspensionActId?` na fronteira | anotado como obrigatório e anulável (M14)                                                                                                                                                                                                                                                                                                                                      |
| espelho zod da infração         | TASK-0010 pode tocar só os `it` de `inf.timer.rescheduled` em `infraction/tests/unit/events.schema.spec.ts` (lock `MOD-inf-infraction-tests`); TASK-0011 pode tocar só o esquema zod desse evento em `infraction/src/handwritten/events.ts` (lock `MOD-inf-infraction-handwritten`); TASK-0009 registra a obrigação no contrato §5.2; critérios de sincronização acrescentados |

Escopo: os três prompts da mini-tríade TASK-0009…0011.

### Anexo 1 — `work/rounds/R-0006/plan.md`

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
- CTG-0002: desenvolvido sobre o mesmo branch depois do merge de CTG-0001; **PR só quando `orchestra/param-store` estiver
  em `main`** (§0). Sem base empilhada por ora (upstream sem commits); se `param-store` publicar antes do PR de CTG-0002,
  integrar com `git merge --no-edit origin/main` (branch já publicado).
- `pnpm exec devai round plan --scaffold --round R-0006` → `ROUND_ALREADY_EXISTS` (rodada instanciada pelo PR #31); nada a criar.

## Triagem

- 2026-09-14 (janela 2) prompt-review-3 (mini-tríade): **REVIEW**, 4 achados corrigidos pelo maestro: data do caso 20
  (2026-12-29 → **2026-12-30**, conta explícita), calendário na leitura de TASK-0009, total de casos de TASK-0010 (23 → 22),
  TASK-0009 Opus/alto. prompt-review-4: **REVIEW**, 1 achado — TASK-0009 passa a atualizar a linha de
  `inf.timer.rescheduled` em `rait-events-sse-contract.md` §2.4 (lock `MOD-arch-events-contract`) em vez de deixar nota
  para R-0007. prompt-review-6 (ciclo 4, autorizado pelo humano): **FAIL**, 2 achados: resíduo `suspensionActId?` na
  fronteira de TASK-0009 (corrigido) e — achado real — o espelho zod `events.ts` e `events.schema.spec.ts` de
  `@detran/inf-infraction` precisam acompanhar o esquema alterado: TASK-0010 ganha `MOD-inf-infraction-tests` (só os `it`
  de `inf.timer.rescheduled`), TASK-0011 ganha `MOD-inf-infraction-handwritten` (só o esquema zod). Correções aplicadas;
  **5º ciclo depende de nova autorização do humano** (a autorização (a) cobria um ciclo).
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

### Anexo — `work/rounds/R-0006/prompts/TASK-0009.md`

# Prompt de worker — `TASK-0009` (`architect-blueprint`)

> Você é um worker da orquestra `rait-model`, rodada `R-0006`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-model`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git`, nunca instala
> pacotes, nunca edita arquivos gerados, nunca escreve testes nem código de produção. Se algo
> impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/architect-blueprint.md` — leia-o primeiro.

## Contexto da frente (o que você precisa saber, já resumido)

CTG-0001 (infração) está entregue e verde, mas a delivery-review da outra família (ciclo 2) apontou
duas lacunas do contrato `work/rounds/R-0006/contracts/CTG-0001.md` §5 (API de `@detran/inf-deadlines`):
(b) `reschedule` não emite `TIMER_REPROGRAMADO` porque a API não tem porta de eventos, embora o caso 10
de `rait-deadline-engine.md` §7 exija o evento; (c) não existe verbo de **prorrogação** de `T-DIL`
(uma vez, mesmo prazo — Res. 900/2022 art. 9º; `RN-RAIT-004`), então `extension_count` nunca é
movido nem limitado. O humano decidiu (2026-09-14) abrir esta mini-tríade: você **emenda o contrato**
(§5 e §5.1) e o esquema do evento; o Inspector (TASK-0010) escreve os testes; o Engineer (TASK-0011)
implementa. Não reabra nada mais do contrato; não mude assinaturas existentes (só acréscimos).

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/architect-blueprint.md`
- `work/rounds/R-0006/plan.md` (§Bloqueios — decisão (ii); §Triagem, última entrada)
- `work/rounds/R-0006/reviews/delivery-review-CTG-0001-2.json` (achados 2 e 3)
- `work/rounds/R-0006/contracts/CTG-0001.md` §5 (linhas 473–731) e §9
- `backend/domains/inf/deadlines/src/types.ts`, `backend/domains/inf/deadlines/src/engine.ts` (só para conhecer a forma atual: `DeadlineEngineDeps`, `reschedule`, `sweep`, `SweepReport`, `Deadline.extensionCount`)
- `backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts` (casos 10 e 12: como o Inspector já instancia o motor)
- `docs/framework/arch/rait-deadline-engine.md` §2 (linhas "Suspensão" e "Prorrogação"), §3, §6
- `docs/framework/arch/rait-events-sse-contract.md` §1 e §2.4
- `docs/framework/schemas/events/inf.timer.rescheduled.schema.json`, `docs/framework/schemas/events/inf.timer.expired.schema.json`
- `docs/framework/arch/rait-error-catalog.md` §3.5 (`RAIT.INQUIRY_EXTENSION_LIMIT`) e §3.9
- `docs/framework/arch/fixtures/calendar-2026.json` (base da contagem do caso 20)

## Pode tocar

- `work/rounds/R-0006/contracts/CTG-0001.md` — **somente** acrescentar a seção `### 5.2 Emenda (janela 2): porta de eventos e prorrogação` ao fim do §5 (antes do §6) e uma nota em §9 dizendo que as lacunas (b)/(c) foram fechadas por esta emenda
- `docs/framework/schemas/events/inf.timer.rescheduled.schema.json` (se a emenda exigir campo novo em `data`)
- `docs/framework/arch/rait-events-sse-contract.md` — **somente** a linha de `inf.timer.rescheduled` na tabela §2.4 (coluna `data`: acrescentar `reason` e anotar `suspensionActId (obrigatório, anulável)`) e o campo `updated` do front-matter

## Não pode tocar

Qualquer outro arquivo: código, testes, blueprints, DDL, seeds, outros esquemas, o resto de `docs/framework/arch/**`, `docs/meta/adr/**`.

## Tarefa (o quê, não o como)

Escreva a seção 5.2 do contrato com, exatamente:

1. **Porta de eventos** `DeadlineEvents` em `DeadlineEngineDeps` (obrigatória; teste usa `InMemoryDeadlineEvents`
   exportada pela biblioteca): assinatura `publish(event: DeadlineEvent): Promise<void>` onde `DeadlineEvent` é o
   envelope de `rait-events-sse-contract.md` §1 **reduzido ao que a biblioteca conhece** (`type`, `domainEvent`,
   `occurredAt`, `tenantId`, `aggregate { kind: 'clock', id }` (token canônico de `rait-events-sse-contract.md` §1 — nunca `timer`) — ``, `data`) — o id ULID, `actor`, `correlationId` e
   `version` são preenchidos por quem grava no outbox (R-0007). Eventos emitidos pela biblioteca: `inf.timer.rescheduled`
   (`TIMER_REPROGRAMADO`) em `reschedule` **e** em `extend`; `inf.timer.expired` (`TIMER_VENCIDO`) em `sweep`, um por
   timer vencido, idempotente (a segunda varredura não emite de novo — caso 12).
2. **Verbo `extend(id: string, reason: string): Promise<Deadline>`** em `DeadlineEngine`: só para timers cuja
   definição do catálogo permita prorrogação (nesta rodada: `T-DIL`, `duration 15 dias_uteis`, uma vez, mesmo prazo);
   efeito: `extensionCount` 0 → 1, novo `due_on` = `due_on` atual + a mesma duração na mesma unidade (dias úteis,
   calendário, regra de dia não útil), `raw_due_on` idem; emite `TIMER_REPROGRAMADO` com `oldDueOn`/`newDueOn`,
   `suspensionActId: null` e `reason: 'prorrogacao'`; segunda prorrogação → `DeadlineError` `RAIT.INQUIRY_EXTENSION_LIMIT`
   (422, `context { ownerId, timerCode, extensionCount }` — o catálogo cita `inquiryId`, que a biblioteca não conhece;
   registre a diferença); timer de outro código → `RAIT.INTERNAL`? **Não**: use `RAIT.DEADLINE_LEGAL_READONLY` (422,
   `context { timerCode }`, §3.9: "tentativa de editar prazo legal") para timers legais e documente. Timer não
   `armado` → `RAIT.INTERNAL` (defeito de chamada, catálogo §1 regra 7), como o resto da biblioteca já faz.
3. **Efeito no esquema** `inf.timer.rescheduled`: `data` mantém `suspensionActId` **obrigatório e anulável** (`type: ['string','null']`, sem `?`) e ganha `reason` obrigatório
   (`'suspensao' | 'prorrogacao'` — tokens fixados pelo Owner em 2026-09-14, decisão M14 em `plan.md`; vocabulário em português, CODESTYLE); atualize o JSON Schema (draft 2020-12, `additionalProperties:false`) **e** a linha
   de `inf.timer.rescheduled` na tabela §2.4 de `rait-events-sse-contract.md` (`data`: `ownerId, timerCode, oldDueOn,
newDueOn, suspensionActId (obrigatório, nulo na prorrogação), reason`), para que contrato canônico e esquema não divirjam; registre no contrato §5.2
   que a fonte do `data` é a §2.4 atualizada.
4. **Casos obrigatórios novos** para o Inspector (numerados 19–22, mesmo formato de §5.1): 19 `reschedule` (caso 10)
   emite um `inf.timer.rescheduled` com `oldDueOn`, `newDueOn`, `suspensionActId`, `reason='suspensao'`;
   20 `extend` sobre `T-DIL` armado em 2026-11-13 (due 2026-12-07) → `due_on` **2026-12-30**: 15 dias úteis contados a partir de 2026-12-07 excluindo o marco,
   pulando 08/12 (feriado municipal de Manaus) e 25/12 (nacional) e contando 24/12 (ponto facultativo = dia útil
   para o cidadão): 09, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23, 24, 28, 29, 30 — confirme a conta com
   `calendar-2026.json` e registre-a no contrato, `extensionCount=1`, um `inf.timer.rescheduled` com `reason='prorrogacao'`;
   21 segunda `extend` → `RAIT.INQUIRY_EXTENSION_LIMIT` 422 e nenhum evento; 22 `extend` sobre `T-DEC` →
   `RAIT.DEADLINE_LEGAL_READONLY` 422; e a emenda do caso 12: `sweep` duas vezes → exatamente um `inf.timer.expired`
   na porta.
5. **Espelho da infração**: registre no contrato §5.2 que `backend/domains/inf/infraction/src/handwritten/events.ts`
   (espelho zod de `inf.timer.rescheduled`) e `backend/domains/inf/infraction/tests/unit/events.schema.spec.ts` devem
   acompanhar o esquema alterado (`reason` obrigatório com os dois tokens; `suspensionActId` string ou nulo), como
   tarefas do Inspector (TASK-0010) e do Engineer (TASK-0011).
6. Formate com Prettier; verifique que o JSON Schema continua válido (leia-o de volta com `node -e`).

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- `rait-deadline-engine.md` §2: "Suspensão: nunca automática; só por `rait_suspension_act` … **reprograma** `due_on`
  … grava `suspended_by_act_id`"; "Prorrogação (`T-DIL`): uma vez, mesmo prazo, `extension_count ≤ 1`" (Res. 900/2022
  art. 9º; `RN-RAIT-004`). §3: `reprogramar(id, ato) → … guarda histórico (evento TIMER_REPROGRAMADO)`.
- `rait-events-sse-contract.md` §2.4: `inf.timer.rescheduled` → `TIMER_REPROGRAMADO` `{ ownerId, timerCode, oldDueOn,
newDueOn, suspensionActId }`; `inf.timer.expired` → `TIMER_VENCIDO` `{ ownerKind, ownerId, timerCode, dueOn, effect }`.
- `rait-error-catalog.md` §3.5: `RAIT.INQUIRY_EXTENSION_LIMIT` 422 "segunda prorrogação" (RN-RAIT-004; Res. 900 art. 9º);
  §3.9: `RAIT.DEADLINE_LEGAL_READONLY` 422 "tentativa de editar prazo legal ou marco de ciência" (`timerCode`).
- Calendário: `docs/framework/arch/fixtures/calendar-2026.json`; dias úteis = seg–sex fora de feriados nacionais + AM +
  Manaus; pontos facultativos contam como dia útil para o cidadão (`deadline.optional_day_policy`).

## Critérios de aceitação (todos precisam passar)

- `node_modules/.bin/prettier --check work/rounds/R-0006/contracts docs/framework/schemas/events` → "All matched files use Prettier code style!"
- `node -e "JSON.parse(require('fs').readFileSync('docs/framework/schemas/events/inf.timer.rescheduled.schema.json','utf8'))"` → sem erro
- `grep -c '### 5.2' work/rounds/R-0006/contracts/CTG-0001.md` → `1`
- A seção 5.2 contém: assinatura de `DeadlineEvents`, `InMemoryDeadlineEvents`, `extend`, os dois códigos de erro, os casos 19–22 com datas calculadas e a emenda do caso 12
- `pnpm --filter @detran/inf-deadlines test` → continua 18 passed (você não tocou em código nem testes)

## Regras que não admitem exceção

1. Nenhum valor inventado; lacuna vira `OD-*` no relatório.
2. Você não escreve código nem testes; só o contrato e o esquema.
3. Tokens de estado, timer e erro vêm dos catálogos citados.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Prettier antes de entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0009
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
```

### Anexo — `work/rounds/R-0006/prompts/TASK-0010.md`

# Prompt de worker — `TASK-0010` (`inspector-tests`)

> Você é um worker da orquestra `rait-model`, rodada `R-0006`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-model`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git`, nunca instala
> pacotes, nunca edita arquivos gerados ou código de produção, nunca enfraquece testes existentes.
> Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/inspector-tests.md` — leia-o primeiro.

## Contexto da frente (o que você precisa saber, já resumido)

Mini-tríade da janela 2 de CTG-0001: o Architect (TASK-0009) emendou o contrato
`work/rounds/R-0006/contracts/CTG-0001.md` com a seção 5.2 (porta de eventos `DeadlineEvents` +
`InMemoryDeadlineEvents`, verbo `extend`, casos 19–22 e emenda do caso 12). Você codifica esses casos
como testes novos no arquivo existente de `@detran/inf-deadlines` e ajusta a instanciação do motor
para passar a porta de eventos. Os testes novos **devem falhar** nesta entrega (o Engineer implementa
em TASK-0011); os 18 existentes continuam como estão (você pode acrescentar a nova dependência
obrigatória `events` na fábrica de teste, sem mudar asserções).

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0006/contracts/CTG-0001.md` §5 e **§5.2** (inteira)
- `work/rounds/R-0006/reports/TASK-0009.md`
- `backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts` (inteiro — é o arquivo que você estende)
- `backend/domains/inf/deadlines/src/index.ts` (exports atuais; os novos nomes vêm do contrato §5.2)
- `docs/framework/schemas/events/inf.timer.rescheduled.schema.json`, `docs/framework/schemas/events/inf.timer.expired.schema.json`
- `docs/framework/arch/fixtures/calendar-2026.json`
- `docs/framework/arch/rait-test-strategy.md` §8

## Pode tocar

- `backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts` (acrescentar `it` para os casos 19–22 e a
  asserção da porta no caso 12; ajustar a fábrica do motor para passar `events: new InMemoryDeadlineEvents()`)
- `backend/domains/inf/deadlines/tests/unit/deadline-events.spec.ts` (novo, se preferir separar os casos 19–22)
- `backend/domains/inf/infraction/tests/unit/events.schema.spec.ts` — **somente** os `it` de `inf.timer.rescheduled`: exemplo válido com `reason` e `suspensionActId` nulo/preenchido; rejeição sem `reason` e com `reason` fora de `suspensao`/`prorrogacao`; sincronização com o JSON Schema alterado

## Não pode tocar

`src/**`; qualquer outro teste (inclusive os demais `it` de `events.schema.spec.ts`); contratos; esquemas; `package.json`; `vitest.config.ts`.

## Tarefa (o quê, não o como)

1. Caso 19: `reschedule` (mesmo cenário do caso 10) publica exatamente um evento `type='inf.timer.rescheduled'`,
   `domainEvent='TIMER_REPROGRAMADO'`, `data` com `ownerId`, `timerCode='T-DIL'`, `oldDueOn`, `newDueOn` (as datas do caso
   10), `suspensionActId` do ato, `reason='suspensao'`; o `data` valida contra o JSON Schema (obrigatórios, `enum`,
   `additionalProperties:false`, comparação lendo o JSON como já faz `events.schema.spec.ts` da infração).
2. Caso 20: `extend` sobre `T-DIL` armado em 2026-11-13 → `dueOn` e `rawDueOn` iguais à data calculada pelo contrato
   §5.2, `extensionCount=1`, um `inf.timer.rescheduled` com `reason='prorrogacao'` e `suspensionActId=null`.
3. Caso 21: segunda `extend` → `DeadlineError` `code='RAIT.INQUIRY_EXTENSION_LIMIT'`, `status=422`, `context` com
   `ownerId`, `timerCode`, `extensionCount=1`; nenhum evento adicional; `extensionCount` continua 1.
4. Caso 22: `extend` sobre `T-DEC` armado → `RAIT.DEADLINE_LEGAL_READONLY` 422, `context.timerCode='T-DEC'`, nenhum evento.
5. Caso 12 (emenda): após duas varreduras, a porta tem exatamente um `inf.timer.expired` para o timer, com `data`
   `{ ownerKind, ownerId, timerCode, dueOn, effect }` válido contra o esquema.
6. `events.schema.spec.ts` (infração): atualizar os casos de `inf.timer.rescheduled` conforme o esquema alterado pelo
   Architect; esses `it` ficam vermelhos até TASK-0011 atualizar o espelho zod.
7. Nomes "dado … quando … então …"; relógio fixo; asserção no `code`; sem `console.log`; nunca `it.skip`.

## Critérios de aceitação (todos precisam passar)

- `node_modules/.bin/prettier --check backend/domains/inf/deadlines/tests` → "All matched files use Prettier code style!"
- `pnpm --filter @detran/inf-deadlines test` → os 18 casos originais continuam passando **ou** falham apenas por
  `InMemoryDeadlineEvents`/`extend` ausentes (relate qual); os casos 19–22 e a emenda do 12 **falham** por implementação
  ausente (relate a contagem: esperado **22** casos no total — 18 existentes + 19, 20, 21, 22; a emenda do caso 12 é asserção nova dentro do `it` existente do caso 12, não um caso novo)
- `pnpm --filter @detran/inf-infraction test:unit` → só os `it` de `inf.timer.rescheduled` em `events.schema.spec.ts` falham (espelho zod desatualizado); os demais 80+ passam
- Tabela "caso → teste → resultado" no relatório (19, 20, 21, 22, 12-emenda, espelho da infração)

## Regras que não admitem exceção

1. Nenhum valor inventado; datas vêm do contrato §5.2 (se a conta do Architect divergir do calendário, relate — não corrija a data sozinho).
2. Você não escreve código de produção.
3. Nunca reduzir cobertura, timeout ou asserções dos 18 casos existentes.
4. Prettier antes de entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0010
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Matriz caso → teste → resultado: <linhas>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
```

### Anexo — `work/rounds/R-0006/prompts/TASK-0011.md`

# Prompt de worker — `TASK-0011` (`engineer-backend`)

> Você é um worker da orquestra `rait-model`, rodada `R-0006`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-model`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git`, nunca instala
> pacotes, nunca edita arquivos gerados, nunca altera testes. Se algo impedir a tarefa, pare e
> escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/engineer-backend.md` — leia-o primeiro.

## Contexto da frente (o que você precisa saber, já resumido)

Mini-tríade da janela 2 de CTG-0001. A biblioteca `@detran/inf-deadlines` (`backend/domains/inf/deadlines/src`)
já implementa 18 casos. O contrato ganhou a seção 5.2 (porta de eventos `DeadlineEvents` + `InMemoryDeadlineEvents`,
verbo `extend`, emissão de `TIMER_REPROGRAMADO`/`TIMER_VENCIDO`) e o Inspector (TASK-0010) escreveu os testes dos
casos 19–22 e a emenda do caso 12, que estão vermelhos. Você implementa até tudo passar, sem mudar assinaturas
existentes (só acréscimos) e sem tocar em testes.

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/engineer-backend.md`
- `work/rounds/R-0006/contracts/CTG-0001.md` §5 e **§5.2**
- `work/rounds/R-0006/reports/TASK-0009.md`, `work/rounds/R-0006/reports/TASK-0010.md`
- `backend/domains/inf/deadlines/tests/unit/*.spec.ts` (os testes são a especificação)
- `backend/domains/inf/deadlines/src/**` (inteiro)
- `docs/framework/schemas/events/inf.timer.rescheduled.schema.json`, `docs/framework/schemas/events/inf.timer.expired.schema.json`
- `docs/framework/arch/rait-deadline-engine.md` §2 (linhas "Suspensão", "Prorrogação"), §3, §5 (idempotência)
- `docs/framework/arch/rait-error-catalog.md` §3.5 (`RAIT.INQUIRY_EXTENSION_LIMIT`), §3.9 (`RAIT.DEADLINE_LEGAL_READONLY`)

## Pode tocar

- `backend/domains/inf/deadlines/src/**` (inclusive `index.ts` para exportar `DeadlineEvents`, `DeadlineEvent`, `InMemoryDeadlineEvents`)
- `backend/domains/inf/infraction/src/handwritten/events.ts` — **somente** o esquema zod de `inf.timer.rescheduled` (`reason` obrigatório em `suspensao`/`prorrogacao`; `suspensionActId` string ou nulo), espelhando o JSON Schema alterado

## Não pode tocar

Testes; contratos; esquemas; o resto de `@detran/inf-infraction` e qualquer outro pacote; `package.json`; `pnpm-lock.yaml`; arquivos gerados.

## Tarefa (o quê, não o como)

1. `DeadlineEvents` (porta) e `InMemoryDeadlineEvents` (lista em memória com `published`), `events` obrigatório em
   `DeadlineEngineDeps`; envelope `DeadlineEvent` conforme §5.2.
2. `reschedule` emite `inf.timer.rescheduled` (`reason='suspensao'`); `sweep` emite `inf.timer.expired` por timer
   vencido **uma única vez** (idempotência: só quando a varredura efetivamente vence o timer).
3. `extend(id, reason)`: regra do §5.2 (só timers prorrogáveis do catálogo — marque a definição de `T-DIL` com o campo
   que o contrato fixar; `extensionCount` 0 → 1; nova data pela mesma duração/unidade com calendário e dia útil;
   `RAIT.INQUIRY_EXTENSION_LIMIT` na segunda; `RAIT.DEADLINE_LEGAL_READONLY` em timer não prorrogável; `RAIT.INTERNAL`
   em timer não armado); emite `inf.timer.rescheduled` com `reason='prorrogacao'`, `suspensionActId: null`.
4. Espelho zod de `inf.timer.rescheduled` em `@detran/inf-infraction` sincronizado com o JSON Schema (teste do Inspector verde).
5. Sem `Date.now()`; sem dependência nova; Prettier; typecheck.

## Critérios de aceitação (todos precisam passar)

- `pnpm --filter @detran/inf-deadlines test` → "Tests 22 passed" (ou o total que o Inspector relatou), 0 failed
- `pnpm --filter @detran/inf-deadlines typecheck` → sem erros
- `pnpm --filter @detran/inf-infraction typecheck && pnpm --filter @detran/inf-notification typecheck` → sem erros (consumidores da biblioteca; se a porta obrigatória quebrar `acknowledgementMark` ou outro consumidor, ajuste **só** em `deadlines/src` — relate se impossível)
- `pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit` → 84 e 7 passed
- `pnpm format:check` → "All matched files use Prettier code style!"

## Regras que não admitem exceção

1. Nenhum valor inventado; códigos de erro só os do catálogo citados.
2. Código gerado não se edita; nada fora de `deadlines/src`.
3. Nunca `it.skip`, nunca ajuste de teste; teste em contradição com o contrato vira relatório.
4. Prettier antes de entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0011
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
```

### Nota do maestro

Responda apenas com o JSON do §Saída.
