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

**Primeiro ciclo (exaustivo) da entrega do grupo acoplado CTG-0004 (WP-P6 — integração e
homologação)** — tríade TASK-0022 (Architect, **Codex Terra**: `work/rounds/R-0014/contracts/CTG-0004.md`,
74 critérios C-4-nn, [DIVERGE-1…3], OD-P103…P108; it. 2 fechou §3 com as fontes reais do mock),
TASK-0010 (Inspector, Codex Terra/Luna, 10 iterações restritas — adendas A15…A20/A22:
`backend/app/tests/e2e/{portal-journeys.e2e.spec,portal-journeys.support,portal-national-mock.e2e.spec,portal-national-unavailable.e2e.spec,portal-payload-lint.e2e.spec}.ts`
— 11 jornadas, leituras/escritas nacionais pelo `senatran-mock` em processo (M18), C-4-54 por fatia
de porta que lança `SenatranAdapterError('PROVIDER')` (A19(c)), lint de payload com a exceção
A15; e duas asserções de R-0009 substituídas pela forma normalizada: `portal-routes.e2e.spec.ts`
C-0002-77 (A20) e `portal-seed.integration.spec.ts` C-0001-33 (A22)), TASK-0011 (Engineer-backend,
Codex Terra, 4 tentativas/iterações — A17, A19, A21: `documents.controller.ts` (normalização
CNH-e/veículos/quitação §3), `sne-enrollment.service.ts` (`SnePort` pelo adapter antes de gravar/
publicar, §4), `inbox.controller.ts` (`push-subscriptions` no padrão M9 com `PortalIdempotencyService`,
A19(b)), `portal-national-read.providers.ts` (fatia `sne`), `ci.yml` job `backend-kernel` (mock
antes de `pnpm backend:test:e2e`, tiers unit/integration preservados — A21), seeds do mock
`20-read.sql`/`80-sne.sql`/`85-cdt.sql` (CPF Prata `22222222222` e Ouro `33333333333` —
[DIVERGE-1]/A17, commit separado) e `70-fixtures-portal.sql` (entitlement `vehicle` da Prata,
UUIDv5 do chassi)). Todas as decisões em `plan.md` §Adendas **A13…A22**. Reviewer desta rodada:
Codex (B3, `AUTHORIZATION.md` Amendment 2) — workers também Codex; julgue com o mesmo rigor. A
entrega está **na worktree, não commitada** (`git diff`; os cinco specs novos estão em
intent-to-add), no branch publicado `orchestra/portal-pwa` (= `origin/main` `4c3be453` + observação

- pacote de retomada + contrato).

Gates executados pelo maestro (banco `detran_r14` recém-semeado, mock em `:3001`):
`pnpm --filter @detran/app test:e2e` → **Test Files 17 passed, Tests 241 passed | 2 todo (243)**;
`pnpm backend:test:ci` → verde após A22 (único vermelho era a contagem 12→13 do seed);
`pnpm verify:senatran-boundary` OK (2288 arquivos); `pnpm verify:decorators` OK; typecheck do
repositório 0; `pnpm --filter @detran/portal-web typecheck` 0; `pnpm format:check` OK; `pnpm check`
→ **EXIT 0** (portal-web 118 arquivos / 1314 verdes | 14 todo; bundle 542,3 kB).

Itens a julgar com atenção: (5) nada inventado — fixtures do mock com valores fechados no contrato
§2 ([DIVERGE-1]/A17), mapeamento §3 por `ref_situacao_cnh` (`B` → `null`, OD-P103), `vehicleId`
UUIDv5 do chassi (RENAVAM nunca sai), quitação só `multa` por `getPaymentQuote` (OD-P104), CRLV
422 `documento_assinado_pendente_r0014` (OD-P105), VAPID `source_pending` (OD-P88); (7) gates —
as duas substituições em specs de R-0009 (A20/A22) trocam repasse bruto por forma normalizada e
contagem 12→13, nunca relaxam; nenhuma asserção por conjunto de status (A15); nenhum `skip`; a
mudança de `ci.yml` preserva todos os tiers (A21); (8) tokens só do catálogo; lint de payload
C-4-68 exaustivo por token, exceção fechada A15 (`GET identity/me.cpf` do titular); (9) fronteira
nacional — `SnePort`/`CdtPort` só pelo adapter; nenhum nome de variável `SENATRAN_*_BASE_URL` em
`backend/**`; a fatia falsa de C-4-54 é a única e está justificada (A19(c)); (11) A16/A18/A19
registram o que ficou fora (cancelamento SNE local — OD-P106; `DELETE push` — OD-P108; JRN-010 pára
em 422 M15 na criação); (13) paradas por decisão exaustivas (M15 ×3 serviços, OD-P15, OD-P17 ×3,
OD-P19).

### git diff --stat (sem `work/`)

```
 .github/workflows/ci.yml                                              |  14 +-
 backend/app/src/portal-national-read.providers.ts                     |   8 +
 backend/app/tests/e2e/portal-journeys.e2e.spec.ts                     | 494 ++++++++++++++++++++++++++++++++
 backend/app/tests/e2e/portal-journeys.support.ts                      | 140 +++++++++
 backend/app/tests/e2e/portal-national-mock.e2e.spec.ts                | 225 +++++++++++++++
 backend/app/tests/e2e/portal-national-unavailable.e2e.spec.ts         |  95 ++++++
 backend/app/tests/e2e/portal-payload-lint.e2e.spec.ts                 | 263 +++++++++++++++++
 backend/app/tests/e2e/portal-routes.e2e.spec.ts                       |  12 +-
 backend/database/seed/70-fixtures-portal.sql                          |   3 +-
 .../portal/identity/tests/integration/portal-seed.integration.spec.ts |   2 +-
 backend/domains/portal/inbox/src/handwritten/inbox.controller.ts      |  50 +++-
 .../domains/portal/inbox/src/handwritten/sne-enrollment.service.ts    |  53 +++-
 .../portal/projections/src/handwritten/documents.controller.ts        | 126 +++++++-
 senatran-mock/database/seed/20-read.sql                               |  23 ++
 senatran-mock/database/seed/80-sne.sql                                |   5 +
 senatran-mock/database/seed/85-cdt.sql                                |   4 +
 tools/orchestra/worker.sh                                             |   5 +-
 17 files changed, 1498 insertions(+), 24 deletions(-)
```

### git diff — produção, seeds e CI (sem `work/` e sem os specs novos — leia-os na worktree; inclui as duas substituições A20/A22)

```diff
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index 9569b6da..6e7b7509 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -185,8 +185,8 @@ jobs:
       - name: Verify blueprint regeneration has no drift
         run: pnpm blueprints:check

-      - name: Run backend unit, integration and e2e tiers
-        run: pnpm backend:test:ci
+      - name: Run backend unit and integration tiers
+        run: pnpm backend:test:unit && pnpm backend:test:integration

       - name: Verify SENATRAN boundary and generated contract drift
         run: |
@@ -202,7 +202,7 @@ jobs:
       # reusing this job's PostGIS service, but isolate the mock in its own
       # database and process. The required senatran-mock-tests job still owns
       # the mock's complete 245-test regression suite.
-      - name: Run adapter contract tier against the in-repo SENATRAN mock
+      - name: Run backend e2e and adapter contract tiers against the in-repo SENATRAN mock
         env:
           DB_NAME: senatran
           DATABASE_URL: postgresql://postgres:postgres@localhost:5432/senatran
@@ -222,6 +222,14 @@ jobs:
             fi
             sleep 1
           done
+          DB_NAME=detran \
+          DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
+          DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
+          STYNX_OWNER_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
+          STYNX_APP_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran?options=-c%20role%3Drole_app_backend' \
+          STYNX_READER_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran?options=-c%20role%3Drole_app_backend' \
+          SENATRAN_PROVIDER=mock \
+          pnpm backend:test:e2e
           pnpm --filter @detran/senatran-adapter test:e2e

   # ---------------------------------------------------------------------------
diff --git a/backend/app/src/portal-national-read.providers.ts b/backend/app/src/portal-national-read.providers.ts
index 40e08801..0c8934fd 100644
--- a/backend/app/src/portal-national-read.providers.ts
+++ b/backend/app/src/portal-national-read.providers.ts
@@ -21,6 +21,7 @@ import {
   type PortalParameterReader,
   type PortalProjectionPoller,
 } from '@detran/portal-projections';
+import { PORTAL_SNE_PORT, type PortalSnePort } from '@detran/portal-inbox';
 import { createSenatranAdapter } from '@detran/senatran-adapter';

 import { createDefaultTeatStreamPoller } from './teat-stream.service.js';
@@ -37,6 +38,11 @@ export const PORTAL_NATIONAL_READ_PORTS_PROVIDER = {
   },
 };

+export const PORTAL_SNE_PORT_PROVIDER = {
+  provide: PORTAL_SNE_PORT,
+  useFactory: (): PortalSnePort => createSenatranAdapter().ports.sne,
+};
+
 export const PORTAL_PARAMETER_READER_PROVIDER = {
   provide: PORTAL_PARAMETER_READER,
   useFactory: (service: OpsParameterService): PortalParameterReader => service,
@@ -53,11 +59,13 @@ export const PORTAL_PROJECTION_POLLER_PROVIDER = {
   imports: [ParameterModule],
   providers: [
     PORTAL_NATIONAL_READ_PORTS_PROVIDER,
+    PORTAL_SNE_PORT_PROVIDER,
     PORTAL_PARAMETER_READER_PROVIDER,
     PORTAL_PROJECTION_POLLER_PROVIDER,
   ],
   exports: [
     PORTAL_NATIONAL_READ_PORTS,
+    PORTAL_SNE_PORT,
     PORTAL_PARAMETER_READER,
     PORTAL_PROJECTION_POLLER,
   ],
diff --git a/backend/app/tests/e2e/portal-routes.e2e.spec.ts b/backend/app/tests/e2e/portal-routes.e2e.spec.ts
index 80a49596..aff936f5 100644
--- a/backend/app/tests/e2e/portal-routes.e2e.spec.ts
+++ b/backend/app/tests/e2e/portal-routes.e2e.spec.ts
@@ -594,7 +594,13 @@ describe('CTG-0002 §2.5/§8 — documentos, veículos, sinistros, exames (C-000
     const cnh = await api().get('/v1/portal/documents/cnh').set(headers());
     expect(cnh.status, JSON.stringify(cnh.body)).toBe(200);
     expect(cnh.body).toMatchObject({
-      license: { category: 'B', status: 'fixture' },
+      // A20: forma normalizada (CTG-0004 §3) substitui o repasse bruto de R-0009.
+      license: {
+        status: null,
+        validUntil: null,
+        categories: [],
+        restrictions: [],
+      },
       qrVerification: null,
       documentBytes: null,
       category: 'C',
@@ -618,10 +624,12 @@ describe('CTG-0002 §2.5/§8 — documentos, veículos, sinistros, exames (C-000

     const vehicles = await api().get('/v1/portal/vehicles').set(headers());
     expect(vehicles.status, JSON.stringify(vehicles.body)).toBe(200);
+    // A20: item sem chassi não é projetado (CTG-0004 §3).
     expect(vehicles.body).toMatchObject({
-      items: [{ plate: 'FIX2EE1', renavam: '00000000001' }],
+      items: [],
     });
     expect(typeof vehicles.body.cachedAt).toBe('string');
+    expect(JSON.stringify(vehicles.body)).not.toContain('renavam');

     const notEntitled = await api()
       .get(`/v1/portal/vehicles/${randomUUID()}/clearance`)
diff --git a/backend/database/seed/70-fixtures-portal.sql b/backend/database/seed/70-fixtures-portal.sql
index e5ad40fb..50e29f9a 100644
--- a/backend/database/seed/70-fixtures-portal.sql
+++ b/backend/database/seed/70-fixtures-portal.sql
@@ -93,7 +93,8 @@ values
   ('00000000-0000-7000-8000-000070200009', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000005', 'ait', '00000000-0000-7000-8000-0000f0000002', 'representative', 'representation', '2026-01-01', '2027-09-14'),
   ('00000000-0000-7000-8000-00007020000a', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'vehicle', '00000000-0000-7000-8000-00007ff00001', 'owner', 'renavam', '2026-01-01', null),
   ('00000000-0000-7000-8000-00007020000b', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'exam', '00000000-0000-7000-8000-00007ff00002', 'interested_party', 'manual', '2026-01-01', null),
-  ('00000000-0000-7000-8000-00007020000c', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000004', 'crash', '00000000-0000-7000-8000-00007ff00003', 'interested_party', 'manual', '2026-01-01', null)
+  ('00000000-0000-7000-8000-00007020000c', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000004', 'crash', '00000000-0000-7000-8000-00007ff00003', 'interested_party', 'manual', '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007020000d', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'vehicle', 'a1204f2f-07f6-551a-9e82-0e28038d3049', 'owner', 'renavam', '2026-01-01', null)
 on conflict (id) do update set
   target_kind = excluded.target_kind, target_id = excluded.target_id, relation = excluded.relation,
   origin = excluded.origin, valid_from = excluded.valid_from, valid_until = excluded.valid_until;
diff --git a/backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts b/backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts
index 2a08c61e..dc3a5d3b 100644
--- a/backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts
+++ b/backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts
@@ -68,7 +68,7 @@ describe('70-fixtures-portal.sql — contagens e invariantes (CTG-0001 §10.9, M
     expect(counts).toEqual({
       subject: 5,
       representation: 1,
-      entitlement: 12,
+      entitlement: 13, // A22 (R-0014 CTG-0004 §3): entitlement vehicle da Prata (UUIDv5 do chassi)
       act_level_policy: 21,
       request: 13,
       request_draft: 1,
diff --git a/backend/domains/portal/inbox/src/handwritten/inbox.controller.ts b/backend/domains/portal/inbox/src/handwritten/inbox.controller.ts
index 17ee82ea..ff1e05a3 100644
--- a/backend/domains/portal/inbox/src/handwritten/inbox.controller.ts
+++ b/backend/domains/portal/inbox/src/handwritten/inbox.controller.ts
@@ -2,18 +2,20 @@
 // (work/rounds/R-0009/contracts/CTG-0002.md §2.4; plan R-0009 M15, M19, M20).
 // O controlador só extrai identidade, parâmetros e corpo, abre a transação
 // de tenant (`withTenantContext`, ADR-0002), garante o sujeito (upsert
-// idempotente, CTG-0001 §8) e delega a `PortalInboxService`. `Idempotency-Key`
-// das duas mutações é do kernel (`@Action` ⇒ `@Idempotent()`); a leitura é
-// idempotente por desenho (§6.1).
+// idempotente, CTG-0001 §8) e delega a `PortalInboxService`. A inscrição push
+// é M9: anula o interceptor do kernel e usa `PortalIdempotencyService`, para
+// preservar replay e o conflito Portal canônico (§4 do CTG-0004).
 import {
   Body,
   Controller,
   Get,
+  Headers,
   HttpCode,
   Param,
   Post,
   Query,
   Req,
+  Res,
   UseGuards,
 } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
@@ -21,6 +23,7 @@ import { Database, type Transaction } from '@stynx-nyx/data';
 import {
   Action,
   Audit,
+  NoIdempotent,
   Resource,
   withTenantContext,
   type RequestLike,
@@ -34,6 +37,7 @@ import {
   type PortalPagedResponse,
   type PortalSubjectRecord,
 } from '@detran/portal-identity';
+import { PortalIdempotencyService } from '@detran/portal-requests';

 import {
   PortalInboxService,
@@ -44,6 +48,15 @@ import {
 } from './inbox.service.js';

 type CitizenRequest = RequestLike & PortalIdentityRequest;
+type PortalHeaders = Record<string, string | string[] | undefined>;
+
+interface ResponseLike {
+  setHeader(name: string, value: string): unknown;
+  status(code: number): unknown;
+}
+
+const PUSH_SUBSCRIPTION_ROUTE_KEY = 'POST /v1/portal/push-subscriptions';
+const REPLAYED_HEADER = 'Idempotency-Replayed';

 @Controller('v1/portal')
 @UseGuards(PortalCitizenGuard)
@@ -52,6 +65,7 @@ export class PortalInboxController {
   constructor(
     private readonly inbox: PortalInboxService,
     private readonly identity: PortalIdentityService,
+    private readonly idempotency: PortalIdempotencyService,
     private readonly database: Database,
     private readonly requestContext: RequestContext,
   ) {}
@@ -83,17 +97,41 @@ export class PortalInboxController {
   @Post('push-subscriptions')
   @Resource('portal:push-subscription')
   @Action('create')
+  @NoIdempotent()
   @Audit({
     action: 'PORTAL_PUSH_SUBSCRIPTION_CREATE',
     entity: 'portal.push_subscription',
   })
-  subscribePush(
+  async subscribePush(
     @Req() request: CitizenRequest,
     @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
   ): Promise<PushSubscriptionResponse> {
-    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
-      this.inbox.subscribePush(tx, subject, body),
+    const outcome = await this.withSubject(
+      portalIdentityOf(request),
+      async (tx, subject) => {
+        const begun = await this.idempotency.begin(tx, {
+          scope: subject.subjectId,
+          header: headers['idempotency-key'],
+          route: PUSH_SUBSCRIPTION_ROUTE_KEY,
+          body,
+        });
+        if (begun.replay) {
+          return {
+            body: begun.replay.body as PushSubscriptionResponse,
+            replayed: true,
+            status: begun.replay.status,
+          };
+        }
+        const subscription = await this.inbox.subscribePush(tx, subject, body);
+        await begun.record(201, subscription);
+        return { body: subscription, replayed: false, status: 201 };
+      },
     );
+    res.status(outcome.status);
+    if (outcome.replayed) res.setHeader(REPLAYED_HEADER, 'true');
+    return outcome.body;
   }

   /** Transação única de tenant por rota (§0) com o sujeito garantido. */
diff --git a/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts b/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts
index 59b0ee47..0b1c2410 100644
--- a/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts
+++ b/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts
@@ -36,6 +36,15 @@ import {
   type PortalInboxEventContext,
 } from './events.js';

+export const PORTAL_SNE_PORT = Symbol('PORTAL_SNE_PORT');
+
+export interface PortalSnePort {
+  enrollCitizen(input: {
+    cpf: string;
+    channel?: string;
+  }): Promise<{ enrolled: boolean }>;
+}
+
 // ---------------------------------------------------------------------------
 // vocabulário (§2.4, CTG-0001 §6.3)
 // ---------------------------------------------------------------------------
@@ -216,6 +225,7 @@ export class PortalSneEnrollmentService {

   constructor(
     private readonly identity: PortalIdentityService,
+    @Optional() @Inject(PORTAL_SNE_PORT) private readonly sne?: PortalSnePort,
     @Optional() clock?: PortalClock,
     @Optional() private readonly requestContext?: RequestContext,
     @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
@@ -261,7 +271,44 @@ export class PortalSneEnrollmentService {
         context: { missing: ['email', 'phone'] },
       });
     }
-    // 4. estado
+    // 4. integração nacional antes de qualquer escrita local (§4).
+    if (this.sne) {
+      try {
+        const national = await this.sne.enrollCitizen({
+          cpf: identity.cpf,
+          channel: input.channel,
+        });
+        if (!national.enrolled) {
+          throw new PortalError('PORTAL.SNE_UPSTREAM_UNAVAILABLE', {
+            status: 503,
+            context: { retryAfter: null },
+          });
+        }
+      } catch (error) {
+        if (error instanceof PortalError) throw error;
+        const category =
+          typeof error === 'object' && error !== null && 'category' in error
+            ? (error as { category?: unknown }).category
+            : undefined;
+        if (category === 'VALIDATION') {
+          throw new PortalError('PORTAL.VALIDATION_FAILED', {
+            status: 400,
+            context: { fields: [] },
+          });
+        }
+        if (category === 'BUSINESS') {
+          throw new PortalError('PORTAL.SNE_ALREADY_ENROLLED', {
+            status: 409,
+            context: {},
+          });
+        }
+        throw new PortalError('PORTAL.SNE_UPSTREAM_UNAVAILABLE', {
+          status: 503,
+          context: { retryAfter: null },
+        });
+      }
+    }
+    // 5. estado
     const existing = (
       await tx.query<EnrollmentRow>(ENROLLMENT_FOR_UPDATE_SQL, [
         subject.subjectId,
@@ -273,7 +320,7 @@ export class PortalSneEnrollmentService {
         context: {},
       });
     }
-    // 5. upsert
+    // 6. upsert
     const now = this.clock.now();
     const channel = input.channel ?? null;
     const effectsAck = JSON.stringify(
@@ -308,7 +355,7 @@ export class PortalSneEnrollmentService {
       }
       enrollmentId = inserted.id;
     }
-    // 6. evento
+    // 7. evento
     await this.outbox.append(
       tx as never,
       portalInboxEvents.sneAdesaoSolicitada(
diff --git a/backend/domains/portal/projections/src/handwritten/documents.controller.ts b/backend/domains/portal/projections/src/handwritten/documents.controller.ts
index 54091ac9..644df4ef 100644
--- a/backend/domains/portal/projections/src/handwritten/documents.controller.ts
+++ b/backend/domains/portal/projections/src/handwritten/documents.controller.ts
@@ -18,6 +18,7 @@ import {
   Req,
   UseGuards,
 } from '@nestjs/common';
+import { createHash } from 'node:crypto';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
 import {
@@ -57,8 +58,12 @@ export const DOCUMENT_ROUTES = {
 } as const;

 export interface CnhResponse {
-  /** Registro bruto do adapter (`CitizenLicense.license`; mapeamento OD-P35). */
-  license: unknown;
+  license: {
+    status: 'valida' | 'vencida' | 'suspensa' | 'cassada' | null;
+    validUntil: string | null;
+    categories: string[];
+    restrictions: string[];
+  };
   qrVerification: null;
   documentBytes: null;
   /** RN-PORTAL-117: consulta informativa, não documento. */
@@ -67,7 +72,7 @@ export interface CnhResponse {
 }

 export interface VehiclesResponse {
-  items: unknown[];
+  items: Array<{ vehicleId: string; plate: string; model: string | null }>;
   cachedAt: string;
 }

@@ -85,6 +90,18 @@ const CATALOG_NOTE_SQL = `select alternative_channel_note
     where service_key = $1
     limit 1`;

+/** A leitura CDT do próprio cidadão fundamenta o vínculo local do veículo. */
+const UPSERT_OWNED_VEHICLE_ENTITLEMENT_SQL = `insert into portal.entitlement
+      (subject_id, target_kind, target_id, relation, origin, valid_from)
+    values ($1, 'vehicle', $2::uuid, 'owner', 'renavam', current_date)
+    on conflict (tenant_id, subject_id, target_kind, target_id, relation)
+    do nothing`;
+
+const CACHED_VEHICLES_SQL = `select payload_json
+     from portal.national_read_cache
+    where subject_id = $1 and kind = 'vehicles' and target_id is null
+    limit 1`;
+
 const UUID_RE =
   /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@@ -109,6 +126,79 @@ function assertUuid(value: string, field: string): void {
   }
 }

+function text(value: unknown): string | null {
+  return typeof value === 'string' && value.trim() ? value.trim() : null;
+}
+
+function validDate(value: unknown): string | null {
+  const candidate = text(value);
+  if (
+    !candidate ||
+    !/^\d{4}-\d{2}-\d{2}T/u.test(candidate) ||
+    Number.isNaN(Date.parse(candidate))
+  ) {
+    return null;
+  }
+  return candidate.slice(0, 10);
+}
+
+function vehicleId(chassis: string): string {
+  const bytes = createHash('sha1')
+    .update('detran.portal.vehicle', 'utf8')
+    .update(chassis, 'utf8')
+    .digest()
+    .subarray(0, 16);
+  bytes[6] = (bytes[6] & 0x0f) | 0x50;
+  bytes[8] = (bytes[8] & 0x3f) | 0x80;
+  const hex = bytes.toString('hex');
+  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
+}
+
+function normalizeLicense(payload: unknown): CnhResponse['license'] {
+  const license = asObject(asObject(payload).license);
+  const status = asObject(license).situacaoCnh;
+  const categories =
+    text(asObject(license).categoriaAtual)
+      ?.toUpperCase()
+      .split('')
+      .filter(
+        (letter, index, all) =>
+          /[A-Z]/u.test(letter) && all.indexOf(letter) === index,
+      ) ?? [];
+  const restriction = text(asObject(license).quadroObservacoesCnh);
+  return {
+    status:
+      status === 'A'
+        ? 'valida'
+        : status === 'V'
+          ? 'vencida'
+          : status === 'S'
+            ? 'suspensa'
+            : status === 'C'
+              ? 'cassada'
+              : null,
+    validUntil: validDate(asObject(license).dataValidadeCnh),
+    categories,
+    restrictions: restriction ? [restriction] : [],
+  };
+}
+
+function normalizeVehicles(payload: unknown): VehiclesResponse['items'] {
+  return asArray(asObject(payload).items).flatMap((item) => {
+    const vehicle = asObject(item);
+    const chassis = text(vehicle.chassi);
+    const plate = text(vehicle.placa)?.toUpperCase();
+    if (!chassis || !plate) return [];
+    return [
+      {
+        vehicleId: vehicleId(chassis),
+        plate,
+        model: text(vehicle.descricaoMarcaModelo),
+      },
+    ];
+  });
+}
+
 @Controller('v1/portal')
 @UseGuards(PortalCitizenGuard)
 export class PortalDocumentsController {
@@ -145,7 +235,7 @@ export class PortalDocumentsController {
         this.ports.cdt.getCitizenLicense(identity.cpf),
       );
       return {
-        license: asObject(result.payload).license ?? null,
+        license: normalizeLicense(result.payload),
         qrVerification: null,
         documentBytes: null,
         category: 'C',
@@ -167,8 +257,17 @@ export class PortalDocumentsController {
       const result = await this.reads.read(tx, subject, 'vehicles', null, () =>
         this.ports.cdt.listCitizenVehicles(identity.cpf),
       );
+      const items = normalizeVehicles(result.payload);
+      await Promise.all(
+        items.map(({ vehicleId: id }) =>
+          tx.query(UPSERT_OWNED_VEHICLE_ENTITLEMENT_SQL, [
+            subject.subjectId,
+            id,
+          ]),
+        ),
+      );
       return {
-        items: asArray(asObject(result.payload).items),
+        items,
         cachedAt: result.cachedAt,
       };
     });
@@ -188,7 +287,22 @@ export class PortalDocumentsController {
     const identity = portalIdentityOf(request);
     assertUuid(id, 'id');
     return this.withSubject(identity, async (tx, subject) => {
-      await this.identity.assertEntitled(tx, subject.subjectId, 'vehicle', id);
+      const cachedVehicles = (
+        await tx.query<{ payload_json: unknown }>(CACHED_VEHICLES_SQL, [
+          subject.subjectId,
+        ])
+      ).rows[0];
+      const ownsVehicleFromNationalRead = normalizeVehicles(
+        cachedVehicles?.payload_json,
+      ).some((vehicle) => vehicle.vehicleId === id);
+      if (!ownsVehicleFromNationalRead) {
+        await this.identity.assertEntitled(
+          tx,
+          subject.subjectId,
+          'vehicle',
+          id,
+        );
+      }
       // M17/OD-P21: nenhuma operação de ports.ts devolve débitos/restrições do
       // RENAVAM — a fonte é "indisponível"; com cache (linha inserida por
       // teste/OD) responde 200 com cachedAt antigo, sem cache 503.
diff --git a/senatran-mock/database/seed/20-read.sql b/senatran-mock/database/seed/20-read.sql
index 2c27baaa..d5c3af9b 100644
--- a/senatran-mock/database/seed/20-read.sql
+++ b/senatran-mock/database/seed/20-read.sql
@@ -1129,3 +1129,26 @@ insert into senatran.alteracao_permitida (payload) values
   ('{"mapeamentoAutomatico":false,"codigoTipoAlteracao":"CARROCERIA","codigoAlteracao":"CARROCERIA","descricaoAlteracao":"Alteração de carroceria","codigoSistema":4}'::jsonb),
   ('{"mapeamentoAutomatico":false,"codigoTipoAlteracao":"CATEGORIA","codigoAlteracao":"CATEGORIA","descricaoAlteracao":"Mudança de categoria","codigoSistema":5}'::jsonb);

+-- CTG-0004 §2 [DIVERGE-1]/A17: fixtures nacionais canônicas das personas
+-- Prata e Ouro. A rota CDT lê exclusivamente o payload destas entidades.
+insert into senatran.veiculo (
+  chassi, placa, codigo_renavam, id_proprietario, tipo_proprietario, payload
+) values (
+  '9BWZZZ377VT002222', 'PRT2A22', '22222222222', '22222222222', '1',
+  '{"chassi":"9BWZZZ377VT002222","placa":"PRT2A22","codigoRenavam":"22222222222","descricaoMarcaModelo":"FIAT/ARGO 1.0","situacao":"A"}'::jsonb
+);
+
+insert into senatran.condutor (
+  cpf, numero_registro, numero_formulario_renach, nome, data_nascimento,
+  nome_mae, payload
+) values
+  (
+    '22222222222', '22222222222', 'RN-PRATA-0001', 'PESSOA PRATA',
+    '1990-01-01', 'MAE PRATA',
+    '{"cpf":"22222222222","situacaoCnh":"A","dataValidadeCnh":"2030-12-31T00:00:00.000Z","categoriaAtual":"AD","quadroObservacoesCnh":""}'::jsonb
+  ),
+  (
+    '33333333333', '33333333333', 'RN-OURO-0001', 'PESSOA OURO',
+    '1990-01-01', 'MAE OURO',
+    '{"cpf":"33333333333","situacaoCnh":"B","dataValidadeCnh":"2030-12-31T00:00:00.000Z","categoriaAtual":"B","quadroObservacoesCnh":""}'::jsonb
+  );
diff --git a/senatran-mock/database/seed/80-sne.sql b/senatran-mock/database/seed/80-sne.sql
index 8487e5eb..8291b8c8 100644
--- a/senatran-mock/database/seed/80-sne.sql
+++ b/senatran-mock/database/seed/80-sne.sql
@@ -7,6 +7,9 @@ insert into sne.adesao (tipo, chave, aderido, canal, payload) values
   ('ORGAO', '204020', true, 'APP_CDT', '{"tipo":"ORGAO","chave":"204020","aderido":true,"canal":"APP_CDT"}'::jsonb),
   ('ORGAO', '999998', false, null, '{"tipo":"ORGAO","chave":"999998","aderido":false,"canal":null}'::jsonb);

+insert into sne.adesao (tipo, chave, aderido, canal, payload) values
+  ('CIDADAO', '22222222222', true, 'APP_CDT', '{"tipo":"CIDADAO","chave":"22222222222","aderido":true,"canal":"APP_CDT"}'::jsonb);
+
 insert into sne.notificacao (protocolo, numero_ait, id_processo, tipo_notificacao, codigo_orgao_autuador, placa, cpf_destinatario, situacao, canal, payload) values
   ('SNE-SEED-AUT-0001', 'A0001001', null, 'AUTUACAO', '204020', 'ABC1D23', '52998224725', 'ACEITA', 'APP_CDT', '{"protocolo":"SNE-SEED-AUT-0001","numeroAit":"A0001001","idProcesso":null,"tipoNotificacao":"AUTUACAO","codigoOrgaoAutuador":"204020","placa":"ABC1D23","cpfDestinatario":"52998224725","situacao":"ACEITA","canal":"APP_CDT","dataNotificacao":"2024-05-01T10:00:00.000Z","dataDisponibilizacao":"2024-05-01T10:00:00.000Z","dataCiencia":null,"prazoLegal":"2024-05-31T10:00:00.000Z","mensagem":null}'::jsonb),
   ('SNE-SEED-PEN-0001', 'A0001001', null, 'PENALIDADE', '204020', 'ABC1D23', '52998224725', 'ACEITA', 'APP_CDT', '{"protocolo":"SNE-SEED-PEN-0001","numeroAit":"A0001001","idProcesso":null,"tipoNotificacao":"PENALIDADE","codigoOrgaoAutuador":"204020","placa":"ABC1D23","cpfDestinatario":"52998224725","situacao":"ACEITA","canal":"APP_CDT","dataNotificacao":"2024-05-01T10:00:00.000Z","dataDisponibilizacao":"2024-05-01T10:00:00.000Z","dataCiencia":null,"prazoLegal":"2024-05-31T10:00:00.000Z","mensagem":null}'::jsonb),
@@ -14,3 +17,5 @@ insert into sne.notificacao (protocolo, numero_ait, id_processo, tipo_notificaca
   ('SNE-SEED-REJ-0001', 'A0001003', null, 'AUTUACAO', '204020', 'ABC1D23', '52998224725', 'REJEITADA', 'EMAIL', '{"protocolo":"SNE-SEED-REJ-0001","numeroAit":"A0001003","idProcesso":null,"tipoNotificacao":"AUTUACAO","codigoOrgaoAutuador":"204020","placa":"ABC1D23","cpfDestinatario":"52998224725","situacao":"REJEITADA","canal":"EMAIL","dataNotificacao":"2024-05-01T10:00:00.000Z","dataDisponibilizacao":null,"dataCiencia":null,"prazoLegal":"2024-05-31T10:00:00.000Z","mensagem":null}'::jsonb),
   ('SNE-SEED-EXP-0001', 'A0001004', null, 'AUTUACAO', '204020', 'ABC1D23', '52998224725', 'EXPIRADA', 'APP_CDT', '{"protocolo":"SNE-SEED-EXP-0001","numeroAit":"A0001004","idProcesso":null,"tipoNotificacao":"AUTUACAO","codigoOrgaoAutuador":"204020","placa":"ABC1D23","cpfDestinatario":"52998224725","situacao":"EXPIRADA","canal":"APP_CDT","dataNotificacao":"2024-05-01T10:00:00.000Z","dataDisponibilizacao":null,"dataCiencia":null,"prazoLegal":"2024-05-31T10:00:00.000Z","mensagem":null}'::jsonb);

+insert into sne.notificacao (protocolo, numero_ait, id_processo, tipo_notificacao, codigo_orgao_autuador, placa, cpf_destinatario, situacao, canal, payload) values
+  ('SNE-PRATA-A0022222', 'A0022222', null, 'AUTUACAO', '204020', 'PRT2A22', '22222222222', 'ACEITA', 'APP_CDT', '{"protocolo":"SNE-PRATA-A0022222","numeroAit":"A0022222","idProcesso":null,"tipoNotificacao":"AUTUACAO","codigoOrgaoAutuador":"204020","placa":"PRT2A22","cpfDestinatario":"22222222222","situacao":"ACEITA","canal":"APP_CDT"}'::jsonb);
diff --git a/senatran-mock/database/seed/85-cdt.sql b/senatran-mock/database/seed/85-cdt.sql
index a7352de3..11b222c8 100644
--- a/senatran-mock/database/seed/85-cdt.sql
+++ b/senatran-mock/database/seed/85-cdt.sql
@@ -6,3 +6,7 @@ insert into cdt.infracao (numero_ait, cpf, situacao, valor_original, percentual_
   ('A0001004', '52998224725', 'INDISPONIVEL', 293.47, 40, 176.08, false, null, '2024-06-30', 'RENAINF', 'SNE-SEED-AUT-0001', 'RENAINF-SEED-0001', false, '{"numeroAit":"A0001004","cpf":"52998224725","situacao":"INDISPONIVEL","valorOriginal":293.47,"percentualDesconto":40,"valorComDesconto":176.08,"boletoDisponivel":false,"linhaDigitavel":null,"dataVencimento":"2024-06-30","origem":"RENAINF","protocoloSne":"SNE-SEED-AUT-0001","protocoloRenainf":"RENAINF-SEED-0001"}'::jsonb),
   ('A0001005', '52998224725', 'PAGA', 293.47, 40, 176.08, true, '34191.79001 01043.510047 91020.150008 9 84410000029347', '2024-06-30', 'RENAINF', 'SNE-SEED-AUT-0001', 'RENAINF-SEED-0001', false, '{"numeroAit":"A0001005","cpf":"52998224725","situacao":"PAGA","valorOriginal":293.47,"percentualDesconto":40,"valorComDesconto":176.08,"boletoDisponivel":true,"linhaDigitavel":"34191.79001 01043.510047 91020.150008 9 84410000029347","dataVencimento":"2024-06-30","origem":"RENAINF","protocoloSne":"SNE-SEED-AUT-0001","protocoloRenainf":"RENAINF-SEED-0001"}'::jsonb);

+-- CTG-0004 §2: AIT de quitação da pessoa Prata. As leituras CNH/veículo
+-- pertencem à seed 20-read.sql, que é a fonte canônica dessas projeções.
+insert into cdt.infracao (numero_ait, cpf, situacao, valor_original, percentual_desconto, valor_com_desconto, boleto_disponivel, linha_digitavel, data_vencimento, origem, protocolo_sne, protocolo_renainf, reconhecida, payload) values
+  ('A0022222', '22222222222', 'DISPONIVEL', 222.22, 0, null, true, null, '2030-12-31', 'RENAINF', null, null, false, '{"numeroAit":"A0022222","cpf":"22222222222","situacao":"DISPONIVEL","valorOriginal":222.22,"percentualDesconto":0,"valorComDesconto":null,"boletoDisponivel":true,"dataVencimento":"2030-12-31"}'::jsonb);
diff --git a/tools/orchestra/worker.sh b/tools/orchestra/worker.sh
index 2c1ddc2d..f5717fb5 100755
--- a/tools/orchestra/worker.sh
+++ b/tools/orchestra/worker.sh
@@ -6,7 +6,8 @@
 # maestro confere `git status`), e o relatório final vai para <relatorio.md>; o transcript fica ao lado.
 #
 # Uso: tools/orchestra/worker.sh <modelo> <esforco> <prompt.md> <relatorio.md> [<worktree>]
-#   codex exec -m <modelo> -c model_reasoning_effort=<esforco> -C <worktree> -s workspace-write \
+#   codex exec -m <modelo> -c model_reasoning_effort=<esforco> -c sandbox_workspace_write.network_access=true \
+#              -C <worktree> -s workspace-write \
 #              --skip-git-repo-check --json -o <relatorio> - < prompt  > <relatorio>.jsonl
 set -euo pipefail

@@ -21,7 +22,7 @@ mkdir -p "$(dirname "$out")"

 started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
 head_before="$(git -C "$cwd" rev-parse HEAD)"
-codex exec -m "$model" -c "model_reasoning_effort=\"$effort\"" -C "$cwd" -s workspace-write \
+codex exec -m "$model" -c "model_reasoning_effort=\"$effort\"" -c "sandbox_workspace_write.network_access=true" -C "$cwd" -s workspace-write \
   --skip-git-repo-check --json -o "$out" - < "$prompt" > "${out%.md}.jsonl"
 ended="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
 head_after="$(git -C "$cwd" rev-parse HEAD)"
```
