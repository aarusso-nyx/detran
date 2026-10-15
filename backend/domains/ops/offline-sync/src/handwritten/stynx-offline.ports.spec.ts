// Inspector TEST_ONLY consumer ports; no SDK import. Missing module RED precedes implementation.
import { AsyncLocalStorage } from 'node:async_hooks';
import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
const tenant = '00000000-0000-7000-8000-000000000101',
  other = '00000000-0000-7000-8000-000000000102';
const actor = '00000000-0000-4000-8000-000000000201';
const at = '2026-10-13T12:00:00.000Z',
  deadline = '2026-10-13T14:00:00.000Z';
function nativeItem() {
  return {
    queueItemId: 'TEST_ONLY-queue',
    entityType: 'ait',
    localEntityId: 'TEST_ONLY-local',
    idempotencyKey: 'TEST_ONLY-native-key',
    payloadHash: 'sha256:' + 'a'.repeat(64),
    payloadJson: {
      ait: { ait_number: '5' },
      nullable: null,
      nested: { name: 'ação' },
    },
    createdLocallyAt: at,
  };
}
function nativeContext() {
  return {
    tenantId: tenant,
    actorId: actor,
    agentId: 'TEST_ONLY-business-agent',
    orgUnitId: 'TEST_ONLY-org',
    deviceId: 'TEST_ONLY-device',
    batchId: 'TEST_ONLY-batch',
    now: at,
    receiptId: 'TEST_ONLY-native-key',
    concurrencySuspected: true,
  };
}
async function ports() {
  return import('./stynx-offline.ports.js');
}
it('new apply handoff generates actual consumer UUID, preserves payload and same transaction/trusted scope', async () => {
  const { StynxOfflineItemApplier } = await ports();
  const item = nativeItem(),
    context = nativeContext();
  const tx = { query: vi.fn() };
  const details = {
    warnings: ['ação'],
    nullable: null,
    nested: { x: [1, false] },
  };
  const destination = {
    entityType: 'ait',
    validate: vi.fn(() => null),
    apply: vi.fn(async () => ({
      serverEntityId: 'TEST_ONLY-server',
      detailsJson: details,
    })),
  };
  const result = await new StynxOfflineItemApplier([
    destination,
  ] as never).apply(tx as never, item as never, context as never);
  expect(destination.validate).toHaveBeenCalledWith(item.payloadJson);
  expect(destination.apply).toHaveBeenCalledTimes(1);
  const [handed, sameTx] = destination.apply.mock.calls[0]! as unknown as [
    Record<string, unknown>,
    unknown,
  ];
  expect(sameTx).toBe(tx);
  expect(handed).toMatchObject({
    id: item.queueItemId,
    tenantId: tenant,
    agentId: context.agentId,
    trafficAgencyId: context.orgUnitId,
    deviceId: context.deviceId,
    storageMode: 'stynx-ctg9',
    payloadJson: item.payloadJson,
    concurrencySuspect: true,
  });
  expect(handed.receiptId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
  );
  expect(handed.receiptId).not.toBe(context.receiptId);
  expect(result).toEqual({
    serverEntityId: 'TEST_ONLY-server',
    consumerAttributes: {
      detranOffline: {
        version: 1,
        receiptId: handed.receiptId,
        queueItemId: item.queueItemId,
        detailsJson: details,
      },
    },
  });
  expect(tx.query).not.toHaveBeenCalled();
});
it('absent destination details remain omitted in applied metadata', async () => {
  const { StynxOfflineItemApplier } = await ports();
  const destination = {
    entityType: 'ait',
    validate: () => null,
    apply: vi.fn(async () => ({ serverEntityId: 'TEST_ONLY-server' })),
  };
  const r = await new StynxOfflineItemApplier([destination] as never).apply(
    {} as never,
    nativeItem() as never,
    nativeContext() as never,
  );
  expect(
    Object.keys(r.consumerAttributes!.detranOffline as object).sort(),
  ).toEqual(['version', 'receiptId', 'queueItemId'].sort());
});
for (const [name, details] of [
  ['oversized', { value: 'á'.repeat(4096) }],
  ['nonfinite', { value: Infinity }],
  ['undefined-member', { value: undefined }],
  ['bigint', { value: 1n }],
] as const)
  it(`internally produced ${name} details cannot confirm a result with lost metadata`, async () => {
    const { StynxOfflineItemApplier } = await ports();
    const destination = {
      entityType: 'ait',
      validate: () => null,
      apply: vi.fn(async () => ({
        serverEntityId: 'TEST_ONLY-server',
        detailsJson: details,
      })),
    };
    await expect(
      new StynxOfflineItemApplier([destination] as never).apply(
        {} as never,
        nativeItem() as never,
        nativeContext() as never,
      ),
    ).rejects.toMatchObject({ code: 'TEAT.INTERNAL' });
  });
it('original domain rejection is preserved rather than replaced by internal metadata code', async () => {
  const { StynxOfflineItemApplier } = await ports();
  const refusal = Object.assign(new Error('TEST_ONLY-domain'), {
    code: 'TEAT.AIT_NUMBER_DUPLICATE',
  });
  const destination = {
    entityType: 'ait',
    validate: () => null,
    apply: vi.fn(async () => {
      throw refusal;
    }),
  };
  await expect(
    new StynxOfflineItemApplier([destination] as never).apply(
      {} as never,
      nativeItem() as never,
      nativeContext() as never,
    ),
  ).rejects.toBe(refusal);
});
function handedItem() {
  const c = nativeContext(),
    i = nativeItem();
  return {
    id: i.queueItemId,
    tenantId: c.tenantId,
    trafficAgencyId: c.orgUnitId,
    deviceId: c.deviceId,
    agentId: c.agentId,
    entityType: i.entityType,
    localEntityId: i.localEntityId,
    idempotencyKey: i.idempotencyKey!,
    payloadHash: i.payloadHash,
    createdLocallyAt: i.createdLocallyAt,
    concurrencySuspect: true,
    receiptId: '00000000-0000-4000-8000-000000000501',
    storageMode: 'stynx-ctg9',
    payloadJson: i.payloadJson,
  };
}
function ruleRow() {
  return {
    reservation_id: '00000000-0000-4000-8000-000000000601',
    tenant_id: tenant,
    device_id: 'TEST_ONLY-device',
    org_unit_id: 'TEST_ONLY-org',
    entity_type: 'ait',
    shift_id: 'TEST_ONLY-shift',
    start_number: '1',
    end_number: '10',
    reservation_status: 'reserved',
    valid_until: deadline,
    consumption_number: '5',
    consumption_status: 'claimed-locally',
    server_entity_id: null,
  };
}
it('AIT rule port reads public storage in exactly the received transaction with no protocol lock/write', async () => {
  const { SqlStynxAitNumberingRulePort } = await ports();
  const tx = { query: vi.fn(async () => ({ rows: [ruleRow()] })) };
  await new SqlStynxAitNumberingRulePort().assertAitNumbering(
    handedItem() as never,
    tx as never,
    5,
    'TEST_ONLY-shift',
  );
  expect(tx.query).toHaveBeenCalledTimes(1);
  const [sql, values] = tx.query.mock.calls[0]! as unknown as [
    string,
    unknown[],
  ];
  expect(sql).toMatch(/^\s*select\b/iu);
  expect(sql).toContain('offline.numbering_reservations');
  expect(sql).toContain('offline.numbering_consumption');
  expect(sql).not.toMatch(
    /\b(?:insert|update|delete|truncate|for\s+(?:update|share))\b/iu,
  );
  expect(sql).not.toContain('ops.numbering');
  for (const v of [tenant, 'TEST_ONLY-device', 'TEST_ONLY-org', 'ait', 5])
    expect(values).toContain(v);
});
for (const [name, rows, code] of [
  ['absent', [], 'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT'],
  [
    'ambiguous',
    [ruleRow(), ruleRow()],
    'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
  ],
  [
    'foreign-tenant',
    [{ ...ruleRow(), tenant_id: other }],
    'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
  ],
  [
    'foreign-device',
    [{ ...ruleRow(), device_id: 'other' }],
    'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
  ],
  [
    'foreign-org',
    [{ ...ruleRow(), org_unit_id: 'other' }],
    'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
  ],
  [
    'foreign-entity',
    [{ ...ruleRow(), entity_type: 'crash-record' }],
    'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
  ],
  [
    'foreign-shift',
    [{ ...ruleRow(), shift_id: 'other' }],
    'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
  ],
  [
    'uncovered-number',
    [{ ...ruleRow(), start_number: '6' }],
    'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
  ],
  [
    'already-applied',
    [
      {
        ...ruleRow(),
        consumption_status: 'applied',
        server_entity_id: 'TEST_ONLY-server',
      },
    ],
    'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED',
  ],
  [
    'expired',
    [{ ...ruleRow(), valid_until: '2026-10-13T11:59:59.000Z' }],
    'TEAT.NUMBERING_RESERVATION_EXPIRED',
  ],
  [
    'blocked',
    [{ ...ruleRow(), reservation_status: 'blocked' }],
    'TEAT.NUMBERING_RESERVATION_EXPIRED',
  ],
] as const)
  it(`actual ${name} numbering source refuses with current domain code`, async () => {
    const { SqlStynxAitNumberingRulePort } = await ports();
    const tx = { query: vi.fn(async () => ({ rows })) };
    await expect(
      new SqlStynxAitNumberingRulePort().assertAitNumbering(
        handedItem() as never,
        tx as never,
        5,
        'TEST_ONLY-shift',
      ),
    ).rejects.toMatchObject({ code });
  });
function reserveInput(validUntil?: string) {
  return {
    orgUnitId: 'TEST_ONLY-org',
    entityType: 'ait',
    deviceId: 'TEST_ONLY-device',
    requestedSize: 1,
    rangeId: '00000000-0000-4000-8000-000000000601',
    series: 'A',
    idempotencyKey: 'TEST_ONLY-reserve',
    ...(validUntil === undefined ? {} : { validUntil }),
  };
}
async function reservationHarness(
  service: (
    input: ReturnType<typeof reserveInput>,
    resolve: (x: Record<string, unknown>) => Promise<unknown>,
  ) => Promise<unknown>,
  parameters?: unknown,
) {
  const { StynxOfflinePolicyResolver, StynxOfflineReservationPort } =
    await ports();
  const parameter = {
    get: vi.fn(async () => parameters ?? { source_pending: true }),
  };
  const policies = new StynxOfflinePolicyResolver(parameter as never);
  const context = {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId: tenant, actorId: actor }),
  };
  const native = {
    reserveDurableNumbering: vi.fn(
      async (input: ReturnType<typeof reserveInput>) =>
        service(input, (x) => policies.resolve(x as never)),
    ),
  };
  const port = new StynxOfflineReservationPort(
    native as never,
    policies,
    context,
  );
  return { policies, parameter, port, native };
}
const policyRequest = {
  tenantId: tenant,
  orgUnitId: 'TEST_ONLY-org',
  operation: 'reserve-numbering',
  at,
};
it('original future deadline is unchanged and derives exactly its positive TTL without catalog fallback', async () => {
  let observed: unknown;
  const h = await reservationHarness(async (i, resolve) => {
    observed = await resolve(policyRequest);
    return { reservationId: 'TEST_ONLY', validUntil: i.validUntil };
  });
  const i = reserveInput(deadline),
    before = structuredClone(i);
  await h.port.reserve(i as never);
  expect(i).toEqual(before);
  expect(h.native.reserveDurableNumbering).toHaveBeenCalledWith(before);
  expect(observed).toMatchObject({ reservationTtlMs: 7200000 });
  expect(h.parameter.get).not.toHaveBeenCalled();
});
for (const [field, value, code] of [
  ['tenantId', other, 'TEAT.TENANT_MISMATCH'],
  ['orgUnitId', 'OTHER', 'TEAT.VALIDATION_FAILED'],
  ['operation', 'submit-batch', 'TEAT.VALIDATION_FAILED'],
] as const)
  it(`future frame rejects mismatched ${field} rather than using fallback policy`, async () => {
    const h = await reservationHarness(async (_i, resolve) =>
      resolve({ ...policyRequest, [field]: value }),
    );
    await expect(
      h.port.reserve(reserveInput(deadline) as never),
    ).rejects.toMatchObject({ code });
    expect(h.parameter.get).not.toHaveBeenCalled();
  });
it('a failed reservation revokes its frame before a late inherited continuation resolves', async () => {
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });
  let late!: Promise<unknown>;
  const failed = Object.assign(new Error('TEST_ONLY'), {
    code: 'TEAT.TEST_ONLY',
  });
  const h = await reservationHarness(async (_i, resolve) => {
    late = (async () => {
      await gate;
      return resolve(policyRequest);
    })();
    throw failed;
  });
  await expect(h.port.reserve(reserveInput(deadline) as never)).rejects.toBe(
    failed,
  );
  const result = expect(late).rejects.toMatchObject({
    code: 'TEAT.VALIDATION_FAILED',
  });
  release();
  await result;
  expect(h.parameter.get).not.toHaveBeenCalled();
});
it('successful return also revokes the inherited future frame before a late continuation', async () => {
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });
  let late!: Promise<unknown>;
  const h = await reservationHarness(async (_i, resolve) => {
    late = (async () => {
      await gate;
      return resolve(policyRequest);
    })();
    return { reservationId: 'TEST_ONLY' };
  });
  await h.port.reserve(reserveInput(deadline) as never);
  const result = expect(late).rejects.toMatchObject({
    code: 'TEAT.VALIDATION_FAILED',
  });
  release();
  await result;
  expect(h.parameter.get).not.toHaveBeenCalled();
});
it('public replay returned before policy resolution preserves original result without catalog/TTL regeneration', async () => {
  const original = { reservationId: 'TEST_ONLY-replay', validUntil: deadline };
  const h = await reservationHarness(async () => original);
  expect(await h.port.reserve(reserveInput(deadline) as never)).toBe(original);
  expect(h.parameter.get).not.toHaveBeenCalled();
});
it('without explicit deadline the resolver still uses the existing scoped catalog TTL', async () => {
  let result: unknown;
  const h = await reservationHarness(
    async (_i, resolve) => {
      result = await resolve(policyRequest);
      return {};
    },
    { value_json: 2 },
  );
  await h.port.reserve(reserveInput() as never);
  expect(result).toMatchObject({ reservationTtlMs: 7200000 });
  expect(h.parameter.get).toHaveBeenCalledWith(
    'teat.numbering.reservation_ttl_hours',
    { agencyId: 'TEST_ONLY-org' },
  );
});
it('missing default TTL remains a typed required-input refusal', async () => {
  const h = await reservationHarness(async (_i, resolve) =>
    resolve(policyRequest),
  );
  await expect(h.port.reserve(reserveInput() as never)).rejects.toMatchObject({
    code: 'TEAT.VALIDATION_FAILED',
  });
});
it('concurrent future-deadline frames isolate trusted tenants, organizations and original deadlines', async () => {
  const { StynxOfflinePolicyResolver, StynxOfflineReservationPort } =
    await ports();
  const scopes = new AsyncLocalStorage<{ tenantId: string; actorId: string }>();
  const get = vi.fn(async () => ({ source_pending: true }));
  const policies = new StynxOfflinePolicyResolver({ get } as never);
  let release!: () => void;
  const barrier = new Promise<void>((r) => {
    release = r;
  });
  let entered = 0;
  const service = {
    reserveDurableNumbering: vi.fn(
      async (i: ReturnType<typeof reserveInput>) => {
        if (++entered === 2) release();
        await barrier;
        const scope = scopes.getStore()!;
        const p = await policies.resolve({
          tenantId: scope.tenantId,
          orgUnitId: i.orgUnitId,
          operation: 'reserve-numbering',
          at,
        } as never);
        return {
          validUntil: i.validUntil,
          ttl: p.reservationTtlMs,
          tenant: scope.tenantId,
          org: i.orgUnitId,
        };
      },
    ),
  };
  const port = new StynxOfflineReservationPort(service as never, policies, {
    hasActiveContext: () => !!scopes.getStore(),
    snapshot: () => scopes.getStore()!,
  });
  const a = reserveInput(deadline),
    b = {
      ...reserveInput('2026-10-13T15:00:00.000Z'),
      orgUnitId: 'TEST_ONLY-org-B',
    };
  const values = await Promise.all([
    scopes.run({ tenantId: tenant, actorId: actor }, () =>
      port.reserve(a as never),
    ),
    scopes.run({ tenantId: other, actorId: actor }, () =>
      port.reserve(b as never),
    ),
  ]);
  expect(values).toEqual([
    { validUntil: deadline, ttl: 7200000, tenant, org: 'TEST_ONLY-org' },
    {
      validUntil: b.validUntil,
      ttl: 10800000,
      tenant: other,
      org: 'TEST_ONLY-org-B',
    },
  ]);
  expect(get).not.toHaveBeenCalled();
});
it('nested reserve restores the outer original deadline and organization frame', async () => {
  const { StynxOfflinePolicyResolver, StynxOfflineReservationPort } =
    await ports();
  const get = vi.fn(async () => ({ source_pending: true }));
  const policies = new StynxOfflinePolicyResolver({ get } as never);
  let port: InstanceType<typeof StynxOfflineReservationPort>;
  const seen: number[] = [];
  const service = {
    reserveDurableNumbering: vi.fn(
      async (i: ReturnType<typeof reserveInput>) => {
        const resolve = () =>
          policies.resolve({
            ...policyRequest,
            orgUnitId: i.orgUnitId,
          } as never);
        seen.push((await resolve()).reservationTtlMs!);
        if (i.orgUnitId === 'TEST_ONLY-org') {
          await port.reserve({
            ...reserveInput('2026-10-13T13:00:00.000Z'),
            orgUnitId: 'TEST_ONLY-inner',
          } as never);
          seen.push((await resolve()).reservationTtlMs!);
        }
        return { reservationId: 'TEST_ONLY', validUntil: i.validUntil };
      },
    ),
  };
  port = new StynxOfflineReservationPort(service as never, policies, {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId: tenant, actorId: actor }),
  });
  await port.reserve(reserveInput(deadline) as never);
  expect(seen).toEqual([7200000, 3600000, 7200000]);
  expect(get).not.toHaveBeenCalled();
});
it('future frame cannot authorize another policy-resolver instance or fall back through it', async () => {
  const { StynxOfflinePolicyResolver, StynxOfflineReservationPort } =
    await ports();
  const get = vi.fn(async () => ({ value_json: 2 }));
  const a = new StynxOfflinePolicyResolver({ get } as never),
    b = new StynxOfflinePolicyResolver({ get } as never);
  const service = {
    reserveDurableNumbering: vi.fn(async () =>
      b.resolve(policyRequest as never),
    ),
  };
  const port = new StynxOfflineReservationPort(service as never, a, {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId: tenant, actorId: actor }),
  });
  await expect(
    port.reserve(reserveInput(deadline) as never),
  ).rejects.toMatchObject({ code: 'TEAT.VALIDATION_FAILED' });
  expect(get).not.toHaveBeenCalled();
});
it('mutation of caller input during await cannot rewrite the captured original native deadline', async () => {
  let release!: () => void;
  const barrier = new Promise<void>((r) => {
    release = r;
  });
  let entered!: () => void;
  const started = new Promise<void>((r) => {
    entered = r;
  });
  const h = await reservationHarness(async (i, resolve) => {
    entered();
    await barrier;
    const policy = await resolve(policyRequest);
    return { validUntil: i.validUntil, policy };
  });
  const input = reserveInput(deadline);
  const work = h.port.reserve(input as never);
  await started;
  input.validUntil = '2026-10-13T16:00:00.000Z';
  release();
  expect(await work).toMatchObject({
    validUntil: deadline,
    policy: { reservationTtlMs: 7200000 },
  });
});
for (const [name, atValue] of [
  [
    'nonstring-time',
    {
      toString() {
        throw Error('Coercion forbidden');
      },
    },
  ],
  ['invalid-time', 'not-a-time'],
  ['promise-request', Promise.resolve(policyRequest)],
] as const)
  it(`malformed ${name} direct policy request refuses with typed validation and no catalog fallback`, async () => {
    const { StynxOfflinePolicyResolver } = await ports();
    const get = vi.fn(async () => ({ value_json: 2 }));
    const resolver = new StynxOfflinePolicyResolver({ get } as never);
    const request =
      name === 'promise-request' ? atValue : { ...policyRequest, at: atValue };
    await expect(resolver.resolve(request as never)).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
    });
    expect(get).not.toHaveBeenCalled();
  });
it('descriptor-bearing direct policy request never invokes a getter or reaches the catalog', async () => {
  const { StynxOfflinePolicyResolver } = await ports();
  const get = vi.fn(async () => ({ value_json: 2 }));
  const resolver = new StynxOfflinePolicyResolver({ get } as never);
  let touched = 0;
  const request = Object.defineProperty({ ...policyRequest }, 'at', {
    get() {
      touched++;
      return at;
    },
  });
  await expect(resolver.resolve(request as never)).rejects.toMatchObject({
    code: 'TEAT.VALIDATION_FAILED',
  });
  expect(touched).toBe(0);
  expect(get).not.toHaveBeenCalled();
});

// Prospective 88c36a48 source-derived reservation selection vectors. Mock rows are NOT native overlap proof.
it('source reservation identity is admitted in the trusted handoff and fixed SQL selection', () => {
  const core = readFileSync(
    new URL('../../../core/src/sync-applier.ts', import.meta.url),
    'utf8',
  );
  const implementation = readFileSync(
    new URL('./stynx-offline.ports.ts', import.meta.url),
    'utf8',
  );
  expect(core).toMatch(/reservationId\??\s*:\s*string/u);
  expect(implementation).toContain('item.reservationId');
  expect(implementation).toMatch(/r\.id\s*=\s*\$[0-9]+(?:::[a-z]+)?/iu);
});
for (const reservationId of [undefined, '00000000-0000-4000-8000-00000000060A'])
  it(`native original reservationId ${reservationId === undefined ? 'absence' : 'lexical value'} is preserved without substitution`, async () => {
    const { StynxOfflineItemApplier } = await ports();
    const item = {
      ...nativeItem(),
      ...(reservationId === undefined ? {} : { reservationId }),
    };
    const destination = {
      entityType: 'ait',
      validate: () => null,
      apply: vi.fn(async (_item: Record<string, unknown>, _tx: unknown) => ({
        serverEntityId: 'TEST_ONLY-server',
      })),
    };
    await new StynxOfflineItemApplier([destination] as never).apply(
      {} as never,
      item as never,
      nativeContext() as never,
    );
    const handed = destination.apply.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    expect(Object.hasOwn(handed, 'reservationId')).toBe(
      reservationId !== undefined,
    );
    if (reservationId !== undefined)
      expect(handed.reservationId).toBe(reservationId);
  });
it('explicit original reservation selects the covered row through a fixed UUID parameter and preserves same transaction', async () => {
  const { SqlStynxAitNumberingRulePort } = await ports();
  const reservationId = '00000000-0000-4000-8000-00000000060A';
  const covering = [
    ruleRow(),
    { ...ruleRow(), reservation_id: reservationId.toLowerCase() },
  ];
  const tx = {
    query: vi.fn(async (_sql: string, values: readonly unknown[] = []) => ({
      rows: covering.filter(
        (r) =>
          r.reservation_id.toLowerCase() ===
          String(values.find((v) => v === reservationId)).toLowerCase(),
      ),
    })),
  };
  await new SqlStynxAitNumberingRulePort().assertAitNumbering(
    { ...handedItem(), reservationId } as never,
    tx as never,
    5,
    'TEST_ONLY-shift',
  );
  expect(tx.query).toHaveBeenCalledTimes(1);
  const [sql, values] = tx.query.mock.calls[0]!;
  expect(values).toContain(reservationId);
  expect(sql).toMatch(/r\.id\s*=\s*\$[0-9]+::uuid/iu);
  expect(sql).not.toMatch(
    /\b(?:insert|update|delete|truncate|for\s+(?:update|share))\b/iu,
  );
});
for (const [name, rows, reservationId] of [
  ['wrong-row', [ruleRow()], '00000000-0000-4000-8000-00000000060a'],
  [
    'foreign-selected-row',
    [{ ...ruleRow(), tenant_id: other }],
    ruleRow().reservation_id,
  ],
  [
    'absent-ambiguous',
    [
      ruleRow(),
      { ...ruleRow(), reservation_id: '00000000-0000-4000-8000-00000000060a' },
    ],
    undefined,
  ],
  ['explicit-duplicate', [ruleRow(), ruleRow()], ruleRow().reservation_id],
] as const)
  it(`reservation selection ${name} refuses without picking the first row`, async () => {
    const { SqlStynxAitNumberingRulePort } = await ports();
    const tx = { query: vi.fn(async () => ({ rows })) };
    await expect(
      new SqlStynxAitNumberingRulePort().assertAitNumbering(
        {
          ...handedItem(),
          ...(reservationId === undefined ? {} : { reservationId }),
        } as never,
        tx as never,
        5,
        'TEST_ONLY-shift',
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
    });
    expect(tx.query).toHaveBeenCalledTimes(1);
  });
