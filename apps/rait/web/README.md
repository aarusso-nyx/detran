# apps/rait/web — Console interno do RAIT

Segundo app do monorepo (R-0012, `work/rounds/R-0012/plan.md` M1–M3, M12): copia o padrão de
scaffold fixado por `apps/portal/web` (R-0014) sem variantes locais, trocando `portal.*` por
`rait.*` e sem service worker (console interno; `rait-web-frontend.md` §8: offline não suportado).

Especificação: `docs/framework/arch/rait-web-frontend.md`; pacote de construção
`rait-build-pack.md` §WP-D/E/F; erros `rait-error-catalog.md`; i18n `rait-i18n-glossary.md`;
kit `detran-ui-guide.md`; manifesto de rotas `work/rounds/R-0012/route-manifest.md`.

## Scripts (M1)

| Script      | Comando                                                                   |
| ----------- | ------------------------------------------------------------------------- |
| `build`     | `ng build` (configuração `production` é a padrão; sem rede)               |
| `test`      | `vitest run --config vitest.config.ts` (jsdom + TestBed, JIT)             |
| `lint`      | `eslint .` (flat config; angular-eslint + typescript-eslint + prettier)   |
| `typecheck` | `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit` |

Na raiz, `pnpm check` constrói `@detran/ui` antes de `pnpm typecheck` e termina com `lint`,
`test` e `build` deste app (M2).

## Estrutura (M3; spec §12)

```text
angular.json          projeto rait-web, builder @angular/build:application, assets de public/
tsconfig*.json        base strict/ES2023; app = src/main.ts; spec = specs + src/testing + test-setup
vitest.config.ts      jsdom, globals, src/**/*.spec.ts, setupFiles src/test-setup.ts, JIT transform
eslint.config.js      M5 do Portal + regras locais `rait/*` (CTG-0002c, M12)
public/runtime-config.js  tenantId, oidcAuthority, clientId (sem segredo)
src/app/
  app.routes.ts, app.route-manifest.ts   árvore da §4 derivada do manifesto (74 entradas)
  core/       shell, guardas, session facade, sse, atalhos, error boundary, role-home
  data/       api/ (clientes por módulo sobre @detran/api-clients), facades/, models/
  shared/     22 componentes de domínio da §5.2
  features/   15 módulos lazy da §2
  forms/      16 schemas zod da §9 com gate no cabeçalho (WP-E)
  i18n/rait.pt-BR.json   semente docs/framework/arch/i18n/rait.pt-BR.json + rait.shell/states/screens/…
```
