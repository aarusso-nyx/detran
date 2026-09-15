# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

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

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
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

### Grupo acoplado CTG-0002 (TASK-0004 → 0005 Architect, TASK-0006 Inspector, TASK-0007 Engineer, TASK-0008 Owner delegado)

**Primeiro ciclo desta entrega — exaustivo, por favor** (regra do §Veredito: liste todos os achados de uma vez; em ciclos posteriores só as correções são avaliadas).

Entrega: deltas v1.1.0 de `BP-INF-RAIT-{WORKLIST,SESSION,CASE}-001` (DDL 34–36 regenerados), `BP-INF-RAIT-ORG-001` (DDL 39), `BP-INF-COLLECTION-001` (DDL 57), `BP-INF-RAIT-INTEGRATION-001` (DDL 58, só `rait_reconciliation`), módulos e contratos gerados (178 tabelas de tenant), fachada de documentos em `@detran/shared` (tipos, ADR-0018), `BankPort` + mock (ADR-0017 §4), módulos montados no `AppModule`, fixtures 20/40/50/60 + espelho JSON (prefixos M16), 114 testes de integração, sensor inf-rls 81, docs (build pack, README, fixtures, motor, backlog) e ajustes do método da orquestra (janela 3). Contratos: `contracts/CTG-0002-deltas.md`, `CTG-0002-modules.md`. Decisões M1–M16 em `plan.md`. Base: `origin/main` (inclui PR #37 param-store, #39 CTG-0001, #40 ops-agency).

Gates do maestro (em execução paralela; por tarefa nos relatórios): apply+seed×2, rls-smoke (125 tabelas), decorators 819, backend:test:ci com `STYNX_APP_DATABASE_URL` de `role_app_backend` (e2e 12/12), pnpm check.

### Critérios de aceitação (plan.md)

(comandos → resultado)

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

### `git diff --stat origin/main...HEAD` (últimas 40 linhas)

```
 .../shared/src/documents/documents-facade.ts       |    60 +
 .../domains/shared/src/documents/documents.spec.ts |   136 +
 backend/domains/shared/src/documents/index.ts      |     6 +
 .../shared/src/documents/signature-policy.ts       |    36 +
 backend/domains/shared/src/index.ts                |     1 +
 docs/framework/arch/fixtures/rait-fixtures.json    |   569 +
 docs/framework/arch/rait-build-pack.md             |    33 +-
 docs/framework/arch/rait-deadline-engine.md        |     8 +-
 docs/framework/arch/rait-fixtures.md               |    22 +-
 .../blueprints/BP-INF-COLLECTION-001.json          |   398 +
 .../framework/blueprints/BP-INF-RAIT-CASE-001.json |   330 +-
 .../blueprints/BP-INF-RAIT-INTEGRATION-001.json    |   102 +
 docs/framework/blueprints/BP-INF-RAIT-ORG-001.json |   577 +
 .../blueprints/BP-INF-RAIT-SESSION-001.json        |    51 +-
 .../blueprints/BP-INF-RAIT-WORKLIST-001.json       |   831 +-
 docs/framework/blueprints/README.md                |     9 +
 .../contracts/BP-INF-COLLECTION-001.openapi.json   |  1140 ++
 .../contracts/BP-INF-RAIT-CASE-001.openapi.json    |  1247 +-
 .../BP-INF-RAIT-INTEGRATION-001.openapi.json       |   264 +
 .../contracts/BP-INF-RAIT-ORG-001.openapi.json     |  2096 +++
 .../contracts/BP-INF-RAIT-SESSION-001.openapi.json |    60 +-
 .../BP-INF-RAIT-WORKLIST-001.openapi.json          |  2083 ++-
 docs/meta/agents/orchestra/README.md               |    14 +-
 docs/meta/agents/orchestra/model-ladder.md         |    17 +-
 .../agents/orchestra/reviewer-prompt.template.md   |     6 +
 docs/meta/knowledge-base/backlog.md                |     8 +-
 package.json                                       |     6 +-
 pnpm-lock.yaml                                     |   110 +-
 tools/blueprints/generated-files.json              |   136 +
 work/rounds/R-0006/budget.json                     |    72 +-
 work/rounds/R-0006/contracts/CTG-0002-deltas.md    |  1055 ++
 work/rounds/R-0006/contracts/CTG-0002-modules.md   |  1589 +++
 work/rounds/R-0006/plan.md                         |    78 +-
 work/rounds/R-0006/pr-ctg-0002.md                  |    37 +
 work/rounds/R-0006/tasks/TASK-0004.json            |     4 +-
 work/rounds/R-0006/tasks/TASK-0005.json            |     4 +-
 work/rounds/R-0006/tasks/TASK-0006.json            |     4 +-
 work/rounds/R-0006/tasks/TASK-0007.json            |     4 +-
 work/rounds/R-0006/tasks/TASK-0008.json            |     4 +-
 313 files changed, 35010 insertions(+), 689 deletions(-)
```

### Arquivos gerados (fora do diff inline; regeneráveis; verificados por `blueprints:check`/`contracts:check`)

258 arquivos — módulos `backend/domains/inf/{rait-case,rait-worklist,rait-session,rait-org,collection,rait-integration}/src/**`, DDL 34/35/36/39/57/58, `docs/framework/contracts/*`, manifesto, lockfile.

### Arquivos grandes fora do diff inline (leia na worktree)

- `.devai/state/audit-observations/1fefb32f2ca4cadaca8c6d3ff9885885b5eb245c/assessment.json`
- `.devai/state/audit-observations/1fefb32f2ca4cadaca8c6d3ff9885885b5eb245c/backlog.json`
- `.devai/state/audit-observations/1fefb32f2ca4cadaca8c6d3ff9885885b5eb245c/inventory.json`
- `.devai/state/audit-observations/1fefb32f2ca4cadaca8c6d3ff9885885b5eb245c/scorecard.json`
- `.devai/state/audit-observations/1fefb32f2ca4cadaca8c6d3ff9885885b5eb245c/status.json`
- `backend/database/seed/20-fixtures-rait.sql`
- `backend/database/seed/40-fixtures-rait-org.sql`
- `backend/database/seed/50-fixtures-collection.sql`
- `backend/database/seed/60-fixtures-rait-integration.sql`
- `docs/framework/arch/fixtures/rait-fixtures.json`
- `work/rounds/R-0006/budget.json`
- `work/rounds/R-0006/contracts/CTG-0002-deltas.md`
- `work/rounds/R-0006/contracts/CTG-0002-modules.md`
- `work/rounds/R-0006/plan.md`
- `work/rounds/R-0006/pr-ctg-0002.md`
- `work/rounds/R-0006/tasks/TASK-0004.json`
- `work/rounds/R-0006/tasks/TASK-0005.json`
- `work/rounds/R-0006/tasks/TASK-0006.json`
- `work/rounds/R-0006/tasks/TASK-0007.json`
- `work/rounds/R-0006/tasks/TASK-0008.json`

### Relatórios

#### `work/rounds/R-0006/reports/TASK-0004.md`

Papel: Architect (Art. 6)
Tarefa: TASK-0004
Arquivos criados/alterados: `BP-INF-RAIT-WORKLIST-001.json` v1.1.0 (RaitUnit, RaitSchedule, RaitScheduleSlot, RaitBatch, RaitBatchItem, RaitSubstituteDuty, RaitBench; colunas novas em rait_pool, rait_pool_member, rait_assignment, rait_impediment; índice único de pool em dois parciais); `BP-INF-RAIT-SESSION-001.json` v1.1.0 (modality, short_notice_ack, view_requested_by/view_due_on, published_at, 5 checks); `BP-INF-RAIT-CASE-001.json` v1.1.0 (legal_priority, unit_id, version; RaitPendingContent, RaitRedirect, RaitDraft); `contracts/CTG-0002-deltas.md` (1031 linhas, §a–§g); gerados: DDL 34/35/36, módulos rait-*, OpenAPI (10 recursos novos).
Comandos executados e saída resumida: prettier OK; `blueprints:generate`/`contracts:openapi` (30) OK; `blueprints:check` passed; `contracts:check` in sync; `verify:rls-ddl` OK (151 = 141 + 10); `verify:lifecycle-vocabulary` OK; `apply.sh --full` + `seed.sh` em detran_r6b OK com as fixtures atuais; `pnpm typecheck` exit 0; `verify:decorators` 579; `verify:parameter-catalogue` OK; `pnpm check` exit 0.
Critérios de aceitação: 8/8 PASS.
Fora do escopo / deixado: fixtures novas e ajustes de `20-fixtures-rait.sql` só especificados (§e; Inspector); sensor `inf-rls` passa a 68 tabelas (Inspector); correções de docs (TASK-0008); "plantão de secretaria de sessão" sem entidade (proposta a TASK-0005); `handwrittenExports` ausentes (R-0007).
OD tocadas ou propostas: vigentes OD-004/005/008/013/016/019/101/102/103/104/106/112/204 (§f). Propostas (§g): (1) vocabulário de turno da escala (grão de dia adotado); (2) prazo da pendência de conteúdo sem chave no catálogo (`rait.timer.T-PEND`?); (3) `rait_pool.priority_policy` só `ordem_unica`; (4) status da minuta (M12) a confirmar contra catálogo §3.5/UC-RAIT-003; (5) `jurisdiction` sem fixture (H.48).
Bloqueios: nenhum. Divergências resolvidas: (1) UCs invertidas no prompt (027 ↔ 028) — descriptions citam a UC certa; (2) prefixos de fixture do prompt colidem com entidades existentes — maestro decidiu usar faixas livres (remapeadas na §e.3); (3) `rait_bench` no worklist sem FK para `rait_session` (DDL 35 < 36) — aceito (regra M5).

#### `work/rounds/R-0006/reports/TASK-0005.md`

Papel: Architect (Constituição Art. 6)
Tarefa: TASK-0005
Arquivos criados/alterados: `BP-INF-RAIT-ORG-001.json` (v1.0.0, 8 entidades), `BP-INF-COLLECTION-001.json` (v1.0.0, 4), `BP-INF-RAIT-INTEGRATION-001.json` (v1.0.0, só `rait_reconciliation`); `contracts/CTG-0002-modules.md` (§a–§f); gerados: DDL 39/57/58, módulos `@detran/inf-rait-org` (46 arquivos), `@detran/inf-collection` (26), `@detran/inf-rait-integration` (11), OpenAPI (38 contratos).
Comandos executados e saída resumida: prettier OK; generate exit 0 (13 tabelas novas); contracts 38; `blueprints:check` passed; `contracts:check` in sync; `verify:rls-ddl` OK (178); `verify:lifecycle-vocabulary` OK; `verify:decorators` 819; `docs:kb:check` 521/446; `apply.sh --full` + `seed.sh` em detran_r6b OK; `\d inf.collection_document` com FKs infraction/tier/state + RLS + trigger; `rait_reconciliation` sem FK; `pnpm check` falha só no typecheck dos 3 pacotes novos (M7, `pnpm install` do maestro).
Critérios de aceitação: 6/7 PASS; `pnpm check` FAIL previsto (M7).
Fora do escopo / deixado: projeção do outbox (M10/WP-P); `signature_policy` (R-0008); `shared/**` intocado (fachada especificada em §f para TASK-0007); fixtures (TASK-0006) — prefixos M16 verificados: `0000390` holiday, `0000400` suspension_act, `0000410` jeton sheet/line, `0000420` incident, `0000430` quality_sample, `0000440` capacity_plan, `0000450` export, `0000460` collection_document, `0000470` payment, `0000480` refund_order, `0000490` debt_handoff, `0000500` reconciliation; sensor `inf-rls` → 81 tabelas (Inspector).
OD tocadas ou propostas: vigentes OD-003, 007, 008, 012, 015, 017, 018, 019, 207; 14 propostas em §e.3 (plantão de secretaria não vira entidade; níveis PAdES/gov.br; layout do documento de arrecadação; valor da multa; prazo de cobrança; porta da Fazenda; FK `rait_clock_alert.incident_ref`; desfecho de incidente; alvo de `responsible_id`; persona DPO; segunda infração encerrada; calendário por município; subpath `@detran/shared/documents` exige `exports`). Divergências: UCs 025/038 invertidas no prompt (descriptions seguem a fonte); códigos da fachada já existem no catálogo.
Bloqueios: nenhum; `pnpm install` do maestro.

#### `work/rounds/R-0006/reports/TASK-0006.md`

Papel: Inspector (Art. 6)
Tarefa: TASK-0006
Arquivos criados/alterados: `seed/20-fixtures-rait.sql` (ajustes §e.2 + fixtures novas §e.4), `seed/40-fixtures-rait-org.sql`, `seed/50-fixtures-collection.sql`, `seed/60-fixtures-rait-integration.sql` (novos); `docs/framework/arch/fixtures/rait-fixtures.json` (20 seções novas); `inf-rls.integration.spec.ts` (58 → 81); testes de integração novos: rait-org (25), collection (20), rait-integration (11), rait-worklist deltas (30), rait-session deltas (8), rait-case deltas (20); `backend/domains/shared/src/documents/documents.spec.ts` (vermelho por especificação).
Comandos executados e saída resumida: prettier OK; `apply.sh --full` OK; `seed.sh` ×2 OK; integration: rait-org 25/25, collection 20/20, rait-integration 11/11, rait-worklist 30/30, rait-session 8/8, rait-case 20/20, inf-ait 2/2, inf-infraction 7/7; `@detran/shared test` só `documents.spec.ts` falha (módulo ausente), 39/39 demais; `rls-smoke` OK (125 inf/ch tables); `verify:rls-ddl` 178.
Critérios de aceitação: 14/14 PASS.
Matriz constraint/regra → teste → resultado: 114 linhas PASS (RLS/trigger por tabela, checks de estado das máquinas TURMA/LOTE/BANCA/disponibilidade e dos módulos org/collection/reconciliation, FKs, unicidades parciais, fixtures por estado, ajustes §e.2); sensor inf-rls 81; `documents.spec.ts` RED por especificação.
Fora do escopo / deixado: `pnpm check` falha só em `@detran/shared` (`documents.spec.ts` → TASK-0007); fachada (TASK-0007); comandos/rotas (R-0007); projeção do outbox (WP-P).
OD tocadas ou propostas: nenhuma nova; dados de teste sem fonte seguem o padrão "dado de teste declarado" das fixtures existentes.
Bloqueios: nenhum.

#### `work/rounds/R-0006/reports/TASK-0007.md`

Papel: Engineer (Art. 6)
Tarefa: TASK-0007
Arquivos criados/alterados: `backend/domains/shared/src/documents/{document-kind,signature-policy,documents-facade,index}.ts` (+ export em `shared/src/index.ts`); `backend/domains/inf/collection/src/handwritten/ports/bank/{bank.port,bank.mock,index}.ts` e `handwritten/index.ts` (provider `BANK_PORT`); `BP-INF-COLLECTION-001.json` (`handwrittenExports`, `handwrittenProviders`) + regeneração; `backend/app/src/app.module.ts` (CollectionModule, RaitOrgModule, RaitIntegrationModule); `backend/app/package.json` (3 deps); `package.json` raiz (listas); symlinks manuais em `backend/app/node_modules/@detran/` (recriados pelo `pnpm install` do maestro).
Comandos executados e saída resumida: shared typecheck OK, test 49/49; typecheck collection/rait-org/rait-integration/app OK; integration collection 20/20, rait-org 25/25, rait-integration 11/11; collection test:unit "no test files"; `blueprints:generate` OK; `blueprints:check` passed; `contracts:check` in sync; `verify:decorators` 819; `verify:senatran-boundary` 1386 arquivos; `format:check` OK; `backend:test:unit` verde; `backend:test:integration` verde (app 11, ait 2, ops-parameter 1, infraction 7, notification 7, collection 20, rait-org 25, rait-integration 11).
Critérios de aceitação: 9/9 PASS.
Fora do escopo / deixado: rotas/comandos (R-0007, M13); provedor bancário real e porta da Fazenda; `exports["./documents"]` em `shared/package.json` (OD 14 de TASK-0005); nome do arquivo do mock (`bank.mock.ts` do prompt × `mock-bank.adapter.ts` do contrato §c — seguiu o prompt; maestro harmoniza); `rait-org`/`rait-integration` sem manuscrito (contrato não pede).
OD tocadas ou propostas: nenhuma nova.
Bloqueios: nenhum.

#### `work/rounds/R-0006/reports/TASK-0008.md`

Papel: Owner (delegado) — Art. 6
Tarefa: TASK-0008
Arquivos criados/alterados: `docs/framework/arch/rait-build-pack.md` (§WP-A: tabela de blueprints conforme M1/M2/M10, `BP-INF-NOTIFICATION-001`, `BP-INF-COLLECTION-001`, integração só `rait_reconciliation`; frase do `apply.sh` substituída; DDL reais 38/39/57/58/59; nota "executado em R-0006"; `updated`); `docs/framework/blueprints/README.md` (`module.ddlFile`; `@detran/inf-deadlines` manuscrito); `docs/framework/arch/rait-fixtures.md` (§7 faixa `00…60`; §8 reescrito); `docs/framework/arch/rait-deadline-engine.md` (§1 pacote em `backend/domains/inf/deadlines`, ADR-0016 §2); `docs/meta/knowledge-base/backlog.md` (itens executados, R-0006).
Comandos executados e saída resumida: prettier OK; `format:check` OK; `docs:kb:check` OK (521/446, baseline inalterada); `docs:kb:publish-check` OK (201); grep "34…37 já foram incluídos" ausente; grep "59-inf-notification.sql" 1 linha.
Critérios de aceitação: 5/5 PASS.
Fora do escopo / deixado: build pack §5 (já correto); backlog sem bullets próprios para org/financeiro/integração; `rait-error-catalog.md` (fora de escopo).
OD tocadas ou propostas: nenhuma.
Bloqueios: nenhum. Desvios: `Edit` bloqueado pelo Auto Mode → edições por script; um `git status --porcelain` (leitura).

### Diff completo dos arquivos manuscritos e blueprints (35 arquivos)

````diff
diff --git a/backend/app/package.json b/backend/app/package.json
index d4a395e..3d3d135 100644
--- a/backend/app/package.json
+++ b/backend/app/package.json
@@ -38,9 +38,12 @@
     "@detran/ch-toxicology": "workspace:*",
     "@detran/inf-ait": "workspace:*",
     "@detran/inf-alcohol": "workspace:*",
+    "@detran/inf-collection": "workspace:*",
     "@detran/inf-measures": "workspace:*",
     "@detran/inf-normative": "workspace:*",
     "@detran/inf-rait-case": "workspace:*",
+    "@detran/inf-rait-integration": "workspace:*",
+    "@detran/inf-rait-org": "workspace:*",
     "@detran/inf-rait-session": "workspace:*",
     "@detran/inf-rait-worklist": "workspace:*",
     "@detran/inf-speed": "workspace:*",
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index 4eccceb..0c809c1 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -63,9 +63,12 @@ import { ToxicologyModule } from '@detran/ch-toxicology';
 import { ComplaintsModule } from '@detran/portal-complaints';
 import { AitModule } from '@detran/inf-ait';
 import { AlcoholModule } from '@detran/inf-alcohol';
+import { CollectionModule } from '@detran/inf-collection';
 import { MeasuresModule } from '@detran/inf-measures';
 import { NormativeModule } from '@detran/inf-normative';
 import { RaitCaseModule } from '@detran/inf-rait-case';
+import { RaitIntegrationModule } from '@detran/inf-rait-integration';
+import { RaitOrgModule } from '@detran/inf-rait-org';
 import { RaitSessionModule } from '@detran/inf-rait-session';
 import { RaitWorklistModule } from '@detran/inf-rait-worklist';
 import { SpeedModule } from '@detran/inf-speed';
@@ -356,6 +359,9 @@ export class AppModule {
         RaitCaseModule,
         RaitWorklistModule,
         RaitSessionModule,
+        RaitOrgModule,
+        CollectionModule,
+        RaitIntegrationModule,
         AgencyModule,
         FieldModule,
         SnapshotsModule,
diff --git a/backend/app/vitest.config.ts b/backend/app/vitest.config.ts
index cdae488..7d469f8 100644
--- a/backend/app/vitest.config.ts
+++ b/backend/app/vitest.config.ts
@@ -96,6 +96,18 @@ export default defineConfig({
       '@detran/inf-rait-session': fileURLToPath(
         new URL('../domains/inf/rait-session/src/index.ts', import.meta.url),
       ),
+      '@detran/inf-rait-org': fileURLToPath(
+        new URL('../domains/inf/rait-org/src/index.ts', import.meta.url),
+      ),
+      '@detran/inf-collection': fileURLToPath(
+        new URL('../domains/inf/collection/src/index.ts', import.meta.url),
+      ),
+      '@detran/inf-rait-integration': fileURLToPath(
+        new URL(
+          '../domains/inf/rait-integration/src/index.ts',
+          import.meta.url,
+        ),
+      ),
       '@detran/inf-speed': fileURLToPath(
         new URL('../domains/inf/speed/src/index.ts', import.meta.url),
       ),
diff --git a/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts b/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
index 995c6e9..f3c444d 100644
--- a/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
+++ b/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
@@ -37,14 +37,19 @@ describe('inf database contract', () => {
         group by tables.table_schema, tables.table_name, classes.relrowsecurity, classes.relforcerowsecurity
         order by tables.table_name`,
     );
-    // Tenant tables: ait (9), normative (6), measures (9), alcohol (6), rait case/worklist/session (21),
-    // speed (3), infraction (3: infraction, infraction_timer, infraction_event — DDL 38) and
-    // notification (3: notice, notice_acknowledgement, notice_delivery_attempt — DDL 59) —
-    // 14-inf-lifecycle-vocabulary.sql adds tenant-less reference tables (`*_ref`), which must
-    // never carry tenant RLS and must be the only unprotected tables in the schema.
+    // Tenant tables (81, grep -h 'create table if not exists inf\.' backend/database/ddl/*.sql):
+    // ait (9), normative (6), measures (9), alcohol (6), rait-case (12: DDL 34, includes
+    // rait_pending_content/rait_redirect/rait_draft v1.1.0), rait-worklist (13: DDL 35, includes
+    // rait_unit/rait_schedule/rait_schedule_slot/rait_batch/rait_batch_item/rait_substitute_duty/
+    // rait_bench v1.1.0), rait-session (6: DDL 36), speed (3), infraction (3: infraction,
+    // infraction_timer, infraction_event — DDL 38), rait-org (8: DDL 39), collection (4: DDL 57),
+    // rait-integration (1: DDL 58) and notification (3: notice, notice_acknowledgement,
+    // notice_delivery_attempt — DDL 59) — 14-inf-lifecycle-vocabulary.sql adds tenant-less
+    // reference tables (`*_ref`), which must never carry tenant RLS and must be the only
+    // unprotected tables in the schema.
     const tenantTables = result.rows.filter((row) => row.has_tenant_id);
     const referenceTables = result.rows.filter((row) => !row.has_tenant_id);
-    expect(tenantTables).toHaveLength(58);
+    expect(tenantTables).toHaveLength(81);
     expect(referenceTables).toHaveLength(9);
     expect(
       tenantTables.every(
diff --git a/backend/domains/inf/collection/src/handwritten/index.ts b/backend/domains/inf/collection/src/handwritten/index.ts
new file mode 100644
index 0000000..5fa0c17
--- /dev/null
+++ b/backend/domains/inf/collection/src/handwritten/index.ts
@@ -0,0 +1,21 @@
+// API pública manuscrita de @detran/inf-collection
+// (work/rounds/R-0006/contracts/CTG-0002-modules.md §c), reexportada pelo
+// `src/index.ts` gerado via `module.handwrittenExports` do
+// BP-INF-COLLECTION-001 (ADR-0007: código gerado não se edita). Nesta rodada
+// só o port bancário mock — o real é de rodada futura (ADR-0017 §Decision 4).
+import type { Provider } from '@nestjs/common';
+
+import { createMockBankPort, SystemClock } from './ports/bank/index.js';
+
+export * from './ports/bank/index.js';
+
+/**
+ * Provider Nest do port bancário, apontando para o mock determinístico
+ * (ADR-0017 §Decision 4): o provedor real de banco nasce em rodada futura,
+ * quando substitui apenas este `useFactory`. Token de injeção: string
+ * `'BANK_PORT'` (sem classe própria, `BankPort` é interface).
+ */
+export const BANK_PORT: Provider = {
+  provide: 'BANK_PORT',
+  useFactory: () => createMockBankPort(new SystemClock()),
+};
diff --git a/backend/domains/inf/collection/src/handwritten/ports/bank/bank.mock.ts b/backend/domains/inf/collection/src/handwritten/ports/bank/bank.mock.ts
new file mode 100644
index 0000000..b08a7c3
--- /dev/null
+++ b/backend/domains/inf/collection/src/handwritten/ports/bank/bank.mock.ts
@@ -0,0 +1,125 @@
+// Mock determinístico da porta bancária (contrato
+// work/rounds/R-0006/contracts/CTG-0002-modules.md §c, "Comportamento
+// exigido do mock determinístico"). Sem I/O, sem rede, sem estado
+// compartilhado entre instâncias (ADR-0018 §Decision 5, mesmo padrão dos
+// dobrões do `senatran-adapter`). O port nunca escreve em tabela — quem
+// grava `inf.collection_document`, `inf.payment` e `inf.refund_order` é o
+// comando, na mesma transação do outbox (R-0007).
+import { createHash } from 'node:crypto';
+
+import type {
+  BankDocumentHandle,
+  BankDocumentRegistration,
+  BankPort,
+  BankRefundInstruction,
+  BankRefundReceipt,
+  BankReturnLine,
+  BankReturnWindow,
+  Clock,
+} from './bank.port.js';
+
+/**
+ * Dígitos determinísticos derivados de `seed` por SHA-256 — sem aleatoriedade
+ * e sem contador global (item 2 do contrato). O formato (44 dígitos para o
+ * código de barras) é um layout de teste declarado aqui, não o layout oficial
+ * FEBRABAN/órgão máximo: este último não está no corpus (§c, "o formato real
+ * é OD proposta").
+ */
+function deterministicDigits(seed: string, length: number): string {
+  const hash = createHash('sha256').update(seed).digest('hex');
+  let digits = '';
+  let index = 0;
+  while (digits.length < length) {
+    const nibble = hash[index % hash.length];
+    digits += (Number.parseInt(nibble, 16) % 10).toString();
+    index += 1;
+  }
+  return digits;
+}
+
+function deriveBarcode(documentId: string): string {
+  return deterministicDigits(`bank-barcode:${documentId}`, 44);
+}
+
+function derivePixReference(documentId: string): string {
+  return `PIX-MOCK-${deterministicDigits(`bank-pix:${documentId}`, 24)}`;
+}
+
+function deriveBankReference(refundOrderId: string): string {
+  return `BANKREF-MOCK-${deterministicDigits(`bank-refund:${refundOrderId}`, 20)}`;
+}
+
+/**
+ * Mock em memória, construído por teste (ou pelo provedor `BANK_PORT` do
+ * módulo). `seededReturns` é a lista fixa que `fetchReturns` filtra — o mock
+ * nunca inventa pagamento (item 3 do contrato); quem semeia o retorno
+ * bancário é quem constrói o mock.
+ */
+export function createMockBankPort(
+  clock: Clock,
+  seededReturns: readonly BankReturnLine[] = [],
+): BankPort {
+  const registrations = new Map<string, BankDocumentHandle>();
+  const refunds = new Map<string, BankRefundReceipt>();
+
+  return {
+    async registerDocument(
+      registration: BankDocumentRegistration,
+    ): Promise<BankDocumentHandle> {
+      const cached = registrations.get(registration.documentId);
+      if (cached) {
+        return cached;
+      }
+      const handle: BankDocumentHandle = {
+        documentId: registration.documentId,
+        barcode: deriveBarcode(registration.documentId),
+        pixReference: derivePixReference(registration.documentId),
+        registeredAt: clock.now().toISOString(),
+      };
+      registrations.set(registration.documentId, handle);
+      return handle;
+    },
+
+    async fetchReturns(
+      window: BankReturnWindow,
+    ): Promise<readonly BankReturnLine[]> {
+      return seededReturns
+        .filter(
+          (line) => line.paidOn >= window.from && line.paidOn <= window.to,
+        )
+        .slice()
+        .sort((a, b) =>
+          a.paidOn === b.paidOn
+            ? a.bankReference.localeCompare(b.bankReference)
+            : a.paidOn.localeCompare(b.paidOn),
+        );
+    },
+
+    async orderRefund(
+      instruction: BankRefundInstruction,
+    ): Promise<BankRefundReceipt> {
+      const cached = refunds.get(instruction.refundOrderId);
+      if (cached) {
+        return cached;
+      }
+      const receipt: BankRefundReceipt = {
+        refundOrderId: instruction.refundOrderId,
+        bankReference: deriveBankReference(instruction.refundOrderId),
+        orderedAt: clock.now().toISOString(),
+      };
+      refunds.set(instruction.refundOrderId, receipt);
+      return receipt;
+    },
+  };
+}
+
+/**
+ * Relógio de sistema para o provedor do módulo (`handwritten/index.ts`): é o
+ * único ponto de leitura do instante real, exatamente o papel de um adapter
+ * de `Clock` (CODESTYLE §TypeScript) — o mock em si nunca chama `Date.now()`.
+ */
+export class SystemClock implements Clock {
+  now(): Date {
+    return new Date();
+  }
+}
diff --git a/backend/domains/inf/collection/src/handwritten/ports/bank/bank.port.ts b/backend/domains/inf/collection/src/handwritten/ports/bank/bank.port.ts
new file mode 100644
index 0000000..8c5d7d9
--- /dev/null
+++ b/backend/domains/inf/collection/src/handwritten/ports/bank/bank.port.ts
@@ -0,0 +1,66 @@
+// Porta bancária de `inf/collection` (ADR-0017 §Decision 4; contrato
+// work/rounds/R-0006/contracts/CTG-0002-modules.md §c). Adapter interno do
+// módulo, mock-first como o `senatran-adapter`, nunca chamado por apps;
+// cartão e parcelamento estão fora de escopo (DT-031), então a interface só
+// cobre os três fatos que o módulo escreve: registrar o documento na rede
+// arrecadadora, consultar os retornos de uma janela e ordenar a restituição.
+// A Fazenda não é coberta aqui — tem porta própria pendente de fonte
+// (ADR-0017 §tabela de ownership).
+
+export interface BankDocumentRegistration {
+  readonly documentId: string;
+  readonly infractionId: string;
+  readonly tier: string; // código de inf.infraction_payment_tier_ref
+  readonly amount: string; // decimal com 2 casas truncadas (AC-RAIT-032-3)
+  readonly validUntil: string; // ISO 8601 date
+}
+
+export interface BankDocumentHandle {
+  readonly documentId: string;
+  readonly barcode: string | null;
+  readonly pixReference: string | null;
+  readonly registeredAt: string; // ISO 8601 date-time
+}
+
+export interface BankReturnWindow {
+  readonly from: string; // ISO 8601 date
+  readonly to: string; // ISO 8601 date
+}
+
+export interface BankReturnLine {
+  readonly bankReference: string; // chave idempotente do retorno
+  readonly barcode: string | null;
+  readonly pixReference: string | null;
+  readonly paidOn: string; // ISO 8601 date
+  readonly amount: string; // decimal com 2 casas
+}
+
+export interface BankRefundInstruction {
+  readonly refundOrderId: string;
+  readonly amount: string; // updated_amount
+  readonly indexKey: string; // index_key aplicado
+}
+
+export interface BankRefundReceipt {
+  readonly refundOrderId: string;
+  readonly bankReference: string;
+  readonly orderedAt: string; // ISO 8601 date-time
+}
+
+export interface BankPort {
+  registerDocument(
+    registration: BankDocumentRegistration,
+  ): Promise<BankDocumentHandle>;
+  fetchReturns(window: BankReturnWindow): Promise<readonly BankReturnLine[]>;
+  orderRefund(instruction: BankRefundInstruction): Promise<BankRefundReceipt>;
+}
+
+/**
+ * Relógio injetado (CODESTYLE §TypeScript: nunca `Date.now()` em código de
+ * domínio). O mock só precisa do instante atual para `registeredAt` e
+ * `orderedAt`; quem lê o instante do sistema é o adapter de wiring
+ * (`bank.mock.ts`), nunca o mock em si.
+ */
+export interface Clock {
+  now(): Date;
+}
diff --git a/backend/domains/inf/collection/src/handwritten/ports/bank/index.ts b/backend/domains/inf/collection/src/handwritten/ports/bank/index.ts
new file mode 100644
index 0000000..f6d5e0e
--- /dev/null
+++ b/backend/domains/inf/collection/src/handwritten/ports/bank/index.ts
@@ -0,0 +1,4 @@
+// Barril do port bancário (work/rounds/R-0006/contracts/CTG-0002-modules.md
+// §c), reexportado por `../../index.ts`.
+export * from './bank.port.js';
+export * from './bank.mock.js';
diff --git a/backend/domains/inf/collection/tests/integration/collection-db.integration.spec.ts b/backend/domains/inf/collection/tests/integration/collection-db.integration.spec.ts
new file mode 100644
index 0000000..9757548
--- /dev/null
+++ b/backend/domains/inf/collection/tests/integration/collection-db.integration.spec.ts
@@ -0,0 +1,362 @@
+// Contrato de banco do financeiro do RAIT (backend/database/ddl/57-inf-collection.sql):
+// RLS forçada e gatilho enforce_tenant_id nas 4 tabelas de tenant, leitura cruzada entre
+// tenants vazia (rait-test-strategy.md §4), checks de estado das máquinas b.4 (documento de
+// arrecadação), b.5 (ordem de restituição) e b.6 (encaminhamento à Fazenda), FKs reais entre
+// módulos e regras de unicidade do contrato (CTG-0002-modules.md §a.9-§a.12, §d.5).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+const OTHER_TENANT = randomUUID();
+const TENANT_TABLES = [
+  'collection_document',
+  'payment',
+  'refund_order',
+  'debt_handoff',
+];
+
+const INFRACTION_05 = '00000000-0000-7000-8000-0000d0000005';
+const INFRACTION_15 = '00000000-0000-7000-8000-0000d0000015';
+const DOCUMENT_0001 = '00000000-0000-7000-8000-000046000001';
+const DOCUMENT_0002 = '00000000-0000-7000-8000-000046000002';
+const PAYMENT_0001 = '00000000-0000-7000-8000-000047000001';
+const REFUND_ORDER_0001 = '00000000-0000-7000-8000-000048000001';
+const DEBT_HANDOFF_0001 = '00000000-0000-7000-8000-000049000001';
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+async function asTenant<T>(
+  tenantId: string,
+  work: () => Promise<T>,
+): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      tenantId,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('inf.{collection_document,payment,refund_order,debt_handoff} — contrato de banco (DDL 57)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('dadas as tabelas de tenant do financeiro quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
+    const result = await client.query<{
+      table_name: string;
+      relrowsecurity: boolean;
+      relforcerowsecurity: boolean;
+      policy_count: string;
+      trigger_count: string;
+    }>(
+      `select classes.relname as table_name, classes.relrowsecurity, classes.relforcerowsecurity,
+              count(distinct policies.policyname)::text as policy_count,
+              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
+         from pg_class classes
+         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
+         left join pg_policies policies on policies.schemaname = 'inf' and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
+         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
+        where namespaces.nspname = 'inf' and classes.relname = any($1::text[])
+        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity
+        order by classes.relname`,
+      [TENANT_TABLES],
+    );
+
+    expect(result.rows.map((row) => row.table_name)).toEqual(
+      [...TENANT_TABLES].sort(),
+    );
+    for (const row of result.rows) {
+      expect(row.relrowsecurity).toBe(true);
+      expect(row.relforcerowsecurity).toBe(true);
+      expect(row.policy_count).toBe('1');
+      expect(row.trigger_count).toBe('1');
+    }
+  });
+
+  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
+    const mine = await asTenant(TENANT, () =>
+      count('select count(*)::text as count from inf.collection_document'),
+    );
+    expect(mine).toBe(5);
+
+    for (const table of TENANT_TABLES) {
+      const theirs = await asTenant(OTHER_TENANT, () =>
+        count(`select count(*)::text as count from inf.${table}`),
+      );
+      expect(theirs).toBe(0);
+    }
+  });
+
+  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
+           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000099', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
+          [TENANT, INFRACTION_05],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+  });
+
+  it('dado um tier fora do vocabulário de inf.infraction_payment_tier_ref quando um documento é inserido então ck_inf_collection_document_tier rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
+           values ($1, $2, 'faixa_inexistente', 100.00, '00000000000000000000000000000000000000000098', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
+          [TENANT, INFRACTION_05],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: expect.stringMatching(/^(23514|23503)$/) });
+  });
+
+  it('dado um status fora de emitido/pago/vencido/invalidado quando um documento é inserido então ck_inf_collection_document_status rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state, status)
+           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000097', '2026-12-31', 'NOTIFICADO_PENALIDADE', 'STATUS_INEXISTENTE')`,
+          [TENANT, INFRACTION_05],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um documento sem barcode nem pix_reference quando inserido então ck_inf_collection_document_reference_required rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, valid_until, issued_for_state)
+           values ($1, $2, 'desconto_80', 100.00, '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
+          [TENANT, INFRACTION_05],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um documento invalidado sem invalidated_at quando inserido então ck_inf_collection_document_invalidated_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state, status)
+           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000096', '2026-12-31', 'NOTIFICADO_PENALIDADE', 'invalidado')`,
+          [TENANT, INFRACTION_05],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um status fora de aberta/ordenada/paga quando uma ordem de restituição é inserida então ck_inf_refund_order_status rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.refund_order (tenant_id, infraction_id, payment_id, reason, base_amount, index_key, status)
+           values ($1, $2, $3, 'decisao_favoravel', 10.00, 'IPCA-E', 'STATUS_INEXISTENTE')`,
+          [TENANT, INFRACTION_15, PAYMENT_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma ordem ordenada sem bank_data_status informado quando inserida então ck_inf_refund_order_order_needs_bank_data rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.refund_order (tenant_id, infraction_id, payment_id, reason, base_amount, index_key, status, bank_data_status, ordered_at)
+           values ($1, $2, $3, 'decisao_favoravel', 10.00, 'IPCA-E', 'ordenada', 'pendente', now())`,
+          [TENANT, INFRACTION_15, PAYMENT_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um status fora de preparado/enviado/reconhecido/cancelado quando um encaminhamento é inserido então ck_inf_debt_handoff_status rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.debt_handoff (tenant_id, infraction_id, status)
+           values ($1, $2, 'STATUS_INEXISTENTE')`,
+          [TENANT, INFRACTION_05],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um encaminhamento cancelado sem cancel_reason quando inserido então ck_inf_debt_handoff_cancel_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.debt_handoff (tenant_id, infraction_id, status)
+           values ($1, $2, 'cancelado')`,
+          [TENANT, INFRACTION_05],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um infraction_id inexistente quando um documento de arrecadação é inserido então fk_inf_collection_document_infraction rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
+           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000095', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um document_id inexistente quando um pagamento é inserido então fk_inf_payment_document rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.payment (tenant_id, document_id, bank_reference, paid_on, amount)
+           values ($1, $2, 'BR-2026-EFEMERO', '2026-09-14', 10.00)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um payment_id inexistente quando uma ordem de restituição é inserida então fk_inf_refund_order_payment rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.refund_order (tenant_id, infraction_id, payment_id, reason, base_amount, index_key)
+           values ($1, $2, $3, 'decisao_favoravel', 10.00, 'IPCA-E')`,
+          [TENANT, INFRACTION_15, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado o documento …0001 (infração 05) já emitido quando um segundo documento emitido da mesma infração é inserido então ux_inf_collection_document_active rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
+           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000094', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
+          [TENANT, INFRACTION_05],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(DOCUMENT_0001).toBeTruthy();
+  });
+
+  it('dado o barcode do documento …0002 quando um segundo documento com o mesmo barcode é inserido então ux_inf_collection_document_barcode rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
+           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000002', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
+          [TENANT, INFRACTION_15],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(DOCUMENT_0002).toBeTruthy();
+  });
+
+  it('dado o bank_reference BR-2026-0000001 já processado quando reprocessado então ux_inf_payment_bank_reference rejeita a duplicata (idempotência do retorno bancário)', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.payment (tenant_id, bank_reference, paid_on, amount)
+           values ($1, 'BR-2026-0000001', '2026-08-20', 200.00)`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dado o pagamento …0001 já com uma ordem de restituição quando uma segunda ordem do mesmo pagamento é inserida então ux_inf_refund_order_payment rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.refund_order (tenant_id, infraction_id, payment_id, reason, base_amount, index_key)
+           values ($1, $2, $3, 'extincao', 5.00, 'IPCA-E')`,
+          [TENANT, INFRACTION_15, PAYMENT_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(REFUND_ORDER_0001).toBeTruthy();
+  });
+
+  it('dado o encaminhamento …0001 (infração 09) ativo quando um segundo encaminhamento ativo da mesma infração é inserido então ux_inf_debt_handoff_active rejeita', async () => {
+    const infraction09 = '00000000-0000-7000-8000-0000d0000009';
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.debt_handoff (tenant_id, infraction_id, status)
+           values ($1, $2, 'preparado')`,
+          [TENANT, infraction09],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(DEBT_HANDOFF_0001).toBeTruthy();
+  });
+
+  it('dadas as fixtures do financeiro quando contadas então há 5 documentos de arrecadação (4 status), 5 pagamentos, 3 ordens de restituição (3 status) e 2 encaminhamentos (2 status)', async () => {
+    expect(
+      await count(
+        `select count(*)::text as count from inf.collection_document where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(5);
+    expect(
+      await count(
+        `select count(distinct status)::text as count from inf.collection_document where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(4);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.payment where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(5);
+    expect(
+      await count(
+        `select count(distinct status)::text as count from inf.refund_order where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(distinct status)::text as count from inf.debt_handoff where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(2);
+  });
+});
diff --git a/backend/domains/inf/rait-case/tests/integration/rait-case-deltas-db.integration.spec.ts b/backend/domains/inf/rait-case/tests/integration/rait-case-deltas-db.integration.spec.ts
new file mode 100644
index 0000000..db3093d
--- /dev/null
+++ b/backend/domains/inf/rait-case/tests/integration/rait-case-deltas-db.integration.spec.ts
@@ -0,0 +1,357 @@
+// Contrato de banco dos deltas v1.1.0 do caso do RAIT (backend/database/ddl/34-inf-rait-case.sql):
+// RLS forçada e gatilho enforce_tenant_id nas 3 tabelas novas (rait_pending_content,
+// rait_redirect, rait_draft), leitura cruzada entre tenants vazia (rait-test-strategy.md §4),
+// checks de estado/consistência e regras de unicidade do contrato
+// (work/rounds/R-0006/contracts/CTG-0002-deltas.md §a.10-§a.13, §c, §e.5).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+const OTHER_TENANT = randomUUID();
+const NEW_TENANT_TABLES = [
+  'rait_pending_content',
+  'rait_redirect',
+  'rait_draft',
+];
+
+const CASE_0001 = '00000000-0000-7000-8000-000010000001';
+const CASE_0002 = '00000000-0000-7000-8000-000010000002';
+const CASE_0007 = '00000000-0000-7000-8000-000010000007';
+const PENDING_CONTENT_0001 = '00000000-0000-7000-8000-000036000001';
+const REDIRECT_0002 = '00000000-0000-7000-8000-000037000002';
+const DRAFT_0001 = '00000000-0000-7000-8000-000038000001';
+const AUTHOR_ANA = '00000000-0000-4000-8000-0000b0000001';
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+async function asTenant<T>(
+  tenantId: string,
+  work: () => Promise<T>,
+): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      tenantId,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('inf.{rait_pending_content,rait_redirect,rait_draft} — deltas v1.1.0 (DDL 34)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('dadas as 3 tabelas novas do caso quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
+    const result = await client.query<{
+      table_name: string;
+      relrowsecurity: boolean;
+      relforcerowsecurity: boolean;
+      policy_count: string;
+      trigger_count: string;
+    }>(
+      `select classes.relname as table_name, classes.relrowsecurity, classes.relforcerowsecurity,
+              count(distinct policies.policyname)::text as policy_count,
+              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
+         from pg_class classes
+         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
+         left join pg_policies policies on policies.schemaname = 'inf' and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
+         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
+        where namespaces.nspname = 'inf' and classes.relname = any($1::text[])
+        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity
+        order by classes.relname`,
+      [NEW_TENANT_TABLES],
+    );
+
+    expect(result.rows.map((row) => row.table_name)).toEqual(
+      [...NEW_TENANT_TABLES].sort(),
+    );
+    for (const row of result.rows) {
+      expect(row.relrowsecurity).toBe(true);
+      expect(row.relforcerowsecurity).toBe(true);
+      expect(row.policy_count).toBe('1');
+      expect(row.trigger_count).toBe('1');
+    }
+  });
+
+  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
+    const mine = await asTenant(TENANT, () =>
+      count('select count(*)::text as count from inf.rait_pending_content'),
+    );
+    expect(mine).toBe(3);
+
+    for (const table of NEW_TENANT_TABLES) {
+      const theirs = await asTenant(OTHER_TENANT, () =>
+        count(`select count(*)::text as count from inf.${table}`),
+      );
+      expect(theirs).toBe(0);
+    }
+  });
+
+  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by)
+           values ($1, $2, '[]'::jsonb, '2026-12-31', $3)`,
+          [TENANT, CASE_0001, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+  });
+
+  it('dado um outcome fora de atendida/nao_atendida quando uma pendência é inserida então ck_inf_rait_pending_content_outcome rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by, outcome)
+           values ($1, $2, '[]'::jsonb, '2026-12-31', $3, 'DESFECHO_INEXISTENTE')`,
+          [TENANT, CASE_0007, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma pendência com closed_at preenchido e outcome nulo quando inserida então ck_inf_rait_pending_content_closure_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by, closed_at)
+           values ($1, $2, '[]'::jsonb, '2026-12-31', $3, now())`,
+          [TENANT, CASE_0007, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um direction fora de entrada/saida quando um redirecionamento é inserido então ck_inf_rait_redirect_direction rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_redirect (tenant_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
+           values ($1, 'lateral', 'outro_orgao_autuador', 'RAIT-2026-R99999', 'órgão x', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um reason fora de outro_orgao_autuador/orgao_incompetente quando um redirecionamento é inserido então ck_inf_rait_redirect_reason rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_redirect (tenant_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
+           values ($1, 'saida', 'motivo_inexistente', 'RAIT-2026-R99998', 'órgão x', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um redirecionamento de entrada sem case_id quando inserido então ck_inf_rait_redirect_inbound_has_case rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_redirect (tenant_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
+           values ($1, 'entrada', 'orgao_incompetente', 'RAIT-2026-R99997', 'órgão x', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um status fora de rascunho/submetida/devolvida/assinada quando uma minuta é inserida então ck_inf_rait_draft_status rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash, status)
+           values ($1, $2, 2, $3, 'hash-efemero', 'STATUS_INEXISTENTE')`,
+          [TENANT, CASE_0007, AUTHOR_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma minuta submetida sem submitted_at quando inserida então ck_inf_rait_draft_submitted_required rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash, status)
+           values ($1, $2, 2, $3, 'hash-efemero', 'submetida')`,
+          [TENANT, CASE_0007, AUTHOR_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma minuta devolvida sem returned_at/return_guidance quando inserida então ck_inf_rait_draft_return_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash, status, submitted_at)
+           values ($1, $2, 2, $3, 'hash-efemero', 'devolvida', now())`,
+          [TENANT, CASE_0007, AUTHOR_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma minuta com return_count acima de 1 quando inserida então ck_inf_rait_draft_single_return rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash, return_count)
+           values ($1, $2, 2, $3, 'hash-efemero', 2)`,
+          [TENANT, CASE_0007, AUTHOR_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um case_id inexistente quando uma pendência é inserida então fk_inf_rait_pending_content_case rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by)
+           values ($1, $2, '[]'::jsonb, '2026-12-31', $3)`,
+          [TENANT, randomUUID(), randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um case_id inexistente quando um redirecionamento de entrada é inserido então fk_inf_rait_redirect_case rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_redirect (tenant_id, case_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
+           values ($1, $2, 'entrada', 'orgao_incompetente', 'RAIT-2026-R99996', 'órgão x', $3)`,
+          [TENANT, randomUUID(), randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um case_id inexistente quando uma minuta é inserida então fk_inf_rait_draft_case rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash)
+           values ($1, $2, 1, $3, 'hash-efemero')`,
+          [TENANT, randomUUID(), AUTHOR_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado o caso 01 já com uma pendência aberta quando uma segunda pendência aberta do mesmo caso é inserida então ux_inf_rait_pending_content_open rejeita (índice parcial em closed_at is null)', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by)
+           values ($1, $2, '["comprovante_endereco"]'::jsonb, '2026-10-01', $3)`,
+          [TENANT, CASE_0001, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(PENDING_CONTENT_0001).toBeTruthy();
+  });
+
+  it('dado o protocolo RAIT-2026-R00002 (entrada) já registrado quando o mesmo protocolo e sentido são inseridos de novo então ux_inf_rait_redirect_protocol rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_redirect (tenant_id, case_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
+           values ($1, $2, 'entrada', 'orgao_incompetente', 'RAIT-2026-R00002', 'órgão duplicado', $3)`,
+          [TENANT, CASE_0002, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(REDIRECT_0002).toBeTruthy();
+  });
+
+  it('dada a minuta …0001 (caso 07, versão 1) quando uma segunda minuta da mesma versão e caso é inserida então ux_inf_rait_draft_version rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash)
+           values ($1, $2, 1, $3, 'hash-duplicado')`,
+          [TENANT, CASE_0007, AUTHOR_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(DRAFT_0001).toBeTruthy();
+  });
+
+  it('dado o caso 01 quando lido então legal_priority e unit_id são nulos e version é 1 (colunas novas v1.1.0)', async () => {
+    const result = await asOwner(() =>
+      client.query<{
+        legal_priority: string | null;
+        unit_id: string | null;
+        version: number;
+      }>(
+        `select legal_priority, unit_id, version from inf.rait_case where id = $1`,
+        [CASE_0001],
+      ),
+    );
+    expect(result.rows[0]?.legal_priority).toBeNull();
+    expect(result.rows[0]?.unit_id).toBeNull();
+    expect(result.rows[0]?.version).toBe(1);
+  });
+
+  it('dadas as fixtures novas do caso quando contadas então há 3 pendências (2 desfechos + 1 aberta), 2 redirecionamentos (2 sentidos) e 4 minutas (4 status)', async () => {
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_pending_content where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_pending_content where tenant_id = $1 and closed_at is null`,
+        [TENANT],
+      ),
+    ).toBe(1);
+    expect(
+      await count(
+        `select count(distinct direction)::text as count from inf.rait_redirect where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(2);
+    expect(
+      await count(
+        `select count(distinct status)::text as count from inf.rait_draft where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(4);
+  });
+});
diff --git a/backend/domains/inf/rait-integration/tests/integration/rait-integration-db.integration.spec.ts b/backend/domains/inf/rait-integration/tests/integration/rait-integration-db.integration.spec.ts
new file mode 100644
index 0000000..cf46afb
--- /dev/null
+++ b/backend/domains/inf/rait-integration/tests/integration/rait-integration-db.integration.spec.ts
@@ -0,0 +1,214 @@
+// Contrato de banco da integração do RAIT (backend/database/ddl/58-inf-rait-integration.sql):
+// RLS forçada e gatilho enforce_tenant_id em inf.rait_reconciliation (única entidade, ADR-0020
+// §Decision 1-2), leitura cruzada entre tenants vazia (rait-test-strategy.md §4), checks de
+// estado da máquina b.7 e regra de unicidade da janela por sistema. Ausência de FK entre
+// schemas é o próprio contrato (nada fala com integration.outbox nem com SENATRAN, ADR-0003).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+const OTHER_TENANT = randomUUID();
+const RECONCILIATION_0002 = '00000000-0000-7000-8000-000050000002';
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+async function asTenant<T>(
+  tenantId: string,
+  work: () => Promise<T>,
+): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      tenantId,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('inf.rait_reconciliation — contrato de banco (DDL 58)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('dada a tabela de tenant rait_reconciliation quando o catálogo é inspecionado então tem RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
+    const result = await client.query<{
+      table_name: string;
+      relrowsecurity: boolean;
+      relforcerowsecurity: boolean;
+      policy_count: string;
+      trigger_count: string;
+    }>(
+      `select classes.relname as table_name, classes.relrowsecurity, classes.relforcerowsecurity,
+              count(distinct policies.policyname)::text as policy_count,
+              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
+         from pg_class classes
+         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
+         left join pg_policies policies on policies.schemaname = 'inf' and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
+         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
+        where namespaces.nspname = 'inf' and classes.relname = 'rait_reconciliation'
+        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity`,
+    );
+
+    expect(result.rows).toHaveLength(1);
+    const [row] = result.rows;
+    expect(row?.relrowsecurity).toBe(true);
+    expect(row?.relforcerowsecurity).toBe(true);
+    expect(row?.policy_count).toBe('1');
+    expect(row?.trigger_count).toBe('1');
+  });
+
+  it('dado rait_reconciliation quando o catálogo de FKs é inspecionado então não há nenhuma foreign key (ADR-0020: nada entre schemas)', async () => {
+    const result = await client.query<{ conname: string }>(
+      `select conname from pg_constraint
+        where conrelid = 'inf.rait_reconciliation'::regclass and contype = 'f'`,
+    );
+    expect(result.rows).toEqual([]);
+  });
+
+  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
+    const mine = await asTenant(TENANT, () =>
+      count('select count(*)::text as count from inf.rait_reconciliation'),
+    );
+    expect(mine).toBe(3);
+
+    const theirs = await asTenant(OTHER_TENANT, () =>
+      count('select count(*)::text as count from inf.rait_reconciliation'),
+    );
+    expect(theirs).toBe(0);
+  });
+
+  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by)
+           values ($1, 'renainf', '2026-01-01', '2026-01-31', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+  });
+
+  it('dado um system fora de renainf/renach/sne quando uma conciliação é inserida então ck_inf_rait_reconciliation_system rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by)
+           values ($1, 'outro_sys', '2026-01-01', '2026-01-31', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um status fora de solicitada/conciliada/escalada quando uma conciliação é inserida então ck_inf_rait_reconciliation_status rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by, status)
+           values ($1, 'renainf', '2026-01-01', '2026-01-31', $2, 'STATUS_INEXISTENTE')`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma janela com window_to anterior a window_from quando inserida então ck_inf_rait_reconciliation_window_order rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by)
+           values ($1, 'renainf', '2026-02-01', '2026-01-01', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma conciliação conciliada com divergências e sem report_document_id quando inserida então ck_inf_rait_reconciliation_report_required rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by, status, divergences_count)
+           values ($1, 'renach', '2026-02-01', '2026-02-28', $2, 'conciliada', 2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma conciliação escalada sem resolved_at quando inserida então ck_inf_rait_reconciliation_resolved_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by, status)
+           values ($1, 'sne', '2026-02-01', '2026-02-28', $2, 'escalada')`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada a janela renach 2026-08-01…2026-08-31 já conciliada quando a mesma janela e sistema são inseridos de novo então ux_inf_rait_reconciliation_window rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by)
+           values ($1, 'renach', '2026-08-01', '2026-08-31', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(RECONCILIATION_0002).toBeTruthy();
+  });
+
+  it('dadas as fixtures da integração quando contadas então há 3 conciliações, uma por status (solicitada/conciliada/escalada) e uma por sistema (renainf/renach/sne)', async () => {
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_reconciliation where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(distinct status)::text as count from inf.rait_reconciliation where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(distinct system)::text as count from inf.rait_reconciliation where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+  });
+});
diff --git a/backend/domains/inf/rait-org/tests/integration/rait-org-db.integration.spec.ts b/backend/domains/inf/rait-org/tests/integration/rait-org-db.integration.spec.ts
new file mode 100644
index 0000000..96159e8
--- /dev/null
+++ b/backend/domains/inf/rait-org/tests/integration/rait-org-db.integration.spec.ts
@@ -0,0 +1,460 @@
+// Contrato de banco da organização do RAIT (backend/database/ddl/39-inf-rait-org.sql):
+// RLS forçada e gatilho enforce_tenant_id nas 8 tabelas de tenant, leitura cruzada entre
+// tenants vazia (rait-test-strategy.md §4), checks de estado das máquinas b.1 (ato de
+// suspensão), b.2 (folha de jeton) e b.3 (exportação), FKs novas e regras de unicidade do
+// contrato (work/rounds/R-0006/contracts/CTG-0002-modules.md §a, §d.5).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+// Tenant efêmero só para o isolamento de RLS (rait-fixtures.md §7): entidades de
+// domínio nunca usam randomUUID().
+const OTHER_TENANT = randomUUID();
+const TENANT_TABLES = [
+  'rait_holiday',
+  'rait_suspension_act',
+  'rait_jeton_sheet',
+  'rait_jeton_line',
+  'rait_incident',
+  'rait_quality_sample',
+  'rait_capacity_plan',
+  'rait_export',
+];
+
+const HOLIDAY_0001 = '00000000-0000-7000-8000-000039000001';
+const SUSPENSION_ACT_0001 = '00000000-0000-7000-8000-000040000001';
+const JETON_SHEET_0001 = '00000000-0000-7000-8000-000041000001';
+const JETON_LINE_0001 = '00000000-0000-7000-8000-000041010001';
+const INCIDENT_0001 = '00000000-0000-7000-8000-000042000001';
+const QUALITY_SAMPLE_0001 = '00000000-0000-7000-8000-000043000001';
+const CAPACITY_PLAN_0001 = '00000000-0000-7000-8000-000044000001';
+const EXPORT_0001 = '00000000-0000-7000-8000-000045000001';
+const SESSION_0003 = '00000000-0000-7000-8000-000030000003';
+const MEMBER_HEITOR = '00000000-0000-7000-8000-000021000008';
+const POOL_JARI = '00000000-0000-7000-8000-000020000002';
+const CASE_0010 = '00000000-0000-7000-8000-000010000010';
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+async function asTenant<T>(
+  tenantId: string,
+  work: () => Promise<T>,
+): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      tenantId,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('inf.rait_{holiday,suspension_act,jeton_sheet,jeton_line,incident,quality_sample,capacity_plan,export} — contrato de banco (DDL 39)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('dadas as tabelas de tenant da organização quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
+    const result = await client.query<{
+      table_name: string;
+      relrowsecurity: boolean;
+      relforcerowsecurity: boolean;
+      policy_count: string;
+      trigger_count: string;
+    }>(
+      `select classes.relname as table_name, classes.relrowsecurity, classes.relforcerowsecurity,
+              count(distinct policies.policyname)::text as policy_count,
+              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
+         from pg_class classes
+         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
+         left join pg_policies policies on policies.schemaname = 'inf' and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
+         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
+        where namespaces.nspname = 'inf' and classes.relname = any($1::text[])
+        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity
+        order by classes.relname`,
+      [TENANT_TABLES],
+    );
+
+    expect(result.rows.map((row) => row.table_name)).toEqual(
+      [...TENANT_TABLES].sort(),
+    );
+    for (const row of result.rows) {
+      expect(row.relrowsecurity).toBe(true);
+      expect(row.relforcerowsecurity).toBe(true);
+      expect(row.policy_count).toBe('1');
+      expect(row.trigger_count).toBe('1');
+    }
+  });
+
+  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
+    const mine = await asTenant(TENANT, () =>
+      count('select count(*)::text as count from inf.rait_holiday'),
+    );
+    expect(mine).toBe(4);
+
+    for (const table of TENANT_TABLES) {
+      const theirs = await asTenant(OTHER_TENANT, () =>
+        count(`select count(*)::text as count from inf.${table}`),
+      );
+      expect(theirs).toBe(0);
+    }
+  });
+
+  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.rait_holiday (tenant_id, name, holiday_on, scope)
+           values ($1, 'feriado efêmero', '2026-12-31', 'nacional')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+  });
+
+  it('dado um scope fora do vocabulário quando um feriado é inserido então ck_inf_rait_holiday_scope rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_holiday (tenant_id, name, holiday_on, scope)
+           values ($1, 'feriado inválido', '2026-11-11', 'ESCOPO_INEXISTENTE')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um estado fora de vigente/revogado/encerrado quando um ato de suspensão é inserido então ck_inf_rait_suspension_act_state rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_suspension_act (tenant_id, reason, starts_on, ends_on, evidence_document_id, signed_by, state)
+           values ($1, 'motivo', '2026-09-01', '2026-09-10', $2, $3, 'ESTADO_INEXISTENTE')`,
+          [TENANT, randomUUID(), randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um ato revogado sem revoked_at/revoked_reason quando inserido então ck_inf_rait_suspension_act_revoked_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_suspension_act (tenant_id, reason, starts_on, ends_on, evidence_document_id, signed_by, state)
+           values ($1, 'motivo', '2026-09-01', '2026-09-10', $2, $3, 'revogado')`,
+          [TENANT, randomUUID(), randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um estado fora de gerada/conferida/homologada/enviada quando uma folha de jeton é inserida então ck_inf_rait_jeton_sheet_state rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_jeton_sheet (tenant_id, judging_body, period_start, period_end, state)
+           values ($1, 'jari', '2026-01-01', '2026-01-31', 'ESTADO_INEXISTENTE')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma folha homologada sem homologated_at/homologated_by quando inserida então ck_inf_rait_jeton_sheet_homologation_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_jeton_sheet (tenant_id, judging_body, period_start, period_end, state)
+           values ($1, 'jari', '2026-02-01', '2026-02-28', 'homologada')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um status fora de solicitada/aguardando_dpo/gerada quando uma exportação é inserida então ck_inf_rait_export_status rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_export (tenant_id, purpose, requested_by, status)
+           values ($1, 'finalidade', $2, 'STATUS_INEXISTENTE')`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma exportação gerada sem generated_at/content_hash/document_id quando inserida então ck_inf_rait_export_generated_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_export (tenant_id, purpose, requested_by, status)
+           values ($1, 'finalidade', $2, 'gerada')`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um incident_ref fora do formato INC-AAAA-NNNN quando um incidente é inserido então ck_inf_rait_incident_ref_format rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_incident (tenant_id, incident_ref, case_id)
+           values ($1, 'INC-INVALIDO', $2)`,
+          [TENANT, CASE_0010],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um incidente sem clock_id nem case_id quando inserido então ck_inf_rait_incident_target rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_incident (tenant_id, incident_ref)
+           values ($1, 'INC-2026-9999')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um incidente encerrado sem responsible_id/cause_analysis/outcome quando inserido então ck_inf_rait_incident_closed_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_incident (tenant_id, incident_ref, case_id, closed_at)
+           values ($1, 'INC-2026-9998', $2, now())`,
+          [TENANT, CASE_0010],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma amostra sistêmica sem finding_kind quando inserida então ck_inf_rait_quality_sample_systemic_needs_finding rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_quality_sample (tenant_id, period_start, period_end, case_id, systemic)
+           values ($1, '2026-09-01', '2026-09-30', $2, true)`,
+          [TENANT, CASE_0010],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um plano de capacidade fechado sem measures nem reinforcement_requested quando inserido então ck_inf_rait_capacity_plan_closed_needs_measure rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_capacity_plan (tenant_id, pool_id, period_start, period_end, closed_at)
+           values ($1, $2, '2026-01-01', '2026-01-31', now())`,
+          [TENANT, POOL_JARI],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um member_id inexistente quando uma linha de jeton é inserida então fk_inf_rait_jeton_line_member rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_jeton_line (tenant_id, sheet_id, member_id, session_id)
+           values ($1, $2, $3, $4)`,
+          [TENANT, JETON_SHEET_0001, randomUUID(), SESSION_0003],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um clock_id inexistente quando um incidente é inserido então fk_inf_rait_incident_clock rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_incident (tenant_id, incident_ref, clock_id)
+           values ($1, 'INC-2026-9997', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um pool_id inexistente quando um plano de capacidade é inserido então fk_inf_rait_capacity_plan_pool rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_capacity_plan (tenant_id, pool_id, period_start, period_end)
+           values ($1, $2, '2026-03-01', '2026-03-31')`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado o feriado …0001 (2026-09-07, nacional) quando um segundo feriado da mesma data e escopo é inserido então ux_inf_rait_holiday_date_scope rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_holiday (tenant_id, name, holiday_on, scope)
+           values ($1, 'duplicata efêmera', '2026-09-07', 'nacional')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(HOLIDAY_0001).toBeTruthy();
+  });
+
+  it('dada a folha …0001 (jari, 2026-09-01) quando uma segunda folha do mesmo período e órgão é inserida então ux_inf_rait_jeton_sheet_period rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_jeton_sheet (tenant_id, judging_body, period_start, period_end)
+           values ($1, 'jari', '2026-09-01', '2026-09-30')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dada a linha …010001 (folha 0001, Heitor, sessão 03) quando uma segunda linha do mesmo membro e sessão é inserida então ux_inf_rait_jeton_line_member_session rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_jeton_line (tenant_id, sheet_id, member_id, session_id)
+           values ($1, $2, $3, $4)`,
+          [TENANT, JETON_SHEET_0001, MEMBER_HEITOR, SESSION_0003],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(JETON_LINE_0001).toBeTruthy();
+  });
+
+  it('dado o incident_ref INC-2026-0007 já usado quando um segundo incidente com o mesmo ref é inserido então ux_inf_rait_incident_ref rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_incident (tenant_id, incident_ref, case_id)
+           values ($1, 'INC-2026-0007', $2)`,
+          [TENANT, CASE_0010],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(INCIDENT_0001).toBeTruthy();
+  });
+
+  it('dada a amostra …0001 (período 2026-09-01, caso 10) quando uma segunda amostra do mesmo período e caso é inserida então ux_inf_rait_quality_sample_case rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_quality_sample (tenant_id, period_start, period_end, case_id)
+           values ($1, '2026-09-01', '2026-09-30', $2)`,
+          [TENANT, CASE_0010],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(QUALITY_SAMPLE_0001).toBeTruthy();
+  });
+
+  it('dado o plano …0001 (pool defesa_previa, 2026-09-01) quando um segundo plano do mesmo pool e período é inserido então ux_inf_rait_capacity_plan_pool_period rejeita', async () => {
+    const poolDefesa = '00000000-0000-7000-8000-000020000001';
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_capacity_plan (tenant_id, pool_id, period_start, period_end)
+           values ($1, $2, '2026-09-01', '2026-09-30')`,
+          [TENANT, poolDefesa],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(CAPACITY_PLAN_0001).toBeTruthy();
+  });
+
+  it('dadas as fixtures da organização quando contadas então há 4 feriados, 3 atos de suspensão, 4 folhas de jeton, 4 linhas, 2 incidentes, 3 amostras, 2 planos e 3 exportações', async () => {
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_holiday where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(4);
+    expect(
+      await count(
+        `select count(distinct state)::text as count from inf.rait_suspension_act where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_suspension_act where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(distinct state)::text as count from inf.rait_jeton_sheet where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(4);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_jeton_line where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(4);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_incident where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(2);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_quality_sample where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_capacity_plan where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(2);
+    expect(
+      await count(
+        `select count(distinct status)::text as count from inf.rait_export where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(SUSPENSION_ACT_0001).toBeTruthy();
+    expect(EXPORT_0001).toBeTruthy();
+  });
+});
diff --git a/backend/domains/inf/rait-session/tests/integration/rait-session-deltas-db.integration.spec.ts b/backend/domains/inf/rait-session/tests/integration/rait-session-deltas-db.integration.spec.ts
new file mode 100644
index 0000000..f36bfc8
--- /dev/null
+++ b/backend/domains/inf/rait-session/tests/integration/rait-session-deltas-db.integration.spec.ts
@@ -0,0 +1,166 @@
+// Contrato de banco dos deltas v1.1.0 da sessão do RAIT (backend/database/ddl/36-inf-rait-session.sql):
+// colunas novas de rait_session (modality, short_notice_ack), rait_agenda_item
+// (view_requested_by/view_due_on) e rait_minutes (published_at), checks correspondentes
+// (work/rounds/R-0006/contracts/CTG-0002-deltas.md §a.14, §e.5 item 7) e leitura cruzada de
+// tenant vazia sobre a fixture ajustada da ata assinada (…000034000001).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+const OTHER_TENANT = randomUUID();
+const SESSION_0003 = '00000000-0000-7000-8000-000030000003';
+const MINUTES_0001 = '00000000-0000-7000-8000-000034000001';
+const AGENDA_ITEM_0002 = '00000000-0000-7000-8000-000031000002';
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+async function asTenant<T>(
+  tenantId: string,
+  work: () => Promise<T>,
+): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      tenantId,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('inf.{rait_session,rait_agenda_item,rait_minutes} — deltas v1.1.0 (DDL 36)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada de rait_session/rait_minutes devolve 0 linhas', async () => {
+    for (const table of ['rait_session', 'rait_agenda_item', 'rait_minutes']) {
+      const theirs = await asTenant(OTHER_TENANT, () =>
+        count(`select count(*)::text as count from inf.${table}`),
+      );
+      expect(theirs).toBe(0);
+    }
+  });
+
+  it('dado um modality fora de presencial/virtual/hibrida quando uma sessão é inserida então ck_inf_rait_session_modality rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_session (tenant_id, judging_body, quorum_required, modality)
+           values ($1, 'jari', 3, 'remota')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma sessão com short_notice_ack_by preenchido e short_notice_ack false quando inserida então ck_inf_rait_session_short_notice_ack rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_session (tenant_id, judging_body, quorum_required, short_notice_ack_by, short_notice_ack)
+           values ($1, 'jari', 3, $2, false)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um item de pauta com view_requested_by preenchido e view_due_on nulo quando inserido então ck_inf_rait_agenda_item_view_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_agenda_item (tenant_id, session_id, case_id, position, rapporteur_member_id, view_requested_by)
+           values ($1, $2, $3, 99, $4, $5)`,
+          [
+            TENANT,
+            SESSION_0003,
+            '00000000-0000-7000-8000-000010000018',
+            '00000000-0000-7000-8000-000021000008',
+            randomUUID(),
+          ],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma ata publicada sem signed_at quando inserida então ck_inf_rait_minutes_published_needs_signature rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_minutes (tenant_id, session_id, content, published_at)
+           values ($1, $2, '{}'::jsonb, now())`,
+          [TENANT, '00000000-0000-7000-8000-000030000004'],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um rapporteur_member_id inexistente quando um item de pauta é inserido então fk_inf_rait_agenda_item_rapporteur rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_agenda_item (tenant_id, session_id, case_id, position, rapporteur_member_id)
+           values ($1, $2, $3, 98, $4)`,
+          [
+            TENANT,
+            SESSION_0003,
+            '00000000-0000-7000-8000-000010000018',
+            randomUUID(),
+          ],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dada a ata …0001 (sessão 03) quando lida então published_at está preenchido (ajuste do contrato: ata assinada publicada, T-R2)', async () => {
+    const result = await asOwner(() =>
+      client.query<{ published_at: Date | null; signed_at: Date | null }>(
+        `select published_at, signed_at from inf.rait_minutes where id = $1`,
+        [MINUTES_0001],
+      ),
+    );
+    expect(result.rows[0]?.published_at).toBeTruthy();
+    expect(result.rows[0]?.signed_at).toBeTruthy();
+  });
+
+  it('dada a sessão …0003 quando lida então modality é presencial (default v1.1.0) e short_notice_ack é false', async () => {
+    const result = await asOwner(() =>
+      client.query<{ modality: string; short_notice_ack: boolean }>(
+        `select modality, short_notice_ack from inf.rait_session where id = $1`,
+        [SESSION_0003],
+      ),
+    );
+    expect(result.rows[0]?.modality).toBe('presencial');
+    expect(result.rows[0]?.short_notice_ack).toBe(false);
+    expect(AGENDA_ITEM_0002).toBeTruthy();
+  });
+});
diff --git a/backend/domains/inf/rait-worklist/tests/integration/rait-worklist-deltas-db.integration.spec.ts b/backend/domains/inf/rait-worklist/tests/integration/rait-worklist-deltas-db.integration.spec.ts
new file mode 100644
index 0000000..66ab689
--- /dev/null
+++ b/backend/domains/inf/rait-worklist/tests/integration/rait-worklist-deltas-db.integration.spec.ts
@@ -0,0 +1,524 @@
+// Contrato de banco dos deltas v1.1.0 do worklist do RAIT (backend/database/ddl/35-inf-rait-worklist.sql):
+// RLS forçada e gatilho enforce_tenant_id nas 7 tabelas novas (rait_unit, rait_schedule,
+// rait_schedule_slot, rait_batch, rait_batch_item, rait_substitute_duty, rait_bench), leitura
+// cruzada entre tenants vazia (rait-test-strategy.md §4), checks de estado das máquinas b.1
+// (turma), b.2 (lote), b.3 (banca) e b.4 (disponibilidade), FKs novas e regras de unicidade do
+// contrato (work/rounds/R-0006/contracts/CTG-0002-deltas.md §a, §c, §e.5).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+const OTHER_TENANT = randomUUID();
+const NEW_TENANT_TABLES = [
+  'rait_unit',
+  'rait_schedule',
+  'rait_schedule_slot',
+  'rait_batch',
+  'rait_batch_item',
+  'rait_substitute_duty',
+  'rait_bench',
+];
+
+const UNIT_0001 = '00000000-0000-7000-8000-000026000001';
+const SCHEDULE_0001 = '00000000-0000-7000-8000-000027000001';
+const BATCH_0001 = '00000000-0000-7000-8000-000028000001';
+const BATCH_0002 = '00000000-0000-7000-8000-000028000002';
+const SUBSTITUTE_DUTY_0002 = '00000000-0000-7000-8000-000029000002';
+const BENCH_0001 = '00000000-0000-7000-8000-000035000001';
+const POOL_JARI = '00000000-0000-7000-8000-000020000002';
+const POOL_DEFESA = '00000000-0000-7000-8000-000020000001';
+const MEMBER_ANA = '00000000-0000-7000-8000-000021000001';
+const MEMBER_IARA = '00000000-0000-7000-8000-000021000009';
+const CASE_0018 = '00000000-0000-7000-8000-000010000018';
+const SESSION_0001 = '00000000-0000-7000-8000-000030000001';
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+async function asTenant<T>(
+  tenantId: string,
+  work: () => Promise<T>,
+): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      tenantId,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('inf.{rait_unit,rait_schedule,rait_schedule_slot,rait_batch,rait_batch_item,rait_substitute_duty,rait_bench} — deltas v1.1.0 (DDL 35)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('dadas as 7 tabelas novas do worklist quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
+    const result = await client.query<{
+      table_name: string;
+      relrowsecurity: boolean;
+      relforcerowsecurity: boolean;
+      policy_count: string;
+      trigger_count: string;
+    }>(
+      `select classes.relname as table_name, classes.relrowsecurity, classes.relforcerowsecurity,
+              count(distinct policies.policyname)::text as policy_count,
+              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
+         from pg_class classes
+         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
+         left join pg_policies policies on policies.schemaname = 'inf' and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
+         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
+        where namespaces.nspname = 'inf' and classes.relname = any($1::text[])
+        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity
+        order by classes.relname`,
+      [NEW_TENANT_TABLES],
+    );
+
+    expect(result.rows.map((row) => row.table_name)).toEqual(
+      [...NEW_TENANT_TABLES].sort(),
+    );
+    for (const row of result.rows) {
+      expect(row.relrowsecurity).toBe(true);
+      expect(row.relforcerowsecurity).toBe(true);
+      expect(row.policy_count).toBe('1');
+      expect(row.trigger_count).toBe('1');
+    }
+  });
+
+  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
+    const mine = await asTenant(TENANT, () =>
+      count('select count(*)::text as count from inf.rait_unit'),
+    );
+    expect(mine).toBe(3);
+
+    for (const table of NEW_TENANT_TABLES) {
+      const theirs = await asTenant(OTHER_TENANT, () =>
+        count(`select count(*)::text as count from inf.${table}`),
+      );
+      expect(theirs).toBe(0);
+    }
+  });
+
+  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.rait_unit (tenant_id, name, judging_body)
+           values ($1, 'turma efêmera', 'jari')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+  });
+
+  it('dado um estado fora de TURMA_ATIVA/TURMA_EM_CONSTITUICAO/TURMA_SUSPENSA quando uma turma é inserida então ck_inf_rait_unit_state rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_unit (tenant_id, name, judging_body, state)
+           values ($1, 'turma inválida', 'jari', 'ESTADO_INEXISTENTE')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um kind fora de escala_semanal/plantao_risco/escala_assinatura/escala_balcao quando uma escala é inserida então ck_inf_rait_schedule_kind rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end)
+           values ($1, $2, $3, 'kind_inexistente', '2026-10-01', '2026-10-07')`,
+          [TENANT, POOL_DEFESA, MEMBER_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um availability fora de DISPONIVEL/EM_PLANTAO/AUSENTE_PROGRAMADO quando uma escala é inserida então ck_inf_rait_schedule_availability rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end, availability)
+           values ($1, $2, $3, 'escala_semanal', '2026-11-01', '2026-11-07', 'AVAILABILITY_INEXISTENTE')`,
+          [TENANT, POOL_DEFESA, MEMBER_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma escala AUSENTE_PROGRAMADO sem absence_reason quando inserida então ck_inf_rait_schedule_absence_reason_required rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end, availability)
+           values ($1, $2, $3, 'escala_semanal', '2026-10-08', '2026-10-14', 'AUSENTE_PROGRAMADO')`,
+          [TENANT, POOL_DEFESA, MEMBER_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um availability fora de DISPONIVEL/EM_PLANTAO/AUSENTE_PROGRAMADO quando um slot é inserido então ck_inf_rait_schedule_slot_availability rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_schedule_slot (tenant_id, schedule_id, slot_on, availability)
+           values ($1, $2, '2026-10-01', 'AVAILABILITY_INEXISTENTE')`,
+          [TENANT, SCHEDULE_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um estado fora de LOTE_ABERTO/LOTE_SORTEADO/LOTE_ACEITO quando um lote é inserido então ck_inf_rait_batch_state rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_batch (tenant_id, pool_id, week_start, state)
+           values ($1, $2, '2026-10-05', 'ESTADO_INEXISTENTE')`,
+          [TENANT, POOL_JARI],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um lote LOTE_SORTEADO sem seed quando inserido então ck_inf_rait_batch_seed_required rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_batch (tenant_id, pool_id, week_start, state, drawn_at)
+           values ($1, $2, '2026-10-12', 'LOTE_SORTEADO', now())`,
+          [TENANT, POOL_JARI],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um item de lote com accepted_at e declined_at preenchidos quando inserido então ck_inf_rait_batch_item_outcome_exclusive rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position, member_id, accepted_at, declined_at, decline_kind)
+           values ($1, $2, $3, 99, $4, now(), now(), 'impedimento')`,
+          [TENANT, BATCH_0001, CASE_0018, MEMBER_IARA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um item de lote com claim_due_on e sem member_id quando inserido então ck_inf_rait_batch_item_claim_needs_member rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position, claim_due_on)
+           values ($1, $2, $3, 98, '2026-10-15')`,
+          [TENANT, BATCH_0001, CASE_0018],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um estado fora de BANCA_PREVISTA/BANCA_CONFIRMADA/BANCA_INSUFICIENTE quando uma banca é inserida então ck_inf_rait_bench_state rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_bench (tenant_id, session_id, state)
+           values ($1, $2, 'ESTADO_INEXISTENTE')`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dada uma banca BANCA_CONFIRMADA sem confirmed_at quando inserida então ck_inf_rait_bench_confirmed_complete rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_bench (tenant_id, session_id, state)
+           values ($1, $2, 'BANCA_CONFIRMADA')`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um kind fora de impedimento/suspeicao quando um impedimento é inserido então ck_inf_rait_impediment_kind rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_impediment (tenant_id, case_id, member_id, basis, kind)
+           values ($1, $2, $3, 'motivo', 'KIND_INEXISTENTE')`,
+          [TENANT, CASE_0018, MEMBER_IARA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um unit_id inexistente quando um pool é inserido então fk_inf_rait_pool_unit rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_pool (tenant_id, name, instance, circuit, strategy, unit_id)
+           values ($1, 'pool efêmero', 'jari', 2, 'round_robin', $2)`,
+          [TENANT, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um pool_id inexistente quando uma escala é inserida então fk_inf_rait_schedule_pool rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end)
+           values ($1, $2, $3, 'escala_semanal', '2026-10-01', '2026-10-07')`,
+          [TENANT, randomUUID(), MEMBER_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um batch_id inexistente quando um item de lote é inserido então fk_inf_rait_batch_item_batch rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position)
+           values ($1, $2, $3, 97)`,
+          [TENANT, randomUUID(), CASE_0018],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado um member_id inexistente quando um plantão de suplência é inserido então fk_inf_rait_substitute_duty_member rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_substitute_duty (tenant_id, session_id, member_id)
+           values ($1, $2, $3)`,
+          [TENANT, SESSION_0001, randomUUID()],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23503' });
+  });
+
+  it('dado o pool JARI-AM sem turma (unit_id nulo) quando um segundo pool sem turma da mesma instância é inserido então ux_inf_rait_pool_instance rejeita (índice parcial em unit_id is null)', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_pool (tenant_id, name, instance, circuit, strategy)
+           values ($1, 'pool jari efêmero', 'jari', 2, 'round_robin')`,
+          [TENANT],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dado um pool com turma quando um segundo pool da mesma instância e turma é inserido então ux_inf_rait_pool_instance_unit rejeita (linha efêmera com unit_id preenchido)', async () => {
+    await expect(
+      asOwner(async () => {
+        await client.query(
+          `insert into inf.rait_pool (tenant_id, name, instance, circuit, strategy, unit_id)
+           values ($1, 'pool com turma A', 'jari', 2, 'round_robin', $2)`,
+          [TENANT, UNIT_0001],
+        );
+        return client.query(
+          `insert into inf.rait_pool (tenant_id, name, instance, circuit, strategy, unit_id)
+           values ($1, 'pool com turma B', 'jari', 2, 'round_robin', $2)`,
+          [TENANT, UNIT_0001],
+        );
+      }),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dada a escala …0001 (Ana, escala_semanal, período 2026-09-14) quando uma segunda escala do mesmo membro/kind/período é inserida então ux_inf_rait_schedule_member_period rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end)
+           values ($1, $2, $3, 'escala_semanal', '2026-09-14', '2026-09-20')`,
+          [TENANT, POOL_DEFESA, MEMBER_ANA],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dado o lote semanal do pool JARI na semana 2026-09-07 quando um segundo lote semanal da mesma semana é inserido então ux_inf_rait_batch_pool_week rejeita (dois extraordinários na mesma semana não colidem)', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_batch (tenant_id, pool_id, week_start, kind)
+           values ($1, $2, '2026-09-07', 'semanal')`,
+          [TENANT, POOL_JARI],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+
+    await asOwner(async () => {
+      await client.query(
+        `insert into inf.rait_batch (tenant_id, pool_id, week_start, kind)
+         values ($1, $2, '2026-09-07', 'extraordinario')`,
+        [TENANT, POOL_JARI],
+      );
+      await client.query(
+        `insert into inf.rait_batch (tenant_id, pool_id, week_start, kind)
+         values ($1, $2, '2026-09-07', 'extraordinario')`,
+        [TENANT, POOL_JARI],
+      );
+    });
+    expect(BATCH_0002).toBeTruthy();
+  });
+
+  it('dado o caso 18 já no lote …0001 (position 1) quando o mesmo caso é inserido de novo no lote então ux_inf_rait_batch_item_case rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position)
+           values ($1, $2, $3, 2)`,
+          [TENANT, BATCH_0001, CASE_0018],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dada a position 1 já ocupada no lote …0001 quando outro item usa a mesma posição então ux_inf_rait_batch_item_position rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position)
+           values ($1, $2, $3, 1)`,
+          [TENANT, BATCH_0001, '00000000-0000-7000-8000-000010000019'],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dado o suplente João já designado para a sessão 02 quando o mesmo membro é designado de novo para a mesma sessão então ux_inf_rait_substitute_duty rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_substitute_duty (tenant_id, session_id, member_id)
+           values ($1, $2, $3)`,
+          [
+            TENANT,
+            '00000000-0000-7000-8000-000030000002',
+            '00000000-0000-7000-8000-000021000010',
+          ],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(SUBSTITUTE_DUTY_0002).toBeTruthy();
+  });
+
+  it('dada a banca …0001 já cadastrada para a sessão 01 quando uma segunda banca da mesma sessão é inserida então ux_inf_rait_bench_session rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.rait_bench (tenant_id, session_id)
+           values ($1, $2)`,
+          [TENANT, SESSION_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+    expect(BENCH_0001).toBeTruthy();
+  });
+
+  it('dadas as fixtures novas do worklist quando contadas então há 3 turmas, 3 escalas, 5 slots, 3 lotes, 4 itens de lote, 2 plantões de suplência e 4 bancas', async () => {
+    expect(
+      await count(
+        `select count(distinct state)::text as count from inf.rait_unit where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_schedule where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_schedule_slot where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(5);
+    expect(
+      await count(
+        `select count(distinct state)::text as count from inf.rait_batch where tenant_id = $1 and id in ($2, $3, '00000000-0000-7000-8000-000028000003')`,
+        [TENANT, BATCH_0001, BATCH_0002],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_batch_item where tenant_id = $1 and batch_id in ($2, $3, '00000000-0000-7000-8000-000028000003')`,
+        [TENANT, BATCH_0001, BATCH_0002],
+      ),
+    ).toBe(4);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_substitute_duty where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(2);
+    expect(
+      await count(
+        `select count(distinct state)::text as count from inf.rait_bench where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(3);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.rait_bench where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(4);
+  });
+
+  it('dado o membro …0010 (João) quando lido então is_substitute é true (ajuste §e.2 do contrato)', async () => {
+    const result = await asOwner(() =>
+      client.query<{ is_substitute: boolean }>(
+        `select is_substitute from inf.rait_pool_member where id = '00000000-0000-7000-8000-000021000010'`,
+      ),
+    );
+    expect(result.rows[0]?.is_substitute).toBe(true);
+  });
+
+  it('dado o impedimento …000023000001 (Iara, caso 11) quando lido então kind é impedimento e legal_basis está preenchido (ajuste §e.2 do contrato)', async () => {
+    const result = await asOwner(() =>
+      client.query<{ kind: string; legal_basis: string | null }>(
+        `select kind, legal_basis from inf.rait_impediment where id = '00000000-0000-7000-8000-000023000001'`,
+      ),
+    );
+    expect(result.rows[0]?.kind).toBe('impedimento');
+    expect(result.rows[0]?.legal_basis).toBeTruthy();
+  });
+});
diff --git a/backend/domains/shared/src/documents/document-kind.ts b/backend/domains/shared/src/documents/document-kind.ts
new file mode 100644
index 0000000..3debdec
--- /dev/null
+++ b/backend/domains/shared/src/documents/document-kind.ts
@@ -0,0 +1,22 @@
+// Catálogo de tipos de documento legal (ADR-0018 §Decision 2), especificado
+// pelo Architect em work/rounds/R-0006/contracts/CTG-0002-modules.md §f.1
+// (Art. 10: o Architect especifica, o Engineer escreve). Os 12 tokens são
+// canônicos — não são traduzidos nem abreviados (CODESTYLE §TypeScript).
+
+/** ADR-0018 Decision 2: um template versionado por tipo de documento. */
+export const DOCUMENT_KINDS = [
+  'AIT',
+  'NA',
+  'NP',
+  'EDITAL',
+  'DECISAO_DEFESA',
+  'PARECER',
+  'ATA',
+  'ATA_SORTEIO',
+  'DOCUMENTO_ARRECADACAO',
+  'ORDEM_RESTITUICAO',
+  'COMPROVANTE_PROTOCOLO',
+  'CERTIDAO',
+] as const;
+
+export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
diff --git a/backend/domains/shared/src/documents/documents-facade.ts b/backend/domains/shared/src/documents/documents-facade.ts
new file mode 100644
index 0000000..a063503
--- /dev/null
+++ b/backend/domains/shared/src/documents/documents-facade.ts
@@ -0,0 +1,60 @@
+// Assinatura da fachada de documentos (ADR-0018 §Decision 1 e 4),
+// especificada pelo Architect em
+// work/rounds/R-0006/contracts/CTG-0002-modules.md §f.3. Só tipos e
+// interface: nenhuma implementação, nenhuma dependência nova (a montagem de
+// `@stynx-nyx/pdf`, `@stynx-nyx/signature` e `@stynx-nyx/storage` nasce com
+// os comandos em R-0007). Nenhum domínio chama renderer ou provedor de
+// assinatura diretamente — todos passam por esta fachada.
+import type { DetranRole } from '../roles.js';
+import type { DocumentKind } from './document-kind.js';
+import type { PdfaConformance } from './signature-policy.js';
+
+/** ADR-0018 Decision 4: documento armazenado é imutável. */
+export interface RenderedDocument {
+  readonly documentId: string;
+  readonly kind: DocumentKind;
+  readonly storageKey: string;
+  /** SHA-256 em 64 hex (ADR-0018 Decision 4). */
+  readonly contentHash: string;
+  readonly pdfaConformance: PdfaConformance | null;
+  readonly supersedesDocumentId: string | null;
+}
+
+export interface SignedDocument extends RenderedDocument {
+  readonly signatureRef: string;
+}
+
+export interface SealedDocument extends SignedDocument {
+  readonly pdfaConformance: PdfaConformance;
+  readonly sealedAt: string;
+}
+
+export interface DocumentSigner {
+  readonly role: DetranRole;
+  readonly personId: string;
+  /** Certificado apresentado; RAIT.SIGNATURE_CERT_MISMATCH quando não confere. */
+  readonly certificateRef: string | null;
+}
+
+export interface DocumentsFacade {
+  render(
+    templateKey: string,
+    data: Record<string, unknown>,
+  ): Promise<RenderedDocument>;
+  sign(documentId: string, signer: DocumentSigner): Promise<SignedDocument>;
+  seal(documentId: string): Promise<SealedDocument>;
+}
+
+/**
+ * Três códigos já existentes no catálogo (rait-error-catalog.md §3.5-§3.6),
+ * levantados pela fachada (ADR-0018 §Consequências) — nenhum código novo
+ * nasce desta especificação.
+ */
+export const DOCUMENT_ERROR_CODES = {
+  SIGNATURE_FAILED: 'RAIT.SIGNATURE_FAILED',
+  SIGNATURE_CERT_MISMATCH: 'RAIT.SIGNATURE_CERT_MISMATCH',
+  DOCUMENT_HASH_MISMATCH: 'RAIT.DOCUMENT_HASH_MISMATCH',
+} as const;
+
+export type DocumentErrorCode =
+  (typeof DOCUMENT_ERROR_CODES)[keyof typeof DOCUMENT_ERROR_CODES];
diff --git a/backend/domains/shared/src/documents/documents.spec.ts b/backend/domains/shared/src/documents/documents.spec.ts
new file mode 100644
index 0000000..58e2f96
--- /dev/null
+++ b/backend/domains/shared/src/documents/documents.spec.ts
@@ -0,0 +1,136 @@
+// Teste de tipos da fachada de documentos especificada em
+// work/rounds/R-0006/contracts/CTG-0002-modules.md §f (ADR-0018 §Decision 1-4). A fachada em si
+// é escrita pelo Engineer em TASK-0007 (Art. 10: o Architect especifica, o Engineer escreve) —
+// este arquivo fica vermelho nesta entrega (módulo ausente) e prova, quando os arquivos
+// existirem, que os 12 tokens de DocumentKind, a forma de SignaturePolicy, a assinatura dos três
+// métodos de DocumentsFacade e as três chaves de DOCUMENT_ERROR_CODES batem com a especificação.
+import { describe, expect, expectTypeOf, it } from 'vitest';
+
+import type { DetranRole } from '../roles.js';
+import {
+  DOCUMENT_ERROR_CODES,
+  DOCUMENT_KINDS,
+  type DocumentErrorCode,
+  type DocumentKind,
+  type DocumentsFacade,
+  type DocumentSigner,
+  type PadesLevel,
+  type PdfaConformance,
+  type RenderedDocument,
+  type SealedDocument,
+  type SignaturePolicy,
+  type SignedDocument,
+  type SignerRequirement,
+} from '../documents/index.js';
+
+describe('DocumentKind (ADR-0018 §Decision 2 — 12 tokens canônicos, sem tradução)', () => {
+  it('dado o catálogo DOCUMENT_KINDS quando lido então tem exatamente os 12 tokens, na ordem da especificação', () => {
+    expect(DOCUMENT_KINDS).toEqual([
+      'AIT',
+      'NA',
+      'NP',
+      'EDITAL',
+      'DECISAO_DEFESA',
+      'PARECER',
+      'ATA',
+      'ATA_SORTEIO',
+      'DOCUMENTO_ARRECADACAO',
+      'ORDEM_RESTITUICAO',
+      'COMPROVANTE_PROTOCOLO',
+      'CERTIDAO',
+    ]);
+    expect(DOCUMENT_KINDS).toHaveLength(12);
+  });
+
+  it('dado o tipo DocumentKind quando comparado então é a união literal dos 12 tokens de DOCUMENT_KINDS', () => {
+    expectTypeOf<DocumentKind>().toEqualTypeOf<
+      (typeof DOCUMENT_KINDS)[number]
+    >();
+    expectTypeOf<'AIT'>().toMatchTypeOf<DocumentKind>();
+    expectTypeOf<'CERTIDAO'>().toMatchTypeOf<DocumentKind>();
+  });
+});
+
+describe('SignaturePolicy (ADR-0018 §Decision 3 — política é dado, não código)', () => {
+  it('dado o tipo SignerRequirement quando comparado então exige role (DetranRole) e minCount (number)', () => {
+    expectTypeOf<SignerRequirement>().toMatchTypeOf<{
+      readonly role: DetranRole;
+      readonly minCount: number;
+    }>();
+  });
+
+  it('dado o tipo SignaturePolicy quando comparado então tem kind, signers, padesLevel, tsaRequired, pdfaRequired e govBrLevel', () => {
+    expectTypeOf<SignaturePolicy>().toMatchTypeOf<{
+      readonly kind: DocumentKind;
+      readonly signers: readonly SignerRequirement[];
+      readonly padesLevel: PadesLevel;
+      readonly tsaRequired: boolean;
+      readonly pdfaRequired: boolean;
+      readonly govBrLevel: string | null;
+    }>();
+  });
+
+  it('dado o tipo PadesLevel quando comparado então é a união de um membro PAdES-B-LT (única exigência com fonte no corpus)', () => {
+    expectTypeOf<PadesLevel>().toEqualTypeOf<'PAdES-B-LT'>();
+  });
+});
+
+describe('DocumentsFacade (ADR-0018 §Decision 1 e 4 — render/sign/seal, tenant fora da assinatura)', () => {
+  it('dado o tipo DocumentsFacade quando comparado então render/sign/seal têm exatamente a assinatura da especificação', () => {
+    expectTypeOf<DocumentsFacade['render']>().parameters.toEqualTypeOf<
+      [templateKey: string, data: Record<string, unknown>]
+    >();
+    expectTypeOf<DocumentsFacade['render']>().returns.toEqualTypeOf<
+      Promise<RenderedDocument>
+    >();
+    expectTypeOf<DocumentsFacade['sign']>().parameters.toEqualTypeOf<
+      [documentId: string, signer: DocumentSigner]
+    >();
+    expectTypeOf<DocumentsFacade['sign']>().returns.toEqualTypeOf<
+      Promise<SignedDocument>
+    >();
+    expectTypeOf<DocumentsFacade['seal']>().parameters.toEqualTypeOf<
+      [documentId: string]
+    >();
+    expectTypeOf<DocumentsFacade['seal']>().returns.toEqualTypeOf<
+      Promise<SealedDocument>
+    >();
+  });
+
+  it('dado o tipo RenderedDocument quando comparado então tem documentId, kind, storageKey, contentHash, pdfaConformance e supersedesDocumentId', () => {
+    expectTypeOf<RenderedDocument>().toMatchTypeOf<{
+      readonly documentId: string;
+      readonly kind: DocumentKind;
+      readonly storageKey: string;
+      readonly contentHash: string;
+      readonly pdfaConformance: PdfaConformance | null;
+      readonly supersedesDocumentId: string | null;
+    }>();
+  });
+
+  it('dado o tipo SealedDocument quando comparado então estende SignedDocument com pdfaConformance obrigatório e sealedAt', () => {
+    expectTypeOf<SealedDocument>().toMatchTypeOf<
+      SignedDocument & {
+        readonly pdfaConformance: PdfaConformance;
+        readonly sealedAt: string;
+      }
+    >();
+  });
+});
+
+describe('DOCUMENT_ERROR_CODES (ADR-0018 §Consequências — códigos já existentes no catálogo)', () => {
+  it('dado o catálogo DOCUMENT_ERROR_CODES quando lido então tem exatamente as três chaves do catálogo (rait-error-catalog.md §3.5-§3.6)', () => {
+    expect(DOCUMENT_ERROR_CODES).toEqual({
+      SIGNATURE_FAILED: 'RAIT.SIGNATURE_FAILED',
+      SIGNATURE_CERT_MISMATCH: 'RAIT.SIGNATURE_CERT_MISMATCH',
+      DOCUMENT_HASH_MISMATCH: 'RAIT.DOCUMENT_HASH_MISMATCH',
+    });
+    expect(Object.keys(DOCUMENT_ERROR_CODES)).toHaveLength(3);
+  });
+
+  it('dado o tipo DocumentErrorCode quando comparado então é a união dos três valores de DOCUMENT_ERROR_CODES', () => {
+    expectTypeOf<DocumentErrorCode>().toEqualTypeOf<
+      (typeof DOCUMENT_ERROR_CODES)[keyof typeof DOCUMENT_ERROR_CODES]
+    >();
+  });
+});
diff --git a/backend/domains/shared/src/documents/index.ts b/backend/domains/shared/src/documents/index.ts
new file mode 100644
index 0000000..8f36892
--- /dev/null
+++ b/backend/domains/shared/src/documents/index.ts
@@ -0,0 +1,6 @@
+// Barril da fachada de documentos (ADR-0018 §Decision 1-4), reexportado por
+// `@detran/shared` via `export * from './documents/index.js';` em
+// `../index.ts`. work/rounds/R-0006/contracts/CTG-0002-modules.md §f.4.
+export * from './document-kind.js';
+export * from './signature-policy.js';
+export * from './documents-facade.js';
diff --git a/backend/domains/shared/src/documents/signature-policy.ts b/backend/domains/shared/src/documents/signature-policy.ts
new file mode 100644
index 0000000..f9e0ccb
--- /dev/null
+++ b/backend/domains/shared/src/documents/signature-policy.ts
@@ -0,0 +1,36 @@
+// Tipo da política de assinatura (ADR-0018 §Decision 3), especificado pelo
+// Architect em work/rounds/R-0006/contracts/CTG-0002-modules.md §f.2. A
+// política é dado, não código: a tabela `inf.signature_policy` nasce em
+// R-0008 (frente dona de `inf/normative`); aqui só o tipo do dado que a
+// fachada lê.
+import type { DetranRole } from '../roles.js';
+import type { DocumentKind } from './document-kind.js';
+
+/**
+ * ADR-0018 Decision 3: a única exigência de nível com fonte no corpus é
+ * PAdES-B-LT + TSA para decisões e atas (steering A.8). Outros níveis são
+ * OD proposta — a união cresce quando a decisão existir.
+ */
+export type PadesLevel = 'PAdES-B-LT';
+
+/** Conformidade validada por @stynx-nyx/pdf-a (ADR-0018 Context). */
+export type PdfaConformance = 'PDF/A-2b';
+
+export interface SignerRequirement {
+  readonly role: DetranRole;
+  readonly minCount: number;
+}
+
+export interface SignaturePolicy {
+  readonly kind: DocumentKind;
+  readonly signers: readonly SignerRequirement[];
+  readonly padesLevel: PadesLevel;
+  readonly tsaRequired: boolean;
+  readonly pdfaRequired: boolean;
+  /**
+   * Nível gov.br exigido do cidadão (ADR-0018 Decision 3, por WF-PORTAL-002).
+   * O vocabulário de níveis é `source_pending` (OD proposta 3): tipado como
+   * string até a decisão, nulo quando o ato não é de cidadão.
+   */
+  readonly govBrLevel: string | null;
+}
diff --git a/backend/domains/shared/src/index.ts b/backend/domains/shared/src/index.ts
index 4a45173..58cf428 100644
--- a/backend/domains/shared/src/index.ts
+++ b/backend/domains/shared/src/index.ts
@@ -1,4 +1,5 @@
 export * from './decorators.js';
+export * from './documents/index.js';
 export * from './policy.js';
 export * from './policy.guard.js';
 export * from './roles.js';
diff --git a/docs/framework/arch/rait-build-pack.md b/docs/framework/arch/rait-build-pack.md
index 0dc921d..fbf6f5b 100644
--- a/docs/framework/arch/rait-build-pack.md
+++ b/docs/framework/arch/rait-build-pack.md
@@ -3,7 +3,7 @@ id: ARCH-RAIT-BUILD-PACK
 title: Pacote de construção do RAIT — definições para a orquestra de agentes (modelo de dados, rotas, payloads, telas, formulários, hierarquia)
 status: draft
 apps: [rait]
-updated: 2026-09-12
+updated: 2026-09-14
 ---

 # Pacote de construção do RAIT
@@ -63,18 +63,25 @@ Subentrega de parâmetros concluída em R-0004 / PR #37: `BP-OPS-PARAMETER-001`,
 `ops.parameter`, catálogo/seed, serviço e comando compartilhados. Os demais itens de WP-A abaixo
 continuam pendentes e não são implicitamente fechados por essa subentrega.

-| Blueprint (novo/alterado)                     | Entidades                                                                                                                                                                                                                                                                                                                                                                                                                                               | Observações                                                                                                        |
-| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
-| `BP-INF-INFRACTION-001` (novo)                | `infraction` (state FK `infraction_state_ref`, substate, subject_kind, `efeito_suspensivo`, `pago`, `faixa`, `pontuacao_registrada`, `motivo_encerramento`, `bandeira_risco`, `ait_id`), `infraction_notice` (NA/NP/decisão: canal FK, expedição, ciência, data-limite impressa), `infraction_timer` (code FK `infraction_timer_ref`, started_on, due_on, ceiling_on, status, suspended_by_act), `infraction_event` (append-only), `infraction_payment` | depende de `@detran/inf-ait`, `@detran/inf-rait-case`; check de `state` = mesmo conjunto de `infraction_state_ref` |
-| `BP-INF-RAIT-WORKLIST-001` v1.1.0             | + `rait_unit` (turma: estado `TURMA_*`, coordenador), `rait_schedule`/`rait_schedule_slot` (escala, plantão, `WIP`), `rait_batch`/`rait_batch_item` (lote de sorteio, semente, ata, `T-CLAIM`), `rait_substitute_duty` (plantão de suplência), `rait_impediment.kind` + `decided_by`, `rait_bench` (banca da sessão)                                                                                                                                    | `WF-RAIT-004` §10                                                                                                  |
-| `BP-INF-RAIT-SESSION-001` v1.1.0              | `rait_session.modality`, `short_notice_ack`; `rait_agenda_item.view_requested_by/view_due_on`; `rait_minutes.published_at`                                                                                                                                                                                                                                                                                                                              | OD-102, OD-103, OD-106                                                                                             |
-| `BP-INF-RAIT-CASE-001` v1.1.0                 | `rait_case.legal_priority`, `unit_id`, `version`; `rait_pending_content`; `rait_redirect`; `rait_draft` (minuta versionada, autor)                                                                                                                                                                                                                                                                                                                      | UC-RAIT-027/028; IU-RAIT-001 §3                                                                                    |
-| `BP-INF-RAIT-ORG-001` (novo)                  | parâmetros via `ops.parameter` compartilhado (ADR-0021; antes `rait_parameter` versionado, `legal_readonly`, `source_pending`), `rait_holiday`, `rait_suspension_act`, `rait_jeton_sheet`/`rait_jeton_line`, `rait_incident`, `rait_quality_sample`, `rait_capacity_plan`, `rait_export`                                                                                                                                                                | UC-RAIT-022/025/036/038/042/043                                                                                    |
-| `BP-INF-RAIT-FINANCE-001` (novo)              | `rait_collection_document`, `rait_payment`, `rait_refund_order`, `rait_debt_handoff`                                                                                                                                                                                                                                                                                                                                                                    | UC-RAIT-032…035; faixas FK `infraction_payment_tier_ref`                                                           |
-| `BP-INF-RAIT-INTEGRATION-001` (novo, leitura) | projeções da `integration.outbox` por sistema (`renainf`, `renach`, `sne`), `rait_reconciliation`                                                                                                                                                                                                                                                                                                                                                       | ADR-0003                                                                                                           |
-
-Também em WP-A: manter os novos DDL gerados na lista de `backend/database/apply.sh` (os `34…37` já
-foram incluídos em 2026-09-13) e acrescentar fixtures por estado em `backend/database/seed/`. Gate: `pnpm blueprints:check`, `verify:rls-ddl`,
+| Blueprint (novo/alterado)            | Entidades                                                                                                                                                                                                                                                                                                                                       | Observações                                                                                                                                                                   |
+| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| `BP-INF-INFRACTION-001` (novo)       | `infraction` (state FK `infraction_state_ref`, substate, subject_kind, `suspensive_effect`, `paid`, `payment_tier`, `points_registered`, `closure_motive`, `risk_flag`, `ait_id`), `infraction_timer` (code FK `infraction_timer_ref`, `started_on`, `due_on`, `ceiling_on`, `status`, `suspended_by_act_id`), `infraction_event` (append-only) | depende de `@detran/inf-ait`, `@detran/inf-rait-case`; check de `state` = mesmo conjunto de `infraction_state_ref`; avisos e pagamentos não são entidade do agregado (M1, M2) |
+| `BP-INF-NOTIFICATION-001` (novo)     | `notice` (NA/NP/decisão: canal FK, expedição, ciência, data-limite impressa), `notice_acknowledgement`, `notice_delivery_attempt` (append-only)                                                                                                                                                                                                 | ADR-0016 §1; depende de `@detran/inf-deadlines`                                                                                                                               |
+| `BP-INF-RAIT-WORKLIST-001` v1.1.0    | + `rait_unit` (turma: estado `TURMA_*`, coordenador), `rait_schedule`/`rait_schedule_slot` (escala, plantão, `WIP`), `rait_batch`/`rait_batch_item` (lote de sorteio, semente, ata, `T-CLAIM`), `rait_substitute_duty` (plantão de suplência), `rait_impediment.kind` + `decided_by`, `rait_bench` (banca da sessão)                            | `WF-RAIT-004` §10                                                                                                                                                             |
+| `BP-INF-RAIT-SESSION-001` v1.1.0     | `rait_session.modality`, `short_notice_ack`; `rait_agenda_item.view_requested_by/view_due_on`; `rait_minutes.published_at`                                                                                                                                                                                                                      | OD-102, OD-103, OD-106                                                                                                                                                        |
+| `BP-INF-RAIT-CASE-001` v1.1.0        | `rait_case.legal_priority`, `unit_id`, `version`; `rait_pending_content`; `rait_redirect`; `rait_draft` (minuta versionada, autor)                                                                                                                                                                                                              | UC-RAIT-027/028; IU-RAIT-001 §3                                                                                                                                               |
+| `BP-INF-RAIT-ORG-001` (novo)         | parâmetros via `ops.parameter` compartilhado (ADR-0021; antes `rait_parameter` versionado, `legal_readonly`, `source_pending`), `rait_holiday`, `rait_suspension_act`, `rait_jeton_sheet`/`rait_jeton_line`, `rait_incident`, `rait_quality_sample`, `rait_capacity_plan`, `rait_export`                                                        | UC-RAIT-022/025/036/038/042/043                                                                                                                                               |
+| `BP-INF-COLLECTION-001` (novo)       | `collection_document`, `payment`, `refund_order`, `debt_handoff` (sem prefixo `rait_`, ADR-0017 §1, M2)                                                                                                                                                                                                                                         | UC-RAIT-032…035; faixas FK `infraction_payment_tier_ref`                                                                                                                      |
+| `BP-INF-RAIT-INTEGRATION-001` (novo) | `rait_reconciliation`                                                                                                                                                                                                                                                                                                                           | UC-RAIT-029/031; projeções da `integration.outbox` por sistema (`renainf`, `renach`, `sne`) ficam para WP-P (ADR-0020, M10)                                                   |
+
+Também em WP-A: `apply.sh` aplica todo `ddl/*.sql` em ordem lexicográfica — nada a listar
+manualmente. DDL reais desta rodada (R-0006): `38-inf-infraction.sql`, `39-inf-rait-org.sql`,
+`57-inf-collection.sql`, `58-inf-rait-integration.sql`, `59-inf-notification.sql` (40–56 e 60
+ocupados por `ch`/`portal`); e acrescentar fixtures por estado em `backend/database/seed/`.
+Executado em R-0006 (CTG-0001: PR #39; CTG-0002: PR pendente); ficou fora: projeções da
+`integration.outbox` por consumidor e migração de `rait_communication` para projeção de
+`inf.notice` (M10 → WP-P); tabela `signature_policy` e a generalização de
+`normative_document_template` (→ R-0008). Gate: `pnpm blueprints:check`, `verify:rls-ddl`,
 `verify:lifecycle-vocabulary`, `backend:db:apply` em banco limpo.

 ### WP-B — Rotas faltantes no backend (Engineer; Architect revisa guardas)
diff --git a/docs/framework/arch/rait-deadline-engine.md b/docs/framework/arch/rait-deadline-engine.md
index c7cc6a0..fb7ffa2 100644
--- a/docs/framework/arch/rait-deadline-engine.md
+++ b/docs/framework/arch/rait-deadline-engine.md
@@ -3,7 +3,7 @@ id: ARCH-RAIT-DEADLINES
 title: Motor de prazos do RAIT e da infração — contagem, calendário, timers, suspensão e vencimento idempotente
 status: draft
 apps: [rait, portal, dashboard]
-updated: 2026-09-13
+updated: 2026-09-14
 ---

 # Motor de prazos (`DeadlineEngine`)
@@ -15,8 +15,10 @@ módulos consomem datas prontas (`RN-RAIT-005`, `RN-RAIT-105`).

 ## 1. Posição e fronteiras

-- Pacote: `backend/domains/inf/rait-case/src/handwritten/deadlines/` (compartilhado com o futuro
-  módulo `infraction` via `@detran/inf-rait-case`), exportado por `handwrittenExports`.
+- Pacote: `@detran/inf-deadlines`, manuscrito em `backend/domains/inf/deadlines` (glob
+  `backend/domains/*/*` do workspace; ADR-0016 §2, M3), consumido como dependência de pacote por
+  `infraction`, `notification` e `rait-case`; não tem blueprint, logo nada de
+  `handwrittenExports`.
 - Entradas: catálogo (`infraction_timer_ref`), calendário (`rait_holiday`, WP-A), parâmetros
   versionados (`ops.parameter`, ADR-0021), eventos de domínio.
 - Saídas: linhas em `rait_deadline` (caso) e `infraction_timer` (infração, WP-A); `rait_clock` +
diff --git a/docs/framework/arch/rait-fixtures.md b/docs/framework/arch/rait-fixtures.md
index 43fedb0..dab029e 100644
--- a/docs/framework/arch/rait-fixtures.md
+++ b/docs/framework/arch/rait-fixtures.md
@@ -3,7 +3,7 @@ id: ARCH-RAIT-FIXTURES
 title: Fixtures canônicas do RAIT — personas, tenant, casos por estado, sessões, relógios e calendário
 status: draft
 apps: [rait]
-updated: 2026-09-13
+updated: 2026-09-14
 ---

 # Fixtures canônicas
@@ -106,7 +106,7 @@ Feriados nacionais 2026, pontos facultativos, feriado estadual (05/09) e municip
 ## 7. Como usar

 ```bash
-DB_NAME=detran_dev pnpm backend:db:reset          # DDL completo (00…37 + RLS)
+DB_NAME=detran_dev pnpm backend:db:reset          # DDL completo (00…60 + RLS)
 bash backend/database/seed.sh                     # fixtures (idempotente)
````

@@ -115,8 +115,16 @@ Testes `integration`/`e2e` assumem a seed aplicada; testes `unit` e do frontend
crie um segundo tenant efêmero com `randomUUID()` (padrão de `audit-persistence.integration.spec.ts`);
nunca altere o tenant das fixtures.

-## 8. O que ainda não está nas fixtures (depende de WP-A)
-

-Infração (agregado), notificações NA/NP e timers da infração, escala e plantão, lote de sorteio,
-turma, parâmetros versionados, atos de suspensão, jeton, documentos de arrecadação e outbox de
-integração. Quando o blueprint existir, a fixture correspondente entra no mesmo PR (uma por estado).
+## 8. O que passou a existir (WP-A, R-0006) e o que ainda falta +
+Infração (agregado, `30-fixtures-infraction.sql`: `infraction`, `infraction_timer`, +`infraction_event`, avisos `inf.notice*`), escala/plantão/lote de sorteio/turma
+(`20-fixtures-rait.sql`: `rait_schedule`/`rait_schedule_slot`, `rait_substitute_duty`, +`rait_batch`/`rait_batch_item`, `rait_unit`), organização (`40-fixtures-rait-org.sql`: +`rait_holiday`, `rait_suspension_act`, `rait_jeton_sheet`/`rait_jeton_line`, `rait_incident`, +`rait_quality_sample`, `rait_capacity_plan`, `rait_export`), financeiro
+(`50-fixtures-collection.sql`: `collection_document`, `payment`, `refund_order`, `debt_handoff`)
+e integração (`60-fixtures-rait-integration.sql`: `rait_reconciliation`) já têm fixture por
+estado. Parâmetros versionados passaram a `ops.parameter` (ADR-0021, R-0004), fora do escopo de
+fixtures por estado do RAIT. Fica fora: projeção da `integration.outbox` por sistema — deferida a
+WP-P (ADR-0020, M10).
diff --git a/docs/framework/blueprints/BP-INF-COLLECTION-001.json b/docs/framework/blueprints/BP-INF-COLLECTION-001.json
new file mode 100644
index 0000000..165e47d
--- /dev/null
+++ b/docs/framework/blueprints/BP-INF-COLLECTION-001.json
@@ -0,0 +1,398 @@
+{

- "schemaVersion": "1.0.0",
- "id": "BP-INF-COLLECTION-001",
- "module": {
- "name": "Collection",
- "namespace": "inf",
- "version": "1.0.0",
- "ddlFile": "57-inf-collection.sql",
- "dependencies": {
-      "@detran/inf-infraction": "workspace:*"
- },
- "devDependencies": {
-      "@types/pg": "^8.15.4",
-      "pg": "^8.20.0"
- },
- "testAliases": [
-      {
-        "package": "@detran/shared",
-        "target": "../../shared/src/index.ts"
-      },
-      {
-        "package": "@detran/inf-infraction",
-        "target": "../infraction/src/index.ts"
-      }
- ],
- "handwrittenProviders": [
-      {
-        "target": "handwritten/index",
-        "symbol": "BANK_PORT"
-      }
- ],
- "handwrittenExports": ["handwritten/index"],
- "owners": ["detran-inf"],
- "description": "Modulo de arrecadacao (ADR-0017 Decision 1): unico escritor do documento de arrecadacao (UC-RAIT-032), do pagamento conciliado do retorno bancario (UC-RAIT-035), da ordem de restituicao corrigida (UC-RAIT-033) e do encaminhamento do credito a Fazenda (UC-RAIT-034). Dinheiro nunca muda estado direto: o agregado da infracao decide (ADR-0017 Decision 2; [WF-INF-003] secao 2 linhas 12 a 16 e 29). O banco e adapter interno do modulo em ports/bank, mock-first (ADR-0017 Decision 4); cartao e parcelamento estao fora de escopo (DT-031)."
- },
- "database": {
- "entities": [
-      {
-        "name": "CollectionDocument",
-        "table": "collection_document",
-        "primaryKey": ["id"],
-        "description": "Documento proprio de arrecadacao por faixa e fase — UC-RAIT-032 (fluxo 1 a 4, AC-RAIT-032-1 data-limite unica, AC-RAIT-032-3 duas casas truncadas) e ADR-0017 Decision 1. tier referencia inf.infraction_payment_tier_ref e issued_for_state a fase da infracao para a qual foi emitido (RAIT.COLLECTION_PHASE_INVALID e a guarda de comando). A faixa desconto_40_fora_sne existe no vocabulario e fica desligada pela flag collection.discount_40_outside_sne=false (steering H.53; RAIT.COLLECTION_DISCOUNT_SNE_ONLY). Estados minusculos derivados de ADR-0017 Decision 2 (emitir ou invalidar por fase) e do fluxo 3 e 4 do UC (decisao M12).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "infraction_id", "type": "uuid" },
-          { "name": "tier", "type": "varchar(40)" },
-          { "name": "amount", "type": "numeric(12,2)" },
-          { "name": "barcode", "type": "varchar(60)", "nullable": true },
-          { "name": "pix_reference", "type": "varchar(140)", "nullable": true },
-          { "name": "valid_until", "type": "date" },
-          { "name": "issued_for_state", "type": "varchar(40)" },
-          { "name": "status", "type": "varchar(20)", "default": "'emitido'" },
-          { "name": "issued_at", "type": "timestamptz", "default": "now()" },
-          { "name": "issued_by", "type": "uuid", "nullable": true },
-          { "name": "document_id", "type": "uuid", "nullable": true },
-          {
-            "name": "supersedes_document_id",
-            "type": "uuid",
-            "nullable": true
-          },
-          { "name": "invalidated_at", "type": "timestamptz", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_collection_document_active",
-            "columns": ["tenant_id", "infraction_id"],
-            "unique": true,
-            "where": "status = 'emitido'"
-          },
-          {
-            "name": "ux_inf_collection_document_barcode",
-            "columns": ["tenant_id", "barcode"],
-            "unique": true,
-            "where": "barcode is not null"
-          },
-          {
-            "name": "ix_inf_collection_document_due",
-            "columns": ["tenant_id", "valid_until"],
-            "where": "status = 'emitido'"
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_collection_document_tier",
-            "expression": "tier in ('nenhum','desconto_80','desconto_60_reconhecimento','desconto_40_fora_sne','integral_juros','restituido')"
-          },
-          {
-            "name": "ck_inf_collection_document_issued_for_state",
-            "expression": "issued_for_state in ('AIT_LAVRADO','NOTIFICADO_AUTUACAO','DEFESA_EM_JULGAMENTO','PENALIDADE_A_APLICAR','NOTIFICADO_PENALIDADE','RECURSO_1A_INSTANCIA','AGUARDANDO_RECURSO_2A','RECURSO_2A_INSTANCIA','INSTANCIA_ENCERRADA','ARQUIVADO','CANCELADO_POS_INTEGRACAO','AIT_CANCELADO','EXTINTO_DECADENCIA','EXTINTO_PRESCRICAO','CANCELADO_DEFINITIVO')"
-          },
-          {
-            "name": "ck_inf_collection_document_status",
-            "expression": "status in ('emitido','pago','vencido','invalidado')"
-          },
-          {
-            "name": "ck_inf_collection_document_amount_positive",
-            "expression": "amount > 0"
-          },
-          {
-            "name": "ck_inf_collection_document_reference_required",
-            "expression": "barcode is not null or pix_reference is not null"
-          },
-          {
-            "name": "ck_inf_collection_document_invalidated_complete",
-            "expression": "status <> 'invalidado' or invalidated_at is not null"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_collection_document_infraction",
-            "columns": ["infraction_id"],
-            "references": { "table": "inf.infraction", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_collection_document_tier",
-            "columns": ["tier"],
-            "references": {
-              "table": "inf.infraction_payment_tier_ref",
-              "columns": ["code"]
-            }
-          },
-          {
-            "name": "fk_inf_collection_document_state",
-            "columns": ["issued_for_state"],
-            "references": {
-              "table": "inf.infraction_state_ref",
-              "columns": ["code"]
-            }
-          },
-          {
-            "name": "fk_inf_collection_document_supersedes",
-            "columns": ["supersedes_document_id"],
-            "references": {
-              "table": "inf.collection_document",
-              "columns": ["id"]
-            }
-          }
-        ]
-      },
-      {
-        "name": "Payment",
-        "table": "payment",
-        "primaryKey": ["id"],
-        "description": "Pagamento vindo do retorno bancario e sua conciliacao — UC-RAIT-035 (fluxo 1 casamento por documento, valor e data; AC-RAIT-035-3 rastreabilidade) e ADR-0017 Decision 1. Retorno sem documento correspondente fica sem document_id e sem matched_at (RAIT.PAYMENT_UNMATCHED, catalogo secao 3.11); reversed_at registra o estorno que publica PAGAMENTO_ESTORNADO (ADR-0017 Decision 2). O pagamento nao muda estado da infracao: o agregado decide ([WF-INF-003] secao 2 linhas 12 a 16 e 29).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "document_id", "type": "uuid", "nullable": true },
-          { "name": "bank_reference", "type": "varchar(80)" },
-          { "name": "paid_on", "type": "date" },
-          { "name": "amount", "type": "numeric(12,2)" },
-          { "name": "tier_applied", "type": "varchar(40)", "nullable": true },
-          { "name": "received_at", "type": "timestamptz", "default": "now()" },
-          { "name": "matched_at", "type": "timestamptz", "nullable": true },
-          { "name": "reversed_at", "type": "timestamptz", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_payment_bank_reference",
-            "columns": ["tenant_id", "bank_reference"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_payment_unmatched",
-            "columns": ["tenant_id", "received_at"],
-            "where": "matched_at is null"
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_payment_tier_applied",
-            "expression": "tier_applied is null or tier_applied in ('nenhum','desconto_80','desconto_60_reconhecimento','desconto_40_fora_sne','integral_juros','restituido')"
-          },
-          {
-            "name": "ck_inf_payment_amount_positive",
-            "expression": "amount > 0"
-          },
-          {
-            "name": "ck_inf_payment_match_needs_document",
-            "expression": "matched_at is null or document_id is not null"
-          },
-          {
-            "name": "ck_inf_payment_tier_needs_match",
-            "expression": "tier_applied is null or matched_at is not null"
-          },
-          {
-            "name": "ck_inf_payment_reversal_needs_match",
-            "expression": "reversed_at is null or matched_at is not null"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_payment_document",
-            "columns": ["document_id"],
-            "references": {
-              "table": "inf.collection_document",
-              "columns": ["id"]
-            }
-          },
-          {
-            "name": "fk_inf_payment_tier",
-            "columns": ["tier_applied"],
-            "references": {
-              "table": "inf.infraction_payment_tier_ref",
-              "columns": ["code"]
-            }
-          }
-        ]
-      },
-      {
-        "name": "RefundOrder",
-        "table": "refund_order",
-        "primaryKey": ["id"],
-        "description": "Ordem de restituicao corrigida — UC-RAIT-033 (fluxo 1 a 4, fluxo 3a dados bancarios ausentes, AC-RAIT-033-1 sem pedido do cidadao, AC-RAIT-033-2 indice visivel) e ADR-0017 Decision 1. index_key registra qual indice foi aplicado e nao tem default: o valor vigente e o parametro rait.refund.index (IPCA-E, ops.parameter; RAIT.REFUND_INDEX_PENDING quando nao parametrizado). Estados minusculos dos eventos reservados RESTITUICAO_ORDENADA e RESTITUICAO_PAGA (rait-events-sse-contract.md secao 2.5) mais a abertura por RESTITUICAO_DEVIDA (decisao M12).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "infraction_id", "type": "uuid" },
-          { "name": "payment_id", "type": "uuid" },
-          { "name": "reason", "type": "varchar(30)" },
-          { "name": "base_amount", "type": "numeric(12,2)" },
-          { "name": "index_key", "type": "varchar(40)" },
-          {
-            "name": "updated_amount",
-            "type": "numeric(12,2)",
-            "nullable": true
-          },
-          {
-            "name": "bank_data_status",
-            "type": "varchar(20)",
-            "default": "'pendente'"
-          },
-          { "name": "status", "type": "varchar(20)", "default": "'aberta'" },
-          { "name": "opened_at", "type": "timestamptz", "default": "now()" },
-          { "name": "ordered_at", "type": "timestamptz", "nullable": true },
-          { "name": "paid_at", "type": "timestamptz", "nullable": true },
-          { "name": "document_id", "type": "uuid", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_refund_order_payment",
-            "columns": ["tenant_id", "payment_id"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_refund_order_status",
-            "columns": ["tenant_id", "status", "opened_at"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_refund_order_reason",
-            "expression": "reason in ('decisao_favoravel','extincao','pagamento_duplicado','pagamento_a_maior')"
-          },
-          {
-            "name": "ck_inf_refund_order_bank_data_status",
-            "expression": "bank_data_status in ('pendente','informado')"
-          },
-          {
-            "name": "ck_inf_refund_order_status",
-            "expression": "status in ('aberta','ordenada','paga')"
-          },
-          {
-            "name": "ck_inf_refund_order_base_amount_positive",
-            "expression": "base_amount > 0"
-          },
-          {
-            "name": "ck_inf_refund_order_order_needs_bank_data",
-            "expression": "status = 'aberta' or bank_data_status = 'informado'"
-          },
-          {
-            "name": "ck_inf_refund_order_ordered_complete",
-            "expression": "status = 'aberta' or ordered_at is not null"
-          },
-          {
-            "name": "ck_inf_refund_order_paid_complete",
-            "expression": "status <> 'paga' or paid_at is not null"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_refund_order_infraction",
-            "columns": ["infraction_id"],
-            "references": { "table": "inf.infraction", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_refund_order_payment",
-            "columns": ["payment_id"],
-            "references": { "table": "inf.payment", "columns": ["id"] }
-          }
-        ]
-      },
-      {
-        "name": "DebtHandoff",
-        "table": "debt_handoff",
-        "primaryKey": ["id"],
-        "description": "Encaminhamento do credito definitivo nao pago a Fazenda e a divida ativa — UC-RAIT-034 (fluxo 3 transferencia com o dossie fiscal, fluxo 2a pagamento durante a cobranca, AC-RAIT-034-2) e ADR-0017 Decision 1. Antes de INSTANCIA_ENCERRADA ou com efeito suspensivo o encaminhamento e recusado (RAIT.DEBT_HANDOFF_NOT_FINAL, guarda de comando porque depende do estado do agregado). A porta da Fazenda segue pendente de fonte (ADR-0017 tabela de ownership).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "infraction_id", "type": "uuid" },
-          {
-            "name": "fazenda_reference",
-            "type": "varchar(80)",
-            "nullable": true
-          },
-          {
-            "name": "dossier_document_id",
-            "type": "uuid",
-            "nullable": true
-          },
-          { "name": "status", "type": "varchar(20)", "default": "'preparado'" },
-          { "name": "prepared_at", "type": "timestamptz", "default": "now()" },
-          { "name": "sent_at", "type": "timestamptz", "nullable": true },
-          {
-            "name": "acknowledged_at",
-            "type": "timestamptz",
-            "nullable": true
-          },
-          { "name": "cancel_reason", "type": "varchar(30)", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_debt_handoff_active",
-            "columns": ["tenant_id", "infraction_id"],
-            "unique": true,
-            "where": "status <> 'cancelado'"
-          },
-          {
-            "name": "ix_inf_debt_handoff_status",
-            "columns": ["tenant_id", "status", "prepared_at"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_debt_handoff_status",
-            "expression": "status in ('preparado','enviado','reconhecido','cancelado')"
-          },
-          {
-            "name": "ck_inf_debt_handoff_cancel_reason",
-            "expression": "cancel_reason is null or cancel_reason in ('pagamento')"
-          },
-          {
-            "name": "ck_inf_debt_handoff_sent_complete",
-            "expression": "status in ('preparado','cancelado') or sent_at is not null"
-          },
-          {
-            "name": "ck_inf_debt_handoff_ack_complete",
-            "expression": "status <> 'reconhecido' or (acknowledged_at is not null and fazenda_reference is not null)"
-          },
-          {
-            "name": "ck_inf_debt_handoff_ack_after_sent",
-            "expression": "acknowledged_at is null or sent_at is not null"
-          },
-          {
-            "name": "ck_inf_debt_handoff_cancel_complete",
-            "expression": "status <> 'cancelado' or cancel_reason is not null"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_debt_handoff_infraction",
-            "columns": ["infraction_id"],
-            "references": { "table": "inf.infraction", "columns": ["id"] }
-          }
-        ]
-      }
- ]
- },
- "api": {
- "basePath": "/v1/inf/collection/",
- "resources": [
-      {
-        "entity": "CollectionDocument",
-        "path": "collection-documents",
-        "resource": "collection-document"
-      },
-      { "entity": "Payment", "path": "payments", "resource": "payment" },
-      {
-        "entity": "RefundOrder",
-        "path": "refund-orders",
-        "resource": "refund-order"
-      },
-      {
-        "entity": "DebtHandoff",
-        "path": "debt-handoffs",
-        "resource": "debt-handoff"
-      }
- ]
- },
- "auth": {
- "source": "RAIT_COMMAND_RULES"
- },
- "audit": {
- "enabled": true
- }
  +}
  diff --git a/docs/framework/blueprints/BP-INF-RAIT-CASE-001.json b/docs/framework/blueprints/BP-INF-RAIT-CASE-001.json
  index 7b5c905..82ee161 100644
  --- a/docs/framework/blueprints/BP-INF-RAIT-CASE-001.json
  +++ b/docs/framework/blueprints/BP-INF-RAIT-CASE-001.json
  @@ -4,7 +4,7 @@
  "module": {
  "name": "RaitCase",
  "namespace": "inf",

* "version": "1.0.0",

- "version": "1.1.0",
  "ddlFile": "34-inf-rait-case.sql",
  "dependencies": {
  "@detran/inf-ait": "workspace:*"
  @@ -24,7 +24,7 @@
  }
  ],
  "owners": ["detran-inf"],

* "description": "Ciclo de vida do caso RAIT (WF-RAIT-001): protocolo multicanal, juizo de admissibilidade, instrucao com diligencia, decisao e comunicacao. Vocabulario de estados canonico da base de conhecimento em docs/framework/product."

- "description": "Ciclo de vida do caso RAIT (WF-RAIT-001): protocolo multicanal, juizo de admissibilidade, instrucao com diligencia, decisao e comunicacao. Vocabulario de estados canonico da base de conhecimento em docs/framework/product. v1.1.0 acrescenta prioridade legal de tramitacao, unidade de julgamento e versao do caso, mais pendencia de conteudo (UC-RAIT-028), redirecionamento de intake (UC-RAIT-027) e minuta versionada (WF-RAIT-004 secao 4)."
  },
  "database": {
  "entities": [
  @@ -32,7 +32,7 @@
  "name": "RaitCase",
  "table": "rait_case",
  "primaryKey": ["id"],

*        "description": "Caso RAIT — um requerimento sobre um AIT em uma instancia (RN-RAIT-002).",

-        "description": "Caso RAIT — um requerimento sobre um AIT em uma instancia (RN-RAIT-002). v1.1.0: legal_priority guarda a base de prioridade legal de tramitacao da ordem unica (WF-RAIT-004 secao 2; valores no parametro rait.priority.legal_bases, OD-016 — sem check para nao congelar parametro em DDL), unit_id aponta a turma/JARI que julga (secao 7, sem FK: inf.rait_unit nasce no DDL 35, posterior ao 34) e version e o contador de ETag/If-Match.",
         "fields": [
           {
             "name": "id",

@@ -141,6 +141,21 @@
"name": "pending_completion",
"type": "boolean",
"default": "false"

-          },
-          {
-            "name": "legal_priority",
-            "type": "varchar(30)",
-            "nullable": true
-          },
-          {
-            "name": "unit_id",
-            "type": "uuid",
-            "nullable": true
-          },
-          {
-            "name": "version",
-            "type": "integer",
-            "default": "1"
           }
         ],
         "indexes": [

@@ -390,6 +405,194 @@
}
]
},

-      {
-        "name": "RaitPendingContent",
-        "table": "rait_pending_content",
-        "primaryKey": ["id"],
-        "description": "Pendencia de conteudo minimo aberta no protocolo — UC-RAIT-028 fluxos 1-3. Registra os itens ausentes (RN-RAIT-002), o prazo interno ao requerente e o desfecho; pendencia nao e recusa de protocolo (AC-RAIT-028-1) e nao consome o prazo do requerente (AC-RAIT-028-2). Exigencia de uma so vez: no maximo uma pendencia aberta por caso (RN-PORTAL-107).",
-        "fields": [
-          {
-            "name": "id",
-            "type": "uuid",
-            "default": "gen_random_uuid()"
-          },
-          {
-            "name": "tenant_id",
-            "type": "uuid"
-          },
-          {
-            "name": "case_id",
-            "type": "uuid"
-          },
-          {
-            "name": "missing_items",
-            "type": "jsonb"
-          },
-          {
-            "name": "due_on",
-            "type": "date"
-          },
-          {
-            "name": "opened_at",
-            "type": "timestamptz",
-            "default": "now()"
-          },
-          {
-            "name": "opened_by",
-            "type": "uuid"
-          },
-          {
-            "name": "closed_at",
-            "type": "timestamptz",
-            "nullable": true
-          },
-          {
-            "name": "outcome",
-            "type": "varchar(20)",
-            "nullable": true
-          }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_pending_content_open",
-            "columns": ["tenant_id", "case_id"],
-            "unique": true,
-            "where": "closed_at is null"
-          },
-          {
-            "name": "ix_inf_rait_pending_content_due",
-            "columns": ["tenant_id", "due_on"],
-            "where": "closed_at is null"
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_pending_content_outcome",
-            "expression": "outcome is null or outcome in ('atendida','nao_atendida')"
-          },
-          {
-            "name": "ck_inf_rait_pending_content_closure_complete",
-            "expression": "(closed_at is null and outcome is null) or (closed_at is not null and outcome is not null)"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_rait_pending_content_case",
-            "columns": ["case_id"],
-            "references": {
-              "table": "inf.rait_case",
-              "columns": ["id"]
-            }
-          }
-        ]
-      },
-      {
-        "name": "RaitRedirect",
-        "table": "rait_redirect",
-        "primaryKey": ["id"],
-        "description": "Redirecionamento de intake entre orgaos — UC-RAIT-027 fluxos 2-4. Peca de outro orgao autuador remetida de imediato (Res. 900 art. 6 paragrafos 2 e 3) ou recebida de outro orgao, com o protocolo de origem como marco de tempestividade (AC-RAIT-027-1, RN-RAIT-106) e devolucao de prazo quando o orgao era incompetente (Lei 9.784 art. 63 paragrafo 1, RN-RAIT-109). case_id nulo quando a peca pertence a outro orgao e nao gera caso aqui.",
-        "fields": [
-          {
-            "name": "id",
-            "type": "uuid",
-            "default": "gen_random_uuid()"
-          },
-          {
-            "name": "tenant_id",
-            "type": "uuid"
-          },
-          {
-            "name": "case_id",
-            "type": "uuid",
-            "nullable": true
-          },
-          {
-            "name": "direction",
-            "type": "varchar(10)"
-          },
-          {
-            "name": "reason",
-            "type": "varchar(30)"
-          },
-          {
-            "name": "protocol_number",
-            "type": "varchar(40)"
-          },
-          {
-            "name": "ait_number",
-            "type": "varchar(40)",
-            "nullable": true
-          },
-          {
-            "name": "counterpart_agency",
-            "type": "varchar(120)"
-          },
-          {
-            "name": "counterpart_renainf_code",
-            "type": "varchar(20)",
-            "nullable": true
-          },
-          {
-            "name": "origin_protocolled_on",
-            "type": "date",
-            "nullable": true
-          },
-          {
-            "name": "deadline_restored",
-            "type": "boolean",
-            "default": "false"
-          },
-          {
-            "name": "receipt_document_id",
-            "type": "uuid",
-            "nullable": true
-          },
-          {
-            "name": "redirected_at",
-            "type": "timestamptz",
-            "default": "now()"
-          },
-          {
-            "name": "redirected_by",
-            "type": "uuid"
-          }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_redirect_protocol",
-            "columns": ["tenant_id", "direction", "protocol_number"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_redirect_case",
-            "columns": ["tenant_id", "case_id"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_redirect_direction",
-            "expression": "direction in ('entrada','saida')"
-          },
-          {
-            "name": "ck_inf_rait_redirect_reason",
-            "expression": "reason in ('outro_orgao_autuador','orgao_incompetente')"
-          },
-          {
-            "name": "ck_inf_rait_redirect_inbound_has_case",
-            "expression": "direction <> 'entrada' or case_id is not null"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_rait_redirect_case",
-            "columns": ["case_id"],
-            "references": {
-              "table": "inf.rait_case",
-              "columns": ["id"]
-            }
-          }
-        ]
-      },
       {
         "name": "RaitAdmissibility",
         "table": "rait_admissibility",

@@ -645,6 +848,112 @@
}
]
},

-      {
-        "name": "RaitDraft",
-        "table": "rait_draft",
-        "primaryKey": ["id"],
-        "description": "Minuta de decisao versionada — WF-RAIT-004 secao 4 passos 3, 5 e 6. Uma linha por versao da minuta do caso, com autor, documento na fachada de documentos (ADR-0018, sem FK), hash de conteudo e status; a autoridade signataria pode devolver a minuta com orientacao uma unica vez, sem sair de PRONTO_P_DECISAO (secao 4 passo 5).",
-        "fields": [
-          {
-            "name": "id",
-            "type": "uuid",
-            "default": "gen_random_uuid()"
-          },
-          {
-            "name": "tenant_id",
-            "type": "uuid"
-          },
-          {
-            "name": "case_id",
-            "type": "uuid"
-          },
-          {
-            "name": "version",
-            "type": "integer"
-          },
-          {
-            "name": "author_id",
-            "type": "uuid"
-          },
-          {
-            "name": "document_id",
-            "type": "uuid",
-            "nullable": true
-          },
-          {
-            "name": "content_hash",
-            "type": "varchar(128)"
-          },
-          {
-            "name": "status",
-            "type": "varchar(20)",
-            "default": "'rascunho'"
-          },
-          {
-            "name": "submitted_at",
-            "type": "timestamptz",
-            "nullable": true
-          },
-          {
-            "name": "returned_at",
-            "type": "timestamptz",
-            "nullable": true
-          },
-          {
-            "name": "return_guidance",
-            "type": "text",
-            "nullable": true
-          },
-          {
-            "name": "return_count",
-            "type": "integer",
-            "default": "0"
-          }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_draft_version",
-            "columns": ["tenant_id", "case_id", "version"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_draft_status",
-            "columns": ["tenant_id", "case_id", "status"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_draft_status",
-            "expression": "status in ('rascunho','submetida','devolvida','assinada')"
-          },
-          {
-            "name": "ck_inf_rait_draft_version_positive",
-            "expression": "version >= 1"
-          },
-          {
-            "name": "ck_inf_rait_draft_single_return",
-            "expression": "return_count <= 1"
-          },
-          {
-            "name": "ck_inf_rait_draft_return_complete",
-            "expression": "status <> 'devolvida' or (returned_at is not null and return_guidance is not null)"
-          },
-          {
-            "name": "ck_inf_rait_draft_submitted_required",
-            "expression": "status = 'rascunho' or submitted_at is not null"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_rait_draft_case",
-            "columns": ["case_id"],
-            "references": {
-              "table": "inf.rait_case",
-              "columns": ["id"]
-            }
-          }
-        ]
-      },
       {
         "name": "RaitDecision",
         "table": "rait_decision",

@@ -913,6 +1222,16 @@
"path": "documents",
"resource": "rait-document"
},

-      {
-        "entity": "RaitPendingContent",
-        "path": "pending-contents",
-        "resource": "rait-pending-content"
-      },
-      {
-        "entity": "RaitRedirect",
-        "path": "redirects",
-        "resource": "rait-redirect"
-      },
       {
         "entity": "RaitAdmissibility",
         "path": "admissibility",

@@ -928,6 +1247,11 @@
"path": "inquiries",
"resource": "rait-inquiry"
},

-      {
-        "entity": "RaitDraft",
-        "path": "drafts",
-        "resource": "rait-draft"
-      },
       {
         "entity": "RaitDecision",
         "path": "decisions",

diff --git a/docs/framework/blueprints/BP-INF-RAIT-INTEGRATION-001.json b/docs/framework/blueprints/BP-INF-RAIT-INTEGRATION-001.json
new file mode 100644
index 0000000..244017a
--- /dev/null
+++ b/docs/framework/blueprints/BP-INF-RAIT-INTEGRATION-001.json
@@ -0,0 +1,102 @@
+{

- "schemaVersion": "1.0.0",
- "id": "BP-INF-RAIT-INTEGRATION-001",
- "module": {
- "name": "RaitIntegration",
- "namespace": "inf",
- "version": "1.0.0",
- "ddlFile": "58-inf-rait-integration.sql",
- "devDependencies": {
-      "@types/pg": "^8.15.4",
-      "pg": "^8.20.0"
- },
- "testAliases": [
-      {
-        "package": "@detran/shared",
-        "target": "../../shared/src/index.ts"
-      }
- ],
- "owners": ["detran-inf"],
- "description": "Conciliacao do RAIT com os registros nacionais (UC-RAIT-029 fluxo 3 e UC-RAIT-031 fluxo 3 e 3a): fato proprio do RAIT, nao projecao (ADR-0020 Decision 1 e 2). Nenhuma chamada nacional sai daqui — so o packages/senatran-adapter fala com RENAINF, RENACH e SNE (ADR-0003; AC-RAIT-029-1) — e nenhuma escrita na integration.outbox: a projecao da outbox por sistema pertence ao consumidor (dashboard.integration_health, ADR-0020 Decision 2) e nasce em WP-P (decisao M10). Nenhuma FK entre schemas."
- },
- "database": {
- "entities": [
-      {
-        "name": "RaitReconciliation",
-        "table": "rait_reconciliation",
-        "primaryKey": ["id"],
-        "description": "Conciliacao por sistema e janela — UC-RAIT-031 fluxo 3 (compara estado local e nacional, aplica a precedencia e registra a conciliacao; AC-RAIT-031-2) e fluxo 3a (divergencia que altera sujeito passivo ou pontuacao nunca e automatica: escala ao gestor), aberta pela divergencia de UC-RAIT-029 fluxo 3. divergences_count e o par de RAIT.RECONCILIATION_DIVERGENCE (catalogo secao 3.11); report_document_id e o relatorio da conciliacao pela fachada de documentos (ADR-0018 Decision 1) e nao tem FK porque nao existe tabela de documento. Estados minusculos derivados do UC (decisao M12).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "system", "type": "varchar(10)" },
-          { "name": "window_from", "type": "date" },
-          { "name": "window_to", "type": "date" },
-          { "name": "requested_by", "type": "uuid" },
-          { "name": "requested_at", "type": "timestamptz", "default": "now()" },
-          {
-            "name": "status",
-            "type": "varchar(20)",
-            "default": "'solicitada'"
-          },
-          { "name": "divergences_count", "type": "integer", "default": "0" },
-          { "name": "report_document_id", "type": "uuid", "nullable": true },
-          { "name": "resolved_at", "type": "timestamptz", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_reconciliation_window",
-            "columns": ["tenant_id", "system", "window_from", "window_to"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_reconciliation_status",
-            "columns": ["tenant_id", "status", "requested_at"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_reconciliation_system",
-            "expression": "system in ('renainf','renach','sne')"
-          },
-          {
-            "name": "ck_inf_rait_reconciliation_status",
-            "expression": "status in ('solicitada','conciliada','escalada')"
-          },
-          {
-            "name": "ck_inf_rait_reconciliation_window_order",
-            "expression": "window_to >= window_from"
-          },
-          {
-            "name": "ck_inf_rait_reconciliation_divergences_non_negative",
-            "expression": "divergences_count >= 0"
-          },
-          {
-            "name": "ck_inf_rait_reconciliation_resolved_complete",
-            "expression": "status = 'solicitada' or resolved_at is not null"
-          },
-          {
-            "name": "ck_inf_rait_reconciliation_report_required",
-            "expression": "status <> 'conciliada' or divergences_count = 0 or report_document_id is not null"
-          }
-        ]
-      }
- ]
- },
- "api": {
- "basePath": "/v1/inf/rait/",
- "resources": [
-      {
-        "entity": "RaitReconciliation",
-        "path": "reconciliations",
-        "resource": "rait-reconciliation"
-      }
- ]
- },
- "auth": {
- "source": "RAIT_COMMAND_RULES"
- },
- "audit": {
- "enabled": true
- }
  +}
  diff --git a/docs/framework/blueprints/BP-INF-RAIT-ORG-001.json b/docs/framework/blueprints/BP-INF-RAIT-ORG-001.json
  new file mode 100644
  index 0000000..ec71b30
  --- /dev/null
  +++ b/docs/framework/blueprints/BP-INF-RAIT-ORG-001.json
  @@ -0,0 +1,577 @@
  +{
- "schemaVersion": "1.0.0",
- "id": "BP-INF-RAIT-ORG-001",
- "module": {
- "name": "RaitOrg",
- "namespace": "inf",
- "version": "1.0.0",
- "ddlFile": "39-inf-rait-org.sql",
- "dependencies": {
-      "@detran/inf-rait-worklist": "workspace:*"
- },
- "devDependencies": {
-      "@types/pg": "^8.15.4",
-      "pg": "^8.20.0"
- },
- "testAliases": [
-      {
-        "package": "@detran/shared",
-        "target": "../../shared/src/index.ts"
-      },
-      {
-        "package": "@detran/inf-rait-worklist",
-        "target": "../rait-worklist/src/index.ts"
-      }
- ],
- "owners": ["detran-inf"],
- "description": "Organizacao do orgao julgador: calendario de feriados ([WF-RAIT-002] secao 7; UC-RAIT-043 fluxo 1), atos de suspensao de prazo por forca maior (UC-RAIT-022), folha de jeton por periodo (UC-RAIT-036), incidente de prescricao operacional ([WF-RAIT-002] secao 4.1 e 4.2), amostra de qualidade (UC-RAIT-025), plano de capacidade ([WF-RAIT-004] secao 8; UC-RAIT-038) e exportacoes com controle LGPD (UC-RAIT-042). Parametros vivem em ops.parameter (ADR-0021 Decision 6): este blueprint nao define rait_parameter e nenhuma coluna guarda valor de parametro."
- },
- "database": {
- "entities": [
-      {
-        "name": "RaitHoliday",
-        "table": "rait_holiday",
-        "primaryKey": ["id"],
-        "description": "Feriado ou ponto facultativo do calendario do orgao — [WF-RAIT-002] secao 7 (calendario nacional + estadual do AM, decisao do Owner A.6) e UC-RAIT-043 fluxo 1 e AC-RAIT-043-3. Porta de calendario do motor de prazos; unicidade por data e escopo levanta RAIT.CALENDAR_OVERLAP (catalogo de erros secao 3.9).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "name", "type": "varchar(120)" },
-          { "name": "holiday_on", "type": "date" },
-          { "name": "scope", "type": "varchar(20)" },
-          { "name": "optional", "type": "boolean", "default": "false" }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_holiday_date_scope",
-            "columns": ["tenant_id", "holiday_on", "scope"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_holiday_date",
-            "columns": ["tenant_id", "holiday_on"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_holiday_scope",
-            "expression": "scope in ('nacional','estadual','municipal')"
-          }
-        ]
-      },
-      {
-        "name": "RaitSuspensionAct",
-        "table": "rait_suspension_act",
-        "primaryKey": ["id"],
-        "description": "Ato motivado de suspensao de prazo por forca maior — UC-RAIT-022 (fluxo 1 a 4, fluxos 1a e 2a) e [WF-RAIT-002] secao 7. Prova obrigatoria (evidence_document_id; RAIT.SUSPENSION_EVIDENCE_REQUIRED) e ato assinado (signed_by); prazos de extincao nao podem ser suspensos (RAIT.SUSPENSION_LEGAL_TIMER, guarda de comando porque depende do codigo do timer). Os timers e casos alcancados apontam para o ato por inf.infraction_timer.suspended_by_act_id e inf.rait_deadline.suspended_by_act_id (decisao M5).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "reason", "type": "text" },
-          { "name": "legal_basis", "type": "text", "nullable": true },
-          { "name": "starts_on", "type": "date" },
-          { "name": "ends_on", "type": "date" },
-          {
-            "name": "timer_codes",
-            "type": "jsonb",
-            "default": "'[]'::jsonb"
-          },
-          { "name": "evidence_document_id", "type": "uuid" },
-          { "name": "signed_by", "type": "uuid" },
-          { "name": "signed_at", "type": "timestamptz", "default": "now()" },
-          { "name": "state", "type": "varchar(20)", "default": "'vigente'" },
-          { "name": "reviewed_at", "type": "timestamptz", "nullable": true },
-          { "name": "reviewed_by", "type": "uuid", "nullable": true },
-          { "name": "revoked_at", "type": "timestamptz", "nullable": true },
-          { "name": "revoked_reason", "type": "text", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ix_inf_rait_suspension_act_period",
-            "columns": ["tenant_id", "starts_on", "ends_on"]
-          },
-          {
-            "name": "ix_inf_rait_suspension_act_state",
-            "columns": ["tenant_id", "state"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_suspension_act_state",
-            "expression": "state in ('vigente','revogado','encerrado')"
-          },
-          {
-            "name": "ck_inf_rait_suspension_act_period_order",
-            "expression": "ends_on >= starts_on"
-          },
-          {
-            "name": "ck_inf_rait_suspension_act_timer_codes_array",
-            "expression": "jsonb_typeof(timer_codes) = 'array'"
-          },
-          {
-            "name": "ck_inf_rait_suspension_act_review_complete",
-            "expression": "reviewed_at is null or reviewed_by is not null"
-          },
-          {
-            "name": "ck_inf_rait_suspension_act_revoked_complete",
-            "expression": "state <> 'revogado' or (revoked_at is not null and revoked_reason is not null)"
-          }
-        ]
-      },
-      {
-        "name": "RaitJetonSheet",
-        "table": "rait_jeton_sheet",
-        "primaryKey": ["id"],
-        "description": "Folha de remuneracao por sessao (jeton) por periodo e orgao colegiado — UC-RAIT-036 fluxo 1 a 4 e fluxo 3a. Estados minusculos derivados do proprio UC (decisao M12): gerada, conferida pela secretaria, homologada pelo presidente, enviada ao RH/financeiro; RAIT.JETON_ALREADY_APPROVED barra a reaprovacao e RAIT.JETON_MINUTES_UNSIGNED a sessao sem ata assinada. source_pending marca que rait.jeton.value e rait.jeton.monthly_cap seguem pendentes de fonte (steering H.54 e H.57; ADR-0021 Decision 2, RAIT.PARAMETER_SOURCE_PENDING).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "judging_body", "type": "varchar(10)" },
-          { "name": "period_start", "type": "date" },
-          { "name": "period_end", "type": "date" },
-          { "name": "state", "type": "varchar(20)", "default": "'gerada'" },
-          { "name": "generated_at", "type": "timestamptz", "default": "now()" },
-          { "name": "generated_by", "type": "uuid", "nullable": true },
-          { "name": "reviewed_at", "type": "timestamptz", "nullable": true },
-          { "name": "reviewed_by", "type": "uuid", "nullable": true },
-          { "name": "homologated_at", "type": "timestamptz", "nullable": true },
-          { "name": "homologated_by", "type": "uuid", "nullable": true },
-          { "name": "sent_at", "type": "timestamptz", "nullable": true },
-          { "name": "document_id", "type": "uuid", "nullable": true },
-          {
-            "name": "source_pending",
-            "type": "boolean",
-            "default": "true"
-          }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_jeton_sheet_period",
-            "columns": ["tenant_id", "judging_body", "period_start"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_jeton_sheet_state",
-            "columns": ["tenant_id", "state"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_jeton_sheet_body",
-            "expression": "judging_body in ('jari','cetran')"
-          },
-          {
-            "name": "ck_inf_rait_jeton_sheet_state",
-            "expression": "state in ('gerada','conferida','homologada','enviada')"
-          },
-          {
-            "name": "ck_inf_rait_jeton_sheet_period_order",
-            "expression": "period_end >= period_start"
-          },
-          {
-            "name": "ck_inf_rait_jeton_sheet_review_complete",
-            "expression": "state = 'gerada' or (reviewed_at is not null and reviewed_by is not null)"
-          },
-          {
-            "name": "ck_inf_rait_jeton_sheet_homologation_complete",
-            "expression": "state not in ('homologada','enviada') or (homologated_at is not null and homologated_by is not null)"
-          },
-          {
-            "name": "ck_inf_rait_jeton_sheet_sent_complete",
-            "expression": "state <> 'enviada' or sent_at is not null"
-          }
-        ]
-      },
-      {
-        "name": "RaitJetonLine",
-        "table": "rait_jeton_line",
-        "primaryKey": ["id"],
-        "description": "Linha da folha de jeton: um membro em uma sessao com ata assinada — UC-RAIT-036 fluxo 1 (presenca valida, itens relatados, votos, faltas justificadas e injustificadas), fluxo 2 e 2a (teto mensal, sessao excedente nao remunerada) e AC-RAIT-036-1 a AC-RAIT-036-3. unit_value e amount existem e ficam nulos enquanto source_pending for verdadeiro, porque rait.jeton.value nao tem fonte (steering H.54 e H.57).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "sheet_id", "type": "uuid" },
-          { "name": "member_id", "type": "uuid" },
-          { "name": "session_id", "type": "uuid" },
-          { "name": "minutes_id", "type": "uuid", "nullable": true },
-          {
-            "name": "attendance_valid",
-            "type": "boolean",
-            "default": "false"
-          },
-          { "name": "items_reported", "type": "integer", "default": "0" },
-          { "name": "votes_cast", "type": "integer", "default": "0" },
-          { "name": "absence_kind", "type": "varchar(20)", "nullable": true },
-          { "name": "remunerated", "type": "boolean", "default": "false" },
-          { "name": "over_cap", "type": "boolean", "default": "false" },
-          { "name": "unit_value", "type": "numeric(12,2)", "nullable": true },
-          { "name": "amount", "type": "numeric(12,2)", "nullable": true },
-          { "name": "source_pending", "type": "boolean", "default": "true" }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_jeton_line_member_session",
-            "columns": ["tenant_id", "sheet_id", "member_id", "session_id"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_jeton_line_member",
-            "columns": ["tenant_id", "member_id"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_jeton_line_absence_kind",
-            "expression": "absence_kind is null or absence_kind in ('justificada','injustificada')"
-          },
-          {
-            "name": "ck_inf_rait_jeton_line_absence_exclusive",
-            "expression": "absence_kind is null or not attendance_valid"
-          },
-          {
-            "name": "ck_inf_rait_jeton_line_counts_non_negative",
-            "expression": "items_reported >= 0 and votes_cast >= 0"
-          },
-          {
-            "name": "ck_inf_rait_jeton_line_remunerated_needs_attendance",
-            "expression": "not remunerated or attendance_valid"
-          },
-          {
-            "name": "ck_inf_rait_jeton_line_value_pending",
-            "expression": "(source_pending and unit_value is null and amount is null) or (not source_pending and unit_value is not null and amount is not null)"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_rait_jeton_line_sheet",
-            "columns": ["sheet_id"],
-            "references": { "table": "inf.rait_jeton_sheet", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_rait_jeton_line_member",
-            "columns": ["member_id"],
-            "references": { "table": "inf.rait_pool_member", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_rait_jeton_line_session",
-            "columns": ["session_id"],
-            "references": { "table": "inf.rait_session", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_rait_jeton_line_minutes",
-            "columns": ["minutes_id"],
-            "references": { "table": "inf.rait_minutes", "columns": ["id"] }
-          }
-        ]
-      },
-      {
-        "name": "RaitIncident",
-        "table": "rait_incident",
-        "primaryKey": ["id"],
-        "description": "Incidente de prescricao operacional — [WF-RAIT-002] secao 4.1 e 4.2 (nivel PRESCRITO_OPERACIONAL: registro de incidente, apuracao de causa, comunicacao ao LEGAL/auditoria) e AC-RAIT-010-4. incident_ref no formato INC-AAAA-NNNN, o mesmo de inf.rait_clock_alert.incident_ref (fixture INC-2026-0007, rait-fixtures.md secao 3). outcome e texto livre porque nenhuma fonte fixa vocabulario de desfecho (mesmo tratamento de rait_pool_member.jurisdiction).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "incident_ref", "type": "varchar(80)" },
-          { "name": "clock_id", "type": "uuid", "nullable": true },
-          { "name": "case_id", "type": "uuid", "nullable": true },
-          { "name": "opened_at", "type": "timestamptz", "default": "now()" },
-          { "name": "opened_by", "type": "uuid", "nullable": true },
-          { "name": "responsible_id", "type": "uuid", "nullable": true },
-          { "name": "cause_analysis", "type": "text", "nullable": true },
-          { "name": "outcome", "type": "text", "nullable": true },
-          {
-            "name": "legal_notified_at",
-            "type": "timestamptz",
-            "nullable": true
-          },
-          { "name": "closed_at", "type": "timestamptz", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_incident_ref",
-            "columns": ["tenant_id", "incident_ref"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_incident_open",
-            "columns": ["tenant_id", "opened_at"],
-            "where": "closed_at is null"
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_incident_ref_format",
-            "expression": "incident_ref ~ '^INC-[0-9]{4}-[0-9]{4}

"

-          },
-          {
-            "name": "ck_inf_rait_incident_target",
-            "expression": "clock_id is not null or case_id is not null"
-          },
-          {
-            "name": "ck_inf_rait_incident_closed_complete",
-            "expression": "closed_at is null or (responsible_id is not null and cause_analysis is not null and outcome is not null)"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_rait_incident_clock",
-            "columns": ["clock_id"],
-            "references": { "table": "inf.rait_clock", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_rait_incident_case",
-            "columns": ["case_id"],
-            "references": { "table": "inf.rait_case", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_rait_incident_responsible",
-            "columns": ["responsible_id"],
-            "references": { "table": "inf.rait_pool_member", "columns": ["id"] }
-          }
-        ]
-      },
-      {
-        "name": "RaitQualitySample",
-        "table": "rait_quality_sample",
-        "primaryKey": ["id"],
-        "description": "Item da amostra de qualidade das decisoes do periodo — UC-RAIT-025 (fluxo 1 sorteio estratificado, fluxo 2 checklist com achados tipados, fluxo 3 achados sistematicos ao TEAT e a JARI, fluxo 2a sem reabrir decisao) e [WF-RAIT-004] secao 2.1 fila F-DP-Q. O percentual da amostra e o parametro rait.quality.sample_pct (ops.parameter, ADR-0021): nenhuma coluna o guarda. Os tokens de finding_kind sao os quatro itens do checklist do fluxo 2 (decisao de modelagem M12).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "period_start", "type": "date" },
-          { "name": "period_end", "type": "date" },
-          { "name": "case_id", "type": "uuid" },
-          { "name": "decision_id", "type": "uuid", "nullable": true },
-          {
-            "name": "reviewer_member_id",
-            "type": "uuid",
-            "nullable": true
-          },
-          { "name": "sampled_at", "type": "timestamptz", "default": "now()" },
-          { "name": "reviewed_at", "type": "timestamptz", "nullable": true },
-          { "name": "finding_kind", "type": "varchar(20)", "nullable": true },
-          { "name": "finding_note", "type": "text", "nullable": true },
-          { "name": "systemic", "type": "boolean", "default": "false" }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_quality_sample_case",
-            "columns": ["tenant_id", "period_start", "case_id"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_quality_sample_period",
-            "columns": ["tenant_id", "period_start", "period_end"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_quality_sample_period_order",
-            "expression": "period_end >= period_start"
-          },
-          {
-            "name": "ck_inf_rait_quality_sample_finding_kind",
-            "expression": "finding_kind is null or finding_kind in ('fundamento','prova','coerencia','linguagem')"
-          },
-          {
-            "name": "ck_inf_rait_quality_sample_finding_needs_review",
-            "expression": "finding_kind is null or reviewed_at is not null"
-          },
-          {
-            "name": "ck_inf_rait_quality_sample_systemic_needs_finding",
-            "expression": "not systemic or finding_kind is not null"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_rait_quality_sample_case",
-            "columns": ["case_id"],
-            "references": { "table": "inf.rait_case", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_rait_quality_sample_decision",
-            "columns": ["decision_id"],
-            "references": { "table": "inf.rait_decision", "columns": ["id"] }
-          },
-          {
-            "name": "fk_inf_rait_quality_sample_reviewer",
-            "columns": ["reviewer_member_id"],
-            "references": { "table": "inf.rait_pool_member", "columns": ["id"] }
-          }
-        ]
-      },
-      {
-        "name": "RaitCapacityPlan",
-        "table": "rait_capacity_plan",
-        "primaryKey": ["id"],
-        "description": "Plano de capacidade por pool e periodo — [WF-RAIT-004] secao 8 (chegada, capacidade escalada, fila e gatilho de nova turma) e UC-RAIT-038 (fluxo 1 a 4, AC-RAIT-038-1 e AC-RAIT-038-2). months_over_capacity registra os meses observados de fila acima da capacidade; o limiar e o parametro rait.unit.queue_over_capacity_months (ops.parameter) e a guarda de constituicao de turma e de comando (RAIT.UNIT_TRIGGER_NOT_MET, catalogo secao 3.10).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "pool_id", "type": "uuid" },
-          { "name": "period_start", "type": "date" },
-          { "name": "period_end", "type": "date" },
-          { "name": "arrival_estimate", "type": "integer", "nullable": true },
-          { "name": "capacity_estimate", "type": "integer", "nullable": true },
-          { "name": "queue_observed", "type": "integer", "nullable": true },
-          {
-            "name": "months_over_capacity",
-            "type": "integer",
-            "default": "0"
-          },
-          { "name": "measures", "type": "text", "nullable": true },
-          {
-            "name": "reinforcement_requested",
-            "type": "boolean",
-            "default": "false"
-          },
-          { "name": "unit_proposed", "type": "boolean", "default": "false" },
-          {
-            "name": "registered_at",
-            "type": "timestamptz",
-            "default": "now()"
-          },
-          { "name": "registered_by", "type": "uuid", "nullable": true },
-          { "name": "closed_at", "type": "timestamptz", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_capacity_plan_pool_period",
-            "columns": ["tenant_id", "pool_id", "period_start"],
-            "unique": true
-          },
-          {
-            "name": "ix_inf_rait_capacity_plan_period",
-            "columns": ["tenant_id", "period_start", "period_end"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_capacity_plan_period_order",
-            "expression": "period_end >= period_start"
-          },
-          {
-            "name": "ck_inf_rait_capacity_plan_counts_non_negative",
-            "expression": "(arrival_estimate is null or arrival_estimate >= 0) and (capacity_estimate is null or capacity_estimate >= 0) and (queue_observed is null or queue_observed >= 0) and months_over_capacity >= 0"
-          },
-          {
-            "name": "ck_inf_rait_capacity_plan_closed_needs_measure",
-            "expression": "closed_at is null or measures is not null or reinforcement_requested"
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_rait_capacity_plan_pool",
-            "columns": ["pool_id"],
-            "references": { "table": "inf.rait_pool", "columns": ["id"] }
-          }
-        ]
-      },
-      {
-        "name": "RaitExport",
-        "table": "rait_export",
-        "primaryKey": ["id"],
-        "description": "Exportacao de decisoes e estatisticas com controle LGPD — UC-RAIT-042 fluxo 3, fluxo 3a e AC-RAIT-042-2 (finalidade, escopo, solicitante e hash registrados; aprovacao do DPO na exportacao nominal em massa). purpose nao admite nulo (RAIT.EXPORT_PURPOSE_REQUIRED) e o limiar de linhas que exige o DPO e o parametro rait.export.dpo_threshold_rows (ops.parameter; RAIT.EXPORT_DPO_APPROVAL_REQUIRED, catalogo secao 3.11). Estados minusculos derivados do proprio UC (decisao M12).",
-        "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "purpose", "type": "text" },
-          { "name": "scope", "type": "jsonb", "default": "'{}'::jsonb" },
-          { "name": "requested_by", "type": "uuid" },
-          { "name": "requested_at", "type": "timestamptz", "default": "now()" },
-          { "name": "row_count", "type": "integer", "nullable": true },
-          {
-            "name": "status",
-            "type": "varchar(20)",
-            "default": "'solicitada'"
-          },
-          { "name": "dpo_approved_by", "type": "uuid", "nullable": true },
-          {
-            "name": "dpo_approved_at",
-            "type": "timestamptz",
-            "nullable": true
-          },
-          { "name": "generated_at", "type": "timestamptz", "nullable": true },
-          { "name": "document_id", "type": "uuid", "nullable": true },
-          { "name": "content_hash", "type": "varchar(64)", "nullable": true }
-        ],
-        "indexes": [
-          {
-            "name": "ix_inf_rait_export_status",
-            "columns": ["tenant_id", "status", "requested_at"]
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_export_status",
-            "expression": "status in ('solicitada','aguardando_dpo','gerada')"
-          },
-          {
-            "name": "ck_inf_rait_export_row_count_non_negative",
-            "expression": "row_count is null or row_count >= 0"
-          },
-          {
-            "name": "ck_inf_rait_export_dpo_complete",
-            "expression": "dpo_approved_at is null or dpo_approved_by is not null"
-          },
-          {
-            "name": "ck_inf_rait_export_content_hash_format",
-            "expression": "content_hash is null or content_hash ~ '^[0-9a-f]{64}

"

-          },
-          {
-            "name": "ck_inf_rait_export_generated_complete",
-            "expression": "status <> 'gerada' or (generated_at is not null and content_hash is not null and document_id is not null)"
-          }
-        ]
-      }
- ]
- },
- "api": {
- "basePath": "/v1/inf/rait/",
- "resources": [
-      {
-        "entity": "RaitHoliday",
-        "path": "holidays",
-        "resource": "rait-holiday"
-      },
-      {
-        "entity": "RaitSuspensionAct",
-        "path": "suspension-acts",
-        "resource": "rait-suspension-act"
-      },
-      {
-        "entity": "RaitJetonSheet",
-        "path": "jeton-sheets",
-        "resource": "rait-jeton-sheet"
-      },
-      {
-        "entity": "RaitJetonLine",
-        "path": "jeton-lines",
-        "resource": "rait-jeton-line"
-      },
-      {
-        "entity": "RaitIncident",
-        "path": "incidents",
-        "resource": "rait-incident"
-      },
-      {
-        "entity": "RaitQualitySample",
-        "path": "quality-samples",
-        "resource": "rait-quality-sample"
-      },
-      {
-        "entity": "RaitCapacityPlan",
-        "path": "capacity-plans",
-        "resource": "rait-capacity-plan"
-      },
-      { "entity": "RaitExport", "path": "exports", "resource": "rait-export" }
- ]
- },
- "auth": {
- "source": "RAIT_COMMAND_RULES"
- },
- "audit": {
- "enabled": true
- }
  +}
  diff --git a/docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json b/docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json
  index 8821dcd..ee27035 100644
  --- a/docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json
  +++ b/docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json
  @@ -4,7 +4,7 @@
  "module": {
  "name": "RaitSession",
  "namespace": "inf",

* "version": "1.0.0",

- "version": "1.1.0",
  "ddlFile": "36-inf-rait-session.sql",
  "dependencies": {
  "@detran/inf-rait-case": "workspace:*",
  @@ -29,7 +29,7 @@
  }
  ],
  "owners": ["detran-inf"],

* "description": "Rito de sessao colegiada JARI/CETRAN (WF-RAIT-003): pauta, convocacao, quorum, relatoria, votacao, desempate e ata assinada em PAdES+TSA."

- "description": "Rito de sessao colegiada JARI/CETRAN (WF-RAIT-003): pauta, convocacao, quorum, relatoria, votacao, desempate e ata assinada em PAdES+TSA. v1.1.0 acrescenta a modalidade da sessao, o reconhecimento de convocacao curta, o pedido de vista por item e a publicacao da ata (OD-102, OD-103, OD-106 vigentes por steering H.57)."
  },
  "database": {
  "entities": [
  @@ -37,7 +37,7 @@
  "name": "RaitSession",
  "table": "rait_session",
  "primaryKey": ["id"],

*        "description": "Sessao de julgamento. Sem quorum a sessao nao abre e vai a SESSAO_ADIADA (AC-RAIT-006-1); relogios nao param (AC-RAIT-006-2).",

-        "description": "Sessao de julgamento. Sem quorum a sessao nao abre e vai a SESSAO_ADIADA (AC-RAIT-006-1); relogios nao param (AC-RAIT-006-2). v1.1.0: modality registra presencial, virtual ou hibrida (WF-RAIT-003 secao Fundamento e WF-RAIT-004 secao 6 regra (d); habilitacao pelo parametro session.modality.virtual_enabled, OD-106) e short_notice_ack marca o reconhecimento da convocacao com menos de T-CONV (RAIT.AGENDA_SHORT_NOTICE, OD-102).",
         "fields": [
           {
             "name": "id",

@@ -110,6 +110,16 @@
"name": "short_notice_ack_by",
"type": "uuid",
"nullable": true

-          },
-          {
-            "name": "modality",
-            "type": "varchar(20)",
-            "default": "'presencial'"
-          },
-          {
-            "name": "short_notice_ack",
-            "type": "boolean",
-            "default": "false"
           }
         ],
         "indexes": [

@@ -138,6 +148,14 @@
{
"name": "ck_inf_rait_session_adjourned_reason",
"expression": "state <> 'SESSAO_ADIADA' or adjourned_reason is not null"

-          },
-          {
-            "name": "ck_inf_rait_session_modality",
-            "expression": "modality in ('presencial','virtual','hibrida')"
-          },
-          {
-            "name": "ck_inf_rait_session_short_notice_ack",
-            "expression": "short_notice_ack_by is null or short_notice_ack"
           }
         ]
       },

@@ -145,7 +163,7 @@
"name": "RaitAgendaItem",
"table": "rait_agenda_item",
"primaryKey": ["id"],

-        "description": "Caso em pauta. priority=true para bandeiras ALERTA_N3/CRITICO — entrada obrigatoria (AC-RAIT-005-1). So entra com parecer registrado (AC-RAIT-005-2).",

*        "description": "Caso em pauta. priority=true para bandeiras ALERTA_N3/CRITICO — entrada obrigatoria (AC-RAIT-005-1). So entra com parecer registrado (AC-RAIT-005-2). v1.1.0: view_requested_by e view_due_on registram o pedido de vista do item e seu prazo de devolucao (WF-RAIT-004 secao 2.3 — Res. 901/2022 Anexo 11.1; OD-103, teto por membro no parametro session.view_request.max_per_member).",
         "fields": [
           {
             "name": "id",

@@ -221,6 +239,16 @@
"name": "withdrawn_reason",
"type": "varchar(40)",
"nullable": true

-          },
-          {
-            "name": "view_requested_by",
-            "type": "uuid",
-            "nullable": true
-          },
-          {
-            "name": "view_due_on",
-            "type": "date",
-            "nullable": true
           }
         ],
         "indexes": [

@@ -251,6 +279,10 @@
{
"name": "ck_inf_rait_agenda_item_withdrawn_reason",
"expression": "withdrawn = false or withdrawn_reason is not null"

-          },
-          {
-            "name": "ck_inf_rait_agenda_item_view_complete",
-            "expression": "(view_requested_by is null and view_due_on is null) or (view_requested_by is not null and view_due_on is not null)"
           }
         ],
         "foreignKeys": [

@@ -502,7 +534,7 @@
"name": "RaitMinutes",
"table": "rait_minutes",
"primaryKey": ["id"],

-        "description": "Ata gerada dos registros ao vivo, nunca redigida do zero (AC-RAIT-006-7). Assinatura PAdES+TSA (steering A.8).",

*        "description": "Ata gerada dos registros ao vivo, nunca redigida do zero (AC-RAIT-006-7). Assinatura PAdES+TSA (steering A.8). v1.1.0: published_at marca a publicacao da ata, que e o marco de T-R2 (WF-RAIT-004 secao 2.2 fila F-J-5; RN-RAIT-103) e so existe depois da assinatura (RAIT.MINUTES_SIGNERS_MISSING).",
         "fields": [
           {
             "name": "id",

@@ -550,6 +582,11 @@
"name": "document_hash",
"type": "varchar(128)",
"nullable": true

-          },
-          {
-            "name": "published_at",
-            "type": "timestamptz",
-            "nullable": true
           }
         ],
         "indexes": [

@@ -567,6 +604,10 @@
{
"name": "ck_inf_rait_minutes_signed_complete",
"expression": "signed_at is null or (signed_by is not null and signature_kind is not null and signature_ref is not null)"

-          },
-          {
-            "name": "ck_inf_rait_minutes_published_needs_signature",
-            "expression": "published_at is null or signed_at is not null"
           }
         ],
         "foreignKeys": [

diff --git a/docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json b/docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json
index a5523c1..0095946 100644
--- a/docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json
+++ b/docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json
@@ -4,7 +4,7 @@
"module": {
"name": "RaitWorklist",
"namespace": "inf",

- "version": "1.0.0",

* "version": "1.1.0",
  "ddlFile": "35-inf-rait-worklist.sql",
  "dependencies": {
  "@detran/inf-rait-case": "workspace:*"
  @@ -24,70 +24,558 @@
  }
  ],
  "owners": ["detran-inf"],

- "description": "Distribuicao por pools e escada de SLA anti-prescricao (WF-RAIT-002): quatro relogios de extincao com bandeiras e cadeia de escalonamento."

* "description": "Distribuicao por pools e escada de SLA anti-prescricao (WF-RAIT-002): quatro relogios de extincao com bandeiras e cadeia de escalonamento. v1.1.0 acrescenta a organizacao do trabalho de WF-RAIT-004 secoes 3, 5, 6, 7 e 10: unidades de julgamento, escalas e plantao, lotes de sorteio, plantao de suplencia e bancas de sessao."
  },
  "database": {
  "entities": [
*      {
*        "name": "RaitUnit",
*        "table": "rait_unit",
*        "primaryKey": ["id"],
*        "description": "Unidade de julgamento (turma / JARI) — WF-RAIT-004 secao 7 e secao 10. Estados TURMA_* da secao 9; hoje uma unica JARI-AM (steering B.9) e coordenador exigido apenas quando houver mais de uma (Res. 357 itens 2.2-2.3).",
*        "fields": [
*          {
*            "name": "id",
*            "type": "uuid",
*            "default": "gen_random_uuid()"
*          },
*          {
*            "name": "tenant_id",
*            "type": "uuid"
*          },
*          {
*            "name": "name",
*            "type": "varchar(80)"
*          },
*          {
*            "name": "judging_body",
*            "type": "varchar(10)"
*          },
*          {
*            "name": "state",
*            "type": "varchar(30)",
*            "default": "'TURMA_ATIVA'"
*          },
*          {
*            "name": "coordinator_member_id",
*            "type": "uuid",
*            "nullable": true
*          }
*        ],
*        "indexes": [
*          {
*            "name": "ux_inf_rait_unit_name",
*            "columns": ["tenant_id", "judging_body", "name"],
*            "unique": true
*          },
*          {
*            "name": "ix_inf_rait_unit_state",
*            "columns": ["tenant_id", "state"]
*          }
*        ],
*        "checks": [
*          {
*            "name": "ck_inf_rait_unit_body",
*            "expression": "judging_body in ('jari','cetran')"
*          },
*          {
*            "name": "ck_inf_rait_unit_state",
*            "expression": "state in ('TURMA_ATIVA','TURMA_EM_CONSTITUICAO','TURMA_SUSPENSA')"
*          }
*        ]
*      },
       {
         "name": "RaitPool",
         "table": "rait_pool",
         "primaryKey": ["id"],

-        "description": "Pool de trabalho por instancia. Owner fixou os 3 pools base, sem segmentacao adicional (steering A.2).",

*        "description": "Pool de trabalho por instancia. Owner fixou os 3 pools base, sem segmentacao adicional (steering A.2). v1.1.0: unit_id liga o pool a uma turma/JARI (WF-RAIT-004 secao 10) e priority_policy registra a ordem unica de consumo das filas (secao 2, RN-RAIT-141).",
*        "fields": [
*          {
*            "name": "id",
*            "type": "uuid",
*            "default": "gen_random_uuid()"
*          },
*          {
*            "name": "tenant_id",
*            "type": "uuid"
*          },
*          {
*            "name": "name",
*            "type": "varchar(80)"
*          },
*          {
*            "name": "instance",
*            "type": "varchar(20)"
*          },
*          {
*            "name": "circuit",
*            "type": "integer"
*          },
*          {
*            "name": "strategy",
*            "type": "varchar(30)"
*          },
*          {
*            "name": "active",
*            "type": "boolean",
*            "default": "true"
*          },
*          {
*            "name": "unit_id",
*            "type": "uuid",
*            "nullable": true
*          },
*          {
*            "name": "priority_policy",
*            "type": "varchar(30)",
*            "default": "'ordem_unica'"
*          }
*        ],
*        "indexes": [
*          {
*            "name": "ux_inf_rait_pool_instance",
*            "columns": ["tenant_id", "instance"],
*            "unique": true,
*            "where": "unit_id is null"
*          },
*          {
*            "name": "ux_inf_rait_pool_instance_unit",
*            "columns": ["tenant_id", "instance", "unit_id"],
*            "unique": true,
*            "where": "unit_id is not null"
*          }
*        ],
*        "checks": [
*          {
*            "name": "ck_inf_rait_pool_instance",
*            "expression": "instance in ('defesa_previa','jari','cetran')"
*          },
*          {
*            "name": "ck_inf_rait_pool_strategy",
*            "expression": "strategy in ('pull','round_robin','load_balanced')"
*          },
*          {
*            "name": "ck_inf_rait_pool_priority_policy",
*            "expression": "priority_policy in ('ordem_unica')"
*          }
*        ],
*        "foreignKeys": [
*          {
*            "name": "fk_inf_rait_pool_unit",
*            "columns": ["unit_id"],
*            "references": {
*              "table": "inf.rait_unit",
*              "columns": ["id"]
*            }
*          }
*        ]
*      },
*      {
*        "name": "RaitPoolMember",
*        "table": "rait_pool_member",
*        "primaryKey": ["id"],
*        "description": "Membro do pool e sua situacao (WF-RAIT-002 secao 5). Mandato de 1-2 anos na JARI (RN-RAIT-116). v1.1.0: is_substitute marca o suplente (Res. 357 item 4.1.b.3, RN-RAIT-142) e jurisdiction a circunscricao da autoridade signataria (CTB art. 281; relacao das 55 autoridades pendente, steering H.48).",
*        "fields": [
*          {
*            "name": "id",
*            "type": "uuid",
*            "default": "gen_random_uuid()"
*          },
*          {
*            "name": "tenant_id",
*            "type": "uuid"
*          },
*          {
*            "name": "pool_id",
*            "type": "uuid"
*          },
*          {
*            "name": "person_id",
*            "type": "uuid"
*          },
*          {
*            "name": "member_role",
*            "type": "varchar(20)"
*          },
*          {
*            "name": "status",
*            "type": "varchar(20)",
*            "default": "'ATIVO'"
*          },
*          {
*            "name": "mandate_starts_on",
*            "type": "date",
*            "nullable": true
*          },
*          {
*            "name": "mandate_ends_on",
*            "type": "date",
*            "nullable": true
*          },
*          {
*            "name": "late_opinion_count",
*            "type": "integer",
*            "default": "0"
*          },
*          {
*            "name": "unjustified_absence_count",
*            "type": "integer",
*            "default": "0"
*          },
*          {
*            "name": "is_substitute",
*            "type": "boolean",
*            "default": "false"
*          },
*          {
*            "name": "jurisdiction",
*            "type": "varchar(80)",
*            "nullable": true
*          }
*        ],
*        "indexes": [
*          {
*            "name": "ux_inf_rait_pool_member",
*            "columns": ["tenant_id", "pool_id", "person_id"],
*            "unique": true
*          }
*        ],
*        "checks": [
*          {
*            "name": "ck_inf_rait_pool_member_role",
*            "expression": "member_role in ('analista','relator','presidente','coordenador','secretaria')"
*          },
*          {
*            "name": "ck_inf_rait_pool_member_status",
*            "expression": "status in ('ATIVO','IMPEDIDO','ADVERTIDO','AFASTADO_TEMP','MANDATO_ENCERRADO')"
*          },
*          {
*            "name": "ck_inf_rait_pool_member_mandate_order",
*            "expression": "mandate_ends_on is null or mandate_starts_on is null or mandate_ends_on >= mandate_starts_on"
*          }
*        ],
*        "foreignKeys": [
*          {
*            "name": "fk_inf_rait_pool_member_pool",
*            "columns": ["pool_id"],
*            "references": {
*              "table": "inf.rait_pool",
*              "columns": ["id"]
*            }
*          }
*        ]
*      },
*      {
*        "name": "RaitSchedule",
*        "table": "rait_schedule",
*        "primaryKey": ["id"],
*        "description": "Escala e plantao do membro — WF-RAIT-004 secao 3 e secao 10. Disponibilidade DISPONIVEL/EM_PLANTAO/AUSENTE_PROGRAMADO (secao 9); wip_limit nulo usa o parametro rait.wip.limit (ops.parameter, ADR-0021) e ausencia programada rebaixa o limite a zero.",
*        "fields": [
*          {
*            "name": "id",
*            "type": "uuid",
*            "default": "gen_random_uuid()"
*          },
*          {
*            "name": "tenant_id",
*            "type": "uuid"
*          },
*          {
*            "name": "pool_id",
*            "type": "uuid"
*          },
*          {
*            "name": "member_id",
*            "type": "uuid"
*          },
*          {
*            "name": "kind",
*            "type": "varchar(30)"
*          },
*          {
*            "name": "period_start",
*            "type": "date"
*          },
*          {
*            "name": "period_end",
*            "type": "date"
*          },
*          {
*            "name": "availability",
*            "type": "varchar(30)",
*            "default": "'DISPONIVEL'"
*          },
*          {
*            "name": "wip_limit",
*            "type": "integer",
*            "nullable": true
*          },
*          {
*            "name": "absence_reason",
*            "type": "varchar(30)",
*            "nullable": true
*          },
*          {
*            "name": "published_at",
*            "type": "timestamptz",
*            "nullable": true
*          },
*          {
*            "name": "published_by",
*            "type": "uuid",
*            "nullable": true
*          }
*        ],
*        "indexes": [
*          {
*            "name": "ux_inf_rait_schedule_member_period",
*            "columns": ["tenant_id", "member_id", "kind", "period_start"],
*            "unique": true
*          },
*          {
*            "name": "ix_inf_rait_schedule_pool_period",
*            "columns": ["tenant_id", "pool_id", "period_start"]
*          }
*        ],
*        "checks": [
*          {
*            "name": "ck_inf_rait_schedule_kind",
*            "expression": "kind in ('escala_semanal','plantao_risco','escala_assinatura','escala_balcao')"
*          },
*          {
*            "name": "ck_inf_rait_schedule_availability",
*            "expression": "availability in ('DISPONIVEL','EM_PLANTAO','AUSENTE_PROGRAMADO')"
*          },
*          {
*            "name": "ck_inf_rait_schedule_period_order",
*            "expression": "period_end >= period_start"
*          },
*          {
*            "name": "ck_inf_rait_schedule_absence_reason",
*            "expression": "absence_reason is null or absence_reason in ('ferias','licenca','curso','sessao_externa')"
*          },
*          {
*            "name": "ck_inf_rait_schedule_absence_reason_required",
*            "expression": "availability <> 'AUSENTE_PROGRAMADO' or absence_reason is not null"
*          },
*          {
*            "name": "ck_inf_rait_schedule_wip_limit_non_negative",
*            "expression": "wip_limit is null or wip_limit >= 0"
*          }
*        ],
*        "foreignKeys": [
*          {
*            "name": "fk_inf_rait_schedule_pool",
*            "columns": ["pool_id"],
*            "references": {
*              "table": "inf.rait_pool",
*              "columns": ["id"]
*            }
*          },
*          {
*            "name": "fk_inf_rait_schedule_member",
*            "columns": ["member_id"],
*            "references": {
*              "table": "inf.rait_pool_member",
*              "columns": ["id"]
*            }
*          }
*        ]
*      },
*      {
*        "name": "RaitScheduleSlot",
*        "table": "rait_schedule_slot",
*        "primaryKey": ["id"],
*        "description": "Dia coberto pela escala — WF-RAIT-004 secao 3. Disponibilidade efetiva por dia (base de RAIT.SCHEDULE_NO_DUTY_MEMBER, que informa a data); o turno nao tem vocabulario fixado por fonte e fica como OD, por isso o grao e o dia.",
*        "fields": [
*          {
*            "name": "id",
*            "type": "uuid",
*            "default": "gen_random_uuid()"
*          },
*          {
*            "name": "tenant_id",
*            "type": "uuid"
*          },
*          {
*            "name": "schedule_id",
*            "type": "uuid"
*          },
*          {
*            "name": "slot_on",
*            "type": "date"
*          },
*          {
*            "name": "availability",
*            "type": "varchar(30)",
*            "default": "'DISPONIVEL'"
*          },
*          {
*            "name": "absence_reason",
*            "type": "varchar(30)",
*            "nullable": true
*          }
*        ],
*        "indexes": [
*          {
*            "name": "ux_inf_rait_schedule_slot_day",
*            "columns": ["tenant_id", "schedule_id", "slot_on"],
*            "unique": true
*          }
*        ],
*        "checks": [
*          {
*            "name": "ck_inf_rait_schedule_slot_availability",
*            "expression": "availability in ('DISPONIVEL','EM_PLANTAO','AUSENTE_PROGRAMADO')"
*          },
*          {
*            "name": "ck_inf_rait_schedule_slot_absence_reason",
*            "expression": "absence_reason is null or absence_reason in ('ferias','licenca','curso','sessao_externa')"
*          },
*          {
*            "name": "ck_inf_rait_schedule_slot_absence_reason_required",
*            "expression": "availability <> 'AUSENTE_PROGRAMADO' or absence_reason is not null"
*          }
*        ],
*        "foreignKeys": [
*          {
*            "name": "fk_inf_rait_schedule_slot_schedule",
*            "columns": ["schedule_id"],
*            "references": {
*              "table": "inf.rait_schedule",
*              "columns": ["id"]
*            }
*          }
*        ]
*      },
*      {
*        "name": "RaitBatch",
*        "table": "rait_batch",
*        "primaryKey": ["id"],
*        "description": "Lote de sorteio de relator — WF-RAIT-004 secao 5 e secao 10. Estados LOTE_* da secao 9; semente e ordem auditaveis, ata do sorteio assinada pelo presidente (PAdES+TSA, steering A.8); lote semanal ou extraordinario (passos 1 e 7).",
         "fields": [
           {

-            "name": "id",
-            "type": "uuid",
-            "default": "gen_random_uuid()"

*            "name": "id",
*            "type": "uuid",
*            "default": "gen_random_uuid()"
*          },
*          {
*            "name": "tenant_id",
*            "type": "uuid"
*          },
*          {
*            "name": "pool_id",
*            "type": "uuid"
*          },
*          {
*            "name": "kind",
*            "type": "varchar(20)",
*            "default": "'semanal'"
*          },
*          {
*            "name": "week_start",
*            "type": "date"
*          },
*          {
*            "name": "state",
*            "type": "varchar(20)",
*            "default": "'LOTE_ABERTO'"
*          },
*          {
*            "name": "seed",
*            "type": "varchar(64)",
*            "nullable": true
*          },
*          {
*            "name": "opened_at",
*            "type": "timestamptz",
*            "default": "now()"
           },
           {

-            "name": "tenant_id",
-            "type": "uuid"

*            "name": "opened_by",
*            "type": "uuid",
*            "nullable": true
           },
           {

-            "name": "name",
-            "type": "varchar(80)"

*            "name": "drawn_at",
*            "type": "timestamptz",
*            "nullable": true
           },
           {

-            "name": "instance",
-            "type": "varchar(20)"

*            "name": "accepted_at",
*            "type": "timestamptz",
*            "nullable": true
           },
           {

-            "name": "circuit",
-            "type": "integer"

*            "name": "minutes_document_id",
*            "type": "uuid",
*            "nullable": true
           },
           {

-            "name": "strategy",
-            "type": "varchar(30)"

*            "name": "homologated_at",
*            "type": "timestamptz",
*            "nullable": true
           },
           {

-            "name": "active",
-            "type": "boolean",
-            "default": "true"

*            "name": "homologated_by",
*            "type": "uuid",
*            "nullable": true
           }
         ],
         "indexes": [
           {

-            "name": "ux_inf_rait_pool_instance",
-            "columns": ["tenant_id", "instance"],
-            "unique": true

*            "name": "ux_inf_rait_batch_pool_week",
*            "columns": ["tenant_id", "pool_id", "week_start"],
*            "unique": true,
*            "where": "kind = 'semanal'"
*          },
*          {
*            "name": "ix_inf_rait_batch_state",
*            "columns": ["tenant_id", "pool_id", "state"]
           }
         ],
         "checks": [
           {

-            "name": "ck_inf_rait_pool_instance",
-            "expression": "instance in ('defesa_previa','jari','cetran')"

*            "name": "ck_inf_rait_batch_kind",
*            "expression": "kind in ('semanal','extraordinario')"
           },
           {

-            "name": "ck_inf_rait_pool_strategy",
-            "expression": "strategy in ('pull','round_robin','load_balanced')"

*            "name": "ck_inf_rait_batch_state",
*            "expression": "state in ('LOTE_ABERTO','LOTE_SORTEADO','LOTE_ACEITO')"
*          },
*          {
*            "name": "ck_inf_rait_batch_seed_required",
*            "expression": "state = 'LOTE_ABERTO' or seed is not null"
*          },
*          {
*            "name": "ck_inf_rait_batch_draw_consistency",
*            "expression": "(state = 'LOTE_ABERTO' and drawn_at is null) or (state in ('LOTE_SORTEADO','LOTE_ACEITO') and drawn_at is not null)"
*          },
*          {
*            "name": "ck_inf_rait_batch_accept_consistency",
*            "expression": "(state = 'LOTE_ACEITO' and accepted_at is not null) or (state <> 'LOTE_ACEITO' and accepted_at is null)"
*          },
*          {
*            "name": "ck_inf_rait_batch_homologation_complete",
*            "expression": "homologated_at is null or homologated_by is not null"
*          }
*        ],
*        "foreignKeys": [
*          {
*            "name": "fk_inf_rait_batch_pool",
*            "columns": ["pool_id"],
*            "references": {
*              "table": "inf.rait_pool",
*              "columns": ["id"]
*            }
           }
         ]
       },
       {

-        "name": "RaitPoolMember",
-        "table": "rait_pool_member",

*        "name": "RaitBatchItem",
*        "table": "rait_batch_item",
         "primaryKey": ["id"],

-        "description": "Membro do pool e sua situacao (WF-RAIT-002 secao 5). Mandato de 1-2 anos na JARI (RN-RAIT-116).",

*        "description": "Item do lote de sorteio — WF-RAIT-004 secao 5 passos 4-5. Posicao na ordem sorteada, relator designado, claim_due_on do T-CLAIM (rait.timer.T-CLAIM, 2 dias uteis) e recusa por impedimento ou suspeicao, que redistribui ao proximo da ordem no mesmo lote.",
         "fields": [
           {
             "name": "id",

@@ -99,70 +587,95 @@
"type": "uuid"
},
{

-            "name": "pool_id",

*            "name": "batch_id",
             "type": "uuid"
           },
           {

-            "name": "person_id",

*            "name": "case_id",
             "type": "uuid"
           },
           {

-            "name": "member_role",
-            "type": "varchar(20)"

*            "name": "position",
*            "type": "integer"
           },
           {

-            "name": "status",
-            "type": "varchar(20)",
-            "default": "'ATIVO'"

*            "name": "member_id",
*            "type": "uuid",
*            "nullable": true
           },
           {

-            "name": "mandate_starts_on",

*            "name": "claim_due_on",
             "type": "date",
             "nullable": true
           },
           {

-            "name": "mandate_ends_on",
-            "type": "date",

*            "name": "accepted_at",
*            "type": "timestamptz",
             "nullable": true
           },
           {

-            "name": "late_opinion_count",
-            "type": "integer",
-            "default": "0"

*            "name": "declined_at",
*            "type": "timestamptz",
*            "nullable": true
           },
           {

-            "name": "unjustified_absence_count",
-            "type": "integer",
-            "default": "0"

*            "name": "decline_kind",
*            "type": "varchar(20)",
*            "nullable": true
           }
         ],
         "indexes": [
           {

-            "name": "ux_inf_rait_pool_member",
-            "columns": ["tenant_id", "pool_id", "person_id"],

*            "name": "ux_inf_rait_batch_item_case",
*            "columns": ["tenant_id", "batch_id", "case_id"],
*            "unique": true
*          },
*          {
*            "name": "ux_inf_rait_batch_item_position",
*            "columns": ["tenant_id", "batch_id", "position"],
             "unique": true
           }
         ],
         "checks": [
           {

-            "name": "ck_inf_rait_pool_member_role",
-            "expression": "member_role in ('analista','relator','presidente','coordenador','secretaria')"

*            "name": "ck_inf_rait_batch_item_decline_kind",
*            "expression": "decline_kind is null or decline_kind in ('impedimento','suspeicao')"
           },
           {

-            "name": "ck_inf_rait_pool_member_status",
-            "expression": "status in ('ATIVO','IMPEDIDO','ADVERTIDO','AFASTADO_TEMP','MANDATO_ENCERRADO')"

*            "name": "ck_inf_rait_batch_item_decline_complete",
*            "expression": "(declined_at is null and decline_kind is null) or (declined_at is not null and decline_kind is not null)"
           },
           {

-            "name": "ck_inf_rait_pool_member_mandate_order",
-            "expression": "mandate_ends_on is null or mandate_starts_on is null or mandate_ends_on >= mandate_starts_on"

*            "name": "ck_inf_rait_batch_item_outcome_exclusive",
*            "expression": "accepted_at is null or declined_at is null"
*          },
*          {
*            "name": "ck_inf_rait_batch_item_claim_needs_member",
*            "expression": "claim_due_on is null or member_id is not null"
           }
         ],
         "foreignKeys": [
           {

-            "name": "fk_inf_rait_pool_member_pool",
-            "columns": ["pool_id"],

*            "name": "fk_inf_rait_batch_item_batch",
*            "columns": ["batch_id"],
             "references": {

-              "table": "inf.rait_pool",

*              "table": "inf.rait_batch",
*              "columns": ["id"]
*            }
*          },
*          {
*            "name": "fk_inf_rait_batch_item_case",
*            "columns": ["case_id"],
*            "references": {
*              "table": "inf.rait_case",
*              "columns": ["id"]
*            }
*          },
*          {
*            "name": "fk_inf_rait_batch_item_member",
*            "columns": ["member_id"],
*            "references": {
*              "table": "inf.rait_pool_member",
               "columns": ["id"]
             }
           }

@@ -172,7 +685,7 @@
"name": "RaitAssignment",
"table": "rait_assignment",
"primaryKey": ["id"],

-        "description": "Atribuicao de caso a membro. Reatribuir preserva estado e dossie (AC-RAIT-011-1); motivo e obrigatorio e tipado (AC-RAIT-011-2).",

*        "description": "Atribuicao de caso a membro. Reatribuir preserva estado e dossie (AC-RAIT-011-1); motivo e obrigatorio e tipado (AC-RAIT-011-2). v1.1.0: claim_due_at e o vencimento do T-CLAIM e batch_id liga a atribuicao ao lote de sorteio (WF-RAIT-004 secao 5 e secao 10).",
         "fields": [
           {
             "name": "id",

@@ -219,6 +732,16 @@
"name": "active",
"type": "boolean",
"default": "true"

-          },
-          {
-            "name": "claim_due_at",
-            "type": "timestamptz",
-            "nullable": true
-          },
-          {
-            "name": "batch_id",
-            "type": "uuid",
-            "nullable": true
           }
         ],
         "indexes": [

@@ -268,6 +791,14 @@
"table": "inf.rait_pool_member",
"columns": ["id"]
}

-          },
-          {
-            "name": "fk_inf_rait_assignment_batch",
-            "columns": ["batch_id"],
-            "references": {
-              "table": "inf.rait_batch",
-              "columns": ["id"]
-            }
           }
         ]
       },

@@ -275,7 +806,7 @@
"name": "RaitImpediment",
"table": "rait_impediment",
"primaryKey": ["id"],

-        "description": "Impedimento declarado por caso (RN-RAIT-116; CONTRAN-357 5.1.c). Impede redistribuicao ao mesmo membro (AC-RAIT-011-3).",

*        "description": "Impedimento declarado por caso (RN-RAIT-116; CONTRAN-357 5.1.c). Impede redistribuicao ao mesmo membro (AC-RAIT-011-3). v1.1.0: kind distingue impedimento de suspeicao e legal_basis registra o artigo (Lei 9.784 arts. 18-20), com decided_by de quem decidiu a declaracao (WF-RAIT-004 secao 10).",
         "fields": [
           {
             "name": "id",

@@ -302,6 +833,21 @@
"name": "declared_at",
"type": "timestamptz",
"default": "now()"

-          },
-          {
-            "name": "kind",
-            "type": "varchar(20)",
-            "default": "'impedimento'"
-          },
-          {
-            "name": "legal_basis",
-            "type": "varchar(160)",
-            "nullable": true
-          },
-          {
-            "name": "decided_by",
-            "type": "uuid",
-            "nullable": true
           }
         ],
         "indexes": [

@@ -328,6 +874,140 @@
"columns": ["id"]
}
}

-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_impediment_kind",
-            "expression": "kind in ('impedimento','suspeicao')"
-          }
-        ]
-      },
-      {
-        "name": "RaitSubstituteDuty",
-        "table": "rait_substitute_duty",
-        "primaryKey": ["id"],
-        "description": "Plantao de suplencia por sessao — WF-RAIT-004 secao 3 (linha \"Plantao de suplencia\") e secao 6 regra (a): o suplente de plantao e convocado antes de qualquer outro quando a banca fica BANCA_INSUFICIENTE (RN-RAIT-142). session_id sem FK: inf.rait_session nasce no DDL 36, posterior ao 35.",
-        "fields": [
-          {
-            "name": "id",
-            "type": "uuid",
-            "default": "gen_random_uuid()"
-          },
-          {
-            "name": "tenant_id",
-            "type": "uuid"
-          },
-          {
-            "name": "session_id",
-            "type": "uuid"
-          },
-          {
-            "name": "member_id",
-            "type": "uuid"
-          },
-          {
-            "name": "designated_at",
-            "type": "timestamptz",
-            "default": "now()"
-          },
-          {
-            "name": "designated_by",
-            "type": "uuid",
-            "nullable": true
-          },
-          {
-            "name": "convened_at",
-            "type": "timestamptz",
-            "nullable": true
-          }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_substitute_duty",
-            "columns": ["tenant_id", "session_id", "member_id"],
-            "unique": true
-          }
-        ],
-        "foreignKeys": [
-          {
-            "name": "fk_inf_rait_substitute_duty_member",
-            "columns": ["member_id"],
-            "references": {
-              "table": "inf.rait_pool_member",
-              "columns": ["id"]
-            }
-          }
-        ]
-      },
-      {
-        "name": "RaitBench",
-        "table": "rait_bench",
-        "primaryKey": ["id"],
-        "description": "Banca da sessao — WF-RAIT-004 secao 6. Estados BANCA_* da secao 9, contagem de confirmacoes contra o quorum e paridade observada do CETRAN (parametro session.quorum.cetran_parity, ops.parameter). session_id sem FK: inf.rait_session nasce no DDL 36, posterior ao 35.",
-        "fields": [
-          {
-            "name": "id",
-            "type": "uuid",
-            "default": "gen_random_uuid()"
-          },
-          {
-            "name": "tenant_id",
-            "type": "uuid"
-          },
-          {
-            "name": "session_id",
-            "type": "uuid"
-          },
-          {
-            "name": "state",
-            "type": "varchar(30)",
-            "default": "'BANCA_PREVISTA'"
-          },
-          {
-            "name": "confirmed_count",
-            "type": "integer",
-            "default": "0"
-          },
-          {
-            "name": "parity_observed",
-            "type": "boolean",
-            "nullable": true
-          },
-          {
-            "name": "confirmed_at",
-            "type": "timestamptz",
-            "nullable": true
-          },
-          {
-            "name": "insufficient_at",
-            "type": "timestamptz",
-            "nullable": true
-          }
-        ],
-        "indexes": [
-          {
-            "name": "ux_inf_rait_bench_session",
-            "columns": ["tenant_id", "session_id"],
-            "unique": true
-          }
-        ],
-        "checks": [
-          {
-            "name": "ck_inf_rait_bench_state",
-            "expression": "state in ('BANCA_PREVISTA','BANCA_CONFIRMADA','BANCA_INSUFICIENTE')"
-          },
-          {
-            "name": "ck_inf_rait_bench_confirmed_complete",
-            "expression": "state <> 'BANCA_CONFIRMADA' or confirmed_at is not null"
-          },
-          {
-            "name": "ck_inf_rait_bench_insufficient_complete",
-            "expression": "state <> 'BANCA_INSUFICIENTE' or insufficient_at is not null"
-          },
-          {
-            "name": "ck_inf_rait_bench_confirmed_count_non_negative",
-            "expression": "confirmed_count >= 0"
-          }
         ]
       },
       {

@@ -498,6 +1178,11 @@
"api": {
"basePath": "/v1/inf/rait/",
"resources": [

-      {
-        "entity": "RaitUnit",
-        "path": "units",
-        "resource": "rait-unit"
-      },
       {
         "entity": "RaitPool",
         "path": "pools",

@@ -508,6 +1193,26 @@
"path": "pool-members",
"resource": "rait-pool-member"
},

-      {
-        "entity": "RaitSchedule",
-        "path": "schedules",
-        "resource": "rait-schedule"
-      },
-      {
-        "entity": "RaitScheduleSlot",
-        "path": "schedule-slots",
-        "resource": "rait-schedule-slot"
-      },
-      {
-        "entity": "RaitBatch",
-        "path": "batches",
-        "resource": "rait-batch"
-      },
-      {
-        "entity": "RaitBatchItem",
-        "path": "batch-items",
-        "resource": "rait-batch-item"
-      },
       {
         "entity": "RaitAssignment",
         "path": "assignments",

@@ -518,6 +1223,16 @@
"path": "impediments",
"resource": "rait-impediment"
},

-      {
-        "entity": "RaitSubstituteDuty",
-        "path": "substitute-duties",
-        "resource": "rait-substitute-duty"
-      },
-      {
-        "entity": "RaitBench",
-        "path": "benches",
-        "resource": "rait-bench"
-      },
       {
         "entity": "RaitClock",
         "path": "clocks",

diff --git a/docs/framework/blueprints/README.md b/docs/framework/blueprints/README.md
index b7ef089..8800631 100644
--- a/docs/framework/blueprints/README.md
+++ b/docs/framework/blueprints/README.md
@@ -29,3 +29,12 @@ on any missing, changed, or extra generated file. It runs as part of root
Example: `BP-INF-AIT-001` imports `NormativeModule` from `@detran/inf-normative` and registers
`AitCommandsController` and `AIT_LIFECYCLE_PROVIDER`; `BP-INF-NORMATIVE-001` exports
`NormativeLifecycleService`. + +`module.ddlFile` (optional) overrides the default generated DDL filename
+(`30-<namespace>-<kebab(name)>.sql`) whenever the real migration number falls outside that
+default range — e.g. `38-inf-infraction.sql`, `39-inf-rait-org.sql`, `57-inf-collection.sql`, +`58-inf-rait-integration.sql`, `59-inf-notification.sql` (R-0006). +
+Not every package under `backend/domains/inf/` is generated: some are entirely handwritten and
+have no blueprint at all — e.g. `@detran/inf-deadlines` in `backend/domains/inf/deadlines`
+(ADR-0016 §2), consumed by generated modules through their own dependencies/`handwrittenExports`.
diff --git a/docs/meta/agents/orchestra/README.md b/docs/meta/agents/orchestra/README.md
index 2a838b1..52c9fe8 100644
--- a/docs/meta/agents/orchestra/README.md
+++ b/docs/meta/agents/orchestra/README.md
@@ -64,9 +64,13 @@ O detalhe está em `maestro-prompt.template.md`. 8. **Política prova presença e ausência**: toda matriz de grants tem testes positivos para os
papéis listados e negativos para todos os papéis canônicos omitidos. Grants derivados por
analogia são proibidos; qualquer ampliação exige fonte canônica ou decisão do Owner.
-9. **Histórico publicado não se reescreve**: rebase é permitido somente antes do primeiro push.

- Depois de publicar o branch, integre avanços do upstream ou de `main` com merge normal, rode de
- novo os gates e faça push sem força. `--force`, `--force-with-lease` e equivalentes são proibidos.
  +9. **Fixtures provadas no CI**: toda rodada que entrega fixtures (`backend/database/seed/*.sql`) prova

* `bash backend/database/seed.sh` em banco limpo **e** o job `backend-kernel` executa `seed.sh` após o
* reset (passo criado em R-0006); um seed novo que não carrega sob `seed.sh` é `plant-bug` da rodada que
* o criou (R-0004: `05-parameters.sql` sem contexto de tenant abortava o seed e o CI não percebia).
  +10. **Histórico publicado não se reescreve**: rebase é permitido somente antes do primeiro push.
* Depois de publicar o branch, integre avanços do upstream ou de `main` com merge normal, rode de
* novo os gates e faça push sem força. `--force`, `--force-with-lease` e equivalentes são proibidos.

## 5. Parcimônia de tokens

@@ -79,7 +83,9 @@ O detalhe está em `maestro-prompt.template.md`.

- **Workers pequenos por padrão**; médio só para modelagem, guardas de estado e frontend com
  STYNX/Angular; grande nunca como worker.
- **Esforço baixo para transcrição, alto só para decisão**; o reviewer roda uma vez por prompt e
- uma vez por entrega (máximo dois ciclos de REVIEW por item; depois escala ao humano).

* uma vez por entrega (máximo dois ciclos de REVIEW por item; depois escala ao humano). O primeiro
* ciclo é exaustivo; os seguintes ficam **restritos aos itens corrigidos** (R-0006: sete ciclos de
* prompt-review com achados novos sobre texto inalterado a cada ciclo).

- **Corte por janela**: se o orçamento da janela acabar, o maestro grava `checkpoint` (estado das
  tarefas em `plan.md` §Retomada) e para; a próxima sessão retoma pelo mesmo prompt.
- **Nunca reler o que já está em `plan.md`**: o plano é a memória da orquestra.
  diff --git a/docs/meta/agents/orchestra/model-ladder.md b/docs/meta/agents/orchestra/model-ladder.md
  index a61055f..203e870 100644
  --- a/docs/meta/agents/orchestra/model-ladder.md
  +++ b/docs/meta/agents/orchestra/model-ladder.md
  @@ -42,14 +42,15 @@ fase de planejamento.

## Orçamento de referência (calibrar em `budget.json`)

| -   | Item                                                | Ordem de grandeza por ocorrência                                                         |
| --- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| -   | planejamento do maestro (leitura + plano + prompts) | 150–300 k tokens de entrada, 30–60 k de saída                                            |
| -   | tarefa de worker pequeno                            | 30–80 k                                                                                  |
| -   | tarefa de worker médio                              | 80–200 k                                                                                 |
| -   | chamada do reviewer                                 | 20–60 k                                                                                  |
| -   | checkpoint (gates, sem LLM)                         | 0                                                                                        |
| +   | Item                                                | Ordem de grandeza por ocorrência                                                         |
| +   | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| +   | planejamento do maestro (leitura + plano + prompts) | 150–300 k tokens de entrada, 30–60 k de saída                                            |
| +   | tarefa de worker pequeno (Sonnet)                   | 30–80 k únicos; **120–200 k brutos** com releituras em cache (R-0006: 124–195 k)         |
| +   | tarefa de worker médio (Opus)                       | 80–200 k únicos; **160–360 k brutos** (R-0006: 160–363 k, 44–110 chamadas de ferramenta) |
| +   | chamada do reviewer                                 | 20–60 k                                                                                  |
| +   | checkpoint (gates, sem LLM)                         | 0                                                                                        |

Regra prática por janela de 5 h de uma família: **um** planejamento de maestro ou **seis a oito**
-tarefas de worker pequeno com suas revisões. Duas frentes simultâneas só se forem de famílias
+tarefas de worker pequeno com suas revisões. Contabilize em `budget.json` os tokens **únicos** (convenção
+de R-0003/R-0006: ≈ ¼ dos brutos do subagente) e registre os brutos na nota da entrada. Duas frentes simultâneas só se forem de famílias
diferentes.
diff --git a/docs/meta/agents/orchestra/reviewer-prompt.template.md b/docs/meta/agents/orchestra/reviewer-prompt.template.md
index 280cf94..c4dc6c8 100644
--- a/docs/meta/agents/orchestra/reviewer-prompt.template.md
+++ b/docs/meta/agents/orchestra/reviewer-prompt.template.md
@@ -40,6 +40,12 @@

- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

+Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
+seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
+texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
+ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
+(ajuste R-0006). +

## Saída (JSON, e nada mais)

```json
diff --git a/docs/meta/knowledge-base/backlog.md b/docs/meta/knowledge-base/backlog.md
index 250e3b0..bea39ff 100644
--- a/docs/meta/knowledge-base/backlog.md
+++ b/docs/meta/knowledge-base/backlog.md
@@ -353,8 +353,8 @@ citação de regras fechada em cinco dos seis apps (RAIT em 32/43 — ver abaixo

- [x] **Decidir a substituição de [WF-INF-001] por [WF-INF-003]** — **DECIDIDO pelo Owner em
      2026-09-12 (ADR-0014):** WF-INF-003 substitui WF-INF-001; ponteiro mantido, referências
-      atualizadas, WF-INF-003 promovido a `reviewed`. Runtime: agregado da infração ainda sem
-      blueprint (ver ADR-0014 §Consequências)
+      atualizadas, WF-INF-003 promovido a `reviewed`. Runtime: agregado da infração com blueprint
+      `BP-INF-INFRACTION-001` desde R-0006 (CTG-0001, PR #39; ver ADR-0014 §Consequências)
- [ ] **Reconciliar a escada do relógio B** — [RN-RAIT-112] (4 degraus, crítico em 21 meses) ×
      [WF-RAIT-002] §4.1 (5 degraus, crítico em 23 meses, aprovado em steering A.1) (added 2026-09-12)
- [ ] **Desfecho de `T-NA-IND` vencido** (NA ao condutor indicado não expedida em 30 dias do protocolo
@@ -369,9 +369,9 @@ citação de regras fechada em cinco dos seis apps (RAIT em 32/43 — ver abaixo
      divisão de circunscrições ([RN-RAIT-143], [WF-RAIT-004] §3) — `institutional-ask` (added 2026-09-12)
- [ ] **Taxa de recurso à JARI/CETRAN e throughput de sessão** (DT-064) — fecha o dimensionamento
      de [WF-RAIT-004] §8 e o gatilho de nova turma ([RN-RAIT-139]) (added 2026-09-12)
-- [ ] **Blueprint BP-INF-RAIT-WORKLIST-001** — deltas de modelo de dados propostos em
+- [x] **Blueprint BP-INF-RAIT-WORKLIST-001** — deltas de modelo de dados propostos em
      [WF-RAIT-004] §10 (unidade/turma, escala, lote de sorteio, suplência, tipo de impedimento,
-      banca) — decisão do Architect (added 2026-09-12)
+      banca) — entregue em R-0006 (CTG-0002, TASK-0004; PR pendente) (added 2026-09-12)

## Rodada de definições para a orquestra de agentes — RAIT (2026-09-12)

diff --git a/package.json b/package.json
index 2a178c9..45f85ca 100644
--- a/package.json
+++ b/package.json
@@ -16,7 +16,7 @@
    "format:check": "prettier --check .",
    "format": "prettier --write .",
    "typecheck": "pnpm -r --if-present run typecheck",
-    "build": "pnpm --filter @detran/shared build && pnpm --filter @detran/senatran-adapter build && pnpm --filter @detran/sefaz-adapter build && pnpm --filter @detran/portal-complaints build && pnpm --filter @detran/ch-clinical-network build && pnpm --filter @detran/ch-patients build && pnpm --filter @detran/ch-encounters build && pnpm --filter @detran/ch-biometrics build && pnpm --filter @detran/ch-exams build && pnpm --filter @detran/ch-clinical-controls build && pnpm --filter @detran/ch-inconsistencies build && pnpm --filter @detran/ch-operational-controls build && pnpm --filter @detran/ch-clinical-reports build && pnpm --filter @detran/ch-process-blocks build && pnpm --filter @detran/ch-telehealth build && pnpm --filter @detran/ch-billing build && pnpm --filter @detran/ch-scheduling build && pnpm --filter @detran/ch-restrictions build && pnpm --filter @detran/ch-retention build && pnpm --filter @detran/ch-juntas build && pnpm --filter @detran/ch-toxicology build && pnpm --filter @detran/inf-normative build && pnpm --filter @detran/inf-ait build && pnpm --filter @detran/inf-measures build && pnpm --filter @detran/inf-alcohol build && pnpm --filter @detran/inf-rait-case build && pnpm --filter @detran/inf-rait-worklist build && pnpm --filter @detran/inf-rait-session build && pnpm --filter @detran/inf-speed build && pnpm --filter @detran/ops-parameter build && pnpm --filter @detran/app build && pnpm --filter @detran/ui build && pnpm --filter @detran/inf-deadlines build && pnpm --filter @detran/inf-infraction build && pnpm --filter @detran/inf-notification build",
+    "build": "pnpm --filter @detran/shared build && pnpm --filter @detran/senatran-adapter build && pnpm --filter @detran/sefaz-adapter build && pnpm --filter @detran/portal-complaints build && pnpm --filter @detran/ch-clinical-network build && pnpm --filter @detran/ch-patients build && pnpm --filter @detran/ch-encounters build && pnpm --filter @detran/ch-biometrics build && pnpm --filter @detran/ch-exams build && pnpm --filter @detran/ch-clinical-controls build && pnpm --filter @detran/ch-inconsistencies build && pnpm --filter @detran/ch-operational-controls build && pnpm --filter @detran/ch-clinical-reports build && pnpm --filter @detran/ch-process-blocks build && pnpm --filter @detran/ch-telehealth build && pnpm --filter @detran/ch-billing build && pnpm --filter @detran/ch-scheduling build && pnpm --filter @detran/ch-restrictions build && pnpm --filter @detran/ch-retention build && pnpm --filter @detran/ch-juntas build && pnpm --filter @detran/ch-toxicology build && pnpm --filter @detran/inf-normative build && pnpm --filter @detran/inf-ait build && pnpm --filter @detran/inf-measures build && pnpm --filter @detran/inf-alcohol build && pnpm --filter @detran/inf-rait-case build && pnpm --filter @detran/inf-rait-worklist build && pnpm --filter @detran/inf-rait-session build && pnpm --filter @detran/inf-speed build && pnpm --filter @detran/ops-parameter build && pnpm --filter @detran/app build && pnpm --filter @detran/ui build && pnpm --filter @detran/inf-deadlines build && pnpm --filter @detran/inf-infraction build && pnpm --filter @detran/inf-notification build && pnpm --filter @detran/inf-collection build && pnpm --filter @detran/inf-rait-org build && pnpm --filter @detran/inf-rait-integration build",
    "verify:decorators": "tsx tools/verify-controller-decorators.ts",
    "verify:rls-ddl": "tsx tools/check-rls-ddl.ts",
    "verify:role-catalog": "tsx tools/check-role-catalog.ts",
@@ -29,8 +29,8 @@
    "backend:db:apply": "bash backend/database/apply.sh",
    "backend:db:reset": "bash backend/database/apply.sh --full",
    "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
-    "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration",
+    "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit",
+    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
    "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/inf-ait test:e2e",
    "backend:test:real": "pnpm --filter @detran/app test:real",
    "backend:test:in-house": "pnpm --filter @detran/app test:in-house",
```

### Nota do maestro

Responda apenas com o JSON do §Saída.
