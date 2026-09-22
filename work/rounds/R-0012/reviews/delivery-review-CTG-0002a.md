# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `rait-web` (rodada `R-0012`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-web`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md` — apenas a seção do WP `WP-F` e o "mapa entregável → definições"
4. `work/rounds/R-0012/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0012/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0012/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0012",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0012/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Primeiro ciclo — exaustivo. Grupo acoplado CTG-0002a (WP-F: núcleo de `apps/rait/web`).**
Tríade: Architect TASK-0001 (`work/rounds/R-0012/contracts/CTG-0002a.md`, 66 critérios, +
`route-manifest.md`) → Inspector TASK-0005 (9 fixtures em `src/testing/`, 14 specs, 1807 `it`,
`tools/parameters/tests/allowlist-rait.test.mjs`; 3 iterações: entrega, A5 skip-link, A7
reconciliação) → Engineer TASK-0006 (Opus; manifesto, árvore das 74 rotas com placeholders, 5
guardas, session facade, shell, título, busca, atalhos, SSE com polling, error boundary/banner,
páginas do núcleo, catálogo i18n de 628 chaves = 349 da semente + 30 do contrato §9 + 238 das fichas

- 11 títulos; 14 linhas `rait.*` na allowlist + `pnpm parameters:generate`). Scaffold de
  configuração e `pnpm-lock.yaml`: checkpoint do maestro (commit `chore(rait-web): scaffold`, já no
  branch). Adendas do Architect/maestro que valem como base de julgamento: `plan.md` A1…A7 (A7 = 8
  reconciliações contrato × specs × Angular 22 — NG04014 proíbe `redirectTo` + `canMatch`, etc.).
  Relatórios: `work/rounds/R-0012/reports/TASK-0005.md`, `TASK-0006.md`.

Gates rodados pelo maestro sobre a árvore final: `pnpm --filter @detran/rait-web typecheck|lint|test|build`
→ verdes (Tests 1807 passed (1807); bundle sem warnings de rota); `pnpm verify:parameter-catalogue`
→ `OK (89 entries, 18 flags, 41 i18n namespaces, 0 errors)`; `pnpm parameters:test` → 41/41;
`pnpm format:check` → OK; `pnpm check` completo em execução (resultado anexado no ciclo 2 se
necessário; o único passo que falhava — `parameters:test` — está verde).

Leia na worktree (não anexado inline): todos os arquivos de `apps/rait/web/src/` (lista abaixo),
`tools/parameters/tests/allowlist-rait.test.mjs`, a tabela §Namespaces i18n de
`docs/framework/arch/parameter-catalogue.md` (diff abaixo), `work/rounds/R-0012/contracts/CTG-0002a.md`
§2–§9 e §11. Pontos a julgar com atenção: rubrica 5 (textos pt-BR propostos = contrato §9 e
fichas; OD-R12-008), 7 (specs só ajustados por adenda numerada; nenhum `skip`; gerados só por
`parameters:generate`), 8 (A1: nenhum literal de namespace de token; tokens dos contratos gerados),
13 (matriz 72 rotas × 13 papéis: presença, ausência e anônimo), fronteira (§13 do contrato: nada de
clientes/facades/páginas reais nesta CTG).

Arquivos de `apps/rait/web/src`:

```text
apps/rait/web/src/app/app.component.ts
apps/rait/web/src/app/app.guards-matrix.absence.spec.ts
apps/rait/web/src/app/app.guards-matrix.anonymous.spec.ts
apps/rait/web/src/app/app.guards-matrix.presence.spec.ts
apps/rait/web/src/app/app.route-manifest.spec.ts
apps/rait/web/src/app/app.route-manifest.ts
apps/rait/web/src/app/app.routes.spec.ts
apps/rait/web/src/app/app.routes.ts
apps/rait/web/src/app/app.scaffold.spec.ts
apps/rait/web/src/app/core/error-banner.component.ts
apps/rait/web/src/app/core/error-boundary.spec.ts
apps/rait/web/src/app/core/error-boundary.ts
apps/rait/web/src/app/core/error-codes.ts
apps/rait/web/src/app/core/guards.spec.ts
apps/rait/web/src/app/core/guards/auth.guard.ts
apps/rait/web/src/app/core/guards/case-access.guard.ts
apps/rait/web/src/app/core/guards/group-redirect.guard.ts
apps/rait/web/src/app/core/guards/index.ts
apps/rait/web/src/app/core/guards/role-home.guard.ts
apps/rait/web/src/app/core/guards/role.guard.ts
apps/rait/web/src/app/core/i18n-fallback.ts
apps/rait/web/src/app/core/i18n-token-key.ts
apps/rait/web/src/app/core/manifest-routes.ts
apps/rait/web/src/app/core/pages/auth-callback.page.ts
apps/rait/web/src/app/core/pages/core-pages.spec.ts
apps/rait/web/src/app/core/pages/forbidden.page.ts
apps/rait/web/src/app/core/pages/not-found.page.ts
apps/rait/web/src/app/core/rait-shell.component.spec.ts
apps/rait/web/src/app/core/rait-shell.component.ts
apps/rait/web/src/app/core/role-home.ts
apps/rait/web/src/app/core/runtime-config.ts
apps/rait/web/src/app/core/session.facade.ts
apps/rait/web/src/app/core/shell-search.ts
apps/rait/web/src/app/core/shortcut-help.component.ts
apps/rait/web/src/app/core/shortcut.service.spec.ts
apps/rait/web/src/app/core/shortcut.service.ts
apps/rait/web/src/app/core/sse.service.spec.ts
apps/rait/web/src/app/core/sse.service.ts
apps/rait/web/src/app/core/stream-transport.ts
apps/rait/web/src/app/core/title.strategy.ts
apps/rait/web/src/app/features/admin/admin.routes.ts
apps/rait/web/src/app/features/arquivo/arquivo.routes.ts
apps/rait/web/src/app/features/assinatura/assinatura.routes.ts
apps/rait/web/src/app/features/auditoria/auditoria.routes.ts
apps/rait/web/src/app/features/autoridade/autoridade.routes.ts
apps/rait/web/src/app/features/caso/caso.routes.ts
apps/rait/web/src/app/features/colegiado/colegiado.routes.ts
apps/rait/web/src/app/features/conta/conta.routes.ts
apps/rait/web/src/app/features/fila/fila.routes.ts
apps/rait/web/src/app/features/financeiro/financeiro.routes.ts
apps/rait/web/src/app/features/gestao/gestao.routes.ts
apps/rait/web/src/app/features/integracoes/integracoes.routes.ts
apps/rait/web/src/app/features/organizacao/organizacao.routes.ts
apps/rait/web/src/app/features/painel/painel.routes.ts
apps/rait/web/src/app/features/protocolo/protocolo.routes.ts
apps/rait/web/src/app/i18n/i18n.spec.ts
apps/rait/web/src/app/i18n/rait.pt-BR.json
apps/rait/web/src/app/screens/screens.spec.ts
apps/rait/web/src/app/shared/placeholder-page.component.ts
apps/rait/web/src/index.html
apps/rait/web/src/main.ts
apps/rait/web/src/styles.css
apps/rait/web/src/test-setup.ts
apps/rait/web/src/testing/a11y-state.spec-helper.ts
apps/rait/web/src/testing/axe.spec-helper.ts
apps/rait/web/src/testing/i18n-test-catalog.ts
apps/rait/web/src/testing/kb.ts
apps/rait/web/src/testing/route-manifest.fixture.ts
apps/rait/web/src/testing/router-harness.ts
apps/rait/web/src/testing/session.stub.ts
apps/rait/web/src/testing/stream-transport.stub.ts
apps/rait/web/src/testing/stynx-session.stub.ts
```

`git status --short`:

```text
 M apps/rait/web/src/app/app.component.ts
 M apps/rait/web/src/main.ts
 M backend/app/src/generated/parameter-flags.ts
 M backend/database/seed/05-parameters.sql
 M backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
 M docs/framework/arch/parameter-catalogue.md
 M work/rounds/R-0012/budget.json
 M work/rounds/R-0012/compositions.json
 M work/rounds/R-0012/plan.md
 M work/rounds/R-0012/tasks/TASK-0005.json
 M work/rounds/R-0012/tasks/TASK-0006.json
?? apps/rait/web/src/app/app.guards-matrix.absence.spec.ts
?? apps/rait/web/src/app/app.guards-matrix.anonymous.spec.ts
?? apps/rait/web/src/app/app.guards-matrix.presence.spec.ts
?? apps/rait/web/src/app/app.route-manifest.spec.ts
?? apps/rait/web/src/app/app.route-manifest.ts
?? apps/rait/web/src/app/app.routes.spec.ts
?? apps/rait/web/src/app/app.routes.ts
?? apps/rait/web/src/app/app.scaffold.spec.ts
?? apps/rait/web/src/app/core/
?? apps/rait/web/src/app/features/
?? apps/rait/web/src/app/i18n/
?? apps/rait/web/src/app/screens/
?? apps/rait/web/src/app/shared/
?? apps/rait/web/src/testing/
?? tools/parameters/tests/allowlist-rait.test.mjs
?? work/rounds/R-0012/prompts/TASK-0005.md
?? work/rounds/R-0012/prompts/TASK-0006.md
?? work/rounds/R-0012/reviews/prompt-review-3.bridge.json
?? work/rounds/R-0012/reviews/prompt-review-3.json
?? work/rounds/R-0012/reviews/prompt-review-3.md
?? work/rounds/R-0012/reviews/prompt-review-4.bridge.json
?? work/rounds/R-0012/reviews/prompt-review-4.json
?? work/rounds/R-0012/reviews/prompt-review-4.md
?? work/rounds/R-0012/reviews/prompt-review-5.bridge.json
?? work/rounds/R-0012/reviews/prompt-review-5.json
?? work/rounds/R-0012/reviews/prompt-review-5.md
```

Diff dos arquivos rastreados relevantes (allowlist, `main.ts`, `app.component.ts`):

```diff
diff --git a/apps/rait/web/src/app/app.component.ts b/apps/rait/web/src/app/app.component.ts
index ff8a1f69..8e6b1689 100644
--- a/apps/rait/web/src/app/app.component.ts
+++ b/apps/rait/web/src/app/app.component.ts
@@ -1,9 +1,12 @@
-// Raiz provisória do scaffold (R-0012 M1): o Engineer do CTG-0002a monta aqui o RaitShellComponent.
+// Raiz do app (spec §5.1; contrato CTG-0002a §5): monta o `RaitShellComponent`, que envolve o
+// `DetranAppShellComponent` do kit (com o `router-outlet`).
 import { ChangeDetectionStrategy, Component } from '@angular/core';
+import { RaitShellComponent } from './core/rait-shell.component';

 @Component({
   selector: 'rait-root',
+  imports: [RaitShellComponent],
   changeDetection: ChangeDetectionStrategy.OnPush,
-  template: `<main></main>`,
+  template: `<rait-shell />`,
 })
 export class AppComponent {}
diff --git a/apps/rait/web/src/main.ts b/apps/rait/web/src/main.ts
index 78fbee25..0de8980a 100644
--- a/apps/rait/web/src/main.ts
+++ b/apps/rait/web/src/main.ts
@@ -1,8 +1,52 @@
-// Bootstrap do console RAIT (R-0012 M1; substituído pelo Engineer do CTG-0002a conforme
-// contracts/CTG-0002a.md: provideDetranAuthenticatedApp, provideRouter(RAIT_ROUTES), TitleStrategy).
+// Bootstrap do console RAIT (spec §1 "Bootstrap"; detran-ui-guide.md §1; plan.md M1; contrato
+// CTG-0002a §1/§4): só `provideDetranAuthenticatedApp` (STYNX core + OIDC/sessão + tenancy +
+// i18n pt-BR), `provideHttpClient`, `provideRouter` com binding de inputs e a `TitleStrategy`
+// do app. Sem service worker (o console é interno; spec §8 "offline não suportado").
+// Configuração de runtime lida de `public/runtime-config.js` (três chaves, sem segredo).
+import { provideHttpClient } from '@angular/common/http';
 import { bootstrapApplication } from '@angular/platform-browser';
+import {
+  TitleStrategy,
+  provideRouter,
+  withComponentInputBinding,
+} from '@angular/router';
+import { provideDetranAuthenticatedApp } from '@detran/ui';
 import { AppComponent } from './app/app.component';
+import { RAIT_ROUTES } from './app/app.routes';
+import { LOGIN_ROUTE } from './app/core/guards/auth.guard';
+import { readRuntimeConfig } from './app/core/runtime-config';
+import { RaitTitleStrategy } from './app/core/title.strategy';

-bootstrapApplication(AppComponent).catch((error: unknown) => {
+const runtime = readRuntimeConfig();
+const origin = window.location.origin;
+
+bootstrapApplication(AppComponent, {
+  providers: [
+    provideHttpClient(),
+    provideRouter(RAIT_ROUTES, withComponentInputBinding()),
+    provideDetranAuthenticatedApp({
+      // Mesma origem: o browser só fala com `/v1/inf/rait/*` (spec §1; ADR-0003).
+      angular: { apiBaseUrl: '', sessionMode: 'bearer' },
+      oidc: {
+        oidc: {
+          authority: runtime.oidcAuthority,
+          clientId: runtime.clientId,
+          redirectUrl: `${origin}${LOGIN_ROUTE}`,
+          postLogoutRedirectUri: `${origin}/`,
+        },
+        // A2/OD-R12-006: `/auth/callback` inicia o OIDC sem `code`/`state` e o conclui com eles.
+        loginRedirectRoute: LOGIN_ROUTE,
+      },
+      // O `Host` decide o tenant no servidor (ADR-0002/0005); `tenantId` só semeia a sessão e o
+      // header `X-Tenant-Id` que o STYNX envia (OD-R12-009).
+      tenancy: { defaultTenantResolver: () => runtime.tenantId || null },
+      i18n: {
+        loadCatalog: () =>
+          import('./app/i18n/rait.pt-BR.json').then((m) => m.default),
+      },
+    }),
+    { provide: TitleStrategy, useClass: RaitTitleStrategy },
+  ],
+}).catch((error: unknown) => {
   console.error(error);
 });
diff --git a/docs/framework/arch/parameter-catalogue.md b/docs/framework/arch/parameter-catalogue.md
index 88deaedb..2fb85f01 100644
--- a/docs/framework/arch/parameter-catalogue.md
+++ b/docs/framework/arch/parameter-catalogue.md
@@ -169,6 +169,20 @@ autoridade aparecem na própria linha.
 | `teat.navigation`      | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
 | `teat.a11y`            | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
 | `teat.provisioning`    | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
+| `rait.action`          | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.common`          | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.errors`          | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.nav`             | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.role`            | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.instance`        | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.decision`        | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.channel`         | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.shell`           | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.states`          | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.screens`         | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.forms`           | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.legal`           | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |
+| `rait.a11y`            | `apps/rait/web`                    | `src/app/i18n/rait.pt-BR.json`             | OD-P46  |

 ## Regras do catálogo

```
