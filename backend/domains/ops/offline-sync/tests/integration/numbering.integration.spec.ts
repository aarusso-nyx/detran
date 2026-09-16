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
  FIXTURES,
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
 * CTG-0002 §2, §3, §5.10…§5.12 e §10 (R-0008, TASK-0004) — C-0002-31…34:
 * `reserve` idempotente, faixa esgotada, reserva ativa concorrente,
 * `reconcile` e `GET consumption`. Inclui a alocação atômica de M8 (duas
 * transações concorrentes na mesma faixa não se sobrepõem) e o TTL de 72 h
 * de `teat.numbering.reservation_ttl_hours` (H.54, lido pelo ParameterService,
 * nunca constante no código).
 *
 * Adenda do maestro (CTG-0002 §12, 2026-09-15): com o delta
 * `BP-OPS-OFFLINE-SYNC-001` v1.1.0 as colunas de ato de
 * `ops.numbering_consumption` são anuláveis, então `reconcile` grava **uma
 * linha por número do intervalo** (`aplicado`, `consumido_localmente`,
 * `disponivel`) — é isso que C-0002-34 exige.
 */

const client: pg.Client = newClient();
const secondClient: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let field: Awaited<ReturnType<typeof seedField>>;

const RESERVE_EXPORTS = [
  'ReserveNumberingCommand',
  'ReserveNumbering',
  'ReserveNumberingService',
];
const RECONCILE_EXPORTS = [
  'ReconcileNumberingCommand',
  'ReconcileNumbering',
  'ReconcileNumberingService',
];

/** TTL vigente de `teat.numbering.reservation_ttl_hours` (H.54): 72 horas. */
const RESERVATION_TTL_HOURS = 72;

function parameters(values: Record<string, unknown>) {
  return {
    get: vi.fn(async (key: string) => ({
      key,
      value_json: values[key] ?? null,
      source_pending: !(key in values),
    })),
  };
}

function reserve(
  dependencies: unknown,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/reserve-numbering.command.js'),
    'ops/offline-sync/src/handwritten/reserve-numbering.command.ts',
    RESERVE_EXPORTS,
    ['execute', 'reserve', 'handle'],
    dependencies,
    body,
  );
}

function reconcile(
  dependencies: unknown,
  reservationId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/reconcile-numbering.command.js'),
    'ops/offline-sync/src/handwritten/reconcile-numbering.command.ts',
    RECONCILE_EXPORTS,
    ['execute', 'reconcile', 'handle'],
    dependencies,
    reservationId,
    body,
  );
}

function consumption(
  dependencies: unknown,
  reservationId: string,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/reconcile-numbering.command.js'),
    'ops/offline-sync/src/handwritten/reconcile-numbering.command.ts (GET …/{id}/consumption)',
    ['NumberingConsumptionQuery', ...RECONCILE_EXPORTS],
    ['consumption', 'readConsumption', 'list'],
    dependencies,
    reservationId,
  );
}

const SETTLE_EXPORTS = [
  'SettleNumberingCommand',
  'SettleNumbering',
  'SettleNumberingService',
];

/**
 * `cancel` · `block` · `close` (§5.11) vivem no mesmo arquivo: o carregador
 * procura primeiro um método com o nome do ato e cai num `execute` genérico,
 * ao qual o ato vai como terceiro argumento.
 */
function settle(
  action: 'cancel' | 'block' | 'close',
  dependencies: unknown,
  reservationId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/settle-numbering.command.js'),
    'ops/offline-sync/src/handwritten/settle-numbering.command.ts',
    SETTLE_EXPORTS,
    [action, 'execute', 'handle'],
    dependencies,
    reservationId,
    body,
    action,
  );
}

function reserveBody(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    traffic_agency_id: field.agencyId,
    agent_id: field.agentId,
    device_id: field.deviceId,
    shift_id: field.shiftId,
    idempotency_key: `reserve-${randomUUID().slice(0, 8)}`,
    range_id: field.rangeId,
    requested_size: 1,
    ...overrides,
  };
}

async function rangeRow(rangeId: string) {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const result = await client.query<{
    next_number: string;
    end_number: string;
    status: string;
  }>(
    `select next_number::text, end_number::text, status
       from ops.ait_numbering_range where id = $1`,
    [rangeId],
  );
  return result.rows[0];
}

async function reservationRows(rangeId: string) {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const result = await client.query<Record<string, unknown>>(
    `select id, start_number::text as start_number, end_number::text as end_number,
            status, valid_until, idempotency_key
       from ops.numbering_reservation where range_id = $1 order by start_number`,
    [rangeId],
  );
  return result.rows;
}

beforeAll(async () => {
  await client.connect();
  await secondClient.connect();
  const isolated = await isolatedTenant(client, 'numbering');
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
  field = await seedField(client, tenantId, actorId);
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
  await secondClient.end();
});

beforeEach(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    'delete from ops.numbering_consumption where tenant_id = $1',
    [tenantId],
  );
  await client.query(
    'delete from ops.numbering_reservation where tenant_id = $1',
    [tenantId],
  );
  await client.query(
    `update ops.ait_numbering_range
        set next_number = start_number, status = 'active'
      where tenant_id = $1`,
    [tenantId],
  );
});

describe('CTG-0002 §5.10 — reserve (M8) (C-0002-31…33)', () => {
  it('C-0002-31 — dado reserve com a mesma idempotency_key duas vezes então uma única numbering_reservation e a faixa avança next_number uma vez', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const body = reserveBody();
    const first = await reserve(deps, body);
    const second = await reserve(deps, body);
    expect(second.id).toBe(first.id);
    const rows = await reservationRows(field.rangeId);
    expect(rows).toHaveLength(1);
    expect((await rangeRow(field.rangeId))?.next_number).toBe('2026000002');
  });

  it('§5.10 — dado reserve sem requested_size então o default é 1 (origem) e start_number = end_number', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const body = reserveBody();
    delete body.requested_size;
    const created = await reserve(deps, body);
    expect(created.start_number).toBe(created.end_number);
  });

  it('§5.10 — dado reserve sem valid_until então valid_until = agora + teat.numbering.reservation_ttl_hours (72 h, relógio fixo), lido do ParameterService e nunca de constante no código', async () => {
    const now = new Date('2026-09-14T14:00:00.000Z');
    const params = parameters({
      'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
    });
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: params,
      clock: { now: () => now.toISOString() },
    });
    const created = await reserve(deps, reserveBody());
    expect(params.get).toHaveBeenCalledWith(
      'teat.numbering.reservation_ttl_hours',
      expect.anything(),
    );
    expect(new Date(created.valid_until as string).toISOString()).toBe(
      new Date(
        now.getTime() + RESERVATION_TTL_HOURS * 60 * 60 * 1000,
      ).toISOString(),
    );
  });

  it('§5.10/M8 — dadas duas reservas concorrentes na mesma faixa, em transações distintas, então os subintervalos não se sobrepõem (alocação atômica com select … for update)', async () => {
    const depsA = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const depsB = commandDeps(secondClient, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const [left, right] = await Promise.all([
      reserve(
        depsA,
        reserveBody({ requested_size: 5, device_id: field.deviceId }),
      ),
      reserve(
        depsB,
        reserveBody({ requested_size: 5, device_id: field.otherDeviceId }),
      ),
    ]);
    const intervals = [left, right]
      .map((row) => [Number(row.start_number), Number(row.end_number)])
      .sort((a, b) => a[0]! - b[0]!);
    expect(intervals[0]![1]!).toBeLessThan(intervals[1]![0]!);
  });

  it('C-0002-32 — dada a faixa com next_number = end_number quando reserve com requested_size 1 então a reserva é criada, a faixa vai a exhausted e next_number permanece end_number (check ck_ops_ait_numbering_range_bounds)', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update ops.ait_numbering_range set next_number = end_number where id = $1`,
      [field.rangeId],
    );
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const created = await reserve(deps, reserveBody());
    expect(created.status).toBe('reserved');
    const range = await rangeRow(field.rangeId);
    expect(range?.status).toBe('exhausted');
    expect(range?.next_number).toBe(range?.end_number);
  });

  it('C-0002-32 — dada a faixa exhausted quando reserve de novo então 422 TEAT.NUMBERING_RANGE_EXHAUSTED com rangeId e series', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update ops.ait_numbering_range
          set next_number = end_number, status = 'exhausted' where id = $1`,
      [field.rangeId],
    );
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    await expect(
      reserve(deps, reserveBody({ device_id: field.otherDeviceId })),
    ).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_RANGE_EXHAUSTED',
      status: 422,
      context: expect.objectContaining({ rangeId: field.rangeId, series: 'F' }),
    });
  });

  it('C-0002-33 — dada uma reserva reserved para device+shift quando reserve de novo com chave diferente então 409 TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS com context.reservationId', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const existing = await reserve(deps, reserveBody());
    await expect(reserve(deps, reserveBody())).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
      status: 409,
      context: expect.objectContaining({ reservationId: existing.id }),
    });
  });

  it('§7 — dado reserve bem-sucedido então sai um envelope numbering.reservation.changed · NUMERACAO_RESERVADA com status reserved', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    await reserve(deps, reserveBody());
    const envelopes = await outboxEnvelopes(client, tenantId);
    expect(envelopes).toContainEqual(
      expect.objectContaining({
        type: 'numbering.reservation.changed',
        domainEvent: 'NUMERACAO_RESERVADA',
        aggregate: expect.objectContaining({ kind: 'numbering-reservation' }),
      }),
    );
  });
});

describe('CTG-0002 §5.12 e §12 (adenda) — reconcile e consumption (C-0002-34)', () => {
  it('C-0002-34 — dado reconcile com um número fora do intervalo então 422 TEAT.NUMBERING_RECONCILE_MISMATCH com context.outOfRange', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const created = await reserve(deps, reserveBody({ requested_size: 3 }));
    await expect(
      reconcile(deps, created.id as string, {
        user_ref: actorId,
        claimed_numbers: [Number(created.start_number), 2026009999],
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_RECONCILE_MISMATCH',
      status: 422,
      context: expect.objectContaining({ outOfRange: [2026009999] }),
    });
  });

  it('C-0002-34 — dado reconcile dentro do intervalo então há uma linha de numbering_consumption por número, com aplicado, consumido_localmente e disponivel conforme o caso (§12 adenda, M8)', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const created = await reserve(deps, reserveBody({ requested_size: 3 }));
    const start = Number(created.start_number);
    // O primeiro número já tem AIT aplicado no servidor; o segundo é
    // reclamado pelo dispositivo sem ato; o terceiro não é reclamado.
    const aitId = randomUUID();
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `insert into inf.ait_ait
         (id, tenant_id, traffic_agency_id, ait_number, series, agent_id, shift_id,
          device_id, framing_id, catalog_id, infraction_at, issued_at,
          issuance_mode, constatation_type, had_approach, location_description,
          uf, current_status, content_hash)
       values ($1, $2, $3, $4, 'F', $5, $6, $7, $8, $9,
               '2026-09-14T13:00:00-04:00', '2026-09-14T13:05:00-04:00',
               'eletronico', 'abordagem', true, 'Av. Djalma Batista', 'AM',
               'RECEBIDO', 'sha256:reconcile')`,
      [
        aitId,
        tenantId,
        field.agencyId,
        String(start),
        field.agentId,
        field.shiftId,
        field.deviceId,
        FIXTURES.framingId,
        FIXTURES.catalogId,
      ],
    );
    await client.query(
      `insert into ops.numbering_consumption
         (tenant_id, reservation_id, range_id, number, local_entity_id,
          idempotency_key, server_entity_id, finalized_at, status)
       values ($1, $2, $3, $4, $5, $6, $7, now(), 'aplicado')`,
      [
        tenantId,
        created.id,
        field.rangeId,
        start,
        randomUUID(),
        `applied-${randomUUID().slice(0, 8)}`,
        aitId,
      ],
    );
    const response = await reconcile(deps, created.id as string, {
      user_ref: actorId,
      claimed_numbers: [start, start + 1],
    });
    const rows = (response.consumption ?? []) as {
      number: number;
      status: string;
    }[];
    expect(rows.map((row) => row.status)).toEqual([
      'aplicado',
      'consumido_localmente',
      'disponivel',
    ]);
    expect(response.missing_on_server).toEqual([start + 1]);
    expect(response.unexpected_on_server).toEqual([]);
    const persisted = await client.query<{ count: string }>(
      `select count(*)::text as count from ops.numbering_consumption
        where tenant_id = $1 and reservation_id = $2`,
      [tenantId, created.id],
    );
    expect(Number(persisted.rows[0]!.count)).toBe(3);
  });

  it('§5.12 — dado GET …/{id}/consumption então as linhas saem em ordem number asc, com server_entity_id e finalized_at', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    const created = await reserve(deps, reserveBody({ requested_size: 3 }));
    await reconcile(deps, created.id as string, {
      user_ref: actorId,
      claimed_numbers: [],
    });
    const response = await consumption(deps, created.id as string);
    const rows = (response.consumption ?? []) as { number: number }[];
    expect(rows.map((row) => Number(row.number))).toEqual(
      [...rows.map((row) => Number(row.number))].sort((a, b) => a - b),
    );
    expect(response.reservation_id).toBe(created.id);
  });

  it('§5.12 — dado reconcile sobre uma reserva de outro tenant então 404 TEAT.TENANT_MISMATCH', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
    await expect(
      reconcile(deps, FIXTURES.reservationReserved, {
        user_ref: actorId,
        claimed_numbers: [],
      }),
    ).rejects.toMatchObject({ code: 'TEAT.TENANT_MISMATCH', status: 404 });
  });
});

/**
 * CTG-0002 §2 (matriz "estados não admitidos") e §5.11 — `cancel`, `block` e
 * `close`. Não há `TEAT.NUMBERING_RESERVATION_STATE_INVALID` no catálogo
 * (§11.12/OD-T29): transição inválida de reserva usa 422
 * `TEAT.VALIDATION_FAILED` com `fields:[{ path:'status', rule:'transition' }]`.
 * Os dados de liquidação vão em `reconciliation_json.lifecycle`, porque a
 * tabela não tem colunas de motivo/data (§11.11).
 */
describe('CTG-0002 §2/§5.11 — cancel, block e close da reserva (M8)', () => {
  function settleDeps() {
    return commandDeps(client, tenantId, actorId, {
      parameters: parameters({
        'teat.numbering.reservation_ttl_hours': RESERVATION_TTL_HOURS,
      }),
    });
  }

  async function reservationRow(id: string) {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const result = await client.query<{
      status: string;
      reconciliation_json: Record<string, unknown> | null;
    }>(
      'select status, reconciliation_json from ops.numbering_reservation where id = $1',
      [id],
    );
    return result.rows[0];
  }

  it('§5.11 — dada uma reserva reserved na cauda da faixa quando cancel então status cancelled, a cauda volta à faixa e reconciliation_json.lifecycle registra o ato', async () => {
    const deps = settleDeps();
    const created = await reserve(deps, reserveBody({ requested_size: 3 }));
    const response = await settle('cancel', deps, created.id as string, {
      user_ref: actorId,
      reason: 'Turno encerrado sem uso dos números',
    });
    expect(response).toMatchObject({ id: created.id, status: 'cancelled' });
    const row = await reservationRow(created.id as string);
    expect(row?.status).toBe('cancelled');
    expect(row?.reconciliation_json).toMatchObject({
      lifecycle: expect.objectContaining({ action: 'cancel' }),
    });
    expect((await rangeRow(field.rangeId))?.next_number).toBe(
      String(created.start_number),
    );
  });

  it('§5.11 — dada uma reserva integralmente consumida quando cancel então 422 TEAT.VALIDATION_FAILED com fields[{path:status, rule:fully_consumed}]', async () => {
    const deps = settleDeps();
    const created = await reserve(deps, reserveBody({ requested_size: 1 }));
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `insert into ops.numbering_consumption
         (tenant_id, reservation_id, range_id, number, local_entity_id,
          idempotency_key, server_entity_id, finalized_at, status)
       values ($1, $2, $3, $4, $5, $6, $7, now(), 'aplicado')`,
      [
        tenantId,
        created.id,
        field.rangeId,
        Number(created.start_number),
        randomUUID(),
        `consumed-${randomUUID().slice(0, 8)}`,
        randomUUID(),
      ],
    );
    await expect(
      settle('cancel', deps, created.id as string, {
        user_ref: actorId,
        reason: 'Tentativa de cancelar reserva integralmente consumida',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
      context: expect.objectContaining({
        fields: [
          expect.objectContaining({ path: 'status', rule: 'fully_consumed' }),
        ],
      }),
    });
  });

  it('§5.11 — dada uma reserva reserved quando block então status blocked; repetir o block é idempotente', async () => {
    const deps = settleDeps();
    const created = await reserve(deps, reserveBody());
    const body = {
      user_ref: actorId,
      reason: 'Bloqueio administrativo do lote de números',
    };
    const first = await settle('block', deps, created.id as string, body);
    expect(first).toMatchObject({ id: created.id, status: 'blocked' });
    const second = await settle('block', deps, created.id as string, body);
    expect(second).toMatchObject({ id: created.id, status: 'blocked' });
    expect((await reservationRow(created.id as string))?.status).toBe(
      'blocked',
    );
  });

  it('§5.11 — dada uma reserva reserved quando close então status consumed', async () => {
    const deps = settleDeps();
    const created = await reserve(deps, reserveBody());
    const response = await settle('close', deps, created.id as string, {
      user_ref: actorId,
      reason: 'Fechamento do turno com os números liquidados',
    });
    expect(response).toMatchObject({ id: created.id, status: 'consumed' });
    expect((await reservationRow(created.id as string))?.status).toBe(
      'consumed',
    );
  });

  it('§2 — dada uma reserva cancelled quando block então 422 TEAT.VALIDATION_FAILED com fields[{path:status, rule:transition}] (o catálogo não tem NUMBERING_RESERVATION_STATE_INVALID, OD-T29)', async () => {
    const deps = settleDeps();
    const created = await reserve(deps, reserveBody());
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update ops.numbering_reservation set status = 'cancelled' where id = $1`,
      [created.id],
    );
    await expect(
      settle('block', deps, created.id as string, {
        user_ref: actorId,
        reason: 'Bloqueio sobre reserva já cancelada',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
      context: expect.objectContaining({
        fields: [
          expect.objectContaining({ path: 'status', rule: 'transition' }),
        ],
      }),
    });
  });

  it('§2 — dada uma reserva blocked quando close então 422 TEAT.VALIDATION_FAILED com fields[{path:status, rule:transition}]', async () => {
    const deps = settleDeps();
    const created = await reserve(deps, reserveBody());
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update ops.numbering_reservation set status = 'blocked' where id = $1`,
      [created.id],
    );
    await expect(
      settle('close', deps, created.id as string, {
        user_ref: actorId,
        reason: 'Fechamento sobre reserva bloqueada',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
      context: expect.objectContaining({
        fields: [
          expect.objectContaining({ path: 'status', rule: 'transition' }),
        ],
      }),
    });
  });

  it('§7 — dado cancel bem-sucedido então sai numbering.reservation.changed · NUMERACAO_RESERVADA com action cancel', async () => {
    const deps = settleDeps();
    const created = await reserve(deps, reserveBody());
    await settle('cancel', deps, created.id as string, {
      user_ref: actorId,
      reason: 'Turno encerrado sem uso dos números',
    });
    expect(await outboxEnvelopes(client, tenantId)).toContainEqual(
      expect.objectContaining({
        type: 'numbering.reservation.changed',
        domainEvent: 'NUMERACAO_RESERVADA',
        data: expect.objectContaining({
          reservationId: created.id,
          action: 'cancel',
        }),
      }),
    );
  });
});
