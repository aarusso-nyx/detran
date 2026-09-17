# R-0014 — frente `portal-pwa` (WP-P4…P6 do PORTAL: fichas, mapa de tradução, i18n, PWA e homologação)

**Status:** **aberta em 2026-09-17** pelo maestro Fable 5.1 (janela 1 de 4; `AUTHORIZATION.md`).
Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`. Worktree da sessão
`/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac` (substitui
`detran-worktrees/portal-pwa`, inexistente), branch `orchestra/portal-pwa` (renomeado antes de
qualquer publicação), base `59423c9` (= `origin/main`, PR #59).
**Instrução de abertura do Owner (2026-09-17):** este é o **primeiro app do repositório** — a rodada
fixa o padrão de scaffold em `apps/portal/web` e resolve **OD-P46** (allowlist de namespaces i18n no
`parameter-catalogue.md`, lida por `tools/parameters/verify.mjs`); **R-0012 (`rait-web`) copia o
padrão** daqui, invertendo o que `orchestra/README.md` §4.17 e §Lições "Padrão de app" previam.
**Concorrência:** abre já e **nenhum grupo está preso**: `portal-backend` R-0009 está em `main` (PC-0006, PRs #54/#56/#57). Delegações reais (defesa, indicação, pagamento) continuam a cargo de R-0007, que troca `UnavailableDelegationTarget` em `backend/app/src/portal-delegation.providers.ts`; esta rodada não as espera.
**Janelas previstas:** 4.

## Metas

1. **Fichas** (WP-P4): `docs/framework/product/transversal/portal/screens/IU-PORTAL-<T-nn>.md`
   para as 27 telas, no padrão do `screen-specification-standard.md` da origem (identidade, acesso,
   entrada, dados, estados, comandos, saída, segurança, acessibilidade, testes), com os estados
   obrigatórios (carregando, vazio, sem elegibilidade, erro recuperável, sem permissão, indisponível)
   e as regras de conteúdo de [IU-PORTAL-001] §E (linguagem cidadã). Baseline do KB sobe em 27.
2. **Mapa de tradução e i18n**: tabela única de estados internos (RAIT/PEC/BOAT/infração → situação
   cidadã) em `apps/portal/web/src/i18n/portal.pt-BR.json`; textos jurídicos versionados
   (consequências, quatro efeitos do SNE, termo de renúncia dos 40 % — H.53: desligado por flag,
   texto existe); schemas dos 14 formulários (`portal-frontends.md` §7) em
   `apps/portal/web/src/app/forms/*.schema.ts`.
3. **PWA** (WP-P5): `apps/portal/web` (`@detran/portal-web`; Angular 22; `@detran/ui` para
   primitivos, shell próprio; PWA com cache cifrado só para CNH-e/CRLV-e; 13 módulos; ~40 rotas da
   §4; componentes da §5; guardas de nível, vínculo e disponibilidade; `ResumeService`; a11y AA +
   eMAG). Scripts `build|test|lint|typecheck` criados nesta rodada e ligados a `pnpm check`.
   Auditoria automática de a11y por rota: `axe-core` em TestBed (script `test`) — Lighthouse CI
   só se a TASK-0001 confirmar ferramenta instalável sem serviço externo; caso contrário registrar
   em §Bloqueios e manter `axe`.
4. **Integração e homologação** (WP-P6): cotação/reconhecimento via `CdtPort`, CNH-e/CRLV-e,
   push web e adesão SNE **no mock** (`senatran-mock`) com e2e das 11 jornadas
   ([JRN-PORTAL-001…011]) sobre as fixtures; teste "nenhum token interno em resposta `/v1/portal/*`"
   (lint de payload contra o vocabulário de `14-inf-lifecycle-vocabulary.sql` e dos workflows).
   A homologação com o SNE real é passo institucional fora da rodada (registrar em backlog).
5. Documentação: `portal-build-pack.md` §WP-P4…P6 executados (gates reais); `portal-frontends.md`
   §9/§10; backlog; `apps/portal/mobile/README.md` mantém "adiado" (OD-P12).

## Decisões do maestro (Architect, 2026-09-17) — M1…M16

Valem como contrato para os workers; o que não está aqui nem nas fontes vira `OD-*`.

- **M1 — Padrão de app (Owner).** `apps/portal/web` é o primeiro frontend e fixa o padrão que R-0012,
  R-0013, R-0015 e R-0016 copiam sem variantes: pacote `@detran/portal-web` (`private`, `type:
module`, `engines.node >=24 <25`), scripts **`build` = `ng build`**, **`test` = `vitest run
--config vitest.config.ts`**, **`lint` = `eslint .`**, **`typecheck` = `tsc -p tsconfig.app.json
--noEmit && tsc -p tsconfig.spec.json --noEmit`**; `README.md` do app descreve o padrão e diz
  "R-0012 copia esta estrutura".
- **M2 — Dependências (versões verificadas no registry em 2026-09-17; o maestro cria o
  `package.json` e roda `pnpm install`, §4.18).** `@angular/{core,common,compiler,compiler-cli,
platform-browser,router,forms,service-worker}` **22.1.6** (mesma versão já no lockfile),
  `@angular/cli` **22.1.6**, `@angular/build` **22.1.6**, `rxjs ^7.8.2`, `tslib ^2.8.1`,
  `typescript 6.0.3`, `vitest ^4.1.7` (peer de `@angular/build` é `^4.0.8`; **não** 5.x), `jsdom
^29.0.2`, `axe-core 4.13.0`, `eslint ^10.9.0`, `angular-eslint 22.5.0`, `typescript-eslint
8.70.0`, `eslint-config-prettier ^10.1.8`; `@detran/ui workspace:*`, `@detran/api-clients
workspace:*` (tipos), `@stynx-nyx/{angular,angular-auth,angular-i18n,angular-ui,angular-tenancy}
1.3.1`. Nenhuma outra dependência sem adenda.
- **M3 — Runner de testes.** `vitest` + `jsdom` como `packages/ui` e `detran-ui-guide.md` §5:
  `vitest.config.ts` (`environment: 'jsdom'`, `globals: true`, `include: ['src/**/*.spec.ts']`,
  `setupFiles: ['src/test-setup.ts']`); `src/test-setup.ts` importa `@angular/compiler` e faz (A7: `vitest.config.ts` aplica `angularJitApplicationTransform` para as APIs `input()`/`output()`/`model()`/`viewChild()`)
  `TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting())` + `afterEach(() =>
TestBed.resetTestingModule())`. **Specs nunca inicializam o ambiente.** Componentes usam
  `template:`/`styles:` inline (JIT nos testes; AOT no build). Lighthouse CI **não** entra (exige
  Chrome headless/serviço — §Bloqueios B1); a11y automática = `axe-core` no TestBed por rota
  (`src/app/a11y/axe.spec-helper.ts`, Inspector).
- **M4 — Build.** `angular.json` com projeto `portal-web`, builder `@angular/build:application`
  (`browser: src/main.ts`, `index: src/index.html`, `tsConfig: tsconfig.app.json`, `outputPath:
dist`, `styles: [src/styles.css]`, `assets` de `public/` — `manifest.webmanifest`,
  `runtime-config.js`, ícones — e `serviceWorker: ngsw-config.json` na configuração `production`,
  que é a padrão). `ng build` roda sem rede. `runtime-config.js` só com `tenantId`, `oidcAuthority`,
  `clientId` (`portal-frontends.md` §1); lido em `src/app/core/runtime-config.ts`.
- **M5 — Lint.** `eslint.config.js` (flat): `angular-eslint` (ts + template recommended),
  `typescript-eslint` recommended, `eslint-config-prettier`; `@typescript-eslint/no-explicit-any`
  `error` em `src` e `off` em `*.spec.ts`; `no-unused-vars` com `^_`;
  `@angular-eslint/prefer-on-push-component-change-detection` e `prefer-standalone` `error`;
  `ignores: ['dist/**', '.angular/**']`.
- **M6 — `pnpm check`.** Raiz `package.json`: mover `pnpm --filter @detran/ui build` para **antes**
  de `pnpm typecheck` (o app tipa contra `packages/ui/dist`) e acrescentar ao fim
  `&& pnpm --filter @detran/portal-web lint && pnpm --filter @detran/portal-web test && pnpm --filter @detran/portal-web build`.
  `packages/ui/package.json` ganha a exportação `"."` (`types: ./dist/types/detran-ui.d.ts`, `default:
./dist/fesm2022/detran-ui.mjs`) — hoje só `./styles` é exportado e nenhum app consegue importar
  o kit (lacuna do WP-0; **aplicado pelo maestro como Engineer no checkpoint de dependências**, provado pelo runner; `packages/ui` sai da fronteira de TASK-0004).
- **M7 — Estrutura (spec §9, fixada).** `src/app/{core,features,shared,data,i18n}`;
  `core/guards/{auth,assurance,entitlement,service-availability}.guard.ts` exportando
  `portalAuthGuard: CanActivateFn`, `assuranceGuard(level: 'simples' | 'avancada'): CanActivateFn`,
  `entitlementGuard(kind: 'ait' | 'request' | 'vehicle' | 'crash' | 'exam' | 'manifestation'):
CanActivateFn`, `serviceAvailabilityGuard(serviceKey: string): CanActivateFn`;
  `core/{citizen-shell.component,brand.service,session.facade,resume.service,error-boundary,
offline-document.store,runtime-config}.ts`; `app.routes.ts` exporta `PORTAL_ROUTES: Routes`;
  **`app.route-manifest.ts` exporta `PORTAL_ROUTE_MANIFEST`** (uma entrada por rota da §4:
  `{ path, screen: 'T-nn' | null, sheet: 'IU-PORTAL-Tnn' | null, module, access: 'anonimo' |
'simples' | 'avancada' | 'nenhum_ou_simples', serviceKey?: string, journeys: string[] }`) — é a
  tabela que os testes tela ↔ ficha ↔ rota e os guardas por rota verificam. Rotas auxiliares fixadas:
  `/vinculo/por-que-nao-vejo` (destino do `entitlementGuard`) e `/servico-indisponivel/:serviceKey`
  (destino do `serviceAvailabilityGuard`), ambas `simples`, `screen: null`.
- **M8 — Guardas (comportamento).** `portalAuthGuard`: `SessionFacade.active()` falso →
  `UrlTree('/', { queryParams: { retomar: state.url } })`. `assuranceGuard(level)`:
  `SessionFacade.assuranceLevel()` < nível → `UrlTree('/assinatura/elevacao', { queryParams: {
retomar: state.url } })`; ordem `simples < avancada < qualificada`; nunca exige `qualificada`
  ([RN-PORTAL-101]). `entitlementGuard(kind)`: `EntitlementFacade.check(kind, id)` (id do
  `:aitId|:requestId|:vehicleId|:crashId|:examId|:manifestationId`) falso →
  `UrlTree('/vinculo/por-que-nao-vejo', { queryParams: { recurso: kind, id } })`.
  `serviceAvailabilityGuard(key)`: `ServiceCatalogFacade.availability(key)` com `status ===
'unavailable'` → `UrlTree('/servico-indisponivel/<key>')` (`partially_available` entra na tela,
  que limita o escopo); nunca 404. Ordem por rota: auth → assurance → availability → entitlement.
  Acesso `anonimo` e `nenhum_ou_simples`: sem guarda (sessão opcional). Matriz ato → nível vem de
  `GET /v1/portal/identity/me` (`actRequirements[]`), nunca de tabela no cliente (§3). Facades
  (`src/app/core/`): `SessionFacade` (`active: Signal<boolean>`, `assuranceLevel: Signal<AssuranceLevel | null>`,
  `actRequirements: Signal<ActRequirement[]>`, `representation: Signal<Representation | null>`),
  `EntitlementFacade.check(kind: EntitlementKind, id: string): Promise<boolean>`,
  `ServiceCatalogFacade.availability(serviceKey: string): Promise<ServiceAvailability>`
  (`{ status: 'available' | 'partially_available' | 'unavailable'; reason?: string }`), todos
  `@Injectable({ providedIn: 'root' })` e substituíveis por `useValue` nos testes
  (`detran-ui-guide.md` §5). Páginas placeholder: `src/app/shared/placeholder-page.component.ts`
  (`PlaceholderPageComponent`, `DetranErrorStateComponent` "indisponível nesta versão", atributo
  `data-screen="T-nn"` ou `data-screen=""`), uma por rota até o CTG-0003.
- **M9 — i18n.** Catálogo único `src/app/i18n/portal.pt-BR.json` (spec §9), carregado por
  `loadCatalog: () => import('./i18n/portal.pt-BR.json').then((m) => m.default)`
  (`resolveJsonModule`). Chaves `portal.<namespace>.<…>` só nos namespaces da allowlist (M10). Placeholders na sintaxe do motor STYNX: `{nome}` (A7c), nunca `{{nome}}`.
  **Mapa de tradução** = subárvore `portal.situation.*`: `portal.situation.infraction.<situation>`
  (7 situações que o backend emite: `aguardando_defesa`, `em_defesa`, `penalidade_aplicada`,
  `em_recurso`, `encerrada`, `arquivada`, `cancelada` — `INFRACTION_SITUATION_MAP`),
  `portal.situation.request.<STATE>` (13 estados de `REQUEST_TRANSITIONS`) e
  `portal.situation.badge.<situation>` (5 do `CitizenStatusBadge`, spec §5.2); a relação estado do
  pedido → `badge` é `portal.situation.badge_of.<STATE>` (valor = uma das 5), transcrita de
  [WF-PORTAL-001]/[RN-PORTAL-112]; token sem fonte → **sem chave** e OD proposta. Textos jurídicos
  versionados: `portal.legal.<documento>.<versão>` com `<documento>` ∈ `consequencias_desistencia`,
  `consequencias_indicacao`, `efeitos_sne` (quatro efeitos de [RN-PORTAL-123]: `ciencia_ficta`, `substituicao`, `responsabilidade`, `cancelamento` — A5), `renuncia_40` (H.53: só texto, flag
  `portal.waiver_40_term` desligada) e `<versão>` = `v1`; erros `portal.errors.<code minúsculo>`
  (catálogo §8). O catálogo entra em código **no mesmo PR** da allowlist (CTG-0001) e só com os
  namespaces `portal.shell`, `portal.states`, `portal.common`, `portal.a11y` (rótulos do shell, dos
  estados e da acessibilidade, com os textos da spec §5.1 e os defaults do `@detran/ui`); o
  restante é transcrito no CTG-0002 (TASK-0006), depois do merge do PR 1.
- **M10 — OD-P46 (Owner: resolver nesta rodada).** O `parameter-catalogue.md` ganha a seção
  **"Namespaces i18n (allowlist do verificador)"** — tabela `Namespace | App | Catálogo | Decisão`
  (uma linha por `<surface>.<namespace>`, ex.: `portal.errors`, `apps/portal/web`,
  `src/app/i18n/portal.pt-BR.json`, `OD-P46`). `verify.mjs --check-usage`: literal com ≥ 2 pontos
  cujos dois primeiros segmentos formem um namespace da allowlist **não é candidato**; a
  **exclusão por diretório de A7 é removida** (`packages/api-clients/src/generated` volta à
  varredura — os rótulos `portal.requests.nextAction.<STATE>` e `portal.evaluations.publicIndicator`
  são cobertos por `portal.requests` e `portal.evaluations`); fail-closed: namespace da allowlist
  que seja prefixo de uma chave do catálogo (`<ns>.`) falha; namespace fora dos prefixos das
  superfícies falha; tabela malformada falha. Namespaces iniciais: `portal.shell`, `portal.common`,
  `portal.states`, `portal.errors`, `portal.situation`, `portal.screens`, `portal.forms`,
  `portal.legal`, `portal.requests`, `portal.evaluations`, `portal.notifications`,
  `portal.documents`, `portal.services`, `portal.a11y`. Chave de i18n **não** é parâmetro: nunca
  entra nas cinco tabelas de parâmetros.
- **M11 — Fichas.** 27 arquivos `docs/framework/product/transversal/portal/screens/IU-PORTAL-T01.md`
  … `IU-PORTAL-T27.md` (id `IU-PORTAL-T01`…, `status: draft`, `apps: [portal]`, `sources` da tela),
  dez seções do padrão da origem (Identidade, Acesso, Entrada, Dados, Estados, Comandos, Saída,
  Segurança, Acessibilidade, Testes) + seção "Estados obrigatórios" (carregando, vazio, sem
  elegibilidade, erro recuperável, sem permissão, indisponível) + "Chaves i18n" (lista das chaves
  `portal.screens.t<nn>.*` que a tela usa). `IU-PORTAL-001` não muda (é `reviewed`). Baseline do
  KB: 522 → 549 artefatos, 446 tokens.
- **M12 — Schemas de formulário.** `src/app/forms/<nome>.schema.ts` (14, nomes da spec §7 em
  kebab: `defesa-previa`, `recurso-jari`, `recurso-cetran`, `indicacao-condutor`, `pagamento`,
  `desistencia`, `resposta-diligencia`, `adesao-sne`, `preferencias`, `manifestacao`, `avaliacao`,
  `meus-dados`, `elevacao`, `junta-medica`), cada um exportando `<Nome>Schema` (zod, dependência
  já do monorepo — **acrescentar `zod` ao `package.json` do app é adenda do maestro no
  checkpoint**) + `<NOME>_GATE: FormGate = { minimumAssurance, precondition, command, effect }`
  transcritos da §7; validação de forma só orienta (backend valida). Entrega no CTG-0003.
- **M13 — Camada de dados.** `src/app/data/portal.client.ts`: wrapper tipado por
  `@detran/api-clients` (`BpPortal*Commands` já gerados; nenhum `openapi-typescript` novo) sobre
  `HttpClient` de `provideStynxDefaults` (`apiBaseUrl` de `runtime-config.js`); `If-Match` do
  `ETag`; `Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>` (contrato §1.4).
- **M14 — PWA e offline.** `@angular/service-worker` (`ngsw-config.json`): `app` shell
  `prefetch`; `dataGroups` **só** `/v1/portal/documents/cnh` e `/v1/portal/vehicles/*/crlv-e`
  (`freshness`, `maxAge` = validade retornada); `OfflineDocumentStore` cifra o documento com
  `AES-GCM` (`crypto.subtle`) e chave derivada por sessão (`sid`) mantida em memória — **nunca**
  persistida em claro (Riscos); qualquer outra rota offline mostra `portal.states.offline` sem
  prometer envio posterior (spec §8). Push web: `SwPush` + `POST /v1/portal/push-subscriptions`
  (CTG-0004).
- **M15 — Fronteira R-0007/R-0009.** Serviços cujo backend responde `SERVICE_UNAVAILABLE`
  (`delegacao_indisponivel_r0007`, `privacy_endpoint_pendente`, OD-P17/P38/P40) aparecem como
  `unavailable`/`partially_available` no catálogo e caem no `serviceAvailabilityGuard`; a UI
  nunca simula resultado (padrão "bloqueada por decisão" da origem). e2e das 11 jornadas (CTG-0004)
  provam o caminho até o ponto onde o backend devolve o motivo; nada `it.skip` sem OD.
- **M16 — Ordem, CTGs e PRs.** CTG-0001 (OD-P46 + scaffold + guardas + shell) → PR 1; CTG-0002
  (fichas + i18n + testes tela ↔ ficha ↔ rota ↔ i18n) → PR 2, começa a escrever só depois do merge
  do PR 1 ou em branch empilhado `orchestra/portal-pwa-ctg2`; CTG-0003 (13 módulos, componentes
  §5.2, schemas, PWA/offline) → PR 3; CTG-0004 (WP-P6: e2e das 11 jornadas, lint de payload, push,
  SNE mock, handoffs OD-P15/16/17/35/40) → PR 4; CTG-0005 (docs de fechamento: build pack §WP-P4…P6
  executados, `portal-frontends.md` §9/§10, `orchestra/README.md` §4.17 + §10, `engineer-frontend.md`
  para o padrão de app, backlog) → junto do PR 4. Janela 1: planejar tudo, executar CTG-0001 e
  preparar CTG-0002; janelas 2–4: CTG-0002…0005.

- **M17 — `Idempotency-Key` determinística (Architect, 2026-09-17; fecha o que o contrato de rotas
  §1.4 deixa em aberto).** Forma `<ato>:<alvo>:<fingerprint>` com `<ato>` = `serviceKey` (ou
  `withdraw`, `respond_diligence`, `elevation`), `<alvo>` = id do recurso alvo (`aitId`,
  `requestId`, `diligenceId`) e `<fingerprint>` = SHA-256 (hex minúsculo, 64 caracteres) do corpo
  JSON canonicalizado — chaves ordenadas recursivamente, sem espaços, `undefined` omitido, UTF-8 —
  calculado no cliente com `crypto.subtle`. Mesmo corpo → mesma chave; corpo diferente → chave
  diferente (o backend responde 409 `IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY` ao reuso divergente).
  Decisão de engenharia sem impacto jurídico; se o backend vier a exigir outro formato, muda aqui.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço                         | Lock                                                                                                                    | Depende de                                | CTG       | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | -------------------- | ------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo                         | `MOD-parameter-catalogue-doc`, `MOD-portal-build-pack-doc`, `MOD-portal-frontends-doc`, `MOD-decision-closure-plan-doc` | —                                         | CTG-0001  | M10 transcrita: seção "Namespaces i18n" + §Verificador fail-closed reescrito no `parameter-catalogue.md`; linha OD-P46 do build pack; `portal-frontends.md` §9 (caminho do catálogo) — sem código                                                                                                                                                                                                                                                                                   |
| TASK-0002 | Inspector            | inspector-tests     | Sonnet / médio                         | `MOD-tools-parameters-tests`, `MOD-portal-web-tests`                                                                    | — (roda com 0001)                         | CTG-0001  | `tools/parameters/tests/verify-usage.test.mjs` (allowlist: aceita, rejeita, colisão, tabela malformada, um ponto) + specs do app: bootstrap/shell, matriz rota → guarda (presença **e** ausência por nível/vínculo/disponibilidade, todas as rotas do manifesto), manifesto completo vs. spec §4, `axe` nas rotas anônimas, chaves i18n usadas ⊆ catálogo e namespaces ⊆ allowlist                                                                                                  |
| TASK-0003 | Engineer             | engineer-backend    | Sonnet / médio                         | `MOD-tools-parameters`                                                                                                  | TASK-0001, TASK-0002                      | CTG-0001  | `parser.mjs` lê a tabela de namespaces; `verify.mjs` aplica M10 e remove a exclusão A7; `parameters:test` + `verify:parameter-catalogue` verdes                                                                                                                                                                                                                                                                                                                                     |
| TASK-0004 | Engineer             | engineer-frontend   | Opus / médio                           | `MOD-portal-web-app`, `MOD-package-json`                                                                                | TASK-0002 (+ install do maestro)          | CTG-0001  | scaffold M1–M8, M13 (client), `CitizenShell`, rotas + manifesto completos (páginas placeholder `DetranErrorStateComponent` "indisponível nesta versão"), 4 guardas, `SessionFacade`/`BrandService`/`ResumeService`/`ErrorBoundary` mínimos, `pnpm check` estendido (M6), `packages/ui` export `"."`, README do padrão; testes de TASK-0002 verdes                                                                                                                                   |
| TASK-0005 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo                         | `MOD-product-portal-screens-A`                                                                                          | TASK-0004 (merge PR 1)                    | CTG-0002  | fichas **lote A: T-01…T-09** (M11); baseline do manifesto **não** muda aqui (lote C fecha 549)                                                                                                                                                                                                                                                                                                                                                                                      |
| TASK-0013 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo                         | `MOD-product-portal-screens-B`                                                                                          | TASK-0004 (merge PR 1)                    | CTG-0002  | fichas **lote B: T-10…T-18**                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| TASK-0014 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo                         | `MOD-product-portal-screens-C`, `MOD-kb-manifest`                                                                       | TASK-0004 (merge PR 1)                    | CTG-0002  | fichas **lote C: T-19…T-27** + `baselines.artifactIdCount` 522 → 549 (só quando os três lotes existirem: o maestro dispara C por último ou ajusta o baseline no checkpoint)                                                                                                                                                                                                                                                                                                         |
| TASK-0006 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo                         | `MOD-portal-i18n`                                                                                                       | TASK-0005, 0013, 0014 (chaves das fichas) | CTG-0002  | `portal.pt-BR.json` (M9): mapa de tradução, textos jurídicos `portal.legal.*.v1`, erros, rótulos das 27 telas e do shell; OD para tokens sem fonte                                                                                                                                                                                                                                                                                                                                  |
| TASK-0007 | Inspector            | inspector-tests     | Sonnet / médio                         | `MOD-portal-web-tests`, `MOD-tools-docs-tests`                                                                          | TASK-0006                                 | CTG-0002  | testes tela ↔ ficha ↔ rota ↔ i18n (5 specs; listas fechadas em `src/testing/kb.ts`)                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-0019 | Architect            | architect-blueprint | Opus / alto                            | `MOD-r14-contracts-3a`                                                                                                  | TASK-0007 (merge PR 2)                    | CTG-0003a | **contrato do par 1** (`contracts/CTG-0003a.md`): APIs tipadas dos componentes §5.2 (inputs/outputs), forma dos 14 schemas + `FormGate` (M12), `PortalClient` de comandos (`If-Match`, `Idempotency-Key` `<ato>:<alvo>:<fingerprint>`), `OfflineDocumentStore` (M14), `ErrorBoundary` (catálogo §8 → chave), guardas de estado dos formulários (§7) e critérios que o Inspector codifica; nada de código                                                                            |
| TASK-0008 | Inspector            | inspector-tests     | Sonnet / médio (matriz grande, ladder) | `MOD-portal-web-tests-core`                                                                                             | TASK-0019                                 | CTG-0003a | testes **par 1 — núcleo e compartilhados**: `core/` completo (`ErrorBoundary`, `OfflineDocumentStore` cripto/validade/bateria, `SessionFacade` com `GET me`, `PortalClient` com `If-Match`/`Idempotency-Key`), componentes §5.2 (`CitizenStatusBadge`, `DeadlineCard`, `ActionTriplet`, `ServiceWizard`, `PrefilledField`, `AttachmentUploader`, `ConsequenceDialog`, `SignatureStep`, `ProtocolReceipt`, `AlternativeChannelNote`, `AssuranceExplainer`), 14 schemas + gates (M12) |
| TASK-0009 | Engineer             | engineer-frontend   | Opus / médio                           | `MOD-portal-web-core`, `MOD-portal-web-shared`, `MOD-portal-web-forms`                                                  | TASK-0008                                 | CTG-0003a | implementação do par 1 até os testes passarem                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| TASK-0020 | Architect            | architect-blueprint | Opus / alto                            | `MOD-r14-contracts-3b`                                                                                                  | TASK-0009 (merge PR 3a)                   | CTG-0003b | **contrato do par 2** (`contracts/CTG-0003b.md`): telas da trilha de apelação (T-01…T-08, T-10, T-11, T-13, T-14, T-23) — dados por rota, comandos delegados e estados (`PROTOCOLADO` etc.), `PaymentComparison` (RN-PORTAL-125…128, H.53), `ProcessTimeline` (`visibility=citizen`, `ownedBy`), critérios                                                                                                                                                                          |
| TASK-0015 | Inspector            | inspector-tests     | Opus / alto                            | `MOD-portal-web-tests-appeal`                                                                                           | TASK-0020                                 | CTG-0003b | testes **par 2 — trilha de apelação**: `autos`, `defesa`, `indicacao`, `pagamento`, `processos` (T-01…T-08, T-10, T-11, T-13, T-14, T-23; `PaymentComparison`, `ProcessTimeline`), `axe` nas rotas do par                                                                                                                                                                                                                                                                           |
| TASK-0016 | Engineer             | engineer-frontend   | Opus / médio                           | `MOD-portal-web-features-appeal`                                                                                        | TASK-0015                                 | CTG-0003b | implementação do par 2                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| TASK-0021 | Architect            | architect-blueprint | Opus / alto                            | `MOD-r14-contracts-3c`                                                                                                  | TASK-0016 (merge PR 3b)                   | CTG-0003c | **contrato do par 3** (`contracts/CTG-0003c.md`): notificações/SNE (WF-PORTAL-003, quatro efeitos), documentos (CNH-e/CRLV-e, quitação, offline), sinistros/exames (projeções BOAT/PEC, OD-P19), atendimento (WF-PORTAL-004, dois relógios), privacidade (OD-P17), elevação (UC-019 `resume`), SSE/polling, push; critérios                                                                                                                                                         |
| TASK-0017 | Inspector            | inspector-tests     | Opus / alto                            | `MOD-portal-web-tests-greenfield`                                                                                       | TASK-0021                                 | CTG-0003c | testes **par 3 — greenfield + PWA**: `notificacoes` (T-12, T-09, preferências; `NotificationList`, `SneConsent`), `documentos` (T-16, T-17; `DigitalDocumentCard`, `ClearanceStatus`, offline), `sinistros`, `exames`, `atendimento` (T-21, T-22, T-26; `ManifestationForm`, `EvaluationForm`), `privacidade` (T-24; `OwnDataPanel`), `assinatura` (T-27), `/inicio`, `/conta`, SSE + polling, push (`SwPush`), `axe` em todas as 38 rotas                                          |
| TASK-0018 | Engineer             | engineer-frontend   | Opus / médio                           | `MOD-portal-web-features-greenfield`                                                                                    | TASK-0017                                 | CTG-0003c | implementação do par 3 (M14 offline/push)                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| TASK-0010 | Inspector            | inspector-tests     | Opus / alto                            | `MOD-portal-e2e`, `MOD-senatran-mock`                                                                                   | TASK-0009 (merge PR 3)                    | CTG-0004  | e2e das 11 jornadas no mock; lint de payload; push; adesão SNE (mock); handoffs OD-P15/16/17/35/40 — prompt na janela 3                                                                                                                                                                                                                                                                                                                                                             |
| TASK-0011 | Engineer             | engineer-backend    | Opus / médio                           | `MOD-portal-national-read`, `MOD-app-portal-providers`                                                                  | TASK-0010                                 | CTG-0004  | `CdtPort`/`SnePort`/CNH-e/`inbox_item`/push no backend até os e2e passarem (limites em `senatran-mock`, commit separado) — prompt na janela 3                                                                                                                                                                                                                                                                                                                                       |
| TASK-0012 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo                         | `MOD-docs`                                                                                                              | TASK-0011                                 | CTG-0005  | build pack §WP-P4…P6, `portal-frontends.md` §9/§10, método §4.17/§10 e `engineer-frontend.md` (padrão de app), backlog (homologação SNE real) — prompt na janela 4                                                                                                                                                                                                                                                                                                                  |

CTG-0001 = 0001…0004 (**mesclado, PR #60**); CTG-0002 = 0005/0013/0014 → 0006 → 0007; CTG-0003 = três tríades acopladas **CTG-0003a** (0019 → 0008 → 0009), **CTG-0003b** (0020 → 0015 → 0016), **CTG-0003c** (0021 → 0017 → 0018), **um PR por par** (Owner, 2026-09-17: diffs menores para o reviewer; cada par começa depois do merge do anterior ou em branch empilhado); CTG-0004 = 0010/0011; CTG-0005 = 0012. Um PR por CTG (M16). Prompts prontos: TASK-0001…0007 (0005 redividido em 0005/0013/0014 em 2026-09-17); os de CTG-0003a…c e CTG-0004/0005 são escritos nas janelas 2–4 e passam por prompt-review antes do disparo.

**Checkpoint de dependências (maestro, executado em 2026-09-17 antes de disparar TASK-0002):** `apps/portal/web/package.json` (M1/M2) criado e `pnpm install` rodado (lockfile vai no commit do CTG-0001); runner provisionado e provado (`vitest.config.ts`, `src/test-setup.ts`, `tsconfig.json` base — um spec JIT com `@detran/ui` passa); `packages/ui/package.json` ganhou `exports["."]` (M6) pelo maestro (Engineer), tirando `packages/ui` da fronteira de TASK-0004; só então o Inspector é liberado; `pnpm contracts:clients` já cobre `BP-PORTAL-*` (R-0009). Banco da
rodada (CTG-0004): `detran_r14` (`env-detran-r14.sh`, criado na janela 3).

## Critérios de aceitação (comandos → resultado)

- CTG-0001: `pnpm parameters:test` → `# pass N` / `# fail 0` com os casos novos da allowlist;
  `pnpm verify:parameter-catalogue` → `verify:parameter-catalogue: OK (… entries, … flags, 0 errors)`
  **sem** a exclusão de diretório; `pnpm --filter @detran/portal-web typecheck|lint|test|build` →
  verdes (test: "Tests N passed, 0 failed", inclusive matriz de guardas e `axe` sem violação
  `serious`/`critical`); `pnpm check` (estendido, M6) → verde; `pnpm format:check` → OK.
- CTG-0002: `node tools/docs/kb/check.mjs` → `OK (549 artifacts, 446 canonical tokens)`, baseline
  atualizado no mesmo commit; `pnpm docs:kb:publish-check` → OK; `pnpm --filter @detran/portal-web
test` → verde com os testes tela ↔ ficha ↔ rota ↔ i18n.
- CTG-0003: `pnpm --filter @detran/portal-web typecheck|test|build|lint` → verdes; a11y por rota
  sem violação `serious`/`critical` (axe) em todas as rotas do manifesto.
- CTG-0004: `pnpm backend:test:e2e` → 11 jornadas verdes contra `backend/app` com
  `DETRAN_RUNTIME_PROFILE=test` e `senatran-mock`; teste de vocabulário interno → 0 ocorrências.
- Sempre: `pnpm check` → verde; `pnpm backend:test:ci` inalterado.

## Mapa entregável → definições

| Entregável  | Definição                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| fichas      | [IU-PORTAL-001]; `portal-frontends.md` §4–§6; [JRN-PORTAL-001…011]; catálogo de telas da origem (estados obrigatórios) |
| formulários | `portal-frontends.md` §7; [WF-PORTAL-001/002]; [RN-PORTAL-*]; `portal-error-catalog.md`                                |
| hierarquia  | `portal-frontends.md` §1–§3, §8–§10                                                                                    |
| tradução    | [WF-PORTAL-003]; OD-P09; vocabulário canônico dos workflows                                                            |
| decisões    | steering H.49…H.53; OD-P03/P04/P05/P11/P12                                                                             |
| integrações | `CdtPort`, `SnePort`, `RenachPort` em `packages/senatran-adapter`; `senatran-mock`                                     |

## Riscos

- Ferramenta de auditoria PWA/a11y em CI: só a que rode offline no runner; nunca serviço externo.
- Cache cifrado só para CNH-e/CRLV-e: chave por sessão, nunca persistida em claro.
- `senatran-mock` tem lockfile próprio: alterações no mock vão em commit separado.

## Lições aplicadas (método §4.8–§4.18, `waves.md` §Histórico)

- Transcrição de fichas, contratos, i18n e docs é ato de **Architect** (`transcriber-docs`); tarefas assim aparecem como "Architect (transcr.)".
- Nenhum Engineer ou transcriber entrega o teste do próprio artefato: contratos → `contracts:test` pelo Inspector; fichas/i18n → teste tela ↔ ficha ↔ rota pelo Inspector.
- Ciclos de review a partir do segundo restritos aos itens corrigidos; contradições contrato × código resolvidas pelo Architect por adenda numerada em `plan.md` antes de redespachar.
- O CTG seguinte só começa a escrever depois do merge do anterior ou nasce em branch empilhado; nunca commits novos no branch de um PR aberto; integrar `main` por merge, nunca `--force`.
- Listas de leitura dos workers fechadas e completas (DDL gerado, blueprint, `seed.sh`, fixtures, specs de referência como `backend/app/tests/e2e/policy-routes.e2e.spec.ts`); lacuna aqui foi `reference-gap` em R-0010.
- Padrão de app (**invertido pelo Owner em 2026-09-17**): o primeiro frontend é **este** (`apps/portal/web`, R-0014) e fixa `package.json` (scripts `build|test|lint|typecheck`), configuração Angular 22/vitest/eslint e a extensão de `pnpm check` (M1–M6); **R-0012 (`apps/rait/web`) copia a estrutura**, sem variantes — TASK-0012 registra isso em `orchestra/README.md` §4 e em `engineer-frontend.md`.
- Pacote de workspace novo: o maestro roda `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector (CI é `--frozen-lockfile`).
- Chaves i18n não são parâmetros (OD-P46): **resolvida nesta rodada** (Owner, 2026-09-17; M10) — allowlist de namespaces no `parameter-catalogue.md`, lida por `tools/parameters/verify.mjs`; a exclusão por diretório (A7 de R-0009) sai.
- Testes de roteamento cobrem papéis com e sem acesso (presença e ausência), não só o papel mínimo.
- `portal.*` foi a origem de OD-P46: nenhum `i18n/portal.pt-BR.json` entra em código antes da allowlist — por isso o catálogo mínimo (shell/estados) nasce **no mesmo PR** da allowlist (CTG-0001, M9) e o catálogo completo é CTG-0002 (PR 2), depois do merge do PR 1.
- e2e das 11 jornadas idempotentes (`afterAll` limpa `portal.subject` e dependentes) e com `DB_NAME` da rodada.

## Estimativa de esforço (Architect, 2026-09-17, após o CTG-0001; calibração: Sonnet transcr. ≈ 40 k únicos/160 k brutos, Sonnet inspector ≈ 70 k/280 k, Opus engineer ≈ 90 k/350 k + 15 % por iteração, reviewer 40–160 k por chamada)

| Grupo    | Tarefas                                        | Complexidade | Únicos (brutos) | Reviewer                         | Janela      | Risco principal                                                                                                                          |
| -------- | ---------------------------------------------- | ------------ | --------------- | -------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| CTG-0002 | 0005/0013/0014, 0006, 0007                     | média        | 350–450 k       | prompt restrito ×1, delivery ×2  | 2           | fichas: `docs:kb:check` (tokens/brackets), volume — por isso três lotes; i18n: rótulo inventado → OD                                     |
| CTG-0003 | 0019/0008/0009, 0020/0015/0016, 0021/0017/0018 | **alta**     | 1,0–1,3 M       | prompt ×2, delivery ×2–3 por par | 2 (fim) + 3 | maior grupo da rodada; wizard/rascunho servidor, pagamento, offline cifrado, SSE, push; três PRs (3a, 3b, 3c)                            |
| CTG-0004 | 0010, 0011                                     | alta         | 500–700 k       | prompt ×1–2, delivery ×2         | 4           | e2e (nível de API, `pnpm backend:test:e2e`, `detran_r14` + `senatran-mock`); backend real: 6º projetor `inbox_item`, `CdtPort`, SNE mock |
| CTG-0005 | 0012 + fechamento                              | baixa        | 150 k           | delivery ×1                      | 4           | `round close` exige o HEAD exato mesclado                                                                                                |

Total restante ≈ 2,1–2,6 M únicos (≈ 8–10 M brutos), três janelas — coerente com a previsão de
quatro, sem folga. **Premissas aceitas pelo Owner (2026-09-17)** para não replanejar depois: no
CTG-0004 as jornadas de defesa/indicação/pagamento (JRN-001/002/010) provam o caminho só até o
motivo `delegacao_indisponivel_r0007` (R-0007), e OD-P15 (credenciais gov.br) fica
`source_pending` com IdP simulado documentado. Checkpoint já executado pelo maestro (Engineer):
`packages/api-clients/src/index.ts` reexporta `BpPortal*Commands`/`BpPortal*`; o alias `paths`
do app saiu (`portal.client.ts` importa `BpPortalIdentity001Commands` do pacote).

## Concorrência

Verificado em 2026-09-17 (`git log --oneline -30 origin/main`, `gh pr list --state merged`):

- Em `main` (base `59423c9`, PR #59): R-0003 (#32), R-0004 (#37), R-0005 (#44), R-0006 (#39/#43/#46),
  R-0008 (#47…#52), **R-0009 `portal-backend` (#54/#56/#57, PC-0006)** — único upstream desta
  frente; método/rodadas #53/#59.
- Em curso (janela Sol): R-0007 `rait-backend` (`orchestra/rait-backend` local, sem PR), R-0010
  `boat-backend` (`orchestra/boat-backend` remoto, sem PR aberto). Nenhum lock comum com esta frente
  (`apps/portal/web`, `tools/parameters`, `parameter-catalogue.md`, `packages/ui/package.json`,
  raiz `package.json` linha `check`). Risco de conflito textual só em `package.json` raiz
  (`check`) e `pnpm-lock.yaml` — resolver por `main` + `pnpm install` (§1 do prompt).
- **Todos os grupos liberados para merge**; nenhuma base empilhada. Delegações reais seguem com
  R-0007 (§0 do prompt), não com esta rodada.
- `packages/ui` é lock de `rait-web`/`teat-frontends` (inativas); a edição de `packages/ui/package.json`
  (M6) é mínima e registrada aqui.

## Bloqueios

- **B0 — prompt-review-1 = FAIL por estrutura** (5 achados `high`: DT-026 lido como pendente em TASK-0005; locks de TASK-0001 incompletos; caminho do helper `axe` divergente; critério de TASK-0002 sem runner; leitura de TASK-0006 incompleta). Nenhum contradiz canônico após correção (DT-026 é respondido — OD-P03/H.53 — e o prompt agora transcreve a premissa). Pelo precedente R-0008/R-0009 (README §10 rec. 7) o maestro corrigiu e abriu o ciclo 2 restrito, em vez de parar; registrado aqui como desvio consciente.
- **B1 — Lighthouse CI**: o gate do build pack (`Lighthouse PWA e a11y ≥ 90 em CI`) exige Chrome
  headless e não roda no runner sem serviço/binário externo; substituído por `axe-core` em TestBed
  por rota (M3) — TASK-0012 corrige o build pack. Não bloqueia a rodada.

## Triagem

- 2026-09-17 CTG-0002 `pnpm check` → `typecheck` de `screen-sheets.spec.ts` (TS2677, 3× TS4111): **plant-bug** (spec do Inspector sem typecheck; o critério de TASK-0007 não incluía `typecheck` — lacuna do prompt) → iteração restrita de TASK-0007; a partir do CTG-0003 todo prompt de Inspector do app inclui `pnpm --filter @detran/portal-web typecheck` como critério.

## Pendências de cobertura

- 2026-09-17 CTG-0003a: Inspector (TASK-0008) entregou C-3a-99 (axe por estado em todos os 11 componentes) e C-3a-100 (ciclo de `Tab`) **parcialmente** — cobertura não reduzida, só não estendida por volume; **resolvido** na iteração 3 de TASK-0008 (exigência do delivery-review-CTG-0003a): axe por estado nos 11 compartilhados e ciclo de `Tab` no diálogo/triplet; apanhou um defeito real (input de arquivo sem nome acessível) corrigido por TASK-0009 it. 3.

## Adendas

- **A1 (2026-09-17, TASK-0004 B-T4-1 — spec × contrato de `GET brand`).** O contrato
  (`portal-route-contract.md` §2; `BP-PORTAL-IDENTITY-001.commands.openapi.json`) devolve
  `{ displayName, shortName, legalName, primaryColor, supportUrl, privacyUrl, accessibilityUrl,
serviceContact, locale, timeZone }` — não há `name` nem `logoUrl`. Prevalece o contrato: o caso
  "sucesso" de `brand.service.spec.ts` deve responder o corpo do contrato (`displayName: 'DETRAN
Exemplo'`, demais campos opcionais) e esperar `state()` com `{ status: 'available', name:
'DETRAN Exemplo', supportUrl?, privacyUrl?, accessibilityUrl?, primaryColor? }` (`name` =
  `displayName`, como implementado em `core/brand.service.ts`; campos ausentes no flush não entram
  no `toEqual` — use `toMatchObject` ou flush completo). Logotipo do órgão: **OD-P47** proposta
  (origem do `logoUrl`; `brand_profile` não o define) — sem chave até decisão.
- **A2 (2026-09-17, TASK-0004 B-T4-2 — tipagem dos stubs do Inspector sob vitest 4).**
  `ReturnType<typeof vi.fn>` é `Mock<Procedure | Constructable>` sem assinatura de chamada:
  `src/testing/entitlement-facade.stub.ts` e `service-catalog-facade.stub.ts` tipam `check`/
  `availability` como `Mock<EntitlementFacade['check']>` / `Mock<ServiceCatalogFacade['availability']>`
  (`import type { Mock } from 'vitest'`, `vi.fn<…>()`); `app.guards-matrix.spec.ts:148` faz o
  narrowing de `entry.entitlement` fora do closure (`const entitlement = entry.entitlement; if
(!entitlement) return;` antes do `it`). Nenhuma asserção muda. `tsconfig.spec.json` do Engineer
  mantém `resolveJsonModule: false` só enquanto `i18n-keys.spec.ts` carregar `// @ts-expect-error`
  sobre o JSON — o Inspector remove a diretiva (o catálogo existe) e o maestro retira a sobrescrita.
- **A3 (2026-09-17, delivery-review-CTG-0001 FAIL — dois valores sem fonte).** (a) `ngsw-config.json`:
  o `dataGroup` `documentos-offline` **sai** do CTG-0001 (nenhum `maxAge` fixo; M14 "validade
  retornada" não é expressável estaticamente no ngsw) — o cache offline de CNH-e/CRLV-e é
  entregue no CTG-0003 pelo `OfflineDocumentStore` (validade do documento), e a forma do
  `dataGroup`, se houver, é decidida em OD-P51 antes; `ngsw-config.json` fica só com `assetGroups`.
  (b) `service-catalog.facade.ts`: serviço ausente de `GET /v1/portal/services` devolve
  `{ status: 'unavailable' }` **sem `reason`** (o motivo só existe quando o catálogo o dá —
  `unavailableReason`); o token `servico_nao_catalogado` e a constante `SERVICE_NOT_CATALOGUED`
  são removidos; a tela `/servico-indisponivel/:serviceKey` já cobre o caso sem motivo
  (`portal.states.service_unavailable`). Nenhum spec muda (os stubs fixam `reason` só no caso
  `delegacao_indisponivel_r0007`).
- **A5 (2026-09-17, delivery-review-CTG-0002 REVIEW).** (a) Os quatro efeitos da adesão ao SNE
  são os de [RN-PORTAL-123] como TASK-0006 os transcreveu — `ciencia_ficta`, `substituicao`,
  `responsabilidade`, `cancelamento` — e não a paráfrase do prompt de TASK-0006/0007 ("canal
  exclusivo, desconto de 60 %, cancelamento a qualquer tempo"); `legal-texts.spec.ts` fixa as quatro
  chaves `portal.legal.efeitos_sne.v1.<efeito>` por nome, nunca só por contagem; M9 passa a citar
  esses nomes. (b) `screen-sheets.spec.ts` verifica "Identidade não cita rota de outra tela" para
  **todos** os paths do manifesto, inclusive os de um segmento, extraindo da ficha só os spans com
  forma de rota (iniciados por `/`, ex.: `/autos`), o que evita a colisão com nomes de módulo.
- **A6 (2026-09-17, ratificações do contrato `contracts/CTG-0003a.md`, TASK-0019).** (a)
  [DIVERGE-4] `ResumeService` ganha `peek()` (leitura sem consumo); `core/auth-flow.service.ts`
  passa a usar `peek()?.route` no callback OIDC — o Engineer (TASK-0009) pode tocar essa linha.
  (b) [DIVERGE-5] M17: `<alvo>` = `'none'` quando `targetKind: 'none'` no `createRequest`, e
  `requestId` no `submit`. (c) [DIVERGE-16] `ActRequirement.allowed` obrigatório (o Inspector
  ajusta o stub). (d) OD-P58: as chaves i18n dos compartilhados do par 1 (lista fechada no contrato
  §11) são acrescentadas ao catálogo **agora** pelo transcriber (TASK-0006 it. 4), com texto em
  linguagem cidadã derivado da spec §5.2/fichas/ux-notes §c e fonte por chave no relatório; a
  revisão do Owner (linguagem cidadã) é o gate do WP-P4 já previsto. (e) OD-P66: o limite "10 MB"
  vem da spec §7 (`10 · 1024 · 1024` documentado como convenção de engenharia); a linha
  `portal.attachment.*` no `parameter-catalogue.md` fica para o fechamento (TASK-0012) — não entra
  neste CTG. (f) [DIVERGE-3]/OD-P59: formas 2xx ausentes → `source_pending` no contrato; a UI
  mostra estado indisponível (M15), nunca simula. (g) OD-P57…P67 registradas; transcrição ao
  build pack em TASK-0012.
- **A7 (2026-09-17, TASK-0009 — bloqueios B1…B12).** (a) **M3 corrigido**: o runner `vitest`
  puro não aplica a transformação JIT do Angular e as APIs de inicialização por signals
  (`input()`, `output()`, `model()`, `viewChild()`) não entram nos metadados do componente —
  `setInput` vira no-op e todo spec de componente falha (NG0950/NG0303). `vitest.config.ts` ganha
  o plugin `angular-jit-initializer-apis` (`angularJitApplicationTransform` de
  `@angular/compiler-cli`, já instalado), aplicado pelo maestro (arquivo do padrão de app; R-0012
  copia): 22 → falhas remanescentes são defeitos de spec. (b) [C-3a-60 × contrato §5.4] no 403
  `ASSURANCE_INSUFFICIENT` do `submit`, o `ServiceWizard` **não** emite `elevationRequested`
  (não há método escolhido): volta ao passo `assinatura`, mostra o banner com `nextStep:
'elevation'` e deixa o `SignatureStep` emitir quando o cidadão escolher o caminho; o Inspector
  ajusta C-3a-60. (c) B7: o motor de i18n do STYNX 1.3.1 interpola `{x}`, não `{{x}}` — as 10
  chaves do catálogo com `{{…}}` passam a `{…}` (transcriber, TASK-0006 it. 5); M9 registra a
  sintaxe. (d) B2…B6, B9…B12 são defeitos de spec/stub (síncrono × `crypto.subtle` assíncrono —
  aguardar a promessa/`vi.waitFor` antes do `expectOne`; `flush` de blob; hex de 64 caracteres;
  `DataTransfer` ausente no jsdom → polyfill em `src/testing/`; `resetTestingModule` entre
  reconfigurações; `brand.service.spec` com `serviceContact` ([DIVERGE-9]); literal `rait.errors.x`
  → usar um prefixo fora das superfícies do verificador, ex. `zz.errors.x`; `no-unused-vars`;
  `NavigationError` do harness do triplet) → iteração restrita do Inspector (TASK-0008 it. 2).
  (e) OD propostas por TASK-0009 registradas: OD-P68 (rótulo de fechar aviso, hint do upload
  assinado e `ackLabelKey` de `consequencias_indicacao`/`renuncia_40` — extensão de OD-P58);
  a sintaxe de placeholder é decidida em (c), não OD.
- **OD propostas por TASK-0004 (numeração do Architect; transcrição ao build pack §4 em
  TASK-0012):** OD-P47 origem do logotipo do órgão (`GET brand` sem `logoUrl`); OD-P48 regra de
  seleção da representação ativa a partir de `me.representations[]` (hoje `null`; tela `/conta`,
  CTG-0003); OD-P49 destino do link "Atendimento presencial" do rodapé (`supportUrl` × Carta de
  Serviços); OD-P50 comportamento quando `GET /v1/portal/services` falha (guarda rejeita × tela de
  indisponibilidade); OD-P51 `maxAge` estático do `dataGroup` offline e persistência do cache
  cifrado (`sessionStorage` × IndexedDB) com chave por `sid`. **OD propostas pelas fichas (CTG-0002, numeração do Architect):** OD-P52 — nível de assinatura de T-08 (desistência): manifesto `simples` × [RN-PORTAL-101] "avançada" por paralelismo de forma (ficha segue o manifesto; Owner/LEGAL decide); OD-P53 — nível de T-09 (adesão SNE): contrato §5.1 `simples` × RN-101/spec §4 "simples→avançada" (ficha segue o contrato); OD-P54 — especificação operacional do offline de T-16/T-17 (limiar de bateria crítica, autenticação local; `source_pending`). - **A4 (2026-09-17, TASK-0006 — `serviceKey` sem serviço no catálogo).** O catálogo canônico
  ([WF-PORTAL-001] §Catálogo, 15 serviços; fixture `portal.service_catalog` com 15 linhas, sem
  `junta_medica` por OD-P19 e com `cancelamento_sne`) não tem serviço "acompanhar manifestação":
  acompanhar é parte de "Registrar manifestação". Como `ServiceCatalogFacade.availability` devolve
  `unavailable` para chave ausente, a rota T-22 (`ouvidoria/:manifestationId`) ficaria sempre
  bloqueada. Correção: **T-22 perde o `serviceKey`** (fica só `entitlementGuard('manifestation')`)
  em `route-manifest.md`, `app.route-manifest.ts` e `src/testing/route-manifest.fixture.ts`; a
  matriz de guardas passa a ter 18 rotas com `serviceKey` (era 19). `junta_medica` **mantém** o
  `serviceKey` (serviço canônico; ausente da fixture por OD-P19 → a rota cai na tela de
  indisponibilidade, comportamento correto) e ganha `portal.services.junta_medica` = "Requerer
  junta médica ou psicológica" ([WF-PORTAL-001] §Catálogo). `cancelamento_sne` fica sem chave até
  OD-P55. Invariante do manifesto: todo `serviceKey` ∈ chaves de `service_catalog` ∪
  {`junta_medica`}.
- **OD propostas por TASK-0006:** OD-P55 — catálogo de serviços: fixture com 15 linhas × "18"
  citados no prompt (erro do maestro: 18 eram chaves de `act_level_policy`), e nome cidadão de
  `cancelamento_sne` (sem linha em [WF-PORTAL-001]); OD-P56 — `badge_of` para os 9 estados do
  pedido sem correspondência inequívoca (`IDENTIFICADO`, `SERVICO_SELECIONADO`,
  `ELEGIBILIDADE_VERIFICADA`, `INELEGIVEL`, `PEDIDO_EM_COMPOSICAO`, `AGUARDANDO_NIVEL_ASSINATURA`,
  `AGUARDANDO_PAGAMENTO`, `PROTOCOLADO`, `AVALIACAO_OFERECIDA`) — Owner (linguagem cidadã).
  Adenda de código pendente para o
  CTG-0003: reexportar `BpPortal*Commands` em `packages/api-clients/src/index.ts` e remover o alias
  `paths` `@detran/api-clients/generated/*` do app.

## Retomada

**Checkpoint 4 (2026-09-17, janela 3 — CTG-0003a em PR).**

- CTG-0001: mesclado (PR #60). CTG-0002: mesclado (PR #61, `2888c9b`, `EV-976c235d27abf061`).
- **CTG-0003a: PR #62 aberto** (commits `0d789f8` runner JIT + i18n, `8d2bc34` par 1, `25b270b`
  artefatos, `3508462` evidência generic sequence 3, head `6050fd53…`); `delivery-review-CTG-0003a-2`
  PASS; `pnpm check` EXIT 0 (711/714). **Próximo passo:** CI verde → `gh pr merge 62 --merge` →
  `git fetch` + `git merge --no-edit origin/main` → `audit observe` no SHA do merge → commit.
- Concluídas: TASK-0001…0009, 0013, 0014, 0019 (iterações: 0002 ×3, 0004 ×3, 0006 ×5, 0007 ×3,
  0008 ×3, 0009 ×3).
- Pendentes: CTG-0003b (TASK-0020 → 0015 → 0016; prompts a escrever, derivando dos de 0019/0008/0009
  com escopo da trilha de apelação; os Inspectors incluem `typecheck` e cobertura integral de axe/Tab
  desde o primeiro ciclo), CTG-0003c (0021 → 0017 → 0018), CTG-0004 (0010/0011), CTG-0005 (0012).
- Lições desta janela para o método: (1) runner de app precisa da transformação JIT do Angular
  (A7a) — fixado no padrão; (2) placeholders i18n na sintaxe do motor (`{x}`); (3) o reviewer não
  aceita cobertura "parcial" declarada — completar antes do ciclo; (4) inspetor de matriz grande em
  Sonnet/médio rendeu bem (3 iterações, 780 k brutos acumulados).
- Último veredito do reviewer: `delivery-review-CTG-0003a-2` = PASS.
- Git: `orchestra/portal-pwa` publicado, working tree limpa.

## Leitura

HEAD `59423c937cb8953bef11c3b3d2449c5660392d88` (2026-09-17). Lidos: `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/README.md`; `docs/meta/agents/orchestra/{README,model-ladder,waves}.md`;
`docs/framework/arch/portal-build-pack.md` (inteiro, incl. OD-P14…P46); `portal-frontends.md`
(inteiro); `portal-route-contract.md` §1–§3, §5.1, §8; `portal-error-catalog.md` §7–§8;
`parameter-catalogue.md` (§PORTAL, §Regras, §Contrato de geração e verificação);
`decision-closure-plan.md` (linhas PORTAL); `steering.md` §H; manuais `architect-blueprint`,
`engineer-frontend`, `inspector-tests`, `transcriber-docs`; templates `worker-prompt`,
`reviewer-prompt`, `task.template.json`; `IU-PORTAL-001` (§A–§F); origem
`screen-specification-standard.md`; `detran-ui-guide.md` §1, §5; `packages/ui/{package.json,
src/index.ts, src/lib/bootstrap.ts, test/detran-ui.spec.ts, vitest.config.ts, tsconfig*.json}`;
`tools/parameters/verify.mjs` (§--check-usage), `parser.mjs` (exports); `apps/*/README.md`;
`package.json` raiz (scripts), `pnpm-workspace.yaml`, `.github/workflows/ci.yml` (jobs);
`work/rounds/R-0009/{AUTHORIZATION.md, env-detran-r9.sh, budget.json, compositions.json,
tasks/TASK-0009.json, prompts/TASK-0009.md §1–§4}`; `backend/domains/portal/projections/…/
infraction-view.projection.ts` (`INFRACTION_SITUATION_MAP`), `requests/…/request.transitions.ts`
(tokens); `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json` (rotas, `GET me`);
`packages/api-clients` (`package.json`, `src/index.ts`); tipos públicos de
`@stynx-nyx/angular-auth` 1.3.1 (`stynxAuthGuard`, `StynxSessionService.state`). Registry
(`npm view`): versões de M2.
