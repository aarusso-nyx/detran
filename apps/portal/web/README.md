# apps/portal/web — Portal do cidadão (PWA)

Primeiro app do monorepo (R-0014, `work/rounds/R-0014/plan.md` M1–M9, M13, M14): fixa o
padrão de scaffold que os demais frontends copiam sem variantes locais — **R-0012
(`apps/rait/web`) copia esta estrutura**, trocando `portal.*` por `rait.*`.

Especificação: `docs/framework/arch/portal-frontends.md`; contrato de rotas
`portal-route-contract.md`; erros `portal-error-catalog.md`; pacote de construção
`portal-build-pack.md`; kit `detran-ui-guide.md`.

## Scripts (M1)

| Script      | Comando                                                                   |
| ----------- | ------------------------------------------------------------------------- |
| `build`     | `ng build` (configuração `production` é a padrão; sem rede)               |
| `test`      | `vitest run --config vitest.config.ts` (jsdom + TestBed, JIT)             |
| `lint`      | `eslint .` (flat config; angular-eslint + typescript-eslint + prettier)   |
| `typecheck` | `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit` |

Na raiz, `pnpm check` constrói `@detran/ui` antes de `pnpm typecheck` (o app tipa contra
`packages/ui/dist`) e termina com `lint`, `test` e `build` deste app (M6).

Como rodar localmente: `pnpm --filter @detran/portal-web build` gera `dist/browser/` com
`index.html`, `ngsw.json`, `ngsw-worker.js` e `manifest.webmanifest`; sirva o diretório com
qualquer servidor estático na mesma origem do backend (`/v1/portal/*`) e ajuste
`runtime-config.js`. `ng serve` (`@angular/build:dev-server`, configuração `development`)
serve sem service worker.

## Estrutura (M7; spec §9)

```text
angular.json          projeto portal-web, builder @angular/build:application, assets de public/,
                      serviceWorker: ngsw-config.json na configuração production (padrão)
tsconfig.json         base (maestro): strict, ES2023, ESNext/bundler, strictTemplates
tsconfig.app.json     src/main.ts; exclui specs, src/testing e o helper de a11y
tsconfig.spec.json    specs + src/testing + test-setup; types vitest/globals + node
vitest.config.ts      jsdom, globals, src/**/*.spec.ts, setupFiles src/test-setup.ts (maestro)
eslint.config.js      M5
ngsw-config.json      M14: app prefetch (assetGroups); cache offline de CNH-e/CRLV-e no CTG-0003
public/               manifest.webmanifest, runtime-config.js, icons/ (SVG neutros, white label)
src/index.html        lang pt-BR, <script src="runtime-config.js">, manifesto, <noscript>
src/main.ts           bootstrapApplication + provideDetranAuthenticatedApp + service worker
src/styles.css        importa @detran/ui/styles
src/app/
  app.component.ts        raiz: CitizenShell + marca + aria-live de navegação
  app.routes.ts           PORTAL_ROUTES (core eager + 13 módulos lazy + **)
  app.route-manifest.ts   PORTAL_ROUTE_MANIFEST (38 rotas — fonte única das rotas e dos testes)
  core/                   citizen-shell, brand.service, session.facade, auth-flow.service,
                          entitlement.facade, service-catalog.facade, resume.service,
                          error-boundary, offline-document.store, runtime-config,
                          title.strategy, i18n-fallback, manifest-routes, guards/, pages/
  features/<module>/      <module>.routes.ts (lazy; caminhos completos derivados do manifesto)
  shared/                 placeholder-page.component (rotas ainda não construídas)
  data/                   portal.client.ts (wrapper tipado por @detran/api-clients)
  i18n/                   portal.pt-BR.json (catálogo plano, chave = caminho pontuado)
  a11y/                   axe.spec-helper.ts (Inspector)
src/testing/              stubs e harness dos specs (Inspector)
```

## O que os próximos apps copiam (M1–M6)

- `package.json`: `private`, `type: module`, `engines.node >=24 <25`, os quatro scripts acima,
  versões de M2 (Angular/CLI/build 22.1.6, vitest 4, jsdom, axe-core, eslint 10, angular-eslint,
  typescript-eslint, eslint-config-prettier, `@detran/ui` e `@detran/api-clients` `workspace:*`,
  `@stynx-nyx/*` 1.3.1). Nenhuma outra dependência sem adenda do maestro.
- `angular.json`, `tsconfig*.json`, `vitest.config.ts`, `src/test-setup.ts`, `eslint.config.js`
  como estão aqui (só o nome do projeto e o prefixo de seletor mudam).
- Componentes standalone, `OnPush`, signals, `inject()`; `template`/`styles` inline (JIT nos
  testes, AOT no build); primitivos do kit, nunca reimplementados.
- Todo texto visível pelo `stynxTranslate` com chave `<surface>.<namespace>.…` de um catálogo
  plano; namespaces declarados na allowlist do `docs/framework/arch/parameter-catalogue.md`
  §Namespaces i18n (`verify:parameter-catalogue --check-usage`).
- Bootstrap só por `provideDetranAuthenticatedApp` (`@detran/ui`); `runtime-config.js` com
  três chaves e sem segredo; tipos de API por alias `@detran/api-clients/generated/*`
  (`paths` do tsconfig) enquanto o índice do pacote não reexporta os contratos do app.
- Rotas derivadas de um manifesto (`app.route-manifest.ts` → `core/manifest-routes.ts`): guardas
  na ordem auth → assurance → availability → entitlement; módulos lazy montados em `path: ''`
  com `canMatch` pelo primeiro segmento; páginas placeholder (`DetranErrorStateComponent`
  "indisponível nesta versão", `data-screen="T-nn"`) até a tela existir.
- Providers de fallback de i18n nas rotas (`core/i18n-fallback.ts`): delegam ao serviço do
  bootstrap quando existe e só criam um serviço vazio no harness `provideRouter(ROUTES)` dos
  specs — nunca registrar `StynxI18nModule.forRoot` fora do bootstrap.

## O que é específico do Portal (M7–M9, M14)

- `CitizenShell` próprio (spec §1): marca do `BrandService` (`GET /v1/portal/brand`) ou neutra,
  navegação de 5 destinos, rodapé de 4 links (URLs da marca quando existem), skip link,
  `<main id="conteudo">`, `aria-live` para estados.
- Guardas `portalAuthGuard`, `assuranceGuard('simples' | 'avancada')`,
  `entitlementGuard(kind)`, `serviceAvailabilityGuard(serviceKey)` (M8): nunca 404, nunca
  "acesso negado" seco — sempre uma tela com motivo e caminho.
- `SessionFacade` sobre `StynxSessionService` + `GET /v1/portal/identity/me` (nível da claim
  `assurance_level`; matriz ato → nível do servidor); `ResumeService` em memória +
  `sessionStorage` (nunca `localStorage`); `ErrorBoundary` `PORTAL.<CODE>` →
  `portal.errors.<code minúsculo>`; `OfflineDocumentStore` AES-GCM com chave derivada do `sid`
  em memória (só CNH-e/CRLV-e).
- Catálogo `src/app/i18n/portal.pt-BR.json` com o mapa de tradução de estados
  (`portal.situation.*`, CTG-0002) — nesta entrega só `portal.shell`, `portal.states`,
  `portal.common`, `portal.a11y`.
- PWA: `manifest.webmanifest` neutro (white label); `ngsw-config.json` só com `assetGroups`
  (shell `prefetch`, sem `runtime-config.js`). O cache offline de CNH-e/CRLV-e é do CTG-0003
  (`OfflineDocumentStore`, validade do documento; forma do `dataGroup`, se houver, em OD-P51);
  qualquer outra rota offline mostra `portal.states.offline` sem prometer envio posterior.
