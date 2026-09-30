import { createHash, randomUUID } from 'node:crypto';
import pg from 'pg';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/**
 * CTG-0002 §4.5, §4.6 e §10 (R-0008, TASK-0004) — C-0002-39…42: o applier `ait`
 * (M7). Guarda de numeração na ordem da §4.6 (reserva do device → turno →
 * validade → número já aplicado), efeito de domínio (`RECEBIDO`,
 * `receipt_protocol`, `numbering_consumption('aplicado')`, duas linhas de
 * `ait_status_history`) e o evento `AIT_RECEBIDO`.
 *
 * `backend/domains/inf/ait/src/handwritten/sync-applier.ts` nasce em TASK-0005
 * (CTG-0002 §11): o módulo é carregado por `import()` dinâmico dentro de cada
 * teste, para que o arquivo colete e cada caso falhe isolado, pelo
 * comportamento ausente.
 *
 * O contrato **fixa** a porta (`SyncEntityApplier` em `@detran/ops-core`,
 * §4.8): `entityType`, `validate(payload)` e `apply(item, tx)` com
 * `SyncEntityApplierItem { id, tenantId, trafficAgencyId, deviceId, agentId,
 * entityType, localEntityId, idempotencyKey, payloadHash, createdLocallyAt,
 * concurrencySuspect, receiptId }`. Como o item **não** carrega o payload, o
 * applier o lê de `ops.sync_queue_item.payload_json` pela transação — por isso
 * cada teste grava a linha da fila e o recibo antes de chamar `apply`.
 * Proposta do Inspector, não valor canônico: só o nome do símbolo exportado e
 * a forma do objeto de dependências do construtor.
 */

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });

/** Fixtures canônicas (25/26-fixtures-teat*.sql, 10-fixtures-inf-ait.sql). */
const FIXTURES = {
  tenantId: '00000000-0000-7000-8000-00000000a001',
  agencyId: '00000000-0000-7000-8000-0000e2000001',
  agentId: '00000000-0000-4000-8000-0000b0000001',
  deviceId: '00000000-0000-7000-8000-0000e4000002',
  shiftOpen: '00000000-0000-7000-8000-0000e3000001',
  shiftClosed: '00000000-0000-7000-8000-0000e3000002',
  rangeId: '00000000-0000-7000-8000-0000e5000001',
  reservationReserved: '00000000-0000-7000-8000-0000e6000001',
  reservationConsumed: '00000000-0000-7000-8000-0000e6000002',
  reservationExpired: '00000000-0000-7000-8000-0000e6000003',
  aitReceived: '00000000-0000-7000-8000-0000f8000060',
  framingId: '00000000-0000-7000-8000-0000e1000001',
  catalogId: '00000000-0000-7000-8000-0000e0000001',
} as const;

const CREATED_LOCALLY_AT = '2026-09-14T13:05:00.000Z';

let isolated: { tenantId: string; actorId: string };
let isolatedField: {
  agencyId: string;
  unitId: string;
  agentId: string;
  deviceId: string;
  shiftId: string;
  rangeId: string;
  reservationId: string;
};

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function canonicalHash(payload: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
}

/** Payload canônico do `ait` (CTG-0002 §4.5). */
function aitPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ait: {
      traffic_agency_id: FIXTURES.agencyId,
      ait_number: '2026000001',
      series: 'F',
      agent_id: FIXTURES.agentId,
      shift_id: FIXTURES.shiftOpen,
      device_id: FIXTURES.deviceId,
      framing_id: FIXTURES.framingId,
      catalog_id: FIXTURES.catalogId,
      infraction_at: '2026-09-14T13:00:00.000Z',
      issued_at: CREATED_LOCALLY_AT,
      issuance_mode: 'eletronico',
      constatation_type: 'abordagem',
      had_approach: true,
      location_description: 'Av. Djalma Batista, 1000 — Manaus/AM',
      uf: 'AM',
      municipality_code: '1302603',
      content_hash: 'sha256:canonical-applier',
      ...overrides,
    },
    vehicles: [],
    people: [],
    signatures: [],
    print_events: [],
  };
}

interface SqlTransaction {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

function database(tenantId: string, actorId: string) {
  return {
    async tx<T>(work: (transaction: SqlTransaction) => Promise<T>): Promise<T> {
      await client.query('begin');
      try {
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          tenantId,
        ]);
        await client.query(`select set_config('app.actor_id', $1, true)`, [
          actorId,
        ]);
        const result = await work({
          query: client.query.bind(client),
        } as SqlTransaction);
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    },
  };
}

function deps(tenantId: string, actorId: string) {
  const db = database(tenantId, actorId);
  return {
    database: db,
    requestContext: {
      hasActiveContext: () => true,
      snapshot: () => ({ tenantId, actorId }),
    },
    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
    clock: { now: () => '2026-09-14T18:00:00.000Z' },
  };
}

/**
 * `import()` com especificador **variável** de propósito: o módulo só nasce em
 * TASK-0005 e um literal faria `tsc --noEmit` (e portanto `pnpm check`) quebrar
 * com TS2307 antes de o Engineer criar o arquivo. Com a variável, a resolução
 * acontece em tempo de execução, relativa a este arquivo, e a ausência aparece
 * como falha do teste — que é o que o tier pede.
 */
const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

const APPLIER_EXPORTS = [
  'AitSyncApplier',
  'AitSyncEntityApplier',
  'SyncApplier',
] as const;

async function loadApplier(
  tenantId: string,
  actorId: string,
): Promise<{
  entityType: string;
  validate(payload: unknown): { code: string; fields: string[] } | null;
  apply(
    item: Record<string, unknown>,
    tx: SqlTransaction,
  ): Promise<{ serverEntityId: string }>;
}> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule(
      '../../src/handwritten/sync-applier.js',
    )) as Record<string, unknown>;
  } catch (cause) {
    throw new Error(
      'inf/ait/src/handwritten/sync-applier.ts ainda não existe (TASK-0005, CTG-0002 §11)',
      { cause },
    );
  }
  const exported =
    APPLIER_EXPORTS.map((name) => loaded[name]).find(
      (value) => typeof value === 'function',
    ) ?? Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function')
    throw new Error('sync-applier.ts não exporta um applier construtível');
  const Applier = exported as new (dependencies: unknown) => {
    entityType: string;
    validate(payload: unknown): { code: string; fields: string[] } | null;
    apply(
      item: Record<string, unknown>,
      tx: SqlTransaction,
    ): Promise<{ serverEntityId: string }>;
  };
  return new Applier(deps(tenantId, actorId));
}

/**
 * Grava a linha da fila e o recibo `received` que o applier consome, e devolve
 * o `SyncEntityApplierItem` da §4.8.
 */
async function queueItem(
  scope: {
    tenantId: string;
    agencyId: string;
    deviceId: string;
    agentId: string;
  },
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const id = randomUUID();
  const localEntityId = randomUUID();
  const idempotencyKey = `applier-${id.slice(0, 8)}`;
  const payloadHash = canonicalHash(payload);
  await client.query(`select set_config('app.role', 'owner', false)`);
  // `auth.enforce_tenant_id()` compara a linha com `app.tenant_id`: sem fixar
  // o tenant do alvo, o insert herda o do último `set_config` e falha.
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    scope.tenantId,
  ]);
  await client.query(
    `insert into ops.sync_queue_item
       (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
        local_entity_id, status, created_locally_at, idempotency_key,
        payload_hash, payload_json)
     values ($1, $2, $3, $4, $5, 'ait', $6, 'received', $7, $8, $9, $10)`,
    [
      id,
      scope.tenantId,
      scope.agencyId,
      scope.deviceId,
      scope.agentId,
      localEntityId,
      CREATED_LOCALLY_AT,
      idempotencyKey,
      payloadHash,
      JSON.stringify(payload),
    ],
  );
  const receiptId = randomUUID();
  await client.query(
    `insert into ops.sync_receipt
       (id, tenant_id, sync_queue_item_id, idempotency_key, entity_type,
        local_entity_id, accepted_hash, status)
     values ($1, $2, $3, $4, 'ait', $5, $6, 'received')`,
    [receiptId, scope.tenantId, id, idempotencyKey, localEntityId, payloadHash],
  );
  return {
    id,
    tenantId: scope.tenantId,
    trafficAgencyId: scope.agencyId,
    deviceId: scope.deviceId,
    agentId: scope.agentId,
    entityType: 'ait',
    localEntityId,
    idempotencyKey,
    payloadHash,
    createdLocallyAt: CREATED_LOCALLY_AT,
    concurrencySuspect: false,
    receiptId,
  };
}

async function applyItem(
  tenantId: string,
  actorId: string,
  item: Record<string, unknown>,
): Promise<{ serverEntityId: string }> {
  const applier = await loadApplier(tenantId, actorId);
  return database(tenantId, actorId).tx((tx) => applier.apply(item, tx));
}

beforeAll(async () => {
  await client.connect();
  // Tenant isolado só para o caso de sucesso, que escreve (rait-test-strategy
  // §6 admite `randomUUID` para isolamento de tenant em integration); os casos
  // negativos usam as fixtures canônicas sem mutá-las.
  const tenantId = randomUUID();
  const actorId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
    [tenantId, `applier-${tenantId.slice(0, 8)}`, 'AIT sync applier'],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'Actor')`,
    [actorId, tenantId, `${actorId}@test.invalid`],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [tenantId, actorId],
  );
  isolated = { tenantId, actorId };
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  const agencyId = randomUUID();
  const unitId = randomUUID();
  const agentId = randomUUID();
  const deviceId = randomUUID();
  const shiftId = randomUUID();
  const rangeId = randomUUID();
  const reservationId = randomUUID();
  await client.query(
    `insert into ops.agency_unit (id, tenant_id, traffic_agency_id, name)
     values ($1, $2, $3, 'Unidade Operacional Centro')`,
    [unitId, tenantId, agencyId],
  );
  await client.query(
    `insert into ops.ops_agent_profile
       (id, tenant_id, traffic_agency_id, user_ref, operational_unit_id,
        registration_number, functional_status, credential_valid_until)
     values ($1, $2, $3, $4, $5, 'MAT-000001', 'active', '2027-12-31')`,
    [agentId, tenantId, agencyId, actorId, unitId],
  );
  await client.query(
    `insert into ops.ops_operational_device
       (id, tenant_id, traffic_agency_id, hardware_identifier_hash, os_name,
        status, app_version, tamper_flag)
     values ($1, $2, $3, $4, 'android', 'authorized', '1.0.0', false)`,
    [deviceId, tenantId, agencyId, `sha256:applier-${deviceId.slice(0, 8)}`],
  );
  await client.query(
    `insert into ops.ops_shift
       (id, tenant_id, traffic_agency_id, agent_id, device_id,
        operational_unit_id, started_at, status)
     values ($1, $2, $3, $4, $5, $6, '2026-09-14T08:00:00-04:00', 'open')`,
    [shiftId, tenantId, agencyId, agentId, deviceId, unitId],
  );
  await client.query(
    `insert into ops.ait_numbering_range
       (id, tenant_id, traffic_agency_id, series, start_number, end_number,
        next_number, status, usage_mode)
     values ($1, $2, $3, 'F', 2026000001, 2026001000, 2026000002, 'active',
             'source_pending')`,
    [rangeId, tenantId, agencyId],
  );
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
        idempotency_key, start_number, end_number, valid_until, status)
     values ($1, $2, $3, $4, $5, $6, $7, 'applier-reserved', 2026000001,
             2026000001, '2026-12-31T23:59:59-04:00', 'reserved')`,
    [reservationId, tenantId, rangeId, agencyId, agentId, deviceId, shiftId],
  );
  isolatedField = {
    agencyId,
    unitId,
    agentId,
    deviceId,
    shiftId,
    rangeId,
    reservationId,
  };
});

afterAll(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
  for (const table of [
    'inf.ait_status_history',
    'inf.ait_ait',
    'ops.numbering_consumption',
    'ops.sync_receipt',
    'ops.sync_queue_item',
    'ops.numbering_reservation',
    'ops.ait_numbering_range',
    'ops.ops_shift',
    'ops.ops_operational_device',
    'ops.ops_agent_profile',
    'ops.agency_unit',
    'integration.outbox',
  ]) {
    await client.query(`delete from ${table} where tenant_id = $1`, [
      isolated.tenantId,
    ]);
  }
  await client.query('delete from auth.memberships where tenant_id = $1', [
    isolated.tenantId,
  ]);
  await client.query('delete from auth.users where tenant_id = $1', [
    isolated.tenantId,
  ]);
  await client.query('delete from auth.tenants where id = $1', [
    isolated.tenantId,
  ]);
  await client.end();
});

/**
 * A limpeza é restrita às linhas **deste** arquivo (`idempotency_key like
 * 'applier-%'`): o tenant canônico é compartilhado, e apagar `ops.sync_receipt`
 * inteiro derrubaria o recibo `…ea100001` de `26-fixtures-teat-field.sql`, do
 * qual dependem C-0002-30 (`by-idempotency/item-001`) e o e2e quando as suítes
 * rodam encadeadas. O recibo sai antes do item por causa da FK
 * `fk_ops_sync_receipt_queue_item`.
 */
beforeEach(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `delete from ops.sync_receipt
      where tenant_id = $1 and idempotency_key like 'applier-%'`,
    [FIXTURES.tenantId],
  );
  await client.query(
    `delete from ops.sync_queue_item
      where tenant_id = $1 and idempotency_key like 'applier-%'`,
    [FIXTURES.tenantId],
  );
});

describe('CTG-0002 §4.6 — guarda de numeração do applier ait (C-0002-39…41)', () => {
  it('C-0002-39 — dado um item ait cujo ait_number está numa reserva de outro turno então TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT com reservationId e shiftId (recibo rejected, §4.4)', async () => {
    const payload = aitPayload({
      ait_number: '2026000001',
      shift_id: FIXTURES.shiftClosed,
    });
    const item = await queueItem(
      {
        tenantId: FIXTURES.tenantId,
        agencyId: FIXTURES.agencyId,
        deviceId: FIXTURES.deviceId,
        agentId: FIXTURES.agentId,
      },
      payload,
    );
    await expect(
      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
    ).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
      context: expect.objectContaining({
        reservationId: FIXTURES.reservationReserved,
        shiftId: FIXTURES.shiftClosed,
      }),
    });
  });

  it('§4.6 passo 1 — dado um ait_number fora de qualquer reserva do device então o mesmo TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT com reservationId null', async () => {
    const payload = aitPayload({ ait_number: '2026000900' });
    const item = await queueItem(
      {
        tenantId: FIXTURES.tenantId,
        agencyId: FIXTURES.agencyId,
        deviceId: FIXTURES.deviceId,
        agentId: FIXTURES.agentId,
      },
      payload,
    );
    await expect(
      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
    ).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
      context: expect.objectContaining({
        reservationId: null,
        shiftId: FIXTURES.shiftOpen,
      }),
    });
  });

  it('C-0002-40 — dado um item cujo número está na reserva …e6000003 (expired) então TEAT.NUMBERING_RESERVATION_EXPIRED com reservationId e number (recibo conflict) e nenhum AIT criado', async () => {
    const payload = aitPayload({ ait_number: '2026000003' });
    const item = await queueItem(
      {
        tenantId: FIXTURES.tenantId,
        agencyId: FIXTURES.agencyId,
        deviceId: FIXTURES.deviceId,
        agentId: FIXTURES.agentId,
      },
      payload,
    );
    await expect(
      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
    ).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_EXPIRED',
      context: expect.objectContaining({
        reservationId: FIXTURES.reservationExpired,
        number: 2026000003,
      }),
    });
    const created = await client.query<{ count: string }>(
      `select count(*)::text as count from inf.ait_ait
        where tenant_id = $1 and ait_number = '2026000003'`,
      [FIXTURES.tenantId],
    );
    expect(Number(created.rows[0]!.count)).toBe(0);
  });

  it('§4.6 passo 3 — dado um item cujo número está na reserva …e6000004 (cancelled) então o mesmo TEAT.NUMBERING_RESERVATION_EXPIRED', async () => {
    const payload = aitPayload({ ait_number: '2026000004' });
    const item = await queueItem(
      {
        tenantId: FIXTURES.tenantId,
        agencyId: FIXTURES.agencyId,
        deviceId: FIXTURES.deviceId,
        agentId: FIXTURES.agentId,
      },
      payload,
    );
    await expect(
      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
    ).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_EXPIRED',
    });
  });

  it('C-0002-41 — dado o número 2026000002, com numbering_consumption aplicado nas fixtures, então TEAT.NUMBERING_NUMBER_ALREADY_APPLIED com number e aitId — o número nunca é reatribuído', async () => {
    const payload = aitPayload({ ait_number: '2026000002' });
    const item = await queueItem(
      {
        tenantId: FIXTURES.tenantId,
        agencyId: FIXTURES.agencyId,
        deviceId: FIXTURES.deviceId,
        agentId: FIXTURES.agentId,
      },
      payload,
    );
    await expect(
      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
    ).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED',
      context: expect.objectContaining({
        number: 2026000002,
        aitId: FIXTURES.aitReceived,
      }),
    });
  });

  it('§4.5 — dado um payload sem content_hash então validate devolve TEAT.SYNC_INVALID_CANONICAL_AIT com fields contendo ait.content_hash', async () => {
    const applier = await loadApplier(FIXTURES.tenantId, FIXTURES.agentId);
    const payload = aitPayload();
    delete (payload.ait as Record<string, unknown>).content_hash;
    expect(applier.entityType).toBe('ait');
    expect(applier.validate(payload)).toMatchObject({
      code: 'TEAT.SYNC_INVALID_CANONICAL_AIT',
      fields: expect.arrayContaining(['ait.content_hash']),
    });
  });

  it('§4.5 — dado um payload com tenant_id (proibido pelo strictObject) então validate devolve TEAT.SYNC_INVALID_CANONICAL_AIT com fields contendo ait.tenant_id', async () => {
    const applier = await loadApplier(FIXTURES.tenantId, FIXTURES.agentId);
    const payload = aitPayload({ tenant_id: FIXTURES.tenantId });
    expect(applier.validate(payload)).toMatchObject({
      code: 'TEAT.SYNC_INVALID_CANONICAL_AIT',
      fields: expect.arrayContaining(['ait.tenant_id']),
    });
  });

  it('§4.5 — dado o payload canônico completo então validate devolve null', async () => {
    const applier = await loadApplier(FIXTURES.tenantId, FIXTURES.agentId);
    expect(applier.validate(aitPayload())).toBeNull();
  });
});

describe('CTG-0002 §4.6 — efeito de domínio do applier ait (C-0002-42)', () => {
  it('C-0002-42 — dado um item ait válido então o AIT nasce em RECEBIDO com receipt_protocol = id do sync_receipt, duas linhas de ait_status_history (TRANSMITIDO, RECEBIDO), numbering_consumption aplicado e o evento AIT_RECEBIDO', async () => {
    const payload = aitPayload({
      traffic_agency_id: isolatedField.agencyId,
      ait_number: '2026000001',
      agent_id: isolatedField.agentId,
      shift_id: isolatedField.shiftId,
      device_id: isolatedField.deviceId,
    });
    const item = await queueItem(
      {
        tenantId: isolated.tenantId,
        agencyId: isolatedField.agencyId,
        deviceId: isolatedField.deviceId,
        agentId: isolatedField.agentId,
      },
      payload,
    );
    const applier = await loadApplier(isolated.tenantId, isolated.actorId);
    const result = await database(isolated.tenantId, isolated.actorId).tx(
      (tx) => applier.apply(item, tx),
    );
    expect(result.serverEntityId).toEqual(expect.any(String));
    await client.query(`select set_config('app.role', 'owner', false)`);
    const ait = await client.query<{
      current_status: string;
      receipt_protocol: string;
      version: number;
    }>(
      `select current_status, receipt_protocol, version from inf.ait_ait where id = $1`,
      [result.serverEntityId],
    );
    expect(ait.rows[0]).toMatchObject({
      current_status: 'RECEBIDO',
      receipt_protocol: item.receiptId,
      version: 1,
    });
    const history = await client.query<{ status: string }>(
      `select status from inf.ait_status_history where ait_id = $1 order by changed_at, created_at`,
      [result.serverEntityId],
    );
    expect(history.rows.map((row) => row.status)).toEqual([
      'TRANSMITIDO',
      'RECEBIDO',
    ]);
    const consumption = await client.query<{
      status: string;
      server_entity_id: string;
      number: string;
    }>(
      `select status, server_entity_id, number::text from ops.numbering_consumption
        where tenant_id = $1 and reservation_id = $2`,
      [isolated.tenantId, isolatedField.reservationId],
    );
    expect(consumption.rows[0]).toMatchObject({
      status: 'aplicado',
      server_entity_id: result.serverEntityId,
      number: '2026000001',
    });
  });

  it('§4.6/§4.7 — dado o mesmo item com concurrencySuspect true então o AIT nasce em SUSPEITO_CONCORRENCIA, não em RECEBIDO (AC-TEAT-012-2: bloqueio, não alerta)', async () => {
    const payload = aitPayload({
      traffic_agency_id: isolatedField.agencyId,
      ait_number: '2026000005',
      agent_id: isolatedField.agentId,
      shift_id: isolatedField.shiftId,
      device_id: isolatedField.deviceId,
    });
    await client.query(`select set_config('app.role', 'owner', false)`);
    // §5.10: uma reserva `reserved` por dispositivo e turno — a reserva do
    // caso anterior (…0001, consumida por C-0002-42) é liquidada antes de a
    // reserva do número 2026000005 nascer.
    await client.query(
      `update ops.numbering_reservation set status = 'consumed'
        where tenant_id = $1 and id = $2 and status = 'reserved'`,
      [isolated.tenantId, isolatedField.reservationId],
    );
    await client.query(
      `insert into ops.numbering_reservation
         (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
          idempotency_key, start_number, end_number, valid_until, status)
       values ($1, $2, $3, $4, $5, $6, $7, 'applier-reserved-5', 2026000005,
               2026000005, '2026-12-31T23:59:59-04:00', 'reserved')`,
      [
        randomUUID(),
        isolated.tenantId,
        isolatedField.rangeId,
        isolatedField.agencyId,
        isolatedField.agentId,
        isolatedField.deviceId,
        isolatedField.shiftId,
      ],
    );
    const item = await queueItem(
      {
        tenantId: isolated.tenantId,
        agencyId: isolatedField.agencyId,
        deviceId: isolatedField.deviceId,
        agentId: isolatedField.agentId,
      },
      payload,
    );
    item.concurrencySuspect = true;
    const applier = await loadApplier(isolated.tenantId, isolated.actorId);
    const result = await database(isolated.tenantId, isolated.actorId).tx(
      (tx) => applier.apply(item, tx),
    );
    const ait = await client.query<{ current_status: string }>(
      `select current_status from inf.ait_ait where id = $1`,
      [result.serverEntityId],
    );
    expect(ait.rows[0]?.current_status).toBe('SUSPEITO_CONCORRENCIA');
  });
});
