# R-0013 — frente `teat-frontends` (WP-T4, WP-T5, WP-T6 do TEAT: fichas, formulários, i18n, provisionamento offline e apps mobile/web)

**Status:** em execução desde 2026-09-20 pelo maestro Codex. Reviewer: Opus via
`tools/orchestra/bridge.sh claude` (Fable no `delivery-review` do provisionamento).
**Concorrência:** abre já e **nenhum grupo está preso**: CTG-0001 (reconciliação do corpus), CTG-0002 (126 fichas, i18n, transições, diagramas), CTG-0003 (provisionamento offline — R-0005 em `main`) e CTG-0004 (apps — schemas, `@detran/api-clients` e contratos do TEAT em `main` desde R-0008; padrão de scaffold em `apps/portal/web` desde R-0014). O lock em `packages/ui` com R-0012 `rait-web` só vale se as duas estiverem ativas ao mesmo tempo: R-0012 não abriu, logo esta rodada vai primeiro e R-0012 espera. Allowlist i18n já existe (`parameter-catalogue.md` §Namespaces i18n): esta rodada só acrescenta as linhas `teat.*`.
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
3. **Provisionamento offline** (WP-T5): ADR "Provisionamento operacional offline" (número livre
   seguinte; previsto ADR-0025): chave do dispositivo no Keystore, grant `OfflineOperationalGrantV1`,
   pacote assinado por KMS, envelope cifrado, revogação por época, reconciliação obrigatória;
   `BP-OPS-PROVISIONING-001` (`device_key`, `offline_authorization_grant`, `provisioning_package`,
   `provisioning_receipt`, `device_revocation`; DDL `19-ops-provisioning.sql`); rotas
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

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                          | Depende de           | Entrega                                                                                                                                                                  |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0001 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-product-teat`, `MOD-kb-manifest`                         | —                    | reconciliação §5 (12 itens), PR próprio                                                                                                                                  |
| TASK-0002 | Architect            | architect-blueprint | Terra / alto   | `MOD-teat-apps-arch`, `MOD-parameter-catalogue-doc`           | TASK-0001            | decisões dos apps, lista fechada tela → ficha → rota, critérios e allowlist documental `teat.*` antes de qualquer catálogo i18n                                          |
| TASK-0003 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-product-teat-screens-mobile`                             | TASK-0002            | 70 fichas mobile; manifesto                                                                                                                                              |
| TASK-0004 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-product-teat-screens-web`                                | TASK-0002            | 56 fichas web; diagramas de estrutura                                                                                                                                    |
| TASK-0005 | Engineer             | engineer-frontend   | Luna / baixo   | `MOD-teat-i18n-transitions`, `MOD-parameter-generated`        | TASK-0002            | schemas, `i18n/teat.pt-BR.json`, `transitions.ts` (576) e regeneração após a allowlist já declarada pelo Architect                                                       |
| TASK-0006 | Architect            | architect-blueprint | Terra / alto   | `MOD-adr`, `MOD-bp-ops-provisioning`, `MOD-ddl-19`            | TASK-0002            | ADR de provisionamento, blueprint, contrato das rotas, matriz de prova (pacote copiado/alterado/expirado/revogado)                                                       |
| TASK-0007 | Inspector            | inspector-tests     | Terra / alto   | `MOD-ops-provisioning-tests`                                  | TASK-0006            | testes da matriz de prova; "sem chave privada no servidor" (teste de configuração)                                                                                       |
| TASK-0008 | Engineer             | engineer-backend    | Terra / médio  | `MOD-ops-provisioning`, `MOD-shared-policy`, `MOD-app-module` | TASK-0007            | módulo, rotas, `ReadinessGate` (contrato consumido pelo mobile); testes verdes                                                                                           |
| TASK-0009 | Inspector            | inspector-tests     | Terra / alto   | `MOD-teat-mobile-tests`, `MOD-teat-web-tests`                 | TASK-0003…0005       | testes de roteamento por papel (70 + 60), matriz de 576 transições, TestBed dos compartilhados, `FixturePrinter`; teste "cada tela da matriz tem ficha e rota" (126/126) |
| TASK-0010 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-teat-mobile-app`, `MOD-packages-ui`                      | TASK-0008, TASK-0009 | `apps/teat/mobile` completo (8 módulos, 70 rotas, formulários, serviços); testes verdes                                                                                  |
| TASK-0011 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-teat-web-app`, `MOD-package-json`                        | TASK-0009            | `apps/teat/web` (12 módulos, 60 rotas); `pnpm check` estendido; testes verdes                                                                                            |
| TASK-0012 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                    | TASK-0010, TASK-0011 | build pack (gates reais), `teat-frontends.md`, ADR, backlog                                                                                                              |

CTG-0001 = 0001; CTG-0002 = 0003…0005 (fichas/i18n); CTG-0003 = 0006…0008 (provisionamento);

**Checkpoint de dependências:** após TASK-0006 o maestro agrupa a edição do blueprint de provisionamento e regenera uma vez; após TASK-0008 roda `pnpm install` (pacote `@detran/ops-provisioning`) e inclui alias/scripts; após TASK-0010/0011 criarem `apps/teat/mobile` e `apps/teat/web` a partir do scaffold de `apps/portal/web`, roda `pnpm install`, guarda o lockfile e estende `pnpm check` com as triplas `lint|test|build` de cada app antes de o Inspector rodar TASK-0009 contra os apps. Banco da rodada: `detran_r13`.
CTG-0004 = 0009…0011 (apps). Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → baseline + 126 (+1) / 446, atualizado no mesmo commit; `pnpm docs:kb:publish-check` → OK.
- `pnpm blueprints:check`, `pnpm contracts:check`, `pnpm verify:rls-ddl`, `pnpm verify:decorators` → OK.
- `pnpm --filter @detran/ops-provisioning test:unit|test:integration|test:e2e` → verdes, incluindo os
  quatro rejeitos da matriz de prova; `pnpm --filter @detran/shared test` → `policy.spec.ts` cobre `ops:provisioning:*`.
- `pnpm --filter @detran/teat-mobile typecheck|test|build|lint` e `pnpm --filter @detran/teat-web typecheck|test|build|lint` → verdes.
- teste tela ↔ ficha ↔ rota: 126/126; matriz de transições: 576/576.
- `pnpm check`, `pnpm backend:test:ci` → verdes.

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
não há lock ativo em `packages/ui`. CTG-0001…CTG-0004 estão liberados para desenvolvimento e
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

## Retomada

Checkpoint 1 (janela 1, bloqueio externo antes dos workers):

- concluído: worktree/branch em `b0df484dc0ae1fc1fa742a5f60ef00b17b1c348e`; autorização;
  `pnpm install --frozen-lockfile`; baseline `pnpm check`; `devai doctor`; leitura mandatória;
  concorrência; plano; 12 task JSON; 12 prompts e `compositions.json`;
- concluído: `prompt-review-1` por Codex/Sol/high, veredito `FAIL` (16 high, 2 low), registrado em
  `reviews/prompt-review-1.json`;
- pendente: todos os workers `TASK-0001…0012`, todos os delivery reviews, gates de entrega,
  evidência, PRs, merges, observação e fechamento;
- último veredito: `FAIL`; nenhum worker autorizado;
- próximo passo: Architect/humano decide autorizar a reescrita estrutural do plano e prompts para
  corrigir integralmente os 16 achados high; depois recalcular todas as composições e submeter um
  novo `prompt-review`. Não tratar este `FAIL` como ciclo `REVIEW` incremental;
- estado Git: branch ainda não publicada, sem PR; integrar qualquer avanço de `origin/main` por
  rebase antes da retomada e repetir os gates se a base mudar substantivamente.

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
