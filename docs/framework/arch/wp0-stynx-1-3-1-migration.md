---
id: ARCH-WP0-MIGRATION
title: WP-0 — roteiro de migração do workspace para STYNX 1.3.1, Angular 22 e DEVAI 1.4.5
status: draft
apps: [rait, teat, portal, dashboard, pec]
updated: 2026-09-13
---

# WP-0 — Migração do substrato (ADR-0013)

Roteiro passo a passo, só migração, sem feature. Papel: **Engineer**; revisão do Architect nos
passos 5 e 8. Um PR (`build(deps): adopt STYNX 1.3.1 / Angular 22`), ou dois se o backend e o
frontend precisarem de ajustes independentes (backend primeiro).

## 0. Fatos verificados em 2026-09-12 (registro npm privado)

| Item                                                          | Valor                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@stynx-nyx/*` `latest`                                       | **1.3.1** (todos os pacotes usados aqui existem nessa versão)                                                                                                                                                                                               |
| Peer Angular dos pacotes web                                  | `>=22.0.0 <23`; o workspace STYNX compila com `@angular/*` **22.1.6**                                                                                                                                                                                       |
| `ng-packagr` no workspace STYNX                               | **22.1.1**; `typescript` **6.0.3**; `vitest` **^4**; `jsdom` **^29**                                                                                                                                                                                        |
| Peer NestJS dos pacotes backend                               | `@nestjs/common                                                                                                                                                                                                                                             | core ^11.1.19`(aqui:`^11.1.28`) — sem salto de major |
| DEVAI pinado pelo workspace STYNX 1.3.1                       | `@aarusso-nyx/devai` **1.4.5** — igual ao daqui; nada muda                                                                                                                                                                                                  |
| Símbolos importados pelo repositório                          | todos presentes nas typings 1.3.1 (lista em ADR-0013)                                                                                                                                                                                                       |
| Mudanças adopter-visíveis (STYNX `packages-web/MIGRATING.md`) | APF/`ng-packagr` e subpath `./testing`; catálogos i18n ICU por pacote (`ui.*`, `auth.*`, `tenancy.*`, `i18n.*`) a **mesclar** no catálogo do app; `provideStynxDefaults` como entrada preferida; estado por signals (adapters observáveis são transitórios) |
| Angular 22 — mudanças específicas                             | **não verificadas nesta rodada**: consultar `https://angular.dev/update-guide` (21→22) no passo 4 e registrar aqui                                                                                                                                          |

## 1. Pré-condições

- `NODE_AUTH_TOKEN="$(gh auth token)"` exportado; `pnpm 9.15`, Node 24.
- Branch `build/stynx-1-3-1`; `pnpm check` verde em `main` antes de começar (linha de base).
- Postgres local para `backend:test:integration`/`e2e`.

## 2. Backend (`@stynx-nyx/*` 1.1.1 → 1.3.1)

1. Substituir todas as ocorrências de `"@stynx-nyx/<pkg>": "1.1.1"` por `"1.3.1"` em
   `backend/app/package.json`, `backend/domains/shared/package.json`, todos os
   `backend/domains/*/*/package.json` e `packages/senatran-adapter/package.json`
   (o blueprint gera `package.json`: atualizar também `tools/blueprints/generate.mjs` onde a
   versão é emitida e rodar `pnpm blueprints:generate` para que `blueprints:check` continue verde).
2. `pnpm install` (atualiza `pnpm-lock.yaml`); revisar o diff do lock: só `@stynx-nyx/*` e
   dependências transitivas delas devem mudar.
3. `pnpm typecheck`; corrigir apenas erros de tipo vindos do STYNX (registrar cada um na §7).
4. `pnpm backend:test:unit && pnpm backend:test:integration && pnpm backend:test:e2e`;
   `pnpm senatran-adapter:test:ci`; `pnpm backend:rls-smoke`.
5. **Revisão do Architect**: `StynxErrorFilter` (formato do envelope, §1 do catálogo de erros),
   `getPrincipalFromRequest`/`Principal.permissions`, `Database.tx` e `IntegrationContext` —
   confirmar comportamento com os testes existentes; se algo mudou, ADR curto.

## 3. Kit `@detran/ui` (Angular 21 → 22)

1. `packages/ui/package.json`: `@stynx-nyx/angular*` → `1.3.1`; `peerDependencies` de
   `@angular/{common,core,router}` → `">=22.0.0 <23"`; `devDependencies` `@angular/*` → `22.1.6`,
   `ng-packagr` → `22.1.1`, `typescript` → `6.0.3` (alinhado ao STYNX; hoje `5.9.3`), `vitest`
   `^4`, `jsdom` `^29`.
2. `pnpm install`; `pnpm --filter @detran/ui build` (ng-packagr) e `test`.
3. Se `ng-packagr` 22 exigir `tsconfig` novo (`target`, `useDefineForClassFields`), ajustar
   `packages/ui/tsconfig*.json` e registrar na §7.
4. Verificar que `provideDetranAuthenticatedApp` continua compondo `provideStynxDefaults` +
   `provideStynxAuth` + `StynxI18nModule.forRoot`; **mesclar os catálogos i18n dos pacotes STYNX**
   (`ui.*`, `auth.*`, `tenancy.*`, `i18n.*`) no `loadCatalog` do kit, por cima do fallback pt-BR,
   como o `MIGRATING.md` FE-D orienta.
5. Consultar o guia oficial de atualização Angular 21→22 e aplicar as migrações automáticas
   (`ng update @angular/core@22 @angular/cli@22` em um app de referência ou manualmente no kit);
   anotar cada mudança aplicada na §7. Pontos a checar explicitamente: detecção de mudanças
   (zone × zoneless: o workspace STYNX 1.3.1 não declara `zone.js` em nenhum pacote web —
   confirmar se o app deve bootar zoneless), `@Input()` → `input()` (opcional, o kit ainda usa
   `@Input()`), APIs de controle de fluxo (`@for`/`@if` já usadas), `provideRouter`.

## 4. Documentação e pins de texto

- `AGENTS.md`, `README.md`, `CLAUDE.md`, `docs/start/index.md`, `packages/ui/README.md`,
  `apps/rait/web/README.md`: remover a ressalva "pins em 1.1.1 até WP-0" e "Angular 21".
- ADR-0013 §Consequences: acrescentar "migrado em <data>, PR #n".

## 5. Verificação final

```bash
pnpm check
pnpm backend:test:ci && pnpm senatran-adapter:test:ci
pnpm --filter @detran/ui build && pnpm --filter @detran/ui test
pnpm exec devai doctor --repo-root . --format human
pnpm exec devai evidence record …   # conforme AGENTS.md
```

## 6. Critérios de pronto

- Nenhum `1.1.1` restante (`grep -rn '"1.1.1"' --include=package.json`).
- `pnpm-lock.yaml` sem pacotes duplicados de `@stynx-nyx/*`.
- Nenhuma mudança funcional fora de tipos/adaptações listadas na §7.
- CI verde nos jobs `foundation`, `backend-kernel`, `senatran-mock*`.

## 7. Registro de ajustes encontrados (preencher durante a execução)

| Pacote                     | Sintoma                                                                                                                                                                                              | Ajuste                                                                                                                                   | Fonte (changelog/guia)                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Angular 22 (todos os apps) | componentes sem `changeDetection` passam a `OnPush` por padrão                                                                                                                                       | `ng update` insere `ChangeDetectionStrategy.Eager` nos componentes existentes; código novo adota signals                                 | angular.dev/update-guide; angular.dev/events/v22 (pesquisa 2026-09-13) |
| Angular 22 (router)        | `paramsInheritanceStrategy` muda de `emptyOnly` para `always` (filhos herdam params/data do pai)                                                                                                     | revisar rotas com nomes de parâmetro repetidos (`:id` em caso/sessão); ou `withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' })` | idem — sem migração automática                                         |
| Angular 22 (toolchain)     | exige TypeScript ≥ 6.0 e Node ≥ 22 (Node 20 sem suporte)                                                                                                                                             | workspace já em TS 6.0.3; fixar `engines.node >= 22` e a imagem de CI                                                                    | idem                                                                   |
| Angular 22 (APIs)          | `ComponentFactoryResolver`/`ComponentFactory` removidos; bindings duplicados de input viram erro de compilação; `data-*` binda como atributo; transfer cache HTTP exclui requisições com credenciais | buscar usos no kit `@detran/ui` e nos protótipos portados; ajustar                                                                       | idem                                                                   |
| Angular 22 (novidades)     | Signal Forms, `resource()`/`httpResource()` estáveis; componentes selectorless                                                                                                                       | opcional — não adotar no WP-0                                                                                                            | idem                                                                   |

## 8. Rollback

Reverter o PR; nenhuma migração de banco está envolvida. O `pnpm-lock.yaml` anterior volta com o
revert.
