# R-0010 — frente `boat-backend` (WP-B0…B3 do BOAT: política, modelo `est/crash`, comandos, sincronização, RENAEST e contratos)

**Status:** prompts aprovados por `reviews/prompt-review-6.json` (`PASS`); correção de TASK-0003 aprovada por `prompt-review-8.json` (`PASS`). TASK-0001…0005 concluídas; CTG-0001 aguarda correção de C-1-13 na coleção e `delivery-review` válido. Checkpoint de orçamento da janela 2 em §Retomada. Aberto sobre `origin/main` em
`09963911d3d37e4e2ce7e7d79f853bf78f6a71a9`; autorização do Owner em
`AUTHORIZATION.md`. Reviewer: Opus via `tools/orchestra/bridge.sh claude`.
**Concorrência:** abre já e **nenhum grupo está preso**: R-0005 e R-0008 estão em `main`. Fila de sincronização em `backend/domains/ops/offline-sync` (contrato em `work/rounds/R-0008/contracts/CTG-0002.md`; schema `docs/framework/schemas/teat-offline-sync-batch.schema.json`); evidência em `backend/domains/ops/evidence`; `DetranError`, `check-commands.mjs`, `contracts:clients` (`@detran/api-clients`) e `policy-routes.e2e.spec.ts` prontos (estender com `est:*`). Lock `policy.ts` com R-0007 `rait-backend` (blocos `est:*` × `RAIT_*`): quem mesclar depois integra `main`.
**Janelas previstas:** 3.

## Metas

1. **Reconciliação e política** (WP-B0): `policy.ts` `est:crash-record:*` alinhado ao corpus
   (`attach-sketch` + `processing-operator`; `validate` = `processing-operator`, `traffic-authority`;
   novas ações `record-duty`, `add-damage`, `add-witness`, `link`, `record`, `complement`, `cancel`,
   `transmit`, `rectify`, `archive`, `subject-request`; leitura de `crash-victim` **com finalidade**);
   `docs/framework/product/domains/est/boat/use-cases/INDEX.md` com status reais (UC-012 não é stub);
   novo `UC-BOAT-013` (dever de resposta ao titular, W-05) — artefato novo: `artifactIdCount` do
   `import-manifest.json` sobe 521 → 522.
2. **Modelo** (WP-B1): `BP-EST-CRASH-001` (namespace `est`): `crash_record` (campos da origem +
   `severity` obrigatório, `location_reference`, `source_*`, `version`; checks de estado [WF-BOAT-001],
   `occurred_at <= recorded_at`, gravidade × vítimas no fechamento — função; derivação
   `est.severity.derivation=worst_victim`, H.43), `crash_vehicle` (sem `evaded`; `plate` PII com
   retenção por parâmetro), `crash_person` (+ `refused_data`; PII), `crash_victim` (`pii: sensitive-health`,
   retenção `est.retention.*` — H.45: 5/5/10 anos vigentes; acesso com finalidade), `crash_scene_duty`,
   `crash_damage`, `crash_witness`, `crash_sketch`, `crash_link` (`kind: ait|measure`, sem FK rígida),
   `crash_renaest_submission`, `crash_subject_request`; refs `est.crash_state_ref`, `crash_severity_ref`,
   `scene_duty_ref`, `crash_condition_ref` (valores do protótipo, `source_pending`, H.42),
   `damage_asset_kind_ref`; `verify:lifecycle-vocabulary` estendido ao `est`. DDL **`70-est-crash.sql`**
   (o build pack cita `40-est-crash.sql`, número já ocupado por `40-ch-clinical-network.sql`; corrigir
   o build pack). Timer `T-BOAT-TRANSM` (`est.renaest.transmit_period=monthly`, OD-B04/DT-017) com `owner='sinistro'`.
   Fixtures: um registro por estado local, um por situação nacional, com/sem vítima, um com retificação.
3. **Comandos, sincronização e RENAEST** (WP-B2, `boat-route-contract.md` §3–§7): comandos em
   `src/handwritten/`; aplicador do item `crash-record` na sincronização do TEAT (transação única,
   independência recíproca); gate gravidade × vítimas; leitura de vítima com `purpose` e auditoria;
   `transmit`/`rectify` via outbox + `RenaestPort` com mapeamento campo a campo em
   `docs/framework/contracts/renaest-mapping.md` (campos "a confirmar" DT-061); espelho da situação
   nacional; job `T-BOAT-TRANSM`; relatório preliminar/BAT em PDF/A pela fachada de documentos
   (ADR-0018, R-0006); projeções `portal.crash_view` (projetor real), `dashboard.crashes` (limiar
   `dashboard.cell_threshold=10`), `integration.renaest_mirror`; SSE.
4. **Contratos** (WP-B3): `BP-EST-CRASH-001.commands.openapi.json`; `docs/framework/schemas/boat-crash-record-sync-item.schema.json`
   (payload canônico da fila); `renaest-mapping.md` como tabela.
5. Documentação: `boat-build-pack.md` §WP-B0…B3 executados (DDL 70); `decision-closure-plan.md` gate #5;
   backlog.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                                           | Depende de           | Entrega                                                                                                                                                       |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-product-boat`, `MOD-kb-manifest`                                          | —                    | `use-cases/INDEX.md`, `UC-BOAT-013`, manifesto 522                                                                                                            |
| TASK-0002 | Architect            | architect-blueprint | Terra / alto   | `MOD-bp-est-crash`, `MOD-ddl-70`, `MOD-ddl-19`                                 | —                    | blueprint + refs + função de gravidade + timer; tabela de regras `est:*` × papéis; critérios                                                                  |
| TASK-0003 | Inspector            | inspector-tests     | Luna / médio   | `MOD-est-tests`, `MOD-shared-policy-spec`                                      | TASK-0002            | testes: `policy.spec.ts` (`est:*`), matriz [WF-BOAT-001]/[WF-BOAT-003], gravidade × vítimas, duplicidade por chave natural, terminal sem correção, RLS, seeds |
| TASK-0004 | Engineer             | engineer-backend    | Luna / médio   | `MOD-est-crash`, `MOD-shared-policy`, `MOD-app-module`, `MOD-tools-vocabulary` | TASK-0003            | módulo gerado, política, vocabulário, fixtures; testes verdes                                                                                                 |
| TASK-0005 | Architect            | architect-blueprint | Terra / alto   | `MOD-contracts-renaest-mapping`                                                | TASK-0002            | `renaest-mapping.md` campo a campo (contrato do mock; "a confirmar" onde depender dos Manuais)                                                                |
| TASK-0006 | Inspector            | inspector-tests     | Luna / médio   | `MOD-est-commands-tests`                                                       | TASK-0004, TASK-0005 | testes dos comandos, do aplicador de sincronização, do `RenaestPort` e2e no mock, das projeções (replay)                                                      |
| TASK-0007 | Engineer             | engineer-backend    | Terra / médio  | `MOD-est-handwritten`, `MOD-integration-outbox`                                | TASK-0006            | comandos, aplicador, transmissão/retificação, espelho, job, PDF/A, projeções, SSE; testes verdes                                                              |
| TASK-0008 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-contracts-commands`, `MOD-schemas`                                        | TASK-0007            | contrato de comandos + schema da fila; gate completo no checkpoint do maestro                                                                                 |
| TASK-0011 | Inspector            | inspector-tests     | Luna / médio   | `MOD-contracts-check-tests`                                                    | TASK-0008            | testes de catálogos TEAT/BOAT por prefixo e correspondência bidirecional de rotas                                                                             |
| TASK-0010 | Engineer             | engineer-backend    | Luna / médio   | `MOD-contracts-check`                                                          | TASK-0011            | gate de comandos: catálogos TEAT/BOAT por prefixo, controladores est/crash; satisfaz testes do Inspector                                                      |
| TASK-0009 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                                     | TASK-0010            | build pack (DDL 70), closure plan, backlog                                                                                                                    |

CTG-0001 = 0001…0004; CTG-0002 = 0005…0008 + 0010…0011. Um PR por CTG. TASK-0008 → TASK-0011 → TASK-0010 → TASK-0009; a numeração preserva os IDs iniciais.

**Checkpoint de dependências:** após TASK-0002 o maestro roda `pnpm install`, preserva a atualização de `pnpm-lock.yaml` para o commit do grupo após PASS do reviewer, roda `pnpm contracts:clients` para o OpenAPI gerado e só então libera TASK-0003. Após TASK-0008, o maestro roda `pnpm contracts:clients` antes de TASK-0011; após TASK-0010, roda `pnpm contracts:check`; o Engineer de TASK-0007 inclui `@detran/est-crash` nos três scripts `backend:test:*` da raiz.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → 522 artefatos / 446 tokens após TASK-0001 (baseline atualizado
  no mesmo commit; qualquer outro número é erro).
- `pnpm blueprints:check`, `pnpm contracts:check`, `pnpm contracts:clients` → OK.
- `pnpm verify:rls-ddl`, `pnpm verify:lifecycle-vocabulary` (cobrindo `est.*_ref`), `pnpm verify:senatran-boundary`,
  `pnpm verify:decorators` → OK.
- `DB_NAME=detran_r10 DB_PASSWORD=postgres bash backend/database/apply.sh --full` + `seed.sh` duas vezes → OK.
- `pnpm --filter @detran/shared test` → `policy.spec.ts` cobre 100 % de `est:*`; `pnpm --filter @detran/est-crash test:unit|test:integration|test:e2e` → verdes.
- `pnpm senatran-adapter:test:ci` → verde (RENAEST no mock); `pnpm backend:test:ci`, `pnpm check` → verdes.

## Mapa entregável → definições

| Entregável | Definição                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| política   | `boat-build-pack.md` §WP-B0; steering H.39 (`est:crash-record` reconciliado em WP-T0); `policy.ts` `est:*`   |
| modelo     | `boat-build-pack.md` §WP-B1; origem `BP-CRASH-RECORDS-001`; [WF-BOAT-001…003]; [UC-BOAT-012]; H.42/H.43/H.45 |
| comandos   | `boat-route-contract.md` §3–§7; `boat-error-catalog.md`; `teat-route-contract.md` §4 (fila)                  |
| RENAEST    | `RenaestPort`/mock (`SinistroRequest`) em `packages/senatran-adapter`; OD-B08 (DT-061)                       |
| LGPD       | `lgpd-assessment.md`; steering H.44 (inventário art. 28 PN 002/2026); [REF-ANPD-GUIA-PODER-PUBLICO-2024]     |
| parâmetros | `parameter-catalogue.md` (`est.*`, `dashboard.cell_threshold`)                                               |

## Riscos

- `policy.ts` lock com `portal-backend` (R-0009): blocos distintos; rebase da segunda.
- `UC-BOAT-013` é edição de corpus de produto (papel Owner delegado): texto só a partir de W-05 e
  [RN-BOAT-*]; sem regra nova.
- Retenção `est.retention.*` vigente por H.45, bodycam pendente: eliminação opera com listagem, nunca automática.

## Concorrência

Bootstrap de 2026-09-16: `origin/main` contém R-0005 (`c4f055e`, PR #45), R-0006
(`0f7587f`, PR #46) e R-0008 (`ea63084`, PR #52). O `git log --oneline -30
origin/main` confirma os commits recentes de R-0008; `gh pr list --state merged
--limit 20` confirma os PRs de upstream. `gh pr list --state open` retornou
lista vazia. `orchestra/rait-backend` e `orchestra/portal-backend` têm
worktrees locais, sem PR aberto no bootstrap. Os grupos CTG-0001 e CTG-0002
estão liberados para desenvolvimento e merge sem base empilhada. O lock
compartilhado de `policy.ts` com R-0007 fica serializado por revisão da `main`
antes de cada PR; integrar avanços por merge normal após o primeiro push.

## Bloqueios

Histórico do gate: `prompt-review-2.json` foi **FAIL** estrutural. O reviewer constatou que TASK-0010
atribui testes e implementação ao mesmo Engineer, contrariando a tríade do
Art. 24. A revisão também apontou critérios inalcançáveis no sequenciamento de
contratos/clientes, ações de política ausentes, listas de leitura incompletas e
o pacote novo sem um passo explícito de `pnpm install` entre TASK-0002 e
TASK-0003. Os achados completos, com arquivo/linha/correção sugerida, estão em
`reviews/prompt-review-2.json`. O §5 de `prompts/00-maestro.md` exige parar em
`FAIL`; os achados foram corrigidos e `prompt-review-6.json` deu **PASS**, liberando os workers. O primeiro chamado
ao reviewer produziu JSON inválido e foi rejeitado pela ponte, sem veredito.

## Triagem

- TASK-0003 tentativa 0: `reference-gap` — a lista fechada de leitura não incluía
  `19-est-lifecycle-vocabulary.sql`, `70-est-crash.sql`, o blueprint gerado e
  `seed.sh`. O Inspector executou suites sintaticamente válidas, mas não escreveu
  `70-fixtures-est-crash.sql` e não cobriu todos C-1-nn; os testes de política e
  comandos falham legitimamente por implementação ausente. Reenvio da mesma
  tarefa com fontes explícitas e cobrança da matriz completa, sem ajustar testes
  para passar.
- TASK-0003 tentativa 1: `sensor-error` — a spec de integração executou quatro
  testes verdes, mas contou constraints, catálogos e fixtures sem tentar
  inserções inválidas ou provar RLS entre tenants. A fixture não representa uma
  retificação em `crash_renaest_submission`. C-1-13 e guardas de transição
  ficaram sem teste executável. Escalada ao Inspector no nível Terra, sem
  relaxar os REDs de política/comandos; o maestro confirmou 185 testes shared
  PASS + 1 FAIL esperado, 1 unit FAIL esperado e 4 integration PASS.
- TASK-0004 primeira entrega: `plant-bug` — gates de política, unidade e banco
  ficaram verdes, mas a revisão do maestro encontrou grants CRUD por analogia
  para recursos sem papel definido e rotas provisórias que simulavam
  `transmit`, `rectify` e `record-duty` sem seus efeitos contratuais.
  `pnpm install` corrigiu o link de workspace e o typecheck do app passou;
  follow-up ao Engineer para remover grants/rotas especulativos ou implementar
  os efeitos reais dentro do escopo, preservando REDs de WP-B2 para TASK-0007.
- TASK-0004 tentativa 1: `plant-bug` — grants especulativos e efeitos falsos
  foram removidos; shared/unit/integration e typecheck do app passaram após
  `pnpm install`. Porém `verify:lifecycle-vocabulary` ainda verifica só `inf`,
  apesar do critério explícito de estender a `est` em WP-B1. Escalada ao Engineer
  Terra para fechar essa cobertura e revisar a montagem do módulo sem editar
  testes ou DDL manual.
- TASK-0006 tentativa 0: `sensor-error` — o Inspector escreveu 17 testes de
  presença de strings (`readFileSync` + `toContain`), que podem passar sem os
  comportamentos exigidos por C-2-01…17. Reenvio da mesma tarefa para testes
  executáveis de comandos, DB, adapter, projeções e SSE; não aceitar sensores
  textuais como prova de efeitos ou isolamento.
- CTG-0001 `delivery-review-CTG-0001-cycle-2.json`: `REVIEW` com seis achados
  altos corrigíveis. O Inspector escalado move os REDs HTTP de WP-B2 e limita
  o gate de rotas ao corte efetivamente montado; o maestro vincula os papéis de
  leitura, sincroniza o índice UC e retira `start` provisório; o Architect
  amplia o blueprint para chave natural, tipo de retificação e check do espelho,
  e o Inspector atualiza fixtures/testes. Repetir gates e revisão restrita.

## Retomada

Checkpoint da janela 2 em 2026-09-16: entrada estimada 790.000/800.000
(limiar de 80% = 640.000), incluindo a revisão de entrega com diff completo.
Parada conforme §§0 e 9 do prompt. `pnpm check` completo **PASS** após o ajuste de
leitura de vítima (914 handlers, 193 tabelas com RLS, vocabulário EST coberto).
Teste HTTP C-1-13 direcionado PASS com `DATABASE_URL` e `DB_NAME` em `detran_r10`:
400 sem finalidade; 200 com finalidade e evento em `audit.events.details.metadata`.

- **Concluídas:** TASK-0001…0005. Relatórios em `reports/`. CTG-0001 contém
  WP-B0/B1; adenda A-2 do contrato registra que C-1-14…C-1-17 e os REDs HTTP
  de transmissão, retificação e conduta cabem a TASK-0006/0007 em CTG-0002.
- **Revisão de entrega:** `reviews/delivery-review-CTG-0001.md` foi enviado por
  `bridge.sh claude opus`, mas a ponte rejeitou a resposta por JSON inválido.
  **Sem veredito aceito.** O diagnóstico visível apontou lacuna high: o
  interceptor exige finalidade só em `GET /v1/est/crash/victims/:id`; a coleção
  `GET /v1/est/crash/victims` ainda expõe campos de saúde sem finalidade/auditoria.
  Corrigir a correspondência de rota e acrescentar teste HTTP da coleção sem e
  com `purpose`, sem enfraquecer C-1-13. Rever demais achados se recuperáveis da
  ponte; nova revisão com JSON válido é obrigatória antes de commit.
- **Pendentes:** CTG-0001 delivery-review PASS, commit/evidência/PR/CI/merge;
  TASK-0006, TASK-0007, TASK-0008, TASK-0011, TASK-0010, TASK-0009; CTG-0002
  delivery-review/commit/evidência/PR/CI/merge; `audit observe`, `round close`,
  atualização de histórico/backlog e limpeza do branch remoto.
- **Estado git:** branch `orchestra/boat-backend` em
  `09963911d3d37e4e2ce7e7d79f853bf78f6a71a9`, sem commit/push/PR da rodada.
  `git add -N` foi aplicado aos novos arquivos apenas para compor o diff completo;
  não há conteúdo staged. A revisão de 974 KiB é material de trabalho. Antes do
  PR, `git fetch -q origin` e integrar avanço de `main` segundo §1.
- **Próximos passos:** corrigir o GET de coleção e o teste C-1-13; rodar gates
  direcionados e `pnpm check` após mudança material. Pedir nova revisão Opus
  com resposta JSON válida (evitar o prompt de 974 KiB se a ponte tiver limite;
  o diff completo permanece no arquivo anterior e o reviewer pode ler a
  worktree). Após PASS, seguir §9. A fonte CPF e o erro de recusa do titular
  ainda aguardam resposta do Owner; a rota cidadã permanece fechada.

## Leitura

Em `09963911d3d37e4e2ce7e7d79f853bf78f6a71a9`, o maestro leu, nesta ordem:
`AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`,
`docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`,
`docs/framework/arch/boat-build-pack.md` inteiro, `boat-route-contract.md`,
`boat-error-catalog.md`, `parameter-catalogue.md`,
`docs/meta/knowledge-base/decision-closure-plan.md`, `steering.md` §H,
`docs/meta/agents/{architect-blueprint,engineer-backend,engineer-frontend,inspector-tests,transcriber-docs}.md`
e este plano. Definições adicionais ficam nas listas fechadas dos workers.
