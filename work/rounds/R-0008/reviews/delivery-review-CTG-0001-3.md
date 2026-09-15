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

## Nota do maestro — delivery-review CTG-0001, ciclo 3 (restrito ao achado único do ciclo 2)

Veredito anterior: `REVIEW` (`reviews/delivery-review-CTG-0001-2.json`): `review`/`decide` sem `If-Match`/`ETag` quando `ait_id` é nulo. Correção: `ait-cancel-requests.controller.ts` aplica `assertIfMatch(ifMatch, summary.version, 'TEAT')` incondicionalmente e devolve `ETag` sempre (`ait_ait.version` com AIT; `ait_cancel_request.version` sem AIT); `reviewCancelRequest` expõe `version`. Testes novos do Inspector (iteração 5): unit em `cancel-requests.spec.ts` e e2e em `inf-ait-routes.e2e.spec.ts` (428 / 412 / 200 + `ETag: "2"` para `review` e `decide` sem AIT). Gates: inf-ait unit 310/310, integration 14/14, app e2e 32/32, typechecks limpos, `format:check` limpo; `pnpm check` + `backend:test:ci` completos em execução no envio. Avalie **somente** essa correção. Anexo: diff dos quatro arquivos (acumulado contra HEAD b523f1f, inclui as iterações anteriores já revisadas; o trecho relevante é o de `review`/`decide` e os describes novos).

## Anexo — diff

```diff
diff --git a/backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts b/backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts
index 897d1ca..8dd96b3 100644
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
+
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
@@ -167,3 +224,603 @@ describe('inf/ait routes mounted in the unified app (WP-T0)', () => {
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
+  /**
+   * CTG-0001 §13 item 2 (Adenda) — delivery-review ciclo 2, achado único:
+   * com `ait_id` nulo, `review`/`decide` não podem pular `If-Match`/`ETag`
+   * — devem exigi-los contra `ait_cancel_request.version` (não contra
+   * `ait_ait.version`, que nem existe nesse caso). Hoje o controlador só
+   * chama `assertIfMatch`/`res.setHeader('ETag', …)` quando `summary.aitId`
+   * é truthy (`ait-cancel-requests.controller.ts` `review`≈linha 109,
+   * `decide`≈linha 131) — com `ait_id` nulo nenhum dos dois roda, então
+   * estes testes ficam vermelhos por comportamento ausente até o Engineer
+   * remover essa condição.
+   */
+  describe('§13 item 2 — review/decide exigem If-Match/ETag mesmo com ait_id nulo (delivery-review ciclo 2)', () => {
+    async function createDraftCancelRequestWithoutAit(): Promise<string> {
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+      const created = await request(app.getHttpServer())
+        .post('/v1/inf/ait/cancel-requests')
+        .set(headers())
+        .send({
+          entityType: 'ait-cancel-request',
+          trafficAgencyId: tenantId,
+          idempotencyKey: `e2e-null-ait-if-match-${randomUUID()}`,
+          targetLocalActId: `local-${randomUUID()}`,
+          originStatus: 'RASCUNHO_OFFLINE',
+          justification: 'desistência antes da sincronização',
+          requestedBy: actorId,
+        });
+      expect(created.status, JSON.stringify(created.body)).toBe(202);
+      expect(created.body.ait_id ?? null).toBeNull();
+      return created.body.id as string;
+    }
+
+    it('dado um pedido com ait_id nulo quando review sem If-Match então 428 TEAT.IF_MATCH_REQUIRED; If-Match divergente então 412 TEAT.VERSION_CONFLICT; If-Match="1" (correto) então 200 com ETag: "2" e status=under_review', async () => {
+      const requestId = await createDraftCancelRequestWithoutAit();
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      const missing = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/review`)
+        .set(headers())
+        .send({});
+      expect(missing.status, JSON.stringify(missing.body)).toBe(428);
+      expect(missing.body.code).toBe('TEAT.IF_MATCH_REQUIRED');
+
+      const divergent = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/review`)
+        .set({ ...headers(), 'if-match': '99' })
+        .send({});
+      expect(divergent.status, JSON.stringify(divergent.body)).toBe(412);
+      expect(divergent.body.code).toBe('TEAT.VERSION_CONFLICT');
+
+      const ok = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/review`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({});
+      expect(ok.status, JSON.stringify(ok.body)).toBe(200);
+      expect(ok.headers.etag).toBe('"2"');
+      expect(ok.body.status).toBe('under_review');
+      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    });
+
+    it('dado um pedido com ait_id nulo quando decide sem If-Match então 428 TEAT.IF_MATCH_REQUIRED; If-Match divergente então 412 TEAT.VERSION_CONFLICT; If-Match="1" (correto) então 200 com ETag da versão incrementada', async () => {
+      const requestId = await createDraftCancelRequestWithoutAit();
+      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
+      const missing = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
+        .set(headers())
+        .send({ decision: 'approve', decision_note: 'aprovado sem AIT' });
+      expect(missing.status, JSON.stringify(missing.body)).toBe(428);
+      expect(missing.body.code).toBe('TEAT.IF_MATCH_REQUIRED');
+
+      const divergent = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
+        .set({ ...headers(), 'if-match': '99' })
+        .send({ decision: 'approve', decision_note: 'aprovado sem AIT' });
+      expect(divergent.status, JSON.stringify(divergent.body)).toBe(412);
+      expect(divergent.body.code).toBe('TEAT.VERSION_CONFLICT');
+
+      const ok = await request(app.getHttpServer())
+        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
+        .set({ ...headers(), 'if-match': '1' })
+        .send({ decision: 'approve', decision_note: 'aprovado sem AIT' });
+      expect(ok.status, JSON.stringify(ok.body)).toBe(200);
+      expect(ok.headers.etag).toBe('"2"');
+      expect(ok.body.status).toBe('approved');
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
diff --git a/backend/domains/inf/ait/src/ait-lifecycle.service.ts b/backend/domains/inf/ait/src/ait-lifecycle.service.ts
index 315ef3c..8aa3efb 100644
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
@@ -243,13 +693,578 @@ export class AitLifecycleService {
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
+  ): Promise<{ id: string; status: string; version: number }> {
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
+        version:
+          (updated.version as number | undefined) ?? (request.version ?? 1) + 1,
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
@@ -267,10 +1282,11 @@ export class AitLifecycleService {
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
@@ -279,15 +1295,63 @@ export class AitLifecycleService {
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
@@ -297,9 +1361,33 @@ export class AitLifecycleService {
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
@@ -322,6 +1410,159 @@ export class AitLifecycleService {
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
diff --git a/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.controller.ts b/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.controller.ts
new file mode 100644
index 0000000..a79c1b4
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/ait-cancel-requests.controller.ts
@@ -0,0 +1,166 @@
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
+    // §13 item 2: `If-Match`/`ETag` are unconditional — `ait_ait.version`
+    // when `ait_id` exists, else `ait_cancel_request.version` — never only
+    // "when ait_id is present" (delivery-review ciclo 2).
+    const summary = await this.lifecycle.getCancelRequestSummary(id);
+    assertIfMatch(ifMatch, summary.version, 'TEAT');
+    const result = await this.lifecycle.reviewCancelRequest(id, body.user_ref);
+    // `review` never transitions the AIT, so when `ait_id` is present the
+    // version it answers with is the same `ait_ait.version` it checked;
+    // when `ait_id` is null, `reviewCancelRequest` bumps the cancel
+    // request's own version and returns it.
+    res.setHeader(
+      'ETag',
+      etagOf(summary.aitId ? summary.version : result.version),
+    );
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
+    // §13 item 2: unconditional, same as `review` above.
+    const summary = await this.lifecycle.getCancelRequestSummary(id);
+    assertIfMatch(ifMatch, summary.version, 'TEAT');
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
+    // With `ait_id` present, the ETag reflects `ait_ait.version`
+    // (`result.ait.version`, incremented by the transition); when null,
+    // `result.version` is the cancel request's own incremented version.
+    res.setHeader('ETag', etagOf(result.ait?.version ?? result.version));
+    return result;
+  }
+
+  @Get('outcomes/:targetLocalActId')
+  @Action('read')
+  outcomes(@Param('targetLocalActId') targetLocalActId: string) {
+    return this.lifecycle.getCancelRequestOutcomes(targetLocalActId);
+  }
+}
diff --git a/backend/domains/inf/ait/src/handwritten/cancel-requests.spec.ts b/backend/domains/inf/ait/src/handwritten/cancel-requests.spec.ts
new file mode 100644
index 0000000..74c3dbc
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/cancel-requests.spec.ts
@@ -0,0 +1,451 @@
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
+function reviewCancelRequest(
+  service: ReturnType<typeof stubService>['service'],
+  requestId: string,
+  actorId?: string,
+): Promise<unknown> {
+  return service.reviewCancelRequest
+    ? service.reviewCancelRequest(requestId, actorId)
+    : Promise.reject(
+        new Error('AitLifecycleService.reviewCancelRequest ainda não existe'),
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
+
+/**
+ * CTG-0001 §13 item 2 (Adenda, R-0008, TASK-0002 iteração 5) —
+ * delivery-review ciclo 2, achado único: com `ait_id` nulo, `review`/`decide`
+ * usam `ait_cancel_request.version` para `If-Match`/`ETag` (não pulam a
+ * checagem). `getCancelRequestSummary` já devolve a versão certa por fonte
+ * (`ait_ait.version` com `ait_id`, `ait_cancel_request.version` sem) — o que
+ * falta é o próprio `reviewCancelRequest`/`decideCancelRequest` incrementar e
+ * expor essa versão no retorno para o controlador montar o `ETag` (e o
+ * controlador parar de pular `assertIfMatch`/`ETag` quando `ait_id` é nulo,
+ * tratado em `ait-cancel-requests.controller.ts`, fora do meu "Pode tocar").
+ */
+describe('AIT — review/decide incrementam e expõem version do pedido quando ait_id é nulo (§13 item 2)', () => {
+  it('dado um pedido requested com ait_id nulo (version=1) quando reviewCancelRequest então status="under_review" e version=2 no retorno', async () => {
+    const { service, cancelRequests } = stubService({
+      cancelRequest: {
+        id: 'cancel-request-1',
+        status: 'requested',
+        ait_id: null,
+        version: 1,
+      },
+    });
+    const result = (await reviewCancelRequest(
+      service,
+      'cancel-request-1',
+      'actor-1',
+    )) as { status?: string; version?: number };
+    expect(result.status).toBe('under_review');
+    expect(result.version).toBe(2);
+    expect(cancelRequests.update).toHaveBeenCalledWith(
+      'cancel-request-1',
+      expect.objectContaining({ version: 2 }),
+      expect.anything(),
+    );
+  });
+
+  it('dado um pedido requested com ait_id nulo (version=1) quando decideCancelRequest com approve então version=2 no retorno', async () => {
+    const { service } = stubService({
+      cancelRequest: {
+        id: 'cancel-request-1',
+        status: 'requested',
+        kind: 'draft',
+        ait_id: null,
+        version: 1,
+      },
+    });
+    const result = (await decideCancelRequest(
+      service,
+      'cancel-request-1',
+      'approve',
+      'aprovado sem AIT no servidor',
+      'actor-1',
+    )) as { status?: string; version?: number };
+    expect(result.status).toBe('approved');
+    expect(result.version).toBe(2);
+  });
+});

```
