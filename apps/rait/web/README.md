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

## Prévia (`preview`)

Prévia executável, honesta e baseada em fixtures do console (R-0033, campanha C-0003 fase P),
para revisão UI/UX sem backend. Contrato normativo:
[`frontend-preview-mode.md`](../../../docs/framework/arch/frontend-preview-mode.md); roteiro da
jornada JW-01 (analista) em
[`work/rounds/R-0033/preview/rait-web/roteiro-jw-01.md`](../../../work/rounds/R-0033/preview/rait-web/roteiro-jw-01.md).

**Dados fictícios; nenhuma chamada a `/v1`.** Tudo vem de
`docs/framework/arch/fixtures/rait-fixtures.json` e `calendar-2026.json` (servidos em
`assets/preview/` pelo link `src/app/preview/fixtures`); o interceptor de prévia rejeita toda
requisição que não seja `GET assets/**`. Campo sem fonte aparece vazio ou como `source_pending`,
nunca inventado. Nenhum comando é executado: a página mostra "Indisponível nesta versão." e a faixa
mostra "Não funcional na prévia: <comando> não foi executado." — nunca sucesso simulado.

A entrada é `src/main.preview.ts` (módulo `src/app/preview/**`); os bundles `production` e
`development` não contêm a prévia.

### Servir e construir

```bash
# URL local (sem backend), em http://127.0.0.1:4200
pnpm --filter @detran/rait-web exec ng serve --configuration preview

# artefato estático em apps/rait/web/dist/preview/ (index.html + assets/preview/*.json)
pnpm --filter @detran/rait-web exec ng build --configuration preview
```

O build `production` (`pnpm --filter @detran/rait-web build`, saída `dist/`) apaga
`dist/preview/`; quem precisa do artefato depois dele (inclusive depois de `pnpm check`) reconstrói a
prévia (ordem D-12 do contrato).

### Marca, estado e papel

- Toda página tem a faixa fixa **"PRÉVIA — DADOS FICTÍCIOS"**
  (`[data-detran-preview-mark="DETRAN_PREVIEW_MARK"]`). Gate: a string `DETRAN_PREVIEW_MARK`
  existe em `dist/preview/` e não existe em `dist/browser/`.
- `pv_estado` — estado representativo de todas as leituras da página: `loaded` (padrão), `empty`,
  `loading`, `error` (500 `RAIT.INTERNAL`) ou `forbidden` (403 `RAIT.FORBIDDEN_ACTION`).
- `pv_papel` — papel da sessão sintética, um dos 13 de `RAIT_ALL_ROLES` (padrão `rait-analyst`).
  As guardas do app continuam ativas: rota fora do papel termina em `/sem-permissao?de=<url>`.
- Os dois parâmetros também são trocados pelos seletores "Estado da tela" e "Papel da sessão" da
  faixa. Exemplo:
  `/casos/00000000-0000-7000-8000-000010000007/minuta?pv_papel=rait-analyst&pv_estado=empty`.

### Capturas e acessibilidade (a partir da raiz do repositório)

```bash
pnpm --filter @detran/rait-web exec ng build --configuration preview
node work/rounds/R-0033/preview/rait-web/capture.mjs      # PNG 360/768/1280 × estados × telas
node work/rounds/R-0033/preview/rait-web/check.mjs captures
node work/rounds/R-0033/preview/rait-web/axe.mjs          # axe-core, 0 serious/critical
node work/rounds/R-0033/preview/rait-web/check.mjs axe
node work/rounds/R-0033/preview/rait-web/smoke.mjs        # ng serve --configuration preview sobe
```

Os scripts usam `playwright-core` com o Google Chrome instalado (`channel: 'chrome'`, sem download)
e servem `dist/preview/` num servidor estático embutido (`PREVIEW_BASE_URL` aponta para um
`ng serve` já em execução). Saídas em `work/rounds/R-0033/preview/rait-web/captures/`
(`*.png` e `axe-report.json`); detalhes em `work/rounds/R-0033/preview/rait-web/README.md`.
