# R-0013 — frente `teat-frontends` (WP-T4, WP-T5, WP-T6 do TEAT: fichas, formulários, i18n, provisionamento offline e apps mobile/web)

**Estado atual (2026-09-22; substitui o planejamento histórico abaixo):** CTG-0001, CTG-0002 e
CTG-0003 foram mesclados e observados; CTG-0004a e CTG-0004b passaram review independente no
candidato `408ab438fdd940eed6bd46296daad0a141d5a222`; CTG-0005 está em revisão documental. Há
uma única PR/push final da rodada, depois do PASS de CTG-0005 e dos gates de integração do candidato
completo. Nesta sessão, por exceção explícita do Owner, reviewer Codex/Sol/high.
**Concorrência histórica (supersedida pelo estado atual acima):** abre já e **nenhum grupo está preso**: CTG-0001 (corpus), CTG-0002
(matrizes, 126 fichas e i18n canônico), CTG-0003 (provisionamento), CTG-0004a (mobile),
CTG-0004b (web) e CTG-0005 (fechamento). O grafo foi serializado para codificar todos os joins no
`upstream_task_id` singular. R-0012 não abriu; não há lock concorrente em `packages/ui`.
**Janelas previstas (histórico, supersedido):** 5 (o maior da carteira; um PR por grupo).

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
   `build|test|lint|typecheck` criados nesta rodada. O `pnpm check` raiz inclui o typecheck de
   workspaces; lint/test/build dos apps rodam pelos gates específicos de cada pacote. O módulo `sinistros`
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
| TASK-0018 | Architect (transcr.) | transcriber-docs    | Luna/baixo     | CTG-0005  | 0017       | transcrever estado entregue/revisto e a integração final pendente                            |

As seis CTGs abaixo são fronteiras históricas de entrega/review, não seis PRs correntes. A
integração atual usa uma única PR final após CTG-0005. O
scaffold de CTG-0004a/b é substrato não comportamental autorizado pelo Architect do mesmo CTG;
depois do scaffold, o Inspector escreve RED e os testes ficam congelados antes do Engineer de
feature. O maestro roda `pnpm install`, guarda `pnpm-lock.yaml` e estende `pnpm check`
imediatamente após TASK-0007, TASK-0011 e TASK-0015. TASK-0008 não pode iniciar antes do
checkpoint de instalação/lockfile posterior a TASK-0007. Banco da rodada:
`work/rounds/R-0013/env-detran-r13.sh`.

## Critérios de aceitação (comandos → resultado)

Os comandos abaixo preservam os critérios históricos e os gates da integração final; não afirmam
que TASK-0018 executou `pnpm check` ou gates dos apps durante esta transcrição.

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

Checkpoint 32 (janela 3, correção de isolamento em checkout limpo):

- PR #82 abriu no SHA `a0e3897f…`; `evidence-gate`, `boat-documents-real`, `senatran-mock` e
  `senatran-mock-tests` passaram, mas o fallback remoto de `backend-kernel` expôs um erro de
  resolução antes dos testes de provisioning;
- causa raiz: o novo `vitest.config.ts` tinha `alias` vazio e o checkout local possuía `dist` de
  shared, mascarando a ausência de build desse pacote no runner limpo; a lógica de produto não
  chegou a executar e nenhum sensor falhou;
- correção mínima: alias canônico `@detran/shared` → `../../shared/src/index.ts`, igual aos demais
  domínios; nenhum teste, expectativa, comando ou código de produção foi alterado;
- reprodução sem `backend/domains/shared/dist` passou o unitário de provisioning 7/7, provando que
  a correção remove a dependência ambiental. O candidato exige novo `pnpm check`, evidence record
  no SHA corrigido e CI integral antes do merge.

Checkpoint 33 (janela 3, blocker de CI eliminado e recertificado):

- `testAliases` foi incorporado ao blueprint canônico e 47 outputs foram regenerados; o único
  delta semântico gerado é o alias `@detran/shared` → `../../shared/src/index.ts`, enquanto os
  demais arquivos mudam somente o header do hash do blueprint;
- sem `backend/domains/shared/dist`, provisioning unit passou 7/7; `blueprints:check`, contratos
  160/63, tipos focais e `pnpm check` integral passaram, inclusive 57 projetos, RLS 245/2,
  966 handlers, PEC 611 e portal 1314;
- `pnpm ci:backend-full` no ambiente do workflow passou integralmente: provisioning 7/7 unit,
  694/694 integration, 10/10 e2e, upgrade 18/18 e adapter SENATRAN 33/4/10;
- Reviewer CODEX independente em papel Auditor reproduziu os 47 outputs em memória e emitiu PASS
  focal sem achados bloqueantes ou não bloqueantes; o PASS integral do ciclo 4 permanece válido;
- o candidato está liberado para commit corretivo, regravação DEVAI, atualização do PR #82 e nova
  execução integral dos required checks antes do merge.

Checkpoint 34 (janela 3, fronteira de subprocesso fechada):

- o CI do SHA `e3446678…` passou cinco jobs, mas o fallback remoto revelou que o teste de runtime
  novo executava `tsx` fora do alias do Vitest e ainda resolvia `@detran/shared` para `dist` ausente;
  a falha real era mascarada pelo parser de sourcemap do Vitest;
- a reprodução local removeu fisicamente `backend/domains/shared/dist` e obteve o mesmo erro; um
  `tsconfig.fresh-process.json` exclusivo passou a resolver shared para fonte, mantendo processo,
  conexão PostgreSQL, resposta/ETag, snapshot e sentinelas de efeitos independentes;
- sem `shared/dist`, o teste focal passou 1/1 e a integração completa passou 694/694;
  `blueprints:check` também passou, provando ausência de divergência no gerado canônico;
- Reviewer CODEX independente em papel Auditor reproduziu resolução somente por fonte, confirmou
  PIDs distintos e fail-closed real e emitiu `PASS` sem findings. O candidato requer recertificação
  integral, novo evidence record e CI verde antes do merge do PR #82.

Checkpoint 35 (janela 3, integração final de upstream e recertificação):

- `origin/main` avançou até `e0763c6c…` com o backend de dashboard e foi integrado por merge normal
  `b09f37b9…`; a composição preservou provisioning e dashboard no DDL, scripts de teste e filtros
  do workspace, sem rebase ou force-push;
- o contrato fechado de upgrade foi atualizado para os 63 DDLs ordinários e 66 arquivos físicos
  reais; com a reaplicação deliberada de DDL21 após RLS, a sequência possui exatamente 67
  argumentos SQL e o rehearsal passou 18/18;
- um timeout de setup BOAT sob carga foi eliminado com limite local finito de 30 segundos, igual ao
  orçamento já vigente da integração; a suíte focal passou 6/6 duas vezes e o app integral 19/19,
  sem retry, skip, captura de falha ou mudança de assertions/cleanup;
- Reviewer CODEX independente em papel Auditor emitiu novo `PASS` sem findings para ambos os
  deltas, confirmando inventário/ordem/reaplicação fail-closed e ausência de enfraquecimento;
- uma passagem foi descartada quando outro worktree recriou o mesmo banco durante o E2E; após a
  liberação e confirmação de ausência de processos concorrentes, `pnpm ci:backend-full` passou
  integralmente: provisioning 7/7, 694/694 e 10/10, app E2E 396 com 2 todo, upgrade 18/18 e
  SENATRAN 33/4/10;
- `pnpm check` do candidato final passou: 756 artefatos KB, 160 operações/64 clientes, 59 projetos
  typechecked, 966 handlers, RLS 265/2, portal 1314 testes, RAIT 1807 testes e ambos os builds.
  O candidato está liberado para evidence record, push e CI remoto do PR #82.

Checkpoint 36 (janela 3, adoção DEVAI 1.5.4 antes da publicação):

- antes do push, `origin/main` avançou até `b527d9ef…` exclusivamente com a adoção governada do
  DEVAI 1.5.4 e foi integrado por merge normal `088a0c23…`; nenhum arquivo de produto, backend,
  DDL, teste ou blueprint foi alterado por esse upstream;
- `pnpm install --frozen-lockfile` substituiu somente DEVAI 1.5.3 por 1.5.4; doctor confirmou
  versões pinned/running 1.5.4, policy materialization atual e cadeia válida;
- `pnpm check` foi repetido no candidato exato 1.5.4 e passou integralmente com 756 artefatos KB,
  160 operações/64 clientes, 59 projetos typechecked, 966 handlers, RLS 265/2, portal 1314,
  RAIT 1807 e ambos os builds;
- como o upstream não tocou qualquer superfície do kernel backend já certificado em isolamento,
  o `pnpm ci:backend-full` verde do checkpoint 35 permanece aplicável; a evidência será regravada
  pelo DEVAI 1.5.4 antes do push.

Checkpoint 37 (janela 3, exaustão de locks eliminada na raiz):

- o fallback remoto do SHA `b0234b70…` passou cinco jobs, mas o PostgreSQL 16 falhou na primeira
  reaplicação idempotente com `out of shared memory` e recomendação de elevar
  `max_locks_per_transaction`; a mesma falha foi reproduzida no digest PostGIS fixado pelo CI;
- causa raiz: cada um dos DDLs de tenant chamava `auth.install_tenant_triggers()`, que removia e
  recriava todos os gatilhos já existentes dentro da mesma transação atômica, acumulando locks;
- a correção cria somente gatilhos ausentes e valida fail-closed os existentes por função,
  eventos/momento/nível, habilitação, argumentos, coluna `tenant_id` e ausência de `WHEN`, sem
  elevar limites do runner, dividir a transação ou enfraquecer RLS;
- o review extraordinário ciclo 8 encontrou que `tgqual` ainda não era verificado; após a prova
  comportamental de `WHEN (false)`, criação ausente e preservação de OID, o ciclo 9 emitiu `PASS`
  sem findings;
- o ensaio focal final passou 20/20 em PostgreSQL 18 e no digest PostgreSQL 16 do CI; neste último,
  caiu de aproximadamente 500 segundos com falha para 320 segundos com sucesso;
- `pnpm check` do diff final passou integralmente: 756 artefatos KB, 160 operações/64 clientes,
  59 projetos, 966 handlers, RLS 265/2, portal 1314, RAIT 1807 e ambos os builds. O candidato está
  liberado para commit, novo evidence record e nova execução remota integral antes do merge.

Checkpoint 38 (janela 3, integração RAIT web e recertificação combinada):

- antes da regravação de evidência, `origin/main` avançou até `72c15ae9…` com a entrega RAIT web
  da PR #85 e foi integrado por merge normal `b9466b0a…`, sem tocar backend, DDL ou o rehearsal de
  upgrade; o único conflito foi a cadeia DEVAI, aceita integralmente a partir de `main`;
- a prova focal PostgreSQL 16 de 20/20 permanece content-addressed e aplicável ao candidato
  combinado, pois suas entradas de backend, DDL, teste, imagem e configuração não mudaram;
- `pnpm check` foi repetido no candidato combinado exato e passou: 756 artefatos KB, 160
  operações/64 clientes, 59 projetos, 966 handlers, RLS 265/2, fronteira SENATRAN sobre 2902
  arquivos, portal 1314 testes, RAIT 2263 testes com 134 todo e ambos os builds;
- o worktree permaneceu limpo após o merge e os gates. O candidato está liberado para regravar a
  evidência CTG-0003 sobre a cadeia atual, publicar a branch e exigir nova CI integral verde.

Checkpoint 39 (janela 3, merge e observação governada de CTG-0003):

- a PR #82 foi mesclada em `b8920457…` após os sete jobs obrigatórios passarem, incluindo
  `backend-kernel` e `verified-local-rc`; a branch de continuidade foi sincronizada por
  fast-forward com esse merge exato;
- o Auditor observou o merge exato em `EV-1925d89b5640ab91`, sequência 68, e materializou os cinco
  artefatos em `.devai/state/audit-observations/b8920457…`; a cadeia permaneceu válida no head
  `893bbe9e…` antes do registro de integração;
- a avaliação conservadora YELLOW, com 43 células UNKNOWN por lacunas de sensores e
  `readiness_promoting=false`, descreve somente a introspecção pós-merge e não reabre o delivery
  review ciclo 9 PASS nem os gates verdes do candidato;
- a observação e seu evidence record foram publicados na branch preservada para continuidade de
  CTG-0004a/CTG-0004b/CTG-0005; a cadeia final permaneceu válida em `109bca0c…` e a identidade
  local/remota da branch foi confirmada em `0be1fee9…`. CTG-0003 está completamente encerrada.

Checkpoint 40 (janela 4, preflight CTG-0004a):

- o Owner autorizou CTG-0004a e os grupos subsequentes; a janela 4 foi aberta com orçamento novo
  de 800.000 tokens de entrada e a exceção vigente de Reviewer da família CODEX;
- `origin/main` avançou até `7cce33a7…` com o fechamento R-0011/dashboard e DEVAI 1.5.5; o upstream
  foi integrado por merge normal `2a21087e…`, com conflito somente em `record/proofs/chain.json`,
  resolvido pela versão canônica de `main` conforme a regra da orquestra;
- `pnpm install --frozen-lockfile`, DEVAI doctor tier 3 e o baseline `pnpm check` passaram; o gate
  confirmou 756 artefatos KB, 203 operações/65 clientes, 59 projetos, 1009 handlers, RLS 267/2,
  portal 1314 testes, RAIT 2263 testes e ambos os builds;
- o primeiro `pnpm check` foi descartado antes dos gates por formatação pendente nos dois JSONs
  pós-merge de CTG-0003; Prettier foi aplicado somente nesses arquivos e a repetição integral passou;
- TASK-0009 permanece `completed`; composição TASK-0010 confere no hash
  `4cec35ce8ad3aa18efa16c067d87cee040244c2c601c61dad523fae32ba026b8`; TASK-0010 abriu a
  tentativa 1/2 em papel Architect, enquanto TASK-0011…TASK-0018 permanecem `queued`.

Checkpoint 41 (janela 4, contrato mobile congelado):

- TASK-0010 criou `ARCH-TEAT-MOBILE-CONTRACT` com 70 rotas/fontes/componentes, oráculo cartesiano
  sobre os nove papéis TEAT, oito módulos, 14 schemas e importação content-addressed das 576
  transições no hash `a3175e63…`;
- o maestro rejeitou ownership divergente do prompt e a ampliação de `sync-conflict` para agente;
  o contrato final enumera a allowlist exata, registra o handoff sequencial de `app.routes.ts` e
  mantém `sync-conflict` exclusivamente para `field-supervisor`;
- a divergência residual da folha IU foi registrada como proposta
  `OD-TEAT-MOBILE-SYNC-CONFLICT-ROLE`, sem mudar a autoridade vigente de `teat-frontends` §3/§8;
- `pnpm format:check`, `pnpm docs:kb:check`, o oráculo focal 70/70/576 e `git diff --check`
  passaram. TASK-0010 está `completed`; TASK-0011 abriu a tentativa 1/2 e TASK-0012…0018 ficam
  `queued`.

Checkpoint 42 (janela 4, scaffold mobile e lockfile):

- TASK-0011 criou somente o scaffold Angular 22 standalone/OnPush/zoneless; `app.routes.ts`
  permanece array vazio e nenhum teste ou comportamento de produto foi criado;
- o maestro rejeitou antes do install a ausência de `angularJitApplicationTransform` e das
  dependências cuja declaração pertence exclusivamente ao scaffold; o worker corrigiu o Vitest e
  declarou forms, API clients, UI, STYNX 1.3.1, mobile-runtime, Zod e axe sem implementar feature;
- `pnpm install` reconheceu 61 projetos e atualizou `pnpm-lock.yaml`; lint, typecheck e build do
  pacote passaram, e o oráculo focal confirmou array de rotas vazio e zero specs de produto;
- TASK-0011 está `completed` e seu scaffold/lockfile foi congelado antes do RED. TASK-0012 abriu a
  tentativa 1/2 em papel Inspector; TASK-0013…0018 permanecem `queued`.

Checkpoint 43 (janela 4, reference-gap antes do RED):

- o Inspector detectou antes de qualquer escrita que o contrato §3 enumerava 14 schemas, mas
  remetia seus campos/gates a `teat-frontends` §8, fonte deliberadamente ausente da lista fechada
  de TASK-0012; criar sensores assim exigiria inventar ou ler fora da autoridade;
- triagem: `reference-gap`. TASK-0012 retornou a `queued` sem consumir tentativa e sem alterar
  arquivo; TASK-0010 reabriu a tentativa final 2/2 somente para tornar os 14 contratos de
  formulário autocontidos;
- a correção Architect não pode mudar as 70 rotas, RBAC, D-05/BOAT, hash/matriz 576, ownership nem
  qualquer decisão de produto. TASK-0013…0018 permanecem `queued`.

Checkpoint 44 (janela 4, contrato de forms autocontido):

- TASK-0010 tentativa 2/2 transcreveu no contrato os campos obrigatórios/opcionais, validações de
  forma e gates/comandos dos 14 schemas; lacunas reais ficaram `source_pending` literais;
- o maestro corrigiu uma interpretação permissiva: justificativa de `ait-frame` é obrigatória
  somente em `caso_3` e proibida/ausente fora desse ramo, nunca opcional geral;
- Prettier, KB, o oráculo de 14 linhas autocontidas e `git diff --check` passaram; as 70 rotas,
  RBAC, D-05/BOAT, matriz/hash 576 e ownership permaneceram inalterados;
- TASK-0010 está `completed`; TASK-0012 retomou sua tentativa 1/2 agora com fontes suficientes.
  TASK-0013…0018 permanecem `queued`.

Checkpoint 45 (janela 4, RED mobile congelado):

- TASK-0012 materializou oito specs e sete helpers independentes: 70 rotas, matriz cartesiana
  70×9, hash/igualdade ordenada das 576 transições, 14 schemas com payload positivo e remoção de
  cada obrigatória, ramos condicionais, axe/a11y, FixturePrinter e superfícies de runtime;
- o primeiro RED revelou 794/797 falhas, mas a auditoria do maestro rejeitou três lacunas de
  sensor: `B+S` com sufixo BOAT/disabled, required fields não exercitados e superfícies centrais
  não verificadas. O Inspector corrigiu sem tocar produção/configuração;
- RED final: typecheck PASS; 865/868 falhas atribuídas exclusivamente ao comportamento ausente e
  três oráculos independentes verdes; zero skip/todo. Hashes dos 14 sensores foram capturados no
  relatório TASK-0012 e ficam congelados;
- TASK-0012 está `completed`; TASK-0013 abriu a tentativa 1/2 em papel Engineer, proibido de
  alterar qualquer spec, `src/testing/**`, configuração, lockfile, contrato ou gerado.

Checkpoint 46 (janela 4, correção higiênica do sensor):

- a implementação da tentativa 1 de TASK-0013 levou os oito arquivos de teste a 868/868 PASS,
  além de typecheck e build verdes, mas o lint independente revelou uma variável local não usada
  em `app.transitions.spec.ts`, caminho congelado e fora da autoridade do Engineer;
- TASK-0012 reabriu sua tentativa final 2/2 somente para remover a atribuição morta, sem tocar
  produção, configuração ou qualquer asserção. O novo hash do único sensor alterado é
  `dd6ea3eb3577e49a63a9873e416fb566b1b7bc8acaf0a55621099a3f12f19781`;
- lint, typecheck e 868/868 testes passaram, com zero skip/todo. TASK-0012 retornou a `completed`;
  TASK-0013 permanece `in_progress` até auditoria do maestro, `pnpm check` integral e REVIEW.

Checkpoint 47 (janela 4, delivery review CTG-0004a ciclo 1):

- o REVIEWER CODEX independente reproduziu 868/868 testes, mas retornou **FAIL** com treze achados
  `high`: guardas permissivos; oito clientes vazios; store/sync/normativo sem comportamento; 70
  aliases de um placeholder e oito módulos vazios; i18n sem integração; FieldShell sem
  ErrorBoundary; readiness parcial; matriz sem validação/dispatcher; schemas permissivos;
  impressão/bodycam apenas nominais; D-05/BOAT apenas metadados; sensores falso-positivos; e
  divergência entre a allowlist exata do contrato e o prompt;
- o candidato de produção permanece deliberadamente sem commit. Gates verdes não substituem os
  comportamentos ausentes, e `pnpm check` integral não foi consumido sobre candidato rejeitado;
- a correção exige nova ordem Architect → Inspector → Engineer → gates integrais → REVIEW. Como
  TASK-0010 e TASK-0012 já consumiram `2/2`, TASK-0013 fica `blocked` e o CTG escala ao Owner antes
  de qualquer reset extraordinário de limites. Não há autorização para push, PR ou merge do FAIL.

Checkpoint 48 (janela 4, autorização corretiva extraordinária CTG-0004a):

- em 2026-09-22, o Owner autorizou explicitamente o reset extraordinário necessário para eliminar
  os treze achados `CTG4A-R1…R13` do delivery review ciclo 1;
- TASK-0010 e TASK-0012 recebem excepcionalmente limite `3/3`; TASK-0013 preserva sua tentativa
  final `2/2`. A ordem vinculante é Architect → Inspector RED → Engineer GREEN → gates integrais →
  novo REVIEW independente;
- o Architect pode corrigir apenas a allowlist e tornar executáveis, sem inventar produto, os
  contratos já exigidos de guards, clientes, offline/sync/normativo, módulos/telas, i18n,
  ErrorBoundary, readiness, transições, forms, printer/bodycam, D-05 e BOAT;
- o Inspector deve substituir os falsos positivos nominais por provas comportamentais que falhem
  contra o candidato rejeitado. O Engineer não pode tocar sensores. Produção só será commitada após
  todos os gates e REVIEW PASS.

Checkpoint 49 (janela 4, Architect extraordinário 3/3):

- TASK-0010 reconciliou a allowlist fechada com todas as superfícies intencionais de TASK-0013 e
  tornou expressamente comportamentais os oráculos de guards, adapters, offline/sync/normativo,
  módulos/telas/i18n, ErrorBoundary, readiness, transições, forms, impressão/bodycam, D-05 e BOAT;
- a correção não alterou as 70 rotas, a matriz 576/hash, RBAC ou decisões de produto. Lacunas
  literais de D-01, schemas e chave específica D-05/BOAT continuam `source_pending` e não autorizam
  fallback permissivo ou texto inventado;
- Prettier focal, KB `756/446` e oráculo 70/576/hash passaram. TASK-0010 está `completed` em 3/3;
  TASK-0012 abriu a tentativa extraordinária final 3/3 para substituir sensores nominais por RED
  comportamental. TASK-0013 permanece `queued`.

Checkpoint 50 (janela 4, reference-gap técnico dentro da tentativa extraordinária):

- o Inspector criou 23 REDs diretos contra os stubs, mas parou antes de positivos completos porque
  §1.1 ainda não fixava tokens/contexto dos guards, operações dos clients, interfaces de store,
  sync/normativo, dispatcher, ErrorBoundary, printer/bodycam e extensão; isso foi classificado como
  `reference-gap`, sem consumir nova iteração de TASK-0012;
- TASK-0010 completou o mesmo handoff 3/3 com §1.2: APIs públicas, fixtures grant/deny, tabela
  método/verbo/path/headers/retorno dos oito clients, contratos de persistência/sync/normativo,
  transições, diagnósticos, impressão/bodycam, módulos/i18n e BOAT, todos mapeados à allowlist;
- caminhos realmente elididos, representação criptográfica e chaves ausentes permanecem
  `source_pending` e falham fechados. Prettier, KB `756/446` e oráculo 70/576/hash passaram;
  TASK-0012 retoma a mesma tentativa 3/3 para substituir o RED parcial por provas completas.

Checkpoint 51 (janela 4, RED comportamental extraordinário congelado):

- TASK-0012 substituiu sensores nominais por 951 provas: 720 REDs atribuíveis à produção rejeitada
  e 231 oráculos independentes verdes, com zero skip/todo e lint/typecheck PASS;
- os REDs cobrem os cinco guards efetivos e RBAC 70×9, 28 operações HTTP, store/sync/normativo,
  oito módulos e 69 classes de página distintas, i18n, ErrorBoundary, readiness, validações de
  schemas, impressão/bodycam, dispatcher, 11 rotas BOAT e D-05 fail-closed;
- todos os 23 hashes finais de specs/helpers estão congelados no relatório Inspector. TASK-0012
  está `completed` em 3/3; TASK-0013 abriu a tentativa final 2/2 e não pode alterar qualquer
  sensor/helper, configuração, contrato, lockfile ou gerado.

Checkpoint 52 (janela 4, correção de paths nos sensores congelados):

- a auditoria do maestro detectou que dois sensores extraordinários ainda importavam paths do
  candidato rejeitado, fora da allowlist fechada: bodycam em `shared/` e normativo em `data/local/`;
- o Inspector alterou somente esses dois imports para `core/bodycam-indicator.component` e
  `data/normative/normative-package.service`, sem mudar asserções. Os novos hashes são
  `2856a554…` e `c470fd38…`; os outros 21 permanecem byte-idênticos;
- lint e typecheck passaram; o RED focal ficou em 4/951 falhas atribuíveis ao bodycam ainda não
  movido pela produção. TASK-0012 permanece `completed` 3/3 e TASK-0013 continua na mesma tentativa
  final 2/2, ainda não aceita pelo maestro.

Checkpoint 53 (janela 4, delivery review CTG-0004a ciclo 2 extraordinário):

- o candidato exato `a48868266854205e86a18fac0a052f4e4872c70a` passou lint, typecheck, build,
  972/972 testes e `pnpm check` integral, mas o REVIEWER CODEX independente retornou **FAIL** com
  três achados `critical` e seis `high` de integração e cobertura comportamental;
- bootstrap/auth não têm caminho operacional e o contexto dos guardas congela o estado inicial;
  sync diverge do OpenAPI; normativo/impressão omitem headers obrigatórios; páginas,
  ErrorBoundary/D-05/BOAT, readiness, bodycam/impressão e persistência seguem nominais ou sem wiring;
- o verde foi rejeitado porque os sensores ainda aceitam doubles e busca textual incompatíveis com
  os clients/runtime reais. Nenhuma evidência de entrega, push ou PR foi emitida;
- TASK-0013 fica `blocked` em 2/2. TASK-0012 já está em 3/3; nova sequência Architect → Inspector
  → Engineer → gates integrais → REVIEW exige reset extraordinário explícito do Owner.

Checkpoint 54 (janela 4, autorização definitiva e gates focais CTG-0004a):

- o Owner autorizou explicitamente um último ciclo extraordinário para eliminar somente
  `CTG4A-R2-F001…F009`, com reset de TASK-0010 para 4/4, TASK-0012 para 4/4 e TASK-0013 para 3/3;
- a sequência permanece Architect → Inspector RED → Engineer GREEN → review independente, mas os
  testes e o review desta iteração são estreitos e restritos às nove correções; o `pnpm check`
  integral já verde no candidato anterior não será repetido como gate deste ciclo;
- um `PASS` focal libera imediatamente CTG-0004b e CTG-0005. Nenhum push ou PR intermediário será
  feito: a integração remota ocorrerá uma única vez ao final da rodada, seguida dos gates e da
  evidência exigidos para o candidato completo;
- o escopo fechado cobre bootstrap/auth reativos, DTO/envelope real de sync, headers/DI reais,
  páginas comportamentais, ErrorBoundary/D-05/BOAT, readiness única, bodycam/printer operacionais,
  modelo offline completo e sensores compatíveis com integrações reais.

Checkpoint 55 (janela 4, Architect corretivo definitivo 4/4):

- TASK-0010 fechou no contrato, sem alterar 70 rotas, RBAC ou as 576 transições, os nove achados
  `CTG4A-R2-F001…F009`: entrada auth pública e bootstrap reativo; DTO/envelope sync gerado;
  headers/DI reais; binding comportamental de página; ErrorBoundary/D-05/BOAT; readiness única;
  bodycam/printer operacionais; oito coleções offline; e oráculos contra contratos reais;
- Prettier focal, KB `756/446` e o oráculo focal `70/70/576` com hash canônico `a3175e63…d71013`
  passaram. TASK-0010 está `completed` em 4/4;
- TASK-0012 abriu a tentativa 4/4 para criar apenas sensores estreitos que reproduzam as nove
  falhas do candidato e sejam incompatíveis com os doubles/regex/metadata nominais rejeitados.

Checkpoint 56 (janela 4, Inspector focal definitivo 4/4):

- TASK-0012 criou somente três specs focais densos para `F001…F009`, corrigidos na própria
  tentativa após auditoria do maestro para exigir login/completion STYNX e bootstrap no mesmo
  injector, render real de D-05/BOAT, providers root de printer/bodycam e hash normativo real;
- o comando focal reproduziu `9/9 RED`, zero erro não tratado: Coordinator/ErrorBoundary/providers
  ausentes, readiness sem delegação, DTO sync incompatível, normativo sem validate real, páginas
  nominais e store incompleto. Typecheck permaneceu verde;
- nenhum teste anterior foi alterado e nenhuma suíte ampla foi executada. TASK-0012 está
  `completed` em 4/4; TASK-0013 abriu a tentativa 3/3, limitado à produção e ao mesmo comando focal.

Checkpoint 57 (janela 4, Engineer focal definitivo 3/3):

- o primeiro GREEN `9/9` foi rejeitado pelo maestro antes do REVIEW porque ainda permitia printer
  fictício, store/grafo root incompletos, páginas sobre `Map` e runtime config ausente; os mesmos
  três specs foram reforçados, sem alterar suites anteriores, até reproduzirem cinco REDs reais;
- TASK-0011 usou sua tentativa final 2/2 somente para integrar `public/runtime-config.js` vazio e
  sem segredos no `src/index.html`, seguindo RAIT/Portal; o sensor isolado passou;
- TASK-0013 fechou os REDs com IndexedDB + AES-GCM e chave WebCrypto não exportável, providers root,
  sync/normativo/printer/store reais, impressão fail-closed com evento de falha, páginas sem `Map`,
  ErrorBoundary/readiness reativos e diagnóstico bodycam. A correção role-correct de timing esperou
  a Promise da porta sem mudar expectativa;
- o gate autorizado e reproduzido pelo maestro passou: três arquivos focais, `11/11 PASS`, zero
  erro; typecheck, ESLint focal, Prettier focal e `git diff --check` também passaram. Nenhuma suite
  ampla, build ou `pnpm check` foi executado. TASK-0013 está `completed` em 3/3 e segue para REVIEW
  independente estritamente focal.

Checkpoint 58 (janela 4, review focal ciclo 3 e continuação autorizada):

- o Reviewer CODEX independente reproduziu `11/11 PASS` e o digest exato, mas emitiu `FAIL` por
  sete resíduos dentro de `F001…F009`: lifecycle/navegação OIDC; recovery/primeiro cursor sync;
  operações reais de página; D-05/BOAT; validade/warnings readiness; conflito de store; sensores;
- F003, headers/providers root, impressão fail-closed, bodycam e a estrutura AES-GCM/oito coleções
  foram aceitos e não serão reabertos;
- a autorização geral do Owner para concluir R-0013 mantém o mesmo escopo focal e reseta uma vez
  TASK-0010 para 5/5, TASK-0012 para 5/5 e TASK-0013 para 4/4. Nenhuma suite ampla será executada;
  o próximo REVIEW só ocorre após sensores cobrirem os sete resíduos e passarem.

Checkpoint 59 (janela 4, correção focal final CTG-0004a):

- Architect, Inspector e Engineer fecharam os sete resíduos do ciclo 3 sem reabrir F003/F007:
  callback `/auth-mfa` com lifecycle e ordem estrita, sync cursor/recovery, operações reais de
  página, D-05/BOAT, validade/warnings, conflitos persistentes e sensores fortes;
- o Inspector corrigiu três defeitos do próprio harness sem relaxar expectativas: montagem real do
  componente MFA, controle separado das etapas assíncronas e fixture com snapshot/rota válidos;
- o maestro corrigiu também o `redirectUrl` produtivo para `/auth-mfa` e reproduziu exatamente os
  três specs focais em `18/18 PASS`, além de typecheck, ESLint focal, Prettier focal e
  `git diff --check` verdes;
- TASK-0013 fecha em 4/4 e o candidato segue para o review independente final, ainda sem push/PR.

Checkpoint 60 (janela 4, review focal ciclo 4 e correção concentrada):

- o REVIEWER independente confirmou digest, `18/18 PASS` e integridade, mas rejeitou o candidato
  por quatro achados `high` e dois `medium`: login/lazy navigation, submit/operações reais, fallback
  de entrada direta, warning duplicado/interno, conflito não atômico e sensores permissivos;
- F002 foi fechado e F003/F007 permaneceram aceitos. A correção não os reabre e continua limitada
  aos mesmos três specs e às superfícies produtivas já autorizadas;
- sob a autorização geral do Owner para concluir a rodada sem nova burocracia intermediária,
  TASK-0012 recebe tentativa 6/6 e TASK-0013 recebe tentativa 5/5, em sequência Inspector RED →
  Engineer GREEN → review independente final. Nenhum push/PR ocorre antes do fechamento da rodada.

Checkpoint 61 (janela 4, Inspector final 6/6):

- os mesmos três specs focais cresceram para 26 testes e reproduzem `8 RED` exclusivamente
  atribuíveis aos seis findings: evento/login e destino sem turno; estado pós-submit; cold fallback
  D-05/BOAT; warning deduplicado/não assertivo; payload divergente e corrida atômica;
- os 18 sensores anteriores seguem verdes e o typecheck passa. Os novos testes usam rotas lazy,
  UI, runtime/store/adapter e concorrência reais, sem alterar produção, configuração ou suíte antiga;
- TASK-0012 fecha em 6/6 e TASK-0013 abre 5/5, limitado a tornar esses oito casos verdes.

Checkpoint 62 (janela 4, Engineer final 5/5):

- produção fechou os oito REDs: login/lazy destinations; submit observável sem fatos fabricados;
  cold fallback; warning canônico deduplicado; comparação canônica e serialização atômica;
- o maestro reproduziu `26/26 PASS`, typecheck, ESLint focal, Prettier focal e
  `git diff --check`. TASK-0013 fecha em 5/5;
- o candidato de produto digest `6b8b0363…f47876` segue para review independente final, sem
  executar suíte ampla e sem push/PR intermediário.

Checkpoint 63 (janela 4, review focal ciclo 5):

- o REVIEWER confirmou digest e `26/26 PASS`, mas encontrou quatro `high`: callback ainda
  dependia de rotas planas; evento AIT não fornecia dados/contexto; atomicidade era somente por
  instância; e os sensores ocultavam exatamente esses caminhos;
- F005/F006 foram fechados e F002/F003/F007 permanecem aceitos. A correção finalíssima remove os
  três atalhos de harness antes de tocar produção: rotas lazy puras, evento DOM real e duas
  conexões IndexedDB independentes;
- a autorização geral do Owner mantém a execução contínua: TASK-0012 7/7 e TASK-0013 6/6,
  seguidas de review independente, sem push/PR intermediário.

Checkpoint 64 (janela 4, Inspector finalíssimo 7/7):

- 29 sensores focais agora usam exclusivamente TEAT_ROUTES lazy, submit por evento DOM com fila e
  contexto reais e duas conexões IndexedDB; a tabela atômica cobre as sete famílias mutáveis;
- o resultado honesto é `21 PASS / 8 RED`, todos atribuíveis aos quatro findings do ciclo 5;
  typecheck permanece verde e produção/configuração não foram tocadas;
- TASK-0012 fecha em 7/7 e TASK-0013 abre 6/6 para corrigir somente esses oito casos.

Checkpoint 65 (janela 4, Engineer finalíssimo 6/6):

- os oito REDs foram fechados em produção: navegação lazy direta com guardas; submit DOM a partir
  de fila/contexto duráveis; estados observáveis; e operação condicional atômica na mesma transação
  para sete famílias entre conexões independentes;
- maestro reproduziu `29/29 PASS`, typecheck, ESLint focal, Prettier focal e diff-check. TASK-0013
  fecha em 6/6 e segue ao review final do digest `ac6bb9d2…1b235f`.

Checkpoint 66 (janela 4, review ciclo 6):

- atomicidade F008 foi aceita, mas o REVIEWER encontrou três `high` em estados fabricados pelo
  harness (blocked e queue) e reabriu F006 `medium` porque o guard sobrepôs o decisor único;
- a próxima prova substitui os doubles por falha real de bootstrap e ciclo produtivo
  producer → queue/draft → review → DOM, além de exigir a política pre-shift dentro do serviço;
- TASK-0012 8/8 e TASK-0013 7/7 seguem sob autorização geral, sem ampliar o escopo nem publicar.

Checkpoint 67 (janela 4, Inspector end-to-end 8/8):

- os três specs preservam 25 verdes e expõem somente quatro REDs reais: bootstrap 503 não alcança
  recuperação; guard não delega destino ao serviço; produtor real não gera revisão finalizável;
  e falha de persistência aparece como blocked em vez de error;
- não há principal/bootstrap artificial, cast de queue nem chamada direta de submit. F008 segue
  integralmente verde e typecheck passa;
- TASK-0012 fecha em 8/8 e TASK-0013 inicia 7/7, restrito a esses quatro casos.

Checkpoint 68 (janela 4, Engineer end-to-end 7/7):

- os quatro REDs foram fechados: identidade/tenancy sobrevivem ao bloqueio de readiness; política
  pre-shift voltou ao serviço único; produtor e review compartilham contexto durável tipado; draft
  transiciona atomicamente e falha real chega ao estado error;
- maestro reproduziu `29/29 PASS`, typecheck, lint/formatação focais e diff-check. TASK-0013 fecha
  em 7/7; digest `fb479698…5bd9d1` segue ao review final.

Checkpoint 69 (janela 4, review ciclo 7):

- F004/F006/F008/F009 foram aceitos e o caminho 503 de F001 está correto; resta somente um `high`:
  mismatch posterior entre tenant STYNX e snapshot de outro tenant ainda expõe contexto operacional;
- correção mínima e fechada: preservar identidade para recuperação, negar tenant/bootstrap/
  provisioning operacionais no mismatch. TASK-0012 9/9 e TASK-0013 8/8 sob autorização geral.

Checkpoint 70 (janela 4, sensor tenant mínimo 9/9):

- um único sensor novo reproduz o mismatch: identidade e `/device-blocked` permanecem disponíveis,
  mas bootstrap/provisioning antigos continuam expostos e `/home` ainda autoriza;
- bootstrap focal ficou `13 PASS / 1 RED`, typecheck verde. TASK-0012 fecha em 9/9 e TASK-0013
  abre 8/8 somente para invalidar o contexto operacional divergente.

Checkpoint 71 (janela 4, correção tenant mínima 8/8):

- identidade autenticada segue disponível para recuperação, enquanto snapshots operacionais são
  expostos somente com igualdade exata de tenant; `/home` mismatched é negado e
  `/device-blocked` permanece alcançável;
- maestro reproduziu bootstrap `14/14`, três focais `30/30`, typecheck, lint/formatação e
  diff-check. TASK-0013 fecha em 8/8; digest `d9382578…dd32ea` segue ao review residual final.

Checkpoint 72 (janela 4, fechamento CTG-0004a e abertura CTG-0004b):

- REVIEWER independente confirmou digest, `30/30 PASS`, diff-check e zero achado
  `critical/high/medium`; CTG-0004a está aprovado no escopo focal final;
- TASK-0014 abre em 1/2 como Architect para fixar o contrato executável do app web antes de
  scaffold, Inspector e Engineer. Push/PR continuam deferidos ao encerramento da rodada.

Checkpoint 73 (janela 4, Architect web 1/2):

- TASK-0014 fixou o contrato web com 60 rotas, 56 fichas, 540 decisões rota×papel, i18n, SSE e
  ownerships disjuntos; gates focal, KB e formatação global passam;
- TASK-0014 fecha em 1/2 e TASK-0015 abre em 1/2 para criar somente o scaffold Angular
  não comportamental, com zero rota de produto.

Checkpoint 74 (janela 4, scaffold web 1/2):

- TASK-0015 criou o scaffold Angular 22 em 13 paths allowlisted, shell standalone/OnPush/zoneless
  e zero rota de produto;
- o maestro integrou o novo importer ao `pnpm-lock.yaml` e reproduziu lint, typecheck e build no
  workspace real, sem symlink temporário. TASK-0015 fecha em 1/2;
- TASK-0016 abre em 1/2 para criar os primeiros testes RED de 60 rotas, RBAC cartesiano,
  ErrorBoundary, clients, i18n e a11y.

Checkpoint 75 (janela 4, Inspector web 1/2):

- TASK-0016 congelou 549 testes: 5 oráculos independentes verdes e 544 REDs atribuíveis à
  produção ausente, cobrindo 60 rotas, 56 fichas, 540 pares rota×papel, metadata, ErrorBoundary e
  nove shared components; typecheck e formatação focal passam, zero skip/todo;
- TASK-0016 fecha em 1/2 e TASK-0017 abre em 1/2 para implementar as 12 áreas, 56 telas, quatro
  rotas operacionais, guardas/facades, boundary e SSE sem tocar testes/configuração.

Checkpoint 76 (janela 4, Engineer web 1/2):

- TASK-0017 implementou 12 módulos lazy, 60 rotas/56 fichas, 540 decisões RBAC, ErrorBoundary,
  SSE/fallback, facades, shared e i18n canônico; 549/549 testes, lint, typecheck e build passam;
- o maestro restaurou a instalação congelada removida pelo worker e reproduziu os quatro gates no
  workspace real. TASK-0017 fecha em 1/2;
- CTG-0004b segue para review independente antes de abrir CTG-0005.

Checkpoint 77 (janela 4, review CTG-0004b ciclo 1):

- REVIEWER confirmou gates e inventário, mas rejeitou o falso verde com cinco `high` e um
  `medium`: providers/auth/HTTP ausentes; páginas/facades nominais; ErrorBoundary desconectada;
  SSE não real; i18n paralelo; e sensores que não exercitam produção;
- TASK-0016 abre 2/2 para fortalecer os mesmos testes contra runtime real; TASK-0017 fica
  preparado em 2/2 para corrigir somente F001…F006, sem alterar testes/configuração.

Checkpoint 78 (janela 4, Inspector web corretivo 2/2):

- a suíte foi fortalecida para 564 testes com `296 PASS / 268 RED`: 540 casos executam guard e
  Router reais; 12 páginas representativas montam produção, clients/DOM/axe; providers bootstrap,
  ErrorBoundary canônica e EventSource/fallback/cleanup são exigidos;
- typecheck e formatação focal passam, zero skip/todo. TASK-0016 fecha em 2/2 e TASK-0017 abre
  tentativa 2/2 para tornar verdes somente esses REDs, sem tocar sensores/configuração.

Checkpoint 79 (janela 4, Engineer web corretivo 2/2):

- F001…F006 foram implementados em produção: providers STYNX/HTTP/context, RBAC real, páginas dos
  12 grupos com facade/DOM, ErrorBoundary canônica, SSE/fallback/cleanup, i18n STYNX e BOAT;
- lint, typecheck, `564/564`, build com 12 chunks e `pnpm check` integral passam; sensores,
  configuração e lockfile não foram alterados pelo Engineer;
- TASK-0017 fecha em 2/2 e o digest `c0d0d57a…b581e6` segue ao review final CTG-0004b.

Checkpoint 80 (janela 4, review CTG-0004b ciclo 2):

- F005/i18n foi aceito, mas cinco `high` permanecem: entrada/contexto, páginas/clients, boundary,
  consumo SSE e sensores permissivos/Proxy artificial;
- sob autorização geral do Owner, TASK-0016 e TASK-0017 recebem tentativa 3/3 estritamente para
  F001/F002/F003/F004/F006, sem reabrir i18n ou inventário.

Checkpoint 81 (janela 4, Inspector web 3/3):

- os 564 testes agora deixam `514 PASS / 50 RED`: 36 detectam o terceiro guard oculto/Proxy,
  login inativo é negado, boundary não renderiza e 12 grupos não usam endpoints/clients próprios;
- sensores exigem payload/resposta/DOM/erro, consumo SSE/fallback/cleanup, BOAT source_pending e axe;
  inventários 60/56/540, i18n e zero skip/todo permanecem verdes;
- TASK-0016 fecha em 3/3 e TASK-0017 abre 3/3 para esses 50 REDs.

Checkpoint 82 (janela 4, Engineer web 3/3):

- produção fechou os 50 REDs: login/contexto, guard chain sem Proxy, clients/endpoints dos 12
  grupos, payload/DOM/erro, boundary, SSE observado e BOAT source_pending;
- lint, typecheck, `564/564`, build e `pnpm check` integral passam. TASK-0017 fecha em 3/3;
- digest `1d1562b6…6c15878` segue ao review independente final CTG-0004b.

Checkpoint 83 (janela 4, review CTG-0004b ciclo 3):

- F003/F005 foram fechados; quatro `high` permanecem em contexto/callback, ações de ficha,
  protocolo SSE e sensores ainda genéricos;
- TASK-0016 e TASK-0017 recebem tentativa 4/4, limitada a callback completo, contexto negativo,
  fluxo contratual AIT representativo e eventos SSE nomeados com polling do recurso aberto.

Checkpoint 84 (janela 4, Inspector web 4/4):

- a suíte preserva 60/56/540 e reduz o escopo a `562 PASS / 2 RED`: callback/contexto real e
  fluxo AIT completo com POST accept, headers, evento `ait.changed`, reload/polling do recurso;
- fixtures genéricas foram removidas, F003/F005 permanecem verdes e typecheck passa;
- TASK-0016 fecha em 4/4 e TASK-0017 abre 4/4 apenas para esses dois cenários.

Checkpoint 85 (janela 4, Engineer web 4/4):

- callback/contexto e fluxo AIT/SSE foram fechados em produção, incluindo POST/headers/body,
  evento nomeado, reload/polling do recurso e cleanup;
- lint, typecheck, `564/564`, build e `pnpm check` passam. TASK-0017 fecha em 4/4;
- digest `7b7d5866…223070e` segue ao review independente final CTG-0004b.

Checkpoint 86 (janela 4, review CTG-0004b ciclo 4):

- callback, POST AIT, boundary e cleanup foram aceitos, mas quatro `high` e uma regressão `medium`
  restam em contexto ausente, seleção/autoridade AIT, SSE não-AIT, cobertura reduzida e i18n;
- TASK-0016/0017 recebem tentativa 5/5 para fechar todos esses resíduos de forma abrangente,
  restaurando cobertura dos 12 grupos e tópicos/recursos de cada página SSE.

Checkpoint 87 (janela 4, Inspector web 5/5):

- cobertura integral foi restaurada; `561 PASS / 3 RED` provam context provider ausente/null,
  SSE por rota/tópico/recurso e seleção/autoridade/estado AIT sem envelope como recurso;
- os 12 grupos voltaram a validar resposta, refresh e erro específicos; typecheck, 60/56/540,
  callback/POST/boundary/i18n permanecem verdes;
- TASK-0016 fecha em 5/5 e TASK-0017 abre 5/5 para esses três cenários.

Checkpoint 88 (janela 4, Engineer web 5/5):

- contexto estrito, metadados SSE completos e seleção/autoridade/estado AIT foram fechados;
  envelope somente invalida, fallback/reload usam recurso e confirmação usa STYNX canônico;
- `564/564`, lint, typecheck, build e `pnpm check` integral passam. TASK-0017 fecha em 5/5;
- digest `62054b45…eb4851` segue ao review final CTG-0004b.

Checkpoint 89 (janela 4, review CTG-0004b ciclo 5):

- quatro `high` e um `medium` permanecem em provider contextual real, estados AIT, tópicos SSE,
  rótulos i18n e oráculos que espelham os atalhos;
- TASK-0016/0017 recebem tentativa 6/6 para derivar contexto/eventos/estados diretamente das
  fontes autoritativas e eliminar todos os literais fora do runtime STYNX.

Checkpoint 90 (janela 4, Inspector web 6/6):

- 565 testes deixam `562 PASS / 3 RED`: resolver contextual produtivo ausente; tópicos SSE por
  página incompletos; estados RECEBIDO/CORRIGIDO e rótulos AIT fora do catálogo;
- oráculos vêm de `teat-route-contract.md` e catálogo canônico, preservando 60/56/540, 12 grupos,
  stale/fallback/cleanup/BOAT e typecheck verde;
- TASK-0016 fecha em 6/6 e TASK-0017 abre 6/6 somente para esses três casos.

Checkpoint 91 (janela 4, Engineer web 6/6):

- resolver contextual real, catálogo SSE §7 por página e estados/rótulos AIT foram implementados;
- `565/565`, lint, typecheck, build e `pnpm check` integral passam. TASK-0017 fecha em 6/6;
- digest `4ecd760d…15d82d7` segue ao review independente final CTG-0004b.

Checkpoint 92 (janela 4, review CTG-0004b ciclo 6):

- F002/F005 foram fechados; três `high` restam em resolver sem integração, override de tópicos AIT
  e sensores que acionam o setter/aceitam assinatura reduzida;
- TASK-0016/0017 recebem tentativa 7/7 para provar resolução durante navegação por client/recurso e
  tenant, e assinatura runtime idêntica ao manifesto completo.

Checkpoint 93 (janela 4, Inspector web 7/7):

- `562 PASS / 3 RED`: navegação G* real não aciona client/context resolver, e AIT registra 10
  tópicos mas runtime abre só um, omitindo `ait.concurrency-suspected`;
- teste usa appConfig+Router+HttpTestingController reais, sem setter/double, e preserva todos os
  demais contratos. TASK-0016 fecha em 7/7; TASK-0017 abre 7/7 para os três REDs.

Checkpoint 94 (janela 4, Engineer web 7/7):

- resolução contextual produtiva foi integrada à navegação G* com client/endpoint, vínculo de tenant
  e invalidação; AIT e demais páginas SSE consomem seus manifestos sem override;
- `565/565`, lint, typecheck, build e `pnpm check` integral passam. TASK-0017 fecha em 7/7;
- digest `35a8a39e…f9551f5` segue ao review final CTG-0004b.

Checkpoint 95 (janela 4, review CTG-0004b ciclo 7):

- F004 foi fechado e restam somente dois `medium`: contexto antes do role e GET duplicado/
  descartado confundido pelo sensor com carga real;
- TASK-0016/0017 recebem tentativa 8/8 estritamente para preservar a ordem
  auth→tenant→role→context, remover duplicata e provar RouterOutlet/página real e 404.

Checkpoint 96 (janela 4, Inspector web 8/8):

- `564 PASS / 1 RED`: sensor com RouterOutlet real prova contexto antes do role, HTTP indevido em
  role negado e dois GETs após resolução; 404/503/vazio/mismatch/troca de tenant e DOM estão cobertos;
- runtime SSE está integralmente verde. TASK-0016 fecha em 8/8 e TASK-0017 abre 8/8 somente para
  corrigir ordem e remover o GET duplicado.

Checkpoint 97 (janela 4, Engineer web 8/8):

- a resolução contextual passou à folha após auth→tenant→role, zero HTTP em deny e exatamente
  resolução + carga real em allow, sem prefetch descartado;
- `565/565`, lint, typecheck, build e `pnpm check` integral passam. TASK-0017 fecha em 8/8;
- digest `2febf768…d5becb` segue ao review final CTG-0004b.

Checkpoint 98 (janela 4, fechamento CTG-0004b e abertura CTG-0005):

- REVIEWER independente confirmou digest, `565/565`, gates e zero achado bloqueante; CTG-0004b
  está aprovado;
- TASK-0018 abre em 1/2 para fechar a documentação WP-T4–T6 antes do review/integracão final da
  rodada. Push/PR continuam deferidos ao encerramento.

Checkpoint 99 (janela 4, transcrição documental CTG-0005):

- TASK-0018 registrou o estado comprovado de WP-T4–T6: CTG-0002 e CTG-0003 integrados nos PRs
  #73 e #82; CTG-0004a e CTG-0004b aprovados em review independente no candidato
  `408ab438fdd940eed6bd46296daad0a141d5a222`;
- a transcrição preserva a fronteira: os candidatos de frontend não foram mesclados, publicados
  ou implantados, e fixtures/ports não demonstram KMS, Keystore, criptografia/envelope/attestation,
  bodycam real ou adapters de hardware (inclusive impressora);
- a única PR/push continua deferida ao encerramento da rodada. O maestro, após observação de
  merge, é o responsável por atualizar a história de fechamento e não há alegação antecipada.

Checkpoint 100 (janela 4, delivery review CTG-0005):

- o primeiro review independente encontrou cinco correções documentais de precisão e completude;
  Architect corrigiu os quatro documentos autorizados e o maestro completou o relatório da tarefa;
- o re-review focal retornou **PASS**, sem finding high remanescente. Prettier focal, KB `756/446`,
  publish-check `201` e diff-check passaram na versão corrigida;
- `pnpm check` integral passou antes das últimas correções exclusivamente documentais. O candidato
  completo será recertificado após integrar os avanços de `origin/main`, antes da PR única.

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
