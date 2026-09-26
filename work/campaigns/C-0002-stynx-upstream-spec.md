# C-0002 — especificação upstream única para o STYNX 1.5.0 (rodada S-1.5)

> **Adenda A3 da campanha (2026-09-26):** a migração de `dashCan` é feita em R-0024, não em R-0023.

**Autoridade:** Architect do DETRAN (Constitution Art. 6). **Status:** proposta — C-0002 rev. 2,
aguardando autorização do Owner. **Destino:** rodada **S-1.5 no repositório STYNX**
(`~/Development/stynx`, workspace 1.4.0, commit 75b9966a em 2026-09-26), sob a governança própria de
lá (`AGENTS.md`, `docs/meta/development-contract.md`, DEVAI do STYNX). Este documento **não**
autoriza escrita no STYNX nem abre S-1.5 (C-0002 §2, Art. 6 sem autoridade cruzada): é a entrada que
o Owner leva àquela rodada. **Release alvo:** `@stynx-nyx/*` **1.5.0** (OD-C2-004), grupo fixo.
**Origem:** inspeção (d) de 2026-09-25 (`work/campaigns/C-0002-inspecao-2026-09-25/d-stynx.md`, não versionado — os
fatos necessários estão transcritos aqui), candidatos **U1–U15** das seções 6 e 7 de lá, e releitura do
código em 2026-09-26 (DETRAN `main` a92ef731; STYNX 75b9966a). Substitui o rascunho
rascunho não versionado da rev. 1 (numeração antiga).

**Convenções.** Cada requisito tem id `UPS-<área>-nn`, nível **MUST / SHOULD / MAY** e prova exigida.
Nomes de símbolo novos são **propostas**; S-1.5 pode escolher outros desde que comportamento e prova
se mantenham, e devolve a tabela de conformidade (§7) preenchida. Consumidor nenhum no DETRAN
escreve contrato a partir desta proposta: os contratos das rodadas consumidoras nascem dos `.d.ts`
**publicados** de 1.5.0.

**Classes de prioridade para 1.5.0.** P0/P1 → MUST (bloqueiam a rodada consumidora; ausência →
checkpoint, OD-R22-02). P2 → SHOULD (ausência mantém o código local com desvio registrado em ADR).
P3 → MAY (registro; nenhum consumidor da C-0002 bloqueia).

---

## Decisões do Owner — OD-S15-01 (2026-09-26)

- **Escopo: todos os 15 candidatos (U1–U15) são obrigatórios na 1.5.0.** Todo requisito `UPS-*` de
  U1–U15 passa a ser **MUST** para a conformidade da release, inclusive os que a especificação
  classificava como SHOULD/MAY e P2/P3: TEN, SSE, NGSSE, AUTHZ, SES, JOB, TXN, IFM, NGERR, SHELL,
  TEST, HOOK, CAL, NGIDEM e CLI. A regra de consumo (§7) vale para todos: item ausente leva o CTG
  consumidor a checkpoint e parada (OD-R22-02), sem _shim_ nem cópia. As candidatas UPS-SIG, UPS-OBX
  e UPS-OFS continuam dependentes da confirmação de R-0021 por adenda (§8), com nível fixado nessa
  adenda e aprovado pelo Owner.
- **Consumo por release candidate.** R-0022 (e as rodadas seguintes) pode desenvolver e testar sobre
  `1.5.0-rc.N`, mas o merge em `main` só ocorre com o pin `1.5.0` final e a tabela de conformidade
  (§7) preenchida. Nenhum PR mescla com pin de RC.
- **UPS-TEN-01 = opção (b).** O core abre o escopo de `RequestContext` num **middleware** que roda
  antes de qualquer guard ou interceptor, e a tenancy apenas o enriquece. A ordem de registro deixa de
  importar. A opção (a) fica descartada.
- **UPS-TEN-02, conflito Host × `X-Tenant-Id`: rejeitar.** Em rota pública com tenant, um cabeçalho
  divergente do tenant resolvido pelo Host é rejeitado (fail-closed, com código documentado). O
  tenant nunca é escolhido silenciosamente.
- **Efeito no prazo.** S-1.5 cresce (P2/P3, CLI incluído). O caminho crítico é mitigado pelo consumo
  por RC. A estimativa da campanha é recalibrada no bootstrap de S-1.5.

## 1. Estado verificado (2026-09-26)

- **1.4.0 = 1.3.1 em API.** Os CHANGELOGs 1.4.0 de todos os pacotes de `packages/*` e
  `packages-web/*` só registram a adoção do DEVAI 1.5.0 (changeset 1565d4e). A troca de pin de R-0021
  não muda comportamento; as lacunas abaixo valem para as duas versões.
- **Pin aqui:** 1.3.1 exato em 59 `package.json` de fonte (+ 2 em `dist/`) e em
  `tools/blueprints/generate.mjs:370-371`; a inspeção (d) contou 69 com outro critério de busca.
- **O que já existe no STYNX e é reaproveitado (não pedir de novo):** `StynxSignatureModule`/
  `SignatureService`/`createMockSignatureBackend`/`SequentialSigner` (`packages/signature`);
  `StynxOutboxModule`/`OutboxService`/`verifyOutboxAckSignature` (`packages/outbox`);
  `StynxOfflineSyncModule` com `OfflineSyncStore` e `OfflineSyncContextPort` plugáveis
  (`packages/offline-sync`); `StynxNotificationsModule` (`packages/notifications`);
  `JobsService`/`EnqueueJobInput.actorId` (`packages/jobs`); `WorklistBusinessCalendar`
  (`packages/worklist/src/ports.ts`); `ErrorInterceptor`/`ErrorBannerService` e `createStynxSdkError`
  (`packages-web/angular`); `SessionService.revokeAllForUser` (`packages/sessions`); `If-Match` → 412
  local ao `preferences.controller.ts`/`preferences.service.ts`.
- **Ausências confirmadas por grep:** nenhum `text/event-stream`, `Last-Event-ID` ou `EventSource` em
  `packages/*/src` ou `packages-web/*/src`; `packages-web/angular/src/testing/index.ts`,
  `packages-web/angular-auth/src/testing/index.ts` e `packages-web/angular/testing/index.ts`
  exportam `{}`; `angular-ui/src` não tem shell/layout; `DefaultPolicyEvaluator`
  (`packages/backend/src/authorization/default-policy-evaluator.ts`) compara permissões por igualdade,
  sem curinga; `StynxAuthorizationModule.forRoot` só **provê** `AuthorizationGuard` (não registra
  `APP_GUARD`) e o guard passa `resource = context.getClass().name`, `action = getHandler().name`;
  `PolicyEvaluationContext` (`packages/contracts/src/authorization.ts`) não tem `tenantId`;
  `TenantResolverContext` (`packages/contracts/src/tenancy.ts`) só tem `headerTenantId` e `principal`;
  `ScheduleRecord`/`UpsertScheduleInput` (`packages/jobs/src/types.ts`) não carregam ator de execução
  (só `createdBy`), logo o job materializado de uma _schedule_ roda sem `actorId`; o `AuditInterceptor`
  (`packages/backend/src/audit/audit.interceptor.ts`) grava depois do handler, fora da transação, e só
  registra falha em log; `OutboxService.enqueue` faz _upsert_ por `(tenant_id, entity, entity_id)`
  (no máximo uma mensagem pendente por agregado — semântica de fila de despacho, não de log de
  eventos).

## 2. Matriz consolidada U1–U15 → requisitos → consumidores

| U   | Candidato (inspeção (d) §6)                                       | Ids aqui        | Pacote destino (proposto)                            | Prior.                                  | Código local que sai                                                                                                                                                                                                  | Rodada consumidora           |
| --- | ----------------------------------------------------------------- | --------------- | ---------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| U1  | Ordem RequestContext × TenantContext; rotas públicas com tenant   | UPS-TEN-01…06   | `tenancy`, `core`, `contracts`                       | P0                                      | `backend/app/src/app.module.ts:203-290` (`patchTenantContextInterceptorOrdering`), `request.portalPublic`, `portalRequestHostStorage` (`detran-runtime.ts:468`)                                                       | R-0022                       |
| U2  | SSE backend                                                       | UPS-SSE-01…10   | `backend` (subpath) ou pacote novo                   | P1                                      | `backend/app/src/{teat,portal,dashboard}-stream.{controller,service}.ts`, `handwritten/rait/rait-stream.*` (1.570 l. sem specs)                                                                                       | R-0022                       |
| U3  | Cliente SSE Angular                                               | UPS-NGSSE-01…10 | `angular` (+ `angular/testing`)                      | P1                                      | `apps/rait/web/src/app/core/{sse.service,stream-transport}.ts`, `apps/dashboard/web/src/app/core/sse/*`, `apps/portal/web/src/app/core/realtime.service.ts`, `apps/teat/web/src/app/core/sse.service.ts` (≈ 1.650 l.) | R-0022                       |
| U4  | Ator técnico em jobs                                              | UPS-JOB-01…04   | `jobs`                                               | P1                                      | `backend/app/src/boat-renaest-job.{service,providers}.ts` (438 l.), `backend/domains/dashboard/monitor/src/handwritten/cycle/clock.sweeper.ts`                                                                        | R-0024                       |
| U5  | Auditoria e idempotência na transação do comando                  | UPS-TXN-01…05   | `backend` (audit), `idempotency`                     | P1                                      | `backend/app/src/rait-transactional-audit.interceptor.ts` (118), `backend/domains/portal/requests/src/handwritten/idempotency.service.ts` (155)                                                                       | R-0024                       |
| U6  | Autorização: guard global, alvo configurável, curinga `recurso:*` | UPS-AUTHZ-01…07 | `backend`, `contracts`, `angular-auth`               | P1                                      | `DetranPolicyGuard` (`backend/domains/shared/src/policy.guard.ts`), `DetranPolicyErrorGuard`, `decorators.ts`, `DetranPolicyEvaluator` (`detran-runtime.ts:596`), `apps/dashboard/web/src/app/core/can.directive.ts`  | R-0023                       |
| U7  | Sessão única e fator forte                                        | UPS-SES-01…03   | `sessions`                                           | P2                                      | `backend/app/src/detran-session-policy.ts` (162)                                                                                                                                                                      | R-0023                       |
| U8  | `If-Match`/ETag 428/412                                           | UPS-IFM-01…03   | `backend`                                            | P2                                      | `backend/domains/shared/src/errors/if-match.ts` (43)                                                                                                                                                                  | R-0024                       |
| U9  | Error boundary Angular                                            | UPS-NGERR-01…04 | `angular`, `angular-ui`                              | P2                                      | núcleo de `apps/{rait,dashboard,portal}/web/src/app/core/error-boundary.ts`, `apps/teat/web/src/app/core/error-boundary/*` (≈ 800 l. genéricas de 1.590)                                                              | R-0024                       |
| U10 | Shell/layout acessível                                            | UPS-SHELL-01…04 | `angular-ui`                                         | P2                                      | `rait-shell`, `dashboard-shell`, `citizen-shell`, `field-shell` (≈ 1.090 l.) + shell de `@detran/ui`                                                                                                                  | R-0024                       |
| U11 | Dublês de teste oficiais                                          | UPS-TEST-01…04  | `angular-auth/testing`, `angular/testing`, `testing` | P2 (TEST-01 é P1, exigido por NGSSE-10) | `apps/{rait,dashboard,portal}/web/src/testing/stynx-session.stub.ts` (261), `asQueryable` em 21 arquivos, `i18n-fallback.ts` (3×)                                                                                     | R-0022 (TEST-01), R-0024     |
| U12 | Verificador HMAC de webhook de entrada com janela de relógio      | UPS-HOOK-01…02  | `integration-adapter` ou `backend`                   | P3                                      | `backend/app/src/renach-webhook.guard.ts` (88)                                                                                                                                                                        | R-0024                       |
| U13 | Calendário de dias úteis e relógio injetável                      | UPS-CAL-01…02   | `core` (relógio), `worklist` (calendário)            | P3                                      | `backend/domains/inf/deadlines/src/{calendar,clock,local-date}.ts` (~150), relógios por domínio                                                                                                                       | R-0024                       |
| U14 | Utilitário Angular de `Idempotency-Key`                           | UPS-NGIDEM-01   | `angular`                                            | P3                                      | `apps/{rait,portal}/web/src/app/data/idempotency-key.ts` (2× ~70)                                                                                                                                                     | R-0024                       |
| U15 | Gerador de módulo a partir de blueprint                           | UPS-CLI-01      | `cli`                                                | P3                                      | `tools/blueprints/` (574)                                                                                                                                                                                             | nenhuma na C-0002 (registro) |
| —   | Lacunas de assinatura/documentos (ADR-0018)                       | UPS-SIG-01…04   | `signature`                                          | P1/P2                                   | contornos que R-0021 mantiver atrás da fachada                                                                                                                                                                        | R-0022                       |
| —   | Outbox como log de eventos                                        | UPS-OBX-01…02   | `outbox`                                             | P2                                      | fonte SSE sobre `integration.outbox`                                                                                                                                                                                  | R-0022                       |
| —   | Offline-sync: operações que o protocolo DETRAN usa                | UPS-OFS-01…04   | `offline-sync`                                       | P2                                      | extras de `backend/domains/ops/offline-sync/src/handwritten/*`                                                                                                                                                        | R-0024                       |

As linhas UPS-SIG, UPS-OBX e UPS-OFS são **candidatas**: R-0021 as confirma, remove ou acrescenta por
adenda numerada (§8) no PR do seu CTG-0001, antes de S-1.5 congelar o escopo.

## 3. Tenancy e contexto (U1) — P0 → R-0022

**Por quê.** `TenantContextInterceptor.intercept` (`packages/tenancy/src/tenant-context.interceptor.ts`)
chama `requestContext.snapshot()`, que lança `RequestContextMissingError` sem escopo CLS; tenancy e
core registram cada um seu `APP_INTERCEPTOR` e o Nest não garante a ordem. A ADR-0005 §8 do DETRAN
registra o A/B de 2026-08-31 (500 sem o _shim_, 200 com ele). O _patch_ de protótipo do DETRAN
(comentário ainda citando 1.1.1) cresceu para semear rotas `@Public()` do Portal (R-0009, M11) com
tenant por Host e ator nominal (OD-P27), sem a checagem `hasActiveMembership`. Qualquer mudança interna
da tenancy quebra o isolamento em silêncio.

| Id         | Nível  | Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                            | Prova no STYNX                                                                                                                                                                                                              |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UPS-TEN-01 | MUST   | A ordem entre escopo de `RequestContext` e `TenantContextInterceptor` deixa de depender da ordem de registro: (a) o interceptor de tenancy abre o escopo quando `hasActiveContext()` é falso, com a mesma semente do core (`requestId`, `startedAt`, `tenantId`/`actorId` do request); ou (b) o core expõe um middleware/interceptor de contexto que roda antes de qualquer `APP_INTERCEPTOR`.                                                       | E2E Nest real com as duas ordens forçadas: 200 em ambas, nenhum `RequestContextMissingError`.                                                                                                                               |
| UPS-TEN-02 | MUST   | **Rota pública com tenant** declarativa, sem _membership_: decorador proposto `@PublicTenantRoute()` + opção `publicTenant: { resolve(ctx: { host?: string; headerTenantId?: string; path: string }): string \| undefined \| Promise<string \| undefined>; actorId: string }`. Semeia `tenantId`/`actorId` no `RequestContext` e `request.tenantId`; sem tenant resolvido → 400 (mesmo código de tenant ausente); o ator nominal nunca herda papéis. | Host de A → contexto A; Host A + `X-Tenant-Id` B → rejeição ou contexto A conforme opção documentada, **nunca** B; sem Host resolvível → 400; rota não marcada continua exigindo _membership_ (403 `TENANT_ACCESS_DENIED`). |
| UPS-TEN-03 | MUST   | **Autenticação oportunista** por rota (`@PublicTenantRoute({ optionalAuth: true })`): `Authorization` válido → fluxo autenticado normal; inválido ou ausente → modo público, nunca 401/403.                                                                                                                                                                                                                                                          | E2E: token válido, inválido e ausente.                                                                                                                                                                                      |
| UPS-TEN-04 | MUST   | `TenantResolverContext` ganha `host?: string` (e `path?: string`), preenchidos pelo guard de autenticação.                                                                                                                                                                                                                                                                                                                                           | Unitário do resolver; `pnpm api:baselines`.                                                                                                                                                                                 |
| UPS-TEN-05 | MUST   | Sem mudança para consumidores atuais: `isOptionalTenancyPath`, `headerName`, `allowSubdomain`, cache de _membership_ e mensagens mantidos.                                                                                                                                                                                                                                                                                                           | Suíte de `packages/tenancy` verde; `pnpm check:rls-negative` e `pnpm check:rls-smoke`.                                                                                                                                      |
| UPS-TEN-06 | SHOULD | Nota em `packages-web/MIGRATING.md`/CHANGELOG: quem corrigia a ordem por _patch_ de protótipo deve removê-lo.                                                                                                                                                                                                                                                                                                                                        | Revisão documental.                                                                                                                                                                                                         |

**Negativos MUST adicionais:** _membership_ só em A com `X-Tenant-Id: B` → 403; cabeçalho ≠ claim →
403; UUID não v7 → 400; rota pública nunca expõe linha de outro tenant (RLS real em `pnpm test:int`).
**Consumidor:** `backend/app/src/app.module.ts` (patch, `seedPortalPublicRequest` na linha 415),
`detran-runtime.ts` (`DetranTenantResolver`:489, `seedPortalPublicRequest`:575).

## 4. SSE (U2, U3) — P1 → R-0022

### 4.1 Backend (U2)

**Por quê.** Quatro cópias no DETRAN com o mesmo enquadramento (`: connected`, `: heartbeat` a 20 s,
`Last-Event-ID` → cursor `(created_at, id)` sobre `integration.outbox`, 204 com cursor > 24 h, porta de
agendamento injetável) e divergências de risco: TEAT e RAIT herdam o `AsyncLocalStorage` pelo
temporizador (escopo de tenant implícito no _tick_), Portal e DASHBOARD capturam o escopo e usam
`database.withRequestContext`; limite de conexões e `: dropped` só no DASHBOARD; filtro por política
por tipo só no TEAT. Todas usam `@Get` com resposta manual (não `@Sse`) para o verificador de
decoradores ver o metadado de autorização.

| Id         | Nível  | Requisito                                                                                                                                                                                                                                                                                                        |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UPS-SSE-01 | MUST   | Serviço/helper de fluxo para Nest utilizável num `@Get` comum (proposta `StynxEventStreamService.open(req, res, source, options)`): `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, `: connected` na abertura, frames `id:`/`event:`/`data:` (JSON) com linha em branco. |
| UPS-SSE-02 | MUST   | Heartbeat `: heartbeat` configurável (padrão 20 s) com **porta de agendamento injetável**; nenhum `setInterval` fora da fábrica padrão.                                                                                                                                                                          |
| UPS-SSE-03 | MUST   | Fonte plugável `EventStreamSource<TRow> { now(scope); findById(id, scope); listSince(cursor, scope, limit) }`, cursor `(createdAt, id)`. A implementação padrão sobre a outbox da plataforma é SHOULD (UPS-OBX-01); o consumidor pode fornecer a sua (o DETRAN lê `integration.outbox`).                         |
| UPS-SSE-04 | MUST   | `Last-Event-ID`: conhecido e dentro da janela (padrão 24 h) → retoma; fora da janela → **204** sem corpo; desconhecido (inclusive de outro tenant, invisível por RLS) → começa do `now()` do banco.                                                                                                              |
| UPS-SSE-05 | MUST   | Escopo explícito por conexão: `tenantId`/`actorId` capturados na abertura; **todo** acesso à fonte (abertura e cada _tick_) em `database.withRequestContext(scope, …)`; sem `tenantId` → erro, nunca consulta sem escopo.                                                                                        |
| UPS-SSE-06 | MUST   | `filter(event, ctx) => boolean` e `project(event) => payload` avaliados no servidor antes de escrever; filtros podem descer ao SQL da fonte via `scope` estendido.                                                                                                                                               |
| UPS-SSE-07 | MUST   | _Ticks_ serializados; erro de leitura num _tick_ não derruba a conexão; limpeza no `close` do request e da resposta.                                                                                                                                                                                             |
| UPS-SSE-08 | SHOULD | Limite opcional de conexões por (tenant, ator) com 429 + `Retry-After`; payload máximo por frame com `: dropped <id>`.                                                                                                                                                                                           |
| UPS-SSE-09 | SHOULD | `retry:` opcional na abertura; métricas (conexões, frames, _drops_) em logging/health.                                                                                                                                                                                                                           |
| UPS-SSE-10 | MUST   | Contrato de fio documentado: ordem, entrega "pelo menos uma vez" com deduplicação por `id` no cliente, janela de _replay_.                                                                                                                                                                                       |

**Testes MUST:** unitários de enquadramento e cursor; E2E Nest com PostgreSQL/RLS reais — dois
tenants, evento de B nunca entregue a A, `Last-Event-ID` de B tratado como desconhecido, 204 fora da
janela, heartbeat com agendador falso, _ticks_ serializados, filtro negando um tipo, 429 e `: dropped`
quando ligados; teste de vazamento (conexão fechada libera agendamentos).

### 4.2 Cliente Angular (U3)

**Por quê.** `EventSource` não envia o _bearer_ STYNX (DIVERGE-1): RAIT, DASHBOARD e Portal leem o fluxo
por `HttpClient` (`observe: 'events'`, `partialText`); **TEAT web usa `EventSource` nativo e conecta
sem _bearer_ nem `X-Tenant-Id`** (`apps/teat/web/src/app/core/sse.service.ts:67`, defeito). Políticas
divergentes: backoff 1→30 s (RAIT, DASHBOARD) × sem backoff (Portal); polling 15 s (RAIT, TEAT), 30 s
(DASHBOARD), 60 s (Portal).

| Id           | Nível | Requisito                                                                                                                                                                                                                                                                                         |
| ------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UPS-NGSSE-01 | MUST  | `provideStynxEventStream(config)` + `StynxEventStreamService` (nomes propostos) sobre o `HttpClient` de `provideStynxDefaults` (herda _bearer_, `X-Tenant-Id`, _request-id_), `observe: 'events'`, `reportProgress: true`, `responseType: 'text'`, _parser_ incremental. **Nunca** `EventSource`. |
| UPS-NGSSE-02 | MUST  | Estados por _signals_: `idle` → `live` → `reconnecting` → `polling` → `stopped`; `status()`, `polling()`, `lastEventId()`; `events$` tipado; `tick$` durante `polling`.                                                                                                                           |
| UPS-NGSSE-03 | MUST  | Backoff exponencial configurável (`initialMs`, `maxMs`; padrão 1 s → 30 s) e opção de compasso fixo.                                                                                                                                                                                              |
| UPS-NGSSE-04 | MUST  | _Fallback_ para polling após `failuresBeforePolling` falhas em `failureWindowMs` (padrões 2 e 60 s, configuráveis); `pollingIntervalMs` **obrigatório por app**; reabertura com primeiro frame → `live`, contadores zerados.                                                                      |
| UPS-NGSSE-05 | MUST  | `Last-Event-ID` = último `id` recebido; 204 → reabre sem ele; deduplicação por `id`.                                                                                                                                                                                                              |
| UPS-NGSSE-06 | MUST  | Sem frame por `heartbeatMs × staleFactor` (20 s × 2) → conexão caída.                                                                                                                                                                                                                             |
| UPS-NGSSE-07 | MUST  | 401/403 → `stopped`; 429 → próxima tentativa em `max(backoff, Retry-After)`; 0/5xx → falha contada.                                                                                                                                                                                               |
| UPS-NGSSE-08 | MUST  | Troca de tenant (`TenantContextService`) fecha e reabre sem `Last-Event-ID`; _logout_ → `stopped`.                                                                                                                                                                                                |
| UPS-NGSSE-09 | MUST  | Filtro de tipos no cliente (`types`, `eventPrefix`); o serviço só entrega dados, nenhum campo vira texto de tela.                                                                                                                                                                                 |
| UPS-NGSSE-10 | MUST  | Transporte substituível e **dublê publicado** em `@stynx-nyx/angular/testing` (UPS-TEST-01): transporte falso com frames, erros HTTP, fechamento e relógio controlável.                                                                                                                           |

**Testes MUST:** _parser_ (fragmentos arbitrários, CRLF, comentários, `data:` multilinha); cada
transição com relógio falso; _bearer_ e `X-Tenant-Id` presentes (`HttpTestingController`); 204, 401,
403, 429 com `Retry-After`; troca de tenant; deduplicação.

## 5. Autorização e sessão (U6, U7) — P1/P2 → R-0023

**Por quê.** O DETRAN monta `StynxAuthorizationModule.forRoot({ policyEvaluator: new
DetranPolicyEvaluator() })` (`backend/app/src/app.module.ts`), mas nenhum controlador usa
`@RequirePermissions`/`@RequireRoles`: quem decide é `DetranPolicyGuard` com metadado próprio
(`@Resource`/`@Action`/`@Public`), encadeado por `DetranPolicyErrorGuard` — dois caminhos, risco de
decisões divergentes (inspeção (d) A3). `detran-session-policy.ts` implementa sessão única
(`DetranSingleSessionInterceptor`) e fator forte (`DetranSessionStrongFactorGuard`).

| Id           | Nível  | Requisito                                                                                                                                                                                                                                                                      | Prova                                                                    |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| UPS-AUTHZ-01 | MUST   | `forRoot({ …, global: true })` registra `AuthorizationGuard` como `APP_GUARD`.                                                                                                                                                                                                 | E2E com rota sem metadado (passa) e com metadado (avaliada).             |
| UPS-AUTHZ-02 | MUST   | `resolveTarget(ctx: ExecutionContext) => { resource?: string; action?: string } \| undefined`, para o consumidor ler o próprio metadado (DETRAN: `detran:resource`/`detran:action`, método > classe). Sem alvo e sem metadado STYNX → rota não avaliada (comportamento atual). | Unitário + E2E.                                                          |
| UPS-AUTHZ-03 | MUST   | `publicMetadataKey` configurável que faz o guard pular a avaliação.                                                                                                                                                                                                            | E2E rota pública.                                                        |
| UPS-AUTHZ-04 | MUST   | `PolicyEvaluationContext.tenantId?` (do `RequestContext`) e leitura de `principal.claims`.                                                                                                                                                                                     | Unitário do avaliador recebendo ambos.                                   |
| UPS-AUTHZ-05 | MUST   | `onDeny(ctx, target, principal) => Error` para preservar envelopes (`RAIT.FORBIDDEN_ACTION` 403, `TEAT.AUTH_REQUIRED` 401, `TEAT.FORBIDDEN_ACTION` 403); sem fábrica → `ForbiddenException`.                                                                                   | E2E com fábrica aplicada.                                                |
| UPS-AUTHZ-06 | MUST   | Curinga `recurso:*` e `*` em `DefaultPolicyEvaluator`, `StynxSessionService.hasAllPermissions` e `*stynxHasPermission` (`packages-web/angular-auth/src/has-permission.directive.ts`).                                                                                          | Unitários de presença **e** ausência (ex.: `ops:*` não concede `inf:x`). |
| UPS-AUTHZ-07 | SHOULD | Avaliador exportado por token injetável, para uso fora do guard (filtro SSE por tipo, UPS-SSE-06).                                                                                                                                                                             | Unitário.                                                                |
| UPS-SES-01   | SHOULD | Política opcional de **sessão única** em `SessionService.create` (revoga ou recusa as anteriores; reaproveita `revokeAllForUser`).                                                                                                                                             | E2E revogação e recusa.                                                  |
| UPS-SES-02   | SHOULD | Exigência opcional de **fator forte** na criação/troca de sessão, com marcador verificável (claim `amr`/`acr` configurável).                                                                                                                                                   | E2E recusa sem fator forte.                                              |
| UPS-SES-03   | SHOULD | Contribuidor de prontidão do armazenamento de sessão para `@stynx-nyx/health`.                                                                                                                                                                                                 | Unitário.                                                                |

**Consumidor:** `backend/domains/shared/src/{policy.guard,decorators}.ts`,
`backend/app/src/{detran-policy-error.guard,detran-session-policy}.ts`, `detran-runtime.ts:596`,
`apps/dashboard/web/src/app/core/can.directive.ts`. R-0023 prova por matriz papel × rota idêntica antes
e depois (`backend/app/tests/e2e/policy-routes.e2e.spec.ts` como padrão).

## 6. Demais candidatos (U4, U5, U8–U15) e lacunas de 7a

### 6.1 Jobs com ator técnico (U4) — P1 → R-0024

Justificativa registrada no DETRAN: R-0010 `contracts/CTG-0002.md` C-2-21 (`@stynx-nyx/jobs` não
executa o handler BOAT até provar propagação de `actorId` da _schedule_ materializada e separação
entre o controle `jobs.*` e o SQL de domínio sob `role_app_backend`/RLS).

| Id         | Nível  | Requisito                                                                                                                                                                                                   |
| ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UPS-JOB-01 | MUST   | `UpsertScheduleInput.actorId` (ator técnico) persistido em `ScheduleRecord` e copiado para cada job materializado; handler roda sob `RequestContext` com `tenantId`/`actorId`, não sob `withSystemContext`. |
| UPS-JOB-02 | MUST   | Separação de papel: claim/estado de `jobs.*` em contexto de sistema; SQL do handler só pela conexão de aplicação com RLS do tenant do job.                                                                  |
| UPS-JOB-03 | MUST   | Cron com fuso por tenant (hoje 5 campos UTC): `timezone` na _schedule_ e regra DST documentada (ambígua → ocorrência posterior; lacuna → primeiro instante válido posterior, como C-2-20).                  |
| UPS-JOB-04 | SHOULD | `JobsWorker` com porta de agendamento injetável (hoje `setInterval` interno) para testes determinísticos.                                                                                                   |

**Testes:** E2E com RLS real — handler de _schedule_ grava com `actor_id` técnico e só no tenant do
job; tentativa de ler outro tenant → zero linhas; DST nos dois sentidos.

### 6.2 Auditoria e idempotência transacionais (U5) — P1 → R-0024

| Id         | Nível  | Requisito                                                                                                                                                                                                                 |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UPS-TXN-01 | MUST   | Modo transacional do `AuditInterceptor`/`@Audit`: o evento é gravado na **mesma transação** do handler (via `Database.tx` ativa no contexto); falha de gravação aborta o comando (hoje só loga).                          |
| UPS-TXN-02 | MUST   | `IdempotencyInterceptor` com modo "na transação do comando": reserva/concluir dentro da tx do handler; rollback do comando libera a chave.                                                                                |
| UPS-TXN-03 | MUST   | Escopo de chave configurável (`scope(ctx) => string`, ex.: sujeito do Portal ou `public`) e impressão do corpo por JSON canônico; mesmo corpo → replay de status e corpo; corpo divergente → 409 com código configurável. |
| UPS-TXN-04 | SHOULD | Política de persistência por status (DETRAN grava 2xx e o 502 `DELEGATION_FAILED`).                                                                                                                                       |
| UPS-TXN-05 | SHOULD | Opção `requireActor` em `Database.tx` (hoje `withTenantContext` local, `backend/domains/shared/src/tenant-context.ts`).                                                                                                   |

**Testes:** E2E com rollback forçado (sem evento de auditoria, chave liberada), replay, 409.

### 6.3 `If-Match` padronizado (U8) — P2 → R-0024

UPS-IFM-01 (SHOULD) decorador/pipe `@RequireIfMatch()` que exige o cabeçalho (428 ausente) e expõe a
revisão ao handler; UPS-IFM-02 (SHOULD) exceção `PreconditionFailed` → 412 com envelope STYNX;
UPS-IFM-03 (SHOULD) `ETag` na resposta a partir da revisão. Generaliza o padrão já local em
`packages/preferences`. **Testes:** 428, 412, sucesso com revisão nova.

### 6.4 Error boundary Angular (U9) — P2 → R-0024

UPS-NGERR-01 (SHOULD) `classifyStynxError(error) => { kind, status, code, messageKey }` sobre
`createStynxSdkError`; UPS-NGERR-02 (SHOULD) mapa por prefixo de código → chave i18n configurável por
app; UPS-NGERR-03 (SHOULD) `StynxErrorBannerComponent` em `angular-ui` ligado ao `ErrorBannerService`;
UPS-NGERR-04 (SHOULD) `ErrorInterceptor` com lista de exclusão (ex.: rota SSE, 412 tratado em tela).
**Testes:** tabela status × código × chave; exclusões.

### 6.5 Shell/layout (U10) — P2 → R-0024

UPS-SHELL-01 (SHOULD) componente de layout com grupos de navegação e item ativo; UPS-SHELL-02
(SHOULD) _skip link_ e região `aria-live`; UPS-SHELL-03 (SHOULD) todos os rótulos por i18n (hoje o kit
tem `aria-label` fixo em pt); UPS-SHELL-04 (SHOULD) tema persistido. **Testes:** axe sem
`serious`/`critical`; navegação por teclado.

### 6.6 Dublês de teste (U11) — P1 (TEST-01) / P2

UPS-TEST-01 (MUST, exigido por NGSSE-10) `@stynx-nyx/angular/testing`: transporte SSE falso e relógio;
UPS-TEST-02 (SHOULD) `@stynx-nyx/angular-auth/testing`: `StynxSessionService` falso com sinais,
permissões e `active$`; UPS-TEST-03 (SHOULD) `@stynx-nyx/testing`: `Transaction` falsa tipada
(elimina o _duck-typing_ `asQueryable` de 21 arquivos, ex.
`backend/domains/shared/src/events/sql-outbox.ts`); UPS-TEST-04 (SHOULD) harness de i18n fora do
bootstrap. **Prova:** os próprios testes do STYNX passam a usar os dublês.

### 6.7 Webhook HMAC com janela de relógio (U12) — P3 → R-0024

`verifyOutboxAckSignature` (`packages/outbox/src/ack-signature.ts`) já verifica `sha256=<hex>` em tempo
constante, sem carimbo de tempo. UPS-HOOK-01 (MAY) verificador genérico com cabeçalho de _timestamp_,
janela de _clock-skew_ configurável e proteção de _replay_; UPS-HOOK-02 (MAY) guard Nest correspondente.
Consumidor: `backend/app/src/renach-webhook.guard.ts`.

### 6.8 Calendário e relógio (U13) — P3 → R-0024

UPS-CAL-01 (MAY) porta `Clock` injetável em `core`; UPS-CAL-02 (MAY) implementação de
`WorklistBusinessCalendar` com feriados como dados e aritmética de data local por fuso. Consumidor:
`backend/domains/inf/deadlines/src/{calendar,clock,local-date}.ts`. Valores de feriado nunca vêm do
STYNX (dados do DETRAN).

### 6.9 `Idempotency-Key` no Angular (U14) — P3 → R-0024

UPS-NGIDEM-01 (MAY) gerador de chave e interceptor opcional que a anexa a comandos marcados, com
SHA-256 do corpo quando pedido. Consumidor: `apps/{rait,portal}/web/src/app/data/idempotency-key.ts`.

### 6.10 Gerador de módulo (U15) — P3, sem consumidor na C-0002

UPS-CLI-01 (MAY) `stynx generate module --blueprint <json>` (repositório, controlador, DDL com RLS).
Registro apenas; `tools/blueprints/` continua local na C-0002.

### 6.11 Assinatura e documentos (lacunas de R-0021, ADR-0018) — candidatas

R-0021 troca `backend/domains/ch/clinical-reports/src/pades-signing.http-adapter.ts` (usado também por
`ch/juntas/src/junta-signing.adapter.ts`) e `backend/domains/shared/src/documents/document-trust.http-adapter.ts`
por `@stynx-nyx/signature` montado no app atrás da fachada `@detran/shared/documents`. Lacunas visíveis
em 2026-09-26, **a confirmar por R-0021** (adenda §8):

| Id         | Nível  | Candidata                                                                                                                                                                                       | Evidência                                                                                                             |
| ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| UPS-SIG-01 | MUST   | Nível mínimo de assinatura no pedido e no resultado (`ADVANCED` \| `QUALIFIED`, Lei 14.063/2020), recusado fail-closed quando o provedor não atinge o nível.                                    | `ClinicalArtifactRequest.minimumSignatureLevel`; `SignatureRequest` só tem `metadata` livre.                          |
| UPS-SIG-02 | SHOULD | Contribuidor de prontidão para `@stynx-nyx/health` que exige capacidades (PAdES, TSA, LTA, OCSP ou CRL).                                                                                        | `PadesSigningHttpAdapter.checkCapabilities()`; `DetranClinicalTrustReadiness`.                                        |
| UPS-SIG-03 | MUST   | Manifesto JSON canônico com múltiplos signatários **com evidência PAdES/certificado por signatário** (atas colegiadas), sobre `SequentialSigner` (hoje só _digest_, `signedAt` padrão época 0). | `document-trust.http-adapter.ts` (`prepareSessionMinutesManifest`, `prepareBatchMinutesManifest`, `verify*Evidence`). |
| UPS-SIG-04 | SHOULD | Verificação de evidência de retirada/revogação de assinatura.                                                                                                                                   | `verifyWithdrawalEvidence`.                                                                                           |

**Testes:** fail-closed sem backend configurado (`SignatureProviderConfigurationError`), nível não
atingido → erro tipado, manifesto adulterado → `tampered`.

### 6.12 Outbox como log de eventos — candidatas (R-0021 → R-0022)

UPS-OBX-01 (SHOULD) modo _append_ em `OutboxService` (dedup só por `(tenant_id, idempotency_key)`, sem
_upsert_ por agregado) e leitura por cursor `(created_at, id)` como `EventStreamSource` padrão
(UPS-SSE-03). UPS-OBX-02 (SHOULD) _ledger_ de tentativas com _hash_ de requisição/resposta e protocolo
do provedor (hoje `integration.delivery_attempt`, DDL `backend/database/ddl/04-integration-storage.sql`).

### 6.13 Offline-sync — candidatas (R-0021 → R-0024)

`OfflineSyncService` cobre reservar/cancelar numeração, lote, abrir/resolver conflito. O protocolo
DETRAN (`backend/domains/ops/offline-sync/src/handwritten/*`, 2.903 l.) usa ainda: UPS-OFS-01 (SHOULD)
bloquear/fechar/reconciliar/liquidar faixa de numeração e consulta de consumo; UPS-OFS-02 (SHOULD)
recibos por chave de idempotência; UPS-OFS-03 (SHOULD) porta de **aplicação** de item de lote ao
domínio (_applier_) na mesma transação; UPS-OFS-04 (SHOULD) detector de concorrência por janela.

## 7. Tabela de conformidade (devolvida por S-1.5)

| Id                                                       | Publicado em | Símbolo(s) reais | Teste(s) | Desvio da proposta |
| -------------------------------------------------------- | ------------ | ---------------- | -------- | ------------------ |
| UPS-TEN-01…06                                            |              |                  |          |                    |
| UPS-SSE-01…10                                            |              |                  |          |                    |
| UPS-NGSSE-01…10                                          |              |                  |          |                    |
| UPS-AUTHZ-01…07, UPS-SES-01…03                           |              |                  |          |                    |
| UPS-JOB-01…04                                            |              |                  |          |                    |
| UPS-TXN-01…05                                            |              |                  |          |                    |
| UPS-IFM-01…03, UPS-NGERR-01…04, UPS-SHELL-01…04          |              |                  |          |                    |
| UPS-TEST-01…04                                           |              |                  |          |                    |
| UPS-HOOK-01…02, UPS-CAL-01…02, UPS-NGIDEM-01, UPS-CLI-01 |              |                  |          |                    |
| UPS-SIG-* / UPS-OBX-* / UPS-OFS-* (após §8)              |              |                  |          |                    |

**Regra de consumo.** MUST ausente → o CTG consumidor faz checkpoint e para (OD-R22-02), sem _shim_
novo nem cópia do código STYNX. SHOULD/MAY ausente → o código local fica, com desvio registrado na ADR
de divisão STYNX × DETRAN criada por R-0021, e o item volta ao _backlog_ de upstream.

## 8. Adendas

Numeradas (`A1`, `A2`…), cada uma com data, rodada de origem (R-0021 para UPS-SIG/OBX/OFS) e decisão
do Owner quando mudar escopo ou nível. Sem adendas em 2026-09-26.

## 9. Decisão do Owner (registrada)

| OD        | Pergunta               | Opções                                                                                                                             | Recomendação do Architect      |
| --------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| OD-S15-01 | Escopo mínimo da 1.5.0 | **Decidida pelo Owner em 2026-09-26:** todos os 15 obrigatórios; consumo por RC com merge só na final; TEN-01 (b); TEN-02 rejeitar | ver §Decisões do Owner no topo |

O registro canônico da OD é `docs/meta/knowledge-base/open-decisions-rait.md` (seção C-0002), no PR
de CTG-0001 de R-0021, que é a primeira rodada da campanha a consumir esta especificação.
