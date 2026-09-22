# R-0012 — frente `rait-web` (WP-D, WP-E, WP-F do RAIT: fichas de tela, formulários e esqueleto de `apps/rait/web`)

**Status:** planejado em 2026-09-14 pelo Architect; **aberto em 2026-09-21** pelo maestro Fable 5.1
(prompt em `prompts/00-maestro.md`; `AUTHORIZATION.md`). Reviewer: GPT-5.6 Terra via
`tools/orchestra/bridge.sh codex gpt-5.6-terra`. Base: `origin/main` 2cbcb163 + `work/rounds/R-0012`
do PR #78 (Opção A do Owner).
**Concorrência:** abre já; merge por grupo acoplado — CTG-0001 (fichas): nenhum upstream. CTG-0002 (app, formulários): os **controladores** de comando de `rait-case`/`rait-worklist`/`rait-session` estão em `main` (R-0007 CTG-0001/0002, PR #69), mas os contratos `BP-INF-RAIT-*.commands.openapi.json` (WP-C) só chegam com R-0007 CTG-0004; `@detran/api-clients` hoje gera apenas o CRUD do RAIT. Portanto: scaffold, rotas, `core/`, 22 componentes, 16 schemas de formulário, i18n e facades sobre os clientes CRUD entram já; os métodos de facade que disparam comandos (`POST …/commands/*`) e seus testes ficam `todo` citando R-0007 CTG-0004 e são ligados quando os contratos mesclarem — nunca DTO digitado à mão nem cliente fora de `contracts:clients`. Org, financeiro e integrações renderizam "indisponível nesta versão" até o mesmo CTG. Padrão de scaffold em `main` (`apps/portal/web`, R-0014): copiar. Allowlist i18n existe: acrescentar as linhas `rait.*`. Lock `packages/ui` com R-0013 CTG-0004 (não iniciado): esta rodada toma o lock primeiro; R-0013 integra `main` depois. Pedido a R-0007: publicar os contratos de comando de case/worklist/sessão como tarefa de transcrição antes do CTG-0004, para fechar os `todo` desta rodada.
**Lock compartilhado:** `packages/ui` — nunca ativa ao mesmo tempo que `teat-frontends` (R-0013).
**Janelas previstas:** 3.

## Metas

1. **Fichas de tela** (WP-D): uma ficha por rota de `rait-web-frontend.md` §4 em
   `docs/framework/product/domains/inf/rait/screens/IU-RAIT-<nnn>.md` (ids `IU-RAIT-002…`, id da
   rota no cabeçalho): objetivo, papel, resolver/dados, layout (top-level e nested), componentes
   compartilhados (§5.2), ações e comandos (§7), estados carregando/vazio/erro (códigos do
   `rait-error-catalog.md`), atalhos, LGPD (campos suprimidos por papel), critérios ligados aos
   `AC-RAIT-*`. Status `draft` até revisão do Owner. **Baseline do KB**: `artifactIdCount` do
   `import-manifest.json` sobe em exatamente o número de fichas criadas (contar com
   `node tools/docs/kb/check.mjs` antes e depois; o número entra no relatório).
2. **Formulários e gates** (WP-E): `apps/rait/web/src/app/forms/<formulario>.schema.ts` para os 16
   formulários da §9 (Zod ou `FormGroup` tipado — decisão da TASK-0001, uma só para o app): campo,
   tipo, obrigatoriedade condicional, máscara, validação de forma, código de erro de negócio
   esperado; gate de transição (pré-estado, papel, pré-condições, comando, pós-estado) no cabeçalho
   do arquivo e consolidado em `docs/framework/arch/rait-web-forms.md`. Regra de lint "nenhum prazo
   legal calculado no cliente" ([RN-RAIT-005]) como regra ESLint local (`eslint-plugin-local` ou
   `no-restricted-syntax`) ligada ao `lint` do app.
3. **Esqueleto do app** (WP-F): pacote `apps/rait/web/package.json` (`@detran/rait-web`; scripts
   `build`, `test`, `lint`, `typecheck` sobre Angular CLI 22 — os scripts são criados **nesta**
   rodada e passam a ser os comandos de aceitação; até existirem, o gate provisório é
   `pnpm --filter @detran/ui build`), `provideDetranAuthenticatedApp`, `app.routes.ts` com a árvore
   exata da §4 (títulos, `canMatch` por papel, resolvers), `features/<módulo>/`, `shared/` com os 22
   componentes de domínio (assinaturas da §5.2), `data/api/*` (clientes de `contracts:clients`),
   `core/` (shell, SSE, atalhos, error boundary), `i18n/pt-BR.json` (semente:
   `docs/framework/arch/i18n/rait.pt-BR.json` + `rait.errors.*` do catálogo); páginas de módulos
   pendentes renderizam "indisponível nesta versão". `pnpm check` passa a incluir `--filter @detran/rait-web typecheck|test|build`.
4. Documentação: `rait-build-pack.md` §WP-D/E/F executados com os gates reais (substituindo `ng build`
   e `pnpm --filter @detran/rait-web test` "inexistentes" por scripts que agora existem);
   `rait-web-frontend.md` §12/§13 conferidos; `detran-ui-guide.md` se um componente novo entrar em
   `packages/ui`; backlog.

## Decisões do maestro (Architect, 2026-09-21) — M1…M14

Valem como contrato para os workers; o que não está aqui nem nas fontes vira `OD-*`. O detalhe
executável de cada grupo acoplado é fixado pelo Architect de cada CTG em
`work/rounds/R-0012/contracts/<CTG>.md` (padrão R-0014) e no `route-manifest.md`.

- **M1 — Padrão de app (Owner, R-0014 M1–M6; `engineer-frontend.md` §Padrão de app).** Pacote
  `@detran/rait-web` em `apps/rait/web` copiado de `apps/portal/web` sem variantes: `private`,
  `type: module`, `engines.node >=24 <25`, scripts `build` = `ng build`, `test` = `vitest run
--config vitest.config.ts`, `lint` = `eslint .`, `typecheck` = `tsc -p tsconfig.app.json --noEmit
&& tsc -p tsconfig.spec.json --noEmit`; `angular.json` (projeto `rait-web`, builder
  `@angular/build:application`, `outputPath: dist`, `assets` de `public/`, **sem** service worker —
  o console é interno e `rait-web-frontend.md` §8 diz "offline não suportado"); `eslint.config.js`
  flat idêntico ao do Portal com prefixo de seletor `rait`; `tsconfig.{json,app,spec}.json`;
  `vitest.config.ts` com o plugin JIT (`angularJitApplicationTransform`); `src/test-setup.ts`
  (TestBed uma vez, `resetTestingModule` após cada spec); `src/index.html`, `src/styles.css`
  (importa `@detran/ui/styles`), `public/runtime-config.js` (`tenantId`, `oidcAuthority`,
  `clientId`). Dependências: exatamente as do Portal (M2 de R-0014) **menos**
  `@angular/service-worker` e `axe-core` continua (a11y no TestBed). **O maestro cria o scaffold
  de configuração e roda `pnpm install` no checkpoint de dependências (método §4.18) antes de
  liberar Inspector e Engineer do CTG-0002a**; o `pnpm-lock.yaml` entra no commit do grupo.
- **M2 — `pnpm check`.** Raiz `package.json`: acrescentar ao fim
  `&& pnpm --filter @detran/rait-web lint && pnpm --filter @detran/rait-web test && pnpm --filter @detran/rait-web build`
  (`typecheck` já entra por `pnpm -r --if-present run typecheck`). O job `foundation` do CI já roda
  `pnpm check`; medir a duração no primeiro PR do CTG-0002a e, se ultrapassar o tempo do job, abrir
  job próprio `rait-web` — nunca remover o app do gate.
- **M3 — Estrutura (spec §12, fixada).** `src/app/{core,data,shared,features,forms,i18n,screens}`;
  `app.routes.ts` exporta `RAIT_ROUTES: Routes`; **`app.route-manifest.ts` exporta
  `RAIT_ROUTE_MANIFEST`** (uma entrada por rota de `rait-web-frontend.md` §4 — 72 rotas —:
  `{ path, screen: 'T-nn' | null, sheet: 'IU-RAIT-nnn' | null, module, roles: readonly
DetranRoleCode[] | 'all', kind: 'page' | 'layout' | 'redirect', uc: readonly string[],
journeys: readonly string[], resolver: string | null }`), transcrito de
  `work/rounds/R-0012/route-manifest.md` (TASK-0001). É a tabela que os testes rota × papel e
  tela ↔ ficha ↔ rota ↔ i18n verificam. Módulos lazy montados em `path: ''` com `canMatch` pelo
  primeiro segmento (`ownsFirstSegment`, padrão do Portal); `features/<modulo>/<modulo>.routes.ts`
  para os 15 módulos da §2 (`painel`, `fila`, `caso`, `protocolo`, `assinatura`, `autoridade`,
  `colegiado`, `gestao`, `organizacao`, `integracoes`, `financeiro`, `arquivo`, `auditoria`,
  `admin`, `conta`); `core/` = shell, guards, `session.facade`, `sse.service`, `shortcut.service`,
  `error-boundary`, `role-home` (redirect de `/`), `title.strategy`, `runtime-config`.
- **M4 — Guardas (spec §3).** `raitAuthGuard` (sessão STYNX ativa; senão `stynxAuthGuard` do kit
  redireciona ao login), `roleGuard(roles)` (`CanMatchFn` + `CanActivateFn`): papéis do principal =
  união das claims `cognito:groups` e `roles` de `StynxSessionService.state().claims` — **a mesma
  fonte do backend** (`backend/app/src/detran-runtime.ts` `STYNX_COGNITO_ROLE_CLAIMS`,
  default `cognito:groups,roles`); sem interseção → `UrlTree('/sem-permissao')` (rota auxiliar
  fixada, `screen: null`, renderiza `DetranErrorStateComponent` com `rait.errors.forbidden`);
  `caseAccessGuard` fica **`todo` citando R-0007 CTG-0004** (exige o endpoint de acesso ao caso);
  a rota de caso escolhe a aba inicial por papel via `RoleHomeRedirect`-like resolver
  (analista → `triagem`/`dossie`; autoridade → `decisao`; relator → `dossie`; demais → `resumo`).
  Botões de ação: `*stynxHasPermission="'inf:rait-<recurso>:<ação>'"` com as chaves de
  `RAIT_COMMAND_RULES` (`policy.ts`), nunca tabela paralela. Papéis por rota: exatamente a coluna
  "papéis" da §4 (com `todos` = qualquer papel canônico do RAIT + `integration-operator`,
  `AUDITOR`, `agency-admin`; `todos com acesso` = idem, `caseAccessGuard` pendente).
- **M5 — i18n (adenda A1, abaixo).** Catálogo único `src/app/i18n/rait.pt-BR.json` = cópia
  integral da semente `docs/framework/arch/i18n/rait.pt-BR.json` (349 chaves, **nenhuma
  renomeada**, glossário §2.2) **mais** os namespaces novos do app: `rait.shell`, `rait.states`,
  `rait.screens`, `rait.forms`, `rait.legal`, `rait.a11y`, `rait.nav` (já na semente). Placeholders
  na sintaxe STYNX `{x}`. Allowlist (`parameter-catalogue.md` §Namespaces i18n) ganha **somente
  namespaces em minúsculas** válidos pela gramática `[a-z][a-z0-9_]*`: `rait.action`, `rait.common`,
  `rait.errors`, `rait.nav`, `rait.role`, `rait.instance`, `rait.decision`, `rait.channel`,
  `rait.shell`, `rait.states`, `rait.screens`, `rait.forms`, `rait.legal`, `rait.a11y` (App
  `apps/rait/web`, Catálogo `src/app/i18n/rait.pt-BR.json`, Decisão `OD-P46`). Os namespaces de
  token da semente em camelCase (`rait.caseState`, `rait.sessionState`, `rait.infractionState`,
  `rait.infractionSubstate`, `rait.riskFlag`, `rait.memberStatus`, `rait.orgState`,
  `rait.closureMotive`) **não são allowlistáveis** (gramática) e `rait.timer` **colide** com as
  chaves de parâmetro `rait.timer.*` (fail-closed do verificador, teste
  `tools/parameters/tests/verify-usage.test.mjs:96`): esses nove namespaces só aparecem em código
  **por composição** `'<ns>.' + token` (glossário §2.1), nunca como literal estático de ≥ 2 pontos
  em `apps/rait/web/**/*.ts` (specs inclusive — o verificador varre `src/**`). Regra ESLint local
  `rait/no-static-token-i18n-key` (CTG-0002c) prova a proibição; até lá, o `verify:parameter-catalogue`
  do `pnpm check` é o sensor. Toda edição do catálogo de parâmetros é seguida de
  `pnpm parameters:generate` (lição 3).
- **M6 — Fichas (WP-D).** 63 fichas `docs/framework/product/domains/inf/rait/screens/IU-RAIT-002.md`
  … `IU-RAIT-064.md`, **uma por rota com página** da §4 (72 rotas − 9 raízes de grupo/redirect:
  `/`, `/colegiado/:orgao`, `/gestao`, `/organizacao`, `/integracoes`, `/financeiro`, `/arquivo`,
  `/auditoria`, `/admin`; `/casos/:id` recebe ficha por ser o layout T-04 com `CaseHeader`).
  Mapa rota → id fixado em `route-manifest.md` (TASK-0001): ids contíguos por lote (A: 002…018, B: 019…038, C: 039…064, tabela de tarefas) e, dentro de cada lote, na ordem da §4. Front-matter:
  `id`, `title`, `status: draft`, `apps: [rait]`, `sources` (REF-* citadas pelas fontes),
  `updated`; corpo com as dez seções do padrão do Portal (Identidade — com **rota e id de tela
  T-nn**, Acesso — papéis da §4 e chave de política, Entrada, Dados — resolver e clientes gerados,
  Estados — carregando/vazio/erro com códigos de `rait-error-catalog.md`, Comandos — ações da §7
  com `recurso:ação`, pré-estado → pós-estado da §6.6 e nota "endpoint de comando: R-0007
  CTG-0004" quando pendente, Saída, Segurança/LGPD — campos suprimidos por papel
  ([RN-RAIT-134], [RN-RAIT-137]), Acessibilidade — atalhos §10, Testes — `AC-RAIT-*`) + seção
  "Chaves i18n" (`rait.screens.<slug>.*` que a tela usa; slug = caminho sem `/` e sem `:`, com `-`)
  - "Componentes compartilhados" (§5.2). `IU-RAIT-001` não muda (`approved`). Rotas de módulo
    pendente (organizacao/escala|jeton, integracoes/_, financeiro/_, admin/*, auditoria/exportacoes)
    têm ficha com estado "indisponível nesta versão" e a dependência de `rait-web-frontend.md` §11.
    Baseline do KB: `artifactIdCount` 675 → 738 no mesmo commit do último lote.
- **M7 — Ordem, CTGs e PRs.** CTG-0001 (fichas: TASK-0002/0003/0004) → PR 1, sem upstream;
  CTG-0002 dividido em **três subgrupos acoplados com PR próprio** (R-0014 CTG-0003a/b/c):
  **CTG-0002a** (scaffold, `core/`, manifesto e árvore das 72 rotas com placeholders, guardas,
  shell, SSE, atalhos, error boundary, i18n + allowlist, `pnpm check`) → PR 2; **CTG-0002b**
  (`shared/` 22 componentes, `data/api` + `data/facades`, páginas por módulo) → PR 3;
  **CTG-0002c** (16 schemas de formulário, `rait-web-forms.md`, regras ESLint locais) → PR 4;
  docs de fechamento (TASK-0013) junto do PR 4. Cada CTG tem **Architect explícito** (contrato em
  `contracts/`), Inspector e Engineer; o CTG seguinte só escreve depois do merge do anterior ou em
  branch empilhado `orchestra/rait-web-<ctg>`; nunca commits novos no branch de um PR aberto.
- **M8 — Comandos pendentes (Owner, PR #78).** Facades expõem os métodos de comando com a
  assinatura fixada pelo contrato do CTG-0002b, corpo `throw new RaitCommandUnavailableError(
'<recurso>:<ação>')` marcado `// todo(R-0007 CTG-0004): ligar ao cliente gerado de
BP-INF-RAIT-<MOD>-001.commands`; o `ErrorBoundary` mapeia esse erro a `rait.common.unavailable`.
  Nenhum DTO de comando escrito à mão; nenhum cliente fora de `packages/api-clients/src/generated`
  (`pnpm contracts:clients`). Testes dos métodos de comando: `it.todo('… — R-0007 CTG-0004')`,
  com a OD citada (regra "nunca skip sem OD").
- **M9 — Camada de dados.** `src/app/data/api/<modulo>.client.ts` (`case`, `worklist`, `session`,
  `org`, `integration`, `collection`, `infraction`) = wrappers tipados sobre `HttpClient` com os
  tipos `paths`/`components` de `@detran/api-clients` (`BpInfRaitCase001` etc.); leitura
  `list/get` com `{ items, total, page, pageSize }`; `ETag` guardado por id para `If-Match`;
  `Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>` (R-0014 M17) reservada para os
  comandos. Facades por feature (`CaseFacade`, `QueueFacade`, `SessionFacade`, `RadarFacade`,
  `OrganizationFacade`, `ProtocolFacade`, `SigningFacade`, `ArchiveFacade`, `AuditFacade`):
  `signal`s de leitura, cache por id com TTL curto, invalidação por evento SSE.
- **M10 — SSE.** `SseService` assina `GET /v1/inf/rait/stream` (`rait-events-sse-contract.md` §3:
  `?topics=`, `Last-Event-ID`, heartbeat 20 s, descarte por `aggregate.version`), reconexão com
  backoff e **fallback por polling de 15 s** após duas falhas em 60 s (spec §8); o transporte é
  injetável (`RaitStreamTransport`, stub nos testes — padrão `portal-stream-transport.stub.ts`).
  Enquanto o endpoint não existe (spec §11), a UI mostra banner `rait.states.stream_unavailable`
  e continua por polling.
- **M11 — Formulários (WP-E).** `src/app/forms/<nome>.schema.ts`, 16 nomes em kebab da §9:
  `intake-fisico`, `triagem`, `diligencia`, `minuta`, `decisao-autoridade`, `parecer-voto`,
  `lote-sorteio`, `pauta`, `sessao-ao-vivo`, `desistencia`, `escala`, `mandato`, `reatribuicao`,
  `ato-suspensao`, `parametro`, `exportacao`; cada arquivo exporta `<Nome>Schema` (**zod**, mesma
  decisão de R-0014 M12) e `<NOME>_GATE: FormGate = { preState, roles, preconditions, command,
postState, errorCodes }` transcrito de §6.6/§7/§9 + `rait-error-catalog.md`; cabeçalho do arquivo
  com a tabela do gate; consolidado em `docs/framework/arch/rait-web-forms.md` (Architect do
  CTG-0002c). Validação de forma só orienta; tempestividade e prazos são **somente leitura**
  ([RN-RAIT-005]). Campos sem fonte → `source_pending`/OD, nunca valor.
- **M12 — Regras ESLint locais.** `apps/rait/web/eslint/local-rules.js` (plugin `rait`),
  ligadas no `eslint.config.js` do app: `rait/no-client-deadline-math` ([RN-RAIT-005]: proíbe
  `Date.now()`, aritmética sobre `Date`/`getTime()` e chamadas `add|sub|differenceIn*Days` fora de
  `src/app/testing`) e `rait/no-static-token-i18n-key` (A1). Casos negativos pelo Inspector com
  `RuleTester` do ESLint em vitest (`src/app/lint/*.spec.ts`).
- **M13 — Páginas por nível (WP-F "esqueleto").** O contrato do CTG-0002b fixa, por rota, o nível
  entregue nesta rodada: **L2** (página real com leitura por facade + componentes §5.2 + formulário
  do WP-E quando houver; comando `todo`): painel, fila, caso (11 abas), protocolo, assinatura,
  autoridade, colegiado, gestao/radar+incidentes, arquivo, auditoria/trilha, conta; **L1**
  (lista/leitura pelos clientes CRUD existentes de `BP-INF-RAIT-ORG-001`/`WORKLIST`): gestao
  (producao, capacidade, turmas, qualidade), organizacao (membros, pools); **L0**
  (`DetranErrorStateComponent` "indisponível nesta versão" com a dependência da §11):
  organizacao/escala, organizacao/jeton, integracoes/_, financeiro/_, admin/*,
  auditoria/exportacoes. Nenhuma rota fora da §4; nenhum mock silencioso.
- **M14 — Testes de roteamento.** Para **cada** uma das 72 rotas: papel mínimo → ativa
  (`data.screen` correto); cada papel canônico omitido → `UrlTree('/sem-permissao')`; sem sessão →
  redireciona ao login (presença **e** ausência, §4.8/§4.13). Um app por arquivo de spec
  (A18 de R-0014); asserções por conjunto de status e escapes condicionais vedados (A15).

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                                                                                 | Depende de                          | CTG         | Entrega                                                                                                                                                                                                                                                              |
| --------- | -------------------- | ------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus / alto    | `MOD-r12-route-manifest`, `MOD-r12-contracts-2a`                                                                     | —                                   | CTG-0002a   | `route-manifest.md` (72 rotas: papéis, tela, ficha IU-RAIT-nnn, módulo, kind, UC, jornadas, resolver, nível M13), `contracts/CTG-0002a.md` (core: guardas, session facade, shell, SSE, atalhos, error boundary, i18n `rait.shell/states/a11y`, allowlist, critérios) |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-rait-screens-A`                                                                                         | TASK-0001                           | CTG-0001    | fichas **lote A** (painel, fila, casos, conta: IU-RAIT-002…018)                                                                                                                                                                                                      |
| TASK-0003 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-rait-screens-B`                                                                                         | TASK-0001                           | CTG-0001    | fichas **lote B** (protocolo, assinatura, autoridade, colegiado: IU-RAIT-019…038)                                                                                                                                                                                    |
| TASK-0004 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-rait-screens-C`, `MOD-kb-manifest`                                                                      | TASK-0001                           | CTG-0001    | fichas **lote C** (gestao, organizacao, integracoes, financeiro, arquivo, auditoria, admin: IU-RAIT-039…064) + `artifactIdCount` 675 → 738                                                                                                                           |
| TASK-0005 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-rait-web-tests-core`, `MOD-tools-parameters-tests`                                                              | TASK-0001, merge PR 1, install (M1) | CTG-0002a   | specs: rota × papel (72 rotas, presença/ausência, M14), tela ↔ ficha ↔ rota ↔ i18n, chaves i18n (tokens dos contratos e códigos do catálogo → chave, glossário §2.8), guardas, SSE (fallback), error boundary; caso negativo da allowlist `rait.*`                   |
| TASK-0006 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-rait-web-core`, `MOD-parameter-catalogue-doc`                                                                   | TASK-0005                           | CTG-0002a   | `main.ts`, `app.routes.ts`, manifesto, `core/`, placeholders das 72 rotas, `i18n/rait.pt-BR.json`, allowlist + `pnpm parameters:generate`, `pnpm check` (M2); testes do Inspector verdes                                                                             |
| TASK-0007 | Architect            | architect-blueprint | Opus / alto    | `MOD-r12-contracts-2b`                                                                                               | TASK-0006 (merge PR 2)              | CTG-0002b   | `contracts/CTG-0002b.md`: assinaturas dos 22 componentes §5.2, clientes/facades (M8/M9), páginas por rota e nível (M13), fixtures JSON, critérios                                                                                                                    |
| TASK-0008 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-rait-web-tests-data`, `MOD-rait-web-tests-shared`, `MOD-rait-web-tests-core` (só o `it` de C-2A-27)             | TASK-0007                           | CTG-0002b-1 | specs da camada de dados (clientes com `HttpTestingController`, ETag, facades com cache/invalidação SSE, `it.todo` de comando com OD) e dos 26 componentes de `shared/` (estados, a11y, teclado)                                                                     |
| TASK-0009 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-rait-web-data`, `MOD-rait-web-shared`, `MOD-rait-web-core-shell-search`, `MOD-rait-web-i18n`, `MOD-packages-ui` | TASK-0008                           | CTG-0002b-1 | `data/` (modelos, clientes, facades, busca do shell) e `shared/` (26 componentes) até os testes passarem; `packages/ui` só por adenda                                                                                                                                |
| TASK-0014 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-rait-web-tests-features`, `MOD-rait-web-tests-core` (só os `it` de C-2A-11/22, C-2B-81/82)                      | TASK-0009 (merge PR 3a)             | CTG-0002b-2 | specs das 50 páginas e das rotas por módulo, matriz de autorização ação × papel (presença/ausência), atualização de C-2A-11/C-2A-22                                                                                                                                  |
| TASK-0015 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-rait-web-features`                                                                                              | TASK-0014, TASK-0016                | CTG-0002b-2 | `features/<modulo>/pages/*` (50 páginas) e rotas por módulo até os testes passarem                                                                                                                                                                                   |
| TASK-0016 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-rait-web-i18n`                                                                                                  | TASK-0009 (merge PR 3a)             | CTG-0002b-2 | chaves i18n das páginas: 44 `confirm.*` (texto das fichas §6) e (P) do contrato §9.2 ausentes, no catálogo do app (A12)                                                                                                                                              |
| TASK-0010 | Architect            | architect-blueprint | Opus / alto    | `MOD-r12-contracts-2c`, `MOD-rait-web-forms-doc`                                                                     | TASK-0015 (merge PR 3b)             | CTG-0002c   | `contracts/CTG-0002c.md` + `docs/framework/arch/rait-web-forms.md`: 16 formulários campo a campo, gates, códigos de erro, regras ESLint (M11/M12)                                                                                                                    |
| TASK-0011 | Inspector            | inspector-tests     | Opus / médio   | `MOD-rait-web-tests-forms`, `MOD-rait-web-tests-lint`                                                                | TASK-0010                           | CTG-0002c   | specs dos 16 schemas (válido/inválido/condicional, gate) + `RuleTester` das duas regras (casos negativos)                                                                                                                                                            |
| TASK-0017 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-rait-web-i18n`                                                                                                  | TASK-0010, merge PR 3b              | CTG-0002c   | 152 chaves `rait.forms.*` do contrato §7 no catálogo do app (A12)                                                                                                                                                                                                    |
| TASK-0012 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-rait-web-forms`, `MOD-rait-web-lint`, `MOD-rait-web-eslint-config`                                              | TASK-0011, TASK-0017                | CTG-0002c   | 16 `*.schema.ts` com cabeçalho de gate, `eslint/local-rules.js`, `eslint.config.js`; testes verdes                                                                                                                                                                   |
| TASK-0013 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-docs-rait-arch`                                                                                                 | TASK-0012                           | CTG-0002c   | `rait-build-pack.md` §WP-D/E/F executados (gates reais), `rait-web-frontend.md` §12/§13, `open-decisions-rait.md` §G (OD-R12-*), backlog                                                                                                                             |

CTG-0001 = 0002/0003/0004 (fichas, PR 1). CTG-0002a = 0001/0005/0006 (PR 2). CTG-0002b-1 =
0007/0008/0009 (PR 3a); CTG-0002b-2 = 0007/0016/0014/0015 (PR 3b; A8, A12). CTG-0002c = 0010/0011/0012 + 0013 (PR 4). Paralelismo: 0002/0003/0004
juntas (fronteiras disjuntas; só 0004 toca o manifesto do KB); o resto é serial por tríade.

**Prompts por fase:** os prompts de TASK-0001…0004 são compostos no bootstrap e passam pela
prompt-review 1; os prompts de cada tríade seguinte (0005/0006, 0008/0009, 0011/0012, 0013) são
compostos depois de o contrato do Architect do CTG existir e passam por prompt-review própria
(ciclos restritos, R-0014).

**Checkpoint de dependências (maestro, Engineer):** depois do merge do PR 1 e antes de TASK-0005,
o maestro cria o scaffold de configuração de `apps/rait/web` (M1, cópia do Portal), roda
`pnpm install`, guarda o `pnpm-lock.yaml` para o commit do CTG-0002a, estende `pnpm check` (M2)
e prova `pnpm --filter @detran/rait-web lint|typecheck|build` sobre o esqueleto vazio; só então
libera o Inspector. `pnpm contracts:clients --check` já é parte de `contracts:check` (verde na
base); os clientes RAIT de R-0007 CTG-0001/0002 já estão em `packages/api-clients`.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → `knowledge-base check: OK (738 artifacts, 446 canonical tokens)`
  (675 + 63 fichas), com o baseline atualizado no mesmo commit; `pnpm docs:kb:publish-check` → OK;
  `pnpm format:check` → sem diffs.
- `pnpm --filter @detran/rait-web typecheck`, `lint`, `test`, `build` → verdes (scripts criados no
  checkpoint de dependências; até existirem, o gate provisório é `pnpm --filter @detran/ui build`).
- `pnpm --filter @detran/ui test` e `build` → verdes (se `packages/ui` for tocado, só por adenda).
- teste de roteamento (M14): cada uma das 72 rotas com o papel mínimo → ativa; cada papel canônico
  omitido → `/sem-permissao`; sem sessão → login; 100 % das rotas do manifesto.
- teste tela ↔ ficha ↔ rota ↔ i18n: toda entrada `sheet` do manifesto tem arquivo IU-RAIT-nnn cujo
  cabeçalho cita a rota; toda chave `rait.screens.*` listada na ficha existe no catálogo; todo token
  dos contratos gerados (`state`, `instance`, `timer_code`, `flag`, `decision_kind`, `channel`) e
  todo código de `rait-error-catalog.md` tem chave (glossário §2.8).
- `pnpm verify:parameter-catalogue` → `OK (… i18n namespaces, 0 errors)` com as linhas `rait.*`;
  `pnpm parameters:test` → caso negativo `rait.timer` continua vermelho por colisão.
- `pnpm check` → verde (incluindo o app novo); `pnpm backend:test:ci` inalterado.

## Mapa entregável → definições

| Entregável  | Definição                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| fichas      | [IU-RAIT-001]; `rait-web-frontend.md` §4–§6; `rait-web-structure-diagrams.md` (D2–D5); `rait-web-journeys/JW-01…12`; [JRN-RAIT-001…004]     |
| formulários | `rait-web-frontend.md` §9 (16 formulários); `rait-error-catalog.md` §3–§4; [RN-RAIT-001…143]; tabelas de transição (caso, sessão, infração) |
| hierarquia  | `rait-web-frontend.md` §2, §4, §5, §12, §13; diagramas D1–D7; ADR-0006; ADR-0015; `detran-ui-guide.md`                                      |
| i18n        | `rait-i18n-glossary.md`; `docs/framework/arch/i18n/rait.pt-BR.json`                                                                         |
| clientes    | contratos de comando (R-0007) via `contracts:clients`                                                                                       |
| testes      | `rait-test-strategy.md`                                                                                                                     |

## Riscos

- `apps/*/*` já está no `pnpm-workspace.yaml`; o primeiro `pnpm install` após criar o pacote muda
  o `pnpm-lock.yaml` (commit separado "chore(deps)").
- Angular 22 (`OnPush` default, router `always`, TS 6): notas em `wp0-stynx-1-3-1-migration.md` §7.
- Fichas são corpus de produto: linguagem e tokens canônicos do KB; nenhuma tela fora da §4.

## Lições aplicadas (método §4.8–§4.18, `waves.md` §Histórico)

- Transcrição de fichas, contratos, i18n e docs é ato de **Architect** (`transcriber-docs`); tarefas assim aparecem como "Architect (transcr.)".
- Nenhum Engineer ou transcriber entrega o teste do próprio artefato: contratos → `contracts:test` pelo Inspector; fichas/i18n → teste tela ↔ ficha ↔ rota pelo Inspector.
- Ciclos de review a partir do segundo restritos aos itens corrigidos; contradições contrato × código resolvidas pelo Architect por adenda numerada em `plan.md` antes de redespachar.
- O CTG seguinte só começa a escrever depois do merge do anterior ou nasce em branch empilhado; nunca commits novos no branch de um PR aberto; integrar `main` por merge, nunca `--force`.
- Listas de leitura dos workers fechadas e completas (DDL gerado, blueprint, `seed.sh`, fixtures, specs de referência como `backend/app/tests/e2e/policy-routes.e2e.spec.ts`); lacuna aqui foi `reference-gap` em R-0010.
- Pacote de workspace novo: o maestro roda `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector (CI é `--frozen-lockfile`).
- Chaves i18n não são parâmetros (OD-P46): a allowlist já existe em `parameter-catalogue.md` §Namespaces i18n; acrescentar as linhas `rait.<namespace>` antes de `i18n/pt-BR.json` entrar em código; placeholders na sintaxe STYNX `{x}`.
- Testes de roteamento cobrem papéis com e sem acesso (presença e ausência), não só o papel mínimo.
- O job `foundation` já constrói `apps/portal/web`; adicionar um segundo app pode estourar o tempo do job — medir e, se preciso, job próprio, nunca enfraquecer o gate.

## Concorrência

Registrado no bootstrap (2026-09-21, `git log --oneline -30 origin/main`, `gh pr list --state
merged --limit 20`, `gh pr list --search orchestra/`):

- `origin/main` = 2cbcb163 (PR #77). Em `main`: R-0003…R-0006, R-0008, R-0009, R-0010 (PC-0008),
  R-0014 (PC-0007, PRs #60…#67 — padrão de app e allowlist OD-P46), R-0007 CTG-0001/0002 (PR #69:
  controladores de comando de `rait-case`/`rait-worklist`/`rait-session`), R-0013 CTG-0001 (PR #70)
  e contratos do CTG-0002 (PR #73).
- PR #78 (`docs/r-0012-contracts-note`, plano/prompt desta rodada) **mesclado** em 2026-09-21
  18:42 UTC (46e87d3b); o branch, ainda não publicado, foi rebaseado sobre `origin/main`
  (`git rebase origin/main`, permitido antes do primeiro push) — a importação prévia do PR ficou
  reduzida ao `AUTHORIZATION.md`.
- Branches `orchestra/*` remotos: `orchestra/rait-backend` (R-0007, CTG-0003/0004 em curso — sem PR
  aberto contra `main`), `orchestra/teat-frontends` (R-0013, aberto, workers não disparados; lock
  `packages/ui` livre e tomado por esta rodada). Nenhum PR aberto com lock comum aos grupos desta
  rodada.
- Grupos **liberados para merge**: CTG-0001 (fichas) e CTG-0002a/b/c (app) — o upstream R-0007
  CTG-0004 (contratos de comando) só é exigido para ligar os `todo` de comando (M8), não para o
  merge. Nenhum grupo em base empilhada sobre outra frente.
- **CTG-0002a mesclado**: PR #81 → `026c9fc09d2eb9e1d81b66c1d16c0b5a70ec6923` (2026-09-21; CI 7/7 após
  integrar `main` com R-0016 PR #80 — conflitos na allowlist i18n, gerados e cadeia resolvidos por
  merge; evidência regravada como sequence 2); `audit observe` no sha exato. Pré-condição de
  despacho de TASK-0008/0009 satisfeita.
- **CTG-0002b-1 mesclado**: PR #85 → `72c15ae9e4a609e567cdd4b2386d5d7792582ff5` (2026-09-22; CI 7/7
  após rerun de `backend-kernel` — falha intermitente em `rait-priority-upgrade.integration.spec.ts`,
  teste de R-0007 que este PR não toca e que passa em `main` —; integrado `main` com R-0011 CTG-0001
  PR #83 e DEVAI 1.5.4 PR #84; evidência sequence 3); `audit observe` no sha exato
  (EV-a04b28c82c5b9527). Pré-condição de despacho de TASK-0014/0015/0016 satisfeita.
- **CTG-0002b-2 mesclado**: PR #90 → `19b374614a1c5a18879394454a14e0b49a1e99e5` (2026-09-22; CI 7/7 após rerun de
  `backend-kernel` — mesma falha intermitente de `rait-priority-upgrade` de R-0007 —; `main`
  integrado com R-0013 PR #82, R-0011 PRs #87/#88, DEVAI 1.5.5 PR #89; evidência sequence 4);
  `audit observe` no sha exato. Pré-condição de despacho de TASK-0017/0011/0012 satisfeita.
- `devai round plan --scaffold` respondeu `ROUND_ALREADY_EXISTS` (rodada instanciada pelo PR #31);
  `devai round status --round R-0012` → `0 task(s)`; tarefas entram por `tasks/*.json`.

## Bloqueios

- **B1 (desvio registrado, 2026-09-21).** Prompt-review do CTG-0002a levou 3 ciclos (3 REVIEW → 4
  REVIEW → 5 PASS): o ciclo 4 apontou só um resíduo da correção do ciclo anterior (célula da tabela
  §Tarefas com `MOD-package-json`, que a substituição do maestro não alcançou por espaçamento). O
  prompt §5 manda parar no terceiro ciclo e reportar; o maestro prosseguiu porque o achado era
  residual de edição própria, o veredito final foi PASS e o Owner autorizou "prosseguir até a
  completa finalização" (AUTHORIZATION.md, emenda 1). Reportado no relatório final.

- **B2 (desvio registrado, 2026-09-22).** Prompt-review 10 (par CTG-0002b-2) = FAIL por estrutura de
  fronteira (rubrica 1 e 3: transcrição de i18n atribuída ao Engineer; `shared/**`/`data/**` fora dos
  `target_modules`), não por contradição canônica. Pelo §10 do método (recomendação 7 de R-0009,
  praticada em R-0008/R-0009/R-0014) e pela emenda 1 do Owner, o maestro corrige (A12) e repete o
  ciclo restrito em vez de parar. Reportado no relatório final.

- **B3 (desvio registrado, 2026-09-22).** Prompt-review do TASK-0010 chegou ao terceiro ciclo (12
  REVIEW → 13 REVIEW → 14) porque a edição do maestro entre 12 e 13 falhou silenciosamente (asserção
  de substituição após o Prettier) e a ponte avaliou o texto inalterado; o ciclo 14 avalia as
  correções reais. Mesma justificativa de B1 (emenda 1 do Owner).

- **B4 (desvio registrado, 2026-09-22).** Delivery-review do CTG-0002b-2 chegou ao terceiro ciclo
  (1 REVIEW → 2 REVIEW residual → 3): o ciclo 2 apontou uma única ação (`claim-next`) que a
  iteração 5 do Inspector não desdobrou em três `it`. Mesma justificativa de B1/B3 (emenda 1 do Owner).

## Triagem

- CTG-0002b-2, TASK-0015 it. 1 → 393/3712 testes vermelhos: `sensor-error` ×7 (stub de facade sem
  métodos; lista de arquivos de confirm dialog; caminho do spec de fichas; matriz via router para
  papéis sem acesso; sessão STYNX ausente no harness; harness duplo; fixture sem base legal) +
  `plant-bug` ×1 (NG8102 em `shared/clocks-panel`) → adenda A14 → iteração restrita do Inspector e
  do Engineer.
- CTG-0002b-1, TASK-0009 it. 1 → 33/2307 testes + typecheck vermelhos: `sensor-error` (8 defeitos
  de spec/fixture: render repetido, afterEach sem provider, regex, flush ausente, evento do kit,
  marcador i18n, tipo `any`) + 2 divergências spec × contrato (`emptyWhen`, diretiva de permissão) →
  adenda A10 → iteração restrita do Inspector, depois do Engineer.
- CTG-0002a, TASK-0006 it. 1 → 6/1807 testes + 2 gates vermelhos: `policy-issue` (specs contradizem
  o contrato ou entre si: C-2A-02/09/24/35/63) e `sensor-error` (C-2A-45 sem shell/waitFor; literais
  de evento no spec do SSE; teste 7 da allowlist duplica linha) → adenda A7 → iteração restrita do
  Inspector; gates rodados pelo maestro em seguida (§7).

- CTG-0001, delivery-review 1 → REVIEW: 13 fichas com `apps: [rait, portal|dashboard|teat]` contra
  M6 (`apps: [rait]`). Triagem: `plant-bug` de transcrição (lotes B/C). Correção mecânica aplicada
  pelo maestro (Architect, dono de `docs/`) por sed no front-matter — parcimônia (§5) — em vez de
  redespachar; gates `docs:kb:check`/`format:check` verdes; ciclo 2 restrito.

## Adendas

- **A1 — Namespaces i18n × verificador de parâmetros (Architect, 2026-09-21).** A semente
  `docs/framework/arch/i18n/rait.pt-BR.json` e o glossário `rait-i18n-glossary.md` §1 usam
  namespaces camelCase (`rait.caseState`, …) e `rait.timer.*`. A allowlist do
  `parameter-catalogue.md` §Namespaces i18n só admite `<prefixo>.[a-z][a-z0-9_]*` e rejeita
  (fail-closed) namespace que seja prefixo de chave de parâmetro — `rait.timer` colide com
  `rait.timer.T-VOTO` etc. Como o glossário §2.2 proíbe renomear chaves sem revisão do Owner,
  fica decidido (M5): a semente entra **inalterada** no app; os nove namespaces de token são
  endereçados só por composição (`'rait.caseState.' + state`), proibida por regra ESLint local
  (M12); a allowlist recebe apenas os namespaces em minúsculas. Proposta ao Owner registrada como
  **OD-R12-001**: renomear na semente os namespaces de token para `snake_case`
  (`rait.case_state`, `rait.timer_code`, …) numa transcrição futura, fechando a exceção.
- **A2 — Rotas auxiliares (Architect, 2026-09-21).** `/sem-permissao` (destino do `roleGuard`) e
  `/auth/callback` (retorno OIDC, padrão do Portal) entram no manifesto com `screen: null`,
  `sheet: null`, fora da contagem de fichas (M6) e fora da matriz papel × rota (M14) — provadas
  pelos testes das guardas.

- **A3 — Ratificação do contrato CTG-0002a (Architect/maestro, 2026-09-21).** `RaitRouteEntry` ganha o
  campo `level: 'L0' | 'L1' | 'L2' | null` além dos campos de M3 (justificado por M13 e pela coluna
  `level` do manifesto); ratificado. As OD-R12-002…011 propostas em `contracts/CTG-0002a.md` §12
  entram em `open-decisions-rait.md` §G pela TASK-0013; até lá valem os defaults ali declarados.

- **A4 — Leitura das fichas pelo `kb.ts` (Architect/maestro, 2026-09-21).** As 63 fichas
  entregues não trazem "nome visível:"; `contracts/CTG-0002a.md` §10 `readSheet` passa a ler:
  `path` da linha `` ^Ficha da rota `([^`]+)` `` **normalizando a barra inicial** (20 fichas do
  lote B têm `/`); `screen` = primeiro `T-\d{2}` dessa linha ou da seção "## 1. Identidade" (senão
  `null`); `title` = texto entre aspas da linha ``- `rait.screens.<slug>.title` — "…"`` da seção
  "## Chaves i18n" (presente nas 63); `i18nKeys` = todos os `` `rait.screens.…` `` dessa seção.
  C-2A-53/56 comparam com esses valores. Texto de `rait.screens.<slug>.title` no catálogo = o da
  ficha; para as 11 rotas sem ficha, a lista do contrato §9.

- **A5 — Âncora do skip-link e contagem de códigos (Architect/maestro, 2026-09-21).** (a) C-2A-26
  cita `#main`, mas o `DetranAppShellComponent` do kit (`packages/ui/src/lib/detran-shell.component.ts`
  linha 35) renderiza `<main id="detran-content">`: o link `rait.a11y.skip_to_content` aponta para
  **`#detran-content`** (nunca duplicar a âncora); o Inspector ajusta o literal do teste (iteração
  restrita). (b) `rait-error-catalog.md` §3 tem **131** códigos únicos, não 132: `RAIT_ERROR_CODES`
  e `readErrorCodes()` são comparados por conjunto; o número do contrato é informativo.
- **A6 — Fixtures auxiliares (Architect/maestro, 2026-09-21).** `src/testing/axe.spec-helper.ts`
  (fatoração do `expectNoSeriousA11yViolations`) é admitido além dos 8 arquivos do contrato §10;
  `router-harness.ts` fornece `STYNX_I18N_OPTIONS` com catálogo vazio para os specs de roteamento.

- **A7 — Reconciliação contrato × specs × Angular 22 (Architect/maestro, 2026-09-21; triagem
  dos 8 bloqueios de TASK-0006 it. 1 — todos `policy-issue`/`sensor-error` nos specs, nenhum
  `plant-bug` de produção).** (a) C-2A-02: contiguidade dos ids de ficha é **por lote** (A: painel,
  fila, casos, conta = 002…018; B = 019…038; C = 039…064), não na ordem global do manifesto — o
  `it` agrupa por lote. (b) C-2A-09 / contrato §3: Angular 22 proíbe `redirectTo` + `canMatch`
  (NG04014); a aba inicial de `/casos/:id` é **uma** rota `''` `pathMatch: 'full'` com
  `redirectTo` funcional (`caseInitialTabFor(canonicalRoles)`, precedência da tabela C) — o `it`
  verifica uma rota `''` com `redirectTo` função; o comportamento é C-2A-22. (c) C-2A-24: raiz de
  grupo negada → `UrlTree` `/sem-permissao` **com** `?de=<url pedida>` (contrato §4); o `it` compara
  pathname e o query param `de`. (d) C-2A-63: `ForbiddenPage`, `NotFoundPage` e `AuthCallbackPage`
  **não** têm `data-screen` (só placeholders e telas reais); o `it` afirma ausência. (e) C-2A-35:
  após a 2ª falha em 60 s o status é `'polling'` (C-2A-36); o `it` de C-2A-35 afirma
  `'reconnecting'` só após a 1ª falha e a sequência de backoff. (f) C-2A-45 (2º `it`): o harness
  instancia o `RaitShellComponent` (quem registra `go-*`) e aguarda a navegação lazy com
  `vi.waitFor` (padrão de app 9). (g) Specs não podem conter literais `rait.<x>.changed` (candidatos
  do verificador): compor com `RAIT_STREAM_EVENT_PREFIX` exportado por `core/sse.service.ts`.
  (h) `allowlist-rait.test.mjs` teste 7: a tabela real já contém `rait.screens`; o caso positivo usa a
  tabela real sem inserir linha. Tipos `screen`/`sheet` como `string | null` ratificados.

- **A8 — CTG-0002b em dois pares (Architect/maestro, 2026-09-21; emenda a M7).** O contrato
  `contracts/CTG-0002b.md` (91 critérios; 50 páginas, 26 componentes, 8 clientes, 11 facades, 64
  comandos `todo`, matriz 45 × 13) excede uma tarefa de worker (R-0014: pares 3a/3b/3c). O grupo
  passa a **dois pares com PR próprio**: **CTG-0002b-1** = camada de dados (`data/**`), 26
  componentes de `shared/`, `core/shell-search.ts` (C-2B-01…60, 84…87 e os gates 88…91 no que
  lhes cabe) — TASK-0008 Inspector / TASK-0009 Engineer; **CTG-0002b-2** = 50 páginas + rotas por
  módulo + matriz de autorização por ação × papel + atualização de C-2A-11/C-2A-22 (C-2B-61…83,
  gates) — TASK-0014 Inspector / TASK-0015 Engineer. TASK-0007 é o Architect dos dois pares.
  Ratificados os defaults de OD-R12-018…035 do contrato §9.3 (em especial 018: `list*` gerados sem
  query/envelope → estreitamento e paginação no cliente **sem reordenar**; 024/025: limites do kit
  sem reimplementar primitivos).

- **A9 — `facade.stub.ts` (Architect/maestro, 2026-09-21).** O contrato CTG-0002b §7 atribui
  `src/testing/facade.stub.ts` (`readSlotStub`, `listFacadeStub`, `commandRunnerStub`, `stubFacade`,
  `pageProviders`) ao Inspector, mas o prompt de TASK-0008 (par 1) não o listou; ele é consumido só
  pelos specs de páginas → passa ao Inspector do par 2 (TASK-0014). Os specs de `shared/` do par 1
  compõem o gate por papel com `createStynxSessionStub` + `ROLE_PERMISSIONS_FIXTURE` (ratificado).

- **A10 — Reconciliação do par CTG-0002b-1 (Architect/maestro, 2026-09-21; triagem dos 8
  bloqueios de TASK-0009 it. 1: todos `sensor-error` nos specs/fixtures, nenhum `plant-bug`).**
  Inspector (iteração restrita): (a) `render()` repetido no mesmo `it` → `TestBed.resetTestingModule()`
  antes de cada `configureTestingModule` (ou um `it` por estado), assinando outputs antes de
  re-renderizar (21 `it` de `shared/`); (b) `afterEach` com `HttpTestingController.verify()` só em
  `describe` que configura o módulo (C-2B-13/14/15/33); (c) regex de `readPolicyCommandRules`
  aceita `]\s*,?\s*]` (triplas multilinha com vírgula final: `reassign`, `declare`,
  `acknowledge-alert`) → 60 chaves; (d) C-2B-28/30: flush de `GET cases/<id>` (+ `decisions` no
  signing) que o contrato §4.3 prescreve; (e) C-2B-29: após `agenda-item.changed` o `refresh()` do
  bundle refaz as 4 listas — flush delas; (f) C-2B-45: o output do kit é `dismissed`; (g) C-2B-58:
  com `markerI18nModule` afirma-se o marcador/parâmetro `{seconds}`, não `'15'`; (h)
  `queue-table.component.spec.ts:123`: `const host: HTMLElement = allowed.nativeElement`; (i)
  `stynx-session.stub.ts` (fixture do CTG-0002a, acréscimo permitido) ganha `active$:
Observable<StynxSessionState>` (kit 1.3.1 linha 162) para que `*stynxHasPermission` seja
  instanciável; (j) C-2B-22/31: o contrato §4.1 prevalece — lista `[]` → `status 'empty'`
  (`emptyWhen = total === 0`); as 11 asserções passam a `'empty'`. Engineer (iteração restrita):
  remover `shared/has-permission.directive.ts` e usar `*stynxHasPermission` do kit (M4;
  `detran-ui-guide.md` §2 — nenhuma diretiva paralela); `ListFacade`/`createListFacade` com
  `emptyWhen: total === 0`; manter `AuditFacade.createExport(Partial<…>)`, `claimNext(…, ifMatch =
null)` e as chaves reais de `RAIT_COMMAND_RULES` no `InquiryCard` (OD-R12-026). Extensões
  registradas: OD-R12-025 (`StynxTableColumn` não reexportado → `shared/table-column.ts`),
  OD-R12-028 (chaves (P) de cabeçalhos de tabela e "campo obrigatório" até `rait.forms.*`).

- **A11 — Matriz de autorização nos componentes com gate (Architect/maestro, 2026-09-22;
  delivery-review CTG-0002b-1 ciclo 1).** (a) Para cada ação com `*stynxHasPermission` nos
  componentes deste par (`CaseHeader`, `InquiryCard`, `DecisionPanel`, `QueueTable`), o spec gera um
  `it` por papel canônico (13) a partir de `ROLE_PERMISSIONS_FIXTURE`: presença para todo papel
  concedido, ausência para todo papel omitido (método §4.8/§4.13; nunca um par exemplo). (b)
  C-2B-44 corrigido: `policy.ts` concede `inf:rait-impediment:declare` a `rait-rapporteur`,
  `rait-signing-authority` **e `rait-analyst`** — `rait-analyst` não vê `sign`/`return-draft`, mas
  **vê** `impede`; o `it` "nenhum existe" é substituído pela matriz de (a). Inspector em iteração
  restrita; Engineer só se algum componente falhar a matriz.

- **A12 — Fronteiras do par CTG-0002b-2 (Architect/maestro, 2026-09-22; prompt-review 10).** (a) A
  transcrição das chaves i18n das páginas (44 `rait.screens.<slug>.confirm.<x>` com o texto da coluna
  "Confirmação" da ficha §6 e as demais (P) do contrato §9.2 ainda ausentes do catálogo) é ato de
  **Architect (transcrição)** — nova **TASK-0016** (`transcriber-docs`, Sonnet/baixo, lock
  `MOD-rait-web-i18n`), disparada em paralelo ao Inspector TASK-0014 (fronteiras disjuntas); o
  Engineer TASK-0015 só consome as chaves. (b) TASK-0015 escreve somente em `features/**`
  (`MOD-rait-web-features`); qualquer ajuste necessário em `shared/**`/`data/**` vira bloqueio no
  relatório e é tratado pelo maestro por adenda + iteração restrita de um Engineer com esses locks.
  Retroativamente: as chaves (P) que os Engineers do CTG-0002a/0002b-1 acrescentaram ao catálogo
  seguindo os contratos §9 permanecem (já mescladas/revisadas), listadas em OD-R12-008/028 para
  revisão do Owner.

- **A13 — Chaves `confirm.*` (Architect/maestro, 2026-09-22; TASK-0016).** (a) O contrato CTG-0002b
  §9.2 enumera **45** chaves `rait.screens.<slug>.confirm.<x>` e rotula "44": vale a enumeração (45,
  todas com texto sourceado nas fichas §6). (b) O texto transcrito é o **conteúdo** da célula
  "Confirmação" da ficha: as aspas externas são marcação da ficha e **não** entram no valor; a
  pontuação interna, os tokens em backticks e as citações legais dentro do texto permanecem.
  (c) As ações com confirmação nas fichas mas fora da lista do §9.2 (`casos-id-impedimentos.confirm.suspicion/decide`,
  `gestao-radar-caseId.confirm.acknowledge-alert`) ficam para OD-R12-036 (extensão da lista pelo
  Architect do CTG-0002c ou revisão do Owner), não são transcritas agora.

- **A14 — Reconciliação do par CTG-0002b-2 (Architect/maestro, 2026-09-22; triagem dos 8 bloqueios
  de TASK-0015 it. 1: 7 `sensor-error` em specs/fixtures, 1 `plant-bug` em `shared/`).** Inspector
  (iteração restrita 4 de TASK-0014): (1) `src/testing/facade.stub.ts`: `stubFacade`/`pageProviders`
  expõem os métodos `load*`/`find*` (§4.3) e de comando (§3.5) das facades — `load*(…)` delega ao
  `load` do slot, `<comando>(…)` = `command.run('<M8>', …)` (mantém `runMock`), sinais faltantes
  (`casosDaFila`); (2) `features/static-gates.spec.ts` `CONFIRM_DIALOG_FILES` = as 22 páginas que
  importam `StynxConfirmDialogComponent` (lista do relatório de TASK-0015; OD-R12-025); (3)
  `screens/screens.spec.ts` C-2B-81 lê `join(APP_SRC_ROOT, 'app', 'features', …)`; (4) C-2B-69/70:
  a matriz de papéis nas páginas com rota restrita monta o componente isolado por
  `TestBed.createComponent` + `pageProviders(papel)` (não pelo router, que redireciona a
  `/sem-permissao` os papéis sem acesso — isso já é C-2A-13); (5) `app.guards-matrix.presence.spec.ts`
  e `core/guards.spec.ts` C-2A-23/24 provêm `StynxSessionService` (`createStynxSessionStub`) como
  `pageProviders`, porque as páginas reais usam `*stynxHasPermission`; (6) 8 `it` com dois harness
  → `resetTestingModule` ou um `it` por estado (A10 a); (7) `deadlines.page.spec.ts` fixtures com
  `legal_basis` (regra "prazo nunca sem base legal"). Engineer (iteração restrita 2 de TASK-0015,
  lock estendido a **`shared/clocks-panel.component.ts` somente**): corrigir o NG8102 (`?? null`
  sobre índice tipado) para build sem warnings. Ratificados como defaults até R-0007 CTG-0004:
  componentes inteligentes inline, `claimNext` sem `pool_id` (OD-R12-054), rótulos de tokens sem
  namespace pelo nome do campo (OD-R12-053/028).

- **A15 — C-2B-71 completo (Architect/maestro, 2026-09-22; delivery-review CTG-0002b-2 ciclo 1).**
  Para **cada** uma das 45 ações com chave `rait.screens.<slug>.confirm.<x>` (páginas L2), o spec
  da página tem três `it`: o diálogo abre com `message` = texto da chave; `confirm` chama a facade
  (`runMock`) exatamente uma vez com o comando M8 da ação; `dismiss` não chama a facade. Nenhuma
  ação confirmável fica sem os três casos (ex.: `assinatura/:caseId` return-draft e
  declare-impediment). Inspector em iteração restrita; Engineer só se uma página falhar.

- **A16 — Harness do `shortcut.service.spec.ts` (Architect/maestro, 2026-09-22).** O `it` de
  C-2A-45 que monta `RaitShellComponent` sobre `RAIT_ROUTES` reais passa a prover
  `StynxSessionService` (`createStynxSessionStub`), porque as rotas agora carregam páginas reais
  com `*stynxHasPermission` (mesma causa de A14 5); corrige o `Uncaught Exception` NG0201
  intermitente do coletor do Vitest. Ajuste do Inspector (lock `MOD-rait-web-tests-core`), sem
  alterar as asserções.

## Retomada

**Checkpoint 1 — janela 1 (2026-09-21, maestro Fable 5.1).** Orçamento estimado da janela em
`budget.json` acima do limiar de 80 % (≈ 770 k únicos estimados, incluindo os quatro workers e os
quatro ciclos do reviewer) → parada por corte de janela após fechar o CTG-0001 como ponto natural.

- **Concluídas:** TASK-0001 (Architect: `route-manifest.md`, `contracts/CTG-0002a.md`), TASK-0002/
  0003/0004 (63 fichas IU-RAIT-002…064, baseline 738). Prompt-review 1 REVIEW → 2 PASS;
  delivery-review CTG-0001 1 REVIEW → 2 PASS. Evidência `generic sequence 1` (head 95f0986c).
  PR #79 (`orchestra/rait-web` → `main`) **mesclado** em 2026-09-21 (CI 7/7 verde) como 08fb84e8; `audit observe` no sha exato → EV-b4d8707038beb8a2; `origin/main` integrado por merge (fast-forward).
- **Em curso:** nenhuma tarefa de worker.
- **Pendentes:** CTG-0002a (TASK-0005 Inspector, TASK-0006 Engineer — prompts ainda não compostos;
  antes deles o **checkpoint de dependências do maestro**: scaffold de configuração de
  `apps/rait/web` copiado do Portal (M1), `pnpm install`, `pnpm check` estendido (M2), provado sobre
  o esqueleto vazio); CTG-0002b (TASK-0007…0009); CTG-0002c (TASK-0010…0012); TASK-0013 (docs);
  fechamento (`audit observe` por PR, `closure.json`, `round close`, `waves.md` §Histórico,
  `orchestra/README.md` §10, backlog).
- **Último veredito:** delivery-review CTG-0001 ciclo 2 = PASS.
- **Próximos passos do maestro que retoma:** (1) `git fetch` e `git merge --no-edit origin/main` (branch publicado; #79 já observado);
  (2) checkpoint de dependências (M1/M2) num commit `chore(rait-web): scaffold` + `chore(deps)`;
  (3) compor prompts de TASK-0005/0006 a partir de `contracts/CTG-0002a.md` (66 critérios C-2A) e
  `route-manifest.md`; prompt-review restrita; disparar Inspector (Sonnet/médio) e depois Engineer
  (Opus/médio); (4) gates, delivery-review, evidência, PR 2. Regra do Owner: a mensagem "prosseguir
  até a completa finalização" substitui o corte por janela (emenda em `AUTHORIZATION.md`).

## Leitura

HEAD `b9aa8ff787cec4408b9241b4e7a12050cb4af67b` (2026-09-21). Lido pelo maestro, nesta ordem:
`AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`; `docs/meta/agents/orchestra/README.md`,
`model-ladder.md`, `waves.md`; `docs/framework/arch/rait-build-pack.md` (inteiro) e
`rait-web-frontend.md` (inteira, §1–§14); `parameter-catalogue.md` (§RAIT, §Namespaces i18n,
§Contrato de geração e verificação), `decision-closure-plan.md` (§1–§3, OD-P46),
`steering.md` §H; manuais `architect-blueprint.md`, `engineer-frontend.md`, `inspector-tests.md`,
`transcriber-docs.md`; `work/rounds/R-0012/plan.md`. Consultas pontuais para as decisões M1…M14
e A1: `rait-i18n-glossary.md`, `docs/framework/arch/i18n/rait.pt-BR.json` (estrutura),
`tools/parameters/{verify,parser}.mjs` (gramática da allowlist), `apps/portal/web` (scaffold,
`app.routes.ts`, `app.route-manifest.ts`, `core/manifest-routes.ts`, `main.ts`,
`core/session.facade.ts`), `work/rounds/R-0014/plan.md` (M1–M17, tabela de tarefas),
`packages/api-clients` (clientes RAIT gerados), `backend/domains/shared/src/{roles,policy}.ts`
(`RAIT_ROLES`, `RAIT_COMMAND_RULES`), `detran-ui-guide.md` §2–§5, `rait-error-catalog.md` §4–§5,
`rait-events-sse-contract.md` §3, `rait-web-structure-diagrams.md` D5/D7, `IU-RAIT-001`,
`IU-PORTAL-T03` (padrão de ficha), templates `task.template.json`, `worker-prompt.template.md`,
`reviewer-prompt.template.md`, `tools/orchestra/bridge.sh`.
