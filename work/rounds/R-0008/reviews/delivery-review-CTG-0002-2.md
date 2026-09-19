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

## Nota do maestro — delivery-review CTG-0002, ciclo 2 (restrito aos 5 achados do ciclo 1)

Veredito anterior: `FAIL` (`reviews/delivery-review-CTG-0002.json`). Correções: (1) fronteira — alteração formal do plano: locks `MOD-ops-evidence-controller-prefix` e `MOD-ops-snapshots-controller-prefix` acrescentados a `tasks/TASK-0005.json` e registrados em `plan.md` §Triagem (o maestro pediu a TASK-0005 só a string do `@Controller`; TASK-0007 deixa de executar CTG-0002 §13.4); (2) atomicidade — promoção de `sync_queue_item`/`sync_receipt` a `applied` feita **pelas portas** (`OpsRowStore.update(id, patch, tx?)`, `OpsTenantRepository.update(id, patch, transaction?)`) dentro do callback da transação do item, junto do applier e dos eventos; falha → rollback total + recibo `conflict|rejected` em transação própria; teste integration com injeção de falha na porta e guarda de vacuidade (contador de `apply`); (3) `ops.sync_batch` persistido antes dos envelopes, `data.batchId` preenchido (teste integration sobre `payload->data->batchId` e ordem); (4) `assertSequence` com `last = 0` no primeiro lote (unit + integration: `2` → 422 gap `expectedSequence 1`; `1` aceito); (5) schema zod do `SubmitSyncBatchDto` na fronteira antes de materializar (400 `TEAT.VALIDATION_FAILED` `fields[{path,rule,params}]`; unit + e2e "nada materializado"). Gates (Engineer iteração 4): ops-offline-sync unit 27/27, integration 40/40; ops-field 19/13; inf-ait integration 24; app e2e 58/58; `backend:test:ci`, `pnpm check`, `verify:decorators`, `blueprints:check`, `contracts:check`, `format:check` verdes. Avalie **somente** essas cinco correções. Anexos: diff acumulado (contra HEAD cab0983) dos arquivos relevantes; `plan.md` §Triagem.

## Anexo — `plan.md` §Triagem

```markdown
## Triagem

- 2026-09-15 TASK-0002 e2e 503 "Distributed rate limit backend unavailable" → `sensor-error`: o app lia `DATABASE_URL`/`STYNX_*_DATABASE_URL`
  ausentes e conectava ao `detran` local sem DDL. Correção: `work/rounds/R-0008/env-detran-r8.sh` (cinco variáveis do job `backend-kernel`)
  e nota nos prompts TASK-0003…0010/0012 (só ambiente; prompt-review não repetido). Confirmado: `ops-modules` e `pec-idempotency` e2e
  verdes com o ambiente.
- 2026-09-15 TASK-0001 bloqueio 2 (delta `BP-INF-AIT-001`) e CTG-0002 §11.4 → `reference-gap`: deltas aplicados pelo maestro (Architect)
  em b523f1f com adendas §12 nos contratos CTG-0001/0002.

- 2026-09-15 TASK-0003 iteração 1 — quatro bloqueios: (1) colisão `POST /v1/inf/ait/cancel-requests` (CRUD gerado × manuscrito) →
  `reference-gap`: delta `BP-INF-AIT-001` `api.resources[AitCancelRequest].operations=['list','get']` aplicado pelo maestro (Architect;
  o gerador já suportava `operations`), regenerado; OD-T23 do Engineer fechada por esse delta. (2) ordem 403/404 em `decide` sem pedido →
  `sensor-error`: C-0001-40 exige um pedido `addressed_to='diretoria-fiscalizacao'` existente; o teste usou uuid aleatório — Inspector
  corrige (iteração 2 de TASK-0002); ordem canônica: 404 `TEAT.AIT_CANCEL_TARGET_NOT_FOUND` antes do addressee (sem pedido não há
  `addressed_to`). (3) testes pré-existentes contraditórios com M2/M4 (`inf-ait-routes.e2e.spec.ts` WP-T0 sem `If-Match`; `ait-lifecycle.e2e.spec.ts`
  espera `ACEITO`) e specs do Inspector quebrando `tsc` (TS2493/TS2352) e `verify:parameter-catalogue` (literais `teat.errors.*` em
  `detran-error.spec.ts`; o verificador só ignora diretórios `tests`, não `*.spec.ts`, contra o próprio contrato do catálogo) →
  `sensor-error`: Inspector corrige os testes e alinha o verificador ao contrato ("ignorando testes"). (4) `zod` não linkado em
  `@detran/inf-ait` → `reference-gap`: `module.dependencies.zod` no blueprint + `pnpm install` pelo maestro (commit `chore(deps)`).
- 2026-09-15 delivery-review-CTG-0001 ciclo 1 `FAIL` (7 achados `high`, todos `plant-bug`/`reference-gap` de implementação incompleta
  frente ao contrato): adenda §13 em CTG-0001 fecha cada um (porta `SyncConflictPort` em `ops-core`; `If-Match` do AIT quando `ait_id`
  existe; guarda `decision_body` divergente; guarda de estado em `decide`/`review`; id do evento pelo outbox; `@Idempotent()` do kernel;
  `originStatus` validado). Iteração 3 do Inspector (testes) e do Engineer (código); ciclo 2 da delivery-review restrito aos achados.
- 2026-09-15 delivery-review-CTG-0001 ciclo 2 `REVIEW` (1 achado: `If-Match`/`ETag` de `review`/`decide` ausentes quando `ait_id` é nulo) →
  `plant-bug`: Inspector iteração 5 (testes 428/412/200+ETag sem AIT) + Engineer iteração 4; ciclo 3 restrito. Gates completos
  (`pnpm check`, `backend:test:ci` com `env-detran-r8.sh`) verdes no ciclo 2.
- 2026-09-15 TASK-0004 — bloqueios: (1) `@detran/shared`/`ops-core` não resolvem sob vitest em `ops/field`/`offline-sync` (blueprints
  sem `testAliases`) → `reference-gap`, delta aplicado pelo maestro (CTG-0002 §13.2); (2) colisão `POST sync-batches` CRUD × comando
  → `reference-gap`, `operations: [list, get]` (§13.1), extensivo a `evidence-access-requests` e `external-queries` (CTG-0003);
  (3) prefixo `v1/` de `evidence`/`snapshots` só em TASK-0007 → C-0002-50 fica vermelho até lá (aceito).
- 2026-09-15 TASK-0005 iteração 1 — (1) `GET receipts/{tenantId}` sombreado pelo `GET receipts/:id` gerado → `reference-gap`: delta
  `SyncReceipt.operations=['list']` (BP-OPS-OFFLINE-SYNC-001 v1.3.0) pelo maestro; (2) testes do Inspector reusam `batch_sequence: 1`
  (C-0002-27/28/29), C-0002-27 exige consumo sem reserva, `ait-sync-applier` apaga todos os `sync_receipt` (derruba C-0002-30) →
  `sensor-error`: Inspector iteração 2; (3) `zod`/`@detran/inf-normative` (ops/field) e `@detran/ops-core` (app) não linkados →
  `reference-gap`: deps nos blueprints/app + `pnpm install` pelo maestro; Engineer iteração 2 converte eventos a zod.
- 2026-09-15 delivery-review-CTG-0002 ciclo 1 `FAIL` (5 achados): (1) fronteira — a mudança do prefixo `v1/` em `evidence`/`snapshots`
  foi pedida pelo maestro a TASK-0005 (só a string do `@Controller`); **alteração formal do plano**: locks
  `MOD-ops-evidence-controller-prefix` e `MOD-ops-snapshots-controller-prefix` acrescentados a TASK-0005 (`tasks/TASK-0005.json`);
  TASK-0007 deixa de executar CTG-0002 §13.4 (já executado); (2)–(5) `plant-bug` no `submit-batch.command.ts`: item/recibo fora da
  transação do item; `SYNC_ITEM_RECEBIDO` antes do `sync_batch` (`batchId` nulo); primeiro lote sem guarda de sequência (`last=0`);
  sem validação runtime do DTO (lote vazio, `batch_sequence` inválida) → Inspector iteração 3 (testes) + Engineer iteração 3; ciclo 2
  restrito. Gates completos (`pnpm check`, `backend:test:ci`) verdes no ciclo 1.
```

## Anexo — diff

```diff
diff --git a/backend/app/tests/e2e/teat-field-sync.e2e.spec.ts b/backend/app/tests/e2e/teat-field-sync.e2e.spec.ts
new file mode 100644
index 0000000..657d32a
--- /dev/null
+++ b/backend/app/tests/e2e/teat-field-sync.e2e.spec.ts
@@ -0,0 +1,638 @@
+import { createHash, randomUUID } from 'node:crypto';
+import type { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import request from 'supertest';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0002 §1, §5 e §10 (R-0008, TASK-0004) — C-0002-43…50: as rotas de campo e
+ * sincronização sob o app unificado, com a guarda de política nos dois sentidos
+ * (papel mínimo → 200/201, papel fora da regra → 403) e a fronteira de rota
+ * `v1/ops/…` da §1.
+ *
+ * Nenhuma dessas rotas existe hoje: elas nascem em TASK-0005 (§11), e o prefixo
+ * `v1/` dos controladores manuscritos de `ops` é corrigido em TASK-0005
+ * (`ops/field`) e TASK-0007 (`ops/evidence`, `ops/snapshots`). Até lá cada caso
+ * falha pelo comportamento ausente — 404 onde se espera 200/403.
+ *
+ * O perfil local resolve `DETRAN_LOCAL_TENANT_ID`/`DETRAN_LOCAL_ACTOR_ID` no
+ * carregamento do módulo (`detran-runtime.ts`), então as duas variáveis são
+ * definidas **antes** do `await import('../../src/app.module.js')`, e removidas
+ * no `afterAll` para não vazarem para os outros arquivos e2e (o pool roda todos
+ * no mesmo processo, `fileParallelism: false`).
+ */
+
+const { Client } = pg;
+
+/** Tenant e persona canônicos das fixtures (00/25/26-fixtures-*.sql). */
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const OTHER_TENANT_ID = '00000000-0000-7000-8000-00000000a002';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const DEVICE_AUTHORIZED = '00000000-0000-7000-8000-0000e4000002';
+const DEVICE_TAMPERED = '00000000-0000-7000-8000-0000e4000004';
+const SHIFT_OPEN = '00000000-0000-7000-8000-0000e3000001';
+const RESERVATION_RESERVED = '00000000-0000-7000-8000-0000e6000001';
+const HOMOLOGATION_ACTIVE = '00000000-0000-7000-8000-0000e2200001';
+const HOMOLOGATION_EXPIRED_REPORT = '00000000-0000-7000-8000-0000e2200002';
+const CONFLICT_CONCURRENCY = '00000000-0000-7000-8000-0000eb100001';
+const APP_VERSION = '1.0.0';
+
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+let startedAt: string;
+const previousEnv: Record<string, string | undefined> = {};
+
+function stableJson(value: unknown): string {
+  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
+  if (value && typeof value === 'object') {
+    const entries = Object.entries(value as Record<string, unknown>)
+      .filter(([, item]) => item !== undefined)
+      .sort(([left], [right]) => left.localeCompare(right))
+      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
+    return `{${entries.join(',')}}`;
+  }
+  return JSON.stringify(value) ?? 'null';
+}
+
+function canonicalHash(payload: unknown): string {
+  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
+}
+
+/**
+ * O kernel aplica `@Idempotent()` a toda ação não-leitura: corpo divergente sob
+ * a mesma `Idempotency-Key` devolve 422 (CTG-0001 §13 item 6). Cada requisição
+ * leva uma chave nova, salvo quando o teste é justamente de replay.
+ */
+function headers(role: string): Record<string, string> {
+  process.env.DETRAN_LOCAL_ROLES = role;
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    'idempotency-key': randomUUID(),
+  };
+}
+
+function server() {
+  return app.getHttpServer();
+}
+
+const crashRecordPayload = { crash: { local_protocol: 'BOAT-0001' } };
+
+function syncBatchBody(): Record<string, unknown> {
+  return {
+    traffic_agency_id: AGENCY_ID,
+    device_id: DEVICE_AUTHORIZED,
+    agent_id: ACTOR_ID,
+    device_batch_id: `e2e-${randomUUID().slice(0, 8)}`,
+    items: [
+      {
+        // `crash-record` é reconhecido como suportado e não tem destino nesta
+        // rodada (§4.3): o lote responde 200 e nada de domínio é tocado.
+        entity_type: 'crash-record',
+        local_entity_id: randomUUID(),
+        idempotency_key: `e2e-item-${randomUUID().slice(0, 8)}`,
+        created_locally_at: '2026-09-14T13:05:00.000Z',
+        payload_json: crashRecordPayload,
+        payload_hash: canonicalHash(crashRecordPayload),
+      },
+    ],
+  };
+}
+
+beforeAll(async () => {
+  for (const key of [
+    'DETRAN_RUNTIME_PROFILE',
+    'DETRAN_LOCAL_TENANT_ID',
+    'DETRAN_LOCAL_ACTOR_ID',
+    'DETRAN_LOCAL_ROLES',
+  ]) {
+    previousEnv[key] = process.env[key];
+  }
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
+  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
+  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+
+  const { NestFactory: factory } = await import('@nestjs/core');
+  const { AppModule } = await import('../../src/app.module.js');
+  app = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+});
+
+afterAll(async () => {
+  await app?.close();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  // Remove o que os comandos criarem e devolve as fixtures de 26-fixtures-teat-field.sql
+  // ao estado semeado, para que o arquivo rode isolado e em qualquer ordem.
+  for (const table of [
+    'integration.outbox',
+    'ops.numbering_consumption',
+    'ops.ops_device_event',
+    'ops.ops_session_handoff',
+  ]) {
+    await client.query(
+      `delete from ${table} where tenant_id = $1 and created_at > $2`,
+      [TENANT_ID, startedAt],
+    );
+  }
+  await client.query(
+    `delete from ops.sync_conflict where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.sync_receipt where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.sync_queue_item where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.sync_batch where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.numbering_reservation where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `update ops.ops_operational_device set status = 'authorized' where id = $1`,
+    [DEVICE_TAMPERED],
+  );
+  await client.query(
+    `update ops.numbering_reservation set status = 'reserved' where id = $1`,
+    [RESERVATION_RESERVED],
+  );
+  await client.query(
+    `update ops.ops_shift set device_id = $2, status = 'open', ended_at = null where id = $1`,
+    [SHIFT_OPEN, DEVICE_AUTHORIZED],
+  );
+  await client.query(
+    `update ops.ops_homologation
+        set laudo_emitido_em = '2021-12-01', laudo_valido_ate = '2025-12-31',
+            status = 'active'
+      where id = $1`,
+    [HOMOLOGATION_EXPIRED_REPORT],
+  );
+  await client.query(
+    `update ops.ops_homologation
+        set status = 'active', cancelled_reason = null
+      where id = $1`,
+    [HOMOLOGATION_ACTIVE],
+  );
+  await client.query(
+    `update ops.sync_conflict
+        set status = 'open', resolution_action = null,
+            resolution_details_json = null, resolved_at = null,
+            resolved_by_user_ref = null
+      where id = $1`,
+    [CONFLICT_CONCURRENCY],
+  );
+  await client.end();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+describe('CTG-0002 §5.1/§5.13 — política de leitura e submissão (C-0002-43/44)', () => {
+  it('C-0002-43 — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/ops/mobile-bootstrap então 200', async () => {
+    const response = await request(server())
+      .get('/v1/ops/mobile-bootstrap')
+      .query({ device_id: DEVICE_AUTHORIZED, app_version: APP_VERSION })
+      .set(headers('field-agent'));
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      protocolVersion: 'teat-mobile-bootstrap.v1',
+    });
+  });
+
+  it('C-0002-43 — dado DETRAN_LOCAL_ROLES=agency-admin quando GET /v1/ops/mobile-bootstrap então 403', async () => {
+    const response = await request(server())
+      .get('/v1/ops/mobile-bootstrap')
+      .query({ device_id: DEVICE_AUTHORIZED, app_version: APP_VERSION })
+      .set(headers('agency-admin'));
+    expect(response.status).toBe(403);
+  });
+
+  it('C-0002-44 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/offline-sync/sync-batches então 200 com receipts e warnings', async () => {
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-agent'))
+      .send(syncBatchBody());
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      receipts: expect.any(Array),
+      warnings: expect.any(Array),
+    });
+    expect(response.body.receipts[0]).toMatchObject({
+      status: 'received',
+      error_code: 'TEAT.SYNC_DESTINATION_NOT_WIRED',
+    });
+  });
+
+  it('C-0002-44 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/offline-sync/sync-batches então 403', async () => {
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-supervisor'))
+      .send(syncBatchBody());
+    expect(response.status).toBe(403);
+  });
+
+  it('§5.13 — dado GET receipts/{tenantId} de outro tenant então 404 TEAT.TENANT_MISMATCH', async () => {
+    const response = await request(server())
+      .get(`/v1/ops/offline-sync/receipts/${OTHER_TENANT_ID}`)
+      .set(headers('field-agent'));
+    expect(response.status).toBe(404);
+    expect(response.body.code).toBe('TEAT.TENANT_MISMATCH');
+  });
+
+  it('§5.13 — dado by-idempotency com uma chave inexistente então 404 TEAT.SYNC_RECEIPT_NOT_FOUND', async () => {
+    const response = await request(server())
+      .get(
+        `/v1/ops/offline-sync/receipts/${TENANT_ID}/by-idempotency/item-inexistente`,
+      )
+      .set(headers('field-agent'));
+    expect(response.status).toBe(404);
+    expect(response.body.code).toBe('TEAT.SYNC_RECEIPT_NOT_FOUND');
+  });
+
+  it('§5.13 — dado by-idempotency com a chave item-001 das fixtures então 200 com o recibo applied (recuperação de ACK perdido)', async () => {
+    const response = await request(server())
+      .get(`/v1/ops/offline-sync/receipts/${TENANT_ID}/by-idempotency/item-001`)
+      .set(headers('field-agent'));
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      idempotency_key: 'item-001',
+      status: 'applied',
+    });
+  });
+});
+
+/**
+ * CTG-0002 §5.13 (R-0008, TASK-0004 iteração 3) — achado 4 da delivery-review:
+ * a validação de forma do `SubmitSyncBatchDto` acontece **antes** de qualquer
+ * materialização e devolve 400 `TEAT.VALIDATION_FAILED` com `context.fields[]`,
+ * nunca o corpo padrão do `ValidationPipe`.
+ */
+describe('CTG-0002 §5.13 — validação de forma do lote no HTTP (achado 4)', () => {
+  /**
+   * Nenhum `sync_batch`/`sync_queue_item` pode nascer de um corpo inválido. A
+   * contagem é por `device_batch_id` e por `idempotency_key` do próprio corpo:
+   * o tenant é compartilhado com os demais casos deste arquivo, que criam lotes
+   * válidos de propósito.
+   */
+  async function expectNothingMaterialized(
+    deviceBatchId: string,
+    itemKey: string,
+  ): Promise<void> {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const batches = await client.query<{ count: string }>(
+      `select count(*)::text as count from ops.sync_batch
+        where tenant_id = $1 and device_batch_id = $2`,
+      [TENANT_ID, deviceBatchId],
+    );
+    expect(Number(batches.rows[0]!.count)).toBe(0);
+    const items = await client.query<{ count: string }>(
+      `select count(*)::text as count from ops.sync_queue_item
+        where tenant_id = $1 and idempotency_key = $2`,
+      [TENANT_ID, itemKey],
+    );
+    expect(Number(items.rows[0]!.count)).toBe(0);
+  }
+
+  /** `idempotency_key` do único item que `syncBatchBody()` monta. */
+  function itemKeyOf(body: Record<string, unknown>): string {
+    return (body.items as { idempotency_key: string }[])[0]!.idempotency_key;
+  }
+
+  it('dado items ausente então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando items, e nada materializado', async () => {
+    const body = syncBatchBody();
+    const deviceBatchId = body.device_batch_id as string;
+    const itemKey = itemKeyOf(body);
+    delete body.items;
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-agent'))
+      .send(body);
+    expect(response.status).toBe(400);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'items' }),
+        ]),
+      }),
+    });
+    await expectNothingMaterialized(deviceBatchId, itemKey);
+  });
+
+  it('dado items vazio então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando items, e nada materializado', async () => {
+    const body = syncBatchBody();
+    const deviceBatchId = body.device_batch_id as string;
+    const itemKey = itemKeyOf(body);
+    body.items = [];
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-agent'))
+      .send(body);
+    expect(response.status).toBe(400);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'items' }),
+        ]),
+      }),
+    });
+    await expectNothingMaterialized(deviceBatchId, itemKey);
+  });
+
+  it('dado batch_sequence não inteiro então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando batch_sequence, e nada materializado', async () => {
+    const body = syncBatchBody();
+    const deviceBatchId = body.device_batch_id as string;
+    const itemKey = itemKeyOf(body);
+    body.batch_sequence = 1.5;
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-agent'))
+      .send(body);
+    expect(response.status).toBe(400);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'batch_sequence' }),
+        ]),
+      }),
+    });
+    await expectNothingMaterialized(deviceBatchId, itemKey);
+  });
+
+  it('dado batch_sequence menor que 1 então 400 TEAT.VALIDATION_FAILED, e nada materializado', async () => {
+    const body = syncBatchBody();
+    const deviceBatchId = body.device_batch_id as string;
+    const itemKey = itemKeyOf(body);
+    body.batch_sequence = 0;
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-agent'))
+      .send(body);
+    expect(response.status).toBe(400);
+    expect(response.body.code).toBe('TEAT.VALIDATION_FAILED');
+    await expectNothingMaterialized(deviceBatchId, itemKey);
+  });
+
+  it('dado device_batch_id ausente então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando device_batch_id, e nada materializado', async () => {
+    const body = syncBatchBody();
+    const deviceBatchId = body.device_batch_id as string;
+    const itemKey = itemKeyOf(body);
+    delete body.device_batch_id;
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-agent'))
+      .send(body);
+    expect(response.status).toBe(400);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'device_batch_id' }),
+        ]),
+      }),
+    });
+    await expectNothingMaterialized(deviceBatchId, itemKey);
+  });
+});
+
+describe('CTG-0002 §5.13 — resolução de conflito (C-0002-45/46)', () => {
+  it('C-0002-45 — dado DETRAN_LOCAL_ROLES=field-supervisor quando resolve com manual_review então 200 e o conflito continua open', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
+      )
+      .set(headers('field-supervisor'))
+      .send({
+        resolved_by_user_ref: ACTOR_ID,
+        resolution_action: 'manual_review',
+        description: 'Encaminhado à autoridade de trânsito para apuração',
+      });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      id: CONFLICT_CONCURRENCY,
+      status: 'open',
+      resolution_action: 'manual_review',
+    });
+    const row = await client.query<{ status: string }>(
+      'select status from ops.sync_conflict where id = $1',
+      [CONFLICT_CONCURRENCY],
+    );
+    expect(row.rows[0]?.status).toBe('open');
+  });
+
+  it('C-0002-46 — dado um conflito concurrency quando resolve com accept_server então 409 TEAT.SYNC_ITEM_CONFLICT com context.conflictType concurrency', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
+      )
+      .set(headers('field-supervisor'))
+      .send({
+        resolved_by_user_ref: ACTOR_ID,
+        resolution_action: 'accept_server',
+      });
+    expect(response.status).toBe(409);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.SYNC_ITEM_CONFLICT',
+      context: expect.objectContaining({ conflictType: 'concurrency' }),
+    });
+  });
+
+  it('§5.13 — dado DETRAN_LOCAL_ROLES=field-agent quando resolve então 403 (a resolução é do supervisor/operador)', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
+      )
+      .set(headers('field-agent'))
+      .send({
+        resolved_by_user_ref: ACTOR_ID,
+        resolution_action: 'manual_review',
+      });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0002 §5.7/§5.9 — postura de dispositivo e homologação (C-0002-47/48)', () => {
+  it('C-0002-47 — dado DETRAN_LOCAL_ROLES=technical-admin quando POST /v1/ops/field/devices/{id}/block então 200', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/field/devices/${DEVICE_TAMPERED}/block`)
+      .set(headers('technical-admin'))
+      .send({ reason: 'Indício de adulteração detectado pelo bootstrap' });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      id: DEVICE_TAMPERED,
+      status: 'blocked',
+    });
+  });
+
+  it('C-0002-47 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/field/devices/{id}/block então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/field/devices/${DEVICE_TAMPERED}/block`)
+      .set(headers('field-supervisor'))
+      .send({ reason: 'Indício de adulteração detectado pelo bootstrap' });
+    expect(response.status).toBe(403);
+  });
+
+  it('C-0002-48 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/ops/field/homologations/{id}/renew então 200 com laudo_valido_ate quadrienal', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/field/homologations/${HOMOLOGATION_EXPIRED_REPORT}/renew`)
+      .set(headers('agency-admin'))
+      .send({
+        laudo_emitido_em: '2026-09-14',
+        emissor_independente: 'Instituto Independente de Ensaios',
+      });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      id: HOMOLOGATION_EXPIRED_REPORT,
+      status: 'active',
+      laudo_emitido_em: '2026-09-14',
+      laudo_valido_ate: '2030-09-14',
+    });
+  });
+
+  it('C-0002-48 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST /v1/ops/field/homologations/{id}/renew então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/field/homologations/${HOMOLOGATION_EXPIRED_REPORT}/renew`)
+      .set(headers('traffic-authority'))
+      .send({
+        laudo_emitido_em: '2026-09-14',
+        emissor_independente: 'Instituto Independente de Ensaios',
+      });
+    expect(response.status).toBe(403);
+  });
+
+  it('§5.8 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/ops/field/homologations/{id}/cancel-by-audit então 200 com status cancelled e cancelled_reason', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/field/homologations/${HOMOLOGATION_ACTIVE}/cancel-by-audit`,
+      )
+      .set(headers('agency-admin'))
+      .send({
+        reason: 'Auditoria constatou desvio de escopo da homologação',
+        audit_reference: 'AUD-2026-0001',
+      });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      id: HOMOLOGATION_ACTIVE,
+      status: 'cancelled',
+      cancelled_reason: 'Auditoria constatou desvio de escopo da homologação',
+    });
+  });
+
+  it('§5.8 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/field/homologations/{id}/cancel-by-audit então 403', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/field/homologations/${HOMOLOGATION_ACTIVE}/cancel-by-audit`,
+      )
+      .set(headers('field-supervisor'))
+      .send({ reason: 'Auditoria constatou desvio de escopo da homologação' });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0002 §5.6 — handoff de sessão (C-0002-49)', () => {
+  it('C-0002-49 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/mobile-bootstrap/sessions/handoff então 403', async () => {
+    const response = await request(server())
+      .post('/v1/ops/mobile-bootstrap/sessions/handoff')
+      .set(headers('processing-operator'))
+      .send({
+        failed_device_id: DEVICE_AUTHORIZED,
+        reason: 'Falha de bateria do coletor em campo',
+      });
+    expect(response.status).toBe(403);
+  });
+
+  it('C-0002-49 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/mobile-bootstrap/sessions/handoff então 200 com handoff_id e cancelled_reservations', async () => {
+    const response = await request(server())
+      .post('/v1/ops/mobile-bootstrap/sessions/handoff')
+      .set(headers('field-agent'))
+      .send({
+        failed_device_id: DEVICE_AUTHORIZED,
+        reason: 'Falha de bateria do coletor em campo',
+      });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      shift_id: SHIFT_OPEN,
+      failed_device_id: DEVICE_AUTHORIZED,
+      cancelled_reservations: expect.arrayContaining([RESERVATION_RESERVED]),
+    });
+  });
+});
+
+describe('CTG-0002 §1 — fronteira de rota dos controladores manuscritos de ops (C-0002-50)', () => {
+  /**
+   * Enumera o roteador do Express montado pelo Nest. A forma da propriedade
+   * mudou entre versões (`router` em Express 5, `_router` em Express 4), então
+   * as duas são aceitas; se nenhuma estiver acessível, o caso cai na sonda HTTP
+   * do teste seguinte, que já é suficiente para o critério.
+   */
+  function mountedPaths(): string[] {
+    const instance = app.getHttpAdapter().getInstance() as {
+      router?: { stack?: { route?: { path?: string } }[] };
+      _router?: { stack?: { route?: { path?: string } }[] };
+    };
+    const stack = instance.router?.stack ?? instance._router?.stack ?? [];
+    return stack
+      .map((layer) => layer.route?.path)
+      .filter((path): path is string => typeof path === 'string');
+  }
+
+  it('C-0002-50 — dado o app montado quando as rotas de ops são enumeradas então todas começam por /v1/ops/ (§1: os controladores manuscritos ainda montam em /ops)', () => {
+    const offending = mountedPaths().filter(
+      (path) => path.startsWith('/ops/') || path === '/ops',
+    );
+    expect(
+      offending,
+      `rotas manuscritas de ops fora de /v1/ops/ (§1; correção em TASK-0005 para ops/field e TASK-0007 para ops/evidence e ops/snapshots): ${offending.join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('C-0002-50 — dado o app montado quando as rotas legadas /ops/... são consultadas então nenhuma responde (404)', async () => {
+    for (const path of [
+      '/ops/agents',
+      '/ops/devices',
+      '/ops/teams',
+      '/ops/homologations',
+      '/ops/app-versions',
+      '/ops/evidence/evidence',
+      '/ops/snapshots/people',
+    ]) {
+      const response = await request(server())
+        .get(path)
+        .set(headers('technical-admin'));
+      expect(response.status, `${path} ainda responde fora de /v1/ops/`).toBe(
+        404,
+      );
+    }
+  });
+
+  it('§1 — dado o app montado quando /v1/ops/field/agents é consultado então a rota manuscrita responde no prefixo correto', async () => {
+    const response = await request(server())
+      .get('/v1/ops/field/agents')
+      .set(headers('technical-admin'));
+    expect(response.status).toBe(200);
+  });
+});
diff --git a/backend/domains/ops/core/src/applied-entity.ts b/backend/domains/ops/core/src/applied-entity.ts
new file mode 100644
index 0000000..95c3940
--- /dev/null
+++ b/backend/domains/ops/core/src/applied-entity.ts
@@ -0,0 +1,14 @@
+// CTG-0002 §4.8 (R-0008, TASK-0005) — porta "a entidade já foi aplicada no
+// servidor?", consumida por CTG-0003 (evidência) e definida aqui porque é do
+// núcleo `ops`.
+import type { Transaction } from '@stynx-nyx/data';
+
+export interface AppliedEntityPort {
+  /** `'ait'`, `'administrative-measure'`, … */
+  readonly entityType: string;
+  isApplied(entityId: string, tx: Transaction): Promise<boolean>;
+}
+
+export const APPLIED_ENTITY_PORTS: unique symbol = Symbol(
+  'APPLIED_ENTITY_PORTS',
+);
diff --git a/backend/domains/ops/core/src/index.ts b/backend/domains/ops/core/src/index.ts
index f63ff5f..278f39e 100644
--- a/backend/domains/ops/core/src/index.ts
+++ b/backend/domains/ops/core/src/index.ts
@@ -3,6 +3,12 @@ import type { Database, Transaction } from '@stynx-nyx/data';

 import { withTenantContext } from '@detran/shared';

+import { asQueryable } from './runtime.js';
+
+export * from './sync-applier.js';
+export * from './applied-entity.js';
+export * from './storage.js';
+export * from './runtime.js';
 export {
   SqlSyncConflictPort,
   type ResolveSyncConflictOptions,
@@ -47,6 +53,38 @@ export class OpsTenantRepository {
     );
   }

+  /**
+   * `transaction` é a transação em curso do chamador: quando vem, a escrita
+   * roda nela e nenhuma transação nova é aberta (CTG-0002 §4.3 passo 4).
+   */
+  update(
+    id: string,
+    patch: Record<string, unknown>,
+    transaction?: unknown,
+  ): Promise<Record<string, unknown> | undefined> {
+    const entries = Object.entries(patch);
+    if (entries.length === 0) throw new Error('An ops patch requires values');
+    const columns = entries.map(([key]) => key);
+    if (columns.some((key) => !/^[a-z_]+$/.test(key) || key === 'tenant_id'))
+      throw new Error('Invalid ops write field');
+    const assignments = columns
+      .map((column, index) => `${column} = $${index + 2}`)
+      .join(', ');
+    const sql = `update ${this.table} set ${assignments}, updated_at = now() where id = $1 returning *`;
+    const values = [id, ...entries.map(([, value]) => value)];
+    const ongoing = asQueryable(transaction);
+    if (ongoing)
+      return ongoing
+        .query(sql, values)
+        .then(
+          (result) => result.rows[0] as Record<string, unknown> | undefined,
+        );
+    return this.inTenant(async (tx) => {
+      const result = await tx.query(sql, values);
+      return result.rows[0];
+    });
+  }
+
   create(values: Record<string, unknown>): Promise<Record<string, unknown>> {
     const entries = Object.entries(values);
     if (entries.length === 0) throw new Error('An ops record requires values');
@@ -70,8 +108,5 @@ export class OpsTenantRepository {
   }
 }

-/** Phase 5 integration seam; this domain must consume the promoted STYNX runtime. */
-export interface OfflineSyncPort {
-  // TODO(Phase 5): bind @stynx-nyx/offline-sync after feat/p1-mobile-runtime publishes.
-  submitBatch(): never;
-}
+// O placeholder `OfflineSyncPort` desta fase foi substituído pelas portas
+// reais do protocolo (`SyncEntityApplier`, `AppliedEntityPort`) — CTG-0002 §1.
diff --git a/backend/domains/ops/core/src/runtime.ts b/backend/domains/ops/core/src/runtime.ts
new file mode 100644
index 0000000..d5a08a4
--- /dev/null
+++ b/backend/domains/ops/core/src/runtime.ts
@@ -0,0 +1,152 @@
+// CTG-0002 §4 e §5 (R-0008, TASK-0005) — utilidades compartilhadas pelos
+// comandos manuscritos de `ops`: a superfície mínima de repositório por
+// tabela, o acesso SQL dentro de uma transação já aberta, o relógio injetado
+// (CODESTYLE: nunca `Date.now()` em domínio) e o sumidouro de eventos.
+import {
+  SqlTeatEventOutbox,
+  type TeatEventEnvelope,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import type { Transaction } from '@stynx-nyx/data';
+
+export type OpsRow = Record<string, unknown>;
+
+/**
+ * Superfície mínima de uma tabela de `ops` usada pelos comandos: é a de
+ * `OpsTenantRepository` (SQL sob RLS, ADR-0002) e a mesma que os harnesses de
+ * teste implementam. Nenhum comando escreve SQL de tabela fora de uma
+ * transação de domínio; tudo o mais passa por aqui.
+ */
+export interface OpsRowStore {
+  list(): Promise<OpsRow[]>;
+  find(id: string): Promise<OpsRow | undefined>;
+  create(values: OpsRow): Promise<OpsRow>;
+  /**
+   * `tx` é a transação em curso: quando vem, a escrita acontece **nela** e a
+   * porta não abre transação própria — é assim que a escrituração do item
+   * commita junto com o efeito de domínio (CTG-0002 §4.3 passo 4). Mesmo
+   * padrão dos repositórios gerados (`repository.update(id, dto, transaction)`).
+   */
+  update(id: string, patch: OpsRow, tx?: unknown): Promise<OpsRow | undefined>;
+}
+
+export interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+/**
+ * `Transaction` real do kernel sempre expõe `.query`; dublês de unidade que só
+ * provam a guarda, não. Quem chama decide o que fazer sem SQL — nunca lança.
+ */
+export function asQueryable(tx: unknown): SqlQueryable | undefined {
+  const candidate = tx as Partial<SqlQueryable> | null | undefined;
+  return candidate && typeof candidate.query === 'function'
+    ? (candidate as SqlQueryable)
+    : undefined;
+}
+
+/**
+ * Escreve uma linha pela porta de repositório.
+ *
+ * Valores de coluna `jsonb` que são **listas** não têm forma única na porta: um
+ * repositório SQL sobre `node-postgres` converte um array JS em literal de
+ * array do Postgres (`{"x"}`), que `jsonb` recusa, enquanto um repositório
+ * que entende JSON guarda a lista como está. A escrita tenta a forma
+ * estruturada e, se a porta a recusar, repete uma vez com as listas
+ * serializadas em texto JSON.
+ */
+export async function createOpsRow(
+  store: OpsRowStore,
+  values: OpsRow,
+): Promise<OpsRow> {
+  try {
+    return await store.create(values);
+  } catch (cause) {
+    const serialized = Object.fromEntries(
+      Object.entries(values).map(([key, value]) => [
+        key,
+        Array.isArray(value) ? JSON.stringify(value) : value,
+      ]),
+    );
+    if (stableKeys(serialized) === stableKeys(values)) throw cause;
+    return store.create(serialized);
+  }
+}
+
+function stableKeys(values: OpsRow): string {
+  return Object.entries(values)
+    .map(([key, value]) => `${key}:${typeof value}:${Array.isArray(value)}`)
+    .join('|');
+}
+
+export interface OpsClock {
+  now(): string;
+  today?(): string;
+}
+
+/** Relógio de produção; os comandos recebem o relógio, nunca o criam. */
+export const systemOpsClock: OpsClock = {
+  now: () => new Date().toISOString(),
+  today: () => new Date().toISOString().slice(0, 10),
+};
+
+export function todayOf(clock: OpsClock): string {
+  return clock.today?.() ?? clock.now().slice(0, 10);
+}
+
+/**
+ * Sumidouro de eventos dos comandos de `ops`.
+ *
+ * A persistência canônica do envelope é `integration.outbox`, na transação do
+ * comando (`SqlTeatEventOutbox`, CTG-0001 §2). Uma porta `TeatEventOutbox`
+ * injetada é sempre notificada; quando ela **não** é a implementação SQL
+ * canônica (decoradores, observadores e dublês), o envelope continua indo para
+ * a outbox, de modo que o invariante "evento na mesma transação do efeito"
+ * não depende de quem foi injetado. A idempotência é da própria outbox
+ * (`unique (tenant_id, idempotency_key)`), então a dupla escrita nunca duplica
+ * linha.
+ */
+export function teatEventSink(injected?: TeatEventOutbox): TeatEventOutbox {
+  const sql = new SqlTeatEventOutbox();
+  if (injected instanceof SqlTeatEventOutbox) return injected;
+  return {
+    async append(
+      tx: Transaction,
+      envelope: TeatEventEnvelope,
+    ): Promise<{ id: string }> {
+      const observed = await injected?.append(tx, envelope);
+      const persisted = await sql.append(tx, envelope);
+      return { id: persisted.id || (observed?.id ?? '') };
+    },
+  };
+}
+
+export interface TeatEnvelopeInput {
+  type: string;
+  domainEvent: string;
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+  aggregate: { kind: string; id: string; version: number };
+  data: Record<string, unknown>;
+  correlationId?: string;
+}
+
+/** Envelope do `rait-events-sse-contract.md` §1; `id` é da outbox (§13.5). */
+export function teatEnvelope(input: TeatEnvelopeInput): TeatEventEnvelope {
+  return {
+    id: '',
+    type: input.type,
+    domainEvent: input.domainEvent,
+    version: 1,
+    occurredAt: input.occurredAt,
+    tenantId: input.tenantId,
+    actor: { kind: 'user', id: input.actorId },
+    correlationId: input.correlationId ?? input.aggregate.id,
+    aggregate: input.aggregate,
+    data: input.data,
+  };
+}
diff --git a/backend/domains/ops/core/src/storage.ts b/backend/domains/ops/core/src/storage.ts
new file mode 100644
index 0000000..061c426
--- /dev/null
+++ b/backend/domains/ops/core/src/storage.ts
@@ -0,0 +1,24 @@
+// CTG-0002 §4.8 (R-0008, TASK-0005) — portas de CTG-0003 declaradas aqui só
+// pela forma; a semântica (presign, consulta de snapshot, selo do pacote
+// probatório) é daquele contrato e de TASK-0007.
+
+export interface EvidenceStoragePort {
+  presignUpload(input: {
+    objectKey: string;
+    mimeType: string;
+    sizeBytes: number;
+  }): Promise<{ uploadUrl: string; expiresAt: string }>;
+}
+
+/** Token multi-provider `{ wsdenatranRead, renach }` (CTG-0003). */
+export const SNAPSHOT_QUERY_PORTS: unique symbol = Symbol(
+  'SNAPSHOT_QUERY_PORTS',
+);
+
+export interface PackageSignerPort {
+  sign(manifestHash: string): Promise<{
+    signature: string;
+    signer: string;
+    kind: 'local-unsigned' | 'sealed';
+  }>;
+}
diff --git a/backend/domains/ops/core/src/sync-applier.ts b/backend/domains/ops/core/src/sync-applier.ts
new file mode 100644
index 0000000..f15fed7
--- /dev/null
+++ b/backend/domains/ops/core/src/sync-applier.ts
@@ -0,0 +1,48 @@
+// CTG-0002 §4.8 (R-0008, TASK-0005) — porta de aplicação de item de
+// sincronização. O protocolo de `@detran/ops-offline-sync` conhece só esta
+// interface: cada domínio de destino (AIT em M7, medidas e termo de sinais em
+// CTG-0004) publica o seu applier e o app monta a lista em
+// `backend/app/src/teat-sync.providers.ts`.
+import type { Transaction } from '@stynx-nyx/data';
+
+/**
+ * O item já materializado em `ops.sync_queue_item`, com o recibo já criado.
+ * Não carrega o payload: o applier o lê de `sync_queue_item.payload_json`
+ * pela própria transação do item (CTG-0002 §4.3 passo 4).
+ */
+export interface SyncEntityApplierItem {
+  id: string;
+  tenantId: string;
+  trafficAgencyId: string;
+  deviceId: string;
+  agentId: string;
+  entityType: string;
+  localEntityId: string;
+  idempotencyKey: string;
+  payloadHash: string;
+  createdLocallyAt: string;
+  /** Decidido pelo detector de concorrência (§4.7) antes do `apply`. */
+  concurrencySuspect: boolean;
+  /** Id da linha de `ops.sync_receipt` já criada para o item. */
+  receiptId: string;
+}
+
+/** Recusa de forma: `code` do catálogo e os caminhos do payload que falharam. */
+export interface SyncApplierRejection {
+  code: string;
+  fields: readonly string[];
+}
+
+export interface SyncEntityApplier {
+  readonly entityType: string;
+  validate(payload: unknown): SyncApplierRejection | null;
+  apply(
+    item: SyncEntityApplierItem,
+    tx: Transaction,
+  ): Promise<{ serverEntityId: string }>;
+}
+
+/** Token multi-provider da lista de appliers (CTG-0002 §4.8). */
+export const SYNC_ENTITY_APPLIERS: unique symbol = Symbol(
+  'SYNC_ENTITY_APPLIERS',
+);
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts b/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
index db50a20..9295e58 100644
--- a/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
+++ b/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
@@ -2,7 +2,7 @@ import { Body, Controller, Get, Post } from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';
 import { EvidenceCustodyService } from './evidence-custody.service.js';

-@Controller('ops/evidence')
+@Controller('v1/ops/evidence')
 export class EvidenceCustodyController {
   constructor(private readonly service: EvidenceCustodyService) {}

diff --git a/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts b/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts
new file mode 100644
index 0000000..11544ef
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts
@@ -0,0 +1,953 @@
+// CTG-0002 §4 e §5.13 (M5–M7, R-0008, TASK-0005) — `POST /v1/ops/offline-sync/
+// sync-batches`: o único ponto de entrada do protocolo de sincronização.
+//
+// Ordem das etapas, que é parte do contrato (§4.1): replay de lote → guarda de
+// sequência → materialização dos itens → detecção de concorrência → aplicação
+// item a item, **uma transação por item** → recibos → lote → eventos.
+//
+// Fronteira de persistência: a escrituração do protocolo (fila, recibo,
+// conflito, lote) passa pela porta de repositório injetada; o efeito de
+// domínio do item roda numa transação própria, que é a que o applier recebe e
+// a que carrega os eventos do item. Uma falha do applier reverte a transação
+// inteira e o recibo de recusa é gravado depois, fora dela (§4.3 passo 5).
+import type { OpsRow, SyncEntityApplier } from '@detran/ops-core';
+import {
+  asQueryable,
+  createOpsRow,
+  teatEventSink,
+  type SyncEntityApplierItem,
+} from '@detran/ops-core';
+import { DetranError, type TeatEventEnvelope } from '@detran/shared';
+import type { Transaction } from '@stynx-nyx/data';
+import { z } from 'zod';
+
+import {
+  ALLOWED_RESOLUTION_ACTIONS,
+  CONFLICT_DESCRIPTION,
+  SUPPORTED_ENTITY_TYPES,
+  clockOf,
+  numberOf,
+  outcomeFor,
+  ownedBy,
+  storeOf,
+  tenantScope,
+  type ConflictType,
+  type OfflineSyncDeps,
+  type ReceiptStatus,
+} from './batch-protocol.js';
+import { canonicalHash } from './canonical-hash.js';
+import {
+  CONCURRENCY_WINDOW_KEY,
+  CONCURRENCY_WINDOW_WARNING,
+  concurrentCandidates,
+  windowBounds,
+  windowFrom,
+} from './concurrency-detector.js';
+import {
+  aitConcurrencySuspectedEvent,
+  aitReceivedEvent,
+  syncConflictOpenedEvent,
+  syncItemReceivedEvent,
+  type EventScope,
+} from './events.js';
+
+export interface SyncBatchItemInput {
+  entity_type: string;
+  local_entity_id: string;
+  server_entity_id?: string;
+  idempotency_key?: string;
+  payload_hash: string;
+  created_locally_at?: string;
+  payload_json?: Record<string, unknown>;
+}
+
+export interface SubmitSyncBatchInput {
+  traffic_agency_id: string;
+  device_id: string;
+  agent_id: string;
+  device_batch_id: string;
+  batch_sequence?: number | null;
+  items: SyncBatchItemInput[];
+}
+
+export interface SyncReceiptView {
+  local_entity_id: string | null;
+  idempotency_key: string | null;
+  status: string | null;
+  server_entity_id: string | null;
+  error_code: string | null;
+  error_message: string | null;
+  details_json: Record<string, unknown> | null;
+}
+
+export interface SubmitSyncBatchResponse {
+  batchId: string | null;
+  batch_sequence: number | null;
+  accepted_items: number;
+  receipts: SyncReceiptView[];
+  warnings: string[];
+}
+
+/**
+ * §4.2 e §5.13 — forma do `SubmitSyncBatchDto` de origem, conferida na
+ * fronteira antes de qualquer materialização. `tenant_id` do DTO de origem é
+ * descartado (CODESTYLE §Backend: o tenant vem do `RequestContext`), então o
+ * objeto **não** é estrito: chaves desconhecidas são removidas, não recusadas.
+ */
+const syncBatchItemSchema = z.object({
+  entity_type: z.string().min(1).max(60),
+  local_entity_id: z.uuid(),
+  server_entity_id: z.uuid().nullish(),
+  idempotency_key: z.string().min(1).max(160).nullish(),
+  payload_hash: z.string().min(1).max(128),
+  created_locally_at: z.iso.datetime({ offset: true }).nullish(),
+  payload_json: z.record(z.string(), z.unknown()).nullish(),
+});
+
+const submitSyncBatchSchema = z.object({
+  traffic_agency_id: z.uuid(),
+  device_id: z.uuid(),
+  agent_id: z.uuid(),
+  device_batch_id: z.string().min(1).max(160),
+  batch_sequence: z.int().min(1).nullish(),
+  items: z.array(syncBatchItemSchema).min(1),
+});
+
+/** `context.fields[] { path, rule, params }` do catálogo §1 regra 5. */
+function validationFields(error: z.ZodError): Array<Record<string, unknown>> {
+  return error.issues.map((issue) => {
+    const {
+      code,
+      path,
+      message: _message,
+      ...params
+    } = issue as unknown as Record<string, unknown>;
+    return {
+      path: (path as unknown[]).map(String).join('.'),
+      rule: String(code),
+      params,
+    };
+  });
+}
+
+interface PreparedItem {
+  raw: SyncBatchItemInput;
+  entityType: string;
+  localEntityId: string;
+  idempotencyKey: string;
+  payloadHash: string;
+  createdLocallyAt: string;
+  /** Recibo já existente (replay de item) — nada mais acontece. */
+  existingReceipt?: OpsRow;
+  /** Linha de fila criada para o item deste lote. */
+  itemRow?: OpsRow;
+  receiptRow?: OpsRow;
+  /** Desfecho já decidido antes da aplicação. */
+  closed?: { code: string; context: Record<string, unknown> };
+  /** Recibo sintético: o item existe com a mesma chave e outro hash (§4.2). */
+  transient?: SyncReceiptView;
+  applier?: SyncEntityApplier;
+  concurrencySuspect?: boolean;
+  concurrencyContext?: Record<string, unknown>;
+}
+
+/** §4.2 — chave derivada do caminho legado. */
+function legacyKey(deviceId: string, localEntityId: string): string {
+  return `legacy:${deviceId}:${localEntityId}`;
+}
+
+function receiptView(row: OpsRow): SyncReceiptView {
+  const details = (row.details_json ?? null) as Record<string, unknown> | null;
+  return {
+    local_entity_id: (row.local_entity_id as string) ?? null,
+    idempotency_key: (row.idempotency_key as string) ?? null,
+    status: (row.status as string) ?? null,
+    server_entity_id: (row.server_entity_id as string) ?? null,
+    error_code: (row.reason_code as string) ?? null,
+    error_message: null,
+    details_json: details,
+  };
+}
+
+export class SubmitBatchCommand {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async execute(input: SubmitSyncBatchInput): Promise<SubmitSyncBatchResponse> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const clock = clockOf(this.deps);
+    const scope: EventScope = { tenantId, actorId, occurredAt: clock.now() };
+    const parsed = submitSyncBatchSchema.safeParse(input);
+    if (!parsed.success)
+      throw new DetranError('TEAT.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: validationFields(parsed.error) },
+        message: 'Lote de sincronização com forma inválida.',
+      });
+    const deviceId = parsed.data.device_id;
+    const deviceBatchId = parsed.data.device_batch_id;
+    const sequence =
+      parsed.data.batch_sequence === undefined ||
+      parsed.data.batch_sequence === null
+        ? null
+        : numberOf(parsed.data.batch_sequence);
+    const rawItems = input.items;
+
+    const batches = storeOf(this.deps, 'batches');
+    const deviceBatches = ownedBy(await batches.list(), tenantId).filter(
+      (row) => String(row.device_id) === deviceId,
+    );
+    const replayed = deviceBatches.find(
+      (row) => String(row.device_batch_id) === deviceBatchId,
+    );
+    if (replayed)
+      return this.replay(replayed, rawItems, sequence, deviceId, tenantId);
+    this.assertSequence(deviceBatches, sequence, deviceBatchId);
+
+    const window = await this.concurrencyWindow(input.traffic_agency_id);
+    const warnings =
+      window.minutes === null ? [CONCURRENCY_WINDOW_WARNING] : [];
+
+    // §4.1 passo 9 antes do passo 10: o lote é gravado antes de qualquer
+    // envelope de item, para que `data.batchId` carregue o id persistido;
+    // `accepted_items` e `receipts_json` são fechados ao fim, quando os
+    // recibos existem.
+    const batchRow = await batches.create({
+      traffic_agency_id: String(input.traffic_agency_id),
+      agent_id: String(input.agent_id),
+      device_id: deviceId,
+      device_batch_id: deviceBatchId,
+      batch_sequence: sequence,
+      submitted_at: scope.occurredAt,
+      accepted_items: 0,
+      receipts_json: { item_ids: [] },
+    });
+    const batchId = String(batchRow.id);
+
+    const prepared: PreparedItem[] = [];
+    for (const raw of rawItems) {
+      prepared.push(await this.materialize(raw, input, tenantId));
+    }
+    if (window.minutes !== null) {
+      await this.detectConcurrency(
+        prepared,
+        input,
+        tenantId,
+        scope,
+        window.minutes,
+      );
+    }
+
+    const receipts: SyncReceiptView[] = [];
+    for (const item of prepared) {
+      receipts.push(await this.settle(item, input, sequence, scope, batchId));
+    }
+
+    const acceptedItems = receipts.filter(
+      (receipt) =>
+        receipt.status !== 'rejected' && receipt.status !== 'conflict',
+    ).length;
+    const itemIds = prepared
+      .map((item) => item.itemRow?.id)
+      .filter((id): id is string => typeof id === 'string');
+    await batches.update(batchId, {
+      accepted_items: acceptedItems,
+      receipts_json: { item_ids: itemIds },
+    });
+
+    return {
+      batchId,
+      batch_sequence: sequence,
+      accepted_items: acceptedItems,
+      receipts,
+      warnings,
+    };
+  }
+
+  /** §4.1 passo 3 — retransmissão do último lote: recibos originais, sem efeito. */
+  private async replay(
+    batch: OpsRow,
+    rawItems: SyncBatchItemInput[],
+    sequence: number | null,
+    deviceId: string,
+    tenantId: string,
+  ): Promise<SubmitSyncBatchResponse> {
+    const deviceBatchId = String(batch.device_batch_id);
+    const stored =
+      batch.batch_sequence === null || batch.batch_sequence === undefined
+        ? null
+        : numberOf(batch.batch_sequence);
+    if (stored !== sequence) throw replayMismatch(deviceBatchId);
+    const itemIds = (
+      ((batch.receipts_json ?? {}) as { item_ids?: string[] }).item_ids ?? []
+    ).map(String);
+    const items = ownedBy(
+      await storeOf(this.deps, 'items').list(),
+      tenantId,
+    ).filter((row) => itemIds.includes(String(row.id)));
+    const storedKeys = items
+      .map((row) => String(row.idempotency_key))
+      .sort()
+      .join('|');
+    const incomingKeys = rawItems
+      .map((raw) =>
+        raw.idempotency_key
+          ? String(raw.idempotency_key)
+          : legacyKey(deviceId, String(raw.local_entity_id)),
+      )
+      .sort()
+      .join('|');
+    if (storedKeys !== incomingKeys) throw replayMismatch(deviceBatchId);
+    const receiptRows = ownedBy(
+      await storeOf(this.deps, 'receipts').list(),
+      tenantId,
+    );
+    const receipts = itemIds
+      .map((itemId) =>
+        receiptRows.find((row) => String(row.sync_queue_item_id) === itemId),
+      )
+      .filter((row): row is OpsRow => row !== undefined)
+      .map(receiptView);
+    return {
+      batchId: (batch.id as string) ?? null,
+      batch_sequence: stored,
+      accepted_items: numberOf(batch.accepted_items ?? receipts.length),
+      receipts,
+      warnings: [],
+    };
+  }
+
+  /**
+   * §4.1 passo 4 — sequência: `last` é o maior `batch_sequence` aceito do
+   * (tenant, device) **ou 0**, inclusive no primeiro lote do dispositivo. Com
+   * `last = 0` o primeiro lote sequenciado só pode ser o `1`: qualquer outro é
+   * replay (≤ 0 é impossível pelo schema) ou lacuna.
+   */
+  private assertSequence(
+    deviceBatches: OpsRow[],
+    sequence: number | null,
+    deviceBatchId: string,
+  ): void {
+    if (sequence === null) return;
+    const sequences = deviceBatches
+      .map((row) => row.batch_sequence)
+      .filter((value) => value !== null && value !== undefined)
+      .map(numberOf)
+      .filter((value) => Number.isFinite(value));
+    const last = sequences.length === 0 ? 0 : Math.max(...sequences);
+    if (sequence <= last)
+      throw new DetranError('TEAT.SYNC_BATCH_SEQUENCE_REPLAYED', {
+        status: 409,
+        context: {
+          expectedSequence: last + 1,
+          received: sequence,
+          deviceBatchId,
+        },
+        message: 'Sequência de lote já aceita para o dispositivo.',
+      });
+    if (sequence > last + 1)
+      throw new DetranError('TEAT.SYNC_BATCH_SEQUENCE_GAP', {
+        status: 422,
+        context: {
+          expectedSequence: last + 1,
+          received: sequence,
+          deviceBatchId,
+        },
+        message: 'Sequência de lote com lacuna; reenvie os lotes anteriores.',
+      });
+  }
+
+  private async concurrencyWindow(
+    agencyId: string,
+  ): Promise<{ minutes: number | null }> {
+    const parameters = this.deps.parameters;
+    if (!parameters) return { minutes: null };
+    try {
+      const row = await parameters.get(CONCURRENCY_WINDOW_KEY, {
+        agencyId: agencyId ? String(agencyId) : undefined,
+      });
+      return windowFrom(row ?? {});
+    } catch {
+      // Linha ausente no catálogo do tenant: detecção desligada (§4.7).
+      return { minutes: null };
+    }
+  }
+
+  /** §4.2 — identidade, integridade e materialização de um item. */
+  private async materialize(
+    raw: SyncBatchItemInput,
+    input: SubmitSyncBatchInput,
+    tenantId: string,
+  ): Promise<PreparedItem> {
+    const deviceId = String(input.device_id);
+    const entityType = String(raw.entity_type);
+    const localEntityId = String(raw.local_entity_id);
+    const legacy = !raw.idempotency_key;
+    const idempotencyKey = legacy
+      ? legacyKey(deviceId, localEntityId)
+      : String(raw.idempotency_key);
+    const payloadHash = String(raw.payload_hash);
+    const createdLocallyAt = raw.created_locally_at
+      ? String(raw.created_locally_at)
+      : clockOf(this.deps).now();
+    const base: PreparedItem = {
+      raw,
+      entityType,
+      localEntityId,
+      idempotencyKey,
+      payloadHash,
+      createdLocallyAt,
+    };
+
+    const items = storeOf(this.deps, 'items');
+    const known = ownedBy(await items.list(), tenantId).find(
+      (row) => String(row.idempotency_key) === idempotencyKey,
+    );
+    if (known) {
+      const storedHash = String(known.payload_hash);
+      const receipts = ownedBy(
+        await storeOf(this.deps, 'receipts').list(),
+        tenantId,
+      );
+      const receipt = receipts.find(
+        (row) => String(row.sync_queue_item_id) === String(known.id),
+      );
+      if (storedHash === payloadHash)
+        return receipt
+          ? { ...base, existingReceipt: receipt }
+          : {
+              ...base,
+              itemRow: known,
+              transient: {
+                local_entity_id: localEntityId,
+                idempotency_key: idempotencyKey,
+                status: String(known.status ?? 'received'),
+                server_entity_id: (known.server_entity_id as string) ?? null,
+                error_code: (known.error_code as string) ?? null,
+                error_message: null,
+                details_json: null,
+              },
+            };
+      {
+        const context = {
+          idempotencyKey,
+          storedHash,
+          receivedHash: payloadHash,
+        };
+        await this.openConflict(
+          known,
+          'integrity',
+          'TEAT.SYNC_INTEGRITY_ERROR',
+          {
+            local: payloadHash,
+            server: storedHash,
+          },
+        );
+        // Os índices `(tenant_id, idempotency_key)` de `ops.sync_queue_item` e
+        // `ops.sync_receipt` são únicos: a chave já tem fila e recibo próprios,
+        // então o registro durável da divergência é o conflito e o recibo da
+        // resposta é sintético.
+        return {
+          ...base,
+          itemRow: known,
+          transient: {
+            local_entity_id: localEntityId,
+            idempotency_key: idempotencyKey,
+            status: 'rejected',
+            server_entity_id: null,
+            error_code: 'TEAT.SYNC_INTEGRITY_ERROR',
+            error_message: null,
+            details_json: context,
+          },
+        };
+      }
+    }
+
+    const itemRow = await items.create({
+      traffic_agency_id: String(input.traffic_agency_id),
+      device_id: deviceId,
+      agent_id: String(input.agent_id),
+      entity_type: entityType,
+      local_entity_id: localEntityId,
+      status: 'pending',
+      created_locally_at: createdLocallyAt,
+      idempotency_key: idempotencyKey,
+      payload_hash: payloadHash,
+      payload_json: raw.payload_json ?? {},
+    });
+    const receiptRow = await storeOf(this.deps, 'receipts').create({
+      sync_queue_item_id: String(itemRow.id),
+      idempotency_key: idempotencyKey,
+      entity_type: entityType,
+      local_entity_id: localEntityId,
+      accepted_hash: payloadHash,
+      status: 'received',
+    });
+    const prepared: PreparedItem = { ...base, itemRow, receiptRow };
+
+    if (legacy)
+      return {
+        ...prepared,
+        closed: { code: 'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED', context: {} },
+      };
+    if (raw.payload_json && canonicalHash(raw.payload_json) !== payloadHash) {
+      const context = {
+        idempotencyKey,
+        storedHash: canonicalHash(raw.payload_json),
+        receivedHash: payloadHash,
+      };
+      return {
+        ...prepared,
+        closed: { code: 'TEAT.SYNC_INTEGRITY_ERROR', context },
+      };
+    }
+    if (!SUPPORTED_ENTITY_TYPES.includes(entityType))
+      return {
+        ...prepared,
+        closed: {
+          code: 'TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE',
+          context: { supported: [...SUPPORTED_ENTITY_TYPES] },
+        },
+      };
+    const applier = (this.deps.appliers ?? []).find(
+      (candidate) => candidate.entityType === entityType,
+    );
+    if (!applier)
+      return {
+        ...prepared,
+        closed: {
+          code: 'TEAT.SYNC_DESTINATION_NOT_WIRED',
+          context: { entityType },
+        },
+      };
+    const rejection = applier.validate(raw.payload_json ?? {});
+    if (rejection)
+      return {
+        ...prepared,
+        closed: {
+          code: rejection.code,
+          context: { fields: [...rejection.fields] },
+        },
+      };
+    return { ...prepared, applier };
+  }
+
+  /** §4.7 — marca os dois lados quando a janela está ligada. */
+  private async detectConcurrency(
+    prepared: PreparedItem[],
+    input: SubmitSyncBatchInput,
+    tenantId: string,
+    scope: EventScope,
+    windowMinutes: number,
+  ): Promise<void> {
+    const items = storeOf(this.deps, 'items');
+    const handoffStore = this.deps.repositories.handoffs;
+    const handoffs = handoffStore
+      ? ownedBy(await handoffStore.list(), tenantId)
+      : [];
+    const deviceId = String(input.device_id);
+    const agentId = String(input.agent_id);
+    for (const item of prepared) {
+      if (item.entityType !== 'ait' || !item.itemRow) continue;
+      // O ato existe e está na fila: a apuração vale mesmo quando o destino
+      // ainda não está montado (§4.7 fala do item `ait` do lote, não do
+      // applier). Itens sem identidade estável (legado), com integridade
+      // quebrada ou de tipo não suportado ficam fora.
+      const applicable =
+        item.applier !== undefined ||
+        item.closed?.code === 'TEAT.SYNC_DESTINATION_NOT_WIRED';
+      if (!applicable) continue;
+      const rows = ownedBy(await items.list(), tenantId);
+      const candidates = concurrentCandidates({
+        items: rows,
+        handoffs,
+        agentId,
+        deviceId,
+        createdLocallyAt: item.createdLocallyAt,
+        windowMinutes,
+        excludeItemId: String(item.itemRow.id),
+      });
+      if (candidates.length === 0) continue;
+      const bounds = windowBounds(item.createdLocallyAt, windowMinutes);
+      const context = {
+        otherDeviceId: String(candidates[0]!.device_id),
+        ...bounds,
+        windowMinutes,
+        conflictingQueueItemIds: candidates.map((row) => String(row.id)),
+      };
+      item.concurrencySuspect = true;
+      item.concurrencyContext = context;
+      const conflict = await this.openConflict(
+        item.itemRow,
+        'concurrency',
+        'TEAT.SYNC_CONCURRENCY_SUSPECT',
+      );
+      item.concurrencyContext = {
+        ...context,
+        conflictId: (conflict?.id as string) ?? null,
+      };
+      await this.emit(
+        syncConflictOpenedEvent(scope, {
+          conflictId: String(conflict?.id ?? ''),
+          conflictType: 'concurrency',
+          syncQueueItemId: String(item.itemRow.id),
+          reasonCode: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+          openedAt: scope.occurredAt,
+        }),
+      );
+      for (const candidate of candidates) {
+        await this.markCandidate(
+          candidate,
+          item,
+          windowMinutes,
+          scope,
+          tenantId,
+        );
+      }
+    }
+  }
+
+  private async markCandidate(
+    candidate: OpsRow,
+    item: PreparedItem,
+    windowMinutes: number,
+    scope: EventScope,
+    tenantId: string,
+  ): Promise<void> {
+    const bounds = windowBounds(
+      String(candidate.created_locally_at),
+      windowMinutes,
+    );
+    const context = {
+      otherDeviceId: String(item.itemRow?.device_id ?? ''),
+      ...bounds,
+      windowMinutes,
+      conflictingQueueItemIds: [String(item.itemRow?.id ?? '')],
+    };
+    await storeOf(this.deps, 'items').update(String(candidate.id), {
+      status: 'conflict',
+      error_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+    });
+    const receipts = storeOf(this.deps, 'receipts');
+    const existing = ownedBy(await receipts.list(), tenantId).find(
+      (row) => String(row.sync_queue_item_id) === String(candidate.id),
+    );
+    if (existing)
+      await receipts.update(String(existing.id), {
+        status: 'conflict',
+        reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        details_json: context,
+      });
+    const conflict = await this.openConflict(
+      candidate,
+      'concurrency',
+      'TEAT.SYNC_CONCURRENCY_SUSPECT',
+    );
+    await this.emit(
+      syncConflictOpenedEvent(scope, {
+        conflictId: String(conflict?.id ?? ''),
+        conflictType: 'concurrency',
+        syncQueueItemId: String(candidate.id),
+        reasonCode: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        openedAt: scope.occurredAt,
+      }),
+    );
+  }
+
+  /** §4.3 — aplicação (ou desfecho já decidido) de um item. */
+  private async settle(
+    item: PreparedItem,
+    input: SubmitSyncBatchInput,
+    sequence: number | null,
+    scope: EventScope,
+    batchId: string,
+  ): Promise<SyncReceiptView> {
+    if (item.existingReceipt) return receiptView(item.existingReceipt);
+    if (item.transient) return item.transient;
+    if (!item.itemRow || !item.receiptRow)
+      throw new Error('Sync item was not materialized');
+
+    if (item.concurrencySuspect && item.concurrencyContext && item.closed) {
+      // O ato ficou barrado pela apuração antes de ter destino: o desfecho do
+      // item é o conflito de concorrência (§4.4), e o AIT do servidor ainda
+      // não existe — o evento identifica o ato pelo id local.
+      const view = await this.close(
+        item,
+        'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        item.concurrencyContext,
+        null,
+        'already-open',
+      );
+      await this.emitConcurrencyEvent(item, item.localEntityId, scope);
+      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
+      return view;
+    }
+    if (item.closed) {
+      const view = await this.close(
+        item,
+        item.closed.code,
+        item.closed.context,
+        null,
+      );
+      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
+      return view;
+    }
+
+    const applier = item.applier;
+    if (!applier) throw new Error('Sync item has no applier');
+    const applierItem: SyncEntityApplierItem = {
+      id: String(item.itemRow.id),
+      tenantId: scope.tenantId,
+      trafficAgencyId: String(input.traffic_agency_id),
+      deviceId: String(input.device_id),
+      agentId: String(input.agent_id),
+      entityType: item.entityType,
+      localEntityId: item.localEntityId,
+      idempotencyKey: item.idempotencyKey,
+      payloadHash: item.payloadHash,
+      createdLocallyAt: item.createdLocallyAt,
+      concurrencySuspect: item.concurrencySuspect === true,
+      receiptId: String(item.receiptRow.id),
+    };
+    const suspect = applierItem.concurrencySuspect;
+    const receiptStatus: ReceiptStatus = suspect ? 'conflict' : 'applied';
+    let settled: { serverEntityId: string; receipt?: OpsRow };
+    try {
+      // §4.3 passo 4 — uma transação por item: efeito de domínio, escrituração
+      // da fila, recibo e eventos commitam juntos; qualquer falha reverte tudo.
+      settled = await this.deps.database.tx(async (tx) => {
+        await lockDeviceScope(tx, scope.tenantId, applierItem.deviceId);
+        const applied = await applier.apply(applierItem, tx as Transaction);
+        // A escrituração passa pela porta (§4.8), com a transação do item
+        // explícita: a linha promovida commita junto com o efeito de domínio e
+        // some junto com ele se qualquer passo seguinte falhar.
+        await storeOf(this.deps, 'items').update(
+          applierItem.id,
+          {
+            status: receiptStatus,
+            server_entity_id: applied.serverEntityId,
+            received_at: scope.occurredAt,
+            ...(suspect ? { error_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT' } : {}),
+          },
+          tx,
+        );
+        const receipt = await storeOf(this.deps, 'receipts').update(
+          applierItem.receiptId,
+          {
+            status: receiptStatus,
+            server_entity_id: applied.serverEntityId,
+            applied_at: scope.occurredAt,
+            ...(suspect
+              ? {
+                  reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+                  details_json: item.concurrencyContext ?? {},
+                }
+              : {}),
+          },
+          tx,
+        );
+        const sink = teatEventSink(this.deps.outbox);
+        if (item.entityType === 'ait') {
+          if (suspect && item.concurrencyContext)
+            await sink.append(
+              tx as Transaction,
+              concurrencyEnvelope(item, applied.serverEntityId, scope),
+            );
+          else
+            await sink.append(
+              tx as Transaction,
+              aitReceivedEvent(scope, {
+                aitId: applied.serverEntityId,
+                fromState: 'TRANSMITIDO',
+                receiptProtocol: applierItem.receiptId,
+                receivedAt: scope.occurredAt,
+              }),
+            );
+        }
+        await sink.append(
+          tx as Transaction,
+          syncItemReceivedEvent(scope, {
+            batchId,
+            deviceBatchId: String(input.device_batch_id),
+            batchSequence: sequence,
+            itemId: applierItem.id,
+            entityType: item.entityType,
+            localEntityId: item.localEntityId,
+            receiptStatus,
+            errorCode: suspect ? 'TEAT.SYNC_CONCURRENCY_SUSPECT' : null,
+            serverEntityId: applied.serverEntityId,
+          }),
+        );
+        return { serverEntityId: applied.serverEntityId, receipt };
+      });
+    } catch (error) {
+      // §4.3 passo 5 — rollback completo do item; o recibo de recusa é gravado
+      // numa transação própria e nova.
+      const failure = asDomainFailure(error);
+      const view = await this.close(
+        item,
+        failure.code,
+        failure.context,
+        null,
+        failure.conflictType,
+      );
+      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
+      return view;
+    }
+    return receiptView(settled.receipt ?? item.receiptRow);
+  }
+
+  /** Recibo e fila num desfecho terminal, com o conflito quando couber (§4.4). */
+  private async close(
+    item: PreparedItem,
+    code: string,
+    context: Record<string, unknown>,
+    serverEntityId: string | null,
+    conflictType?: ConflictType | 'already-open',
+  ): Promise<SyncReceiptView> {
+    const outcome = outcomeFor(code);
+    const status: ReceiptStatus = outcome.status;
+    await storeOf(this.deps, 'items').update(String(item.itemRow!.id), {
+      status,
+      error_code: code,
+      ...(serverEntityId ? { server_entity_id: serverEntityId } : {}),
+    });
+    const updated = await storeOf(this.deps, 'receipts').update(
+      String(item.receiptRow!.id),
+      {
+        status,
+        reason_code: code,
+        details_json: context,
+        ...(serverEntityId ? { server_entity_id: serverEntityId } : {}),
+      },
+    );
+    const type = conflictType ?? outcome.conflictType;
+    if (type && type !== 'already-open')
+      await this.openConflict(item.itemRow!, type, code);
+    return receiptView(updated ?? item.receiptRow!);
+  }
+
+  /**
+   * `ops.sync_conflict` não tem coluna de contexto (DDL 18): o detalhe do caso
+   * vive em `sync_receipt.details_json`; aqui ficam só os campos do contrato
+   * (§4.2) — tipo, código, hashes, ações admitidas e estado.
+   */
+  private async openConflict(
+    itemRow: OpsRow,
+    conflictType: ConflictType,
+    reasonCode: string,
+    hashes: { local?: string; server?: string } = {},
+  ): Promise<OpsRow | undefined> {
+    const conflicts = this.deps.repositories.conflicts;
+    if (!conflicts) return undefined;
+    return createOpsRow(conflicts, {
+      sync_queue_item_id: String(itemRow.id),
+      conflict_type: conflictType,
+      reason_code: reasonCode,
+      local_hash: hashes.local ?? null,
+      server_hash: hashes.server ?? null,
+      retryable: false,
+      allowed_resolution_actions: [...ALLOWED_RESOLUTION_ACTIONS[conflictType]],
+      description: CONFLICT_DESCRIPTION[conflictType],
+      status: 'open',
+    });
+  }
+
+  private async emitConcurrencyEvent(
+    item: PreparedItem,
+    aitId: string,
+    scope: EventScope,
+  ): Promise<void> {
+    await this.emit(concurrencyEnvelope(item, aitId, scope));
+  }
+
+  private async publishItemEvent(
+    item: PreparedItem,
+    input: SubmitSyncBatchInput,
+    sequence: number | null,
+    scope: EventScope,
+    view: SyncReceiptView,
+    batchId: string,
+  ): Promise<void> {
+    await this.emit(
+      syncItemReceivedEvent(scope, {
+        batchId,
+        deviceBatchId: String(input.device_batch_id),
+        batchSequence: sequence,
+        itemId: String(item.itemRow?.id ?? ''),
+        entityType: item.entityType,
+        localEntityId: item.localEntityId,
+        receiptStatus: (view.status ?? 'received') as ReceiptStatus,
+        errorCode: view.error_code,
+        serverEntityId: view.server_entity_id,
+      }),
+    );
+  }
+
+  private async emit(envelope: TeatEventEnvelope): Promise<void> {
+    const sink = teatEventSink(this.deps.outbox);
+    await this.deps.database.tx((tx) =>
+      sink.append(tx as Transaction, envelope),
+    );
+  }
+}
+
+function concurrencyEnvelope(
+  item: PreparedItem,
+  aitId: string,
+  scope: EventScope,
+): TeatEventEnvelope {
+  const context = item.concurrencyContext ?? {};
+  return aitConcurrencySuspectedEvent(scope, {
+    aitId,
+    agentId: String(item.itemRow?.agent_id ?? ''),
+    deviceId: String(item.itemRow?.device_id ?? ''),
+    otherDeviceId: (context.otherDeviceId as string) ?? null,
+    windowStart: String(context.windowStart),
+    windowEnd: String(context.windowEnd),
+    conflictId: (context.conflictId as string) ?? null,
+  });
+}
+
+function replayMismatch(deviceBatchId: string): DetranError {
+  return new DetranError('TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH', {
+    status: 409,
+    context: { deviceBatchId },
+    message: 'Lote retransmitido com contexto diferente do gravado.',
+  });
+}
+
+/**
+ * §4.1 passo 2 — serializa a aceitação por tenant+dispositivo. A porta de
+ * repositório abre transação por instrução, então o bloqueio é tomado na
+ * transação do item, que é onde o efeito de domínio acontece.
+ */
+async function lockDeviceScope(
+  tx: unknown,
+  tenantId: string,
+  deviceId: string,
+): Promise<void> {
+  const queryable = asQueryable(tx);
+  if (!queryable) return;
+  await queryable.query(
+    'select id from ops.sync_batch where tenant_id = $1 and device_id = $2 for update',
+    [tenantId, deviceId],
+  );
+}
+
+function asDomainFailure(error: unknown): {
+  code: string;
+  context: Record<string, unknown>;
+  conflictType?: ConflictType;
+} {
+  const candidate = error as {
+    code?: unknown;
+    context?: unknown;
+  } | null;
+  const code =
+    typeof candidate?.code === 'string' ? candidate.code : 'TEAT.INTERNAL';
+  const context =
+    candidate?.context && typeof candidate.context === 'object'
+      ? (candidate.context as Record<string, unknown>)
+      : {};
+  return { code, context, conflictType: outcomeFor(code).conflictType };
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/submit-batch.spec.ts b/backend/domains/ops/offline-sync/src/handwritten/submit-batch.spec.ts
index c74ef19..41b7e7e 100644
--- a/backend/domains/ops/offline-sync/src/handwritten/submit-batch.spec.ts
+++ b/backend/domains/ops/offline-sync/src/handwritten/submit-batch.spec.ts
@@ -156,7 +156,9 @@ function batch(
     device_id: DEVICE_ID,
     agent_id: AGENT_ID,
     device_batch_id: 'batch-010',
-    batch_sequence: 2,
+    // Primeiro lote de um device: §4.1 passo 4 fixa `last = 0`, logo a
+    // única sequência aceita é 1. Os casos de replay e gap sobrescrevem.
+    batch_sequence: 1,
     items: [item()],
     ...overrides,
   };
@@ -476,7 +478,7 @@ describe('CTG-0002 §4.2/§4.3/§4.4 — item: identidade, integridade, tipo e l
     const appliesAfterFirst = ait.apply.mock.calls.length;
     const second = await submitBatch(
       dependencies,
-      batch({ device_batch_id: 'batch-012', batch_sequence: 3 }),
+      batch({ device_batch_id: 'batch-012', batch_sequence: 2 }),
     );
     expect(receiptFor(second, LOCAL_ENTITY_1)).toEqual(
       receiptFor(first, LOCAL_ENTITY_1),
@@ -492,7 +494,7 @@ describe('CTG-0002 §4.2/§4.3/§4.4 — item: identidade, integridade, tipo e l
       dependencies,
       batch({
         device_batch_id: 'batch-013',
-        batch_sequence: 3,
+        batch_sequence: 2,
         items: [
           item({
             payload_json: divergent,
@@ -835,3 +837,139 @@ describe('CTG-0002 §4.7 — detecção de concorrência (M6, RN-TEAT-111, AC-TE
     expect(response.warnings).toEqual([]);
   });
 });
+
+/**
+ * CTG-0002 §4.1 passo 4 e §5.13 (R-0008, TASK-0004 iteração 3) — achados 3 e 4
+ * da delivery-review do CTG-0002: o primeiro lote sequenciado de um device e a
+ * validação de forma do `SubmitSyncBatchDto`.
+ *
+ * Os dois blocos são transcrição do contrato, não interpretação: o passo 4 diz
+ * `last = max(batch_sequence) aceito do (tenant, device), ou 0`, logo o
+ * primeiro lote de um device só aceita `1`; e a §5.13 fixa `device_batch_id`
+ * obrigatório, `items` obrigatório com ≥ 1 elemento e `batch_sequence?: int ≥ 1`.
+ */
+describe('CTG-0002 §4.1 passo 4 — primeiro lote sequenciado de um device (achado 3)', () => {
+  it('dado nenhum lote anterior do device quando chega batch_sequence = 2 então 422 TEAT.SYNC_BATCH_SEQUENCE_GAP com expectedSequence 1 e received 2 (last = 0)', async () => {
+    const dependencies = deps();
+    await expect(
+      submitBatch(dependencies, batch({ batch_sequence: 2 })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
+      status: 422,
+      context: expect.objectContaining({ expectedSequence: 1, received: 2 }),
+    });
+    expect(dependencies.repositories.batches.rows).toEqual([]);
+    expect(dependencies.repositories.items.rows).toEqual([]);
+  });
+
+  it('dado nenhum lote anterior do device quando chega batch_sequence = 1 então o lote é aceito e a resposta ecoa batch_sequence 1', async () => {
+    const dependencies = deps();
+    const response = await submitBatch(
+      dependencies,
+      batch({ batch_sequence: 1 }),
+    );
+    expect(response.batch_sequence).toBe(1);
+    expect(receiptFor(response, LOCAL_ENTITY_1).status).toBe('applied');
+  });
+
+  it('dado nenhum lote anterior do device quando chega batch_sequence = 3 então 422 com expectedSequence 1, nunca 409 de replay (não há o que reprisar)', async () => {
+    const dependencies = deps();
+    await expect(
+      submitBatch(dependencies, batch({ batch_sequence: 3 })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
+      status: 422,
+      context: expect.objectContaining({ expectedSequence: 1, received: 3 }),
+    });
+  });
+});
+
+describe('CTG-0002 §5.13 — validação de forma do SubmitSyncBatchDto (achado 4)', () => {
+  /** Nada pode ser materializado quando o corpo é inválido. */
+  function expectNothingMaterialized(dependencies: Deps): void {
+    expect(dependencies.repositories.batches.rows).toEqual([]);
+    expect(dependencies.repositories.items.rows).toEqual([]);
+    expect(dependencies.repositories.receipts.rows).toEqual([]);
+    expect(dependencies.repositories.conflicts.rows).toEqual([]);
+  }
+
+  it('dado items ausente então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando items, e nada materializado', async () => {
+    const dependencies = deps();
+    const input = batch();
+    delete input.items;
+    await expect(submitBatch(dependencies, input)).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 400,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'items' }),
+        ]),
+      }),
+    });
+    expectNothingMaterialized(dependencies);
+  });
+
+  it('dado items vazio então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando items (o DTO exige ≥ 1), e nada materializado', async () => {
+    const dependencies = deps();
+    await expect(
+      submitBatch(dependencies, batch({ items: [] })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 400,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'items' }),
+        ]),
+      }),
+    });
+    expectNothingMaterialized(dependencies);
+  });
+
+  it('dado batch_sequence não inteiro então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando batch_sequence, e nada materializado', async () => {
+    const dependencies = deps();
+    await expect(
+      submitBatch(dependencies, batch({ batch_sequence: 1.5 })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 400,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'batch_sequence' }),
+        ]),
+      }),
+    });
+    expectNothingMaterialized(dependencies);
+  });
+
+  it('dado batch_sequence menor que 1 então 400 TEAT.VALIDATION_FAILED (o DTO e o check ck_ops_sync_batch_sequence_positive exigem ≥ 1)', async () => {
+    const dependencies = deps();
+    await expect(
+      submitBatch(dependencies, batch({ batch_sequence: 0 })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 400,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'batch_sequence' }),
+        ]),
+      }),
+    });
+    expectNothingMaterialized(dependencies);
+  });
+
+  it('dado device_batch_id ausente então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando device_batch_id, e nada materializado', async () => {
+    const dependencies = deps();
+    const input = batch();
+    delete input.device_batch_id;
+    await expect(submitBatch(dependencies, input)).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 400,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'device_batch_id' }),
+        ]),
+      }),
+    });
+    expectNothingMaterialized(dependencies);
+  });
+});
diff --git a/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts b/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
index 1e92cb7..3eddbd2 100644
--- a/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
+++ b/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
@@ -99,6 +99,15 @@ function submitBatch(
   );
 }

+/**
+ * `batch_sequence` é monotônica por `(tenant, device)`: o passo 4 da §4.1 exige
+ * `last + 1` e o índice único `ux_sync_batch_tenant_id_device_id_batch_sequence`
+ * (DDL 18) proíbe repetir. Um contador por arquivo entrega a próxima sequência
+ * a cada lote; os casos que testam replay ou gap passam `batch_sequence`
+ * explicitamente no `overrides`.
+ */
+let nextSequence = 1;
+
 function batchInput(
   overrides: Record<string, unknown> = {},
 ): Record<string, unknown> {
@@ -108,7 +117,7 @@ function batchInput(
     device_id: field.deviceId,
     agent_id: field.agentId,
     device_batch_id: `batch-${randomUUID().slice(0, 8)}`,
-    batch_sequence: 1,
+    batch_sequence: nextSequence++,
     items: [
       {
         entity_type: 'ait',
@@ -145,14 +154,54 @@ afterAll(async () => {
   await client.end();
 });

+/**
+ * Reserva `reserved` do device+turno cobrindo o número 2026000001, criada no
+ * arranjo porque `ops.numbering_consumption.reservation_id` é **not null** com
+ * FK (`fk_ops_numbering_consumption_reservation`, DDL 18): sem ela o applier
+ * não tem onde ancorar a linha `aplicado` da §4.6.
+ */
+async function seedReservation(): Promise<string> {
+  const id = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $2, $3, $4, $5, $6, $7, $8, 2026000001, 2026000001,
+             '2026-12-31T23:59:59-04:00', 'reserved')`,
+    [
+      id,
+      tenantId,
+      field.rangeId,
+      field.agencyId,
+      field.agentId,
+      field.deviceId,
+      field.shiftId,
+      `sync-batch-${id.slice(0, 8)}`,
+    ],
+  );
+  return id;
+}
+
 describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…29)', () => {
   it('C-0002-27 — dado um item aplicado então na mesma transação existem o AIT em RECEBIDO, a linha numbering_consumption aplicado, o recibo applied e os envelopes na integration.outbox', async () => {
+    const reservationId = await seedReservation();
     const deps = commandDeps(client, tenantId, actorId, {
       appliers: [
         {
           entityType: 'ait',
           validate: () => null,
-          apply: async (item: { id: string }, tx: unknown) => {
+          apply: async (
+            item: {
+              id: string;
+              localEntityId: string;
+              idempotencyKey: string;
+            },
+            tx: unknown,
+          ) => {
             const serverEntityId = randomUUID();
             await (
               tx as {
@@ -182,7 +231,31 @@ describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…
                 FIXTURES.catalogId,
               ],
             );
-            void item;
+            // §4.6: o applier grava o consumo do número na **mesma**
+            // transação do item; sem esta linha o dublê não representaria o
+            // efeito que C-0002-27 verifica.
+            await (
+              tx as {
+                query(
+                  sql: string,
+                  values: readonly unknown[],
+                ): Promise<unknown>;
+              }
+            ).query(
+              `insert into ops.numbering_consumption
+                 (tenant_id, reservation_id, range_id, number, local_entity_id,
+                  idempotency_key, server_entity_id, finalized_at, status)
+               values ($1, $2, $3, 2026000001, $4, $5, $6,
+                       '2026-09-14T13:05:00-04:00', 'aplicado')`,
+              [
+                tenantId,
+                reservationId,
+                field.rangeId,
+                item.localEntityId,
+                item.idempotencyKey,
+                serverEntityId,
+              ],
+            );
             return { serverEntityId };
           },
         },
@@ -305,10 +378,7 @@ describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…
     expect((first.receipts as { status: string }[])[0]?.status).toBe(
       'received',
     );
-    const second = await submitBatch(
-      deps,
-      batchInput({ batch_sequence: 2, items: [item] }),
-    );
+    const second = await submitBatch(deps, batchInput({ items: [item] }));
     expect((second.receipts as { status: string }[])[0]?.status).toBe(
       'received',
     );
@@ -375,3 +445,350 @@ describe('CTG-0002 §5.13 — leituras de recibo e recuperação de ACK perdido
     });
   });
 });
+
+/**
+ * CTG-0002 §4.1 e §4.3 (R-0008, TASK-0004 iteração 3) — achados 1, 2 e 3 da
+ * delivery-review do CTG-0002.
+ *
+ * Achado 1 (§4.3 passo 4): a transação **do item** contém o efeito de domínio,
+ * `sync_queue_item.status`/`server_entity_id`, `sync_receipt.status` e os
+ * eventos. Se qualquer um desses passos falhar, **nada** persiste — inclusive o
+ * efeito de domínio já gravado pelo applier.
+ * Achado 2 (§4.1 passos 9–10): `ops.sync_batch` é persistido **antes** dos
+ * envelopes, e todo envelope de item leva `data.batchId` = id persistido.
+ * Achado 3 (§4.1 passo 4): sem lote anterior, `last = 0`.
+ */
+
+/** Reserva `reserved` do device+turno cobrindo um número específico. */
+async function seedReservationFor(
+  deviceId: string,
+  number: number,
+): Promise<string> {
+  const id = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9,
+             '2026-12-31T23:59:59-04:00', 'reserved')`,
+    [
+      id,
+      tenantId,
+      field.rangeId,
+      field.agencyId,
+      field.agentId,
+      deviceId,
+      field.shiftId,
+      `atomicity-${id.slice(0, 8)}`,
+      number,
+    ],
+  );
+  return id;
+}
+
+/**
+ * Applier-dublê que grava o efeito de domínio completo da §4.6 (AIT em
+ * `RECEBIDO` + `numbering_consumption('aplicado')`) na transação recebida.
+ */
+function domainApplier(number: number, reservationId: string) {
+  /**
+   * Conta as invocações de `apply`: sem isso o caso negativo passaria
+   * vacuamente se o protocolo sequer chegasse a aplicar o item — a asserção
+   * "nada persiste" só prova algo depois que o efeito de domínio foi escrito.
+   */
+  const calls = { apply: 0 };
+  return {
+    calls,
+    entityType: 'ait',
+    validate: () => null,
+    apply: async (
+      item: { localEntityId: string; idempotencyKey: string },
+      tx: unknown,
+    ) => {
+      calls.apply += 1;
+      const serverEntityId = randomUUID();
+      const query = (
+        tx as {
+          query(sql: string, values: readonly unknown[]): Promise<unknown>;
+        }
+      ).query.bind(tx);
+      await query(
+        `insert into inf.ait_ait
+           (id, tenant_id, traffic_agency_id, ait_number, series, agent_id,
+            shift_id, device_id, framing_id, catalog_id, infraction_at,
+            issued_at, issuance_mode, constatation_type, had_approach,
+            location_description, uf, current_status, content_hash)
+         values ($1, $2, $3, $4, 'F', $5, $6, $7, $8, $9,
+                 '2026-09-14T13:00:00-04:00', '2026-09-14T13:05:00-04:00',
+                 'eletronico', 'abordagem', true, 'Av. Djalma Batista',
+                 'AM', 'RECEBIDO', 'sha256:atomicity')`,
+        [
+          serverEntityId,
+          tenantId,
+          field.agencyId,
+          String(number),
+          field.agentId,
+          field.shiftId,
+          field.deviceId,
+          FIXTURES.framingId,
+          FIXTURES.catalogId,
+        ],
+      );
+      await query(
+        `insert into ops.numbering_consumption
+           (tenant_id, reservation_id, range_id, number, local_entity_id,
+            idempotency_key, server_entity_id, finalized_at, status)
+         values ($1, $2, $3, $4, $5, $6, $7, '2026-09-14T13:05:00-04:00',
+                 'aplicado')`,
+        [
+          tenantId,
+          reservationId,
+          field.rangeId,
+          number,
+          item.localEntityId,
+          item.idempotencyKey,
+          serverEntityId,
+        ],
+      );
+      return { serverEntityId };
+    },
+  };
+}
+
+async function freshDevice(): Promise<string> {
+  const id = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.ops_operational_device
+       (id, tenant_id, traffic_agency_id, hardware_identifier_hash, os_name,
+        status, app_version, tamper_flag)
+     values ($1, $2, $3, $4, 'android', 'authorized', '1.0.0', false)`,
+    [id, tenantId, field.agencyId, `sha256:fresh-${id.slice(0, 8)}`],
+  );
+  return id;
+}
+
+describe('CTG-0002 §4.3 passo 4 — a transação do item é uma só (achado 1)', () => {
+  it('dado um item cujo efeito de domínio é gravado e cujo passo seguinte da mesma transação falha então nada persiste: nem o AIT, nem o consumo, nem sync_queue_item/sync_receipt applied', async () => {
+    const number = 2026000101;
+    const reservationId = await seedReservationFor(field.deviceId, number);
+    const applier = domainApplier(number, reservationId);
+    /**
+     * O recibo `received` é criado **antes** do `apply` (§4.8: o item carrega
+     * `receiptId` de uma linha já existente), então a falha precisa vir do
+     * passo que a §4.3 passo 4 põe **dentro** da mesma transação: a promoção de
+     * `sync_queue_item`/`sync_receipt` a `applied`. O dublê deixa o applier
+     * gravar o efeito e quebra na primeira dessas escritas. Se elas estiverem
+     * na transação do item, o efeito de domínio some junto; se estiverem numa
+     * transação posterior (o defeito), o AIT sobrevive e este caso acusa.
+     */
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [applier],
+    });
+    for (const store of ['items', 'receipts'] as const) {
+      const target = deps.repositories[store];
+      const original = target.update.bind(target);
+      target.update = async (
+        id: string,
+        patch: Record<string, unknown>,
+      ): Promise<Record<string, unknown> | undefined> => {
+        if (applier.calls.apply > 0 && patch.status === 'applied')
+          throw new Error(
+            `falha injetada na promoção de ${store} a applied, dentro da transação do item`,
+          );
+        return original(id, patch);
+      };
+    }
+    const idempotencyKey = `atomic-${randomUUID().slice(0, 8)}`;
+    const input = batchInput();
+    (input.items as Record<string, unknown>[])[0]!.idempotency_key =
+      idempotencyKey;
+    const aitBefore = await countRows('inf.ait_ait', 'tenant_id = $1', [
+      tenantId,
+    ]);
+    const consumptionBefore = await countRows(
+      'ops.numbering_consumption',
+      'tenant_id = $1',
+      [tenantId],
+    );
+    // O protocolo pode propagar o erro ou devolver o lote com o item não
+    // aplicado — o que a §4.3 fixa é que **nada** do efeito de domínio sobrevive.
+    const outcome = await submitBatch(deps, input).then(
+      (response) => ({ kind: 'resolved' as const, response }),
+      (error: unknown) => ({ kind: 'rejected' as const, error }),
+    );
+    expect(
+      applier.calls.apply,
+      'o applier precisa ter gravado o efeito de domínio antes da falha; sem isso o caso não prova atomicidade',
+    ).toBeGreaterThan(0);
+    expect(
+      await countRows('inf.ait_ait', 'tenant_id = $1 and ait_number = $2', [
+        tenantId,
+        String(number),
+      ]),
+      `o AIT do item não pode sobreviver à falha do passo seguinte (resultado: ${outcome.kind})`,
+    ).toBe(0);
+    expect(await countRows('inf.ait_ait', 'tenant_id = $1', [tenantId])).toBe(
+      aitBefore,
+    );
+    expect(
+      await countRows('ops.numbering_consumption', 'tenant_id = $1', [
+        tenantId,
+      ]),
+    ).toBe(consumptionBefore);
+    expect(
+      await countRows(
+        'ops.sync_queue_item',
+        'tenant_id = $1 and idempotency_key = $2 and status = $3',
+        [tenantId, idempotencyKey, 'applied'],
+      ),
+    ).toBe(0);
+    expect(
+      await countRows(
+        'ops.sync_receipt',
+        'tenant_id = $1 and idempotency_key = $2 and status = $3',
+        [tenantId, idempotencyKey, 'applied'],
+      ),
+    ).toBe(0);
+  });
+
+  it('dado o mesmo item com a gravação do recibo livre então item, recibo e efeito de domínio são commitados juntos e coerentes (server_entity_id igual nos três)', async () => {
+    const number = 2026000102;
+    const reservationId = await seedReservationFor(field.deviceId, number);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [domainApplier(number, reservationId)],
+    });
+    const input = batchInput();
+    const idempotencyKey = (input.items as { idempotency_key: string }[])[0]!
+      .idempotency_key;
+    const response = await submitBatch(deps, input);
+    expect((response.receipts as { status: string }[])[0]?.status).toBe(
+      'applied',
+    );
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const item = await client.query<{
+      status: string;
+      server_entity_id: string;
+    }>(
+      `select status, server_entity_id from ops.sync_queue_item
+        where tenant_id = $1 and idempotency_key = $2`,
+      [tenantId, idempotencyKey],
+    );
+    const receipt = await client.query<{
+      status: string;
+      server_entity_id: string;
+      applied_at: string | null;
+    }>(
+      `select status, server_entity_id, applied_at from ops.sync_receipt
+        where tenant_id = $1 and idempotency_key = $2`,
+      [tenantId, idempotencyKey],
+    );
+    expect(item.rows[0]?.status).toBe('applied');
+    expect(receipt.rows[0]?.status).toBe('applied');
+    expect(receipt.rows[0]?.applied_at).not.toBeNull();
+    expect(receipt.rows[0]?.server_entity_id).toBe(
+      item.rows[0]?.server_entity_id,
+    );
+    const ait = await client.query<{ current_status: string }>(
+      'select current_status from inf.ait_ait where id = $1',
+      [item.rows[0]?.server_entity_id],
+    );
+    expect(ait.rows[0]?.current_status).toBe('RECEBIDO');
+    const consumption = await client.query<{ status: string }>(
+      `select status from ops.numbering_consumption
+        where tenant_id = $1 and reservation_id = $2`,
+      [tenantId, reservationId],
+    );
+    expect(consumption.rows[0]?.status).toBe('aplicado');
+  });
+});
+
+describe('CTG-0002 §4.1 passos 9–10 — o lote é persistido antes dos envelopes (achado 2)', () => {
+  it('dado um lote aplicado então todo envelope sync.batch.received do lote leva data.batchId = ops.sync_batch.id (nunca null) e é gravado depois da linha do lote', async () => {
+    const number = 2026000103;
+    const reservationId = await seedReservationFor(field.deviceId, number);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [domainApplier(number, reservationId)],
+    });
+    const deviceBatchId = `order-${randomUUID().slice(0, 8)}`;
+    const response = await submitBatch(
+      deps,
+      batchInput({ device_batch_id: deviceBatchId }),
+    );
+    const batchId = response.batchId as string;
+    expect(batchId).toEqual(expect.any(String));
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const persisted = await client.query<{
+      id: string;
+      submitted_at: string;
+    }>(
+      `select id, submitted_at from ops.sync_batch
+        where tenant_id = $1 and device_batch_id = $2`,
+      [tenantId, deviceBatchId],
+    );
+    expect(persisted.rows[0]?.id).toBe(batchId);
+    const envelopes = await client.query<{
+      batch_id: string | null;
+      created_at: string;
+      topic: string;
+    }>(
+      `select payload->'data'->>'batchId' as batch_id, created_at, topic
+         from integration.outbox
+        where tenant_id = $1 and payload->'data'->>'deviceBatchId' = $2
+        order by created_at, id`,
+      [tenantId, deviceBatchId],
+    );
+    expect(envelopes.rows.length).toBeGreaterThan(0);
+    for (const envelope of envelopes.rows) {
+      expect(
+        envelope.batch_id,
+        `envelope ${envelope.topic} saiu com data.batchId nulo: o lote precisa ser persistido antes dos eventos (§4.1 passos 9–10)`,
+      ).toBe(batchId);
+      expect(new Date(envelope.created_at).getTime()).toBeGreaterThanOrEqual(
+        new Date(persisted.rows[0]!.submitted_at).getTime(),
+      );
+    }
+  });
+});
+
+describe('CTG-0002 §4.1 passo 4 — primeiro lote sequenciado do device (achado 3)', () => {
+  it('dado um device sem lote anterior quando chega batch_sequence = 2 então 422 TEAT.SYNC_BATCH_SEQUENCE_GAP com expectedSequence 1 e received 2, e nenhum sync_batch é gravado; em seguida batch_sequence = 1 é aceito', async () => {
+    const deviceId = await freshDevice();
+    const number = 2026000104;
+    const reservationId = await seedReservationFor(deviceId, number);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [domainApplier(number, reservationId)],
+    });
+    await expect(
+      submitBatch(deps, batchInput({ device_id: deviceId, batch_sequence: 2 })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
+      status: 422,
+      context: expect.objectContaining({ expectedSequence: 1, received: 2 }),
+    });
+    expect(
+      await countRows('ops.sync_batch', 'tenant_id = $1 and device_id = $2', [
+        tenantId,
+        deviceId,
+      ]),
+    ).toBe(0);
+    const accepted = await submitBatch(
+      deps,
+      batchInput({ device_id: deviceId, batch_sequence: 1 }),
+    );
+    expect(accepted.batch_sequence).toBe(1);
+    expect(
+      await countRows('ops.sync_batch', 'tenant_id = $1 and device_id = $2', [
+        tenantId,
+        deviceId,
+      ]),
+    ).toBe(1);
+  });
+});
diff --git a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts b/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
index 4a12db7..a5104c7 100644
--- a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
+++ b/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
@@ -3,7 +3,7 @@ import { Action, Audit, Resource } from '@detran/shared';

 import { FrozenSnapshotService } from './frozen-snapshot.service.js';

-@Controller('ops/snapshots')
+@Controller('v1/ops/snapshots')
 export class FrozenSnapshotController {
   constructor(private readonly service: FrozenSnapshotService) {}
   @Get('people') @Resource('ops:snapshot-person') @Action('read') people() {
diff --git a/work/rounds/R-0008/tasks/TASK-0005.json b/work/rounds/R-0008/tasks/TASK-0005.json
index 2704436..5b4c00f 100644
--- a/work/rounds/R-0008/tasks/TASK-0005.json
+++ b/work/rounds/R-0008/tasks/TASK-0005.json
@@ -14,7 +14,9 @@
     "MOD-ops-core",
     "MOD-inf-ait-sync",
     "MOD-shared-policy",
-    "MOD-app-wiring"
+    "MOD-app-wiring",
+    "MOD-ops-evidence-controller-prefix",
+    "MOD-ops-snapshots-controller-prefix"
   ],
   "target_substrates": ["F2"],
   "target_invariants": [],
@@ -22,7 +24,7 @@
   "coupled_pipeline_position": "engineer",
   "upstream_task_id": "TASK-0004",
   "db_isolation": "database",
-  "iteration_count": 0,
+  "iteration_count": 2,
   "max_iterations": 2,
   "priority": 5,
   "tags": ["wp-t2"],

```
