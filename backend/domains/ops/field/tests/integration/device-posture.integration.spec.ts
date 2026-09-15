import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

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
 * CTG-0002 §5.9 e §10 (R-0008, TASK-0004) — C-0002-38: postura do dispositivo
 * (`block` · `unblock` · `wipe`, technical-admin) e o efeito sobre as reservas
 * `reserved` do device. `unblock` **não** publica evento: o route contract §8
 * não tem token para ele (CTG-0002 §11.8/OD-T21).
 *
 * `device-posture.command.ts` nasce em TASK-0005 (CTG-0002 §11).
 */

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let field: Awaited<ReturnType<typeof seedField>>;

function deps() {
  return commandDeps(client, tenantId, actorId, {
    clock: { now: () => '2026-09-14T18:00:00.000Z' },
  });
}

/**
 * O contrato fixa o arquivo, nunca o símbolo: o carregador procura primeiro um
 * método com o nome do ato (`block`/`unblock`/`wipe`) e cai num `execute`
 * genérico, ao qual o ato vai como terceiro argumento.
 */
function posture(
  action: 'block' | 'unblock' | 'wipe',
  dependencies: unknown,
  deviceId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/device-posture.command.js'),
    'ops/field/src/handwritten/device-posture.command.ts',
    ['DevicePostureCommand', 'DevicePosture', 'DevicePostureService'],
    [action, 'execute', 'handle'],
    dependencies,
    deviceId,
    body,
    action,
  );
}

async function deviceRow(id: string) {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const result = await client.query<{ status: string }>(
    'select status from ops.ops_operational_device where id = $1',
    [id],
  );
  return result.rows[0];
}

async function insertReservation(status: string): Promise<string> {
  const id = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
        idempotency_key, start_number, end_number, valid_until, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 2026000030, 2026000031,
             '2026-12-31T23:59:59-04:00', $9)`,
    [
      id,
      tenantId,
      field.rangeId,
      field.agencyId,
      field.agentId,
      field.deviceId,
      field.shiftId,
      `posture-${id.slice(0, 8)}`,
      status,
    ],
  );
  return id;
}

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(client, 'device-posture');
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
  field = await seedField(client, tenantId, actorId);
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

beforeEach(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
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
    `update ops.ops_operational_device set status = 'authorized' where tenant_id = $1`,
    [tenantId],
  );
});

describe('CTG-0002 §5.9 — postura do dispositivo (C-0002-38)', () => {
  it('C-0002-38 — dado POST devices/{id}/block então status blocked, as reservas reserved do device vão a blocked e sai device.posture-changed · DISPOSITIVO_BLOQUEADO', async () => {
    const reservationId = await insertReservation('reserved');
    const response = await posture('block', deps(), field.deviceId, {
      reason: 'Suspeita de adulteração relatada pela supervisão',
    });
    expect(response).toMatchObject({ id: field.deviceId, status: 'blocked' });
    expect((await deviceRow(field.deviceId))?.status).toBe('blocked');
    const reservation = await client.query<{ status: string }>(
      'select status from ops.numbering_reservation where id = $1',
      [reservationId],
    );
    expect(reservation.rows[0]?.status).toBe('blocked');
    const events = await client.query<{ event_type: string }>(
      'select event_type from ops.ops_device_event where tenant_id = $1',
      [tenantId],
    );
    expect(events.rows.map((row) => row.event_type)).toContain('block');
    expect(await outboxEnvelopes(client, tenantId)).toContainEqual(
      expect.objectContaining({
        type: 'device.posture-changed',
        domainEvent: 'DISPOSITIVO_BLOQUEADO',
        data: expect.objectContaining({
          deviceId: field.deviceId,
          toStatus: 'blocked',
        }),
      }),
    );
  });

  it('C-0002-38 — dado unblock de um device blocked então status volta a authorized e nenhum evento é publicado (§8 não tem token para unblock, OD-T21)', async () => {
    await client.query(
      `update ops.ops_operational_device set status = 'blocked' where id = $1`,
      [field.deviceId],
    );
    await client.query('delete from integration.outbox where tenant_id = $1', [
      tenantId,
    ]);
    const response = await posture('unblock', deps(), field.deviceId, {
      reason: 'Perícia concluída sem indício de adulteração',
    });
    expect(response).toMatchObject({
      id: field.deviceId,
      status: 'authorized',
    });
    expect((await deviceRow(field.deviceId))?.status).toBe('authorized');
    expect(await outboxEnvelopes(client, tenantId)).toEqual([]);
  });

  it('§5.9 — dado unblock de um device que não está blocked então 409 TEAT.DEVICE_BLOCKED com deviceId e status', async () => {
    await expect(
      posture('unblock', deps(), field.deviceId, {
        reason: 'Tentativa de desbloqueio sobre device autorizado',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.DEVICE_BLOCKED',
      status: 409,
      context: expect.objectContaining({
        deviceId: field.deviceId,
        status: 'authorized',
      }),
    });
  });

  it('§5.9/§11.10 — dado wipe então o device fica blocked (não existe token wiped em nenhuma fonte, source_pending) e o ops_device_event de wipe registra o recibo', async () => {
    const response = await posture('wipe', deps(), field.deviceId, {
      reason: 'Perda do equipamento em campo',
    });
    expect(response).toMatchObject({ id: field.deviceId, status: 'blocked' });
    const events = await client.query<{
      event_type: string;
      details_json: Record<string, unknown>;
    }>(
      'select event_type, details_json from ops.ops_device_event where tenant_id = $1',
      [tenantId],
    );
    const wipe = events.rows.find((row) => row.event_type === 'wipe');
    expect(wipe).toBeDefined();
    expect(wipe?.details_json).toMatchObject({
      receiptId: expect.anything(),
    });
    expect(await outboxEnvelopes(client, tenantId)).toContainEqual(
      expect.objectContaining({ domainEvent: 'DISPOSITIVO_BLOQUEADO' }),
    );
  });

  it('§5.9 — dado reason vazio então 422 TEAT.VALIDATION_FAILED com fields[]', async () => {
    await expect(
      posture('block', deps(), field.deviceId, { reason: '' }),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
      context: expect.objectContaining({ fields: expect.any(Array) }),
    });
  });
});
