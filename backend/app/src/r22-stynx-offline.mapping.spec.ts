// Inspector — A160-16 only. Pure inactive projection; no service/DB/HTTP proof.
import type {
  NumberingConsumptionEntry,
  SyncItemReceipt,
  SyncQueueItemRecord,
} from '@stynx-nyx/offline-sync';
import { describe, expect, it } from 'vitest';

type Reason =
  | 'source-fact-unavailable'
  | 'identity-mismatch'
  | 'unsupported-outcome'
  | 'invalid-public-value';
type Mutable<T> = T extends readonly (infer U)[]
  ? Mutable<U>[]
  : T extends object
    ? { -readonly [K in keyof T]: Mutable<T[K]> }
    : T;
type Result<T> =
  { kind: 'mapped'; value: T } | { kind: 'checkpoint'; reason: Reason };
interface Identity {
  tenantId: string;
  deviceId: string;
  deviceBatchId: string;
  idempotencyKey: string;
  localEntityId: string;
}
interface ReceiptValue {
  local_entity_id: string;
  idempotency_key: string;
  status: 'applied';
  server_entity_id: string;
  error_code: null;
  error_message: null;
  details_json: Record<string, unknown> | null;
}
interface ConsumptionValue {
  number: number;
  status: string;
  server_entity_id: string | null;
  finalized_at: string | null;
}
interface Api {
  projectR22AppliedSyncReceipt(
    receipt: SyncItemReceipt,
    item: SyncQueueItemRecord,
    identity: Identity,
  ): Result<ReceiptValue>;
  projectR22NumberingConsumptionEntry(
    entry: NumberingConsumptionEntry,
  ): Result<ConsumptionValue>;
}
const moduleUrl = new URL('./r22-stynx-offline.mapping.ts', import.meta.url)
  .href;
const api = async () => (await import(moduleUrl)) as Api;
const identity: Identity = {
  tenantId: '00000000-0000-7000-8000-000000000101',
  deviceId: 'device-canonical',
  deviceBatchId: 'batch-canonical',
  idempotencyKey: 'explicit-receipt-key',
  localEntityId: 'local-entity-canonical',
};
const originalServer = 'original-server-entity';
const hostContext = {
  details: { label: 'ação ñ', flag: false, empty: null },
  list: [0, '', true, null, { nested: 'ç' }],
};
function fixture() {
  const receipt: Mutable<SyncItemReceipt> & { receiptId?: string } = {
    queueItemId: 'queue-item-canonical',
    status: 'applied',
    context: structuredClone(hostContext),
    stynx: {
      version: 1,
      receiptId: identity.idempotencyKey,
      serverEntityId: originalServer,
      appliedAt: '2026-10-12T10:11:12.123456-03:00',
      attempts: 2,
      consumerAttributes: { notHostDetails: 'platform-only' },
    },
  };
  const item: Mutable<SyncQueueItemRecord> = {
    queueItemId: 'queue-item-canonical',
    tenantId: identity.tenantId,
    deviceId: identity.deviceId,
    deviceBatchId: identity.deviceBatchId,
    idempotencyKey: identity.idempotencyKey,
    localEntityId: identity.localEntityId,
    entityType: 'ait',
    agentId: 'agent-source',
    orgUnitId: 'unit-source',
    payloadHash: `sha256:${'a'.repeat(64)}`,
    payloadJson: { source: 'unchanged' },
    createdLocallyAt: '2026-10-12T09:00:00.000001Z',
    receivedAt: '2026-10-12T09:01:00.000002Z',
    status: 'applied',
    stynx: {
      version: 1,
      receiptId: identity.idempotencyKey,
      serverEntityId: originalServer,
    },
  };
  return { receipt, item, identity: { ...identity } };
}
const expectedReceipt = {
  kind: 'mapped',
  value: {
    local_entity_id: 'local-entity-canonical',
    idempotency_key: 'explicit-receipt-key',
    status: 'applied',
    server_entity_id: 'original-server-entity',
    error_code: null,
    error_message: null,
    details_json: hostContext,
  },
};
function freeze(value: unknown, seen = new Set<object>()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  for (const descriptor of Object.values(
    Object.getOwnPropertyDescriptors(value),
  ))
    if ('value' in descriptor) freeze(descriptor.value, seen);
  Object.freeze(value);
}
async function project(input = fixture()) {
  const mapper = await api();
  return mapper.projectR22AppliedSyncReceipt(
    input.receipt,
    input.item,
    input.identity,
  );
}
function checkpoint(value: unknown, reason: Reason) {
  expect(value).toEqual({ kind: 'checkpoint', reason });
}

describe('A160-16 applied-success projection', () => {
  it('exports only the two inactive runtime projection functions', async () => {
    expect(Object.keys(await api()).sort()).toEqual([
      'projectR22AppliedSyncReceipt',
      'projectR22NumberingConsumptionEntry',
    ]);
  });
  it('preserves canonical original success and exactly seven legacy fields', async () => {
    const input = fixture();
    freeze(input);
    expect(await project(input)).toEqual(expectedReceipt);
  });
  it('replays frozen facts without mutation and detaches host JSON', async () => {
    const input = fixture();
    const before = structuredClone(input);
    freeze(input);
    const first = await project(input);
    const second = await project(input);
    expect(first).toEqual(expectedReceipt);
    expect(second).toEqual(expectedReceipt);
    expect(input).toEqual(before);
    if (first.kind !== 'mapped') throw Error('Expected mapped');
    (first.value.details_json!.details as { label: string }).label =
      'changed output';
    expect(input.receipt.context).toEqual(hostContext);
    expect(second).toEqual(expectedReceipt);
  });
  for (const mode of ['absent', 'undefined'] as const)
    it(`maps ${mode} host context to null`, async () => {
      const input = fixture();
      if (mode === 'absent') delete input.receipt.context;
      else Object.assign(input.receipt, { context: undefined });
      expect(await project(input)).toEqual({
        ...expectedReceipt,
        value: { ...expectedReceipt.value, details_json: null },
      });
    });
  it('preserves legal scalar toJSON and __proto__ data keys without coercion', async () => {
    const input = fixture();
    input.receipt.context = JSON.parse(
      '{"toJSON":"literal-data","__proto__":{"safe":true},"constructor":"data"}',
    ) as Record<string, unknown>;
    freeze(input);
    const result = await project(input);
    expect(result).toEqual({
      ...expectedReceipt,
      value: {
        ...expectedReceipt.value,
        details_json: JSON.parse(
          '{"toJSON":"literal-data","__proto__":{"safe":true},"constructor":"data"}',
        ),
      },
    });
    expect(Object.prototype).not.toHaveProperty('safe');
  });
  it('accepts legal null-prototype host JSON records', async () => {
    const input = fixture();
    input.receipt.context = Object.assign(
      Object.create(null) as Record<string, unknown>,
      { nested: null, text: 'ç' },
    );
    freeze(input);
    expect(await project(input)).toEqual({
      ...expectedReceipt,
      value: {
        ...expectedReceipt.value,
        details_json: { nested: null, text: 'ç' },
      },
    });
  });
  it('does not invent a legacy receipt UUID when optional receiptId is absent', async () => {
    const input = fixture();
    delete input.receipt.stynx!.receiptId;
    delete input.item.stynx!.receiptId;
    expect(await project(input)).toEqual(expectedReceipt);
  });
  for (const field of [
    'tenantId',
    'deviceId',
    'deviceBatchId',
    'idempotencyKey',
    'localEntityId',
  ] as const)
    it(`refuses canonical ${field} disagreement`, async () => {
      const input = fixture();
      input.identity[field] = 'different-canonical-identity';
      checkpoint(await project(input), 'identity-mismatch');
    });
  it('refuses receipt queue identity different from canonical item', async () => {
    const input = fixture();
    input.receipt.queueItemId = 'different-queue';
    checkpoint(await project(input), 'identity-mismatch');
  });
  it('refuses missing explicit key without synthesizing one', async () => {
    const input = fixture();
    Reflect.deleteProperty(input.item, 'idempotencyKey');
    checkpoint(await project(input), 'invalid-public-value');
  });
  for (const location of [
    'receipt-record',
    'receipt-stynx',
    'item-stynx',
  ] as const)
    it(`refuses ${location} receiptId unrelated to explicit key`, async () => {
      const input = fixture();
      if (location === 'receipt-record')
        input.receipt.receiptId = 'invented-legacy-uuid';
      else if (location === 'receipt-stynx')
        input.receipt.stynx!.receiptId = 'different-key';
      else input.item.stynx!.receiptId = 'different-key';
      checkpoint(await project(input), 'identity-mismatch');
    });
  it('refuses conflicting item original server entity', async () => {
    const input = fixture();
    input.item.stynx!.serverEntityId = 'other-server';
    checkpoint(await project(input), 'identity-mismatch');
  });
  for (const mode of ['no-stynx', 'no-server', 'undefined-server'] as const)
    it(`refuses historical ${mode} without queue/local fallback`, async () => {
      const input = fixture();
      if (mode === 'no-stynx') delete input.receipt.stynx;
      else if (mode === 'no-server') delete input.receipt.stynx!.serverEntityId;
      else Object.assign(input.receipt.stynx!, { serverEntityId: undefined });
      checkpoint(await project(input), 'source-fact-unavailable');
    });
  for (const value of [null, 42, ''] as const)
    it(`refuses malformed present original server scalar ${String(value)}`, async () => {
      const input = fixture();
      Object.assign(input.receipt.stynx!, { serverEntityId: value });
      checkpoint(await project(input), 'invalid-public-value');
    });
  for (const status of ['pending', 'received', 'conflict', 'rejected'] as const)
    it(`refuses coherent ${status} outcome`, async () => {
      const input = fixture();
      input.receipt.status = status;
      input.item.status = status;
      checkpoint(await project(input), 'unsupported-outcome');
    });
  it('refuses inconsistent source statuses', async () => {
    const input = fixture();
    input.item.status = 'received';
    checkpoint(await project(input), 'unsupported-outcome');
  });
  for (const field of ['errorCode', 'reasonCode', 'errorMessage'] as const)
    it(`refuses present original ${field} instead of hiding it with null`, async () => {
      const input = fixture();
      Object.assign(input.receipt.stynx!, {
        [field]: 'untranslated-source-fact',
      });
      checkpoint(await project(input), 'unsupported-outcome');
    });
  it('refuses top-level receipt errorCode', async () => {
    const input = fixture();
    input.receipt.errorCode = 'untranslated-code';
    checkpoint(await project(input), 'unsupported-outcome');
  });
  const invalidContexts: Array<[string, () => unknown]> = [
    ['null', () => null],
    ['array', () => []],
    ['Date', () => new Date('2026-10-12T00:00:00Z')],
    ['undefined member', () => ({ bad: undefined })],
    ['bigint member', () => ({ bad: 1n })],
    ['nonfinite member', () => ({ bad: Infinity })],
    ['sparse array', () => ({ bad: new Array(2) })],
    [
      'cycle',
      () => {
        const context: Record<string, unknown> = {};
        context.self = context;
        return context;
      },
    ],
  ];
  for (const [name, value] of invalidContexts)
    it(`refuses unrepresentable host context: ${name}`, async () => {
      const input = fixture();
      Object.assign(input.receipt, { context: value() });
      checkpoint(await project(input), 'invalid-public-value');
    });
  it('does not invoke host context getters or toJSON methods', async () => {
    const input = fixture();
    let calls = 0;
    const context: Record<string, unknown> = {};
    Object.defineProperty(context, 'secret', {
      enumerable: true,
      get() {
        calls++;
        return 'must-not-read';
      },
    });
    input.receipt.context = context;
    checkpoint(await project(input), 'invalid-public-value');
    expect(calls).toBe(0);
    input.receipt.context = {
      toJSON() {
        calls++;
        return { coerced: true };
      },
    };
    checkpoint(await project(input), 'invalid-public-value');
    expect(calls).toBe(0);
  });
  it('does not invoke a receipt status accessor', async () => {
    const input = fixture();
    let calls = 0;
    Object.defineProperty(input.receipt, 'status', {
      get() {
        calls++;
        return 'applied';
      },
      enumerable: true,
    });
    checkpoint(await project(input), 'invalid-public-value');
    expect(calls).toBe(0);
  });
});

describe('A160-16 one existing consumption entry', () => {
  const entry = (number = 37): NumberingConsumptionEntry => ({
    number,
    status: 'applied',
    serverEntityId: 'source-server',
    finalizedAt: '2026-10-12T23:59:59.123456-03:00',
  });
  for (const [source, target] of [
    ['applied', 'aplicado'],
    ['claimed-locally', 'consumido_localmente'],
    ['available', 'disponivel'],
    ['blocked', 'bloqueado'],
    ['expired', 'expirado'],
  ] as const)
    it(`maps only ${source} to ${target} with exact scalar provenance`, async () => {
      const input = { ...entry(), status: source };
      freeze(input);
      expect((await api()).projectR22NumberingConsumptionEntry(input)).toEqual({
        kind: 'mapped',
        value: {
          number: 37,
          status: target,
          server_entity_id: 'source-server',
          finalized_at: '2026-10-12T23:59:59.123456-03:00',
        },
      });
    });
  for (const number of [
    -Number.MAX_SAFE_INTEGER,
    -1,
    0,
    Number.MAX_SAFE_INTEGER,
  ])
    it(`preserves safe integer ${number} without adding a product range limit`, async () => {
      expect(
        (await api()).projectR22NumberingConsumptionEntry(entry(number)),
      ).toEqual({
        kind: 'mapped',
        value: {
          number,
          status: 'aplicado',
          server_entity_id: 'source-server',
          finalized_at: '2026-10-12T23:59:59.123456-03:00',
        },
      });
    });
  it('preserves published null values', async () => {
    expect(
      (await api()).projectR22NumberingConsumptionEntry({
        ...entry(),
        serverEntityId: null,
        finalizedAt: null,
      }),
    ).toEqual({
      kind: 'mapped',
      value: {
        number: 37,
        status: 'aplicado',
        server_entity_id: null,
        finalized_at: null,
      },
    });
  });
  for (const [name, number] of [
    ['unsafe integer', Number.MAX_SAFE_INTEGER + 1],
    ['fraction', 1.5],
    ['NaN', NaN],
    ['infinity', Infinity],
    ['numeric string', '37'],
    ['bigint', 37n],
    ['null', null],
    ['undefined', undefined],
  ] as const)
    it(`refuses ${name} without numeric coercion/rounding`, async () => {
      checkpoint(
        (await api()).projectR22NumberingConsumptionEntry({
          ...entry(),
          number,
        } as unknown as NumberingConsumptionEntry),
        'invalid-public-value',
      );
    });
  it('refuses unknown consumption state', async () => {
    checkpoint(
      (await api()).projectR22NumberingConsumptionEntry({
        ...entry(),
        status: 'invented-state',
      } as unknown as NumberingConsumptionEntry),
      'invalid-public-value',
    );
  });
  for (const [field, value] of [
    ['serverEntityId', 42],
    ['serverEntityId', undefined],
    ['finalizedAt', new Date('2026-10-12')],
    ['finalizedAt', undefined],
  ] as const)
    it(`refuses malformed ${field} scalar ${String(value)}`, async () => {
      checkpoint(
        (await api()).projectR22NumberingConsumptionEntry({
          ...entry(),
          [field]: value,
        } as unknown as NumberingConsumptionEntry),
        'invalid-public-value',
      );
    });
  it('does not invoke required-number getters', async () => {
    const input = entry();
    let calls = 0;
    Object.defineProperty(input, 'number', {
      get() {
        calls++;
        return 37;
      },
      enumerable: true,
    });
    checkpoint(
      (await api()).projectR22NumberingConsumptionEntry(input),
      'invalid-public-value',
    );
    expect(calls).toBe(0);
  });
});
