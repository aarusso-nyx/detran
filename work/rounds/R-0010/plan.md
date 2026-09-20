# R-0010 — frente `boat-backend` (WP-B0…B3 do BOAT: política, modelo `est/crash`, comandos, sincronização, RENAEST e contratos)

**Status:** CTG-0001 integrado pelo PR #55 em `4f0345532433fb37670447fe22f32bc95ffc0f9e`. Em CTG-0002, TASK-0007…0015, TASK-0018…0022 estão concluídas; contratos passaram 40/40 testes e `contracts:check` com 152 operações e 61 clientes. Em 2026-09-19, o Owner autorizou `role_app_backend` a executar somente a função estreita `jobs.discover_active_boat_renaest_tenants()`; TASK-0020 concluiu a porta SQL e o wiring na segunda iteração. O Owner decidiu que o relatório preliminar pode satisfazer C-2-13 sem alegar ser BAT oficial e, em 2026-09-20, aprovou o Default D1 completo. WeasyPrint 70.0 e o digest veraPDF foram resolvidos e uma prova preliminar PDF/A-2b passou; TASK-0016/0017 estão desbloqueadas para execução sequencial. CTG-0002 ainda não pode receber revisão final, evidência ou merge antes dos gates. Checkpoint detalhado em §Auditoria de continuidade. Autorização do Owner em
`AUTHORIZATION.md`. Reviewer: by temporary Owner exception on 2026-09-20, an
isolated Codex Auditor via `tools/orchestra/bridge.sh codex` during this session;
the normal Opus reviewer resumes when the Owner reports Claude available.
**Concorrência:** R-0005, R-0008 e R-0009 estão em `main`. Fila de sincronização em `backend/domains/ops/offline-sync` (contrato em `work/rounds/R-0008/contracts/CTG-0002.md`; schema `docs/framework/schemas/teat-offline-sync-batch.schema.json`); evidência em `backend/domains/ops/evidence`; `DetranError`, `check-commands.mjs`, `contracts:clients` (`@detran/api-clients`) e `policy-routes.e2e.spec.ts` prontos (estender com `est:*`). Na inspeção de 2026-09-19, a worktree R-0007 `rait-backend` só mantém alterações nos três caminhos de composição `backend/app/src/app.module.ts`, `package.json` e `pnpm-lock.yaml`; os caminhos de documentos/ADR/catálogo normativo não aparecem modificados. A R-0007 confirmou documentalmente que `MOD-shared-documents`, `MOD-adr-0018`, `MOD-inf-normative-document-catalogue` e `MOD-rait-test-strategy` foram liberados no fechamento local de CTG-0001/CTG-0002. Os Engineers de projeções/job/documentos serializam `app.module.ts`.
**Janelas previstas:** 3.

## Auditoria de continuidade — 2026-09-19

`origin/main=fc26bd20ec350f5fcfbf9c3470d776b11eddd0e7`; a worktree R-0010 permanece
sincronizada em `d15edae90fc306f2702965fc3c9154377b49494a`, merge local de
`origin/main` sobre o checkpoint CTG-0002
`5b16f739cab5bf93a6c286c3d1245c863fa54a76`. Antes do merge, o maestro
preservou as 161 entradas locais em recuperação externa com manifesto, patches,
arquivo compactado e SHA-256. A integração foi automática, sem conflito manual;
`pnpm install --frozen-lockfile` e o typecheck de `@detran/app` passaram.

- **R-0009 liberou seus locks:** PRs #54, #56 e #57 estão integrados e a closure
  registra CTG-0001/CTG-0002 concluídos. Isto libera a dependência Portal da
  tríade de projeções.
- **R-0007 liberou composição:** CTG-0001/CTG-0002 estão fechados em
  checkpoint local. Em 2026-09-19, a R-0007 concluiu sua integração local de
  `origin/main`, deixou a worktree limpa em
  `5912475bff24e0acd5436a52cd4a0458659b89aa` e liberou explicitamente
  `backend/app/src/app.module.ts`, `package.json` e `pnpm-lock.yaml`. Ainda não
  há push/PR da R-0007; os Engineers da R-0010 podem usar os arquivos em série,
  registrando eventual conflito futuro na integração por PR.
- **Continuidade executada:** TASK-0015 concluiu contrato/ADR/estratégia do
  relatório preliminar, mantendo C-2-13 aberto nos itens `source_pending` de
  PDF/A e assinatura. TASK-0019 concluiu os REDs do job: cinco REDs pela
  ausência de TASK-0020 e três checks estáticos do DDL 75 verdes; E2E em banco
  isolado permanece pendente. A reconciliação Architect de TASK-0012/0013/0014
  removeu as APIs Portal paralelas e invalidou `prompt-review-21`; nova revisão
  formal é obrigatória antes de redisparar TASK-0013.
- **Projeções liberadas para Engineer:** `prompt-review-25` = PASS e TASK-0013
  iteração 2 concluída: integração dirigida 5 RED/1 PASS, gate 3 REDs pela
  ausência de `tools/domain-boundaries/verify.mjs`; E2E teve `sensor-error` por
  banco isolado sem os DDLs Portal. TASK-0014 pode ser despachada após o próximo
  checkpoint/merge de `main`, mantendo montagem/manifests como passo serializado
  do maestro. TASK-0017 e TASK-0020 aguardam apenas suas predecessoras e a ordem
  serial. TASK-0008/0009/0010/0011 e TASK-0016 aguardam dependências
  topológicas/autoridade ainda descritas nos contratos.
- **Sequência segura atual:** checkpointar os contratos/REDs, integrar o avanço
  corrente de `main` e despachar TASK-0014. Investigar/fechar as fontes
  `source_pending` antes de TASK-0016. Depois executar os Engineers serializados
  TASK-0014 → TASK-0017 → TASK-0020 e continuar TASK-0007/0008/0011/0010/0009
  conforme suas dependências.

**Execução após a auditoria:** TASK-0014 foi concluída e montada pelo maestro.
Em banco isolado com apply/seed completos, a suíte dirigida de projeções passou
6/6; app typecheck, gate de fronteiras e seus testes 3/3 passaram. TASK-0020
implementou scheduler mensal, ledger tenant-scoped, claim/idempotência, contexto
técnico e wiring; unit app passou 69/69 e o E2E dirigido do DDL/job passou 3/3.
Após autorização do Owner, o DDL 75 passou a conceder somente `EXECUTE` em
`jobs.discover_active_boat_renaest_tenants()` a `role_app_backend`; o provider
SQL e o wiring substituíram a porta fail-closed. Provisionamento/revogação e
DML nas identidades continuam negados. TASK-0020 concluiu a segunda iteração:
unit app 69/69, E2E dirigido 3/3, chamada real sob o papel da aplicação,
typecheck e `pnpm check` passaram. O gate de integração revelou e corrigiu um
sensor Portal que omitia o seed BOAT da janela canônica; o tier de integração
completo passou. O E2E global ainda apresenta falhas ambientais e de isolamento
anteriores em TEAT/Portal, fora da alteração do job. TASK-0016/0017 continuam
paradas pelas fontes técnicas de PDF/A/veraPDF e pela política inicial do
relatório registradas por TASK-0015. A decisão Owner de 2026-09-19 retirou os
campos normativos do BAT dessa lista de bloqueios: o BAT permanece
`source_pending` sob DT-061/OD-B08 e não é inferido do relatório. Em 2026-09-20,
o Owner aprovou o Default D1 completo; o maestro resolveu os pinos técnicos e
provou preliminarmente WeasyPrint 70.0 → PDF/A-2b → veraPDF 1.30.1. TASK-0016
e TASK-0017 estão liberadas, mantendo C-2-13 aberto até o gate real de produção.

**Continuidade desbloqueada concluída em 2026-09-19:** TASK-0007 passou a
emitir `schemaVersion: 1` separado da versão do agregado; banco descartável
passou integração 21/21 e E2E BOAT 21/21. TASK-0008/0022 transcreveram 13
operações, payload canônico e enums de erro; a Adenda A-5 e
`prompt-review-26-contract-a5.json` (`PASS`) fecharam os sensores do gate.
TASK-0011 terminou com os REDs exclusivos e TASK-0010 os tornou verdes:
`contracts:test` 40/40 e `contracts:check` PASS, 152 operações/61 clientes.
TASK-0009 atualizou build pack, closure plan e backlog sem promover job,
PDF/A ou homologação real.

**Gate agregado após a continuidade:** `pnpm check` PASS. Entre as provas
incluídas: blueprints gerados em sincronia, 152 operações/61 clientes de
contrato, fronteiras de domínio, 40/40 testes de contratos, typecheck dos 56
projetos aplicáveis, 973 handlers, RLS em 225 tabelas, fronteira SENATRAN,
118 arquivos/1.314 testes do Portal e build de produção do Portal.

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
| TASK-0021 | Inspector            | inspector-tests     | Luna / médio   | `MOD-app-e2e-ops-modules`                                                      | TASK-0006            | fixture canônica da tenancy no E2E OPS pós-R-0009; HTTP 200 e lista vazia cross-tenant preservados                                                            |

CTG-0001 = 0001…0004; CTG-0002 = 0005…0008 + 0010…0011 + 0021 (reparo de sensor pós-R-0009, CTG-0002 adenda A-4). Um PR por CTG. TASK-0008 → TASK-0011 → TASK-0010 → TASK-0009; a numeração preserva os IDs iniciais.

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

**Avanço independente dos locks (2026-09-16):** TASK-0012 concluída,
`reports/TASK-0012.md`; emenda ADR-0001, contrato BOAT e blueprints de
Dashboard/Espelho entregues. `pnpm blueprints:generate`, `pnpm blueprints:check`,
`pnpm verify:rls-ddl`, `pnpm install` e apply completo em banco isolado
`detran_boat_r0010_projection_test` passaram. BP/DDL/pacote gerado Portal
mantiveram hash idêntico. TASK-0013 foi despachada para REDs em arquivos
próprios. Emissor BOAT ainda carece de `schemaVersion` separado de
`aggregate.version`; os projetores devem rejeitar a forma incompleta.

**REDs de projeção (2026-09-16):** TASK-0013 em revisão, com relatório
`reports/TASK-0013-progress.md`. Após adenda de API no contrato, 9 REDs de
integração são exclusivos dos serviços/projetores ausentes, o E2E dirigido é
RED por `schemaVersion` não emitido e 3 REDs do gate decorrem do script
`verify.mjs` ausente. Typecheck/Prettier PASS; fixtures isoladas foram limpas.
O ramo positivo de titularidade confiável carece de fonte/fixture autorizada.
TASK-0014 não foi despachada.

**Projeções — revisão 21 PASS (2026-09-16):** após corrigir os oito
achados da revisão 20, `reviews/prompt-review-21-projections-correction.json`
liberou TASK-0012 e, depois de contrato/geração, TASK-0013. R-0010 não edita
BP/DDL Portal; TASK-0012 especifica a declaração BOAT e R-0009 mantém o wiring
M24 e `MOD-portal-projections-hw`. TASK-0014 continua parada até liberação
documentada desses locks e de `app.module.ts`/lockfile por R-0007. O maestro
confere diff vazio do BP/DDL/pacote gerado Portal após `pnpm blueprints:generate`
(geração global), além de `pnpm blueprints:check`. A linha de locks desta tríade
é `MOD-adr-0001` (TASK-0012), `MOD-dashboard-crashes`,
`MOD-integration-renaest-mirror`, e `MOD-portal-crash-view` (TASK-0013/0014
sob liberação de R-0009).

**Projeções — revisão 20 FAIL (2026-09-16):** o Owner aprovou a opção 1
para `backend/domains/integration/renaest-mirror`, mas a revisão restrita
`reviews/prompt-review-20-projections.json` rejeitou o despacho da tríade.
R-0009 ainda retém os locks do blueprint/DDL Portal (TASK-0005, wiring M24)
e `MOD-portal-projections-hw` (TASK-0008); PR #54 integrou a base, mas não
transferiu esses locks. É necessária liberação documentada de R-0009 ou
repartição da responsabilidade de wiring/projetor antes de novo prompt-review.
A revisão apontou ainda contrato obrigatório do gate `verify:domain-boundaries`,
`handwrittenProviders`/`handwrittenExports` nos blueprints novos, serialização
explícita de `app.module.ts` com R-0007 e alinhamentos de caminhos/critérios.
Nenhum worker TASK-0012…0014 foi despachado. Pelo §5 de `00-maestro.md`,
FAIL interrompe esta tríade até resolução documentada; o restante de CTG-0002
não pode ser declarado concluído.

**Integração com R-0009 (2026-09-16):** PR #54 foi mesclado; o worktree
R-0010 avançou por fast-forward até `1175f4f` e recuperou as alterações locais
após snapshot externo verificado em `/tmp/r0010-pre-main-1789597298`
(124 arquivos, SHA-256 do tar
`6db34dbfb9e1e6a35706e8253a28e5cc4293c0fb6d1359b34e53baf53eb514a8`).
Conflitos em `package.json` e `record/proofs/chain.json` resolvidos: scripts
Portal preservados, teste E2E EST adicionado, cadeia canônica de R-0009
preservada. A observação `EV-8b74b129c7661f24` permanece no snapshot e nos
artefatos de auditoria locais, mas seu registro anterior não foi sobreposto
à cadeia que avançou em R-0009. Nova evidência deve ser anexada pela CLI DEVAI
sobre o head atual, sem edição manual da cadeia. `portal.crash_view` e ledger
já existem no BP Portal e DDL 65; a implementação BOAT só projeta ali.

**Ownership do espelho (decisão Owner de 2026-09-16):** opção 1 aprovada: pacote
físico `backend/domains/integration/renaest-mirror`, propriedade lógica do
adapter conforme ADR-0020 e emenda limitada de ADR-0001 por TASK-0012.
Chamadas SENATRAN seguem exclusivas de `packages/senatran-adapter`. A tríade
de projeções depende de revisão de prompts PASS antes do despacho.

**Tríade independente do job:** `prompt-review-12-job.json` devolveu `PASS`
restrito a TASK-0018…0020, com um low sobre leitura de `01-schemas.sql`;
`prompt-review-13-job-low.json` confirmou `PASS` da correção e novos hashes.
TASK-0018 Architect foi concluída (contrato de job e A-3); OD-B14/B15 ainda
bloqueiam TASK-0019/0020. Isto não libera as tríades de projeção ou
documentos. `prompt-review-16-ops-fixture` deu PASS e TASK-0021 foi concluída.

**Janela 4, prompt-review-9 = FAIL (2026-09-16):** nenhuma TASK-0012…0020
foi despachada. O veredito exaustivo está em
`reviews/prompt-review-9.json`. Achados estruturais: (1) propriedade/lock de
`portal.crash_view` colide com R-0009 `portal-backend`; decidir dono do
blueprint/DDL e obter liberação documentada ou limitar esta rodada à projeção
manuscrita; (2) `backend/domains/integration/renaest-mirror` foi escolhido no
prompt do Engineer sem namespace sancionado por ADR-0001/ADR-0020; Architect
deve fixar ownership antes de fronteira de implementação; (3) manifests de
pacotes gerados não podem ser editados à mão; (4) aliases/dependências dos
pacotes novos no app e runner de teste do gate de fronteiras faltam; (5) os
testes E2E do relatório não são executados nos critérios; (6) `@stynx-nyx/pdf-a`
tem stubs, enquanto validação real requer adaptador concreto como
`@stynx-nyx/pdf-a-vera-docker` e estratégia de CI; (7) leituras STYNX jobs
omitem scheduler, registry, cron, types e backoff. Há também quatro achados
low no arquivo de veredito. Pelo §5 do prompt do maestro, parar e reportar.
Este era o estado da revisão 9; as revisões restritas posteriores estão em
§Retomada e não liberam as tríades alheias.

**Lock externo de documentos:** R-0007 confirmou em resposta de coordenação
que mantém alterações não integradas em `shared/documents`, `app.module` e
lockfile, com TASK-0020/0021 ainda previstas; não concedeu transferência do
lock nem ETA. O desenho em arquivo disjunto pode avançar após correção/revisão
dos prompts, mas nenhuma escrita compartilhada será despachada até base exata
e serialização acordadas. O PR #54 de R-0009 `portal-backend` foi integrado; a
projeção Portal usa os artefatos já presentes em `main`.

**Resolução parcial da revisão 9:** o PR #54 de R-0009 já contém
`BP-PORTAL-PROJECTIONS-001`, DDL 65 e `portal.crash_view`, conforme inspeção
read-only do branch `orchestra/portal-backend` e corpo do PR. R-0009 mantém
ownership desses artefatos; R-0010 fica com o projetor BOAT, somente depois
do merge de #54 e integração de `origin/main` por merge normal. A localização
do pacote `integration.renaest_mirror` foi aprovada pelo Owner como opção 1;
TASK-0012 registra a emenda limitada em ADR-0001 e o ownership lógico do
adapter antes da implementação. Os demais achados de `prompt-review-9` estão em correção.

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

- Integração R-0007 sobre Default D1: `plant-bug` em quatro contratos de
  integração. O inventário fechado de `apply.sh` foi atualizado de 57 para 60
  DDLs ordinários (63 arquivos com os três scripts manuais); o grant global do
  DDL 20 passou a restaurar condicionalmente a revogação append-only após o DDL
  70; `72-fixtures-boat-projections.sql` entrou nos dois perfis fechados de
  seed; e o sensor de worklist volta à identidade owner antes de comparar a
  evidência visível antes/depois da negação RLS. Nenhum teste foi relaxado.
  A primeira repetição do E2E completo teve `sensor-error` transitório do
  parser HTTP em `portal-payload-lint`; a suíte passou isoladamente 27/27 e o
  E2E completo passou no rerun com 382 testes e 2 `todo`. Upgrade 18/18, real
  PDF/A 2/2, blueprints e `pnpm check` passaram.

- TASK-0016/0017 Default D1: a primeira execução agregada de backend não exportou `DB_NAME`, então um sensor interno usou o banco padrão parcial; classificação `sensor-error`. A repetição com banco dedicado passou unit e integration. A primeira repetição E2E encontrou o mock SENATRAN inativo; classificação `sensor-error`. Com o mock oficial ativo, `pnpm backend:test:e2e` passou 20 arquivos, 267 testes e 2 `todo` preexistentes. Nenhum teste foi relaxado.

- TASK-0016/0017 pós-D-13-08: o primeiro `backend:test:ci` encontrou a asserção estrutural ainda fixada em 11 entidades após a adição Architect de `CrashReportDocument`; classificação `plant-bug`. A expectativa foi atualizada para as 12 entidades autorizadas pelo blueprint. O primeiro teste dirigido sem `DB_NAME` repetiu o sensor do banco padrão parcial; com `DB_NAME=detran_r10_documents`, EST integration passou 21/21. Após reset completo, duas execuções de seed e mock SENATRAN ativo, `pnpm backend:test:ci` passou integralmente, inclusive app E2E 20 arquivos, 267 testes e 2 `todo`.

- Integração pós-R-0009, gate `backend:test:ci`: primeira execução parou em
  `portal-identity` por instalação ausente no worktree; `pnpm install
--frozen-lockfile` restaurou os links de workspace sem mudar o lockfile.
  Nova execução passou unit/integration e falhou em 3/135 testes E2E do app:
  OPS cross-tenant e dois de TEAT stream. **Triagem `sensor-error` do ambiente**:
  as URLs app/reader apontavam a `postgres` superuser, que ignora RLS.
  Com conexão app/reader assumindo `role_app_backend`, TEAT stream passou 8/8.
  OPS ainda recebeu `403 TENANT_ACCESS_DENIED`; consulta ao banco isolado
  confirmou que a fixture legada não cria tenant/usuário/membership local
  exigidos pelo interceptor STYNX agora montado pelo Portal. TASK-0021
  Inspector proposta para reparar só a fixture, mantendo asserções 200 e
  lista vazia cross-tenant. `prompt-review-14-ops-fixture.json` devolveu
  `REVIEW` com dois highs corrigíveis (ambiente DB fechado e referência
  contratual própria) e cinco lows; prompt, CTG-0002 adenda A-4 e lock no
  plano foram corrigidos. `prompt-review-15-ops-fixture` teve saída JSON
  inválida rejeitada pela ponte, sem veredito aceito; retentativa mínima
  `prompt-review-16-ops-fixture.json` devolveu `PASS`; TASK-0021 Inspector
  concluiu o reparo da fixture, com E2E dirigido 2/2 PASS sob
  `role_app_backend` e asserções preservadas. Nenhuma falha foi
  classificada como bug de produto sem esse diagnóstico.
  Para o próximo gate, `STYNX_OWNER_DATABASE_URL` usa o principal `postgres`
  apenas no banco isolado; `STYNX_APP_DATABASE_URL` e
  `STYNX_READER_DATABASE_URL` usam a mesma URL de teste com
  `?options=-c%20role%3Drole_app_backend`, verificado por `psql` como
  `current_user=role_app_backend`. O banco `detran_boat_r0010_opsfixture` foi
  criado/resetado e seedado somente para a execução dirigida de TASK-0021.

- Integração pós-R-0009, `pnpm check`: passou por KB, publicação seca,
  blueprints e catálogo de parâmetros; parou apenas em TS18046 no C-0002-44
  de TASK-0006 A-2 (`body.items` tipado `unknown`). O mesmo Inspector corrigiu
  somente o cast local; `@detran/app typecheck` PASS e E2E dirigido 2/2 PASS
  sob `role_app_backend`. Reexecução de `pnpm check` em curso.

- Integração pós-R-0009, `backend:test:ci` repetido após TASK-0021 e cast
  C-0002-44: **PASS** no `detran_boat_r0010_pretriage` resetado/seedado,
  owner separado da conexão app/reader como `role_app_backend`; app E2E
  11 arquivos e 135/135 testes PASS. Isto valida o corte implementado, não
  substitui os sensores ainda pendentes de projeções, documentos e job.

- CTG-0002 pré-gate em banco isolado `detran_boat_r0010_pretriage`:
  `apply.sh --full` e `seed.sh` duas vezes PASS; `pnpm backend:test:ci`
  passou unit e integration, mas app E2E teve 1 falha em 121 testes
  (`teat-field-sync.e2e.spec.ts` C-0002-44). Classificação `sensor-error`:
  o teste R-0008 ainda envia `{crash:{local_protocol:'BOAT-0001'}}` e espera
  `received`/`TEAT.SYNC_DESTINATION_NOT_WIRED`, cenário anterior ao applier
  BOAT. Com o destino montado, o payload inválido corretamente recebe
  `rejected`/`BOAT.SYNC_INVALID_CRASH_RECORD` conforme CTG-0002 §3.
  Inspector deve atualizar o sensor para a semântica atual com asserção
  equivalente ou mais forte, sem afrouxar a autorização C-0002-44; o fallback
  de implantação continua coberto no teste unitário de offline-sync. Depois,
  repetir o tier completo no mesmo banco isolado resetado. A alteração de
  fronteira de escrita do Inspector exige adenda/prompt-review antes do patch.

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
- TASK-0006 escalado, correção adicional: `sensor-error` — o helper
  `canonicalCrashPayload(localId, {record: null})` convertia `null` no registro
  padrão, gerando corpo/hash idênticos ao caso válido. O Inspector preservou
  `null`; o caso C-2-09 isolado passou, inclusive recibo
  `BOAT.SYNC_INVALID_CRASH_RECORD` e rollback.
- TASK-0007 tentativa 1: `reference-gap` — comandos e applier BOAT foram
  implementados e os HTTPs básicos passaram, mas `DocumentsFacade` de
  ADR-0018 só tem interface, os três read models de ADR-0020 não têm
  blueprint/DDL e `T-BOAT-TRANSM` não tem scheduler nem contexto tenant de
  execução. Uma classe inerte ou bytes com marcador PDF/A não fecham
  C-2-08/13/14. Adenda A-1 em CTG-0002 enviada ao reviewer antes de novos
  prompts; Engineer escalado continua somente nas superfícies autorizadas.
- TASK-0007 teste global inicial: `sensor-error` até prova contrária — o
  Engineer executou o E2E global enquanto o maestro rodava o tier completo
  CTG-0001 no mesmo `detran_r10`. Repetir em banco isolado antes de classificar
  40 falhas TEAT/PEC como regressão ou baseline.

## Adenda A-1 de CTG-0002 — decomposição para retomada

Os substratos abaixo são necessários para fechar C-2-08/13/14. Eles não
alteram os critérios existentes nem autorizam implementação antes de prompts
e `prompt-review` com `PASS`. Formalizar cada linha em `tasks/TASK-nnnn.json`
e `prompts/TASK-nnnn.md` na próxima janela, com composição PC e fronteiras
fechadas. A ordem em cada tríade é Architect → Inspector → Engineer; os
Engineers não editam testes, blueprint gerado ou `pnpm-lock.yaml` à mão.

| IDs            | Tríade / lock                                                                                                                                                       | Fonte e entrega                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0012…0014 | projeções; `MOD-adr-0001` (TASK-0012), `MOD-dashboard-crashes`, `MOD-integration-renaest-mirror`, `MOD-portal-crash-view` (TASK-0013/0014, sob liberação de R-0009) | ADR-0020, CTG-0002 A-1: três blueprints de consumidor, DDL/RLS, eventos canônicos, ledger idempotente, projetores `*.projection.ts`, gate `verify:domain-boundaries`, replay/duplicata/commit tardio, supressão primária e secundária.           |
| TASK-0015…0017 | documentos; `MOD-shared-documents`, `MOD-est-document-template`, `MOD-adr-0018`                                                                                     | ADR-0018 e UC-1.251: adenda ao ADR e catálogo canônico, template versionado do relatório preliminar, assinatura/PDF-A; Inspector prova bytes conformes e falha de conformidade; Engineer monta fachada STYNX. Coordenar antes o lock com R-0007. |
| TASK-0018…0020 | job; `MOD-jobs-substrate`, `MOD-auth-tenancy`, `MOD-ops-parameter`                                                                                                  | STYNX jobs + CTG-0002 §4: agendamento mensal, descoberta autorizada de tenant e identidade do sistema, execução sob RLS, retry/idempotência e testes de múltiplos tenants; preserva `runOnce` tenant-scoped de TASK-0007.                        |

O maestro executa `pnpm blueprints:generate` e `pnpm blueprints:check` após
TASK-0012 e antes de TASK-0013. Instala dependências e atualiza
`pnpm-lock.yaml` depois das decisões Architect. Os Engineers TASK-0014,
TASK-0017 e TASK-0020 são serializados: todos montam componentes em
`backend/app/src/app.module.ts`, e TASK-0014/0020 também podem tocar o
`package.json` raiz. `TASK-0007` só fica concluída após essas três tríades, gates globais
e revisão de entrega do CTG-0002. TASK-0008/0011/0010/0009 seguem a ordem
original após estabilização dos comandos e substratos. Nenhuma publicação de
P-09 ou rota cidadã de BAT é inferida de projeção interna: identidade confiável
do titular e os controles de RN-DASH-161 permanecem fronteiras explícitas.

## Retomada

### Checkpoint Default D1 pós-R-0007 — 2026-09-20

- Branch publicado `orchestra/boat-backend`, HEAD
  `8aa5b5f9` após merge normal de `origin/main=a0f62cb67383ba31354f4c72e24bec91a3f22138`.
  Alterações locais do Default D1 permanecem sem commit; stash de segurança
  `stash@{0}` e snapshot `/tmp/r0010-documents-pre-r0007-1789880912` foram
  preservados.
- TASK-0016 e TASK-0017 estão `completed`. Default D1 produz
  `RELATORIO_PRELIMINAR_SINISTRO` 1.0.0 em PDF/A-2b por WeasyPrint 70.0,
  valida com veraPDF por digest, sela SHA-256, persiste metadados/evidência SQL
  append-only sob RLS e bytes no `S3Service` STYNX. BAT oficial e seus campos
  permanecem `source_pending`.
- Gates finais: shared 404/404; app unit 116/116; app integration 19/19; Portal
  projection integration 7/7; E2E completo 382 aprovados e 2 `todo`; upgrade
  18/18; real documental 2/2 com 1 PostGIS não relacionado ignorado;
  `blueprints:check`, `git diff --check` e `pnpm check` PASS. O primeiro E2E
  completo teve erro transitório de parser HTTP; rerun completo e reprodução
  isolada 27/27 passaram.
- O reviewer obrigatório ainda não emitiu veredito. A tentativa anterior foi
  bloqueada pela cota semanal do Claude CLI. Em 2026-09-20, o Owner autorizou
  excepcionalmente a família Codex como reviewer durante esta sessão, até novo
  aviso de disponibilidade do Claude. Regenerar o diff/prompt final e executar
  exatamente `tools/orchestra/bridge.sh codex gpt-5.6-sol
work/rounds/R-0010/reviews/delivery-review-CTG-0002-documents-cycle-1.md
work/rounds/R-0010/reviews/delivery-review-CTG-0002-documents-cycle-1.json
/Volumes/Thiamat\ II/stech/detran-worktrees/boat-backend`. Somente `PASS`
  libera commit, evidência, push, PR, CI e merge.

### Delivery review documental — Codex ciclo 1 (2026-09-20)

A exceção de família autorizada pelo Owner foi executada em sandbox somente
leitura por `gpt-5.6-sol`. O JSON válido
`reviews/delivery-review-CTG-0002-documents-cycle-1.json` retornou **FAIL**, com
seis achados `high` e um `low`: resolução transitiva STYNX 1.4.0 incompatível
com ADR-0015; ausência de prova integrada da fachada com `S3Service`; teste de
persistência sem comparar o resultado veraPDF integral produzido pela fachada;
negação cross-tenant aceitando dois status; caminhos independentes de falha do
renderer/template/política sem prova; e dependências WeasyPrint sem hashes
completos. A referência residual a Chromium é `low`. Conforme §8 do maestro,
nenhum commit, evidência, push ou PR é permitido antes da escalada Owner.

### Remediação escalada do delivery review — 2026-09-20

O Owner autorizou corrigir o `FAIL` do ciclo 1 e repetir o review. A remediação
ficou restrita aos seis achados `high` e ao `low`: peer STYNX fixado em 1.3.1;
prova integrada pela fachada, repositório SQL e adapter `S3Service`, com
recriação e leitura; comparação integral da evidência veraPDF; negação tenant
exata; testes independentes de runner/template/política; requirements lock com
hashes completos e Python fixado; texto residual de Chromium removido. O ciclo
2 deve revisar somente essas correções conforme a regra da R-0006.

### Decisão do Owner — job mensal

Em resposta à proposta explícita do maestro (conta técnica auditável por
tenant, descoberta restrita de tenants ativos e execução no dia 1 às 12h no
fuso de `auth.tenants.timezone`), o Owner respondeu **“job mensal aprovado”**.
Tratar como aprovação de OD-B14/B15 **nesses limites exatos**: uma identidade
técnica por tenant com provisionamento/revogação auditáveis; enumeração somente
de tenants ativos e vínculos ativos; processamento de `est.*` e
`integration.outbox` com `role_app_backend` e RLS; âncora civil dia 1, 12h,
no fuso do tenant. O controle administrativo não recebe acesso owner-role ao
domínio. Não ampliar essa resposta para aprovar STYNX jobs sem prova de
propagação de `actorId` nem para definir `layout_version` nacional. TASK-0018
retorna para emenda A-3/contrato e eventual DDL 75; depois revisar TASK-0019
e TASK-0020 contra o contrato fixado e despachar Inspector → Engineer.
O espelho RENAEST continua sem decisão de propriedade física.

TASK-0018 Architect retomou e escreveu contrato atualizado, adenda A-3 e
`backend/database/ddl/75-boat-renaest-job.sql` (identidade técnica, trilha,
descoberta e ledger mensal). `pnpm format:check` e `pnpm verify:rls-ddl`
passaram; um reset completo em banco isolado `detran_boat_r0010_job_review`
aplicou DDL 75, e a checagem de privilégios confirmou que
`role_app_backend` não pode executar as funções administrativas nem ler a
tabela de identidades diretamente. O mesmo papel pode inserir no ledger
tenant-scoped sob RLS. A porta administrativa concreta ainda precisa fixar
como um operador confiável provisiona/revoga e como o orquestrador chama a
descoberta sem conceder funções `SECURITY DEFINER` a `role_app_backend`.
Membership ativa sozinha não autentica o administrador; o job permanece
falha-segura até essa porta e os testes de TASK-0019/0020.

### Parada por dependências externas — 2026-09-16

`git fetch -q origin --prune` confirmou HEAD local e `origin/main` em
`1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8`, branch remoto R-0010 ainda
em `433eb0d0344136d98e116ba07367c39fd01a9030`; a árvore CTG-0002 segue
sem commit/staging. A tarefa R-0007 está ativa e ainda sem PR aberto, mantendo
o lock de `shared/documents`, `app.module.ts` e `pnpm-lock.yaml`. A tríade de
documentos tem `prompt-review-19-documents-interface.json=PASS`, mas não pode
ser despachada antes da integração e da revalidação do lock. Projeções aguardam
decisão Owner sobre eventual emenda limitada de ADR-0001 para o pacote físico
do espelho RENAEST; job aguarda OD-B14 (identidade técnica/descoberta de tenants)
e OD-B15 (âncora mensal/horário). As consultas ao Owner seguem sem resposta
registrada. Nenhuma das três tríades pendentes recebeu código de produção.
Na retomada, confirmar respostas e `origin/main`/R-0007, integrar main conforme
regra de branch publicado, revalidar prompts/contratos contra a base final e
somente então despachar Architect → Inspector → Engineer. CTG-0002 e a rodada
continuam abertos até os gates, review, evidência, PR/CI/merge e fechamento.

### Janela 5 — revisão de documentos em correção

`reviews/prompt-review-19-documents-interface.json` deu **PASS** para os três
prompts e confirmou o desencaixe `convert`/`validate`; liberação de despacho
continua condicionada ao lock R-0007. Os três achados low são obrigações do
maestro/Architect na execução, sem mudança de prompt aprovado:

1. O contrato D-13-nn de TASK-0015 especifica que a ponte devolve `RenderResult`
   com `bytes`, `sha256` e `pageCount` derivados **dos bytes convertidos** que
   passaram pelo veraPDF, e `metadata.profile='pdf-a'`. TASK-0016 testa que
   hash do documento entregue/selado iguala SHA-256 desses mesmos bytes;
   TASK-0017 não pode preservar hash ou páginas do render Chromium anterior.
2. TASK-0015 identifica a dependência concreta do conversor PDF/A-2b (pacote
   npm, binário ou imagem por digest). O maestro a provisiona antes do gate
   `test:real` do Inspector; TASK-0017 provisiona a mesma dependência na job
   `boat-documents-real`, além de Chromium e veraPDF por digest. Falta de
   conversor é bloqueio, não `skip`.
3. TASK-0015 calcula limite do tier `real` maior ou igual à soma dos tempos
   máximos de launch Chromium, conversão e veraPDF, com margem documentada.
   TASK-0017 aplica o valor em `backend/app/vitest.config.ts`; estouro do
   Inspector por infraestrutura é bloqueio reportado, sem reduzir timeout
   nem enfraquecer asserções.

O código STYNX fornece um `DEFAULT_VERAPDF_IMAGE` já com digest em
`packages/pdf-a-vera-docker/src/constants.ts`; isso não dispensa TASK-0015
de confirmar fonte, identidade da imagem e disponibilidade no ambiente de
execução. O `PASS` é de prompts, não de PDF/A, C-2-13 ou entrega.

`reviews/prompt-review-18-documents-correction.json` deu **PASS** com duas
observações low: instalar dependências antes do RED `test:real` do Inspector e
incluir `pnpm backend:test:ci` no JSON da TASK-0017. Ambas foram incorporadas.
Uma checagem direta dos tipos STYNX detectou ainda que
`PdfAConformanceAdapter` de `@stynx-nyx/pdf` exige `convert(input, request)`,
mas `VeraPdfDockerValidator` implementa somente `validate(bytes, opts)`;
o README descreve um encaixe direto que o código não oferece. Os prompts
agora exigem ponte real de conversão PDF/A-2b seguida de validação veraPDF,
com fonte/dependência e teste de bytes positivos. TASK-0015 decide a ponte;
se não houver conversão comprovada, C-2-13 permanece aberto. O maestro
declara/instala dependências e atualiza lockfile após o contrato Architect e
antes do Inspector, somente após a R-0007 liberar os arquivos comuns.
Essas alterações posteriores ao PASS da revisão 18 requerem nova revisão
restrita antes de qualquer despacho.

`reviews/prompt-review-17-documents.json` devolveu **REVIEW** (3 high, 1 low).
O reviewer confirmou as correções da revisão 9, mas encontrou que os prompts
não liam os READMEs STYNX de render/assinatura/storage, prometiam conformidade
real em `e2e`/`backend-kernel` contra a ADR-0018 §Decision 5, não tinham
responsável por provisionar Chromium/veraPDF no CI e não comprovavam a fonte
de bytes PDF/A-2b positivos nem o digest da imagem. TASK-0015…0017 e seus
JSONs/PC IDs foram corrigidos: provedores reais ficam no tier `real`,
`e2e` cobre HTTP/tenant com runner injetável, a TASK-0015 especifica e
documenta uma job BOAT de PR bloqueante para `test:real` e a TASK-0017 escreve
essa job após lock livre. O Architect deve provar bytes conformes no caminho
de produção e resolver digest imutável com fonte; sem isso C-2-13 fica aberto.
**Ainda não há PASS da nova revisão nem liberação do lock R-0007**. Próximo
passo: validar formatos/hashes e solicitar revisão restrita de correção; só
depois da R-0007 integrada despachar a tríade na ordem Architect → Inspector
→ Engineer. As decisões pendentes do Owner sobre espelho/job continuam abertas.

### Checkpoint da janela 4 — integração R-0009 e gates CTG-0002

Atualização de retomada: `git fetch -q origin --prune` confirmou
`origin/main=1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8`. A R-0007 continuava
ativa e sem PR aberto; seu lock de documentos permanece ocupado. A revisão
restrita da tríade TASK-0015…0017 está preparada em
`reviews/prompt-review-17-documents.md`, com Prettier e hashes/PC IDs dos três
prompts verificados. Ainda **não** foi enviada ao Opus nem possui veredito; no
próximo orçamento, invocar a ponte e aceitar somente JSON válido. A janela 4
está em 636.000/800.000 tokens estimados, perto do checkpoint de 640.000;
parada antes de nova chamada de reviewer conforme §0 do maestro.

- **Identidade e recuperação:** worktree `boat-backend`, branch publicado
  `orchestra/boat-backend`; HEAD local e `origin/main` em
  `1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8`, branch remoto em
  `433eb0d0344136d98e116ba07367c39fd01a9030`. A integração foi por
  fast-forward local após snapshot verificado em
  `/tmp/r0010-pre-main-1789597298` (SHA-256
  `6db34dbfb9e1e6a35706e8253a28e5cc4293c0fb6d1359b34e53baf53eb514a8`);
  novo snapshot em `/tmp/r0010-ctg2-checkpoint-1789599514` (SHA-256
  `8bb535904b4f9655eafc4e538052978505f84c7607892ca2fa32f5f03c31c274`).
  Nenhum arquivo CTG-0002 foi commitado ou staged. Não rebasear o branch publicado.
- **CTG-0001:** PR #55 mesclado em
  `4f0345532433fb37670447fe22f32bc95ffc0f9e`; `audit observe`
  `EV-8b74b129c7661f24` do SHA exato preservado no snapshot. A cadeia local
  segue o head de R-0009 `ab381e9bef8d44090adc01cae72d6768df59dec6feba85fa784d1ee9cc1c5f76`;
  `devai evidence verify` PASS. Não mesclar cadeias manualmente.
- **CTG-0002 implementado até aqui:** comandos/applier BOAT, outbox,
  `RenaestPort.runOnce` tenant-scoped, SSE e wiring; A-2 do contrato fixa
  `BOAT.SYNC_INVALID_CRASH_RECORD` para a recusa do applier. Inspector corrigiu
  C-0002-44 e a tipagem do teste, preservando as asserções relevantes.
  TASK-0021 corrigiu somente a fixture OPS pós-R-0009 para tenant/ator/membership.
  Em banco isolado com app/reader sob `role_app_backend`, `pnpm backend:test:ci`
  PASS, inclusive 135/135 E2E de app (`/tmp/r0010-rls-backend-ci.log`).
  `git diff --check`, `format:check`, `blueprints:check` e cadeia DEVAI PASS.
  `pnpm check` completo pós-correção **PASS** (`/tmp/r0010-postfix-check.log`):
  930 handlers, 218 tabelas de tenant cobertas por RLS, fronteira SENATRAN,
  paridade e superset PEC aprovados.
- **Prompts e dependências:** revisão Opus `prompt-review-9` FAIL levou a
  correções. TASK-0018 Architect teve `prompt-review-13-job-low` PASS e
  completou `docs/framework/contracts/boat-renaest-job.md`, mas a ativação do
  job aguarda OD-B14 (descoberta ativa de tenants e conta técnica por tenant)
  e OD-B15 (âncora mensal e horário). O Owner foi consultado; não inferir
  aprovação do silêncio. O Owner também foi consultado sobre a emenda limitada
  de ADR-0001 para o pacote físico `backend/domains/integration/renaest-mirror`.
  Sem essa escolha, a tríade de projeções TASK-0012…0014 não avança.
  TASK-0015…0017 aguarda o lock de documentos/app/lockfile de R-0007;
  a tarefa R-0007 continuava ativa na última consulta de status;
  a R-0009 já integrou os artefatos Portal necessários. TASK-0021 teve
  `prompt-review-16-ops-fixture` PASS e foi concluída. As tríades remanescentes
  ainda exigem revisão formal PASS dos prompts antes do disparo.
- **Próximo passo:** obter o resultado do `pnpm check`; depois das respostas
  do Owner e da liberação de R-0007, atualizar contratos/prompts/PC IDs,
  revisar pela família Opus, executar Architect → Inspector → Engineer de cada
  tríade, fechar TASK-0007/0008/0011/0010/0009 e CTG-0002 com gates completos,
  delivery-review PASS, evidência, PR/CI/merge, observação do HEAD integrado e
  fechamento da rodada. Sem projeções, PDF/A e job operacional, CTG-0002 não
  está concluído.

### Checkpoint da janela 4 — prompt-review-9 FAIL

Foram criados `tasks/TASK-0012.json`…`TASK-0020.json` e os nove prompts
correspondentes, com SHA-256/PC IDs em `compositions.json`; JSON e Prettier
passaram. A revisão Opus `reviews/prompt-review-9.json` retornou **FAIL**
com oito achados high e quatro low, listados em §Bloqueios. Nenhum novo worker
foi disparado. TASK-0006 recebeu relatório corrigido sobre o helper C-2-09.
O estado git/CTG-0001/CTG-0002 do checkpoint da janela 3 abaixo continua
válido, sujeito a novo `git fetch` na retomada. Próximo passo é resolver a
propriedade de `portal.crash_view` com R-0009 e a localização sancionada do
espelho com o Architect, corrigir os nove prompts/JSONs/PC IDs e obter nova
revisão conforme §5. Não implementar PDF/A usando stub nem escrever em
arquivos sob lock de R-0007. Após veredito `PASS`, seguir as tríades na ordem
Architect → Inspector → Engineer e os gates completos do CTG-0002.

### Checkpoint da janela 3 — 2026-09-16

Entrada estimada 640.000/800.000 (limiar de 80%). Parada conforme §§0 e 9
do prompt do maestro. O objetivo da rodada continua aberto até o merge final.

- **Entrada git:** worktree `/Volumes/Thiamat II/stech/detran-worktrees/boat-backend`,
  branch publicado `orchestra/boat-backend`, HEAD local
  `433eb0d0344136d98e116ba07367c39fd01a9030`; `origin/main` em
  `4f0345532433fb37670447fe22f32bc95ffc0f9e`. Não há conteúdo staged;
  arquivos novos receberam `git add -N` apenas para diff. O branch publicado
  deve integrar `origin/main` por `git merge --no-edit`, nunca rebase, depois de
  resguardar as alterações CTG-0002 em commit próprio ou outro procedimento
  reversível e verificável. Fazer `git fetch -q origin` antes de integrar.
- **CTG-0001 concluído:** commit candidato `289916b39c37f4f1e3b93c1038e388248071c9f4`,
  evidência em `433eb0d0344136d98e116ba07367c39fd01a9030`, review Opus
  `delivery-review-CTG-0001-cycle-4.json` = PASS. Checkout isolado passou
  install frozen, build, reset/seed e `pnpm backend:test:ci`. PR #55 teve cinco
  checks verdes e foi mesclado no SHA de `origin/main` acima. `audit observe`
  exato do merge = `EV-8b74b129c7661f24`; cadeia verificada com head
  `02a42a264207a26b69a717c39f08b6c744131c6217464b1c7052100c8c00e1ff`.
  `record/proofs/chain.json` e a observação sob `.devai/state/audit-observations/`
  estão na árvore de trabalho, ainda não commitados.
- **CTG-0002 em curso:** TASK-0005 produziu mapping/contrato. TASK-0006 criou
  REDs HTTP/adapter e passou C-2-09 isolado após corrigir o helper de teste.
  TASK-0007 escalada implementou comandos, applier, wiring e `runOnce`
  tenant-scoped; BOAT E2E 21/21, testes est/offline/adapter e typechecks
  direcionados passaram. Não fechar TASK-0007: faltam scheduler e descoberta
  de tenant, três projeções com replay e PDF/A real. O primeiro E2E global
  concorreu com outro tier no mesmo banco e deve ser refeito em DB isolado.
- **Contrato/adenda:** `contracts/CTG-0002.md` A-1 preserva C-2-05/06/08/13/14.
  Revisões Opus `ctg-0002-adenda-a1-review.json` e `...-review-2.json` deram
  REVIEW; as correções da segunda foram incorporadas e formatadas, mas não há
  veredito PASS para novos prompts. `plan.md` §Adenda A-1 de CTG-0002 delimita
  três tríades TASK-0012…0020 para projeções, documento e job. Os JSONs de
  tarefa e prompts ainda não existem. Antes de despachar, formalizá-los com
  fronteiras, locks e critérios, e obter `prompt-review` PASS pela ponte Claude
  Opus. Coordenar o lock ADR-0018/documentos com R-0007. Só o maestro usa git,
  instala dependências e altera o lockfile. Não editar irmãos em `../`.
- **Próxima sequência:** formalizar e revisar prompts; executar as três
  tríades Architect → Inspector → Engineer; concluir TASK-0007, 0008, 0011,
  0010 e 0009; rodar gates completos em DB isolado, delivery-review Opus PASS,
  evidência DEVAI e PR/CI/merge CTG-0002; observar HEAD integrado, fechar
  rodada, atualizar histórico/backlog e remover branch remoto conforme §9.
  Antes de PR, integrar `origin/main` pela regra de branch publicado, repetir
  gates e revalidar review se o diff mudar de forma substantiva. Sem evidência
  de PDF/A, replay idempotente e scheduler operacional, não declarar CTG-0002
  concluído. Identidade do titular permanece `source_pending`; rota cidadã
  não se abre por CPF apresentado.

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

### Checkpoint de integração CTG-0002 — delivery review PASS (2026-09-20)

- O ciclo 2 Codex reavaliou somente os sete achados do ciclo 1: seis highs e o
  low foram aceitos como corrigidos; restou um high porque `setup-python`
  estava no job `evidence-gate`.
- O Engineer moveu o action fixado `actions/setup-python` v6.2.0 e Python
  3.13.7 para `boat-documents-real`, antes do venv e da instalação única
  `--require-hashes`. O ciclo 3 restrito retornou **PASS**, sem achados.
- Gates pós-remediação: app unit 120/120, integration 19/19, E2E 382 PASS + 2
  todo preexistentes, upgrade 18/18, tier real documental 2/2, instalação
  Python integralmente hasheada, `pnpm install --frozen-lockfile`,
  `git diff --check` e `pnpm check` completos PASS.
- O primeiro E2E pós-remediação omitiu o mock SENATRAN e a preparação RAIT; o
  segundo não propagou `SENATRAN_MOCK_BASE_URL`. Ambos foram classificados
  `sensor-error`. A execução com o ambiente idêntico ao CI passou integralmente.
- A entrega está liberada para commit, evidência DEVAI, integração normal de
  `origin/main`, push, PR, CI e merge conforme §9.
