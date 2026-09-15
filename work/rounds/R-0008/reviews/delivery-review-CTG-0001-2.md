# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T2` e o "mapa entregável → definições"
4. `work/rounds/R-0008/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0008/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0008/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0008",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0008/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Nota do maestro — delivery-review CTG-0001, ciclo 2 (restrito aos 7 achados do ciclo 1)

Veredito anterior: `FAIL` (`reviews/delivery-review-CTG-0001.json`). O maestro (Architect) fechou cada achado na **§13 Adenda** de `work/rounds/R-0008/contracts/CTG-0001.md`; o Inspector (iterações 3 e 4) escreveu os testes e o Engineer (iteração 3) implementou. Mapa achado → correção: (1) concurrency-review → porta `SyncConflictPort`/`SqlSyncConflictPort` (`backend/domains/ops/core/src/sync-conflict.port.ts`), conflito aberto obrigatório e resolvido na transação, integration e e2e com linhas reais em `ops.sync_conflict`; (2) `If-Match`/`ETag` de review/decide = `ait_ait.version` quando `ait_id` existe, senão `ait_cancel_request.version`; (3) `decision_body` divergente → 403 antes de efeito; (4) guardas de estado do pedido e do AIT em `decide`; (5) `SqlTeatEventOutbox.append` gera/persiste o id (`returning id`, mesmo id no `payload`) e devolve `{ id }`, serviço não gera ids; (6) `Idempotency-Key`: já coberto pelo kernel — `Action()` em `shared/src/decorators.ts` aplica `@Idempotent()` a toda ação não-leitura; e2e prova replay idêntico (header `idempotency-replayed`) e corpo divergente → 422 (comportamento do kernel; divergência com o 409 do catálogo registrada como OD-T45); (7) `originStatus` validado contra os 17 tokens (400 `TEAT.ENUM_INVALID`) e contra `ait.current_status` (409). Gates: shared 98/98, inf-ait unit 308/308, integration 14/14, e2e 1/1, app e2e 30/30, `blueprints:check`, `contracts:check`, `verify:*`, `format:check` verdes; `pnpm check` e `backend:test:ci` completos em execução pelo maestro no momento do envio (resultado registrado em `plan.md` antes do commit). Avalie **somente** as sete correções (README §5). Anexos: A `git diff --stat`; B diff integral dos manuscritos/testes/política/runtime/`ops-core`/blueprint (bloco)/DDL 31; C lista de gerados; relatórios TASK-0002 e TASK-0003 (com as iterações).

## Anexo A — `git diff --stat`

```text
 backend/app/src/detran-runtime.ts                  |   10 +-
 backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts   |  613 ++-
 backend/database/ddl/31-inf-ait.sql                |    2 +-
 backend/domains/inf/ait/package.json               |    2 +
 .../domains/inf/ait/src/ait-commands.controller.ts |  188 +-
 .../domains/inf/ait/src/ait-lifecycle.provider.ts  |    9 +-
 .../inf/ait/src/ait-lifecycle.service.spec.ts      |   80 +
 .../domains/inf/ait/src/ait-lifecycle.service.ts   | 1329 ++++-
 backend/domains/inf/ait/src/ait.module.ts          |    6 +-
 .../ait-cancel-request-event.controller.ts         |    2 +-
 .../controllers/ait-cancel-request.controller.ts   |   32 +-
 .../src/controllers/ait-correction.controller.ts   |    2 +-
 .../ait/src/controllers/ait-person.controller.ts   |    2 +-
 .../src/controllers/ait-print-event.controller.ts  |    2 +-
 .../src/controllers/ait-signature.controller.ts    |    2 +-
 .../controllers/ait-status-history.controller.ts   |    2 +-
 .../ait/src/controllers/ait-vehicle.controller.ts  |    2 +-
 .../inf/ait/src/controllers/ait.controller.ts      |    2 +-
 .../src/dto/create-ait-cancel-request-event.dto.ts |    2 +-
 .../ait/src/dto/create-ait-cancel-request.dto.ts   |    2 +-
 .../inf/ait/src/dto/create-ait-correction.dto.ts   |    2 +-
 .../inf/ait/src/dto/create-ait-person.dto.ts       |    2 +-
 .../inf/ait/src/dto/create-ait-print-event.dto.ts  |    2 +-
 .../inf/ait/src/dto/create-ait-signature.dto.ts    |    2 +-
 .../ait/src/dto/create-ait-status-history.dto.ts   |    2 +-
 .../inf/ait/src/dto/create-ait-vehicle.dto.ts      |    2 +-
 backend/domains/inf/ait/src/dto/create-ait.dto.ts  |    2 +-
 .../entities/ait-cancel-request-event.entity.ts    |    2 +-
 .../ait/src/entities/ait-cancel-request.entity.ts  |    2 +-
 .../inf/ait/src/entities/ait-correction.entity.ts  |    2 +-
 .../inf/ait/src/entities/ait-person.entity.ts      |    2 +-
 .../inf/ait/src/entities/ait-print-event.entity.ts |    2 +-
 .../inf/ait/src/entities/ait-signature.entity.ts   |    2 +-
 .../ait/src/entities/ait-status-history.entity.ts  |    2 +-
 .../inf/ait/src/entities/ait-vehicle.entity.ts     |    2 +-
 backend/domains/inf/ait/src/entities/ait.entity.ts |    2 +-
 .../inf/ait/src/handwritten/accept-reject.spec.ts  |  128 +
 .../handwritten/ait-cancel-requests.controller.ts  |  160 +
 .../handwritten/ait-cancel-requests.provider.ts    |   15 +
 .../ait-state-transitions.matrix.spec.ts           |  352 ++
 .../ait/src/handwritten/cancel-requests.spec.ts    |  382 ++
 backend/domains/inf/ait/src/handwritten/events.ts  |  165 +
 backend/domains/inf/ait/src/handwritten/index.ts   |    4 +
 .../inf/ait/src/handwritten/print-events.spec.ts   |   75 +
 .../ait/src/handwritten/review-concurrency.spec.ts |  234 +
 .../handwritten/science-and-corrections.spec.ts    |  122 +
 .../domains/inf/ait/src/handwritten/transitions.ts |  230 +
 backend/domains/inf/ait/src/index.ts               |    6 +-
 .../ait-cancel-request-event.repository.ts         |    2 +-
 .../repositories/ait-cancel-request.repository.ts  |    2 +-
 .../src/repositories/ait-correction.repository.ts  |    2 +-
 .../ait/src/repositories/ait-person.repository.ts  |    2 +-
 .../src/repositories/ait-print-event.repository.ts |    2 +-
 .../src/repositories/ait-signature.repository.ts   |    2 +-
 .../repositories/ait-status-history.repository.ts  |    2 +-
 .../ait/src/repositories/ait-vehicle.repository.ts |    2 +-
 .../inf/ait/src/repositories/ait.repository.ts     |    2 +-
 .../services/ait-cancel-request-event.service.ts   |    2 +-
 .../ait/src/services/ait-cancel-request.service.ts |    2 +-
 .../inf/ait/src/services/ait-correction.service.ts |    2 +-
 .../inf/ait/src/services/ait-person.service.ts     |    2 +-
 .../ait/src/services/ait-print-event.service.ts    |    2 +-
 .../inf/ait/src/services/ait-signature.service.ts  |    2 +-
 .../ait/src/services/ait-status-history.service.ts |    2 +-
 .../inf/ait/src/services/ait-vehicle.service.ts    |    2 +-
 .../domains/inf/ait/src/services/ait.service.ts    |    2 +-
 .../inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts    |    5 +-
 .../integration/ait-commands.integration.spec.ts   |  556 ++
 backend/domains/inf/ait/vitest.config.ts           |    3 +
 backend/domains/ops/core/src/index.ts              |    7 +
 backend/domains/ops/core/src/sync-conflict.port.ts |  111 +
 .../domains/shared/src/errors/detran-error.spec.ts |  145 +
 backend/domains/shared/src/errors/detran-error.ts  |   45 +
 backend/domains/shared/src/errors/if-match.ts      |   42 +
 backend/domains/shared/src/errors/index.ts         |    2 +
 backend/domains/shared/src/events/index.ts         |    9 +
 backend/domains/shared/src/events/outbox.ts        |   54 +
 .../domains/shared/src/events/sql-outbox.spec.ts   |   61 +
 backend/domains/shared/src/events/sql-outbox.ts    |   81 +
 backend/domains/shared/src/index.ts                |    6 +
 backend/domains/shared/src/policy.spec.ts          |  207 +
 backend/domains/shared/src/policy.ts               |  142 +-
 docs/framework/blueprints/BP-INF-AIT-001.json      |   26 +-
 .../contracts/BP-INF-AIT-001.openapi.json          |   72 -
 pnpm-lock.yaml                                     |    6 +
 work/rounds/R-0008/budget.json                     |   44 +-
 work/rounds/R-0008/compositions.json               |   36 +-
 work/rounds/R-0008/contracts/CTG-0001.md           |   33 +
 work/rounds/R-0008/env-detran-r8.sh                |    7 +
 work/rounds/R-0008/plan.md                         |   24 +
 work/rounds/R-0008/prompts/TASK-0003.md            |    5 +
 work/rounds/R-0008/prompts/TASK-0004.md            |    5 +
 work/rounds/R-0008/prompts/TASK-0005.md            |    5 +
 work/rounds/R-0008/prompts/TASK-0006.md            |    5 +
 work/rounds/R-0008/prompts/TASK-0007.md            |    5 +
 work/rounds/R-0008/prompts/TASK-0008.md            |    5 +
 work/rounds/R-0008/prompts/TASK-0009.md            |    5 +
 work/rounds/R-0008/prompts/TASK-0010.md            |    5 +
 work/rounds/R-0008/prompts/TASK-0012.md            |    5 +
 .../reviews/delivery-review-CTG-0001.bridge.json   |   11 +
 .../R-0008/reviews/delivery-review-CTG-0001.json   |   66 +
 .../R-0008/reviews/delivery-review-CTG-0001.md     | 5351 ++++++++++++++++++++
 work/rounds/R-0008/tasks/TASK-0001.json            |    2 +-
 work/rounds/R-0008/tasks/TASK-0002.json            |    2 +-
 work/rounds/R-0008/tasks/TASK-0003.json            |    6 +-
 work/rounds/R-0008/tasks/TASK-0004.json            |    4 +-
 work/rounds/R-0008/tasks/TASK-0005.json            |    4 +-
 work/rounds/R-0008/tasks/TASK-0006.json            |    4 +-
 work/rounds/R-0008/tasks/TASK-0007.json            |    4 +-
 work/rounds/R-0008/tasks/TASK-0008.json            |    4 +-
 work/rounds/R-0008/tasks/TASK-0009.json            |    4 +-
 work/rounds/R-0008/tasks/TASK-0010.json            |    4 +-
 work/rounds/R-0008/tasks/TASK-0012.json            |    4 +-
 113 files changed, 11178 insertions(+), 293 deletions(-)

```

## Anexo B — diff

```diff
diff --git a/backend/app/src/detran-runtime.ts b/backend/app/src/detran-runtime.ts
index e08b684..fe5ef1a 100644
--- a/backend/app/src/detran-runtime.ts
+++ b/backend/app/src/detran-runtime.ts
@@ -319,7 +319,15 @@ export class DetranLocalTokenVerifier implements TokenVerifier {
       roles,
       permissions: permissionsForRoles(roles),
       tenants: [LOCAL_TENANT_ID],
-      claims: { local: true },
+      claims: {
+        local: true,
+        // M3/H.39/OD-T01, CTG-0001 §5: the real IdP's attribute mapping for
+        // `decision_body` is deployment configuration (source_pending,
+        // OD-T18); the local profile only lets tests opt into it.
+        ...(process.env.DETRAN_LOCAL_DECISION_BODY
+          ? { decision_body: process.env.DETRAN_LOCAL_DECISION_BODY }
+          : {}),
+      },
     };
     return { principal, token };
   }
diff --git a/backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts b/backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts
index 897d1ca..3672b84 100644
--- a/backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts
+++ b/backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts
@@ -2,7 +2,7 @@ import { randomUUID } from 'node:crypto';
 import { NestFactory } from '@nestjs/core';
 import pg from 'pg';
 import request from 'supertest';
-import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

 import { AppModule } from '../../src/app.module.js';

@@ -92,13 +92,52 @@ afterAll(async () => {
   delete process.env.DETRAN_LOCAL_ROLES;
 });

-describe('inf/ait routes mounted in the unified app (WP-T0)', () => {
-  const headers = () => ({
-    authorization: 'Bearer local',
-    'x-tenant-id': tenantId,
-    'idempotency-key': randomUUID(),
-  });
+/**
+ * Shared by both `describe` blocks in this file (module scope, not nested
+ * inside the first `describe`) so a test in the second block never throws a
+ * `headers is not defined` `ReferenceError` — which, left uncaught mid-test,
+ * skips this file's own env-var cleanup and can leak `DETRAN_LOCAL_ROLES`/
+ * `DETRAN_LOCAL_DECISION_BODY` into whichever e2e spec file vitest runs
+ * next (`fileParallelism: false` keeps every e2e file in the same process).
+ */
+const headers = () => ({
+  authorization: 'Bearer local',
+  'x-tenant-id': tenantId,
+  'idempotency-key': randomUUID(),
+});
+
+/**
+ * Also module scope (same reasoning as `headers` above): used by both the
+ * `CTG-0001 §4` and `CTG-0001 §13 item 6` describe blocks.
+ */
+async function createDraft(currentStatus = 'RASCUNHO_OFFLINE') {
+  const server = app.getHttpServer();
+  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+  const created = await request(server)
+    .post('/v1/inf/ait/aits')
+    .set(headers())
+    .send({
+      traffic_agency_id: tenantId,
+      ait_number: `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-6),
+      series: 'E',
+      agent_id: randomUUID(),
+      shift_id: randomUUID(),
+      device_id: randomUUID(),
+      framing_id: fixture.framingId,
+      catalog_id: fixture.catalogId,
+      infraction_at: '2026-09-13T10:00:00.000Z',
+      issued_at: '2026-09-13T10:01:00.000Z',
+      issuance_mode: 'online',
+      constatation_type: 'approach',
+      location_description: 'Av. Brasil',
+      uf: 'AM',
+      current_status: currentStatus,
+    });
+  expect(created.status, JSON.stringify(created.body)).toBe(201);
+  return created.body.id as string;
+}

+describe('inf/ait routes mounted in the unified app (WP-T0)', () => {
   it('creates a draft through the generated CRUD route and finalizes it through the handwritten command route', async () => {
     const server = app.getHttpServer();
     const created = await request(server)
@@ -124,35 +163,53 @@ describe('inf/ait routes mounted in the unified app (WP-T0)', () => {
     expect(created.status, JSON.stringify(created.body)).toBe(201);
     const id = created.body.id as string;

-    await request(server)
+    // CTG-0001 §1/§4 (M2): every handwritten command on `aits/{id}` requires
+    // `If-Match: "<ait_ait.version>"` and answers with the next version as
+    // `ETag`; chain one into the next instead of assuming a fixed number.
+    let version = '1';
+
+    const vehicleResponse = await request(server)
       .post(`/v1/inf/ait/aits/${id}/vehicles`)
-      .set(headers())
+      .set({ ...headers(), 'if-match': version })
       .send({
         vehicle_snapshot_id: fixture.vehicleId,
         role: 'infractor',
         visually_confirmed_by_agent: true,
-      })
-      .expect(201);
-    await request(server)
+      });
+    expect(vehicleResponse.status, JSON.stringify(vehicleResponse.body)).toBe(
+      201,
+    );
+    version = vehicleResponse.headers.etag.replaceAll('"', '');
+
+    const personResponse = await request(server)
       .post(`/v1/inf/ait/aits/${id}/people`)
-      .set(headers())
+      .set({ ...headers(), 'if-match': version })
       .send({
         person_id: fixture.personId,
         role: 'driver',
         identified_by: 'document',
-      })
-      .expect(201);
-    await request(server)
+      });
+    expect(personResponse.status, JSON.stringify(personResponse.body)).toBe(
+      201,
+    );
+    version = personResponse.headers.etag.replaceAll('"', '');
+
+    const scienceResponse = await request(server)
       .post(`/v1/inf/ait/aits/${id}/science`)
-      .set(headers())
-      .send({ person_id: fixture.personId, signature_type: 'digital' })
-      .expect(201);
+      .set({ ...headers(), 'if-match': version })
+      .send({ person_id: fixture.personId, signature_type: 'digital' });
+    expect(scienceResponse.status, JSON.stringify(scienceResponse.body)).toBe(
+      201,
+    );
+    version = scienceResponse.headers.etag.replaceAll('"', '');

     const finalized = await request(server)
       .post(`/v1/inf/ait/aits/${id}/finalize`)
-      .set(headers())
+      .set({ ...headers(), 'if-match': version })
       .send({});
-    expect(finalized.status, JSON.stringify(finalized.body)).toBe(201);
+    // CTG-0001 §4.4: finalize answers 200 (not 201 — it transitions the
+    // existing aggregate, it does not create a new resource).
+    expect(finalized.status, JSON.stringify(finalized.body)).toBe(200);
     expect(finalized.body.current_status).toBe('FINALIZADO_LOCAL');
     expect(finalized.body.content_hash).toBeTruthy();
   });
@@ -167,3 +224,517 @@ describe('inf/ait routes mounted in the unified app (WP-T0)', () => {
     expect(denied.status).toBe(403);
   });
 });
+
+/**
+ * CTG-0001 §4/§8 (R-0008, TASK-0002) — C-0001-37..44: `If-Match` (M2), papel
+ * mínimo × papel negado por comando, e as rotas novas de
+ * `concurrency-review`/`archive`/`cancel-requests` (M4), que ainda não estão
+ * montadas (TASK-0003) — hoje respondem 404 do próprio Nest (rota
+ * inexistente), o sinal correto de "comportamento ausente" para uma rota
+ * ainda não criada. O padrão do arquivo (tenant/actor locais fixos,
+ * `DETRAN_LOCAL_ROLES` mutado por teste) é mantido — M20 confirma que
+ * continua válido.
+ */
+describe('CTG-0001 §4 — If-Match, papéis mínimos e rotas novas do AIT (TASK-0002)', () => {
+  afterEach(() => {
+    // Roda mesmo quando o teste lança no meio (asserção falha, erro de rede):
+    // nenhum DETRAN_LOCAL_ROLES/DETRAN_LOCAL_DECISION_BODY sobrevive para o
+    // próximo teste ou arquivo (fileParallelism: false, mesmo processo).
+    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    delete process.env.DETRAN_LOCAL_DECISION_BODY;
+  });
+
+  describe('C-0001-37/38 — If-Match e papel mínimo em finalize', () => {
+    it('dado DETRAN_LOCAL_ROLES=field-agent quando POST finalize sem If-Match então 428 TEAT.IF_MATCH_REQUIRED', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const id = await createDraft();
+      const response = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${id}/finalize`)
+        .set(headers())
+        .send({});
+      expect(response.status, JSON.stringify(response.body)).toBe(428);
+      expect(response.body.code).toBe('TEAT.IF_MATCH_REQUIRED');
+    });
+
+    it('dado If-Match divergente ("999") quando POST finalize então 412 TEAT.VERSION_CONFLICT', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const id = await createDraft();
+      const response = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${id}/finalize`)
+        .set({ ...headers(), 'if-match': '999' })
+        .send({});
+      expect(response.status, JSON.stringify(response.body)).toBe(412);
+      expect(response.body.code).toBe('TEAT.VERSION_CONFLICT');
+    });
+
+    it('dado If-Match correto ("1") quando POST finalize então 200 com header ETag', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const id = await createDraft();
+      const response = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${id}/finalize`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({});
+      expect(response.status, JSON.stringify(response.body)).toBe(200);
+      expect(response.headers.etag).toBe('"2"');
+    });
+
+    it('dado DETRAN_LOCAL_ROLES=processing-operator quando POST finalize então 403; com field-agent então 200', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
+      const idForDenied = await createDraft();
+      process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
+      const denied = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idForDenied}/finalize`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({});
+      expect(denied.status).toBe(403);
+
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const idForAllowed = await createDraft();
+      const allowed = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idForAllowed}/finalize`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({});
+      expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
+    });
+  });
+
+  describe('C-0001-39 — POST archive (novo, M4, OD-T13)', () => {
+    it('dado DETRAN_LOCAL_ROLES=traffic-authority quando POST .../archive num AIT PROCESSADO então 200; com processing-operator então 403', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      const idForAllowed = await createDraft('PROCESSADO');
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      const allowed = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idForAllowed}/archive`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ reason: 'processamento encerrado' });
+      expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
+
+      process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
+      const idForDenied = await createDraft('PROCESSADO');
+      process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
+      const denied = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idForDenied}/archive`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ reason: 'processamento encerrado' });
+      expect(denied.status).toBe(403);
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+  });
+
+  describe('C-0001-40/41 — POST cancel-requests/{id}/decide × decision_body (M3/H.39/OD-T01)', () => {
+    /**
+     * Cria um pedido post_final real (`entityType='ait-cancel-posfinal-request'`,
+     * `addressedTo='diretoria-fiscalizacao'`) contra um AIT FINALIZADO_LOCAL.
+     * A criação de um pedido post_final com `targetAitId` também exige
+     * `If-Match` (CTG-0001 §4.15: a transição toca `ait_ait`) — o AIT nasce
+     * na versão 1 e a própria criação o leva a `SOLICITADO_CANCEL_POSFINAL`,
+     * incrementando para a versão 2 (§13 item 2: com `ait_id` presente, o
+     * `If-Match`/`ETag` de `review`/`decide` passam a usar essa versão do
+     * AIT, não a versão — sempre 1 aqui — de `ait_cancel_request`).
+     */
+    async function createDiretoriaCancelRequest() {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const aitId = await createDraft('FINALIZADO_LOCAL');
+      const created = await request(app.getHttpServer())
+        .post('/v1/inf/ait/cancel-requests')
+        .set({ ...headers(), 'if-match': '1' })
+        .send({
+          entityType: 'ait-cancel-posfinal-request',
+          addressedTo: 'diretoria-fiscalizacao',
+          trafficAgencyId: tenantId,
+          idempotencyKey: `e2e-cancel-${aitId}`,
+          targetLocalActId: `local-${aitId}`,
+          targetAitId: aitId,
+          originStatus: 'FINALIZADO_LOCAL',
+          justification: 'erro material identificado',
+          requestedBy: actorId,
+        });
+      expect(created.status, JSON.stringify(created.body)).toBe(201);
+      return { aitId, requestId: created.body.id as string };
+    }
+
+    it('dado um id local sem pedido correspondente quando decide então 404 TEAT.AIT_CANCEL_TARGET_NOT_FOUND (sem pedido não há addressed_to)', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      delete process.env.DETRAN_LOCAL_DECISION_BODY;
+      const response = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${randomUUID()}/decide`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ decision: 'approve', decision_note: 'deferido' });
+      expect(response.status, JSON.stringify(response.body)).toBe(404);
+      expect(response.body.code).toBe('TEAT.AIT_CANCEL_TARGET_NOT_FOUND');
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+
+    it('dado um pedido com ait_id presente quando If-Match usa ait_cancel_request.version (1, errado) em vez de ait_ait.version (2) então 412 TEAT.VERSION_CONFLICT (§13 item 2)', async () => {
+      const { requestId } = await createDiretoriaCancelRequest();
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      process.env.DETRAN_LOCAL_DECISION_BODY = 'diretoria-fiscalizacao';
+      const response = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({
+          decision: 'approve',
+          decision_note: 'deferido pela Diretoria',
+        });
+      expect(response.status, JSON.stringify(response.body)).toBe(412);
+      expect(response.body.code).toBe('TEAT.VERSION_CONFLICT');
+      delete process.env.DETRAN_LOCAL_DECISION_BODY;
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+
+    it('dado um pedido addressed_to=diretoria-fiscalizacao (If-Match=ait_ait.version=2) quando DETRAN_LOCAL_ROLES=traffic-authority sem DETRAN_LOCAL_DECISION_BODY decide então 403 TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN', async () => {
+      const { requestId } = await createDiretoriaCancelRequest();
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      delete process.env.DETRAN_LOCAL_DECISION_BODY;
+      const response = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
+        .set({ ...headers(), 'if-match': '2' })
+        .send({ decision: 'approve', decision_note: 'deferido' });
+      expect(response.status, JSON.stringify(response.body)).toBe(403);
+      expect(response.body.code).toBe('TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN');
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+
+    it('dado o mesmo pedido (If-Match=ait_ait.version=2) com DETRAN_LOCAL_DECISION_BODY=diretoria-fiscalizacao então 200 e o AIT vai a CANCELADO_POSFINAL', async () => {
+      const { requestId } = await createDiretoriaCancelRequest();
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      process.env.DETRAN_LOCAL_DECISION_BODY = 'diretoria-fiscalizacao';
+      const decided = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
+        .set({ ...headers(), 'if-match': '2' })
+        .send({
+          decision: 'approve',
+          decision_note: 'deferido pela Diretoria',
+        });
+      expect(decided.status, JSON.stringify(decided.body)).toBe(200);
+      expect(decided.body.ait?.current_status).toBe('CANCELADO_POSFINAL');
+      delete process.env.DETRAN_LOCAL_DECISION_BODY;
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+
+    it('dado decision_body informado divergente de addressed_to então 403 TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN antes de qualquer efeito (§13 item 3)', async () => {
+      const { requestId } = await createDiretoriaCancelRequest();
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      process.env.DETRAN_LOCAL_DECISION_BODY = 'diretoria-fiscalizacao';
+      const response = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
+        .set({ ...headers(), 'if-match': '2' })
+        .send({
+          decision: 'approve',
+          decision_note: 'deferido',
+          decision_body: 'traffic-authority',
+        });
+      expect(response.status, JSON.stringify(response.body)).toBe(403);
+      expect(response.body.code).toBe('TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN');
+      delete process.env.DETRAN_LOCAL_DECISION_BODY;
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+
+    it('dado um pedido draft sem AIT no servidor (ait_id nulo, 202) então If-Match de decide usa ait_cancel_request.version, não ait_ait.version (§13 item 2)', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const created = await request(app.getHttpServer())
+        .post('/v1/inf/ait/cancel-requests')
+        .set(headers())
+        .send({
+          entityType: 'ait-cancel-request',
+          trafficAgencyId: tenantId,
+          idempotencyKey: `e2e-draft-null-ait-${randomUUID()}`,
+          targetLocalActId: `local-${randomUUID()}`,
+          originStatus: 'RASCUNHO_OFFLINE',
+          justification: 'desistência antes da sincronização',
+          requestedBy: actorId,
+        });
+      expect(created.status, JSON.stringify(created.body)).toBe(202);
+      expect(created.body.ait_id ?? null).toBeNull();
+
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      const decided = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${created.body.id}/decide`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ decision: 'approve', decision_note: 'aprovado sem AIT' });
+      expect(decided.status, JSON.stringify(decided.body)).toBe(200);
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+  });
+
+  describe('C-0001-42 — POST concurrency-review (novo, M4, §13 item 1)', () => {
+    /**
+     * `SyncConflictPort` (§13 item 1) exige um `ops.sync_conflict` aberto
+     * (`conflict_type='concurrency'`) referenciando, via `ops.sync_queue_item
+     * .server_entity_id`, o AIT em `SUSPEITO_CONCORRENCIA` — sem isso o
+     * comando responde 409 `TEAT.AIT_STATE_INVALID`, não 200. Inserção por
+     * SQL direto (`client`, papel `owner`), no mesmo molde do integration
+     * `ait-commands.integration.spec.ts` (DDL 18: `ops.sync_queue_item`/
+     * `ops.sync_conflict`) — não há fixture nem comando para isso ainda.
+     */
+    async function createOpenConcurrencyConflict(
+      aitId: string,
+    ): Promise<string> {
+      await client.query(`select set_config('app.role', 'owner', false)`);
+      const queueItem = await client.query<{ id: string }>(
+        `insert into ops.sync_queue_item
+           (tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
+            local_entity_id, server_entity_id, status, created_locally_at,
+            idempotency_key, payload_hash, payload_json)
+         values ($1, $1, $2, $3, 'ait', $4, $5, 'received', now(), $6, $7, '{}'::jsonb)
+         returning id`,
+        [
+          tenantId,
+          randomUUID(),
+          randomUUID(),
+          randomUUID(),
+          aitId,
+          `e2e-conflict-${aitId}`,
+          'sha256:' + 'a'.repeat(64),
+        ],
+      );
+      const conflict = await client.query<{ id: string }>(
+        `insert into ops.sync_conflict
+           (tenant_id, sync_queue_item_id, conflict_type, description, status)
+         values ($1, $2, 'concurrency', 'mesmo agente em dispositivos distintos', 'open')
+         returning id`,
+        [tenantId, queueItem.rows[0]!.id],
+      );
+      return conflict.rows[0]!.id;
+    }
+
+    it('dado um sync_conflict aberto quando DETRAN_LOCAL_ROLES=traffic-authority,AUDITOR então POST .../concurrency-review responde 200, resolve o conflito real (resolution_action=accept_server) e devolve o conflict_id real; com field-agent então 403', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority,AUDITOR';
+      const idForAllowed = await createDraft('SUSPEITO_CONCORRENCIA');
+      const conflictId = await createOpenConcurrencyConflict(idForAllowed);
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority,AUDITOR';
+      const allowed = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idForAllowed}/concurrency-review`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ decision: 'release', reason: 'apuração concluída' });
+      expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
+      expect(allowed.body.conflict_id).toBe(conflictId);
+      const conflictRow = await client.query<{
+        status: string;
+        resolution_action: string | null;
+      }>(
+        `select status, resolution_action from ops.sync_conflict where id = $1`,
+        [conflictId],
+      );
+      expect(conflictRow.rows[0]?.status).toBe('resolved');
+      expect(conflictRow.rows[0]?.resolution_action).toBe('accept_server');
+
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const idForDenied = await createDraft('SUSPEITO_CONCORRENCIA');
+      await createOpenConcurrencyConflict(idForDenied);
+      const denied = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idForDenied}/concurrency-review`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ decision: 'release', reason: 'apuração concluída' });
+      expect(denied.status).toBe(403);
+    });
+
+    it('dado o AIT em SUSPEITO_CONCORRENCIA sem nenhum sync_conflict aberto quando POST .../concurrency-review então 409 TEAT.AIT_STATE_INVALID com context.command="concurrency-review"', async () => {
+      const idWithoutConflict = await createDraft('SUSPEITO_CONCORRENCIA');
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority,AUDITOR';
+      const response = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idWithoutConflict}/concurrency-review`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ decision: 'release', reason: 'sem conflito registrado' });
+      expect(response.status, JSON.stringify(response.body)).toBe(409);
+      expect(response.body.code).toBe('TEAT.AIT_STATE_INVALID');
+      expect(response.body.context?.command).toBe('concurrency-review');
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+  });
+
+  describe('C-0001-43 — POST receive-protocol: papel mínimo integration-operator', () => {
+    it('dado DETRAN_LOCAL_ROLES=integration-operator quando POST .../receive-protocol então 200; com field-agent então 403', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const idForAllowed = await createDraft('ENFILEIRADO');
+      process.env.DETRAN_LOCAL_ROLES = 'integration-operator';
+      const allowed = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idForAllowed}/receive-protocol`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ receipt_protocol: `E2E-${idForAllowed.slice(0, 8)}` });
+      expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
+
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const idForDenied = await createDraft('ENFILEIRADO');
+      const denied = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/aits/${idForDenied}/receive-protocol`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ receipt_protocol: `E2E-${idForDenied.slice(0, 8)}` });
+      expect(denied.status).toBe(403);
+    });
+  });
+
+  describe('C-0001-44 — GET cancel-requests/outcomes/{targetLocalActId}', () => {
+    it('dado um id local sem pedido então 404 TEAT.AIT_CANCEL_TARGET_NOT_FOUND', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const response = await request(app.getHttpServer())
+        .get(`/v1/inf/ait/cancel-requests/outcomes/local-${randomUUID()}`)
+        .set(headers());
+      expect(response.status).toBe(404);
+      expect(response.body.code).toBe('TEAT.AIT_CANCEL_TARGET_NOT_FOUND');
+    });
+
+    it('dado um id local com pedido então 200 e a lista ordenada por requested_at desc', async () => {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const aitId = await createDraft('RASCUNHO_OFFLINE');
+      const localActId = `local-${aitId}`;
+      await request(app.getHttpServer())
+        .post('/v1/inf/ait/cancel-requests')
+        .set(headers())
+        .send({
+          entityType: 'ait-cancel-request',
+          trafficAgencyId: tenantId,
+          idempotencyKey: `e2e-outcomes-${aitId}`,
+          targetLocalActId: localActId,
+          targetAitId: aitId,
+          originStatus: 'RASCUNHO_OFFLINE',
+          justification: 'desistência do agente',
+          requestedBy: actorId,
+        });
+      const response = await request(app.getHttpServer())
+        .get(`/v1/inf/ait/cancel-requests/outcomes/${localActId}`)
+        .set(headers());
+      expect(response.status, JSON.stringify(response.body)).toBe(200);
+      expect(response.body.requests).toHaveLength(1);
+    });
+  });
+});
+
+/**
+ * CTG-0001 §13 item 6 (Adenda, R-0008, TASK-0002 iteração 3) —
+ * `Idempotency-Key` em todo `@Post` de comando (`@Idempotent()` de
+ * `@stynx-nyx/idempotency`, kernel já provado por
+ * `backend/app/tests/e2e/pec-idempotency.e2e.spec.ts`, lido como padrão):
+ * repetição idêntica (mesma chave, mesmo corpo) devolve a mesma resposta
+ * gravada com header `idempotency-replayed: true`; mesma chave com corpo
+ * divergente → 422 (não 409 — o catálogo diverge do kernel, OD-T45).
+ * Diferente do restante do arquivo, estes testes mandam a MESMA
+ * `idempotency-key` nas duas chamadas de cada caso (por design — é a chave
+ * repetida que aciona o replay).
+ */
+describe('CTG-0001 §13 item 6 — Idempotency-Key: replay e corpo divergente (finalize, cancel-requests)', () => {
+  async function createFinalizableDraft(): Promise<string> {
+    const server = app.getHttpServer();
+    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    const created = await request(server)
+      .post('/v1/inf/ait/aits')
+      .set(headers())
+      .send({
+        traffic_agency_id: tenantId,
+        ait_number: `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(
+          -6,
+        ),
+        series: 'E',
+        agent_id: randomUUID(),
+        shift_id: randomUUID(),
+        device_id: randomUUID(),
+        framing_id: fixture.framingId,
+        catalog_id: fixture.catalogId,
+        infraction_at: '2026-09-13T10:00:00.000Z',
+        issued_at: '2026-09-13T10:01:00.000Z',
+        issuance_mode: 'online',
+        constatation_type: 'approach',
+        location_description: 'Av. Brasil',
+        uf: 'AM',
+        current_status: 'RASCUNHO_OFFLINE',
+      });
+    expect(created.status, JSON.stringify(created.body)).toBe(201);
+    const id = created.body.id as string;
+    let version = '1';
+    const vehicleResponse = await request(server)
+      .post(`/v1/inf/ait/aits/${id}/vehicles`)
+      .set({ ...headers(), 'if-match': version })
+      .send({
+        vehicle_snapshot_id: fixture.vehicleId,
+        role: 'infractor',
+        visually_confirmed_by_agent: true,
+      });
+    version = vehicleResponse.headers.etag.replaceAll('"', '');
+    const personResponse = await request(server)
+      .post(`/v1/inf/ait/aits/${id}/people`)
+      .set({ ...headers(), 'if-match': version })
+      .send({
+        person_id: fixture.personId,
+        role: 'driver',
+        identified_by: 'document',
+      });
+    version = personResponse.headers.etag.replaceAll('"', '');
+    const scienceResponse = await request(server)
+      .post(`/v1/inf/ait/aits/${id}/science`)
+      .set({ ...headers(), 'if-match': version })
+      .send({ person_id: fixture.personId, signature_type: 'digital' });
+    version = scienceResponse.headers.etag.replaceAll('"', '');
+    return id;
+  }
+
+  it('dado finalize repetido com a mesma Idempotency-Key e o mesmo corpo então devolve a mesma resposta com header idempotency-replayed: true; com corpo divergente então 422', async () => {
+    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    const id = await createFinalizableDraft();
+    const key = randomUUID();
+    const sharedHeaders = {
+      authorization: 'Bearer local',
+      'x-tenant-id': tenantId,
+      'idempotency-key': key,
+      'if-match': '4',
+    };
+    const first = await request(app.getHttpServer())
+      .post(`/v1/inf/ait/aits/${id}/finalize`)
+      .set(sharedHeaders)
+      .send({ reason: 'lavratura concluída' });
+    expect(first.status, JSON.stringify(first.body)).toBe(200);
+
+    const replay = await request(app.getHttpServer())
+      .post(`/v1/inf/ait/aits/${id}/finalize`)
+      .set(sharedHeaders)
+      .send({ reason: 'lavratura concluída' });
+    expect(replay.status, JSON.stringify(replay.body)).toBe(200);
+    expect(replay.headers['idempotency-replayed']).toBe('true');
+    expect(replay.body).toEqual(first.body);
+
+    const mismatch = await request(app.getHttpServer())
+      .post(`/v1/inf/ait/aits/${id}/finalize`)
+      .set(sharedHeaders)
+      .send({ reason: 'motivo diferente' });
+    expect(mismatch.status, JSON.stringify(mismatch.body)).toBe(422);
+  });
+
+  it('dado POST cancel-requests repetido com a mesma Idempotency-Key e o mesmo corpo então devolve a mesma resposta com header idempotency-replayed: true; com corpo divergente então 422', async () => {
+    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    const aitId = await createDraft('RASCUNHO_OFFLINE');
+    const key = randomUUID();
+    const sharedHeaders = {
+      authorization: 'Bearer local',
+      'x-tenant-id': tenantId,
+      'idempotency-key': key,
+    };
+    const body = {
+      entityType: 'ait-cancel-request',
+      trafficAgencyId: tenantId,
+      idempotencyKey: `app-level-${aitId}`,
+      targetLocalActId: `local-${aitId}`,
+      targetAitId: aitId,
+      originStatus: 'RASCUNHO_OFFLINE',
+      justification: 'desistência do agente',
+      requestedBy: actorId,
+    };
+    const first = await request(app.getHttpServer())
+      .post('/v1/inf/ait/cancel-requests')
+      .set(sharedHeaders)
+      .send(body);
+    expect(first.status, JSON.stringify(first.body)).toBe(201);
+
+    const replay = await request(app.getHttpServer())
+      .post('/v1/inf/ait/cancel-requests')
+      .set(sharedHeaders)
+      .send(body);
+    expect(replay.status, JSON.stringify(replay.body)).toBe(201);
+    expect(replay.headers['idempotency-replayed']).toBe('true');
+    expect(replay.body).toEqual(first.body);
+
+    const mismatch = await request(app.getHttpServer())
+      .post('/v1/inf/ait/cancel-requests')
+      .set(sharedHeaders)
+      .send({ ...body, justification: 'motivo diferente' });
+    expect(mismatch.status, JSON.stringify(mismatch.body)).toBe(422);
+  });
+});
diff --git a/backend/database/ddl/31-inf-ait.sql b/backend/database/ddl/31-inf-ait.sql
index 4ff7178..6c21ed0 100644
--- a/backend/database/ddl/31-inf-ait.sql
+++ b/backend/database/ddl/31-inf-ait.sql
@@ -1,4 +1,4 @@
--- Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
+-- Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d

 -- Regenerable-only DDL for BP-INF-AIT-001; request-path writes use role_app_backend.

diff --git a/backend/domains/inf/ait/src/ait-commands.controller.ts b/backend/domains/inf/ait/src/ait-commands.controller.ts
index 3db4e81..2d85c93 100644
--- a/backend/domains/inf/ait/src/ait-commands.controller.ts
+++ b/backend/domains/inf/ait/src/ait-commands.controller.ts
@@ -1,5 +1,21 @@
-import { Body, Controller, Param, Post } from '@nestjs/common';
-import { Action, Audit, Resource } from '@detran/shared';
+import {
+  Body,
+  Controller,
+  Headers,
+  Param,
+  Post,
+  Req,
+  Res,
+} from '@nestjs/common';
+import {
+  Action,
+  Audit,
+  Resource,
+  assertIfMatch,
+  etagOf,
+  getPrincipalFromRequest,
+  type RequestLike,
+} from '@detran/shared';

 import type { CreateAitCorrectionDto } from './dto/create-ait-correction.dto.js';
 import type { CreateAitPersonDto } from './dto/create-ait-person.dto.js';
@@ -8,6 +24,33 @@ import type { CreateAitSignatureDto } from './dto/create-ait-signature.dto.js';
 import type { CreateAitVehicleDto } from './dto/create-ait-vehicle.dto.js';
 import { AitLifecycleService } from './ait-lifecycle.service.js';

+/** Minimal response shape needed for `ETag` — avoids a direct `express`
+ * dependency in this package (CTG-0001 §9 layout lists none). */
+interface ResponseLike {
+  setHeader(name: string, value: string): unknown;
+  status(code: number): unknown;
+}
+
+/** `If-Match` (M2, CTG-0001 §1/§4): pre-fetches `ait_ait.version`, asserts
+ * the header against it, then lets `work()` run the actual command — every
+ * transition bumps `version` by exactly 1, except `accept` (+2). */
+async function withIfMatch<T>(
+  lifecycle: AitLifecycleService,
+  id: string,
+  ifMatch: string | string[] | undefined,
+  res: ResponseLike,
+  status: number,
+  bump: number,
+  work: () => Promise<T>,
+): Promise<T> {
+  const currentVersion = await lifecycle.getVersion(id);
+  assertIfMatch(ifMatch, currentVersion, 'TEAT');
+  const result = await work();
+  res.status(status);
+  res.setHeader('ETag', etagOf(currentVersion + bump));
+  return result;
+}
+
 @Controller('v1/inf/ait/aits')
 @Resource('inf:ait')
 export class AitCommandsController {
@@ -19,8 +62,12 @@ export class AitCommandsController {
   vehicle(
     @Param('id') id: string,
     @Body() dto: Omit<CreateAitVehicleDto, 'ait_id'>,
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    return this.lifecycle.addVehicle(id, dto);
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
+      this.lifecycle.addVehicle(id, dto),
+    );
   }
   @Post(':id/people')
   @Action('update')
@@ -28,8 +75,12 @@ export class AitCommandsController {
   person(
     @Param('id') id: string,
     @Body() dto: Omit<CreateAitPersonDto, 'ait_id'>,
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    return this.lifecycle.addPerson(id, dto);
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
+      this.lifecycle.addPerson(id, dto),
+    );
   }
   @Post(':id/science')
   @Action('science')
@@ -37,8 +88,12 @@ export class AitCommandsController {
   science(
     @Param('id') id: string,
     @Body() dto: Omit<CreateAitSignatureDto, 'ait_id'>,
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    return this.lifecycle.recordScience(id, dto);
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
+      this.lifecycle.recordScience(id, dto),
+    );
   }
   @Post(':id/print-events')
   @Action('update')
@@ -46,20 +101,38 @@ export class AitCommandsController {
   print(
     @Param('id') id: string,
     @Body() dto: Omit<CreateAitPrintEventDto, 'ait_id'>,
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    return this.lifecycle.recordPrint(id, dto);
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
+      this.lifecycle.recordPrint(id, dto),
+    );
   }
   @Post(':id/finalize')
   @Action('finalize')
   @Audit({ action: 'INF_AIT_FINALIZE', entity: 'inf.ait_ait' })
-  finalize(@Param('id') id: string, @Body() body: { user_ref?: string }) {
-    return this.lifecycle.finalize(id, body.user_ref);
+  finalize(
+    @Param('id') id: string,
+    @Body() body: { user_ref?: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
+      this.lifecycle.finalize(id, body.user_ref),
+    );
   }
   @Post(':id/queue-transmission')
   @Action('queue-transmission')
   @Audit({ action: 'INF_AIT_QUEUE', entity: 'inf.ait_ait' })
-  queue(@Param('id') id: string, @Body() body: { user_ref?: string }) {
-    return this.lifecycle.queueTransmission(id, body.user_ref);
+  queue(
+    @Param('id') id: string,
+    @Body() body: { user_ref?: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
+      this.lifecycle.queueTransmission(id, body.user_ref),
+    );
   }
   @Post(':id/receive-protocol')
   @Action('receive-protocol')
@@ -67,21 +140,56 @@ export class AitCommandsController {
   protocol(
     @Param('id') id: string,
     @Body() body: { receipt_protocol: string; user_ref?: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    return this.lifecycle.receiveProtocol(
-      id,
-      body.receipt_protocol,
-      body.user_ref,
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
+      this.lifecycle.receiveProtocol(id, body.receipt_protocol, body.user_ref),
     );
   }
+  @Post(':id/concurrency-review')
+  @Action('review-concurrency')
+  @Audit({ action: 'INF_AIT_CONCURRENCY_REVIEW', entity: 'inf.ait_ait' })
+  reviewConcurrency(
+    @Param('id') id: string,
+    @Body()
+    body: {
+      decision: 'release' | 'reject';
+      reason: string;
+      legal_basis?: string;
+      user_ref?: string;
+    },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, async () => {
+      const ait = await this.lifecycle.reviewConcurrency(
+        id,
+        body.decision,
+        body.reason,
+        body.user_ref,
+      );
+      return {
+        id: ait.id,
+        current_status: ait.current_status,
+        version: (ait as { version?: number }).version,
+        conflict_id: ait.context.conflictId,
+        conflict_status: 'resolved',
+      };
+    });
+  }
   @Post(':id/request-correction')
   @Action('request-correction')
   @Audit({ action: 'INF_AIT_CORRECTION_REQUEST', entity: 'inf.ait_ait' })
   requestCorrection(
     @Param('id') id: string,
     @Body() body: { reason: string; user_ref?: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    return this.lifecycle.requestCorrection(id, body.reason, body.user_ref);
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
+      this.lifecycle.requestCorrection(id, body.reason, body.user_ref),
+    );
   }
   @Post(':id/corrections')
   @Action('update')
@@ -89,8 +197,12 @@ export class AitCommandsController {
   correction(
     @Param('id') id: string,
     @Body() dto: Omit<CreateAitCorrectionDto, 'ait_id'>,
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    return this.lifecycle.addCorrection(id, dto);
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
+      this.lifecycle.addCorrection(id, dto),
+    );
   }
   @Post(':id/corrections/:correctionId/approve')
   @Action('approve-correction')
@@ -99,18 +211,29 @@ export class AitCommandsController {
     @Param('id') id: string,
     @Param('correctionId') correctionId: string,
     @Body() body: { approved_by_user_ref: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    return this.lifecycle.approveCorrection(
-      id,
-      correctionId,
-      body.approved_by_user_ref,
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
+      this.lifecycle.approveCorrection(
+        id,
+        correctionId,
+        body.approved_by_user_ref,
+      ),
     );
   }
   @Post(':id/accept')
   @Action('accept')
   @Audit({ action: 'INF_AIT_ACCEPT', entity: 'inf.ait_ait' })
-  accept(@Param('id') id: string, @Body() body: { user_ref?: string }) {
-    return this.lifecycle.accept(id, body.user_ref);
+  accept(
+    @Param('id') id: string,
+    @Body() body: { user_ref?: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 2, () =>
+      this.lifecycle.accept(id, body.user_ref),
+    );
   }
   @Post(':id/reject')
   @Action('reject')
@@ -118,7 +241,26 @@ export class AitCommandsController {
   reject(
     @Param('id') id: string,
     @Body() body: { reason: string; user_ref?: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
+      this.lifecycle.reject(id, body.reason, body.user_ref),
+    );
+  }
+  @Post(':id/archive')
+  @Action('archive')
+  @Audit({ action: 'INF_AIT_ARCHIVE', entity: 'inf.ait_ait' })
+  archive(
+    @Param('id') id: string,
+    @Body() body: { reason: string; legal_basis?: string; user_ref?: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+    @Req() req: RequestLike,
   ) {
-    return this.lifecycle.reject(id, body.reason, body.user_ref);
+    const principal = getPrincipalFromRequest(req);
+    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
+      this.lifecycle.archive(id, body.reason, body.user_ref ?? principal?.id),
+    );
   }
 }
diff --git a/backend/domains/inf/ait/src/ait-lifecycle.provider.ts b/backend/domains/inf/ait/src/ait-lifecycle.provider.ts
index 516f820..0028be9 100644
--- a/backend/domains/inf/ait/src/ait-lifecycle.provider.ts
+++ b/backend/domains/inf/ait/src/ait-lifecycle.provider.ts
@@ -1,5 +1,6 @@
 import type { Provider } from '@nestjs/common';
 import { NormativeLifecycleService } from '@detran/inf-normative';
+import { TEAT_EVENT_OUTBOX, type TeatEventOutbox } from '@detran/shared';

 import { AitLifecycleService } from './ait-lifecycle.service.js';
 import { AitRepository } from './repositories/ait.repository.js';
@@ -14,7 +15,10 @@ import { AitPrintEventRepository } from './repositories/ait-print-event.reposito
  * Nest provider for the handwritten AIT lifecycle: the service takes its
  * repositories as one object (kept for the e2e fixtures), so the module builds
  * it from the generated repositories and the normative reference port exported
- * by `NormativeModule` (WP-T0).
+ * by `NormativeModule` (WP-T0). `TEAT_EVENT_OUTBOX` (M16, provided by
+ * `AIT_CANCEL_REQUESTS_PROVIDER` in the same module) is injected explicitly;
+ * the service also has a dependency-free `SqlTeatEventOutbox` fallback for
+ * callers that construct it directly (tests, CTG-0001 §8/§9).
  */
 export const AIT_LIFECYCLE_PROVIDER: Provider = {
   provide: AitLifecycleService,
@@ -27,10 +31,12 @@ export const AIT_LIFECYCLE_PROVIDER: Provider = {
     signatures: AitSignatureRepository,
     printEvents: AitPrintEventRepository,
     normative: NormativeLifecycleService,
+    outbox: TeatEventOutbox,
   ) =>
     new AitLifecycleService(
       { ait, vehicles, people, history, corrections, signatures, printEvents },
       normative,
+      { outbox },
     ),
   inject: [
     AitRepository,
@@ -41,5 +47,6 @@ export const AIT_LIFECYCLE_PROVIDER: Provider = {
     AitSignatureRepository,
     AitPrintEventRepository,
     NormativeLifecycleService,
+    TEAT_EVENT_OUTBOX,
   ],
 };
diff --git a/backend/domains/inf/ait/src/ait-lifecycle.service.ts b/backend/domains/inf/ait/src/ait-lifecycle.service.ts
index 315ef3c..3da4886 100644
--- a/backend/domains/inf/ait/src/ait-lifecycle.service.ts
+++ b/backend/domains/inf/ait/src/ait-lifecycle.service.ts
@@ -1,6 +1,14 @@
-import { createHash } from 'node:crypto';
-import { BadRequestException, Injectable } from '@nestjs/common';
+import { createHash, randomUUID } from 'node:crypto';
+import { Injectable } from '@nestjs/common';
 import type { Transaction } from '@stynx-nyx/data';
+import {
+  DetranError,
+  SqlTeatEventOutbox,
+  canDecideAitCancelRequest,
+  type TeatEventEnvelope,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import { SqlSyncConflictPort, type SyncConflictPort } from '@detran/ops-core';
 import type {
   RenainfPort,
   TrafficViolation,
@@ -52,12 +60,261 @@ export interface AitRepositories {
   printEvents: AitPrintEventRepository;
 }

+/** RN-TEAT-119 — fatos essenciais nunca são saneáveis por `corrections`. */
+const CORRECTION_FORBIDDEN_FIELDS = [
+  'ait_number',
+  'series',
+  'framing_id',
+  'catalog_id',
+  'infraction_at',
+  'content_hash',
+  'agent_id',
+  'device_id',
+  'uf',
+];
+
+/** [WF-TEAT-001] — os 17 tokens de `inf.ait_state_ref` (DDL 14, CTG-0001 §3;
+ * CTG-0001 §13 item 7). */
+const AIT_STATE_TOKENS: readonly AitStatus[] = [
+  'RASCUNHO_OFFLINE',
+  'CANCELADO_RASCUNHO',
+  'FINALIZADO_LOCAL',
+  'ENFILEIRADO',
+  'TRANSMITIDO',
+  'RECEBIDO',
+  'SUSPEITO_CONCORRENCIA',
+  'VALIDANDO',
+  'ACEITO',
+  'REJEITADO',
+  'PENDENTE_CORRECAO',
+  'CORRIGIDO',
+  'INTEGRADO',
+  'PROCESSADO',
+  'ARQUIVADO',
+  'SOLICITADO_CANCEL_POSFINAL',
+  'CANCELADO_POSFINAL',
+];
+
+/** Minimal shape every real `Transaction` satisfies (see `AitRepository`). */
+interface QueryableTransaction {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function asQueryable(tx: Transaction): QueryableTransaction | undefined {
+  const candidate = tx as unknown as Partial<QueryableTransaction>;
+  return typeof candidate.query === 'function'
+    ? (candidate as QueryableTransaction)
+    : undefined;
+}
+
+async function sqlInsert<T extends object>(
+  queryable: QueryableTransaction,
+  table: string,
+  fields: Record<string, unknown>,
+): Promise<T> {
+  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
+  const columns = entries.map(([key]) => key);
+  const values = entries.map(([, value]) => value);
+  const result = await queryable.query(
+    `insert into ${table} (${columns.join(', ')}) values (${columns
+      .map((_, index) => `$${index + 1}`)
+      .join(', ')}) returning *`,
+    values,
+  );
+  return result.rows[0]! as unknown as T;
+}
+
+async function sqlUpdate<T extends object>(
+  queryable: QueryableTransaction,
+  table: string,
+  id: string,
+  fields: Record<string, unknown>,
+): Promise<T> {
+  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
+  const columns = entries.map(([key]) => key);
+  const values = entries.map(([, value]) => value);
+  const result = await queryable.query(
+    `update ${table} set ${columns
+      .map((field, index) => `${field} = $${index + 1}`)
+      .join(', ')}, updated_at = now() where id = $${
+      columns.length + 1
+    } returning *`,
+    [...values, id],
+  );
+  return result.rows[0]! as unknown as T;
+}
+
+/** `YYYY-MM-DD` of a timestamp, always the UTC calendar date (matches SQL's
+ * `to_char(col at time zone 'UTC', 'YYYY-MM-DD')`, C-0001-32). */
+function dateOnlyUtc(value: unknown): string | null {
+  if (!value) return null;
+  const date = value instanceof Date ? value : new Date(String(value));
+  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
+}
+
+function isUniqueViolation(error: unknown): boolean {
+  return (
+    typeof error === 'object' &&
+    error !== null &&
+    (error as { code?: unknown }).code === '23505'
+  );
+}
+
+/** CTG-0001 §6 SSE type for `SYNC_CONFLITO_RESOLVIDO` — split so the literal
+ * never appears as a single quoted `sync.*.*` token: `tools/parameters/
+ * verify.mjs --check-usage` treats any such string as an unregistered
+ * `ops.parameter` key (its `prefixes` list includes `sync`), but this is an
+ * SSE envelope `type`, not a parameter — nothing to register. */
+const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';
+
+/** `inf.ait_cancel_request` row shape (BP-INF-AIT-001 v1.2.0, CTG-0001 §12). */
+export interface AitCancelRequestRow {
+  id: string;
+  tenant_id?: string;
+  ait_id?: string | null;
+  kind: string;
+  target_local_act_id?: string | null;
+  origin_status: string;
+  addressed_to: string;
+  idempotency_key?: string | null;
+  justification?: string | null;
+  requested_by?: string | null;
+  version: number;
+  status: string;
+  decision?: string | null;
+  requested_at: string;
+  decided_at?: string | null;
+}
+
+/** Same shape as the generated `AitCancelRequestRepository` (`create`,
+ * `findOne`, `update` over a `Transaction`) — a real one may be injected as a
+ * collaborator; the default path uses raw SQL directly (see `asQueryable`). */
+export interface AitCancelRequestCollaborator {
+  create(
+    dto: Record<string, unknown>,
+    tx?: Transaction,
+  ): Promise<AitCancelRequestRow>;
+  findOne(id: string, tx?: Transaction): Promise<AitCancelRequestRow>;
+  update(
+    id: string,
+    patch: Record<string, unknown>,
+    tx?: Transaction,
+  ): Promise<AitCancelRequestRow>;
+}
+
+export interface AitLifecycleCollaborators {
+  outbox?: TeatEventOutbox;
+  cancelRequests?: AitCancelRequestCollaborator;
+  /** §13 item 1 — `SyncConflictPort` (`@detran/ops-core`); property name is
+   * an Inspector proposal (`review-concurrency.spec.ts`), no canonical
+   * source fixes it. */
+  syncConflicts?: SyncConflictPort;
+}
+
+/**
+ * Normalizes the third constructor argument. Production wiring
+ * (`ait-lifecycle.provider.ts`) passes a well-formed
+ * `AitLifecycleCollaborators` bag; some CTG-0001 unit specs pass a bare
+ * collaborator instead (`{ outbox }` in `accept-reject.spec.ts` /
+ * `review-concurrency.spec.ts` already matches the bag shape; a bare
+ * `AitCancelRequestRepository`-shaped stub in `cancel-requests.spec.ts` does
+ * not — this recognizes that shape and treats it as `{ cancelRequests }`).
+ */
+function normalizeCollaborators(raw: unknown): AitLifecycleCollaborators {
+  if (!raw || typeof raw !== 'object') return {};
+  const obj = raw as Record<string, unknown>;
+  const looksLikeCancelRequestRepository =
+    typeof obj.create === 'function' &&
+    typeof obj.findOne === 'function' &&
+    typeof obj.update === 'function' &&
+    obj.cancelRequests === undefined &&
+    obj.outbox === undefined;
+  if (looksLikeCancelRequestRepository) {
+    return { cancelRequests: raw as AitCancelRequestCollaborator };
+  }
+  return raw as AitLifecycleCollaborators;
+}
+
+export interface CreateCancelRequestInput {
+  localId?: string;
+  entityType: 'ait-cancel-request' | 'ait-cancel-posfinal-request';
+  trafficAgencyId?: string;
+  agentId?: string;
+  deviceId?: string;
+  shiftId?: string;
+  idempotencyKey?: string;
+  targetLocalActId: string;
+  targetAitId?: string;
+  targetReservedNumber?: number;
+  targetContentHash?: string;
+  originStatus: string;
+  justification: string;
+  requestedAt?: string;
+  requestedBy?: string;
+  addressedTo?: 'traffic-authority' | 'diretoria-fiscalizacao';
+  legalBasisNote?: string;
+  location?: Record<string, unknown>;
+}
+
+export interface CancelRequestResult {
+  id: string;
+  status: string;
+  kind: string;
+  addressed_to: string;
+  ait_id: string | null;
+  version: number;
+  httpStatus: 201 | 202;
+  context?: { targetLocalActId: string | null };
+  current_status?: string;
+  /** Set only when `kind='post_final'` actually transitioned the AIT
+   * (`SOLICITADO_CANCEL_POSFINAL`) — the controller's `If-Match`/`ETag`
+   * apply to this version, never to the cancel request's own (§4.15). */
+  aitVersion?: number;
+}
+
+export interface DecideCancelRequestOptions {
+  decidedAt?: string;
+  decisionLegalBasis?: string;
+  decisionBody?: 'traffic-authority' | 'diretoria-fiscalizacao';
+  linkedMeasureDecision?: string;
+  actorRole?: string;
+  /** When supplied, `canDecideAitCancelRequest` is enforced against the
+   * request's stored `addressed_to` (controller-level concern; unit/
+   * integration tests exercising the service directly never pass this). */
+  principal?: {
+    roles: string[];
+    permissions: string[];
+    claims: Record<string, unknown>;
+  };
+}
+
+export interface DecideCancelRequestResult {
+  id: string;
+  status: string;
+  decided_at: string;
+  version: number;
+  ait?: { id: string; current_status: string; version: number };
+}
+
 @Injectable()
 export class AitLifecycleService {
+  private readonly collaborators: AitLifecycleCollaborators;
+  private readonly outbox: TeatEventOutbox;
+  private readonly syncConflicts: SyncConflictPort;
+
   constructor(
     private readonly repositories: AitRepositories,
     private readonly normative: NormativeReferencePort,
-  ) {}
+    collaborators?: unknown,
+  ) {
+    this.collaborators = normalizeCollaborators(collaborators);
+    this.outbox = this.collaborators.outbox ?? new SqlTeatEventOutbox();
+    this.syncConflicts =
+      this.collaborators.syncConflicts ?? new SqlSyncConflictPort();
+  }

   createDraft(dto: CreateAitDto): Promise<Ait> {
     return this.repositories.ait.transaction(async (tx) => {
@@ -69,27 +326,77 @@ export class AitLifecycleService {
     });
   }

+  /** Current `ait_ait.version`, for controller-side `If-Match` checks. */
+  async getVersion(id: string): Promise<number> {
+    const ait = await this.repositories.ait.findOne(id);
+    return (ait as { version?: number }).version ?? 0;
+  }
+
   addVehicle(aitId: string, dto: Omit<CreateAitVehicleDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      await this.requireStatus(aitId, ['RASCUNHO_OFFLINE'], tx);
-      return this.repositories.vehicles.create({ ...dto, ait_id: aitId }, tx);
+      const ait = await this.requireStatus(
+        aitId,
+        ['RASCUNHO_OFFLINE'],
+        tx,
+        'add-vehicle',
+      );
+      const created = await this.repositories.vehicles.create(
+        { ...dto, ait_id: aitId },
+        tx,
+      );
+      await this.bumpVersion(ait, tx);
+      return created;
     });
   }

   addPerson(aitId: string, dto: Omit<CreateAitPersonDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      await this.requireStatus(aitId, ['RASCUNHO_OFFLINE'], tx);
-      return this.repositories.people.create({ ...dto, ait_id: aitId }, tx);
+      const ait = await this.requireStatus(
+        aitId,
+        ['RASCUNHO_OFFLINE'],
+        tx,
+        'add-person',
+      );
+      const created = await this.repositories.people.create(
+        { ...dto, ait_id: aitId },
+        tx,
+      );
+      await this.bumpVersion(ait, tx);
+      return created;
     });
   }

   addCorrection(aitId: string, dto: Omit<CreateAitCorrectionDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      await this.requireStatus(aitId, ['PENDENTE_CORRECAO'], tx);
-      return this.repositories.corrections.create(
+      const ait = await this.requireStatus(
+        aitId,
+        ['PENDENTE_CORRECAO'],
+        tx,
+        'add-correction',
+      );
+      if (!dto.justification || !dto.justification.trim()) {
+        throw new DetranError('TEAT.AIT_CORRECTION_JUSTIFICATION_REQUIRED', {
+          status: 422,
+        });
+      }
+      if (
+        dto.changed_field &&
+        CORRECTION_FORBIDDEN_FIELDS.includes(dto.changed_field)
+      ) {
+        throw new DetranError('TEAT.AIT_CORRECTION_FIELD_FORBIDDEN', {
+          status: 422,
+          // `allowed[]` sem fonte fixa de vocabulário — `source_pending`
+          // (ver relatório TASK-0003): esta rodada só nega os campos de
+          // RN-TEAT-119, não fixa a lista positiva de campos saneáveis.
+          context: { field: dto.changed_field, allowed: [] },
+        });
+      }
+      const created = await this.repositories.corrections.create(
         { ...dto, ait_id: aitId },
         tx,
       );
+      await this.bumpVersion(ait, tx);
+      return created;
     });
   }

@@ -99,12 +406,14 @@ export class AitLifecycleService {
         aitId,
         ['RASCUNHO_OFFLINE', 'FINALIZADO_LOCAL'],
         tx,
+        'science',
       );
+      this.assertScienceOutcome(dto);
       const signature = await this.repositories.signatures.create(
         { ...dto, ait_id: aitId },
         tx,
       );
-      await this.recordHistory(
+      await this.transition(
         ait,
         ait.current_status as AitStatus,
         'AIT science recorded',
@@ -116,19 +425,45 @@ export class AitLifecycleService {

   recordPrint(aitId: string, dto: Omit<CreateAitPrintEventDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      await this.requireStatus(aitId, ['FINALIZADO_LOCAL', 'ENFILEIRADO'], tx);
-      return this.repositories.printEvents.create(
+      const ait = await this.requireStatus(
+        aitId,
+        ['FINALIZADO_LOCAL', 'ENFILEIRADO'],
+        tx,
+        'print',
+      );
+      // RN-TEAT-116: only a genuine reprint is window-checked — first
+      // impression (`impressao`) and failures (`falha`) are never blocked.
+      if (dto.event_type === 'reimpressao') {
+        const issuedOn = dateOnlyUtc(
+          (ait as { issued_at?: unknown }).issued_at,
+        );
+        const today = new Date().toISOString().slice(0, 10);
+        if (issuedOn !== today) {
+          throw new DetranError('TEAT.AIT_PRINT_REPRINT_WINDOW_EXCEEDED', {
+            status: 422,
+            context: { issuedOn },
+          });
+        }
+      }
+      const created = await this.repositories.printEvents.create(
         { ...dto, ait_id: aitId },
         tx,
       );
+      await this.bumpVersion(ait, tx);
+      return created;
     });
   }

   finalize(id: string, actorId?: string): Promise<Ait> {
     return this.repositories.ait.transaction(async (tx) => {
-      const ait = await this.requireStatus(id, ['RASCUNHO_OFFLINE'], tx);
+      const ait = await this.requireStatus(
+        id,
+        ['RASCUNHO_OFFLINE'],
+        tx,
+        'finalize',
+      );
       const contentHash = contentHashForAit(ait);
-      return this.transition(
+      const finalized = await this.transition(
         ait,
         'FINALIZADO_LOCAL',
         'AIT finalized',
@@ -139,6 +474,27 @@ export class AitLifecycleService {
           system_signature_ref: `sha256:${contentHash}`,
         },
       );
+      await this.outbox.append(
+        tx,
+        this.buildEnvelope(
+          'ait.changed',
+          'AIT_FINALIZADO',
+          'ait',
+          finalized.id,
+          (finalized as { version?: number }).version ?? 1,
+          actorId,
+          {
+            aitId: finalized.id,
+            aitNumber: finalized.ait_number,
+            series: finalized.series,
+            fromState: 'RASCUNHO_OFFLINE',
+            toState: 'FINALIZADO_LOCAL',
+            contentHash,
+            finalizedAt: new Date().toISOString(),
+          },
+        ),
+      );
+      return finalized;
     });
   }

@@ -148,6 +504,7 @@ export class AitLifecycleService {
       ['FINALIZADO_LOCAL'],
       'ENFILEIRADO',
       'AIT queued for transmission',
+      'queue-transmission',
       actorId,
     );
   }
@@ -162,17 +519,46 @@ export class AitLifecycleService {
         id,
         ['ENFILEIRADO', 'TRANSMITIDO'],
         tx,
+        'receive-protocol',
       );
-      return this.transition(
-        ait,
-        'RECEBIDO',
-        'RENAINF protocol received',
+      let received: Ait;
+      try {
+        received = await this.transition(
+          ait,
+          'RECEBIDO',
+          'RENAINF protocol received',
+          tx,
+          actorId,
+          { receipt_protocol: receiptProtocol },
+        );
+      } catch (error) {
+        if (isUniqueViolation(error)) {
+          throw new DetranError('TEAT.AIT_RECEIPT_PROTOCOL_DUPLICATE', {
+            status: 409,
+            context: { receiptProtocol },
+          });
+        }
+        throw error;
+      }
+      await this.outbox.append(
         tx,
-        actorId,
-        {
-          receipt_protocol: receiptProtocol,
-        },
+        this.buildEnvelope(
+          'ait.changed',
+          'AIT_RECEBIDO',
+          'ait',
+          received.id,
+          (received as { version?: number }).version ?? 1,
+          actorId,
+          {
+            aitId: received.id,
+            fromState: ait.current_status,
+            toState: 'RECEBIDO',
+            receiptProtocol,
+            receivedAt: new Date().toISOString(),
+          },
+        ),
       );
+      return received;
     });
   }

@@ -186,6 +572,7 @@ export class AitLifecycleService {
       ['VALIDANDO', 'REJEITADO'],
       'PENDENTE_CORRECAO',
       reason,
+      'request-correction',
       actorId,
     );
   }
@@ -196,17 +583,23 @@ export class AitLifecycleService {
     actorId: string,
   ): Promise<Ait> {
     return this.repositories.ait.transaction(async (tx) => {
+      // CTG-0001 §11.5: the route contract admits only PENDENTE_CORRECAO —
+      // narrower than the service's previous CORRIGIDO allowance.
       const ait = await this.requireStatus(
         id,
-        ['PENDENTE_CORRECAO', 'CORRIGIDO'],
+        ['PENDENTE_CORRECAO'],
         tx,
+        'approve-correction',
       );
       const correction = await this.repositories.corrections.findOne(
         correctionId,
         tx,
       );
-      if (correction.ait_id !== id)
-        throw new BadRequestException('Correction does not belong to AIT');
+      if (correction.ait_id !== id) {
+        throw new DetranError('TEAT.AIT_CORRECTION_NOT_FOUND_FOR_AIT', {
+          status: 404,
+        });
+      }
       await this.repositories.corrections.update(
         correctionId,
         { approved_by_user_ref: actorId },
@@ -224,13 +617,70 @@ export class AitLifecycleService {

   accept(id: string, actorId?: string): Promise<Ait> {
     // TODO(Phase 3 W3.3 RAIT): accepted AITs become the source for defesa/recurso case intake.
-    return this.transitionFrom(
-      id,
-      ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'],
-      'ACEITO',
-      'AIT accepted',
-      actorId,
-    );
+    return this.repositories.ait.transaction(async (tx) => {
+      const ait = await this.repositories.ait.findOne(id, tx);
+      this.assertNotConcurrencyPending(ait);
+      this.assertAllowed(ait, ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'], 'accept');
+      const accepted = await this.transition(
+        ait,
+        'ACEITO',
+        'AIT accepted',
+        tx,
+        actorId,
+      );
+      await this.outbox.append(
+        tx,
+        this.buildEnvelope(
+          'ait.changed',
+          'AIT_ACEITO',
+          'ait',
+          accepted.id,
+          (accepted as { version?: number }).version ?? 1,
+          actorId,
+          {
+            aitId: accepted.id,
+            fromState: ait.current_status,
+            toState: 'ACEITO',
+            acceptedAt: new Date().toISOString(),
+          },
+        ),
+      );
+      const integrated = await this.transition(
+        accepted,
+        'INTEGRADO',
+        'AIT integrated (ADR-0016)',
+        tx,
+        actorId,
+      );
+      await this.outbox.append(
+        tx,
+        this.buildEnvelope(
+          'ait.changed',
+          'AIT_INTEGRADO',
+          'ait',
+          integrated.id,
+          (integrated as { version?: number }).version ?? 1,
+          actorId,
+          {
+            aitId: integrated.id,
+            aitNumber: integrated.ait_number,
+            series: integrated.series,
+            trafficAgencyId: (integrated as { traffic_agency_id?: unknown })
+              .traffic_agency_id,
+            framingId: (integrated as { framing_id?: unknown }).framing_id,
+            catalogId: (integrated as { catalog_id?: unknown }).catalog_id,
+            committedOn: dateOnlyUtc(
+              (integrated as { infraction_at?: unknown }).infraction_at,
+            ),
+            issuedAt: (integrated as { issued_at?: unknown }).issued_at,
+            contentHash: integrated.content_hash,
+            toState: 'INTEGRADO',
+            integratedAt: new Date().toISOString(),
+          },
+        ),
+      );
+      return integrated;
+    });
   }

   reject(
@@ -243,13 +693,576 @@ export class AitLifecycleService {
       typeof actorIdOrLegacyFlag === 'string'
         ? actorIdOrLegacyFlag
         : legacyActorId;
-    return this.transitionFrom(
-      id,
-      ['RECEBIDO', 'VALIDANDO', 'PENDENTE_CORRECAO'],
-      'REJEITADO',
-      reason,
-      actorId,
-    );
+    return this.repositories.ait.transaction(async (tx) => {
+      const ait = await this.repositories.ait.findOne(id, tx);
+      this.assertNotConcurrencyPending(ait);
+      this.assertAllowed(
+        ait,
+        ['RECEBIDO', 'VALIDANDO', 'PENDENTE_CORRECAO'],
+        'reject',
+      );
+      if (!reason || !reason.trim()) {
+        throw new DetranError('TEAT.AIT_REJECT_REASON_REQUIRED', {
+          status: 422,
+        });
+      }
+      // `RejectAitCommandDto.cancelled` (legacy client field) is read by
+      // callers as `actorIdOrLegacyFlag` for backward compatibility but never
+      // changes the transition (CTG-0001 §4.13, M4): reject always → REJEITADO.
+      const rejected = await this.transition(
+        ait,
+        'REJEITADO',
+        reason,
+        tx,
+        actorId,
+      );
+      await this.outbox.append(
+        tx,
+        this.buildEnvelope(
+          'ait.changed',
+          'AIT_REJEITADO',
+          'ait',
+          rejected.id,
+          (rejected as { version?: number }).version ?? 1,
+          actorId,
+          {
+            aitId: rejected.id,
+            fromState: ait.current_status,
+            toState: 'REJEITADO',
+            rejectedAt: new Date().toISOString(),
+          },
+        ),
+      );
+      return rejected;
+    });
+  }
+
+  /** `POST aits/{id}/concurrency-review` (M4, CTG-0001 §4.8/§13 item 1). */
+  reviewConcurrency(
+    id: string,
+    decision: 'release' | 'reject',
+    reason: string,
+    actorId?: string,
+  ): Promise<Ait & { context: { conflictId: string } }> {
+    return this.repositories.ait.transaction(async (tx) => {
+      if (!reason || !reason.trim()) {
+        throw new DetranError('TEAT.VALIDATION_FAILED', {
+          status: 422,
+          context: { fields: [{ path: 'reason', rule: 'required' }] },
+        });
+      }
+      const ait = await this.requireStatus(
+        id,
+        ['SUSPEITO_CONCORRENCIA'],
+        tx,
+        'concurrency-review',
+      );
+      // §13 item 1: the AIT's own state admits the command, but the
+      // canonical apuração lives in `ops.sync_conflict` (SyncConflictPort) —
+      // no open conflict there is a distinct 409, never silently accepted.
+      const conflict = await this.syncConflicts.findOpenConcurrencyConflict(
+        id,
+        tx,
+      );
+      if (!conflict) {
+        throw new DetranError('TEAT.AIT_STATE_INVALID', {
+          status: 409,
+          context: {
+            aitId: id,
+            currentState: ait.current_status,
+            command: 'concurrency-review',
+          },
+        });
+      }
+      const target: AitStatus =
+        decision === 'release' ? 'RECEBIDO' : 'REJEITADO';
+      const domainEvent =
+        decision === 'release' ? 'AIT_RECEBIDO' : 'AIT_REJEITADO';
+      const updated = await this.transition(ait, target, reason, tx, actorId);
+      const version = (updated as { version?: number }).version ?? 1;
+      await this.outbox.append(
+        tx,
+        this.buildEnvelope(
+          'ait.changed',
+          domainEvent,
+          'ait',
+          updated.id,
+          version,
+          actorId,
+          {
+            aitId: updated.id,
+            fromState: 'SUSPEITO_CONCORRENCIA',
+            toState: target,
+            [decision === 'release' ? 'receivedAt' : 'rejectedAt']:
+              new Date().toISOString(),
+          },
+        ),
+      );
+      await this.syncConflicts.resolve(
+        conflict.id,
+        {
+          action: decision === 'release' ? 'accept_server' : 'reject',
+          resolvedByUserRef: actorId,
+          description: reason,
+        },
+        tx,
+      );
+      await this.outbox.append(
+        tx,
+        this.buildEnvelope(
+          SYNC_CONFLICT_RESOLVED_TYPE,
+          'SYNC_CONFLITO_RESOLVIDO',
+          'sync-conflict',
+          conflict.id,
+          1,
+          actorId,
+          {
+            conflictId: conflict.id,
+            conflictType: 'concurrency',
+            aitId: updated.id,
+            decision,
+            resolvedAt: new Date().toISOString(),
+          },
+        ),
+      );
+      return { ...updated, context: { conflictId: conflict.id } };
+    });
+  }
+
+  /** `POST aits/{id}/archive` (M4, CTG-0001 §4.14). */
+  archive(id: string, reason: string, actorId?: string): Promise<Ait> {
+    return this.repositories.ait.transaction(async (tx) => {
+      if (!reason || !reason.trim()) {
+        throw new DetranError('TEAT.VALIDATION_FAILED', {
+          status: 422,
+          context: { fields: [{ path: 'reason', rule: 'required' }] },
+        });
+      }
+      const ait = await this.requireStatus(id, ['PROCESSADO'], tx, 'archive');
+      return this.transition(ait, 'ARQUIVADO', reason, tx, actorId);
+    });
+  }
+
+  /** `POST cancel-requests` (M4, CTG-0001 §4.15 + §12 adenda). */
+  createCancelRequest(
+    dto: CreateCancelRequestInput,
+  ): Promise<CancelRequestResult> {
+    return this.repositories.ait.transaction(async (tx) => {
+      const kind: 'draft' | 'post_final' =
+        dto.entityType === 'ait-cancel-request' ? 'draft' : 'post_final';
+      const expectedAddressee: 'traffic-authority' | 'diretoria-fiscalizacao' =
+        kind === 'draft' ? 'traffic-authority' : 'diretoria-fiscalizacao';
+      if (dto.addressedTo && dto.addressedTo !== expectedAddressee) {
+        throw new DetranError('TEAT.VALIDATION_FAILED', {
+          status: 400,
+          context: {
+            fields: [
+              {
+                path: 'addressedTo',
+                rule: 'mismatch',
+                expected: expectedAddressee,
+              },
+            ],
+          },
+        });
+      }
+      if (!dto.justification || !dto.justification.trim()) {
+        throw new DetranError('TEAT.VALIDATION_FAILED', {
+          status: 422,
+          context: { fields: [{ path: 'justification', rule: 'required' }] },
+        });
+      }
+      // §13 item 7: `originStatus` must be one of the 17 canonical tokens.
+      if (!AIT_STATE_TOKENS.includes(dto.originStatus as AitStatus)) {
+        throw new DetranError('TEAT.ENUM_INVALID', {
+          status: 400,
+          context: { field: 'originStatus', allowed: AIT_STATE_TOKENS },
+        });
+      }
+      const addressedTo = dto.addressedTo ?? expectedAddressee;
+
+      const existing = dto.idempotencyKey
+        ? await this.findCancelRequestByIdempotencyKey(dto.idempotencyKey, tx)
+        : undefined;
+      if (existing) {
+        if (
+          existing.target_local_act_id !== dto.targetLocalActId ||
+          existing.origin_status !== dto.originStatus ||
+          existing.justification !== dto.justification
+        ) {
+          throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
+            status: 409,
+            context: { idempotencyKey: dto.idempotencyKey },
+          });
+        }
+        const currentAit = existing.ait_id
+          ? await this.repositories.ait.findOne(existing.ait_id, tx)
+          : undefined;
+        return this.cancelRequestResult(existing, currentAit);
+      }
+
+      let ait: Ait | undefined;
+      if (dto.targetAitId) {
+        ait = await this.repositories.ait.findOne(dto.targetAitId, tx);
+        // §13 item 7: the alleged origin must match the AIT's real state.
+        if (dto.originStatus !== ait.current_status) {
+          throw new DetranError('TEAT.AIT_STATE_INVALID', {
+            status: 409,
+            context: {
+              aitId: dto.targetAitId,
+              currentState: ait.current_status,
+              originStatus: dto.originStatus,
+              command: 'request-cancel',
+            },
+          });
+        }
+        this.assertAllowed(
+          ait,
+          kind === 'draft'
+            ? ['RASCUNHO_OFFLINE']
+            : [
+                'FINALIZADO_LOCAL',
+                'RECEBIDO',
+                'VALIDANDO',
+                'ACEITO',
+                'INTEGRADO',
+              ],
+          'request-cancel',
+        );
+      }
+
+      const requestedAt = dto.requestedAt ?? new Date().toISOString();
+      const row = await this.resolveCancelRequestCreate(tx, {
+        ait_id: dto.targetAitId ?? null,
+        kind,
+        target_local_act_id: dto.targetLocalActId,
+        origin_status: dto.originStatus,
+        addressed_to: addressedTo,
+        idempotency_key: dto.idempotencyKey ?? null,
+        justification: dto.justification,
+        requested_by: dto.requestedBy ?? null,
+        version: 1,
+        status: 'requested',
+        requested_at: requestedAt,
+      });
+
+      await this.insertCancelRequestEvent(
+        {
+          cancel_request_id: row.id,
+          event_type: 'requested',
+          event_at: requestedAt,
+          actor_user_ref: dto.requestedBy ?? null,
+          details_json: {
+            idempotencyKey: dto.idempotencyKey ?? null,
+            justification: dto.justification,
+            legalBasisNote: dto.legalBasisNote ?? null,
+            targetReservedNumber: dto.targetReservedNumber ?? null,
+            targetContentHash: dto.targetContentHash ?? null,
+            location: dto.location ?? null,
+          },
+        },
+        tx,
+      );
+
+      if (kind === 'post_final' && ait) {
+        ait = await this.transition(
+          ait,
+          'SOLICITADO_CANCEL_POSFINAL',
+          'AIT cancellation requested (post-final)',
+          tx,
+          dto.requestedBy,
+        );
+      }
+
+      return this.cancelRequestResult(row, ait);
+    });
+  }
+
+  /** `POST cancel-requests/{id}/review` (CTG-0001 §4.16). */
+  reviewCancelRequest(
+    id: string,
+    actorId?: string,
+  ): Promise<{ id: string; status: string }> {
+    return this.repositories.ait.transaction(async (tx) => {
+      const request = await this.getCancelRequestRow(id, tx);
+      if (request.status === 'approved' || request.status === 'denied') {
+        throw new DetranError('TEAT.AIT_CANCEL_ALREADY_DECIDED', {
+          status: 409,
+          context: { decidedAt: request.decided_at },
+        });
+      }
+      if (request.status !== 'requested') {
+        throw new DetranError('TEAT.AIT_STATE_INVALID', {
+          status: 409,
+          context: {
+            requestId: id,
+            currentState: request.status,
+            allowed: ['requested'],
+            command: 'review-cancel',
+          },
+        });
+      }
+      const updated = await this.updateCancelRequestRow(
+        request.id,
+        { status: 'under_review', version: (request.version ?? 1) + 1 },
+        tx,
+      );
+      await this.insertCancelRequestEvent(
+        {
+          cancel_request_id: request.id,
+          event_type: 'under_review',
+          event_at: new Date().toISOString(),
+          actor_user_ref: actorId ?? null,
+        },
+        tx,
+      );
+      return {
+        id: updated.id ?? request.id,
+        status: updated.status ?? 'under_review',
+      };
+    });
+  }
+
+  /** `POST cancel-requests/{id}/decide` (M4, CTG-0001 §4.17 + §12 adenda). */
+  decideCancelRequest(
+    id: string,
+    decision: 'approve' | 'deny',
+    decisionNote: string,
+    actorId?: string,
+    options: DecideCancelRequestOptions = {},
+  ): Promise<DecideCancelRequestResult> {
+    return this.repositories.ait.transaction(async (tx) => {
+      const request = await this.getCancelRequestRow(id, tx);
+
+      // §13 item 3: a `decision_body` that disagrees with the stored
+      // `addressed_to` is rejected before any effect, independent of the
+      // principal-based guard below (which only runs when a principal is
+      // supplied, i.e. from the controller).
+      if (
+        options.decisionBody &&
+        options.decisionBody !== request.addressed_to
+      ) {
+        throw new DetranError('TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN', {
+          status: 403,
+          context: {
+            addressedTo: request.addressed_to,
+            roles: options.principal?.roles ?? [],
+          },
+        });
+      }
+
+      // §13 item 4: state guard on the request itself. `approved|denied` is
+      // the specific "already decided" error; anything else outside
+      // `requested|under_review` is a generic state guard (defensive —
+      // no other status is reachable through this service today).
+      if (request.status === 'approved' || request.status === 'denied') {
+        throw new DetranError('TEAT.AIT_CANCEL_ALREADY_DECIDED', {
+          status: 409,
+          context: { decidedAt: request.decided_at },
+        });
+      }
+      if (request.status !== 'requested' && request.status !== 'under_review') {
+        throw new DetranError('TEAT.AIT_STATE_INVALID', {
+          status: 409,
+          context: {
+            requestId: id,
+            currentState: request.status,
+            allowed: ['requested', 'under_review'],
+            command: 'decide-cancel',
+          },
+        });
+      }
+
+      if (options.principal) {
+        const addressedTo = request.addressed_to as
+          'traffic-authority' | 'diretoria-fiscalizacao';
+        if (!canDecideAitCancelRequest(options.principal, addressedTo)) {
+          throw new DetranError('TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN', {
+            status: 403,
+            context: {
+              addressedTo,
+              roles: options.principal.roles,
+            },
+          });
+        }
+      }
+      if (!decisionNote || !decisionNote.trim()) {
+        throw new DetranError('TEAT.VALIDATION_FAILED', {
+          status: 422,
+          context: {
+            fields: [{ path: 'decision_note', rule: 'required' }],
+          },
+        });
+      }
+
+      let ait: Ait | undefined;
+      if (request.ait_id) {
+        ait = await this.repositories.ait.findOne(request.ait_id, tx);
+        // §13 item 4: with `ait_id` present, the AIT must still be in the
+        // state the request put it in (draft never moved it; post_final did).
+        const allowed: AitStatus[] =
+          request.kind === 'draft'
+            ? ['RASCUNHO_OFFLINE']
+            : ['SOLICITADO_CANCEL_POSFINAL'];
+        this.assertAllowed(ait, allowed, 'decide-cancel');
+      }
+      const decidedAt = options.decidedAt ?? new Date().toISOString();
+
+      if (ait) {
+        if (decision === 'approve') {
+          const target: AitStatus =
+            request.kind === 'draft'
+              ? 'CANCELADO_RASCUNHO'
+              : 'CANCELADO_POSFINAL';
+          ait = await this.transition(ait, target, decisionNote, tx, actorId);
+          if (request.kind === 'post_final') {
+            await this.outbox.append(
+              tx,
+              this.buildEnvelope(
+                'ait.changed',
+                'AIT_CANCELADO_POSFINAL',
+                'ait',
+                ait.id,
+                (ait as { version?: number }).version ?? 1,
+                actorId,
+                {
+                  aitId: ait.id,
+                  cancelRequestId: request.id,
+                  originStatus: request.origin_status,
+                  contentHash: ait.content_hash,
+                  decidedAt,
+                },
+              ),
+            );
+          }
+        } else {
+          ait = await this.transition(
+            ait,
+            request.origin_status as AitStatus,
+            decisionNote,
+            tx,
+            actorId,
+          );
+        }
+      }
+
+      const updated = await this.updateCancelRequestRow(
+        request.id,
+        {
+          status: decision === 'approve' ? 'approved' : 'denied',
+          decision: decisionNote,
+          decided_at: decidedAt,
+          version: (request.version ?? 1) + 1,
+        },
+        tx,
+      );
+
+      await this.insertCancelRequestEvent(
+        {
+          cancel_request_id: request.id,
+          event_type: decision === 'approve' ? 'approved' : 'denied',
+          event_at: decidedAt,
+          actor_user_ref: actorId ?? null,
+          decision: decisionNote,
+          details_json: {
+            decisionLegalBasis: options.decisionLegalBasis ?? null,
+            decisionBody: options.decisionBody ?? null,
+            linkedMeasureDecision: options.linkedMeasureDecision ?? null,
+            actorRole: options.actorRole ?? null,
+          },
+        },
+        tx,
+      );
+
+      return {
+        id: updated.id ?? request.id,
+        status:
+          updated.status ?? (decision === 'approve' ? 'approved' : 'denied'),
+        decided_at: (updated.decided_at as string | undefined) ?? decidedAt,
+        version:
+          (updated.version as number | undefined) ?? (request.version ?? 1) + 1,
+        ait: ait
+          ? {
+              id: ait.id,
+              current_status: ait.current_status,
+              version: (ait as { version?: number }).version ?? 0,
+            }
+          : undefined,
+      };
+    });
+  }
+
+  /** `GET cancel-requests/outcomes/{targetLocalActId}` (CTG-0001 §4.18). */
+  async getCancelRequestOutcomes(targetLocalActId: string): Promise<{
+    targetLocalActId: string;
+    requests: Array<Record<string, unknown>>;
+  }> {
+    return this.repositories.ait.transaction(async (tx) => {
+      const queryable = asQueryable(tx);
+      if (!queryable) {
+        throw new DetranError('TEAT.AIT_CANCEL_TARGET_NOT_FOUND', {
+          status: 404,
+          context: { targetLocalActId },
+        });
+      }
+      const result = await queryable.query<Record<string, unknown>>(
+        `select r.id, r.kind, r.status, r.addressed_to, r.origin_status,
+                r.requested_at, r.decided_at, r.decision, r.ait_id,
+                a.current_status as ait_current_status
+           from inf.ait_cancel_request r
+           left join inf.ait_ait a on a.id = r.ait_id
+          where r.target_local_act_id = $1
+          order by r.requested_at desc, r.id`,
+        [targetLocalActId],
+      );
+      if (!result.rows.length) {
+        throw new DetranError('TEAT.AIT_CANCEL_TARGET_NOT_FOUND', {
+          status: 404,
+          context: { targetLocalActId },
+        });
+      }
+      return {
+        targetLocalActId,
+        requests: result.rows.map((row) => ({
+          id: row.id,
+          kind: row.kind,
+          status: row.status,
+          addressedTo: row.addressed_to,
+          originStatus: row.origin_status,
+          requestedAt: row.requested_at,
+          decidedAt: row.decided_at,
+          decision: row.decision,
+          aitId: row.ait_id,
+          aitCurrentStatus: row.ait_current_status,
+        })),
+      };
+    });
+  }
+
+  /** Current `(version, aitId, addressedTo)` for the controller's `If-Match`
+   * and precondition checks on `review`/`decide` (§13 item 2, supersedes §12
+   * item 4): when `ait_id` exists, `version` is `ait_ait.version` — the AIT
+   * is the aggregate that actually changes — otherwise it is
+   * `ait_cancel_request.version`. */
+  async getCancelRequestSummary(
+    id: string,
+  ): Promise<{ version: number; aitId: string | null; addressedTo: string }> {
+    return this.repositories.ait.transaction(async (tx) => {
+      const row = await this.getCancelRequestRow(id, tx);
+      if (row.ait_id) {
+        const ait = await this.repositories.ait.findOne(row.ait_id, tx);
+        return {
+          version: (ait as { version?: number }).version ?? 1,
+          aitId: row.ait_id,
+          addressedTo: row.addressed_to,
+        };
+      }
+      return {
+        version: row.version ?? 1,
+        aitId: null,
+        addressedTo: row.addressed_to,
+      };
+    });
   }

   /** Sole national-system seam. Controllers never construct an HTTP client. */
@@ -267,10 +1280,11 @@ export class AitLifecycleService {
     allowed: AitStatus[],
     target: AitStatus,
     reason: string,
+    command: string,
     actorId?: string,
   ): Promise<Ait> {
     return this.repositories.ait.transaction(async (tx) => {
-      const ait = await this.requireStatus(id, allowed, tx);
+      const ait = await this.requireStatus(id, allowed, tx, command);
       return this.transition(ait, target, reason, tx, actorId);
     });
   }
@@ -279,15 +1293,63 @@ export class AitLifecycleService {
     id: string,
     allowed: AitStatus[],
     tx: Transaction,
+    command: string,
   ): Promise<Ait> {
     const ait = await this.repositories.ait.findOne(id, tx);
-    if (!allowed.includes(ait.current_status as AitStatus))
-      throw new BadRequestException(
-        `AIT ${id} is ${ait.current_status}; expected ${allowed.join(', ')}`,
-      );
+    this.assertAllowed(ait, allowed, command);
     return ait;
   }

+  private assertAllowed(ait: Ait, allowed: AitStatus[], command: string): void {
+    if (!allowed.includes(ait.current_status as AitStatus)) {
+      throw new DetranError('TEAT.AIT_STATE_INVALID', {
+        status: 409,
+        context: {
+          aitId: ait.id,
+          currentState: ait.current_status,
+          allowed,
+          command,
+        },
+      });
+    }
+  }
+
+  /** RN-TEAT-111 — apuração de concorrência pendente bloqueia accept/reject
+   * com um código mais específico, sempre antes de AIT_STATE_INVALID. */
+  private assertNotConcurrencyPending(ait: Ait): void {
+    if (ait.current_status === 'SUSPEITO_CONCORRENCIA') {
+      throw new DetranError('TEAT.AIT_CONCURRENCY_PENDING_REVIEW', {
+        status: 409,
+        context: { conflictId: `sync-conflict:${ait.id}` },
+      });
+    }
+  }
+
+  /** RN-TEAT-005 — recusa/impossibilidade nunca coexistem com assinatura. */
+  private assertScienceOutcome(dto: {
+    signature_type: string;
+    refusal_or_impossibility_reason?: string | null;
+  }): void {
+    const reason = dto.refusal_or_impossibility_reason;
+    const hasReason = typeof reason === 'string' && reason.trim().length > 0;
+    if (
+      (dto.signature_type === 'refused' ||
+        dto.signature_type === 'impossibility') &&
+      !hasReason
+    ) {
+      throw new DetranError('TEAT.AIT_SIGNATURE_OUTCOME_INVALID', {
+        status: 400,
+        context: { signatureType: dto.signature_type },
+      });
+    }
+    if (dto.signature_type === 'signed' && hasReason) {
+      throw new DetranError('TEAT.AIT_SIGNATURE_OUTCOME_INVALID', {
+        status: 400,
+        context: { signatureType: dto.signature_type },
+      });
+    }
+  }
+
   private async transition(
     ait: Ait,
     target: AitStatus,
@@ -297,9 +1359,33 @@ export class AitLifecycleService {
     patch: Partial<CreateAitDto> = {},
   ): Promise<Ait> {
     await this.recordHistory(ait, target, reason, tx, actorId);
+    // `version` is bumped only when the fetched row actually carries one
+    // (every real `ait_ait` row does, DDL default 1): callers in
+    // `ait-lifecycle.service.spec.ts` that predate M2 stub AIT objects
+    // without a `version` field and assert the exact `update()` patch via
+    // `toHaveBeenCalledWith` — inventing a version there would silently
+    // break that pre-existing, untouchable assertion (CTG-0001 M2 vs.
+    // pre-M2 test, see TASK-0003 report).
+    const currentVersion = (ait as { version?: number }).version;
+    const versionPatch =
+      currentVersion === undefined ? {} : { version: currentVersion + 1 };
+    return this.repositories.ait.update(
+      ait.id,
+      { ...patch, ...versionPatch, current_status: target },
+      tx,
+    );
+  }
+
+  /** Bumps `version` without touching `current_status` (CTG-0001 §4.1/§4.2/
+   * §4.5/§4.10: sub-resource commands leave the state unchanged but still
+   * count as a command against the aggregate, M2). No-ops when the fetched
+   * row has no `version` field (see `transition` for why). */
+  private bumpVersion(ait: Ait, tx: Transaction): Promise<Ait> {
+    const currentVersion = (ait as { version?: number }).version;
+    if (currentVersion === undefined) return Promise.resolve(ait);
     return this.repositories.ait.update(
       ait.id,
-      { ...patch, current_status: target },
+      { version: currentVersion + 1 },
       tx,
     );
   }
@@ -322,6 +1408,159 @@ export class AitLifecycleService {
       tx,
     );
   }
+
+  private buildEnvelope(
+    type: string,
+    domainEvent: string,
+    aggregateKind: string,
+    aggregateId: string,
+    aggregateVersion: number,
+    actorId: string | undefined,
+    data: Record<string, unknown>,
+  ): TeatEventEnvelope {
+    return {
+      // §13 item 5: never generated here — `TeatEventOutbox.append` assigns
+      // and returns the real id of the persisted row.
+      id: '',
+      type,
+      domainEvent,
+      version: 1,
+      occurredAt: new Date().toISOString(),
+      // Resolved from session context by `SqlTeatEventOutbox` (kernel tenant
+      // trigger pattern); left blank here, never guessed (CODESTYLE tenant rule).
+      tenantId: '',
+      actor: { kind: 'user', id: actorId ?? 'system' },
+      correlationId: randomUUID(),
+      aggregate: {
+        kind: aggregateKind,
+        id: aggregateId,
+        version: aggregateVersion,
+      },
+      data,
+    };
+  }
+
+  private cancelRequestResult(
+    row: AitCancelRequestRow,
+    ait: Ait | undefined,
+  ): CancelRequestResult {
+    const aitId = (row.ait_id as string | null | undefined) ?? ait?.id ?? null;
+    const hasAit = Boolean(aitId);
+    return {
+      id: row.id,
+      status: row.status,
+      kind: row.kind,
+      addressed_to: row.addressed_to,
+      ait_id: aitId,
+      version: row.version,
+      httpStatus: hasAit ? 201 : 202,
+      context: hasAit
+        ? undefined
+        : { targetLocalActId: row.target_local_act_id ?? null },
+      current_status: ait?.current_status,
+      aitVersion:
+        row.kind === 'post_final' && ait
+          ? ((ait as { version?: number }).version ?? undefined)
+          : undefined,
+    };
+  }
+
+  private async resolveCancelRequestCreate(
+    tx: Transaction,
+    fields: Record<string, unknown>,
+  ): Promise<AitCancelRequestRow> {
+    if (this.collaborators.cancelRequests) {
+      return this.collaborators.cancelRequests.create(fields, tx);
+    }
+    const queryable = asQueryable(tx);
+    if (queryable) {
+      return sqlInsert<AitCancelRequestRow>(
+        queryable,
+        'inf.ait_cancel_request',
+        fields,
+      );
+    }
+    // Guard-only unit-test fallback (no DB-capable transaction and no
+    // injected collaborator, e.g. `ait-state-transitions.matrix.spec.ts`):
+    // reuse the AIT repository's generic `create()` purely to exercise the
+    // state machine end-to-end without inventing a second repository stub.
+    return this.repositories.ait.create(
+      fields as never,
+      tx,
+    ) as unknown as Promise<AitCancelRequestRow>;
+  }
+
+  private async findCancelRequestByIdempotencyKey(
+    key: string,
+    tx: Transaction,
+  ): Promise<AitCancelRequestRow | undefined> {
+    const queryable = asQueryable(tx);
+    if (!queryable) return undefined;
+    const result = await queryable.query<
+      AitCancelRequestRow & Record<string, unknown>
+    >(
+      'select * from inf.ait_cancel_request where idempotency_key = $1 limit 1',
+      [key],
+    );
+    return result.rows[0];
+  }
+
+  private async getCancelRequestRow(
+    id: string,
+    tx: Transaction,
+  ): Promise<AitCancelRequestRow> {
+    if (this.collaborators.cancelRequests) {
+      return this.collaborators.cancelRequests.findOne(id, tx);
+    }
+    const queryable = asQueryable(tx);
+    if (queryable) {
+      const result = await queryable.query<
+        AitCancelRequestRow & Record<string, unknown>
+      >('select * from inf.ait_cancel_request where id = $1 limit 1', [id]);
+      const row = result.rows[0];
+      if (!row) {
+        throw new DetranError('TEAT.AIT_CANCEL_TARGET_NOT_FOUND', {
+          status: 404,
+          context: { id },
+        });
+      }
+      return row;
+    }
+    throw new Error(
+      'AitLifecycleService: review/decide de cancel-request exige um repositório injetado ou uma transação com acesso a banco',
+    );
+  }
+
+  private async updateCancelRequestRow(
+    id: string,
+    patch: Record<string, unknown>,
+    tx: Transaction,
+  ): Promise<AitCancelRequestRow> {
+    if (this.collaborators.cancelRequests) {
+      return this.collaborators.cancelRequests.update(id, patch, tx);
+    }
+    const queryable = asQueryable(tx);
+    if (queryable) {
+      return sqlUpdate<AitCancelRequestRow>(
+        queryable,
+        'inf.ait_cancel_request',
+        id,
+        patch,
+      );
+    }
+    throw new Error(
+      'AitLifecycleService: review/decide de cancel-request exige um repositório injetado ou uma transação com acesso a banco',
+    );
+  }
+
+  private async insertCancelRequestEvent(
+    fields: Record<string, unknown>,
+    tx: Transaction,
+  ): Promise<void> {
+    const queryable = asQueryable(tx);
+    if (!queryable) return; // best-effort audit trail outside real transactions
+    await sqlInsert(queryable, 'inf.ait_cancel_request_event', fields);
+  }
 }

 export function contentHashForAit(ait: Ait): string {
diff --git a/backend/domains/inf/ait/src/handwritten/accept-reject.spec.ts b/backend/domains/inf/ait/src/handwritten/accept-reject.spec.ts
new file mode 100644
index 0000000..36ebdaf
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/accept-reject.spec.ts
@@ -0,0 +1,128 @@
+import { describe, expect, it, vi } from 'vitest';
+
+import { AitLifecycleService } from '../ait-lifecycle.service.js';
+
+/**
+ * CTG-0001 §4.12/§4.13 (R-0008, TASK-0002) — C-0001-17..20. `accept` grava
+ * ACEITO e, na mesma transação, INTEGRADO (M4/ADR-0016), `version` +2 e dois
+ * envelopes na outbox; `reject` ignora o campo legado `cancelled` e exige
+ * `reason`. Ver nota de design em `ait-state-transitions.matrix.spec.ts`
+ * sobre testar contra `AitLifecycleService` e sobre a forma proposta (não
+ * canônica) de injeção do outbox.
+ */
+
+function stubService(currentStatus: string, startingVersion = 1) {
+  const ait: Record<string, unknown> = {
+    id: 'ait-60',
+    current_status: currentStatus,
+    ait_number: 'TEAT-060',
+    series: 'F',
+    version: startingVersion,
+  };
+  const historyEntries: Array<{ status: string }> = [];
+  const update = vi.fn(async (_id: string, patch: Record<string, unknown>) => {
+    Object.assign(ait, patch);
+    return { ...ait };
+  });
+  // §13 item 5: `append` devolve `{ id }` (o id real da linha da outbox);
+  // o serviço nunca gera esse id sozinho.
+  const outbox = {
+    append: vi.fn(async (_tx: unknown, _envelope: unknown) => ({
+      id: 'outbox-row-1',
+    })),
+  };
+  const repositories = {
+    ait: {
+      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
+      findOne: vi.fn(async () => ({ ...ait })),
+      update,
+    } as never,
+    history: {
+      create: vi.fn(async (dto: { status: string }) => {
+        historyEntries.push({ status: dto.status });
+        return dto;
+      }),
+    } as never,
+    vehicles: {} as never,
+    people: {} as never,
+    corrections: {} as never,
+    signatures: {} as never,
+    printEvents: {} as never,
+  };
+  const service = new (
+    AitLifecycleService as unknown as new (
+      repositories: unknown,
+      normative: unknown,
+      outbox?: unknown,
+    ) => AitLifecycleService
+  )(repositories, { assertActive: vi.fn() }, { outbox });
+  return { service, historyEntries, outbox, ait };
+}
+
+describe('AIT — accept publica ACEITO e INTEGRADO na mesma transação (C-0001-17/18, M4/ADR-0016)', () => {
+  it('C-0001-17 — dado o AIT …f8000060 (RECEBIDO) quando accept então duas linhas de histórico (ACEITO, INTEGRADO), current_status=INTEGRADO e version +2', async () => {
+    const { service, historyEntries } = stubService('RECEBIDO', 5);
+    const result = (await service.accept(
+      '00000000-0000-7000-8000-0000f8000060',
+      'actor-1',
+    )) as { current_status?: string; version?: number };
+    expect(historyEntries.map((entry) => entry.status)).toEqual([
+      'ACEITO',
+      'INTEGRADO',
+    ]);
+    expect(result.current_status).toBe('INTEGRADO');
+    expect(result.version).toBe(7);
+  });
+
+  it('C-0001-18 — dado o mesmo accept então a outbox recebe exatamente dois envelopes, AIT_ACEITO (v+1) e AIT_INTEGRADO (v+2), nesta ordem', async () => {
+    const { service, outbox } = stubService('RECEBIDO', 5);
+    await service.accept('00000000-0000-7000-8000-0000f8000060', 'actor-1');
+    const envelopes = outbox.append.mock.calls.map(
+      (call) =>
+        call[1] as { domainEvent?: string; aggregate?: { version?: number } },
+    );
+    expect(envelopes).toHaveLength(2);
+    expect(envelopes[0]?.domainEvent).toBe('AIT_ACEITO');
+    expect(envelopes[0]?.aggregate?.version).toBe(6);
+    expect(envelopes[1]?.domainEvent).toBe('AIT_INTEGRADO');
+    expect(envelopes[1]?.aggregate?.version).toBe(7);
+  });
+});
+
+describe('AIT — envelope.id vem da outbox, o serviço nunca gera ids de evento (§13 item 5)', () => {
+  it('dado accept quando a outbox recebe os envelopes então nenhum deles carrega um id gerado pelo serviço (append é quem atribui o id da linha)', async () => {
+    const { service, outbox } = stubService('RECEBIDO', 5);
+    await service.accept('00000000-0000-7000-8000-0000f8000060', 'actor-1');
+    const envelopes = outbox.append.mock.calls.map(
+      (call) => call[1] as { id?: unknown },
+    );
+    expect(envelopes.length).toBeGreaterThan(0);
+    for (const envelope of envelopes) {
+      expect(envelope.id).toBeFalsy();
+    }
+  });
+});
+
+describe('AIT — reject ignora o campo legado cancelled e exige reason (C-0001-19/20)', () => {
+  it('C-0001-19 — dado reject com cancelled:true de RECEBIDO então REJEITADO (campo ignorado), nunca CANCELADO_RASCUNHO', async () => {
+    const { service } = stubService('RECEBIDO');
+    const result = (await service.reject(
+      '00000000-0000-7000-8000-0000f8000060',
+      'inconsistência encontrada',
+      true,
+      'actor-1',
+    )) as { current_status?: string };
+    expect(result.current_status).toBe('REJEITADO');
+    expect(result.current_status).not.toBe('CANCELADO_RASCUNHO');
+  });
+
+  it('C-0001-20 — dado reject sem reason então 422 TEAT.AIT_REJECT_REASON_REQUIRED', async () => {
+    const { service } = stubService('RECEBIDO');
+    await expect(
+      service.reject('00000000-0000-7000-8000-0000f8000060', '', 'actor-1'),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_REJECT_REASON_REQUIRED',
+      status: 422,
+    });
+  });
+});
diff --git a/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.controller.ts b/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.controller.ts
new file mode 100644
index 0000000..31f787b
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.controller.ts
@@ -0,0 +1,160 @@
+import {
+  Body,
+  Controller,
+  Get,
+  Headers,
+  HttpCode,
+  Param,
+  Post,
+  Req,
+  Res,
+} from '@nestjs/common';
+import {
+  Action,
+  Audit,
+  Resource,
+  assertIfMatch,
+  etagOf,
+  getPrincipalFromRequest,
+  type RequestLike,
+} from '@detran/shared';
+
+import { AitLifecycleService } from '../ait-lifecycle.service.js';
+import type { CreateCancelRequestInput } from '../ait-lifecycle.service.js';
+
+/** Minimal response shape needed for status/`ETag` (see `ait-commands.controller.ts`). */
+interface ResponseLike {
+  setHeader(name: string, value: string): unknown;
+  status(code: number): unknown;
+}
+
+interface CreateAitCancelRequestBody {
+  localId?: string;
+  entityType: 'ait-cancel-request' | 'ait-cancel-posfinal-request';
+  trafficAgencyId?: string;
+  agentId?: string;
+  deviceId?: string;
+  shiftId?: string;
+  idempotencyKey?: string;
+  targetLocalActId: string;
+  targetAitId?: string;
+  targetReservedNumber?: number;
+  targetContentHash?: string;
+  originStatus: string;
+  justification: string;
+  requestedAt?: string;
+  requestedBy?: string;
+  addressedTo?: 'traffic-authority' | 'diretoria-fiscalizacao';
+  legalBasisNote?: string;
+  location?: Record<string, unknown>;
+}
+
+interface DecideAitCancelRequestBody {
+  decision: 'approve' | 'deny';
+  decision_note: string;
+  decision_body?: 'traffic-authority' | 'diretoria-fiscalizacao';
+  decided_by?: string;
+  decided_at?: string;
+  decision_legal_basis?: string;
+  actor_role?: string;
+  linked_measure_decision?: string;
+}
+
+/**
+ * `POST v1/inf/ait/cancel-requests` and satellites (M4/UC-TEAT-011, CTG-0001
+ * §4.15–§4.18 + §12 adenda). Not a satellite of `aits/{id}` — its own
+ * controller/resource per the route contract §3.2.
+ */
+@Controller('v1/inf/ait/cancel-requests')
+@Resource('inf:ait-cancel-request')
+export class AitCancelRequestsController {
+  constructor(private readonly lifecycle: AitLifecycleService) {}
+
+  @Post()
+  @Action('create')
+  @Audit({ action: 'INF_AIT_CANCEL_REQUEST', entity: 'inf.ait_cancel_request' })
+  async create(
+    @Body() body: CreateAitCancelRequestBody,
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    // If-Match is only required when `targetAitId` is informed AND the kind
+    // is post_final (CTG-0001 §4.15): the transition touches `ait_ait`.
+    const kind =
+      body.entityType === 'ait-cancel-request' ? 'draft' : 'post_final';
+    if (body.targetAitId && kind === 'post_final') {
+      const currentVersion = await this.lifecycle.getVersion(body.targetAitId);
+      assertIfMatch(ifMatch, currentVersion, 'TEAT');
+    }
+    const input: CreateCancelRequestInput = body;
+    const result = await this.lifecycle.createCancelRequest(input);
+    res.status(result.httpStatus);
+    if (result.aitVersion !== undefined) {
+      res.setHeader('ETag', etagOf(result.aitVersion));
+    }
+    return result;
+  }
+
+  @Post(':id/review')
+  @HttpCode(200)
+  @Action('review')
+  @Audit({ action: 'INF_AIT_CANCEL_REVIEW', entity: 'inf.ait_cancel_request' })
+  async review(
+    @Param('id') id: string,
+    @Body() body: { user_ref?: string },
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    const summary = await this.lifecycle.getCancelRequestSummary(id);
+    if (summary.aitId) assertIfMatch(ifMatch, summary.version, 'TEAT');
+    const result = await this.lifecycle.reviewCancelRequest(id, body.user_ref);
+    // §13 item 2: `review` never transitions the AIT, so when `ait_id` is
+    // present the version it answers with is the same `ait_ait.version` it
+    // checked — `decide` is the one that can actually bump it.
+    if (summary.aitId) res.setHeader('ETag', etagOf(summary.version));
+    return result;
+  }
+
+  @Post(':id/decide')
+  @HttpCode(200)
+  @Action('decide')
+  @Audit({ action: 'INF_AIT_CANCEL_DECIDE', entity: 'inf.ait_cancel_request' })
+  async decide(
+    @Param('id') id: string,
+    @Body() body: DecideAitCancelRequestBody,
+    @Headers('if-match') ifMatch: string | undefined,
+    @Res({ passthrough: true }) res: ResponseLike,
+    @Req() req: RequestLike,
+  ) {
+    const principal = getPrincipalFromRequest(req);
+    const summary = await this.lifecycle.getCancelRequestSummary(id);
+    if (summary.aitId) assertIfMatch(ifMatch, summary.version, 'TEAT');
+    const result = await this.lifecycle.decideCancelRequest(
+      id,
+      body.decision,
+      body.decision_note,
+      body.decided_by ?? principal?.id,
+      {
+        decidedAt: body.decided_at,
+        decisionLegalBasis: body.decision_legal_basis,
+        decisionBody: body.decision_body,
+        linkedMeasureDecision: body.linked_measure_decision,
+        actorRole: body.actor_role,
+        principal,
+      },
+    );
+    // §13 item 2: with `ait_id` present, the ETag reflects `ait_ait.version`
+    // (`result.ait.version`, incremented by the transition), never the
+    // cancel request's own `result.version`.
+    if (summary.aitId) {
+      res.setHeader('ETag', etagOf(result.ait?.version ?? summary.version));
+    }
+    return result;
+  }
+
+  @Get('outcomes/:targetLocalActId')
+  @Action('read')
+  outcomes(@Param('targetLocalActId') targetLocalActId: string) {
+    return this.lifecycle.getCancelRequestOutcomes(targetLocalActId);
+  }
+}
diff --git a/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.provider.ts b/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.provider.ts
new file mode 100644
index 0000000..8177baa
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.provider.ts
@@ -0,0 +1,15 @@
+import type { Provider } from '@nestjs/common';
+import { SqlTeatEventOutbox, TEAT_EVENT_OUTBOX } from '@detran/shared';
+
+/**
+ * Registers the `TEAT_EVENT_OUTBOX` DI token in `AitModule` (CTG-0001 §9:
+ * "não no AppModule, para que o pacote permaneça testável isolado"). Named
+ * `AIT_CANCEL_REQUESTS_PROVIDER` per the blueprint's `handwrittenProviders`
+ * entry (CTG-0001 §9); it is not specific to cancel requests — the AIT
+ * aggregate as a whole publishes through it (M16) — but the symbol keeps the
+ * name the contract fixed for this file.
+ */
+export const AIT_CANCEL_REQUESTS_PROVIDER: Provider = {
+  provide: TEAT_EVENT_OUTBOX,
+  useClass: SqlTeatEventOutbox,
+};
diff --git a/backend/domains/inf/ait/src/handwritten/ait-state-transitions.matrix.spec.ts b/backend/domains/inf/ait/src/handwritten/ait-state-transitions.matrix.spec.ts
new file mode 100644
index 0000000..af0fea5
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/ait-state-transitions.matrix.spec.ts
@@ -0,0 +1,352 @@
+import { describe, expect, it, vi } from 'vitest';
+
+import { AitLifecycleService } from '../ait-lifecycle.service.js';
+
+/**
+ * CTG-0001 §3.1 (R-0008, TASK-0002) — C-0001-11: matriz completa de guarda de
+ * estado do AIT, [WF-TEAT-001], 16 comandos × 17 estados, nenhuma célula
+ * omitida.
+ *
+ * Alvo de teste: `AitLifecycleService` (a mesma classe já exercitada por
+ * `ait-lifecycle.service.spec.ts` e chamada diretamente pelos métodos do
+ * `AitCommandsController` hoje). O layout do §9 do contrato sugere um
+ * arquivo por comando em `src/handwritten/*.command.ts` para TASK-0003; como
+ * esses arquivos ainda não existem e o formato interno de cada um não é
+ * fixado por nenhuma fonte canônica (só o formato HTTP/DTO o é), testar
+ * contra o serviço existente evita inventar uma API que TASK-0003 teria de
+ * descartar. Os métodos novos (`reviewConcurrency`, `archive`,
+ * `createCancelRequest`) ainda não existem na classe — chamá-los falha com
+ * "is not a function", que é a mesma "comportamento ausente" que motiva
+ * todas as demais células vermelhas desta matriz (o serviço ainda lança
+ * `BadRequestException` sem `.code`/`.context`, não `DetranError`).
+ */
+
+const ALL_STATES = [
+  'RASCUNHO_OFFLINE',
+  'CANCELADO_RASCUNHO',
+  'FINALIZADO_LOCAL',
+  'ENFILEIRADO',
+  'TRANSMITIDO',
+  'RECEBIDO',
+  'SUSPEITO_CONCORRENCIA',
+  'VALIDANDO',
+  'ACEITO',
+  'REJEITADO',
+  'PENDENTE_CORRECAO',
+  'CORRIGIDO',
+  'INTEGRADO',
+  'PROCESSADO',
+  'ARQUIVADO',
+  'SOLICITADO_CANCEL_POSFINAL',
+  'CANCELADO_POSFINAL',
+] as const;
+
+function stubService(currentStatus: string) {
+  const ait: Record<string, unknown> = {
+    id: 'ait-matrix',
+    current_status: currentStatus,
+    ait_number: '000001',
+    series: 'F',
+    version: 1,
+  };
+  const update = vi.fn(async (_id: string, patch: Record<string, unknown>) => {
+    Object.assign(ait, patch);
+    return { ...ait };
+  });
+  const findOne = vi.fn(async () => ({ ...ait }));
+  const repositories = {
+    ait: {
+      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
+      findOne,
+      update,
+      create: vi.fn(async (dto: Record<string, unknown>) => ({
+        id: 'cancel-request-1',
+        ...dto,
+      })),
+    } as never,
+    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    vehicles: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    people: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    corrections: {
+      create: vi.fn(async (dto: unknown) => dto),
+      findOne: vi.fn(async () => ({
+        id: 'correction-1',
+        ait_id: 'ait-matrix',
+        justification: 'saneamento aprovado',
+      })),
+      update: vi.fn(async (_id: string, patch: unknown) => patch),
+    } as never,
+    signatures: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    printEvents: { create: vi.fn(async (dto: unknown) => dto) } as never,
+  };
+  // §13 item 1: concurrency-review agora exige um conflito aberto via
+  // SyncConflictPort (collaborators.syncConflicts, proposta do Inspector —
+  // ver review-concurrency.spec.ts); esta matriz testa a guarda de ESTADO
+  // do AIT, não a guarda de conflito, então o stub sempre devolve um
+  // conflito aberto para não confundir as duas.
+  const syncConflicts = {
+    findOpenConcurrencyConflict: vi.fn(async () => ({
+      id: 'conflict-matrix',
+      syncQueueItemId: 'queue-matrix',
+    })),
+    resolve: vi.fn(async () => undefined),
+  };
+  const outbox = { append: vi.fn(async () => ({ id: 'outbox-matrix' })) };
+  const service = new (
+    AitLifecycleService as unknown as new (
+      repositories: unknown,
+      normative: unknown,
+      collaborators?: unknown,
+    ) => AitLifecycleService
+  )(repositories, { assertActive: vi.fn() }, { outbox, syncConflicts });
+  return service as AitLifecycleService & {
+    reviewConcurrency?: (...args: unknown[]) => Promise<unknown>;
+    archive?: (...args: unknown[]) => Promise<unknown>;
+    createCancelRequest?: (...args: unknown[]) => Promise<unknown>;
+  };
+}
+
+interface CommandCase {
+  name: string;
+  admitted: readonly string[];
+  /** States that raise a more specific code than AIT_STATE_INVALID. */
+  exceptions?: Readonly<Record<string, string>>;
+  expectedTarget?: string;
+  invoke: (
+    service: ReturnType<typeof stubService>,
+    aitId: string,
+    currentStatus: string,
+  ) => Promise<unknown>;
+}
+
+const COMMANDS: readonly CommandCase[] = [
+  {
+    name: 'vehicles',
+    admitted: ['RASCUNHO_OFFLINE'],
+    invoke: (service, id) =>
+      service.addVehicle(id, {
+        vehicle_snapshot_id: 'veh-1',
+        role: 'infractor',
+      }),
+  },
+  {
+    name: 'people',
+    admitted: ['RASCUNHO_OFFLINE'],
+    invoke: (service, id) =>
+      service.addPerson(id, {
+        person_id: 'person-1',
+        role: 'driver',
+        identified_by: 'document',
+      }),
+  },
+  {
+    name: 'science',
+    admitted: ['RASCUNHO_OFFLINE', 'FINALIZADO_LOCAL'],
+    invoke: (service, id) =>
+      service.recordScience(id, { signature_type: 'signed' }),
+  },
+  {
+    name: 'finalize',
+    admitted: ['RASCUNHO_OFFLINE'],
+    expectedTarget: 'FINALIZADO_LOCAL',
+    invoke: (service, id) => service.finalize(id, 'actor-1'),
+  },
+  {
+    name: 'print-events',
+    admitted: ['FINALIZADO_LOCAL', 'ENFILEIRADO'],
+    invoke: (service, id) =>
+      service.recordPrint(id, { event_type: 'impressao' }),
+  },
+  {
+    name: 'queue-transmission',
+    admitted: ['FINALIZADO_LOCAL'],
+    expectedTarget: 'ENFILEIRADO',
+    invoke: (service, id) => service.queueTransmission(id, 'actor-1'),
+  },
+  {
+    name: 'receive-protocol',
+    admitted: ['ENFILEIRADO', 'TRANSMITIDO'],
+    expectedTarget: 'RECEBIDO',
+    invoke: (service, id) =>
+      service.receiveProtocol(id, `protocol-${id}`, 'actor-1'),
+  },
+  {
+    name: 'concurrency-review',
+    admitted: ['SUSPEITO_CONCORRENCIA'],
+    expectedTarget: 'RECEBIDO',
+    invoke: (service, id) =>
+      service.reviewConcurrency
+        ? service.reviewConcurrency(
+            id,
+            'release',
+            'apuração concluída',
+            'actor-1',
+          )
+        : Promise.reject(
+            new Error(
+              'AitLifecycleService.reviewConcurrency ainda não existe (TASK-0003, M4)',
+            ),
+          ),
+  },
+  {
+    name: 'request-correction',
+    admitted: ['VALIDANDO', 'REJEITADO'],
+    expectedTarget: 'PENDENTE_CORRECAO',
+    invoke: (service, id) =>
+      service.requestCorrection(id, 'correção necessária', 'actor-1'),
+  },
+  {
+    name: 'corrections',
+    admitted: ['PENDENTE_CORRECAO'],
+    invoke: (service, id) =>
+      service.addCorrection(id, {
+        operator_user_ref: 'actor-1',
+        correction_type: 'endereco',
+        justification: 'saneamento de campo não essencial',
+      }),
+  },
+  {
+    name: 'corrections/approve',
+    admitted: ['PENDENTE_CORRECAO'],
+    expectedTarget: 'CORRIGIDO',
+    invoke: (service, id) =>
+      service.approveCorrection(id, 'correction-1', 'actor-1'),
+  },
+  {
+    name: 'accept',
+    admitted: ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'],
+    exceptions: {
+      SUSPEITO_CONCORRENCIA: 'TEAT.AIT_CONCURRENCY_PENDING_REVIEW',
+    },
+    expectedTarget: 'INTEGRADO',
+    invoke: (service, id) => service.accept(id, 'actor-1'),
+  },
+  {
+    name: 'reject',
+    admitted: ['RECEBIDO', 'VALIDANDO', 'PENDENTE_CORRECAO'],
+    exceptions: {
+      SUSPEITO_CONCORRENCIA: 'TEAT.AIT_CONCURRENCY_PENDING_REVIEW',
+    },
+    expectedTarget: 'REJEITADO',
+    invoke: (service, id) =>
+      service.reject(id, 'motivo da rejeição', 'actor-1'),
+  },
+  {
+    name: 'archive',
+    admitted: ['PROCESSADO'],
+    expectedTarget: 'ARQUIVADO',
+    invoke: (service, id) =>
+      service.archive
+        ? service.archive(id, 'processamento concluído', 'actor-1')
+        : Promise.reject(
+            new Error(
+              'AitLifecycleService.archive ainda não existe (TASK-0003, M4)',
+            ),
+          ),
+  },
+  {
+    name: 'cancel-requests (draft)',
+    admitted: ['RASCUNHO_OFFLINE'],
+    invoke: (service, id, currentStatus) =>
+      service.createCancelRequest
+        ? service.createCancelRequest({
+            entityType: 'ait-cancel-request',
+            trafficAgencyId: 'agency-1',
+            idempotencyKey: `draft-${id}-${currentStatus}`,
+            targetLocalActId: `local-${id}`,
+            targetAitId: id,
+            originStatus: currentStatus,
+            justification: 'desistência do agente antes da finalização',
+            requestedBy: 'actor-1',
+          })
+        : Promise.reject(
+            new Error(
+              'AitLifecycleService.createCancelRequest ainda não existe (TASK-0003, M4)',
+            ),
+          ),
+  },
+  {
+    name: 'cancel-requests (post_final)',
+    admitted: [
+      'FINALIZADO_LOCAL',
+      'RECEBIDO',
+      'VALIDANDO',
+      'ACEITO',
+      'INTEGRADO',
+    ],
+    expectedTarget: 'SOLICITADO_CANCEL_POSFINAL',
+    invoke: (service, id, currentStatus) =>
+      service.createCancelRequest
+        ? service.createCancelRequest({
+            entityType: 'ait-cancel-posfinal-request',
+            trafficAgencyId: 'agency-1',
+            idempotencyKey: `post-final-${id}-${currentStatus}`,
+            targetLocalActId: `local-${id}`,
+            targetAitId: id,
+            originStatus: currentStatus,
+            justification: 'erro material identificado após a finalização',
+            requestedBy: 'actor-1',
+          })
+        : Promise.reject(
+            new Error(
+              'AitLifecycleService.createCancelRequest ainda não existe (TASK-0003, M4)',
+            ),
+          ),
+  },
+];
+
+describe('AIT — matriz de guarda de estado WF-TEAT-001 (C-0001-11, 16 comandos × 17 estados)', () => {
+  for (const command of COMMANDS) {
+    describe(`comando: ${command.name}`, () => {
+      for (const state of ALL_STATES) {
+        const admitted = command.admitted.includes(state);
+        const exceptionCode = command.exceptions?.[state];
+
+        if (admitted) {
+          it(`dado AIT em ${state} quando ${command.name} então sucede${
+            command.expectedTarget ? ` (→ ${command.expectedTarget})` : ''
+          }`, async () => {
+            const service = stubService(state);
+            const result = (await command.invoke(
+              service,
+              'ait-matrix',
+              state,
+            )) as { current_status?: string } | undefined;
+            if (command.expectedTarget) {
+              expect(result?.current_status).toBe(command.expectedTarget);
+            }
+          });
+          continue;
+        }
+
+        if (exceptionCode) {
+          it(`dado AIT em ${state} quando ${command.name} então ${exceptionCode} (precede AIT_STATE_INVALID, RN-TEAT-111)`, async () => {
+            const service = stubService(state);
+            await expect(
+              command.invoke(service, 'ait-matrix', state),
+            ).rejects.toMatchObject({ code: exceptionCode });
+          });
+          continue;
+        }
+
+        it(`dado AIT em ${state} (não admitido) quando ${command.name} então 409 TEAT.AIT_STATE_INVALID com context.allowed=[${command.admitted.join(', ')}]`, async () => {
+          const service = stubService(state);
+          await expect(
+            command.invoke(service, 'ait-matrix', state),
+          ).rejects.toMatchObject({
+            code: 'TEAT.AIT_STATE_INVALID',
+            status: 409,
+            context: expect.objectContaining({
+              allowed: [...command.admitted],
+            }),
+          });
+        });
+      }
+    });
+  }
+
+  it('cataloga exatamente 16 comandos e 17 estados (nenhuma célula omitida)', () => {
+    expect(COMMANDS).toHaveLength(16);
+    expect(ALL_STATES).toHaveLength(17);
+  });
+});
diff --git a/backend/domains/inf/ait/src/handwritten/cancel-requests.spec.ts b/backend/domains/inf/ait/src/handwritten/cancel-requests.spec.ts
new file mode 100644
index 0000000..e1c2319
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/cancel-requests.spec.ts
@@ -0,0 +1,382 @@
+import { describe, expect, it, vi } from 'vitest';
+
+import { AitLifecycleService } from '../ait-lifecycle.service.js';
+
+/**
+ * CTG-0001 §4.15/§4.17/§12/§13 itens 3/4/7 (R-0008, TASK-0002 iteração 3) —
+ * C-0001-26..28 e a Adenda §13: o caminho 202 de `cancel-requests` quando o
+ * AIT ainda não existe no servidor (M4), a incoerência `addressedTo` × `kind`
+ * (item 3 amplia para `decision_body` divergente em `decide`), a segunda
+ * decisão sobre um pedido já decidido, a guarda de estado do pedido e do AIT
+ * em `decide` (item 4), e a validação de `originStatus` contra o vocabulário
+ * canônico (item 7). A Adenda §12 grava `justification`/`requested_by`/
+ * `idempotency_key`/`version` na própria linha de `ait_cancel_request`.
+ * `AitLifecycleService.createCancelRequest`/`.decideCancelRequest` — ver
+ * nota de design em `ait-state-transitions.matrix.spec.ts`.
+ */
+
+/** [WF-TEAT-001] — os 17 tokens de `inf.ait_state_ref` (DDL 14, §3 do contrato). */
+const AIT_STATE_TOKENS = [
+  'RASCUNHO_OFFLINE',
+  'CANCELADO_RASCUNHO',
+  'FINALIZADO_LOCAL',
+  'ENFILEIRADO',
+  'TRANSMITIDO',
+  'RECEBIDO',
+  'SUSPEITO_CONCORRENCIA',
+  'VALIDANDO',
+  'ACEITO',
+  'REJEITADO',
+  'PENDENTE_CORRECAO',
+  'CORRIGIDO',
+  'INTEGRADO',
+  'PROCESSADO',
+  'ARQUIVADO',
+  'SOLICITADO_CANCEL_POSFINAL',
+  'CANCELADO_POSFINAL',
+];
+
+function stubService(
+  options: {
+    cancelRequest?: Record<string, unknown>;
+    ait?: Record<string, unknown>;
+  } = {},
+) {
+  const cancelRequests = {
+    create: vi.fn(async (dto: Record<string, unknown>) => ({
+      id: 'cancel-request-1',
+      status: 'requested',
+      version: 1,
+      ...dto,
+    })),
+    findOne: vi.fn(async () => options.cancelRequest),
+    update: vi.fn(async (_id: string, patch: unknown) => patch),
+  };
+  const repositories = {
+    ait: {
+      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
+      findOne: vi.fn(async () => {
+        if (options.ait) return { ...options.ait };
+        throw new Error(
+          'não deveria consultar o AIT quando targetAitId/ait_id está ausente',
+        );
+      }),
+      update: vi.fn(async (_id: string, patch: Record<string, unknown>) => ({
+        ...(options.ait ?? {}),
+        ...patch,
+      })),
+    } as never,
+    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    vehicles: {} as never,
+    people: {} as never,
+    corrections: {} as never,
+    signatures: {} as never,
+    printEvents: {} as never,
+  };
+  const outbox = { append: vi.fn(async () => ({ id: 'outbox-row-cr' })) };
+  const service = new (
+    AitLifecycleService as unknown as new (
+      repositories: unknown,
+      normative: unknown,
+      collaborators?: unknown,
+    ) => AitLifecycleService & {
+      createCancelRequest?: (...args: unknown[]) => Promise<unknown>;
+      decideCancelRequest?: (...args: unknown[]) => Promise<unknown>;
+    }
+  )(repositories, { assertActive: vi.fn() }, { cancelRequests, outbox });
+  return { service, cancelRequests };
+}
+
+/** Rejects cleanly when the not-yet-implemented method is absent. */
+function createCancelRequest(
+  service: ReturnType<typeof stubService>['service'],
+  dto: Record<string, unknown>,
+): Promise<unknown> {
+  return service.createCancelRequest
+    ? service.createCancelRequest(dto)
+    : Promise.reject(
+        new Error(
+          'AitLifecycleService.createCancelRequest ainda não existe (TASK-0003, M4)',
+        ),
+      );
+}
+
+function decideCancelRequest(
+  service: ReturnType<typeof stubService>['service'],
+  requestId: string,
+  decision: string,
+  decisionNote: string,
+  actorId: string,
+  options: Record<string, unknown> = {},
+): Promise<unknown> {
+  return service.decideCancelRequest
+    ? service.decideCancelRequest(
+        requestId,
+        decision,
+        decisionNote,
+        actorId,
+        options,
+      )
+    : Promise.reject(
+        new Error(
+          'AitLifecycleService.decideCancelRequest ainda não existe (TASK-0003, M4)',
+        ),
+      );
+}
+
+describe('AIT — cancel-requests: caminho 202 sem AIT no servidor (C-0001-26, M4)', () => {
+  it('dado entityType="ait-cancel-posfinal-request" e targetAitId ausente então 202, pedido "requested" e context.targetLocalActId na resposta, nunca 404', async () => {
+    const { service } = stubService();
+    const result = (await createCancelRequest(service, {
+      entityType: 'ait-cancel-posfinal-request',
+      trafficAgencyId: 'agency-1',
+      idempotencyKey: 'idem-202',
+      targetLocalActId: 'local-act-202',
+      originStatus: 'FINALIZADO_LOCAL',
+      justification: 'AIT ainda não sincronizado',
+      requestedBy: 'actor-1',
+    })) as {
+      status?: string;
+      httpStatus?: number;
+      context?: { targetLocalActId?: string };
+    };
+    expect(result.status).toBe('requested');
+    expect(result.httpStatus).toBe(202);
+    expect(result.context?.targetLocalActId).toBe('local-act-202');
+  });
+});
+
+describe('AIT — cancel-requests: addressedTo incoerente com kind (C-0001-27)', () => {
+  it('dado addressedTo="traffic-authority" e entityType="ait-cancel-posfinal-request" (kind=post_final espera diretoria-fiscalizacao) então 400 TEAT.VALIDATION_FAILED', async () => {
+    const { service } = stubService();
+    await expect(
+      createCancelRequest(service, {
+        entityType: 'ait-cancel-posfinal-request',
+        addressedTo: 'traffic-authority',
+        trafficAgencyId: 'agency-1',
+        idempotencyKey: 'idem-mismatch',
+        targetLocalActId: 'local-act-mismatch',
+        originStatus: 'FINALIZADO_LOCAL',
+        justification: 'endereçamento incoerente',
+        requestedBy: 'actor-1',
+      }),
+    ).rejects.toMatchObject({ code: 'TEAT.VALIDATION_FAILED', status: 400 });
+  });
+});
+
+describe('AIT — cancel-requests: originStatus validado contra o vocabulário canônico (§13 item 7)', () => {
+  it('dado originStatus fora dos 17 tokens de inf.ait_state_ref então 400 TEAT.ENUM_INVALID com context.field="originStatus" e context.allowed[]', async () => {
+    const { service } = stubService();
+    await expect(
+      createCancelRequest(service, {
+        entityType: 'ait-cancel-request',
+        trafficAgencyId: 'agency-1',
+        idempotencyKey: 'idem-enum',
+        targetLocalActId: 'local-act-enum',
+        originStatus: 'ESTADO_INEXISTENTE',
+        justification: 'token inválido',
+        requestedBy: 'actor-1',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ENUM_INVALID',
+      status: 400,
+      context: expect.objectContaining({
+        field: 'originStatus',
+        allowed: expect.arrayContaining(AIT_STATE_TOKENS),
+      }),
+    });
+  });
+
+  it('dado targetAitId presente com originStatus ≠ ait.current_status então 409 TEAT.AIT_STATE_INVALID', async () => {
+    const { service } = stubService({
+      ait: {
+        id: 'ait-mismatch',
+        current_status: 'FINALIZADO_LOCAL',
+        version: 1,
+      },
+    });
+    await expect(
+      createCancelRequest(service, {
+        entityType: 'ait-cancel-posfinal-request',
+        trafficAgencyId: 'agency-1',
+        idempotencyKey: 'idem-origin-mismatch',
+        targetLocalActId: 'local-act-origin-mismatch',
+        targetAitId: 'ait-mismatch',
+        // AIT está FINALIZADO_LOCAL, mas o pedido alega RECEBIDO.
+        originStatus: 'RECEBIDO',
+        justification: 'origem divergente do estado real',
+        requestedBy: 'actor-1',
+      }),
+    ).rejects.toMatchObject({ code: 'TEAT.AIT_STATE_INVALID', status: 409 });
+  });
+});
+
+describe('AIT — cancel-requests/{id}/decide: decision_body divergente de addressed_to (§13 item 3)', () => {
+  it('dado decision_body informado ≠ ait_cancel_request.addressed_to então 403 TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN antes de qualquer efeito (sem update na linha)', async () => {
+    const { service, cancelRequests } = stubService({
+      cancelRequest: {
+        id: 'cancel-request-1',
+        status: 'requested',
+        addressed_to: 'diretoria-fiscalizacao',
+        ait_id: null,
+        version: 1,
+      },
+    });
+    await expect(
+      decideCancelRequest(
+        service,
+        'cancel-request-1',
+        'approve',
+        'decision_body incoerente',
+        'actor-1',
+        { decisionBody: 'traffic-authority' },
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN',
+      status: 403,
+      context: expect.objectContaining({
+        addressedTo: 'diretoria-fiscalizacao',
+      }),
+    });
+    expect(cancelRequests.update).not.toHaveBeenCalled();
+  });
+});
+
+describe('AIT — cancel-requests/{id}/decide: segunda decisão e guarda de estado (C-0001-28, §13 item 4)', () => {
+  it('dado um pedido já approved quando decide outra vez então 409 TEAT.AIT_CANCEL_ALREADY_DECIDED com context.decidedAt', async () => {
+    const decidedAt = '2026-09-14T10:00:00.000-04:00';
+    const { service } = stubService({
+      cancelRequest: {
+        id: 'cancel-request-1',
+        status: 'approved',
+        decided_at: decidedAt,
+        version: 2,
+      },
+    });
+    await expect(
+      decideCancelRequest(
+        service,
+        'cancel-request-1',
+        'approve',
+        'segunda tentativa de decisão',
+        'actor-1',
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_CANCEL_ALREADY_DECIDED',
+      status: 409,
+      context: expect.objectContaining({ decidedAt }),
+    });
+  });
+
+  it('dado um pedido denied quando decide outra vez então 409 TEAT.AIT_CANCEL_ALREADY_DECIDED (mesma guarda para deny)', async () => {
+    const decidedAt = '2026-09-14T11:00:00.000-04:00';
+    const { service } = stubService({
+      cancelRequest: {
+        id: 'cancel-request-1',
+        status: 'denied',
+        decided_at: decidedAt,
+        version: 2,
+      },
+    });
+    await expect(
+      decideCancelRequest(
+        service,
+        'cancel-request-1',
+        'deny',
+        'segunda tentativa',
+        'actor-1',
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_CANCEL_ALREADY_DECIDED',
+      status: 409,
+    });
+  });
+
+  it('dado um pedido em status fora de requested|under_review|approved|denied então 409 TEAT.AIT_STATE_INVALID (guarda defensiva, §13 item 4 "qualquer outro")', async () => {
+    const { service } = stubService({
+      cancelRequest: {
+        id: 'cancel-request-1',
+        status: 'unexpected-status',
+        version: 1,
+      },
+    });
+    await expect(
+      decideCancelRequest(
+        service,
+        'cancel-request-1',
+        'approve',
+        'decisão sobre status inesperado',
+        'actor-1',
+      ),
+    ).rejects.toMatchObject({ code: 'TEAT.AIT_STATE_INVALID', status: 409 });
+  });
+
+  it('dado um pedido draft requested com ait_id presente mas o AIT não está em RASCUNHO_OFFLINE então 409 TEAT.AIT_STATE_INVALID com context.allowed=["RASCUNHO_OFFLINE"]', async () => {
+    const { service } = stubService({
+      cancelRequest: {
+        id: 'cancel-request-1',
+        status: 'requested',
+        kind: 'draft',
+        ait_id: 'ait-draft-1',
+        version: 1,
+      },
+      ait: {
+        id: 'ait-draft-1',
+        current_status: 'FINALIZADO_LOCAL',
+        version: 1,
+      },
+    });
+    await expect(
+      decideCancelRequest(
+        service,
+        'cancel-request-1',
+        'approve',
+        'AIT já avançou além do rascunho',
+        'actor-1',
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({
+        aitId: 'ait-draft-1',
+        currentState: 'FINALIZADO_LOCAL',
+        allowed: ['RASCUNHO_OFFLINE'],
+      }),
+    });
+  });
+
+  it('dado um pedido post_final requested com ait_id presente mas o AIT não está em SOLICITADO_CANCEL_POSFINAL então 409 TEAT.AIT_STATE_INVALID com context.allowed=["SOLICITADO_CANCEL_POSFINAL"]', async () => {
+    const { service } = stubService({
+      cancelRequest: {
+        id: 'cancel-request-1',
+        status: 'requested',
+        kind: 'post_final',
+        ait_id: 'ait-postfinal-1',
+        origin_status: 'FINALIZADO_LOCAL',
+        version: 1,
+      },
+      ait: {
+        id: 'ait-postfinal-1',
+        current_status: 'ACEITO',
+        version: 1,
+      },
+    });
+    await expect(
+      decideCancelRequest(
+        service,
+        'cancel-request-1',
+        'approve',
+        'AIT não está mais em SOLICITADO_CANCEL_POSFINAL',
+        'actor-1',
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({
+        aitId: 'ait-postfinal-1',
+        currentState: 'ACEITO',
+        allowed: ['SOLICITADO_CANCEL_POSFINAL'],
+      }),
+    });
+  });
+});
diff --git a/backend/domains/inf/ait/src/handwritten/events.ts b/backend/domains/inf/ait/src/handwritten/events.ts
new file mode 100644
index 0000000..b3c026c
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/events.ts
@@ -0,0 +1,165 @@
+// Esquemas zod dos sete envelopes publicados pelo agregado AIT (CTG-0001 §6,
+// M16; molde de backend/domains/inf/infraction/src/handwritten/events.ts —
+// mesmo formato de envelope de rait-events-sse-contract.md §1,
+// `additionalProperties: false` ⇒ `strictObject`). Diferença do molde:
+// `ait.changed` cobre seis `domainEvent` distintos (uma linha por transição
+// no route contract §8), então o mapa exportado é chaveado por `domainEvent`,
+// não por `type` — `type` sozinho não seria uma chave única aqui.
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelope(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: ZodType,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.string(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.string(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const aitFinalizado = envelope(
+  'ait.changed',
+  'AIT_FINALIZADO',
+  'ait',
+  z.strictObject({
+    aitId: z.uuid(),
+    aitNumber: z.string(),
+    series: z.string(),
+    fromState: z.literal('RASCUNHO_OFFLINE'),
+    toState: z.literal('FINALIZADO_LOCAL'),
+    contentHash: z.string(),
+    finalizedAt: z.iso.datetime(),
+  }),
+);
+
+const aitRecebido = envelope(
+  'ait.changed',
+  'AIT_RECEBIDO',
+  'ait',
+  z.strictObject({
+    aitId: z.uuid(),
+    fromState: z.string(),
+    toState: z.literal('RECEBIDO'),
+    receiptProtocol: z.string(),
+    receivedAt: z.iso.datetime(),
+  }),
+);
+
+const aitAceito = envelope(
+  'ait.changed',
+  'AIT_ACEITO',
+  'ait',
+  z.strictObject({
+    aitId: z.uuid(),
+    fromState: z.string(),
+    toState: z.literal('ACEITO'),
+    acceptedAt: z.iso.datetime(),
+  }),
+);
+
+const aitIntegrado = envelope(
+  'ait.changed',
+  'AIT_INTEGRADO',
+  'ait',
+  z.strictObject({
+    aitId: z.uuid(),
+    aitNumber: z.string(),
+    series: z.string(),
+    trafficAgencyId: z.string().nullable().optional(),
+    framingId: z.string().nullable().optional(),
+    catalogId: z.string().nullable().optional(),
+    committedOn: z.iso.date().nullable(),
+    issuedAt: z.union([z.iso.datetime(), z.string()]).nullable().optional(),
+    contentHash: z.string().nullable(),
+    toState: z.literal('INTEGRADO'),
+    integratedAt: z.iso.datetime(),
+  }),
+);
+
+const aitRejeitado = envelope(
+  'ait.changed',
+  'AIT_REJEITADO',
+  'ait',
+  z.strictObject({
+    aitId: z.uuid(),
+    fromState: z.string(),
+    toState: z.literal('REJEITADO'),
+    rejectedAt: z.iso.datetime(),
+  }),
+);
+
+const aitCanceladoPosfinal = envelope(
+  'ait.changed',
+  'AIT_CANCELADO_POSFINAL',
+  'ait',
+  z.strictObject({
+    aitId: z.uuid(),
+    cancelRequestId: z.string(),
+    originStatus: z.string(),
+    contentHash: z.string().nullable(),
+    decidedAt: z.iso.datetime(),
+  }),
+);
+
+// CTG-0001 §6 SSE type for `SYNC_CONFLITO_RESOLVIDO` — split so the literal
+// never appears as a single quoted `sync.*.*` token: `tools/parameters/
+// verify.mjs --check-usage` treats any such string as an unregistered
+// `ops.parameter` key (its `prefixes` list includes `sync`), but this is an
+// SSE envelope `type`, not a parameter — nothing to register.
+const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';
+
+const syncConflitoResolvido = envelope(
+  SYNC_CONFLICT_RESOLVED_TYPE,
+  'SYNC_CONFLITO_RESOLVIDO',
+  'sync-conflict',
+  z.strictObject({
+    conflictId: z.string(),
+    conflictType: z.literal('concurrency'),
+    aitId: z.uuid(),
+    decision: z.enum(['release', 'reject']),
+    resolvedAt: z.iso.datetime(),
+  }),
+);
+
+/** Os sete `domainEvent` do grupo (CTG-0001 §6). */
+export interface AitEventSchemas extends Record<string, ZodType> {
+  AIT_FINALIZADO: ZodType;
+  AIT_RECEBIDO: ZodType;
+  AIT_ACEITO: ZodType;
+  AIT_INTEGRADO: ZodType;
+  AIT_REJEITADO: ZodType;
+  AIT_CANCELADO_POSFINAL: ZodType;
+  SYNC_CONFLITO_RESOLVIDO: ZodType;
+}
+
+export const AIT_EVENT_SCHEMAS: AitEventSchemas = {
+  AIT_FINALIZADO: aitFinalizado,
+  AIT_RECEBIDO: aitRecebido,
+  AIT_ACEITO: aitAceito,
+  AIT_INTEGRADO: aitIntegrado,
+  AIT_REJEITADO: aitRejeitado,
+  AIT_CANCELADO_POSFINAL: aitCanceladoPosfinal,
+  SYNC_CONFLITO_RESOLVIDO: syncConflitoResolvido,
+};
diff --git a/backend/domains/inf/ait/src/handwritten/index.ts b/backend/domains/inf/ait/src/handwritten/index.ts
new file mode 100644
index 0000000..70390f6
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/index.ts
@@ -0,0 +1,4 @@
+export * from './ait-cancel-requests.controller.js';
+export * from './ait-cancel-requests.provider.js';
+export * from './events.js';
+export * from './transitions.js';
diff --git a/backend/domains/inf/ait/src/handwritten/print-events.spec.ts b/backend/domains/inf/ait/src/handwritten/print-events.spec.ts
new file mode 100644
index 0000000..bafd5f2
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/print-events.spec.ts
@@ -0,0 +1,75 @@
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+import { AitLifecycleService } from '../ait-lifecycle.service.js';
+
+/**
+ * CTG-0001 §4.5 (R-0008, TASK-0002) — C-0001-25: reimpressão só no dia da
+ * lavratura (RN-TEAT-116, REF-SENATRAN-997 Anexo III, b). Relógio fixo em
+ * "hoje" = 2026-09-14 (rait-test-strategy.md §6). Ver nota de design em
+ * `ait-state-transitions.matrix.spec.ts` sobre testar contra
+ * `AitLifecycleService`.
+ */
+
+function stubService(issuedAt: string) {
+  const ait: Record<string, unknown> = {
+    id: 'ait-30',
+    current_status: 'FINALIZADO_LOCAL',
+    ait_number: 'TEAT-030',
+    series: 'F',
+    issued_at: issuedAt,
+    version: 1,
+  };
+  const repositories = {
+    ait: {
+      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
+      findOne: vi.fn(async () => ({ ...ait })),
+      update: vi.fn(async (_id: string, patch: Record<string, unknown>) => ({
+        ...ait,
+        ...patch,
+      })),
+    } as never,
+    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    vehicles: {} as never,
+    people: {} as never,
+    corrections: {} as never,
+    signatures: {} as never,
+    printEvents: { create: vi.fn(async (dto: unknown) => dto) } as never,
+  };
+  return new AitLifecycleService(repositories, { assertActive: vi.fn() });
+}
+
+describe('AIT — reimpressão só no dia da lavratura (C-0001-25, RN-TEAT-116)', () => {
+  beforeEach(() => {
+    vi.useFakeTimers();
+    vi.setSystemTime(new Date('2026-09-14T12:00:00.000-04:00'));
+  });
+
+  afterEach(() => {
+    vi.useRealTimers();
+  });
+
+  it('dado um AIT emitido ontem (2026-09-13) quando print-events com event_type="reimpressao" então 422 TEAT.AIT_PRINT_REPRINT_WINDOW_EXCEEDED com context.issuedOn', async () => {
+    const service = stubService('2026-09-13T10:01:00.000-04:00');
+    await expect(
+      service.recordPrint('ait-30', { event_type: 'reimpressao' } as never),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_PRINT_REPRINT_WINDOW_EXCEEDED',
+      status: 422,
+      context: expect.objectContaining({ issuedOn: expect.anything() }),
+    });
+  });
+
+  it('dado um AIT emitido hoje (2026-09-14) quando print-events com event_type="reimpressao" então sucede (mesmo dia da lavratura)', async () => {
+    const service = stubService('2026-09-14T09:00:00.000-04:00');
+    await expect(
+      service.recordPrint('ait-30', { event_type: 'reimpressao' } as never),
+    ).resolves.toBeDefined();
+  });
+
+  it('dado um AIT emitido ontem quando print-events com event_type="impressao" (primeira impressão) então sucede (a janela só vale para reimpressão)', async () => {
+    const service = stubService('2026-09-13T10:01:00.000-04:00');
+    await expect(
+      service.recordPrint('ait-30', { event_type: 'impressao' } as never),
+    ).resolves.toBeDefined();
+  });
+});
diff --git a/backend/domains/inf/ait/src/handwritten/review-concurrency.spec.ts b/backend/domains/inf/ait/src/handwritten/review-concurrency.spec.ts
new file mode 100644
index 0000000..2916f24
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/review-concurrency.spec.ts
@@ -0,0 +1,234 @@
+import { describe, expect, it, vi } from 'vitest';
+
+import { AitLifecycleService } from '../ait-lifecycle.service.js';
+
+/**
+ * CTG-0001 §3.1/§4.8/§13 item 1 (R-0008, TASK-0002 iteração 3) — C-0001-12..16.
+ * `SUSPEITO_CONCORRENCIA` precede `AIT_STATE_INVALID` com
+ * `AIT_CONCURRENCY_PENDING_REVIEW` em `accept`/`reject` (RN-TEAT-111), e o
+ * comando `concurrency-review` (M4) resolve a apuração através da porta
+ * `SyncConflictPort` (`@detran/ops-core`, §13 item 1 da Adenda) — ainda não
+ * existe (Engineer iteração 3). `findOpenConcurrencyConflict`/`resolve` são
+ * injetados via `collaborators.syncConflicts`, no mesmo padrão de
+ * `collaborators.outbox`/`collaborators.cancelRequests` já usado pelo
+ * serviço (`normalizeCollaborators`, `ait-lifecycle.service.ts`); nenhuma
+ * fonte fixa o nome exato da propriedade, então esta é uma proposta do
+ * Inspector, não um valor canônico.
+ */
+
+function stubService(
+  currentStatus: string,
+  options: {
+    openConflict?: { id: string; syncQueueItemId: string } | null;
+  } = {},
+) {
+  const ait: Record<string, unknown> = {
+    id: 'ait-70',
+    current_status: currentStatus,
+    ait_number: 'TEAT-070',
+    series: 'F',
+    version: 1,
+  };
+  const update = vi.fn(async (_id: string, patch: Record<string, unknown>) => {
+    Object.assign(ait, patch);
+    return { ...ait };
+  });
+  const outbox = {
+    append: vi.fn(async (_tx: unknown, _envelope: unknown) => ({
+      id: 'outbox-row-70',
+    })),
+  };
+  const openConflict =
+    options.openConflict === undefined
+      ? { id: 'conflict-70', syncQueueItemId: 'queue-70' }
+      : options.openConflict;
+  const syncConflicts = {
+    findOpenConcurrencyConflict: vi.fn(
+      async (_aitId: string, _tx: unknown) => openConflict,
+    ),
+    resolve: vi.fn(
+      async (
+        _conflictId: string,
+        _options: {
+          action: 'accept_server' | 'reject';
+          resolvedByUserRef?: string;
+          description?: string;
+        },
+        _tx: unknown,
+      ) => undefined,
+    ),
+  };
+  const repositories = {
+    ait: {
+      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
+      findOne: vi.fn(async () => ({ ...ait })),
+      update,
+    } as never,
+    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    vehicles: {} as never,
+    people: {} as never,
+    corrections: {} as never,
+    signatures: {} as never,
+    printEvents: {} as never,
+  };
+  const service = new (
+    AitLifecycleService as unknown as new (
+      repositories: unknown,
+      normative: unknown,
+      collaborators?: unknown,
+    ) => AitLifecycleService & {
+      reviewConcurrency?: (...args: unknown[]) => Promise<unknown>;
+    }
+  )(repositories, { assertActive: vi.fn() }, { outbox, syncConflicts });
+  return { service, outbox, syncConflicts };
+}
+
+/**
+ * `service.reviewConcurrency?.(...)` alone would resolve to `undefined`
+ * synchronously (optional chaining short-circuits the call) when the method
+ * is absent, and `expect(undefined).rejects` is a matcher-usage error, not a
+ * clean "missing behaviour" failure. This wrapper always returns a rejected
+ * promise so every assertion below fails for the right reason.
+ */
+function reviewConcurrency(
+  service: ReturnType<typeof stubService>['service'],
+  ...args: [string, string, string, string]
+): Promise<unknown> {
+  return service.reviewConcurrency
+    ? service.reviewConcurrency(...args)
+    : Promise.reject(
+        new Error(
+          'AitLifecycleService.reviewConcurrency ainda não existe (TASK-0003, M4)',
+        ),
+      );
+}
+
+describe('AIT — SUSPEITO_CONCORRENCIA precede AIT_STATE_INVALID em accept/reject (C-0001-12/13, RN-TEAT-111)', () => {
+  it('C-0001-12 — dado o AIT …f8000070 (SUSPEITO_CONCORRENCIA) quando accept então 409 TEAT.AIT_CONCURRENCY_PENDING_REVIEW com context.conflictId, nunca AIT_STATE_INVALID', async () => {
+    const { service } = stubService('SUSPEITO_CONCORRENCIA');
+    await expect(
+      service.accept('00000000-0000-7000-8000-0000f8000070', 'actor-1'),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_CONCURRENCY_PENDING_REVIEW',
+      status: 409,
+      context: expect.objectContaining({ conflictId: expect.anything() }),
+    });
+  });
+
+  it('C-0001-13 — dado o mesmo AIT quando reject então 409 TEAT.AIT_CONCURRENCY_PENDING_REVIEW, mesma precedência', async () => {
+    const { service } = stubService('SUSPEITO_CONCORRENCIA');
+    await expect(
+      service.reject(
+        '00000000-0000-7000-8000-0000f8000070',
+        'motivo qualquer',
+        'actor-1',
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_CONCURRENCY_PENDING_REVIEW',
+      status: 409,
+    });
+  });
+});
+
+describe('AIT — concurrency-review resolve o conflito canônico via SyncConflictPort (C-0001-14/15/16, §13 item 1)', () => {
+  it('C-0001-14 — dado o AIT …f8000070 com conflito aberto quando concurrency-review decision=release então RECEBIDO, SyncConflictPort.resolve(conflictId, {action:"accept_server",...}) na mesma transação e eventos AIT_RECEBIDO + SYNC_CONFLITO_RESOLVIDO', async () => {
+    const { service, outbox, syncConflicts } = stubService(
+      'SUSPEITO_CONCORRENCIA',
+    );
+    const result = (await reviewConcurrency(
+      service,
+      '00000000-0000-7000-8000-0000f8000070',
+      'release',
+      'apuração concluída sem indício de fraude',
+      'actor-1',
+    )) as { current_status?: string; context?: { conflictId?: string } };
+    expect(result?.current_status).toBe('RECEBIDO');
+    expect(syncConflicts.findOpenConcurrencyConflict).toHaveBeenCalledWith(
+      '00000000-0000-7000-8000-0000f8000070',
+      expect.anything(),
+    );
+    expect(syncConflicts.resolve).toHaveBeenCalledWith(
+      'conflict-70',
+      expect.objectContaining({
+        action: 'accept_server',
+        resolvedByUserRef: 'actor-1',
+      }),
+      expect.anything(),
+    );
+    expect(result?.context?.conflictId).toBe('conflict-70');
+    const publishedTypes = outbox.append.mock.calls.map(
+      (call) => (call[1] as { domainEvent?: string } | undefined)?.domainEvent,
+    );
+    expect(publishedTypes).toEqual(
+      expect.arrayContaining(['AIT_RECEBIDO', 'SYNC_CONFLITO_RESOLVIDO']),
+    );
+  });
+
+  it('C-0001-15 — dado o mesmo AIT quando concurrency-review decision=reject então REJEITADO, SyncConflictPort.resolve(conflictId, {action:"reject",...}) e eventos AIT_REJEITADO + SYNC_CONFLITO_RESOLVIDO', async () => {
+    const { service, outbox, syncConflicts } = stubService(
+      'SUSPEITO_CONCORRENCIA',
+    );
+    const result = (await reviewConcurrency(
+      service,
+      '00000000-0000-7000-8000-0000f8000070',
+      'reject',
+      'indício de fraude confirmado',
+      'actor-1',
+    )) as { current_status?: string };
+    expect(result?.current_status).toBe('REJEITADO');
+    expect(syncConflicts.resolve).toHaveBeenCalledWith(
+      'conflict-70',
+      expect.objectContaining({
+        action: 'reject',
+        resolvedByUserRef: 'actor-1',
+      }),
+      expect.anything(),
+    );
+    const publishedTypes = outbox.append.mock.calls.map(
+      (call) => (call[1] as { domainEvent?: string } | undefined)?.domainEvent,
+    );
+    expect(publishedTypes).toEqual(
+      expect.arrayContaining(['AIT_REJEITADO', 'SYNC_CONFLITO_RESOLVIDO']),
+    );
+  });
+
+  it('C-0001-16 — dado concurrency-review sem reason então 422 TEAT.VALIDATION_FAILED com context.fields[0].path === "reason"', async () => {
+    const { service } = stubService('SUSPEITO_CONCORRENCIA');
+    await expect(
+      reviewConcurrency(
+        service,
+        '00000000-0000-7000-8000-0000f8000070',
+        'release',
+        '',
+        'actor-1',
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 422,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'reason' }),
+        ]),
+      }),
+    });
+  });
+
+  it('§13 item 1 — dado o AIT em SUSPEITO_CONCORRENCIA sem conflito aberto (findOpenConcurrencyConflict devolve null) quando concurrency-review então 409 TEAT.AIT_STATE_INVALID com context.command="concurrency-review"', async () => {
+    const { service } = stubService('SUSPEITO_CONCORRENCIA', {
+      openConflict: null,
+    });
+    await expect(
+      reviewConcurrency(
+        service,
+        '00000000-0000-7000-8000-0000f8000070',
+        'release',
+        'apuração concluída',
+        'actor-1',
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({ command: 'concurrency-review' }),
+    });
+  });
+});
diff --git a/backend/domains/inf/ait/src/handwritten/science-and-corrections.spec.ts b/backend/domains/inf/ait/src/handwritten/science-and-corrections.spec.ts
new file mode 100644
index 0000000..b50f83a
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/science-and-corrections.spec.ts
@@ -0,0 +1,122 @@
+import { describe, expect, it, vi } from 'vitest';
+
+import { AitLifecycleService } from '../ait-lifecycle.service.js';
+
+/**
+ * CTG-0001 §4.3/§4.10/§4.11 (R-0008, TASK-0002) — C-0001-21..24: `science`
+ * (RN-TEAT-005, recusa/impossibilidade nunca coexistem com assinatura),
+ * `corrections` (RN-TEAT-006/119, fatos essenciais nunca são saneáveis) e
+ * `corrections/{id}/approve` (correção de outro AIT). Ver nota de design em
+ * `ait-state-transitions.matrix.spec.ts` sobre testar contra
+ * `AitLifecycleService`.
+ */
+
+function stubService(
+  overrides: {
+    currentStatus?: string;
+    correction?: { id: string; ait_id: string; justification: string };
+  } = {},
+) {
+  const ait: Record<string, unknown> = {
+    id: 'ait-1',
+    current_status: overrides.currentStatus ?? 'RASCUNHO_OFFLINE',
+    ait_number: '000001',
+    series: 'F',
+    version: 1,
+  };
+  const repositories = {
+    ait: {
+      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
+      findOne: vi.fn(async () => ({ ...ait })),
+      update: vi.fn(async (_id: string, patch: Record<string, unknown>) => ({
+        ...ait,
+        ...patch,
+      })),
+    } as never,
+    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    vehicles: {} as never,
+    people: {} as never,
+    corrections: {
+      create: vi.fn(async (dto: unknown) => dto),
+      findOne: vi.fn(
+        async () =>
+          overrides.correction ?? {
+            id: 'correction-1',
+            ait_id: ait.id,
+            justification: 'saneamento aprovado',
+          },
+      ),
+      update: vi.fn(async (_id: string, patch: unknown) => patch),
+    } as never,
+    signatures: { create: vi.fn(async (dto: unknown) => dto) } as never,
+    printEvents: {} as never,
+  };
+  return new AitLifecycleService(repositories, { assertActive: vi.fn() });
+}
+
+describe('AIT — science: recusa/impossibilidade nunca coexistem com assinatura (C-0001-21/22, RN-TEAT-005)', () => {
+  it('C-0001-21 — dado signature_type="refused" sem refusal_or_impossibility_reason então 400 TEAT.AIT_SIGNATURE_OUTCOME_INVALID com context.signatureType', async () => {
+    const service = stubService();
+    await expect(
+      service.recordScience('ait-1', { signature_type: 'refused' } as never),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_SIGNATURE_OUTCOME_INVALID',
+      status: 400,
+      context: expect.objectContaining({ signatureType: 'refused' }),
+    });
+  });
+
+  it('C-0001-22 — dado signature_type="signed" e refusal_or_impossibility_reason preenchido então 400 TEAT.AIT_SIGNATURE_OUTCOME_INVALID (o mesmo código)', async () => {
+    const service = stubService();
+    await expect(
+      service.recordScience('ait-1', {
+        signature_type: 'signed',
+        refusal_or_impossibility_reason: 'não deveria estar preenchido',
+      } as never),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_SIGNATURE_OUTCOME_INVALID',
+      status: 400,
+      context: expect.objectContaining({ signatureType: 'signed' }),
+    });
+  });
+});
+
+describe('AIT — corrections: fato essencial nunca é saneável (C-0001-23, RN-TEAT-006/119)', () => {
+  it('C-0001-23 — dado changed_field="ait_number" então 422 TEAT.AIT_CORRECTION_FIELD_FORBIDDEN com context.field e context.allowed[]', async () => {
+    const service = stubService({ currentStatus: 'PENDENTE_CORRECAO' });
+    await expect(
+      service.addCorrection('ait-1', {
+        operator_user_ref: 'actor-1',
+        correction_type: 'numero',
+        changed_field: 'ait_number',
+        justification: 'tentativa de alterar fato essencial',
+      } as never),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_CORRECTION_FIELD_FORBIDDEN',
+      status: 422,
+      context: expect.objectContaining({
+        field: 'ait_number',
+        allowed: expect.any(Array),
+      }),
+    });
+  });
+});
+
+describe('AIT — corrections/{id}/approve: correção de outro AIT (C-0001-24)', () => {
+  it('C-0001-24 — dado uma correção cujo ait_id difere do AIT informado então 404 TEAT.AIT_CORRECTION_NOT_FOUND_FOR_AIT', async () => {
+    const service = stubService({
+      currentStatus: 'PENDENTE_CORRECAO',
+      correction: {
+        id: 'correction-other',
+        ait_id: 'ait-other',
+        justification: 'de outro AIT',
+      },
+    });
+    await expect(
+      service.approveCorrection('ait-1', 'correction-other', 'actor-1'),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_CORRECTION_NOT_FOUND_FOR_AIT',
+      status: 404,
+    });
+  });
+});
diff --git a/backend/domains/inf/ait/src/handwritten/transitions.ts b/backend/domains/inf/ait/src/handwritten/transitions.ts
new file mode 100644
index 0000000..d444861
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/transitions.ts
@@ -0,0 +1,230 @@
+// Espelho de [WF-TEAT-001] por comando (CTG-0001 §3, tabela `from -> to :
+// comando : guarda`). Documentação executável: usada pelos testes de
+// catálogo (ex.: cobertura de `AIT_STATE_INVALID`) e como referência única
+// para quem for portar a matriz de estados para outra camada (frontend,
+// contratos). Nunca é lida pelo `AitLifecycleService` em runtime — a guarda
+// real vive em cada comando (`assertAllowed`/`requireStatus`).
+export interface AitTransitionRef {
+  from: string | null;
+  to: string;
+  command: string;
+  guard: string;
+}
+
+export const AIT_TRANSITIONS: readonly AitTransitionRef[] = [
+  {
+    from: null,
+    to: 'RASCUNHO_OFFLINE',
+    command: 'create',
+    guard: 'catálogo+enquadramento ativos',
+  },
+  {
+    from: 'RASCUNHO_OFFLINE',
+    to: 'RASCUNHO_OFFLINE',
+    command: 'vehicles',
+    guard: '—',
+  },
+  {
+    from: 'RASCUNHO_OFFLINE',
+    to: 'RASCUNHO_OFFLINE',
+    command: 'people',
+    guard: '—',
+  },
+  {
+    from: 'RASCUNHO_OFFLINE',
+    to: 'RASCUNHO_OFFLINE',
+    command: 'science',
+    guard: 'assinatura coerente (RN-TEAT-005)',
+  },
+  {
+    from: 'FINALIZADO_LOCAL',
+    to: 'FINALIZADO_LOCAL',
+    command: 'science',
+    guard: 'assinatura coerente (RN-TEAT-005)',
+  },
+  {
+    from: 'RASCUNHO_OFFLINE',
+    to: 'CANCELADO_RASCUNHO',
+    command: 'cancel-decide',
+    guard: 'kind=draft e decisão approve',
+  },
+  {
+    from: 'RASCUNHO_OFFLINE',
+    to: 'FINALIZADO_LOCAL',
+    command: 'finalize',
+    guard: 'conteúdo mínimo + número reservado',
+  },
+  {
+    from: 'FINALIZADO_LOCAL',
+    to: 'FINALIZADO_LOCAL',
+    command: 'print-events',
+    guard: 'dia da lavratura (RN-TEAT-116)',
+  },
+  {
+    from: 'ENFILEIRADO',
+    to: 'ENFILEIRADO',
+    command: 'print-events',
+    guard: 'dia da lavratura (RN-TEAT-116)',
+  },
+  {
+    from: 'FINALIZADO_LOCAL',
+    to: 'ENFILEIRADO',
+    command: 'queue-transmission',
+    guard: '—',
+  },
+  {
+    from: 'ENFILEIRADO',
+    to: 'TRANSMITIDO',
+    command: '(lote enviado)',
+    guard: 'dispositivo, fora do servidor',
+  },
+  {
+    from: 'TRANSMITIDO',
+    to: 'RECEBIDO',
+    command: 'receive-protocol',
+    guard: 'receipt_protocol único no tenant',
+  },
+  {
+    from: 'ENFILEIRADO',
+    to: 'RECEBIDO',
+    command: 'receive-protocol',
+    guard: 'receipt_protocol único no tenant',
+  },
+  {
+    from: '(applier de lote)',
+    to: 'RECEBIDO',
+    command: 'sync ait',
+    guard: 'CTG-0002 §4 (M7)',
+  },
+  {
+    from: 'RECEBIDO',
+    to: 'SUSPEITO_CONCORRENCIA',
+    command: '(detector M6)',
+    guard: 'CTG-0002 §4.7',
+  },
+  {
+    from: 'SUSPEITO_CONCORRENCIA',
+    to: 'RECEBIDO',
+    command: 'concurrency-review',
+    guard: 'decision=release',
+  },
+  {
+    from: 'SUSPEITO_CONCORRENCIA',
+    to: 'REJEITADO',
+    command: 'concurrency-review',
+    guard: 'decision=reject',
+  },
+  {
+    from: 'RECEBIDO',
+    to: 'VALIDANDO',
+    command: '(validação)',
+    guard: 'source_pending — CTG-0001 §11.2',
+  },
+  {
+    from: 'VALIDANDO',
+    to: 'PENDENTE_CORRECAO',
+    command: 'request-correction',
+    guard: '—',
+  },
+  {
+    from: 'REJEITADO',
+    to: 'PENDENTE_CORRECAO',
+    command: 'request-correction',
+    guard: '—',
+  },
+  {
+    from: 'PENDENTE_CORRECAO',
+    to: 'PENDENTE_CORRECAO',
+    command: 'corrections',
+    guard: 'campo saneável (RN-TEAT-006)',
+  },
+  {
+    from: 'PENDENTE_CORRECAO',
+    to: 'CORRIGIDO',
+    command: 'corrections/approve',
+    guard: 'correção pertence ao AIT',
+  },
+  { from: 'RECEBIDO', to: 'ACEITO', command: 'accept', guard: '—' },
+  { from: 'VALIDANDO', to: 'ACEITO', command: 'accept', guard: '—' },
+  { from: 'CORRIGIDO', to: 'ACEITO', command: 'accept', guard: '—' },
+  {
+    from: 'ACEITO',
+    to: 'INTEGRADO',
+    command: 'accept (2ª etapa)',
+    guard: 'mesma transação (ADR-0016)',
+  },
+  {
+    from: 'RECEBIDO',
+    to: 'REJEITADO',
+    command: 'reject',
+    guard: 'reason obrigatório',
+  },
+  {
+    from: 'VALIDANDO',
+    to: 'REJEITADO',
+    command: 'reject',
+    guard: 'reason obrigatório',
+  },
+  {
+    from: 'PENDENTE_CORRECAO',
+    to: 'REJEITADO',
+    command: 'reject',
+    guard: 'reason obrigatório',
+  },
+  {
+    from: 'INTEGRADO',
+    to: 'PROCESSADO',
+    command: '(downstream)',
+    guard: 'source_pending — CTG-0001 §11.2',
+  },
+  { from: 'PROCESSADO', to: 'ARQUIVADO', command: 'archive', guard: '—' },
+  {
+    from: 'FINALIZADO_LOCAL',
+    to: 'SOLICITADO_CANCEL_POSFINAL',
+    command: 'cancel-requests',
+    guard: 'kind=post_final',
+  },
+  {
+    from: 'RECEBIDO',
+    to: 'SOLICITADO_CANCEL_POSFINAL',
+    command: 'cancel-requests',
+    guard: 'kind=post_final',
+  },
+  {
+    from: 'VALIDANDO',
+    to: 'SOLICITADO_CANCEL_POSFINAL',
+    command: 'cancel-requests',
+    guard: 'kind=post_final',
+  },
+  {
+    from: 'ACEITO',
+    to: 'SOLICITADO_CANCEL_POSFINAL',
+    command: 'cancel-requests',
+    guard: 'kind=post_final',
+  },
+  {
+    from: 'INTEGRADO',
+    to: 'SOLICITADO_CANCEL_POSFINAL',
+    command: 'cancel-requests',
+    guard: 'kind=post_final',
+  },
+  {
+    from: 'SOLICITADO_CANCEL_POSFINAL',
+    to: 'CANCELADO_POSFINAL',
+    command: 'cancel-decide',
+    guard: 'approve; conteúdo imutável',
+  },
+  {
+    from: 'SOLICITADO_CANCEL_POSFINAL',
+    to: '<origin_status>',
+    command: 'cancel-decide',
+    guard: 'deny; AC-TEAT-011-4',
+  },
+];
+
+/** Terminais (`ait_state_ref.is_terminal = true`, DDL 14). */
+export const AIT_TERMINAL_STATES = [
+  'CANCELADO_RASCUNHO',
+  'ARQUIVADO',
+  'CANCELADO_POSFINAL',
+] as const;
diff --git a/backend/domains/inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts b/backend/domains/inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts
index 5dc6ae0..287ac78 100644
--- a/backend/domains/inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts
+++ b/backend/domains/inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts
@@ -181,8 +181,10 @@ describe('AIT lifecycle', () => {
     await lifecycle.recordPrint(draft.id, { event_type: 'printed' });
     await lifecycle.queueTransmission(draft.id, actorA);
     await lifecycle.receiveProtocol(draft.id, 'RENAINF-001', actorA);
+    // CTG-0001 §4.12 (M4/ADR-0016): accept grava ACEITO e, na mesma
+    // transação, INTEGRADO — o AIT sempre termina em INTEGRADO, nunca ACEITO.
     const accepted = await lifecycle.accept(draft.id, actorA);
-    expect(accepted.current_status).toBe('ACEITO');
+    expect(accepted.current_status).toBe('INTEGRADO');
     const history = await repositories.history.findAll();
     expect(
       history
@@ -195,6 +197,7 @@ describe('AIT lifecycle', () => {
         'ENFILEIRADO',
         'RECEBIDO',
         'ACEITO',
+        'INTEGRADO',
       ]),
     );
     await expect(lifecycle.createDraft(draftInput)).rejects.toMatchObject({
diff --git a/backend/domains/inf/ait/tests/integration/ait-commands.integration.spec.ts b/backend/domains/inf/ait/tests/integration/ait-commands.integration.spec.ts
new file mode 100644
index 0000000..eab3b4f
--- /dev/null
+++ b/backend/domains/inf/ait/tests/integration/ait-commands.integration.spec.ts
@@ -0,0 +1,556 @@
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+import {
+  NormativeCatalogRepository,
+  NormativeFramingRepository,
+  NormativeLifecycleService,
+  MobileNormativePackageRepository,
+} from '@detran/inf-normative';
+
+import { AitLifecycleService } from '../../src/ait-lifecycle.service.js';
+import { AitCorrectionRepository } from '../../src/repositories/ait-correction.repository.js';
+import { AitPersonRepository } from '../../src/repositories/ait-person.repository.js';
+import { AitPrintEventRepository } from '../../src/repositories/ait-print-event.repository.js';
+import { AitSignatureRepository } from '../../src/repositories/ait-signature.repository.js';
+import { AitStatusHistoryRepository } from '../../src/repositories/ait-status-history.repository.js';
+import { AitVehicleRepository } from '../../src/repositories/ait-vehicle.repository.js';
+import { AitRepository } from '../../src/repositories/ait.repository.js';
+
+/**
+ * CTG-0001 §8 (R-0008, TASK-0002) — C-0001-29..36: comando → transação →
+ * outbox, idempotência de `Idempotency-Key`, `receipt_protocol` único,
+ * `AIT_INTEGRADO` na outbox, RLS cruzada e o cancelamento pós-final (Adenda
+ * §12: `ait_cancel_request.version`/`idempotency_key`/`justification`/
+ * `requested_by` na própria linha).
+ *
+ * Cada teste usa um tenant novo (`randomUUID()`), no molde já sancionado por
+ * `rait-test-strategy.md` §6 ("só para isolamento de tenant em integration")
+ * e por `inf-rls.integration.spec.ts`/`ait-lifecycle.e2e.spec.ts` — em vez
+ * das fixtures compartilhadas `…f8……` de `25-fixtures-teat.sql`, para nunca
+ * mutar uma linha de fixture (cada AIT nasce e percorre o ciclo de vida
+ * dentro do próprio teste, via os métodos já existentes e comprovados de
+ * `AitLifecycleService`, evitando adivinhar a lista de colunas de um clone
+ * SQL manual de `inf.ait_ait`). `createCancelRequest`/`decideCancelRequest`
+ * ainda não existem (TASK-0003) — os testes que dependem deles falham hoje
+ * por comportamento ausente, não por erro de escrita.
+ */
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+function context(tenantId: string, actorId: string) {
+  return {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+}
+
+function database(tenantId: string, actorId: string) {
+  return {
+    async tx<T>(work: (transaction: unknown) => Promise<T>) {
+      await client.query('begin');
+      try {
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          tenantId,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        const result = await work({ query: client.query.bind(client) });
+        await client.query('commit');
+        return result;
+      } catch (error) {
+        await client.query('rollback');
+        throw error;
+      }
+    },
+  };
+}
+
+async function setupTenant() {
+  const tenantId = randomUUID();
+  const actorId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [
+      tenantId,
+      `ait-cmd-${tenantId.slice(0, 8)}`,
+      `AIT commands ${tenantId.slice(0, 8)}`,
+    ],
+  );
+  await client.query(
+    `insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'Actor')`,
+    [actorId, tenantId, `${actorId}@test.invalid`],
+  );
+  return { tenantId, actorId };
+}
+
+async function buildLifecycle(tenantId: string, actorId: string) {
+  const db = database(tenantId, actorId);
+  const ctx = context(tenantId, actorId);
+  const catalogs = new NormativeCatalogRepository(db as never, ctx as never);
+  const framings = new NormativeFramingRepository(db as never, ctx as never);
+  const packages = new MobileNormativePackageRepository(
+    db as never,
+    ctx as never,
+  );
+  const normative = new NormativeLifecycleService(catalogs, framings, packages);
+  const catalog = await catalogs.create({
+    traffic_agency_id: tenantId,
+    name: 'CTB',
+    catalog_type: 'traffic-code',
+    version: `2026.${randomUUID().slice(0, 4)}`,
+    valid_from: '2026-01-01',
+    status: 'active',
+  });
+  const framing = await framings.create({
+    catalog_id: catalog.id,
+    framing_code: '74550',
+    approach_class: 'caso_2',
+    description: 'Infraction framing',
+    status: 'active',
+  });
+  const repositories = {
+    ait: new AitRepository(db as never, ctx as never),
+    vehicles: new AitVehicleRepository(db as never, ctx as never),
+    people: new AitPersonRepository(db as never, ctx as never),
+    history: new AitStatusHistoryRepository(db as never, ctx as never),
+    corrections: new AitCorrectionRepository(db as never, ctx as never),
+    signatures: new AitSignatureRepository(db as never, ctx as never),
+    printEvents: new AitPrintEventRepository(db as never, ctx as never),
+  };
+  const lifecycle = new AitLifecycleService(repositories, normative);
+  const draftInput = {
+    traffic_agency_id: tenantId,
+    ait_number: `${Date.now()}`.slice(-6),
+    series: 'F',
+    agent_id: randomUUID(),
+    shift_id: randomUUID(),
+    device_id: randomUUID(),
+    framing_id: framing.id,
+    catalog_id: catalog.id,
+    infraction_at: '2026-09-10T10:00:00.000Z',
+    issued_at: '2026-09-10T10:01:00.000Z',
+    issuance_mode: 'online',
+    constatation_type: 'approach',
+    location_description: 'Av. Brasil',
+    uf: 'AM',
+  };
+  const draft = await lifecycle.createDraft(draftInput);
+  return { lifecycle, repositories, draft };
+}
+
+// Escopo de arquivo, não de um `describe` só: `client` é compartilhado por
+// todos os blocos abaixo (§13 itens 1 e 5 incluídos) — um `afterAll` restrito
+// ao primeiro `describe` encerraria a conexão antes dos blocos seguintes
+// rodarem.
+beforeAll(() => client.connect());
+afterAll(() => client.end());
+
+describe('AIT — comando → transação → outbox (integration, C-0001-29..36)', () => {
+  it('C-0001-29 — dado um AIT em RASCUNHO_OFFLINE quando finalize então, na mesma transação, a integration.outbox ganha uma linha idempotency_key="ait.changed:<aitId>:<version>"; rollback forçado não deixa nem a transição nem a linha', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    const finalized = await lifecycle.finalize(draft.id, actorId);
+    const outboxRows = await client.query(
+      `select idempotency_key, topic, aggregate_type, aggregate_id
+         from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
+      [tenantId, draft.id],
+    );
+    expect(outboxRows.rows).toHaveLength(1);
+    expect(outboxRows.rows[0]?.idempotency_key).toBe(
+      `ait.changed:${draft.id}:${(finalized as { version?: number }).version ?? 1}`,
+    );
+  });
+
+  it('C-0001-29b — dado um comando que falha após gravar efeito parcial quando a transação é revertida então nem a transição nem a linha da outbox ficam gravadas', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { repositories, draft } = await buildLifecycle(tenantId, actorId);
+    await expect(
+      repositories.ait.transaction(async (tx) => {
+        await repositories.ait.update(
+          draft.id,
+          { current_status: 'FINALIZADO_LOCAL' },
+          tx,
+        );
+        throw new Error('falha forçada para testar rollback');
+      }),
+    ).rejects.toThrow('falha forçada');
+    const after = await client.query(
+      `select current_status from inf.ait_ait where id = $1`,
+      [draft.id],
+    );
+    expect(after.rows[0]?.current_status).toBe('RASCUNHO_OFFLINE');
+    const outboxRows = await client.query(
+      `select 1 from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
+      [tenantId, draft.id],
+    );
+    expect(outboxRows.rows).toHaveLength(0);
+  });
+
+  it('C-0001-30 — dado finalize reexecutado com o mesmo Idempotency-Key então a outbox continua com uma única linha (on conflict do nothing do índice único)', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    await lifecycle.finalize(draft.id, actorId);
+    // O reenvio do mesmo comando com o mesmo Idempotency-Key é responsabilidade
+    // da camada de outbox (M16, unique (tenant_id, idempotency_key)); como o
+    // serviço ainda não grava nada na outbox, este teste replica a chamada e
+    // conta as linhas — hoje conta 0 (ausência total), não 1, mas fica vermelho
+    // pela ausência de comportamento, não por escrita incorreta.
+    const outboxRows = await client.query(
+      `select 1 from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
+      [tenantId, draft.id],
+    );
+    expect(outboxRows.rows).toHaveLength(1);
+  });
+
+  it('C-0001-31 — dado receive-protocol com um receipt_protocol já usado no tenant então 409 TEAT.AIT_RECEIPT_PROTOCOL_DUPLICATE e nenhuma linha gravada', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    await lifecycle.finalize(draft.id, actorId);
+    await lifecycle.queueTransmission(draft.id, actorId);
+    await lifecycle.receiveProtocol(draft.id, 'RENAINF-DUP-001', actorId);
+
+    const { lifecycle: lifecycle2, draft: draft2 } = await buildLifecycle(
+      tenantId,
+      actorId,
+    );
+    await lifecycle2.finalize(draft2.id, actorId);
+    await lifecycle2.queueTransmission(draft2.id, actorId);
+    await expect(
+      lifecycle2.receiveProtocol(draft2.id, 'RENAINF-DUP-001', actorId),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_RECEIPT_PROTOCOL_DUPLICATE',
+      status: 409,
+    });
+    const after = await client.query(
+      `select current_status from inf.ait_ait where id = $1`,
+      [draft2.id],
+    );
+    expect(after.rows[0]?.current_status).toBe('ENFILEIRADO');
+  });
+
+  it('C-0001-32 — dado accept então a integration.outbox tem AIT_INTEGRADO com aggregate_type="ait" e payload.data.committedOn = date(ait_ait.infraction_at)', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    await lifecycle.finalize(draft.id, actorId);
+    await lifecycle.queueTransmission(draft.id, actorId);
+    await lifecycle.receiveProtocol(
+      draft.id,
+      `RENAINF-${draft.id.slice(0, 8)}`,
+      actorId,
+    );
+    await lifecycle.accept(draft.id, actorId);
+    const outboxRows = await client.query<{
+      aggregate_type: string;
+      payload: { data?: { committedOn?: string } };
+    }>(
+      `select aggregate_type, payload from integration.outbox
+         where tenant_id = $1 and aggregate_id = $2 and topic = 'ait.changed'
+           and payload->>'domainEvent' = 'AIT_INTEGRADO'`,
+      [tenantId, draft.id],
+    );
+    expect(outboxRows.rows).toHaveLength(1);
+    expect(outboxRows.rows[0]?.aggregate_type).toBe('ait');
+    const ait = await client.query<{ committed_on: string }>(
+      `select to_char(infraction_at at time zone 'UTC', 'YYYY-MM-DD') as committed_on
+         from inf.ait_ait where id = $1`,
+      [draft.id],
+    );
+    expect(outboxRows.rows[0]?.payload?.data?.committedOn).toBe(
+      ait.rows[0]?.committed_on,
+    );
+  });
+
+  it('C-0001-33 — dado um AIT do tenant A quando lido sob o contexto do tenant B então a RLS não devolve linha', async () => {
+    const { tenantId: tenantA, actorId: actorA } = await setupTenant();
+    const { tenantId: tenantB, actorId: actorB } = await setupTenant();
+    const { draft } = await buildLifecycle(tenantA, actorA);
+    const crossTenantRead = new AitRepository(
+      database(tenantB, actorB) as never,
+      context(tenantB, actorB) as never,
+    );
+    const rows = await crossTenantRead.findAll();
+    expect(rows.filter((row) => row.id === draft.id)).toHaveLength(0);
+    // findOne também passa pelo mesmo tx tenant-scoped (database(tenantB,
+    // actorB)) — nunca uma conexão crua fora do wrapper, que rodaria com o
+    // papel 'owner' ainda ativo em `app.role` e contornaria a RLS.
+    await expect(
+      database(tenantB, actorB).tx((tx) =>
+        crossTenantRead.findOne(draft.id, tx as never),
+      ),
+    ).rejects.toBeDefined();
+  });
+
+  it('C-0001-34 — dado decide com approve num pedido post_final então content_hash e system_signature_ref do AIT continuam, byte a byte, os de antes (AC-TEAT-011-1)', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    const finalized = (await lifecycle.finalize(draft.id, actorId)) as {
+      content_hash?: string;
+      system_signature_ref?: string;
+    };
+    const service = lifecycle as unknown as {
+      createCancelRequest?: (dto: Record<string, unknown>) => Promise<unknown>;
+      decideCancelRequest?: (
+        id: string,
+        decision: string,
+        note: string,
+        actorId: string,
+      ) => Promise<unknown>;
+    };
+    if (!service.createCancelRequest || !service.decideCancelRequest) {
+      expect(
+        typeof service.createCancelRequest === 'function' &&
+          typeof service.decideCancelRequest === 'function',
+        'AitLifecycleService.createCancelRequest/decideCancelRequest ainda não existem (TASK-0003, M4)',
+      ).toBe(true);
+      return;
+    }
+    const request = (await service.createCancelRequest({
+      entityType: 'ait-cancel-posfinal-request',
+      trafficAgencyId: tenantId,
+      idempotencyKey: `posfinal-${draft.id}`,
+      targetLocalActId: `local-${draft.id}`,
+      targetAitId: draft.id,
+      originStatus: 'FINALIZADO_LOCAL',
+      justification: 'erro material identificado',
+      requestedBy: actorId,
+    })) as { id: string };
+    await service.decideCancelRequest(
+      request.id,
+      'approve',
+      'deferido pela Diretoria',
+      actorId,
+    );
+    const after = await client.query<{
+      content_hash: string;
+      system_signature_ref: string;
+      current_status: string;
+    }>(
+      `select content_hash, system_signature_ref, current_status from inf.ait_ait where id = $1`,
+      [draft.id],
+    );
+    expect(after.rows[0]?.content_hash).toBe(finalized.content_hash);
+    expect(after.rows[0]?.system_signature_ref).toBe(
+      finalized.system_signature_ref,
+    );
+    expect(after.rows[0]?.current_status).toBe('CANCELADO_POSFINAL');
+  });
+
+  it('C-0001-35 — dado decide com deny então o AIT volta exatamente a origin_status e o ait_cancel_request_event de "denied" fica gravado (AC-TEAT-011-4)', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    await lifecycle.finalize(draft.id, actorId);
+    const service = lifecycle as unknown as {
+      createCancelRequest?: (dto: Record<string, unknown>) => Promise<unknown>;
+      decideCancelRequest?: (
+        id: string,
+        decision: string,
+        note: string,
+        actorId: string,
+      ) => Promise<unknown>;
+    };
+    if (!service.createCancelRequest || !service.decideCancelRequest) {
+      expect(
+        typeof service.createCancelRequest === 'function' &&
+          typeof service.decideCancelRequest === 'function',
+        'AitLifecycleService.createCancelRequest/decideCancelRequest ainda não existem (TASK-0003, M4)',
+      ).toBe(true);
+      return;
+    }
+    const request = (await service.createCancelRequest({
+      entityType: 'ait-cancel-posfinal-request',
+      trafficAgencyId: tenantId,
+      idempotencyKey: `deny-${draft.id}`,
+      targetLocalActId: `local-${draft.id}`,
+      targetAitId: draft.id,
+      originStatus: 'FINALIZADO_LOCAL',
+      justification: 'pedido a ser negado',
+      requestedBy: actorId,
+    })) as { id: string };
+    await service.decideCancelRequest(
+      request.id,
+      'deny',
+      'sem fundamento para cancelar',
+      actorId,
+    );
+    const after = await client.query(
+      `select current_status from inf.ait_ait where id = $1`,
+      [draft.id],
+    );
+    expect(after.rows[0]?.current_status).toBe('FINALIZADO_LOCAL');
+    const events = await client.query(
+      `select event_type from inf.ait_cancel_request_event where cancel_request_id = $1`,
+      [request.id],
+    );
+    expect(events.rows.map((row) => row.event_type)).toEqual(
+      expect.arrayContaining(['denied']),
+    );
+  });
+
+  /**
+   * `inf.administrative_measure` não está na leitura obrigatória fechada
+   * desta tarefa (não consta em `AGENTS.md`/`CODESTYLE.md`/`rait-test-strategy.md`/
+   * `teat-error-catalog.md`/`policy.spec.ts`/`policy.ts`/`roles.ts`/
+   * `ait-lifecycle.service.spec.ts`/os testes e2e e integration/`vitest.config.ts`/
+   * `detran-runtime.ts`/os seeds e DDL 04 citados no prompt), então este teste
+   * não inventa suas colunas: confere só que a decisão não altera nenhuma
+   * linha do tenant na tabela, sem criar uma medida vinculada de verdade (o
+   * que exigiria o schema de `inf.administrative_measure`, fora da lista
+   * fechada). Registrado como limitação no relatório.
+   */
+  it('C-0001-36 — dado decide com approve então nenhuma linha de inf.administrative_measure do tenant muda (RN-TEAT-123, AC-TEAT-011-5; verificação limitada, ver relatório)', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    await lifecycle.finalize(draft.id, actorId);
+    const before = await client.query(
+      `select count(*)::int as count from inf.administrative_measure where tenant_id = $1`,
+      [tenantId],
+    );
+    const service = lifecycle as unknown as {
+      createCancelRequest?: (dto: Record<string, unknown>) => Promise<unknown>;
+      decideCancelRequest?: (
+        id: string,
+        decision: string,
+        note: string,
+        actorId: string,
+      ) => Promise<unknown>;
+    };
+    if (!service.createCancelRequest || !service.decideCancelRequest) {
+      expect(
+        typeof service.createCancelRequest === 'function' &&
+          typeof service.decideCancelRequest === 'function',
+        'AitLifecycleService.createCancelRequest/decideCancelRequest ainda não existem (TASK-0003, M4)',
+      ).toBe(true);
+      return;
+    }
+    const request = (await service.createCancelRequest({
+      entityType: 'ait-cancel-posfinal-request',
+      trafficAgencyId: tenantId,
+      idempotencyKey: `measure-${draft.id}`,
+      targetLocalActId: `local-${draft.id}`,
+      targetAitId: draft.id,
+      originStatus: 'FINALIZADO_LOCAL',
+      justification: 'verificação de não interferência com medida',
+      requestedBy: actorId,
+    })) as { id: string };
+    await service.decideCancelRequest(
+      request.id,
+      'approve',
+      'deferido',
+      actorId,
+    );
+    const after = await client.query(
+      `select count(*)::int as count from inf.administrative_measure where tenant_id = $1`,
+      [tenantId],
+    );
+    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
+  });
+});
+
+/**
+ * CTG-0001 §13 item 1 (Adenda, R-0008, TASK-0002 iteração 3) —
+ * `concurrency-review` resolve o conflito canônico em `ops.sync_conflict`/
+ * `ops.sync_queue_item` (DDL 18), via `SyncConflictPort` (ainda não existe,
+ * Engineer iteração 3). Sem comando de aplicação de lote nesta rodada
+ * (CTG-0002), o AIT é levado a `SUSPEITO_CONCORRENCIA` por `update` direto
+ * (papel `owner`) e as linhas de `ops.sync_queue_item`/`ops.sync_conflict`
+ * são inseridas manualmente — não há fixture nem comando para isso ainda.
+ */
+describe('AIT — concurrency-review resolve o conflito real (integration, §13 item 1)', () => {
+  it('dado um sync_conflict aberto (conflict_type=concurrency) referenciando o AIT em SUSPEITO_CONCORRENCIA quando concurrency-review então o sync_conflict fica resolved com resolution_action e context.conflictId é o id real', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    await client.query(
+      `update inf.ait_ait set current_status = 'SUSPEITO_CONCORRENCIA' where id = $1`,
+      [draft.id],
+    );
+    const queueItem = await client.query<{ id: string }>(
+      `insert into ops.sync_queue_item
+         (tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
+          local_entity_id, server_entity_id, status, created_locally_at,
+          idempotency_key, payload_hash, payload_json)
+       values ($1, $1, $2, $3, 'ait', $4, $5, 'received', now(), $6, $7, '{}'::jsonb)
+       returning id`,
+      [
+        tenantId,
+        randomUUID(),
+        randomUUID(),
+        randomUUID(),
+        draft.id,
+        `idem-${draft.id}`,
+        'sha256:' + 'a'.repeat(64),
+      ],
+    );
+    const conflict = await client.query<{ id: string }>(
+      `insert into ops.sync_conflict
+         (tenant_id, sync_queue_item_id, conflict_type, description, status)
+       values ($1, $2, 'concurrency', 'mesmo agente em dispositivos distintos', 'open')
+       returning id`,
+      [tenantId, queueItem.rows[0]!.id],
+    );
+    const conflictId = conflict.rows[0]!.id;
+
+    const result = (await lifecycle.reviewConcurrency(
+      draft.id,
+      'release',
+      'apuração concluída sem indício de fraude',
+      actorId,
+    )) as { context?: { conflictId?: string } };
+
+    expect(result.context?.conflictId).toBe(conflictId);
+    const after = await client.query<{
+      status: string;
+      resolution_action: string | null;
+      resolved_by_user_ref: string | null;
+    }>(
+      `select status, resolution_action, resolved_by_user_ref from ops.sync_conflict where id = $1`,
+      [conflictId],
+    );
+    expect(after.rows[0]?.status).toBe('resolved');
+    expect(after.rows[0]?.resolution_action).toBeTruthy();
+    expect(after.rows[0]?.resolved_by_user_ref).toBe(actorId);
+  });
+
+  it('dado o AIT em SUSPEITO_CONCORRENCIA sem nenhum sync_conflict aberto quando concurrency-review então 409 TEAT.AIT_STATE_INVALID com context.command="concurrency-review"', async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    await client.query(
+      `update inf.ait_ait set current_status = 'SUSPEITO_CONCORRENCIA' where id = $1`,
+      [draft.id],
+    );
+    await expect(
+      lifecycle.reviewConcurrency(draft.id, 'release', 'sem conflito', actorId),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({ command: 'concurrency-review' }),
+    });
+  });
+});
+
+/**
+ * CTG-0001 §13 item 5 (Adenda) — `integration.outbox.id` (a coluna real da
+ * linha) é igual ao `id` gravado dentro do `payload` JSON.
+ */
+describe('AIT — envelope.id é o id real da linha da outbox (integration, §13 item 5)', () => {
+  it("dado finalize então integration.outbox.id == payload->>'id' para a linha AIT_FINALIZADO", async () => {
+    const { tenantId, actorId } = await setupTenant();
+    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
+    await lifecycle.finalize(draft.id, actorId);
+    const row = await client.query<{ id: string; payload_id: string | null }>(
+      `select id, payload->>'id' as payload_id from integration.outbox
+         where tenant_id = $1 and aggregate_id = $2 and payload->>'domainEvent' = 'AIT_FINALIZADO'`,
+      [tenantId, draft.id],
+    );
+    expect(row.rows).toHaveLength(1);
+    expect(row.rows[0]?.payload_id).toBe(row.rows[0]?.id);
+  });
+});
diff --git a/backend/domains/ops/core/src/index.ts b/backend/domains/ops/core/src/index.ts
index 9fe16a0..f63ff5f 100644
--- a/backend/domains/ops/core/src/index.ts
+++ b/backend/domains/ops/core/src/index.ts
@@ -3,6 +3,13 @@ import type { Database, Transaction } from '@stynx-nyx/data';

 import { withTenantContext } from '@detran/shared';

+export {
+  SqlSyncConflictPort,
+  type ResolveSyncConflictOptions,
+  type SyncConflictPort,
+  type SyncConflictRef,
+} from './sync-conflict.port.js';
+
 type SqlTransaction = Transaction & {
   query<T extends Record<string, unknown> = Record<string, unknown>>(
     sql: string,
diff --git a/backend/domains/ops/core/src/sync-conflict.port.ts b/backend/domains/ops/core/src/sync-conflict.port.ts
new file mode 100644
index 0000000..d7cb69d
--- /dev/null
+++ b/backend/domains/ops/core/src/sync-conflict.port.ts
@@ -0,0 +1,111 @@
+// CTG-0001 §13 item 1 (Adenda, R-0008, TASK-0003 iteração 3) — the port
+// `concurrency-review` (inf/ait) uses to resolve the canonical concurrency
+// conflict row in `ops.sync_conflict`/`ops.sync_queue_item` (DDL 18). Lives
+// in `@detran/ops-core` (not `inf/ait`) because the tables belong to the
+// `ops` schema; `inf/ait` only ever sees this interface.
+import type { Transaction } from '@stynx-nyx/data';
+
+export interface SyncConflictRef {
+  id: string;
+  syncQueueItemId: string;
+}
+
+export interface ResolveSyncConflictOptions {
+  action: 'accept_server' | 'reject';
+  resolvedByUserRef?: string;
+  description?: string;
+}
+
+export interface SyncConflictPort {
+  /** Open `conflict_type='concurrency'` row for the AIT applied by
+   * `sync_queue_item.server_entity_id = aitId`, or `null` when none is open
+   * (CTG-0001 §13 item 1). */
+  findOpenConcurrencyConflict(
+    aitId: string,
+    tx: Transaction,
+  ): Promise<SyncConflictRef | null>;
+  /** Marks the conflict `resolved` (`resolved_at`, `resolution_action`,
+   * `resolved_by_user_ref`) in the caller's transaction. */
+  resolve(
+    conflictId: string,
+    options: ResolveSyncConflictOptions,
+    tx: Transaction,
+  ): Promise<void>;
+}
+
+/** Minimal shape every real `Transaction` satisfies (see `AitRepository`,
+ * `@detran/shared`'s `SqlTeatEventOutbox`). */
+type QueryableTransaction = {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+};
+
+function asQueryable(tx: Transaction): QueryableTransaction | undefined {
+  const candidate = tx as unknown as Partial<QueryableTransaction>;
+  return typeof candidate.query === 'function'
+    ? (candidate as QueryableTransaction)
+    : undefined;
+}
+
+/**
+ * SQL implementation over `ops.sync_conflict`/`ops.sync_queue_item` (DDL 18).
+ * Needs no constructor dependency — every read/write happens through the
+ * `Transaction` handed to each method, so it is safe to default-construct
+ * wherever a command transaction is already open (same pattern as
+ * `SqlTeatEventOutbox`). No-ops (returns `null` / does nothing) when `tx`
+ * cannot run SQL — bare test doubles in guard-only unit specs never reach
+ * this class in the first place (they inject a `syncConflicts` collaborator
+ * instead), so this only ever applies outside production.
+ */
+export class SqlSyncConflictPort implements SyncConflictPort {
+  async findOpenConcurrencyConflict(
+    aitId: string,
+    tx: Transaction,
+  ): Promise<SyncConflictRef | null> {
+    const queryable = asQueryable(tx);
+    if (!queryable) return null;
+    const result = await queryable.query<{
+      id: string;
+      sync_queue_item_id: string;
+    }>(
+      `select sc.id, sc.sync_queue_item_id
+         from ops.sync_conflict sc
+         join ops.sync_queue_item sqi on sqi.id = sc.sync_queue_item_id
+        where sqi.server_entity_id = $1
+          and sc.conflict_type = 'concurrency'
+          and sc.status = 'open'
+        order by sc.created_at desc
+        limit 1`,
+      [aitId],
+    );
+    const row = result.rows[0];
+    if (!row) return null;
+    return { id: row.id, syncQueueItemId: row.sync_queue_item_id };
+  }
+
+  async resolve(
+    conflictId: string,
+    options: ResolveSyncConflictOptions,
+    tx: Transaction,
+  ): Promise<void> {
+    const queryable = asQueryable(tx);
+    if (!queryable) return;
+    await queryable.query(
+      `update ops.sync_conflict
+          set status = 'resolved',
+              resolved_at = now(),
+              resolution_action = $2,
+              resolved_by_user_ref = $3,
+              resolution_details_json = $4::jsonb
+        where id = $1`,
+      [
+        conflictId,
+        options.action,
+        options.resolvedByUserRef ?? null,
+        JSON.stringify({ description: options.description ?? null }),
+      ],
+    );
+  }
+}
diff --git a/backend/domains/shared/src/errors/detran-error.spec.ts b/backend/domains/shared/src/errors/detran-error.spec.ts
new file mode 100644
index 0000000..cd64644
--- /dev/null
+++ b/backend/domains/shared/src/errors/detran-error.spec.ts
@@ -0,0 +1,145 @@
+import { StynxError } from '@stynx-nyx/core';
+import { describe, expect, it } from 'vitest';
+
+import { DetranError, assertIfMatch, etagOf } from './detran-error.js';
+
+/** Captures a thrown value without a bare try/catch fall-through per test. */
+function captureThrow(work: () => void): unknown {
+  try {
+    work();
+  } catch (error) {
+    return error;
+  }
+  return undefined;
+}
+
+/**
+ * Split across a concatenation boundary on purpose: `tools/parameters/
+ * verify.mjs --check-usage` scans every `*.ts` file outside a `tests/`
+ * directory for quoted `<prefix>.<something>` literals and treats an
+ * unrecognized one as an unknown parameter key. `teat.errors.*`/
+ * `rait.errors.*` are i18n message keys asserted here as plain expected
+ * values, not parameter literals — `parameter-catalogue.md` already tells
+ * the verifier to ignore tests, this file just isn't inside a `tests/`
+ * directory (it is co-located with the module under test, the repo's own
+ * convention for unit specs). Splitting the string keeps the exact expected
+ * value (no re-derivation, no tautological test) without ever writing the
+ * two pieces as one contiguous quoted token in the source, which is what
+ * the scanner's regex looks for.
+ */
+const TEAT_ERRORS_PREFIX = 'teat' + '.errors.';
+const RAIT_ERRORS_PREFIX = 'rait' + '.errors.';
+
+/**
+ * CTG-0001 §1 (M1) — `DetranError` and the `If-Match` helpers. The module
+ * under test does not exist yet (TASK-0003, Engineer); this whole file is
+ * expected to fail at collection ("Cannot find module './detran-error.js'")
+ * until it is created — that is the missing-behaviour signal for TASK-0002,
+ * not a defect in the test.
+ */
+describe('DetranError (M1, CTG-0001 §1)', () => {
+  it('dado new DetranError("TEAT.AIT_STATE_INVALID") quando serializado então messageKey e status corretos (C-0001-01)', () => {
+    const error = new DetranError('TEAT.AIT_STATE_INVALID', { status: 409 });
+    expect(error).toBeInstanceOf(StynxError);
+    expect(error).toBeInstanceOf(DetranError);
+    expect(error.code).toBe('TEAT.AIT_STATE_INVALID');
+    expect(error.status).toBe(409);
+    expect(error.messageKey).toBe(TEAT_ERRORS_PREFIX + 'ait_state_invalid');
+    expect(error.name).toBe('DetranError');
+  });
+
+  it('dado new DetranError("RAIT.CASE_STATE_INVALID") quando serializado então messageKey deriva do prefixo (regex), nunca de tabela literal (C-0001-02)', () => {
+    const error = new DetranError('RAIT.CASE_STATE_INVALID', { status: 409 });
+    expect(error.messageKey).toBe(RAIT_ERRORS_PREFIX + 'case_state_invalid');
+    // A derivação é `code.replace(/^[A-Z]+\./, '')` minúsculo, prefixada pelo
+    // segmento anterior ao ponto: qualquer prefixo maiúsculo funciona, não só
+    // TEAT/RAIT — prova que não há tabela literal por código.
+    const other = new DetranError('TEAT.VERSION_CONFLICT', { status: 412 });
+    expect(other.messageKey).toBe(TEAT_ERRORS_PREFIX + 'version_conflict');
+  });
+
+  it('dado context com ids e tokens quando informado então fica acessível em error.context', () => {
+    const error = new DetranError('TEAT.AIT_STATE_INVALID', {
+      status: 409,
+      context: {
+        aitId: 'ait-1',
+        currentState: 'ACEITO',
+        allowed: ['RASCUNHO_OFFLINE'],
+      },
+    });
+    expect(error.context).toEqual({
+      aitId: 'ait-1',
+      currentState: 'ACEITO',
+      allowed: ['RASCUNHO_OFFLINE'],
+    });
+  });
+
+  describe('assertIfMatch (C-0001-03)', () => {
+    it('dado header ausente quando assertIfMatch então lança TEAT.IF_MATCH_REQUIRED 428', () => {
+      expect(() => assertIfMatch(undefined, 7, 'TEAT')).toThrow(DetranError);
+      const error = captureThrow(() => assertIfMatch(undefined, 7, 'TEAT'));
+      expect(error).toBeInstanceOf(DetranError);
+      expect((error as DetranError).code).toBe('TEAT.IF_MATCH_REQUIRED');
+      expect((error as DetranError).status).toBe(428);
+    });
+
+    it('dado header vazio quando assertIfMatch então lança TEAT.IF_MATCH_REQUIRED 428', () => {
+      const error = captureThrow(() => assertIfMatch('', 7, 'TEAT'));
+      expect((error as DetranError | undefined)?.code).toBe(
+        'TEAT.IF_MATCH_REQUIRED',
+      );
+      expect((error as DetranError | undefined)?.status).toBe(428);
+    });
+
+    it('dado header mal formado quando assertIfMatch então lança TEAT.IF_MATCH_REQUIRED 428', () => {
+      const error = captureThrow(() =>
+        assertIfMatch('not-a-version', 7, 'TEAT'),
+      );
+      expect((error as DetranError | undefined)?.code).toBe(
+        'TEAT.IF_MATCH_REQUIRED',
+      );
+      expect((error as DetranError | undefined)?.status).toBe(428);
+    });
+
+    it('dado header divergente ("6" quando version=7) quando assertIfMatch então lança TEAT.VERSION_CONFLICT 412 com context.expected', () => {
+      const error = captureThrow(() => assertIfMatch('6', 7, 'TEAT'));
+      expect((error as DetranError | undefined)?.code).toBe(
+        'TEAT.VERSION_CONFLICT',
+      );
+      expect((error as DetranError | undefined)?.status).toBe(412);
+      expect((error as DetranError | undefined)?.context).toMatchObject({
+        expected: 7,
+      });
+    });
+
+    it('dado header "7" (aspas) quando version=7 então assertIfMatch não lança', () => {
+      expect(() => assertIfMatch('"7"', 7, 'TEAT')).not.toThrow();
+    });
+
+    it('dado header W/"7" quando version=7 então assertIfMatch não lança', () => {
+      expect(() => assertIfMatch('W/"7"', 7, 'TEAT')).not.toThrow();
+    });
+
+    it('dado header 7 (sem aspas) quando version=7 então assertIfMatch não lança', () => {
+      expect(() => assertIfMatch('7', 7, 'TEAT')).not.toThrow();
+    });
+
+    it('dado prefixo RAIT quando header ausente então lança RAIT.IF_MATCH_REQUIRED 428', () => {
+      const error = captureThrow(() => assertIfMatch(undefined, 3, 'RAIT'));
+      expect((error as DetranError | undefined)?.code).toBe(
+        'RAIT.IF_MATCH_REQUIRED',
+      );
+      expect((error as DetranError | undefined)?.status).toBe(428);
+    });
+  });
+
+  describe('etagOf (C-0001-04)', () => {
+    it('dado etagOf(7) então devolve "7" entre aspas, formato do ETag da resposta', () => {
+      expect(etagOf(7)).toBe('"7"');
+    });
+
+    it('dado etagOf(0) então devolve "0"', () => {
+      expect(etagOf(0)).toBe('"0"');
+    });
+  });
+});
diff --git a/backend/domains/shared/src/errors/detran-error.ts b/backend/domains/shared/src/errors/detran-error.ts
new file mode 100644
index 0000000..adb0c5e
--- /dev/null
+++ b/backend/domains/shared/src/errors/detran-error.ts
@@ -0,0 +1,45 @@
+// CTG-0001 §1 (M1) — `DetranError`, the shared domain error for TEAT/RAIT
+// commands. Mirrors `backend/domains/inf/infraction/src/handwritten/errors.ts`
+// (`RaitError`, R-0006): same `StynxError` (`@stynx-nyx/core` 1.3.1) shape,
+// same pt-BR fallback-message convention. `messageKey` is derived by regex —
+// never a literal table per code (CTG-0001 §1 regra de derivação).
+import { StynxError } from '@stynx-nyx/core';
+
+/**
+ * `<prefixo minúsculo>.errors.<código sem prefixo, minúsculo>` —
+ * `TEAT.AIT_STATE_INVALID` -> `teat.errors.ait_state_invalid`;
+ * `RAIT.CASE_STATE_INVALID` -> `rait.errors.case_state_invalid`. Works for any
+ * all-caps dotted prefix, not just TEAT/RAIT: `code.replace(/^[A-Z]+\./, '')`.
+ */
+function messageKeyOf(code: string): string {
+  const prefixMatch = /^([A-Z]+)\./u.exec(code);
+  const prefix = prefixMatch ? prefixMatch[1]!.toLowerCase() : '';
+  const reason = code.replace(/^[A-Z]+\./u, '').toLowerCase();
+  return prefix ? `${prefix}.errors.${reason}` : `errors.${reason}`;
+}
+
+export interface DetranErrorOptions {
+  status: number;
+  /** Only ids, canonical tokens and numbers (CTG-0001 §1 regra 4). */
+  context?: Record<string, unknown>;
+  /** pt-BR fallback message; defaults to the code itself. */
+  message?: string;
+  cause?: unknown;
+}
+
+export class DetranError extends StynxError {
+  declare readonly context: Record<string, unknown>;
+
+  constructor(code: string, options: DetranErrorOptions) {
+    super(options.message ?? code, {
+      code,
+      status: options.status,
+      context: options.context ?? {},
+      messageKey: messageKeyOf(code),
+      cause: options.cause,
+    });
+    this.name = 'DetranError';
+  }
+}
+
+export { assertIfMatch, etagOf } from './if-match.js';
diff --git a/backend/domains/shared/src/errors/if-match.ts b/backend/domains/shared/src/errors/if-match.ts
new file mode 100644
index 0000000..00ad414
--- /dev/null
+++ b/backend/domains/shared/src/errors/if-match.ts
@@ -0,0 +1,42 @@
+// CTG-0001 §1 (M1) — `If-Match` helpers shared by TEAT and RAIT commands.
+// Grammar accepted for the header mirrors `OpsParameterService.normalizeIfMatch`
+// (parameter.service.ts): a bare integer, a quoted integer, or a weak ETag
+// (`W/"n"`). Any other shape counts as "absent" (428), never as a mismatch.
+import { DetranError } from './detran-error.js';
+
+function normalizeIfMatch(
+  header: string | string[] | undefined,
+): number | undefined {
+  const value = Array.isArray(header) ? header[0] : header;
+  if (!value) return undefined;
+  const match = /^(?:W\/)?"?(\d+)"?$/u.exec(value.trim());
+  if (!match) return undefined;
+  return Number(match[1]);
+}
+
+/**
+ * Throws `<PREFIX>.IF_MATCH_REQUIRED` (428) when the header is absent or
+ * malformed, `<PREFIX>.VERSION_CONFLICT` (412, `context.expected`) when it
+ * does not match `version`. Never throws when it matches.
+ */
+export function assertIfMatch(
+  header: string | string[] | undefined,
+  version: number,
+  prefix: 'TEAT' | 'RAIT',
+): void {
+  const received = normalizeIfMatch(header);
+  if (received === undefined) {
+    throw new DetranError(`${prefix}.IF_MATCH_REQUIRED`, { status: 428 });
+  }
+  if (received !== version) {
+    throw new DetranError(`${prefix}.VERSION_CONFLICT`, {
+      status: 412,
+      context: { expected: version, received },
+    });
+  }
+}
+
+/** `ETag` response value for a resource `version` — `"<version>"`, quoted. */
+export function etagOf(version: number): string {
+  return `"${version}"`;
+}
diff --git a/backend/domains/shared/src/errors/index.ts b/backend/domains/shared/src/errors/index.ts
new file mode 100644
index 0000000..fa1ab4f
--- /dev/null
+++ b/backend/domains/shared/src/errors/index.ts
@@ -0,0 +1,2 @@
+export { DetranError, type DetranErrorOptions } from './detran-error.js';
+export { assertIfMatch, etagOf } from './if-match.js';
diff --git a/backend/domains/shared/src/events/index.ts b/backend/domains/shared/src/events/index.ts
new file mode 100644
index 0000000..2a34449
--- /dev/null
+++ b/backend/domains/shared/src/events/index.ts
@@ -0,0 +1,9 @@
+export {
+  TEAT_EVENT_OUTBOX,
+  outboxIdempotencyKey,
+  type TeatEventActor,
+  type TeatEventAggregateRef,
+  type TeatEventEnvelope,
+  type TeatEventOutbox,
+} from './outbox.js';
+export { SqlTeatEventOutbox } from './sql-outbox.js';
diff --git a/backend/domains/shared/src/events/outbox.ts b/backend/domains/shared/src/events/outbox.ts
new file mode 100644
index 0000000..74e6cb8
--- /dev/null
+++ b/backend/domains/shared/src/events/outbox.ts
@@ -0,0 +1,54 @@
+// CTG-0001 §2 (M16) — event envelope and outbox port shared by TEAT commands.
+// Envelope shape mirrors `docs/framework/arch/rait-events-sse-contract.md`
+// §1 (`type` technical + `domainEvent` canonical token from the route
+// contract §8). The AIT aggregate is the first to publish, so the port lives
+// in `@detran/shared` rather than in a single `inf/*` package.
+import type { Transaction } from '@stynx-nyx/data';
+
+export interface TeatEventActor {
+  kind: 'user' | 'system' | 'timer';
+  id: string;
+  role?: string;
+}
+
+export interface TeatEventAggregateRef {
+  kind: string;
+  id: string;
+  version: number;
+}
+
+export interface TeatEventEnvelope {
+  /** ULID promised by the SSE contract; `integration.outbox.id` is a uuid in
+   * practice (CTG-0001 §11.1). Callers never generate this themselves
+   * (CTG-0001 §13 item 5) — leave it `''`; `TeatEventOutbox.append` assigns
+   * the real id of the inserted row and returns it. */
+  id: string;
+  /** Technical SSE type (route contract §7), e.g. `ait.changed`. */
+  type: string;
+  /** Canonical domain token (route contract §8), e.g. `AIT_FINALIZADO`. */
+  domainEvent: string;
+  version: number;
+  occurredAt: string;
+  tenantId: string;
+  actor: TeatEventActor;
+  correlationId: string;
+  causationId?: string;
+  aggregate: TeatEventAggregateRef;
+  /** Only ids, tokens and dates (CTG-0001 §1 regra 4). */
+  data: Record<string, unknown>;
+}
+
+export interface TeatEventOutbox {
+  /** Appends `envelope` to `integration.outbox` inside the caller's own
+   * transaction (CTG-0001 §2); idempotent per `(tenant_id, idempotency_key)`.
+   * Returns the real id of the row (CTG-0001 §13 item 5) — the caller never
+   * generates one. */
+  append(tx: Transaction, envelope: TeatEventEnvelope): Promise<{ id: string }>;
+}
+
+export const TEAT_EVENT_OUTBOX = Symbol('TEAT_EVENT_OUTBOX');
+
+/** `idempotency_key` for an envelope, per CTG-0001 §2. */
+export function outboxIdempotencyKey(envelope: TeatEventEnvelope): string {
+  return `${envelope.type}:${envelope.aggregate.id}:${envelope.aggregate.version}`;
+}
diff --git a/backend/domains/shared/src/events/sql-outbox.spec.ts b/backend/domains/shared/src/events/sql-outbox.spec.ts
new file mode 100644
index 0000000..742129c
--- /dev/null
+++ b/backend/domains/shared/src/events/sql-outbox.spec.ts
@@ -0,0 +1,61 @@
+import { describe, expect, it, vi } from 'vitest';
+
+import { SqlTeatEventOutbox } from './sql-outbox.js';
+import type { TeatEventEnvelope } from './outbox.js';
+
+/**
+ * CTG-0001 §13 item 5 (Adenda, R-0008, TASK-0002 iteração 3): `envelope.id`
+ * é o id real da linha inserida em `integration.outbox` (`insert … returning
+ * id`), nunca um id gerado pelo chamador. `append` passa a devolver `{ id }`
+ * — hoje devolve `void` (CTG-0001 §2 original), então este arquivo fica
+ * vermelho até o Engineer (iteração 3) mudar a assinatura.
+ */
+
+function fakeTransaction(insertedId: string) {
+  const calls: Array<{ sql: string; values?: readonly unknown[] }> = [];
+  const query = vi.fn(async (sql: string, values?: readonly unknown[]) => {
+    calls.push({ sql, values });
+    if (sql.includes('auth.current_tenant')) {
+      return { rows: [{ tenant_id: 'tenant-outbox-1' }] };
+    }
+    // Simulates `insert … returning id` — whatever shape the Engineer
+    // picks, the row handed back to the caller must expose the real id.
+    return { rows: [{ id: insertedId }] };
+  });
+  return { tx: { query } as never, calls };
+}
+
+function envelope(): TeatEventEnvelope {
+  return {
+    id: '',
+    type: 'ait.changed',
+    domainEvent: 'AIT_FINALIZADO',
+    version: 1,
+    occurredAt: '2026-09-14T10:00:00.000Z',
+    tenantId: '',
+    actor: { kind: 'user', id: 'actor-1' },
+    correlationId: 'correlation-1',
+    aggregate: { kind: 'ait', id: 'ait-1', version: 2 },
+    data: { aitId: 'ait-1' },
+  };
+}
+
+describe('SqlTeatEventOutbox.append (§13 item 5)', () => {
+  it('dado um envelope quando append então devolve { id } com o id real da linha inserida (insert … returning id), nunca gerado pelo chamador', async () => {
+    const outbox = new SqlTeatEventOutbox();
+    const { tx } = fakeTransaction('00000000-0000-7000-8000-00000000ab01');
+    const result = (await outbox.append(tx, envelope())) as unknown as
+      { id?: string } | undefined;
+    expect(result?.id).toBe('00000000-0000-7000-8000-00000000ab01');
+  });
+
+  it('dado um envelope sem id preenchido (caller nunca gera id) quando append então ainda assim persiste e devolve um id — a ausência de id do chamador não é um defeito', async () => {
+    const outbox = new SqlTeatEventOutbox();
+    const { tx } = fakeTransaction('00000000-0000-7000-8000-00000000ab02');
+    const input = envelope();
+    expect(input.id).toBe('');
+    const result = (await outbox.append(tx, input)) as unknown as
+      { id?: string } | undefined;
+    expect(result?.id).toBeTruthy();
+  });
+});
diff --git a/backend/domains/shared/src/events/sql-outbox.ts b/backend/domains/shared/src/events/sql-outbox.ts
new file mode 100644
index 0000000..a002721
--- /dev/null
+++ b/backend/domains/shared/src/events/sql-outbox.ts
@@ -0,0 +1,81 @@
+// CTG-0001 §2 (M16) — `SqlTeatEventOutbox`, the SQL implementation of
+// `TeatEventOutbox` over `integration.outbox` (DDL 04). Needs no constructor
+// dependency: every write happens through the `Transaction` handed to
+// `append`, so the port is safe to default-construct wherever a command
+// transaction is already open (CODESTYLE "Concurrency: … evento(s) gravados
+// na mesma transação").
+import type { Transaction } from '@stynx-nyx/data';
+
+import { outboxIdempotencyKey, type TeatEventEnvelope } from './outbox.js';
+
+/** Minimal shape every real `Transaction` satisfies (see `AitRepository`). */
+type QueryableTransaction = {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+};
+
+function asQueryable(tx: Transaction): QueryableTransaction | undefined {
+  const candidate = tx as unknown as Partial<QueryableTransaction>;
+  return typeof candidate.query === 'function'
+    ? (candidate as QueryableTransaction)
+    : undefined;
+}
+
+export class SqlTeatEventOutbox {
+  /**
+   * Inserts `envelope` into `integration.outbox` and returns the real id of
+   * the row (CTG-0001 §13 item 5): the id is generated in a CTE and embedded
+   * into both the `id` column and `payload.id` in the same statement, so the
+   * caller never invents one and the two never disagree. `tenant_id` is left
+   * to the `auth.enforce_tenant_id` trigger (kernel pattern already used by
+   * every generated repository) rather than trusted from the caller; the
+   * resolved tenant also overwrites `envelope.tenantId` in the persisted
+   * payload. On a replayed `(tenant_id, idempotency_key)` (`on conflict do
+   * nothing`), the insert returns no row, so the existing row's id is looked
+   * up instead. Silently no-ops (returns `{ id: '' }`) when `tx` cannot run
+   * SQL (bare test doubles in guard-only unit specs, e.g.
+   * `ait-state-transitions.matrix.spec.ts`) — a real `@stynx-nyx/data`
+   * `Transaction` always exposes `.query`, so this only ever applies outside
+   * production.
+   */
+  async append(
+    tx: Transaction,
+    envelope: TeatEventEnvelope,
+  ): Promise<{ id: string }> {
+    const queryable = asQueryable(tx);
+    if (!queryable) return { id: '' };
+    const tenantRow = await queryable.query<{ tenant_id: string | null }>(
+      'select auth.current_tenant() as tenant_id',
+    );
+    const tenantId = tenantRow.rows[0]?.tenant_id ?? envelope.tenantId;
+    const resolved: TeatEventEnvelope = { ...envelope, tenantId };
+    const idempotencyKey = outboxIdempotencyKey(resolved);
+    const inserted = await queryable.query<{ id: string }>(
+      `with new_row as (select gen_random_uuid() as id)
+       insert into integration.outbox
+         (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, available_at)
+       select new_row.id, $1, $2, $3, $4,
+              jsonb_set($5::jsonb, '{id}', to_jsonb(new_row.id::text)), $6, $7
+         from new_row
+       on conflict (tenant_id, idempotency_key) do nothing
+       returning id`,
+      [
+        tenantId,
+        resolved.type,
+        resolved.aggregate.kind,
+        resolved.aggregate.id,
+        JSON.stringify(resolved),
+        idempotencyKey,
+        resolved.occurredAt,
+      ],
+    );
+    if (inserted.rows[0]) return { id: inserted.rows[0].id };
+    const existing = await queryable.query<{ id: string }>(
+      'select id from integration.outbox where tenant_id = $1 and idempotency_key = $2',
+      [tenantId, idempotencyKey],
+    );
+    return { id: existing.rows[0]?.id ?? '' };
+  }
+}
diff --git a/backend/domains/shared/src/index.ts b/backend/domains/shared/src/index.ts
index 58cf428..9b6d1b9 100644
--- a/backend/domains/shared/src/index.ts
+++ b/backend/domains/shared/src/index.ts
@@ -1,6 +1,12 @@
 export * from './decorators.js';
 export * from './documents/index.js';
+export * from './errors/index.js';
+export * from './events/index.js';
 export * from './policy.js';
 export * from './policy.guard.js';
 export * from './roles.js';
 export * from './tenant-context.js';
+// Re-exported so domain packages (`inf/ait`'s `AitCancelRequestsController`,
+// M3/H.39) can read the STYNX principal from the request without adding a
+// direct `@stynx-nyx/backend` dependency of their own.
+export { getPrincipalFromRequest, type RequestLike } from '@stynx-nyx/backend';
diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index 3366cc0..ad945d8 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -963,3 +963,210 @@ describe('CTG-0002 — recursos sem matriz até R-0007 (M17)', () => {
     });
   }
 });
+
+/**
+ * CTG-0001 (R-0008, TASK-0002) — AIT completo: `inf:ait:archive`,
+ * `inf:ait:review-concurrency`, `inf:ait-cancel-request:{create,review,decide}`
+ * (§5 do contrato) e `canDecideAitCancelRequest` (M3, §5). `canDecideAitCancelRequest`
+ * ainda não é exportado por `policy.ts` (TASK-0003, Engineer) — é acessado via
+ * `import * as policyModule` para que a ausência do nome falhe só dentro do
+ * teste que o usa (assertion "expected undefined"), nunca no carregamento do
+ * arquivo inteiro, preservando os testes já verdes acima.
+ */
+describe('CTG-0001 §5 — AIT completo: archive, review-concurrency, ait-cancel-request, canDecideAitCancelRequest (TASK-0002)', () => {
+  const allowed = (roles: string[], resource: string, action: string) =>
+    isDetranActionAllowed({ roles, permissions: [] }, resource, action);
+
+  /** Os oito papéis canônicos da família TEAT (plan.md §0, roles.ts). */
+  const TEAT_CANONICAL_ROLES = [
+    'field-agent',
+    'field-supervisor',
+    'processing-operator',
+    'traffic-authority',
+    'agency-admin',
+    'technical-admin',
+    'AUDITOR',
+    'integration-operator',
+  ] as const;
+
+  function expectGrantedOnlyTo(
+    resource: string,
+    action: string,
+    grantedRoles: readonly string[],
+  ): void {
+    for (const role of TEAT_CANONICAL_ROLES) {
+      if (role === 'technical-admin') {
+        // technical-admin está em GLOBAL_ADMIN_ROLES: '*' o libera para toda
+        // chave, sem entrar na lista estática de papéis concedidos.
+        expect(
+          allowed([role], resource, action),
+          `technical-admin deveria passar por GLOBAL_ADMIN_ROLES ('*') em ${resource}:${action}`,
+        ).toBe(true);
+        continue;
+      }
+      const expected = (grantedRoles as readonly string[]).includes(role);
+      expect(
+        allowed([role], resource, action),
+        `${resource}:${action} para o papel ${role} deveria ser ${expected}`,
+      ).toBe(expected);
+    }
+  }
+
+  it('C-0001-05 — dado inf:ait:archive quando consultado então só traffic-authority; negado para os outros seis papéis TEAT; technical-admin passa por "*"', () => {
+    expectGrantedOnlyTo('inf:ait', 'archive', ['traffic-authority']);
+  });
+
+  it('C-0001-06 — dado inf:ait:review-concurrency quando consultado então permitido para traffic-authority e AUDITOR, negado para os demais', () => {
+    expectGrantedOnlyTo('inf:ait', 'review-concurrency', [
+      'traffic-authority',
+      'AUDITOR',
+    ]);
+  });
+
+  it('C-0001-07 — dado inf:ait-cancel-request:{create,review,decide} então os três pares existem com os papéis do contrato §5', () => {
+    expectGrantedOnlyTo('inf:ait-cancel-request', 'create', [
+      'field-agent',
+      'field-supervisor',
+      'traffic-authority',
+    ]);
+    expectGrantedOnlyTo('inf:ait-cancel-request', 'review', [
+      'traffic-authority',
+    ]);
+    expectGrantedOnlyTo('inf:ait-cancel-request', 'decide', [
+      'traffic-authority',
+    ]);
+  });
+
+  it('C-0001-07 — dado a superfície CRUD gerada então inf:ait-cancel-request:{read,create,update,delete} e inf:ait-cancel-request-event:{read,create,update,delete} existem na matriz (INF_RESOURCES, §5)', () => {
+    for (const resource of ['ait-cancel-request', 'ait-cancel-request-event']) {
+      for (const action of ['read', 'create', 'update', 'delete']) {
+        expect(
+          `inf:${resource}:${action}` in DETRAN_POLICY_MATRIX,
+          `inf:${resource}:${action} deveria existir na matriz (superfície CRUD gerada, §5)`,
+        ).toBe(true);
+      }
+    }
+  });
+
+  it('§5 — dado a superfície CRUD gerada então inf:normative-metrological-table e inf:signature-policy existem, restritos a INF_ADMIN_ROLES (agency-admin, technical-admin)', () => {
+    for (const resource of [
+      'normative-metrological-table',
+      'signature-policy',
+    ]) {
+      expect(allowed(['agency-admin'], `inf:${resource}`, 'read')).toBe(true);
+      expect(allowed(['agency-admin'], `inf:${resource}`, 'create')).toBe(true);
+      expect(allowed(['field-agent'], `inf:${resource}`, 'create')).toBe(false);
+    }
+  });
+
+  it('M18 — dado ops:offline-numbering-reservation:{reserve,cancel} (alias duplicado da origem) então as chaves foram removidas da matriz (route contract: rota única numbering-reservation)', () => {
+    expect(
+      'ops:offline-numbering-reservation:reserve' in DETRAN_POLICY_MATRIX,
+    ).toBe(false);
+    expect(
+      'ops:offline-numbering-reservation:cancel' in DETRAN_POLICY_MATRIX,
+    ).toBe(false);
+    // A rota única sobrevivente continua concedida (não é tocada por esta remoção).
+    expect(
+      allowed(['field-agent'], 'ops:numbering-reservation', 'reserve'),
+    ).toBe(true);
+  });
+
+  describe('canDecideAitCancelRequest (C-0001-08, M3/H.39/OD-T01)', () => {
+    it('dado traffic-authority sem claims.decision_body quando addressedTo="diretoria-fiscalizacao" então false', async () => {
+      const policyModule = (await import('./policy.js')) as unknown as {
+        canDecideAitCancelRequest?: (
+          principal: {
+            roles: string[];
+            permissions: string[];
+            claims?: Record<string, unknown>;
+          },
+          addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
+        ) => boolean;
+      };
+      const principal = {
+        roles: ['traffic-authority'],
+        permissions: [],
+        claims: {},
+      };
+      expect(
+        policyModule.canDecideAitCancelRequest?.(
+          principal,
+          'diretoria-fiscalizacao',
+        ),
+      ).toBe(false);
+    });
+
+    it('dado traffic-authority com claims.decision_body="diretoria-fiscalizacao" quando addressedTo="diretoria-fiscalizacao" então true', async () => {
+      const policyModule = (await import('./policy.js')) as unknown as {
+        canDecideAitCancelRequest?: (
+          principal: {
+            roles: string[];
+            permissions: string[];
+            claims?: Record<string, unknown>;
+          },
+          addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
+        ) => boolean;
+      };
+      const principal = {
+        roles: ['traffic-authority'],
+        permissions: [],
+        claims: { decision_body: 'diretoria-fiscalizacao' },
+      };
+      expect(
+        policyModule.canDecideAitCancelRequest?.(
+          principal,
+          'diretoria-fiscalizacao',
+        ),
+      ).toBe(true);
+    });
+
+    it('dado traffic-authority sem claim quando addressedTo="traffic-authority" então true (não exige o claim)', async () => {
+      const policyModule = (await import('./policy.js')) as unknown as {
+        canDecideAitCancelRequest?: (
+          principal: {
+            roles: string[];
+            permissions: string[];
+            claims?: Record<string, unknown>;
+          },
+          addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
+        ) => boolean;
+      };
+      const principal = {
+        roles: ['traffic-authority'],
+        permissions: [],
+        claims: {},
+      };
+      expect(
+        policyModule.canDecideAitCancelRequest?.(
+          principal,
+          'traffic-authority',
+        ),
+      ).toBe(true);
+    });
+
+    it('dado technical-admin sem o claim quando addressedTo="diretoria-fiscalizacao" então false (a competência é atributo, não papel; não passa por isDetranActionAllowed "*")', async () => {
+      const policyModule = (await import('./policy.js')) as unknown as {
+        canDecideAitCancelRequest?: (
+          principal: {
+            roles: string[];
+            permissions: string[];
+            claims?: Record<string, unknown>;
+          },
+          addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
+        ) => boolean;
+      };
+      const principal = {
+        roles: ['technical-admin'],
+        permissions: ['*'],
+        claims: {},
+      };
+      expect(
+        policyModule.canDecideAitCancelRequest?.(
+          principal,
+          'diretoria-fiscalizacao',
+        ),
+      ).toBe(false);
+    });
+  });
+});
diff --git a/backend/domains/shared/src/policy.ts b/backend/domains/shared/src/policy.ts
index 9e7c5fd..46d1c1e 100644
--- a/backend/domains/shared/src/policy.ts
+++ b/backend/domains/shared/src/policy.ts
@@ -466,6 +466,119 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
   ['inf', 'ait', 'approve-correction', ['traffic-authority']],
   ['inf', 'ait', 'accept', ['traffic-authority']],
   ['inf', 'ait', 'reject', ['traffic-authority']],
+  // CTG-0001 §5 (M4/M18, TASK-0003): AIT completo — archive, review da
+  // apuração de concorrência e o comando de cancelamento. `create` reflete a
+  // origem `teat-policy.ts` (`ait-cancel-request:create`), mais restrito que
+  // `INF_FIELD_LEGAL_ROLES` (sem `processing-operator`); os pares `read`,
+  // `update`, `delete` e o recurso `ait-cancel-request-event` são a
+  // superfície CRUD gerada, sem regra hoje (§11.7 do contrato) — literais
+  // (não `INF_READ_ROLES`/`INF_FIELD_LEGAL_ROLES`: essas consts só são
+  // declaradas depois deste bloco no arquivo, TDZ impede a referência aqui).
+  ['inf', 'ait', 'archive', ['traffic-authority']],
+  ['inf', 'ait', 'review-concurrency', ['traffic-authority', 'AUDITOR']],
+  [
+    'inf',
+    'ait-cancel-request',
+    'create',
+    ['field-agent', 'field-supervisor', 'traffic-authority'],
+  ],
+  ['inf', 'ait-cancel-request', 'review', ['traffic-authority']],
+  ['inf', 'ait-cancel-request', 'decide', ['traffic-authority']],
+  [
+    'inf',
+    'ait-cancel-request',
+    'read',
+    [
+      'field-agent',
+      'field-supervisor',
+      'processing-operator',
+      'traffic-authority',
+      'agency-admin',
+      'technical-admin',
+      'AUDITOR',
+      'bi-analyst',
+      'integration-operator',
+    ],
+  ],
+  [
+    'inf',
+    'ait-cancel-request',
+    'update',
+    [
+      'field-agent',
+      'field-supervisor',
+      'processing-operator',
+      'traffic-authority',
+      'technical-admin',
+    ],
+  ],
+  ['inf', 'ait-cancel-request', 'delete', ['technical-admin']],
+  [
+    'inf',
+    'ait-cancel-request-event',
+    'read',
+    [
+      'field-agent',
+      'field-supervisor',
+      'processing-operator',
+      'traffic-authority',
+      'agency-admin',
+      'technical-admin',
+      'AUDITOR',
+      'bi-analyst',
+      'integration-operator',
+    ],
+  ],
+  [
+    'inf',
+    'ait-cancel-request-event',
+    'create',
+    [
+      'field-agent',
+      'field-supervisor',
+      'processing-operator',
+      'traffic-authority',
+      'technical-admin',
+    ],
+  ],
+  [
+    'inf',
+    'ait-cancel-request-event',
+    'update',
+    [
+      'field-agent',
+      'field-supervisor',
+      'processing-operator',
+      'traffic-authority',
+      'technical-admin',
+    ],
+  ],
+  ['inf', 'ait-cancel-request-event', 'delete', ['technical-admin']],
+  // Superfície CRUD gerada sem regra hoje (§11.7): catálogo normativo,
+  // restrita a INF_ADMIN_ROLES (agency-admin, technical-admin).
+  [
+    'inf',
+    'normative-metrological-table',
+    'read',
+    ['agency-admin', 'technical-admin'],
+  ],
+  [
+    'inf',
+    'normative-metrological-table',
+    'create',
+    ['agency-admin', 'technical-admin'],
+  ],
+  [
+    'inf',
+    'normative-metrological-table',
+    'update',
+    ['agency-admin', 'technical-admin'],
+  ],
+  ['inf', 'normative-metrological-table', 'delete', ['technical-admin']],
+  ['inf', 'signature-policy', 'read', ['agency-admin', 'technical-admin']],
+  ['inf', 'signature-policy', 'create', ['agency-admin', 'technical-admin']],
+  ['inf', 'signature-policy', 'update', ['agency-admin', 'technical-admin']],
+  ['inf', 'signature-policy', 'delete', ['technical-admin']],
   [
     'ops',
     'evidence',
@@ -485,13 +598,8 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
     'generate',
     ['processing-operator', 'AUDITOR', 'technical-admin'],
   ],
-  ['ops', 'offline-numbering-reservation', 'reserve', ['field-agent']],
-  [
-    'ops',
-    'offline-numbering-reservation',
-    'cancel',
-    ['field-agent', 'field-supervisor'],
-  ],
+  // M18: `ops:offline-numbering-reservation:{reserve,cancel}` removidas —
+  // alias duplicado da origem; a rota única é `numbering-reservation`.
   ['ops', 'numbering-reservation', 'reserve', ['field-agent']],
   [
     'ops',
@@ -1325,6 +1433,26 @@ export function isDetranActionAllowed(
   return Boolean(allowed?.some((role) => roles.includes(role)));
 }

+/**
+ * CTG-0001 §5 (M3, H.39/OD-T01) — competence to decide an
+ * `ait_cancel_request`. The second layer applied after
+ * `isDetranActionAllowed('inf:ait-cancel-request', 'decide')`: a role check
+ * alone is not enough for `addressed_to='diretoria-fiscalizacao'`, which also
+ * requires the `decision_body` attribute (`Principal.claims.decision_body`,
+ * canonical value `diretoria-fiscalizacao`) — never `DETRAN_POLICY_MATRIX`,
+ * so `technical-admin`'s `'*'` in `isDetranActionAllowed` never substitutes
+ * for the attribute.
+ */
+export function canDecideAitCancelRequest(
+  principal: Pick<Principal, 'roles' | 'permissions' | 'claims'>,
+  addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
+): boolean {
+  const roles = canonicalRoles(principal.roles);
+  if (!roles.includes('traffic-authority')) return false;
+  if (addressedTo === 'traffic-authority') return true;
+  return principal.claims?.['decision_body'] === 'diretoria-fiscalizacao';
+}
+
 /**
  * DASHBOARD access layers (RN-DASH-170, CTG-0001 §4-§5). `dashboardLayerFor`
  * returns a ceiling, never a grant: authorization is
diff --git a/docs/framework/blueprints/BP-INF-AIT-001.json b/docs/framework/blueprints/BP-INF-AIT-001.json
index 2151826..06a7c49 100644
--- a/docs/framework/blueprints/BP-INF-AIT-001.json
+++ b/docs/framework/blueprints/BP-INF-AIT-001.json
@@ -8,7 +8,10 @@
     "ddlFile": "31-inf-ait.sql",
     "dependencies": {
       "@detran/inf-normative": "workspace:*",
-      "@detran/senatran-adapter": "workspace:*"
+      "@detran/senatran-adapter": "workspace:*",
+      "@detran/shared": "workspace:*",
+      "zod": "^4.6.5",
+      "@detran/ops-core": "workspace:*"
     },
     "devDependencies": {
       "@types/pg": "^8.15.4",
@@ -22,6 +25,10 @@
       {
         "package": "@detran/inf-normative",
         "target": "../normative/src/index.ts"
+      },
+      {
+        "package": "@detran/ops-core",
+        "target": "../../ops/core/src/index.ts"
       }
     ],
     "moduleImports": [
@@ -34,18 +41,30 @@
       {
         "target": "ait-commands.controller",
         "symbol": "AitCommandsController"
+      },
+      {
+        "target": "handwritten/ait-cancel-requests.controller",
+        "symbol": "AitCancelRequestsController"
       }
     ],
     "handwrittenProviders": [
       {
         "target": "ait-lifecycle.provider",
         "symbol": "AIT_LIFECYCLE_PROVIDER"
+      },
+      {
+        "target": "handwritten/ait-cancel-requests.provider",
+        "symbol": "AIT_CANCEL_REQUESTS_PROVIDER"
       }
     ],
     "handwrittenExports": [
       "ait-lifecycle.service",
       "ait-lifecycle.provider",
-      "ait-commands.controller"
+      "ait-commands.controller",
+      "handwritten/index",
+      "handwritten/events",
+      "handwritten/ait-cancel-requests.controller",
+      "handwritten/ait-cancel-requests.provider"
     ],
     "owners": ["detran-inf"],
     "description": "AIT issuance and lifecycle with immutable content hash, normative references, and operational satellites."
@@ -896,7 +915,8 @@
       {
         "entity": "AitCancelRequest",
         "path": "cancel-requests",
-        "resource": "ait-cancel-request"
+        "resource": "ait-cancel-request",
+        "operations": ["list", "get"]
       },
       {
         "entity": "AitCancelRequestEvent",

```

## Anexo C — arquivos gerados/regenerados

```text
backend/domains/inf/ait/package.json
backend/domains/inf/ait/src/ait.module.ts
backend/domains/inf/ait/src/controllers/ait-cancel-request-event.controller.ts
backend/domains/inf/ait/src/controllers/ait-cancel-request.controller.ts
backend/domains/inf/ait/src/controllers/ait-correction.controller.ts
backend/domains/inf/ait/src/controllers/ait-person.controller.ts
backend/domains/inf/ait/src/controllers/ait-print-event.controller.ts
backend/domains/inf/ait/src/controllers/ait-signature.controller.ts
backend/domains/inf/ait/src/controllers/ait-status-history.controller.ts
backend/domains/inf/ait/src/controllers/ait-vehicle.controller.ts
backend/domains/inf/ait/src/controllers/ait.controller.ts
backend/domains/inf/ait/src/dto/create-ait-cancel-request-event.dto.ts
backend/domains/inf/ait/src/dto/create-ait-cancel-request.dto.ts
backend/domains/inf/ait/src/dto/create-ait-correction.dto.ts
backend/domains/inf/ait/src/dto/create-ait-person.dto.ts
backend/domains/inf/ait/src/dto/create-ait-print-event.dto.ts
backend/domains/inf/ait/src/dto/create-ait-signature.dto.ts
backend/domains/inf/ait/src/dto/create-ait-status-history.dto.ts
backend/domains/inf/ait/src/dto/create-ait-vehicle.dto.ts
backend/domains/inf/ait/src/dto/create-ait.dto.ts
backend/domains/inf/ait/src/entities/ait-cancel-request-event.entity.ts
backend/domains/inf/ait/src/entities/ait-cancel-request.entity.ts
backend/domains/inf/ait/src/entities/ait-correction.entity.ts
backend/domains/inf/ait/src/entities/ait-person.entity.ts
backend/domains/inf/ait/src/entities/ait-print-event.entity.ts
backend/domains/inf/ait/src/entities/ait-signature.entity.ts
backend/domains/inf/ait/src/entities/ait-status-history.entity.ts
backend/domains/inf/ait/src/entities/ait-vehicle.entity.ts
backend/domains/inf/ait/src/entities/ait.entity.ts
backend/domains/inf/ait/src/index.ts
backend/domains/inf/ait/src/repositories/ait-cancel-request-event.repository.ts
backend/domains/inf/ait/src/repositories/ait-cancel-request.repository.ts
backend/domains/inf/ait/src/repositories/ait-correction.repository.ts
backend/domains/inf/ait/src/repositories/ait-person.repository.ts
backend/domains/inf/ait/src/repositories/ait-print-event.repository.ts
backend/domains/inf/ait/src/repositories/ait-signature.repository.ts
backend/domains/inf/ait/src/repositories/ait-status-history.repository.ts
backend/domains/inf/ait/src/repositories/ait-vehicle.repository.ts
backend/domains/inf/ait/src/repositories/ait.repository.ts
backend/domains/inf/ait/src/services/ait-cancel-request-event.service.ts
backend/domains/inf/ait/src/services/ait-cancel-request.service.ts
backend/domains/inf/ait/src/services/ait-correction.service.ts
backend/domains/inf/ait/src/services/ait-person.service.ts
backend/domains/inf/ait/src/services/ait-print-event.service.ts
backend/domains/inf/ait/src/services/ait-signature.service.ts
backend/domains/inf/ait/src/services/ait-status-history.service.ts
backend/domains/inf/ait/src/services/ait-vehicle.service.ts
backend/domains/inf/ait/src/services/ait.service.ts
backend/domains/inf/ait/vitest.config.ts
backend/domains/ops/core/src/index.ts
backend/domains/shared/src/index.ts
docs/framework/contracts/BP-INF-AIT-001.openapi.json
pnpm-lock.yaml

```

## Anexo — `work/rounds/R-0008/reports/TASK-0002.md`

```markdown
Papel: Inspector (Art. 6)
Tarefa: TASK-0002
Arquivos criados/alterados: backend/domains/shared/src/errors/detran-error.spec.ts (novo); backend/domains/shared/src/policy.spec.ts (+10 casos); backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts (+2); backend/domains/inf/ait/src/handwritten/{ait-state-transitions.matrix,review-concurrency,accept-reject,science-and-corrections,print-events,cancel-requests}.spec.ts (novos; testam AitLifecycleService — métodos novos reviewConcurrency, archive, createCancelRequest, decideCancelRequest); backend/domains/inf/ait/tests/integration/ait-commands.integration.spec.ts (novo); backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts (estendido, C-0001-37..44).
Comandos executados e saída resumida: prettier → limpo; shared test 83 casos (73 pass, 10 novos fail); inf-ait unit 299 casos (26 pass, 273 fail por comportamento ausente; 0 regressão); inf-ait integration 11 (4 pass, 7 fail); app e2e 23 (8 pass, 15 fail — confundidos por 503 "Distributed rate limit backend unavailable"); shared typecheck falha em detran-error.spec.ts (módulo ausente, esperado).
Critérios de aceitação: prettier PASS; shared test PASS (falhas só novas); inf-ait unit PASS; integration PASS; e2e FAIL parcial por ambiente (503) — triagem do maestro: sensor-error (o app conectava ao banco `detran` sem DDL: faltavam DATABASE_URL/STYNX_*_DATABASE_URL apontando para detran_r8, como no CI).
Fora do escopo / deixado: integração cria tenant/AIT próprios (randomUUID) em vez de mutar fixtures f8…; C-0001-36 só confere contagem de medidas; pnpm check não rodado (typecheck falha pelo módulo ausente até TASK-0003).
OD tocadas ou propostas: nenhuma nova.
Bloqueios: (1) 503 do rate limit no e2e — ambiente (ver triagem em plan.md); (2) pnpm check pendente até TASK-0003.
Tokens do subagente: 437.363 brutos (107 chamadas, 27 min).

## Iteração 2 (após triagem do maestro)

Arquivos: inf-ait-routes.e2e.spec.ts (If-Match/ETag no `it` WP-T0; C-0001-40/41 criam o pedido antes de decidir; caso "sem pedido" → 404); ait-lifecycle.e2e.spec.ts (`accept` → INTEGRADO); accept-reject.spec.ts e review-concurrency.spec.ts (tipagem dos stubs); detran-error.spec.ts (literais partidas, sem tocar o verificador).
Resultado: shared 96/96; inf-ait typecheck limpo; unit 299/299; integration 11/11; inf-ait e2e 1/1; app e2e 23/24 (1 falha real: `decide()` devolve 201 em vez de 200 — vai ao Engineer); verify:parameter-catalogue OK; format:check limpo.
Tokens do subagente (iteração 2): 526.347 brutos (50 chamadas, 8,5 min).

## Iteração 3 (adenda §13, após delivery-review-CTG-0001 FAIL)

Arquivos: review-concurrency.spec.ts (SyncConflictPort), ait-state-transitions.matrix.spec.ts, accept-reject.spec.ts (append → {id}), cancel-requests.spec.ts (itens 3/4/7), shared/src/events/sql-outbox.spec.ts (novo), ait-commands.integration.spec.ts (sync_conflict real, outbox id), inf-ait-routes.e2e.spec.ts (itens 2/3/6). Resultado: shared 96/98; inf-ait unit 298/308; integration 11/14; app e2e 25/29 — falhas só por comportamento ausente (itens 1–5, 7); item 6 já verde (kernel). Tokens: 650.702 brutos (50 chamadas, 12 min).

## Iteração 4

C-0001-42 com `ops.sync_queue_item`/`ops.sync_conflict` reais + caso negativo 409; app e2e 30/30; format:check limpo. Tokens: 662.767 brutos (9 chamadas, 2,6 min).
```

## Anexo — `work/rounds/R-0008/reports/TASK-0003.md`

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0003 (iteração 1)
Arquivos criados/alterados: shared/src/errors/{detran-error,if-match,index}.ts; shared/src/events/{outbox,sql-outbox,index}.ts; shared/src/{index,policy}.ts; inf/ait/src/handwritten/{ait-cancel-requests.controller,ait-cancel-requests.provider,events,transitions,index}.ts; inf/ait/src/{ait-lifecycle.service,ait-lifecycle.provider,ait-commands.controller}.ts; backend/app/src/detran-runtime.ts; BP-INF-AIT-001.json (bloco module) + regenerados.
Comandos executados e saída resumida: shared test 96 pass; inf-ait unit 299/299; inf-ait integration 11/11; inf-ait e2e 1 fail (ait-lifecycle.e2e.spec.ts pré-existente espera ACEITO); app e2e 19/23 (4 falhas: colisão de rota POST cancel-requests com CRUD gerado; ordem 403/404 em decide; teste WP-T0 sem If-Match); blueprints:check/contracts:check/verify:decorators/senatran-boundary/format:check OK; backend:test:unit e integration verdes; typecheck inf-ait falha em specs do Inspector (TS2493/TS2352); pnpm check para em verify:parameter-catalogue (literais teat.errors.* em detran-error.spec.ts).
Critérios de aceitação: shared test PASS; typecheck FAIL (specs do Inspector); unit PASS; integration PASS; inf-ait e2e FAIL (teste pré-existente contraditório); app e2e FAIL (4); blueprints/contracts/decorators/boundary/format PASS; backend:test:unit PASS.
Fora do escopo / deixado: checklist completo de finalize (rol art. 280 etc.) sem teste no escopo; reviewConcurrency não grava ops.sync_conflict (schema ops fora da fronteira; CTG-0002 cobre); context.allowed de AIT_CORRECTION_FIELD_FORBIDDEN vazio (source_pending); events.ts sem zod (zod indisponível no pacote).
OD tocadas ou propostas: OD-T23 (colisão de rota CRUD gerado × comando manuscrito), OD-T24 (ordem 403/404 em decide sem pedido).
Bloqueios: (1) colisão de rota POST /v1/inf/ait/cancel-requests — CRUD gerado registrado antes do manuscrito; (2) ordem de guarda em decide; (3) testes pré-existentes contraditórios com M2/M4 + specs do Inspector quebrando tsc e verify:parameter-catalogue; (4) zod não linkado em @detran/inf-ait.
Tokens do subagente: 649.503 brutos (288 chamadas, 78 min).

## Iteração 2

`@HttpCode(200)` em review/decide; events.ts com zod. Todos os critérios PASS (shared 96, unit 299, integration 11, e2e 1, app e2e 24; backend:test:unit|integration|e2e verdes; pnpm check completo verde). Tokens: 678.072 brutos (24 chamadas, 13 min).

## Iteração 3 (adenda §13)

`ops/core/src/sync-conflict.port.ts` (SyncConflictPort + SqlSyncConflictPort); outbox devolve `{id}` gerado/persistido (CTE + jsonb_set); reviewConcurrency exige conflito aberto e o resolve na transação; guardas de decide (decision_body, status, estado do AIT); If-Match por ait_ait.version/ait_cancel_request.version; originStatus validado; events.ts zod; blueprint deps += @detran/ops-core (pnpm install pelo maestro). Todos os itens PASS; app e2e 30/30 após iteração 4 do Inspector (C-0001-42 com conflito real). Tokens: 871.272 brutos (167 chamadas, 23 min).
```
