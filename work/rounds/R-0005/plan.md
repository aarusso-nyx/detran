# R-0005 — frente `ops-agency` (WP-T1 do TEAT: modelo de dados de `ops/*` e deltas dos blueprints `inf`)

**Status:** CTG-0001 implementado, rebaseado sobre `origin/main@34062b5` e validado. A revisão
focal pós-rebase retornou REVIEW apenas por evidência imprecisa; a correção append-only foi
confirmada no ciclo 2 com PASS e zero highs. Ainda sem push ou PR. Reviewer: Opus 5 via
`tools/orchestra/bridge.sh claude`.
**Concorrência:** abre com `origin/main` ≥ 80d705a; merge por grupo acoplado — nenhum upstream para grupo algum (decisão do Owner, 2026-09-14: abre em paralelo à onda 1). Pontos de rebase com R-0004 `param-store`: `backend/app/src/app.module.ts` e `docs/framework/blueprints/BP-INF-NORMATIVE-001.json`; se R-0004 retomar na janela Sol, grave `checkpoint` ao fim do CTG-0001 e ceda a janela.
**Janelas previstas:** 2 (CTG-0001/0002 na primeira; CTG-0003 e docs na segunda).

## Metas

1. **`ops/agency` mínimo** (steering H.40, OD-T02/OD-013): blueprint `BP-OPS-AGENCY-001`
   (namespace `ops`; entidades `agency_unit`, `agency_jurisdiction` (circunscrição),
   `agency_competence`; sem convênios), DDL gerado `13-ops-agency.sql` (antes de
   `13-ops-field-operations.sql` na ordem lexicográfica do `apply.sh`), ADR curta (número livre
   seguinte em `docs/meta/adr/README.md`; previsto ADR-0023) registrando o corte "mínimo agora,
   `agency-context` completo depois".
2. **Substituição do DDL manual do `ops`** por blueprints (teat-build-pack WP-T1):
   `BP-OPS-FIELD-001` (`agent_profile`, `operational_device`, `device_event`, `homologation`,
   `application_version`, `operation`, `team`, `team_agent`, `patrol_vehicle`,
   `measurement_instrument`, `shift` com estado sem CHECK enquanto a origem não publicar o
   vocabulário canônico (reference-gap registrado em §Bloqueios), `approach`, `session_handoff`;
   FKs e os CHECKs respaldados pela origem que o DDL manual não tem; `ddlFile` mantém
   `13-ops-field-operations.sql`),
   `BP-OPS-SNAPSHOTS-001` (`person`, `person_document`, `vehicle`, `vehicle_snapshot`,
   `external_query`; DDL `16-ops-snapshots.sql`), `BP-OPS-EVIDENCE-001` (`evidence` com enum de
   status, `evidence_link`, `custody_event`, `probative_package` + item,
   `evidence_access_request` [RN-TEAT-142], `storage_intent`; DDL `17-ops-evidence.sql`),
   `BP-OPS-OFFLINE-SYNC-001` (`ait_numbering_range`, `numbering_reservation`,
   `numbering_consumption`, `sync_batch`, `sync_queue_item` com `idempotency_key` único por
   tenant, `sync_receipt`, `sync_conflict`; DDL `18-ops-offline-sync.sql`). Os módulos manuscritos
   atuais `backend/domains/ops/{core,evidence-custody,operations,snapshots}` migram para módulos
   gerados; `field-operations.controller.ts` e afins entram como `handwrittenControllers` do
   blueprint dono (padrão de `BP-INF-AIT-001`). `BP-OPS-PROVISIONING-001` fica para R-0013 (WP-T5).
3. **Deltas dos blueprints `inf`** (v1.1.0): `BP-INF-AIT-001` (`ait_ait.current_status` com check
   = tokens de [WF-TEAT-001]; `ait_cancel_request` + `ait_cancel_request_event`;
   `ait_ait.version`; `speed_measurement_id?`), `BP-INF-NORMATIVE-001`
   (`normative_metrological_table`; `normative_framing.approach_class` `caso_1|caso_2|caso_3`,
   `required_fields`, `required_instrument`, `points_label`; `document_template.document_kind`,
   `signature_policy` — ADR-0018), `BP-INF-MEASURES-001` (`administrative_term.withdrawal_deadline_at`
   - `ctb_deadline_at` (OD-T05), `signer_name`, `field_details_json`, `source_*`; checks de estado
     [WF-TEAT-004] e de prazo ≤30/≤15), `BP-INF-ALCOHOL-001` (`alcohol_procedure.*` da origem,
     `alcohol_test.considered_mg_l` + `max_error_mg_l`, `alcohol_refusal.kind`,
     `psychomotor_sign.sign_group/status/method`). `AitLifecycleService` passa a usar os tokens
     canônicos (hoje `draft/issued/…`).
4. **Vocabulário e timers**: `14-inf-lifecycle-vocabulary.sql` ganha `inf.ait_state_ref`
   ([WF-TEAT-001]) e `tools/check-lifecycle-vocabulary.ts` passa a cobrir o AIT; prazos
   `T-REG30`, `T-REG15`, `T-NOTIF10`, `T-DEPOSITO6M`, `T-CNH5D`, `T-SNE2027` em
   `inf.infraction_timer_ref` com `owner='medida'` (a tabela nasce em R-0006 se ainda não existir:
   neste caso, registrar em §Bloqueios e entregar os timers como seed pendente).
5. **Fixtures** em `backend/database/seed/`: um AIT por estado, uma reserva por estado, um pacote
   normativo publicado, um dispositivo por postura; `seed.sh` idempotente.
6. Documentação: `teat-build-pack.md` §WP-T1 marcado executado; `docs/framework/blueprints/README.md`;
   `backend/domains/ops/README.md`; `teat-route-contract.md` §2 atualizado para os pacotes e
   blueprints WP-T1; `decision-closure-plan.md` gate #3 fechado; backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                                                                   | Depende de           | Entrega                                                                                                                                     |
| --------- | ------------ | ------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Terra / alto   | blueprint, pacote gerado, DDL e OpenAPI de `ops/agency` + manifesto gerado + ADR                                       | —                    | `BP-OPS-AGENCY-001`, ADR curta, critérios                                                                                                   |
| TASK-0002 | Architect    | architect-blueprint | Terra / alto   | blueprints, pacotes gerados, DDLs e OpenAPI de `ops/{field,snapshots,evidence,offline-sync}` + manifesto gerado        | TASK-0001            | quatro blueprints `ops`, mapa "tabela manual → entidade gerada", lista de controladores a migrar                                            |
| TASK-0003 | Inspector    | inspector-tests     | Luna / médio   | `MOD-ops-tests`                                                                                                        | TASK-0001, TASK-0002 | testes: CHECKs/FKs por tabela (integração), RLS (`verify:rls-ddl` + `backend:rls-smoke`), unicidade de `idempotency_key`, estado de `shift` |
| TASK-0004 | Engineer     | engineer-backend    | Luna / médio   | `MOD-ops-modules`, `MOD-app-module`, `MOD-app-vitest`, `MOD-ddl-20-rls`                                                | TASK-0003            | `pnpm blueprints:generate`; migração dos módulos manuscritos para gerados + `handwrittenControllers`; `AppModule`; testes verdes            |
| TASK-0005 | Architect    | architect-blueprint | Terra / alto   | `MOD-bp-inf-ait`, `MOD-bp-inf-normative`, `MOD-bp-inf-measures`, `MOD-bp-inf-alcohol`, `MOD-ddl-14`, `MOD-seed-timers` | TASK-0002            | deltas v1.1.0 dos quatro blueprints; `inf.ait_state_ref`; timers `owner='medida'`; critérios                                                |
| TASK-0006 | Inspector    | inspector-tests     | Luna / médio   | `MOD-inf-tests`                                                                                                        | TASK-0005            | testes: checks de estado/prazo, `verify:lifecycle-vocabulary` cobrindo AIT, `AitLifecycleService` com tokens canônicos                      |
| TASK-0007 | Engineer     | engineer-backend    | Luna / médio   | `MOD-inf-modules`, `MOD-tools-vocabulary`                                                                              | TASK-0006            | regeneração `inf`, `AitLifecycleService` migrado, `check-lifecycle-vocabulary.ts`; testes verdes                                            |
| TASK-0008 | Engineer     | engineer-backend    | Luna / baixo   | `MOD-seed`                                                                                                             | TASK-0004, TASK-0007 | fixtures TEAT em `backend/database/seed/`; `seed.sh` duas execuções sem erro                                                                |
| TASK-0009 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                                                                             | TASK-0008            | build pack, READMEs, `decision-closure-plan.md`, backlog                                                                                    |

CTG-0001 = TASK-0001…0004 (ops); CTG-0002 = TASK-0005…0007 (inf); CTG-0003 = TASK-0008. TASK-0009 simples.
Um PR por CTG (a frente é grande); CTG-0001 mescla primeiro.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check` e `pnpm contracts:check` → sincronizados após `pnpm blueprints:generate`
  (formatar o blueprint com prettier **antes** de regenerar: o cabeçalho leva o sha256 do blueprint).
- Depois da primeira geracao que criar pacotes workspace, `pnpm install` → lockfile atualizado e
  links dos novos pacotes disponiveis antes de typecheck e testes.
- `pnpm verify:rls-ddl` → OK; `pnpm backend:rls-smoke` → OK (contagem de tabelas com tenant sobe;
  o sensor executavel atual e `tools/check-rls-smoke.ts`).
- `pnpm verify:lifecycle-vocabulary` → OK, cobrindo `inf.ait_state_ref`.
- `DB_NAME=detran_r5 DB_PASSWORD=postgres bash backend/database/apply.sh --full` → `apply.sh: done`;
  `DB_NAME=detran_r5 DB_PASSWORD=postgres bash backend/database/seed.sh` duas vezes → sem erro;
  `DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r5 pnpm backend:rls-smoke`
  → verde no mesmo banco.
- `pnpm --filter @detran/inf-ait test:unit` e `pnpm --filter @detran/inf-ait test:integration`
  (com `DETRAN_TEST_DATABASE_URL`) → verdes; os modulos ops sao cobertos pelos testes integration
  e e2e de `@detran/app` criados em TASK-0003.
- `pnpm backend:test:ci` → verde; `pnpm check` → verde; `node tools/docs/kb/check.mjs` → 521/446.
- Em TASK-0004, `backend:db:reset` usa `DB_NAME=detran_r5 DB_PASSWORD=postgres` e
  `backend:test:ci` usa `DETRAN_TEST_DATABASE_URL` apontando para o mesmo banco.

## Mapa entregável → definições

| Entregável       | Definição                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `ops/agency`     | steering H.40; `decision-closure-plan.md` §1 item 3; [RN-TEAT-003]; `teat-route-contract.md` (bootstrap)                                   |
| blueprints `ops` | `teat-build-pack.md` §WP-T1 (tabela); origem `../teat` `BP-MOBILE-OPERATIONS-001` (somente leitura); INV-EVIDENCE-001, INV-OFFLINE-001     |
| deltas `inf`     | [WF-TEAT-001…005], [UC-TEAT-011], [RN-TEAT-108], [RN-TEAT-124…128], [RN-TEAT-133], [RN-TEAT-134]; OD-T05                                   |
| timers           | [WF-TEAT-004], [WF-TEAT-005]; `rait-deadline-engine.md` §Entradas; `parameter-catalogue.md` (`teat.*`)                                     |
| padrão de módulo | `BP-INF-AIT-001` (`handwrittenControllers`/`handwrittenProviders`/`moduleImports`), ADR-0007 adendo; `docs/framework/blueprints/README.md` |
| erros            | `teat-error-catalog.md`                                                                                                                    |

## Riscos

- `13-ops-field-operations.sql` manual é substituído por DDL gerado com o mesmo nome: em banco
  existente exige `DROP`/`ALTER` idempotente; em CI o banco é sempre limpo.
- Os módulos `ops/*` manuscritos têm testes próprios: migrar os testes junto, nunca apagar.
- Preparacao autorizada em 2026-09-14: `FrozenSnapshotService` e `FrozenSnapshotController` foram
  relocados sem mudanca de comportamento para `backend/domains/ops/snapshots/src/handwritten/`
  antes de qualquer geracao. O blueprint SNAPSHOTS deve preservar e reexportar esses caminhos; o
  gerador nao pode ser executado se os campos handwritten correspondentes estiverem ausentes.
- `inf.infraction_timer_ref` pertence ao agregado da infração (R-0006, ADR-0014/0016). Se a
  tabela não existir ao executar a TASK-0005, os timers `owner='medida'` ficam como arquivo de seed
  pendente (`backend/database/seed/30-fixtures-teat-timers.sql`, aplicado só quando a tabela existir)
  e o fato entra em §Bloqueios para o maestro de R-0006.
- `policy.ts` **não** é tocado nesta frente (WP-T2 em R-0008); `roles.ts` idem.
- Abertura em paralelo à onda 1: `AppModule` (R-0004 monta `ops/parameter`) e `BP-INF-NORMATIVE-001`
  (R-0004 pode mexer nele pela view de compatibilidade) são os pontos de rebase; se R-0004 retomar na
  janela Sol, esta frente grava `checkpoint` ao fim do CTG-0001 e cede a janela.

## Concorrência

- Bootstrap em 80d705a7d2b1c08538867a0d80fd7b069d7b07bc, atualizado para
  ca5c260a967ef8ac43157e106814e83fd93592a3 (PR #34) e, no checkpoint, para
  bafae6d23073cf64f8bfc176f2219fb270fd28ae (fechamento R-0003, PR #35). Antes da correcao
  preparatoria, a worktree foi atualizada sem conflitos para
  d8fe83a96b0301d27015de5958507cdad4a06d75 (PR #36).
- R-0003/WP-D0 está em main pelo PR #32; o fechamento administrativo segue no PR #35.
- R-0004/param-store está ativo na worktree própria, em planejamento/revisão, sem entrega
  funcional mesclada. Seus pontos de lock compartilhado com esta frente são AppModule e
  BP-INF-NORMATIVE-001.
- CTG-0001, CTG-0002, CTG-0003 e TASK-0009 não têm upstream obrigatório para merge por decisão
  do Owner de 2026-09-14; todos partem diretamente de origin/main, sem base empilhada.
- Por R-0004 estar ativo na janela Sol, esta sessão executa CTG-0001, grava checkpoint e cede a
  janela antes de CTG-0002. Antes de qualquer PR, fetch e rebase sobre origin/main são obrigatórios.

## Bloqueios

- O high de `prompt-review-3` foi corrigido por autorizacao humana: `FrozenSnapshotService` e
  `FrozenSnapshotController` foram relocados para `src/handwritten` antes de qualquer geracao; o
  indice publico apenas os reexporta. TASK-0002 exige que o blueprint preserve os caminhos e
  TASK-0004 nao pode migra-los novamente. Prompt-review-4 confirmou que nenhum alvo do gerador cai
  sob `src/handwritten` e encerrou esse high com PASS.
- A janela 3 consumiu 2.266.746 tokens de entrada reportados, acima do checkpoint de 640.000.
- Excecao humana em 2026-09-14: prompt-review-4 com Opus 5 pode ultrapassar o budget de tokens;
  essa excecao nao se estende a workers ou a chamadas posteriores.
- A primeira invocacao de prompt-review-4 foi rejeitada pela ponte antes de produzir registro:
  o reviewer emitiu JSON invalido com texto nao escapado. Classificacao `sensor-error`; o prompt
  recebeu somente uma regra de serializacao estrita e a mesma revisao foi repetida.
- Os seis lows do prompt-review foram incorporados literalmente depois do PASS: TASK-0004 agora
  instala/liga workspaces, aposenta os pacotes operations/evidence-custody dentro da fronteira e
  usa `detran_r5`; TASK-0006 coloca o teste do sensor num runner real; `waves.md` alinha o upstream
  e registra o historico de R-0005. Isso altera os hashes de TASK-0004
  e TASK-0006; o Owner autorizou explicitamente atualizar os lows e disparar os workers sem novo
  ciclo de prompt-review.
- As duas delivery-reviews ordinarias para CTG-0001 retornaram `REVIEW`. A segunda apontou dois
  highs (juncao de rotas OpenAPI com `//` e tags nulas por ausencia de `resource`) e dois lows
  (nomes de quatro rotas e locks incompletos dos outputs gerados). A escalacao Architect Sol
  corrigiu todos os quatro pontos e passou os checks deterministas. O Owner autorizou uma terceira
  revisao excepcional, que retornou `PASS` com zero highs e quatro lows.
- Lows da terceira revisao: atualizar a secao 2 de `teat-route-contract.md` em TASK-0009; endurecer
  `generate-openapi.mjs` contra barras duplas e tags nulas do blueprint example; reconciliar no
  plano o reference-gap de `Shift.status`; e exigir em WP-T2 testes positivos/negativos das chaves
  OPS herdadas, incluindo decisao explicita sobre collection read de shift. Nenhum desses lows foi
  implementado nesta chamada de review.
- Roteamento dos quatro lows antes do commit de CTG-0001: documentacao de rotas -> TASK-0009;
  hardening global de `generate-openapi.mjs` e regeneracao do example -> frente dedicada de
  orchestra-hardening, fora dos locks deste CTG; `Shift.status` -> reference-gap explicitado nesta
  meta e mantido no contrato CTG-0001; matriz positiva/negativa de OPS e decisao sobre collection
  read de shift -> R-0008/WP-T2. Nenhum low amplia o codigo de CTG-0001.
- Reference-gap: a origem TEAT `BP-MOBILE-OPERATIONS-001.json` nao declara CHECK nem vocabulario
  fechado para `Shift.status`. O CTG preserva a coluna sem inventar tokens; o CHECK fica bloqueado
  ate a autoridade de produto publicar o conjunto canonico.
- A estimativa da janela 6 ultrapassou o checkpoint de 640.000 tokens de entrada; CTG-0002 nao
  pode iniciar nesta janela e tambem deve ceder a concorrencia ativa de R-0004.

## Retomada

Checkpoint da janela 1 em 2026-09-14:

- Concluido: sync/bootstrap, baseline verde, leitura Architect, decomposicao em TASK-0001...0009,
  prompts fechados, tasks, compositions e prompt-review-1.
- Ultimo veredito: prompt-review-3 REVIEW. Os highs da iteracao 2 foram fechados, mas a revisao
  final encontrou uma colisao destrutiva entre o gerador e o pacote manuscrito `ops/snapshots`.
- Concluido na janela 4: sync para d8fe83a; relocacao preparatoria sem perda do modulo snapshots
  no commit 98fcf673f39d3179ddfa333932c2805e2f911f77; prompts TASK-0002/0004/0006/0008 e plano
  alinhados aos achados conhecidos. Typecheck, build e `pnpm check` passaram. O script `test`
  isolado de `@detran/ops-snapshots` nao possui `--passWithNoTests` e terminou com "No test files
  found", classificado como sensor preexistente.
- Ultimo veredito: prompt-review-4 PASS, sem highs e com seis lows. A barreira de prompt-review
  liberou CTG-0001; os lows foram incorporados sob autorizacao humana posterior.
- Concluidas: TASK-0001/0002 Architect e TASK-0003 Inspector, incluindo a iteracao 1 da fixture
  `sync_queue_item`. Checkpoints Architect verdes; a integracao Inspector passou com 10/10 testes
  depois de aplicar os DDLs no banco isolado `detran_r5`.
- Implementacao local concluida: CTG-0001, TASK-0001...TASK-0004 e as remediacoes das duas
  delivery-reviews. TASK-0005...TASK-0009 permanecem queued; nenhum worker de CTG-0002 foi
  iniciado por concorrencia ativa com R-0004.
- Ultimo veredito de entrega: `delivery-review-ctg-0001-3` = `PASS`, zero highs e quatro lows. Os
  dois highs e dois lows do ciclo 2 foram confirmados fechados sem regressao dos seis highs
  anteriores. O gate de delivery-review de CTG-0001 esta liberado.
- Pendente imediato: decisao do Owner sobre incorporar os quatro lows antes do commit. Esta chamada
  nao autorizou commit, evidencia, push, PR ou inicio de CTG-0002.
- Checkpoint registrado ao fim do CTG-0001: a janela 6 excedeu o limite estimado e cede a janela a
  R-0004; CTG-0002 nao deve iniciar.
- Integracao retomada por autorizacao do Owner: R-0004 mesclou no PR #38; CTG-0001 foi rebaseado
  sobre `34062b5`, preservando `ops/parameter` junto dos cinco modulos OPS. Gates pos-rebase
  passaram. A revisao focal ciclo 1 retornou REVIEW por descricao pre-rebase nos resultados da
  evidencia; a sequencia 2 corrigiu os resultados sem editar a sequencia 1. Ciclo focal 2 retornou
  PASS com zero highs. Proximo passo: commit administrativo, push, PR, CI e merge; CTG-0002 segue
  sem workers ate esse merge.

## Triagem

- Integracao pos-rebase: a primeira execucao de `backend:test:ci` terminou em `sensor-error`
  antes de observar `@detran/ops-parameter`, porque `pnpm install --lockfile-only` atualizou o
  lockfile sem criar seus links locais. `pnpm install --frozen-lockfile` materializou o workspace;
  a repeticao integral passou com parameter unit 57/57, parameter integration 1/1, app unit 54/54,
  app integration 11/11 e app e2e 12/12. O erro de observacao nao foi classificado como PASS ou
  FAIL e sera preservado na evidencia corretiva append-only.
- TASK-0004 iteracao 0: `plant-bug` na referencia Architect. `BP-OPS-SNAPSHOTS-001` ordenou
  `VehicleSnapshot` antes de `ExternalQuery`, mas a primeira cria FK para
  `ops.snapshots_external_query`; `backend:db:reset` falha antes dos testes. Varredura dos cinco
  blueprints confirmou que essa era a unica FK intra-blueprint futura. TASK-0002 iteracao 1
  reordenou sem mudar o contrato; sensor de ordem, blueprints, contratos e RLS passaram.
  TASK-0004 iteracao 1 retomada para reset/testes.
- TASK-0004 iteracao 1 revelou `test-bug` na fixture Inspector: o teste usava `entity_id` e
  `operation`, ausentes do blueprint aprovado, e omitia campos obrigatorios do contrato gerado.
  TASK-0003 iteracao 1 alinhou somente a fixture a `agent_id`, `local_entity_id`,
  `created_locally_at` e `payload_hash`, preservando a assercao UNIQUE
  `(tenant_id, idempotency_key)`; verificacao independente passou 10/10 testes de integracao.
- TASK-0004 iteracao 2 revelou `sensor-error` de ambiente no gate composto: somente
  `DETRAN_TEST_DATABASE_URL` apontava para `detran_r5`, enquanto o `AppModule` resolve seus pools
  por `DATABASE_URL`; isso dividia clients e pipeline entre dois bancos e produzia falso 503 no
  rate limiter PostgreSQL. Sem alterar codigo ou testes, alinhar ambas as URLs a `detran_r5`
  tornou o e2e verde (12/12) e o `backend:test:ci` completo PASS. `pnpm check` independente PASS.
- A primeira tentativa de `delivery-review-ctg-0001` produziu ao menos um finding high, mas a
  ponte recusou a saida antes de materializar JSON/registro por erro de normalizacao. O prompt foi
  endurecido para JSON RFC 8259 sem crases e a mesma revisao sera repetida; nenhum veredito foi
  inferido do payload rejeitado.
- A segunda tentativa da mesma delivery-review retornou payload completo `REVIEW` com seis highs
  e tres lows, mas a ponte rejeitou somente as fences Markdown. O JSON foi recuperado
  mecanicamente do stderr, sem mudar semantica; verificacao independente confirmou os highs de
  geometria, uniqueness, rotas, smoke gate e ADR. A correcao volta a Architect -> Inspector ->
  Engineer; nenhum commit foi liberado.
- Remediacao do delivery-review: TASK-0001 iteracao 1 e TASK-0002 iteracao 2 declararam `api`
  canonica nos cinco blueprints e geraram 32 contratos; FIELD/EVIDENCE recuperaram seis campos
  SRID-4674, dois GiST e UNIQUE de Evidence por tenant/hash; ADR-0006 foi emendada para distinguir
  CRUD gerado WP-T1 dos comandos/protocolo handwritten posteriores. TASK-0003 iteracao 2 adicionou
  a duplicidade Evidence, rotas canonicas e assercoes HTTP 200/cross-tenant nao condicionais.
- O e2e RLS local precisa separar owner/app: `DATABASE_URL` e `DETRAN_TEST_DATABASE_URL` usam
  `detran_r5`, enquanto `STYNX_APP_DATABASE_URL`/`STYNX_READER_DATABASE_URL` entram com
  `options=-c role=role_app_backend`; usar postgres superuser no pool app ignora RLS e invalida o
  sensor. Com a separacao, e2e 12/12 e `backend:test:ci` PASS.
- Lows do review: a assercao e2e frouxa foi corrigida; `backend/domains/ops/README.md` ja integra o
  escopo explicito de TASK-0009; os novos pacotes nao tem specs locais nesta fase e sua cobertura
  deliberada e pelos testes integration/e2e de `@detran/app`, portanto os filtros de
  `backend:test:unit` so entram quando existirem specs de pacote em WP-T2.
- Sensor resolvido na retomada: o JSON bruto da ponte foi formatado mecanicamente conforme o
  precedente de R-0004 e o output_sha256 do registro foi atualizado; a semantica nao mudou.
- A segunda delivery-review retornou `REVIEW` com dois highs: contratos OpenAPI continham `//` na
  juncao de `basePath` com paths iniciados em barra e tags nulas porque quatro blueprints omitiam
  `resources[].resource`. Os lows pediram nomes fechados (`agents`, `devices`,
  `numbering-ranges`, `receipts`) e locks explicitos para outputs gerados. Como TASK-0002 ja estava
  em `iteration_count=2`, a correcao foi escalada ao Architect Sol: blueprints corrigidos,
  artefatos regenerados, 64 paths limpos, zero tags nulas e locks atualizados. O teste e2e foi
  alinhado a `/v1/ops/field/agents`. Uma terceira revisao nao foi iniciada.

## Leitura

Leitura do maestro Architect concluída em ca5c260a967ef8ac43157e106814e83fd93592a3:

- AGENTS.md; CODESTYLE.md; docs/meta/agents/README.md.
- docs/meta/agents/orchestra/README.md, model-ladder.md e waves.md.
- docs/framework/arch/teat-build-pack.md inteiro, com foco em WP-T1 e mapa entregavel-definicoes.
- docs/framework/arch/parameter-catalogue.md; decision-closure-plan.md; steering.md secao H.
- Manuais architect-blueprint, engineer-backend, engineer-frontend, inspector-tests e
  transcriber-docs.
- Este plan.md; templates de tarefa, worker e reviewer.
- Definicoes fechadas de WP-T1: WF-TEAT-001...005, UC-TEAT-011, RN-TEAT-003/108/124...128/133/134,
  teat-route-contract.md, teat-error-catalog.md, rait-deadline-engine.md, os quatro blueprints inf,
  DDL 13/14 e, somente leitura na origem TEAT, BP-MOBILE-OPERATIONS-001, INV-EVIDENCE-001 e
  INV-OFFLINE-001.
