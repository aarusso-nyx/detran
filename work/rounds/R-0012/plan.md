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

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                                                   | Depende de                          | CTG       | Entrega                                                                                                                                                                                                                                                              |
| --------- | -------------------- | ------------------- | -------------- | -------------------------------------------------------------------------------------- | ----------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus / alto    | `MOD-r12-route-manifest`, `MOD-r12-contracts-2a`                                       | —                                   | CTG-0002a | `route-manifest.md` (72 rotas: papéis, tela, ficha IU-RAIT-nnn, módulo, kind, UC, jornadas, resolver, nível M13), `contracts/CTG-0002a.md` (core: guardas, session facade, shell, SSE, atalhos, error boundary, i18n `rait.shell/states/a11y`, allowlist, critérios) |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-rait-screens-A`                                                           | TASK-0001                           | CTG-0001  | fichas **lote A** (painel, fila, casos, conta: IU-RAIT-002…018)                                                                                                                                                                                                      |
| TASK-0003 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-rait-screens-B`                                                           | TASK-0001                           | CTG-0001  | fichas **lote B** (protocolo, assinatura, autoridade, colegiado: IU-RAIT-019…038)                                                                                                                                                                                    |
| TASK-0004 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-rait-screens-C`, `MOD-kb-manifest`                                        | TASK-0001                           | CTG-0001  | fichas **lote C** (gestao, organizacao, integracoes, financeiro, arquivo, auditoria, admin: IU-RAIT-039…064) + `artifactIdCount` 675 → 738                                                                                                                           |
| TASK-0005 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-rait-web-tests-core`, `MOD-tools-parameters-tests`                                | TASK-0001, merge PR 1, install (M1) | CTG-0002a | specs: rota × papel (72 rotas, presença/ausência, M14), tela ↔ ficha ↔ rota ↔ i18n, chaves i18n (tokens dos contratos e códigos do catálogo → chave, glossário §2.8), guardas, SSE (fallback), error boundary; caso negativo da allowlist `rait.*`                   |
| TASK-0006 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-rait-web-core`, `MOD-parameter-catalogue-doc`, `MOD-package-json`                 | TASK-0005                           | CTG-0002a | `main.ts`, `app.routes.ts`, manifesto, `core/`, placeholders das 72 rotas, `i18n/rait.pt-BR.json`, allowlist + `pnpm parameters:generate`, `pnpm check` (M2); testes do Inspector verdes                                                                             |
| TASK-0007 | Architect            | architect-blueprint | Opus / alto    | `MOD-r12-contracts-2b`                                                                 | TASK-0006 (merge PR 2)              | CTG-0002b | `contracts/CTG-0002b.md`: assinaturas dos 22 componentes §5.2, clientes/facades (M8/M9), páginas por rota e nível (M13), fixtures JSON, critérios                                                                                                                    |
| TASK-0008 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-rait-web-tests-shared`                                                            | TASK-0007                           | CTG-0002b | specs dos 22 componentes (estados, a11y, teclado), facades (cache/invalidação, `todo` de comando), clientes (`HttpTestingController`), páginas L1/L2 por rota                                                                                                        |
| TASK-0009 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-rait-web-shared`, `MOD-rait-web-data`, `MOD-rait-web-features`, `MOD-packages-ui` | TASK-0008                           | CTG-0002b | `shared/`, `data/`, `features/*` até os testes passarem; `packages/ui` só por adenda                                                                                                                                                                                 |
| TASK-0010 | Architect            | architect-blueprint | Opus / alto    | `MOD-r12-contracts-2c`, `MOD-rait-web-forms-doc`                                       | TASK-0009 (merge PR 3)              | CTG-0002c | `contracts/CTG-0002c.md` + `docs/framework/arch/rait-web-forms.md`: 16 formulários campo a campo, gates, códigos de erro, regras ESLint (M11/M12)                                                                                                                    |
| TASK-0011 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-rait-web-tests-forms`                                                             | TASK-0010                           | CTG-0002c | specs dos 16 schemas (válido/inválido/condicional, gate) + `RuleTester` das duas regras (casos negativos)                                                                                                                                                            |
| TASK-0012 | Engineer             | engineer-frontend   | Sonnet / médio | `MOD-rait-web-forms`, `MOD-rait-web-lint`                                              | TASK-0011                           | CTG-0002c | 16 `*.schema.ts` com cabeçalho de gate, `eslint/local-rules.js`, `eslint.config.js`; testes verdes                                                                                                                                                                   |
| TASK-0013 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-docs-rait-arch`                                                                   | TASK-0012                           | CTG-0002c | `rait-build-pack.md` §WP-D/E/F executados (gates reais), `rait-web-frontend.md` §12/§13, `open-decisions-rait.md` §G (OD-R12-*), backlog                                                                                                                             |

CTG-0001 = 0002/0003/0004 (fichas, PR 1). CTG-0002a = 0001/0005/0006 (PR 2). CTG-0002b =
0007/0008/0009 (PR 3). CTG-0002c = 0010/0011/0012 + 0013 (PR 4). Paralelismo: 0002/0003/0004
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
- PR #78 (`docs/r-0012-contracts-note`, plano/prompt desta rodada) **aberto**, CI em curso; os
  arquivos já estão neste branch (commit b9aa8ff7); ao mesclar, integrar com
  `git merge --no-edit origin/main`.
- Branches `orchestra/*` remotos: `orchestra/rait-backend` (R-0007, CTG-0003/0004 em curso — sem PR
  aberto contra `main`), `orchestra/teat-frontends` (R-0013, aberto, workers não disparados; lock
  `packages/ui` livre e tomado por esta rodada). Nenhum PR aberto com lock comum aos grupos desta
  rodada.
- Grupos **liberados para merge**: CTG-0001 (fichas) e CTG-0002a/b/c (app) — o upstream R-0007
  CTG-0004 (contratos de comando) só é exigido para ligar os `todo` de comando (M8), não para o
  merge. Nenhum grupo em base empilhada sobre outra frente.
- `devai round plan --scaffold` respondeu `ROUND_ALREADY_EXISTS` (rodada instanciada pelo PR #31);
  `devai round status --round R-0012` → `0 task(s)`; tarefas entram por `tasks/*.json`.

## Bloqueios

(nenhum)

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

## Retomada

(vazio)

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
