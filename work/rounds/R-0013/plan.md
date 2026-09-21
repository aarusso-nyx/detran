# R-0013 — frente `teat-frontends` (WP-T4, WP-T5, WP-T6 do TEAT: fichas, formulários, i18n, provisionamento offline e apps mobile/web)

**Status:** CTG-0001 e CTG-0002 mesclados e observados; CTG-0003 é a próxima fronteira.
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
  P0–P6, não apenas quatro rejeitos; `contracts:check` admite exatamente oito `missing-route` após
  o Architect, como RED da fronteira manuscrita, e deve ficar integralmente verde no Engineer;
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

## Adenda estrutural A4 — fronteira executável do RED contratual em CTG-0003

Autorizada pelo Owner ao determinar a execução completa de CTG-0003 e limitada à contradição
operacional descoberta durante TASK-0007. Nenhuma autoridade de produto, requisito, papel, artefato
ou dependência do grafo de 18 tarefas é acrescentada ou alterada.

1. TASK-0007, em papel Architect, continua responsável por ADR-0028, blueprint, DDL, schemas,
   contratos OpenAPI e clientes gerados, mas não pode criar ou montar `src/handwritten/**`.
2. Como `contracts:check` também verifica o mounting das rotas manuscritas, o estado aceito ao fim
   de TASK-0007 é um RED estritamente delimitado a exatamente oito achados `missing-route`, um por
   comando de provisionamento; todo schema, código de erro e demais verificação contratual deve estar
   verde. O maestro reproduz e registra essa fronteira antes de liberar TASK-0008.
3. TASK-0008 preserva esse limite como Inspector: escreve exclusivamente as provas e fixtures que
   devem falhar pela ausência da implementação, sem preencher a lacuna de produção.
4. TASK-0009, em papel Engineer, implementa e monta exatamente as oito rotas manuscritas. Só nessa
   etapa acrescenta exatamente `backend/domains/ops/provisioning/src/handwritten` a
   `CONTROLLER_ROOTS` em `tools/contracts/check-commands.mjs`, sem alterar nenhuma raiz ou lógica
   existente, e `pnpm contracts:check` passa a ser gate verde obrigatório, além dos testes do pacote,
   shared, decorators, backend e suíte completa.

Esta adenda substitui apenas a expectativa impossível de `contracts:check` verde em TASK-0007; todas
as demais cláusulas da A1–A3 e o review 4 permanecem vigentes.

## Adenda estrutural A5 — autoridade de provisionamento e barreira compilável do Inspector

Autorizada pelo Owner em 2026-09-21 após o bloqueio fail-closed de TASK-0008. A5 fecha somente as
cinco lacunas auditadas; não escolhe criptografia, formato wire ou requisito fora do CTG-0003.

1. A matriz de autorização estrita é a registrada em `AUTHORIZATION.md` Amendment 1. Nas operações
   baseadas em papel, as chaves `ops:provisioning:*` são avaliadas antes de permissões `*`, wildcards
   e bypasses administrativos: `ADMIN`, `GESTOR_DETRAN`, `SUPORTE` e qualquer papel omitido não
   concedem acesso. Nas operações baseadas em identidade, a autorização decorre exclusivamente do
   principal/dispositivo autenticado e de seu vínculo; portar papel omitido não concede bypass nem
   invalida sozinho um vínculo válido. Sujeito/dispositivo/tenant/órgão continuam camadas obrigatórias.
2. O Architect corrige ADR/contrato e ambiente: os seis POST exigem `If-Match` e
   `Idempotency-Key`, retornam 428/412 com códigos canônicos e ETag de sucesso; GETs não exigem esses
   headers. `apply.sh` recebe DDL 21 no inventário e um ramo fechado exclusivo para `detran_r13`
   mediante `DETRAN_R13_FULL_AUTHORIZED=1`, preservando integralmente o rehearsal R7.
3. Um checkpoint corretivo Engineer, anterior ao Inspector, cria somente os onze módulos
   handwritten fixados pelo blueprint. Eles exportam tipos, token, controller sem decorators/rotas
   e comandos que falham explicitamente como não implementados. Isso torna typecheck verde sem
   implementar comportamento nem eliminar os oito `missing-route`.
4. O Inspector acrescenta fixture 29 e somente sua referência imediatamente após fixture 28 nas
   listas `fresh` e `legacy-upgrade` de `seed.sh`; preserva validação fechada e transação única.
   Testes compilam: comandos diretos ficam RED pelo sentinel `not implemented`; e2e HTTP fica RED
   somente porque as oito rotas ainda não foram montadas. Import/configuração/fixture devem estar verdes.
5. O Engineer de TASK-0009 substitui o scaffold pela implementação, monta as oito rotas, aplica a
   matriz estrita e os vínculos dinâmicos, e leva typecheck, testes e `contracts:check` a verde.

Ordem vinculante corrigida: Architect correction → review A5 → Engineer scaffold → Inspector RED →
Engineer GREEN. O scaffold é checkpoint corretivo do CTG, não amplia o grafo funcional de 18 tarefas.

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

- `TASK-0007/attempt-1` — `policy-issue`: o contrato original exigia `contracts:check` verde do
  Architect, mas o checker requer oito controllers manuscritos que o mesmo prompt proíbe e reserva
  à TASK-0009, depois do Inspector RED. Adenda A4 move o gate verde para TASK-0009 e limita o RED
  de TASK-0007 a exatamente oito `missing-route`; schemas/códigos continuam obrigatoriamente verdes.
- `prompt-review-5/A4-F001` — `policy-issue`: o checker não varre imports do AppModule e sua lista
  estática não continha o novo módulo. A4/TASK-0009 passam a autorizar somente a inclusão da raiz
  handwritten de provisioning em `CONTROLLER_ROOTS`; lógica e raízes anteriores ficam congeladas.
- `TASK-0008/attempt-1` — `reference-gap`: seed 29 não integra as listas fechadas de `seed.sh`;
  correção mecânica deve incluí-lo em `fresh` e `legacy-upgrade`, preservando a transação única.
- `TASK-0008/attempt-1` — `environment-blocker`: `apply.sh` não conhece DDL 21 e autoriza `--full`
  apenas para o rehearsal histórico R7. A futura A5 deve acrescentar o DDL ao inventário e um ramo
  fail-closed exclusivo para `detran_r13`, com flag explícita própria da rodada.
- `TASK-0008/attempt-1` — `policy-issue`: o critério de typecheck verde contradiz o RED de imports
  handwritten já previsto em M24. Nenhum erro de import será aceito como prova comportamental; a
  fronteira de scaffolding/Inspector/Engineer precisa ser corrigida e revisada na A5.
- `TASK-0008/attempt-1` — `source-gap`: workflow, invariante, ADR e issue 71 não fecham os oito
  conjuntos de atores canônicos nem os vínculos dinâmicos de autorização. Inspector interrompido
  antes de escrever testes; é necessária decisão mínima do Owner, sem grants por analogia.
- `TASK-0008/attempt-1` — `contract-gap`: o contrato de comandos omite `If-Match`,
  `Idempotency-Key`, 428/412 e ETag exigidos por CODESTYLE/prompt. Retorna ao Architect antes do
  contrato ser congelado para o Inspector.
- `TASK-0008/attempt-2` — `reference-gap`: as oito operações novas tornam obsoletas somente as
  contagens 152/92 do teste real do gate. Inspector recebe autoridade focal para 160/100; nenhuma
  fixture, comportamento ou outra assertion do teste existente pode mudar.
- `prompt-review-9/A5-COUNTS-F001` — `policy-issue`: C-5-16 prova o repositório real integral e
  permanece RED enquanto as oito rotas não estão montadas. A assertion fica intacta; TASK-0008
  aceita exclusivamente esse RED e TASK-0009 recebe `contracts:test` verde explícito.
  O worker também declarou um `git rev-parse/status` somente leitura antes de ler a proibição e
  iniciou uma geração redundante; não houve mutação Git, e o processo redundante foi encerrado por
  PID exato antes de continuar.
- `delivery-review-CTG-0002/cycle-4-final-extraordinary` — **PASS**, sem findings. F-008/F-009
  fechados; 51 contratos TEAT semanticamente distintos, cinco fronteiras BOAT uniformes corretas,
  126/126 hashes e regressões/gates confirmados por Auditor Codex Astra/max.
- `CTG-0002/delivery-correction-3-final` — Astra/max corrigiu F-008/F-009: 36 fichas e somente
  seus 36 pares de hash no manifest; `ait-print` distingue as variantes, `ait-reject` ficou isolada
  e 51/51 contratos TEAT web permanecem distintos após normalização estrita. Pré-auditoria do
  maestro e todos os gates passaram; quarto review extraordinário liberado.
- `2026-09-21`: Owner autorizou explicitamente a correção final de F-008/F-009 e um quarto review
  extraordinário, exigindo atenção suficiente para fechamento nesta iteração. Correção escalada a
  Codex Astra/max; pré-auditoria do maestro obrigatória antes do reviewer.
- `delivery-review-CTG-0002/cycle-3-extraordinary` — **FAIL / escalated**: F-003 passou e mobile
  passou salvo distinção de assinatura em impressão imediata versus diferida/reimpressão; 34/56
  fichas web ainda reduzem a template parametrizado e `ait-reject` conserva comportamento de telas
  irmãs. A autorização extraordinária foi consumida; nenhum quarto ciclo sem nova autorização.
- `CTG-0002/delivery-correction-2-extraordinary` — F-003/F-008/F-009 corrigidos: 114 mensagens
  pt-BR completas e 29 estados localizados, 67 contratos mobile distintos, 56 contratos web
  distintos e 126/126 hashes finais. Format global, KB, publish, parâmetros, verifier e diff
  passaram; terceiro review extraordinário liberado pela autorização explícita do Owner.
- `2026-09-21`: Owner autorizou explicitamente corrigir os três findings residuais do CTG-0002 e
  realizar terceiro review extraordinário. O escopo permanece limitado a localização pt-BR de
  estados/erros e contratos específicos mobile/web; os seis findings aceitos não serão reabertos.
- `delivery-review-CTG-0002/cycle-2` — **FAIL / escalated**: F-001/F-002/F-004/F-005/F-006/F-007
  passaram; persistem três achados high em valores pt-BR de estados/erros e contratos específicos
  mobile/web ainda colapsados por grupo. Regra §8: `FAIL → escalated`; nenhum commit ou novo ciclo
  sem autorização explícita do Owner.
- `CTG-0002/delivery-correction-1` — nove findings corrigidos por Terra/high: 126 hashes finais,
  337 chaves i18n flat com 126 títulos e 114 erros, diagrama 56+4, 16 fronteiras BOAT,
  transições integrais, três deltas corrigidos e contratos específicos mobile/web. Format global,
  KB 675/446, publish 201, parâmetros 34/34, verifier 89/18/27/0 e diff passaram; ciclo 2 aberto.
- `delivery-review-CTG-0002/cycle-1` — **FAIL**: nove achados bloqueiam commit; corrigir hashes
  finais do manifest, catálogo i18n completo/canônico, diagrama 56+4, fronteira BOAT em 16 fichas,
  navegação repetida, rotas dos três deltas e a transcrição específica dos contratos mobile/web.
  Primeiro ciclo corretivo liberado com modelo de nível superior; nova revisão integral obrigatória.
- `TASK-0006/attempt-1` — `baseline-drift`: a regeneração mecânica passou com 34 testes e 27
  namespaces, não as contagens históricas 25/26 ainda escritas no prompt. O preflight já havia
  fixado 34 testes e 15 namespaces antes das 12 adições; logo 34/34 e 27 namespaces são as saídas
  coerentes atuais. Os três, e somente os três, gerados autorizados mudaram.
- `TASK-0004/attempt-1` — `implementation-bug`: o primeiro manifest confundiu
  `sourceFileCount` com `artifactIdCount`, registrou só 55 fichas web e omitiu `tech-health`.
  A tentativa 2 corrigiu exclusivamente o manifest: 126 entradas novas, 746 fontes, 675
  artefatos e 446 tokens; todas as fichas, o diagrama, format, KB, publish e diff passaram.
- `TASK-0003/attempt-1` — `policy-issue`: as 70 fichas mobile existem exatamente, sem faltas ou
  extras, e passam Prettier, publish-check e `git diff --check`; `docs:kb:check` detecta corretamente
  619 artefatos, mas ainda espera 549 porque o próprio prompt proíbe alterar o manifest nesta tarefa.
  A atualização única do manifest para as 126 fichas pertence expressamente a TASK-0004. A barreira
  foi aceita sem enfraquecer o gate: TASK-0004 deve atualizar o manifest e fechar em 675/446.
- `TASK-0002/attempt-1` — `policy-issue`: as três matrizes oficiais conferem byte a byte e por
  SHA-256, mas os bytes imutáveis não seguem o Prettier local; a política existente para capturas
  imutáveis foi estendida somente aos três JSONs, enquanto `PROVENANCE.md` continua formatado. Isso
  preserva simultaneamente proveniência exata e o gate global, sem ignorar conteúdo autoral.
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

Checkpoint 3 (janela 2, correção final CTG-0002):

- TASK-0002…0006 concluídas; 126 fichas, i18n, diagrama, manifest e três gerados presentes;
- delivery reviews ciclos 1, 2 e 3 retornaram `FAIL`; no ciclo 3 restam somente F-008
  (`ait-print`) e F-009 (34 contratos web parametrizados, incluindo `ait-reject`);
- Owner autorizou explicitamente a correção final e quarto review extraordinário, com atenção
  reforçada para fechamento nesta iteração;
- orçamento estimado da janela: 755.000/800.000 tokens de entrada (94,375%); checkpoint gravado ao
  ultrapassar 80%, mas a autorização explícita vigente limita e libera somente esta última
  correção/revisão, gates, commit/evidência e integração do CTG-0002;
- nenhuma publicação do conteúdo CTG-0002 ocorreu; branch remota permanece em `b72d1e8a`.

Checkpoint 4 (janela 2, fechamento CTG-0002):

- quarto delivery review extraordinário independente retornou `PASS`, sem findings; F-008 e F-009
  foram confirmados fechados no candidato final;
- conteúdo commitado em `e2565bde774e794ca7ad7186159d65154accc184`; evidência de entrega
  R-0013 `generic sequence 3` em `deeb3b076c4d62a2ef3d30c2e6735907d03dbacd`;
- `pnpm check` passou antes e depois da sincronização; `devai:doctor`, `git diff --check` e cadeia
  passaram; `origin/main` não avançou durante a integração;
- PR #73 teve seis checks remotos verdes e foi mesclado como
  `3da2b61ee8e418e634a7364417175a1e86a8c9e0`;
- Auditor independente observou o merge no HEAD exato: evento `EV-b2cdee5c709b0b18`, status
  `completed`, diagnóstico conservador `YELLOW` por 43 lacunas de sensores e
  `readiness_promoting=false`; isso não reabre o delivery review;
- artefatos de observação preservados em `c9148c53f875c5ba3e48ba6f54d1393b730758e8` e registrados
  como R-0013 `generic sequence 4` em `992ec77befbac30e5bc7f9ec9664caad3b8bcaaf`;
  chain head `eae4e44dd145eea6c970dfc0b39b91e48751e6321a472ac8f89dd744b5b11c72`;
- branch de continuidade publicada em `992ec77b`; CTG-0002 está completamente fechado e CTG-0003
  permanece pendente, sem implementação iniciada nesta iteração.

Checkpoint 5 (janela 3, preflight CTG-0003):

- Owner autorizou a execução completa do CTG-0003; janela 3 aberta com orçamento novo de 800.000
  tokens de entrada e 30.000 estimados no preflight;
- branch/worktree limpos e publicados em `5a52dbfb975a9f7d570e304dad5d699b5e9b7774`; `origin/main`
  permanece no merge do CTG-0002, `3da2b61ee8e418e634a7364417175a1e86a8c9e0`; nenhum PR aberto;
- origem TEAT somente leitura permanece limpa em `8880f4294c24ff7bd4bf5e0afecfc44faa86ffab`,
  remote `aarusso-nyx/detran-teat`; workflow e INV-OFFLINE-001 conservam hashes
  `a35546ab…` e `b55a91e0…`, e os seis hashes do preflight conferem;
- TASK-0007…0009 e seus `prompt_composition_id` conferem byte a byte com `compositions.json`;
  `prompt-review-4=PASS` permanece aplicável porque prompts e fontes vinculantes não mudaram;
- ADR-0028, DDL `21-ops-provisioning.sql` e `BP-OPS-PROVISIONING-001` continuam livres; Postgres
  local aceita conexões e o ambiente isolado `detran_r13` está presente;
- TASK-0007 marcada `in_progress`; TASK-0008/0009 permanecem `queued` e só avançam na cadeia
  Architect → Inspector RED → Engineer GREEN.

Checkpoint 6 (janela 3, barreira Architect de CTG-0003):

- TASK-0007 materializou ADR-0028, BP-OPS-PROVISIONING-001, DDL 21, pacote gerado, contrato de oito
  comandos e clientes; nenhuma produção handwritten ou teste foi escrita;
- a contradição de gate foi registrada como `policy-issue` e corrigida pela Adenda A4. O primeiro
  review extraordinário encontrou A4-F001 na raiz estática do checker; a correção focal recebeu
  `prompt-review-6-a4=PASS`, sem achados;
- `blueprints:check` reproduzido pelo maestro terminou com exit 0; RLS e api-clients typecheck
  passaram; `contracts:check` contém somente os oito `missing-route` autorizados e nenhum outro
  achado;
- o novo workspace foi serializado pelo maestro no lockfile; nova execução
  `pnpm install --frozen-lockfile` passou com 58 projetos;
- TASK-0007 concluída; seus incidentes processuais sem mutação ficaram registrados. TASK-0008 foi
  liberada em `in_progress`; TASK-0009 permanece `queued`.

Checkpoint 7 (janela 3, bloqueio fail-closed de TASK-0008):

- Inspector iniciou sem escrever artefatos de teste e foi interrompido ao encontrar cinco lacunas
  estruturais; uma consulta Git somente leitura indevida foi registrada, sem mutação;
- auditoria Architect independente confirmou: seed 29 fora da lista fechada; reset R13 e DDL 21
  ausentes da autorização/inventário de `apply.sh`; typecheck verde inexequível antes dos 11 módulos
  handwritten; headers concorrentes ausentes do contrato; matriz completa de atores inexistente;
- os quatro primeiros pontos têm correção estrutural/técnica delimitável por A5. A matriz de atores
  é autoridade de produto e não pode ser inferida de rótulos conceituais, de beneficiários do grant
  nem dos bypasses globais atuais;
- TASK-0008 está `blocked`, TASK-0009 continua `queued`, nenhum teste/fixture/policy/handwritten foi
  escrito e nenhum banco foi resetado. A execução retoma após decisão mínima do Owner e novo review.

Checkpoint 8 (janela 3, autorização da A5):

- Owner aprovou a matriz conservadora completa e o subpasso de scaffolding técnico; decisão
  registrada em `AUTHORIZATION.md` Amendment 1 e Adenda A5;
- TASK-0008 permanece `blocked` até o review A5 e os checkpoints Architect/scaffold passarem;
- correções ainda não executadas neste checkpoint; nenhuma alegação de aceite antecipado.

Checkpoint 9 (janela 3, correção Architect A5):

- seis POST agora exigem `If-Match`/`Idempotency-Key`, expõem ETag e declaram 428/412/409
  canônicos; GETs permanecem sem command headers; ADR documenta o token real comparado;
- DDL 21 integra o inventário fechado; R7 foi preservado e R13 exige sua flag exclusiva. Banco
  arbitrário, R13 sem flag e R7 sem flag falharam fechados com exit 2;
- generators e api-clients typecheck passaram; `contracts:check` permanece RED somente pelos oito
  `missing-route`, sem achado adicional;
- checkpoint Architect aceito. Scaffold Engineer iniciado; TASK-0008 continua bloqueada.

Checkpoint 10 (janela 3, scaffold A5 aceito):

- exatamente os onze módulos handwritten fixados pelo blueprint foram criados; nenhum decorator,
  rota, DB, policy, teste ou comportamento real foi introduzido;
- typecheck do pacote passou; `contracts:check` permaneceu RED somente pelos oito `missing-route`,
  verificado pelo maestro por contagem e ausência de qualquer categoria adicional;
- consulta Git somente leitura indevida do worker foi registrada, sem mutação;
- TASK-0008 reaberta em attempt 2 sob A5; TASK-0009 permanece `queued`.

Checkpoint 11 (janela 3, Inspector RED aceito):

- reset R13 e dois seeds fresh passaram com fixture 29; segunda aplicação foi idempotente;
- provisioning typecheck e integração 2/2 passaram; unit 8/8 e package e2e 1/1 falham somente pelo
  sentinel; shared policy falha somente pelas duas provas A5; app e2e 6/6 falha somente por 404 das
  rotas não montadas;
- `contracts:test` tem 42/43 verdes: único RED C-5-16, contendo exatamente os oito
  `missing-route`; novas provas de headers/ETag/INV-OFFLINE-001 passam;
- hashes dos dez arquivos congelados foram capturados no relatório TASK-0008. TASK-0008 concluída;
  TASK-0009 iniciada e não pode alterar teste, fixture, seed, blueprint, DDL, contrato ou gerado.

Checkpoint 12 (janela 3, Engineer GREEN e gates integrais):

- TASK-0009 materializou as oito rotas, precondições HTTP, ETag, matriz A5 estrita, wiring do app
  e raiz estática do checker; todos os sentinelas RED foram removidos e os gates dirigidos ficaram
  verdes;
- `backend:test:ci` revelou cinco chaves GET ausentes na matriz. A correção Engineer ficou restrita
  a `policy.ts`, adicionando as cinco leituras à ilha estrita com lista estática vazia e sem bypass;
  o sensor bidirecional passou 5/5;
- o gate de upgrade revelou a cardinalidade histórica de 60/63 DDLs. O Inspector atualizou somente
  o sensor para 61 ordinários/64 totais e fixou `21-ops-provisioning.sql` exatamente uma vez;
  a prova dirigida passou 18/18;
- `pnpm check` revelou duas indexações template não estreitadas em `policy.spec.ts`; o Inspector
  aplicou somente `DetranPolicyKey`, sem alterar casos/expectativas; shared typecheck e 407 testes
  passaram;
- gates finais do mesmo candidato: `pnpm backend:test:ci` exit 0; `pnpm check` exit 0;
  `pnpm devai:doctor`, evidence verify, `git diff --check` e 18/18 composições PASS;
- TASK-0009 concluída na iteração 2/2. O candidato segue sem commit e aguarda delivery-review
  independente; nenhuma publicação, PR ou merge é inferida antes do PASS.

Checkpoint 13 (janela 3, delivery-review CTG-0003):

- Reviewer Codex/Astra high, sob exceção Owner vigente, revisou o candidato integral somente
  leitura e devolveu `FAIL`: nove achados high e dois medium;
- bloqueadores: sete comandos stub sem persistência/ports; positivos dinâmicos A5 inexistentes;
  vínculos de agência/dispositivo/recurso ausentes; If-Match/ETag e idempotência decorativos;
  readiness sempre false; DDL20 reabre UPDATE/DELETE nas tabelas append-only; respostas sem schema;
  status de revogação divergente; matriz P0-P6 não materializada; dois JSON arrays tipados como
  object;
- o Reviewer confirmou em consulta read-only que `role_app_backend` possui UPDATE e DELETE finais
  em `ops.provisioning_receipt` e `ops.device_revocation`; RLS/FORCE permanece ativo, mas não fecha
  a violação append-only;
- TASK-0009 atingiu 2/2 e foi marcada `escalated`; nenhum commit, evidência, push, PR ou merge foi
  executado. Pela regra do maestro, nova decomposição/ciclo requer autorização Owner explícita.

Checkpoint 14 (janela 3, autorização corretiva CTG-0003):

- Owner autorizou explicitamente reabrir o CTG-0003, ampliar em uma iteração os limites de
  TASK-0008/TASK-0009 e executar novo ciclo Architect → Inspector → Engineer para F-001…F-011;
- Amendment 2 fixa o escopo: contratos/respostas, arrays JSON, append-only final, autorização
  dinâmica, persistência/transação/outbox, ETag/idempotência/readiness, status HTTP e provas P0–P6;
- TASK-0007 está `in_progress` na iteração 2; TASK-0008/TASK-0009 estão `queued` até suas barreiras.

Checkpoint 15 (janela 3, Architect corretivo aceito):

- ADR-0028 e BP v1.0.1 agora especificam bindings dinâmicos, versão/ETag persistidos, idempotência
  tenant-scoped por hash canônico, transação/outbox e readiness determinístico;
- os oito sucessos do command contract têm schemas tipados; JSON arrays permanecem SQL `jsonb`,
  com `jsonSchema` validado e propagado por geradores para OpenAPI/TypeScript;
- `apply.sh` reaplica DDL 21 após DDL 20, preservando os REVOKEs append-only no estado final;
- o maestro concluiu `blueprints:generate` e `blueprints:check`; contratos/clients sync,
  `contracts:check` 160 operações, RLS 243/2 e api-clients typecheck passaram;
- TASK-0007 foi concluída na iteração 2; TASK-0008 abriu a iteração 3 para congelar provas P0–P6.

Checkpoint 16 (janela 3, Inspector corretivo aceito):

- a primeira entrega da iteração 3 foi devolvida duas vezes por manter lacunas conhecidas; uma
  escalada Inspector/Astra concluiu a mesma iteração sem ampliar escopo;
- 602 casos de integração exercitam A5 exaustiva, persistência P0–P6, INV-OFFLINE-001, transação
  domínio/numeração/outbox, quatro crash points, conexões PostgreSQL distintas, replay em novo
  processo Node, conflito 409 e readiness ready/expired/revoked/incomplete/not-found;
- contratos 46/46 e shared 407/407 passam; 596 integrações, 10 e2e de domínio, 7 unitários e cinco
  HTTP permanecem RED exclusivamente pelos stubs/semântica de produção ausente;
- reset fechado final e seed dupla deixaram `detran_r13` limpa; privilégios finais append-only são
  SELECT/INSERT true e UPDATE/DELETE false; onze hashes de sensores foram congelados;
- TASK-0008 concluída na iteração 3; TASK-0009 abriu a iteração 3 e não pode alterar nenhum sensor.

Checkpoint 17 (janela 3, Engineer corretivo e gates integrais):

- sete comandos reais substituíram os stubs com SQL tenant-scoped, bindings A5 sob lock,
  transação domínio/numeração/outbox, idempotência persistida e readiness por estado real;
- outbox usa `${commandName}:${rawKey}` enquanto o registro de idempotência preserva chave bruta
  scoped por comando; replay em novo processo, conflito e mesma chave entre comandos passam;
- challenge aceita exclusivamente ETag recuperável de readiness, persiste versão monotônica e
  rejeita literal `1`, token stale e corrida concorrente; revogação responde 200;
- package.json raiz inclui provisioning uma vez em cada tier backend; 7 unit, 611 integration,
  10 e2e de domínio e 14 HTTP passam, com hashes Inspector preservados;
- `pnpm backend:test:ci` final exit 0 e `pnpm check` final exit 0; upgrade 18/18; DEVAI doctor,
  evidence head `eae4e44d…`, composições, `git diff --check` e RLS 243/2 passam;
- privilégios finais em receipt/revocation são SELECT/INSERT true e UPDATE/DELETE false;
  TASK-0009 concluída na iteração 3. Review extraordinário independente iniciado sem commit.

Checkpoint 18 (janela 3, review extraordinário ciclo 2):

- Reviewer Codex/Astra high, somente leitura, confirmou as correções de autorização, ETag,
  idempotência, append-only, contratos, arrays, CI wiring e a melhora substancial dos sensores;
- verdict `FAIL` com cinco findings high: download sem 410/usabilidade; readiness sem saldo de
  numeração/`maximum_acts`; dependência normativa sem órgão/catálogo; enrollment inicial dependente
  de reserva anterior; renovação sem reconciliação prévia;
- TASK-0009 voltou a `escalated` no limite 3/3. Nenhum commit, evidência, push, PR ou merge foi
  executado; novo ciclo requer autorização Owner explícita e nova decomposição.

Checkpoint 19 (janela 3, autorização corretiva residual CTG-0003):

- Owner autorizou explicitamente o Amendment 3, reabrindo um ciclo extraordinário bounded para
  F-012…F-016 e resetando o limite esgotado 3/3;
- TASK-0007 abriu a iteração 3/3; TASK-0008 e TASK-0009 permanecem queued para suas iterações 4/4;
- escopo fechado: download 410/usabilidade, saldo de numeração e `maximum_acts`, vínculo normativo
  agência/catálogo, enrollment inicial sem reserva prévia e renovação após reconciliação;
- novo delivery-review independente está autorizado somente após Architect → Inspector → Engineer
  e gates integrais verdes; nenhuma autoridade adicional de publicação ou release foi concedida.

Checkpoint 20 (janela 3, Architect residual aceito):

- BP-OPS-PROVISIONING-001 v1.0.2 e ADR-0028 fecharam F-012…F-016 em regras implementáveis;
- novo `ops.provisioning_reconciliation` é append-only, RLS e obrigatório para renovar grant após
  fronteira terminal, inclusive com zero atos; pendências bloqueiam renovação;
- readiness/ETag agora incluem saldos de atos e numeração; dependência normativa inclui tenant,
  órgão e catálogo; enrollment inicial deriva RequestContext sem depender de reserva;
- geração canônica produziu DDL/contratos/clientes; `blueprints:check`, `contracts:check`, typecheck
  do cliente e `git diff --check` passaram;
- TASK-0007 concluiu 3/3 e TASK-0008 abriu 4/4 para congelar os sensores residuais.

Checkpoint 21 (janela 3, Inspector residual aceito):

- 50 novas provas cobrem F-012…F-016 com provider real, persistência, RLS e append-only;
- reset isolado e dois seeds passaram; unit 7/7, contracts 46/46 e shared 407/407 permanecem verdes;
- estado RED esperado: integration 531 PASS/130 RED, e2e domínio 2 PASS/8 RED e HTTP 13 PASS/1 RED;
  46/50 novos sensores estão RED exclusivamente por comportamento de produção ausente;
- cinco hashes SHA-256 finais foram verificados pelo maestro; nenhuma prova foi removida ou
  afrouxada e as expectativas antigas receberam apenas os campos novos obrigatórios;
- TASK-0008 concluiu 4/4 e TASK-0009 abriu 4/4, proibido de alterar os sensores congelados.

Checkpoint 22 (janela 3, Engineer residual e gates integrais):

- F-012…F-016 foram implementados em três arquivos handwritten; download/usabilidade, saldos e
  ETag, normativa completa, enrollment sem reserva e reconciliação terminal estão verdes;
- testes finais: unit 7/7, integration 661/661, e2e domínio 10/10 e HTTP 14/14; os 12 hashes
  protegidos permanecem íntegros após um refreeze mecânico aditivo do expected antigo;
- o gate integral revelou quatro chaves CRUD do novo agregado gerado; `policy.ts` as adicionou à
  ilha estrita com listas vazias, preservando o comando autenticado como única escrita; shared
  407/407 e policy-routes 5/5 passaram;
- `backend:test:ci` completo passou até upgrade 18/18 com o env exato do workflow e mock :3001;
  `pnpm check` terminou exit 0;
- TASK-0009 concluiu 4/4. O candidato permanece sem commit e abre review extraordinário
  independente; nenhuma publicação, PR ou merge é inferida antes do veredito.

Checkpoint 23 (janela 3, review extraordinário ciclo 3):

- Reviewer Codex/Astra high, somente leitura, confirmou as correções centrais de F-012…F-016,
  RLS/append-only, deny-all CRUD, idempotência, transação, ETag e contratos;
- verdict `FAIL` com três findings high: enrollment confunde responsável/emissor com agentes
  destinatários e não confronta titularidade da reserva; download não compara digest do pacote com
  o grant; renovação verifica apenas o grant mais recente e pode ocultar obrigações terminais
  anteriores sem reconciliação;
- TASK-0009 voltou a `escalated` no limite resetado 4/4. Nenhum commit, evidence record, push, PR ou
  merge foi executado; outra decomposição exige autorização Owner explícita.

Checkpoint 24 (janela 3, autorização final CTG-0003):

- Owner autorizou explicitamente o Amendment 4 e exigiu efetividade para fechamento completo do
  CTG-0003 nesta iteração final;
- TASK-0007 abriu 4/4; TASK-0008 e TASK-0009 ficam queued para 5/5;
- escopo fechado: separar emissor/responsável de destinatários e titularidade de reservas; validar
  digest pacote↔grant no download; e impedir que grant novo oculte qualquer obrigação terminal
  histórica não reconciliada;
- o ciclo mantém Architect → Inspector → Engineer, gates integrais e review independente; nenhuma
  autoridade de commit/publicação é inferida antes do `PASS`.

Checkpoint 25 (janela 3, Architect final aceito):

- BP-OPS-PROVISIONING-001 v1.0.3 e ADR-0028 separam o emissor/responsável dos agentes
  destinatários; agency-admin pode emitir sem `agent_id`, enquanto cada reserva deve coincidir em
  tenant, agência, dispositivo e agente destinatário autorizado;
- `ops.provisioning_grant_reservation_binding` persiste a prova exata grant↔reserva↔destinatário,
  com RLS e privilégios append-only (SELECT/INSERT, sem UPDATE/DELETE);
- download exige igualdade exata entre `package.manifest_digest` e `grant.manifest_digest`, com
  divergência terminal 410; renovação examina todos os grants terminais do dispositivo, cada qual
  reconciliado depois de sua própria fronteira terminal e sem pendências;
- geração canônica, `blueprints:check`, `contracts:check`, typecheck do cliente, RLS DDL e
  `git diff --check` passaram; TASK-0007 concluiu 4/4 e TASK-0008 abriu 5/5 para sensores finais.

Checkpoint 26 (janela 3, barreira Inspector e devolução ao Architect):

- antes de qualquer escrita, o Inspector detectou que a redação v1.0.3 conflitava com sensores
  vinculantes do Amendment 3 ao aceitar reconciliação exatamente na fronteira e usar o menor
  limite entre expiração e revogação posteriormente conhecida;
- nenhum sensor foi refrozen: permanece vinculante exigir reconciliação estritamente posterior à
  fronteira terminal e, quando `revoked_at` for posterior a `valid_until`, negar prova intermediária;
- TASK-0007 voltou a `in_progress` na mesma iteração 4/4 para corrigir ADR/BP e regenerar;
  TASK-0008 voltou a `queued` 4/5, sem consumir sua tentativa final.

Checkpoint 27 (janela 3, semântica terminal restaurada):

- ADR-0028 agora fixa `terminal_at = valid_until` sem revogação e, quando revogado,
  `greatest(valid_until, revoked_at)`; `reconciled_at` deve ser estritamente maior;
- os sensores anteriores permanecem intactos: prova no instante terminal e prova entre expiração
  e revogação posteriormente conhecida continuam insuficientes;
- formatação, JSON e `git diff --check` passaram; BP/contratos/generated não mudaram desde os
  gates canônicos verdes do checkpoint 25;
- TASK-0007 concluiu 4/4 e TASK-0008 retomou 5/5, agora sem contradição normativa.

Checkpoint 28 (janela 3, Inspector final aceito):

- 33 provas Amendment 4 com provider real e PostgreSQL cobrem emissor sem `agent_id`, destinatários
  distintos, quatro dimensões da reserva, binding persistido, digest pacote↔grant e todo o histórico
  terminal; oito provas de política congelam deny-all para binding e reconciliation;
- nenhum expected anterior mudou; 661 integrações anteriores, 7 unit, 10 e2e de domínio, 14 HTTP,
  46 contratos e typecheck passaram;
- estado RED limpo: integração 668 PASS/26 RED e shared 411 PASS/4 RED, exclusivamente por
  comportamento de produção ausente; nenhum ruído de fixture/import/DDL/config;
- os 14 hashes protegidos foram verificados pelo maestro; TASK-0008 concluiu 5/5 e TASK-0009 abriu
  5/5, proibido de modificar qualquer sensor congelado.

Checkpoint 29 (janela 3, Engineer final e gates integrais):

- produção separa emissor dos destinatários, persiste bindings atômicos, usa-os em
  readiness/receipt/reconcile, confronta digest package↔grant em todas as decisões de usabilidade e
  percorre todos os grants terminais sob lock determinístico;
- quatro chaves CRUD do binding estão na ilha estrita deny-all; oito tombstones sem endpoint entram
  somente na allowlist exata do sentido regra→rota, preservando integralmente rota→regra;
- gates focais: unit 7/7, integration 694/694, e2e domínio 10/10, HTTP+policy 19/19, shared
  415/415, contratos 46/46, 160 operações/63 clientes e 966 decorators;
- `pnpm check` do snapshot estável e `pnpm backend:test:ci` com env exato passaram, inclusive
  upgrade 18/18; DEVAI doctor, evidence chain, composições e `git diff --check` passaram;
- privilégios de revocation, receipt, reconciliation e grant-reservation-binding são SELECT/INSERT
  true e UPDATE/DELETE false; TASK-0009 concluiu 5/5 e abre review extraordinário independente.

Checkpoint 30 (janela 3, review extraordinário final CTG-0003):

- Reviewer CODEX independente, no papel Auditor e somente leitura, emitiu `PASS` sem findings
  `high` ou `medium` para o candidato integral de CTG-0003;
- reprodução independente passou 20/20 cenários funcionais dos três bloqueios do ciclo 3, incluindo
  emissor sem `agent_id`, múltiplos recipients, quatro dimensões de ownership, binding downstream,
  divergência de digest nos três caminhos e todo o histórico terminal com fronteira estrita;
- 65 negativas de policy confirmaram deny-all sem bypass; contratos 6/6, 160 operações, 42
  cabeçalhos gerados e consulta PostgreSQL read-only de RLS/FORCE RLS/append-only passaram;
- F-001…F-016 foram reavaliados sem regressão bloqueante. CTG-0003 está tecnicamente liberado para
  commit e evidence record pela sequência vinculante do Maestro; os limites `source_pending` e a
  autoridade de publicação permanecem inalterados.

Checkpoint 31 (janela 3, integração de `origin/main` e recertificação):

- os commits funcional `b8aa4ddc…` e de evidência inicial `793487ef…` foram criados; antes do PR,
  `origin/main` havia avançado até `08fb84e8…` e foi integrado por merge normal `dcc35cb1…`, sem
  rebase nem force-push;
- o único conflito foi `record/proofs/chain.json`; a versão de `main` foi aceita integralmente e a
  evidência de CTG-0003 será regravada sobre a cadeia corrente, sem merge manual de hashes;
- `pnpm install --frozen-lockfile` adotou DEVAI 1.5.3 da base integrada sem alterar o lockfile;
  `pnpm check` passou com 738 artefatos KB, 160 operações/63 clientes, 57 projetos typechecked,
  966 handlers, RLS 245/2, PEC 611 specs e portal 1314 testes;
- `pnpm backend:test:ci` passou no ambiente exato do workflow: provisioning integration 694/694,
  provisioning e2e 10/10 e upgrade 18/18, além de todos os demais tiers do backend;
- o merge de upstream não alterou os arquivos centrais revisados de CTG-0003; o `PASS` final segue
  aplicável e o candidato está pronto para regravação de evidência, push e PR.

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
