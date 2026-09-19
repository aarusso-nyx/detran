# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-pwa` (rodada `R-0014`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P4…P6` e o "mapa entregável → definições"
4. `work/rounds/R-0014/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0014/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0014/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0014",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0014/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Primeiro ciclo (exaustivo) da entrega do grupo acoplado CTG-0001** — TASK-0001 (Architect
transcrição: allowlist i18n no `parameter-catalogue.md`, OD-P46), TASK-0002 (Inspector: testes do
verificador + specs do app; iteração 2 restrita às adendas A1/A2), TASK-0003 (Engineer:
`parser.mjs`/`verify.mjs` + artefatos regenerados), TASK-0004 (Engineer-frontend: scaffold de
`apps/portal/web`, shell, 38 rotas, 4 guardas, facades, `pnpm check` estendido). Checkpoints do
maestro (Engineer, `plan.md` §Checkpoint de dependências): `apps/portal/web/package.json`,
`pnpm-lock.yaml`, `vitest.config.ts`, `src/test-setup.ts`, `tsconfig.json`, `packages/ui/package.json`
(`exports["."]`) e a remoção de `resolveJsonModule: false` em `tsconfig.spec.json` após A2.
Relatórios: `work/rounds/R-0014/reports/TASK-0001.md`, `TASK-0002.md`, `TASK-0002-iteration-2.md`,
`TASK-0003.md`, `TASK-0004.md`. Adendas do Architect: `plan.md` §Adendas (A1: spec de `GET brand`
alinhado ao contrato; A2: tipagem dos stubs sob vitest 4) e OD-P47…P51 propostas por TASK-0004
(transcrição ao build pack em TASK-0012). A entrega está **staged, não commitada**
(`git diff --cached`), no branch `orchestra/portal-pwa` sobre `59423c9` (= `origin/main`).

Gates executados pelo maestro sobre a árvore staged (log `pnpm-check-ctg1.log`): `pnpm check`
completo (estendido por M6) → **EXIT 0**: format:check OK; orchestra-bridge PASS; docs:kb:check OK
(522/446); publish-check OK; blueprints:check OK; contracts:check OK; parameters:test 25/25
(inclui `verify-usage.test.mjs`); contracts:test OK; `verify:parameter-catalogue: OK (87 entries,
18 flags, 14 i18n namespaces, 0 errors)` — sem exclusão de diretório; `@detran/ui build` OK;
typecheck (54 pacotes, inclusive `@detran/portal-web`) OK; `@detran/ui test` 2/2; verify:decorators,
rls-ddl, role-catalog, lifecycle-vocabulary, senatran-boundary, senatran-contracts, pec-parity,
pec-superset OK; `@detran/portal-web lint` OK; `@detran/portal-web test` **263/263** (matriz de
guardas 38 rotas × personas, presença e ausência; `axe` nas 6 rotas anônimas); `@detran/portal-web
build` OK (`dist/browser/ngsw.json`, `manifest.webmanifest`, 13 chunks lazy, sem rede).

Itens a julgar com atenção: (5) nenhum valor inventado — os textos do catálogo mínimo
(`portal.shell/states/common/a11y`) vêm da spec §5.1, dos defaults do `@detran/ui` e do
`portal-error-catalog.md` §8, e TASK-0004 lista em §Fora do escopo os que ficam sujeitos à
revisão de TASK-0006; (7) gates: a exclusão de diretório A7 saiu, nenhum teste relaxado, artefatos
gerados só via `pnpm parameters:generate` (só cabeçalho `sha256` mudou); (8) vocabulário: nenhum
token interno no catálogo (`i18n-keys.spec.ts` c); (13) matriz de guardas com presença **e**
ausência (`app.guards-matrix.spec.ts`).

### git diff --cached --stat (sem `work/` e `pnpm-lock.yaml`)

```
 apps/portal/web/README.md                          | 104 +++++-
 apps/portal/web/angular.json                       |  79 ++++
 apps/portal/web/eslint.config.js                   |  51 +++
 apps/portal/web/ngsw-config.json                   |  39 ++
 apps/portal/web/package.json                       |  49 +++
 apps/portal/web/public/icons/icon-192.svg          |   1 +
 apps/portal/web/public/icons/icon-512.svg          |   1 +
 apps/portal/web/public/icons/icon-maskable.svg     |   1 +
 apps/portal/web/public/manifest.webmanifest        |  31 ++
 apps/portal/web/public/runtime-config.js           |   8 +
 apps/portal/web/src/app/a11y/axe.spec-helper.ts    |  32 ++
 .../web/src/app/a11y/public-routes.a11y.spec.ts    |  36 ++
 apps/portal/web/src/app/app.component.ts           |  38 ++
 apps/portal/web/src/app/app.guards-matrix.spec.ts  | 184 ++++++++++
 apps/portal/web/src/app/app.route-manifest.spec.ts | 106 ++++++
 apps/portal/web/src/app/app.route-manifest.ts      | 396 +++++++++++++++++++++
 apps/portal/web/src/app/app.routes.spec.ts         |  77 ++++
 apps/portal/web/src/app/app.routes.ts              | 159 +++++++++
 apps/portal/web/src/app/core/auth-flow.service.ts  |  42 +++
 apps/portal/web/src/app/core/brand.service.spec.ts |  71 ++++
 apps/portal/web/src/app/core/brand.service.ts      |  60 ++++
 .../src/app/core/citizen-shell.component.spec.ts   |  97 +++++
 .../web/src/app/core/citizen-shell.component.ts    | 208 +++++++++++
 apps/portal/web/src/app/core/entitlement.facade.ts |  43 +++
 apps/portal/web/src/app/core/error-boundary.ts     |  54 +++
 .../src/app/core/guards/assurance.guard.spec.ts    |  90 +++++
 .../web/src/app/core/guards/assurance.guard.ts     |  25 ++
 .../web/src/app/core/guards/auth.guard.spec.ts     |  50 +++
 apps/portal/web/src/app/core/guards/auth.guard.ts  |  16 +
 .../src/app/core/guards/entitlement.guard.spec.ts  |  63 ++++
 .../web/src/app/core/guards/entitlement.guard.ts   |  29 ++
 .../core/guards/service-availability.guard.spec.ts |  81 +++++
 .../app/core/guards/service-availability.guard.ts  |  18 +
 apps/portal/web/src/app/core/i18n-fallback.ts      |  35 ++
 apps/portal/web/src/app/core/manifest-routes.ts    |  83 +++++
 .../web/src/app/core/offline-document.store.ts     | 165 +++++++++
 .../web/src/app/core/pages/auth-callback.page.ts   |  58 +++
 .../src/app/core/pages/entitlement-missing.page.ts |  54 +++
 apps/portal/web/src/app/core/pages/home.page.ts    |  46 +++
 .../web/src/app/core/pages/not-found.page.ts       |  26 ++
 .../src/app/core/pages/service-unavailable.page.ts |  75 ++++
 .../portal/web/src/app/core/resume.service.spec.ts |  34 ++
 apps/portal/web/src/app/core/resume.service.ts     |  70 ++++
 apps/portal/web/src/app/core/runtime-config.ts     |  40 +++
 .../web/src/app/core/service-catalog.facade.ts     |  76 ++++
 apps/portal/web/src/app/core/session.facade.ts     | 127 +++++++
 apps/portal/web/src/app/core/title.strategy.ts     |  26 ++
 apps/portal/web/src/app/data/portal.client.ts      |  86 +++++
 .../app/features/assinatura/assinatura.routes.ts   |   7 +
 .../app/features/atendimento/atendimento.routes.ts |   7 +
 .../web/src/app/features/autos/autos.routes.ts     |   7 +
 .../src/app/features/catalogo/catalogo.routes.ts   |   7 +
 .../web/src/app/features/defesa/defesa.routes.ts   |   7 +
 .../app/features/documentos/documentos.routes.ts   |   7 +
 .../web/src/app/features/exames/exames.routes.ts   |   7 +
 .../src/app/features/indicacao/indicacao.routes.ts |   7 +
 .../features/notificacoes/notificacoes.routes.ts   |   7 +
 .../src/app/features/pagamento/pagamento.routes.ts |   7 +
 .../app/features/privacidade/privacidade.routes.ts |   7 +
 .../src/app/features/processos/processos.routes.ts |   7 +
 .../src/app/features/sinistros/sinistros.routes.ts |   7 +
 apps/portal/web/src/app/i18n/i18n-keys.spec.ts     | 115 ++++++
 apps/portal/web/src/app/i18n/portal.pt-BR.json     |  42 +++
 .../src/app/shared/placeholder-page.component.ts   |  37 ++
 apps/portal/web/src/index.html                     |  20 ++
 apps/portal/web/src/main.ts                        |  52 +++
 apps/portal/web/src/styles.css                     |  17 +
 apps/portal/web/src/test-setup.ts                  |  14 +
 .../web/src/testing/entitlement-facade.stub.ts     |  21 ++
 .../web/src/testing/route-manifest.fixture.ts      | 394 ++++++++++++++++++++
 apps/portal/web/src/testing/router-harness.ts      |  59 +++
 .../web/src/testing/service-catalog-facade.stub.ts |  33 ++
 apps/portal/web/src/testing/session-facade.stub.ts |  69 ++++
 apps/portal/web/tsconfig.app.json                  |  19 +
 apps/portal/web/tsconfig.json                      |  25 ++
 apps/portal/web/tsconfig.spec.json                 |  18 +
 apps/portal/web/vitest.config.ts                   |  12 +
 backend/app/src/generated/parameter-flags.ts       |   4 +-
 backend/database/seed/05-parameters.sql            |   2 +-
 .../parameter/src/generated/parameter-catalogue.ts |   4 +-
 docs/framework/arch/parameter-catalogue.md         |  83 ++++-
 docs/framework/arch/portal-build-pack.md           |  72 ++--
 docs/framework/arch/portal-frontends.md            |  28 +-
 docs/meta/knowledge-base/decision-closure-plan.md  |   1 +
 package.json                                       |   2 +-
 packages/ui/package.json                           |   4 +
 tools/parameters/fixtures/namespaces-allow.txt     |  38 ++
 .../parameters/fixtures/namespaces-bad-prefix.txt  |  38 ++
 tools/parameters/fixtures/namespaces-collision.txt |  39 ++
 tools/parameters/fixtures/namespaces-malformed.txt |  38 ++
 tools/parameters/parser.mjs                        |  98 +++++
 tools/parameters/tests/verify-usage.test.mjs       | 230 ++++++++++++
 tools/parameters/verify.mjs                        |  50 ++-
 93 files changed, 5020 insertions(+), 89 deletions(-)
```

### git diff --cached (código, docs e configuração; sem `work/`, `pnpm-lock.yaml`, artefatos gerados de parâmetros — só cabeçalho — e ícones SVG)

````diff
diff --git a/apps/portal/web/README.md b/apps/portal/web/README.md
index 2c6049e..9a7392d 100644
--- a/apps/portal/web/README.md
+++ b/apps/portal/web/README.md
@@ -1,8 +1,102 @@
-# apps/portal/web — PORTAL citizen webapp (placeholder)
+# apps/portal/web — Portal do cidadão (PWA)

-Public PWA for drivers/citizens/owners to consult and appeal tickets — transversal
-across all domains. Citizen identity: Cognito + gov.br OIDC federation.
+Primeiro app do monorepo (R-0014, `work/rounds/R-0014/plan.md` M1–M9, M13, M14): fixa o
+padrão de scaffold que os demais frontends copiam sem variantes locais — **R-0012
+(`apps/rait/web`) copia esta estrutura**, trocando `portal.*` por `rait.*`.

-**Built in Phase 4 (W4.4).**
+Especificação: `docs/framework/arch/portal-frontends.md`; contrato de rotas
+`portal-route-contract.md`; erros `portal-error-catalog.md`; pacote de construção
+`portal-build-pack.md`; kit `detran-ui-guide.md`.

-Especificação do frontend, contrato de rotas, erros e pacote de construção: `docs/framework/arch/portal-frontends.md`, `portal-route-contract.md`, `portal-error-catalog.md`, `portal-build-pack.md` (2026-09-13).
+## Scripts (M1)
+
+| Script      | Comando                                                                   |
+| ----------- | ------------------------------------------------------------------------- |
+| `build`     | `ng build` (configuração `production` é a padrão; sem rede)               |
+| `test`      | `vitest run --config vitest.config.ts` (jsdom + TestBed, JIT)             |
+| `lint`      | `eslint .` (flat config; angular-eslint + typescript-eslint + prettier)   |
+| `typecheck` | `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit` |
+
+Na raiz, `pnpm check` constrói `@detran/ui` antes de `pnpm typecheck` (o app tipa contra
+`packages/ui/dist`) e termina com `lint`, `test` e `build` deste app (M6).
+
+Como rodar localmente: `pnpm --filter @detran/portal-web build` gera `dist/browser/` com
+`index.html`, `ngsw.json`, `ngsw-worker.js` e `manifest.webmanifest`; sirva o diretório com
+qualquer servidor estático na mesma origem do backend (`/v1/portal/*`) e ajuste
+`runtime-config.js`. `ng serve` (`@angular/build:dev-server`, configuração `development`)
+serve sem service worker.
+
+## Estrutura (M7; spec §9)
+
+```text
+angular.json          projeto portal-web, builder @angular/build:application, assets de public/,
+                      serviceWorker: ngsw-config.json na configuração production (padrão)
+tsconfig.json         base (maestro): strict, ES2023, ESNext/bundler, strictTemplates
+tsconfig.app.json     src/main.ts; exclui specs, src/testing e o helper de a11y
+tsconfig.spec.json    specs + src/testing + test-setup; types vitest/globals + node
+vitest.config.ts      jsdom, globals, src/**/*.spec.ts, setupFiles src/test-setup.ts (maestro)
+eslint.config.js      M5
+ngsw-config.json      M14: app prefetch; dataGroups só CNH-e e CRLV-e (freshness)
+public/               manifest.webmanifest, runtime-config.js, icons/ (SVG neutros, white label)
+src/index.html        lang pt-BR, <script src="runtime-config.js">, manifesto, <noscript>
+src/main.ts           bootstrapApplication + provideDetranAuthenticatedApp + service worker
+src/styles.css        importa @detran/ui/styles
+src/app/
+  app.component.ts        raiz: CitizenShell + marca + aria-live de navegação
+  app.routes.ts           PORTAL_ROUTES (core eager + 13 módulos lazy + **)
+  app.route-manifest.ts   PORTAL_ROUTE_MANIFEST (38 rotas — fonte única das rotas e dos testes)
+  core/                   citizen-shell, brand.service, session.facade, auth-flow.service,
+                          entitlement.facade, service-catalog.facade, resume.service,
+                          error-boundary, offline-document.store, runtime-config,
+                          title.strategy, i18n-fallback, manifest-routes, guards/, pages/
+  features/<module>/      <module>.routes.ts (lazy; caminhos completos derivados do manifesto)
+  shared/                 placeholder-page.component (rotas ainda não construídas)
+  data/                   portal.client.ts (wrapper tipado por @detran/api-clients)
+  i18n/                   portal.pt-BR.json (catálogo plano, chave = caminho pontuado)
+  a11y/                   axe.spec-helper.ts (Inspector)
+src/testing/              stubs e harness dos specs (Inspector)
+```
+
+## O que os próximos apps copiam (M1–M6)
+
+- `package.json`: `private`, `type: module`, `engines.node >=24 <25`, os quatro scripts acima,
+  versões de M2 (Angular/CLI/build 22.1.6, vitest 4, jsdom, axe-core, eslint 10, angular-eslint,
+  typescript-eslint, eslint-config-prettier, `@detran/ui` e `@detran/api-clients` `workspace:*`,
+  `@stynx-nyx/*` 1.3.1). Nenhuma outra dependência sem adenda do maestro.
+- `angular.json`, `tsconfig*.json`, `vitest.config.ts`, `src/test-setup.ts`, `eslint.config.js`
+  como estão aqui (só o nome do projeto e o prefixo de seletor mudam).
+- Componentes standalone, `OnPush`, signals, `inject()`; `template`/`styles` inline (JIT nos
+  testes, AOT no build); primitivos do kit, nunca reimplementados.
+- Todo texto visível pelo `stynxTranslate` com chave `<surface>.<namespace>.…` de um catálogo
+  plano; namespaces declarados na allowlist do `docs/framework/arch/parameter-catalogue.md`
+  §Namespaces i18n (`verify:parameter-catalogue --check-usage`).
+- Bootstrap só por `provideDetranAuthenticatedApp` (`@detran/ui`); `runtime-config.js` com
+  três chaves e sem segredo; tipos de API por alias `@detran/api-clients/generated/*`
+  (`paths` do tsconfig) enquanto o índice do pacote não reexporta os contratos do app.
+- Rotas derivadas de um manifesto (`app.route-manifest.ts` → `core/manifest-routes.ts`): guardas
+  na ordem auth → assurance → availability → entitlement; módulos lazy montados em `path: ''`
+  com `canMatch` pelo primeiro segmento; páginas placeholder (`DetranErrorStateComponent`
+  "indisponível nesta versão", `data-screen="T-nn"`) até a tela existir.
+- Providers de fallback de i18n nas rotas (`core/i18n-fallback.ts`): delegam ao serviço do
+  bootstrap quando existe e só criam um serviço vazio no harness `provideRouter(ROUTES)` dos
+  specs — nunca registrar `StynxI18nModule.forRoot` fora do bootstrap.
+
+## O que é específico do Portal (M7–M9, M14)
+
+- `CitizenShell` próprio (spec §1): marca do `BrandService` (`GET /v1/portal/brand`) ou neutra,
+  navegação de 5 destinos, rodapé de 4 links (URLs da marca quando existem), skip link,
+  `<main id="conteudo">`, `aria-live` para estados.
+- Guardas `portalAuthGuard`, `assuranceGuard('simples' | 'avancada')`,
+  `entitlementGuard(kind)`, `serviceAvailabilityGuard(serviceKey)` (M8): nunca 404, nunca
+  "acesso negado" seco — sempre uma tela com motivo e caminho.
+- `SessionFacade` sobre `StynxSessionService` + `GET /v1/portal/identity/me` (nível da claim
+  `assurance_level`; matriz ato → nível do servidor); `ResumeService` em memória +
+  `sessionStorage` (nunca `localStorage`); `ErrorBoundary` `PORTAL.<CODE>` →
+  `portal.errors.<code minúsculo>`; `OfflineDocumentStore` AES-GCM com chave derivada do `sid`
+  em memória (só CNH-e/CRLV-e).
+- Catálogo `src/app/i18n/portal.pt-BR.json` com o mapa de tradução de estados
+  (`portal.situation.*`, CTG-0002) — nesta entrega só `portal.shell`, `portal.states`,
+  `portal.common`, `portal.a11y`.
+- PWA: `manifest.webmanifest` neutro (white label), `ngsw-config.json` com `dataGroups` só para
+  `/v1/portal/documents/cnh` e `/v1/portal/vehicles/*/crlv-e`; qualquer outra rota offline mostra
+  `portal.states.offline` sem prometer envio posterior.
diff --git a/apps/portal/web/angular.json b/apps/portal/web/angular.json
new file mode 100644
index 0000000..88b13ca
--- /dev/null
+++ b/apps/portal/web/angular.json
@@ -0,0 +1,79 @@
+{
+  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
+  "version": 1,
+  "cli": {
+    "analytics": false,
+    "cache": {
+      "enabled": false
+    }
+  },
+  "newProjectRoot": "projects",
+  "projects": {
+    "portal-web": {
+      "projectType": "application",
+      "root": "",
+      "sourceRoot": "src",
+      "prefix": "portal",
+      "architect": {
+        "build": {
+          "builder": "@angular/build:application",
+          "options": {
+            "browser": "src/main.ts",
+            "index": "src/index.html",
+            "tsConfig": "tsconfig.app.json",
+            "outputPath": "dist",
+            "polyfills": [],
+            "inlineStyleLanguage": "css",
+            "styles": ["src/styles.css"],
+            "assets": [
+              {
+                "glob": "**/*",
+                "input": "public"
+              }
+            ]
+          },
+          "configurations": {
+            "production": {
+              "optimization": true,
+              "outputHashing": "all",
+              "sourceMap": false,
+              "extractLicenses": true,
+              "serviceWorker": "ngsw-config.json",
+              "budgets": [
+                {
+                  "type": "initial",
+                  "maximumWarning": "500kB",
+                  "maximumError": "1MB"
+                },
+                {
+                  "type": "anyComponentStyle",
+                  "maximumWarning": "4kB",
+                  "maximumError": "8kB"
+                }
+              ]
+            },
+            "development": {
+              "optimization": false,
+              "outputHashing": "none",
+              "sourceMap": true,
+              "extractLicenses": false
+            }
+          },
+          "defaultConfiguration": "production"
+        },
+        "serve": {
+          "builder": "@angular/build:dev-server",
+          "configurations": {
+            "production": {
+              "buildTarget": "portal-web:build:production"
+            },
+            "development": {
+              "buildTarget": "portal-web:build:development"
+            }
+          },
+          "defaultConfiguration": "development"
+        }
+      }
+    }
+  }
+}
diff --git a/apps/portal/web/eslint.config.js b/apps/portal/web/eslint.config.js
new file mode 100644
index 0000000..520631d
--- /dev/null
+++ b/apps/portal/web/eslint.config.js
@@ -0,0 +1,51 @@
+// Lint do app (plan.md R-0014 M5): flat config com angular-eslint (ts + template recommended),
+// typescript-eslint recommended e eslint-config-prettier. Padrão que os demais apps copiam.
+import angular from 'angular-eslint';
+import prettier from 'eslint-config-prettier';
+import { defineConfig } from 'eslint/config';
+import tseslint from 'typescript-eslint';
+
+export default defineConfig(
+  { ignores: ['dist/**', '.angular/**'] },
+  {
+    files: ['**/*.ts'],
+    extends: [
+      ...tseslint.configs.recommended,
+      ...angular.configs.tsRecommended,
+      prettier,
+    ],
+    processor: angular.processInlineTemplates,
+    rules: {
+      '@typescript-eslint/no-explicit-any': 'error',
+      '@typescript-eslint/no-unused-vars': [
+        'error',
+        {
+          argsIgnorePattern: '^_',
+          varsIgnorePattern: '^_',
+          caughtErrorsIgnorePattern: '^_',
+        },
+      ],
+      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
+      '@angular-eslint/prefer-standalone': 'error',
+      '@angular-eslint/component-selector': [
+        'error',
+        { type: 'element', prefix: 'portal', style: 'kebab-case' },
+      ],
+      '@angular-eslint/directive-selector': [
+        'error',
+        { type: 'attribute', prefix: 'portal', style: 'camelCase' },
+      ],
+    },
+  },
+  {
+    files: ['**/*.spec.ts'],
+    rules: { '@typescript-eslint/no-explicit-any': 'off' },
+  },
+  {
+    files: ['**/*.html'],
+    extends: [
+      ...angular.configs.templateRecommended,
+      ...angular.configs.templateAccessibility,
+    ],
+  },
+);
diff --git a/apps/portal/web/ngsw-config.json b/apps/portal/web/ngsw-config.json
new file mode 100644
index 0000000..cb24836
--- /dev/null
+++ b/apps/portal/web/ngsw-config.json
@@ -0,0 +1,39 @@
+{
+  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
+  "index": "/index.html",
+  "assetGroups": [
+    {
+      "name": "app",
+      "installMode": "prefetch",
+      "resources": {
+        "files": [
+          "/index.html",
+          "/manifest.webmanifest",
+          "/*.css",
+          "/*.js",
+          "!/runtime-config.js"
+        ]
+      }
+    },
+    {
+      "name": "assets",
+      "installMode": "lazy",
+      "updateMode": "prefetch",
+      "resources": {
+        "files": ["/**/*.(svg|png|webp|woff2)"]
+      }
+    }
+  ],
+  "dataGroups": [
+    {
+      "name": "documentos-offline",
+      "urls": ["/v1/portal/documents/cnh", "/v1/portal/vehicles/*/crlv-e"],
+      "cacheConfig": {
+        "strategy": "freshness",
+        "maxSize": 2,
+        "maxAge": "1d",
+        "timeout": "5s"
+      }
+    }
+  ]
+}
diff --git a/apps/portal/web/package.json b/apps/portal/web/package.json
new file mode 100644
index 0000000..f5c1b64
--- /dev/null
+++ b/apps/portal/web/package.json
@@ -0,0 +1,49 @@
+{
+  "name": "@detran/portal-web",
+  "version": "0.1.0",
+  "private": true,
+  "description": "Portal do cidadão (PWA) — apps/portal/web sobre @detran/ui e STYNX 1.3.1 (Angular 22). Primeiro app do monorepo: fixa o padrão de scaffold que os demais apps copiam (R-0014, plan.md M1–M6).",
+  "type": "module",
+  "engines": {
+    "node": ">=24 <25"
+  },
+  "scripts": {
+    "build": "ng build",
+    "test": "vitest run --config vitest.config.ts",
+    "lint": "eslint .",
+    "typecheck": "tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit"
+  },
+  "dependencies": {
+    "@angular/common": "22.1.6",
+    "@angular/core": "22.1.6",
+    "@angular/forms": "22.1.6",
+    "@angular/platform-browser": "22.1.6",
+    "@angular/router": "22.1.6",
+    "@angular/service-worker": "22.1.6",
+    "@detran/api-clients": "workspace:*",
+    "@detran/ui": "workspace:*",
+    "@stynx-nyx/angular": "1.3.1",
+    "@stynx-nyx/angular-auth": "1.3.1",
+    "@stynx-nyx/angular-i18n": "1.3.1",
+    "@stynx-nyx/angular-tenancy": "1.3.1",
+    "@stynx-nyx/angular-ui": "1.3.1",
+    "rxjs": "^7.8.2",
+    "tslib": "^2.8.1",
+    "zod": "^4.6.5"
+  },
+  "devDependencies": {
+    "@angular/build": "22.1.6",
+    "@angular/cli": "22.1.6",
+    "@angular/compiler": "22.1.6",
+    "@angular/compiler-cli": "22.1.6",
+    "@types/node": "^24.10.1",
+    "angular-eslint": "22.5.0",
+    "axe-core": "4.13.0",
+    "eslint": "^10.9.0",
+    "eslint-config-prettier": "^10.1.8",
+    "jsdom": "^29.0.2",
+    "typescript": "6.0.3",
+    "typescript-eslint": "8.70.0",
+    "vitest": "^4.1.7"
+  }
+}
diff --git a/apps/portal/web/public/manifest.webmanifest b/apps/portal/web/public/manifest.webmanifest
new file mode 100644
index 0000000..3fa5889
--- /dev/null
+++ b/apps/portal/web/public/manifest.webmanifest
@@ -0,0 +1,31 @@
+{
+  "name": "Portal do cidadão",
+  "short_name": "Portal",
+  "lang": "pt-BR",
+  "dir": "ltr",
+  "start_url": "/",
+  "scope": "/",
+  "display": "standalone",
+  "background_color": "#ffffff",
+  "theme_color": "#005ca9",
+  "icons": [
+    {
+      "src": "icons/icon-192.svg",
+      "sizes": "192x192",
+      "type": "image/svg+xml",
+      "purpose": "any"
+    },
+    {
+      "src": "icons/icon-512.svg",
+      "sizes": "512x512",
+      "type": "image/svg+xml",
+      "purpose": "any"
+    },
+    {
+      "src": "icons/icon-maskable.svg",
+      "sizes": "512x512",
+      "type": "image/svg+xml",
+      "purpose": "maskable"
+    }
+  ]
+}
diff --git a/apps/portal/web/public/runtime-config.js b/apps/portal/web/public/runtime-config.js
new file mode 100644
index 0000000..5e2d705
--- /dev/null
+++ b/apps/portal/web/public/runtime-config.js
@@ -0,0 +1,8 @@
+// Configuração de runtime do Portal (portal-frontends.md §1; plan.md M4): somente três chaves,
+// sem segredo. Servida fora do bundle para que cada tenant/ambiente troque o arquivo sem
+// rebuild; lida por src/app/core/runtime-config.ts. Valores vazios = ambiente de desenvolvimento.
+window.__DETRAN_RUNTIME_CONFIG__ = {
+  tenantId: '',
+  oidcAuthority: '',
+  clientId: '',
+};
diff --git a/apps/portal/web/src/app/a11y/axe.spec-helper.ts b/apps/portal/web/src/app/a11y/axe.spec-helper.ts
new file mode 100644
index 0000000..10e01d8
--- /dev/null
+++ b/apps/portal/web/src/app/a11y/axe.spec-helper.ts
@@ -0,0 +1,32 @@
+// R-0014 TASK-0002 (Inspector, plan.md M3/B1). Helper de a11y automática por rota:
+// `axe-core` 4.13.0 no TestBed (jsdom), tags `wcag2a`, `wcag2aa`, `best-practice`. Substitui
+// Lighthouse CI (exige Chrome headless/serviço externo — não roda no runner, §Bloqueios B1).
+// Só usado por specs (fronteira de TASK-0002: `src/app/a11y/axe.spec-helper.ts`).
+import axe from 'axe-core';
+
+export async function expectNoSeriousA11yViolations(
+  element: Element,
+): Promise<void> {
+  const results = await axe.run(element, {
+    runOnly: {
+      type: 'tag',
+      values: ['wcag2a', 'wcag2aa', 'best-practice'],
+    },
+  });
+  const serious = results.violations.filter(
+    (violation) =>
+      violation.impact === 'serious' || violation.impact === 'critical',
+  );
+  if (serious.length === 0) return;
+  const details = serious
+    .map((violation) => {
+      const targets = violation.nodes
+        .map((node) => node.target.join(' '))
+        .join('; ');
+      return `${violation.id} (${violation.impact}): ${targets}`;
+    })
+    .join('\n');
+  throw new Error(
+    `violações de acessibilidade serious/critical (wcag2a, wcag2aa, best-practice):\n${details}`,
+  );
+}
diff --git a/apps/portal/web/src/app/a11y/public-routes.a11y.spec.ts b/apps/portal/web/src/app/a11y/public-routes.a11y.spec.ts
new file mode 100644
index 0000000..125d05e
--- /dev/null
+++ b/apps/portal/web/src/app/a11y/public-routes.a11y.spec.ts
@@ -0,0 +1,36 @@
+// R-0014 TASK-0002 (Inspector). Aplica `expectNoSeriousA11yViolations` às rotas `anonimo`
+// do manifesto (route-manifest.md), renderizadas via `RouterTestingHarness` sobre
+// `PORTAL_ROUTES` real (prompt §B.6).
+import { PORTAL_ROUTES } from '../app.routes';
+import { PORTAL_ROUTE_MANIFEST_FIXTURE } from '../../testing/route-manifest.fixture';
+import {
+  createPortalRouterHarness,
+  substituteRouteParams,
+} from '../../testing/router-harness';
+import { SessionFacade } from '../core/session.facade';
+import { SESSION_FACADE_PRESETS } from '../../testing/session-facade.stub';
+import { expectNoSeriousA11yViolations } from './axe.spec-helper';
+
+const anonymousRoutes = PORTAL_ROUTE_MANIFEST_FIXTURE.filter(
+  (entry) => entry.access === 'anonimo',
+);
+
+describe('a11y (axe-core) das rotas anônimas do manifesto', () => {
+  for (const entry of anonymousRoutes) {
+    const url = `/${substituteRouteParams(entry.path)}`;
+    const label = entry.path === '' ? '(home)' : entry.path;
+
+    it(`dado a rota anônima ${label} quando renderizada então axe não reporta violação serious/critical`, async () => {
+      const { harness } = await createPortalRouterHarness(PORTAL_ROUTES, [
+        {
+          provide: SessionFacade,
+          useValue: SESSION_FACADE_PRESETS.anonimo(),
+        },
+      ]);
+      await harness.navigateByUrl(url);
+      const root = harness.routeNativeElement;
+      expect(root, `rota ${label} não renderizou`).not.toBeNull();
+      await expectNoSeriousA11yViolations(root as Element);
+    });
+  }
+});
diff --git a/apps/portal/web/src/app/app.component.ts b/apps/portal/web/src/app/app.component.ts
new file mode 100644
index 0000000..2ee3c9c
--- /dev/null
+++ b/apps/portal/web/src/app/app.component.ts
@@ -0,0 +1,38 @@
+// Raiz do app: monta o `CitizenShell` com a marca do `BrandService` e anuncia a navegação em
+// curso na região `aria-live` do shell (`portal.states.loading`).
+import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
+import { toSignal } from '@angular/core/rxjs-interop';
+import { NavigationEnd, NavigationStart, Router } from '@angular/router';
+import { filter, map } from 'rxjs';
+import { BrandService } from './core/brand.service';
+import { CitizenShellComponent } from './core/citizen-shell.component';
+
+const LOADING_KEY = 'portal.states.loading';
+
+@Component({
+  selector: 'portal-root',
+  imports: [CitizenShellComponent],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  template: `
+    <portal-citizen-shell [brand]="brand.state()" [statusKey]="status()" />
+  `,
+})
+export class AppComponent {
+  protected readonly brand = inject(BrandService);
+  private readonly router = inject(Router);
+
+  protected readonly status = toSignal(
+    this.router.events.pipe(
+      filter(
+        (event) =>
+          event instanceof NavigationStart || event instanceof NavigationEnd,
+      ),
+      map((event) => (event instanceof NavigationStart ? LOADING_KEY : '')),
+    ),
+    { initialValue: '' },
+  );
+
+  constructor() {
+    void this.brand.load();
+  }
+}
diff --git a/apps/portal/web/src/app/app.guards-matrix.spec.ts b/apps/portal/web/src/app/app.guards-matrix.spec.ts
new file mode 100644
index 0000000..8ee18d5
--- /dev/null
+++ b/apps/portal/web/src/app/app.guards-matrix.spec.ts
@@ -0,0 +1,184 @@
+// R-0014 TASK-0002 (Inspector). Matriz de presença × ausência dos guardas para as 38 rotas
+// do manifesto (route-manifest.md), sobre `PORTAL_ROUTES` real (M7/M8 do plan.md), com
+// `provideRouter` + `RouterTestingHarness` e os stubs de `src/testing/`. Id fixo
+// `00000000-0000-7000-8000-0000000000aa` para todo parâmetro dinâmico (prompt §B.3).
+import { PORTAL_ROUTES } from './app.routes';
+import { SessionFacade } from './core/session.facade';
+import { EntitlementFacade } from './core/entitlement.facade';
+import { ServiceCatalogFacade } from './core/service-catalog.facade';
+import {
+  SESSION_FACADE_PRESETS,
+  type SessionFacadeStub,
+} from '../testing/session-facade.stub';
+import { createEntitlementFacadeStub } from '../testing/entitlement-facade.stub';
+import {
+  createServiceCatalogFacadeStub,
+  DELEGACAO_INDISPONIVEL_R0007,
+} from '../testing/service-catalog-facade.stub';
+import { PORTAL_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture';
+import {
+  createPortalRouterHarness,
+  screenElement,
+  substituteRouteParams,
+  FIXED_ENTITY_ID,
+} from '../testing/router-harness';
+
+function providersFor(options: {
+  session: SessionFacadeStub;
+  entitlementOk?: boolean;
+  availability?: 'available' | 'partially_available' | 'unavailable';
+}) {
+  return [
+    { provide: SessionFacade, useValue: options.session },
+    {
+      provide: EntitlementFacade,
+      useValue: createEntitlementFacadeStub(options.entitlementOk ?? true),
+    },
+    {
+      provide: ServiceCatalogFacade,
+      useValue: createServiceCatalogFacadeStub(
+        options.availability && options.availability !== 'available'
+          ? {
+              status: options.availability,
+              reason:
+                options.availability === 'unavailable'
+                  ? DELEGACAO_INDISPONIVEL_R0007
+                  : undefined,
+            }
+          : { status: 'available' },
+      ),
+    },
+  ];
+}
+
+describe('matriz de guardas por rota (route-manifest.md × plan.md M8)', () => {
+  for (const entry of PORTAL_ROUTE_MANIFEST_FIXTURE) {
+    const url = `/${substituteRouteParams(entry.path)}`;
+    const label = entry.path === '' ? '(home)' : entry.path;
+
+    describe(`rota ${label} [access=${entry.access}]`, () => {
+      it('dado persona anônima (active=false) quando navega então presença se anonimo/nenhum_ou_simples, senão retomar', async () => {
+        const { harness, currentUrl } = await createPortalRouterHarness(
+          PORTAL_ROUTES,
+          providersFor({ session: SESSION_FACADE_PRESETS.anonimo() }),
+        );
+        await harness.navigateByUrl(url);
+        if (
+          entry.access === 'anonimo' ||
+          entry.access === 'nenhum_ou_simples'
+        ) {
+          expect(screenElement(harness)).not.toBeNull();
+        } else {
+          expect(currentUrl()).toBe(`/?retomar=${encodeURIComponent(url)}`);
+        }
+      });
+
+      it('dado persona simples ativa quando navega então presença exceto access=avancada (elevação)', async () => {
+        const { harness, currentUrl } = await createPortalRouterHarness(
+          PORTAL_ROUTES,
+          providersFor({ session: SESSION_FACADE_PRESETS.simples() }),
+        );
+        await harness.navigateByUrl(url);
+        if (entry.access === 'avancada') {
+          expect(currentUrl()).toBe(
+            `/assinatura/elevacao?retomar=${encodeURIComponent(url)}`,
+          );
+        } else {
+          expect(screenElement(harness)).not.toBeNull();
+        }
+      });
+
+      it('dado persona avancada quando navega então sempre renderiza', async () => {
+        const { harness } = await createPortalRouterHarness(
+          PORTAL_ROUTES,
+          providersFor({ session: SESSION_FACADE_PRESETS.avancada() }),
+        );
+        await harness.navigateByUrl(url);
+        expect(screenElement(harness)).not.toBeNull();
+      });
+
+      it('dado persona qualificada quando navega então sempre renderiza (nunca bloqueada, RN-PORTAL-101)', async () => {
+        const { harness } = await createPortalRouterHarness(
+          PORTAL_ROUTES,
+          providersFor({ session: SESSION_FACADE_PRESETS.qualificada() }),
+        );
+        await harness.navigateByUrl(url);
+        expect(screenElement(harness)).not.toBeNull();
+      });
+
+      if (entry.serviceKey) {
+        it(`dado serviceKey ${entry.serviceKey} indisponível quando navega então redireciona para /servico-indisponivel/${entry.serviceKey}`, async () => {
+          const { harness, currentUrl } = await createPortalRouterHarness(
+            PORTAL_ROUTES,
+            providersFor({
+              session: SESSION_FACADE_PRESETS.avancada(),
+              availability: 'unavailable',
+            }),
+          );
+          await harness.navigateByUrl(url);
+          expect(currentUrl()).toBe(
+            `/servico-indisponivel/${entry.serviceKey}`,
+          );
+        });
+
+        it(`dado serviceKey ${entry.serviceKey} parcialmente disponível quando navega então renderiza`, async () => {
+          const { harness } = await createPortalRouterHarness(
+            PORTAL_ROUTES,
+            providersFor({
+              session: SESSION_FACADE_PRESETS.avancada(),
+              availability: 'partially_available',
+            }),
+          );
+          await harness.navigateByUrl(url);
+          expect(screenElement(harness)).not.toBeNull();
+        });
+      }
+
+      const entitlement = entry.entitlement;
+      if (entitlement) {
+        it(`dado vínculo (${entitlement.kind}) negado quando navega então redireciona para /vinculo/por-que-nao-vejo`, async () => {
+          const { harness, currentUrl } = await createPortalRouterHarness(
+            PORTAL_ROUTES,
+            providersFor({
+              session: SESSION_FACADE_PRESETS.avancada(),
+              entitlementOk: false,
+            }),
+          );
+          await harness.navigateByUrl(url);
+          expect(currentUrl()).toBe(
+            `/vinculo/por-que-nao-vejo?recurso=${entitlement.kind}&id=${FIXED_ENTITY_ID}`,
+          );
+        });
+
+        it(`dado vínculo (${entitlement.kind}) confirmado quando navega então renderiza`, async () => {
+          const { harness } = await createPortalRouterHarness(
+            PORTAL_ROUTES,
+            providersFor({
+              session: SESSION_FACADE_PRESETS.avancada(),
+              entitlementOk: true,
+            }),
+          );
+          await harness.navigateByUrl(url);
+          expect(screenElement(harness)).not.toBeNull();
+        });
+      }
+    });
+  }
+
+  it('dado rota simples com serviceKey indisponível quando persona anônima navega então auth vence availability (retomar, nunca servico-indisponivel)', async () => {
+    const entry = PORTAL_ROUTE_MANIFEST_FIXTURE.find(
+      (candidate) => candidate.path === 'autos',
+    );
+    if (!entry) throw new Error('fixture sem a rota autos');
+    const url = `/${entry.path}`;
+    const { harness, currentUrl } = await createPortalRouterHarness(
+      PORTAL_ROUTES,
+      providersFor({
+        session: SESSION_FACADE_PRESETS.anonimo(),
+        availability: 'unavailable',
+      }),
+    );
+    await harness.navigateByUrl(url);
+    expect(currentUrl()).toBe(`/?retomar=${encodeURIComponent(url)}`);
+  });
+});
diff --git a/apps/portal/web/src/app/app.route-manifest.spec.ts b/apps/portal/web/src/app/app.route-manifest.spec.ts
new file mode 100644
index 0000000..717779e
--- /dev/null
+++ b/apps/portal/web/src/app/app.route-manifest.spec.ts
@@ -0,0 +1,106 @@
+// R-0014 TASK-0002 (Inspector). `PORTAL_ROUTE_MANIFEST` (M7 do plan.md) comparado, entrada a
+// entrada, contra a transcrição independente de route-manifest.md em
+// `src/testing/route-manifest.fixture.ts` (a fixture não é importada pela produção — cada
+// lado é escrito e mantido separadamente, como pede o prompt §B.1).
+import { PORTAL_ROUTE_MANIFEST } from './app.route-manifest';
+import {
+  PORTAL_ROUTE_MANIFEST_FIXTURE,
+  PORTAL_SERVICE_KEYS,
+} from '../testing/route-manifest.fixture';
+
+describe('PORTAL_ROUTE_MANIFEST', () => {
+  it('dado o manifesto de produção quando comparado ao route-manifest.md então tem exatamente as 38 entradas, path a path', () => {
+    expect(PORTAL_ROUTE_MANIFEST.length).toBe(38);
+    expect(PORTAL_ROUTE_MANIFEST.length).toBe(
+      PORTAL_ROUTE_MANIFEST_FIXTURE.length,
+    );
+    const actualPaths = PORTAL_ROUTE_MANIFEST.map((entry) => entry.path);
+    const expectedPaths = PORTAL_ROUTE_MANIFEST_FIXTURE.map(
+      (entry) => entry.path,
+    );
+    expect(actualPaths).toEqual(expectedPaths);
+  });
+
+  it('dado cada rota do manifesto quando comparada à fixture então screen/sheet/module/access/entitlement/serviceKey coincidem', () => {
+    const byPath = new Map(
+      PORTAL_ROUTE_MANIFEST.map((entry) => [entry.path, entry]),
+    );
+    for (const expected of PORTAL_ROUTE_MANIFEST_FIXTURE) {
+      const actual = byPath.get(expected.path);
+      expect(
+        actual,
+        `rota ausente no manifesto de produção: ${expected.path}`,
+      ).toBeDefined();
+      expect(actual?.screen).toBe(expected.screen);
+      expect(actual?.sheet).toBe(expected.sheet);
+      expect(actual?.module).toBe(expected.module);
+      expect(actual?.access).toBe(expected.access);
+      expect(actual?.entitlement).toEqual(expected.entitlement);
+      expect(actual?.serviceKey).toEqual(expected.serviceKey);
+      expect(actual?.journeys).toEqual(expected.journeys);
+    }
+  });
+
+  it('dado o manifesto quando contadas as telas distintas então há exatamente 27 (T-01…T-27)', () => {
+    const screens = new Set(
+      PORTAL_ROUTE_MANIFEST.map((entry) => entry.screen).filter(
+        (screen): screen is `T-${string}` => screen !== null,
+      ),
+    );
+    expect(screens.size).toBe(27);
+    for (let index = 1; index <= 27; index += 1) {
+      const code = `T-${String(index).padStart(2, '0')}`;
+      expect(screens.has(code as `T-${string}`), `tela ausente: ${code}`).toBe(
+        true,
+      );
+    }
+  });
+
+  it('dado o manifesto quando verificado então nenhuma entrada tem access "qualificada" ([RN-PORTAL-101])', () => {
+    for (const entry of PORTAL_ROUTE_MANIFEST) {
+      expect(entry.access).not.toBe('qualificada');
+    }
+  });
+
+  it('dado o manifesto quando contados os módulos distintos então há exatamente 14', () => {
+    const modules = new Set(PORTAL_ROUTE_MANIFEST.map((entry) => entry.module));
+    expect(modules.size).toBe(14);
+  });
+
+  it('dado toda rota com parâmetro de vínculo (:aitId|:requestId|:vehicleId|:crashId|:examId|:manifestationId) quando verificada então tem entitlement', () => {
+    const entitlementParams = [
+      'aitId',
+      'requestId',
+      'vehicleId',
+      'crashId',
+      'examId',
+      'manifestationId',
+    ];
+    for (const entry of PORTAL_ROUTE_MANIFEST) {
+      const hasBindingParam = entry.path
+        .split('/')
+        .some(
+          (segment) =>
+            segment.startsWith(':') &&
+            entitlementParams.includes(segment.slice(1)),
+        );
+      if (hasBindingParam) {
+        expect(
+          entry.entitlement,
+          `rota sem entitlement: ${entry.path}`,
+        ).toBeDefined();
+      }
+    }
+  });
+
+  it('dado toda rota com serviceKey quando verificada então serviceKey pertence ao catálogo fechado de serviços', () => {
+    for (const entry of PORTAL_ROUTE_MANIFEST) {
+      if (entry.serviceKey) {
+        expect(
+          (PORTAL_SERVICE_KEYS as readonly string[]).includes(entry.serviceKey),
+          `serviceKey fora do catálogo: ${entry.serviceKey}`,
+        ).toBe(true);
+      }
+    }
+  });
+});
diff --git a/apps/portal/web/src/app/app.route-manifest.ts b/apps/portal/web/src/app/app.route-manifest.ts
new file mode 100644
index 0000000..c7d658f
--- /dev/null
+++ b/apps/portal/web/src/app/app.route-manifest.ts
@@ -0,0 +1,396 @@
+// Manifesto de rotas do Portal (plan.md M7): uma entrada por rota de portal-frontends.md §4 +
+// as rotas auxiliares fixadas em M7, transcrito de work/rounds/R-0014/route-manifest.md
+// (38 rotas, 27 telas, 14 módulos). É a fonte única de `PORTAL_ROUTES` (`app.routes.ts` deriva
+// guardas, `title`, `data.screen` e módulo de cada entrada) e a tabela que os testes
+// tela ↔ ficha ↔ rota ↔ guarda verificam. Não importa `src/testing/` (transcrição independente).
+
+export type PortalAccess =
+  'anonimo' | 'simples' | 'avancada' | 'nenhum_ou_simples';
+
+export type EntitlementKind =
+  'ait' | 'request' | 'vehicle' | 'crash' | 'exam' | 'manifestation';
+
+export type PortalModule =
+  | 'core'
+  | 'catalogo'
+  | 'autos'
+  | 'defesa'
+  | 'indicacao'
+  | 'pagamento'
+  | 'processos'
+  | 'notificacoes'
+  | 'documentos'
+  | 'sinistros'
+  | 'exames'
+  | 'atendimento'
+  | 'privacidade'
+  | 'assinatura';
+
+export interface RouteManifestEntry {
+  /** Como na tabela §4, sem barra inicial. */
+  readonly path: string;
+  readonly screen: `T-${string}` | null;
+  readonly sheet: `IU-PORTAL-T${string}` | null;
+  readonly module: PortalModule;
+  readonly access: PortalAccess;
+  readonly entitlement?: {
+    readonly kind: EntitlementKind;
+    readonly param: string;
+  };
+  readonly serviceKey?: string;
+  readonly journeys: readonly string[];
+}
+
+export const PORTAL_ROUTE_MANIFEST: readonly RouteManifestEntry[] = [
+  {
+    path: '',
+    screen: null,
+    sheet: null,
+    module: 'core',
+    access: 'anonimo',
+    journeys: [],
+  },
+  {
+    path: 'carta-servicos',
+    screen: 'T-25',
+    sheet: 'IU-PORTAL-T25',
+    module: 'catalogo',
+    access: 'anonimo',
+    journeys: [],
+  },
+  {
+    path: 'carta-servicos/:serviceKey',
+    screen: 'T-25',
+    sheet: 'IU-PORTAL-T25',
+    module: 'catalogo',
+    access: 'anonimo',
+    journeys: [],
+  },
+  {
+    path: 'pontuacao/como-funciona',
+    screen: 'T-15',
+    sheet: 'IU-PORTAL-T15',
+    module: 'catalogo',
+    access: 'anonimo',
+    journeys: ['JRN-PORTAL-004'],
+  },
+  {
+    path: 'acessibilidade',
+    screen: null,
+    sheet: null,
+    module: 'core',
+    access: 'anonimo',
+    journeys: [],
+  },
+  {
+    path: 'auth/callback',
+    screen: null,
+    sheet: null,
+    module: 'core',
+    access: 'anonimo',
+    journeys: [],
+  },
+  {
+    path: 'inicio',
+    screen: null,
+    sheet: null,
+    module: 'core',
+    access: 'simples',
+    journeys: [],
+  },
+  {
+    path: 'autos',
+    screen: 'T-14',
+    sheet: 'IU-PORTAL-T14',
+    module: 'autos',
+    access: 'simples',
+    serviceKey: 'consulta_multas',
+    journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-004', 'JRN-PORTAL-005'],
+  },
+  {
+    path: 'autos/:aitId',
+    screen: 'T-01',
+    sheet: 'IU-PORTAL-T01',
+    module: 'autos',
+    access: 'simples',
+    entitlement: { kind: 'ait', param: 'aitId' },
+    serviceKey: 'consulta_multas',
+    journeys: [
+      'JRN-PORTAL-001',
+      'JRN-PORTAL-002',
+      'JRN-PORTAL-004',
+      'JRN-PORTAL-005',
+    ],
+  },
+  {
+    path: 'autos/:aitId/defesa/nova',
+    screen: 'T-02',
+    sheet: 'IU-PORTAL-T02',
+    module: 'defesa',
+    access: 'avancada',
+    entitlement: { kind: 'ait', param: 'aitId' },
+    serviceKey: 'defesa_previa',
+    journeys: ['JRN-PORTAL-001'],
+  },
+  {
+    path: 'autos/:aitId/condutor/nova',
+    screen: 'T-05',
+    sheet: 'IU-PORTAL-T05',
+    module: 'indicacao',
+    access: 'avancada',
+    entitlement: { kind: 'ait', param: 'aitId' },
+    serviceKey: 'indicacao_condutor',
+    journeys: ['JRN-PORTAL-002'],
+  },
+  {
+    path: 'autos/:aitId/pagamento',
+    screen: 'T-13',
+    sheet: 'IU-PORTAL-T13',
+    module: 'pagamento',
+    access: 'simples',
+    entitlement: { kind: 'ait', param: 'aitId' },
+    serviceKey: 'pagamento',
+    journeys: ['JRN-PORTAL-004', 'JRN-PORTAL-005', 'JRN-PORTAL-010'],
+  },
+  {
+    path: 'autos/:aitId/pagamento/preservando-recurso',
+    screen: 'T-23',
+    sheet: 'IU-PORTAL-T23',
+    module: 'pagamento',
+    access: 'simples',
+    entitlement: { kind: 'ait', param: 'aitId' },
+    serviceKey: 'pagamento',
+    journeys: ['JRN-PORTAL-010'],
+  },
+  {
+    path: 'processos',
+    screen: 'T-06',
+    sheet: 'IU-PORTAL-T06',
+    module: 'processos',
+    access: 'simples',
+    journeys: ['JRN-PORTAL-003'],
+  },
+  {
+    path: 'processos/:requestId',
+    screen: 'T-07',
+    sheet: 'IU-PORTAL-T07',
+    module: 'processos',
+    access: 'simples',
+    entitlement: { kind: 'request', param: 'requestId' },
+    journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-003'],
+  },
+  {
+    path: 'processos/:requestId/diligencia/:diligenceId',
+    screen: 'T-11',
+    sheet: 'IU-PORTAL-T11',
+    module: 'processos',
+    access: 'simples',
+    entitlement: { kind: 'request', param: 'requestId' },
+    journeys: ['JRN-PORTAL-003'],
+  },
+  {
+    path: 'processos/:requestId/desistencia',
+    screen: 'T-08',
+    sheet: 'IU-PORTAL-T08',
+    module: 'processos',
+    access: 'simples',
+    entitlement: { kind: 'request', param: 'requestId' },
+    journeys: [],
+  },
+  {
+    path: 'processos/:requestId/decisao',
+    screen: 'T-10',
+    sheet: 'IU-PORTAL-T10',
+    module: 'processos',
+    access: 'simples',
+    entitlement: { kind: 'request', param: 'requestId' },
+    journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-003'],
+  },
+  {
+    path: 'processos/:requestId/jari/nova',
+    screen: 'T-03',
+    sheet: 'IU-PORTAL-T03',
+    module: 'defesa',
+    access: 'avancada',
+    entitlement: { kind: 'request', param: 'requestId' },
+    serviceKey: 'recurso_jari',
+    journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-010'],
+  },
+  {
+    path: 'processos/:requestId/cetran/nova',
+    screen: 'T-04',
+    sheet: 'IU-PORTAL-T04',
+    module: 'defesa',
+    access: 'avancada',
+    entitlement: { kind: 'request', param: 'requestId' },
+    serviceKey: 'recurso_cetran',
+    journeys: ['JRN-PORTAL-001'],
+  },
+  {
+    path: 'notificacoes',
+    screen: 'T-12',
+    sheet: 'IU-PORTAL-T12',
+    module: 'notificacoes',
+    access: 'simples',
+    journeys: ['JRN-PORTAL-002', 'JRN-PORTAL-003', 'JRN-PORTAL-005'],
+  },
+  {
+    path: 'notificacoes/preferencias',
+    screen: null,
+    sheet: null,
+    module: 'notificacoes',
+    access: 'simples',
+    journeys: [],
+  },
+  {
+    path: 'sne',
+    screen: 'T-09',
+    sheet: 'IU-PORTAL-T09',
+    module: 'notificacoes',
+    access: 'simples',
+    serviceKey: 'adesao_sne',
+    journeys: ['JRN-PORTAL-005'],
+  },
+  {
+    path: 'documentos/cnh-digital',
+    screen: 'T-16',
+    sheet: 'IU-PORTAL-T16',
+    module: 'documentos',
+    access: 'simples',
+    serviceKey: 'consulta_cnh',
+    journeys: ['JRN-PORTAL-006'],
+  },
+  {
+    path: 'veiculos',
+    screen: null,
+    sheet: null,
+    module: 'documentos',
+    access: 'simples',
+    journeys: [],
+  },
+  {
+    path: 'veiculos/:vehicleId/crlv-e',
+    screen: 'T-17',
+    sheet: 'IU-PORTAL-T17',
+    module: 'documentos',
+    access: 'simples',
+    entitlement: { kind: 'vehicle', param: 'vehicleId' },
+    serviceKey: 'emissao_crlv',
+    journeys: ['JRN-PORTAL-006'],
+  },
+  {
+    path: 'sinistros',
+    screen: 'T-18',
+    sheet: 'IU-PORTAL-T18',
+    module: 'sinistros',
+    access: 'simples',
+    serviceKey: 'consulta_bat',
+    journeys: ['JRN-PORTAL-007'],
+  },
+  {
+    path: 'sinistros/:crashId',
+    screen: 'T-19',
+    sheet: 'IU-PORTAL-T19',
+    module: 'sinistros',
+    access: 'simples',
+    entitlement: { kind: 'crash', param: 'crashId' },
+    serviceKey: 'consulta_bat',
+    journeys: ['JRN-PORTAL-007'],
+  },
+  {
+    path: 'exames',
+    screen: 'T-20',
+    sheet: 'IU-PORTAL-T20',
+    module: 'exames',
+    access: 'simples',
+    serviceKey: 'consulta_exame',
+    journeys: ['JRN-PORTAL-008'],
+  },
+  {
+    path: 'exames/:examId/junta/nova',
+    screen: null,
+    sheet: null,
+    module: 'exames',
+    access: 'avancada',
+    entitlement: { kind: 'exam', param: 'examId' },
+    serviceKey: 'junta_medica',
+    journeys: ['JRN-PORTAL-008'],
+  },
+  {
+    path: 'ouvidoria/nova',
+    screen: 'T-21',
+    sheet: 'IU-PORTAL-T21',
+    module: 'atendimento',
+    access: 'nenhum_ou_simples',
+    serviceKey: 'manifestar',
+    journeys: ['JRN-PORTAL-009'],
+  },
+  {
+    path: 'ouvidoria/:manifestationId',
+    screen: 'T-22',
+    sheet: 'IU-PORTAL-T22',
+    module: 'atendimento',
+    access: 'simples',
+    entitlement: { kind: 'manifestation', param: 'manifestationId' },
+    serviceKey: 'acompanhar_manifestacao',
+    journeys: ['JRN-PORTAL-009'],
+  },
+  {
+    path: 'avaliacao/:requestId',
+    screen: 'T-26',
+    sheet: 'IU-PORTAL-T26',
+    module: 'atendimento',
+    access: 'simples',
+    entitlement: { kind: 'request', param: 'requestId' },
+    serviceKey: 'avaliar',
+    journeys: ['JRN-PORTAL-009'],
+  },
+  {
+    path: 'privacidade/meus-dados',
+    screen: 'T-24',
+    sheet: 'IU-PORTAL-T24',
+    module: 'privacidade',
+    access: 'simples',
+    serviceKey: 'lgpd_declaracao',
+    journeys: ['JRN-PORTAL-011'],
+  },
+  {
+    path: 'assinatura/elevacao',
+    screen: 'T-27',
+    sheet: 'IU-PORTAL-T27',
+    module: 'assinatura',
+    access: 'simples',
+    journeys: ['JRN-PORTAL-001'],
+  },
+  {
+    path: 'conta',
+    screen: null,
+    sheet: null,
+    module: 'core',
+    access: 'simples',
+    journeys: [],
+  },
+  {
+    path: 'vinculo/por-que-nao-vejo',
+    screen: null,
+    sheet: null,
+    module: 'core',
+    access: 'simples',
+    journeys: [],
+  },
+  {
+    path: 'servico-indisponivel/:serviceKey',
+    screen: null,
+    sheet: null,
+    module: 'core',
+    access: 'simples',
+    journeys: [],
+  },
+];
+
+/** Entradas de um módulo, na ordem do manifesto. */
+export function manifestEntriesOf(
+  module: PortalModule,
+): readonly RouteManifestEntry[] {
+  return PORTAL_ROUTE_MANIFEST.filter((entry) => entry.module === module);
+}
diff --git a/apps/portal/web/src/app/app.routes.spec.ts b/apps/portal/web/src/app/app.routes.spec.ts
new file mode 100644
index 0000000..fb00868
--- /dev/null
+++ b/apps/portal/web/src/app/app.routes.spec.ts
@@ -0,0 +1,77 @@
+// R-0014 TASK-0002 (Inspector). `PORTAL_ROUTES` (M7 do plan.md) achatado recursivamente
+// (`children` e `loadChildren`, carregados no teste) e comparado ao conjunto de `path` do
+// manifesto (prompt §B.2): cobertura total e nenhuma rota a mais; toda rota do manifesto tem
+// `title`; a rota `**` existe e resolve para uma página "não encontrada" (`data-screen=""`).
+import type { Route, Routes } from '@angular/router';
+import { PORTAL_ROUTES } from './app.routes';
+import { PORTAL_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture';
+import {
+  createPortalRouterHarness,
+  screenElement,
+} from '../testing/router-harness';
+
+interface FlatRoute {
+  readonly path: string;
+  readonly title: Route['title'];
+}
+
+function joinPath(prefix: string, segment: string): string {
+  return [prefix, segment].filter((part) => part !== '').join('/');
+}
+
+async function flatten(routes: Routes, prefix = ''): Promise<FlatRoute[]> {
+  const result: FlatRoute[] = [];
+  for (const route of routes) {
+    if (route.path === '**') continue; // rota coringa: validada à parte
+    if (route.path === undefined) continue; // sem path próprio (nunca deveria ocorrer no manifesto)
+    const path = joinPath(prefix, route.path);
+    result.push({ path, title: route.title });
+    if (route.children) {
+      result.push(...(await flatten(route.children, path)));
+    }
+    if (route.loadChildren) {
+      const loaded = await route.loadChildren();
+      const childRoutes = (
+        Array.isArray(loaded) ? loaded : (loaded as { default: Routes }).default
+      ) as Routes;
+      result.push(...(await flatten(childRoutes, path)));
+    }
+  }
+  return result;
+}
+
+describe('PORTAL_ROUTES', () => {
+  it('dado PORTAL_ROUTES achatado (children + loadChildren) quando comparado ao manifesto então cobre todo path e nenhum a mais', async () => {
+    const flat = await flatten(PORTAL_ROUTES);
+    const actualPaths = new Set(flat.map((route) => route.path));
+    const expectedPaths = new Set(
+      PORTAL_ROUTE_MANIFEST_FIXTURE.map((entry) => entry.path),
+    );
+    expect(actualPaths).toEqual(expectedPaths);
+  });
+
+  it('dado cada rota do manifesto quando localizada em PORTAL_ROUTES então tem title', async () => {
+    const flat = await flatten(PORTAL_ROUTES);
+    const byPath = new Map(flat.map((route) => [route.path, route]));
+    for (const entry of PORTAL_ROUTE_MANIFEST_FIXTURE) {
+      const route = byPath.get(entry.path);
+      expect(
+        route,
+        `rota ausente em PORTAL_ROUTES: ${entry.path}`,
+      ).toBeDefined();
+      expect(route?.title, `rota sem title: ${entry.path}`).toBeDefined();
+    }
+  });
+
+  it('dado PORTAL_ROUTES quando inspecionado então a rota ** existe', () => {
+    expect(PORTAL_ROUTES.some((route) => route.path === '**')).toBe(true);
+  });
+
+  it('dado uma URL fora do manifesto quando navega então resolve a rota ** com data-screen=""', async () => {
+    const { harness } = await createPortalRouterHarness(PORTAL_ROUTES, []);
+    await harness.navigateByUrl('/rota-inexistente-jamais-declarada');
+    const element = screenElement(harness);
+    expect(element).not.toBeNull();
+    expect(element?.getAttribute('data-screen')).toBe('');
+  });
+});
diff --git a/apps/portal/web/src/app/app.routes.ts b/apps/portal/web/src/app/app.routes.ts
new file mode 100644
index 0000000..eba3f50
--- /dev/null
+++ b/apps/portal/web/src/app/app.routes.ts
@@ -0,0 +1,159 @@
+// PORTAL_ROUTES (plan.md M7/M8; portal-frontends.md §4): árvore derivada de
+// `PORTAL_ROUTE_MANIFEST`. O módulo `core` é carregado no bootstrap; os 13 módulos de feature
+// são lazy (`features/<module>/<module>.routes.ts`, caminhos completos dentro do chunk,
+// `canMatch` pelo primeiro segmento). Guardas por rota vêm da fábrica (auth → assurance →
+// availability → entitlement). Títulos: `portal.shell.title.<slug>` no `core`;
+// `portal.states.unavailable_in_version` nas placeholder (títulos reais: TASK-0006).
+import type { Routes } from '@angular/router';
+import { providePortalI18nFallback } from './core/i18n-fallback';
+import {
+  moduleRoutes,
+  ownsFirstSegment,
+  type ManifestRouteOptions,
+} from './core/manifest-routes';
+import { AuthCallbackPageComponent } from './core/pages/auth-callback.page';
+import { EntitlementMissingPageComponent } from './core/pages/entitlement-missing.page';
+import { HomePageComponent } from './core/pages/home.page';
+import { NotFoundPageComponent } from './core/pages/not-found.page';
+import { ServiceUnavailablePageComponent } from './core/pages/service-unavailable.page';
+
+/** Páginas do `core` por caminho do manifesto; as demais rotas do `core` são placeholder. */
+const CORE_PAGES: Readonly<Record<string, ManifestRouteOptions>> = {
+  '': { component: HomePageComponent, title: 'portal.shell.title.home' },
+  acessibilidade: { title: 'portal.shell.title.acessibilidade' },
+  'auth/callback': {
+    component: AuthCallbackPageComponent,
+    title: 'portal.shell.title.auth_callback',
+  },
+  inicio: { title: 'portal.shell.title.inicio' },
+  conta: { title: 'portal.shell.title.conta' },
+  'vinculo/por-que-nao-vejo': {
+    component: EntitlementMissingPageComponent,
+    title: 'portal.shell.title.vinculo',
+  },
+  'servico-indisponivel/:serviceKey': {
+    component: ServiceUnavailablePageComponent,
+    title: 'portal.shell.title.servico_indisponivel',
+  },
+};
+
+/**
+ * Montagens lazy dos 13 módulos de feature: `path: ''` + `canMatch` pelo primeiro segmento
+ * (o chunk só carrega quando a URL é dele). Ficam antes das rotas do `core` porque a home
+ * também tem `path: ''` e deve ser a última entrada desse caminho na árvore.
+ */
+const FEATURE_MOUNTS: Routes = [
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('carta-servicos', 'pontuacao')],
+    loadChildren: () =>
+      import('./features/catalogo/catalogo.routes').then(
+        (m) => m.CATALOGO_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('autos', 'processos')],
+    loadChildren: () =>
+      import('./features/defesa/defesa.routes').then((m) => m.DEFESA_ROUTES),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('autos')],
+    loadChildren: () =>
+      import('./features/indicacao/indicacao.routes').then(
+        (m) => m.INDICACAO_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('autos')],
+    loadChildren: () =>
+      import('./features/pagamento/pagamento.routes').then(
+        (m) => m.PAGAMENTO_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('autos')],
+    loadChildren: () =>
+      import('./features/autos/autos.routes').then((m) => m.AUTOS_ROUTES),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('processos')],
+    loadChildren: () =>
+      import('./features/processos/processos.routes').then(
+        (m) => m.PROCESSOS_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('notificacoes', 'sne')],
+    loadChildren: () =>
+      import('./features/notificacoes/notificacoes.routes').then(
+        (m) => m.NOTIFICACOES_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('documentos', 'veiculos')],
+    loadChildren: () =>
+      import('./features/documentos/documentos.routes').then(
+        (m) => m.DOCUMENTOS_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('sinistros')],
+    loadChildren: () =>
+      import('./features/sinistros/sinistros.routes').then(
+        (m) => m.SINISTROS_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('exames')],
+    loadChildren: () =>
+      import('./features/exames/exames.routes').then((m) => m.EXAMES_ROUTES),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('ouvidoria', 'avaliacao')],
+    loadChildren: () =>
+      import('./features/atendimento/atendimento.routes').then(
+        (m) => m.ATENDIMENTO_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('privacidade')],
+    loadChildren: () =>
+      import('./features/privacidade/privacidade.routes').then(
+        (m) => m.PRIVACIDADE_ROUTES,
+      ),
+  },
+  {
+    path: '',
+    canMatch: [ownsFirstSegment('assinatura')],
+    loadChildren: () =>
+      import('./features/assinatura/assinatura.routes').then(
+        (m) => m.ASSINATURA_ROUTES,
+      ),
+  },
+];
+
+export const PORTAL_ROUTES: Routes = [
+  {
+    path: '',
+    providers: providePortalI18nFallback(),
+    children: [...FEATURE_MOUNTS, ...moduleRoutes('core', CORE_PAGES)],
+  },
+  {
+    path: '**',
+    providers: providePortalI18nFallback(),
+    title: 'portal.states.not_found',
+    component: NotFoundPageComponent,
+    data: { screen: '' },
+  },
+];
diff --git a/apps/portal/web/src/app/core/auth-flow.service.ts b/apps/portal/web/src/app/core/auth-flow.service.ts
new file mode 100644
index 0000000..5f951f0
--- /dev/null
+++ b/apps/portal/web/src/app/core/auth-flow.service.ts
@@ -0,0 +1,42 @@
+// Fluxo de entrada/retorno OIDC (portal-frontends.md §4: `/` entrada gov.br; `/auth/callback`
+// retorno OIDC). Separado de `SessionFacade` (modelo de leitura, M8) porque conclui e inicia a
+// sessão STYNX. O `StynxSessionService` é opcional só para que as páginas `/` e `/auth/callback`
+// rendam fora de `provideDetranAuthenticatedApp` (harness de rotas dos specs); sob o bootstrap
+// real ele sempre existe.
+import { Injectable, inject } from '@angular/core';
+import { Router } from '@angular/router';
+import { StynxSessionService } from '@stynx-nyx/angular-auth';
+import { ResumeService } from './resume.service';
+
+export const DEFAULT_LANDING_ROUTE = '/inicio';
+
+@Injectable({ providedIn: 'root' })
+export class AuthFlowService {
+  private readonly stynx = inject(StynxSessionService, { optional: true });
+  private readonly resume = inject(ResumeService);
+  private readonly router = inject(Router);
+
+  /** Há um provedor OIDC configurado neste injetor. */
+  get available(): boolean {
+    return this.stynx !== null;
+  }
+
+  /** Guarda a rota a retomar e redireciona ao gov.br (Cognito federado). */
+  login(retomar?: string | null): void {
+    if (retomar) this.resume.save({ route: retomar, draft: null });
+    this.stynx?.login();
+  }
+
+  /**
+   * Conclui a sessão STYNX a partir da URL de retorno e navega à rota retomada (ou a
+   * `/inicio`). Devolve `false` quando não há sessão a concluir.
+   */
+  async completeLogin(url: string): Promise<boolean> {
+    if (!this.stynx) return false;
+    const state = await this.stynx.completeLogin(url);
+    if (!state.active) return false;
+    const target = this.resume.resume()?.route ?? DEFAULT_LANDING_ROUTE;
+    await this.router.navigateByUrl(target);
+    return true;
+  }
+}
diff --git a/apps/portal/web/src/app/core/brand.service.spec.ts b/apps/portal/web/src/app/core/brand.service.spec.ts
new file mode 100644
index 0000000..f38e637
--- /dev/null
+++ b/apps/portal/web/src/app/core/brand.service.spec.ts
@@ -0,0 +1,71 @@
+// R-0014 TASK-0002 (Inspector, iteração 2 — adenda A1). `BrandService` (M7/§5.1 de
+// portal-frontends.md): `GET /v1/portal/brand` ok → marca; erro → estado `unavailable` com
+// marca neutra (`portal.shell.brand.neutral`, namespace mínimo M9) sem lançar.
+// `provideHttpClientTesting`. Corpo de sucesso = contrato real (`portal-route-contract.md`
+// §2: `platform.tenant_brand_profile`) — `{ displayName, shortName, legalName, primaryColor,
+// supportUrl, privacyUrl, accessibilityUrl, serviceContact, locale, timeZone }`; não há
+// `logoUrl` (OD-P47 proposta, sem chave até decisão). `state()` segue `core/brand.service.ts`
+// (`AvailableBrand`): `name` = `displayName`, sem `logoUrl`.
+import { TestBed } from '@angular/core/testing';
+import { provideHttpClient } from '@angular/common/http';
+import {
+  HttpTestingController,
+  provideHttpClientTesting,
+} from '@angular/common/http/testing';
+import { BrandService } from './brand.service';
+
+describe('BrandService', () => {
+  function setup() {
+    TestBed.configureTestingModule({
+      providers: [provideHttpClient(), provideHttpClientTesting()],
+    });
+    return {
+      service: TestBed.inject(BrandService),
+      httpMock: TestBed.inject(HttpTestingController),
+    };
+  }
+
+  afterEach(() => {
+    TestBed.inject(HttpTestingController).verify();
+  });
+
+  it('dado GET /v1/portal/brand com sucesso quando load() é chamado então marca o estado com a marca recebida', async () => {
+    const { service, httpMock } = setup();
+    const loadPromise = service.load();
+    const request = httpMock.expectOne('/v1/portal/brand');
+    expect(request.request.method).toBe('GET');
+    request.flush({
+      displayName: 'DETRAN Exemplo',
+      shortName: 'DETRAN',
+      legalName: 'Departamento Estadual de Trânsito Exemplo',
+      primaryColor: '#0B5FFF',
+      supportUrl: 'https://exemplo.detran.gov.br/atendimento',
+      privacyUrl: 'https://exemplo.detran.gov.br/privacidade',
+      accessibilityUrl: 'https://exemplo.detran.gov.br/acessibilidade',
+      serviceContact: 'atendimento@exemplo.detran.gov.br',
+      locale: 'pt-BR',
+      timeZone: 'America/Sao_Paulo',
+    });
+    await loadPromise;
+    expect(service.state()).toEqual({
+      status: 'available',
+      name: 'DETRAN Exemplo',
+      supportUrl: 'https://exemplo.detran.gov.br/atendimento',
+      privacyUrl: 'https://exemplo.detran.gov.br/privacidade',
+      accessibilityUrl: 'https://exemplo.detran.gov.br/acessibilidade',
+      primaryColor: '#0B5FFF',
+    });
+  });
+
+  it('dado GET /v1/portal/brand com erro quando load() é chamado então não lança e cai em estado unavailable com marca neutra', async () => {
+    const { service, httpMock } = setup();
+    const loadPromise = service.load();
+    const request = httpMock.expectOne('/v1/portal/brand');
+    request.flush('erro', { status: 500, statusText: 'Internal Server Error' });
+    await expect(loadPromise).resolves.not.toThrow();
+    expect(service.state()).toEqual({
+      status: 'unavailable',
+      neutralLabelKey: 'portal.shell.brand.neutral',
+    });
+  });
+});
diff --git a/apps/portal/web/src/app/core/brand.service.ts b/apps/portal/web/src/app/core/brand.service.ts
new file mode 100644
index 0000000..7e3c0aa
--- /dev/null
+++ b/apps/portal/web/src/app/core/brand.service.ts
@@ -0,0 +1,60 @@
+// BrandService (portal-frontends.md §5.1; plan.md M7): `GET /v1/portal/brand` (público; tenant
+// pelo `Host`, contrato §1.5/§2) → marca do órgão no cabeçalho do `CitizenShell`. Qualquer erro
+// (404 `PORTAL.NOT_FOUND` sem linha de marca, 5xx, rede) cai no estado `unavailable` com a marca
+// neutra `portal.shell.brand.neutral`, sem lançar e sem quebrar o shell.
+import { Injectable, computed, inject, signal } from '@angular/core';
+import { PortalClient, type BrandProfile } from '../data/portal.client';
+
+export const NEUTRAL_BRAND_KEY = 'portal.shell.brand.neutral';
+
+export interface AvailableBrand {
+  readonly status: 'available';
+  /** `displayName` do contrato (`GET brand`). */
+  readonly name: string;
+  readonly supportUrl?: string;
+  readonly privacyUrl?: string;
+  readonly accessibilityUrl?: string;
+  readonly primaryColor?: string;
+}
+
+export interface UnavailableBrand {
+  readonly status: 'unavailable';
+  readonly neutralLabelKey: typeof NEUTRAL_BRAND_KEY;
+}
+
+export type BrandState = AvailableBrand | UnavailableBrand;
+
+export const NEUTRAL_BRAND: UnavailableBrand = Object.freeze({
+  status: 'unavailable',
+  neutralLabelKey: NEUTRAL_BRAND_KEY,
+});
+
+function toBrandState(profile: BrandProfile): BrandState {
+  if (!profile.displayName) return NEUTRAL_BRAND;
+  return {
+    status: 'available',
+    name: profile.displayName,
+    supportUrl: profile.supportUrl,
+    privacyUrl: profile.privacyUrl,
+    accessibilityUrl: profile.accessibilityUrl,
+    primaryColor: profile.primaryColor,
+  };
+}
+
+@Injectable({ providedIn: 'root' })
+export class BrandService {
+  private readonly client = inject(PortalClient);
+  private readonly brand = signal<BrandState>(NEUTRAL_BRAND);
+
+  readonly state = this.brand.asReadonly();
+  readonly available = computed(() => this.brand().status === 'available');
+
+  /** Carrega a marca uma vez no bootstrap; nunca rejeita. */
+  async load(): Promise<void> {
+    try {
+      this.brand.set(toBrandState(await this.client.brand()));
+    } catch {
+      this.brand.set(NEUTRAL_BRAND);
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/core/citizen-shell.component.spec.ts b/apps/portal/web/src/app/core/citizen-shell.component.spec.ts
new file mode 100644
index 0000000..29b6813
--- /dev/null
+++ b/apps/portal/web/src/app/core/citizen-shell.component.spec.ts
@@ -0,0 +1,97 @@
+// R-0014 TASK-0002 (Inspector). `CitizenShellComponent` (M7/M9 do plan.md;
+// portal-frontends.md §5.1): 5 destinos de navegação, rodapé, skip link — todos via chave
+// i18n. O texto exato é do Engineer (TASK-0004); aqui só a CHAVE é testada, nunca o texto
+// (prompt §Definições que valem como contrato). Usa o `StynxTranslatePipe`/`StynxI18nModule`
+// reais (`@stynx-nyx/angular-i18n` 1.3.1) com um catálogo de teste próprio: cada chave
+// esperada mapeia para um marcador único, então nenhuma letra deve sobrar fora dos
+// marcadores nas landmarks `nav`/`footer` — prova de que nenhum literal escapa do catálogo.
+import { TestBed } from '@angular/core/testing';
+import { provideRouter } from '@angular/router';
+import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
+import { CitizenShellComponent } from './citizen-shell.component';
+
+const EXPECTED_KEYS = [
+  'portal.shell.nav.inicio',
+  'portal.shell.nav.autos',
+  'portal.shell.nav.processos',
+  'portal.shell.nav.atualizacoes',
+  'portal.shell.nav.documentos',
+  'portal.shell.footer.carta',
+  'portal.shell.footer.presencial',
+  'portal.shell.footer.acessibilidade',
+  'portal.shell.footer.privacidade',
+  'portal.a11y.skip_link',
+] as const;
+
+function markerFor(key: string): string {
+  return `MARCADOR::${key}::FIM`;
+}
+
+const TEST_CATALOG: Record<string, string> = Object.fromEntries(
+  EXPECTED_KEYS.map((key) => [key, markerFor(key)]),
+);
+
+function withoutLetters(text: string): string {
+  return EXPECTED_KEYS.reduce(
+    (acc, key) => acc.split(markerFor(key)).join(''),
+    text,
+  );
+}
+
+describe('CitizenShellComponent', () => {
+  beforeEach(async () => {
+    TestBed.configureTestingModule({
+      imports: [
+        CitizenShellComponent,
+        StynxI18nModule.forRoot({
+          defaultLocale: 'pt-BR',
+          loadCatalog: async () => TEST_CATALOG,
+        }),
+      ],
+      providers: [provideRouter([])],
+    });
+    await TestBed.inject(StynxI18nService).initialize();
+  });
+
+  it('dado o catálogo de teste quando o shell renderiza então os 5 destinos usam portal.shell.nav.{inicio,autos,processos,atualizacoes,documentos}', () => {
+    const fixture = TestBed.createComponent(CitizenShellComponent);
+    fixture.detectChanges();
+    const nav = fixture.nativeElement.querySelector('nav');
+    expect(nav, 'shell sem landmark <nav>').not.toBeNull();
+    const navText = nav?.textContent ?? '';
+    for (const key of [
+      'portal.shell.nav.inicio',
+      'portal.shell.nav.autos',
+      'portal.shell.nav.processos',
+      'portal.shell.nav.atualizacoes',
+      'portal.shell.nav.documentos',
+    ]) {
+      expect(navText).toContain(markerFor(key));
+    }
+    expect(withoutLetters(navText)).not.toMatch(/\p{L}/u);
+  });
+
+  it('dado o catálogo de teste quando o shell renderiza então o rodapé usa portal.shell.footer.{carta,presencial,acessibilidade,privacidade}', () => {
+    const fixture = TestBed.createComponent(CitizenShellComponent);
+    fixture.detectChanges();
+    const footer = fixture.nativeElement.querySelector('footer');
+    expect(footer, 'shell sem landmark <footer>').not.toBeNull();
+    const footerText = footer?.textContent ?? '';
+    for (const key of [
+      'portal.shell.footer.carta',
+      'portal.shell.footer.presencial',
+      'portal.shell.footer.acessibilidade',
+      'portal.shell.footer.privacidade',
+    ]) {
+      expect(footerText).toContain(markerFor(key));
+    }
+    expect(withoutLetters(footerText)).not.toMatch(/\p{L}/u);
+  });
+
+  it('dado o catálogo de teste quando o shell renderiza então o skip link usa portal.a11y.skip_link', () => {
+    const fixture = TestBed.createComponent(CitizenShellComponent);
+    fixture.detectChanges();
+    const text = fixture.nativeElement.textContent as string;
+    expect(text).toContain(markerFor('portal.a11y.skip_link'));
+  });
+});
diff --git a/apps/portal/web/src/app/core/citizen-shell.component.ts b/apps/portal/web/src/app/core/citizen-shell.component.ts
new file mode 100644
index 0000000..ec6183a
--- /dev/null
+++ b/apps/portal/web/src/app/core/citizen-shell.component.ts
@@ -0,0 +1,208 @@
+// CitizenShell (portal-frontends.md §1/§5.1; plan.md M7): cabeçalho com a marca do tenant
+// (`BrandService`) ou neutra, navegação de 5 destinos, rodapé de 4 links, skip link,
+// `<main id="conteudo">` com `router-outlet` e região `aria-live` para estados. Componente de
+// apresentação: recebe a marca e o estado por `input()`; todo texto visível passa pelo
+// `stynxTranslate` (chaves `portal.shell.*`, `portal.a11y.*`).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+} from '@angular/core';
+import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
+import { StynxToastContainerComponent, StynxTranslatePipe } from '@detran/ui';
+import { NEUTRAL_BRAND, type BrandState } from './brand.service';
+
+export interface ShellLink {
+  readonly key: string;
+  readonly route: string;
+}
+
+/** Cinco destinos (spec §5.1): Início · Autos · Processos · Atualizações · Documentos. */
+export const SHELL_NAVIGATION: readonly ShellLink[] = [
+  { key: 'portal.shell.nav.inicio', route: '/inicio' },
+  { key: 'portal.shell.nav.autos', route: '/autos' },
+  { key: 'portal.shell.nav.processos', route: '/processos' },
+  { key: 'portal.shell.nav.atualizacoes', route: '/notificacoes' },
+  { key: 'portal.shell.nav.documentos', route: '/documentos/cnh-digital' },
+];
+
+interface FooterLink extends ShellLink {
+  readonly external?: string;
+}
+
+@Component({
+  selector: 'portal-citizen-shell',
+  imports: [
+    RouterLink,
+    RouterLinkActive,
+    RouterOutlet,
+    StynxToastContainerComponent,
+    StynxTranslatePipe,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  template: `
+    <a class="portal-skip-link" href="#conteudo">{{
+      'portal.a11y.skip_link' | stynxTranslate
+    }}</a>
+    <header class="portal-header">
+      <a class="portal-brand" routerLink="/">
+        @if (brand().status === 'available') {
+          {{ brandName() }}
+        } @else {
+          {{ neutralKey() | stynxTranslate }}
+        }
+      </a>
+      <nav
+        class="portal-nav"
+        [attr.aria-label]="'portal.a11y.nav_main' | stynxTranslate"
+      >
+        @for (item of navigation; track item.key) {
+          <a
+            [routerLink]="item.route"
+            routerLinkActive="portal-nav-active"
+            ariaCurrentWhenActive="page"
+            >{{ item.key | stynxTranslate }}</a
+          >
+        }
+      </nav>
+    </header>
+    <div
+      class="portal-status"
+      role="status"
+      aria-live="polite"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (statusKey()) {
+        {{ statusKey() | stynxTranslate }}
+      }
+    </div>
+    <main id="conteudo" class="portal-main" tabindex="-1">
+      <router-outlet />
+    </main>
+    <footer
+      class="portal-footer"
+      [attr.aria-label]="'portal.a11y.nav_footer' | stynxTranslate"
+    >
+      @for (item of footer(); track item.key) {
+        @if (item.external) {
+          <a [href]="item.external" rel="noopener">{{
+            item.key | stynxTranslate
+          }}</a>
+        } @else {
+          <a [routerLink]="item.route">{{ item.key | stynxTranslate }}</a>
+        }
+      }
+    </footer>
+    <stynx-toast-container />
+  `,
+  styles: `
+    :host {
+      display: grid;
+      grid-template-rows: auto auto 1fr auto;
+      min-height: 100dvh;
+    }
+    .portal-skip-link {
+      position: absolute;
+      left: -999px;
+      top: 0;
+      padding: 0.5rem 1rem;
+      background: var(--detran-color-surface);
+      color: var(--detran-color-primary-strong);
+      z-index: 10;
+    }
+    .portal-skip-link:focus {
+      left: 0;
+    }
+    .portal-header {
+      display: flex;
+      flex-wrap: wrap;
+      align-items: center;
+      gap: 1rem;
+      padding: 0.75rem 1.25rem;
+      color: #fff;
+      background: var(--detran-color-primary-strong);
+    }
+    .portal-brand {
+      color: inherit;
+      font-weight: 700;
+      text-decoration: none;
+    }
+    .portal-nav {
+      display: flex;
+      flex-wrap: wrap;
+      gap: 0.25rem;
+      margin-inline-start: auto;
+    }
+    .portal-nav a {
+      padding: 0.5rem 0.75rem;
+      color: inherit;
+      border-radius: var(--stynx-radius);
+      text-decoration: none;
+    }
+    .portal-nav a.portal-nav-active,
+    .portal-nav a:hover {
+      background: var(--detran-color-primary);
+      text-decoration: underline;
+    }
+    .portal-status {
+      min-height: 1.5rem;
+      padding: 0 1.25rem;
+    }
+    .portal-main {
+      min-width: 0;
+      padding: 1.5rem 1.25rem;
+    }
+    .portal-footer {
+      display: flex;
+      flex-wrap: wrap;
+      gap: 1rem;
+      padding: 1rem 1.25rem;
+      border-top: 1px solid var(--detran-border-color);
+      background: var(--detran-color-surface);
+    }
+  `,
+})
+export class CitizenShellComponent {
+  readonly brand = input<BrandState>(NEUTRAL_BRAND);
+  /** Chave i18n anunciada na região `aria-live` (ex.: `portal.states.loading`). */
+  readonly statusKey = input<string>('');
+
+  readonly navigation = SHELL_NAVIGATION;
+
+  readonly brandName = computed(() => {
+    const brand = this.brand();
+    return brand.status === 'available' ? brand.name : '';
+  });
+
+  readonly neutralKey = computed(() => {
+    const brand = this.brand();
+    return brand.status === 'unavailable'
+      ? brand.neutralLabelKey
+      : NEUTRAL_BRAND.neutralLabelKey;
+  });
+
+  /** Rodapé (spec §5.1): Carta de Serviços, presencial, acessibilidade, privacidade. */
+  readonly footer = computed<readonly FooterLink[]>(() => {
+    const brand = this.brand();
+    const urls = brand.status === 'available' ? brand : null;
+    return [
+      { key: 'portal.shell.footer.carta', route: '/carta-servicos' },
+      {
+        key: 'portal.shell.footer.presencial',
+        route: '/carta-servicos',
+        external: urls?.supportUrl,
+      },
+      {
+        key: 'portal.shell.footer.acessibilidade',
+        route: '/acessibilidade',
+        external: urls?.accessibilityUrl,
+      },
+      {
+        key: 'portal.shell.footer.privacidade',
+        route: '/privacidade/meus-dados',
+        external: urls?.privacyUrl,
+      },
+    ];
+  });
+}
diff --git a/apps/portal/web/src/app/core/entitlement.facade.ts b/apps/portal/web/src/app/core/entitlement.facade.ts
new file mode 100644
index 0000000..37eb90b
--- /dev/null
+++ b/apps/portal/web/src/app/core/entitlement.facade.ts
@@ -0,0 +1,43 @@
+// EntitlementFacade (plan.md M8; portal-route-contract.md §1.2): o vínculo CPF ↔ recurso é
+// decidido no servidor. `check` lê o recurso: 200 prova o vínculo; 404 `PORTAL.NOT_FOUND`
+// (disfarce de inexistência) ou qualquer `PORTAL.ENTITLEMENT_*` o nega. Outros erros (rede,
+// 5xx) não são "sem vínculo": propagam para o `ErrorBoundary`. Token abstrato substituível por
+// `useValue` nos testes (detran-ui-guide.md §5).
+import { Injectable, inject } from '@angular/core';
+import { PortalClient, type EntitlementKind } from '../data/portal.client';
+import { classifyError } from './error-boundary';
+
+export type { EntitlementKind } from '../data/portal.client';
+
+const ENTITLEMENT_CODE_PREFIX = 'PORTAL.ENTITLEMENT_';
+const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
+
+export function deniesEntitlement(error: unknown): boolean {
+  const { code, status } = classifyError(error);
+  if (code === NOT_FOUND_CODE) return true;
+  if (code?.startsWith(ENTITLEMENT_CODE_PREFIX)) return true;
+  return status === 404;
+}
+
+@Injectable({
+  providedIn: 'root',
+  useFactory: () => inject(PortalEntitlementFacade),
+})
+export abstract class EntitlementFacade {
+  abstract check(kind: EntitlementKind, id: string): Promise<boolean>;
+}
+
+@Injectable({ providedIn: 'root' })
+export class PortalEntitlementFacade extends EntitlementFacade {
+  private readonly client = inject(PortalClient);
+
+  async check(kind: EntitlementKind, id: string): Promise<boolean> {
+    try {
+      await this.client.entitledResource(kind, id);
+      return true;
+    } catch (error) {
+      if (deniesEntitlement(error)) return false;
+      throw error;
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/core/error-boundary.ts b/apps/portal/web/src/app/core/error-boundary.ts
new file mode 100644
index 0000000..aacdea8
--- /dev/null
+++ b/apps/portal/web/src/app/core/error-boundary.ts
@@ -0,0 +1,54 @@
+// ErrorBoundary (portal-frontends.md §5.1; portal-error-catalog.md §8): mapeia o código
+// `PORTAL.<CODE>` de uma resposta de erro para a chave i18n `portal.errors.<code minúsculo>`.
+// Só o mapeamento nesta entrega — o catálogo de mensagens (`portal.errors.*`) é transcrito no
+// CTG-0002 (TASK-0006). Nenhuma mensagem é montada aqui: a UI só traduz a chave.
+import { HttpErrorResponse } from '@angular/common/http';
+import type { PortalErrorBody } from '../data/portal.client';
+
+export const PORTAL_ERROR_PREFIX = 'PORTAL.';
+export const PORTAL_ERRORS_NAMESPACE = 'portal.errors';
+
+export interface ClassifiedError {
+  /** Código canônico (`PORTAL.NOT_FOUND`), ou `null` quando a resposta não é do catálogo. */
+  readonly code: string | null;
+  readonly status: number;
+  /** Chave i18n (`portal.errors.not_found`), ou `null` quando não há código catalogado. */
+  readonly messageKey: string | null;
+  readonly requestId?: string;
+}
+
+/** `PORTAL.REQUEST_OUT_OF_DEADLINE` → `portal.errors.request_out_of_deadline`. */
+export function messageKeyFor(code: string): string {
+  const bare = code.startsWith(PORTAL_ERROR_PREFIX)
+    ? code.slice(PORTAL_ERROR_PREFIX.length)
+    : code;
+  return `${PORTAL_ERRORS_NAMESPACE}.${bare.toLowerCase()}`;
+}
+
+function isPortalErrorBody(value: unknown): value is PortalErrorBody {
+  return (
+    typeof value === 'object' &&
+    value !== null &&
+    typeof (value as { code?: unknown }).code === 'string'
+  );
+}
+
+/** Extrai o corpo de erro do domínio `portal`, se a resposta o carrega. */
+export function portalErrorBody(error: unknown): PortalErrorBody | null {
+  if (error instanceof HttpErrorResponse && isPortalErrorBody(error.error)) {
+    return error.error;
+  }
+  return null;
+}
+
+export function classifyError(error: unknown): ClassifiedError {
+  const body = portalErrorBody(error);
+  const status = error instanceof HttpErrorResponse ? error.status : 0;
+  if (!body) return { code: null, status, messageKey: null };
+  return {
+    code: body.code,
+    status: body.status || status,
+    messageKey: body.messageKey ?? messageKeyFor(body.code),
+    requestId: body.requestId,
+  };
+}
diff --git a/apps/portal/web/src/app/core/guards/assurance.guard.spec.ts b/apps/portal/web/src/app/core/guards/assurance.guard.spec.ts
new file mode 100644
index 0000000..3bb284f
--- /dev/null
+++ b/apps/portal/web/src/app/core/guards/assurance.guard.spec.ts
@@ -0,0 +1,90 @@
+// R-0014 TASK-0002 (Inspector). `assuranceGuard(level)` isolado (M8): ordem
+// `simples < avancada < qualificada`; nunca exige `qualificada` ([RN-PORTAL-101], plan.md M8).
+import { TestBed } from '@angular/core/testing';
+import type {
+  ActivatedRouteSnapshot,
+  RouterStateSnapshot,
+} from '@angular/router';
+import { Router, UrlTree } from '@angular/router';
+import { assuranceGuard } from './assurance.guard';
+import { SessionFacade } from '../session.facade';
+import {
+  createSessionFacadeStub,
+  type AssuranceLevel,
+} from '../../../testing/session-facade.stub';
+
+function routerState(url: string): RouterStateSnapshot {
+  return { url } as RouterStateSnapshot;
+}
+
+function configure(assuranceLevel: AssuranceLevel | null) {
+  TestBed.configureTestingModule({
+    providers: [
+      {
+        provide: SessionFacade,
+        useValue: createSessionFacadeStub({ active: true, assuranceLevel }),
+      },
+    ],
+  });
+}
+
+describe('assuranceGuard', () => {
+  it('dado nível simples quando exige avancada então redireciona para /assinatura/elevacao com retomar', () => {
+    configure('simples');
+    const result = TestBed.runInInjectionContext(() =>
+      assuranceGuard('avancada')(
+        {} as ActivatedRouteSnapshot,
+        routerState('/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova'),
+      ),
+    );
+    expect(result).toBeInstanceOf(UrlTree);
+    const router = TestBed.inject(Router);
+    expect(router.serializeUrl(result as UrlTree)).toBe(
+      '/assinatura/elevacao?retomar=%2Fautos%2F00000000-0000-7000-8000-0000000000aa%2Fdefesa%2Fnova',
+    );
+  });
+
+  it('dado nível avancada quando exige avancada então permite', () => {
+    configure('avancada');
+    const result = TestBed.runInInjectionContext(() =>
+      assuranceGuard('avancada')(
+        {} as ActivatedRouteSnapshot,
+        routerState('/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova'),
+      ),
+    );
+    expect(result).toBe(true);
+  });
+
+  it('dado nível qualificada quando exige avancada então permite (nunca bloqueada)', () => {
+    configure('qualificada');
+    const result = TestBed.runInInjectionContext(() =>
+      assuranceGuard('avancada')(
+        {} as ActivatedRouteSnapshot,
+        routerState('/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova'),
+      ),
+    );
+    expect(result).toBe(true);
+  });
+
+  it('dado nível simples quando exige simples então permite', () => {
+    configure('simples');
+    const result = TestBed.runInInjectionContext(() =>
+      assuranceGuard('simples')(
+        {} as ActivatedRouteSnapshot,
+        routerState('/autos'),
+      ),
+    );
+    expect(result).toBe(true);
+  });
+
+  it('dado sessão sem nível (null) quando exige simples então redireciona para elevação', () => {
+    configure(null);
+    const result = TestBed.runInInjectionContext(() =>
+      assuranceGuard('simples')(
+        {} as ActivatedRouteSnapshot,
+        routerState('/autos'),
+      ),
+    );
+    expect(result).toBeInstanceOf(UrlTree);
+  });
+});
diff --git a/apps/portal/web/src/app/core/guards/assurance.guard.ts b/apps/portal/web/src/app/core/guards/assurance.guard.ts
new file mode 100644
index 0000000..af2666c
--- /dev/null
+++ b/apps/portal/web/src/app/core/guards/assurance.guard.ts
@@ -0,0 +1,25 @@
+// assuranceGuard(level) (plan.md M8; [UC-PORTAL-019]): nível da sessão abaixo do exigido →
+// `/assinatura/elevacao?retomar=<url>` (T-27 explica qual nível falta e retoma o ato). Ordem
+// `simples < avancada < qualificada`; nenhuma rota exige `qualificada` ([RN-PORTAL-101]) — o
+// tipo do parâmetro impede.
+import { inject } from '@angular/core';
+import { Router, type CanActivateFn } from '@angular/router';
+import { ASSURANCE_ORDER, SessionFacade } from '../session.facade';
+import { RESUME_QUERY_PARAM } from './auth.guard';
+
+export const ELEVATION_ROUTE = '/assinatura/elevacao';
+
+export function assuranceGuard(level: 'simples' | 'avancada'): CanActivateFn {
+  return (_route, state) => {
+    const current = inject(SessionFacade).assuranceLevel();
+    if (
+      current !== null &&
+      ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[level]
+    ) {
+      return true;
+    }
+    return inject(Router).createUrlTree([ELEVATION_ROUTE], {
+      queryParams: { [RESUME_QUERY_PARAM]: state.url },
+    });
+  };
+}
diff --git a/apps/portal/web/src/app/core/guards/auth.guard.spec.ts b/apps/portal/web/src/app/core/guards/auth.guard.spec.ts
new file mode 100644
index 0000000..215e7df
--- /dev/null
+++ b/apps/portal/web/src/app/core/guards/auth.guard.spec.ts
@@ -0,0 +1,50 @@
+// R-0014 TASK-0002 (Inspector). `portalAuthGuard` isolado (M7/M8 do plan.md). A cobertura
+// presença × ausência por rota do manifesto completo está em `app.guards-matrix.spec.ts`;
+// aqui só o comportamento do guarda em si, injeção mínima.
+import { TestBed } from '@angular/core/testing';
+import type {
+  ActivatedRouteSnapshot,
+  RouterStateSnapshot,
+} from '@angular/router';
+import { Router, UrlTree } from '@angular/router';
+import { portalAuthGuard } from './auth.guard';
+import { SessionFacade } from '../session.facade';
+import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
+
+function routerState(url: string): RouterStateSnapshot {
+  return { url } as RouterStateSnapshot;
+}
+
+describe('portalAuthGuard', () => {
+  it('dado sessão inativa quando ativa o guarda então redireciona para / com retomar=url', () => {
+    TestBed.configureTestingModule({
+      providers: [
+        {
+          provide: SessionFacade,
+          useValue: createSessionFacadeStub({ active: false }),
+        },
+      ],
+    });
+    const result = TestBed.runInInjectionContext(() =>
+      portalAuthGuard({} as ActivatedRouteSnapshot, routerState('/autos')),
+    );
+    expect(result).toBeInstanceOf(UrlTree);
+    const router = TestBed.inject(Router);
+    expect(router.serializeUrl(result as UrlTree)).toBe('/?retomar=%2Fautos');
+  });
+
+  it('dado sessão ativa quando ativa o guarda então permite a navegação', () => {
+    TestBed.configureTestingModule({
+      providers: [
+        {
+          provide: SessionFacade,
+          useValue: createSessionFacadeStub({ active: true }),
+        },
+      ],
+    });
+    const result = TestBed.runInInjectionContext(() =>
+      portalAuthGuard({} as ActivatedRouteSnapshot, routerState('/autos')),
+    );
+    expect(result).toBe(true);
+  });
+});
diff --git a/apps/portal/web/src/app/core/guards/auth.guard.ts b/apps/portal/web/src/app/core/guards/auth.guard.ts
new file mode 100644
index 0000000..714664b
--- /dev/null
+++ b/apps/portal/web/src/app/core/guards/auth.guard.ts
@@ -0,0 +1,16 @@
+// portalAuthGuard (plan.md M8; portal-frontends.md §3): sessão inativa → home pública com
+// `retomar=<url>` (a entrada gov.br devolve o cidadão à rota pedida). Nunca "acesso negado"
+// seco (invariante 8).
+import { inject } from '@angular/core';
+import { Router, type CanActivateFn } from '@angular/router';
+import { SessionFacade } from '../session.facade';
+
+export const RESUME_QUERY_PARAM = 'retomar';
+
+export const portalAuthGuard: CanActivateFn = (_route, state) => {
+  const session = inject(SessionFacade);
+  if (session.active()) return true;
+  return inject(Router).createUrlTree(['/'], {
+    queryParams: { [RESUME_QUERY_PARAM]: state.url },
+  });
+};
diff --git a/apps/portal/web/src/app/core/guards/entitlement.guard.spec.ts b/apps/portal/web/src/app/core/guards/entitlement.guard.spec.ts
new file mode 100644
index 0000000..f2006fb
--- /dev/null
+++ b/apps/portal/web/src/app/core/guards/entitlement.guard.spec.ts
@@ -0,0 +1,63 @@
+// R-0014 TASK-0002 (Inspector). `entitlementGuard(kind)` isolado (M8): id vem do parâmetro
+// de rota indicado pelo manifesto (`:aitId` para `kind: 'ait'`); falso → redireciona para
+// `/vinculo/por-que-nao-vejo?recurso=<kind>&id=<id>`.
+import { TestBed } from '@angular/core/testing';
+import type {
+  ActivatedRouteSnapshot,
+  RouterStateSnapshot,
+} from '@angular/router';
+import { convertToParamMap, Router, UrlTree } from '@angular/router';
+import { entitlementGuard } from './entitlement.guard';
+import { EntitlementFacade } from '../entitlement.facade';
+import { createEntitlementFacadeStub } from '../../../testing/entitlement-facade.stub';
+import { FIXED_ENTITY_ID } from '../../../testing/router-harness';
+
+function routeSnapshot(aitId: string): ActivatedRouteSnapshot {
+  return {
+    paramMap: convertToParamMap({ aitId }),
+  } as ActivatedRouteSnapshot;
+}
+
+function routerState(url: string): RouterStateSnapshot {
+  return { url } as RouterStateSnapshot;
+}
+
+describe('entitlementGuard', () => {
+  it('dado vínculo negado (check=false) quando ativa o guarda então redireciona para por-que-nao-vejo com recurso e id', () => {
+    TestBed.configureTestingModule({
+      providers: [
+        {
+          provide: EntitlementFacade,
+          useValue: createEntitlementFacadeStub(false),
+        },
+      ],
+    });
+    const url = `/autos/${FIXED_ENTITY_ID}`;
+    const resultPromise = TestBed.runInInjectionContext(() =>
+      entitlementGuard('ait')(routeSnapshot(FIXED_ENTITY_ID), routerState(url)),
+    );
+    return Promise.resolve(resultPromise).then((result) => {
+      expect(result).toBeInstanceOf(UrlTree);
+      const router = TestBed.inject(Router);
+      expect(router.serializeUrl(result as UrlTree)).toBe(
+        `/vinculo/por-que-nao-vejo?recurso=ait&id=${FIXED_ENTITY_ID}`,
+      );
+    });
+  });
+
+  it('dado vínculo confirmado (check=true) quando ativa o guarda então permite', async () => {
+    TestBed.configureTestingModule({
+      providers: [
+        {
+          provide: EntitlementFacade,
+          useValue: createEntitlementFacadeStub(true),
+        },
+      ],
+    });
+    const url = `/autos/${FIXED_ENTITY_ID}`;
+    const result = await TestBed.runInInjectionContext(() =>
+      entitlementGuard('ait')(routeSnapshot(FIXED_ENTITY_ID), routerState(url)),
+    );
+    expect(result).toBe(true);
+  });
+});
diff --git a/apps/portal/web/src/app/core/guards/entitlement.guard.ts b/apps/portal/web/src/app/core/guards/entitlement.guard.ts
new file mode 100644
index 0000000..1fa8577
--- /dev/null
+++ b/apps/portal/web/src/app/core/guards/entitlement.guard.ts
@@ -0,0 +1,29 @@
+// entitlementGuard(kind) (plan.md M8; portal-route-contract.md §1.2): o id vem do parâmetro de
+// rota do manifesto (`:aitId` para `ait`, …); vínculo negado → tela "por que não vejo isto"
+// (`/vinculo/por-que-nao-vejo?recurso=<kind>&id=<id>`), nunca 404 nem "acesso negado".
+import { inject } from '@angular/core';
+import { Router, type CanActivateFn } from '@angular/router';
+import { EntitlementFacade, type EntitlementKind } from '../entitlement.facade';
+
+export const ENTITLEMENT_MISSING_ROUTE = '/vinculo/por-que-nao-vejo';
+
+export const ENTITLEMENT_PARAM: Readonly<Record<EntitlementKind, string>> = {
+  ait: 'aitId',
+  request: 'requestId',
+  vehicle: 'vehicleId',
+  crash: 'crashId',
+  exam: 'examId',
+  manifestation: 'manifestationId',
+};
+
+export function entitlementGuard(kind: EntitlementKind): CanActivateFn {
+  return async (route) => {
+    const id = route.paramMap.get(ENTITLEMENT_PARAM[kind]) ?? '';
+    const facade = inject(EntitlementFacade);
+    const router = inject(Router);
+    if (id && (await facade.check(kind, id))) return true;
+    return router.createUrlTree([ENTITLEMENT_MISSING_ROUTE], {
+      queryParams: { recurso: kind, id },
+    });
+  };
+}
diff --git a/apps/portal/web/src/app/core/guards/service-availability.guard.spec.ts b/apps/portal/web/src/app/core/guards/service-availability.guard.spec.ts
new file mode 100644
index 0000000..026868e
--- /dev/null
+++ b/apps/portal/web/src/app/core/guards/service-availability.guard.spec.ts
@@ -0,0 +1,81 @@
+// R-0014 TASK-0002 (Inspector). `serviceAvailabilityGuard(serviceKey)` isolado (M8):
+// `unavailable` → `/servico-indisponivel/<key>`; `partially_available` → permite (a tela
+// limita o escopo); nunca 404.
+import { TestBed } from '@angular/core/testing';
+import type {
+  ActivatedRouteSnapshot,
+  RouterStateSnapshot,
+} from '@angular/router';
+import { Router, UrlTree } from '@angular/router';
+import { serviceAvailabilityGuard } from './service-availability.guard';
+import { ServiceCatalogFacade } from '../service-catalog.facade';
+import { createServiceCatalogFacadeStub } from '../../../testing/service-catalog-facade.stub';
+
+function routerState(url: string): RouterStateSnapshot {
+  return { url } as RouterStateSnapshot;
+}
+
+describe('serviceAvailabilityGuard', () => {
+  it('dado serviço indisponível quando ativa o guarda então redireciona para /servico-indisponivel/<key>', async () => {
+    TestBed.configureTestingModule({
+      providers: [
+        {
+          provide: ServiceCatalogFacade,
+          useValue: createServiceCatalogFacadeStub({
+            status: 'unavailable',
+            reason: 'delegacao_indisponivel_r0007',
+          }),
+        },
+      ],
+    });
+    const result = await TestBed.runInInjectionContext(() =>
+      serviceAvailabilityGuard('consulta_multas')(
+        {} as ActivatedRouteSnapshot,
+        routerState('/autos'),
+      ),
+    );
+    expect(result).toBeInstanceOf(UrlTree);
+    const router = TestBed.inject(Router);
+    expect(router.serializeUrl(result as UrlTree)).toBe(
+      '/servico-indisponivel/consulta_multas',
+    );
+  });
+
+  it('dado serviço parcialmente disponível quando ativa o guarda então permite', async () => {
+    TestBed.configureTestingModule({
+      providers: [
+        {
+          provide: ServiceCatalogFacade,
+          useValue: createServiceCatalogFacadeStub({
+            status: 'partially_available',
+          }),
+        },
+      ],
+    });
+    const result = await TestBed.runInInjectionContext(() =>
+      serviceAvailabilityGuard('consulta_multas')(
+        {} as ActivatedRouteSnapshot,
+        routerState('/autos'),
+      ),
+    );
+    expect(result).toBe(true);
+  });
+
+  it('dado serviço disponível quando ativa o guarda então permite', async () => {
+    TestBed.configureTestingModule({
+      providers: [
+        {
+          provide: ServiceCatalogFacade,
+          useValue: createServiceCatalogFacadeStub({ status: 'available' }),
+        },
+      ],
+    });
+    const result = await TestBed.runInInjectionContext(() =>
+      serviceAvailabilityGuard('consulta_multas')(
+        {} as ActivatedRouteSnapshot,
+        routerState('/autos'),
+      ),
+    );
+    expect(result).toBe(true);
+  });
+});
diff --git a/apps/portal/web/src/app/core/guards/service-availability.guard.ts b/apps/portal/web/src/app/core/guards/service-availability.guard.ts
new file mode 100644
index 0000000..d07dd68
--- /dev/null
+++ b/apps/portal/web/src/app/core/guards/service-availability.guard.ts
@@ -0,0 +1,18 @@
+// serviceAvailabilityGuard(serviceKey) (plan.md M8/M15): o catálogo diz `unavailable` →
+// `/servico-indisponivel/<key>` (motivo + canal alternativo, nunca 404);
+// `partially_available` entra na tela, que limita o escopo.
+import { inject } from '@angular/core';
+import { Router, type CanActivateFn } from '@angular/router';
+import { ServiceCatalogFacade } from '../service-catalog.facade';
+
+export const SERVICE_UNAVAILABLE_ROUTE = '/servico-indisponivel';
+
+export function serviceAvailabilityGuard(serviceKey: string): CanActivateFn {
+  return async () => {
+    const facade = inject(ServiceCatalogFacade);
+    const router = inject(Router);
+    const availability = await facade.availability(serviceKey);
+    if (availability.status !== 'unavailable') return true;
+    return router.createUrlTree([SERVICE_UNAVAILABLE_ROUTE, serviceKey]);
+  };
+}
diff --git a/apps/portal/web/src/app/core/i18n-fallback.ts b/apps/portal/web/src/app/core/i18n-fallback.ts
new file mode 100644
index 0000000..e895f11
--- /dev/null
+++ b/apps/portal/web/src/app/core/i18n-fallback.ts
@@ -0,0 +1,35 @@
+// Fallback de i18n para injetores de rota (plan.md M9): o `StynxTranslatePipe` exige o
+// `StynxI18nService`, que só `StynxI18nModule.forRoot` (dentro de `provideDetranAuthenticatedApp`)
+// fornece. Nas rotas, estes providers delegam ao serviço do injetor pai quando ele existe (o
+// caso do bootstrap real: mesma instância, mesmo catálogo) e só criam um serviço vazio quando
+// não existe (harness `provideRouter(PORTAL_ROUTES)` dos specs): as chaves são exibidas cruas,
+// nada quebra. Nunca registrar `StynxI18nModule.forRoot` aqui (detran-ui-guide.md §1).
+import { inject, type Provider } from '@angular/core';
+import {
+  STYNX_I18N_OPTIONS,
+  StynxI18nService,
+  type StynxI18nModuleOptions,
+} from '@stynx-nyx/angular-i18n';
+
+const EMPTY_OPTIONS: StynxI18nModuleOptions = {
+  defaultLocale: 'pt-BR',
+  supportedLocales: ['pt-BR'],
+  loadCatalog: async () => ({}),
+};
+
+export function providePortalI18nFallback(): Provider[] {
+  return [
+    {
+      provide: STYNX_I18N_OPTIONS,
+      useFactory: () =>
+        inject(STYNX_I18N_OPTIONS, { skipSelf: true, optional: true }) ??
+        EMPTY_OPTIONS,
+    },
+    {
+      provide: StynxI18nService,
+      useFactory: () =>
+        inject(StynxI18nService, { skipSelf: true, optional: true }) ??
+        new StynxI18nService(),
+    },
+  ];
+}
diff --git a/apps/portal/web/src/app/core/manifest-routes.ts b/apps/portal/web/src/app/core/manifest-routes.ts
new file mode 100644
index 0000000..14c081c
--- /dev/null
+++ b/apps/portal/web/src/app/core/manifest-routes.ts
@@ -0,0 +1,83 @@
+// Fábrica de rotas a partir do manifesto (plan.md M7/M8): cada entrada vira uma `Route` com
+// `title`, `data.screen`, componente (placeholder até o CTG-0003) e guardas na ordem fixada —
+// auth → assurance → availability → entitlement. `anonimo` e `nenhum_ou_simples`: sem guarda
+// (sessão opcional). Os módulos lazy (`features/<module>/<module>.routes.ts`) só chamam
+// `moduleRoutes(<module>)` e trocam componentes por rota quando existirem.
+import type { Type } from '@angular/core';
+import type {
+  CanActivateFn,
+  CanMatchFn,
+  Route,
+  Routes,
+  UrlSegment,
+} from '@angular/router';
+import {
+  manifestEntriesOf,
+  type PortalModule,
+  type RouteManifestEntry,
+} from '../app.route-manifest';
+import { PlaceholderPageComponent } from '../shared/placeholder-page.component';
+import { assuranceGuard } from './guards/assurance.guard';
+import { portalAuthGuard } from './guards/auth.guard';
+import { entitlementGuard } from './guards/entitlement.guard';
+import { serviceAvailabilityGuard } from './guards/service-availability.guard';
+
+/** Título das rotas ainda não construídas (plan.md M8; TASK-0006 traz os títulos reais). */
+export const PLACEHOLDER_TITLE_KEY = 'portal.states.unavailable_in_version';
+
+export interface ManifestRouteOptions {
+  readonly component?: Type<unknown>;
+  readonly title?: string;
+}
+
+export function guardsFor(entry: RouteManifestEntry): CanActivateFn[] {
+  const guards: CanActivateFn[] = [];
+  if (entry.access === 'simples' || entry.access === 'avancada') {
+    guards.push(portalAuthGuard, assuranceGuard(entry.access));
+  }
+  if (entry.serviceKey) {
+    guards.push(serviceAvailabilityGuard(entry.serviceKey));
+  }
+  if (entry.entitlement) {
+    guards.push(entitlementGuard(entry.entitlement.kind));
+  }
+  return guards;
+}
+
+export function manifestRoute(
+  entry: RouteManifestEntry,
+  options: ManifestRouteOptions = {},
+): Route {
+  return {
+    path: entry.path,
+    ...(entry.path === '' ? { pathMatch: 'full' as const } : {}),
+    title: options.title ?? PLACEHOLDER_TITLE_KEY,
+    component: options.component ?? PlaceholderPageComponent,
+    canActivate: guardsFor(entry),
+    data: {
+      screen: entry.screen ?? '',
+      sheet: entry.sheet,
+      module: entry.module,
+      access: entry.access,
+    },
+  };
+}
+
+/** Rotas de um módulo, na ordem do manifesto, com os componentes indicados por `path`. */
+export function moduleRoutes(
+  module: PortalModule,
+  options: Readonly<Record<string, ManifestRouteOptions>> = {},
+): Routes {
+  return manifestEntriesOf(module).map((entry) =>
+    manifestRoute(entry, options[entry.path] ?? {}),
+  );
+}
+
+/**
+ * `canMatch` de um módulo lazy montado em `path: ''`: só carrega o chunk quando o primeiro
+ * segmento da URL pertence ao módulo (os caminhos completos ficam dentro do chunk).
+ */
+export function ownsFirstSegment(...segments: readonly string[]): CanMatchFn {
+  return (_route: Route, url: UrlSegment[]) =>
+    url.length > 0 && segments.includes(url[0].path);
+}
diff --git a/apps/portal/web/src/app/core/offline-document.store.ts b/apps/portal/web/src/app/core/offline-document.store.ts
new file mode 100644
index 0000000..6778bc9
--- /dev/null
+++ b/apps/portal/web/src/app/core/offline-document.store.ts
@@ -0,0 +1,165 @@
+// OfflineDocumentStore (portal-frontends.md §5.1/§8; plan.md M14): cache cifrado de CNH-e e
+// CRLV-e com validade — os únicos conteúdos offline do Portal ([UC-PORTAL-011] AC-4). Cifra com
+// AES-GCM (`crypto.subtle`) e chave derivada (HKDF) do `sid` da sessão STYNX, mantida só em
+// memória e nunca persistida; o texto cifrado fica em `sessionStorage` (morre com a aba, como a
+// chave). Sem `sid` (sessão inativa) nada é gravado nem lido. Testes no CTG-0003.
+import { Injectable, inject } from '@angular/core';
+import { StynxSessionService } from '@stynx-nyx/angular-auth';
+
+export type OfflineDocumentKind = 'cnh-e' | 'crlv-e';
+
+export interface OfflineDocument<T = unknown> {
+  readonly kind: OfflineDocumentKind;
+  readonly document: T;
+  /** ISO-8601, devolvido pelo servidor junto com o documento. */
+  readonly validUntil: string;
+}
+
+interface StoredEnvelope {
+  readonly iv: string;
+  readonly payload: string;
+}
+
+const STORAGE_PREFIX = 'portal-offline-document';
+const HKDF_SALT = 'portal-offline-document-v1';
+const IV_BYTES = 12;
+
+function storage(): Storage | null {
+  try {
+    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
+  } catch {
+    return null;
+  }
+}
+
+function toBase64(bytes: Uint8Array): string {
+  let binary = '';
+  for (const byte of bytes) binary += String.fromCharCode(byte);
+  return btoa(binary);
+}
+
+function fromBase64(text: string): Uint8Array<ArrayBuffer> {
+  const binary = atob(text);
+  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
+  for (let index = 0; index < binary.length; index += 1) {
+    bytes[index] = binary.charCodeAt(index);
+  }
+  return bytes;
+}
+
+@Injectable({ providedIn: 'root' })
+export class OfflineDocumentStore {
+  private readonly session = inject(StynxSessionService);
+  private readonly encoder = new TextEncoder();
+  private readonly decoder = new TextDecoder();
+  private keyCache: { sid: string; key: Promise<CryptoKey> } | null = null;
+
+  async put<T>(
+    kind: OfflineDocumentKind,
+    document: T,
+    validUntil: string,
+  ): Promise<void> {
+    const key = await this.sessionKey();
+    const store = storage();
+    if (!key || !store) return;
+    const iv = crypto.getRandomValues(
+      new Uint8Array(new ArrayBuffer(IV_BYTES)),
+    );
+    const plain = this.encoder.encode(
+      JSON.stringify({
+        kind,
+        document,
+        validUntil,
+      } satisfies OfflineDocument<T>),
+    );
+    const cipher = await crypto.subtle.encrypt(
+      { name: 'AES-GCM', iv },
+      key,
+      plain,
+    );
+    const envelope: StoredEnvelope = {
+      iv: toBase64(iv),
+      payload: toBase64(new Uint8Array(cipher)),
+    };
+    store.setItem(this.storageKey(kind), JSON.stringify(envelope));
+  }
+
+  /** Devolve o documento se existir, decifrar e ainda estiver dentro da validade. */
+  async get<T = unknown>(
+    kind: OfflineDocumentKind,
+    now: Date = new Date(),
+  ): Promise<OfflineDocument<T> | null> {
+    const key = await this.sessionKey();
+    const store = storage();
+    if (!key || !store) return null;
+    const raw = store.getItem(this.storageKey(kind));
+    if (!raw) return null;
+    try {
+      const envelope = JSON.parse(raw) as StoredEnvelope;
+      const plain = await crypto.subtle.decrypt(
+        { name: 'AES-GCM', iv: fromBase64(envelope.iv) },
+        key,
+        fromBase64(envelope.payload),
+      );
+      const parsed = JSON.parse(
+        this.decoder.decode(plain),
+      ) as OfflineDocument<T>;
+      if (new Date(parsed.validUntil).getTime() <= now.getTime()) {
+        store.removeItem(this.storageKey(kind));
+        return null;
+      }
+      return parsed;
+    } catch {
+      store.removeItem(this.storageKey(kind));
+      return null;
+    }
+  }
+
+  clear(): void {
+    const store = storage();
+    if (!store) return;
+    for (const kind of ['cnh-e', 'crlv-e'] as const) {
+      store.removeItem(this.storageKey(kind));
+    }
+    this.keyCache = null;
+  }
+
+  private storageKey(kind: OfflineDocumentKind): string {
+    return `${STORAGE_PREFIX}:${kind}`;
+  }
+
+  /** Chave AES-GCM 256 derivada do `sid` corrente; `null` sem sessão ativa. */
+  private sessionKey(): Promise<CryptoKey | null> {
+    const sid = this.session.state().sid;
+    if (!sid) {
+      this.keyCache = null;
+      return Promise.resolve(null);
+    }
+    if (this.keyCache?.sid !== sid) {
+      this.keyCache = { sid, key: this.deriveKey(sid) };
+    }
+    return this.keyCache.key;
+  }
+
+  private async deriveKey(sid: string): Promise<CryptoKey> {
+    const material = await crypto.subtle.importKey(
+      'raw',
+      this.encoder.encode(sid),
+      'HKDF',
+      false,
+      ['deriveKey'],
+    );
+    return crypto.subtle.deriveKey(
+      {
+        name: 'HKDF',
+        hash: 'SHA-256',
+        salt: this.encoder.encode(HKDF_SALT),
+        info: this.encoder.encode(STORAGE_PREFIX),
+      },
+      material,
+      { name: 'AES-GCM', length: 256 },
+      false,
+      ['encrypt', 'decrypt'],
+    );
+  }
+}
diff --git a/apps/portal/web/src/app/core/pages/auth-callback.page.ts b/apps/portal/web/src/app/core/pages/auth-callback.page.ts
new file mode 100644
index 0000000..12c8d7a
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/auth-callback.page.ts
@@ -0,0 +1,58 @@
+// `/auth/callback` (portal-frontends.md §4: retorno OIDC): conclui a sessão STYNX a partir da
+// URL de retorno e navega à rota retomada (`ResumeService`) ou a `/inicio`. Enquanto conclui,
+// estado "carregando"; se não conclui, estado de erro com caminho de volta — nunca tela vazia.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DOCUMENT,
+  type OnInit,
+  inject,
+  signal,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  DetranErrorStateComponent,
+  DetranLoadingStateComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { AuthFlowService } from '../auth-flow.service';
+
+@Component({
+  selector: 'portal-auth-callback-page',
+  imports: [
+    RouterLink,
+    DetranErrorStateComponent,
+    DetranLoadingStateComponent,
+    StynxTranslatePipe,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { 'data-screen': '' },
+  template: `
+    <h1>{{ 'portal.shell.title.auth_callback' | stynxTranslate }}</h1>
+    @if (failed()) {
+      <detran-error-state
+        [title]="'portal.states.error' | stynxTranslate"
+        [message]="'portal.states.error' | stynxTranslate"
+      />
+      <p>
+        <a routerLink="/">{{ 'portal.common.action.home' | stynxTranslate }}</a>
+      </p>
+    } @else {
+      <detran-loading-state
+        [label]="'portal.states.loading' | stynxTranslate"
+      />
+    }
+  `,
+})
+export class AuthCallbackPageComponent implements OnInit {
+  private readonly auth = inject(AuthFlowService);
+  private readonly document = inject(DOCUMENT);
+
+  readonly failed = signal(false);
+
+  async ngOnInit(): Promise<void> {
+    const url = this.document.location?.href ?? '';
+    const completed = await this.auth.completeLogin(url).catch(() => false);
+    if (!completed) this.failed.set(true);
+  }
+}
diff --git a/apps/portal/web/src/app/core/pages/entitlement-missing.page.ts b/apps/portal/web/src/app/core/pages/entitlement-missing.page.ts
new file mode 100644
index 0000000..8d869c3
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/entitlement-missing.page.ts
@@ -0,0 +1,54 @@
+// `/vinculo/por-que-nao-vejo` (plan.md M7/M8; portal-error-catalog.md §8 `NOT_FOUND` /
+// `ENTITLEMENT_REQUIRED`): explica que não há vínculo com o registro e mostra os caminhos —
+// ouvidoria e atendimento presencial (invariantes 6 e 8: canal digital nunca é o único; nunca
+// "acesso negado" seco). `recurso`/`id` da query ficam em `data-*` para suporte (invariante 1).
+import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
+import { toSignal } from '@angular/core/rxjs-interop';
+import { ActivatedRoute, RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+import { map } from 'rxjs';
+
+@Component({
+  selector: 'portal-entitlement-missing-page',
+  imports: [RouterLink, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': '',
+    '[attr.data-recurso]': 'recurso()',
+    '[attr.data-id]': 'id()',
+  },
+  template: `
+    <h1>{{ 'portal.shell.title.vinculo' | stynxTranslate }}</h1>
+    <p>{{ 'portal.states.entitlement_missing' | stynxTranslate }}</p>
+    <ul>
+      <li>
+        <a routerLink="/ouvidoria/nova">{{
+          'portal.common.link.ouvidoria' | stynxTranslate
+        }}</a>
+      </li>
+      <li>
+        <a routerLink="/carta-servicos">{{
+          'portal.common.link.presencial' | stynxTranslate
+        }}</a>
+      </li>
+    </ul>
+    <p>
+      <a routerLink="/inicio">{{
+        'portal.common.action.home' | stynxTranslate
+      }}</a>
+    </p>
+  `,
+})
+export class EntitlementMissingPageComponent {
+  private readonly route = inject(ActivatedRoute);
+
+  readonly recurso = toSignal(
+    this.route.queryParamMap.pipe(map((params) => params.get('recurso'))),
+    { initialValue: null },
+  );
+
+  readonly id = toSignal(
+    this.route.queryParamMap.pipe(map((params) => params.get('id'))),
+    { initialValue: null },
+  );
+}
diff --git a/apps/portal/web/src/app/core/pages/home.page.ts b/apps/portal/web/src/app/core/pages/home.page.ts
new file mode 100644
index 0000000..ab329c3
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/home.page.ts
@@ -0,0 +1,46 @@
+// Home pública `/` (portal-frontends.md §4: "home pública → catálogo + entrada gov.br"; §3
+// anônimo). Nesta entrega: entrada gov.br (retomando `?retomar=<rota>` do `portalAuthGuard`)
+// e atalho para a Carta de Serviços; o catálogo (`GET /v1/portal/services`) chega com o módulo
+// `catalogo` (CTG-0003).
+import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
+import { toSignal } from '@angular/core/rxjs-interop';
+import { ActivatedRoute, RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+import { map } from 'rxjs';
+import { AuthFlowService } from '../auth-flow.service';
+import { RESUME_QUERY_PARAM } from '../guards/auth.guard';
+
+@Component({
+  selector: 'portal-home-page',
+  imports: [RouterLink, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { 'data-screen': '' },
+  template: `
+    <h1>{{ 'portal.shell.title.home' | stynxTranslate }}</h1>
+    <p>
+      <button type="button" class="portal-primary" (click)="login()">
+        {{ 'portal.common.action.login' | stynxTranslate }}
+      </button>
+    </p>
+    <p>
+      <a routerLink="/carta-servicos">{{
+        'portal.common.link.carta' | stynxTranslate
+      }}</a>
+    </p>
+  `,
+})
+export class HomePageComponent {
+  private readonly auth = inject(AuthFlowService);
+  private readonly route = inject(ActivatedRoute);
+
+  readonly retomar = toSignal(
+    this.route.queryParamMap.pipe(
+      map((params) => params.get(RESUME_QUERY_PARAM)),
+    ),
+    { initialValue: null },
+  );
+
+  login(): void {
+    this.auth.login(this.retomar());
+  }
+}
diff --git a/apps/portal/web/src/app/core/pages/not-found.page.ts b/apps/portal/web/src/app/core/pages/not-found.page.ts
new file mode 100644
index 0000000..5fbf24d
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/not-found.page.ts
@@ -0,0 +1,26 @@
+// Rota `**` (plan.md M7): "página não encontrada" com caminho de volta; `data-screen=""`.
+import { ChangeDetectionStrategy, Component } from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
+
+export const NOT_FOUND_KEY = 'portal.states.not_found';
+
+@Component({
+  selector: 'portal-not-found-page',
+  imports: [RouterLink, DetranErrorStateComponent, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { 'data-screen': '' },
+  template: `
+    <h1>{{ titleKey | stynxTranslate }}</h1>
+    <detran-error-state
+      [title]="titleKey | stynxTranslate"
+      [message]="titleKey | stynxTranslate"
+    />
+    <p>
+      <a routerLink="/">{{ 'portal.common.action.home' | stynxTranslate }}</a>
+    </p>
+  `,
+})
+export class NotFoundPageComponent {
+  readonly titleKey = NOT_FOUND_KEY;
+}
diff --git a/apps/portal/web/src/app/core/pages/service-unavailable.page.ts b/apps/portal/web/src/app/core/pages/service-unavailable.page.ts
new file mode 100644
index 0000000..d24ad40
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/service-unavailable.page.ts
@@ -0,0 +1,75 @@
+// `/servico-indisponivel/:serviceKey` (plan.md M7/M8/M15; portal-error-catalog.md §8
+// `SERVICE_UNAVAILABLE`): motivo do catálogo + canal alternativo, nunca 404. O motivo é um token
+// do catálogo (`unavailableReason`): fica em `data-token`, nunca é exibido cru (invariante 1);
+// o texto cidadão é `alternativeChannelNote`, redigido pelo órgão no catálogo.
+import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
+import { toSignal } from '@angular/core/rxjs-interop';
+import { ActivatedRoute, RouterLink } from '@angular/router';
+import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
+import { from, map, of, switchMap } from 'rxjs';
+import {
+  ServiceCatalogFacade,
+  type ServiceAvailability,
+} from '../service-catalog.facade';
+
+@Component({
+  selector: 'portal-service-unavailable-page',
+  imports: [RouterLink, DetranErrorStateComponent, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': '',
+    '[attr.data-service-key]': 'serviceKey()',
+    '[attr.data-token]': 'availability()?.reason ?? null',
+  },
+  template: `
+    <h1>{{ 'portal.shell.title.servico_indisponivel' | stynxTranslate }}</h1>
+    <detran-error-state
+      [title]="'portal.shell.title.servico_indisponivel' | stynxTranslate"
+      [message]="'portal.states.service_unavailable' | stynxTranslate"
+    />
+    @if (availability()?.alternativeChannelNote; as note) {
+      <h2>{{ 'portal.common.label.alternative_channel' | stynxTranslate }}</h2>
+      <p>{{ note }}</p>
+    }
+    <ul>
+      <li>
+        <a routerLink="/carta-servicos">{{
+          'portal.common.link.carta' | stynxTranslate
+        }}</a>
+      </li>
+      <li>
+        <a routerLink="/ouvidoria/nova">{{
+          'portal.common.link.ouvidoria' | stynxTranslate
+        }}</a>
+      </li>
+    </ul>
+    <p>
+      <a routerLink="/inicio">{{
+        'portal.common.action.home' | stynxTranslate
+      }}</a>
+    </p>
+  `,
+})
+export class ServiceUnavailablePageComponent {
+  private readonly route = inject(ActivatedRoute);
+  private readonly catalog = inject(ServiceCatalogFacade);
+
+  readonly serviceKey = toSignal(
+    this.route.paramMap.pipe(map((params) => params.get('serviceKey') ?? '')),
+    { initialValue: '' },
+  );
+
+  readonly availability = toSignal<ServiceAvailability | null>(
+    this.route.paramMap.pipe(
+      map((params) => params.get('serviceKey')),
+      switchMap((key) =>
+        key
+          ? from(this.catalog.availability(key)).pipe(
+              map((value): ServiceAvailability | null => value),
+            )
+          : of(null),
+      ),
+    ),
+    { initialValue: null },
+  );
+}
diff --git a/apps/portal/web/src/app/core/resume.service.spec.ts b/apps/portal/web/src/app/core/resume.service.spec.ts
new file mode 100644
index 0000000..b4f301b
--- /dev/null
+++ b/apps/portal/web/src/app/core/resume.service.spec.ts
@@ -0,0 +1,34 @@
+// R-0014 TASK-0002 (Inspector). `ResumeService` (M7/§5.1 de portal-frontends.md): guarda
+// `{ route, draft }` ao redirecionar para elevação ([UC-PORTAL-019] AC-4) e `resume()`
+// devolve e limpa (retomada única — não pode ser lida duas vezes).
+import { TestBed } from '@angular/core/testing';
+import { ResumeService } from './resume.service';
+
+describe('ResumeService', () => {
+  it('dado route e draft salvos via save() quando resume() é chamado então devolve o mesmo par', () => {
+    TestBed.configureTestingModule({});
+    const service = TestBed.inject(ResumeService);
+    service.save({
+      route: '/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova',
+      draft: { texto: 'rascunho' },
+    });
+    expect(service.resume()).toEqual({
+      route: '/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova',
+      draft: { texto: 'rascunho' },
+    });
+  });
+
+  it('dado um resume salvo quando resume() é chamado então limpa o estado (chamada seguinte devolve null)', () => {
+    TestBed.configureTestingModule({});
+    const service = TestBed.inject(ResumeService);
+    service.save({ route: '/sne', draft: null });
+    service.resume();
+    expect(service.resume()).toBeNull();
+  });
+
+  it('dado nenhum resume salvo quando resume() é chamado então devolve null', () => {
+    TestBed.configureTestingModule({});
+    const service = TestBed.inject(ResumeService);
+    expect(service.resume()).toBeNull();
+  });
+});
diff --git a/apps/portal/web/src/app/core/resume.service.ts b/apps/portal/web/src/app/core/resume.service.ts
new file mode 100644
index 0000000..f606b24
--- /dev/null
+++ b/apps/portal/web/src/app/core/resume.service.ts
@@ -0,0 +1,70 @@
+// ResumeService (portal-frontends.md §5.1; [UC-PORTAL-019] AC-4): guarda a rota e o rascunho ao
+// redirecionar para a elevação de nível e retoma onde parou. Estado em memória espelhado em
+// `sessionStorage` (sobrevive ao redirect OIDC, morre com a aba); nunca `localStorage` (spec §1
+// "Estado"). `resume()` é de uso único: devolve e limpa.
+import { Injectable } from '@angular/core';
+
+export interface ResumePoint {
+  readonly route: string;
+  readonly draft: unknown;
+}
+
+const STORAGE_KEY = 'portal-resume';
+
+function sessionStore(): Storage | null {
+  try {
+    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
+  } catch {
+    return null;
+  }
+}
+
+@Injectable({ providedIn: 'root' })
+export class ResumeService {
+  private point: ResumePoint | null = null;
+
+  save(point: ResumePoint): void {
+    this.point = point;
+    try {
+      sessionStore()?.setItem(STORAGE_KEY, JSON.stringify(point));
+    } catch {
+      // sessionStorage indisponível (modo privado/cota): a cópia em memória basta.
+    }
+  }
+
+  resume(): ResumePoint | null {
+    const point = this.point ?? this.read();
+    this.clear();
+    return point;
+  }
+
+  clear(): void {
+    this.point = null;
+    try {
+      sessionStore()?.removeItem(STORAGE_KEY);
+    } catch {
+      // idem
+    }
+  }
+
+  private read(): ResumePoint | null {
+    try {
+      const raw = sessionStore()?.getItem(STORAGE_KEY);
+      if (!raw) return null;
+      const parsed: unknown = JSON.parse(raw);
+      if (
+        typeof parsed === 'object' &&
+        parsed !== null &&
+        typeof (parsed as { route?: unknown }).route === 'string'
+      ) {
+        return {
+          route: (parsed as { route: string }).route,
+          draft: (parsed as { draft?: unknown }).draft ?? null,
+        };
+      }
+      return null;
+    } catch {
+      return null;
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/core/runtime-config.ts b/apps/portal/web/src/app/core/runtime-config.ts
new file mode 100644
index 0000000..08dac15
--- /dev/null
+++ b/apps/portal/web/src/app/core/runtime-config.ts
@@ -0,0 +1,40 @@
+// Leitura de `public/runtime-config.js` (portal-frontends.md §1; plan.md M4): o arquivo define
+// `window.__DETRAN_RUNTIME_CONFIG__` com exatamente três chaves, nenhuma delas segredo. O tenant
+// é decidido pelo `Host` no servidor (portal-route-contract.md §1.5); `tenantId` só semeia a
+// sessão. Qualquer chave ausente ou de tipo errado cai em string vazia (fallback seguro).
+
+export interface RuntimeConfig {
+  readonly tenantId: string;
+  readonly oidcAuthority: string;
+  readonly clientId: string;
+}
+
+declare global {
+  interface Window {
+    __DETRAN_RUNTIME_CONFIG__?: Partial<Record<keyof RuntimeConfig, unknown>>;
+  }
+}
+
+export const EMPTY_RUNTIME_CONFIG: RuntimeConfig = Object.freeze({
+  tenantId: '',
+  oidcAuthority: '',
+  clientId: '',
+});
+
+function asString(value: unknown): string {
+  return typeof value === 'string' ? value : '';
+}
+
+/** Lê a configuração do `window` (ou de uma fonte explícita, nos testes). */
+export function readRuntimeConfig(
+  source: Window['__DETRAN_RUNTIME_CONFIG__'] = typeof window === 'undefined'
+    ? undefined
+    : window.__DETRAN_RUNTIME_CONFIG__,
+): RuntimeConfig {
+  if (!source || typeof source !== 'object') return EMPTY_RUNTIME_CONFIG;
+  return {
+    tenantId: asString(source.tenantId),
+    oidcAuthority: asString(source.oidcAuthority),
+    clientId: asString(source.clientId),
+  };
+}
diff --git a/apps/portal/web/src/app/core/service-catalog.facade.ts b/apps/portal/web/src/app/core/service-catalog.facade.ts
new file mode 100644
index 0000000..cc424c9
--- /dev/null
+++ b/apps/portal/web/src/app/core/service-catalog.facade.ts
@@ -0,0 +1,76 @@
+// ServiceCatalogFacade (plan.md M8/M15): `GET /v1/portal/services` (Carta de Serviços, rota
+// pública) cacheado em memória por sessão do app → `availability(serviceKey)`. Serviço ausente
+// do catálogo → `unavailable` com motivo `servico_nao_catalogado`; o backend marca
+// `unavailable`/`partially_available` com `unavailableReason` e `alternativeChannelNote`
+// (padrão "bloqueada por decisão": a UI nunca simula resultado). Token abstrato substituível por
+// `useValue` nos testes.
+import { Injectable, inject } from '@angular/core';
+import { PortalClient, type ServiceCatalogItem } from '../data/portal.client';
+
+export type ServiceAvailabilityStatus =
+  'available' | 'partially_available' | 'unavailable';
+
+export interface ServiceAvailability {
+  readonly status: ServiceAvailabilityStatus;
+  /** Token do catálogo (`unavailableReason`); nunca exibido cru — vai em `data-token`. */
+  readonly reason?: string;
+  /** Texto cidadão do catálogo (`alternativeChannelNote`). */
+  readonly alternativeChannelNote?: string;
+}
+
+export const SERVICE_NOT_CATALOGUED = 'servico_nao_catalogado';
+
+export const NOT_CATALOGUED: ServiceAvailability = Object.freeze({
+  status: 'unavailable',
+  reason: SERVICE_NOT_CATALOGUED,
+});
+
+export function toAvailability(item: ServiceCatalogItem): ServiceAvailability {
+  return {
+    status: item.availability ?? 'unavailable',
+    reason: item.unavailableReason,
+    alternativeChannelNote: item.alternativeChannelNote ?? undefined,
+  };
+}
+
+@Injectable({
+  providedIn: 'root',
+  useFactory: () => inject(PortalServiceCatalogFacade),
+})
+export abstract class ServiceCatalogFacade {
+  abstract availability(serviceKey: string): Promise<ServiceAvailability>;
+}
+
+@Injectable({ providedIn: 'root' })
+export class PortalServiceCatalogFacade extends ServiceCatalogFacade {
+  private readonly client = inject(PortalClient);
+  private catalog: Promise<ReadonlyMap<string, ServiceCatalogItem>> | null =
+    null;
+
+  /** Carta de Serviços completa (cache por sessão do app). */
+  items(): Promise<ReadonlyMap<string, ServiceCatalogItem>> {
+    this.catalog ??= this.client.services().then(
+      (items) =>
+        new Map(
+          items
+            .filter((item) => typeof item.serviceKey === 'string')
+            .map((item) => [item.serviceKey as string, item]),
+        ),
+      (error: unknown) => {
+        this.catalog = null;
+        throw error;
+      },
+    );
+    return this.catalog;
+  }
+
+  async availability(serviceKey: string): Promise<ServiceAvailability> {
+    const item = (await this.items()).get(serviceKey);
+    return item ? toAvailability(item) : NOT_CATALOGUED;
+  }
+
+  /** Descarta o cache (troca de sessão/tenant). */
+  invalidate(): void {
+    this.catalog = null;
+  }
+}
diff --git a/apps/portal/web/src/app/core/session.facade.ts b/apps/portal/web/src/app/core/session.facade.ts
new file mode 100644
index 0000000..c255124
--- /dev/null
+++ b/apps/portal/web/src/app/core/session.facade.ts
@@ -0,0 +1,127 @@
+// SessionFacade (portal-frontends.md §5.1; plan.md M8): sessão gov.br via `StynxSessionService`
+// + `GET /v1/portal/identity/me`. Nível de assinatura vem da claim assinada `assurance_level`
+// (`state().claims`) e do `me` (portal-route-contract.md §1.3) — nunca de corpo nem de tabela no
+// cliente. A matriz ato → nível é `actRequirements[]` do `me` (§3).
+//
+// `SessionFacade` é o token de injeção (classe abstrata: só os quatro signals, substituível por
+// `useValue` nos testes — detran-ui-guide.md §5); `PortalSessionFacade` é a implementação.
+import {
+  Injectable,
+  type Signal,
+  computed,
+  effect,
+  inject,
+  signal,
+} from '@angular/core';
+import { StynxSessionService } from '@stynx-nyx/angular-auth';
+import { PortalClient, type CitizenAccount } from '../data/portal.client';
+
+export type AssuranceLevel = 'simples' | 'avancada' | 'qualificada';
+
+/** Ordem dos níveis ([RN-PORTAL-101]: o teto exigido é `avancada`; nunca `qualificada`). */
+export const ASSURANCE_ORDER: Readonly<Record<AssuranceLevel, number>> = {
+  simples: 1,
+  avancada: 2,
+  qualificada: 3,
+};
+
+export function isAssuranceLevel(value: unknown): value is AssuranceLevel {
+  return value === 'simples' || value === 'avancada' || value === 'qualificada';
+}
+
+/**
+ * Requisito de nível por ato — modelo de visão de `me.actRequirements[]`
+ * (`{ actKey, minimumAssurance, allowed, reason? }`): `act` = `actKey`,
+ * `level` = `minimumAssurance`.
+ */
+export interface ActRequirement {
+  readonly act: string;
+  readonly level: AssuranceLevel | 'none';
+  readonly allowed?: boolean;
+  readonly reason?: string;
+}
+
+/** Representação ativa (procuração) — modelo de visão de `me.representations[]`. */
+export interface Representation {
+  readonly label: string;
+  readonly id?: string;
+  readonly representedCpf?: string;
+  readonly scope?: 'ait' | 'all';
+  readonly validUntil?: string | null;
+}
+
+@Injectable({
+  providedIn: 'root',
+  useFactory: () => inject(PortalSessionFacade),
+})
+export abstract class SessionFacade {
+  abstract readonly active: Signal<boolean>;
+  abstract readonly assuranceLevel: Signal<AssuranceLevel | null>;
+  abstract readonly actRequirements: Signal<readonly ActRequirement[]>;
+  abstract readonly representation: Signal<Representation | null>;
+}
+
+@Injectable({ providedIn: 'root' })
+export class PortalSessionFacade extends SessionFacade {
+  private readonly stynx = inject(StynxSessionService);
+  private readonly client = inject(PortalClient);
+  private readonly account = signal<CitizenAccount | null>(null);
+
+  readonly active = this.stynx.active;
+
+  /** Nível da claim assinada do access token STYNX (`assurance_level`). */
+  readonly claimAssuranceLevel = computed<AssuranceLevel | null>(() => {
+    const level = this.stynx.state().claims?.['assurance_level'];
+    return isAssuranceLevel(level) ? level : null;
+  });
+
+  readonly assuranceLevel = computed<AssuranceLevel | null>(() => {
+    if (!this.active()) return null;
+    const fromMe = this.account()?.assuranceLevel;
+    return isAssuranceLevel(fromMe) ? fromMe : this.claimAssuranceLevel();
+  });
+
+  readonly actRequirements = computed<readonly ActRequirement[]>(() =>
+    (this.account()?.actRequirements ?? []).map((requirement) => ({
+      act: requirement.actKey,
+      level: requirement.minimumAssurance,
+      allowed: requirement.allowed,
+      reason: requirement.reason,
+    })),
+  );
+
+  /**
+   * Representação ativa: `null` até que a seleção da representação (tela `/conta`, spec §4)
+   * exista — nenhuma fonte define qual das `me.representations[]` é a ativa por padrão.
+   */
+  readonly representation = signal<Representation | null>(null).asReadonly();
+
+  readonly representations = computed<readonly Representation[]>(() =>
+    (this.account()?.representations ?? []).map((item) => ({
+      id: item.id,
+      label: item.representedName ?? '',
+      scope: item.scope,
+      validUntil: item.validUntil,
+    })),
+  );
+
+  constructor() {
+    super();
+    effect(() => {
+      if (this.active()) {
+        void this.loadAccount();
+      } else {
+        this.account.set(null);
+      }
+    });
+  }
+
+  /** Recarrega `GET /v1/portal/identity/me` (após elevação de nível, por exemplo). */
+  async loadAccount(): Promise<void> {
+    try {
+      this.account.set(await this.client.me());
+    } catch {
+      this.account.set(null);
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/core/title.strategy.ts b/apps/portal/web/src/app/core/title.strategy.ts
new file mode 100644
index 0000000..72677e7
--- /dev/null
+++ b/apps/portal/web/src/app/core/title.strategy.ts
@@ -0,0 +1,26 @@
+// Título do documento a partir do `title` da rota (chave i18n) traduzido pelo catálogo, com a
+// marca do órgão (ou neutra) como sufixo: "<título> — <marca>".
+import { Injectable, inject } from '@angular/core';
+import { Title } from '@angular/platform-browser';
+import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';
+import { StynxI18nService } from '@detran/ui';
+import { BrandService } from './brand.service';
+
+@Injectable({ providedIn: 'root' })
+export class PortalTitleStrategy extends TitleStrategy {
+  private readonly title = inject(Title);
+  private readonly i18n = inject(StynxI18nService);
+  private readonly brand = inject(BrandService);
+
+  override updateTitle(snapshot: RouterStateSnapshot): void {
+    const key = this.buildTitle(snapshot);
+    const brand = this.brand.state();
+    const brandName =
+      brand.status === 'available'
+        ? brand.name
+        : this.i18n.translate(brand.neutralLabelKey);
+    this.title.setTitle(
+      key ? `${this.i18n.translate(key)} — ${brandName}` : brandName,
+    );
+  }
+}
diff --git a/apps/portal/web/src/app/data/portal.client.ts b/apps/portal/web/src/app/data/portal.client.ts
new file mode 100644
index 0000000..ef3ffd4
--- /dev/null
+++ b/apps/portal/web/src/app/data/portal.client.ts
@@ -0,0 +1,86 @@
+// Camada de dados do Portal (plan.md M13): wrapper tipado pelos contratos gerados em
+// `@detran/api-clients` (`BP-PORTAL-*.commands`, ADR-0007: nunca editados) sobre o `HttpClient`
+// que `provideStynxDefaults` configura (interceptors de auth, request-id, tenant e erro). O
+// browser só fala com `/v1/portal/*` (ADR-0003; portal-route-contract.md §1). Só leituras nesta
+// entrega; comandos (`If-Match` do `ETag`, `Idempotency-Key` determinística) chegam com os
+// módulos de feature (CTG-0003).
+import { HttpClient } from '@angular/common/http';
+import { Injectable, inject } from '@angular/core';
+import type { paths as IdentityPaths } from '@detran/api-clients/generated/BP-PORTAL-IDENTITY-001.commands';
+import { firstValueFrom } from 'rxjs';
+
+export const PORTAL_API_PREFIX = '/v1/portal';
+
+type JsonOf<
+  Path extends keyof IdentityPaths,
+  Method extends keyof IdentityPaths[Path],
+  Status extends number,
+> = IdentityPaths[Path][Method] extends {
+  responses: Record<Status, { content: { 'application/json': infer Body } }>;
+}
+  ? Body
+  : never;
+
+/** `GET /v1/portal/brand` — marca do tenant resolvido pelo `Host` (rota pública). */
+export type BrandProfile = JsonOf<'/v1/portal/brand', 'get', 200>;
+
+/** `GET /v1/portal/identity/me` — conta do cidadão e requisitos de nível por ato. */
+export type CitizenAccount = JsonOf<'/v1/portal/identity/me', 'get', 200>;
+
+/** `GET /v1/portal/services` — Carta de Serviços (rota pública). */
+export type ServiceCatalogItem = JsonOf<
+  '/v1/portal/services',
+  'get',
+  200
+>[number];
+
+/** Corpo de erro padronizado do domínio `portal` (`portal-error-catalog.md`). */
+export interface PortalErrorBody {
+  readonly code: string;
+  readonly status: number;
+  readonly message: string;
+  readonly messageKey?: string;
+  readonly requestId?: string;
+  readonly context?: Record<string, unknown>;
+}
+
+/** Recursos cuja leitura comprova o vínculo do cidadão (`portal.entitlement`, contrato §1.2). */
+export type EntitlementKind =
+  'ait' | 'request' | 'vehicle' | 'crash' | 'exam' | 'manifestation';
+
+const ENTITLEMENT_RESOURCE: Record<EntitlementKind, (id: string) => string> = {
+  ait: (id) => `/aits/${id}`,
+  request: (id) => `/requests/${id}`,
+  vehicle: (id) => `/vehicles/${id}/clearance`,
+  crash: (id) => `/crashes/${id}`,
+  exam: (id) => `/exams/${id}`,
+  manifestation: (id) => `/manifestations/${id}`,
+};
+
+@Injectable({ providedIn: 'root' })
+export class PortalClient {
+  private readonly http = inject(HttpClient);
+
+  brand(): Promise<BrandProfile> {
+    return this.get<BrandProfile>('/brand');
+  }
+
+  me(): Promise<CitizenAccount> {
+    return this.get<CitizenAccount>('/identity/me');
+  }
+
+  services(): Promise<ServiceCatalogItem[]> {
+    return this.get<ServiceCatalogItem[]>('/services');
+  }
+
+  /** Leitura do recurso de vínculo: 200 prova o vínculo; 404 `PORTAL.NOT_FOUND` o nega. */
+  entitledResource(kind: EntitlementKind, id: string): Promise<unknown> {
+    return this.get<unknown>(
+      ENTITLEMENT_RESOURCE[kind](encodeURIComponent(id)),
+    );
+  }
+
+  private get<T>(path: string): Promise<T> {
+    return firstValueFrom(this.http.get<T>(`${PORTAL_API_PREFIX}${path}`));
+  }
+}
diff --git a/apps/portal/web/src/app/features/assinatura/assinatura.routes.ts b/apps/portal/web/src/app/features/assinatura/assinatura.routes.ts
new file mode 100644
index 0000000..4fa6084
--- /dev/null
+++ b/apps/portal/web/src/app/features/assinatura/assinatura.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `assinatura` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('assinatura', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const ASSINATURA_ROUTES: Routes = moduleRoutes('assinatura');
diff --git a/apps/portal/web/src/app/features/atendimento/atendimento.routes.ts b/apps/portal/web/src/app/features/atendimento/atendimento.routes.ts
new file mode 100644
index 0000000..c191192
--- /dev/null
+++ b/apps/portal/web/src/app/features/atendimento/atendimento.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `atendimento` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('atendimento', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const ATENDIMENTO_ROUTES: Routes = moduleRoutes('atendimento');
diff --git a/apps/portal/web/src/app/features/autos/autos.routes.ts b/apps/portal/web/src/app/features/autos/autos.routes.ts
new file mode 100644
index 0000000..41da9d5
--- /dev/null
+++ b/apps/portal/web/src/app/features/autos/autos.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `autos` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('autos', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const AUTOS_ROUTES: Routes = moduleRoutes('autos');
diff --git a/apps/portal/web/src/app/features/catalogo/catalogo.routes.ts b/apps/portal/web/src/app/features/catalogo/catalogo.routes.ts
new file mode 100644
index 0000000..a62a3ea
--- /dev/null
+++ b/apps/portal/web/src/app/features/catalogo/catalogo.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `catalogo` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('catalogo', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const CATALOGO_ROUTES: Routes = moduleRoutes('catalogo');
diff --git a/apps/portal/web/src/app/features/defesa/defesa.routes.ts b/apps/portal/web/src/app/features/defesa/defesa.routes.ts
new file mode 100644
index 0000000..21c3f42
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/defesa.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `defesa` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('defesa', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const DEFESA_ROUTES: Routes = moduleRoutes('defesa');
diff --git a/apps/portal/web/src/app/features/documentos/documentos.routes.ts b/apps/portal/web/src/app/features/documentos/documentos.routes.ts
new file mode 100644
index 0000000..a0367ae
--- /dev/null
+++ b/apps/portal/web/src/app/features/documentos/documentos.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `documentos` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('documentos', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const DOCUMENTOS_ROUTES: Routes = moduleRoutes('documentos');
diff --git a/apps/portal/web/src/app/features/exames/exames.routes.ts b/apps/portal/web/src/app/features/exames/exames.routes.ts
new file mode 100644
index 0000000..d422d08
--- /dev/null
+++ b/apps/portal/web/src/app/features/exames/exames.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `exames` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('exames', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const EXAMES_ROUTES: Routes = moduleRoutes('exames');
diff --git a/apps/portal/web/src/app/features/indicacao/indicacao.routes.ts b/apps/portal/web/src/app/features/indicacao/indicacao.routes.ts
new file mode 100644
index 0000000..9bd356a
--- /dev/null
+++ b/apps/portal/web/src/app/features/indicacao/indicacao.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `indicacao` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('indicacao', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const INDICACAO_ROUTES: Routes = moduleRoutes('indicacao');
diff --git a/apps/portal/web/src/app/features/notificacoes/notificacoes.routes.ts b/apps/portal/web/src/app/features/notificacoes/notificacoes.routes.ts
new file mode 100644
index 0000000..07769e5
--- /dev/null
+++ b/apps/portal/web/src/app/features/notificacoes/notificacoes.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `notificacoes` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('notificacoes', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const NOTIFICACOES_ROUTES: Routes = moduleRoutes('notificacoes');
diff --git a/apps/portal/web/src/app/features/pagamento/pagamento.routes.ts b/apps/portal/web/src/app/features/pagamento/pagamento.routes.ts
new file mode 100644
index 0000000..389bf3f
--- /dev/null
+++ b/apps/portal/web/src/app/features/pagamento/pagamento.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `pagamento` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('pagamento', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const PAGAMENTO_ROUTES: Routes = moduleRoutes('pagamento');
diff --git a/apps/portal/web/src/app/features/privacidade/privacidade.routes.ts b/apps/portal/web/src/app/features/privacidade/privacidade.routes.ts
new file mode 100644
index 0000000..1a6f40f
--- /dev/null
+++ b/apps/portal/web/src/app/features/privacidade/privacidade.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `privacidade` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('privacidade', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const PRIVACIDADE_ROUTES: Routes = moduleRoutes('privacidade');
diff --git a/apps/portal/web/src/app/features/processos/processos.routes.ts b/apps/portal/web/src/app/features/processos/processos.routes.ts
new file mode 100644
index 0000000..d9abf83
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/processos.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `processos` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('processos', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const PROCESSOS_ROUTES: Routes = moduleRoutes('processos');
diff --git a/apps/portal/web/src/app/features/sinistros/sinistros.routes.ts b/apps/portal/web/src/app/features/sinistros/sinistros.routes.ts
new file mode 100644
index 0000000..569bd2a
--- /dev/null
+++ b/apps/portal/web/src/app/features/sinistros/sinistros.routes.ts
@@ -0,0 +1,7 @@
+// Módulo `sinistros` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
+// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
+// via `moduleRoutes('sinistros', { '<path>': { component, title } })`.
+import type { Routes } from '@angular/router';
+import { moduleRoutes } from '../../core/manifest-routes';
+
+export const SINISTROS_ROUTES: Routes = moduleRoutes('sinistros');
diff --git a/apps/portal/web/src/app/i18n/i18n-keys.spec.ts b/apps/portal/web/src/app/i18n/i18n-keys.spec.ts
new file mode 100644
index 0000000..5e98713
--- /dev/null
+++ b/apps/portal/web/src/app/i18n/i18n-keys.spec.ts
@@ -0,0 +1,115 @@
+// R-0014 TASK-0002 (Inspector). Contrato de i18n (M9/M10 do plan.md): (a) todo literal
+// `'portal.…'` com ≥ 2 pontos em `src/**/*.ts` (exceto specs e `src/testing`) existe como
+// chave em `src/app/i18n/portal.pt-BR.json`; (b) toda chave do JSON tem os dois primeiros
+// segmentos numa linha da tabela "## Namespaces i18n" de `parameter-catalogue.md` (lida com
+// `node:fs`, sem reusar `tools/parameters/parser.mjs`, fora da fronteira de TASK-0002); (c)
+// nenhum valor do JSON é um token `[A-Z_]{4,}` puro (estado interno nunca vaza — Regra 3 do
+// prompt). O catálogo real (`@stynx-nyx/angular-i18n`) é um `Record<string,string>` plano
+// (chave = caminho pontuado completo), confirmado em
+// node_modules/@stynx-nyx/angular-i18n/dist/types/stynx-nyx-angular-i18n.d.ts.
+import { readFileSync, readdirSync, statSync } from 'node:fs';
+import { dirname, join } from 'node:path';
+import { fileURLToPath } from 'node:url';
+import portalCatalog from './portal.pt-BR.json';
+
+const specDir = dirname(fileURLToPath(import.meta.url)); // .../src/app/i18n
+const appSrcRoot = join(specDir, '..', '..'); // .../src
+const repoRoot = join(specDir, '..', '..', '..', '..', '..', '..');
+const catalogueMdPath = join(
+  repoRoot,
+  'docs/framework/arch/parameter-catalogue.md',
+);
+
+const PORTAL_LITERAL = /['"](portal\.[A-Za-z0-9_.-]+)['"]/g;
+
+function collectSourceFiles(root: string): string[] {
+  const files: string[] = [];
+  for (const item of readdirSync(root, { withFileTypes: true })) {
+    if (item.name === 'testing') continue;
+    const path = join(root, item.name);
+    if (item.isDirectory()) {
+      files.push(...collectSourceFiles(path));
+    } else if (item.name.endsWith('.ts') && !item.name.endsWith('.spec.ts')) {
+      files.push(path);
+    }
+  }
+  return files;
+}
+
+function collectPortalLiterals(files: readonly string[]): Set<string> {
+  const literals = new Set<string>();
+  for (const file of files) {
+    const text = readFileSync(file, 'utf8');
+    for (const match of text.matchAll(PORTAL_LITERAL)) {
+      const literal = match[1];
+      if (literal.split('.').length >= 3) literals.add(literal);
+    }
+  }
+  return literals;
+}
+
+/** Extrai a coluna `Namespace` da tabela sob "## Namespaces i18n" (M10 do plan.md). */
+function parseNamespaceAllowlist(catalogueMd: string): Set<string> {
+  const lines = catalogueMd.split(/\r?\n/);
+  const headingIndex = lines.findIndex((line) =>
+    line.startsWith('## Namespaces i18n'),
+  );
+  if (headingIndex < 0) return new Set();
+  const namespaces = new Set<string>();
+  for (let index = headingIndex + 1; index < lines.length; index += 1) {
+    const line = lines[index];
+    if (/^##\s+/.test(line)) break;
+    if (!line.trim().startsWith('|')) continue;
+    const cells = line
+      .trim()
+      .replace(/^\|/, '')
+      .replace(/\|$/, '')
+      .split('|')
+      .map((cell) => cell.trim().replace(/`/g, ''));
+    if (cells[0] === 'Namespace' || /^:?-{3,}:?$/.test(cells[0])) continue;
+    if (cells[0]) namespaces.add(cells[0]);
+  }
+  return namespaces;
+}
+
+describe('contrato de chaves i18n do Portal (M9/M10)', () => {
+  it('dado todo literal portal.* com ≥ 2 pontos em src/**/*.ts (exceto specs e src/testing) quando comparado ao catálogo então existe como chave em portal.pt-BR.json', () => {
+    const files = collectSourceFiles(appSrcRoot).filter((file) =>
+      statSync(file).isFile(),
+    );
+    const literals = collectPortalLiterals(files);
+    const catalogKeys = new Set(
+      Object.keys(portalCatalog as Record<string, string>),
+    );
+    const missing = [...literals].filter(
+      (literal) => !catalogKeys.has(literal),
+    );
+    expect(
+      missing,
+      `chaves i18n usadas sem entrada no catálogo: ${missing.join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('dado toda chave do catálogo quando comparada à allowlist de namespaces então os dois primeiros segmentos pertencem a uma linha de "## Namespaces i18n"', () => {
+    const catalogueMd = readFileSync(catalogueMdPath, 'utf8');
+    const allowlist = parseNamespaceAllowlist(catalogueMd);
+    const catalogKeys = Object.keys(portalCatalog as Record<string, string>);
+    const offenders = catalogKeys.filter((key) => {
+      const [first, second] = key.split('.');
+      return !allowlist.has(`${first}.${second}`);
+    });
+    expect(
+      offenders,
+      `chaves fora da allowlist de namespaces: ${offenders.join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('dado todo valor do catálogo quando inspecionado então nenhum é um token [A-Z_]{4,} puro (estado interno não vaza)', () => {
+    const entries = Object.entries(portalCatalog as Record<string, string>);
+    const leaked = entries.filter(([, value]) => /^[A-Z_]{4,}$/.test(value));
+    expect(
+      leaked.map(([key]) => key),
+      `valores que vazam token interno: ${leaked.map(([key, value]) => `${key}=${value}`).join(', ')}`,
+    ).toEqual([]);
+  });
+});
diff --git a/apps/portal/web/src/app/i18n/portal.pt-BR.json b/apps/portal/web/src/app/i18n/portal.pt-BR.json
new file mode 100644
index 0000000..1814f1d
--- /dev/null
+++ b/apps/portal/web/src/app/i18n/portal.pt-BR.json
@@ -0,0 +1,42 @@
+{
+  "portal.shell.brand.neutral": "Portal do cidadão",
+  "portal.shell.nav.inicio": "Início",
+  "portal.shell.nav.autos": "Autos",
+  "portal.shell.nav.processos": "Processos",
+  "portal.shell.nav.atualizacoes": "Atualizações",
+  "portal.shell.nav.documentos": "Documentos",
+  "portal.shell.footer.carta": "Carta de Serviços",
+  "portal.shell.footer.presencial": "Atendimento presencial",
+  "portal.shell.footer.acessibilidade": "Acessibilidade",
+  "portal.shell.footer.privacidade": "Privacidade",
+  "portal.shell.title.home": "Portal do cidadão",
+  "portal.shell.title.acessibilidade": "Acessibilidade",
+  "portal.shell.title.auth_callback": "Carregando…",
+  "portal.shell.title.inicio": "Início",
+  "portal.shell.title.conta": "Conta",
+  "portal.shell.title.vinculo": "Por que não vejo isto?",
+  "portal.shell.title.servico_indisponivel": "Serviço indisponível",
+  "portal.states.loading": "Carregando…",
+  "portal.states.empty": "Nenhum registro encontrado.",
+  "portal.states.error": "Não foi possível concluir. Tente novamente.",
+  "portal.states.unavailable_in_version": "Indisponível nesta versão",
+  "portal.states.offline": "Você está sem conexão. Este conteúdo não está disponível offline.",
+  "portal.states.not_found": "Página não encontrada",
+  "portal.states.no_script": "Para usar o Portal do cidadão, ative o JavaScript no seu navegador.",
+  "portal.states.entitlement_missing": "Não encontramos vínculo entre você e este registro. Você pode comprovar o vínculo pela ouvidoria ou no atendimento presencial.",
+  "portal.states.service_unavailable": "Este serviço não está disponível neste momento. Veja abaixo o motivo e o canal alternativo.",
+  "portal.states.permission_missing": "Sua sessão não permite este ato. Veja qual nível falta e como obtê-lo.",
+  "portal.states.ineligible": "Este ato não está disponível para este registro. Veja o motivo e a alternativa.",
+  "portal.common.action.login": "Entrar com gov.br",
+  "portal.common.action.home": "Voltar ao início",
+  "portal.common.action.retry": "Tentar novamente",
+  "portal.common.link.carta": "Carta de Serviços",
+  "portal.common.link.ouvidoria": "Ouvidoria",
+  "portal.common.link.presencial": "Atendimento presencial",
+  "portal.common.label.reason": "Motivo",
+  "portal.common.label.alternative_channel": "Canal alternativo",
+  "portal.a11y.skip_link": "Ir para o conteúdo",
+  "portal.a11y.nav_main": "Navegação principal",
+  "portal.a11y.nav_footer": "Links institucionais",
+  "portal.a11y.status_region": "Estado da página"
+}
diff --git a/apps/portal/web/src/app/shared/placeholder-page.component.ts b/apps/portal/web/src/app/shared/placeholder-page.component.ts
new file mode 100644
index 0000000..efdb0c3
--- /dev/null
+++ b/apps/portal/web/src/app/shared/placeholder-page.component.ts
@@ -0,0 +1,37 @@
+// PlaceholderPageComponent (plan.md M8; engineer-frontend.md §Regras 1): página de rota ainda
+// não construída — `DetranErrorStateComponent` "indisponível nesta versão" e `data-screen`
+// com a tela (`T-nn`) lida do `data` da rota (`""` quando a rota não tem tela). Uma por rota
+// até o CTG-0003 substituir pelos componentes reais.
+import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
+import { toSignal } from '@angular/core/rxjs-interop';
+import { ActivatedRoute } from '@angular/router';
+import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
+import { map } from 'rxjs';
+
+export const UNAVAILABLE_IN_VERSION_KEY =
+  'portal.states.unavailable_in_version';
+
+@Component({
+  selector: 'portal-placeholder-page',
+  imports: [DetranErrorStateComponent, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-screen]': 'screen()' },
+  template: `
+    <detran-error-state
+      [title]="titleKey | stynxTranslate"
+      [message]="titleKey | stynxTranslate"
+    />
+  `,
+})
+export class PlaceholderPageComponent {
+  private readonly route = inject(ActivatedRoute);
+
+  readonly titleKey = UNAVAILABLE_IN_VERSION_KEY;
+
+  readonly screen = toSignal(
+    this.route.data.pipe(
+      map((data) => (typeof data['screen'] === 'string' ? data['screen'] : '')),
+    ),
+    { initialValue: '' },
+  );
+}
diff --git a/apps/portal/web/src/index.html b/apps/portal/web/src/index.html
new file mode 100644
index 0000000..18a1415
--- /dev/null
+++ b/apps/portal/web/src/index.html
@@ -0,0 +1,20 @@
+<!doctype html>
+<html lang="pt-BR">
+  <head>
+    <meta charset="utf-8" />
+    <title>Portal do cidadão</title>
+    <base href="/" />
+    <meta name="viewport" content="width=device-width, initial-scale=1" />
+    <meta name="theme-color" content="#005ca9" />
+    <link rel="icon" type="image/svg+xml" href="icons/icon-192.svg" />
+    <link rel="apple-touch-icon" href="icons/icon-192.svg" />
+    <link rel="manifest" href="manifest.webmanifest" />
+    <script src="runtime-config.js"></script>
+  </head>
+  <body>
+    <portal-root></portal-root>
+    <noscript>
+      Para usar o Portal do cidadão, ative o JavaScript no seu navegador.
+    </noscript>
+  </body>
+</html>
diff --git a/apps/portal/web/src/main.ts b/apps/portal/web/src/main.ts
new file mode 100644
index 0000000..f65ccc1
--- /dev/null
+++ b/apps/portal/web/src/main.ts
@@ -0,0 +1,52 @@
+// Bootstrap do Portal (plan.md M4/M9/M13; detran-ui-guide.md §1): só `provideDetranAuthenticatedApp`
+// (STYNX core + OIDC/sessão + tenancy + i18n pt-BR), `provideHttpClient`, `provideRouter` com
+// binding de inputs e o service worker (M14) fora do modo de desenvolvimento. Configuração
+// de runtime lida de `public/runtime-config.js` (três chaves, sem segredo).
+import { provideHttpClient } from '@angular/common/http';
+import { isDevMode } from '@angular/core';
+import { bootstrapApplication } from '@angular/platform-browser';
+import {
+  TitleStrategy,
+  provideRouter,
+  withComponentInputBinding,
+} from '@angular/router';
+import { provideServiceWorker } from '@angular/service-worker';
+import { provideDetranAuthenticatedApp } from '@detran/ui';
+import { AppComponent } from './app/app.component';
+import { PORTAL_ROUTES } from './app/app.routes';
+import { readRuntimeConfig } from './app/core/runtime-config';
+import { PortalTitleStrategy } from './app/core/title.strategy';
+
+const runtime = readRuntimeConfig();
+const origin = window.location.origin;
+
+bootstrapApplication(AppComponent, {
+  providers: [
+    provideHttpClient(),
+    provideRouter(PORTAL_ROUTES, withComponentInputBinding()),
+    provideDetranAuthenticatedApp({
+      // Mesma origem: o browser só fala com `/v1/portal/*` (portal-frontends.md §1).
+      angular: { apiBaseUrl: '', sessionMode: 'bearer' },
+      oidc: {
+        oidc: {
+          authority: runtime.oidcAuthority,
+          clientId: runtime.clientId,
+          redirectUrl: `${origin}/auth/callback`,
+          postLogoutRedirectUri: `${origin}/`,
+        },
+        loginRedirectRoute: '/',
+      },
+      // O `Host` decide o tenant no servidor (contrato §1.5); `tenantId` só semeia a sessão e o
+      // header `X-Tenant-Id` que o STYNX envia.
+      tenancy: { defaultTenantResolver: () => runtime.tenantId || null },
+      i18n: {
+        loadCatalog: () =>
+          import('./app/i18n/portal.pt-BR.json').then((m) => m.default),
+      },
+    }),
+    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() }),
+    { provide: TitleStrategy, useClass: PortalTitleStrategy },
+  ],
+}).catch((error: unknown) => {
+  console.error(error);
+});
diff --git a/apps/portal/web/src/styles.css b/apps/portal/web/src/styles.css
new file mode 100644
index 0000000..7e34969
--- /dev/null
+++ b/apps/portal/web/src/styles.css
@@ -0,0 +1,17 @@
+/* Estilos globais do Portal: tema e primitivos do kit, uma única importação (detran-ui-guide.md §1). */
+@import '@detran/ui/styles';
+
+html {
+  font-family:
+    system-ui,
+    -apple-system,
+    'Segoe UI',
+    Roboto,
+    sans-serif;
+  color: var(--detran-color-text);
+  background: var(--detran-color-surface-muted);
+}
+
+body {
+  margin: 0;
+}
diff --git a/apps/portal/web/src/test-setup.ts b/apps/portal/web/src/test-setup.ts
new file mode 100644
index 0000000..a776076
--- /dev/null
+++ b/apps/portal/web/src/test-setup.ts
@@ -0,0 +1,14 @@
+// Ambiente de TestBed único para todos os specs (plan.md R-0014 M3). Componentes usam
+// template/styles inline: o compilador JIT resolve tudo em memória no jsdom.
+import '@angular/compiler';
+import { TestBed } from '@angular/core/testing';
+import {
+  BrowserTestingModule,
+  platformBrowserTesting,
+} from '@angular/platform-browser/testing';
+import { afterEach, beforeAll } from 'vitest';
+
+beforeAll(() =>
+  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()),
+);
+afterEach(() => TestBed.resetTestingModule());
diff --git a/apps/portal/web/src/testing/entitlement-facade.stub.ts b/apps/portal/web/src/testing/entitlement-facade.stub.ts
new file mode 100644
index 0000000..72384cd
--- /dev/null
+++ b/apps/portal/web/src/testing/entitlement-facade.stub.ts
@@ -0,0 +1,21 @@
+// R-0014 TASK-0002 (Inspector, iteração 2 — adenda A2). Stub de `EntitlementFacade.check(kind,
+// id)` (M8). Só usado por specs; `import type` evita resolução em runtime antes de TASK-0004.
+// `ReturnType<typeof vi.fn>` é `Mock<Procedure | Constructable>` sob vitest 4 (sem assinatura
+// de chamada): tipamos com `Mock<EntitlementFacade['check']>` (plan.md §Adendas A2).
+import { vi, type Mock } from 'vitest';
+import type { EntitlementFacade } from '../app/core/entitlement.facade';
+import type { EntitlementKind } from './route-manifest.fixture';
+
+export interface EntitlementFacadeStub extends EntitlementFacade {
+  readonly check: Mock<EntitlementFacade['check']>;
+}
+
+export function createEntitlementFacadeStub(
+  result: boolean | ((kind: EntitlementKind, id: string) => boolean) = true,
+): EntitlementFacadeStub {
+  const check = vi.fn<EntitlementFacade['check']>(
+    async (kind: EntitlementKind, id: string): Promise<boolean> =>
+      typeof result === 'function' ? result(kind, id) : result,
+  );
+  return { check };
+}
diff --git a/apps/portal/web/src/testing/route-manifest.fixture.ts b/apps/portal/web/src/testing/route-manifest.fixture.ts
new file mode 100644
index 0000000..355c5fe
--- /dev/null
+++ b/apps/portal/web/src/testing/route-manifest.fixture.ts
@@ -0,0 +1,394 @@
+// R-0014 TASK-0002 (Inspector). Transcrição literal de work/rounds/R-0014/route-manifest.md
+// (38 rotas, M7 do plan.md). É a referência dos testes tela ↔ rota ↔ guarda; o código de
+// produção (`src/app/app.route-manifest.ts`, TASK-0004) NÃO importa este arquivo — cada um é
+// escrito independentemente e comparado entrada a entrada pelos specs.
+export type PortalAccess =
+  'anonimo' | 'simples' | 'avancada' | 'nenhum_ou_simples';
+
+export type EntitlementKind =
+  'ait' | 'request' | 'vehicle' | 'crash' | 'exam' | 'manifestation';
+
+export interface RouteManifestFixtureEntry {
+  readonly path: string;
+  readonly screen: `T-${string}` | null;
+  readonly sheet: `IU-PORTAL-T${string}` | null;
+  readonly module: string;
+  readonly access: PortalAccess;
+  readonly entitlement?: {
+    readonly kind: EntitlementKind;
+    readonly param: string;
+  };
+  readonly serviceKey?: string;
+  readonly journeys: readonly string[];
+}
+
+// Catálogo fechado de serviceKey (route-manifest.md §Invariantes,
+// backend/database/seed/70-fixtures-portal.sql).
+export const PORTAL_SERVICE_KEYS = [
+  'consulta_multas',
+  'defesa_previa',
+  'recurso_jari',
+  'recurso_cetran',
+  'indicacao_condutor',
+  'pagamento',
+  'adesao_sne',
+  'cancelamento_sne',
+  'consulta_cnh',
+  'emissao_crlv',
+  'consulta_bat',
+  'consulta_exame',
+  'junta_medica',
+  'manifestar',
+  'acompanhar_manifestacao',
+  'avaliar',
+  'lgpd_declaracao',
+  'procuracao',
+] as const;
+
+export const PORTAL_ROUTE_MANIFEST_FIXTURE: readonly RouteManifestFixtureEntry[] =
+  [
+    {
+      path: '',
+      screen: null,
+      sheet: null,
+      module: 'core',
+      access: 'anonimo',
+      journeys: [],
+    },
+    {
+      path: 'carta-servicos',
+      screen: 'T-25',
+      sheet: 'IU-PORTAL-T25',
+      module: 'catalogo',
+      access: 'anonimo',
+      journeys: [],
+    },
+    {
+      path: 'carta-servicos/:serviceKey',
+      screen: 'T-25',
+      sheet: 'IU-PORTAL-T25',
+      module: 'catalogo',
+      access: 'anonimo',
+      journeys: [],
+    },
+    {
+      path: 'pontuacao/como-funciona',
+      screen: 'T-15',
+      sheet: 'IU-PORTAL-T15',
+      module: 'catalogo',
+      access: 'anonimo',
+      journeys: ['JRN-PORTAL-004'],
+    },
+    {
+      path: 'acessibilidade',
+      screen: null,
+      sheet: null,
+      module: 'core',
+      access: 'anonimo',
+      journeys: [],
+    },
+    {
+      path: 'auth/callback',
+      screen: null,
+      sheet: null,
+      module: 'core',
+      access: 'anonimo',
+      journeys: [],
+    },
+    {
+      path: 'inicio',
+      screen: null,
+      sheet: null,
+      module: 'core',
+      access: 'simples',
+      journeys: [],
+    },
+    {
+      path: 'autos',
+      screen: 'T-14',
+      sheet: 'IU-PORTAL-T14',
+      module: 'autos',
+      access: 'simples',
+      serviceKey: 'consulta_multas',
+      journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-004', 'JRN-PORTAL-005'],
+    },
+    {
+      path: 'autos/:aitId',
+      screen: 'T-01',
+      sheet: 'IU-PORTAL-T01',
+      module: 'autos',
+      access: 'simples',
+      entitlement: { kind: 'ait', param: 'aitId' },
+      serviceKey: 'consulta_multas',
+      journeys: [
+        'JRN-PORTAL-001',
+        'JRN-PORTAL-002',
+        'JRN-PORTAL-004',
+        'JRN-PORTAL-005',
+      ],
+    },
+    {
+      path: 'autos/:aitId/defesa/nova',
+      screen: 'T-02',
+      sheet: 'IU-PORTAL-T02',
+      module: 'defesa',
+      access: 'avancada',
+      entitlement: { kind: 'ait', param: 'aitId' },
+      serviceKey: 'defesa_previa',
+      journeys: ['JRN-PORTAL-001'],
+    },
+    {
+      path: 'autos/:aitId/condutor/nova',
+      screen: 'T-05',
+      sheet: 'IU-PORTAL-T05',
+      module: 'indicacao',
+      access: 'avancada',
+      entitlement: { kind: 'ait', param: 'aitId' },
+      serviceKey: 'indicacao_condutor',
+      journeys: ['JRN-PORTAL-002'],
+    },
+    {
+      path: 'autos/:aitId/pagamento',
+      screen: 'T-13',
+      sheet: 'IU-PORTAL-T13',
+      module: 'pagamento',
+      access: 'simples',
+      entitlement: { kind: 'ait', param: 'aitId' },
+      serviceKey: 'pagamento',
+      journeys: ['JRN-PORTAL-004', 'JRN-PORTAL-005', 'JRN-PORTAL-010'],
+    },
+    {
+      path: 'autos/:aitId/pagamento/preservando-recurso',
+      screen: 'T-23',
+      sheet: 'IU-PORTAL-T23',
+      module: 'pagamento',
+      access: 'simples',
+      entitlement: { kind: 'ait', param: 'aitId' },
+      serviceKey: 'pagamento',
+      journeys: ['JRN-PORTAL-010'],
+    },
+    {
+      path: 'processos',
+      screen: 'T-06',
+      sheet: 'IU-PORTAL-T06',
+      module: 'processos',
+      access: 'simples',
+      journeys: ['JRN-PORTAL-003'],
+    },
+    {
+      path: 'processos/:requestId',
+      screen: 'T-07',
+      sheet: 'IU-PORTAL-T07',
+      module: 'processos',
+      access: 'simples',
+      entitlement: { kind: 'request', param: 'requestId' },
+      journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-003'],
+    },
+    {
+      path: 'processos/:requestId/diligencia/:diligenceId',
+      screen: 'T-11',
+      sheet: 'IU-PORTAL-T11',
+      module: 'processos',
+      access: 'simples',
+      entitlement: { kind: 'request', param: 'requestId' },
+      journeys: ['JRN-PORTAL-003'],
+    },
+    {
+      path: 'processos/:requestId/desistencia',
+      screen: 'T-08',
+      sheet: 'IU-PORTAL-T08',
+      module: 'processos',
+      access: 'simples',
+      entitlement: { kind: 'request', param: 'requestId' },
+      journeys: [],
+    },
+    {
+      path: 'processos/:requestId/decisao',
+      screen: 'T-10',
+      sheet: 'IU-PORTAL-T10',
+      module: 'processos',
+      access: 'simples',
+      entitlement: { kind: 'request', param: 'requestId' },
+      journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-003'],
+    },
+    {
+      path: 'processos/:requestId/jari/nova',
+      screen: 'T-03',
+      sheet: 'IU-PORTAL-T03',
+      module: 'defesa',
+      access: 'avancada',
+      entitlement: { kind: 'request', param: 'requestId' },
+      serviceKey: 'recurso_jari',
+      journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-010'],
+    },
+    {
+      path: 'processos/:requestId/cetran/nova',
+      screen: 'T-04',
+      sheet: 'IU-PORTAL-T04',
+      module: 'defesa',
+      access: 'avancada',
+      entitlement: { kind: 'request', param: 'requestId' },
+      serviceKey: 'recurso_cetran',
+      journeys: ['JRN-PORTAL-001'],
+    },
+    {
+      path: 'notificacoes',
+      screen: 'T-12',
+      sheet: 'IU-PORTAL-T12',
+      module: 'notificacoes',
+      access: 'simples',
+      journeys: ['JRN-PORTAL-002', 'JRN-PORTAL-003', 'JRN-PORTAL-005'],
+    },
+    {
+      path: 'notificacoes/preferencias',
+      screen: null,
+      sheet: null,
+      module: 'notificacoes',
+      access: 'simples',
+      journeys: [],
+    },
+    {
+      path: 'sne',
+      screen: 'T-09',
+      sheet: 'IU-PORTAL-T09',
+      module: 'notificacoes',
+      access: 'simples',
+      serviceKey: 'adesao_sne',
+      journeys: ['JRN-PORTAL-005'],
+    },
+    {
+      path: 'documentos/cnh-digital',
+      screen: 'T-16',
+      sheet: 'IU-PORTAL-T16',
+      module: 'documentos',
+      access: 'simples',
+      serviceKey: 'consulta_cnh',
+      journeys: ['JRN-PORTAL-006'],
+    },
+    {
+      path: 'veiculos',
+      screen: null,
+      sheet: null,
+      module: 'documentos',
+      access: 'simples',
+      journeys: [],
+    },
+    {
+      path: 'veiculos/:vehicleId/crlv-e',
+      screen: 'T-17',
+      sheet: 'IU-PORTAL-T17',
+      module: 'documentos',
+      access: 'simples',
+      entitlement: { kind: 'vehicle', param: 'vehicleId' },
+      serviceKey: 'emissao_crlv',
+      journeys: ['JRN-PORTAL-006'],
+    },
+    {
+      path: 'sinistros',
+      screen: 'T-18',
+      sheet: 'IU-PORTAL-T18',
+      module: 'sinistros',
+      access: 'simples',
+      serviceKey: 'consulta_bat',
+      journeys: ['JRN-PORTAL-007'],
+    },
+    {
+      path: 'sinistros/:crashId',
+      screen: 'T-19',
+      sheet: 'IU-PORTAL-T19',
+      module: 'sinistros',
+      access: 'simples',
+      entitlement: { kind: 'crash', param: 'crashId' },
+      serviceKey: 'consulta_bat',
+      journeys: ['JRN-PORTAL-007'],
+    },
+    {
+      path: 'exames',
+      screen: 'T-20',
+      sheet: 'IU-PORTAL-T20',
+      module: 'exames',
+      access: 'simples',
+      serviceKey: 'consulta_exame',
+      journeys: ['JRN-PORTAL-008'],
+    },
+    {
+      path: 'exames/:examId/junta/nova',
+      screen: null,
+      sheet: null,
+      module: 'exames',
+      access: 'avancada',
+      entitlement: { kind: 'exam', param: 'examId' },
+      serviceKey: 'junta_medica',
+      journeys: ['JRN-PORTAL-008'],
+    },
+    {
+      path: 'ouvidoria/nova',
+      screen: 'T-21',
+      sheet: 'IU-PORTAL-T21',
+      module: 'atendimento',
+      access: 'nenhum_ou_simples',
+      serviceKey: 'manifestar',
+      journeys: ['JRN-PORTAL-009'],
+    },
+    {
+      path: 'ouvidoria/:manifestationId',
+      screen: 'T-22',
+      sheet: 'IU-PORTAL-T22',
+      module: 'atendimento',
+      access: 'simples',
+      entitlement: { kind: 'manifestation', param: 'manifestationId' },
+      serviceKey: 'acompanhar_manifestacao',
+      journeys: ['JRN-PORTAL-009'],
+    },
+    {
+      path: 'avaliacao/:requestId',
+      screen: 'T-26',
+      sheet: 'IU-PORTAL-T26',
+      module: 'atendimento',
+      access: 'simples',
+      entitlement: { kind: 'request', param: 'requestId' },
+      serviceKey: 'avaliar',
+      journeys: ['JRN-PORTAL-009'],
+    },
+    {
+      path: 'privacidade/meus-dados',
+      screen: 'T-24',
+      sheet: 'IU-PORTAL-T24',
+      module: 'privacidade',
+      access: 'simples',
+      serviceKey: 'lgpd_declaracao',
+      journeys: ['JRN-PORTAL-011'],
+    },
+    {
+      path: 'assinatura/elevacao',
+      screen: 'T-27',
+      sheet: 'IU-PORTAL-T27',
+      module: 'assinatura',
+      access: 'simples',
+      journeys: ['JRN-PORTAL-001'],
+    },
+    {
+      path: 'conta',
+      screen: null,
+      sheet: null,
+      module: 'core',
+      access: 'simples',
+      journeys: [],
+    },
+    {
+      path: 'vinculo/por-que-nao-vejo',
+      screen: null,
+      sheet: null,
+      module: 'core',
+      access: 'simples',
+      journeys: [],
+    },
+    {
+      path: 'servico-indisponivel/:serviceKey',
+      screen: null,
+      sheet: null,
+      module: 'core',
+      access: 'simples',
+      journeys: [],
+    },
+  ];
diff --git a/apps/portal/web/src/testing/router-harness.ts b/apps/portal/web/src/testing/router-harness.ts
new file mode 100644
index 0000000..a01428f
--- /dev/null
+++ b/apps/portal/web/src/testing/router-harness.ts
@@ -0,0 +1,59 @@
+// R-0014 TASK-0002 (Inspector). Harness comum para specs de roteamento/guardas sobre
+// `PORTAL_ROUTES` (M7/M8 do plan.md). Usa `provideRouter` + `RouterTestingHarness`
+// (`@angular/router/testing`), como pedido pelo prompt (§B.3). Só usado por specs.
+import type { Provider } from '@angular/core';
+import { TestBed } from '@angular/core/testing';
+import { provideLocationMocks } from '@angular/common/testing';
+import { provideRouter, Router, type Routes } from '@angular/router';
+import { RouterTestingHarness } from '@angular/router/testing';
+
+/** Id fixo usado em todo teste de guarda/entitlement (prompt TASK-0002 §B.3). */
+export const FIXED_ENTITY_ID = '00000000-0000-7000-8000-0000000000aa';
+
+export interface PortalRouterHarness {
+  readonly harness: RouterTestingHarness;
+  readonly router: Router;
+  navigate(url: string): Promise<unknown>;
+  /** URL final do router após navegação (inclui redirecionamentos de guarda). */
+  currentUrl(): string;
+}
+
+export async function createPortalRouterHarness(
+  routes: Routes,
+  providers: Provider[] = [],
+): Promise<PortalRouterHarness> {
+  TestBed.configureTestingModule({
+    providers: [provideRouter(routes), provideLocationMocks(), ...providers],
+  });
+  const harness = await RouterTestingHarness.create();
+  const router = TestBed.inject(Router);
+  return {
+    harness,
+    router,
+    navigate: (url: string) => harness.navigateByUrl(url),
+    currentUrl: () => router.url,
+  };
+}
+
+/** Substitui todo segmento `:param` do path do manifesto pelo id fixo. */
+export function substituteRouteParams(
+  path: string,
+  id: string = FIXED_ENTITY_ID,
+): string {
+  return path
+    .split('/')
+    .map((segment) => (segment.startsWith(':') ? id : segment))
+    .join('/');
+}
+
+/**
+ * Elemento com o atributo `data-screen` no fragmento renderizado pela rota ativa
+ * (host do `PlaceholderPageComponent`, ou um descendente — M8: `data-screen="T-nn"` |
+ * `data-screen=""`).
+ */
+export function screenElement(harness: RouterTestingHarness): Element | null {
+  const root = harness.routeNativeElement;
+  if (!root) return null;
+  if (root.hasAttribute('data-screen')) return root;
+  return root.querySelector('[data-screen]');
+}
diff --git a/apps/portal/web/src/testing/service-catalog-facade.stub.ts b/apps/portal/web/src/testing/service-catalog-facade.stub.ts
new file mode 100644
index 0000000..f6a083d
--- /dev/null
+++ b/apps/portal/web/src/testing/service-catalog-facade.stub.ts
@@ -0,0 +1,33 @@
+// R-0014 TASK-0002 (Inspector, iteração 2 — adenda A2). Stub de
+// `ServiceCatalogFacade.availability(serviceKey)` (M8): `{ status: 'available' |
+// 'partially_available' | 'unavailable'; reason?: string }`. Só usado por specs; `import type`
+// evita resolução em runtime antes de TASK-0004. `ReturnType<typeof vi.fn>` é
+// `Mock<Procedure | Constructable>` sob vitest 4 (sem assinatura de chamada): tipamos com
+// `Mock<ServiceCatalogFacade['availability']>` (plan.md §Adendas A2).
+import { vi, type Mock } from 'vitest';
+import type { ServiceCatalogFacade } from '../app/core/service-catalog.facade';
+
+export interface ServiceAvailability {
+  readonly status: 'available' | 'partially_available' | 'unavailable';
+  readonly reason?: string;
+}
+
+export interface ServiceCatalogFacadeStub extends ServiceCatalogFacade {
+  readonly availability: Mock<ServiceCatalogFacade['availability']>;
+}
+
+export function createServiceCatalogFacadeStub(
+  result:
+    ServiceAvailability | ((serviceKey: string) => ServiceAvailability) = {
+    status: 'available',
+  },
+): ServiceCatalogFacadeStub {
+  const availability = vi.fn<ServiceCatalogFacade['availability']>(
+    async (serviceKey: string): Promise<ServiceAvailability> =>
+      typeof result === 'function' ? result(serviceKey) : result,
+  );
+  return { availability };
+}
+
+/** Motivo canônico de indisponibilidade por delegação (M15 do plan.md; R-0007). */
+export const DELEGACAO_INDISPONIVEL_R0007 = 'delegacao_indisponivel_r0007';
diff --git a/apps/portal/web/src/testing/session-facade.stub.ts b/apps/portal/web/src/testing/session-facade.stub.ts
new file mode 100644
index 0000000..7ebb916
--- /dev/null
+++ b/apps/portal/web/src/testing/session-facade.stub.ts
@@ -0,0 +1,69 @@
+// R-0014 TASK-0002 (Inspector). Stub de `SessionFacade` (M8 do plan.md): `active`,
+// `assuranceLevel`, `actRequirements`, `representation` como signals substituíveis por
+// `useValue` (`detran-ui-guide.md` §5). `import type` para a interface de produção — nunca
+// resolvido em runtime antes de TASK-0004 existir. Só usado por specs.
+import { signal, type WritableSignal } from '@angular/core';
+import type { SessionFacade } from '../app/core/session.facade';
+
+export type AssuranceLevel = 'simples' | 'avancada' | 'qualificada';
+
+export interface ActRequirement {
+  readonly act: string;
+  readonly level: AssuranceLevel;
+}
+
+export interface Representation {
+  readonly representedCpf: string;
+  readonly label: string;
+}
+
+export interface SessionFacadeStub extends SessionFacade {
+  readonly activeSignal: WritableSignal<boolean>;
+  readonly assuranceLevelSignal: WritableSignal<AssuranceLevel | null>;
+  readonly actRequirementsSignal: WritableSignal<readonly ActRequirement[]>;
+  readonly representationSignal: WritableSignal<Representation | null>;
+}
+
+export function createSessionFacadeStub(
+  initial: {
+    active?: boolean;
+    assuranceLevel?: AssuranceLevel | null;
+    actRequirements?: readonly ActRequirement[];
+    representation?: Representation | null;
+  } = {},
+): SessionFacadeStub {
+  const activeSignal = signal(initial.active ?? false);
+  const assuranceLevelSignal = signal<AssuranceLevel | null>(
+    initial.assuranceLevel ?? null,
+  );
+  const actRequirementsSignal = signal<readonly ActRequirement[]>(
+    initial.actRequirements ?? [],
+  );
+  const representationSignal = signal<Representation | null>(
+    initial.representation ?? null,
+  );
+  return {
+    active: activeSignal,
+    assuranceLevel: assuranceLevelSignal,
+    actRequirements: actRequirementsSignal,
+    representation: representationSignal,
+    activeSignal,
+    assuranceLevelSignal,
+    actRequirementsSignal,
+    representationSignal,
+  };
+}
+
+/**
+ * Personas da matriz de guardas (prompt TASK-0002 §B.3): anônima (sem sessão), `simples`,
+ * `avancada`, `qualificada` (nível da claim, não persona de fixture — Regra 5 do prompt).
+ */
+export const SESSION_FACADE_PRESETS = {
+  anonimo: () => createSessionFacadeStub({ active: false }),
+  simples: () =>
+    createSessionFacadeStub({ active: true, assuranceLevel: 'simples' }),
+  avancada: () =>
+    createSessionFacadeStub({ active: true, assuranceLevel: 'avancada' }),
+  qualificada: () =>
+    createSessionFacadeStub({ active: true, assuranceLevel: 'qualificada' }),
+} as const;
diff --git a/apps/portal/web/tsconfig.app.json b/apps/portal/web/tsconfig.app.json
new file mode 100644
index 0000000..d5ed6d1
--- /dev/null
+++ b/apps/portal/web/tsconfig.app.json
@@ -0,0 +1,19 @@
+{
+  "extends": "./tsconfig.json",
+  "compilerOptions": {
+    "types": [],
+    "paths": {
+      "@detran/api-clients/generated/*": [
+        "../../../packages/api-clients/src/generated/*"
+      ]
+    }
+  },
+  "files": ["src/main.ts"],
+  "include": ["src/**/*.d.ts"],
+  "exclude": [
+    "src/**/*.spec.ts",
+    "src/testing/**",
+    "src/test-setup.ts",
+    "src/app/a11y/axe.spec-helper.ts"
+  ]
+}
diff --git a/apps/portal/web/tsconfig.json b/apps/portal/web/tsconfig.json
new file mode 100644
index 0000000..2ce214d
--- /dev/null
+++ b/apps/portal/web/tsconfig.json
@@ -0,0 +1,25 @@
+{
+  "compilerOptions": {
+    "target": "ES2023",
+    "module": "ESNext",
+    "moduleResolution": "bundler",
+    "lib": ["ES2023", "DOM", "DOM.Iterable"],
+    "strict": true,
+    "noImplicitOverride": true,
+    "noPropertyAccessFromIndexSignature": true,
+    "noFallthroughCasesInSwitch": true,
+    "skipLibCheck": true,
+    "esModuleInterop": true,
+    "resolveJsonModule": true,
+    "isolatedModules": true,
+    "experimentalDecorators": true,
+    "useDefineForClassFields": false,
+    "importHelpers": true,
+    "types": []
+  },
+  "angularCompilerOptions": {
+    "strictTemplates": true,
+    "strictInjectionParameters": true,
+    "strictInputAccessModifiers": true
+  }
+}
diff --git a/apps/portal/web/tsconfig.spec.json b/apps/portal/web/tsconfig.spec.json
new file mode 100644
index 0000000..b8e1c65
--- /dev/null
+++ b/apps/portal/web/tsconfig.spec.json
@@ -0,0 +1,18 @@
+{
+  "extends": "./tsconfig.json",
+  "compilerOptions": {
+    "types": ["vitest/globals", "node"],
+    "paths": {
+      "@detran/api-clients/generated/*": [
+        "../../../packages/api-clients/src/generated/*"
+      ]
+    }
+  },
+  "include": [
+    "src/**/*.spec.ts",
+    "src/testing/**/*.ts",
+    "src/test-setup.ts",
+    "src/app/a11y/axe.spec-helper.ts",
+    "vitest.config.ts"
+  ]
+}
diff --git a/apps/portal/web/vitest.config.ts b/apps/portal/web/vitest.config.ts
new file mode 100644
index 0000000..551182f
--- /dev/null
+++ b/apps/portal/web/vitest.config.ts
@@ -0,0 +1,12 @@
+// Runner de testes do app (plan.md R-0014 M3): vitest + jsdom, como packages/ui e
+// detran-ui-guide.md §5. Specs nunca inicializam o ambiente — src/test-setup.ts faz.
+import { defineConfig } from 'vitest/config';
+
+export default defineConfig({
+  test: {
+    environment: 'jsdom',
+    globals: true,
+    include: ['src/**/*.spec.ts'],
+    setupFiles: ['src/test-setup.ts'],
+  },
+});
diff --git a/docs/framework/arch/parameter-catalogue.md b/docs/framework/arch/parameter-catalogue.md
index 5a52036..1d1c6e7 100644
--- a/docs/framework/arch/parameter-catalogue.md
+++ b/docs/framework/arch/parameter-catalogue.md
@@ -3,7 +3,7 @@ id: ARCH-PARAMETER-CATALOGUE
 title: Catálogo de parâmetros e flags — chaves, defaults, status, fonte e decisão vinculada (seed de ops.parameter, ADR-0021)
 status: draft
 apps: [rait, teat, portal, boat, dashboard]
-updated: 2026-09-16
+updated: 2026-09-17
 ---

 # Catálogo de parâmetros e flags
@@ -127,6 +127,32 @@ registro em `open-decisions-rait.md`, nos §4 dos build packs ou em `open-issues
 | `dashboard.critical_extinction.notify_legal` | F    | true                                         | vigente  | não     | não   | OD-D11, H.54  | `CRITICO_EXTINCAO`                     |
 | `dashboard.origin_resources_enabled`         | F    | true                                         | vigente  | não     | não   | OD-D13, H.54  | D-14/D-16                              |

+## Namespaces i18n (allowlist do verificador)
+
+Uma chave i18n não é um parâmetro: ela não entra nas cinco tabelas acima. Um namespace de
+i18n entra nesta tabela somente para que `verify:parameter-catalogue --check-usage`
+(`tools/parameters/verify.mjs`) deixe de tratar seus literais como candidato a parâmetro
+desconhecido — nunca por exclusão de diretório. Origem: `OD-P46`
+(`docs/framework/arch/portal-build-pack.md` §4) e método §4.17
+(`docs/meta/agents/orchestra/README.md`).
+
+| Namespace              | App               | Catálogo                         | Decisão |
+| ---------------------- | ----------------- | -------------------------------- | ------- |
+| `portal.shell`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.common`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.states`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.errors`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.situation`     | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.screens`       | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.forms`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.legal`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.requests`      | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.evaluations`   | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.notifications` | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.documents`     | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.services`      | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+| `portal.a11y`          | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+
 ## Regras do catálogo

 1. Nenhuma constante silenciosa: todo valor que aparece numa OD tem linha aqui.
@@ -221,6 +247,31 @@ adicional é preservado nos metadados gerados; cada token adicional que também
 `H.<n>`, `OD-*` ou `DT-*` precisa resolver nessas fontes. Não se escolhe um token
 por semelhança nem se inventa uma referência ausente.

+### Namespaces i18n
+
+O parser reconhece exclusivamente a primeira tabela Markdown sob o heading
+`Namespaces i18n`, com exatamente as quatro colunas `Namespace | App | Catálogo |
+Decisão`, na mesma disciplina de gramática das cinco tabelas de parâmetros.
+
+`Namespace` é um literal `<prefixo>.<segmento>` em que `<prefixo>` é um dos
+prefixos literais permitidos de uma das cinco superfícies (§Superfície, chave e
+valores de linha) e `<segmento>` casa `[a-z][a-z0-9_]*`. A unicidade do
+`Namespace` é obrigatória na tabela. A célula `Decisão` segue a mesma regra de
+resolução da célula `Decisão` das tabelas de parâmetros: só `H.<n>`, `OD-*` ou
+`DT-*` são elegíveis e a decisão selecionada precisa existir em ao menos uma das
+mesmas fontes (`decision-closure-plan.md`, `steering.md`, `open-decisions-rait.md`,
+`open-issues.md`, cédulas do Owner).
+
+Fail-closed: um namespace que seja prefixo (`<ns>.`) de qualquer chave das cinco
+tabelas de parâmetros falha a execução; um namespace cujo `<prefixo>` seja
+estranho aos prefixos das superfícies falha; a tabela ausente, malformada ou com
+célula vazia falha.
+
+A allowlist de namespaces i18n não gera artefato e não entra no seed — mas, como o
+gerador coloca o SHA-256 desta fonte no cabeçalho dos artefatos gerados, toda
+edição deste arquivo, inclusive desta tabela, exige rodar `pnpm
+parameters:generate` para os artefatos deixarem de ficar `stale`.
+
 ### Saídas determinísticas

 O gerador lê esta fonte como bytes UTF-8, calcula seu SHA-256 e coloca a identidade
@@ -273,20 +324,26 @@ inferência. Ele também verifica que nenhuma linha `legal_readonly=true` seja
 tratada como editável pelo contrato de geração.

 Para detectar uso em código, o verificador examina literais de string estáticos em
-código, ignorando testes, `dist` e `node_modules`. Qualquer literal exatamente
-igual a uma chave do catálogo conta como uso, inclusive uma chave de um ponto como
+código. A varredura cobre **todo** diretório do repositório; só `tests`, `dist` e
+`node_modules` são ignorados — não há exclusão por diretório para nenhum outro
+caso, inclusive código gerado. Qualquer literal exatamente igual a uma chave do
+catálogo conta como uso, inclusive uma chave de um ponto como
 `teat.speed_meters`. Um literal que não esteja no catálogo é candidato desconhecido
 somente se tiver dois ou mais pontos e começar por um destes prefixos: `rait`,
 `collection`, `deadline`, `session`, `teat`, `sync`, `portal`, `privacy`, `est` ou
-`dashboard`. Literais desconhecidos de um ponto são ambíguos com entidades de
-auditoria, como `portal.complaint`, e não são candidatos. Não existe allowlist
-silenciosa: todo candidato desconhecido falha com arquivo, linha e literal.
-`packages/api-clients/src/generated` fica fora desta varredura de uso (R-0009, A7): os
-clientes de comando gerados (`BP-PORTAL-*.commands.ts`) transcrevem, como tipos `const`, as
-chaves de rótulo i18n do Portal (`portal.requests.nextAction.<STATE>`,
-`portal.evaluations.publicIndicator`), que colidem com a heurística acima (prefixo `portal.`
-e dois ou mais pontos) sem ler nenhum parâmetro; nenhuma chave entra em allowlist, só esse
-diretório gerado sai da varredura. A colisão entre a heurística e as chaves i18n do Portal é
-`OD-P46` (`docs/framework/arch/portal-build-pack.md` §4).
+`dashboard` — **exceto** quando os dois primeiros segmentos do literal formam um
+namespace declarado em §Namespaces i18n (allowlist do verificador); nesse caso o
+literal não é candidato, porque é uma chave i18n, não um parâmetro. Literais
+desconhecidos de um ponto são ambíguos com entidades de auditoria, como
+`portal.complaint`, e não são candidatos. A allowlist de namespaces i18n é a
+única isenção da heurística: nunca por diretório. Assim, com a varredura cobrindo
+todo diretório, os rótulos `portal.requests.nextAction.<STATE>` e
+`portal.evaluations.publicIndicator` — transcritos como tipos `const` nos
+clientes de comando gerados (`BP-PORTAL-*.commands.ts`,
+`packages/api-clients/src/generated`) — deixam de ser candidatos porque seus dois
+primeiros segmentos formam, respectivamente, os namespaces `portal.requests` e
+`portal.evaluations` da allowlist. Não existe allowlist silenciosa: a única
+allowlist é a declarada em §Namespaces i18n e lida pelo verificador; todo outro
+candidato desconhecido falha com arquivo, linha e literal.

 A conversão de `inf.normative_agency_parameter` em view está fora deste contrato.
diff --git a/docs/framework/arch/portal-build-pack.md b/docs/framework/arch/portal-build-pack.md
index 09c31ed..01c4f52 100644
--- a/docs/framework/arch/portal-build-pack.md
+++ b/docs/framework/arch/portal-build-pack.md
@@ -3,7 +3,7 @@ id: ARCH-PORTAL-BUILD-PACK
 title: Pacote de construção do Portal — definições e pacotes de trabalho para a orquestra (domínio portal, projeções, PWA)
 status: draft
 apps: [portal]
-updated: 2026-09-16
+updated: 2026-09-17
 ---

 # Pacote de construção do Portal
@@ -184,41 +184,41 @@ Registradas por TASK-0010 (Architect, transcrição), transcritas dos relatório
 dos contratos `work/rounds/R-0009/contracts/CTG-000{1,2}.md`; nenhuma é fechada por esta tarefa
 (transcrição, Art. 6/10). Formato de `docs/meta/knowledge-base/open-decisions-rait.md` §F.

-| ID     | Questão                                                                                                                                                                                                                                                                                                                                   | Premissa adotada                                                                                                                                                                                                                                            | Decisor                              | Fonte                                 |
-| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------- |
-| OD-P14 | Unificar `portal/complaints` (PEC, DDL 60, papéis `CANDIDATO\|DPO\|AUDITOR\|GESTOR_DETRAN\|SUPORTE`) com `portal.manifestation` ([WF-PORTAL-004], Lei 13.460) — mesmo canal de reclamação em duas tabelas?                                                                                                                                | Mantidos separados nesta rodada (M2): `complaint` não é manifestação de ouvidoria; nenhuma tabela duplicada para o mesmo fato até decisão                                                                                                                   | Owner (após parity/freeze PEC)       | `plan.md` M2                          |
-| OD-P15 | Credenciais institucionais do cliente OIDC gov.br (client id/secret, attribute mapping do pool)                                                                                                                                                                                                                                           | `source_pending`; só IdP simulado nos perfis `test`/`local` (`DetranLocalTokenVerifier`) nesta rodada                                                                                                                                                       | Architect (R-0014 WP-P6)             | `plan.md` M3; ADR-0024 §Consequências |
-| OD-P16 | Envio real da adesão/cancelamento de SNE ao sistema nacional via `SnePort` (`packages/senatran-adapter`)                                                                                                                                                                                                                                  | Nesta rodada grava `portal.sne_enrollment`, publica `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` e responde `ADERIDO_SNE`/`NAO_ADERIDO_SNE` sem chamar o SNE nacional                                                                              | Architect (R-0014 WP-P6)             | `plan.md` M8                          |
-| OD-P17 | `lgpd_declaracao` delega a `@stynx-nyx/privacy` (`/privacy/exports`); módulo `privacy` do STYNX não montado no app                                                                                                                                                                                                                        | `PORTAL.SERVICE_UNAVAILABLE {unavailableReason:'privacy_endpoint_pendente'}`; catálogo marca `lgpd_declaracao` `partially_available` (só escopo `confirmacao`)                                                                                              | Architect (R-0014)                   | `plan.md` M8, M12                     |
-| OD-P18 | Balcão da ouvidoria: transições do órgão da manifestação (`EM_ANALISE`, `INFORMACAO_SOLICITADA_AO_AGENTE`, `DECISAO_FINAL_ELABORADA`, `CIENCIA_AO_USUARIO`) sem rota cidadã                                                                                                                                                               | Existem só como `MANIFESTATION_TRANSITIONS` e serviço interno testável; a interface do agente é do DASHBOARD                                                                                                                                                | Architect (DASHBOARD R-0011)         | `plan.md` M13                         |
-| OD-P19 | `junta_medica` (delegação PEC sem comando) e projetores `crash_view`/`exam_view` sem produtor real (BOAT/PEC)                                                                                                                                                                                                                             | `junta_medica` fora do catálogo de 15 serviços desta rodada (§5.1 do contrato de rotas continua listando-a com a pendência); `crash_view`/`exam_view` só tabela + projetor esqueleto (`applyEvent` registrando `last_event_id`)                             | Architect (R-0010/PEC)               | `plan.md` M12, M16                    |
-| OD-P20 | 3 dos 15 estados de `inf.infraction_state_ref` sem rótulo cidadão em `INFRACTION_SITUATION_MAP` (`AIT_LAVRADO`, `PENALIDADE_A_APLICAR`, `AGUARDANDO_RECURSO_2A`)                                                                                                                                                                          | Evento com esses `toState` falha o projetor (`last_error='PORTAL.INTERNAL:situation:<toState>'`), nunca rótulo inventado (C-0002-46)                                                                                                                        | Architect / Owner (linguagem cidadã) | `plan.md` M16; CTG-0002 §7.3, §13     |
-| OD-P21 | Operação de leitura nacional ausente na porta (`CdtPort`/`RenachPort`/`RenavamReadPort`, `packages/senatran-adapter/src/ports.ts`)                                                                                                                                                                                                        | Rota responde 503 `PORTAL.NATIONAL_READ_UNAVAILABLE {cachedAt:null, retryAfter}`; nunca `fetch` próprio; `retryAfter` = TTL (minutos) × 60 sem segundos documentados no catálogo de parâmetros                                                              | Architect (R-0014 WP-P6)             | `plan.md` M17; CTG-0002 §15           |
-| OD-P22 | Reconciliar `parameter-catalogue.md` §PORTAL (`portal.act_level_policy`/`portal.govbr_seal_mapping` como parâmetros json) com ADR-0024/M5 (tabela + attribute mapping do IdP) — duas fontes de verdade para a mesma matriz; vocabulário `advanced/simple` × tokens canônicos; intervalo de recarga do `PortalHostnameDirectory` sem fonte | Propor rebaixar as duas entradas do catálogo a documentação (sem consumidor em código) ou removê-las; vocabulário a alinhar; recarga `source_pending`                                                                                                       | Architect / Owner (catálogo é H.54)  | CTG-0001 §13; TASK-0001/0002          |
-| OD-P23 | `portal.subject.cpf_hash` = sha256 sem chave (M6) — espaço de 10^11 CPFs torna o hash reversível por força bruta                                                                                                                                                                                                                          | Fixtures e testes desta rodada usam sha256 puro (M6); propor HMAC-SHA256 com segredo do tenant/app antes de dado real                                                                                                                                       | Architect / DPO (R-0014)             | CTG-0001 §13                          |
-| OD-P24 | Janela do convite de avaliação (`AVALIACAO_OFERECIDA → CONCLUIDO \| ENCERRADA` "janela expira") sem valor na fonte                                                                                                                                                                                                                        | `T-AVAL-CONVITE` é imediato (disparo), não a janela; expiração não é executada nesta rodada (só a resposta do cidadão fecha)                                                                                                                                | Owner                                | CTG-0001 §13                          |
-| OD-P25 | Claim `govbr_level` (selo bruto) e dígito verificador do CPF — nomes/valores reais dependem do attribute mapping do pool (OD-P15)                                                                                                                                                                                                         | Nome fixo `govbr_level`, opcional, sem validação de DV nesta rodada                                                                                                                                                                                         | Architect (homologação R-0014)       | CTG-0001 §13                          |
-| OD-P26 | Conteúdo real da Carta de Serviços (`service_catalog`) e da marca (`brand_profile`) para produção                                                                                                                                                                                                                                         | Textos de `70-fixtures-portal.sql` são fixtures (`"(fixture)"`/`'source_pending'`); carga institucional pelo agency-admin com [REF-DETRANAM-SERVICOS]                                                                                                       | Owner                                | CTG-0001 §13; TASK-0003               |
-| OD-P27 | Ator nominal das rotas públicas do Portal (`PORTAL_PUBLIC_ACTOR_ID`, UUID nulo) e bypass de membership no interceptor de tenancy só para `/v1/portal/*` `@Public()` — o STYNX exige `actorId`/membership no `RequestContext`                                                                                                              | Bypass documentado nesta rodada (A3(b)); pedir ao STYNX suporte nativo a rotas públicas por tenant                                                                                                                                                          | Architect / STYNX                    | TASK-0004; `plan.md` A3(b)            |
-| OD-P28 | Schemas dos eventos consumidos pelas projeções sem produtor em `main` (`NOTIFICACAO_EXPEDIDA`/`NOTIFICACAO_CIENCIA` de `inf/notification`, `PAGAMENTO_CONFIRMADO` de `inf/collection`)                                                                                                                                                    | Types e `data` mínimos propostos ao produtor (CTG-0002 §7.5); `docs/framework/schemas/events/` ganha os três                                                                                                                                                | Architect (R-0007/R-0014)            | CTG-0002 §15                          |
-| OD-P29 | Backfill de `portal.entitlement` quando o sujeito é criado depois dos eventos de infração (primeiro `GET me`)                                                                                                                                                                                                                             | Consultar a projeção `infraction_view` por `cpf_hash` → `entitlement origin='infraction'`                                                                                                                                                                   | Architect                            | CTG-0002 §15                          |
-| OD-P30 | Autenticação oportunista em rota `@Public()` (`POST manifestations`, H.51 "simples para acompanhar") — extensão do guard de auth do app                                                                                                                                                                                                   | Implementada nesta rodada como extensão do STYNX (§2.8); ratificar formalmente com o STYNX junto de OD-P27                                                                                                                                                  | Architect / STYNX                    | CTG-0002 §15; `plan.md` A4(b)         |
-| OD-P31 | Conteúdo versionado de `GET content/points-explainer` (T-15) sem fonte                                                                                                                                                                                                                                                                    | Rota não montada nesta rodada                                                                                                                                                                                                                               | Owner (conteúdo institucional)       | CTG-0002 §15; `plan.md` A4(d)         |
-| OD-P32 | Pré-preenchimento por serviço (`prefilled`, `RN-PORTAL-106`) depende das delegações reais                                                                                                                                                                                                                                                 | Vazio nesta rodada (R-0007 ausente)                                                                                                                                                                                                                         | Architect (R-0014)                   | CTG-0002 §15                          |
-| OD-P33 | Versões esperadas dos textos institucionais (`consequence_ack.text_version`, `sne_enrollment.consent_text_version`, termo de desistência) sem fonte                                                                                                                                                                                       | Qualquer versão não vazia é aceita e gravada nesta rodada                                                                                                                                                                                                   | Owner / DPO                          | CTG-0002 §15                          |
-| OD-P34 | Pontuação por AIT na projeção (`infraction_view.points`) e `disputed_points` reais                                                                                                                                                                                                                                                        | Propor coluna `points` em `BP-PORTAL-PROJECTIONS-001` v1.1 alimentada por `PENALIDADE_DEFINITIVA` e pelo enquadramento                                                                                                                                      | Architect                            | CTG-0002 §15                          |
-| OD-P35 | Mapeamento de `CitizenLicense.license` (opaco no adapter) → campos cidadãos da CNH (status, validade, categorias, restrições)                                                                                                                                                                                                             | Depende do contrato real CDT (senatran-mock)                                                                                                                                                                                                                | Architect (R-0014 WP-P6)             | CTG-0002 §15                          |
-| OD-P36 | Identificador do veículo nas rotas `vehicles/{id}` (uuid de `entitlement` × placa) e forma tipada de `GET vehicles` (`CitizenCollection` opaco)                                                                                                                                                                                           | Sem forma fixada nesta rodada                                                                                                                                                                                                                               | Architect                            | CTG-0002 §15                          |
-| OD-P37 | Validação/recusa da procuração (`PROCURACAO_VALIDADA`/`RECUSADA`) sem rota cidadã; expiração em cascata dos `entitlement` `origin='representation'`                                                                                                                                                                                       | Balcão/DASHBOARD (R-0011) ou automática por documento assinado (`RN-PORTAL-104`); `validateRepresentation` interno, sem rota, responde `VALIDATION_FAILED {fields:['state']}` fora de estado                                                                | Owner / Architect                    | CTG-0002 §15; TASK-0007               |
-| OD-P38 | Substrato de preferências (`@stynx-nyx/preferences`) não montado no app                                                                                                                                                                                                                                                                   | `PUT preferences` responde `SERVICE_UNAVAILABLE` nesta rodada                                                                                                                                                                                               | Architect (R-0014)                   | CTG-0002 §15                          |
-| OD-P39 | Dono (cidadão × órgão) por timer de `inf.infraction_timer_ref` para `deadlines[].ownedBy` sem coluna                                                                                                                                                                                                                                      | Propor coluna `owned_by` no vocabulário (DDL 14, R-0007); `deadlines_json` vem `[]` do projetor nesta rodada                                                                                                                                                | Architect                            | CTG-0002 §15                          |
-| OD-P40 | Produtor de `portal.inbox_item` a partir de `NOTIFICACAO_EXPEDIDA` (sne/portal) e de eventos de processo, e entrega push/`@stynx-nyx/notifications`                                                                                                                                                                                       | Sexto projetor, fora de M16 nesta rodada; SSE `inbox.item` sem produtor até lá                                                                                                                                                                              | Architect (R-0014)                   | CTG-0002 §15; `plan.md` A4(d)         |
-| OD-P41 | `payment_json.tiers`/`refund` a partir da cotação nacional (`cdt.getPaymentQuote`) e do módulo de arrecadação; `evidenceAvailable` (`ops/evidence`)                                                                                                                                                                                       | `amount=null` (framing sem valor numérico) nesta rodada                                                                                                                                                                                                     | Architect (R-0007/R-0014)            | CTG-0002 §15; TASK-0008               |
-| OD-P42 | Anexos: armazenamento assinado (ADR-0018) e limites de `ATTACHMENT_INVALID` (tipos, `maxBytes`) sem fonte                                                                                                                                                                                                                                 | Sem implementação de upload real nesta rodada                                                                                                                                                                                                               | Architect / Owner                    | CTG-0002 §15                          |
-| OD-P43 | Vocabulário de `decisionKind`/`addressee` do RAIT → `outcome` cidadão (`deferido\|indeferido\|…`) e diligências                                                                                                                                                                                                                           | Fixado por R-0007                                                                                                                                                                                                                                           | Architect (R-0007)                   | CTG-0002 §15                          |
-| OD-P44 | Acompanhamento de manifestação anônima por protocolo sem sessão (H.51 "simples para acompanhar" × anônimo)                                                                                                                                                                                                                                | Rota `GET manifestations/by-protocol/{protocol}`? não implementada nesta rodada                                                                                                                                                                             | Owner                                | CTG-0002 §15                          |
-| OD-P45 | Limites de conexão do SSE (1/aba, 5/usuário → 429 `PORTAL.RATE_LIMITED`)                                                                                                                                                                                                                                                                  | Contagem não implementada nesta rodada                                                                                                                                                                                                                      | Architect                            | CTG-0002 §15                          |
-| OD-P46 | `verify:parameter-catalogue --check-usage` acusava chaves i18n do Portal (`portal.requests.nextAction.<STATE>`, `portal.evaluations.publicIndicator`) nos clientes gerados como candidatas a parâmetro — colisão heurística (prefixo `portal.` + ≥2 pontos) × chave i18n                                                                  | Excluída **só** `packages/api-clients/src/generated` da varredura de uso (A7, `parameter-catalogue.md` §Verificador fail-closed); prefixo ou allowlist declarada para chaves i18n quando `i18n/portal.pt-BR.json` entrar em código fica para decisão futura | Architect (R-0014)                   | `plan.md` A7                          |
+| ID     | Questão                                                                                                                                                                                                                                                                                                                                   | Premissa adotada                                                                                                                                                                                                                | Decisor                              | Fonte                                 |
+| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------- |
+| OD-P14 | Unificar `portal/complaints` (PEC, DDL 60, papéis `CANDIDATO\|DPO\|AUDITOR\|GESTOR_DETRAN\|SUPORTE`) com `portal.manifestation` ([WF-PORTAL-004], Lei 13.460) — mesmo canal de reclamação em duas tabelas?                                                                                                                                | Mantidos separados nesta rodada (M2): `complaint` não é manifestação de ouvidoria; nenhuma tabela duplicada para o mesmo fato até decisão                                                                                       | Owner (após parity/freeze PEC)       | `plan.md` M2                          |
+| OD-P15 | Credenciais institucionais do cliente OIDC gov.br (client id/secret, attribute mapping do pool)                                                                                                                                                                                                                                           | `source_pending`; só IdP simulado nos perfis `test`/`local` (`DetranLocalTokenVerifier`) nesta rodada                                                                                                                           | Architect (R-0014 WP-P6)             | `plan.md` M3; ADR-0024 §Consequências |
+| OD-P16 | Envio real da adesão/cancelamento de SNE ao sistema nacional via `SnePort` (`packages/senatran-adapter`)                                                                                                                                                                                                                                  | Nesta rodada grava `portal.sne_enrollment`, publica `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` e responde `ADERIDO_SNE`/`NAO_ADERIDO_SNE` sem chamar o SNE nacional                                                  | Architect (R-0014 WP-P6)             | `plan.md` M8                          |
+| OD-P17 | `lgpd_declaracao` delega a `@stynx-nyx/privacy` (`/privacy/exports`); módulo `privacy` do STYNX não montado no app                                                                                                                                                                                                                        | `PORTAL.SERVICE_UNAVAILABLE {unavailableReason:'privacy_endpoint_pendente'}`; catálogo marca `lgpd_declaracao` `partially_available` (só escopo `confirmacao`)                                                                  | Architect (R-0014)                   | `plan.md` M8, M12                     |
+| OD-P18 | Balcão da ouvidoria: transições do órgão da manifestação (`EM_ANALISE`, `INFORMACAO_SOLICITADA_AO_AGENTE`, `DECISAO_FINAL_ELABORADA`, `CIENCIA_AO_USUARIO`) sem rota cidadã                                                                                                                                                               | Existem só como `MANIFESTATION_TRANSITIONS` e serviço interno testável; a interface do agente é do DASHBOARD                                                                                                                    | Architect (DASHBOARD R-0011)         | `plan.md` M13                         |
+| OD-P19 | `junta_medica` (delegação PEC sem comando) e projetores `crash_view`/`exam_view` sem produtor real (BOAT/PEC)                                                                                                                                                                                                                             | `junta_medica` fora do catálogo de 15 serviços desta rodada (§5.1 do contrato de rotas continua listando-a com a pendência); `crash_view`/`exam_view` só tabela + projetor esqueleto (`applyEvent` registrando `last_event_id`) | Architect (R-0010/PEC)               | `plan.md` M12, M16                    |
+| OD-P20 | 3 dos 15 estados de `inf.infraction_state_ref` sem rótulo cidadão em `INFRACTION_SITUATION_MAP` (`AIT_LAVRADO`, `PENALIDADE_A_APLICAR`, `AGUARDANDO_RECURSO_2A`)                                                                                                                                                                          | Evento com esses `toState` falha o projetor (`last_error='PORTAL.INTERNAL:situation:<toState>'`), nunca rótulo inventado (C-0002-46)                                                                                            | Architect / Owner (linguagem cidadã) | `plan.md` M16; CTG-0002 §7.3, §13     |
+| OD-P21 | Operação de leitura nacional ausente na porta (`CdtPort`/`RenachPort`/`RenavamReadPort`, `packages/senatran-adapter/src/ports.ts`)                                                                                                                                                                                                        | Rota responde 503 `PORTAL.NATIONAL_READ_UNAVAILABLE {cachedAt:null, retryAfter}`; nunca `fetch` próprio; `retryAfter` = TTL (minutos) × 60 sem segundos documentados no catálogo de parâmetros                                  | Architect (R-0014 WP-P6)             | `plan.md` M17; CTG-0002 §15           |
+| OD-P22 | Reconciliar `parameter-catalogue.md` §PORTAL (`portal.act_level_policy`/`portal.govbr_seal_mapping` como parâmetros json) com ADR-0024/M5 (tabela + attribute mapping do IdP) — duas fontes de verdade para a mesma matriz; vocabulário `advanced/simple` × tokens canônicos; intervalo de recarga do `PortalHostnameDirectory` sem fonte | Propor rebaixar as duas entradas do catálogo a documentação (sem consumidor em código) ou removê-las; vocabulário a alinhar; recarga `source_pending`                                                                           | Architect / Owner (catálogo é H.54)  | CTG-0001 §13; TASK-0001/0002          |
+| OD-P23 | `portal.subject.cpf_hash` = sha256 sem chave (M6) — espaço de 10^11 CPFs torna o hash reversível por força bruta                                                                                                                                                                                                                          | Fixtures e testes desta rodada usam sha256 puro (M6); propor HMAC-SHA256 com segredo do tenant/app antes de dado real                                                                                                           | Architect / DPO (R-0014)             | CTG-0001 §13                          |
+| OD-P24 | Janela do convite de avaliação (`AVALIACAO_OFERECIDA → CONCLUIDO \| ENCERRADA` "janela expira") sem valor na fonte                                                                                                                                                                                                                        | `T-AVAL-CONVITE` é imediato (disparo), não a janela; expiração não é executada nesta rodada (só a resposta do cidadão fecha)                                                                                                    | Owner                                | CTG-0001 §13                          |
+| OD-P25 | Claim `govbr_level` (selo bruto) e dígito verificador do CPF — nomes/valores reais dependem do attribute mapping do pool (OD-P15)                                                                                                                                                                                                         | Nome fixo `govbr_level`, opcional, sem validação de DV nesta rodada                                                                                                                                                             | Architect (homologação R-0014)       | CTG-0001 §13                          |
+| OD-P26 | Conteúdo real da Carta de Serviços (`service_catalog`) e da marca (`brand_profile`) para produção                                                                                                                                                                                                                                         | Textos de `70-fixtures-portal.sql` são fixtures (`"(fixture)"`/`'source_pending'`); carga institucional pelo agency-admin com [REF-DETRANAM-SERVICOS]                                                                           | Owner                                | CTG-0001 §13; TASK-0003               |
+| OD-P27 | Ator nominal das rotas públicas do Portal (`PORTAL_PUBLIC_ACTOR_ID`, UUID nulo) e bypass de membership no interceptor de tenancy só para `/v1/portal/*` `@Public()` — o STYNX exige `actorId`/membership no `RequestContext`                                                                                                              | Bypass documentado nesta rodada (A3(b)); pedir ao STYNX suporte nativo a rotas públicas por tenant                                                                                                                              | Architect / STYNX                    | TASK-0004; `plan.md` A3(b)            |
+| OD-P28 | Schemas dos eventos consumidos pelas projeções sem produtor em `main` (`NOTIFICACAO_EXPEDIDA`/`NOTIFICACAO_CIENCIA` de `inf/notification`, `PAGAMENTO_CONFIRMADO` de `inf/collection`)                                                                                                                                                    | Types e `data` mínimos propostos ao produtor (CTG-0002 §7.5); `docs/framework/schemas/events/` ganha os três                                                                                                                    | Architect (R-0007/R-0014)            | CTG-0002 §15                          |
+| OD-P29 | Backfill de `portal.entitlement` quando o sujeito é criado depois dos eventos de infração (primeiro `GET me`)                                                                                                                                                                                                                             | Consultar a projeção `infraction_view` por `cpf_hash` → `entitlement origin='infraction'`                                                                                                                                       | Architect                            | CTG-0002 §15                          |
+| OD-P30 | Autenticação oportunista em rota `@Public()` (`POST manifestations`, H.51 "simples para acompanhar") — extensão do guard de auth do app                                                                                                                                                                                                   | Implementada nesta rodada como extensão do STYNX (§2.8); ratificar formalmente com o STYNX junto de OD-P27                                                                                                                      | Architect / STYNX                    | CTG-0002 §15; `plan.md` A4(b)         |
+| OD-P31 | Conteúdo versionado de `GET content/points-explainer` (T-15) sem fonte                                                                                                                                                                                                                                                                    | Rota não montada nesta rodada                                                                                                                                                                                                   | Owner (conteúdo institucional)       | CTG-0002 §15; `plan.md` A4(d)         |
+| OD-P32 | Pré-preenchimento por serviço (`prefilled`, `RN-PORTAL-106`) depende das delegações reais                                                                                                                                                                                                                                                 | Vazio nesta rodada (R-0007 ausente)                                                                                                                                                                                             | Architect (R-0014)                   | CTG-0002 §15                          |
+| OD-P33 | Versões esperadas dos textos institucionais (`consequence_ack.text_version`, `sne_enrollment.consent_text_version`, termo de desistência) sem fonte                                                                                                                                                                                       | Qualquer versão não vazia é aceita e gravada nesta rodada                                                                                                                                                                       | Owner / DPO                          | CTG-0002 §15                          |
+| OD-P34 | Pontuação por AIT na projeção (`infraction_view.points`) e `disputed_points` reais                                                                                                                                                                                                                                                        | Propor coluna `points` em `BP-PORTAL-PROJECTIONS-001` v1.1 alimentada por `PENALIDADE_DEFINITIVA` e pelo enquadramento                                                                                                          | Architect                            | CTG-0002 §15                          |
+| OD-P35 | Mapeamento de `CitizenLicense.license` (opaco no adapter) → campos cidadãos da CNH (status, validade, categorias, restrições)                                                                                                                                                                                                             | Depende do contrato real CDT (senatran-mock)                                                                                                                                                                                    | Architect (R-0014 WP-P6)             | CTG-0002 §15                          |
+| OD-P36 | Identificador do veículo nas rotas `vehicles/{id}` (uuid de `entitlement` × placa) e forma tipada de `GET vehicles` (`CitizenCollection` opaco)                                                                                                                                                                                           | Sem forma fixada nesta rodada                                                                                                                                                                                                   | Architect                            | CTG-0002 §15                          |
+| OD-P37 | Validação/recusa da procuração (`PROCURACAO_VALIDADA`/`RECUSADA`) sem rota cidadã; expiração em cascata dos `entitlement` `origin='representation'`                                                                                                                                                                                       | Balcão/DASHBOARD (R-0011) ou automática por documento assinado (`RN-PORTAL-104`); `validateRepresentation` interno, sem rota, responde `VALIDATION_FAILED {fields:['state']}` fora de estado                                    | Owner / Architect                    | CTG-0002 §15; TASK-0007               |
+| OD-P38 | Substrato de preferências (`@stynx-nyx/preferences`) não montado no app                                                                                                                                                                                                                                                                   | `PUT preferences` responde `SERVICE_UNAVAILABLE` nesta rodada                                                                                                                                                                   | Architect (R-0014)                   | CTG-0002 §15                          |
+| OD-P39 | Dono (cidadão × órgão) por timer de `inf.infraction_timer_ref` para `deadlines[].ownedBy` sem coluna                                                                                                                                                                                                                                      | Propor coluna `owned_by` no vocabulário (DDL 14, R-0007); `deadlines_json` vem `[]` do projetor nesta rodada                                                                                                                    | Architect                            | CTG-0002 §15                          |
+| OD-P40 | Produtor de `portal.inbox_item` a partir de `NOTIFICACAO_EXPEDIDA` (sne/portal) e de eventos de processo, e entrega push/`@stynx-nyx/notifications`                                                                                                                                                                                       | Sexto projetor, fora de M16 nesta rodada; SSE `inbox.item` sem produtor até lá                                                                                                                                                  | Architect (R-0014)                   | CTG-0002 §15; `plan.md` A4(d)         |
+| OD-P41 | `payment_json.tiers`/`refund` a partir da cotação nacional (`cdt.getPaymentQuote`) e do módulo de arrecadação; `evidenceAvailable` (`ops/evidence`)                                                                                                                                                                                       | `amount=null` (framing sem valor numérico) nesta rodada                                                                                                                                                                         | Architect (R-0007/R-0014)            | CTG-0002 §15; TASK-0008               |
+| OD-P42 | Anexos: armazenamento assinado (ADR-0018) e limites de `ATTACHMENT_INVALID` (tipos, `maxBytes`) sem fonte                                                                                                                                                                                                                                 | Sem implementação de upload real nesta rodada                                                                                                                                                                                   | Architect / Owner                    | CTG-0002 §15                          |
+| OD-P43 | Vocabulário de `decisionKind`/`addressee` do RAIT → `outcome` cidadão (`deferido\|indeferido\|…`) e diligências                                                                                                                                                                                                                           | Fixado por R-0007                                                                                                                                                                                                               | Architect (R-0007)                   | CTG-0002 §15                          |
+| OD-P44 | Acompanhamento de manifestação anônima por protocolo sem sessão (H.51 "simples para acompanhar" × anônimo)                                                                                                                                                                                                                                | Rota `GET manifestations/by-protocol/{protocol}`? não implementada nesta rodada                                                                                                                                                 | Owner                                | CTG-0002 §15                          |
+| OD-P45 | Limites de conexão do SSE (1/aba, 5/usuário → 429 `PORTAL.RATE_LIMITED`)                                                                                                                                                                                                                                                                  | Contagem não implementada nesta rodada                                                                                                                                                                                          | Architect                            | CTG-0002 §15                          |
+| OD-P46 | `verify:parameter-catalogue --check-usage` acusava chaves i18n do Portal (`portal.requests.nextAction.<STATE>`, `portal.evaluations.publicIndicator`) nos clientes gerados como candidatas a parâmetro — colisão heurística (prefixo `portal.` + ≥2 pontos) × chave i18n                                                                  | **Resolvida em R-0014** (Owner, 2026-09-17; `plan.md` M10): allowlist de namespaces i18n declarada em `parameter-catalogue.md` §Namespaces i18n e lida por `verify.mjs`; exclusão por diretório (A7) removida                   | Owner (fechada, R-0014)              | `plan.md` A7                          |

 ## 5. Mapa entregável → definições

diff --git a/docs/framework/arch/portal-frontends.md b/docs/framework/arch/portal-frontends.md
index bc8e247..634cc74 100644
--- a/docs/framework/arch/portal-frontends.md
+++ b/docs/framework/arch/portal-frontends.md
@@ -3,7 +3,7 @@ id: ARCH-PORTAL-FRONTENDS
 title: apps/portal/web — especificação completa do portal do cidadão (módulos, telas, rotas, componentes, jornadas, ações)
 status: draft
 apps: [portal]
-updated: 2026-09-13
+updated: 2026-09-17
 ---

 # Portal do cidadão — `apps/portal/web`
@@ -25,17 +25,17 @@ vale o artefato de produto.

 ## 1. Stack, princípios e fronteiras

-| Item           | Decisão                                                                                                                                                                                                                                                                                |
-| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
-| Framework      | Angular 22 (ADR-0015), standalone, `OnPush`, signals; PWA (service worker, manifesto, instalável); **modo offline só para CNH-e e CRLV-e** ([UC-PORTAL-011] AC-4, [JRN-PORTAL-006]) via cache cifrado do documento                                                                     |
-| Kit            | `@detran/ui` (feedback pt-BR, tema, primitivos STYNX) — o shell é próprio (`CitizenShell`: cabeçalho com marca do órgão, navegação de 5 destinos, rodapé com Carta de Serviços, canal presencial e acessibilidade); nenhum componente do RAIT ou do TEAT é reutilizado ([RN-RAIT-134]) |
-| Identidade     | Cognito federado ao **gov.br OIDC** (ADR-0019); papel `CIDADAO`; representação por procuração como atributo da sessão, não papel; nível de assinatura como claim assinada (`assurance_level`: `simples` \| `avancada` \| `qualificada`), nunca aceito do cliente                       |
-| Marca e tenant | tenant resolvido pelo `Host` no servidor (`platform.public_hostname`); `GET /v1/portal/brand` público; `runtime-config.js` só com `tenantId`, `oidcAuthority`, `clientId`                                                                                                              |
-| API            | somente `/v1/portal/*` (`portal-route-contract.md`), mesma origem; **nenhuma** chamada a sistemas nacionais, ao RAIT ou ao TEAT a partir do browser; o Portal lê **projeções** (ADR-0020) e emite **comandos delegados** (ADR-0019)                                                    |
-| Estado         | signals + facades por feature; sem NgRx; rascunhos de pedido persistidos no servidor (`portal/requests` em `PEDIDO_EM_COMPOSICAO`), não em `localStorage`                                                                                                                              |
-| Idioma         | pt-BR, linguagem cidadã; catálogo `i18n/portal.pt-BR.json` com o **mapa de tradução** dos estados internos (RAIT/PEC/BOAT → situação cidadã) como única fonte                                                                                                                          |
-| Acessibilidade | WCAG 2.1 AA + eMAG (DT-028) em todas as 27 telas; guia e boleto acessíveis mediante solicitação ([RN-PORTAL-114]); skip link, `aria-live` em estados, sem remoção de foco                                                                                                              |
-| Fronteiras     | o Portal nunca decide mérito, nunca calcula prazo legal, nunca registra veículo/CNH/sinistro: exibe, compõe e protocola; prazos chegam calculados e rotulados ("seu prazo" × "prazo do órgão")                                                                                         |
+| Item           | Decisão                                                                                                                                                                                                                                                                                                                                           |
+| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| Framework      | Angular 22 (ADR-0015), standalone, `OnPush`, signals; PWA (service worker, manifesto, instalável); **modo offline só para CNH-e e CRLV-e** ([UC-PORTAL-011] AC-4, [JRN-PORTAL-006]) via cache cifrado do documento                                                                                                                                |
+| Kit            | `@detran/ui` (feedback pt-BR, tema, primitivos STYNX) — o shell é próprio (`CitizenShell`: cabeçalho com marca do órgão, navegação de 5 destinos, rodapé com Carta de Serviços, canal presencial e acessibilidade); nenhum componente do RAIT ou do TEAT é reutilizado ([RN-RAIT-134])                                                            |
+| Identidade     | Cognito federado ao **gov.br OIDC** (ADR-0019); papel `CIDADAO`; representação por procuração como atributo da sessão, não papel; nível de assinatura como claim assinada (`assurance_level`: `simples` \| `avancada` \| `qualificada`), nunca aceito do cliente                                                                                  |
+| Marca e tenant | tenant resolvido pelo `Host` no servidor (`platform.public_hostname`); `GET /v1/portal/brand` público; `runtime-config.js` só com `tenantId`, `oidcAuthority`, `clientId`                                                                                                                                                                         |
+| API            | somente `/v1/portal/*` (`portal-route-contract.md`), mesma origem; **nenhuma** chamada a sistemas nacionais, ao RAIT ou ao TEAT a partir do browser; o Portal lê **projeções** (ADR-0020) e emite **comandos delegados** (ADR-0019)                                                                                                               |
+| Estado         | signals + facades por feature; sem NgRx; rascunhos de pedido persistidos no servidor (`portal/requests` em `PEDIDO_EM_COMPOSICAO`), não em `localStorage`                                                                                                                                                                                         |
+| Idioma         | pt-BR, linguagem cidadã; catálogo `apps/portal/web/src/app/i18n/portal.pt-BR.json` com o **mapa de tradução** dos estados internos (RAIT/PEC/BOAT → situação cidadã) como única fonte; só os namespaces `portal.<namespace>` declarados na allowlist do `parameter-catalogue.md` §Namespaces i18n são reconhecidos pelo verificador de parâmetros |
+| Acessibilidade | WCAG 2.1 AA + eMAG (DT-028) em todas as 27 telas; guia e boleto acessíveis mediante solicitação ([RN-PORTAL-114]); skip link, `aria-live` em estados, sem remoção de foco                                                                                                                                                                         |
+| Fronteiras     | o Portal nunca decide mérito, nunca calcula prazo legal, nunca registra veículo/CNH/sinistro: exibe, compõe e protocola; prazos chegam calculados e rotulados ("seu prazo" × "prazo do órgão")                                                                                                                                                    |

 ## 2. Invariantes de interface (valem para toda tela)

@@ -228,6 +228,10 @@ apps/portal/web/src/app/
   i18n/       portal.pt-BR.json (inclui o mapa de tradução de estados)
````

+Caminho completo: `apps/portal/web/src/app/i18n/portal.pt-BR.json`; só os namespaces
+declarados na allowlist do `parameter-catalogue.md` §Namespaces i18n (allowlist do
+verificador) são reconhecidos por `verify:parameter-catalogue --check-usage`. +

## 10. Dependências de backend (pré-requisitos de release)

| Dependência | Situação |
diff --git a/docs/meta/knowledge-base/decision-closure-plan.md b/docs/meta/knowledge-base/decision-closure-plan.md
index b3cda1f..64342d7 100644
--- a/docs/meta/knowledge-base/decision-closure-plan.md
+++ b/docs/meta/knowledge-base/decision-closure-plan.md
@@ -104,6 +104,7 @@ admitindo selo prata, parecer jurídico único).
| OD-P04, OD-P08, OD-P09 | B | `privacy.public_regime_days` pendente | parecer LEGAL (DT-042) |
| OD-P11, OD-P12 | C | `portal.read_cache_ttl_minutes`, `portal.mobile_shell` | Architect em WP-P1 |
| OD-P13 | C | — | **fechada** (R-0009, M7): `@stynx-nyx/flow` avaliado e descartado; máquina fixa de 13 estados em código |
+| OD-P46 | C | allowlist de namespaces i18n no catálogo de parâmetros | **fechada** em R-0014 (Owner, 2026-09-17; M10) |

### BOAT

diff --git a/package.json b/package.json
index 9bb6105..e9d0e40 100644
--- a/package.json
+++ b/package.json
@@ -12,7 +12,7 @@
},
"packageManager": "pnpm@9.15.0",
"scripts": {

- "check": "pnpm format:check && pnpm verify:orchestra-bridge && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm blueprints:check && pnpm contracts:check && pnpm parameters:test && pnpm contracts:test && pnpm verify:parameter-catalogue && pnpm typecheck && pnpm --filter @detran/ui test && pnpm --filter @detran/ui build && pnpm verify:decorators && pnpm verify:rls-ddl && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary && pnpm verify:senatran-boundary && pnpm verify:senatran-contracts && pnpm verify:pec-parity && pnpm verify:pec-superset",

* "check": "pnpm format:check && pnpm verify:orchestra-bridge && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm blueprints:check && pnpm contracts:check && pnpm parameters:test && pnpm contracts:test && pnpm verify:parameter-catalogue && pnpm --filter @detran/ui build && pnpm typecheck && pnpm --filter @detran/ui test && pnpm verify:decorators && pnpm verify:rls-ddl && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary && pnpm verify:senatran-boundary && pnpm verify:senatran-contracts && pnpm verify:pec-parity && pnpm verify:pec-superset && pnpm --filter @detran/portal-web lint && pnpm --filter @detran/portal-web test && pnpm --filter @detran/portal-web build",
  "format:check": "prettier --check .",
  "format": "prettier --write .",
  "typecheck": "pnpm -r --if-present run typecheck",
  diff --git a/packages/ui/package.json b/packages/ui/package.json
  index 2205d1f..ba5c764 100644
  --- a/packages/ui/package.json
  +++ b/packages/ui/package.json
  @@ -5,6 +5,10 @@
  "type": "module",
  "sideEffects": false,
  "exports": {
* ".": {
*      "types": "./dist/types/detran-ui.d.ts",
*      "default": "./dist/fesm2022/detran-ui.mjs"
* },
  "./styles": {
  "default": "./styles/index.css"
  }
  diff --git a/tools/parameters/fixtures/namespaces-allow.txt b/tools/parameters/fixtures/namespaces-allow.txt
  new file mode 100644
  index 0000000..deba1b4
  --- /dev/null
  +++ b/tools/parameters/fixtures/namespaces-allow.txt
  @@ -0,0 +1,38 @@
  +## RAIT
*

+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `rait.pool.limit` | N | 12 | vigente | não | não | OD-001 | worklist |
+| `rait.source.pending` | S | — | proposta | sim | não | DT-001 | worklist |
+| `deadline.T-VOTO` | N | 30 | proposta | não | não | H.54 | deadline |
+| `rait.legal.deadline` | N | 30 | vigente | não | sim | DT-110 | deadline | +
+## TEAT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `teat.speed_meters` | F | false | vigente | não | não | H.54 | speed | +
+## PORTAL +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `portal.card_payment` | S | off | vigente | não | não | DT-031 | payment | +
+## BOAT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `est.renaest.transmit_period` | S | monthly | vigente | não | não | DT-017 | renaest | +
+## DASHBOARD +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `dashboard.heartbeat_minutes` | N | 15 | vigente | não | não | H.54 | monitor | +
+## Namespaces i18n (allowlist do verificador) +
+| Namespace | App | Catálogo | Decisão |
+| --- | --- | --- | --- |
+| `portal.errors` | apps/portal/web | src/app/i18n/portal.pt-BR.json | OD-001 |
diff --git a/tools/parameters/fixtures/namespaces-bad-prefix.txt b/tools/parameters/fixtures/namespaces-bad-prefix.txt
new file mode 100644
index 0000000..674a2a4
--- /dev/null
+++ b/tools/parameters/fixtures/namespaces-bad-prefix.txt
@@ -0,0 +1,38 @@
+## RAIT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `rait.pool.limit` | N | 12 | vigente | não | não | OD-001 | worklist |
+| `rait.source.pending` | S | — | proposta | sim | não | DT-001 | worklist |
+| `deadline.T-VOTO` | N | 30 | proposta | não | não | H.54 | deadline |
+| `rait.legal.deadline` | N | 30 | vigente | não | sim | DT-110 | deadline | +
+## TEAT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `teat.speed_meters` | F | false | vigente | não | não | H.54 | speed | +
+## PORTAL +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `portal.card_payment` | S | off | vigente | não | não | DT-031 | payment | +
+## BOAT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `est.renaest.transmit_period` | S | monthly | vigente | não | não | DT-017 | renaest | +
+## DASHBOARD +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `dashboard.heartbeat_minutes` | N | 15 | vigente | não | não | H.54 | monitor | +
+## Namespaces i18n (allowlist do verificador) +
+| Namespace | App | Catálogo | Decisão |
+| --- | --- | --- | --- |
+| `foo.bar` | apps/nowhere/web | src/app/i18n/nowhere.pt-BR.json | OD-001 |
diff --git a/tools/parameters/fixtures/namespaces-collision.txt b/tools/parameters/fixtures/namespaces-collision.txt
new file mode 100644
index 0000000..df11682
--- /dev/null
+++ b/tools/parameters/fixtures/namespaces-collision.txt
@@ -0,0 +1,39 @@
+## RAIT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `rait.pool.limit` | N | 12 | vigente | não | não | OD-001 | worklist |
+| `rait.source.pending` | S | — | proposta | sim | não | DT-001 | worklist |
+| `deadline.T-VOTO` | N | 30 | proposta | não | não | H.54 | deadline |
+| `rait.legal.deadline` | N | 30 | vigente | não | sim | DT-110 | deadline |
+| `rait.timer.T-DEF` | N | 30 | vigente | não | não | DT-110 | timer | +
+## TEAT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `teat.speed_meters` | F | false | vigente | não | não | H.54 | speed | +
+## PORTAL +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `portal.card_payment` | S | off | vigente | não | não | DT-031 | payment | +
+## BOAT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `est.renaest.transmit_period` | S | monthly | vigente | não | não | DT-017 | renaest | +
+## DASHBOARD +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `dashboard.heartbeat_minutes` | N | 15 | vigente | não | não | H.54 | monitor | +
+## Namespaces i18n (allowlist do verificador) +
+| Namespace | App | Catálogo | Decisão |
+| --- | --- | --- | --- |
+| `rait.timer` | apps/rait/web | src/app/i18n/rait.pt-BR.json | OD-001 |
diff --git a/tools/parameters/fixtures/namespaces-malformed.txt b/tools/parameters/fixtures/namespaces-malformed.txt
new file mode 100644
index 0000000..c2604bf
--- /dev/null
+++ b/tools/parameters/fixtures/namespaces-malformed.txt
@@ -0,0 +1,38 @@
+## RAIT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `rait.pool.limit` | N | 12 | vigente | não | não | OD-001 | worklist |
+| `rait.source.pending` | S | — | proposta | sim | não | DT-001 | worklist |
+| `deadline.T-VOTO` | N | 30 | proposta | não | não | H.54 | deadline |
+| `rait.legal.deadline` | N | 30 | vigente | não | sim | DT-110 | deadline | +
+## TEAT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `teat.speed_meters` | F | false | vigente | não | não | H.54 | speed | +
+## PORTAL +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `portal.card_payment` | S | off | vigente | não | não | DT-031 | payment | +
+## BOAT +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `est.renaest.transmit_period` | S | monthly | vigente | não | não | DT-017 | renaest | +
+## DASHBOARD +
+| Chave | Tipo | Default | Status | pend. | legal | Decisão | Consumidor |
+| --- | --- | --- | --- | --- | --- | --- | --- |
+| `dashboard.heartbeat_minutes` | N | 15 | vigente | não | não | H.54 | monitor | +
+## Namespaces i18n (allowlist do verificador) +
+| Namespace | App | Catálogo |
+| --- | --- | --- |
+| `portal.errors` | apps/portal/web | src/app/i18n/portal.pt-BR.json |
diff --git a/tools/parameters/parser.mjs b/tools/parameters/parser.mjs
index fb4cb15..8b51835 100644
--- a/tools/parameters/parser.mjs
+++ b/tools/parameters/parser.mjs
@@ -19,6 +19,13 @@ const HEADERS = [
'Decisão',
'Consumidor',
];
+const NAMESPACE_HEADERS = ['Namespace', 'App', 'Catálogo', 'Decisão'];
+const NAMESPACE_PREFIXES = Object.values(TABLES).flatMap(([, prefixes]) =>

- prefixes.map((prefix) => prefix.slice(0, -1)),
  +);
  +const NAMESPACE_PATTERN = new RegExp(
- `^(?:${NAMESPACE_PREFIXES.join('|')})\\.[a-z][a-z0-9_]*$`,
  +);
  const REFS = /\b(?:H\.\d+|OD-[A-Z0-9-]+|DT-[A-Z0-9-]+)\b/g;
  const COMPACT_RANGE =
  /\b(H\.\d+|(?:OD|DT)-[A-Z0-9-]+)\s*(?:…|\.\.\.)\s*(H\.\d+|(?:OD|DT)-[A-Z0-9-]+|[A-Z]+-?\d+|\d+)\b/g;
  @@ -174,6 +181,88 @@ function headingRows(lines, source) {
  return headings;
  }

+function parseNamespaceTable(lines, source, entries) {

- const headingIndex = lines.findIndex((line) =>
- /^##\s+Namespaces i18n\b/.test(line),
- );
- if (headingIndex < 0) return [];
- const nextHeading = lines.findIndex(
- (line, lineIndex) => lineIndex > headingIndex && /^##\s+/.test(line),
- );
- const end = nextHeading < 0 ? lines.length : nextHeading;
- let row = headingIndex + 1;
- while (row < end && !lines[row].trim().startsWith('|')) row += 1;
- if (row >= end)
- throw new Error(`${source}:${headingIndex + 1}: namespace table missing`);
- const header = cells(lines[row]);
- if (
- header.length !== NAMESPACE_HEADERS.length ||
- header.some((value, i) => value !== NAMESPACE_HEADERS[i])
- )
- throw new Error(
-      `${source}:${row + 1}: namespace header must be ${NAMESPACE_HEADERS.join('|')}`,
- );
- const separator = cells(lines[row + 1] ?? '');
- if (
- separator.length !== NAMESPACE_HEADERS.length ||
- separator.some((value) => !/^:?-{3,}:?$/.test(value))
- )
- throw new Error(
-      `${source}:${row + 2}: namespace separator must have four cells`,
- );
- row += 2;
- const namespaces = [];
- const seenNamespaces = new Set();
- while (row < lines.length && lines[row].trim().startsWith('|')) {
- const values = cells(lines[row]);
- if (
-      values.length !== NAMESPACE_HEADERS.length ||
-      values.some((value) => value === '')
- )
-      throw new Error(`${source}:${row + 1}: malformed or empty namespace row`);
- const [namespace, app, catalogue, decision] = values;
- if (!NAMESPACE_PATTERN.test(namespace))
-      throw new Error(
-        `${source}:${row + 1}: invalid i18n namespace ${namespace}`,
-      );
- if (seenNamespaces.has(namespace))
-      throw new Error(
-        `${source}:${row + 1}: duplicate i18n namespace ${namespace}`,
-      );
- seenNamespaces.add(namespace);
- const tokens = decision.match(REFS) ?? [];
- const selected =
-      tokens.filter((token) => /^H\./.test(token)).at(-1) ??
-      tokens.find((token) => /^(?:OD|DT)-/.test(token));
- if (!selected)
-      throw new Error(
-        `${source}:${row + 1}: decision reference missing for namespace ${namespace}`,
-      );
- namespaces.push({
-      namespace,
-      app,
-      catalogue,
-      decision_ref: selected,
-      decision_tokens: tokens,
-      line: row + 1,
- });
- row += 1;
- }
- if (lines.slice(row, end).some((line) => line.trim().startsWith('|')))
- throw new Error(
-      `${source}:${row + 1}: multiple tables for Namespaces i18n`,
- );
- for (const item of namespaces) {
- const prefix = `${item.namespace}.`;
- const colliding = entries.find((entry) => entry.key.startsWith(prefix));
- if (colliding)
-      throw new Error(
-        `${source}:${item.line}: i18n namespace ${item.namespace} collides with parameter key ${colliding.key} at ${source}:${colliding.line}`,
-      );
- }
- return namespaces;
  +}
-

export async function parseCatalogue(source) {
const bytes = await readFile(source);
const text = bytes.toString('utf8');
@@ -267,6 +356,7 @@ export async function parseCatalogue(source) {
if (lines.slice(row, end).some((line) => line.trim().startsWith('|')))
throw new Error(`${source}:${row + 1}: multiple tables for ${heading}`);
}

- const i18nNamespaces = parseNamespaceTable(lines, source, entries);
  const resolvedDecisions = await decisionReferences();
  for (const entry of entries)
  for (const token of entry.decision_tokens) {
  @@ -275,9 +365,17 @@ export async function parseCatalogue(source) {
  `${source}:${entry.line}: unresolved decision ${token}`,
  );
  }
- for (const namespace of i18nNamespaces)
- for (const token of namespace.decision_tokens) {
-      if (!resolvedDecisions.has(token))
-        throw new Error(
-          `${source}:${namespace.line}: unresolved decision ${token}`,
-        );
- }
  return {
  source,
  sourceHash: createHash('sha256').update(bytes).digest('hex'),
  entries,
- i18nNamespaces,
  };
  }
  diff --git a/tools/parameters/tests/verify-usage.test.mjs b/tools/parameters/tests/verify-usage.test.mjs
  new file mode 100644
  index 0000000..0cf81a8
  --- /dev/null
  +++ b/tools/parameters/tests/verify-usage.test.mjs
  @@ -0,0 +1,230 @@
  +// R-0014 CTG-0001 / TASK-0002 (Inspector). Fixa o contrato de `--catalogue <path>` para
  +// `verify.mjs --check-usage` (M10 de work/rounds/R-0014/plan.md): literal com ≥ 2 pontos cujos
  +// dois primeiros segmentos formem um namespace declarado na tabela "## Namespaces i18n
  +// (allowlist do verificador)" do catálogo não é candidato a `unknown parameter literal`.
  +// `--catalogue` ainda não existe em tools/parameters/verify.mjs (TASK-0003 a implementa com
  +// esse nome exato) — até lá, os casos 1–5 e 8 abaixo falham porque o verificador continua
  +// resolvendo sempre docs/framework/arch/parameter-catalogue.md e mantém a exclusão de
  +// diretório de R-0009 (A7). Os casos 6 e 7 exercitam comportamento já existente hoje.
  +import assert from 'node:assert/strict';
  +import { execFile } from 'node:child_process';
  +import { mkdtemp, rm, writeFile } from 'node:fs/promises';
  +import { dirname, join, resolve } from 'node:path';
  +import { fileURLToPath } from 'node:url';
  +import { promisify } from 'node:util';
  +import test from 'node:test';
-

+const exec = promisify(execFile);
+const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
+const verifier = join(root, 'tools/parameters/verify.mjs');
+const fixtures = join(root, 'tools/parameters/fixtures');
+const catalogueAllow = join(fixtures, 'namespaces-allow.txt');
+const catalogueCollision = join(fixtures, 'namespaces-collision.txt');
+const catalogueBadPrefix = join(fixtures, 'namespaces-bad-prefix.txt');
+const catalogueMalformed = join(fixtures, 'namespaces-malformed.txt');
+const catalogueNoNamespaces = join(fixtures, 'minimal-catalogue.txt');
+const realCatalogue = join(root, 'docs/framework/arch/parameter-catalogue.md');
+const realUsageTarget = join(root, 'packages/api-clients/src/generated'); +
+async function run(args) {

- try {
- const result = await exec(process.execPath, [verifier, ...args], {
-      cwd: root,
-      env: { ...process.env, NODE_ENV: 'test' },
- });
- return { status: 0, stdout: result.stdout, stderr: result.stderr };
- } catch (error) {
- return {
-      status: typeof error.code === 'number' ? error.code : 1,
-      stdout: error.stdout ?? '',
-      stderr: error.stderr ?? String(error),
- };
- }
  +}
-

+async function temporarySourceFile(content) {

- const directory = await mkdtemp('/tmp/detran-parameter-usage-');
- const source = join(directory, 'candidate.ts');
- await writeFile(source, content, 'utf8');
- return { directory, source };
  +}
-

+test('dado allowlist com portal.errors quando arquivo usa portal.errors.not_found então exit 0 sem literal desconhecido', async () => {

- const temporary = await temporarySourceFile(
- "const key = 'portal.errors.not_found';\n",
- );
- try {
- const result = await run([
-      '--check-usage',
-      '--source',
-      temporary.source,
-      '--catalogue',
-      catalogueAllow,
- ]);
- assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
- assert.doesNotMatch(
-      `${result.stdout}\n${result.stderr}`,
-      /unknown parameter literal/,
- );
- } finally {
- await rm(temporary.directory, { recursive: true, force: true });
- }
  +});
-

+test('dado allowlist com portal.errors quando arquivo usa portal.foo.bar então exit 1 com literal desconhecido', async () => {

- const temporary = await temporarySourceFile(
- "const key = 'portal.foo.bar';\n",
- );
- try {
- const result = await run([
-      '--check-usage',
-      '--source',
-      temporary.source,
-      '--catalogue',
-      catalogueAllow,
- ]);
- assert.notEqual(result.status, 0);
- assert.match(
-      `${result.stdout}\n${result.stderr}`,
-      /unknown parameter literal portal\.foo\.bar/,
- );
- } finally {
- await rm(temporary.directory, { recursive: true, force: true });
- }
  +});
-

+test('dado namespace rait.timer em colisão com a chave rait.timer.T-DEF quando verificar então exit ≠ 0 citando a colisão', async () => {

- const temporary = await temporarySourceFile(
- "const key = 'rait.timer.forced';\n",
- );
- try {
- const result = await run([
-      '--check-usage',
-      '--source',
-      temporary.source,
-      '--catalogue',
-      catalogueCollision,
- ]);
- assert.notEqual(result.status, 0);
- assert.match(`${result.stdout}\n${result.stderr}`, /rait\.timer/);
- } finally {
- await rm(temporary.directory, { recursive: true, force: true });
- }
  +});
-

+test('dado namespace foo.bar fora dos prefixos de superfície quando verificar então exit ≠ 0 com diagnóstico', async () => {

- const temporary = await temporarySourceFile("const key = 'foo.bar.baz';\n");
- try {
- const result = await run([
-      '--check-usage',
-      '--source',
-      temporary.source,
-      '--catalogue',
-      catalogueBadPrefix,
- ]);
- assert.notEqual(result.status, 0);
- assert.match(`${result.stdout}\n${result.stderr}`, /foo\.bar/);
- } finally {
- await rm(temporary.directory, { recursive: true, force: true });
- }
  +});
-

+test('dado tabela de namespaces malformada (três colunas) quando verificar então exit ≠ 0 com arquivo e linha', async () => {

- const temporary = await temporarySourceFile(
- "const key = 'portal.errors.not_found';\n",
- );
- try {
- const result = await run([
-      '--check-usage',
-      '--source',
-      temporary.source,
-      '--catalogue',
-      catalogueMalformed,
- ]);
- assert.notEqual(result.status, 0);
- const diagnostic = `${result.stdout}\n${result.stderr}`;
- assert.match(diagnostic, /namespaces-malformed\.txt/);
- assert.match(diagnostic, /:\d+/);
- } finally {
- await rm(temporary.directory, { recursive: true, force: true });
- }
  +});
-

+test('dado catálogo sem seção de namespaces quando arquivo usa portal.errors.not_found então comportamento atual (candidato, exit 1)', async () => {

- const temporary = await temporarySourceFile(
- "const key = 'portal.errors.not_found';\n",
- );
- try {
- const result = await run([
-      '--check-usage',
-      '--source',
-      temporary.source,
-      '--catalogue',
-      catalogueNoNamespaces,
- ]);
- assert.equal(result.status, 1);
- assert.match(
-      `${result.stdout}\n${result.stderr}`,
-      /unknown parameter literal portal\.errors\.not_found/,
- );
- } finally {
- await rm(temporary.directory, { recursive: true, force: true });
- }
  +});
-

+test('dado literal de um ponto (portal.complaint) quando verificar então nunca é candidato, com ou sem allowlist', async () => {

- const temporary = await temporarySourceFile(
- "const key = 'portal.complaint';\n",
- );
- try {
- const withAllowlist = await run([
-      '--check-usage',
-      '--source',
-      temporary.source,
-      '--catalogue',
-      catalogueAllow,
- ]);
- assert.equal(
-      withAllowlist.status,
-      0,
-      `${withAllowlist.stdout}\n${withAllowlist.stderr}`,
- );
- assert.doesNotMatch(
-      `${withAllowlist.stdout}\n${withAllowlist.stderr}`,
-      /portal\.complaint/,
- );
- const withoutAllowlist = await run([
-      '--check-usage',
-      '--source',
-      temporary.source,
-      '--catalogue',
-      catalogueNoNamespaces,
- ]);
- assert.equal(
-      withoutAllowlist.status,
-      0,
-      `${withoutAllowlist.stdout}\n${withoutAllowlist.stderr}`,
- );
- assert.doesNotMatch(
-      `${withoutAllowlist.stdout}\n${withoutAllowlist.stderr}`,
-      /portal\.complaint/,
- );
- } finally {
- await rm(temporary.directory, { recursive: true, force: true });
- }
  +});
-

+test('dado catálogo real quando a varredura cobre packages/api-clients/src/generated então exit 0 (exclusão de diretório saiu)', async () => {

- const result = await run([
- '--check-usage',
- '--source',
- realUsageTarget,
- '--catalogue',
- realCatalogue,
- ]);
- assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
- assert.doesNotMatch(
- `${result.stdout}\n${result.stderr}`,
- /unknown parameter literal/,
- );
  +});
  diff --git a/tools/parameters/verify.mjs b/tools/parameters/verify.mjs
  index 88e91ff..b438267 100644
  --- a/tools/parameters/verify.mjs
  +++ b/tools/parameters/verify.mjs
  @@ -6,18 +6,30 @@ import { tmpdir } from 'node:os';
  import { spawnSync } from 'node:child_process';
  import { parseCatalogue } from './parser.mjs';
  const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
  +const realCataloguePath = join(
- root,
- 'docs/framework/arch/parameter-catalogue.md',
  +);
  const sourceOption = process.argv.includes('--source')
  ? process.argv[process.argv.indexOf('--source') + 1]
  : undefined;
  +const catalogueOption = process.argv.includes('--catalogue')
- ? process.argv[process.argv.indexOf('--catalogue') + 1]
- : undefined;
  const generatedRootOption = process.argv.includes('--generated-root')
  ? process.argv[process.argv.indexOf('--generated-root') + 1]
  : undefined;
  -const sourceArg =

* sourceOption ?? join(root, 'docs/framework/arch/parameter-catalogue.md');
  -const modelSource = process.argv.includes('--check-usage')
* ? join(root, 'docs/framework/arch/parameter-catalogue.md')
* : sourceArg;
  -const model = await parseCatalogue(modelSource).catch((error) => {
  +// `--source` keeps its two historical meanings: the catalogue to generate
  +// from for `--check-generated`, and the file/directory to scan for
  +// `--check-usage`. `--catalogue` is the single, explicit way to pick the
  +// catalogue the model is built from for every mode; it defaults to the real
  +// catalogue for `--check-usage` (where `--source` means the scan target) and
  +// to `--source` (or the real catalogue) otherwise.
  +const sourceArg = sourceOption ?? realCataloguePath;
  +const catalogueArg =

- catalogueOption ??
- (process.argv.includes('--check-usage') ? realCataloguePath : sourceArg);
  +const model = await parseCatalogue(catalogueArg).catch((error) => {
  console.error(error.message);
  process.exit(1);
  });
  @@ -113,7 +125,7 @@ if (process.argv.includes('--check-generated')) {
  [
  join(root, 'tools/parameters/generate-seed.mjs'),
  '--source',

*      sourceArg,

-      catalogueArg,
       '--out-dir',
       temp,
  ],
  @@ -152,6 +164,9 @@ if (process.argv.includes('--check-generated')) {
  if (process.argv.includes('--check-usage')) {
  const target = resolve(sourceOption ?? root);
  const known = new Set(model.entries.map((entry) => entry.key));
- const i18nNamespaces = new Set(
- model.i18nNamespaces.map((namespace) => namespace.namespace),
- );
  const prefixes = [
  'rait',
  'collection',
  @@ -165,19 +180,18 @@ if (process.argv.includes('--check-usage')) {
  'dashboard',
  ];
  let usageErrors = 0;

* // R-0009 (plan.md A7): the OpenAPI clients under packages/api-clients are
* // generated from docs/framework/contracts and carry citizen-facing i18n
* // label keys (`portal.requests.nextAction.<STATE>`) as literal types; they
* // cannot read a parameter, so they are not usage candidates. Every other
* // generated artifact stays in the scan.
* const excludedDirectories = [
* join(root, 'packages/api-clients/src/generated'),
* ];

- // M10 (work/rounds/R-0014/plan.md; OD-P46): the only isolation for a
- // literal that is not a known parameter key is the i18n namespace
- // allowlist in §Namespaces i18n of parameter-catalogue.md — never a
- // directory exclusion. The scan covers every directory of the repository;
- // only tests, dist and node_modules are ignored.
- function isI18nLiteral(parts) {
- return parts.length >= 3 && i18nNamespaces.has(`${parts[0]}.${parts[1]}`);
- }
  async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
  if (['tests', 'dist', 'node_modules'].includes(item.name)) continue;
  const path = join(dir, item.name);

*      if (excludedDirectories.includes(path)) continue;
       if (item.isDirectory()) await walk(path);
       else if (/\.(?:ts|js|mjs|tsx|jsx)$/.test(item.name)) {
         const text = await readFile(path, 'utf8');

@@ -187,6 +201,7 @@ if (process.argv.includes('--check-usage')) {
const literal = match[1];
const parts = literal.split('.');
if (known.has(literal)) continue;

-          if (isI18nLiteral(parts)) continue;
           if (parts.length >= 3 && prefixes.includes(parts[0])) {
             usageErrors += 1;
             console.error(`${path}: unknown parameter literal ${literal}`);

@@ -203,6 +218,7 @@ if (process.argv.includes('--check-usage')) {
const parts = literal.split('.');
if (
!known.has(literal) &&

-        !isI18nLiteral(parts) &&
         parts.length >= 3 &&
         prefixes.includes(parts[0])
       ) {

@@ -215,5 +231,5 @@ if (process.argv.includes('--check-usage')) {
}
if (!process.exitCode)
console.log(

- `verify:parameter-catalogue: OK (${model.entries.length} entries, ${model.entries.filter((entry) => entry.value_type === 'F').length} flags, 0 errors)`,

* `verify:parameter-catalogue: OK (${model.entries.length} entries, ${model.entries.filter((entry) => entry.value_type === 'F').length} flags, ${model.i18nNamespaces.length} i18n namespaces, 0 errors)`,
  );

```

```
