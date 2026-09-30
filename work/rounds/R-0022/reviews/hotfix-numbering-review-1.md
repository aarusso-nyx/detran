# Delivery-review — hotfix de corridas de numeração e turno offline (fora da R-0022)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-adc1a23de1909fe73` (branch
> `fix/offline-numbering-shift-races`, base `origin/main`). Responda **apenas** com o JSON.

Política B9 do Owner. Defeitos corrigidos: (1) dois turnos `open` para o mesmo agente → índice único
parcial `(tenant_id, agent_id) where status = 'open'` no blueprint BP-OPS-FIELD-001 (DDL 13 regenerada;
demais gerados de `ops/field` só mudam o hash do cabeçalho) + `on conflict … do nothing` com o 409
`TEAT.SHIFT_ALREADY_OPEN` existente; (2) reservas duplicadas por turno → trava da linha do turno antes
da faixa (mesma ordem do fechamento); (3) número aplicado reemitido depois de settle/fechamento →
`for update` da reserva no `AitSyncApplier`; (5) lost update do reconcile → `for update` da reserva +
`where status <> 'aplicado'` no upsert. Parado: (4) gate de motivo do fechamento (sem estado inválido
reproduzível; decisão de protocolo). Prova: 7 casos com duas conexões `role_app_backend`, banco clone,
commit real (5 vermelhos antes, 7 verdes depois). Resultados: unit/integration de `ops-offline-sync`,
`ops-field`, `ops-core`, `inf-ait` applier, e2e do app (teat-field-sync, boat, r21-offline), `rls-smoke`,
`verify:rls-ddl`, `verify:decorators`, `contracts:check`, `blueprints:check`, `typecheck`, `format:check`.
Riscos declarados pelo worker: as rotas CRUD genéricas de turno (`POST v1/ops/field/shifts`, gerada e
`FieldOperationsController`) passam a dar 500 em duplicidade (23505 sem mapeamento global); `apply.sh`
falha se houver turnos abertos duplicados num ambiente existente; a trava do turno depende de o
`shift_id` existir (o comando não o valida); índice de reserva não entrou (fixtures existentes semeiam
duas reservas ativas por turno, estado proibido pela §5.10).

Rubrica: (1) cada invariante agora vale e a ordem de travas não cria ciclo; (2) contrato público
inalterado — avalie o 500 nas rotas CRUD de turno (regressão de contrato? mapear 23505 para o 409?);
(3) DDL por blueprint, sem edição à mão; risco de migração de dados; (4) provas determinísticas e no CI
(o spec está em `backend/app/tests/integration`, no `backend:test:integration`); (5) item 4 parado com
justificativa.

## Diff (sem os gerados de hash)

```diff
diff --git a/backend/app/tests/integration/offline-numbering-shift-races.integration.spec.ts b/backend/app/tests/integration/offline-numbering-shift-races.integration.spec.ts
new file mode 100644
index 00000000..346ca780
--- /dev/null
+++ b/backend/app/tests/integration/offline-numbering-shift-races.integration.spec.ts
@@ -0,0 +1,774 @@
+// Hotfix fix/offline-numbering-shift-races (política B9 do Owner, R-0022): corridas "checa e
+// depois grava" em READ COMMITTED nos comandos de turno e numeração offline do TEAT.
+//
+// Cada prova usa duas conexões `role_app_backend` no mesmo tenant e os comandos de produção
+// (`OpenShiftCommand`, `CloseShiftCommand`, `ReserveNumberingCommand`, `SettleNumberingCommand`,
+// `ReconcileNumberingCommand`, `SubmitBatchCommand` e o `AitSyncApplier`). A intercalação é
+// determinística e usa commit real: T1 conclui o comando e fica aberta; T2 começa e só então, com
+// T2 comprovadamente parada à espera de lock (pg_stat_activity) ou já concluída, T1 é confirmada.
+//
+// A corrida só aparece com commit real; por isso as provas rodam num clone descartável do banco
+// do slot (CREATE DATABASE … TEMPLATE), removido ao final, sem deixar resíduo no banco
+// compartilhado. O clone recebe a DDL canônica da árvore (`backend/database/apply.sh`,
+// reaplicação idempotente), de modo que a prova mede a DDL que será entregue, não a do slot.
+// As fixtures (tenant isolado, agente, dispositivos, turno, faixa) são as do harness de
+// `@detran/ops-offline-sync`, gravadas pelo papel owner só no preparo.
+import { randomUUID } from 'node:crypto';
+import { spawnSync } from 'node:child_process';
+import { fileURLToPath } from 'node:url';
+
+import { AitSyncApplier } from '@detran/inf-ait';
+import { CloseShiftCommand, OpenShiftCommand } from '@detran/ops-field';
+import {
+  ReconcileNumberingCommand,
+  ReserveNumberingCommand,
+  SettleNumberingCommand,
+  SubmitBatchCommand,
+  canonicalHash,
+} from '@detran/ops-offline-sync';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
+
+import {
+  isolatedTenant,
+  repositories,
+  database as autocommitDatabase,
+  seedField,
+} from '../../../domains/ops/offline-sync/tests/integration/harness.js';
+
+const { Client } = pg;
+
+function requiredUrl(name: string): string {
+  const value = process.env[name];
+  if (!value) throw new Error(`${name} is required for the race proofs`);
+  return value;
+}
+
+const SOURCE_URL = requiredUrl('STYNX_OWNER_DATABASE_URL');
+const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
+const CLONE_DATABASE = `${EXPECTED_DATABASE}_ops_race_${process.pid}`;
+const APPLY_SCRIPT = fileURLToPath(
+  new URL('../../../database/apply.sh', import.meta.url),
+);
+const APP_VERSION = '1.0.0';
+const NOW = '2026-09-14T18:00:00.000Z';
+const CREATED_LOCALLY_AT = '2026-09-14T13:05:00.000Z';
+const VALID_UNTIL = '2026-12-31T23:59:59.000Z';
+// Enquadramento e catálogo canônicos (10-fixtures-inf-ait.sql), como no teste do applier.
+const FRAMING_ID = '00000000-0000-7000-8000-0000e1000001';
+const CATALOG_ID = '00000000-0000-7000-8000-0000e0000001';
+
+type PgClient = InstanceType<typeof Client>;
+type Tx = {
+  query: (
+    sql: string,
+    values?: readonly unknown[],
+  ) => Promise<{ rows: Record<string, unknown>[] }>;
+};
+type Deferred = { promise: Promise<void>; resolve: () => void };
+type Outcome<T> =
+  { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };
+type Field = Awaited<ReturnType<typeof seedField>>;
+
+function deferred(): Deferred {
+  let resolve!: () => void;
+  const promise = new Promise<void>((done) => {
+    resolve = done;
+  });
+  return { promise, resolve };
+}
+
+function urlFor(database: string): string {
+  const url = new URL(SOURCE_URL);
+  url.pathname = `/${database}`;
+  return url.toString();
+}
+
+async function connect(database: string): Promise<PgClient> {
+  const client = new Client({ connectionString: urlFor(database) });
+  await client.connect();
+  return client;
+}
+
+let admin: PgClient;
+let observer: PgClient;
+let seeder: PgClient;
+let first: PgClient;
+let second: PgClient;
+
+/**
+ * `Database` do STYNX sobre uma conexão dedicada: transação, `role_app_backend` e contexto do
+ * tenant; `beforeCommit` segura a transação aberta depois do trabalho concluído.
+ */
+function heldDatabase(
+  client: PgClient,
+  tenantId: string,
+  actorId: string,
+  beforeCommit: () => Promise<void> = async () => undefined,
+) {
+  return {
+    async tx<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
+      await client.query('begin');
+      try {
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          tenantId,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        const result = await work({
+          query: (sql, values) =>
+            client.query(sql, values as unknown[] | undefined),
+        });
+        await beforeCommit();
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
+function commandDeps(
+  client: PgClient,
+  tenantId: string,
+  actorId: string,
+  beforeCommit?: () => Promise<void>,
+) {
+  const database = heldDatabase(client, tenantId, actorId, beforeCommit);
+  return {
+    database,
+    requestContext: {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId, actorId }),
+    },
+    repositories: {},
+    appliers: [],
+    parameters: {
+      get: vi.fn(async (key: string) => ({
+        key,
+        value_json: null,
+        source_pending: true,
+      })),
+    },
+    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
+    clock: { now: () => NOW },
+  };
+}
+
+function settle<T>(promise: Promise<T>): Promise<Outcome<T>> {
+  return promise.then(
+    (value) => ({ status: 'fulfilled' as const, value }),
+    (reason: unknown) => ({ status: 'rejected' as const, reason }),
+  );
+}
+
+async function backendPid(client: PgClient): Promise<number> {
+  const result = await client.query<{ pid: number }>(
+    'select pg_backend_pid() as pid',
+  );
+  return result.rows[0]!.pid;
+}
+
+// Condição observável, não tempo: espera T2 parar à espera de lock ou terminar.
+async function untilWaitingOrSettled(
+  pid: number,
+  settled: () => boolean,
+): Promise<'waiting' | 'settled'> {
+  for (let attempt = 0; attempt < 500; attempt += 1) {
+    if (settled()) return 'settled';
+    const state = await observer.query<{ wait_event_type: string | null }>(
+      'select wait_event_type from pg_stat_activity where pid = $1',
+      [pid],
+    );
+    if (state.rows[0]?.wait_event_type === 'Lock') return 'waiting';
+    await new Promise((done) => setTimeout(done, 20));
+  }
+  throw new Error('T2 não chegou a esperar lock nem terminou');
+}
+
+/**
+ * Intercalação determinística: `t1(hold)` recebe o gancho que segura a transação aberta depois
+ * do trabalho; `t2()` roda depois, sem gancho. Devolve os dois desfechos e se T2 terminou antes
+ * de T1 ser confirmada.
+ */
+async function interleave<A, B>(
+  t1: (hold: () => Promise<void>) => Promise<A>,
+  t2: () => Promise<B>,
+): Promise<{
+  firstOutcome: Outcome<A>;
+  secondOutcome: Outcome<B>;
+  secondBeforeFirstCommit: 'waiting' | 'settled';
+}> {
+  const firstDone = deferred();
+  const firstCommit = deferred();
+  const secondPid = await backendPid(second);
+  const firstResult = settle(
+    t1(async () => {
+      firstDone.resolve();
+      await firstCommit.promise;
+    }),
+  );
+  await Promise.race([firstDone.promise, firstResult]);
+  let secondSettled = false;
+  const secondResult = settle(t2()).finally(() => {
+    secondSettled = true;
+  });
+  const secondBeforeFirstCommit = await untilWaitingOrSettled(
+    secondPid,
+    () => secondSettled,
+  );
+  firstCommit.resolve();
+  const [firstOutcome, secondOutcome] = await Promise.all([
+    firstResult,
+    secondResult,
+  ]);
+  return { firstOutcome, secondOutcome, secondBeforeFirstCommit };
+}
+
+async function ownerScope(tenantId: string): Promise<void> {
+  await seeder.query(`select set_config('app.role', 'owner', false)`);
+  await seeder.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+}
+
+/** Tenant isolado com as fixtures de campo do harness de offline-sync. */
+async function seedTenant(
+  slug: string,
+  options: Parameters<typeof seedField>[3] = {},
+): Promise<{ tenantId: string; actorId: string; field: Field }> {
+  // O tenant anterior fica fixado na sessão do seeder; o novo nasce sem contexto (owner).
+  await seeder.query(`select set_config('app.tenant_id', '', false)`);
+  const { tenantId, actorId } = await isolatedTenant(seeder, slug);
+  const field = await seedField(seeder, tenantId, actorId, options);
+  return { tenantId, actorId, field };
+}
+
+/** Prontidão de abertura de turno (mesmas linhas de shift-lifecycle.integration.spec.ts). */
+async function seedShiftReadiness(tenantId: string, field: Field) {
+  await ownerScope(tenantId);
+  const homologationId = randomUUID();
+  await seeder.query(
+    `insert into ops.ops_homologation
+       (id, tenant_id, traffic_agency_id, homologation_number, scope, issued_at,
+        valid_until, status, laudo_emitido_em, laudo_valido_ate)
+     values ($1, $2, $3, 'HOM-2025-0001', 'Talão eletrônico', '2025-12-01',
+             '2029-12-31', 'active', '2025-12-01', '2029-12-31')`,
+    [homologationId, tenantId, field.agencyId],
+  );
+  await seeder.query(
+    `insert into ops.ops_application_version
+       (id, tenant_id, app_type, version, status, homologation_id, valid_from)
+     values ($1, $2, 'mobile', $3, 'active', $4, '2026-01-01')`,
+    [randomUUID(), tenantId, APP_VERSION, homologationId],
+  );
+  await seeder.query(
+    `insert into inf.normative_mobile_package
+       (id, tenant_id, traffic_agency_id, catalog_id, package_version,
+        manifest_hash, package_uri, published_at, valid_until, status)
+     values ($1, $2, $3, $4, '2026.1', 'sha256:isolated-package',
+             'https://fixtures.invalid/teat/2026.1',
+             '2026-09-14T10:00:00-04:00', '2026-12-31', 'published')`,
+    [randomUUID(), tenantId, field.agencyId, CATALOG_ID],
+  );
+}
+
+/** Reserva `reserved` do turno cobrindo `[start, end]`; a faixa aponta para `end + 1`. */
+async function seedReservation(
+  tenantId: string,
+  field: Field,
+  start: number,
+  end: number,
+): Promise<string> {
+  await ownerScope(tenantId);
+  const reservationId = randomUUID();
+  await seeder.query(
+    `update ops.ait_numbering_range set next_number = $2 where id = $1`,
+    [field.rangeId, end + 1],
+  );
+  await seeder.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'reserved')`,
+    [
+      reservationId,
+      tenantId,
+      field.rangeId,
+      field.agencyId,
+      field.agentId,
+      field.deviceId,
+      field.shiftId,
+      `race-${reservationId.slice(0, 8)}`,
+      start,
+      end,
+      VALID_UNTIL,
+    ],
+  );
+  return reservationId;
+}
+
+/** Item `ait` na fila, com recibo `received`, que o applier consome (CTG-0002 §4.8). */
+async function seedAitItem(
+  tenantId: string,
+  field: Field,
+  aitNumber: number,
+): Promise<Record<string, unknown>> {
+  await ownerScope(tenantId);
+  const payload = {
+    ait: {
+      traffic_agency_id: field.agencyId,
+      ait_number: String(aitNumber),
+      series: 'F',
+      agent_id: field.agentId,
+      shift_id: field.shiftId,
+      device_id: field.deviceId,
+      framing_id: FRAMING_ID,
+      catalog_id: CATALOG_ID,
+      infraction_at: '2026-09-14T13:00:00.000Z',
+      issued_at: CREATED_LOCALLY_AT,
+      issuance_mode: 'eletronico',
+      constatation_type: 'abordagem',
+      had_approach: true,
+      location_description: 'Av. Djalma Batista, 1000 — Manaus/AM',
+      uf: 'AM',
+      municipality_code: '1302603',
+      content_hash: 'sha256:race-proof',
+    },
+    vehicles: [],
+    people: [],
+    signatures: [],
+    print_events: [],
+  };
+  const id = randomUUID();
+  const localEntityId = randomUUID();
+  const idempotencyKey = `race-item-${id.slice(0, 8)}`;
+  const payloadHash = canonicalHash(payload);
+  await seeder.query(
+    `insert into ops.sync_queue_item
+       (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
+        local_entity_id, status, created_locally_at, idempotency_key,
+        payload_hash, payload_json)
+     values ($1, $2, $3, $4, $5, 'ait', $6, 'pending', $7, $8, $9, $10)`,
+    [
+      id,
+      tenantId,
+      field.agencyId,
+      field.deviceId,
+      field.agentId,
+      localEntityId,
+      CREATED_LOCALLY_AT,
+      idempotencyKey,
+      payloadHash,
+      JSON.stringify(payload),
+    ],
+  );
+  const receiptId = randomUUID();
+  await seeder.query(
+    `insert into ops.sync_receipt
+       (id, tenant_id, sync_queue_item_id, idempotency_key, entity_type,
+        local_entity_id, accepted_hash, status)
+     values ($1, $2, $3, $4, 'ait', $5, $6, 'received')`,
+    [receiptId, tenantId, id, idempotencyKey, localEntityId, payloadHash],
+  );
+  return {
+    id,
+    tenantId,
+    trafficAgencyId: field.agencyId,
+    deviceId: field.deviceId,
+    agentId: field.agentId,
+    entityType: 'ait',
+    localEntityId,
+    idempotencyKey,
+    payloadHash,
+    createdLocallyAt: CREATED_LOCALLY_AT,
+    concurrencySuspect: false,
+    receiptId,
+  };
+}
+
+/** O applier de produção dentro de uma transação `role_app_backend` da conexão dada. */
+function applyAit(
+  client: PgClient,
+  tenantId: string,
+  actorId: string,
+  item: Record<string, unknown>,
+  beforeCommit?: () => Promise<void>,
+) {
+  const applier = new AitSyncApplier({
+    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
+    clock: { now: () => NOW },
+  });
+  return heldDatabase(client, tenantId, actorId, beforeCommit).tx((tx) =>
+    applier.apply(item as never, tx as never),
+  );
+}
+
+/**
+ * Invariante de numeração ([WF-TEAT-002], [RN-TEAT-113]): número `aplicado` nunca volta a ser
+ * alocável — fica abaixo de `next_number` da faixa (ou a faixa está esgotada) — e reserva com
+ * consumo aplicado nunca termina `cancelled`.
+ */
+async function numberingViolations(tenantId: string): Promise<{
+  reissuable: string[];
+  cancelledWithApplied: string[];
+}> {
+  await ownerScope(tenantId);
+  const reissuable = await seeder.query<{ number: string }>(
+    `select c.number::text as number
+       from ops.numbering_consumption c
+       join ops.ait_numbering_range r on r.id = c.range_id
+      where c.tenant_id = $1 and c.status = 'aplicado'
+        and r.status = 'active' and c.number >= r.next_number`,
+    [tenantId],
+  );
+  const cancelled = await seeder.query<{ id: string }>(
+    `select distinct n.id
+       from ops.numbering_reservation n
+       join ops.numbering_consumption c on c.reservation_id = n.id
+      where n.tenant_id = $1 and n.status = 'cancelled'
+        and c.status = 'aplicado'`,
+    [tenantId],
+  );
+  return {
+    reissuable: reissuable.rows.map((row) => row.number),
+    cancelledWithApplied: cancelled.rows.map((row) => row.id),
+  };
+}
+
+describe('hotfix — corridas de turno e numeração offline sob concorrência (READ COMMITTED)', () => {
+  beforeAll(async () => {
+    expect(new URL(SOURCE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
+    admin = await connect('postgres');
+    await admin.query(`drop database if exists ${CLONE_DATABASE} with (force)`);
+    await admin.query(
+      `create database ${CLONE_DATABASE} template ${EXPECTED_DATABASE}`,
+    );
+    const source = new URL(SOURCE_URL);
+    const applied = spawnSync('bash', [APPLY_SCRIPT], {
+      env: {
+        ...process.env,
+        DB_NAME: CLONE_DATABASE,
+        DB_HOST: source.hostname,
+        DB_PORT: source.port || '5432',
+        DB_USER: decodeURIComponent(source.username),
+        DB_PASSWORD: decodeURIComponent(source.password),
+      },
+      encoding: 'utf8',
+    });
+    if (applied.status !== 0)
+      throw new Error(
+        `apply.sh falhou no clone: ${applied.stderr || applied.stdout}`,
+      );
+    observer = await connect(CLONE_DATABASE);
+    seeder = await connect(CLONE_DATABASE);
+    first = await connect(CLONE_DATABASE);
+    second = await connect(CLONE_DATABASE);
+  }, 180_000);
+
+  afterAll(async () => {
+    await Promise.allSettled([
+      first?.end(),
+      second?.end(),
+      seeder?.end(),
+      observer?.end(),
+    ]);
+    await admin?.query(
+      `drop database if exists ${CLONE_DATABASE} with (force)`,
+    );
+    await admin?.end();
+  });
+
+  it('defeito 1 — dado um agente sem turno aberto quando ele abre turno em dois dispositivos ao mesmo tempo então só um turno fica open e o outro pedido recebe 409 TEAT.SHIFT_ALREADY_OPEN', async () => {
+    const { tenantId, actorId, field } = await seedTenant('race-open-shift');
+    await seedShiftReadiness(tenantId, field);
+    await ownerScope(tenantId);
+    await seeder.query(
+      `update ops.ops_shift set status = 'closed', ended_at = started_at where id = $1`,
+      [field.shiftId],
+    );
+    const body = (deviceId: string) => ({
+      device_id: deviceId,
+      app_version: APP_VERSION,
+      operational_unit_id: field.unitId,
+      started_at: NOW,
+    });
+
+    const { firstOutcome, secondOutcome } = await interleave(
+      (hold) =>
+        new OpenShiftCommand(
+          commandDeps(first, tenantId, actorId, hold) as never,
+        ).execute(body(field.deviceId)),
+      () =>
+        new OpenShiftCommand(
+          commandDeps(second, tenantId, actorId) as never,
+        ).execute(body(field.otherDeviceId)),
+    );
+
+    const outcomes = [firstOutcome, secondOutcome];
+    expect(outcomes.filter((o) => o.status === 'fulfilled')).toHaveLength(1);
+    const refused = outcomes.flatMap((o) =>
+      o.status === 'rejected' ? [o.reason] : [],
+    );
+    expect(refused).toHaveLength(1);
+    expect(refused[0]).toMatchObject({
+      code: 'TEAT.SHIFT_ALREADY_OPEN',
+      status: 409,
+    });
+    await ownerScope(tenantId);
+    const open = await seeder.query<{ count: number }>(
+      `select count(*)::integer as count from ops.ops_shift
+        where tenant_id = $1 and agent_id = $2 and status = 'open'`,
+      [tenantId, field.agentId],
+    );
+    expect(open.rows[0]!.count).toBe(1);
+  });
+
+  it('defeito 2 — dado um dispositivo e turno sem reserva quando duas reservas são pedidas ao mesmo tempo em faixas diferentes então só uma fica reserved e a outra recebe 409 TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS', async () => {
+    const { tenantId, actorId, field } = await seedTenant('race-reserve');
+    await ownerScope(tenantId);
+    const otherRangeId = randomUUID();
+    await seeder.query(
+      `insert into ops.ait_numbering_range
+         (id, tenant_id, traffic_agency_id, series, start_number, end_number,
+          next_number, status, usage_mode)
+       values ($1, $2, $3, 'G', 2027000001, 2027001000, 2027000001, 'active',
+               'source_pending')`,
+      [otherRangeId, tenantId, field.agencyId],
+    );
+    const body = (rangeId: string, key: string) => ({
+      traffic_agency_id: field.agencyId,
+      agent_id: field.agentId,
+      device_id: field.deviceId,
+      shift_id: field.shiftId,
+      idempotency_key: key,
+      range_id: rangeId,
+      requested_size: 10,
+      valid_until: VALID_UNTIL,
+    });
+
+    const { firstOutcome, secondOutcome } = await interleave(
+      (hold) =>
+        new ReserveNumberingCommand(
+          commandDeps(first, tenantId, actorId, hold) as never,
+        ).execute(body(field.rangeId, 'race-reserve-first')),
+      () =>
+        new ReserveNumberingCommand(
+          commandDeps(second, tenantId, actorId) as never,
+        ).execute(body(otherRangeId, 'race-reserve-second')),
+    );
+
+    const outcomes = [firstOutcome, secondOutcome];
+    expect(outcomes.filter((o) => o.status === 'fulfilled')).toHaveLength(1);
+    const refused = outcomes.flatMap((o) =>
+      o.status === 'rejected' ? [o.reason] : [],
+    );
+    expect(refused).toHaveLength(1);
+    expect(refused[0]).toMatchObject({
+      code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
+      status: 409,
+    });
+    await ownerScope(tenantId);
+    const active = await seeder.query<{ count: number }>(
+      `select count(*)::integer as count from ops.numbering_reservation
+        where tenant_id = $1 and device_id = $2 and shift_id = $3
+          and status = 'reserved'`,
+      [tenantId, field.deviceId, field.shiftId],
+    );
+    expect(active.rows[0]!.count).toBe(1);
+    const untouched = await seeder.query<{ next_number: string }>(
+      `select next_number::text as next_number from ops.ait_numbering_range
+        where id = any($1::uuid[]) and next_number <> start_number`,
+      [[field.rangeId, otherRangeId]],
+    );
+    expect(untouched.rows).toHaveLength(1);
+  });
+
+  it('defeito 3 (settle) — dado uma reserva que é a cauda da faixa quando ela é cancelada enquanto o applier aplica um AIT com número dela então o número aplicado nunca volta à faixa', async () => {
+    const start = 2026000001;
+    const { tenantId, actorId, field } = await seedTenant('race-settle');
+    const reservationId = await seedReservation(
+      tenantId,
+      field,
+      start,
+      start + 2,
+    );
+    const item = await seedAitItem(tenantId, field, start);
+
+    const { firstOutcome, secondOutcome } = await interleave(
+      (hold) =>
+        new SettleNumberingCommand(
+          commandDeps(first, tenantId, actorId, hold) as never,
+        ).cancel(reservationId, { reason: 'prova de corrida' }),
+      () => applyAit(second, tenantId, actorId, item),
+    );
+
+    expect(firstOutcome.status).toBe('fulfilled');
+    if (secondOutcome.status === 'rejected')
+      expect(secondOutcome.reason).toMatchObject({
+        code: 'TEAT.NUMBERING_RESERVATION_EXPIRED',
+      });
+    expect(await numberingViolations(tenantId)).toEqual({
+      reissuable: [],
+      cancelledWithApplied: [],
+    });
+  });
+
+  it('defeito 3 (fechamento de turno) — dado um AIT sendo aplicado com número de uma reserva do turno quando o turno é fechado antes do commit do applier então a reserva não é cancelada nem a cauda devolvida com o número aplicado', async () => {
+    const start = 2026000001;
+    const { tenantId, actorId, field } = await seedTenant('race-close');
+    await seedReservation(tenantId, field, start, start + 2);
+    const item = await seedAitItem(tenantId, field, start);
+
+    const { firstOutcome, secondOutcome } = await interleave(
+      (hold) => applyAit(first, tenantId, actorId, item, hold),
+      () =>
+        new CloseShiftCommand(
+          commandDeps(second, tenantId, actorId) as never,
+        ).execute(field.shiftId, { ended_at: NOW }),
+    );
+
+    expect(firstOutcome.status).toBe('fulfilled');
+    expect(secondOutcome.status).toBe('fulfilled');
+    expect(await numberingViolations(tenantId)).toEqual({
+      reissuable: [],
+      cancelledWithApplied: [],
+    });
+  });
+
+  it('defeito 3 (fechamento de turno, fechamento primeiro) — dado um fechamento de turno em curso que cancela a reserva sem consumo quando o applier aplica um AIT com número dela antes do commit do fechamento então o número aplicado nunca volta à faixa', async () => {
+    const start = 2026000001;
+    const { tenantId, actorId, field } = await seedTenant('race-close-first');
+    await seedReservation(tenantId, field, start, start + 2);
+    const item = await seedAitItem(tenantId, field, start);
+
+    const { firstOutcome, secondOutcome } = await interleave(
+      (hold) =>
+        new CloseShiftCommand(
+          commandDeps(first, tenantId, actorId, hold) as never,
+        ).execute(field.shiftId, { ended_at: NOW }),
+      () => applyAit(second, tenantId, actorId, item),
+    );
+
+    expect(firstOutcome.status).toBe('fulfilled');
+    if (secondOutcome.status === 'rejected')
+      expect(secondOutcome.reason).toMatchObject({
+        code: 'TEAT.NUMBERING_RESERVATION_EXPIRED',
+      });
+    expect(await numberingViolations(tenantId)).toEqual({
+      reissuable: [],
+      cancelledWithApplied: [],
+    });
+  });
+
+  it('defeito 5 — dado um AIT sendo aplicado com número de uma reserva quando a reserva é reconciliada antes do commit do applier então o consumo aplicado não é sobrescrito e a resposta o reporta como aplicado', async () => {
+    const start = 2026000001;
+    const { tenantId, actorId, field } = await seedTenant('race-reconcile');
+    const reservationId = await seedReservation(
+      tenantId,
+      field,
+      start,
+      start + 2,
+    );
+    const item = await seedAitItem(tenantId, field, start);
+
+    const { firstOutcome, secondOutcome } = await interleave(
+      (hold) => applyAit(first, tenantId, actorId, item, hold),
+      () =>
+        new ReconcileNumberingCommand(
+          commandDeps(second, tenantId, actorId) as never,
+        ).execute(reservationId, { claimed_numbers: [] }),
+    );
+
+    expect(firstOutcome.status).toBe('fulfilled');
+    expect(secondOutcome.status).toBe('fulfilled');
+    await ownerScope(tenantId);
+    const persisted = await seeder.query<{
+      status: string;
+      server_entity_id: string | null;
+    }>(
+      `select status, server_entity_id from ops.numbering_consumption
+        where tenant_id = $1 and range_id = $2 and number = $3`,
+      [tenantId, field.rangeId, start],
+    );
+    expect(persisted.rows).toEqual([
+      {
+        status: 'aplicado',
+        server_entity_id:
+          firstOutcome.status === 'fulfilled'
+            ? firstOutcome.value.serverEntityId
+            : null,
+      },
+    ]);
+    const reported =
+      secondOutcome.status === 'fulfilled'
+        ? secondOutcome.value.consumption.find((row) => row.number === start)
+        : undefined;
+    expect(reported?.status).toBe('aplicado');
+  });
+
+  // Defeito 4 não se reduz a um estado inválido: `submit-batch` grava o item `received` em
+  // instruções autônomas (a porta de repositório abre transação por instrução) e o fechamento
+  // decide só pela contagem. Qualquer intercalação equivale à ordem serial "fecha, depois chega
+  // o item" — que o protocolo admite (itens do turno sincronizam depois do fechamento). Esta
+  // caracterização fixa o que precisa valer sempre: o desfecho é o de alguma ordem serial.
+  it('defeito 4 (caracterização) — dado um fechamento sem motivo em curso quando o dispositivo envia um item legado do turno então o desfecho equivale a uma ordem serial (fechamento recusado por pendência ou item posterior ao fechamento)', async () => {
+    const { tenantId, actorId, field } = await seedTenant('race-pending');
+    const localEntityId = randomUUID();
+    const batch = {
+      traffic_agency_id: field.agencyId,
+      agent_id: field.agentId,
+      device_id: field.deviceId,
+      device_batch_id: `race-pending-${localEntityId.slice(0, 8)}`,
+      items: [
+        {
+          entity_type: 'ait',
+          local_entity_id: localEntityId,
+          payload_hash: 'sha256:legacy-race',
+          created_locally_at: CREATED_LOCALLY_AT,
+        },
+      ],
+    };
+    const submitDeps = () => {
+      const deps = commandDeps(second, tenantId, actorId);
+      const autocommit = autocommitDatabase(second as never, tenantId, actorId);
+      return {
+        ...deps,
+        database: autocommit,
+        repositories: repositories(autocommit),
+      };
+    };
+
+    const { firstOutcome, secondOutcome } = await interleave(
+      (hold) =>
+        new CloseShiftCommand(
+          commandDeps(first, tenantId, actorId, hold) as never,
+        ).execute(field.shiftId, { ended_at: NOW }),
+      () => new SubmitBatchCommand(submitDeps() as never).execute(batch),
+    );
+
+    expect(secondOutcome.status).toBe('fulfilled');
+    if (firstOutcome.status === 'rejected') {
+      expect(firstOutcome.reason).toMatchObject({
+        code: 'TEAT.SHIFT_CLOSE_PENDING_QUEUE',
+      });
+      return;
+    }
+    await ownerScope(tenantId);
+    const shift = await seeder.query<{ status: string }>(
+      `select status from ops.ops_shift where id = $1`,
+      [field.shiftId],
+    );
+    expect(shift.rows[0]!.status).toBe('closed');
+    const item = await seeder.query<{ status: string }>(
+      `select status from ops.sync_queue_item
+        where tenant_id = $1 and local_entity_id = $2`,
+      [tenantId, localEntityId],
+    );
+    expect(item.rows.map((row) => row.status)).toEqual(['received']);
+  });
+});
diff --git a/backend/database/ddl/13-ops-field-operations.sql b/backend/database/ddl/13-ops-field-operations.sql
index fb1ee290..c7cb8818 100644
--- a/backend/database/ddl/13-ops-field-operations.sql
+++ b/backend/database/ddl/13-ops-field-operations.sql
@@ -1,4 +1,4 @@
--- Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
+-- Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
 
 -- Regenerable-only DDL for BP-OPS-FIELD-001; request-path writes use role_app_backend.
 
@@ -240,6 +240,7 @@ create table if not exists ops.ops_shift (
 );
 create index if not exists ix_ops_shift_tenant_id_agent_id_started_at on ops.ops_shift (tenant_id, agent_id, started_at);
 create index if not exists ix_ops_shift_tenant_id_status on ops.ops_shift (tenant_id, status);
+create unique index if not exists ux_ops_shift_tenant_id_agent_id_open on ops.ops_shift (tenant_id, agent_id) where status = 'open';
 create index if not exists ix_ops_shift_tenant_id on ops.ops_shift (tenant_id);
 create index if not exists ix_ops_shift_traffic_agency_id on ops.ops_shift (traffic_agency_id);
 create index if not exists ix_ops_shift_agent_id on ops.ops_shift (agent_id);
diff --git a/backend/domains/inf/ait/src/handwritten/sync-applier.ts b/backend/domains/inf/ait/src/handwritten/sync-applier.ts
index 6fdf48d3..1c1974b1 100644
--- a/backend/domains/inf/ait/src/handwritten/sync-applier.ts
+++ b/backend/domains/inf/ait/src/handwritten/sync-applier.ts
@@ -202,7 +202,12 @@ export class AitSyncApplier implements SyncEntityApplier {
     return parsed.data;
   }
 
-  /** §4.6 — guarda de numeração, nesta ordem. */
+  /**
+   * §4.6 — guarda de numeração, nesta ordem. A reserva é lida `for update`:
+   * cancelar, bloquear, fechar, reconciliar e liquidar no fechamento de turno
+   * também a travam, então a guarda e o consumo `aplicado` gravado adiante
+   * nunca se intercalam com a liquidação que devolve a cauda à faixa.
+   */
   private async guardNumbering(
     queryable: SqlQueryable,
     item: SyncEntityApplierItem,
@@ -215,7 +220,8 @@ export class AitSyncApplier implements SyncEntityApplier {
         where tenant_id = $1 and device_id = $2
           and $3::bigint between start_number and end_number
         order by reserved_at desc
-        limit 1`,
+        limit 1
+        for update`,
       [item.tenantId, item.deviceId, number],
     );
     const reservation = found.rows[0];
diff --git a/backend/domains/ops/field/src/handwritten/open-shift.command.ts b/backend/domains/ops/field/src/handwritten/open-shift.command.ts
index 0cd60386..3bf87328 100644
--- a/backend/domains/ops/field/src/handwritten/open-shift.command.ts
+++ b/backend/domains/ops/field/src/handwritten/open-shift.command.ts
@@ -10,6 +10,7 @@ import {
   tenantScope,
   todayOf,
   type FieldDeps,
+  type SqlScope,
 } from './field-runtime.js';
 import { MOBILE_BOOTSTRAP_PROTOCOL_VERSION } from './mobile-bootstrap.service.js';
 import {
@@ -33,6 +34,28 @@ export interface OpenShiftInput {
   accuracy_m?: number;
 }
 
+async function assertNoOpenShift(
+  scope: SqlScope,
+  tenantId: string,
+  agentId: string,
+): Promise<void> {
+  const open = await scope.query<{ id: string; device_id: string }>(
+    `select id, device_id from ops.ops_shift
+      where tenant_id = $1 and agent_id = $2 and status = 'open'
+      limit 1`,
+    [tenantId, agentId],
+  );
+  if (open.rows[0])
+    throw new DetranError('TEAT.SHIFT_ALREADY_OPEN', {
+      status: 409,
+      context: {
+        shiftId: open.rows[0].id,
+        deviceId: open.rows[0].device_id,
+      },
+      message: 'Já existe turno aberto para o agente.',
+    });
+}
+
 export class OpenShiftCommand {
   constructor(private readonly deps: FieldDeps) {}
 
@@ -55,21 +78,7 @@ export class OpenShiftCommand {
       const agent = await loadAgent(scope, tenantId, actorId);
       const device = await loadDevice(scope, tenantId, deviceId);
       const agencyId = String(device.traffic_agency_id);
-      const open = await scope.query<{ id: string; device_id: string }>(
-        `select id, device_id from ops.ops_shift
-          where tenant_id = $1 and agent_id = $2 and status = 'open'
-          limit 1`,
-        [tenantId, agent ? agent.id : actorId],
-      );
-      if (open.rows[0])
-        throw new DetranError('TEAT.SHIFT_ALREADY_OPEN', {
-          status: 409,
-          context: {
-            shiftId: open.rows[0].id,
-            deviceId: open.rows[0].device_id,
-          },
-          message: 'Já existe turno aberto para o agente.',
-        });
+      await assertNoOpenShift(scope, tenantId, agent ? agent.id : actorId);
       await assertShiftReadiness(scope, device, agent, {
         tenantId,
         agencyId,
@@ -87,12 +96,17 @@ export class OpenShiftCommand {
               longitude: input.longitude ?? null,
               accuracy_m: input.accuracy_m ?? null,
             };
+      // Um turno `open` por agente é garantido pelo índice único parcial
+      // `ux_ops_shift_tenant_id_agent_id_open` (DDL 13): a abertura concorrente
+      // espera a outra transação e, se ela confirmou, não insere nada e cai na
+      // mesma recusa de negócio.
       const inserted = await scope.query<Record<string, unknown>>(
         `insert into ops.ops_shift
            (traffic_agency_id, agent_id, device_id, operational_unit_id, team_id,
             patrol_vehicle_id, operation_id, started_at, start_location_json,
             status, offline_periods_count)
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open', 0)
+         on conflict (tenant_id, agent_id) where status = 'open' do nothing
          returning *`,
         [
           agencyId,
@@ -106,7 +120,11 @@ export class OpenShiftCommand {
           location ? JSON.stringify(location) : null,
         ],
       );
-      const shift = inserted.rows[0]!;
+      const shift = inserted.rows[0];
+      if (!shift) {
+        await assertNoOpenShift(scope, tenantId, String(agent!.id));
+        throw new Error('Open shift conflict without a visible open shift');
+      }
       await scope.query(
         `insert into ops.ops_device_event
            (device_id, agent_id, event_type, event_at, details_json)
diff --git a/backend/domains/ops/offline-sync/src/handwritten/reconcile-numbering.command.ts b/backend/domains/ops/offline-sync/src/handwritten/reconcile-numbering.command.ts
index d3b5309b..4cdfc8a6 100644
--- a/backend/domains/ops/offline-sync/src/handwritten/reconcile-numbering.command.ts
+++ b/backend/domains/ops/offline-sync/src/handwritten/reconcile-numbering.command.ts
@@ -63,7 +63,7 @@ export class ReconcileNumberingCommand {
   ): Promise<ReconcileNumberingResponse> {
     const { tenantId } = tenantScope(this.deps);
     return inTransaction(this.deps, async (scope) => {
-      const reservation = await this.load(scope, tenantId, id);
+      const reservation = await this.load(scope, tenantId, id, true);
       if (!['reserved', 'consumed'].includes(reservation.status))
         throw validationFailed([{ path: 'status', rule: 'transition' }]);
       const start = bigintOf(reservation.start_number);
@@ -106,7 +106,8 @@ export class ReconcileNumberingCommand {
            values ($1, $2, $3, $4, now())
            on conflict (tenant_id, range_id, number)
            do update set status = excluded.status, reconciled_at = now(),
-                         updated_at = now()`,
+                         updated_at = now()
+             where ops.numbering_consumption.status <> 'aplicado'`,
           [reservation.id, reservation.range_id, number, status],
         );
         consumption.push({
@@ -175,13 +176,22 @@ export class ReconcileNumberingCommand {
     });
   }
 
+  /**
+   * `lock` trava a reserva (`for update`) na reconciliação: o applier `ait`
+   * também a trava antes de gravar o consumo `aplicado`, então a leitura dos
+   * aplicados só acontece depois de um ato concorrente confirmado ou desfeito.
+   */
   private async load(
     scope: SqlScope,
     tenantId: string,
     id: string,
+    lock = false,
   ): Promise<ReservationRow> {
     const result = await scope.query<ReservationRow>(
-      `select * from ops.numbering_reservation where tenant_id = $1 and id = $2`,
+      lock
+        ? `select * from ops.numbering_reservation
+            where tenant_id = $1 and id = $2 for update`
+        : `select * from ops.numbering_reservation where tenant_id = $1 and id = $2`,
       [tenantId, id],
     );
     const row = result.rows[0];
diff --git a/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts b/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts
index 6797ae98..f5d32943 100644
--- a/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts
+++ b/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts
@@ -101,6 +101,16 @@ export class ReserveNumberingCommand {
         return view(existing);
       }
 
+      // Serializa as reservas do turno: a linha do turno é travada antes da
+      // faixa (a mesma ordem do fechamento de turno, que trava o turno e
+      // depois reserva e faixa), então duas reservas do mesmo turno em faixas
+      // diferentes não passam juntas pela checagem abaixo, e nenhuma nasce
+      // no meio da liquidação do fechamento.
+      await query(
+        `select id from ops.ops_shift
+          where tenant_id = $1 and id = $2 for no key update`,
+        [tenantId, input.shift_id ?? null],
+      );
       const range = await this.lockRange(query, tenantId, input);
       const active = await query<{ id: string }>(
         `select id from ops.numbering_reservation
diff --git a/docs/framework/blueprints/BP-OPS-FIELD-001.json b/docs/framework/blueprints/BP-OPS-FIELD-001.json
index 3c968145..db02c281 100644
--- a/docs/framework/blueprints/BP-OPS-FIELD-001.json
+++ b/docs/framework/blueprints/BP-OPS-FIELD-001.json
@@ -922,6 +922,12 @@
           },
           {
             "columns": ["tenant_id", "status"]
+          },
+          {
+            "name": "ux_ops_shift_tenant_id_agent_id_open",
+            "columns": ["tenant_id", "agent_id"],
+            "unique": true,
+            "where": "status = 'open'"
           }
         ],
         "foreignKeys": [
```

```json
{"mode":"delivery-review","scope":"hotfix-offline-numbering-shift-races","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"…","line":1,"claim":"…","fix":"…"}],"notes":["…"]}
```
