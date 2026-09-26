# Inspeção 2026-09-25 — item (d): adequação do STYNX como substrato genérico

Papel declarado: **Auditor** (Constitution Art. 6, somente leitura). Nenhum arquivo versionado foi
alterado. Único artefato: este relatório (diretório `tmp/`, gitignored).

---

## 1. Resumo executivo

1. **Pinagem correta e consistente.** Os 69 manifestos do workspace declaram 25 pacotes
   `@stynx-nyx/*` todos em **1.3.1 exato**; o `pnpm-lock.yaml` resolve uma única versão de cada
   (sem duplicatas). Angular 22.1.6, TypeScript 6.0.3, ng-packagr 22.1.1, vitest ^4 e Node
   `>=24 <25` são idênticos em todos os apps e no kit. O registry já publica **1.4.0** como
   `latest`, mas entre 1.3.1 e 1.4.0 só houve commits de governança/CI no STYNX — manter 1.3.1 é
   defensável.
2. **O repositório NÃO contém estritamente código de negócio.** Estimo **~11.000–13.000 linhas
   de código genérico/infraestrutural escrito à mão** (sem contar gerados, testes e fixtures),
   distribuídas em: ~6.500 no frontend (SSE, error-boundary, shells, config, guardas, stubs), ~4.500
   no backend (SSE, adapters HTTP com retry próprio, outbox própria, agendadores próprios, patch de
   interceptor, autorização paralela, políticas de sessão, protocolo de offline-sync) e ~1.000
   em `tools/` que é legitimamente local.
3. **Três classes de problema, por ordem de gravidade:**
   - **Pacotes STYNX publicados, previstos em ADR, e não consumidos** — `outbox`, `jobs`,
     `notifications`, `worklist`, `offline-sync`, `preferences`, `privacy`, `testing`,
     `angular-storage`, `angular-audit`, `angular-sessions`. Em seu lugar há implementações
     locais (outbox SQL própria, agendadores `setTimeout`, protocolo offline-sync de ~2.900
     linhas). `@stynx-nyx/signature` e `@stynx-nyx/audit` são **dependências declaradas e nunca
     importadas**, enquanto um adapter HTTP próprio de assinatura PAdES existe em `ch/clinical-reports`
     (contraria ADR-0018 §1).
   - **Lacunas reais do STYNX que forçaram código genérico local** (candidatos a upstream):
     SSE (backend e Angular — o STYNX não tem nada), _shell_/layout, _error boundary_ Angular,
     auditoria e idempotência transacionais, sessão única/fator forte, `If-Match`/ETag, curinga
     `recurso:*` no `*stynxHasPermission`, dublês de teste de sessão (subpath `./testing` de
     `angular-auth` exporta `{}`), propagação de ator em `@stynx-nyx/jobs`, e rotas públicas
     _tenant-scoped_ na tenancy.
   - **Dívida de plataforma escondida**: o _monkey-patch_ de `TenantContextInterceptor.prototype`
     (ADR-0005 §8, previsto como "shim estreito" para 1.1.1) **continua ativo em 1.3.1**, com o
     comentário ainda citando 1.1.1, e **cresceu** para conter lógica de negócio do Portal
     (semeadura de rotas públicas).
4. **O kit `@detran/ui` é fino demais** (209 linhas TS + 101 CSS): cada app reconstrói shell,
   tratamento de erro, SSE e bootstrap auxiliar; a instrução do WP-0 de **mesclar os catálogos
   i18n dos pacotes STYNX** (`ui.*`, `auth.*`, `tenancy.*`) **não foi implementada** em nenhum app.
5. **Documentação desatualizada sobre a fronteira**: `DT-001`/issue #121 dizem que pacotes STYNX
   "não resolvem no registry" — falso hoje (todos existem em 1.1.1…1.4.0); ADR-0006 (kit) e
   ADR-0008 ainda descrevem Angular 21 / 1.1.1 no corpo; `CLAUDE.md` cita DEVAI 1.4.5 enquanto
   `package.json`/`AGENTS.md` usam 1.5.6. Não há ADR nem registro que liste de forma canônica
   "o que é STYNX × o que é DETRAN" nem um _backlog_ de upstream.

---

## 2. Metodologia

- Leitura: `AGENTS.md`, `README.md`, `BUILD-PLAN.md`, `DESIGN-DECISIONS.md`, ADR-0005, 0006 (kit e
  ops), 0008, 0012, 0015, 0016–0021, 0024, `docs/framework/arch/wp0-stynx-1-3-1-migration.md`,
  `docs/framework/arch/detran-ui-guide.md`, `docs/meta/knowledge-base/open-issues.md`, contratos
  de `work/rounds/R-0008…R-0014` onde citam STYNX; issues #99, #121, #123, #125.
- Inventário de dependências: varredura dos 69 `package.json` (excl. `node_modules`, `tmp`,
  `scratch`), `pnpm-lock.yaml`, `node_modules/.pnpm/@stynx-nyx+*` (exports, `.d.ts`, catálogos).
- Capacidade do STYNX: `.d.ts` instalados (1.3.1) e o repositório irmão `../stynx` (somente
  leitura; workspace em 1.4.0) — `packages/*/src/index.ts`, `packages-web/*`.
- Registry: `npm view @stynx-nyx/<pkg> versions` (somente leitura) para os pacotes não consumidos.
- Código local: `find`/`wc -l`/`grep`/`diff` sobre `packages/`, `backend/app/src`,
  `backend/domains/**`, `apps/*/*/src`, `tools/`. Contagens excluem `*.spec.ts`, `dist/`, gerados
  e `node_modules` salvo indicação. Contagens são aproximadas (±10%).

---

## 3. Inventário STYNX consumido

### 3.1 Pacotes declarados (todos `1.3.1` exato)

| Pacote                                                                         | Manifestos | Onde                                                                             | Importado de fato?                                                                           |
| ------------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `core`, `data`                                                                 | 51 cada    | `backend/app`, `domains/shared`, todos os domínios gerados, gerador de blueprint | sim (maciço)                                                                                 |
| `backend`                                                                      | 2          | `backend/app`, `domains/shared`                                                  | sim (`Audit`, `getPrincipalFromRequest`, `AuditInterceptor`, módulos de auth/authz/pipeline) |
| `contracts`, `idempotency`, `ratelimit`                                        | 2 cada     | `backend/app`, `domains/shared`                                                  | sim                                                                                          |
| `auth`, `sessions`, `tenancy`, `health`, `logging`, `storage`, `feature-flags` | 1          | `backend/app`                                                                    | sim                                                                                          |
| `pdf`, `pdf-a`, `pdf-a-vera-docker`                                            | 1          | `backend/app`                                                                    | sim, só em `boat-documents.ts`                                                               |
| **`signature`**                                                                | 1          | `backend/app`                                                                    | **não — nenhum import**                                                                      |
| **`audit`**                                                                    | 1          | `backend/app`                                                                    | **não — nenhum import** (usa `StynxAuditModule` de `@stynx-nyx/backend`)                     |
| `integration-adapter`                                                          | 1          | `packages/senatran-adapter`                                                      | sim (só SENATRAN)                                                                            |
| `angular`, `angular-ui`, `angular-i18n`                                        | 9          | kit + 6 apps (+ `dist`)                                                          | sim                                                                                          |
| `angular-auth`, `angular-tenancy`                                              | 7          | kit + 5 apps                                                                     | sim                                                                                          |
| `mobile-runtime`                                                               | 3          | `teat/mobile`, `boat/mobile`                                                     | `teat/mobile` sim; `boat/mobile` declara mas não importa                                     |

`@stynx-nyx/sdk@1.3.1` entra apenas transitivamente.

### 3.2 Símbolos efetivamente usados nos frontends

- `rait/web`: `StynxTranslatePipe` (54), `StynxConfirmDialogComponent` (51),
  `StynxHasPermissionDirective` (29), `StynxSessionService` (12), `StynxPaginationComponent` (12),
  `StynxIntlDatePipe`, `StynxBannerComponent`, `StynxTableComponent`. 52 imports diretos de
  `@stynx-nyx/angular-ui` e 45 de `angular-auth`, **contornando o kit** (o guia manda registrar
  cada import direto).
- `portal/web`: quase tudo via `@detran/ui`; `StynxSessionService` direto.
- `dashboard/web`: `StynxSessionService` (31 imports diretos), substitui
  `*stynxHasPermission` por diretiva própria (`dashCan`).
- `teat/web`, `teat/mobile`: só `StynxSessionService`, `TenantContextService`,
  `provideDetranAuthenticatedApp`; **não importam `@detran/ui/styles`**.
- `boat/mobile`: nenhum import STYNX apesar das 4 dependências declaradas.
- `StynxTableComponent` é usado em 25 arquivos — boa adoção do primitivo.

### 3.3 Pacotes STYNX publicados e **não consumidos**

Todos existem no registry em 1.1.1, 1.2.0, 1.3.0, 1.3.1 e 1.4.0 (verificado 2026-09-25):

| Pacote                                                                                         | Previsto por                                              | Situação local                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `outbox`                                                                                       | ADR-0016 §2, `teat-route-contract.md` §51                 | outbox própria `domains/shared/src/events/{outbox,sql-outbox}.ts` (135 l.) sobre `integration.outbox`; `TODO(Phase 3 outbox)` em `inf/ait/src/ait-lifecycle.service.ts:1276`                                                              |
| `jobs`                                                                                         | ADR-0016, ADR-0020, issue #99                             | agendadores `setTimeout`/`setInterval` próprios: `boat-renaest-job.service.ts` (279) + `.providers.ts` (159), `dashboard/monitor/.../clock.sweeper.ts`, poller de SSE; justificativa: R-0010 CTG-0002 C-2-21 (jobs não propaga `actorId`) |
| `notifications`                                                                                | ADR-0016 §3, ADR-0019 §3                                  | não montado; `inf/notification` (852 l.) só persiste; push/e-mail pendentes (OD-P40, DIVERGE-2)                                                                                                                                           |
| `worklist`                                                                                     | handoff W1.4/W3.3 ("espinha dorsal do RAIT"), DT-001      | `inf/rait-worklist` gerado + 1.516 l. manuscritas; `inf/deadlines` (1.370 l.) com calendário/relógio próprios                                                                                                                             |
| `offline-sync`                                                                                 | ADR-0006 (ops), `teat-build-pack.md`, `teat-frontends.md` | `ops/offline-sync` com **2.903 l. manuscritas** implementando o protocolo; nenhuma ADR registra a troca                                                                                                                                   |
| `preferences`                                                                                  | ADR-0019, ADR-0021                                        | rota responde 422 `preferences_substrato_pendente`                                                                                                                                                                                        |
| `privacy`                                                                                      | ADR-0019                                                  | pendente (OD-P17)                                                                                                                                                                                                                         |
| `testing`                                                                                      | —                                                         | não usado; 21 arquivos fazem _duck-typing_ de `Transaction` (`asQueryable`) para aceitar dublês                                                                                                                                           |
| `angular-storage`                                                                              | —                                                         | `portal/.../attachment-uploader.component.ts` (272) e `dashboard/.../evidence-attach.component.ts` (123) reimplementam upload com hash                                                                                                    |
| `angular-audit`                                                                                | —                                                         | `teat/web/.../kernel STYNX.client.ts` (cliente de `/v1/audit/events`; nome de arquivo com espaço) e página de auditoria do DASHBOARD próprios                                                                                             |
| `angular-sessions`, `angular-profile`, `angular-iam`, `angular-flow`, `flow`, `i18n` (backend) | ADR-0019 (flow adiado)                                    | não usados                                                                                                                                                                                                                                |

---

## 4. Inventário de código genérico local

Legenda: **UP** = deveria ir para STYNX (lacuna da plataforma); **DUP** = duplica algo que o STYNX
já oferece; **LOC** = legitimamente local (composição, dados de negócio, ferramentas de governança).

### 4.1 `packages/`

| Caminho                                      |           Linhas | Classe            | Observação                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------- | ---------------: | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ui/src` (`@detran/ui`)             | 209 TS + 101 CSS | LOC (fino demais) | bootstrap, shell, breadcrumbs, feedback, tokens; re-exports STYNX. Shell sem grupos de navegação, _skip link_, região `aria-live`, persistência de tema; `aria-label="Navegação principal"` fixo em pt (fora do i18n). `loadCatalog` substitui o fallback e **não mescla catálogos STYNX** (WP-0 §3.4 não cumprido). Só RAIT e DASHBOARD usam o shell; `DetranBreadcrumbs` não é usado por nenhum app. |
| `packages/api-clients`                       | ~75.000 (gerado) | LOC               | tipos OpenAPI gerados por `tools/contracts`; contratos de negócio.                                                                                                                                                                                                                                                                                                                                     |
| `packages/senatran-adapter`                  |           12.372 | LOC               | fronteira nacional (ADR-0003); usa `IntegrationAdapter` corretamente.                                                                                                                                                                                                                                                                                                                                  |
| `packages/sefaz-adapter/src/http-adapter.ts` |              155 | **DUP**           | `fetch` + timeout + retry exponencial próprios; não usa `@stynx-nyx/integration-adapter` (que o SENATRAN usa). Sem nenhuma dependência STYNX.                                                                                                                                                                                                                                                          |

### 4.2 `backend/app/src` (composição, 8.999 l.)

| Caminho                                                                | Linhas | Classe                  | Observação                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------- | -----: | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.module.ts:203-290` `patchTenantContextInterceptorOrdering`        |    ~90 | **UP (dívida crítica)** | _monkey-patch_ de `TenantContextInterceptor.prototype.intercept`; comentário ainda diz 1.1.1; agora semeia contexto de rotas públicas do Portal (`portalPublic`). ADR-0005 §8 exigia reprovar a cada release.                                                                                                                                            |
| `*-stream.controller.ts` ×4 (dashboard, portal, teat, rait)            |   ~720 | **UP**                  | framing SSE copiado 4×: `Content-Type`, `: connected`, `: heartbeat`, `Last-Event-ID`, replay, `: dropped`.                                                                                                                                                                                                                                              |
| `*-stream.service.ts` ×4                                               |   ~850 | parcial UP / LOC        | poller de outbox + replay por relógio do banco é genérico; filtros por tópico/policy são de negócio.                                                                                                                                                                                                                                                     |
| `detran-runtime.ts`                                                    |  1.005 | LOC com trechos UP      | perfis de runtime e opções (LOC). Genéricos: `DetranLocalTokenVerifier` (~55), `DetranPersistedAuditSink` (~50, sink PG com cadeia hash), `DetranPostgresReadiness` (~30), `DetranPipelineSqlExecutor`/`PersistentPipelineStore`/`DurableIdempotencyBackend` (~180), `DetranPolicyEvaluator` (~50, reimplementa `DefaultPolicyEvaluator` + curinga `*`). |
| `detran-session-policy.ts`                                             |    162 | **UP**                  | sessão única ativa e exigência de fator forte sobre `@stynx-nyx/sessions`, que não oferece nenhum dos dois.                                                                                                                                                                                                                                              |
| `detran-error.filter.ts` + `domains/shared/src/errors/detran-error.ts` |     88 | **DUP**                 | `DetranError extends StynxError` só deriva `messageKey`; o filtro próprio serializa sem tradução, paralelo a `StynxErrorFilter` (que traduz por locale).                                                                                                                                                                                                 |
| `rait-transactional-audit.interceptor.ts`                              |    118 | **UP**                  | auditoria na mesma transação do comando — `AuditInterceptor` do STYNX grava depois, fora da transação.                                                                                                                                                                                                                                                   |
| `renach-webhook.guard.ts`                                              |     88 | **UP**                  | verificação HMAC + janela de clock-skew para webhooks de entrada.                                                                                                                                                                                                                                                                                        |
| `boat-renaest-job.service.ts` + `.providers.ts`                        |    438 | **UP/DUP**              | agendador próprio porque `@stynx-nyx/jobs` não propaga ator técnico (C-2-21).                                                                                                                                                                                                                                                                            |
| `boat-documents.ts`                                                    |    553 | LOC                     | ponte PDF/A (WeasyPrint + veraPDF) documentada em ADR-0018 Emenda 1.                                                                                                                                                                                                                                                                                     |
| `pec-*`, `teat-*`, `portal-*` providers/serviços                       | ~3.000 | LOC                     | integrações e wiring de negócio.                                                                                                                                                                                                                                                                                                                         |
| `generated/parameter-flags.ts`                                         |     23 | LOC                     | gerado.                                                                                                                                                                                                                                                                                                                                                  |

### 4.3 `backend/domains/shared/src` (`@detran/shared`, 3.304 l.)

| Caminho                                                                           | Linhas | Classe                   | Observação                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | -----: | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `policy.ts`                                                                       |  2.020 | LOC (dados) + UP (motor) | ~90% é a matriz de papéis/recursos (negócio). O motor (`policyKey`, curinga `recurso:*`, _strict rules_) é genérico. Exceções _hard-coded_ (`ch:retention:review`, `inf:rait-case:protocol`) merecem ser dados. |
| `roles.ts`                                                                        |    112 | LOC                      | catálogo canônico de papéis (ADR-0015).                                                                                                                                                                         |
| `decorators.ts` + `policy.guard.ts` (+ `app/src/detran-policy-error.guard.ts` 51) |   ~140 | **DUP**                  | `@Resource/@Action/@Public` e `DetranPolicyGuard` paralelos a `@RequirePermissions` + `StynxAuthorizationModule`, **que também está montado** com `DetranPolicyEvaluator` → dois caminhos de autorização.       |
| `tenant-context.ts` (`withTenantContext`)                                         |     28 | LOC (ADR-0005)           | invariante DETRAN; candidato a opção `requireActor` em `Database.tx`.                                                                                                                                           |
| `errors/if-match.ts`                                                              |     43 | **UP**                   | `If-Match`/ETag (428/412).                                                                                                                                                                                      |
| `events/outbox.ts` + `sql-outbox.ts`                                              |    135 | **DUP**                  | outbox própria vs `@stynx-nyx/outbox`.                                                                                                                                                                          |
| `documents/*` (facade, kinds, policy)                                             |   ~320 | LOC                      | fachada fina prevista em ADR-0018.                                                                                                                                                                              |
| `documents/document-trust.http-adapter.ts`                                        |    478 | **DUP**                  | cliente HTTP próprio de verificação de assinatura/manifesto; ADR-0018 manda usar `@stynx-nyx/signature` montado no app.                                                                                         |

### 4.4 Outros domínios (backend)

| Caminho                                                                                                                    | Linhas | Classe                         | Observação                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------- | -----: | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ch/clinical-reports/src/pades-signing.http-adapter.ts`                                                                    |    162 | **DUP (violação ADR-0018 §1)** | domínio chama provedor de assinatura PAdES direto; `@stynx-nyx/signature` nunca importado.                                                                                         |
| `ch/biometrics/.../biometric-verification.http-adapter.ts`, `ch/clinical-network/.../council-verification.http-adapter.ts` |    192 | **DUP**                        | `fetch` próprio sem `integration-adapter` (timeouts/retry/circuit).                                                                                                                |
| `ops/offline-sync/src/handwritten/*`                                                                                       |  2.903 | **DUP/UP**                     | protocolo de lote, numeração, conflitos; docs prometiam `@stynx-nyx/offline-sync`. Sem ADR que registre a decisão de não usar.                                                     |
| `ops/core/src/*`                                                                                                           |    476 | LOC/UP                         | portas de aplicação de sync; `SqlQueryable` repete tipo que `Transaction` já expõe.                                                                                                |
| `inf/deadlines/src/{calendar,clock,local-date}.ts`                                                                         |   ~150 | UP                             | calendário de dias úteis, relógio injetável, aritmética de data local; o STYNX `worklist` tem `WorklistBusinessCalendar`. Motor de prazos (`engine.ts`, catálogo de timers) é LOC. |
| `portal/requests/src/handwritten/idempotency.service.ts`                                                                   |    155 | **UP**                         | idempotência dentro da transação do comando (anula `@Idempotent()` com `@NoIdempotent()`).                                                                                         |
| `portal/identity/.../clock.ts`, `validation.ts`; `inf/rait-case/.../rait-operation-clock.ts`                               |   ~140 | LOC/UP                         | relógios duplicados por domínio.                                                                                                                                                   |
| `asQueryable`/`QueryableTransaction` em 21 arquivos                                                                        |   ~200 | desnecessário                  | `Transaction.query<TRow>()` já é tipado em `@stynx-nyx/data` 1.3.1; o _duck-typing_ existe para aceitar dublês — falta um fake oficial (`@stynx-nyx/testing`).                     |
| `ops/example` (`@detran/ops-example`)                                                                                      |    201 | resíduo                        | andaime de exemplo dentro de `domains/`.                                                                                                                                           |

### 4.5 Frontends (`apps/*/*/src`, excluindo specs/fixtures)

| Artefato                                                                 | Cópias / linhas                                                                 | Classe            | Observação                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cliente SSE + transporte                                                 | rait 460+196, dashboard 343+146, portal 424, teat/web 87 → **~1.650**           | **UP**            | todos reimplementam parser SSE sobre `HttpClient` (`observe:'events'`, `partialText`) porque `EventSource` não envia o bearer STYNX (DIVERGE-1); políticas divergentes (backoff 1…30 s × sem backoff; polling 15/30/60 s). |
| Error boundary + banner + códigos                                        | rait 395, dashboard 447, portal 648, teat/web 96 → **~1.590**                   | **UP** (núcleo)   | classificação `HttpErrorResponse` → envelope `StynxError` → tipo → `messageKey`. `ErrorInterceptor`/`ErrorBannerService` do `@stynx-nyx/angular` **não são usados** por nenhum app.                                        |
| Shells                                                                   | rait 376, dashboard 206, portal 208, teat/mobile 167, teat/web 133 → **~1.090** | UP (layout) + kit | kit só tem 46 l. de shell; STYNX não tem layout.                                                                                                                                                                           |
| `runtime-config.ts`                                                      | 4× ~40 = 158                                                                    | **DUP interna**   | RAIT e Portal idênticos exceto cabeçalho de comentário (`diff` = 0 linhas após o cabeçalho).                                                                                                                               |
| `title.strategy.ts`, `i18n-fallback.ts`, `i18n-token-key.ts`             | 3×+3×+2× ≈ 230                                                                  | DUP interna / UP  | `i18n-fallback` contorna a ausência de `StynxI18nService` fora do bootstrap (harness de rotas).                                                                                                                            |
| `auth-callback.page.ts`, `forbidden`, `not-found`, `unavailable`         | ~330                                                                            | DUP interna       | páginas utilitárias por app.                                                                                                                                                                                               |
| `manifest-routes.ts`                                                     | 3× ≈ 390                                                                        | DUP interna       | carregamento de rotas a partir do manifesto.                                                                                                                                                                               |
| `session.facade.ts` + guardas (`auth`, `role`, `permission`, `layer`…)   | ~730 + ~300                                                                     | parcial UP        | fachadas sobre `StynxSessionService` para signals/`can()`; guardas envolvem `stynxAuthGuard` para funcionar sem `provideStynxAuth` em testes.                                                                              |
| `dashboard/web/src/app/core/can.directive.ts`                            | 39                                                                              | **UP**            | substitui `*stynxHasPermission`: não honra `recurso:*` e exige `active$` indisponível em teste (#123).                                                                                                                     |
| `testing/stynx-session.stub.ts`                                          | 3× = 261                                                                        | **UP**            | `@stynx-nyx/angular-auth/testing` e `@stynx-nyx/angular/testing` exportam `{}` em 1.3.1.                                                                                                                                   |
| `data/idempotency-key.ts`                                                | rait 73 + portal 70                                                             | UP                | geração de chave + SHA-256 no cliente.                                                                                                                                                                                     |
| Uploaders com hash                                                       | portal 272 + dashboard 123                                                      | **DUP**           | `StynxDocumentUploadComponent` (`angular-storage`).                                                                                                                                                                        |
| `teat/web/.../teat-translate.pipe.ts`, `teat/mobile/.../i18n.service.ts` | 63                                                                              | DUP               | equivalentes a `StynxTranslatePipe`/`StynxI18nService`.                                                                                                                                                                    |
| `teat/web/.../data-table.component.ts`                                   | 13                                                                              | DUP (stub vazio)  | tabela vazia; o guia proíbe criar tabela.                                                                                                                                                                                  |
| Handwritten HTTP clients (`*.client.ts`, 27 arquivos)                    | ~2.900                                                                          | LOC (contratos)   | tipados sobre `@detran/api-clients`; aceitável, mas um gerador de cliente (não só tipos) eliminaria a maioria.                                                                                                             |

### 4.6 `tools/`

| Caminho                                                                                                                                                                    | Linhas | Classe                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `blueprints/` (gerador de módulos Nest/DDL)                                                                                                                                |    574 | LOC — mas o padrão "blueprint → repositório/controlador/DDL com RLS" é genérico; candidato de médio prazo a `stynx` CLI (`create-stynx-app` hoje só inicializa). A versão `1.3.1` está _hard-coded_ em `generate.mjs:370-371`. |
| `contracts/` (OpenAPI, clientes, checagem de comandos)                                                                                                                     |  3.867 | LOC/UP parcial                                                                                                                                                                                                                 |
| `check-rls-ddl.ts`, `check-rls-smoke.ts`, `verify-controller-decorators.ts`                                                                                                |    373 | UP parcial (verificações RLS são genéricas ao modelo STYNX)                                                                                                                                                                    |
| `check-role-catalog.ts`, `check-lifecycle-vocabulary.ts`, `verify-senatran-boundary.ts`, `verify-pec-*`, `domain-boundaries/`, `parameters/`, `docs/`, `orchestra/`, `ci/` | ~6.000 | LOC (governança do produto)                                                                                                                                                                                                    |
| `detran-stack.sh` (não versionado, novo)                                                                                                                                   |    386 | LOC                                                                                                                                                                                                                            |

---

## 5. Lacunas por severidade

### Crítica

- **C1 — _Monkey-patch_ de interceptor da tenancy em produção** (`backend/app/src/app.module.ts:203-290`).
  Muta o protótipo de uma classe publicada, contém regra de negócio (Portal público) e está
  rotulado como compatibilidade 1.1.1. Qualquer mudança interna em `@stynx-nyx/tenancy` quebra
  silenciosamente o isolamento de tenant. ADR-0005 §8 pedia reavaliação a cada release — não houve.
- **C2 — Assinatura digital fora do substrato** (`ch/clinical-reports/.../pades-signing.http-adapter.ts`,
  `shared/.../document-trust.http-adapter.ts`, 640 l.). ADR-0018 §1 proíbe domínios de chamarem
  provedor de assinatura; `@stynx-nyx/signature` está declarado e não é importado nem montado
  (`StynxSignatureModule`/`StynxPdfModule` ausentes do `AppModule`).

### Alta

- **A1 — Pacotes STYNX previstos em ADR e substituídos por código local sem ADR de desvio**:
  `outbox` (ADR-0016), `jobs` (ADR-0016/0020), `offline-sync` (ADR-0006), `notifications`
  (ADR-0016/0019), `worklist` (handoff W1.4). O caso `jobs` tem justificativa técnica
  registrada (C-2-21); os demais não.
- **A2 — SSE sem suporte na plataforma**: ~3.200 l. entre backend (4 controladores/serviços) e
  frontend (4 clientes) com políticas divergentes — risco de comportamento inconsistente de
  reconexão/replay entre apps.
- **A3 — Dois caminhos de autorização** (`DetranPolicyGuard` + `StynxAuthorizationModule` com
  `DetranPolicyEvaluator`): duplicação e risco de divergência de decisão.
- **A4 — Catálogos i18n dos pacotes STYNX não mesclados** (WP-0 §3.4): `StynxConfirmDialog`,
  paginação, auth e tenancy exibem chaves cruas ou textos padrão em inglês; `loadCatalog` do app
  sobrescreve o fallback do kit.

### Média

- **M1 — Error boundary Angular reimplementado 4×** (~1.590 l.); `ErrorInterceptor`/
  `ErrorBannerService` do STYNX ignorados.
- **M2 — Auditoria e idempotência transacionais** feitas localmente (RAIT, Portal) por limitação
  do STYNX.
- **M3 — Sessão única / fator forte** (`detran-session-policy.ts`) fora do `@stynx-nyx/sessions`.
- **M4 — Adapters HTTP sem `integration-adapter`** (SEFAZ, biometria, conselho: ~350 l.) —
  resiliência e telemetria inconsistentes com o SENATRAN.
- **M5 — Kit `@detran/ui` insuficiente**: shell adotado só por 2 apps; `teat/web` e
  `teat/mobile` não importam `@detran/ui/styles`; RAIT importa `angular-ui`/`angular-auth` direto
  52+45 vezes contra a regra do guia.
- **M6 — Ausência de dublês oficiais de teste** (sessão Angular, `Transaction`): 261 l. de stubs
  e 21 arquivos com _duck-typing_.

### Baixa

- **B1** — Dependências mortas: `@stynx-nyx/signature` e `@stynx-nyx/audit` (backend/app),
  STYNX em `boat/mobile` (4 deps, 0 imports).
- **B2** — Duplicação interna trivial entre apps (runtime-config, title strategy, auth-callback,
  manifest-routes: ~1.100 l.).
- **B3** — Resíduos: `@detran/ops-example`, `teat-data-table` vazio, arquivo
  `apps/teat/web/src/app/data/kernel STYNX.client.ts` (espaço no nome, versionado).
- **B4** — Documentação desatualizada: DT-001/#121 (registry já publica tudo), ADR-0006 kit
  (Angular 21, peer <22), ADR-0008 (`integration-adapter@1.1.1`), comentário do patch (1.1.1),
  `CLAUDE.md` (DEVAI 1.4.5 vs 1.5.6), `law/README.md` (DEVAI 1.4.5).
- **B5** — Versão STYNX _hard-coded_ no gerador de blueprints (`tools/blueprints/generate.mjs`),
  sem fonte única com os manifestos.

---

## 6. Candidatos a upstream (STYNX) e recomendações

| #   | Candidato                                                                                                                          | Pacote destino                                       | Código local a remover                                                                | Prioridade |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| U1  | Correção de ordem `RequestContext`×`TenantContext` + suporte a rotas públicas com tenant resolvido por host (`@PublicTenantRoute`) | `tenancy` / `core`                                   | patch em `app.module.ts` (~90)                                                        | P0         |
| U2  | SSE: `StynxSseController` (framing, heartbeat, `Last-Event-ID`, replay a partir da outbox)                                         | `backend` ou `outbox`                                | 4 controladores (~720) + parte dos serviços                                           | P1         |
| U3  | Cliente SSE Angular autenticado (`provideStynxEventStream`, backoff, fallback polling, 401/403/429)                                | `angular`                                            | 4 serviços + transportes (~1.650)                                                     | P1         |
| U4  | Propagação de `actorId` técnico e separação de papel na execução de `@stynx-nyx/jobs`                                              | `jobs`                                               | agendadores BOAT/DASHBOARD (~600)                                                     | P1         |
| U5  | Modo transacional para auditoria (`AuditInterceptor` na tx do handler) e idempotência (`begin/commit` na tx)                       | `backend`/`audit`, `idempotency`                     | `rait-transactional-audit.interceptor.ts`, `portal/.../idempotency.service.ts` (~270) | P1         |
| U6  | Curinga `recurso:*`/`*` no `DefaultPolicyEvaluator` e no `*stynxHasPermission`; decoradores `@Resource/@Action`                    | `backend`, `angular-auth`                            | `DetranPolicyEvaluator`, `DetranPolicyGuard`, `decorators.ts`, `dashCan` (~300)       | P1         |
| U7  | Política de sessão: sessão única e fator forte                                                                                     | `sessions`                                           | `detran-session-policy.ts` (162)                                                      | P2         |
| U8  | `If-Match`/ETag e 428/412 padronizados                                                                                             | `backend`                                            | `if-match.ts` (43)                                                                    | P2         |
| U9  | Error boundary Angular (`classifyStynxError`, `StynxErrorBannerComponent` com mapa por prefixo)                                    | `angular`, `angular-ui`                              | núcleo dos 4 boundaries (~800 genéricas)                                              | P2         |
| U10 | Shell/layout com grupos de navegação, skip link, `aria-live`, tema persistido                                                      | `angular-ui`                                         | shells (~1.090) + kit                                                                 | P2         |
| U11 | Dublês de teste: `StynxSessionService` fake, `Transaction` fake, harness de i18n                                                   | `angular-auth/testing`, `angular/testing`, `testing` | stubs (261), `asQueryable` (21 arquivos), `i18n-fallback` (3×)                        | P2         |
| U12 | Verificador HMAC de webhook de entrada                                                                                             | `integration-adapter` ou `backend`                   | `renach-webhook.guard.ts` (88)                                                        | P3         |
| U13 | Calendário de dias úteis/relógio injetável compartilhado                                                                           | `worklist` ou `core`                                 | `inf/deadlines` calendar/clock/local-date (~150)                                      | P3         |
| U14 | Utilitário Angular de `Idempotency-Key`                                                                                            | `angular`                                            | 2× ~70                                                                                | P3         |
| U15 | Gerador de módulo a partir de blueprint (repo/controller/DDL RLS)                                                                  | `cli`                                                | `tools/blueprints` (574)                                                              | P3         |

### Recomendações (em ordem)

1. **Architect**: ADR curta "Divisão STYNX × DETRAN" com tabela canônica (pacote STYNX → uso
   DETRAN → desvio aprovado) e um _backlog de upstream_ rastreável (issues no repositório
   STYNX), substituindo a noção implícita espalhada em ADR-0005/0006/0016–0021.
2. **Architect**: reabrir ADR-0005 §8 — registrar que o patch permanece em 1.3.1, separar a
   lógica do Portal público do patch e abrir U1 no STYNX com teste A/B como evidência.
3. **Architect/Engineer**: para cada pacote de A1, decidir explicitamente "adotar" ou "desvio
   registrado"; começar por `outbox` (menor atrito) e `signature` (C2, obrigação de ADR-0018).
4. **Engineer**: aplicar o passo §3.4 do WP-0 (mesclar `@stynx-nyx/*/catalogs/pt-BR.json` no
   `loadCatalog` do kit, compondo com o catálogo do app em vez de sobrescrever).
5. **Engineer**: migrar SEFAZ e adapters `ch/*` para `@stynx-nyx/integration-adapter`.
6. **Engineer (frontend)**: enquanto U2/U3/U9/U10 não chegam ao STYNX, promover as versões
   RAIT de SSE, error boundary, runtime-config, title strategy, i18n-fallback e auth-callback
   para `@detran/ui` (uma cópia em vez de 4) — isso também facilita o upstream posterior.
7. **Engineer**: remover dependências mortas (B1) e resíduos (B3); corrigir documentação (B4);
   fonte única de versão STYNX para o gerador (B5).
8. **Owner/Architect**: atualizar DT-001 e a issue #121 — o bloqueio de registry não existe mais.

---

## 7. Totais aproximados de código genérico local (manuscrito, sem specs)

| Área                            | Linhas genéricas |                                 das quais DUP de algo que o STYNX já tem |
| ------------------------------- | ---------------: | -----------------------------------------------------------------------: |
| Frontend (apps + kit)           |           ~6.500 | ~700 (uploaders, i18n pipe/serviço, tabela, error interceptor não usado) |
| Backend app + shared            |           ~2.300 |               ~900 (outbox, authz paralela, error filter, trust adapter) |
| Backend domínios                |           ~3.700 |                              ~3.300 (offline-sync, adapters HTTP, PAdES) |
| Tools (genérico reaproveitável) |             ~950 |                                                                        — |
| **Total**                       |      **~13.000** |                                                               **~4.900** |

O restante (~8.000) é lacuna genuína do STYNX (ou do kit) e forma a lista de upstream da §6.
