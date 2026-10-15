// Inspector095b: TEST_ONLY transaction/port fixtures, no actual SDK claim, database or atomicity proof.
import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import type { Transaction } from '@stynx-nyx/data';
import type { SyncEntityApplierItem } from '@detran/ops-core';
const ids = {
  tenant: '00000000-0000-4000-8000-000000000101',
  agency: '00000000-0000-4000-8000-000000000102',
  device: '00000000-0000-4000-8000-000000000103',
  agent: '00000000-0000-4000-8000-000000000104',
  shift: '00000000-0000-4000-8000-000000000105',
  framing: '00000000-0000-4000-8000-000000000106',
  catalog: '00000000-0000-4000-8000-000000000107',
  receipt: '00000000-0000-4000-8000-000000000108',
  server: '00000000-0000-4000-8000-000000000109',
};
const payload = () => ({
  ait: {
    traffic_agency_id: ids.agency,
    ait_number: '2042',
    series: 'TEST_ONLY',
    agent_id: ids.agent,
    shift_id: ids.shift,
    device_id: ids.device,
    framing_id: ids.framing,
    catalog_id: ids.catalog,
    infraction_at: '2026-10-13T12:00:00Z',
    issued_at: '2026-10-13T12:01:00Z',
    issuance_mode: 'eletronico',
    constatation_type: 'abordagem',
    had_approach: true,
    location_description: 'TEST_ONLY supplied original payload',
    uf: 'AM',
    content_hash: 'sha256:TEST_ONLY',
  },
  vehicles: [],
  people: [],
  signatures: [],
  print_events: [],
});
const item = (): SyncEntityApplierItem => ({
  id: 'native-queue-key',
  tenantId: ids.tenant,
  trafficAgencyId: ids.agency,
  deviceId: ids.device,
  agentId: ids.agent,
  entityType: 'ait',
  localEntityId: 'TEST_ONLY-local',
  idempotencyKey: 'native-storage-key',
  payloadHash: 'sha256:TEST_ONLY',
  createdLocallyAt: '2026-10-13T12:01:00Z',
  concurrencySuspect: false,
  receiptId: ids.receipt,
  storageMode: 'stynx-ctg9',
  payloadJson: payload(),
});
function fixture(legacy = false) {
  const statements: Array<{ sql: string; values?: readonly unknown[] }> = [];
  const query = vi.fn(async (sql: string, values?: readonly unknown[]) => {
    statements.push({ sql, values });
    if (/ops\.sync_queue_item/u.test(sql)) {
      if (!legacy) throw Error('TEST_ONLY forbidden legacy payload lookup');
      return { rows: [{ payload_json: payload() }] };
    }
    if (/from ops\.numbering_reservation/iu.test(sql)) {
      if (!legacy) throw Error('TEST_ONLY forbidden legacy numbering lookup');
      return {
        rows: [
          {
            id: 'reservation',
            range_id: 'range',
            shift_id: ids.shift,
            status: 'reserved',
            valid_until: '2027-01-01T00:00:00Z',
          },
        ],
      };
    }
    if (/select[\s\S]*ops\.numbering_consumption/iu.test(sql))
      return { rows: [] };
    if (/insert into inf\.ait_ait/iu.test(sql))
      return { rows: [{ id: ids.server }] };
    return { rows: [] };
  });
  const tx = { query } as unknown as Transaction;
  const append = vi.fn(async (_tx: Transaction, _event: unknown) => ({
    id: 'TEST_ONLY-event',
  }));
  const assertAitNumbering = vi.fn(
    async (
      _item: SyncEntityApplierItem,
      _tx: Transaction,
      _number: number,
      _shift: string,
    ) => {},
  );
  const deps = {
    outbox: { append },
    clock: { now: () => '2026-10-13T12:02:00Z' },
    numberingRules: { assertAitNumbering },
  };
  return { statements, query, tx, append, assertAitNumbering, deps };
}
it('source AIT trusted handoff explicitly selects payload and required same-transaction numbering port', () => {
  const s = readFileSync(new URL('./sync-applier.ts', import.meta.url), 'utf8');
  expect(s).toContain('storageMode');
  expect(s).toContain('payloadJson');
  expect(s).toContain('assertAitNumbering');
  expect(s).toContain('TEAT.SYNC_DESTINATION_NOT_WIRED');
});
it('AIT trusted payload bypasses both legacy stores and passes actual item, transaction, canonical number and shift', async () => {
  const { AitSyncApplier } = await import('./sync-applier.js');
  const f = fixture(),
    i = item();
  expect(await new AitSyncApplier(f.deps).apply(i, f.tx)).toEqual({
    serverEntityId: ids.server,
  });
  expect(f.assertAitNumbering).toHaveBeenCalledExactlyOnceWith(
    i,
    f.tx,
    2042,
    ids.shift,
  );
  expect(
    f.statements.some((x) =>
      /ops\.(?:sync_queue_item|numbering_reservation|numbering_consumption)|(?:insert|update|delete)[\s\S]*offline\./iu.test(
        x.sql,
      ),
    ),
  ).toBe(false);
  const inserted = f.statements.find((x) =>
    /insert into inf\.ait_ait/iu.test(x.sql),
  )!;
  expect(inserted.values?.at(-1)).toBe(ids.receipt);
  expect(inserted.values).toContain('TEST_ONLY supplied original payload');
  expect(f.append).toHaveBeenCalledOnce();
  expect(f.append.mock.calls[0]?.[0]).toBe(f.tx);
  expect(f.append.mock.calls[0]?.[1]).toMatchObject({
    data: { receiptProtocol: ids.receipt },
    tenantId: ids.tenant,
    actor: { id: ids.agent },
  });
});
it('AIT trusted mode with missing numbering destination refuses typed before legacy lookup or effects', async () => {
  const { AitSyncApplier } = await import('./sync-applier.js');
  const f = fixture();
  await expect(
    new AitSyncApplier({ outbox: f.deps.outbox }).apply(item(), f.tx),
  ).rejects.toMatchObject({ code: 'TEAT.SYNC_DESTINATION_NOT_WIRED' });
  expect(f.query).not.toHaveBeenCalled();
  expect(f.append).not.toHaveBeenCalled();
});
for (const [name, mutate] of [
  [
    'payload without trusted mode',
    (i: SyncEntityApplierItem) => {
      delete i.storageMode;
    },
  ],
  [
    'trusted mode without payload',
    (i: SyncEntityApplierItem) => {
      delete i.payloadJson;
    },
  ],
  [
    'non-UUID consumer receipt',
    (i: SyncEntityApplierItem) => {
      i.receiptId = 'native-storage-key';
    },
  ],
  [
    'invalid supplied canonical payload',
    (i: SyncEntityApplierItem) => {
      i.payloadJson = { ait: {} };
    },
  ],
] as const)
  it(`AIT ${name} refuses original typed invalid-payload code before any SQL`, async () => {
    const { AitSyncApplier } = await import('./sync-applier.js');
    const f = fixture(),
      i = item();
    mutate(i);
    await expect(
      new AitSyncApplier(f.deps).apply(i, f.tx),
    ).rejects.toMatchObject({ code: 'TEAT.SYNC_INVALID_CANONICAL_AIT' });
    expect(f.query).not.toHaveBeenCalled();
    expect(f.append).not.toHaveBeenCalled();
  });
it('AIT numbering-port refusal propagates intact before domain/history/event effects', async () => {
  const { AitSyncApplier } = await import('./sync-applier.js');
  const f = fixture(),
    failure = Object.assign(Error('TEST_ONLY original rejection'), {
      code: 'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
    });
  f.assertAitNumbering.mockRejectedValueOnce(failure);
  await expect(new AitSyncApplier(f.deps).apply(item(), f.tx)).rejects.toBe(
    failure,
  );
  expect(f.query).not.toHaveBeenCalled();
  expect(f.append).not.toHaveBeenCalled();
});
it('AIT absent trusted fields preserves actual legacy queue, numbering guard and consumption writes', async () => {
  const { AitSyncApplier } = await import('./sync-applier.js');
  const f = fixture(true),
    i = item();
  delete i.storageMode;
  delete i.payloadJson;
  await new AitSyncApplier(f.deps).apply(i, f.tx);
  expect(f.statements.some((x) => /ops\.sync_queue_item/u.test(x.sql))).toBe(
    true,
  );
  expect(
    f.statements.some((x) =>
      /ops\.numbering_reservation[\s\S]*for update/iu.test(x.sql),
    ),
  ).toBe(true);
  expect(
    f.statements.some((x) =>
      /insert into ops\.numbering_consumption/iu.test(x.sql),
    ),
  ).toBe(true);
  expect(f.assertAitNumbering).not.toHaveBeenCalled();
});
