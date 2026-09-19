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
                          error-boundary, error-banner.component, field-errors.directive,
                          clock, offline-document.store, runtime-config, title.strategy,
                          i18n-fallback, manifest-routes, guards/, pages/
  features/<module>/      <module>.routes.ts (lazy; caminhos completos derivados do manifesto)
  shared/                 placeholder-page.component (rotas ainda não construídas) e os onze
                          compartilhados do par 1 (CTG-0003a §5) + service-wizard.store
  forms/                  14 schemas zod + form-gate.ts + attachments.ts (M12; CTG-0003a §6)
  data/                   portal.client.ts (leituras e comandos), idempotency-key.ts,
                          portal-command.models.ts
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

## Par 1 do app funcional (CTG-0003a): núcleo, compartilhados, schemas

- `data/portal.client.ts`: comandos do ciclo comum (`createRequest`, `saveDraft`,
  `requestAttachmentUpload`, `uploadToSignedUrl`, `completeAttachment`, `submitRequest`,
  `withdrawRequest`, `respondDiligence`, `elevateAssurance`, `completeElevation`,
  `downloadReceipt`) sobre o `HttpClient` com `observe: 'response'` (`ETag` →
  `CommandResult.etag`). `If-Match` é sempre o `etag` lido (`null` omite o cabeçalho; o servidor
  responde 428). `Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>` (M17;
  `data/idempotency-key.ts`: `canonicalJson` + SHA-256 via `crypto.subtle`), recalculada a cada
  chamada. Única saída de `/v1/portal/*`: o `PUT` na URL assinada do storage, por `fetch` puro,
  sem `Authorization` e com `credentials: 'omit'`. As formas 2xx que o OpenAPI ainda não declara
  ficam em `data/portal-command.models.ts` (OD-P59; a UI nunca simula resultado, M15).
- `core/error-boundary.ts`: `classifyError` (`code`, `status`, `messageKey`, `context`,
  `fields`, `retryAfter`) e `presentError` → `ErrorPresentation` (severidade, próximo passo e
  rota, canal alternativo) pela tabela `ERROR_PRESENTATION` dos 67 códigos do catálogo. Nunca
  navega para `context.resumeRoute` do servidor; a rota de retomada é a do app.
  `core/error-banner.component.ts` (`portal-error-banner`, `StynxBanner` do kit, `role="alert"`
  com foco para erro, `role="status"` para avisos) e `core/field-errors.directive.ts`
  (`form[portalFieldErrors]`: `aria-invalid`/`aria-describedby` e foco no primeiro campo).
- `core/session.facade.ts`: `account`, `representations`, `loading`, `loadError`, `load()`,
  `requirementFor()`, `canPerform()` (fail-closed: ato desconhecido → `false`),
  `requestElevation()` (grava o `ResumePoint` ANTES do `POST`) e `completeElevation()`. Sessão
  inativa → conta zerada e `OfflineDocumentStore.clear()`; o `ResumeService` sobrevive ao
  redirecionamento OIDC (`peek()` no callback, `resume()` só no `ServiceWizard.resumeFrom`).
- `core/clock.ts` (`PortalClock`): único relógio do domínio (`acceptedAt` do diálogo de
  consequência, validade do cache offline); os specs o substituem por `useValue`.
- `shared/`: `citizen-status-badge` (+ `badgeOf`, única relação estado → badge, lida do
  catálogo), `deadline-card` (sem aritmética de datas), `action-triplet` (sempre as três ações),
  `service-wizard` + `service-wizard.store` (provido no componente; a feature lê o store pelo
  injector do componente e projeta o formulário do passo 2), `prefilled-field`,
  `attachment-uploader`, `consequence-dialog`, `signature-step`, `protocol-receipt`,
  `alternative-channel-note`, `assurance-explainer`. Nenhum calcula prazo, tempestividade,
  elegibilidade ou nível: tudo chega do servidor; tokens crus só em `data-*`.
- `forms/`: um schema zod por ato (`<Nome>Schema`, `strict`) e o `<NOME>_GATE: FormGate`
  transcrito da spec §7 — documentação verificável que nunca decide permissão; nenhum arquivo de
  `forms/` importa facade, guardas ou relógio.

## Par 2 do app funcional (CTG-0003b): trilha de apelação

- `data/portal.client.ts`: sete leituras (`listAits`, `getAit`, `getAitPoints`,
  `getPointsSummary`, `listRequests`, `getRequest`, `getDecision`) — query por `HttpParams` só
  com as chaves presentes, `encodeURIComponent` nos caminhos, nenhuma envia `Idempotency-Key`
  nem `If-Match`; `getRequest` observa a resposta e devolve `CommandResult<RequestDetail>` com
  o `ETag` (o `If-Match` do `withdraw`). Tipos em `data/portal-read.models.ts` (só `import type`
  do gerado; os corpos que o OpenAPI deixa livres são transcritos do contrato de rotas —
  `source_pending` marca o que OD-P69/P72/P74 ainda não fecham) e `data/read-status.ts`
  (`ReadStatus` + `readStatusFor(presentation)`: mapeia a apresentação do `ErrorBoundary` ao
  estado da tela; nunca lê `navigator`).
- Facades por módulo, `@Injectable()` sem `providedIn`, providas na página (estado por
  navegação, sem cache): `features/autos/autos.facade.ts` (T-14/T-01; filtro e paginação no
  servidor; lista e resumo de pontos independentes; pontos do AIT lidos depois do detalhe),
  `features/processos/processos.facade.ts` (T-06…T-11; ordenação por urgência SÓ pelo
  `nextAction.dueOn` recebido, comparado como texto ISO; `withdraw` com `If-Match` do `ETag`;
  `respondDiligence`; `nextStepRoute`), `features/{defesa,indicacao,pagamento}/*.facade.ts`
  (contexto do ato, alvo do wizard, retomada por `shared/wizard-resume.ts` — `ResumeService` ou
  pedido aberto em composição —, `existingRequestId`, `deadlines` sem transformação). As
  leituras das facades de lista/detalhe resolvem ao despachar e entregam o resultado pelos
  signals; os comandos resolvem com a resposta e releem o detalhe.
- `shared/payment-comparison.component.ts` (`portal-payment-comparison`): faixas LADO A LADO num
  único `fieldset`, ordem `PAYMENT_TIER_ORDER`, sem destaque; faixa que renuncia → advertência
  antes do clique e `waiverRequested` (a página abre o `ConsequenceDialog` `renuncia_40` e só então
  `selectTier`); faixa 40 visível e indisponível com motivo (`PAYMENT_FLAGS`, H.53/OD-P05, em
  `features/pagamento/payment-flags.ts`); valores e datas formatados pelos pipes do kit no locale
  do runtime de i18n; nenhum cálculo. `shared/process-timeline.component.ts`
  (`portal-process-timeline`): ordem recebida, texto do catálogo por evento (token só em
  `data-*`), "com você × com o órgão" pelos `deadlines[]`/diligências, documentos baixáveis ou
  "indisponível" (nunca link vazio). `shared/prefilled-summary.component.ts`: um
  `PrefilledField` por chave do mapa fechado `PREFILLED_LABEL_KEYS` (vazio até OD-P82).
- 13 páginas em `features/{autos,defesa,indicacao,pagamento,processos}/pages/`, cada uma com
  `host: { 'data-screen': 'T-nn' }`, `<h1 tabindex="-1">` focado ao concluir o carregamento,
  região de estado `role="status"` (e, nas leituras, uma região `role="alert"`) presentes desde o
  carregamento, `PortalErrorBannerComponent` para erros e `AlternativeChannelNote` em toda tela
  de ato e indisponibilidade. Rotas: `moduleRoutes(module, { path: { component, title } })` —
  guardas continuam vindo do manifesto. Os links levam o atributo `routerLink` espelhando a rota
  (localização por atributo, como `data-*`).
- Não há tabela de prazo, tempestividade, fila, nível ou disponibilidade no cliente: tudo chega
  do servidor; delegações reais (`422 SERVICE_UNAVAILABLE { delegacao_indisponivel_r0007 }`)
  aparecem como indisponíveis com motivo e canal, nunca simuladas (M15). Sem `canDeactivate`
  neste par (OD-P79); polling/SSE, `/sne` e "formato acessível" persistente ficam para o par 3.

## Par 3 do app funcional (CTG-0003c): greenfield + PWA

- `data/portal.client.ts`: leituras e comandos do par 3 (`getService`, `listInbox`,
  `markInboxRead`, `getSneEnrollment`, `enrollSne`, `cancelSne`, `createPushSubscription`,
  `updatePreferences`, `getCnh`, `downloadCnhDocument`, `listVehicles`, `getVehicleClearance`,
  `issueCrlv`, `listCrashes`, `getCrash`, `listExams`, `getExam`, `listManifestations`,
  `getManifestation`, `createManifestation`, `acknowledgeManifestation`, `createEvaluation`,
  `getServiceCharterDeadline`) — `Idempotency-Key` sempre nos comandos (`<ato>:<alvo|none>:<fp>`),
  `If-Match` só em `PUT preferences` (valor do chamador; `null` omite e o servidor responde 428 —
  OD-P87), `cancelSne` sem corpo envia `{}`, `downloadCnhDocument` em blob com o erro decodificado.
  Tipos em `data/portal-read.models.ts` (só `import type` do gerado; formas livres transcritas do
  contrato de rotas e marcadas `source_pending` — OD-P91).
- `core/realtime.service.ts` (`RealtimeService`, `providedIn: 'root'`): `GET /v1/portal/stream`
  por um transporte injetável (`PortalStreamTransport`; implementação padrão pelo `HttpClient`
  STYNX com `observe: 'events'` + `partialText` — o `EventSource` nativo não envia o bearer,
  [DIVERGE-1]/OD-P96), parser incremental do `text/event-stream`, `on(type)`, `events`, `tick`;
  queda → `polling` a cada `POLLING_INTERVAL_MS` (60 s, único intervalo) com reabertura no mesmo
  compasso; `429 RATE_LIMITED { retryAfter }` adia a reabertura; `401`/`403` param; sessão
  inativa → `stop()`; reabertura sem frame = `204` → próxima abertura sem `Last-Event-ID`.
  `core/push.service.ts` (`PushService`): `SwPush` (opcional fora de `provideServiceWorker`) +
  `POST push-subscriptions`, só por gesto explícito; `PUSH_SERVER_PUBLIC_KEY` é `null` (OD-P88) →
  push `unavailable`.
- Páginas reais do `core` (`app.routes.ts` só mudou no mapa `CORE_PAGES`): `/inicio`
  (`core/pages/inicio.page.ts` + `inicio.facade.ts`: três leituras em paralelo, cada uma com o seu
  estado; pendências ordenadas SÓ pelo `dueOn` recebido; "Falta 1 passo" pelo `ResumeService`),
  `/conta` (titular sem máscara; representações em lista sem seleção — OD-P48; "sair" =
  `StynxSessionService.logout()`, [DIVERGE-29] resolvido), `/acessibilidade` (declaração estática)
  e `/` (catálogo real pelo cache do par 1; falha não esconde a entrada gov.br — OD-P50).
- Sete compartilhados novos em `shared/`: `notification-list` (ciência ficta TAL COMO recebida,
  [DIVERGE-4]), `sne-consent` (quatro efeitos antes do botão; `effectsAck` com o enum do fio,
  OD-P61; sem faixa de pagamento), `digital-document-card` (categoria A exige QR; senão C),
  `clearance-status` (três seções; multa sob recurso nunca bloqueia; nenhuma soma), `own-data-panel`
  (sem máscara; correção ao lado do dado), `manifestation-form` (recebimento irrecusável; sem anexos,
  [DIVERGE-19]) e `evaluation-form` (escala pendente — OD-P65 — numérica sem min/max).
- Oito módulos com facades providas na página e 14 páginas: `notificacoes` (T-12, preferências,
  T-09), `documentos` (T-16, `/veiculos`, T-17 — `OfflineDocumentStore` só com validade do servidor
  e categoria A; documento offline só do MESMO veículo, [DIVERGE-13]), `sinistros` (T-18 com busca
  LOCAL, [DIVERGE-14]; T-19), `exames` (T-20 com `legalLabel` tal qual; junta pelo ciclo comum com
  início por ato do cidadão), `atendimento` (T-21/T-22/T-26; `POST evaluations` para pedido e
  manifestação, [DIVERGE-18]), `privacidade` (T-24 pelo ciclo comum `lgpd_declaracao`),
  `assinatura` (T-27; navegação ao `redirectUrl` é da página) e `catalogo` (T-25 lista/detalhe;
  T-15 estática — OD-P90). Nenhuma rota do manifesto usa `PlaceholderPageComponent`.
- Regras transversais mantidas: nenhum prazo, ciência ficta, validade ou fila calculados no cliente;
  tokens só em `data-*`; offline é classificado SÓ pelo `ErrorBoundary` (status 0 e browser
  desconectado — A12(a)); nenhuma facade lê `navigator`; indisponibilidades do backend (M15)
  mostradas com motivo e canal, nunca simuladas. A regra §3.9 da rota funcional vive em
  `core/functional-route.ts` (`functionalRouteFor`), usada pela Carta de Serviços e pela home.
