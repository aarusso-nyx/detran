// Inspector095b TEST_ONLY query fixtures; no real database/outbox/native receipt or rollback proof.
import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import type { Transaction } from '@stynx-nyx/data';
const ids = {
  tenant: '00000000-0000-4000-8000-000000000101',
  agency: '00000000-0000-4000-8000-000000000102',
  device: '00000000-0000-4000-8000-000000000103',
  agent: '00000000-0000-4000-8000-000000000104',
  receipt: '00000000-0000-4000-8000-000000000108',
  server: '00000000-0000-4000-8000-000000000109',
};
const payload = () => ({
  record: {
    traffic_agency_id: ids.agency,
    crash_type: 'TEST_ONLY',
    severity: 'SEM_VITIMA',
    occurred_at: '2026-10-13T12:00:00Z',
    recorded_at: '2026-10-13T12:01:00Z',
    location_description: 'TEST_ONLY supplied crash payload',
    municipality_code: '1302603',
    uf: 'AM',
    road_condition: 'TEST_ONLY',
    weather_condition: 'TEST_ONLY',
    lighting_condition: 'TEST_ONLY',
    signage_condition: 'TEST_ONLY',
    source_local_id: 'TEST_ONLY-source',
  },
  evidenceLocalIds: [ids.device],
  links: [{ kind: 'ait', target_id: ids.agent }],
});
function item() {
  return {
    id: 'native-queue-key',
    tenantId: ids.tenant,
    trafficAgencyId: ids.agency,
    deviceId: ids.device,
    agentId: ids.agent,
    entityType: 'crash-record',
    localEntityId: 'TEST_ONLY-local',
    idempotencyKey: 'native-storage-key',
    payloadHash: 'sha256:TEST_ONLY',
    createdLocallyAt: '2026-10-13T12:01:00Z',
    concurrencySuspect: false,
    receiptId: ids.receipt,
    storageMode: 'stynx-ctg9' as const,
    payloadJson: payload() as Record<string, unknown>,
  };
}
function fixture(legacy = false) {
  const statements: Array<{ sql: string; values?: readonly unknown[] }> = [];
  const query = vi.fn(async (sql: string, values?: readonly unknown[]) => {
    statements.push({ sql, values });
    if (/ops\.sync_queue_item/u.test(sql)) {
      if (!legacy) throw Error('TEST_ONLY forbidden legacy payload lookup');
      return { rows: [{ payload_json: payload() }] };
    }
    if (/insert into est\.crash_record/iu.test(sql))
      return { rows: [{ id: ids.server }] };
    if (/insert into.*outbox/isu.test(sql))
      return { rows: [{ id: ids.receipt }] };
    return { rows: [] };
  });
  return { statements, query, tx: { query } as unknown as Transaction };
}
it('source Crash trusted handoff uses supplied payload and returns details instead of legacy receipt updates', () => {
  const s = readFileSync(
    new URL('./crash-sync-applier.ts', import.meta.url),
    'utf8',
  );
  expect(s).toContain('storageMode');
  expect(s).toContain('payloadJson');
  expect(s).toContain('detailsJson');
});
it('Crash trusted payload returns original warnings without legacy queue lookup or receipt UPDATE', async () => {
  const { CrashSyncApplier } = await import('./crash-sync-applier.js');
  const f = fixture();
  expect(await new CrashSyncApplier().apply(item(), f.tx)).toEqual({
    serverEntityId: ids.server,
    detailsJson: {
      warnings: ['BOAT.SYNC_EVIDENCE_PENDING', 'BOAT.SYNC_LINK_UNRESOLVED'],
    },
  });
  expect(
    f.statements.some((x) =>
      /ops\.sync_queue_item|update\s+ops\.sync_receipt/iu.test(x.sql),
    ),
  ).toBe(false);
  const inserted = f.statements.find((x) =>
    /insert into est\.crash_record/iu.test(x.sql),
  );
  expect(inserted?.values).toContain('TEST_ONLY supplied crash payload');
  expect(f.statements.some((x) => /insert into.*outbox/isu.test(x.sql))).toBe(
    true,
  );
});
for (const [name, mutate] of [
  [
    'payload without trusted mode',
    (i: ReturnType<typeof item>) => {
      delete (i as { storageMode?: string }).storageMode;
    },
  ],
  [
    'mode without payload',
    (i: ReturnType<typeof item>) => {
      delete (i as { payloadJson?: unknown }).payloadJson;
    },
  ],
  [
    'non-UUID consumer receipt',
    (i: ReturnType<typeof item>) => {
      i.receiptId = 'native-storage-key';
    },
  ],
  [
    'invalid supplied domain payload',
    (i: ReturnType<typeof item>) => {
      i.payloadJson = { record: {} };
    },
  ],
] as const)
  it(`Crash ${name} refuses typed invalid payload before any SQL`, async () => {
    const { CrashSyncApplier } = await import('./crash-sync-applier.js');
    const f = fixture(),
      i = item();
    mutate(i);
    await expect(new CrashSyncApplier().apply(i, f.tx)).rejects.toMatchObject({
      code: 'BOAT.SYNC_INVALID_CRASH_RECORD',
    });
    expect(f.query).not.toHaveBeenCalled();
  });
it('Crash original domain victim rejection is preserved before effect and receipt writes', async () => {
  const { CrashSyncApplier } = await import('./crash-sync-applier.js');
  const f = fixture(),
    i = item();
  i.payloadJson = {
    ...payload(),
    record: { ...payload().record, severity: 'COM_VITIMA' },
  };
  await expect(new CrashSyncApplier().apply(i, f.tx)).rejects.toMatchObject({
    code: 'BOAT.SYNC_VICTIMS_INCONSISTENT',
  });
  expect(f.query).not.toHaveBeenCalled();
});
it('Crash absent handoff preserves legacy payload read and original warning receipt UPDATE', async () => {
  const { CrashSyncApplier } = await import('./crash-sync-applier.js');
  const f = fixture(true),
    i = item();
  delete (i as { storageMode?: string }).storageMode;
  delete (i as { payloadJson?: unknown }).payloadJson;
  expect(await new CrashSyncApplier().apply(i, f.tx)).toEqual({
    serverEntityId: ids.server,
  });
  expect(f.statements.some((x) => /ops\.sync_queue_item/u.test(x.sql))).toBe(
    true,
  );
  const warning = f.statements.find((x) =>
    /update\s+ops\.sync_receipt/iu.test(x.sql),
  );
  expect(warning?.values).toEqual([
    ids.receipt,
    JSON.stringify({
      warnings: ['BOAT.SYNC_EVIDENCE_PENDING', 'BOAT.SYNC_LINK_UNRESOLVED'],
    }),
  ]);
});
