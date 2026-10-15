// Inspector — D-160 A160-04a/05/06/08. Test-only HTTP controller exercises
// inactive DETRAN adapters with actual app authentication, Database and PKI-free
// outbox storage. It does not activate the production outbox or prove cutover.
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Action, Resource, type TeatEventEnvelope } from '@detran/shared';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  ACTOR_A,
  ACTOR_B,
  TENANT_A,
  TENANT_B,
  seedIsolationTenants,
} from './r22-sse-tenancy.support.js';

const keys = [
  'DETRAN_RUNTIME_PROFILE',
  'DETRAN_LOCAL_TENANT_ID',
  'DETRAN_LOCAL_ACTOR_ID',
  'DETRAN_LOCAL_ROLES',
  'DATABASE_URL',
  'STYNX_OWNER_DATABASE_URL',
  'STYNX_APP_DATABASE_URL',
  'STYNX_READER_DATABASE_URL',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
let owner: pg.Client;
let appA: INestApplication;
let appB: INestApplication;

function required(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new Error(`${name} is required; no default database is permitted`);
  return value;
}

async function boot(tenant: string): Promise<INestApplication> {
  process.env.DETRAN_LOCAL_TENANT_ID = tenant;
  vi.resetModules();
  const [{ Test }, { AppModule }, { Database }, { OutboxService }, adapters] =
    await Promise.all([
      import('@nestjs/testing'),
      import('../../src/app.module.js'),
      import('@stynx-nyx/data'),
      import('@stynx-nyx/outbox'),
      import('../../src/r22-stynx-outbox.adapter.js'),
    ]);
  @Controller('__r22_adoption')
  @Resource('ops:integration')
  class Probe {
    private readonly outbox;
    private readonly appender;
    private readonly control;
    constructor(
      @Inject(Database)
      private readonly database: InstanceType<typeof Database>,
    ) {
      this.outbox = new OutboxService(database, {
        storageMode: 'consumer-owned',
        dispatchableEntities: {
          entities: [
            ...adapters.R22_OUTBOX_DESTINATION_SELECTORS.renach.entities,
            ...adapters.R22_OUTBOX_DESTINATION_SELECTORS.renaest.entities,
          ],
        },
      });
      this.appender = new adapters.R22StynxEventAppender(this.outbox);
      this.control = new adapters.R22StynxOutboxTenantControl(this.outbox);
    }
    @Post('append')
    @Action('read')
    append(@Body() envelope: TeatEventEnvelope) {
      return this.database.tx(
        async (tx) => {
          const event = await this.appender.append(tx, envelope);
          const identity = (
            await tx.query(`select session_user::text as session_user, current_user::text as current_user,
          current_setting('app.tenant_id', true) as tenant_id, current_setting('app.actor_id', true) as actor_id`)
          ).rows[0];
          return { ...event, identity };
        },
        { role: 'app', requireActor: true },
      );
    }
    @Get('delivery/:id')
    @Action('read')
    async delivery(@Param('id') id: string) {
      return {
        delivery: await this.control.getEventDelivery(id),
        retirement: await this.control.getEventRetirement(id),
      };
    }
    @Post('retire/:id')
    @Action('read')
    retire(
      @Param('id') id: string,
      @Body() body: { idempotencyKey: string; reason: string },
    ) {
      return this.database.tx(
        async (tx) => {
          const receipt = await this.control.retireEvent(id, body);
          const identity = (
            await tx.query(`select session_user::text as session_user, current_user::text as current_user,
          current_setting('app.tenant_id', true) as tenant_id, current_setting('app.actor_id', true) as actor_id`)
          ).rows[0];
          return { receipt, identity };
        },
        { role: 'app', requireActor: true },
      );
    }
    @Post('dispatch')
    @Action('read')
    dispatch() {
      return this.control.dispatchTenantEventsDue();
    }
    @Post('retry/:id')
    @Action('read')
    retry(@Param('id') id: string) {
      return this.control.retryEvent(id, { immediate: true });
    }
    @Get('health')
    @Action('read')
    health() {
      return this.control.getQueueHealth();
    }
  }
  const module = await Test.createTestingModule({
    imports: [AppModule.forRoot()],
    controllers: [Probe],
  }).compile();
  const app = module.createNestApplication({
    logger: false,
    abortOnError: false,
  });
  await app.init();
  return app;
}

function headers(tenant: string, actor: string): Record<string, string> {
  process.env.DETRAN_LOCAL_ACTOR_ID = actor;
  process.env.DETRAN_LOCAL_ROLES = 'integration-operator';
  return { authorization: 'Bearer local', 'x-tenant-id': tenant };
}

function envelope(
  tenant: string,
  entityId: string = randomUUID(),
  version = 1,
  type = 'ch.renach.exam-result',
): TeatEventEnvelope {
  return {
    id: '',
    type,
    domainEvent: 'FIXTURE_R22_OUTBOX',
    version: 1,
    tenantId: tenant,
    aggregate: { kind: 'ch.report', id: entityId, version },
    occurredAt: '2026-09-14T12:00:00.000Z',
    actor: { kind: 'system', id: ACTOR_A },
    correlationId: randomUUID(),
    data: {},
  };
}

beforeAll(async () => {
  const ownerUrl = new URL(required('DETRAN_TEST_DATABASE_URL'));
  const appUrl = new URL(required('DETRAN_R22_RESTRICTED_DATABASE_URL'));
  expect(ownerUrl.pathname).toMatch(/^\/detran_r22_adoption160_[0-9]+$/);
  expect(appUrl.pathname).toBe(ownerUrl.pathname);
  expect(appUrl.host).toBe(ownerUrl.host);
  // Direct restricted login remains session_user; the pool explicitly presents
  // the configured NOLOGIN app role as current_user, never an owner identity.
  appUrl.searchParams.set('options', '-c role=role_app_backend');
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DATABASE_URL = ownerUrl.toString();
  process.env.STYNX_OWNER_DATABASE_URL = ownerUrl.toString();
  process.env.STYNX_APP_DATABASE_URL = appUrl.toString();
  process.env.STYNX_READER_DATABASE_URL = appUrl.toString();
  owner = new pg.Client({ connectionString: ownerUrl.toString() });
  await owner.connect();
  await seedIsolationTenants(owner);
  appA = await boot(TENANT_A);
  appB = await boot(TENANT_B);
}, 60_000); // Two independent real AppModule graphs, including cold transformation.

afterAll(async () => {
  await appB?.close();
  await appA?.close();
  await owner?.end();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('D-160 — seams de outbox via HTTP autenticado e SQL restrito real', () => {
  it('A160-05/06 dado principal A e envelope alegando B quando append HTTP é repetido então um evento pertence a A com tenant/ator SQL observados na mesma transação', async () => {
    const input = envelope(TENANT_B, randomUUID(), 1, 'ait.changed');
    const send = () =>
      request(appA.getHttpServer())
        .post('/__r22_adoption/append')
        .set(headers(TENANT_A, ACTOR_A))
        .send(input);
    const first = await send();
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    const second = await send();
    expect(second.status, JSON.stringify(second.body)).toBe(201);
    expect(second.body.id).toBe(first.body.id);
    expect(first.body.identity).toEqual({
      session_user: decodeURIComponent(
        new URL(required('DETRAN_R22_RESTRICTED_DATABASE_URL')).username,
      ),
      current_user: 'role_app_backend',
      tenant_id: TENANT_A,
      actor_id: ACTOR_A,
    });
    const stored = (
      await owner.query(
        'select tenant_id, payload from outbox.events where id = $1',
        [first.body.id],
      )
    ).rows;
    expect(stored).toHaveLength(1);
    expect(stored[0].tenant_id).toBe(TENANT_A);
    expect(stored[0].payload.tenantId).toBe(TENANT_A);
    expect(
      (
        await owner.query(
          'select * from outbox.event_delivery where event_id = $1',
          [first.body.id],
        )
      ).rows,
    ).toEqual([]);
    const foreign = await request(appB.getHttpServer())
      .get(`/__r22_adoption/delivery/${first.body.id}`)
      .set(headers(TENANT_B, ACTOR_B));
    expect(foreign.status).toBe(200);
    expect(foreign.body).toEqual({ delivery: null, retirement: null });
  });

  it('A160-06/08 dado item de B quando A tenta aposentar e B aposenta com motivo/chave então A não altera B e RETIRED preserva recibo auditável sem ACK nem reentrega', async () => {
    const input = envelope(TENANT_B);
    const append = await request(appB.getHttpServer())
      .post('/__r22_adoption/append')
      .set(headers(TENANT_B, ACTOR_B))
      .send(input);
    expect(append.status, JSON.stringify(append.body)).toBe(201);
    const id = append.body.id as string;
    const body = {
      idempotencyKey: `retire:${id}`,
      reason: 'R-0022 test-only operator disposition',
    };
    const denied = await request(appA.getHttpServer())
      .post(`/__r22_adoption/retire/${id}`)
      .set(headers(TENANT_A, ACTOR_A))
      .send(body);
    expect(denied.status).toBe(404);
    expect(denied.body.code).toBe('OUTBOX_NOT_FOUND');
    expect(
      (
        await owner.query(
          'select status from outbox.event_delivery where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([{ status: 'PENDING' }]);
    const retire = () =>
      request(appB.getHttpServer())
        .post(`/__r22_adoption/retire/${id}`)
        .set(headers(TENANT_B, ACTOR_B))
        .send(body);
    const receipt = await retire();
    expect(receipt.status, JSON.stringify(receipt.body)).toBe(201);
    expect(receipt.body.receipt).toMatchObject({
      eventId: id,
      tenantId: TENANT_B,
      actorId: ACTOR_B,
      reason: body.reason,
      idempotencyKey: body.idempotencyKey,
      previousStatus: 'PENDING',
    });
    expect(receipt.body.identity).toMatchObject({
      current_user: 'role_app_backend',
      tenant_id: TENANT_B,
      actor_id: ACTOR_B,
    });
    const replay = await retire();
    expect(replay.status).toBe(201);
    expect(replay.body.receipt).toEqual(receipt.body.receipt);
    expect(
      (
        await owner.query(
          'select status, attempts from outbox.event_delivery where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([{ status: 'RETIRED', attempts: 0 }]);
    expect(
      (
        await owner.query(
          'select id from outbox.event_acks where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([]);
    expect(
      (
        await owner.query(
          'select id from outbox.event_attempts where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([]);
    const dispatch = await request(appB.getHttpServer())
      .post('/__r22_adoption/dispatch')
      .set(headers(TENANT_B, ACTOR_B))
      .send({});
    expect(dispatch.status).toBe(201);
    expect(Array.isArray(dispatch.body)).toBe(true);
    const returnedIds = dispatch.body.map(
      (outcome: { row: { id: string } }) => outcome.row.id,
    );
    const observationDirectory = process.env.DETRAN_R22_OBSERVATION_DIR;
    if (observationDirectory) {
      await mkdir(observationDirectory, { recursive: true });
      await writeFile(
        join(observationDirectory, 'retired-dispatch-observation.json'),
        `${JSON.stringify({ retiredTargetId: id, returnedIds, unrelatedReturnedIds: returnedIds.filter((returnedId: string) => returnedId !== id) }, null, 2)}\n`,
      );
    }
    expect(returnedIds).not.toContain(id);
    expect(
      (
        await owner.query(
          'select status, attempts from outbox.event_delivery where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([{ status: 'RETIRED', attempts: 0 }]);
    expect(
      (
        await owner.query(
          'select id from outbox.event_acks where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([]);
    expect(
      (
        await owner.query(
          'select id from outbox.event_attempts where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([]);
    const retry = await request(appB.getHttpServer())
      .post(`/__r22_adoption/retry/${id}`)
      .set(headers(TENANT_B, ACTOR_B))
      .send({});
    expect(retry.status).toBe(409);
    expect(retry.body.code).toBe('OUTBOX_EVENT_NOT_FAILED');
    expect(
      (
        await owner.query(
          'select status from outbox.event_delivery where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([{ status: 'RETIRED' }]);
    const next = await request(appB.getHttpServer())
      .post('/__r22_adoption/append')
      .set(headers(TENANT_B, ACTOR_B))
      .send(envelope(TENANT_B, input.aggregate.id, 2));
    expect(next.status, JSON.stringify(next.body)).toBe(201);
    expect(next.body.id).not.toBe(id);
    const retireReleaseWitness = await request(appB.getHttpServer())
      .post(`/__r22_adoption/retire/${next.body.id}`)
      .set(headers(TENANT_B, ACTOR_B))
      .send({
        idempotencyKey: `release:${next.body.id}`,
        reason: 'R-0022 test-only aggregate release witness completed',
      });
    expect(
      retireReleaseWitness.status,
      JSON.stringify(retireReleaseWitness.body),
    ).toBe(201);
    expect(retireReleaseWitness.body.receipt).toMatchObject({
      eventId: next.body.id,
      tenantId: TENANT_B,
      actorId: ACTOR_B,
      previousStatus: 'PENDING',
    });
  });

  it('A160-08 dado item B com lease ativo de fixture quando B tenta aposentar então recusa sem recibo nem alteração da entrega', async () => {
    const append = await request(appB.getHttpServer())
      .post('/__r22_adoption/append')
      .set(headers(TENANT_B, ACTOR_B))
      .send(envelope(TENANT_B));
    expect(append.status, JSON.stringify(append.body)).toBe(201);
    const id = append.body.id as string;
    // Owner prepares only the active-lease fixture, never the operation under test.
    await owner.query(
      "update outbox.event_delivery set status = 'SENT', lease_until = clock_timestamp() + interval '1 hour' where event_id = $1",
      [id],
    );
    const before = (
      await owner.query(
        'select status, lease_until, attempts from outbox.event_delivery where event_id = $1',
        [id],
      )
    ).rows;
    const refused = await request(appB.getHttpServer())
      .post(`/__r22_adoption/retire/${id}`)
      .set(headers(TENANT_B, ACTOR_B))
      .send({
        idempotencyKey: `active:${id}`,
        reason: 'R-0022 test-only active lease negative',
      });
    expect(refused.status).toBe(409);
    expect(refused.body).toMatchObject({
      code: 'OUTBOX_RETIREMENT_CONFLICT',
      context: { reason: 'active-lease' },
    });
    expect(
      (
        await owner.query(
          'select status, lease_until, attempts from outbox.event_delivery where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual(before);
    expect(
      (
        await owner.query(
          'select id from outbox.event_retirements where event_id = $1',
          [id],
        )
      ).rows,
    ).toEqual([]);
  });
});
