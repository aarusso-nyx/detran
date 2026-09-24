import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';
import { FORM_CONTRACT_FIXTURES } from '../testing/form-contract.fixture';
import { loadMobileRuntime } from '../testing/runtime-module';
import {
  LocalActStore,
  type PinAitNumberAtomicOperation,
} from './data/local/local-act.store';
import { BootstrapStore } from './core/bootstrap.store';
import { MobileBootstrapClient } from './data/api/mobile-bootstrap.client';
import { ProvisioningClient } from './data/api/provisioning.client';
import {
  MobilePageRuntime,
  type MobileCommandContext,
} from './shared/mobile-page.component';

// `series: F` is sourced from the authoritative ops.ait_numbering_range row
// joined to this reservation by range_id in the backend bootstrap fixture.
const authority = {
  reservationId: 'reservation-001',
  rangeId: 'range-001',
  entityType: 'ait',
  series: 'F',
  startNumber: 101,
  endNumber: 102,
  nextNumber: 101,
  validUntil: '2999-01-01T00:00:00.000Z',
  status: 'reserved',
  tenantId: 'tenant-001',
  agentId: 'agent-001',
  deviceId: 'device-001',
  shiftId: 'shift-001',
} as const;
const scope: {
  tenantId: string;
  agentId: string;
  deviceId: string;
  shiftId: string;
} = {
  tenantId: authority.tenantId,
  agentId: authority.agentId,
  deviceId: authority.deviceId,
  shiftId: authority.shiftId,
};
const now = '2026-09-22T12:00:00.000Z';
const draft = {
  localId: 'ait-local-001',
  entityType: 'ait' as const,
  ...scope,
  orgUnitId: 'unit-001',
  status: 'draft' as const,
  idempotencyKey: 'idempotency-001',
  normativePackageId: 'pkg-001',
  normativePackageVersion: '2026.09',
  localContentHash: 'sha256:draft-001',
  payload: { plate: 'ABC1D23' },
  location: {
    latitude: -3.1,
    longitude: -60.0,
    accuracyMeters: 10,
    capturedAt: now,
    source: 'gps' as const,
  },
  evidence: [],
  createdAt: now,
  updatedAt: now,
};
const currentBootstrapAuthority = {
  snapshot: { validUntil: '2999-01-01T00:00:00.000Z' },
  readiness: { blockers: [] },
  context: {
    tenantId: scope.tenantId,
    agent: { id: scope.agentId },
    device: {
      id: scope.deviceId,
      status: 'authorized',
      homologated: true,
      tamperDetected: false,
    },
    session: { exclusive: true },
    activeShift: { id: scope.shiftId, status: 'open' },
  },
  normativePackage: {
    manifestHash: 'sha256:manifest',
    validUntil: '2999-01-01T00:00:00.000Z',
  },
  capabilities: { canOperateOffline: true },
  numberingReservations: [
    {
      id: authority.reservationId,
      rangeId: authority.rangeId,
      series: authority.series,
      shiftId: scope.shiftId,
      startNumber: authority.startNumber,
      endNumber: authority.endNumber,
      validUntil: authority.validUntil,
      status: 'reserved',
    },
  ],
};

type PinInput = Readonly<{
  reservationId: string;
  now: string;
  scope: typeof scope;
  draft: typeof draft;
}>;
type PinnedDraft = typeof draft & {
  reservedNumber: number;
  reservationId: string;
};
type PinStore = {
  pinAitNumberAndPutFirstDraft(input: PinInput): Promise<PinnedDraft>;
  draft(id: string): Promise<PinnedDraft | undefined>;
  pending(): Promise<readonly unknown[]>;
};

async function localStore(port: EncryptedStoreFixture): Promise<PinStore> {
  const runtime = await loadMobileRuntime('data/local/local-act.store');
  const Store = runtime['LocalActStore'] as new (
    port: EncryptedStoreFixture,
  ) => PinStore;
  return new Store(port);
}

function request(overrides: Partial<PinInput> = {}): PinInput {
  return {
    reservationId: authority.reservationId,
    now,
    scope,
    draft,
    ...overrides,
  };
}

async function persistInitialPin() {
  const port = new EncryptedStoreFixture() as EncryptedStoreFixture & {
    pinAitNumberAndPutFirstDraftAtomic: ReturnType<typeof vi.fn>;
  };
  await port.put('reservation', authority.reservationId, authority);
  port.pinAitNumberAndPutFirstDraftAtomic = vi.fn(
    async (operation: PinAitNumberAtomicOperation) => {
      await port.put(
        'reservation',
        authority.reservationId,
        operation.replacementReservation,
      );
      await port.put('draft', operation.draft.localId, operation.draft);
      await port.put('ait-open-draft', operation.openDraftKey, {
        localId: operation.draft.localId,
        reservationId: operation.draft.reservationId,
        idempotencyKey: operation.draft.idempotencyKey,
        ...scope,
      });
      await port.put(
        'ait-draft-selector',
        operation.openDraftKey,
        operation.selector,
      );
      return 'created';
    },
  );
  const store = await localStore(port);
  const pinned = await store.pinAitNumberAndPutFirstDraft(request());
  port.pinAitNumberAndPutFirstDraftAtomic.mockClear();
  return { port, store, pinned };
}

describe('RN-TEAT-113/114, WF-TEAT-002 — atomic local AIT number pinning', () => {
  it('fails closed when the encrypted port has no atomic reservation+draft capability', async () => {
    const port = new EncryptedStoreFixture();
    await port.put('reservation', authority.reservationId, authority);
    const store = await localStore(port);
    await expect(
      store.pinAitNumberAndPutFirstDraft(request()),
    ).rejects.toThrow();
    expect(await port.get('reservation', authority.reservationId)).toEqual(
      authority,
    );
    expect(await store.draft(draft.localId)).toBeUndefined();
    expect(await store.pending()).toEqual([]);
  });

  it.each([
    ['expired', { validUntil: now }],
    ['cancelled', { status: 'cancelled' }],
    ['foreign tenant', { tenantId: 'foreign-tenant' }],
    ['foreign agent', { agentId: 'foreign-agent' }],
    ['foreign device', { deviceId: 'foreign-device' }],
    ['foreign shift', { shiftId: 'foreign-shift' }],
    ['exhausted', { nextNumber: 103 }],
    ['missing authoritative series', { series: '' }],
  ])(
    'rejects %s reservation before any atomic write',
    async (_label, change) => {
      const port = new EncryptedStoreFixture() as EncryptedStoreFixture & {
        pinAitNumberAndPutFirstDraftAtomic: ReturnType<typeof vi.fn>;
      };
      port.pinAitNumberAndPutFirstDraftAtomic = vi.fn();
      await port.put('reservation', authority.reservationId, {
        ...authority,
        ...change,
      });
      const store = await localStore(port);
      await expect(
        store.pinAitNumberAndPutFirstDraft(request()),
      ).rejects.toThrow();
      expect(port.pinAitNumberAndPutFirstDraftAtomic).not.toHaveBeenCalled();
      expect(await port.get('reservation', authority.reservationId)).toEqual({
        ...authority,
        ...change,
      });
      expect(await store.draft(draft.localId)).toBeUndefined();
      expect(await store.pending()).toEqual([]);
    },
  );

  it('rejects an absent reservation and absent trusted scope without writes', async () => {
    const port = new EncryptedStoreFixture() as EncryptedStoreFixture & {
      pinAitNumberAndPutFirstDraftAtomic: ReturnType<typeof vi.fn>;
    };
    port.pinAitNumberAndPutFirstDraftAtomic = vi.fn();
    const store = await localStore(port);
    await expect(
      store.pinAitNumberAndPutFirstDraft(request()),
    ).rejects.toThrow();
    await port.put('reservation', authority.reservationId, authority);
    await expect(
      store.pinAitNumberAndPutFirstDraft(
        request({
          scope: { ...scope, shiftId: '' },
        }),
      ),
    ).rejects.toThrow();
    expect(port.pinAitNumberAndPutFirstDraftAtomic).not.toHaveBeenCalled();
    expect(await store.draft(draft.localId)).toBeUndefined();
    expect(await store.pending()).toEqual([]);
  });

  it('pins the authoritative next number and persists draft plus cursor through one mandatory atomic call, without queueing', async () => {
    const port = new EncryptedStoreFixture() as EncryptedStoreFixture & {
      pinAitNumberAndPutFirstDraftAtomic: ReturnType<typeof vi.fn>;
    };
    await port.put('reservation', authority.reservationId, authority);
    port.pinAitNumberAndPutFirstDraftAtomic = vi.fn(
      async (operation: {
        expectedReservation: typeof authority;
        replacementReservation: typeof authority;
        draft: PinnedDraft;
        openDraftKey: string;
        selector: {
          localEntityId: string;
          idempotencyKey: string;
          reservationId: string;
        };
      }) => {
        expect(operation.expectedReservation).toEqual(authority);
        expect(operation.replacementReservation).toMatchObject({
          reservationId: authority.reservationId,
          nextNumber: 102,
        });
        expect(operation.draft).toMatchObject({
          localId: draft.localId,
          reservationId: authority.reservationId,
          reservedNumber: 101,
          status: 'draft',
        });
        expect(operation.openDraftKey).toBe(
          `${scope.tenantId}:${scope.agentId}:${scope.deviceId}:${scope.shiftId}`,
        );
        expect(operation.selector).toMatchObject({
          localEntityId: draft.localId,
          idempotencyKey: draft.idempotencyKey,
          reservationId: authority.reservationId,
          ...scope,
        });
        await port.put(
          'reservation',
          authority.reservationId,
          operation.replacementReservation,
        );
        await port.put('draft', draft.localId, operation.draft);
        await port.put('ait-open-draft', operation.openDraftKey, {
          localId: operation.draft.localId,
          reservationId: operation.draft.reservationId,
          idempotencyKey: operation.draft.idempotencyKey,
          ...scope,
        });
        await port.put(
          'ait-draft-selector',
          operation.openDraftKey,
          operation.selector,
        );
        return 'created';
      },
    );
    const store = await localStore(port);
    const pinned = await store.pinAitNumberAndPutFirstDraft(request());
    expect(pinned).toMatchObject({
      reservedNumber: 101,
      reservationId: authority.reservationId,
    });
    expect(port.pinAitNumberAndPutFirstDraftAtomic).toHaveBeenCalledTimes(1);
    expect(await store.draft(draft.localId)).toEqual(pinned);
    expect(
      await port.get<{ nextNumber: number }>(
        'reservation',
        authority.reservationId,
      ),
    ).toMatchObject({ nextNumber: 102 });
    expect(await store.pending()).toEqual([]);
  });

  it('does not consume another number or mutate records on an exact identity replay', async () => {
    const { port, store, pinned } = await persistInitialPin();
    const advanced = { ...authority, nextNumber: 102 };
    expect(await store.pinAitNumberAndPutFirstDraft(request())).toEqual(pinned);
    expect(port.pinAitNumberAndPutFirstDraftAtomic).not.toHaveBeenCalled();
    expect(await port.get('reservation', authority.reservationId)).toEqual(
      advanced,
    );
    expect(await store.pending()).toEqual([]);
  });

  it('rejects a conflicting replay without changing the pinned draft or cursor', async () => {
    const { port, store, pinned } = await persistInitialPin();
    const advanced = { ...authority, nextNumber: 102 };
    await expect(
      store.pinAitNumberAndPutFirstDraft(
        request({
          draft: { ...draft, payload: { plate: 'CONFLICT' } },
        }),
      ),
    ).rejects.toThrow();
    expect(port.pinAitNumberAndPutFirstDraftAtomic).not.toHaveBeenCalled();
    expect(await store.draft(draft.localId)).toEqual(pinned);
    expect(await port.get('reservation', authority.reservationId)).toEqual(
      advanced,
    );
    expect(await store.pending()).toEqual([]);
  });
});

describe('RN-TEAT-113/114 — first AIT route uses the pinned result, never caller numbering', () => {
  const context: MobileCommandContext = {
    session: {
      tenantId: scope.tenantId,
      orgUnitId: 'unit-001',
      agentId: scope.agentId,
      deviceId: scope.deviceId,
      shiftId: scope.shiftId,
      appVersion: '1.0.0',
      roles: ['field-agent'],
    },
    localEntityId: draft.localId,
    entityType: 'ait',
    version: 1,
    idempotencyKey: draft.idempotencyKey,
    payloadHash: draft.localContentHash,
    createdLocallyAt: now,
    normativePackageId: draft.normativePackageId,
    normativePackageVersion: draft.normativePackageVersion,
    reservationId: authority.reservationId,
    reservedNumber: 999,
    ifMatch: '"version-1"',
    location: draft.location,
  };
  const page = { screenId: 'ait-start', sourceSheet: 'IU-TEAT-ait-start.md' };

  it('returns the persisted AIT id from the atomic result, including replay with a new caller id, without queueing', async () => {
    const encrypted = new EncryptedStoreFixture();
    const actual = new LocalActStore(encrypted);
    const pinned = {
      ...draft,
      localId: 'ait-original-after-crash',
      localRevision: 1,
      reservedNumber: 101,
      reservationId: authority.reservationId,
    };
    const pin = vi.fn(async (_input: unknown) => {
      void _input;
      return pinned;
    });
    const putDraft = vi.fn();
    const putQueueItem = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BootstrapStore,
          useValue: {
            state: () => ({
              status: 'ready',
              bootstrap: currentBootstrapAuthority,
            }),
            snapshot: () => currentBootstrapAuthority,
            provisioningSnapshot: () => ({ ready: true, blockers: [] }),
          },
        },
        {
          provide: LocalActStore,
          useValue: {
            ...actual,
            draft: actual.draft.bind(actual),
            reservationAuthority: vi.fn(async () => authority),
            pinAitNumberAndPutFirstDraft: pin,
            putDraft,
            putQueueItem,
          },
        },
      ],
    });
    const integration = TestBed.inject(MobilePageRuntime).load(page);
    await expect(
      integration.submit?.({ reserved_number: '999' }, context),
    ).resolves.toEqual({
      kind: 'persisted',
      localEntityId: pinned.localId,
    });
    expect(pin).toHaveBeenCalledTimes(1);
    expect(pin).toHaveBeenCalledWith(
      expect.objectContaining({
        reservationId: authority.reservationId,
        scope,
        draft: expect.objectContaining({
          payload: expect.not.objectContaining({ reserved_number: '999' }),
        }),
      }),
    );
    expect(pin.mock.calls[0]?.[0]).not.toHaveProperty('draft.reservedNumber');
    expect(putDraft).not.toHaveBeenCalled();
    expect(putQueueItem).not.toHaveBeenCalled();
    expect(await actual.pending()).toEqual([]);
  });

  it('fails closed on the first AIT route when the atomic capability is unavailable', async () => {
    const encrypted = new EncryptedStoreFixture();
    const actual = new LocalActStore(encrypted);
    const putDraft = vi.fn();
    const putQueueItem = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BootstrapStore,
          useValue: {
            state: () => ({
              status: 'ready',
              bootstrap: currentBootstrapAuthority,
            }),
            snapshot: () => currentBootstrapAuthority,
            provisioningSnapshot: () => ({ ready: true, blockers: [] }),
          },
        },
        {
          provide: LocalActStore,
          useValue: {
            ...actual,
            draft: actual.draft.bind(actual),
            reservationAuthority: vi.fn(async () => authority),
            putDraft,
            putQueueItem,
          },
        },
      ],
    });
    const integration = TestBed.inject(MobilePageRuntime).load(page);
    await expect(integration.submit?.({}, context)).resolves.toMatchObject({
      kind: 'blocked',
    });
    expect(putDraft).not.toHaveBeenCalled();
    expect(putQueueItem).not.toHaveBeenCalled();
    expect(await actual.pending()).toEqual([]);
  });

  it.each([
    ['cleared bootstrap', undefined, 'anonymous'],
    ['blocked bootstrap', currentBootstrapAuthority, 'blocked'],
    [
      'foreign tenant',
      {
        ...currentBootstrapAuthority,
        context: {
          ...currentBootstrapAuthority.context,
          tenantId: 'foreign-tenant',
        },
      },
      'ready',
    ],
    [
      'foreign agent',
      {
        ...currentBootstrapAuthority,
        context: {
          ...currentBootstrapAuthority.context,
          agent: { id: 'foreign-agent' },
        },
      },
      'ready',
    ],
    [
      'foreign device',
      {
        ...currentBootstrapAuthority,
        context: {
          ...currentBootstrapAuthority.context,
          device: { id: 'foreign-device' },
        },
      },
      'ready',
    ],
    [
      'prior shift',
      {
        ...currentBootstrapAuthority,
        context: {
          ...currentBootstrapAuthority.context,
          activeShift: { id: 'prior-shift', status: 'open' },
        },
      },
      'ready',
    ],
    [
      'foreign range',
      {
        ...currentBootstrapAuthority,
        numberingReservations: [
          {
            ...currentBootstrapAuthority.numberingReservations[0],
            rangeId: 'foreign-range',
          },
        ],
      },
      'ready',
    ],
    [
      'foreign series',
      {
        ...currentBootstrapAuthority,
        numberingReservations: [
          {
            ...currentBootstrapAuthority.numberingReservations[0],
            series: 'G',
          },
        ],
      },
      'ready',
    ],
    [
      'expired reservation',
      {
        ...currentBootstrapAuthority,
        numberingReservations: [
          {
            ...currentBootstrapAuthority.numberingReservations[0],
            validUntil: '2000-01-01T00:00:00.000Z',
          },
        ],
      },
      'ready',
    ],
    [
      'expired bootstrap snapshot',
      {
        ...currentBootstrapAuthority,
        snapshot: { validUntil: '2000-01-01T00:00:00.000Z' },
      },
      'ready',
    ],
    [
      'missing bootstrap snapshot expiry',
      {
        ...currentBootstrapAuthority,
        snapshot: { validUntil: null },
      },
      'ready',
    ],
    [
      'malformed bootstrap snapshot expiry',
      {
        ...currentBootstrapAuthority,
        snapshot: { validUntil: 'not-a-date' },
      },
      'ready',
    ],
    [
      'non-exclusive session',
      {
        ...currentBootstrapAuthority,
        context: {
          ...currentBootstrapAuthority.context,
          session: { exclusive: false },
        },
      },
      'ready',
    ],
    [
      'blocked device',
      {
        ...currentBootstrapAuthority,
        context: {
          ...currentBootstrapAuthority.context,
          device: {
            ...currentBootstrapAuthority.context.device,
            status: 'blocked',
          },
        },
      },
      'ready',
    ],
    [
      'non-homologated device',
      {
        ...currentBootstrapAuthority,
        context: {
          ...currentBootstrapAuthority.context,
          device: {
            ...currentBootstrapAuthority.context.device,
            homologated: false,
          },
        },
      },
      'ready',
    ],
    [
      'tampered device',
      {
        ...currentBootstrapAuthority,
        context: {
          ...currentBootstrapAuthority.context,
          device: {
            ...currentBootstrapAuthority.context.device,
            tamperDetected: true,
          },
        },
      },
      'ready',
    ],
    [
      'missing normative package',
      {
        ...currentBootstrapAuthority,
        normativePackage: { manifestHash: '', validUntil: null },
      },
      'ready',
    ],
    [
      'offline capability denied',
      {
        ...currentBootstrapAuthority,
        capabilities: { canOperateOffline: false },
      },
      'ready',
    ],
  ])(
    'blocks ait-start with %s even when a local reservation was previously installed',
    async (_label, bootstrap, status) => {
      const encrypted = new EncryptedStoreFixture();
      await encrypted.put('reservation', authority.reservationId, authority);
      const pin = vi.fn(async () => ({
        ...draft,
        reservedNumber: 101,
        reservationId: authority.reservationId,
      }));
      const putQueueItem = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: BootstrapStore,
            useValue: {
              state: () => ({
                status,
                ...(status === 'ready' ? { bootstrap } : {}),
              }),
              snapshot: () => bootstrap,
              provisioningSnapshot: () => ({ ready: true, blockers: [] }),
            },
          },
          {
            provide: LocalActStore,
            useValue: {
              draft: vi.fn(async () => undefined),
              reservationAuthority: vi.fn(async () =>
                encrypted.get('reservation', authority.reservationId),
              ),
              pinAitNumberAndPutFirstDraft: pin,
              putQueueItem,
            },
          },
        ],
      });
      const integration = TestBed.inject(MobilePageRuntime).load(page);
      await expect(integration.submit?.({}, context)).resolves.toMatchObject({
        kind: 'blocked',
      });
      expect(pin).not.toHaveBeenCalled();
      expect(putQueueItem).not.toHaveBeenCalled();
      expect(
        await encrypted.get('reservation', authority.reservationId),
      ).toEqual(authority);
      expect(await encrypted.list('draft')).toEqual([]);
      expect(await encrypted.list('queue')).toEqual([]);
    },
  );

  it.each([
    ['missing provisioning', undefined],
    ['provisioning not ready', { ready: false, blockers: [] }],
    [
      'provisioning blocker',
      { ready: true, blockers: [{ code: 'DEVICE_BLOCKED' }] },
    ],
  ])('blocks ait-start with %s', async (_label, provisioning) => {
    const pin = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BootstrapStore,
          useValue: {
            state: () => ({ status: 'ready' }),
            snapshot: () => currentBootstrapAuthority,
            provisioningSnapshot: () => provisioning,
          },
        },
        {
          provide: LocalActStore,
          useValue: {
            reservationAuthority: vi.fn(async () => authority),
            pinAitNumberAndPutFirstDraft: pin,
          },
        },
      ],
    });
    const integration = TestBed.inject(MobilePageRuntime).load(page);
    await expect(integration.submit?.({}, context)).resolves.toMatchObject({
      kind: 'blocked',
    });
    expect(pin).not.toHaveBeenCalled();
  });

  it('blocks ait-start when bootstrap readiness still has blockers', async () => {
    const pin = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BootstrapStore,
          useValue: {
            state: () => ({ status: 'ready' }),
            snapshot: () => ({
              ...currentBootstrapAuthority,
              readiness: { blockers: ['DEVICE_NOT_AUTHORIZED'] },
            }),
            provisioningSnapshot: () => ({ ready: true, blockers: [] }),
          },
        },
        {
          provide: LocalActStore,
          useValue: {
            reservationAuthority: vi.fn(async () => authority),
            pinAitNumberAndPutFirstDraft: pin,
          },
        },
      ],
    });
    const integration = TestBed.inject(MobilePageRuntime).load(page);
    await expect(integration.submit?.({}, context)).resolves.toMatchObject({
      kind: 'blocked',
    });
    expect(pin).not.toHaveBeenCalled();
  });

  it('edits an already pinned AIT with its durable number and keeps the incomplete draft out of sync', async () => {
    const encrypted = new EncryptedStoreFixture();
    const pinned = {
      ...draft,
      localRevision: 1,
      reservedNumber: 101,
      reservationId: authority.reservationId,
      payload: { reserved_number: '101' },
    };
    const transitionDraft = vi.fn();
    const putDraft = vi.fn();
    const putQueueItem = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalActStore,
          useValue: {
            draft: vi.fn(async () => pinned),
            transitionDraft,
            putDraft,
            putQueueItem,
          },
        },
      ],
    });
    const integration = TestBed.inject(MobilePageRuntime).load({
      screenId: 'ait-vehicle',
      sourceSheet: 'IU-TEAT-ait-vehicle.md',
    });
    await expect(
      integration.submit?.(FORM_CONTRACT_FIXTURES[1].validPayload, context),
    ).resolves.toEqual({ kind: 'persisted', localEntityId: draft.localId });
    expect(transitionDraft).toHaveBeenCalledWith(
      pinned,
      expect.objectContaining({
        localRevision: 2,
        reservedNumber: 101,
        reservationId: authority.reservationId,
        payload: expect.objectContaining({ reserved_number: '101' }),
      }),
    );
    expect(putDraft).not.toHaveBeenCalled();
    expect(putQueueItem).not.toHaveBeenCalled();
    expect(await encrypted.list('queue')).toEqual([]);
  });

  it('blocks ait-start when caller labels the new entity as a non-AIT type', async () => {
    const pin = vi.fn();
    const putDraft = vi.fn();
    const putQueueItem = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalActStore,
          useValue: {
            draft: vi.fn(),
            pinAitNumberAndPutFirstDraft: pin,
            putDraft,
            putQueueItem,
          },
        },
      ],
    });
    const integration = TestBed.inject(MobilePageRuntime).load(page);
    await expect(
      integration.submit?.(
        {},
        {
          ...context,
          entityType: 'administrative-measure',
        },
      ),
    ).resolves.toMatchObject({ kind: 'blocked' });
    expect(pin).not.toHaveBeenCalled();
    expect(putDraft).not.toHaveBeenCalled();
    expect(putQueueItem).not.toHaveBeenCalled();
  });

  it('blocks an AIT edit route without an already pinned local draft', async () => {
    const putDraft = vi.fn();
    const putQueueItem = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalActStore,
          useValue: {
            draft: vi.fn(async () => undefined),
            putDraft,
            putQueueItem,
          },
        },
      ],
    });
    const integration = TestBed.inject(MobilePageRuntime).load({
      screenId: 'ait-vehicle',
      sourceSheet: 'IU-TEAT-ait-vehicle.md',
    });
    await expect(
      integration.submit?.(FORM_CONTRACT_FIXTURES[1].validPayload, context),
    ).resolves.toMatchObject({ kind: 'blocked' });
    expect(putDraft).not.toHaveBeenCalled();
    expect(putQueueItem).not.toHaveBeenCalled();
  });

  it.each([
    ['stale local revision', { version: 0 }],
    ['foreign reservation', { reservationId: 'foreign-reservation' }],
    [
      'foreign device',
      { session: { ...context.session, deviceId: 'foreign-device' } },
    ],
    [
      'foreign agent',
      { session: { ...context.session, agentId: 'foreign-agent' } },
    ],
    [
      'foreign shift',
      { session: { ...context.session, shiftId: 'foreign-shift' } },
    ],
  ])(
    'blocks an AIT edit with %s rather than rewriting or queueing the pinned draft',
    async (_label, change) => {
      const pinned = {
        ...draft,
        localRevision: 1,
        reservedNumber: 101,
        reservationId: authority.reservationId,
        payload: { reserved_number: '101' },
      };
      const transitionDraft = vi.fn();
      const putDraft = vi.fn();
      const putQueueItem = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: LocalActStore,
            useValue: {
              draft: vi.fn(async () => pinned),
              transitionDraft,
              putDraft,
              putQueueItem,
            },
          },
        ],
      });
      const integration = TestBed.inject(MobilePageRuntime).load({
        screenId: 'ait-vehicle',
        sourceSheet: 'IU-TEAT-ait-vehicle.md',
      });
      await expect(
        integration.submit?.(FORM_CONTRACT_FIXTURES[1].validPayload, {
          ...context,
          ...change,
        }),
      ).resolves.toMatchObject({ kind: 'blocked' });
      expect(transitionDraft).not.toHaveBeenCalled();
      expect(putDraft).not.toHaveBeenCalled();
      expect(putQueueItem).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['ait-vehicle', FORM_CONTRACT_FIXTURES[1].validPayload],
    ['ait-driver', FORM_CONTRACT_FIXTURES[2].validPayload],
    ['ait-frame', FORM_CONTRACT_FIXTURES[3].validPayload],
    ['ait-frame-detail', {}],
    ['ait-location', FORM_CONTRACT_FIXTURES[4].validPayload],
    ['ait-notes', {}],
    ['ait-validations', {}],
    ['ait-evidence', FORM_CONTRACT_FIXTURES[5].validPayload],
    ['ait-measures', {}],
    ['ait-signature', FORM_CONTRACT_FIXTURES[6].validPayload],
  ])(
    'keeps %s out of the pending sync queue before aggregate finalization',
    async (screenId, payload) => {
      const pinned = {
        ...draft,
        localRevision: 1,
        reservedNumber: 101,
        reservationId: authority.reservationId,
        payload: { reserved_number: '101' },
      };
      const putDraft = vi.fn();
      const putQueueItem = vi.fn();
      const transitionDraft = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: LocalActStore,
            useValue: {
              draft: vi.fn(async () => pinned),
              putDraft,
              putQueueItem,
              transitionDraft,
            },
          },
        ],
      });
      const integration = TestBed.inject(MobilePageRuntime).load({
        screenId,
        sourceSheet: `IU-TEAT-${screenId}.md`,
      });
      await integration.submit?.(payload, context);
      expect(putQueueItem).not.toHaveBeenCalled();
    },
  );
});

describe('WF-TEAT-002 — authoritative bootstrap installs the local reservation without resetting a cursor', () => {
  const snapshot = {
    protocolVersion: 'teat-mobile-bootstrap.v1',
    requestedProtocolVersion: 'teat-mobile-bootstrap.v1',
    snapshot: {
      capturedAt: now,
      validUntil: null,
      maxAgeSeconds: null,
      authority: 'server-snapshot',
    },
    context: {
      tenantId: scope.tenantId,
      trafficAgencyId: 'agency-001',
      agent: {
        id: scope.agentId,
        operationalUnitId: 'unit-001',
        status: 'active',
      },
      device: {
        id: scope.deviceId,
        status: 'authorized',
        homologated: true,
        tamperDetected: false,
        appVersion: '1.0.0',
      },
      activeShift: { id: scope.shiftId, status: 'open' },
      session: { id: scope.shiftId, startedAt: now, exclusive: true },
    },
    catalog: {
      operationalUnits: [],
      teams: [],
      patrolVehicles: [],
      operations: [],
      measurementInstruments: [],
    },
    normativePackage: {
      id: 'pkg-001',
      catalogId: 'catalog-001',
      version: '2026.09',
      manifestHash: 'sha256:manifest',
      status: 'published',
      publishedAt: now,
      validUntil: '2999-01-01T00:00:00.000Z',
    },
    numberingReservations: [
      {
        id: authority.reservationId,
        rangeId: authority.rangeId,
        shiftId: scope.shiftId,
        series: authority.series,
        startNumber: authority.startNumber,
        endNumber: authority.endNumber,
        validUntil: authority.validUntil,
        status: 'reserved',
      },
    ],
    readiness: {
      preShiftReady: true,
      offlineReady: true,
      blockers: [],
      warnings: [],
    },
    capabilities: {
      canOpenShift: true,
      canOperateOffline: true,
      canReserveNumbering: true,
    },
  };
  const provisioning = {
    device_id: scope.deviceId,
    ready: true,
    remaining_acts: 1,
    remaining_numbering_count: 2,
    blockers: [],
    evaluated_at: now,
  };
  const query = { device_id: scope.deviceId, app_version: '1.0.0' };
  const mobileSession = {
    ...scope,
    orgUnitId: 'unit-001',
    appVersion: '1.0.0',
    roles: ['field-agent'],
  };

  function harness(
    bootstrap: unknown = snapshot,
    session: unknown = mobileSession,
  ) {
    const encrypted = new EncryptedStoreFixture();
    const local = new LocalActStore(encrypted);
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalActStore, useValue: local },
        {
          provide: MobileBootstrapClient,
          useValue: { getBootstrap: vi.fn(async () => bootstrap) },
        },
        {
          provide: ProvisioningClient,
          useValue: { readiness: vi.fn(async () => provisioning) },
        },
      ],
    });
    const store = TestBed.inject(BootstrapStore);
    const refresh = () =>
      (store.refresh as (...args: unknown[]) => Promise<unknown>)(
        query,
        session,
      );
    return { encrypted, store, refresh };
  }

  it('rejects a one-argument refresh without authenticated mobile session before ready or local writes', async () => {
    const { encrypted, store } = harness();
    await expect(
      (store.refresh as (...args: unknown[]) => Promise<unknown>)(query),
    ).rejects.toThrow();
    expect(await encrypted.list('reservation')).toEqual([]);
    expect(store.state().status).not.toBe('ready');
  });

  it('does not publish ready bootstrap when atomic multi-reservation installation fails', async () => {
    const install = vi.fn(async () => {
      throw new DOMException('quota-exceeded', 'QuotaExceededError');
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalActStore,
          useValue: { installAitReservationAuthorities: install },
        },
        {
          provide: MobileBootstrapClient,
          useValue: { getBootstrap: vi.fn(async () => snapshot) },
        },
        {
          provide: ProvisioningClient,
          useValue: { readiness: vi.fn(async () => provisioning) },
        },
      ],
    });
    const store = TestBed.inject(BootstrapStore);
    await expect(
      (store.refresh as (...args: unknown[]) => Promise<unknown>)(
        query,
        mobileSession,
      ),
    ).rejects.toThrow();
    expect(install).toHaveBeenCalledTimes(1);
    expect(store.state().status).toBe('blocked');
    expect(store.snapshot()).toBeUndefined();
  });

  it('installs trusted series, range, scope and nextNumber=startNumber after refresh', async () => {
    const { encrypted, refresh } = harness();
    await refresh();
    expect(
      await encrypted.get('reservation', authority.reservationId),
    ).toMatchObject({
      reservationId: authority.reservationId,
      rangeId: authority.rangeId,
      entityType: 'ait',
      series: 'F',
      startNumber: 101,
      endNumber: 102,
      nextNumber: 101,
      status: 'reserved',
      ...scope,
    });
  });

  it.each([
    ['tenant', { tenantId: 'foreign-tenant' }],
    ['agent', { agentId: 'foreign-agent' }],
    ['device', { deviceId: 'foreign-device' }],
  ])(
    'rejects %s mismatch against the authenticated mobile session before any local seed',
    async (_label, change) => {
      const { encrypted, store, refresh } = harness(snapshot, {
        ...mobileSession,
        ...change,
      });
      await expect(refresh()).rejects.toThrow();
      expect(await encrypted.list('reservation')).toEqual([]);
      expect(store.state().status).toBe('blocked');
    },
  );

  it('preserves an advanced local cursor on repeated bootstrap refresh', async () => {
    const { encrypted, refresh } = harness();
    await refresh();
    const installed = await encrypted.get<Record<string, unknown>>(
      'reservation',
      authority.reservationId,
    );
    expect(installed).toBeDefined();
    await encrypted.put('reservation', authority.reservationId, {
      ...installed,
      nextNumber: 102,
    });
    const marker = {
      localId: draft.localId,
      reservationId: authority.reservationId,
      ...scope,
    };
    await encrypted.put(
      'ait-open-draft',
      `${scope.agentId}:${scope.deviceId}`,
      marker,
    );
    await refresh();
    expect(
      await encrypted.get('reservation', authority.reservationId),
    ).toMatchObject({ nextNumber: 102 });
    expect(
      await encrypted.get(
        'ait-open-draft',
        `${scope.agentId}:${scope.deviceId}`,
      ),
    ).toEqual(marker);
  });

  it('preserves an exhausted local cursor and open-draft marker on refresh', async () => {
    const { encrypted, refresh } = harness();
    await refresh();
    const installed = await encrypted.get<Record<string, unknown>>(
      'reservation',
      authority.reservationId,
    );
    expect(installed).toBeDefined();
    await encrypted.put('reservation', authority.reservationId, {
      ...installed,
      nextNumber: 103,
      status: 'consumed',
    });
    const marker = {
      localId: draft.localId,
      reservationId: authority.reservationId,
      ...scope,
    };
    await encrypted.put(
      'ait-open-draft',
      `${scope.agentId}:${scope.deviceId}`,
      marker,
    );
    await refresh();
    expect(
      await encrypted.get('reservation', authority.reservationId),
    ).toMatchObject({ nextNumber: 103, status: 'consumed' });
    expect(
      await encrypted.get(
        'ait-open-draft',
        `${scope.agentId}:${scope.deviceId}`,
      ),
    ).toEqual(marker);
  });

  it('defers local reservation seeding before an open shift exists', async () => {
    const preShift = {
      ...snapshot,
      context: { ...snapshot.context, activeShift: null, session: null },
      numberingReservations: [],
    };
    const { encrypted, refresh } = harness(preShift);
    await refresh();
    expect(await encrypted.list('reservation')).toEqual([]);
  });

  it('does not infer shift authority when a pre-shift snapshot unexpectedly includes a reservation', async () => {
    const preShift = {
      ...snapshot,
      context: { ...snapshot.context, activeShift: null, session: null },
    };
    const { encrypted, store, refresh } = harness(preShift);
    await expect(refresh()).rejects.toThrow();
    expect(await encrypted.list('reservation')).toEqual([]);
    expect(store.state().status).toBe('blocked');
  });

  it.each([
    ['series', { series: 'G' }],
    ['range', { rangeId: 'foreign-range' }],
    ['scope', { deviceId: 'foreign-device' }],
    ['cursor outside authority', { nextNumber: 104 }],
  ])(
    'rejects a conflicting installed %s without resetting cursor or open-draft marker',
    async (_label, change) => {
      const { encrypted, store, refresh } = harness();
      const conflicting = { ...authority, ...change };
      const marker = {
        localId: draft.localId,
        reservationId: authority.reservationId,
        ...scope,
      };
      await encrypted.put('reservation', authority.reservationId, conflicting);
      await encrypted.put(
        'ait-open-draft',
        `${scope.agentId}:${scope.deviceId}`,
        marker,
      );
      await expect(refresh()).rejects.toThrow();
      expect(
        await encrypted.get('reservation', authority.reservationId),
      ).toEqual(conflicting);
      expect(
        await encrypted.get(
          'ait-open-draft',
          `${scope.agentId}:${scope.deviceId}`,
        ),
      ).toEqual(marker);
      expect(store.state().status).toBe('blocked');
    },
  );

  it('installs two authoritative same-shift ranges and preserves each cursor independently', async () => {
    // The second series is supplied by a distinct authoritative backend range row.
    const second = {
      ...snapshot.numberingReservations[0],
      id: 'reservation-002',
      rangeId: 'range-002',
      series: 'G',
      startNumber: 201,
      endNumber: 202,
    };
    const { encrypted, refresh } = harness({
      ...snapshot,
      numberingReservations: [snapshot.numberingReservations[0], second],
    });
    await refresh();
    expect(
      await encrypted.get('reservation', authority.reservationId),
    ).toMatchObject({
      series: 'F',
      rangeId: authority.rangeId,
      nextNumber: 101,
    });
    expect(await encrypted.get('reservation', second.id)).toMatchObject({
      series: 'G',
      rangeId: second.rangeId,
      nextNumber: 201,
      shiftId: scope.shiftId,
    });
    const firstInstalled = await encrypted.get<Record<string, unknown>>(
      'reservation',
      authority.reservationId,
    );
    const secondInstalled = await encrypted.get<Record<string, unknown>>(
      'reservation',
      second.id,
    );
    await encrypted.put('reservation', authority.reservationId, {
      ...firstInstalled,
      nextNumber: 102,
    });
    await encrypted.put('reservation', second.id, {
      ...secondInstalled,
      nextNumber: 202,
    });
    await refresh();
    expect(
      await encrypted.get('reservation', authority.reservationId),
    ).toMatchObject({ nextNumber: 102 });
    expect(await encrypted.get('reservation', second.id)).toMatchObject({
      nextNumber: 202,
    });
  });

  it.each([
    [
      'missing active-shift reservation',
      { ...snapshot, numberingReservations: [] },
    ],
    [
      'missing authoritative series',
      {
        ...snapshot,
        numberingReservations: [
          { ...snapshot.numberingReservations[0], series: '' },
        ],
      },
    ],
    [
      'missing range',
      {
        ...snapshot,
        numberingReservations: [
          { ...snapshot.numberingReservations[0], rangeId: '' },
        ],
      },
    ],
    [
      'malformed validUntil',
      {
        ...snapshot,
        numberingReservations: [
          { ...snapshot.numberingReservations[0], validUntil: 'not-a-date' },
        ],
      },
    ],
    [
      'missing reservation shift',
      {
        ...snapshot,
        numberingReservations: [
          { ...snapshot.numberingReservations[0], shiftId: '' },
        ],
      },
    ],
    [
      'prior-shift reservation',
      {
        ...snapshot,
        numberingReservations: [
          { ...snapshot.numberingReservations[0], shiftId: 'prior-shift' },
        ],
      },
    ],
    [
      'foreign device context',
      {
        ...snapshot,
        context: {
          ...snapshot.context,
          device: { ...snapshot.context.device, id: 'foreign-device' },
        },
      },
    ],
  ])(
    'fails closed on %s rather than installing a usable local reservation',
    async (_label, invalid) => {
      const { encrypted, store, refresh } = harness(invalid);
      await expect(refresh()).rejects.toThrow();
      expect(
        await encrypted.get('reservation', authority.reservationId),
      ).toBeUndefined();
      expect(store.state().status).toBe('blocked');
    },
  );
});
