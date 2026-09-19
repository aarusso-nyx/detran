import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  commandDeps,
  dropTenant,
  importModule,
  isolatedTenant,
  newClient,
  outboxEnvelopes,
  runCommand,
  seedField,
} from './harness.js';

/**
 * CTG-0002 §5.4, §5.5 e §10 (R-0008, TASK-0004) — C-0002-35…37: abertura de
 * turno com guarda de exclusividade, fechamento com fila pendente e liquidação
 * das reservas do turno (M10).
 *
 * Os comandos (`open-shift.command.ts`, `close-shift.command.ts`) nascem em
 * TASK-0005 (CTG-0002 §11); cada teste carrega o módulo por `import()`
 * dinâmico e falha isolado, pelo comportamento ausente.
 */

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let field: Awaited<ReturnType<typeof seedField>>;

const APP_VERSION = '1.0.0';
const RESERVATION_TTL_HOURS = 72;

function parameters(values: Record<string, unknown> = {}) {
  return {
    get: vi.fn(async (key: string) => ({
      key,
      value_json: values[key] ?? null,
      source_pending: !(key in values),
    })),
  };
}

function deps(overrides: Record<string, unknown> = {}) {
  return commandDeps(client, tenantId, actorId, {
    parameters: parameters({
      'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      'teat.homologation.expired_behavior':
        'warn (lavra com flag de risco; autoridade decide)',
    }),
    clock: { now: () => '2026-09-14T18:00:00.000Z' },
    ...overrides,
  });
}

function openShift(
  dependencies: unknown,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/open-shift.command.js'),
    'ops/field/src/handwritten/open-shift.command.ts',
    ['OpenShiftCommand', 'OpenMobileShiftCommand', 'OpenShiftService'],
    ['execute', 'open', 'handle'],
    dependencies,
    body,
  );
}

function closeShift(
  dependencies: unknown,
  shiftId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/close-shift.command.js'),
    'ops/field/src/handwritten/close-shift.command.ts',
    ['CloseShiftCommand', 'CloseMobileShiftCommand', 'CloseShiftService'],
    ['execute', 'close', 'handle'],
    dependencies,
    shiftId,
    body,
  );
}

async function seedHomologationAndVersion(): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  const homologationId = randomUUID();
  await client.query(
    `insert into ops.ops_homologation
       (id, tenant_id, traffic_agency_id, homologation_number, scope, issued_at,
        valid_until, status, laudo_emitido_em, laudo_valido_ate)
     values ($1, $2, $3, 'HOM-2025-0001', 'Talão eletrônico', '2025-12-01',
             '2029-12-31', 'active', '2025-12-01', '2029-12-31')`,
    [homologationId, tenantId, field.agencyId],
  );
  await client.query(
    `insert into ops.ops_application_version
       (id, tenant_id, app_type, version, status, homologation_id, valid_from)
     values ($1, $2, 'mobile', $3, 'active', $4, '2026-01-01')`,
    [randomUUID(), tenantId, APP_VERSION, homologationId],
  );
  await client.query(
    `insert into inf.normative_mobile_package
       (id, tenant_id, traffic_agency_id, catalog_id, package_version,
        manifest_hash, package_uri, published_at, valid_until, status)
     values ($1, $2, $3, $4, '2026.1', 'sha256:isolated-package',
             'https://fixtures.invalid/teat/2026.1',
             '2026-09-14T10:00:00-04:00', '2026-12-31', 'published')`,
    [
      randomUUID(),
      tenantId,
      field.agencyId,
      '00000000-0000-7000-8000-0000e0000001',
    ],
  );
}

async function shiftRow(id: string) {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const result = await client.query<Record<string, unknown>>(
    `select id, status, ended_at, device_id from ops.ops_shift where id = $1`,
    [id],
  );
  return result.rows[0];
}

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(client, 'shift-lifecycle');
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
  field = await seedField(client, tenantId, actorId);
  await seedHomologationAndVersion();
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

beforeEach(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query('delete from ops.sync_queue_item where tenant_id = $1', [
    tenantId,
  ]);
  await client.query(
    'delete from ops.numbering_consumption where tenant_id = $1',
    [tenantId],
  );
  await client.query(
    'delete from ops.numbering_reservation where tenant_id = $1',
    [tenantId],
  );
  await client.query('delete from ops.ops_device_event where tenant_id = $1', [
    tenantId,
  ]);
  await client.query('delete from integration.outbox where tenant_id = $1', [
    tenantId,
  ]);
  await client.query(
    `delete from ops.ops_shift where tenant_id = $1 and id <> $2`,
    [tenantId, field.shiftId],
  );
  await client.query(
    `update ops.ops_shift set status = 'open', ended_at = null, device_id = $2
      where id = $1`,
    [field.shiftId, field.deviceId],
  );
});

async function insertReservation(
  status: string,
  startNumber: number,
): Promise<string> {
  const id = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
        idempotency_key, start_number, end_number, valid_until, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
             '2026-12-31T23:59:59-04:00', $11)`,
    [
      id,
      tenantId,
      field.rangeId,
      field.agencyId,
      field.agentId,
      field.deviceId,
      field.shiftId,
      `res-${id.slice(0, 8)}`,
      startNumber,
      startNumber + 1,
      status,
    ],
  );
  return id;
}

describe('CTG-0002 §5.4 — abertura de turno (M10) (C-0002-35)', () => {
  it('C-0002-35 — dado POST shifts com um turno já open do agente em qualquer device então 409 TEAT.SHIFT_ALREADY_OPEN com shiftId e deviceId', async () => {
    await expect(
      openShift(deps(), {
        device_id: field.otherDeviceId,
        app_version: APP_VERSION,
        operational_unit_id: field.unitId,
        started_at: '2026-09-14T18:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.SHIFT_ALREADY_OPEN',
      status: 409,
      context: expect.objectContaining({
        shiftId: field.shiftId,
        deviceId: field.deviceId,
      }),
    });
  });

  it('§5.4 — dado nenhum turno open quando POST shifts então ops_shift open, ops_device_event shift_open e evento shift.changed · TURNO_ABERTO', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update ops.ops_shift set status = 'closed', ended_at = now() where id = $1`,
      [field.shiftId],
    );
    const created = await openShift(deps(), {
      device_id: field.deviceId,
      app_version: APP_VERSION,
      operational_unit_id: field.unitId,
      started_at: '2026-09-14T18:00:00.000Z',
    });
    expect(created).toMatchObject({
      status: 'open',
      device_id: field.deviceId,
    });
    const events = await client.query<{ event_type: string }>(
      `select event_type from ops.ops_device_event where tenant_id = $1`,
      [tenantId],
    );
    expect(events.rows.map((row) => row.event_type)).toContain('shift_open');
    expect(await outboxEnvelopes(client, tenantId)).toContainEqual(
      expect.objectContaining({
        type: 'shift.changed',
        domainEvent: 'TURNO_ABERTO',
      }),
    );
  });

  it('§5.4 — dado o device …blocked (status ≠ authorized) quando POST shifts então 403 TEAT.DEVICE_NOT_AUTHORIZED com deviceId e status', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update ops.ops_shift set status = 'closed', ended_at = now() where id = $1`,
      [field.shiftId],
    );
    await client.query(
      `update ops.ops_operational_device set status = 'blocked' where id = $1`,
      [field.otherDeviceId],
    );
    await expect(
      openShift(deps(), {
        device_id: field.otherDeviceId,
        app_version: APP_VERSION,
        operational_unit_id: field.unitId,
        started_at: '2026-09-14T18:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.DEVICE_NOT_AUTHORIZED',
      status: 403,
      context: expect.objectContaining({ deviceId: field.otherDeviceId }),
    });
    await client.query(
      `update ops.ops_operational_device set status = 'authorized' where id = $1`,
      [field.otherDeviceId],
    );
  });
});

describe('CTG-0002 §5.5 — fechamento de turno (M10) (C-0002-36/37)', () => {
  async function insertPendingQueueItem(): Promise<void> {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `insert into ops.sync_queue_item
         (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
          local_entity_id, status, created_locally_at, idempotency_key,
          payload_hash, payload_json)
       values ($1, $2, $3, $4, $5, 'ait', $6, 'received',
               '2026-09-14T10:00:00-04:00', $7, 'sha256:pending', '{}'::jsonb)`,
      [
        randomUUID(),
        tenantId,
        field.agencyId,
        field.deviceId,
        field.agentId,
        randomUUID(),
        `pending-${randomUUID().slice(0, 8)}`,
      ],
    );
  }

  it('C-0002-36 — dado POST shifts/{id}/close com item received do device dentro do turno e sem reason então 422 TEAT.SHIFT_CLOSE_PENDING_QUEUE com context.pendingCount', async () => {
    await insertPendingQueueItem();
    await expect(
      closeShift(deps(), field.shiftId, {
        device_id: field.deviceId,
        app_version: APP_VERSION,
        ended_at: '2026-09-14T18:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.SHIFT_CLOSE_PENDING_QUEUE',
      status: 422,
      context: expect.objectContaining({ pendingCount: 1 }),
    });
    expect((await shiftRow(field.shiftId))?.status).toBe('open');
  });

  it('C-0002-36 — dado o mesmo fechamento **com** reason então fecha e o evento TURNO_FECHADO carrega pendingCount', async () => {
    await insertPendingQueueItem();
    const closed = await closeShift(deps(), field.shiftId, {
      device_id: field.deviceId,
      app_version: APP_VERSION,
      ended_at: '2026-09-14T18:00:00.000Z',
      reason: 'Fim de escala com fila pendente declarada',
    });
    expect(closed).toMatchObject({ id: field.shiftId, status: 'closed' });
    expect((await shiftRow(field.shiftId))?.status).toBe('closed');
    expect(await outboxEnvelopes(client, tenantId)).toContainEqual(
      expect.objectContaining({
        type: 'shift.changed',
        domainEvent: 'TURNO_FECHADO',
        data: expect.objectContaining({ pendingCount: 1 }),
      }),
    );
  });

  it('§5.5 — dado um turno que não está open então 409 TEAT.SHIFT_NOT_OPEN', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update ops.ops_shift set status = 'closed', ended_at = now() where id = $1`,
      [field.shiftId],
    );
    await expect(
      closeShift(deps(), field.shiftId, {
        device_id: field.deviceId,
        app_version: APP_VERSION,
        ended_at: '2026-09-14T18:00:00.000Z',
      }),
    ).rejects.toMatchObject({ code: 'TEAT.SHIFT_NOT_OPEN', status: 409 });
  });

  it('C-0002-37 — dado o fechamento com uma reserva que teve consumo aplicado então ela vai a consumed', async () => {
    const reservationId = await insertReservation('reserved', 2026000010);
    await client.query(
      `insert into ops.numbering_consumption
         (tenant_id, reservation_id, range_id, number, local_entity_id,
          idempotency_key, server_entity_id, finalized_at, status)
       values ($1, $2, $3, 2026000010, $4, $5, $6, now(), 'aplicado')`,
      [
        tenantId,
        reservationId,
        field.rangeId,
        randomUUID(),
        `applied-${randomUUID().slice(0, 8)}`,
        randomUUID(),
      ],
    );
    const closed = await closeShift(deps(), field.shiftId, {
      device_id: field.deviceId,
      app_version: APP_VERSION,
      ended_at: '2026-09-14T18:00:00.000Z',
    });
    expect(closed.reservations).toContainEqual(
      expect.objectContaining({ id: reservationId, status: 'consumed' }),
    );
    const row = await client.query<{ status: string }>(
      'select status from ops.numbering_reservation where id = $1',
      [reservationId],
    );
    expect(row.rows[0]?.status).toBe('consumed');
  });

  it('C-0002-37 — dado o fechamento sem nenhum consumo aplicado então a reserva vai a cancelled, com a cauda devolvida à faixa', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update ops.ait_numbering_range set next_number = 2026000022 where id = $1`,
      [field.rangeId],
    );
    const reservationId = await insertReservation('reserved', 2026000020);
    const closed = await closeShift(deps(), field.shiftId, {
      device_id: field.deviceId,
      app_version: APP_VERSION,
      ended_at: '2026-09-14T18:00:00.000Z',
    });
    expect(closed.reservations).toContainEqual(
      expect.objectContaining({ id: reservationId, status: 'cancelled' }),
    );
    const range = await client.query<{ next_number: string; status: string }>(
      'select next_number::text, status from ops.ait_numbering_range where id = $1',
      [field.rangeId],
    );
    expect(range.rows[0]?.next_number).toBe('2026000020');
    expect(range.rows[0]?.status).toBe('active');
  });
});
