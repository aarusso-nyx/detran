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

**Primeiro ciclo (exaustivo) da entrega do grupo acoplado CTG-0003a (par 1 — núcleo e
compartilhados)** — tríade TASK-0019 (Architect: `work/rounds/R-0014/contracts/CTG-0003a.md`,
1457 linhas, 101 critérios C-3a-nn, 22 `[DIVERGE-n]` resolvidos pelo canônico, OD-P57…P67),
TASK-0008 (Inspector, Sonnet/médio: 29 specs + 5 stubs; iteração 2 corrigiu 11 defeitos de spec
B2…B12 e apanhou um defeito real), TASK-0009 (Engineer, Opus: 32 módulos — `PortalClient` de
comandos com `Idempotency-Key` M17 e `If-Match`, `ErrorBoundary` completo com 67 códigos,
`PortalErrorBanner`/`FieldErrorsDirective`, `SessionFacade` completo, `PortalClock`, onze
compartilhados §5.2, 14 schemas zod + `FormGate`, `OfflineDocumentStore`; iteração 2 corrigiu o
erro `Blob` de `downloadReceipt`). Adendas do Architect: **A6** (ratificações do contrato:
`peek()`, `<alvo>` `none`, `allowed` obrigatório, chaves OD-P58 no catálogo, "10 MB" da spec §7)
e **A7** (a: `vitest.config.ts` com `angularJitApplicationTransform` — correção de M3 pelo maestro,
sem a qual `input()`/`output()` não são registrados no JIT; b: C-3a-60 sem `elevationRequested` no
403; c: placeholders `{x}` do motor STYNX; d/e). Transcriber: TASK-0006 it. 4 (26 chaves OD-P58,
fonte por chave no relatório) e it. 5 (10 placeholders). Relatórios em `work/rounds/R-0014/reports/`
(`TASK-0019.md`, `TASK-0008.md`, `TASK-0008-iteration-2.md`, `TASK-0009.md`,
`TASK-0009-iteration-2.md`, `TASK-0006-iteration-4.md`, `-5.md`). Pendência registrada em
`plan.md` §Pendências de cobertura: C-3a-99 (axe por estado em todos os 11) e C-3a-100 (ciclo de
`Tab`) parciais — cobertura não reduzida, só não estendida. A entrega está **staged, não
commitada** (`git diff --cached`), no branch publicado `orchestra/portal-pwa` (= `origin/main`
`2888c9b` + observação + prompts).

Gates executados pelo maestro sobre a árvore staged: `pnpm check` completo (Engineer, primeiro
plano) → **EXIT 0**; conferido pelo maestro: `pnpm --filter @detran/portal-web test` → **Test Files
50 passed, Tests 672 passed | 3 todo (675)**, 0 erros não tratados; typecheck/lint/build OK;
`verify:parameter-catalogue` OK (14 namespaces); `format:check` OK. Os 3 `todo` citam OD-P54,
OD-P59, OD-P60 (regra do manual: nunca `todo` sem OD).

Itens a julgar com atenção: (5) nada inventado — o contrato marca `source_pending`/OD onde a fonte
não fixa (formas 2xx ausentes → estado indisponível, M15; `signatureRef` gov.br → OD-P60; limiar de
bateria → OD-P54); as decisões de engenharia aditivas de TASK-0009 estão listadas em §Fora do
escopo do relatório (`WizardReceipt` para 502, inputs opcionais do wizard, `role="textbox"`, `HttpClient`
resolvido na 1ª requisição, `z.iso.datetime({ offset: true })`); (7) nenhum spec enfraquecido — as
correções do Inspector são de mecânica assíncrona/jsdom (relatório it. 2) e C-3a-60 segue A7(b);
(8) tokens só em `data-token`/`data-*`; (9) o browser só fala com `/v1/portal/*`, com a única
exceção documentada do upload por URL assinada ([DIVERGE-17], ADR-0018, `fetch` sem credenciais);
(13) `SessionFacade.canPerform` testado com presença e ausência (C-3a-39).

### git diff --cached --stat (sem `work/`)

```
 apps/portal/web/README.md                          |  49 ++-
 apps/portal/web/src/app/core/auth-flow.service.ts  |   5 +-
 apps/portal/web/src/app/core/brand.service.spec.ts |   2 +
 apps/portal/web/src/app/core/brand.service.ts      |   3 +
 apps/portal/web/src/app/core/clock.ts              |  15 +
 .../src/app/core/error-banner.component.spec.ts    | 163 +++++++
 .../web/src/app/core/error-banner.component.ts     | 177 ++++++++
 .../portal/web/src/app/core/error-boundary.spec.ts | 302 +++++++++++++
 apps/portal/web/src/app/core/error-boundary.ts     | 435 ++++++++++++++++++-
 .../src/app/core/field-errors.directive.spec.ts    |  64 +++
 .../web/src/app/core/field-errors.directive.ts     |  51 +++
 .../src/app/core/offline-document.store.spec.ts    | 115 +++++
 .../web/src/app/core/offline-document.store.ts     |  14 +-
 .../portal/web/src/app/core/resume.service.spec.ts |  32 ++
 apps/portal/web/src/app/core/resume.service.ts     |  10 +-
 .../portal/web/src/app/core/session.facade.spec.ts | 254 +++++++++++
 apps/portal/web/src/app/core/session.facade.ts     | 149 ++++++-
 .../web/src/app/data/idempotency-key.spec.ts       |  54 +++
 apps/portal/web/src/app/data/idempotency-key.ts    |  70 +++
 .../web/src/app/data/portal-command.models.ts      |  44 ++
 apps/portal/web/src/app/data/portal.client.spec.ts | 481 +++++++++++++++++++++
 apps/portal/web/src/app/data/portal.client.ts      | 344 ++++++++++++++-
 .../web/src/app/forms/adesao-sne.schema.spec.ts    |  77 ++++
 apps/portal/web/src/app/forms/adesao-sne.schema.ts |  40 ++
 apps/portal/web/src/app/forms/attachments.ts       |  10 +
 .../web/src/app/forms/avaliacao.schema.spec.ts     |  61 +++
 apps/portal/web/src/app/forms/avaliacao.schema.ts  |  32 ++
 .../web/src/app/forms/defesa-previa.schema.spec.ts |  52 +++
 .../web/src/app/forms/defesa-previa.schema.ts      |  28 ++
 .../web/src/app/forms/desistencia.schema.spec.ts   |  39 ++
 .../portal/web/src/app/forms/desistencia.schema.ts |  27 ++
 .../web/src/app/forms/elevacao.schema.spec.ts      |  50 +++
 apps/portal/web/src/app/forms/elevacao.schema.ts   |  26 ++
 apps/portal/web/src/app/forms/form-gate.ts         |  48 ++
 .../app/forms/indicacao-condutor.schema.spec.ts    |  80 ++++
 .../web/src/app/forms/indicacao-condutor.schema.ts |  54 +++
 .../web/src/app/forms/junta-medica.schema.spec.ts  |  44 ++
 .../web/src/app/forms/junta-medica.schema.ts       |  27 ++
 .../web/src/app/forms/manifestacao.schema.spec.ts  |  53 +++
 .../web/src/app/forms/manifestacao.schema.ts       |  30 ++
 .../web/src/app/forms/meus-dados.schema.spec.ts    |  44 ++
 apps/portal/web/src/app/forms/meus-dados.schema.ts |  31 ++
 .../web/src/app/forms/pagamento.schema.spec.ts     |  64 +++
 apps/portal/web/src/app/forms/pagamento.schema.ts  |  41 ++
 .../web/src/app/forms/preferencias.schema.spec.ts  |  47 ++
 .../web/src/app/forms/preferencias.schema.ts       |  36 ++
 .../src/app/forms/recurso-cetran.schema.spec.ts    |  38 ++
 .../web/src/app/forms/recurso-cetran.schema.ts     |  25 ++
 .../web/src/app/forms/recurso-jari.schema.spec.ts  |  36 ++
 .../web/src/app/forms/recurso-jari.schema.ts       |  25 ++
 .../app/forms/resposta-diligencia.schema.spec.ts   |  40 ++
 .../src/app/forms/resposta-diligencia.schema.ts    |  26 ++
 .../web/src/app/forms/schemas-matrix.spec.ts       | 164 +++++++
 apps/portal/web/src/app/i18n/portal.pt-BR.json     |  46 +-
 .../app/shared/action-triplet.component.spec.ts    | 131 ++++++
 .../web/src/app/shared/action-triplet.component.ts | 110 +++++
 .../alternative-channel-note.component.spec.ts     |  84 ++++
 .../shared/alternative-channel-note.component.ts   |  53 +++
 .../shared/assurance-explainer.component.spec.ts   |  61 +++
 .../app/shared/assurance-explainer.component.ts    | 100 +++++
 .../shared/attachment-uploader.component.spec.ts   | 315 ++++++++++++++
 .../app/shared/attachment-uploader.component.ts    | 258 +++++++++++
 .../shared/citizen-status-badge.component.spec.ts  |  64 +++
 .../app/shared/citizen-status-badge.component.ts   |  62 +++
 .../shared/consequence-dialog.component.spec.ts    | 165 +++++++
 .../src/app/shared/consequence-dialog.component.ts | 209 +++++++++
 .../src/app/shared/deadline-card.component.spec.ts |  80 ++++
 .../web/src/app/shared/deadline-card.component.ts  |  50 +++
 .../app/shared/prefilled-field.component.spec.ts   |  65 +++
 .../src/app/shared/prefilled-field.component.ts    |  57 +++
 .../app/shared/protocol-receipt.component.spec.ts  | 113 +++++
 .../src/app/shared/protocol-receipt.component.ts   | 132 ++++++
 .../app/shared/service-wizard.component.spec.ts    | 438 +++++++++++++++++++
 .../web/src/app/shared/service-wizard.component.ts | 273 ++++++++++++
 .../web/src/app/shared/service-wizard.store.ts     | 411 ++++++++++++++++++
 .../app/shared/signature-step.component.spec.ts    | 167 +++++++
 .../web/src/app/shared/signature-step.component.ts | 175 ++++++++
 apps/portal/web/src/testing/contract-types.ts      | 402 +++++++++++++++++
 apps/portal/web/src/testing/file-list.polyfill.ts  |  17 +
 apps/portal/web/src/testing/gate-fixtures.ts       | 216 +++++++++
 apps/portal/web/src/testing/http-fixtures.ts       |  93 ++++
 apps/portal/web/src/testing/i18n-test-catalog.ts   |  36 ++
 apps/portal/web/src/testing/session-facade.stub.ts | 109 ++++-
 apps/portal/web/src/testing/stynx-session.stub.ts  |  42 ++
 apps/portal/web/vitest.config.ts                   |  63 ++-
 85 files changed, 8741 insertions(+), 84 deletions(-)
```

### git diff --cached — produção, runner e catálogo (sem `work/`, sem specs/stubs — anexados a seguir em amostra)

```diff
diff --git a/apps/portal/web/README.md b/apps/portal/web/README.md
index d48bcf1..5877572 100644
--- a/apps/portal/web/README.md
+++ b/apps/portal/web/README.md
@@ -47,11 +47,15 @@ src/app/
   app.route-manifest.ts   PORTAL_ROUTE_MANIFEST (38 rotas — fonte única das rotas e dos testes)
   core/                   citizen-shell, brand.service, session.facade, auth-flow.service,
                           entitlement.facade, service-catalog.facade, resume.service,
-                          error-boundary, offline-document.store, runtime-config,
-                          title.strategy, i18n-fallback, manifest-routes, guards/, pages/
+                          error-boundary, error-banner.component, field-errors.directive,
+                          clock, offline-document.store, runtime-config, title.strategy,
+                          i18n-fallback, manifest-routes, guards/, pages/
   features/<module>/      <module>.routes.ts (lazy; caminhos completos derivados do manifesto)
-  shared/                 placeholder-page.component (rotas ainda não construídas)
-  data/                   portal.client.ts (wrapper tipado por @detran/api-clients)
+  shared/                 placeholder-page.component (rotas ainda não construídas) e os onze
+                          compartilhados do par 1 (CTG-0003a §5) + service-wizard.store
+  forms/                  14 schemas zod + form-gate.ts + attachments.ts (M12; CTG-0003a §6)
+  data/                   portal.client.ts (leituras e comandos), idempotency-key.ts,
+                          portal-command.models.ts
   i18n/                   portal.pt-BR.json (catálogo plano, chave = caminho pontuado)
   a11y/                   axe.spec-helper.ts (Inspector)
 src/testing/              stubs e harness dos specs (Inspector)
@@ -101,3 +105,40 @@ src/testing/              stubs e harness dos specs (Inspector)
   (shell `prefetch`, sem `runtime-config.js`). O cache offline de CNH-e/CRLV-e é do CTG-0003
   (`OfflineDocumentStore`, validade do documento; forma do `dataGroup`, se houver, em OD-P51);
   qualquer outra rota offline mostra `portal.states.offline` sem prometer envio posterior.
+
+## Par 1 do app funcional (CTG-0003a): núcleo, compartilhados, schemas
+
+- `data/portal.client.ts`: comandos do ciclo comum (`createRequest`, `saveDraft`,
+  `requestAttachmentUpload`, `uploadToSignedUrl`, `completeAttachment`, `submitRequest`,
+  `withdrawRequest`, `respondDiligence`, `elevateAssurance`, `completeElevation`,
+  `downloadReceipt`) sobre o `HttpClient` com `observe: 'response'` (`ETag` →
+  `CommandResult.etag`). `If-Match` é sempre o `etag` lido (`null` omite o cabeçalho; o servidor
+  responde 428). `Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>` (M17;
+  `data/idempotency-key.ts`: `canonicalJson` + SHA-256 via `crypto.subtle`), recalculada a cada
+  chamada. Única saída de `/v1/portal/*`: o `PUT` na URL assinada do storage, por `fetch` puro,
+  sem `Authorization` e com `credentials: 'omit'`. As formas 2xx que o OpenAPI ainda não declara
+  ficam em `data/portal-command.models.ts` (OD-P59; a UI nunca simula resultado, M15).
+- `core/error-boundary.ts`: `classifyError` (`code`, `status`, `messageKey`, `context`,
+  `fields`, `retryAfter`) e `presentError` → `ErrorPresentation` (severidade, próximo passo e
+  rota, canal alternativo) pela tabela `ERROR_PRESENTATION` dos 67 códigos do catálogo. Nunca
+  navega para `context.resumeRoute` do servidor; a rota de retomada é a do app.
+  `core/error-banner.component.ts` (`portal-error-banner`, `StynxBanner` do kit, `role="alert"`
+  com foco para erro, `role="status"` para avisos) e `core/field-errors.directive.ts`
+  (`form[portalFieldErrors]`: `aria-invalid`/`aria-describedby` e foco no primeiro campo).
+- `core/session.facade.ts`: `account`, `representations`, `loading`, `loadError`, `load()`,
+  `requirementFor()`, `canPerform()` (fail-closed: ato desconhecido → `false`),
+  `requestElevation()` (grava o `ResumePoint` ANTES do `POST`) e `completeElevation()`. Sessão
+  inativa → conta zerada e `OfflineDocumentStore.clear()`; o `ResumeService` sobrevive ao
+  redirecionamento OIDC (`peek()` no callback, `resume()` só no `ServiceWizard.resumeFrom`).
+- `core/clock.ts` (`PortalClock`): único relógio do domínio (`acceptedAt` do diálogo de
+  consequência, validade do cache offline); os specs o substituem por `useValue`.
+- `shared/`: `citizen-status-badge` (+ `badgeOf`, única relação estado → badge, lida do
+  catálogo), `deadline-card` (sem aritmética de datas), `action-triplet` (sempre as três ações),
+  `service-wizard` + `service-wizard.store` (provido no componente; a feature lê o store pelo
+  injector do componente e projeta o formulário do passo 2), `prefilled-field`,
+  `attachment-uploader`, `consequence-dialog`, `signature-step`, `protocol-receipt`,
+  `alternative-channel-note`, `assurance-explainer`. Nenhum calcula prazo, tempestividade,
+  elegibilidade ou nível: tudo chega do servidor; tokens crus só em `data-*`.
+- `forms/`: um schema zod por ato (`<Nome>Schema`, `strict`) e o `<NOME>_GATE: FormGate`
+  transcrito da spec §7 — documentação verificável que nunca decide permissão; nenhum arquivo de
+  `forms/` importa facade, guardas ou relógio.
diff --git a/apps/portal/web/src/app/core/auth-flow.service.ts b/apps/portal/web/src/app/core/auth-flow.service.ts
index 5f951f0..9a3bcb4 100644
--- a/apps/portal/web/src/app/core/auth-flow.service.ts
+++ b/apps/portal/web/src/app/core/auth-flow.service.ts
@@ -29,13 +29,14 @@ export class AuthFlowService {

   /**
    * Conclui a sessão STYNX a partir da URL de retorno e navega à rota retomada (ou a
-   * `/inicio`). Devolve `false` quando não há sessão a concluir.
+   * `/inicio`). Devolve `false` quando não há sessão a concluir. Lê o ponto com `peek()`
+   * ([DIVERGE-4], A6(a)): o rascunho é consumido pelo `ServiceWizard.resumeFrom`, não aqui.
    */
   async completeLogin(url: string): Promise<boolean> {
     if (!this.stynx) return false;
     const state = await this.stynx.completeLogin(url);
     if (!state.active) return false;
-    const target = this.resume.resume()?.route ?? DEFAULT_LANDING_ROUTE;
+    const target = this.resume.peek()?.route ?? DEFAULT_LANDING_ROUTE;
     await this.router.navigateByUrl(target);
     return true;
   }
diff --git a/apps/portal/web/src/app/core/brand.service.ts b/apps/portal/web/src/app/core/brand.service.ts
index 7e3c0aa..47e7f49 100644
--- a/apps/portal/web/src/app/core/brand.service.ts
+++ b/apps/portal/web/src/app/core/brand.service.ts
@@ -15,6 +15,8 @@ export interface AvailableBrand {
   readonly privacyUrl?: string;
   readonly accessibilityUrl?: string;
   readonly primaryColor?: string;
+  /** Contato do atendimento (`GET brand`, A1; formato `source_pending` — a fixture traz um e-mail). */
+  readonly serviceContact?: string;
 }

 export interface UnavailableBrand {
@@ -38,6 +40,7 @@ function toBrandState(profile: BrandProfile): BrandState {
     privacyUrl: profile.privacyUrl,
     accessibilityUrl: profile.accessibilityUrl,
     primaryColor: profile.primaryColor,
+    serviceContact: profile.serviceContact,
   };
 }

diff --git a/apps/portal/web/src/app/core/clock.ts b/apps/portal/web/src/app/core/clock.ts
new file mode 100644
index 0000000..e57b834
--- /dev/null
+++ b/apps/portal/web/src/app/core/clock.ts
@@ -0,0 +1,15 @@
+// PortalClock (contrato CTG-0003a §1; CODESTYLE.md §TypeScript: sem `Date.now()` em código de
+// domínio — o relógio é injetado). `acceptedAt` do `ConsequenceDialog` e o `now` do
+// `OfflineDocumentStore` vêm daqui; os specs substituem por `useValue` com o relógio fixo do §9.
+import { Injectable } from '@angular/core';
+
+@Injectable({ providedIn: 'root', useFactory: () => new SystemClock() })
+export abstract class PortalClock {
+  abstract now(): Date;
+}
+
+export class SystemClock extends PortalClock {
+  now(): Date {
+    return new Date();
+  }
+}
diff --git a/apps/portal/web/src/app/core/error-banner.component.ts b/apps/portal/web/src/app/core/error-banner.component.ts
new file mode 100644
index 0000000..9b8be4d
--- /dev/null
+++ b/apps/portal/web/src/app/core/error-banner.component.ts
@@ -0,0 +1,177 @@
+// PortalErrorBanner (contrato CTG-0003a §3.4; catálogo §8; §8 a11y): apresenta um
+// `ErrorPresentation` com o `StynxBannerComponent` do kit (nunca reimplementado). `error` →
+// `role="alert"` + `aria-live="assertive"` e recebe o foco ao aparecer; `warning`/`info` →
+// `role="status"` + `aria-live="polite"`. O próximo passo é `<a routerLink>` quando há rota, ou
+// `<button>` para `retry`/`reload`; o canal alternativo aparece sempre que `alternativeChannel`.
+// Erros nunca vão em toast (toasts ficam para confirmações não bloqueantes).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  input,
+  output,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { Router, RouterLink, type UrlTree } from '@angular/router';
+import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
+import { AlternativeChannelNoteComponent } from '../shared/alternative-channel-note.component';
+import { BrandService } from './brand.service';
+import {
+  LOGIN_ROUTE,
+  type ErrorPresentation,
+  type NextStep,
+} from './error-boundary';
+
+/** Rótulo do próximo passo (contrato §3.2); `null` = sem controle. */
+const NEXT_STEP_LABEL: Readonly<Record<NextStep, string | null>> = {
+  login: 'portal.common.action.login',
+  reauth: 'portal.common.action.login',
+  elevation: 'portal.screens.t27.cmd.elevar',
+  entitlement_help: 'portal.common.link.ouvidoria',
+  service_unavailable: 'portal.common.label.alternative_channel',
+  ineligible: null,
+  retry: 'portal.common.action.retry',
+  reload: 'portal.common.action.retry',
+  inline_fields: null,
+  support: 'portal.common.link.suporte',
+  existing_request: 'portal.requests.nextAction.PEDIDO_EM_COMPOSICAO',
+  payment: 'portal.requests.nextAction.AGUARDANDO_PAGAMENTO',
+  enrollment: 'portal.services.adesao_sne',
+  representation: 'portal.common.link.conta',
+  none: null,
+};
+
+const TONE: Readonly<
+  Record<ErrorPresentation['severity'], 'error' | 'warning' | 'info'>
+> = { error: 'error', warning: 'warning', info: 'info' };
+
+@Component({
+  selector: 'portal-error-banner',
+  imports: [
+    RouterLink,
+    StynxBannerComponent,
+    StynxTranslatePipe,
+    AlternativeChannelNoteComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  template: `
+    @if (error(); as presentation) {
+      <div
+        #region
+        class="portal-error-banner"
+        tabindex="-1"
+        [attr.role]="presentation.severity === 'error' ? 'alert' : 'status'"
+        [attr.aria-live]="
+          presentation.severity === 'error' ? 'assertive' : 'polite'
+        "
+        [attr.data-code]="presentation.code"
+        [attr.data-status]="presentation.status"
+        [attr.data-next-step]="presentation.nextStep"
+      >
+        <stynx-banner
+          [tone]="tone()"
+          [message]="
+            presentation.messageKey | stynxTranslate: presentation.messageParams
+          "
+        />
+        @if (presentation.nextStep === 'ineligible') {
+          <dl class="portal-error-details">
+            @if (reason(); as text) {
+              <dt>{{ 'portal.common.label.reason' | stynxTranslate }}</dt>
+              <dd data-reason>{{ text }}</dd>
+            }
+          </dl>
+        }
+        @if (labelKey(); as key) {
+          @if (nextStepTree(); as tree) {
+            <a [routerLink]="tree" data-next-step>{{ key | stynxTranslate }}</a>
+          } @else if (supportHref(); as href) {
+            <a [attr.href]="href" rel="noopener" data-next-step>{{
+              key | stynxTranslate
+            }}</a>
+          } @else if (isRetry()) {
+            <button type="button" data-next-step (click)="retry.emit()">
+              {{ key | stynxTranslate }}
+            </button>
+          }
+        }
+        @if (presentation.alternativeChannel) {
+          <portal-alternative-channel-note
+            [note]="alternativeNote()"
+            [serviceKey]="serviceKey()"
+          />
+        }
+      </div>
+    }
+  `,
+})
+export class PortalErrorBannerComponent {
+  private readonly router = inject(Router);
+  private readonly brand = inject(BrandService);
+  private readonly region = viewChild<ElementRef<HTMLElement>>('region');
+
+  readonly error = input.required<ErrorPresentation | null>();
+  /** `nextStep` `retry` | `reload`. */
+  readonly retry = output<void>();
+  /**
+   * Avisos (`warning`/`info`). O banner não renderiza controle próprio de fechar: não há chave
+   * de rótulo com fonte (OD-P58 não a lista) — o hospedeiro fecha o aviso pelo seu contexto.
+   */
+  readonly dismiss = output<void>();
+
+  readonly tone = computed(() => TONE[this.error()?.severity ?? 'error']);
+  readonly labelKey = computed<string | null>(() => {
+    const presentation = this.error();
+    return presentation ? NEXT_STEP_LABEL[presentation.nextStep] : null;
+  });
+  readonly isRetry = computed(() => {
+    const step = this.error()?.nextStep;
+    return step === 'retry' || step === 'reload';
+  });
+  readonly nextStepTree = computed<UrlTree | null>(() => {
+    const presentation = this.error();
+    if (!presentation) return null;
+    const step = presentation.nextStep;
+    // Entrada gov.br é sempre a do shell (`/`), mesmo sem rota de retomada.
+    const route =
+      presentation.nextStepRoute ??
+      (step === 'login' || step === 'reauth' ? LOGIN_ROUTE : null);
+    return route ? this.router.parseUrl(route) : null;
+  });
+  /** `support` → `brand.supportUrl` (externo). */
+  readonly supportHref = computed<string | null>(() => {
+    if (this.error()?.nextStep !== 'support') return null;
+    const brand = this.brand.state();
+    return brand.status === 'available' ? (brand.supportUrl ?? null) : null;
+  });
+  readonly reason = computed<string | null>(() => {
+    const reason = this.error()?.context['reason'];
+    return typeof reason === 'string' ? reason : null;
+  });
+  readonly alternativeNote = computed<string | null>(() => {
+    const context = this.error()?.context ?? {};
+    const note = context['alternativeChannelNote'] ?? context['alternative'];
+    return typeof note === 'string' ? note : null;
+  });
+  readonly serviceKey = computed<string | null>(() => {
+    const key = this.error()?.context['serviceKey'];
+    return typeof key === 'string' ? key : null;
+  });
+
+  constructor() {
+    // Erro bloqueante recebe o foco ao aparecer (§8); avisos não movem o foco do usuário.
+    afterRenderEffect(() => {
+      const presentation = this.error();
+      const region = this.region();
+      untracked(() => {
+        if (presentation?.severity === 'error' && region) {
+          region.nativeElement.focus();
+        }
+      });
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/core/error-boundary.ts b/apps/portal/web/src/app/core/error-boundary.ts
index aacdea8..b6371cf 100644
--- a/apps/portal/web/src/app/core/error-boundary.ts
+++ b/apps/portal/web/src/app/core/error-boundary.ts
@@ -1,20 +1,272 @@
-// ErrorBoundary (portal-frontends.md §5.1; portal-error-catalog.md §8): mapeia o código
-// `PORTAL.<CODE>` de uma resposta de erro para a chave i18n `portal.errors.<code minúsculo>`.
-// Só o mapeamento nesta entrega — o catálogo de mensagens (`portal.errors.*`) é transcrito no
-// CTG-0002 (TASK-0006). Nenhuma mensagem é montada aqui: a UI só traduz a chave.
+// ErrorBoundary (portal-frontends.md §5.1; portal-error-catalog.md §8; contrato CTG-0003a §3):
+// classifica a resposta de erro (`classifyError`) e decide a apresentação (`presentError`):
+// chave i18n `portal.errors.<code minúsculo>` (a UI só traduz), severidade, próximo passo e
+// rota, canal alternativo, campos inválidos. Tokens (`code`, `context.*`) nunca viram texto.
+// Nunca navega para `context.resumeRoute` do servidor ([DIVERGE-8]): a rota de retomada é a
+// do app (`options.resumeRoute`). Sem lógica de prazo ou de nível aqui.
 import { HttpErrorResponse } from '@angular/common/http';
-import type { PortalErrorBody } from '../data/portal.client';
+import { DefaultUrlSerializer, type Params } from '@angular/router';
+import type { EntitlementKind, PortalErrorBody } from '../data/portal.client';
+import { ELEVATION_ROUTE } from './guards/assurance.guard';
+import { RESUME_QUERY_PARAM } from './guards/auth.guard';
+import { ENTITLEMENT_MISSING_ROUTE } from './guards/entitlement.guard';
+import { SERVICE_UNAVAILABLE_ROUTE } from './guards/service-availability.guard';

 export const PORTAL_ERROR_PREFIX = 'PORTAL.';
 export const PORTAL_ERRORS_NAMESPACE = 'portal.errors';

+/** Estados transversais (spec §5.1) usados quando o erro está fora do catálogo. */
+export const GENERIC_ERROR_KEY = 'portal.states.error';
+export const OFFLINE_KEY = 'portal.states.offline';
+
+/** Rotas do manifesto alvo dos passos `existing_request`, `enrollment`, `representation`, `login`. */
+export const PROCESS_ROUTE = '/processos';
+export const ENROLLMENT_ROUTE = '/sne';
+export const ACCOUNT_ROUTE = '/conta';
+export const LOGIN_ROUTE = '/';
+
 export interface ClassifiedError {
   /** Código canônico (`PORTAL.NOT_FOUND`), ou `null` quando a resposta não é do catálogo. */
   readonly code: string | null;
+  /** 0 = rede/offline. */
   readonly status: number;
   /** Chave i18n (`portal.errors.not_found`), ou `null` quando não há código catalogado. */
   readonly messageKey: string | null;
   readonly requestId?: string;
+  /** `context` do corpo, `{}` quando ausente. */
+  readonly context: Readonly<Record<string, unknown>>;
+  /** `context.fields[]` (400/422) ou `context.missing[]` (SNE_CONTACT_REQUIRED) ou `[]`. */
+  readonly fields: readonly string[];
+  /** `context.retryAfter` (503; tipo source_pending) ou `null`. */
+  readonly retryAfter: number | string | null;
+}
+
+export type ErrorSeverity = 'error' | 'warning' | 'info';
+
+export type NextStep =
+  | 'login'
+  | 'reauth'
+  | 'elevation'
+  | 'entitlement_help'
+  | 'service_unavailable'
+  | 'ineligible'
+  | 'retry'
+  | 'reload'
+  | 'inline_fields'
+  | 'support'
+  | 'existing_request'
+  | 'payment'
+  | 'enrollment'
+  | 'representation'
+  | 'none';
+
+export interface ErrorPresentation {
+  readonly code: PortalErrorCode | null;
+  readonly status: number;
+  /** Sempre existente no catálogo. */
+  readonly messageKey: string;
+  readonly messageParams: Readonly<Record<string, string>>;
+  readonly severity: ErrorSeverity;
+  readonly nextStep: NextStep;
+  /** UrlTree serializada, quando o passo é navegação. */
+  readonly nextStepRoute: string | null;
+  /** Renderiza `AlternativeChannelNote`. */
+  readonly alternativeChannel: boolean;
+  readonly fields: readonly string[];
+  readonly retryAfter: number | string | null;
+  readonly context: Readonly<Record<string, unknown>>;
+  readonly requestId: string | null;
+}
+
+export interface PresentErrorOptions {
+  /** `state.url` do ato (para `elevation`, `login`, `reauth`). */
+  readonly resumeRoute?: string;
+  /** Para `service_unavailable`. */
+  readonly serviceKey?: string;
+  /** Para `entitlement_help`. */
+  readonly entitlement?: {
+    readonly kind: EntitlementKind;
+    readonly id: string;
+  };
+}
+
+/** Os 67 códigos do catálogo (§1–§7), com prefixo, na ordem do catálogo. */
+export const PORTAL_ERROR_CODES = [
+  // §1 sessão, identidade e nível
+  'PORTAL.AUTH_REQUIRED',
+  'PORTAL.IDENTITY_NOT_CITIZEN',
+  'PORTAL.ASSURANCE_NOT_VERIFIED',
+  'PORTAL.ASSURANCE_INSUFFICIENT',
+  'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED',
+  'PORTAL.REPRESENTATION_REFUSED',
+  'PORTAL.REPRESENTATION_EXPIRED',
+  'PORTAL.TENANT_UNRESOLVED',
+  'PORTAL.SESSION_TENANT_MISMATCH',
+  // §2 vínculo e elegibilidade
+  'PORTAL.NOT_FOUND',
+  'PORTAL.ENTITLEMENT_REQUIRED',
+  'PORTAL.INELIGIBLE',
+  'PORTAL.SERVICE_UNAVAILABLE',
+  'PORTAL.SERVICE_PARTIALLY_AVAILABLE',
+  // §3 pedidos e atos
+  'PORTAL.REQUEST_STATE_INVALID',
+  'PORTAL.REQUEST_DRAFT_EXISTS',
+  'PORTAL.REQUEST_ONE_PER_AIT',
+  'PORTAL.REQUEST_SIGNATURE_REQUIRED',
+  'PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED',
+  'PORTAL.REQUEST_OUT_OF_DEADLINE',
+  'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED',
+  'PORTAL.ATTACHMENT_INVALID',
+  'PORTAL.ATTACHMENT_AGENCY_DOCUMENT',
+  'PORTAL.WITHDRAWAL_AFTER_JUDGMENT',
+  'PORTAL.DILIGENCE_NOT_OPEN',
+  'PORTAL.DILIGENCE_ASKS_AGENCY_DOCUMENT',
+  'PORTAL.INDICATION_DRIVER_INVALID',
+  'PORTAL.INDICATION_SECOND_SIGNATURE_PENDING',
+  'PORTAL.INDICATION_WINDOW_CLOSED',
+  'PORTAL.DELEGATION_FAILED',
+  'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
+  'PORTAL.EVALUATION_NOT_OFFERED',
+  // §4 pagamento e SNE
+  'PORTAL.PAYMENT_TIER_NOT_AVAILABLE',
+  'PORTAL.PAYMENT_SNE_TIER_REQUIRES_ENROLLMENT',
+  'PORTAL.PAYMENT_WAIVER_ACK_REQUIRED',
+  'PORTAL.PAYMENT_WAIVER_DISABLED',
+  'PORTAL.PAYMENT_METHOD_UNAVAILABLE',
+  'PORTAL.PAYMENT_ALREADY_PAID',
+  'PORTAL.PAYMENT_PROVIDER_UNAVAILABLE',
+  'PORTAL.SNE_CONTACT_REQUIRED',
+  'PORTAL.SNE_ALREADY_ENROLLED',
+  'PORTAL.SNE_NOT_ENROLLED',
+  'PORTAL.SNE_UPSTREAM_UNAVAILABLE',
+  // §5 documentos, veículos, sinistros e exames
+  'PORTAL.CNH_NOT_FOUND',
+  'PORTAL.CNH_NOT_VALID_FOR_DIGITAL',
+  'PORTAL.CNH_CLEARANCE_PENDING',
+  'PORTAL.CRLV_BLOCKED_BY_DEBT',
+  'PORTAL.CRLV_BLOCKED_BY_RESTRICTION',
+  'PORTAL.CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING',
+  'PORTAL.NATIONAL_READ_UNAVAILABLE',
+  'PORTAL.CRASH_NOT_FINAL',
+  'PORTAL.CRASH_THIRD_PARTY_DATA_RESTRICTED',
+  'PORTAL.EXAM_PROCESSING',
+  'PORTAL.BOARD_REQUEST_WINDOW_CLOSED',
+  // §6 atendimento, avaliação e LGPD
+  'PORTAL.MANIFESTATION_KIND_INVALID',
+  'PORTAL.MANIFESTATION_STATE_INVALID',
+  'PORTAL.MANIFESTATION_NEVER_REFUSED',
+  'PORTAL.EVALUATION_ALREADY_SUBMITTED',
+  'PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE',
+  'PORTAL.PRIVACY_NO_DATA',
+  'PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED',
+  // §7 genéricos
+  'PORTAL.VALIDATION_FAILED',
+  'PORTAL.ENUM_INVALID',
+  'PORTAL.IF_MATCH_REQUIRED',
+  'PORTAL.VERSION_CONFLICT',
+  'PORTAL.RATE_LIMITED',
+  'PORTAL.INTERNAL',
+] as const;
+
+export type PortalErrorCode = (typeof PORTAL_ERROR_CODES)[number];
+
+type PresentationRule = Pick<
+  ErrorPresentation,
+  'severity' | 'nextStep' | 'alternativeChannel'
+>;
+
+const error = (
+  nextStep: NextStep,
+  alternativeChannel = true,
+): PresentationRule => ({ severity: 'error', nextStep, alternativeChannel });
+const warning: PresentationRule = {
+  severity: 'warning',
+  nextStep: 'none',
+  alternativeChannel: false,
+};
+const info: PresentationRule = {
+  severity: 'info',
+  nextStep: 'none',
+  alternativeChannel: false,
+};
+
+/** Tabela código → apresentação (contrato §3.3; catálogo §8). */
+export const ERROR_PRESENTATION: Readonly<
+  Record<PortalErrorCode, PresentationRule>
+> = {
+  'PORTAL.AUTH_REQUIRED': error('login'),
+  'PORTAL.IDENTITY_NOT_CITIZEN': error('none'),
+  'PORTAL.ASSURANCE_NOT_VERIFIED': error('reauth'),
+  'PORTAL.ASSURANCE_INSUFFICIENT': error('elevation'),
+  'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED': error('support'),
+  'PORTAL.REPRESENTATION_REFUSED': error('retry'),
+  'PORTAL.REPRESENTATION_EXPIRED': error('representation'),
+  'PORTAL.TENANT_UNRESOLVED': error('none'),
+  'PORTAL.SESSION_TENANT_MISMATCH': error('reauth'),
+  'PORTAL.NOT_FOUND': error('entitlement_help'),
+  'PORTAL.ENTITLEMENT_REQUIRED': error('entitlement_help'),
+  'PORTAL.INELIGIBLE': error('ineligible'),
+  'PORTAL.SERVICE_UNAVAILABLE': error('service_unavailable'),
+  'PORTAL.SERVICE_PARTIALLY_AVAILABLE': warning,
+  'PORTAL.REQUEST_STATE_INVALID': error('reload'),
+  'PORTAL.REQUEST_DRAFT_EXISTS': error('existing_request'),
+  'PORTAL.REQUEST_ONE_PER_AIT': error('existing_request'),
+  'PORTAL.REQUEST_SIGNATURE_REQUIRED': error('none'),
+  'PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED': error('none'),
+  'PORTAL.REQUEST_OUT_OF_DEADLINE': warning,
+  'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED': error('none'),
+  'PORTAL.ATTACHMENT_INVALID': error('inline_fields'),
+  'PORTAL.ATTACHMENT_AGENCY_DOCUMENT': error('none'),
+  'PORTAL.WITHDRAWAL_AFTER_JUDGMENT': error('none'),
+  'PORTAL.DILIGENCE_NOT_OPEN': error('reload'),
+  'PORTAL.DILIGENCE_ASKS_AGENCY_DOCUMENT': error('support'),
+  'PORTAL.INDICATION_DRIVER_INVALID': error('inline_fields'),
+  'PORTAL.INDICATION_SECOND_SIGNATURE_PENDING': info,
+  'PORTAL.INDICATION_WINDOW_CLOSED': error('none'),
+  'PORTAL.DELEGATION_FAILED': warning,
+  'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY': error('reload'),
+  'PORTAL.EVALUATION_NOT_OFFERED': error('none'),
+  'PORTAL.PAYMENT_TIER_NOT_AVAILABLE': error('none'),
+  'PORTAL.PAYMENT_SNE_TIER_REQUIRES_ENROLLMENT': error('enrollment'),
+  'PORTAL.PAYMENT_WAIVER_ACK_REQUIRED': error('none'),
+  'PORTAL.PAYMENT_WAIVER_DISABLED': error('none'),
+  'PORTAL.PAYMENT_METHOD_UNAVAILABLE': error('none'),
+  'PORTAL.PAYMENT_ALREADY_PAID': error('none'),
+  'PORTAL.PAYMENT_PROVIDER_UNAVAILABLE': error('retry'),
+  'PORTAL.SNE_CONTACT_REQUIRED': error('inline_fields'),
+  'PORTAL.SNE_ALREADY_ENROLLED': error('none'),
+  'PORTAL.SNE_NOT_ENROLLED': error('enrollment'),
+  'PORTAL.SNE_UPSTREAM_UNAVAILABLE': error('retry'),
+  'PORTAL.CNH_NOT_FOUND': error('none'),
+  'PORTAL.CNH_NOT_VALID_FOR_DIGITAL': error('none'),
+  'PORTAL.CNH_CLEARANCE_PENDING': error('payment'),
+  'PORTAL.CRLV_BLOCKED_BY_DEBT': error('payment'),
+  'PORTAL.CRLV_BLOCKED_BY_RESTRICTION': error('none'),
+  'PORTAL.CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING': info,
+  'PORTAL.NATIONAL_READ_UNAVAILABLE': error('retry'),
+  'PORTAL.CRASH_NOT_FINAL': error('none'),
+  'PORTAL.CRASH_THIRD_PARTY_DATA_RESTRICTED': info,
+  'PORTAL.EXAM_PROCESSING': info,
+  'PORTAL.BOARD_REQUEST_WINDOW_CLOSED': error('none'),
+  'PORTAL.MANIFESTATION_KIND_INVALID': error('inline_fields'),
+  'PORTAL.MANIFESTATION_STATE_INVALID': error('reload'),
+  'PORTAL.MANIFESTATION_NEVER_REFUSED': error('support'),
+  'PORTAL.EVALUATION_ALREADY_SUBMITTED': error('none'),
+  'PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE': error('elevation'),
+  'PORTAL.PRIVACY_NO_DATA': info,
+  'PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED': error('none'),
+  'PORTAL.VALIDATION_FAILED': error('inline_fields'),
+  'PORTAL.ENUM_INVALID': error('inline_fields'),
+  'PORTAL.IF_MATCH_REQUIRED': error('reload'),
+  'PORTAL.VERSION_CONFLICT': error('reload'),
+  'PORTAL.RATE_LIMITED': error('retry'),
+  'PORTAL.INTERNAL': error('support'),
+};
+
+const KNOWN_CODES: ReadonlySet<string> = new Set(PORTAL_ERROR_CODES);
+
+export function isPortalErrorCode(value: unknown): value is PortalErrorCode {
+  return typeof value === 'string' && KNOWN_CODES.has(value);
 }

 /** `PORTAL.REQUEST_OUT_OF_DEADLINE` → `portal.errors.request_out_of_deadline`. */
@@ -33,22 +285,187 @@ function isPortalErrorBody(value: unknown): value is PortalErrorBody {
   );
 }

+/** Forma mínima de uma resposta HTTP de erro (`HttpErrorResponse` ou equivalente estrutural). */
+interface HttpErrorLike {
+  readonly status: number;
+  readonly error?: unknown;
+}
+
+function isHttpErrorLike(value: unknown): value is HttpErrorLike {
+  return (
+    value instanceof HttpErrorResponse ||
+    (typeof value === 'object' &&
+      value !== null &&
+      typeof (value as { status?: unknown }).status === 'number')
+  );
+}
+
 /** Extrai o corpo de erro do domínio `portal`, se a resposta o carrega. */
 export function portalErrorBody(error: unknown): PortalErrorBody | null {
-  if (error instanceof HttpErrorResponse && isPortalErrorBody(error.error)) {
+  if (isHttpErrorLike(error) && isPortalErrorBody(error.error)) {
     return error.error;
   }
   return null;
 }

+function stringList(value: unknown): readonly string[] {
+  return Array.isArray(value)
+    ? value.filter((item): item is string => typeof item === 'string')
+    : [];
+}
+
+function fieldsOf(
+  context: Readonly<Record<string, unknown>>,
+): readonly string[] {
+  const fields = stringList(context['fields']);
+  return fields.length > 0 ? fields : stringList(context['missing']);
+}
+
+function retryAfterOf(
+  context: Readonly<Record<string, unknown>>,
+): number | string | null {
+  const value = context['retryAfter'];
+  return typeof value === 'number' || typeof value === 'string' ? value : null;
+}
+
 export function classifyError(error: unknown): ClassifiedError {
   const body = portalErrorBody(error);
-  const status = error instanceof HttpErrorResponse ? error.status : 0;
-  if (!body) return { code: null, status, messageKey: null };
+  const status = isHttpErrorLike(error) ? error.status : 0;
+  if (!body) {
+    return {
+      code: null,
+      status,
+      messageKey: null,
+      context: {},
+      fields: [],
+      retryAfter: null,
+    };
+  }
+  const context: Readonly<Record<string, unknown>> =
+    typeof body.context === 'object' && body.context !== null
+      ? body.context
+      : {};
+  const serverKey = body.messageKey;
+  const messageKey =
+    serverKey && serverKey.startsWith(`${PORTAL_ERRORS_NAMESPACE}.`)
+      ? serverKey
+      : messageKeyFor(body.code);
   return {
     code: body.code,
     status: body.status || status,
-    messageKey: body.messageKey ?? messageKeyFor(body.code),
+    messageKey,
     requestId: body.requestId,
+    context,
+    fields: fieldsOf(context),
+    retryAfter: retryAfterOf(context),
+  };
+}
+
+const urlSerializer = new DefaultUrlSerializer();
+
+/** UrlTree serializada de `path` com `queryParams` (mesma codificação do `Router`). */
+function routeWith(path: string, queryParams: Params): string {
+  const tree = urlSerializer.parse(path);
+  tree.queryParams = queryParams;
+  return urlSerializer.serialize(tree);
+}
+
+function stringOf(value: unknown): string | null {
+  return typeof value === 'string' && value.length > 0 ? value : null;
+}
+
+function nextStepRouteFor(
+  nextStep: NextStep,
+  context: Readonly<Record<string, unknown>>,
+  options: PresentErrorOptions,
+): string | null {
+  switch (nextStep) {
+    case 'login':
+    case 'reauth':
+      return options.resumeRoute
+        ? routeWith(LOGIN_ROUTE, { [RESUME_QUERY_PARAM]: options.resumeRoute })
+        : LOGIN_ROUTE;
+    case 'elevation':
+      return options.resumeRoute
+        ? routeWith(ELEVATION_ROUTE, {
+            [RESUME_QUERY_PARAM]: options.resumeRoute,
+          })
+        : ELEVATION_ROUTE;
+    case 'entitlement_help':
+      return options.entitlement
+        ? routeWith(ENTITLEMENT_MISSING_ROUTE, {
+            recurso: options.entitlement.kind,
+            id: options.entitlement.id,
+          })
+        : ENTITLEMENT_MISSING_ROUTE;
+    case 'service_unavailable': {
+      const serviceKey = options.serviceKey ?? stringOf(context['serviceKey']);
+      return serviceKey
+        ? `${SERVICE_UNAVAILABLE_ROUTE}/${encodeURIComponent(serviceKey)}`
+        : null;
+    }
+    case 'existing_request': {
+      const requestId = stringOf(context['requestId']);
+      return requestId
+        ? `${PROCESS_ROUTE}/${encodeURIComponent(requestId)}`
+        : null;
+    }
+    case 'payment':
+      return stringOf(context['paymentRoute']);
+    case 'enrollment':
+      return ENROLLMENT_ROUTE;
+    case 'representation':
+      return ACCOUNT_ROUTE;
+    default:
+      return null;
+  }
+}
+
+/** Apresentação de um erro fora do catálogo (400/422 sem `code`, rede, offline). */
+function genericPresentation(classified: ClassifiedError): ErrorPresentation {
+  const offline =
+    classified.status === 0 &&
+    typeof navigator !== 'undefined' &&
+    navigator.onLine === false;
+  return {
+    code: null,
+    status: classified.status,
+    messageKey: offline ? OFFLINE_KEY : GENERIC_ERROR_KEY,
+    messageParams: {},
+    severity: 'error',
+    nextStep: 'retry',
+    nextStepRoute: null,
+    alternativeChannel: true,
+    fields: classified.fields,
+    retryAfter: classified.retryAfter,
+    context: classified.context,
+    requestId: classified.requestId ?? null,
+  };
+}
+
+export function presentError(
+  error: unknown,
+  options: PresentErrorOptions = {},
+): ErrorPresentation {
+  const classified = classifyError(error);
+  if (!isPortalErrorCode(classified.code)) {
+    return genericPresentation(classified);
+  }
+  const rule = ERROR_PRESENTATION[classified.code];
+  return {
+    code: classified.code,
+    status: classified.status,
+    messageKey: classified.messageKey ?? messageKeyFor(classified.code),
+    messageParams: classified.requestId
+      ? { requestId: classified.requestId }
+      : {},
+    severity: rule.severity,
+    nextStep: rule.nextStep,
+    nextStepRoute: nextStepRouteFor(rule.nextStep, classified.context, options),
+    alternativeChannel: rule.alternativeChannel,
+    fields: classified.fields,
+    retryAfter: classified.retryAfter,
+    context: classified.context,
+    requestId: classified.requestId ?? null,
   };
 }
diff --git a/apps/portal/web/src/app/core/field-errors.directive.ts b/apps/portal/web/src/app/core/field-errors.directive.ts
new file mode 100644
index 0000000..8a66ebc
--- /dev/null
+++ b/apps/portal/web/src/app/core/field-errors.directive.ts
@@ -0,0 +1,51 @@
+// PortalFieldErrorsDirective (contrato CTG-0003a §3.4; catálogo §8 "400 com fields[]"): na tag
+// `<form>`, marca cada controle `[name]` cujo nome está em `fields[]` com `aria-invalid="true"` e
+// `aria-describedby="<name>-error"` (o elemento `id="<name>-error"` é do template do formulário e
+// mostra `portal.errors.validation_failed` até existirem mensagens por campo — OD-P62); remove os
+// atributos quando o campo sai da lista; ao passar de vazio para não vazio, foca o PRIMEIRO campo
+// inválido na ordem do DOM. Nomes de campo em inglês, como no corpo do ato (`driver.cpf`).
+import {
+  Directive,
+  ElementRef,
+  afterRenderEffect,
+  inject,
+  input,
+  untracked,
+} from '@angular/core';
+
+@Directive({ selector: 'form[portalFieldErrors]' })
+export class PortalFieldErrorsDirective {
+  private readonly form = inject<ElementRef<HTMLFormElement>>(ElementRef);
+  private previousFields: readonly string[] = [];
+
+  /** `fields[]` do erro 400/422 (nomes dos campos como no corpo do ato). */
+  readonly portalFieldErrors = input.required<readonly string[]>();
+
+  constructor() {
+    afterRenderEffect(() => {
+      const fields = this.portalFieldErrors();
+      untracked(() => this.apply(fields));
+    });
+  }
+
+  private apply(fields: readonly string[]): void {
+    const invalid = new Set(fields);
+    const controls = Array.from(
+      this.form.nativeElement.querySelectorAll<HTMLElement>('[name]'),
+    );
+    let first: HTMLElement | null = null;
+    for (const control of controls) {
+      const name = control.getAttribute('name') ?? '';
+      if (invalid.has(name)) {
+        control.setAttribute('aria-invalid', 'true');
+        control.setAttribute('aria-describedby', `${name}-error`);
+        first ??= control;
+      } else {
+        control.removeAttribute('aria-invalid');
+        control.removeAttribute('aria-describedby');
+      }
+    }
+    if (this.previousFields.length === 0 && fields.length > 0) first?.focus();
+    this.previousFields = fields;
+  }
+}
diff --git a/apps/portal/web/src/app/core/offline-document.store.ts b/apps/portal/web/src/app/core/offline-document.store.ts
index 6778bc9..7748350 100644
--- a/apps/portal/web/src/app/core/offline-document.store.ts
+++ b/apps/portal/web/src/app/core/offline-document.store.ts
@@ -2,9 +2,12 @@
 // CRLV-e com validade — os únicos conteúdos offline do Portal ([UC-PORTAL-011] AC-4). Cifra com
 // AES-GCM (`crypto.subtle`) e chave derivada (HKDF) do `sid` da sessão STYNX, mantida só em
 // memória e nunca persistida; o texto cifrado fica em `sessionStorage` (morre com a aba, como a
-// chave). Sem `sid` (sessão inativa) nada é gravado nem lido. Testes no CTG-0003.
+// chave). Sem `sid` (sessão inativa) nada é gravado nem lido. Contrato testável: CTG-0003a §7
+// (validade devolvida pelo servidor, nunca calculada; `now` vem do `PortalClock`; `clear()` no
+// logout pela `PortalSessionFacade`).
 import { Injectable, inject } from '@angular/core';
 import { StynxSessionService } from '@stynx-nyx/angular-auth';
+import { PortalClock } from './clock';

 export type OfflineDocumentKind = 'cnh-e' | 'crlv-e';

@@ -50,6 +53,7 @@ function fromBase64(text: string): Uint8Array<ArrayBuffer> {
 @Injectable({ providedIn: 'root' })
 export class OfflineDocumentStore {
   private readonly session = inject(StynxSessionService);
+  private readonly clock = inject(PortalClock);
   private readonly encoder = new TextEncoder();
   private readonly decoder = new TextDecoder();
   private keyCache: { sid: string; key: Promise<CryptoKey> } | null = null;
@@ -84,10 +88,14 @@ export class OfflineDocumentStore {
     store.setItem(this.storageKey(kind), JSON.stringify(envelope));
   }

-  /** Devolve o documento se existir, decifrar e ainda estiver dentro da validade. */
+  /**
+   * Devolve o documento se existir, decifrar e ainda estiver dentro da validade
+   * (`validUntil > now`; a validade é a devolvida pelo servidor). Entrada vencida, cifrada com
+   * outro `sid` ou corrompida é removida e devolve `null`.
+   */
   async get<T = unknown>(
     kind: OfflineDocumentKind,
-    now: Date = new Date(),
+    now: Date = this.clock.now(),
   ): Promise<OfflineDocument<T> | null> {
     const key = await this.sessionKey();
     const store = storage();
diff --git a/apps/portal/web/src/app/core/resume.service.ts b/apps/portal/web/src/app/core/resume.service.ts
index f606b24..4eb368e 100644
--- a/apps/portal/web/src/app/core/resume.service.ts
+++ b/apps/portal/web/src/app/core/resume.service.ts
@@ -1,7 +1,8 @@
 // ResumeService (portal-frontends.md §5.1; [UC-PORTAL-019] AC-4): guarda a rota e o rascunho ao
 // redirecionar para a elevação de nível e retoma onde parou. Estado em memória espelhado em
 // `sessionStorage` (sobrevive ao redirect OIDC, morre com a aba); nunca `localStorage` (spec §1
-// "Estado"). `resume()` é de uso único: devolve e limpa.
+// "Estado"). `resume()` é de uso único: devolve e limpa; `peek()` lê sem consumir ([DIVERGE-4]):
+// o callback OIDC só precisa da rota, e o `ServiceWizard.resumeFrom` consome o ponto.
 import { Injectable } from '@angular/core';

 export interface ResumePoint {
@@ -32,8 +33,13 @@ export class ResumeService {
     }
   }

+  /** Devolve o ponto sem limpá-lo (leitura não consumidora, [DIVERGE-4]). */
+  peek(): ResumePoint | null {
+    return this.point ?? this.read();
+  }
+
   resume(): ResumePoint | null {
-    const point = this.point ?? this.read();
+    const point = this.peek();
     this.clear();
     return point;
   }
diff --git a/apps/portal/web/src/app/core/session.facade.ts b/apps/portal/web/src/app/core/session.facade.ts
index c255124..0a4edfe 100644
--- a/apps/portal/web/src/app/core/session.facade.ts
+++ b/apps/portal/web/src/app/core/session.facade.ts
@@ -1,10 +1,12 @@
-// SessionFacade (portal-frontends.md §5.1; plan.md M8): sessão gov.br via `StynxSessionService`
-// + `GET /v1/portal/identity/me`. Nível de assinatura vem da claim assinada `assurance_level`
-// (`state().claims`) e do `me` (portal-route-contract.md §1.3) — nunca de corpo nem de tabela no
-// cliente. A matriz ato → nível é `actRequirements[]` do `me` (§3).
+// SessionFacade (portal-frontends.md §5.1; plan.md M8; contrato CTG-0003a §4): sessão gov.br via
+// `StynxSessionService` + `GET /v1/portal/identity/me`. Nível de assinatura vem da claim assinada
+// `assurance_level` (`state().claims`) e do `me` (portal-route-contract.md §1.3) — nunca de corpo
+// nem de tabela no cliente. A matriz ato → nível é `actRequirements[]` do `me` (§3):
+// `canPerform(actKey)` é fail-closed (ato desconhecido → false).
 //
-// `SessionFacade` é o token de injeção (classe abstrata: só os quatro signals, substituível por
-// `useValue` nos testes — detran-ui-guide.md §5); `PortalSessionFacade` é a implementação.
+// `SessionFacade` é o token de injeção (classe abstrata, substituível por `useValue` nos testes —
+// detran-ui-guide.md §5); `PortalSessionFacade` é a implementação. A navegação para o
+// `redirectUrl` da elevação é do componente chamador: a facade não toca em `window.location`.
 import {
   Injectable,
   type Signal,
@@ -15,6 +17,10 @@ import {
 } from '@angular/core';
 import { StynxSessionService } from '@stynx-nyx/angular-auth';
 import { PortalClient, type CitizenAccount } from '../data/portal.client';
+import type { ElevationStarted } from '../data/portal-command.models';
+import { classifyError, type ClassifiedError } from './error-boundary';
+import { OfflineDocumentStore } from './offline-document.store';
+import { ResumeService } from './resume.service';

 export type AssuranceLevel = 'simples' | 'avancada' | 'qualificada';

@@ -29,45 +35,84 @@ export function isAssuranceLevel(value: unknown): value is AssuranceLevel {
   return value === 'simples' || value === 'avancada' || value === 'qualificada';
 }

+/** Caminhos de verificação da elevação (OpenAPI; [UC-PORTAL-019] fluxo 3). */
+export type ElevationMethod = 'biographic' | 'biometric' | 'icp';
+
 /**
  * Requisito de nível por ato — modelo de visão de `me.actRequirements[]`
  * (`{ actKey, minimumAssurance, allowed, reason? }`): `act` = `actKey`,
- * `level` = `minimumAssurance`.
+ * `level` = `minimumAssurance`; `allowed` obrigatório ([DIVERGE-16]).
  */
 export interface ActRequirement {
   readonly act: string;
   readonly level: AssuranceLevel | 'none';
-  readonly allowed?: boolean;
+  readonly allowed: boolean;
   readonly reason?: string;
 }

 /** Representação ativa (procuração) — modelo de visão de `me.representations[]`. */
 export interface Representation {
-  readonly label: string;
   readonly id?: string;
-  readonly representedCpf?: string;
+  readonly label: string;
   readonly scope?: 'ait' | 'all';
   readonly validUntil?: string | null;
 }

+export interface ElevationRequest {
+  /** Teto [RN-PORTAL-101]. */
+  readonly targetLevel: 'avancada';
+  readonly method: ElevationMethod;
+  /** Rota do app (`state.url`), ex.: `/autos/<aitId>/defesa/nova`. */
+  readonly resumeRoute: string;
+  /** `WizardResumeDraft` (§5.4) ou `null`. */
+  readonly draft?: unknown;
+}
+
 @Injectable({
   providedIn: 'root',
   useFactory: () => inject(PortalSessionFacade),
 })
 export abstract class SessionFacade {
   abstract readonly active: Signal<boolean>;
+  /** `GET me` cru (titular sem máscara, invariante 4). */
+  abstract readonly account: Signal<CitizenAccount | null>;
+  /** `me.assuranceLevel`, senão a claim `assurance_level`. */
   abstract readonly assuranceLevel: Signal<AssuranceLevel | null>;
   abstract readonly actRequirements: Signal<readonly ActRequirement[]>;
+  abstract readonly representations: Signal<readonly Representation[]>;
+  /** `null` até OD-P48. */
   abstract readonly representation: Signal<Representation | null>;
+  abstract readonly loading: Signal<boolean>;
+  abstract readonly loadError: Signal<ClassifiedError | null>;
+  /** `GET /v1/portal/identity/me`; nunca lança — falha vai para `loadError`. */
+  abstract load(): Promise<void>;
+  abstract requirementFor(actKey: string): ActRequirement | null;
+  /** `requirementFor(actKey)?.allowed === true`; ato desconhecido → `false` (fail-closed). */
+  abstract canPerform(actKey: string): boolean;
+  /** `ResumeService.save({ route, draft })` ANTES do POST; devolve `redirectUrl` + `resumeToken`. */
+  abstract requestElevation(input: ElevationRequest): Promise<ElevationStarted>;
+  /** POST …/elevations/{id}/complete { resumeToken } e depois `load()`; não consome o ResumePoint. */
+  abstract completeElevation(
+    elevationId: string,
+    resumeToken: string,
+  ): Promise<void>;
 }

 @Injectable({ providedIn: 'root' })
 export class PortalSessionFacade extends SessionFacade {
   private readonly stynx = inject(StynxSessionService);
   private readonly client = inject(PortalClient);
-  private readonly account = signal<CitizenAccount | null>(null);
+  private readonly resumeService = inject(ResumeService);
+  private readonly offlineStore = inject(OfflineDocumentStore);
+  private readonly accountState = signal<CitizenAccount | null>(null);
+  private readonly loadingState = signal(false);
+  private readonly loadErrorState = signal<ClassifiedError | null>(null);
+  private lastLoadFailure: unknown = null;

   readonly active = this.stynx.active;
+  readonly account = this.accountState.asReadonly();
+  readonly loading = this.loadingState.asReadonly();
+  readonly loadError = this.loadErrorState.asReadonly();

   /** Nível da claim assinada do access token STYNX (`assurance_level`). */
   readonly claimAssuranceLevel = computed<AssuranceLevel | null>(() => {
@@ -77,27 +122,29 @@ export class PortalSessionFacade extends SessionFacade {

   readonly assuranceLevel = computed<AssuranceLevel | null>(() => {
     if (!this.active()) return null;
-    const fromMe = this.account()?.assuranceLevel;
+    const fromMe = this.accountState()?.assuranceLevel;
     return isAssuranceLevel(fromMe) ? fromMe : this.claimAssuranceLevel();
   });

   readonly actRequirements = computed<readonly ActRequirement[]>(() =>
-    (this.account()?.actRequirements ?? []).map((requirement) => ({
+    (this.accountState()?.actRequirements ?? []).map((requirement) => ({
       act: requirement.actKey,
       level: requirement.minimumAssurance,
-      allowed: requirement.allowed,
-      reason: requirement.reason,
+      allowed: requirement.allowed === true,
+      ...(requirement.reason !== undefined
+        ? { reason: requirement.reason }
+        : {}),
     })),
   );

   /**
-   * Representação ativa: `null` até que a seleção da representação (tela `/conta`, spec §4)
+   * Representação ativa: `null` até que a seleção da representação (tela `/conta`, OD-P48)
    * exista — nenhuma fonte define qual das `me.representations[]` é a ativa por padrão.
    */
   readonly representation = signal<Representation | null>(null).asReadonly();

   readonly representations = computed<readonly Representation[]>(() =>
-    (this.account()?.representations ?? []).map((item) => ({
+    (this.accountState()?.representations ?? []).map((item) => ({
       id: item.id,
       label: item.representedName ?? '',
       scope: item.scope,
@@ -107,21 +154,75 @@ export class PortalSessionFacade extends SessionFacade {

   constructor() {
     super();
+    // Sessão ativa → carrega o `me`; inativa (logout) → conta e cache offline zerados. O
+    // `ResumeService` não é limpo: precisa sobreviver ao redirecionamento OIDC (§4).
     effect(() => {
       if (this.active()) {
-        void this.loadAccount();
+        void this.load();
       } else {
-        this.account.set(null);
+        this.accountState.set(null);
+        this.offlineStore.clear();
       }
     });
   }

-  /** Recarrega `GET /v1/portal/identity/me` (após elevação de nível, por exemplo). */
-  async loadAccount(): Promise<void> {
+  /** `GET /v1/portal/identity/me`; nunca lança — a falha classificada fica em `loadError()`. */
+  async load(): Promise<void> {
+    this.loadingState.set(true);
     try {
-      this.account.set(await this.client.me());
-    } catch {
-      this.account.set(null);
+      this.accountState.set(await this.client.me());
+      this.loadErrorState.set(null);
+      this.lastLoadFailure = null;
+    } catch (failure: unknown) {
+      this.accountState.set(null);
+      this.lastLoadFailure = failure;
+      this.loadErrorState.set(classifyError(failure));
+    } finally {
+      this.loadingState.set(false);
     }
   }
+
+  requirementFor(actKey: string): ActRequirement | null {
+    return (
+      this.actRequirements().find(
+        (requirement) => requirement.act === actKey,
+      ) ?? null
+    );
+  }
+
+  canPerform(actKey: string): boolean {
+    return this.requirementFor(actKey)?.allowed === true;
+  }
+
+  async requestElevation(input: ElevationRequest): Promise<ElevationStarted> {
+    // O ponto de retomada é gravado ANTES do POST: se a elevação falhar, nada se perde
+    // ([UC-PORTAL-019] 3a).
+    this.resumeService.save({
+      route: input.resumeRoute,
+      draft: input.draft ?? null,
+    });
+    const subjectId = await this.subjectId();
+    const result = await this.client.elevateAssurance(subjectId, {
+      targetLevel: input.targetLevel,
+      method: input.method,
+      resumeRoute: input.resumeRoute,
+    });
+    return result.body;
+  }
+
+  async completeElevation(
+    elevationId: string,
+    resumeToken: string,
+  ): Promise<void> {
+    await this.client.completeElevation(elevationId, { resumeToken });
+    await this.load();
+  }
+
+  /** `<alvo>` da chave de idempotência da elevação (§2.2): `me.subjectId`. */
+  private async subjectId(): Promise<string> {
+    if (!this.accountState()) await this.load();
+    const subjectId = this.accountState()?.subjectId;
+    if (!subjectId) throw this.lastLoadFailure;
+    return subjectId;
+  }
 }
diff --git a/apps/portal/web/src/app/data/idempotency-key.ts b/apps/portal/web/src/app/data/idempotency-key.ts
new file mode 100644
index 0000000..d6b8111
--- /dev/null
+++ b/apps/portal/web/src/app/data/idempotency-key.ts
@@ -0,0 +1,70 @@
+// Idempotency-Key determinística (plan.md M17, transcrita em CTG-0003a §2.2): forma
+// `<ato>:<alvo>:<fingerprint>`, com `<fingerprint>` = SHA-256 (hex minúsculo, 64 caracteres) do
+// corpo JSON canonicalizado — chaves em ordem de código de unidade, recursivo; arrays na ordem
+// dada; `undefined` (e funções) omitidos como em `JSON.stringify`; `null` mantido; sem espaços;
+// UTF-8 — calculado no cliente com `crypto.subtle`. Mesmo corpo → mesma chave.
+
+function serialize(value: unknown): string | undefined {
+  if (value === null) return 'null';
+  switch (typeof value) {
+    case 'string':
+    case 'number':
+    case 'boolean':
+      return JSON.stringify(value);
+    case 'bigint':
+      throw new TypeError('canonicalJson: bigint não é serializável');
+    case 'object':
+      break;
+    default:
+      // undefined, function, symbol: omitidos como em JSON.stringify.
+      return undefined;
+  }
+  const candidate = value as { toJSON?: unknown };
+  if (typeof candidate.toJSON === 'function') {
+    return serialize((candidate.toJSON as () => unknown)());
+  }
+  if (Array.isArray(value)) {
+    return `[${value.map((item) => serialize(item) ?? 'null').join(',')}]`;
+  }
+  const record = value as Record<string, unknown>;
+  const entries: string[] = [];
+  for (const key of Object.keys(record).sort()) {
+    const text = serialize(record[key]);
+    if (text !== undefined) entries.push(`${JSON.stringify(key)}:${text}`);
+  }
+  return `{${entries.join(',')}}`;
+}
+
+/** JSON canônico (M17): objetos com chaves ordenadas recursivamente, sem espaços. */
+export function canonicalJson(value: unknown): string {
+  return serialize(value) ?? '';
+}
+
+function toBytes(input: string | ArrayBuffer | Uint8Array): Uint8Array {
+  if (typeof input === 'string') return new TextEncoder().encode(input);
+  if (input instanceof Uint8Array) return input;
+  return new Uint8Array(input);
+}
+
+/** SHA-256 via `crypto.subtle.digest` sobre UTF-8 (string) ou bytes; hex minúsculo, 64 chars. */
+export async function sha256Hex(
+  input: string | ArrayBuffer | Uint8Array,
+): Promise<string> {
+  const bytes = toBytes(input);
+  const digest = await crypto.subtle.digest(
+    'SHA-256',
+    bytes as Uint8Array<ArrayBuffer>,
+  );
+  return Array.from(new Uint8Array(digest), (byte) =>
+    byte.toString(16).padStart(2, '0'),
+  ).join('');
+}
+
+/** `${act}:${target}:${sha256Hex(canonicalJson(body))}`. */
+export async function idempotencyKey(
+  act: string,
+  target: string,
+  body: unknown,
+): Promise<string> {
+  return `${act}:${target}:${await sha256Hex(canonicalJson(body))}`;
+}
diff --git a/apps/portal/web/src/app/data/portal-command.models.ts b/apps/portal/web/src/app/data/portal-command.models.ts
new file mode 100644
index 0000000..dadf015
--- /dev/null
+++ b/apps/portal/web/src/app/data/portal-command.models.ts
@@ -0,0 +1,44 @@
+// Resultado de comando e formas 2xx que o OpenAPI gerado ainda não declara (contrato CTG-0003a
+// §2.3; [DIVERGE-3]/OD-P59). As formas abaixo são PROPOSTAS derivadas do texto de
+// `portal-route-contract.md` §3/§5 — os campos marcados `source_pending` não têm fonte fechada;
+// enquanto o backend responde `422 PORTAL.SERVICE_UNAVAILABLE`, a UI mostra o estado
+// indisponível e nunca simula resultado (M15).
+
+export interface CommandResult<T> {
+  readonly body: T;
+  /** Cabeçalho `ETag` da resposta, tal como recebido (`"<version>"`, com aspas), ou `null`. */
+  readonly etag: string | null;
+}
+
+/** `"<version>"` — forma do ETag do contrato (OpenAPI: `ETag: "<version>"`). */
+export function etagOf(version: number): string {
+  return `"${version}"`;
+}
+
+export interface AttachmentUploadIntent {
+  readonly attachmentId: string; // source_pending: nome do campo
+  readonly uploadUrl: string; // "URL assinada" (§5)
+  readonly method: 'PUT'; // source_pending
+  readonly headers: Readonly<Record<string, string>>; // source_pending
+  readonly expiresAt: string | null; // source_pending
+}
+
+export interface AttachmentCompleted {
+  readonly attachmentId: string;
+  readonly sha256: string; // "anexo com hash" (§5)
+}
+
+export interface DiligenceResponded {
+  readonly requestId: string;
+  readonly version: number; // source_pending ("status muda na hora", §5)
+}
+
+export interface ElevationStarted {
+  readonly redirectUrl: string; // §3
+  readonly resumeToken: string; // §3
+  readonly elevationId: string; // source_pending: `{id}` de …/elevations/{id}/complete ([DIVERGE-14])
+}
+
+export interface ElevationCompleted {
+  readonly assuranceLevel: 'simples' | 'avancada' | 'qualificada'; // "nível atualizado a partir da claim" (§3)
+}
diff --git a/apps/portal/web/src/app/data/portal.client.ts b/apps/portal/web/src/app/data/portal.client.ts
index aa9ac0a..59970ac 100644
--- a/apps/portal/web/src/app/data/portal.client.ts
+++ b/apps/portal/web/src/app/data/portal.client.ts
@@ -1,15 +1,39 @@
-// Camada de dados do Portal (plan.md M13): wrapper tipado pelos contratos gerados em
-// `@detran/api-clients` (`BP-PORTAL-*.commands`, ADR-0007: nunca editados) sobre o `HttpClient`
-// que `provideStynxDefaults` configura (interceptors de auth, request-id, tenant e erro). O
-// browser só fala com `/v1/portal/*` (ADR-0003; portal-route-contract.md §1). Só leituras nesta
-// entrega; comandos (`If-Match` do `ETag`, `Idempotency-Key` determinística) chegam com os
-// módulos de feature (CTG-0003).
-import { HttpClient } from '@angular/common/http';
-import { Injectable, inject } from '@angular/core';
-import type { BpPortalIdentity001Commands } from '@detran/api-clients';
-import { firstValueFrom } from 'rxjs';
+// Camada de dados do Portal (plan.md M13; contrato CTG-0003a §2): wrapper tipado pelos contratos
+// gerados em `@detran/api-clients` (`BP-PORTAL-*.commands`, ADR-0007: nunca editados) sobre o
+// `HttpClient` que `provideStynxDefaults` configura (interceptors de auth, request-id, tenant e
+// erro). O browser só fala com `/v1/portal/*` (ADR-0003; portal-route-contract.md §1) — única
+// exceção: o `PUT` na URL assinada do storage ([DIVERGE-17]), por `fetch` puro, sem bearer.
+// Comandos: `If-Match` sempre do `ETag` lido (nunca inventado; `null` omite o cabeçalho e o
+// servidor responde 428) e `Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>` (M17,
+// §2.2), recalculada a cada chamada. Nenhum método captura erros: a promessa rejeita com o
+// `HttpErrorResponse` original e o chamador classifica com `presentError` (§3).
+import {
+  HttpClient,
+  HttpErrorResponse,
+  HttpHeaders,
+  type HttpResponse,
+} from '@angular/common/http';
+import { Injectable, Injector, inject } from '@angular/core';
+import type {
+  BpPortalIdentity001Commands,
+  BpPortalRequests001Commands,
+} from '@detran/api-clients';
+import { firstValueFrom, type Observable } from 'rxjs';
+import { idempotencyKey } from './idempotency-key';
+import type {
+  AttachmentCompleted,
+  AttachmentUploadIntent,
+  CommandResult,
+  DiligenceResponded,
+  ElevationCompleted,
+  ElevationStarted,
+} from './portal-command.models';

 type IdentityPaths = BpPortalIdentity001Commands.paths;
+type RequestsOps = BpPortalRequests001Commands.operations;
+type RequestsSchemas = BpPortalRequests001Commands.components['schemas'];
+type IdentityOps = BpPortalIdentity001Commands.operations;
+type IdentitySchemas = BpPortalIdentity001Commands.components['schemas'];

 export const PORTAL_API_PREFIX = '/v1/portal';

@@ -23,11 +47,17 @@ type JsonOf<
   ? Body
   : never;

+type ResponseJson<Op, Status extends number> = Op extends {
+  responses: Record<Status, { content: { 'application/json': infer Body } }>;
+}
+  ? Body
+  : never;
+
 /** `GET /v1/portal/brand` — marca do tenant resolvido pelo `Host` (rota pública). */
 export type BrandProfile = JsonOf<'/v1/portal/brand', 'get', 200>;

 /** `GET /v1/portal/identity/me` — conta do cidadão e requisitos de nível por ato. */
-export type CitizenAccount = JsonOf<'/v1/portal/identity/me', 'get', 200>;
+export type CitizenAccount = ResponseJson<IdentityOps['portalMeGet'], 200>;

 /** `GET /v1/portal/services` — Carta de Serviços (rota pública). */
 export type ServiceCatalogItem = JsonOf<
@@ -36,6 +66,38 @@ export type ServiceCatalogItem = JsonOf<
   200
 >[number];

+// Corpos de comando (§2.1; `import type` dos contratos gerados).
+export type RequestCreateBody = RequestsSchemas['RequestCreateDto'];
+export type RequestDraftBody = RequestsSchemas['RequestDraftUpdateDto'];
+export type AttachmentIntentBody =
+  RequestsSchemas['RequestAttachmentCreateDto'];
+export type RequestSubmitBody = RequestsSchemas['RequestSubmitDto'];
+export type RequestWithdrawBody = RequestsSchemas['RequestWithdrawDto'];
+export type DiligenceResponseBody =
+  RequestsSchemas['RequestDiligenceRespondDto'];
+export type ElevationCreateBody =
+  IdentitySchemas['AssuranceElevationCreateDto'];
+export type ElevationCompleteBody =
+  IdentitySchemas['AssuranceElevationCompleteDto'];
+
+// Respostas 2xx declaradas no OpenAPI (§2.1).
+export type RequestCreated = ResponseJson<
+  RequestsOps['portalRequestCreate'],
+  201
+>;
+export type DraftSaved = ResponseJson<
+  RequestsOps['portalRequestDraftUpdate'],
+  200
+>;
+export type RequestSubmitted = ResponseJson<
+  RequestsOps['portalRequestSubmit'],
+  200
+>;
+export type RequestWithdrawn = ResponseJson<
+  RequestsOps['portalRequestWithdraw'],
+  200
+>;
+
 /** Corpo de erro padronizado do domínio `portal` (`portal-error-catalog.md`). */
 export interface PortalErrorBody {
   readonly code: string;
@@ -59,9 +121,57 @@ const ENTITLEMENT_RESOURCE: Record<EntitlementKind, (id: string) => string> = {
   manifestation: (id) => `/manifestations/${id}`,
 };

+/** `<alvo>` da chave quando o ato não tem alvo (`targetKind: 'none'`; [DIVERGE-5], A6(b)). */
+const NO_TARGET = 'none';
+
+const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
+const IF_MATCH_HEADER = 'If-Match';
+
+function isJsonBlob(value: unknown): value is Blob {
+  return (
+    typeof Blob !== 'undefined' &&
+    value instanceof Blob &&
+    /^application\/([a-z0-9.+-]+\+)?json\b/i.test(value.type)
+  );
+}
+
+/**
+ * Erro HTTP de uma requisição `responseType: 'blob'` cujo corpo é JSON → `HttpErrorResponse`
+ * equivalente com `error` já decodificado (mesmos status, headers e url). Corpo não-JSON ou
+ * ilegível → o erro original.
+ */
+async function decodeBlobError(error: unknown): Promise<unknown> {
+  if (!(error instanceof HttpErrorResponse) || !isJsonBlob(error.error)) {
+    return error;
+  }
+  let body: unknown;
+  try {
+    body = JSON.parse(await error.error.text());
+  } catch {
+    return error;
+  }
+  return new HttpErrorResponse({
+    error: body,
+    headers: error.headers,
+    status: error.status,
+    statusText: error.statusText,
+    url: error.url ?? undefined,
+  });
+}
+
 @Injectable({ providedIn: 'root' })
 export class PortalClient {
-  private readonly http = inject(HttpClient);
+  private readonly injector = inject(Injector);
+  private httpClient: HttpClient | null = null;
+
+  /**
+   * `HttpClient` resolvido na primeira requisição: componentes só de apresentação (banner de
+   * erro, nota de canal alternativo) chegam ao cliente pela `BrandService` sem nunca requisitar.
+   */
+  private get http(): HttpClient {
+    this.httpClient ??= this.injector.get(HttpClient);
+    return this.httpClient;
+  }

   brand(): Promise<BrandProfile> {
     return this.get<BrandProfile>('/brand');
@@ -82,7 +192,215 @@ export class PortalClient {
     );
   }

+  /** POST /v1/portal/requests — Idempotency-Key `<serviceKey>:<targetId|none>:<fp>`. */
+  async createRequest(
+    body: RequestCreateBody,
+  ): Promise<CommandResult<RequestCreated>> {
+    const key = await idempotencyKey(
+      body.serviceKey,
+      body.targetId ?? NO_TARGET,
+      body,
+    );
+    return this.command<RequestCreated>((headers) =>
+      this.http.post<RequestCreated>(this.url('/requests'), body, {
+        headers,
+        observe: 'response',
+      }),
+    )(key, null);
+  }
+
+  /** PUT /v1/portal/requests/{id}/draft — If-Match + Idempotency-Key `<serviceKey>:<requestId>:<fp>`. */
+  async saveDraft(
+    requestId: string,
+    serviceKey: string,
+    body: RequestDraftBody,
+    ifMatch: string | null,
+  ): Promise<CommandResult<DraftSaved>> {
+    const key = await idempotencyKey(serviceKey, requestId, body);
+    return this.command<DraftSaved>((headers) =>
+      this.http.put<DraftSaved>(
+        this.url(`/requests/${encodeURIComponent(requestId)}/draft`),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, ifMatch);
+  }
+
+  /** POST /v1/portal/requests/{id}/attachments — intenção → URL assinada (OD-P59). */
+  async requestAttachmentUpload(
+    requestId: string,
+    intent: AttachmentIntentBody,
+  ): Promise<CommandResult<AttachmentUploadIntent>> {
+    const key = await idempotencyKey('attachment', requestId, intent);
+    return this.command<AttachmentUploadIntent>((headers) =>
+      this.http.post<AttachmentUploadIntent>(
+        this.url(`/requests/${encodeURIComponent(requestId)}/attachments`),
+        intent,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /**
+   * PUT na URL assinada (fora de `/v1/portal/*`; [DIVERGE-17]): `fetch` puro, sem os
+   * interceptors STYNX, sem `Authorization` e com `credentials: 'omit'` — o bearer nunca vai ao
+   * storage. Resposta não-2xx rejeita com `HttpErrorResponse` (sem `code`: apresentação genérica).
+   */
+  async uploadToSignedUrl(
+    intent: AttachmentUploadIntent,
+    file: Blob,
+  ): Promise<void> {
+    const response = await fetch(intent.uploadUrl, {
+      method: intent.method,
+      headers: { ...intent.headers },
+      body: file,
+      credentials: 'omit',
+    });
+    if (!response.ok) {
+      throw new HttpErrorResponse({
+        status: response.status,
+        statusText: response.statusText,
+        url: intent.uploadUrl,
+      });
+    }
+  }
+
+  /** POST /v1/portal/requests/{id}/attachments/{attachmentId}/complete (sem corpo). */
+  async completeAttachment(
+    requestId: string,
+    attachmentId: string,
+  ): Promise<CommandResult<AttachmentCompleted>> {
+    const body = {};
+    const key = await idempotencyKey('attachment_complete', attachmentId, body);
+    return this.command<AttachmentCompleted>((headers) =>
+      this.http.post<AttachmentCompleted>(
+        this.url(
+          `/requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}/complete`,
+        ),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /** POST /v1/portal/requests/{id}/submit — Idempotency-Key `<serviceKey>:<targetId|requestId>:<fp>`. */
+  async submitRequest(
+    requestId: string,
+    serviceKey: string,
+    targetId: string | null,
+    body: RequestSubmitBody,
+  ): Promise<CommandResult<RequestSubmitted>> {
+    const key = await idempotencyKey(serviceKey, targetId ?? requestId, body);
+    return this.command<RequestSubmitted>((headers) =>
+      this.http.post<RequestSubmitted>(
+        this.url(`/requests/${encodeURIComponent(requestId)}/submit`),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /** POST /v1/portal/requests/{id}/withdraw — If-Match + Idempotency-Key `withdraw:<requestId>:<fp>`. */
+  async withdrawRequest(
+    requestId: string,
+    body: RequestWithdrawBody,
+    ifMatch: string | null,
+  ): Promise<CommandResult<RequestWithdrawn>> {
+    const key = await idempotencyKey('withdraw', requestId, body);
+    return this.command<RequestWithdrawn>((headers) =>
+      this.http.post<RequestWithdrawn>(
+        this.url(`/requests/${encodeURIComponent(requestId)}/withdraw`),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, ifMatch);
+  }
+
+  /** POST /v1/portal/requests/{id}/diligences/{did}/responses — `respond_diligence:<did>:<fp>`. */
+  async respondDiligence(
+    requestId: string,
+    diligenceId: string,
+    body: DiligenceResponseBody,
+  ): Promise<CommandResult<DiligenceResponded>> {
+    const key = await idempotencyKey('respond_diligence', diligenceId, body);
+    return this.command<DiligenceResponded>((headers) =>
+      this.http.post<DiligenceResponded>(
+        this.url(
+          `/requests/${encodeURIComponent(requestId)}/diligences/${encodeURIComponent(diligenceId)}/responses`,
+        ),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /** POST /v1/portal/identity/assurance/elevations — `elevation:<subjectId>:<fp>`. */
+  async elevateAssurance(
+    subjectId: string,
+    body: ElevationCreateBody,
+  ): Promise<CommandResult<ElevationStarted>> {
+    const key = await idempotencyKey('elevation', subjectId, body);
+    return this.command<ElevationStarted>((headers) =>
+      this.http.post<ElevationStarted>(
+        this.url('/identity/assurance/elevations'),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /** POST /v1/portal/identity/assurance/elevations/{id}/complete — `elevation_complete:<id>:<fp>`. */
+  async completeElevation(
+    elevationId: string,
+    body: ElevationCompleteBody,
+  ): Promise<CommandResult<ElevationCompleted>> {
+    const key = await idempotencyKey('elevation_complete', elevationId, body);
+    return this.command<ElevationCompleted>((headers) =>
+      this.http.post<ElevationCompleted>(
+        this.url(
+          `/identity/assurance/elevations/${encodeURIComponent(elevationId)}/complete`,
+        ),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /**
+   * GET /v1/portal/requests/{id}/receipt — PDF assinado (ADR-0018); exige sessão. Com
+   * `responseType: 'blob'` o corpo de erro também chega como `Blob`: quando é JSON, é decodificado
+   * para que o `ErrorBoundary` leia o `code` do catálogo; caso contrário o erro sobe intacto.
+   */
+  async downloadReceipt(requestId: string): Promise<Blob> {
+    try {
+      return await firstValueFrom(
+        this.http.get(
+          this.url(`/requests/${encodeURIComponent(requestId)}/receipt`),
+          { responseType: 'blob' },
+        ),
+      );
+    } catch (error: unknown) {
+      throw await decodeBlobError(error);
+    }
+  }
+
+  private url(path: string): string {
+    return `${PORTAL_API_PREFIX}${path}`;
+  }
+
   private get<T>(path: string): Promise<T> {
-    return firstValueFrom(this.http.get<T>(`${PORTAL_API_PREFIX}${path}`));
+    return firstValueFrom(this.http.get<T>(this.url(path)));
+  }
+
+  /** Monta os cabeçalhos do comando e lê o `ETag` da resposta (`observe: 'response'`). */
+  private command<T>(
+    send: (headers: HttpHeaders) => Observable<HttpResponse<T>>,
+  ): (key: string, ifMatch: string | null) => Promise<CommandResult<T>> {
+    return async (key, ifMatch) => {
+      let headers = new HttpHeaders({ [IDEMPOTENCY_KEY_HEADER]: key });
+      if (ifMatch !== null) headers = headers.set(IF_MATCH_HEADER, ifMatch);
+      const response = await firstValueFrom(send(headers));
+      return { body: response.body as T, etag: response.headers.get('ETag') };
+    };
   }
 }
diff --git a/apps/portal/web/src/app/forms/adesao-sne.schema.ts b/apps/portal/web/src/app/forms/adesao-sne.schema.ts
new file mode 100644
index 0000000..f727791
--- /dev/null
+++ b/apps/portal/web/src/app/forms/adesao-sne.schema.ts
@@ -0,0 +1,40 @@
+// Adesão ao SNE (contrato CTG-0003a §6.2; schema JSON `adesao_sne`). E-mail e celular são
+// obrigatórios na submissão (spec §7; [DIVERGE-21]); `effectsAck` usa o enum do fio
+// ([DIVERGE-2], OD-P61) — os textos do diálogo seguem A5.
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const AdesaoSneSchema = z.strictObject({
+  email: z.email(),
+  phone: z.string().regex(/^\d{10,11}$/),
+  consent: z.strictObject({
+    textVersion: z.string().min(1),
+    effectsAck: z
+      .array(
+        z.enum([
+          'ciencia_ficta',
+          'canal_exclusivo',
+          'desconto_60',
+          'cancelamento',
+        ]),
+      )
+      .min(4),
+  }),
+});
+
+export type AdesaoSneBody = z.infer<typeof AdesaoSneSchema>;
+
+export const ADESAO_SNE_GATE: FormGate = {
+  serviceKey: 'adesao_sne',
+  actKey: 'adesao_sne',
+  minimumAssurance: 'simples',
+  precondition: {
+    state: null,
+    timer: null,
+    note: 'contato obrigatório (sem e-mail/celular bloqueia)',
+    violation: 'PORTAL.SNE_CONTACT_REQUIRED',
+    warning: null,
+  },
+  command: 'submit',
+  effect: 'SnePort.enrollCitizen → ADERIDO_SNE',
+};
diff --git a/apps/portal/web/src/app/forms/attachments.ts b/apps/portal/web/src/app/forms/attachments.ts
new file mode 100644
index 0000000..eaf286b
--- /dev/null
+++ b/apps/portal/web/src/app/forms/attachments.ts
@@ -0,0 +1,10 @@
+// Anexos (contrato CTG-0003a §6.3; spec §7 "PDF/JPEG/PNG ≤ 10 MB"). Ambos só orientam a
+// pré-checagem de forma no cliente: o servidor responde `ATTACHMENT_INVALID { allowed[], maxBytes }`
+// e esses valores prevalecem quando chegam. Convenção de bytes (10 · 1024 · 1024): OD-P66.
+export const ATTACHMENT_ACCEPT = [
+  'application/pdf',
+  'image/jpeg',
+  'image/png',
+] as const;
+
+export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
diff --git a/apps/portal/web/src/app/forms/avaliacao.schema.ts b/apps/portal/web/src/app/forms/avaliacao.schema.ts
new file mode 100644
index 0000000..f91e099
--- /dev/null
+++ b/apps/portal/web/src/app/forms/avaliacao.schema.ts
@@ -0,0 +1,32 @@
+// Avaliação do atendimento (contrato CTG-0003a §6.2; `RequestEvaluateDto`). Escala das notas:
+// source_pending (OD-P65) — só inteiros aqui.
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const AvaliacaoSchema = z.strictObject({
+  scores: z.strictObject({
+    satisfaction: z.number().int(),
+    quality: z.number().int(),
+    deadline: z.number().int(),
+    clarity: z.number().int(),
+    channel: z.number().int(),
+  }),
+  comment: z.string().optional(),
+});
+
+export type AvaliacaoBody = z.infer<typeof AvaliacaoSchema>;
+
+export const AVALIACAO_GATE: FormGate = {
+  serviceKey: 'avaliar',
+  actKey: 'avaliar',
+  minimumAssurance: 'simples',
+  precondition: {
+    state: 'RESULTADO_DISPONIVEL | ENCERRADA',
+    timer: null,
+    note: 'após RESULTADO_DISPONIVEL/ENCERRADA',
+    violation: 'PORTAL.EVALUATION_NOT_OFFERED',
+    warning: null,
+  },
+  command: 'evaluate',
+  effect: 'AVALIADA; alimenta citizen-service',
+};
diff --git a/apps/portal/web/src/app/forms/defesa-previa.schema.ts b/apps/portal/web/src/app/forms/defesa-previa.schema.ts
new file mode 100644
index 0000000..4db1f2c
--- /dev/null
+++ b/apps/portal/web/src/app/forms/defesa-previa.schema.ts
@@ -0,0 +1,28 @@
+// Defesa prévia (contrato CTG-0003a §6.2; espelho de portal-request-draft.schema.json
+// `defesa_previa` e de `RequestDraftUpdateDto`). Validação de forma só orienta (M12).
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const DefesaPreviaSchema = z.strictObject({
+  facts: z.string().min(1),
+  grounds: z.string().min(1),
+  attachmentIds: z.array(z.uuid()),
+  requestType: z.enum(['cancelamento', 'outro']),
+});
+
+export type DefesaPreviaBody = z.infer<typeof DefesaPreviaSchema>;
+
+export const DEFESA_PREVIA_GATE: FormGate = {
+  serviceKey: 'defesa_previa',
+  actKey: 'defesa_previa',
+  minimumAssurance: 'avancada',
+  precondition: {
+    state: 'NOTIFICADO_AUTUACAO',
+    timer: 'T-DEF',
+    note: 'AIT em NOTIFICADO_AUTUACAO com T-DEF aberto (fora do prazo: protocola e avisa)',
+    violation: null,
+    warning: 'PORTAL.REQUEST_OUT_OF_DEADLINE',
+  },
+  command: 'submit',
+  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=defesa_previa)',
+};
diff --git a/apps/portal/web/src/app/forms/desistencia.schema.ts b/apps/portal/web/src/app/forms/desistencia.schema.ts
new file mode 100644
index 0000000..1fb5b57
--- /dev/null
+++ b/apps/portal/web/src/app/forms/desistencia.schema.ts
@@ -0,0 +1,27 @@
+// Desistência (contrato CTG-0003a §6.2; `RequestWithdrawDto`). Nível `simples` pelo manifesto
+// #17 (OD-P52).
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const DesistenciaSchema = z.strictObject({
+  confirm: z.literal(true),
+  reason: z.string().optional(),
+});
+
+export type DesistenciaBody = z.infer<typeof DesistenciaSchema>;
+
+export const DESISTENCIA_GATE: FormGate = {
+  serviceKey: null,
+  actKey: null,
+  minimumAssurance: 'simples',
+  precondition: {
+    state: null,
+    timer: null,
+    note: 'forma escrita · antes do julgamento (pautado hoje bloqueia)',
+    violation: 'PORTAL.WITHDRAWAL_AFTER_JUDGMENT',
+    warning: null,
+  },
+  command: 'withdraw',
+  effect:
+    'DESISTIDO (antes do protocolo) | inf:rait-case:withdraw → ENCERRADO_DESISTENCIA',
+};
diff --git a/apps/portal/web/src/app/forms/elevacao.schema.ts b/apps/portal/web/src/app/forms/elevacao.schema.ts
new file mode 100644
index 0000000..6c353a0
--- /dev/null
+++ b/apps/portal/web/src/app/forms/elevacao.schema.ts
@@ -0,0 +1,26 @@
+// Elevação de nível (contrato CTG-0003a §6.2; `AssuranceElevationCreateDto`; T27 §6).
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const ElevacaoSchema = z.strictObject({
+  targetLevel: z.literal('avancada'),
+  method: z.enum(['biographic', 'biometric', 'icp']),
+  resumeRoute: z.string().min(1),
+});
+
+export type ElevacaoBody = z.infer<typeof ElevacaoSchema>;
+
+export const ELEVACAO_GATE: FormGate = {
+  serviceKey: null,
+  actKey: null,
+  minimumAssurance: 'simples',
+  precondition: {
+    state: null,
+    timer: null,
+    note: 'redirect gov.br com resume; prazo legal não pausa (AC-4a)',
+    violation: null,
+    warning: null,
+  },
+  command: 'elevate',
+  effect: 'NIVEL_ASSINATURA_ELEVADO',
+};
diff --git a/apps/portal/web/src/app/forms/form-gate.ts b/apps/portal/web/src/app/forms/form-gate.ts
new file mode 100644
index 0000000..7364759
--- /dev/null
+++ b/apps/portal/web/src/app/forms/form-gate.ts
@@ -0,0 +1,48 @@
+// Tipos comuns dos schemas de formulário (plan.md M12; contrato CTG-0003a §6.1). Um `FormGate` é
+// documentação verificável: transcreve o nível mínimo, a pré-condição (estado/timer) e o comando
+// da spec §7 — NUNCA decide permissão (isso é `SessionFacade.canPerform` e o servidor) e nenhum
+// arquivo de `forms/` importa facade, guardas ou relógio.
+import { z } from 'zod';
+import type { PortalErrorCode } from '../core/error-boundary';
+
+export type GateCommand =
+  | 'submit' // POST requests/{id}/submit (ciclo comum)
+  | 'withdraw' // POST requests/{id}/withdraw
+  | 'respond_diligence' // POST requests/{id}/diligences/{did}/responses
+  | 'elevate' // POST identity/assurance/elevations
+  | 'update_preferences' // PUT identity/preferences (par 3)
+  | 'manifest' // POST manifestations (par 3)
+  | 'evaluate'; // POST evaluations | POST requests/{id}/evaluation (par 3)
+
+export interface GatePrecondition {
+  /** Token de estado da spec §7 (ex.: 'NOTIFICADO_AUTUACAO', 'open'). */
+  readonly state: string | null;
+  /** Código de timer da spec §7 (ex.: 'T-DEF'); avaliado SÓ no servidor. */
+  readonly timer: string | null;
+  /** Texto da coluna "Gate" da spec §7, literal. */
+  readonly note: string;
+  /** Erro que o servidor devolve quando falha. */
+  readonly violation: PortalErrorCode | null;
+  /** Aviso quando "protocola e avisa". */
+  readonly warning: PortalErrorCode | null;
+}
+
+export interface FormGate {
+  readonly serviceKey: string | null;
+  /** Chave em `me.actRequirements[]` (null: ato sem linha própria). */
+  readonly actKey: string | null;
+  /** Transcrição; NUNCA usada para permitir/negar. */
+  readonly minimumAssurance: 'none' | 'simples' | 'avancada';
+  readonly precondition: GatePrecondition;
+  readonly command: GateCommand;
+  /** Estado resultante / delegação, literal da spec §7 ou contrato §5.1. */
+  readonly effect: string;
+}
+
+/** `{ textVersion, acceptedAt }` (ISO 8601 com fuso, como as fixtures) — compartilhado. */
+export const ConsequenceAckSchema = z.strictObject({
+  textVersion: z.string().min(1),
+  acceptedAt: z.iso.datetime({ offset: true }),
+});
+
+export type ConsequenceAckBody = z.infer<typeof ConsequenceAckSchema>;
diff --git a/apps/portal/web/src/app/forms/indicacao-condutor.schema.ts b/apps/portal/web/src/app/forms/indicacao-condutor.schema.ts
new file mode 100644
index 0000000..12d8207
--- /dev/null
+++ b/apps/portal/web/src/app/forms/indicacao-condutor.schema.ts
@@ -0,0 +1,54 @@
+// Indicação de condutor (contrato CTG-0003a §6.2; schema JSON `indicacao_condutor`). O CPF passa
+// pela validação pública de dígitos verificadores (módulo 11) — forma que só orienta; o servidor
+// decide (`PORTAL.INDICATION_DRIVER_INVALID { fields[] }`, T05 §5).
+import { z } from 'zod';
+import { ConsequenceAckSchema, type FormGate } from './form-gate';
+
+/** Dígitos verificadores do CPF (módulo 11); sequências de um só dígito são inválidas. */
+export function cpfCheckDigits(cpf: string): boolean {
+  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
+  const digits = Array.from(cpf, Number);
+  const verifier = (length: number): number => {
+    const sum = digits
+      .slice(0, length)
+      .reduce((acc, digit, index) => acc + digit * (length + 1 - index), 0);
+    const rest = (sum * 10) % 11;
+    return rest === 10 ? 0 : rest;
+  };
+  return verifier(9) === digits[9] && verifier(10) === digits[10];
+}
+
+export const IndicacaoCondutorSchema = z.strictObject({
+  driver: z.strictObject({
+    cpf: z
+      .string()
+      .regex(/^\d{11}$/)
+      .refine(cpfCheckDigits),
+    cnhNumber: z.string().min(1),
+    cnhUf: z.string().length(2),
+    category: z.string().min(1),
+    name: z.string().min(1),
+  }),
+  signatures: z.strictObject({
+    owner: z.enum(['govbr', 'upload']),
+    driver: z.enum(['govbr', 'upload', 'pending']),
+  }),
+  consequenceAck: ConsequenceAckSchema,
+});
+
+export type IndicacaoCondutorBody = z.infer<typeof IndicacaoCondutorSchema>;
+
+export const INDICACAO_CONDUTOR_GATE: FormGate = {
+  serviceKey: 'indicacao_condutor',
+  actKey: 'indicacao_condutor',
+  minimumAssurance: 'avancada',
+  precondition: {
+    state: null,
+    timer: 'T-IND',
+    note: 'T-IND aberto',
+    violation: 'PORTAL.INDICATION_WINDOW_CLOSED',
+    warning: null,
+  },
+  command: 'submit',
+  effect: 'PROTOCOLADO → inf:infraction:indicate-driver',
+};
diff --git a/apps/portal/web/src/app/forms/junta-medica.schema.ts b/apps/portal/web/src/app/forms/junta-medica.schema.ts
new file mode 100644
index 0000000..d4d5f3c
--- /dev/null
+++ b/apps/portal/web/src/app/forms/junta-medica.schema.ts
@@ -0,0 +1,27 @@
+// Junta médica ou psicológica (contrato CTG-0003a §6.2; schema JSON `junta_medica`; OD-P19: fora
+// do catálogo desta rodada). Código do timer: source_pending.
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const JuntaMedicaSchema = z.strictObject({
+  examId: z.uuid(),
+  reason: z.string().min(1),
+  attachmentIds: z.array(z.uuid()),
+});
+
+export type JuntaMedicaBody = z.infer<typeof JuntaMedicaSchema>;
+
+export const JUNTA_MEDICA_GATE: FormGate = {
+  serviceKey: 'junta_medica',
+  actKey: 'junta_medica',
+  minimumAssurance: 'avancada',
+  precondition: {
+    state: null,
+    timer: null,
+    note: '30 dias do conhecimento',
+    violation: 'PORTAL.BOARD_REQUEST_WINDOW_CLOSED',
+    warning: null,
+  },
+  command: 'submit',
+  effect: 'delegação PEC (ch:...:request-board)',
+};
diff --git a/apps/portal/web/src/app/forms/manifestacao.schema.ts b/apps/portal/web/src/app/forms/manifestacao.schema.ts
new file mode 100644
index 0000000..0ed619f
--- /dev/null
+++ b/apps/portal/web/src/app/forms/manifestacao.schema.ts
@@ -0,0 +1,30 @@
+// Manifestação à ouvidoria (contrato CTG-0003a §6.2; contrato de rotas §8). O comando é do
+// par 3, que confere contra `BpPortalCitizenService001Commands`.
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const ManifestacaoSchema = z.strictObject({
+  kind: z.enum(['reclamacao', 'denuncia', 'sugestao', 'elogio', 'solicitacao']),
+  text: z.string().min(1),
+  confidential: z.boolean().optional(),
+  attachmentIds: z.array(z.uuid()),
+  anonymous: z.boolean().optional(),
+});
+
+export type ManifestacaoBody = z.infer<typeof ManifestacaoSchema>;
+
+export const MANIFESTACAO_GATE: FormGate = {
+  serviceKey: 'manifestar',
+  actKey: 'manifestar',
+  minimumAssurance: 'none',
+  precondition: {
+    state: null,
+    timer: null,
+    note: 'sem motivo determinante; anônimo admitido',
+    violation: null,
+    warning: null,
+  },
+  command: 'manifest',
+  effect:
+    'MANIFESTACAO_REGISTRADA → comprovante imediato { protocol, receivedAt }',
+};
diff --git a/apps/portal/web/src/app/forms/meus-dados.schema.ts b/apps/portal/web/src/app/forms/meus-dados.schema.ts
new file mode 100644
index 0000000..4ffb1ac
--- /dev/null
+++ b/apps/portal/web/src/app/forms/meus-dados.schema.ts
@@ -0,0 +1,31 @@
+// Meus dados / LGPD (contrato CTG-0003a §6.2; schema JSON `lgpd_declaracao`). Escopos avançados
+// têm actKey próprio (`lgpd_declaracao:declaracao_completa` etc.) via `canPerform`.
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const MeusDadosSchema = z.strictObject({
+  scope: z.enum([
+    'confirmacao',
+    'declaracao_completa',
+    'correcao',
+    'eliminacao',
+  ]),
+  fields: z.array(z.string()).optional(),
+});
+
+export type MeusDadosBody = z.infer<typeof MeusDadosSchema>;
+
+export const MEUS_DADOS_GATE: FormGate = {
+  serviceKey: 'lgpd_declaracao',
+  actKey: 'lgpd_declaracao',
+  minimumAssurance: 'simples',
+  precondition: {
+    state: null,
+    timer: null,
+    note: 'declaração completa exige avançada',
+    violation: 'PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE',
+    warning: null,
+  },
+  command: 'submit',
+  effect: '@stynx-nyx/privacy (/privacy/exports)',
+};
diff --git a/apps/portal/web/src/app/forms/pagamento.schema.ts b/apps/portal/web/src/app/forms/pagamento.schema.ts
new file mode 100644
index 0000000..32a8da0
--- /dev/null
+++ b/apps/portal/web/src/app/forms/pagamento.schema.ts
@@ -0,0 +1,41 @@
+// Pagamento (contrato CTG-0003a §6.2; schema JSON `pagamento`). A faixa `desconto_40_fora_sne`
+// exige `waiverAck` completo (declaração de reconhecimento + versão do texto, `renuncia_40`).
+import { z } from 'zod';
+import { ConsequenceAckSchema, type FormGate } from './form-gate';
+
+export const PagamentoSchema = z
+  .strictObject({
+    tier: z.enum([
+      'desconto_80',
+      'desconto_60_reconhecimento',
+      'desconto_40_fora_sne',
+      'integral_juros',
+    ]),
+    method: z.enum(['pix', 'debito', 'boleto', 'cartao']),
+    installments: z.number().int().min(1).optional(),
+    waiverAck: ConsequenceAckSchema.partial().optional(),
+  })
+  .refine(
+    (value) =>
+      value.tier !== 'desconto_40_fora_sne' ||
+      Boolean(value.waiverAck?.textVersion && value.waiverAck?.acceptedAt),
+    { path: ['waiverAck'] },
+  );
+
+export type PagamentoBody = z.infer<typeof PagamentoSchema>;
+
+export const PAGAMENTO_GATE: FormGate = {
+  serviceKey: 'pagamento',
+  actKey: 'pagamento',
+  minimumAssurance: 'simples',
+  precondition: {
+    state: null,
+    timer: null,
+    note: 'faixa disponível para a fase (80/60/40); 60% só com SNE; 40% exige declaracao_reconhecimento + versão do texto',
+    violation: 'PORTAL.PAYMENT_TIER_NOT_AVAILABLE',
+    warning: null,
+  },
+  command: 'submit',
+  effect:
+    'inf:collection:issue → { documentId, barcode | pixCopyPaste, amount, validUntil }',
+};
diff --git a/apps/portal/web/src/app/forms/preferencias.schema.ts b/apps/portal/web/src/app/forms/preferencias.schema.ts
new file mode 100644
index 0000000..00f2151
--- /dev/null
+++ b/apps/portal/web/src/app/forms/preferencias.schema.ts
@@ -0,0 +1,36 @@
+// Preferências de notificação (contrato CTG-0003a §6.2; `PreferencesUpdateDto`). O comando
+// (`PUT preferences`, If-Match) é do par 3.
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const PreferenciasSchema = z.strictObject({
+  channel: z.enum(['push', 'email', 'sne']),
+  pushSubscription: z
+    .strictObject({
+      endpoint: z.url().optional(),
+      keys: z
+        .strictObject({
+          p256dh: z.string().optional(),
+          auth: z.string().optional(),
+        })
+        .optional(),
+    })
+    .optional(),
+});
+
+export type PreferenciasBody = z.infer<typeof PreferenciasSchema>;
+
+export const PREFERENCIAS_GATE: FormGate = {
+  serviceKey: null,
+  actKey: null,
+  minimumAssurance: 'simples',
+  precondition: {
+    state: null,
+    timer: null,
+    note: '—',
+    violation: null,
+    warning: null,
+  },
+  command: 'update_preferences',
+  effect: '@stynx-nyx/preferences (PUT preferences, If-Match)',
+};
diff --git a/apps/portal/web/src/app/forms/recurso-cetran.schema.ts b/apps/portal/web/src/app/forms/recurso-cetran.schema.ts
new file mode 100644
index 0000000..14b3544
--- /dev/null
+++ b/apps/portal/web/src/app/forms/recurso-cetran.schema.ts
@@ -0,0 +1,25 @@
+// Recurso ao CETRAN (contrato CTG-0003a §6.2; schema JSON `recurso_cetran`). Só orienta (M12).
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const RecursoCetranSchema = z.strictObject({
+  additionalText: z.string().optional(),
+  attachmentIds: z.array(z.uuid()),
+});
+
+export type RecursoCetranBody = z.infer<typeof RecursoCetranSchema>;
+
+export const RECURSO_CETRAN_GATE: FormGate = {
+  serviceKey: 'recurso_cetran',
+  actKey: 'recurso_cetran',
+  minimumAssurance: 'avancada',
+  precondition: {
+    state: null,
+    timer: 'T-R2',
+    note: 'T-R2 aberto (vencido bloqueia com explicação)',
+    violation: 'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED',
+    warning: null,
+  },
+  command: 'submit',
+  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=cetran)',
+};
diff --git a/apps/portal/web/src/app/forms/recurso-jari.schema.ts b/apps/portal/web/src/app/forms/recurso-jari.schema.ts
new file mode 100644
index 0000000..b9f7e07
--- /dev/null
+++ b/apps/portal/web/src/app/forms/recurso-jari.schema.ts
@@ -0,0 +1,25 @@
+// Recurso à JARI (contrato CTG-0003a §6.2; schema JSON `recurso_jari`). Só orienta (M12).
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const RecursoJariSchema = z.strictObject({
+  grounds: z.string().min(1),
+  attachmentIds: z.array(z.uuid()),
+});
+
+export type RecursoJariBody = z.infer<typeof RecursoJariSchema>;
+
+export const RECURSO_JARI_GATE: FormGate = {
+  serviceKey: 'recurso_jari',
+  actKey: 'recurso_jari',
+  minimumAssurance: 'avancada',
+  precondition: {
+    state: null,
+    timer: 'T-NP-VENC',
+    note: 'NP com T-NP-VENC aberto (intempestivo: avisa sem efeito suspensivo)',
+    violation: null,
+    warning: 'PORTAL.REQUEST_OUT_OF_DEADLINE',
+  },
+  command: 'submit',
+  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=jari)',
+};
diff --git a/apps/portal/web/src/app/forms/resposta-diligencia.schema.ts b/apps/portal/web/src/app/forms/resposta-diligencia.schema.ts
new file mode 100644
index 0000000..f06fc0f
--- /dev/null
+++ b/apps/portal/web/src/app/forms/resposta-diligencia.schema.ts
@@ -0,0 +1,26 @@
+// Resposta a diligência (contrato CTG-0003a §6.2; `RequestDiligenceRespondDto`). Nível
+// `simples` pela spec §7/manifesto #16 ([DIVERGE-12], OD-P67).
+import { z } from 'zod';
+import type { FormGate } from './form-gate';
+
+export const RespostaDiligenciaSchema = z.strictObject({
+  text: z.string().min(1),
+  attachmentIds: z.array(z.uuid()),
+});
+
+export type RespostaDiligenciaBody = z.infer<typeof RespostaDiligenciaSchema>;
+
+export const RESPOSTA_DILIGENCIA_GATE: FormGate = {
+  serviceKey: null,
+  actKey: null,
+  minimumAssurance: 'simples',
+  precondition: {
+    state: 'open',
+    timer: null,
+    note: 'diligência open; prazo visível; prorrogação uma vez',
+    violation: 'PORTAL.DILIGENCE_NOT_OPEN',
+    warning: null,
+  },
+  command: 'respond_diligence',
+  effect: 'inf:rait-case:answer-inquiry',
+};
diff --git a/apps/portal/web/src/app/i18n/portal.pt-BR.json b/apps/portal/web/src/app/i18n/portal.pt-BR.json
index 72a86f0..406720f 100644
--- a/apps/portal/web/src/app/i18n/portal.pt-BR.json
+++ b/apps/portal/web/src/app/i18n/portal.pt-BR.json
@@ -35,12 +35,30 @@
   "portal.common.link.presencial": "Atendimento presencial",
   "portal.common.label.reason": "Motivo",
   "portal.common.label.alternative_channel": "Canal alternativo",
+  "portal.common.action.cancel": "Cancelar",
+  "portal.common.action.correct": "Corrigir",
+  "portal.common.action.remove": "Remover",
+  "portal.common.action.download": "Baixar",
+  "portal.common.action.continue": "Continuar",
+  "portal.common.link.suporte": "Suporte",
+  "portal.common.link.conta": "Conta",
+  "portal.common.step.elegibilidade": "Elegibilidade",
+  "portal.common.step.composicao": "Preenchimento",
+  "portal.common.step.assinatura": "Assinatura",
+  "portal.common.step.protocolo": "Protocolo",
+  "portal.common.toast.draft_saved": "Rascunho salvo",
+  "portal.common.receipt.number": "Número do protocolo",
+  "portal.common.receipt.issued_at": "Recebido em",
+  "portal.common.receipt.channel": "Canal",
+  "portal.common.receipt.download": "Baixar recibo",
+  "portal.common.deadline.days_left": "Faltam {daysLeft} dias",
   "portal.a11y.skip_link": "Ir para o conteúdo",
   "portal.a11y.nav_main": "Navegação principal",
   "portal.a11y.nav_footer": "Links institucionais",
   "portal.a11y.status_region": "Estado da página",
+  "portal.a11y.wizard_steps": "Etapas do seu pedido",
   "portal.documents.cnh.title": "Sua CNH digital",
-  "portal.documents.cnh.validity": "Válida até {{validUntil}}",
+  "portal.documents.cnh.validity": "Válida até {validUntil}",
   "portal.documents.cnh.qrVerifiable": "Verificável por QR Code",
   "portal.documents.cnh.offlineAvailable": "Disponível mesmo sem conexão",
   "portal.documents.cnh.notCopy": "Este é o documento oficial — uma foto de tela ou imagem exportada não vale como CNH",
@@ -48,8 +66,8 @@
   "portal.documents.crlv.qrVerifiable": "Verificável por QR Code",
   "portal.documents.crlv.offlineAvailable": "Disponível mesmo sem conexão",
   "portal.documents.crlv.notCopy": "Este é o documento oficial — uma foto de tela ou imagem exportada não vale como CRLV-e",
-  "portal.documents.consulta.consultedAt": "Consultado em {{consultedAt}}",
-  "portal.documents.consulta.source": "Fonte: {{source}}",
+  "portal.documents.consulta.consultedAt": "Consultado em {consultedAt}",
+  "portal.documents.consulta.source": "Fonte: {source}",
   "portal.documents.consulta.notDocument": "Esta é uma consulta informativa — não tem valor de documento",
   "portal.errors.auth_required": "Você precisa entrar com sua conta gov.br para continuar.",
   "portal.errors.identity_not_citizen": "Esta conta não acessa o Portal do cidadão.",
@@ -117,7 +135,7 @@
   "portal.errors.if_match_required": "Recarregue a página antes de tentar de novo.",
   "portal.errors.version_conflict": "Este registro mudou enquanto você editava. Recarregue e tente de novo.",
   "portal.errors.rate_limited": "Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.",
-  "portal.errors.internal": "Algo deu errado do nosso lado. Tente novamente; se persistir, informe o código {{requestId}} ao suporte.",
+  "portal.errors.internal": "Algo deu errado do nosso lado. Tente novamente; se persistir, informe o código {requestId} ao suporte.",
   "portal.evaluations.publicIndicator": "O resultado desta avaliação, consolidado com o de outras pessoas, é publicado no site do DETRAN-AM — sua resposta individual não é identificada.",
   "portal.forms.defesa_previa.fatos": "O que aconteceu",
   "portal.forms.defesa_previa.fundamentos": "Por que a multa deveria ser cancelada",
@@ -156,6 +174,11 @@
   "portal.forms.meus_dados.escopo": "O que você quer fazer",
   "portal.forms.meus_dados.hint_declaracao_completa": "A declaração completa exige um nível de identidade mais alto.",
   "portal.forms.elevacao.caminho": "Caminho de verificação",
+  "portal.forms.elevacao.caminho.biographic": "Validação biográfica ou documental",
+  "portal.forms.elevacao.caminho.biometric": "Validação biométrica",
+  "portal.forms.elevacao.caminho.icp": "Certificado ICP-Brasil",
+  "portal.forms.assinatura.method.govbr": "Assinar remotamente com gov.br",
+  "portal.forms.assinatura.method.upload": "Enviar documento já assinado",
   "portal.forms.junta_medica.motivo": "Motivo do pedido de junta",
   "portal.forms.junta_medica.hint": "O pedido precisa ser feito em até 30 dias do conhecimento do resultado.",
   "portal.legal.consequencias_desistencia.v1": "Desistir é definitivo para este requerimento. A multa (ou o processo, conforme a fase) segue seu curso normal, sem o benefício do pedido retirado. Sua confirmação equivale a uma assinatura eletrônica.",
@@ -276,18 +299,18 @@
   "portal.screens.t10.intro": "Veja o resultado e o que fazer a seguir.",
   "portal.screens.t10.empty": "Este processo ainda não tem decisão publicada.",
   "portal.screens.t10.cmd.baixar_documento": "Baixar decisão",
-  "portal.screens.t10.field.restituicao": "Você tem direito à restituição de {{amount}}, já atualizada.",
+  "portal.screens.t10.field.restituicao": "Você tem direito à restituição de {amount}, já atualizada.",
   "portal.screens.t11.title": "Responder pendência do seu processo",
   "portal.screens.t11.intro": "O órgão pediu um documento ou informação a mais. Veja o que falta e envie até o prazo.",
   "portal.screens.t11.empty": "Esta diligência não existe ou já foi respondida.",
   "portal.screens.t11.state.encerrada": "Esta pendência já foi respondida ou o prazo já passou — seu processo segue em análise.",
   "portal.screens.t11.cmd.enviar": "Enviar resposta",
-  "portal.screens.t11.field.prazo": "Envie até {{dueOn}}.",
+  "portal.screens.t11.field.prazo": "Envie até {dueOn}.",
   "portal.screens.t12.title": "Suas notificações",
   "portal.screens.t12.empty": "Você não tem notificações.",
   "portal.screens.t12.state.sem_tempo_real": "Não conseguimos atualizar em tempo real agora — mostrando o que já foi carregado.",
   "portal.screens.t12.cmd.marcar_lida": "Marcar como lida",
-  "portal.screens.t12.field.canal": "Recebido por {{source}}",
+  "portal.screens.t12.field.canal": "Recebido por {source}",
   "portal.screens.t13.title": "Pagar sua multa",
   "portal.screens.t13.intro": "Veja as opções de pagamento lado a lado antes de escolher.",
   "portal.screens.t13.cmd.pagar_80": "Pagar 80% e manter o direito de recorrer",
@@ -306,9 +329,9 @@
   "portal.screens.t16.state.nao_valida": "Sua CNH não está em situação de gerar o documento digital agora.",
   "portal.screens.t16.state.pendencia": "Há uma pendência de quitação antes de emitir.",
   "portal.screens.t16.cmd.baixar": "Baixar/exibir",
-  "portal.screens.t16.field.validade": "Válida até {{validUntil}}.",
+  "portal.screens.t16.field.validade": "Válida até {validUntil}.",
   "portal.screens.t17.title": "Meu veículo — CRLV-e",
-  "portal.screens.t17.state.pendencia": "Falta quitar {{amount}} antes de emitir o CRLV-e.",
+  "portal.screens.t17.state.pendencia": "Falta quitar {amount} antes de emitir o CRLV-e.",
   "portal.screens.t17.state.suspenso": "Esta multa está sob recurso e não bloqueia a emissão.",
   "portal.screens.t17.cmd.emitir": "Emitir CRLV-e",
   "portal.screens.t17.field.qr": "Verificável por QR Code",
@@ -476,5 +499,8 @@
   "portal.situation.deadline.agency": "prazo do órgão",
   "portal.situation.next_action.citizen": "Com você",
   "portal.situation.next_action.agency": "Com o órgão",
-  "portal.situation.next_action.none": "Nenhuma ação necessária"
+  "portal.situation.next_action.none": "Nenhuma ação necessária",
+  "portal.situation.assurance.simples": "Nível simples",
+  "portal.situation.assurance.avancada": "Nível avançado",
+  "portal.situation.assurance.qualificada": "Nível qualificado"
 }
diff --git a/apps/portal/web/src/app/shared/action-triplet.component.ts b/apps/portal/web/src/app/shared/action-triplet.component.ts
new file mode 100644
index 0000000..a0aed7a
--- /dev/null
+++ b/apps/portal/web/src/app/shared/action-triplet.component.ts
@@ -0,0 +1,110 @@
+// ActionTriplet (contrato CTG-0003a §5.3; T-01; [RN-PORTAL-127]): SEMPRE as três ações
+// (defender · indicar · pagar), nesta ordem e com o mesmo peso visual. Ação ausente de `actions[]`
+// ou `available: false` → `aria-disabled="true"`, sem navegação, `data-reason=<token>` (rótulo:
+// OD-P63). O nível insuficiente NÃO é decidido aqui: o clique navega e o `assuranceGuard` da rota
+// leva a T-27. `appeal_*` não são deste componente (T-07, par 2).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+
+export type AitActionKey =
+  'defend' | 'indicate_driver' | 'pay' | 'appeal_jari' | 'appeal_cetran';
+
+export interface AitAction {
+  readonly key: AitActionKey;
+  readonly available: boolean;
+  /** Token do servidor → `data-reason` (rótulo: OD-P63). */
+  readonly reason?: string;
+  readonly minimumAssurance: 'none' | 'simples' | 'avancada' | 'qualificada';
+}
+
+/** As três ações de T-01, na ordem: chave i18n e rota do manifesto (#10, #11, #12). */
+const TRIPLET: readonly {
+  readonly key: 'defend' | 'indicate_driver' | 'pay';
+  readonly labelKey: string;
+  readonly route: (aitId: string) => string;
+}[] = [
+  {
+    key: 'defend',
+    labelKey: 'portal.screens.t01.cmd.defend',
+    route: (aitId) => `/autos/${aitId}/defesa/nova`,
+  },
+  {
+    key: 'indicate_driver',
+    labelKey: 'portal.screens.t01.cmd.indicate',
+    route: (aitId) => `/autos/${aitId}/condutor/nova`,
+  },
+  {
+    key: 'pay',
+    labelKey: 'portal.screens.t01.cmd.pay',
+    route: (aitId) => `/autos/${aitId}/pagamento`,
+  },
+];
+
+interface TripletItem {
+  readonly key: 'defend' | 'indicate_driver' | 'pay';
+  readonly labelKey: string;
+  readonly route: string;
+  readonly available: boolean;
+  readonly reason: string;
+}
+
+@Component({
+  selector: 'portal-action-triplet',
+  imports: [RouterLink, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-ait-id]': 'aitId()' },
+  template: `
+    <nav class="portal-action-triplet">
+      <ul>
+        @for (item of items(); track item.key) {
+          <li>
+            @if (item.available) {
+              <a
+                [routerLink]="item.route"
+                [attr.data-action]="item.key"
+                (click)="selected.emit(item.key)"
+                >{{ item.labelKey | stynxTranslate }}</a
+              >
+            } @else {
+              <a
+                role="link"
+                tabindex="0"
+                aria-disabled="true"
+                [attr.data-action]="item.key"
+                [attr.data-reason]="item.reason"
+                >{{ item.labelKey | stynxTranslate }}</a
+              >
+            }
+          </li>
+        }
+      </ul>
+    </nav>
+  `,
+})
+export class ActionTripletComponent {
+  readonly aitId = input.required<string>();
+  readonly actions = input.required<readonly AitAction[]>();
+  readonly selected = output<AitActionKey>();
+
+  readonly items = computed<readonly TripletItem[]>(() => {
+    const aitId = this.aitId();
+    const actions = this.actions();
+    return TRIPLET.map((entry) => {
+      const action = actions.find((candidate) => candidate.key === entry.key);
+      return {
+        key: entry.key,
+        labelKey: entry.labelKey,
+        route: entry.route(aitId),
+        available: action?.available === true,
+        reason: action?.reason ?? '',
+      };
+    });
+  });
+}
diff --git a/apps/portal/web/src/app/shared/alternative-channel-note.component.ts b/apps/portal/web/src/app/shared/alternative-channel-note.component.ts
new file mode 100644
index 0000000..acdd1ab
--- /dev/null
+++ b/apps/portal/web/src/app/shared/alternative-channel-note.component.ts
@@ -0,0 +1,53 @@
+// AlternativeChannelNote (contrato CTG-0003a §5.10; [RN-PORTAL-105]; spec §2 invariante 6): o
+// canal presencial nunca desaparece — rótulo e link sempre renderizados (link sem `href` quando a
+// marca está `unavailable`), `note` do catálogo de serviços e `serviceContact` da marca quando
+// existem. Endereço e horário do atendimento presencial não têm fonte (OD-P57): nada é inventado.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  inject,
+  input,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { BrandService } from '../core/brand.service';
+
+@Component({
+  selector: 'portal-alternative-channel-note',
+  imports: [StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-service-key]': 'serviceKey()' },
+  template: `
+    <p class="portal-alternative-channel">
+      <strong>{{
+        'portal.common.label.alternative_channel' | stynxTranslate
+      }}</strong>
+      <a [attr.href]="supportUrl()" rel="noopener">{{
+        'portal.common.link.presencial' | stynxTranslate
+      }}</a>
+      @if (note(); as text) {
+        <span data-note>{{ text }}</span>
+      }
+      @if (serviceContact(); as contact) {
+        <span data-service-contact>{{ contact }}</span>
+      }
+    </p>
+  `,
+})
+export class AlternativeChannelNoteComponent {
+  private readonly brand = inject(BrandService);
+
+  /** `service_catalog.alternativeChannelNote` (texto cidadão do servidor). */
+  readonly note = input<string | null>(null);
+  readonly serviceKey = input<string | null>(null);
+
+  readonly supportUrl = computed<string | null>(() => {
+    const state = this.brand.state();
+    return state.status === 'available' ? (state.supportUrl ?? null) : null;
+  });
+
+  readonly serviceContact = computed<string | null>(() => {
+    const state = this.brand.state();
+    return state.status === 'available' ? (state.serviceContact ?? null) : null;
+  });
+}
diff --git a/apps/portal/web/src/app/shared/assurance-explainer.component.ts b/apps/portal/web/src/app/shared/assurance-explainer.component.ts
new file mode 100644
index 0000000..958c833
--- /dev/null
+++ b/apps/portal/web/src/app/shared/assurance-explainer.component.ts
@@ -0,0 +1,100 @@
+// AssuranceExplainer (contrato CTG-0003a §5.11; [UC-PORTAL-019] fluxo 3; spec §2 invariante 8):
+// explica qual nível falta (`required` × `current`) e oferece os três caminhos de verificação
+// como rádios sob a legenda `portal.forms.elevacao.caminho`. Nunca "acesso negado". Os níveis
+// exigido/atual são tokens do servidor: ficam em `data-required`/`data-current` e são traduzidos
+// por `portal.situation.assurance.<nível>`.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import type { AssuranceLevel, ElevationMethod } from '../core/session.facade';
+
+export const ELEVATION_METHODS: readonly ElevationMethod[] = [
+  'biographic',
+  'biometric',
+  'icp',
+];
+
+@Component({
+  selector: 'portal-assurance-explainer',
+  imports: [StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-required]': 'required()',
+    '[attr.data-current]': 'current()',
+    '[attr.data-act-key]': 'actKey()',
+  },
+  template: `
+    <section
+      class="portal-assurance-explainer"
+      role="region"
+      [attr.aria-labelledby]="titleId()"
+    >
+      <h3 [id]="titleId()" tabindex="-1">
+        {{ 'portal.states.permission_missing' | stynxTranslate }}
+      </h3>
+      <p>{{ 'portal.screens.t27.intro' | stynxTranslate }}</p>
+      <p>
+        <span>{{
+          'portal.screens.t27.field.nivel_faltante' | stynxTranslate
+        }}</span>
+        <strong data-required-level>{{
+          requiredLabelKey() | stynxTranslate
+        }}</strong>
+        @if (currentLabelKey(); as key) {
+          <span data-current-level>{{ key | stynxTranslate }}</span>
+        }
+      </p>
+      @if (methods().length > 0) {
+        <fieldset>
+          <legend>
+            {{ 'portal.forms.elevacao.caminho' | stynxTranslate }}
+          </legend>
+          @for (method of methods(); track method) {
+            <label>
+              <input
+                type="radio"
+                [name]="groupName()"
+                [value]="method"
+                (change)="methodSelected.emit(method)"
+              />
+              {{ methodLabelKey(method) | stynxTranslate }}
+            </label>
+          }
+        </fieldset>
+      } @else {
+        <p role="status">
+          {{ 'portal.screens.t27.state.sem_elegibilidade' | stynxTranslate }}
+        </p>
+      }
+    </section>
+  `,
+})
+export class AssuranceExplainerComponent {
+  readonly required = input.required<AssuranceLevel>();
+  readonly current = input.required<AssuranceLevel | null>();
+  readonly actKey = input.required<string>();
+  /** `context.elevationMethods[]` quando o erro os traz. */
+  readonly methods = input<readonly ElevationMethod[]>(ELEVATION_METHODS);
+  readonly methodSelected = output<ElevationMethod>();
+
+  readonly titleId = computed(
+    () => `portal-assurance-explainer-${this.actKey()}-title`,
+  );
+  readonly groupName = computed(() => `elevation-method-${this.actKey()}`);
+  readonly requiredLabelKey = computed(
+    () => `portal.situation.assurance.${this.required()}`,
+  );
+  readonly currentLabelKey = computed(() => {
+    const current = this.current();
+    return current ? `portal.situation.assurance.${current}` : null;
+  });
+
+  methodLabelKey(method: ElevationMethod): string {
+    return `portal.forms.elevacao.caminho.${method}`;
+  }
+}
diff --git a/apps/portal/web/src/app/shared/attachment-uploader.component.ts b/apps/portal/web/src/app/shared/attachment-uploader.component.ts
new file mode 100644
index 0000000..7f356d2
--- /dev/null
+++ b/apps/portal/web/src/app/shared/attachment-uploader.component.ts
@@ -0,0 +1,258 @@
+// AttachmentUploader (contrato CTG-0003a §5.6; [UC-PORTAL-001] AC-3/3a; ADR-0018; [RN-PORTAL-104],
+// [RN-PORTAL-106], [RN-PORTAL-107] regra 3). Por arquivo: pré-checagem de forma (`accept`,
+// `maxBytes` — só orientam; o servidor prevalece) → SHA-256 no cliente → intenção de upload →
+// `PUT` na URL assinada (fetch puro, sem bearer) → `complete` → `done`. Erros por arquivo
+// (`ATTACHMENT_INVALID`, `ATTACHMENT_AGENCY_DOCUMENT`) rejeitam SÓ aquele arquivo;
+// `422 SERVICE_UNAVAILABLE` torna o componente inteiro indisponível, com canal alternativo, sem
+// retry automático nem id simulado (M15). O checklist é o `requirements[]` do servidor — não
+// existe lista de tipos de anexo no cliente. Anexo assinado presume-se autêntico: nenhum campo de
+// reconhecimento de firma ([RN-PORTAL-104]).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  type Signal,
+  computed,
+  inject,
+  input,
+  model,
+  output,
+  signal,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../core/error-banner.component';
+import {
+  classifyError,
+  presentError,
+  type ErrorPresentation,
+} from '../core/error-boundary';
+import { sha256Hex } from '../data/idempotency-key';
+import { PortalClient } from '../data/portal.client';
+
+export type AttachmentStatus =
+  'hashing' | 'requesting' | 'uploading' | 'completing' | 'done' | 'rejected';
+
+export interface AttachmentEntry {
+  readonly localId: string;
+  readonly filename: string;
+  readonly mimeType: string;
+  readonly sizeBytes: number;
+  readonly sha256: string | null;
+  readonly attachmentId: string | null;
+  readonly status: AttachmentStatus;
+  readonly error: ErrorPresentation | null;
+}
+
+const ATTACHMENT_INVALID = 'PORTAL.ATTACHMENT_INVALID';
+const SERVICE_UNAVAILABLE = 'PORTAL.SERVICE_UNAVAILABLE';
+
+@Component({
+  selector: 'portal-attachment-uploader',
+  imports: [StynxTranslatePipe, PortalErrorBannerComponent],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <div class="portal-attachment-uploader">
+      @if (checklist().length > 0) {
+        <ul class="portal-attachment-checklist" data-checklist>
+          @for (item of checklist(); track $index) {
+            <li>{{ item }}</li>
+          }
+        </ul>
+      }
+      <p [id]="hintId()" class="portal-attachment-hint">
+        {{ hintKey() | stynxTranslate }}
+      </p>
+      @if (unavailable(); as failure) {
+        <portal-error-banner [error]="failure" />
+      } @else {
+        <input
+          type="file"
+          multiple
+          [accept]="acceptAttribute()"
+          [attr.aria-describedby]="hintId()"
+          [disabled]="disabled()"
+          (change)="onFilesSelected($event)"
+        />
+      }
+      @if (entries().length > 0) {
+        <ul class="portal-attachment-entries">
+          @for (entry of entries(); track entry.localId) {
+            <li
+              [attr.data-status]="entry.status"
+              [attr.data-attachment-id]="entry.attachmentId"
+            >
+              <span>{{ entry.filename }}</span>
+              @if (entry.error; as error) {
+                <portal-error-banner [error]="error" />
+              }
+              @if (entry.status === 'done' && entry.attachmentId) {
+                <button
+                  type="button"
+                  data-remove
+                  [disabled]="disabled()"
+                  (click)="remove(entry)"
+                >
+                  {{ 'portal.common.action.remove' | stynxTranslate }}
+                </button>
+              }
+            </li>
+          }
+        </ul>
+      }
+    </div>
+  `,
+})
+export class AttachmentUploaderComponent {
+  private readonly client = inject(PortalClient);
+  private readonly entriesState = signal<readonly AttachmentEntry[]>([]);
+  private readonly unavailableState = signal<ErrorPresentation | null>(null);
+  private sequence = 0;
+
+  readonly requestId = input.required<string>();
+  /** `forms/attachments.ts` `ATTACHMENT_ACCEPT`. */
+  readonly accept = input.required<readonly string[]>();
+  /** `ATTACHMENT_MAX_BYTES` (OD-P66). */
+  readonly maxBytes = input.required<number>();
+  /** `requirements[]` do servidor — nunca constante do cliente. */
+  readonly checklist = input<readonly string[]>([]);
+  /** `portal.forms.<form>.anexos_hint` | `.hint` | `.anexos`. */
+  readonly hintKey = input.required<string>();
+  readonly disabled = input(false);
+  readonly attachmentIds = model<readonly string[]>([]);
+  readonly entries: Signal<readonly AttachmentEntry[]> =
+    this.entriesState.asReadonly();
+  /** `422 SERVICE_UNAVAILABLE` do storage. */
+  readonly unavailable: Signal<ErrorPresentation | null> =
+    this.unavailableState.asReadonly();
+  readonly attached = output<AttachmentEntry>();
+  /** `attachmentId`. */
+  readonly removed = output<string>();
+
+  readonly acceptAttribute = computed(() => this.accept().join(','));
+  readonly hintId = computed(
+    () => `portal-attachment-hint-${this.requestId()}`,
+  );
+
+  onFilesSelected(event: Event): void {
+    const input = event.target as HTMLInputElement;
+    const files = Array.from(input.files ?? []);
+    for (const file of files) void this.add(file);
+    input.value = '';
+  }
+
+  remove(entry: AttachmentEntry): void {
+    const attachmentId = entry.attachmentId;
+    this.entriesState.update((entries) =>
+      entries.filter((item) => item.localId !== entry.localId),
+    );
+    if (attachmentId) {
+      this.attachmentIds.update((ids) =>
+        ids.filter((id) => id !== attachmentId),
+      );
+      this.removed.emit(attachmentId);
+    }
+  }
+
+  private async add(file: File): Promise<void> {
+    if (this.disabled() || this.unavailableState()) return;
+    this.sequence += 1;
+    const localId = `${this.requestId()}-${this.sequence}`;
+    let entry: AttachmentEntry = {
+      localId,
+      filename: file.name,
+      mimeType: file.type,
+      sizeBytes: file.size,
+      sha256: null,
+      attachmentId: null,
+      status: 'hashing',
+      error: null,
+    };
+    this.upsert(entry);
+    const rejection = this.shapeRejection(file);
+    if (rejection) {
+      this.upsert({ ...entry, status: 'rejected', error: rejection });
+      return;
+    }
+    try {
+      const sha256 = await sha256Hex(await file.arrayBuffer());
+      entry = { ...entry, sha256, status: 'requesting' };
+      this.upsert(entry);
+      const intent = await this.client.requestAttachmentUpload(
+        this.requestId(),
+        {
+          filename: file.name,
+          mimeType: file.type,
+          sizeBytes: file.size,
+          sha256,
+        },
+      );
+      entry = {
+        ...entry,
+        attachmentId: intent.body.attachmentId,
+        status: 'uploading',
+      };
+      this.upsert(entry);
+      await this.client.uploadToSignedUrl(intent.body, file);
+      entry = { ...entry, status: 'completing' };
+      this.upsert(entry);
+      const completed = await this.client.completeAttachment(
+        this.requestId(),
+        intent.body.attachmentId,
+      );
+      entry = {
+        ...entry,
+        attachmentId: completed.body.attachmentId,
+        sha256: completed.body.sha256 || sha256,
+        status: 'done',
+      };
+      this.upsert(entry);
+      this.attachmentIds.update((ids) =>
+        ids.includes(entry.attachmentId as string)
+          ? ids
+          : [...ids, entry.attachmentId as string],
+      );
+      this.attached.emit(entry);
+    } catch (error: unknown) {
+      this.fail(entry, error);
+    }
+  }
+
+  /** Pré-checagem de forma (accept/maxBytes): rejeição local sem requisição. */
+  private shapeRejection(file: File): ErrorPresentation | null {
+    const accepted = this.accept().includes(file.type);
+    const withinSize = file.size <= this.maxBytes();
+    if (accepted && withinSize) return null;
+    return presentError({
+      status: 400,
+      error: {
+        code: ATTACHMENT_INVALID,
+        status: 400,
+        message: ATTACHMENT_INVALID,
+        context: { allowed: [...this.accept()], maxBytes: this.maxBytes() },
+      },
+    });
+  }
+
+  /** Falha do servidor: por arquivo (rejeita só ele) ou do serviço inteiro (indisponível). */
+  private fail(entry: AttachmentEntry, error: unknown): void {
+    const presentation = presentError(error);
+    if (classifyError(error).code === SERVICE_UNAVAILABLE) {
+      this.unavailableState.set(presentation);
+      this.entriesState.update((entries) =>
+        entries.filter((item) => item.localId !== entry.localId),
+      );
+      return;
+    }
+    this.upsert({ ...entry, status: 'rejected', error: presentation });
+  }
+
+  private upsert(entry: AttachmentEntry): void {
+    this.entriesState.update((entries) => {
+      const index = entries.findIndex((item) => item.localId === entry.localId);
+      if (index < 0) return [...entries, entry];
+      const next = entries.slice();
+      next[index] = entry;
+      return next;
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/shared/citizen-status-badge.component.ts b/apps/portal/web/src/app/shared/citizen-status-badge.component.ts
new file mode 100644
index 0000000..884f8cd
--- /dev/null
+++ b/apps/portal/web/src/app/shared/citizen-status-badge.component.ts
@@ -0,0 +1,62 @@
+// CitizenStatusBadge (contrato CTG-0003a §5.1; [RN-PORTAL-112]; M9): tradução única do estado do
+// pedido — o token cru fica só em `data-token`; o texto é `portal.situation.badge.<situation>`.
+// `badgeOf` é a ÚNICA relação estado → badge e lê a subárvore `portal.situation.badge_of.<STATE>`
+// do catálogo importado; estado sem linha → `null` (OD-P56; [DIVERGE-18]) e o chamador mostra
+// `portal.situation.request.<STATE>` sem badge.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import portalCatalog from '../i18n/portal.pt-BR.json';
+
+export type BadgeSituation =
+  | 'em_analise'
+  | 'aguardando_decisao'
+  | 'em_diligencia'
+  | 'decidido'
+  | 'encerrado';
+
+export const BADGE_SITUATIONS: readonly BadgeSituation[] = [
+  'em_analise',
+  'aguardando_decisao',
+  'em_diligencia',
+  'decidido',
+  'encerrado',
+];
+
+const catalog = portalCatalog as Record<string, string>;
+
+function isBadgeSituation(value: unknown): value is BadgeSituation {
+  return (BADGE_SITUATIONS as readonly unknown[]).includes(value);
+}
+
+/** Lê `portal.situation.badge_of.<STATE>` do catálogo (M9); ausente → `null` (OD-P56). */
+export function badgeOf(state: string): BadgeSituation | null {
+  const situation = catalog[`portal.situation.badge_of.${state}`];
+  return isBadgeSituation(situation) ? situation : null;
+}
+
+@Component({
+  selector: 'portal-citizen-status-badge',
+  imports: [StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-token]': 'token()',
+    '[attr.data-situation]': 'situation()',
+  },
+  template: `<span class="portal-badge">{{
+    labelKey() | stynxTranslate
+  }}</span>`,
+})
+export class CitizenStatusBadgeComponent {
+  readonly situation = input.required<BadgeSituation>();
+  /** Estado interno cru (REQUEST_TRANSITIONS/RAIT), nunca visível. */
+  readonly token = input.required<string>();
+
+  readonly labelKey = computed(
+    () => `portal.situation.badge.${this.situation()}`,
+  );
+}
diff --git a/apps/portal/web/src/app/shared/consequence-dialog.component.ts b/apps/portal/web/src/app/shared/consequence-dialog.component.ts
new file mode 100644
index 0000000..7580768
--- /dev/null
+++ b/apps/portal/web/src/app/shared/consequence-dialog.component.ts
@@ -0,0 +1,209 @@
+// ConsequenceDialog (contrato CTG-0003a §5.7; spec §2 invariante 10; M9/A5): consequência ANTES
+// do ato — texto jurídico versionado `portal.legal.<document>.v1` (e, para `efeitos_sne`, os
+// quatro efeitos por nome), confirmação por escrito (checkbox obrigatório) e `confirmed` com
+// `{ textVersion: 'v1', acceptedAt: PortalClock.now() }`. Diálogo acessível: `role="dialog"`,
+// `aria-modal`, `aria-labelledby`, foco preso e devolvido a quem abriu, `Escape` cancela.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  input,
+  output,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalClock } from '../core/clock';
+
+export type LegalDocument =
+  | 'consequencias_desistencia'
+  | 'consequencias_indicacao'
+  | 'efeitos_sne'
+  | 'renuncia_40';
+
+/** M9: `<versão>` = v1. */
+export const LEGAL_TEXT_VERSION = 'v1';
+
+/** Os quatro efeitos de [RN-PORTAL-123] (A5), por nome. */
+export const SNE_EFFECTS = [
+  'ciencia_ficta',
+  'substituicao',
+  'responsabilidade',
+  'cancelamento',
+] as const;
+
+export interface ConsequenceAck {
+  readonly textVersion: string;
+  readonly acceptedAt: string;
+}
+
+const FOCUSABLE =
+  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
+
+@Component({
+  selector: 'portal-consequence-dialog',
+  imports: [StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  template: `
+    @if (open()) {
+      <div
+        #panel
+        class="portal-consequence-dialog"
+        role="dialog"
+        aria-modal="true"
+        [attr.aria-labelledby]="titleId()"
+        [attr.data-document]="document()"
+        [attr.data-text-version]="textVersion"
+        (keydown)="onKeydown($event)"
+      >
+        <h2 [id]="titleId()" tabindex="-1">
+          {{ textKey() | stynxTranslate }}
+        </h2>
+        @if (document() === 'efeitos_sne') {
+          <ol class="portal-consequence-effects">
+            @for (effect of sneEffects; track effect) {
+              <li [attr.data-effect]="effect">
+                {{ effectKey(effect) | stynxTranslate }}
+              </li>
+            }
+          </ol>
+        }
+        <label class="portal-consequence-ack">
+          <input
+            type="checkbox"
+            [checked]="acknowledged()"
+            (change)="toggle($event)"
+          />
+          {{ ackLabelKey() | stynxTranslate }}
+        </label>
+        <div class="portal-consequence-actions">
+          <button type="button" data-cancel (click)="cancel()">
+            {{ cancelLabelKey() | stynxTranslate }}
+          </button>
+          <button
+            type="button"
+            data-confirm
+            [disabled]="!acknowledged()"
+            (click)="confirm()"
+          >
+            {{ confirmLabelKey() | stynxTranslate }}
+          </button>
+        </div>
+      </div>
+    }
+  `,
+})
+export class ConsequenceDialogComponent {
+  private readonly clock = inject(PortalClock);
+  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
+  private opener: HTMLElement | null = null;
+  private wasOpen = false;
+
+  readonly document = input.required<LegalDocument>();
+  readonly open = input(false);
+  /** Ex.: `portal.forms.desistencia.confirmacao`, `portal.forms.adesao_sne.aceite`. */
+  readonly ackLabelKey = input.required<string>();
+  /** Ex.: `portal.screens.t08.cmd.confirm`. */
+  readonly confirmLabelKey = input.required<string>();
+  /** Ex.: `portal.screens.t08.cmd.cancel`. */
+  readonly cancelLabelKey = input.required<string>();
+  readonly confirmed = output<ConsequenceAck>();
+  readonly cancelled = output<void>();
+
+  readonly textVersion = LEGAL_TEXT_VERSION;
+  readonly sneEffects = SNE_EFFECTS;
+  readonly acknowledged = signal(false);
+
+  readonly titleId = computed(
+    () => `portal-consequence-${this.document()}-title`,
+  );
+  readonly textKey = computed(
+    () => `portal.legal.${this.document()}.${LEGAL_TEXT_VERSION}`,
+  );
+
+  constructor() {
+    afterRenderEffect(() => {
+      const open = this.open();
+      const panel = this.panel()?.nativeElement ?? null;
+      untracked(() => this.syncFocus(open, panel));
+    });
+  }
+
+  effectKey(effect: (typeof SNE_EFFECTS)[number]): string {
+    return `portal.legal.efeitos_sne.${LEGAL_TEXT_VERSION}.${effect}`;
+  }
+
+  toggle(event: Event): void {
+    this.acknowledged.set((event.target as HTMLInputElement).checked);
+  }
+
+  confirm(): void {
+    if (!this.acknowledged()) return;
+    this.confirmed.emit({
+      textVersion: LEGAL_TEXT_VERSION,
+      acceptedAt: this.clock.now().toISOString(),
+    });
+  }
+
+  cancel(): void {
+    this.cancelled.emit();
+  }
+
+  onKeydown(event: KeyboardEvent): void {
+    if (event.key === 'Escape') {
+      event.preventDefault();
+      this.cancel();
+      return;
+    }
+    if (event.key !== 'Tab') return;
+    const focusable = this.focusable();
+    if (focusable.length === 0) return;
+    const first = focusable[0];
+    const last = focusable[focusable.length - 1];
+    const active = document.activeElement;
+    if (event.shiftKey && (active === first || !this.contains(active))) {
+      event.preventDefault();
+      last.focus();
+    } else if (!event.shiftKey && active === last) {
+      event.preventDefault();
+      first.focus();
+    }
+  }
+
+  private focusable(): HTMLElement[] {
+    const panel = this.panel()?.nativeElement;
+    return panel
+      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
+      : [];
+  }
+
+  private contains(node: Element | null): boolean {
+    const panel = this.panel()?.nativeElement;
+    return Boolean(panel && node && panel.contains(node));
+  }
+
+  /** Abriu: guarda quem abriu e foca o título; fechou: devolve o foco a quem abriu (§8). */
+  private syncFocus(open: boolean, panel: HTMLElement | null): void {
+    if (open && panel) {
+      if (!this.wasOpen) {
+        this.opener =
+          document.activeElement instanceof HTMLElement
+            ? document.activeElement
+            : null;
+        this.acknowledged.set(false);
+      }
+      this.wasOpen = true;
+      if (!panel.contains(document.activeElement)) {
+        (panel.querySelector<HTMLElement>('h2') ?? panel).focus();
+      }
+    } else if (!open && this.wasOpen) {
+      this.wasOpen = false;
+      this.opener?.focus();
+      this.opener = null;
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/shared/deadline-card.component.ts b/apps/portal/web/src/app/shared/deadline-card.component.ts
new file mode 100644
index 0000000..e46a907
--- /dev/null
+++ b/apps/portal/web/src/app/shared/deadline-card.component.ts
@@ -0,0 +1,50 @@
+// DeadlineCard (contrato CTG-0003a §5.2; [RN-RAIT-005]; spec §2 invariante 2): mostra o prazo que
+// o servidor calculou (`dueOn`), de quem é (`ownedBy`) e, só se o servidor mandar, `daysLeft`
+// ([DIVERGE-10], OD-P64). Nenhuma aritmética de datas neste arquivo; a data é formatada pelo
+// `StynxIntlDatePipe` do kit.
+import { ChangeDetectionStrategy, Component, input } from '@angular/core';
+import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
+
+@Component({
+  selector: 'portal-deadline-card',
+  imports: [StynxTranslatePipe, StynxIntlDatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-owned-by]': 'ownedBy()',
+    '[attr.data-token]': 'kind()',
+  },
+  template: `
+    <p class="portal-deadline">
+      <span class="portal-deadline-label">{{
+        labelKey() | stynxTranslate
+      }}</span>
+      <span class="portal-deadline-owner">{{
+        ownerKey() | stynxTranslate
+      }}</span>
+      <time [attr.datetime]="dueOn()">{{ dueOn() | stynxIntlDate }}</time>
+      @if (daysLeft() !== null) {
+        <span [attr.data-days-left]="daysLeft()">{{
+          'portal.common.deadline.days_left'
+            | stynxTranslate: { daysLeft: daysLeft() ?? 0 }
+        }}</span>
+      }
+    </p>
+  `,
+})
+export class DeadlineCardComponent {
+  /** ISO calculada no servidor. */
+  readonly dueOn = input.required<string>();
+  readonly ownedBy = input.required<'citizen' | 'agency'>();
+  /** Chave da tela chamadora (ex.: `portal.screens.t11.field.prazo`). */
+  readonly labelKey = input.required<string>();
+  /** Só se o servidor mandar; nunca calculado. */
+  readonly daysLeft = input<number | null>(null);
+  /** Token do prazo → `data-token`. */
+  readonly kind = input<string | null>(null);
+
+  ownerKey(): string {
+    return this.ownedBy() === 'citizen'
+      ? 'portal.situation.deadline.citizen'
+      : 'portal.situation.deadline.agency';
+  }
+}
diff --git a/apps/portal/web/src/app/shared/prefilled-field.component.ts b/apps/portal/web/src/app/shared/prefilled-field.component.ts
new file mode 100644
index 0000000..ca214d7
--- /dev/null
+++ b/apps/portal/web/src/app/shared/prefilled-field.component.ts
@@ -0,0 +1,57 @@
+// PrefilledField (contrato CTG-0003a §5.5; [RN-PORTAL-106]; [RN-PORTAL-107] regra 2): valor que
+// o órgão já tem, somente leitura em `<output aria-readonly="true">` associado ao rótulo — nunca um
+// `<input>` editável (uso único). O botão "corrigir" só existe quando `correctable` e o chamador
+// fornece a chave do rótulo. Valor `null` → `portal.states.empty`.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+
+@Component({
+  selector: 'portal-prefilled-field',
+  imports: [StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  template: `
+    <div class="portal-prefilled-field">
+      <span class="portal-prefilled-label" [id]="labelId()">{{
+        labelKey() | stynxTranslate
+      }}</span>
+      <output
+        role="textbox"
+        aria-readonly="true"
+        [attr.name]="name()"
+        [attr.aria-labelledby]="labelId()"
+        [attr.data-name]="name()"
+      >
+        @if (value(); as text) {
+          {{ text }}
+        } @else {
+          {{ 'portal.states.empty' | stynxTranslate }}
+        }
+      </output>
+      @if (correctable() && correctLabelKey(); as key) {
+        <button type="button" data-correct (click)="correct.emit()">
+          {{ key | stynxTranslate }}
+        </button>
+      }
+    </div>
+  `,
+})
+export class PrefilledFieldComponent {
+  /** Chave em `prefilled{}`. */
+  readonly name = input.required<string>();
+  readonly labelKey = input.required<string>();
+  /** Valor do órgão. */
+  readonly value = input.required<string | null>();
+  /** "corrigir" quando permitido ([RN-PORTAL-106]). */
+  readonly correctable = input(false);
+  /** Ex.: `portal.screens.t24.cmd.corrigir`. */
+  readonly correctLabelKey = input<string | null>(null);
+  readonly correct = output<void>();
+
+  readonly labelId = computed(() => `portal-prefilled-${this.name()}-label`);
+}
diff --git a/apps/portal/web/src/app/shared/protocol-receipt.component.ts b/apps/portal/web/src/app/shared/protocol-receipt.component.ts
new file mode 100644
index 0000000..ed1e6c3
--- /dev/null
+++ b/apps/portal/web/src/app/shared/protocol-receipt.component.ts
@@ -0,0 +1,132 @@
+// ProtocolReceipt (contrato CTG-0003a §5.9; [RN-PORTAL-111] 1): o protocolo é sempre visível —
+// número (`data-protocol`), data-hora (`StynxIntlDatePipe`), canal (`portal.notifications.origin.portal`)
+// e o botão de download do recibo (`PortalClient.downloadReceipt` → `Blob` → `<a download>`).
+// `422 SERVICE_UNAVAILABLE` (recibo assinado pendente, OD-P42/OD-P59) troca o botão pela
+// mensagem + canal alternativo, mantendo número e data-hora (recibo mantido também em
+// `DELEGATION_FAILED`). Nada é simulado (M15).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  inject,
+  input,
+  output,
+  signal,
+} from '@angular/core';
+import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../core/error-banner.component';
+import { presentError, type ErrorPresentation } from '../core/error-boundary';
+import { PortalClient, type RequestSubmitted } from '../data/portal.client';
+import {
+  CitizenStatusBadgeComponent,
+  badgeOf,
+} from './citizen-status-badge.component';
+
+@Component({
+  selector: 'portal-protocol-receipt',
+  imports: [
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    PortalErrorBannerComponent,
+    CitizenStatusBadgeComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <section class="portal-protocol-receipt" [attr.aria-labelledby]="titleId()">
+      <h3 [id]="titleId()" tabindex="-1">
+        {{ 'portal.common.receipt.number' | stynxTranslate }}
+        <strong data-protocol>{{ protocol().number }}</strong>
+      </h3>
+      <dl>
+        @if (protocol().issuedAt; as issuedAt) {
+          <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
+          <dd>
+            <time [attr.datetime]="issuedAt">{{
+              issuedAt | stynxIntlDate: dateFormat
+            }}</time>
+          </dd>
+        }
+        @if (protocol().channel === 'portal') {
+          <dt>{{ 'portal.common.receipt.channel' | stynxTranslate }}</dt>
+          <dd data-channel="portal">
+            {{ 'portal.notifications.origin.portal' | stynxTranslate }}
+          </dd>
+        }
+      </dl>
+      @if (badge(); as situation) {
+        <portal-citizen-status-badge
+          [situation]="situation"
+          [token]="state() ?? ''"
+        />
+      }
+      @if (downloadFailed(); as failure) {
+        <portal-error-banner [error]="failure" (retry)="download()" />
+      } @else {
+        <button
+          type="button"
+          data-download
+          [disabled]="downloading()"
+          (click)="download()"
+        >
+          {{ 'portal.common.receipt.download' | stynxTranslate }}
+        </button>
+      }
+    </section>
+  `,
+})
+export class ProtocolReceiptComponent {
+  private readonly client = inject(PortalClient);
+  private readonly failure = signal<ErrorPresentation | null>(null);
+
+  readonly requestId = input.required<string>();
+  /** `number`, `issuedAt`, `channel`, `receiptHash`. */
+  readonly protocol = input.required<RequestSubmitted['protocol']>();
+  /** Token → `CitizenStatusBadge` via `badgeOf`. */
+  readonly state = input<string | null>(null);
+  readonly downloadFailed = this.failure.asReadonly();
+  readonly downloading = signal(false);
+  readonly downloaded = output<void>();
+
+  readonly dateFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+  readonly titleId = computed(() => `portal-receipt-${this.requestId()}`);
+  readonly badge = computed(() => {
+    const state = this.state();
+    return state ? badgeOf(state) : null;
+  });
+
+  async download(): Promise<void> {
+    this.downloading.set(true);
+    try {
+      const blob = await this.client.downloadReceipt(this.requestId());
+      this.failure.set(null);
+      this.saveBlob(blob);
+      this.downloaded.emit();
+    } catch (error: unknown) {
+      this.failure.set(presentError(error));
+    } finally {
+      this.downloading.set(false);
+    }
+  }
+
+  /** `<a download="recibo-<number>.pdf">` por object URL, revogado depois do clique. */
+  private saveBlob(blob: Blob): void {
+    if (typeof URL.createObjectURL !== 'function') return;
+    const url = URL.createObjectURL(blob);
+    try {
+      const anchor = document.createElement('a');
+      anchor.href = url;
+      anchor.download = `recibo-${this.protocol().number ?? this.requestId()}.pdf`;
+      anchor.rel = 'noopener';
+      anchor.hidden = true;
+      document.body.appendChild(anchor);
+      anchor.click();
+      anchor.remove();
+    } finally {
+      URL.revokeObjectURL(url);
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/shared/service-wizard.component.ts b/apps/portal/web/src/app/shared/service-wizard.component.ts
new file mode 100644
index 0000000..c632584
--- /dev/null
+++ b/apps/portal/web/src/app/shared/service-wizard.component.ts
@@ -0,0 +1,273 @@
+// ServiceWizard (contrato CTG-0003a §5.4; [WF-PORTAL-001]; [RN-PORTAL-105], [RN-PORTAL-107]):
+// os quatro passos do ciclo comum — elegibilidade → composição → assinatura → protocolo. O
+// formulário do passo 2 é projetado (`ng-content`) pela feature; o estado vive no
+// `ServiceWizardStore` provido aqui (a feature o lê pelo injector do componente). Todo passo
+// renderiza `portal-alternative-channel-note`; o checklist de `requirements[]` aparece inteiro no
+// passo 2; a mudança de passo move o foco ao `<h2 tabindex="-1">` (§8). A consequência jurídica
+// (`consequence`) abre o `ConsequenceDialog` ANTES do `submit` (invariante 10).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  input,
+  model,
+  output,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
+import type { ZodType } from 'zod';
+import { PortalErrorBannerComponent } from '../core/error-banner.component';
+import type { ErrorPresentation } from '../core/error-boundary';
+import type { ElevationStarted } from '../data/portal-command.models';
+import type {
+  DraftSaved,
+  RequestCreated,
+  RequestSubmitted,
+} from '../data/portal.client';
+import type { FormGate } from '../forms/form-gate';
+import { AlternativeChannelNoteComponent } from './alternative-channel-note.component';
+import {
+  ConsequenceDialogComponent,
+  type ConsequenceAck,
+  type LegalDocument,
+} from './consequence-dialog.component';
+import { ProtocolReceiptComponent } from './protocol-receipt.component';
+import {
+  ServiceWizardStore,
+  WIZARD_STEPS,
+  type WizardResumeDraft,
+  type WizardStep,
+  type WizardTarget,
+} from './service-wizard.store';
+import {
+  SignatureStepComponent,
+  type SignatureChoice,
+} from './signature-step.component';
+
+export {
+  WIZARD_STEPS,
+  type WizardResumeDraft,
+  type WizardStatus,
+  type WizardStep,
+  type WizardTarget,
+} from './service-wizard.store';
+
+@Component({
+  selector: 'portal-service-wizard',
+  imports: [
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    ConsequenceDialogComponent,
+    ProtocolReceiptComponent,
+    SignatureStepComponent,
+  ],
+  providers: [ServiceWizardStore],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-step]': 'store.step()',
+    '[attr.data-status]': 'store.status()',
+    '[attr.data-service-key]': 'target().serviceKey',
+    '[attr.aria-busy]': 'store.busy() ? "true" : null',
+  },
+  template: `
+    <nav [attr.aria-label]="'portal.a11y.wizard_steps' | stynxTranslate">
+      <ol class="portal-wizard-steps">
+        @for (step of steps; track step) {
+          <li
+            [attr.data-wizard-step]="step"
+            [attr.aria-current]="step === store.step() ? 'step' : null"
+          >
+            {{ stepKey(step) | stynxTranslate }}
+          </li>
+        }
+      </ol>
+    </nav>
+    <h2 #heading tabindex="-1">{{ stepKey(store.step()) | stynxTranslate }}</h2>
+
+    @if (store.busy()) {
+      <detran-loading-state
+        [label]="'portal.states.loading' | stynxTranslate"
+      />
+    }
+    @if (store.error(); as error) {
+      <portal-error-banner [error]="error" (retry)="retry()" />
+    }
+
+    @switch (store.step()) {
+      @case ('elegibilidade') {
+        @if (store.status() === 'ineligible') {
+          <p role="status" data-ineligible>
+            {{ 'portal.states.ineligible' | stynxTranslate }}
+          </p>
+        } @else if (store.status() === 'unavailable') {
+          <p role="status" data-unavailable>
+            {{ 'portal.states.service_unavailable' | stynxTranslate }}
+          </p>
+        } @else if (store.status() === 'idle') {
+          <button type="button" data-start (click)="store.start()">
+            {{ 'portal.common.action.continue' | stynxTranslate }}
+          </button>
+        }
+      }
+      @case ('composicao') {
+        @if (store.requirements().length > 0) {
+          <ul class="portal-wizard-requirements" data-requirements>
+            @for (item of store.requirements(); track $index) {
+              <li>{{ item }}</li>
+            }
+          </ul>
+        }
+        <ng-content />
+        <button
+          type="button"
+          data-continue
+          [disabled]="store.busy()"
+          (click)="saveAndContinue()"
+        >
+          {{ 'portal.common.action.continue' | stynxTranslate }}
+        </button>
+      }
+      @case ('assinatura') {
+        <portal-signature-step
+          [actKey]="target().serviceKey"
+          [required]="store.minimumAssurance() ?? 'none'"
+          [resumeRoute]="resumeRoute()"
+          [resumeDraft]="store.resumeDraft('assinatura')"
+          [uploadRequestId]="store.requestId()"
+          [govbrSignatureRef]="govbrSignatureRef()"
+          (signed)="onSigned($event)"
+          (elevationRequested)="elevationRequested.emit($event)"
+        />
+        @if (consequence(); as document) {
+          @if (consequenceAckLabelKey(); as ackKey) {
+            <portal-consequence-dialog
+              [document]="document"
+              [open]="pendingSignature() !== null"
+              [ackLabelKey]="ackKey"
+              [confirmLabelKey]="consequenceConfirmLabelKey()"
+              [cancelLabelKey]="consequenceCancelLabelKey()"
+              (confirmed)="onConsequenceConfirmed($event)"
+              (cancelled)="pendingSignature.set(null)"
+            />
+          }
+        }
+      }
+      @case ('protocolo') {
+        @if (store.receipt(); as receipt) {
+          <portal-protocol-receipt
+            [requestId]="receipt.requestId"
+            [protocol]="receipt.protocol"
+            [state]="receipt.state"
+            [attr.data-protocol]="receipt.protocol.number"
+          />
+        }
+      }
+    }
+
+    <portal-alternative-channel-note [serviceKey]="target().serviceKey" />
+  `,
+})
+export class ServiceWizardComponent {
+  readonly store = inject(ServiceWizardStore);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focusedStep: WizardStep = WIZARD_STEPS[0];
+
+  readonly target = input.required<WizardTarget>();
+  /** `forms/<nome>.schema.ts`. */
+  readonly schema = input.required<ZodType>();
+  readonly gate = input.required<FormGate>();
+  /** `state.url` da tela. */
+  readonly resumeRoute = input.required<string>();
+  /** Abre `ConsequenceDialog` antes de assinar. */
+  readonly consequence = input<LegalDocument | null>(null);
+  /** Rótulos do diálogo de consequência (chaves da tela chamadora; §5.7). */
+  readonly consequenceAckLabelKey = input<string | null>(null);
+  readonly consequenceConfirmLabelKey = input<string>(
+    'portal.common.action.continue',
+  );
+  readonly consequenceCancelLabelKey = input<string>(
+    'portal.common.action.cancel',
+  );
+  /** `source_pending` (OD-P60): origem do `signatureRef` para `govbr`. */
+  readonly govbrSignatureRef = input<string | null>(null);
+  /** O formulário do passo 2 é projetado pela feature; os valores chegam por aqui. */
+  readonly values = model<Record<string, unknown> | null>(null);
+  readonly created = output<RequestCreated>();
+  readonly draftSaved = output<DraftSaved>();
+  readonly submitted = output<RequestSubmitted>();
+  readonly ineligible = output<ErrorPresentation>();
+  readonly failed = output<ErrorPresentation>();
+  readonly stepChanged = output<WizardStep>();
+  readonly elevationRequested = output<ElevationStarted>();
+
+  readonly steps = WIZARD_STEPS;
+  readonly pendingSignature = signal<SignatureChoice | null>(null);
+  readonly serviceKey = computed(() => this.target().serviceKey);
+
+  constructor() {
+    this.store.attach(this);
+    // Mudança de passo move o foco ao título do passo (§8); a primeira renderização não rouba o
+    // foco do usuário.
+    afterRenderEffect(() => {
+      const step = this.store.step();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (step !== this.focusedStep) {
+          this.focusedStep = step;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  stepKey(step: WizardStep): string {
+    return `portal.common.step.${step}`;
+  }
+
+  /** `retry`/`reload` do banner: repete a ação do passo corrente. */
+  retry(): void {
+    switch (this.store.step()) {
+      case 'elegibilidade':
+        void this.store.start();
+        return;
+      case 'composicao':
+        void this.store.save();
+        return;
+      default:
+        return;
+    }
+  }
+
+  async saveAndContinue(): Promise<void> {
+    await this.store.save();
+    if (this.store.error() === null && this.store.status() === 'ready') {
+      this.store.goTo('assinatura');
+    }
+  }
+
+  onSigned(choice: SignatureChoice): void {
+    if (this.consequence() !== null) {
+      this.pendingSignature.set(choice);
+      return;
+    }
+    void this.store.sign(choice, null);
+  }
+
+  onConsequenceConfirmed(ack: ConsequenceAck): void {
+    const choice = this.pendingSignature();
+    this.pendingSignature.set(null);
+    if (choice) void this.store.sign(choice, ack);
+  }
+
+  /** `ResumeService.resume()` já consumido pela feature ([UC-PORTAL-019] AC-4). */
+  resumeFrom(point: WizardResumeDraft): void {
+    this.store.resumeFrom(point);
+  }
+}
diff --git a/apps/portal/web/src/app/shared/service-wizard.store.ts b/apps/portal/web/src/app/shared/service-wizard.store.ts
new file mode 100644
index 0000000..d9a44ab
--- /dev/null
+++ b/apps/portal/web/src/app/shared/service-wizard.store.ts
@@ -0,0 +1,411 @@
+// ServiceWizardStore (contrato CTG-0003a §5.4; [WF-PORTAL-001] ciclo comum; T02/T05 §4–§6):
+// estado do wizard de um ato — provido no `ServiceWizardComponent` (um por instância) e lido pela
+// feature via injector do componente. `start()` = `createRequest`; `save()` = `schema.safeParse`
+// (forma só orienta, M12) → `saveDraft` com `If-Match`; `sign()` = `submitRequest` (nunca sem o
+// `ack` quando há `consequence`, invariante 10); `resumeFrom()` restaura sem novo `POST`
+// ([UC-PORTAL-019] AC-4). Rascunho SÓ no servidor; offline = `portal.states.offline`, sem fila nem
+// promessa de envio posterior (spec §8). Nenhuma lógica de prazo, elegibilidade ou nível aqui.
+import {
+  Injectable,
+  type OutputEmitterRef,
+  type Signal,
+  computed,
+  inject,
+  signal,
+} from '@angular/core';
+import { StynxI18nService, StynxToastService } from '@detran/ui';
+import type { ZodType } from 'zod';
+import {
+  OFFLINE_KEY,
+  classifyError,
+  presentError,
+  type ErrorPresentation,
+} from '../core/error-boundary';
+import { ResumeService } from '../core/resume.service';
+import { etagOf, type ElevationStarted } from '../data/portal-command.models';
+import {
+  PortalClient,
+  type DraftSaved,
+  type RequestCreateBody,
+  type RequestCreated,
+  type RequestDraftBody,
+  type RequestSubmitted,
+} from '../data/portal.client';
+import type { FormGate } from '../forms/form-gate';
+import type {
+  ConsequenceAck,
+  LegalDocument,
+} from './consequence-dialog.component';
+import type { SignatureChoice } from './signature-step.component';
+
+export type WizardStep =
+  'elegibilidade' | 'composicao' | 'assinatura' | 'protocolo';
+
+export const WIZARD_STEPS: readonly WizardStep[] = [
+  'elegibilidade',
+  'composicao',
+  'assinatura',
+  'protocolo',
+];
+
+export type WizardStatus =
+  | 'idle'
+  | 'loading'
+  | 'ready'
+  | 'saving'
+  | 'submitting'
+  | 'ineligible'
+  | 'unavailable'
+  | 'offline'
+  | 'error'
+  | 'done';
+
+export interface WizardTarget {
+  readonly serviceKey: string;
+  readonly targetKind: RequestCreateBody['targetKind'];
+  readonly targetId: string | null;
+}
+
+export interface WizardResumeDraft {
+  readonly requestId: string;
+  readonly serviceKey: string;
+  readonly targetKind: RequestCreateBody['targetKind'];
+  readonly targetId: string | null;
+  readonly step: WizardStep;
+  readonly etag: string | null;
+  readonly values: Record<string, unknown> | null;
+}
+
+/**
+ * Recibo mostrado no passo `protocolo`: o 200 de `submit` (`RequestSubmitted`) ou, em
+ * `502 DELEGATION_FAILED`, o protocolo de `context.protocol` — emitido, mas ainda não delegado
+ * ([RN-PORTAL-111] 1): estado `PROTOCOLADO` (WF-PORTAL-001), delegação e versão desconhecidas.
+ */
+export interface WizardReceipt {
+  readonly requestId: string;
+  readonly state: RequestSubmitted['state'] | 'PROTOCOLADO';
+  readonly protocol: RequestSubmitted['protocol'];
+  readonly delegation: RequestSubmitted['delegation'] | null;
+  readonly version: number | null;
+}
+
+/** O que o `ServiceWizardComponent` entrega ao store: inputs, modelo e saídas. */
+export interface WizardHost {
+  readonly target: Signal<WizardTarget>;
+  readonly schema: Signal<ZodType>;
+  readonly gate: Signal<FormGate>;
+  readonly resumeRoute: Signal<string>;
+  readonly consequence: Signal<LegalDocument | null>;
+  readonly values: Signal<Record<string, unknown> | null> & {
+    set(value: Record<string, unknown> | null): void;
+  };
+  readonly created: OutputEmitterRef<RequestCreated>;
+  readonly draftSaved: OutputEmitterRef<DraftSaved>;
+  readonly submitted: OutputEmitterRef<RequestSubmitted>;
+  readonly ineligible: OutputEmitterRef<ErrorPresentation>;
+  readonly failed: OutputEmitterRef<ErrorPresentation>;
+  readonly stepChanged: OutputEmitterRef<WizardStep>;
+  readonly elevationRequested: OutputEmitterRef<ElevationStarted>;
+}
+
+const VALIDATION_FAILED = 'PORTAL.VALIDATION_FAILED';
+
+function isOffline(): boolean {
+  return typeof navigator !== 'undefined' && navigator.onLine === false;
+}
+
+function isRecord(value: unknown): value is Record<string, unknown> {
+  return typeof value === 'object' && value !== null && !Array.isArray(value);
+}
+
+@Injectable()
+export class ServiceWizardStore {
+  private readonly client = inject(PortalClient);
+  private readonly resumeService = inject(ResumeService);
+  private readonly toast = inject(StynxToastService);
+  private readonly i18n = inject(StynxI18nService);
+  private host: WizardHost | null = null;
+
+  private readonly statusState = signal<WizardStatus>('idle');
+  private readonly stepState = signal<WizardStep>(WIZARD_STEPS[0]);
+  private readonly requestIdState = signal<string | null>(null);
+  private readonly etagState = signal<string | null>(null);
+  private readonly prefilledState = signal<Readonly<Record<string, unknown>>>(
+    {},
+  );
+  private readonly requirementsState = signal<readonly string[]>([]);
+  private readonly minimumAssuranceState = signal<
+    RequestCreated['minimumAssurance'] | null
+  >(null);
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly receiptState = signal<WizardReceipt | null>(null);
+
+  readonly status = this.statusState.asReadonly();
+  readonly step = this.stepState.asReadonly();
+  readonly requestId = this.requestIdState.asReadonly();
+  readonly etag = this.etagState.asReadonly();
+  /** → `PrefilledField`. */
+  readonly prefilled = this.prefilledState.asReadonly();
+  /** → checklist do `AttachmentUploader`. */
+  readonly requirements = this.requirementsState.asReadonly();
+  /** → `SignatureStep.required`. */
+  readonly minimumAssurance = this.minimumAssuranceState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  readonly receipt = this.receiptState.asReadonly();
+  readonly busy = computed(() => {
+    const status = this.statusState();
+    return (
+      status === 'loading' || status === 'saving' || status === 'submitting'
+    );
+  });
+
+  /** Chamado uma vez pelo componente hospedeiro. */
+  attach(host: WizardHost): void {
+    this.host = host;
+  }
+
+  /** `createRequest` — passo 1 → 2 no 201. */
+  async start(): Promise<void> {
+    const host = this.attached();
+    if (this.goOfflineIfNeeded()) return;
+    const target = host.target();
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    try {
+      const result = await this.client.createRequest({
+        serviceKey: target.serviceKey,
+        targetKind: target.targetKind,
+        ...(target.targetId ? { targetId: target.targetId } : {}),
+        channel: 'portal',
+      });
+      this.requestIdState.set(result.body.requestId);
+      this.etagState.set(result.etag ?? etagOf(result.body.version));
+      this.prefilledState.set(
+        isRecord(result.body.prefilled) ? result.body.prefilled : {},
+      );
+      this.requirementsState.set(result.body.requirements ?? []);
+      this.minimumAssuranceState.set(result.body.minimumAssurance);
+      this.statusState.set('ready');
+      this.goTo('composicao');
+      host.created.emit(result.body);
+    } catch (error: unknown) {
+      const presentation = this.present(error);
+      this.errorState.set(presentation);
+      switch (presentation.code) {
+        case 'PORTAL.INELIGIBLE':
+          this.statusState.set('ineligible');
+          host.ineligible.emit(presentation);
+          return;
+        case 'PORTAL.SERVICE_UNAVAILABLE':
+          this.statusState.set('unavailable');
+          return;
+        default:
+          this.statusState.set(
+            this.isOfflineError(error) ? 'offline' : 'error',
+          );
+          host.failed.emit(presentation);
+      }
+    }
+  }
+
+  /** `schema.safeParse(values)` → inválido: `fields` sem requisição; válido: `saveDraft`. */
+  async save(): Promise<void> {
+    const host = this.attached();
+    if (this.goOfflineIfNeeded()) return;
+    const parsed = host.schema().safeParse(host.values() ?? {});
+    if (!parsed.success) {
+      this.errorState.set(this.validationPresentation(parsed.error.issues));
+      return;
+    }
+    const requestId = this.requestIdState();
+    if (!requestId) return;
+    this.statusState.set('saving');
+    this.errorState.set(null);
+    try {
+      const result = await this.client.saveDraft(
+        requestId,
+        host.target().serviceKey,
+        parsed.data as RequestDraftBody,
+        this.etagState(),
+      );
+      this.etagState.set(result.etag ?? etagOf(result.body.version));
+      this.statusState.set('ready');
+      host.draftSaved.emit(result.body);
+      this.toast.push(
+        this.i18n.translate('portal.common.toast.draft_saved'),
+        'success',
+      );
+    } catch (error: unknown) {
+      const presentation = this.present(error);
+      this.errorState.set(presentation);
+      this.statusState.set(this.isOfflineError(error) ? 'offline' : 'ready');
+      host.failed.emit(presentation);
+    }
+  }
+
+  goTo(step: WizardStep): void {
+    if (this.stepState() === step) return;
+    this.stepState.set(step);
+    this.host?.stepChanged.emit(step);
+  }
+
+  /** `submitRequest`; com `consequence` definido, nunca sem o `ack` (o diálogo é etapa própria). */
+  async sign(
+    signature: SignatureChoice,
+    ack: ConsequenceAck | null,
+  ): Promise<void> {
+    const host = this.attached();
+    if (host.consequence() !== null && ack === null) return;
+    if (this.goOfflineIfNeeded()) return;
+    const requestId = this.requestIdState();
+    if (!requestId) return;
+    const target = host.target();
+    this.goTo('assinatura');
+    this.statusState.set('submitting');
+    this.errorState.set(null);
+    try {
+      const result = await this.client.submitRequest(
+        requestId,
+        target.serviceKey,
+        target.targetId,
+        { signature, ...(ack ? { consequenceAck: ack } : {}) },
+      );
+      this.etagState.set(result.etag ?? etagOf(result.body.version));
+      this.receiptState.set({
+        requestId: result.body.requestId,
+        state: result.body.state,
+        protocol: result.body.protocol,
+        delegation: result.body.delegation,
+        version: result.body.version,
+      });
+      this.statusState.set('done');
+      this.goTo('protocolo');
+      host.submitted.emit(result.body);
+    } catch (error: unknown) {
+      this.failSign(host, requestId, error);
+    }
+  }
+
+  /** Restaura `requestId`, `etag`, `step` e `values` sem chamar `createRequest`. */
+  resumeFrom(point: WizardResumeDraft): void {
+    const host = this.attached();
+    this.requestIdState.set(point.requestId);
+    this.etagState.set(point.etag);
+    host.values.set(point.values);
+    this.errorState.set(null);
+    this.statusState.set('ready');
+    this.goTo(point.step);
+  }
+
+  /** Ponto de retomada do wizard ([UC-PORTAL-019] AC-4) no passo dado. */
+  resumeDraft(step: WizardStep): WizardResumeDraft | null {
+    const host = this.host;
+    const requestId = this.requestIdState();
+    if (!host || !requestId) return null;
+    const target = host.target();
+    return {
+      requestId,
+      serviceKey: target.serviceKey,
+      targetKind: target.targetKind,
+      targetId: target.targetId,
+      step,
+      etag: this.etagState(),
+      values: host.values(),
+    };
+  }
+
+  private failSign(host: WizardHost, requestId: string, error: unknown): void {
+    const presentation = this.present(error);
+    switch (presentation.code) {
+      case 'PORTAL.ASSURANCE_INSUFFICIENT': {
+        // Nada se perde: rota + rascunho guardados ANTES da elevação (T-27 retoma o ato).
+        this.resumeService.save({
+          route: host.resumeRoute(),
+          draft: this.resumeDraft('assinatura'),
+        });
+        this.errorState.set(presentation);
+        this.statusState.set('ready');
+        return;
+      }
+      case 'PORTAL.DELEGATION_FAILED': {
+        // Protocolo é imediato ([RN-PORTAL-111] 1): recibo mantido, aviso de encaminhamento.
+        const protocol = presentation.context['protocol'];
+        this.receiptState.set({
+          requestId,
+          state: 'PROTOCOLADO',
+          protocol: isRecord(protocol) ? protocol : {},
+          delegation: null,
+          version: null,
+        });
+        this.errorState.set(presentation);
+        this.statusState.set('done');
+        this.goTo('protocolo');
+        return;
+      }
+      default:
+        this.errorState.set(presentation);
+        this.statusState.set(this.isOfflineError(error) ? 'offline' : 'ready');
+        host.failed.emit(presentation);
+    }
+  }
+
+  private present(error: unknown): ErrorPresentation {
+    const host = this.host;
+    return presentError(error, {
+      resumeRoute: host?.resumeRoute(),
+      serviceKey: host?.target().serviceKey,
+    });
+  }
+
+  private isOfflineError(error: unknown): boolean {
+    return classifyError(error).status === 0 && isOffline();
+  }
+
+  /** Offline: estado próprio, sem requisição enfileirada nem promessa de envio (spec §8). */
+  private goOfflineIfNeeded(): boolean {
+    if (!isOffline()) return false;
+    this.statusState.set('offline');
+    this.errorState.set({
+      code: null,
+      status: 0,
+      messageKey: OFFLINE_KEY,
+      messageParams: {},
+      severity: 'error',
+      nextStep: 'retry',
+      nextStepRoute: null,
+      alternativeChannel: true,
+      fields: [],
+      retryAfter: null,
+      context: {},
+      requestId: null,
+    });
+    return true;
+  }
+
+  /** Forma inválida: `portal.errors.validation_failed` + campos para a diretiva (sem requisição). */
+  private validationPresentation(
+    issues: readonly { readonly path: readonly PropertyKey[] }[],
+  ): ErrorPresentation {
+    const fields = Array.from(
+      new Set(issues.map((issue) => issue.path.map(String).join('.'))),
+    ).filter((field) => field.length > 0);
+    return presentError({
+      status: 400,
+      error: {
+        code: VALIDATION_FAILED,
+        status: 400,
+        message: VALIDATION_FAILED,
+        context: { fields },
+      },
+    });
+  }
+
+  private attached(): WizardHost {
+    if (!this.host) {
+      throw new Error(
+        'ServiceWizardStore: nenhum ServiceWizardComponent anexado',
+      );
+    }
+    return this.host;
+  }
+}
diff --git a/apps/portal/web/src/app/shared/signature-step.component.ts b/apps/portal/web/src/app/shared/signature-step.component.ts
new file mode 100644
index 0000000..6e986fa
--- /dev/null
+++ b/apps/portal/web/src/app/shared/signature-step.component.ts
@@ -0,0 +1,175 @@
+// SignatureStep (contrato CTG-0003a §5.8; T02 §5 "passo guiado embutido"; [UC-PORTAL-019];
+// [RN-PORTAL-101] c; [RN-PORTAL-104]). Suficiência = `required === 'none'` ou
+// `ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[required]` (mesma ordem do `assuranceGuard`; o
+// nível exigido vem do servidor pelo input `required` — nenhuma tabela ato → nível aqui).
+// Insuficiente → `AssuranceExplainer` + botão `portal.screens.t27.cmd.elevar` →
+// `SessionFacade.requestElevation` → `elevationRequested` (quem navega ao `redirectUrl` é o
+// chamador). `required === 'qualificada'` → nunca um caminho: banner
+// `portal.errors.assurance_qualified_never_required`. Suficiente → `govbr` (signatureRef:
+// `source_pending`, OD-P60) ou `upload` (documento assinado via `AttachmentUploader`).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  inject,
+  input,
+  output,
+  signal,
+} from '@angular/core';
+import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
+import type { ElevationStarted } from '../data/portal-command.models';
+import {
+  ASSURANCE_ORDER,
+  SessionFacade,
+  type AssuranceLevel,
+  type ElevationMethod,
+} from '../core/session.facade';
+import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES } from '../forms/attachments';
+import { AssuranceExplainerComponent } from './assurance-explainer.component';
+import {
+  AttachmentUploaderComponent,
+  type AttachmentEntry,
+} from './attachment-uploader.component';
+import type { WizardResumeDraft } from './service-wizard.store';
+
+export type SignatureMethod = 'govbr' | 'upload';
+
+export interface SignatureChoice {
+  readonly method: SignatureMethod;
+  readonly signatureRef: string;
+}
+
+@Component({
+  selector: 'portal-signature-step',
+  imports: [
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    AssuranceExplainerComponent,
+    AttachmentUploaderComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-act-key]': 'actKey()',
+    '[attr.data-required]': 'required()',
+  },
+  template: `
+    @if (required() === 'qualificada') {
+      <div role="alert" data-qualified-never-required>
+        <stynx-banner
+          tone="error"
+          [message]="
+            'portal.errors.assurance_qualified_never_required' | stynxTranslate
+          "
+        />
+      </div>
+    } @else if (!sufficient()) {
+      <portal-assurance-explainer
+        [required]="requiredLevel()"
+        [current]="current()"
+        [actKey]="actKey()"
+        (methodSelected)="method.set($event)"
+      />
+      <button
+        type="button"
+        data-elevar
+        [disabled]="method() === null || elevating()"
+        (click)="elevate()"
+      >
+        {{ 'portal.screens.t27.cmd.elevar' | stynxTranslate }}
+      </button>
+    } @else {
+      <div class="portal-signature-methods" role="group">
+        <button
+          type="button"
+          data-method="govbr"
+          [disabled]="govbrSignatureRef() === null"
+          (click)="signWithGovbr()"
+        >
+          {{ 'portal.forms.assinatura.method.govbr' | stynxTranslate }}
+        </button>
+        @if (uploadRequestId()) {
+          <button type="button" data-method="upload" (click)="chooseUpload()">
+            {{ 'portal.forms.assinatura.method.upload' | stynxTranslate }}
+          </button>
+        }
+      </div>
+      @if (uploading() && uploadRequestId(); as requestId) {
+        <portal-attachment-uploader
+          [requestId]="requestId"
+          [accept]="accept"
+          [maxBytes]="maxBytes"
+          [hintKey]="'portal.forms.assinatura.method.upload'"
+          (attached)="signWithUpload($event)"
+        />
+      }
+    }
+  `,
+})
+export class SignatureStepComponent {
+  private readonly session = inject(SessionFacade);
+
+  /** `serviceKey`. */
+  readonly actKey = input.required<string>();
+  /** `createRequest.minimumAssurance` (servidor). */
+  readonly required = input.required<'none' | AssuranceLevel>();
+  readonly resumeRoute = input.required<string>();
+  readonly resumeDraft = input<WizardResumeDraft | null>(null);
+  /** Habilita o caminho `upload` (AttachmentUploader). */
+  readonly uploadRequestId = input<string | null>(null);
+  /** `source_pending`: origem do valor (OD-P60). */
+  readonly govbrSignatureRef = input<string | null>(null);
+  readonly signed = output<SignatureChoice>();
+  readonly elevationRequested = output<ElevationStarted>();
+
+  readonly accept = ATTACHMENT_ACCEPT;
+  readonly maxBytes = ATTACHMENT_MAX_BYTES;
+  readonly method = signal<ElevationMethod | null>(null);
+  readonly uploading = signal(false);
+  readonly elevating = signal(false);
+
+  readonly current = computed(() => this.session.assuranceLevel());
+  readonly requiredLevel = computed<AssuranceLevel>(() => {
+    const required = this.required();
+    return required === 'none' ? 'simples' : required;
+  });
+  readonly sufficient = computed(() => {
+    const required = this.required();
+    if (required === 'none') return true;
+    const current = this.current();
+    return (
+      current !== null && ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[required]
+    );
+  });
+
+  async elevate(): Promise<void> {
+    const method = this.method();
+    if (!method || this.required() === 'qualificada') return;
+    this.elevating.set(true);
+    try {
+      const started = await this.session.requestElevation({
+        targetLevel: 'avancada',
+        method,
+        resumeRoute: this.resumeRoute(),
+        draft: this.resumeDraft(),
+      });
+      this.elevationRequested.emit(started);
+    } finally {
+      this.elevating.set(false);
+    }
+  }
+
+  signWithGovbr(): void {
+    const signatureRef = this.govbrSignatureRef();
+    if (signatureRef === null) return; // OD-P60: sem origem do valor, não assina.
+    this.signed.emit({ method: 'govbr', signatureRef });
+  }
+
+  chooseUpload(): void {
+    this.uploading.set(true);
+  }
+
+  signWithUpload(entry: AttachmentEntry): void {
+    if (!entry.attachmentId) return;
+    this.signed.emit({ method: 'upload', signatureRef: entry.attachmentId });
+  }
+}
diff --git a/apps/portal/web/vitest.config.ts b/apps/portal/web/vitest.config.ts
index 551182f..40c2077 100644
--- a/apps/portal/web/vitest.config.ts
+++ b/apps/portal/web/vitest.config.ts
@@ -1,8 +1,67 @@
-// Runner de testes do app (plan.md R-0014 M3): vitest + jsdom, como packages/ui e
-// detran-ui-guide.md §5. Specs nunca inicializam o ambiente — src/test-setup.ts faz.
+// Runner de testes do app (plan.md R-0014 M3 + adenda A7): vitest + jsdom, como packages/ui e
+// detran-ui-guide.md §5, mais a transformação JIT do Angular (`angularJitApplicationTransform`
+// de `@angular/compiler-cli`) para que as APIs de inicialização baseadas em signals —
+// `input()`, `output()`, `model()`, `viewChild()` — sejam registradas nos metadados do
+// componente também fora do AOT. Sem ela, `setInput` é no-op e todo spec de componente com
+// `input()` falha (NG0950/NG0303). Specs nunca inicializam o ambiente — src/test-setup.ts faz.
+import { dirname, resolve } from 'node:path';
+import { fileURLToPath } from 'node:url';
+import { angularJitApplicationTransform } from '@angular/compiler-cli';
+import ts from 'typescript';
 import { defineConfig } from 'vitest/config';

+const appRoot = dirname(fileURLToPath(import.meta.url));
+
+function loadFileNames(tsconfig: string): {
+  fileNames: string[];
+  options: ts.CompilerOptions;
+} {
+  const configPath = resolve(appRoot, tsconfig);
+  const config = ts.readConfigFile(configPath, ts.sys.readFile);
+  const parsed = ts.parseJsonConfigFileContent(
+    config.config,
+    ts.sys,
+    dirname(configPath),
+  );
+  return { fileNames: parsed.fileNames, options: parsed.options };
+}
+
+function angularJitPlugin() {
+  let program: ts.Program | null = null;
+  const getProgram = (): ts.Program => {
+    if (program) return program;
+    const spec = loadFileNames('tsconfig.spec.json');
+    const app = loadFileNames('tsconfig.app.json');
+    program = ts.createProgram(
+      [...new Set([...spec.fileNames, ...app.fileNames])],
+      { ...spec.options, noEmit: true },
+    );
+    return program;
+  };
+  return {
+    name: 'angular-jit-initializer-apis',
+    enforce: 'pre' as const,
+    transform(_code: string, id: string) {
+      if (!id.endsWith('.ts') || id.includes('node_modules')) return null;
+      const prog = getProgram();
+      const sourceFile = prog.getSourceFile(id);
+      if (!sourceFile) return null;
+      const result = ts.transform(
+        sourceFile,
+        [angularJitApplicationTransform(prog)],
+        prog.getCompilerOptions(),
+      );
+      const out = ts
+        .createPrinter()
+        .printFile(result.transformed[0] as ts.SourceFile);
+      result.dispose();
+      return { code: out, map: null };
+    },
+  };
+}
+
 export default defineConfig({
+  plugins: [angularJitPlugin()],
   test: {
     environment: 'jsdom',
     globals: true,
```

### Specs e stubs (29 + 5 arquivos, leia na worktree) — amostra integral: `portal.client.spec.ts`, `service-wizard.component.spec.ts`, `schemas-matrix.spec.ts`

```ts
// R-0014 TASK-0008 (Inspector, iteração 2 — B2/B3 de reports/TASK-0009.md, A7 do plan.md).
// `data/portal.client.ts` já implementa os 11 comandos do contrato CTG-0003a §2.4 (TASK-0009,
// Engineer). O cast `as unknown as PortalCommandClient` (`src/testing/contract-types.ts`) é
// mantido inofensivamente (a instância agora é real). B2: `idempotencyKey()` calcula o
// SHA-256 do corpo via `crypto.subtle` — assíncrono — antes de o `HttpClient` emitir a
// requisição; `httpMock.expectOne` chamado sincronamente logo após o comando encontrava "found
// none" e deixava a promessa do comando pendente (rejeitada só no teardown, sem handler). Todo
// `expectOne` que segue um comando passa por `vi.waitFor(() => httpMock.expectOne(...))`. B3:
// `downloadReceipt` usa `responseType: 'blob'` — o `flush()` de erro precisa de um corpo
// Blob-compatível (`Automatic conversion to Blob is not supported` do `HttpTestingController`
// caso contrário); usa-se `new Blob([JSON.stringify(body)], { type: 'application/json' })`,
// forma real de um erro entregue a uma requisição `blob` (o body chega cru, não pré-parseado).
// `presentError`/`classifyError` estendido (§3) vêm de `core/error-boundary.ts` pelo mesmo
// mecanismo (namespace import + cast), usado só nos casos C-3a-09/11/17 que dependem dos campos
// novos.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { classifyError } from '../core/error-boundary';
import * as ErrorBoundaryModule from '../core/error-boundary';
import { PortalClient } from './portal.client';
import type {
  PortalCommandClient,
  PortalErrorBoundaryContract,
} from '../../testing/contract-types';
import {
  AIT_ID,
  REQUEST_COMPOSICAO_ID,
  REQUEST_DESISTIDO_ID,
  REQUEST_SUBMITTED_FIXTURE,
  REQUEST_CREATED_FIXTURE,
  REQUEST_WITHDRAWN_FIXTURE,
  SUBJECT_PRATA_ID,
  portalErrorBody,
} from '../../testing/http-fixtures';

const errorBoundary =
  ErrorBoundaryModule as unknown as PortalErrorBoundaryContract;

const IDEM_KEY_RE = (act: string, target: string): RegExp =>
  new RegExp(`^${act}:${target}:[0-9a-f]{64}$`);

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(PortalClient) as unknown as PortalCommandClient,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // teste que não chamou setup() (ex.: classificação de erro isolada, sem HttpClientTesting).
  }
  vi.unstubAllGlobals();
});

describe('PortalClient — createRequest (POST /v1/portal/requests)', () => {
  it('dado createRequest com targetKind ait quando 201 ETag "1" então POST com Idempotency-Key <serviceKey>:<targetId>:<fp> e result tipado', async () => {
    // C-3a-05
    const { client, httpMock } = setup();
    const promise = client.createRequest({
      serviceKey: 'defesa_previa',
      targetKind: 'ait',
      targetId: AIT_ID,
      channel: 'portal',
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/requests'),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('defesa_previa', AIT_ID),
    );
    req.flush(REQUEST_CREATED_FIXTURE, { headers: { ETag: '"1"' } });
    const result = await promise;
    expect(result.etag).toBe('"1"');
    expect(result.body.state).toBe('PEDIDO_EM_COMPOSICAO');
  });

  it("dado createRequest com targetKind 'none' sem targetId então Idempotency-Key '<serviceKey>:none:<fp>'", async () => {
    // C-3a-06 ([DIVERGE-5])
    const { client, httpMock } = setup();
    const promise = client.createRequest({
      serviceKey: 'adesao_sne',
      targetKind: 'none',
      channel: 'portal',
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/requests'),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('adesao_sne', 'none'),
    );
    req.flush(REQUEST_CREATED_FIXTURE, { headers: { ETag: '"1"' } });
    await promise;
  });
});

describe('PortalClient — saveDraft (PUT .../draft)', () => {
  it('dado saveDraft com If-Match "1" quando 200 ETag "2" então PUT com If-Match e Idempotency-Key defesa_previa:<requestId>:<fp>; etag atualizado', async () => {
    // C-3a-07
    const { client, httpMock } = setup();
    const promise = client.saveDraft(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      { facts: 'x', grounds: 'y', attachmentIds: [], requestType: 'outro' },
      '"1"',
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/draft`),
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('If-Match')).toBe('"1"');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('defesa_previa', REQUEST_COMPOSICAO_ID),
    );
    req.flush(
      {
        requestId: REQUEST_COMPOSICAO_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    const result = await promise;
    expect(result.etag).toBe('"2"');
  });

  it('dado saveDraft(…, null) quando servidor 428 IF_MATCH_REQUIRED então a requisição NÃO tem If-Match e classifyError classifica 428 [negativo]', async () => {
    // C-3a-08
    const { client, httpMock } = setup();
    const promise = client.saveDraft(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      {},
      null,
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/draft`),
    );
    expect(req.request.headers.has('If-Match')).toBe(false);
    req.flush(portalErrorBody('PORTAL.IF_MATCH_REQUIRED', 428), {
      status: 428,
      statusText: 'Precondition Required',
    });
    await expect(promise).rejects.toBeTruthy();
    const classified = await promise.catch((error: unknown) =>
      classifyError(error),
    );
    expect(classified).toMatchObject({
      code: 'PORTAL.IF_MATCH_REQUIRED',
      status: 428,
      messageKey: 'portal.errors.if_match_required',
    });
  });

  it('dado saveDraft com If-Match "1" e servidor 412 VERSION_CONFLICT então presentError → nextStep reload, messageKey version_conflict', async () => {
    // C-3a-09
    const { client, httpMock } = setup();
    const promise = client.saveDraft(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      {},
      '"1"',
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/draft`),
    );
    req.flush(portalErrorBody('PORTAL.VERSION_CONFLICT', 412), {
      status: 412,
      statusText: 'Precondition Failed',
    });
    const error = await promise.catch((rejection: unknown) => rejection);
    const presentation = errorBoundary.presentError(error);
    expect(presentation.nextStep).toBe('reload');
    expect(presentation.messageKey).toBe('portal.errors.version_conflict');
  });
});

describe('PortalClient — submitRequest (POST .../submit)', () => {
  it('dado submitRequest(requestId, defesa_previa, aitId, signature govbr) quando 200 então POST com Idempotency-Key defesa_previa:<aitId>:<fp> e protocol.number presente; targetId null → alvo = requestId', async () => {
    // C-3a-10
    const { client, httpMock } = setup();
    const promiseWithTarget = client.submitRequest(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      AIT_ID,
      { signature: { method: 'govbr', signatureRef: 'x' } },
    );
    const reqWithTarget = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/submit`),
    );
    expect(reqWithTarget.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('defesa_previa', AIT_ID),
    );
    reqWithTarget.flush(REQUEST_SUBMITTED_FIXTURE, {
      headers: { ETag: '"2"' },
    });
    const result = await promiseWithTarget;
    expect(result.body.protocol.number).toBeTruthy();

    const promiseNullTarget = client.submitRequest(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      null,
      { signature: { method: 'govbr', signatureRef: 'x' } },
    );
    const reqNullTarget = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/submit`),
    );
    expect(reqNullTarget.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('defesa_previa', REQUEST_COMPOSICAO_ID),
    );
    reqNullTarget.flush(REQUEST_SUBMITTED_FIXTURE, {
      headers: { ETag: '"2"' },
    });
    await promiseNullTarget;
  });

  it('dado submit com a mesma chave e corpo diferente quando 409 IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY então presentError → reload, error [negativo]', async () => {
    // C-3a-11
    const { client, httpMock } = setup();
    const promise = client.submitRequest(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      AIT_ID,
      { signature: { method: 'govbr', signatureRef: 'x' } },
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/submit`),
    );
    req.flush(
      portalErrorBody('PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY', 409, {
        key: 'defesa_previa:x:fingerprint',
      }),
      { status: 409, statusText: 'Conflict' },
    );
    const error = await promise.catch((rejection: unknown) => rejection);
    const presentation = errorBoundary.presentError(error);
    expect(presentation.messageKey).toBe(
      'portal.errors.idempotent_key_reuse_different_body',
    );
    expect(presentation.nextStep).toBe('reload');
    expect(presentation.severity).toBe('error');
  });
});

describe('PortalClient — withdrawRequest (POST .../withdraw)', () => {
  it('dado withdrawRequest(requestId, { confirm: true }, "1") quando 200 então POST com If-Match e Idempotency-Key withdraw:<requestId>:<fp>; body.state DESISTIDO', async () => {
    // C-3a-12
    const { client, httpMock } = setup();
    const promise = client.withdrawRequest(
      REQUEST_DESISTIDO_ID,
      { confirm: true },
      '"1"',
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_DESISTIDO_ID}/withdraw`,
      ),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('If-Match')).toBe('"1"');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('withdraw', REQUEST_DESISTIDO_ID),
    );
    req.flush(REQUEST_WITHDRAWN_FIXTURE, { headers: { ETag: '"2"' } });
    const result = await promise;
    expect(result.body.state).toBe('DESISTIDO');
  });
});

describe('PortalClient — respondDiligence (POST .../diligences/{did}/responses)', () => {
  it('dado respondDiligence(rid, did, { text, attachmentIds: [] }) então POST com Idempotency-Key respond_diligence:<did>:<fp>', async () => {
    // C-3a-13
    const { client, httpMock } = setup();
    const diligenceId = '00000000-0000-7000-8000-0000dd000001';
    const promise = client.respondDiligence(
      REQUEST_COMPOSICAO_ID,
      diligenceId,
      {
        text: 'resposta',
        attachmentIds: [],
      },
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/diligences/${diligenceId}/responses`,
      ),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('respond_diligence', diligenceId),
    );
    req.flush({ requestId: REQUEST_COMPOSICAO_ID, version: 2 });
    await promise;
  });
});

describe('PortalClient — anexos (POST .../attachments, .../complete)', () => {
  it('dado requestAttachmentUpload então POST .../attachments com Idempotency-Key attachment:<rid>:<fp> e o corpo; dado completeAttachment então POST .../complete com attachment_complete:<aid>:<fp({})> e sem corpo', async () => {
    // C-3a-14
    const { client, httpMock } = setup();
    const sha256 = 'a'.repeat(64);
    const attachmentIntent = client.requestAttachmentUpload(
      REQUEST_COMPOSICAO_ID,
      {
        filename: 'documento.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 102400,
        sha256,
      },
    );
    const uploadReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/attachments`,
      ),
    );
    expect(uploadReq.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('attachment', REQUEST_COMPOSICAO_ID),
    );
    expect(uploadReq.request.body).toMatchObject({
      filename: 'documento.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 102400,
      sha256,
    });
    const attachmentId = '00000000-0000-7000-8000-0000aa000001';
    uploadReq.flush({
      attachmentId,
      uploadUrl: 'https://storage.invalid/x',
      method: 'PUT',
      headers: {},
      expiresAt: null,
    });
    await attachmentIntent;

    const completePromise = client.completeAttachment(
      REQUEST_COMPOSICAO_ID,
      attachmentId,
    );
    const completeReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/attachments/${attachmentId}/complete`,
      ),
    );
    expect(completeReq.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('attachment_complete', attachmentId),
    );
    expect(completeReq.request.body).toEqual({});
    completeReq.flush({ attachmentId, sha256 });
    await completePromise;
  });
});

describe('PortalClient — elevação (POST .../elevations, .../elevations/{id}/complete)', () => {
  it('dado elevateAssurance(subjectId, body) então POST /v1/portal/identity/assurance/elevations com elevation:<subjectId>:<fp>; completeElevation(eid, body) então POST .../complete com elevation_complete:<eid>:<fp>', async () => {
    // C-3a-15
    const { client, httpMock } = setup();
    const elevatePromise = client.elevateAssurance(SUBJECT_PRATA_ID, {
      targetLevel: 'avancada',
      method: 'biographic',
      resumeRoute: '/autos/x/defesa/nova',
    });
    const elevateReq = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/identity/assurance/elevations'),
    );
    expect(elevateReq.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('elevation', SUBJECT_PRATA_ID),
    );
    const elevationId = '00000000-0000-7000-8000-0000ee000001';
    elevateReq.flush({
      redirectUrl: 'https://sso.gov.br/authorize?fixture=1',
      resumeToken: 'resume-token-fixture',
      elevationId,
    });
    await elevatePromise;

    const completePromise = client.completeElevation(elevationId, {
      resumeToken: 'resume-token-fixture',
    });
    const completeReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/identity/assurance/elevations/${elevationId}/complete`,
      ),
    );
    expect(completeReq.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('elevation_complete', elevationId),
    );
    completeReq.flush({ assuranceLevel: 'avancada' });
    await completePromise;
  });
});

describe('PortalClient — downloadReceipt (GET .../receipt)', () => {
  it('dado downloadReceipt(rid) então GET .../receipt com responseType blob; dado 422 SERVICE_UNAVAILABLE então rejeita com esse código (nenhum PDF simulado, M15)', async () => {
    // C-3a-16
    const { client, httpMock } = setup();
    const promise = client.downloadReceipt(REQUEST_COMPOSICAO_ID);
    const req = httpMock.expectOne(
      `/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/receipt`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    // B3: requisição `responseType: 'blob'` — o corpo de erro chega como Blob (como no browser
    // real: o XHR entrega o body no tipo pedido mesmo em erro), nunca pré-parseado como objeto.
    const errorBlob = new Blob(
      [
        JSON.stringify(
          portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
            unavailableReason: 'documento_assinado_pendente_r0014',
          }),
        ),
      ],
      { type: 'application/json' },
    );
    req.flush(errorBlob, { status: 422, statusText: 'Unprocessable Entity' });
    const error = await promise.catch((rejection: unknown) => rejection);
    const classified = classifyError(error);
    expect(classified.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
  });
});

describe('classificação de erro fora dos comandos (§3.1)', () => {
  it('dado 503 NATIONAL_READ_UNAVAILABLE { retryAfter: 30, cachedAt } então classifyError.retryAfter = 30 e presentError → retry, alternativeChannel true', () => {
    // C-3a-17
    const error = {
      status: 503,
      error: portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        retryAfter: 30,
        cachedAt: '2026-09-14T11:00:00-04:00',
      }),
      name: 'HttpErrorResponse',
    };
    const classified = errorBoundary.classifyError(error);
    expect(classified.retryAfter).toBe(30);
    const presentation = errorBoundary.presentError(error);
    expect(presentation.nextStep).toBe('retry');
    expect(presentation.alternativeChannel).toBe(true);
    expect(presentation.messageKey).toBe(
      'portal.errors.national_read_unavailable',
    );
  });
});

describe('PortalClient — uploadToSignedUrl (exceção [DIVERGE-17]: fetch puro, fora de /v1/portal/*)', () => {
  it('dado uploadToSignedUrl(intent, blob) então fetch é chamado com method PUT, sem Authorization e credentials omit; nada passa pelo HttpClient', async () => {
    // C-3a-18
    const { client, httpMock } = setup();
    const fetchMock = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const blob = new Blob(['conteudo'], { type: 'application/pdf' });
    await client.uploadToSignedUrl(
      {
        attachmentId: '00000000-0000-7000-8000-0000aa000001',
        uploadUrl: 'https://storage.invalid/x',
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        expiresAt: null,
      },
      blob,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://storage.invalid/x');
    expect(init.method).toBe('PUT');
    expect(init.credentials).toBe('omit');
    const headers = new Headers(init.headers);
    expect(headers.has('Authorization')).toBe(false);
    httpMock.expectNone(() => true);
  });
});

// ---- service-wizard.component.spec.ts
// R-0014 TASK-0008 (Inspector). `shared/service-wizard.component.ts` +
// `shared/service-wizard.store.ts` (novos, contrato CTG-0003a §5.4) — ainda não existem
// (TASK-0009): a importação falha com "Cannot find module" (estado esperado, §9 do contrato).
// Assunção assumida (registrada no relatório de entrega, §5.4 não fixa a mecânica): a "feature"
// lê o `ServiceWizardStore` (provido no componente) via
// `fixture.debugElement.injector.get(ServiceWizardStore)` — padrão Angular idiomático para um
// token local a um componente hospedeiro (`@ViewChild(Comp, { read: Token })` no app real); os
// inputs/outputs do próprio componente (`target`, `schema`, `gate`, `resumeRoute`, `consequence`,
// `values`, `created`, …) ficam em `fixture.componentInstance`.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { SessionFacade } from '../core/session.facade';
import { PortalClient } from '../data/portal.client';
import { ResumeService } from '../core/resume.service';
import { createSessionFacadeStub } from '../../testing/session-facade.stub';
import {
  AIT_ID,
  REQUEST_COMPOSICAO_ID,
  portalErrorBody,
} from '../../testing/http-fixtures';
import {
  ServiceWizardComponent,
  type WizardTarget,
  type WizardResumeDraft,
} from './service-wizard.component';
import { ServiceWizardStore } from './service-wizard.store';
import {
  DefesaPreviaSchema,
  DEFESA_PREVIA_GATE,
} from '../forms/defesa-previa.schema';

const catalog = portalCatalog as Record<string, string>;

const TARGET: WizardTarget = {
  serviceKey: 'defesa_previa',
  targetKind: 'ait',
  targetId: AIT_ID,
};

function clientStub() {
  return {
    me: vi.fn(),
    brand: vi.fn(),
    services: vi.fn(),
    entitledResource: vi.fn(),
    createRequest: vi.fn(),
    saveDraft: vi.fn(),
    submitRequest: vi.fn(),
    requestAttachmentUpload: vi.fn(),
    uploadToSignedUrl: vi.fn(),
    completeAttachment: vi.fn(),
    withdrawRequest: vi.fn(),
    respondDiligence: vi.fn(),
    elevateAssurance: vi.fn(),
    completeElevation: vi.fn(),
    downloadReceipt: vi.fn(),
  };
}

async function setup(client = clientStub()) {
  const session = createSessionFacadeStub({
    active: true,
    assuranceLevel: 'avancada',
  });
  await TestBed.configureTestingModule({
    imports: [
      ServiceWizardComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [
      { provide: PortalClient, useValue: client },
      { provide: SessionFacade, useValue: session },
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(ServiceWizardComponent);
  fixture.componentRef.setInput('target', TARGET);
  fixture.componentRef.setInput('schema', DefesaPreviaSchema);
  fixture.componentRef.setInput('gate', DEFESA_PREVIA_GATE);
  fixture.componentRef.setInput('resumeRoute', '/autos/x/defesa/nova');
  // `ServiceWizardStore` ainda não existe (TASK-0009): `injector.get` resolveria `unknown`; o
  // cast documenta a assinatura assumida (§5.4) sem exigir o módulo agora (`any` liberado em
  // `*.spec.ts` — CODESTYLE §TypeScript).
  const store = fixture.debugElement.injector.get(ServiceWizardStore) as any;
  const resumeService = TestBed.inject(ResumeService);
  const component = fixture.componentInstance as any;
  return { fixture, component, store, client, session, resumeService };
}

describe('ServiceWizardComponent.start()', () => {
  it('dado start() e 201 então step composicao, etag, prefilled/requirements/minimumAssurance do corpo, created emitido', async () => {
    // C-3a-55
    const { fixture, component, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: { placa: 'ABC1D23' },
        requirements: ['Conta gov.br'],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    const created: unknown[] = [];
    component.created.subscribe((value: unknown) => created.push(value));
    await store.start();
    fixture.detectChanges();
    expect(store.step()).toBe('composicao');
    expect(store.etag()).toBe('"1"');
    expect(store.prefilled()).toEqual({ placa: 'ABC1D23' });
    expect(store.requirements()).toEqual(['Conta gov.br']);
    expect(store.minimumAssurance()).toBe('avancada');
    expect(created).toHaveLength(1);
  });
});

describe('ServiceWizardComponent.start() — erros', () => {
  it('dado 422 INELIGIBLE então status ineligible e evento com messageKey; 422 SERVICE_UNAVAILABLE então unavailable; 409 REQUEST_DRAFT_EXISTS então nextStepRoute /processos/<id>', async () => {
    // C-3a-56
    const { component, store, client } = await setup();
    client.createRequest.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.INELIGIBLE', 422, {
        reason: 'x',
        alternative: 'y',
      }),
      name: 'HttpErrorResponse',
    });
    const ineligible: unknown[] = [];
    component.ineligible.subscribe((value: unknown) => ineligible.push(value));
    await store.start();
    expect(store.status()).toBe('ineligible');
    expect(ineligible).toHaveLength(1);

    client.createRequest.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {}),
      name: 'HttpErrorResponse',
    });
    await store.start();
    expect(store.status()).toBe('unavailable');

    client.createRequest.mockRejectedValueOnce({
      status: 409,
      error: portalErrorBody('PORTAL.REQUEST_DRAFT_EXISTS', 409, {
        requestId: REQUEST_COMPOSICAO_ID,
      }),
      name: 'HttpErrorResponse',
    });
    await store.start();
    expect(store.error()?.nextStepRoute).toBe(
      `/processos/${REQUEST_COMPOSICAO_ID}`,
    );
  });
});

describe('ServiceWizardComponent.save()', () => {
  it('dado values inválidos (facts vazio) então nenhuma requisição e error().fields contém facts; dado válidos então PUT draft com If-Match e etag/draftSaved atualizados', async () => {
    // C-3a-57
    const { fixture, component, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    await store.start();

    fixture.componentRef.setInput('values', {
      facts: '',
      grounds: 'x',
      attachmentIds: [],
      requestType: 'outro',
    });
    await store.save();
    expect(client.saveDraft).not.toHaveBeenCalled();
    expect(store.error()?.fields).toContain('facts');

    client.saveDraft.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      etag: '"2"',
    });
    fixture.componentRef.setInput('values', {
      facts: 'y',
      grounds: 'x',
      attachmentIds: [],
      requestType: 'outro',
    });
    const draftSaved: unknown[] = [];
    component.draftSaved.subscribe((value: unknown) => draftSaved.push(value));
    await store.save();
    expect(client.saveDraft).toHaveBeenCalledWith(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      expect.objectContaining({ facts: 'y' }),
      '"1"',
    );
    expect(store.etag()).toBe('"2"');
    expect(draftSaved).toHaveLength(1);
  });
});

describe('ServiceWizardComponent.sign()', () => {
  async function started(client: ReturnType<typeof clientStub>) {
    const setupResult = await setup(client);
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"2"',
    });
    await setupResult.store.start();
    return setupResult;
  }

  it('dado sign sem consequence e 200 então step protocolo, status done, receipt(), submitted emitido, portal-protocol-receipt com data-protocol', async () => {
    // C-3a-58
    const client = clientStub();
    const { fixture, component, store } = await started(client);
    client.submitRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'EM_ANDAMENTO_NO_ORGAO',
        protocol: {
          number: 'AM-FIXTURES-2026-0000005',
          issuedAt: '2026-09-05T12:00:00-04:00',
          channel: 'portal',
        },
        delegation: { status: 'delegated' },
        version: 2,
      },
      etag: '"3"',
    });
    const submitted: unknown[] = [];
    component.submitted.subscribe((value: unknown) => submitted.push(value));
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    fixture.detectChanges();
    expect(store.step()).toBe('protocolo');
    expect(store.status()).toBe('done');
    expect(store.receipt()).not.toBeNull();
    expect(submitted).toHaveLength(1);
    expect(
      fixture.nativeElement.querySelector(
        'portal-protocol-receipt[data-protocol]',
      ),
    ).not.toBeNull();
  });

  it('dado consequence definido então sign(choice, null) não requisita (ack é etapa própria); sign(choice, ack) então POST submit com consequenceAck (invariante 10)', async () => {
    // C-3a-59
    const client = clientStub();
    const { fixture, store } = await started(client);
    fixture.componentRef.setInput('consequence', 'consequencias_indicacao');
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    expect(client.submitRequest).not.toHaveBeenCalled();

    client.submitRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'EM_ANDAMENTO_NO_ORGAO',
        protocol: {},
        delegation: {},
        version: 2,
      },
      etag: '"3"',
    });
    await store.sign(
      { method: 'govbr', signatureRef: 'ref' },
      { textVersion: 'v1', acceptedAt: '2026-09-14T12:00:00-04:00' },
    );
    expect(client.submitRequest).toHaveBeenCalledWith(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      AIT_ID,
      expect.objectContaining({
        consequenceAck: {
          textVersion: 'v1',
          acceptedAt: '2026-09-14T12:00:00-04:00',
        },
      }),
    );
  });

  it("dado sign e 403 ASSURANCE_INSUFFICIENT então volta ao passo assinatura com banner nextStep 'elevation', SEM elevationRequested (o SignatureStep emite quando o cidadão escolher o caminho); values() intactos ([UC-PORTAL-019] 3a/AC-4)", async () => {
    // C-3a-60 (A7(b) do plan.md — ratificação do maestro após bloqueio B8 de reports/TASK-0009.md:
    // o ServiceWizard não tem método de elevação escolhido neste ponto, então não pode emitir
    // `ElevationStarted`; só volta ao passo `assinatura` e mostra o banner. `SignatureStep`
    // (§5.8, C-3a-77) é quem chama `SessionFacade.requestElevation` e emite `elevationRequested`
    // depois que o cidadão escolhe biographic/biometric/icp.)
    const client = clientStub();
    const { fixture, component, store } = await started(client);
    const values = {
      facts: 'x',
      grounds: 'y',
      attachmentIds: [],
      requestType: 'outro',
    };
    fixture.componentRef.setInput('values', values);
    client.submitRequest.mockRejectedValueOnce({
      status: 403,
      error: portalErrorBody('PORTAL.ASSURANCE_INSUFFICIENT', 403, {}),
      name: 'HttpErrorResponse',
    });
    const elevationRequested: unknown[] = [];
    component.elevationRequested.subscribe((value: unknown) =>
      elevationRequested.push(value),
    );
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    expect(store.step()).toBe('assinatura');
    expect(store.error()?.nextStep).toBe('elevation');
    expect(elevationRequested).toHaveLength(0);
    expect(component.values()).toEqual(values);
  });

  it('dado sign e 422 REQUEST_CONSEQUENCE_ACK_REQUIRED então step permanece assinatura com o banner', async () => {
    // C-3a-61
    const client = clientStub();
    const { store } = await started(client);
    client.submitRequest.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED', 422, {
        textVersion: 'v1',
      }),
      name: 'HttpErrorResponse',
    });
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    expect(store.step()).toBe('assinatura');
    expect(store.error()?.messageKey).toBe(
      'portal.errors.request_consequence_ack_required',
    );
  });

  it('dado sign e 502 DELEGATION_FAILED com protocol então step protocolo com o recibo de context.protocol e banner warning ([RN-PORTAL-111] 1)', async () => {
    // C-3a-62
    const client = clientStub();
    const { store } = await started(client);
    const protocol = {
      number: 'AM-FIXTURES-2026-0000005',
      issuedAt: '2026-09-05T12:00:00-04:00',
      channel: 'portal',
    };
    client.submitRequest.mockRejectedValueOnce({
      status: 502,
      error: portalErrorBody('PORTAL.DELEGATION_FAILED', 502, { protocol }),
      name: 'HttpErrorResponse',
    });
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    expect(store.step()).toBe('protocolo');
    expect(store.error()?.severity).toBe('warning');
    expect(store.receipt()?.protocol).toEqual(protocol);
  });
});

describe('ServiceWizardComponent.resumeFrom()', () => {
  it('dado resumeFrom(point) então nenhum POST requests; step, values() e etag() restaurados', async () => {
    // C-3a-63
    const { store, client } = await setup();
    const point: WizardResumeDraft = {
      requestId: REQUEST_COMPOSICAO_ID,
      serviceKey: 'defesa_previa',
      targetKind: 'ait',
      targetId: AIT_ID,
      step: 'assinatura',
      etag: '"2"',
      values: { facts: 'x' },
    };
    store.resumeFrom(point);
    expect(client.createRequest).not.toHaveBeenCalled();
    expect(store.step()).toBe('assinatura');
    expect(store.etag()).toBe('"2"');
  });
});

describe('ServiceWizardComponent — canal alternativo, foco e checklist', () => {
  it('dado qualquer passo então portal-alternative-channel-note presente; ao mudar de passo o foco vai ao h2; em composicao todos os requirements aparecem antes de qualquer interação ([RN-PORTAL-107] regra 3)', async () => {
    // C-3a-64
    const { fixture, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: ['Conta gov.br', 'Nível avançado'],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    await store.start();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    const h2 = fixture.nativeElement.querySelector('h2[tabindex="-1"]');
    expect(document.activeElement).toBe(h2);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Conta gov.br');
    expect(text).toContain('Nível avançado');
  });

  it('dado navigator.onLine false quando save() então status offline, texto de portal.states.offline, nenhuma requisição enfileirada', async () => {
    // C-3a-65
    const { fixture, store, client } = await setup();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    fixture.componentRef.setInput('values', {
      facts: 'x',
      grounds: 'y',
      attachmentIds: [],
      requestType: 'outro',
    });
    await store.save();
    expect(store.status()).toBe('offline');
    expect(client.saveDraft).not.toHaveBeenCalled();
    onLineSpy.mockRestore();
  });

  it.todo('OD-P59: forma do aviso REQUEST_OUT_OF_DEADLINE no 200 de submit'); // C-3a-66
});

// ---- schemas-matrix.spec.ts
// R-0014 TASK-0008 (Inspector). Critérios transversais aos 14 schemas + `form-gate.ts` +
// `attachments.ts` (16 arquivos novos de `forms/`, contrato CTG-0003a §6, ainda inexistentes —
// TASK-0009). C-3a-93 (parte cruzada): `required` de cada forma com corpo do schema JSON
// (`docs/framework/schemas/portal-request-draft.schema.json`) ⊆ campos obrigatórios do zod
// correspondente, para as 8 formas com título compartilhado entre o schema JSON e `forms/*`
// (`defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`, `pagamento`,
// `adesao_sne`, `junta_medica`, `lgpd_declaracao`/`meus-dados`); `cancelamento_sne` e as leituras
// (`consulta_*`, `emissao_crlv`) do schema JSON não têm arquivo correspondente em `forms/` (fora
// do escopo do par 1, §1). C-3a-98: varredura de código-fonte (os 16 arquivos ainda não existem;
// o teste falha ao ler o diretório — estado esperado até TASK-0009 — e relata a lista de
// arquivos ausentes em vez de um ENOENT opaco); guardas existentes (`core/guards/*.guard.ts`,
// já em produção) verificados de verdade.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DefesaPreviaSchema } from './defesa-previa.schema';
import { RecursoJariSchema } from './recurso-jari.schema';
import { RecursoCetranSchema } from './recurso-cetran.schema';
import { IndicacaoCondutorSchema } from './indicacao-condutor.schema';
import { PagamentoSchema } from './pagamento.schema';
import { AdesaoSneSchema } from './adesao-sne.schema';
import { JuntaMedicaSchema } from './junta-medica.schema';
import { MeusDadosSchema } from './meus-dados.schema';

const formsDir = dirname(fileURLToPath(import.meta.url));
const coreGuardsDir = join(formsDir, '..', 'core', 'guards');
const repoRoot = join(formsDir, '..', '..', '..', '..', '..', '..');
const draftSchemaPath = join(
  repoRoot,
  'docs/framework/schemas/portal-request-draft.schema.json',
);

type ZodLikeSchema = { safeParse: (value: unknown) => { success: boolean } };

const SCHEMA_BY_TITLE: Record<string, ZodLikeSchema> = {
  defesa_previa: DefesaPreviaSchema,
  recurso_jari: RecursoJariSchema,
  recurso_cetran: RecursoCetranSchema,
  indicacao_condutor: IndicacaoCondutorSchema,
  pagamento: PagamentoSchema,
  adesao_sne: AdesaoSneSchema,
  junta_medica: JuntaMedicaSchema,
  lgpd_declaracao: MeusDadosSchema,
};

// Corpos canônicos completos (mesmos das specs individuais) usados só para "apagar" um campo por
// vez e checar que a ausência de um `required` do schema JSON também falha no zod.
const CANONICAL_BODY: Record<string, Record<string, unknown>> = {
  defesa_previa: {
    facts: 'x',
    grounds: 'y',
    attachmentIds: ['00000000-0000-7000-8000-0000bb000001'],
    requestType: 'outro',
  },
  recurso_jari: { grounds: 'x', attachmentIds: [] },
  recurso_cetran: { attachmentIds: [] },
  indicacao_condutor: {
    driver: {
      cpf: '11144477735',
      cnhNumber: '1',
      cnhUf: 'AM',
      category: 'B',
      name: 'x',
    },
    signatures: { owner: 'govbr', driver: 'govbr' },
    consequenceAck: {
      textVersion: 'v1',
      acceptedAt: '2026-09-14T12:00:00-04:00',
    },
  },
  pagamento: { tier: 'desconto_80', method: 'pix' },
  adesao_sne: {
    email: 'x@fixtures.invalid',
    phone: '92991234567',
    consent: {
      textVersion: 'v1',
      effectsAck: [
        'ciencia_ficta',
        'canal_exclusivo',
        'desconto_60',
        'cancelamento',
      ],
    },
  },
  junta_medica: {
    examId: '00000000-0000-7000-8000-00007ff00002',
    reason: 'x',
    attachmentIds: [],
  },
  lgpd_declaracao: { scope: 'confirmacao' },
};

interface DraftSchemaOneOf {
  readonly title: string;
  readonly required?: readonly string[];
}

describe('forms/* — required do schema JSON ⊆ required do zod (C-3a-93, parte cruzada)', () => {
  const draftSchema = JSON.parse(readFileSync(draftSchemaPath, 'utf8')) as {
    oneOf: readonly DraftSchemaOneOf[];
  };
  const oneOf = draftSchema.oneOf;

  it.each(Object.keys(SCHEMA_BY_TITLE))('dado o título %s', (title) => {
    const jsonEntry = oneOf.find((entry) => entry.title === title);
    expect(
      jsonEntry,
      `título ${title} não encontrado no schema JSON`,
    ).toBeDefined();
    const required = jsonEntry?.required ?? [];
    const schema = SCHEMA_BY_TITLE[title];
    const canonicalBody = CANONICAL_BODY[title];
    for (const field of required) {
      const { [field]: _omit, ...rest } = canonicalBody;
      const result = schema.safeParse(rest);
      expect(
        result.success,
        `${title}: campo obrigatório '${field}' do schema JSON não é obrigatório no zod`,
      ).toBe(false);
    }
  });
});

describe('forms/* — fronteiras de import (C-3a-98)', () => {
  it('dado os 16 arquivos de forms/ então nenhum importa core/session.facade, core/guards ou usa Date', () => {
    let entries: string[];
    try {
      entries = readdirSync(formsDir).filter(
        (name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'),
      );
    } catch (error) {
      throw new Error(
        `forms/ ainda não existe (TASK-0009): ${(error as Error).message}`,
      );
    }
    expect(
      entries.length,
      'forms/ deveria ter 16 arquivos (14 schemas + form-gate.ts + attachments.ts)',
    ).toBe(16);
    const offenders: string[] = [];
    for (const name of entries) {
      const text = readFileSync(join(formsDir, name), 'utf8');
      if (/session\.facade/.test(text))
        offenders.push(`${name}: importa session.facade`);
      if (/core\/guards/.test(text))
        offenders.push(`${name}: importa core/guards`);
      if (/\bDate\b/.test(text)) offenders.push(`${name}: usa Date`);
    }
    expect(offenders).toEqual([]);
  });

  it('dado os guardas existentes (core/guards/*.guard.ts) então nenhum importa forms/ (gates nunca decidem permissão)', () => {
    const guardFiles = readdirSync(coreGuardsDir).filter((name) =>
      name.endsWith('.guard.ts'),
    );
    expect(guardFiles.length).toBeGreaterThan(0);
    const offenders = guardFiles.filter((name) =>
      /from ['"].*\/forms\//.test(
        readFileSync(join(coreGuardsDir, name), 'utf8'),
      ),
    );
    expect(offenders).toEqual([]);
  });
});
```
