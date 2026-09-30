# Delivery-review — hotfix de numeração e turno offline, ciclo 2 (restrito)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-adc1a23de1909fe73`. Responda
> **apenas** com o JSON.

Avalie só a correção dos 4 achados `high` do ciclo 1
(`/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9/work/rounds/R-0022/reviews/hotfix-numbering-review-1.json`)
e o texto novo (`git diff 5a227619..HEAD`):
1. interceptor manuscrito global `backend/app/src/unique-violation.interceptor.ts` que traduz só os dois
   índices de "linha ativa" para os 409 existentes (`TEAT.SHIFT_ALREADY_OPEN`,
   `TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS`) em todas as rotas, com e2e das rotas CRUD;
2. `reserve-numbering` exige turno do tenant, `open` e do agente, travado; sem linha → 409
   `TEAT.SHIFT_NOT_OPEN` (código existente). Desvio declarado: não exige que o dispositivo seja o do
   turno (§5.10 não pede; handoff troca o dispositivo);
3. índice único parcial de reserva ativa por (tenant, dispositivo, turno) no blueprint, DDL 18
   regenerada; fixtures que semeavam o estado proibido (sync-batch, applier AIT e, fora da lista pedida,
   harness e amendment4 do provisioning) corrigidas pelo Inspector;
4. ponto de extensão `precheck: true` no gerador: bloco `do $$` antes do índice que lista duplicatas e
   falha com mensagem explícita, procedimento em `backend/database/ddl/README.md`; prova em clone com
   duplicatas.
Resultados informados: provas 12/12; unit/integration dos pacotes (inclui provisioning 694); e2e 51 + 20;
`rls-smoke`, `verify:rls-ddl`, `verify:decorators`, `typecheck`, `format:check`, `contracts:check`,
`blueprints:check`.

```diff
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index e236b561..a6e3173b 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -198,6 +198,7 @@ import { PecUserAdminService } from './pec-user-admin.service.js';
 import { PecCognitoAdminController } from './pec-cognito-admin.controller.js';
 import { PecCognitoAdminService } from './pec-cognito-admin.service.js';
 import { DetranErrorFilterModule } from './detran-error.filter.js';
+import { UniqueViolationInterceptorModule } from './unique-violation.interceptor.js';
 import { DetranPolicyErrorGuard } from './detran-policy-error.guard.js';
 import { RaitTransactionalAuditInterceptor } from './rait-transactional-audit.interceptor.js';
 
@@ -877,6 +878,7 @@ export class AppModule {
         OfflineSyncModule,
         ProvisioningModule,
         DetranErrorFilterModule,
+        UniqueViolationInterceptorModule,
         // Speed meters stay behind the `teat.speed_meters` flag (steering H.54:
         // the agency does not operate meters today).
         ...(detranFeatureFlagSet().flags['teat.speed_meters']?.default === true
diff --git a/backend/app/src/unique-violation.interceptor.ts b/backend/app/src/unique-violation.interceptor.ts
new file mode 100644
index 00000000..204ecf30
--- /dev/null
+++ b/backend/app/src/unique-violation.interceptor.ts
@@ -0,0 +1,207 @@
+// Hotfix fix/offline-numbering-shift-races — tradução das violações dos índices únicos parciais
+// de "uma linha ativa" de `ops` para a recusa de negócio do catálogo TEAT.
+//
+// Os comandos (`open-shift`, `reserve-numbering`) já devolvem o código próprio; as rotas CRUD
+// geradas e `FieldOperationsController` gravam direto pela porta de repositório e, sem esta
+// tradução, a violação `23505` chegava ao cliente como 500. O mapa é fechado: só os índices
+// listados são traduzidos, e qualquer outro erro segue intocado para os filtros do app.
+import type {
+  CallHandler,
+  ExecutionContext,
+  NestInterceptor,
+} from '@nestjs/common';
+import { Injectable, Module } from '@nestjs/common';
+import { ApplicationConfig } from '@nestjs/core';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { catchError, from, type Observable } from 'rxjs';
+
+import { DetranError, withTenantContext } from '@detran/shared';
+
+type Query = (
+  sql: string,
+  values: readonly unknown[],
+) => Promise<{ rows: Record<string, unknown>[] }>;
+
+/** O que a requisição recusada gravaria: corpo e, no `PATCH`, o `:id` da linha. */
+export interface RejectedWrite {
+  body: Record<string, unknown>;
+  id: string | null;
+}
+
+interface UniqueRule {
+  code: string;
+  message: string;
+  /** Contexto do catálogo, lido na linha ativa que já ocupa a chave. */
+  context(query: Query, write: RejectedWrite): Promise<Record<string, unknown>>;
+}
+
+const text = (value: unknown): string | null =>
+  typeof value === 'string' && value ? value : null;
+
+/**
+ * A chave da linha recusada. Com RLS ativa na tabela o Postgres omite os
+ * valores da chave no `DETAIL` da violação, então ela vem do corpo e, para o
+ * que o corpo não traz (`PATCH`), da linha atual do `:id`.
+ */
+async function keyOf(
+  query: Query,
+  table: 'ops.ops_shift' | 'ops.numbering_reservation',
+  columns: readonly string[],
+  write: RejectedWrite,
+): Promise<Record<string, string | null>> {
+  const current = write.id
+    ? (
+        await query(
+          `select ${columns.join(', ')} from ${table} where id = $1`,
+          [write.id],
+        )
+      ).rows[0]
+    : undefined;
+  return Object.fromEntries(
+    columns.map((column) => [
+      column,
+      text(write.body[column]) ?? text(current?.[column]),
+    ]),
+  );
+}
+
+/** Índice → recusa de negócio (teat-error-catalog.md). */
+export const ACTIVE_UNIQUE_RULES: Readonly<Record<string, UniqueRule>> = {
+  ux_ops_shift_tenant_id_agent_id_open: {
+    code: 'TEAT.SHIFT_ALREADY_OPEN',
+    message: 'Já existe turno aberto para o agente.',
+    async context(query, write) {
+      const key = await keyOf(query, 'ops.ops_shift', ['agent_id'], write);
+      const open = await query(
+        `select id, device_id from ops.ops_shift
+          where agent_id = $1 and status = 'open' limit 1`,
+        [key.agent_id],
+      );
+      const row = open.rows[0];
+      return {
+        shiftId: row ? String(row.id) : null,
+        deviceId: row ? String(row.device_id) : null,
+      };
+    },
+  },
+  ux_numbering_reservation_tenant_id_device_id_shift_id_reserved: {
+    code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
+    message: 'Já existe reserva vigente para o dispositivo e turno.',
+    async context(query, write) {
+      const key = await keyOf(
+        query,
+        'ops.numbering_reservation',
+        ['device_id', 'shift_id'],
+        write,
+      );
+      const active = await query(
+        `select id from ops.numbering_reservation
+          where device_id = $1 and shift_id = $2 and status = 'reserved'
+          limit 1`,
+        [key.device_id, key.shift_id],
+      );
+      const row = active.rows[0];
+      return { reservationId: row ? String(row.id) : null };
+    },
+  },
+};
+
+interface PgUniqueViolation {
+  code: '23505';
+  constraint: string;
+}
+
+/** A violação do Postgres, direta ou na cadeia de `cause` de um invólucro. */
+export function uniqueViolationOf(
+  error: unknown,
+): PgUniqueViolation | undefined {
+  let current: unknown = error;
+  for (let depth = 0; depth < 5 && current; depth += 1) {
+    const candidate = current as Partial<PgUniqueViolation> & {
+      cause?: unknown;
+    };
+    if (candidate.code === '23505' && typeof candidate.constraint === 'string')
+      return candidate as PgUniqueViolation;
+    current = candidate.cause;
+  }
+  return undefined;
+}
+
+function rejectedWrite(context: ExecutionContext): RejectedWrite {
+  if (context.getType() !== 'http') return { body: {}, id: null };
+  const request = context.switchToHttp().getRequest<{
+    body?: unknown;
+    params?: Record<string, string | undefined>;
+  }>();
+  const body =
+    request.body && typeof request.body === 'object'
+      ? (request.body as Record<string, unknown>)
+      : {};
+  return { body, id: request.params?.id ?? null };
+}
+
+@Injectable()
+export class UniqueViolationInterceptor implements NestInterceptor {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
+    return next
+      .handle()
+      .pipe(
+        catchError((error: unknown) =>
+          from(this.translate(error, rejectedWrite(context))),
+        ),
+      );
+  }
+
+  private async translate(
+    error: unknown,
+    write: RejectedWrite,
+  ): Promise<never> {
+    const violation = uniqueViolationOf(error);
+    const rule = violation ? ACTIVE_UNIQUE_RULES[violation.constraint] : null;
+    if (!violation || !rule) throw error;
+    const context = await withTenantContext(
+      this.database,
+      this.requestContext,
+      (tx: Transaction) =>
+        rule.context(
+          (sql, values) =>
+            (
+              tx as unknown as {
+                query(
+                  sql: string,
+                  values: readonly unknown[],
+                ): Promise<{ rows: Record<string, unknown>[] }>;
+              }
+            ).query(sql, values),
+          write,
+        ),
+    ).catch(() => ({}));
+    throw new DetranError(rule.code, {
+      status: 409,
+      context,
+      message: rule.message,
+      cause: error,
+    });
+  }
+}
+
+@Injectable()
+class UniqueViolationInterceptorRegistrar {
+  constructor(
+    applicationConfig: ApplicationConfig,
+    interceptor: UniqueViolationInterceptor,
+  ) {
+    applicationConfig.addGlobalInterceptor(interceptor);
+  }
+}
+
+@Module({
+  providers: [UniqueViolationInterceptor, UniqueViolationInterceptorRegistrar],
+})
+export class UniqueViolationInterceptorModule {}
diff --git a/backend/app/tests/e2e/ops-active-uniqueness-routes.e2e.spec.ts b/backend/app/tests/e2e/ops-active-uniqueness-routes.e2e.spec.ts
new file mode 100644
index 00000000..6e9570dd
--- /dev/null
+++ b/backend/app/tests/e2e/ops-active-uniqueness-routes.e2e.spec.ts
@@ -0,0 +1,267 @@
+import { randomUUID } from 'node:crypto';
+import type { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import request from 'supertest';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * Hotfix fix/offline-numbering-shift-races, ciclo 1 da revisão — as rotas CRUD de `ops` que
+ * gravam turno e reserva sem passar pelos comandos (`POST v1/ops/field/shifts`, servida por
+ * `FieldOperationsController`, registrado antes do controlador gerado; `PATCH
+ * v1/ops/field/shifts/:id`, gerada; `POST`/`PATCH v1/ops/offline-sync/numbering-reservations`,
+ * geradas) não podem criar um segundo turno `open` do agente nem uma segunda reserva `reserved`
+ * do mesmo dispositivo e turno (§5.4 e §5.10 do CTG-0002). A recusa é a de negócio do catálogo:
+ * 409 `TEAT.SHIFT_ALREADY_OPEN { shiftId, deviceId }` e 409
+ * `TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS { reservationId }` — nunca 500. O status vai no
+ * HTTP; o corpo é o envelope de erro do app (`code`, `message`, `context`).
+ *
+ * As linhas do caso (agente, dispositivo, turnos, faixa e reservas) são semeadas pelo owner no
+ * tenant canônico com ids novos e removidas no `afterAll`; as requisições recusadas não gravam.
+ */
+
+const { Client } = pg;
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+const previousEnv: Record<string, string | undefined> = {};
+
+const ids = {
+  agent: randomUUID(),
+  device: randomUUID(),
+  shiftOpen: randomUUID(),
+  shiftClosed: randomUUID(),
+  range: randomUUID(),
+  reservationReserved: randomUUID(),
+  reservationCancelled: randomUUID(),
+};
+
+function headers(role: string): Record<string, string> {
+  process.env.DETRAN_LOCAL_ROLES = role;
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    'idempotency-key': randomUUID(),
+  };
+}
+
+async function count(sql: string, values: unknown[]): Promise<number> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const result = await client.query<{ count: number }>(sql, values);
+  return result.rows[0]!.count;
+}
+
+async function cleanup(): Promise<void> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `delete from ops.numbering_reservation where tenant_id = $1 and range_id = $2`,
+    [TENANT_ID, ids.range],
+  );
+  await client.query(`delete from ops.ait_numbering_range where id = $1`, [
+    ids.range,
+  ]);
+  await client.query(
+    `delete from ops.ops_shift where tenant_id = $1 and agent_id = $2`,
+    [TENANT_ID, ids.agent],
+  );
+  await client.query(`delete from ops.ops_operational_device where id = $1`, [
+    ids.device,
+  ]);
+  await client.query(`delete from ops.ops_agent_profile where id = $1`, [
+    ids.agent,
+  ]);
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
+  process.env.DETRAN_LOCAL_ROLES = 'technical-admin';
+
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    TENANT_ID,
+  ]);
+  await client.query(
+    `insert into ops.ops_agent_profile
+       (id, tenant_id, traffic_agency_id, user_ref, registration_number,
+        functional_status, credential_valid_until)
+     values ($1, $2, $3, $4, $5, 'active', '2027-12-31')`,
+    [ids.agent, TENANT_ID, AGENCY_ID, ACTOR_ID, `MAT-${ids.agent.slice(0, 8)}`],
+  );
+  await client.query(
+    `insert into ops.ops_operational_device
+       (id, tenant_id, traffic_agency_id, hardware_identifier_hash, os_name,
+        status, app_version, tamper_flag)
+     values ($1, $2, $3, $4, 'android', 'authorized', '1.0.0', false)`,
+    [ids.device, TENANT_ID, AGENCY_ID, `sha256:uniq-${ids.device}`],
+  );
+  await client.query(
+    `insert into ops.ops_shift
+       (id, tenant_id, traffic_agency_id, agent_id, device_id, started_at,
+        ended_at, status)
+     values ($1, $3, $4, $5, $6, '2026-09-14T08:00:00-04:00', null, 'open'),
+            ($2, $3, $4, $5, $6, '2026-09-13T08:00:00-04:00',
+             '2026-09-13T17:00:00-04:00', 'closed')`,
+    [
+      ids.shiftOpen,
+      ids.shiftClosed,
+      TENANT_ID,
+      AGENCY_ID,
+      ids.agent,
+      ids.device,
+    ],
+  );
+  await client.query(
+    `insert into ops.ait_numbering_range
+       (id, tenant_id, traffic_agency_id, series, start_number, end_number,
+        next_number, status, usage_mode)
+     values ($1, $2, $3, $4, 2029000001, 2029001000, 2029000011, 'active',
+             'source_pending')`,
+    [ids.range, TENANT_ID, AGENCY_ID, `U${ids.range.slice(0, 8)}`],
+  );
+  await client.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $3, $4, $5, $6, $7, $8, $9, 2029000001, 2029000005,
+             '2026-12-31T23:59:59-04:00', 'reserved'),
+            ($2, $3, $4, $5, $6, $7, $8, $10, 2029000006, 2029000010,
+             '2026-12-31T23:59:59-04:00', 'cancelled')`,
+    [
+      ids.reservationReserved,
+      ids.reservationCancelled,
+      TENANT_ID,
+      ids.range,
+      AGENCY_ID,
+      ids.agent,
+      ids.device,
+      ids.shiftOpen,
+      `uniq-reserved-${ids.range.slice(0, 8)}`,
+      `uniq-cancelled-${ids.range.slice(0, 8)}`,
+    ],
+  );
+
+  const { NestFactory: factory } = await import('@nestjs/core');
+  const { AppModule } = await import('../../src/app.module.js');
+  app = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+}, 60_000);
+
+afterAll(async () => {
+  await app?.close();
+  await cleanup();
+  await client.end();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+const openShifts = () =>
+  count(
+    `select count(*)::integer as count from ops.ops_shift
+      where tenant_id = $1 and agent_id = $2 and status = 'open'`,
+    [TENANT_ID, ids.agent],
+  );
+
+const activeReservations = () =>
+  count(
+    `select count(*)::integer as count from ops.numbering_reservation
+      where tenant_id = $1 and device_id = $2 and shift_id = $3
+        and status = 'reserved'`,
+    [TENANT_ID, ids.device, ids.shiftOpen],
+  );
+
+describe('rotas CRUD de ops — unicidade de turno aberto e de reserva ativa', () => {
+  it('dado um agente com turno aberto quando POST /v1/ops/field/shifts cria outro turno open então 409 TEAT.SHIFT_ALREADY_OPEN com shiftId e deviceId do turno aberto e nenhum turno novo', async () => {
+    const response = await request(app.getHttpServer())
+      .post('/v1/ops/field/shifts')
+      .set(headers('technical-admin'))
+      .send({
+        traffic_agency_id: AGENCY_ID,
+        agent_id: ids.agent,
+        device_id: ids.device,
+        started_at: '2026-09-14T09:00:00-04:00',
+        status: 'open',
+      });
+    expect(response.status, JSON.stringify(response.body)).toBe(409);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.SHIFT_ALREADY_OPEN',
+      context: { shiftId: ids.shiftOpen, deviceId: ids.device },
+    });
+    expect(await openShifts()).toBe(1);
+  });
+
+  it('dado um agente com turno aberto quando PATCH /v1/ops/field/shifts/:id reabre um turno fechado dele então 409 TEAT.SHIFT_ALREADY_OPEN e o turno continua closed', async () => {
+    const response = await request(app.getHttpServer())
+      .patch(`/v1/ops/field/shifts/${ids.shiftClosed}`)
+      .set(headers('technical-admin'))
+      .send({ status: 'open' });
+    expect(response.status, JSON.stringify(response.body)).toBe(409);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.SHIFT_ALREADY_OPEN',
+      context: { shiftId: ids.shiftOpen, deviceId: ids.device },
+    });
+    expect(await openShifts()).toBe(1);
+  });
+
+  it('dado uma reserva reserved do dispositivo e turno quando POST /v1/ops/offline-sync/numbering-reservations cria outra reserved então 409 TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS com reservationId e nenhuma reserva nova', async () => {
+    const response = await request(app.getHttpServer())
+      .post('/v1/ops/offline-sync/numbering-reservations')
+      .set(headers('technical-admin'))
+      .send({
+        range_id: ids.range,
+        traffic_agency_id: AGENCY_ID,
+        agent_id: ids.agent,
+        device_id: ids.device,
+        shift_id: ids.shiftOpen,
+        idempotency_key: `uniq-crud-${randomUUID().slice(0, 8)}`,
+        start_number: 2029000011,
+        end_number: 2029000012,
+        valid_until: '2026-12-31T23:59:59-04:00',
+        status: 'reserved',
+      });
+    expect(response.status, JSON.stringify(response.body)).toBe(409);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
+      context: { reservationId: ids.reservationReserved },
+    });
+    expect(await activeReservations()).toBe(1);
+  });
+
+  it('dado uma reserva reserved do dispositivo e turno quando PATCH /v1/ops/offline-sync/numbering-reservations/:id reativa uma reserva cancelada do mesmo turno então 409 TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS e ela continua cancelled', async () => {
+    const response = await request(app.getHttpServer())
+      .patch(
+        `/v1/ops/offline-sync/numbering-reservations/${ids.reservationCancelled}`,
+      )
+      .set(headers('technical-admin'))
+      .send({ status: 'reserved' });
+    expect(response.status, JSON.stringify(response.body)).toBe(409);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
+      context: { reservationId: ids.reservationReserved },
+    });
+    expect(await activeReservations()).toBe(1);
+  });
+});
diff --git a/backend/app/tests/integration/offline-numbering-shift-races.integration.spec.ts b/backend/app/tests/integration/offline-numbering-shift-races.integration.spec.ts
index 346ca780..115d4c81 100644
--- a/backend/app/tests/integration/offline-numbering-shift-races.integration.spec.ts
+++ b/backend/app/tests/integration/offline-numbering-shift-races.integration.spec.ts
@@ -588,6 +588,115 @@ describe('hotfix — corridas de turno e numeração offline sob concorrência (
     expect(untouched.rows).toHaveLength(1);
   });
 
+  // Ciclo 1 da revisão: a serialização da reserva depende de travar a linha do turno; um
+  // `shift_id` sem linha não trava nada. A reserva exige turno do tenant, `open` e do agente
+  // pedido; sem ele, 409 `TEAT.SHIFT_NOT_OPEN` (catálogo TEAT: "ato legal sem turno").
+  it('defeito 2 (turno inexistente) — dado um shift_id sem linha quando duas reservas são pedidas ao mesmo tempo em faixas diferentes então as duas recebem 409 TEAT.SHIFT_NOT_OPEN e nenhuma reserva nasce', async () => {
+    const { tenantId, actorId, field } = await seedTenant('race-no-shift');
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
+    const missingShift = randomUUID();
+    const body = (rangeId: string, key: string) => ({
+      traffic_agency_id: field.agencyId,
+      agent_id: field.agentId,
+      device_id: field.deviceId,
+      shift_id: missingShift,
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
+        ).execute(body(field.rangeId, 'race-no-shift-first')),
+      () =>
+        new ReserveNumberingCommand(
+          commandDeps(second, tenantId, actorId) as never,
+        ).execute(body(otherRangeId, 'race-no-shift-second')),
+    );
+
+    for (const outcome of [firstOutcome, secondOutcome]) {
+      expect(outcome.status).toBe('rejected');
+      if (outcome.status === 'rejected')
+        expect(outcome.reason).toMatchObject({
+          code: 'TEAT.SHIFT_NOT_OPEN',
+          status: 409,
+        });
+    }
+    await ownerScope(tenantId);
+    const created = await seeder.query<{ count: number }>(
+      `select count(*)::integer as count from ops.numbering_reservation
+        where tenant_id = $1 and shift_id = $2`,
+      [tenantId, missingShift],
+    );
+    expect(created.rows[0]!.count).toBe(0);
+    const moved = await seeder.query<{ count: number }>(
+      `select count(*)::integer as count from ops.ait_numbering_range
+        where id = any($1::uuid[]) and next_number <> start_number`,
+      [[field.rangeId, otherRangeId]],
+    );
+    expect(moved.rows[0]!.count).toBe(0);
+  });
+
+  it('defeito 2 (turno fora da regra) — dado um turno fechado ou de outro agente quando a reserva é pedida para ele então 409 TEAT.SHIFT_NOT_OPEN e nenhuma reserva nasce', async () => {
+    const { tenantId, actorId, field } = await seedTenant('reserve-bad-shift');
+    await ownerScope(tenantId);
+    const closedShift = randomUUID();
+    await seeder.query(
+      `insert into ops.ops_shift
+         (id, tenant_id, traffic_agency_id, agent_id, device_id,
+          operational_unit_id, started_at, ended_at, status)
+       values ($1, $2, $3, $4, $5, $6, '2026-09-13T08:00:00-04:00',
+               '2026-09-13T17:00:00-04:00', 'closed')`,
+      [
+        closedShift,
+        tenantId,
+        field.agencyId,
+        field.agentId,
+        field.deviceId,
+        field.unitId,
+      ],
+    );
+    const command = new ReserveNumberingCommand(
+      commandDeps(first, tenantId, actorId) as never,
+    );
+    const body = (shiftId: string, agentId: string) => ({
+      traffic_agency_id: field.agencyId,
+      agent_id: agentId,
+      device_id: field.deviceId,
+      shift_id: shiftId,
+      idempotency_key: `bad-shift-${randomUUID().slice(0, 8)}`,
+      range_id: field.rangeId,
+      requested_size: 1,
+      valid_until: VALID_UNTIL,
+    });
+
+    await expect(
+      command.execute(body(closedShift, field.agentId)),
+    ).rejects.toMatchObject({ code: 'TEAT.SHIFT_NOT_OPEN', status: 409 });
+    await expect(
+      command.execute(body(field.shiftId, randomUUID())),
+    ).rejects.toMatchObject({ code: 'TEAT.SHIFT_NOT_OPEN', status: 409 });
+    await ownerScope(tenantId);
+    const created = await seeder.query<{ count: number }>(
+      `select count(*)::integer as count from ops.numbering_reservation
+        where tenant_id = $1`,
+      [tenantId],
+    );
+    expect(created.rows[0]!.count).toBe(0);
+  });
+
   it('defeito 3 (settle) — dado uma reserva que é a cauda da faixa quando ela é cancelada enquanto o applier aplica um AIT com número dela então o número aplicado nunca volta à faixa', async () => {
     const start = 2026000001;
     const { tenantId, actorId, field } = await seedTenant('race-settle');
diff --git a/backend/app/tests/integration/offline-unique-index-precheck.integration.spec.ts b/backend/app/tests/integration/offline-unique-index-precheck.integration.spec.ts
new file mode 100644
index 00000000..74df8b2d
--- /dev/null
+++ b/backend/app/tests/integration/offline-unique-index-precheck.integration.spec.ts
@@ -0,0 +1,200 @@
+// Hotfix fix/offline-numbering-shift-races, ciclo 1 da revisão — pré-checagem dos índices únicos
+// parciais `ux_ops_shift_tenant_id_agent_id_open` (DDL 13) e
+// `ux_numbering_reservation_tenant_id_device_id_shift_id_reserved` (DDL 18).
+//
+// Um banco que já tenha duplicatas (dois turnos `open` do mesmo agente, duas reservas `reserved`
+// do mesmo dispositivo e turno) não pode receber o índice. A DDL detecta, falha com mensagem
+// explícita — índice, tenant e agente (ou dispositivo e turno) e o procedimento em
+// `backend/database/ddl/README.md` — e não decide qual linha fechar: isso é da operação.
+//
+// A prova roda num clone descartável do banco do slot, de onde os dois índices são retirados
+// para simular um banco anterior ao hotfix; as duplicatas são gravadas pelo owner e a DDL
+// canônica da árvore é aplicada por `backend/database/apply.sh`. O clone é removido ao final.
+import { randomUUID } from 'node:crypto';
+import { spawnSync } from 'node:child_process';
+import { fileURLToPath } from 'node:url';
+
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  isolatedTenant,
+  seedField,
+} from '../../../domains/ops/offline-sync/tests/integration/harness.js';
+
+const { Client } = pg;
+
+function requiredUrl(name: string): string {
+  const value = process.env[name];
+  if (!value) throw new Error(`${name} is required for the precheck proof`);
+  return value;
+}
+
+const SOURCE_URL = requiredUrl('STYNX_OWNER_DATABASE_URL');
+const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
+const CLONE_DATABASE = `${EXPECTED_DATABASE}_ux_precheck_${process.pid}`;
+const APPLY_SCRIPT = fileURLToPath(
+  new URL('../../../database/apply.sh', import.meta.url),
+);
+const SHIFT_INDEX = 'ux_ops_shift_tenant_id_agent_id_open';
+const RESERVATION_INDEX =
+  'ux_numbering_reservation_tenant_id_device_id_shift_id_reserved';
+const PROCEDURE = 'backend/database/ddl/README.md';
+
+type PgClient = InstanceType<typeof Client>;
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
+function applyDdl(): { status: number | null; output: string } {
+  const source = new URL(SOURCE_URL);
+  const result = spawnSync('bash', [APPLY_SCRIPT], {
+    env: {
+      ...process.env,
+      DB_NAME: CLONE_DATABASE,
+      DB_HOST: source.hostname,
+      DB_PORT: source.port || '5432',
+      DB_USER: decodeURIComponent(source.username),
+      DB_PASSWORD: decodeURIComponent(source.password),
+    },
+    encoding: 'utf8',
+  });
+  return { status: result.status, output: `${result.stdout}${result.stderr}` };
+}
+
+let admin: PgClient;
+let seeder: PgClient;
+let tenantId: string;
+let field: Awaited<ReturnType<typeof seedField>>;
+const extraShift = randomUUID();
+const reservations = [randomUUID(), randomUUID()];
+
+async function owner(): Promise<void> {
+  await seeder.query(`select set_config('app.role', 'owner', false)`);
+  await seeder.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+}
+
+async function indexExists(name: string): Promise<boolean> {
+  const result = await seeder.query<{ present: boolean }>(
+    `select to_regclass($1) is not null as present`,
+    [`ops.${name}`],
+  );
+  return result.rows[0]!.present;
+}
+
+describe('hotfix — pré-checagem de duplicatas antes dos índices únicos parciais', () => {
+  beforeAll(async () => {
+    expect(new URL(SOURCE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
+    admin = await connect('postgres');
+    await admin.query(`drop database if exists ${CLONE_DATABASE} with (force)`);
+    await admin.query(
+      `create database ${CLONE_DATABASE} template ${EXPECTED_DATABASE}`,
+    );
+    seeder = await connect(CLONE_DATABASE);
+    await seeder.query(`drop index if exists ops.${SHIFT_INDEX}`);
+    await seeder.query(`drop index if exists ops.${RESERVATION_INDEX}`);
+    const scope = await isolatedTenant(seeder, 'ux-precheck');
+    tenantId = scope.tenantId;
+    field = await seedField(seeder, tenantId, scope.actorId);
+  }, 60_000);
+
+  afterAll(async () => {
+    await seeder?.end();
+    await admin?.query(
+      `drop database if exists ${CLONE_DATABASE} with (force)`,
+    );
+    await admin?.end();
+  });
+
+  it('dado dois turnos open do mesmo agente quando a DDL é aplicada então ela falha com mensagem que nomeia o índice, o tenant, o agente e o procedimento, e o índice não é criado', async () => {
+    await owner();
+    await seeder.query(
+      `insert into ops.ops_shift
+         (id, tenant_id, traffic_agency_id, agent_id, device_id,
+          operational_unit_id, started_at, status)
+       values ($1, $2, $3, $4, $5, $6, '2026-09-14T09:00:00-04:00', 'open')`,
+      [
+        extraShift,
+        tenantId,
+        field.agencyId,
+        field.agentId,
+        field.otherDeviceId,
+        field.unitId,
+      ],
+    );
+
+    const applied = applyDdl();
+
+    expect(applied.status).not.toBe(0);
+    expect(applied.output).toContain(SHIFT_INDEX);
+    expect(applied.output).toContain(tenantId);
+    expect(applied.output).toContain(field.agentId);
+    expect(applied.output).toContain(PROCEDURE);
+    expect(await indexExists(SHIFT_INDEX)).toBe(false);
+  }, 180_000);
+
+  it('dado duas reservas reserved do mesmo dispositivo e turno quando a DDL é aplicada então ela falha com mensagem que nomeia o índice, o tenant, o dispositivo, o turno e o procedimento, e o índice não é criado', async () => {
+    await owner();
+    // A operação resolveu os turnos duplicados (procedimento do README): fica um só aberto.
+    await seeder.query(
+      `update ops.ops_shift set status = 'closed', ended_at = started_at where id = $1`,
+      [extraShift],
+    );
+    for (const [index, id] of reservations.entries()) {
+      await seeder.query(
+        `insert into ops.numbering_reservation
+           (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id,
+            shift_id, idempotency_key, start_number, end_number, valid_until,
+            status)
+         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9,
+                 '2026-12-31T23:59:59-04:00', 'reserved')`,
+        [
+          id,
+          tenantId,
+          field.rangeId,
+          field.agencyId,
+          field.agentId,
+          field.deviceId,
+          field.shiftId,
+          `ux-precheck-${id.slice(0, 8)}`,
+          2026000001 + index,
+        ],
+      );
+    }
+
+    const applied = applyDdl();
+
+    expect(applied.status).not.toBe(0);
+    expect(applied.output).toContain(RESERVATION_INDEX);
+    expect(applied.output).toContain(tenantId);
+    expect(applied.output).toContain(field.deviceId);
+    expect(applied.output).toContain(field.shiftId);
+    expect(applied.output).toContain(PROCEDURE);
+    expect(await indexExists(RESERVATION_INDEX)).toBe(false);
+  }, 180_000);
+
+  it('dado as duplicatas resolvidas pela operação quando a DDL é aplicada então ela conclui e os dois índices existem', async () => {
+    await owner();
+    await seeder.query(
+      `update ops.numbering_reservation set status = 'cancelled' where id = $1`,
+      [reservations[1]],
+    );
+
+    const applied = applyDdl();
+
+    expect(applied.status, applied.output).toBe(0);
+    expect(await indexExists(SHIFT_INDEX)).toBe(true);
+    expect(await indexExists(RESERVATION_INDEX)).toBe(true);
+  }, 180_000);
+});
diff --git a/backend/database/ddl/13-ops-field-operations.sql b/backend/database/ddl/13-ops-field-operations.sql
index c7cb8818..39dc77c9 100644
--- a/backend/database/ddl/13-ops-field-operations.sql
+++ b/backend/database/ddl/13-ops-field-operations.sql
@@ -1,4 +1,4 @@
--- Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
+-- Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
 
 -- Regenerable-only DDL for BP-OPS-FIELD-001; request-path writes use role_app_backend.
 
@@ -240,6 +240,20 @@ create table if not exists ops.ops_shift (
 );
 create index if not exists ix_ops_shift_tenant_id_agent_id_started_at on ops.ops_shift (tenant_id, agent_id, started_at);
 create index if not exists ix_ops_shift_tenant_id_status on ops.ops_shift (tenant_id, status);
+do $$
+declare
+  duplicates text;
+begin
+  if to_regclass('ops.ux_ops_shift_tenant_id_agent_id_open') is null then
+    select string_agg(format('tenant_id=%s agent_id=%s linhas=%s', tenant_id, agent_id, total), '; ')
+      into duplicates
+      from (select tenant_id, agent_id, count(*) as total from ops.ops_shift where status = 'open'
+             group by tenant_id, agent_id having count(*) > 1) duplicate;
+    if duplicates is not null then
+      raise exception 'Indice unico ops.ux_ops_shift_tenant_id_agent_id_open nao pode ser criado: duplicatas em ops.ops_shift (status = ''open''): %. Resolva-as pelo procedimento "Duplicatas antes de indice unico parcial" de backend/database/ddl/README.md e reaplique a DDL.', duplicates;
+    end if;
+  end if;
+end $$;
 create unique index if not exists ux_ops_shift_tenant_id_agent_id_open on ops.ops_shift (tenant_id, agent_id) where status = 'open';
 create index if not exists ix_ops_shift_tenant_id on ops.ops_shift (tenant_id);
 create index if not exists ix_ops_shift_traffic_agency_id on ops.ops_shift (traffic_agency_id);
diff --git a/backend/database/ddl/18-ops-offline-sync.sql b/backend/database/ddl/18-ops-offline-sync.sql
index f58a0f8a..b5014b11 100644
--- a/backend/database/ddl/18-ops-offline-sync.sql
+++ b/backend/database/ddl/18-ops-offline-sync.sql
@@ -1,4 +1,4 @@
--- Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
+-- Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:ff9d218be3314b511ef2cdab143c94785c99ffe446405136e001f85f8978c1ad
 
 -- Regenerable-only DDL for BP-OPS-OFFLINE-SYNC-001; request-path writes use role_app_backend.
 
@@ -45,6 +45,21 @@ create table if not exists ops.numbering_reservation (
 );
 create index if not exists ix_numbering_reservation_tenant_id_agent_id_device_id_status on ops.numbering_reservation (tenant_id, agent_id, device_id, status);
 create unique index if not exists ux_numbering_reservation_tenant_id_idempotency_key on ops.numbering_reservation (tenant_id, idempotency_key) where idempotency_key is not null;
+do $$
+declare
+  duplicates text;
+begin
+  if to_regclass('ops.ux_numbering_reservation_tenant_id_device_id_shift_id_reserved') is null then
+    select string_agg(format('tenant_id=%s device_id=%s shift_id=%s linhas=%s', tenant_id, device_id, shift_id, total), '; ')
+      into duplicates
+      from (select tenant_id, device_id, shift_id, count(*) as total from ops.numbering_reservation where status = 'reserved'
+             group by tenant_id, device_id, shift_id having count(*) > 1) duplicate;
+    if duplicates is not null then
+      raise exception 'Indice unico ops.ux_numbering_reservation_tenant_id_device_id_shift_id_reserved nao pode ser criado: duplicatas em ops.numbering_reservation (status = ''reserved''): %. Resolva-as pelo procedimento "Duplicatas antes de indice unico parcial" de backend/database/ddl/README.md e reaplique a DDL.', duplicates;
+    end if;
+  end if;
+end $$;
+create unique index if not exists ux_numbering_reservation_tenant_id_device_id_shift_id_reserved on ops.numbering_reservation (tenant_id, device_id, shift_id) where status = 'reserved';
 create index if not exists ix_numbering_reservation_tenant_id on ops.numbering_reservation (tenant_id);
 create index if not exists ix_numbering_reservation_range_id on ops.numbering_reservation (range_id);
 create index if not exists ix_numbering_reservation_traffic_agency_id on ops.numbering_reservation (traffic_agency_id);
diff --git a/backend/database/ddl/README.md b/backend/database/ddl/README.md
index 6c7a19a8..d741d32e 100644
--- a/backend/database/ddl/README.md
+++ b/backend/database/ddl/README.md
@@ -89,3 +89,44 @@ Application notes (`../apply.sh`):
 `auth.tenants` is the canonical DETRAN tenant table. `tenancy.tenants` is a
 simple, automatically updatable compatibility view exposing the columns used by
 `@stynx-nyx/tenancy`; this prevents a second tenant source of truth.
+
+## Duplicatas antes de índice único parcial
+
+Os índices únicos parciais de "uma linha ativa" são precedidos, na DDL gerada,
+por um bloco de pré-checagem (`precheck: true` no índice do blueprint):
+
+| Índice                                                               | DDL                           | Invariante                                             |
+| -------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------ |
+| `ops.ux_ops_shift_tenant_id_agent_id_open`                           | `13-ops-field-operations.sql` | um turno `open` por agente e tenant (CTG-0002 §5.4)    |
+| `ops.ux_numbering_reservation_tenant_id_device_id_shift_id_reserved` | `18-ops-offline-sync.sql`     | uma reserva `reserved` por dispositivo e turno (§5.10) |
+
+Se o banco já tiver linhas que o índice recusaria, `apply.sh` falha (a
+transação única é desfeita e nada é aplicado) com a mensagem
+`Indice unico <índice> nao pode ser criado: duplicatas em <tabela> (<filtro>): <chaves> linhas=<n>`,
+que lista cada tenant e agente (ou tenant, dispositivo e turno) duplicado. A
+DDL só detecta: **qual linha manter é decisão da operação**, nunca da DDL.
+
+Procedimento, antes de reaplicar:
+
+1. Liste as duplicatas (papel owner, fora do caminho de requisição):
+
+   ```sql
+   select tenant_id, agent_id, array_agg(id order by started_at) as shifts
+     from ops.ops_shift where status = 'open'
+    group by tenant_id, agent_id having count(*) > 1;
+
+   select tenant_id, device_id, shift_id,
+          array_agg(id order by reserved_at) as reservations
+     from ops.numbering_reservation where status = 'reserved'
+    group by tenant_id, device_id, shift_id having count(*) > 1;
+   ```
+
+2. Leve cada grupo ao responsável operacional do órgão (supervisão de campo),
+   que decide qual turno segue aberto e qual reserva segue vigente.
+3. Aplique a decisão pelos comandos de produção, nunca por `update` direto:
+   turno excedente → `POST /v1/ops/mobile-bootstrap/shifts/{id}/close` (com
+   `reason`); reserva excedente →
+   `POST /v1/ops/offline-sync/numbering-reservations/{id}/cancel` ou `…/block`
+   (a liquidação devolve a cauda à faixa quando cabe e registra o ato em
+   `reconciliation_json.lifecycle`).
+4. Repita as consultas do passo 1 até voltarem vazias e reaplique `apply.sh`.
diff --git a/backend/domains/inf/ait/tests/integration/ait-sync-applier.integration.spec.ts b/backend/domains/inf/ait/tests/integration/ait-sync-applier.integration.spec.ts
index 5dbbcee9..11def75d 100644
--- a/backend/domains/inf/ait/tests/integration/ait-sync-applier.integration.spec.ts
+++ b/backend/domains/inf/ait/tests/integration/ait-sync-applier.integration.spec.ts
@@ -644,6 +644,14 @@ describe('CTG-0002 §4.6 — efeito de domínio do applier ait (C-0002-42)', ()
       device_id: isolatedField.deviceId,
     });
     await client.query(`select set_config('app.role', 'owner', false)`);
+    // §5.10: uma reserva `reserved` por dispositivo e turno — a reserva do
+    // caso anterior (…0001, consumida por C-0002-42) é liquidada antes de a
+    // reserva do número 2026000005 nascer.
+    await client.query(
+      `update ops.numbering_reservation set status = 'consumed'
+        where tenant_id = $1 and id = $2 and status = 'reserved'`,
+      [isolated.tenantId, isolatedField.reservationId],
+    );
     await client.query(
       `insert into ops.numbering_reservation
          (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
diff --git a/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts b/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts
index f5d32943..31c58a5d 100644
--- a/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts
+++ b/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts
@@ -17,7 +17,7 @@ import {
   type OfflineSyncDeps,
 } from './batch-protocol.js';
 import { numberingReservationChangedEvent } from './events.js';
-import { bigintOf, inTransaction } from './numbering-sql.js';
+import { bigintOf, inTransaction, type SqlScope } from './numbering-sql.js';
 
 /** Chave do `parameter-catalogue.md` §TEAT (H.54: 72 horas vigentes). */
 const RESERVATION_TTL_KEY = 'teat.numbering.reservation_ttl_hours';
@@ -65,6 +65,27 @@ function view(row: ReservationRow): ReservationView {
   };
 }
 
+/** Uma reserva `reserved` por dispositivo e turno (§5.10 pré-estado). */
+async function assertNoActiveReservation(
+  query: SqlScope['query'],
+  tenantId: string,
+  input: ReserveNumberingInput,
+): Promise<void> {
+  const active = await query<{ id: string }>(
+    `select id from ops.numbering_reservation
+      where tenant_id = $1 and device_id = $2
+        and shift_id is not distinct from $3 and status = 'reserved'
+      limit 1`,
+    [tenantId, String(input.device_id), input.shift_id ?? null],
+  );
+  if (active.rows[0])
+    throw new DetranError('TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS', {
+      status: 409,
+      context: { reservationId: active.rows[0].id },
+      message: 'Já existe reserva vigente para o dispositivo e turno.',
+    });
+}
+
 export class ReserveNumberingCommand {
   constructor(private readonly deps: OfflineSyncDeps) {}
 
@@ -105,26 +126,24 @@ export class ReserveNumberingCommand {
       // faixa (a mesma ordem do fechamento de turno, que trava o turno e
       // depois reserva e faixa), então duas reservas do mesmo turno em faixas
       // diferentes não passam juntas pela checagem abaixo, e nenhuma nasce
-      // no meio da liquidação do fechamento.
-      await query(
+      // no meio da liquidação do fechamento. Sem turno `open` do tenant e do
+      // agente pedido não há o que travar nem a quem numerar: 409
+      // `TEAT.SHIFT_NOT_OPEN` (catálogo TEAT, "ato legal sem turno").
+      const shift = await query<{ id: string }>(
         `select id from ops.ops_shift
-          where tenant_id = $1 and id = $2 for no key update`,
-        [tenantId, input.shift_id ?? null],
+          where tenant_id = $1 and id = $2 and agent_id = $3
+            and status = 'open'
+          for no key update`,
+        [tenantId, input.shift_id ?? null, String(input.agent_id)],
       );
-      const range = await this.lockRange(query, tenantId, input);
-      const active = await query<{ id: string }>(
-        `select id from ops.numbering_reservation
-          where tenant_id = $1 and device_id = $2
-            and shift_id is not distinct from $3 and status = 'reserved'
-          limit 1`,
-        [tenantId, String(input.device_id), input.shift_id ?? null],
-      );
-      if (active.rows[0])
-        throw new DetranError('TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS', {
+      if (!shift.rows[0])
+        throw new DetranError('TEAT.SHIFT_NOT_OPEN', {
           status: 409,
-          context: { reservationId: active.rows[0].id },
-          message: 'Já existe reserva vigente para o dispositivo e turno.',
+          context: { shiftId: input.shift_id ?? null },
+          message: 'Turno não está aberto.',
         });
+      const range = await this.lockRange(query, tenantId, input);
+      await assertNoActiveReservation(query, tenantId, input);
 
       const start = bigintOf(range.next_number);
       const end = start + size - 1;
@@ -152,6 +171,8 @@ export class ReserveNumberingCommand {
             idempotency_key, start_number, end_number, reserved_at, valid_until,
             status)
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'reserved')
+         on conflict (tenant_id, device_id, shift_id) where status = 'reserved'
+         do nothing
          returning *`,
         [
           range.id,
@@ -166,7 +187,14 @@ export class ReserveNumberingCommand {
           validUntil,
         ],
       );
-      const row = inserted.rows[0]!;
+      const row = inserted.rows[0];
+      if (!row) {
+        // O índice `ux_numbering_reservation_tenant_id_device_id_shift_id_reserved`
+        // recusou uma reserva gravada fora deste comando (rota CRUD): mesma
+        // recusa de negócio, com o id da reserva vigente.
+        await assertNoActiveReservation(query, tenantId, input);
+        throw new Error('Active reservation conflict without a visible row');
+      }
       await teatEventSink(this.deps.outbox).append(
         transaction,
         numberingReservationChangedEvent(scope, {
diff --git a/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts b/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
index 17383759..b7498f00 100644
--- a/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
+++ b/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
@@ -459,21 +459,33 @@ describe('CTG-0002 §5.13 — leituras de recibo e recuperação de ACK perdido
  * Achado 3 (§4.1 passo 4): sem lote anterior, `last = 0`.
  */
 
-/** Reserva `reserved` do device+turno cobrindo um número específico. */
+/**
+ * Reserva `reserved` do device+turno cobrindo `[number, end]`. §5.10: há no
+ * máximo uma reserva `reserved` por dispositivo e turno, então a reserva
+ * vigente de um caso anterior deste arquivo é liquidada (`consumed`) antes de
+ * a nova nascer — o estado semeado é sempre um que o protocolo admite.
+ */
 async function seedReservationFor(
   deviceId: string,
   number: number,
+  end: number = number,
 ): Promise<string> {
   const id = randomUUID();
   await client.query(`select set_config('app.role', 'owner', false)`);
   await client.query(`select set_config('app.tenant_id', $1, false)`, [
     tenantId,
   ]);
+  await client.query(
+    `update ops.numbering_reservation set status = 'consumed'
+      where tenant_id = $1 and device_id = $2 and shift_id = $3
+        and status = 'reserved'`,
+    [tenantId, deviceId, field.shiftId],
+  );
   await client.query(
     `insert into ops.numbering_reservation
        (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
         idempotency_key, start_number, end_number, valid_until, status)
-     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9,
+     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              '2026-12-31T23:59:59-04:00', 'reserved')`,
     [
       id,
@@ -485,6 +497,7 @@ async function seedReservationFor(
       field.shiftId,
       `atomicity-${id.slice(0, 8)}`,
       number,
+      end,
     ],
   );
   return id;
@@ -979,14 +992,21 @@ describe('CTG-0002 §14 (c) — replay de lote interrompido completa a materiali
     return { batchId, itemId, receiptId };
   }
 
+  /**
+   * Os dois números dos itens do lote numa só reserva `reserved` do
+   * dispositivo e turno (§5.10 admite uma por dispositivo e turno); o mapa
+   * número → reserva que os casos consomem continua o mesmo.
+   */
   async function seedTwoReservations(
     deviceId: string,
   ): Promise<Map<number, string>> {
-    const map = new Map<number, string>();
-    for (const number of [2026000201, 2026000202]) {
-      map.set(number, await seedReservationFor(deviceId, number));
-    }
-    return map;
+    const numbers = [2026000201, 2026000202];
+    const reservationId = await seedReservationFor(
+      deviceId,
+      numbers[0]!,
+      numbers[1]!,
+    );
+    return new Map(numbers.map((number) => [number, reservationId]));
   }
 
   it('dado um lote interrompido depois do passo 5, com só o primeiro de dois itens materializado, quando reenviado com o mesmo device_batch_id e os mesmos dois itens então 200: o recibo do item já emitido volta sem reaplicar e o item faltante é materializado e aplicado', async () => {
diff --git a/backend/domains/ops/provisioning/tests/integration/harness.ts b/backend/domains/ops/provisioning/tests/integration/harness.ts
index 7ac4ef4e..d0342430 100644
--- a/backend/domains/ops/provisioning/tests/integration/harness.ts
+++ b/backend/domains/ops/provisioning/tests/integration/harness.ts
@@ -339,6 +339,9 @@ export class ProofHarness {
         }),
       ],
     );
+    // §5.10 (CTG-0002): uma reserva `reserved` por dispositivo e turno, garantida
+    // no banco. O provisioning não lê o turno; cada reserva copiada da canônica
+    // (…e6000001, de outro dispositivo e agente) recebe turno próprio.
     await this.owner.query(
       `insert into ops.numbering_reservation select (jsonb_populate_record(null::ops.numbering_reservation, to_jsonb(r) || $1::jsonb)).* from ops.numbering_reservation r where id='00000000-0000-7000-8000-0000e6000001'`,
       [
@@ -348,6 +351,7 @@ export class ProofHarness {
           device_id: this.deviceId,
           traffic_agency_id: AGENCY_A,
           agent_id: AGENT_A,
+          shift_id: randomUUID(),
           idempotency_key: this.prefix,
           status: 'reserved',
           valid_until: '2026-09-22T00:00:00Z',
@@ -394,6 +398,7 @@ export class ProofHarness {
         JSON.stringify({
           id: this.issuanceReservationId,
           range_id: this.issuanceRangeId,
+          shift_id: randomUUID(),
           start_number: 2026000002,
           end_number: 2026000011,
           idempotency_key: `${this.prefix}-fresh-interval`,
diff --git a/backend/domains/ops/provisioning/tests/integration/provisioning-amendment4.integration.spec.ts b/backend/domains/ops/provisioning/tests/integration/provisioning-amendment4.integration.spec.ts
index b5d8809b..bb1e8bc9 100644
--- a/backend/domains/ops/provisioning/tests/integration/provisioning-amendment4.integration.spec.ts
+++ b/backend/domains/ops/provisioning/tests/integration/provisioning-amendment4.integration.spec.ts
@@ -287,6 +287,8 @@ describe('Amendment 4 — responsável, destinatários e reserva persistida', ()
         JSON.stringify({
           id: second,
           agent_id: recipientB,
+          // §5.10: uma reserva `reserved` por dispositivo e turno (turno próprio).
+          shift_id: randomUUID(),
           start_number: 2026000007,
           end_number: 2026000011,
           idempotency_key: `${h.prefix}-second-recipient`,
@@ -503,6 +505,8 @@ async function extraGrant(active = true) {
       JSON.stringify({
         id: reservationId,
         range_id: rangeId,
+        // §5.10: uma reserva `reserved` por dispositivo e turno (turno próprio).
+        shift_id: randomUUID(),
         idempotency_key: `${h.prefix}-${reservationId}`,
       }),
       h.reservationId,
diff --git a/docs/framework/blueprints/BP-OPS-FIELD-001.json b/docs/framework/blueprints/BP-OPS-FIELD-001.json
index db02c281..10539a1b 100644
--- a/docs/framework/blueprints/BP-OPS-FIELD-001.json
+++ b/docs/framework/blueprints/BP-OPS-FIELD-001.json
@@ -927,7 +927,8 @@
             "name": "ux_ops_shift_tenant_id_agent_id_open",
             "columns": ["tenant_id", "agent_id"],
             "unique": true,
-            "where": "status = 'open'"
+            "where": "status = 'open'",
+            "precheck": true
           }
         ],
         "foreignKeys": [
diff --git a/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json b/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
index b8869daf..5f6e87ce 100644
--- a/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
+++ b/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
@@ -239,6 +239,13 @@
             "columns": ["tenant_id", "idempotency_key"],
             "unique": true,
             "where": "idempotency_key is not null"
+          },
+          {
+            "name": "ux_numbering_reservation_tenant_id_device_id_shift_id_reserved",
+            "columns": ["tenant_id", "device_id", "shift_id"],
+            "unique": true,
+            "where": "status = 'reserved'",
+            "precheck": true
           }
         ],
         "foreignKeys": [
diff --git a/tools/blueprints/generate.mjs b/tools/blueprints/generate.mjs
index afc3b7ab..50d26ce7 100644
--- a/tools/blueprints/generate.mjs
+++ b/tools/blueprints/generate.mjs
@@ -155,6 +155,39 @@ function entityFields(entity) {
       : [{ name: 'updated_at', type: 'timestamptz', nullable: true }]),
   ];
 }
+/**
+ * `precheck: true` num índice único: antes do `create unique index`, um bloco
+ * que procura as linhas que o índice recusaria e, havendo, falha com a lista
+ * das chaves duplicadas e o procedimento de `backend/database/ddl/README.md`.
+ * Só detecta: qual linha manter é decisão da operação, nunca da DDL. Com o
+ * índice já presente o bloco não varre a tabela.
+ */
+function uniquePrecheckSql(module, entity, index) {
+  const table = `${module.namespace}.${entity.table}`;
+  const name = index.name;
+  if (!name) throw new Error(`${table}: precheck requires an index name`);
+  const columns = index.columns.join(', ');
+  const labels = index.columns.map((column) => `${column}=%s`).join(' ');
+  const scope = index.where ? ` where ${index.where}` : '';
+  const scopeText = (index.where ? ` (${index.where})` : '').replaceAll(
+    "'",
+    "''",
+  );
+  return `do $$
+declare
+  duplicates text;
+begin
+  if to_regclass('${module.namespace}.${name}') is null then
+    select string_agg(format('${labels} linhas=%s', ${columns}, total), '; ')
+      into duplicates
+      from (select ${columns}, count(*) as total from ${table}${scope}
+             group by ${columns} having count(*) > 1) duplicate;
+    if duplicates is not null then
+      raise exception 'Indice unico ${module.namespace}.${name} nao pode ser criado: duplicatas em ${table}${scopeText}: %. Resolva-as pelo procedimento "Duplicatas antes de indice unico parcial" de backend/database/ddl/README.md e reaplique a DDL.', duplicates;
+    end if;
+  end if;
+end $$;`;
+}
 function tableSql(module, entity) {
   const fields = entityFields(entity);
   const columns = fields.map(
@@ -190,7 +223,7 @@ end $$;`,
       ),
     ...indexes.map(
       (i) =>
-        `create ${i.unique ? 'unique ' : ''}index if not exists ${i.name ?? `${i.unique ? 'ux' : 'ix'}_${entity.table}_${i.columns.join('_')}`} on ${module.namespace}.${entity.table}${i.method ? ` using ${i.method}` : ''} (${i.columns.join(', ')})${i.where ? ` where ${i.where}` : ''};`,
+        `${i.unique && i.precheck ? `${uniquePrecheckSql(module, entity, i)}\n` : ''}create ${i.unique ? 'unique ' : ''}index if not exists ${i.name ?? `${i.unique ? 'ux' : 'ix'}_${entity.table}_${i.columns.join('_')}`} on ${module.namespace}.${entity.table}${i.method ? ` using ${i.method}` : ''} (${i.columns.join(', ')})${i.where ? ` where ${i.where}` : ''};`,
     ),
     ...indexes
       .filter(
```

```json
{"mode":"delivery-review","scope":"hotfix-offline-numbering-shift-races","cycle":2,"verdict":"PASS | REVIEW | FAIL","resolved":[1,2,3,4],"findings":[{"severity":"high | low","item":1,"file":"…","line":1,"claim":"…","fix":"…"}],"notes":["…"]}
```
