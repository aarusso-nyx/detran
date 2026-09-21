# R-0013 — frente `teat-frontends` (WP-T4, WP-T5, WP-T6 do TEAT: fichas, formulários, i18n, provisionamento offline e apps mobile/web)

**Status:** CTG-0001 mesclado; preflight da janela 2 concluído e TASK-0002 pronto para dispatch.
Nesta sessão, por exceção explícita do Owner, reviewer Codex/Sol/high.
**Concorrência:** abre já e **nenhum grupo está preso**: CTG-0001 (corpus), CTG-0002
(matrizes, 126 fichas e i18n canônico), CTG-0003 (provisionamento), CTG-0004a (mobile),
CTG-0004b (web) e CTG-0005 (fechamento). O grafo foi serializado para codificar todos os joins no
`upstream_task_id` singular. R-0012 não abriu; não há lock concorrente em `packages/ui`.
**Janelas previstas:** 5 (o maior da carteira; um PR por grupo).

## Metas

1. **Reconciliação do corpus antes das fichas** (teat-build-pack §5, PR próprio): `use-cases/INDEX.md`
   (status reais, UC-TEAT-013), `APP.md` (50 regras), OD-T06 (`no_approach_reason` classificado;
   UC-TEAT-002 reconciliado), `allows_no_approach` enum, OD-T05 (dois prazos), hipótese de cada teto
   `T-REG30`/`T-REG15`, numeração de UC-TEAT-008/009, OD-T03, OD-T07, etilômetro sem certificado
   (bloqueio adotado), testemunha/termo (WP-T1 já cobre), "68 × 67 telas". Sem regra nova; só
   consistência com as decisões H.54/H.55.
2. **Fichas e formulários** (WP-T4): `docs/framework/product/domains/inf/teat/screens/IU-TEAT-<screenId>.md`
   para as 126 telas (70 mobile + 56 web; sinistros marcadas BOAT), com objetivo, papel, dados
   (bootstrap/pacote/API), layout, componentes (`teat-frontends.md` §6), ações e comandos, estados
   vazio/erro/offline, atalhos, ergonomia, `AC-TEAT-*`; `apps/teat/mobile/src/app/forms/*.schema.ts`
   (§8); `i18n/teat.pt-BR.json` (estados [WF-TEAT-001…005], bloqueadores do bootstrap, erros,
   rótulos); `transitions.ts` com as 576 transições; diagramas de estrutura no modelo de
   `rait-web-structure-diagrams.md`. Baseline do KB sobe em 126 (+1 se UC-TEAT-013 for novo).
3. **Provisionamento offline** (WP-T5): ADR "Provisionamento operacional offline" (próximo número
   livre verificado: ADR-0028): chave do dispositivo no Keystore, grant `OfflineOperationalGrantV1`,
   pacote assinado por KMS, envelope cifrado, revogação por época, reconciliação obrigatória;
   `BP-OPS-PROVISIONING-001` (`device_key`, `offline_authorization_grant`, `provisioning_package`,
   `provisioning_receipt`, `device_revocation`; DDL `21-ops-provisioning.sql`); rotas
   `/v1/ops/provisioning/*` (desafio, registro de chave, emissão, download, recibo, prontidão,
   revogação, reconciliação); `ReadinessGate` integrado. Fases P0–P6 da origem como plano.
4. **Apps** (WP-T6): `apps/teat/mobile` (`@detran/teat-mobile`; Capacitor via `@stynx-nyx/mobile-runtime`;
   `FieldShell`, `ReadinessGate`, `LocalActStore`, `SyncWorker`, `NormativePackageService`,
   `BodycamIndicator`; 8 módulos; 70 rotas; formulários; impressora via porta com `FixturePrinter`
   nos testes) e `apps/teat/web` (`@detran/teat-web`; `@detran/ui`; 12 módulos; 56 + 4 rotas). Scripts
   `build|test|lint|typecheck` criados nesta rodada e ligados a `pnpm check`. O módulo `sinistros`
   da web e a biblioteca de sinistro mobile são de R-0015 (BOAT): aqui só os pontos de extensão do shell.
5. Documentação: `teat-build-pack.md` §WP-T4…T6 executados (gates reais); `teat-frontends.md` §10–§12;
   ADR nova; backlog.

## Tarefas

O grafo é deliberadamente serial nos pontos de junção porque o schema DEVAI possui apenas
`upstream_task_id` singular. Isso elimina dependências implícitas. Scaffold significa somente
package/config/shell vazio compilável: nenhum comportamento, rota de produto ou teste.

| Tarefa    | Papel                | Perfil              | Modelo/esforço | CTG       | Depende de | Entrega                                                                                      |
| --------- | -------------------- | ------------------- | -------------- | --------- | ---------- | -------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect (transcr.) | transcriber-docs    | Luna/baixo     | CTG-0001  | —          | reconciliar os 12 itens do corpus em caminhos fechados                                       |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Luna/baixo     | CTG-0002  | 0001       | portar matrizes oficiais imutáveis com proveniência e hashes                                 |
| TASK-0003 | Architect (transcr.) | transcriber-docs    | Luna/baixo     | CTG-0002  | 0002       | 70 fichas mobile, matriz 67 + deltas D-01/D-04/D-05                                          |
| TASK-0004 | Architect (transcr.) | transcriber-docs    | Luna/baixo     | CTG-0002  | 0003       | 56 fichas web e diagramas; atualizar uma vez o manifesto KB para 675/446                     |
| TASK-0005 | Architect (transcr.) | transcriber-docs    | Luna/baixo     | CTG-0002  | 0004       | catálogo i18n canônico e allowlist `teat.*` sob autoridade OD-P46/R-0014                     |
| TASK-0006 | Engineer             | engineer-backend    | Luna/baixo     | CTG-0002  | 0005       | regenerar exatamente os três artefatos de parâmetros e provar 89/25/allowlist                |
| TASK-0007 | Architect            | architect-blueprint | Terra/alto     | CTG-0003  | 0006       | ADR-0028, BP-OPS-PROVISIONING-001, DDL 21, contratos e matriz completa P0–P6/INV-OFFLINE-001 |
| TASK-0008 | Inspector            | inspector-tests     | Terra/alto     | CTG-0003  | 0007       | testes RED de contrato, policy, RLS, DB, segurança e idempotência no banco `detran_r13`      |
| TASK-0009 | Engineer             | engineer-backend    | Terra/médio    | CTG-0003  | 0008       | provisioning handwritten/wiring/policy até todos os testes verdes                            |
| TASK-0010 | Architect            | architect-blueprint | Terra/alto     | CTG-0004a | 0009       | contrato mobile: 70 rotas, papéis, 576 transições, forms, readiness e caminhos exatos        |
| TASK-0011 | Engineer             | engineer-frontend   | Luna/baixo     | CTG-0004a | 0010       | scaffold mobile não comportamental, compilável e com harness vazio                           |
| TASK-0012 | Inspector            | inspector-tests     | Terra/alto     | CTG-0004a | 0011       | RED mobile: 70 rotas, 576/576, forms, roles cartesianos, a11y, printer e 70 fichas           |
| TASK-0013 | Engineer             | engineer-frontend   | Terra/médio    | CTG-0004a | 0012       | implementação mobile em caminhos de produção exatos; testes intocáveis                       |
| TASK-0014 | Architect            | architect-blueprint | Terra/alto     | CTG-0004b | 0013       | contrato web: 60 rotas, 56 fichas, papéis cartesianos, módulos, SSE e caminhos exatos        |
| TASK-0015 | Engineer             | engineer-frontend   | Luna/baixo     | CTG-0004b | 0014       | scaffold web não comportamental, compilável e com harness vazio                              |
| TASK-0016 | Inspector            | inspector-tests     | Terra/alto     | CTG-0004b | 0015       | RED web: 60 rotas, 56/56 fichas, papéis cartesianos, a11y e componentes compartilhados       |
| TASK-0017 | Engineer             | engineer-frontend   | Terra/médio    | CTG-0004b | 0016       | implementação web em caminhos de produção exatos; testes intocáveis                          |
| TASK-0018 | Architect (transcr.) | transcriber-docs    | Luna/baixo     | CTG-0005  | 0017       | fechamento documental somente após merges/gates reais                                        |

CTG-0001, CTG-0002, CTG-0003, CTG-0004a, CTG-0004b e CTG-0005 são seis fronteiras de PR. O
scaffold de CTG-0004a/b é substrato não comportamental autorizado pelo Architect do mesmo CTG;
depois do scaffold, o Inspector escreve RED e os testes ficam congelados antes do Engineer de
feature. O maestro roda `pnpm install`, guarda `pnpm-lock.yaml` e estende `pnpm check`
imediatamente após TASK-0007, TASK-0011 e TASK-0015. TASK-0008 não pode iniciar antes do
checkpoint de instalação/lockfile posterior a TASK-0007. Banco da rodada:
`work/rounds/R-0013/env-detran-r13.sh`.

## Critérios de aceitação (comandos → resultado)

- após TASK-0004: `pnpm docs:kb:check` → exatamente 675 artefatos/446 tokens; publish-check OK;
- após TASK-0006: `pnpm parameters:test` → 25/25; `pnpm verify:parameter-catalogue` → 89
  parâmetros e namespaces `teat.*` declarados; somente os três gerados documentados mudam;
- provisionamento: comandos separados `test:unit`, `test:integration`, `test:e2e`; `contracts:test`,
  shared policy, RLS, decorators, reset + dois seeds idempotentes em `detran_r13`; toda a matriz
  P0–P6, não apenas quatro rejeitos;
- mobile: comandos separados `lint`, `typecheck`, `test`, `build`; 70/70 rotas/fichas, 576/576
  transições e produto cartesiano de papéis permitidos/omitidos;
- web: comandos separados `lint`, `typecheck`, `test`, `build`; 60/60 rotas, 56/56 fichas e
  produto cartesiano de papéis;
- ao fim de cada CTG: `pnpm check`; CTG-0003 também `pnpm backend:test:ci`; zero skip/todo novo.

## Mapa entregável → definições

| Entregável      | Definição                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| fichas          | matriz de paridade da origem (67/56 → 70/56); `teat-frontends.md` §4–§7; [IU-TEAT-001]; [JRN-TEAT-001…006] |
| formulários     | `teat-frontends.md` §8; [WF-TEAT-001…005]; [RN-TEAT-*]; `teat-error-catalog.md`                            |
| hierarquia      | `teat-frontends.md` §1–§3, §9–§12; `rait-web-structure-diagrams.md` (modelo)                               |
| provisionamento | `teat-build-pack.md` §WP-T5; plano P0–P6 e matriz de prova da origem (somente leitura); INV-OFFLINE-001    |
| bootstrap/sync  | `teat-route-contract.md` §4 e §7; schemas de R-0008                                                        |
| decisões        | steering H.39, H.54, H.55; OD-T03…T12                                                                      |

## Riscos

- Volume: 126 fichas em duas tarefas de transcrição; se a janela acabar, `checkpoint` com a lista
  das fichas concluídas (o teste tela ↔ ficha falha até completar — nunca reduzir a matriz).
- `packages/ui`: lock com `rait-web` (R-0012) apenas se ativas simultaneamente; R-0012 não abriu, então esta frente vai primeiro e R-0012 copia o padrão de `apps/portal/web`/`apps/teat/*`.
- Provisionamento toca `backend/domains/ops` e `policy.ts`: na onda 6 a outra frente ativa é
  `portal-pwa`, sem lock comum.
- Impressora real, KMS real e Keystore: fora desta frente (integração); portas com fixtures.

## Adenda estrutural A1 — resposta ao `prompt-review-1=FAIL`

Autorizada pelo Owner em 2026-09-20. Esta adenda substitui integralmente a decomposição e os
prompts anteriores; não é um ciclo incremental de `REVIEW`.

1. I18n canônico e allowlist são Architect/transcriber sob OD-P46; regeneração é Engineer mecânico.
2. Matrizes oficiais são portadas antes das fichas, fixadas ao HEAD/hashes da origem somente leitura.
3. Todos os joins foram serializados em 18 tarefas; plano, task JSON e CTGs têm a mesma cadeia.
4. Provisioning é uma tríade A→I→E com ADR-0028 (renumerado pela A3), DDL 21 e contratos/caminhos
   resolvidos.
5. Cada app é A→scaffold E não comportamental→Inspector RED→Engineer feature; testes/configuração
   têm donos disjuntos e exclusões explícitas.
6. Contratos de app obrigam H.39/H.54/H.55, roles/policy e produto cartesiano de autorização.
7. Comandos `lint`, `typecheck`, `test`, `build`, tiers de backend e seeds são invocações separadas.
8. KB pós-fichas é 675/446; UC-TEAT-013 já existe e não conta como artefato novo.
9. As quatro rotas web operacionais, além das 56 telas da matriz, são fixadas pelo Architect como
   `/acesso-negado`, `/conta`, `/erro` e wildcard `**`; não geram fichas de produto.

## Adenda estrutural A2 — resposta ao `prompt-review-2=FAIL`

Autorizada pelo Owner em 2026-09-20 e limitada aos sete achados registrados. A cadeia de 18 tarefas,
papéis e CTGs aceita pelo reviewer permanece inalterada.

1. TASK-0001 recebe as fontes/destinos faltantes para itens 8–11: WF-TEAT-001/002,
   UC-TEAT-007/012, RN-TEAT-135 e os blueprints de álcool adotado/origem; blueprints são leitura.
2. `preflight-a2.json` fixa base, sibling somente leitura, remote, HEAD, limpeza e hashes. Workers
   não invocam Git: validam hashes legíveis e reportam paths; somente o maestro verifica diff.
3. O checkpoint `pnpm install` + captura de lockfile passa a ocorrer imediatamente após TASK-0007
   e antes do Inspector TASK-0008.
4. TASK-0007 roda `contracts:clients`, possui o barrel manuscrito
   `packages/api-clients/src/index.ts` e prova a superfície pública por typecheck.
5. TASK-0017 lê o barrel real `packages/api-clients/src/index.ts`, não um index gerado inexistente.
6. `src/test-setup.ts` é propriedade exclusiva dos scaffolds TASK-0011/TASK-0015; Inspectors só
   escrevem specs e `src/testing/**`.
7. O JSON da TASK-0008 traz, como comandos separados, precondição explícita de ambiente, reset e
   duas execuções de seed em `detran_r13`.

O preflight é renovado pelo maestro antes do dispatch se qualquer identidade/hash mudar. O avanço de
`origin/main` para `a0f62cb67383ba31354f4c72e24bec91a3f22138` foi integrado por rebase antes desta
adenda; a branch continua inédita.

## Adenda estrutural A3 — resposta ao `prompt-review-3=FAIL`

Autorizada pelo Owner em 2026-09-20 e limitada aos dois achados pós-rebase. Os sete achados da A2,
a cadeia de 18 tarefas, papéis e CTGs aceitos pelo reviewer permanecem inalterados.

1. O ADR de provisionamento passa integralmente de ADR-0025 para o próximo identificador livre
   verificado no repositório, ADR-0028. Plano, metadata e prompts TASK-0007…0009 usam apenas
   `docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md`.
2. O objetivo do plano passa a nomear exclusivamente `backend/database/ddl/21-ops-provisioning.sql`,
   em concordância com a tabela, tarefas e prompts.

Relatórios `prompt-review-1…3` são evidência histórica imutável e preservam as referências antigas.

## Lições aplicadas (método §4.8–§4.18, `waves.md` §Histórico)

- Transcrição de fichas, contratos, i18n e docs é ato de **Architect** (`transcriber-docs`); tarefas assim aparecem como "Architect (transcr.)".
- Nenhum Engineer ou transcriber entrega o teste do próprio artefato: contratos → `contracts:test` pelo Inspector; fichas/i18n → teste tela ↔ ficha ↔ rota pelo Inspector.
- Ciclos de review a partir do segundo restritos aos itens corrigidos; contradições contrato × código resolvidas pelo Architect por adenda numerada em `plan.md` antes de redespachar.
- O CTG seguinte só começa a escrever depois do merge do anterior ou nasce em branch empilhado; nunca commits novos no branch de um PR aberto; integrar `main` por merge, nunca `--force`.
- Listas de leitura dos workers fechadas e completas (DDL gerado, blueprint, `seed.sh`, fixtures, specs de referência como `backend/app/tests/e2e/policy-routes.e2e.spec.ts`); lacuna aqui foi `reference-gap` em R-0010.
- M24: o Architect declara `module.handwritten*` com símbolos fixos no blueprint; Engineers nunca editam blueprints; `typecheck` vermelho entre as tarefas do CTG é esperado; toda edição de blueprint do CTG num único checkpoint de regeneração.
- Política `ops:provisioning:*` prova presença **e** ausência: testes positivos para os papéis listados e negativos para todos os papéis canônicos omitidos; nenhum grant por analogia.
- e2e idempotente em banco persistente: `afterAll` limpa o que criou; `DB_NAME` explícito em `work/rounds/<R>/env-detran-rN.sh`.
- Pacote novo montado no `AppModule` entra em `backend/app/vitest.config.ts` (alias) e `backend/app/package.json`; fixtures novas passam por `bash backend/database/seed.sh` duas vezes e pelo job `backend-kernel`.
- Padrão de app (R-0014, `apps/portal/web`, `@detran/portal-web`): copiar `package.json` (scripts `build|test|lint|typecheck`), `angular.json`, `eslint.config.js`, `tsconfig.{app,spec}.json`, `vitest.config.ts` com o plugin `angularJitApplicationTransform` (sem ele `input()`/`output()` não registram), `src/app/app.route-manifest.ts` + spec, pastas `core/ data/ features/ forms/ i18n/ screens/ shared/ a11y/`; a extensão de `pnpm check` é `pnpm --filter <app> lint|test|build`, uma tripla por app.
- Pacote de workspace novo: o maestro roda `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector (CI é `--frozen-lockfile`).
- Chaves i18n não são parâmetros (OD-P46): a allowlist já está em `parameter-catalogue.md` §Namespaces i18n; esta rodada acrescenta as linhas `teat.<namespace>` (app, arquivo, decisão) antes de `i18n/teat.pt-BR.json` entrar em código; placeholders i18n na sintaxe STYNX `{x}`.
- Testes de roteamento cobrem papéis com e sem acesso (presença e ausência), não só o papel mínimo.
- `teat.*` já é prefixo de parâmetros vigentes (`teat.speed_meters`, `teat.homologation.*`): sem a linha na allowlist, `verify:parameter-catalogue --check-usage` fica vermelho.
- Execução no Codex (R-0014 §10): comandos acima de 30 s rodam em segundo plano com log e polling pelo maestro; o sandbox não tem `pkill`, o isolamento é por arquivo de spec (um app isolado por spec); proibir no prompt do Inspector asserções por conjunto de status e escapes condicionais; todo prompt de Inspector do app traz `typecheck` como critério; Architect explícito em cada CTG com contrato antes de Inspector e Engineer; ler o veredito do reviewer na íntegra; `SENATRAN_*_BASE_URL` só em shell/CI, nunca em `backend/**`; se o Owner autorizar workers da outra família, usar `tools/orchestra/worker.sh` (registra executor e hashes).

## Concorrência

Bootstrap em `b0df484dc0ae1fc1fa742a5f60ef00b17b1c348e`, criado diretamente de
`origin/main` e validado após `fetch --prune`. O mínimo `80d705a` está contido na base. R-0005
(offline), R-0008/PR #52 (schemas, clientes e contratos TEAT) e R-0014/PRs #60…#67 (scaffold do
Portal) já estão em `main`; o refresh desta rodada é o PR #68. R-0012 ainda não abriu, portanto
não há lock ativo em `packages/ui`. CTG-0001…CTG-0005 estão liberados para desenvolvimento e
merge contra `main`; nenhum usa base empilhada. Antes de cada PR, o maestro volta a buscar
`origin/main` e integra avanço sem reescrever branch publicada.

## Bloqueios

- `2026-09-20`: `prompt-review-1` não pôde ser executado pela ponte obrigatória
  `tools/orchestra/bridge.sh claude opus`: a CLI Claude respondeu `You've hit your weekly limit ·
resets Sep 21 at 4am (America/Sao_Paulo)`. Nenhum worker foi liberado, porque §5 exige `PASS`
  da outra família. Não há bloqueio de produto, código, upstream ou decisão OD.
- `2026-09-20`, exceção explícita do Owner para o restante desta sessão: o reviewer pode ser da
  mesma família Codex, com modelo/esforço adequado. A ponte Codex foi descartada para este gate ao
  revelar esforço fixo `low`; o review válido foi executado por agente nativo Codex/Sol/high,
  somente leitura. Esta exceção não altera a política permanente nem vale para sessões futuras.
- `prompt-review-1` excepcional Codex/Sol/high: **FAIL**, com 16 achados high e 2 low. Por §5 do
  prompt do maestro, o plano está `escalated` e a sessão para antes dos workers. Temas: papéis e
  CTGs, fronteiras de escrita, fontes canônicas, dependências/barreiras, ordem scaffold→Inspector
  RED→Engineer, comandos de aceitação, testes de contrato/policy, banco explícito e caminhos
  resolvidos de ADR/DDL.
- `prompt-review-2` após Adenda A1: **FAIL**, reduzido a 7 achados high. A estrutura 18/18,
  cadeia/CTGs, matrizes, hashes e modelos foi aceita; persistem lacunas executáveis de fontes do
  corpus, preflight Git, checkpoint de instalação, geração/export de clientes, path de barrel,
  dono de `test-setup` e reset/seeds no task JSON. A rodada continua `escalated`; nenhum worker.
- `2026-09-20`: Owner autorizou explicitamente a Adenda A2. Os sete achados foram corrigidos sem
  alterar a cadeia/CTGs; a rodada permanece sem workers até novo `PASS` do reviewer.
- `prompt-review-3` após Adenda A2: **FAIL**, com 1 high e 1 low novos após o rebase. Os sete
  achados da revisão anterior foram aceitos, mas o PR #69 ocupou ADR-0025 e o registro já segue até
  ADR-0027; provisionamento precisa migrar integralmente para ADR-0028. O objetivo também conserva
  uma referência residual a DDL 19, enquanto tarefas/prompts usam DDL 21. Por ser o terceiro ciclo
  e haver `FAIL`, §5 exige nova parada antes de qualquer worker.
- `2026-09-20`: Owner autorizou explicitamente a Adenda A3 limitada a ADR-0028 e DDL 21. Nenhum
  worker será liberado antes de novo `PASS`.
- `prompt-review-4` após Adenda A3: **PASS**, sem achados. ADR-0028, DDL 21, 18/18 hashes/PCs e
  preservação dos sete reparos A2 foram confirmados; TASK-0001 está liberada pela cadeia serial.

## Triagem

- `TASK-0001/attempt-1` — `reference-gap`: worker encerrou antes de completar a tabela 1–12;
  allowlist preservada, KB checks verdes, `format:check` inconclusivo. Uma tentativa corretiva foi
  liberada para concluir todos os itens, revisar coerência interna das alterações e rodar os três
  gates completos.
- `TASK-0001/attempt-2` — `reference-gap` persistente: gates e allowlist verdes, mas o diagrama de
  WF-TEAT-002 conserva `atinge end_number`/`fonte pendente`, em conflito com OD-T07
  `next_number > end_number`. Escalada para Terra/médio antes de liberar TASK-0002.
- `TASK-0001/escalation-1` — resolvido: Terra/médio alinhou o diagrama a OD-T07, auditou os 12
  itens e passou format/KB/publish/diff. Entrega segue para review de CTG-0001.
- `delivery-review-CTG-0001/cycle-1` — `REVIEW`: corrigir unicidade/vínculos de passos em
  UC-TEAT-008, referência 5b→4b em UC-TEAT-009, pendências contraditórias OD-T07 em WF-TEAT-002,
  explicitar ambos os campos impressos OD-T05 em WF-TEAT-004 e reconhecer `PsychomotorSign` nos
  dois blueprints em WF-TEAT-005. Diff e gates foram aceitos.
- `2026-09-20`: Owner retomou explicitamente após o checkpoint de orçamento e autorizou as cinco
  correções do delivery review ciclo 1 mais nova submissão; nenhum escopo adicional foi aberto.
- `TASK-0001/delivery-correction-1` — cinco findings corrigidos por Terra/médio; uma correção
  mecânica restaurou o token histórico `RISCO` e removeu linha duplicada. Format/KB 549/446,
  publish 201 e diff-check verdes; enviado ao delivery review ciclo 2.
- `delivery-review-CTG-0001/cycle-2` — `REVIEW`: F-001/F-002/F-004/F-005 aceitos; F-003 persiste
  porque a legenda de expiração em WF-TEAT-002 ainda marca o mecanismo de devolução como fonte
  pendente, reabrindo OD-T07. Limite de dois ciclos atingido; exige nova autorização antes de
  correção/review adicional.
- `2026-09-20`: Owner autorizou excepcionalmente remover somente a marca residual de fonte
  pendente em WF-TEAT-002 e realizar um terceiro delivery review; nenhum outro escopo foi aberto.
- `TASK-0001/delivery-correction-2-extraordinary` — F-003 corrigido: expiração devolve o
  subintervalo não utilizado como `disponivel` na reconciliação sob OD-T07; somente o risco técnico
  de constraints permanece. Format/KB 549/446, publish 201 e diff-check verdes.
- `delivery-review-CTG-0001/cycle-3-extraordinary` — **PASS**, sem achados. Owner autorizou a
  exceção; F-003 foi confirmado fechado e nenhuma regressão direta foi encontrada.

## Retomada

Checkpoint 1 (janela 1, bloqueio externo antes dos workers):

- concluído: worktree/branch em `b0df484dc0ae1fc1fa742a5f60ef00b17b1c348e`; autorização;
  `pnpm install --frozen-lockfile`; baseline `pnpm check`; `devai doctor`; leitura mandatória;
  concorrência; plano; 12 task JSON; 12 prompts e `compositions.json`;
- concluídos: `prompt-review-1=FAIL` (16 high, 2 low) e `prompt-review-2=FAIL` (7 high), ambos
  Codex/Sol/high e registrados em `reviews/`;
- pendente: todos os workers `TASK-0001…0018`, todos os delivery reviews, gates de entrega,
  evidência, PRs, merges, observação e fechamento;
- último veredito: `FAIL`; nenhum worker autorizado;
- concluídos: Adenda A2, gates estruturais e `prompt-review-3=FAIL` excepcional Codex/Sol/high;
- concluídos: Adenda A3, gates estruturais e `prompt-review-4=PASS` excepcional Codex/Sol/high;
- acceptance de TASK-0001 concluída após duas tentativas Luna e uma escalada Terra; delivery
  review ciclo 1=`REVIEW`, portanto TASK-0001 voltou a `queued` e o conteúdo não foi commitado;
- concluído: TASK-0001, acceptance e delivery review extraordinário ciclo 3=`PASS`;
- concluídos: gate completo, commit de conteúdo `68228cdeb0b418e7188ec47e70ae566ff885b212`,
  evidência `generic sequence 1`, verificação da cadeia e commit de evidência
  `bc3509c0e2f20c44e1b0fed97c658d2b21229dd2`; head da cadeia
  `458f088f1baf5a9471435a0cbf1d00d4931bf262ae6044a172e6fc2cecbc76af`;
- checkpoint de orçamento: 755.000/800.000 tokens de entrada estimados (94,375%); TASK-0002 não
  foi iniciado e permanece para a próxima janela;
- a retomada explícita do Owner supera o checkpoint anterior apenas para fechar CTG-0001; não
  iniciar TASK-0002 nesta janela;
- estado Git: branch ainda não publicada, sem PR; avanço de `origin/main` até
  `a0f62cb67383ba31354f4c72e24bec91a3f22138` integrado por rebase antes da A2.

Checkpoint 2 (janela 2, preflight de TASK-0002):

- CTG-0001 mesclado pelo PR #70 em `2c82b2698d153005aaf0ea5d4d49667411ed7ace` após cinco
  checks remotos verdes; branch publicada foi preservada para a continuação da rodada;
- `origin/main` `3cdc281e643f20d5a6409eb61dc5da599ea7538d` integrado por
  `git merge --no-edit origin/main` (fast-forward), sem conflitos; nenhum PR `orchestra/*` aberto;
- `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm devai:doctor`, `git diff --check` e cadeia
  DEVAI passaram; baseline atual: KB 549/446, publish 201, contratos 152 operações/61 clientes,
  parâmetros 34/34 e 89 entradas/15 namespaces, contratos 40/40, 948 handlers, 237 tabelas RLS,
  portal 118 arquivos/1.314 testes;
- Auditor independente observou o merge no HEAD exato, evento `EV-34d4ee8bc41350a6`; artefatos
  integrados em `b0dddf6ed8e724c945999bd5166a727767cd4862` e registrados como R-0013
  `generic sequence 2`, chain head
  `2800f2e0ae01f72b3d394580933adb71177ed2381f47dd6e46b6daa06d6d0fae`;
- revalidação Architect: origem TEAT continua limpa em `8880f4294c24ff7bd4bf5e0afecfc44faa86ffab`,
  os seis hashes imutáveis conferem, 18/18 prompts conferem com `compositions.json` e TASK-0002
  permanece `PC-beefdb86efc5fefc`; o delta BOAT/infra não invalida `prompt-review-4=PASS`, portanto
  novo reviewer não é necessário;
- `preflight-a2.json` renovado para o novo `origin/main` e branch publicada; ADR-0028 e DDL 21
  permanecem livres;
- janela 2 aberta com 65.000/800.000 tokens de entrada estimados (8,125%); TASK-0002 permanece
  `queued` e está pronto, mas nenhum worker foi iniciado durante este preflight.

## Leitura

Leitura do maestro concluída sobre `b0df484dc0ae1fc1fa742a5f60ef00b17b1c348e`, na ordem do
prompt: `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/README.md`;
`docs/meta/agents/orchestra/{README,model-ladder,waves}.md`; `teat-build-pack.md` inteiro;
`teat-frontends.md`; `teat-error-catalog.md`; `rait-web-structure-diagrams.md`; `IU-TEAT-001`;
`JRN-TEAT-001…006`; `WF-TEAT-001…005`; `RN-TEAT-001…006` e `RN-TEAT-101…144`;
`parameter-catalogue.md`; `decision-closure-plan.md`; `steering.md` §H; manuais
`architect-blueprint`, `engineer-backend`, `engineer-frontend`, `inspector-tests` e
`transcriber-docs`; este plano. A leitura confirmou 70 rotas mobile, 60 web (56 telas + 4
operacionais), 126 fichas, 576 transições, enums fechados, pares metrológicos obrigatórios e a
proibição de calcular prazos legais no cliente.
